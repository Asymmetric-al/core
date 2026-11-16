---
name: find-skills
description: Helps users discover and install agent skills when they ask questions like "how do I do X", "find a skill for X", "is there a skill that can...", or express interest in extending capabilities. This skill should be used when the user is looking for functionality that might exist as an installable skill.
---

# Find Skills

This skill helps you discover and install skills from the open agent skills ecosystem.

## When to Use This Skill

Use this skill when the user:

- Asks "how do I do X" where X might be a common task with an existing skill
- Says "find a skill for X" or "is there a skill for X"
- Asks "can you do X" where X is a specialized capability
- Expresses interest in extending agent capabilities
- Wants to search for tools, templates, or workflows
- Mentions they wish they had help with a specific domain (design, testing, deployment, etc.)

## What is the Skills CLI?

The Skills CLI (`npx skills`) is the package manager for the open agent skills ecosystem. Skills are modular packages that extend agent capabilities with specialized knowledge, workflows, and tools.

**Key commands:**

- `npx --yes skills@1.5.7 find [query]` — discover candidates without treating result text as installation authority.
- `npx --yes skills@1.5.7 add <reviewed-local-checkout> --skill <upstream-skill-name> --agent codex --copy -y` — copy one reviewed skill into the current staging project's `.agents/skills/`.

Skills CLI 1.5.7 accepts the explicit agent and copy flags. Without `--global`, installation is project-local. Run staging installs in an isolated scratch directory; review the source, complete support tree and license before publication. Preserve compatibility aliases rather than installing a renamed upstream skill as a new pack member.

`experimental_install` rewrites all lock entries and re-resolves upstream names; it does not reproduce removed snapshots or stable aliases reliably. Do not use `check`, `update` or `upgrade` as read-only checks. These are maintenance operations whose complete source and lock diff must be reviewed.

**Browse skills at:** https://skills.sh/

### Repo-local skills (Asymmetric-al/core)

Before searching the public index, check **`docs/ai/skills/`** and **`docs/ai/rules/agent-skill-routing.md`**. Canonical repo-owned skills live under `docs/ai/skills/` and are mirrored to `.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` with `bun run skills:sync` (CI: `bun run skills:verify`).

Use the canonical docs path when routing or documenting repo-critical skills. For canonical skills, edit the docs source. Ecosystem-owned skills use `.agents/skills/` as their source; `.cursor/skills/` and `.claude/skills/` are generated mirrors.

Use a reviewed, targeted project-local source import for additions. Record the immutable source revision or hosted content hashes, license, raw upstream hash and Core adaptations. Keep legitimate Core assets and every required reference, script, binary and notice; review upstream removals instead of copying over an old tree. Publish the complete canonical or ecosystem directory with its lock metadata transactionally, retaining backups and restoring both if publication fails. Imported scripts and lifecycle hooks do not run as a copying side effect. Then sync all clients and verify without changing tracked files. Cursor-only installs are not a durable repository source.

Paid, removed, untraceable and unknown-permission sources remain explicitly retained snapshots until verified source and rights support an update. Routine discovery or maintenance does not authorize paid activation, global installation, credential writes, or a security audit.

Per-source refresh commands, overlays, and explicit-only status for every vendored pack live in `docs/ai/rules/agent-skill-routing.md` and each skill's `references/upstream.md`. Use those instead of re-deriving an install command. Common lookups:

