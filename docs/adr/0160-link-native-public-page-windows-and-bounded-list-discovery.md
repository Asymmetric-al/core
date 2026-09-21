# ADR-0160: Link-native Public Page Windows and bounded list discovery

**Status:** Accepted (founder-ratified Phase 23 D16 C-prime-R, 2026-08-22)

## Context

ADR-0158 defines source-authoritative Content lists and ADR-0159 resolves each
list to one deterministic, currently public sequence. Visitors still need a
clear way to browse beyond the first set, and tenants need Page links, Load
more, and automatic loading without three query engines, button-only content,
unbounded scroll, combinatorial URLs, per-visitor database state, or a second
publication authority.

## Decision

> **C-prime-amended-and-hardened (C-prime-R) — Multiple independently browsable, Page-local Content-list channels with tenant-selected presentation over one source-authoritative, link-native Public Page Window contract under D1’s sole Site Plan release.** D16 accepts only D15’s final deterministic, currently public sequence and slices it into bounded ordinal windows; it never changes membership, order, featured precedence, exclusions, source safety, public projection, or release authority. Each qualified list stores one versioned `windowing@1` profile in its existing Page or Reusable Section revision—**Show one set**, **Page links** (recommended), **Load more**, or **Auto-load while scrolling** (advanced)—plus one compatible code-bounded items-per-window choice. D1 assigns and preserves one stable, public-safe, Page-placement browse handle that is distinct from every D7 internal section identity, D8 reusable identity, source key, provider/document/record identity, and authorization fact; duplication receives a new handle, removal retires it, and D1 rejects collisions, unsupported source/profile combinations, incompatible presentation packages, and Page-wide work-budget breaches before release. D16 creates no per-visitor database state, result snapshot, pagination table, or second activation state.
>
> The clean Page URL renders every list’s first window. Every valid later window is server-rendered, reachable through real sequential `<a href>` links, and self-canonical at a bounded URL such as `?browse=<public-handle>&page=<positive-ordinal>#<focus-target>`; the fragment assists focus and scroll only and is never identity. One public URL carries at most one exact browse handle and ordinal. Duplicate parameters, arrays, multiple simultaneous list positions, unknown or retired handles, arbitrary limits, non-canonical aliases, and excessive ordinals are rejected before cache or source work. Multiple list regions may still operate independently in the current browser session, and History state may restore bounded secondary presentation state, but refresh, copy, share, crawl, and no-JavaScript behavior guarantee only the one channel named by the URL. An appended view is ephemeral: direct access reopens that channel’s exact ordinal window rather than replaying every previously appended window. A tenant needing several simultaneously durable deep archives uses ordinary D2 archive Pages rather than a combinatorial URL.
>
> Page links use the server URLs directly. **Load more** is button-led but not technically button-only: a real next-window anchor may be styled as a button and progressively enhanced to append the same server result. **Auto-load while scrolling** observes that same anchor and may append only a small code-owned number of windows before pausing for explicit continuation; it uses native scrolling, never hijacks motion or focus, preserves a visible manual Load more fallback, Pause and Skip-past-list actions, footer access, reduced-motion behavior, bounded DOM and request budgets, and ordinary link behavior when JavaScript, observers, or enhancement fail. At launch, no Page may contain more than one automatic-loading list; other lists may independently use Page links or Load more.
>
> One provider-neutral resolver validates trusted Tenant, environment, Site, locale, audience, D1 generation, Page and placement, source-contract version, D14 Selection Intent, D15 curation revision, fixed window size, browse handle, and ordinal; re-proves current source-owned publication and Phase 10 safety; and emits one public DTO window with previous/next state and an optional exact count only when the source certifies that count as safe, current, and cheap. Payload page/limit, database offset or keyset, and upstream cursors remain private replaceable adapter mechanics. Cache identity includes every trusted input; invalidation tags are never isolation; adverse safety narrowing converges first. A list failure is contained to that list, preserves already safe content and a working link fallback, never blind-retries, and emits one cause-owned private diagnostic. Dynamic source changes may move later windows; accumulated presentations suppress duplicate public identities but never freeze or replay content whose present safety can no longer be proved. Tenant presentation packages may vary controls, loading treatment, motion, layout, and visual composition, but never window semantics, access, URL, canonical, cache, limits, or failure policy.

## Consequences

- Every qualified Content list has one versioned `windowing@1` presentation:
  Show one set, Page links, Load more, or bounded Auto-load while scrolling.
  All modes consume the same D15 sequence through the same resolver and public
  window DTO.
- A D1-issued public browse handle belongs to one exact Page placement. It is
  stable across that placement's lineage, never confers access, never exposes
  a provider or document identity, is replaced on duplication, and is retired
  on removal.
- The clean URL renders all first windows. A later URL names one browse handle
  and positive ordinal only; it never persists every list's simultaneous
  position. Secondary session state is presentation convenience, not durable
  public identity.
- Page links are the semantic substrate. Load more and automatic loading are
  progressive enhancements over the same real next-window anchor and retain a
  no-JavaScript and failure-recovery path.
