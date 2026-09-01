# Phase 24 D9 — Retired Address Disposition Adversarial Review

> **Status:** Completed `/grill-with-docs` decision evidence for D9. This is not
> a Phase 24 PRD, OpenSpec change, implementation plan, migration authorization,
> or ticket specification.
>
> **Founder choice:** Privacy-safe not found by default; allow only separately
> proved path-specific redirects to truly equivalent content; never redirect
> Giving intent.
>
> **Review date:** 2026-08-26

## Final disposition

**Accept with required amendments.**

The selected direction is the safest and clearest permanent default. A real,
neutral `404 Not Found` protects sensitive ministries and avoids inventing a
replacement. A narrow exact-path redirect can preserve a genuinely moved
resource. Giving routes stay unavailable because moving a donor to a different
fund, missionary, campaign, currency, or checkout would silently change intent.

The draft still needed precision. “Truly equivalent” is not a staff opinion,
text-similarity score, or Site-successor inference; the owning route contract
must prove an exact eligible replacement. A newly rebound custom domain cannot
inherit the retired Site's responses. Query strings and browser fragments can
carry sensitive or financial context and therefore cannot cross a retired-Site
redirect. Resolver failure must return temporary `503`, not a false permanent
`404` or redirect.

In plain language:

- visitors normally see the same small **Page not found** response they would
  see for an unknown address;
- the page does not say that a Site or ministry existed or retired;
- staff may preserve one ordinary content link only after Core proves one exact
  current replacement;
- no homepage, Default Site, sibling Site, search result, or “closest match” is
  guessed; and
- an old Giving link never sends the donor or any amount, designation, cadence,
  currency, Source Code, return path, or checkout state somewhere else.

## Evidence labels

- **Repository fact** — accepted ADR, OpenSpec requirement, PRD, glossary, or
  founder-ratified decision on `develop`.
- **Current behavior** — code or schema present on `develop`; this proves only
  what runs today.
- **Proposed evidence** — open, unmerged Phase 22/23 work. It may inform D9 but
  is not governing repository authority.
- **External fact** — current primary standards, provider, security, or search
  documentation.
- **Product judgment** — a deliberate recommendation based on the evidence.
- **Assumption** — a claim still requiring user or production proof.

## Corrected D9 decision — normative language

These clauses replace the draft D9 wording and MUST flow into the Phase 24 PRD
and later OpenSpec requirements.

### D9-R1 — Real privacy-safe not found is the default

When a request still reaches Core for an address historically associated with a
retired Site, Core MUST return the same platform-neutral, real `404 Not Found`
used for an unknown, tombstoned, or privacy-ineligible address unless one exact
current route disposition proves the redirect allowed by D9.

The response MUST NOT vary its status, public copy, branding, links, selected
headers, asset graph, or other deliberate observable behavior based on whether
the address was never assigned, once public, restricted, or retired. Launch
does not use `410 Gone` because `410` confirms intentional permanent removal;
`404` may truthfully mean unavailable or intentionally undisclosed.

### D9-R2 — Current host binding wins

D9 applies only while a request reaches Core and resolves through Core's trusted
host boundary. One exact current verified-host binding generation is checked
before historical retirement state:

- a custom domain freshly proved and activated for a new Site uses only that
  new binding and route generation;
- no retired-Site route, redirect, cookie, cache, service worker, session,
  analytics, or historical binding follows the custom domain automatically;
- a custom domain with no current admitted binding serves no Tenant/Site
  content; and
- a Core-owned public handle remains reserved under D8 and may continue to
  resolve through the retired-address disposition.

Historical domain control never proves current ownership. Once DNS or provider
routing no longer sends a custom-domain request to Core, Core makes no claim
about the response.

D10 qualifies “current binding wins”: a fresh binding inherits no retired Site
content, redirect, cookie, cache, or other positive authority, but it remains
subject to every platform-wide adverse Issued Giving Address reservation. A
fresh binding cannot erase or reallocate an old Giving address.

D75 further fixes the fresh-binding boundary: any Tenant may create a new
private binding only after a Core-issued exact-host DNS challenge is freshly
observed and atomically consumed with the one global current claim. Typing/
attempt creation reserves nothing; provider verification is insufficient; old
binding rows remain immutable. Every trusted session/context and cache key binds
the new generation, launch custom Site hosts register no root-scope service
worker, and Core never promises to erase external browser/DNS/search history.

### D9-R3 — Public response envelope

The retired-address default is a tiny, server-rendered platform response with:

- HTTP `404`, `Cache-Control: no-store`, and an explicit non-indexing signal;
- a descriptive document title, one `main` landmark, one `h1`, declared
  language and direction, readable contrast, and 320 CSS-pixel reflow;
- no Tenant/Site name or branding, retirement fact or reason, successor,
  missionary/project/campaign/fund, internal identifier, domain history,
  Giving status, actor, or provider detail;
- no tenant CMS content, media, font, script, service worker, analytics,
  fundraising pixel, third-party request, personalization, or new cookie; and
- no guessed homepage, Donor Portal, Giving page, successor, Default Site,
  contact, search, or external link.

Its required launch copy is:

> **Page not found**
>
> We couldn't find the page you requested. Check the web address or use a
> current link provided by the organization.

### D9-R4 — Authority failure is temporary, not absence

If host, lifecycle, route-disposition, safety, or target-admission authority is
unavailable, timed out, corrupt, or outcome-unknown, Core MUST return a neutral
`503 Service Unavailable` with `Retry-After` when known and `no-store`. It MUST
NOT guess `404`, a redirect, Tenant, Site, locale, destination, or financial
context.

Only a proved negative/retired disposition returns the permanent anonymous
`404` result.

### D9-R5 — Route owners remain authoritative

