<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Missionary app (`@asym/missionary-app`)

**Scope:** Missionary-facing UI in `apps/missionary`. Do not copy root `AGENTS.md`.

- **Purpose:** The missionary workspace is the support-raising and communication home for missionaries, who are users inside a sending organization's tenant. It shows role-appropriate views of shared donor, gift and communication records and is not a parallel CRM, ledger or communication authority; staff-style operational depth stays in Mission Control. Intent: `openspec/specs/platform-surfaces/spec.md`.

- Default port **4000**. Start: `bun run dev:missionary`.
- Instant Navigation is on (`cacheComponents` + `partialPrefetching`). Follow `docs/ai/rules/frontend.md` § Instant Navigation. Stream request-time data; do not set `instant = false` without a comment.
- **Tenant address:** signed-in pages live under `/<tenant>`; sign-in, the chooser and the API routes stay outside. Build links and redirects through the tenant helpers, never `next/link` or the router, pathname or redirect of `next/navigation`, and bind servers to `localhost`. Follow `docs/ai/rules/frontend.md` § The tenant in the page address.
- Read nearest `node_modules/next/dist/docs/` before Next.js API work. Use Next.js MCP against a running dev server for live errors and routes.
- **UI/UX:** consume `@asym/ui`. Follow `packages/ui/AGENTS.md`. Do not define a local visual system, app-local shadcn primitives, or another style/preset/base.
- Data: thin `app/api` re-exports only. Business DB logic lives in `packages/api`. Browser table data uses `@asym/database/hooks` when a collection exists (`docs/guides/architecture/data-access-boundary.md`).

## Triggers

- Editing files under `apps/missionary/**`

## Workflow

1. Read this file and `packages/ui/AGENTS.md` for any UI work.
2. Confirm Instant Navigation: Stream, Cache, or explicit Block.
3. Follow TDD for substantive behavior (`docs/ai/skills/tdd/SKILL.md`).
4. Run `bunx turbo run lint typecheck --filter=@asym/missionary-app`, the focused unit tests (`bunx vitest run tests/unit/apps/missionary/<area>`; most unit tests for this app live under the root `tests/unit/apps/missionary/`, with dashboard, analytics and chart tests in `tests/unit/missionary-*`), and `bun run verify:data-boundary` when routes or data access change. `bun run check` is the broader gate.
5. For route or UI changes, verify at runtime with the `next-dev-loop` skill. Reuse the dev server named in `apps/missionary/.next/dev/lock` (when `next dev` says another server is running, use its URL; don't delete the lock), check compilation with `get_compilation_issues` or `compile_route` and errors with `get_errors` through the Next.js MCP, then check the page with `agent-browser`. Don't run `next build` to check compilation while editing.

## Checklist

- [ ] Port 4000 and missionary-only scope respected
- [ ] UI still uses exact `base-maia` via `packages/ui`
- [ ] Data access stays on `packages/api` / `@asym/database/hooks`