- Automatic loading is finite and controllable: at most one automatic list per
  Page at launch, periodic pause, visible manual continuation, Pause and Skip
  actions, native scrolling, footer reach, reduced-motion behavior, and bounded
  requests and DOM growth.
- D16 stores no visitor position, result snapshot, provider cursor, arbitrary
  limit, copied item, or pagination row. Dynamic windows are current views and
  may move after publication or withdrawal.
- Tenant Presentation Packages may make the interaction look and feel bespoke,
  but cannot alter list semantics, trusted scope, URLs, canonical behavior,
  work limits, cache identity, failure policy, or D1 release authority.
- Counts are optional and appear only when the source contract proves them
  safe, current, and cheap. Provider pagination remains private and replaceable.
- One list's failure is contained locally; safe content and a link fallback
  remain, unsafe content is removed adverse-first, and blind retry is barred.

## Rejected alternatives

- true button-only or scroll-only discovery, because crawlers, no-JavaScript
  clients, assistive technology, and failure recovery require real links;
- independent paging engines for Page links, Load more, and automatic loading,
  because they would duplicate source, cache, failure, analytics, and
  accessibility behavior;
- query parameters for every list's simultaneous position, because they create
  combinatorial crawl, cache, history, analytics, and support states;
- public provider cursors, raw record identifiers, D7 section identities, D8
  reusable identities, or position-derived keys as browse identity;
- unbounded automatic loading, scroll hijacking, hidden footer behavior,
  focus-stealing passive appends, or automatic blind retries;
- per-visitor database state, result snapshots, pagination tables, arbitrary
  staff-controlled page sizes, mandatory exact counts, or a generic feed
  framework; and
- letting D16 reinterpret D15 membership, Phase 10 safety, D2/D3 route
  identity, D9 presentation authority, or D1 release state.

## Implementation proof gates

Implementation remains unauthorized by this ADR. A future authorized change
must prove at minimum:

- strict `windowing@1` normalization, serialization, export, retained-reader,
  successor-migration, unknown-version, and unknown-field behavior;
- property and conformance tests showing every mode traverses the identical
  D15 sequence without gaps, duplicate identities, or repeated Featured items;
- rejection of duplicate, array, combined, unknown, retired, malformed, zero,
  negative, fractional, excessive, or non-canonical parameters before cache or
  source work;
- server-rendered sequential anchors, self-canonical later windows, correct
  Page-one normalization, and full traversal without JavaScript;
- multiple-list interaction, direct-link, refresh, copy/share, Back/Forward,
  hydration, abort, deduplication, retry, final-window, source-change, and
  accumulated-view behavior;
- keyboard, screen-reader, touch, visible-focus, status-announcement, Pause,
  Skip, footer-reach, 320-pixel reflow, zoom, localization, RTL/CJK,
  forced-colors, and reduced-motion behavior;
- cross-Tenant, environment, Site, locale, audience, generation, Page,
  placement, source, intent, curation, and cache isolation plus forged-handle,
  count-leak, timing, and cache-poisoning resistance;
- bounded source, query, count, prefetch, image, concurrency, response, ordinal,
  and accumulated-DOM cost under Pages containing several list regions;
- D1 candidate compatibility and cost validation, D13 execution reproof,
  adverse withdrawal, stale-generation rejection, active-generation
  continuity, and atomic rollback; and
- PII-free typed telemetry that distinguishes empty, exhausted, invalid,
  denied, aborted, stale, unavailable, and failed windows and identifies one
  cause owner and safe next action.

Ratification of this planning decision authorizes no implementation, schema,
migration, provider adoption, issue publication, deployment, D1 activation,
release, or production change.

## References

- [Phase 23 D16 primary-source research, UX, adversarial review, and proof gates](../prds/sitestacker-parity/research/phase-23-d16-dynamic-list-pagination-research.md)
- [ADR-0145 — Page-local composition, bounded reuse, and coherent Public Site Generations](./0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [ADR-0146 — Staged hierarchical public paths](./0146-staged-hierarchical-public-paths-under-coherent-site-generations.md)
- [ADR-0147 — Generation-bound automatic route continuity](./0147-generation-bound-automatic-ordinary-page-route-continuity.md)
- [ADR-0151 — Semantic Ordinary Section Catalog](./0151-semantic-ordinary-section-catalog-and-additive-bounded-composition-seam.md)
- [ADR-0152 — Family-qualified semantic Reusable Sections](./0152-family-qualified-semantic-reusable-sections.md)
- [ADR-0153 — Certified Site-bound custom Presentation Packages](./0153-certified-site-bound-custom-presentation-packages.md)
- [ADR-0158 — Versioned Dynamic Source Catalog and Content List](./0158-versioned-dynamic-source-catalog-and-content-list.md)
- [ADR-0159 — Three bounded Content-list curation strategies](./0159-three-bounded-content-list-curation-strategies.md)
- [Phase 22 specification PR #1323](https://github.com/Asymmetric-al/core/pull/1323)
