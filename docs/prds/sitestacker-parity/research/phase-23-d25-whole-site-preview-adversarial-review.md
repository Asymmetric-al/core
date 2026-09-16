# Phase 23 D25 whole-Site Preview Candidate adversarial review

**Status:** Founder-ratified C-prime-R on 2026-08-23; this is the complete
supporting adversarial review and does not independently expand the decision.

**Date:** 2026-08-23

## Decision under review

> **C-prime — Whole-Site candidate Preview environment.**

This review tests whether that product can be trustworthy, understandable, and
proportionate without creating a cloned database, a mutable staging Site, a
second publication head, or a permanent operations burden. It does not reopen
Phase 23 D1–D24 and does not authorize implementation, schema, migration,
dependency adoption, issue publication, Git publication, deployment, release,
or production change.

## Bottom line

C-prime is viable only after one sharp correction in terminology and
architecture:

- **Whole-Site Preview Candidate** means one immutable, private, complete,
  navigable candidate for one exact Tenant × environment × Site × BCP-47 locale.
- It is prepared from the current D1 serving generation—or D1’s code-owned empty
  genesis before a first release—plus one explicit, server-fenced vector of
  exact D12-acknowledged revisions selected by the cause-owned D1 Site Plan/
  release preparation intent. It never sweeps all current drafts or resolves
  `latest` while a person browses it.
- “Whole Site” means every eligible route in that exact locale. Another locale
  is another independently sealed candidate; a locale switch never assembles a
  mixed cross-locale closure.
- The candidate is not a Supabase branch, copied database, cloned Payload
  environment, permanent preview deployment, public environment alias, or
  second mutable Site head.
- Only a principal with current **Site-wide preview** authority may open the
  complete candidate. A contributor or named recipient who may inspect only one
  Page keeps Phase 22 D10’s exact Page-local preview. There is no misleading,
  permission-filtered “whole Site” variant.
- The candidate uses D1’s real compiler and D9’s exact certified presentation
  package. The current generic authenticated preview route is an interim bridge,
  not the implementation.
- Candidate preparation is all-or-none. A successor is created when staff ask
  for newer saved work; a ready candidate never mutates beneath an open review.
- D1 still performs fresh release proof and is the only public activation path.
  A preview candidate can never be promoted by changing an alias or flipping its
  status.

With those boundaries, C adds genuine value for Navigation, route, shared-
section, package, and multi-Page journey review. Without them, it is a high-risk
staging platform disguised as a preview button.

## Evidence and current-contract reconciliation

### Core’s current route is not a whole-Site candidate

The current
[`preview-url.ts`](../../../../apps/admin/src/cms-ui/web-studio/adapters/preview-url.ts)
encodes only collection and document id. The current
[`preview route`](<../../../../apps/admin/app/(payload)/web-studio/preview/%5Bcollection%5D/%5Bid%5D/page.tsx>)
does authenticate, uses `overrideAccess: false`, and is therefore a useful safe
bridge. It also reads `draft: true` at relationship `depth: 2`, renders a second
generic Admin layout, and leaves CTA anchors active. It does not pin exact Page,
Placement, Navigation, locale, presentation-package, compiler, source-contract,
or candidate identity. The
[`authenticated-preview.ts`](../../../../apps/admin/src/cms/preview/authenticated-preview.ts)
view model is Page-shaped rather than Site-generation-shaped.

Promoting that route would therefore create mutable-latest behavior, renderer
drift, incomplete scope, and active-effect risk. D25 should replace or explicitly
retire it; it must not silently redirect old preview URLs to a new mutable
candidate.

### D1–D24 constrain the correct shape

