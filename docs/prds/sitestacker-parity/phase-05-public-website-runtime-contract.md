# Phase 5 — Public Website Runtime Contract

> **Program:** SiteStacker Parity · **Phase:** 5 · **Status:** Groomed (grill-with-docs, 2026-07-05) · **Base:** `develop`
> **Predecessors:** Phase 2 (Site, Locale & Currency) · Phase 3 (Minimum Permission & Role-Scoped Projection) · Phase 4 (Identity & Account-Claiming)
> **Charter / matrix:** `docs/prds/sitestacker-parity/README.md`, `parity-matrix.md`

Modern SiteStacker parity for **how the public tenant website actually runs** — where public pages live, how a request resolves which ministry it belongs to, how published content is fetched safely, how staff preview drafts, how a "Give" button hands off to checkout, and how it all caches — **without ever crossing a tenant boundary and without letting a draft reach the public.** This is a **contract-and-hardening** phase, not a greenfield build: the public tenant website, Payload CMS, Web Studio, and the donor/missionary portals already ship in production (product phases 06/07/09). Phase 5 writes down the runtime contract those surfaces already depend on, hardens the two real defects in it, reserves the forward seams that Phases 2/4 fill, and proves the whole contract end-to-end with **one page type** — built as a template so every later public page extrapolates from it rather than reinventing it.

---

## Problem Statement

The public tenant website is **already live** — visitors hit tenant-branded public pages in the donor app, those pages pull published content from Payload CMS through the admin app, and a "Give" button carries a missionary and an amount into checkout. But the **rules of that runtime are implicit**, and two of them are unsafe. Four concrete gaps block every deeper public feature (public missionary/project pages backed by real records, event and campaign pages, public giving, donor-portal continuity):

1. **Tenant-and-published safety is hand-written, with no safety net.** Every public read runs Payload's Local API with `overrideAccess: true` (which _skips_ access control) plus a hand-written `where` clause for tenant + published. Isolation therefore depends on every query author remembering the right clause — and one already forgot: the public navigation route returns unpublished content because it omits the published filter. There is no structural guard that a public read cannot cross a tenant or expose a draft.

2. **There is no single public-content contract, and the public site is welded to the admin app.** The "resolve tenant → fetch published → serialize" logic is split across two apps with the rules living implicitly in that split. A future `apps/web`, or any second consumer, must re-derive them; and because every public read is a live call into the admin app, the public website is only as available and as fast as the staff app.

3. **The checkout handoff is a client-validated prototype.** The "Give" CTA passes references as trusted URL parameters, the worker is looked up from mock data, validation happens in the browser, and the handoff carries no site, source code, currency, locale, or entry method. On a multi-tenant money path this is an integrity hazard, and it is not enumeration-safe (a requirement Phase 4 places squarely on this form).

4. **Preview, publish, cache-invalidation, and domain-resolution rules are undocumented.** Draft preview renders in a separate admin template that can drift from the live page; there is no defined cache-tag scheme or publish-driven invalidation; domain resolution is tenant-level and admin-side only, and it trusts a client-supplied `?tenant=` override. Without a settled contract, the next public features (projects, events, campaigns) will each invent their own fetchers, preview paths, checkout handoffs, and cache rules — the exact duplication and drift this program exists to prevent.

If we build deeper public pages before this contract is settled and hardened, every module invents its own public runtime, a forgotten filter leaks a draft or another tenant's page, and the money path trusts the client. The recon for this phase confirmed the delivery machinery largely already exists (a published-only tenant-scoped public API, a real public serializer, a safe authenticated preview); what is missing is the **contract that makes it safe by construction, one owner for the rules, and the forward seams** that let Phases 2/4 slot in without a rewrite.

## Solution

A **shared, server-only public-content contract** — one choke-point that every public read and every giving CTA flows through — plus the hardening of the two live defects, plus **one proof slice** that exercises the whole contract, tenant-rooted for today's reality with **reserved seams** for Phase 2 (site / domain / locale / currency / source-code) and Phase 4 (identity / claiming). Nine moving parts, built from the visitor's and editor's point of view so the site stays fast and native while the safety work happens underneath:

1. **One public-content contract package.** A server-only shared package owns the **published-content reader interface**, the **allowlist serializer**, the **CTA/checkout resolver**, the **cache-tag scheme**, and the **public request context** type. Consuming apps depend on the package's serialized output and types — never on raw Payload documents or the `cms` schema — so the public runtime is decoupled from Payload's internals and a future `apps/web` extraction is a re-import, not a rewrite.

2. **Defense-in-depth isolation, safe by construction.** Public content is readable **only** through one choke-point that takes the resolved tenant (and reserved site) as a **required argument**, always applies the tenant-and-published constraint, runs under `overrideAccess: false` with an explicit **public-read access policy** (so Payload independently enforces isolation), returns **empty on an unresolved tenant** (never unfiltered), and is guarded by a **hard-blocking lint** that forbids raw Payload reads in public paths. The one shipped draft-leak (navigation) is fixed by routing it through the same choke-point.

3. **Host-based tenant/site resolution, fail-closed.** A public request resolves its tenant **only from the platform-trusted host** (never a client-supplied parameter in production), returning a **unified public request context** — operational tenant id + CMS tenant id + a reserved `siteId` — and failing closed to a neutral "site not found" on an unknown host or disabled tenant/site.

4. **Reference-not-copy between CMS and operations.** CMS pages store **references** to operational records (missionary, fund) and presentation content — never money or identity truth. The runtime resolves and **validates** each reference at read time (exists, belongs to this tenant, public-eligible); operational truth wins for identity/money/existence, CMS wins for presentation; a dangling or cross-tenant reference **fails safe**. Public page identity is a **presentation identity** linked to — not equal to — the operational record.

