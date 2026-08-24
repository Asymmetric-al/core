# ADR-0158: Versioned Dynamic Source Catalog and source-discriminated Content List

**Status:** Accepted (founder-ratified Phase 23 D14 C-prime-R, 2026-08-22)

## Context

ADR-0145 makes one immutable Public Site Generation and its serving-head CAS the
sole ordinary public authority. ADR-0151 defines a small code-owned semantic
section catalog and prohibits arbitrary query surfaces. ADR-0153 permits
certified Site-bound Presentation Packages to render semantic content without
gaining source or authorization authority.

Phase 23 still needs changing lists such as current Articles, Missionaries,
Projects, or Ministry Updates. Separate provider-specific blocks would duplicate
authoring and validation, while one generic query object would expose database
shape, weaken tenant safety, and become a costly low-code platform. The durable
boundary is one simple editor block backed by source-specific, code-qualified
contracts.

## Decision

> **C-prime-amended-and-hardened (C-prime-R) — One code-owned, provider-neutral and versioned Dynamic Source Catalog behind one source-discriminated Dynamic Content List semantic leaf, introduced only through D7’s additive catalog evolution and published only through D1’s complete-cohort Site Plan release. Ordinary staff see a single, accessible “Content list” block—not catalog, provider, or query terminology—and choose an available source first, after which the editor reveals only that source’s plain-language presets, bounded typed filters, safe ordering choices, item limits, compatible D9 presentation variants, heading/CTA and empty-state choices, human-readable configuration summary, and actual current public-safe preview. Each immutable source contract has a stable never-reused key, owning phase and owner, contract version, Tenant/Site/locale/Page-family availability, public-list DTO and stable item identity, permitted filters/operators/sorts/limits and presentation capabilities, deterministic total ordering and null handling, preview/empty/unavailable/adverse-safety behavior, query/index/cost and batching bounds, cache and invalidation dimensions, migration and retirement rules, observability, and a shared conformance suite. The Page revision stores only the semantic source key, exact source-contract version, canonical validated source-specific selection intent, approved semantic presentation variant, and bounded localized editorial copy; it never stores matching records, operational objects, browser-supplied Tenant/Site/locale authority, provider collection or table names, database fields, private identifiers, arbitrary field selections, SQL, GraphQL, GROQ, raw JSON operators, formulas, executable code, CSS, or cross-source joins. D1 validates and releases the exact configuration and pins compatible catalog, compiler, adapter, and renderer generations, including reproof at D13 scheduled execution, but never freezes matching records or replaces the source owner’s independently current publication, lifecycle, eligibility, or Phase 10 safety authority; changing list configuration requires a Page release, while matching public membership may change without one. Preview and public delivery use the same provider-neutral public-projection seam and trusted server-resolved Tenant, environment, Site, locale, audience, and source authority; Payload-backed reads use explicit access enforcement, exact projection and `depth: 0`, while Supabase-backed reads use least privilege, exact tenant predicates and applicable RLS without treating a service-role read as proof of isolation. Cache identity includes the complete trusted scope, source and contract version, canonical intent hash, publication/safety version, and relevant release and renderer generations; adverse safety narrowing invalidates first. Legitimate empty results, unavailable sources, incompatible contracts, permission failures and transport failures remain structurally distinct; failures preserve the rest of the Page, expose only safe public fallback behavior, and create one cause-owned private operational exception, while stale output may be reused only when current safety can still be independently proven. Source changes explain exactly which source-specific settings reset, require confirmation, preserve recovery through D12, and support undo; unknown or incompatible versions block the candidate release while the prior public generation remains intact, and migrations create explicit successor drafts rather than mutating content during reads. Article is the required Phase 23 source; Missionary, Project/Campaign and Ministry Update sources become available only through their certified Phase 22 public projections; Event and Opportunity wait for Phase 37; every other source requires the same owner-supplied qualification. New sources remain code-owned qualifications, never tenant-created schemas or runtime plugins. The catalog reserves typed capability seams for the separately ratified curation and pagination decisions without presuming or implementing their outcomes, and it expressly excludes arbitrary query builders, nested Boolean expression editors, random or unbounded result modes, tenant-authored operators, cross-source aggregation, personalization and AI-generated queries.**

## Consequences

- Ordinary staff configure one **Content list** through source-first progressive
  disclosure, safe defaults, a readable summary, current public-safe preview,
  explicit empty/degraded states, and protected source changes.
- Each source remains independently owned and may expose only its qualified
  public-list DTO, bounded filters, sorts, limits, deterministic ordering, safe
  presentation variants, cost contract, lifecycle, and failure behavior.
- The Page stores semantic Selection Intent and an exact source-contract
  version, never provider queries, operational records, private scope, or copied
  matching items.
- D1 releases exact configuration and compatible generations. Source membership
  remains current independently authoritative truth and may change without a
  Page republish.
