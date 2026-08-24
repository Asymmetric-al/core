# Phase 23 D25 research — Preview and Live Preview contract and repository audit

**Status:** Supporting evidence for founder-ratified Phase 23 D25 C-prime-R.
This document records repository and ratified-contract evidence only. It does not authorize
implementation, schema, migration, provider adoption, issue publication, Git
publication, deployment, release, or production change.

## Decision in plain language

Phase 23 now needs one product decision about what **Preview** and **Live
Preview** mean after D1–D24. The decision is not whether an iframe can display a
draft. It is which exact private state staff see, how quickly it follows edits,
whether it can navigate beyond the current Page, and which security and release
claims the product may truthfully make.

The current route is an authenticated interim bridge. It must not become the
durable contract merely because it already renders something useful.

## Sources inspected

### Ratified Phase 23 authority chain

- [D1 — Page-local composition and coherent Public Site Generations](../../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [D9 — Certified Site-bound custom Presentation Packages](../../../adr/0153-certified-site-bound-custom-presentation-packages.md)
- [D10 — Complete-cohort Site Presentation Activation](../../../adr/0154-complete-cohort-site-presentation-activation-through-d1.md)
- [D11 — Versioned CMS Rich Text Profile](../../../adr/0155-bounded-versioned-cms-rich-text-profile-and-typed-video-embeds.md)
- [D12 — Server-acknowledged Working Revisions and recoverable active editor](../../../adr/0156-bounded-editorial-working-revisions-and-recoverable-active-editor.md)
- [D13 — Exact-revision Scheduled Publication Appointments](../../../adr/0157-exact-revision-scheduled-publication-appointments-through-d1.md)
- [D22 — Exact locale lineages with no silent field fallback](../../../adr/0166-bounded-localized-editorial-profile-over-exact-locale-lineages.md)
- [D23 — Exact Site-owned ordinary content](../../../adr/0167-exact-site-owned-ordinary-content-with-independent-copy-to-site-drafts.md)
- [D24 — One exact public audience and app-owned authenticated surfaces](./phase-23-d24-public-audience-visibility-and-cache-policy-decision-brief.md)

### Cross-phase authorities

- [Phase 5 — Public Website Runtime Contract](../phase-05-public-website-runtime-contract.md)
- [Phase 10 — Sensitive Data Safety](../phase-10-sensitive-data-safety.md)
- [Phase 12 — Full Role and Permission Configuration](../phase-12-full-role-permission-configuration.md)
- [Phase 22 specification PR #1323](https://github.com/Asymmetric-al/core/pull/1323),
  especially
  [ADR-0127 — Authenticated exact-version Public Ministry Preview](https://github.com/Asymmetric-al/core/blob/codex/phase-22-public-ministry-pages-grill/docs/adr/0127-authenticated-exact-version-public-ministry-preview.md)

### Current repository implementation and tests

- [Authenticated preview route](<../../../../apps/admin/app/(payload)/web-studio/preview/%5Bcollection%5D/%5Bid%5D/page.tsx>)
- [Preview model](../../../../apps/admin/src/cms/preview/authenticated-preview.ts)
- [Preview URL adapter](../../../../apps/admin/src/cms-ui/web-studio/adapters/preview-url.ts)
- [Native document workspace](../../../../apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/NativeCollectionEditView.tsx)
- [Editor-state adapter](../../../../apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/editor-state.ts)
- [Collection presentation registry](../../../../apps/admin/src/cms-ui/web-studio/collections/config.ts)
- [Payload configuration](../../../../apps/admin/payload.config.ts)
- [Public rich-text renderer](../../../../packages/lib/cms/public-page-renderer.tsx)
- [Current public Page route](<../../../../apps/donor/app/(public)/(solid)/%5B...cmsSlug%5D/page.tsx>)
- [Preview URL tests](../../../../tests/unit/cms/web-studio-preview-url.test.ts)
- [Preview model tests](../../../../tests/unit/cms/web-studio-authenticated-preview.test.ts)
- [Editor-state tests](../../../../tests/unit/cms/web-studio-editor-state.test.ts)
- [CMS publish-flow guard test](../../../../tests/e2e/cms-publish-flow.spec.ts)
- [CMS local happy path](../../../../tests/e2e/cms-local-happy-path.spec.ts)
- [Web Studio living specification](../../../guides/architecture/web-studio-living-spec.md)
- [Web Studio runbook](../../../guides/development/web-studio-runbook.md)

## Non-negotiable authority boundaries

These are already settled and D25 may not reopen them.

| Concern                          | Existing authority | Binding D25 consequence                                                                                                                                                                                   |
| -------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public release                   | D1                 | Preview may compile a private candidate but cannot mutate a serving head, publish, or prove public delivery.                                                                                              |
| Page-local content and placement | D1                 | A Page preview binds exact editorial and placement revisions; it does not read mutable `latest`.                                                                                                          |
| Custom Site presentation         | D9                 | Preview must use the exact certified package/profile and public presentation view model that the candidate would use. A generic admin template is not parity.                                             |
| Whole-Site design activation     | D10                | Design comparison may use D25 preview primitives, but only D10 can activate the complete locale cohort.                                                                                                   |
| Rich text and embeds             | D11                | Editor, backend validation, compiler, preview, public renderer, extraction, and migration must share one exact profile. Raw or best-effort Lexical rendering is insufficient.                             |
| Working draft                    | D12                | Preview waits for one server-acknowledged Working Revision. Browser-only, queued, in-flight, conflicted, or outcome-unknown edits cannot be called previewed or saved.                                    |
| Scheduled target                 | D13                | A scheduled preview binds the exact scheduled revision and reviewed dependencies. Later autosaves are visibly excluded.                                                                                   |
| Locale                           | D22                | Every preview requests and names one exact BCP-47 locale. Provider fallback and mixed-locale field assembly are forbidden.                                                                                |
| Site ownership                   | D23                | Preview names and authorizes one exact Tenant, environment, Site, domain, Page identity, locale, and revision. Copy provenance grants nothing.                                                            |
| Public audience                  | D24                | Preview is private, exact-version, authorized, `no-store`, and `noindex`; public CMS output remains the same for every visitor. Preview never creates a public cache variant.                             |
| Public renderer boundary         | Phase 5            | Preview uses the real public compiler/renderer and allowlisted public-safe projections, not a second admin renderer or raw provider document.                                                             |
| Sensitive information            | Phase 10           | Staff access does not make private operational fields safe for the public renderer. Current source safety can narrow output adverse-first.                                                                |
| Authorization                    | Phase 12           | Authentication identifies a principal but does not authorize a Tenant, Site, Page, locale, revision, candidate, media item, or preview action. Every request reauthorizes.                                |
| Specialized ministry preview     | Phase 22 D10       | No bearer, anonymous, shared-password, permanent-link, or Draft-Mode-cookie authority. Contributors, reviewers, and named recipients see only one exact authorized saved revision or immutable candidate. |

### One apparent predecessor conflict is already resolvable

Phase 5 reserved a possible expiring non-staff review link. Later Phase 22 D10
explicitly rejected bearer preview access and reused verified principals plus
Phase 12 named grants instead. D25 should adopt the stronger rule for the common
preview platform rather than build two preview authorization systems. An opaque
URL may locate an exact revision, but possession is never authority.

## What the current repository actually does

### Useful bridge behavior already present

1. Preview collection names are allowlisted to Pages, Missionary Giving Pages,
   Project Pages, and Ministry Updates.
2. The route authenticates through Payload and redirects unauthenticated users
   to login with a return path.
3. The draft read uses the authenticated request, `draft: true`, and
   `overrideAccess: false`.
4. Page-like records pass through the current public serializer, so current CTA
   sanitization is shared in at least that narrow seam.
5. The root admin layout is globally `noindex`/`nofollow`.
6. The native editor distinguishes authenticated preview from a separately
   labelled published Page link.
7. Tests cover the URL shape, collection allowlist, unauthenticated redirect,
   basic draft rendering, and one serializer-sanitization example.

These facts make the route safer than a public draft URL. They do not prove the
durable D25 contract.

### Current bridge limitations

| Limitation                     | Repository evidence                                                                                                                                                                                                                | Why it matters for D25                                                                                                          |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Mutable target                 | The route calls `findByID({ draft: true, id })`; the URL carries only collection and document id.                                                                                                                                  | A reload can show a newer autosave than the revision reviewed, scheduled, or initially opened.                                  |
| Incomplete identity            | No environment, Site, domain, locale, editorial revision, placement revision, Navigation revision, D1 candidate, package/profile, compiler, source-catalog, or safety version is bound or displayed.                               | Staff cannot tell exactly what they are seeing, and the server cannot prove candidate parity.                                   |
| Tenant-level staff access      | Current collection access resolves authenticated staff and Tenant, with super-admin bypass; the route has no D25-specific exact capability or Phase 22 contributor/named-recipient grant.                                          | “Signed in” remains broader than exact Page/version preview authority.                                                          |
| Separate renderer              | The route owns `renderPreviewLayout` and a generic admin shell, while the public route has different composition and no D9 package/chrome/Navigation integration.                                                                  | Preview can look correct while the actual public package, layout, route, metadata, Navigation, or responsive behavior is wrong. |
| Deep provider document         | The route reads with `depth: 2` and accepts populated media objects/raw URLs.                                                                                                                                                      | Staff authorization can accidentally feed private relationship fields or unqualified media into a public-looking renderer.      |
| Active consequences            | Preview CTAs and links are ordinary anchors; no common side-effect-dark capability layer is proven.                                                                                                                                | A reviewer can leave the exact preview, trigger checkout/navigation, or pollute analytics while trying to inspect content.      |
| Response privacy is implicit   | Root metadata supplies `noindex`, but the route does not establish explicit `private, no-store`, referrer suppression, analytics exclusion, archive exclusion, or exact frame policy.                                              | Dynamic rendering and authentication do not by themselves complete the confidentiality contract.                                |
| Live Preview is not configured | `useLivePreviewContext()` and a conditional stock subview link exist, but `payload.config.ts` and the collection configs contain no `livePreview` configuration. Living docs call the nested surface partial/stock.                | The UI seam must not be described as a functioning or qualified Live Preview product.                                           |
| Misleading product state       | The state strip calls preview “Authenticated” and calls Payload `_status` “Public”; neither names exact candidate identity nor D1 serving authority.                                                                               | Authentication is not authorization, and provider published state is not D1 Live.                                               |
| Incomplete product coverage    | Navigation, Page Placement, reusable sections, presentation changes, locale comparison, and whole Site candidates have no one preview contract.                                                                                    | D1 dependency closure can differ from the isolated provider document.                                                           |
| Narrow tests                   | No hostile cross-Tenant/Site/locale/version tests, permission revocation, exact-revision reload, no-store/noindex/referrer proof, package parity, inert effects, dynamic-source safety, cache isolation, or failure matrix exists. | The current green tests cannot support a D25 security or fidelity claim.                                                        |

### Exact dependency posture

The Phase 23 worktree currently pins Next.js `16.3.0-preview.9` and Payload
packages `4.0.0-internal.1f9ae9a`. Both are non-general-release lines. D25 must
remain provider-neutral, use supported adapter seams, and require exact-pin
source/docs/conformance review at implementation time. It must not make a
Payload iframe, Draft Mode cookie, current stock subview, or preview-version API
the product authority.

## Concrete nonprofit-ministry scenarios D25 must solve

### 1. Ordinary Page editing with visual feedback

Maya edits Hope Global Missions' Spanish year-end Page on the Latin America
Site. She changes a headline, image crop, and CTA label. The public Spanish Page
must remain unchanged. While D12 is saving, preview says it is waiting for the
save rather than silently showing browser-only text. After acknowledgement, the
preview advances to the exact receipt and says which revision it represents.

### 2. Published Page with newer private work

The Page already has a live version. Maya needs two unmistakable actions:
**Preview saved draft** and **View live page**. The draft preview cannot drift
when a later autosave lands, and the live Page cannot be presented as the draft.

### 3. Reviewer or scheduled-release inspection

An editor submits revision 42 for review and later creates a D13 appointment for
that exact revision. A reviewer or scheduler opening Preview must always see
revision 42 and its pinned semantic dependencies, even if revision 43 now
exists. The UI may announce a newer saved revision without switching targets.

### 4. Localized content

Maya previews Spanish. The banner, document language, layout direction, route,
Navigation, SEO/social information, and content all represent Spanish only.
Missing Spanish fields fail honestly; English fields never appear as silent
fallback. A language control changes to another separately authorized exact
locale preview, not one mixed document.

### 5. Custom presentation and responsive behavior

The Tenant uses a D9 custom package with distinctive typography, motion, and
mobile composition. Preview must use that exact candidate package, respect
reduced motion, and offer representative narrow/tablet/wide viewport controls.
Those controls resize a real responsive viewport; they do not claim to emulate
particular hardware, browsers, bandwidth, or assistive technology.

### 6. Dynamic public-safe content

The Page contains a D14 Content List of current projects. Preview combines the
exact saved list configuration with current public-safe source projections and
labels that operational membership may change independently. Staff authority
never reveals restricted projects, private support totals, or unpublished
source records.

### 7. Specialized ministry contributor or named recipient

A missionary contributor previews their own exact saved Public Ministry Page,
or one named spouse/leader has an exact Phase 12 preview grant for an immutable
candidate. Neither receives general Web Studio, edit, review, release, giving,
or financial authority. Every document, RSC/data, media, and refresh request
rechecks that grant and current Phase 10/D9 safety.

### 8. Session expiry, revocation, and takeover

Maya's login expires while her preview is open, or a second editor takes over
the D12 lease. Preview reauthenticates without turning its URL into authority,
then rechecks the exact target. Revocation fails closed on the next fetch. A
displaced editor may still view an already authorized pinned revision, but
cannot cause Live Preview to advance from a lease they no longer own.

### 9. Multi-Site clarity

A Page copied to another Site remains an independent private draft. Preview
persistently names **Latin America Site · latam.example.org · es · revision
42 · not public**. Source-Site provenance is help/audit context only and never
changes presentation or permission.

### 10. Failure without false confidence

If source resolution, the compiler, a custom package, media qualification, or
authorization fails, Preview shows one cause-owned private failure. It never
falls back to raw Payload JSON, mutable latest, another locale, another Site,
the live Page, the standard package without disclosure, or staff-only data.

## The product facts every mode must expose

The preview chrome should derive, not invite staff to configure, the smallest
set of facts needed to prevent guesswork:

- **Scope:** Site name, primary domain, exact locale, Page title/path and family.
- **Target:** saved Working Revision, immutable review/release candidate, exact
  scheduled revision, or current live generation—never just “draft.”
- **Freshness:** exact revision identifier in accessible details, saved time,
  whether a newer saved revision exists, and whether public-safe dynamic facts
  are current independently.
- **Public consequence:** **Preview — not public** and, when applicable,
  **View live page** as a distinct action.
- **Presentation:** exact package/profile/renderer generation in diagnostic
  details, not noisy primary chrome.
- **Safety:** blocked/degraded public-safe content and the exact owner/action;
  never raw sensitive cause details for an unauthorized viewer.

Healthy ordinary editing should show one quiet sentence, not a dashboard of
technical versions. Details remain available on demand for support and release
review.

## Founder options

### Option A-prime — Exact saved full-Page Preview only

Provide one **Preview saved draft** action after D12 acknowledgement. It opens a
private full-Page/new-window preview pinned to the exact saved revision and
candidate closure. Responsive widths are available in that preview. Later saves
do not change it; the banner offers **Preview latest saved version**. There is no
auto-refreshing preview beside the editor and no draft-site navigation.

**Benefits**

- Smallest implementation and security surface.
- Strongest distinction between saved evidence and browser-only work.
- Excellent for review, scheduling, regression proof, and lower-power devices.
- Reuses D12 revision receipts and D1 candidate compilation without a live
  synchronization channel.

**Costs**

- More context switching and repeated Preview actions during visual editing.
- Editors may wait for save, reopen, resize, return, edit, and repeat.
- Custom-package and responsive design iteration is slower and less satisfying.

**Risks**

- Staff may avoid Preview until late, allowing layout defects to accumulate.
- A separate tab can become stale without very clear target/freshness chrome.
- Tenant designers may perceive Web Studio as less capable than modern CMSs.

**Downstream consequences**

- No Live Preview transport or embedded frame lifecycle is needed.
- D25 still must replace the current mutable admin renderer with exact D1/public
  compiler parity and the complete authorization/privacy contract.
- A later Live Preview addition remains possible but requires a new decision.

### Option B-prime — One exact Preview product with acknowledged Live Preview and pinned review mode

Use one Preview product with two purpose-shaped presentations over the same
authorized compiler and public-safe view model:

1. **Live preview** is an optional editor pane for the one active D12 editor. It
   refreshes automatically only after a new Working Revision is server-
   acknowledged. While local work is unsaved, saving, conflicted, or outcome-
   unknown, it keeps the last acknowledged rendering and says **Waiting for
   saved changes**. It never presents browser-only work as exact preview.
2. **Open exact preview** creates a full-Page/new-window view pinned to the
   selected acknowledged revision or immutable review/scheduled candidate.
   Later saves never change it. It provides the deliberate artifact used for
   review and release confidence.

Both modes show the same Page, Site chrome, Navigation, locale, D9 package,
semantic renderers, public-safe dynamic projections, and candidate validation.
Both are side-effect-dark: Give, forms, outbound embeds, notifications,
tracking, and analytics render representatively but cannot execute. Page-local
links describe their target instead of silently leaving the preview. **View
live page** remains separate. Responsive widths are keyboard-operable and
named; a narrow screen uses full-screen Preview rather than crushing editor and
preview together.

The automatic path coalesces acknowledged revision changes, permits one
in-flight compile/render per editor, discards stale results by revision fence,
and requires no per-keystroke database records or general realtime
infrastructure. It may use Payload/Next mechanics only behind an Asym adapter;
the authenticated session and exact locator are reauthorized on every request,
and no cookie or URL is bearer authority.

**Benefits**

- Best routine authoring experience without weakening D12 exactness.
- Quick visual feedback after the platform's existing short autosave cadence.
- One compiler, one view model, and one chrome vocabulary serve both live
  iteration and exact review.
- Full-page pinned review remains stable even while the active editor continues
  working.
- Avoids CRDT, multi-editor presence, per-keystroke audit, and whole-site draft
  session complexity.

**Costs**

- More work than A: embedded-frame lifecycle, revision-fenced refresh,
  accessible resize controls, focus handling, frame policy, failure recovery,
  and performance budgets.
- “Live” means latest acknowledged save, not every keystroke; the UI must explain
  this honestly without becoming noisy.
- Public compiler performance must support bounded repeated private renders.

**Risks**

- An implementation could accidentally stream unsaved form state or trust
  Payload's stock Live Preview behavior, violating D12.
- Embedded preview can create keyboard/focus traps, cramped layouts, duplicate
  announcements, or low-end-device load if always enabled.
- A stale frame could appear current unless every result is revision-fenced and
  visibly labelled.

**Downstream consequences**

- D25 defines an Asym preview port and exact identity envelope; Payload Live
  Preview is an optional adapter, not the product contract.
- The default editor remains quiet; Live Preview is remembered per user/device,
  never forced, and full-screen is the accessible/mobile fallback.
- D9 package certification and D11 profiles add preview/public parity fixtures.
- D12 exposes exact save receipts to the preview refresher but gains no second
  version or history engine.
- D13 and review flows use pinned mode only.
- No whole-site private navigation, shareable bearer URL, visual-overlay editor,
  click-to-edit system, or multiple simultaneous live editors ships.

### Option C-prime — Authenticated whole-Site candidate Preview environment

Build a private Site preview environment that pins an entire candidate D1
generation, permits internal navigation among included Pages, can compare
several Page/Navigation/route changes, and includes B's acknowledged Live
Preview for the active Page. Exact authenticated reviewers may navigate the
candidate according to separately proven resource permissions. No bearer link
is allowed.

**Benefits**

- Highest fidelity for coordinated Navigation, route, reusable-section, and
  multi-Page Site changes.
- Reviewers can test real journeys and internal links before a release.
- Strong future base for broad Site redesign and migration rehearsals.

**Costs**

- Requires private candidate-generation lifecycle, whole-closure permission
  projection, internal route resolution, session continuation, expiration,
  reference handling, resource-level error masking, and more expensive builds.
- Staff must understand whether they are previewing the current Page, one Site
  candidate, or the live Site.
- Mobile, accessibility, iframe, CSP, and multi-origin testing grows
  substantially.

**Risks**

- Overbuilds a staging-site product before ordinary Page preview is proven.
- A user authorized for one Page could infer another Page's existence or
  content through Navigation, links, media, errors, or candidate membership.
- Candidate sessions can become a second mutable Site head or quasi-release
  authority if not aggressively bounded.
- Build and storage cost can scale with Site size and edit frequency.

**Downstream consequences**

- D1 would need a separately bounded private candidate-session contract without
  creating another public head.
- Phase 12 would need whole-closure minimum-projection authorization and
  non-enumerating partial-access behavior.
- Operations would need expiration, cleanup, capacity, observability, and
  recovery for candidate environments.
- This should be a later evidence-backed capability unless release analytics
  and staff research prove Page-local preview inadequate.

## Comparison

| Criterion                       | A-prime              | B-prime              | C-prime                                        |
| ------------------------------- | -------------------- | -------------------- | ---------------------------------------------- |
| Exact saved-revision proof      | Strong               | Strong               | Strong if correctly bounded                    |
| Routine authoring speed         | Fair                 | Best                 | Good, but heavier                              |
| Review/schedule stability       | Strong               | Strong pinned mode   | Strong                                         |
| Page/public renderer parity     | Required             | Required             | Required                                       |
| Whole-Site journey testing      | No                   | No                   | Yes                                            |
| Authorization surface           | Smallest             | Bounded Page-local   | Largest closure-wide                           |
| Accessibility burden            | Moderate             | Moderate–High        | High                                           |
| Operational/build cost          | Lowest               | Bounded              | Highest                                        |
| Overengineering risk            | Low                  | Low–Medium           | High                                           |
| Fit with D12 acknowledged saves | Native               | Native by design     | Native but complex                             |
| Fit with current bridge         | Requires replacement | Requires replacement | Requires replacement and new candidate runtime |

## Recommendation

Choose **Option B-prime — one exact Preview product with acknowledged Live
Preview and pinned review mode**.

It solves the daily ministry-staff problem—seeing responsive, branded changes
without repeatedly leaving the editor—while preserving the exactness needed by
D12, D13, and Phase 22 D10. It deliberately refuses the misleading but tempting
shortcut of showing unacknowledged browser state as the release candidate. It
also avoids C's whole-Site preview environment until evidence shows staff need
it.

The durable architecture is smaller than the UI may suggest:

1. one provider-neutral preview request/identity envelope;
2. one shared D1/public compiler and D9 renderer path;
3. one latest-acknowledged revision refresher for the active editor;
4. one immutable pinned target for review/scheduling;
5. one Phase 12/10/22 authorization and public-safe projection boundary; and
6. one private delivery policy with side effects disabled.

No second CMS, version engine, publication head, collaborative editor,
per-keystroke database trail, share-link service, or staging-site platform is
required.

## Requirements common to every viable option

Regardless of the founder's selection, D25 must require all of the following.

### Exact identity and truth

- Bind trusted Tenant, environment, Site, domain, Page family and stable id,
  exact locale, exact acknowledged editorial and placement revisions, selected
  Navigation/reusable/source configurations, exact D9 package/profile,
  compiler/renderer/catalog generations, and current Phase 10/source safety.
- Distinguish **Unsaved**, **Saving**, **Saved**, **Previewed**, **Scheduled**,
  **Released**, **Live**, and downstream convergence. No label collapses them.
- Never auto-switch a pinned preview when newer work arrives.
- Dynamic public facts identify their independent as-of/freshness semantics and
  never gain frozen or favorable meaning merely because the Page revision is
  exact.

### Authorization and tenant safety

- Reauthorize every HTML, RSC/data, media, refresh, navigation, viewport, and
  session-continuation request through the sole Phase 12 decision point.
- Treat route params, Payload ids, Draft Mode cookies, opaque candidate ids,
  iframe messages, prior success, CMS roles, and service credentials as
  locators or mechanisms—never authority.
- Use server-derived exact scope, `overrideAccess: false` for user-bound Payload
  operations, explicit projection, bounded relationship resolution, composite
  scope integrity, and non-enumerating errors.
- Revocation, expiry, Site/locale disablement, Trash, package revocation, or
  adverse safety wins on the next request and cannot fall back to another
  Tenant, Site, locale, revision, package, live Page, or raw source.

### Private delivery

- Send `Cache-Control: private, no-store`; do not enter public/Next/CDN caches.
- Send `noindex`, `nofollow`, `noarchive` intent and exclude preview from
  sitemap, canonical/hreflang, social metadata, public search, and analytics.
- Suppress referrer leakage and use an explicit narrow `frame-ancestors` policy
  for the exact Web Studio origin(s).
- Do not place bearer secrets in URLs, logs, analytics, error reports,
  screenshots, public metadata, or client-readable storage.
- Make consequential public capabilities inert while retaining accessible
  representative appearance and explanation.

### UX and accessibility

- Use one primary **Preview** action. Show **View live page** only when a real D1
  serving generation exists, and never style it as the preview target.
- Keep exact Site/domain/locale and **not public** visible without requiring an
  inspector. Put diagnostic generations behind details.
- Announce saving/waiting/failure/current-revision changes politely; do not
  steal focus or rely on toasts.
- Make viewport controls semantic buttons/radios with text names, keyboard
  support, visible focus, and truthful scope; preserve browser zoom.
- Avoid editor-plus-preview split on narrow screens; use one full-screen mode
  with a clear return action and restored focus.
- Prove keyboard, screen reader, touch, 320 CSS pixel reflow, 400 percent zoom,
  forced colors, reduced motion, long labels/domains, CJK, RTL, bidirectional
  text, slow networks, and lower-powered devices.

### Failure and recovery

- Keep the last exact acknowledged preview visible with a truthful stale or
  waiting label when a newer render fails; never relabel it current.
- Distinguish authorization loss, save failure, conflict, incompatible content,
  compiler failure, dynamic-source unavailability, media suppression, package
  incompatibility, and preview delivery outage privately with cause-owned
  recovery.
- Resolve lost acknowledgements by exact receipt/read-back; never blindly retry
  a different revision or advance an old Live Preview result.
- No preview failure may change the Working Revision or public serving head.

## Implementation proof gates implied by the audit

A later authorized implementation cannot call D25 complete until it proves:

1. identical semantic and visual output between preview and the public compiler/
   renderer for the same exact inputs across every standard and certified D9
   package;
2. hostile cross-Tenant/environment/Site/domain/Page/locale/revision/actor/
   capability/grant/media tests across HTML, RSC/data, assets, frame messages,
   refreshes, and session continuation;
3. exact revision pinning across autosave, Save now, later edits, review,
   schedule, restore, takeover, conflict, Trash, permission revocation, package
   change, and deploy skew;
4. complete absence of private operational data and effects from preview source,
   HTML, serialized data, media, logs, errors, analytics, search, metadata, and
   public/shared caches;
5. explicit response-header, robots, referrer, frame-policy, no-public-cache,
   open-redirect, and login-continuation tests;
6. dynamic list/source parity using only current public-safe projections and
   safe failure behavior;
7. responsive, no-JavaScript where required, hydration, low-end-device,
   compiler-cost, bounded-concurrency, cancellation, and stale-result tests;
8. representative ministry contributors, editors, reviewers, and named
   recipients completing ordinary, localized, scheduled, published-with-draft,
   custom-package, auth-expiry, and recovery scenarios without coaching; and
9. removal or explicit containment of the mutable admin-template bridge so no
   second preview path can make a stronger claim than it has proved.

## Deliberately not decided or built by D25

- anonymous, bearer, shared-password, or permanent review links;
- guest preview identities or a second invitation system;
- browser-only unsaved state as an exact preview target;
- CRDT/OT, cursor presence, multiple simultaneous live editors, or automatic
  merge;
- a whole-Site candidate environment unless C-prime is explicitly chosen;
- visual overlay/click-to-edit authoring, arbitrary component inspectors, or
  dependence on an enterprise-only Payload feature;
- public personalization or authenticated CMS variants rejected by D24;
- public cache variation for preview;
- active giving, forms, embeds, notification, tracking, or analytics inside
  Preview; and
- any implementation, schema, migration, provider adoption, issue publication,
  deployment, release activation, or production change.
