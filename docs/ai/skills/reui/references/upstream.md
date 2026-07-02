---
source: https://reui.io/docs/agent-skills
install_commands:
  - bunx --bun shadcn@latest add @reui/skills-claude
  - bunx --bun shadcn@latest add @reui/skills-codex
  - bunx --bun shadcn@latest add @reui/skills-cursor
last_refreshed: 2026-07-01
---

# ReUI agent skills upstream

Canonical copy in this repo: `docs/ai/skills/reui/` (mirrored to `.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` via `bun run skills:sync`).

ReUI publishes agent-specific shadcn registry packages for Claude Code, Codex, and Cursor. This repo uses the shared canonical-skill pattern instead of committing each tool's installer output as the source of truth.

## Refresh workflow

1. Run the current ReUI install commands in a clean working tree or scratch branch:
   - `bunx --bun shadcn@latest add @reui/skills-claude`
   - `bunx --bun shadcn@latest add @reui/skills-codex`
   - `bunx --bun shadcn@latest add @reui/skills-cursor`
2. Compare the generated `reui/` skill payloads. They should be equivalent except for destination paths.
3. Copy the selected `reui/` payload into `docs/ai/skills/reui/` and preserve this `references/upstream.md` file plus the **`## This repository (Asymmetric-al/core)`** overlay at the top of `SKILL.md` (registry defaults, `base-maia`, `DataTableResponsive`, `/rui` disambiguation).
4. Run `bun run skills:sync` and `bun run skills:verify`.
5. Commit canonical and generated mirror updates together.
