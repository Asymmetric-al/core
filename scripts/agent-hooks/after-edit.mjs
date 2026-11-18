#!/usr/bin/env node
// Edit-time hook shared by Claude Code, Codex and Cursor. After an agent edits
// a file, it applies the pre-commit commands to that one file: ESLint --fix
// (for source under apps/, packages/ and tooling/) and then Prettier --write.
// Remaining lint errors go back to the agent in a few lines.
//
// It never blocks or fails an edit: a missing tool, an unreadable payload or
// any unexpected error exits 0 without output. It makes no network call and
// never runs the `next` CLI, a build, a typecheck or tests.
//
// Usage: node scripts/agent-hooks/after-edit.mjs <claude|codex|cursor>
// ASYM_EDIT_HOOK=format skips the lint step; ASYM_EDIT_HOOK=off skips both.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const LINT_MARKER = ["tooling", "eslint-config", "lint.mjs"];
const LINTED = /^(?:apps|packages|tooling)\/.+\.(?:ts|tsx|js|jsx|mjs|cjs)$/;
// Generated, mirrored and vendored trees (docs/ai/protected-paths.md), build
// output and Next.js's own files: the hook never writes there.
const NEVER_SEGMENTS = new Set([".git", ".next", ".turbo", "node_modules"]);
const NEVER_PREFIXES = [
  ".agents/",
  ".agent/",
  ".next-docs/",
  ".claude/skills/",
  ".cursor/skills/",
  ".claude/commands/",
  ".claude/agents/",
  "vendor/",
];
const NEVER_FILES = new Set(["apps/admin/payload-types.ts"]);
const SUMMARY_ERRORS = 8;
const TOOL_TIMEOUT_MS = 90_000;

function parseJson(text) {
  try {
    const value = JSON.parse(text);
    return value && typeof value === "object" ? value : null;
  } catch {
    return null;
  }
}

function resolveFrom(base, file) {
  if (typeof file !== "string" || file.trim() === "") return null;
  return path.resolve(typeof base === "string" ? base : process.cwd(), file);
}

/** Files written by apply_patch: added, updated, and moved-to paths. */
function patchedFiles(command) {
  const text = Array.isArray(command) ? command.join("\n") : String(command);
  const files = [];
  let updated = null;
  for (const line of text.split(/\r?\n/)) {
    const match =
      /^\*\*\* (Add File|Update File|Move to|Delete File): (.+)$/.exec(
        line.trim(),
      );
    if (!match) continue;
    const [, kind, file] = match;
    if (kind === "Move to" && updated !== null) files[updated] = file.trim();
    else if (kind === "Add File" || kind === "Update File") {
      files.push(file.trim());
      updated = kind === "Update File" ? files.length - 1 : null;
      continue;
    }
    updated = null;
  }
  return files;
}

/** Absolute paths of the files the harness payload says were edited. */
export function parsePayload(harness, text) {
  const payload = parseJson(text);
  if (!payload) return [];
  let files = [];
  let base = payload.cwd;
  if (harness === "claude") files = [payload.tool_input?.file_path];
  else if (harness === "codex") {
    if (payload.tool_name !== "apply_patch") return [];
    const command = payload.tool_input?.command;
    if (command === undefined || command === null) return [];
    files = patchedFiles(command);
  } else if (harness === "cursor") {
    files = [payload.file_path];
    base = Array.isArray(payload.workspace_roots)
      ? payload.workspace_roots[0]
      : undefined;
  } else return [];
  return files
    .map((file) => resolveFrom(base, file))
    .filter((file) => file !== null);
}

function isFile(file) {
  try {
    return statSync(file).isFile();
  } catch {
    return false;
  }
}

/** The nearest ancestor that is a Core checkout (it holds the lint runner). */
export function findCheckoutRoot(file, exists = existsSync) {
  let directory = path.dirname(path.resolve(file));
  for (;;) {
    if (exists(path.join(directory, ...LINT_MARKER))) return directory;
    const parent = path.dirname(directory);
    if (parent === directory) return null;
    directory = parent;
  }
}

export function classifyEdit(root, file, exists = isFile) {
  const relative = path.relative(root, file).split(path.sep).join("/");
  if (
    relative === "" ||
    relative.startsWith("../") ||
    path.isAbsolute(relative)
  )
    return { action: "skip", reason: "outside the checkout" };
  if (
    relative.split("/").some((segment) => NEVER_SEGMENTS.has(segment)) ||
    NEVER_PREFIXES.some((prefix) => relative.startsWith(prefix)) ||
    NEVER_FILES.has(relative)
  )
    return { action: "skip", reason: "generated, mirrored or vendored" };
  if (!exists(file)) return { action: "skip", reason: "deleted" };
  return { action: LINTED.test(relative) ? "lint-and-format" : "format" };
}

