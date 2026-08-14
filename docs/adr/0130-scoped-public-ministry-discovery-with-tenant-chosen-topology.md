# ADR-0130: Scoped Public Ministry Discovery with Tenant-Chosen Topology

**Status:** Accepted (founder ruling, Phase 22 grill session - D13)

## Context

Phase 22 needs a safe public way for supporters to discover current Missionary
Ministry and Project/Campaign pages. Mission organizations use both combined
worker/project finders and distinct Missionary and Project destinations, so a
tenant needs a small presentation choice without inheriting two catalogs or two
search systems.

The existing `/workers` prototype cannot become authority as-is. It loads a mock
worker corpus into the browser, searches fields such as full location and
description client-side, derives filters and progress from mock data, and uses
exact-map and `public.locations` seams that lack the complete Tenant, Legal
Entity, Site, locale, release, route, and Phase 10 safety coordinates required
for this public identity surface. Independently configured family catalogs or a
second directory-visibility switch would add more drift and disclosure risk.

D2 already owns current Publication Reach, Phase 10 owns the per-egress safety
ceiling, D8 and Phase 5 own route lifecycle and public request resolution, and
D6/D7 own optional progress and Giving capabilities. D13 must make eligible
pages discoverable without becoming a competing authority for any of those
facts.

## Decision

> **C-prime-amended-and-hardened (C-prime-R) — one versioned, exact Tenant,
> Legal Entity, environment, Site, and locale-scoped Public Ministry Discovery
> Profile choosing exactly one active presentation topology—Together by quiet
> built-in default or tenant-selected Separate by Page Family—over one
> source-complete, generation-bound Public Ministry Directory Projection, one
> bounded server query contract, and one family-typed public card contract.
> Membership is derived only from the exact current D2 `Listed publicly` Page
> Release after current Phase 10 ceiling and containment proof; combined and
> separate presentations never create independent membership, index, search,
> cache, card, or inclusion authority, and every separate route applies its
> family constraint server-side. The projection preserves exact release,
> reach, safety, route, media, optional progress, optional Giving-capability,
> profile, locale, source, coverage, and as-of generations while exposing and
> indexing only approved public card fields; it uses deterministic ordering,
> explicitly pinned locale search behavior, bounded allowlisted filters without
> hidden facet counts, tenant-fair limits, generation-bound opaque keyset
> cursors and cache keys, complete-cohort shadow rebuilds, atomic current-head
> activation, and affected-positive-first adverse removal. One accessible,
> quiet Directory setup lets staff choose Together or Separate, preview exact
> routes, labels, cards, mobile behavior, current included pages, and privately
> explained source-owned exclusions, while Listed pages enter automatically and
> healthy tenants perform no page-by-page maintenance. Visitors receive
> scope-honest labelled GET search, persistent queries, semantic typed results,
> polite status messages, stable empty/error states, and optional D6 progress
> or D7 Give actions only by current reference; a topology change alters neither
> page reach nor safety, review, content, progress, Giving, external indexing,
> or removal truth. Phase 5 remains authoritative for public request resolution,
> D8-compatible route dispositions and one non-conflicting canonical/sitemap
> manifest govern topology changes, and external crawler removal remains an
> observed best-effort outcome—without concurrent combined and separate
> catalogs, a second visibility switch, per-page directory toggles, client-side
> scope or filtering authority, raw operational/CMS/`locations` reads,
> anonymous raw tables or Realtime, separate family indexes, arbitrary search
> fields, taxonomy or query DSLs, predictive autocomplete, fuzzy or hidden
> synonym expansion, maps or exact coordinates, hidden-result placeholders or
> counts, popularity/financial/progress/urgency ranking, OFFSET pagination,
> unsafe locale or source fallback, mutable current rows, destructive rebuild,
> dual-read migration, or any claim that released, listed, searchable,
> Giving-ready, externally indexed, locally removed, and externally de-indexed
> are the same fact.**

## Consequences

- Each exact Tenant, Legal Entity, environment, Site, and locale has one
  immutable Discovery Profile Version and one active topology. **Together** is
  the quiet default; **Separate by Page Family** creates thin Missionaries and
  Projects views over the same membership, projection, search, and card
  authority.
- D2 `Listed publicly` reach after current Phase 10 proof is the sole ordinary
  discovery membership rule. Directory settings cannot include a link-only,
  private, missing-locale, withdrawn, retired, contained, or otherwise
  ineligible release.
- One complete immutable generation contains exactly one typed row for every
  eligible release and zero rows for every ineligible release. Staff may inspect
  private source-owned exclusion reasons; the public receives no placeholder,
  facet, count, or existence hint for excluded records.
