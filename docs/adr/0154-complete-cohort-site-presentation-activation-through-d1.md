# ADR-0154: Complete-cohort Site Presentation Activation through D1

**Status:** Accepted (founder-ratified Phase 23 D10 C-prime-R, 2026-08-21)

## Context

ADR-0145 makes one immutable Public Site Generation and one small serving head
for each exact Tenant × environment × Site × BCP-47 locale the sole ordinary
public-serving authority. ADR-0153 makes one Site-scoped Presentation Profile
and certified Presentation Package apply across the Site. A positive Site-wide
design release must therefore keep every currently public locale on one exact
presentation without publishing unrelated drafts, weakening Phase-10 safety,
or introducing a mutable global presentation pointer.

Locale-by-locale activation would permit an intentionally mixed public Site.
A runtime Site presentation head would make retained locale generations render
differently later and create a second public truth. Because the bounded locale
heads share one PostgreSQL primary, the smallest honest solution is complete
private preparation followed by one short all-or-none update of those existing
heads.

## Decision

> **C-prime-amended-and-hardened (C-prime-R) — one complete-cohort, all-or-none
> D1 Site Presentation Activation:** for one exact Tenant × environment × Site,
> prepare from the exact current-serving D1 Public Site Generation of every
> locale in one source-owned, revision-pinned public-locale census exactly one
> immutable successor generation that structurally preserves every current
> public Page, translation, Page Placement, route, Navigation membership and
> destination, editorial SEO, designation and giving handoff, Phase-22
> specialized Page release, and source-owned dynamic fact while selecting the
> same exact D9 Presentation Package, Site Presentation Profile Version,
> content-addressed assets/artifacts, and compatible code/schema generation.
> Bind the ordered expected and successor head sets, complete Tenant/Site/locale
> scope, Phase-24 enabled-locale census, proof-only disposition for each enabled
> locale without a public head, package/profile/artifact and deployment digests,
> actor and capability inputs, revocation and Phase-10 ceiling inputs,
> idempotency fingerprint, and production-shaped locale, Page-family,
> accessibility, reduced-motion, no-JavaScript, performance, restricted-safety,
> and exact give-handoff evidence in one immutable content-addressed Site
> Presentation Activation Manifest. Preparation is private, chunked, resumable,
> bounded-concurrency, structurally reused, and non-authoritative; an enabled
> non-public locale is proved but never published, and a Site with no public
> locale gains no public state.
>
> D10 is the sole narrow precision exception to D1's exclusion of cross-locale
> transactions: after every traffic-serving runtime proves it can render both
> the current and candidate closures, one short idempotent transaction on the
> single PostgreSQL primary re-proves and locks the exact Site census fence,
> current actor/capability, Phase-10 safety, D9 admission/revocation, artifact and
> deployment compatibility, manifest, and expected heads in documented stable
> order; proves two-way cohort set equality; CAS-advances every exact existing
> locale head to its sealed successor and verifies the exact returned set; and
> writes one immutable activation receipt plus deduplicated downstream-
> convergence intent—or rolls back all of them. Expensive compilation, Payload
> resolution, user interaction, HTTP/provider calls, deployment promotion,
> cache/search work, and other external effects never occur while locks are held.
> Transient database aborts retry the whole transaction only after bounded fresh
> reproof; semantic staleness requires a new manifest; and a timeout or lost
> acknowledgement is resolved by receipt/vector read-back before retry.
>
> Staff receive one quiet, accessible **Website design** compare-and-review flow
> over exact current public content, with locale/Page-family/device/reduced-motion
> preview, one plain consequence card, cause-owned hard blockers, one
> confirmation, and one **Publish website design** action. Locale controls inspect
> the complete proof but never select a partial rollout; design publication
> cannot copy, publish, reset, discard, or otherwise advance any content or
> translation draft, route, Page visibility, Navigation destination, SEO copy,
> designation, giving destination, locale enablement, or source-owned release.
> The interface distinguishes authoritative **Published** from **Finishing public
> delivery checks**, handles unknown outcomes by inspection, returns healthy
> Sites to a quiet state, and restores an earlier presentation only by preparing
> a newly proved complete successor over today's public content.
>
> The PostgreSQL commit makes D1 authority coherent, not every cache or visitor
> simultaneously current: one request pins one complete generation closure;
> content-addressed assets never mutate; complete old cached responses may remain
> briefly while domain, deployment, CDN/ISR/data/image cache, search, sitemap,
> crawler, and client convergence are separately observed and repaired. Vercel
> Rolling Releases, Skew Protection, deployment rollback, Payload draft/localized
> status, cache invalidation, and provider hooks remain subordinate delivery,
> authoring, or code facts—never participants in or substitutes for D1 authority.
> D9 package revocation and Phase-10 adverse safety remain independently
> immediate and may invoke the pre-qualified safe/degraded presentation and a new
> smallest-scope successor without waiting for an ordinary positive cohort. This
> provides a truthful Site-wide design release without a Site-global presentation
> pointer, second serving head, super-generation, distributed transaction,
> tenant-global lock, per-locale partial apply, manual locale certification,
> mutable readiness flag, runtime `latest`, force-publish path, blind retry,
> destructive rollback, mutable asset replacement, hidden draft side effect, or
> claim that prepared, activated, deployed, cached, searchable, publicly
> verified, and seen by every visitor are the same fact.

