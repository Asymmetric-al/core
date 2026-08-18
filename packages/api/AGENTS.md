# API package (`@asym/api`)

**Scope:** Canonical business database logic, vendor integrations, and thin-route contracts. Do not copy root `AGENTS.md`.

- `packages/api/src/*` is the single canonical layer for business database logic.
- App Router handlers in `apps/*/app/api/` must remain thin re-exports. They must not import `@asym/database/supabase/*`, `@supabase/ssr`, or `@supabase/supabase-js` directly.
- Follow `docs/guides/architecture/data-access-boundary.md` and `docs/ai/rules/backend.md`.
- Load `docs/ai/skills/supabase/SKILL.md` for Supabase work. Use Core’s existing migration and RLS conventions; do not invent a second schema workflow.
- Authenticate Server Actions and route handlers inside the handler. Do not rely only on layout guards.
- This task surface must not change payment, email, or auth product behavior unless that is the explicit request.
- Asym Postgres owns all CRM truth. Twenty CRM is retired; do not restore Twenty clients, credentials, routes, webhooks, synchronization, projections, or provider-backed CRM reads.
- Eve sandbox must not read this repository’s coding-agent instruction library as product-runtime skills (`packages/eve-runtime/AGENTS.md`).

## Triggers

- Editing files under `packages/api/**`

## Workflow

1. Read this file and `docs/guides/architecture/data-access-boundary.md`.
2. Follow TDD for substantive behavior (`docs/ai/skills/tdd/SKILL.md`).
3. Keep RLS and tenant isolation intact.

## Checklist

- [ ] Canonical DB access remains in `packages/api/src/*`
- [ ] Stripe/donate/idempotency paths stay here
- [ ] Eve runtime does not receive the coding-agent skill library
