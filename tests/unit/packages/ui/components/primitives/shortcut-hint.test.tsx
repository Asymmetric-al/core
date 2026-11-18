// @vitest-environment jsdom

import "./ui-sdk-strict";

import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ShortcutHint,
  useShortcutHint,
} from "../../../../../../packages/ui/components/primitives/shortcut";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

// This file never calls `setPlatform`, so UI SDK detects the platform the way
// it does in a browser. The other shortcut tests pin it instead.
const plain = (text: string | null | undefined) =>
  (text ?? "").replace(/[\u2066\u2069]/g, "");

function Hint() {
  const hint = useShortcutHint("mod+k");
  return (
    <button type="button" aria-keyshortcuts={hint.ariaKeyshortcuts}>
      Search <span data-testid="text">{hint.text}</span>
      <span data-testid="platform-known">{String(hint.platformKnown)}</span>
      <ShortcutHint keys="mod+k" />
    </button>
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("useShortcutHint and ShortcutHint", () => {
  it("renders one stable hint on the server and the real platform after hydration", async () => {
    const html = renderToString(<Hint />);
    expect(html).toContain('aria-keyshortcuts="Control+K"');
    expect(plain(html)).toContain("Ctrl+K");
    expect(html).toContain(">false<");
    expect(html).not.toContain("<kbd");

    vi.stubGlobal("navigator", {
      platform: "MacIntel",
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      maxTouchPoints: 0,
    });
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.append(container);
    const errors: unknown[] = [];
    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(container, <Hint />, {
        onRecoverableError: (error) => errors.push(error),
      });
    });
    expect(errors).toEqual([]);
    const text = (testId: string) =>
      plain(container.querySelector(`[data-testid="${testId}"]`)!.textContent);
    expect(
      container.querySelector("button")!.getAttribute("aria-keyshortcuts"),
    ).toBe("Meta+K");
    expect(text("text")).toBe("⌘K");
    expect(text("platform-known")).toBe("true");
    const kbd = container.querySelector("kbd")!;
    expect(plain(kbd.textContent)).toBe("⌘K");
    expect(kbd.getAttribute("aria-hidden")).toBe("true");
    await act(async () => root?.unmount());
    container.remove();
  });

  it("shows the real platform's keys from the first render of a hint mounted after hydration", async () => {
    vi.stubGlobal("navigator", {
      platform: "MacIntel",
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      maxTouchPoints: 0,
    });
    const seen: string[] = [];
    function Probe() {
      const hint = useShortcutHint("mod+z");
      seen.push(`${plain(hint.text)} ${hint.ariaKeyshortcuts}`);
      return <span>{hint.text}</span>;
    }
    const container = document.createElement("div");
    document.body.append(container);
    const { createRoot } = await import("react-dom/client");
    const root = createRoot(container);
    // A client navigation mounts the hint after the app has hydrated.
    await act(async () => root.render(<Probe />));
    expect(seen.length).toBeGreaterThan(0);
    expect(new Set(seen)).toEqual(new Set(["⌘Z Meta+Z"]));
    await act(async () => root.unmount());
    container.remove();
  });
});
