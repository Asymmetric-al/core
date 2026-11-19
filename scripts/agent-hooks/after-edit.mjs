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
// any unexpected error exits 0 without output. It names each file Prettier
// rewrote, so the agent re-reads it before its next edit, and says when a
// tool did not run or finish, so an unchecked edit never reads as clean. It
// stops within a time budget below the harness timeout. It acts only on
// files whose real path is inside the checkout that holds this script, makes
// no network call and never runs the `next` CLI, a build, a typecheck or
// tests.
//
// Usage: node scripts/agent-hooks/after-edit.mjs <claude|codex|cursor>
// ASYM_EDIT_HOOK=format skips the lint step; ASYM_EDIT_HOOK=off skips both.
import { spawnSync } from "node:child_process";
import { readFileSync, realpathSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * The real path of a file, or of its nearest existing ancestor joined with
 * the rest, so a checkout reached through a symlink or junction and a link
 * inside it that points elsewhere are both judged by where they lead.
 */
export function realPath(file) {
  const missing = [];
  let current = path.resolve(file);
  for (;;) {
    try {
      return path.join(realpathSync(current), ...missing.reverse());
    } catch {
      const parent = path.dirname(current);
      if (parent === current) return path.resolve(file);
      missing.push(path.basename(current));
      current = parent;
    }
  }
}

// The checkout this script belongs to; the hook acts on no other tree.
export const HOOK_ROOT = realPath(
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

const PATCH_HEADER = /^\*\*\* (Add File|Delete File|Update File): (.+)$/;
const MOVE_HEADER = /^\*\*\* Move to: (.+)$/;

/**
 * Files written by apply_patch: added, updated, and moved-to paths. Headers
 * follow the grammar Codex's apply_patch accepts (openai/codex,
 * codex-rs/apply-patch/src/streaming_parser.rs, `process_line`, read
 * 2026-11-18): nothing counts before "*** Begin Patch" or after
 * "*** End Patch"; after "*** Begin Patch", "*** Add File" and
 * "*** Delete File" a header is matched on the trimmed line; inside an
 * "*** Update File" hunk only trailing whitespace is removed, so an indented
 * header there is a context line, and "*** Move to" counts only before the
 * hunk's first change line. Content lines ("+", "-", " ") never match.
 */
function patchedFiles(command) {
  const text = Array.isArray(command) ? command.join("\n") : String(command);
  const files = [];
  let state = "before";
  let movable = null;
  for (const line of text.split(/\r?\n/)) {
    if (state === "before") {
      if (line.trim() === "*** Begin Patch") state = "patch";
      continue;
    }
    if (state === "ended") break;
    const header = state === "update" ? line.trimEnd() : line.trim();
    if (header === "*** End Patch") {
      state = "ended";
      continue;
    }
    const match = PATCH_HEADER.exec(header);
    if (match) {
      const [, kind, file] = match;
      if (kind !== "Delete File") files.push(file);
      movable = kind === "Update File" ? files.length - 1 : null;
      state = kind === "Update File" ? "update" : "patch";
      continue;
    }
    if (state !== "update") continue;
    const move = movable === null ? null : MOVE_HEADER.exec(header);
    if (move) files[movable] = move[1];
    movable = null;
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

/**
 * What the hook does with one edited file. Both paths are compared by their
 * real paths (`real`), so a link into the checkout is handled and a link
 * inside it that leads elsewhere is outside.
 */
export function classifyEdit(root, file, exists = isFile, real = realPath) {
  const relative = relativeName(real(root), real(file));
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
      // With --write, --list-different prints each file Prettier rewrote.
      args: [
        path.join(root, "node_modules", "prettier", "bin", "prettier.cjs"),
        "--ignore-unknown",
        "--write",
        "--list-different",
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
 * ESLint's `--format json` results, or null when the output is not a
 * complete result list.
 */
export function eslintResults(output) {
  try {
    const parsed = JSON.parse(output);
    return Array.isArray(parsed) &&
      parsed.every(
        (result) =>
          result &&
          typeof result === "object" &&
          typeof result.filePath === "string" &&
          Array.isArray(result.messages),
      )
      ? parsed
      : null;
  } catch {
    return null;
  }
}

/**
 * A few lines per file naming the ESLint errors and the fixable problems the
 * hook left in place, or none.
 */
export function summarizeEslint(output, root) {
  const results = eslintResults(output) ?? [];
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

function outputLines(text) {
  return String(text ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== "");
}

/**
 * One line per file Prettier rewrote (with --write, --list-different prints
 * each one relative to the hook's cwd), then any formatting failure. The
 * harness still holds the text the agent wrote, so the agent must re-read a
 * rewritten file before its next edit or that edit will not match.
 */
export function summarizePrettier(result, command, root) {
  const names = new Map(
    command.files.flatMap((file) => {
      const relative = relativeName(root, file);
      return [
        [relative, relative],
        [file.split(path.sep).join("/"), relative],
      ];
    }),
  );
  const lines = outputLines(result.stdout)
    .map((line) => line.split(path.sep).join("/"))
    .map((name) => names.get(name))
    .filter((name) => name !== undefined)
    .map(
      (name) =>
        `${name}: reformatted by Prettier; re-read it before the next edit.`,
    );
  if (result.status !== 2) return lines;
  const errors = outputLines(result.stderr).slice(0, 3);
  return [
    ...lines,
    `Prettier could not format every edited file${errors.length ? ":" : "."}`,
    ...errors.map((line) => `  ${line}`),
  ];
}

/** ESLint's report, or why the files were not linted. */
function eslintReport(result, command, root) {
  const results = eslintResults(result.stdout);
  const reason = outputLines(result.stderr)[0];
  if (results === null)
    return notChecked(
      root,
      command,
      result.status === 2
        ? `ESLint failed${reason ? ` (${reason})` : ""}`
        : "ESLint printed no readable results",
    );
  const lines = summarizeEslint(result.stdout, root);
  // ESLint 10 also exits 2 after printing complete results, for example
  // when an edit leaves a suppression count above what it suppresses.
  if (result.status === 2)
    lines.push(`ESLint exited 2 after linting${reason ? `: ${reason}` : ""}`);
  return lines;
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
  // The tools get each file's real path, so their output names it relative
  // to the checkout however the harness reached it.
  const edits = parsePayload(harness, input)
    .map((file) => ({
      file: realPath(file),
      ...classifyEdit(root, file, exists),
    }))
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
    // A tool that could not start, overflowed its output buffer (ENOBUFS)
    // or was killed checked nothing; say so rather than report a clean edit.
    if (result.error || result.signal) {
      lines.push(
        ...notChecked(
          root,
          command,
          result.error
            ? `${name} could not run (${result.error.code ?? result.error.message})`
            : `${name} was stopped by ${result.signal}`,
        ),
      );
      continue;
    }
    if (command.tool === "eslint")
      lines.push(...eslintReport(result, command, root));
    else lines.push(...summarizePrettier(result, command, root));
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

// Node runs the real path of the script it was given, so compare real paths:
// a hook started through a linked checkout still runs.
function invokedDirectly() {
  if (!process.argv[1]) return false;
  try {
    return (
      realpathSync(path.resolve(process.argv[1])) ===
      fileURLToPath(import.meta.url)
    );
  } catch {
    return false;
  }
}

if (invokedDirectly()) process.exitCode = main();