Site retirement is a cause for public absence; it does not become a general
route or redirect authority. Phase 5 owns trusted request resolution and HTTP
delivery. Phase 22 owns its Missionary/Project Page route cases. Phase 23 owns
ordinary Page identity/path continuity. Giving owns every Giving-intent route.
Phase 24 owns retired-Site host and successor-Site policy without weakening any
stricter source owner.

D9 establishes an admissibility ceiling, not an entitlement to redirect. The
exact route owner MUST separately prove and activate every exception. A route
that has no accepted replacement relation stays `404`.

Proposed Phase 22 ADR-0125 remains stricter: its automatic permanent move is
only to an eligible generation of the same immutable Page identity; a different
successor Page never redirects. Proposed Phase 23 ADR-0147 currently allows
only same-Site/same-locale ordinary targets and uses the weaker phrase
“genuinely relevant.” Before either proposal becomes governing authority, the
Phase 23/24 package MUST reconcile terminal Site retirement and replace
“relevant” with the exact D9 equivalence proof. D9 never silently mutates a
Phase 22 route.

### D9-R6 — Exact equivalent-content proof

An ordinary-content redirect candidate is eligible only when all of the
following are current and proved:

1. one exact normalized source host-binding generation, path, canonicalizer
   version, locale, route/resource identity, route owner, and prior public
   release;
2. one stable internal target resource and current eligible target route
   generation—never a raw or caller-supplied URL;
3. the same Tenant, environment, exact locale, public audience/safety class,
   visitor task, subject, and substantive purpose;
4. the target's current Site, host, lifecycle, release, route, locale, and
   safety admission;
5. authority to inspect both source and destination plus a side-by-side
   consequence review and explicit human equivalence attestation; and
6. a versioned proof digest that still matches every relevant source/target
   head when activation compare-and-sets.

“Similar,” “related,” shared keywords, same campaign theme, a newer ministry,
the successor Site, a homepage, a sibling Page, search result, AI suggestion,
Default Site, or most popular Page is not equivalence. One root `/` mapping is
one exact path, never a catch-all. Cross-Tenant, cross-environment, cross-locale,
private, restricted, external, and raw-URL destinations are unavailable.

A cross-Site ordinary replacement inside the same Tenant/environment is
unavailable until the final Phase 23/24 route-owner contract explicitly
represents and proves that replacement; D9 does not infer it from Site
succession or content copying.

### D9-R7 — Giving intent is structurally non-redirectable

A route disposition MUST be structurally incapable of redirecting any request
owned or classified by Giving, including:

- donation/giving/checkout/enrolment/confirmation/cancellation/retry/management
  routes, embedded forms, hosted handoffs, short links, QR/deep links, provider
  callbacks/returns, form submissions, or APIs;
- routes or requests carrying designation, fund, missionary, campaign, amount,
  cadence/frequency, currency, Site, Source Code, entry method, donor,
  checkout/session, provider, success/cancel, or return-path intent; and
- any future route or parameter reserved by the Giving owner.

Eligibility comes from authoritative versioned route-purpose and reserved-
intent registries, never substring matching, a UI checkbox, or a caller flag.
An old Giving request returns D9's neutral `404` and creates no checkout,
provider, contribution, commitment, attribution, or redirect effect. Existing
recurring commitments remain accessible only through their independently
authorized Donor Portal paths and are not linked from this response.

### D9-R8 — Safe redirect execution

An eligible mapping:

- applies only to navigation-safe `GET` and `HEAD`;
- emits one direct permanent navigation response under the route owner's
  current contract (the proposed Phase 22/23 contracts use `308`);
- resolves a stored stable target identity server-side and rechecks target
  admission before every response/cache selection;
- never accepts `next`, `url`, `returnTo`, host, path, status, or target from
  the request as redirect authority;
- never forwards source query parameters, body, cookies, headers, attribution,
  or return state;
- emits an explicit empty destination fragment when no approved target anchor
  exists, preventing browsers from inheriting a source fragment;
- sets a privacy-preserving referrer policy;
- compiles directly to the final current target without chains, loops,
  transitive lookup, fallback, wildcard, regex, priority, schedule, or external
  hop; and
- returns D9's `404` and opens one cause-owned exception if the target later
  becomes ineligible. It never searches for another destination.

All non-`GET`/`HEAD` methods fail privately and never reach the target or a
provider. Staff confirmation and audit MUST warn that previously cached
permanent responses in browsers, crawlers, and third parties cannot be recalled.

### D9-R9 — Source of truth, schema, RLS, and authorization

Asym Postgres and the accepted route owners own append-only route-disposition
versions, one compare-and-set current effect per exact source, proof digest,
receipt, audit, and outbox. CMS content, lifecycle, verified-host bindings,
Giving route purpose, safety, locale releases, and target public eligibility
remain source-owned inputs. Next.js/Vercel redirects, DNS, caches, crawlers,
analytics, and the UI are executors/evidence, never authority.

The final physical model MUST make these constraints structural:

- exact Tenant, environment, source Site, source binding generation, normalized
  path, canonicalizer version, locale, route owner/kind, source resource,
  disposition, revision, predecessor, effective time, actor class, command,
  and semantic idempotency identity are non-null where applicable;
- one exact source key has one current head; versions, receipts, source paths,
  predecessors, and historical binding intervals are immutable and never
  reused;
- same-scope composite foreign keys bind source, target, host generations,
  locale, proof, receipt, and effect; `ON DELETE RESTRICT` preserves history;
- a redirect target is a stable internal resource/route-generation reference,
  not an arbitrary URL column;
