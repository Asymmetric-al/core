#!/usr/bin/env node
// Edit-time hook shared by Claude Code, Codex and Cursor. After an agent edits
// files in this checkout, it formats them with Prettier (--write) and then
// lints the source files under apps/, packages/ and tooling/ with ESLint in
// one run, reporting what is left to the agent in a few lines.
//
// It applies no ESLint fixes. Every autofix in the root configuration can
// remove, move or rewrite code (unused-import removal, import ordering and
// merging, type-import rewrites, let/const and similar rewrites); mid-task
// that deletes an import the agent is about to use or invalidates its next
// edit. Those problems are reported instead, and pre-commit's `eslint --fix`
// applies the fixes once the code is complete. Layout is Prettier's job.
//
// It never blocks or fails an edit: a missing tool, an unreadable payload or
// any unexpected error exits 0 without output. It stops within a time budget
// below the harness timeout and says what it did not check. It acts only on
// files inside the checkout that holds this script, makes no network call
// and never runs the `next` CLI, a build, a typecheck or tests.
//
// Usage: node scripts/agent-hooks/after-edit.mjs <claude|codex|cursor>
// ASYM_EDIT_HOOK=format skips the lint step; ASYM_EDIT_HOOK=off skips both.
import { spawnSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// The checkout this script belongs to; the hook acts on no other tree.
export const HOOK_ROOT = path.resolve(
  fileURLToPath(new URL("../../", import.meta.url)),
);
const LINTED = /^(?:apps|packages|tooling)\/.+\.(?:ts|tsx|js|jsx|mjs|cjs)$/;
// Generated, mirrored and vendored trees (docs/ai/protected-paths.md), build
// output and Next.js's own files: the hook never writes there.
const NEVER_SEGMENTS = new Set([".git", ".next", ".turbo", "node_modules"]);
const NEVER_PREFIXES = [
  ".agents/",
  ".agent/",
  ".next-docs/",
  ".claude/skills/",
  ".claude/commands/",
  ".claude/agents/",
  ".cursor/skills/",
  "vendor/",
];
const NEVER_FILES = new Set(["apps/admin/payload-types.ts"]);
const SUMMARY_PROBLEMS = 8;
// Every harness kills the hook at 120 s (.claude/settings.json,
// .codex/hooks.json, .cursor/hooks.json); stop well before that.
export const HOOK_BUDGET_MS = 100_000;
// A tool is not started with less time than this left.
const MIN_TOOL_MS = 5_000;

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

/**
 * Files written by apply_patch: added, updated, and moved-to paths. File
 * headers start at the beginning of a line; a content or context line that
 * only looks like one is indented or prefixed, so it is not matched.
 */
function patchedFiles(command) {
  const text = Array.isArray(command) ? command.join("\n") : String(command);
  const files = [];
  let updated = null;
  for (const line of text.split(/\r?\n/)) {
    const match =
      /^\*\*\* (Add File|Update File|Move to|Delete File): (.+)$/.exec(line);
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
  return [
    ...new Set(
      files
        .map((file) => resolveFrom(base, file))
        .filter((file) => file !== null),
    ),
  ];
}

function isFile(file) {
  try {
    return statSync(file).isFile();
  } catch {
    return false;
  }
}

function relativeName(root, file) {
  return path.relative(root, file).split(path.sep).join("/");
}

export function classifyEdit(root, file, exists = isFile) {
  const relative = relativeName(root, file);
  if (
    relative === "" ||
    relative === ".." ||
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
 * One Prettier run over every handled file, then one ESLint run over the
 * source files, both with Node directly (no `.cmd` shims, so Windows needs no
 * shell). ESLint gets the arguments tooling/eslint-config/lint.mjs builds
 * from the repository root, without --fix and without its design-system
 * health probe, which pre-commit and CI still run.
 */
export function buildCommands({ root, edits, node, tools, lint = true }) {
  if (!tools.prettier) return [];
  const commands = [
    {
      tool: "prettier",
      files: edits.map((edit) => edit.file),
      command: node,
      args: [
        path.join(root, "node_modules", "prettier", "bin", "prettier.cjs"),
        "--ignore-unknown",
        "--write",
        ...edits.map((edit) => edit.file),
      ],
      cwd: root,
    },
  ];
  const linted = edits
    .filter((edit) => edit.action === "lint-and-format")
    .map((edit) => edit.file);
  if (lint && tools.eslint && linted.length > 0)
    commands.push({
      tool: "eslint",
      files: linted,
      command: node,
      args: [
        path.join(root, "node_modules", "eslint", "bin", "eslint.js"),
        "--config",
        path.join(root, "eslint.config.mjs"),
        "--suppressions-location",
        path.join(root, "tooling", "eslint-config", "suppressions.json"),
        "--format",
        "json",
        ...linted,
      ],
      cwd: root,
    });
  return commands;
}

/**
 * A few lines per file naming the ESLint errors and the fixable problems the
 * hook left in place, or none.
 */
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
    const problems = (result.messages ?? []).filter(
      (message) => message.severity === 2 || message.fix,
    );
    if (problems.length === 0) continue;
    const errors = problems.filter((message) => message.severity === 2).length;
    const fixable = problems.filter((message) => message.fix).length;
    const counts = [
      errors > 0 ? `${errors} ESLint error${errors === 1 ? "" : "s"}` : "",
      fixable > 0
        ? `${fixable} fixable problem${fixable === 1 ? "" : "s"} not fixed (pre-commit's eslint --fix applies ${fixable === 1 ? "it" : "them"})`
        : "",
    ].filter(Boolean);
    lines.push(
      `${relativeName(root, result.filePath ?? "")}: ${counts.join(", ")}:`,
    );
    for (const problem of problems.slice(0, SUMMARY_PROBLEMS))
      lines.push(
        `  ${problem.line ?? 0}:${problem.column ?? 0} ${problem.ruleId ? `${problem.ruleId} ` : ""}${String(problem.message).split("\n")[0]}${problem.fix ? " [fixable, not fixed]" : ""}`,
      );
    if (problems.length > SUMMARY_PROBLEMS)
      lines.push(`  …and ${problems.length - SUMMARY_PROBLEMS} more`);
  }
  return lines;
}

function prettierFailure(result) {
  if (result.status !== 2) return [];
  const errors = String(result.stderr ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== "")
    .slice(0, 3);
  return [
    `Prettier could not format every edited file${errors.length ? ":" : "."}`,
    ...errors.map((line) => `  ${line}`),
  ];
}

/**
 * Claude Code and Codex add PostToolUse `additionalContext` next to the tool
 * result without replacing it. Cursor's afterFileEdit documents no output
 * (https://cursor.com/docs/agent/hooks), so its summary goes to the hook's
 * stderr, which Cursor does not pass to the agent.
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

function runTool(command, timeout) {
  return spawnSync(command.command, command.args, {
    cwd: command.cwd,
    encoding: "utf8",
    shell: false,
    timeout,
    maxBuffer: 16 * 1024 * 1024,
    windowsHide: true,
  });
}

function notChecked(root, command, why) {
  const names = command.files.map((file) => relativeName(root, file));
  const verb = command.tool === "eslint" ? "lint" : "format";
  return [
    `The edit hook did not ${verb} ${names.join(", ")}: ${why}. Pre-commit and CI still ${verb} ${names.length === 1 ? "it" : "them"}.`,
  ];
}

export function afterEdit({
  harness,
  input,
  env = process.env,
  root = HOOK_ROOT,
  exists = isFile,
  tools = installedTools,
  run = runTool,
  clock = Date.now,
  budgetMs = HOOK_BUDGET_MS,
}) {
  const deadline = clock() + budgetMs;
  const mode = env.ASYM_EDIT_HOOK ?? "";
  if (mode === "off") return hookResponse(harness, []);
  const edits = parsePayload(harness, input)
    .map((file) => ({ file, ...classifyEdit(root, file, exists) }))
    .filter((edit) => edit.action !== "skip");
  if (edits.length === 0) return hookResponse(harness, []);
  const lines = [];
  for (const command of buildCommands({
    root,
    edits,
    node: process.execPath,
    tools: tools(root),
    lint: mode !== "format",
  })) {
    const left = deadline - clock();
    if (left < MIN_TOOL_MS) {
      lines.push(
        ...notChecked(root, command, `its ${budgetMs / 1000} s budget ran out`),
      );
      continue;
    }
    const result = run(command, left);
    const name = command.tool === "eslint" ? "ESLint" : "Prettier";
    if (result.error?.code === "ETIMEDOUT") {
      lines.push(
        ...notChecked(
          root,
          command,
          `${name} did not finish within the hook's ${budgetMs / 1000} s budget`,
        ),
      );
      continue;
    }
    if (result.error || result.signal) continue;
    if (command.tool === "eslint" && result.status === 2) {
      // ESLint's exit 2 is a configuration or internal failure, not findings.
      const first = String(result.stderr ?? "")
        .split(/\r?\n/)
        .find((line) => line.trim() !== "");
      lines.push(
        ...notChecked(
          root,
          command,
          `${name} failed${first ? ` (${first.trim()})` : ""}`,
        ),
      );
    } else if (command.tool === "eslint")
      lines.push(...summarizeEslint(result.stdout, root));
    else lines.push(...prettierFailure(result));
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
