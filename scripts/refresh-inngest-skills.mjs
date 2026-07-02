#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const skillsRoot = path.join(repoRoot, "docs", "ai", "skills");

const INNGEST_SKILLS_REF = "c1996f94a1c39a10a56bb848a2ce7701bfe7346d";
const INNGEST_CODEX_PLUGIN_REF = "6e550e39970dcc989d7b0c0b6c4aa44dc0f56c3e";
const INNGEST_CLAUDE_PLUGIN_REF = "bf1b06ea9de8790c679ed54f3ef04e1334d3fb96";

const coreSkills = [
  "inngest-setup",
  "inngest-events",
  "inngest-durable-functions",
  "inngest-steps",
  "inngest-flow-control",
  "inngest-middleware",
  "inngest-realtime",
];

const codexSkills = [
  "inngest-brownfield-audit",
  "inngest-agents",
  "inngest-v3-v4-migration",
  "inngest-api",
];

const upstreamSkills = [
  ...coreSkills.map((skillName) => ({
    skillName,
    repo: "inngest/inngest-skills",
    ref: INNGEST_SKILLS_REF,
    sourcePath: `skills/${skillName}/SKILL.md`,
    license: "Apache-2.0",
  })),
  ...codexSkills.map((skillName) => ({
    skillName,
    repo: "inngest/inngest-codex-plugin",
    ref: INNGEST_CODEX_PLUGIN_REF,
    sourcePath: `plugins/inngest/skills/${skillName}/SKILL.md`,
    license: "MIT",
  })),
];

const licenseSources = [
  {
    fileName: "LICENSE-inngest-skills-Apache-2.0.txt",
    repo: "inngest/inngest-skills",
    ref: INNGEST_SKILLS_REF,
    sourcePath: "LICENSE",
  },
  {
    fileName: "LICENSE-inngest-codex-plugin-MIT.txt",
    repo: "inngest/inngest-codex-plugin",
    ref: INNGEST_CODEX_PLUGIN_REF,
    sourcePath: "LICENSE",
  },
];

const referenceSources = [
  {
    fileName: "expressions.md",
    repo: "inngest/inngest-skills",
    ref: INNGEST_SKILLS_REF,
    sourcePath: "skills/references/expressions.md",
    targetSkillName: "inngest",
  },
  {
    fileName: "step-execution.md",
    repo: "inngest/inngest-skills",
    ref: INNGEST_SKILLS_REF,
    sourcePath: "skills/inngest-durable-functions/references/step-execution.md",
    targetSkillName: "inngest-durable-functions",
  },
  {
    fileName: "error-handling.md",
    repo: "inngest/inngest-skills",
    ref: INNGEST_SKILLS_REF,
    sourcePath: "skills/inngest-durable-functions/references/error-handling.md",
    targetSkillName: "inngest-durable-functions",
  },
  {
    fileName: "observability.md",
    repo: "inngest/inngest-skills",
    ref: INNGEST_SKILLS_REF,
    sourcePath: "skills/inngest-durable-functions/references/observability.md",
    targetSkillName: "inngest-durable-functions",
  },
  {
    fileName: "checkpointing.md",
    repo: "inngest/inngest-skills",
    ref: INNGEST_SKILLS_REF,
    sourcePath: "skills/inngest-durable-functions/references/checkpointing.md",
    targetSkillName: "inngest-durable-functions",
  },
  {
    fileName: "dependency-injection.md",
    repo: "inngest/inngest-skills",
    ref: INNGEST_SKILLS_REF,
    sourcePath: "skills/inngest-middleware/references/dependency-injection.md",
    targetSkillName: "inngest-middleware",
  },
  {
    fileName: "built-in-middleware.md",
    repo: "inngest/inngest-skills",
    ref: INNGEST_SKILLS_REF,
    sourcePath: "skills/inngest-middleware/references/built-in-middleware.md",
    targetSkillName: "inngest-middleware",
  },
  {
    fileName: "agent-friction.md",
    repo: "inngest/inngest-codex-plugin",
    ref: INNGEST_CODEX_PLUGIN_REF,
    sourcePath:
      "plugins/inngest/skills/inngest-api/references/agent-friction.md",
    targetSkillName: "inngest-api",
  },
];

