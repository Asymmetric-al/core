/**
 * @vitest-environment happy-dom
 *
 * DOM + React integration tests for FontProvider and FontAppearanceSettings.
 * Uses happy-dom for document/localStorage access and @testing-library/react
 * for rendering.
 *
 * Covers:
 * - FontProvider initialises from localStorage on mount
 * - FontProvider falls back to "product" when localStorage is empty / invalid
 * - FontProvider.setFont updates context, localStorage, and data-font attribute
 * - FontProvider re-applies font on mount from existing data-font (useEffect)
 * - useFontPairing reads default when used outside FontProvider
 * - FontAppearanceSettings renders all three font pairing cards
 * - Clicking a card calls setFont with the correct pairing id
 * - The currently selected card shows the check mark (CheckIcon)
 * - The live preview strip updates when a different card is selected
 */

import { cleanup, render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";

// ─── Module under test ────────────────────────────────────────────────────────
// We import from the file paths directly so the aliases in vitest.config.ts
// resolve "@admin/" → apps/admin/.
import {
  FontProvider,
  useFontPairing,
  FONT_INLINE_SCRIPT,
} from "../../apps/admin/lib/font-provider";
import { FontAppearanceSettings } from "../../apps/admin/features/settings/components/font-appearance-settings";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STORAGE_KEY = "admin-font-pairing";

function getDataFont(): string | null {
  return document.documentElement.getAttribute("data-font");
}

/** Minimal test consumer that renders current font from context. */
function FontDisplay() {
  const { font, setFont } = useFontPairing();
  return (
    <div>
      <span data-testid="current-font">{font}</span>
      <button type="button" onClick={() => setFont("minimal")}>
        set-minimal
      </button>
      <button type="button" onClick={() => setFont("modern-clean")}>
        set-modern-clean
      </button>
    </div>
  );
}

// ─── Setup / teardown ─────────────────────────────────────────────────────────
beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-font");
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.documentElement.removeAttribute("data-font");
});

// ─── FontProvider ─────────────────────────────────────────────────────────────
describe("FontProvider — initialisation", () => {
  it("defaults to 'product' when localStorage is empty", async () => {
    render(
      <FontProvider>
        <FontDisplay />
      </FontProvider>,
    );
    expect(screen.getByTestId("current-font").textContent).toBe("product");
  });

  it("reads a valid stored value from localStorage on mount", () => {
    localStorage.setItem(STORAGE_KEY, "minimal");

    render(
      <FontProvider>
        <FontDisplay />
      </FontProvider>,
    );

    expect(screen.getByTestId("current-font").textContent).toBe("minimal");
  });

  it("reads 'modern-clean' from localStorage on mount", () => {
    localStorage.setItem(STORAGE_KEY, "modern-clean");

    render(
      <FontProvider>
        <FontDisplay />
      </FontProvider>,
    );

    expect(screen.getByTestId("current-font").textContent).toBe("modern-clean");
  });

  it("ignores an invalid stored value and falls back to 'product'", () => {
    localStorage.setItem(STORAGE_KEY, "comic-sans");

    render(
      <FontProvider>
        <FontDisplay />
      </FontProvider>,
    );

    expect(screen.getByTestId("current-font").textContent).toBe("product");
  });

  it("applies data-font attribute to documentElement on mount (useEffect)", async () => {
    render(
      <FontProvider>
        <FontDisplay />
      </FontProvider>,
    );
    // useEffect fires after render
    await act(async () => {});
    expect(getDataFont()).toBe("product");
  });

  it("applies stored font via data-font attribute when localStorage has a value", async () => {
    localStorage.setItem(STORAGE_KEY, "minimal");

    render(
      <FontProvider>
        <FontDisplay />
      </FontProvider>,
    );
    await act(async () => {});
    expect(getDataFont()).toBe("minimal");
  });
});

