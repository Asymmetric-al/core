# Phase 23 D24 decision brief — public audience visibility and cache policy

**Status:** Founder-ratified Phase 23 D24 A-prime-R.

**Date:** 2026-08-23

## Decision selected for hardening

The founder selected one exact anonymous-public representation of each released
Site and locale, with private content retained in its app-owned authenticated
surface. D24 now needs ratification of the exact hardened contract below. The
three researched options remain in this brief as decision provenance.

This is one decision. It does not reopen D1-D23 or decide broader Donor Portal,
Missionary Workspace, Mission Control, campaign-personalization, or marketing-
automation scope.

## Why this decision is next

The Phase 23 roadmap leaves audience-conditional public content unresolved
because it collides directly with cache identity. The already-ratified decisions
now make that boundary concrete:

- [D1](../../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
  makes one complete Site Plan generation the public release authority.
- [D5](../../../adr/0149-bounded-public-navigation-purpose-and-item-grammar.md)
  deliberately excludes per-item audience and schedule rules and keeps account
  chrome outside public Navigation.
- [D13](../../../adr/0157-exact-revision-scheduled-publication-appointments-through-d1.md)
  already supplies one bounded whole-Page public date window through exact
  publish and unpublish appointments. It rejects request-time condition builders.
- [D14](../../../adr/0158-versioned-dynamic-source-catalog-and-content-list.md)
  carries a trusted server-resolved audience dimension through public source and
  cache contracts, while expressly excluding personalization.
- [D17](../../../adr/0161-derived-public-site-search-projection-and-adverse-first-convergence.md)
  indexes one exact Tenant x environment x Site x locale x public-audience x D1
  generation and excludes personalization.
- D22 makes locale variants exact, independently releasable public
  representations; D23 preserves exact Site ownership. Neither makes login state
  a content dimension.
- Phase 10 already separates public-safe publication from private and restricted
  material. Phase 25 owns Donor Portal depth, and Phase 28 owns Missionary
  Workspace depth.

D24 must therefore decide whether `audience` means one exact public contract at
launch or becomes a new personalization and authorization subsystem.

## Current repository facts

The current runtime is a useful warning, not the final D1 implementation:

- [`packages/lib/cms/public-page.ts`](../../../../packages/lib/cms/public-page.ts)
  defines one public Page shape and a 60-second cache policy. Its cache tags vary
  by public CMS namespace, host, and content descriptor; they do not vary by
  authenticated user, role, membership, campaign, geography, or segment.
- [`apps/donor/lib/cms/client.ts`](../../../../apps/donor/lib/cms/client.ts)
  resolves the request host and uses that shared public cache policy for
  published Page-like reads.
- [`apps/donor/app/(public)/(solid)/[...cmsSlug]/page.tsx`](<../../../../apps/donor/app/(public)/(solid)/%5B...cmsSlug%5D/page.tsx>)
  is an anonymous published-content route. The authenticated donor area is a
  separate route group, and `apps/missionary` is a separate authenticated app.
- Current cache identity is therefore safe only while the cached representation
  is genuinely the same public content for every visitor at that host and path.
  Adding a role or login check inside the renderer without changing the entire
  delivery contract would be a cross-user disclosure bug.
- The current implementation is still a Phase 5 bridge rather than complete D1
  machinery. D24 should define the durable boundary instead of adding audience
  conditionals to that bridge.

## Primary-source research

### SiteStacker parity is a capability, not an architecture mandate

SiteStacker's
[Site Planner documentation](https://training.sitestacker.com/support/solutions/articles/151000113983-site-planner-overview)
documents visibility conditions on menus, menu items, folders, pages, and
wrappers. That proves the feature exists in the comparison product. It does not
prove that a multi-tenant nonprofit platform should combine public content,
authenticated authorization, SEO, and cache variation on one URL at launch.

### HTTP shared-cache rules are intentionally conservative

[RFC 9111 section 3.5](https://www.rfc-editor.org/rfc/rfc9111.html#section-3.5)
forbids a shared cache from reusing a response to a request with
`Authorization` unless explicit directives permit it. Its definitions of
[`private`](https://www.rfc-editor.org/rfc/rfc9111.html#name-private) and
[`no-store`](https://www.rfc-editor.org/rfc/rfc9111.html#name-no-store) make two
important points: `private` controls where a response may be stored, not whether
the underlying content is authorized, and `no-store` does not itself provide a
complete privacy guarantee. Authorization must remain a separate request-time
proof.

### Current Next.js behavior does not make personalization free

The isolated Phase 23 decision worktree at `8c53dc40a` declares and locks the
exact Next.js pin `16.3.0-preview.9`. During this review, the separate current
`develop` checkout and its installed package were already on `16.2.6`; this is
branch drift, not evidence that either package's behavior may be assumed for a
future implementation. D24 therefore stays framework-neutral. Before coding,
the implementer must install the exact pin on the implementation branch and
reread that version's bundled documentation and package source. Current
official Next.js guidance for
[`use cache`](https://nextjs.org/docs/app/api-reference/directives/use-cache)
recommends reading request values outside a shared cached scope and passing only
the actual cache dimensions into it. Each argument becomes part of cache
identity, so session, user, or fine-grained segment inputs create high-cardinality
variants and a difficult invalidation problem.

The exact `16.3.0-preview.9` bundled
[`use cache: private`](https://nextjs.org/docs/app/api-reference/directives/use-cache-private)
guide does not label the directive experimental. Its actual semantics are the
material constraint: it may read cookies and headers, but results are retained
only in the individual browser's in-memory cache, are not stored on the server,
do not survive reloads, execute on every server render, cannot use a custom
cache handler, are excluded from the static shell, and are unavailable in Route
Handlers. It is not authorization or a shared authenticated-content delivery
contract. The enclosing Next.js pin is itself a preview, so implementation must
requalify the exact target version.

Next.js also documents that dynamic responses are private and not cached by
shared intermediaries, while
[CDN caching](https://nextjs.org/docs/app/guides/cdn-caching) has a separate
invalidation lifecycle. A product that mixes public and authenticated
representations must prove application-cache, framework-cache, CDN, browser,
search, sitemap, social-card, and crawler behavior independently.

### Mature CMS and security models require explicit variation

Drupal's [cache-context documentation](https://www.drupal.org/docs/develop/drupal-apis/cache-api/cache-contexts)
models user, role, permission, session, language, route, and other contexts as
explicit equivalents of HTTP `Vary`. It also notes that highly dynamic access
rules can reduce cacheability to zero. This is evidence that audience-aware
delivery is a real product and performance subsystem, not one boolean field.

Payload's [access-control documentation](https://payloadcms.com/docs/access-control/overview)
can restrict document and field operations by authenticated user or query
constraints. Payload does not define Asym's Site-aware public release, cache,
search, canonical, social, or portal-audience contract. Provider access control
is an adapter capability, not proof that one public Page may safely vary.

OWASP's [Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
recommends deny-by-default authorization and validating permission on every
request. Hiding a block in the browser, omitting it from a menu, or choosing a
private cache directive is not authorization.

Google's [technical requirements](https://developers.google.com/search/docs/essentials/technical)
require indexable content to be publicly accessible to Googlebot. One stable
anonymous representation gives search engines, social scrapers, assistive
technology, donors, and staff a coherent answer. Login-only variants are not the
public canonical representation and should not be represented as such.

## Named ministry scenario

**Hope Global Missions** operates a public Site for donors and ministry
partners. Maya, its communications director, prepares a year-end impact Page.
Daniel is a monthly donor with a Donor Portal account, and Amara is a missionary
with a Missionary Workspace account.

Maya has three pieces of content:

1. a public story, photos, and donation call to action intended for anyone;
2. a donor-specific thank-you with a private giving-history action; and
3. a missionary travel briefing that contains operational details.

The best ordinary workflow is not one Page with three invisible audience rules.
Maya publishes the public story through Web Studio. The donor thank-you and
giving action belong to the authenticated Donor Portal. The travel briefing
belongs to the authenticated Missionary Workspace. The public Page may offer a
normal app-owned sign-in or account action, but its CMS-authored body,
Navigation, metadata, search document, sitemap entry, and social preview remain
the same public representation regardless of cookies.

If Maya wants the whole public story to be available only during the year-end
campaign, D13 already provides an exact scheduled publish and unpublish window.
It does not require a second visibility-condition language.

This gives Maya one clear answer to **who can see this Page**: anyone, once its
exact locale revision is released. It gives Daniel and Amara private content in
the products that can actually re-prove their current authorization.

## Options

### Option A-prime — One exact public audience with app-owned authenticated surfaces

Every D1 public Page, Article, Navigation projection, Dynamic Content List,
search document, metadata record, sitemap URL, and social-card input uses one
code-owned audience value: `public`. The representation is anonymous and is the
same for every visitor at the same Site, locale, path, and active D1 generation.

Web Studio exposes no audience dropdown, conditional-block builder, role list,
or login-state preview for ordinary public content. The Page information and
release confirmation quietly say **Public website — anyone can view after
release**. D13 may create a whole-Page public date window. Account chrome remains
app-owned under D5.

Authenticated content remains in its owning app:

- Donor Portal for donor-account and giving-history content;
- Missionary Workspace for missionary and team operational content; and
- Mission Control for staff-only content.

The existing trusted `audience` dimension is retained as the exact code-owned
constant `public`, never a nullable field, client-supplied value, tenant-created
catalog, or ignored cache parameter. A future authenticated CMS reader would
need its own explicit owner, route, release, authorization, search, preview,
cache, invalidation, and conformance contract before another value could exist.

**Benefits**

- clearest possible staff mental model with no hidden conditional state;
- strongest tenant, privacy, cache-poisoning, SEO, sitemap, and social-preview
  safety;
- preserves fast shared public delivery and low-cardinality cache identity;
- fits D1, D5, D13, D14, D17, Phase 10, and the current separate-app topology;
  and
- keeps future growth additive without prebuilding a generic personalization
  engine.

**Costs**

- a tenant cannot author donor-only or missionary-only CMS regions in Web Studio
  during Phase 23;
- a public campaign cannot change its body for signed-in donors on the same URL;
  and
- app-owned authenticated content may use a different authoring workflow until
  its owning phase deliberately adopts a qualified CMS seam.

**Risks**

- staff may initially expect a visibility control because other CMS products
  expose one;
- product pressure may later tempt a developer to infer login state inside the
  public renderer; and
- the reserved audience dimension could become misleading if it is nullable or
  undocumented.

**Downstream consequences**

- D1 compiler and public readers reject every audience except exact `public`;
- D14 adapters, D17 index keys, cache tags, canonical metadata, sitemaps, social
  previews, previews, and test fixtures use that same exact value;
- public release and cache invalidation remain Site x locale x generation scoped;
- authenticated route groups remain no-store or privately cached only under
  their own authorization contract; and
- adding a second audience is a new founder decision, not a data-entry setting.

### Option B-prime — Two bounded delivery classes on separate surfaces

Web Studio may target a public Site or one of a small set of authenticated
surfaces, such as Donor Portal or Missionary Workspace. Each target has separate
routes and never shares one audience-varying public URL. There are no arbitrary
segments or per-user rules.

**Benefits**

- gives communications staff one familiar authoring product for public and
  authenticated editorial copy;
- keeps public and private delivery routes physically separate; and
- could reduce duplicated rich-text tooling across apps.

**Costs**

- pulls Phase 25 and Phase 28 product decisions into Phase 23;
- requires target-specific permissions, release states, previews, link rules,
  localization, search treatment, cache policy, deletion, and support UX; and
- risks making one Page list contain content whose live destination and audience
  are not obvious.

**Risks**

- Payload or Web Studio could become an accidental authorization authority;
- a copied or retargeted entry could cross from authenticated to public scope;
- staff could mistake editorial publication for current account permission; and
- app teams would be coupled to Phase 23 schema and release cadence before their
  owning phases settle those contracts.

**Downstream consequences**

- D1 would need a distinct authenticated-release sibling or a deliberately
  broader release model;
- each app would require an audience-specific adapter and fail-closed request
  authorization on every read;
- private content must be excluded from public search, sitemap, canonical, social
  preview, CDN, and public cache paths by construction; and
- preview, audit, observability, migration, and incident response would need to
  distinguish every target surface.

### Option C-prime — Conditional regions on one public URL

Pages, blocks, Navigation items, or Dynamic Content Lists may declare a bounded
audience such as anonymous visitor, authenticated donor, missionary, campaign,
geography, or tenant segment. One URL assembles a different representation at
request time.

**Benefits**

- offers the broadest tenant-controlled experience design;
- can personalize calls to action and hide irrelevant content; and
- is closest to the most expansive interpretation of SiteStacker visibility
  parity.

**Costs**

- creates audience identity, membership, precedence, condition composition,
  preview simulation, analytics, cache variation, invalidation, revocation, and
  support products all at once;
- fragments canonical content and complicates search and social sharing;
- turns every renderer, data source, menu, reusable section, custom package, and
  cache into an authorization-sensitive surface; and
- sacrifices shared-cache efficiency or creates high-cardinality variants.

**Risks**

- critical cross-user or cross-tenant disclosure from an omitted cache dimension;
- stale access after membership or consent changes;
- private copy entering public HTML, React payloads, prefetches, search, metadata,
  analytics, CDN, or social scrapers even when CSS hides it;
- contradictory or empty Pages when conditions overlap or no branch matches;
- editor confusion about what each audience actually sees; and
- reliance on framework-private caching or provider roles as product
  authority.

**Downstream consequences**

- Phase 23 would need a versioned audience catalog, resolver, expression grammar,
  deterministic precedence, authorization proofs, bounded cache cardinality,
  audience simulator, crawler contract, and cross-surface safety tests;
- every D9 certified package would become audience-sensitive code;
- D14 and D17 would need true audience-specific source and index projections;
- public performance budgets and failure behavior would change materially; and
- incident containment would require audience-specific cache and index purge
  proof across all delivery layers.

## Founder selection and hardening result

The founder selected **Option A-prime**. The independent architecture,
security, cache, operations, and UX reviews confirm it as the sound Phase 23
boundary after the hardening below.

It is the most complete permanent boundary for Phase 23, not a temporary
workaround. A public Web Studio and authenticated account applications solve
different security and UX problems. Keeping them structurally separate lets
each one do its job well: Web Studio creates coherent, indexable, shareable,
fast public Sites; each authenticated app authorizes sensitive content against
the current user and organization on every request.

Option B-prime is architecturally plausible only after an owning authenticated
app demonstrates a real need for CMS-authored editorial content and defines the
whole delivery contract. It should not be smuggled into Phase 23 as a generic
target field. Option C-prime is a personalization platform, not a small
visibility feature. Launching it now would create disproportionate security,
cache, SEO, testing, and staff-comprehension debt.

The future-compatible seam is intentionally narrow: preserve `audience` as one
required, exact, code-owned value in public contracts and tests. Do not expose a
disabled selector, nullable column, broad enum, arbitrary expression, or
framework-specific cache primitive. A later evidence-backed decision can add a
separate qualified audience without migrating ambiguous launch data.

## Exact proposed formulation for ratification

> **A-prime-amended-and-hardened (A-prime-R) — one exact, code-owned `public`
> audience for every Phase 23 Web Studio public representation, with app-owned
> authenticated surfaces, auth-invariant public delivery, and quiet
> consequence-first UX.** `public` means accessible without authentication and
> identical for every visitor at the same trusted Tenant, environment, Site,
> locale, canonical resource/path, active D1 Site Plan generation, renderer and
> contract generation, and current source-qualified public state. A present or
> expired session, donor/missionary/staff role, account history, cookie,
> authorization header, query or campaign parameter, referrer, geography,
> experiment, analytics state, device, crawler, HTML/RSC/prefetch mode, or
> browser navigation history never changes the CMS-authored body, Primary or
> Footer Navigation, Dynamic Content List membership/order, public media,
> metadata, canonical, robots disposition, sitemap, social presentation, or D17
> search document/admission. Site and locale are exact scope, not audiences;
> D2 `Listed publicly` and `Shared by link — public` are reach/discovery
> dispositions inside the one public audience; D13 exact whole-Page publication
> appointments govern when that public representation is active; and current
> Phase 10/source safety may narrow or withdraw it. None becomes a request-time
> visibility condition.
>
> Web Studio stores and exposes no tenant-authored audience field, table,
> catalog, role list, conditional-region expression, visitor simulator,
> disabled future selector, or per-block/menu/list schedule. Its existing
> Page-first workspace shows the quiet read-only fact **Visibility: Public
> website** and **Anyone can view this page after it is released**. Draft and
> preview remain clearly not public. The publish or schedule consequence names
> the exact Site, locale, resolved path, immutable revision, and D2 reach: a
> Listed release says it can be viewed, shared, and may appear in search; a
> Shared-by-link release says anyone with the link can view and reshare it, while
> Asym omits it from public discovery and requests no indexing without promising
> external secrecy or erasure. Later drafts stay private until separately
> released. One durable **Released**, **Updating public site**, **Live**, or
> cause-owned **Needs attention** state remains after transient feedback. The
> same truth is available on mobile and to keyboard, screen-reader, touch,
> zoomed, forced-colors, reduced-motion, RTL, bidirectional, CJK, and long-label
> users; it is never confined to color, an icon, hover text, a toast, or a
> desktop inspector.
>
> Preview remains the exact-version, currently authorized, private editorial
> capability already bounded by Phase 22 D10 or its owning Phase 23 successor;
> it says **Preview — not public. This is what anyone will see after release**,
> is private, no-store and noindex, uses the public compiler/renderer without
> becoming a public cache variant, and never grants authority or proves release.
> Donor Portal, Missionary Workspace, and Mission Control own their private
> content, DTOs, routes, permissions, search, caching, failure handling, and
> authorization on every request. Public Sites use stable task-named actions
> such as **Donor portal** or **Missionary portal**; the destination app handles
> authentication and safe return routing. No protected content, identity,
> balance, assignment, entitlement, token, or account result enters public HTML,
> RSC/data, prefetch, media, metadata, search, sitemap, social, analytics, logs,
> errors, or shared caches. Phase 22 D11's independently authorized Supporter
> Ministry Update projection remains source- and app-owned; only its separately
> qualified public projection may enter D1 public output. D24 neither widens nor
> collapses those audiences.
>
> The server derives the public scope and exact `public` discriminant; no client
> may supply or widen either. Candidate closure and every public artifact pin the
> same D1 generation and reject missing, nullable, unknown, mixed, or unsupported
> audience/schema values while preserving the prior complete safe generation.
> Cache identity includes every trusted dimension that can change bytes—Tenant,
> environment, Site, locale, canonical resource/path, active generation,
> artifact/renderer/contract, and exact `public`—whereas cache tags are bounded
> invalidation handles only, never tenant or audience isolation. Public
> composition and every D9 certified package are structurally unable to import
> cookies, sessions, authorization, roles, CRM segments, geography,
> experimentation, personalization, or browser-supplied audience state.
> Authenticated apps deny by default and reauthorize each request; `private` or
> `no-store` delivery is defense in depth, not authorization.
>
> Auth failure never changes or takes down ordinary public content. Unknown
> public scope, incomplete closure, dependency skew, or incompatible audience
> blocks the candidate and retains the prior safe generation; Phase 10/source
> adversity suppresses positive public output first; private-app failure never
> falls back to a privileged or user-specific public variant. Privacy-safe
> observability distinguishes release authority, cache and public-runtime
> convergence, D17 search deletion/lag, suppression, resolver ambiguity, and
> output-invariance failure without recording content or user identity.
> Migration inventories every legacy condition: only independently proven
> public-safe records migrate to `public`; private, conditional, restricted,
> unknown, or unresolvable records are quarantined rather than defaulted public.
> Completion requires exact-pin Next.js/Payload/Vercel and D9 package
> conformance, hostile cross-tenant/cache tests, identical normalized public
> artifact hashes across anonymous and authenticated request classes, complete
> absence of protected data from every public byte surface, exact
> release/withdrawal/race/rollback proof, and representative mobile,
> accessibility, localization, and ministry-staff usability evidence. A second
> audience requires a new founder decision and a complete owner, route,
> authorization, release, preview, cache, search, migration, observability, and
> incident contract; Phase 23 creates no dormant personalization substrate.

## Supporting independent evidence

- [D24 cache and security primary-source research](./phase-23-d24-public-audience-cache-security-primary-source-research.md)
- [D24 independent 17-category adversarial review](./phase-23-d24-public-audience-independent-adversarial-review.md)
- [D24 staff and visitor UX benchmark](./phase-23-d24-public-audience-ux-benchmark.md)

## Post-selection adversarial summary

| Category                      | Material concern                                                                                                                                              | Severity / likelihood                 | Permanent prevention                                                                                                                                              |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                   | Yes. An undocumented assumption that all public output is identical could be broken by a later cookie check.                                                  | Critical / Medium                     | Encode exact `public` in the compiler, DTO, resolver, cache key, search key, and conformance tests; reject unknown values.                                        |
| Technical debt                | Yes. A nullable audience field or unused generalized condition schema would become misleading migration debt.                                                 | High / High                           | Store no speculative tenant-authored audience configuration; retain only the exact code-owned contract dimension.                                                 |
| Edge cases                    | Yes. Signed-in visitors, expired sessions, preview links, bots, prefetches, cached back/forward navigation, and logout can observe different request state.   | High / High under B or C; Low under A | Make CMS public output independent of auth state; keep account chrome and authenticated content in owned routes.                                                  |
| Footguns                      | Yes. A control labeled members only can be mistaken for security even if content leaks through source, cache, metadata, search, or prefetch.                  | Critical / High under C               | Do not offer the control. Authorization belongs to the authenticated application and is checked on every request.                                                 |
| Tenant safety                 | Yes. A missing Site, audience, or cache dimension can mix representations across tenants or visitors.                                                         | Critical / Medium                     | Derive Tenant, environment, Site, locale, generation, and exact `public` server-side; enforce composite scope and hostile cache-poison tests.                     |
| Overengineering               | Yes. B and especially C solve unproven portal and personalization needs with a broad platform.                                                                | High / High                           | Ratify A as the Phase 23 product boundary and require a new evidence-backed decision for another audience.                                                        |
| UX and staff friction         | Yes. Hidden conditional content makes preview and live-state explanations difficult; removing all context could also leave staff unsure.                      | High / High under C; Low under A      | Show one quiet Page-level visibility fact, exact D2 reach consequence, distinct **Preview — not public** and **View live page** actions, and no audience builder. |
| Hidden coupling               | Yes. Audience-aware Pages would couple CMS content to Auth roles, CRM segments, campaign systems, search, analytics, and caching.                             | High / High under C                   | Keep the public content port auth-independent and define future authenticated readers inside their owning apps.                                                   |
| Failure modes                 | Yes. Auth, segment, or cache failure could disclose private content, show an incoherent Page, or serve a stale favorable variant.                             | Critical / Medium under C             | Public routes fail only against public eligibility; authenticated routes fail closed and never fall back to public-cache variants containing private content.     |
| Data integrity                | Yes. Renamed roles, deleted segments, stale memberships, and missing default branches can orphan or broaden audience rules.                                   | High / Medium under C                 | Do not persist audience rules in Phase 23; future audiences require immutable identities, explicit lifecycle, and referential policy.                             |
| Security and privacy          | Yes. Presentation visibility is not authorization, and cache directives are not permission checks.                                                            | Critical / High under C               | Deny by default, authorize every authenticated request, never serialize restricted content into a public response, and separate routes and DTOs.                  |
| Scalability and performance   | Yes. Fine-grained audience keys multiply render and cache variants and weaken hit rates.                                                                      | High / High under C                   | Keep one public representation and measure future authenticated demand before accepting bounded private variation.                                                |
| Operational burden            | Yes. Staff and support would need audience simulation, stale-membership diagnosis, cache purges, and incident playbooks.                                      | High / High under C                   | Avoid audience conditionals; retain cause-owned public convergence and app-owned auth operations.                                                                 |
| Observability                 | Yes. A normal request metric cannot prove the correct audience saw the correct variant or that every cache purged.                                            | High / Medium under C                 | Observe exact public generation convergence now; require privacy-safe audience-specific proof before any later audience launches.                                 |
| Dependencies and integrations | Yes. Auth providers, CRM segments, Payload roles, Next cache behavior, CDNs, and crawlers evolve independently.                                               | High / Medium under C                 | Keep D24 provider-neutral; qualify each future integration behind one owned port and exact-version conformance suite.                                             |
| Migration and upgrade         | Yes. Persisted role strings or framework cache assumptions become hard to migrate without widening access.                                                    | High / Medium under C                 | Persist no launch audience rules; evolve the exact contract additively with explicit migrators and retained readers.                                              |
| Other development hazards     | Yes. Deploy skew, partial invalidation, race conditions during logout or role revocation, and custom-package bypasses can reintroduce favorable stale output. | Critical / Medium under C             | Add build-time contract checks and hostile end-to-end tests proving public output is auth-invariant and custom packages cannot read auth context.                 |

### Binding requirements fixed by the proposed formulation

1. Define one exact launch public audience and its plain-language editor
   meaning.
2. State that D13 whole-Page scheduling is the only Phase 23 time visibility
   mechanism and that it is not audience personalization.
3. Make the public CMS compiler, renderer, source adapters, Navigation, D17
   search, metadata, sitemap, social output, and cache identity auth-invariant.
4. Keep Donor Portal, Missionary Workspace, and Mission Control content under
   their own route and authorization owners.
5. Reserve no speculative tenant schema or UX for future audience rules.

### Must be proved during implementation after ratification

- add exact-`public` contract and cache-poisoning conformance fixtures;
- statically prevent public Page and certified D9 package code from reading
  cookies, sessions, roles, CRM segments, or browser-supplied audience values;
- verify identical CMS body, Navigation, metadata, search eligibility, social
  markup, and cache identity for anonymous, signed-in, expired-session, crawler,
  and prefetch requests;
- inherit the exact-version, currently authorized preview boundary, make its
  response private, no-store and noindex, and distinguish the private tool from
  the public audience without using preview as authorization proof; and
- give future app-owned editorial seams an explicit decision gate rather than a
  dormant launch field.

### Monitor without speculative machinery

- measured tenant demand for CMS-authored content inside an authenticated app;
- public campaign demand that cannot be met by ordinary Page variants, D13
  windows, links, or app-owned account actions;
- shared-cache hit rate and invalidation health; and
- framework and provider maturity, without treating a private-cache API or
  generic CMS role control as permission to change D24.

## Explicitly out of scope

- arbitrary role, permission, geography, campaign, donor-status, giving-history,
  consent, CRM-segment, experiment, recommendation, or per-user rules;
- tenant-authored condition expressions or Boolean builders;
- per-block, per-menu-item, or per-reusable-section schedules;
- browser-only hiding of private content;
- use of `Vary: Cookie`, session IDs, user IDs, or authorization tokens as a
  public CDN cache strategy;
- adoption of `use cache: private` as product or authorization architecture;
- Phase 25 Donor Portal authoring, Phase 28 Missionary Workspace authoring, or
  Phase 10 safety redesign; and
- any implementation, schema, migration, provider adoption, issue publication,
  deployment, release activation, or production change.

## Founder ratification

The founder ratified the exact **A-prime-R** formulation above as **Phase 23
D24** on 2026-08-23. Ratification records architecture only and authorizes no
implementation, schema, migration, dependency or provider adoption, issue
publication, deployment, D1 activation, release, or production change.
