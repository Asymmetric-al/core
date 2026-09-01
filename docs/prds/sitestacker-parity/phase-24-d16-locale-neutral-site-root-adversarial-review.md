# Phase 24 D16 — Locale-Neutral Site Root Adversarial UX Review

> **Status:** Completed `/grill-with-docs` decision evidence for D16. This is
> not a Phase 24 PRD, OpenSpec change, implementation plan, schema, migration,
> issue specification, or runtime authorization.
>
> **Founder choice:** When French (Canada) becomes the default Site Locale,
> `hope.org/` temporarily opens `/lang/fr-ca` while existing explicit Page and
> Giving addresses remain unchanged.
>
> **Review date:** 2026-08-27
>
> **Later D17 clarification:** One active private Default Site Locale Plan may
> preserve an unready target and coordinate source-owned work. It never becomes
> a second default, never changes the current root, and never activates
> automatically. Final activation still requires a fresh D16 candidate and
> reviewed expected-head command.

## Final disposition

**Accept with required amendments.**

The choice is the strongest low-friction visitor default. It gives a person who
types only the ministry domain a real homepage immediately, yet preserves the
stable explicit-locale URL model accepted in D15. It also agrees with current
Google guidance: use distinct language URLs, do not infer language from hidden
visitor signals, keep visible language links, and use `x-default` narrowly for
a genuine selector or auto-redirecting homepage.

The informal answer is not safe enough by itself. “Temporarily opens” must mean
one exact HTTP and domain contract, not an app-router convenience:

> The **Site Root Entry** is the exact locale-neutral Site public-base root,
> such as `https://hope.org/` or the equivalent permanent Site base on a shared
> host. For public `GET` and `HEAD` only, a currently serving Site returns one
> server-side `307 Temporary Redirect` to the same Site's current,
> public-ready Default Site Locale homepage at its explicit Site Locale Public
> Base. The target is compiled from trusted, immutable current public-generation
> facts and never from browser language, IP, cookies, profile, currency,
> provider, request headers, or caller-supplied destination data.
>
> Changing the default changes only the Site Root Entry destination and its
> derived homepage search projection. It never rewrites, redirects, aliases,
> relabels, or reinterprets an explicit Page or Giving URL. The root never
> carries Giving intent and can never target Giving, checkout, authentication,
> API, callback, provider-return, control, external, sibling-Site, or
> cross-Tenant routes.
>
> A favorable redirect exists only while the sole current Default Site Locale
> Version and one complete current locale-exact Public Site Generation jointly
> prove the exact Tenant, environment, Site, verified canonical Site public
> base, eligible explicit homepage, route generation, and serving policy.
> Missing, stale, withdrawn, suspended, unverified, conflicting, or unknown
> truth produces the owning domain's privacy-safe absent or honest temporary-
> unavailable response—never a guessed locale, Site, Page, or Giving fallback.

Concrete result:

```text
GET https://hope.org/
307 Location: https://hope.org/lang/fr-ca#
Cache-Control: no-store

https://hope.org/lang/en-us/about
https://hope.org/lang/en-us/give/clean-water
```

The trailing empty fragment is deliberate. RFC 9110 otherwise requires a
browser to inherit a source fragment across a redirect; `#` prevents a private,
stale, or unrelated root fragment from reaching the locale homepage.

## Evidence labels

- **Verified repository fact** — observed in current `develop`-based source,
  accepted ADR/OpenSpec material, or the D7–D15 decision chain.
- **Proposed repository fact** — present only in open PR #1323 or #1340 and not
  yet merged; useful evidence, not current authority.
- **Verified external fact** — supported by a current primary standards or
  official product source linked below.
- **Product judgment** — Core's selected trade-off after comparing safe
  alternatives.
- **Assumption** — plausible but not yet proved with representative Core users
  or production-shaped traffic.
- **Unresolved empirical unknown** — requires later usability, analytics,
  provider, or production-shaped evidence; it does not authorize guessing.

## Jobs to be done

### Primary visitor job

“When I enter only the ministry's website address, take me to a useful homepage
quickly, let me clearly choose another language, and never move an explicit
Page or donation link behind my back.”

### Primary staff job

“When I make French (Canada) the website default, show exactly what changes,
exactly what stays unchanged, whether French is ready, and who must act—then
publish it as one safe change without making me understand redirects, caches,
or search protocols.”

### Staff assurance job

“Prove that Page links, Giving links, QR codes, currency, Stripe, settlement,
bank, accounting, and historical attribution do not change merely because the
domain-only address opens a different default homepage.”

### Developer and operator job

“Resolve one trusted, same-Site root target in constant-shape work; fail closed
under scope, cache, generation, or dependency uncertainty; and preserve enough
business evidence to explain and correct every activation.”

## Corrected D16 decision — normative language

### D16-R1 — Site Root Entry is a distinct locale-neutral public concept

The **Site Root Entry** is the exact admitted Site public base with no locale,
Page, Giving, or control path appended. On a dedicated canonical host this is
`https://hope.org/`. On a shared host it is the exact permanent Site base, such
as `https://example.org/hope/`, after the Domain/Site owner has resolved the
host and permanent Site handle.

It is not a Page, Site Locale homepage, alias-domain policy, redirect record,
language preference, Giving address, checkout, Default Site fallback, or
financial identity. D16 governs only the exact canonical Site Root Entry. Alias
host canonicalization and noncanonical slash/host forms remain with their
source owners and must not be silently redefined here.

### D16-R2 — Public GET and HEAD use one 307; unsafe methods never redirect

The root supports `GET`, `HEAD`, and `OPTIONS`. For a favorable current derived
composition:

- public `GET` returns `307 Temporary Redirect`;
- public `HEAD` returns the same `Location`, cache, and security headers with no
  response body;
- `OPTIONS` returns the route platform's standards-compliant, bodyless,
  `no-store` capability response with `Allow: GET, HEAD, OPTIONS` and never
  redirects;
- every known but unsupported method returns `405 Method Not Allowed` with
  `Allow: GET, HEAD, OPTIONS`, `Cache-Control: no-store`, and never a `3xx`;
  and
- an unrecognized/unimplemented method may return `501 Not Implemented` under
  RFC 9110, but it also uses `no-store` and never redirects.

`307` is temporary because the current Default Site Locale may legitimately
change and because visitors should continue using the neutral root. The method
guard is mandatory because `307` preserves the original request method.

### D16-R3 — The target is one exact, trusted, public-ready locale homepage

The target MUST be the final explicit homepage of the one current Default Site
Locale in the same Tenant, originating environment, Site, verified canonical
public base, and current route/public generation. It MUST be a current,
anonymous, favorable `site-locale-home` route that resolves to `200 OK`.

The target MUST NOT be:

- caller-supplied or request-header-selected;
- a relative traversal, scheme-relative URL, external origin, or alias;
- a deep ordinary or specialized Page;
- Giving, `/give`, checkout, donor portal, authentication, protected-action,
  API, webhook, callback, provider return, operation-result, or control route;
- another Site, Tenant, environment, locale fallback, or mutable newest row; or
- a CMS/redirect/plugin/provider value treated as public authority.

The canonical root reaches that final homepage in one Core-controlled hop,
without a loop or chain.

### D16-R4 — Default changes affect only the neutral entry

Changing the current default may change:

- the Site Root Entry's one current destination;
- locale-neutral homepage `x-default` projection when eligible;
- derived root-resolution cache entries; and
- staff-facing current/default history.

It MUST NOT change any explicit Site Locale Public Base, Page path, specialized
route, Giving Address, Giving preference, Source Code, QR or printed artifact,
message/document link, frozen publication, canonical Page identity, historical
attribution, currency, Designation, Legal Entity, Tenant Stripe account,
settlement, bank, receipt, tax, or accounting identity.

A route-manifest delta proving zero explicit Page/Giving URL changes is an
activation prerequisite.

### D16-R5 — Root locale selection is deterministic and uses no hidden signals

The destination depends only on the current source-owned public default and its
compatible active generation. `Accept-Language`, `User-Agent`, browser/device
locale, IP/geolocation, cookies, remembered choice, account/profile preference,
referrer, campaign, currency, provider country, Stripe setting, time zone, and
traffic history never select or override it.

The response emits no `Vary: Accept-Language`. A visitor deliberately chooses
another language through ordinary explicit links on the final locale page.

### D16-R6 — Query and fragment handling are narrow and privacy-safe

The root destination is reconstructed from trusted identifiers; Core MUST NOT
copy the incoming request URL or rely on Next.js configuration redirect
passthrough.

All query parameters are dropped by default. A separately authoritative,
versioned attribution-ingress policy MAY preserve only its fixed, bounded,
sanitized, non-authoritative allowlist under that owner's normalization,
length, character, privacy, retention, duplicate/conflict, and export-safety
rules. D16 does not freeze parameter names: the current Source Code owner MUST
explicitly classify canonical `sc` and any successor before root entry may
carry it. If that owner has not proved the Site Root Entry to be an admitted
same-Site ingress for the exact source meaning, the parameter is dropped.
Earlier Phase 2 `t`/`c`/UTM examples are historical input, not a D16-owned
allowlist. Unknown, unowned, duplicate/conflicting, oversized, malformed,
PII-bearing, auth/session, `next`/return, locale-selection, amount, cadence,
currency, Designation, Giving, checkout, protected-action, and provider
parameters are dropped and never reinterpreted.

The `Location` value MUST contain an explicit, possibly empty, fragment
component so the browser does not inherit the source fragment. A
production-shaped real-browser test MUST prove that a source `#fragment` is
absent at the final locale page. If a framework helper removes the empty
fragment delimiter, it is not conforming for this route.

### D16-R7 — Default change prepares privately and activates atomically

Every default change is first reviewed as a private candidate. A candidate is
workflow intent, not a second default and not public root truth. It pins the
expected current default, Site/locale policy revision, exact target Site
Locale/homepage route, verified-base generation, Public Site Generation,
serving policy, actor authority, compiler/profile versions, and dependency
digest. D17 separately decides whether an ineligible future-default choice may
remain saved as planned work.

Only one authorized, idempotent, expected-head activation may advance the
current **Default Site Locale Version/head**. That immutable version is the
sole root-selection authority: it identifies the stable target Site Locale and
pins the exact homepage allocation, locale-exact Public Site Generation, and
readiness evidence proved at activation. All source-owned validation and
immutable receipt work commits atomically or nothing changes. Runtime,
cache/search, and support effects derive from that current head plus the
currently eligible locale-exact serving generation and converge afterward
through a durable outbox. There is no separately current root head.

### D16-R8 — Public readiness is narrow, complete, and Giving-independent

The target is ready only when the exact default Site Locale is enabled and
public; its homepage, public shell, same-locale Navigation, visible language
control, required safety/legal presentation, verified base, route allocation,
renderer, and complete current locale-exact Public Site Generation are
compatible and no current safety or serving blocker applies.

Optional Giving, Resend, additional Pages, additional locales, and
locale-specific Giving addresses do not block a safe website-default change.
Readiness MUST NOT auto-translate, copy, publish, broaden reach, enable Giving,
or borrow individual fields from another locale.

If the target is not ready, activation is blocked and the currently active root
remains unchanged. Staff receive cause-owned actions; D17 decides whether Core
retains the unready choice as a private plan or requires staff to choose it
again later.

### D16-R9 — One current head owns locale selection; serving stays locale-exact

The Site locale-policy owner owns immutable **Default Site Locale Versions**
and their one current head. The current version is the sole authority for which
stable Site Locale the root selects. The homepage/Page owner owns exact-locale
content and release. Domain/Site owns the verified canonical public base.
Shared route authority owns route class and allocation. Each locale-exact
Public Site Generation owns its own current serving truth; D16 does not create
a Site-global generation or a second current root binding.

