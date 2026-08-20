# ADR-0131: Release-Bound Public Search and Sharing Presentation

**Status:** Accepted (founder ruling, Phase 22 grill session - D14)

## Context

Phase 22 needs every eligible public Missionary Ministry Page,
Project/Campaign Page, and public Ministry Update permalink to render coherent,
safe search-engine and social-sharing output. The product must make a Listed
release technically discoverable by standards-compatible crawlers and make
every anonymously public release easy to share without claiming that an
external platform indexed, ranked, cached, shared, refreshed, or removed it.

This cannot be a second SEO publication system. D2 already owns Publication
Reach; D3-D5 own presentation, editing, review, and release; D8 and Phase 5 own
routes and public serving; D9 and Phase 29 own safe media; D11 owns canonical
Ministry Updates, revisions, audiences, and placements; D13 owns on-site
directory discovery; Phase 10 owns the current safety ceiling; and Phase 24
owns domain and locale truth. Search and social artifacts must resolve those
facts exactly rather than rereading mutable CMS, CRM, storage, or root-site
fallback data.

The current prototype seams are not safe authority. They include global
metadata defaults, raw worker identifiers and names in URL helpers, generic
`Person` and location structured data, obsolete `SearchAction`, fictional share
URLs, inert share controls, mutable raw media, and serialized original
filenames. Search engines and social platforms may retain public content beyond
Asym's control, so any leak in metadata or card media has amplified impact.

## Decision

> **C-prime-amended-and-hardened (C-prime-R) — one immutable,
> release-bound, locale-exact Public Search & Sharing Presentation Manifest
> containing non-interchangeable Search Presentation and Share Presentation
> results for every exact current Phase-10-safe D2 Page Release and D11 Public
> Page Ministry Update Release; structurally scoped by Tenant, Legal Entity,
> environment, Site, verified host, locale, Page Family or canonical Update
> identity, D3 Presentation/Feed Binding, D4/D5 release occurrence, D2 reach,
> D8-compatible route and effect generation, D9 media manifest, D11 Revision
> and audience/placement coverage, Phase 10 safety and containment, Phase 24
> domain/locale truth, and exact renderer, compiler, and release generations;
> using people-first generated defaults plus only bounded locale-specific title,
> description, and D9-certified share-image selection inside D3/D11 and
> D4/D5's sole edit, review, and release lane. A current `Listed publicly` Page
> Release is server-rendered, internally crawlable, self-canonical, exact-host
> sitemap- and reciprocal-locale-eligible, locally search-index eligible, and
> publicly shareable; `Shared by link — public` remains anonymously reachable
> and publicly reshareable but emits `noindex` and remains absent from
> directories, navigation, sitemaps, public-feed discovery, and locale
> discovery; Not-public, draft, authenticated-preview, supporter-only,
> contained, withdrawn, retired, and tombstoned truth emits no content-specific
> anonymous metadata, card, or share projection. Every canonical Ministry
> Update receives exactly one stable opaque public permalink per Site and locale
> rather than a feed fragment, query identity, raw id, or copied page-owned post;
> complete current placement coverage makes that permalink Listed only when at
> least one exact safe admitted placement is independently Listed, public but
> `noindex` when every admitted placement is Shared-by-link, and uniformly
> absent when no admitted public placement remains. One code-owned compiler
> produces complete initial HTML/head, exact crawler directives, canonical and
> reciprocal alternate links, significant-release `lastmod`, host-scoped
> sharded sitemap coverage, visible-fact structured data, Open Graph and
> compatible social-card metadata, and one content-addressed same-origin
> D9-certified social derivative with contextual image alternative text; every
> HTML, metadata, JSON-LD, media, sitemap, and share-payload fact resolves the
> same immutable release coverage and current safety ceiling while Search and
> Share outcomes remain distinct. One quiet accessible `Search & sharing`
> section shows generated defaults, approximate search/link previews, current
> Site, locale, clean URL, and honest search eligibility, with optional Reset to
> generated and no editable canonical, robots, sitemap, `hreflang`, schema,
> keyword, provider, route, or arbitrary-image controls; it creates no second
> review queue or routine tenant work. Every anonymously public Page and public
> Update permalink receives one accessible secondary Share action using
> user-initiated native Web Share when supported and first-party Copy link plus
> bounded click-only outbound fallbacks otherwise, with no passive third-party
> SDK, iframe, tracker, draft/preview URL, secret, supporter identity, query-
> derived text, hidden attribution, automatic post, or claim that Asym knows the
> selected target or completed share. Phase 5 serves exact public HTML and
> assets; D2 owns reach, D8 route dispositions/effects, D9/Phase 29 media, D11
> Update/audience truth, Phase 10 safety, Phase 24 domain/locale truth, and D13
> on-site discovery remain independently authoritative. Automatic canonical
> sitemaps, crawler-accessible links, public-response probes, optional exact-
> host IndexNow acceleration, and cause-owned exception monitoring make Google,
> Bing, and other standards-compatible crawlers able to discover and evaluate
> eligible releases, while external crawling, indexing, ranking, title/snippet
> choice, social fetching, cache refresh, sharing, and de-indexing remain
> independently observed best-effort outcomes. Unknown or adverse proof removes
> positive local search/share output first and recovery is append-only — without
> a second SEO/social publication head, page-level indexing switch, shared-link
> secrecy claim, client-side or bot-only content authority, raw CMS/CRM/storage
> reads, inherited root or cross-Site/unsafe-locale fallback, original filename
> or source metadata, arbitrary JSON-LD or remote media, generic `Person`,
> `SearchAction`, `DonateAction`, Google Indexing API misuse, third-party share
> widget, query-variant indexing, request/build-time freshness, mutable current
> truth, destructive rollback, blind provider retry, or any claim that released,
> reachable, listed, search-ready, sitemap-included, submitted, crawled, indexed,
> ranked, share-opened, shared, cached, refreshed, removed, and externally
> forgotten are the same fact.**

