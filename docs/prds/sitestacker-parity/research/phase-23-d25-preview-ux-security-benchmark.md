# Phase 23 D25 preview UX, accessibility, and security benchmark

**Status:** Supporting evidence for founder-ratified Phase 23 D25 C-prime-R.
This document does not independently expand the decision, authorize
implementation, or expand any existing authority.

**Date:** 2026-08-23

## Scope and conclusion

This benchmark pressure-tests the Preview and Live Preview product surface for
Phase 23 against current Core behavior, ratified Phase 23 contracts, current
Payload and Next.js guidance, comparable CMS products, WCAG 2.2, CSP, and OWASP
browser-security guidance.

The smallest excellent product is:

1. **Preview** is the one primary action. It first obtains a D12 server-
   acknowledged Working Revision and renders that exact revision through the
   real D1/public compiler and D9 presentation package.
2. **Live preview** is an optional, Page-local editor pane that advances only
   when another exact Working Revision is acknowledged. It keeps the last
   acknowledged render while changes are unsaved, saving, conflicted, or
   outcome-unknown and says so plainly.
3. **Open exact preview** is a stable full-Page view pinned to one acknowledged,
   review, scheduled, or release-candidate revision. It never follows later
   edits automatically.
4. Preview is side-effect-dark and receives only the public-safe view model.
   Authentication never licenses raw CMS form state, private relationships,
   donor data, internal notes, active giving, forms, tracking, or third-party
   embeds.
5. Narrow screens use a full-screen Preview mode. A split editor/preview layout
   is optional on sufficiently wide screens and never the only way to preview.
6. Responsive controls use named widths, not device claims or icon-only
   controls. They test layout; they do not pretend to emulate hardware,
   bandwidth, browsers, or assistive technology.
7. Whole-Site draft navigation and click-to-edit overlays do not ship in D25.
   Both are materially larger products with separate authorization,
   instrumentation, accessibility, and operational costs.

This supports **one exact Preview product with acknowledged Live Preview and a
pinned review mode**. It does not support Payload's native per-keystroke form-
state transport as the product truth. Modern software may show unsaved changes,
but D12 already settled that browser-only and in-flight work is not an exact,
recoverable revision. Preserving that truth is more valuable than using the
word “live” in its most aggressive sense.

## Evidence method

The review used this authority order:

1. ratified Phase 23 and cross-phase contracts;
2. current Core Web Studio source and tests;
3. the exact Payload and Next.js versions pinned by this worktree;
4. current first-party Payload, Next.js, W3C, OWASP, Contentful, and Sanity
   documentation; and
5. concrete nonprofit-ministry authoring, reviewing, localization, and recovery
   scenarios.

No runtime UI, schema, migration, issue, ADR, decision log, or Git state was
changed for this research.

## Existing authority this benchmark preserves

The companion
[D25 contract and repository audit](./phase-23-d25-preview-contract-and-repository-audit.md)
records the complete authority chain. The UX and security consequences most
important here are:

| Existing decision                                                                                  | Consequence for D25                                                                                                                                                                  |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [D1](../../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)      | Preview consumes an exact private candidate through the same compiler as release. It does not create or mutate another serving head.                                                 |
| [D9](../../../adr/0153-certified-site-bound-custom-presentation-packages.md)                       | Preview must execute the exact certified Site package; a generic admin approximation cannot prove layout, motion, responsive behavior, or brand fidelity.                            |
| [D12](../../../adr/0156-bounded-editorial-working-revisions-and-recoverable-active-editor.md)      | Only a server-acknowledged Working Revision can be called saved or exact. Preview must not silently substitute browser-only, queued, in-flight, conflicted, or outcome-unknown work. |
| [D13](../../../adr/0157-exact-revision-scheduled-publication-appointments-through-d1.md)           | A scheduled preview stays pinned to the exact scheduled revision and dependencies even after later edits.                                                                            |
| [D22](../../../adr/0166-bounded-localized-editorial-profile-over-exact-locale-lineages.md)         | Every preview names one exact locale lineage. Missing localized fields fail honestly; silent mixed-locale fallback is forbidden.                                                     |
| [D23](../../../adr/0167-exact-site-owned-ordinary-content-with-independent-copy-to-site-drafts.md) | Site, domain, Page, locale, and revision are exact authorization and presentation scope, not optional labels.                                                                        |
| [D24](./phase-23-d24-public-audience-visibility-and-cache-policy-decision-brief.md)                | Preview is private, `no-store`, and non-indexable. It cannot become a public audience or public cache variant.                                                                       |
| Phase 10 sensitive-data safety                                                                     | Staff access does not make private operational data safe to serialize through a public-looking renderer. Current adverse safety may narrow output.                                   |
| Phase 12 authorization                                                                             | A session identifies the actor; it does not by itself authorize a Tenant, Site, Page, locale, revision, media asset, or candidate.                                                   |

## What current Core proves—and does not prove

### Useful seams to preserve

The current
[`NativeCollectionEditView.tsx`](../../../../apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/NativeCollectionEditView.tsx)
already distinguishes Preview from **Open published page**, exposes editor save
state, and has a natural place for one preview action. The
[`editor-state.ts`](../../../../apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/editor-state.ts)
adapter already distinguishes unsaved, autosaving, saved, draft, and published
provider states. D25 should refine those seams rather than add a second status
dashboard.

The current
[`authenticated-preview.ts`](../../../../apps/admin/src/cms/preview/authenticated-preview.ts)
allowlists supported collections and reuses part of the public serializer. The
current preview route authenticates, reads with `overrideAccess: false`, and is
covered by a basic unauthenticated-redirect test. Those are useful foundations.

### Material gaps

