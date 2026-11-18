import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  HOOK_BUDGET_MS,
  HOOK_ROOT,
  afterEdit,
  buildCommands,
  classifyEdit,
  hookResponse,
  parsePayload,
  summarizeEslint,
} from "../../../scripts/agent-hooks/after-edit.mjs";
import { lintInvocation } from "../../../tooling/eslint-config/lint.mjs";

const HOOK = "scripts/agent-hooks/after-edit.mjs";
const ROOT = path.resolve("/work/core");
const at = (relative: string) => path.join(ROOT, ...relative.split("/"));
const always = () => true;

const created: string[] = [];
// Links into this checkout; removed on their own, never recursed into.
const linked: string[] = [];
afterEach(() => {
  for (const link of linked.splice(0)) rmSync(link, { force: true });
  for (const dir of created.splice(0))
    rmSync(dir, { recursive: true, force: true });
});

describe("edit hook payloads", () => {
  it("reads the edited file from a Claude Code PostToolUse payload", () => {
    const payload = {
      hook_event_name: "PostToolUse",
      cwd: ROOT,
      tool_name: "Edit",
      tool_input: { file_path: at("apps/donor/app/page.tsx") },
    };
    expect(parsePayload("claude", JSON.stringify(payload))).toEqual([
      at("apps/donor/app/page.tsx"),
    ]);
    expect(
      parsePayload(
        "claude",
        JSON.stringify({ ...payload, tool_input: { file_path: "README.md" } }),
      ),
    ).toEqual([at("README.md")]);
  });

  it("reads every written file from a Codex apply_patch payload", () => {
    const patch = [
      "*** Begin Patch",
      "*** Add File: docs/new.md",
      "+hello",
      "*** Update File: apps/admin/lib/a.ts",
      "@@",
      "-a",
      "+b",
      "*** Delete File: apps/admin/lib/gone.ts",
      "*** Update File: packages/api/src/old.ts",
      "*** Move to: packages/api/src/new.ts",
      "*** End Patch",
    ].join("\n");
    const payload = {
      hook_event_name: "PostToolUse",
      cwd: ROOT,
      tool_name: "apply_patch",
      tool_input: { command: patch },
    };
    expect(parsePayload("codex", JSON.stringify(payload))).toEqual([
      at("docs/new.md"),
      at("apps/admin/lib/a.ts"),
      at("packages/api/src/new.ts"),
    ]);
    expect(
      parsePayload(
        "codex",
        JSON.stringify({
          ...payload,
          tool_input: { command: ["apply_patch", patch] },
        }),
      ),
    ).toEqual([
      at("docs/new.md"),
      at("apps/admin/lib/a.ts"),
      at("packages/api/src/new.ts"),
    ]);
    expect(
      parsePayload(
        "codex",
        JSON.stringify({
          ...payload,
          tool_name: "Bash",
          tool_input: { command: "ls" },
        }),
      ),
    ).toEqual([]);
  });

  it("matches apply_patch file headers only at the start of a line", () => {
    // A patch to a document that shows a patch: its content and context
    // lines carry a "+", "-" or " " prefix, so they never start a header.
    const patch = [
      "*** Begin Patch",
      "*** Update File: docs/patch-format.md",
      "@@",
      " *** Update File: apps/admin/lib/context.ts",
      "-  *** Add File: apps/admin/lib/removed.ts",
      "+*** Add File: apps/admin/lib/added.ts",
      "+\t*** Update File: apps/admin/lib/tabbed.ts",
      "*** End Patch",
    ].join("\n");
    expect(
      parsePayload(
        "codex",
        JSON.stringify({
          cwd: ROOT,
          tool_name: "apply_patch",
          tool_input: { command: patch },
        }),
      ),
    ).toEqual([at("docs/patch-format.md")]);
  });

  it("reads the edited file from a Cursor afterFileEdit payload", () => {
    expect(
      parsePayload(
        "cursor",
        JSON.stringify({
          hook_event_name: "afterFileEdit",
          workspace_roots: [ROOT],
          file_path: at("packages/ui/components/x.tsx"),
          edits: [{ old_string: "a", new_string: "b" }],
        }),
      ),
    ).toEqual([at("packages/ui/components/x.tsx")]);
  });

  it.each([
    ["claude", "not json"],
    ["claude", JSON.stringify({ tool_input: {} })],
    ["codex", JSON.stringify({ tool_name: "apply_patch" })],
    ["cursor", JSON.stringify({})],
    ["unknown", JSON.stringify({ file_path: "/x" })],
  ])("finds no file in a %s payload it cannot read", (harness, text) => {
    expect(parsePayload(harness, text)).toEqual([]);
  });
});

