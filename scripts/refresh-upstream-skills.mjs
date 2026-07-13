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
const GRILL_UPSTREAM_DESCRIPTION =
  "description: Use when starting or reviewing a complex implementation where the user wants an agent to interrogate the plan against docs/source evidence, surface unknown unknowns, and avoid rushing into build mode. Combines docs-grounded grilling with a map-vs-territory unknowns pass.";
const GRILL_CORE_DESCRIPTION =
  "description: Use only when the user explicitly invokes grill-for-unknowns or asks for a map-vs-territory unknowns pass, blindspot discovery, unknown-known prototypes, or a subagent launch packet before implementation.";
const GRILL_REVIEWED_VERSION = "0.1.1";
const MATT_POCOCK_LINEAGE_COMMIT = "391a2701dd948f94f56a39f7533f8eea9a859c87";

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
    ref: "develop",
    sourceRoot: "skills",
    skillNames: ["babysit"],
    lockSkillPath() {
      return "skills/babysit/SKILL.md";
    },
    upstreamPath(skillName) {
      return `skills/${skillName}/`;
    },
    sourceUrlForSkill(skillName) {
      return `https://github.com/a5c-ai/babysitter-cursor/tree/develop/skills/${skillName}`;
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
];

const POST_REFRESH_REPLACEMENTS = [
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
      "  .popover { transform-origin: var(--radix-popover-content-transform-origin); } /* Radix */\n  .popover { transform-origin: var(--transform-origin); }                       /* Base UI */",
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
      "  .popover { transform-origin: var(--radix-popover-content-transform-origin); } /* Radix */\n  .popover { transform-origin: var(--transform-origin); }                       /* Base UI */",
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
      "--jq '[.[] | {key: (.filename | gsub(\"[^a-zA-Z0-9]\"; \"_\")), value: (.patch // \"\")}] | from_entries' \\",
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
      "The diff data keys should match the `data-diff` attribute values in the HTML:\n\n```html\n<div data-diff=\"path_to_file_ts\"></div>\n```",
    replace:
      "The diff data keys are the exact PR filenames (so distinct files can never collide), and each `data-diff` attribute value must match one of them:\n\n```html\n<div data-diff=\"path/to/file.ts\"></div>\n```",
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

async function assertPostRefreshCompatibility(skillName, targetRoot) {
  if (skillName !== "grill-for-unknowns") {
    return;
  }

  const skillPath = path.join(targetRoot, "SKILL.md");
  const skillContent = await readFile(skillPath, "utf8");
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
  await writeFile(
    skillsLockPath,
    `${JSON.stringify(sortedLockfile, null, 2)}\n`,
    "utf8",
  );
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

async function writeCompanionFiles(companionFiles) {
  for (const { from, targetPath, content } of companionFiles) {
    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, content);
    console.log(
      `refreshed companion ${path.relative(repoRoot, targetPath)} <= ${from}`,
    );
  }
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
    await formatSkillTarget(staging);
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
    await rm(staging, { recursive: true, force: true });
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

      // Everything staged successfully — commit the swaps, then side effects.
      await commitPreparedRefreshes(preparedRefreshes);
      await writeCompanionFiles(companionFiles);
      for (const [skillName, lockEntry] of lockEntries) {
        lockfile.skills[skillName] = lockEntry;
      }
    } catch (error) {
      await Promise.all(
        preparedRefreshes.map(({ staging }) =>
          rm(staging, { recursive: true, force: true }),
        ),
      );
      throw error;
    }

    for (const { from, to } of preparedRefreshes) {
      console.log(
        `refreshed ${path.relative(repoRoot, to)} <= ${path.relative(cloneDir, from)}`,
      );
    }

    return preparedRefreshes.length;
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
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
          `Focused upstream refresh for ${group.source} failed without changing canonical skills`,
          { cause: error },
        );
      }
      console.warn(
        `[warn] skipping ${group.name} (${group.skillNames.join(", ")}): ${error instanceof Error ? error.message : String(error)}`,
      );
      skippedGroups += 1;
    }
  }

  if (refreshedCount > 0) {
    await writeSkillsLock(lockfile);
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
  if (skillName === "grill-for-unknowns" && !preservedCoreOverlay) {
    throw new Error(
      `Core grill-for-unknowns refresh requires the canonical safety overlay in ${path.relative(repoRoot, path.join(to, "SKILL.md"))}.`,
    );
  }

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
          `Focused upstream refresh for ${onlySourceGroup} failed without changing canonical skills`,
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