5. **A server-validated, enumeration-safe checkout handoff.** The "Give" CTA hands off through a resolver, not hand-rolled URLs; checkout **re-resolves and validates every reference server-side** against the resolved tenant before it renders or charges; a preset amount is a re-validated suggestion, never a trusted charge value; the giving form is **enumeration-safe and constant-time** (Phase 4's rule, enforced at this surface), never pre-filling a name or offering a saved card to an unauthenticated session; invalid links fail to a friendly "give another way," never a mis-designated gift.

6. **Function-level tagged caching with prompt, tenant-safe invalidation.** Published reads are cached with `use cache` + `cacheTag`, keyed by the **tenant passed as an argument** (isolation) and **tagged by tenant/document** (invalidation), never with route-segment config. Publishing emits a **secured admin→public-runtime signal** that revalidates the right tags globally, with a **bounded-staleness backstop** so a missed signal self-heals within minutes.

7. **Faithful, safe preview via Next.js Draft Mode.** Staff preview renders the **real page** (not a separate template) through the same reader with drafts on, behind a signed-secret route that authenticates the user, checks the tenant, enables Draft Mode (which makes the request dynamic so drafts are never cached), and marks the response `noindex`. A shareable non-staff review link and real-time Live Preview are reserved.

8. **Guest-first identity continuity.** Browsing and abandoned forms create no
   donor or commitment record. A one-time donor record is created only on a
   **completed gift** (Phase 4's unclaimed-donor lifecycle). _(Amended
   2026-07-13 for Phase 16 recurring giving: once the processor accepts a
   recurring authorization and returns a durable initial-payment state, the
   idempotent server saga persists the donor, recurring agreement, occurrence,
   and attempt even when an ACH payment is still processing. Processing is
   labeled processing—not received, paid, or receipted—and a failed
   pre-acceptance handoff creates no successful arrangement.)_ The
   tenant-branded thank-you **invites — never forces** — a magic-link account
   claim into the donor portal; the applicable receipt or truthful processing
   confirmation is the always-on continuity. Phase 5 owns the public surface
   and honors Phase 4's rules; Phases 4/16 own the identity and recurring
   services behind it.

9. **A generalizable proof slice.** One page type — the missionary giving page — is refactored from mock data onto the full contract (resolve → isolated published read → serialize → resolve/validate references → enumeration-safe validated handoff → cache/invalidate → Draft Mode preview), built as **configuration over the shared primitives** so a project, event, or campaign page later is "add a config and a renderer," not "rebuild the plumbing."

Underneath, the contract is written **at the Asym boundary** (serialized output, a transport-agnostic reader, a public request context) so Payload's pre-release churn stays invisible above it, and it **reserves** every Phase-2/3/4 seam — site/domain/locale/currency/source-code, the identity/claim services, the giving cart, events/campaigns — so the full public website installs later without re-pointing anything.

---

## User Stories

### Public visitor

1. As a **public visitor**, I want a ministry's public page to load fast and feel like _their_ site, so that giving feels native and trustworthy.
2. As a **public visitor**, I want the page shell to appear instantly while live details fill in, so that I never stare at a blank loading screen.
3. As a **public visitor**, I want to only ever see _this_ ministry's content, so that I never encounter another organization's information.
4. As a **public visitor**, I want to never see unpublished or draft content, so that what I read is what the ministry intends to be public.
5. As a **public visitor**, I want a clear "site not found" page when I reach an unknown or disabled address, so that I'm never shown the wrong ministry by mistake.
6. As a **public visitor**, I want a "Give" button to take me to a checkout already designated to the right missionary or fund, so that giving is one step.
7. As a **public visitor**, I want a broken or expired giving link to show a friendly "give another way" message, so that my intent to give isn't lost and my gift is never mis-directed.
8. As a **public visitor on a phone**, I want the public pages and checkout to be responsive and accessible, so that I can give from any device.

### Donor

9. As a **first-time donor**, I want to give as a guest without creating an account, so that nothing blocks my gift.
10. As a **returning donor giving with the same email**, I want my gift quietly attributed to my existing record, so that my history stays unified without my doing anything.
11. As a **donor**, I want the giving form to reveal nothing about whether my email is already on file (in identical time), so that no one can probe the site to learn who gives.
12. As a **donor**, I want the form never to pre-fill my name or offer my saved card to an unauthenticated session, so that a stranger typing my email can't obtain my identity or payment method.
13. As a **donor**, I want an emailed receipt whether or not I make an account, so that I always have my record.
14. As a **donor**, I want the thank-you page to offer — but never force — a one-click magic-link way to set up access, so that claiming an account is easy and optional.
15. As a **donor whose gift is anonymous**, I want my identity masked on public surfaces, so that my anonymity is honored.
16. As a **donor**, I want every public page and email to carry the ministry's branding, so that I experience their ministry, not a platform.

### Missionary

17. As a **missionary**, I want my public page to show my real information and live support progress, so that supporters see accurate, current detail.
18. As a **missionary**, I want to preview a draft of my page (via a shared link) before it goes live, so that I can review changes.
19. As a **missionary**, I want to be unable to publish public pages directly, so that public content stays under the ministry's editorial control.
20. As a **missionary who is also a donor**, I want my public page and my donor self-service to stay separate, so that neither leaks into the other.

### Content editor / staff (Web Studio)

21. As a **content editor**, I want preview to render the _real_ published page with my draft data, so that what I see is exactly what will go live.
22. As a **content editor**, I want a draft to never be reachable through a public URL, so that unfinished work never leaks.
23. As a **content editor**, I want my published change to appear on the public site promptly, so that I'm not waiting on a cache timer.
24. As a **content editor**, I want a change I publish to affect only the right ministry (and, later, the right site), so that I never accidentally alter another tenant's page.
25. As a **content editor**, I want preview links I share to expire and never be indexed by search engines, so that drafts stay private.

### Finance

26. As **finance staff**, I want every public-checkout gift to carry its site, source code, and entry method, so that attribution and reporting are accurate.
27. As **finance staff**, I want receipts to record the locale they were rendered in and reflect the legal donor at the time of the gift, so that records are accurate even after later edits.
28. As **finance staff**, I want checkout confirmation and receipt emails to respect donor contact preferences, so that we stay compliant.

### Admin / organization

29. As a **tenant admin**, I want our public website to feel wholly our own — our domain, our branding, our tone, our emails — so that supporters experience our ministry.
30. As a **tenant admin**, I want complete assurance that no public page, cache entry, or giving link can leak or cross to another tenant, so that our supporters' experience is isolated.
31. As the **organization**, I want one delivery contract that every future public feature uses, so that projects, events, and campaigns are consistent and safe rather than one-off.

### Developer / system (guardrails)

32. As a **developer**, I want one choke-point for all public content reads with the tenant as a required argument, so that isolation can't be forgotten.
33. As a **developer**, I want public reads to fail closed (return nothing) when no tenant resolves, so that the worst-case bug is "site not found," not "serve everyone."
34. As a **developer**, I want a hard-blocking lint that forbids raw Payload reads in public code paths, so that the choke-point can't be bypassed.
35. As a **developer**, I want the public cache keyed by the tenant argument (not just tagged), so that one tenant's page can never be served from another's cache.
36. As a **developer**, I want the public runtime to depend on a serialized contract, not raw Payload documents, so that Payload's internals and pre-release churn stay invisible above the boundary.
37. As a **developer**, I want a new public page type to be "add a config and a renderer" over the same primitives, so that later public features extrapolate rather than rebuild.
38. As a **developer**, I want the admin→public publish-invalidation signal to be secured (signed, constant-time verified), so that no one can force cache purges.
39. As a **developer**, I want no route-segment cache config anywhere in the public app, so that the build stays green under Cache Components.
40. As a **developer**, I want checkout to validate every operational reference server-side against the resolved tenant, so that a tampered or stale link can't mis-designate a gift.
41. As a **future developer**, I want the reader, serializer, resolver, cache, and preview to already carry reserved `siteId`, `source_code`, `currency`, `locale`, and `entry_method`, so that Phase 2 populates values without re-plumbing checkout or content resolution.

---

## Implementation Decisions

### A. Architecture rulings (the settled decisions)

- **A1 — Scope: contract + hardening + one proof slice (not greenfield, not the full public build).** The public tenant website already ships (product phases 06/07/09). Phase 5 formalizes and hardens the runtime contract, tenant-rooted for today's reality (one site per tenant, one domain per tenant, USD, no per-content locale), with **forward-compatible seams** for Phases 2/4, and proves it with one page type. It builds **no Phase-2 tables** and **no Phase-3/4 services** — it reserves and consumes them. The word **"channel" is retired as a gift-attribution concept** (consistent with Phase 2 A5); it is not a public-runtime concept.
- **A2 — Public Website is a product surface in `apps/donor`, `apps/web` reserved.** The public tenant website is a surface, not (yet) a separate app; it lives at the `(public)` route group in the donor app, per the platform-surfaces intent. No `apps/web` is created now; the contract is written so a future extraction is a re-import.
- **A3 — One server-only public-content contract package (the choke-point home).** A shared package under `packages/api` owns the published-content reader **interface**, the allowlist **serializer**, the CTA/checkout **resolver**, the **cache-tag scheme**, and the **public request context** type. It is server-only (enforced by a build check), and **dependencies point into it** (admin/donor/future-web depend on the package; the package never imports Payload or the admin app). Chosen over an admin-side-only or donor-inline home because CMS public delivery is business logic with one documented boundary (`data-access-boundary.md`), and one owner for the safety rules keeps apps thin and future extraction cheap.
- **A4 — Transport-agnostic reader; single Payload read co-located in admin; availability seam designed-not-built.** The package defines a `PublishedContentReader` interface returning serialized public types; exactly one concrete implementation touches Payload's Local API, co-located where Payload runs (admin). The transport between the public runtime and that reader (HTTP today) is a swappable implementation detail; consuming pages read only through the package client, never a hard-coded admin URL. The cache-tag scheme is built now so public reads are cacheable; an alternate transport that removes admin from the hot read path (CDN/replica) is a reserved capability with an explicit trigger (an `apps/web` extraction or an availability SLO).
- **A5 — Defense-in-depth isolation, fail-closed by construction.** Public content is read **only** through the choke-point. The resolved tenant (and reserved site) is a **required typed argument** (isolation can't be forgotten); the choke-point always applies the tenant-and-published constraint; an unresolved tenant returns **empty, never unfiltered**; the read runs `overrideAccess: false` under an explicit **public-read access policy** ("anonymous ⇒ published + resolved tenant only") so Payload independently enforces isolation; the policy is **extensible** for future restricted-content predicates. A permanent **negative test** and a hard-blocking **sole-entry lint** (no raw Payload reads in public paths) back it. RLS is _not_ relied on for the CMS schema (the Payload role bypasses it — see A15). This retires the shipped `overrideAccess: true` + hand-written-`where` pattern that already leaked navigation.
- **A6 — Host-based, server-controlled resolution; unified context; `?tenant=` dev-only.** A public request resolves tenant/site **only from the platform-trusted host** on production public routes; any client-supplied tenant assertion (`?tenant=`) is dev/preview-only and env-gated. Resolution returns a **unified public request context** — operational tenant id (for funds/missionaries/checkout) + CMS tenant id (for content) + reserved `siteId` — derived from a single mapping lookup, cached at the edge (Edge Config) for sub-10ms resolution. Unknown host or disabled tenant/site **fails closed** to a neutral "site not found." Today's mapping (host→tenant) is wrapped behind the resolver so Phase 2's `public.sites` host→site→tenant model re-points the source of truth without changing callers.
- **A7 — Reference-not-copy CMS↔operational; operational-wins; presentation identity.** CMS stores stable operational references + presentation content, never money/identity truth. The runtime resolves and validates each reference at read time (exists, belongs to the resolved tenant, public-eligible); references are batched and cached; live operational data (e.g., support progress) is read, never copied into CMS. On drift, operational truth wins for identity/money/existence/permission and CMS wins for presentation; a dangling or cross-tenant reference **fails safe** (hide the CTA / 404), never a charge to a stale designation. **Public page identity is a presentation identity linked to the operational record** — enabling display names, family/team pages (one page → several records, with an explicit designation target), restricted-country suppression, slugs, and independent publish state. Graceful degradation distinguishes an _invalid reference_ (hide/refuse) from a _transient operational outage_ (retry/degrade the affected element, not the whole page).
- **A8 — Server-validated, enumeration-safe checkout handoff; plain params; reserved fields.** The CTA hands off through the package's resolver, not hand-rolled URLs; the transport is **plain query parameters that checkout re-validates server-side** (a signed token is redundant once the server re-resolves). Checkout re-resolves and validates every operational reference against the resolved tenant and public-eligibility before rendering or charging; a preset amount is a re-validated suggestion, never a trusted charge value. The **giving form is enumeration-safe and constant-time**, never pre-filling a name or offering a saved card to an unauthenticated session (Phase 4's six safety rules, enforced at this surface; Phase 4 owns the `attributeGuestGift` service behind it). The handoff carries **reserved fields plumbed now, populated later**: `site_id`, `source_code` (attaches at the CTA/link level; a page may have several CTAs with different codes), `currency`, `locale`, and `entry_method = 'public_checkout'` (Phase 2 vocabulary). Alongside those five, the handoff also reserves **opaque pass-through seams** for the credit model: a **tribute/honor-memorial annotation** (`tribute_type` + `honoree` + a notify-party reference) and a **giving-intent hint** (`daf_intent`, `matching`/`employer_intent`), plus a **`party_kind` hint** (default `person`; org routing carried by `org_type` — amended from `party_type`/`individual` 2026-07-06, per Phase 9 C2). These are reserved pass-through fields plumbed now and **populated by a later phase (Phase 7 credit model)**, so adding tribute/DAF/matching capture — or routing an org/church/DAF public gift to the right party — never re-opens the resolver contract; Phase 5 builds no capture UI for them. Single designation now; a giving-cart multi-line seam is reserved, not built. Checkout stays public-facing.
- **A9 — Function-level tagged caching + secured publish-invalidation signal + bounded-staleness backstop; no route-segment config.** Published reads use `use cache` + `cacheTag`; **cache-key isolation comes from passing the tenant as an argument** (tags are for invalidation only — a tag alone does not separate cache entries), giving triple-layer tenant isolation (tenant argument + Vercel's host-in-cache-key + tenant-derived tags). Tags are tenant/document-derived, mandatory by construction, and respect platform limits (no commas, bounded length via stable ids not long slugs, consistent casing); `site`/`locale` tag dimensions are reserved. Publishing (and nav/redirect/media/CTA changes) emits a **secured admin→public-runtime invalidation signal** (HMAC-signed, constant-time verified) that calls `revalidateTag(..., "max")` in the public app's route handler, propagating globally in ~300ms; a **bounded `cacheLife` expire** (~1 hour, not "never") is the self-healing backstop. **No route-segment `revalidate`/`dynamic`/etc.** anywhere in the public app (build-breaking under Cache Components per `runtime-map.md`). Request-specific values (host/headers, draft state) are read _outside_ `use cache` and passed as arguments.
- **A10 — Preview via Next.js Draft Mode in the public runtime; Live Preview deferred.** Staff preview renders the **real page** through the shared reader with drafts on, behind a signed-secret route that validates the secret, **authenticates the staff user, checks the tenant**, enables Draft Mode (the bypass cookie makes the request dynamic, so drafts are never cached or served from the published cache), redirects to a **validated internal path** (open-redirect guarded; the token is never left in the redirected URL), and marks the response **`noindex`**; it reads with `overrideAccess: false` (stricter than Payload's example, so a tenant-A staffer can't preview tenant-B drafts) and offers an exit-preview. The shipped admin-template preview remains an interim until the Draft-Mode public preview is proven. A **shareable non-staff review token** (short-lived, document-and-tenant-scoped, with a middleware timestamp check since the Draft Mode cookie has no auto-expiry) and **Payload Live Preview** (real-time iframe; needs `frame-ancestors` CSP; worth it at 5–10+ editors) are reserved.
- **A11 — Guest-first identity continuity (Phase 4 seam).** Browsing creates no donor/CRM record — only minimal client-side, consented, expiring attribution/checkout-prep context (no server person-record until a gift). A donor record is created on a **completed gift only** (via Phase 4's `attributeGuestGift`); an abandoned checkout creates nothing (recovery is a later, consent-gated feature). The tenant-branded thank-you **invites, optionally and never pushily,** a magic-link claim into the authenticated donor portal (Phase 4's claim service); the emailed receipt is always sent and is the always-on continuity; the reveal-gate (Phase 3 resolver) is respected. The public surface does **not** resolve household/org identity — Phase 7 owns the party spine and the frozen-snapshot party fields (via `attributeGuestGift`); Phase 5 only carries the reserved `party_kind` hint (default `person` for the guest public path; org routing carried by `org_type` — amended 2026-07-06, Phase 9 C2) so an org/church/DAF gift routes to the correct party resolution later without re-plumbing checkout, and the frozen legal-donor snapshot the thank-you/receipt reference is party-kind-aware (`person` for this guest public path). Phase 5 builds the public surface and honors the rules; it builds no attribution/claim/reveal-gate/invitation service.
- **A12 — Public-web mechanics.** Reserve the future public route families now (`/give`, `/projects[/…]`, `/events[/…]`, `/campaigns[/…]`, `/updates/[slug]`, `/thank-you`, `/sitemap.xml`, `/robots.txt`, `/preview`) so later phases don't collide; keep checkout public at `/checkout` and the donor dashboard authenticated. CMS/Web Studio owns slugs, SEO metadata, and redirects (per-site/locale reserved); the public runtime enforces a canonical domain + canonical URL, generates per-tenant `sitemap.xml`/`robots.txt`, applies `noindex` to preview/draft, and 301s renamed slugs from a CMS-owned redirect map. Public media comes only through the allowlist serializer's public fields (the `media` collection is already tenant-scoped), served via `next/image`; private/CRM uploads are never public media; raw Payload media objects are never exposed. **Error behavior:** unknown host → neutral "site not found"; valid tenant + missing page → a **tenant-branded 404**; errors → a tenant-branded error boundary. The Missionary Workspace never calls Payload directly and never publishes; missionary-initiated changes become requests/role-scoped drafts through Web Studio's publish flow (a later workflow phase) — Phase 5 reserves this seam.
- **A13 — Baseline public security posture.** The public runtime sets baseline security headers (a content-security policy, HSTS, `X-Content-Type-Options`, `Referrer-Policy`) appropriate to a public site; the `frame-ancestors` directive needed for Live Preview is reserved to that later work. Per-email/per-IP **rate limiting + CAPTCHA-on-abuse** on the giving form and preview-token endpoints is reserved as defense-in-depth, explicitly congruent with Phase 4's reserved enumeration hardening (constant-time attribution is necessary but not sufficient).
- **A14 — The proof slice is a generalizable template.** The missionary giving page (`/workers/[id]`, backed by the `missionary-giving-pages` collection) is refactored from mock data onto the full contract; it is the fullest single test (resolution, isolated published read, serializer, reference resolve/validate, enumeration-safe validated handoff, cache/invalidate, Draft Mode preview) and converts a mock page into a real one. It is built as **configuration over the shared primitives** — the collection, operational-reference type, renderer, and route family are parameters — so a project/event/campaign page later is a new config + renderer, not new plumbing. The slice proves the contract **up to a validated handoff into checkout**; the charge/attribution itself is Phase 4, and multi-site/currency/locale stay reserved (Phase 2). If a follow-up would have to touch the reader/serializer/resolver to add a second page type, that is the smell test the spec forbids.
- **A15 — Two schemas, honored not changed (footgun avoidance).** The one-database / two-schema split (`public` operational + RLS; `cms` Payload-owned) is modern best practice and already the repo's state; Phase 5 must **not break it**. Cross-schema links stay **soft UUID references validated in the app layer** (never a hard `cms → public` foreign key); cross-schema references are resolved by the app-layer reader (A7); CMS tenant isolation is Payload access control, **not** RLS (the Payload role bypasses RLS — this is why A5's defense-in-depth is _necessary_, not optional); migration tools stay disjoint (Payload owns `cms`; Supabase CLI owns `public` + shared roles/extensions). A least-privilege Payload DB role scoped to `cms` is a reserved hardening (verify current privileges first; ticket only if over-privileged).
- **A16 — Consume the reserved Phase-2/3/4 contracts explicitly (see C).** Phase 5's public surface wires the seams those phases already define — site branding, CMS site-scoping, `rendered_locale`, `entry_method`, anonymity masking, the consent gate — rather than reinventing them. These are integration points, not new systems.

### B. Deep modules (the public-content contract package, under `packages/api`)

Each is a deep module — a simple, testable interface hiding real complexity — with thin app routes and thin app pages calling in. The Payload-touching implementation of the reader is co-located in admin, behind the interface (A4).

- **`published-content-reader`** — the sole entry for public content. `getPublishedPage({ tenant, site, key })`, `getNavigation({ tenant, site })`, `getUpdates({ tenant, site, limit })` → **serialized public types**. Tenant (and reserved site) are required arguments; applies tenant + published; runs `overrideAccess: false` under the public-read policy; returns empty on unresolved tenant; batches and caches reference resolution. Interface grows **additively** (listing/detail for events/campaigns later).
- **`public-serializer`** — the allowlist. Emits only named public-safe fields and typed layout blocks (hero, CTA, rich-text, media-feature, FAQ, impact-stats, testimonial, …); new/unknown fields are excluded by default; media normalized to public URLs (never raw Payload objects).
- **`public-request-context`** — host → unified context (operational tenant id + CMS tenant id + reserved `siteId`), fail-closed, dev-only override. Wraps today's host→tenant lookup; re-points to Phase 2's `public.sites` resolver without changing callers.
- **`checkout-handoff-resolver`** — turns a CMS CTA (references + optional source code + preset amount/frequency) into a **server-validated handoff**; validates every reference against the resolved tenant + public-eligibility; carries the reserved `site_id`/`source_code`/`currency`/`locale`/`entry_method` fields plus the opaque pass-through seams (`tribute_type`/`honoree`/notify-party, `daf_intent`/`matching`/`employer_intent`, and a `party_kind` hint — default `person`, org routing carried by `org_type`; amended 2026-07-06, Phase 9 C2) plumbed for the Phase 7 credit model; fails safe on invalid/cross-tenant.
- **`cache-tags`** — the tenant/document-derived tag scheme + `cacheLife` profile; the helper that binds the tenant argument to a cache key and the tags to a cached read; the mapping publish-events → tags to revalidate.
- **`preview` (Draft Mode)** — the signed-secret enable route (validate secret + authenticate staff + check tenant → `draftMode().enable()` → validated redirect → `noindex`), and the reader's `draft` path. The shareable non-staff token and Live Preview are reserved seams on this module.

### C. Phase-2/3/4 plug-ins (consume reserved contracts; no parallel systems)

The congruence audit confirmed **no contradictions or duplications** — these are Phase-2/3/4 seams the public surface must wire:

- **Site branding (Phase 2 Module 5).** The public layout **and** checkout apply the tenant's site branding via Phase 2's `resolveSiteBranding(site) → { name, logo, tagline, brandTokens }`, consumed through a site-config context — not hard-coded colors. This is the concrete mechanism for "each ministry feels wholly its own" and satisfies Phase 4's experiential-separation mandate (unbranded chrome is a failing build). Reserved-arg today; wired when Phase 2 lands.
- **CMS site-scoping (Phase 2).** Public page resolution filters CMS content by the resolved **`site_id`** (not tenant-only) and respects Phase 2's **per-site slug uniqueness**. The reader's arguments become `(tenant, site)`; `site` is the reserved dimension from A6 that activates when Phase 2 retrofits the site relationship and the site-aware public read API.
- **`entry_method` and attribution (Phase 2).** Public-checkout gifts carry `entry_method = 'public_checkout'` alongside `site_id` and `source_code` (Phase 2's four-axis attribution vocabulary). _(Reconciliation: Phase 2's PRD refers to the anonymous public checkout as "(Phase 3)"; that is a stale sequencing reference — the public checkout is this phase. The vocabulary and reserved columns are unchanged.)_
- **`rendered_locale` and the message-resolution contract (Phase 2).** Checkout receipts and confirmation/system emails populate `rendered_locale` and consume Phase 2's override-resolution order (tenant default → site override → locale override). Fields are wired now; values follow Phase 2's locale facet.
- **Anonymity masking (Phase 3).** Any public surface that renders donor data (leaderboards, impact pages, recent-donor displays) honors Phase 3's row-scope resolver masking — donor identity is masked on anonymous gifts (covering the null-donor guest case today, and a reserved donor-elected flag later). This is the concrete meaning of "public-eligible" for donor data.
- **Consent gate (Phase 3).** Phase 5's system-initiated emails route through Phase 3's message-type-aware, fail-closed consent gate: the **receipt is transactional** (sent except `do_not_contact`/bounce/complaint), a **claim-invite is gated** appropriately, and consent is treated fail-closed for a new/guest donor whose status is unknown. A **tribute notification email** to a third-party notify recipient is a **distinct message type owned by Phase 7** — never a tax document, with the gift amount hidden — that routes through its own consent classification; Phase 5 reserves the seam and builds no notification send.
- **Export governance (Phase 3) — conditional.** The public runtime ships no export, so this is not exercised now; any future donor/public export wires Phase 3's export-governance resolver and the shared `csvSafeCell` helper. Reserved.

### D. Data model

- **No new tables.** Phase 5 is a runtime contract; it creates no migrations. Site/domain/locale/currency/source-code storage is Phase 2; identity/claim tables are Phase 4.
- **Hardening touchpoint:** the public navigation read is routed through the choke-point so it inherits the published + tenant constraint (fixing the shipped draft-leak).
- **Reserved (carried through the contract, not stored by Phase 5):** `site_id`, `source_code`, `currency`, `locale`, `entry_method = 'public_checkout'`, and `rendered_locale` travel through the resolution context, the checkout handoff, and the cache tags as reserved fields/dimensions — so Phase 2 populates values and Phase 4 wires the identity write without re-plumbing checkout, caching, or content resolution. The checkout handoff additionally reserves **opaque pass-through seams for the Phase 7 credit model** — a tribute/honor-memorial annotation (`tribute_type` + `honoree` + notify-party reference), a giving-intent hint (`daf_intent`, `matching`/`employer_intent`), and a `party_kind` hint (default `person`; org routing carried by `org_type` — amended 2026-07-06, Phase 9 C2) — plumbed now and **populated by Phase 7**, so adding tribute/DAF/matching capture or org/church/DAF party routing never re-opens the resolver contract.
- **Consumed, not owned:** operational funds/missionaries (references validated at read); Phase 2 `public.sites` (resolution + branding + site-scoping); Phase 3 `field_policies` + resolver (public projection, anonymity, consent, reveal-gate); Phase 4 unclaimed-donor/claim services + the frozen receipted legal-donor snapshot (Phase 4 reserved; produced/extended by the Phase 7 credit model).

### E. Contracts / wiring

- **Next.js 16.2 (Cache Components):** `use cache` + `cacheTag` + `cacheLife` at the function level; `revalidateTag(tag, "max")` (stale-while-revalidate) in the public app's route handler; **no** route-segment config (build-breaking here); request-specific values read outside `use cache` and passed as arguments (tenant, `draftMode().isEnabled`); `draftMode()` for preview. Verified against the installed bundled docs.
- **Vercel:** host is TLS-verified and part of the CDN cache key by default (platform-level per-tenant isolation); tenant resolution in edge middleware, cached in Edge Config; the admin→public invalidation is a secured route handler (HMAC signature, constant-time compare), purging globally in ~300ms; tag limits respected (256 bytes, no commas, ≤128/response). Custom-domain management (Vercel Domains API + wildcard auto-SSL) is a reserved Phase-2 mechanism.
- **Payload CMS:** the single reader uses the Local API with `overrideAccess: false` under the public-read policy; drafts via `draft: true` behind Draft Mode; the `media` collection's public fields only. Payload runs in the `cms` schema in admin; the package never imports it (the reader implementation in admin does).
- **Repo boundaries:** business logic in `packages/api` (the contract package); app routes and pages stay thin; the public runtime depends on the package's serialized output and types, never raw Payload documents or the `cms` schema. Honors `data-access-boundary.md`, `runtime-map.md`, and the platform-surfaces/boundaries specs; updates `web-studio-living-spec.md` (preview convergence) and the runtime map (the cache + reader contract).
- **OpenSpec:** a change under `openspec/changes/sitestacker-parity/` reaffirming the public-tenant-website runtime contract; glossary (`CONTEXT.md`) additions (below); possible touch-ups to `platform-surfaces`/`platform-boundaries` to name the contract.
- **UI:** all Phase-5 public UI uses the shadcn **`base-maia`** style + **zinc** tokens (from `packages/ui/styles/globals.css`, via `@asym/ui`), on Base UI, applying the resolved **site brand tokens** (C) rather than hard-coded colors; responsive and accessible per the frontend rulebook.

### F. ADRs (to author with the docs ticket)

1. **Public Website is a surface in `apps/donor`, `apps/web` reserved** — a product surface implemented inside the donor app now, with a cheap future extraction path, chosen over a separate app package today.
2. **Transport-agnostic reader + single Payload read in admin + availability seam** — the public runtime depends on a stable serialized contract with one Payload-touching implementation, chosen over scattered per-app Payload calls or a hard-welded HTTP dependency, so the public site is decoupled from Payload internals and admin uptime.
3. **Defense-in-depth public isolation** — tenant-as-required-argument + a Payload public-read policy (`overrideAccess: false`) + a sole-entry choke-point + fail-closed, chosen over the shipped `overrideAccess: true` + hand-written-`where` pattern (which has no safety net and already leaked), and _necessary_ because RLS does not protect the `cms` schema.
4. **Reference-not-copy CMS↔operational, operational-wins on drift** — soft cross-schema references resolved/validated in the app layer, chosen over snapshotting operational data into the CMS, avoiding drift and the two-schema foreign-key footgun.
5. **Function-level tagged caching + cross-app publish signal, no route-segment config** — cache-key isolation by tenant argument, tenant/document tags, a secured admin→public invalidation signal, and a bounded-staleness backstop, chosen over time-based-only or no caching, and required by the repo's Cache Components rule.

---

## Testing Decisions

Good tests here assert **external behavior and safety invariants**, not implementation details — and, as in Phase 4, isolation failures are _silent_ (0 rows, no error), so isolation must be asserted with `is_empty()`-style checks, not error expectations.

- **The negative-test tier (permanent CI gate) is the spine.** Cross-tenant isolation: a public read for tenant A never returns tenant B's content or any draft; a read with an unresolved/blank tenant returns **empty** (fail-closed). Draft safety: no draft is reachable through any public route (including a **navigation regression** test for the shipped leak). Enumeration safety: the giving form returns an **identical response and latency envelope** for a known-existing vs. absent email, and never pre-fills a name or exposes a saved card to an unauthenticated session (Phase 4's rule, at this surface). Cache isolation: a cached page for tenant A is never served for tenant B (the **tenant-as-argument** proof), and publishing invalidates exactly the right tags. Handoff integrity: checkout rejects an invalid or cross-tenant reference server-side and never charges a default/wrong designation. Serializer: private/unknown fields are stripped by default.
- **Structural assertions (CI).** A hard-blocking **sole-entry lint** that no raw Payload read (`payload.find`/`findByID`) exists in public code paths outside the reader; an assertion that **no route-segment cache config** (`revalidate`/`dynamic`/etc.) exists in the public app; a check that the admin→public invalidation endpoint verifies its signature in constant time.
- **Slice (the missionary giving page).** End-to-end: host resolves to tenant; the page fetches only published, tenant-isolated content through the choke-point; references resolve and validate; the CTA hands off a server-validated, enumeration-safe designation into checkout; Draft Mode preview renders the real page with draft data, uncached and `noindex`; publishing invalidates the page's tags; the page meets the repo's **accessibility** gate; a **parity test** asserts the choke-point's serialized output matches the current published output for a published document (a safe-migration guard).
- **Prior art.** Phase 4's cross-tenant negative-test tier and enumeration-latency test; Phase 3's resolver/projection golden-snapshot tests; the existing public API's published-only tests; `packages/api` service unit tests. The slice needs ≥1 seeded tenant with a published missionary giving page and a real fund/missionary (a test-setup/evidence item).

