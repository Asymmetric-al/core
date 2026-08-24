# Phase 23 D24 primary-source research — public audience, cache identity, and authenticated-surface security

**Status:** Supporting evidence for founder-ratified Phase 23 D24 A-prime-R;
not an independent authority expansion.

**Date:** 2026-08-23

## Research question

Can Phase 23 safely and durably define one exact anonymous public audience for
Web Studio while leaving donor-, missionary-, and staff-authenticated content
to the applications that own those identities and permissions?

**Finding:** Yes. A-prime is the smallest complete architecture and the best
launch UX, provided `public` is an enforced contract rather than an informal
assumption. Public Page content, Navigation, search, canonical metadata,
sitemaps, social metadata, HTML, and React payloads must be identical for every
visitor at the same exact Tenant, environment, Site, locale, path, and active
D1 generation. Authenticated surfaces must authorize every request and must
never reuse public caches or public projections for private content.

This is not merely a simpler editor setting. It is the boundary that makes
shared caching, indexing, sharing, and coherent public release compatible with
tenant and ministry safety. Adding role- or identity-conditioned content to the
same URL later would be a new delivery and authorization product, not an enum
addition.

## Method and exact-version posture

- Repository evidence was gathered from the isolated Phase 23 worktree at
  commit `8c53dc40a923` with `rg` and complete direct file reads. Nia was not
  available in this client, so the repository-required local-search fallback
  was used.
- The worktree's [`package.json`](../../../../package.json) and
  [`bun.lock`](../../../../bun.lock) both pin Next.js
  `16.3.0-preview.9` and Payload `4.0.0-internal.1f9ae9a`.
- The shared checkout's installed `node_modules` was Next.js `16.2.6`, so it
  was not treated as version authority for this worktree. Exact npm tarballs
  were fetched and inspected with `npm pack next@16.3.0-preview.9` and
  `npm pack payload@4.0.0-internal.1f9ae9a`.
- For Next, the exact bundled files inspected were
  `dist/docs/01-app/01-getting-started/08-caching.md`,
  `dist/docs/01-app/02-guides/cdn-caching.md`,
  `dist/docs/01-app/03-api-reference/01-directives/use-cache-private.md`, and
  `dist/server/lib/incremental-cache/index.js`.
- For Payload, the exact implementation inspected was
  `dist/collections/operations/local/find.js`; current official Payload
  documentation was used for the public contract.
- The Next pin is a preview and the Payload pin is an internal build. D24 must
  therefore remain framework-neutral. Before implementation, install the exact
  target-branch lockfile and reread that installed bundle and source. Do this
  again on every framework or CMS upgrade that changes the caching or Local API
  seam.
- External claims below use primary standards or official vendor/project
  documentation. No runtime code or decision record was changed in this
  research pass.

### Correction to the pending D24 decision brief

The exact `16.3.0-preview.9` bundled document does **not** mark
`use cache: private` as experimental. The pending decision brief should not
repeat that label. The correct conclusion is stronger and does not depend on
the label: in this exact pin, private-cache results are browser-memory-only,
are never stored on the server, do not survive reload, execute on every server
render, cannot use a custom cache handler, are excluded from static-shell
generation, and are unavailable in Route Handlers. Those semantics do not
authorize data and do not provide a shared authenticated-content delivery
contract. The enclosing Next release is still a preview, so the implementation
must verify the exact target pin rather than assume API stability.

## Primary-source findings

### 1. HTTP caching separates cache permission from authorization

