#!/usr/bin/env node
/**
 * Vendor selected ecosystem skills from their install targets into `docs/ai/skills/`
 * so they remain the canonical source mirrored by `skills:sync`.
 *
 * Workflow:
 * 1. Refresh the upstream source (e.g. Skills CLI or vendor installer)
 * 2. `bun run skills:refresh-upstream`
 * 3. Re-apply any repo-specific notes or references if the refresh overwrote them
 * 4. `bun run skills:sync` && `bun run skills:verify`
 */
import {
  access,
  cp,
  mkdir,
  readFile,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const canonicalRoot = path.join(repoRoot, "docs", "ai", "skills");
const CORE_OVERLAY_START = "<!-- CORE-OVERLAY-START -->";
const CORE_OVERLAY_END = "<!-- CORE-OVERLAY-END -->";
const GRILL_UPSTREAM_DESCRIPTION =
  "description: Use when starting or reviewing a complex implementation where the user wants an agent to interrogate the plan against docs/source evidence, surface unknown unknowns, and avoid rushing into build mode. Combines docs-grounded grilling with a map-vs-territory unknowns pass.";
const GRILL_CORE_DESCRIPTION =
  "description: Use only when the user explicitly invokes grill-for-unknowns or asks for a map-vs-territory unknowns pass, blindspot discovery, unknown-known prototypes, or a subagent launch packet before implementation.";

const emilKowalskiSkillNames = [
  "animation-vocabulary",
  "apple-design",
  "emil-design-eng",
  "improve-animations",
  "review-animations",
];

const emilKowalskiSources = emilKowalskiSkillNames.map((skillName) => ({
  sourceGroup: "emilkowalski/skills",
  skillName,
  from: path.join(repoRoot, ".agents", "skills", skillName),
  preserve: ["references/upstream.md", "references/LICENSE.md"],
}));

const upstreamSources = [
  {
    sourceGroup: "supabase/agent-skills",
    skillName: "supabase",
    from: path.join(repoRoot, ".agents", "skills", "supabase"),
    preserve: ["references/upstream.md"],
  },
  {
    sourceGroup: "supabase/agent-skills",
    skillName: "supabase-postgres-best-practices",
    from: path.join(
      repoRoot,
      ".agents",
      "skills",
      "supabase-postgres-best-practices",
    ),
    preserve: ["references/upstream.md"],
  },
  {
    sourceGroup: "animations.dev",
    skillName: "emil-design-engineering",
    from: path.join(
      process.env.HOME ?? "",
      ".cursor",
      "skills",
      "emil-design-engineering",
    ),
    preserve: ["references/upstream.md"],
  },
  {
    sourceGroup: "anthonyshew/dotfiles",
    skillName: "npm-deps-cleanup",
    from: path.join(repoRoot, ".agents", "skills", "npm-deps-cleanup"),
    preserve: ["references/upstream.md"],
  },
  {
    sourceGroup: "nicobailon/grill-for-unknowns",
    skillName: "grill-for-unknowns",
    from: path.join(repoRoot, ".agents", "skills", "grill-for-unknowns"),
    preserve: ["references/upstream.md"],
  },
  ...emilKowalskiSources,
];

const POST_REFRESH_REPLACEMENTS = [
  {
    skillName: "grill-for-unknowns",
    relativePath: "SKILL.md",
    search: GRILL_UPSTREAM_DESCRIPTION,
    replace: GRILL_CORE_DESCRIPTION,
    required: true,
  },
  {
    skillName: "grill-for-unknowns",
    relativePath: "SKILL.md",
    search: "license: MIT\nmetadata:",
    replace: "license: MIT\ndisable-model-invocation: true\nmetadata:",
    required: true,
  },
  {
    skillName: "emil-design-engineering",
    relativePath: "forms-controls.md",
    search: '<input data-lpignore="true" data-1p-ignore />',
    replace:
      '<input data-lpignore="true" data-1p-ignore /> // pragma: allowlist secret',
  },
  {
    skillName: "emil-design-engineering",
    relativePath: "forms-controls.md",
    search: "### 1Password Integration", // pragma: allowlist secret
    replace: "### 1Password Integration // pragma: allowlist secret", // pragma: allowlist secret
  },
  {
    skillName: "emil-design-engineering",
    relativePath: "forms-controls.md",
    search: "Disable 1Password autocomplete when not needed:", // pragma: allowlist secret
    replace:
      "Disable 1Password autocomplete when not needed: // pragma: allowlist secret",
  },
  {
    skillName: "emil-design-eng",
    relativePath: "SKILL.md",
    search:
      "description: This skill encodes Emil Kowalski's philosophy on UI polish, component design, animation decisions, and the invisible details that make software feel great.",
    replace:
      "description: This skill encodes Emil Kowalski's philosophy on UI polish, component design, animation decisions, and the invisible details that make software feel great. Use as a craft companion after Core's frontend, emil-design-engineering, and anim guidance.",
    required: true,
  },
  {
    skillName: "emil-design-eng",
    relativePath: "SKILL.md",
    search: "import { useSpring } from 'framer-motion';",
    replace: 'import { useSpring } from "motion/react";',
    required: true,
  },
  {
    skillName: "emil-design-eng",
    relativePath: "SKILL.md",
    search: "`transform-origin: var(--radix-popover-content-transform-origin)`",
    replace: "`transform-origin: var(--transform-origin)`",
    required: true,
  },
  {
    skillName: "emil-design-eng",
    relativePath: "SKILL.md",
    search:
      "/* Radix UI */\n.popover {\n  transform-origin: var(--radix-popover-content-transform-origin);\n}\n\n/* Base UI */",
    replace: "/* Base UI (this repo) */",
    required: true,
  },
  {
    skillName: "emil-design-eng",
    relativePath: "SKILL.md",
    search: "Set to trigger location or use Radix/Base UI CSS variable",
    replace: "Use Base UI's `var(--transform-origin)`",
    required: true,
  },
  {
    skillName: "review-animations",
    relativePath: "SKILL.md",
    search: "`var(--radix-popover-content-transform-origin)`",
    replace: "`var(--transform-origin)`",
    required: true,
  },
  {
    skillName: "improve-animations",
    relativePath: "PLAN-TEMPLATE.md",
    search:
      "  transition: transform 200ms var(--ease-out), opacity 200ms var(--ease-out);\n  transform-origin: var(--radix-dropdown-menu-content-transform-origin);",
    replace:
      "  transition:\n    transform var(--duration-standard) var(--ease-out-soft),\n    opacity var(--duration-standard) var(--ease-out-soft);\n  transform-origin: var(--transform-origin);",
    required: true,
  },
  {
    skillName: "improve-animations",
    relativePath: "AUDIT.md",
    search:
      "  .popover { transform-origin: var(--radix-popover-content-transform-origin); } /* Radix */\n  .popover { transform-origin: var(--transform-origin); }                       /* Base UI */",
    replace:
      "  .popover {\n    transform-origin: var(--transform-origin);\n  } /* Base UI */",
    required: true,
  },
  {
    skillName: "review-animations",
    relativePath: "STANDARDS.md",
    search:
      "  .popover { transform-origin: var(--radix-popover-content-transform-origin); } /* Radix */\n  .popover { transform-origin: var(--transform-origin); }                       /* Base UI */",
    replace:
      "  .popover {\n    transform-origin: var(--transform-origin);\n  } /* Base UI */",
    required: true,
  },
];

async function readCoreOverlay(targetRoot) {
  const skillPath = path.join(targetRoot, "SKILL.md");

  try {
    const content = await readFile(skillPath, "utf8");
    const startIndex = content.indexOf(CORE_OVERLAY_START);
    const endMarkerIndex = content.indexOf(CORE_OVERLAY_END);

    if (startIndex === -1 && endMarkerIndex === -1) {
      return null;
    }

    if (
      startIndex === -1 ||
      endMarkerIndex === -1 ||
      endMarkerIndex < startIndex
    ) {
      throw new Error(
        `Invalid Core overlay markers in ${path.relative(repoRoot, skillPath)}`,
      );
    }

    const endIndex = endMarkerIndex + CORE_OVERLAY_END.length;
    return content.slice(startIndex, endIndex);
  } catch (error) {
    const errorCode =
      typeof error === "object" && error !== null && "code" in error
        ? String(error.code)
        : "";
    if (errorCode === "ENOENT") {
      return null;
    }
    throw error;
  }
}

async function restoreCoreOverlay(targetRoot, overlay) {
  if (!overlay) {
    return;
  }

  const skillPath = path.join(targetRoot, "SKILL.md");
  const content = await readFile(skillPath, "utf8");

  const startIndex = content.indexOf(CORE_OVERLAY_START);
  const endMarkerIndex = content.indexOf(CORE_OVERLAY_END);

  if (startIndex !== -1 || endMarkerIndex !== -1) {
    if (
      startIndex === -1 ||
      endMarkerIndex === -1 ||
      endMarkerIndex < startIndex
    ) {
      throw new Error(
        `Invalid Core overlay markers in refresh source: ${path.relative(repoRoot, skillPath)}`,
      );
    }

    const endIndex = endMarkerIndex + CORE_OVERLAY_END.length;
    const sourceOverlay = content.slice(startIndex, endIndex);
    if (sourceOverlay.trim() === overlay.trim()) {
      return;
    }

    throw new Error(
      `Refresh source contains a different Core overlay: ${path.relative(repoRoot, skillPath)}`,
    );
  }

  const headingMatch = /^# .+$/m.exec(content);
  if (!headingMatch || headingMatch.index === undefined) {
    throw new Error(
      `Unable to locate skill heading for Core overlay: ${path.relative(repoRoot, skillPath)}`,
    );
  }

  const headingEnd = headingMatch.index + headingMatch[0].length;
  const before = content.slice(0, headingEnd).trimEnd();
  const after = content.slice(headingEnd).trimStart();
  await writeFile(
    skillPath,
    `${before}\n\n${overlay.trim()}\n\n${after}`,
    "utf8",
  );
}

async function readPreservedFiles(targetRoot, preserve) {
  const entries = await Promise.all(
    preserve.map(async (relativePath) => {
      try {
        const content = await readFile(
          path.join(targetRoot, relativePath),
          "utf8",
        );
        return [relativePath, content];
      } catch (error) {
        const errorCode =
          typeof error === "object" && error !== null && "code" in error
            ? String(error.code)
            : "";
        if (errorCode === "ENOENT") {
          return null;
        }
        throw error;
      }
    }),
  );
  return entries.filter(Boolean);
}

async function restorePreservedFiles(targetRoot, preservedFiles) {
  for (const [relativePath, content] of preservedFiles) {
    const targetPath = path.join(targetRoot, relativePath);
    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, content, "utf8");
  }
}

