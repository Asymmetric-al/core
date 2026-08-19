# Cursor (this repo)

- **Primary instructions:** root `AGENTS.md` (repo-wide routing, skills, monorepo commands). Preserve exact `base-maia`. Nia is optional.

- **Skill routing:** Use `docs/ai/rules/agent-skill-routing.md` when discovery is ambiguous. In particular, animation work starts with `emil-design-engineering` plus `anim`; the remaining motion skills keep their narrow documented triggers.
- **TanStack routing:** Follow `docs/guides/development/tanstack-integration.md`: use the official TanStack CLI, load Intent skills only for packages returned by the current list command, and use official docs for remaining packages.
- **Inngest routing:** Official Inngest skills are documented in `docs/ai/rules/agent-skill-routing.md`, mirrored to `.cursor/skills/`, and paired with the `inngest-dev` MCP server in `.cursor/mcp.json` when the dev server is running.
- **ReUI routing:** ReUI guidance is documented in `docs/ai/skills/reui/SKILL.md`, mirrored to `.cursor/skills/`, and paired with the `reui` MCP server in `.cursor/mcp.json`.
- **Cursor project rules:** `.cursor/rules/` (scoped behavior; optional `*.mdc` with frontmatter).
- **MCP (Cursor):** `.cursor/mcp.json` mirrors root `.mcp.json` for the same server definitions.
