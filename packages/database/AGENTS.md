# Database package (`@asym/database`)

**Scope:** Generated types, TanStack DB collections, and browser-facing table hooks. Do not copy root `AGENTS.md`.

- Browser-visible Supabase table data: `@asym/database/hooks` (collections under `packages/database/collections/*`) is the default app-facing layer.
- Do not add feature-local Supabase table reads in apps when a collection exists.
- Schema and RLS changes belong in `supabase/migrations` with `supabase/AGENTS.md` — not ad-hoc SQL in this package.
- Generated database types must stay aligned with migrations. Do not hand-edit generated output as the source of truth.
- TanStack DB + Supabase integration guidance: `docs/guides/development/tanstack-integration.md`. Inspect installed versions before coding. Do not install absent TanStack packages (Charts, Hotkeys, Pacer) because a prompt listed them.

## Triggers

- Editing files under `packages/database/**`

## Workflow

1. Read this file and `docs/guides/architecture/data-access-boundary.md`.
2. Follow TDD for generated-type and hook changes.
3. Do not install absent TanStack packages.

## Checklist

- [ ] Generated types remain owned here
- [ ] Browser table data still uses `@asym/database/hooks`
- [ ] Charts, Hotkeys, and Pacer remain uninstalled
