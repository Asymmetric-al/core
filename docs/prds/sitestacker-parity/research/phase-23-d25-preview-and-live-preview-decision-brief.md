# Phase 23 D25 decision brief — Preview and Live Preview

**Status:** Founder-ratified C-prime-R on 2026-08-23 after primary-source
research, staff-UX and Supabase/Postgres review, and a complete 17-category
adversarial review.

**Date:** 2026-08-23

## Decision to make

Choose the smallest complete Phase 23 Preview product that gives ministry staff
fast, trustworthy visual feedback without turning a CMS iframe, mutable latest
draft, browser-only form state, or copied URL into authority.

This is one decision. It does not reopen D1–D24 and does not authorize
implementation, schema, migration, dependency adoption, issue publication, Git
publication, deployment, release, or production change.

## Why this decision is next

The source prompt requires Phase 23 to decide full-page Preview, Live Preview,
new-window Preview, responsive widths, whole-Site draft navigation, exact
preview identity, private delivery, public-safe dynamic data, and whether visual
editing belongs in scope.

Existing decisions already settle most of the boundary:

- [D1](../../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
  owns the public compiler and immutable Public Site Generation release.
- [D9](../../../adr/0153-certified-site-bound-custom-presentation-packages.md)
  requires the exact certified Site presentation package, not a generic admin
  approximation.
- [D12](../../../adr/0156-bounded-editorial-working-revisions-and-recoverable-active-editor.md)
  calls work saved only after exact server acknowledgement; browser-only,
  queued, conflicted, or outcome-unknown edits are not durable truth.
- [D13](../../../adr/0157-exact-revision-scheduled-publication-appointments-through-d1.md)
  pins an exact scheduled revision even when editing later continues.
- [D22](../../../adr/0166-bounded-localized-editorial-profile-over-exact-locale-lineages.md)
  requires one exact locale lineage with no silent field fallback.
- [D23](../../../adr/0167-exact-site-owned-ordinary-content-with-independent-copy-to-site-drafts.md)
  binds ordinary content to one exact Site.
- [D24](./phase-23-d24-public-audience-visibility-and-cache-policy-decision-brief.md)
  keeps Preview private, exact-version, authorized, non-indexable, and outside
  public caches.
- Phase 22 D10 already rejects bearer/shared preview links for Public Ministry
  Pages and requires one currently authorized principal viewing one exact saved
  revision or immutable candidate.

D25 must choose the product presentation and refresh behavior without weakening
those contracts.

## What current Core proves—and what it does not

The current authenticated route is a useful Phase 5 bridge:

- it allowlists four collection families;
- requires a signed-in Payload user;
- reads with `overrideAccess: false`; and
- reuses one current public serialization seam.

It is not the durable D25 product:

- [`preview-url.ts`](../../../../apps/admin/src/cms-ui/web-studio/adapters/preview-url.ts)
  carries only collection and document id;
- the
  [preview route](<../../../../apps/admin/app/(payload)/web-studio/preview/%5Bcollection%5D/%5Bid%5D/page.tsx>)
  requests `draft: true`, which resolves mutable latest draft state;
- the route owns a second generic admin block renderer rather than executing
  the exact D1 public compiler and D9 Site package;
- it does not bind or display exact Tenant, environment, Site, domain, locale,
  editorial/placement/Navigation revisions, candidate dependencies, package,
  compiler, or safety version;
- active links can leave Preview or trigger consequences;
- private response, framing, referrer, analytics, media, relationship, and
  no-public-cache policies are incomplete or implicit; and
- current tests do not prove exact-version reloads, renderer parity,
  authorization revocation, cross-Tenant isolation, side-effect darkness,
  accessibility, or failure recovery.

The current route should therefore be replaced or explicitly contained, not
silently promoted into the architecture.

## Current primary-source findings

### Payload v4 offers useful mechanics with different truth assumptions

[Payload Live Preview](https://payloadcms.com/docs/live-preview/overview) embeds
the real front end, supports dynamic multi-tenant/localized URLs, named viewport
widths, and a new-window presentation. Its client mode sends document changes
through `window.postMessage` as form data changes, including changes that have
not been saved. That is useful CMS machinery, but it conflicts with D12 if it is
described as an exact, recoverable, or reviewable revision.

[Payload server Live Preview](https://payloadcms.com/docs/live-preview/server)
can refresh a server-rendered route after save, autosave, or publish. That maps
more naturally to D12's acknowledged Working Revision. Payload's
[`draft: true` behavior](https://payloadcms.com/docs/versions/drafts) still
returns the most recent stored version, so an exact D25 target cannot be
represented by mutable `latest` alone.

The worktree pins internal/preview dependency lines rather than ordinary stable
releases. Payload and Next.js can implement an Asym-owned port only after exact-
pin source and deployed conformance checks; neither provider's iframe, form
message, role, Draft Mode cookie, or version endpoint becomes product authority.

### Comparable CMS products validate the UX, not every feature

[Contentful](https://www.contentful.com/developers/docs/tutorials/preview/content-preview/)
offers both side-by-side Live Preview and preview in a new tab.
[Storyblok](https://www.storyblok.com/docs/manuals/visual-editor) similarly
offers responsive embedded preview and standalone preview. This supports a
fast editor-side mode plus a deliberate full-page mode.

Advanced click-to-edit behavior is a separate instrumentation product.
[Contentful Inspector Mode](https://www.contentful.com/developers/docs/tutorials/preview/inspector-mode/)
needs source mapping or manually maintained field tags, while
[Sanity Presentation](https://www.sanity.io/docs/user-guides/preview-and-page-building)
adds overlays, route resolution, navigation modes, and separate sharing
behavior. With D9 custom packages and D11/D14/D22 semantics, adding dormant
overlay metadata now would be technical debt rather than a small enhancement.

### Browser and accessibility constraints are product requirements

[OWASP HTML5 guidance](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html)
requires exact `postMessage` target/receiver origins and validated message data;
origin prefix or substring checks are unsafe. The
[CSP specification](https://www.w3.org/TR/CSP/) makes parent and child framing
explicit. If a secure embedded session cannot work without broad origins,
bearer URLs, or weakened cookies, the top-level exact Preview remains the safe
fallback.

WCAG 2.2 requires a useful
[frame title](https://www.w3.org/WAI/WCAG22/Techniques/html/H64), meaningful
[focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order),
[320-CSS-pixel reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow), and
programmatically exposed
[status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages).
A split pane can therefore be optional on wide screens, but full-screen Preview
must be a first-class keyboard, screen-reader, mobile, and zoom path.

## Concrete ministry scenario

Maya edits Hope Global Missions' Spanish year-end Page on its Latin America
Site. The Page uses a distinctive D9 package, a D14 list of public projects, and
a giving CTA. A live Page already exists.

Maya changes a headline and image crop. While D12 is saving, Preview should keep
showing the last acknowledged revision and say **Waiting for saved changes**.
After the server returns revision 43, the editor-side Preview may advance to 43.
It uses the exact Spanish locale, Site package, Navigation, public-safe project
projection, and public renderer. Giving and external effects look
representative but cannot execute.

Maya then submits revision 43 for review while continuing to edit revision 44.
The reviewer opens a full-page Preview pinned to 43. It never drifts to 44,
never reveals English fallback or private project facts, and never becomes
public. **View live page** remains a separate action that opens the current D1
serving generation.

## Founder options

### Option A-prime — Exact saved full-page Preview only

One **Preview saved draft** action waits for D12 acknowledgement and opens a
private full-page view pinned to that exact revision and dependency closure.
Responsive widths and a user-initiated new-tab mode are available. Later saves
do not move the target; staff explicitly choose **Preview latest saved
version**. There is no editor-side auto-refreshing pane, whole-Site draft
navigation, or click-to-edit.

**Benefits**

- smallest security, accessibility, rendering, and operational surface;
- strongest saved-versus-unsaved distinction;
- stable review/scheduling artifact; and
- best baseline for mobile and low-powered devices.

**Costs**

- repeated context switching during visual editing;
- slower iteration on responsive layout, motion, media, and custom packages;
- staff may postpone Preview until late in the workflow; and
- a stale tab still needs excellent exact-target and freshness copy.

**Downstream consequence:** D25 replaces the mutable bridge with exact public-
renderer parity, but adds no embedded refresh channel. A future Live Preview
would require another decision.

### Option B-prime — One exact Preview product with acknowledged Live Preview and pinned review mode

Provide two presentations of one authorized compiler/view-model contract:

1. **Live Preview** is an optional Page-local editor pane for the one active
   D12 editor. It advances only after a new Working Revision is server-
   acknowledged. While work is unsaved, saving, conflicted, taken over, or
   outcome-unknown, it keeps the last exact rendering and says **Waiting for
   saved changes** or **Preview paused**.
2. **Open exact preview** is a full-page view pinned to a selected acknowledged,
   submitted, approved, scheduled, or release-candidate revision. Later saves
   never move it.

Both modes execute the same D1/public compiler, D9 package, exact locale, Page
placement, Navigation, semantic renderers, and public-safe dynamic projections.
Both are side-effect-dark: giving, forms, external embeds, tracking, prefetch,
and notifications cannot execute. Page-local links identify their target
rather than entering a mutable draft Site.

Automatic refresh is bounded: at most one render per active editor is in
flight; acknowledged updates are coalesced; every result is revision-fenced;
older late results are discarded. No per-keystroke database versions, general
Realtime channel, CRDT, presence system, or second publication head is needed.

The default authoring surface stays quiet. The optional pane is remembered per
user/device, not configured per Tenant. Narrow screens and high zoom use the
full-screen mode. Responsive controls have text labels such as **Responsive**,
**Narrow · 375 px**, **Medium · 768 px**, and **Wide · 1280 px**; they test
layout rather than claiming device emulation.

**Benefits**

- fastest trustworthy routine feedback after the existing short save cadence;
- one compiler and vocabulary for editor iteration and exact review;
- preserves D12/D13/Phase 22 exactness; and
- materially improves branded, responsive D9 package work without building a
  staging-Site platform.

**Costs**

- requires qualified frame/top-level lifecycle, focus handling, responsive
  controls, revision-fenced refresh, compiler budgets, and fallback behavior;
- “Live” means latest acknowledged save rather than every keystroke and must be
  explained truthfully; and
- public compiler performance must support bounded repeated private renders.

**Risks**

- an implementer could accidentally use Payload's raw per-keystroke form data;
- a stale frame could look current without a revision fence and visible state;
- embedded UI can become cramped or inaccessible if forced; and
- custom package code needs strict capability, origin, and response controls.

**Downstream consequence:** Payload Live Preview may supply selected mechanics
behind an Asym adapter, but not the truth model. D13/review always use pinned
mode. Whole-Site navigation, bearer links, click-to-edit, and multiple live
editors remain excluded.

### Option C-prime — Authenticated whole-Site candidate Preview environment

Build B plus one immutable private D1 candidate environment whose authorized
reviewers can navigate among all included Pages, routes, Navigation, reusable
sections, and presentation changes. The environment expires and never becomes a
public serving head.

**Benefits**

- highest fidelity for coordinated Navigation and multi-Page releases;
- reviewers can test complete journeys before release; and
- useful future foundation for large redesign or migration rehearsals.

**Costs**

- requires private candidate lifecycle, closure-wide minimum authorization,
  internal route/media continuation, expiration/cleanup, capacity, and more
  complicated failure masking;
- substantially larger browser, accessibility, security, and operational test
  matrix; and
- staff must distinguish active-Page Preview, candidate Site, and live Site.

**Risks**

- an editor authorized for one Page could infer another Page or asset;
- candidate sessions can become a second mutable Site head in practice;
- build/storage cost grows with Site size and edit frequency; and
- it overbuilds a staging-Site product before Page-local preview is proven.

**Downstream consequence:** D1 and Phase 12 need a separate private candidate-
session and closure-authorization contract. This is justified later only by
measured multi-Page review need.

## Comparison

| Criterion                       | A-prime  | B-prime            | C-prime                     |
| ------------------------------- | -------- | ------------------ | --------------------------- |
| Exact saved-revision proof      | Strong   | Strong             | Strong if correctly bounded |
| Routine authoring speed         | Fair     | Best               | Good, but heavier           |
| Stable review/scheduling        | Strong   | Strong pinned mode | Strong                      |
| Public-renderer/package parity  | Required | Required           | Required                    |
| Whole-Site journey testing      | No       | No                 | Yes                         |
| Authorization surface           | Smallest | Bounded Page-local | Largest closure-wide        |
| Accessibility burden            | Moderate | Moderate–High      | High                        |
| Operational/build cost          | Lowest   | Bounded            | Highest                     |
| Overengineering risk            | Low      | Low–Medium         | High                        |
| Fit with D12 acknowledged saves | Native   | Native by design   | Native but complex          |

## Founder selection and architectural correction

The founder selected **Option C-prime — Whole-Site candidate Preview
environment**. The selection survives the adversarial review, but the word
“environment” must not become the implementation model or staff-facing term.

The permanent product is an immutable **Whole-Site Preview Candidate** inside
one quiet **Site preview** workspace. It supplements—not replaces—B-prime’s fast
Page-local cadences. It is not a cloned Supabase database, Payload environment,
staging Site, mutable preview head, per-candidate deployment, or release target.

The decisive correction is selection semantics: **Prepare site preview** freezes
one explicit D1 Site Plan input vector over the current public generation—or
D1’s code-owned empty genesis before a first release. It never sweeps every
current draft. This makes inclusion understandable to staff, reproducible for
reviewers, and bounded for Supabase/Postgres.

## Exact founder-ratified C-prime-R formulation

> **C-prime-amended-and-hardened (C-prime-R) — one exact, immutable Whole-Site
> Preview Candidate for one Tenant × environment × Site × BCP-47 locale and one
> sealed Site Plan input vector over D1’s public compiler, paired with B-prime’s
> bounded Page-local Preview page and Open exact preview cadences.** The ordinary
> Page-first **Preview page** action may
> show one optional wide-screen pane, or the same top-level full-screen view on
> narrow/zoomed screens, for the one active D12 editor; it advances only after
> an exact Working Revision is server-acknowledged, keeps the last
> still-authorized exact frame while work is unsaved, saving, conflicted, taken over
> or outcome-unknown, fences and discards late results, and never turns Payload
> form state, mutable `latest`, a browser message or a Draft Mode cookie into
> saved, reviewable or releasable truth.
>
> A deliberate **Prepare site preview** action in the Site Plan/release workspace,
> available only to a principal with current Site-wide preview capability,
> flushes that principal’s active editor and then freezes one explicit,
> server-fenced input vector selected by that cause-owned D1 preparation intent:
> the exact current D1 base generation—or D1’s code-owned empty genesis before a
> first release—the deliberately included D12-acknowledged Site-locale Working
> Revisions, and all exact Page Editorial,
> Placement, Navigation, route/redirect, Reusable Section, rich-text, topic,
> Dynamic Source, curation/windowing, media-rendition,
> presentation-package/profile, compiler/renderer/schema, deployment and safety-contract
> dependencies. It never sweeps all current drafts or other users’ browser-only
> work. Whole Site means every eligible route in that one exact locale; another
> locale is a separately sealed candidate, never silent fallback or a mixed
> cross-locale closure. Phase 22 specialized families enter through the current
> D1 public projection or a separately authorized exact source-owned preview
> candidate, never by scanning mutable source drafts, copying operational records
> or widening source authority. A Page-scoped contributor, missionary, reviewer
> or named recipient remains on Phase 22 D10’s exact Page-local preview; D25 does
> not mask unauthorized routes and call the remainder a whole-Site candidate.
>
> Candidate preparation captures identifiers in one short stable database
> snapshot, performs compilation, Payload/source reads and artifact work outside
> locks with bounded concurrency, exact-version reads and idempotent
> content-addressed reuse, then re-proves complete scope, current authority,
> lifecycle/safety, dependency and runtime compatibility and seals one immutable manifest
> and receipt through a short CAS finalization. A candidate becomes **Ready**
> only if the complete route and render closure succeeds; partial work is never
> browsable. Later saves never move it: staff see **Newer saved changes
> available**, and **Prepare updated preview** creates an immutable successor.
> Failure leaves the last still-authorized exact candidate visibly unchanged;
> authorization or adverse-safety failure removes protected output, and no path
> falls back to live, generic presentation, another locale/Site/Tenant, raw
> provider data or favorable stale truth.
>
> The candidate executes the same provider-neutral public Presentation View
> Model, D1 compiler, D9 certified Site package and semantic renderers as public
> delivery, with exact candidate-only paths, Navigation, deep links,
> back/forward, 404s and bounded D3 redirects. Internal links remain inside the
> candidate; missing targets never escape to live. D14 source configuration is
> exact while intentionally dynamic membership is the current qualified
> public-safe projection, labelled **Live public data · as of …** and narrowed
> adverse-first. Giving, forms, subscriptions, notifications, analytics, tracking,
> prefetch, external embeds and consequential downloads remain dark; safe chrome
> may explain the qualified live destination without executing it or leaking a
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
> RTL/bidirectional/CJK text, long localization, slow networks and suspended mobile
> tabs.
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
> authority. Embedded Page Live Preview uses exact allowed origins, source-window
> equality, typed protocol version, session nonce and revision sequence.
> Privacy-safe observability records hashes, sizes, timings and cause codes—not content,
> route text, personal names or secrets.
>
> Supabase/Postgres stores only the compact scoped preparation/candidate
> manifest, immutable receipt and bounded normalized membership needed for
> integrity, route lookup, authorization and cleanup; compiled content-addressed
> artifacts live behind the private server boundary. Exposed rows use RLS, least
> grants, structural Tenant/environment/Site/locale integrity and indexes proven
> against actual policy and lookup shapes; privileged workers receive
> identifier-only jobs and independently validate complete scope. There is no
> copied Page/CRM/source corpus, database write per Page view or browser heartbeat history,
> Supabase Branch, cloned database, Realtime presence, per-Tenant retention matrix
> or service credential in the client. Preparation and serving use pooled short
> connections, set-based reads, bounded depth/concurrency, measured
> query/compile/artifact budgets, backpressure, idempotent cleanup and privacy-safe
> health alerts.
>
> A code-owned bounded renderable lifetime and exact package/compiler/deployment
> compatibility keep candidates recoverable without becoming permanent staging
> Sites. Expiry never redirects to live and ordinary Trash/safety changes may
> invalidate a candidate immediately. D1 alone performs fresh authority,
> compatibility, route, reference and safety proof and CAS-activates a new Public
> Site Generation; it may reuse independently qualified content-addressed work
> but can never promote a Preview Candidate, switch an environment alias or
> treat preview approval as publication. D25 creates no mutable staging head,
> cloned environment, permanent preview deployment/domain, arbitrary revision
> branch, release/approval/schedule authority, visual editing overlays, comments,
> presence, CRDT/OT, per-keystroke Site builds, tenant-defined preview settings,
> partially masked whole-Site view, destructive rollback or second source of
> public truth. Ratification records this product boundary only and authorizes no
> implementation, schema, migration, provider adoption, issue publication,
> deployment, release activation or production change.

## Evidence package

- [Repository and current-contract audit](./phase-23-d25-preview-contract-and-repository-audit.md)
- [Payload v4 and Next.js primary-source research](./phase-23-d25-payload-preview-live-preview-primary-source-research.md)
- [Page Preview UX and security benchmark](./phase-23-d25-preview-ux-security-benchmark.md)
- [Whole-Site staff UX benchmark](./phase-23-d25-whole-site-preview-ux-benchmark.md)
- [Supabase/Postgres candidate research](./phase-23-d25-whole-site-preview-supabase-postgres-research.md)
- [Complete C-prime adversarial review](./phase-23-d25-whole-site-preview-adversarial-review.md)

## Ruthless adversarial result

Every required category has a material concern **before** the C-prime-R controls.
That is not a finding that the product is unsound; it is the reason the selected
option needs the bounded formulation above.

| Category                          | What could go wrong and why it matters                                                                                                                                             | Severity | Likelihood                                             | Evidence/reasoning                                                                                                                                     | Permanent prevention                                                                                                                                                                        |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | Mutable `latest`, a missing first-release base, incomplete closures, fixed iframes, locale drift, or deploy skew can change or block a review beneath staff.                       | High     | High without exact selection                           | Modern release/perspective systems pin a selected view; D1/D12 already require exact generations/revisions.                                            | Immutable manifest, current D1 generation or code-owned empty genesis, explicit Site Plan input vector, exact dependency closure, successor candidates, compatibility proof.                |
| Technical debt                    | A second renderer, copied database, provider-native snapshot, or preview promotion path becomes a second CMS runtime.                                                              | Critical | Medium–high under literal “environment” implementation | Current Core Preview is Page-id based and generic; D1 already owns public compilation and release.                                                     | Reuse D1 compiler/D9 package; compact receipt plus private artifacts; no clone, second head, or promotion.                                                                                  |
| Edge cases                        | Concurrent saves, takeover, expired access, removed Pages/media, redirect loops, mixed locales, suspended tabs, and failed successors can show the wrong thing.                    | High     | High over product lifetime                             | These are normal consequences of D12 concurrency, D3 routing, D21 Trash, D22 locale, and mobile browser behavior.                                      | Revision/CAS fencing, complete validation matrix, exact-locale candidate, candidate-local 404, explicit prior-candidate recovery.                                                           |
| Footguns                          | “Live,” “staging,” copied URLs, active giving/forms, or a prominent release-looking control can mislead staff or cause real effects.                                               | High     | Medium–high                                            | Preview products often combine editing, sharing, and publication concepts; D24 permits only public presentation plus app-owned authenticated surfaces. | Exact copy, persistent **Not public**, separate **View live site**, inert effects, no share or activation command.                                                                          |
| Tenant safety                     | Forged ids, broad relationship population, media URLs, caches, workers, or weak RLS can expose another Tenant/Site/Page.                                                           | Critical | Medium without structural enforcement                  | Supabase explicitly treats RLS as defense in depth, while `authenticated` alone is not Tenant authorization.                                           | Composite structural scope, RLS plus least grants, per-request reauthorization, identifier-only jobs, hostile warm/cold-cache tests.                                                        |
| Overengineering                   | Branches, cloned environments, per-candidate deploys, Realtime presence, CRDT, visual overlays, configurable TTLs, and arbitrary perspective stacks create cost without D25 value. | High     | High if “environment” is interpreted literally         | Comparable enterprise CMSs offer these separately; D25 only needs exact private journey review.                                                        | One candidate type, one locale, fixed lifecycle, bounded Page/Site cadences, explicit non-goals.                                                                                            |
| UX/UI and user friction           | Three ambiguous Preview buttons, fake progress, cramped panes, technical ids, stale tabs, or candidate/live similarity erode trust.                                                | High     | High unless deliberately designed                      | Whole-Site review is occasional, high-consequence work; WCAG requires robust status, focus, reflow, and input behavior.                                | **Preview page**, **Open exact preview**, **Prepare site preview** in their proper contexts; quiet persistent chrome, inclusion summary, full-screen responsive path, usability/a11y proof. |
| Hidden coupling                   | Payload `_status`, raw form JSON, Draft Mode cookies, current route code, or package internals can become product truth.                                                           | High     | Medium–high                                            | Payload Live Preview and Next Draft Mode are transport/rendering mechanics, not Asym authorization or candidate identity.                              | Provider-neutral versioned manifest/protocol, public-safe view model, adapters, exact package/compiler compatibility.                                                                       |
| Failure modes                     | A failed build/source/auth check may silently show partial, old, live, generic, cross-locale, or favorable stale content.                                                          | High     | Medium–high                                            | Multi-source complete-site assembly has independent causes and D21 safety must narrow adverse-first.                                                   | Preparing/Ready/Failed contract, all-or-none readiness, no live fallback, explicit safe prior candidate, cause-owned recovery.                                                              |
| Data integrity risks              | Duplicate prepares, out-of-order builders, cleanup races, and later saves can corrupt membership or move a ready candidate.                                                        | High     | Medium                                                 | Distributed compilation crosses database, Payload/source reads, and artifact storage.                                                                  | Idempotency digest, short snapshot/CAS transactions, immutable receipt, manifest-last finalization, N/N+1 readers.                                                                          |
| Security and privacy risks        | Bearer preview URLs, signed assets, public caches, raw drafts, referrers, third-party embeds, or sensitive logs can disclose missionary information.                               | Critical | Medium without fail-closed delivery                    | Supabase signed URLs are transport grants, not revocable application authorization; preview data is non-public by definition.                          | Independent auth every continuation, private server asset boundary, no-store/noindex/no-referrer/CSP, dark third parties, privacy-safe telemetry.                                           |
| Scalability and performance risks | Whole-Site work per save, N+1 reads, deep population, connection exhaustion, duplicate artifacts, or custom-package cost can impair staff and public release.                      | High     | Medium–high without budgets                            | Whole-Site closure size grows with Pages, media, relationships, locales, and packages; Supabase pool and query behavior must be measured.              | Explicit-only preparation, set-based reads, short pooled connections, bounded depth/concurrency, structural reuse, backpressure, production-shaped query/load proof.                        |
| Operational burden                | Orphans, custom preview domains, cloned databases, package exceptions, and manual cleanup can require continual developer intervention.                                            | High     | High for a literal environment-per-candidate design    | Environment aliases and clones require lifecycle/promotion operations that D1 intentionally avoids.                                                    | Shared qualified runtime, code-owned expiry, idempotent cleanup, bounded queue, small cause-owned health surface.                                                                           |
| Observability gaps                | “Preview is wrong” is not diagnosable if save, selection, auth, source, package, compiler, route, cache, deploy, or cleanup cannot be distinguished.                               | High     | High unless instrumented first                         | C-prime adds an asynchronous multi-stage path whose failures can otherwise look identical to staff.                                                    | Candidate/correlation ids, stage/cause codes, latency/closure/reuse/cleanup metrics, privacy-safe alerts, staff-readable recovery.                                                          |
| Dependency and integration risks  | Payload v4, Next preview behavior, Supabase Storage/RLS, certified packages, or source providers may change underneath the contract.                                               | High     | Medium–high over upgrades                              | Payload and Next expose useful primitives but do not supply D25’s whole Asym contract.                                                                 | Exact pins, adapter boundaries, conformance fixtures, upgrade qualification, unknown-version fail closed.                                                                                   |
| Migration and upgrade risks       | Persisted provider internals, unversioned manifests, mixed old/new workers, or two preview authorities can strand candidates or leak them after rollback.                          | High     | Medium                                                 | Async jobs and retained candidates naturally span deployments.                                                                                         | Versioned portable manifest, additive migrations, N/N+1 readers/workers, explicit old-route retirement, canary/rollback proof.                                                              |
| Other development hazards         | Lost acknowledgements, duplicate clicks, stale workers, cleanup-vs-view races, popup/focus issues, weak ownership, or deployment rollback can leave ambiguous outcomes.            | High     | Medium–high                                            | D12 already recognizes outcome-unknown saves; D25 adds longer asynchronous work and browser lifecycle variation.                                       | One owned state machine, stable lock order, idempotent retries/receipt lookup, stale-result fencing, user-opened readiness, race/chaos/browser tests.                                       |

## Ruthless synthesis

### Must be true before implementation can be accepted

1. Ratify one immutable Site-locale candidate, explicit Site Plan input vector,
   complete dependency closure, and D1 as the only release authority.
2. Preserve the three clear cadences: **Preview page** for routine acknowledged
   edits, **Open exact preview** for pinned Page/review/schedule truth, and
   **Prepare site preview** only for deliberate whole-Site review.
3. Build through the real D1/D9 public compiler and D24 public-safe view model;
   prove candidate-local routing, D22 exact locale, D14 current/freshness-labelled
   dynamic membership, and inert side effects.
4. Seal all-or-none candidates with short snapshot/CAS transactions, immutable
   manifests, idempotent content-addressed reuse, bounded concurrency, and no
   clone, per-view write, or long database lock.
5. Enforce current Site-wide authority on every continuation with structural
   Tenant/environment/Site/locale integrity, RLS plus grants, private assets,
   adverse-first revocation, and no bearer/public sharing.
6. Ship the truthful accessible staff journey and cause-owned failure states;
   never fall through to live or silently substitute a previous candidate.

### Required in the same delivery slice

1. Cross-Tenant/RLS, concurrency/CAS, route/redirect, package/deploy skew,
   dynamic-source safety, effects, cache, expiry/cleanup, migration N/N+1,
   production-shaped query/load, accessibility, and representative ministry-
   staff usability tests.
2. Privacy-safe operational metrics for preparation latency, closure size,
   artifact reuse, database time, queue delay, failure cause, cleanup lag, and
   cost per Site, with bounded alerts and a rollback-safe kill path.
3. Explicit retirement of the current mutable Page-id preview authority once the
   qualified replacement is activated; there must never be two authorities.

### Monitor; do not pre-build configurability

Measure how often staff use whole-Site review, abandon or repeat preparation,
mistake Preview for live, encounter package/source failures, and need recovery.
Use that evidence to tune fixed budgets and copy. Do not add branches, sharing,
custom domains, tenant TTL matrices, overlays, comments, presence, or cloned
environments without a later founder decision.

## Ratification

The founder ratified the exact C-prime-R formulation above as **Phase 23 D25**
on 2026-08-23. Ratification records the product and architecture boundary only;
it authorizes no implementation, schema, migration, provider adoption, issue
publication, deployment, release activation, or production change.