/**
 * The pre-commit commands for one file, run with Node directly (no `.cmd`
 * shims, so Windows needs no shell). ESLint gets the arguments
 * tooling/eslint-config/lint.mjs builds from the repository root, without its
 * design-system health probe, which pre-commit and CI still run.
 */
export function buildCommands({
  root,
  file,
  action,
  node,
  tools,
  lint = true,
}) {
  if (!tools.prettier) return [];
  const commands = [];
  if (action === "lint-and-format" && lint && tools.eslint)
    commands.push({
      tool: "eslint",
      command: node,
      args: [
        path.join(root, "node_modules", "eslint", "bin", "eslint.js"),
        "--config",
        path.join(root, "eslint.config.mjs"),
        "--suppressions-location",
        path.join(root, "tooling", "eslint-config", "suppressions.json"),
        "--fix",
        "--format",
        "json",
        file,
      ],
      cwd: root,
    });
  commands.push({
    tool: "prettier",
    command: node,
    args: [
      path.join(root, "node_modules", "prettier", "bin", "prettier.cjs"),
      "--ignore-unknown",
      "--write",
      file,
    ],
    cwd: root,
  });
  return commands;
}

/** A few lines naming the lint errors left after --fix, or none. */
export function summarizeEslint(output, root) {
  const results = (() => {
    try {
      const parsed = JSON.parse(output);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();
  const lines = [];
  for (const result of results) {
    const errors = (result.messages ?? []).filter(
      (message) => message.severity === 2,
    );
    if (errors.length === 0) continue;
    const name = path
      .relative(root, result.filePath ?? "")
      .split(path.sep)
      .join("/");
    lines.push(
      `${name}: ${errors.length} ESLint error${errors.length === 1 ? "" : "s"} remain${errors.length === 1 ? "s" : ""} after --fix:`,
    );
    for (const error of errors.slice(0, SUMMARY_ERRORS))
      lines.push(
        `  ${error.line ?? 0}:${error.column ?? 0} ${error.ruleId ? `${error.ruleId} ` : ""}${String(error.message).split("\n")[0]}`,
      );
    if (errors.length > SUMMARY_ERRORS)
      lines.push(`  …and ${errors.length - SUMMARY_ERRORS} more`);
  }
  return lines;
}

/**
 * Claude Code and Codex add PostToolUse `additionalContext` next to the tool
 * result without replacing it. Cursor's afterFileEdit documents no output,
 * so its summary goes to the hook log only.
 */
export function hookResponse(harness, lines) {
  if (lines.length === 0) return { exit: 0, stdout: "", stderr: "" };
  const text = lines.join("\n");
  if (harness === "claude" || harness === "codex")
    return {
      exit: 0,
      stdout: JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PostToolUse",
          additionalContext: text,
        },
      }),
      stderr: "",
    };
  return { exit: 0, stdout: "", stderr: `${text}\n` };
}

function installedTools(root) {
  return {
    eslint: isFile(
      path.join(root, "node_modules", "eslint", "bin", "eslint.js"),
    ),
    prettier: isFile(
      path.join(root, "node_modules", "prettier", "bin", "prettier.cjs"),
    ),
  };
}

function run(command) {
  return spawnSync(command.command, command.args, {
    cwd: command.cwd,
    encoding: "utf8",
    shell: false,
    timeout: TOOL_TIMEOUT_MS,
    maxBuffer: 16 * 1024 * 1024,
    windowsHide: true,
  });
}

function prettierFailure(result, root, file) {
  if (result.status !== 2) return [];
  const first = String(result.stderr ?? "")
    .split(/\r?\n/)
    .find((line) => line.trim() !== "");
  const name = path.relative(root, file).split(path.sep).join("/");
  return [
    `${name}: Prettier could not format it${first ? `: ${first.trim()}` : ""}`,
  ];
}

export function afterEdit({ harness, input, env = process.env }) {
  const mode = env.ASYM_EDIT_HOOK ?? "";
  if (mode === "off") return hookResponse(harness, []);
  const lines = [];
  for (const file of parsePayload(harness, input)) {
    const root = findCheckoutRoot(file);
    if (!root) continue;
    const { action } = classifyEdit(root, file);
    if (action === "skip") continue;
    for (const command of buildCommands({
      root,
      file,
      action,
      node: process.execPath,
      tools: installedTools(root),
      lint: mode !== "format",
    })) {
      const result = run(command);
      if (result.error) break;
      if (command.tool === "eslint")
        lines.push(...summarizeEslint(result.stdout, root));
      else lines.push(...prettierFailure(result, root, file));
    }
  }
  return hookResponse(harness, lines);
}

function main() {
  let response;
  try {
    response = afterEdit({
      harness: process.argv[2],
      input: readFileSync(0, "utf8"),
    });
  } catch {
    response = { exit: 0, stdout: "", stderr: "" };
  }
  if (response.stdout) process.stdout.write(response.stdout);
  if (response.stderr) process.stderr.write(response.stderr);
  return response.exit;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  process.exitCode = main();
