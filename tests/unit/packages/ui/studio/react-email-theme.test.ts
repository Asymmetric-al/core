import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const globals = readFileSync(
  path.join(root, "packages/ui/styles/globals.css"),
  "utf8",
);
const requireFromUi = createRequire(
  path.join(root, "packages/ui/package.json"),
);
const upstreamTheme = readFileSync(
  requireFromUi.resolve("@react-email/editor/themes/default.css"),
  "utf8",
);

function declaredVariables(css: string) {
  return new Set(css.match(/--re-[a-z-]+(?=\s*:)/g) ?? []);
}

describe("React Email editor menus in the Maia theme", () => {
  const mapping = globals.slice(globals.indexOf("/* React Email editor menus"));
  const block = mapping.slice(0, mapping.indexOf("}"));

  it("maps every colour, radius and danger variable onto a shared token", () => {
    const upstream = [...declaredVariables(upstreamTheme)].filter(
      (name) => name !== "--re-shadow",
    );
    expect(upstream.length).toBeGreaterThan(0);
    for (const name of upstream) {
      const value = block.match(new RegExp(`${name}:([^;]+);`))?.[1] ?? "";
      expect(value, name).toContain("var(--");
      expect(value, name).not.toMatch(/#|rgba?\(/);
    }
  });

  it("uses the app font and a token focus ring in the menus", () => {
    expect(mapping).toMatch(
      /\[data-re-slash-command\]\s*\{\s*font-family: inherit;/,
    );
    expect(mapping).toMatch(/\):focus-visible\s*\{[^}]*var\(--ring\)/);
  });
});

describe("React Email editor canvas", () => {
  const start = globals.indexOf("/* React Email Editor - full-height");
  const section = globals.slice(
    start,
    globals.indexOf("/* React Email editor menus"),
  );
  // Flat rules only: this section has no nested blocks or at-rules.
  const rules = [
    ...section
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .matchAll(/([^{}]+)\{([^}]*)\}/g),
  ].map(([, selector, body]) => ({
    selector: selector!.trim().replace(/\s+/g, " "),
    body: body!,
  }));
  const rule = (selector: string) =>
    rules.find((entry) => entry.selector === selector)?.body ?? "";

  it("sets the email on a muted desk", () => {
    expect(start).toBeGreaterThanOrEqual(0);
    expect(rule(".react-email-builder-wrapper")).toMatch(
      /background: var\(--muted\);/,
    );
  });

  it("frames the page as a bordered card with a token focus ring", () => {
    const page = rule(".react-email-builder-wrapper .tiptap");
    expect(page).toMatch(/border: 1px solid var\(--border\);/);
    expect(page).toMatch(/border-radius: var\(--radius-[a-z0-9]+\);/);
    expect(rule(".react-email-builder-wrapper .tiptap:focus-visible")).toMatch(
      /border-color: var\(--ring\);/,
    );
  });

  it("centres the page over the editor theme's injected margin", () => {
    // The theme's rule is `.tiptap.ProseMirror[data-editor-theme-scope="…"]`
    // (0,3,0), unlayered and injected later; only higher specificity wins.
    expect(
      rule(
        ".react-email-builder-wrapper .tiptap.ProseMirror[data-editor-theme-scope]",
      ),
    ).toMatch(/margin-inline: auto;/);
  });

  it("leaves the email body's own background, colour and padding to the email theme", () => {
    // React Email paints the theme's body styles on the scoped .tiptap
    // element, and the sent email's <Body> uses the same styles. A canvas
    // rule that beat them would show an email that is not the one sent.
    for (const { selector, body } of rules) {
      if (!selector.includes(".tiptap")) continue;
      expect(body, selector).not.toMatch(
        /(^|[\s;])(background|color|padding)[a-z-]*:/,
      );
    }
  });
});