describe("edit hook path decisions", () => {
  it("acts only inside the checkout that holds the hook script", () => {
    expect(HOOK_ROOT).toBe(path.resolve("."));
    // Another tree that looks like a checkout (it has the lint runner) is
    // still outside: the hook never runs that tree's tools.
    for (const outside of [
      path.resolve("..", "other-core", "apps", "donor", "app", "page.tsx"),
      path.resolve(os.tmpdir(), "planted", "apps", "x", "page.tsx"),
    ])
      expect(classifyEdit(HOOK_ROOT, outside, always)).toEqual({
        action: "skip",
        reason: "outside the checkout",
      });
    expect(
      classifyEdit(HOOK_ROOT, path.resolve("apps/donor/app/page.tsx"), always),
    ).toEqual({ action: "lint-and-format" });
  });

  it.each([
    ["apps/donor/app/page.tsx", "lint-and-format"],
    ["packages/api/src/donations.ts", "lint-and-format"],
    ["tooling/eslint-config/lint.mjs", "lint-and-format"],
    ["apps/admin/components/x.jsx", "lint-and-format"],
    ["scripts/git/pre-push.mjs", "format"],
    ["tests/unit/example.test.ts", "format"],
    ["docs/ci.md", "format"],
    ["README.md", "format"],
    ["apps/donor/app/globals.css", "format"],
  ])("handles %s with %s", (relative, action) => {
    expect(classifyEdit(ROOT, at(relative), always)).toMatchObject({ action });
  });

  it.each([
    "apps/donor/.next/dev/lock",
    "apps/admin/.next/server/app/page.js",
    ".next-docs/01-app/02-guides/ai-agents.mdx",
    ".agents/skills/next-dev-loop/SKILL.md",
    ".agent/skills/x/SKILL.md",
    ".claude/skills/tdd/SKILL.md",
    ".cursor/skills/tdd/SKILL.md",
    ".claude/commands/4-close-project.md",
    ".claude/agents/reviewer.md",
    "node_modules/prettier/index.js",
    "apps/admin/node_modules/x/index.js",
    "vendor/payload-upstream/src/index.ts",
    "vendor/react-pdf-packages/layout/src/index.js",
    "apps/admin/payload-types.ts",
    ".turbo/cache/x.json",
    ".git/config",
  ])("never touches %s", (relative) => {
    expect(classifyEdit(ROOT, at(relative), always)).toMatchObject({
      action: "skip",
    });
  });

  it("skips deleted files and files outside the checkout", () => {
    expect(
      classifyEdit(ROOT, at("apps/donor/app/page.tsx"), () => false),
    ).toMatchObject({ action: "skip" });
    expect(
      classifyEdit(ROOT, path.resolve("/work/other/file.ts"), always),
    ).toMatchObject({ action: "skip" });
  });
});

