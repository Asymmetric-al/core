# Design: Emil Kowalski Skill-Pack Integration

## Context

The Skills CLI installs ecosystem skills into `.agents/skills/`, while Core
authors durable skill guidance in `docs/ai/skills/` and generates three runtime
mirrors. The live upstream pack at
`7bb7061b5cf7de15ea1aeaf00fbd9e6592a20fce` contains five skills and eight
upstream files. Two skills require companion Markdown files.

## Decisions

### Canonicalize the complete trees

Each upstream directory is promoted into the matching
`docs/ai/skills/<name>/` directory. `emil-design-eng` updates the existing
canonical skill; it does not create a second alias. Provenance and the MIT
notice live beside each canonical copy so every generated runtime mirror keeps
the attribution.

### Preserve Core precedence in both routing and skill overlays

For implementation work, `docs/ai/rules/frontend.md`,
`emil-design-engineering`, and `anim` remain authoritative for Base UI, shared
tokens, global reduced-motion behavior, and route transitions. Specialized
pack skills add vocabulary, Apple-style physical interaction guidance, audit
planning, or strict review without overriding those contracts.

`review-animations` remains explicit-only. `improve-animations` remains
read-only on source code and may write only its approved plan artifacts until
an explicit execute request authorizes implementation.

### Track canonical file ownership

The sync manifest records the relative files owned by every canonical skill.
Sync prunes files that were previously canonical but were deleted or renamed,
then overlays the current canonical tree. Directory-name and relative-path
validation remain in place. This propagates canonical deletions without
discarding legitimate runtime-only assets from the `.agents` source; the
Cursor and Claude Code skill directories remain exact generated mirrors.

### Keep installation and canonical refresh separate

`npx --yes skills@latest add emilkowalski/skills -y` refreshes the Skills CLI
source and lock metadata. A focused repo refresh command promotes the installed
trees while preserving marked Core overlays and provenance, followed by
`skills:sync` and `skills:verify`.

## Verification

- Assert the five expected lock entries and source paths.
- Assert valid frontmatter and local companion-file references.
- Assert recursive content equality across canonical, Codex, Cursor, and
  Claude Code copies.
- Assert sync removes stale files from existing skill directories.
- Assert `CLAUDE.md` remains the single-line `@AGENTS.md` import.