- equality-leading scope/current predicates have supporting indexes;
- direct anonymous/authenticated Data API mutation is revoked; operational
  tables use `ENABLE ROW LEVEL SECURITY` and `FORCE ROW LEVEL SECURITY` where
  applicable; `SELECT`/`DELETE` policies use `USING`, `INSERT` uses `WITH
CHECK`, and `UPDATE` uses both; scope is immutable, and append-only
  disposition/receipt/audit rows expose no direct `UPDATE`/`DELETE` grant or
  policy;
- one privileged server command derives actor/on-behalf-of, exact source and
  target scope, capability, assurance, and every authority head. A service role
  or `SECURITY DEFINER` path repeats the same constraints, uses a least-
  privileged owner, schema-qualified names, and pinned empty `search_path`; and
- business audit, receipt, effect manifest, and outbox commit atomically with
  the disposition. No network call occurs while database locks are held.

### D9-R10 — Lifecycle, concurrency, and idempotency

Redirect preparation is private and has no public effect. Activation
compare-and-sets the exact source disposition and serializes through a
documented ordering with Site retirement, host transfer/rebinding, target
publication/move/suspension/retirement, locale release, safety containment, and
another mapping command. A stale source, target, binding, locale, lifecycle,
proof, permission, or expected head returns **Review changes** without effect.

Same semantic idempotency key and meaning returns the original receipt; changed
meaning conflicts. Correction appends a proved successor disposition that
points fresh Asym requests directly to the current target or back to private
`404`. History is never edited, deleted, or represented as recalling an
externally cached redirect.

### D9-R11 — Cache, search, metadata, and derived effects

Runtime checks current host binding, route disposition, and target adverse state
before any cached redirect or content selection. Cache identity includes exact
environment, current host-binding generation, source route identity, locale,
and disposition revision; tags are invalidation handles, not isolation.

Activation/correction emits a bounded effect manifest for source/target HTML,
RSC/data, internal links, canonical metadata, `hreflang`, sitemap, search,
social/share metadata, and relevant edge cohorts. No retired `404` appears in a
positive sitemap, canonical, or `hreflang` set. No stale positive redirect is
served on error. `404` and `503` use `Cache-Control: no-store` so a browser or
shared edge cannot carry a retired/unknown result across a newly activated host
binding; a provider cache purge alone is never correctness.

Search engines, external links, QR codes, screenshots, service workers, and
third-party caches are observed effects that Core cannot recall or treat as
source truth.

### D9-R12 — Staff authorization, audit, and UX

Only Mission Control exposes D9 under **Retired Site → Old web addresses** (or
the equivalent Site Lifecycle route). A separately grantable route-continuity
capability, current assignment, current session assurance, exact source/target
visibility, and explicit human approval are required. Support impersonation,
ordinary content editing, public/donor/missionary roles, bulk/scheduled
automation, and autonomous AI have no ambient authority.

The server derives every scope, owner, target, actor, and effective time. Caller
IDs, URLs, roles, approval, equivalence, or provider status are ignored or
rejected. The audit records proof-safe source/target identities and heads,
actor/on-behalf-of actor, assignment/capability/assurance, coded reason, optional
minimized note, equivalence digest, before/after disposition, effective time,
idempotency/correlation, and current observations without raw query strings,
fragments, donor data, secrets, or restricted content.

The staff page:

- defaults every row to **Will show Page not found**;
- offers **Review an equivalent-page redirect** only for owner-qualified
  ordinary content;
- shows old/new clean URLs, Site/environment/locale, source and target visitor
  previews, proof timestamp, exact consequences, and unresolved blockers;
- requires the acknowledgement **I confirmed that this destination serves the
  same visitor purpose as the old page**;
- uses **Publish redirect for this path** as the final action;
- shows Giving-owned rows as **Cannot redirect — Giving links must not move
  donor intent**, with no override and the guidance **Create and share a new
  Giving link**; and
- reports **Applying / Active / Needs attention / Safely showing Page not
  found** persistently with one cause-owned repair action, never toast-only.

It does not expose HTTP codes, rule priority, arbitrary target fields, wildcard
patterns, or a general redirect console.

### D9-R13 — Public and end-user UX

The public `404` is deliberately less informative than a tenant-branded active-
Site 404 because privacy outranks discovery after retirement. It remains calm,
plain, non-blaming, readable without images, animation, JavaScript, or external
assets, and correctly declares the platform-supported response language and
direction without consulting retired Site locale configuration.

If an exact redirect is active, the visitor moves once to the current
equivalent resource without an interstitial. The destination receives no source
query or fragment. A Giving visitor is never moved; the same neutral `404` does
not disclose the fund, campaign, missionary, amount, currency, retirement, or
replacement.

Concrete example:

- `old.hope.org/about-us` may redirect to
  `new.hope.org/about` only after staff and the route owner prove the same
  Tenant/environment, English locale, visitor purpose, public subject, safety,
  and currently admitted target.
- `old.hope.org/give/water?amount=50` always returns the neutral **Page not
  found** response. Core sends neither the visitor, `$50`, nor “water” intent to
  a homepage, general fund, campaign, successor, or checkout.

### D9-R14 — Failure, recovery, and observability

A locally committed mapping whose derived cache/search/link effects fail stays
source-authoritative but cannot serve while the target is not freshly eligible.
Unknown provider/cache outcomes are read back before retry. Lost responses
replay the durable receipt. Audit/outbox failure aborts local activation.
Recovery appends or converges forward; it never edits history, guesses a target,
or widens scope.

Every request/effect carries safe exact binding/disposition revisions and
correlation. Public metrics use bounded dimensions and never include raw hosts,
paths, queries, fragments, donor/ministry names, or identifiers that would
expose restricted work. Staff see aggregate old-link observations only when
authorized; a high hit count prompts link replacement outreach, not an unsafe
fallback redirect.

### D9-R15 — Migration, rollout, and prerequisites