function rawUrl({ repo, ref, sourcePath }) {
  return `https://raw.githubusercontent.com/${repo}/${ref}/${sourcePath}`;
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unable to fetch ${url}: ${response.status}`);
  }

  return response.text();
}

async function writeSkill({ skillName, repo, ref, sourcePath, license }) {
  const upstreamContent = await fetchText(rawUrl({ repo, ref, sourcePath }));
  const content = applyRepoOverlay(skillName, upstreamContent);
  const skillDir = path.join(skillsRoot, skillName);

  await mkdir(skillDir, { recursive: true });
  await writeFile(path.join(skillDir, "SKILL.md"), content, "utf8");

  console.log(
    `refreshed ${skillName} from ${repo}/${sourcePath} (${ref}, ${license})`,
  );
}

async function writeReference({
  fileName,
  repo,
  ref,
  sourcePath,
  targetSkillName,
}) {
  const referenceText = await fetchText(rawUrl({ repo, ref, sourcePath }));
  const referencesDir = path.join(skillsRoot, targetSkillName, "references");

  await mkdir(referencesDir, { recursive: true });
  await writeFile(path.join(referencesDir, fileName), referenceText, "utf8");

  console.log(
    `refreshed ${targetSkillName}/references/${fileName} from ${repo}/${sourcePath} (${ref})`,
  );
}

function applyRepoOverlay(skillName, content) {
  let nextContent = content;

  nextContent = nextContent.replaceAll(
    "../references/expressions.md",
    "../inngest/references/expressions.md",
  );

  if (skillName === "inngest-agents") {
    const beforeAgentOverlay = nextContent;
    nextContent = nextContent.replace(
      [
        "When starting a durable support or tool-calling agent from scratch, inspect the",
        "companion example at `../../examples/durable-agent`. It shows the expected",
        "agent-first shape: quick HTTP trigger, typed events, AgentKit inside an",
        "Inngest function, step-scoped context loading, human approval with",
        "`step.waitForEvent`, and durable side effects after approval.",
      ].join("\n"),
      [
        "When starting a durable support or tool-calling agent from scratch, use the",
        "official `inngest/inngest-codex-plugin` companion example at",
        "`plugins/inngest/examples/durable-agent` as the upstream reference. This repo",
        "does not vendor Codex plugin examples; copy only the patterns needed for a",
        "separate product integration change.",
      ].join("\n"),
    );

    if (nextContent === beforeAgentOverlay) {
      throw new Error(
        "Unable to apply inngest-agents companion example overlay; upstream text changed.",
      );
    }
  }

  return `${nextContent.trimEnd()}

## This Repository

These upstream Inngest instructions are vendored for agent tooling and
integration work in this monorepo.

## Repository Triggers

Use this skill when \`${skillName}\` matches the current Inngest task. If the
right skill is unclear, start with \`docs/ai/skills/inngest/SKILL.md\`.

## Repository Workflow

1. Confirm whether the request is agent-tooling guidance or product runtime
   integration.
2. Use \`inngest-brownfield-audit\` before changing existing app workflows or
   fragile background work.
3. Follow this upstream guidance under OpenSpec, root \`AGENTS.md\`, repo
   rulebooks, framework docs, and runtime evidence.
4. Keep runtime packages, app code, migrations, and \`INNGEST_*\` env
   requirements out of agent-tooling-only changes.

## Repository Checklist

- [ ] The task has explicit product-runtime scope before adding Inngest app code
      or dependencies.
- [ ] Existing workflows were audited before introducing or changing durable
      workflow behavior.
- [ ] Any MCP usage is backed by a running Inngest dev server on the configured
      port.
- [ ] Upstream source and license attribution remain documented in
      \`docs/ai/skills/inngest/references/upstream.md\`.
`;
}

function routerSkill() {
  return `---
name: inngest
description: Router for official Inngest agent skills. Use when you are unsure which specific Inngest skill applies.
---

# Inngest Skill Router

This repository vendors official Inngest agent skills for integration work.
Use this router only to choose the specific skill to load next.

## This Repository

- Inngest is currently planned or referenced in this repo, not an app runtime
  dependency.
- Do not add runtime packages, app code, migrations, or \`INNGEST_*\` env vars
  unless the user explicitly asks for product Inngest integration and the work
  has its own OpenSpec scope.
- Inngest skills are subordinate to OpenSpec, root \`AGENTS.md\`, repo rulebooks,
  framework docs, and runtime evidence.

## Route by Task

- Existing workflow or background-job audit before changes:
  \`docs/ai/skills/inngest-brownfield-audit/SKILL.md\`
- New product runtime setup:
  \`docs/ai/skills/inngest-setup/SKILL.md\`
- Events and schemas:
  \`docs/ai/skills/inngest-events/SKILL.md\`
- Durable functions:
  \`docs/ai/skills/inngest-durable-functions/SKILL.md\`
- Step design and \`step.*\` usage:
  \`docs/ai/skills/inngest-steps/SKILL.md\`
- Concurrency, throttling, retries, cancellation, or batching:
  \`docs/ai/skills/inngest-flow-control/SKILL.md\`
- Middleware:
  \`docs/ai/skills/inngest-middleware/SKILL.md\`
- Realtime:
  \`docs/ai/skills/inngest-realtime/SKILL.md\`
- Durable AI agent workflows:
  \`docs/ai/skills/inngest-agents/SKILL.md\`
- Existing v3 to v4 migration only:
  \`docs/ai/skills/inngest-v3-v4-migration/SKILL.md\`
- Inngest API or CLI operations:
  \`docs/ai/skills/inngest-api/SKILL.md\`

## Checklist

- [ ] Confirm whether the repo already has Inngest runtime code.
- [ ] Load the most specific official Inngest skill for the task.
- [ ] Keep product runtime adoption out of agent-tooling-only changes.
- [ ] Use the Inngest dev-server MCP only when the dev server is running and
      the configured port matches the active server.
`;
}

