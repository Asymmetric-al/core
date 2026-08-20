---
name: repo-entry
description: "Audit or update Core's repository instruction system and skill mirrors. Use for AGENTS.md architecture, canonical skill ownership, skills:sync, or skills:verify; do not invoke for ordinary application work."
metadata:
  owner: core
  last_updated: 2026-04-28
  status: active
  version: "1.0.0"
---

# Repository agent instructions (entry)

This skill is the maintenance entrypoint for the instruction and skill system.
Root `AGENTS.md` already provides ordinary repository orientation.

## When to use

- You are auditing or changing `AGENTS.md`, rule/skill routing, or instruction budgets.
- A tool or workflow only surfaced a root `SKILL.md` and you need the full picture.
- You changed or added something under `docs/ai/skills/` and must refresh mirrors.

## Workflow

1. Read and follow root **`AGENTS.md`**, the nearest scoped instructions, and
   `openspec/specs/agent-instruction-system/spec.md`.
2. For **canonical** task skills maintained by this repo, use **`docs/ai/skills/*/SKILL.md`** and **`docs/ai/rules/agent-skill-routing.md`**.
3. After changing skills under `docs/ai/skills/`, run **`bun run skills:sync`** and ensure **`bun run skills:verify`** passes before committing.
4. Optional tool-specific or ecosystem skills may originate under
   **`.agents/skills/`** and be mirrored into **`.cursor/skills/`** and
   **`.claude/skills/`**; use them only when their `SKILL.md` description
   matches and they remain subordinate to canonical repo guidance.

## Checklist

- [ ] Root and scoped instruction sources opened for the maintenance task.
- [ ] Relevant `docs/ai/skills/<topic>/SKILL.md` files loaded per `docs/ai/rules/agent-skill-routing.md`.
- [ ] If `docs/ai/skills/` was edited: `bun run skills:sync` and `bun run skills:verify` run and clean.

## See also

- **Discover / install skills:** `docs/ai/skills/find-skills/SKILL.md`
- **Instruction contract:** `openspec/specs/agent-instruction-system/spec.md`
