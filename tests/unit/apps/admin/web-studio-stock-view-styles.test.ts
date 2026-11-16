import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const SHELL = "apps/admin/src/cms-ui/web-studio/shell";
const read = (file: string) => readFileSync(path.join(root, file), "utf8");
/** CSS with each whitespace run as one space, so wrapped selectors match. */
const flat = (css: string) => css.replace(/\s+/g, " ");

/** The declarations of the first rule whose selector is exactly `selector`. */
function rule(css: string, selector: string): string {
  const at = css.indexOf(`${selector} {`);
  expect(at, `rule ${selector}`).toBeGreaterThan(-1);
  return css.slice(at, css.indexOf("}", at));
}

describe("Web Studio styles for Payload's stock views", () => {
  it("loads with the Studio chrome Payload renders on every stock view", () => {
    expect(read(`${SHELL}/studio-template-chrome.tsx`)).toContain(
      'import "./studio-stock-views.css";',
    );
  });

  it("draws the API view's line numbers in the shared muted text color", () => {
    // Payload's light code-editor theme sets Monaco's line numbers to 30%
    // black (#0000004d): about 2.1:1 on the editor, below WCAG AA (4.5:1).
    // Monaco's own rule is `.monaco-editor .margin-view-overlays
    // .line-numbers` (three classes); these carry more, so they win.
    const css = flat(read(`${SHELL}/studio-stock-views.css`));
    expect(css).not.toMatch(/!important/);
    expect(
      rule(
        css,
        ".code-editor .monaco-editor.vs .margin-view-overlays .line-numbers",
      ),
    ).toContain("color: var(--muted-foreground);");
    expect(
      rule(
        css,
        ".code-editor .monaco-editor.vs .margin-view-overlays .line-numbers.active-line-number",
      ),
    ).toContain("color: var(--foreground);");
  });

  it("scrolls the phone Versions table inside the page instead of clipping it", () => {
    // Payload widens `.versions .table` past the viewport below 768px
    // (`max-width: unset`), and the Studio shell clips it.
    const payload = flat(
      read(
        "apps/admin/node_modules/@payloadcms/ui/dist/views/Versions/index.css",
      ),
    );
    expect(payload).toMatch(/\.versions \.table \{[^}]*max-width: unset/);
    const css = flat(read(`${SHELL}/studio-stock-views.css`));
    const table = rule(css, ".versions .table");
    expect(table).toContain("max-width: 100%;");
    expect(table).toContain("overflow-x: auto;");
    // The pager wraps rather than cutting off "Per page".
    expect(rule(css, ".versions .page-controls__inner")).toContain(
      "flex-wrap: wrap;",
    );
  });

  it("targets the class names Payload's code editor and Monaco render", () => {
    const editor = read(
      "apps/admin/node_modules/@payloadcms/ui/dist/elements/CodeEditor/CodeEditor.js",
    );
    expect(editor).toContain("'editorLineNumber.foreground': '#0000004d'");
    expect(editor).toContain("base: 'vs'");
  });
});
