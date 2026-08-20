# ADR-0134: Exact Typed Public Page Subject Bindings

**Status:** Accepted (founder ruling, Phase 22 D17, 2026-08-06)

## Context

Phase 22 has two typed Public Ministry Page families. This D17 decision governs
only Project/Campaign Pages, which must be flexible enough to represent ongoing
organization-controlled work, a fundraising campaign, or a fund/designated
purpose. Phase 22 D19 separately resolves every Missionary Ministry Page to one
CRM-owned Ministry Assignment. Those concepts are not synonyms.

The current prototype stores a soft `fundId` on a Payload Project Page, copies
fund fields into presentation content, and derives Giving from the same value.
That is useful migration evidence but collapses operational project identity,
Campaign, Designation, Page subject, Giving, progress, permissions, and CMS
content. The repository also lacked a canonical operational Ministry Project
identity/lifecycle source. Continuing to infer “project” from a fund, title, CMS
document, accounting project, or Campaign would fabricate truth and make
released Page history mutable.

## Decision

Adopt the complete Phase 22 D17 C-prime-R ruling:

> **C-prime-amended-and-hardened (C-prime-R) — for every Project/Campaign Page, one immutable-versioned, exact Page Subject Binding to exactly one code-owned and owner-certified subject kind: one canonical CRM-owned Ministry Project, one Phase 13 Giving Campaign, or one separately public-subject-eligible Phase 13 Designation presented as “Fund or designated purpose”; with the missing minimal CRM Ministry Project identity and lifecycle contract established in the operational ownership layer and every subject kind unavailable until production-certified; exact Tenant, Legal Entity, environment, Site, Page Family, source identity, source version, lifecycle, actor, reason, and effective-time scope; structurally enforced kind-matched composite foreign keys, deletion restriction, duplicate prevention, release-time source and Phase 10 reproof, and a privacy-safe subject snapshot pinned into every immutable release. Page subject, D7 Page Giving Binding, D6 progress, D1 contributor and display participation, D2 reach and release, D8 route/lifecycle disposition, D9 media, D11 Ministry Updates, D13 discovery, and D14 search/share remain independently authoritative. A pre-first-release correction creates a CAS-guarded successor binding; after the first public release, a different subject requires a new Page identity and explicit D8 succession. Staff receive one quiet, accessible “What is this page about?” setup followed by exact eligible-record search and a plain-language consequence review; missionaries receive a read-only “About this page” summary; donors see only approved public presentation—without a generic `subject_type + subject_id`, arbitrary CRM custom objects, inferred operational projects, fund-as-project relabeling, inferred permissions, inferred Giving or progress, copied operational identity, raw public source access, mutable released subjects, destructive deletion, fuzzy migration, silent substitution, dual authority, or exposed internal identifiers.**

The CRM operational layer owns a minimal Ministry Project source: stable opaque
identity, exact Tenant and Legal Entity, source-owned type/status and lifecycle,
immutable version, optional dates, retirement/successor meaning, external source
references where applicable, and audit provenance. It is not project-management,
budget, accounting, Campaign, Designation, progress, or CMS content.

Phase 13 owns Giving Campaign and Designation identity/lifecycle and explicit
Designation public-subject eligibility. Phase 22 owns only Page Subject Binding
versions, pre-release correction semantics, and the privacy-safe source snapshot
pinned into each release. Phase 10 decides what source information is safe for
public presentation. Payload owns authored content referencing an opaque Page ID.

Operational Postgres enforces exactly one closed, kind-matched source reference;
same-Tenant/Legal-Entity composite integrity; restricted deletion; current-Page
uniqueness; immutable binding lineage; server-command-only writes; and RLS as
defense in depth. An idempotent operational transaction commits Page/binding,
audit, and outbox truth before retryable Payload draft materialization. Anonymous
public traffic consumes only the release-pinned Phase 5/10 projection.

Before a Page has ever released publicly, an authorized correction appends a
CAS-guarded successor binding. After first release, another subject requires a
new Page identity and D8 succession. This preserves routes, releases, Updates,
measurement, search/share, attribution, and donor expectations.

**Phase 22 D19 precision.** D17's three closed subject arms remain exclusive to
Project/Campaign Pages. A Missionary Ministry Page instead binds to exactly one
CRM Ministry Assignment under ADR-0136. Neither family may substitute the
other's subject kind, and Ministry Assignment participation, public display,
Page contribution, optional Support Binding, and financial access remain
independent.

## Later Phase 22 D27 qualification

