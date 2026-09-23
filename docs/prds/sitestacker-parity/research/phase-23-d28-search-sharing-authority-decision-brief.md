# Phase 23 D28 Search and Sharing Authority Decision Brief

**Status:** Founder-ratified exact C-prime-R on 2026-08-24 after primary-source
research, repository audit, nonprofit staff UX design, and complete
17-category adversarial hardening. Ratification authorizes documentation only.

**Date:** 2026-08-23

**Ratified:** 2026-08-24

## Decision to make

Choose the smallest complete Phase 23 authority for ordinary Public Page and
Article search-engine presentation, social-link presentation, crawler-facing
technical metadata, and public sharing without creating a second publication
head, a mutable plugin-owned truth, or a technical SEO console for occasional
nonprofit staff.

The founder selected:

> **Option C-prime — Versioned Site Search & Sharing Profile with generated
> defaults, three bounded Page overrides, and D1 compiler ownership.**

The founder-ratified shape is correct. The exact C-prime-R formulation below hardens
the meaning of **versioned**, **generated**, **three**, **Page**, and **D1
compiler ownership** so the product remains locale-exact, Tenant-safe,
release-exact, understandable, and portable.

This decision does not reopen D1–D27. It does not authorize code, schema,
migration, dependency or provider adoption, issue publication, Git
publication, deployment, release, or activation.

## Why this decision is necessary

Current Core has useful SEO helpers but no single Site- and release-qualified
authority:

- the public catch-all produces only a title and summary;
- the donor root layout supplies one hard-coded GiveHope title pattern,
  description, Open Graph/Twitter data, indexable robots state, root canonical,
  and verification values;
- shared metadata and JSON-LD helpers are global rather than exact
  Tenant/environment/Site/locale/generation artifacts;
- the current JSON-LD helper emits the retired Sitelinks Search Box
  `SearchAction` and broad types that are not necessarily supported by visible
  Page facts;
- no complete host-qualified sitemap or robots route is present; and
- Next.js nested metadata merges shallowly, so partial Page metadata can remove
  or accidentally inherit whole nested sections.

That posture is migration input, not D28 authority. It can produce wrong-Site
canonicals, generic snippets, incomplete cards, locale drift, conflicting
metadata, and misleading staff expectations even when the visible Page is
correct.

## Settled authority preserved

1. **D1** alone prepares, validates, activates, and serves one immutable Public
   Site Generation. Failed preparation leaves live unchanged.
2. **D2** owns staged hierarchical Placement and canonical public paths.
3. **D3** owns automatic same-Page route continuity and its one bounded
   exact-path exception; D28 does not become redirect authority.
4. **D9** presentation packages render public presentation but never own
   canonical, robots, sitemap, structured-data, or share authority.
5. **D13** schedules one exact reviewed Page-locale revision and dependency
   closure through the same D1 command; it never means “publish whatever is
   latest.”
6. **D17** owns the derived on-site Public Site Search projection. D28 is
   labelled **Search engines & sharing** for staff and does not reopen on-site
   search.
7. **D22** owns exact locale lineages with no silent field fallback. A missing
   exact locale release creates no route, canonical, alternate, sitemap entry,
   search result, or social card for that locale.
8. **D24** owns one exact, server-derived `public` audience and auth-invariant
   public representation. **D2** owns the reach/discovery dispositions:
   **Listed publicly** is discovery-eligible; **Shared by link — public**
   remains anonymously viewable and reshareable but is intentionally omitted
   from discovery and carries a no-index request. Neither state is secret.
9. **D25** owns private, authorized, exact whole-Site candidate Preview.
   Preview is no-store and non-indexable and does not create public metadata
   authority.
10. **D27** owns public-media identity, qualification, immutable renditions,
    adverse withdrawal, and usage-local image accessibility/crop/credit facts.
11. **Phase 22 D14** remains the specialized, ratified Search/Share manifest
    authority for Missionary Ministry Pages, Project/Campaign Pages, and public
    Ministry Update permalinks. D28 supplies compatible infrastructure and the
    ordinary Page/Article lane; it does not weaken or duplicate D14's content
    authority.
12. **Phase 24** owns verified domain, host, and locale configuration and may
    later decide a genuine `x-default` selector. D28 consumes those exact
    proofs; it does not invent them.

## Evidence-led decisions

- Google may rewrite title links and snippets from visible Page content; the
  product must present previews as examples, not guarantees.
- Google has no fixed title or description character limit. Counters can be
  advisory, but SEO scores and hard “perfect length” gates create poor copy and
  false confidence.
- Canonicals, redirects, sitemap membership, and internal links are reinforcing
  signals that must agree. A canonical is not authorization and is not a
  substitute for a redirect or deletion status.
- Localized alternates must be exact, absolute, reciprocal, and self-inclusive.
  Maintaining multiple independent hreflang representations creates drift; one
  compiled representation is the launch default.
- Robots controls crawling and indexing behavior, not privacy. A no-index Page
  must remain crawlable if a crawler is expected to observe the directive.
- Search engines ignore sitemap `priority` and `changefreq`; truthful
  significant public-change `lastmod` is the useful field.
- The Open Graph protocol requires coherent title, type, image, and URL and
  recommends image type, dimensions, and image alt. Image alt describes the
  image; it is not the Page title.
- Google retired the Sitelinks Search Box in 2024. D28 removes `SearchAction`
  rather than preserving obsolete markup.
- Payload's SEO plugin can provide editor components and previews, but the
  frontend must render the metadata. Its generated fields and tab-merging
  behavior are not a release authority.
