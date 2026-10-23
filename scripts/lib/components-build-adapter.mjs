import { lstat, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const files = [
  "SKILL.md",
  "README.md",
  "AGENTS.md",
  "rules/overview.md",
  "rules/styling.md",
  "rules/npm.md",
  "rules/as-child.md",
  "rules/state.md",
  "rules/composition.md",
  "rules/_sections.md",
];
const noticeFiles = new Set(files.slice(0, 6));
const guidanceUrl = new URL(
  "../refresh-overlays/components-build-cn.json",
  import.meta.url,
);
const start = "<!-- CORE-COMPONENTS-CN-START -->";
const end = "<!-- CORE-COMPONENTS-CN-END -->";

function replaceReviewed(content, rule, relative) {
  const sources = [rule.upstream, ...(rule.previousCore ?? [])];
  const matches = sources.map((source) => ({
    source,
    count: content.split(source).length - 1,
  }));
  const count = matches.reduce((total, match) => total + match.count, 0);
  const coreCount = content.split(rule.core).length - 1;
  if (count === 0 && (rule.allowRepeatedCore ? coreCount > 0 : coreCount === 1))
    return content;
  if (count !== 1 || (!rule.allowRepeatedCore && coreCount > 0))
    throw new Error("Reviewed components-build guidance drifted: " + relative);
  return content.replace(
    matches.find((match) => match.count === 1).source,
    rule.core,
  );
}

function replaceReviewedTableRow(content, rule, relative) {
  const lines = content.split("\n");
  const rows = lines
    .map((line, index) => ({
      index,
      cells: line
        .trim()
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim()),
    }))
    .filter((row) => row.cells[0] === rule.upstreamCells[0]);
  const matches = (cells, expected) =>
    cells.length === expected.length &&
    cells.every((cell, index) => cell === expected[index]);
  if (rows.length !== 1)
    throw new Error("Reviewed components-build index drifted: " + relative);
  const row = rows[0];
  if (matches(row.cells, rule.coreCells)) return content;
  if (!matches(row.cells, rule.upstreamCells))
    throw new Error("Reviewed components-build index drifted: " + relative);
  lines[row.index] = "| " + rule.coreCells.join(" | ") + " |";
  return lines.join("\n");
}

function* scriptCodeBlocks(content) {
  let fence;
  let script = false;
  let lines = [];
  for (const line of content.split(/\r?\n/u)) {
    if (!fence) {
      const opening = /^ {0,3}(\x60{3,}|~{3,})(.*)$/u.exec(line);
      if (!opening) continue;
      fence = opening[1];
      script = /^(?:tsx?|jsx?|typescript|javascript)$/u.test(
        opening[2].trim().split(/\s+/u)[0],
      );
      lines = [];
      continue;
    }
    const closing = /^ {0,3}(\x60{3,}|~{3,})[ \t]*$/u.exec(line);
    if (
      closing &&
      closing[1][0] === fence[0] &&
      closing[1].length >= fence.length
    ) {
      if (script) yield lines.join("\n");
      fence = undefined;
    } else lines.push(line);
  }
  if (fence && script) yield lines.join("\n");
}

function assertCoreComposition(content, relative) {
  for (const code of scriptCodeBlocks(content)) {
    for (const imported of code.matchAll(
      /\bimport\s+([^;]+?)\s+from\s*(["'])([^"']+)\2/gu,
    )) {
      if (/\bcn\b/u.test(imported[1]) && imported[3] !== "@asym/ui/lib/utils")
        throw new Error("Unreviewed components-build cn import: " + relative);
    }
    if (/@radix-ui\/|<Slot\b|\basChild\b|\buseControllableState\b/u.test(code))
      throw new Error(
        "Unreviewed components-build composition or state implementation: " +
          relative,
      );
  }
}

function addNotice(content, notice, relative) {
  if (content.includes(start) || content.includes(end)) {
    const from = content.indexOf(start);
    const through = content.indexOf(end) + end.length;
    const normalized = (value) => value.replace(/\s+/gu, " ").trim();
    if (
      content.split(start).length !== 2 ||
      content.split(end).length !== 2 ||
      through <= from ||
      normalized(content.slice(from, through)) !== normalized(notice)
    )
      throw new Error("Reviewed components-build notice drifted: " + relative);
    return content;
  }
  const heading = /^#{1,6} .+(?:\n|$)/mu.exec(content);
  const frontmatter = /^---\n[\s\S]*?\n---(?:\n|$)/u.exec(content);
  const at = heading
    ? heading.index + heading[0].length
    : (frontmatter?.[0].length ?? 0);
  return (
    content.slice(0, at) +
    "\n" +
    notice +
    "\n\n" +
    content.slice(at).trimStart()
  );
}

/** Adapt reviewed Core recipes as text; provenance and raw sources stay opaque. */
export async function applyComponentsBuildCompatibility(targetRoot) {
  const root = await lstat(targetRoot);
  if (!root.isDirectory() || root.isSymbolicLink())
    throw new Error("Components-build source must be a real directory");
  const rules = await lstat(path.join(targetRoot, "rules"));
  if (!rules.isDirectory() || rules.isSymbolicLink())
    throw new Error("Components-build rules must be a real directory");
  const guidance = JSON.parse(await readFile(guidanceUrl, "utf8"));
  if (
    [...guidance.replacements, ...guidance.tableRows].some(
      (rule) => !files.includes(rule.path),
    )
  )
    throw new Error("Unexpected components-build guidance target");
  const prepared = [];
  for (const relative of files) {
    const file = path.join(targetRoot, relative);
    const entry = await lstat(file);
    if (!entry.isFile() || entry.isSymbolicLink())
      throw new Error(
        "Components-build source must use regular files: " + relative,
      );
    const before = await readFile(file, "utf8");
    let after = before;
    for (const rule of guidance.replacements.filter(
      (row) => row.path === relative,
    ))
      after = replaceReviewed(after, rule, relative);
    for (const rule of guidance.tableRows.filter(
      (row) => row.path === relative,
    ))
      after = replaceReviewedTableRow(after, rule, relative);
    assertCoreComposition(after, relative);
    if (
      /\b(?:twMerge|clsx)\s*\(|\bfrom\s+["'](?:clsx|tailwind-merge|@\/lib\/utils)["']|\b(?:function|const|let|var)\s+cn\b/u.test(
        after,
      )
    )
      throw new Error(
        "Unreviewed components-build cn implementation: " + relative,
      );
    if (noticeFiles.has(relative))
      after = addNotice(after, guidance.notice, relative);
    prepared.push({ file, before, after });
  }
  // Validate the complete known surface before publishing any adapted document.
  for (const { file, before, after } of prepared)
    if (before !== after) await writeFile(file, after, "utf8");
}