D27 makes the Page identity unique within the exact Tenant × Legal Entity ×
environment × Site × Page Family × D17 source-qualified typed subject and explicitly excludes
locale from that identity. One Page carries the one Page Subject Binding and has
independently governed subordinate Page × Phase-24 locale lineages. A locale
MUST NOT create another Page, another subject binding, or a copied subject
snapshot. Each locale's immutable D2 release continues to pin the exact current
binding version and minimum Phase-10-safe subject snapshot.

One current D3 family profile activation applies to every Page and locale in
the Site and family, with no Page- or locale-specific profile exception. That
activation changes presentation structure only and cannot replace, reinterpret,
translate, or mutate the Page Subject Binding, source lifecycle, subject
snapshot, contributor/display relationship, Giving Binding, progress, reach,
route, or any other subject-owner fact. D18 composes each exact D2 locale release
with the current D3 activation; neither component becomes subject authority.

The D3 activation cohort includes every non-retired Page × enabled locale with
a current D2 release head, but that cohort is coverage for presentation proof,
not a bulk subject or Page mutation. A concurrent D2 locale release advances
the Site × family coordination epoch and invalidates stale activation proof.
D27 therefore preserves this ADR's immutable post-release subject and new-Page
succession rules while preventing locale copies or presentation profiles from
becoming a second subject identity.

## Consequences

- Tenants receive three understandable choices without a configurable ontology:
  **Ongoing ministry or project**, **Fundraising campaign**, and **Fund or
  designated purpose**. A choice appears only when its owner/source is certified.
- Staff use indexed eligible-record search and one consequence review that
  separates what the Page is about from Giving, progress, editors, reach, and
  review mode. **Start private Page** creates no public or financial truth.
- Missionaries see a read-only **About this page** summary. Donors see only
  approved presentation, never source kind, internal status, ID, or setup.
- A subject relation grants no contributor, display, preview, review, release,
  notification, financial, or workspace access and selects no Giving or progress.
- Legacy `fundId` rows require exact typed classification and a complete
  disposition manifest. Ambiguous, missing, duplicated, inactive, or cross-scope
  rows are quarantined; no fuzzy matching or General Fund fallback is allowed.
- Exports preserve stable Page/source IDs, kind, scope, binding lineage,
  lifecycle/succession, safe snapshots, tombstones, and separate D7 bindings.
- Source lifecycle changes enter cause-owned D8 handling but do not silently
  mutate the Page, route, Giving, progress, or successor.
- The design adds a small CRM identity/lifecycle seam, not a project-management
  product or universal polymorphic framework.

## Considered options

### One generic polymorphic subject reference

Rejected. `subject_type + subject_id` cannot enforce same-scope referential
integrity, permits arbitrary or orphaned objects, and makes authorization,
migration, and lifecycle behavior implicit.

### Fund-backed Project Pages

Rejected as authority. A Designation can legitimately represent a public fund or
purpose, but only through the explicit typed arm. A fund is not automatically an
operational Project, and subject use does not automatically become the D7 Giving
destination.

### Campaign-only Project Pages

Rejected. A Giving Campaign is a fundraising effort and does not represent all
ongoing ministries, projects, funds, or designated purposes.

### Tenant-defined subject kinds or arbitrary CRM objects

Rejected. This would create a custom ontology and relationship engine, make
owner/lifecycle contracts unverifiable, and substantially increase staff and
operational complexity.

### Closed typed subjects with owner-certified adapters

Accepted and hardened with a minimal CRM Ministry Project source, exact Phase 13
Campaign/Designation arms, structural same-scope integrity, independent owner
bindings, release snapshots, immutable post-release identity, and explicit
migration/export contracts.

## Related decisions

- [ADR-0001](./0001-asym-postgres-owns-crm-truth-twenty-retired.md) — Asym
  Postgres owns CRM truth
- [ADR-0029](./0029-reference-not-copy-cms-operational.md) — CMS references
  operational identity rather than copying it
- [ADR-0118](./0118-typed-public-ministry-pages-and-explicit-contributor-assignments.md)
  — Page families, subjects, display participants, and contributors
- [ADR-0123](./0123-page-resolved-source-authoritative-public-support-progress.md)
  — independently selected public progress
- [ADR-0124](./0124-one-exact-page-giving-binding-for-phase22-mvp.md) — one
  independently selected Page Giving Binding
- [ADR-0125](./0125-source-qualified-public-page-route-dispositions.md) — Page
  route/lifecycle succession
- [Phase 22 decision log](../prds/sitestacker-parity/phase-22-public-ministry-pages-decision-log.md)
- [Phase 22 research evidence §41](../prds/sitestacker-parity/phase-22-public-ministry-pages-research-evidence.md#41-ratified-d17-research--one-exact-source-qualified-typed-projectcampaign-page-subject)
