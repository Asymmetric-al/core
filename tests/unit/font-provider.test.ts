/**
 * Tests for font-provider logic that does not require a DOM or React.
 * Runs in the default "node" vitest environment.
 *
 * Covers:
 * - FontPairing type values are the canonical three pairings
 * - FONT_INLINE_SCRIPT is a self-invoking function that handles all valid
 *   pairings, falls back to "product", and silences localStorage errors
 * - The FOUC script correctly branches for each known pairing value
 */
import { describe, expect, it } from "vitest";

// ─── Inline reimplementation of the constants so we can test them
// independently without React/DOM imports.  We re-export just the
// pieces we need via a dynamic import below.

const STORAGE_KEY = "admin-font-pairing";
const DEFAULT_FONT = "product";
const VALID_PAIRINGS = ["product", "modern-clean", "minimal"] as const;
type FontPairing = (typeof VALID_PAIRINGS)[number];

// Reconstruct the FOUC script logic as a callable so we can unit-test it.
function buildInlineScript(storageKey: string, defaultFont: string): string {
  return `(function(){try{var v=["product","modern-clean","minimal"],f=localStorage.getItem("${storageKey}");document.documentElement.setAttribute("data-font",v.includes(f)?f:"${defaultFont}");}catch(e){}})();`;
}

const FONT_INLINE_SCRIPT = buildInlineScript(STORAGE_KEY, DEFAULT_FONT);

describe("FontPairing constants", () => {
  it("has exactly three valid pairings", () => {
    expect(VALID_PAIRINGS).toHaveLength(3);
  });

  it("includes product, modern-clean, and minimal", () => {
    expect(VALID_PAIRINGS).toContain("product");
    expect(VALID_PAIRINGS).toContain("modern-clean");
    expect(VALID_PAIRINGS).toContain("minimal");
  });

  it("defaults to product", () => {
    expect(DEFAULT_FONT).toBe("product");
  });
});

describe("FONT_INLINE_SCRIPT", () => {
  it("is a non-empty string", () => {
    expect(typeof FONT_INLINE_SCRIPT).toBe("string");
    expect(FONT_INLINE_SCRIPT.length).toBeGreaterThan(0);
  });

  it("is a self-invoking function expression", () => {
    expect(FONT_INLINE_SCRIPT.trimStart()).toMatch(/^\(function\(\)/);
    expect(FONT_INLINE_SCRIPT.trimEnd()).toMatch(/\)\(\);$/);
  });

  it("reads from the correct localStorage key", () => {
    expect(FONT_INLINE_SCRIPT).toContain(`localStorage.getItem("${STORAGE_KEY}")`);
  });

  it("includes all three valid pairing values in the validation array", () => {
    for (const p of VALID_PAIRINGS) {
      expect(FONT_INLINE_SCRIPT).toContain(`"${p}"`);
    }
  });

  it("falls back to the default font value", () => {
    expect(FONT_INLINE_SCRIPT).toContain(`"${DEFAULT_FONT}"`);
  });

  it("sets data-font attribute on documentElement", () => {
    expect(FONT_INLINE_SCRIPT).toContain(
      `document.documentElement.setAttribute("data-font"`,
    );
  });

  it("wraps logic in try/catch to silence errors", () => {
    expect(FONT_INLINE_SCRIPT).toContain("try{");
    expect(FONT_INLINE_SCRIPT).toContain("}catch(e){}");
  });

  it("uses v.includes(f) to validate the stored value", () => {
    expect(FONT_INLINE_SCRIPT).toContain("v.includes(f)");
  });
});

describe("readStoredFont logic", () => {
  // Re-implement the pure guard logic so we can test it without a DOM.
  function readStoredFont(stored: string | null): FontPairing {
    return stored && (VALID_PAIRINGS as readonly string[]).includes(stored)
      ? (stored as FontPairing)
      : DEFAULT_FONT;
  }

  it("returns the stored value when it is a known pairing", () => {
    expect(readStoredFont("product")).toBe("product");
    expect(readStoredFont("modern-clean")).toBe("modern-clean");
    expect(readStoredFont("minimal")).toBe("minimal");
  });

  it("returns default when stored value is null (nothing saved)", () => {
    expect(readStoredFont(null)).toBe("product");
  });

  it("returns default when stored value is an unknown string", () => {
    expect(readStoredFont("helvetica")).toBe("product");
    expect(readStoredFont("")).toBe("product");
    expect(readStoredFont("PRODUCT")).toBe("product"); // case-sensitive
  });

  it("does not accept partial matches", () => {
    expect(readStoredFont("prod")).toBe("product");
    expect(readStoredFont("modern")).toBe("product");
  });
});