## Consequences

- D10 is a narrow, purpose-specific precision amendment to D1. Ordinary Page,
  route, Navigation, content, and locale publication remains one-locale CAS.
- Every authoritative locale head in a cohort must share one PostgreSQL primary.
  Future sharding requires a new decision; D10 does not add distributed commit.
- One small Site census fence coordinates locale membership changes but is not
  a public head, profile pointer, readiness state, or runtime rendering input.
- Candidate preparation may be parallel and resumable but remains private.
  Final cutover touches only bounded proof rows, exact heads, receipt, and
  downstream intent.
- The public basis is each locale's current serving generation. Unrelated
  drafts, locale status, routes, Navigation destinations, SEO, designations,
  giving destinations, and source-owned releases cannot advance as side effects.
- A Site with no public locale remains non-public; an enabled locale without a
  head receives proof only. One-locale Sites use the same machinery without
  unnecessary locale controls.
- Atomic authority and worldwide delivery are different facts. Complete old
  cached responses may coexist temporarily with complete new responses, but
  one request may never assemble mixed generations.
- Recovery and restoration create a newly proved successor over current public
  content. Revoked packages and Phase-10 safety use independent adverse-first
  containment rather than waiting for positive release readiness.

## Rejected alternatives

- locale-by-locale positive design activation or a partial-apply override;
- a Site-global presentation head, mutable package/profile pointer, or runtime
  combination of independently advancing public authorities;
- a super-generation, tenant-global lock, distributed transaction, two-phase
  commit, provider rollout, cache invalidation, or deployment alias as authority;
- preparation, Payload resolution, network calls, rendering, cache/search work,
  or user interaction while serving-head locks are held;
- runtime `latest`, private draft basis, count-only cohort validation, blind
  retry, sequence/time-based commit inference, destructive rollback, or mutable
  replacement of content-addressed assets; and
- claims that activated, deployed, cached, searchable, publicly verified, and
  seen by every visitor are one state.

## Implementation proof gates

Implementation remains unauthorized by this ADR. A future authorized change
must prove at minimum:

- normalized unique candidate membership, complete composite scope, two-way
  cohort equality, exact expected-head CAS, exact returned-set assertion, and
  an immutable idempotency receipt/downstream intent written in one transaction;
- explicit grants, RLS, private authority relations, safe function privileges,
  current actor/capability/safety/revocation proof, and forged cross-scope denial;
- deterministic lock order, bounded lock/statement budgets, and genuine
  multi-connection races between D10, ordinary publication, locale changes,
  permission/package revocation, and adverse containment;
- injected failure after the first, middle, and last head update; deadlock,
  serialization failure, timeout, disconnect, lost acknowledgement, and same-
  versus different-fingerprint idempotency behavior;
- zero, one, typical, and measured-maximum locale cohorts plus RTL, CJK, long
  content, accessibility, reduced motion, no-JavaScript, missing assets,
  restricted publication, and exact giving-handoff behavior;
- backward/forward-compatible base, canary, and retained deployments; one
  generation closure per request; immutable asset identity; downstream replay;
  and old-complete/new-complete cache behavior without mixed rendering; and
- proof that Page, translation, route, Navigation, SEO, designation, giving,
  locale, Phase-22, and source-owned drafts/releases remain unadvanced.

Ratification of this planning decision authorizes no implementation, schema,
migration, provider adoption, issue publication, deployment, release
activation, or production change.

## References

- [Phase 23 D10 decision log](../prds/sitestacker-parity/phase-23-web-studio-cms-decision-log.md#d10--complete-cohort-all-or-none-site-presentation-activation)
- [Phase 23 D10 research and adversarial evidence](../prds/sitestacker-parity/phase-23-d10-site-presentation-activation-cohort-research-evidence.md)
- [ADR-0145 — Page-local composition, bounded reuse, and coherent Public Site Generations](./0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [ADR-0153 — Certified Site-bound custom Presentation Packages](./0153-certified-site-bound-custom-presentation-packages.md)
- [Phase 22 specification PR #1323](https://github.com/Asymmetric-al/core/pull/1323)
