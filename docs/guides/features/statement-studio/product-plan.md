# Product Plan

Statement Studio is a custom Mission Control product surface for staff to build, preview, publish, assign, render, and manage tenant-safe PDFs.

## Triggers

Use this plan when defining Statement Studio scope, product behavior, implementation phases, or tenant-facing capabilities.

## Workflow Steps

1. Start from the product north star.
2. Preserve domain ownership boundaries.
3. Build in thin vertical slices.
4. Keep tenant configuration flexible, but enforce platform safety floors.
5. Keep UX clean, token-driven, and non-technical.

## Product North Star

- Fully usable staff-facing product inside Mission Control.
- Own custom Statement Studio surface, not Unlayer and not an email editor.
- Uses pdfx and React PDF where they fit the template model and render pipeline.
- White-label, tenant-brandable, accessible, printable, and reliable.
- Tenant-aware across Mission Control, Donor Dashboard, and Missionary Dashboard.

## Scope

Statement Studio owns:

- Template authoring.
- Template versions.
- Publishing.
- Default assignment to document jobs.
- Variable catalog and tenant-safe mappings.
- Render orchestration.
- Generated artifact metadata.
- Retention, purge, rollback, and audit UX.

Owning product surfaces own source facts:

- Giving owns donations, receipts, statements, refunds, pledges, and reconciliation facts.
- Donor Dashboard owns donor-facing access boundaries.
- Missionary Dashboard owns missionary-facing access boundaries.
- Events owns registrations, tickets, badges, rosters, schedules, meals, and rooms.
- Care/support owns care and support facts, including redaction/private access.
- CMS owns project/missionary page media/content context.
- Legal/signing owns signed documents and audit evidence.

**Phase 7 reconciliation (facts vs. artifact seam):** Phase 7 (Receipt &
Statement Compliance Rules + Donor Identity/Credit Model) owns the
receipt/statement **facts** record — receipt versioning and immutable numbering,
and the statement eligibility/**inclusion snapshot**. Statement Studio consumes
those facts as **render input** and owns only the render artifact, its
generated-artifact metadata, and retention. Statement Studio does not author or
mutate the compliance facts.

## Phases

0. Phase 0 audit brief.
1. Foundation: schema, RLS, grants, Storage, template JSON, versioning, artifact model.
2. Editor MVP: create, edit, sample preview, real preview, publish.
3. Assignments: standard jobs, tenant defaults, custom assignments.
4. First production jobs: `donor.statement.annual_giving`, then `donor.receipt.single`, then `missionary.statement.monthly_giving`.
5. Tables/repeaters: donor lists, finance reports, event roster/badge, schedules.
6. Starter library: broad white-label catalog, design variants, fixtures.
7. Batch rendering, retention automation, purge/storage management, governance.

## Capability Groups

Tenant admins can map capabilities to tenant roles:

- View templates.
- Create/edit drafts.
- Publish versions.
- Assign defaults.
- Manage custom assignments.
- Manage variables/custom fields.
- Preview with sample data.
- Preview with real data.
- Render production PDFs.
- Batch render/export.
- View/download generated PDFs.
- Manage retention/purge/storage.
- View sensitive/private document classes.

Platform safety floors:

- Donors access only their own donor artifacts.
- Missionaries access only authorized missionary artifacts.
- Care/private/legal documents require elevated permission.
- Service-role/server-only actions never become client capabilities.

## Checklist

- [ ] Product UX is clean and non-technical.
- [ ] No new work depends on Unlayer.
- [ ] Capabilities are tenant-configurable within safety floors.
- [ ] First slice proves the full architecture.
- [ ] Cross-app PDF needs are tracked in `integration-map.md`.
