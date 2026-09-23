# Phase 23 D16 Public Page Window research

- **Status:** Founder-ratified Phase 23 D16 C-prime-amended-and-hardened
  (C-prime-R) on 2026-08-22.
- **Date:** 2026-08-22
- **Authority:** Research and decision support only. The exact ratified
  authority is preserved in the Phase 23 decision log and ADR-0160. This
  document does not authorize implementation, schema work, migration, provider
  adoption, issue publication, deployment, D1 activation, or production
  change.
- **Scope:** How a D14 Content list exposes additional public result windows
  after D15 has produced one bounded deterministic sequence, including Page
  links, button-led Load more, bounded automatic loading, multiple independently
  operable list regions, URLs, SEO, accessibility, caching, provider paging,
  failure behavior, and Web Studio UX.
- **Inherited boundary:** D1-D15, Phase 10, Phase 22, and every source-owning
  phase remain authoritative for the facts they already own. D16 may window
  D15's result. It may not reinterpret membership, safety, curation, Page
  identity, route ownership, or publication authority.

## Executive finding

The founder's flexibility objective is valid, but the literal implementation
must not create four data engines or a query parameter for every list at once.
The durable design is **many independently usable list regions, one active
browse channel per public URL, and one crawlable server-window substrate under
every presentation style**.

The founder-ratified decision is:

> **C-prime-amended-and-hardened (C-prime-R) — Multiple independently
> browsable, Page-local Content-list channels with tenant-selected presentation
> over one source-authoritative, link-native Public Page Window contract under
> D1’s sole Site Plan release.** D16 accepts only D15’s final deterministic,
> currently public sequence and slices it into bounded ordinal windows; it
> never changes membership, order, featured precedence, exclusions, source
> safety, public projection, or release authority. Each qualified list stores
> one versioned `windowing@1` profile in its existing Page or Reusable Section
> revision—**Show one set**, **Page links** (recommended), **Load more**, or
> **Auto-load while scrolling** (advanced)—plus one compatible code-bounded
> items-per-window choice. D1 assigns and preserves one stable, public-safe,
> Page-placement browse handle that is distinct from every D7 internal section
> identity, D8 reusable identity, source key, provider/document/record identity,
> and authorization fact; duplication receives a new handle, removal retires
> it, and D1 rejects collisions, unsupported source/profile combinations,
> incompatible presentation packages, and Page-wide work-budget breaches
> before release. D16 creates no per-visitor database state, result snapshot,
> pagination table, or second activation state.
>
> The clean Page URL renders every list’s first window. Every valid later
> window is server-rendered, reachable through real sequential `<a href>`
> links, and self-canonical at a bounded URL such as
> `?browse=<public-handle>&page=<positive-ordinal>#<focus-target>`; the fragment
> assists focus and scroll only and is never identity. One public URL carries
> at most one exact browse handle and ordinal. Duplicate parameters, arrays,
> multiple simultaneous list positions, unknown or retired handles, arbitrary
> limits, non-canonical aliases, and excessive ordinals are rejected before
> cache or source work. Multiple list regions may still operate independently
> in the current browser session, and History state may restore bounded
> secondary presentation state, but refresh, copy, share, crawl, and
> no-JavaScript behavior guarantee only the one channel named by the URL. An
> appended view is ephemeral: direct access reopens that channel’s exact
> ordinal window rather than replaying every previously appended window. A
> tenant needing several simultaneously durable deep archives uses ordinary D2
> archive Pages rather than a combinatorial URL.
>
> Page links use the server URLs directly. **Load more** is button-led but not
> technically button-only: a real next-window anchor may be styled as a button
> and progressively enhanced to append the same server result. **Auto-load
> while scrolling** observes that same anchor and may append only a small
> code-owned number of windows before pausing for explicit continuation; it
> uses native scrolling, never hijacks motion or focus, preserves a visible
> manual Load more fallback, Pause and Skip-past-list actions, footer access,
> reduced-motion behavior, bounded DOM and request budgets, and ordinary link
> behavior when JavaScript, observers, or enhancement fail. At launch, no Page
> may contain more than one automatic-loading list; other lists may independently
> use Page links or Load more.
>
> One provider-neutral resolver validates trusted Tenant, environment, Site,
> locale, audience, D1 generation, Page and placement, source-contract version,
> D14 Selection Intent, D15 curation revision, fixed window size, browse handle,
> and ordinal; re-proves current source-owned publication and Phase 10 safety;
> and emits one public DTO window with previous/next state and an optional exact
> count only when the source certifies that count as safe, current, and cheap.
> Payload page/limit, database offset or keyset, and upstream cursors remain
> private replaceable adapter mechanics. Cache identity includes every trusted
> input; invalidation tags are never isolation; adverse safety narrowing
> converges first. A list failure is contained to that list, preserves already
> safe content and a working link fallback, never blind-retries, and emits one
> cause-owned private diagnostic. Dynamic source changes may move later
> windows; accumulated presentations suppress duplicate public identities but
> never freeze or replay content whose present safety can no longer be proved.
> Tenant presentation packages may vary controls, loading treatment, motion,
> layout, and visual composition, but never window semantics, access, URL,
> canonical, cache, limits, or failure policy.

