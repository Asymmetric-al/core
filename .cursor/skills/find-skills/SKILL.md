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

- `npx skills find [query]` - Search for skills interactively or by keyword
- `npx skills add <package>` - Install a skill from GitHub or other sources
- `npx skills check` - Check for skill updates
- `npx skills update` - Update all installed skills

**Browse skills at:** https://skills.sh/

### Repo-local skills (Asymmetric-al/core)

Before searching the public index, check **`docs/ai/skills/`** and **`AGENTS.md` → Skill Routing**. Canonical repo-owned skills live under `docs/ai/skills/` and are mirrored to `.cursor/skills/` and `.agents/skills/` with `bun run skills:sync` (CI: `bun run skills:verify`).

Use the canonical docs path when routing or documenting repo-critical skills. Treat `.cursor/skills/` and `.agents/skills/` as shared runtime mirrors for tool compatibility, not the primary authoring location.

Some extra ecosystem or tool-specific skills may exist only in `.cursor/skills/` or `.agents/skills/`. Those are optional unless the repo explicitly promotes them into `docs/ai/skills/`.

**Example — Supabase:** platform work is covered by `docs/ai/skills/supabase/SKILL.md` and Postgres tuning by `docs/ai/skills/supabase-postgres-best-practices/SKILL.md`. Install or refresh from [supabase/agent-skills](https://skills.sh/supabase/agent-skills) with `npx skills add supabase/agent-skills -y`, then `bun run skills:refresh-upstream`, `bun run skills:sync`, and `bun run skills:verify`. **`skills-lock.json`** records CLI pins; use `npx skills experimental_install -y` to restore from the lockfile.

**Example — Tiptap:** rich text work is covered by `docs/ai/skills/tiptap/SKILL.md`. To compare against upstream: `npx skills add ueberdosis/tiptap` (see also [Tiptap agent skill](https://tiptap.dev/docs/resources/agent-skill)).

**Example — npm dependency cleanup:** reducing unused or heavy JS dependencies across npm, pnpm, Yarn, or Bun is covered by `docs/ai/skills/npm-deps-cleanup/SKILL.md`. Install or refresh from [anthonyshew/dotfiles](https://skills.sh/anthonyshew/dotfiles) with `npx skills add anthonyshew/dotfiles -y`, then `bun run skills:refresh-upstream`, `bun run skills:sync`, and `bun run skills:verify`.

**Example — Resend CLI:** terminal, automation, and CI work is covered by `docs/ai/skills/resend-cli/SKILL.md`. It is vendored from [`resend/resend-cli`](https://github.com/resend/resend-cli) (`skills/resend-cli/` at tag v2.0.0+); maintainer refresh notes are in `docs/ai/skills/resend-cli/references/upstream.md`.

**Example — Resend platform skills:** SDK, webhooks, inbound, and send/receive platform workflows are a separate concern. Optional ecosystem install [`resend/resend-skills`](https://github.com/resend/resend-skills) may live under `.agents/skills/resend/` when added with the Skills CLI.

**Example — Resend app integration:** app-level Resend integration in this monorepo is documented in `docs/guides/features/resend-integration.md`.

**Example — bendc frontend guidelines:** semantic HTML, CSS discipline, and vanilla JS readability patterns from [`bendc/frontend-guidelines`](https://github.com/bendc/frontend-guidelines) are covered by `docs/ai/skills/bendc-frontend-guidelines/SKILL.md` (vendored `README.md` under `references/`); maintainer refresh notes are in `docs/ai/skills/bendc-frontend-guidelines/references/upstream.md`. Use **`docs/ai/rules/frontend.md`** first for `apps/*` and `packages/ui` work.

**Example — Payload CMS:**

- **Application skill:** `docs/ai/skills/payloadcms-payload/SKILL.md` for collections, fields, hooks, access, queries, adapters, plugins, and Payload app behavior.
- **Migration skill:** `docs/ai/skills/payloadcms-cms-migration/SKILL.md` for CMS to Payload content-model migration.
- **Upstream:** vendored from [`payloadcms/skills`](https://github.com/payloadcms/skills) (`skills/payload/`, `skills/cms-migration/`).
- **Refresh notes:** `docs/ai/skills/payloadcms-payload/references/upstream.md` and `docs/ai/skills/payloadcms-cms-migration/references/upstream.md`.
- **Optional Skills CLI install:** `npx skills add payloadcms/skills`.
- **Pair with:** `docs/ai/rules/backend.md` for server and data boundaries.

## How to Help Users Find Skills

### Step 1: Understand What They Need

When a user asks for help with something, identify:

1. The domain (e.g., React, testing, design, deployment)
2. The specific task (e.g., writing tests, creating animations, reviewing PRs)
3. Whether this is a common enough task that a skill likely exists

### Step 2: Search for Skills

Run the find command with a relevant query:

```bash
npx skills find [query]
```

For example:

- User asks "how do I make my React app faster?" → `npx skills find react performance`
- User asks "can you help me with PR reviews?" → `npx skills find pr review`
- User asks "I need to create a changelog" → `npx skills find changelog`

The command will return results like:

```
Install with npx skills add <owner/repo@skill>

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
npx skills add vercel-labs/agent-skills@vercel-react-best-practices

Learn more: https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices
```

### Step 4: Offer to Install

If the user wants to proceed, you can install the skill for them:

```bash
npx skills add <owner/repo@skill> -g -y
```

The `-g` flag installs globally (user-level) and `-y` skips confirmation prompts.

## Common Skill Categories

When searching, consider these common categories:

| Category        | Example Queries                          |
| --------------- | ---------------------------------------- |
| Web Development | react, nextjs, typescript, css, tailwind |
| Testing         | testing, jest, playwright, e2e           |
| DevOps          | deploy, docker, kubernetes, ci-cd        |
| Documentation   | docs, readme, changelog, api-docs        |
| Code Quality    | review, lint, refactor, best-practices   |
| Design          | ui, ux, design-system, accessibility     |
| Productivity    | workflow, automation, git                |

## Tips for Effective Searches

1. **Use specific keywords**: "react testing" is better than just "testing"
2. **Try alternative terms**: If "deploy" doesn't work, try "deployment" or "ci-cd"
3. **Check popular sources**: Many skills come from `vercel-labs/agent-skills` or `ComposioHQ/awesome-claude-skills`

## When No Skills Are Found

If no relevant skills exist:

1. Acknowledge that no existing skill was found
2. Offer to help with the task directly using your general capabilities
3. Suggest the user could create their own skill with `npx skills init`

Example:

```
I searched for skills related to "xyz" but didn't find any matches.
I can still help you with this task directly! Would you like me to proceed?

If this is something you do often, you could create your own skill:
npx skills init my-xyz-skill
```

## Triggers

- User asks how to do something that might have an existing skill
- User wants to find, install, or compare agent skills (public or repo-local)

## Checklist

- [ ] Checked `docs/ai/skills/` and **Skill Routing** in `AGENTS.md` before suggesting `npx skills find`
- [ ] For repo work, pointed at canonical paths under `docs/ai/skills/` and `bun run skills:sync` when mirrors matter
