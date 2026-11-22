import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

import {
  commentBaselineFile,
  inCommentBanScope,
} from "../../tooling/eslint-config/no-comments.mjs";
import {
  bannedIn,
  mayHoldComments,
  parseSource,
} from "../lib/source-comments.mjs";

const repositoryRoot = fileURLToPath(new URL("../../", import.meta.url));
const DEFAULT_BASE = "origin/develop";
const PUSHED_REVISION = /^(?!0{40}$)[0-9a-f]{40}$/;
const MAX_BUFFER = 256 * 1024 * 1024;
const SKILL = "docs/ai/skills/delete-comment/SKILL.md";
const WRITE_COMMAND = "bun run verify:comments -- --write";
const USAGE =
  "Usage: node scripts/verify/comment-ratchet.mjs [--write | --report] [--base <git ref>]";

function git(root, args) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: MAX_BUFFER,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function commentOnlyLines(text, comments) {
  const starts = [0];
  for (let index = text.indexOf("\n"); index !== -1;) {
    starts.push(index + 1);
    index = text.indexOf("\n", index + 1);
  }
  const covered = new Map();
  for (const comment of comments) {
    const [from, to] = comment.range;
    for (
      let line = comment.loc.start.line;
      line <= comment.loc.end.line;
      line += 1
    ) {
      const lineStart = starts[line - 1] ?? 0;
      const lineEnd = starts[line] ?? text.length;
      const spans = covered.get(line) ?? [];
      spans.push([Math.max(from, lineStart), Math.min(to, lineEnd)]);
      covered.set(line, spans);
    }
  }
  let lines = 0;
  for (const [line, spans] of covered) {
    let residue = "";
    let cursor = starts[line - 1] ?? 0;
    for (const [from, to] of spans.sort((a, b) => a[0] - b[0])) {
      residue += text.slice(cursor, from);
      cursor = Math.max(cursor, to);
    }
    residue += text.slice(cursor, starts[line] ?? text.length);
    if (/^[\s{}]*$/.test(residue)) lines += 1;
  }
  return lines;
}

export function measureComments(text, file) {
  if (!mayHoldComments(text)) return { count: 0, lines: 0 };
  const banned = bannedIn(parseSource(text, file), text, file);
  return { count: banned.length, lines: commentOnlyLines(text, banned) };
}

function measureTree(root) {
  const measured = new Map();
  const files = git(root, ["ls-files", "-z"])
    .split("\0")
    .filter((file) => file !== "" && inCommentBanScope(file));
  for (const file of files) {
    let text;
    try {
      text = readFileSync(path.join(root, file), "utf8");
    } catch (error) {
      if (error.code === "ENOENT") continue;
      throw error;
    }
    measured.set(file, measureComments(text, file));
  }
  return measured;
}

export function compareToBaseline(counts, baseline) {
  const mismatches = [];
  for (const file of new Set([
    ...Object.keys(counts),
    ...Object.keys(baseline),
  ])) {
    const count = counts[file] ?? 0;
    const recorded = baseline[file] ?? 0;
    if (count !== recorded) mismatches.push({ file, count, recorded });
  }
  return mismatches.sort((a, b) => (a.file < b.file ? -1 : 1));
}

export function parseNameStatus(output) {
  const fields = output.split("\0");
  const changes = [];
  for (let index = 0; index < fields.length - 1;) {
    const status = fields[index] ?? "";
    if (status.startsWith("R") || status.startsWith("C")) {
      changes.push({
        status: status[0],
        from: fields[index + 1],
        file: fields[index + 2],
      });
      index += 3;
    } else {
      changes.push({ status: status[0], file: fields[index + 1] });
      index += 2;
    }
  }
  return changes;
}

function mergeBase(root, ref) {
  return git(root, ["merge-base", ref, "HEAD"]).trim();
}

function resolveBase(root, requested, pushedFrom) {
  if (requested !== undefined) {
    try {
      return mergeBase(root, requested);
    } catch (error) {
      throw new Error(
        `Cannot find a merge base with ${requested}: ${String(error.stderr ?? error.message).trim()}`,
        { cause: error },
      );
    }
  }
  const candidates = PUSHED_REVISION.test(pushedFrom ?? "")
    ? [pushedFrom, DEFAULT_BASE]
    : [DEFAULT_BASE];
  for (const candidate of candidates) {
    try {
      return mergeBase(root, candidate);
    } catch {
      continue;
    }
  }
  return null;
}

function countAt(root, commit, file) {
  if (!inCommentBanScope(file)) return 0;
  const text = git(root, ["show", `${commit}:${file}`]);
  return measureComments(text, file).count;
}

function findGrowth(root, base, measured) {
  const grown = [];
  const changes = parseNameStatus(
    git(root, ["diff", "--name-status", "-M", "-z", base, "--"]),
  );
  for (const change of changes) {
    const count = measured.get(change.file)?.count ?? 0;
    if (change.status === "D" || count === 0) continue;
    const before =
      change.status === "A"
        ? 0
        : countAt(root, base, change.from ?? change.file);
    if (count > before) grown.push({ file: change.file, count, before });
  }
  return grown.sort((a, b) => (a.file < b.file ? -1 : 1));
}

