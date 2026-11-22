import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import * as prettier from "prettier";

import { inCommentBanScope } from "../tooling/eslint-config/no-comments.mjs";

import {
  bannedIn,
  mayHoldComments,
  parseSource,
} from "./lib/source-comments.mjs";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const MAX_BUFFER = 256 * 1024 * 1024;
const USAGE =
  "Usage: node scripts/delete-comments.mjs <list | strip> <path> [<path> ...]";
const POSITION_KEYS = new Set([
  "loc",
  "range",
  "raw",
  "tokens",
  "comments",
  "parent",
]);
const DROPPED = Symbol("dropped");

function isEmptyJsxContainer(node) {
  return (
    node.type === "JSXExpressionContainer" &&
    node.expression?.type === "JSXEmptyExpression"
  );
}

function walk(node, visit) {
  if (Array.isArray(node)) {
    for (const child of node) walk(child, visit);
    return;
  }
  if (node === null || typeof node !== "object") return;
  if (typeof node.type === "string") visit(node);
  for (const [key, value] of Object.entries(node)) {
    if (!POSITION_KEYS.has(key)) walk(value, visit);
  }
}

function removalSpans(ast, banned) {
  const remaining = new Set(banned);
  const spans = [];
  walk(ast.body, (node) => {
    if (!isEmptyJsxContainer(node)) return;
    const inside = (ast.comments ?? []).filter(
      (comment) =>
        comment.range[0] >= node.range[0] && comment.range[1] <= node.range[1],
    );
    const owned = banned.filter((comment) =>
      inside.some((candidate) => candidate.range[0] === comment.range[0]),
    );
    if (owned.length === 0 || owned.length !== inside.length) return;
    for (const comment of owned) remaining.delete(comment);
    spans.push([...node.range]);
  });
  for (const comment of remaining) spans.push([...comment.range]);
  return spans.sort((a, b) => b[0] - a[0]);
}

export function stripComments(text, file) {
  if (!mayHoldComments(text)) return { removed: 0, text };
  const ast = parseSource(text, file);
  const banned = bannedIn(ast, text, file);
  let stripped = text;
  for (const [from, to] of removalSpans(ast, banned)) {
    const lineStart = stripped.lastIndexOf("\n", from - 1) + 1;
    const newline = stripped.indexOf("\n", to);
    const lineEnd = newline === -1 ? stripped.length : newline;
    const before = stripped.slice(lineStart, from);
    const after = stripped.slice(to, lineEnd);
    if (after.trim() !== "") {
      stripped = stripped.slice(0, from) + stripped.slice(to);
    } else if (before.trim() === "") {
      stripped =
        stripped.slice(0, lineStart) +
        stripped.slice(newline === -1 ? lineEnd : lineEnd + 1);
    } else {
      stripped =
        stripped.slice(0, lineStart + before.trimEnd().length) +
        (after.endsWith("\r") ? "\r" : "") +
        stripped.slice(lineEnd);
    }
  }
  return { removed: banned.length, text: stripped };
}

function cleanJsxText(value) {
  const lines = value.split(/\r\n|\n|\r/);
  const lastFilled = lines.findLastIndex((line) => /[^ \t]/.test(line));
  let text = "";
  for (const [index, line] of lines.entries()) {
    let trimmed = line.replaceAll("\t", " ");
    if (index !== 0) trimmed = trimmed.replace(/^ +/, "");
    if (index !== lines.length - 1) trimmed = trimmed.replace(/ +$/, "");
    if (trimmed !== "") text += index === lastFilled ? trimmed : `${trimmed} `;
  }
  return text;
}

function normalize(node) {
  if (Array.isArray(node)) {
    return node.map(normalize).filter((child) => child !== DROPPED);
  }
  if (typeof node === "bigint") return `${node}n`;
  if (node === null || typeof node !== "object") return node;
  if (node instanceof RegExp) return String(node);
  if (isEmptyJsxContainer(node)) return DROPPED;
  if (node.type === "JSXText") {
    const value = cleanJsxText(node.value);
    return value === "" ? DROPPED : { type: "JSXText", value };
  }
  const normalized = {};
  for (const [key, value] of Object.entries(node)) {
    if (POSITION_KEYS.has(key)) continue;
    const child = normalize(value);
    normalized[key] = child === DROPPED ? null : child;
  }
  return normalized;
}

export function sameProgram(before, after, file) {
  return (
    JSON.stringify(normalize(parseSource(before, file).body)) ===
    JSON.stringify(normalize(parseSource(after, file).body))
  );
}

export function listComments(text, file) {
  if (!mayHoldComments(text)) return [];
  return bannedIn(parseSource(text, file), text, file).map((comment) => ({
    file,
    line: comment.loc.start.line,
    endLine: comment.loc.end.line,
    kind:
      comment.type === "Block" && comment.value.startsWith("*")
        ? "JSDoc"
        : comment.type,
    text: comment.value,
  }));
}

async function format(root, file, text) {
  const filepath = path.join(root, file);
  const info = await prettier.getFileInfo(filepath, {
    ignorePath: path.join(root, ".prettierignore"),
  });
  if (info.ignored || info.inferredParser === null) return text;
  const options = await prettier.resolveConfig(filepath);
  return prettier.format(text, { ...options, filepath });
}

function sourceFiles(root, paths) {
  const files = execFileSync("git", ["ls-files", "-z", "--", ...paths], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: MAX_BUFFER,
  })
    .split("\0")
    .filter((file) => file !== "" && inCommentBanScope(file));
  if (files.length === 0) {
    throw new Error(
      `No tracked source file in the comment ban's scope is under: ${paths.join(", ")}`,
    );
  }
  return files;
}

export async function runDeleteComments({
  root = repositoryRoot,
  args = [],
  log = console.log,
  error = console.error,
} = {}) {
  const [command, ...paths] = args;
  if (!["list", "strip"].includes(command) || paths.length === 0) {
    throw new Error(USAGE);
  }
  const files = sourceFiles(root, paths);

  if (command === "list") {
    log(
      JSON.stringify(
        files.flatMap((file) =>
          listComments(readFileSync(path.join(root, file), "utf8"), file),
        ),
        null,
        2,
      ),
    );
    return 0;
  }

  let comments = 0;
  let written = 0;
  const unsafe = [];
  for (const file of files) {
    const text = readFileSync(path.join(root, file), "utf8");
    const { removed, text: stripped } = stripComments(text, file);
    if (removed === 0) continue;
    const formatted = await format(root, file, stripped);
    if (!sameProgram(text, formatted, file)) {
      unsafe.push(file);
      continue;
    }
    writeFileSync(path.join(root, file), formatted);
    comments += removed;
    written += 1;
  }
  log(`delete-comments: removed ${comments} comments from ${written} file(s).`);
  if (unsafe.length === 0) return 0;
  error(
    `delete-comments: left ${unsafe.length} file(s) unchanged, because removing their comments would change the code:`,
  );
  for (const file of unsafe) error(`  ${file}`);
  error(
    "Remove those comments by hand and check the JSX text beside each one.",
  );
  return 1;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    process.exitCode = await runDeleteComments({ args: process.argv.slice(2) });
  } catch (failure) {
    console.error(`delete-comments: ${failure.message}`);
    process.exitCode = 2;
  }
}
