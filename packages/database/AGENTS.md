# Database package (`@asym/database`)

**Scope:** Generated types, TanStack DB collections, and browser-facing table hooks. Do not copy root `AGENTS.md`.

- Browser-visible Supabase table data: `@asym/database/hooks` (collections under `packages/database/collections/*`) is the default app-facing layer.
- Do not add feature-local Supabase table reads in apps when a collection exists.
- Schema and RLS changes belong in `supabase/migrations` with `supabase/AGENTS.md` — not ad-hoc SQL in this package.
- Generated database types must stay aligned with migrations. Do not hand-edit generated output as the source of truth.
- TanStack DB + Supabase integration guidance: `docs/guides/development/tanstack-integration.md`. Inspect installed versions before coding, and do not add a TanStack package the workspace does not already use without an explicit request.

## Triggers

- Editing files under `packages/database/**`

## Workflow

1. Read this file and `docs/guides/architecture/data-access-boundary.md`.
2. Follow TDD for generated-type and hook changes.

## Checklist

- [ ] Generated types remain owned here
- [ ] Browser table data still uses `@asym/database/hooks`
