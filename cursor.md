# Cursor (this repo)

- **Primary instructions:** root `AGENTS.md` (repo-wide routing, skills, monorepo commands). Preserve exact `base-maia`. Nia is optional.

- **Animation routing:** Follow the exact routes in root `AGENTS.md`: load `emil-design-engineering` first and `anim` for Core's operative contract; use `emil-design-eng`, `animation-vocabulary`, `apple-design`, `improve-animations`, or explicit-only `review-animations` only for their narrow triggers; pair `motion` only when `motion/react` API details matter.
- **TanStack routing:** Follow the root `AGENTS.md` TanStack CLI and Intent section. In short: use the official TanStack CLI, run `npx --yes @tanstack/intent@latest list`, load Intent skills only for packages returned by that current command, and use `tanstack doc` / `tanstack search-docs` plus repo TanStack guides for packages not returned by Intent. Do not use repo-local or unofficial TanStack skills.
- **Inngest routing:** Official Inngest agent skills are routed from root `AGENTS.md`, mirrored to `.cursor/skills/`, and paired with the `inngest-dev` MCP server in `.cursor/mcp.json` when the Inngest dev server is running.
- **ReUI routing:** ReUI agent skills are routed from root `AGENTS.md`, mirrored to `.cursor/skills/`, and paired with the `reui` MCP server in `.cursor/mcp.json` for registry search, planning, inline APIs, and validation.
- **Cursor project rules:** `.cursor/rules/` (scoped behavior; optional `*.mdc` with frontmatter).
- **MCP (Cursor):** `.cursor/mcp.json` mirrors root `.mcp.json` for the same server definitions.