function area(file) {
  const parts = file.split("/");
  if (parts.length === 1) return "(root)";
  return parts.length === 2 ? parts[0] : `${parts[0]}/${parts[1]}`;
}

function report(measured, log) {
  const areas = new Map();
  for (const [file, { count, lines }] of measured) {
    const entry = areas.get(area(file)) ?? {
      files: 0,
      commented: 0,
      comments: 0,
      lines: 0,
    };
    entry.files += 1;
    entry.commented += count > 0 ? 1 : 0;
    entry.comments += count;
    entry.lines += lines;
    areas.set(area(file), entry);
  }
  const rows = [...areas].sort(
    (a, b) => b[1].lines - a[1].lines || (a[0] < b[0] ? -1 : 1),
  );
  const total = { files: 0, commented: 0, comments: 0, lines: 0 };
  for (const [, entry] of rows) {
    for (const key of Object.keys(total)) total[key] += entry[key];
  }
  const table = [
    ["area", "files", "with comments", "comments", "comment-only lines"],
    ...rows.map(([name, entry]) => [
      name,
      entry.files,
      entry.commented,
      entry.comments,
      entry.lines,
    ]),
    ["total", total.files, total.commented, total.comments, total.lines],
  ].map((row) => row.map(String));
  const widths = table[0].map((_, column) =>
    Math.max(...table.map((row) => row[column].length)),
  );
  for (const row of table) {
    log(
      row
        .map((cell, column) =>
          column === 0
            ? cell.padEnd(widths[column])
            : cell.padStart(widths[column]),
        )
        .join("  "),
    );
  }
}

function readBaseline(root) {
  try {
    return JSON.parse(
      readFileSync(path.join(root, commentBaselineFile), "utf8"),
    );
  } catch (error) {
    if (error.code === "ENOENT") return {};
    throw new Error(`Cannot read ${commentBaselineFile}: ${error.message}`, {
      cause: error,
    });
  }
}

const total = (counts) =>
  Object.values(counts).reduce((sum, count) => sum + count, 0);

export function runCommentRatchet({
  root = repositoryRoot,
  args = [],
  env = process.env,
  log = console.log,
  error = console.error,
} = {}) {
  const { values } = parseArgs({
    args,
    options: {
      write: { type: "boolean" },
      report: { type: "boolean" },
      base: { type: "string" },
    },
  });
  if (values.write && values.report) throw new Error(USAGE);

  const measured = measureTree(root);
  if (values.report) {
    report(measured, log);
    return 0;
  }

  const counts = Object.fromEntries(
    [...measured]
      .filter(([, { count }]) => count > 0)
      .map(([file, { count }]) => [file, count])
      .sort((a, b) => (a[0] < b[0] ? -1 : 1)),
  );
  const requested = values.base ?? (env.COMMENT_RATCHET_BASE || undefined);
  const base = resolveBase(root, requested, env.COMMENT_RATCHET_PUSHED_FROM);
  if (base === null && values.write) {
    error(
      `comment ratchet: cannot write the baseline without a base to compare with. Fetch ${DEFAULT_BASE} or pass --base <git ref>.`,
    );
    return 1;
  }
  const grown = base === null ? [] : findGrowth(root, base, measured);
  if (base === null) {
    log(
      `comment ratchet: ${DEFAULT_BASE} is not available, so growth since the base was not checked.`,
    );
  }
  if (grown.length > 0) {
    error(
      `comment ratchet: ${grown.length} file(s) gained comments since ${base.slice(0, 12)}.`,
    );
    for (const { file, count, before } of grown) {
      error(`  ${file}: ${before} -> ${count}`);
    }
    error(
      `Comments are banned in source, so a file's count only goes down. Delete the new comments (${SKILL}).`,
    );
    return 1;
  }

  const baseline = readBaseline(root);
  if (values.write) {
    mkdirSync(path.dirname(path.join(root, commentBaselineFile)), {
      recursive: true,
    });
    writeFileSync(
      path.join(root, commentBaselineFile),
      `${JSON.stringify(counts, null, 2)}\n`,
    );
    log(
      `comment ratchet: baseline written: ${Object.keys(counts).length} files, ${total(counts)} comments (was ${Object.keys(baseline).length} files, ${total(baseline)} comments).`,
    );
    return 0;
  }

  const mismatches = compareToBaseline(counts, baseline);
  if (mismatches.length > 0) {
    error(
      `comment ratchet: ${commentBaselineFile} is out of date for ${mismatches.length} file(s).`,
    );
    for (const { file, count, recorded } of mismatches) {
      error(`  ${file}: baseline ${recorded}, now ${count}`);
    }
    error(`Run: ${WRITE_COMMAND}`);
    return 1;
  }
  log(
    `comment ratchet: ${Object.keys(counts).length} files, ${total(counts)} comments, none new.`,
  );
  return 0;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    process.exitCode = runCommentRatchet({ args: process.argv.slice(2) });
  } catch (failure) {
    console.error(`comment ratchet: ${failure.message}`);
    process.exitCode = 2;
  }
}