Implementation is blocked until the operational Site lifecycle, exact versioned
verified-host binding, accepted Phase 22/23 route owners, exact-locale public
release, Phase 12 capability/PDP, and D7/D8 fences exist and are reconciled.
Phase 24 MUST explicitly supersede Phase 2's inline domain array and
Default-Site host fallback.

Rollout SHALL:

1. establish route/binding authority and exact Giving route/intent
   classification;
2. inventory current framework/provider/CMS redirects and every public route
   family without inferring equivalence;
3. expand append-only dispositions, proof/receipt/outbox, and D9 runtime
   envelopes;
4. migrate only objectively proved exact mappings; ambiguous rules become
   private `404` and a bounded review item;
5. deploy host/binding, adverse target, Giving, `404`/`503`, cache, and
   cross-tenant guards before a redirect writer;
6. remove host-blind Next.js/Vercel/CMS redirect authority—including current
   `/give` and `/donate` framework redirects—before D9 activation;
7. shadow/probe every route/host/locale cohort, then enable a bounded cohort;
   and
8. roll forward through successor dispositions after activation. No old code
   may ignore the exact route authority, and rollback cannot restore a guessed
   redirect.

### D9-R16 — Deliberate non-goals

D9 does not add a public retirement page, `410` policy, whole-Site redirect,
homepage/Default/successor/search fallback, external redirect product, wildcard
or regex engine, redirect priority/DSL, scheduled or bulk mappings, editable
HTTP status, automatic locale/currency selection, content-similarity/AI
authority, Giving redirect, domain transfer, Site/content copy, or provider-
owned redirect truth.

## Adversarial check

### What could go wrong with this answer?

The root decision is sound, but the unamended wording has material risks.

| Risk and why it matters                                                                                                                                                                                   | Severity / likelihood  | Required adjustment                                                                                                                                                                           |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| “Equivalent” is implemented as same slug, title, copied blocks, staff preference, or AI similarity. Visitors can land on a different subject, audience, safety class, locale, or legal/financial context. | Critical / High        | Apply **D9-R5–R6**. The owning route domain supplies a versioned exact replacement contract; no accepted owner proof means `404`.                                                             |
| A redirect-looking prohibition is bypassed by rewrite, Default-Site fallback, custom-domain rebinding, reused path, query forwarding, or browser fragment inheritance.                                    | Critical / Medium-High | Apply **D9-R2**, **D9-R7–R8**, and make direct retired Giving-address reuse the next founder decision.                                                                                        |
| An old Giving link reaches another fund, missionary, campaign, amount, cadence, currency, or checkout without an obvious redirect. Donor intent and receipts can become wrong.                            | Critical / Medium-High | Giving owns a structural route/intent registry; no Giving-class request can redirect or create provider/ledger state under **D9-R7**.                                                         |
| A permanent redirect or `404` remains in browser/CDN/search caches after a target safety change or host transfer.                                                                                         | Critical / Medium      | Apply **D9-R10–R11**. Current generations are in the key, adverse state wins before cache, transitions use explicit cache policy, and staff are warned external permanence is not recallable. |
| Branding, assets, analytics IDs, locale choice, headers, timing, or a `410` reveals that a sensitive ministry once existed.                                                                               | Critical / Medium      | Apply **D9-R1–R4**. Retired/unknown share the neutral `404` envelope; authority failure is `503`.                                                                                             |
| A raw destination produces open redirect, phishing, IDN/encoding ambiguity, or cross-tenant data exposure.                                                                                                | Critical / Medium      | Apply **D9-R6**, **D9-R8–R10**. Only stable server-resolved target identities and exact same-scope relationships are representable.                                                           |
| Phase 24 silently weakens Phase 22/23 route ownership and creates a second redirect engine.                                                                                                               | High / High            | Apply **D9-R5**, **D9-R9**, and **D9-R15**. Reconcile the open predecessor package; do not dual-write Payload/Next/Vercel redirects.                                                          |
| The neutral page is technically private but confusing, inaccessible, JS-dependent, or useless on a slow phone.                                                                                            | High / Medium          | Apply **D9-R3**, **D9-R12–R13**: tiny semantic HTML, plain copy, no external assets, correct language/direction, and responsive/a11y qualification.                                           |

### What hidden assumptions are we making?

| Assumption                                                          | Finding and permanent treatment                                                                                                                                                  |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Core can tell whether an old resource has a true replacement.       | **Not inherently true.** Only a source owner with stable identities, current releases, exact scope, and human consequence review can prove it. Text similarity is not authority. |
| A Site successor means its Pages are successors.                    | **False.** D5 copying creates independent private drafts and no inherited public trust. D9 requires a separate exact route/resource relation.                                    |
| A custom domain still belongs to the retired Site.                  | **False after rebinding.** Fresh current binding wins; historical ownership gives no authority. Core controls behavior only while the request reaches Core.                      |
| Dropping the query also drops the URL fragment.                     | **False.** RFC 9110 says a redirect Location without a fragment inherits the source fragment. D9 requires an explicit empty fragment unless an exact anchor is approved.         |
| A path name such as `/give` is enough to find every Giving request. | **False.** Current and future short links, embeds, query intent, callbacks, APIs, and renamed routes require a Giving-owned purpose/intent registry.                             |
| `404` and `410` are equally private.                                | **False.** Both remove content for search, but `410` explicitly communicates intentional permanent removal; `404` also permits unwillingness to disclose.                        |
| A route-authority outage means the address is absent.               | **False.** Returning cached permanent absence on uncertainty can destroy correct public behavior. D9 uses neutral no-store `503`.                                                |
| A permanent redirect can be undone everywhere.                      | **False.** Core can append a correction for fresh requests, but browsers, crawlers, and third parties may retain the old response.                                               |

