# Cursor repo policy

Repo-owned Cursor paths:

- `.cursor/mcp.json` — committed MCP server definitions, kept in sync with root `.mcp.json`
- `.cursor/rules/` — scoped Cursor project rules
- `.cursor/commands/` — shared Cursor command docs
- `.cursor/skills/` — generated mirror of canonical skills plus approved shared runtime skill packs

Local-only Cursor state:

- `.cursor/settings.json`
- auth/session files
- cache, log, local storage, and MCP runtime state

Canonical skills live under `docs/ai/skills/`. Edit canonical skill files there, then run `bun run skills:sync` and `bun run skills:verify` to refresh `.agents/skills/` and `.cursor/skills/`.