- [D1 / ADR-0145](../../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
  already defines one immutable Public Site Generation per Site-locale, prepared
  privately and activated only through one small CAS serving head. D25 should
  reuse its compiler and closure vocabulary, not invent a parallel Site model.
- [D2 / ADR-0146](../../../adr/0146-staged-hierarchical-public-paths-under-coherent-site-generations.md),
  [D3 / ADR-0147](../../../adr/0147-generation-bound-automatic-ordinary-page-route-continuity.md),
  and
  [D4 / ADR-0148](../../../adr/0148-curated-navigation-revisions-under-coherent-site-generations.md)
  require exact paths, route continuity, redirects, and Navigation to compile
  coherently. A whole-Site preview must route entirely inside the candidate.
- [D9 / ADR-0153](../../../adr/0153-certified-site-bound-custom-presentation-packages.md)
  requires the exact Site-bound package, public view model, code/artifact digest,
  capability boundary, and safe-effect behavior. A generic Admin approximation
  cannot prove fidelity.
- [D10 / ADR-0154](../../../adr/0154-complete-cohort-site-presentation-activation-through-d1.md)
  permits one special all-locale presentation activation, but it does not create
  a cross-locale serving head. D25 likewise keeps each locale candidate exact.
- [D12 / ADR-0156](../../../adr/0156-bounded-editorial-working-revisions-and-recoverable-active-editor.md)
  says **Saved** only after an exact server acknowledgement and rejects mutable
  latest, blind retry, and stale writes. Browser-only form state cannot enter a
  stable Site review candidate.
- [D13 / ADR-0157](../../../adr/0157-exact-revision-scheduled-publication-appointments-through-d1.md)
  pins exact scheduled meaning and re-proves it at execution. A preview is useful
  evidence but not appointment or release authority.
- [D14 / ADR-0158](../../../adr/0158-versioned-dynamic-source-catalog-and-content-list.md)
  deliberately pins source configuration while qualified public membership may
  remain current. D25 must label that distinction rather than claiming a frozen
  database snapshot.
- [D21 / ADR-0165](../../../adr/0165-asym-owned-reference-aware-recoverable-trash.md)
  and
  [D22 / ADR-0166](../../../adr/0166-bounded-localized-editorial-profile-over-exact-locale-lineages.md)
  require current lifecycle protection and exact locale lineages with no silent
  field fallback.
- [D23 / ADR-0167](../../../adr/0167-exact-site-owned-ordinary-content-with-independent-copy-to-site-drafts.md)
  prevents cross-Site ordinary-content reuse. A candidate cannot infer scope
  from a document id.
- [D24 / ADR-0168](../../../adr/0168-one-exact-public-audience-and-app-owned-authenticated-surfaces.md)
  requires private, currently authorized, no-store/noindex preview using the
  public compiler without becoming a public cache variant or release proof.

### Modern CMS evidence supports a perspective, not a cloned production world

[Sanity perspectives](https://www.sanity.io/docs/content-lake/presenting-and-previewing-content)
show the useful modern pattern: production selects a published perspective,
while preview selects a draft or release perspective across multiple documents.
[Sanity Content Releases](https://www.sanity.io/docs/user-guides/content-releases)
limit a release to one version of a document and expose a global perspective for
review. The transferable lesson is an explicit, coherent selection; Sanity’s
provider model is not Asym authority.

[Contentful environment aliases](https://www.contentful.com/developers/docs/concepts/environment-aliases/)
and its
[deployment workflow](https://www.contentful.com/developers/docs/tutorials/general/deploying-changes-with-environment-aliases/)
show why an environment clone or alias is the wrong abstraction here: those
features carry content-model migration, developer workflow, and promotion
semantics. D25 needs private editorial rendering, not a second CMS environment
or alias that can become production by pointer change.

[Payload Live Preview](https://payloadcms.com/docs/live-preview/overview) is a
useful iframe, viewport, URL, and refresh mechanism. Payload
[`draft: true`](https://payloadcms.com/docs/versions/drafts) returns the most
recent stored draft; it does not by itself identify D25’s immutable complete
candidate. Payload remains an exact-pin adapter behind an Asym-owned candidate
identity and access boundary.

### Supabase/Postgres implications

[Supabase RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security)
confirms that policy predicates run for candidate rows, that policy columns need
indexes, and that `(select auth.uid())` avoids repeated function evaluation when
the result is statement-stable. `TO authenticated` is authentication, not
Site-wide preview authorization.

[PostgreSQL transaction-isolation guidance](https://www.postgresql.org/docs/current/transaction-iso.html)
supports a stable snapshot for collecting an exact revision vector and requires
whole-transaction retry on serialization failure. It does not justify holding a
database transaction open while compiling Pages, fetching external data, or
waiting for a browser.

[Supabase connection guidance](https://supabase.com/docs/guides/database/connecting-to-postgres)
recommends transaction pooling for short-lived/serverless application traffic,
while its
[query-optimization guide](https://supabase.com/docs/guides/database/query-optimization)
emphasizes indexes that match real filters and warns against indiscriminate
over-indexing. Candidate preparation therefore needs bounded concurrency,
identifier-only short transactions, query-plan proof, and no database
connection per open preview tab.

## Hardened architecture

### Canonical terms

- **Page Live Preview:** the optional active-editor presentation from C’s B-prime
  foundation. It advances only after a D12 Working Revision is acknowledged.
- **Candidate Preparation:** a bounded, retryable, non-authoritative operation
  that captures an exact input vector and compiles outside database locks.
- **Whole-Site Preview Candidate:** the immutable ready result for one exact
  Site-locale, including a complete route table and exact render dependencies.
- **Site Preview Session:** a short-lived authenticated viewing context bound to
  one principal and one exact candidate. It is not a share token.
- **Public Site Generation:** D1’s only public serving truth. A Preview Candidate
  is never a Public Site Generation merely waiting for promotion.

Do not call the candidate **staging**, **draft Site**, **preview deployment**, or
**environment** in product copy. Those words imply mutable state or promotion
semantics that D25 explicitly rejects.

### Exact candidate contents

One candidate manifest binds, at minimum:

- exact Tenant, environment, Site, domain disposition, and BCP-47 locale;
- current D1 base generation—or D1’s code-owned empty genesis before a first
  release—and the explicit server-fenced vector of exact D12-acknowledged
  Working Revision receipts deliberately included by the D1 Site Plan/release
  preparation intent—never every current draft;
- every selected Page Editorial, Placement, Navigation, Reusable Section, rich-
  text, topic, source-catalog, curation, windowing, route/redirect, media-
  rendition, and other admitted semantic dependency version;
- current Phase 22 specialized-family public projections or separately
  authorized exact source-owned preview candidates only—never a sweep of
  source-owned mutable drafts or operational records;
- exact D9 package/profile, component registry, compiler/renderer/schema,
  deployment compatibility, and content-addressed artifact digests;
- deterministic complete route table, redirect table, internal link resolution,
  candidate hash, preparation cause, creator, timestamps, lifecycle receipt,
  and code-owned expiry; and
- the current safety, lifecycle, and public-projection contract versions that
  must be rechecked while serving.

The server may expose one opaque candidate locator, but opacity is not
authorization. Unknown, nullable, mixed-scope, duplicate, missing, incompatible,
or unsupported manifest members block readiness.

### Preparation and immutability

1. A Site-wide-authorized staff member chooses **Prepare site preview** from the
   Site Plan/release workspace, or as a secondary action from Page Preview. The
   UI first flushes that person’s active editor and waits for D12’s exact
   acknowledgement. It never claims to flush other people’s browser-only work
   or silently includes unrelated saved drafts.
2. A short database snapshot captures the explicit Site Plan input vector and
   its exact acknowledged revisions;
   compilation, Payload reads, object work, public-source reads, and HTTP calls
   happen after the transaction closes.
3. The builder reads exact versions—not mutable latest—using actor-scoped access
   where acting for the user (`overrideAccess: false` for Payload Local API) and
   least-privilege server capabilities for compilation. A privileged worker’s
   access never becomes viewer permission.
4. Work is idempotent and bounded by Tenant/Site, input digest, and preparation
   generation. Identical requests reuse safe content-addressed work; concurrent
   different requests do not overwrite each other.
5. Finalization re-proves exact scope, candidate membership, current authority,
   lifecycle/safety, package and runtime compatibility, and manifest digest in
   one short CAS transaction. Structural or compile failure produces no ready
   candidate.
6. Once ready, content never changes. Later acknowledged saves produce **Newer
   saved changes available**. **Prepare updated preview** creates a successor;
   the current candidate remains exact until expiry or current adverse
   invalidation.

Candidate preparation may internally fan out and resume, but browsing never
sees partial output. Partial artifacts are unreachable and safely collected.

### Database shape without database burden

The permanent model should be small and provider-neutral:

- one compact preparation/candidate manifest and immutable receipt;
- bounded normalized membership rows only where referential integrity, route
  lookup, authorization, or cleanup requires them;
- content-addressed compiled artifacts outside ordinary relational content rows;
- no duplicate copy of Page bodies, operational CRM data, source projections,
  or the whole Payload database in Supabase;
- no per-navigation, per-page-view, heartbeat-history, or per-viewer candidate
  writes; and
- no Supabase Branch, database clone, Realtime presence channel, tenant-specific
  retention matrix, or candidate table per content type.

Every exposed row uses structural Tenant × environment × Site × locale scope,
RLS, least grants, and matching indexes. Hot paths require exact candidate-key
and route-key indexes, actor/capability lookup indexes, and a bounded expiry
scan; the implementation must use `EXPLAIN (ANALYZE, BUFFERS)` against
production-shaped cardinality before adding speculative indexes. Service-role
credentials never reach the browser. If a worker legitimately bypasses RLS, it
must receive only an identifier-only job and independently resolve and validate
the full trusted scope.

### Current authorization and viewer classes

- Creating or opening a whole-Site candidate requires current Site-wide preview
  capability for the exact Site-locale and every private candidate class.
- A Page-scoped contributor, missionary, reviewer, or named recipient receives
  only an exact Page-local preview. The product does not hide unauthorized menu
  items and call the remainder a whole-Site preview.
- Every HTML, RSC/data, route, redirect, asset, source-projection, refresh, and
  candidate-management request re-derives the principal and exact scope. A
  signed-in Payload user, URL, candidate id, prior success, Draft Mode cookie,
  iframe, popup, or browser session alone grants nothing.
- Permission loss, Tenant membership loss, Site/locale disablement, Trash,
  package revocation, or Phase 10/source safety narrowing fails closed on the
  next request and bounded session revalidation. Already delivered pixels
  cannot be recalled, so the UI must stop future navigation and clear protected
  content when revalidation fails.
- A copied deep link may help another independently authorized staff member
  return to the same candidate and path after authentication. It is never a
  bearer, password, anonymous, permanent, or public share link.

### Routing, dynamic content, effects, and caches

- Internal links, back/forward, deep links, canonical candidate paths, 404s,
  and D3 redirects resolve only through the candidate’s complete route table.
  Missing or excluded destinations show an exact candidate error; they never
  fall through to live or mutable latest.
- Redirect cycles, chains outside policy, reserved routes, cross-Site targets,
  and open redirects block candidate readiness.
- D14 configuration and source-contract versions are exact. Qualified dynamic
  membership intentionally remains the current public-safe projection and is
  labelled **Live public data · as of …**. Safety narrows adverse-first. Source
  failure uses only the source owner’s safe public unavailable state and never
  substitutes staff data, another Tenant, another locale, or an unlabeled
  favorable stale result.
- Giving, forms, subscriptions, notifications, downloads with side effects,
  analytics, third-party tracking, prefetch, and unsafe embeds remain dark.
  Candidate chrome may inspect the qualified destination and say what would
  happen on the live Site; it cannot execute the consequence. Ordinary external
  destinations are intercepted and never receive a private-preview referrer.
- Preview HTML, RSC/data, errors, redirects, and browser responses are
  `private, no-store`, noindex/nofollow/noarchive, absent from public sitemap,
  canonical/hreflang/social/search, and public analytics. Immutable compiled
  artifacts may use a private server cache keyed by complete candidate and
  renderer/package digest only after current request authorization. No public
  CDN key, signed permanent asset URL, or cache tag substitutes for isolation.

### Renderer and deployment skew

The candidate pins the exact D9 package, compiler, schema, component registry,
and artifact digest. A runtime must prove it can render the complete candidate
before serving any route. N/N+1 compatibility is a deployment gate. An
incompatible deployment says **This preview needs to be prepared again** and
does not silently use the latest package, generic renderer, live Site, raw
Payload JSON, or another retained candidate.

Candidate retention is short and code-owned rather than tenant-configurable.
Expiry invalidates rendering but keeps the minimum privacy-safe receipt needed
for diagnosis. An expired deep link offers **Prepare updated preview** only to a
currently authorized principal; it never redirects to live. Candidates do not
block ordinary Trash indefinitely: adverse lifecycle state invalidates them,
and cleanup never removes artifacts still required by a renderable candidate.

## Staff UX journey

### Quiet Page editing

The existing Page-first surface keeps one primary **Preview page** action beside
the D12 save status and D1 publication action.

- On a wide screen, **Preview page** opens the optional Page Live Preview pane.
- On a narrow screen or high zoom, it opens the same exact Page preview as a
  top-level full-screen view rather than squeezing two unusable panes together.
- The live pane advances only after the exact save receipt. During local or
  uncertain work it keeps the last safe frame and says **Waiting for saved
  changes** or **Preview paused**.
- A restrained **Prepare site preview** action in the Site Plan/release workspace
  and as a secondary Page Preview action—not another competing editor toolbar
  button—starts deliberate candidate preparation.

### Candidate preparation

The preparation sheet says exactly what it will do:

> **Prepare site preview**
>
> Creates a private Site preview from the exact saved changes included in this
> Site Plan. Unsaved work and other saved drafts are not included. Nothing will
> be published.

One confirmation shows Site, locale, current path, included saved-change count,
and cause-owned blockers. Preparation runs in the background with an honest
indeterminate status—never fake percentage completion. Staff can continue
editing. Readiness is announced politely and opens only after a user action, so
popup blockers and focus loss do not become product failures.

### Whole-Site browsing

Candidate chrome remains visually distinct from the tenant’s actual Site while
leaving the public rendering unobstructed:

- persistent **Site preview · Not public** label;
- Site name, exact locale, prepared time, and **Includes _n_ saved changes**;
- visible **Newer saved changes available** state without auto-advancing;
- **Back to editor**, conditional **Edit this page**, **Prepare updated
  preview**, and clearly separate **View live site** actions;
- responsive width controls with truthful labels such as **Responsive**,
  **Narrow · 375 px**, **Medium · 768 px**, and **Wide · 1280 px**, without
  pretending to emulate named phones; and
- a details disclosure for exact revisions and dependency diagnostics, keeping
  provider ids and compiler jargon out of the ordinary path.

Candidate Navigation and internal links work normally. Side-effecting controls
open a safe explanation in the preview chrome. The browser back button, refresh,
and authenticated deep links preserve candidate identity. A candidate 404,
expired state, or permission loss never looks like the live Site.

Status changes are persistent text and polite announcements, not color, spinner,
icon, toast, or hover text alone. Loading keeps the last still-authorized exact
frame visible. Keyboard users can enter and leave the framed document, return
focus to the invoking control, and bypass repeated preview chrome. The product
must work at 320 CSS pixels, 400% zoom, touch, screen reader, forced colors,
reduced motion, RTL/bidirectional text, long localized labels, slow networks,
and suspended mobile tabs. These requirements align with WCAG guidance for
[frame titles](https://www.w3.org/WAI/WCAG22/Techniques/html/H64),
[focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order),
[reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow), and
[status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages).

## Ruthless category-by-category review

Severity expresses impact after a defect occurs; likelihood estimates the
unqualified C-prime proposal at realistic multi-tenant production use.

### 1. Brittleness — material concern: yes

- **What could go wrong:** A candidate assembled from mutable `latest`, an
  assumed already-public base for a brand-new Site, multiple request-time
  relationships, changing Navigation, and a deploy’s current renderer can show
  a different Site on reload, fail before first release, or break halfway
  through a coordinated review.
- **Why it matters:** Staff would approve a state that never existed as one
  coherent release candidate.
- **Severity:** High.
- **Likelihood:** High without hardening; the current route already uses
  `draft: true`, `depth: 2`, and a second renderer.
- **Evidence/reasoning:** D1, D2, D4, D9, D12, Payload draft semantics, and the
  current route all expose mutable or independently versioned inputs.
- **Permanent prevention:** Seal one immutable candidate manifest from the
  current D1 generation or D1’s code-owned empty genesis, exact revision
  receipts, and runtime/package digests; create successors rather than refreshing
  in place; fail the whole preparation on incompatible structure.

### 2. Technical debt — material concern: yes

- **What could go wrong:** Teams could add another Site schema, renderer, draft
  route resolver, cache policy, and release-like lifecycle beside D1.
- **Why it matters:** Every new Page type, package, locale, redirect rule, and
  source would need duplicate implementation and migration.
- **Severity:** High.
- **Likelihood:** High if the current authenticated preview is extended.
- **Evidence/reasoning:** The current preview owns a generic block switch while
  D9 expressly requires bespoke package parity and D1 owns the compiler.
- **Permanent prevention:** One D1 compiler/public view-model port for public and
  private candidates; one provider-neutral manifest; retire the generic preview
  renderer; no second version engine or Site schema.

### 3. Edge cases — material concern: yes

- **What could go wrong:** A save lands during preparation; a new Page claims a
  reserved path; a Navigation draft points to a trashed Page; locale content is
  missing; redirect loops form; dynamic data withdraws; a package is revoked;
  or a browser resumes an expired deep link.
- **Why it matters:** Any one can create mixed output, false confidence, or a
  private-data leak.
- **Severity:** High.
- **Likelihood:** High across many Sites even if each event is individually
  uncommon.
- **Evidence/reasoning:** D2/D3/D4/D12/D14/D21/D22 deliberately separate these
  states because they change independently.
- **Permanent prevention:** Exact input vector, complete preflight, route graph
  validation, current adverse checks, explicit expired/blocked states, and the
  validation matrix below.

### 4. Footguns — material concern: yes

- **What could go wrong:** **Live**, **staging**, **Publish preview**, a copied
  URL, active giving button, or “all changes” without an inclusion summary can
  mislead staff into publishing, sharing, or triggering consequences.
- **Why it matters:** Nonprofit staff should not need to understand CMS provider
  internals to know whether something is saved, private, or public.
- **Severity:** High.
- **Likelihood:** Medium–high.
- **Evidence/reasoning:** Current preview CTAs are active; modern CMSs use
  several overlapping preview/release terms; D12 and D24 require precise state
  language.
- **Permanent prevention:** Canonical product terms, persistent **Not public**,
  exact inclusion summary, separate **View live site**, inert effects, one
  confirmation, and no provider-derived verbs.

### 5. Tenant safety — material concern: yes

- **What could go wrong:** Forged candidate, Page, route, locale, membership,
  relationship, media, or artifact ids can cross Tenant/Site scope; a Site-wide
  candidate can reveal drafts to a Page-limited user.
- **Why it matters:** This is a direct multi-tenant confidentiality breach.
- **Severity:** Critical.
- **Likelihood:** Medium without structural controls; identifier-only current
  routing and `depth: 2` increase the attack surface.
- **Evidence/reasoning:** Supabase RLS requires explicit predicates and indexes;
  Payload Local API bypasses access unless explicitly disabled; D23 makes Site
  ownership exact.
- **Permanent prevention:** Composite structural scope, RLS and least grants,
  `overrideAccess: false` for user-bound reads, server-derived scope, Site-wide
  preview capability, no partially masked candidate, and hostile cross-scope
  tests across HTML/data/assets/redirects.

### 6. Overengineering — material concern: yes

- **What could go wrong:** “Whole-Site environment” grows into cloned Supabase
  projects, permanent preview hosts, tenant branches, environment promotion,
  comments, presence, visual overlays, device farms, and configurable TTLs.
- **Why it matters:** It creates a costly deployment/CMS platform before the
  ministry workflow proves a need for those products.
- **Severity:** High.
- **Likelihood:** High because “environment” naturally invites those features.
- **Evidence/reasoning:** Contentful’s environment model carries developer and
  content-model deployment semantics; D1 already supplies the only release
  mechanism.
- **Permanent prevention:** One immutable Site-locale candidate on the existing
  runtime, one code-owned lifecycle, no DB clone or alias, and the explicit
  non-goals below.

### 7. UX/UI and user friction — material concern: yes

- **What could go wrong:** Three preview buttons, fake progress, cramped iframe,
  unexplained stale content, technical ids, silent locale switching, or
  candidate/live visual similarity can make staff distrust the tool.
- **Why it matters:** Occasional ministry staff will skip Preview or approve the
  wrong state if the product needs training to interpret.
- **Severity:** High.
- **Likelihood:** High unless the journey is deliberately designed.
- **Evidence/reasoning:** WCAG requires frame/title/focus/reflow/status behavior;
  D12 and D24 require persistent truthful state, not transient success toasts.
- **Permanent prevention:** One Page **Preview page** entry, secondary **Prepare
  site preview**, exact preparation copy, persistent candidate chrome, count and
  freshness, explicit successor action, full-screen small-device path, and
  representative usability/accessibility tests.

### 8. Hidden coupling — material concern: yes

- **What could go wrong:** Product truth can leak into Payload `_status`,
  `draft: true`, relationship depth, iframe messages, Next Draft Mode, current
  deployment, custom package internals, or a Supabase service-role worker.
- **Why it matters:** Provider upgrades or one shortcut can change security and
  exactness without changing the D25 UI.
- **Severity:** High.
- **Likelihood:** Medium–high, especially with the current internal/preview
  package pins.
- **Evidence/reasoning:** Payload’s documented mechanics use provider draft and
  browser-message semantics; D1/D9/D12 define stricter product facts.
- **Permanent prevention:** Versioned Asym candidate/preview ports, exact-pin
  adapter conformance, typed browser protocol, explicit access enforcement,
  and no provider field as release or viewer authority.

### 9. Failure modes — material concern: yes

- **What could go wrong:** One failed Page, asset, source, renderer, or route can
  leave a “ready” candidate with holes; a failed refresh can silently show live,
  generic, earlier, or cross-locale output.
- **Why it matters:** A partial Site is worse than a visible failure because it
  appears reviewable.
- **Severity:** High.
- **Likelihood:** Medium–high at whole-Site cardinality.
- **Evidence/reasoning:** D1’s candidate is all-or-none precisely because
  dependency failures multiply with closure size.
- **Permanent prevention:** Preparation and readiness are atomic; prior exact
  candidate remains labelled; no favorable fallback; dynamic-source unavailable
  states follow D14; failures are cause-owned and retryable.

### 10. Data integrity risks — material concern: yes

- **What could go wrong:** Check-then-insert races create duplicate candidates;
  late builders overwrite newer candidates; mixed revision vectors or partial
  cleanup orphan membership/artifacts; a retry after lost acknowledgement
  duplicates work.
- **Why it matters:** Staff cannot reproduce what they reviewed, and storage or
  deletion health drifts.
- **Severity:** High.
- **Likelihood:** Medium under concurrency.
- **Evidence/reasoning:** D1/D12/D13 already require idempotency, expected-
  revision fencing, CAS, and receipt lookup for these same race classes.
- **Permanent prevention:** Unique idempotency/digest constraints, immutable
  manifests, short CAS finalization, full-command retry on serialization,
  receipt lookup after unknown outcomes, stable lock order, and idempotent
  cleanup.

### 11. Security and privacy risks — material concern: yes

- **What could go wrong:** Draft HTML/data enters public caches, candidate URLs
  act as bearer links, cross-window messages accept a confusable origin, custom
  packages exfiltrate data, or external controls leak referrers and content.
- **Why it matters:** Draft ministry information can expose people, locations,
  plans, or safety-sensitive content before release.
- **Severity:** Critical.
- **Likelihood:** Medium without a dedicated contract.
- **Evidence/reasoning:** D24 makes Preview private/no-store; OWASP’s
  [web-messaging guidance](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#web-messaging)
  requires exact origins and validated data; D9 removes arbitrary network and
  privileged authority from packages.
- **Permanent prevention:** Current authorization on every surface, no bearer
  links, exact origin/source/nonce/protocol checks for the Page pane, restrictive
  CSP/referrer policy, typed public-safe DTOs, dark effects, privacy-safe logs,
  and leak-negative fixtures.

### 12. Scalability and performance risks — material concern: yes

- **What could go wrong:** Every autosave triggers a full-Site build; large
  route graphs cause N+1 reads; candidates duplicate artifacts per viewer;
  expensive RLS policies scan rows; or open tabs exhaust database connections.
- **Why it matters:** A feature that works for a five-Page demo can degrade the
  shared CRM database and public release work for every Tenant.
- **Severity:** High.
- **Likelihood:** Medium–high without budgets.
- **Evidence/reasoning:** Supabase documents policy/index and connection costs;
  whole-Site closure is inherently larger than Page-local preview.
- **Permanent prevention:** Deliberate candidate preparation only, no build per
  autosave, content-addressed reuse, set-based reads, bounded depth/concurrency,
  pooled short connections, query/compile/artifact budgets, backpressure, and
  production-shaped load proof.

### 13. Operational burden — material concern: yes

- **What could go wrong:** Orphan candidates, expiring domains, certificate
  management, cleanup debt, stuck preparations, package exceptions, and staff
  requests to recover “staging” become recurring developer work.
- **Why it matters:** A nonprofit SaaS cannot afford a hand-maintained preview
  fleet per Tenant.
- **Severity:** High.
- **Likelihood:** High for a literal environment-per-candidate design.
- **Evidence/reasoning:** Environment clones and aliases require lifecycle and
  promotion operations; D1 already avoids a permanent private serving head.
- **Permanent prevention:** Candidate routes on the shared qualified runtime,
  code-owned expiry, idempotent automatic cleanup, bounded queues, no custom
  preview domain, and a small cause-owned operations surface.

### 14. Observability gaps — material concern: yes

- **What could go wrong:** Staff report “preview is wrong,” but operators cannot
  tell whether save, candidate selection, compiler, package, route, source, auth,
  cache, deploy skew, or cleanup owns the failure.
- **Why it matters:** Silent mixed-state and privacy defects will be discovered
  late and recovered slowly.
- **Severity:** High.
- **Likelihood:** High unless designed before implementation.
- **Evidence/reasoning:** D1, D12, D14, D17, and D24 deliberately separate facts
  whose failures otherwise look identical in the browser.
- **Permanent prevention:** Correlated candidate/preparation/manifest digests;
  cause-coded timings and failures; queue/closure/artifact/query budgets;
  authorization-denial, partial-exposure, cleanup-lag, skew, and adverse-source
  alerts; no content, route text, or personal names in telemetry.

### 15. Dependency and integration risks — material concern: yes

- **What could go wrong:** Payload internal v4, Next preview builds, Live Preview
  helper packages, Vercel behavior, Supabase pooling/RLS, or certified D9 package
  APIs drift independently.
- **Why it matters:** A framework upgrade can invalidate origin, cache, version,
  rendering, or transaction assumptions.
- **Severity:** High.
- **Likelihood:** Medium–high given current internal/preview pins.
- **Evidence/reasoning:** The existing D25 primary-source audit found exact-
  version differences and no declared Live Preview helper dependency in Core.
- **Permanent prevention:** Provider-neutral ports, exact lockfile closure,
  installed-source review, N/N+1 renderer tests, contract-version fences, and
  black-box conformance before every relevant upgrade.

### 16. Migration and upgrade risks — material concern: yes

- **What could go wrong:** Old collection/id preview links retain mutable-latest
  semantics; new manifest rows cannot be read by retained workers; cleanup
  removes artifacts needed by an older deployment; or rollout creates two
  candidate authorities.
- **Why it matters:** A security fix can regress during mixed-version deploy or
  rollback.
- **Severity:** High.
- **Likelihood:** Medium.
- **Evidence/reasoning:** The current route has a different identity model, and
  D9 candidates explicitly require deploy-skew proof.
- **Permanent prevention:** Additive versioned manifest/protocol, retained N/N+1
  readers, explicit old-route retirement, no redirect to mutable latest,
  compatible cleanup fencing, migration inventory, canary proof, and rollback
  that preserves both public and private exact state.

### 17. Other development hazards — material concern: yes

- **What could go wrong:** Deadlocks, cancellation races, late-result wins,
  popup/focus failures, iframe source confusion, unbounded retries, unclear
  ownership, or a deploy that exposes partial candidates can survive ordinary
  happy-path tests.
- **Why it matters:** These faults combine security, correctness, usability, and
  cost impact.
- **Severity:** High.
- **Likelihood:** Medium–high.
- **Evidence/reasoning:** Whole-Site preparation joins asynchronous build,
  database, auth, browser, and package boundaries; D1/D12 already require stable
  ordering and outcome recovery.
- **Permanent prevention:** One owner and state machine, stable lock order,
  cancellable but idempotent work, stale-result fencing, bounded retry with
  receipt lookup, feature-flagged adverse-first rollout, and chaos/race/browser
  testing before activation.

## Ruthless synthesis and implementation order

### Must be fixed before implementation is accepted

1. **Ratify the domain boundary:** one exact Site-locale Preview Candidate, not a
   mutable environment; D1 remains sole release authority.
2. **Define exact identity and selection:** current base generation—or D1’s
   code-owned empty genesis before a first release—plus one explicit,
   server-fenced vector of D12-acknowledged revisions selected by the D1 Site
   Plan/release preparation intent and complete dependency/version digests. No
   all-drafts sweep and no request-time `latest`.
3. **Enforce viewer classes:** Site-wide capability for whole-Site review;
   Phase 22 exact Page preview for Page-limited users; no partial masking.
4. **Unify rendering:** D1 compiler, D9 exact package, D24 public-safe view model,
   D22 locale exactness, D14 dynamic-data truth, and dark effects.
5. **Make preparation atomic:** short snapshot and CAS transactions, compilation
   outside locks, immutable ready result, successor replacement, no partial
   serving, and no favorable fallback.
6. **Build the private delivery boundary:** reauthorization, RLS/least grants,
   exact origins and typed messages where embedded, no-store/noindex, safe
   assets, candidate-only routing, and privacy-safe logs.
7. **Prove Supabase behavior:** structural scope, policy indexes, query plans,
   connection/concurrency budgets, idempotency, serialization retry, cleanup,
   and cross-tenant tests.
8. **Implement the staff journey as one coherent product:** **Preview page**
   first, **Open exact preview** for pinned Page/review/schedule truth, **Prepare
   site preview** only for deliberate Site-wide review, truthful preparation/
   current/newer/expired/blocked states, accessible full-screen fallback, and a
   separate live Site action.

### Should be addressed in the same delivery slice

1. Privacy-safe candidate health dashboards and cause-owned alerts.
2. Exact old-preview-route retirement and mixed-version rollout/rollback proof.
3. Code-owned retention, artifact reuse, bounded cleanup, and load budgets.
4. Representative nonprofit staff usability research across occasional editors,
   Site reviewers, translators, and administrators—not only developers.

### Monitor after activation

1. Candidate preparation p50/p95/p99, closure size, artifact reuse, database
   time, queue delay, failure causes, cleanup lag, and cost per Site.
2. How often staff use whole-Site review versus Page preview, abandon a build,
   prepare repeated successors, or mistake candidate for live.
3. Cross-version renderer/package skew, dynamic-source adverse suppression,
   authorization denials, candidate 404/redirect errors, and accessibility
   support signals.

Do not respond to low usage by adding configurability. If whole-Site review is
rare, retain the safe bounded capability; if cost or confusion is high, reduce
automatic surface area before adding branches, sharing, or cloned environments.

## Explicit non-goals

D25 does not create:

- a Supabase Branch, copied database, Payload environment clone, environment
  alias, permanent staging Site, per-candidate deployment, or custom preview
  domain;
- a second mutable serving head, public promotion pointer, release bundle,
  approval authority, schedule authority, or “publish this preview” command;
- anonymous, password, bearer, QR-code, public, permanent, or external preview
  sharing;
- partially permission-filtered whole-Site candidates;
- per-keystroke whole-Site builds, database writes per view, Realtime presence,
  CRDT/OT, live cursors, comments, or collaborative visual editing;
- click-to-edit overlays, visual source maps, arbitrary device emulators, visual
  regression SaaS, or an enterprise Visual Editor promise;
- arbitrary staff-curated revision branches, tenant retention matrices,
  candidate inheritance, or a candidate-management dashboard;
- duplicated Page/CRM/source data in Supabase, raw Payload document delivery,
  unrestricted relationship population, or service-role browser access;
- live giving, forms, notifications, analytics, tracking, external embeds, or
  other side effects; or
- public cache, search, sitemap, canonical, hreflang, social, crawler, or
  analytics participation.

## Primary sources

- [Payload Preview](https://payloadcms.com/docs/admin/preview)
- [Payload Live Preview](https://payloadcms.com/docs/live-preview/overview)
- [Payload drafts](https://payloadcms.com/docs/versions/drafts)
- [Payload versions](https://payloadcms.com/docs/versions/overview)
- [Next.js Draft Mode](https://nextjs.org/docs/app/guides/draft-mode)
- [Sanity presenting and previewing content](https://www.sanity.io/docs/content-lake/presenting-and-previewing-content)
- [Sanity Content Releases](https://www.sanity.io/docs/user-guides/content-releases)
- [Contentful environment aliases](https://www.contentful.com/developers/docs/concepts/environment-aliases/)
- [Contentful environment-alias deployment](https://www.contentful.com/developers/docs/tutorials/general/deploying-changes-with-environment-aliases/)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase database connections](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Supabase query optimization](https://supabase.com/docs/guides/database/query-optimization)
- [PostgreSQL transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
- [OWASP HTML5 Security — web messaging](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#web-messaging)
- [Content Security Policy specification](https://www.w3.org/TR/CSP/)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

## Exact founder-ratified C-prime-R formulation

> **C-prime-amended-and-hardened (C-prime-R) — one exact, immutable Whole-Site
> Preview Candidate for one Tenant × environment × Site × BCP-47 locale and one
> sealed Site Plan input vector over D1’s public compiler, paired with B-prime’s
> bounded Page-local Preview page and Open exact preview cadences.** The ordinary
> Page-first **Preview page**
> action may show one optional wide-screen pane, or the same top-level
> full-screen view on narrow/zoomed screens, for the one
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
> Revisions, and all exact Page Editorial,
> Placement,
> Navigation, route/redirect, Reusable Section, rich-text, topic, Dynamic Source,
> curation/windowing, media-rendition, presentation-package/profile,
> compiler/renderer/schema, deployment and safety-contract dependencies. It
> never sweeps all current drafts or other users’ browser-only work. Whole
> Site means every eligible route in that one exact locale; another locale is a
> separately sealed candidate, never silent fallback or a mixed cross-locale
> closure. Phase 22 specialized families enter through the current D1 public
> projection or a separately authorized exact source-owned preview candidate,
> never by scanning mutable source drafts, copying operational records or
> widening source authority. A Page-scoped contributor, missionary, reviewer or
> named recipient remains on Phase 22 D10’s exact Page-local preview; D25 does
> not mask unauthorized routes and call the remainder a whole-Site candidate.
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
> authority.
> Embedded Page Live Preview uses exact allowed origins, source-window equality,
> typed protocol version, session nonce and revision sequence. Privacy-safe
> observability records hashes, sizes, timings and cause codes—not content,
> route text, personal names or secrets.
>
> Supabase/Postgres stores only the compact scoped preparation/candidate
> manifest, immutable receipt and bounded normalized membership needed for
> integrity, route lookup, authorization and cleanup; compiled content-addressed
> artifacts live behind the private server boundary. Exposed rows use RLS, least
> grants, structural Tenant/environment/Site/locale integrity and indexes proven
> against actual policy and lookup shapes; privileged workers receive
> identifier-only jobs and independently validate complete scope. There is no
> copied Page/CRM/source corpus, database write per Page view or browser
> heartbeat history, Supabase Branch, cloned database, Realtime presence, per-Tenant
> retention matrix or service credential in the client. Preparation and serving
> use pooled short connections, set-based reads, bounded depth/concurrency,
> measured query/compile/artifact budgets, backpressure, idempotent cleanup and
> privacy-safe health alerts.
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

## Validation matrix before activation

| Area                  | Required observable proof                                                                                                                                                                                                                                                        |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Exact selection       | Candidate manifest equals one current D1 base—or the code-owned empty genesis before first release—plus one explicit Site Plan input vector of exact D12-acknowledged Site-locale revisions; unrelated drafts, unsaved browser state, and later saves never enter it.            |
| Immutability          | Reload, deep link, browser back/forward, later save, concurrent preparation, retry and deploy never change a ready candidate; successor has a new identity.                                                                                                                      |
| Complete readiness    | Page, Navigation, route, redirect, shared section, media, source contract, package or compiler failure exposes no partial candidate; previous ready candidate remains explicitly labelled when still safe.                                                                       |
| Viewer classes        | Site-wide-authorized principals see the complete exact candidate; Page-limited contributors/reviewers/named recipients see only exact Page preview and cannot enumerate candidate membership.                                                                                    |
| Tenant isolation      | Forged Tenant, environment, Site, locale, candidate, Page, route, revision, membership, relationship, media, artifact, HTML, RSC/data and redirect identifiers fail non-enumeratingly under cold and warm caches.                                                                |
| RLS and access        | Policies include exact authorization predicates and indexed columns; user-bound Payload reads set `overrideAccess: false`; privileged worker access never grants view access; service credentials are absent from client bundles.                                                |
| Snapshot/concurrency  | Save-during-selection, revision removal, duplicate prepare, serialization failure, lost acknowledgement, late builder, cancellation, cleanup and simultaneous successor races preserve one exact receipt and no duplicate/partial state.                                         |
| Routing               | Candidate Navigation, internal links, new Pages, deep links, query strings, 404s, reserved paths, redirects, loop/chain/open-redirect rejection and cross-locale/cross-Site targets resolve only inside the exact candidate.                                                     |
| Locale                | Path, Navigation, direction, content, metadata, media text, package and messages use one exact BCP-47 lineage with no silent field/provider fallback; another locale opens another exact candidate.                                                                              |
| Renderer/package      | Standard and every certified D9 package render from the same exact view model/compiler as D1; generic fallback, raw provider JSON, unknown blocks and N/N+1 package/deploy skew fail closed.                                                                                     |
| Source-owned families | Phase 22 specialized Pages use current D1 public projections or separately authorized exact source-owned candidates; mutable source drafts and operational records cannot be swept into the Site candidate.                                                                      |
| Dynamic sources       | Exact source configuration plus current public-safe data is labelled with freshness; withdrawal narrows immediately; unavailable, empty and permission failure remain distinct and leak no private/cross-Tenant facts.                                                           |
| Effects               | Giving, form submit, subscription, notification, analytics, tracking, prefetch, unsafe embed, consequential download and external referrer tests prove zero side effects while destination explanation remains accurate.                                                         |
| Cache/discovery       | HTML, RSC/data, redirects, errors and protected assets are private/no-store; no public CDN hit, cache-key collision, sitemap, search, canonical, hreflang, social, crawler or analytics emission exists.                                                                         |
| Revocation/expiry     | Session, membership, capability, Site/locale, Trash, safety, package and candidate expiry block the next request/revalidation, clear protected output, and never redirect or fall back to live.                                                                                  |
| Database performance  | Production-shaped `EXPLAIN (ANALYZE, BUFFERS)`, RLS tests, closure builds and concurrent tabs prove set-based indexed reads, bounded connections/locks/write amplification and no N+1 or per-view writes.                                                                        |
| Cost and operations   | p50/p95/p99 preparation, closure size, artifact reuse, DB time, queue delay, failure rate, cleanup lag and per-Site cost remain within code-owned budgets; overload backpressures without affecting D1 public release.                                                           |
| Observability         | Every failure resolves to one safe cause owner across save, selection, auth, route, source, package, compiler, cache, deploy or cleanup; alerts contain no content, route text, personal names or secrets.                                                                       |
| UX/accessibility      | Occasional ministry staff can explain saved vs candidate vs live, prepare/open/update/return without coaching, and complete keyboard, screen-reader, focus, 320-pixel reflow, 400% zoom, touch, forced-colors, reduced-motion, RTL/CJK, slow-network and mobile-resume journeys. |
| Migration/rollback    | Old mutable preview URLs are explicitly retired, additive manifest versions support N/N+1 readers/workers, cleanup respects retained candidates, canary rollback preserves the public head, and no interval has two preview authorities.                                         |
