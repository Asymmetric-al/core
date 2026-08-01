# Product Plan

> [!IMPORTANT]
> **Implementation route superseded (Phase 18, 2026-07-21).** This plan is
> retained only as historical Phase 0 product evidence and has no implementation
> authority. All implementation must follow **Phase 18
> D-prime-amended-and-hardened (D-prime-R)**, the current Phase 18 PRD,
> authority manifest, implementation spec, renderer qualification protocol,
> ADRs 0033-0039, and OpenSpec contract. D3 leaves the renderer unselected until
> one bounded production-shaped evidence contest yields at most one exact
> winner; D17 then performs an environment-gated destructive pre-production
> cutover to zero legacy runtime. Do not use this file to authorize gradual
> migration, fallback or dual runtime, or a preselected DocRaptor path.

Statement Studio is a custom Mission Control product surface for staff to build, preview, publish, assign, render, and manage tenant-safe PDFs.

## Triggers

Use this plan only to inspect the historical Phase 0 product proposal. Do not
use it to define current scope, behavior, implementation phases, or
tenant-facing capabilities.

## Workflow Steps

1. For implementation, stop here and use the current Phase 18 PRD,
   implementation spec, and OpenSpec contract.
2. Use the plan below only as historical evidence; do not execute its phased
   migration or provider-selection route.

## Historical Product North Star (Superseded)

- Fully usable staff-facing product inside Mission Control.
- Own custom Statement Studio surface, not Unlayer and not an email editor.
- Uses an Asym-owned template schema and provider-neutral render boundary. Phase
  18 D3 selects at most one exact production renderer through the bounded
  evidence contest; DocRaptor or any other candidate has no production
  authority beforehand and no losing candidate remains as fallback.
- White-label, tenant-brandable, accessible, printable, and reliable.
- Tenant-aware across Mission Control, Donor Dashboard, and Missionary Dashboard.

## Historical Scope

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

- Giving/source domains own donation, receipt/statement eligibility, source
  issuance, correction effect, refund, pledge, and reconciliation facts.
- Phase 18 owns generated-document access authority; Donor Dashboard and
  Missionary Dashboard present only their authorized Phase 18 projections.
- Events owns registrations, tickets, badges, rosters, schedules, meals, and rooms.
- Care/support owns care and support facts, including redaction/private access.
- CMS owns project/missionary page media/content context.
- Legal/signing owns signed documents and audit evidence.

**Canonical owner split:** Phase 7 owns receipt/statement eligibility, facts,
source issuance, and correction effect. Phase 18 owns document definition,
publication, request, public reference/version/serial, exact artifact, current
head, access, and records. Phase 19 owns statement population, cutoff, runs, and
items. Phase 17 owns message and delivery. Phase 18 consumes immutable Facts
Packages and never authors or mutates source compliance truth.

## Historical Phase 0 Slice Plan (Superseded)

0. Phase 0 audit brief.
1. Foundation: schema, RLS, grants, Storage, template JSON, versioning, artifact model.
2. Editor MVP: create, edit, sample preview, real preview, publish.
3. Assignments: standard jobs, tenant defaults, custom assignments.
4. Infrastructure tracer: synthetic admin-only preview selection, render,
   private artifact, download, and audit; never a production assignment/job.
5. First production jobs: `donor.statement.annual_giving` after its canonical
   statement snapshot/version and finance/legal gates, then
   `donor.receipt.single` after receipt-truth reconciliation, then
   `missionary.statement.monthly_giving`.
6. Tables/repeaters: donor lists, finance reports, event roster/badge, schedules.
7. Starter library: broad white-label catalog, design variants, fixtures.
8. Batch rendering, retention automation, purge/storage management, governance.

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