- Separate routes apply an exact server-owned Page Family constraint. Client
  parameters, cursors, IDs, components, or caches cannot establish or widen
  Tenant, Site, locale, family, membership, or safety scope.
- Search indexes only admitted public card fields. It excludes legal and
  operational identities, exact locations, internal identifiers, donor/support
  facts, raw CMS documents, and private diagnostics from the index and every
  public egress surface.
- Search uses an explicitly pinned locale configuration or declared literal
  token mode, bounded plain-text input, deterministic relevance/order, signed
  generation-bound keyset cursors, complete cache coordinates, and tenant-fair
  limits. There is no unsafe source-language fallback, predictive autocomplete,
  arbitrary query language, hidden synonym expansion, or OFFSET authority.
- A complete next generation is shadow-built, reconciled, and activated by an
  idempotent CAS current-head change. D2/Phase 10 narrowing removes affected
  positive rows and caches before or atomically with broader rebuilding; stale
  mocks, CMS data, operational tables, or old generations never become fallback.
- Staff operate one accessible two-choice setup with exact route and consequence
  preview. Visitors receive scope-honest labelled GET search, semantic typed
  results, retained queries, and explicit empty, degraded, and error states.
  Healthy tenants perform no page-by-page directory maintenance.
- D6 progress and D7 Give actions degrade independently. Missing either removes
  only that capability; it never changes directory membership or fabricates a
  financial or Giving outcome.
- One active topology produces the canonical navigation and sitemap surface.
  A topology change is not a reach, safety, review, content, Giving, external
  indexing, or external de-indexing occurrence.
- Production authorization requires complete scope/coverage, RLS and service-
  boundary, safety race, cache/cursor, locale/query-abuse, privacy-egress,
  accessibility, SEO/route, tenant-fair load, migration, failure, containment,
  and recovery proof.

## Considered options

- **One combined directory only.** Operationally simple, but unnecessarily
  prevents tenants whose donor experience requires distinct Missionaries and
  Projects destinations.
- **Independent Missionary and Project directories and search systems.**
  Rejected because duplicated membership, indexes, RLS, caches, cards, and
  maintenance would drift and create cross-scope disclosure risk.
- **One projection with tenant-chosen Together or Separate presentation.**
  Accepted because it supports both proven information architectures while
  retaining one membership, safety, query, projection, and cache authority.
- **Per-page `Show in directory` controls.** Rejected because they create a
  second visibility system that can contradict D2 reach and Phase 10 safety.
- **Client-side catalog filtering or raw Supabase/Realtime reads.** Rejected
  because the browser cannot own tenant/family scope and raw rows can leak
  protected fields, stale positives, or cross-tenant data.
- **Maps, exact locations, fuzzy matching, predictive autocomplete, arbitrary
  facets/taxonomies, popularity or financial ranking, and external search at
  launch.** Rejected as disproportionate privacy and operational complexity for
  the bounded donor discovery task.

## Related decisions

- [ADR-0118 - Typed Public Ministry Pages and explicit contributor assignments](./0118-typed-public-ministry-pages-and-explicit-contributor-assignments.md)
- [ADR-0119 - Phase-10-ceiling-resolved Publication Reach](./0119-tenant-defaulted-phase-10-ceiling-resolved-publication-reach.md)
- [ADR-0120 - Family-certified Public Page Presentation Profiles](./0120-family-certified-public-page-presentation-profiles.md)
- [ADR-0123 - Page-resolved source-authoritative Public Support Progress](./0123-page-resolved-source-authoritative-public-support-progress.md)
- [ADR-0124 - One exact Page Giving Binding for the Phase 22 MVP](./0124-one-exact-page-giving-binding-for-phase22-mvp.md)
- [ADR-0125 - Source-qualified Public Page route dispositions](./0125-source-qualified-public-page-route-dispositions.md)
- [ADR-0126 - Release-bound Public Ministry Media Assets](./0126-release-bound-public-ministry-media-assets.md)
- [Phase 5 public website runtime contract](../prds/sitestacker-parity/phase-05-public-website-runtime-contract.md)
- [Phase 10 sensitive-data safety](../prds/sitestacker-parity/phase-10-sensitive-data-safety.md)
- [Phase 22 decision log](../prds/sitestacker-parity/phase-22-public-ministry-pages-decision-log.md)
- [Phase 22 D13 research and adversarial review](../prds/sitestacker-parity/phase-22-public-ministry-pages-research-evidence.md#29-ratified-d13-adversarial-review--one-authority-tenant-chosen-directory-topology)
