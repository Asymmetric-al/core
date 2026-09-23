# Phase 23 D25 primary-source research — Payload Preview, Live Preview, and exact private rendering

**Status:** Supporting evidence for founder-ratified Phase 23 D25 C-prime-R;
not an implementation, provider-adoption, schema, release, or independent
decision authority.

**Date:** 2026-08-23

## Research question

What do the exact Payload and Next.js versions pinned by Core actually provide
for Preview and Live Preview, and which product, security, freshness, and
operational boundaries must D25 preserve?

## Executive finding

Payload provides useful **mechanisms**, but it does not by itself define the
exact Asym preview contract:

- `admin.preview` is a configurable link generator. It can enter a framework's
  draft mode, but the application still owns authentication, authorization,
  exact target selection, rendering, and privacy.
- Payload server-side Live Preview refreshes after a document save, draft save,
  autosave, or publish. It renders the latest saved draft through a server
  round trip. It does not render every unsaved keystroke and it does not pin an
  immutable version.
- Payload client-side Live Preview sends debounced, unsaved Admin form state to
  an iframe or popup with `window.postMessage`, then optionally calls Payload to
  populate relationships and uploads. It feels immediate, but the result is
  provisional form state rather than an exact saved revision or release proof.
- Payload `draft: true` returns the latest version from the versions table.
  That is fresh, but it is a moving target. Payload's separate
  `findVersionByID` API is the relevant provider seam for an immutable version.
- Next.js Draft Mode bypasses framework caches and emits a restrictive response
  cache policy. Its cookie is a cache-bypass mechanism, not authorization, a
  Tenant boundary, or an exact revision selector.

The permanent architectural conclusion is therefore narrow: **freshness,
exactness, and visual immediacy are three different claims**. D25 must name
them separately. An exact saved-revision preview can be authoritative for what
that revision would render. A client live canvas can be a clearly provisional
editing aid. Neither may silently become the other, and neither may authorize
release.

For the current Core pins, Preview and Live Preview are available through
open-source MIT packages. Payload's separately marketed **Visual Editor** is an
enterprise-facing, “Coming Soon” product and is not required for a D25 preview
contract. D25 should not promise click-to-edit visual authoring merely because
Payload Live Preview can display an iframe.

## Method and exact-version authority

- Repository evidence was gathered in the isolated Phase 23 worktree at commit
  `8c53dc40a923` with `rg` and complete direct file reads. Nia was unavailable
  in this client, so the repository-required local-search fallback was used.
- Core's [`package.json`](../../../../package.json),
  [`apps/admin/package.json`](../../../../apps/admin/package.json), and
  [`bun.lock`](../../../../bun.lock) pin:
  - Next.js `16.3.0-preview.9`;
  - `payload`, `@payloadcms/next`, and `@payloadcms/ui`
    `4.0.0-internal.1f9ae9a`.
