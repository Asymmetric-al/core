# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Layout

This repo uses **multi-context** domain docs. Read **`CONTEXT-MAP.md`** at the repo root first, then open the `CONTEXT.md` and ADR directories for each context that matches the task.

System-wide product intent may also live under `openspec/specs/` and `openspec/changes/` — use `AGENTS.md` source-of-truth order when those apply.

## Before exploring, read these

1. **`CONTEXT-MAP.md`** at the repo root — pick relevant context IDs.
2. For each relevant context:
   - Its **`CONTEXT.md`** (glossary and domain language)
   - Its **`docs/adr/`** — ADRs that touch the area you're about to work in
3. Optional repo-wide rulebooks under `docs/ai/rules/` and feature docs under `docs/features/` when the task spans more than one context.

If a mapped file is missing, treat that as a documentation integrity issue for
the current task instead of silently inventing context. The producer skill
(`/grill-with-docs`) can create a new context lazily, but any new context must be
registered in `CONTEXT-MAP.md` in the same change.

## File structure (this repo)

```
/
├── CONTEXT-MAP.md
├── docs/
│   ├── agents/          ← agent skill configuration (this file)
│   └── features/
│       └── mission-control/
│           └── contribution-detail/
│               ├── CONTEXT.md
│               └── docs/adr/
└── openspec/            ← product specs and active changes (when applicable)
```

Add new rows to `CONTEXT-MAP.md` when you introduce another feature-level glossary or ADR set.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in the relevant `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/grill-with-docs`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0033 (crm-inline-operations-shared-contracts) — but worth reopening because…_

Use the ADR filename or number from the context's `docs/adr/` directory.
