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
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  access,
  cp,
  lstat,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  annotateSecretScannerMentions,
  SECRET_SCANNER_SKIP_SUFFIXES,
} from "./lib/skill-scanner-annotations.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const canonicalRoot = path.join(repoRoot, "docs", "ai", "skills");
const skillsLockPath = path.join(repoRoot, "skills-lock.json");
const lastReviewed =
  process.env.SKILLS_REFRESH_DATE?.trim() ||
  new Date().toISOString().slice(0, 10);
const SAFE_CANONICAL_SKILL_DIR_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CORE_OVERLAY_START = "<!-- CORE-OVERLAY-START -->";
const CORE_OVERLAY_END = "<!-- CORE-OVERLAY-END -->";
const ASK_MATT_MAIN_FLOW_HEADING = "## The main flow: idea → ship";
const ASK_MATT_MAIN_FLOW_STEP_TWO = "2. **Branch";
const GRILL_UPSTREAM_DESCRIPTION =
  "description: Use when starting or reviewing a complex implementation where the user wants an agent to interrogate the plan against docs/source evidence, surface unknown unknowns, and avoid rushing into build mode. Combines docs-grounded grilling with a map-vs-territory unknowns pass.";
const GRILL_CORE_DESCRIPTION =
  "description: Use only when the user explicitly invokes grill-for-unknowns or asks for a map-vs-territory unknowns pass, blindspot discovery, unknown-known prototypes, or a subagent launch packet before implementation.";
const GRILL_REVIEWED_VERSION = "0.1.3";
const MATT_POCOCK_LINEAGE_COMMIT = "391a2701dd948f94f56a39f7533f8eea9a859c87";

const emilKowalskiSkillNames = [
  "animate",
  "animate-expo",
  "animation-vocabulary",
  "apple-design",
  "ask-sonner",
  "emil-design-eng",
  "emil-prototype",
  "improve-animations",
  "mobile-native",
  "pick-ui-library",
  "review-animations",
  "write-swift",
];
const EMIL_EXPLICIT_ONLY_SKILLS = new Set([
  "animate",
  "emil-prototype",
  "mobile-native",
  "pick-ui-library",
  "review-animations",
  "write-swift",
]);
const CORE_EXPLICIT_SKILL_DESCRIPTIONS = {
  animate:
    "Use only when the user explicitly invokes animate for web animation implementation; Core motion uses existing shared UI, tokens and the animation contract.",
  "animate-expo":
    "Use only when the user explicitly requests this skill for Expo or React Native animation. Never route Core Next.js web motion or TypeScript bugs here.",
  "emil-prototype":
    "Use only when the user explicitly invokes emil-prototype for isolated interface experiments outside Core app routes. It does not replace Matt Pocock prototype.",
  "mobile-native":
    "Use only when the user explicitly invokes mobile-native for mobile web viewport, touch, scrolling and safe-area work. It does not auto-route ordinary Core UI tasks.",
  "pick-ui-library":
    "Use only when the user explicitly asks which UI or motion library to use. Prefer installed Core shared components and preserve base-maia.",
  "review-animations":
    "Use only when the user explicitly invokes review-animations for a motion diff review. It does not auto-route ordinary code review.",
  "write-swift":
    "Use only when the user explicitly requests write-swift for Swift code or a Swift-specific concurrency, memory or performance problem. Never route Core web or TypeScript work here.",
  "frontend-design":
    "Use only when the user explicitly requests this frontend-design companion. Preserve Core base-maia, Base UI, shared packages/ui and semantic tokens.",
  "design-taste-frontend":
    "Use only when the user explicitly requests design-taste-frontend for design exploration within the existing Core design system.",
  "redesign-existing-projects":
    "Use only when the user explicitly invokes redesign-existing-projects. Preserve Core shared UI and accepted design intent.",
  "test-driven-development":
    "Use only when the user explicitly requests the obra test-driven-development companion. Core substantive work uses the canonical tdd skill and its documented exceptions.",
};
const ASK_SONNER_UPSTREAM_TOASTER_IMPORT =
  'import { Toaster } from "sonner"; // once, in layout';
const ASK_SONNER_CORE_TOASTER_IMPORT =
  'import { Toaster } from "@asym/ui/components/shadcn/sonner"; // already mounted in Core layouts';

const emilKowalskiSources = emilKowalskiSkillNames.map((skillName) => ({
  sourceGroup: "emilkowalski/skills",
  skillName,
  from: path.join(repoRoot, ".agents", "skills", skillName),
  preserve: ["references/upstream.md", "references/LICENSE.md"],
}));

const jakubKrehelSkillNames = [
  "better-accessibility",
  "better-colors",
  "better-interface",
  "better-layout",
  "better-typography",
  "better-ui",
  "better-writing",
  "interface-review",
];

const jakubKrehelSources = jakubKrehelSkillNames.map((skillName) => ({
  sourceGroup: "jakubkrehel/skills",
  skillName,
  from: path.join(repoRoot, ".agents", "skills", skillName),
  preserve: ["references/upstream.md", "references/LICENSE.md"],
}));

const tasteSkillNames = ["design-taste-frontend", "redesign-existing-projects"];