The root response and search/cache/support artifacts are derived effects of the
current Default Site Locale Version composed with the current eligible
locale-exact serving generation. A derived immutable effect artifact may pin
the inputs used for evidence and replay, but it has no independently mutable or
current head. A later compatible generation may advance the same explicit
locale homepage without reassigning the default; adverse readiness still
suppresses the favorable root response. Runtime, CMS/Payload, Next.js, cache,
sitemap, `hreflang`, analytics, search provider, browser, and support tools
cannot write back, choose another locale, or become parallel authority. Core
adds no mutable destination string, standalone current-root table/head,
generic redirect collection, or provider-owned redirect.

### D16-R10 — Search treats root as homepage-only x-default, never canonical content

Each eligible explicit locale homepage is a `200`, self-canonical,
self-inclusive member of one reciprocal exact-homepage `hreflang` cluster. The
Site Root Entry MAY be `hreflang="x-default"` only in that homepage cluster
after the Search owner proves the complete eligible relation.

The root:

- has no independent localized canonical Page;
- is not a sitemap `<loc>`;
- emits no duplicate homepage content;
- is not `x-default` for deep Pages, forms, documents, or specialized content;
  and
- is never `x-default`, canonical, or a funnel for Giving.

Deep Pages use only their exact current equivalents. D14's prohibition on
Giving `x-default` and cross-language canonicalization remains unchanged.
Google may continue showing a temporary-redirect source URL in search results;
the neutral root is therefore an intentional discoverable entry, not a hidden
alias or a claim that a locale homepage moved. Explicit locale homepages remain
the only canonical content URLs.

### D16-R11 — Locale navigation stays explicit after arrival

The final locale homepage server-renders the correct `<html lang>` and
direction, same-locale Navigation, and a visible accessible language control.
Home/logo/navigation/breadcrumb/not-found links generated for locale-owned
content point directly to that locale's explicit homepage, never back through
the neutral root. Language alternatives are real semantic links that work
without JavaScript and preserve the corresponding task when an equivalent
exists.

The neutral root is for domain-only entry, not routine internal navigation.
PWA start URLs, installed shortcuts, share links, QR codes, messages, documents,
authentication returns, checkout returns, and protected actions use their
owner-defined explicit destinations.

An intentionally installed explicit-locale PWA remains pinned to that locale
when the Site default later changes. D16 never forces an English installation
to follow a new French default. An error exists only when a cached neutral-root
response overrides the manifest's explicit eligible locale, repeatedly
traverses root, or disagrees with the versioned manifest/start destination.

### D16-R12 — Staff see one consequence-led Maia journey

Mission Control presents the action under **Site → Languages**, within Core's
existing `base-maia`, Base UI, Zinc-token system. It exposes plain product
meaning—not status codes, headers, cache tags, `hreflang`, route manifests, or
database fields.

The review MUST show:

- exact Site and environment;
- **Current** locale and `root → explicit homepage`;
- **After publish** locale and `root → explicit homepage`;
- representative explicit Page and Giving addresses labelled **Unchanged**;
- readiness facts and cause-owned blockers;
- optional-capability facts that do not block;
- exact publish authority/reviewer handoff;
- one private Preview of the candidate homepage; and
- a short permanent statement that existing Page/Giving/QR/shared links and
  finance settings will not change.

One clear primary action uses outcome language such as **Make French (Canada)
default** or **Review and publish**. No typed phrase, HTTP terminology, generic
danger screen, or universal second approval is required. Existing
tenant-configured publication/review boundaries still apply.

### D16-R13 — Permissions route work without bypassing another owner

Capabilities separately govern:

- viewing current/default impact;
- preparing a private default candidate;
- editing or publishing the target homepage/Navigation;
- changing Site locale policy; and
- activating the complete public successor.

A user with only some capabilities may prepare authorized parts and route the
remaining exact blockers to their owning staff role. The UI never grants Page,
Communications, Site, or publish authority by hiding a control or accepting a
caller-provided actor/approver. Reviewers see the same immutable candidate
read-only. Revocation before activation fails closed.

### D16-R14 — Database, RLS, grants, and service paths repeat exact scope

Any later schema MUST use composite same-scope relationships across Tenant,
environment, Site, stable Site Locale, immutable Default Site Locale Version,
its one current head, verified-base generation, homepage allocation,
locale-exact Public Site Generation, serving head, actor authority, and any
derived root-effect evidence. It MUST enforce:

- at most one current Default Site Locale head per exact Site scope and no
  independently current root-effect head;
- target membership in the same scope and eligible `site-locale-home` class;
- immutable scope/provenance and restrictive deletion;
- append-only candidates/receipts/history;
- indexes for current-head, target, occupancy, and reconciliation access; and
- no cascade that releases a public allocation or destroys history.

Browser grants and RLS MUST apply correct `USING` and `WITH CHECK` predicates
for `SELECT`/`INSERT`/`UPDATE`/`DELETE`. An allowed update cannot move a row,
head, target, or owner into another Tenant/Site/locale/environment. Actor,
Tenant, Site, target, authority, and receipt attribution derive from trusted
server/session context, never caller input.

Payload Local API, service role, worker, RPC, import, migration, support,
impersonation, AI assistant, and break-glass paths MUST go through one narrow
server command or repeat identical structural checks. `SECURITY DEFINER`, if
used, has a least-privileged owner, schema-qualified references, pinned empty
`search_path`, and no caller-selected scope.

### D16-R15 — Concurrency, idempotency, and unknown outcomes preserve one head

The activation command uses a durable business idempotency key tied to the
semantic candidate, a bounded lock order, expected revisions, and one
compare-and-swap. Two different candidates cannot both become current; a stale
loser remains safely reviewable and receives a clear conflict outcome.

The same-key same-meaning retry returns the original receipt. Same-key changed
meaning is rejected. A lost response causes receipt/effect reconciliation
before another attempt. Late/out-of-order outbox events carry generation and
effect fences and cannot move the root backward. Correction creates a newly
proved successor; “undo” never mutates or deletes prior history.

### D16-R16 — Redirect response caching is explicit and non-sticky

Launch root redirects use `Cache-Control: no-store`. `307` alone is not treated
as a complete cache policy. Internal trusted resolution MAY reuse ADR-0030
function-level caching only when the function arguments include Tenant,
environment, Site, canonical verified base/host generation, stable Default Site
Locale ID, locale/default policy revision, homepage allocation, Public Site
Generation, serving policy, audience, and resolver/renderer version.

Cache tags are invalidation handles only. They never isolate. Default activation
emits exact outbox invalidation; safety withdrawal/suspension bypasses ordinary
freshness. At launch, any favorable internal resolver entry has a hard maximum
age of `300` seconds; invalidation should make the change observable
immediately, and a missed favorable invalidation MUST self-heal within that
bound. If adverse-state bypass cannot be immediate, that result is not
cacheable. The `300`-second ceiling is a provisional maximum to validate and
tighten, never permission to delay routine activation. Any future shared-edge
caching requires measured need, an explicit browser `max-age=0` posture, a
separately accepted maximum stale-target SLO, atomic invalidation/revalidation,
rollback analysis, and production proof.

### D16-R17 — Failure is adverse, visible, and owner-specific

Before activation, any readiness, authorization, collision, target, compiler,
route, generation, or CAS failure leaves the prior root current and preserves
private work.

After activation:

