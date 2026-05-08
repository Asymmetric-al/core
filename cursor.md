# Cursor (this repo)

- **Primary instructions:** root `AGENTS.md` (repo-wide routing, Nia, skills, monorepo commands).
- **Animation routing:** For animation work, transitions, micro-interactions, or motion polish, load `docs/ai/skills/emil-design-engineering/SKILL.md` first; pair `docs/ai/skills/motion/SKILL.md` only when Motion API details matter.
- **TanStack routing:** For any TanStack work, use the official TanStack CLI (`npm install -g @tanstack/cli`; then `tanstack ...`) and official TanStack Intent skills only. Run `npx @tanstack/intent@latest list`, then load returned skills with `npx @tanstack/intent@latest load <package>#<skill>`; do not use repo-local or unofficial TanStack skills. Current official skills in this repo: `@tanstack/db` (`db-core`, `collection-setup`, `custom-adapter`, `live-queries`, `mutations-optimistic`, `persistence`, `meta-framework`), `@tanstack/react-db` (`react-db`), `@tanstack/devtools-event-client` (`devtools-bidirectional`, `devtools-event-client`, `devtools-instrumentation`), and `@tanstack/cli` (`add-addons-existing-app`, `choose-ecosystem-integrations`, `create-app-scaffold`, `maintain-custom-addons-dev-watch`, `query-docs-library-metadata`).
- **Cursor project rules:** `.cursor/rules/` (scoped behavior; optional `*.mdc` with frontmatter).
- **MCP (Cursor):** `.cursor/mcp.json` mirrors root `.mcp.json` for the same server definitions.
