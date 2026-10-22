import { lstat, readdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Reviewed source text is data. Never import code from a skill tree.
const repositoryPackage = fileURLToPath(
  new URL("../../package.json", import.meta.url),
);
const configUrl = new URL(
  "../refresh-overlays/managed-core-guidance.json",
  import.meta.url,
);
let configPromise;
async function config() {
  configPromise ??= readFile(configUrl, "utf8")
    .then(JSON.parse)
    .catch((error) => {
      // Small isolated sync/refresh fixtures can omit optional pack adapters.
      if (error.code === "ENOENT") return null;
      throw error;
    });
  return configPromise;
}

async function filesUnder(root, prefix = "") {
  const result = [];
  for (const entry of await readdir(path.join(root, prefix), {
    withFileTypes: true,
  })) {
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isSymbolicLink())
      throw new Error("Managed skill source contains a symlink: " + relative);
    if (entry.isDirectory()) result.push(...(await filesUnder(root, relative)));
    else if (entry.isFile()) result.push(relative);
    else
      throw new Error(
        "Managed skill source must use regular files: " + relative,
      );
  }
  return result;
}

function replaceReviewed(content, rule, label) {
  if (rule.core && content.includes(rule.core)) {
    if (content.replaceAll(rule.core, "").includes(rule.upstream))
      throw new Error("Mixed upstream/Core managed guidance: " + label);
    // A shorter Core correction can be a prefix of the old unsafe sentence.
    // In that case the complete upstream sentence still needs replacing.
    if (!content.includes(rule.upstream) || rule.core.includes(rule.upstream))
      return content;
  }
  const count = content.split(rule.upstream).length - 1;
  if (!rule.core && count === 0) return content;
  if (count !== 1)
    throw new Error("Reviewed managed skill text drifted: " + label);
  return content.replace(rule.upstream, rule.core);
}

/** Normalize reviewed installed packs before legacy compatibility guards.
 * Formatting is explicit, including dot-prefixed staging directories; the CLI
 * directory formatter skips ignored staging trees. Only Markdown is parsed.
 */
export async function applyManagedSkillCompatibility(skillName, targetRoot) {
  const guidance = await config();
  const skill = guidance?.skills?.[skillName];
  if (!skill) return;
  const sourceEntry = await lstat(targetRoot);
  if (!sourceEntry.isDirectory() || sourceEntry.isSymbolicLink())
    throw new Error(
      "Managed skill source must be a real directory: " + skillName,
    );
  if (skillName === "domain-modeling") {
    try {
      await lstat(path.join(targetRoot, "GLOSSARY-FORMAT.md"));
      try {
        await lstat(path.join(targetRoot, "CONTEXT-FORMAT.md"));
        throw new Error("Both old and Core domain format files exist");
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
      await rename(
        path.join(targetRoot, "GLOSSARY-FORMAT.md"),
        path.join(targetRoot, "CONTEXT-FORMAT.md"),
      );
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  const prettier = await import("prettier");
  for (const relative of await filesUnder(targetRoot)) {
    if (
      !relative.endsWith(".md") ||
      relative === "references/upstream.md" ||
      relative === "references/LICENSE.md"
    )
      continue;
    const file = path.join(targetRoot, relative);
    let content = (await readFile(file, "utf8")).replaceAll("\r\n", "\n");
    if (
      skill.source === "mattpocock/skills" &&
      !(
        skillName === "teach" &&
        guidance.teachingGlossaryFiles.includes(relative)
      )
    ) {
      for (const [before, after] of Object.entries(guidance.projectDocRemaps))
        content = content.replaceAll(before, after);
    }
    // The upstream plan template intentionally nests fences; its established
    // normalizer must run before a Markdown formatter sees it.
    if (!(
      skillName === "improve-animations" && relative === "PLAN-TEMPLATE.md"
    ))
      content = await prettier.format(content, {
        ...(await prettier.resolveConfig(repositoryPackage)),
        filepath: file,
      });
    for (const row of (guidance.tableRows ?? []).filter(
      (item) => item.skillName === skillName && item.relativePath === relative,
    )) {
      const cells = (line) =>
        line
          .split("|")
          .slice(1, -1)
          .map((cell) => cell.trim());
      const currentCells = cells(row.core);
      const lines = content.split("\n");
      const index = lines.findIndex(
        (line) =>
          line.startsWith("|") && cells(line)[0] === row.upstreamCells[0],
      );
      if (index < 0)
        throw new Error("Reviewed table row missing: " + skillName);
      const found = JSON.stringify(cells(lines[index]));
      if (
        found !== JSON.stringify(row.upstreamCells) &&
        found !== JSON.stringify(currentCells)
      )
        throw new Error("Reviewed table row drifted: " + skillName);
      lines[index] = row.core;
      content = lines.join("\n");
    }
    for (const rule of guidance.replacements.filter(
      (item) => item.skillName === skillName && item.relativePath === relative,
    )) {
      content = replaceReviewed(content, rule, skillName + "/" + relative);
    }
    if (relative === "SKILL.md") {
      const header = /^---\n[\s\S]*?\n---\n/u.exec(content);
      const name = header && /^name:\s*(\S+)\s*$/mu.exec(header[0])?.[1];
      if (!header || !skill.upstreamNames.includes(name))
        throw new Error("Unexpected managed skill identity: " + skillName);
      content = skill.frontmatter + content.slice(header[0].length);
      if (skill.corePrefix) {
        const body = content.slice(skill.frontmatter.length).trimStart();
        if (!body.startsWith(skill.corePrefix.trim()))
          content =
            skill.frontmatter + "\n" + skill.corePrefix.trim() + "\n\n" + body;
      }
      if (content.includes("## Initial Response"))
        throw new Error("Unreviewed blocking readiness response: " + skillName);
    }
    await writeFile(file, content, "utf8");
  }
  if (skill.explicitPolicy) {
    const metadataPath = path.join(targetRoot, "agents/openai.yaml");
    try {
      let metadata = await readFile(metadataPath, "utf8");
      if (/allow_implicit_invocation:/u.test(metadata))
        metadata = metadata.replace(
          /allow_implicit_invocation:\s*(?:true|false)/u,
          "allow_implicit_invocation: false",
        );
      else if (/^policy:\s*$/mu.test(metadata))
        metadata = metadata.replace(
          /^policy:\s*$/mu,
          "policy:\n  allow_implicit_invocation: false",
        );
      else
        metadata =
          metadata.trimEnd() +
          "\n\npolicy:\n  allow_implicit_invocation: false\n";
      await writeFile(metadataPath, metadata, "utf8");
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
}

/** Format only after existing recipe/fence and Core replacement passes. */
export async function formatManagedSkillOutput(skillName, targetRoot) {
  const guidance = await config();
  if (!guidance?.skills?.[skillName]) return;
  const prettier = await import("prettier");
  for (const relative of await filesUnder(targetRoot)) {
    if (!relative.endsWith(".md") || relative.startsWith("references/"))
      continue;
    const file = path.join(targetRoot, relative);
    const content = await readFile(file, "utf8");
    await writeFile(
      file,
      await prettier.format(content, {
        ...(await prettier.resolveConfig(repositoryPackage)),
        filepath: file,
      }),
      "utf8",
    );
  }
}