---

## Out of Scope (reserved seams — documented, not built)

- **All Phase-2 primitives:** the `sites`/`domains` tables, custom-domain verification/management (Vercel Domains API), locale/currency **values**, the site-branding **resolver** and CMS site-scoping **retrofit**, the `source_code`/`entry_method`/`rendered_locale` **storage** and the attribution write. Phase 5 reserves the fields and wires the resolvers when they land; "channel" stays retired.
- **All Phase-4 identity services:** guest-attribution (`attributeGuestGift`), the claim service and magic-link binding, legacy invitations, the reveal-gate, and merge. Phase 5 owns only the public surface that calls them.
- **The giving cart / multi-designation checkout;** multi-currency giving launch; the localization/translation workflow.
- **Real-time Live Preview** (iframe/visual editing) and the **shareable non-staff preview token**; a redirect-manager UI; an SEO studio; a visual page builder; approval/moderation workflows.
- **Events, opportunities, advocacy campaigns, and dynamic listing/search** public runtimes — reserved to build on this contract (the slice proves the template).
- **The `apps/web` extraction** and the alternate cache/CDN transport that removes admin from the hot read path.
- **A least-privilege Payload DB role scoped to `cms`** — reserved hardening (verify current privileges first).
- **Rate-limiting/CAPTCHA on public form/preview endpoints** — reserved defense-in-depth (congruent with Phase 4).
- **Any public/donor export** — the public runtime ships none; a future one wires Phase 3's export governance.

