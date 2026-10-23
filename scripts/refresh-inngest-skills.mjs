#!/usr/bin/env node

import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const skillsRoot = path.join(repoRoot, "docs", "ai", "skills");

const INNGEST_SKILLS_REF = "082798a627bbe9c3ed3a6638a9f56116a035f122";
const INNGEST_CODEX_PLUGIN_REF = "351e14c55a01f3924ab47f9feb69bae615b8bb52";
const INNGEST_CLAUDE_PLUGIN_REF = "10536d34e593c436a76df9d313a66f480ea318c6";

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
  "inngest-api-cli",
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
    fileName: "rest-api-v2.md",
    repo: "inngest/inngest-codex-plugin",
    ref: INNGEST_CODEX_PLUGIN_REF,
    sourcePath: "plugins/inngest/skills/inngest-api/references/rest-api-v2.md",
    targetSkillName: "inngest-api",
  },
  {
    fileName: "cli-commands.md",
    repo: "inngest/inngest-codex-plugin",
    ref: INNGEST_CODEX_PLUGIN_REF,
    sourcePath:
      "plugins/inngest/skills/inngest-api-cli/references/cli-commands.md",
    targetSkillName: "inngest-api-cli",
  },
];

const retiredReferenceFiles = [
  {
    targetSkillName: "inngest-api",
    fileName: "agent-friction.md",
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
  let referenceText = await fetchText(rawUrl({ repo, ref, sourcePath }));
  if (targetSkillName === "inngest-api" && fileName === "rest-api-v2.md") {
    const upstreamLink = "(cli-commands.md#insights-sql-over-execution-data)";
    if (!referenceText.includes(upstreamLink)) {
      throw new Error(
        "Unable to apply Inngest API companion reference overlay; upstream link changed.",
      );
    }
    referenceText = referenceText.replace(
      upstreamLink,
      "(../../inngest-api-cli/references/cli-commands.md#insights-sql-over-execution-data)",
    );
  }
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

  if (["inngest-api", "inngest-api-cli"].includes(skillName)) {
    const cloudRoute =
      "For Cloud operations with connected MCP tools, use `inngest-cloud` first.";
    if (!nextContent.includes(cloudRoute)) {
      throw new Error(
        "Unable to apply Inngest Cloud routing overlay; upstream text changed.",
      );
    }
    nextContent = nextContent.replace(
      cloudRoute,
      "For Cloud operations, prefer available connected Inngest Cloud MCP tools. This repository does not install the upstream inngest-cloud skill.",
    );
  }

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
- [ ] Local dev-server MCP usage is backed by a running Inngest dev server on the configured
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

- Core already uses Inngest as a runtime dependency in \`packages/api/package.json\`.
  The owned client is \`packages/api/src/workflows/inngest/client.ts\`; registered
  handlers live in \`packages/api/src/workflows/serve.ts\` and are exposed through
  the thin \`apps/admin/app/api/inngest/route.ts\` route.
- Audit those existing workflows before changing runtime behavior. Follow
  \`docs/guides/features/inngest-workflows/local-development.md\` for local setup
  and durability limits; installed runtime code does not prove live Cloud
  qualification.
- Keep new runtime adoption, provider provisioning, migrations and \`INNGEST_*\`
  environment changes out of agent-tooling-only changes. Product runtime changes
  require the user's task scope and the relevant OpenSpec change.
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
- Inngest CLI API operations (\`npx inngest-cli@latest api\`):
  \`docs/ai/skills/inngest-api-cli/SKILL.md\`
- Raw Inngest REST API v2, OpenAPI, or HTTP:
  \`docs/ai/skills/inngest-api/SKILL.md\`

## Checklist

- [ ] Inspect Core's existing client, registered functions and thin serving route.
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
It applies repository workflow and ownership guidance to all twelve installed skills.
The adapters repair shared expressions links and point the durable-agent example
at \`inngest/inngest-codex-plugin\` instead of implying a local example directory
exists. API and API-CLI routing uses available connected Cloud MCP tools rather
than requiring an uninstalled \`inngest-cloud\` skill; explicit terminal and HTTP
fallback remain available. Local dev-server MCP requirements are separate from
Cloud OAuth. The API REST reference points Insights queries at the separate
installed CLI companion.

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

## Reviewed refresh 2026-10-22

Advanced immutable source pins after reviewing the complete upstream comparisons. The seven imported core skills and three non-API Codex skills are content-current; only API and API-CLI add Cloud MCP-first routing. Core maps the uninstalled inngest-cloud skill to available connected Cloud MCP tools, keeps explicit terminal/HTTP fallback, and distinguishes local dev-server MCP from Cloud OAuth. No new pack members or runtime packages were installed.

The API REST reference remaps its Insights cross-link to \`../../inngest-api-cli/references/cli-commands.md\`; the pinned source keeps a bare sibling filename that is not valid in the separate installed skill directories. The refresh adapter requires and rewrites that link before publication.

## Core runtime guidance correction 2026-10-22

The Core-authored router and its \`scripts/refresh-inngest-skills.mjs\` template
identify the installed API runtime, owned client and serving route, and current
local development guide. This corrects the earlier planned-only classification;
it does not establish live Cloud qualification or change upstream pins, notices,
source payloads, runtime code or provider configuration. The offline refresher
regression checks the generated router after repeated refreshes.

After reviewing local guidance changes, run \`bun run skills:sync\`, then
\`node scripts/update-skill-audit-hashes.mjs --skill inngest\` and
\`bun run skills:verify\`. The explicit-name hash command records the final
installed payload only; source, license, historical review and freshness decisions
remain separately owned by the source audit.
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

  for (const retired of retiredReferenceFiles) {
    const retiredPath = path.join(
      skillsRoot,
      retired.targetSkillName,
      "references",
      retired.fileName,
    );
    await rm(retiredPath, { force: true });
  }

  await writeRouterAndReferences();
}

main().catch((error) => {
  console.error("Inngest skill refresh failed");
  console.error(error);
  process.exit(1);
});
