# ADR-0145: Page-local composition, bounded reuse, and coherent Public Site Generations

**Status:** Accepted (founder-ratified Phase 23 D1 C-prime-R, 2026-08-15)

## Context

Phase 23 needs ordinary Page editing to remain understandable while supporting
deliberate reuse, structural Site planning, safe multi-document publication,
and a compiled public boundary. A Page that owns every concern makes shared
content and source-owned dynamic content brittle; an arbitrary content and
placement graph makes routine authoring and lifecycle reasoning too complex.
Provider drafts, relationships, hierarchy plugins, and hooks also do not by
themselves define a coherent multi-document public release.

This decision is intentionally provider-neutral. The current internal Payload
4 cohort remains subject to separate exact-version qualification and cannot
define Asym's public, authorization, tenant, or release semantics by default.

## Decision

Phase 23 adopts one quiet, Page-first authoring model with page-local typed
composition, deliberate bounded reuse, and coherent Site-and-locale serving
generations.

One stable Site-scoped **Page** has an immutable page family and subordinate
BCP-47 locale lineages. A locale **Editorial Revision** owns localized title,
bounded typed Page-local composition, and editorial SEO. A separately
versioned locale **Page Placement Revision** owns parent, order, and canonical
normalized path. Placement is a narrow structural Site Plan facet behind one
accessible Edit → Preview → Publish Page experience, not a staff-visible second
document, arbitrary many-to-many graph, or database row for every local block.
Navigation remains independently versioned, uses stable Page references, and
is never silently derived from tree movement.

Ordinary blocks remain local. A **Reusable Section** is created or selected
only by an explicit author action, is code-typed, independently versioned,
scoped to the exact Tenant × Site × BCP-47 locale, and limited to one reuse
level. The product exposes every use and consequence and offers **Change every
use** or **Make a local copy**. An in-use section cannot be destructively
removed. A new section revision changes nothing public until an exact successor
generation selects it. Cross-Site reuse, recursive reuse, arbitrary
inheritance, and per-placement workflow are excluded from Phase 23.

Every ordinary Publish action prepares an immutable, content-addressed
successor **Public Site Generation** for one exact Tenant × environment × Site
× BCP-47 locale from the current generation and only the affected dependency
closure. Preparation validates current actor authority and scope, exact Phase
23 revisions, routes and reservations, hierarchy, references, renderer
compatibility, reach and safety contracts, and required artifacts; structurally
reuses unchanged versions; and compiles bounded public projections. Only a
complete compatible candidate may idempotently compare-and-swap one small
serving head. Candidate failure leaves the prior generation serving.

“One release” therefore means one coherent serving generation. It does not
mean a giant mutable Site Plan, full-site rewrite, Tenant-global lock,
cross-locale or Legal-Entity transaction, distributed cache/search
transaction, manual dependency census, Publish All ceremony, or review of
unchanged Pages.

Typed dynamic blocks and Phase 22 missionary/project Pages remain references
to their source owners. Phase 23 may pin compatible binding, contract, and
adapter generations but cannot copy operational facts, advance a source-owned
release, freeze independently live Ministry Updates, or supersede Phase 10/22
authority. Current safety, withdrawal, and lifecycle narrowing is immediate
and adverse-first. Cache, search, sitemap, CDN, and crawler convergence remain
separately observable facts. Recovery creates a newly validated successor from
retained safe versions instead of rewriting history.

## Consequences

- A normal local edit still looks and behaves like one Page publication.
- A shared or structural edit opens consequence review only for the exact
  affected closure; unchanged Pages require no manual re-approval.
- Public rendering uses a flat, allowlisted compiled projection and one active
  generation, not recursive provider relationships or mutable `latest` reads.
- Stable identity, exact version pins, composite scope integrity, idempotency,
  CAS activation, accessibility, concurrency, failure, migration, and
  high-fan-out capacity proof are mandatory implementation seams.
- Saved, scheduled, compiled, activated, cached, searchable, publicly visible,
  and source-authoritative remain distinct facts.

## Rejected alternatives

- one record collapsing Page content, placement, menu, release, and dynamic
  source truth;
- a universal content-item/placement graph;
- nested or cross-Site reusable content in Phase 23;
- one giant Site Plan document, full-site rewrite, or Tenant-global release
  lock;
- a distributed transaction spanning CMS, cache, search, and source domains;
- live `latest` reusable references or raw Payload relationship population;
- provider hierarchy, draft state, or hook completion as public authority; and
- destructive rollback or restoration that bypasses current Phase 10/22
  proof.

## Phase 23 D10 precision amendment

Founder-ratified Phase 23 D10 and ADR-0154 create the sole narrow exception to
the cross-locale exclusion above: one already-prepared Site Presentation
Activation may CAS-advance the exact current public-locale head cohort in one
short PostgreSQL transaction. Ordinary Page, route, Navigation, content, and
locale publication remains single-locale; no Site-global serving head or second
public authority is created. The Legal-Entity exclusion remains unchanged.

Ratification of this planning decision authorizes no implementation, schema,
migration, provider qualification, issue publication, release activation, or
production change.

## References

- [Phase 23 D1 decision log](../prds/sitestacker-parity/phase-23-web-studio-cms-decision-log.md#d1--page-local-composition-bounded-reuse-and-coherent-serving-generations)
- [Phase 23 D1 adversarial research evidence](../prds/sitestacker-parity/phase-23-d1-page-local-composition-adversarial-research-evidence.md)
- [Phase 23 opening CMS/provider benchmark evidence](../prds/sitestacker-parity/phase-23-opening-cms-provider-benchmark-research-evidence.md)
- [ADR-0154 — Complete-cohort Site Presentation Activation through D1](./0154-complete-cohort-site-presentation-activation-through-d1.md)
- [Phase 22 specification PR #1323](https://github.com/Asymmetric-al/core/pull/1323)