This formulation supports every requested visitor experience while refusing
three unsafe translations of the request:

1. **Button-led is supported; button-only discovery is not.** Search crawlers
   generally do not click buttons or trigger scrolling.
2. **Multiple list regions are independent; their durable URL positions are
   not combined.** Three ten-page lists would otherwise create 1,000 Page
   variants before locale, Site, or release dimensions.
3. **Automatic loading is supported; literally endless scroll is not.** It
   periodically pauses so visitors can regain position, control data use, and
   reach the footer.

## Current primary-source evidence

### Google Search Central

Google's current
[pagination and incremental loading guidance](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading)
recognizes Pagination, Load more, and Infinite scroll as visitor patterns. It
also states that Google generally discovers URLs from anchor `href` values,
does not click buttons, and generally does not trigger user-action JavaScript.
Its concrete requirements are decisive for D16:

- each later result window needs a unique persistent URL;
- windows link sequentially through real anchors;
- each paginated window is self-canonical rather than canonicalized to page
  one;
- fragments do not identify result pages; and
- `rel="next"` and `rel="prev"` are not Google indexing signals.

Therefore Load more and automatic loading can be presentation enhancements,
but neither may be the only discovery path.

### Accessibility guidance

The [WAI-ARIA feed pattern](https://www.w3.org/WAI/ARIA/apg/patterns/feed/)
explains that automatically loading content establishes a substantial
interoperability contract among focus, assistive-technology reading modes,
scrolling, article position, and busy state. It explicitly notes the lack of
an established desktop keyboard convention. D16 should retain native
`section`, heading, list, article, link, and status semantics for ordinary card
lists; it must not add `role="feed"` unless a presentation package has been
separately qualified for the complete pattern.

[GOV.UK's Pagination guidance](https://design-system.service.gov.uk/components/pagination/)
says to paginate only when it improves performance or usability and advises
against automatic infinite scrolling because it causes problems for keyboard
users. [USWDS](https://designsystem.digital.gov/components/pagination/) uses a
labelled navigation landmark, links, `aria-current`, responsive controls, and
adequate interactive targets. These are the safe Page-links baseline.

WordPress.com currently offers either automatic loading or a clickable Load
more treatment for supported classic themes, but disables automatic loading
when footer widgets would become unreachable. That is direct product evidence
for periodic pause and guaranteed footer access, not an argument for an
unbounded mode.

### Payload and Next.js

[Payload pagination documentation](https://payloadcms.com/docs/queries/pagination)
provides numeric `page`, `limit`, count, and previous/next metadata. Those are
provider primitives, not a public product contract. A future source can use a
private cursor or keyset without changing D16's URLs or stored intent.

The exact bundled Next.js documentation available in the current checkout
confirms that a Server Component Page should read `searchParams` when they
drive database pagination, that doing so makes the outer Page request-time
dynamic, that cached inner functions can still key on explicit arguments, and
that native History `pushState` and `replaceState` integrate with the App
Router. The repository manifests pin Next.js `16.3.0-preview.9`, while the
current root and app installations resolve `16.2.6`; implementation must run
the frozen install and re-read that exact build's bundled documentation before
coding. Payload manifests and the app installation resolve
`4.0.0-internal.1f9ae9a`.

## Repository evidence and authority boundaries

### D1-D15

- D1 remains the sole Site Plan release and rollback authority. Changing a
  list's browse mode, items per window, or public handle requires a new
  candidate release; browsing never advances a serving head.
- D2/D3 own Page paths and automatic same-Page continuity. D16 uses query
  state, not synthetic `/page/2` child paths; fragments are focus hints only.
- D7's internal section identity is expressly forbidden from becoming a public
  URL. D16 therefore needs a separate public-safe handle rather than leaking
  a block id.
- D8 allows the same reusable subject in more than one valid placement. The
  public handle is Page-placement-qualified; a shared subject is not a URL
  key.
- D9 and D10 allow certified tenant-specific presentation but cannot alter data
  access, URLs, window membership, or cache identity.
- D12 owns recoverable editorial work; a rejected D1 candidate leaves the
  active Page unchanged.
- D13 pins the exact candidate revision for a scheduled release and re-proves
  D16 compatibility at execution.
- D14 owns source qualification, public DTOs, filters, deterministic total
  ordering, limits, safety, query/index/cost bounds, cache dimensions, and
  adapter conformance.
- D15 owns exact curation membership and order. D16 slices only its final
  logical sequence and must not repeat Featured items per window.

### Current implementation gaps

The present runtime is useful evidence but is not D16-ready:

- `apps/donor/app/(public)/(solid)/[...cmsSlug]/page.tsx` accepts only `params`,
  not `searchParams`, and emits no Page/window-specific canonical.
- `apps/admin/src/cms/collections/page-builders.ts` has no D14 Content-list
  block yet.
- `packages/api/src/cms/public/reader.ts` has the correct additive fail-closed
  public-reader seam but no provider-neutral list-window operation.
- `packages/api/src/cms/public/context.ts` currently carries tenant ids and a
  reserved `siteId`, not D14's complete environment, Site, locale, audience,
  and release-generation context.
- `packages/api/src/cms/public/cache-tags.ts` correctly says tags are
  invalidation only. Its present scope cannot substitute for the complete D16
  cache key.
- `apps/admin/src/cms/public/published-content-reader.ts` correctly uses
  `overrideAccess: false`, but its update list is count-free,
  `pagination: false`, and sorted only by `-publishedAt`; D14/D15 need a unique
  final tie-breaker before D16 can window it safely.
- the donor app currently has no sitemap or robots runtime file for D16's
  indexable Page-window series.

These are prerequisites for later implementation, not reasons to weaken the
decision or authorize code now.

## Product and technical contract

### Stored intent without database burden

The existing owning Page or Reusable Section revision stores one small typed
branch. D1 separately compiles and carries one public handle for each exact
Page placement, because a Reusable Section can appear on several Pages or more
than once on one Page:

```text
windowing@1
  presentation: one-set | page-links | load-more | auto-load
  itemsPerWindow: one source/profile-qualified code-owned choice

D1 compiled Page placement
  publicBrowseHandle: one D1-issued stable public-safe placement handle
```

It does not store provider cursors, source rows, total counts, visitor
positions, loaded item identities, per-visitor sessions, scroll offsets,
snapshots, or analytics events. Runtime browsing lives in the request URL and
bounded browser History state. This requires no new pagination table.

### One resolver, four presentations

The resolver input is the exact trusted scope plus ordinal; the output is a
provider-neutral public window:

```text
PublicListWindow<T>
  items
  ordinal
  itemsPerWindow
  hasPrevious
  hasNext
  previousOrdinal?
  nextOrdinal?
  exactTotal?       # only if source-qualified
```

Page links replace one window. Load more and automatic loading append that
same result. The renderer deduplicates accumulated items by D14's stable public
identity to contain live-list drift, but it never treats deduplication as
permission to surface an item that fails current safety.

### URL and canonical contract

- The clean Page URL represents every list's first window.
- A later window uses exactly one allowlisted browse handle and one canonical
  base-10 positive integer ordinal.
- `page=1` redirects to the clean Page URL. Unknown, retired, duplicate,
  combined, malformed, negative, fractional, scientific-notation, oversized,
  or out-of-bound requests fail with a bounded not-found response and a safe
  link to the Page's clean URL.
- Every valid later window server-renders the named list window and the first
  window of other lists, links sequentially, and self-canonicalizes.
- The `#focus-target` may move the viewport/focus to the list but is excluded
  from canonical identity.
- Presentation packages cannot rename query keys or create path-based,
  fragment-only, provider-token, filter, sort, or arbitrary limit variants.

### Multi-list behavior

Several lists may independently use Page links or Load more on one Page. Each
has a unique labelled region, heading, control name, and public browse handle.
The browser may retain already appended secondary windows during the current
session. Only the most recently activated list becomes the URL's active browse
channel. Back/Forward restores bounded interaction state when still available;
a refresh or shared URL opens the named list's exact ordinal window—not the
entire previously accumulated DOM—and resets other lists to their first
windows. Explicit Page-link and Load-more actions may add a History entry;
passive automatic-window changes replace the current entry so Back does not
require replaying every scroll boundary.

This is a deliberate honesty boundary. Encoding every simultaneous position
would multiply crawl, cache, analytics, support, and testing states. If a
tenant needs separately shareable deep archives, Web Studio guides staff to
create ordinary D2 archive Pages using the same D14/D15 Selection Intent—no
content copy and no hidden synthetic route.

### Staff UX

The Web Studio setting is **How visitors browse more**, not “pagination
strategy.” It appears only when the source and presentation package qualify
more than one window.

| Choice                                   | Staff-facing explanation                                                                                                                                     |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Show one set**                         | “Show this section's configured maximum with no more-results control.”                                                                                       |
| **Page links — Recommended**             | “Give visitors clear Previous, Next, and optional page-number links. Best for archives and precise navigation.”                                              |
| **Load more**                            | “Visitors select Load more to add the next set without losing their place. The same control still opens the next Page when enhanced loading is unavailable.” |
| **Auto-load while scrolling — Advanced** | “Add a few sets as visitors approach the end, then pause for them to continue. Visitors can pause sooner or skip past the list.”                             |

Staff then see only compatible **Items per set** choices and an actual-data
preview. Preview covers first, middle, final, empty, slow, failure, mobile,
keyboard, reduced-motion, and multiple-list states. It states calmly that
newly published or withdrawn records can move later windows. It does not expose
cursors, canonical controls, query strings, History APIs, automatic-load
counts, cache settings, or provider terminology.

If another list already owns the one launch automatic-loading slot, the option
is disabled with a plain explanation and a direct **Use automatic loading here
instead** action; it never silently changes the other list.

### Public UX and accessibility

**Page links** use a uniquely labelled `<nav>`, native anchors, full Previous
and Next text, `aria-current="page"`, visible Core focus treatment, at least a
44 CSS-pixel practical touch target, and responsive number collapse. Numbers
and “of N” copy appear only when an exact count is qualified; otherwise
Previous/Next is complete and honest. The control disappears for one window.

**Load more** renders a real next-window anchor with button styling. When
enhancement succeeds, it appends the result, updates the active channel URL,
moves focus after the explicit user action to the first newly added item
heading, and announces a concise status such as “12 more updates loaded; 24
shown.” Failure preserves existing content and offers **Try again** and **Open
the next page**. No blind retry occurs.

**Auto-load while scrolling** uses the same anchor and result. It never steals
focus, intercepts the user's scroll, or depends on animation. The region
announces a throttled loading/result status, sets and clears `aria-busy`, offers
visible Pause, Skip past this list, and Load more controls, and pauses after a
small code-owned number of automatic windows (initially two). Reduced-motion
does not disable data access; it removes non-essential transition treatment.
The append/DOM budget eventually falls back to link navigation rather than
growing indefinitely.

All modes preserve meaningful headings, natural DOM order, zoom/reflow, RTL,
locale copy, keyboard operation, footer access, and a no-JavaScript path.

### Failure, safety, and recovery

- One list failure does not blank an otherwise safe Page.
- Empty, exhausted, unavailable, denied, stale-generation, invalid-window,
  aborted, and transport-failed are distinct typed outcomes.
- A superseded request is aborted or ignored by exact request identity.
- Retry is idempotent and deduplicated; an observer cannot append a window
  twice.
- Current publication and Phase 10 safety are re-proved for every response.
  An adverse change removes unsafe content before favorable freshness work.
- Previously loaded safe content remains visible on a transient next-window
  failure, but no stale item survives when current safety cannot be proven.
- D1 rollback restores the prior complete generation; it never destructively
  rewrites browsing history or source data.

### Cache, performance, and abuse resistance

Validation happens before cache or provider work. Cache identity includes
Tenant, environment, Site, locale, audience, D1 generation, Page identity,
placement/public handle, source and contract version, canonical Selection
Intent and curation revision, safety/publication generation, renderer/package
generation, ordinal, and fixed window size. Tags remain invalidation handles,
not isolation.

Code-owned limits cover lists per Page, one automatic list, items per window,
maximum ordinal, automatic append count, accumulated DOM windows, concurrent
requests, and Page-wide initial/continuation cost. Only adjacent windows may be
prefetched, and automatic loading cannot trigger parallel source/image storms.
Exact counts are optional. Deep ordinal support is source-qualified against
real query plans; a Payload offset, keyset, or external cursor remains private.

## Ruthless adversarial review

Every category has a material concern. This is not a rejection of the option;
it is why the constraints above are part of the permanent design.

| Category                         | Concern? | What could go wrong, why it matters, and evidence                                                                                                                                                                                                                                  | Severity / likelihood | Permanent fix or prevention                                                                                                                                                                           |
| -------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                      | **Yes**  | JavaScript, IntersectionObserver, History restoration, dynamic source membership, and several list regions can diverge. A scroll-only design fails when enhancement is absent, and new/withdrawn records can shift later windows. Google and WAI both identify these dependencies. | High / Medium-high    | One server-rendered linked-window contract for every mode; no-JavaScript fallback; deterministic D15 order; current-not-snapshot copy; browser and race tests.                                        |
| Technical debt                   | **Yes**  | Independent pagination, Load more, and infinite-scroll engines would duplicate source, cache, error, analytics, and accessibility logic. The repo has no D14 list seam yet, so ad hoc UI fetches would harden the wrong boundary.                                                  | High / High           | One `windowing@1` branch, resolver, DTO, error union, URL builder, and renderer family; presentation is the only mode-specific layer.                                                                 |
| Edge cases                       | **Yes**  | Zero/one/exact-boundary items, removed list handles, same source twice, a reusable section twice, duplicate query keys, JS disabled, offline append, Back during fetch, locale switch, source withdrawal, and tied sort values are realistic.                                      | High / High           | Explicit state table; D1 handle collision checks; strict parser; unique order tie-breaker; abort/dedupe; first/middle/end/invalid/no-JS/history tests.                                                |
| Footguns                         | **Yes**  | A true button, arbitrary page size, public cursor, position-derived key, multiple simultaneous query parameters, unlimited automatic appends, or broad `overrideAccess` can silently harm discovery, cost, or safety.                                                              | High / High           | Real anchors; separate immutable public handles; catalog choices and code-owned bounds; one active channel; `overrideAccess: false`; compiler rejection.                                              |
| Tenant safety                    | **Yes**  | A browser-supplied handle combined with incomplete context or an underspecified cache key could return another Tenant, Site, locale, audience, Page, or generation. An opaque handle is not authorization.                                                                         | Critical / Medium     | Resolve trusted scope first; allowlist the handle only inside the active Page generation; retain Payload access/RLS; include full scope in cache key; negative cross-scope tests.                     |
| Overengineering                  | **Yes**  | Persisting all list positions, visitor snapshots, custom cursors, tenant-controlled auto-load counts, or every UI combination would create a workflow matrix and database burden.                                                                                                  | High / High           | Four plain choices over one contract; no visitor persistence or snapshot table; one URL channel; source/code-owned limits; ordinary archive Pages for durable parallel archives.                      |
| UX/UI and friction               | **Yes**  | Endless content causes fatigue, uncertain position, mobile data cost, footer loss, and keyboard barriers; dense page numbers and technical staff settings create confusion. Google, GOV.UK, WAI, WordPress, and USWDS support these concerns.                                      | High / High           | Page-links default; button-led Load more; periodic auto-load pause; Pause/Skip/manual fallback; compact controls; actual-data preview; plain-language setting and honest share behavior.              |
| Hidden coupling                  | **Yes**  | D16 could accidentally own D15 membership, provider cursor shapes, D2 paths, D3 redirects, D9 presentation, Next.js routing, or cache invalidation. A provider upgrade could then change public behavior.                                                                          | High / Medium         | Provider-neutral post-D15 window port; explicit ownership table; query state never Page identity; presentation cannot alter semantics; conformance tests across adapters.                             |
| Failure modes                    | **Yes**  | An observer can loop, a request can partially append or arrive stale, a list error can crash the Page, and blind retry can multiply cost. Users may mistake failure for “no more.”                                                                                                 | High / Medium         | Typed list-local outcomes; preserve safe content; exact request id, abort/dedupe, idempotent manual retry, working next-page link, no blind retry, cause-owned diagnostics.                           |
| Data integrity                   | **Yes**  | Concurrent publishing can create duplicate/omitted appearances between live ordinal windows, and a non-unique sort such as current `-publishedAt` makes results unstable. This is presentation inconsistency even if source rows remain intact.                                    | High / Medium         | D14 unique total order; D15 property invariants; stable public-identity dedupe in accumulated DOM; state explicitly current, not historical snapshot; re-prove adverse safety.                        |
| Security and privacy             | **Yes**  | Huge ordinals, forged handles, duplicated parameters, count timing, raw query logging, public provider tokens, or cached private DTO fields enable abuse or disclosure.                                                                                                            | Critical / Medium     | Parse and bound before work; allowlisted handles; no public cursor/private id; exact DTO; optional safe counts; redacted bounded-cardinality telemetry; penetration and cache-poisoning tests.        |
| Scalability and performance      | **Yes**  | Several lists can create parallel queries, count work, prefetch storms, image downloads, deep-offset degradation, and unbounded DOM growth. It may work for a small tenant and fail at archive scale.                                                                              | High / Medium-high    | Page-wide cost/concurrency/DOM budgets; one auto-load list; adjacent-only fetch; optional counts; qualified query plans/indexes; bounded ordinal; private keyset/cursor substitution.                 |
| Operational burden               | **Yes**  | Four modes, transient versus shareable state, source capability differences, and failed windows could demand tribal knowledge and developer support.                                                                                                                               | Medium / Medium       | Recommended default; contextual option availability; accurate preview; release consequence summary; stable safe diagnostics; no provider/query/cache controls in Web Studio.                          |
| Observability gaps               | **Yes**  | Exhausted, empty, invalid, denied, aborted, timeout, cache miss, stale generation, and source failure can otherwise look identical, making incidents and donor-visible failures hard to diagnose.                                                                                  | High / Medium         | Typed reason codes and safe metrics by Page/handle/mode/ordinal; latency/cache/failure/append-depth measures; no donor identity or raw query values; cause-owned alerting.                            |
| Dependency and integration risks | **Yes**  | Next.js request-time rendering, prefetch and History behavior; browser observers; Payload pagination/access defaults; and future cursor sources differ. The manifest/install Next version mismatch proves version drift is realistic.                                              | High / Medium         | Standards-first links/HTML; frozen dependency install; read exact bundled docs before code; explicit `overrideAccess: false`; adapter qualification; browser/AT/version test matrix.                  |
| Migration and upgrade risks      | **Yes**  | Reordering/duplicating sections, renaming labels, changing size/mode, retiring a source, or exposing provider tokens could break old URLs and caches.                                                                                                                              | High / Medium         | Separate stable public handle preserved across placement lineage; new handle on duplication; D1 consequence/compatibility reader; clean retirement behavior; provider-neutral URLs and DTO.           |
| Other development hazards        | **Yes**  | Hydration races, duplicate observer callbacks, stale responses after navigation, analytics double counting, unsafe rollback, focus jumps, and insufficient tests are not covered by simple happy-path paging.                                                                      | High / Medium         | Generation-bound request identity; AbortController/dedupe; one page-view/window-event model; D1 atomic rollback; public-seam property, integration, E2E, accessibility, performance, and chaos tests. |

## Ruthless synthesis and ordered path

### Must be fixed in the decision and specification now

1. **Freeze authority first.** D16 consumes D15 output and owns only public
   windowing and presentation. D1 remains the only release.
2. **Adopt one provider-neutral window contract.** All four staff choices use
   the same resolver, DTO, error model, and link URL.
3. **Make every continuation link-native.** This is the permanent SEO,
   accessibility, no-JavaScript, and recovery substrate. “Button-only” is
   visual language, not technical discovery.
4. **Support multiple lists without combinatorial URLs.** Use a distinct
   D1-issued public placement handle and only one active handle per URL;
   secondary state is bounded and ephemeral. Use ordinary archive Pages for
   several durable deep collections.
5. **Bound automatic loading.** One automatic list per Page, native scrolling,
   periodic pause, manual fallback, skip path, footer access, reduced motion,
   and finite DOM/request budgets.
6. **Complete trusted scope and deterministic order before windowing.** The
   current route, request context, cache identity, list catalog, canonical
   metadata, and update tie-breaker are prerequisites, not shortcuts.
7. **Specify failure and recovery as product behavior.** Contain failure to one
   list, preserve safe content, avoid blind retries, and converge adverse
   safety first.

### Must be proven before shipping

1. Property tests prove every mode emits the same D15 sequence without gaps,
   duplicate identities, or repeated Featured items across windows.
2. Parser tests reject duplicate/array/combined/unknown/retired/malformed/
   excessive handle and ordinal values before cache or provider calls.
3. Rendered-HTML and no-JavaScript tests prove every later window and item is
   discoverable through sequential real anchors and correct self-canonicals.
4. Browser tests cover multiple independent list interactions, direct links,
   Back/Forward, refresh, copied URLs, hydration, cancellation, retry, removal,
   final windows, and Page-one normalization.
5. Keyboard, screen-reader, touch, 320 CSS-pixel reflow, 200%/400% zoom, RTL,
   reduced-motion, visible focus, status announcements, skip behavior, and
   footer reach pass manual and automated checks.
6. Cross-Tenant/Site/locale/audience/environment/generation/source/handle
   isolation and cache-poisoning tests prove fail-closed behavior.
7. Performance tests enforce query, count, prefetch, concurrency, response,
   image, and accumulated-DOM budgets under several list regions.
8. D1 candidate validation, scheduled execution reproof, adverse withdrawal,
   active-generation continuity, and atomic rollback are exercised.

### Address soon after launch

- Measure safe bounded metrics for window latency, cache hits, invalid
  ordinals, source failure, duplicate suppression, automatic append depth,
  Load more use, Page-link use, archive transitions, retry, and footer reach.
- Qualify or replace any private provider paging strategy that degrades on deep
  windows without changing the public contract.
- Review real tenant configuration and visitor usability evidence before
  changing code-owned page sizes or append budgets.

### Monitor; do not prebuild

- Whether tenants demonstrably need several simultaneous list positions in a
  single shareable URL. Until evidence outweighs crawl/cache/UX cost, ordinary
  archive Pages are the permanent simple answer.
- Crawl waste from deep windows, pages with several expensive lists, mobile
  abandonment, accessibility feedback, and support confusion.
- No personalization, saved visitor position, arbitrary filter/sort builder,
  public cursor, tenant-authored URL grammar, or infinite-feed framework is in
  D16.

## Ratified founder decision

**How should visitors browse beyond a D15 Content list's first set while
allowing several lists on one Page?**

- **A — One set only:** simplest, but does not satisfy the selected flexibility.
- **B — Independent client controls:** flexible-looking but not crawlable,
  shareable, or reliable without JavaScript.
- **C-prime-R — Multiple independently browsable Page-local channels over one
  link-native Public Page Window contract — Recommended:** Page links, Load
  more, and bounded automatic loading share one server URL/resolver; one active
  channel per URL prevents combinations.
- **D — Persist every list position:** maximal state, but creates combinatorial
  URLs, cache/crawl growth, confusing history, and disproportionate debt.

The founder ratified the exact C-prime-R formulation in the Executive finding
as Phase 23 D16 on 2026-08-22. Ratification records the product and
architecture decision only. It authorizes no implementation, schema,
migration, provider adoption, issue publication, deployment, D1 activation, or
production change.

## Primary and repository sources

- [Google Search Central — Pagination, incremental page loading, and impact on Search](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading)
- [WAI-ARIA Authoring Practices — Feed pattern](https://www.w3.org/WAI/ARIA/apg/patterns/feed/)
- [WAI WCAG 2.2 — Focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)
- [WAI WCAG 2.2 — Focus not obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html)
- [WAI WCAG 2.2 — Target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [WAI technique ARIA22 — Status messages](https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA22)
- [GOV.UK Design System — Pagination](https://design-system.service.gov.uk/components/pagination/)
- [U.S. Web Design System — Pagination](https://designsystem.digital.gov/components/pagination/)
- [WordPress.com — Infinite Scroll](https://wordpress.com/support/infinite-scroll/)
- [Payload — Pagination](https://payloadcms.com/docs/queries/pagination)
- [Next.js — Layouts and Pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages)
- [Next.js — Linking and Navigating](https://nextjs.org/docs/app/getting-started/linking-and-navigating)
- [MDN — History scroll restoration](https://developer.mozilla.org/en-US/docs/Web/API/History/scrollRestoration)
- [Phase 23 decision log — D14 through D16](../phase-23-web-studio-cms-decision-log.md)
- [ADR-0145 — Page-local composition and coherent Site Generations](../../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [ADR-0146 — Staged hierarchical public paths](../../../adr/0146-staged-hierarchical-public-paths-under-coherent-site-generations.md)
- [ADR-0147 — Automatic ordinary Page route continuity](../../../adr/0147-generation-bound-automatic-ordinary-page-route-continuity.md)
- [ADR-0151 — Semantic ordinary section catalog](../../../adr/0151-semantic-ordinary-section-catalog-and-additive-bounded-composition-seam.md)
- [ADR-0152 — Family-qualified Reusable Sections](../../../adr/0152-family-qualified-semantic-reusable-sections.md)
- [ADR-0153 — Certified custom presentation packages](../../../adr/0153-certified-site-bound-custom-presentation-packages.md)
- [ADR-0158 — Dynamic Source Catalog and Content list](../../../adr/0158-versioned-dynamic-source-catalog-and-content-list.md)
- [ADR-0159 — Three bounded Content-list curation strategies](../../../adr/0159-three-bounded-content-list-curation-strategies.md)
- [ADR-0160 — Link-native Public Page Windows and bounded list discovery](../../../adr/0160-link-native-public-page-windows-and-bounded-list-discovery.md)
