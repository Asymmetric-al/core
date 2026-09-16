import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

const coreRoot = process.cwd();
const turboCli = path.join(coreRoot, "node_modules/turbo/bin/turbo");
const webWorkspaces = [
  "apps/admin",
  "apps/donor",
  "apps/missionary",
  "packages/ui",
  "packages/missionary",
];
const fixtures: string[] = [];
const sharedInputs = [
  "packages/ui/components/shadcn/button.tsx",
  "packages/ui/styles/theme.css",
  "packages/missionary/styles.css",
  "packages/missionary/components/forwarder.tsx",
  "packages/ui/styles/globals.css",
  "packages/ui/components.json",
  "packages/ui/tsconfig.json",
  "packages/ui/index.ts",
  "tooling/eslint-config/design-system.mjs",
  "tooling/eslint-config/suppressions.json",
  "tooling/eslint-config/lint.mjs",
  "tooling/eslint-config/patches/@shadcn%2Flint@0.1.0.patch",
  "eslint.config.mjs",
  "tsconfig.json",
  "tooling/typescript-config/base.json",
];
type Manifest = {
  name: string;
  packageManager?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};
type DryRun = {
  tasks: Array<{
    taskId: string;
    hash: string;
    cache: { status: string };
    inputs: Record<string, string>;
  }>;
};

function write(root: string, relative: string, source: string) {
  const file = path.join(root, relative);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, source);
}

function run(
  root: string,
  command: string,
  args: string[],
  expectedStatus = 0,
) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    timeout: 20_000,
    env: {
      ...process.env,
      TURBO_TELEMETRY_DISABLED: "1",
      TURBO_TOKEN: "",
      TURBO_TEAM: "",
      TURBO_SCM_BASE: "HEAD",
      TURBO_SCM_HEAD: "",
      GIT_AUTHOR_NAME: "Cache fixture",
      GIT_AUTHOR_EMAIL: "fixture@example.invalid",
      GIT_COMMITTER_NAME: "Cache fixture",
      GIT_COMMITTER_EMAIL: "fixture@example.invalid",
    },
  });
  if (result.error) throw result.error;
  if (result.status !== expectedStatus)
    throw new Error(
      `${command} ${args.join(" ")} failed:\n${result.stdout}\n${result.stderr}`,
    );
  return result.stdout;
}

/** Keep Core's actual graph and Turbo configuration; replace expensive commands only. */
function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), "core-lint-cache-"));
  fixtures.push(root);
  const manifest = JSON.parse(
    readFileSync(path.join(coreRoot, "package.json"), "utf8"),
  ) as Manifest;
  write(
    root,
    "package.json",
    JSON.stringify({
      name: "core-lint-cache-fixture",
      private: true,
      packageManager: manifest.packageManager,
      workspaces: ["apps/*", "packages/*", "tooling/*"],
    }),
  );
  copyFileSync(
    path.join(coreRoot, "turbo.json"),
    path.join(root, "turbo.json"),
  );
  write(root, ".gitignore", "node_modules/\n.turbo/\n");
  write(root, "lint.mjs", "console.log('fixture lint executed');\n");
  for (const parent of ["apps", "packages", "tooling"]) {
    for (const directory of readdirSync(path.join(coreRoot, parent), {
      withFileTypes: true,
    })) {
      const relative = `${parent}/${directory.name}`;
      const manifestPath = path.join(coreRoot, relative, "package.json");
      if (!directory.isDirectory() || !existsSync(manifestPath)) continue;
      const source = JSON.parse(readFileSync(manifestPath, "utf8")) as Manifest;
      const dependencies = Object.fromEntries(
        Object.entries({
          ...source.dependencies,
          ...source.devDependencies,
        }).filter(([, version]) => version.startsWith("workspace:")),
      );
      write(
        root,
        `${relative}/package.json`,
        JSON.stringify({
          name: source.name,
          version: "0.0.0",
          private: true,
          dependencies,
          scripts: { lint: "node ../../lint.mjs" },
        }),
      );
      const taskConfig = path.join(coreRoot, relative, "turbo.json");
      if (existsSync(taskConfig))
        copyFileSync(taskConfig, path.join(root, relative, "turbo.json"));
      write(root, `${relative}/source.ts`, "export const value = 1;\n");
    }
  }
  for (const file of sharedInputs) write(root, file, "initial fixture input\n");
  run(root, "bun", ["install", "--ignore-scripts", "--offline"]);
  run(root, "git", ["init", "--quiet"]);
  run(root, "git", ["add", "."]);
  run(root, "git", [
    "-c",
    "commit.gpgsign=false",
    "commit",
    "--quiet",
    "-m",
    "cache fixture baseline",
  ]);
  return root;
}

