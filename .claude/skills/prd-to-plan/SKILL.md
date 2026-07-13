---
name: prd-to-plan
description: Legacy router from PRD/spec intent to the current Matt Pocock spec and ticket flow. Prefer to-spec and to-tickets.
---

There is **no** `prd-to-plan` skill in
[mattpocock/skills](https://github.com/mattpocock/skills). Use the current
spec/ticket flow instead:

1. **`to-spec`** - `docs/ai/skills/to-spec/SKILL.md` - produce the spec
   (align with **OpenSpec**: `openspec/specs/**`, `openspec/changes/**`).
2. **`to-tickets`** - `docs/ai/skills/to-tickets/SKILL.md` - break the spec
   into tracer-bullet tickets with blocking edges.
3. Use **`implement`**, **`code-review`**, **`domain-modeling`**, and
   **`improve-codebase-architecture`** as the work moves from tickets to code.

See **`references/upstream.md`**.