function annotateEmilDesignEngineeringFormsControls(content) {
  const lines = content.split("\n");
  const helperHeadingIndex = lines.findIndex(
    (line) => line.trim() === "### Input Types",
  );

  if (helperHeadingIndex !== -1) {
    const codeFenceStart = lines.findIndex(
      (line, index) => index > helperHeadingIndex && line.trim() === "```html",
    );
    const codeFenceEnd =
      codeFenceStart === -1
        ? -1
        : lines.findIndex(
            (line, index) => index > codeFenceStart && line.trim() === "```",
          );

    if (codeFenceStart !== -1 && codeFenceEnd !== -1) {
      const inputLineIndexes = [];
      for (let index = codeFenceStart + 1; index < codeFenceEnd; index += 1) {
        if (lines[index].trim().startsWith("<input ")) {
          inputLineIndexes.push(index);
        }
      }

      // The password example triggers the repo secret scanner. Target the line
      // that contains `type="password"` (not "second <input>" by index: when
      // email+password share one line, the next line is `tel` and would get a
      // spurious pragma).
      const passwordLineIndex = inputLineIndexes.find((idx) =>
        lines[idx].includes('type="password"'),
      );
      if (
        passwordLineIndex !== undefined &&
        !lines[passwordLineIndex].includes("// pragma: allowlist secret")
      ) {
        lines[passwordLineIndex] =
          `${lines[passwordLineIndex]} // pragma: allowlist secret`;
      }
    }
  }

  return lines.join("\n");
}