- The worktree did not have an installed `node_modules`. The shared checkout's
  different installation was not treated as version authority. Exact npm
  tarballs were fetched and inspected instead:
  - [`next@16.3.0-preview.9`](https://registry.npmjs.org/next/-/next-16.3.0-preview.9.tgz);
  - [`payload@4.0.0-internal.1f9ae9a`](https://registry.npmjs.org/payload/-/payload-4.0.0-internal.1f9ae9a.tgz);
  - [`@payloadcms/next@4.0.0-internal.1f9ae9a`](https://registry.npmjs.org/@payloadcms/next/-/next-4.0.0-internal.1f9ae9a.tgz);
  - [`@payloadcms/ui@4.0.0-internal.1f9ae9a`](https://registry.npmjs.org/@payloadcms/ui/-/ui-4.0.0-internal.1f9ae9a.tgz);
  - [`@payloadcms/live-preview@4.0.0-internal.1f9ae9a`](https://registry.npmjs.org/@payloadcms/live-preview/-/live-preview-4.0.0-internal.1f9ae9a.tgz);
  - [`@payloadcms/live-preview-react@4.0.0-internal.1f9ae9a`](https://registry.npmjs.org/@payloadcms/live-preview-react/-/live-preview-react-4.0.0-internal.1f9ae9a.tgz).
- The internal Payload suffix maps to official Payload commit
  [`1f9ae9a`](https://github.com/payloadcms/payload/commit/1f9ae9a).
- Core does **not** currently declare or lock `@payloadcms/live-preview` or
  `@payloadcms/live-preview-react`. Their exact tarballs were inspected only to
  understand the optional provider seam. Adding either would be a later
  dependency decision, not an implied part of D25.
- The checked-in `vendor/payload-upstream` snapshot identifies itself as
  Payload `3.77.0`, so it was not used as evidence for the exact internal v4
  pin.
- Current official Payload documentation was compared with exact package
  source. Where current web documentation and the internal package differ, the
  exact package source is recorded explicitly rather than silently assuming
  the website describes the pin.
- The exact bundled Next documents inspected were
  `dist/docs/01-app/02-guides/draft-mode.md` and
  `dist/docs/01-app/03-api-reference/04-functions/draft-mode.md` from the npm
  tarball above, satisfying Core's installed-version documentation rule.

Both framework lines are prerelease lines: one is a Next preview and one is a
Payload internal build. Every implementation or upgrade must repeat this
exact-pin inspection and run black-box conformance tests. Current web
documentation is useful evidence, but it is not a substitute for the package
actually deployed.

## Terms D25 must keep distinct

| Term                             | Exact source                                                  | Freshness                                           | Stable on reload?                                              | Canonical meaning                                                              |
| -------------------------------- | ------------------------------------------------------------- | --------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **View live page**               | D1 serving head and its released Site generation              | Current released generation after convergence       | Yes, until a later generation activates                        | What anonymous public visitors currently receive                               |
| **Exact saved-revision preview** | Immutable Payload version id plus exact D1 dependency closure | Frozen at the selected server-acknowledged revision | Yes                                                            | What that exact private revision would render under the named candidate inputs |
| **Latest saved draft preview**   | `findByID({ draft: true })`                                   | Latest version at request time                      | No; a later autosave can change it                             | Useful current-draft view, not exact review/schedule evidence                  |
| **Server-side Live Preview**     | Latest saved draft after save/autosave/publish event          | Near-live at save cadence and server latency        | No                                                             | Continuously refreshed saved-draft aid                                         |
| **Client-side Live Preview**     | Unsaved Admin form state merged into initial data             | Near-immediate after form change                    | No; browser/form state can disappear                           | Provisional editing aid, not a saved or validated revision                     |
| **Next Draft Mode**              | Browser cookie that bypasses Next caches                      | Causes request-time reads                           | Cookie lasts for the browser session and changes across builds | Delivery mechanism only; not content identity or authority                     |

This vocabulary prevents three common and material errors:

1. **Fresh does not mean exact.** `draft: true` can be the newest state and
   still be wrong for a reviewer who opened revision 42.
2. **Unsaved does not mean acknowledged.** A client canvas can show text that
   the server later rejects or that is lost during conflict, expiry, or upload
   failure.
3. **Preview does not mean public.** Seeing a faithful candidate does not move
   D1's serving head, prove downstream convergence, or authorize release.

## What Payload officially supports

### 1. Preview is a URL seam, not a rendering authority

Payload's current [Preview documentation](https://payloadcms.com/docs/admin/preview)
defines `admin.preview` as a function that returns an absolute or relative URL
for the Admin's Preview control. The function receives the current document
form data, including unsaved changes, the current locale, the Payload request,
and the authenticated user's JWT token.

Payload also documents a Next.js Draft Preview pattern in which the Preview URL
first reaches an application endpoint that:

1. verifies a secret;
2. validates a relative path;
3. authenticates the Payload user;
4. enables Next Draft Mode; and
5. redirects to the front-end route, which queries with `draft: true`.

The documentation explicitly leaves a seam for additional per-document
authorization. That seam is mandatory in Asym. A valid user, a Payload JWT, a
Draft Mode cookie, a path, or a document id cannot by itself authorize the
Tenant, Site, locale, Page, version, candidate, media, or renderer inputs.

The documentation's static `previewSecret` query-string example is an
integration illustration, not an acceptable durable Asym credential design.
Query secrets are likely to enter browser history, reverse-proxy logs,
observability, copied URLs, screenshots, and referrers. Because D24 already
requires authenticated private preview, Asym can use the existing verified
principal and a short-lived, server-side, scope-bound grant or same-origin
exchange. Any opaque URL value should locate a target, never grant authority by
possession. The canonical redirect must strip transient credentials and derive
the destination server-side to avoid open redirects.

### 2. `draft: true` is latest, not immutable

Payload's current [Drafts documentation](https://payloadcms.com/docs/versions/drafts)
states that `find` or `findByID` with `draft: true` returns the most recent
version from the versions table, whether that version is draft or published.
This explains the exact behavior of Core's current bridge and proves that a URL
containing only a collection and document id is a moving target.

Payload's [Versions documentation](https://payloadcms.com/docs/versions/overview)
and the exact v4 package expose `findVersionByID`. The exact local API type:

- requires a collection and version id;
- supports locale and `fallbackLocale: false`;
- supports selection and bounded relationship population;
- defaults `overrideAccess` to `true`, so user-bound reads must explicitly set
  `overrideAccess: false`, pass the current user/request, and enforce Asym's
  full scope outside provider defaults; and
- excludes trashed documents unless the caller explicitly asks for trash.

An immutable Payload version id is necessary for exactness, but not sufficient
for D25 parity. The D1 candidate must also bind the exact Site, locale, path,
placement, Navigation, presentation package/profile, compiler, rich-text
profile, dynamic-source catalog, and other semantic dependencies needed to
render that Page. Re-fetching any mutable `latest` dependency can make an
otherwise exact Page version produce a different result.

### 3. Payload Live Preview has two materially different modes

Payload's [Live Preview overview](https://payloadcms.com/docs/live-preview/overview)
configures an iframe or popup using `admin.livePreview.url`. The URL can be a
function of current unsaved data, locale, collection/global config, and
request. This is useful for multisite and localization, but Asym must derive the
final URL from trusted Tenant/Site/domain configuration rather than accepting a
free-form document origin.

Payload provides responsive, named, and custom iframe dimensions plus a popup.
These are viewport-size aids, not device emulators. They do not prove a real
browser, hardware, network, touch input, safe areas, accessibility technology,
or production performance.

#### Server-side Live Preview

Payload's focused
[server-side Live Preview documentation](https://payloadcms.com/docs/live-preview/server)
says the Admin emits a document event after save, draft save, autosave, or
publish. `RefreshRouteOnSave` listens for that event and invokes a Next
`router.refresh()`, after which the server example reads `draft: true`.

Properties:

- preserves a server-rendered React/Next architecture;
- applies normal server-side validation and renderer behavior to the latest
  saved draft;
- is bounded by save/autosave cadence, network latency, server work, and route
  refresh latency;
- cannot display a keystroke that has not produced an acknowledged save; and
- remains a moving `latest` view unless Asym carries an exact version receipt
  into the refreshed request.

The Payload troubleshooting guide suggests an autosave interval of 375 ms to
make this mode feel more responsive. Core must **not** copy that number as a
default. It would turn visual feedback into continuous database/version writes,
increase conflict and cost, and undermine D12's deliberately bounded autosave
contract. D25 should consume D12 save receipts; it should not redefine save
frequency to imitate client-side responsiveness.

#### Client-side Live Preview

Payload's focused
[client-side Live Preview documentation](https://payloadcms.com/docs/live-preview/client)
says the Admin sends a message every time the document form changes. The React
`useLivePreview` helper merges that incoming form state with initial data.
Relationships and uploads can require a browser request back to Payload using a
matching `depth`; current troubleshooting warns that a mismatched depth can
make populated values disappear after editing.

Properties:

- provides the most immediate visual response;
- can display unsaved, incomplete, invalid, conflicting, or subsequently lost
  form state;
- requires a client-renderable projection and may duplicate or diverge from a
  server-only public renderer unless the projection/renderer boundary is
  deliberately shared;
- can send a broad reduced form document across origins;
- can create credentialed browser calls to the Payload API for relationship
  population; and
- adds CORS, CSRF, cookie, third-party-cookie, relationship-depth, cancellation,
  ordering, and stale-response concerns when Admin and preview use different
  origins.

For ministry content, “reduced form values” is not automatically equivalent to
“safe public projection.” A form can contain internal notes, private source
relations, operational identifiers, hidden fields, unqualified media, or future
fields that the public renderer must never receive. A D25 client-live lane must
send a typed, allowlisted public-preview projection rather than forwarding the
provider document wholesale.

## Exact Payload v4 package findings

The exact `4.0.0-internal.1f9ae9a` packages provide facts that current web docs
alone do not establish:

1. `@payloadcms/live-preview` and `@payloadcms/live-preview-react` declare MIT
   licenses in their exact package manifests.
2. `isLivePreviewEvent` and `isDocumentEvent` accept messages only when
   `event.origin === serverURL` and the event data is an object with the
   expected type.
3. `ready()` sends its message to `window.opener` or `window.parent` with
   `serverURL` as `targetOrigin`; it does not use `*`.
4. The Admin Live Preview window sends full reduced form values, collection or
   global slug, locale, and externally updated relationship information to the
   iframe/popup. It separately sends a document event for server refresh.
5. The relationship merge helper sends a credentialed POST to the Payload API,
   carries unsaved incoming data in the request body, and uses
   `X-Payload-HTTP-Method-Override: GET`.
6. The exact React package exports `RefreshRouteOnSave`, matching the focused
   server guide. The current overview contains one sentence naming
   `RefreshRouteOnChange`; that prose should not override the exact export.
7. The Admin provider's ready-message gate uses
   `url?.startsWith(event.origin)` rather than an exact parsed-origin equality
   check. Once it accepts readiness, the Admin begins posting form data to the
   configured target.

The seventh finding is a qualification concern, not a claim that Payload is
generally exploitable. A static, server-owned exact URL considerably narrows
the risk. It becomes material if a multitenant URL can be influenced by document
data, a tenant-supplied domain, redirects, or a prefix-confusable hostname.
Asym should parse and normalize the configured URL, require its exact origin to
equal a server-owned allowlist entry, reject credentials/non-HTTPS production
URLs/unexpected ports, and test redirects and domain reassignment. If Asym uses
the provider helper directly, its adapter should additionally verify the
expected `event.source` and validate a typed message envelope. Do not use prefix
matching as the Asym security boundary.

Relevant exact official source at commit `1f9ae9a`:

- [Live Preview provider](https://github.com/payloadcms/payload/blob/1f9ae9a/packages/ui/src/providers/LivePreview/index.tsx)
- [Admin Live Preview window](https://github.com/payloadcms/payload/blob/1f9ae9a/packages/ui/src/elements/LivePreview/Window/index.tsx)
- [`isLivePreviewEvent`](https://github.com/payloadcms/payload/blob/1f9ae9a/packages/live-preview/src/isLivePreviewEvent.ts)
- [`isDocumentEvent`](https://github.com/payloadcms/payload/blob/1f9ae9a/packages/live-preview/src/isDocumentEvent.ts)
- [`mergeData`](https://github.com/payloadcms/payload/blob/1f9ae9a/packages/live-preview/src/mergeData.ts)
- [`RefreshRouteOnSave`](https://github.com/payloadcms/payload/blob/1f9ae9a/packages/live-preview-react/src/RefreshRouteOnSave.tsx)

## Exact Next.js Draft Mode findings

The exact `16.3.0-preview.9` bundled guide says that, for a request in Draft
Mode:

- `fetch()` skips the Next fetch cache;
- functions and components under `'use cache'` re-execute and their results are
  not stored;
- `unstable_cache` reads and writes are bypassed;
- the page is excluded from the ISR response cache; and
- the response is served with
  `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`.

`draftMode()` is asynchronous. Calling `enable()` sets the
`__prerender_bypass` cookie; calling `disable()` deletes it. The cookie value is
regenerated on every build and the default session ends when the browser
closes. Local HTTP testing may require third-party-cookie and local-storage
permission.

The exact guide also provides important security and UX details:

- its first route example is explicitly unsafe until a secret and target are
  validated;
- the redirect should use the canonical path obtained from the validated
  content record, not an untrusted query path, to avoid an open redirect;
- enabling Draft Mode through `GET` is an integration concession because a CMS
  opens a URL, while exit is better represented as `POST`; and
- a GET exit must not be triggered through a prefetched Next `<Link>`, because
  prefetch can disable Draft Mode before the editor clicks.

### What Draft Mode does not do

Draft Mode cannot answer any of these questions:

- Which Tenant, environment, Site, domain, Page, locale, revision, candidate,
  presentation package, or capability is authorized?
- Which exact version should Payload return?
- May the current actor still preview after permission revocation?
- Is a relationship, media item, dynamic source, or custom package safe for the
  public renderer?
- Does the candidate match D1's full dependency closure?
- May the request perform giving, form submission, analytics, notifications,
  embeds, or other side effects?

The cookie is browser-session and build specific, but otherwise broad. If a
public app branches on that cookie globally, an editor previewing one Site can
accidentally put unrelated routes or Tenants into “draft” behavior. If Draft
Mode is used at all, Asym must additionally require an exact server-side preview
grant on every preview HTML, RSC/data, asset, refresh, and navigation request.
The grant must bind the target and current actor; the cookie alone must reveal
nothing and authorize nothing.

## Current Core preview seam

The repository already contains a useful bridge:

- [`preview-url.ts`](../../../../apps/admin/src/cms-ui/web-studio/adapters/preview-url.ts)
  generates `/web-studio/preview/{collection}/{document-id}` for four
  allowlisted collections.
- The
  [authenticated preview route](<../../../../apps/admin/app/(payload)/web-studio/preview/%5Bcollection%5D/%5Bid%5D/page.tsx>)
  authenticates through Payload, passes the current user/request, uses
  `overrideAccess: false`, and reads `findByID({ draft: true, depth: 2 })`.
- [`authenticated-preview.ts`](../../../../apps/admin/src/cms/preview/authenticated-preview.ts)
  builds a narrow model and uses the existing public Page serializer for
  page-like records.
- The
  [native document workspace](../../../../apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/NativeCollectionEditView.tsx)
  wires Payload's Preview context and exposes a Live Preview subview link only
  when the provider reports that Live Preview is enabled.
- [`editor-state.ts`](../../../../apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/editor-state.ts)
  tells staff to save before preview and distinguishes authenticated preview
  from public publication state.

The current collection and root Payload configs set `admin.preview`, but do not
configure `admin.livePreview`. The nested Live Preview link is therefore an
available UI seam, not evidence that Core already has a working Live Preview
product.

The bridge has five D25-relevant limitations:

1. Its URL carries a document id, not an immutable version id. Reloading can
   select a later autosave because `draft: true` means latest.
2. It uses an Admin-owned preview renderer and generic shell rather than the
   exact D9 presentation package, Site chrome, Navigation, route, metadata,
   locale direction, and D1 public renderer.
3. Its identity omits environment, Tenant, Site, domain, exact locale,
   placement revision, package/profile, compiler, dynamic-source catalog, and
   release candidate.
4. It reads a depth-two provider document and manually interprets media and
   blocks. That is broader and more drift-prone than a typed public-safe
   projection.
5. Authentication and collection access are helpful, but do not establish the
   exact Phase 12 preview capability or contributor/named-recipient grant that
   prior phases require.

These limitations do not make the bridge disposable. Its allowlist, login
continuation, `overrideAccess: false`, and state language are good seams to keep
while D25 replaces mutable targeting and the second renderer.

## Iframe, origin, and message security

Payload Live Preview necessarily crosses a browser trust boundary. MDN's
[`postMessage` security guidance](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage#security_concerns)
requires exact target origins, sender verification using `origin` and possibly
`source`, and message-shape validation. The
[OWASP HTML5 Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#web-messaging)
adds that origin matching must be exact rather than substring based and that
received data must remain data, never evaluated or inserted as unsafe HTML.

The permanent D25 controls are:

1. **Server-owned allowlist.** Resolve the Admin and preview origins from exact
   environment/Site configuration. Do not trust a document field, request Host
   header, arbitrary Tenant string, or client-provided origin.
2. **Exact URL parsing.** Normalize with the URL parser and compare exact
   protocol, hostname, and effective port. Production preview targets require
   HTTPS. Reject credentials, fragments that carry authority, non-allowlisted
   redirects, and prefix matches.
3. **Exact message identity.** Sender and receiver check exact `event.origin`,
   expected `event.source`, message type, protocol version, Tenant, Site,
   locale, document/version/candidate id, session nonce, monotonically
   increasing sequence, and a strict schema before using data.
4. **No wildcard.** Never use `*` as `targetOrigin` for ready, document, form,
   error, or control messages.
5. **Race resistance.** Ignore messages from a prior iframe navigation,
   previous Page, stale save, superseded editor, wrong locale, closed popup, or
   earlier sequence. Abort or discard out-of-order relationship/compile
   responses.
6. **Bounded projection.** Send only the versioned public-preview DTO required
   by the renderer. Never send raw Payload form state, permissions, tokens,
   internal notes, hidden fields, donor/supporter data, financial values,
   private URLs, or unrestricted relationships.
7. **Narrow framing.** Apply an explicit
   [`frame-ancestors`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors)
   policy to the private preview target that names only exact Web Studio
   origins. Do not weaken every public Page merely to make one preview iframe
   work. A dedicated private preview route can have a different narrow policy.
8. **Defensive frame behavior.** Consider a tightly scoped iframe `sandbox`
   and `allow` policy. Grant only capabilities the faithful renderer requires.
   Navigation, popups, forms, downloads, payment, notifications, storage,
   camera, microphone, location, and top-navigation should be inert or absent
   unless an independently authorized preview requirement proves otherwise.
9. **Private transport.** Preview HTML, RSC/data, relationship results, media,
   and errors use `Cache-Control: private, no-store`, no public CDN cache,
   restrictive referrer policy, `noindex`/`nofollow`/`noarchive` intent, and no
   public sitemap, canonical, hreflang, social metadata, search, or analytics.
10. **Current authorization.** Reauthorize every request and message-driven
    fetch. Session expiry, role revocation, Site disablement, Trash, package
    revocation, or safety suppression fails closed on the next action.

### Same-origin is simpler, but not sufficient

Co-locating Admin and private preview under one controlled origin avoids most
CORS, CSRF, third-party-cookie, and cross-domain relationship-population
problems. It also allows a relative Live Preview URL, which Payload supports.
It does **not** remove the need for exact Tenant/Site/version authorization,
typed message validation, cache isolation, and side-effect suppression.

Cross-origin preview may be necessary for custom domains or production-parity
headers. If adopted, it is a deliberate integration with an explicit origin
registry, CORS/CSRF contract, cookie/SameSite proof, frame policy, domain
ownership verification, reassignment/revocation handling, and browser matrix.
It must not grow from a permissive wildcard added to “make the iframe work.”

## Exactness and dependency closure

An exact D25 preview target should be representable as a server-owned tuple,
not inferred from browser state:

```text
Tenant + environment + Site + domain + Page identity + locale
+ editorial version + placement version + Navigation version
+ presentation package/profile + compiler/renderer version
+ rich-text profile + source-catalog/profile versions
+ preview capability/grant + candidate/receipt identity
```

The tuple can be represented by one opaque candidate id, but the server must be
able to resolve and validate every member. Opaqueness is not authority.

### Static and dynamic inputs

D1 can freeze Page semantics while D14 dynamic lists intentionally resolve
current public-safe source projections. Preview must state this difference:

- exact Page/layout/presentation inputs remain pinned;
- an intentionally dynamic public-safe source is labeled with its current
  `as-of`/freshness state;
- authorization or safety changes can narrow current output adverse-first;
- source failure is visible and never replaced with staff-only source data,
  stale favorable data without disclosure, or another Tenant's result.

### Locale

D22 forbids silent field fallback. A preview binds and visibly names one exact
locale lineage. Payload `fallbackLocale: false` is the relevant provider
setting, but Asym must also bind locale-specific path, Navigation, direction,
metadata, content, dynamic sources, media text, and package behavior. Missing
content fails honestly rather than borrowing from another locale.

### Custom presentation

D9 makes presentation packages part of the candidate. A generic Admin block
renderer cannot prove the bespoke component set, fonts, tokens, motion,
loading, Site chrome, or responsive behavior. Preview should call the same
versioned compiler and public renderer as D1 with effects disabled, not maintain
a parallel “close enough” renderer.

## Freshness, failure, and operational behavior

### Required state machine

The UI and protocol should expose at least these states without requiring staff
to understand Payload terminology:

- **Waiting to save** — local changes exist, but no server receipt is available;
- **Updating preview** — a known acknowledged revision is compiling/rendering;
- **Preview current** — preview matches the displayed exact revision receipt;
- **Newer saved revision available** — a pinned review/schedule preview remains
  exact and does not auto-switch;
- **Preview stale** — last successful exact preview remains visible after a
  newer render failure, with its revision and timestamp;
- **Preview blocked** — current authorization, safety, validation, package, or
  dependency checks refuse rendering; and
- **Session ended** — staff must reauthenticate, after which exact scope is
  reauthorized rather than inferred from the old iframe.

Client-live mode needs an additional unmistakable **Unsaved visual draft**
label. It must never use **Saved**, **Ready to publish**, **Scheduled**, or
**Exact revision** until D12 acknowledges the state and the server renders that
receipt.

### Failure rules

- Keep the last successful exact preview visible with a stale label when safe;
  never relabel it current.
- A failed save, validation error, upload error, conflict, takeover, or lost
  acknowledgement must not advance the exact preview.
- A stale or out-of-order compile, relationship response, message, or route
  refresh must not overwrite a newer acknowledged state.
- Authorization or safety failure removes protected output immediately rather
  than retaining the last frame for convenience.
- A compiler/package/source failure may not fall back to raw provider JSON, the
  generic package, the live public Page, another locale, mutable latest, or
  unqualified media.
- Preview failure never mutates the Working Revision, schedule, review target,
  release candidate, or D1 serving head.

### Performance and cost

Client Live Preview can turn every form change into rendering, relationship
population, image work, and cross-window traffic. Server Live Preview can turn
every autosave into a full route refresh, Payload read, dependency resolution,
compile, and render. Permanent controls should include:

- debounce/coalescing at the presentation boundary without changing D12's save
  cadence;
- cancel/supersede obsolete work and discard late results by sequence/revision;
- bounded relationship depth and explicit public projection;
- bounded compile/render concurrency per actor and Site;
- cached immutable package/compiler assets keyed by exact version, while the
  preview response and sensitive result remain `no-store`;
- lazy iframe startup and pause when hidden, preserving a clear stale/current
  state on resume;
- payload-size and render-duration budgets with structured diagnostics; and
- no background preview work after the document, popup, session, or editor
  lease is gone.

No one should lower autosave intervals or broaden cross-origin access merely to
make the canvas feel instant. If per-keystroke feedback is required, the
client-live lane should be explicitly provisional and bounded rather than
charging the database for a false server-live approximation.

## UX implications grounded in the provider behavior

The provider offers several controls, but Asym must give them stable product
meaning:

- Use **Preview saved draft** for an exact acknowledged revision. If a save is
  required, disable the action with nearby explanatory text rather than opening
  a stale target without disclosure.
- Use **Live preview** only for the updating canvas. Its status names whether it
  is showing **Unsaved changes** or **Saved revision 42**.
- Use **View live page** only for the current D1 serving generation. It opens
  the real public URL and never inherits preview state.
- Keep **Not public**, Site, domain, locale, Page/path, and target revision
  persistently visible in preview chrome. Put diagnostic dependency ids behind
  details.
- Do not auto-switch a pinned reviewer or scheduled preview when a newer
  autosave arrives. Offer a secondary **Preview newer saved revision** action.
- Device-size controls use truthful names such as **Responsive**, **Narrow**,
  **Tablet**, and **Wide**. They are viewport checks, not “iPhone” or “Android”
  proof.
- On small editor screens, prefer a full-screen preview with a clear **Back to
  editor** action and focus restoration rather than squeezing editor and iframe
  side by side.
- Status changes use persistent text and polite announcements, not transient
  toasts alone. Loading must not erase the last safe frame or steal focus.
- Previewed CTAs, giving, forms, media embeds, downloads, and external links are
  visibly inert or routed to safe representative states. Appearance can remain
  faithful without causing transactions, analytics, notifications, or
  navigation away from the exact preview.

Payload's exact stock Preview button currently copies the generated URL to the
clipboard; Core separately exposes an **Open preview** action. D25 should own
the user-facing verbs rather than inheriting provider behavior that may change
between internal builds.

## Open-source versus enterprise boundary

The exact `@payloadcms/live-preview` and
`@payloadcms/live-preview-react` package manifests declare MIT licenses and
point to Payload's public GitHub repository. Payload's ordinary Preview and
Live Preview documentation describes these core configuration/package seams
without an enterprise prerequisite.

Payload's separate
[Visual Editor](https://payloadcms.com/enterprise/visual-editor) page appears
under Enterprise Features and currently says **Coming Soon**. It describes
editing text, images, relationships, and Page structure directly in the visual
surface. That is broader than Live Preview's iframe/postMessage rendering.

D25 can therefore use or adapt the open Preview/Live Preview primitives without
buying Visual Editor. It must not promise enterprise Visual Editor behavior,
field overlays, point-and-click selection, inline structural editing, or
collaborative visual authoring. Those would require a future explicit product,
security, accessibility, dependency, and commercial decision.

## Version-drift and upgrade risks

1. **Unversioned web docs.** Current Payload docs are not scoped to Core's
   internal build. The overview's `RefreshRouteOnChange` prose versus the
   focused guide/package's `RefreshRouteOnSave` is concrete evidence of drift.
2. **Internal Payload pin.** `4.0.0-internal.1f9ae9a` can change before a public
   v4 contract stabilizes. Internal UI implementation such as ready-message
   handling is not a durable Asym API.
3. **Preview Next pin.** `16.3.0-preview.9` Draft Mode and Cache Components
   behavior must be retested on upgrade; D25 should depend on the product
   properties, not undocumented internals.
4. **Optional package closure.** The Live Preview helper packages are not in
   Core's lockfile. If adopted, every `@payloadcms/*` package must use the same
   exact version and peer-dependency closure.
5. **Provider UI drift.** Stock labels, copy/open behavior, breakpoints, popup,
   message shapes, and route names may change. Asym-owned adapters and UX copy
   should remain the stable boundary.
6. **Projection drift.** A new CMS field can become part of raw form state
   without being safe for preview. Typed allowlists, schema/protocol versions,
   and negative leak tests must fail closed on unknown fields.

### Upgrade gate

Before changing Next, Payload, or a Live Preview helper:

1. install the exact proposed lockfile in an isolated worktree;
2. read that installed Next Draft Mode documentation;
3. inspect the exact Payload Live Preview, version-read, and Admin source;
4. compare public docs and changelogs without treating them as exact package
   proof;
5. run origin, source, redirect, cache, authorization, exact-version,
   projection, locale, relationship-depth, stale-ordering, and renderer-parity
   conformance tests; and
6. block deployment on any changed claim until the adapter or D25 contract is
   intentionally updated.

## Evidence-backed D25 boundaries

Whatever founder option is selected, the primary sources support these
permanent constraints:

1. **One product preview contract.** Payload and Next remain adapters. D1's
   exact candidate, public-safe projection, and real public renderer define
   fidelity.
2. **Exact saved target for consequential review.** Review, approval,
   scheduling, comparison, and release-related preview bind an immutable
   server-acknowledged version/candidate. `draft: true` alone is insufficient.
3. **Provisional live state is labeled.** If unsaved client Live Preview is
   offered, it is an optional editing aid with explicit unsaved/invalid/stale
   semantics. It does not become the review or schedule target.
4. **No database-driven imitation of client live.** Server Live Preview follows
   bounded D12 saves; D25 does not reduce autosave to hundreds of milliseconds
   simply for animation-like feedback.
5. **Private, current authorization.** Every preview request and refresh
   reauthorizes exact scope. URL possession, Payload login, JWT, Draft Mode
   cookie, iframe readiness, and prior success grant nothing by themselves.
6. **Typed projection across the browser boundary.** Never transmit raw CMS form
   documents. Unknown or unsafe fields fail closed.
7. **Exact origin and source checks.** Static trusted origins, parsed equality,
   typed protocol version, session nonce, sequence/revision identity, CSP, and
   side-effect restrictions are mandatory for iframe or popup use.
8. **No public cache or discovery.** Preview is `private, no-store`, noindex,
   absent from public search/share metadata, and excluded from public analytics.
9. **Failure is honest and adverse-first.** No silent fallback to live,
   generic presentation, mutable latest, another locale/Site, raw provider
   data, or a previous favorable safety state.
10. **Open core only by default.** Ordinary Preview/Live Preview can be built on
    the MIT seams. Enterprise Visual Editor behavior is outside D25 unless a
    future explicit decision adds it.

## Implementation proof matrix

A later authorized implementation should not claim D25 complete until automated
and representative-user testing proves all of the following.

| Area              | Required proof                                                                                                                                                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Exact target      | Reload, later autosave, later manual save, review, schedule, restore, conflict, takeover, and deploy skew never change a pinned version silently.                                                                                           |
| Renderer parity   | The same exact inputs produce the same semantic and visual output in preview and D1 public rendering for standard and every certified D9 package.                                                                                           |
| Tenant safety     | Cross-Tenant, environment, Site, domain, Page, locale, version, actor, role, grant, and media identifiers fail non-enumeratingly across HTML, RSC/data, API, asset, iframe, popup, and refresh paths.                                       |
| Authorization     | Expiry, revocation, Site disablement, Trash, package revocation, and named-grant removal fail closed on the next request/message. No cookie, URL, or message bypass exists.                                                                 |
| Cache isolation   | HTML, RSC/data, errors, relationship population, images, and redirects are never stored in shared/public caches or served to a non-preview request. Draft Mode never contaminates another route or Tenant.                                  |
| Message security  | Exact allowed and hostile origins, source-window mismatch, prefix-confusable hosts, redirect navigation, wildcard attempts, malformed/oversized/unknown messages, replay, stale sequence, and popup races are tested.                       |
| Projection safety | Private fields, internal notes, financial/supporter data, hidden fields, service tokens, unsafe URLs, unqualified media, unexpected future fields, and over-depth relationships never enter browser messages or rendered output.            |
| Save semantics    | Unsaved, saving, acknowledged, validation-blocked, upload-failed, conflict, outcome-unknown, autosaved, and exact-review states display truthfully. A client frame cannot claim a server receipt.                                           |
| Locale            | Exact BCP-47 locale, direction, path, Navigation, metadata, content, media text, and package behavior render with no provider or field fallback.                                                                                            |
| Dynamic sources   | Exact configuration plus current public-safe source state is labeled and safety can narrow adverse-first; failure leaks no staff-only or cross-Tenant data.                                                                                 |
| Effects           | Giving, forms, downloads, external navigation, notifications, media tracking, embeds, and analytics are inert or use explicit safe preview doubles.                                                                                         |
| Accessibility/UX  | Keyboard, screen reader, focus return, status announcements, 320 CSS-pixel reflow, 400% zoom, touch targets, forced colors, reduced motion, RTL/bidirectional text, long labels, and low-power/slow-network flows succeed without coaching. |
| Performance       | Rapid typing, autosave, relationship changes, image changes, route changes, and close/reopen coalesce and cancel safely within budgets without unbounded DB writes, compiles, or network calls.                                             |
| Upgrade           | Exact-pin package-source and black-box adapter conformance gates fail when provider behavior changes.                                                                                                                                       |

## Primary sources

### Payload

- [Preview](https://payloadcms.com/docs/admin/preview)
- [Live Preview overview](https://payloadcms.com/docs/live-preview/overview)
- [Implementing Live Preview in the frontend](https://payloadcms.com/docs/live-preview/frontend)
- [Server-side Live Preview](https://payloadcms.com/docs/live-preview/server)
- [Client-side Live Preview](https://payloadcms.com/docs/live-preview/client)
- [Drafts](https://payloadcms.com/docs/versions/drafts)
- [Versions](https://payloadcms.com/docs/versions/overview)
- [Exact Payload commit `1f9ae9a`](https://github.com/payloadcms/payload/commit/1f9ae9a)
- [Payload Visual Editor](https://payloadcms.com/enterprise/visual-editor)

### Next.js

- [Exact `next@16.3.0-preview.9` npm tarball](https://registry.npmjs.org/next/-/next-16.3.0-preview.9.tgz)
- [Current Draft Mode guide](https://nextjs.org/docs/app/guides/draft-mode)
- [`draftMode` API](https://nextjs.org/docs/app/api-reference/functions/draft-mode)
- [Data security](https://nextjs.org/docs/app/guides/data-security)
- [Content Security Policy](https://nextjs.org/docs/app/guides/content-security-policy)
- [Headers configuration](https://nextjs.org/docs/app/api-reference/config/next-config-js/headers)

### Browser and security standards/guidance

- [HTML Standard — cross-document messaging](https://html.spec.whatwg.org/multipage/web-messaging.html)
- [MDN — `window.postMessage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
- [MDN — CSP `frame-ancestors`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors)
- [OWASP HTML5 Security Cheat Sheet — Web Messaging](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#web-messaging)

## Research boundary

This pass deliberately did not choose or ratify a D25 option, add dependencies,
change runtime code, configure Live Preview, add Draft Mode, modify schema,
publish issues, or change Git state. It establishes what the exact provider and
framework pins do, what they do not do, and the proof burden any D25 formulation
must carry.