No assumption is allowed to become a fallback. Missing proof yields `404`;
missing authority yields `503`.

### How does this affect the whole product?

| Product area                     | Impact                                                                                                                                                                                                                                                          |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mission Control**              | Staff receive an exception-first **Old web addresses** surface after retirement: default private `404`, exact eligible ordinary candidates, side-by-side preview, Giving prohibition, persistent receipt, and cause-owned repair. It is not a redirect console. |
| **Public Website**               | The trusted host/route boundary emits one of 3 honest outcomes: exact current content, one proved direct redirect, or neutral `404`; authority outage is `503`. No Tenant fallback or retired content reaches public cache.                                     |
| **Donor Portal**                 | Historical gifts and recurring management remain authenticated and unchanged. The anonymous retired page does not advertise or infer a Portal identity.                                                                                                         |
| **Giving**                       | Giving classifies intent and rejects every redirect/rewrite/fallback path. D9 never selects Designation, Legal Entity, Stripe, amount, cadence, currency, settlement, or attribution.                                                                           |
| **Missionary Workspace**         | Missionaries can see an authorized summary/preview if useful but cannot create routes, select targets, or reveal a restricted predecessor/successor relationship.                                                                                               |
| **Web Studio / CMS**             | CMS supplies presentation and current eligible target content but does not own route disposition. Copied or similar content is not equivalence proof.                                                                                                           |
| **Reporting and audit**          | Business history records exact source/target identities, actor, proof, revisions, and observed effects. Public hit reporting is aggregate and privacy-minimized; historical gifts/Pages are not rewritten.                                                      |
| **Permissions**                  | One dedicated route-continuity capability and exact source/target visibility replace role-name strings, support authority, or UI hiding.                                                                                                                        |
| **Workflows and operations**     | Default `404` is safe without human work. Only positive redirects require review. Failed target/cache effects produce one cause-owned exception rather than direct SQL/provider repair.                                                                         |
| **Integrations**                 | Vercel, DNS, CDN, search, analytics, and CMS redirects execute or observe; none selects the product result. A domain that leaves Core is outside Core's response guarantee.                                                                                     |
| **Organization day-to-day work** | Staff update only valuable old content links and distribute new Giving links. Small tenants avoid a migration project; large tenants may batch candidate review only when every row retains its own proof and no override exists.                               |

### How does this affect the end-user experience?

For a public visitor, the safe default is intentionally simple:

> **Page not found**
>
> We couldn't find the page you requested. Check the web address or use a
> current link provided by the organization.

There is no countdown, automatic navigation, “Site retired” disclosure,
homepage button, Give button, organization branding, or tracking. It loads as
small semantic HTML on a slow phone and remains understandable with a screen
reader, zoom, RTL direction, or no JavaScript.

For a tenant staff member, the experience explains the impact instead of
showing HTTP jargon:

```text
Old web addresses

14  Will show Page not found
 2  Redirects approved
 3  Giving links cannot redirect

/about-us
Eligible for review
[Compare with a current Page]

/give/water?amount=50
Cannot redirect — Giving links must not move donor intent
Create and share a new Giving link.
```

Concrete experience:

- Hope Missions proves that `old.hope.org/about-us` and
  `new.hope.org/about` serve the same English-language visitor purpose. Staff
  preview both, confirm equivalence, and publish one mapping. A visitor follows
  one permanent move to the clean destination.
- An old printed QR code opens
  `old.hope.org/give/water?amount=50`. The visitor sees **Page not found**.
  Core does not send the visitor, amount, or water-project intent to a general
  fund or successor checkout. Staff must distribute a new Giving link. That
  small visible inconvenience prevents an invisible financial mistake.

The remaining end-user question is direct address reuse: if the custom domain
later serves a new Site, the browser may reach the same `/give/water` path
without any redirect. D9 fences this hazard but does not silently decide it.

### Does this follow modern best practices?

**Yes, after the required amendments.**

- RFC 9110 defines `404` to include unwillingness to disclose and `410` as
  intentionally/permanently gone. It also warns that redirects inherit source
  fragments unless Location contains an explicit fragment.
- Google accepts true `404`/`410` when content has no replacement, recommends a
  permanent redirect for a clear replacement, and warns that many-to-one
  homepage redirects confuse visitors and may be soft 404s.
- OWASP recommends avoiding redirects where possible and resolving server-side
  IDs to allowlisted destinations rather than accepting target URLs from users.
- Vercel documents custom-domain proof/transfer as separate operations and
  states that provider `vercel.app` names cannot be reserved.
- Givebutter, Donorbox, and Blackbaud separate public campaign/form availability
  from recurring behavior; Blackbaud's embedded-form caveat demonstrates why
  hiding a link is not a Giving admission boundary.
- WCAG 2.2 requires a programmatically titled/languaged page, semantic and
  understandable content, visible focus for any future link, and reflow at 320
  CSS pixels. Core deliberately narrows Google's usual branded-404 suggestion
  because tenant/sensitive-ministry privacy has higher authority.

The solution avoids the outdated patterns: generic redirect tables, raw target
URLs, homepage fallbacks, mutable provider rules, redirect chains, path reuse,
hidden Giving rewrites, tenant-branded tombstones, and browser-only checks.

### Does this fit Asym's existing repo and product direction?

**Yes as intended behavior; no current runtime can implement it safely.**

Repository fit:

- platform priority remains tenant safety and permission correctness, then
  money/operational truth, donor clarity, and convenience;
- ADR-0028 already requires a typed fail-closed public choke point where
  unresolved scope serves nothing;
- ADR-0030 says cache tags invalidate but do not isolate, so exact host/Site/
  route generations belong in cache identity;