function normalizeImproveAnimationsPlanTemplate(content, templatePath) {
  const normalized = content
    .replaceAll("\r\n", "\n")
    .replace(/^```markdown$/m, "````markdown")
    .replaceAll("\u200B```css", "```css")
    .replaceAll("\u200B```", "```")
    .replace(
      /\n```\n\n## Notes for the plan author/,
      "\n````\n\n## Notes for the plan author",
    );

  const innerOpenCount = normalized.match(/^```css$/gm)?.length ?? 0;
  const innerCloseCount = normalized.match(/^```$/gm)?.length ?? 0;
  const hasOuterOpen = normalized.includes("\n````markdown\n");
  const hasOuterClose = normalized.includes(
    "\n````\n\n## Notes for the plan author",
  );

  if (
    innerOpenCount !== 2 ||
    innerCloseCount !== 2 ||
    !hasOuterOpen ||
    !hasOuterClose
  ) {
    throw new Error(
      `Incompatible improve-animations plan template fences in ${path.relative(repoRoot, templatePath)}; review upstream drift before refreshing canonical skills.`,
    );
  }

  return normalized;
}

function applyCompatibilityReplacement(content, search, replacement) {
  let cursor = 0;
  let output = "";
  let matched = false;
  let changed = false;

  while (cursor < content.length) {
    const searchIndex = content.indexOf(search, cursor);
    const replacementIndex = content.indexOf(replacement, cursor);

    if (searchIndex === -1 && replacementIndex === -1) {
      output += content.slice(cursor);
      break;
    }

    const replacementComesFirst =
      replacementIndex !== -1 &&
      (searchIndex === -1 || replacementIndex <= searchIndex);

    if (replacementComesFirst) {
      output += content.slice(cursor, replacementIndex) + replacement;
      cursor = replacementIndex + replacement.length;
      matched = true;
      continue;
    }

    output += content.slice(cursor, searchIndex) + replacement;
    cursor = searchIndex + search.length;
    matched = true;
    changed = true;
  }

  return { content: output, matched, changed };
}