describe("edit hook commands", () => {
  const node = "/usr/bin/node";
  const tools = { eslint: true, prettier: true };
  const edit = (relative: string, action = "lint-and-format") => ({
    file: at(relative),
    action,
  });
  const tool = (command: { tool: string }) => command.tool;

  it("formats every edited file in one run, then lints the source files in one run without fixing", () => {
    const edits = [
      edit("apps/donor/app/page.tsx"),
      edit("docs/ci.md", "format"),
      edit("packages/api/src/donations.ts"),
    ];
    const commands = buildCommands({ root: ROOT, edits, node, tools });
    expect(commands.map(tool)).toEqual(["prettier", "eslint"]);
    const [prettier, eslint] = commands;
    expect(prettier).toEqual({
      tool: "prettier",
      files: edits.map((entry) => entry.file),
      command: node,
      args: [
        path.join(ROOT, "node_modules", "prettier", "bin", "prettier.cjs"),
        "--ignore-unknown",
        "--write",
        ...edits.map((entry) => entry.file),
      ],
      cwd: ROOT,
    });
    // The ESLint arguments tooling/eslint-config/lint.mjs builds from the
    // root (what lint-staged runs at commit time), without --fix: every
    // autofix in that configuration removes, moves or rewrites code.
    const linted = [
      at("apps/donor/app/page.tsx"),
      at("packages/api/src/donations.ts"),
    ];
    const invocation = lintInvocation({
      args: ["--format", "json", ...linted],
      cwd: ROOT,
      rootDir: ROOT,
    });
    expect(eslint).toEqual({
      tool: "eslint",
      files: linted,
      command: node,
      args: [
        path.join(ROOT, "node_modules", "eslint", "bin", "eslint.js"),
        ...invocation.args,
      ],
      cwd: ROOT,
    });
    for (const command of commands)
      expect(command.args.filter((arg: string) => /^--fix/.test(arg))).toEqual(
        [],
      );
  });

  it("formats files outside the lint scope without linting them", () => {
    const commands = buildCommands({
      root: ROOT,
      edits: [edit("docs/ci.md", "format")],
      node,
      tools,
    });
    expect(commands.map(tool)).toEqual(["prettier"]);
  });

  it("does nothing when the tools are not installed", () => {
    const edits = [edit("apps/donor/app/page.tsx")];
    expect(
      buildCommands({
        root: ROOT,
        edits,
        node,
        tools: { eslint: false, prettier: false },
      }),
    ).toEqual([]);
    expect(
      buildCommands({
        root: ROOT,
        edits,
        node,
        tools: { eslint: false, prettier: true },
      }).map(tool),
    ).toEqual(["prettier"]);
  });

  it("lints nothing when the lint step is switched off", () => {
    expect(
      buildCommands({
        root: ROOT,
        edits: [edit("apps/donor/app/page.tsx")],
        node,
        tools,
        lint: false,
      }).map(tool),
    ).toEqual(["prettier"]);
  });

  it("never calls the next CLI, a build, a typecheck, a test runner or the network", () => {
    const commands = buildCommands({
      root: ROOT,
      edits: [edit("apps/admin/app/(app)/page.tsx")],
      node,
      tools,
    });
    const words = commands.flatMap(
      (command: { command: string; args: string[] }) => [
        command.command,
        ...command.args,
      ],
    );
    for (const forbidden of [
      /(?:^|[\\/])next(?:\.js|\.cmd)?$/,
      /^build$/,
      /typecheck|tsc/,
      /vitest|playwright/,
      /^https?:/,
      /get_compilation_issues|compile_route|bunx|npx/,
    ])
      expect(words.filter((word: string) => forbidden.test(word))).toEqual([]);
  });
});

