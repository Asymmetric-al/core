# Statement Studio

Statement Studio is the planned rebuild of PDF Studio as a fully usable staff-facing Mission Control product for building, assigning, rendering, and managing tenant-safe PDFs and statements.

It must not be built on Unlayer, and it must not be an email editor pretending to make PDFs. New work should use the custom Statement Studio product model, with pdfx and React PDF used as deeply as makes sense.

## Triggers

Use this documentation when planning or implementing:

- Statement Studio / PDF Studio rebuild work.
- PDF template editing, publishing, defaults, assignments, variables, or rendering.
- Donor receipts, annual giving statements, missionary statements, event badges, finance reports, care packets, legal packets, or other platform PDF jobs.
- Supabase schema, RLS, Storage, artifact, or retention work for generated PDFs.

## Workflow Steps

1. Read this `README.md`.
2. Read `phase-0-audit-brief.md` before implementation.
3. Load `docs/ai/skills/supabase/SKILL.md`, `docs/ai/rules/backend.md`, and `supabase/AGENTS.md` before any Supabase/database work.
4. Load `docs/ai/skills/supabase-postgres-best-practices/SKILL.md` for schema, RLS, indexes, query, or migration work.
5. Load `docs/ai/rules/frontend.md` before UI work.
6. Keep UI on shared `@asym/ui` components and Maia/Zinc design tokens.
7. Implement in vertical slices, starting with `donor.statement.annual_giving` unless Phase 0 finds a stronger first slice.

## Documentation Map

- `phase-0-audit-brief.md` - required implementation audit output.
- `prd.md` - issue-source PRD covering scope, phases, UX, Supabase posture, variables, starter jobs, integrations, and testing.
- `issues.md` - draft vertical-slice issue backlog derived from the PRD; publish only after approval.
- `product-plan.md` - product north star, phases, capabilities, and scope.
- `data-model.md` - database, RLS, Storage, grants, artifacts, and defaults.
- `variables.md` - variable registry, source maps, custom variables, validation, and governance.
- `starter-template-catalog.md` - starter jobs and templates.
- `ux-ia.md` - app structure and user workflows.
- `integration-map.md` - cross-app PDF producing and consuming surfaces.
- `rendering-artifacts-retention.md` - render pipeline, downloads, retention, purge, and audit.
- `legacy-pdf-studio-removal.md` - Unlayer/PDF Studio legacy boundary.
- `testing-fixtures.md` - fixtures and risk-based verification.

## Approved Direction

- User-facing product name: Statement Studio.
- Existing `/pdf` routes and `pdf_*` internals can migrate pragmatically, but users should not see two competing product names.
- Persisted templates use an Asym-owned JSON template schema, not JSX, raw pdfx registry JSON, HTML, or direct React props.
- Production renders resolve variables server-side from tenant-scoped DTOs.
- Generated PDFs are exposed through tenant-aware artifact access, not direct cross-dashboard table reads.
- Tenant admins control how templates, defaults, variables, retention, and capabilities are used inside platform safety floors.

## Checklist

Final gate before implementation:

- [ ] Phase 0 audit brief exists.
- [ ] UX/IA uses shared design tokens and components.
- [ ] Supabase/backend rules were loaded for database work.
- [ ] RLS, grants, Storage, indexes, and tenant boundaries are explicit.
- [ ] Variable source maps are documented.
- [ ] Starter catalog and first vertical slice are clear.
- [ ] Cross-app integration map is updated.
- [ ] Legacy Unlayer removal path is clear.
- [ ] Tests and fixtures are scoped but sufficient.