[RFC 9111 section 3.5](https://www.rfc-editor.org/rfc/rfc9111.html#section-3.5)
prevents ordinary shared-cache reuse of a response to a request carrying
`Authorization` unless an explicit response directive permits it. The same RFC
defines the controls that matter here:

- [`Vary`](https://www.rfc-editor.org/rfc/rfc9111.html#section-4.1) makes the
  nominated request fields part of response selection. Omitting a real variant
  dimension can return one visitor's representation to another; varying on
  unbounded cookies or identities can create unbounded cache cardinality.
- [`private`](https://www.rfc-editor.org/rfc/rfc9111.html#section-5.2.2.7)
  prevents storage by shared caches but still permits private-cache storage. It
  controls storage location, not permission to see the response.
- [`no-store`](https://www.rfc-editor.org/rfc/rfc9111.html#section-5.2.2.5)
  directs private and shared caches not to store the request or response, but
  the standard explicitly warns that a cache directive alone is not a complete
  privacy control.
- [`public`](https://www.rfc-editor.org/rfc/rfc9111.html#section-5.2.2.9) and
  [`s-maxage`](https://www.rfc-editor.org/rfc/rfc9111.html#section-5.2.2.10)
  can permit shared reuse even when `Authorization` was present. They must
  never be applied accidentally to a donor-, missionary-, or staff-specific
  representation.

**D24 consequence:** public cacheability is safe only because the representation
is genuinely public and identity-invariant. An authenticated app must first
authorize the current request; a restrictive cache directive is defense in
depth, not the authorization decision.

### 2. Current Vercel guidance directly favors the A-prime split

Vercel's current
[Cache-Control guidance](https://vercel.com/docs/caching/cache-control-headers)
distinguishes same-for-all server-rendered content from personalized content.
It recommends shared freshness for the former, `private, max-age=0` for
responses that vary by cookies/session/authentication, and `no-store` when
sensitive content must not be cached. It also warns against `s-maxage` on
per-user responses unless the complete variation is represented.

**D24 consequence:** use a public cache policy only for the exact anonymous
projection. Authenticated Asym surfaces should default sensitive HTML, RSC,
JSON, downloads, and media responses to `Cache-Control: no-store`; a private
browser cache is an explicit, separately proved optimization only for content
whose sensitivity and revocation behavior allow it.

### 3. Exact Next.js behavior makes cache dimensions explicit, not automatic product policy

The exact Next `16.3.0-preview.9` bundled
[caching guide](https://nextjs.org/docs/app/getting-started/caching) says that
arguments and closed-over values become cache-key inputs. Request values such
as cookies and headers may be read outside a shared cached function and passed
as arguments, which creates a separate entry per distinct input. That mechanism
can implement variation, but it cannot decide whether the variation is safe,
bounded, understandable, or invalidated correctly.

The exact source for `IncrementalCache.generateCacheKey` includes request
headers in the patched-fetch data-cache key after excluding only distributed
trace headers. Therefore the current donor bridge's forwarded host header does
differentiate patched `fetch` entries under this exact pin. That is a useful
verified implementation fact, not a durable D24 architecture: it is internal
source in a preview release, and future D1 cache identity must remain visible in
Asym's own typed inputs and black-box conformance tests.

The exact bundled
[`use cache: private` guide](https://nextjs.org/docs/app/api-reference/directives/use-cache-private)
confirms that this lane is local browser-memory reuse rather than server or CDN
caching. It is neither a reason to mix authenticated variants into a public
route nor a substitute for current authorization.

The exact bundled
[CDN caching guide](https://nextjs.org/docs/app/guides/cdn-caching) additionally
documents that:

- static and ISR responses use shared `s-maxage`, while dynamic responses use
  restrictive private/no-store directives;
- `revalidateTag()` and `revalidatePath()` invalidate the Next server cache but
  do not by themselves purge a separate CDN copy;
- App Router HTML and RSC/prefetch variants need correct protocol keys and
  headers, including `_rsc` under the current scheme; and
- bots receive a complete request-time render rather than only a partial static
  shell, so crawler rendering must have access to every required public input.

**D24 consequence:** D1 release convergence must invalidate every applicable
Next and CDN representation, not merely call one cache API. Asym must test HTML,
RSC navigation/prefetch, metadata, and crawler paths. It should not build its
security contract around any one Next cache directive.

### 4. Payload access control is necessary but does not define audience or cache policy

Payload's current [Local API documentation](https://payloadcms.com/docs/local-api/overview)
states that Local API operations bypass access control by default. Its focused
[Local API access-control guide](https://payloadcms.com/docs/local-api/access-control)
requires `overrideAccess: false` when access rules must apply. The exact Payload
`4.0.0-internal.1f9ae9a` `find` implementation also defaults
`overrideAccess = true`.

Payload's [access-control documentation](https://payloadcms.com/docs/access-control/overview)
supports operation-, document-, role-, organization-, and locale-aware rules.
Its default collection policy merely checks for an authenticated request user;
Asym still needs explicit tenant, publication, Site, locale, safety, and release
constraints. Payload can also reflect access in the Admin UI, but hiding an
Admin control is not delivery authorization.

**D24 consequence:** keep the existing public choke point and explicit
`overrideAccess: false`. Do not infer an audience from a Payload role, field, or
Admin visibility setting. Authenticated apps remain their own authorization
owners even if a future app-owned CMS adapter supplies editorial content.

### 5. Security guidance requires early trusted tenant context and authorization on every private request

OWASP's
[Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
recommends explicit deny-by-default rules, authorization on every request, and
custom application logic where framework defaults do not express the business
policy. Its
[Multi-Tenant Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Multi_Tenant_Security_Cheat_Sheet.html)
requires tenant context early in request handling, rejects unvalidated
client-supplied tenant IDs, and includes the tenant in queries, cache keys, and
storage paths. It also recommends tenant-aware logging and negative isolation
tests.

OWASP's
[HTTP Headers Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html)
distinguishes `private` from `no-store` and warns against relying on default
caching for protected content.

**D24 consequence:** the public resolver derives Tenant, environment, Site,
locale, and active generation from trusted platform context. Authenticated apps
derive Tenant and permissions from the verified session and reauthorize each
request. Neither surface accepts a browser-supplied audience or tenant identity
as authority.

### 6. Search engines and social previews need one anonymous canonical representation

Google's current
[technical requirements](https://developers.google.com/search/docs/essentials/technical)
say indexable pages must be publicly accessible to Googlebot, return a working
status, and contain indexable content. Google's
[JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
continues to recommend server rendering or prerendering because it helps users
and crawlers and not every bot runs JavaScript. Google's
[testing guidance](https://developers.google.com/search/docs/crawling-indexing/website-testing)
also warns against showing crawlers a different representation from ordinary
users and notes that Googlebot generally does not support cookies.

Bing's
[robots metadata guidance](https://www.bing.com/webmasters/help/robots-meta-tags-and-attributes-that-bing-supports-5198d240)
likewise requires the crawler to fetch a page before it can observe `noindex`,
and its
[robots.txt guidance](https://www.bing.com/webmasters/help/how-to-create-a-robots-txt-file-cb7c31ec)
explains that uncrawled pages are not indexed.

The [Open Graph protocol](https://ogp.me/) defines the title, type, image, and
canonical URL metadata used to represent a public page in a social graph, with
description, locale, alternate locale, site name, and image alternative text
among its useful extensions. Social preview fetchers operate without a donor
or missionary app session and may retain their own cached preview.

**D24 consequence:** the public body, canonical URL, structured data, Open
Graph metadata, sitemap entry, and search document must all describe the same
anonymous D1 generation. Authenticated app pages are outside the public sitemap
and search projection, require authentication, and emit `noindex` as defense in
depth. A social crawler's cached card cannot be reliably recalled everywhere,
so the publish UX must truthfully explain that public content can be viewed,
indexed, and shared.

### 7. Mature CMS cache variation demonstrates why C-prime is a subsystem

Drupal's current
[cache-context documentation](https://www.drupal.org/docs/develop/drupal-apis/cache-api/cache-contexts)
models cookies, headers, language, route, session, user, roles, permissions,
URL, theme, timezone, and other inputs as explicit equivalents of HTTP `Vary`.
It also folds hierarchical contexts to avoid redundant variants and exposes
debugging information for the active cache contexts. Critically, Drupal's
anonymous page cache assumes anonymous pages are identical; varying anonymous
content requires giving up that cache path and accepting the performance cost.

**D24 consequence:** mature-CMS evidence does not support treating audience as
one harmless field. It supports A-prime at launch and shows what a future
audience-aware product would actually need: a catalog, resolver, variation
algebra, invalidation model, preview simulator, diagnostics, and performance
budget.

## Repository evidence and present bridge

The current code is a useful safety baseline, but it is not the complete D1
runtime.

| Evidence                                                                                                                                                                                                                  | What is already sound                                                                                                                                                                                                                       | D24-relevant gap or constraint                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`packages/api/src/cms/public/context.ts`](../../../../packages/api/src/cms/public/context.ts), `PublicRequestContext`                                                                                                    | Requires operational and CMS Tenant IDs, reserves Site, and represents unresolved requests as `site-not-found`.                                                                                                                             | It does not yet carry environment, locale, exact `public` audience, or D1 generation. D1 should add those through a typed successor rather than optional ad hoc parameters.                                                               |
| [`packages/api/src/cms/public/cache-tags.ts`](../../../../packages/api/src/cms/public/cache-tags.ts), `buildPublishedReadCacheTags`                                                                                       | Correctly states that tags invalidate only and never isolate cache entries. Tenant, collection, document, Site, and locale tag builders are bounded.                                                                                        | Site and locale are still reserved/null bridge seams. Audience and generation are not yet represented. Tags cannot repair an incomplete key.                                                                                              |
| [`apps/admin/src/cms/access/public-read.ts`](../../../../apps/admin/src/cms/access/public-read.ts), `publishedPublicReadAccess`                                                                                           | The public marker takes precedence over any authenticated user, so a signed-in donor receives the same published-only public view. Tenant and `_status: published` constraints fail closed.                                                 | Future public predicates must remain public-safety filters, not identity personalization. No cookie/session branch may bypass marker precedence.                                                                                          |
| [`apps/admin/src/cms/public/published-content-reader.ts`](../../../../apps/admin/src/cms/public/published-content-reader.ts), `createPayloadPublishedContentReader`                                                       | One Payload Local API choke point uses explicit tenant/published filters, `overrideAccess: false`, a public request marker, blank-Tenant fail-closed behavior, generic unavailable errors, and allowlist serialization.                     | The D1 successor must also bind Site, locale, active generation, exact audience, and current safety eligibility. Raw Payload documents must still never cross the boundary.                                                               |
| [`scripts/verify/cms-public-sole-entry.mjs`](../../../../scripts/verify/cms-public-sole-entry.mjs) and [`tests/unit/scripts/cms-public-sole-entry.test.ts`](../../../../tests/unit/scripts/cms-public-sole-entry.test.ts) | CI forbids raw Payload reads and `overrideAccess: true` across public routes outside the narrow construction allowlist.                                                                                                                     | Extend the public-path inventory when D1/custom-package entry points are added; otherwise a new surface could sit outside the lint's reach.                                                                                               |
| [`apps/donor/lib/cms/client.ts`](../../../../apps/donor/lib/cms/client.ts), `fetchPublicCmsJSON`, and [`packages/lib/cms/public-page.ts`](../../../../packages/lib/cms/public-page.ts), `buildPublicCmsReadCachePolicy`   | The bridge forwards the host, uses a shared public fetch cache with a bounded 60-second backstop, and tags by host and content descriptor. Exact Next source confirms the forwarded-host header participates in the current data-cache key. | The raw host is a bridge input, while the durable D1 identity should use canonical resolved IDs. The tag is not isolation. Add warm-cache A/B/A cross-Tenant tests and make the complete trusted key visible in an Asym-owned typed seam. |
| [`apps/admin/src/cms/public/resolve-tenant.ts`](../../../../apps/admin/src/cms/public/resolve-tenant.ts), `resolveTenantFromRequest`                                                                                      | Normalizes host, restricts query-string Tenant selection to dev/preview, and lets the published reader re-prove active Tenant state.                                                                                                        | Production must continue to trust only platform-normalized host context. Canonicalize aliases before caching and avoid unbounded negative-cache entries from arbitrary host strings.                                                      |
| [`apps/donor/next.config.ts`](../../../../apps/donor/next.config.ts) and [`apps/admin/next.config.ts`](../../../../apps/admin/next.config.ts)                                                                             | Both apps enable Cache Components; donor owns explicit public asset, sitemap, and robots cache headers.                                                                                                                                     | Framework caching is active across public and authenticated code, so route ownership and black-box header/payload tests are mandatory. Do not assume a route group name alone sets a safe policy.                                         |
| [`openspec/specs/platform-boundaries/spec.md`](../../../../openspec/specs/platform-boundaries/spec.md)                                                                                                                    | Makes CMS public presentation/publishing truth, keeps operational and permission truth in CRM, requires tenant-scoped published-only public APIs, rejects UI-only isolation, and separates public discovery from authenticated control.     | A-prime implements this merged product boundary. B-prime or C-prime would require an explicit owner-specific OpenSpec change rather than a local CMS field.                                                                               |

## Evidence-backed A-prime hardening contract

This is the permanent control set the final D24 formulation should preserve.
It records no new founder ruling by itself.

1. **One exact audience.** Every released Web Studio Page, Article,
   Navigation, reusable section, Dynamic Content List result, public search
   document, canonical/structured/social metadata record, sitemap entry, HTML
   response, RSC payload, prefetch, and public media projection has the exact
   code-owned audience discriminator `public`.
2. **No audience configuration debt.** `public` is non-null, never inferred,
   never client supplied, and never a tenant-editable field. Do not add a
   disabled selector, speculative enum values, role list, condition JSON,
   expression grammar, or dormant personalization table.
3. **Complete public identity.** The D1 compiler and public delivery port bind
   canonical resolved Tenant, environment, Site, exact locale, normalized path,
   `public`, active complete D1 generation, relevant source-contract and
   renderer/package generations, and any other proven representation input.
   Cache tags remain invalidation handles only.
4. **Identity invariance.** Public content membership and presentation never
   read or branch on login state, cookies, `Authorization`, donor status,
   missionary/team membership, staff role, giving history, campaign segment,
   geography, IP address, referral parameters, analytics identity, or private
   CRM facts. A signed-in visitor sees the same CMS-authored public
   representation.
5. **App-owned authentication.** Donor Portal, Missionary Workspace, and
   Mission Control own their routes, sessions, authorization, private DTOs,
   errors, audit, and cache rules. They re-prove current Tenant and permission
   on every request. CMS publication never grants app access.
6. **Restrictive authenticated caching.** Sensitive authenticated HTML, RSC,
   JSON, file, and media responses use `Cache-Control: no-store`, never public
   cache tags or `s-maxage`. Any later private-cache optimization needs an
   explicit data-classification, revocation, back-button, logout, and
   cross-user proof.
7. **Stable public account handoff.** Public shell actions such as **Donor
   portal** and **Missionary portal** have stable semantics and destinations.
   The destination app handles signed-in versus signed-out state; cookies do
   not change the public Page body or Navigation.
8. **Separate private preview.** Preview is an authenticated, capability-
   checked route with `no-store`, `noindex`, no public-cache tags, no public
   canonical, and a persistent **Preview — not public** banner. It is limited to
   currently authorized collaborators under the owning exact-version preview
   contract. Preview tokens and draft DTOs never enter public logs, analytics,
   prefetches, search, sitemap, or social metadata.
9. **Release-owned time.** D13 schedules an exact Page revision into or out of
   a complete D1 generation. Public renderers do not implement request-time
   `Date.now()` visibility branches or another condition language.
10. **Complete convergence.** Release invalidates the matching Next data/page
    caches and every configured CDN HTML/RSC variant, then reconciles search,
    sitemap, and social inputs. Ordinary updates may serve a still-safe prior
    complete generation within the declared freshness bound. Safety,
    publication, Tenant disablement, or route withdrawal converges adverse-
    first and may not reuse stale output unless current safety is independently
    re-proved.
11. **Provider-neutral enforcement.** Payload public reads keep explicit
    access enforcement and public DTO allowlisting, but Payload roles are not
    audience authority. Next and Vercel are delivery adapters, not security or
    release authorities.
12. **Future additions are additive products.** A second audience requires its
    own founder decision, owning app, URLs, authorization resolver, publication
    contract, preview, search/index policy, cache identity, invalidation,
    observability, migration, and conformance suite. Unknown audience values
    fail closed; they never silently map to `public`.

## UX/UI contract supported by the evidence

The best UI is explicit without adding a setting the user cannot meaningfully
change.

- Do not show an audience dropdown. In Page details, preview chrome, and the
  publish/schedule consequence summary, show the plain-language fact
  **Public website — anyone can view after release**.
- Keep **Save draft**, **Preview draft**, **Publish page**, **Schedule**, and
  **View live page** distinct. Draft and preview are not public and remain
  limited to currently authorized collaborators. Publish names the exact Site,
  locale, path, revision, and D2 reach; Listed pages may appear in public
  discovery and search, while Shared-by-link pages remain publicly viewable and
  reshareable but are omitted from Asym discovery and receive `noindex`.
- Leave a durable status after the action: **Released**, **Updating public
  site**, or **Live**. A toast is supplementary, never the only confirmation.
- Keep account actions task-named and app-owned. Do not imply that signing in
  changes public content. If staff need donor-only, missionary-only, or
  staff-only content, direct them to the owning authenticated workspace in
  calm product language.
- On save, preview, release, or convergence failure, say what stayed safe:
  **Your draft is safe; the public site was not changed** or **The previous
  public version is still live**. Offer one cause-owned recovery action; never
  tell staff to clear a cache, force publication, or change an audience.
- Preserve the full consequential fact on mobile and for assistive technology.
  The UX benchmark's keyboard, focus, screen-reader, 320-pixel reflow, 400%
  zoom, touch-target, forced-color, reduced-motion, RTL, bidi, CJK, and
  long-label proof remains required.

See the companion
[D24 public-audience UX benchmark](./phase-23-d24-public-audience-ux-benchmark.md)
for the complete staff workflow and failure-state specification.

## Ruthless adversarial review of the selected direction

| Category                         | Material concern?                                                      | What could go wrong and why it matters                                                                                                                                                                                            | Severity / likelihood               | Evidence or reasoning                                                                                                         | Permanent prevention                                                                                                                                                                         |
| -------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                      | **Yes**                                                                | A developer could treat identical public output as convention, then add one cookie or role branch without updating every cache/search/metadata path.                                                                              | Critical / Medium                   | Next keys only inputs it is actually given; the current bridge is still incomplete D1 machinery.                              | Encode exact `public` throughout compiler, DTO, resolver, cache identity, index, metadata, and conformance tests; reject every unknown value.                                                |
| Technical debt                   | **Yes**                                                                | A nullable audience column, dormant enum, disabled selector, or generalized condition schema would look reusable while accumulating ambiguous data and migrations.                                                                | High / High                         | No launch consumer requires another value; mature variation systems require substantially more than a field.                  | Store no tenant audience configuration. Keep one code-owned discriminant and require a new complete decision for any addition.                                                               |
| Edge cases                       | **Yes**                                                                | Signed-in users on public URLs, expired sessions, preview links, unknown hosts, inactive Tenants, locale changes, alias domains, safety suppression, and crawler requests can take paths different from an anonymous direct load. | Critical / High without tests       | The repo already gives the public marker precedence and fails blank Tenant closed; Next renders crawler requests differently. | Define all cases explicitly and exercise direct, RSC navigation, prefetch, bot, warm-cache, preview, and adverse-change paths.                                                               |
| Footguns                         | **Yes**                                                                | `overrideAccess: true`, `s-maxage` on authenticated output, a public cache tag on private data, CSS-only hiding, or one raw `cookies()` call could disclose content.                                                              | Critical / Medium                   | Payload Local API bypasses access by default; RFC 9111 can allow shared reuse when explicitly enabled.                        | Retain the sole-entry lint, add public-renderer forbidden-input checks, centralize response policies, and negative-test private-data absence from every public artifact.                     |
| Tenant safety                    | **Yes**                                                                | An omitted Tenant/Site/locale/generation key or trusted-host failure could return another ministry's public Page.                                                                                                                 | Critical / Medium                   | OWASP requires tenant-aware keys; repo tags explicitly do not isolate.                                                        | Resolve canonical scope before caching; key by stable IDs; A/B/A warm-cache tests across Tenant, environment, Site, locale, and generation; unknown scope serves nothing.                    |
| Overengineering                  | **Yes, if the boundary is weakened**                                   | Building role catalogs, segment rules, preview simulation, or per-user cache variants now would solve no ratified Phase 23 need and enlarge security/operations scope.                                                            | High / High                         | Drupal's cache-context machinery shows the real subsystem required; C-prime is not a small CMS feature.                       | Ratify only one public audience and no future-facing UI/schema beyond the exact required discriminant.                                                                                       |
| UX/UI and user friction          | **Yes**                                                                | Staff could mistake Save/Preview for public release, publish sensitive ministry details, look for a nonexistent donor-only setting, or assume login changes the Page.                                                             | Critical / Medium                   | Public content can be indexed and socially cached; those consequences cannot be reliably reversed everywhere.                 | Quiet persistent visibility fact, explicit preview/live distinction, consequence-confirmed Publish, task-named portal links, durable outcomes, and tested accessible recovery.               |
| Hidden coupling                  | **Yes**                                                                | Public Web Studio schema could become the implicit permission source for Donor Portal or Missionary Workspace, or a framework cache directive could become the security contract.                                                 | High / Medium                       | Merged OpenSpec assigns operational/permission truth to CRM and public presentation to CMS.                                   | Keep app-owned adapters and authorization ports; make D1 audience/cache contracts provider-neutral; prohibit Payload role or Next primitive from defining product authority.                 |
| Failure modes                    | **Yes**                                                                | A publish can succeed while Next, CDN, search, sitemap, or social inputs stay stale; a failed purge can retain withdrawn content; a private app failure can swallow the public Page.                                              | Critical / Medium                   | Exact Next docs separate server invalidation from CDN purge; third-party crawlers have independent caches.                    | Durable release/convergence states, layer-specific receipts and reconciliation, adverse-first purge, prior-safe-generation fallback only, and containment of app errors to app destinations. |
| Data integrity                   | **Yes**                                                                | Cache, search, metadata, sitemap, and body could point at different generations or locale variants.                                                                                                                               | High / Medium                       | D1 is the coherence authority; each derived layer otherwise updates independently.                                            | Bind derived records to exact D1 generation and locale, use idempotent release events, reject mixed generations, and reconcile from source rather than patching rows manually.               |
| Security and privacy             | **Yes**                                                                | Private names, giving history, assignments, draft content, or restricted ministry details could appear in HTML, RSC, prefetch, metadata, search, logs, or cached files.                                                           | Critical / Medium                   | OWASP requires authorization every request; hiding or cache directives do not authorize.                                      | Separate routes and DTOs, request-time authorization, `no-store`, no public tags, noindex, output allowlists, telemetry scrubbing, and artifact-level negative tests.                        |
| Scalability and performance      | **No material concern under hardened A-prime; material under C-prime** | One constant audience adds no cache cardinality. The concern returns if cookies/users/roles become key dimensions or arbitrary hosts create variants.                                                                             | Low under A-prime / High if drifted | Vercel optimizes same-for-all SSR; Drupal documents the cost of user/context variation.                                       | Key public output only by bounded canonical scope/generation, bound aliases and negative caching, and monitor hit ratio, cardinality, latency, and purge volume.                             |
| Operational burden               | **No material concern under hardened A-prime**                         | Ordinary operation needs one public release and app-owned private operations. Burden appears only if teams must diagnose audience simulations or per-user purges.                                                                 | Low / Low                           | The boundary removes rather than adds an audience admin product.                                                              | One runbook for public convergence, separate app runbooks for authorization, and no manual cache-clearing workflow.                                                                          |
| Observability gaps               | **Yes**                                                                | Operators could know that a release event ran but not whether a wrong Tenant/generation was served or a purge/index update failed.                                                                                                | High / Medium                       | Server, CDN, search, sitemap, and crawler layers converge separately.                                                         | Record privacy-safe Tenant/Site/locale/audience/generation, cache layer, release receipt, freshness, and cause-owned error; alert on adverse-convergence bounds and cross-scope attempts.    |
| Dependency and integration risks | **Yes**                                                                | Preview Next/Payload semantics, Vercel cache behavior, social crawlers, and search engines can change independently.                                                                                                              | High / Medium                       | The target pins are preview/internal; current Next CDN docs describe an evolving key scheme.                                  | Framework-neutral ports, exact lockfile verification, deployed black-box tests, vendor-version evidence at upgrades, and no reliance on undocumented internals as sole proof.                |
| Migration and upgrade risks      | **Yes**                                                                | Adding audience columns now or relying on current internal cache keys would make future audience additions and version upgrades ambiguous or unsafe.                                                                              | High / Medium                       | Exact source currently includes headers, but that is not a stable Asym contract.                                              | Keep launch data unambiguous, version public projection contracts, make successors explicit, and require a migration/conformance plan for any second audience or provider upgrade.           |
| Other development hazards        | **Yes**                                                                | Concurrent release/purge jobs, retries, lost responses, stale preview tokens, custom package code, or partial deploys can create mixed or repeated effects.                                                                       | High / Medium                       | D1 and certified packages span multiple asynchronous derived surfaces.                                                        | Expected-head/idempotency fences, complete-generation activation, resumable reconciliation, rollback to a known safe generation, package conformance, and fault-injection tests.             |

## Required verification before shipping D24 behavior

### Contract and unit proof

1. Compile every public Page family and semantic leaf with exact `public`; reject
   missing, null, client-supplied, and unknown audience values.
2. Prove authenticated cookies, `Authorization`, roles, memberships, referral
   parameters, and geography never enter public projection membership or
   presentation.
3. Prove Payload public reads use the sole reader, explicit tenant/published
   constraints, `overrideAccess: false`, and public DTO serializers.
4. Prove D13 scheduling changes the selected exact revision/generation rather
   than adding a request-time visibility branch.
5. Prove custom D9 packages cannot read authenticated request context or emit
   non-public DTO fields through the public renderer.

### Warm-cache and tenant-isolation proof

1. Alternate identical paths `Tenant A -> Tenant B -> Tenant A` through a warm
   data/page/CDN cache and verify the correct Site, locale, metadata, media, and
   generation each time.
2. Repeat across production/preview environments, Sites, locale variants,
   alias domains, active generations, HTML, RSC navigation, and prefetch.
3. Verify unknown, malformed, inactive, and wrong-environment host context
   serves no tenant content and does not create an unbounded cache namespace.
4. Verify invalidation tags cannot retrieve or authorize anything and that a
   deliberately wrong/missing key dimension fails the test.

### Public-versus-authenticated proof

1. Fetch a public URL anonymously and with valid/expired donor, missionary, and
   staff cookies. The CMS-authored body, Navigation, canonical, structured data,
   Open Graph data, search document, and sitemap identity must be semantically
   identical.
2. Inspect HTML source, RSC payloads, route prefetches, serialized state,
   response headers, analytics attributes, logs, and error telemetry for
   private facts and preview credentials.
3. Verify every authenticated response reauthorizes the current request and
   emits `no-store` for sensitive content, never `s-maxage`, public cache tags,
   public canonicals, or public search/sitemap membership.
4. Verify logout, back/forward navigation, session expiry, permission revocation,
   and cross-account switching do not reveal another user's cached content.

### Release and failure proof

1. Publish an exact revision, lose the client response, retry, and prove one
   idempotent release outcome.
2. Delay or fail Next invalidation, CDN purge, search update, and sitemap update
   independently. The UI must report the correct durable convergence state and
   the prior complete safe generation must remain coherent.
3. Withdraw publication, disable the Tenant, remove a route, or trigger a Phase
   10 safety suppression while caches are warm. Prove adverse-first removal
   across HTML, RSC, media, search, sitemap, and social-input generation.
4. Verify a public CMS or account-app outage is contained: the public Page
   remains on a safe complete generation or truthful unavailable state, while
   an account-destination failure does not transform the public Page into an
   auth error.

### SEO, social, accessibility, and usability proof

1. Fetch as ordinary anonymous user, Googlebot-like crawler, Bingbot-like
   crawler, and non-JavaScript social fetcher. Verify a working status and one
   coherent public body/canonical/metadata result.
2. Verify draft, preview, Donor Portal, Missionary Workspace, and Mission
   Control URLs are absent from public search/sitemap/social projections and
   require authentication; `noindex` is defense in depth, not access control.
3. Run the companion UX benchmark tasks with representative nonprofit
   communications staff, occasional ministry editors, mobile/touch users, and
   assistive-technology users. Participants must correctly distinguish draft,
   preview, released, updating, and live and correctly answer who can view a
   released Page.

### Version and deployed-runtime proof

1. Install the exact target branch with the frozen lockfile; confirm the
   installed Next and Payload versions match the declarations.
2. Reread the matching bundled Next docs/source and Payload Local API source;
   update this evidence if semantics changed.
3. Run deployed black-box checks against the actual Vercel/CDN topology,
   inspecting response cache directives and observing cache hit, revalidation,
   and purge behavior. A local unit test is not proof of edge behavior.

## Ruthless synthesis and order of work

### Must be fixed in the D24 contract now

1. Ratify one exact code-owned `public` audience and explicitly ban
   login-/role-/segment-conditioned public rendering.
2. Bind `public` to the complete D1 projection, cache, search, metadata,
   sitemap, social, preview, and conformance contracts without introducing a
   tenant setting or speculative schema.
3. Preserve the app-owned authenticated boundary with request-time
   authorization and restrictive caching.
4. Specify the truthful low-noise editor UX and the separate private preview
   contract.
5. Make full-layer invalidation, adverse-first convergence, and negative
   cross-Tenant/private-artifact proof release blockers.

### Should be implemented with the D1/runtime slice

1. Replace bridge-only raw-host identity with the canonical typed
   Tenant/environment/Site/locale/audience/generation delivery key while
   retaining host aliases only as resolver inputs.
2. Extend the sole-entry/static-analysis inventory to every D1 route and
   certified-package public entry point.
3. Add the warm-cache, auth-cookie invariance, crawler, preview, revocation,
   purge, and fault-injection matrix above.
4. Add privacy-safe release/cache/search convergence telemetry and one
   cause-owned operational recovery path.

### Monitor without prebuilding

1. Real tenant demand for CMS-authored content inside an authenticated app.
2. Public cache hit ratio, key cardinality, invalidation/purge volume, and
   adverse-convergence latency.
3. Next/Payload/Vercel version changes and search/social crawler behavior.

Monitoring demand does not authorize a dormant audience framework. If a real
authenticated editorial need emerges, reopen the decision with its owning app
and complete delivery contract.

## Bottom line

A-prime is architecturally sound, current, scalable, and unusually clear for
nonprofit ministry staff. Its safety depends on making **public for everyone**
an exact invariant across every public artifact—not on hiding a control, trusting
a cache tag, relying on a Payload role, or selecting a Next directive. With the
controls and tests above, Asym gets fast indexable and shareable tenant Sites,
clear authoring consequences, and structurally separate authenticated ministry
work without a personalization engine or future migration trap.
