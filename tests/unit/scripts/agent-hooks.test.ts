import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  buildCommands,
  classifyEdit,
  findCheckoutRoot,
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
afterEach(() => {
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
  it("finds the Core checkout that contains the edited file", () => {
    const marker = at("tooling/eslint-config/lint.mjs");
    const exists = (candidate: string) => candidate === marker;
    expect(findCheckoutRoot(at("apps/donor/app/page.tsx"), exists)).toBe(ROOT);
    expect(findCheckoutRoot(path.resolve("/elsewhere/file.ts"), exists)).toBe(
      null,
    );
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

  it("lints with the pre-commit lint configuration, then formats", () => {
    const file = at("apps/donor/app/page.tsx");
    const commands = buildCommands({
      root: ROOT,
      file,
      action: "lint-and-format",
      node,
      tools,
    });
    expect(commands.map((command: { tool: string }) => command.tool)).toEqual([
      "eslint",
      "prettier",
    ]);
    const [eslint, prettier] = commands;
    // The same ESLint arguments tooling/eslint-config/lint.mjs builds for a
    // root-relative file, which is what lint-staged runs at commit time.
    const invocation = lintInvocation({
      args: ["--fix", "--format", "json", file],
      cwd: ROOT,
      rootDir: ROOT,
    });
    expect(eslint).toEqual({
      tool: "eslint",
      command: node,
      args: [
        path.join(ROOT, "node_modules", "eslint", "bin", "eslint.js"),
        ...invocation.args,
      ],
      cwd: ROOT,
    });
    expect(prettier).toEqual({
      tool: "prettier",
      command: node,
      args: [
        path.join(ROOT, "node_modules", "prettier", "bin", "prettier.cjs"),
        "--ignore-unknown",
        "--write",
        file,
      ],
      cwd: ROOT,
    });
  });

  it("formats files outside the lint scope without linting them", () => {
    const commands = buildCommands({
      root: ROOT,
      file: at("docs/ci.md"),
      action: "format",
      node,
      tools,
    });
    expect(commands.map((command: { tool: string }) => command.tool)).toEqual([
      "prettier",
    ]);
  });

  it("does nothing when the tools are not installed", () => {
    const file = at("apps/donor/app/page.tsx");
    expect(
      buildCommands({
        root: ROOT,
        file,
        action: "lint-and-format",
        node,
        tools: { eslint: false, prettier: false },
      }),
    ).toEqual([]);
    expect(
      buildCommands({
        root: ROOT,
        file,
        action: "lint-and-format",
        node,
        tools: { eslint: false, prettier: true },
      }).map((command: { tool: string }) => command.tool),
    ).toEqual(["prettier"]);
  });

  it("lints nothing when the lint step is switched off", () => {
    expect(
      buildCommands({
        root: ROOT,
        file: at("apps/donor/app/page.tsx"),
        action: "lint-and-format",
        node,
        tools,
        lint: false,
      }).map((command: { tool: string }) => command.tool),
    ).toEqual(["prettier"]);
  });

  it("never calls the next CLI, a build, a typecheck, a test runner or the network", () => {
    const commands = buildCommands({
      root: ROOT,
      file: at("apps/admin/app/(app)/page.tsx"),
      action: "lint-and-format",
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

  it("summarizes remaining lint errors in a few lines", () => {
    expect(summarizeEslint(report, ROOT)).toEqual([
      "apps/donor/app/page.tsx: 2 ESLint errors remain after --fix:",
      "  3:7 no-undef 'x' is not defined.",
      "  9:2 Parsing error: ';' expected.",
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
    const lines = [
      "a.ts: 1 ESLint error remains after --fix:",
      "  1:1 no-undef x",
    ];
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

describe("edit hook process", () => {
  function runHook(harness: string, input: string, env = {}) {
    return spawnSync(process.execPath, [HOOK, harness], {
      input,
      encoding: "utf8",
      env: { ...process.env, ...env },
      timeout: 60_000,
    });
  }

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

describe("harness hook configuration", () => {
  const readJson = (file: string) => JSON.parse(readFileSync(file, "utf8"));

  it("wires Claude Code's one PostToolUse edit hook in exec form", () => {
    const settings = readJson(".claude/settings.json");
    expect(settings.env).toEqual({ MCP_TIMEOUT: "120000" });
    expect(Object.keys(settings.hooks)).toEqual(["PostToolUse"]);
    expect(settings.hooks.PostToolUse).toEqual([
      {
        matcher: "Edit|Write",
        hooks: [
          {
            type: "command",
            command: "node",
            args: [
              "${CLAUDE_PROJECT_DIR}/scripts/agent-hooks/after-edit.mjs",
              "claude",
            ],
            timeout: 120,
          },
        ],
      },
    ]);
  });

  it("wires Codex's one PostToolUse edit hook for apply_patch", () => {
    const hooks = readJson(".codex/hooks.json");
    expect(Object.keys(hooks.hooks)).toEqual(["PostToolUse"]);
    expect(hooks.hooks.PostToolUse).toEqual([
      {
        matcher: "^apply_patch$",
        hooks: [
          {
            type: "command",
            command:
              'node "$(git rev-parse --show-toplevel)/scripts/agent-hooks/after-edit.mjs" codex',
            timeout: 120,
            statusMessage: "Formatting and linting the edited file",
          },
        ],
      },
    ]);
    // One representation per layer: no inline [hooks] in config.toml.
    expect(readFileSync(".codex/config.toml", "utf8")).not.toMatch(
      /^\[\[?hooks/m,
    );
  });

  it("wires Cursor's one afterFileEdit hook", () => {
    expect(readJson(".cursor/hooks.json")).toEqual({
      version: 1,
      hooks: {
        afterFileEdit: [
          {
            command: "node scripts/agent-hooks/after-edit.mjs cursor",
            timeout: 120,
          },
        ],
      },
    });
  });
});
