import {
  lstat,
  mkdir,
  readdir,
  readFile,
  rename,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { applyTasteChartCompatibility } from "./taste-charts-adapter.mjs";
import { applyTastePreviewCompatibility } from "./taste-preview-adapter.mjs";
import { applyComponentsBuildCompatibility } from "./components-build-adapter.mjs";

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
  if (skillName === "components-build") {
    await applyComponentsBuildCompatibility(targetRoot);
    return;
  }
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
  if (skill.explicitPolicy === true)
    await writeNativeExplicitPolicy(targetRoot);
  else await ensureExplicitOnlyNativePolicy(targetRoot);
  if (skillName === "design-taste-frontend") {
    await applyTastePreviewCompatibility(targetRoot);
    await applyTasteChartCompatibility(targetRoot);
  }
}

/**
 * Return `metadata` with `policy.allow_implicit_invocation: false`. Only the
 * top-level `policy:` mapping and its direct children are read, so the same
 * text inside a comment, a block scalar or a nested mapping is never mistaken
 * for the policy.
 *
 * This is a text edit, not a YAML parser, so it refuses every shape it cannot
 * edit with certainty instead of guessing: a quoted `policy` key, more than
 * one `policy` mapping, and an inline mapping. Appending a second `policy:`
 * block in those cases would leave it to the loader which value wins.
 */
function withNativeExplicitPolicy(metadata) {
  const lines = metadata.split("\n");
  if (lines.some((line) => /^(['"])policy\1\s*:/u.test(line)))
    throw new Error(
      "Quoted top-level policy key in agents/openai.yaml; review it by hand",
    );
  const starts = lines.flatMap((line, index) =>
    /^policy\s*:/u.test(line) ? [index] : [],
  );
  if (starts.length > 1)
    throw new Error(
      "More than one top-level policy mapping in agents/openai.yaml; review it by hand",
    );
  if (starts.length === 0)
    return (
      (metadata.trim() ? metadata.trimEnd() + "\n\n" : "") +
      "policy:\n  allow_implicit_invocation: false\n"
    );
  const [start] = starts;
  if (!/^policy\s*:\s*(?:#.*)?$/u.test(lines[start]))
    throw new Error(
      "Unsupported inline policy mapping in agents/openai.yaml; review it by hand",
    );
  // The mapping runs until the next top-level key. Blank lines and comments
  // do not end it.
  let end = start + 1;
  while (end < lines.length && !/^[^\s#]/u.test(lines[end])) end += 1;
  const children = lines.slice(start + 1, end);
  const firstChild = children.find((line) => /^[ \t]+[^\s#]/u.test(line));
  const indent = firstChild ? /^[ \t]+/u.exec(firstChild)[0] : "  ";
  const policyLine = indent + "allow_implicit_invocation: false";
  const existing = children.findIndex(
    (line) =>
      line.startsWith(indent + "allow_implicit_invocation") &&
      /^allow_implicit_invocation\s*:/u.test(line.slice(indent.length)),
  );
  if (existing >= 0) children[existing] = policyLine;
  else children.unshift(policyLine);
  return [...lines.slice(0, start + 1), ...children, ...lines.slice(end)].join(
    "\n",
  );
}

/**
 * Set `policy.allow_implicit_invocation: false` in agents/openai.yaml, keeping
 * any other metadata upstream ships and creating the file when there is none.
 *
 * A refreshed tree is upstream content, and the GitHub refresh path copies
 * links as links. Never read or write through one: the metadata path must be a
 * regular file inside a real `agents` directory.
 */
async function writeNativeExplicitPolicy(targetRoot) {
  const agentsDirectory = path.join(targetRoot, "agents");
  const metadataPath = path.join(agentsDirectory, "openai.yaml");
  let metadataExists = false;
  for (const [entry, isDirectory] of [
    [agentsDirectory, true],
    [metadataPath, false],
  ]) {
    let stat;
    try {
      stat = await lstat(entry);
    } catch (error) {
      if (error.code === "ENOENT") continue;
      throw error;
    }
    if (isDirectory ? !stat.isDirectory() : !stat.isFile())
      throw new Error(
        "Native policy path must be a regular " +
          (isDirectory ? "directory" : "file") +
          ": " +
          entry,
      );
    if (!isDirectory) metadataExists = true;
  }
  const metadata = metadataExists
    ? (await readFile(metadataPath, "utf8")).replaceAll("\r\n", "\n")
    : "";
  const updated = withNativeExplicitPolicy(metadata);
  await mkdir(agentsDirectory, { recursive: true });
  await writeFile(metadataPath, updated, "utf8");
}

/**
 * Codex ignores `disable-model-invocation` and allows implicit invocation
 * unless agents/openai.yaml says otherwise. Call this once a refresh has
 * settled the final SKILL.md, so the native policy follows Core's explicit-only
 * decision on every refresh path. Returns whether the skill is explicit-only.
 *
 * The root itself must be a real directory. Checking only the files inside it
 * would follow a linked root to wherever it points.
 */
export async function ensureExplicitOnlyNativePolicy(targetRoot) {
  if (!(await lstat(targetRoot)).isDirectory())
    throw new Error("Skill root must be a real directory: " + targetRoot);
  const entrypointPath = path.join(targetRoot, "SKILL.md");
  let entrypoint;
  try {
    if (!(await lstat(entrypointPath)).isFile())
      throw new Error(
        "Skill entrypoint must be a regular file: " + entrypointPath,
      );
    entrypoint = await readFile(entrypointPath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
  const frontmatter =
    /^---\r?\n([\s\S]*?)\r?\n---/u.exec(entrypoint)?.[1] ?? "";
  // A trailing comment is still an active key; a commented-out line is not.
  if (!/^disable-model-invocation:\s*true(?:\s+#.*)?\s*$/mu.test(frontmatter))
    return false;
  await writeNativeExplicitPolicy(targetRoot);
  return true;
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
