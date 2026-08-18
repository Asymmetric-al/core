<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Admin app (`@asym/admin`)

**Scope:** Admin / Mission Control UI in `apps/admin`. Do not copy root `AGENTS.md`.

- Default port **3030**. Start: `bun run dev:admin`. Cloud Mission Control: `bun run setup:mission-control:cloud` then `bun run dev:mission-control` (see `docs/guides/development/cursor-cloud.md`).
- Instant Navigation is on (`cacheComponents` + `partialPrefetching`). Follow the compact Instant Navigation section in root `AGENTS.md`. Stream request-time data; do not set `instant = false` without a comment.
- Read nearest `node_modules/next/dist/docs/` before Next.js API work. Use Next.js MCP against a running dev server for live errors and routes.
- **UI/UX:** consume `@asym/ui`. Follow `packages/ui/AGENTS.md`. Do not define a local visual system, app-local shadcn primitives, or another style/preset/base.
- Data: thin `app/api` re-exports only. Business DB logic lives in `packages/api`. Browser table data uses `@asym/database/hooks` when a collection exists (`docs/guides/architecture/data-access-boundary.md`).

## Triggers

- Editing files under `apps/admin/**`

## Workflow

1. Read this file and `packages/ui/AGENTS.md` for any UI work.
2. Confirm Instant Navigation: Stream, Cache, or explicit Block.
3. Follow TDD for substantive behavior (`docs/ai/skills/tdd/SKILL.md`).
4. Run `bunx turbo run lint typecheck --filter=@asym/admin`.

## Checklist

- [ ] Port 3030 and admin-only scope respected
- [ ] UI still uses exact `base-maia` via `packages/ui`
- [ ] Data access stays on `packages/api` / `@asym/database/hooks`