async function applyPostRefreshReplacements(skillName, targetRoot) {
  if (skillName === "emil-design-engineering") {
    const formsControlsPath = path.join(targetRoot, "forms-controls.md");
    const formsControlsContent = await readFile(formsControlsPath, "utf8");
    const patchedContent =
      annotateEmilDesignEngineeringFormsControls(formsControlsContent);

    if (patchedContent !== formsControlsContent) {
      await writeFile(formsControlsPath, patchedContent, "utf8");
    }
  }

  if (skillName === "improve-animations") {
    const templatePath = path.join(targetRoot, "PLAN-TEMPLATE.md");
    const templateContent = await readFile(templatePath, "utf8");
    const normalizedTemplate = normalizeImproveAnimationsPlanTemplate(
      templateContent,
      templatePath,
    );
    if (normalizedTemplate !== templateContent) {
      await writeFile(templatePath, normalizedTemplate, "utf8");
    }
  }

  for (const replacement of POST_REFRESH_REPLACEMENTS) {
    if (replacement.skillName !== skillName) {
      continue;
    }

    const targetPath = path.join(targetRoot, replacement.relativePath);
    const rawContent = await readFile(targetPath, "utf8");
    const content = rawContent.replaceAll("\r\n", "\n");
    const applied = applyCompatibilityReplacement(
      content,
      replacement.search,
      replacement.replace,
    );
    if (!applied.matched) {
      if (replacement.required) {
        throw new Error(
          `Required Core compatibility replacement is missing in ${path.relative(repoRoot, targetPath)}; review upstream drift before refreshing canonical skills.`,
        );
      }
      if (content !== rawContent) {
        await writeFile(targetPath, content, "utf8");
      }
      continue;
    }

    if (applied.changed || applied.content !== rawContent) {
      await writeFile(targetPath, applied.content, "utf8");
    }
  }

  if (skillName === "emil-design-engineering") {
    const targetPath = path.join(targetRoot, "forms-controls.md");
    const lines = (await readFile(targetPath, "utf8")).split("\n");

    const helperHeadingIndex = lines.findIndex(
      (line) => line === "### 1Password Integration", // pragma: allowlist secret
    );
    if (helperHeadingIndex !== -1) {
      lines[helperHeadingIndex] =
        "### 1Password Integration // pragma: allowlist secret"; // pragma: allowlist secret
    }

    const helperCopyIndex = lines.findIndex(
      (line) => line === "Disable 1Password autocomplete when not needed:", // pragma: allowlist secret
    );
    if (helperCopyIndex !== -1) {
      lines[helperCopyIndex] =
        "Disable 1Password autocomplete when not needed: // pragma: allowlist secret"; // pragma: allowlist secret
    }

    const helperInputIndex = lines.findIndex(
      (line) => line.includes('data-lpignore="true" data-1p-ignore'), // pragma: allowlist secret
    );
    if (
      helperInputIndex !== -1 &&
      !lines[helperInputIndex].includes("pragma: allowlist secret")
    ) {
      lines[helperInputIndex] =
        `${lines[helperInputIndex]} // pragma: allowlist secret`;
    }

    const inputTypesIndex = lines.findIndex(
      (line) => line.trim() === "Use appropriate `type` attributes:",
    );
    if (inputTypesIndex !== -1) {
      for (let index = inputTypesIndex + 1; index < lines.length; index += 1) {
        if (lines[index].startsWith("<input type=")) {
          if (!lines[index].includes("pragma: allowlist secret")) {
            lines[index] = `${lines[index]} // pragma: allowlist secret`;
          }
          break;
        }
      }
    }

    await writeFile(targetPath, lines.join("\n"), "utf8");
  }
}

