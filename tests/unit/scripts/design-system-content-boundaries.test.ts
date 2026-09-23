import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const requireFromRoot = createRequire(path.join(root, "package.json"));
const linters = new Map<string, ESLint>();

function contractProbe(allow: string[], source: string, fixture?: string) {
  const policyUrl = pathToFileURL(
    path.join(root, "tooling/eslint-config/design-system.mjs"),
  ).href;
  const script = `
    import { ESLint } from ${JSON.stringify(pathToFileURL(requireFromRoot.resolve("eslint")).href)};
    import parser from ${JSON.stringify(pathToFileURL(requireFromRoot.resolve("@typescript-eslint/parser")).href)};
    import { designSystemConfig } from ${JSON.stringify(policyUrl)};
    const cwd = ${JSON.stringify(fixture ?? root)};
    const eslint = new ESLint({
      cwd,
      ${fixture ? `overrideConfigFile: true,` : ""}
      overrideConfig: [
        ${fixture ? `{ files: ["**/*.tsx"], languageOptions: { parser } }, ...designSystemConfig({ rootDir: cwd }),` : ""}
        { languageOptions: { parserOptions: { projectService: false } }, rules: {
          "shadcn/no-restyle": ["error", { allow: ${JSON.stringify(allow)} }]
        } }
      ],
    });
    const [result] = await eslint.lintText(${JSON.stringify(source)}, { filePath: cwd + "/apps/donor/components/contract-probe.tsx" });
    console.log(JSON.stringify(result.messages));
  `;
  const directory = mkdtempSync(path.join(os.tmpdir(), "core-contract-probe-"));
  try {
    const scriptPath = path.join(directory, "probe.mjs");
    writeFileSync(scriptPath, script);
    const result = spawnSync(process.execPath, [scriptPath], {
      cwd: root,
      encoding: "utf8",
      timeout: 20_000,
    });
    expect(result.error).toBeUndefined();
    expect(result.status, result.stderr).toBe(0);
    return {
      stderr: result.stderr,
      messages: JSON.parse(result.stdout) as ESLint.LintResult["messages"],
    };
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

async function lint(
  source: string,
  workspace = "packages/ui",
  relativeFile = "components/content-boundary-probe.tsx",
) {
  let eslint = linters.get(workspace);
  if (!eslint) {
    eslint = new ESLint({
      cwd: path.join(root, workspace),
      overrideConfig: {
        languageOptions: { parserOptions: { projectService: false } },
      },
    });
    linters.set(workspace, eslint);
  }
  const [result] = await eslint.lintText(source, {
    filePath: path.join(root, workspace, relativeFile),
  });
  expect(result.fatalErrorCount).toBe(0);
  return result.messages.filter((message) =>
    message.ruleId?.startsWith("shadcn/"),
  );
}

describe("design-system icon and authored-content boundaries", () => {
  it("accepts only the legacy editor's required external style API", async () => {
    const messages = await lint(
      'import dynamic from "next/dynamic"; const EmailEditor = dynamic(() => import("react-email-editor"), { ssr: false }); export const Probe = ({ ready }: { ready: boolean }) => <EmailEditor style={{ width: "100%", opacity: ready ? 1 : 0, transition: "opacity 0.3s ease-in-out" }} />;',
      "packages/ui",
      "components/studio/legacy/UnlayerEmailEditor.tsx",
    );
    expect(messages).toEqual([]);
  });

  it("keeps ordinary DOM, other editor properties and sibling files outside the external editor contract", async () => {
    const source =
      'import dynamic from "next/dynamic"; const EmailEditor = dynamic(() => import("react-email-editor"), { ssr: false }); export const Probe = () => <><EmailEditor style={{ height: "100%", color: "red" }} /><div style={{ width: "100%", opacity: 0, transition: "opacity 0.3s ease-in-out" }} /></>;';
    const owner = await lint(
      source,
      "packages/ui",
      "components/studio/legacy/UnlayerEmailEditor.tsx",
    );
    expect(
      owner.filter((message) => message.ruleId === "shadcn/no-inline-styles"),
    ).toHaveLength(5);
    const sibling = await lint(
      'const EmailEditor = () => null; export const Probe = () => <EmailEditor style={{ width: "100%", opacity: 0, transition: "opacity 0.3s ease-in-out" }} />;',
      "packages/ui",
      "components/studio/legacy/unrelated-editor.tsx",
    );
    expect(
      sibling.filter((message) => message.ruleId === "shadcn/no-inline-styles"),
    ).toHaveLength(3);
  });

  it.each(["lucide-react", "@asym/ui/components/shadcn/icons"])(
    "allows an icon's existing presentation API through %s",
    async (specifier) => {
      const messages =
        await lint(`import { Search as SearchGlyph } from "${specifier}";
        export const Probe = () => <SearchGlyph className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />;`);
      expect(messages).toEqual([]);
    },
  );

  it("does not treat a renamed Button as an icon", async () => {
    const messages = await lint(
      'import { Button as Search } from "@asym/ui/components/shadcn/button"; export const Probe = () => <Search className="size-4 text-muted-foreground" />;',
    );
    expect(
      messages.filter((message) => message.ruleId === "shadcn/no-restyle"),
    ).toHaveLength(2);
  });

  it.each(["lucide-react", "@asym/ui/components/shadcn/icons"])(
    "still rejects raw colors, arbitrary geometry, inline styles and typos on %s icons",
    async (specifier) => {
      const messages = await lint(`import { Search } from "${specifier}";
        export const Probe = () => <Search className="text-red-500 size-[13px] hovr:flex" style={{ opacity: 0.5 }} />;`);
      expect(messages.map((message) => message.ruleId).sort()).toEqual(
        [
          "shadcn/no-raw-colors",
          "shadcn/no-arbitrary-values",
          "shadcn/no-inline-styles",
          "shadcn/no-unknown-classes",
        ].sort(),
      );
    },
  );

  it("allows authored-content typography through PostContent's explicit class props", async () => {
    const messages = await lint(
      'import { PostContent } from "@asym/ui/components/shadcn/rich-text-editor/post-content"; export const Probe = () => <PostContent value="A note" richTextClassName="prose prose-sm sm:prose-base max-w-none leading-relaxed dark:prose-invert" htmlClassName="prose prose-sm max-w-none leading-relaxed" />;',
      "apps/donor",
    );
    expect(messages).toEqual([]);
  });

  it("retains token, scale, class-validity and component-appearance checks on authored content", async () => {
    const messages = await lint(
      'import { PostContent } from "@asym/ui/components/shadcn/rich-text-editor/post-content"; export const Probe = () => <PostContent value="A note" htmlClassName="bg-red-500 text-[13px] hovr:prose rounded-xl shadow-lg" />;',
      "apps/donor",
    );
    expect(messages.map((message) => message.ruleId)).toEqual(
      expect.arrayContaining([
        "shadcn/no-raw-colors",
        "shadcn/no-arbitrary-values",
        "shadcn/no-unknown-classes",
        "shadcn/no-restyle",
      ]),
    );
  });

  it("does not allow palette prose, foreground overrides, or unreadable authored-content classes", async () => {
    const messages = await lint(
      'import { PostContent } from "@asym/ui/components/shadcn/rich-text-editor/post-content"; export const Probe = ({ classes }) => <PostContent value="A note" richTextClassName="prose-zinc text-foreground" htmlClassName={classes} />;',
      "apps/donor",
    );
    expect(
      messages.filter((message) => message.ruleId === "shadcn/no-restyle"),
    ).toHaveLength(2);
    expect(
      messages.some(
        (message) => message.ruleId === "shadcn/require-static-classes",
      ),
    ).toBe(true);
  });

  it("recognizes exact loaded typography-plugin contract entries without operational warnings", async () => {
    // Native wrapper + fresh process: module-level warnOnce/contract caches
    // cannot hide warnings emitted by an earlier test or direct ESLint call.
    const result = spawnSync(
      process.execPath,
      [
        "tooling/eslint-config/lint.mjs",
        "packages/ui/lib/utils.ts",
        "--raw",
        "--format",
        "json",
      ],
      { cwd: root, encoding: "utf8", timeout: 20_000 },
    );
    expect(result.error).toBeUndefined();
    expect(result.status, result.stderr).toBe(0);
    expect(result.stderr).not.toContain("[@shadcn/lint]");
    expect(JSON.parse(result.stdout)).toEqual([
      expect.objectContaining({ errorCount: 0, warningCount: 0 }),
    ]);
  });

  it("still warns about an unknown exact contract class and rejects its use", () => {
    const result = contractProbe(
      ["prose-core-undeclared"],
      'export const Probe = () => <div className="prose-core-undeclared" />;',
    );
    expect(result.stderr).toContain(
      '[@shadcn/lint] Contract entry "prose-core-undeclared"',
    );
    expect(
      result.messages.some(
        (message) => message.ruleId === "shadcn/no-unknown-classes",
      ),
    ).toBe(true);
  });

  it("still rejects a misspelled category instead of treating it as an arbitrary class", () => {
    const result = contractProbe(
      ["spcing"],
      "export const Probe = () => <div />;",
    );
    expect(
      result.messages.some(
        (message) =>
          message.ruleId === "shadcn/no-restyle" &&
          message.message.includes('Did you mean "spacing"'),
      ),
    ).toBe(true);
  });

  it("does not accept exact contract entries through a broken Tailwind theme", () => {
    const fixture = mkdtempSync(
      path.join(os.tmpdir(), "core-contract-broken-theme-"),
    );
    try {
      mkdirSync(path.join(fixture, "apps/donor"), { recursive: true });
      writeFileSync(
        path.join(fixture, "package.json"),
        JSON.stringify({ name: "core-contract-fixture", private: true }),
      );
      writeFileSync(
        path.join(fixture, "apps/donor/package.json"),
        JSON.stringify({ name: "contract-donor-fixture", private: true }),
      );
      writeFileSync(
        path.join(fixture, "apps/donor/globals.css"),
        '@import "tailwindcss"; @import "./core-missing-theme.css";',
      );
      symlinkSync(
        path.join(root, "node_modules"),
        path.join(fixture, "node_modules"),
        process.platform === "win32" ? "junction" : "dir",
      );
      const result = contractProbe(
        ["prose"],
        'export const Probe = () => <div className="prose" />;',
        fixture,
      );
      expect(result.stderr).toContain("[@shadcn/lint]");
      expect(result.stderr).toContain("core-missing-theme.css");
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  });
});

describe("portaled content width delegation", () => {
  const popups = [
    ["DialogContent", "dialog"],
    ["PopoverContent", "popover"],
    ["SheetContent", "sheet"],
  ];

  it.each(popups)("allows content width on %s", async (component, module) => {
    const messages = await lint(
      `import { ${component} } from "@asym/ui/components/shadcn/${module}";
      export const Probe = () => <${component} className="w-80 min-w-64 sm:max-w-lg" />;`,
      "apps/donor",
    );
    expect(messages).toEqual([]);
  });

  it.each(popups)(
    "keeps appearance, focus, height, scrolling and motion owned on %s",
    async (component, module) => {
      const messages = await lint(
        `import { ${component} } from "@asym/ui/components/shadcn/${module}";
      export const Probe = () => <${component} className="bg-primary rounded-full focus:ring-4 h-32 overflow-y-auto duration-500" />;`,
        "apps/donor",
      );
      const restyles = messages.filter(
        (message) => message.ruleId === "shadcn/no-restyle",
      );
      expect(restyles).toHaveLength(6);
      for (const token of [
        "bg-primary",
        "rounded-full",
        "focus:ring-4",
        "h-32",
        "overflow-y-auto",
        "duration-500",
      ])
        expect(
          restyles.some((message) => message.message.includes(token)),
        ).toBe(true);
    },
  );

  it("still rejects arbitrary popup widths and ordinary Button width overrides", async () => {
    const messages = await lint(
      'import { DialogContent } from "@asym/ui/components/shadcn/dialog"; import { Button } from "@asym/ui/components/shadcn/button"; export const Probe = () => <><DialogContent className="w-[513px]" /><Button className="w-80" /></>;',
      "apps/donor",
    );
    expect(
      messages.filter(
        (message) => message.ruleId === "shadcn/no-arbitrary-values",
      ),
    ).toHaveLength(1);
    expect(
      messages
        .filter((message) => message.ruleId === "shadcn/no-restyle")
        .some(
          (message) =>
            message.message.includes("Button") &&
            message.message.includes("w-80"),
        ),
    ).toBe(true);
  });
});

describe("shared dialog scrolling geometry", () => {
  const viewportCap = "max-h-[calc(100dvh-var(--spacing)*8)]";

  it("allows the spacing-derived viewport cap only in its owning dialog primitive", async () => {
    expect(
      await lint(
        `export const Probe = () => <div className="${viewportCap} overflow-y-auto" />;`,
        "packages/ui",
        "components/shadcn/dialog.tsx",
      ),
    ).toEqual([]);
  });

  it.each([
    "components/shadcn/button.tsx",
    "components/shadcn/custom-dialog.tsx",
  ])("does not grant the dialog viewport value to %s", async (relativeFile) => {
    const messages = await lint(
      `export const Probe = () => <div className="${viewportCap}" />;`,
      "packages/ui",
      relativeFile,
    );
    expect(messages.map((message) => message.ruleId)).toEqual([
      "shadcn/no-arbitrary-values",
    ]);
  });

  it("requires consumers to use the shared scrolling API instead of restyling popup height or overflow", async () => {
    const messages = await lint(
      `import { DialogContent } from "@asym/ui/components/shadcn/dialog"; export const Probe = () => <DialogContent scrollable className="${viewportCap} overflow-y-auto" />;`,
      "apps/admin",
    );
    expect(
      messages.filter((message) => message.ruleId === "shadcn/no-restyle"),
    ).toHaveLength(2);
    expect(
      messages.filter(
        (message) => message.ruleId === "shadcn/no-arbitrary-values",
      ),
    ).toHaveLength(1);
  });
});
