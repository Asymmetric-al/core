# ADR-0119: Tenant-defaulted, Phase-10-ceiling-resolved Publication Reach

**Status:** Accepted (founder ruling, Phase 22 grill session — D2; two first-release narrowings recorded 2026-11-17 for AL-2688)

## Context

Asym tenants need a simple default for how new Missionary Ministry Pages and
Project/Campaign Pages may be found. A CMS publish state cannot safely answer
that question: an approved revision may still be ineligible for anonymous
exposure, an unlisted link remains anonymously public, `noindex` is not access
control, and a worker's Phase 10 safety or consent may change after release.
Mutable visibility switches, cache purge, or raw anonymous operational reads
would therefore make ordinary content operations capable of creating a
physical-safety incident.

## Decision

Phase 22 defines exactly three Publication Reach outcomes in strict order:
**Not public**, **Shared by link — public**, and **Listed publicly**. A
tenant-owned immutable policy version supplies the prospective default for one
exact Tenant × Legal Entity × Site × typed Page Family. Absence of a saved
tenant policy fails safely to Not public and does not pretend the tenant chose
that fallback.

_First-release narrowing recorded 2026-11-17 (see below): the first release
holds one reach default per tenant, not per Legal Entity, Site and Page Family;
a publish request names its reach or takes that default, and with neither it is
refused._

Every released page and locale records one immutable requested reach—sourced
from the exact policy version or an explicit authorized request—and one
release-time effective reach bounded by the exact Phase 10 public-safe
projection, consent, do-not-publish rule, security ceiling, and review verdict.
The currently served reach is bounded again by that immutable result, the
latest locally authoritative Phase 10 ceiling, and append-only containment.
Exposure may narrow immediately; widening always requires a newly authorized,
reviewed, and proofed release.

The release preserves the exact tenant, Legal Entity, Site, page family, page,
locale, participants, CMS revision and digest, policy and safety evidence,
requested and effective reach, Page Release Authority, route generation, actor,
and time coverage. It becomes current through an idempotent compare-and-swap.
Routes and retirement are immutable bindings and tombstones; an old direct link
is never redirected to its replacement.

Phase 22 D8 later specializes Listed-public canonical-route changes: only an
originally Listed route may move, only to an already released eligible Route
Generation for the same immutable Page, and only as one direct `308`. Shared-by-
link and restricted/direct-link routes retain this ADR's nonredirecting
tombstone. Every tombstone and unknown route uses the same real privacy-safe
`404`; resolver unavailability is a non-cacheable `503`, never false
nonexistence.

_First-release narrowing recorded 2026-11-17 (see below): the first release
builds no D8 redirect. A Listed page that changes path leaves no redirect, and
its old path returns the same `404`._

Anonymous traffic reaches only the Phase 5 host/site/tenant choke point and a
privacy-minimized Phase 10-safe runtime projection. It never reads raw
missionary, fund, Party, CMS, policy, evidence, contributor, or operational-ID
records. Local request-time denial is authoritative; cache, CDN, sitemap,
search, social, and copied-link cleanup are independently observed best-effort
outcomes. Public media follows the same release and containment decision.

Content approval, Publication Reach, and Giving readiness remain independent.
Phase 10 owns safety and consent; Phase 12 and D1 own actor and release
authority; Phase 5/Payload owns the presentation revision and runtime; Phase 13
owns Designation and checkout; Phase 22 owns requested reach, release
resolution, routes, and containment composition.

## Consequences

- Shared by link — public is presented honestly as anonymously viewable and
  reshareable, never private or secure.
- Staff receive one prospective, consequence-first default rather than
  page-level visibility and SEO matrices.
- Contributors may see and request reach but cannot choose or widen it or
  manufacture publication authority. In D4's tenant-configured automatic lane,
  an authorized contributor may deliberately choose **Publish changes**; the
  system releases only after every current proof succeeds under the tenant's
  standing release authority.
- Safety reductions take effect without waiting for destructive history edits
  or external purge completion; restoration is a new release rather than undo.
- Existing raw anonymous projections, public permanent media URLs, name-derived
  restricted routes, and inferred public migration are Phase 22 activation
  blockers.

Phase 22 D21 adds no fourth Publication Reach, second D2 current-release head,
or page-level public switch. Its complete-surface cutover advances only the
cohort reader-generation head after re-proving every D2 reach and current Phase
10 ceiling. Preparation cannot widen exposure or delay an adverse narrowing;
post-cutover requests still derive their exact reach through this ADR and the
D18 current-serving evaluation.

## Later Phase 22 D26 qualification

D2's Page Release Manifest pins the exact candidate and its D26 Public Content
Sharing Attestation, but that evidence does not replace or weaken D2's current
Phase 10 ceiling resolution. Known direct objections, `do_not_publish`,
restricted-person rules, and stricter safety outcomes remain independently
authoritative and may contain an attested release.

