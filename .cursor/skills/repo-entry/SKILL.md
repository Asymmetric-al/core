---
name: repo-entry
description: "Default orientation skill for work in this monorepo. Pointer to AGENTS.md, canonical skills under docs/ai/skills/, and the skills:sync / skills:verify workflow for mirror directories."
metadata:
  owner: core
  last_updated: 2026-04-28
  status: active
  version: "1.0.0"
---

# Repository agent instructions (entry)

This skill is the **compact entry point** for the instruction and skill system. It is not a substitute for reading **`AGENTS.md`**.

## When to use

- You are starting or resuming work in this repo and need the authoritative map of rules and skills.
- A tool or workflow only surfaced a root `SKILL.md` and you need the full picture.
- You changed or added something under `docs/ai/skills/` and must refresh mirrors.

## Workflow

1. Read and follow root **`AGENTS.md`** (Next.js managed block, routing, Nia, MCP, monorepo commands).
2. For **canonical** task skills maintained by this repo, use **`docs/ai/skills/*/SKILL.md`** and the **Skill Routing** section in `AGENTS.md`.
3. After changing skills under `docs/ai/skills/`, run **`bun run skills:sync`** and ensure **`bun run skills:verify`** passes before committing.
4. Optional tool-specific or ecosystem skills may exist only under **`.cursor/skills/`**; use them when their `SKILL.md` description matches the task.

## Checklist

- [ ] `AGENTS.md` opened for the current task’s domain (rules, Nia scoping, checks).
- [ ] Relevant `docs/ai/skills/<topic>/SKILL.md` files loaded per Skill Routing.
- [ ] If `docs/ai/skills/` was edited: `bun run skills:sync` and `bun run skills:verify` run and clean.

## See also

- **Discover / install skills:** `docs/ai/skills/find-skills/SKILL.md`
- **Copilot entrypoint:** `.github/copilot-instructions.md` (points at `AGENTS.md`)
