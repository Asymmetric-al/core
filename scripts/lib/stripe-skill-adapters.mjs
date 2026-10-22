import { lstat, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const START = "<!-- CORE-OVERLAY-START -->";
const END = "<!-- CORE-OVERLAY-END -->";

export async function restoreStripeCoreGuidance(repoRoot) {
  const data = JSON.parse(
    await readFile(
      path.join(repoRoot, "scripts/refresh-overlays/stripe-core-guidance.json"),
      "utf8",
    ),
  );
  if (
    data.version !== 2 ||
    !Array.isArray(data.replacements) ||
    !Array.isArray(data.overlays)
  )
    throw new Error("Invalid reviewed Stripe adapter configuration");
  const planned = new Map();
  async function target(relative) {
    if (
      !/^(?:stripe-best-practices|stripe-projects|upgrade-stripe)\/(?:SKILL\.md|references\/tax\.md)$/u.test(
        relative,
      )
    )
      throw new Error("Unsafe Stripe adapter path");
    if (planned.has(relative)) return planned.get(relative);
    const parts = [".agents", "skills", ...relative.split("/")];
    let file = repoRoot;
    for (let i = 0; i < parts.length; i++) {
      file = path.join(file, parts[i]);
      let entry;
      try {
        entry = await lstat(file);
      } catch (error) {
        if (error.code === "ENOENT") return null;
        throw error;
      }
      if (
        entry.isSymbolicLink() ||
        (i === parts.length - 1 ? !entry.isFile() : !entry.isDirectory())
      )
        throw new Error("Unsafe Stripe adapter target");
    }
    const original = await readFile(file, "utf8");
    const item = { file, original, content: original.replaceAll("\r\n", "\n") };
    planned.set(relative, item);
    return item;
  }
  for (const { name, overlay } of data.overlays) {
    const item = await target(name + "/SKILL.md");
    if (!item) continue;
    const header = /^---\n[\s\S]*?\n---\n/u.exec(item.content);
    if (!header?.[0].includes("\nname: " + name + "\n"))
      throw new Error("Unexpected Stripe skill identity");
    const starts = item.content.split(START).length - 1;
    const ends = item.content.split(END).length - 1;
    if (
      starts !== ends ||
      starts > 1 ||
      (starts === 1 && item.content.indexOf(END) < item.content.indexOf(START))
    )
      throw new Error("Malformed Stripe Core overlay");
    if (starts === 1)
      item.content =
        item.content.slice(0, item.content.indexOf(START)) +
        overlay +
        item.content.slice(item.content.indexOf(END) + END.length);
    else
      item.content =
        header[0] +
        "\n" +
        overlay +
        "\n\n" +
        item.content.slice(header[0].length).trimStart();
  }
  for (const rule of data.replacements) {
    const item = await target(rule.path);
    if (!item) continue;
    if (item.content.includes(rule.core)) {
      if (item.content.replaceAll(rule.core, "").includes(rule.upstream))
        throw new Error("Mixed Stripe upstream/Core guidance: " + rule.path);
      continue;
    }
    if (item.content.split(rule.upstream).length - 1 !== 1)
      throw new Error("Core Stripe adapter no longer matches " + rule.path);
    item.content = item.content.replace(rule.upstream, rule.core);
  }
  // Validate every current-source contract before publishing any source edit.
  for (const item of planned.values())
    if (item.content !== item.original)
      await writeFile(item.file, item.content, "utf8");
}
