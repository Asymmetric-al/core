# Statement Studio

> **Current authority (Phases 18–19, 2026-07-24).** The documents in this folder are
> retained as pre-Phase-18 research and design evidence; they are not
> dispatchable target architecture. Use the Phase 18 PRD, authority manifest,
> renderer qualification protocol, ADRs 0033-0039, and OpenSpec change for the
> Generated Document service. For year-end bulk operations, use the
> [Phase 19 PRD](../../../prds/sitestacker-parity/phase-19-year-end-statement-operations.md),
> its authority map, ADRs, and OpenSpec change. Phase 7
> owns eligibility, facts, source issuance, and correction effect; Phase 18 owns
> document definition, publication, requests, exact artifacts, current-head
> access, and records; Phase 19 consumes Phase 7 eligibility and owns frozen
> statement population, participation, runs, recipient-operation coordination,
> physical fulfillment, controls, completion, and run evidence; Phase 17 owns
> message and delivery. Both phases are planning-only and
> groomed-not-dispatched. Phase 18 D17 requires a clean pre-production cutover, and
> D13 forbids raw provider or signed object URLs as access authority.

Statement Studio is the planned replacement for PDF Studio: a fully usable staff-facing Mission Control product for building, assigning, rendering, and managing tenant-safe PDFs and statements.

It must not be built on Unlayer, and it must not be an email editor pretending to make PDFs. New work uses the custom Statement Studio product model and an Asym-owned template schema.

**Current renderer decision:** no renderer is selected. Phase 18 D3 runs one
bounded, pre-registered, production-shaped evidence contest and permits at most
one exact production winner. DocRaptor, Chromium-class HTML-to-PDF, React PDF,
and Typst-class candidates have no production authority unless they win that
protocol. D17 then enables only the winner in the clean canonical runtime.

## Triggers

Use this documentation when planning or implementing:

- Statement Studio / PDF Studio rebuild work.
- PDF template editing, publishing, defaults, assignments, variables, or rendering.
- Donor receipts, annual giving statements, missionary statements, event badges, finance reports, care packets, legal packets, or other platform PDF jobs.
- Supabase schema, RLS, Storage, artifact, or retention work for generated PDFs.

## Workflow Steps

1. Read this `README.md`.
2. Read the Phase 18 PRD, authority manifest, renderer qualification protocol,
   ADRs 0033-0039, and Phase 18 OpenSpec change before Generated Document work.
   For year-end runs, also read the Phase 19 PRD, its authority map, ADRs, and
   OpenSpec change. Use the Phase 0 brief and evidence
   appendix only for historical repo observations.
3. Load `docs/ai/skills/supabase/SKILL.md`, `docs/ai/rules/backend.md`, and `supabase/AGENTS.md` before any Supabase/database work.
4. Load `docs/ai/skills/supabase-postgres-best-practices/SKILL.md` for schema, RLS, indexes, query, or migration work.
5. Load `docs/ai/rules/frontend.md` before UI work.
6. Keep UI on shared `@asym/ui` components and Maia/Zinc design tokens.
7. Follow the Phase 18 tracer dependency graph. Preview and proof use synthetic
   fixtures only; production generation starts only after the applicable source
   Facts Package, publication graph, access contract, and renderer qualification
   are complete.

## Documentation Map

- `phase-0-audit-brief.md` - superseded Phase 0 decisions plus preserved repo
  evidence; not implementation authority.
- `phase-0-research-evidence.md` - primary-source runtime, schema, migration,
  Storage, and test evidence behind the audit.
- `openspec/changes/add-statement-studio/` - superseded proposal retained for
  evidence; Phase 18 OpenSpec is controlling.
- `handoff.md` - historical Phase 0 handoff context.
- `prd.md` - superseded Statement Studio PRD retained for design evidence.
- `issues.md` - blocked pre-Phase-18 vertical-slice map (#310 parent,
  #312-#364); amend or close/reissue before dispatch.
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
- Phase 18 replaces the prototype `/pdf`, receipt-render, and `pdf_*` runtime
  directly after the D17 environment proof. There is no import, backfill,
  compatibility path, dual writer/reader, or legacy fallback.
- Persisted templates use an Asym-owned JSON template schema, not JSX, raw pdfx registry JSON, HTML, or direct React props.
- Exactly one renderer may win D3; none is assumed before the evidence contest.
  Production code remains behind the canonical renderer port, and a loser never
  remains as an official fallback.
- Production renders resolve variables server-side from tenant-scoped DTOs.
- Generated PDFs are exposed through the authenticated Asym current-artifact
  route. Raw provider, bucket, or signed object URLs never become access
  authority.
- Tenant admins control how templates, defaults, variables, retention, and capabilities are used inside platform safety floors.
- **Canonical owner split:** Phase 7 owns receipt/statement eligibility, legal
  donor, facts, coverage, source issuance, and correction effect; Phase 13 owns
  posted money; Phase 14 owns recognition. Phase 18 owns document definition,
  publication, request, exact artifact, public reference/version, current head,
  access, and document records. Phase 19 consumes those authorities and owns the
  immutable Run Preflight, bounded participation, purpose-pinned Statement Run
  and Run Items, release/control fences, recipient-operation coordination,
  physical fulfillment, operational completion, and Run Evidence Record. Phase
  17/6 own message preparation, transport, and delivery evidence.

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
