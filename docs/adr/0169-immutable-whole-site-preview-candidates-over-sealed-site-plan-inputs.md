# ADR-0169: Immutable whole-Site Preview Candidates over sealed Site Plan inputs

**Status:** Accepted (founder-ratified Phase 23 D25 C-prime-R, 2026-08-23)

## Context

Phase 23 must give ministry staff fast Page-level visual feedback and a coherent
way to review Navigation, routes, shared sections, presentation packages, and
several related Pages before release. A literal preview environment, mutable
latest-draft Site, copied Supabase database, long-lived share link, or second
serving head would weaken D1 release truth, D12 acknowledged-revision recovery,
D22 exact locale lineages, D24’s one public audience, and Tenant isolation.

Payload Live Preview and Next.js Draft Mode provide useful rendering and browser
mechanics, but neither defines Asym’s durable review identity, authorization,
release semantics, or complete Site closure. The selected design therefore
combines bounded Page-local preview with an immutable whole-Site candidate that
uses the real D1 compiler and remains strictly subordinate to release.

## Decision

<!-- prettier-ignore -->
> **C-prime-amended-and-hardened (C-prime-R) — one exact, immutable Whole-Site
> Preview Candidate for one Tenant × environment × Site × BCP-47 locale and one
> sealed Site Plan input vector over D1’s public compiler, paired with B-prime’s
> bounded Page-local Preview page and Open exact preview cadences.** The ordinary
> Page-first **Preview page** action may show one optional wide-screen pane, or
> the same top-level full-screen view on narrow/zoomed screens, for the one
> active D12 editor; it advances only after an exact Working Revision is
> server-acknowledged, keeps the last still-authorized exact frame while work is
> unsaved, saving, conflicted, taken over or outcome-unknown, fences and discards
> late results, and never turns Payload form state, mutable `latest`, a browser
> message or a Draft Mode cookie into saved, reviewable or releasable truth.
>
> A deliberate **Prepare site preview** action in the Site Plan/release workspace,
> available only to a principal with current Site-wide preview capability,
> flushes that principal’s active editor and then freezes one explicit,
> server-fenced input vector selected by that cause-owned D1 preparation intent:
> the exact current D1 base generation—or D1’s code-owned empty genesis before a
> first release—the deliberately included D12-acknowledged Site-locale Working
> Revisions, and all exact Page Editorial, Placement, Navigation, route/redirect,
> Reusable Section, rich-text, topic, Dynamic Source, curation/windowing,
> media-rendition, presentation-package/profile, compiler/renderer/schema,
> deployment and safety-contract dependencies. It never sweeps all current
> drafts or other users’ browser-only work. Whole Site means every eligible
> route in that one exact locale; another locale is a separately sealed
> candidate, never silent fallback or a mixed cross-locale closure. Phase 22
> specialized families enter through the current D1 public projection or a
> separately authorized exact source-owned preview candidate, never by scanning
> mutable source drafts, copying operational records or widening source
> authority. A Page-scoped contributor, missionary, reviewer or named recipient
> remains on Phase 22 D10’s exact Page-local preview; D25 does not mask
> unauthorized routes and call the remainder a whole-Site candidate.
>
> Candidate preparation captures identifiers in one short stable database
> snapshot, performs compilation, Payload/source reads and artifact work outside
> locks with bounded concurrency, exact-version reads and idempotent
> content-addressed reuse, then re-proves complete scope, current authority,
> lifecycle/safety, dependency and runtime compatibility and seals one immutable
> manifest and receipt through a short CAS finalization. A candidate becomes
> **Ready** only if the complete route and render closure succeeds; partial work
> is never browsable. Later saves never move it: staff see **Newer saved changes
> available**, and **Prepare updated preview** creates an immutable successor.
> Failure leaves the last still-authorized exact candidate visibly unchanged;
> authorization or adverse-safety failure removes protected output, and no path
> falls back to live, generic presentation, another locale/Site/Tenant, raw
> provider data or favorable stale truth.
>
> The candidate executes the same provider-neutral public Presentation View
> Model, D1 compiler, D9 certified Site package and semantic renderers as public
> delivery, with exact candidate-only paths, Navigation, deep links, back/forward,
> 404s and bounded D3 redirects. Internal links remain inside the candidate;
> missing targets never escape to live. D14 source configuration is exact while
> intentionally dynamic membership is the current qualified public-safe
> projection, labelled **Live public data · as of …** and narrowed adverse-first.
> Giving, forms, subscriptions, notifications, analytics, tracking, prefetch,
> external embeds and consequential downloads remain dark; safe chrome may
> explain the qualified live destination without executing it or leaking a
> preview referrer.
>
> One quiet accessible preview chrome persistently says **Site preview · Not
> public**, names Site and exact locale, prepared time and included saved-change
> count, distinguishes current, newer, stale, blocked, expired and session-ended
> states, and provides **Back to editor**, permissioned **Edit this page**,
> **Prepare updated preview** and separately labelled **View live site**. Exact
> dependency ids remain behind details. Loading never steals focus or erases a
> still-safe frame; readiness opens only after a user action; status changes are
> programmatically announced; and the full journey must work at 320 CSS pixels,
> 400% zoom, keyboard, screen reader, touch, forced colors, reduced motion,
> RTL/bidirectional/CJK text, long localization, slow networks and suspended
> mobile tabs.
>
> Every HTML, RSC/data, route, redirect, asset, source and management request
> reauthorizes the current principal and server-derived exact scope. A URL,
> opaque candidate id, prior success, Payload login, cookie, iframe or popup is
> never authority; copied deep links work only for an independently authorized
> principal and no bearer/password/anonymous/public sharing exists. Preview
> responses are `private, no-store`, noindex/nofollow/noarchive and absent from
> public cache, canonical, hreflang, social, sitemap, search and analytics.
> Protected artifacts and assets stay behind the authenticated private server
> boundary; a public bucket or expiring signed URL never supplies candidate
> authority. Embedded Page Live Preview uses exact allowed origins,
> source-window equality, typed protocol version, session nonce and revision
> sequence. Privacy-safe observability records hashes, sizes, timings and cause
> codes—not content, route text, personal names or secrets.
>
> Supabase/Postgres stores only the compact scoped preparation/candidate
> manifest, immutable receipt and bounded normalized membership needed for
> integrity, route lookup, authorization and cleanup; compiled content-addressed
> artifacts live behind the private server boundary. Exposed rows use RLS, least
> grants, structural Tenant/environment/Site/locale integrity and indexes proven
> against actual policy and lookup shapes; privileged workers receive
> identifier-only jobs and independently validate complete scope. There is no
> copied Page/CRM/source corpus, database write per Page view or browser
> heartbeat history, Supabase Branch, cloned database, Realtime presence,
> per-Tenant retention matrix or service credential in the client. Preparation
> and serving use pooled short connections, set-based reads,
> bounded depth/concurrency, measured query/compile/artifact budgets, backpressure, idempotent
> cleanup and privacy-safe health alerts.
>
> A code-owned bounded renderable lifetime and exact package/compiler/deployment
> compatibility keep candidates recoverable without becoming permanent staging
> Sites. Expiry never redirects to live and ordinary Trash/safety changes may
> invalidate a candidate immediately. D1 alone performs fresh authority,
> compatibility, route, reference and safety proof and CAS-activates a new
> Public Site Generation; it may reuse independently qualified content-addressed
> work but can never promote a Preview Candidate, switch an environment alias or
> treat preview approval as publication. D25 creates no mutable staging head,
> cloned environment, permanent preview deployment/domain, arbitrary revision
> branch, release/approval/schedule authority, visual editing overlays, comments,
> presence, CRDT/OT, per-keystroke Site builds, tenant-defined preview settings,
> partially masked whole-Site view, destructive rollback or second source of
> public truth. Ratification records this product boundary only and authorizes no
> implementation, schema, migration, provider adoption, issue publication,
> deployment, release activation or production change.

