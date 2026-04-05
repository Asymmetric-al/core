---
name: repo-entry
description: Pointer to the canonical agent instruction and skill system for this monorepo
---

# Repository agent instructions

This file is not the primary instruction source.

1. Read and follow root **`AGENTS.md`** (Next.js managed block, routing, Nia, MCP, monorepo commands).
2. For **canonical** task skills maintained by this repo, use **`docs/ai/skills/*/SKILL.md`**.
3. After changing skills under `docs/ai/skills/`, run **`bun run skills:sync`** and ensure **`bun run skills:verify`** passes before committing.
4. Additional packs may exist only under **`.cursor/skills/`**; use them when their `SKILL.md` description matches the task.