The current
[`preview-url.ts`](../../../../apps/admin/src/cms-ui/web-studio/adapters/preview-url.ts)
addresses only collection and document id. The
[`preview route`](<../../../../apps/admin/app/(payload)/web-studio/preview/%5Bcollection%5D/%5Bid%5D/page.tsx>)
then reads the latest draft with `draft: true` and `depth: 2`. A later autosave
can therefore change what a previously opened URL renders. The route also owns
a separate generic preview renderer rather than the exact public Site package,
Navigation, route, metadata, and compiler path.

The existing “Authenticated” label describes a login mechanism, not the exact
Site, locale, revision, candidate, or permission. The older
[`web-studio-sections.tsx`](../../../../apps/admin/app/web-studio/web-studio-sections.tsx)
mock uses a fixed preview rail and icon-only viewport controls; it is useful as
a visual experiment, not as an accessible or responsive product contract.

Current tests prove the basic URL and login guard, but do not prove exact-
revision pinning, hostile cross-scope requests, permission revocation, response
privacy, public-renderer parity, message-origin validation, side-effect
darkness, focus behavior, reflow, or recovery.

The worktree currently pins Payload packages to
`4.0.0-internal.1f9ae9a` and Next.js to `16.3.0-preview.9` in
[`package.json`](../../../../package.json). These are preview/internal lines.
Their mechanics require an exact-pin conformance check during implementation;
neither version may become the durable D25 contract.

## Current primary-source findings

### Payload supplies mechanics, not Asym's product truth

