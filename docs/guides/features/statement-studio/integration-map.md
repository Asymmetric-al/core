# Integration Map

> **Superseded implementation authority (Phase 18, 2026-07-21).** This map is
> retained as historical integration evidence only. Do not dispatch it or use it
> as target architecture. The Phase 18 PRD, authority manifest, renderer
> qualification protocol, ADRs 0033-0039, and OpenSpec change are controlling.
> Ownership is split deliberately: Phase 7 owns eligibility, facts, source
> issuance, and correction effect; Phase 18 owns document definition,
> publication, requests, exact artifacts, current-head access, and records;
> Phase 19 owns statement population, runs, and items; Phase 17 owns message and
> delivery.

Statement Studio is not complete until every PDF-producing or PDF-consuming app surface has an explicit integration map.

## Triggers

Use this doc before marking Statement Studio implementation complete, and whenever adding a PDF job to any product surface.

## Workflow Steps

1. Inventory each surface that produces, assigns, renders, stores, downloads, emails, or previews PDFs.
2. For each surface, define the document jobs and template defaults.
3. Define resolver owner and variable contract.
4. Define artifact access and retention class.
5. Define route/API entry points and UI entry points.
6. Add tests and fixtures.

## Surfaces To Map

- Mission Control/admin.
- Donor Dashboard.
- Missionary Dashboard.
- Reports.
- Finance/bookkeeping.
- Contributions/receipts.
- Events/conferences.
- Mobilize/tasks.
- Member Care/support.
- Legal/signing.
- CMS/project/missionary pages where images/context are used.

## Required Fields Per Surface

| Field                 | Required Detail                                           |
| --------------------- | --------------------------------------------------------- |
| Surface               | App/module/dashboard name                                 |
| Document jobs         | Standard/custom job keys                                  |
| Default assignment    | Tenant-wide or scoped assignment behavior                 |
| Variable contract     | Approved variable catalog/context contract                |
| Resolver owner        | Domain package/function responsible for facts             |
| Route/API entry point | Server route/action/BFF path                              |
| Artifact access       | Who can view/download and through what boundary           |
| Retention class       | Legal, tax, finance, care/private, temporary, preview     |
| Readiness state       | `production_ready`, `template_ready`, or `requires_setup` |
| UX entry points       | Buttons, settings screens, download links, dashboards     |
| Tests/fixtures        | Normal, empty, large, edge, tenant-safety                 |

## Portal artifact access (Phase 0 prerequisite)

Donor and missionary downloads must flow through **portal BFF routes** with
recipient-scoped authorization—not direct `pdf_template_artifacts` reads.

**Current gap (audit in #312):** `pdf_template_artifacts` RLS today is staff
membership (`authz.has_staff_membership`). Artifacts lack first-class
`job_key`, `scope_kind`, and recipient/subject columns required for portal
row-level checks. **SS-05+ must not expose artifacts to authenticated portal
users until Phase 0 defines recipient predicates, columns or metadata contract,
and route-level checks.** See `data-model.md` canonical persistence and
`rendering-artifacts-retention.md` download rules.

## Initial Surface Notes

- Donor Dashboard: receipts, annual statements, pledge summaries.
- Missionary Dashboard: monthly giving statements, support snapshots, donor lists, task lists.
- Mission Control/admin: all authoring, assignments, admin exports, finance/report PDFs.
- Reports: executive summaries, board packets, annual reports, custom exports.
- Events: badges, tickets, registration receipts, rosters, schedules, rooming/meals.
- Mobilize/tasks: candidate packets, onboarding, vetting, task lists.
- Member Care/support: care profiles, care plans, activity logs, private packets, support reports.
- Legal/signing: waivers, consents, audit certificates, policies, completed packet exports.
- CMS/project/missionary: project images, missionary portraits, public-page context, fund/project copy.

## Checklist

- [ ] Every PDF surface is listed.
- [ ] Every surface has a resolver owner.
- [ ] Every surface has artifact access rules.
- [ ] Every surface has retention classification.
- [ ] Every surface has tests/fixtures.
- [ ] Donor and missionary dashboard downloads are connected through portal boundaries, not direct artifact reads.
- [ ] Mission Control/admin, reports, finance, events, care, legal/signing, and CMS PDF surfaces are verified—not only donor/missionary portals.
