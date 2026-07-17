# Statement Studio

Statement Studio is the planned replacement for PDF Studio: a fully usable staff-facing Mission Control product for building, assigning, rendering, and managing tenant-safe PDFs and statements.

It must not be built on Unlayer, and it must not be an email editor pretending to make PDFs. New work uses the custom Statement Studio product model and an Asym-owned template schema.

**Phase 0 decision:** Use the current server-side DocRaptor adapter as the
first-slice provider candidate behind a provider-neutral port. Production use
still requires provider qualification and HITL approval. The repo has no pdfx or
React PDF runtime path, so adding either now would create a second greenfield
stack. See `phase-0-audit-brief.md` for the qualification and migration gates.

## Triggers

Use this documentation when planning or implementing:

- Statement Studio / PDF Studio rebuild work.
- PDF template editing, publishing, defaults, assignments, variables, or rendering.
- Donor receipts, annual giving statements, missionary statements, event badges, finance reports, care packets, legal packets, or other platform PDF jobs.
- Supabase schema, RLS, Storage, artifact, or retention work for generated PDFs.

## Workflow Steps

1. Read this `README.md`.
2. Read the completed `phase-0-audit-brief.md`, its evidence appendix, and the
   `add-statement-studio` OpenSpec change before implementation.
3. Load `docs/ai/skills/supabase/SKILL.md`, `docs/ai/rules/backend.md`, and `supabase/AGENTS.md` before any Supabase/database work.
4. Load `docs/ai/skills/supabase-postgres-best-practices/SKILL.md` for schema, RLS, indexes, query, or migration work.
5. Load `docs/ai/rules/frontend.md` before UI work.
6. Keep UI on shared `@asym/ui` components and Maia/Zinc design tokens.
7. Start with the safe sample-data/admin tracer defined by Phase 0. Keep
   `donor.statement.annual_giving` as the first donor-facing production job only
   after its canonical statement snapshot/version and finance/legal gates are
   complete.

## Documentation Map

- `phase-0-audit-brief.md` - completed research, Phase 0 decisions, and
  implementation gates.
- `phase-0-research-evidence.md` - primary-source runtime, schema, migration,
  Storage, and test evidence behind the audit.
- `openspec/changes/add-statement-studio/` - proposed durable product and
  boundary contract.
- `handoff.md` - current PR, issue, skill, and next-agent handoff context.
- `prd.md` - issue-source PRD covering scope, phases, UX, Supabase posture, variables, starter jobs, integrations, and testing.
- `issues.md` - published vertical-slice map (#310 parent, #312–#364) with archival draft bodies.
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
- The first production renderer candidate is the server-only DocRaptor adapter
  behind a provider port. Enable it only after provider qualification and HITL
  approval; do not run a second official renderer without an explicit migration
  change.
- Production renders resolve variables server-side from tenant-scoped DTOs.
- Generated PDFs are exposed through tenant-aware artifact access, not direct cross-dashboard table reads.
- Tenant admins control how templates, defaults, variables, retention, and capabilities are used inside platform safety floors.
- **Phase 7 reconciliation (facts vs. artifact seam):** Phase 7 (Receipt & Statement Compliance Rules + Donor Identity/Credit Model) owns the receipt/statement facts record — receipt versioning and immutable numbering, and the statement eligibility/inclusion snapshot. Statement Studio (the legacy PDF Studio surface) consumes those facts as render input and owns only the render artifact, its generated-artifact metadata, and retention.

## Checklist

Final gate before implementation:

- [x] Phase 0 audit brief and evidence exist.
- [ ] UX/IA uses shared design tokens and components.
- [ ] Supabase/backend rules were loaded for database work.
- [ ] RLS, grants, Storage, indexes, and tenant boundaries are explicit.
- [ ] Variable source maps are documented.
- [ ] Starter catalog and first vertical slice are clear.
- [ ] Cross-app integration map is updated.
- [ ] Legacy Unlayer removal path is clear.
- [ ] Tests and fixtures are scoped but sufficient.
