# ADR-0172: Versioned Site Search & Sharing Profile with generated defaults and D1 compiler ownership

**Status:** Accepted (founder-ratified Phase 23 D28 C-prime-R, 2026-08-24)

## Context

Phase 23 needs ordinary Public Pages and Articles to be discoverable by search
engines and shareable through coherent link cards without creating an
independent SEO publication head, exposing technical crawler controls to
occasional nonprofit staff, or duplicating specialized Phase 22 search/share
authority. Current Core spreads metadata across a hard-coded root layout,
partial Page metadata, global Site helpers, JSON-LD helpers, and cache
configuration; Next.js metadata precedence and provider caches can therefore
produce a visually correct Page with a wrong canonical, locale, reach, Site
identity, card, or structured claim.

Search engines may rewrite titles and snippets, canonical and locale signals
must agree with route and release state, robots is not authorization, and
social/Web Share providers do not provide transactional publication success.
Payload's SEO plugin and Next.js metadata APIs are useful adapters but cannot
own exact Tenant, Site, locale, route, reach, media, schedule, Preview, or D1
release meaning. The hard boundary is therefore an Asym-owned, versioned,
locale-exact compiler contract with minimal editorial deltas.

## Decision

<!-- prettier-ignore -->
> **C-prime-amended-and-hardened (C-prime-R) — One versioned Site Search &
> Sharing Profile with deterministic locale-exact generated defaults, exactly
> three bounded ordinary-Page overrides, and one complete D1 release-bound
> compiler-owned ordinary Page/Article Search & Sharing Manifest.**
>
> 1. **One bounded launch product.** D28 owns search-engine presentation,
>    social-link presentation, crawler-facing route dispositions, host
>    sitemap/robots projection semantics, and accessible public share actions
>    for ordinary Phase 23 Pages and Articles. It does not own D17 on-site
>    search, domain verification, redirects, Page visibility, presentation
>    packages, media custody, analytics, advertisements, custom head scripts,
>    or authenticated app surfaces. Phase 22 D14 remains content authority for its specialized
>    Missionary, Project/Campaign, and public Ministry Update identities.
> 2. **One exact ordinary-content authority chain.** Source-owned approved Site
>    identity, visible Page-locale facts, D2/D3 route and reach, D22 locale
>    lineage, D24's exact server-derived `public` audience, D27 qualified media,
>    and a versioned D28 Site profile are compiler inputs. D1 alone compiles and
>    activates one immutable complete **ordinary Page/Article Search & Sharing
>    Manifest** inside that exact locale's Public Site Generation. Phase 22 D14
>    independently owns and releases its specialized immutable manifests; D28
>    and D1 neither recompile, advance, freeze, nor reinterpret those source
>    releases. Payload fields/plugins, Next layouts/file metadata, database
>    rows, request-time code, caches, crawlers, and social services are adapters
>    or observations, never parallel authority.
> 3. **Versioned Site profile, not duplicated identity.** Each exact
>    Tenant × environment × Site profile version references the verified public
>    host, Phase 24 locale census, source-owned exact-locale Site name/short name
>    and identity, one small code-owned title-pattern key, and an exact
>    Site × locale D27 default social-card placement. That placement preserves
>    usage purpose, locale, usage-local alt, crop/art direction, displayed
>    credit, policy/qualification, exact revision, rendition, and proof. A safe
>    qualified default placement is an activation gate for every locale that
>    releases eligible routes. Homepage description comes from the exact-locale
>    homepage's visible summary or its ordinary Page description override and is
>    otherwise omitted; the Site profile owns no hidden homepage-copy fallback.
>    It never copies mutable organization, domain, locale, path, rights, or Page
>    facts into a second truth. A distinct public Site name is promised only for
>    a distinct verified host or subdomain, never for a tenant-branded
>    subdirectory on a shared host. A profile revision is inert authoring truth:
>    each named locale's independent D1 successor explicitly pins it. D28 creates
>    no Site-global public profile head, **Publish all languages** action, or D10
>    presentation-cohort shortcut.
> 4. **Small title-pattern catalog.** Launch supports only code-owned,
>    accessible patterns such as **Page title · Site name** and
>    **Site name · Page title**, plus the Site homepage form. Patterns receive
>    locale-aware punctuation, whitespace, duplicate-name suppression, and
>    hostile-length handling from the compiler. There is no tenant-authored
>    formatting DSL, arbitrary placeholder, HTML, or raw head template.
> 5. **Computed defaults remain computed.** A Page stores no copied generated
>    title, description, or image. At candidate compilation the resolved value
>    is `exact Page-locale override ?? deterministic generated value` under the
>    pinned profile/compiler version. A Site-profile or source change therefore
>    affects only each exact locale's separately reviewed D1 successor candidate;
>    it does not create stale per-Page copies, mutate live output, or advance
>    another locale.
> 6. **Exactly three Page-locale overrides.** An ordinary Page/Article locale
>    revision may persist only: (a) the semantic Page portion of the shared
>    search/share title, (b) one shared search/share short description, and
>    (c) one D27-qualified share-image placement. Search and social use the same
>    title and description at launch. Reset deletes the override and restores
>    generation; it never copies the current generated value. Opening a control
>    without an effective change creates no override. Input normalization
>    rejects control-only text and treats blank/Unicode-whitespace-only title or
>    description and a cleared image as **Use generated**; a custom title must
>    otherwise be nonblank, and launch has no separate “suppress generated
>    description” state. Each created or explicitly reaffirmed text override
>    records the contributing source revision/digest as non-editorial provenance,
>    not a fourth override. A later source change can therefore show one
>    deterministic **Review custom value** advisory with **Keep custom value**
>    or **Use generated …**, rather than nagging or guessing.
> 7. **Deterministic generated values.** The title uses the visible exact-locale
>    Page title and pinned Site pattern. The description uses the Page-specific
>    visible exact-locale summary/excerpt and is omitted when no meaningful
>    summary exists; the compiler never scrapes arbitrary Rich Text, invents
>    copy, repeats one generic Site paragraph across Pages, or falls back to
>    another locale. The image uses a semantically representative D27-qualified
>    Page placement when one is explicitly eligible, otherwise the exact
>    Site × locale profile-default D27 placement and all of its usage proof.
>    Selection is deterministic during candidate compilation. It never uses an
>    arbitrary URL or silently selects an unrelated asset, and a later adverse
>    withdrawal never triggers an unreviewed fallback substitution in a live
>    generation.
> 8. **Exact locale or no artifact.** All editor reads, previews, generation,
>    metadata, cards, structured data, alternates, and sitemap entries use one
>    explicit BCP 47 locale lineage with Payload fallback disabled. Missing or
>    unreleased exact-locale content is represented as missing. Locale switching
>    names the active locale and scope; it never presents inherited source
>    content as completed translation.
> 9. **Searchability and shareability are separate typed results.** The
>    compiler derives independent `SearchPresentation` and
>    `SharePresentation` results from one manifest. Anonymous visibility does
>    not imply discovery; no-index does not imply privacy; and successful
>    release does not imply external indexing, ranking, snippet selection, or
>    refreshed social caches.
> 10. **D2 reach inside D24's exact `public` audience is decisive.**
>     **Listed publicly** Pages render an
>     anonymous 200 response, self-canonical metadata, search/share presentation,
>     and eligible sitemap/locale discovery. **Shared by link — public** Pages
>     remain anonymously viewable and reshareable with coherent link cards but
>     carry no-index directives and are excluded from sitemap, on-site discovery,
>     and locale discovery. Draft, private, Preview, review, authenticated-only,
>     withdrawn, trashed, unavailable, or unresolved content emits no
>     content-specific anonymous search/share artifact.
> 11. **Canonical and status are compiler-derived.** One absolute HTTPS
>     self-canonical URL derives only from the Phase 24-verified Site host, D2
>     Placement, D3 route state, and D22 locale. Request `Host`/forwarded headers,
>     Page text, plugin fields, stale aliases, and arbitrary editor input never
>     choose it. A moved route uses D3's permanent continuity behavior; a removed
>     route with no replacement returns the exact 404/410 policy. Redirects and
>     unavailable routes leave the sitemap and do not emit the old Page's card
>     or structured facts.
> 12. **One reciprocal locale-alternate representation.** D1 emits absolute,
>     self-inclusive, reciprocal hreflang links only for mutually eligible,
>     released, Listed exact-locale variants. Launch uses one compiled
>     HTML-head `<link rel="alternate" hreflang="…">` representation rather
>     than independently maintaining HTML, header, and sitemap copies.
>     `x-default` ships only after Phase 24 names a genuine Site selector/default
>     contract; D28 does not infer it.
> 13. **Truthful route dispositions and host sitemap projection.** Each
>     locale-exact ordinary D1 manifest seals whether its route is sitemap-
>     eligible, its self-canonical URL, and its source-owned significant public
>     `lastmod`. After activation, one durable idempotent convergence worker
>     derives the verified-host sitemap from current active locale heads plus a
>     typed union of references to independently current Phase 22 D14 manifests.
>     A D14 member is never copied or reinterpreted: the reference preserves its
>     Legal Entity, source release/binding/coverage versions, safety ceiling,
>     digest, canonical disposition, and source-owned `lastmod`. The host
>     sitemap contains only current anonymous 200, self-canonical, Listed URLs;
>     never uses deployment or projection-build time; emits no `priority` or
>     `changefreq`; and partitions only when measured URL/byte thresholds demand
>     it. Projection lag is visible and repairable, not a partial D1 activation.
> 14. **Robots is derived public guidance, never access control.** Each ordinary
>     D1 manifest seals its exact route index/crawl disposition. After
>     activation the same convergence seam derives one deterministic verified-
>     host robots artifact and sitemap reference from current active heads and
>     host policy. No tenant per-bot DSL ships. Pages that must communicate
>     no-index remain crawlable enough for that directive to be seen. Private
>     and Preview surfaces depend on authorization, no-store, nonpublic
>     delivery, D24's `public` invariant, and D25—not robots text. Host artifact
>     lag is observed and reconciled without changing locale release authority.
> 15. **Closed, visible-fact structured data.** One code-owned, versioned
>     serializer catalog may emit `WebSite` on the canonical homepage,
>     `NGO`/`Organization` on the appropriate Site identity Page,
>     `WebPage` for ordinary Pages, `Article`/`BlogPosting` only for true
>     Articles with visible exact authors/dates, and `BreadcrumbList` only from
>     the visible D2 hierarchy. Stable `@id` values derive from the canonical.
>     Unsupported or unproven properties are omitted. Editors cannot enter raw
>     JSON-LD, schema types, `Person`, `DonateAction`, `SearchAction`, FAQ,
>     ItemList, tracking markup, or invisible claims. A generic branded Site-
>     default image can complete a social card but is not emitted as an
>     `Article`/`BlogPosting` structured-data image unless it is genuinely
>     representative of that Article.
> 16. **Complete social-link metadata.** The manifest emits one coherent Open
>     Graph presentation—title, description or omission, canonical `og:url`,
>     correct `website`/`article` type, Site name, exact locale and eligible
>     alternates, and exact D27 rendition with absolute HTTPS URL, MIME type,
>     dimensions, and usage-local image alt—plus a derived Twitter-compatible
>     card from the same facts. There are no provider-specific copy fields or
>     request-time image renders. Protocol serializers deterministically map
>     D22's canonical BCP 47 locale to each protocol's required syntax,
>     including Open Graph's locale form, without creating a second locale
>     authority; an unsupported mapping is omitted rather than emitted malformed.
>     The shared rendition meets the strictest launch consumer size budget; D27
>     withdrawal invokes adverse-first public containment rather than a silent
>     image substitution.
> 17. **Accessible first-party sharing.** Every anonymously public eligible
>     Page offers one clearly labelled **Share** action. On direct user
>     activation it may invoke the secure-context Web Share API when supported;
>     a keyboard- and screen-reader-accessible first-party **Copy link** path is
>     always available. If Clipboard API access is absent or denied, the exact
>     URL appears in a selected/read-only manual-copy control. Success is
>     announced only after a confirmed clipboard write; native-share cancellation
>     is neutral. Bounded click-only outbound share links may be used as explicit
>     fallbacks. D28 loads no passive third-party social SDK, discloses no contact
>     list or chosen share target, and never claims a downstream post completed.
> 18. **Quiet Page UX.** Staff see one compact **Search engines & sharing**
>     section in Page settings, not a separate SEO dashboard. Its summary keeps
>     four independent facts visible: candidate durability (**Editing**,
>     **Saving**, or **Saved**), publication (**Live** or **Not live**), candidate
>     validation (**Ready** or **Needs attention — cause**), and provenance
>     (**Generated** or **Customized — n of 3**). It shows the exact locale,
>     reach/discovery state, and explicitly labelled **Planned public URL** with
>     **Candidate changes appear here only after release**. If a live generation
>     exists, it separately shows **Current public URL**—or that the same address
>     currently serves the prior live generation—and D3's planned continuity
>     result. **Preview Site** opens D25 candidate content. The planned URL is
>     neither a public Preview nor share/copy target; only the live generation
>     offers **Copy current public link**. Resolved
>     values appear first with provenance such as **Generated from Page title**
>     or **Using Site default image**. **Customize** reveals only the three
>     controls; each custom value offers **Use generated …** and undo.
> 19. **Honest, minimal previews.** The section has only
>     **Search result — example** and **Shared link — example** views using the
>     exact candidate locale and planned public URL. Persistent copy says that search engines
>     and social services may rewrite or cache what people see. D28 does not
>     imitate every provider, scrape live results, promise rank/index/card
>     refresh, or duplicate D25's whole-Site Preview. Character guidance is
>     advisory—**May be shortened in some results**—with no SEO score,
>     keyword-density meter, traffic light, or hard folklore limit.
> 20. **Excellent occasional-staff usability.** Persistent labels, plain-language
>     help, text-plus-icon status, visible focus, programmatic descriptions and
>     errors, polite debounced announcements, target sizing, keyboard media
>     selection, touch support, 320-CSS-pixel reflow, 400% zoom, CJK/RTL/long
>     text resilience, and reduced motion are launch requirements. Mobile uses a
>     form-first single column with a collapsible preview. Locale changes always
>     repeat the exact scope, for example **Editing Spanish (Mexico) — changes
>     apply only to Spanish (Mexico)**, beside controls and examples.
> 21. **Cause-owned messages and proportional gates.** Release blocks only
>     correctness or safety failures such as wrong scope, unverified host,
>     missing required visible title, canonical collision, exact-locale mismatch,
>     unsafe serialization, unqualified required media with no exact safe
>     fallback, or incomplete manifest closure. A valid omitted description and
>     exact Site × locale D27-qualified default social-card placement are normal
>     informational provenance, not
>     **Needs attention**. Likely shortening is inline advice; similar-copy
>     detection belongs in a bounded aggregate Site-quality view, not a
>     per-keystroke Page warning. A known placeholder, family-specific quality
>     failure, or source/custom basis change may be an actionable warning;
>     external crawl/cache lag is an operator observation. Actions preserve
>     pending edits and focus/open the exact locale Page title, summary,
>     relevant override, or exact D27 placement according to the cause; users
>     lacking the capability see who can resolve it, not a dead button. Color is
>     never the only signal.
> 22. **Simple Site-profile UX and impact review.** Site settings expose plain
>     exact-locale Site identity references, the small title-pattern choice, and
>     exact Site × locale D27-qualified default social-card placement—never raw
>     canonical, robots, hreflang, sitemap, JSON-LD, verification token, or
>     provider controls. Candidate changes report Page-locale-field impact, not
>     only Page counts—for example **Title stays custom**, **Description
>     changes**, and **Image changes**—plus exact causes, Pages needing action,
>     and representative current-versus-candidate examples through a bounded
>     filterable list. Editing a profile never mutates live Pages or
>     synchronously renders every Page. Impact may summarize all locales, but
>     every favorable release action names and advances one exact locale; D10
>     remains presentation-only.
> 23. **Exact schedules and Preview.** D13 appointments pin the exact reviewed
>     Page revision and D28 dependency closure or compiled candidate. Execution
>     re-proves current compatibility and fails to **Needs attention** rather
>     than silently rebasing to a changed profile, path, locale, reach, media,
>     or serializer. D25 privately previews the exact candidate output and
>     staff explanations while emitting no public canonical, alternates,
>     sitemap membership, share card, indexing signal, analytics, or public
>     cache entry.
> 24. **Complete ordinary D1 artifact and framework adapters.** The immutable
>     ordinary Page/Article manifest pins Tenant, environment, Site, Page
>     identity/family, locale lineage, exact `public` audience, Page/Placement/
>     D2-reach/profile/media revisions, three Editorial Revision override deltas,
>     override source-basis provenance, compiler/serializer/catalog versions,
>     resolved outputs, and digest. The Next adapter emits complete route-level
>     nested `openGraph`, `twitter`, `robots`, and `alternates` objects and
>     safely serialized JSON-LD; it never relies on shallow layout inheritance
>     or conflicting file metadata.
>     Payload's SEO plugin may later supply exact-qualified editor components
>     behind an Asym adapter, but it is neither installed nor required by this
>     decision and can never own release truth.
> 25. **Tenant safety, RLS, and concurrency.** The Site profile owns one inert
>     revision lineage; the three override fields/deltas remain inside the
>     D1/D22 exact-locale Editorial Revision, structurally scoped by stable Page
>     identity. Neither has a separate public head outside D1. Profile revisions
>     and Editorial Revision fields carry structural Tenant/environment/Site/
>     locale/`public` identity with composite constraints and indexes.
>     Browser-visible data uses current
>     membership/capability RLS; privileged compilation is an audited narrow
>     server command, not a client service-role path. Host is verified data,
>     never request authority. Profile authoring revisions and Editorial
>     Revisions use
>     expected-version compare-and-swap so concurrent changes cannot mix
>     generations or overwrite staff work. Capabilities independently govern
>     viewing resolved output, editing Page overrides, editing the Site profile,
>     and releasing a D1 candidate. Reviewers and non-editors receive the exact
>     candidate and provenance read-only, without misleading or dead
>     customization controls.
> 26. **Bounded performance and cache identity.** Public rendering reads the
>     activated immutable generation/manifest, not Payload or multiple mutable
>     tables per request. Caches include Tenant, environment, Site, verified
>     host, locale, canonical route, exact `public` audience, generation,
>     manifest, and renderer version.
>     Profile impact analysis and compilation use bounded set-based work and
>     indexed cursors. Bot traffic, card scrapers, sitemap generation, and
>     optional notifications receive explicit budgets; no external search
>     service or speculative sharding ships without measured need.
> 27. **Failure, recovery, convergence, and observability.** Before CAS, an
>     ordinary-manifest preparation, validation, serialization, route, media, or
>     required serving-artifact proof failure blocks that locale successor and
>     leaves its prior live generation intact. Recovery is a newly proven
>     forward successor. After CAS, host sitemap/robots/cache convergence and
>     optional exact-host IndexNow notification run idempotently from a durable
>     activation outbox. They never gate, roll back, or redefine the locale
>     release, and IndexNow never replaces the sitemap. Ordinary editors see
>     candidate/live state and
>     the external-lag disclosure, not crawler operations. The operator surface
>     distinguishes timestamped, object-specific facts such as **Released**,
>     **Sitemap current**, and **Public HTML verified** from typed provider facts
>     such as **Bing IndexNow notification accepted for {host}**, **Google Search
>     Console reported sitemap fetched for {host/object}**, or **Bing Webmaster
>     Tools report received for {host/object}**. Every observation carries its
>     provider, exact host/object, and observation time; none is labelled
>     **Indexed** unless that named external report explicitly says so, and even
>     then it remains an observation rather than release truth.
>     Redacted cause codes, lag, reconciliation, synthetic HTML/head/status
>     checks, deletion health, and bounded retry state are observable without
>     leaking Page copy, private URLs, or high-cardinality Tenant data into broad
>     metrics. An adverse withdrawal or deletion bypasses ordinary cache
>     freshness and invokes the exact D27/D1 containment and reconciliation
>     path.
> 28. **Migration, upgrades, proof, and exclusions.** Implementation must
>     inventory and shadow-compare every hard-coded layout/site setting,
>     metadata helper, JSON-LD helper, Page metadata route, file metadata,
>     sitemap/robots behavior, specialized Phase 22 manifest, and cache seam;
>     cut over one explicit Tenant × environment × Site × locale migration
>     cohort with no dual read/write authority and quarantine unresolved inputs.
>     Exact Payload,
>     Next, provider, and serializer pins require conformance fixtures before
>     upgrade; stable manifests remain migratable/exportable through explicit
>     version adapters. Launch proof covers every Page family/reach/status/
>     locale, no-fallback and reciprocal alternates, host spoofing and
>     cross-Tenant isolation, canonical collisions and D3 moves, D13 schedules,
>     D21 Trash, D25 Preview, D27 withdrawal, 404/410 behavior, sitemap diff and
>     truthful `lastmod`, exact `public` discrimination and anonymous/session/
>     crawler output invariance, hostile JSON-LD, no-JavaScript bot output,
>     share fallbacks, accessibility, cache isolation, load, forward recovery,
>     and external failure simulation. D28 deliberately excludes editable
>     technical SEO,
>     meta keywords, per-platform copy, raw schema/head markup, arbitrary image
>     URLs, AI copy generation, tenant crawler rules, Page-local indexing
>     switches outside the settled D2 reach inside D24's exact `public`
>     audience, SearchAction, general Google URL submission,
>     ranking promises, passive social SDKs, and request-time card generation.

