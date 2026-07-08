# Phase 0 Audit Brief

Phase 0 is required before implementation. It should be deep research with a brief, AI-oriented output that lets future agents build without rereading the whole repo blindly.

## Triggers

Run Phase 0 before:

- Creating Statement Studio schema, routes, UI, or render code.
- Removing legacy PDF Studio or Unlayer code.
- Wiring production PDF jobs into Donor Dashboard, Missionary Dashboard, Mission Control, events, finance, care, legal, or CMS surfaces.

## Workflow Steps

1. Read `README.md`, `product-plan.md`, `data-model.md`, `variables.md`, `ux-ia.md`, `integration-map.md`, and `legacy-pdf-studio-removal.md`.
2. Search existing PDF Studio, donor statement, receipt, artifact, render, Storage, and route code.
3. Inspect current docs, migrations, tests, and feature flags.
4. Inspect data owners and resolver candidates across donor, giving, missionary, CRM, CMS, events, reports, care, tasks, legal/signing, and finance.
5. Confirm current Supabase and Next.js guidance before proposing implementation.
6. Produce the concise implementation map described below.

## Required Evidence Targets

- `docs/guides/features/pdf-studio.md`
- `docs/guides/features/email-studio.md`
- `docs/guides/architecture/data-access-boundary.md`
- `docs/ai/rules/frontend.md`
- `docs/ai/rules/backend.md`
- `docs/ai/skills/supabase/SKILL.md`
- `docs/ai/skills/supabase-postgres-best-practices/SKILL.md`
- `supabase/AGENTS.md`
- `apps/admin/app/pdf/**`
- `apps/donor/app/api/donor/statements/[year]/route.ts`
- `packages/api/src/donor-portal/{receipts,statements,service,model}.ts`
- `packages/api/src/pdf-templates/**`
- `packages/config/{pdf-studio,pdf-studio-native}.ts`
- `supabase/migrations/*pdf*`
- `packages/api/src/admin/**`
- `apps/admin/src/cms/**`
- `apps/admin/app/events/**`
- `packages/api/src/missionary-portal/**`

## Output Shape

Write a short brief with:

- Current file map and ownership boundaries.
- Existing routes, adapters, migrations, feature flags, tests, and docs.
- What to reuse, replace, retire, or delete.
- Tenant/RLS/Storage risks.
- Variable source-map candidates.
- Starter templates and standard jobs already supported by data.
- Cross-app PDF opportunities and gaps.
- Recommended first vertical slice.
- Open questions that block implementation.

## Checklist

- [ ] Current behavior is grounded in exact file paths.
- [ ] Supabase skill and backend rules were loaded for data findings.
- [ ] Frontend rulebook was loaded for UX findings.
- [ ] Existing Unlayer dependencies are classified as remove, migrate, or ignore.
- [ ] First slice proves template versioning, variables, assignment, render, artifact, Storage, and dashboard download.
- [ ] Findings are brief enough for an implementation agent to act on.