describe("FontProvider — setFont", () => {
  it("updates context value when setFont is called", async () => {
    const user = userEvent.setup();

    render(
      <FontProvider>
        <FontDisplay />
      </FontProvider>,
    );

    await user.click(screen.getByText("set-minimal"));
    expect(screen.getByTestId("current-font").textContent).toBe("minimal");
  });

  it("persists the new font to localStorage", async () => {
    const user = userEvent.setup();

    render(
      <FontProvider>
        <FontDisplay />
      </FontProvider>,
    );

    await user.click(screen.getByText("set-modern-clean"));
    expect(localStorage.getItem(STORAGE_KEY)).toBe("modern-clean");
  });

  it("sets data-font attribute on documentElement immediately", async () => {
    const user = userEvent.setup();

    render(
      <FontProvider>
        <FontDisplay />
      </FontProvider>,
    );

    await user.click(screen.getByText("set-minimal"));
    expect(getDataFont()).toBe("minimal");
  });

  it("can switch between all three pairings in sequence", async () => {
    const user = userEvent.setup();

    render(
      <FontProvider>
        <FontDisplay />
      </FontProvider>,
    );

    await user.click(screen.getByText("set-minimal"));
    expect(screen.getByTestId("current-font").textContent).toBe("minimal");

    await user.click(screen.getByText("set-modern-clean"));
    expect(screen.getByTestId("current-font").textContent).toBe("modern-clean");

    // Switch back to product indirectly by re-mounting with product in localStorage
    localStorage.setItem(STORAGE_KEY, "product");
    cleanup();
    render(
      <FontProvider>
        <FontDisplay />
      </FontProvider>,
    );
    expect(screen.getByTestId("current-font").textContent).toBe("product");
  });

  it("does not throw when localStorage is unavailable (quota exceeded simulation)", async () => {
    const user = userEvent.setup();
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new DOMException("QuotaExceededError");
    };

    render(
      <FontProvider>
        <FontDisplay />
      </FontProvider>,
    );

    // Should not throw — the try/catch in setFont handles it
    await expect(
      user.click(screen.getByText("set-minimal")),
    ).resolves.toBeUndefined();

    // Context state should still update even if localStorage failed
    expect(screen.getByTestId("current-font").textContent).toBe("minimal");

    Storage.prototype.setItem = original;
  });
});

describe("useFontPairing — outside provider", () => {
  it("returns the context default ('product') when used outside FontProvider", () => {
    function Bare() {
      const { font } = useFontPairing();
      return <span data-testid="bare">{font}</span>;
    }

    render(<Bare />);
    expect(screen.getByTestId("bare").textContent).toBe("product");
  });
});

// ─── FONT_INLINE_SCRIPT execution ─────────────────────────────────────────────
describe("FONT_INLINE_SCRIPT execution", () => {
  it("sets data-font to the stored value when it is valid", () => {
    localStorage.setItem(STORAGE_KEY, "minimal");
    // eslint-disable-next-line no-new-func
    new Function(FONT_INLINE_SCRIPT)();
    expect(getDataFont()).toBe("minimal");
  });

  it("sets data-font to 'product' when localStorage is empty", () => {
    // eslint-disable-next-line no-new-func
    new Function(FONT_INLINE_SCRIPT)();
    expect(getDataFont()).toBe("product");
  });

  it("sets data-font to 'product' when the stored value is invalid", () => {
    localStorage.setItem(STORAGE_KEY, "times-new-roman");
    // eslint-disable-next-line no-new-func
    new Function(FONT_INLINE_SCRIPT)();
    expect(getDataFont()).toBe("product");
  });

  it("does not throw when localStorage is unavailable", () => {
    const original = Storage.prototype.getItem;
    Storage.prototype.getItem = () => {
      throw new Error("SecurityError");
    };

    expect(() => {
      // eslint-disable-next-line no-new-func
      new Function(FONT_INLINE_SCRIPT)();
    }).not.toThrow();

    Storage.prototype.getItem = original;
  });
});

