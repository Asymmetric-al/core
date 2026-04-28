---
name: repo-entry
description: Pointer to the canonical agent instruction and skill system for this monorepo
---

# Repository agent instructions

**Canonical content:** `docs/ai/skills/repo-entry/SKILL.md`

This root file exists so tools that discover `SKILL.md` at the repository root still land on the same entry skill. Edit the canonical file under `docs/ai/skills/repo-entry/` only; run `bun run skills:sync` after changes.