---

## Further Notes

- **Best-practice grounding (verified this session).** The contract was pressure-tested against the **installed Next.js 16.2 bundled docs** (Cache Components / `use cache` / `cacheTag` / `cacheLife` / `revalidateTag` / Draft Mode), official **Vercel** docs (tag invalidation, cross-deployment revalidation, multi-tenant custom domains, host cache-key isolation, host trust), official **Payload CMS** docs (Local API `overrideAccess` default, drafts/versions, access control, multi-tenant plugin caveat, Draft Mode preview, media access), **Supabase/Postgres** docs (two-schema architecture, RLS-per-table and role bypass, cross-schema FK anti-pattern, least-privilege roles), and modern **e-commerce/headless-CMS** practice (Stripe/Shopify/commercetools/Medusa: reference-not-price, server-side re-validation, guest-first, attribution metadata, direct single-item checkout). Two findings shaped the design: **Payload's Local API skips access control by default** (`overrideAccess: true`), which is why the isolation choke-point runs `overrideAccess: false` under an explicit policy; and **cache tags do not isolate cache entries** (the tenant must be a function argument), which is why tenant-as-argument is the isolation mechanism and tags are for invalidation only.
- **Congruence (verified).** Phase 5 was checked directly against the Phase 4 PRD and, by quote-backed audit, against the Phase 2 and Phase 3 PRDs: **no contradictions or duplications.** Phase 5's decisions fit reserved slots those phases already define; the seven integration points (C) are consumption wirings, not new systems.
- **Payload pre-release risk.** Payload runs on a spike dependency (`4.0.0-internal`) and its `schemaName` is marked experimental; the contract is written at the Asym boundary (serialized output, transport-agnostic reader) so this churn stays below the contract. Watch, not blocking.
- **Availability honesty.** In Phase 5, the admin app is still on the cold-read path for public content; the availability seam (CDN/replica transport) is _designed_ (via the cache-tag scheme) but _not built_ — a later, triggered capability, not a Phase-5 guarantee.
- **Compliance anchors.** PCI SAQ-A (Stripe holds card data; the CMS and public runtime never touch it); CAN-SPAM/GDPR (consent gate + data-minimization: no donor record before a completed gift); the frozen legal-donor receipt snapshot (Phase 4 reserved; produced/extended by the Phase 7 credit model) referenced by the thank-you/receipt.