## Consequences

- D1 remains the only ordinary Page/Article release authority and activates
  one complete immutable Search & Sharing Manifest per exact locale
  generation.
- D28 stores exactly three Page-locale editorial deltas over deterministic
  generated output. Technical metadata, canonical, alternates, crawler
  dispositions, structured data, and host projections remain derived.
- D2 reach and D24 exact `public` remain distinct; no-index is never described
  as privacy. D22 forbids silent locale fallback and D27 supplies exact
  placement-qualified social media.
- Phase 22 D14 specialized manifests remain independently authoritative.
  Verified-host sitemap projection may reference them but cannot copy,
  recompile, advance, freeze, or reinterpret their releases.
- The Site profile is inert authoring truth pinned independently by each
  locale's D1 successor. There is no Site-global public head, all-locale
  release action, or D10 widening.
- Staff receive a quiet generated-first, accessible experience that separates
  saved state, live state, validity, provenance, planned URL, current URL,
  private candidate Preview, and provider-qualified external observations.
- Pre-CAS ordinary serving proof may block a successor; post-CAS sitemap,
  robots, cache, and optional IndexNow convergence is durable and observable
  but never release truth. Recovery is a newly proven forward successor.
- Provider-specific fields, editable technical SEO, raw schema/head, SEO
  scores, AI metadata, ranking promises, arbitrary remote images, passive
  social SDKs, and general search-engine submission remain excluded.