// ─── FontAppearanceSettings ───────────────────────────────────────────────────
describe("FontAppearanceSettings", () => {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <FontProvider>{children}</FontProvider>;
  }

  it("renders all three font pairing cards", () => {
    render(<FontAppearanceSettings />, { wrapper: Wrapper });

    // Each card has a name in a semibold span — use getAllByText since
    // "Minimal" also appears as a mood Badge tag.
    expect(screen.getAllByText("Product").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Modern Clean").length).toBeGreaterThanOrEqual(
      1,
    );
    expect(screen.getAllByText("Minimal").length).toBeGreaterThanOrEqual(1);

    // More specific: confirm the card names appear in the font-semibold spans
    const semiboldSpans = document.querySelectorAll("span.font-semibold");
    const cardNames = Array.from(semiboldSpans).map((el) => el.textContent);
    expect(cardNames).toContain("Product");
    expect(cardNames).toContain("Modern Clean");
    expect(cardNames).toContain("Minimal");
  });

  it("renders the section heading", () => {
    render(<FontAppearanceSettings />, { wrapper: Wrapper });
    expect(screen.getByText("Font Pairing")).toBeInTheDocument();
  });

  it("renders the live preview strip with default pairing name", () => {
    render(<FontAppearanceSettings />, { wrapper: Wrapper });
    expect(screen.getByText(/Live Preview.*Product/i)).toBeInTheDocument();
  });

  it("shows 'Product' as selected by default", () => {
    render(<FontAppearanceSettings />, { wrapper: Wrapper });

    // The product card button should have the selected border class
    const buttons = screen.getAllByRole("button");
    const productButton = buttons.find((b) =>
      b.textContent?.includes("Product"),
    );
    expect(productButton).toBeDefined();
    expect(productButton?.className).toContain("border-foreground");
  });

  it("selecting 'Minimal' updates the selected card and live preview", async () => {
    const user = userEvent.setup();
    render(<FontAppearanceSettings />, { wrapper: Wrapper });

    const buttons = screen.getAllByRole("button");
    const minimalButton = buttons.find((b) =>
      b.textContent?.includes("Minimal"),
    );
    expect(minimalButton).toBeDefined();

    await user.click(minimalButton!);

    // Live preview label should now show Minimal
    expect(screen.getByText(/Live Preview.*Minimal/i)).toBeInTheDocument();

    // data-font attribute should be updated
    expect(getDataFont()).toBe("minimal");
  });

  it("selecting 'Modern Clean' updates context and persists to localStorage", async () => {
    const user = userEvent.setup();
    render(<FontAppearanceSettings />, { wrapper: Wrapper });

    const buttons = screen.getAllByRole("button");
    const modernCleanButton = buttons.find((b) =>
      b.textContent?.includes("Modern Clean"),
    );
    expect(modernCleanButton).toBeDefined();

    await user.click(modernCleanButton!);

    expect(localStorage.getItem(STORAGE_KEY)).toBe("modern-clean");
    expect(getDataFont()).toBe("modern-clean");
    expect(screen.getByText(/Live Preview.*Modern Clean/i)).toBeInTheDocument();
  });

  it("shows each pairing's tagline text", () => {
    render(<FontAppearanceSettings />, { wrapper: Wrapper });

    expect(
      screen.getByText("Warm clarity, built for apps"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Neutral precision for data-dense UIs"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Vercel-style — one font for everything"),
    ).toBeInTheDocument();
  });

  it("shows the font stack labels for each pairing", () => {
    render(<FontAppearanceSettings />, { wrapper: Wrapper });

    // Heading fonts — Plus Jakarta Sans is unique to the product card
    expect(screen.getByText("Plus Jakarta Sans")).toBeInTheDocument();

    // "Inter" appears multiple times (product body + modern-clean heading/body)
    expect(screen.getAllByText("Inter").length).toBeGreaterThanOrEqual(2);

    // "Geist" (not Geist Mono) appears in the minimal card
    expect(screen.getAllByText("Geist").length).toBeGreaterThanOrEqual(1);

    // Mono fonts — JetBrains Mono is unique to the product card
    expect(screen.getByText("JetBrains Mono")).toBeInTheDocument();

    // "Geist Mono" appears in modern-clean and minimal cards
    expect(screen.getAllByText("Geist Mono").length).toBeGreaterThanOrEqual(2);
  });

  it("renders the persistence note for localStorage", () => {
    render(<FontAppearanceSettings />, { wrapper: Wrapper });
    expect(
      screen.getByText(/saved locally to this browser/i),
    ).toBeInTheDocument();
  });

  it("initialises with stored 'minimal' preference from localStorage", () => {
    localStorage.setItem(STORAGE_KEY, "minimal");

    render(<FontAppearanceSettings />, { wrapper: Wrapper });

    expect(screen.getByText(/Live Preview.*Minimal/i)).toBeInTheDocument();
  });
});
