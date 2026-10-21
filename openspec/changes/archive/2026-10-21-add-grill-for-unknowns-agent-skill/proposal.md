# Add Grill for Unknowns Agent Skill

## Why

Core already has lightweight Matt Pocock grilling and domain-modeling flows,
but `nicobailon/grill-for-unknowns` adds a deeper map-vs-territory workflow for
blindspot discovery, unknown-known prototypes, and long-running agent launch
packets. A raw Skills CLI install would leave `.agents/skills/` authoritative,
omit Cursor/Claude parity, and allow its broad description to interrupt normal
implementation work unexpectedly.

## What Changes

- Vendor the complete `grill-for-unknowns` plugin tree under
  `docs/ai/skills/grill-for-unknowns/` with pinned source, license, lineage, and
  refresh metadata.
- Add a marked Core overlay and explicit-only discovery metadata so the skill
  owns deep unknown-discovery sessions without replacing ordinary grilling or
  execution workflows.
- Route its relationship to `grilling`, `grill-with-docs`, `grill-me`,
  `domain-modeling`, and `wayfinder` from `AGENTS.md` and `ask-matt`.
- Add a focused upstream refresh command and mirror the complete canonical tree
  into Codex, Cursor, and Claude Code.
- Add regression coverage for inventory, provenance, routing, discovery
  metadata, and recursive mirror parity.

## What Does Not Change

- `CLAUDE.md` remains exactly `@AGENTS.md`.
- Existing Matt Pocock skills keep their current lightweight roles.
- The bundled generic templates do not override OpenSpec, Core rulebooks,
  canonical domain-modeling formats, or user-authorized mutation scope.
- No application code, runtime dependency, database behavior, or product
  feature changes.

## Expected Outcome

All three agent clients discover the same self-contained skill and apply it
only for explicit or narrowly defined unknown-discovery work, with Core's
current source-of-truth and execution rules preserved.