describe("edit hook reports", () => {
  const report = JSON.stringify([
    {
      filePath: at("apps/donor/app/page.tsx"),
      messages: [
        {
          line: 3,
          column: 7,
          severity: 2,
          ruleId: "no-undef",
          message: "'x' is not defined.",
        },
        {
          line: 4,
          column: 1,
          severity: 1,
          ruleId: "no-console",
          message: "Unexpected console.",
        },
        {
          line: 9,
          column: 2,
          severity: 2,
          ruleId: null,
          message: "Parsing error: ';' expected.",
        },
      ],
    },
  ]);

  it("summarizes lint errors in a few lines", () => {
    expect(summarizeEslint(report, ROOT)).toEqual([
      "apps/donor/app/page.tsx: 2 ESLint errors:",
      "  3:7 no-undef 'x' is not defined.",
      "  9:2 Parsing error: ';' expected.",
    ]);
  });

  it("reports fixable problems it left in place, warnings included", () => {
    const fix = { range: [0, 10], text: "" };
    const fixable = JSON.stringify([
      {
        filePath: at("packages/api/src/a.ts"),
        messages: [
          {
            line: 1,
            column: 1,
            severity: 1,
            ruleId: "unused-imports/no-unused-imports",
            message: "'path' is defined but never used.",
            fix,
          },
          {
            line: 2,
            column: 1,
            severity: 1,
            ruleId: "import-x/order",
            message: "`node:fs` import should occur before import of `zod`",
            fix,
          },
          {
            line: 5,
            column: 3,
            severity: 1,
            ruleId: "@typescript-eslint/no-explicit-any",
            message: "Unexpected any. Specify a different type.",
          },
        ],
      },
    ]);
    expect(summarizeEslint(fixable, ROOT)).toEqual([
      "packages/api/src/a.ts: 2 fixable problems not fixed (pre-commit's eslint --fix applies them):",
      "  1:1 unused-imports/no-unused-imports 'path' is defined but never used. [fixable, not fixed]",
      "  2:1 import-x/order `node:fs` import should occur before import of `zod` [fixable, not fixed]",
    ]);
  });

  it("caps the summary", () => {
    const messages = Array.from({ length: 30 }, (_, index) => ({
      line: index + 1,
      column: 1,
      severity: 2,
      ruleId: "no-undef",
      message: "x",
    }));
    const lines = summarizeEslint(
      JSON.stringify([{ filePath: at("a.ts"), messages }]),
      ROOT,
    );
    expect(lines.length).toBeLessThanOrEqual(10);
    expect(lines.at(-1)).toMatch(/22 more/);
  });

  it("reports nothing for a clean file or unreadable output", () => {
    expect(
      summarizeEslint(
        JSON.stringify([{ filePath: at("a.ts"), messages: [] }]),
        ROOT,
      ),
    ).toEqual([]);
    expect(summarizeEslint("not json", ROOT)).toEqual([]);
  });

  it("sends the summary to the agent the way each harness documents", () => {
    const lines = ["a.ts: 1 ESLint error:", "  1:1 no-undef x"];
    for (const harness of ["claude", "codex"]) {
      const response = hookResponse(harness, lines);
      expect(response.exit).toBe(0);
      expect(JSON.parse(response.stdout)).toEqual({
        hookSpecificOutput: {
          hookEventName: "PostToolUse",
          additionalContext: lines.join("\n"),
        },
      });
    }
    expect(hookResponse("cursor", lines)).toEqual({
      exit: 0,
      stdout: "",
      stderr: `${lines.join("\n")}\n`,
    });
    for (const harness of ["claude", "codex", "cursor"])
      expect(hookResponse(harness, [])).toEqual({
        exit: 0,
        stdout: "",
        stderr: "",
      });
  });
});