---

## Evidence & Acceptance

**Acceptance criteria (Phase 5 is "done" when):**

- [ ] All public content reads go through one choke-point that takes the resolved tenant as a required argument, applies tenant + published, runs `overrideAccess: false` under the public-read policy, and returns empty on an unresolved tenant.
- [ ] The sole-entry lint (no raw Payload reads in public paths) and the "no route-segment config" assertion pass as hard-blocking CI gates.
- [ ] The shipped navigation draft-leak is fixed (navigation is published-only through the choke-point) with a regression test.
- [ ] A public request resolves its tenant only from the platform-trusted host (no production `?tenant=`), returns the unified context with a reserved `siteId`, and fails closed to "site not found" on an unknown/disabled host.
- [ ] The public-content contract lives in one server-only package; consuming apps depend on its serialized types, never raw Payload documents or the `cms` schema; the reader is transport-agnostic with the single Payload read in admin.
- [ ] CMS pages reference operational records; references are resolved and validated at read time against the resolved tenant and public-eligibility; a dangling/cross-tenant reference fails safe; public page identity is a presentation identity, not the operational record.
- [ ] The giving CTA hands off through the resolver; checkout re-validates every reference server-side; the form is enumeration-safe and constant-time and never pre-fills/exposes saved data to an unauthenticated session; the handoff carries reserved `site_id`/`source_code`/`currency`/`locale`/`entry_method`.
- [ ] Published reads are cached with the tenant passed as an argument (cache-key isolation) + tenant/document tags; publishing fires a signed, constant-time-verified admin→public signal that invalidates the right tags; a bounded `cacheLife` backstop is in place; no route-segment config exists.
- [ ] Preview renders the real page via Draft Mode behind a signed-secret, tenant-checked route; drafts are never cached, never public, and `noindex`; the shipped admin preview remains as interim.
- [ ] Guest-first continuity: no record on browse or abandonment; a one-time
      record only on a completed gift; for Phase 16 recurring giving, an
      accepted agreement plus durable initial-payment state persists exactly
      once even when ACH is processing, without calling the funds received or
      issuing a successful-payment receipt; a tenant-branded result offers an
      optional magic-link claim and respects the Phase-3 reveal gate.