## Later Phase 22 D27 qualification

D27 makes Page identity Site-scoped and locale-independent. Each enabled locale
is a subordinate Page × locale editorial lineage, and D2 remains the sole
current release and Publication Reach authority for that exact locale. A D2
Page Release Manifest continues to preserve its immutable release-time D3
profile, catalog, renderer, content, locale, brand, reach, safety, and other
owner pins as baseline and historical evidence; that pin is no longer the
complete current presentation selector by itself.

One separately current D3 Public Page Family Presentation Activation now
selects the one family profile generation for every Page and locale in the
exact Tenant × Legal Entity × environment × Site × Page Family. D18 composes
the exact current D2 Page × locale release, exact current D3 activation, and
current D2/Phase-10/D8 admission. An unknown or mixed pair fails closed. A
strictly compatible D3 activation may recompose current presentations without a
new D2 release, but it cannot change content, requested or effective reach,
review, attestation, safety, route, Giving, or any other D2/owner fact. A
migration-required change still follows the ordinary locale-specific release
path.

Every D2 release-head compare-and-swap participates in the Site × family
coordination fence and advances its monotonic epoch. A D3 activation pins and
rechecks that epoch plus the exact complete current D2 release-head-set digest;
a concurrent locale release therefore invalidates stale activation proof rather
than allowing a mixed family generation. D27 adds no new Publication Reach,
D2 release head, per-Page visibility switch, or cross-locale publication action.

## First-release record — 2026-11-17 (AL-2688)

**Authority.** The owner's instruction of 17 November 2026 to implement the CRM,
CMS and database plan ratifies the disposition its
[section 14](../audits/core-crm-cms-database-target-architecture.md#14-required-future-documentation-decisions)
lists for this record: keep it, and record two first-release narrowings. This
record states intent, not implementation.

**Kept, and how the first release meets it.** Current admission is read before
any cached content is served, as this record and the `public-ministry-pages`
contract (D18) require: one read function, never cached across requests, returns
the live head, its reach and whether the tenant, the Site and the subject may be
served now, before any release body is read
([ADR-0229](0229-per-page-releases-and-two-publish-commands.md)). A release
carries a reach, listed or link-only, and a page with no live release is not
public. Directory and index reads return listed releases only, and the proxy
sets `X-Robots-Tag: noindex` on a link-only page. Exposure narrows at once and
widens only through a newly reviewed release.

**Restriction withdraws by command.** A restriction of a worker withdraws every
live release about any of that Party's ministry assignments and marks the
approved profile revision of each withdrawn, in the same transaction. A lift
restores no release and no revision: a worker's photo and story return only with
a fresh approval. Erasing a worker withdraws the same way, one way
([ADR-0239](0239-tenant-erasure-is-distinct-from-account-closure.md)).

**Narrowing 1 — no redirect.** A Listed page that changes path gets no redirect
in the first release; the old path returns `404`. The D8 direct `308` stays the
target.

**Narrowing 2 — one reach default per tenant.** The reach default is held per
tenant, as one setting of the tenant's publication policy changed by a tenant
administrator, not per Legal Entity, Site and Page Family. The keyed policy
version stays the target.

**Also narrowed for the first release (`public-ministry-pages` D14).** The search
and share manifest, structured data and the sitemap are not built. A later
sitemap lists Listed pages only, passes admission on every request and replaces
the donor app's day-long cache rule for `/sitemap.xml`. The D14 contract text
itself, in the active `add-public-ministry-pages` change, is unchanged because
it states the target.

**What each security level does first.** Do-not-publish blocks publication and
withdraws; a change to restricted or high risk withdraws, and a new release about
that worker is made under the alias and may be link-only, never Listed, until the
reach ceilings of the rest of the Phase 10 foundation exist (WP14); standard and
sensitive change nothing yet. This is the plan section 15.1 default taken under
the implementation record (D-08), not a fresh owner ruling.

## Related decisions

- [ADR-0029 — Reference-not-copy CMS↔operational](./0029-reference-not-copy-cms-operational.md)
- [ADR-0118 — Typed Public Ministry Pages with explicit contributor assignments](./0118-typed-public-ministry-pages-and-explicit-contributor-assignments.md)
- [ADR-0125 — Source-qualified Public Page Route Dispositions](./0125-source-qualified-public-page-route-dispositions.md)
- [ADR-0138 — Complete Public Ministry surface authority cutover](./0138-complete-public-ministry-surface-authority-cutover.md)
- [Phase 10 sensitive-data safety](../prds/sitestacker-parity/phase-10-sensitive-data-safety.md)
- [Phase 13 campaign, Designation, contribution ledger, and giving cart](../prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md)