[Payload Live Preview](https://payloadcms.com/docs/live-preview/overview)
renders the configured front end in an iframe, sends document changes through
`window.postMessage`, supports configured viewport sizes, and can pop the
preview into another window. Its dynamic URL callback explicitly supports
multi-tenant and localized URL construction. This confirms that a Page-local
embedded preview and named responsive widths are conventional CMS behavior.

The same documentation says native Live Preview emits on every document
change, without requiring a draft save. [Payload's client guidance](https://payloadcms.com/docs/live-preview/client)
merges that form data into initial data and may populate relationships; its
default relationship depth is zero. That model conflicts with D12 if exposed
as an exact or reviewable preview. It also creates a data-minimization problem
if the CMS form includes operational fields that must never enter the public
renderer.

Inspection of the exact pinned Payload source found that its stock admin window
reduces and posts the complete form values on change, its iframe has no
`sandbox` attribute, and one popup-readiness path compares a URL prefix rather
than a parsed exact origin. This is not a claim that Payload has an exploitable
vulnerability. It is evidence that stock Live Preview has different trust and
truth assumptions than D25 and must sit behind an Asym adapter plus explicit
conformance tests.

[Payload Preview](https://payloadcms.com/docs/admin/preview) provides a direct
front-end Preview link. It does not establish Asym's exact revision,
authorization, public-safe projection, no-side-effect, or D1 release semantics.

**D25 implication:** prefer a revision-fenced preview URL or server fetch after
each D12 acknowledgement. Do not send raw form state through the frame. If a
message channel remains useful for readiness, focus return, or state, keep it
minimal and strictly validated.

### Next.js Draft Mode is a render switch, not preview authority

[Next.js Draft Mode](https://nextjs.org/docs/app/api-reference/functions/draft-mode)
lets a route bypass ordinary static rendering after a Draft Mode cookie is
enabled. It does not identify or authorize a Tenant, Site, Page, locale,
revision, candidate, media asset, or presentation package. A Draft Mode cookie
may be an internal rendering mechanism, but it cannot be the D25 permission or
exact-target boundary.

**D25 implication:** every preview request resolves a server-derived exact
scope and reauthorizes it. Draft Mode, route parameters, and opaque ids are
locators or framework mechanics only.

### Modern CMS products separate basic preview from advanced instrumentation

[Contentful Live Preview](https://www.contentful.com/developers/docs/tutorials/preview/live-preview/)
provides side-by-side editing and preview as a basic mode, while live updates
and inspector behavior require additional SDK integration. Its documentation
also calls out frame CSP and embedded-cookie limitations. This supports
treating embedding, live transport, and click-to-edit as distinct capabilities
rather than one checkbox.

[Contentful Inspector Mode](https://www.contentful.com/developers/docs/tutorials/preview/inspector-mode/)
requires content-source mapping or manual field tagging, adds hidden metadata,
and documents unsupported or fragile value types. [Sanity's overlay guidance](https://www.sanity.io/docs/visual-editing/visual-editing-overlays)
likewise relies on source metadata, an overlay runtime, and a communication
protocol; [Sanity Presentation](https://www.sanity.io/docs/user-guides/preview-and-page-building)
adds separate edit and navigation modes.

**D25 implication:** click-to-edit is an instrumentation subsystem, not a small
overlay. With D9 custom packages, D11 rich text, Page-local blocks, dynamic
sources, locale lineages, and accessibility requirements, it would create
hidden coupling and ongoing package-certification work. A plain **Back to
editor** action is the proportionate D25 answer.

### Browser messaging requires exact, minimal trust

[OWASP's HTML5 Security guidance](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html)
requires an exact target origin instead of `*`, exact origin validation on
receipt, and validation of message data. It warns against substring origin
checks and treating received data as executable or HTML content.

**D25 implication:** if any preview messaging remains, both sides validate an
exact parsed origin, `event.source`, a small versioned schema, a per-frame
channel identifier, expected Tenant/Site/Page/locale/revision scope, message
size, and rate. No message carries arbitrary form state, HTML, secrets, or
authority.

### URL-borne session secrets are an avoidable footgun

[OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
documents leakage of URL session identifiers through browser history,
bookmarks, logs, referrers, and search systems. It also recommends avoiding raw
session identifiers in logs.

**D25 implication:** a preview URL may contain a non-authoritative opaque
locator, but never a durable bearer credential. A normal authenticated session
or short-lived preview session is server-bound to the actor and exact scope;
every request reauthorizes. Internal preview navigation uses an HttpOnly
session, not a token copied from link to link.

### Embedding requires policy on both sides

The W3C [Content Security Policy Level 3 specification](https://www.w3.org/TR/CSP/)
defines `frame-ancestors` as the embedded response's control over which parents
may frame it. It has no `default-src` fallback and must be delivered in a
response header. The parent separately controls allowed child frames with
`frame-src`.

**D25 implication:** the editor permits only the exact preview origin, and the
preview permits only the exact Web Studio origin. If custom presentation code
runs in an iframe, a dedicated same-site preview origin gives the strongest
blast-radius reduction. If an embedded session cannot be made reliable without
weak cookies, broad origins, or bearer URLs, ship the top-level exact Preview
and defer the embedded pane. Do not weaken authorization to make an iframe
work.

A sandbox is useful only when its permitted capabilities are understood. A
same-origin frame granted both scripts and same-origin behavior is not a strong
isolation boundary. D25 should use the minimum compatible sandbox capabilities,
deny top navigation, popups, downloads, forms, and payments by default, and
treat CSP, origin separation, server authorization, and a public-safe view
model as the actual controls.

### Accessibility favors a top-level exact view plus optional wide-screen pane

W3C's [iframe title technique](https://www.w3.org/WAI/WCAG22/Techniques/html/H64)
requires a useful programmatic title. [Focus order guidance](https://www.w3.org/WAI/WCAG22/Understanding/focus-order)
requires keyboard navigation to preserve meaning and operation. [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow)
requires content to work at a 320 CSS-pixel viewport without two-dimensional
scrolling for ordinary content. [Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages)
must be programmatically determinable without moving focus. W3C also advises
[warning users before opening a new window](https://www.w3.org/WAI/WCAG22/Techniques/general/G201).

**D25 implication:** full-screen Preview is a first-class mode, not a mobile
fallback of last resort. The split pane appears only when both panes remain
usable. It has a titled iframe, controls before the frame in DOM order, visible
focus, an intentional way into and out of the preview, quiet status updates,
and no automatic popup. **Open exact preview (opens in new tab)** is a user-
initiated secondary action.

## Mode comparison

| Mode                                       | Editorial truth                                                    | UX value                                                         | Security/accessibility cost                                                                               | D25 disposition                                   |
| ------------------------------------------ | ------------------------------------------------------------------ | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Exact saved full-Page Preview              | Strong: one immutable acknowledged revision and candidate closure  | High for review, scheduling, custom package fidelity, and mobile | Lowest; normal top-level navigation and no live data channel                                              | **Required baseline**                             |
| Page-local acknowledged Live Preview       | Strong if it advances only by exact D12 receipt and revision fence | High for routine layout iteration                                | Moderate; frame lifecycle, focus, responsive behavior, repeated compiles, and optional minimal messages   | **Recommended optional enhancement**              |
| Per-keystroke unsaved Live Preview         | Browser state only; not recoverable or review evidence             | Fastest visual feedback                                          | High; raw-form transport, confusing truth, message volume, relationship drift, and private-field exposure | **Reject for D25**                                |
| New-window exact Preview                   | Strong and stable                                                  | Useful for dual screens, resize, and deliberate review           | New-window orientation, popup blocking, stale-tab clarity                                                 | **Supported secondary presentation with warning** |
| Whole-Site mutable draft navigation        | Weak unless every dependency is pinned into one candidate          | Useful for journey testing                                       | High authorization, inference, candidate lifecycle, cost, and staff mental-model burden                   | **Defer; requires a later decision**              |
| Whole-Site immutable candidate environment | Potentially strong                                                 | Valuable for large coordinated redesigns                         | Still a staging-site product with closure-wide permissions and operations                                 | **Not D25 launch scope**                          |
| Click-to-edit / visual overlays            | Does not improve revision truth                                    | Convenient for complex Pages after mature adoption               | High metadata, package, communication, focus, and maintenance coupling                                    | **Cut from D25**                                  |

## Recommended staff experience

### 1. One primary Preview action

Use **Preview** as the primary label across Page families. Do not expose
separate top-level buttons named **Authenticated Preview**, **Draft preview**,
**Live Preview**, **Responsive Preview**, and **Open preview**.

When staff choose Preview:

1. If the editor has no pending changes, render the latest acknowledged Working
   Revision.
2. If changes are pending, D12 flushes and waits for one exact server receipt.
   The action says **Saving changes for preview…**.
3. If acknowledgement succeeds, Preview opens or advances to that exact
   revision.
4. If save, validation, conflict resolution, authorization, or read-back fails,
   Preview does not open an older revision as though it contained the new work.
   The editor remains intact and the cause-owned repair action receives focus
   only when appropriate.

The preview chrome always shows:

- **Preview — not public**;
- Page title and path;
- Site name and domain;
- exact locale;
- **Saved [relative time]** with the exact revision in accessible details;
- **Waiting for saved changes**, **Current**, **Paused**, or **Unavailable**;
- **Back to editor**;
- responsive width controls; and
- **Open exact preview (opens in new tab)**.

Diagnostic package, compiler, source-catalog, and candidate generation ids stay
inside a details disclosure. They are support evidence, not normal staff
configuration.

Do not use **Authenticated** as the primary status. Authentication is expected
and says nothing about what was authorized or rendered. Do not use **Live** for
a private preview; D1 owns the public Live state.

### 2. Acknowledged Live Preview on wide screens

The optional pane belongs beside the current active editor only. It does not
follow another Page, locale, or editor session.

- It renders the last acknowledged revision immediately when opened.
- After each later D12 acknowledgement, it coalesces updates and renders only
  the newest receipt needed.
- There is at most one compile/render in flight per active editor.
- Every result carries a revision fence; a slower old result is discarded.
- Unsaved or saving work does not replace the frame. The status says **Waiting
  for saved changes**.
- A conflict, takeover, or outcome-unknown save pauses advancement. The last
  safe rendering remains visibly labelled with its exact revision.
- Closing the pane does not save, publish, release, or destroy work.
- Pane preference may be remembered per user/device; it is never forced tenant
  configuration.

The preferred transport is an exact revision-fenced request or frame reload
after acknowledgement. This is simpler and safer than sending the CMS form
through `postMessage`. A minimal readiness/focus status channel may be used if
strictly qualified, but the Page content itself does not travel over it.

### 3. Pinned exact Preview for review and scheduling

**Open exact preview** creates the artifact a reviewer or scheduler can trust.

- It binds one exact acknowledged, submitted, approved, or scheduled revision
  plus all required candidate dependencies.
- Later autosaves do not move it.
- If a newer saved version exists, show **A newer saved version is available**
  and an explicit **Preview newer version** action.
- The exact scheduled revision remains available even if the active editor has
  moved ahead.
- Browser refresh, reauthentication, and Back/Forward preserve the exact target
  or fail closed; they never resolve mutable `latest`.

The new-tab action uses `noopener`/`noreferrer`, is user-initiated, and includes
the visible “opens in new tab” warning. If a browser blocks the new context,
fall back to the same-tab exact view without weakening the target.

### 4. Responsive controls without device theatre

Use a compact single-selection control with visible names such as:

- **Responsive** — available width, default;
- **Narrow · 375 px**;
- **Medium · 768 px**; and
- **Wide · 1280 px**.

The exact catalog can derive from the certified Site package, but it remains
small and stable. Do not ask each tenant to configure arbitrary “devices.”
Avoid phone/tablet icons without text. A short help sentence says these widths
check responsive layout and are not hardware or browser emulation.

Each option exposes selected state, a visible focus indicator, keyboard
operation, and a target at least as large as Core's existing touch convention.
At narrow Web Studio widths and 400% zoom, force **Responsive** and present the
preview as a full-screen view instead of preserving a fixed-width canvas or
crushing the editor.

### 5. Side-effect-dark fidelity

Preview must look like the actual public Page without performing public
consequences.

- Giving and checkout controls retain representative layout but cannot create
  sessions or move money.
- Forms cannot submit, send email, write CRM data, enroll a constituent, or
  trigger automation.
- Outbound embeds, pixels, analytics, chat, maps, and video players do not make
  third-party requests. Use qualified poster/placeholder states where needed.
- Internal Page and Navigation links identify their target but do not silently
  enter a mutable whole-Site preview or the public Site.
- External links do not navigate from the embedded preview. Staff may inspect
  or copy the qualified target through an explicit control.
- No service worker, prefetcher, speculative navigation, public search event,
  sitemap update, cache invalidation, social crawler, or release hook runs.

When a staff member activates an inert control, a persistent or politely
announced explanation says, for example: **Giving is disabled in Preview. View
the live page after release to test the public action.** Do not rely on a
disabled cursor, tooltip, or color alone.

This capability boundary belongs in the preview renderer, not in every custom
block. D9 certification proves that every standard and custom package respects
it.

### 6. Public-safe operational projections only

Preview uses the same allowlisted public view model as the released Site. A
staff session does not expand that view model.

Allowed examples include already public-safe ministry titles, public Page
images, public project summaries, and D14 dynamic-list results that pass their
current public eligibility projection. Prohibited examples include donor
identities, gifts, balances, internal support totals, private contact details,
staff notes, unreleased source records, hidden media metadata, and raw provider
relationships.

Dynamic content states its own freshness in accessible details when material.
An exact Page revision does not freeze or guarantee current operational source
membership unless an earlier decision explicitly does so. If source safety
changes adversely, the next preview request narrows or suppresses content; it
does not preserve a favorable stale copy.

### 7. Do not build whole-Site draft navigation in D25

The preview may render the candidate Navigation and surrounding Site chrome for
fidelity. Its links remain inert or explain their exact destination. It does
not follow `latest draft` for each destination.

A traversable preview Site requires one immutable complete D1 candidate,
closure-wide authorization, non-enumerating partial access, expiration,
resource cleanup, route and media continuation, and clear distinction from the
public Site. That is a later evidence-backed product, not a hidden extension of
Page Preview.

### 8. Do not build click-to-edit overlays in D25

Use one **Back to editor** action, restore focus to the Preview trigger or
relevant editor landmark, and preserve the editor's current position when
practical. Do not add hidden source-map strings, field-path attributes, overlay
hit targets, hover chrome, or a second iframe protocol “for later.” Dormant
instrumentation is technical debt until a measured staff problem justifies it.

## Accessibility contract

### Information and language

- The persistent phrase is **Preview — not public**.
- **View live page** appears only when an observed D1 public representation
  exists and is visually distinct from Preview.
- **Unsaved changes**, **Saving**, **Waiting for saved changes**, **Previewing
  saved revision**, **Newer saved version available**, and **Live** remain
  distinct concepts.
- Site, domain, locale, Page, path, and revision are text, not icon/color-only
  signals.
- Technical causes are translated into actionable staff language while exact
  cause codes remain in support details.

### Keyboard and focus

- Preview controls precede the frame in DOM and focus order.
- Opening the optional pane keeps focus on the control that opened it; it does
  not throw the user into the frame.
- **Focus preview** is available when an embedded view is used.
- The frame has a human title such as **Preview of About our work — Spanish —
  not public**, not a raw URL.
- The preview document begins with a skip/return affordance so keyboard users
  can leave the frame without traversing an entire Page backward.
- Closing or leaving Preview restores focus to the invoking Preview control or
  the editor heading when the original control no longer exists.
- Sticky preview chrome never obscures the focused element.
- No focus trap, custom Tab order, positive `tabindex`, or automatic popup is
  introduced.

If a cross-origin frame needs a focus-return message, that message uses the
same exact-origin, source, channel, schema, and rate validation as every other
preview message. It carries no content or authority.

### Screen readers and status

- Saving, waiting, current-revision, paused, and failure states use one bounded
  polite status region.
- Do not announce every autosave keystroke, render tick, viewport resize, or
  frame load event.
- Blocking errors are persistent and associated with the Preview action; they
  are not toast-only.
- A frame-loading skeleton has an accessible name. Once loaded, duplicate
  loading announcements stop.
- Inert giving, form, link, and embed controls expose their Preview limitation
  programmatically and visually.
- Exact technical details remain readable in a disclosure but do not flood the
  accessibility tree by default.

### Reflow, zoom, touch, language, and motion

- At 320 CSS pixels and 400% zoom, editor and preview are mutually exclusive
  full-screen modes; there is no fixed 450-pixel rail.
- Controls wrap without clipping, overlap, or horizontal page scrolling.
- Fixed-width test canvases are unavailable when the host cannot present them
  accessibly; **Responsive** remains available.
- Pointer targets meet Core's 44-pixel touch convention even though WCAG 2.2's
  AA minimum is smaller.
- `lang` and `dir` reflect the exact preview locale. Test RTL, bidirectional
  names and paths, CJK line breaking, long organization names, and translated
  viewport/status labels.
- Preview honors reduced motion, forced colors, text spacing, browser zoom, and
  user font settings. Viewport controls do not disable zoom.
- Custom D9 motion is interruptible, has a reduced-motion result, and does not
  replay continuously on every acknowledged refresh.

### Required human validation

Automated axe checks are necessary but insufficient. Test the parent workspace
and preview document independently, then run manual journeys with keyboard,
screen-reader, touch, zoom/reflow, forced-colors, reduced-motion, RTL, and slow-
network users. Cross-origin iframes must not hide inaccessible content from the
test harness.

## Security and privacy contract

### Exact server-side preview identity

Every HTML, RSC/data, media, refresh, and continuation request resolves and
reauthorizes at least:

- actor and current verified principal;
- Tenant and environment;
- Site and domain;
- Page family and stable Page id;
- exact locale lineage;
- exact acknowledged editorial and placement revisions;
- exact D1 candidate dependencies;
- D9 package/profile and compiler generation;
- allowed preview capability and route set;
- current Phase 10/source/media safety; and
- issue time, expiry, revocation, and renderer-contract version.

Authorization is server-derived. Payload ids, path segments, query parameters,
Draft Mode cookies, frame messages, previous success, and preview locators are
never authority. User-bound Payload calls keep `overrideAccess: false` and use
bounded explicit projections rather than `depth: 2` traversal.

### Session and URL posture

- Prefer the existing authenticated principal plus a short-lived server-side
  preview session bound to the exact target.
- A URL may carry a random non-authoritative lookup id. Possession alone never
  grants access.
- Do not put a bearer token, signed draft secret, raw revision data, email,
  Tenant name, or private path in query strings or fragments.
- Use Secure, HttpOnly, host-only cookies with the narrowest practical
  SameSite/path scope. Do not broaden the admin cookie to every tenant domain.
- Reauthorize on every request and after login continuation. Expiry,
  revocation, role change, Site disablement, Trash, locale disablement, or
  safety change wins immediately.
- Return non-enumerating unavailable/not-found behavior for unauthorized or
  expired targets.
- Logs may record a redacted/hash correlation id and cause code, never the raw
  session or document content.

### Response and indexing policy

Every private preview response, including errors and RSC/data, sends or proves:

- `Cache-Control: private, no-store`;
- explicit non-indexing/non-archiving intent, including `X-Robots-Tag` where
  appropriate;
- `Referrer-Policy: no-referrer`;
- no sitemap, hreflang, public canonical, Open Graph, social-card, or public
  search emission;
- no public CDN or Next.js cache population;
- no analytics, telemetry payload containing content, pixels, chat, or external
  embeds;
- a narrow CSP, including explicit parent `frame-src` and child
  `frame-ancestors` when embedded; and
- no service-worker registration or reuse of a public service-worker cache.

Authentication is the primary crawler barrier; robots directives are defense
in depth, not confidentiality.

### Embedded-frame policy

If the optional pane is qualified:

- allow only an exact configured preview origin; parse URLs before comparison;
- require the child response to allow only exact Web Studio ancestor origins;
- prefer an isolated preview origin for certified custom presentation code;
- grant only the sandbox capabilities required by the public-safe renderer;
- do not grant top navigation, forms, payments, downloads, popups, presentation,
  geolocation, camera, microphone, clipboard, or other permissions by default;
- set an explicit `Permissions-Policy`;
- validate every message's exact `origin`, `source`, protocol version, type,
  channel id, target scope, size, and rate;
- use an exact target origin for outbound messages, never `*`, a URL prefix, or
  a substring match;
- never interpret message values as code or inject them as HTML; and
- terminate the channel on navigation, target change, permission loss, expiry,
  conflict takeover, or origin drift.

If these controls are incompatible with the required custom package or browser
session model, D25 falls back to top-level exact Preview. A weaker embedded
mode is not an acceptable accessibility or security trade.

### Media and relationship policy

- The public-safe compiler requests explicit fields and bounded relationships;
  it never serializes a populated provider document wholesale.
- Every media request rechecks the same Tenant/Site/Page/locale/revision and
  release qualification. A private storage URL is not leaked into HTML.
- Missing, quarantined, replaced, or revoked media fails adverse-first with a
  qualified placeholder and private cause detail.
- Original filenames, upload metadata, storage keys, internal alt drafts, and
  staff attribution are absent unless an earlier public contract explicitly
  permits them.
- Cross-Site copied content and media gain no authority from provenance.

## Failure and recovery matrix

| Condition                              | What staff see                                                             | Safe system behavior                                                             | Recovery owner                      |
| -------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------- |
| Unsaved local changes                  | **Waiting for saved changes** over last exact revision                     | Do not transmit browser form or advance Preview                                  | D12 autosave or **Save now**        |
| Save/validation failure                | Persistent error tied to exact fields; last exact preview remains labelled | No stale revision is called current                                              | Editor fixes validation and retries |
| Outcome-unknown save                   | **Confirming saved version…**                                              | Resolve by exact receipt/read-back; never blind duplicate save or mutable latest | D12 recovery                        |
| Active-editor takeover/conflict        | **Preview paused — showing saved revision N**                              | Stop advancement and reject displaced editor updates                             | D12 conflict/takeover action        |
| Slow compile with a newer receipt      | **Updating to revision N…**                                                | Coalesce work, cancel or discard old result by revision fence                    | Preview compiler                    |
| Compiler/package incompatibility       | **Preview unavailable for this saved version** with support details        | Never fall back to generic package, raw CMS data, another revision, or live Page | D9/package owner                    |
| Dynamic source unavailable             | Page renders safe bounded empty/degraded state with freshness note         | No stale favorable or private fallback                                           | D14 source owner                    |
| Media suppressed/revoked               | Qualified placeholder and concise explanation                              | No original/private URL or cross-Site substitute                                 | Media/safety owner                  |
| Permission or session expires          | Reauthentication or non-enumerating unavailable screen                     | Clear sensitive frame; no bearer continuation or public fallback                 | Identity/authorization owner        |
| Site/locale disabled or Page trashed   | **Preview no longer available**                                            | Revoke session on next request and suppress dependent media                      | Owning workflow                     |
| Embedded frame blocked by CSP/browser  | Offer top-level exact Preview                                              | Do not relax CSP, cookie, or origin policy automatically                         | Preview delivery owner              |
| New window blocked                     | Same-tab exact Preview                                                     | Preserve exact target; no repeated popup loop                                    | Browser-facing UI                   |
| Network loss after a safe render       | **Offline — showing saved revision N from [time]**                         | Keep only already authorized in-memory rendering; no “Current” claim             | User reconnects                     |
| Authorization/safety loss after render | Clear the rendered content and show unavailable                            | Security adversity overrides convenience; do not retain a sensitive stale view   | Authorization/safety owner          |

Preview failure never mutates a Working Revision, review outcome, scheduled
appointment, release head, cache, search index, analytics stream, or public
Site.

## Ruthless adversarial review

Severity and likelihood describe the unqualified proposal, not the hardened
recommendation.

| Category                    | Material concern? | What could go wrong and why it matters                                                                                                                                                                                                    | Severity / likelihood | Permanent prevention                                                                                                                                                 |
| --------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                 | **Yes**           | A collection/id URL, mutable `latest`, deep provider population, fixed iframe rail, or assumed cookie behavior works only in a narrow happy path. Autosaves, locales, custom packages, browser privacy, and route changes break fidelity. | High / High           | Exact revision envelope, public compiler, explicit projections, top-level fallback, conformance tests at the pinned provider/browser matrix.                         |
| Technical debt              | **Yes**           | A separate admin renderer, duplicated preview statuses, provider event schema, or dormant overlay metadata becomes a second CMS/public runtime to maintain.                                                                               | High / High           | One compiler/view model, one status vocabulary, one provider-neutral preview port; remove/contain the mutable bridge; cut overlays.                                  |
| Edge cases                  | **Yes**           | Save races, older render completion, session expiry, takeover, disabled locale, trashed Page, revoked media, popup blocking, RTL, or low bandwidth can show the wrong Page or trap the user.                                              | High / Medium–High    | Revision fencing, explicit state machine, adverse-first matrix, responsive fallback, locale and permission tests.                                                    |
| Footguns                    | **Yes**           | “Authenticated” can be mistaken for authorized; **Preview** can accidentally mean live; links/forms can trigger real effects; a token can be copied from a URL; icon controls can hide purpose.                                           | High / High           | Exact plain-language copy, side-effect-dark capability, no bearer URLs, named controls, separate **View live page**.                                                 |
| Tenant safety               | **Yes**           | A forged id, stale session, populated relationship, media URL, Navigation link, or message can cross Tenant/Site/locale boundaries or reveal existence.                                                                                   | Critical / Medium     | Server-derived composite scope, request-by-request authorization, explicit projection, non-enumerating errors, hostile cross-scope tests.                            |
| Overengineering             | **Yes**           | Whole-Site candidates, click-to-edit, CRDT/presence, raw per-keystroke live transport, and arbitrary device catalogs solve future problems while multiplying risk.                                                                        | Medium–High / High    | Page-local acknowledged Live Preview plus pinned exact view only; no overlays, staging Site, or collaboration engine.                                                |
| UX/UI and user friction     | **Yes**           | Multiple preview buttons, stale tabs, noisy status, cramped split panes, fixed device frames, popup surprises, or unclear saved/live truth reduce staff confidence and late-stage quality.                                                | High / High           | One Preview action, quiet exact status, wide-only pane, full-screen fallback, explicit new-tab warning, representative ministry usability tests.                     |
| Hidden coupling             | **Yes**           | Preview can become coupled to Payload `_status`, form JSON, relationship depth, Next Draft Mode, D9 component internals, or current route shape.                                                                                          | High / High           | Versioned Asym preview envelope and public view model; adapters and contract fixtures isolate providers/packages.                                                    |
| Failure modes               | **Yes**           | A failed save/compile/source request may silently show old, live, generic, mixed-locale, or raw content and create false release confidence.                                                                                              | Critical / Medium     | Cause-owned fail-closed states; last safe revision labelled stale only when authorization remains valid; no favorable fallback.                                      |
| Data integrity              | **Yes**           | Out-of-order renders or mutable latest can make a reviewer approve a different revision; preview actions could create extra versions or side effects.                                                                                     | Critical / Medium     | Exact D12 receipts, immutable pinned targets, one in-flight render, revision fence, Preview as read-only with no history side table.                                 |
| Security and privacy        | **Yes**           | Raw form messages, URL tokens, permissive CSP/origins, same-origin custom code, external embeds, or logs can expose drafts and private operational data.                                                                                  | Critical / Medium     | Public-safe DTO only, normal reauthorized session, no bearer URL, narrow CSP/Permissions Policy, isolated origin where viable, strict messages, no external effects. |
| Scalability and performance | **Yes**           | Per-keystroke rendering, deep population, large custom Pages, many frames, and uncancelled compiles can overwhelm browser, database, and server.                                                                                          | High / Medium–High    | Acknowledged/coalesced updates, one active render/editor, explicit query budgets, cancellation/stale discard, lazy optional pane, performance SLOs.                  |
| Operational burden          | **Yes**           | Long-lived preview sessions, orphan candidates, tenant breakpoint settings, browser-specific cookie workarounds, and package-specific exceptions require continual intervention.                                                          | Medium–High / Medium  | Short-lived derived sessions, no private Site environments, small code-owned widths, certified package contract, coarse automated cleanup.                           |
| Observability gaps          | **Yes**           | Staff see stale or failed preview while operators cannot distinguish save, auth, compile, source, media, CSP, or origin failure.                                                                                                          | High / High           | Cause-coded metrics/traces for issue, auth reject, compile latency, stale discard, frame failure, and recovery—without content or secrets.                           |
| Dependency and integration  | **Yes**           | Payload internal v4 and Next preview versions may change iframe, message, draft, cache, or auth mechanics; third-party embeds may track users.                                                                                            | High / High           | Exact-pin implementation audit, provider-neutral adapters, lockstep conformance suite, no third-party runtime in Preview.                                            |
| Migration and upgrade       | **Yes**           | Persisting provider form JSON, message schemas, or preview snapshots makes Payload/Next/package upgrades and exports expensive.                                                                                                           | High / Medium         | Store only existing exact revisions and stable semantic inputs; version the preview envelope/compiler; no provider-specific preview records.                         |
| Other development hazards   | **Yes**           | Race conditions, deploy skew, stale client bundles, popup/opener access, frame redirects, weak rollback, and inadequate assistive-technology tests remain.                                                                                | High / Medium–High    | Generation compatibility checks, `noopener`/`noreferrer`, redirect-origin validation, kill switch/top-level fallback, public-seam tests, accessible manual QA.       |

## Ruthless synthesis and order of work

### Must be settled in the D25 contract

1. Define Preview as exact, private, public-safe, side-effect-dark rendering—not
   an iframe, Draft Mode cookie, or Payload feature.
2. Require D12 acknowledgement before Preview advances. Reject per-keystroke raw
   form transport as D25 product truth.
3. Define two presentations of one product: optional Page-local acknowledged
   Live Preview and stable pinned exact Preview.
4. Bind exact Tenant/environment/Site/domain/Page/locale/revision/candidate/
   package/compiler/safety identity and reauthorize every request.
5. Require the D1/public compiler and exact D9 package. Forbid a second admin
   renderer and raw relationship traversal.
6. Require private delivery headers, no public caches/search/analytics, inert
   effects, strict media/data projection, and non-bearer sessions.
7. Require full-screen accessibility, wide-only split pane, named widths, exact
   iframe title/focus behavior, and quiet status semantics.
8. Explicitly exclude whole-Site navigation, click-to-edit overlays, multiple
   live editors, and a per-keystroke persistence/history system.

### Must be proven before shipping

1. Replace or narrowly contain the current mutable collection/id preview route.
2. Prove semantic and visual parity for every standard and certified D9 package
   using the same exact inputs.
3. Prove revision fencing across autosave, Save now, later edits, conflict,
   takeover, review, schedule, restore, Trash, and deploy skew.
4. Prove hostile cross-Tenant/Site/locale/revision/actor/media/message requests
   fail without enumeration or fallback.
5. Prove response headers, cache absence, index/search/analytics absence,
   referrer suppression, frame policy, session expiry/revocation, and token
   absence from URLs and logs.
6. Prove no private field or active consequence can escape through source,
   HTML, RSC/data, relationship population, media, custom packages, errors, or
   third parties.
7. Prove keyboard, screen reader, focus return, frame title, 320 CSS-pixel
   reflow, 400% zoom, touch, forced colors, reduced motion, RTL/CJK, slow
   network, low-end device, and popup-blocked journeys.
8. Test with representative ministry communications staff, occasional editors,
   missionary contributors, reviewers, and schedulers. Measure task completion,
   interpretation of saved/preview/live states, recovery, and confidence—not
   visual preference alone.

### Address soon after launch evidence exists

- Tune acknowledged-preview debounce/coalescing and package performance budgets
  from measured use.
- Improve cause copy and support diagnostics from observed failures.
- Revisit whether exact Preview should remember responsive width per user and
  device; do not make it tenant content configuration.
- Consider whole-Site immutable candidate preview only if Page-local preview
  measurably fails coordinated Navigation/multi-Page release journeys.
- Consider click-to-edit only if research shows field discovery remains a major
  staff bottleneck after ordinary Back-to-editor context restoration improves.

### Monitor without building speculative machinery

- Browser third-party-cookie, framing, storage-partitioning, and popup-policy
  changes.
- Payload v4 and Next.js preview-line behavior at every exact dependency bump.
- Preview compile p50/p95/p99, stale-result discard, frame failures, session
  expiry, permission rejection, top-level fallback use, and low-end-device
  responsiveness.
- D9 custom-package preview/public parity and accessible-motion regressions.
- Staff confusion between **saved**, **previewed**, **scheduled**, **released**,
  and **live**.

## Verification matrix for implementation tickets

| Proof area        | Required observable examples                                                                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Exactness         | Open revision 42; save revision 43; refresh the pinned view and still receive 42; explicitly choose newer and receive 43.                                                             |
| Autosave race     | Generate receipts 42 and 43 with render 42 slower; only 43 may become the acknowledged Live Preview current state.                                                                    |
| Failure truth     | Break save, compiler, package, source, and media independently; no path may show live, generic, raw, another locale, or another revision as a fallback.                               |
| Tenant isolation  | Attempt every HTML/RSC/data/media/message/session route with another Tenant, Site, locale, Page, revision, actor, and copied source id.                                               |
| Session safety    | Expire, revoke, replay, copy, log, navigate, and reauthenticate; a URL alone never grants preview and no raw secret appears in history/referrer/logs.                                 |
| Framing           | Test exact and hostile parent/child origins, redirects, `event.source`, malformed/oversized/rate-spammed messages, CSP, sandbox, Permissions Policy, and top-level fallback.          |
| Data minimization | Assert prohibited donor, giving, staff, contact, note, metadata, storage, and unreleased source fields are absent from HTML, JSON/RSC, messages, logs, errors, assets, and analytics. |
| Side effects      | Activate every CTA, form, embed, link, video, tracking, prefetch, and custom block; observe zero external or business consequence.                                                    |
| Accessibility     | Complete Preview, width change, focus preview, return, error recovery, exact open, and editor return with keyboard and screen reader at 320 CSS px/400% zoom.                         |
| Localization      | Preview exact RTL/CJK/bidirectional locales with missing fields and long labels; observe exact `lang`/`dir` and no field fallback.                                                    |
| Performance       | Type/save on large standard and D9 custom Pages under slow CPU/network; prove bounded request rate, one active render, stale cancellation, and responsive editor input.               |
| Operability       | Dashboard and trace distinguish save/auth/compiler/package/source/media/frame causes without recording content, credentials, or raw session ids.                                      |

## Sources

### Core and ratified contracts

- [D25 contract and repository audit](./phase-23-d25-preview-contract-and-repository-audit.md)
- [Web Studio README](../../../../apps/admin/src/cms-ui/web-studio/README.md)
- [Current authenticated preview route](<../../../../apps/admin/app/(payload)/web-studio/preview/%5Bcollection%5D/%5Bid%5D/page.tsx>)
- [Current preview URL adapter](../../../../apps/admin/src/cms-ui/web-studio/adapters/preview-url.ts)
- [Current native editor](../../../../apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/NativeCollectionEditView.tsx)
- [Current editor state](../../../../apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/editor-state.ts)
- [Current public renderer](../../../../packages/lib/cms/public-page-renderer.tsx)
- [Preview URL tests](../../../../tests/unit/cms/web-studio-preview-url.test.ts)
- [Preview model tests](../../../../tests/unit/cms/web-studio-authenticated-preview.test.ts)
- [CMS publish-flow E2E](../../../../tests/e2e/cms-publish-flow.spec.ts)
- [CMS local happy-path E2E](../../../../tests/e2e/cms-local-happy-path.spec.ts)

### Primary platform and security sources

- [Payload Live Preview](https://payloadcms.com/docs/live-preview/overview)
- [Payload client-side Live Preview](https://payloadcms.com/docs/live-preview/client)
- [Payload Preview](https://payloadcms.com/docs/admin/preview)
- [Next.js Draft Mode](https://nextjs.org/docs/app/api-reference/functions/draft-mode)
- [OWASP HTML5 Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html)
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [W3C Content Security Policy Level 3](https://www.w3.org/TR/CSP/)

### Primary accessibility and comparative CMS sources

- [WCAG technique H64 — iframe titles](https://www.w3.org/WAI/WCAG22/Techniques/html/H64)
- [WCAG 2.2 focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order)
- [WCAG 2.2 reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow)
- [WCAG 2.2 status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages)
- [WCAG technique G201 — warning before a new window](https://www.w3.org/WAI/WCAG22/Techniques/general/G201)
- [WCAG 2.2 target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)
- [WCAG 2.2 focus not obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum)
- [Contentful Live Preview](https://www.contentful.com/developers/docs/tutorials/preview/live-preview/)
- [Contentful Inspector Mode](https://www.contentful.com/developers/docs/tutorials/preview/inspector-mode/)
- [Sanity visual-editing overlays](https://www.sanity.io/docs/visual-editing/visual-editing-overlays)
- [Sanity preview and Page building](https://www.sanity.io/docs/user-guides/preview-and-page-building)

## Final recommendation

Adopt one exact Preview product with two bounded presentations: an optional
Page-local Live Preview that follows only acknowledged D12 revisions, and a
pinned full-Page exact Preview for deliberate review and scheduling. Use the
real public-safe compiler and exact D9 package, make every consequence inert,
reauthorize every request, keep secrets out of URLs and messages, and make the
top-level exact view the universal accessible fallback.

Do not ship per-keystroke raw form preview, mutable whole-Site navigation,
click-to-edit overlays, a second admin renderer, or a weaker embedded mode. The
result gives ministry staff fast visual confidence without turning Preview into
a second publication system, a security exception, or a maintenance burden.
