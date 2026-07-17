import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Motion-contract guardrails (docs/ai/skills/anim/SKILL.md, docs/ai/rules/frontend.md):
 * - `transition-all` is banned; use property-scoped transitions or the shared
 *   motion utilities in packages/ui/styles/globals.css.
 * - Inline `active:scale-*` is banned; press feedback comes from the shared
 *   `.press-feedback` utility (built into the shadcn Button base).
 *
 * The motion/react import restriction is enforced separately by ESLint
 * (tooling/eslint-config/restricted-imports.mjs, composed into
 * no-restricted-imports by base.mjs and the root config).
 */

const REPO_ROOT = join(__dirname, "..", "..");
const SCAN_ROOTS = ["apps", "packages"] as const;
const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".turbo",
  "dist",
  "build",
  "coverage",
]);

const BANNED_PATTERNS: Array<{ name: string; regex: RegExp; hint: string }> = [
  {
    name: "transition-all",
    regex: /transition-all(?![a-zA-Z-])/,
    hint: "Use property-scoped transitions (e.g. transition-colors, transition-[transform,box-shadow]).",
  },
  {
    name: "inline active:scale-",
    regex: /(?<![\w-])active:scale-/,
    hint: "Use the shared .press-feedback utility instead of inline active:scale-*.",
  },
];

function collectTsxFiles(dir: string, out: string[]): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) {
        collectTsxFiles(join(dir, entry.name), out);
      }
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".tsx")) {
      out.push(join(dir, entry.name));
    }
  }
}

function isCommentLine(line: string): boolean {
  const trimmed = line.trimStart();
  return (
    trimmed.startsWith("//") ||
    trimmed.startsWith("*") ||
    trimmed.startsWith("/*") ||
    trimmed.startsWith("{/*")
  );
}

describe("motion contract", () => {
  const files: string[] = [];
  for (const root of SCAN_ROOTS) {
    collectTsxFiles(join(REPO_ROOT, root), files);
  }

  it("scans a non-trivial number of component files", () => {
    expect(files.length).toBeGreaterThan(100);
  });

  for (const { name, regex, hint } of BANNED_PATTERNS) {
    it(`has no ${name} in component class strings`, () => {
      const offenders: string[] = [];

      for (const file of files) {
        const lines = readFileSync(file, "utf8").split("\n");
        lines.forEach((line, index) => {
          if (isCommentLine(line)) return;
          if (regex.test(line)) {
            offenders.push(
              `${relative(REPO_ROOT, file)}:${index + 1}  ${line.trim().slice(0, 120)}`,
            );
          }
        });
      }

      expect(
        offenders,
        `Banned pattern "${name}" found. ${hint}\n${offenders.join("\n")}`,
      ).toEqual([]);
    });
  }

  it("view-transition CSS selectors target classes (leading dot), not names", () => {
    // React applies <ViewTransition enter/exit/share> prop values as the
    // view-transition-CLASS. An undotted ::view-transition-old(asym-vt-x)
    // selector targets a view-transition NAME instead, silently matches
    // nothing, and the animation degrades to the browser default.
    const css = readFileSync(
      join(REPO_ROOT, "packages", "ui", "styles", "globals.css"),
      "utf8",
    );

    const undotted = [
      ...css.matchAll(
        /::view-transition-(?:old|new|group|image-pair)\((asym-[^).]*)\)/g,
      ),
    ].map((match) => match[0]);

    expect(
      undotted,
      `asym-vt-* view-transition selectors must use the class form, e.g. ::view-transition-old(.asym-vt-route-exit)\n${undotted.join("\n")}`,
    ).toEqual([]);

    // The classes referenced by the shared VT components must have CSS rules.
    for (const cls of [
      ".asym-vt-route-enter",
      ".asym-vt-route-exit",
      ".asym-vt-share-morph",
    ]) {
      expect(css, `globals.css is missing a rule for ${cls}`).toContain(
        `(${cls})`,
      );
    }
  });
});