function upstreamReference() {
  const rows = upstreamSkills
    .map(
      ({ skillName, repo, ref, sourcePath, license }) =>
        `| \`${skillName}\` | \`${repo}\` | \`${sourcePath}\` | \`${ref}\` | ${license} |`,
    )
    .join("\n");

  return `# Inngest Skills Upstream

This directory documents the official upstream sources for the Inngest skills
vendored into \`docs/ai/skills/inngest-*\`.

## Sources

| Skill | Repository | Source path | Commit SHA | License |
| ----- | ---------- | ----------- | ---------- | ------- |
${rows}

The \`inngest\` skill in this repository is a repo-local router that replaces an
older mirror-only unofficial skill. It is not copied from upstream.

The official Claude Code plugin was reviewed for install instructions and MCP
behavior:

| Repository | Commit SHA | License |
| ---------- | ---------- | ------- |
| \`inngest/inngest-claude-code-plugin\` | \`${INNGEST_CLAUDE_PLUGIN_REF}\` | MIT |

## License Text

The license text copied from the exact upstream refs is preserved in:

- \`LICENSE-inngest-skills-Apache-2.0.txt\`
- \`LICENSE-inngest-codex-plugin-MIT.txt\`

## Refresh Workflow

Run the targeted refresh, then refresh mirrors and verify drift:

\`\`\`bash
bun run skills:refresh-inngest
bun run skills:sync
bun run skills:verify
\`\`\`

The refresh script downloads only the official \`SKILL.md\` files listed above.
It also downloads the referenced markdown files needed by those skills so local
links stay readable and \`bun run skills:verify\` can catch reference drift. It
does not vendor Codex plugin evals, examples, assets, or product runtime code.
It applies one repo overlay to \`inngest-agents\` so the upstream companion
example path points at \`inngest/inngest-codex-plugin\` instead of implying a
local example directory exists.

## Manual Source Commands

\`\`\`bash
git clone https://github.com/inngest/inngest-skills.git /tmp/inngest-skills
git -C /tmp/inngest-skills checkout ${INNGEST_SKILLS_REF}

git clone https://github.com/inngest/inngest-codex-plugin.git /tmp/inngest-codex-plugin
git -C /tmp/inngest-codex-plugin checkout ${INNGEST_CODEX_PLUGIN_REF}
\`\`\`

Copy the files listed in the source table into their matching
\`docs/ai/skills/<skill-name>/SKILL.md\` paths, then run the sync and verify
commands above.
`;
}

async function writeRouterAndReferences() {
  const routerDir = path.join(skillsRoot, "inngest");
  const referencesDir = path.join(routerDir, "references");

  await mkdir(referencesDir, { recursive: true });
  await writeFile(path.join(routerDir, "SKILL.md"), routerSkill(), "utf8");
  await writeFile(
    path.join(referencesDir, "upstream.md"),
    upstreamReference(),
    "utf8",
  );

  for (const licenseSource of licenseSources) {
    const licenseText = await fetchText(rawUrl(licenseSource));
    await writeFile(
      path.join(referencesDir, licenseSource.fileName),
      licenseText,
      "utf8",
    );
  }

  console.log("refreshed inngest router and upstream reference");
}

async function main() {
  for (const skill of upstreamSkills) {
    await writeSkill(skill);
  }

  for (const reference of referenceSources) {
    await writeReference(reference);
  }

  await writeRouterAndReferences();
}

main().catch((error) => {
  console.error("Inngest skill refresh failed");
  console.error(error);
  process.exit(1);
});
