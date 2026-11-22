<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Factory operator Console (`@asym/factory-console`)

**Scope:** The private operator Console for the Core factory in `apps/factory-console`. It is not a product app. Do not copy root `AGENTS.md`.

- It runs only on the factory VM, bound to loopback behind HTTP Basic and the owner's SSH tunnel. It is never deployed to Vercel and is not part of `bun run build`; build it with `bun run build:factory-console`.
- It is a read model and control surface over one backend: the Archon engine's HTTP API, its state documents, and the pack's `control.mjs`. Keep it that way: no second backend, database, queue, scheduler or browser-held factory state.
- Every operator effect is one `control.mjs` invocation with a request id. Do not write factory state any other way, and never map Stop, Hold or Retry to an abandon.
- All configuration is server-only. Do not add `NEXT_PUBLIC_*` variables, and never send credentials, private paths, review findings or profile digests to the browser.
- **UI/UX:** consume `@asym/ui`. Follow `packages/ui/AGENTS.md`. Do not define a local visual system, app-local shadcn primitives, or another style/preset/base.
- Read `apps/factory-console/README.md` (backend contract and journeys) and `docs/ops/archon-vm100-factory-runbook.md` before changing a control or a read.

## Triggers

- Editing files under `apps/factory-console/**`
- Editing `tests/unit/apps/factory-console/**`

## Workflow

1. Read this file, the Console README and `packages/ui/AGENTS.md` for any UI work.
2. For a control or state change, read the matching pack code under `scripts/archon-factory/pack/.shared/` first; the pack is the owner of every rule the Console shows.
3. Follow TDD for substantive behavior (`docs/ai/skills/tdd/SKILL.md`). Unit tests live in `apps/factory-console/tests`.

## Checklist

- [ ] No new store, backend or `NEXT_PUBLIC_*` variable
- [ ] Controls go through `control.mjs` with a request id
- [ ] Nothing private reaches the browser
- [ ] `bun run typecheck:factory-console` and the Console unit tests pass