- Preview uses the same public-projection seam and safety ceiling as public
  rendering. Staff authentication never expands preview data.
- Trusted server context supplies Tenant, environment, Site, locale, audience,
  source authority, and cache identity. Payload or Supabase privilege never
  substitutes for explicit isolation.
- Legitimate empty results, incompatibility, authorization, unavailability, and
  transport failure remain distinct. Adverse safety narrowing suppresses first,
  while an isolated list failure preserves the rest of the Page.
- Contract changes are versioned and migrated through explicit successor drafts.
  Active or retained public generations keep every safe contract version they
  require.
- A family-qualified Content list may become a Reusable Section only through
  ADR-0152's existing exact-version, scope, propagation, and recovery contract.
  Reuse shares Selection Intent, never matching source records; D14 creates no
  second reuse or inheritance mechanism.
- Article is the initial tracer. Phase 22 sources qualify separately, and
  Event/Opportunity waits for Phase 37.
- ADR-0159 defines the separately ratified curation semantics, and ADR-0160
  defines the separately ratified link-native Public Page Window contract. D14
  supplies both typed seams without absorbing their product authority.

## Rejected alternatives

- one provider-specific block per source, direct Payload collection selection,
  direct Supabase table/field selection, or provider records as Page content;
- generic SQL, GraphQL, GROQ, raw JSON/Where, arbitrary fields, nested Boolean
  expressions, formulas, joins, tenant schemas, runtime plugins, cross-source
  aggregation, personalization, recommendations, or AI-generated queries;
- unbounded or random results, silent clamping, hidden setting resets, read-time
  migration, guessed version fallback, raw public errors, or exact total counts
  without a safe and cheap owner contract;
- browser-supplied Tenant/Site/locale authority, private staff preview,
  provider privilege as isolation proof, or cache tags as authorization; and
- allowing a custom Presentation Package to add data, query, access, safety, or
  release authority.

## Implementation proof gates

Implementation remains unauthorized by this ADR. A future authorized change
must prove at minimum:

- a shared catalog conformance harness for every source key/version, intent,
  normalizer, DTO, query plan, renderer compatibility, migration, retirement,
  diagnostics, and export;
- exact cross-Tenant/environment/Site/locale/Page-family/audience denial,
  current Phase 10/source safety, public-only projection, exact Payload access
  and depth, and applicable Supabase tenant predicates/RLS/grants;
- deterministic identity, ordering, ties, nulls, deduplication, empty results,
  missing media, self-reference, and later pagination boundaries;
- structural separation and safe UX for loading, genuine empty, unavailable,
  incompatible, unauthorized, timeout, transport failure, and adverse
  withdrawal;
- complete cache identity, cross-scope cache-poisoning denial, ordinary
  convergence, adverse-first invalidation, and independently proven safe stale
  reuse only;
- bounded Page/list/item/concurrency work, indexes and query plans, duplicate
  request deduplication, source fan-out, outage and worst-case production load;
- D12 recovery, source-change confirmation and undo, D1 publication, D13
  execution, source and renderer changes, CAS races, rollback, and retained
  contract compatibility;
- one complete Article tracer before independently qualifying Phase 22 sources;
  and
- keyboard, screen-reader, focus, status, touch, mobile reflow, zoom,
  localization, RTL/CJK, representative-staff usability, PII-free telemetry,
  and cause-owned operational recovery.

Ratification of this planning decision authorizes no implementation, schema,
migration, provider adoption, issue publication, deployment, release
activation, or production change.

## References

- [Phase 23 D14 primary-source research, UX, adversarial review, and proof gates](../prds/sitestacker-parity/research/phase-23-d14-dynamic-source-catalog-research.md)
- [ADR-0145 — Page-local composition, bounded reuse, and coherent Public Site Generations](./0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [ADR-0151 — Semantic Ordinary Section Catalog and additive bounded composition seam](./0151-semantic-ordinary-section-catalog-and-additive-bounded-composition-seam.md)
- [ADR-0152 — Family-qualified semantic Reusable Sections](./0152-family-qualified-semantic-reusable-sections.md)
- [ADR-0153 — Certified Site-bound custom Presentation Packages](./0153-certified-site-bound-custom-presentation-packages.md)
- [ADR-0156 — Bounded Editorial Working Revisions and recoverable active editor](./0156-bounded-editorial-working-revisions-and-recoverable-active-editor.md)
- [ADR-0157 — Exact-revision Scheduled Publication Appointments through D1](./0157-exact-revision-scheduled-publication-appointments-through-d1.md)
- [ADR-0159 — Three bounded Content-list curation strategies](./0159-three-bounded-content-list-curation-strategies.md)
- [ADR-0160 — Link-native Public Page Windows and bounded list discovery](./0160-link-native-public-page-windows-and-bounded-list-discovery.md)
- [Phase 22 specification PR #1323](https://github.com/Asymmetric-al/core/pull/1323)