function readFrontmatter(content, skillPath) {
  const normalizedContent = content
    .replace(/^\uFEFF/, "")
    .replaceAll("\r\n", "\n");
  const lines = normalizedContent.split("\n");
  if (lines[0] !== "---") {
    throw new Error(
      `Missing YAML frontmatter in ${path.relative(repoRoot, skillPath)}`,
    );
  }

  const closingDelimiterIndex = lines.indexOf("---", 1);
  if (closingDelimiterIndex === -1) {
    throw new Error(
      `Unterminated YAML frontmatter in ${path.relative(repoRoot, skillPath)}`,
    );
  }

  return lines.slice(1, closingDelimiterIndex).join("\n");
}

function getTopLevelFrontmatterLine(frontmatter, key) {
  const prefix = `${key}:`;
  const matchingLines = frontmatter
    .split("\n")
    .filter((line) => line.startsWith(prefix));
  return matchingLines.length === 1 ? matchingLines[0] : null;
}

async function assertRefreshSourceCompatibility(skillName, sourceRoot) {
  if (skillName !== "grill-for-unknowns") {
    return;
  }

  const skillPath = path.join(sourceRoot, "SKILL.md");
  const frontmatter = readFrontmatter(
    await readFile(skillPath, "utf8"),
    skillPath,
  );
  const nameLine = getTopLevelFrontmatterLine(frontmatter, "name");
  const descriptionLine = getTopLevelFrontmatterLine(
    frontmatter,
    "description",
  );
  const invocationLine = getTopLevelFrontmatterLine(
    frontmatter,
    "disable-model-invocation",
  );
  const licenseLine = getTopLevelFrontmatterLine(frontmatter, "license");
  const metadataLine = getTopLevelFrontmatterLine(frontmatter, "metadata");
  const hasCompatibleDescription =
    descriptionLine === GRILL_UPSTREAM_DESCRIPTION ||
    descriptionLine === GRILL_CORE_DESCRIPTION;
  const hasInvocationGuard =
    invocationLine === "disable-model-invocation: true";
  const canInsertInvocationGuard =
    licenseLine === "license: MIT" &&
    metadataLine === "metadata:" &&
    frontmatter.includes("license: MIT\nmetadata:");

  if (
    nameLine !== "name: grill-for-unknowns" ||
    !hasCompatibleDescription ||
    (!hasInvocationGuard && !canInsertInvocationGuard)
  ) {
    throw new Error(
      `Incompatible grill-for-unknowns frontmatter in ${path.relative(repoRoot, skillPath)}; review upstream discovery metadata before replacing the canonical skill.`,
    );
  }
}

