# Proposal: Add official Inngest agent tooling

## Why

The repo currently has an unofficial mirror-only Inngest skill and no canonical
route for official Inngest AI dev tools. Inngest is also listed as planned or
referenced in the stack registry, not as an app runtime dependency. Agents need
official guidance for integration work without implying that the product has
adopted Inngest.

## What Changes

- Vendor the official Inngest agent skills into `docs/ai/skills/` and refresh
  the `.agents/skills/` and `.cursor/skills/` mirrors through the repo sync
  workflow.
- Replace the stale mirror-only `inngest` skill with a canonical router skill.
- Add Inngest routing guidance to `AGENTS.md` and the agent playbook for Codex,
  Claude Code, and Cursor.
- Add the Inngest dev-server MCP endpoint to the repo MCP configs with a note
  that the URL must match the active dev-server port.
- Document upstream sources, commit SHAs, licenses, and refresh steps.

## What Does Not Change

- No product app code, runtime packages, database migrations, or Inngest
  environment variables are added.
- No full Codex plugin bundle, eval fixtures, examples, or assets are vendored.
- `CLAUDE.md` stays as `@AGENTS.md`.
- Inngest remains planned or referenced for product code until a separate
  product integration change is proposed.

## Expected Outcome

Agents can load official Inngest guidance from canonical repo skills, Codex can
use the mirrored `.agents/skills/` copies or the documented upstream plugin
install path, Claude Code can route through `AGENTS.md` or install the official
plugin, and Cursor can use generated `.cursor/skills/` plus the mirrored MCP
definition.
