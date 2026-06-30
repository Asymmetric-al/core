# Integration Map

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