- D1 says Site is presentation/attribution, never financial identity;
- D4 forbids public Default-Site fallback;
- D7 and D8 already separate Giving admission, terminal Site lifecycle, public
  containment, and historical financial non-effects; and
- proposed Phase 22/23 work already rejects arbitrary URLs, chains, homepage
  guesses, and provider/CMS redirect authority.

Current behavior is not permanent authority and has release-blocking gaps:

- `packages/api/src/cms/public/context.ts` still sets `siteId` to null;
- `apps/admin/src/cms/public/resolve-tenant.ts` resolves a mutable CMS Tenant by
  primary domain or subdomain slug, with no Site/lifecycle/binding generation;
- `apps/donor/app/global-not-found.tsx` is branded “Give Hope” and links
  `Return home` to the same host;
- `apps/donor/next.config.ts` has host-blind permanent `/donate` and `/give`
  redirects to `/workers` before any future Site/Giving fence; and
- no operational Site/host/route-disposition schema exists.

Those are implementation blockers and migration inputs, not reasons to weaken
D9. Open PRs #1323 and #1340 remain useful proposed evidence but require
explicit reconciliation before implementation.

### Should we adjust the recommendation?

**Yes—narrow it, but keep the founder's choice.**

Record:

> Retired Site addresses return one true, platform-neutral, non-enumerating
> `404` by default. A route redirect is a separately activated exception only
> when the owning route/content domain proves one exact currently eligible
> replacement under D9-R1–D9-R16. “Equivalent” never means similar, copied,
> successor, Default, or staff/AI-guessed. Missing proof remains `404`; missing
> authority is neutral `503`.
>
> Giving intent never moves by redirect, rewrite, fallback, query/fragment
> forwarding, or another route-side effect. Only clean `GET`/`HEAD` ordinary
> navigation may redirect; source query/body/cookie state is discarded and an
> explicit empty destination fragment prevents browser inheritance. D9 does
> not authorize direct reuse of a retired Giving address after a host is
> rebound.

This adjustment **narrows but does not invalidate** the selected answer.

## Required proof matrix

### Public response, privacy, and accessibility

- Compare unknown, retired, tombstoned, restricted, and privacy-ineligible
  responses for true `404` status, declared envelope/body class, selected
  headers, no identity/branding/assets/analytics/cookies/links, and a declared
  bounded timing tolerance.
- Prove no `200` soft 404, no `410` retirement disclosure, no Site/Tenant/
  ministry/provider status, and no active-Site cache/body cross-contamination.
