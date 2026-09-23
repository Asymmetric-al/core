import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const rootRequire = createRequire(path.join(root, "package.json"));
const tailwindPostcss = rootRequire("@tailwindcss/postcss");
// PostCSS is owned by the declared Tailwind PostCSS plugin, not a new root dependency.
const postcss = createRequire(rootRequire.resolve("@tailwindcss/postcss"))(
  "postcss",
);
const toolingRequire = createRequire(
  path.join(root, "tooling/eslint-config/package.json"),
);
// Diagnostic-only use of the documented experimental API. Pin its shape to the
// vetted package; normal lint execution uses ESLint and never imports `project`.
const { project } = toolingRequire("@shadcn/lint");
const workspaces = [
  "apps/admin",
  "apps/donor",
  "apps/missionary",
  "packages/ui",
  "packages/missionary",
];

function fixturePath(workspace: string) {
  return path.join(
    root,
    workspace,
    workspace.startsWith("apps/")
      ? "app/design-system-theme-probe.tsx"
      : "components/design-system-theme-probe.tsx",
  );
}

async function compileStylesheet(
  filename: string,
  css: string,
): Promise<string> {
  const result = await postcss([
    tailwindPostcss({ base: root, optimize: false }),
  ]).process(css, { from: filename });
  return result.css;
}

describe("Core shared theme discovery", () => {
  it("pins the diagnostic API to the vetted release", () => {
    expect(toolingRequire("@shadcn/lint/package.json").version).toBe("0.2.0");
  });

  it.each(workspaces)("discovers shared semantic tokens in %s", (workspace) => {
    const filename = fixturePath(workspace);
    expect(project.themeFileFor(filename)).not.toBeNull();
    expect(project.colorTokensFor(filename)).toEqual(
      expect.objectContaining({
        has: expect.any(Function),
      }),
    );
    const tokens: Set<string> = project.colorTokensFor(filename);
    const expectedTokens = new Set<string>();
    const theme = postcss.parse(
      readFileSync(path.join(root, "packages/ui/styles/globals.css"), "utf8"),
    );
    theme.walkAtRules(
      "theme",
      (rule: {
        walkDecls: (
          visit: (declaration: { prop: string; value: string }) => void,
        ) => void;
      }) => {
        rule.walkDecls(({ prop, value }) => {
          if (
            prop.startsWith("--color-") &&
            value !== "initial" &&
            !prop.includes("*")
          )
            expectedTokens.add(prop.slice("--color-".length));
        });
      },
    );
    expect(expectedTokens.has("primary")).toBe(true);
    for (const token of expectedTokens) {
      expect(tokens.has(token), `${workspace}: missing ${token}`).toBe(true);
    }
    expect(tokens.has("zinc-500")).toBe(false);
  });

  it.each(workspaces)(
    "uses the real Tailwind theme in %s",
    async (workspace) => {
      const eslint = new ESLint({
        cwd: path.join(root, workspace),
        overrideConfig: {
          languageOptions: { parserOptions: { projectService: false } },
        },
      });
      const [valid] = await eslint.lintText(
        'export const Probe = () => <div className="bg-primary text-muted-foreground prose press-feedback animate-accordion-down data-open:flex rounded-lg font-sans" />;',
        { filePath: fixturePath(workspace) },
      );
      expect(
        valid.messages.filter((message) =>
          message.ruleId?.startsWith("shadcn/"),
        ),
      ).toEqual([]);
      const [invalid] = await eslint.lintText(
        'export const Probe = () => <div className="bg-missing-core-token hovr:flex" />;',
        { filePath: fixturePath(workspace) },
      );
      expect(
        invalid.messages
          .filter((message) => message.ruleId?.startsWith("shadcn/"))
          .map((message) => message.ruleId)
          .sort(),
      ).toEqual(["shadcn/no-raw-colors", "shadcn/no-unknown-classes"]);
    },
  );

  it("reads Core radius values instead of silently falling back to Tailwind defaults", async () => {
    const eslint = new ESLint({
      cwd: path.join(root, "apps/donor"),
      overrideConfig: {
        languageOptions: { parserOptions: { projectService: false } },
      },
    });
    const [result] = await eslint.lintText(
      'export const Probe = () => <div className="rounded-[16px] rounded-[12px] text-[14px]" />;',
      { filePath: fixturePath("apps/donor") },
    );
    const messages = result.messages
      .filter((message) => message.ruleId === "shadcn/no-arbitrary-values")
      .map((message) => message.message);
    expect(messages).toEqual([
      expect.stringContaining('Use "rounded-lg" instead (same value'),
      expect.stringContaining('Use "rounded-sm" instead (same value'),
      expect.stringContaining('Use "text-sm" instead (same value'),
    ]);
  });

  it("preserves generated CSS when moving source directives or re-exporting the shared theme", async () => {
    const sharedFile = path.join(root, "packages/ui/styles/globals.css");
    const shared = readFileSync(sharedFile, "utf8");
    const sourceLines = shared
      .split("\n")
      .filter((line) => line.startsWith("@source "));
    const beforeRelocation = shared
      .split("\n")
      .filter((line) => !line.startsWith("@source "))
      .join("\n")
      .replace(
        "@custom-variant dark",
        `${sourceLines.join("\n")}\n@custom-variant dark`,
      );
    expect(await compileStylesheet(sharedFile, shared)).toBe(
      await compileStylesheet(sharedFile, beforeRelocation),
    );

    const missionaryFile = path.join(root, "apps/missionary/app/globals.css");
    const missionary = readFileSync(missionaryFile, "utf8");
    const directImport = missionary.replace(
      "@asym/missionary/styles.css",
      "@asym/ui/styles/globals.css",
    );
    expect(await compileStylesheet(missionaryFile, missionary)).toBe(
      await compileStylesheet(missionaryFile, directImport),
    );
  }, 60_000);

  it("keeps the missionary stylesheet as a re-export of the actual shared theme", () => {
    const css = readFileSync(
      path.join(root, "packages/missionary/styles.css"),
      "utf8",
    );
    expect(css.replace(/\/\*[\s\S]*?\*\//g, "").trim()).toBe(
      '@import "@asym/ui/styles/globals.css";',
    );
    const app = readFileSync(
      path.join(root, "apps/missionary/app/globals.css"),
      "utf8",
    );
    expect(app).toContain('@import "@asym/missionary/styles.css";');
    expect(app).not.toContain('@import "@asym/ui/styles/globals.css";');
  });
});
