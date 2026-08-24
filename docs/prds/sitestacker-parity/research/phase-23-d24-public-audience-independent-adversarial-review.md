# Phase 23 D24 independent adversarial review — one exact public audience

**Status:** Independent supporting review of founder-ratified Phase 23 D24
A-prime-R; not an independent authority expansion.

**Date:** 2026-08-23

## Review conclusion

Option A-prime is the right Phase 23 boundary, but only after it is made an
enforced public-delivery invariant rather than a sentence in a product brief.
The sound launch posture is one exact, code-owned `public` audience for every
Web Studio public artifact, with donor-, missionary-, and staff-only content
owned and authorized by their respective applications. This is simpler for
staff, safer for tenants, faster for visitors, easier for search engines and
social scrapers to understand, and substantially less expensive to operate
than visitor-conditioned CMS output.

The selected option is not complete if `public` is merely an implied default,
a nullable database value, a UI selector with one enabled choice, a cache tag,
or an access-control convention. It must be one non-nullable discriminant in
the provider-neutral public contract, immutable D1 manifest, compiled
projection, cache identity, search identity, and conformance suite. Public
Page content must not change because a visitor is signed in, has a donor or
missionary role, carries a campaign or analytics cookie, arrives from a
particular geography, or has an expired session.

The current runtime already proves one important part of the intended model:
[`public-read.ts`](../../../../apps/admin/src/cms/access/public-read.ts) gives
the marked public read precedence over an authenticated user, and its unit
test proves that a signed-in donor receives the same published-only predicate.
It does **not** prove the full D24 destination. The transitional
[`PublicRequestContext`](../../../../packages/api/src/cms/public/context.ts)
contains Tenant and a nullable Site seam but no environment, locale, audience,
or D1 generation; the Site is still set to `null` by
[`resolve-tenant.ts`](../../../../apps/admin/src/cms/public/resolve-tenant.ts);
and the donor bridge cache in
[`public-page.ts`](../../../../packages/lib/cms/public-page.ts) varies by host
and descriptor rather than the complete D1 scope. These are known bridge
limitations to replace through D1, not reasons to weaken A-prime.

## Scope and evidence checked

### Repository authority and implementation evidence

The review checked the D1, D5, D13, D14, and D17 ADRs; Phase 5's public-runtime
contract; the D24 decision brief; current public DTO, reader, access, resolver,
serializer, route, preview, cache-tag, editor-state, and sole-entry-test seams;
and the existing public/editor tests. Particularly material findings are:

- D1 already owns one immutable Tenant x environment x Site x locale Public
  Site Generation and one serving head.
- D5 keeps account chrome outside public Navigation and excludes per-item
  audience rules.
- D13 already owns exact whole-Page publish and unpublish appointments, so a
  second request-time date-condition language would duplicate authority.
- D14 excludes personalization and requires trusted server-resolved public
  scope for dynamic lists.
- D17 already declares a public-audience search dimension and requires
  adverse-first exclusion.
- [`published-content-reader.ts`](../../../../apps/admin/src/cms/public/published-content-reader.ts)
  is the sole public Payload read choke point, applies tenant plus published
  constraints, runs `overrideAccess: false`, and serializes through a public
  allowlist.
- [`public-read-access.test.ts`](../../../../tests/unit/cms/public-read-access.test.ts)
  expressly proves that authentication cannot elevate a marked public read.
- The current authenticated preview is separate and access-checked, but its
  renderer is transitional. D1's eventual exact-revision public-runtime
  preview remains the correct convergence target.
- The current Web Studio state strip already distinguishes private draft,
  published copy, and authenticated preview. D24 should refine that familiar
  surface instead of adding an audience builder.
- This Phase 23 worktree's `package.json` and `bun.lock` declare Next.js
  `16.3.0-preview.9`, while the separate main checkout's available installed
  package and bundled docs are `16.2.6`. The locally readable bundle is useful
  corroboration, but it is not exact-version proof for the target branch.
  D24 must remain framework-neutral, and implementation must install the
  target branch's exact pin and reread its bundled docs/source before coding.

The repo-scoped indexed search service returned a 404 during this independent
turn, so the repository evidence above was verified directly against the
current isolated worktree using exact-path reads and `rg`, as required by the
documented fallback.

### Current primary sources