## Consequences

- Search Presentation and Share Presentation are separate typed results within
  one immutable manifest. They use the same coverage digest and safety ceiling,
  but shareability never implies search eligibility.
- A current Phase-10-safe `Listed publicly` release is locally search-index
  eligible and shareable. A `Shared by link — public` release is public and
  shareable but `noindex` and omitted from public discovery and sitemaps. A
  stricter release emits no content-specific anonymous presentation.
- Every canonical Ministry Update has one opaque stable public permalink per
  Site and locale, collision-proved in the shared Site × locale route registry.
  Complete current placement coverage, not a copied feed card, determines
  whether it is Listed, link-only, or absent; D11 remains Update/Revision truth.
- D8's Public Page Route Effect Manifest remains a distinct route-consequence
  record. It may reference D14 presentation artifacts for add/update/remove
  effects, but neither manifest is a second release or publication head.
- One code-owned compiler produces server-rendered HTML/head, canonical and
  reciprocal admitted-locale links, exact crawler directives, significant-
  release `lastmod`, host-scoped sharded sitemap output, visible-fact structured
  data, Open Graph and compatible card metadata, and one same-origin D9-certified
  social derivative. Mixed-generation output is invalid.
- Staff see one quiet **Search & sharing** section in the existing editor with
  generated defaults, honest eligibility, approximate previews, optional
  bounded locale title/description and certified image selection, and Reset to
  generated. Technical SEO controls and a second approval queue do not exist.
- Anonymous public routes expose one secondary accessible Share action: native
  Web Share after direct user activation when available, plus first-party Copy
  link and bounded click-only fallbacks. No passive third-party SDK or tracker
  loads and no completion claim is inferred.
- `Search ready` is a local proof only. Crawler fetch, index, rank, snippet,
  social-card cache, completed share, refresh, de-indexing, and forgetting are
  separately observed external outcomes.
- Optional exact-host IndexNow may accelerate discovery. Google's restricted
  Indexing API is not used. External provider availability never gates release.
- Adverse or unknown proof removes affected positive local output first.
  Recovery is append-only, CAS-guarded, stale-job safe, and cannot restore a
  superseded or unsafe manifest.
- Production authorization requires complete cross-tenant, host, locale,
  reach, audience, placement, route, media, privacy-egress, metadata, structured-
  data, sitemap, cache, concurrency, deployment-skew, bot-load, no-JavaScript,
  sharing-fallback, accessibility, failure, containment, migration, and recovery
  proof.

## Later Phase 22 D27 qualification

