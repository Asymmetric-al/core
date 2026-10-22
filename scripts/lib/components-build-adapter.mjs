import { lstat, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const files = [
  "SKILL.md",
  "README.md",
  "AGENTS.md",
  "rules/overview.md",
  "rules/styling.md",
  "rules/npm.md",
];
const guidanceUrl = new URL(
  "../refresh-overlays/components-build-cn.json",
  import.meta.url,
);
const start = "<!-- CORE-COMPONENTS-CN-START -->";
const end = "<!-- CORE-COMPONENTS-CN-END -->";

function replaceReviewed(content, rule, relative) {
  const count = content.split(rule.upstream).length - 1;
  if (count === 0 && content.includes(rule.core)) return content;
  if (count !== 1 || (!rule.allowRepeatedCore && content.includes(rule.core)))
    throw new Error("Reviewed components-build guidance drifted: " + relative);
  return content.replace(rule.upstream, rule.core);
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

/** Adapt six reviewed documents as text; provenance and raw sources stay opaque. */
export async function applyComponentsBuildCompatibility(targetRoot) {
  const root = await lstat(targetRoot);
  if (!root.isDirectory() || root.isSymbolicLink())
    throw new Error("Components-build source must be a real directory");
  const rules = await lstat(path.join(targetRoot, "rules"));
  if (!rules.isDirectory() || rules.isSymbolicLink())
    throw new Error("Components-build rules must be a real directory");
  const guidance = JSON.parse(await readFile(guidanceUrl, "utf8"));
  if (guidance.replacements.some((rule) => !files.includes(rule.path)))
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
    if (
      /\b(?:twMerge|clsx)\s*\(|\bfrom\s+["'](?:clsx|tailwind-merge|@\/lib\/utils)["']|\b(?:function|const|let|var)\s+cn\b/u.test(
        after,
      )
    )
      throw new Error(
        "Unreviewed components-build cn implementation: " + relative,
      );
    after = addNotice(after, guidance.notice, relative);
    prepared.push({ file, before, after });
  }
  // Validate the complete known surface before publishing any adapted document.
  for (const { file, before, after } of prepared)
    if (before !== after) await writeFile(file, after, "utf8");
}