const tasteSkillSources = tasteSkillNames.map((skillName) => ({
  sourceGroup: "leonxlnx/taste-skill",
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
    preserve: ["references/upstream.md", "AGENTS.md", "CLAUDE.md"],
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
  {
    sourceGroup: "anthropics/skills",
    skillName: "frontend-design",
    from: path.join(repoRoot, ".agents", "skills", "frontend-design"),
    preserve: ["references/upstream.md", "references/LICENSE.md"],
  },
  {
    sourceGroup: "mattpocock/skills",
    skillName: "ask-matt",
    from: path.join(repoRoot, ".agents", "skills", "ask-matt"),
    preserve: ["references/upstream.md"],
  },
  {
    sourceGroup: "obra/superpowers",
    skillName: "test-driven-development",
    from: path.join(repoRoot, ".agents", "skills", "test-driven-development"),
    preserve: ["references/upstream.md", "references/LICENSE.md"],
  },
  ...emilKowalskiSources,
  ...jakubKrehelSources,
  ...tasteSkillSources,
];

const openspecSkillNames = [
  "openspec-explore",
  "openspec-propose",
  "openspec-update-change",
  "openspec-apply-change",
  "openspec-verify-change",
  "openspec-sync-specs",
  "openspec-archive-change",
];

const cursorTeamKitSkillNames = [
  "check-compiler-errors",
  "control-cli",
  "control-ui",
  "deslop",
  "fix-ci",
  "fix-merge-conflicts",
  "get-pr-comments",
  "loop-on-ci",
  "make-pr-easy-to-review",
  "new-branch-and-pr",
  "pr-review-canvas",
  "review-and-ship",
  "run-smoke-tests",
  "thermo-nuclear-code-quality-review",
  "verify-this",
  "weekly-review",
  "what-did-i-get-done",
  "workflow-from-chats",
];

/**
 * Repo-local vendored skills refreshed directly from GitHub (shallow clone),
 * unlike `upstreamSources`, which copy from local install targets.
 * Keep `emilkowalski/skills` on `upstreamSources`: that path hashes clone
 * `SKILL.md` bytes for the lockfile. `prepareGithubSkillRefresh()` hashes
 * staging after overlay restore and must not become the Emil lock source.
 */
const githubUpstreamGroups = [
  {
    name: "Cursor Team Kit",
    repo: "https://github.com/cursor/plugins.git",
    source: "cursor/plugins",
    sourceUrl: "https://github.com/cursor/plugins",
    ref: "main",
    sourceRoot: "cursor-team-kit/skills",
    skillNames: cursorTeamKitSkillNames,
    lockSkillPath(skillName) {
      return `cursor-team-kit/skills/${skillName}/SKILL.md`;
    },
    upstreamPath(skillName) {
      return `cursor-team-kit/skills/${skillName}/`;
    },
    sourceUrlForSkill(skillName) {
      return `https://github.com/cursor/plugins/tree/main/cursor-team-kit/skills/${skillName}`;
    },
    extraCopies: [
      {
        from: "cursor-team-kit/agents/ci-watcher.md",
        to: ".cursor/agents/ci-watcher.md",
      },
      {
        from: "cursor-team-kit/agents/thermo-nuclear-code-quality-review.md",
        to: ".cursor/agents/thermo-nuclear-code-quality-review.md",
      },
    ],
  },
  {
    name: "Babysitter Cursor",
    repo: "https://github.com/a5c-ai/babysitter-cursor.git",
    source: "a5c-ai/babysitter-cursor",
    sourceUrl: "https://github.com/a5c-ai/babysitter-cursor",
    ref: "main",
    sourceRoot: "skills",
    skillNames: ["babysit"],
    lockSkillPath() {
      return "skills/babysit/SKILL.md";
    },
    upstreamPath(skillName) {
      return `skills/${skillName}/`;
    },
    sourceUrlForSkill(skillName) {
      return `https://github.com/a5c-ai/babysitter-cursor/tree/main/skills/${skillName}`;
    },
    skillExtraCopies: {
      babysit: [
        {
          from: "versions.json",
          to: "versions.json",
        },
      ],
    },
  },
  {
    name: "OpenSpec",
    repo: "https://github.com/Fission-AI/OpenSpec.git",
    source: "Fission-AI/OpenSpec",
    sourceUrl: "https://github.com/Fission-AI/OpenSpec",
    ref: "v1.9.0",
    sourceRoot: "skills",
    skillNames: openspecSkillNames,
    lockSkillPath(skillName) {
      return `skills/${skillName}/SKILL.md`;
    },
    upstreamPath(skillName) {
      return `skills/${skillName}/`;
    },
    sourceUrlForSkill(skillName) {
      return `https://github.com/Fission-AI/OpenSpec/tree/v1.9.0/skills/${skillName}`;
    },
    skillExtraCopies: Object.fromEntries(
      openspecSkillNames.map((skillName) => [
        skillName,
        [{ from: "LICENSE", to: "references/LICENSE.md" }],
      ]),
    ),
  },
];

const BABYSIT_UPSTREAM_DEPENDENCY_BLOCK = `Read the SDK version from \`versions.json\` to ensure version compatibility:

\`\`\`bash
SDK_VERSION=$(node -e "try{console.log(JSON.parse(require('fs').readFileSync('\${CURSOR_PLUGIN_ROOT}/versions.json','utf8')).sdkVersion||'latest')}catch{console.log('latest')}")
npm i -g @a5c-ai/babysitter-sdk@$SDK_VERSION || npm i -g @a5c-ai/babysitter-sdk@latest

if command -v babysitter >/dev/null 2>&1 && babysitter --version >/dev/null 2>&1; then
  CLI="babysitter"
else
  CLI="npm exec --yes --package @a5c-ai/babysitter-sdk@$SDK_VERSION -- babysitter"
fi
\`\`\`

If the pinned version fails to install (e.g. not yet published), the fallback installs \`latest\`.

If a stale or broken global shim fails with \`MODULE_NOT_FOUND\`, repair it with \`npm rm -g @a5c-ai/babysitter @a5c-ai/babysitter-sdk && npm i -g @a5c-ai/babysitter-sdk@$SDK_VERSION\`, then re-run \`babysitter --version\`.`;

const BABYSIT_CORE_DEPENDENCY_BLOCK = `Resolve the repository root and read the reviewed SDK version from
\`docs/ai/skills/babysit/versions.json\`. Stop immediately if the repository root
or an exact package version cannot be resolved:

\`\`\`bash
REPO_ROOT=$(git rev-parse --show-toplevel) || exit 1
SDK_VERSION=$(
  node -e '
const fs = require("node:fs");
const path = require("node:path");

const versionsPath = path.join(
  process.argv[1],
  "docs/ai/skills/babysit/versions.json",
);
const exactVersionPattern = /^(?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)(?:-[0-9A-Za-z-]+(?:\\.[0-9A-Za-z-]+)*)?(?:\\+[0-9A-Za-z-]+(?:\\.[0-9A-Za-z-]+)*)?$/;

try {
  const versions = JSON.parse(fs.readFileSync(versionsPath, "utf8"));
  const sdkVersion = versions.sdkVersion;

  if (typeof sdkVersion !== "string" || !exactVersionPattern.test(sdkVersion)) {
    throw new Error("sdkVersion must be a nonempty exact package version");
  }

  process.stdout.write(sdkVersion);
} catch (error) {
  console.error(\`Unable to resolve the pinned Babysitter SDK version: \${error.message}\`);
  process.exit(1);
}
' "$REPO_ROOT"
) || exit 1

CLI="npm exec --yes --package @a5c-ai/babysitter-sdk@$SDK_VERSION -- babysitter"
\`\`\``;

const BABYSIT_UPSTREAM_INSTRUCTIONS_BLOCK = `Run the following command to get full instructions:

\`\`\`bash
$CLI instructions:babysit-skill --harness cursor --interactive
\`\`\`

For non-interactive mode (running with \`-p\` flag or no AskUserQuestion tool):

\`\`\`bash
$CLI instructions:babysit-skill --harness cursor --no-interactive
\`\`\`

Follow the instructions returned by the command above to orchestrate the run.`;

const BABYSIT_CORE_INSTRUCTIONS_BLOCK = `Run the non-interactive Cursor harness instructions so they can be reconciled
with the Core overlay's in-turn loop:

\`\`\`bash
$CLI instructions:babysit-skill --harness cursor --no-interactive
\`\`\`

Follow the returned instructions only where they do not conflict with this
file's Core overlay. In Cursor, keep driving \`$CLI run:iterate\` in this same
turn; do not switch to interactive mode or rely on a Stop hook.`;

const POST_REFRESH_REPLACEMENTS = [
  {
    skillName: "babysit",
    relativePath: "SKILL.md",
    search: BABYSIT_UPSTREAM_INSTRUCTIONS_BLOCK,
    replace: BABYSIT_CORE_INSTRUCTIONS_BLOCK,
    required: true,
  },
  {
    skillName: "babysit",
    relativePath: "SKILL.md",
    search: BABYSIT_UPSTREAM_DEPENDENCY_BLOCK,
    replace: BABYSIT_CORE_DEPENDENCY_BLOCK,
    required: true,
  },
  {
    skillName: "animation-vocabulary",
    relativePath: "SKILL.md",
    search:
      "```\n**Stagger** — Animate several items one after another with a small delay between each, creating a cascade.",
    replace:
      "```text\n**Stagger** — Animate several items one after another with a small delay between each, creating a cascade.",
    required: true,
  },
  {
    skillName: "animation-vocabulary",
    relativePath: "SKILL.md",
    search:
      "```\n**Origin-aware animation** — An element animates out of its trigger, like a popover growing from the button that opened it instead of from its own center which is the default in CSS.",
    replace:
      "```text\n**Origin-aware animation** — An element animates out of its trigger, like a popover growing from the button that opened it instead of from its own center which is the default in CSS.",
    required: true,
  },
  {
    skillName: "animation-vocabulary",
    relativePath: "SKILL.md",
    search:
      "```\n**Morph** — One shape smoothly turns into another shape, e.g. Dynamic Island.",
    replace:
      "```text\n**Morph** — One shape smoothly turns into another shape, e.g. Dynamic Island.",
    required: true,
  },
  {
    skillName: "animation-vocabulary",
    relativePath: "SKILL.md",
    search:
      "```\n**Rubber-banding** — Resistance and snap-back when you drag past a boundary (the iOS overscroll feel).",
    replace:
      "```text\n**Rubber-banding** — Resistance and snap-back when you drag past a boundary (the iOS overscroll feel).",
    required: true,
  },
  {
    skillName: "apple-design",
    relativePath: "SKILL.md",
    search:
      "```\nrelativeVelocity = gestureVelocity / (targetValue − currentValue)\n```",
    replace:
      "```text\nrelativeVelocity = gestureVelocity / (targetValue − currentValue)\n```",
    required: true,
  },
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
    skillName: "frontend-design",
    relativePath: "SKILL.md",
    search: "license: Complete terms in LICENSE.txt\n---",
    replace:
      "license: Complete terms in LICENSE.txt\ndisable-model-invocation: true\n---",
    required: true,
  },
  {
    skillName: "ask-matt",
    relativePath: "SKILL.md",
    search:
      "- **`/wait-what`** is the corrective for a message that didn't land. Use it mid-conversation, inside any other skill, and the agent re-pitches what it just said with the context you were missing, in plain English, using the `CONTEXT.md` vocabulary. It works after the fact; `/grill-with-docs` is the upfront cure, because a shared language agreed early is what stops the jargon arriving at all.",
    replace:
      "- **Plain-English re-explanation** is the corrective for a message that didn't land. Use it mid-conversation, inside any other skill: re-pitch what you just said with the context the user was missing, in plain English, using the `CONTEXT.md` vocabulary. It works after the fact; `/grill-with-docs` is the upfront cure, because a shared language agreed early is what stops the jargon arriving at all.",
    required: true,
  },
  {
    skillName: "ask-matt",
    relativePath: "SKILL.md",
    search:
      "- **`/to-questionnaire`** comes in when the thing blocking you isn't in your head or the codebase but in **someone else's**, and it writes them a questionnaire to fill in. It's the inverse of `/grill-me`: instead of interviewing you about the subject, it interviews you about the **send** (who it's going to, what you need back) and aims the questions at the gap. What comes back is material for `/grill-with-docs` or `/to-spec`.",
    replace:
      "- **Questionnaire drafting** comes in when the thing blocking you isn't in your head or the codebase but in **someone else's**. Draft the questionnaire directly, aiming the questions at the gap; what comes back is material for `/grill-with-docs` or `/to-spec`.",
    required: true,
  },
  {
    skillName: "ask-matt",
    relativePath: "SKILL.md",
    search:
      "- **`/writing-for-agents`** is the reference for writing documents agents consume: skills, AGENTS.md, pointed-at docs.",
    replace:
      "- **`/writing-great-skills`** is the kept snapshot for writing documents agents consume: skills, AGENTS.md, pointed-at docs. Upstream renamed this to writing-for-agents; Core does not vendor that successor.",
    required: true,
  },
  {
    skillName: "design-taste-frontend",
    relativePath: "SKILL.md",
    search:
      "description: Anti-slop frontend skill for landing pages, portfolios, and redesigns. The agent reads the brief, infers the right design direction, and ships interfaces that do not look templated. Real design systems when applicable, audit-first on redesigns, strict pre-flight check.\n---",
    replace:
      "description: Anti-slop frontend skill for landing pages, portfolios, and redesigns. The agent reads the brief, infers the right design direction, and ships interfaces that do not look templated. Real design systems when applicable, audit-first on redesigns, strict pre-flight check.\ndisable-model-invocation: true\n---",
    required: true,
  },
  {
    skillName: "redesign-existing-projects",
    relativePath: "SKILL.md",
    search:
      "description: Upgrades existing websites and apps to premium quality. Audits current design, identifies generic AI patterns, and applies high-end design standards without breaking functionality. Works with any CSS framework or vanilla CSS.\n---",
    replace:
      "description: Upgrades existing websites and apps to premium quality. Audits current design, identifies generic AI patterns, and applies high-end design standards without breaking functionality. Works with any CSS framework or vanilla CSS.\ndisable-model-invocation: true\n---",
    required: true,
  },
  {
    skillName: "grill-for-unknowns",
    relativePath: "README.md",
    search:
      "`grill-for-unknowns` is an agent skill — usable with Hermes, Claude Code, and Codex — for getting an agent and user to a shared understanding before complex implementation work begins.",
    replace:
      "`grill-for-unknowns` is an agent skill — usable with Hermes and, in Core, Codex, Cursor, and Claude Code — for getting an agent and user to a shared understanding before complex implementation work begins.",
    required: true,
  },
  {
    skillName: "grill-for-unknowns",
    relativePath: "README.md",
    search:
      "This skill inlines the grilling loop and the domain-modeling rules, so it works dropped into any agent — Hermes, Claude Code, or Codex.",
    replace:
      "This skill inlines the grilling loop and the domain-modeling rules, so it works dropped into any agent — Hermes, Codex, Cursor, or Claude Code.",
    required: true,
  },
  {
    skillName: "grill-for-unknowns",
    relativePath: "README.md",
    search:
      "https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md",
    replace: `https://github.com/mattpocock/skills/blob/${MATT_POCOCK_LINEAGE_COMMIT}/skills/engineering/grill-with-docs/SKILL.md`,
    required: true,
  },
  {
    skillName: "grill-for-unknowns",
    relativePath: "README.md",
    search:
      "https://github.com/mattpocock/skills/tree/main/skills/engineering/domain-modeling",
    replace: `https://github.com/mattpocock/skills/tree/${MATT_POCOCK_LINEAGE_COMMIT}/skills/engineering/domain-modeling`,
    required: true,
  },
  {
    skillName: "grill-for-unknowns",
    relativePath: "README.md",
    search:
      "https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md",
    replace: `https://github.com/mattpocock/skills/blob/${MATT_POCOCK_LINEAGE_COMMIT}/skills/productivity/grilling/SKILL.md`,
    required: true,
  },
  {
    skillName: "grill-for-unknowns",
    relativePath: "README.md",
    search: [
      "grill-for-unknowns/",
      "├── SKILL.md",
      "├── README.md",
      "├── references/",
      "│   ├── upstream-lineage.md",
      "│   └── domain-modeling-add-on.md",
      "└── templates/",
    ].join("\n"),
    replace: [
      "grill-for-unknowns/",
      "├── SKILL.md",
      "├── README.md",
      "├── LICENSE",
      "├── .claude-plugin/",
      "│   └── plugin.json",
      "├── references/",
      "│   ├── domain-modeling-add-on.md",
      "│   ├── upstream-lineage.md",
      "│   └── upstream.md",
      "└── templates/",
    ].join("\n"),
    required: true,
  },
  {
    skillName: "grill-for-unknowns",
    relativePath: "references/upstream-lineage.md",
    search: [
      'This skill adapts three upstream Matt Pocock skills plus Thariq\'s "Finding Your Unknowns" article into a single agent skill.',
      "",
      "## Source skills",
    ].join("\n"),
    replace: [
      'This skill adapts three upstream Matt Pocock skills plus Thariq\'s "Finding Your Unknowns" article into a single agent skill.',
      "",
      "The Matt Pocock links below are pinned to commit",
      `\`${MATT_POCOCK_LINEAGE_COMMIT}\`, independently verified as the`,
      "`main` head at the reviewed Nico Bailon package commit timestamp. Core's",
      "canonical `grill-with-docs`, `grilling`, and `domain-modeling` copies and their",
      "lock hashes remain the local source of truth.",
      "",
      "## Source skills",
    ].join("\n"),
    required: true,
  },
  {
    skillName: "grill-for-unknowns",
    relativePath: "references/upstream-lineage.md",
    search:
      "https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md",
    replace: `https://github.com/mattpocock/skills/blob/${MATT_POCOCK_LINEAGE_COMMIT}/skills/engineering/grill-with-docs/SKILL.md`,
    required: true,
  },
  {
    skillName: "grill-for-unknowns",
    relativePath: "references/upstream-lineage.md",
    search:
      "https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md",
    replace: `https://github.com/mattpocock/skills/blob/${MATT_POCOCK_LINEAGE_COMMIT}/skills/productivity/grilling/SKILL.md`,
    required: true,
  },
  {
    skillName: "grill-for-unknowns",
    relativePath: "references/upstream-lineage.md",
    search:
      "https://github.com/mattpocock/skills/tree/main/skills/engineering/domain-modeling",
    replace: `https://github.com/mattpocock/skills/tree/${MATT_POCOCK_LINEAGE_COMMIT}/skills/engineering/domain-modeling`,
    required: true,
  },
  {
    skillName: "grill-for-unknowns",
    relativePath: "references/domain-modeling-add-on.md",
    search:
      "Use this when a grill-for-unknowns session reveals fuzzy terminology, overloaded concepts, or durable architectural/product decisions.",
    replace: [
      "Use this when a grill-for-unknowns session reveals fuzzy terminology, overloaded concepts, or durable architectural/product decisions.",
      "",
      "## Triggers",
      "",
      "- A grill reveals ambiguous, conflicting, or overloaded domain terms.",
      "- A material decision is hard to reverse, surprising without context, and",
      "  represents a real trade-off.",
      "- Do not create domain files merely because the templates exist.",
      "",
      "## Workflow",
      "",
      "1. Inspect the repository's existing language, context maps, and ADR location",
      "   before proposing new files or terms.",
      "2. Challenge ambiguous language during the grill and select one canonical term",
      "   only when the evidence and user decision support it.",
      "3. Create or update `CONTEXT.md` lazily for durable domain language, using the",
      "   format below and the bundled template only when it fits the repository.",
      "4. Offer an ADR only when all three ADR criteria below are satisfied, then use",
      "   the repository's existing format and numbering convention.",
      "5. Verify that recorded terms and decisions match current source evidence and",
      "   the user's confirmed understanding.",
    ].join("\n"),
    required: true,
  },
  {
    skillName: "grill-for-unknowns",
    relativePath: "references/domain-modeling-add-on.md",
    search: "- Non-obvious rejected alternative.",
    replace: [
      "- Non-obvious rejected alternative.",
      "",
      "## Checklist",
      "",
      "- [ ] The trigger is a real terminology or durable-decision need, not template",
      "      availability.",
      "- [ ] Existing repository language and documentation were inspected first.",
      "- [ ] Each recorded term is canonical, concise, and supported by evidence.",
      "- [ ] Files were created or changed lazily in the repository's established",
      "      locations and formats.",
      "- [ ] Every ADR satisfies all three criteria and records the real trade-off.",
      "- [ ] The resulting domain model was checked against source evidence and the",
      "      user's confirmed decision.",
    ].join("\n"),
    required: true,
  },
  {
    skillName: "grill-for-unknowns",
    relativePath: "templates/grill-session.md",
    search: [
      "# Docs-Unknowns Grill Session Template",
      "",
      "Use this as the working document for a planning/interview session.",
    ].join("\n"),
    replace: [
      "# Docs-Unknowns Grill Session Template",
      "",
      "Use this as the working document for a planning/interview session.",
      "",
      "## Triggers",
      "",
      "- Use before complex implementation when the user selected",
      "  `grill-for-unknowns` and material uncertainty remains after inspecting the",
      "  available evidence.",
      "- Do not use for routine work whose facts and low-risk defaults are already",
      "  clear.",
      "",
      "## Workflow",
      "",
      "1. Capture the original request and current map without treating assumptions as",
      "   facts.",
      "2. Inspect the territory and record evidence before asking the user questions.",
      "3. Classify material gaps in the unknowns ledger and sharpen domain language.",
      "4. Walk the design tree one branch at a time, asking only the next unresolved",
      "   material question with a recommended answer.",
      "5. Record resolved assumptions and ADR candidates, then confirm shared",
      "   understanding before creating an implementation launch packet.",
    ].join("\n"),
    required: true,
  },
  {
    skillName: "grill-for-unknowns",
    relativePath: "templates/grill-session.md",
    search:
      "Do not fill until shared understanding is confirmed. Use `launch-packet.md` from this templates folder.",
    replace: [
      "Do not fill until shared understanding is confirmed. Use `launch-packet.md` from this templates folder.",
      "",
      "## Completion Checklist",
      "",
      "- [ ] Territory claims cite current source, tests, docs, config, or an explicit",
      "      user decision.",
      "- [ ] Every material unknown is resolved, visibly assumed, or marked blocked.",
      "- [ ] Canonical terms, user decisions, and any ADR candidates are recorded.",
      "- [ ] The user confirmed shared understanding before the launch packet was",
      "      prepared.",
    ].join("\n"),
    required: true,
  },
  {
    skillName: "grill-for-unknowns",
    relativePath: "templates/implementation-notes.md",
    search: "# Implementation Notes",
    replace: [
      "# Implementation Notes",
      "",
      "## Triggers",
      "",
      "- Use during complex implementation after the plan is confirmed when decisions,",
      "  deviations, or newly discovered unknowns need a durable record.",
      "",
      "## Workflow",
      "",
      "1. Record the confirmed plan snapshot before implementation details drift.",
      "2. Add decisions and deviations as they occur, including evidence, rationale,",
      "   and risk.",
      "3. Resolve, defer, or escalate each new unknown under the launch packet's",
      "   deviation policy.",
      "4. Record the real verification result before declaring the implementation",
      "   complete.",
    ].join("\n"),
    required: true,
  },
  {
    skillName: "grill-for-unknowns",
    relativePath: "templates/implementation-notes.md",
    search: "- <command/test/manual check> — result",
    replace: [
      "- <command/test/manual check> — result",
      "",
      "## Completion Checklist",
      "",
      "- [ ] Decisions and deviations include their reason, evidence, and risk.",
      "- [ ] Every new unknown is resolved, deferred to an owner, or escalated.",
      "- [ ] Notes remain consistent with the confirmed plan and deviation policy.",
      "- [ ] Verification records the command or check and its actual result.",
    ].join("\n"),
    required: true,
  },
  {
    skillName: "grill-for-unknowns",
    relativePath: "templates/launch-packet.md",
    search: "# Subagent / Coding-Agent Launch Packet",
    replace: [
      "# Subagent / Coding-Agent Launch Packet",
      "",
      "## Triggers",
      "",
      "- Use only after a `grill-for-unknowns` session reaches shared understanding and",
      "  complex implementation is ready to hand off to a coding agent or subagent.",
      "- Do not launch while a material decision remains blocked.",
      "",
      "## Workflow",
      "",
      "1. State the confirmed goal and map, then identify the territory the receiving",
      "   agent must inspect before editing.",
      "2. Separate verified facts, chosen defaults, blindspots, and user taste so the",
      "   receiver does not treat assumptions as evidence.",
      "3. Define the deviation policy with explicit continue and stop conditions and a",
      "   durable implementation-notes location.",
      "4. Specify executable verification gates that prove the requested outcome.",
      "5. Recheck the packet against the confirmed session before assigning the work.",
    ].join("\n"),
    required: true,
  },
  {
    skillName: "grill-for-unknowns",
    relativePath: "templates/launch-packet.md",
    search: "- <commands/tests/manual checks>",
    replace: [
      "- <commands/tests/manual checks>",
      "",
      "## Completion Checklist",
      "",
      "- [ ] The goal and acceptance boundary match the user's confirmed intent.",
      "- [ ] Territory paths, evidence, defaults, blindspots, and taste criteria are",
      "      explicit.",
      "- [ ] Continue, stop-and-ask, and deviation-log rules are actionable.",
      "- [ ] Verification gates are concrete and executable by the receiving agent.",
      "- [ ] No material decision remains blocked at launch time.",
    ].join("\n"),
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
    search: "Use appropriate `type` attributes:\n\n```html\n",
    replace:
      "Use appropriate `type` attributes:\n\n<!-- prettier-ignore -->\n```html\n",
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
    skillName: "emil-design-engineering",
    relativePath: "component-design.md",
    search: "4. **asChild** - Render as different element (Radix pattern)",
    replace:
      "4. **Composition** - For link-styled actions, apply `buttonVariants` on `Link` / `<a>` (Base UI `render`, not a Radix Slot wrapper)",
    required: true,
  },
  {
    skillName: "emil-design-engineering",
    relativePath: "component-design.md",
    search: [
      "## The `asChild` Pattern",
      "",
      "Allow rendering as a different element while preserving behavior:",
      "",
      "```jsx",
      "// Render as button (default)",
      "<Button>Click me</Button>",
      "",
      "// Render as link",
      "<Button asChild>",
      '  <a href="/page">Click me</a>',
      "</Button>",
      "",
      "// Render as Next.js Link",
      "<Button asChild>",
      '  <Link href="/page">Click me</Link>',
      "</Button>",
      "```",
      "",
      "Implementation using Radix Slot:",
      "",
      "```jsx",
      'import { Slot } from "@radix-ui/react-slot";',
      "",
      "function Button({ asChild, ...props }) {",
      '  const Comp = asChild ? Slot : "button";',
      "  return <Comp {...props} />;",
      "}",
      "```",
    ].join("\n"),
    replace: [
      "## Link-styled actions (Base UI)",
      "",
      "Core's `Button` is Base UI `ButtonPrimitive` plus `buttonVariants`. Do not add",
      "a Radix Slot wrapper. For a control that should navigate, put the variants on",
      "the real link:",
      "",
      "```jsx",
      'import Link from "next/link";',
      'import { buttonVariants } from "@asym/ui/components/shadcn/button";',
      "",
      '<Link href="/page" className={buttonVariants({ variant: "default" })}>',
      "  Click me",
      "</Link>",
      "```",
      "",
      "When a Base UI primitive must render as another element, use its `render` prop.",
      "Keep that local to the primitive — do not wrap `Button` in a slot helper.",
    ].join("\n"),
    required: true,
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
    skillName: "emil-prototype",
    relativePath: "SKILL.md",
    search: "name: prototype\n",
    replace: "name: emil-prototype\n",
    required: true,
  },
  {
    skillName: "pick-ui-library",
    relativePath: "SKILL.md",
    search: [
      "| One-time ",
      "pass",
      "word",
      " / verification code inputs | [input-otp](https://input-otp.rodz.dev) |",
    ].join(""),
    replace:
      "| OTP / verification code inputs | [input-otp](https://input-otp.rodz.dev) |",
  },
  {
    skillName: "improve-animations",
    relativePath: "PLAN-TEMPLATE.md",
    search:
      "  transition: transform 200ms var(--ease-out), opacity 200ms var(--ease-out);\n  transform-origin: var(--transform-origin);",
    replace:
      "  transition:\n    transform var(--duration-standard) var(--ease-out-soft),\n    opacity var(--duration-standard) var(--ease-out-soft);\n  transform-origin: var(--transform-origin);",
    required: true,
  },
  {
    skillName: "improve-animations",
    relativePath: "PLAN-TEMPLATE.md",
    search: "- **Estimated scope**: <n files, rough size>\n\n## Problem",
    replace: [
      "- **Estimated scope**: <n files, rough size>",
      "",
      "## Triggers",
      "",
      "- Apply this plan when: <observable animation problem and affected interaction>.",
      "- Do not apply when: <conditions that make the finding irrelevant or unsafe>.",
      "",
      "## Problem",
    ].join("\n"),
    required: true,
  },
  {
    skillName: "improve-animations",
    relativePath: "PLAN-TEMPLATE.md",
    search:
      "## Steps\n\n1. <One concrete edit per step: file, what changes, resulting code.>",
    replace:
      "## Workflow\n\n1. <One concrete edit per step: file, what changes, resulting code.>",
    required: true,
  },
  {
    skillName: "improve-animations",
    relativePath: "PLAN-TEMPLATE.md",
    search: [
      "- **Done when**: <machine- or eye-checkable completion criteria>.",
      "",
      "## Checklist",
      "",
      "- [ ] The trigger still applies at the commit recorded above.",
      "- [ ] Every workflow step names the file, edit, and intended result.",
      "- [ ] Boundaries and stop conditions are explicit.",
      "- [ ] Mechanical, feel, slow-motion, and reduced-motion checks pass.",
      "- [ ] The stated completion criteria are observable and satisfied.",
    ].join("\n"),
    replace: [
      "- **Done when**: <machine- or eye-checkable completion criteria>.",
      "",
      "## Checklist",
      "",
      "- [ ] The trigger still applies in the current checkout; drift since the",
      "      recorded commit does not invalidate the workflow.",
      "- [ ] Every workflow step names the file, edit, and intended result.",
      "- [ ] Boundaries and stop conditions are explicit.",
      "- [ ] Mechanical, feel, slow-motion, and reduced-motion checks pass.",
      "- [ ] The stated completion criteria are observable and satisfied.",
    ].join("\n"),
  },
  {
    skillName: "improve-animations",
    relativePath: "PLAN-TEMPLATE.md",
    search: "- **Done when**: <machine- or eye-checkable completion criteria>.",
    replace: [
      "- **Done when**: <machine- or eye-checkable completion criteria>.",
      "",
      "## Checklist",
      "",
      "- [ ] The trigger still applies in the current checkout; drift since the",
      "      recorded commit does not invalidate the workflow.",
      "- [ ] Every workflow step names the file, edit, and intended result.",
      "- [ ] Boundaries and stop conditions are explicit.",
      "- [ ] Mechanical, feel, slow-motion, and reduced-motion checks pass.",
      "- [ ] The stated completion criteria are observable and satisfied.",
    ].join("\n"),
    required: true,
  },
  {
    skillName: "improve-animations",
    relativePath: "AUDIT.md",
    search:
      "  .popover { transform-origin: var(--transform-origin); } /* Base UI */",
    replace:
      "  .popover {\n    transform-origin: var(--transform-origin);\n  } /* Base UI */",
    required: true,
  },
  {
    skillName: "improve-animations",
    relativePath: "AUDIT.md",
    search: "Duration budgets — **UI animations stay under 300ms**:",
    replace:
      "Duration budgets — **most UI animations stay under 300ms; modals and drawers may use 200–500ms when the larger spatial transition warrants it**:",
    required: true,
  },
  {
    skillName: "improve-animations",
    relativePath: "AUDIT.md",
    search:
      "Hunt for: `ease-in` anywhere, bare `ease`/`linear` on entrances, durations > 300ms on UI elements, tooltip delay + animation on every tooltip in a toolbar (after the first, they should be instant).",
    replace:
      "Hunt for: `ease-in` anywhere, bare `ease`/`linear` on entrances, durations > 300ms on ordinary UI, modals/drawers above 500ms, modal/drawer durations above 300ms without a documented reason, or tooltip delay + animation on every tooltip in a toolbar (after the first, they should be instant).",
    required: true,
  },
  {
    skillName: "review-animations",
    relativePath: "STANDARDS.md",
    search:
      "  .popover { transform-origin: var(--transform-origin); } /* Base UI */",
    replace:
      "  .popover {\n    transform-origin: var(--transform-origin);\n  } /* Base UI */",
    required: true,
  },
  {
    skillName: "review-animations",
    relativePath: "STANDARDS.md",
    search:
      "**Rule: UI animations stay under 300ms.** A 180ms dropdown feels more responsive than a 400ms one. Faster spinners make load feel faster (same actual time). Instant tooltips after the first (skip delay + animation) make a toolbar feel faster.",
    replace:
      "**Rule: Most UI animations stay under 300ms; modals and drawers may use up to 500ms when their larger spatial transition warrants it.** A 180ms dropdown feels more responsive than a 400ms one. Faster spinners make load feel faster (same actual time). Instant tooltips after the first (skip delay + animation) make a toolbar feel faster.",
    required: true,
  },
  // pr-review-canvas: use exact PR filenames as diff keys (the upstream
  // gsub("[^a-zA-Z0-9]"; "_") normalization is lossy and lets distinct files
  // collide onto one key).
  {
    skillName: "pr-review-canvas",
    relativePath: "SKILL.md",
    search:
      '--jq \'[.[] | {key: (.filename | gsub("[^a-zA-Z0-9]"; "_")), value: (.patch // "")}] | from_entries\' \\',
    replace:
      "--jq '[.[] | {key: .filename, value: (.patch // \"\")}] | from_entries' \\",
    required: true,
  },
  {
    skillName: "pr-review-canvas",
    relativePath: "SKILL.md",
    search: '<div class="bp-body"><div data-diff="retryClient"></div></div>',
    replace:
      '<div class="bp-body"><div data-diff="src/retryClient.ts"></div></div>',
    required: true,
  },
  {
    skillName: "pr-review-canvas",
    relativePath: "SKILL.md",
    search:
      'The diff data keys should match the `data-diff` attribute values in the HTML:\n\n```html\n<div data-diff="path_to_file_ts"></div>\n```',
    replace:
      'The diff data keys are the exact PR filenames (so distinct files can never collide), and each `data-diff` attribute value must match one of them:\n\n```html\n<div data-diff="path/to/file.ts"></div>\n```',
    required: true,
  },
  // pr-review-canvas: replace the sentinel JSON via a formatting-tolerant
  // regex — the upstream literal `.replace('{"__PR_DIFFS_PLACEHOLDER__":true}',
  // ...)` never matches because Prettier reflows the sentinel object inside
  // template.html, leaving every data-diff section empty.
  {
    skillName: "pr-review-canvas",
    relativePath: "SKILL.md",
    search: "import json\nfrom pathlib import Path",
    replace: "import json\nimport re\nfrom pathlib import Path",
    required: true,
  },
  {
    skillName: "pr-review-canvas",
    relativePath: "SKILL.md",
    search:
      "out = (\n  tmpl.replace('/* INJECT_CSS */', css)\n      .replace('/* INJECT_JS */', js)\n      .replace('<!-- INJECT_BODY -->', html)\n      .replace('{\"__PR_DIFFS_PLACEHOLDER__\":true}', safe_json)\n)\n\nPath('/tmp/pr-review-{number}.html').write_text(out)",
    replace:
      "out = (\n  tmpl.replace('/* INJECT_CSS */', css)\n      .replace('/* INJECT_JS */', js)\n      .replace('<!-- INJECT_BODY -->', html)\n)\n\n# Swap the sentinel JSON inside the pr-diffs-json script element without\n# depending on its exact formatting (formatters may reflow the placeholder).\nout = re.sub(\n    r'(<script id=\"pr-diffs-json\"[^>]*>).*?(</script>)',\n    lambda match: match.group(1) + safe_json + match.group(2),\n    out,\n    count=1,\n    flags=re.DOTALL,\n)\n\nPath('/tmp/pr-review-{number}.html').write_text(out)",
    required: true,
  },
  {
    skillName: "better-layout",
    relativePath: "spacing-and-adaptivity.md",
    search:
      '```html\n<!-- Good: bordered buttons at 12px, icon buttons given room -->\n<div class="flex gap-3">\n  <button class="rounded-lg border px-4 py-2">Cancel</button>\n  <button class="rounded-lg bg-blue-600 px-4 py-2 text-white">Save</button>\n</div>\n\n<!-- Bad: three borderless icon buttons packed at 4px -->\n<div class="flex gap-1">\n  <button><TrashIcon /></button>\n  <button><ArchiveIcon /></button>\n  <button><ShareIcon /></button>\n</div>\n```',
    replace:
      '```tsx\nimport { Button } from "@asym/ui/components/shadcn/button";\n\n// Good: reuse the existing buttons and spacing scale.\n<div className="flex gap-3">\n  <Button variant="outline">Cancel</Button>\n  <Button>Save</Button>\n</div>;\n\n// Bad: unrelated actions are packed together without distinct hit areas.\n<div className="flex gap-1">\n  <button><TrashIcon /></button>\n  <button><ArchiveIcon /></button>\n  <button><ShareIcon /></button>\n</div>;\n```',
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "better-layout",
    relativePath: "grouping-and-alignment.md",
    search:
      '```html\n<!-- Good: Tailwind -->\n<div class="space-y-6">\n  <div class="space-y-2">…field group…</div>\n  <div class="space-y-2">…field group…</div>\n</div>\n```',
    replace:
      '```tsx\nimport { FieldGroup } from "@asym/ui/components/shadcn/field";\n\n// Good: preserve shared form ownership and use gap for grouping.\n<FieldGroup className="gap-6">\n  <FieldGroup className="gap-2">…related fields…</FieldGroup>\n  <FieldGroup className="gap-2">…related fields…</FieldGroup>\n</FieldGroup>;\n```',
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "better-layout",
    relativePath: "grouping-and-alignment.md",
    search:
      '```html\n<!-- Bad: action looks exactly like the description text next to it -->\n<p class="text-zinc-600">Your trial ends soon. Upgrade now</p>\n\n<!-- Good: the action reads as an action -->\n<p class="text-zinc-600">Your trial ends soon.</p>\n<button class="font-medium text-blue-600">Upgrade now</button>\n```',
    replace:
      '```tsx\nimport { Button } from "@asym/ui/components/shadcn/button";\n\n// Bad: the action reads as static text.\n<p className="text-muted-foreground">Your trial ends soon. Upgrade now</p>;\n\n// Good: an existing shared action and semantic text color.\n<p className="text-muted-foreground">Your trial ends soon.</p>;\n<Button variant="link" onClick={onUpgrade}>Upgrade now</Button>;\n```',
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "better-ui",
    relativePath: "icons.md",
    search:
      '```html\n<!-- Good: stroke tuned to the label weight -->\n<button class="flex items-center gap-2 font-semibold">\n  <PlusIcon stroke-width="2" class="size-4" />\n  New project\n</button>\n\n<!-- Bad: default 1.5px stroke against a bold label -->\n<button class="flex items-center gap-2 font-bold">\n  <PlusIcon stroke-width="1.5" class="size-4" />\n  New project\n</button>\n```',
    replace:
      '```tsx\nimport { Button } from "@asym/ui/components/shadcn/button";\n\n// The shared Button owns descendant icon sizing and spacing.\n<Button>\n  <PlusIcon strokeWidth={2} />\n  New project\n</Button>;\n```',
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "better-ui",
    relativePath: "icons.md",
    search: "oklch(0.552 0.016 285.938)",
    replace: "var(--muted-foreground)",
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "better-ui",
    relativePath: "icons.md",
    search: "oklch(0.21 0.006 285.885)",
    replace: "var(--foreground)",
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "better-ui",
    relativePath: "icons.md",
    search: "oklch(0.623 0.188 259.815)",
    replace: "var(--primary)",
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "better-ui",
    relativePath: "icons.md",
    search:
      '```html\n<!-- Tailwind -->\n<button\n  class="text-zinc-500 hover:text-zinc-900 aria-pressed:text-blue-600 disabled:opacity-40"\n>\n  <BookmarkIcon />\n</button>\n```',
    replace:
      '```tsx\nimport { Button } from "@asym/ui/components/shadcn/button";\n\n<Button\n  variant="ghost"\n  size="icon"\n  aria-label="Bookmark"\n  aria-pressed={saved}\n  onClick={toggleSaved}\n  className="text-muted-foreground hover:text-foreground aria-pressed:text-primary"\n>\n  <BookmarkIcon />\n</Button>;\n```',
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "better-ui",
    relativePath: "SKILL.md",
    search:
      "Keep the project's component library, tokens and density, and match its motion language except where a rule below prescribes an exact interaction.",
    replace:
      "Keep Core's shared component library, semantic tokens, density, and motion language for every interaction below.",
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "better-ui",
    relativePath: "SKILL.md",
    search:
      "Every duration, curve, scale and blur below is a specific value, not a range to approximate. `cubic-bezier(0.2, 0, 0, 1)` is not `cubic-bezier(0.4, 0, 0.2, 1)`, and `0.96` is not `0.95`. Use what is written.",
    replace:
      "The upstream numbers below illustrate visual relationships. In Core, implement those relationships using `packages/ui/styles/globals.css`, the shared component's variants, and `anim` guidance. Do not replace an existing radius, color, shadow, duration, easing, or press interaction with a literal from this reference.",
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "better-ui",
    relativePath: "SKILL.md",
    search:
      "Use exactly these values: scale `0.25` to `1`, opacity `0` to `1`, blur `4px` to `0px`.",
    replace:
      "The upstream example uses scale `0.25` to `1`, opacity `0` to `1`, and blur `4px` to `0px`; Core implementations must use the shared motion and reduced-motion contract.",
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "better-ui",
    relativePath: "SKILL.md",
    search:
      "A `scale(0.96)` on click gives a button tactile feedback. Always `0.96`; anything below `0.95` feels exaggerated. Add a `static` prop to switch it off where motion would distract. See [recipes for CSS, Tailwind and Motion](animations.md#scale-on-press).",
    replace:
      "The upstream press recipe uses `scale(0.96)` for tactile feedback. In Core, retain the existing shared Button press and reduced-motion behavior; do not add another `static` prop or app-local animation wrapper. See [illustrative recipes for CSS, Tailwind and Motion](animations.md#scale-on-press).",
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "emil-design-engineering",
    relativePath: "component-design.md",
    search:
      "When a Base UI primitive must render as another element, use its `render` prop.\nKeep that local to the primitive — do not wrap `Button` in a slot helper.",
    replace:
      'When a Base UI primitive must render as another element, use its `render` prop.\nKeep that local to the primitive — do not wrap `Button` in a slot helper.\n\nWhen the shared Button itself must render a non-button, set `nativeButton={false}`:\n\n```tsx\nimport { Button } from "@asym/ui/components/shadcn/button";\n\n<Button render={<a href="/page" />} nativeButton={false}>Open page</Button>;\n```\n\nKeep one interactive element and preserve its keyboard, disabled, focus, event-handler, and ref behavior.',
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "animate-expo",
    relativePath: "RECIPES.md",
    search: "      hitSlop={12}",
    replace:
      '      style={{ minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" }}\n      hitSlop={12}',
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "animate-expo",
    relativePath: "RECIPES.md",
    search:
      "`hitSlop` brings a small icon up to the 44pt target without growing it;",
    replace:
      "The minimum layout dimensions guarantee a 44pt target; `hitSlop` adds extra touch tolerance without changing that layout;",
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "animate-expo",
    relativePath: "RECIPES.md",
    search:
      "      .onEnd((e) => {\n        const projected = translateY.get() + project(e.velocityY);",
    replace:
      "      .onEnd((e, success) => {\n        if (!success) {\n          translateY.set(withSpring(0, { duration: 300, dampingRatio: 1 }));\n          return;\n        }\n        const projected = translateY.get() + project(e.velocityY);",
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "animate-expo",
    relativePath: "RECIPES.md",
    search:
      "      .onEnd((e) => {\n        const projected = x.get() + project(e.velocityX);",
    replace:
      "      .onEnd((e, success) => {\n        if (!success) {\n          x.set(withSpring(0, { duration: 300, dampingRatio: 1 }));\n          return;\n        }\n        const projected = x.get() + project(e.velocityX);",
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "animate-expo",
    relativePath: "RECIPES.md",
    search: "    if (isArmed !== wasArmed) {",
    replace:
      "    if (wasArmed === null) {\n      armed.set(isArmed);\n      return;\n    }\n    if (isArmed !== wasArmed) {",
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "animate",
    relativePath: "RECIPES.md",
    search: "opacity 400ms ease,\n    transform 400ms ease;",
    replace:
      "opacity var(--duration-standard) var(--ease-out-soft),\n    transform var(--duration-standard) var(--ease-out-soft);",
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "animate",
    relativePath: "RECIPES.md",
    search:
      "Stagger is decorative — it must never block interaction while it plays.",
    replace:
      "This opacity-zero stagger example is for non-interactive decoration only. Keep links and controls visible and operable while decorative siblings enter; never delay access to functional content.",
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "animate",
    relativePath: "RECIPES.md",
    search:
      "const timeTaken = Date.now() - dragStartTime.current;\nconst velocity = Math.abs(swipeAmount) / timeTaken;",
    replace:
      "// Capture dragStartTime.current = performance.now() at drag start.\nconst timeTaken = performance.now() - dragStartTime.current;\nconst velocity = timeTaken > 0 ? Math.abs(swipeAmount) / timeTaken : 0;",
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "animate",
    relativePath: "SKILL.md",
    search: "**CSS animation** (runs off the main thread)",
    replace: "**CSS animation** (eligible compositor properties)",
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "animate",
    relativePath: "SKILL.md",
    search:
      "CSS animations beat JS under load — they run off the main thread, while `requestAnimationFrame`-based animation drops frames while the browser loads, scripts, or paints. Use CSS for predetermined motion, JS for dynamic and interruptible motion.",
    replace:
      "CSS and WAAPI can keep eligible transform and opacity animations on the compositor. The API alone does not guarantee acceleration: animated properties and browser support matter. Profile the actual effect under load; layout and paint work can still run on the main thread.",
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "animate",
    relativePath: "RECIPES.md",
    search: "Hardware-accelerated, interruptible, no bundle cost.",
    replace:
      "Interruptible with no added animation-library bundle. Acceleration depends on the property and browser; profile this clip-path effect instead of assuming compositor execution.",
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "ask-sonner",
    relativePath: "API.md",
    search:
      "| `offset`          | `string \\| number \\| object` | `'32px'`          | Offset from screen edges. Object form is per-side: `{ bottom: '24px', right: '16px' }`.  |",
    replace:
      "| `offset` | `string \\| number \\| object` | `24px` | Edge offset, with per-side object support. Core's existing shared Toaster may override this upstream default. |",
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "ask-sonner",
    relativePath: "API.md",
    search:
      "| `dir`             | `string`                     | `'ltr'`           | Text directionality.                                                                     |",
    replace:
      '| `dir` | `"rtl" \\| "ltr" \\| "auto"` | document direction | Follows document direction, with an LTR server fallback. |',
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "ask-sonner",
    relativePath: "API.md",
    search:
      "| `hotkey`          | `string`                     | `⌥/alt + T`       | Keyboard shortcut that focuses the toaster area.                                         |",
    replace:
      '| `hotkey` | `string[]` | `["altKey", "KeyT"]` | Key combination that focuses the toaster. |',
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "ask-sonner",
    relativePath: "API.md",
    search:
      "| `toastOptions`    | `object`                     | –                 | Default options applied to every toast (any `toast()` option below).                     |",
    replace:
      "| `toastOptions` | `ToastOptions` | – | Supported defaults: `className`, `closeButton`, `descriptionClassName`, `style`, `cancelButtonStyle`, `actionButtonStyle`, `duration`, `unstyled`, `classNames`, `closeButtonAriaLabel`, `toasterId`. Pass action, cancel, and description per toast. |",
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "ask-sonner",
    relativePath: "API.md",
    search:
      "| `onDismiss`          | `(toast) => void`                 | –                 | Fires when the close button is clicked or the toast is swiped away.                                                               |",
    replace:
      "| `onDismiss` | `(toast) => void` | – | Fires for close-button, swipe, and programmatic `toast.dismiss(id)` removal of an active toast. |",
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "ask-sonner",
    relativePath: "SKILL.md",
    search:
      '**Close callbacks** — `onDismiss` fires on close button or swipe; `onAutoClose` fires on timeout. They are separate; there is no single "closed" callback.',
    replace:
      '**Close callbacks** — `onDismiss` fires on close button or swipe; `onAutoClose` fires on timeout. They are separate; there is no single "closed" callback. Programmatic `toast.dismiss(id)` removal of an active toast also invokes `onDismiss`.',
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "mobile-native",
    relativePath: "SKILL.md",
    search:
      "- Connect the phone over USB, run the dev server on `0.0.0.0`, open it by the machine's LAN IP.",
    replace:
      "- Prefer USB debugging. If phone testing needs a LAN-bound dev server (`0.0.0.0`), use only a trusted private network and restrict reachability with the host firewall; stop the server afterward. Framework dev-origin protections do not make a public or shared network trusted.",
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "mobile-native",
    relativePath: "SKILL.md",
    search:
      "`interactive-widget=resizes-content` makes the software keyboard shrink the layout viewport on Android Chrome, so `100dvh` and bottom-pinned inputs react to it the way they do on iOS.",
    replace:
      "`interactive-widget=resizes-content` opts Android Chrome into shrinking both the layout and visual viewports for the software keyboard. Safari on iOS does not support this key and normally resizes only the visual viewport; test its keyboard behavior separately, using the VisualViewport API when the layout needs to respond.",
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "write-swift",
    relativePath: "SKILL.md",
    search: "profiling shows a hang → `async` → `@concurrent` → `actor`",
    replace:
      "I/O latency → `async`; measured CPU work → `@concurrent`; isolated mutable state → `actor`",
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "write-swift",
    relativePath: "SKILL.md",
    search:
      "- **Value types are `Sendable` when their storage is** — inferred automatically for non-public types. **Public types never get inferred sendability**: marking a public type `Sendable` is a promise to your clients, so Swift makes you write it.",
    replace:
      "- **Structs and enums can infer `Sendable` when their storage is sendable** if they are non-public and not `@usableFromInline`, or are `@frozen` public types. Public non-frozen types need explicit conformance so their public contract remains deliberate. See [SE-0302](https://github.com/swiftlang/swift-evolution/blob/main/proposals/0302-concurrent-value-and-concurrent-closures.md).",
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "write-swift",
    relativePath: "SKILL.md",
    search:
      "Use **`withDiscardingTaskGroup`** when children return nothing: it frees each child's resources immediately and cancels siblings on the first error.",
    replace:
      "Use **`withDiscardingTaskGroup`** for nonthrowing children that return nothing. Use **`withThrowingDiscardingTaskGroup`** when a child can throw and the first child error must cancel siblings.",
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "write-swift",
    relativePath: "SKILL.md",
    search:
      "**Toolchain baseline: Swift 6.3** (current release as of August 2026). Everything here compiles on 6.3 unless marked ⚠, which flags unreleased Swift 6.4 features.",
    replace:
      "**Upstream reference snapshot: Swift 6.3, with separately marked Swift 6.4 material.** Core has no Swift target. For an explicitly requested Swift task, inspect the actual project compiler and deployment targets, then verify feature availability against [official Swift releases](https://www.swift.org/install/). The snapshot and ⚠ markers are not a claim about the current stable release or a reason to upgrade the target.",
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "animate",
    relativePath: "SKILL.md",
    search:
      "- **In Motion, use the full transform string.** `x`/`y`/`scale` shorthands are not hardware-accelerated and drop frames under load:",
    replace:
      "- **Motion supports `x`/`y`/`scale` shorthands.** When compositor acceleration is important for a measured busy-thread case, prefer a full `transform` string and verify it in the target browser. Shorthands do not inherently mean dropped frames:",
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "write-swift",
    relativePath: "SKILL.md",
    search: "Swift 6.4 — unreleased — adds a `Continuation` type",
    replace: "Swift 6.4 reference material includes a `Continuation` type",
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "write-swift",
    relativePath: "SKILL.md",
    search: "Landing in Swift 6.4 (**unreleased** — see the note below §15):",
    replace:
      "Swift 6.4 reference features (verify the actual toolchain — see the note below §15):",
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "write-swift",
    relativePath: "SKILL.md",
    search: "Swift 6.4's `@diagnose` attribute (unreleased)",
    replace:
      "Swift 6.4's `@diagnose` attribute (verify toolchain availability)",
    required: true,
    allowWhitespace: true,
  },
  {
    skillName: "write-swift",
    relativePath: "SKILL.md",
    search:
      "**Rows marked ⚠ are Swift 6.4, which has not shipped.** The current release is 6.3.x. Their proposals are accepted and implemented in main, so they are safe to plan around and unsafe to write today — check the project's toolchain before using one, and prefer the older form if it targets 6.3 or earlier.",
    replace:
      "**Rows marked ⚠ require explicit toolchain verification.** They describe Swift 6.4 material in this pinned reference snapshot. Check the project compiler, SDK, deployment targets and official feature documentation before using one; retain a compatible older form when the project targets Swift 6.3 or earlier. These markers do not assert that a release is unavailable today.",
    required: true,
    allowWhitespace: true,
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

function findAskMattMainFlowOverlayRange(content) {
  const headingIndex = content.indexOf(ASK_MATT_MAIN_FLOW_HEADING);
  const stepTwoIndex = content.indexOf(ASK_MATT_MAIN_FLOW_STEP_TWO);

  if (
    headingIndex === -1 ||
    stepTwoIndex === -1 ||
    stepTwoIndex < headingIndex
  ) {
    return null;
  }

  const between = content.slice(
    headingIndex + ASK_MATT_MAIN_FLOW_HEADING.length,
    stepTwoIndex,
  );
  const firstItemMatch = /\n1\. /.exec(between);
  const insertStart =
    firstItemMatch && firstItemMatch.index !== undefined
      ? headingIndex + ASK_MATT_MAIN_FLOW_HEADING.length + firstItemMatch.index
      : stepTwoIndex;

  return { insertStart, stepTwoIndex };
}

async function restoreAskMattCoreOverlay(skillPath, content, overlay) {
  const range = findAskMattMainFlowOverlayRange(content);
  if (!range) {
    throw new Error(
      `Unable to locate Ask Matt main-flow overlay anchor in ${path.relative(repoRoot, skillPath)}`,
    );
  }

  const before = content.slice(0, range.insertStart).trimEnd();
  const after = content.slice(range.stepTwoIndex).trimStart();
  await writeFile(
    skillPath,
    `${before}\n\n${overlay.trim()}\n${after}`,
    "utf8",
  );
}

async function restoreCoreOverlay(targetRoot, overlay, skillName) {
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

  if (skillName === "ask-matt") {
    await restoreAskMattCoreOverlay(skillPath, content, overlay);
    return;
  }

  const headingMatch = /^# .+$/m.exec(content);
  if (headingMatch && headingMatch.index !== undefined) {
    const headingEnd = headingMatch.index + headingMatch[0].length;
    const before = content.slice(0, headingEnd).trimEnd();
    const after = content.slice(headingEnd).trimStart();
    await writeFile(
      skillPath,
      `${before}\n\n${overlay.trim()}\n\n${after}`,
      "utf8",
    );
    return;
  }

  const frontmatterMatch = /^---\n[\s\S]*?\n---\n/.exec(content);
  if (frontmatterMatch && frontmatterMatch.index === 0) {
    const after = content.slice(frontmatterMatch[0].length).replace(/^\n*/, "");
    await writeFile(
      skillPath,
      `${frontmatterMatch[0]}\n${overlay.trim()}\n\n${after}`,
      "utf8",
    );
    return;
  }

  throw new Error(
    `Unable to locate skill heading or frontmatter for Core overlay: ${path.relative(repoRoot, skillPath)}`,
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

      // The password example triggers the repo secret scanner. Target the line // pragma: allowlist secret
      // that contains `type="password"` (not "second <input>" by index: when // pragma: allowlist secret
      // email+password share one line, the next line is `tel` and would get a // pragma: allowlist secret
      // spurious pragma).
      const passwordLineIndex /* pragma: allowlist secret */ =
        inputLineIndexes.find(
          (idx) => lines[idx].includes('type="password"'), // pragma: allowlist secret
        );
      if (
        passwordLineIndex /* pragma: allowlist secret */ !== undefined &&
        !lines[passwordLineIndex].includes("// pragma: allowlist secret") // pragma: allowlist secret
      ) {
        lines[passwordLineIndex] /* pragma: allowlist secret */ =
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

async function annotateSecretScannerMentionsInTree(targetRoot) {
  const files = await listFilesRecursively(targetRoot);
  for (const filePath of files) {
    if (
      SECRET_SCANNER_SKIP_SUFFIXES.has(path.extname(filePath).toLowerCase())
    ) {
      continue;
    }

    let original;
    try {
      original = await readFile(filePath, "utf8");
    } catch {
      continue;
    }

    if (original.includes("\u0000")) {
      continue;
    }

    const patched = annotateSecretScannerMentions(original, filePath);
    if (patched !== original) {
      await writeFile(filePath, patched, "utf8");
    }
  }
}

function applyCompatibilityReplacement(
  content,
  search,
  replacement,
  { allowWhitespace = false } = {},
) {
  if (allowWhitespace) {
    // These reviewed prose/code blocks differ only in indentation or Markdown
    // table padding between raw upstream and Prettier. Require every literal
    // token in order; changed API names or instructions still fail closed.
    const pattern = (value) =>
      new RegExp(
        value
          .split(/\s+/u)
          .map((part) => part.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"))
          .join("\\s+")
          .replaceAll("\\s+>", "\\s*>"),
        "gu",
      );
    const targetPattern = pattern(replacement.trim());
    if (targetPattern.test(content))
      return { matched: true, changed: false, content };
    const sourcePattern = pattern(search.trim());
    if (!sourcePattern.test(content))
      return { matched: false, changed: false, content };
    sourcePattern.lastIndex = 0;
    return {
      matched: true,
      changed: true,
      content: content.replace(sourcePattern, () => replacement.trim()),
    };
  }
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

async function rewriteAskSonnerToasterImport(skillName, targetRoot) {
  if (skillName !== "ask-sonner") {
    return;
  }

  const skillPath = path.join(targetRoot, "SKILL.md");
  const rawContent = await readFile(skillPath, "utf8");
  const content = rawContent.replaceAll("\r\n", "\n");
  const rewritten = content.replace(
    /import \{ Toaster \} from ["']sonner["'];[^\n]*/,
    ASK_SONNER_CORE_TOASTER_IMPORT,
  );

  if (rewritten !== content) {
    await writeFile(skillPath, rewritten, "utf8");
  }

  const nextContent = rewritten !== content ? rewritten : content;
  if (
    nextContent.includes(ASK_SONNER_UPSTREAM_TOASTER_IMPORT) ||
    /import \{ Toaster \} from ["']sonner["']/.test(nextContent)
  ) {
    throw new Error(
      `ask-sonner still imports Toaster from sonner in ${path.relative(repoRoot, skillPath)}`,
    );
  }

  if (!nextContent.includes("@asym/ui/components/shadcn/sonner")) {
    throw new Error(
      `ask-sonner is missing the Core toaster import in ${path.relative(repoRoot, skillPath)}`,
    );
  }
}

async function ensureEmilDisableModelInvocation(skillName, targetRoot) {
  const description = CORE_EXPLICIT_SKILL_DESCRIPTIONS[skillName];
  if (!description && !EMIL_EXPLICIT_ONLY_SKILLS.has(skillName)) return;
  const skillPath = path.join(targetRoot, "SKILL.md");
  let content = await readFile(skillPath, "utf8");
  const frontmatter = /^---\n([\s\S]*?)\n---/u.exec(content);
  if (!frontmatter)
    throw new Error(`Missing discovery metadata in ${skillPath}`);
  let metadata = frontmatter[1];
  if (description) {
    if (!/^description:.*$/mu.test(metadata))
      throw new Error(`Missing description in ${skillPath}`);
    metadata = metadata.replace(
      /^description:.*$/mu,
      `description: ${description}`,
    );
  }
  if (/^disable-model-invocation:/mu.test(metadata))
    metadata = metadata.replace(
      /^disable-model-invocation:.*$/mu,
      "disable-model-invocation: true",
    );
  else metadata += "\ndisable-model-invocation: true";
  content = content.replace(frontmatter[0], `---\n${metadata}\n---`);
  await writeFile(skillPath, content, "utf8");
}

async function applyCoreOperativeGuidance(skillName, targetRoot) {
  if (!emilKowalskiSkillNames.includes(skillName)) return;
  const skillPath = path.join(targetRoot, "SKILL.md");
  let content = await readFile(skillPath, "utf8");
  content = content
    .replaceAll(
      "When this skill is first invoked without a specific question, respond only with:",
      "Only when the user explicitly invokes this skill with no task, question, or context, use this greeting:",
    )
    .replaceAll(
      "Do not provide any other information until the user asks a question.",
      "For an existing concrete task, skip the greeting and continue the requested work without waiting for another question.",
    );
  if (skillName === "improve-animations") {
    content = content.replace(
      /^description:.*$/mu,
      "description: Produce a read-only motion audit or implementation plan when the user explicitly asks for an audit, roadmap, or plan. For concrete implementation requests use Core's normal implementation and anim guidance instead.",
    );
  }
  if (skillName === "animate") {
    content = content.replace(
      /Built-in CSS easings are too weak\. Use these:\n\n```css\n[\s\S]*?\n```/u,
      "Core already defines the motion tokens in `packages/ui/styles/globals.css`. Reuse them; do not create another token system:\n\n```css\ntransition-timing-function: var(--ease-out-soft);\ntransition-duration: var(--duration-standard);\n```",
    );
    content = content.replace(
      "stop and invoke `pick-ui-library`.",
      "reuse `@asym/ui` / Base UI; invoke `pick-ui-library` only when the user explicitly asks which library to use.",
    );
  }
  if (skillName === "emil-prototype") {
    content = content.replace(
      "an isolated route or page (`/prototypes/<slug>`, or the framework's equivalent)",
      "an isolated static prototype surface outside app routes and production layouts",
    );
  }
  if (skillName === "ask-sonner") {
    content = content
      .replace(
        "1. **One `<Toaster />`, mounted once**, as close to the root as possible (in Next.js: `layout.tsx` — it works inside server components). Never render it per-page or conditionally; a second mounted Toaster duplicates every toast.",
        "1. **Reuse Core's existing layout `<Toaster />`.** Do not add a mount in an app layout or page. The shared host already exists at `@asym/ui/components/shadcn/sonner`; change that shared owner only when the requested behavior requires it.",
      )
      .replace(
        "**Multiple toasters** — give each an `id` and target with `toast('…', { toasterId: 'canvas' })`. Without `toasterId`, every toaster renders the toast.",
        "**One Core toaster** — use the existing shared host. Do not add a second host or a `toasterId` route as part of ordinary toast work.",
      )
      .replaceAll("toast.getActiveToasts()", "toast.getToasts()")
      .replaceAll(
        "Mount one at the root.",
        "Inspect the existing shared layout host instead of mounting another.",
      )
      .replace(
        "Multiple toasters need targeting: give each Toaster an `id` and pass `toasterId` in the `toast()` call.",
        "Remove the extra host; Core owns one existing shared toaster per app layout.",
      )
      .replaceAll("!text-red-900", "text-destructive");
  }
  if (skillName === "mobile-native") {
    content = content.replace(
      'button,\na,\n[role="button"] {\n  touch-action: manipulation;\n  user-select: none;',
      'button,\na,\n[role="button"] {\n  touch-action: manipulation;\n}\n\nbutton,\n[role="button"] {\n  user-select: none;',
    );
  }
  if (skillName === "pick-ui-library") {
    content = content
      .replace(
        /^\|.*\[cmdk\].*\|$/mu,
        "| Command menus | Existing `@asym/ui/components/shadcn/command` |",
      )
      .replace(
        /^\|.*\[input-otp\].*\|$/mu,
        "| OTP / verification code inputs | Existing `@asym/ui/components/shadcn/input-otp` |",
      )
      .replace(
        /^\|.*\[zustand\].*\|$/mu,
        "| State management | React state/reducer/context and approved TanStack data hooks. Do not install Zustand. |",
      )
      .replace(
        /^\|.*\[clsx\].*\|$/mu,
        "| Conditional class names | Existing `cn` from `@asym/ui/lib/utils` |",
      )
      .replace(
        "The styling split: clsx for ad-hoc conditional classes; cva when a component has real variants (size, intent, state) that deserve a typed API. They compose — cva uses clsx-style inputs internally.",
        "Use Core's existing `cn` helper for conditional class names and existing shared variants for component APIs. Do not install another class-merging helper.",
      )
      .replace(
        "- **A `useState`-per-component web of props for shared state** → zustand.",
        "- **Shared client state** → use the existing React state/reducer/context boundary or approved TanStack data hooks; do not introduce Zustand.",
      )
      .replace(
        "- **Template-literal className ternaries three conditions deep** → clsx (or cva if it's variant-shaped).",
        "- **Complex class conditions** → the existing `cn` helper and shared component variants.",
      );
  }
  await writeFile(skillPath, content, "utf8");
  const companions =
    skillName === "animate"
      ? ["RECIPES.md"]
      : skillName === "ask-sonner"
        ? ["API.md"]
        : [];
  for (const relativePath of companions) {
    const companionPath = path.join(targetRoot, relativePath);
    if (!(await fileExists(companionPath))) continue;
    const original = await readFile(companionPath, "utf8");
    const corrected = original
      .replaceAll("var(--ease-out)", "var(--ease-out-soft)")
      .replaceAll("toast.getActiveToasts()", "toast.getToasts()");
    await writeFile(companionPath, corrected, "utf8");
  }
}

async function ensureGitGuardrailsFailClosed(skillName, targetRoot) {
  if (skillName !== "git-guardrails-claude-code") {
    return;
  }

  const overlayPath = path.join(
    repoRoot,
    "scripts/refresh-overlays/git-guardrails-block-dangerous-git.sh",
  );
  const hookPath = path.join(targetRoot, "scripts", "block-dangerous-git.sh");
  await mkdir(path.dirname(hookPath), { recursive: true });
  await cp(overlayPath, hookPath);
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
      { allowWhitespace: replacement.allowWhitespace },
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

  await rewriteAskSonnerToasterImport(skillName, targetRoot);
  await ensureEmilDisableModelInvocation(skillName, targetRoot);
  await applyCoreOperativeGuidance(skillName, targetRoot);
  await ensureGitGuardrailsFailClosed(skillName, targetRoot);

  await annotateSecretScannerMentionsInTree(targetRoot);
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
  const versionLine = getTopLevelFrontmatterLine(frontmatter, "version");
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
    versionLine !== `version: ${GRILL_REVIEWED_VERSION}` ||
    !hasCompatibleDescription ||
    (!hasInvocationGuard && !canInsertInvocationGuard)
  ) {
    throw new Error(
      `Incompatible grill-for-unknowns frontmatter in ${path.relative(repoRoot, skillPath)}; review upstream discovery metadata before replacing the canonical skill.`,
    );
  }
}

function assertAskMattOverlayOnMainFlow(skillContent) {
  const headingIndex = skillContent.indexOf(ASK_MATT_MAIN_FLOW_HEADING);
  const overlayStart = skillContent.indexOf(CORE_OVERLAY_START);
  const overlayEnd = skillContent.indexOf(CORE_OVERLAY_END);
  const stepTwoIndex = skillContent.indexOf(ASK_MATT_MAIN_FLOW_STEP_TWO);

  return (
    headingIndex !== -1 &&
    overlayStart !== -1 &&
    overlayEnd !== -1 &&
    stepTwoIndex !== -1 &&
    headingIndex < overlayStart &&
    overlayEnd < stepTwoIndex &&
    skillContent.includes("/grill-for-unknowns") &&
    skillContent.includes("/writing-great-skills") &&
    !skillContent.includes("/writing-for-agents") &&
    !skillContent.includes("/to-questionnaire") &&
    !skillContent.includes("/wait-what")
  );
}

async function assertPostRefreshCompatibility(skillName, targetRoot) {
  if (skillName !== "grill-for-unknowns" && skillName !== "ask-matt") {
    return;
  }

  const skillPath = path.join(targetRoot, "SKILL.md");
  const skillContent = await readFile(skillPath, "utf8");

  if (skillName === "ask-matt") {
    if (!assertAskMattOverlayOnMainFlow(skillContent)) {
      throw new Error(
        `Core ask-matt compatibility requires the grill-depth overlay between the main flow heading and "${ASK_MATT_MAIN_FLOW_STEP_TWO}" in ${path.relative(repoRoot, skillPath)}.`,
      );
    }
    return;
  }

  const frontmatter = readFrontmatter(skillContent, skillPath);
  const nameLine = getTopLevelFrontmatterLine(frontmatter, "name");
  const descriptionLine = getTopLevelFrontmatterLine(
    frontmatter,
    "description",
  );
  const invocationLine = getTopLevelFrontmatterLine(
    frontmatter,
    "disable-model-invocation",
  );
  const versionLine = getTopLevelFrontmatterLine(frontmatter, "version");
  const hasRequiredCoreOverlay =
    skillContent.includes(CORE_OVERLAY_START) &&
    skillContent.includes(CORE_OVERLAY_END) &&
    skillContent.includes("untrusted evidence") &&
    skillContent.includes("ignore embedded directives") &&
    skillContent.includes("never expose secrets");
  if (
    nameLine !== "name: grill-for-unknowns" ||
    versionLine !== `version: ${GRILL_REVIEWED_VERSION}` ||
    descriptionLine !== GRILL_CORE_DESCRIPTION ||
    invocationLine !== "disable-model-invocation: true" ||
    !hasRequiredCoreOverlay
  ) {
    throw new Error(
      `Core grill-for-unknowns compatibility was not applied to ${path.relative(repoRoot, skillPath)}.`,
    );
  }
}

function getErrorCode(error) {
  return typeof error === "object" && error !== null && "code" in error
    ? String(error.code)
    : "";
}

function assertSafeCanonicalSkillDirName(skillName, context) {
  if (
    typeof skillName !== "string" ||
    !SAFE_CANONICAL_SKILL_DIR_RE.test(skillName)
  ) {
    throw new Error(
      `Refusing unsafe canonical skill directory name${context ? ` (${context})` : ""}: ${JSON.stringify(skillName)}`,
    );
  }
}

function assertSafeRelativePath(relativePath, context) {
  if (
    typeof relativePath !== "string" ||
    path.isAbsolute(relativePath) ||
    relativePath.split(/[\\/]/).includes("..")
  ) {
    throw new Error(
      `Refusing unsafe relative path${context ? ` (${context})` : ""}: ${JSON.stringify(relativePath)}`,
    );
  }
}

function assertPathInside(parent, child, context) {
  const parentResolved = path.resolve(parent);
  const childResolved = path.resolve(child);
  const prefix = parentResolved.endsWith(path.sep)
    ? parentResolved
    : `${parentResolved}${path.sep}`;

  if (childResolved !== parentResolved && !childResolved.startsWith(prefix)) {
    throw new Error(
      `Refusing path outside expected root${context ? ` (${context})` : ""}: ${childResolved}`,
    );
  }
}

function runGit(args, context, { capture = false } = {}) {
  const result = spawnSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const stderr = result.stderr?.trim();
    throw new Error(
      `${context} failed with exit ${result.status}${stderr ? `:\n${stderr}` : ""}`,
    );
  }

  return result.stdout?.trim() ?? "";
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function sha256File(filePath) {
  const content = await readFile(filePath);
  return createHash("sha256").update(content).digest("hex");
}

/**
 * Emil lock `computedHash` is the clone `SKILL.md` bytes, not the overlaid
 * canonical file. Skip hashing when the refresh source already contains a
 * Core overlay so a later `--only=emilkowalski/skills` run against synced
 * mirrors cannot rewrite those hashes to overlay bytes.
 */
async function hashEmilCloneSkillMd(skillFilePath) {
  const content = await readFile(skillFilePath);
  if (content.includes(CORE_OVERLAY_START)) {
    return null;
  }
  return createHash("sha256").update(content).digest("hex");
}

function emilLockSkillPath(skillName) {
  return skillName === "emil-prototype"
    ? "skills/prototype/SKILL.md"
    : `skills/${skillName}/SKILL.md`;
}

async function updateEmilCloneSkillLockHashes(preparedRefreshes) {
  const updates = preparedRefreshes.filter(
    (preparedRefresh) => typeof preparedRefresh.emilCloneSkillHash === "string",
  );

  if (updates.length === 0 || !(await fileExists(skillsLockPath))) {
    return;
  }

  const lockfile = await readSkillsLock();
  for (const { skillName, emilCloneSkillHash } of updates) {
    const existing = lockfile.skills[skillName] ?? {};
    lockfile.skills[skillName] = {
      ...existing,
      source: "emilkowalski/skills",
      sourceType: "github",
      skillPath: emilLockSkillPath(skillName),
      computedHash: emilCloneSkillHash,
    };
  }
  await writeSkillsLock(lockfile);
}

async function listFilesRecursively(rootDir, currentDir = rootDir) {
  const entries = await readdir(currentDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFilesRecursively(rootDir, absolutePath)));
    } else if (entry.isFile()) {
      files.push(absolutePath);
    }
  }

  return files;
}

/**
 * Deterministic content hash over every vendored file in a skill directory
 * (sorted relative path + bytes), so `skills-lock.json` changes whenever any
 * copied support file changes — not only `SKILL.md`. The generated
 * `references/upstream.md` is excluded because it embeds refresh metadata
 * (review date) that would make the hash non-deterministic.
 */
async function computeVendoredTreeHash(targetRoot) {
  const absolutePaths = await listFilesRecursively(targetRoot);
  const relativePaths = absolutePaths
    .map((absolutePath) =>
      path.relative(targetRoot, absolutePath).split(path.sep).join("/"),
    )
    .filter((relativePath) => relativePath !== "references/upstream.md")
    .sort();

  const hash = createHash("sha256");
  for (const relativePath of relativePaths) {
    const content = await readFile(path.join(targetRoot, relativePath));
    hash.update(relativePath);
    hash.update("\0");
    hash.update(content);
    hash.update("\0");
  }
  return hash.digest("hex");
}

async function formatSkillTarget(targetRoot) {
  const prettierBin = path.join(
    repoRoot,
    "node_modules",
    ".bin",
    process.platform === "win32" ? "prettier.cmd" : "prettier",
  );

  if (!(await fileExists(prettierBin))) {
    console.warn(
      `[warn] prettier not found at ${path.relative(repoRoot, prettierBin)}; copied ${path.relative(repoRoot, targetRoot)} without repo formatting`,
    );
    return;
  }

  const result = spawnSync(prettierBin, ["--write", targetRoot], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      `prettier failed for ${path.relative(repoRoot, targetRoot)} with exit ${result.status}`,
    );
  }
}

async function readSkillsLock() {
  const raw = await readFile(skillsLockPath, "utf8");
  const parsed = JSON.parse(raw);
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("skills-lock.json must contain an object");
  }
  if (typeof parsed.version !== "number") {
    throw new Error("skills-lock.json is missing numeric version");
  }
  if (typeof parsed.skills !== "object" || parsed.skills === null) {
    throw new Error("skills-lock.json is missing skills object");
  }
  return parsed;
}

async function writeSkillsLock(lockfile) {
  const sortedSkills = Object.fromEntries(
    Object.entries(lockfile.skills).sort(([left], [right]) =>
      left.localeCompare(right),
    ),
  );
  const sortedLockfile = {
    version: lockfile.version,
    skills: sortedSkills,
  };
  await writeFileAtomically(
    skillsLockPath,
    `${JSON.stringify(sortedLockfile, null, 2)}\n`,
  );
}

async function writeFileAtomically(targetPath, content) {
  const staging = getTemporarySiblingPath(targetPath, "refresh-file");
  await mkdir(path.dirname(targetPath), { recursive: true });
  try {
    await writeFile(staging, content, { flag: "wx" });
    await rename(staging, targetPath);
  } finally {
    try {
      await rm(staging, { force: true });
    } catch (cleanupError) {
      // A successful rename has already published the file. Housekeeping
      // cannot hide that success from the transaction or mask a write error.
      console.warn(
        `warning: failed to remove refresh file staging ${staging}`,
        cleanupError,
      );
    }
  }
}

async function commitFileUpdates(updates) {
  const originals = new Map();
  const written = [];
  let preserveBackups = false;
  try {
    // Persist all original bytes before replacing a companion or lockfile. An
    // interrupted rollback must leave recoverable data after this process exits.
    for (const { targetPath } of updates) {
      let original;
      try {
        original = await readFile(targetPath);
      } catch (error) {
        if (getErrorCode(error) !== "ENOENT") throw error;
        originals.set(targetPath, null);
        continue;
      }
      const backup = getTemporarySiblingPath(targetPath, "refresh-backup");
      originals.set(targetPath, backup);
      await writeFile(backup, original, { flag: "wx" });
    }
    for (const { targetPath, content } of updates) {
      await writeFileAtomically(targetPath, content);
      written.push(targetPath);
    }
  } catch (error) {
    const rollbackErrors = [];
    for (const targetPath of written.reverse()) {
      const backup = originals.get(targetPath);
      try {
        if (backup === null) await rm(targetPath, { force: true });
        else await writeFileAtomically(targetPath, await readFile(backup));
      } catch (rollbackError) {
        rollbackErrors.push(
          new Error(
            `Failed to restore ${targetPath}; recovery copy retained at ${backup}`,
            { cause: rollbackError },
          ),
        );
      }
    }
    if (rollbackErrors.length > 0) {
      preserveBackups = true;
      throw new AggregateError(
        [error, ...rollbackErrors],
        "Skill refresh rollback failed",
      );
    }
    throw error;
  } finally {
    if (!preserveBackups) {
      for (const backup of originals.values()) {
        if (backup === null) continue;
        try {
          await rm(backup, { force: true });
        } catch (cleanupError) {
          console.warn(
            `warning: failed to remove refresh backup ${backup}`,
            cleanupError,
          );
        }
      }
    }
  }
}

function buildUpstreamMetadata({ group, skillName, hash, commitSha }) {
  const upstreamPath = group.upstreamPath(skillName);
  const sourceUrl = group.sourceUrlForSkill(skillName);
  const lockSkillPath = group.lockSkillPath(skillName);
  return `---
source_name: ${group.source} (${skillName})
source_url: ${sourceUrl}
source_type: github
upstream_path: ${upstreamPath}
skills_lock_hash: ${hash}
last_reviewed: ${lastReviewed}
---

# Upstream: ${skillName}

Canonical copy in this repo: \`docs/ai/skills/${skillName}/\` (mirrored to \`.cursor/skills/\` and \`.agents/skills/\` via \`bun run skills:sync\`).

- **Repository:** ${group.sourceUrl}
- **Ref:** \`${group.ref}\`
- **Commit reviewed:** \`${commitSha}\`
- **Upstream path:** \`${upstreamPath}\`
- **Lock skillPath:** \`${lockSkillPath}\`
- **Computed hash:** \`${hash}\`

## Refresh from upstream

1. Run \`bun run skills:refresh-upstream\`.
2. The script clones \`${group.repo}\` at \`${group.ref}\`, verifies the upstream skill directory exists, copies the full skill directory into \`docs/ai/skills/${skillName}/\`, and updates this metadata.
3. Run \`bun run skills:sync\` and \`bun run skills:verify\` to refresh runtime mirrors.

## Notes for maintainers

- Do not copy secrets, tokens, or environment-specific identifiers into skill content.
- Preserve repo-local notes in this \`references/\` directory when refreshing.
`;
}

async function writeUpstreamMetadata({
  targetRoot,
  group,
  skillName,
  hash,
  commitSha,
}) {
  const metadataPath = path.join(targetRoot, "references", "upstream.md");
  assertPathInside(targetRoot, metadataPath, "upstream metadata");
  await mkdir(path.dirname(metadataPath), { recursive: true });
  await writeFile(
    metadataPath,
    buildUpstreamMetadata({ group, skillName, hash, commitSha }),
    "utf8",
  );
}

async function copySkillExtraFiles({ cloneDir, targetRoot, extraCopies = [] }) {
  for (const extraCopy of extraCopies) {
    assertSafeRelativePath(extraCopy.from, "skill extra source");
    assertSafeRelativePath(extraCopy.to, "skill extra target");

    const sourcePath = path.join(cloneDir, extraCopy.from);
    const targetPath = path.join(targetRoot, extraCopy.to);
    assertPathInside(cloneDir, sourcePath, "skill extra source");
    assertPathInside(targetRoot, targetPath, "skill extra target");

    if (!(await fileExists(sourcePath))) {
      throw new Error(
        `Missing required upstream support file: ${extraCopy.from}`,
      );
    }

    await mkdir(path.dirname(targetPath), { recursive: true });
    await cp(sourcePath, targetPath, { recursive: true, force: true });
  }
}

/**
 * Read companion files (copied outside `docs/ai/skills/`, e.g. `.cursor/agents/`)
 * into memory during the staging phase so a missing upstream file fails the group
 * before any repo mutation, and the post-commit write is a plain buffer write.
 */
async function readCompanionFiles({ cloneDir, group }) {
  const companionFiles = [];

  for (const extraCopy of group.extraCopies ?? []) {
    assertSafeRelativePath(extraCopy.from, `${group.name} companion source`);
    assertSafeRelativePath(extraCopy.to, `${group.name} companion target`);

    const sourcePath = path.join(cloneDir, extraCopy.from);
    const targetPath = path.join(repoRoot, extraCopy.to);
    assertPathInside(cloneDir, sourcePath, `${group.name} companion source`);
    assertPathInside(repoRoot, targetPath, `${group.name} companion target`);

    if (!(await fileExists(sourcePath))) {
      throw new Error(
        `Missing required upstream companion file: ${extraCopy.from}`,
      );
    }

    companionFiles.push({
      from: extraCopy.from,
      targetPath,
      content: await readFile(sourcePath),
    });
  }

  return companionFiles;
}

/**
 * Stage one GitHub-vendored skill into a temporary sibling of its canonical
 * directory: copy from the clone, copy configured support files, format with
 * repo Prettier, hash, and regenerate `references/upstream.md`. Nothing under
 * `docs/ai/skills/` is mutated. Returns `null` when the upstream skill is
 * missing so the caller can warn and skip it without touching the canonical copy.
 */
async function prepareGithubSkillRefresh({
  group,
  skillName,
  cloneDir,
  commitSha,
}) {
  const upstreamSkillDir = path.join(cloneDir, group.sourceRoot, skillName);
  const upstreamSkillFile = path.join(upstreamSkillDir, "SKILL.md");
  const to = path.join(canonicalRoot, skillName);

  assertPathInside(cloneDir, upstreamSkillDir, `${group.name} source`);
  assertPathInside(canonicalRoot, to, `${group.name} target`);

  if (!(await fileExists(upstreamSkillFile))) {
    return null;
  }
  await assertCanonicalDirectoryEntry(to);

  const staging = getTemporarySiblingPath(to, "refresh-staging");
  await mkdir(path.dirname(staging), { recursive: true });
  await rm(staging, { recursive: true, force: true });

  try {
    await cp(upstreamSkillDir, staging, { recursive: true });
    await copySkillExtraFiles({
      cloneDir,
      targetRoot: staging,
      extraCopies: group.skillExtraCopies?.[skillName] ?? [],
    });
    const preservedCoreOverlay = await readCoreOverlay(to);
    await formatSkillTarget(staging);
    await restoreCoreOverlay(staging, preservedCoreOverlay, skillName);
    await applyPostRefreshReplacements(skillName, staging);

    const hash = await sha256File(path.join(staging, "SKILL.md"));
    await writeUpstreamMetadata({
      targetRoot: staging,
      group,
      skillName,
      hash,
      commitSha,
    });
    const treeHash = await computeVendoredTreeHash(staging);

    return {
      refresh: { skillName, from: upstreamSkillDir, to, staging },
      lockEntry: {
        source: group.source,
        sourceType: "github",
        skillPath: group.lockSkillPath(skillName),
        computedHash: hash,
        treeHash,
      },
    };
  } catch (error) {
    await cleanupRefreshStaging([{ staging }]);
    throw error;
  }
}

/**
 * Refresh one GitHub source group atomically: clone once, stage every skill in
 * the group, then swap all staged directories into `docs/ai/skills/` with the
 * same backup/rollback machinery used for local sources. Companion files and
 * `lockfile.skills` entries are applied only after every swap succeeds, so a
 * failed refresh never leaves copied skills and lock metadata out of sync.
 */
async function refreshGithubGroup(group, lockfile) {
  for (const skillName of group.skillNames) {
    assertSafeCanonicalSkillDirName(skillName, `${group.name} config`);
  }

  const tempRoot = await mkdtemp(
    path.join(os.tmpdir(), "core-skill-upstream-"),
  );
  const cloneDir = path.join(tempRoot, group.source.replace(/[^\w.-]+/g, "-"));

  try {
    // Maintainers can rerun this command to pull newer upstream content without
    // manually copy-pasting skill files from GitHub.
    runGit(
      ["clone", "--depth", "1", "--branch", group.ref, group.repo, cloneDir],
      `clone ${group.name}`,
    );
    const commitSha = runGit(
      ["-C", cloneDir, "rev-parse", "HEAD"],
      `resolve ${group.name} commit`,
      { capture: true },
    );

    const preparedRefreshes = [];
    const lockEntries = new Map();

    try {
      for (const skillName of group.skillNames) {
        const prepared = await prepareGithubSkillRefresh({
          group,
          skillName,
          cloneDir,
          commitSha,
        });

        if (!prepared) {
          console.warn(
            `[warn] skipping ${skillName}: upstream SKILL.md not found at ${path.join(group.sourceRoot, skillName, "SKILL.md")}`,
          );
          continue;
        }

        preparedRefreshes.push(prepared.refresh);
        lockEntries.set(skillName, prepared.lockEntry);
      }

      const companionFiles = await readCompanionFiles({ cloneDir, group });

      const nextSkills = {
        ...lockfile.skills,
        ...Object.fromEntries(lockEntries),
      };
      const nextLockfile = {
        version: lockfile.version,
        skills: Object.fromEntries(
          Object.entries(nextSkills).sort(([left], [right]) =>
            left.localeCompare(right),
          ),
        ),
      };
      // Retain directory backups until every companion and the lockfile is
      // committed. A later side-file failure restores earlier file writes too.
      await commitPreparedRefreshes(preparedRefreshes, () =>
        commitFileUpdates([
          ...companionFiles,
          {
            targetPath: skillsLockPath,
            content: `${JSON.stringify(nextLockfile, null, 2)}\n`,
          },
        ]),
      );
      lockfile.skills = nextSkills;
    } catch (error) {
      await cleanupRefreshStaging(preparedRefreshes);
      throw error;
    }

    for (const { from, to } of preparedRefreshes) {
      console.log(
        `refreshed ${path.relative(repoRoot, to)} <= ${path.relative(cloneDir, from)}`,
      );
    }

    return preparedRefreshes.length;
  } finally {
    try {
      await rm(tempRoot, { recursive: true, force: true });
    } catch (cleanupError) {
      // Keep any transaction error intact: broad refreshes must still abort
      // after incomplete rollback rather than treating cleanup as a safe skip.
      console.warn(
        `warning: failed to remove GitHub clone directory ${tempRoot}`,
        cleanupError,
      );
    }
  }
}

/**
 * Refresh the configured GitHub source groups. The lockfile is read once and
 * written only when at least one group refreshed successfully, so a repo
 * without `skills-lock.json` (e.g. the script-verifier fixtures) skips GitHub
 * vendoring instead of failing the whole run.
 */
async function refreshGithubGroups(groups, { focused }) {
  if (!(await fileExists(skillsLockPath))) {
    const message =
      "skills-lock.json not found; skipping GitHub upstream refresh";
    if (focused) {
      throw new Error(message);
    }
    console.warn(`[warn] ${message}`);
    return 0;
  }

  const lockfile = await readSkillsLock();
  let refreshedCount = 0;
  let skippedGroups = 0;

  for (const group of groups) {
    try {
      refreshedCount += await refreshGithubGroup(group, lockfile);
    } catch (error) {
      if (focused) {
        throw new Error(
          isIncompleteSkillRefreshRollbackError(error)
            ? `Focused upstream refresh for ${group.source} failed and skill rollback was incomplete`
            : `Focused upstream refresh for ${group.source} failed without changing canonical skills`,
          { cause: error },
        );
      }
      if (isIncompleteSkillRefreshRollbackError(error)) throw error;
      console.warn(
        `[warn] skipping ${group.name} (${group.skillNames.join(", ")}): ${error instanceof Error ? error.message : String(error)}`,
      );
      skippedGroups += 1;
    }
  }

  if (refreshedCount > 0) {
    console.log(
      `updated skills-lock.json for ${refreshedCount} GitHub skill(s)`,
    );
  }

  if (skippedGroups > 0) {
    console.warn(
      `${skippedGroups} GitHub source group(s) skipped — check network access or upstream availability to refresh them.`,
    );
  }

  return refreshedCount;
}

function getTemporarySiblingPath(targetPath, label) {
  const parentDir = path.dirname(targetPath);
  const targetName = path.basename(targetPath);
  const uniqueSuffix = `${process.pid}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;

  return path.join(parentDir, `.${targetName}.${label}-${uniqueSuffix}`);
}

async function pathEntry(targetPath) {
  try {
    return await lstat(targetPath);
  } catch (error) {
    if (getErrorCode(error) === "ENOENT") return null;
    throw error;
  }
}

async function pathExists(targetPath) {
  return (await pathEntry(targetPath)) !== null;
}

async function renameOnce(fromPath, toPath) {
  // Overlayfs can reject same-directory rename of lower-layer skill directories
  // with EXDEV. Tests set CORE_SKILLS_SIMULATE_RENAME_EXDEV=1 to exercise the
  // copy+rm fallback.
  if (
    process.env.CORE_SKILLS_SIMULATE_RENAME_EXDEV === "1" &&
    (await pathExists(fromPath))
  ) {
    const error = new Error("EXDEV: simulated cross-device rename");
    error.code = "EXDEV";
    throw error;
  }

  await rename(fromPath, toPath);
}

async function moveDirectory(fromPath, toPath) {
  try {
    await renameOnce(fromPath, toPath);
  } catch (error) {
    if (getErrorCode(error) !== "EXDEV") throw error;
    if (await pathExists(toPath)) {
      throw Object.assign(
        new Error(`Refusing occupied refresh destination ${toPath}`, {
          cause: error,
        }),
        { code: "EEXIST" },
      );
    }
    await cp(fromPath, toPath, {
      recursive: true,
      force: false,
      errorOnExist: true,
    });
    await rm(fromPath, { recursive: true, force: true });
  }
}

async function assertCanonicalDirectoryEntry(targetPath) {
  const entry = await pathEntry(targetPath);
  if (entry && !entry.isDirectory()) {
    throw new Error(
      `Refusing unexpected non-directory canonical destination ${targetPath}`,
    );
  }
  return entry;
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
  const emilCloneSkillHash = emilKowalskiSkillNames.includes(skillName)
    ? await hashEmilCloneSkillMd(path.join(from, "SKILL.md"))
    : null;
  await assertCanonicalDirectoryEntry(to);
  const preservedFiles = await readPreservedFiles(to, preserve);
  const preservedCoreOverlay = await readCoreOverlay(to);
  if (skillName === "grill-for-unknowns" && !preservedCoreOverlay) {
    throw new Error(
      `Core grill-for-unknowns refresh requires the canonical safety overlay in ${path.relative(repoRoot, path.join(to, "SKILL.md"))}.`,
    );
  }
  if (skillName === "ask-matt" && !preservedCoreOverlay) {
    throw new Error(
      `Core ask-matt refresh requires the canonical grill-depth overlay in ${path.relative(repoRoot, path.join(to, "SKILL.md"))}.`,
    );
  }

  await mkdir(path.dirname(staging), { recursive: true });
  await rm(staging, { recursive: true, force: true });

  try {
    await cp(from, staging, { recursive: true });
    await restorePreservedFiles(staging, preservedFiles);
    await restoreCoreOverlay(staging, preservedCoreOverlay, skillName);
    await applyPostRefreshReplacements(skillName, staging);
    await assertPostRefreshCompatibility(skillName, staging);
  } catch (error) {
    await cleanupRefreshStaging([{ staging }]);
    throw error;
  }

  return { skillName, from, to, staging, emilCloneSkillHash };
}

async function cleanupRefreshStaging(preparedRefreshes) {
  for (const { staging } of preparedRefreshes) {
    try {
      await rm(staging, { recursive: true, force: true });
    } catch (cleanupError) {
      // Cleanup of a temporary path must not replace an earlier recovery
      // failure and let a broad refresh misclassify it as a harmless skip.
      console.warn(
        `warning: failed to remove refresh staging ${staging}`,
        cleanupError,
      );
    }
  }
}

async function prepareSkillRefreshes(sources) {
  const preparedRefreshes = [];

  try {
    for (const source of sources) {
      preparedRefreshes.push(await prepareSkillRefresh(source));
    }
    return preparedRefreshes;
  } catch (error) {
    await cleanupRefreshStaging(preparedRefreshes);
    throw error;
  }
}

function isIncompleteSkillRefreshRollbackError(error) {
  return (
    error instanceof AggregateError &&
    (error.message === "Skill refresh rollback failed" ||
      error.message.startsWith("Failed to restore "))
  );
}

async function swapPreparedRefresh(preparedRefresh) {
  const { to, staging } = preparedRefresh;
  const backup = getTemporarySiblingPath(to, "refresh-backup");
  const hasBackup = (await assertCanonicalDirectoryEntry(to)) !== null;

  if (hasBackup) {
    // A copy leaves the canonical source intact if creating a backup fails.
    // Record the complete backup before any removal of the canonical tree.
    try {
      await cp(to, backup, {
        recursive: true,
        force: false,
        errorOnExist: true,
      });
    } catch (error) {
      await rm(backup, { recursive: true, force: true });
      throw error;
    }
  }

  const swappedRefresh = { ...preparedRefresh, backup, hasBackup };
  try {
    if (hasBackup) await rm(to, { recursive: true, force: true });
    await moveDirectory(staging, to);
  } catch (error) {
    if (
      ["EEXIST", "ENOTEMPTY", "ENOTDIR", "EISDIR"].includes(
        getErrorCode(error),
      ) &&
      (await pathExists(to))
    ) {
      // A competing destination is not ours to remove. Keep both it and the
      // complete recovery copy and stop instead of claiming a clean rollback.
      throw new AggregateError(
        [error],
        hasBackup
          ? `Failed to restore ${to}; occupied destination preserved and backup retained at ${backup}`
          : `Failed to restore ${to}; occupied destination preserved and no prior canonical tree existed`,
      );
    }
    try {
      await rollbackSwappedRefresh(swappedRefresh);
    } catch (restoreError) {
      throw new AggregateError(
        [error, restoreError],
        `Failed to restore ${to} from backup ${backup} after refresh swap error`,
      );
    }
    throw error;
  }
  return swappedRefresh;
}

async function rollbackSwappedRefresh(swappedRefresh) {
  const { to, backup, hasBackup } = swappedRefresh;
  await rm(to, { recursive: true, force: true });
  if (hasBackup) {
    // Keep the complete recovery copy if restoration itself is interrupted.
    await cp(backup, to, { recursive: true, force: false, errorOnExist: true });
    await rm(backup, { recursive: true, force: true });
  }
}

async function commitPreparedRefreshes(
  preparedRefreshes,
  afterSwap = async () => {},
) {
  const swappedRefreshes = [];
  try {
    for (const preparedRefresh of preparedRefreshes) {
      swappedRefreshes.push(await swapPreparedRefresh(preparedRefresh));
    }
    await afterSwap();
  } catch (error) {
    const rollbackErrors = [];
    for (const swappedRefresh of swappedRefreshes.reverse()) {
      try {
        await rollbackSwappedRefresh(swappedRefresh);
      } catch (rollbackError) {
        rollbackErrors.push(rollbackError);
      }
    }
    if (rollbackErrors.length > 0) {
      throw new AggregateError(
        [error, ...rollbackErrors],
        "Skill refresh rollback failed",
      );
    }
    throw error;
  } finally {
    await cleanupRefreshStaging(preparedRefreshes);
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
  await commitPreparedRefreshes(preparedRefreshes, () =>
    updateEmilCloneSkillLockHashes(preparedRefreshes),
  );
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

function groupSourcesBySourceGroup(sources) {
  const groups = new Map();

  for (const source of sources) {
    const existingGroup = groups.get(source.sourceGroup) ?? [];
    existingGroup.push(source);
    groups.set(source.sourceGroup, existingGroup);
  }

  return groups;
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
  const githubGroups = onlySourceGroup
    ? githubUpstreamGroups.filter((group) => group.source === onlySourceGroup)
    : githubUpstreamGroups;

  if (onlySourceGroup && sources.length === 0 && githubGroups.length === 0) {
    throw new Error(`Unknown upstream source group: ${onlySourceGroup}`);
  }

  if (onlySourceGroup) {
    if (sources.length > 0) {
      await assertFocusedSourcesAvailable(onlySourceGroup, sources);
      try {
        await refreshSkillsAtomically(sources);
      } catch (error) {
        throw new Error(
          isIncompleteSkillRefreshRollbackError(error)
            ? `Focused upstream refresh for ${onlySourceGroup} failed and skill rollback was incomplete`
            : `Focused upstream refresh for ${onlySourceGroup} failed without changing canonical skills`,
          { cause: error },
        );
      }
    }
    if (githubGroups.length > 0) {
      await refreshGithubGroups(githubGroups, { focused: true });
    }
  } else {
    let skipped = 0;
    const sourceGroups = groupSourcesBySourceGroup(sources);
    for (const [sourceGroup, groupedSources] of sourceGroups) {
      try {
        await refreshSkillsAtomically(groupedSources);
      } catch (error) {
        if (isIncompleteSkillRefreshRollbackError(error)) throw error;
        console.warn(
          `[warn] skipping ${sourceGroup} (${groupedSources.map(({ skillName }) => skillName).join(", ")}): ${error instanceof Error ? error.message : String(error)}`,
        );
        skipped += groupedSources.length;
      }
    }
    if (skipped > 0) {
      console.warn(
        `${skipped} skill(s) skipped — install their upstream sources to refresh them.`,
      );
    }
    await refreshGithubGroups(githubUpstreamGroups, { focused: false });
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