describe("edit hook runs and time budget", () => {
  type Command = { tool: string; files: string[] };
  const fivePatch = [
    "*** Begin Patch",
    ...["a", "b", "c", "d", "e"].map(
      (name) => `*** Update File: packages/api/src/${name}.ts`,
    ),
    "*** Update File: docs/notes.md",
    "*** End Patch",
  ].join("\n");
  const payload = JSON.stringify({
    cwd: ROOT,
    tool_name: "apply_patch",
    tool_input: { command: fivePatch },
  });
  const installed = () => ({ eslint: true, prettier: true });
  const ok = { status: 0, stdout: "[]", stderr: "" };

  function hook(
    run: (command: Command, timeout: number) => object,
    clock = () => 0,
  ) {
    return afterEdit({
      harness: "codex",
      input: payload,
      env: {},
      root: ROOT,
      exists: always,
      tools: installed,
      run,
      clock,
    });
  }

  it("starts one Prettier and one ESLint process for a five-file patch", () => {
    const calls: Command[] = [];
    const response = hook((command) => {
      calls.push(command);
      return ok;
    });
    expect(response).toEqual({ exit: 0, stdout: "", stderr: "" });
    expect(calls.map((command) => command.tool)).toEqual([
      "prettier",
      "eslint",
    ]);
    expect(calls[0].files).toHaveLength(6);
    expect(calls[1].files).toHaveLength(5);
  });

  it("gives each tool only the time left in a budget below the harness timeout", () => {
    expect(HOOK_BUDGET_MS).toBeLessThan(120_000);
    let now = 0;
    const timeouts: number[] = [];
    hook(
      (_command, timeout) => {
        timeouts.push(timeout);
        now += 30_000;
        return ok;
      },
      () => now,
    );
    expect(timeouts).toEqual([HOOK_BUDGET_MS, HOOK_BUDGET_MS - 30_000]);
  });

  it("stops at the budget, says what it did not check, and still exits 0", () => {
    const timedOut = hook((command) =>
      command.tool === "eslint"
        ? {
            status: null,
            signal: "SIGTERM",
            error: Object.assign(new Error("spawnSync node ETIMEDOUT"), {
              code: "ETIMEDOUT",
            }),
          }
        : ok,
    );
    expect(timedOut.exit).toBe(0);
    const context = JSON.parse(timedOut.stdout).hookSpecificOutput
      .additionalContext as string;
    expect(context).toMatch(/did not lint packages\/api\/src\/a\.ts, .*e\.ts/);
    expect(context).toMatch(/budget/);

    // Prettier used up the budget: ESLint is not started at all.
    let now = 0;
    const started: string[] = [];
    const late = hook(
      (command) => {
        started.push(command.tool);
        now = HOOK_BUDGET_MS - 1_000;
        return ok;
      },
      () => now,
    );
    expect(started).toEqual(["prettier"]);
    expect(late.exit).toBe(0);
    expect(
      JSON.parse(late.stdout).hookSpecificOutput.additionalContext,
    ).toMatch(/did not lint .*budget ran out/);
  });

  it("says so when ESLint itself fails instead of reporting a clean file", () => {
    const failed = hook((command) =>
      command.tool === "eslint"
        ? {
            status: 2,
            stdout: "",
            stderr: "\nOops! Something went wrong! :(\n\nESLint: 10.13.0\n",
          }
        : ok,
    );
    expect(failed.exit).toBe(0);
    expect(
      JSON.parse(failed.stdout).hookSpecificOutput.additionalContext,
    ).toMatch(/did not lint .*ESLint failed \(Oops! Something went wrong/);
  });

  it("starts no tool for files outside its own checkout", () => {
    const calls: Command[] = [];
    const response = afterEdit({
      harness: "claude",
      input: JSON.stringify({
        tool_input: { file_path: path.resolve("/elsewhere/core/apps/x/a.ts") },
      }),
      env: {},
      root: ROOT,
      exists: always,
      tools: installed,
      run: (command: Command) => {
        calls.push(command);
        return ok;
      },
    });
    expect(calls).toEqual([]);
    expect(response.stdout).toBe("");
  });
});

describe("edit hook process", () => {
  function runHook(harness: string, input: string, env = {}) {
    return spawnSync(process.execPath, [HOOK, harness], {
      input,
      encoding: "utf8",
      env: { ...process.env, ...env },
      timeout: 60_000,
    });
  }

  it("never runs the tools of another tree that looks like a checkout", () => {
    const planted = mkdtempSync(path.join(os.tmpdir(), "core-edit-hook-"));
    created.push(planted);
    const sentinel = path.join(planted, "ran.txt");
    for (const [relative, text] of [
      ["tooling/eslint-config/lint.mjs", ""],
      ["eslint.config.mjs", "export default [];\n"],
      [
        "node_modules/prettier/bin/prettier.cjs",
        `require("node:fs").writeFileSync(${JSON.stringify(sentinel)}, "prettier");\n`,
      ],
      [
        "node_modules/eslint/bin/eslint.js",
        `require("node:fs").writeFileSync(${JSON.stringify(sentinel)}, "eslint");\n`,
      ],
      ["apps/x/page.tsx", "export   const a=1\n"],
    ]) {
      mkdirSync(path.dirname(path.join(planted, relative)), {
        recursive: true,
      });
      writeFileSync(path.join(planted, relative), text);
    }
    const file = path.join(planted, "apps", "x", "page.tsx");
    const result = runHook(
      "claude",
      JSON.stringify({
        cwd: planted,
        tool_name: "Write",
        tool_input: { file_path: file },
      }),
    );
    expect(result.status).toBe(0);
    expect(result.stdout).toBe("");
    expect(existsSync(sentinel)).toBe(false);
    expect(readFileSync(file, "utf8")).toBe("export   const a=1\n");
  });

  it("exits quietly in a checkout without installed tools", () => {
    const root = mkdtempSync(path.join(os.tmpdir(), "core-edit-hook-"));
    created.push(root);
    mkdirSync(path.join(root, "tooling", "eslint-config"), { recursive: true });
    writeFileSync(path.join(root, "tooling", "eslint-config", "lint.mjs"), "");
    mkdirSync(path.join(root, "apps", "x"), { recursive: true });
    const file = path.join(root, "apps", "x", "page.tsx");
    writeFileSync(file, "export   const a=1\n");
    const result = runHook(
      "claude",
      JSON.stringify({
        cwd: root,
        tool_name: "Write",
        tool_input: { file_path: file },
      }),
    );
    expect(result.status).toBe(0);
    expect(result.stdout).toBe("");
    expect(result.stderr).toBe("");
    expect(readFileSync(file, "utf8")).toBe("export   const a=1\n");
  });

  it.each([["claude"], ["codex"], ["cursor"], ["unknown"]])(
    "exits quietly on an unreadable %s payload",
    (harness) => {
      const result = runHook(harness, "{not json");
      expect(result.status).toBe(0);
      expect(result.stdout).toBe("");
      expect(result.stderr).toBe("");
    },
  );

  // A copy of the hook in a scratch checkout that uses this checkout's
  // installed tools and root lint configuration. One Codex patch edits two
  // files; ESLint runs once over both.
  it("keeps an import added before its use and reports import order instead of rewriting it", () => {
    const root = mkdtempSync(path.join(os.tmpdir(), "core-edit-hook-lint-"));
    created.push(root);
    for (const relative of [HOOK, "eslint.config.mjs"]) {
      mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
      copyFileSync(relative, path.join(root, relative));
    }
    // Workspace packages are relative links inside node_modules, so the
    // shared lint configuration must sit at the same place in the copy.
    mkdirSync(path.join(root, "tooling"));
    for (const relative of ["node_modules", "tooling/eslint-config"]) {
      symlinkSync(
        path.resolve(relative),
        path.join(root, relative),
        "junction",
      );
      linked.push(path.join(root, relative));
    }
    // First edit of a two-step change: the import comes before its use.
    const unused = [
      'import { readFileSync } from "node:fs";',
      'import path from "node:path";',
      "",
      'export const probe = (): string => readFileSync("x", "utf8");',
      "",
    ].join("\n");
    const misordered = [
      'import { z } from "zod";',
      "",
      'import { readFileSync } from "node:fs";',
      "",
      "export const schema = z.string();",
      'export const text = (): string => readFileSync("x", "utf8");',
      "",
    ].join("\n");
    const write = (relative: string, text: string) => {
      mkdirSync(path.dirname(path.join(root, relative)), {
        recursive: true,
      });
      writeFileSync(path.join(root, relative), text);
    };
    write("packages/api/src/hook-unused.ts", unused);
    write("packages/api/src/hook-order.ts", misordered);
    const result = spawnSync(
      process.execPath,
      [path.join(root, HOOK), "codex"],
      {
        input: JSON.stringify({
          cwd: root,
          tool_name: "apply_patch",
          tool_input: {
            command: [
              "*** Begin Patch",
              "*** Update File: packages/api/src/hook-unused.ts",
              "*** Update File: packages/api/src/hook-order.ts",
              "*** End Patch",
            ].join("\n"),
          },
        }),
        encoding: "utf8",
        env: { ...process.env, ASYM_EDIT_HOOK: "" },
        timeout: 170_000,
      },
    );
    expect(result.status).toBe(0);
    const read = (relative: string) =>
      readFileSync(path.join(root, relative), "utf8");
    expect(read("packages/api/src/hook-unused.ts")).toBe(unused);
    expect(read("packages/api/src/hook-order.ts")).toBe(misordered);
    const context = JSON.parse(result.stdout).hookSpecificOutput
      .additionalContext as string;
    expect(context).toMatch(
      /hook-unused\.ts:[^\n]*\n(?:[^\n]*\n)*?\s+2:\d+ \S*no-unused-\S+ [^\n]*'path'[^\n]*\[fixable, not fixed\]/,
    );
    expect(context).toMatch(
      /hook-order\.ts:[^\n]*\n(?:[^\n]*\n)*?\s+\d+:\d+ import-x\/order [^\n]*\[fixable, not fixed\]/,
    );
  }, 180_000);

  it("does nothing when switched off", () => {
    const result = runHook(
      "claude",
      JSON.stringify({ tool_input: { file_path: path.resolve("README.md") } }),
      { ASYM_EDIT_HOOK: "off" },
    );
    expect(result.status).toBe(0);
    expect(result.stdout).toBe("");
  });
});

// These pin the edit hook's own entries, not the whole files: other settings
// and other hooks may be added beside them.
describe("harness hook configuration", () => {
  const readJson = (file: string) => JSON.parse(readFileSync(file, "utf8"));
  type Entry = { matcher?: string; hooks: Array<Record<string, unknown>> };
  const editHooks = (groups: Entry[] = []) =>
    groups.flatMap((group) =>
      group.hooks
        .filter((hook) =>
          JSON.stringify(hook).includes("scripts/agent-hooks/after-edit.mjs"),
        )
        .map((hook) => ({ matcher: group.matcher, hook })),
    );
  // The hook stops itself before the harness would kill it.
  const outlastsBudget = (seconds: unknown) =>
    expect(Number(seconds) * 1000).toBeGreaterThan(HOOK_BUDGET_MS);

  it("wires Claude Code's PostToolUse edit hook in exec form", () => {
    const settings = readJson(".claude/settings.json");
    expect(settings.env).toMatchObject({ MCP_TIMEOUT: "120000" });
    const found = editHooks(settings.hooks?.PostToolUse);
    expect(found).toHaveLength(1);
    expect(found[0].matcher).toBe("Edit|Write");
    expect(found[0].hook).toMatchObject({
      type: "command",
      command: "node",
      args: [
        "${CLAUDE_PROJECT_DIR}/scripts/agent-hooks/after-edit.mjs",
        "claude",
      ],
    });
    outlastsBudget(found[0].hook.timeout);
  });

  it("wires Codex's PostToolUse edit hook for apply_patch", () => {
    const hooks = readJson(".codex/hooks.json");
    const found = editHooks(hooks.hooks?.PostToolUse);
    expect(found).toHaveLength(1);
    expect(found[0].matcher).toBe("^apply_patch$");
    expect(found[0].hook).toMatchObject({
      type: "command",
      command:
        'node "$(git rev-parse --show-toplevel)/scripts/agent-hooks/after-edit.mjs" codex',
    });
    outlastsBudget(found[0].hook.timeout);
    // One representation per layer: no inline [hooks] in config.toml.
    expect(readFileSync(".codex/config.toml", "utf8")).not.toMatch(
      /^\[\[?hooks/m,
    );
  });

  it("wires Cursor's afterFileEdit edit hook", () => {
    const hooks = readJson(".cursor/hooks.json");
    expect(hooks.version).toBe(1);
    const found = (hooks.hooks?.afterFileEdit ?? []).filter(
      (hook: { command?: string }) =>
        hook.command?.includes("scripts/agent-hooks/after-edit.mjs"),
    );
    expect(found).toHaveLength(1);
    expect(found[0].command).toBe(
      "node scripts/agent-hooks/after-edit.mjs cursor",
    );
    outlastsBudget(found[0].timeout);
  });
});