- As of this decision, stable Payload remains on the 3.x line while Payload 4
  is an active canary/internal evolution. D28 therefore depends on an
  Asym-owned contract and exact-pin adapter qualification, never a speculative
  Payload 4 UI or schema promise.
- Native Web Share is user-activated, platform-dependent, and does not prove a
  completed downstream post. A first-party copy-link fallback is always
  required.

Supporting evidence:

- [Primary-source and repository research](./phase-23-d28-search-sharing-primary-source-research.md)
- [Staff UX and CMS benchmark](./phase-23-d28-search-sharing-ux-benchmark.md)
- [Complete adversarial review](./phase-23-d28-search-sharing-adversarial-review.md)

## Concrete ministry scenario

Hope Global Missions has English and Spanish public Sites. Maya edits the
Spanish “Emergency response in Honduras” Article. The Page title, Spanish
summary, current D2 path, verified Spanish Site host, and D27-qualified feature
photo already exist.

The quiet **Search engines & sharing** section immediately shows:

- the exact **Planned public URL**, **Current public URL** when different, D3
  continuity result, and **Listed publicly** state;
- a generated assembled title using Hope Global's approved Site pattern;
- a generated description from this Spanish Article's visible summary;
- the exact qualified share rendition and Spanish usage-local image alt; and
- approximate search-result and shared-link examples.

Maya decides the visible Page title is too event-like for a search result. She
customizes only the Page portion of the title. The Site suffix remains
compiler-owned. No duplicate canonical, robots, social-platform, or JSON-LD
fields appear. If she selects **Use generated title**, the override is deleted;
the current generated value is not copied into a stale field.

The release reviewer sees the exact D28 profile version, three override deltas,
path, locale, reach, media, serializer, and resulting manifest inside the D1
candidate. If Spanish summary content is absent, D1 omits the description and
shows a calm **Add a short summary** action; it never substitutes English or a
generic Site paragraph. If the image becomes disqualified, the successor is
blocked or safely omits card media according to the exact qualified fallback;
it never silently selects a different photo.

After release, D1 says **Released** and the generated sitemap may say **Current**.
The UI does not say **Indexed**. Google, Bing, and social platforms decide when
to crawl, cache, rewrite, or display the Page.

## Alternatives disposed

### A-prime — Independent Page SEO documents and complete technical controls

**Reject.** Editable canonicals, robots, hreflang, schema, sitemap switches,
per-platform text, and independent Page SEO records create multiple truth
planes, locale drift, Tenant-host footguns, and a high-friction specialist UI.

### B-prime — Payload SEO plugin fields become the product authority

**Reject.** The plugin supplies helpful mechanics, not exact Tenant/Site/
locale/path/reach/media/D1 release semantics. It also couples product truth to
provider field shapes and an unstable major-version path.

### C-prime — Versioned Site profile, generated defaults, three Page overrides,

and D1 compiler ownership

**Founder-ratified only as the hardened formulation below.** It provides meaningful staff
control while keeping technical correctness derived, release-bound, and
testable.

## Exact founder-ratified C-prime-R formulation

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

## Ruthless synthesis

The permanent path is not “add SEO fields.” It is to compile one exact public
contract from existing source authorities, give staff only the three decisions
that benefit from editorial judgment, and make every technical consequence
read-only and explainable.

### Must be fixed in the contract now

1. Preserve D1 as the only ordinary release authority and define one complete
   immutable ordinary Page/Article Search & Sharing Manifest without absorbing
   Phase 22 D14.
2. Store only three override deltas; keep generated defaults deterministic and
   locale-exact.
3. Derive host, canonical, alternates, D2 reach, D24 `public`, route
   sitemap/robots dispositions, types, and status from their settled owners;
   project host artifacts after activation without absorbing Phase 22 D14.
4. Require a D27-qualified representative Page placement or the exact
   Site × locale D27 default social-card placement, and visible-fact-only typed
   structured data.
5. Define the quiet, accessible staff UX and honest external-convergence
   language.
6. Make Tenant/cache scope, safe serialization, concurrency, failure recovery,
   and migration cutover explicit launch gates.

### Must be proven during implementation before activation

1. Exact-pin Next/Payload adapter conformance and rendered-head snapshots.
2. Shadow comparison and one-authority Site × locale cohort cutover.
3. Cross-Tenant, locale, route, reach, schedule, Preview, Trash, media-withdrawal,
   and forward-recovery suites.
4. Responsive accessible usability studies with occasional nonprofit staff,
   including multilingual and low-bandwidth scenarios.
5. Sitemap/cache/deletion reconciliation and bounded external-notification
   telemetry.

### Monitor without expanding launch scope

1. Actual sitemap size, bot load, compilation duration, and profile fan-out
   before adding partitions or another search service.
2. Search-engine indexing and snippet rewrites, social-card cache lag, and
   IndexNow outcomes as observations—not product truth.
3. Stable Payload 4 and plugin APIs; adopt only when an exact-pin qualification
   proves they reduce maintenance without changing authority.
4. Evidence that tenants truly need distinct platform copy, additional
   structured-data families, AI assistance, or another title pattern before a
   separate decision expands the bounded catalog.

## Decision status

The 28-clause block above is the exact founder-ratified **Phase 23 D28
C-prime-R**. It is recorded in the Phase 23 decision log and ADR-0172. The
supporting interpretation and research explain but do not expand it.
Ratification authorizes no implementation, schema, migration, dependency or
provider adoption, issue publication, deployment, D1 activation, release, or
production change.