## Consequences

- Staff have three clear tasks: **Preview page** for routine acknowledged-save
  feedback, **Open exact preview** for a pinned Page/review/schedule target, and
  **Prepare site preview** for deliberate complete-Site review.
- A Site preview is immutable, complete or unavailable, bound to one locale and
  one explicit Site Plan input vector, and replaced only by an explicit
  successor.
- A brand-new Site uses D1’s code-owned empty genesis rather than requiring a
  fake live generation or a special first-release architecture.
- Page-limited users remain on exact Page-local preview. Only current Site-wide
  capability opens a complete whole-Site candidate, and current authorization
  is rechecked on every continuation.
- D1/D9 rendering, D14 dynamic public-safe membership, D22 locale exactness,
  D24 public presentation, and Phase 10/21 adverse safety remain authoritative.
- Supabase stores compact scoped receipts rather than cloned content. Short
  snapshot/CAS transactions, private artifacts, RLS, grants, idempotency,
  bounded concurrency, expiry, and cleanup form the operational boundary.
- Preview is private, no-store, noindex, side-effect-dark, and absent from public
  cache, search, sitemap, social, analytics, and release authority.
- The design costs more complete-closure, concurrency, security, accessibility,
  migration, and operational proof than Page-only preview, but avoids the much
  larger cost and risk of a mutable staging platform.