D27 makes the Public Ministry Page identity Site-scoped and locale-independent,
with independently released subordinate Page × locale lineages and exactly one
current D3 family presentation activation per Site × Page Family. D14 therefore
binds each Search and Share result to the exact current D2 Page × locale release
**and** the exact current D3 activation generation. The immutable D2
release-time profile pin remains baseline and historical evidence; it is not by
itself the complete current presentation selector. Unknown, incompatible, or
mixed release/activation generations emit no positive search or sharing output.

A compatible D3 family activation may require coherent D14 artifact
recomposition for the complete current Page × locale release cohort without
creating a new D2 release or changing title, description, alternative text,
reach, route, safety, locale eligibility, or other editorial/owner truth. Its
activation manifest pins the Site × family coordination epoch and exact D2
release-head-set digest so a concurrent locale release invalidates stale D14
coverage before family activation. An incompatible profile change remains on
the prior generation until each affected locale release receives its ordinary
owner-valid disposition.

Canonical, alternate, sitemap, `lang`, `dir`, metadata, and share facts remain
locale-exact. A released source locale does not make another locale eligible,
and Payload/provider fallback is disabled for public projection. Reciprocal
alternates include only independently admitted locale releases that resolve the
same Page identity and one coherent D2/D3 composite. D27 creates no second SEO,
sharing, locale, release, directory, route, or external-provider authority.

## Considered options

- **Fully automatic safe search presentation.** Rejected as the complete choice
  because tenants need a small locale-specific editorial seam and share-image
  choice, even though generated technical defaults remain the ordinary path.
- **Full tenant SEO and social controls.** Rejected because mutable canonicals,
  robots, schema, sitemap, provider, route, arbitrary-image, and keyword knobs
  would create a second unsafe publication authority and routine staff burden.
- **Separate search and social publication systems.** Rejected because the same
  release, reach, safety, route, locale, and media facts would drift across two
  public metadata heads.
- **One immutable manifest with typed Search and Share results and bounded
  editorial input.** Accepted because it preserves one release authority while
  representing the deliberate D2 case that is shareable but not index eligible.
- **Third-party share widgets or automatic social posting.** Rejected because
  they add passive data disclosure, provider coupling, consent ambiguity, and
  false completion semantics without improving the core sharing task.
- **Treating provider submission or observation as authority.** Rejected because
  external crawling, indexing, ranking, caching, sharing, and removal remain
  independently controlled and cannot safely gate or rewrite local truth.

## Related decisions

- [ADR-0119 - Phase-10-ceiling-resolved Publication Reach](./0119-tenant-defaulted-phase-10-ceiling-resolved-publication-reach.md)
- [ADR-0120 - Family-certified Public Page Presentation Profiles](./0120-family-certified-public-page-presentation-profiles.md)
- [ADR-0121 - Tenant-chosen Public Content Review and Release Profiles](./0121-tenant-chosen-public-content-review-and-release-profiles.md)
- [ADR-0122 - Simple Public Page Review with quiet Phase 10 eligibility](./0122-simple-public-page-review-with-quiet-phase-10-eligibility.md)
- [ADR-0125 - Source-qualified Public Page route dispositions](./0125-source-qualified-public-page-route-dispositions.md)
- [ADR-0126 - Release-bound Public Ministry Media Assets](./0126-release-bound-public-ministry-media-assets.md)
- [ADR-0128 - Canonical Ministry Update audience release projections](./0128-canonical-ministry-update-audience-release-projections.md)
- [ADR-0130 - Scoped Public Ministry Discovery with tenant-chosen topology](./0130-scoped-public-ministry-discovery-with-tenant-chosen-topology.md)
- [Phase 5 public website runtime contract](../prds/sitestacker-parity/phase-05-public-website-runtime-contract.md)
- [Phase 10 sensitive-data safety](../prds/sitestacker-parity/phase-10-sensitive-data-safety.md)
- [Phase 22 decision log](../prds/sitestacker-parity/phase-22-public-ministry-pages-decision-log.md)
- [Phase 22 D14 research and adversarial review](../prds/sitestacker-parity/phase-22-public-ministry-pages-research-evidence.md#32-ratified-d14-selected-option-adversarial-review-and-hardened-decision)
