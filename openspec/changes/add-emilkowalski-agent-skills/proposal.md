# Add Emil Kowalski Agent Skills

## Why

Core already routes an older Emil Kowalski design-engineering skill, but the
current `emilkowalski/skills` pack contains four additional skills and a newer
`emil-design-eng`. Installing the pack only into `.agents/skills/` bypasses the
repo's canonical source and can leave Cursor and Claude Code with stale or
different content.

## What Changes

- Vendor all five current `emilkowalski/skills` skill trees under
  `docs/ai/skills/` with source paths, reviewed commit SHA, MIT notice, and
  refresh instructions.
- Preserve Core's frontend, Base UI, motion-token, and reduced-motion rules as
  higher-priority overlays.
- Route each skill narrowly from `AGENTS.md` and keep `cursor.md` aligned.
- Refresh `.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` through
  the repo sync workflow.
- Track canonical file ownership in the sync manifest so deleted upstream files
  cannot survive while legitimate runtime-only assets remain intact.
- Add focused tests for pack inventory, frontmatter, lock provenance, mirror
  parity, and stale-file pruning.

## What Does Not Change

- `CLAUDE.md` remains exactly `@AGENTS.md`.
- The separate animations.dev `emil-design-engineering` skill remains the
  primary broad design-engineering reference.
- Core's `anim` skill remains the operative motion-token and implementation
  contract; `motion` remains the `motion/react` API companion.
- No application code, runtime dependency, database behavior, or product
  feature changes.

## Expected Outcome

Codex, Cursor, and Claude Code discover the same complete Emil Kowalski pack,
apply it under the same repo precedence, and cannot retain stale companion
files after future upstream refreshes.