- a known temporarily suspended Site uses D7's small, `no-store` `503 Service
Unavailable` response;
- an unknown, transferred, retired, tombstoned, or privacy-ineligible
  Site/host uses the applicable privacy-safe not-found result;
- a corrupt/missing target or mixed generation is contained and routed to the
  exact Site Locale/Page/Public Generation owner; and
- no case silently falls back to another locale, Page, Site, Tenant, default,
  Giving entry, fund, or external provider.

Public responses and support evidence reveal no hidden Site/locale existence,
restricted ministry identity/location, actor, Page title, query/fragment,
financial fact, or cross-Tenant state.

### D16-R18 — Migration is inventory-first and removes hidden root coupling

The implementation migration MUST inventory and evidence-classify:

- the current English homepage rendered at `/`;
- the static root canonical/metadata and English `<html lang>`;
- permanent `/home → /` behavior and client-cached consequences;
- every hard-coded `href="/"`, Home breadcrumb, logo, footer, not-found,
  authentication, checkout, protected-action, and provider-return destination;
- the PWA `start_url: "/"` and any service-worker/offline cache;
- root sitemap/robots/manifest/icon/protocol handling;
- current unprefixed Pages/CMS catch-all/static route families;
- `/give`/`/donate` redirects and checkout intent handling;
- current `siteId: null` and host resolver/cache seams; and
- analytics/Page-view attribution, search metadata, tests, and monitoring.

The current `/` representation becomes an exact locale homepage through D15's
evidence-classified migration; D16 MUST NOT infer its locale only from current
copy or today's default. A proved neutral legacy `/home` alias may receive the
same direct dynamic root-entry outcome; otherwise it remains source-owner
adverse. New Core-controlled requests must not chain `/home → / → /lang/*`.
Historical externally cached permanent responses are observable facts, not
recallable product state.

Readers/reservations/negative behavior and mixed-version compatibility land
before the positive writer. Sites activate by cohort only after shadow
comparison. Pre-activation rollback is allowed; after public activation,
recovery is forward and retained root/default/route history is never erased.

### D16-R19 — The solution stays deliberately small

D16 does not ship:

- browser/IP/cookie/profile language negotiation;
- a neutral chooser Page under Option 1;
- per-visitor root destinations or experiments;
- a generic redirect manager, wildcard/regex/rule DSL, priority, or schedule;
- a separate mutable root-selection table/head/service or Site-global
  publication head; immutable derived evidence may exist but never select;
- automatic translation, fallback, or publication;
- alias-domain, canonical-domain, or broad legacy redirect policy;
- Giving, checkout, currency, provider, or finance configuration;
- editable `x-default`/canonical/sitemap controls; or
- speculative global route infrastructure or sharding.

Measured future needs return to the owning decision rather than entering as
hidden escape hatches.

### D16-R20 — Traceability and amendment are mandatory before implementation

The exact terms **Site Root Entry**, **Default Site Locale**, **Default Site
Locale Version**, **Site Locale Public Base**, **Public Site Generation**, and
**Giving Address** must retain one meaning across the glossary, decision log,
the eventual URL/route ADR, Phase 24 PRD, OpenSpec delta, design, tasks, GitHub
issues, schema, migration, tests, release evidence, operations UI, and
monitors.

D16 does not need a standalone ADR: `307` was selected specifically to remain
reversible, so the hard-to-reverse criterion is not independently met. The
later specification flow MUST amend the eventual D15 URL/route ADR and accepted
ADR-0026, reconcile proposed Phase 22/23 route/search generation decisions, and
record D16's root-only `x-default` exception without weakening D14 Giving.

## Complete staff journey

### 1. Start with the consequence, not a locale dropdown

**Site → Languages** shows a quiet summary:

```text
Website default language

English (United States)                         Default
Typing hope.org opens hope.org/lang/en-us

French (Canada)                                Live
Arabic                                         Not ready · 3 items
```

The ordinary single-locale Site stays compact. It does not receive a
translation dashboard or technical routing panel.

### 2. Make the action discoverable but proportionate

The French row exposes **Make default** only to someone allowed to prepare or
activate the change. A user who can prepare but not publish sees **Prepare
default change** and the owning reviewer—not a dead or privilege-leaking
button.

### 3. Show current, planned, and unchanged facts together

The review uses a focused dialog or sheet at desktop and a single-column page
on small screens:

```text
Make French (Canada) the default website language?

Current
hope.org/ opens English (United States)
hope.org/lang/en-us

After publish
hope.org/ will open French (Canada)
hope.org/lang/fr-ca

Unchanged
✓ hope.org/lang/en-us/about
✓ hope.org/lang/en-us/give/clean-water
✓ Existing Page, Giving, QR, and shared links
✓ Currency, Stripe, bank, settlement, and accounting settings
```

The primary sentence is persistent:

> What opens when someone types only the domain changes to French (Canada).
> Existing Page and Giving addresses and existing content stay unchanged.

### 4. Make readiness actionable, not bureaucratic

Readiness appears in plain, source-owned groups:

```text
Ready
✓ French homepage is public-ready
✓ French navigation stays in French
✓ Visitors can switch to English

Needs another owner
! Website publication requires a Website publisher
  Prepare change and request review

Does not block this change
Giving in French is not enabled
```

Each blocker has one action or owner. “Giving not enabled” is informational and
cannot turn the whole card red.

### 5. Preview the real candidate

**Preview French website** opens the exact private candidate through the
governed Preview contract. Preview carries no public canonical, `x-default`,
sitemap, cache, analytics, or share authority. The review remains available
after returning, preserving input and focus.

### 6. Publish once, with honest progress

The primary action says **Make French (Canada) default** or **Review and
publish**, never **Save settings**. During work it is disabled and labelled
**Publishing…**. The UI does not show success until the authoritative receipt
exists.

If the outcome is unknown, it says:

> We are confirming whether the website default changed. Do not submit it
> again.

Core reconciles the same command and then shows the original result.

### 7. Return a durable, useful receipt

```text
Website default changed

hope.org/ now opens French (Canada).
Existing Page and Giving addresses were not changed.

Published by Maria · 27 Aug 2026, 14:32

[Open website]  [View change record]  [Change website default]
```

The receipt separately reports local activation, root probe, cache convergence,
and search projection. It never labels an external crawler result **Indexed**
without provider evidence.

### 8. Correct forward without destructive “undo”

Making English default again uses the same reviewed successor flow. The product
may say **Change website default**; it must not imply that deleting audit
history or restoring a mutable prior row is safe.

### 9. Preserve accessibility and low-bandwidth usability

The flow uses labelled Base UI controls, semantic headings, text-plus-icon
states, visible focus, keyboard order matching visual order, polite status
announcements, non-color errors, 44-by-44 CSS-pixel targets where applicable,
320-CSS-pixel reflow, 400% zoom, forced colors, reduced motion, long/CJK/RTL
text, native language names with correct `lang`/`dir`, and form/input
preservation after network failure. No essential meaning depends on hover,
animation, flag icons, or a side-by-side layout.

## Complete visitor journey

### 1. Domain-only entry is one predictable temporary hop

A visitor requests `https://hope.org/`. Host admission and serving policy run
before root resolution. A valid current derived composition returns one `307` to
`https://hope.org/lang/fr-ca#`. The locale homepage is a final `200` and works
without JavaScript.

### 2. The page is honestly French and makes language choice obvious

The response declares French (Canada), renders French same-locale Navigation,
and exposes a clear language control in a consistent location. The visitor can
choose English deliberately. Browser language, IP, currency, and cookies do
not make that choice for them.

### 3. Continuing within the Site never re-enters the neutral root

The logo, Home link, Navigation, breadcrumbs, and ordinary internal links point
to `/lang/fr-ca` or another explicit French path. A later staff default change
does not unexpectedly switch this visitor's in-progress journey.

### 4. Explicit Page and Giving intent remains exact

Opening `/lang/en-us/about` remains English. Opening
`/lang/en-us/give/clean-water` remains the same English Giving address and
entry meaning. Neither request visits the root or changes locale, Designation,
currency, Stripe account, settlement, or financial identity.

### 5. Failure stays honest

A temporarily suspended known Site receives D7's small `503`. An unknown or
retired Site receives its privacy-safe result. A missing French homepage does
not silently open English, another Site, a generic fund, or checkout.

## Source of truth and ownership map

| Fact                                      | Authoritative owner                             | Derived consumers                              | Forbidden ownership                     |
| ----------------------------------------- | ----------------------------------------------- | ---------------------------------------------- | --------------------------------------- |
| Stable Site and public-base identity      | Site/Domain owner                               | root resolver, route compiler, staff impact    | request Host, CMS slug, cache           |
| Current Default Site Locale Version/head  | Site locale-policy owner                        | root resolver, staff settings, effect compiler | browser/profile/currency/provider       |
| Exact locale homepage content/release     | Page/publication owner                          | locale-exact Public Site Generation            | root redirect, locale preference        |
| Root route class/allocation               | shared public-route authority                   | runtime and probes                             | Next config, Payload redirect plugin    |
| Current locale-exact serving generation   | Public Site Generation owner                    | root resolver, Page runtime, probes            | Site-global root head                   |
| Derived root response/effect evidence     | compiler from the two current source heads      | runtime, support, search/cache outbox          | independently current binding/head      |
| Root `307` response                       | Public Route Platform                           | browser/CDN observations                       | CMS/provider/dashboard                  |
| Landing attribution query                 | current versioned Source Code/ingress owner     | downstream admission after revalidation        | D16 allowlist, route or locale selector |
| Homepage canonical/`hreflang`/`x-default` | Search & Sharing compiler from source manifests | HTML/search artifacts                          | tenant raw metadata, Giving             |
| Visible language control                  | Navigation/presentation owners                  | visitor navigation                             | root negotiation                        |
| Giving route/entry/admission/finance      | Giving and financial source owners              | exact donor flow                               | root/default locale/Site identity       |
| Audit/receipt                             | Site/default command owner                      | staff history/support                          | logs or external provider state         |

## Domain invariants and valid cardinality

1. One active Site/environment has exactly one current immutable Default Site
   Locale Version/head; a private candidate is never a second current default.
2. The current Default Site Locale Version is the sole locale-selection
   authority for one exact canonical Site Root Entry; no independently current
   root binding or Site-global publication head exists.
3. Favorable behavior composes exactly one same-scope stable Site Locale from
   that version with one current eligible locale-exact Public Site Generation
   and `site-locale-home` allocation. Derived effect evidence cannot select.
4. The current default version, target public base, locale, homepage, route
   generation, and locale-exact serving head share Tenant, environment, Site,
   and verified-base identity through structural relationships.
5. Zero eligible defaults, two current defaults, an ineligible homepage, or
   mixed generations make favorable redirection impossible.
6. The root cannot be a Page/Giving allocation and the target cannot be Giving,
   external, deep content, control, callback, checkout, or another scope.
7. Default/root activation is externally atomic; preparation and downstream
   convergence do not create partial public truth.
8. Explicit route identities and frozen artifacts are invariant under a default
   change.
9. Scope, actor, authority, prior/new heads, target, compiler/profile, and
   receipt provenance are immutable retained history.
10. Public route allocations and audit receipts are never reused or cascade
    deleted.
11. Search, cache, Navigation, analytics, and providers consume root/default
    truth one way and cannot write it back.
12. No current or historical root fact selects Giving or financial identity.

## Lifecycle and transition model

| State                 | Meaning                                                  |                Favorable public root? | Valid next movement                    |
| --------------------- | -------------------------------------------------------- | ------------------------------------: | -------------------------------------- |
| No candidate          | current default-locale head unchanged                    |                  current outcome only | prepare                                |
| Preparing             | private intent and dependency work                       |                  current outcome only | ready, cancel                          |
| Needs attention       | candidate has exact blockers or stale proof              |                  current outcome only | repair/reprepare, cancel               |
| Ready for review      | complete private candidate and impact                    |                  current outcome only | activate, reject, stale                |
| Activating            | one idempotent CAS/receipt command in flight             |     current outcome only until commit | current, conflict, unknown             |
| Current               | authoritative Default Site Locale Version/head committed | yes if Site serving remains favorable | prepare successor, adverse containment |
| Outcome unknown       | client lost result; authoritative truth may exist        |       read current authoritative head | reconcile same command only            |
| Contained/unavailable | serving or target safety owner blocks favorable response |                                    no | source-owned recovery successor        |
| Superseded            | retained prior default version and effect evidence       |                  no current authority | read-only history                      |

Forbidden transitions include private → public by preview, provider success,
cache mutation, latest-row selection, scheduled job without current proof,
automatic timeout, or client retry; current → prior by destructive rollback;
and any state → another locale/Site/Giving fallback.

## Current behavior, intended behavior, and permanent path

| Concern            | Current `develop` behavior                                                                 | D16 intended behavior                                             | Permanent path                                                           |
| ------------------ | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Root               | English-oriented homepage renders directly at `/`                                          | locale-neutral 307 entry only                                     | migrate homepage to explicit D15 route, then activate root by cohort     |
| Canonical/language | root layout statically uses GiveHope URL, English locale, and root canonical               | explicit locale homepage owns language/canonical; root has none   | compile exact route metadata per generation                              |
| Home links         | many nav/logo/breadcrumb/not-found links use `/`                                           | locale-owned links use explicit locale home                       | replace copied literals with typed route references                      |
| `/home`            | permanent `/home → /`                                                                      | no new two-hop chain                                              | evidence-classify; proved neutral alias uses direct dynamic root outcome |
| PWA                | manifest `start_url` is `/`                                                                | installed locale experience uses owner-approved explicit start    | inventory and version manifest/start destinations                        |
| Giving/checkout    | host-blind `/give`/`/donate` redirects and unauthenticated checkout fallback can reach `/` | root never disposes Giving or checkout intent                     | fence/remove through D10–D15 and owner-specific return contracts         |
| Site scope         | public context still has `siteId: null`                                                    | verified host → exact Site → current generation                   | D15/Site schema and resolver are hard dependencies                       |
| CMS paths          | unprefixed static/CMS catch-all routes coexist                                             | locale-bearing content is below explicit D15 base                 | negative route reader/reservation before writer                          |
| Cache              | current public reads use host-based request/cache seams                                    | sole default head + eligible locale generation; no-store redirect | ADR-0030 arguments, 300-second hard ceiling, exact invalidation/outbox   |
| Search             | root static metadata; no D16 `x-default`                                                   | homepage-only root `x-default` after eligible compile             | reconcile proposed ADR-0172 in spec flow                                 |
| Staff              | no Phase 24 default-root journey                                                           | current/planned/unchanged impact and receipt                      | shared Maia/Base UI, capability-routed workflow                          |

## Adversarial category review

Every requested category has at least one material concern if the founder
answer remains informal. The concern is the missing boundary, not evidence that
the selected visitor behavior is inherently bad. Each row states the failure,
impact, severity, likelihood, evidence, effect on the answer, permanent
prevention, and exact clause that carries it.

### 1. Problem validity, necessity, and alternatives

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                             |        Severity / likelihood | Evidence and reasoning                                                                                                                                                                                                                                 | Effect on D16                                                                       | Permanent fix and exact language                                                                                                           |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Core could solve “what happens at the bare domain?” as hidden visitor-language prediction rather than a stable entry job. Shared devices, crawlers, missionaries abroad, and stale preferences would then get surprising outcomes.                 |                  High / High | **Verified external fact:** Google recommends distinct language URLs and warns against inferred-language redirects; W3C says any negotiated choice needs a clear override. **Repository fact:** D15 makes explicit routes stable and negotiation-free. | Narrows, does not invalidate, Option 1.                                             | **D16-R1, R3, R5, R11:** root is a deterministic entry to the current public default with visible manual switching; no hidden signals.     |
| The strongest alternative—a neutral `200` language chooser—better represents unmatched languages but adds a click to every multi-locale domain-only visit and a new Page/product.                                                                  |              Medium / Medium | **Verified external fact:** Google names selectors and auto-redirecting homepages as valid `x-default` patterns. **Product judgment:** Core prioritizes fewer reasonable steps when safety is equal.                                                   | Confirms Option 1, while preserving a future evidence-based reopening.              | **D16-R10 and R19:** accept a homepage-only `x-default` redirect; do not build a chooser under Option 1.                                   |
| A no-build path would keep today's English homepage at `/` while also claiming every real homepage is explicit under D15. The same root would then be both locale-neutral and English content, and changing the default could silently relabel it. | Critical / Certain after D15 | **Current behavior:** `/` renders an English-oriented Page and static root canonical. **Repository fact:** D15 forbids favorable unprefixed locale content.                                                                                            | Rejects no-build as the permanent answer; it does not authorize a rushed migration. | **D16-R1, R4, R18:** source-prove and move current root content to one explicit locale before activating the neutral entry by Site cohort. |

### 2. Brittleness

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                                        | Severity / likelihood | Evidence and reasoning                                                                                                                                                                | Effect on D16                                                                                 | Permanent fix and exact language                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Hard-coded `/`, mutable latest locale/page rows, shared-host bases, trailing-slash normalization, withdrawn homepages, or a static redirect can produce a loop, chain, wrong host, or dead target. The design would work only on an ideal single-domain Site. |           High / High | **Current behavior:** static root/home/metadata/nav assumptions exist. **Proposed evidence:** Phase 23 uses complete generation-bound route truth and fails closed under mixed state. | Requires generation-bound target resolution and migration; informal Option 1 is insufficient. | **D16-R1, R3, R7–R9, R18:** typed canonical Site base, exact homepage reference, one complete generation, inventory-first cutover, one hop. |

### 3. Technical debt

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                                  | Severity / likelihood | Evidence and reasoning                                                                                                                                                                                                                     | Effect on D16                          | Permanent fix and exact language                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A `default_root_url` column, Next config entry, Payload redirect row, CMS hook, independently current root binding, and sitemap copy could all drift into writable truths. Every future locale change would require fragile synchronization and repair. |           High / High | **Accepted repository fact:** ADR-0029 rejects copy-as-authority; ADR-0030 separates cache keys from invalidation. **Proposed repository fact:** Phase 23 generations are locale-exact and intentionally avoid a Site-global serving head. | Strongly narrows implementation shape. | **D16-R9 and R19:** one current Default Site Locale Version/head selects locale; compose it with the current eligible locale generation; derived immutable effects have no current head; no copied URL, redirect DSL, or provider authority. |

### 4. Edge cases

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                                                                        | Severity / likelihood | Evidence and reasoning                                                                                                                                                            | Effect on D16                           | Permanent fix and exact language                                                                                                                             |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Zero/one/many locales, no public default, a default withdrawn during activation, a shared-host Site, canonical-host departure, query/fragment input, source suspension, and a concurrent homepage release all produce different safe outcomes. One happy-path sentence leaves them undefined. |           High / High | **Repository fact:** D7/D8 distinguish known temporary unavailability from privacy-safe absence and retirement. **HTTP fact:** methods/fragments/queries have distinct semantics. | Adds a full state and failure contract. | **D16-R1–R8, R15–R18** plus the lifecycle table: favorable only under complete same-scope truth; otherwise owner-specific adverse response with no fallback. |

### 5. Footguns

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                      | Severity / likelihood | Evidence and reasoning                                                                                                                                                                | Effect on D16                                                         | Permanent fix and exact language                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| An unguarded `307` preserves a `POST` to the homepage; Next config forwards query parameters; `href="/"` can switch a visitor's language later; `/home → / → /lang/*` creates a chain; and an absolute caller URL becomes an open redirect. |       Critical / High | **Verified external fact:** RFC 9110 makes `307` method-preserving and fragments inheritable; Next documents query passthrough. **Current behavior:** all named root couplings exist. | Makes explicit method, query, target, and migration guards mandatory. | **D16-R2, R3, R6, R11, R18:** GET/HEAD only, trusted generated target, drop-by-default query, explicit empty fragment, explicit internal Home links, one-hop canonical root. |

### 6. Tenant safety

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                 | Severity / likelihood | Evidence and reasoning                                                                                                                                                                                                  | Effect on D16                                                              | Permanent fix and exact language                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A spoofed host, incomplete cache key, wrong Site lookup, or newest-row selection could send Tenant A's domain to Tenant B's homepage and expose brand, locale, ministry, or restricted-location facts. |     Critical / Medium | **Accepted repository fact:** platform principles put Tenant safety first; ADR-0028 requires fail-closed public isolation. **Current behavior:** `siteId` is null and current resolver consumes forwarded/host headers. | Blocks standalone redirect implementation before verified Site resolution. | **D16-R3, R7, R9, R14, R16–R18:** host admission first; composite same-scope references; full cache arguments; uniform negative results; cross-Tenant poison tests. |

### 7. Database, RLS, and authorization safety

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                         | Severity / likelihood | Evidence and reasoning                                                                                                                                                           | Effect on D16                                              | Permanent fix and exact language                                                                                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Caller-controlled Tenant/actor/target fields, application-only uniqueness, permissive updates, or service-role/Payload bypass could move a permitted row/head into a forbidden scope, publish without Page authority, or produce two defaults. |     Critical / Medium | **Repository fact:** backend rules assume RLS but require server command ownership for privileged multi-table work; OpenSpec requires both `USING` and `WITH CHECK` correctness. | Requires structural authorization, not UI-only checks.     | **D16-R13–R15:** composite same-scope keys; one current head; immutable scope; restrictive delete; operation-correct grants/RLS; server-derived actor/scope/target; poison tests for RPC/import/Payload/support/service paths. |
| One capability called `site:manage` could silently grant content publication or root activation.                                                                                                                                               |         High / Medium | **Platform boundary:** public content, Site configuration, and publication have distinct owners and tenant moderation must be respected.                                         | Separates staff actions without multiplying product roles. | **D16-R13:** independently authorize view, prepare, Page/Navigation edit/publish, locale-policy change, and activation; route remaining work to owners.                                                                        |

### 8. Overengineering

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                                               | Severity / likelihood | Evidence and reasoning                                                                                                                                                                                                                        | Effect on D16                    | Permanent fix and exact language                                                                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A browser-language service, per-visitor cookie memory, planned-root table, redirect orchestration engine, configurable rule DSL, scheduler, Site-global generation, or global route service would solve speculative cases and create more state than the root entry. |         Medium / High | **Product judgment:** one deterministic current Default Site Locale head plus existing locale-exact serving truth solves the accepted job. **Repository principle:** repeated behavior belongs in shared owners, not a generic second system. | Simplifies the corrected answer. | **D16-R7, R9, R19:** reuse the private candidate, locale-exact generation, and owner routing; no negotiation, second root authority, Site-global publication head, redirect product, or speculative infrastructure. |

### 9. UX/UI and user friction

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                | Severity / likelihood | Evidence and reasoning                                                                                                                                                                                                                                                                                                                       | Effect on D16                                                                | Permanent fix and exact language                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| “Set default” sounds as if Core will rewrite every URL, translation, Giving experience, or finance setting. Staff may avoid the action or make it without understanding the one real consequence: domain-only visits change language. |           High / High | **Assumption:** no representative Core staff study has yet validated the phrase. **Comparable evidence:** Webflow separates locale settings/status/preview; Shopify warns that default-language changes can have destructive side effects in its model, demonstrating the need for explicit impact copy rather than importing that behavior. | Adds consequence-led UX and usability validation.                            | **D16-R12 and complete staff journey:** current/after/unchanged addresses, plain permanent sentence, exact readiness, Preview, one outcome-labelled action, receipt. |
| Blocking all preparation until French is ready may lose work; switching immediately breaks visitors. Whether Core persists an unready choice is a separate staff-workflow decision.                                                   |         High / Medium | **Repository product principle:** reduce manual glue while preserving publication truth.                                                                                                                                                                                                                                                     | Keeps the safety floor and creates D17 rather than pre-deciding persistence. | **D16-R7–R8, R13:** every activation is privately reviewed and the current root changes only at complete activation; D17 chooses the unready-planning UX.            |
| A rich dashboard, flags, technical SEO controls, or dense cross-locale matrix would make an occasional task harder.                                                                                                                   |         Medium / High | **Repository UI contract:** clarity/accessibility/perceived speed outrank decorative richness; exact `base-maia` must remain.                                                                                                                                                                                                                | Narrows UI scope.                                                            | **D16-R12:** quiet list, native names, progressive disclosure, no flags/HTTP/cache/search jargon or second visual system.                                            |

### 10. Source of truth, ownership, and domain invariants

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                              | Severity / likelihood | Evidence and reasoning                                                                                                        | Effect on D16                                         | Permanent fix and exact language                                                                                                                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Site policy, CMS homepage, route registry, a second current root binding, cached URL, Next metadata, and search projection could each claim the root. Circular sync or “latest wins” would make historical and live behavior impossible to explain. |       Critical / High | **Repository fact:** ADR-0027–0030 and proposed locale-exact Public Site Generations separate owners and derived projections. | Requires one-way composition and explicit invariants. | **D16-R9, ownership map, invariants 1–12:** one Default Site Locale head selects locale; Page/route/generation owners keep their facts; root/search/cache effects derive and cannot become current authority. |

### 11. Hidden coupling

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                                                               | Severity / likelihood | Evidence and reasoning                                                                                                                                                                     | Effect on D16                                      | Permanent fix and exact language                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Root is currently Home, canonical, Open Graph URL, English language, PWA start, logo/footer/breadcrumb/not-found target, auth fallback, unauthenticated checkout fallback, and legacy `/home` target. Changing only the Page would silently change user tasks or lose Giving intent. |       Critical / High | **Current source evidence:** `apps/donor/app/layout.tsx`, `next.config.ts`, `proxy.ts`, `packages/config/site-shared.ts`, shared navbar/footer, breadcrumbs, and manifest all bind to `/`. | Expands migration inventory but not product scope. | **D16-R11 and R18:** classify each consumer; locale UI uses explicit home; auth/checkout/protected/provider owners keep task-specific destinations; root is never a generic “safe” return. |

### 12. Failure modes

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                           | Severity / likelihood | Evidence and reasoning                                                                                                                    | Effect on D16                                      | Permanent fix and exact language                                                                                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| A lost activation response, failed cache invalidation, homepage withdrawal, resolver outage, or partially compiled generation could leave staff unsure, redirect to a dead Page, or invite duplicate activation. |         High / Medium | **Repository fact:** D7/D15 use authoritative receipts, last-known-good heads, outboxes, adverse-first containment, and forward recovery. | Adds fail-safe recovery and truthful staff states. | **D16-R7–R8, R15–R17:** prior head until commit; reconcile unknown outcome; safety bypass; no fallback; owner-routed repair; successor recovery. |

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                        | Severity / likelihood | Evidence and reasoning                                                                                                                                              | Effect on D16                                            | Permanent fix and exact language                                                                                                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Two staff choose different defaults, the target locale is withdrawn while activation runs, a host generation changes, or an old outbox arrives late. Individually valid actions could jointly produce a root whose target was never reviewed. |       Critical / High | **Repository fact:** proposed Phase 22/23 activation uses expected heads and complete digests; Core durable operations use semantic idempotency and reconciliation. | Requires precise states/transitions and a single winner. | **D16-R7, R15 and lifecycle table:** pin every head/digest, bounded lock order, one CAS, stale conflict, same-meaning retry, changed-meaning rejection, late-event fence, forward correction. |
| Time zones or backdating could be used to make an old default appear current.                                                                                                                                                                 |     High / Low-Medium | **Domain reasoning:** root meaning is release order/current-head truth, not a civil-time calculation.                                                               | Clarifies temporal authority.                            | **D16-R15:** current head and commit/effect sequence determine public truth; display timestamps are evidence only and never choose the root.                                                  |

### 14. Data integrity risks

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                              | Severity / likelihood | Evidence and reasoning                                                                                                                                    | Effect on D16                                            | Permanent fix and exact language                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default change could rewrite explicit Page/Giving paths, frozen QR/message/document URLs, route occupancy, source attribution, or analytics identity; reporting may double-count root and final page as two visits. |     Critical / Medium | **Repository fact:** D10–D15 freeze addresses/artifacts and keep root/Giving separate. Phase 2 says Source Code is an orthogonal, typed attribution axis. | Requires a zero-URL-delta proof and analytics semantics. | **D16-R4, R6, R9, R18:** explicit routes byte-identical; frozen artifacts never re-resolve; root request is an entry event, not a Page/contribution identity; final Page view and allowed attribution remain source-owned. |

### 15. Security and privacy risks

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                   | Severity / likelihood | Evidence and reasoning                                                                                                                                                                                               | Effect on D16                                                                          | Permanent fix and exact language                                                                                                                                                                      |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Host-header poisoning, external/scheme-relative/CRLF/path injection, open redirects, query PII, inherited fragments, restricted locale enumeration, cross-scope cache leakage, or verbose errors can expose users or ministry locations. |     Critical / Medium | **Verified external fact:** RFC 9110 warns about Host routing and fragment disclosure; OWASP documents unvalidated redirects. **Repository principle:** unknown public scope fails closed and telemetry is redacted. | Makes target construction, fragment clearing, and uniform negative behavior mandatory. | **D16-R3, R6, R14, R16–R18:** verified stored base; typed route; explicit empty fragment; drop query; no raw target input; uniform adverse response; redacted bounded telemetry; hostile-input tests. |

### 16. Scalability and performance risks

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                                        | Severity / likelihood | Evidence and reasoning                                                                                                                                                                                                                                                                   | Effect on D16                                                                                                             | Permanent fix and exact language                                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Scanning locales/pages or calling CMS/providers on every root request, varying by language headers, creating redirect chains, or measuring only resolver time will degrade or hide a slow visitor journey as Tenants, Sites, locales, bots, and traffic grow. |         High / Medium | **Accepted repository fact:** ADR-0030 uses function-level caching with scope arguments; Core's current E2E and Web Vitals seams use a `2500 ms` LCP boundary. **Verified external fact:** current Web Vitals guidance evaluates LCP at the 75th percentile and segments mobile/desktop. | Requires constant-shape serving plus end-to-end visitor proof, not speculative sharding or a resolver-only success claim. | **D16-R3, R5, R9, R16 and AC74:** one indexed current-head lookup or trusted function-cache hit; no provider/CMS scan, language `Vary`, or chain; measure redirect duration and navigation-start-to-final-homepage LCP with a `2500 ms` p75 launch budget per device class. |

### 17. Operational burden

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                            | Severity / likelihood | Evidence and reasoning                                                                                                | Effect on D16                                       | Permanent fix and exact language                                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Manual URL edits, cache purges, SQL fixes, search resubmission, and unclear owner handoffs would turn one simple public setting into recurring support work and tribal knowledge. |         Medium / High | **Repository principle:** repeated manual glue should become safe system behavior; Mission Control is the staff home. | Requires guided workflow and automatic convergence. | **D16-R7–R18:** typed readiness, exact owner routing, atomic command, outbox, durable receipt, scoped support evidence, forward repair; no direct DB/provider fix path. |

### 18. Observability and auditability gaps

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                 | Severity / likelihood | Evidence and reasoning                                                                                       | Effect on D16                          | Permanent fix and exact language                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------: | ------------------------------------------------------------------------------------------------------------ | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Request logs cannot prove which default/root generation was authoritative, who approved it, whether explicit URLs changed, whether a cache was stale, or whether search merely observed an old result. |           High / High | **Repository fact:** Core distinguishes durable business history, technical logs, and external observations. | Adds receipt/audit and named monitors. | **D16-R7, R12, R15–R17:** immutable actor/authority/prior/new heads, exact before/after root, zero explicit-route delta, dependencies, receipt, timestamps; separately label local activation, public probe, cache convergence, and provider observations. |

### 19. Dependency and integration risks

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                | Severity / likelihood | Evidence and reasoning                                                                                                                                                        | Effect on D16                                                  | Permanent fix and exact language                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Next allows external destinations and auto-passes queries in config redirects; browsers inherit fragments; CDNs may store redirects; Payload could be mistaken for route authority; Google can lag or ignore inconsistent `hreflang`. |         High / Medium | **Primary sources:** RFC 9110/9111, Next redirect docs, Google multilingual/localized guidance. **Repository fact:** adapters/providers are subordinate to Asym source truth. | Requires adapter conformance and explicit provider boundaries. | **D16-R2–R3, R6, R9–R10, R16–R18:** typed response policy, no static config passthrough, explicit cache/fragment behavior, provider-neutral source truth, browser/CDN/search fixtures. |

### 20. Migration, rollout, and upgrade risks

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                                                                           | Severity / likelihood | Evidence and reasoning                                                                                                                                                        | Effect on D16                                               | Permanent fix and exact language                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Deploying D16 before D15 Site/locale routes, verified Site resolution, complete generation, and route reservations would turn current English `/` into a broken or unsafe redirect. N/N-1 code may disagree on root meaning; rollback after writes could render localized content at root again. |       Critical / High | **Current behavior:** all required seams remain incomplete. **Repository fact:** D15 and proposed Phase 23 require reader/reservation and mixed-version proof before writers. | Establishes hard dependencies and cohort rollout.           | **D16-R18:** inventory/shadow; additive compatible schema; negative reader before positive writer; mixed-version tests; cohort activation; pre-activation rollback only; post-activation forward recovery with retained history. |
| Existing external/browser caches may retain `/home → /` even after Core fixes its live chain.                                                                                                                                                                                                    |         Medium / High | **HTTP fact:** permanent redirects can persist outside product control.                                                                                                       | Does not block D16, but prevents false zero-history claims. | **D16-R18:** new Core-controlled requests use direct behavior; observe historical caches and never claim recall or destructive rollback.                                                                                         |

### 21. Testability, traceability, and proof

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                     | Severity / likelihood | Evidence and reasoning                                                                                               | Effect on D16                                                   | Permanent fix and exact language                                                                                                                                                                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| “Root opens the default” can pass one browser snapshot while methods, fragments, query policy, host poisoning, RLS, cache keys, concurrent activation, `x-default`, explicit Giving URLs, and mixed versions remain wrong. |           High / High | **Repository OpenSpec rule:** behavior must be observable and negative/failure/authorization scenarios are required. | Requires independently falsifiable criteria and artifact trace. | **D16-R20 and D16-AC1–AC78:** positive, negative, boundary, authorization, concurrency, migration, accessibility, load, failure, and production-shaped proof tied to glossary → ADR amendment → spec/design/tasks/tickets/tests/release evidence. |

### 22. Other development hazards

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                             | Severity / likelihood | Evidence and reasoning                                                                                                                                                        | Effect on D16                                        | Permanent fix and exact language                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PWA launch URLs, service workers, prefetch, analytics, error pages, generic post-auth returns, and crawler/card fetches may repeatedly enter root, double-count, cache a stale target, or discard the user's task. |         High / Medium | **Current behavior:** manifest and multiple shared/error/auth flows use `/`. **Architecture reasoning:** each return/action has a source owner and root has no task identity. | Expands inventory and proof, not root product scope. | **D16-R11 and R18:** inventory every root consumer; use explicit locale/task-owned destinations; root response is an entry event, not a content/gift completion; prove no service-worker/offline stale redirect. |

## Required acceptance criteria and proof

### Scope, status, method, and target

1. **D16-AC1 — Dedicated-host root identity.** On a dedicated canonical host,
   only the normalized exact Site public-base root is the Site Root Entry.
2. **D16-AC2 — Shared-host root identity.** On a shared host, the exact
   permanent Site public base/handle is the root; another Site or origin root is
   not.
3. **D16-AC3 — Route-class precision.** Query, fragment, slash, case, encoding,
   IDNA, port, and router-equivalent forms are classified by the shared
   canonicalizer; no Page/catch-all can claim the exact root allocation.
4. **D16-AC4 — GET semantics.** Eligible public `GET` returns exactly `307`
   with the trusted final `Location`.
5. **D16-AC5 — HEAD parity.** Eligible public `HEAD` returns `307` with
   identical `Location`, cache, and security headers and no body.
6. **D16-AC6 — OPTIONS is nonredirecting.** `OPTIONS` returns the route
   platform's defined bodyless, `no-store` capability result with
   `Allow: GET, HEAD, OPTIONS` and never a `3xx`.
7. **D16-AC7 — Unsafe/unsupported methods.** `POST`, `PUT`, `PATCH`,
   `DELETE`, and every other known unsupported method never redirect and return
   `405` with `Allow: GET, HEAD, OPTIONS` and `Cache-Control: no-store`.
   Unrecognized/unimplemented methods may return `501`, but also never redirect
   and use `no-store`.
8. **D16-AC8 — Temporary, not permanent.** Root emits no `301` or `308` and
   no equivalent sticky browser directive.
9. **D16-AC9 — Final one-hop target.** The canonical root reaches one eligible
   explicit homepage `200` in exactly one Core-controlled hop.
10. **D16-AC10 — No loop/chain.** Same-path, self, predecessor, locale-to-root,
    root-to-alias, and cyclic route fixtures produce no favorable loop or
    multi-hop chain.
11. **D16-AC11 — Same complete scope.** Target and root share exact Tenant,
    environment, Site, verified canonical base generation, and current public
    generation.
12. **D16-AC12 — Trusted base.** Request `Host`, forwarded-host variants,
    protocol-forwarding headers, query, referrer, and body cannot choose the
    `Location` origin or Site base.
13. **D16-AC13 — Stable default identity.** Target selection uses the stable
    current Default Site Locale ID and pinned profile—not a raw locale string,
    array position, default country, or newest row.
14. **D16-AC14 — Eligible exact homepage.** Target is the current
    `site-locale-home` allocation with current exact-locale Page/presentation/
    shell/Navigation/public-generation proof.
15. **D16-AC15 — Forbidden targets.** External, scheme-relative, CRLF, path-
    traversal, alias, deep Page, old predecessor, Giving, checkout, auth, API,
    webhook, callback, protected-action, operation-result, provider-return,
    sibling-Site, and cross-Tenant target poison is rejected.
16. **D16-AC16 — No hidden language input.** Varying browser language,
    `Accept-Language`, IP, cookie, device, profile, account, referrer, currency,
    provider country, Stripe state, or time zone leaves the target identical.
17. **D16-AC17 — No hidden cache variation.** Root emits no
    `Vary: Accept-Language` or equivalent language-negotiation cache key.

### Default change, explicit URLs, query, and fragments

18. **D16-AC18 — Only root changes.** A before/after manifest diff for a
    successful default change contains exactly one Default Site Locale head
    change plus D16-authorized derived root/search effects and no other public
    route mutation or independently current root head.
19. **D16-AC19 — Ordinary Page stability.**
    `/lang/en-us/about` remains byte-for-byte the same address and exact English
    meaning after French becomes default.
20. **D16-AC20 — Giving stability.**
    `/lang/en-us/give/clean-water` remains byte-for-byte the same Issued Giving
    Address, language, entry, and Site attribution after the change.
21. **D16-AC21 — Frozen artifact stability.** Existing QR, print, message,
    document, schedule, download/export, and sharing artifacts do not re-resolve
    through root or acquire a new URL.
22. **D16-AC22 — Finance neutrality.** Default/root activation creates zero
    Designation, currency, Giving-admission, contribution, commitment, Legal
    Entity, Stripe, settlement, bank, receipt, tax, ledger, or accounting
    mutation/effect.
23. **D16-AC23 — Unready target cannot activate.** A missing, draft,
    unreleased, stale, withdrawn, or safety-blocked French homepage cannot
    advance the default/root; the prior root remains current regardless of
    D17's later choice about retaining private intent.
24. **D16-AC24 — Optional capability independence.** Missing French Giving,
    Resend, additional Page, or additional-locale readiness does not block an
    otherwise complete website-default activation.
25. **D16-AC25 — Query drop default.** Unknown/no-owner query parameters are
    absent from `Location` and the final request.
26. **D16-AC26 — Owned attribution exception.** Each preserved parameter is
    named by the current versioned attribution-ingress manifest and
    independently passes its decode, normalization, length, character,
    privacy, duplicate/conflict, retention, and export-safety contract. Tests
    explicitly cover canonical `sc` in both owner-admitted and owner-rejected
    root-ingress policies. No parameter ever selects locale or target.
27. **D16-AC27 — Unsafe query rejection.** Auth/session/return/`next`,
    personal data, amount, cadence, currency, Designation, Giving, checkout,
    provider, control, oversized, malformed, and duplicate-conflicting
    parameters are dropped and do not appear in logs or errors.
28. **D16-AC28 — Fragment inheritance blocked.** Real Chromium, Firefox, and
    WebKit-shaped browser tests beginning at `/#private-fragment` prove the
    final locale URL does not contain that fragment; the `Location` conformance
    fixture preserves an explicit empty fragment component.

### Staff, visitor, accessibility, and search outcomes

29. **D16-AC29 — Current/planned/unchanged comprehension.** Staff review
    names the exact current and planned root destinations plus at least one
    Page and one Giving address as **Unchanged**.
30. **D16-AC30 — Consequence copy.** The persistent statement says what the
    unchanged domain-only address opens changes; explicit Page/Giving
    addresses and existing content remain unchanged.
31. **D16-AC31 — Real candidate Preview.** Preview renders the exact target
    candidate privately, without public cache, canonical, `x-default`, sitemap,
    analytics, or share authority.
32. **D16-AC32 — Cause-owned readiness.** Every blocker states the exact cause
    and one action or owning role; optional Giving/readiness facts are visually
    and semantically nonblocking.
33. **D16-AC33 — Permission matrix.** View-only, prepare-only, Page editor,
    locale manager, publisher/reviewer, revoked, cross-Tenant, impersonated,
    service, and AI-assistant cases receive only their exact permitted
    controls/data.
34. **D16-AC34 — Publication boundary.** Tenant-configured review/automatic-
    publish rules are preserved; D16 neither adds a universal gate nor bypasses
    an existing one.
35. **D16-AC35 — Unknown outcome UX.** Lost-response state tells staff Core is
    confirming the original command, preserves their work, disables duplicate
    submission, and resolves from authoritative receipt/effect truth.
36. **D16-AC36 — Durable receipt.** Success records actor/authority, exact
    Site/environment, prior/new stable locale IDs, before/after root targets,
    generation/effect, readiness digest, local/public/cache/search observations,
    and timestamp without secrets or query/fragment data.
37. **D16-AC37 — Correct final language.** Each explicit homepage uses the
    exact HTML language/direction, same-locale content/Navigation, and no field
    fallback.
38. **D16-AC38 — Explicit internal Home.** Locale-owned Home/logo/Navigation/
    breadcrumb/not-found links use the current explicit locale homepage and
    never the neutral root.
39. **D16-AC39 — Deliberate language switch.** Language controls use native
    names with correct `lang`, `dir="auto"`/bidi isolation, real equivalent
    links, a consistent location, and honest absence for missing equivalents.
40. **D16-AC40 — No-JavaScript and weak-network journey.** Root redirect,
    final homepage, explicit Navigation, and language switch work without
    JavaScript; staff retry preserves input/focus and never duplicates
    activation.
41. **D16-AC41 — Accessibility matrix.** Visitor and staff flows pass keyboard,
    screen reader, visible focus, text-plus-icon state, 44px targets where
    applicable, forced colors, reduced motion, 320px reflow, 400% zoom,
    long/CJK/RTL, touch, and error-announcement proof.
42. **D16-AC42 — Exact homepage canonicals.** Every eligible locale homepage
    returns a self-canonical absolute HTTPS URL derived from trusted source
    facts.
43. **D16-AC43 — Reciprocal homepage alternatives.** Only mutually eligible
    exact homepage variants emit one complete self-inclusive reciprocal
    `hreflang` cluster.
44. **D16-AC44 — Narrow x-default.** The Site Root Entry appears as
    `x-default` only in that eligible homepage cluster.
45. **D16-AC45 — Root not sitemap content.** Root is never a sitemap `<loc>`;
    only current canonical `200` locale URLs are.
46. **D16-AC46 — Deep Page isolation.** Deep ordinary/specialized Pages never
    use root `x-default` and retain only exact current equivalence.
47. **D16-AC47 — Giving search isolation.** No Giving URL emits or targets
    root `x-default`, cross-language canonical, redirect, or fallback.

### Database, authorization, concurrency, cache, and failure proof

48. **D16-AC48 — Composite integrity.** Database migration tests prove every
    default-version/target/derived-effect relation repeats Tenant,
    environment, Site, stable Site Locale, verified base, route/locale-exact
    public generation, and owner scope.
49. **D16-AC49 — One authoritative head.** Constraints and concurrency tests
    make two current Default Site Locale heads impossible for one exact scope
    and prove no independently current root-effect head exists.
50. **D16-AC50 — Immutable history.** Public allocations, superseded Default
    Site Locale Versions, derived effect evidence, candidates, receipts, and
    audit expose no ungoverned direct update/delete or cascade-reuse path.
51. **D16-AC51 — RLS operation correctness.** `SELECT`/`INSERT`/`UPDATE`/
    `DELETE` tests exercise `USING` and `WITH CHECK`; an allowed update cannot
    change scope, owner, target, head, or authority into a forbidden state.
52. **D16-AC52 — Trusted attribution.** Tenant, Site, actor, author, reviewer,
    approver, target, role, and audit attribution are derived from current
    server/session/authority context and ignore conflicting caller fields.
53. **D16-AC53 — Privileged poison matrix.** Service-role, Payload Local API,
    RPC/`SECURITY DEFINER`, worker, import, migration, support, impersonation,
    break-glass, and AI paths reject cross-scope, stale, caller-selected, and
    forbidden-target input.
54. **D16-AC54 — Competing activation.** Two different ready candidates racing
    under the same expected head produce exactly one current winner, one
    explicit stale/conflict outcome, and no mixed generation.
55. **D16-AC55 — Same-key retry.** Same business key and meaning return the
    original receipt with no duplicate head/outbox/audit effect.
56. **D16-AC56 — Changed-meaning key reuse.** Same key with different Site,
    default, target, dependency, or scope is rejected and cannot read another
    receipt.
57. **D16-AC57 — Race matrix.** Locale withdrawal, homepage release, Site
    suspension/retirement, host-generation change, permission revocation,
    safety change, and activation races preserve one valid last-known-good
    outcome.
58. **D16-AC58 — Late/out-of-order work.** Old invalidation/search/probe jobs
    cannot overwrite or report completion for a newer head; each effect is
    generation- and idempotency-fenced.
59. **D16-AC59 — Non-sticky response.** Every favorable root `307` carries
    `Cache-Control: no-store` and no contradictory freshness header.
60. **D16-AC60 — Complete resolver cache key and bounded freshness.** Omitting
    any Tenant, environment, Site, verified base/host generation, stable
    default-locale identity/policy revision, target route/locale-exact public
    generation, serving policy, audience, or resolver/renderer version fails a
    structural cache test. Favorable entries cannot exceed `300` seconds.
61. **D16-AC61 — Tags do not isolate or extend truth.** Reused/missing/
    malformed tags cannot cross-scope a cached result; function arguments and
    verified scope remain the isolation mechanism. A missed favorable
    invalidation test proves the prior destination stops serving within the
    `300`-second hard ceiling.
62. **D16-AC62 — Adverse bypass.** Suspension, retirement, target withdrawal,
    and safety restriction suppress favorable behavior immediately without
    waiting for normal root/content cache expiry.
63. **D16-AC63 — Known temporary failure.** A known suspended Site returns
    D7's small localized `503` with `no-store` and no redirect.
64. **D16-AC64 — Privacy-safe absence.** Unknown, transferred, retired,
    tombstoned, privacy-ineligible, wrong-scope, and malformed hosts/resources
    return the applicable uniform adverse result and no `Location`.
65. **D16-AC65 — No adverse fallback.** Missing/corrupt/mixed/default-target
    failure never opens another locale, Page, Site, Tenant, Giving entry, fund,
    or provider URL.

### Migration, operations, performance, and traceability

66. **D16-AC66 — Complete census.** Migration evidence inventories every
    current root representation, locale fact, canonical/metadata/JSON-LD,
    static redirect, unprefixed route, Home/root link, auth/checkout/return,
    PWA/service worker, crawler artifact, cache, test, analytics, and monitor.
67. **D16-AC67 — Current homepage source proof.** Current English `/` content
    becomes an explicit locale homepage only with exact source/locale/Page/
    generation evidence; today's copy/default does not infer it.
68. **D16-AC68 — Legacy /home disposition.** New Core-controlled requests do
    not produce `/home → / → /lang/*`. Continuity exists only after source-
    owner proof; historical browser-cached permanent behavior remains external
    observation.
69. **D16-AC69 — Giving/auth/return migration.** `/give`, `/donate`,
    unauthenticated checkout, authentication, protected actions, and provider/
    operation results never use root as a destination or lose task/Giving
    intent.
70. **D16-AC70 — PWA/offline correctness.** A versioned manifest and installed
    shortcut use an eligible explicit locale start. An intentionally pinned
    former-default locale remains stable after a default change; service-worker
    caches, prefetch, and offline behavior cannot substitute the neutral root,
    override the pinned locale, or repeatedly traverse root.
71. **D16-AC71 — Mixed-version compatibility.** N/N-1 reader/writer, old-code/
    new-schema, new-code/old-schema, partial deployment, and rollback tests
    preserve adverse behavior until every required component understands the
    Default Site Locale head and derived root effect.
72. **D16-AC72 — Cohort activation.** One exact Site cohort activates only
    after shadow comparison and full positive/negative/security/a11y/cache/
    search/failure proof; another Site remains unaffected.
73. **D16-AC73 — Rollback boundary.** Before public activation, candidate code
    and schema may roll back safely; afterward, allocation/default/effect
    history stays retained and recovery advances through a new compatible
    successor.
74. **D16-AC74 — Production-shaped performance.** Dedicated/shared-host,
    small/large Tenant, one/many locale, bot burst, cold/warm cache, outage, and
    concurrency tests record resolver p50/p95/p99 and prove no O(locale/Page)
    scan, provider/CMS hot-path call, chain, or thundering herd. Privacy-safe
    RUM and synthetic journeys record redirect duration and navigation-start-
    to-final-homepage LCP; launch requires LCP at or below `2500 ms` at p75 for
    mobile and desktop cohorts separately.
75. **D16-AC75 — Privacy-safe observability.** Metrics/logs/traces omit raw
    query/fragment, private URL, Page/ministry title, donor/actor identity,
    sensitive location, and cross-Tenant labels while retaining bounded opaque
    cause/scope/generation evidence.
76. **D16-AC76 — Analytics conservation.** Root entry and final homepage
    observations have documented distinct semantics and do not double-count one
    visitor as two content conversions or fabricate Source Code/Giving
    attribution.
77. **D16-AC77 — External observation honesty.** Local activation, public HTML
    probe, cache convergence, sitemap/`hreflang` output, crawler fetch, and
    indexing/ranking are distinct timestamped facts; only a named provider
    report may claim its own observation.
78. **D16-AC78 — Full traceability.** One automated trace matrix maps D16
    clauses and criteria through glossary, eventual ADR amendments, PRD,
    OpenSpec, design, tasks, GitHub tickets, schema/migration, tests, release
    evidence, runbooks, and named monitors with no contradictory term/status/
    number.

## Named production monitors

Every item allowed into “monitor” has a named signal, threshold, owner, and
response. Zero-tolerance safety signals supplement—never replace—constraints,
RLS, route types, and release gates. The latency/error/UX thresholds below are
provisional launch budgets to validate against production-shaped baselines.

| Signal                                        |                                                                                                            Threshold | Owner                                   | Required response                                                                                                                |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------: | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `site_root_cross_scope_redirect_total`        |                                                                                                  Any value above `0` | Security + Public Runtime               | Declare P0, fence the exact cohort, purge scoped caches, preserve evidence, assess disclosure, and repair forward.               |
| `site_root_forbidden_target_total`            | Any external, Giving, checkout, auth, control, callback, deep-Page, alias, sibling-Site, or wrong-environment target | Public Route Platform                   | Disable the favorable resolver/writer, retain last safe head, classify cause, and re-prove target builder.                       |
| `site_root_explicit_url_delta_total`          |                                                       Any explicit Page/Giving URL delta during a default activation | Site Product + Page/Giving route owners | Reject/fence activation, retain prior head, preserve candidate, and identify the unauthorized owner mutation.                    |
| `site_root_non_safe_method_redirect_total`    |                                                                                           Any non-`GET`/`HEAD` `3xx` | Public Runtime Security                 | Disable root redirect path, restore method-safe response, review logs without bodies, and add the failing method fixture.        |
| `site_root_chain_or_loop_total`               |                                                    Any loop or more than one Core-controlled hop from canonical root | Public Route Platform                   | Stop cohort expansion, remove/fence intermediate route, retest canonicalizer/legacy aliases, and do not weaken status semantics. |
| `site_root_adverse_fallback_total`            |                                  Any fallback to another locale/Page/Site/Tenant/Giving/provider under adverse truth | Site Locale + Security                  | P0 contain the exact generation, restore owner-specific adverse result, reconcile exposure, and prove zero recurrence.           |
| `site_root_cache_scope_mismatch_total`        |                                              Any cached result whose scope/generation differs from request authority | Platform Runtime + Security             | P0 purge/fence the cohort, disable affected cache, repair key construction, and assess cross-Tenant exposure.                    |
| `site_root_generation_mismatch_total`         |                                                       Any Default Site Locale/target/locale-generation inconsistency | Site Locale + Public Generation owners  | Suppress the derived effect, retain both authoritative heads, reconcile outbox, and publish the source-owned successor.          |
| `site_root_query_passthrough_violation_total` |                                           Any unowned/unsafe parameter or attribution value outside its typed policy | Attribution + Privacy + Public Runtime  | Disable carry, purge affected cache/telemetry material, assess disclosure, and fix the owner adapter.                            |
| `site_root_fragment_carry_total`              |                                                                  Any real-browser inherited nonempty source fragment | Privacy + Public Runtime                | Disable favorable redirect helper, use a conforming response builder, investigate exposure, and rerun browser matrix.            |
| `site_root_stale_target_age_seconds`          |                                            Above `300` seconds after authoritative activation or missed invalidation | Public Runtime on-call                  | Reconcile current default head/outbox, purge exact cache cohort, run direct probes, and never issue a second activation.         |
| `site_root_unknown_activation_age_seconds`    |                                                                                                  Above `300` seconds | Site/default command owner              | Read authoritative receipt/effect, show truthful staff state, page owner/on-call if unresolved, and prohibit duplicate command.  |
| `site_root_resolution_error_rate`             |                                                   Above `1%` for 15 minutes with at least 100 eligible root requests | Public Runtime on-call                  | Inspect resolver/dependencies, fail safe for affected cohort, preserve other Sites, and open cause-owned repair.                 |
| `site_root_resolution_p95_ms`                 |                                                    Above `300 ms` for 15 minutes with at least 100 eligible requests | Public Route Platform                   | Inspect index/cache/host resolution and hot-path calls; optimize without negotiation, fallback, or weaker scope.                 |
| `site_root_to_final_lcp_p75_ms`               |                          Above `2500 ms` over 28 days for mobile or desktop with at least 100 eligible root journeys | Public Web Performance + Site UX        | Split redirect duration from target-page LCP, fix the responsible resolver/edge/page seam, and preserve deterministic safety.    |
| `site_root_target_non_200_total`              |                                                    Any favorable root whose final target probe is not eligible `200` | Page + Public Generation owners         | Suppress the favorable derived response, retain evidence, route exact Page/generation repair, and never choose another locale.   |
| `site_root_hreflang_or_x_default_error_total` |                                         Any nonreciprocal, stale, deep-Page, Giving, or wrong-root active projection | Search & Sharing owner                  | Remove invalid projection, keep explicit routes, regenerate from current manifest, and report provider observations separately.  |
| `site_root_sitemap_loc_total`                 |                                                                      Any redirecting root emitted as sitemap `<loc>` | Search & Sharing owner                  | Remove root `<loc>`, rebuild sitemap from canonical `200` manifests, and validate provider-facing bytes.                         |
| `site_root_internal_neutral_link_total`       |                       Any generated locale-owned Home/logo/Nav/breadcrumb/error link to root after cohort activation | Site UI + Public Generation             | Block affected release, correct typed reference resolution, and search all copied root literals.                                 |
| `site_root_task_intent_loss_total`            |                                               Any auth/checkout/protected/provider-return flow disposed through root | Owning flow + Public Runtime            | Contain the specific flow, restore task-owned destination, reconcile donor/operation impact, and add a regression fixture.       |
| `site_root_pwa_locale_mismatch_total`         |            Any cached neutral-root behavior that overrides or disagrees with the manifest's explicit eligible locale | PWA/Public Runtime owner                | Fence the manifest/service-worker cohort, refresh explicit start assets, preserve user data, and restore the pinned locale.      |
| `site_default_change_abandonment_rate`        |                                        Above `20%` within 24 hours of starting, with at least 25 starts over 30 days | Site Product/UX                         | Review sessions and comprehension evidence, simplify copy/actions, preserve safeguards, and rerun moderated testing.             |
| `site_root_support_cases`                     |                                          More than 5 root/default-language comprehension or routing cases in 30 days | Site Product + Tenant Support           | Review exact confusion, improve in-product explanation/runbook, and provide no direct DB/redirect override.                      |

## Ruthless synthesis — strongest path forward

### Required before D16 is recorded

Completed by this evidence package:

1. define **Site Root Entry** separately from Page, Site Locale, and Giving;
2. select `307` for public `GET`/`HEAD` only and deny unsafe-method redirects;
3. require one trusted same-Site final explicit homepage target;
4. make hidden language signals nonrouting;
5. preserve D9–D15 explicit Page/Giving identity and financial separation;
6. add drop-by-default queries plus a current versioned attribution-ingress
   exception that D16 does not own or freeze;
7. block RFC 9110 fragment inheritance explicitly;
8. require private preparation and one complete expected-head activation of
   the sole Default Site Locale head, with no current root head;
9. use `no-store` launch response and ADR-0030 resolver-cache boundaries;
10. allow root `x-default` only in the eligible homepage cluster; and
11. make current/planned/unchanged staff UX and owner routing normative.

### Required in the later PRD/design

1. define the stable Default Site Locale policy/version and its relationship to
   D14/D15 stable Site Locale identity—superseding Phase 2 raw scalar/array
   authority where inconsistent;
2. define the typed `site-root-entry` response as a derived composition of the
   sole current Default Site Locale Version and the current eligible
   locale-exact Public Site Generation; immutable effect evidence may exist,
   but never as a parallel current table/head or CMS redirect;
3. specify composite constraints, indexes, grants/RLS, service/RPC hardening,
   actor derivation, lock order, idempotency, receipt, outbox, and retention;
4. define exact target readiness, private candidate, activation, conflict,
   unknown-outcome, adverse containment, and forward-correction states;
5. define the landing-attribution adapter and explicit empty-fragment response
   conformance without creating a second query owner;
6. reconcile ADR-0026, D15's eventual URL/route ADR, proposed Phase 22/23
   generations/routes/search, and D14 Giving `x-default`;
7. specify the Maia/Base UI desktop/mobile journey, capability matrix,
   Preview, owner handoffs, accessibility, low-bandwidth recovery, and receipt;
8. define canonical/homepage/`hreflang`/`x-default`/sitemap/robots/JSON-LD/OG
   projections from one source manifest;
9. define current-root/home/PWA/nav/auth/checkout/Giving/cache/analytics census,
   evidence-classified migration, mixed-version deployment, per-Site cohort,
   and rollback boundary; and
10. trace all 78 criteria and named monitors into production-shaped release
    evidence.

### Required implementation order

1. inventory production-shaped canonical/alias/shared-host roots, root content,
   current locale evidence, `/home`, root links, PWA/service worker, explicit/
   unprefixed routes, Giving/auth/return flows, metadata/search, caches,
   analytics, and owners;
2. land/reconcile stable Site, verified-base, stable Site Locale/default-policy,
   exact homepage allocation, and generation schema with constraints/RLS;
3. land the typed root route class, negative reader, method guard, trusted
   target builder, query/fragment policy, and zero-fallback behavior before any
   favorable writer;
4. complete trusted host → Site → current public/default/generation resolution
   and scope-complete function-cache identity;
5. move/source-prove current homepages into D15 explicit locale bases and
   shadow-compile derived root effects without changing live traffic;
6. replace generated locale-owned root links with explicit home references and
   repair owner-specific auth/checkout/protected/provider return destinations;
7. reconcile metadata, homepage-only `x-default`, sitemap exclusion, robots,
   JSON-LD/OG, manifest/PWA, analytics, and monitoring;
8. ship the accessible Mission Control default-language journey and private
   candidate/owner routing;
9. prove N/N-1 compatibility, method/host/query/fragment/security/RLS/race/
   cache/failure/accessibility/load/search matrices in production-shaped
   environments;
10. activate one exact Site cohort atomically, verify root → final `200`,
    explicit URL invariance, cache convergence, and owner-specific adverse
    behavior;
11. expand only while zero-tolerance signals remain zero and budgeted monitors
    stay within validated thresholds; and
12. recover forward through a newly proved successor, never by erasing public
    root/default/route history.

### Explicit non-goals — reopen only with evidence

- visitor-specific browser/IP/cookie/profile language selection;
- a neutral chooser under Option 1;
- per-locale domain policy or canonical/alias-domain migration;
- a generic redirect product, wildcard/regex/query rules, priorities, or
  schedules;
- automatic translation, field fallback, or publication;
- editable technical SEO/`x-default`/sitemap controls;
- root-selected Giving, currency, provider, or financial behavior;
- copied mutable absolute URLs;
- a second Site Plan/root publication head; and
- speculative distributed/global route services or sharding.

Any future request must first show representative visitor/staff evidence and
fit its source owner. Monitoring never substitutes for structural safety.

## Repository and external research synthesis

### Repository facts verified on 2026-08-27

- At evidence capture, PRs #1323 and #1340 remained open; their Phase 22/23
  planning material was treated as proposed evidence, not merged authority.
  Existing Phase 24 evidence remained preserved.
- [ADR-0026](../../adr/0026-public-website-surface-in-donor-app.md) keeps the
  public website in `apps/donor`, reserves root route families, and must be
  explicitly amended rather than silently overridden.
- [ADR-0027](../../adr/0027-transport-agnostic-public-content-reader.md) and
  [ADR-0028](../../adr/0028-defense-in-depth-public-isolation.md) require one
  server-owned public boundary, trusted typed scope, and fail-closed unknown
  hosts.
- [ADR-0029](../../adr/0029-reference-not-copy-cms-operational.md) rejects
  copied mutable authority. [ADR-0030](../../adr/0030-function-level-tagged-caching-publish-signal.md)
  makes function arguments the cache-isolation mechanism and tags invalidation
  only.
- D7 gives a known temporarily suspended Site a `no-store` `503`; D8 gives
  retired/unknown scope privacy-safe absence; D9–D14 prohibit guessed Giving
  redirects/fallback; D15 fixes explicit `/lang/{exact-locale}` bases and
  reserves root/`x-default` for D16.
- Phase 2 contains earlier `t`/`c`/UTM attribution examples, while the current
  Phase 13 contract names canonical Source Code query `sc`. D16 therefore
  delegates the bounded exception to the current versioned ingress owner
  rather than copying either list.
- Current `apps/donor/app/(public)/(hero)/page.tsx` renders an English-oriented
  homepage and DonateAction directly at `/`.
- Current `apps/donor/next.config.ts` permanently redirects `/home → /` and
  host-blind `/give`/`/donate` to `/workers`.
- Current `apps/donor/app/layout.tsx` statically binds root canonical/Open
  Graph/language values; `packages/config/site-shared.ts` and multiple shared
  UI routes are English/root-oriented.
- Current `packages/ui/components/public/navbar.tsx`,
  `navbar-client.tsx`, `footer.tsx`, breadcrumbs, not-found, and other flows
  hard-code `/`.
- Current `public/manifest.webmanifest` uses `start_url: "/"` and English.
- Current `tests/e2e/performance.spec.ts` and
  `packages/lib/monitoring/web-vitals.ts` use a `2500 ms` LCP boundary; D16
  extends that existing product seam to the complete root-to-home journey.
- Current `apps/donor/proxy.ts` has no `/lang/*` public family and can route
  unauthenticated checkout intent to `/`.
- Current public context still has `siteId: null` and no stable locale/root
  generation; the CMS resolver still consumes forwarded/host headers; current
  donor public caching is not the final accepted scope-complete contract.
- Proposed ADR-0147 expressly excludes root/home replacement from ordinary Page
  continuity. Proposed ADR-0172 leaves `x-default` to Phase 24 and otherwise
  requires exact self-canonical locale output. D16 narrows those proposals
  rather than treating them as shipped.

### Current primary and comparable evidence

- [RFC 9110 HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html)
  defines `307` as temporary and method-preserving, defines `405`/`Allow`,
  requires fragment inheritance when `Location` has no fragment component, and
  recommends an explicit empty component to prevent fragment disclosure.
- [RFC 9111 HTTP Caching](https://www.rfc-editor.org/rfc/rfc9111.html) makes
  cache behavior an explicit response policy; `307` is not heuristically
  cacheable, but any final response can be stored when explicit freshness
  permits it. Core therefore uses `no-store` at launch rather than relying on
  folklore.
- [RFC 3986 URI resolution](https://www.rfc-editor.org/rfc/rfc3986.html#section-5.2.2)
  distinguishes ordinary reference resolution from Next's documented query
  passthrough behavior.
- [Current Next.js redirect guidance](https://nextjs.org/docs/app/guides/redirecting)
  and [`next.config.js` redirects](https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects)
  confirm `307` for temporary redirects, method preservation, external-target
  capability, and query passthrough. Those are capabilities to wrap, not Core
  policy.
- [Google redirect guidance](https://developers.google.com/search/docs/crawling-indexing/301-redirects)
  classifies `302`/`303`/`307` as temporary signals and says Google may keep
  the source URL in search while following the destination. That makes the
  neutral root's homepage-only `x-default` role deliberate rather than a
  permanent-locale canonical signal.
- [Google multilingual-site guidance](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)
  recommends distinct language URLs, warns against inferred-language
  redirection, and recommends visible links to alternatives.
- [Google localized-version guidance](https://developers.google.com/search/docs/specialty/international/localized-versions)
  requires exact reciprocal/self-inclusive alternatives and identifies
  `x-default` as a fit for selectors or auto-redirecting homepages.
- [Google's x-default explanation](https://developers.google.com/search/blog/2023/05/x-default)
  says `x-default` may identify a neutral selector, redirect landing, or chosen
  default version. D16 adopts only the homepage relation.
- [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
  supports listing canonical final URLs rather than redirect sources.
- [W3C translated-page guidance](https://www.w3.org/International/questions/qa-site-conneg.en.html)
  and [when to negotiate language](https://www.w3.org/International/questions/qa-when-lang-neg.en.html)
  support clear manual overrides and native, direction-safe language labels.
  W3C is more permissive of browser negotiation than Core's deterministic
  product choice; Google/caching/support constraints justify Core's narrower
  default.
- [WCAG 2.2 Language of Page](https://www.w3.org/WAI/WCAG22/Understanding/language-of-page)
  requires the final page's predominant human language to be programmatically
  determinable.
- [web.dev Largest Contentful Paint guidance](https://web.dev/articles/lcp)
  defines a good LCP as `2.5` seconds or less at the 75th percentile and
  recommends assessing mobile and desktop separately. D16 uses that current
  standard and Core's existing `2500 ms` seam as a provisional launch budget.
- [Webflow locale management](https://help.webflow.com/hc/en-us/articles/53682971927571-Manage-your-site-s-locales)
  separates locale identity, subdirectory, publishing status, and preview and
  warns that locale route collisions must be handled. Core borrows the clear
  staff mental model, not customizable locale routing, flags, or provider
  authority.
- [Contentful locale-based publishing](https://www.contentful.com/help/localization/locale-based-publishing/)
  demonstrates independently visible locale publication states. Its fallback
  behavior is explicitly rejected by D14/D15.
- [Shopify localization guidance](https://help.shopify.com/en/manual/international/localization-and-translation)
  creates distinct published language URLs and exposes destructive default-
  language consequences in its model. Core avoids those consequences through
  stable explicit locale identities and must make that difference obvious to
  staff.
- [Fundraise Up localization](https://fundraiseup.com/docs/localization-settings/)
  is a directly comparable nonprofit-giving product: it supports an
  organization default plus browser, exact-URL, parameter, and JavaScript
  language precedence and separately applies default language to receipts. Its
  documented exact-URL/trailing-slash mismatch and precedence complexity are
  evidence that these capabilities exist—not authority to import them. Core's
  Site root stays deterministic, explicit Giving addresses stay D14-owned, and
  receipt language/financial identity stay with their own owners.

### Evidence limits and unresolved empirical unknowns

- No primary source proves that a default-root redirect produces higher
  donation conversion, satisfaction, or search ranking than a chooser. D16 is
  a low-friction, deterministic product judgment.
- No representative Core staff study yet proves that **Website default
  language**, **Domain-only address**, and the current/after/unchanged layout
  are immediately understood. D16 requires moderated tests before broad
  rollout; it does not pre-authorize technical wording or customization.
- Current production root traffic, `/home` traffic, root query/fragment use,
  installed PWA/service-worker state, external backlinks, crawler behavior, and
  client-cached permanent redirects require authenticated analytics/operations
  inventory during migration.
- The `300`-second favorable-cache/unknown-outcome, `300 ms` resolver p95, and
  `2500 ms` end-to-end LCP p75 thresholds are provisional launch budgets, not
  measured current facts. Production-shaped baselines must confirm or tighten
  them before expansion.
- Canonical/alias-domain composition may add domain-owner semantics outside
  D16. The canonical Site Root Entry remains one-hop; alias policy requires its
  own proof and cannot be smuggled into D16.

## Documentation and ADR status

- Root `CONTEXT.md` now defines **Default Site Locale**, **Default Site Locale
  Version**, and **Site Root Entry** without embedding HTTP or schema detail.
- This D16 evidence records the corrected root contract, staff/visitor
  journeys, all 22 adversarial categories, 78 acceptance criteria, named
  monitors, research, migration, and synthesis.
- The Phase 24 decision log records the founder answer and points here.
- D14/D15 retain historical wording but receive a later-D16 clarification:
  root may be homepage-only `x-default`; Giving remains excluded.
- D16 does not independently qualify for a standalone ADR because `307` is
  deliberately reversible. The later spec flow must amend the eventual D15
  URL/route ADR and accepted ADR-0026.
- No ADR, PRD, OpenSpec change, design, issue/ticket, schema, migration,
  runtime code, commit, stage, or PR is authorized by this Grill-with-Docs
  answer. Those require the separately invoked specification workflow.

## Next dependent decision — D17

### Plain-language context and impact

D16 settles what happens after a new default is successfully published. It
also establishes a safety floor: an unfinished French homepage can never take
over `hope.org/`. The remaining product choice is what staff should be able to
do **before** French is ready.

This matters because blocking the choice entirely can make staff remember the
change elsewhere, while switching immediately would break the public root. A
private planned change can preserve intent and route missing work, but it adds
one visible workflow state that must not become a second default.

### Options

1. **Save one private planned default and keep the current root unchanged until
   reviewed activation — recommended.** Staff can choose French early, see
   exactly what is missing, prepare what they are allowed to change, and route
   the rest to the right owners. “Planned” is workflow intent only; English
   remains the sole current public default until one complete publish.
2. **Do not save the choice until French is ready.** Core shows the checklist
   and sends staff to fix it, then they return and choose French again. This has
   the smallest state model but creates memory/re-entry work and makes
   cross-role coordination harder.
3. **Switch immediately and show unavailable or a chooser until French is
   ready.** This feels instant but knowingly degrades the public website and
   creates a second temporary root behavior. It conflicts with D6/D16 and is
   not recommended.

### Recommendation

Choose Option 1. It is the best staff UX without weakening public truth. Reuse
the private candidate and owner-routing model specified in D16 rather than
adding a second “planned default” authority or generic task engine.

### Concrete staff and visitor example

Maria chooses French (Canada), but the French homepage still needs publisher
approval. Mission Control says:

> **Planned: French (Canada)**  
> `hope.org/` still opens English until the French homepage is ready and
> published.  
> **Needs Website publisher:** Publish the French homepage.

Maria can prepare her authorized work and send one exact request to the
publisher. Visitors continue receiving English with no broken interval. After
the publisher completes the reviewed activation, `hope.org/` changes once to
French and existing explicit English Page/Giving links remain unchanged.

### Exact question

When the chosen future default is not ready, should Core save one private
planned default and route its blockers while keeping the current root
unchanged, refuse to save the choice until everything is ready, or switch the
root immediately?