- [ ] The public surface wires the Phase-2/3/4 seams (C): site branding, CMS site-scoping, `entry_method`, `rendered_locale`, anonymity masking, and the consent gate.
- [ ] Error behavior: unknown host → "site not found"; valid tenant + missing page → tenant-branded 404; baseline public security headers set.
- [ ] The missionary-giving-page proof slice runs the full contract end-to-end, is built as configuration over the shared primitives (a second page type would need no reader/serializer/resolver changes), meets the accessibility gate, and passes the parity test.
- [ ] The cross-tenant negative-test tier is green; the contract is documented (ADRs, OpenSpec, `CONTEXT.md`, `runtime-map`/`web-studio-living-spec` updates).

**Evidence file** (Phase-2/3/4 style, authored at completion): the repo files inspected; the negative-test tier + slice tests passing; route/preview/cache checks; the Next/Vercel/Payload/Supabase doc citations used; screenshots of the slice and its Draft-Mode preview; the isolation-gate and sole-entry-lint CI output; known gaps; and an explicit list of what Phase 5 intentionally did **not** build (the reserved seams).

---

## Tracking Issues (epic #520 + children; created via `/to-issues`)

Mirrors the Phase-2/3/4 structure. Foundation tickets first (`status:todo`); the rest `status:blocked` until their blockers land. No `ready-for-agent` label until dispatch.

