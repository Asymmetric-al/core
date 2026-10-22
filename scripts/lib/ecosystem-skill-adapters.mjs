import { lstat, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const START = "<!-- CORE-OVERLAY-START -->";
const END = "<!-- CORE-OVERLAY-END -->";

async function optionalJson(file) {
  try {
    const entry = await lstat(file);
    if (!entry.isFile() || entry.isSymbolicLink()) {
      throw new Error(
        "Ecosystem adapter config must be a regular file: " + file,
      );
    }
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

function checkedPath(relativePath) {
  if (
    typeof relativePath !== "string" ||
    relativePath.includes("\\") ||
    relativePath.includes(":") ||
    /[\u0000-\u001f\u007f]/u.test(relativePath)
  ) {
    throw new Error("Unsafe ecosystem adapter path");
  }
  const parts = relativePath.split("/");
  if (
    parts.length < 2 ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(parts[0]) ||
    parts.some((part) => !part || part === "." || part === "..")
  ) {
    throw new Error("Unsafe ecosystem adapter path: " + relativePath);
  }
  return parts;
}

function validateMarkers(content, context, required = false) {
  const starts = content.split(START).length - 1;
  const ends = content.split(END).length - 1;
  if (
    starts !== ends ||
    starts > 1 ||
    (starts === 1 && content.indexOf(START) > content.indexOf(END)) ||
    (required && starts !== 1)
  ) {
    throw new Error("Malformed Core overlay markers: " + context);
  }
}

/**
 * Reapply reviewed Core compatibility after an ecosystem reinstall.
 * Plan all source changes before writing, and never import or execute skill code.
 * Minimal sync fixtures may omit both configs; production inventory tests require them.
 */
export async function restoreReviewedEcosystemSkills(repoRoot) {
  const configRoot = path.join(repoRoot, "scripts/refresh-overlays");
  const [guidance, overlays] = await Promise.all([
    optionalJson(path.join(configRoot, "ecosystem-core-guidance.json")),
    optionalJson(path.join(configRoot, "ecosystem-core-overlays.json")),
  ]);
  if (!guidance && !overlays) return;
  if (
    guidance?.version !== 1 ||
    overlays?.version !== 1 ||
    !Array.isArray(guidance.replacements) ||
    !Array.isArray(overlays.skills) ||
    !Array.isArray(overlays.prefixes)
  ) {
    throw new Error("Invalid ecosystem Core adapter configs");
  }

  // Reject malformed configuration before any target access or publication.
  const skillNames = new Set();
  for (const item of overlays.skills) {
    checkedPath(item.name + "/SKILL.md");
    if (skillNames.has(item.name) || typeof item.overlay !== "string") {
      throw new Error("Invalid or duplicate ecosystem Core overlay");
    }
    skillNames.add(item.name);
    validateMarkers(item.overlay, item.name, true);
  }
  for (const item of guidance.replacements) {
    checkedPath(item.path);
    if (
      typeof item.upstream !== "string" ||
      item.upstream.length === 0 ||
      typeof item.core !== "string"
    ) {
      throw new Error("Invalid ecosystem Core replacement");
    }
  }
  for (const item of overlays.prefixes) {
    checkedPath(item.path);
    if (typeof item.prefix !== "string" || item.prefix.length === 0) {
      throw new Error("Invalid ecosystem Core prefix");
    }
  }

  const planned = new Map();
  async function target(relativePath) {
    if (planned.has(relativePath)) return planned.get(relativePath);
    const parts = [".agents", "skills", ...checkedPath(relativePath)];
    let current = repoRoot;
    for (let index = 0; index < parts.length; index++) {
      current = path.join(current, parts[index]);
      let entry;
      try {
        entry = await lstat(current);
      } catch (error) {
        if (error?.code === "ENOENT") return null;
        throw error;
      }
      if (
        entry.isSymbolicLink() ||
        (index === parts.length - 1 ? !entry.isFile() : !entry.isDirectory())
      ) {
        throw new Error("Unsafe ecosystem adapter target: " + relativePath);
      }
    }
    const original = new TextDecoder("utf-8", { fatal: true }).decode(
      await readFile(current),
    );
    const item = {
      file: current,
      original,
      content: original.replace(/\r\n/g, "\n"),
    };
    planned.set(relativePath, item);
    return item;
  }

  for (const replacement of guidance.replacements) {
    const item = await target(replacement.path);
    if (!item) continue;
    const { upstream, core } = replacement;
    if (core && item.content.includes(core)) {
      if (item.content.replaceAll(core, "").includes(upstream)) {
        throw new Error(
          "Mixed upstream/Core adapter text: " + replacement.path,
        );
      }
      continue;
    }
    const count = item.content.split(upstream).length - 1;
    if (!core && count === 0) continue;
    if (count !== 1) {
      throw new Error(
        "Core ecosystem adapter no longer matches " + replacement.path,
      );
    }
    item.content = item.content.replace(upstream, core);
  }

  for (const skill of overlays.skills) {
    const relativePath = skill.name + "/SKILL.md";
    const item = await target(relativePath);
    if (!item) continue;
    const frontmatter = /^---\n[\s\S]*?\n---(?:\n|$)/u.exec(item.content);
    if (
      !frontmatter ||
      !frontmatter[0].includes("\nname: " + skill.name + "\n")
    ) {
      throw new Error(
        "Unexpected ecosystem skill discovery metadata: " + relativePath,
      );
    }
    validateMarkers(item.content, relativePath);
    if (item.content.includes(START)) {
      const first = item.content.indexOf(START);
      const last = item.content.indexOf(END) + END.length;
      item.content =
        item.content.slice(0, first) + skill.overlay + item.content.slice(last);
    } else {
      const header = frontmatter[0].trimEnd();
      item.content =
        header +
        "\n\n" +
        skill.overlay +
        "\n\n" +
        item.content.slice(frontmatter[0].length).replace(/^\n+/u, "");
    }
  }

  for (const prefix of overlays.prefixes) {
    const item = await target(prefix.path);
    if (!item || item.content.startsWith(prefix.prefix)) continue;
    if (item.content.includes(prefix.prefix)) {
      throw new Error("Misplaced ecosystem Core prefix: " + prefix.path);
    }
    item.content = prefix.prefix + item.content;
  }

  for (const item of planned.values()) {
    if (item.content !== item.original)
      await writeFile(item.file, item.content, "utf8");
  }
}
