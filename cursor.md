# Cursor (this repo)

- **Primary instructions:** root `AGENTS.md` (repo-wide routing, Nia, skills, monorepo commands).
- **Animation routing:** For animation work, transitions, micro-interactions, or motion polish, load `docs/ai/skills/emil-design-engineering/SKILL.md` first; pair `docs/ai/skills/motion/SKILL.md` only when Motion API details matter.
- **TanStack routing:** Follow the root `AGENTS.md` TanStack CLI and Intent section. In short: use the official TanStack CLI, run `npx --yes @tanstack/intent@latest list`, load Intent skills only for packages returned by that current command, and use `tanstack doc` / `tanstack search-docs` plus repo TanStack guides for packages not returned by Intent. Do not use repo-local or unofficial TanStack skills.
- **Cursor project rules:** `.cursor/rules/` (scoped behavior; optional `*.mdc` with frontmatter).
- **MCP (Cursor):** `.cursor/mcp.json` mirrors root `.mcp.json` for the same server definitions.