function dry(root: string, args: string[] = []): DryRun {
  return JSON.parse(
    run(root, process.execPath, [
      turboCli,
      "run",
      "lint",
      "--dry=json",
      "--cache=local:rw",
      ...args,
    ]),
  ) as DryRun;
}

function webTaskIds(root: string) {
  return webWorkspaces.map((relative) => {
    const manifest = JSON.parse(
      readFileSync(path.join(root, relative, "package.json"), "utf8"),
    ) as Manifest;
    return `${manifest.name}#lint`;
  });
}

function hash(result: DryRun, taskId: string) {
  const task = result.tasks.find((entry) => entry.taskId === taskId);
  expect(task, `Task ${taskId} must be selected`).toBeDefined();
  return task!.hash;
}

afterEach(() => {
  for (const root of fixtures.splice(0))
    rmSync(root, { recursive: true, force: true });
});

describe("design-system lint cache and selection", () => {
  it("rechecks an unchanged consumer against a changed token with Core's exported ESLint policy", () => {
    const root = fixture();
    const requireFromCore = createRequire(path.join(coreRoot, "package.json"));
    const moduleUrl = (name: string) =>
      pathToFileURL(requireFromCore.resolve(name)).href;
    const policyUrl = pathToFileURL(
      path.join(coreRoot, "tooling/eslint-config/design-system.mjs"),
    ).href;
    symlinkSync(
      path.join(coreRoot, "node_modules/tailwindcss"),
      path.join(root, "node_modules/tailwindcss"),
      process.platform === "win32" ? "junction" : "dir",
    );
    write(
      root,
      "apps/donor/tsconfig.json",
      JSON.stringify({ compilerOptions: { jsx: "preserve" } }),
    );
    write(
      root,
      "packages/ui/tsconfig.json",
      JSON.stringify({ compilerOptions: { jsx: "preserve" } }),
    );
    write(
      root,
      "tsconfig.json",
      JSON.stringify({ compilerOptions: { jsx: "preserve" } }),
    );
    write(
      root,
      "apps/donor/app/globals.css",
      '@import "../../../packages/ui/styles/globals.css";',
    );
    write(
      root,
      "packages/ui/styles/globals.css",
      '@import "tailwindcss"; @theme { --color-background: #ffffff; --color-cache-proof: #123456; }',
    );
    write(
      root,
      "apps/donor/consumer.tsx",
      'export const Consumer = () => <div className="bg-cache-proof" />;',
    );
    write(
      root,
      "lint.mjs",
      `
      import { ESLint } from ${JSON.stringify(moduleUrl("eslint"))};
      import parser from ${JSON.stringify(moduleUrl("@typescript-eslint/parser"))};
      import { designSystemConfig } from ${JSON.stringify(policyUrl)};
      import { fileURLToPath } from "node:url";
      const rootDir = fileURLToPath(new URL(".", import.meta.url));
      const eslint = new ESLint({ cwd: rootDir, overrideConfigFile: true, overrideConfig: [
        { files: ["**/*.tsx"], languageOptions: { parser } },
        ...designSystemConfig({ workspace: "apps/donor", rootDir }),
      ] });
      const results = await eslint.lintFiles(["apps/donor/consumer.tsx"]);
      console.log(JSON.stringify(results.map(({ messages }) => messages)));
      process.exitCode = results.some(({ errorCount }) => errorCount > 0) ? 1 : 0;
    `,
    );
    const command = [
      turboCli,
      "run",
      "lint",
      "--filter=@asym/donor",
      "--cache=local:rw",
    ];
    expect(run(root, process.execPath, command)).toContain("cache miss");
    expect(run(root, process.execPath, command)).toContain("cache hit");
    write(
      root,
      "packages/ui/styles/globals.css",
      '@import "tailwindcss"; @theme { --color-background: #ffffff; }',
    );
    const failed = run(root, process.execPath, command, 1);
    expect(failed).toContain("cache miss");
    expect(failed).toContain("shadcn/no-raw-colors");
    expect(
      readFileSync(path.join(root, "apps/donor/consumer.tsx"), "utf8"),
    ).toBe('export const Consumer = () => <div className="bg-cache-proof" />;');
  });
  it("reuses successful unchanged tasks and rechecks after a shared component change", () => {
    const root = fixture();
    const command = [
      turboCli,
      "run",
      "lint",
      "--filter=@asym/donor",
      "--cache=local:rw",
    ];
    expect(run(root, process.execPath, command)).toContain("cache miss");
    expect(run(root, process.execPath, command)).toContain("cache hit");
    write(
      root,
      "packages/ui/components/shadcn/button.tsx",
      "changed owned component variant\n",
    );
    expect(run(root, process.execPath, command)).toContain("cache miss");
  });

  it("invalidates web consumers for shared inputs without invalidating unrelated backend lint", () => {
    const root = fixture();
    const baseline = dry(root);
    for (const file of sharedInputs) {
      const original = readFileSync(path.join(root, file), "utf8");
      write(root, file, `${original}changed\n`);
      const changed = dry(root);
      for (const taskId of webTaskIds(root))
        expect(
          hash(changed, taskId),
          `${file} must invalidate ${taskId}`,
        ).not.toBe(hash(baseline, taskId));
      expect(
        hash(changed, "@asym/api#lint"),
        `${file} must not invalidate backend lint`,
      ).toBe(hash(baseline, "@asym/api#lint"));
      write(root, file, original);
    }
  });

  it("invalidates consumers when shared package export resolution metadata changes", () => {
    const root = fixture();
    const baseline = dry(root);
    for (const file of [
      "packages/ui/package.json",
      "packages/missionary/package.json",
    ]) {
      const original = readFileSync(path.join(root, file), "utf8");
      write(
        root,
        file,
        JSON.stringify({
          ...JSON.parse(original),
          exports: { "./probe": "./source.ts" },
        }),
      );
      const changed = dry(root);
      for (const taskId of webTaskIds(root))
        expect(
          hash(changed, taskId),
          `${file} must invalidate ${taskId}`,
        ).not.toBe(hash(baseline, taskId));
      expect(hash(changed, "@asym/api#lint")).toBe(
        hash(baseline, "@asym/api#lint"),
      );
      write(root, file, original);
    }
  });

  it("preserves default workspace hashing and ignores unrelated UI documentation", () => {
    const root = fixture();
    const baseline = dry(root);
    write(root, "apps/donor/source.ts", "export const value = 2;\n");
    expect(hash(dry(root), "@asym/donor#lint")).not.toBe(
      hash(baseline, "@asym/donor#lint"),
    );
    write(root, "apps/donor/source.ts", "export const value = 1;\n");
    write(root, "packages/ui/README.md", "Unrelated documentation\n");
    expect(hash(dry(root), "@asym/donor#lint")).toBe(
      hash(baseline, "@asym/donor#lint"),
    );
  });

  it("affected PR lint selects UI consumers for a tooling patch-only change", () => {
    const root = fixture();
    write(
      root,
      "tooling/eslint-config/patches/@shadcn%2Flint@0.1.0.patch",
      "updated plugin patch\n",
    );
    const selected = dry(root, [
      "--affected",
      "--filter=./apps/*",
      "--filter=./packages/*",
      "--filter=./tooling/*",
    ]);
    expect(selected.tasks.map((task) => task.taskId)).toEqual(
      expect.arrayContaining(webTaskIds(root)),
    );
  });

  it("affected PR lint selects consumers for shared components, policy, and suppressions", () => {
    const root = fixture();
    for (const file of [
      "packages/ui/components/shadcn/button.tsx",
      "tooling/eslint-config/design-system.mjs",
      "tooling/eslint-config/suppressions.json",
    ]) {
      const original = readFileSync(path.join(root, file), "utf8");
      write(root, file, `${original}changed\n`);
      const selected = dry(root, [
        "--affected",
        "--filter=./apps/*",
        "--filter=./packages/*",
        "--filter=./tooling/*",
      ]);
      expect(selected.tasks.map((task) => task.taskId)).toEqual(
        expect.arrayContaining(webTaskIds(root)),
      );
      expect(selected.tasks.map((task) => task.taskId)).not.toContain(
        "@asym/api#lint",
      );
      write(root, file, original);
    }
  });
});