- The available Next.js 16.2.6 bundled docs state that arguments and
  closed-over values form cache identity and that request APIs such as
  `cookies()` and `headers()` are runtime inputs. The target worktree declares
  `16.3.0-preview.9`, so this corroborates the product boundary but does not
  replace exact-pin implementation research. The exact `16.3.0-preview.9`
  bundled
  [`use cache: private`](https://nextjs.org/docs/app/api-reference/directives/use-cache-private)
  documentation does not label that directive experimental. Its material
  semantics remain browser-memory-only, unavailable in Route Handlers,
  excluded from the static shell, executed on every server render, and not
  configurable with a custom cache handler. It is not authorization or a
  shared authenticated-content delivery contract; the enclosing Next.js pin
  remains a preview and requires exact-version requalification.
- Current Next.js
  [CDN caching guidance](https://nextjs.org/docs/app/guides/cdn-caching)
  distinguishes static/ISR output from private dynamic output and requires
  HTML, RSC, and prefetch variants to remain correctly keyed. Authentication
  inside the public renderer would therefore affect more than one HTML cache.
- Vercel's current
  [Cache-Control guidance](https://vercel.com/docs/caching/cache-control-headers)
  recommends shared caching for server-rendered output that is the same for
  every visitor and `private, max-age=0` for content that varies by cookie,
  session, or authentication. It explicitly warns not to apply shared
  `s-maxage` to per-user responses without correct variation.
- [RFC 9111](https://www.rfc-editor.org/rfc/rfc9111.html) treats shared reuse of
  authorized responses conservatively. `private` and `no-store` are cache
  directives, not permission checks.
- Payload's current
  [Local API access documentation](https://payloadcms.com/docs/local-api/access-control)
  confirms that Local API operations bypass access control by default and
  require `overrideAccess: false` plus the correct user/request context when
  access must apply. Payload is an adapter; its role model cannot become Asym's
  public-audience authority.
- Drupal's current
  [cache-context documentation](https://www.drupal.org/docs/develop/drupal-apis/cache-api/cache-contexts)
  shows the real complexity of user-, role-, permission-, session-, language-,
  URL-, and header-varying output and notes that highly dynamic contexts can
  become uncacheable. This supports treating visitor-conditioned CMS delivery
  as a separate future product, not a small D24 setting.
- OWASP's
  [Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
  requires deny-by-default behavior and permission validation on every
  request. Hiding a block, changing a menu, or selecting `private` caching is
  not authorization.
- Google's current
  [technical requirements](https://developers.google.com/search/docs/essentials/technical)
  say indexable pages must be publicly accessible to Googlebot, return a
  successful response, and contain indexable content. One stable public
  representation avoids false expectations that authenticated variants are
  the canonical search representation.
- Comparable nonprofit CRM practice supports a separate authenticated surface:
  Neon One's current
  [Constituent Portal guidance](https://support.neonone.com/hc/en-us/articles/6454441992205-Switching-to-the-New-Constituent-Login-Portal)
  says constituents see their own account data and use that portal for giving,
  payment, preference, and restricted-content capabilities; Blackbaud likewise
  places personal
  [giving history in its portal](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/ptl-gift-types-eh.html).
  These examples do not make their portal implementations Asym's architecture,
  but they validate the public-site versus authenticated-account distinction.
- WCAG 2.2 requires programmatically determinable state and
  [status messages](https://www.w3.org/WAI/WCAG22/#status-messages). Publish,
  unpublish, schedule, and save feedback must not depend on color, toast timing,
  or visual placement alone.

## Exact interpretation under review

For D24, **public audience** means the following:

1. `public` is the one exact code-owned audience discriminant accepted by the
   Phase 23 public compiler and serving resolver.
2. At one Tenant, environment, Site, locale, canonical path, and active D1
   generation, the CMS-authored body, public Navigation, dynamic-list results,
   metadata, canonical, sitemap, robots disposition, social-card inputs, and
   D17 search representation are identical regardless of visitor identity or
   request authentication state.
3. D13 whole-Page scheduling controls **when everyone may see the Page**. It is
   not audience personalization and does not run a `Date.now()` branch on a
   public request.
4. Donor Portal, Missionary Workspace, and Mission Control own and authorize
   their private content on every request. Web Studio public Pages may link to
   an app-owned sign-in/account destination, but may not embed the private
   content, user identifier, token, entitlement, or account result.
5. A small app-owned account-action island may reflect sign-in state only if it
   is outside every D1 public artifact and shared public cache, contains no
   CMS-authored restricted content, is privately/no-store delivered under its
   app owner, and cannot change public Navigation, metadata, search, canonical,
   sitemap, social output, or the public Page body. A static **Sign in** link is
   the safer default.
6. Preview is a private editorial capability that shows exactly what the one
   public audience would receive after release. It is not a second audience,
   authorization proof, or shared public cache variant.
7. A second audience value is impossible through tenant configuration. It
   requires a new founder decision and a complete owner, route, authorization,
   release, preview, cache, search, migration, and incident contract.

## UX/UI contract required for an excellent staff experience

The best UX is explicit without becoming noisy:

- Do not show an audience dropdown, disabled **Public** selector, conditional
  rule builder, role checklist, or technical `audience = public` terminology.
- In the existing Page state strip or compact release summary, show one quiet
  reach line: **Public website — anyone can view after release.** For a live
  Page, use **Live on the public website**; for a private draft, use **Draft —
  only currently authorized collaborators can see this work**; for a scheduled
  Page, use D13's exact scheduled sentence.
- Preview chrome must say **Preview — not public** and **This is what anyone
  will see after release**, while separately communicating that the preview
  tool itself is private and exact-version authorized. Avoid the ambiguous
  current label **Authenticated Preview** as the only explanation: it describes
  access to the tool, not the future audience of the Page.
- Publish and schedule confirmation must summarize Site, locale, path, exact
  revision, and consequence in one scan: **Anyone can view this page after it
  goes live.** It also names the exact D2 reach: Listed pages may appear in
  public discovery and search; Shared-by-link pages remain publicly viewable and
  reshareable but are omitted from Asym discovery and receive `noindex`. Do not
  promise external secrecy or erasure, repeat the message per block, or require
  an extra confirmation solely because the audience is public.
- If staff attempt to put donor, missionary, staff, giving-history, travel,
  security, or other account-only material into a public Page, use concise
  contextual guidance: **This page is public. Put account-only information in
  Donor Portal, Missionary Workspace, or Mission Control.** This is guidance,
  not a brittle keyword scanner or automatic content classifier.
- A public CTA that leads to an authenticated app should say what happens, such
  as **View my giving history** or **Open Missionary Workspace**. The public
  link may lead through app-owned sign-in and safe return handling; the URL
  must contain no private identity or entitlement.
- State changes use persistent text plus a polite programmatic status message,
  retain focus, work by keyboard, meet touch-target and contrast rules, and do
  not rely on badge color alone.
- On mobile, keep audience/reach in the same compact Page summary; do not hide
  the only disclosure in a desktop inspector or hover tooltip.

This extends the repository's current Page-first state strip and
publish/preview actions. It does not create a new settings area.

## Seventeen-category adversarial review

### 1. Brittleness

**Material concern: Yes.**

- **What could go wrong:** A later developer reads a cookie, role, country,
  campaign parameter, or session inside a public renderer or certified D9
  package. The Page then varies while the rest of the system still assumes one
  shared representation.
- **Why it matters:** The error can leak content across users, poison shared
  caches, fragment SEO/social output, and make staff preview unreliable.
- **Severity:** Critical.
- **Likelihood:** Medium without structural enforcement; Low after the proof
  gates below.
- **Evidence/reasoning:** The current public cache bridge keys host and content
  descriptor, not visitor identity. Next.js makes runtime request inputs real
  render/cache dimensions. The existing public-read test proves only Payload
  read behavior, not every renderer and artifact.
- **Permanent prevention:** Make `public` a required exact discriminant in one
  provider-neutral public context and manifest; statically forbid auth/session/
  personalization imports from the public composition graph; reject unknown or
  missing audience values; and test the whole output matrix for auth invariance.

### 2. Technical debt

**Material concern: Yes.**

- **What could go wrong:** A nullable `audience`, broad enum, generic condition
  JSON, disabled selector, or dormant audience table is added “for later.” Code
  then disagrees about whether missing means public, inherited, or unrestricted.
- **Why it matters:** Ambiguous defaults are expensive to migrate and can widen
  access when new values arrive.
- **Severity:** High.
- **Likelihood:** High unless explicitly prohibited.
- **Evidence/reasoning:** The current context already demonstrates the cost of
  reserved nullable seams: `siteId` remains `null`, while Phase 23 requires
  complete Site scope. A speculative audience seam would repeat that ambiguity
  in a security-sensitive dimension.
- **Permanent prevention:** Do not create a tenant-authored audience field or
  registry. Use a tiny exact type such as `type PublicAudience = "public"` in
  the shared contract and an explicit `public` value in immutable D1 artifacts;
  use versioned additive migration only if a later audience is ratified.

### 3. Edge cases

**Material concern: Yes.**

- **What could go wrong:** Signed-in and signed-out visitors, expired sessions,
  logout/back-forward cache, HEAD requests, RSC navigation, prefetch, social
  bots, search crawlers, preview cookies, multiple custom domains, UTM/query
  parameters, localization, scheduled activation, and custom packages produce
  different Page artifacts or reuse the wrong entry.
- **Why it matters:** These are ordinary production paths, not exotic cases;
  inconsistency is confusing at best and a disclosure at worst.
- **Severity:** High, Critical when private data is involved.
- **Likelihood:** High unless included in the test matrix.
- **Evidence/reasoning:** Next.js documents separate HTML, RSC, and prefetch
  variants. D1/D13/D17 introduce generation, schedule, and derived-search timing
  that cannot be inferred from one ordinary browser request.
- **Permanent prevention:** Test anonymous, donor, missionary, staff, expired,
  malformed-cookie, crawler, HEAD, HTML, RSC, prefetch, direct, and client-
  navigation requests. Query and analytics parameters may affect attribution at
  a qualified CTA boundary but never Page membership or representation.

### 4. Footguns

**Material concern: Yes.**

- **What could go wrong:** Staff interpret a label such as **Members only** as
  security; developers use Payload roles, CSS hiding, client conditionals,
  `Vary: Cookie`, `overrideAccess: true`, or preview access as shortcuts.
- **Why it matters:** Content can remain present in HTML, RSC payloads, metadata,
  media URLs, search, social previews, browser history, or caches even when the
  visible block appears hidden.
- **Severity:** Critical.
- **Likelihood:** Medium.
- **Evidence/reasoning:** Payload Local API bypasses access by default. OWASP
  explicitly separates authorization from presentation. Current public access
  is safe because the marked public path wins even for an authenticated user.
- **Permanent prevention:** Offer no public audience control; keep
  `overrideAccess: false` in the one public adapter; reject raw provider reads;
  forbid client-only visibility controls; and make authenticated content a
  separate app-owned DTO and route.

### 5. Tenant safety

**Material concern: Yes.**

- **What could go wrong:** A missing Tenant, environment, Site, locale,
  audience, generation, host, or source dimension returns another ministry's
  Page, Navigation, media, search hit, social metadata, or giving destination.
- **Why it matters:** Even “public” information must not be mixed across
  organizations; wrong giving links create financial and reputational harm.
- **Severity:** Critical.
- **Likelihood:** Medium during cutover; Low after complete-scope enforcement.
- **Evidence/reasoning:** Current reader queries and access policy correctly use
  tenant plus publication, but `siteId` is still null and current cache helpers
  do not carry the complete D1 dimensions.
- **Permanent prevention:** Resolve the entire scope server-side from the
  platform-trusted host and active heads; use composite database predicates and
  immutable generation keys; treat invalid/ambiguous hosts as neutral not
  found; never accept browser-supplied Tenant/Site/audience authority; and run
  hostile cross-scope cache, query, media, search, and CTA tests.

### 6. Overengineering

**Material concern: Yes, if the hardening is implemented as a generic audience platform.**

- **What could go wrong:** To “future-proof” one value, the implementation adds
  audience tables, expression ASTs, segment resolvers, condition UIs, simulator
  infrastructure, per-user cache variants, or event streams.
- **Why it matters:** It recreates rejected B/C complexity, increases operating
  cost, and gives staff controls the product does not safely support.
- **Severity:** High.
- **Likelihood:** Medium.
- **Evidence/reasoning:** Drupal's explicit cache-context system demonstrates
  the legitimate complexity of conditional delivery. There is no Phase 23 need
  to reproduce it for a one-value launch contract.
- **Permanent prevention:** One exact type, one invariant, one shared
  conformance suite, and no tenant configuration. Future audience work requires
  evidence and a new decision rather than dormant architecture.

### 7. UX/UI and user friction

**Material concern: Yes.**

- **What could go wrong:** Removing audience controls without explaining reach
  leaves staff unsure who will see a Page. Repeating legalistic warnings makes
  routine publishing frightening. Calling preview **Authenticated** can make
  staff think the released Page is authenticated. App destinations can surprise
  visitors with an unexplained login.
- **Why it matters:** Communications staff need confidence at the moment of
  release; uncertainty causes support requests, duplicate Pages, accidental
  private copy, and avoidance of the CMS.
- **Severity:** High.
- **Likelihood:** High without the explicit UX contract above.
- **Evidence/reasoning:** The current Web Studio state strip already surfaces
  publication and preview state, but its wording explains implementation more
  than visitor consequence. WCAG requires state and status to be perceivable
  programmatically, not only visually.
- **Permanent prevention:** Use one quiet reach sentence in the existing Page
  summary and literal consequence in publish/schedule confirmation; distinguish
  private preview access from future public reach; provide contextual links to
  app-owned surfaces; preserve keyboard/focus/status semantics; test wording
  with nonprofit communications staff and low-frequency publishers.

### 8. Hidden coupling

**Material concern: Yes.**

- **What could go wrong:** “Public audience” becomes implicitly coupled to
  Payload roles, Supabase sessions, donor CRM segments, analytics campaigns,
  D9 package code, D13 time rules, D17 search, or Vercel cache behavior.
- **Why it matters:** A change in auth, provider, or marketing tooling could
  silently change public visibility or cache identity.
- **Severity:** High.
- **Likelihood:** Medium.
- **Evidence/reasoning:** A public Page currently crosses admin Payload, shared
  DTOs, donor rendering, metadata, media, and cache seams. D14/D17 add more
  derived consumers.
- **Permanent prevention:** Define one provider-neutral `PublicDeliveryContext`
  and one public projection port. Downstream consumers accept the exact public
  context; they never resolve auth. App-owned private readers depend inward on
  their authorization owners and do not reuse public DTOs for private fields.

### 9. Failure modes

**Material concern: Yes.**

- **What could go wrong:** Auth service failure takes down a public Page; cache
  invalidation misses; a scheduled release partially converges; an unknown
  audience enters a candidate generation; a private source is unavailable; or
  preview accidentally falls back to a public or privileged read.
- **Why it matters:** Privacy failures must fail closed, while ordinary public
  availability should not depend on unrelated authentication infrastructure.
- **Severity:** Critical for disclosure, High for availability.
- **Likelihood:** Medium over system lifetime.
- **Evidence/reasoning:** D1, D13, and D17 already distinguish authority,
  activation, cache, search, and visibility. Current code correctly returns a
  neutral unavailable result on store failure but does not yet implement the
  complete D1 convergence model.
- **Permanent prevention:** Public serving has no auth dependency; unknown or
  missing audience blocks the candidate while the prior public generation
  remains; adverse safety withdrawal suppresses first; preview fails closed and
  no-store; private app failure never falls back to a privileged or user-
  specific public variant; and operators receive a cause-owned exception.

### 10. Data integrity

**Material concern: Yes.**

- **What could go wrong:** HTML, RSC, Navigation, metadata, sitemap, social
  cards, search, media, and dynamic lists reference different generations or
  audience defaults. A stale index or copied DTO can resurrect withdrawn
  content.
- **Why it matters:** Staff cannot reason about “what is live,” and sensitive
  or incorrect content can remain discoverable after withdrawal.
- **Severity:** High; Critical for safety withdrawal.
- **Likelihood:** Medium.
- **Evidence/reasoning:** D17 already recognizes that search cleanup is
  asynchronous and requires an adverse-first public admission check. Current
  transitional public shapes do not carry a complete generation fence.
- **Permanent prevention:** Pin one D1 generation and exact `public` value in
  every compiled artifact; use immutable version fences and idempotent
  convergence targets; never default unknown values during reads; reconcile
  derived surfaces; and block activation when closure is incomplete.

### 11. Security and privacy

**Material concern: Yes.**

- **What could go wrong:** Private donor history, missionary operational
  details, staff notes, consent-restricted stories, identifiers, tokens, or
  populated provider documents enter a public serializer, media URL, RSC
  payload, analytics event, metadata field, or cache.
- **Why it matters:** Once public, cached, indexed, or scraped, withdrawal cannot
  guarantee erasure from third parties.
- **Severity:** Critical.
- **Likelihood:** Medium without source-owned eligibility and negative tests.
- **Evidence/reasoning:** Phase 10 owns public safety; the current reader's
  tenant/published constraints and allowlist are sound foundations, and its
  populated-rich-text stripping shows why raw provider data is unsafe. Cache
  directives alone do not authorize content.
- **Permanent prevention:** Phase 10/source eligibility precedes compilation;
  public serializers are allowlist-only and depth-bounded; private DTOs are
  structurally separate; app links contain no identity or entitlement; preview
  is authenticated, tenant-checked, no-store, and noindex; and every private/
  restricted fixture must be absent from every public byte surface.

### 12. Scalability and performance

**Material concern: Yes, but A-prime materially reduces it.**

- **What could go wrong:** Incomplete scope creates cache collisions, while
  over-broad invalidation or generation proliferation destroys hit rates. A
  later per-user key accidentally creates unbounded cardinality and cost.
- **Why it matters:** Ministry traffic can spike around emergencies and giving
  campaigns; public availability and cost predictability matter.
- **Severity:** High.
- **Likelihood:** Medium.
- **Evidence/reasoning:** Vercel recommends shared caching when every visitor
  receives the same server-rendered response. Drupal documents the performance
  cost of user/role contexts. One public audience is the favorable shape.
- **Permanent prevention:** Keep cache identity bounded to exact Tenant,
  environment, Site, locale, active generation, route/artifact, contract, and
  `public`; use bounded tags for invalidation rather than isolation; load-test
  generation activation and campaign bursts; reject user/session/role tokens in
  cache keys.

### 13. Operational burden

**Material concern: Yes.**

- **What could go wrong:** Staff do not know where private content belongs;
  support cannot explain why a Page is public; operators lack a fast mistaken-
  release containment path; app and Web Studio teams each assume the other owns
  a broken link or disclosure.
- **Why it matters:** Small nonprofit teams cannot sustain complex audience
  simulation or cache-purge rituals.
- **Severity:** High.
- **Likelihood:** Medium.
- **Evidence/reasoning:** A-prime removes the personalization operations burden,
  but it creates a deliberate cross-product ownership boundary that must be
  visible and documented.
- **Permanent prevention:** One Page-first reach explanation, a concise “where
  private content belongs” help path, exact owner/runbook mapping, Phase 10
  adverse withdrawal, D1 rollback to prior safe generation, and no manual cache
  key editing or audience repair.

### 14. Observability gaps

**Material concern: Yes.**

- **What could go wrong:** Ordinary success metrics show 200 responses while
  the wrong generation, Tenant, Site, locale, or representation is served; a
  code path begins varying on authentication without an alert.
- **Why it matters:** Cross-scope and cache-invariance defects are difficult to
  detect from aggregate traffic and may persist silently.
- **Severity:** High.
- **Likelihood:** Medium.
- **Evidence/reasoning:** Current cache tags are intentionally invalidation
  handles, not isolation proof. D17 separately tracks desired state,
  containment, provider state, and deletion verification.
- **Permanent prevention:** Emit privacy-safe scope/generation/audience
  fingerprints, never user identity or content; monitor unknown audience,
  resolver ambiguity, generation mismatch, invalidation/search lag, and public
  admission suppression; run synthetic anonymous/authenticated output-hash
  comparisons and alert on any public artifact difference.

### 15. Dependency and integration risks

**Material concern: Yes.**

- **What could go wrong:** Next.js cache semantics, Vercel CDN behavior,
  Payload Local API defaults, a custom D9 package, analytics middleware, or an
  external search/social integration changes independently and violates the
  public invariant.
- **Why it matters:** Framework capability is not product authority; an upgrade
  can silently change caching or access behavior.
- **Severity:** High.
- **Likelihood:** Medium.
- **Evidence/reasoning:** `use cache: private` is browser-memory reuse rather
  than a shared authorization architecture. Payload's Local API still bypasses
  access by default. The repo uses an internal Payload 4 pin, which especially
  requires exact-version qualification.
- **Permanent prevention:** Keep provider adapters behind owned ports; pin and
  reread exact bundled docs before implementation/upgrades; require
  conformance tests for Next/Vercel/Payload/search/custom packages; never make
  framework-private caching or provider roles the D24 contract.

### 16. Migration and upgrade risks

**Material concern: Yes.**

- **What could go wrong:** Existing pages or imported SiteStacker records with
  visibility conditions are defaulted to public; legacy missing values are
  interpreted permissively; an upgrade writes a new audience value that older
  readers treat as public; future private CMS content reuses public IDs/DTOs.
- **Why it matters:** Migration is the highest-risk moment for accidental
  publication and mixed-version access widening.
- **Severity:** Critical.
- **Likelihood:** Medium during cutover.
- **Evidence/reasoning:** SiteStacker supports visibility conditions while the
  current Asym inventory contains no public audience field. There is therefore
  no safe mechanical equivalence for conditional legacy content.
- **Permanent prevention:** Inventory every source record and condition;
  migrate only records independently proved public by current Phase 10/source
  authority; quarantine conditional/unknown/private records; reject unknown
  values in old and new readers; use expand/migrate/contract deployment and
  retain the prior safe generation until proof passes.

### 17. Other development hazards

**Material concern: Yes.**

- **What could go wrong:** Deploy skew, concurrent D1 activation, a D13 job
  racing a safety withdrawal, custom-package escape hatches, generated/AI code,
  partial rollback, or an untested public artifact bypasses the invariant.
- **Why it matters:** These hazards bypass otherwise-correct ordinary request
  logic and are common during rapid CMS evolution.
- **Severity:** Critical.
- **Likelihood:** Medium without release and build gates.
- **Evidence/reasoning:** D1 and D13 already use exact generations and compare-
  and-swap because “latest” is unsafe. D9 allows bespoke packages, increasing
  the need for capability boundaries and certification.
- **Permanent prevention:** Expected-head CAS, exact version fences, idempotent
  operations, prior-generation preservation, adverse-wins ordering, public-
  import lints, D9 sandbox/certification tests, generated-code review, staged
  compatibility deployment, and practiced rollback.

## Ruthless synthesis

### Must be fixed in D24 before ratification

1. Define one exact, non-nullable, code-owned `public` audience across the
   provider-neutral public context, D1 manifest/projection, cache identity,
   Navigation, D14 lists, D17 search, metadata, canonical, sitemap, robots, and
   social output. Do not add a tenant setting or generic audience schema.
2. Define public artifact invariance precisely: authentication, roles,
   sessions, cookies, geography, referrer, campaigns, experiments, analytics,
   and visitor history cannot change CMS-authored public output.
3. Preserve app ownership: private donor, missionary, and staff content is
   authorized on every request in its owning app. A public link to an app is
   allowed; private content or identifiers in the public payload are not.
4. State that D13 whole-Page scheduling is the only Phase 23 time visibility
   mechanism and that Phase 10/source safety can withdraw content immediately.
5. Adopt the quiet Page-first UX contract: one persistent reach sentence,
   exact release consequence, unambiguous public preview wording, contextual
   private-content guidance, accessible status feedback, and no audience
   builder.
6. Record the dependency evidence without conflating checkouts: the Phase 23
   target declares Next.js `16.3.0-preview.9`, while the available installed
   bundle is `16.2.6`. Keep D24 framework-neutral and require exact-target-pin
   bundled-doc/source verification before implementation.

### Must be included in implementation planning

1. Replace the transitional Tenant/host bridge with the complete trusted D1
   Tenant x environment x Site x locale x `public` x generation context before
   claiming D24 completion.
2. Extend the sole-entry/static-boundary gate so public compiler, renderer,
   metadata, Navigation, D9 packages, source adapters, search, sitemap, robots,
   and social paths cannot import auth/session/segment/personalization modules.
3. Create one cross-artifact, cross-auth conformance matrix and adversarial
   cache-poisoning suite; ordinary unit tests of the Payload reader are
   necessary but insufficient.
4. Make preview exact-revision, tenant-checked, no-store, noindex, and visually
   explicit that it previews the one public audience.
5. Add migration census, quarantine, mixed-version rejection, and prior-safe-
   generation rollback proof.
6. Add privacy-safe convergence and invariance observability before activation.

### Address soon after the core boundary exists

- Usability-test reach, preview, publish, schedule, app-link, and mistaken-
  private-content wording with representative ministry communications staff,
  including infrequent publishers and mobile/keyboard/screen-reader users.
- Add an owner/help map for private donor, missionary, and staff editorial
  needs so A-prime does not become “you cannot do that” without a clear product
  destination.
- Exercise emergency withdrawal and generation rollback runbooks against
  search, cache, sitemap, social metadata, and public media.
- Measure shared-cache hit rate, generation convergence, public latency, and
  the number of tenant requests for authenticated CMS authoring.

### Monitor without building speculative machinery

- Evidence-backed demand for app-owned CMS editorial content beyond links and
  ordinary authenticated application UI.
- Repeated public campaign needs that D13 windows, normal Pages, and app-owned
  account actions cannot satisfy.
- Next.js private-cache stabilization, Payload access-model changes, Vercel CDN
  behavior, and search/social crawler changes. None independently authorizes a
  second audience.
- Growth in Site/locale/generation cardinality and invalidation cost.

## Exact proof gates

D24 implementation is not complete until all gates below pass against the
actual release candidate and exact dependency pins.

### Contract and compile gates

1. The public context and every immutable D1 artifact require exact `public`;
   `null`, missing, empty, unknown, donor, missionary, staff, role, segment,
   user, campaign, and geographic values fail closed.
2. Candidate closure rejects any Page, Navigation, list, metadata, sitemap,
   social, search, renderer, or package contract with a different/missing
   audience or generation fence; the prior serving generation remains live.
3. No tenant-authored audience column, table, JSON expression, disabled UI
   selector, or provider role string exists in Phase 23 storage or contracts.

### Static boundary gates

4. A blocking dependency-graph check rejects `cookies`, session/auth context,
   CRM segments, roles, geolocation, experimentation, personalization, and
   browser-supplied audience reads anywhere reachable from public CMS body,
   Navigation, D9 packages, D14 adapters, metadata, sitemap, robots, social, or
   D17 search compilation/serving.
5. The existing sole-entry guard continues to reject raw Payload public reads,
   `overrideAccess: true`, deep imports, and unqualified provider adapters.
6. D9 package certification proves bespoke components can vary presentation,
   motion, and layout but cannot read or affect authentication, audience,
   public scope, authorization, cache policy, or release authority.

### Tenant and cache-isolation gates

7. Host, Tenant, environment, Site, locale, path, generation, source, and
   `public` are resolved from trusted server context and included wherever they
   affect identity. Forged forwarded host, Tenant, Site, locale, generation,
   audience, source, and document IDs never cross scope.
8. Cache-key tests prove different Tenant/Site/locale/generation/artifact inputs
   never collide, while anonymous/donor/missionary/staff/expired-session and
   irrelevant-cookie requests for the same public scope resolve the same public
   content identity. Tags are tested only as invalidation handles.
9. HTML, RSC, static/dynamic prefetch, HEAD, direct navigation, client
   navigation, browser back/forward, CDN hit/miss/revalidation, and bounded
   stale recovery preserve the same public representation and correct Next.js
   protocol variants.

### Public-output invariance gates

10. For a fixed D1 scope, normalized output hashes are identical across
    anonymous, authenticated donor, authenticated missionary, staff, expired,
    malformed, crawler, bot, and no-cookie requests for:
    - CMS body and semantic blocks;
    - Primary/Footer Navigation;
    - dynamic-list membership and order;
    - title, description, canonical, Open Graph and other social metadata;
    - sitemap and robots disposition;
    - D17 search document and public result admission; and
    - public media references and checkout destination intent.
11. UTM, referrer, analytics, experimentation, and geography inputs do not
    change those hashes. Qualified CTA attribution may carry safe bounded
    source intent into its owner but cannot change public content or authority.

### Private-content absence and authorization gates

12. Donor history, missionary operational data, staff notes, restricted or
    consent-withdrawn content, auth tokens, private IDs, provider documents, and
    private media are absent from HTML, RSC, JSON, source maps, metadata,
    sitemaps, search, social cards, analytics payloads, logs, caches, prefetches,
    and error details.
13. Donor Portal, Missionary Workspace, and Mission Control re-prove current
    authorization on every request, deny by default, use separate private DTOs,
    and never fall back to a private public-cache variant.
14. A public app link uses a generic stable route with no user/entitlement
    secret; authentication and safe return handling are app-owned.

### Preview, scheduling, and adverse-state gates

15. Preview authenticates and scopes the editor, binds an exact revision,
    renders the same public projection/renderer contract, sets no-store and
    noindex, leaks no token in the destination URL, and clearly says that the
    preview tool is private while the released Page is public.
16. D13 scheduling changes visibility only through exact D1 activation; request
    time, visitor timezone, cookie, or session never decides visibility.
17. Unpublish, source ineligibility, consent loss, restricted-country/safety
    withdrawal, Tenant/Site disablement, and generation rollback suppress
    public delivery first and converge cache/search/metadata/sitemap/social
    surfaces without an older job resurrecting content.
18. Auth, Payload, cache, search, source, preview, and downstream app outages
    have tested, distinguishable, fail-safe outcomes. Auth failure does not take
    down ordinary public content; private failure never exposes content.

### UX and accessibility gates

19. Representative staff can correctly answer who can see a draft, preview,
    scheduled Page, live Page, and app-linked private destination without an
    audience control or training-only knowledge.
20. Reach and publication state remain visible and understandable on mobile and
    desktop, are not confined to an inspector/tooltip, and do not rely on color.
21. Save, publish, unpublish, schedule, cancel, and failure messages meet WCAG
    status-message behavior; keyboard focus remains predictable; screen-reader
    output states both current status and public consequence.
22. Publishing the one public audience requires no extra audience step. Staff
    can reach the relevant app-owned destination/help in one contextual action
    when content should not be public.

### Migration, operations, and dependency gates

23. A migration census classifies every legacy/Phase-bridge record. Only
    independently public-eligible records become `public`; conditional,
    private, restricted, unknown, or unresolvable records are quarantined.
24. Mixed old/new reader and writer deployment rejects unknown audience/schema
    versions and never defaults them to public; expand/migrate/contract and
    rollback are rehearsed with the prior generation preserved.
25. Operators can observe exact public generation, cache/search convergence,
    suppression, resolver ambiguity, and unknown audience without logging
    content or user identity; synthetic auth-invariance checks alert on drift.
26. The exact Next.js, Payload 4 internal pin, Vercel behavior, search adapter,
    and every certified D9 package pass the same public contract suite before
    release and after dependency upgrades.

## Final disposition

Proceed with a hardened A-prime-R. Do not choose B-prime or C-prime for Phase
23, do not create a dormant personalization substrate, and do not claim the
current Phase 5 bridge already satisfies D24. The permanent solution is a
small, explicit, enforceable public invariant plus excellent consequence-first
staff UX and structurally separate authenticated applications.
