# ADR-0145: Page-local composition, bounded reuse, and coherent Public Site Generations

**Status:** Accepted (founder-ratified Phase 23 D1 C-prime-R, 2026-08-15; first-release scope amended 2026-11-17 for AL-2688)

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

_Amended 2026-11-17 (see the first-release scope amendment below): the first
release serves per-page immutable releases, with several documents activated
together in one transaction, instead of a Site-and-locale generation. Public
Site Generations remain the later target, with the triggers stated there. The
two paragraphs above describe that target._

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

Founder-ratified Phase 23 D10 and ADR-0154 define the presentation-only narrow
exception: one already-prepared Site Presentation Activation may CAS-advance
the exact current public-locale head cohort in one short PostgreSQL transaction.
Later Phase 24 D73/[ADR-0194](./0194-explicit-former-primary-website-disposition.md)
and D76/[ADR-0197](./0197-prepared-same-tenant-site-domain-cutover.md) also require
their exact domain-owned origin/cutover transitions to advance compatible
current-public-locale generation successors with the affected Domain heads
atomically. D76 retains its acknowledged adverse Moving barrier before the
final source/destination head swap. These bounded domain commands consume D1
generations; they cannot publish unrelated content, private locales, a partial
origin cohort or a new serving authority. Ordinary Page, route, Navigation,
content and locale publication remains single-locale. The Legal-Entity and
distributed-transaction exclusions remain unchanged.

Ratification of this planning decision authorizes no implementation, schema,
migration, provider qualification, issue publication, release activation, or
production change.

## First-release scope amendment — 2026-11-17 (AL-2688)

**Authority.** The owner's instruction of 17 November 2026 to implement the CRM,
CMS and database plan ratifies the disposition its
[section 14](../audits/core-crm-cms-database-target-architecture.md#14-required-future-documentation-decisions)
lists for this record. The plan section 15.1 question whether the first release
needs atomic multi-page launches is taken at its default, "not needed", under
the [implementation record](../audits/core-crm-cms-database-implementation-record.md#6-decisions-and-deviations)
(D-05). That is a default taken, not a fresh owner ruling. If the owner rules
that the first release needs atomic multi-page launches, this amendment lapses
and the plan's decision 1 returns to section 11.4. This amendment records
intent, not implementation.

**First release.** Each publish writes one immutable release row in Core for each
published page or navigation set, and moves the heads of every document in that
publish together, by compare-and-swap, in one transaction
([ADR-0229](0229-per-page-releases-and-two-publish-commands.md)). Public reads
take a page and its navigation in one statement. A failed publish leaves every
previous head serving. There is no single Site-wide head that pins every member:
a page and a menu published separately can disagree until both are published,
and two separately cached fragments can disagree briefly. That is the stated
price of deferring generations, and the council's dissent on it is preserved
(plan section 11.3).

**Later target, with triggers.** Whole-Site Public Site Generations return when a
requirement needs atomic multi-page launches, scheduled releases or whole-Site
rollback. They can be added then without replacing the release tables: releases
already carry a locale column, and a nullable generation column can be added
without rewriting a stored row.

**Unchanged.** Page-local composition, bounded reuse, stable Page identity,
Navigation as an independently versioned document, source-owned dynamic content
referenced and never copied, and immediate adverse narrowing. The first
release's CMS collections (plan section 6.2) hold no Reusable Section and no
separate Page Placement Revision: a page's public path is its slug, unique per
Site. Those, and the Phase 23 D10 presentation activation, which advances a
generation, wait for the later target.

**Dependent Phase 23 decisions.** The Phase 23 decision log records the same
amendment under D1 and names the dependent decisions it narrows for the first
release.

## References

- [Phase 23 D1 decision log](../prds/sitestacker-parity/phase-23-web-studio-cms-decision-log.md#d1--page-local-composition-bounded-reuse-and-coherent-serving-generations)
- [Phase 23 D1 adversarial research evidence](../prds/sitestacker-parity/phase-23-d1-page-local-composition-adversarial-research-evidence.md)
- [Phase 23 opening CMS/provider benchmark evidence](../prds/sitestacker-parity/phase-23-opening-cms-provider-benchmark-research-evidence.md)
- [ADR-0154 — Complete-cohort Site Presentation Activation through D1](./0154-complete-cohort-site-presentation-activation-through-d1.md)
- [Phase 22 specification PR #1323](https://github.com/Asymmetric-al/core/pull/1323)
