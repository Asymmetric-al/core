import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Contract test for the shared interactive pointer rule in @asym/ui.
 * See packages/ui/README.md — "Pointer cursor for interactive controls".
 */
const globalsCssPath = fileURLToPath(
  new URL("../../../../packages/ui/styles/globals.css", import.meta.url),
);

const POINTER_RULE_SELECTORS = [
  "button:not(:disabled)",
  '[role="button"]:not([aria-disabled="true"])',
  '[role="link"]:not([aria-disabled="true"])',
  '[role="menuitem"]:not([aria-disabled="true"])',
  '[role="option"]:not([aria-disabled="true"])',
  '[role="tab"]:not([aria-disabled="true"])',
  'a[href]:not([aria-disabled="true"])',
  "summary",
  "label[for]",
  "select:not(:disabled)",
  'input[type="button"]:not(:disabled)',
  'input[type="submit"]:not(:disabled)',
  'input[type="reset"]:not(:disabled)',
  'input[type="checkbox"]:not(:disabled)',
  'input[type="radio"]:not(:disabled)',
  'input[type="file"]:not(:disabled)',
] as const;

/** Full `:where(...) { ... }` rule, with balanced `()` for selectors like `:not(:disabled)`. */
function extractPointerWhereRule(css: string): string {
  const start = css.indexOf(":where(");
  if (start === -1) {
    return "";
  }
  const open = start + ":where(".length - 1;
  let depth = 0;
  for (let p = open; p < css.length; p++) {
    if (css[p] === "(") {
      depth++;
    } else if (css[p] === ")") {
      depth--;
      if (depth === 0) {
        const endDecl = css.indexOf("}", p);
        if (endDecl === -1) {
          return "";
        }
        return css.slice(start, endDecl + 1);
      }
    }
  }
  return "";
}

describe("packages/ui interactive pointer cursor (globals.css)", () => {
  it("declares a single :where() block with cursor: pointer after @layer base opens", () => {
    const css = readFileSync(globalsCssPath, "utf8");
    expect(css).toMatch(/@layer base\s*\{/);

    const baseStart = css.indexOf("@layer base");
    const baseBlock = css.slice(baseStart);
    expect(baseBlock).toMatch(/:where\s*\(/);
    expect(baseBlock).toMatch(/cursor:\s*pointer/);
  });

  it("includes each documented selector in the :where() list", () => {
    const css = readFileSync(globalsCssPath, "utf8");
    const block = extractPointerWhereRule(css);
    expect(block.length).toBeGreaterThan(0);
    expect(block).toMatch(/cursor:\s*pointer/);

    for (const sel of POINTER_RULE_SELECTORS) {
      expect(block, `missing selector: ${sel}`).toContain(sel);
    }
  });

  it("does not use broad onclick or universal pointer on all elements for this pattern", () => {
    const css = readFileSync(globalsCssPath, "utf8");
    // Allow [onclick] in comments only — strip line comments and block comments crudely for this assertion
    const noComments = css
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/(^|\s)\/\/.*$/gm, "");
    expect(noComments).not.toMatch(/\[\s*onclick/);
    expect(noComments).not.toMatch(/\*\s*\{[^}]*cursor:\s*pointer/);
  });
});