- **Epic — Phase 5: Public Website Runtime Contract**
- **T1** — Docs: PRD, OpenSpec change + glossary (`CONTEXT.md`) terms, the 5 ADRs, and the `runtime-map`/`web-studio-living-spec` updates.
- **T2** — The shared public-content contract package: reader interface, allowlist serializer, public request context, cache-tag scheme, and CTA-resolver types (server-only). _(foundation)_
- **T3** — Defense-in-depth isolation: the choke-point + Payload public-read policy (`overrideAccess: false`), fail-closed tenant argument, the sole-entry lint, and the navigation draft-leak fix. _(foundation)_
- **T4** — Host→tenant/site resolver: unified public request context (reserved `siteId`), edge/Edge-Config resolution, fail-closed "site not found", `?tenant=` dev-only.
- **T5** — Caching + invalidation: `use cache`/`cacheTag`/`cacheLife`, tenant-as-argument keys + tenant/document tags, and the secured (HMAC, constant-time) admin→public revalidation signal.
- **T6** — Checkout handoff resolver: server-validated references, enumeration-safe/constant-time form rules, reserved `site_id`/`source_code`/`currency`/`locale`/`entry_method`, fail-safe on invalid.
- **T7** — Draft Mode preview in the public runtime: signed-secret route, staff-auth + tenant check, `noindex`, exit-preview; interim admin preview retained.
- **T8** — SEO/canonical/redirects/sitemap/robots + tenant-branded 404/error + baseline security headers.
- **T9** — Public media: allowlist serializer public fields + `next/image` delivery.
- **T10** — The missionary-giving-page proof slice (mock → contract), built as a generalizable template + site-branding/anonymity/consent wiring.
- **T11** — The cross-tenant negative-test tier + structural CI gates + the Phase 5 evidence file.

## Dated Phase 17 outbound-identity clarification (2026-07-19)

**Old statement.** Phase 5 reserves tenant/site branding and public-runtime
context used by donor identity and receipt prerequisites but does not separate
tenant system mail from Asym's own customer-account bootstrap mail.

**New winner.** A donor-facing identity or system message for a tenant uses the
tenant-owned, proof-gated Ready Resend connection and the exact Phase 17 Sender
Profile/Reply-To resolution permitted by its System message contract.

**Compatibility boundary.** Asym customer-account bootstrap remains a separate
platform communication with its own sender, purpose, audience, and safety
contract. It is never a shared credential/sender fallback for tenant mail.
Phase 5 continues to own public runtime/site context and creates no template,
message, transport, or communication-history authority.