- Prove host/route/lifecycle authority outage returns `503 + Retry-After +
  no-store, never cached permanent absence or redirect.
- Exercise HTML, RSC/data/prefetch, OG/share, sitemap/robots, media, form, API,
  and malformed/encoded request families; none leaks retired Site output.
- Verify semantic title/main/h1, language/direction, screen readers, 320 CSS-
  pixel reflow, 200% zoom, forced colors, no-JS, low bandwidth, long/Unicode/
  RTL/IDN paths, and no motion or third-party dependency.

### Redirect equivalence, methods, and security

- Positive ordinary mapping proves exact source and stable destination,
  current same Tenant/environment/locale/audience/purpose/safety, current host/
  lifecycle/release admission, human review, and one direct permanent response.
- Same slug/title/content hash/copied blocks/subject keywords but different
  identity, purpose, audience, locale, scope, safety, release, or host
  generation does not qualify.
- Cross-Tenant/environment/locale, raw/external URL, encoded/IDN/control
  confusion, wildcard, regex, catch-all, homepage, Default, sibling, search,
  chain, loop, transitive, stale target, and ineligible target all fail closed.
- Only `GET`/`HEAD` redirect. `POST`/`PUT`/`PATCH`/`DELETE`, body/form/API
  requests never redirect or reach a target/provider.
- The Location contains no source query and an explicit empty fragment; prove
  source fragment inheritance is blocked in real browsers.
- Target suspension/retirement/unpublish/safety containment between lookup and
  response cannot produce a favorable redirect.

### Giving, money, and non-effects

- Reserved Giving routes, short/QR links, embeds, forms, checkout/cart,
  provider success/cancel/return/callback, Donor Portal management, and APIs
  never redirect.
- Requests carrying current `amount`, `frequency`, `fund`, `fund_id`,
  `missionary_id`, and `workerId` plus future owner-reserved Site, Source Code,
  currency, cadence, designation, session/provider/return intent never
  redirect, even on an ordinary-looking path.
- No query, fragment, body, cookie, source code, designation, amount, cadence,
  currency, donor, checkout/session, return path, entry method, or attribution
  reaches a destination, provider, contribution, or commitment.
- Existing contributions, recurring commitments, receipts, accounting, Site
  attribution, Legal Entity, Settlement Account Binding, Stripe, and Donor
  Portal access remain unchanged.

### Authorization, data, concurrency, cache, and migration

- Direct Data API, wrong Tenant/environment/Site/locale, caller target/actor/
  role/approval, stale assignment/session/assurance/proof/head, service role,
  function owner/search path, `USING`/`WITH CHECK`, immutable-scope, deletion,
  and target-enumeration poison tests create no disposition.
- Race activation with Site retirement, host rebinding, target publish/move/
  suspension/retirement, locale release, safety containment, and a duplicate/
  correcting mapping. One CAS ordering wins with no partial effect.
- Same semantic replay returns one receipt; changed input conflicts; lost
  response/worker crash/duplicate/out-of-order outbox/provider timeout
  reconciles without guessing.
- Warm/cold/multi-region CDN, browser cache, stale external permanent response,
  service worker, target adverse change, binding transfer, and missed
  invalidation never serve old Site bytes or cross-binding redirects.
- Inventory and quarantine legacy Next/Vercel/Payload/CMS redirects; no guessed
  backfill, dual route truth, mixed-version adverse-blind reader, or destructive
  rollback is accepted.
- Qualify production maximum hosts, exact paths, locales, active mappings,
  probes, concurrent commands, and effect backlog with O(1) indexed request
  lookup and no request-time graph/similarity scan.

## Named monitors and required response

| Signal                                                 | Threshold                                                                                                                         | Owner                           | Required response                                                                                                                                                                          |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `retired_route_non_404_without_approved_mapping_total` | Any response other than the declared neutral `404`/authority-failure `503` without one current approved mapping                   | Public Runtime on-call          | Declare P0, disable positive redirect execution for the cohort, quarantine affected hosts, preserve evidence, and prove exact negative behavior before re-enable.                          |
| `retired_site_content_served_total`                    | Any retired Site byte served after D8's 30-second containment ceiling                                                             | Public Runtime on-call          | Declare P0, invoke provider/WAF containment, purge exact cohorts, inspect binding/cache generations, and keep completion blocked.                                                          |
| `retired_site_giving_redirect_total`                   | Any redirect, rewrite, fallback, reused disposition, or target effect for a Giving-class request                                  | Giving + Security on-call       | Declare money-integrity P0, disable the exact route cohort, contain checkout admission, preserve/reconcile every affected request without blind cancellation, and notify Finance/Security. |
| `site_redirect_unproved_or_cross_scope_total`          | Any active mapping without current proof or with Tenant/environment/locale/owner scope mismatch                                   | Security/Authorization on-call  | Declare P0, kill new positive activation, fail affected origins to `404`, quarantine heads, and investigate scope/audit history.                                                           |
| `site_redirect_cycle_or_chain_issued_total`            | Any Core-issued response requiring more than one hop or entering a cycle                                                          | Public Routes owner             | Declare P0, fail origins to `404`, append direct/correcting dispositions, and block activation until graph-negative tests pass.                                                            |
| `site_redirect_target_ineligible_age_seconds`          | Any positive target ineligible at request time; continuously ineligible longer than 5 minutes escalates to P1                     | Route Operations owner          | Immediately fail source to `404`; after 5 minutes open one cause-owned repair, re-prove target or append removal, never choose another target.                                             |
| `site_redirect_effect_backlog_age_seconds`             | p99 local effect work over 5 minutes or any item over 15 minutes                                                                  | Site Operations owner           | Pause new positive activations, preserve safe `404` behavior, inspect/replay idempotently, and escalate the owning cache/search/provider cause.                                            |
| `retired_unknown_404_uniformity_probe_mismatch_total`  | Any deliberate status/body/header/asset/cache envelope difference or restricted identity disclosure                               | Privacy + Security on-call      | Declare P0, switch the cohort to the minimal no-store response, stop sensitive telemetry, preserve evidence, and repair the disclosure before rollout.                                     |
| `retired_url_sensitive_log_field_total`                | Any raw query, inherited fragment, donor/ministry identity, secret, or restricted value in telemetry/audit not explicitly allowed | Privacy + Security on-call      | Stop ingestion/derived access, contain affected stores, execute governed retention/removal, and repair redaction before re-enable.                                                         |
| `host_rebinding_stale_retired_effect_total`            | Any retired response/redirect remains locally issued from the old binding 30 seconds after a new binding activates                | Domain + Public Runtime on-call | Declare P0, quarantine the new host generation, purge generation-qualified cohorts, restore new-binding isolation, and prove no historical inheritance.                                    |

## Ruthless synthesis — permanent path forward

### Resolved before recording D9

1. `404`, not `410`, is the anonymous default; unknown and retired share one
   platform-neutral response.
2. Host rebinding precedence prevents retired route/cache/cookie inheritance.
3. Equivalence is owner-qualified exact continuity, not similarity or Site
   succession.
4. Phase 22 remains stricter and Phase 23/24 must explicitly reconcile any
   cross-Site ordinary replacement.
5. Giving intent is prohibited across redirects, rewrites, fallbacks,
   queries/fragments, methods, and route-side effects—not just UI links.
6. Authority outage is temporary `503`; an ineligible target is safe `404`.
7. Staff and public UX, source ownership, RLS/auth, concurrency, cache/search,
   migration, proof, and monitoring are explicit.

### Required order before implementation

1. Merge or explicitly supersede the Phase 22/23 route contracts and make the
   narrow Phase 24 retired-Site bridge owner-compatible.
2. Establish operational Site lifecycle, versioned host binding, exact-locale
   route/release, Giving intent registry, capabilities, and same-scope data/RLS.
3. Deploy the neutral `404`/`503` and current host/target adverse checks to
   every public route family; remove host-blind framework/provider redirects.
4. Add private candidate proof, exact stable target selection, CAS command,
   receipt/outbox, cache/search effects, probes, and staff preview UX.
5. Shadow all outcomes and migrate only exact proved mappings. Ambiguity stays
   `404`.
6. Prove the full matrix at declared production capacity, enable a bounded
   cohort, and keep the kill switch adverse: it disables positive redirects,
   never restores retired content.

### ADR and documentation status

D9 is hard to reverse, surprising without context, and the result of a real
privacy/continuity/donor-trust tradeoff, so it qualifies as an ADR candidate.
Creating a new accepted ADR now would collide with open Phase 22/23 route
authority and numbering. Keep the founder ruling in the Phase 24 decision log
and this evidence; create/reconcile the final ADR in the coherent `/to-prd`
package after predecessor authority settles.

## Research synthesis

### Repository authority and current reality

- [`CONTEXT.md`](../../../CONTEXT.md) defines Site, retirement, D7 Giving
  admission, and public-host fail-closed language.
- [Platform principles](../../../openspec/specs/platform-principles/spec.md)
  make tenant/permission safety and money truth outrank donor convenience.
- [Platform boundaries](../../../openspec/specs/platform-boundaries/spec.md)
  separate operational, CMS, Giving, public, and authenticated authority.
- [ADR-0028](../../adr/0028-defense-in-depth-public-isolation.md) requires a
  typed, fail-closed public choke point and permanent cross-tenant negatives.
- [ADR-0030](../../adr/0030-function-level-tagged-caching-publish-signal.md)
  says tags invalidate but do not isolate cache entries.
- [D8](./phase-24-d8-site-retirement-adversarial-review.md) already makes Site
  retirement terminal, chooses privacy-safe not-found as launch default, and
  forbids automatic redirects/Giving changes.
- `packages/api/src/cms/public/context.ts` currently leaves `siteId` null.
- `apps/admin/src/cms/public/resolve-tenant.ts` is a tenant-only CMS bridge with
  no lifecycle or binding generation.
- `apps/donor/app/global-not-found.tsx` is currently branded and links home;
  it is not the D9 retired-address response.
- `apps/donor/next.config.ts` currently redirects `/donate` and `/give` to
  `/workers` without exact Site/Giving authority; those bridge rules cannot
  survive D9 cutover.
- PR #1323 proposed ADR-0125 and PR #1340 proposed ADR-0147 are current
  founder-ratified planning evidence but remain open/unmerged and require the
  reconciliation in **D9-R5**.

### Current external primary evidence

- [RFC 9110 `404](https://www.rfc-editor.org/rfc/rfc9110.html#name-404-not-found)
  allows absence or unwillingness to disclose; `410` says intentional permanent
  removal. Its
  [Location semantics](https://www.rfc-editor.org/rfc/rfc9110.html#name-location)
  and fragment security guidance require explicit fragment handling.
- [RFC 9111](https://www.rfc-editor.org/rfc/rfc9111.html) and RFC 9110 document
  heuristic caching for relevant negative/permanent responses, so D9 declares
  cache behavior rather than assuming instant reversibility.
- [Google crawl-error guidance](https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors)
  requires a true `404`/`410` when no replacement exists and a permanent
  redirect only for a clear replacement.
- [Google site-move guidance](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
  requires accurate URL mapping and warns against irrelevant many-to-one
  homepage redirects and chains.
- [OWASP redirect guidance](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html)
  supports server-side identifiers and allowlisted targets instead of
  caller-controlled URLs.
- [Vercel domain behavior](https://vercel.com/docs/domains/working-with-domains),
  [ownership claims](https://vercel.com/docs/domains/working-with-domains/claim-domain-ownership),
  and [transfers](https://vercel.com/docs/domains/working-with-domains/transfer-your-domain)
  keep provider names, custom-domain proof, project assignment, and transfer
  separate.
- [Givebutter](https://help.givebutter.com/en/articles/1772204-how-to-close-or-unlist-a-campaign),
  [Donorbox](https://donorbox.zendesk.com/hc/en-us/articles/360020294052-What-happens-to-recurring-donations-once-the-campaign-is-archived),
  and [Blackbaud](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/education/k12/full-help/content/sws-manage-giving-forms.html)
  show why public availability and recurring/form admission need independent
  enforcement.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) and
  [WAI reflow guidance](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
  support semantic, titled/languaged, keyboard-safe, readable, responsive error
  and staff surfaces.

## Resolved judgments and next dependency

No unresolved fact blocks recording D9. “Equivalent” remains unavailable for a
content family until its owner contract proves it, which is a deliberate safe
default rather than a dangling implementation detail.

D9 does not answer whether a retired Giving address may later be used directly
after its custom domain is freshly attached to another Site. That path contains
no redirect and could still reinterpret an old QR code or bookmark. It is the
next founder-level decision.

## D76–D77 reconciliation (2026-08-31)

ADR-0197 moves no route meaning merely because the hostname's Site binding
changes. D76 consumes the current finite owner manifest before its adverse
cutover barrier; same path/title/slug or destination content never proves
equivalence. Unknown or unmapped source paths receive the owner-defined neutral
absence rather than destination fallback.

ADR-0198/D77 now fixes the bounded move-time rule. Every applicable critical
owner remains a hard gate. One deterministic comparison consumes complete
immutable source/destination effective-host manifests; source-only ordinary
addresses compile durable not-found effects, target-only addresses retain their
own authority, and exact collisions remain blocked until their owner resolves
them. Mere target absence is not durable safety because a later target Page
could otherwise reuse old meaning. Only an already owner-qualified successor may
continue, and D77 creates no mapping, resolver, adapter framework, crawler,
provider rule, or fallback.

ADR-0199/D78 now establishes the only different-Page cross-Site case within
this ceiling. One current `general_page` may continue one exact historical
General Page address only through a directional, revision-bound Page-owner
qualification after hard same-scope/locale/audience/safety/public-generation
proof and one authorized human's exact-release review of the same subject,
substantive purpose, and visitor task. It stores a stable Page identity, never a
URL, and is non-symmetric/non-transitive. Copy provenance, path/title/content,
analytics, search, and AI never prove it. Missing/stale/rejected/Article/
specialized/protected proof remains block/not-found. D76 alone activates the
current relation; D78 creates no Page merge, redirect engine, Vercel rule,
context carry, or money effect. ADR-0200/D79 now retains the exact target-
revision ceiling before cutover and allows post-activation continuation only
when the publisher universally preserves the current opaque Page Purpose
Continuity Version for a changed effective Page meaning-bearing dependency
digest. A D79 material-purpose candidate instead uses D80's fresh independent
private Page; D80 leaves the source version/relations unchanged and the target
inherits none. Stable identity alone never supplies favorable fallback.