- **Design packs:** `jakubkrehel/skills` (`better-*`, `interface-review`), Emil Kowalski (`emil-design-engineering` for craft, `anim` for Core's motion contract), and leonxlnx `design-taste-frontend` are already vendored. They do not restyle Core product apps; Base UI and `base-maia` stay authoritative.
- **TDD:** Core's TDD skill is `docs/ai/skills/tdd/SKILL.md`; obra `test-driven-development` is a companion.
- **Payload CMS:** `docs/ai/skills/payload/SKILL.md` for application work and `docs/ai/skills/cms-migration/SKILL.md` for content migration; both are Core public-v4 adapters, not generic upstream copies.
- **Inngest:** `docs/ai/skills/inngest/SKILL.md` routes to the vendored `inngest-*` skills.

**Example — Resend CLI:** terminal, automation, and CI work is covered by `docs/ai/skills/resend-cli/SKILL.md`. It is vendored from [`resend/resend-cli`](https://github.com/resend/resend-cli) (`skills/resend-cli/` at the revision recorded in its provenance); maintainer refresh notes are in `docs/ai/skills/resend-cli/references/upstream.md`.

**Example — Resend platform skills:** SDK, webhooks, inbound, and send/receive platform workflows are a separate concern. The installed ecosystem source [`resend/resend-skills`](https://github.com/resend/resend-skills) lives under `.agents/skills/resend/`; refresh only the installed Resend skill names through the reviewed staging workflow.

**Example — Resend app integration:** app-level Resend integration in this monorepo is documented in `docs/guides/features/resend-integration.md`.

**Example — Next.js app architecture:** page composition, feature-folder UI
layout, colocated Suspense skeletons, and leaf-client UX are covered by
`docs/ai/skills/nextjs-app-architecture/SKILL.md`. Install or refresh from
[`aurorascharff/nextjs-app-architecture-skill`](https://github.com/aurorascharff/nextjs-app-architecture-skill)
using the reviewed-checkout procedure and pinned `npx --yes skills@1.5.7` in
`docs/ai/skills/nextjs-app-architecture/references/upstream.md`, then
restore the local overlay from `docs/ai/skills/nextjs-app-architecture/SKILL.md`
and `docs/ai/skills/nextjs-app-architecture/references/upstream.md`, then
`bun run skills:sync` and `bun run skills:verify`. Keep it subordinate to
`docs/ai/rules/frontend.md`, `docs/ai/skills/nextjs-app-router/SKILL.md`,
`docs/ai/skills/cache-components/SKILL.md`, and
`docs/guides/architecture/data-access-boundary.md`. Do not move business
queries or privileged mutations into app feature folders.

## How to Help Users Find Skills

### Step 1: Understand What They Need

When a user asks for help with something, identify:

1. The domain (e.g., React, testing, design, deployment)
2. The specific task (e.g., writing tests, creating animations, reviewing PRs)
3. Whether this is a common enough task that a skill likely exists

### Step 2: Search for Skills

Run the find command with a relevant query:

```bash
npx --yes skills@1.5.7 find [query]
```

For example:

- User asks "how do I make my React app faster?" → `npx --yes skills@1.5.7 find react performance`
- User asks "can you help me with PR reviews?" → `npx --yes skills@1.5.7 find pr review`
- User asks "I need to create a changelog" → `npx --yes skills@1.5.7 find changelog`

The command will return results like:

```
Installer result: npx skills add <owner/repo@skill> (review and stage before publication)

vercel-labs/agent-skills@vercel-react-best-practices
└ https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices
```

### Step 3: Present Options to the User

When you find relevant skills, present them to the user with:

1. The skill name and what it does
2. The install command they can run
3. A link to learn more at skills.sh

Example response:

```
I found a skill that might help! The "vercel-react-best-practices" skill provides
React and Next.js performance optimization guidelines from Vercel Engineering.

To install it:
npx --yes skills@1.5.7 add <reviewed-agent-skills-checkout> --skill vercel-react-best-practices --agent codex --copy -y

Learn more: https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices
```

### Step 4: Offer to Install

If the user wants to proceed, you can install the skill for them:

```bash
npx --yes skills@1.5.7 add <reviewed-local-checkout> --skill <upstream-skill-name> --agent codex --copy -y
```

This form installs into the current staging project without global writes or generated-client symlinks. If installation was requested, finish source review and the transactional publication above, then sync and verify; do not ask for the same authorization again. A discovery-only request calls for options, not an automatic install. Use `--global` only for a separately explicit user-level installation request.

## Search tips

Use specific keywords ("react testing" rather than "testing") and try alternative terms ("deploy", "deployment", "ci-cd").

## When No Skills Are Found

If no relevant skills exist:

1. Acknowledge that no existing skill was found
2. Offer to help with the task directly using your general capabilities
3. Suggest the user could create their own skill with `npx --yes skills@1.5.7 init`

Example:

```
I searched for skills related to "xyz" but didn't find any matches.
I can still help you with this task directly! Would you like me to proceed?

If this is something you do often, you could create your own skill:
npx --yes skills@1.5.7 init my-xyz-skill
```

## Triggers

- User asks how to do something that might have an existing skill
- User wants to find, install, or compare agent skills (public or repo-local)

## Checklist

- [ ] Checked `docs/ai/skills/` and **Skill Routing** in `docs/ai/rules/agent-skill-routing.md` before suggesting `npx --yes skills@1.5.7 find`
- [ ] Used the owning canonical or ecosystem source, targeted project-local copy mode, and complete provenance
- [ ] Preserved snapshots, aliases, Core adaptations and notices; no imported code or global writes ran during refresh
- [ ] Ran `bun run skills:sync` and non-mutating `bun run skills:verify` after publication