## Rejected alternatives

- **Page-only Preview:** rejected as the complete D25 answer because it cannot
  verify coordinated Navigation, route, reusable-section, package, and multi-
  Page journeys, though it remains the ordinary fast editing cadence.
- **Mutable whole-Site latest-draft view:** rejected because reloads and later
  saves change what a reviewer is seeing and can sweep unrelated or unauthorized
  drafts into the result.
- **Supabase Branch, copied database, cloned Payload environment, permanent
  staging Site, environment alias, or per-candidate deployment:** rejected
  because each creates another lifecycle and practical serving head.
- **Bearer, password, anonymous, or public preview sharing:** rejected because
  locator possession cannot safely replace current Asym authorization for
  unpublished ministry content.
- **Direct promotion of the preview candidate:** rejected because D1 must freshly
  prove release authority, safety, routing, references, compatibility, and
  complete activation.
- **Per-keystroke Site builds, CRDT/OT, presence, visual overlays, comments, and
  tenant-configurable lifecycle matrices:** rejected as unrelated collaboration
  and staging products that would add substantial complexity and cost.

## Activation boundary

Ratification records architecture only. A future authorized implementation must
prove explicit candidate selection, current-generation and first-release bases,
complete closure and all-or-none readiness, exact Tenant/Site/locale authority,
RLS/grants, private assets, save and builder races, idempotency/CAS, route and
redirect behavior, D9 package/deployment skew, D14 adverse dynamic data,
side-effect darkness, cache and crawler exclusion, revocation, expiry, cleanup,
N/N+1 migration and rollback, production-shaped query/load budgets,
privacy-safe observability, and representative ministry-staff usability and
accessibility before activation.

## References

- [Phase 23 D25 exact formulation and decision brief](../prds/sitestacker-parity/research/phase-23-d25-preview-and-live-preview-decision-brief.md)
- [Phase 23 D25 complete adversarial review](../prds/sitestacker-parity/research/phase-23-d25-whole-site-preview-adversarial-review.md)
- [Phase 23 D25 whole-Site staff UX benchmark](../prds/sitestacker-parity/research/phase-23-d25-whole-site-preview-ux-benchmark.md)
- [Phase 23 D25 Supabase/Postgres research](../prds/sitestacker-parity/research/phase-23-d25-whole-site-preview-supabase-postgres-research.md)
- [Phase 23 D25 Payload/Next primary-source research](../prds/sitestacker-parity/research/phase-23-d25-payload-preview-live-preview-primary-source-research.md)
- [Phase 23 decision log](../prds/sitestacker-parity/phase-23-web-studio-cms-decision-log.md)
- [ADR-0145 — Page-local composition and coherent Site generations](./0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [ADR-0153 — Certified Site-bound custom Presentation Packages](./0153-certified-site-bound-custom-presentation-packages.md)
- [ADR-0156 — Bounded working revisions and recoverable active editor](./0156-bounded-editorial-working-revisions-and-recoverable-active-editor.md)
- [ADR-0161 — Derived Public Site Search Projection](./0161-derived-public-site-search-projection-and-adverse-first-convergence.md)
- [ADR-0165 — Asym-owned recoverable Trash](./0165-asym-owned-reference-aware-recoverable-trash.md)
- [ADR-0166 — Bounded localized editorial profile](./0166-bounded-localized-editorial-profile-over-exact-locale-lineages.md)
- [ADR-0168 — One exact public audience](./0168-one-exact-public-audience-and-app-owned-authenticated-surfaces.md)
- [Payload Live Preview](https://payloadcms.com/docs/live-preview/overview)
- [Next.js Draft Mode](https://nextjs.org/docs/app/guides/draft-mode)
- [Sanity Content Releases](https://www.sanity.io/docs/user-guides/content-releases)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [PostgreSQL transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html)

Ratification of this planning decision authorizes no implementation, schema,
migration, dependency or provider adoption, issue publication, deployment, D1
activation, release, or production change.