async function assertPostRefreshCompatibility(skillName, targetRoot) {
  if (skillName !== "grill-for-unknowns") {
    return;
  }

  const skillPath = path.join(targetRoot, "SKILL.md");
  const frontmatter = readFrontmatter(
    await readFile(skillPath, "utf8"),
    skillPath,
  );
  const nameLine = getTopLevelFrontmatterLine(frontmatter, "name");
  const descriptionLine = getTopLevelFrontmatterLine(
    frontmatter,
    "description",
  );
  const invocationLine = getTopLevelFrontmatterLine(
    frontmatter,
    "disable-model-invocation",
  );
  if (
    nameLine !== "name: grill-for-unknowns" ||
    descriptionLine !== GRILL_CORE_DESCRIPTION ||
    invocationLine !== "disable-model-invocation: true"
  ) {
    throw new Error(
      `Core grill-for-unknowns discovery compatibility was not applied to ${path.relative(repoRoot, skillPath)}.`,
    );
  }
}

function getErrorCode(error) {
  return typeof error === "object" && error !== null && "code" in error
    ? String(error.code)
    : "";
}

function getTemporarySiblingPath(targetPath, label) {
  const parentDir = path.dirname(targetPath);
  const targetName = path.basename(targetPath);
  const uniqueSuffix = `${process.pid}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;

  return path.join(parentDir, `.${targetName}.${label}-${uniqueSuffix}`);
}

async function prepareSkillRefresh({ skillName, from, preserve = [] }) {
  const to = path.join(canonicalRoot, skillName);
  const staging = getTemporarySiblingPath(to, "refresh-staging");

  if (skillName === "emil-design-engineering" && !process.env.HOME?.trim()) {
    throw new Error(
      `refreshSkill (${skillName}): HOME is not set (or empty); cannot resolve ~/.cursor/skills/${skillName}.`,
    );
  }

  try {
    await access(from);
  } catch {
    throw new Error(
      `refreshSkill: source path does not exist — "${from}"\n` +
        `Aborting to avoid deleting canonical tree at "${to}".\n` +
        `Run the upstream installer first (e.g. the animations.dev curl | bash), then retry.`,
    );
  }

  await assertRefreshSourceCompatibility(skillName, from);
  const preservedFiles = await readPreservedFiles(to, preserve);
  const preservedCoreOverlay = await readCoreOverlay(to);

  await mkdir(path.dirname(staging), { recursive: true });
  await rm(staging, { recursive: true, force: true });

  try {
    await cp(from, staging, { recursive: true });
    await restorePreservedFiles(staging, preservedFiles);
    await restoreCoreOverlay(staging, preservedCoreOverlay);
    await applyPostRefreshReplacements(skillName, staging);
    await assertPostRefreshCompatibility(skillName, staging);
  } catch (error) {
    await rm(staging, { recursive: true, force: true });
    throw error;
  }

  return { skillName, from, to, staging };
}

async function prepareSkillRefreshes(sources) {
  const preparedRefreshes = [];

  try {
    for (const source of sources) {
      preparedRefreshes.push(await prepareSkillRefresh(source));
    }
    return preparedRefreshes;
  } catch (error) {
    await Promise.all(
      preparedRefreshes.map(({ staging }) =>
        rm(staging, { recursive: true, force: true }),
      ),
    );
    throw error;
  }
}

async function swapPreparedRefresh(preparedRefresh) {
  const { to, staging } = preparedRefresh;
  const backup = getTemporarySiblingPath(to, "refresh-backup");
  let hasBackup = false;

  try {
    await rename(to, backup);
    hasBackup = true;
  } catch (error) {
    if (getErrorCode(error) !== "ENOENT") {
      throw error;
    }
  }

  try {
    await rename(staging, to);
  } catch (error) {
    if (hasBackup) {
      await rename(backup, to);
    }
    throw error;
  }

  return { ...preparedRefresh, backup, hasBackup };
}

async function rollbackSwappedRefresh(swappedRefresh) {
  const { to, backup, hasBackup } = swappedRefresh;
  await rm(to, { recursive: true, force: true });
  if (hasBackup) {
    await rename(backup, to);
  }
}

async function commitPreparedRefreshes(preparedRefreshes) {
  const swappedRefreshes = [];

  try {
    for (const preparedRefresh of preparedRefreshes) {
      swappedRefreshes.push(await swapPreparedRefresh(preparedRefresh));
    }
  } catch (error) {
    for (const swappedRefresh of swappedRefreshes.reverse()) {
      await rollbackSwappedRefresh(swappedRefresh);
    }
    throw error;
  } finally {
    await Promise.all(
      preparedRefreshes.map(({ staging }) =>
        rm(staging, { recursive: true, force: true }),
      ),
    );
  }

  for (const { backup, hasBackup } of swappedRefreshes) {
    if (hasBackup) {
      try {
        await rm(backup, { recursive: true, force: true });
      } catch (cleanupError) {
        console.warn(
          `warning: failed to remove refresh backup ${backup}`,
          cleanupError,
        );
      }
    }
  }
}

async function refreshSkillsAtomically(sources) {
  const preparedRefreshes = await prepareSkillRefreshes(sources);
  await commitPreparedRefreshes(preparedRefreshes);

  for (const { from, to } of preparedRefreshes) {
    console.log(
      `refreshed ${path.relative(repoRoot, to)} <= ${path.relative(repoRoot, from)}`,
    );
  }
}

async function assertFocusedSourcesAvailable(sourceGroup, sources) {
  const missingSources = [];

  for (const source of sources) {
    try {
      await access(source.from);
    } catch {
      missingSources.push(
        `${source.skillName}: ${path.relative(repoRoot, source.from)}`,
      );
    }
  }

  if (missingSources.length > 0) {
    throw new Error(
      `Focused upstream refresh for ${sourceGroup} requires every source to be installed before any canonical skill is changed:\n${missingSources.join("\n")}`,
    );
  }
}

async function main() {
  const onlyArgument = process.argv
    .slice(2)
    .find(
      (argument) => argument === "--only" || argument.startsWith("--only="),
    );

  if (onlyArgument === "--only") {
    throw new Error("The --only filter requires --only=<source-group>");
  }

  const onlySourceGroup = onlyArgument?.slice("--only=".length).trim();
  if (onlyArgument && !onlySourceGroup) {
    throw new Error("The --only filter requires a non-empty source group");
  }

  const sources = onlySourceGroup
    ? upstreamSources.filter((source) => source.sourceGroup === onlySourceGroup)
    : upstreamSources;

  if (onlySourceGroup && sources.length === 0) {
    throw new Error(`Unknown upstream source group: ${onlySourceGroup}`);
  }

  if (onlySourceGroup) {
    await assertFocusedSourcesAvailable(onlySourceGroup, sources);
    try {
      await refreshSkillsAtomically(sources);
    } catch (error) {
      throw new Error(
        `Focused upstream refresh for ${onlySourceGroup} failed without changing canonical skills`,
        { cause: error },
      );
    }
  } else {
    let skipped = 0;
    for (const source of sources) {
      try {
        await refreshSkillsAtomically([source]);
      } catch (error) {
        console.warn(
          `[warn] skipping ${source.skillName}: ${error instanceof Error ? error.message : String(error)}`,
        );
        skipped += 1;
      }
    }
    if (skipped > 0) {
      console.warn(
        `${skipped} skill(s) skipped — install their upstream sources to refresh them.`,
      );
    }
  }
  console.log(
    "upstream skill refresh complete — run `bun run skills:sync` then `bun run skills:verify`",
  );
}

main().catch((error) => {
  console.error("refresh-upstream-skills failed");
  console.error(error);
  process.exit(1);
});
