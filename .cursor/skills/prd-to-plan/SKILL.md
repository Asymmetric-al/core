---
name: prd-to-plan
description: Bridge from PRD to an implementation plan. Upstream mattpocock/skills has no skill by this id—use to-prd, OpenSpec changes, and architecture skills instead.
---

There is **no** `prd-to-plan` skill in [mattpocock/skills](https://github.com/mattpocock/skills). Use this sequence instead:

1. **`to-prd`** — `.cursor/skills/to-prd/SKILL.md` — produce the PRD (align with **OpenSpec**: `openspec/specs/**`, `openspec/changes/**`).
2. **Planning / breakdown** — **`to-issues`** (issue decomposition), **`improve-codebase-architecture`** (deepening/refactors), **`zoom-out`** (module map), plus **`docs/ai/rules/*`** as needed.

See **`references/upstream.md`**.
