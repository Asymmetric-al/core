# Phase 24 D15 — Explicit Site Locale Public Base Adversarial UX Review

> **Status:** Completed `/grill-with-docs` decision evidence for D15. This is
> not a Phase 24 PRD, OpenSpec change, implementation plan, migration
> authorization, issue specification, or runtime change.
>
> **Founder choice:** Every language uses an explicit locale, including the
> default language.
>
> **Review date:** 2026-08-27
>
> **Later D16 clarification:** The locale-neutral Site Root Entry uses one
> non-sticky `307` for public `GET`/`HEAD` to the current public-ready Default
> Site Locale homepage. It may be homepage-only `x-default`, never a sitemap
> canonical/Page or Giving fallback. Every D15 explicit locale base remains
> unchanged.

## Final disposition

**Accept with required amendments.**

The founder's direction is the strongest permanent fit for Core: every exact
Site Locale, including the current default and the only locale on a
single-locale Site, receives one visible and stable route identity. Pages,
Navigation, Giving, search metadata, caches, and complete public generations
then consume one rule rather than carrying a special unprefixed default.

The informal answer is not safe enough by itself. It must be narrowed and
hardened in five ways:

1. say **every Site Locale**, not every language, because `fr`, `fr-CA`,
   `zh-Hans`, and `zh-Hant` can be materially different exact presentation
   contexts;
2. apply the rule to **locale-bearing human public content**, not protocol,
   infrastructure, control, authenticated, preview, callback, webhook, or
   in-progress transaction routes;
3. derive one lowercase public segment from the exact canonical BCP 47 Site
   Locale, but keep the stable Site Locale ID—not the visible string—as
   authority;
4. freeze the segment after first public use and never recompute it when the
   default, display name, IANA/Unicode profile, host, currency, or provider
   changes; and
5. place exact locale segments under one fixed, reserved `/lang/` namespace.

The fifth amendment is required, not ornamental. A direct `/{locale}` rule
collides with legitimate languages and current root technical namespaces. The
IANA Language Subtag Registry dated 2026-08-08 assigns `api` to Apiaká, `app`
to Apma, and `dev` to Domung. Core must not blacklist those languages, silently
rename them, or force ministry staff to move security-sensitive routes.

The corrected grammar is therefore:

```text
{verified-site-public-base}/lang/{lowercase-exact-locale}/{owner-path}
```

Examples:

```text
https://hope.org/lang/en-us
https://hope.org/lang/en-us/about
https://hope.org/lang/en-us/give/clean-water
https://hope.org/lang/fr-ca/a-propos
https://hope.org/lang/fr-ca/give/eau-potable
https://hope.org/lang/api/about
https://hope.org/api/donate                    # control route, not Apiaká content
```

On a shared public origin, the already-governed permanent Site handle remains
before `/lang/`:

```text
https://public.example/hope-missions/lang/fr-ca/a-propos
```

This extra namespace is a Core-specific product judgment, not a claim that
search engines rank `/lang/en-us` above `/en-us`. Google accepts multiple
locale-specific URL structures and does not require the default locale to be
prefixed. Core chooses the fixed namespace because it preserves every valid
language, keeps root control routes structurally separate, and removes a
permanent collision branch from staff and developer workflows.

The strongest alternative is an unprefixed default with explicit additional
locales. It produces shorter common URLs and matches many existing CMS and
commerce defaults, but it permanently couples old unprefixed meaning to a
mutable default setting or requires a hidden initial-default pin. It also adds
special redirect, cache, canonical, migration, and Giving cases. Saving one
path segment is not worth that lifetime complexity.

## Evidence labels

- **Repository fact** — accepted ADR, OpenSpec requirement, PRD, glossary, or
  earlier founder-ratified Phase 24 decision.
- **Current behavior** — code or schema on `develop`; migration evidence, not
  permanent product authority.
- **Proposed evidence** — open and unmerged Phase 22/23 work; informative, not
  governing.
- **External fact** — current primary standard, provider documentation, or
  accessibility/security guidance.
- **Product judgment** — a deliberate Core choice inferred from the evidence.
- **Assumption** — a claim requiring representative staff, visitor, or
  production proof.

## Jobs to be done

### Primary staff job

> Help me add and publish another website language, and show me the resulting
> Page and Giving addresses, without making me configure a router or understand
> BCP 47.

### Staff assurance job

> Tell me what will become public, what address becomes permanent, which
> existing links remain unchanged, and who owns any blocker.

### Visitor job

> Keep every explicit link in the language it promises, let me deliberately
> choose a real equivalent, and never make a browser, cookie, country, or
> financial setting silently change the page.

### Developer and operator job

> Give every public route one typed owner and one deterministic locale rule so
> Page, Giving, CMS, middleware, search, and caches cannot disagree or leak
> across Sites or Tenants.

## Corrected D15 decision — normative language

These clauses replace the draft D15 recommendation and MUST flow into the
later Phase 24 PRD, reconciled ADRs, OpenSpec requirements, design, tickets,
tests, and release evidence before implementation may be called complete.

### D15-R1 — Every exact Site Locale is explicit, including the default

Every recognized Site Locale that serves favorable locale-bearing public
content MUST use exactly one explicit public locale segment, including the
current default locale and the only locale on a single-locale Site.

The rule applies to Site Locale, not merely base language. Materially distinct
language, script, region, or variant contexts remain distinct under D14. Core
MUST NOT collapse `fr-CA` into `fr`, `zh-Hant` into `zh`, or `sr-Cyrl` into
`sr-Latn` merely to shorten a URL. Core also MUST NOT force a country or script
when the content owner has correctly selected a generic language tag such as
`en` or `fr`.

No favorable new locale-bearing content route may omit the explicit locale
identity because the locale is default, primary, first, only, popular, or
inferred.

### D15-R2 — One collision-proof public-base grammar governs every owner

The Site Locale Public Base MUST be assembled in this order:

```text
verified Site origin
→ optional permanent shared-host Site handle
→ fixed /lang/ namespace
→ immutable lowercase exact-locale segment
```

Locale-bearing content owners append only their governed relative paths. An
ordinary Page appends its released hierarchical path. A specialized public
ministry Page appends its source-owned path. Giving appends the unchanged
fixed `/give/{staff-chosen-slug}` family from D11.

The same source-owned builder and canonicalizer MUST supply public rendering,
Navigation, Page and Giving editors, preview summaries, canonical URLs,
language alternatives, sitemap projection, QR/share artifacts, logs, support
views, and cache identity. No owner may concatenate or parse a copied base
string independently.

### D15-R3 — `/lang/` is a fixed route namespace, not editable content

`/lang/` and its locale-child family are permanently reserved beneath every
admitted Site public base. Page, Navigation, CMS catch-alls, plugins,
redirects, imports, middleware, and tenants MUST NOT claim or translate the
namespace.

The namespace exists so every valid Site Locale can coexist with root
infrastructure and control routes. In particular, `/lang/api/...` is Apiaká
content while `/api/...` remains the API owner. Core MUST NOT maintain a
blacklist of language tags, append numeric suffixes, or branch between direct
and namespaced locale shapes.

An unknown, missing, malformed, unrecognized, disabled, or unfavorable child
of `/lang/` fails through the privacy-safe adverse path. `/lang`,
`/lang/unknown`, and direct `/en-us/...` MUST NOT become aliases, negotiated
routes, or default-locale fallbacks.

### D15-R4 — The public segment is generated from the exact canonical locale

Before first favorable activation, Core MUST validate the requested Site
Locale against the pinned D14 IANA/Unicode profile, resolve only standards-
proved canonical or deprecated-tag equivalence, and serialize the resulting
exact tag as lowercase ASCII with hyphens for the public segment.

Examples include `en`, `en-us`, `fr-ca`, `zh-hant`, and `sr-cyrl`. Case is
normalized for URL identity because BCP 47 comparison is case-insensitive
while URI paths are generally case-sensitive. The canonical staff/metadata
display may retain recommended BCP 47 casing such as `fr-CA`.

Staff MUST NOT type, translate, or customize the segment in the ordinary
workflow. `/english`, `/canadian-french`, `/français`, and silent `/fr-2`
aliases do not ship. A future proven custom-route need requires a separately
governed route-successor decision; it is not an editable locale setting.

### D15-R5 — Use no more locale specificity than the content justifies

The Site Locale setup journey MUST start with a language and disclose script
or region only when it materially distinguishes the public presentation.
Core MUST explain that generic English uses `en`, while English specific to
the United States may use `en-US`. It MUST NOT infer region from Tenant
address, Site domain, staff location, IP, currency, Stripe country, donor
traffic, or provider configuration.

Suppress-script and preferred-value guidance from the pinned registry MUST be
applied before initial allocation. Extensions, private-use values, or unusual
variants may participate only when the Site Locale owner has explicitly
admitted them as a public content identity and the route, HTML, search, cache,
and length profiles prove support. Arbitrary truncation is forbidden because
it changes meaning.

### D15-R6 — Public use freezes the segment; default changes do not

A private Site Locale candidate and signed preview consume no public route.
The first favorable Site-locale activation MUST atomically allocate and store
the exact segment, canonicalizer/profile version, full admitted base manifest,
stable Site Locale ID, public-base generation, actor, authority, receipt, and
outbox effect—or activate nothing.

After first public use, the segment is immutable and non-reusable. Changing
the Site default, locale display name, staff UI language, Page title, Site
branding, host, standards profile, preferred tag, currency, provider locale,
or financial configuration MUST NOT rewrite or reinterpret it.

A material locale correction or desired base change uses a source-owned
successor. Ordinary Page continuity remains separately governed by its route
owner. Giving intent never redirects or falls back. The prior route allocation
and minimum interpretation evidence remain reserved.

### D15-R7 — Locale-bearing content and control routes are explicit classes

One finite typed route-class registry MUST classify every positive route before
release. Locale-bearing human public content includes public homepages,
ordinary Pages and Articles, specialized ministry Pages, public updates,
localized public forms, and Giving entry Pages. Human-readable localized
documents such as translated public PDFs are not automatically exempt merely
because they are files.

Origin-scoped or operation-scoped exceptions include, as applicable:

- root `/robots.txt` and root sitemap or sitemap-index endpoints;
- `/.well-known/*`, framework assets, icons, manifests, service workers, and
  nonlocalized shared media delivery;
- `/api/*`, webhooks, health checks, authentication callbacks, and protected
  action endpoints;
- signed private preview enablement and result routes;
- authenticated donor, staff, and missionary product routes; and
- checkout, payment continuation, provider return, and already-admitted
  transaction-result routes owned by the contribution/payment lifecycle.

These routes MAY present or carry a locale under their own contracts, but they
do not become Site-locale public content identity and do not infer locale from
the public-base segment. No catch-all, regex, plugin, or framework default may
classify a route ad hoc.

### D15-R8 — Explicit URLs never negotiate or inherit locale

An explicit `/lang/{segment}/...` URL MUST resolve only the stable Site Locale
bound to that route. `Accept-Language`, IP/geolocation, cookies, stored profile,
authenticated preference, current Site default, query parameters, referrer,
currency, provider, and device MUST NOT change, redirect, rewrite, or vary its
presentation locale.

Unknown or unavailable explicit paths MUST NOT render the current default,
another Site Locale, a Site homepage, another Site, or another Tenant. Caches
for explicit content MUST NOT vary by hidden locale signals.

The locale-neutral bare Site root `/` is reserved for D16. D15 authorizes no
root content, chooser, browser negotiation, redirect, or `x-default` behavior.
It never authorizes a Giving redirect.

### D15-R9 — Source ownership remains singular

The Site Locale owner owns stable locale identity, canonical tag/profile,
locale lifecycle, and public-base participation. The public route authority
owns literal base allocation, canonical comparison, occupancy, and permanent
reservation. Domain/Site owners supply admitted verified host and any
permanent shared-host Site handle.

Ordinary Page and Article owners own their locale-exact path after the base and
their separately proved continuity. Specialized public ministry Page owners
retain their own paths and dispositions. Giving owns `/give/{slug}`, its entry
meaning, address allocation, preference, and Stop lifecycle. Navigation owns
membership and labels but stores stable references. Search, sitemap, cache,
analytics, preview, QR, and support surfaces are derived consumers.

Trusted host and any permanent shared-host Site handle resolve the Site before
the locale segment is considered; Site Locale never chooses or substitutes a
Site. Neither Site Locale nor its public base owns or selects Giving entry,
Designation, Legal Entity, Tenant Stripe account, currency, settlement, bank,
tax or receipt legal facts, or accounting identity.

### D15-R10 — Managed links are references, never copied URL strings

Editable managed candidates and derived current projections—including Page,
Navigation, Giving placement, search, and authorized support views—MUST retain
the stable source-owned reference and resolve an exact URL only while compiling
one compatible immutable public generation or a separately authorized new
effect. They MUST NOT copy the locale base into independent mutable authoring
fields or use string replacement to switch language.

Once a publication, scheduled effect, message, generated/issued document,
download/export, QR code, printed artifact, or share artifact freezes, it MUST
pin the exact resolved absolute URL, source identity, and generation used for
that artifact. It never re-resolves to “current,” repoints, or mutates when a
base, preference, Page, or locale changes. A later destination requires a new
source-owned version/artifact/effect under D10–D14 and its own audit evidence.

External or staff-authored literal links remain literal and receive no
invented ownership or automatic rewrite. Imports classify them as proved
managed references, preserved external literals, or quarantined ambiguity.

Language alternatives require an explicit same-Site semantic-equivalence
relation and current eligible target. They are never generated by swapping
`en-us` for `fr-ca` in a URL.

### D15-R11 — Collision identity covers the complete canonical namespace

The globally unique enforcement key is the canonical external origin plus its
normalized path. It remains occupied across every Site, Tenant, environment,
host departure/return, route kind, owner, and current or historical state.
Tenant, originating environment, Site, verified origin/host generation,
permanent Site handle, owner, allocation, and canonicalizer/profile version
are immutable provenance and same-scope facts; they MUST NOT partition or
weaken global external origin-plus-path uniqueness.

The versioned canonicalizer MUST define IDNA host, effective port, case,
percent encoding, Unicode normalization, decoded separators, dot segments,
backslashes, slash/trailing-slash policy, and malformed input. Query strings
and fragments never create another route identity.

Concurrent Site Locale, Page, Giving, host, alias, and route-family claims
must serialize through the shared authority. Advisory availability is never a
reservation; one atomic final command wins. A conflict preserves staff work,
reveals only same-Tenant source-owned detail the actor may view, and never
silently renames a locale or route.

### D15-R12 — Public generations bind the whole locale experience

One favorable Site-locale public generation MUST pin the exact Tenant,
environment, Site, verified host/base generation, stable Site Locale,
segment allocation, locale presentation, public shell, Navigation, route
manifests, Page/specialized/Giving references, search metadata inputs, cache
identity, renderer, and dependency versions required for that release.

Candidate preparation may be resumable, but activation is one idempotent
expected-head compare-and-set. A stale or incomplete candidate never mixes a
new locale base with old Navigation, Pages, Giving links, canonical metadata,
or cache entries. Recovery advances through a newly proved successor rather
than destructively restoring a prior mutable snapshot.

Source-owned adverse safety or lifecycle truth may immediately suppress an
otherwise favorable read. Projection lag after activation does not become
locale or route authority.

### D15-R13 — Search and crawler projections consume the same base

Each eligible canonical ordinary or specialized locale Page self-canonicalizes
to its own absolute current URL under its route owner. Giving preserves D14:
each preferred exact-locale address self-canonicalizes; an eligible
nonpreferred address MAY canonicalize only to the same-locale preferred address
and never redirects. One language MUST NOT canonicalize to the default
language. Equivalent current Pages emit reciprocal, self-inclusive `hreflang`
links only from one exact equivalence manifest. Missing, unreleased,
non-equivalent, restricted, or unsupported variants are omitted rather than
guessed.

A valid Site Locale path may use a BCP 47 value that a search provider cannot
represent. The search owner MUST validate its own supported projection and
either use a separately proved compatible value or omit the annotation. It
MUST NOT broaden, truncate, or falsify Site Locale identity to satisfy a
provider.

Root `/robots.txt`, root sitemap/index, and `/.well-known/*` retain their
protocol owners. Sitemaps list every eligible canonical locale URL and split
before the applicable 50,000-URL or 50MB uncompressed file limits. D15 itself
emits no `x-default`; D16 later authorizes the Site Root Entry only for an
eligible homepage cluster and never for Giving or deep Pages.

### D15-R14 — Staff use a language journey, not a routing console

The ordinary staff surface is **Site → Languages**. It shows native language
name plus the staff-language name when useful, optional script/region in
words, public state, editorial readiness, and a read-only **Website address
prefix**. It never uses a flag as language identity or exposes route manifest,
canonicalizer, BCP 47 lineage, CAS, or database terminology by default.

Core generates and previews `/lang/{segment}`. Page editors show the fixed
prefix plus one owner-controlled Page path. Giving editors show the fixed
prefix plus fixed `/give/` plus one owner-controlled Giving slug. Staff never
type a domain, shared-host handle, `/lang/`, locale code, `/give/`, or complete
URL in routine work.

The first-publication review names the exact language, Site, current and
planned address examples, affected route count, permanent-prefix consequence,
continuity outcomes, blockers, and facts that will not change. One clear
primary action activates the candidate. Healthy single-locale Sites remain
quiet and do not receive a translation dashboard.

### D15-R15 — Visitors receive one honest, accessible locale

Every favorable public response MUST server-render the exact language and
direction, set a valid `<html lang>` value, identify language changes in parts,
and keep internal managed navigation within the same exact Site Locale unless
the visitor deliberately selects an eligible alternative.

Language controls use native names with correct `lang`, `dir="auto"`, and
bidi isolation, remain in a consistent location, work as real links without
JavaScript, and support keyboard, screen reader, touch, forced colors,
reduced motion, long/CJK/RTL text, 320-CSS-pixel reflow, and 400% zoom. Flags
never stand for languages.

The switch targets the corresponding current equivalent Page. A missing
equivalent is omitted or explained as unavailable; Core never silently sends
the visitor to that locale's homepage or another task.

### D15-R16 — Database, grants, RLS, and privileged paths repeat scope

Operational Site-locale and route authority MUST structurally bind Tenant,
originating environment, Site, stable Site Locale, verified host binding,
optional permanent Site handle, immutable segment, canonicalizer/profile
version, allocation/public-base generation, lifecycle, and current-head
relations with composite same-scope keys, complete indexes, unique canonical
occupancy, and restrictive deletion.

Mutable scope columns and caller-controlled Tenant, environment, Site, locale,
actor, authority, owner, host, segment, or generation values are forbidden.
The command derives them from authenticated membership/capability, trusted
host/base authority, and current owner heads.

Grants and RLS MUST cover both `USING` and `WITH CHECK` so an allowed update
cannot move a row into another scope. Views, functions, RPCs, triggers,
workers, Payload adapters, imports, service-role paths, support tools, and
repair commands MUST repeat the same invariants and receive poison tests.
CMS keeps stable soft references and its own access enforcement; it does not
become route authority through a cross-schema shortcut.

### D15-R17 — Concurrency, retries, caches, and failures preserve safe truth

Commands MUST pin expected locale catalog/profile, Site-locale lifecycle,
verified host/base, route registry/canonicalizer, allocation, public
generation, and actor authority heads. Lock order is bounded and documented;
no external network call occurs while locks are held.

One durable business idempotency key identifies the intended allocation and
activation effect. Same-key retries return the original durable receipt.
Different-scope reuse conflicts. Unknown outcomes read and reconcile the
receipt/outbox before another attempt; they never create a second allocation.

Cache-key arguments MUST include Tenant, environment, Site, trusted host
binding, stable Site Locale ID, public-base generation, route owner/resource,
audience, public generation, and renderer version. Cache tags remain
invalidation handles only. A cache-key or resolver ambiguity fails closed and
no-store. Bounded expiry self-heals missed favorable invalidation; adverse
containment bypasses ordinary freshness.

### D15-R18 — Security, privacy, and finance remain separate

The fixed namespace and locale segment may contain only the admitted
lowercase ASCII BCP 47 serialization. Path separators, controls, invisible or
bidi-control characters, malformed encoding, traversal, unbounded extensions,
and ambiguous canonical equivalents are rejected or quarantined.

Negative route, availability, collision, timing, cache, logs, metrics, support,
and error behavior MUST not reveal another Tenant, Site, unpublished locale,
restricted ministry, missionary location, sensitive title, financial fact,
actor, or lifecycle. Public segment suggestions use only the approved Site
Locale catalog, never private ministry data.

Locale identity and URL never select or imply Legal Entity, Tenant Stripe
account, settlement, bank, Designation, currency, tax/receipt legal facts, or
accounting treatment. An exact Site Locale MAY supply a validated presentation-
locale request to the checkout, message, or receipt owner. That owner
independently resolves and records the actual rendered locale and any safe
fallback/user-choice outcome; the request never owns legal or financial truth.
Every new financial operation independently resolves, authorizes, and freezes
its exact financial facts after its owning admission.

### D15-R19 — Migration is evidence-classified and adverse-first

Implementation MUST inventory every current public origin, host/alias, Site,
unprefixed route, CMS catch-all result, static redirect, route owner, exact
locale evidence, canonical/search artifact, cache seam, external placement,
and historical link before any writer activates.

The migration MUST NOT assign today's default locale from path absence, page
text, Tenant address, majority traffic, currency, provider, browser, or country.
Only source-owned proof may bind an old ordinary Page to an exact Site Locale.
Ordinary Pages may receive their separately governed exact same-Page
continuity. Specialized routes use their owner. Giving intent never redirects,
falls back, or inherits a default.

The `/lang` reservation outranks generic ordinary Page continuity. Every legacy
`/lang` or `/lang/*` Page/redirect MUST be inventoried before activation.
`/lang` itself, malformed children, ambiguous routes, and paths that do not
conform to `/lang/{exact-Site-Locale}/{owner-path}` remain reserved and
privacy-safe absent with no redirect; the Page owner creates a newly reviewed
successor URL and staff see the affected old/new links.

A conforming legacy `/lang/{exact-Site-Locale}/{owner-path}` ordinary Page MAY
continue directly—never through a redirect or alias—only when its source owner
atomically proves the same Tenant, environment, Site, verified origin, stable
exact Site Locale, immutable Page/resource, route kind, public meaning, and
collision-free canonical address and migrates it into the new route authority/
public generation. Giving remains governed independently by D10–D14; D15 never
grants it Page continuity. If the pre-activation census proves the namespace
cost unacceptable, D15 must be reopened to select another namespace before any
public D15 allocation—never bypassed by route precedence.

Typed route classification, `/lang/` reservation, canonical occupancy,
fail-closed readers, and negative cache behavior deploy before writers. Sites
activate by explicit cohort. Old/new code and additive schema are compatible
through the activation boundary. After any public allocation, rollback retains
allocations and history; recovery rolls forward or serves privacy-safe absence.

The current host-blind `/give` and `/donate` redirects, unprefixed CMS catch-all,
hard-coded English metadata, and `siteId: null` seam MUST be removed, fenced,
or explicitly routed outside the new authority before favorable D15 writers
activate.

### D15-R20 — The decision stays bounded and traceable

D15 does not create automatic translation, per-field workflow, a locale alias
DSL, custom prefix editor, locale-specific domain default, per-locale Site,
provider URL matcher, IP targeting, language-cookie router, financial region,
generic redirect console, alternate cache system, search crawler control plane,
or all-locale release action.

Accepted ADR-0026 reserves absolute root future route families including
`/give`, `/sitemap.xml`, `/robots.txt`, and `/preview`, and separately keeps
checkout public at root `/checkout`. The later spec/ADR flow MUST explicitly
reconcile it: locale-bearing families become base-relative below
`/lang/{segment}`, while checkout and bare/root legacy/control forms remain
with their source owners. This decision log does not silently override an
accepted ADR.

Proposed Phase 22 PR #1323 and Phase 23 PR #1340 support exact-locale releases,
source-owned paths, coherent generations, Page-specific continuity, and search
projection, but they remain open/blocked proposed evidence until merged or
superseded. D15 must be traceable into the glossary, ADR, PRD, OpenSpec, design,
tasks, tickets, tests, migration evidence, release proof, and monitors through
the separately invoked specification workflow.

## Complete staff journey

### 1. Start in plain product language

Staff open **Site → Languages**, not a router or generic CMS settings page. A
single-locale Site shows one compact row and no distracting matrix:

```text
English
Default · Website live
Website address prefix  hope.org/lang/en

[ Open English website ]                  [ Manage English content ]
```

Multi-locale Sites use a responsive vertical list with one active-language
context at a time. Status uses text plus an icon, never color alone.

### 2. Add a language without requiring a code

The primary control is a searchable language combobox using native and
staff-language names. It supports keyboard search and long/RTL labels. Flags
are absent.

```text
Add website language

Language
[ Français — French                                  v ]

Is this content specific to a region?
( ) No — use French for any region
(•) Yes

Region
[ Canada                                              v ]
```

Script appears only when it materially distinguishes available choices. Help
explains the consequence in plain language:

> Choose French if this website content is for French readers generally.
> Choose French (Canada) only when wording or presentation is specifically
> Canadian.

### 3. Show the generated public result immediately

Core displays the read-only result and two real examples before staff continue:

```text
French (Canada)

Website address prefix                         Not public yet
hope.org/lang/fr-ca

Core adds this automatically to every French (Canada) website address.
Changing the default language later will not change it.

Planned Page      hope.org/lang/fr-ca/a-propos
Planned Giving    hope.org/lang/fr-ca/give/eau-potable

[ Back ]                                      [ Add French (Canada) ]
```

Technical details may disclose canonical tag `fr-CA`, profile version, and
stable reference for authorized support, but those are never required to
complete the task.

### 4. Keep private setup productive

Adding the Site Locale creates private setup only. It does not reserve a public
route, translate content, publish Pages, enable Giving, select currency, or
create financial configuration. Staff may start blank or copy only through the
separately governed exact-locale editorial workflow.

The planned prefix is clearly labelled **Not public yet**. A signed Preview
renders the exact candidate without making `/lang/fr-ca` public, indexable,
copyable as a live link, or cacheable as published content.

### 5. Make Page and Giving address editing obvious

The Page editor visually separates the fixed base from the meaningful Page
words:

```text
Page address
hope.org/lang/fr-ca/ [ a-propos                         ]
```

The Giving editor keeps both fixed parts quiet and lets staff edit only the
human-readable final segment:

```text
Giving page address
hope.org/lang/fr-ca/give/ [ eau-potable                ]
```

The whole address remains visible and wraps safely on mobile. Planned and
current addresses are never presented as the same fact. Input, focus, and
cursor position survive advisory-check errors and weak-network retries.

### 6. Turn blockers into owner-routed actions

The publish review groups exact blockers by cause:

```text
French (Canada) website

Ready
✓ Website address checked
✓ Public design ready
✓ Navigation ready

Needs attention
! 2 selected Pages still need French content  [ Review selected Pages ]

Not included in this publish
Giving page is not ready                  [ Review separately ]
```

Only requirements of the exact release block it. A user lacking the capability
sees **Ask a website publisher** or the named owner, not a dead action. A
cross-Tenant collision never reveals the other owner.

### 7. Review the first public consequence once

The first favorable activation uses a full page or spacious sheet, not a tiny
confirmation alert:

```text
Publish French (Canada) website?

Public prefix             hope.org/lang/fr-ca
Pages becoming public     12
Navigation                Ready
Giving page               Not included

This prefix becomes permanent when you publish.
Changing the default language, page titles, currency, or Stripe settings will
not change these website addresses.

[ Back ]                         [ Publish French (Canada) website ]
```

No repeated warning appears on ordinary content edits after the prefix is
frozen.

### 8. Return a durable receipt and useful next actions

After success, staff see the exact favorable effect rather than a transient
toast alone:

```text
French (Canada) website is live
hope.org/lang/fr-ca

12 Pages live · Navigation current · Giving not published

[ Open website ] [ Copy website address ] [ Manage French content ]
```

The receipt remains available in activity history with actor, Site, exact
locale, public-base generation, affected release, and result. A repeated
submit or lost response returns this same result.

### 9. Make default-language changes reassuring

Changing the Site default shows one explicit consequence summary:

> **Make French (Canada) the default language?**
>
> Existing English and French website and Giving addresses will not change.
> This changes where staff start and will affect only the separately decided
> locale-neutral Site entry behavior.

D15 does not implement that root-entry behavior before D16.

### 10. Handle withdrawal and correction without destructive language

Withdrawing a Site Locale shows which public Pages, Navigation entries,
Giving presentations, and search artifacts become unavailable, while
preserving its prefix and history. **Remove language** is not shown for a
publicly used locale. A corrected material locale starts a governed successor;
staff receive exact Page-owner continuity and Giving no-redirect outcomes.

## Complete visitor journey

### 1. An explicit address produces one deterministic representation

A visitor opening:

```text
https://hope.org/lang/fr-ca/a-propos
```

receives French (Canada), regardless of browser language, location, cookie,
current Site default, or currency. The response declares `fr-CA`, uses the
correct direction, and all managed internal links retain `/lang/fr-ca`.

### 2. Language choice is deliberate and task-preserving

The visible language control shows native names and links only to current
semantic equivalents. On the French About Page, **English** links to the exact
English About Page—not the English homepage and not a string-replaced guess.
If the English equivalent is unavailable, Core omits or explains that option.

### 3. Giving remains exact and financially neutral

A donor opening:

```text
https://hope.org/lang/fr-ca/give/eau-potable
```

always receives the exact French (Canada) Giving presentation. A language
link appears only when another independently current preferred exact-locale
Giving address exists under D14. The URL never chooses CAD, a Canadian Legal
Entity, a Stripe account, settlement, bank, or accounting treatment.

### 4. Infrastructure remains predictable

The same origin can safely serve:

```text
/lang/api/about       Apiaká public content
/api/donate           contribution API
/robots.txt           origin crawler guidance
/.well-known/...      registered origin metadata
```

No request depends on a growing language blacklist or middleware route-order
accident.

## Source of truth and ownership map

| Authoritative fact                                                             | Source owner                                        | Derived consumers                                                                | Must never become owner                                  |
| ------------------------------------------------------------------------------ | --------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Stable Site Locale ID, exact canonical BCP 47 tag, pinned profile, lifecycle   | Phase 24 Site Locale owner                          | Route allocation, Pages, Giving, search, HTML language, staff/public projections | URL text, browser, cookie, provider, currency            |
| Verified origin and host generation; permanent shared-host Site handle         | Domain/Site public-base owner                       | Public resolver, route allocation, canonical/search, cache                       | Request-controlled host, Page, locale, CMS               |
| Fixed `/lang/` namespace and complete canonical occupancy                      | Shared public route authority                       | Every locale-bearing route owner                                                 | CMS catch-all, Next.js folder, plugin, tenant setting    |
| Immutable lowercase public locale segment and base allocation                  | Public route authority from exact Site Locale input | Page/Giving builders, Navigation, search, cache, support                         | Mutable default, display label, latest IANA/Unicode data |
| Ordinary Page/Article relative path and same-Page continuity                   | Phase 23 Page route owner                           | Navigation, public runtime, search/share                                         | Site Locale, Giving, redirect plugin                     |
| Specialized public ministry Page path/disposition                              | Phase 22 source owner                               | Public runtime, Navigation, search/share                                         | Generic Page tree, locale middleware                     |
| Giving-relative `/give/{slug}`, immutable meaning, preference, Stop            | Giving/route owners under D10–D14                   | Page placement, QR/share, donor resolver                                         | Page, locale, CMS, Stripe/provider                       |
| Navigation membership and label                                                | Navigation revision owner                           | Public shell and generation                                                      | Page tree movement, URL copy field                       |
| Canonical, `hreflang`, sitemap, robots, social/search artifacts                | Search/share compiler over current exact manifests  | Crawlers, cards, staff health                                                    | Provider result, Page free text, request host            |
| Public cache key and invalidation handles                                      | Public runtime/cache contract                       | Render/read performance                                                          | Locale tag alone, tag-only isolation, CDN guess          |
| Locale-neutral `/` behavior and homepage-only `x-default`                      | D16 Site Root Entry/Public Site Generation owners   | Site entry and eligible homepage search projection                               | Framework middleware default, Giving, deep Pages         |
| Designation, currency, Legal Entity, Stripe, settlement, bank, tax, accounting | Existing financial/operational owners               | Admitted contribution, receipt, ledger, finance UI                               | Site, locale, URL, Page, provider display                |

## Domain invariants and valid cardinality

1. One Tenant may own many Sites; one Site may recognize many exact Site
   Locales; a Site Locale never becomes another Site.
2. One Site cannot have two stable Site Locale identities that are canonical
   or deprecated-tag equivalents under the same pinned profile.
3. One stable Site Locale has one canonical tag generation at a time and, after
   first favorable activation, exactly one immutable public locale segment.
4. Every favorable locale-bearing human public route has exactly one Site
   Locale Public Base and exactly one source-owned relative route.
5. Every Site Locale Public Base contains the fixed `/lang/` namespace; no
   direct `/{locale}` favorable route exists in the new cohort.
6. Root infrastructure/control routes contain no Site Locale Public Base unless
   their own source contract explicitly embeds a locale as operation data.
7. The same locale segment may exist on genuinely distinct admitted Site
   public bases. The same complete canonical external base cannot belong to
   two Site Locales, Sites, Tenants, environments, or route meanings.
8. The current default Site Locale is a staff/setup and future neutral-entry
   preference only; it has no power to rename, reinterpret, canonicalize, or
   redirect an explicit public route.
9. A host/base move may create a new base generation while preserving the
   stable locale segment; it never erases the prior allocation or changes a
   Giving address owner.
10. Page, Navigation, Giving, search, and cache store stable references or
    immutable generation pins, not independently editable copies of the base.
11. A favorable public generation is complete: the base, shell, Navigation,
    content, route, search inputs, cache identity, and renderer cannot be mixed
    across generations.
12. Conservation applies to route claims: one successful activation creates
    one allocation and one durable receipt; failure or retry creates none.
13. Route unavailability, locale withdrawal, Page retirement, Giving Stop,
    D7 admission, and financial ineligibility remain separately owned states.
14. Site Locale, public base, Page words, and Giving words select no financial
    identity or money behavior.

## Lifecycle and transition model

| Concept                            | Valid states                                                                                                         | Valid transitions                                                                                | Forbidden transitions                                                                         |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| Site Locale                        | recognized private, preparing, release-ready, public, unavailable/withdrawn, terminal source outcome                 | source-owned setup, exact-locale release, withdrawal, compatible restoration, governed successor | default relabel as identity; country/currency inference; delete/recreate same public identity |
| Public locale segment              | generated private candidate, advisory checked, atomically allocated/current, route-unavailable, permanently reserved | initial activation; compatible same-identity recovery; source-owned successor base               | draft reservation; live edit; latest-registry recompute; reuse; silent suffix                 |
| Site Locale Public Base generation | private candidate, proved, current, superseded, unavailable                                                          | complete preparation; expected-head activation; forward successor                                | partial activation; destructive rollback; cross-Site transfer                                 |
| Default Site Locale                | one current preference                                                                                               | authorized change with consequence review                                                        | URL mutation; historical interpretation; silent root behavior                                 |
| Locale-bearing Page route          | candidate, current, predecessor continuity/absence, unavailable                                                      | Page-owner release and exact continuity                                                          | generic locale redirect; homepage guess; Giving ownership                                     |
| Giving address                     | D10–D14 lifecycle                                                                                                    | exact same-locale direct continuity, preference change, terminal Stop                            | locale/base redirect; default fallback; reassignment                                          |
| Route class                        | code-owned registered kind/version                                                                                   | reviewed additive registry successor                                                             | runtime inference; mutable tenant DSL; plugin ownership                                       |
| Search/cache projections           | current, lagging, invalid/adverse                                                                                    | idempotent derivation from active manifest; removal adverse-first                                | become release/locale truth; repair by guessed URL                                            |

## Current behavior, intended behavior, and permanent path

| Concern              | Current `develop` behavior                                                                                                                                                  | D15 intended behavior                                                                                                                                     | Best permanent path                                                                           |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Public URL shape     | Public donor Pages and CMS catch-all are unprefixed; static routes occupy root paths.                                                                                       | Every favorable locale-bearing content URL uses `/lang/{exact-segment}`.                                                                                  | Add the typed namespace below trusted Site resolution; do not bulk-prefix current paths.      |
| Site resolution      | `toPublicRequestContext` returns `siteId: null`; current host resolver is tenant-first.                                                                                     | Trusted request context includes exact Tenant, Site, host generation, and Site Locale.                                                                    | Complete the Phase 24 host→Site→locale contract before positive writers.                      |
| Locale configuration | Shared site config is hard-coded English-oriented (`en_US`/English shell); Payload localization is not an accepted runtime authority.                                       | Stable versioned exact Site Locale identity with fallback-free public reads.                                                                              | Reconcile D14/D15 with Phase 2 and proposed Phase 22/23; disable provider fallback.           |
| CMS route identity   | Raw slug fields are indexed but not structurally unique; the catch-all passes path segments to a tenant-scoped lookup.                                                      | Source-owned relative Page paths consume one immutable Site Locale Public Base.                                                                           | Shared route authority before CMS; quarantine ambiguous legacy results.                       |
| Giving root          | `next.config.ts` permanently redirects root `/give` and `/donate` to `/workers`.                                                                                            | Giving is base-relative `/lang/{locale}/give/{slug}` and never redirects Giving intent.                                                                   | Fence/remove host-blind redirects before any D10–D15 writer. Keep bare legacy forms reserved. |
| Canonical/search     | Root metadata uses one static canonical/site locale; no exact-locale public manifest ships.                                                                                 | Canonical ordinary/specialized Pages self-canonicalize; Giving preserves D14 preferred/same-locale rules; exact equivalents emit reciprocal alternatives. | Compile from immutable active generations, not request headers or layout defaults.            |
| Cache isolation      | Current CMS reads use host/tenant descriptors and fetch tags, but ADR-0030's function-level tenant-argument isolation and Site/locale dimensions are not fully implemented. | Tenant, Site, host, stable locale, base, audience, route, generation, and renderer are cache-key arguments.                                               | Complete ADR-0030's accepted function-level contract; never treat tags as security.           |
| Staff URL UX         | Web Studio asks for a raw **URL slug** and shows unprefixed previews.                                                                                                       | Core shows a locked **Website address prefix** and lets staff edit only owner-controlled words.                                                           | One Maia/Base UI composition over the shared builder; no second route service.                |

## Adversarial category review

Each concern below states the failure and why it matters, severity and
likelihood, supporting evidence, effect on the founder answer, and the
permanent fix with exact D15 language. **Material concern** describes the
unamended one-line answer or its consequences; the corrected clauses close or
contain it.

### 1. Problem validity, necessity, and alternatives

**Material concern exists in the unamended answer.**

| What could go wrong and why it matters                                                                                                                                                        | Severity / likelihood | Evidence or reasoning                                                                                                                                                                               | Effect on the answer                                          | Best permanent fix and exact language                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Core could present an explicit default prefix as universal SEO truth. That would freeze implementation around a false justification and invite SEO theater.                                   | Medium / High         | **External fact:** Google supports subdirectories, subdomains, and country domains and does not require a prefixed default. **Product judgment:** Core needs stability, not ranking folklore.       | Narrows the rationale; does not invalidate explicit locales.  | **Final disposition and D15-R1–R2:** record one Core invariant and state that no ranking benefit is claimed. |
| The strongest alternative—unprefixed default plus prefixed additional locales—saves characters but couples permanent Page/Giving meaning to a mutable default or hidden original-default pin. | High / High           | **Repository fact:** D10–D14 make Giving links permanent and default changes non-authoritative. **External fact:** `next-intl` documents added redirects/cookie behavior for an unprefixed default. | Confirms Option 1 after trade-off.                            | **D15-R1, R6, and R8:** every locale explicit; default changes no route; no hidden negotiation.              |
| A no-build option that keeps current English root routes cannot support exact locale identity, regional/script siblings, or deterministic language switching.                                 | High / High           | **Current behavior:** English-oriented shell, `siteId: null`, raw unprefixed CMS routes.                                                                                                            | Rejects no-build as permanent path; migration remains staged. | **D15-R19:** inventory current behavior and activate only after exact source proof.                          |

### 2. Brittleness

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                                  | Severity / likelihood                      | Evidence or reasoning                                                                                                                                   | Effect on the answer                                       | Best permanent fix and exact language                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Direct `/{locale}` routing breaks when a valid language equals `/api`, `/app`, `/dev`, a future Page root, or another control family. Route order then decides meaning. | Critical / Certain under supported catalog | **External fact:** the current IANA registry assigns those three-letter language subtags. **Current behavior:** Core has `/api/*` and many root routes. | Replaces the draft direct examples with a fixed namespace. | **D15-R2–R3:** one reserved `/lang/{segment}` grammar; no blacklist or suffix.           |
| Recomputing a segment from the latest registry, CLDR, display label, or current default can move live URLs after a dependency/config change.                            | Critical / Medium-High                     | **External fact:** BCP 47 supports preferred/deprecated values and profile data evolves. **Repository fact:** D10 freezes address interpretation.       | Requires stored immutable route representation.            | **D15-R4–R6:** canonicalize once under a pinned profile, store, and use successors only. |
| A catch-all that strips the first segment and falls back to default content works only while inputs are perfect and can expose wrong-language or wrong-Site content.    | Critical / High                            | **Current behavior:** a generic CMS catch-all exists; proposed exact locale authority is unmerged.                                                      | Narrows router behavior to typed positive classes.         | **D15-R7–R8:** explicit route registry; unknown/missing locale fails closed.             |

### 3. Technical debt

**Material concern exists.**

| What could go wrong and why it matters                                                                                                             | Severity / likelihood | Evidence or reasoning                                                                                                                                                                     | Effect on the answer                           | Best permanent fix and exact language                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Page, Giving, Navigation, search, preview, QR, and cache could each concatenate `/${locale}` differently. Drift becomes permanent link corruption. | Critical / High       | **Repository fact:** ADR-0029 requires reference-not-copy; current code has separate route/metadata helpers.                                                                              | Changes architecture, not the product choice.  | **D15-R2, R9–R12:** one server-owned builder; stable references; one generation.                         |
| Adding an editable “locale prefix” field would create another alias, collision, migration, and support subsystem.                                  | High / High           | **External fact:** Webflow permits custom subdirectories and explicitly warns about collisions. **Product judgment:** staff need control over meaningful Page/Giving words, not plumbing. | Rejects customizable prefixes at launch.       | **D15-R4 and R14:** generated read-only prefix; future exceptions require a governed successor decision. |
| Extending the current static redirect and CMS slug tables would duplicate the shared route authority and preserve unsafe root assumptions.         | Critical / High       | **Current behavior:** host-blind redirects and non-unique slug lookup coexist.                                                                                                            | Blocks implementation on route reconciliation. | **D15-R11, R19, and R20:** constraints/readers first; explicit ADR-0026 amendment; no parallel registry. |

### 4. Edge cases

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                                | Severity / likelihood  | Evidence or reasoning                                                                                                   | Effect on the answer                                         | Best permanent fix and exact language                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Generic `fr`, regional `fr-CA`, scripts `zh-Hans`/`zh-Hant`, deprecated aliases, variants, and long tags could be collapsed, truncated, or duplicated.                | High / High            | **External fact:** RFC 5646 treats tags case-insensitively, preserves meaningful subtags, and warns against truncation. | Makes “language” an insufficient unit.                       | **D15-R1, R4–R5:** exact Site Locale, justified specificity, pinned canonicalization, no truncation.                |
| Host moves, shared-host handles, aliases, locale withdrawal, default change, Page moves, and Giving replacement can race or imply conflicting continuity.             | Critical / Medium-High | **Repository fact:** proposed Phase 22/23 assigns distinct route owners; D9–D14 forbid Giving fallback.                 | Requires owner-specific lifecycle, not one generic redirect. | **D15-R6, R9, R12, R17, and R19:** complete generations, expected heads, owner-specific outcomes.                   |
| Localized PDFs, assets with translated meaning, root sitemaps, and operation-result pages do not fit a simplistic “all files localized” or “no files localized” rule. | High / Medium          | **External fact:** Google supports `hreflang` HTTP headers for non-HTML resources; protocol routes have root scopes.    | Narrows the exception model.                                 | **D15-R7 and R13:** classify human locale content by meaning, not extension; keep protocol/control owners explicit. |

### 5. Footguns

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                       | Severity / likelihood | Evidence or reasoning                                                                                                                     | Effect on the answer                                | Best permanent fix and exact language                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Staff type `english`, a developer auto-adds `-2`, or a CMS plugin wins a conflict, creating permanent inconsistent URLs.                                     | High / High           | **External fact:** CMS products often expose customizable slugs/suffixes. **Repository fact:** Giving routes become permanently reserved. | Restricts normal staff control.                     | **D15-R3–R4 and R14:** system-generated prefix, no suffix, one useful conflict path.              |
| A developer puts `/api`, auth callbacks, preview, or checkout under locale middleware, breaking provider callbacks or creating open redirect/cache behavior. | Critical / High       | **Current behavior:** these route families share `apps/donor`; Next.js proxy can run globally.                                            | Requires explicit control-route exclusion by owner. | **D15-R7 and R20:** finite typed route classes; unclassified routes cannot ship.                  |
| Copying a current full URL into Navigation or a message makes a later compatible host/base generation silently stale.                                        | High / High           | **Repository fact:** ADR-0029 and D13 require references, not copied operational meaning.                                                 | Narrows storage and authoring.                      | **D15-R10:** managed links store stable references; literal imports remain literal or quarantine. |

### 6. Tenant safety

**Material concern exists.**

| What could go wrong and why it matters                                                                             | Severity / likelihood  | Evidence or reasoning                                                                               | Effect on the answer                             | Best permanent fix and exact language                                                                                       |
| ------------------------------------------------------------------------------------------------------------------ | ---------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| A cache keyed by `fr-ca` or Page slug alone can serve another Site or Tenant, especially on shared hosts.          | Critical / Medium-High | **Repository fact:** ADR-0030 says tags do not isolate; current locale is only a reserved tag seam. | Adds mandatory cache scope.                      | **D15-R17:** Tenant, environment, Site, host, stable locale, base, audience, route, generation, renderer are key arguments. |
| A shared-host handle or host rebind can make the same visible base resolve to another Site after departure/return. | Critical / Medium      | **Repository fact:** D10/D11 permanently scope external address identity and host generations.      | Requires complete base occupancy across history. | **D15-R2, R6, R11, and R16:** trusted host generation, permanent handle, restrictive reuse, one canonical authority.        |
| Availability/collision errors can reveal that another Tenant operates an unpublished or sensitive locale.          | Critical / Medium      | **Repository fact:** public isolation fails closed; D11 uses non-enumerating collision outcomes.    | Narrows staff detail and telemetry.              | **D15-R11 and R18:** only authorized same-Tenant detail; equivalent cross-Tenant status/timing/log behavior.                |

### 7. Database, RLS, and authorization safety

**Material concern exists.**

| What could go wrong and why it matters                                                                                         | Severity / likelihood                     | Evidence or reasoning                                                                                                                       | Effect on the answer                         | Best permanent fix and exact language                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Tenant-local uniqueness, mutable scope columns, nullable Site/locale, or cascading deletion can move or release a public base. | Critical / Medium-High                    | **Database reasoning:** application prechecks cannot enforce immutable cross-scope occupancy. **Current behavior:** `siteId` is still null. | Requires structural design before writers.   | **D15-R16:** composite scope, complete uniqueness/indexes, immutable columns, `ON DELETE RESTRICT`, retained reservation. |
| An RLS update policy with `USING` but no correct `WITH CHECK` can transform an allowed row into another Tenant/Site/locale.    | Critical / Medium                         | **Postgres/RLS reasoning:** visibility and new-row validity are separate mutation predicates.                                               | Adds operation-specific authorization proof. | **D15-R16:** explicit grants plus `USING` and `WITH CHECK` on every mutation; poison tests.                               |
| A service role, Payload hook, RPC, import, support tool, or worker can bypass browser RLS and accept caller-supplied scope.    | Critical / High without explicit controls | **Repository fact:** Payload's CMS role bypasses Postgres RLS; ADR-0028 uses application defense in depth.                                  | Extends invariant beyond RLS.                | **D15-R16:** trusted server derivation and repeated same-scope validation on every privileged path.                       |

### 8. Overengineering

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                 | Severity / likelihood | Evidence or reasoning                                                                                      | Effect on the answer                                  | Best permanent fix and exact language                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Core could respond to collisions by building custom handles, per-locale domains, wildcard rules, alias priority, negotiation, or a route DSL.          | Medium / Medium-High  | **Product reasoning:** the fixed namespace and exact tag already solve the root problem deterministically. | Narrows the permanent scope.                          | **D15-R2–R5 and R20:** one fixed namespace, one generated segment, no DSL or customization.   |
| Prebuilding all locale translations, all route permutations, or an external search/CDN service solves speculative scale while increasing setup burden. | High / Medium         | **Repository fact:** proposed exact-locale lineages are sparse; current product is single-language.        | Rejects a localization platform disguised as routing. | **D15-R12, R14, and R20:** sparse owner releases, bounded generation, measured triggers only. |

### 9. UX/UI and user friction

**Material concern exists.**

| What could go wrong and why it matters                                                                                                      | Severity / likelihood | Evidence or reasoning                                                                                                                                     | Effect on the answer                           | Best permanent fix and exact language                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Staff see BCP 47 codes, domain fields, prefixes, and warnings instead of accomplishing “add French.” This increases errors and abandonment. | High / High           | **External fact:** modern CMS tools use human locale selectors and contextual previews. **Repository fact:** Base Maia is the sole product design system. | Changes presentation, not the invariant.       | **D15-R14 and complete staff journey:** native/staff names, progressive disclosure, generated locked prefix, one review. |
| A single-locale Site gets a noisy locale dashboard; a multi-locale Site gets a Page × locale matrix. Both obscure the actual work.          | Medium / High         | **Proposed evidence:** Phase 22/23 favors one active locale and quiet single-locale UX.                                                                   | Narrows information architecture.              | **D15-R14:** compact row for one locale; responsive vertical cards; one active locale, no matrix.                        |
| Language switching sends visitors to a locale homepage when the equivalent Page is missing, destroying task continuity.                     | High / Medium-High    | **External fact:** Canada design guidance targets the corresponding equivalent; Google recommends explicit language links.                                | Narrows public switch behavior.                | **D15-R10 and R15:** exact relation only; omit/explain missing; no guessed home.                                         |
| `/lang/` adds characters and could feel technical if exposed as a field.                                                                    | Low-Medium / Certain  | **Product judgment:** it prevents real language/control collisions; staff do not type it.                                                                 | Accepts a visible URL cost with UX mitigation. | **D15-R3 and R14:** label full value **Website address prefix**, keep it locked, explain once at first publish.          |

### 10. Source of truth, ownership, and domain invariants

**Material concern exists.**

| What could go wrong and why it matters                                                                                                        | Severity / likelihood  | Evidence or reasoning                                                                                   | Effect on the answer                | Best permanent fix and exact language                                                                     |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Default locale, CMS slug, Page title, current IANA alias, request host, or cache projection can become route write authority.                 | Critical / High        | **Repository fact:** accepted reference-not-copy and public-isolation ADRs reject projection authority. | Requires explicit ownership matrix. | **D15-R4, R6, R9–R12:** stable locale ID and route allocation own their distinct facts; consumers derive. |
| Locale path starts selecting Site, Giving, currency, Stripe, or legal/accounting meaning because they appear adjacent in a URL or setup form. | Critical / Medium-High | **Repository fact:** founder D1 and D14 separate Site/locale presentation from finance.                 | Strongly narrows route semantics.   | **D15-R9 and R18:** URL selects presentation only; financial operation re-resolves/freeze independently.  |
| Invalid cardinalities—two segments for one locale, one base for two locales, or two current generation heads—remain possible by convention.   | Critical / Medium      | **Database reasoning:** concurrent valid app actions can jointly violate a convention.                  | Adds structural invariants.         | **D15-R11–R12 and R16:** complete uniqueness, one head, composite same-scope constraints, atomic claim.   |

### 11. Hidden coupling

**Material concern exists.**

| What could go wrong and why it matters                                                                                            | Severity / likelihood | Evidence or reasoning                                                                                                               | Effect on the answer                                | Best permanent fix and exact language                                                               |
| --------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Relative API, asset, auth, form, or checkout links inherit `/lang/{locale}` accidentally when composed from the current pathname. | High / High           | **Current behavior:** public and authenticated/control routes share one Next.js app.                                                | Requires typed link construction and route classes. | **D15-R7, R9–R10:** operation/control owners build their own references; no pathname inheritance.   |
| Search, hreflang, sitemap, Open Graph, Navigation, or QR code guesses a sibling by string replacement.                            | High / High           | **External fact:** reciprocal alternates require exact URLs; **repository fact:** D14 forbids Giving URL guessing.                  | Narrows derived metadata.                           | **D15-R10 and R13:** compile from one exact equivalence/reference manifest.                         |
| A framework i18n library or Payload fallback silently becomes product policy through defaults.                                    | High / High           | **External fact:** Next.js examples and `next-intl` can redirect/detect; Payload fallback defaults on when localization is enabled. | Requires adapters subordinate to Core.              | **D15-R7–R8, R15, and R20:** URL-only explicit reads, fallback disabled, adapter conformance tests. |

### 12. Failure modes

**Material concern exists.**

| What could go wrong and why it matters                                                                                | Severity / likelihood | Evidence or reasoning                                                                                                    | Effect on the answer                                      | Best permanent fix and exact language                                                                                     |
| --------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Allocation commits but generation activation, audit, receipt, or outbox does not; a retry then claims another state.  | Critical / Medium     | **Distributed-system reasoning:** unknown responses and post-commit failures are ordinary.                               | Requires one atomic business effect and durable recovery. | **D15-R6, R12, and R17:** allocation/activation/receipt/outbox in one authoritative operation; reconcile receipt.         |
| Resolver or cache authority is unavailable and the app serves a default or stale sibling “to stay up.”                | Critical / Medium     | **Repository fact:** public isolation prefers safe absence; wrong locale is worse than a truthful outage.                | Defines fail-safe behavior.                               | **D15-R8, R12, and R17:** no-store neutral failure/absence; never guess a favorable locale.                               |
| Post-activation cache/sitemap convergence fails and staff believe “published” means every external system is current. | High / Medium         | **Repository fact:** proposed search contracts separate release from provider observations; ADR-0030 has bounded expiry. | Narrows success copy and observability.                   | **D15-R12–R13 and R17:** durable projection retry, bounded expiry, separately labelled release/projection/provider facts. |

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                 | Severity / likelihood  | Evidence or reasoning                                                                                                   | Effect on the answer                                   | Best permanent fix and exact language                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Two canonical/deprecated aliases race to create separate Site Locales or segments.                                                                     | Critical / Medium      | **External fact:** several strings can be standards-equivalent.                                                         | Requires semantic uniqueness under the pinned profile. | **D15-R4, R11, and R16–R17:** canonical identity constraint, locks/CAS, one receipt.                       |
| Page publish, locale activation, default change, host move, and route registry upgrade each pass alone but produce a mixed public generation together. | Critical / Medium-High | **Repository fact:** proposed D1/D2 contracts use complete generation heads.                                            | Adds expected-head closure.                            | **D15-R12 and R17:** pin every relevant head; one compare-and-set; stale candidate reloads.                |
| A later registry update retroactively changes historical route meaning or an old default is treated as current truth.                                  | Critical / Medium      | **External fact:** registry preferred values evolve; **repository fact:** historical rendering uses pinned generations. | Requires temporal pins.                                | **D15-R4–R6:** retain profile/version and literal allocation; default has no historical power.             |
| Same request is retried after a timeout, worker replay, or double click.                                                                               | High / High            | **Operational fact:** at-least-once delivery and ambiguous clients are expected.                                        | Adds business idempotency.                             | **D15-R17:** durable semantic key and receipt; same effect returns same result, different scope conflicts. |

### 14. Data integrity risks

**Material concern exists.**

| What could go wrong and why it matters                                                                                          | Severity / likelihood | Evidence or reasoning                                                                  | Effect on the answer         | Best permanent fix and exact language                                                   |
| ------------------------------------------------------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------- |
| Copied base strings drift after host generation, Page path, or standards metadata changes.                                      | High / High           | **Repository fact:** ADR-0029 identifies copy drift as a load-bearing failure.         | Requires reference-not-copy. | **D15-R10:** stable references and immutable generation pins only.                      |
| Deleting a locale, Site, domain, Page, or Giving record cascades away occupancy, allowing a permanent route to be reused.       | Critical / Low-Medium | **Repository fact:** D10/D11 reserve issued routes permanently.                        | Changes delete behavior.     | **D15-R6, R11, and R16:** restrictive deletion and minimum retained allocation/history. |
| Migration assigns unprefixed Pages to today's default or newest matching CMS row, corrupting historical language and redirects. | Critical / High       | **Current behavior:** default English and newest/limit lookup are incomplete evidence. | Blocks inferred backfill.    | **D15-R19:** source-owned exact proof only; ambiguity quarantines.                      |

### 15. Security and privacy risks

**Material concern exists.**

| What could go wrong and why it matters                                                                                                              | Severity / likelihood  | Evidence or reasoning                                                                                                       | Effect on the answer                                   | Best permanent fix and exact language                                                                                           |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Encoded separators, case variants, dot segments, backslashes, Unicode controls, or malformed escapes bypass route occupancy or hit a control route. | Critical / Medium-High | **External fact:** RFC 3986 path parsing/normalization admits several equivalent or dangerous representations.              | Requires one canonicalizer and closed segment grammar. | **D15-R4, R11, and R18:** lowercase ASCII tag serialization, versioned full-path canonicalization, reject/quarantine ambiguity. |
| Region/script choices or error detail expose a restricted ministry location, unpublished audience, or cross-Tenant existence.                       | Critical / Medium      | **Repository fact:** Phase 10 treats URL slugs as publication-firewall egress; ADR-0028 requires empty on unresolved scope. | Narrows public labels/detail.                          | **D15-R5, R11, and R18:** only approved public locale identity, generic negative outcomes, minimized logs/support.              |
| Locale or browser country is treated as financial or compliance authority.                                                                          | Critical / Medium-High | **Repository fact:** Site/locale never owns Legal Entity, Stripe, or settlement.                                            | Reinforces the founder boundary.                       | **D15-R18:** negative finance tests; separately authorized/frozen operation facts.                                              |

### 16. Scalability and performance risks

**Material concern exists.**

| What could go wrong and why it matters                                                                                              | Severity / likelihood | Evidence or reasoning                                                                                                            | Effect on the answer             | Best permanent fix and exact language                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Locale × Page × host generation expands into request-time scans, all-pairs translation matrices, or build-time prerender explosion. | High / Medium         | **Repository fact:** current platform uses dynamic trusted host reads and Cache Components; proposed locale lineages are sparse. | Narrows implementation strategy. | **D15-R12, R14, and R17:** indexed exact lookup, one active locale UI, immutable manifests, measured caching/static choices. |
| Reciprocal alternatives and sitemaps grow beyond provider limits or are recomputed synchronously on every Page request.             | High / Medium         | **External fact:** sitemaps cap one file at 50,000 URLs/50MB; alternatives require complete links.                               | Adds bounded projection.         | **D15-R13:** set-based compiled equivalence, root index, partition before limit, durable convergence.                        |
| Availability checks on every keystroke or global collision scans make weak-network authoring unusable.                              | Medium / High         | **UX/database reasoning:** final uniqueness remains authoritative and candidate lists can be indexed.                            | Narrows advisory UX.             | **D15-R11 and R14:** debounce/on-blur/manual check, preserve input, final atomic claim.                                      |

### 17. Operational burden

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                                      | Severity / likelihood | Evidence or reasoning                                                                                                                                  | Effect on the answer                            | Best permanent fix and exact language                                                                                                                                   |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Each new locale needs custom middleware, DNS, redirect spreadsheets, CMS repairs, and support-only SQL.                                                                     | High / High           | **External fact:** subfolders are lower-maintenance than per-locale domains; **product reasoning:** one namespace removes language/control exceptions. | Confirms the bounded fixed grammar.             | **D15-R2–R4, R7, and R19:** generated prefix, one registry, owner-routed migration, no support bypass.                                                                  |
| Staff might be told every managed Navigation/message/QR link updates when a base changes, causing frozen sent/downloaded/printed artifacts to repoint or be misrepresented. | High / Medium-High    | **Repository fact:** D13 permits authorized updates only for editable managed placements; D10–D14 pin frozen artifacts.                                | Requires a candidate-versus-frozen distinction. | **D15-R10:** editable placements/QR definitions may prepare a new owner version; frozen messages, documents, QR/download/print/share artifacts never update or repoint. |
| Normal locale setup generates warnings and manual approvals for healthy states.                                                                                             | Medium / High         | **UX reasoning:** occasional ministry staff need a calm path; only irreversible first activation merits consequence review.                            | Narrows review ceremony.                        | **D15-R14:** healthy setup quiet, one first-publish review, grouped exceptions only.                                                                                    |

### 18. Observability and auditability gaps

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                            | Severity / likelihood | Evidence or reasoning                                                                               | Effect on the answer                            | Best permanent fix and exact language                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| A technical log says “published” without Tenant, Site, locale, base, route, actor, generation, or donor-visible outcome. Staff cannot diagnose or correct safely. | High / High           | **Repository fact:** prior Phase 24 decisions require durable business receipts distinct from logs. | Adds business audit requirements.               | **D15-R6, R12, and R17:** durable scoped receipt plus technical trace/outbox correlation.            |
| Wrong-locale, unprefixed-positive, cache-scope, Giving-redirect, or route-class regressions remain invisible until donors report them.                            | Critical / Medium     | **Operational reasoning:** these are zero-tolerance invariants with high impact.                    | Requires named signals and kill/fence response. | **Named production monitors below:** any violation triggers owner-specific containment.              |
| Search/provider lag is labelled as release failure or “indexed” without external proof.                                                                           | Medium / High         | **Proposed evidence:** Phase 23 D28 separates release, sitemap, fetch, and indexing observations.   | Narrows status labels.                          | **D15-R13 and R17:** object/timestamp/provider-specific observations, never projection as authority. |

### 19. Dependency and integration risks

**Material concern exists.**

| What could go wrong and why it matters                                                                                    | Severity / likelihood              | Evidence or reasoning                                                                                                                | Effect on the answer                            | Best permanent fix and exact language                                                                        |
| ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Next.js/`next-intl` auto-detection, redirect, or matcher defaults capture missing prefixes and hidden cookies.            | High / High                        | **External fact:** Next.js documents Accept-Language proxy redirects; `next-intl` documents detection and cookie behavior.           | Keeps library subordinate to product contract.  | **D15-R7–R8 and R20:** URL-only explicit content; route-class matcher; adapter tests; no hidden negotiation. |
| Payload localization fallback serves default-language fields into an exact target locale.                                 | Critical / High if enabled naively | **External fact:** Payload field fallback is enabled by default. **Proposed evidence:** Phase 22/23 forbids fallback.                | Blocks direct provider adoption.                | **D15-R8, R12, and R20:** exact locale lineage, fallback disabled, whole-release proof.                      |
| CDN/cache, CMS plugins, or Giving providers duplicate URL-to-locale pattern rules and drift on case/trailing slash/order. | High / Medium-High                 | **External fact:** Fundraise Up exposes ordered exact/wildcard URL matching. **Repository fact:** provider cannot own Core identity. | Centralizes integration input.                  | **D15-R2, R10–R11, and R17:** resolve exact locale once; providers receive presentation request only.        |
| Search provider rejects a valid BCP 47 value and developers silently broaden it.                                          | Medium-High / Medium               | **External fact:** Google's supported `hreflang` set is narrower than all BCP 47.                                                    | Separates Site Locale from provider projection. | **D15-R13:** separately validated mapping or omission; never alter route identity.                           |

### 20. Migration, rollout, and upgrade risks

**Material concern exists.**

| What could go wrong and why it matters                                                                                                 | Severity / likelihood | Evidence or reasoning                                                                                                  | Effect on the answer                        | Best permanent fix and exact language                                                                                   |
| -------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| A global redirect inserts the current default into `/about` or `/give`, moving unproved content and donor intent.                      | Critical / High       | **Current behavior:** unprefixed routes exist; **repository fact:** D9–D14 forbid Giving redirects and guessed locale. | Rejects bulk migration.                     | **D15-R19:** source-specific inventory/proof; ordinary Page owner only; Giving never redirects.                         |
| New writers deploy before old static redirects, catch-alls, caches, or older app versions understand `/lang/`, creating split routing. | Critical / High       | **Current behavior:** root `/give` redirect and generic catch-all are live code.                                       | Blocks writer activation, not the decision. | **D15-R19:** registry/reservation/negative reader first, per-Site cohort, mixed-version proof.                          |
| Rolling back code after public activation drops the new route or allocation history.                                                   | Critical / Medium     | **Permanent-link reasoning:** data rollback is unsafe after external sharing.                                          | Requires forward-only data compatibility.   | **D15-R6, R12, and R19:** additive schema, retained allocation, last coherent safe generation or absence, roll forward. |
| Canonicalizer, IANA/Unicode, Payload, Next.js, or CDN upgrade changes parsing or serialization.                                        | High / Medium         | **External/repository fact:** every dependency evolves; paths are permanent.                                           | Adds upgrade proof.                         | **D15-R4, R11, R17, and R20:** pinned versions, dual-version comparison fixtures, no historical rewrite.                |

### 21. Testability, traceability, and proof

**Material concern exists.**

| What could go wrong and why it matters                                                                                                           | Severity / likelihood                  | Evidence or reasoning                                                                                    | Effect on the answer                     | Best permanent fix and exact language                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| “All routes have a locale” passes happy-path snapshots while APIs, root files, Giving safety, RLS, caches, aliases, and migration contradict it. | High / High                            | **Repository fact:** OpenSpec requires observable behavior and negative/authorization/failure scenarios. | Requires precise scope and proof matrix. | **D15-R1–R20 and acceptance criteria below:** every route class and negative invariant is independently falsifiable.      |
| D15 wording diverges across glossary, ADR-0026, Phase 2 fallback, proposed Phase 22/23, PRD, OpenSpec, tickets, and tests.                       | Critical / High without reconciliation | **Repository fact:** proposed PRs remain unmerged and accepted ADR-0026 uses absolute families.          | Makes reconciliation a prerequisite.     | **D15-R20:** explicit supersession/amendment trail and source-status labels before implementation.                        |
| Tests assert string builders instead of user-visible language, exact URLs, privacy-safe failures, and financial non-effects.                     | High / Medium-High                     | **Testing judgment:** implementation-detail tests cannot prove the donor/staff contract.                 | Narrows proof outcomes.                  | Acceptance criteria cover rendered language, route result, staff flow, owner effects, concurrency, and finance negatives. |

### 22. Other development hazards

**Material concern exists.**

| What could go wrong and why it matters                                                                                                   | Severity / likelihood | Evidence or reasoning                                                                                | Effect on the answer                                              | Best permanent fix and exact language                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Examples using `en-US` accidentally establish mixed-case path identity, while routers or search treat `/en-US` and `/en-us` differently. | High / High           | **External fact:** BCP 47 is case-insensitive; URI paths and Google URL handling are case-sensitive. | Corrects URL serialization.                                       | **D15-R4 and R11:** lowercase public segment, canonical display casing separate, equivalent forms reserved. |
| The bare root `/` or `x-default` behavior slips into middleware during implementation without founder review.                            | High / High           | **Repository fact:** proposed Phase 23 explicitly leaves `x-default` to Phase 24.                    | Creates the next dependent decision.                              | **D15-R8 and next question:** root remains neutral/reserved until D16.                                      |
| `/lang/` is chosen but old Page `/lang` or a shared-host Site handle conflicts during migration.                                         | High / Medium         | **Current-behavior reasoning:** root slugs were not globally reserved.                               | Requires evidence-classified namespace cutover.                   | **D15-R3, R11, and R19:** reserve/scan first, source-owner disposition, no silent takeover.                 |
| Staff infer that “French (Canada)” means Canadian currency or legal entity because region is visible.                                    | Critical / Medium     | **Product/repository fact:** locale and finance are independent.                                     | Requires persistent plain-language separation and negative tests. | **D15-R5, R14, and R18:** explain scope, keep finance out of locale setup, re-resolve later.                |

## Required acceptance criteria and proof

These are outcome requirements for the later specification and implementation,
not tests authorized by this grill session.

### Scope, grammar, and locale identity

1. **D15-AC01 — Default is explicit.** The default and only Site Locale on a
   single-locale Site serves its homepage and every favorable locale-bearing
   content route beneath `/lang/{segment}`.
2. **D15-AC02 — Representative exact locales work.** `en`, `en-US`, `fr-CA`,
   `zh-Hans`, `zh-Hant`, `sr-Cyrl`, and the three-letter language `api` produce
   distinct valid lowercase segments without forced region or language collapse.
3. **D15-AC03 — Direct locale routes are not aliases.** New `/en-us/about` and
   `/fr-ca/a-propos` requests do not positively resolve, redirect, or fall back
   to `/lang/...`.
4. **D15-AC04 — Namespace is reserved.** Page, CMS, Navigation, Giving, plugin,
   import, and redirect creation cannot claim `/lang`, `/lang/*`, or a
   router-equivalent representation.
5. **D15-AC05 — Shared-host order is fixed.** A shared-origin request resolves
   trusted Site handle before `/lang/{segment}` and never treats a locale as a
   Site or a Site handle as a locale.
6. **D15-AC06 — Real language/control collisions coexist.** `/lang/api/about`
   serves only eligible Apiaká content while `/api/...` retains its control owner;
   the same proof covers `app`, `dev`, and a future registered collision.
7. **D15-AC07 — Generic language stays generic.** Selecting generic French
   creates `fr`, and Core does not infer `fr-CA` or `fr-FR` from any country,
   domain, address, currency, browser, or provider fact.
8. **D15-AC08 — Canonical aliases do not duplicate identity.** Case-varied and
   standards-proved deprecated/preferred equivalents cannot create a second Site
   Locale, segment, allocation, or public generation.
9. **D15-AC09 — Public case is singular.** Generated URLs use lowercase; mixed-
   case, encoded, trailing-slash, and other canonical equivalents receive the one
   route-owner-approved safe outcome and cannot claim another meaning.
10. **D15-AC10 — Meaningful long tags are bounded honestly.** The admitted
    profile proves its documented length limit, accepts representative script/
    region/variant values within it, and rejects rather than truncates longer
    unsupported values.
11. **D15-AC11 — Private work consumes no route.** Add-language setup, copy,
    import, draft, autosave, preview, availability hint, and translation work do
    not allocate `/lang/{segment}` or expose a favorable public route.
12. **D15-AC12 — First activation is atomic.** One successful command commits
    allocation, stable locale binding, base manifest, serving head, business
    audit, durable receipt, and outbox, or commits none.
13. **D15-AC13 — Default changes alter zero explicit URLs.** Changing the Site
    default produces no delta in Page, Giving, Navigation, canonical, language-
    alternative, sitemap, QR, cache, or historical explicit addresses.
14. **D15-AC14 — Standards updates alter zero issued paths.** Advancing the
    IANA/Unicode profile may change validated metadata only through a compatible
    successor and never rewrites stored public segments or historical meaning.
15. **D15-AC15 — Host moves preserve separation.** A verified host/base
    generation change keeps the stable locale segment, retains old occupancy,
    and routes ordinary Page and Giving continuity only through their owners.

### Route classes, resolution, and public behavior

16. **D15-AC16 — Every human content family consumes the base.** Ordinary
    Pages/Articles, specialized ministry Pages, updates, localized public forms,
    public homepage, and Giving each use the same exact Site Locale Public Base
    and their own typed relative route.
17. **D15-AC17 — Root robots stays root-owned.** `/robots.txt` is served only by
    the exact admitted origin's crawler-guidance owner and is never captured,
    copied, or localized by the content router.
18. **D15-AC18 — Sitemap scope is complete.** Root sitemap/index output lists
    eligible absolute locale URLs across descendants without becoming route or
    locale authority.
19. **D15-AC19 — Well-known and framework paths remain exact.**
    `/.well-known/*`, `/_next/*`, icons, manifests, service workers, and shared
    static resources reach only their registered owners.
20. **D15-AC20 — Control and operation routes remain exact.** APIs, webhooks,
    health, auth callbacks, protected actions, Preview enablement, checkout,
    payment continuation/return, signed results, and authenticated portals are
    not accidentally placed beneath or captured by `/lang/`.
21. **D15-AC21 — Localized documents are classified by meaning.** A translated
    public PDF or comparable human resource receives exact locale identity and
    supported alternate metadata; a locale-neutral binary remains under its
    separate asset owner.
22. **D15-AC22 — Unknown locale fails closed.** Missing, invalid, unsupported,
    disabled, withdrawn, terminal, or unrecognized `/lang/{segment}` never
    renders the default, sibling, homepage, another Site, or another Tenant and
    does not disclose which unfavorable state exists.
23. **D15-AC23 — Hidden signals cannot vary explicit content.** The same
    explicit URL returns the same Site Locale across `Accept-Language`, IP,
    cookie, authenticated profile, referrer, device, query, currency, and
    provider permutations.
24. **D15-AC24 — CMS catch-all cannot bypass ownership.** A CMS row whose slug
    resembles `/lang`, a route family, API, preview, callback, or reserved path
    cannot become a positive public result.
25. **D15-AC25 — Bare root remains undecided.** Until D16 is accepted, `/` does
    not render localized content, negotiate, redirect, carry Giving intent, or
    emit `x-default` through an implementation default.
26. **D15-AC26 — Legacy direct routes are evidence-classified.** Every positive
    unprefixed predecessor has an exact owner, Site, locale proof, and disposition;
    absence of evidence never creates a favorable alias. `/lang`, malformed,
    ambiguous, and nonconforming legacy namespace routes remain reserved/
    privacy-safe absent with no redirect and a reviewed owner-successor URL.
    Only a conforming exact-locale/same-resource ordinary Page may migrate into
    the new authority and continue directly after atomic proof; Giving uses
    D10–D14 only.

### Staff, visitor, and accessibility outcomes

27. **D15-AC27 — Locale selection is human-readable.** Staff can search by
    native and staff-language names; script/region disambiguation is textual and
    no flag is the only identifier.
28. **D15-AC28 — Specificity is progressive.** Region or script appears only
    when useful; help clearly distinguishes generic from region/script-specific
    content without using finance or geography inference.
29. **D15-AC29 — Prefix is generated and locked.** Staff see the complete
    **Website address prefix**, cannot free-type it, and can understand why it
    remains stable without opening technical details.
30. **D15-AC30 — Page editing exposes one meaningful field.** The fixed
    `.../lang/{segment}/` base and one Page-owned editable path are visually and
    programmatically distinct; the complete planned URL remains readable.
31. **D15-AC31 — Giving editing exposes one meaningful field.** The fixed base
    and `/give/` remain read-only while the Giving-owned final slug is the only
    editable route part.
32. **D15-AC32 — Planned and current are not conflated.** Draft, planned,
    current, unavailable, and predecessor addresses have persistent distinct
    labels and actions.
33. **D15-AC33 — First publish explains exact impact.** The review names Site,
    exact language, prefix, affected route count, blockers, continuity, permanent
    consequence, and the financial/default facts that will not change.
34. **D15-AC34 — Conflict recovery preserves work.** Advisory and final
    conflicts retain staff input/focus, never silently suffix or switch locale,
    and provide one source-owned next action.
35. **D15-AC35 — Detail is capability-shaped.** Authorized same-Tenant staff
    may see a safely named conflicting route owner; unauthorized or cross-Tenant
    actors receive the same generic unavailable outcome and timing class.
36. **D15-AC36 — Single-locale UX stays quiet.** A one-locale Site completes
    ordinary Page/Giving work without a matrix, translation score, empty tabs,
    or repeated irreversible warnings.
37. **D15-AC37 — Responsive and assistive use passes.** Add, review, publish,
    conflict, and language-switch flows pass keyboard, screen reader, visible
    focus, touch target, forced-color, reduced-motion, 320-CSS-pixel reflow,
    400% zoom, CJK/RTL/long-label, and mobile tests.
38. **D15-AC38 — Public language is programmatic.** Favorable HTML has the exact
    valid `lang`, correct direction, bidi isolation, and language-of-parts markup
    required for mixed-language names or controls.
39. **D15-AC39 — Switches preserve task.** Every language control is a real link
    to the current corresponding equivalent Page or D14 Giving address; no URL
    guessing, homepage substitution, or hidden task change occurs.
40. **D15-AC40 — Public navigation works without JavaScript.** Exact locale
    Page navigation and language links are server-rendered semantic links; JS
    enhancement is optional and does not change destination.
41. **D15-AC41 — Missing equivalents are honest.** A missing/unreleased target
    is omitted or explicitly unavailable and never served from Payload/default
    fallback.
42. **D15-AC42 — Weak-network and ambiguous saves recover calmly.** Staff input
    persists; unknown activation reads the durable receipt; the same submit
    returns the same public result rather than allocating again.

### Database, authorization, concurrency, cache, and failure proof

43. **D15-AC43 — Structural scope is complete.** Same-scope composite keys bind
    Tenant, environment, Site, stable Site Locale, host/base generation,
    segment/allocation, and current heads; null or cross-scope favorable rows
    cannot exist.
44. **D15-AC44 — Canonical occupancy is globally unique.** The database/route
    authority, not an application precheck, rejects every duplicate canonical
    external origin-plus-normalized-path and router-equivalent claim across all
    Sites, Tenants, environments, host departure/return, route kinds, and
    current/historical states; provenance never partitions uniqueness.
45. **D15-AC45 — Delete cannot release identity.** Locale, Site, host, Page,
    Giving, or CMS deletion cannot cascade away the minimum route allocation,
    occupancy, interpretation, actor, and disposition evidence.
46. **D15-AC46 — RLS proves read and write boundaries.** Grants plus operation-
    specific `USING` and `WITH CHECK` policies deny cross-Tenant/Site/locale
    reads, inserts, updates, deletes, and allowed-row-to-forbidden-scope moves.
47. **D15-AC47 — Privileged paths cannot bypass invariants.** Service-role,
    worker, Payload, import, RPC/function, support, and repair poison tests reject
    foreign/mutable/caller-controlled scope and record current authority.
48. **D15-AC48 — Caller claims have no authority.** Supplying Tenant, Site,
    locale, actor, host, segment, route owner, role, generation, or financial
    identifiers in a request cannot widen or redirect the server-derived effect.
49. **D15-AC49 — Concurrency has one winner.** Concurrent canonical aliases,
    Site locales, Page publishes, Giving claims, host moves, default changes, and
    generation activations either yield one compatible effect or a truthful
    reload; no silent rename or mixed state occurs.
50. **D15-AC50 — Business idempotency survives transport changes.** The same
    durable semantic request across UI, API, job replay, and retry returns one
    receipt; a reused key for different scope or effect conflicts.
51. **D15-AC51 — Unknown outcomes reconcile first.** Lost responses, worker
    crashes, and outbox failure read authoritative receipt/effect state before
    retry, and never infer failure from missing client acknowledgement.
52. **D15-AC52 — Public generation cannot mix.** Old/new Navigation, base,
    Page, Giving, canonical, alternatives, sitemap inputs, shell, and renderer
    cannot appear together after a favorable activation.
53. **D15-AC53 — Cache identity is scope-complete.** Tenant, environment, Site,
    trusted host, stable Site Locale ID, public-base generation, owner/resource,
    audience, public generation, and renderer are passed as cache-key arguments.
54. **D15-AC54 — Tags do not isolate.** Removing/changing a locale invalidation
    tag cannot cause two scope-distinct reads to share a cache entry; tags only
    accelerate invalidation.
55. **D15-AC55 — Cross-Tenant/host cache poisoning fails.** Identical locale and
    Page slugs on two Sites/Tenants, shared-host aliases, host departure/return,
    stale cookies, and forged forwarded hosts never cross response or metadata.
56. **D15-AC56 — Failure stays safe and diagnosable.** Authority outage,
    malformed route, stale proof, failed invalidation, partial projection, and
    incompatible renderer return the exact safe state, retain the prior complete
    favorable generation only while still authorized, and emit scoped repair
    evidence.

### Search, migration, rollout, finance, and traceability proof

57. **D15-AC57 — Canonicals preserve route-owner rules.** Every eligible
    canonical ordinary/specialized locale Page self-canonicalizes to its current
    absolute URL. Each preferred D14 Giving address self-canonicalizes; an
    eligible nonpreferred address may canonicalize only to its same-locale
    preferred address and never redirects. French never canonicalizes to English,
    and request headers never choose canonical host or locale.
58. **D15-AC58 — Alternatives are reciprocal and self-inclusive.** Every
    emitted `hreflang` cluster contains only mutually eligible exact equivalents,
    includes each member itself, and is identical/reciprocal across members.
59. **D15-AC59 — Unsupported search tags are omitted safely.** Valid Site Locale
    routes such as provider-unsupported variants remain valid; search emits only
    a separately validated exact-compatible projection or nothing.
60. **D15-AC60 — Sitemap capacity is bounded.** Projection splits through the
    root index before any file reaches 50,000 URLs or 50MB uncompressed, uses
    source-owned significant `lastmod`, and excludes unavailable/noncanonical
    routes.
61. **D15-AC61 — No premature `x-default`.** No Page, root, Giving address, or
    sitemap emits `x-default` until D16 defines a genuine neutral entry.
62. **D15-AC62 — Crawler artifacts are guidance, not access control.** Robots,
    sitemap, canonical, and no-index behavior cannot make private/Preview content
    public or replace authorization/safety enforcement.
63. **D15-AC63 — Migration inventory closes.** Every current origin, route,
    redirect, CMS result, locale clue, Site, owner, cache, canonical/search
    artifact, placement, and traffic cohort has an evidence classification and
    disposition before activation.
64. **D15-AC64 — Backfill never infers locale.** Current default, English copy,
    path words, country, Tenant address, traffic, currency, provider, or browser
    evidence alone cannot create a Site Locale binding or redirect.
65. **D15-AC65 — Ordinary continuity is Page-owned.** Only an exact same-Page,
    same-Site, same-locale, source-proved predecessor outside the namespace
    receives ordinary Page redirects. A conforming
    `/lang/{exact-locale}/{owner-path}` same-resource predecessor may continue
    only by direct atomic migration into the new authority; broad/default/home/
    similar, malformed, ambiguous, nonconforming, and every legacy `/lang`
    redirect fail.
66. **D15-AC66 — Giving intent never redirects.** Bare, legacy, moved,
    mixed-case, locale-changed, stopped, unavailable, and successor Giving paths
    never redirect, negotiate, fall back, or become another address.
67. **D15-AC67 — Current bypasses are fenced first.** The host-blind `/give` and
    `/donate` redirects, generic CMS catch-all, static canonicals, and null-Site
    path cannot produce a favorable result once the first D15 cohort activates.
68. **D15-AC68 — Mixed versions are compatible.** Old code tolerates additive
    schema without issuing/serving unknown positives; new code fails closed until
    registry/base heads exist; activation is independently reversible only before
    public allocation.
69. **D15-AC69 — Rollback retains public truth.** After first public use, code or
    feature rollback preserves route allocations, stable locale bindings,
    receipts, and minimum history and serves a last coherent authorized
    generation or privacy-safe absence.
70. **D15-AC70 — Locale changes no legal or financial facts.** Across URL selection,
    default change, language switch, Page/Giving publish, checkout admission,
    and provider display, Legal Entity, Tenant Stripe account, Designation,
    currency, settlement, bank, tax/receipt legal facts, and accounting facts
    remain with their independent owners. The exact Site Locale may request
    presentation locale, but checkout/message/receipt owners resolve and record
    the actual rendered locale.
71. **D15-AC71 — Framework/provider adapters conform.** Next.js routing,
    `next-intl` if adopted, Payload, CDN/Vercel, CMS plugins, and Giving providers
    pass route-class, no-fallback, no-hidden-detection, exact-case, and source-
    authority fixtures before activation or upgrade.
72. **D15-AC72 — Repository trace is complete.** The founder answer, glossary,
    D15 evidence, ADR-0026 amendment, Phase 2/5/22/23 reconciliation, Phase 24
    PRD, OpenSpec, design, tasks, GitHub tickets, tests, migration artifacts,
    release evidence, and monitors use the same terms, URL grammar, owners,
    states, numbers, and negative rules.
73. **D15-AC73 — Exact lookup is bounded.** Production-shaped tests prove
    indexed route and stable-locale lookup without Tenant/global scans, bounded
    generation compilation, and no all-locale client payload for an ordinary
    Page request.
74. **D15-AC74 — Monitors are release evidence.** Every zero-tolerance and
    budgeted signal below is wired, scope-redacted, owned, exercised by a
    synthetic or controlled failure, and linked to a tested response runbook.

## Named production monitors

Thresholds below are launch guardrails, not claims that current production
already meets them. Performance and usability budgets require baseline
confirmation during implementation; zero-tolerance safety invariants do not.

| Signal                                                                |                                                                                                  Threshold | Owner                                          | Required response                                                                                                                         |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------: | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `public_locale_wrong_representation_total`                            |                                                                                        Any value above `0` | Public Runtime + Site Locale                   | P0 fence the affected generation, purge scoped caches, preserve evidence, verify every exposed route, and notify Security/Tenant Support. |
| `public_locale_cross_scope_response_total`                            |                                                                                        Any value above `0` | Security + Public Runtime                      | P0 isolation response: disable affected cohort, purge caches, preserve evidence, assess disclosure, and follow incident policy.           |
| `public_locale_fallback_total`                                        |                                                                                        Any value above `0` | Site Locale + Public Runtime                   | Disable the offending adapter/route, restore exact or absent behavior, and run full sibling-locale verification.                          |
| `public_locale_unprefixed_favorable_total`                            |                           Any value above `0` after cohort activation, excluding D16 root/control manifest | Public Route Platform                          | Block/fence rollout, identify the unclassified owner, and remove the positive path without bulk Giving redirect.                          |
| `public_locale_direct_tag_alias_total`                                |                                                                                        Any value above `0` | Public Route Platform                          | Remove direct `/{locale}` aliasing, reserve discovered forms, purge canonical/search/cache projections, and reverify.                     |
| `public_locale_namespace_control_capture_total`                       |                                                                                        Any value above `0` | Public Route Platform + affected control owner | P0 disable locale matcher for the route class, verify callbacks/operations, and restore exact owner routing.                              |
| `public_route_class_unowned_total`                                    |                                                Any value above `0` in build, release, or runtime inventory | Architecture + owning team                     | Block release; assign one source owner and registry kind before any positive response.                                                    |
| `public_locale_segment_mutation_total`                                |                                                                 Any value above `0` after first activation | Site Locale + Public Route Platform            | Halt writer, restore immutable allocation, compare affected managed/literal links, and require successor workflow.                        |
| `public_locale_default_change_url_delta_total`                        |                                                                                        Any value above `0` | Site Product + Public Route Platform           | Reject default change or successor generation; retain prior head and correct derivation.                                                  |
| `public_locale_generation_mismatch_total`                             |                                                                                        Any value above `0` | Public Generation owner                        | Reject/fence mixed activation, retain prior complete favorable head, and reconcile the exact stale dependency.                            |
| `public_cache_scope_mismatch_total`                                   |                                                                                        Any value above `0` | Platform Runtime + Security                    | P0 purge affected entries, disable cache cohort, inspect key construction, and run cross-Tenant proof.                                    |
| `giving_locale_redirect_total`                                        |                                                                                        Any value above `0` | Giving Runtime                                 | Disable affected route cohort, restore direct same-meaning or privacy-safe absence, inspect donor effects, and reverify D9–D14.           |
| `locale_profile_collision_or_ambiguity_total`                         |                                                                   Any value above `0` on a profile upgrade | Site Locale owner                              | Quarantine the upgrade, keep prior profile/path interpretation current, and require explicit compatibility proof.                         |
| `hreflang_reciprocity_or_value_error_total`                           |                                                                   Any value above `0` in an active cluster | Search/Sharing owner                           | Remove the invalid cluster until regenerated from the exact equivalence manifest; do not alter the locale route.                          |
| `public_sitemap_file_url_count` / `public_sitemap_uncompressed_bytes` |                                                                       At or above `50,000` URLs or `50 MB` | Search/Sharing owner                           | Split through the root sitemap index before publication and revalidate all descendants/alternatives.                                      |
| `public_locale_projection_lag_seconds`                                |                                                           Above `300` seconds for any favorable activation | Public Generation + Search/Cache owners        | Reconcile durable outbox, surface scoped **Needs attention**, retain release truth, and avoid duplicate activation.                       |
| `public_locale_unknown_outcome_age_seconds`                           |                                                                                        Above `300` seconds | Owning command service                         | Read authoritative receipt/effect, reconcile outbox, page the owner if unresolved, and never retry as a new effect.                       |
| `public_locale_resolution_error_rate`                                 |                                          Above `1%` for `15` minutes with at least `100` eligible requests | Public Runtime on-call                         | Inspect resolver/authority/cache dependency; fail exact/no-store, fence only the affected cohort, and restore from proved heads.          |
| `public_locale_resolution_p95_ms`                                     |                                      Above `300 ms` for `15` minutes with at least `100` eligible requests | Public Route Platform                          | Inspect index, cache-key, and host/locale lookup regression; do not introduce hidden fallback or an alternate authority.                  |
| `public_locale_404_rate`                                              | More than `3×` the trailing 28-day same-route-class baseline for `30` minutes with at least `100` requests | Site Operations + Public Runtime               | Identify release/migration/placement cause, show owner-routed repair, and never bulk redirect Giving.                                     |
| `site_locale_setup_abandonment_rate`                                  |                                     Above `20%` within 24 hours, at least `25` started setups over 30 days | Site Product/UX                                | Run moderated follow-up with affected staff, improve labels/progressive disclosure, and do not unlock free-form prefixes without proof.   |
| `site_locale_prefix_edit_request_rate`                                |                                      Above `5%` of completed setup users over 30 days, at least `50` users | Site Product/UX                                | Research the underlying job and collision context; consider a separately governed successor workflow only if evidence supports it.        |
| `site_locale_support_cases`                                           |                                                  More than `5` route/locale-understanding cases in 30 days | Site Product + Tenant Support                  | Review exact confusion, improve in-product explanation and support evidence, and provide no database override.                            |

## Ruthless synthesis — strongest path forward

### Required before D15 is recorded

Completed by this evidence package:

1. replace **every language** with **every exact Site Locale**;
2. replace **all public routes** with **all locale-bearing human public content
   routes** plus a finite owner-defined exception registry;
3. reject direct `/{locale}` because valid `api`/`app`/`dev` languages collide
   with control namespaces;
4. select one fixed `/lang/{lowercase-exact-locale}` namespace;
5. make the segment generated, exact, immutable after first public use, and
   subordinate to the stable Site Locale ID;
6. preserve D9–D14 Giving no-redirect and financial separation; and
7. reserve bare `/` and `x-default` for D16 rather than letting middleware
   decide them.

### Required in the later PRD/design

1. define the Site Locale profile, supported tag envelope, immutable public-
   segment allocation, and source-owned successor lifecycle;
2. define one complete typed route-class registry and precedence model;
3. reconcile accepted ADR-0026's absolute route reservations into locale-base-
   relative content families while preserving root control/legacy reservations;
4. reconcile Phase 2 fallback/array language with D14/D15 stable exact Site
   Locale identity and fallback-free public reads;
5. reconcile open Phase 22/23 route, release, Page-continuity, localization,
   search, and cache proposals as proposed—not accepted—authority;
6. specify composite database constraints, grants/RLS, service-path validation,
   lock order, idempotency, receipt, outbox, cache-key, and retention behavior;
7. define the exact single-locale and multi-locale Maia/Base UI journeys,
   accessibility states, copy, low-bandwidth recovery, and staff capability
   routing;
8. define root/protocol artifacts, localized document handling, exact
   canonical/alternative/search projections, and provider-supported omissions;
9. write the evidence-classified migration, per-Site cohort activation,
   mixed-version compatibility, forward recovery, and post-publication rollback
   limits; and
10. connect all 74 acceptance criteria and named monitors to release evidence.

### Required implementation order

1. inventory current production-shaped origins, root namespaces, `/lang`
   conflicts, unprefixed routes, locale evidence, owners, redirects, placements,
   search artifacts, and caches;
2. land additive stable Site Locale and public-base allocation schema with
   constraints, grants/RLS, and retained-history semantics;
3. land the code-owned route-class registry, fixed `/lang/` reservation,
   canonicalizer/profile pins, and negative reader before positive writers;
4. complete trusted host→Site→stable Site Locale public request resolution;
5. extend reference-not-copy public builders and cache keys across Page,
   Navigation, Giving, search, QR/share, and support consumers;
6. add sparse exact-locale authoring/preview and the quiet staff setup journey;
7. shadow-compile and compare complete Site-locale public generations without
   changing live routes;
8. remove or fence host-blind redirects, unprefixed catch-all bypasses, static
   canonical/default-locale assumptions, and provider fallback;
9. activate one explicit Site-locale cohort atomically after production-shaped
   positive, negative, authorization, accessibility, load, and failure proof;
10. converge cache/search/sitemap from the durable outbox, verify public HTML,
    and keep external observations distinct from release truth;
11. expand by cohort only while zero-tolerance monitors remain clean; and
12. recover through forward successors; never delete allocations or bulk
    redirect Giving.

### Explicit non-goals — reopen only with evidence

- custom locale prefixes or per-locale domains;
- automatic translation or translation-memory operations;
- a broad locale negotiation/cookie/IP product;
- external search submission/control planes;
- a second route or cache authority;
- generic redirect DSLs; and
- speculative sharding or global route services.

Any excluded product need must first present representative staff/visitor
evidence and a source-owner-safe contract. Monitoring never replaces a database
constraint, route class, authorization boundary, or donor-safety invariant.

## Repository and external research synthesis

### Repository facts verified on 2026-08-27

- At evidence capture, dependency PRs #1323 and #1340 remained open, so their
  Phase 22/23 planning material was treated as proposed evidence, not merged
  authority. Existing D7–D14 evidence remained preserved.
- [ADR-0026](../../adr/0026-public-website-surface-in-donor-app.md) keeps the
  public website in `apps/donor`, reserves absolute future route families
  including `/give`, `/sitemap.xml`, `/robots.txt`, and `/preview`, and
  separately keeps checkout public at root `/checkout`. D15 therefore needs an
  explicit later amendment, not a silent override.
- [ADR-0027](../../adr/0027-transport-agnostic-public-content-reader.md) and
  [ADR-0028](../../adr/0028-defense-in-depth-public-isolation.md) require one
  server-owned public reader, trusted typed scope, published-only access, and
  fail-closed unresolved requests.
- [ADR-0029](../../adr/0029-reference-not-copy-cms-operational.md) rejects copied
  operational truth; D15 extends that discipline to managed locale bases and
  links.
- [ADR-0030](../../adr/0030-function-level-tagged-caching-publish-signal.md)
  states that function arguments isolate cached reads and cache tags only
  invalidate. D15 must add Site/locale/base/generation arguments rather than
  treating a locale tag as security.
- Current `apps/donor/next.config.ts` redirects `/give` and `/donate` to
  `/workers`; `apps/donor/proxy.ts` names unprefixed root routes;
  `apps/donor/app/(public)/(solid)/[...cmsSlug]/page.tsx` is a generic
  unprefixed catch-all; `apps/admin/src/cms/public/resolve-tenant.ts` still
  returns `siteId: null`; and `packages/config/site-shared.ts` is English-
  oriented. These are current migration facts, not permanent authority.
- The proposed Phase 22 ADR-0144 uses sparse exact-locale releases without
  fallback. Proposed Phase 23 ADR-0146, ADR-0147, ADR-0166, and ADR-0172 give
  ordinary Pages source-owned locale paths, exact Page continuity, exact locale
  editorial lineages, and generation-bound search/cache projections. They must
  be merged or explicitly superseded before implementation-ready status.

### Current primary and comparable evidence

- [Google multilingual-site guidance](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)
  recommends distinct URLs for language versions, explicit alternate links,
  and avoiding automatic redirects between explicit versions. It accepts
  subdirectories as a lower-maintenance choice and does not prescribe whether
  the default must be prefixed.
- [Google localized-version guidance](https://developers.google.com/search/docs/specialty/international/localized-versions)
  requires reciprocal self-inclusive alternatives, supports language/region/
  script forms, treats `x-default` as especially suitable for selector/fallback
  entry pages, and has a narrower supported value set than all BCP 47.
- [Google URL guidance](https://developers.google.com/search/docs/crawling-indexing/url-structure)
  favors simple logical readable paths and consistent case; it treats distinct
  URL case as distinct resources.
- [RFC 5646](https://www.rfc-editor.org/rfc/rfc5646.html) makes language-tag
  comparison case-insensitive, recommends canonical creation, discourages
  unnecessary subtags, and warns that truncation changes meaning.
- [RFC 3986](https://www.rfc-editor.org/rfc/rfc3986.html) makes the path part of
  resource identity and generally case-sensitive. This justifies separate
  canonical BCP 47 display casing and lowercase public URL serialization.
- The [IANA Language Subtag Registry](https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry),
  file date 2026-08-08, proves that `api`, `app`, and `dev` are real language
  subtags. This is the decisive evidence for `/lang/{segment}` rather than
  direct `/{segment}` in Core's shared app architecture.
- [Next.js App Router internationalization guidance](https://nextjs.org/docs/app/guides/internationalization)
  supports a dynamic exact locale path. [next-intl routing](https://next-intl.dev/docs/routing/configuration)
  uses always-prefixed routing by default and documents the extra cookie/
  detection/redirect behavior of an unprefixed default. Framework behavior is
  capability evidence, not Core policy.
- [Webflow locale management](https://help.webflow.com/hc/en-us/articles/53682971927571-Manage-your-site-s-locales)
  generates language/locale subdirectories and warns that a conflicting CMS
  Page/folder becomes unavailable. That validates the staff preview pattern and
  the need for structural collision prevention, not a warning-only approach.
- [Shopify domain and language guidance](https://help.shopify.com/en/manual/markets/customizations/domains-and-languages)
  identifies subfolders as a simple fit for most stores. Its separate
  [international SEO guidance](https://help.shopify.com/en/manual/markets/seo)
  documents compiled canonical, alternate, and sitemap behavior. Shopify's
  unprefixed primary is a strong alternative, not a reason to import its
  market/currency coupling into Core.
- [Contentful experience links](https://www.contentful.com/developers/docs/experiences/experience-hyperlinks/)
  use `/{locale}/{slug}` by default; separate
  [Contentful locale-based publishing](https://www.contentful.com/help/localization/locale-based-publishing/)
  supports independent locale releases. [Payload localization](https://payloadcms.com/docs/configuration/localization)
  supports human labels and exact locale selection but enables field fallback
  by default. Core may reuse UI capabilities only with fallback disabled and
  its own release authority.
- [Fundraise Up localization](https://fundraiseup.com/docs/localization-settings/)
  shows how duplicating ordered/case-sensitive URL matching at a giving provider
  can drift. Core should pass a resolved presentation request to providers,
  never let them own public locale identity. [Raisely languages](https://support.raisely.com/hc/en-us/articles/45345797748109-Managing-Languages)
  demonstrates donor-facing suffixes and a visible language selector, while
  its browser detection and LTR-only limitation are not Core defaults.
- [WCAG 2.2 language-of-page guidance](https://www.w3.org/WAI/WCAG22/Understanding/language-of-page)
  requires programmatic predominant language. [W3C translated-page guidance](https://www.w3.org/International/questions/qa-site-conneg.en.html)
  requires an understandable manual override, and its examples use native
  language names with language markup. [Canada's language toggle](https://design.canada.ca/common-design-patterns/language-toggle.html)
  reinforces linking to the corresponding equivalent Page.
- [RFC 8615](https://www.rfc-editor.org/rfc/rfc8615.html) fixes
  `/.well-known/` at the origin root. [RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.html)
  governs root robots behavior. The [Sitemaps protocol](https://www.sitemaps.org/protocol.html)
  and Google guidance make root sitemap/index scope appropriate for locale
  descendants and define the 50,000-URL/50MB file limits.

### Evidence limits and unresolved empirical unknowns

- No primary source proves that prefixing a default locale improves search
  rank, donation conversion, or staff satisfaction. D15 is a stability and
  safety choice.
- No representative Core ministry-staff usability study yet proves that
  **Website address prefix** plus `/lang/fr-ca` is immediately understood or
  that no custom prefix job exists. The launch design requires moderated tests;
  it does not pre-authorize customization.
- The current production traffic, bookmarks, printed links, QR codes, external
  campaigns, and source-owned locale evidence for unprefixed routes require an
  authenticated analytics/operations inventory during the later migration.
- D14 establishes a versioned exact Site Locale profile, but the final supported
  variant/extension/private-use envelope and public-segment length budget need
  implementation-shaped standards and infrastructure proof.
- The 300ms resolution and five-minute convergence/unknown-outcome thresholds
  above are launch budgets to validate against production-shaped baselines, not
  measured current facts.
- The locale-neutral root behavior remains a real product decision, not a
  technical unknown. It is asked next as D16.

## Documentation and ADR status

- Root `CONTEXT.md` now defines **Site Locale Public Base** without turning the
  glossary into a route specification.
- This D15 evidence records the fixed `/lang/{lowercase-exact-locale}` grammar,
  source boundaries, staff/visitor journeys, 22-category review, 74 acceptance
  criteria, and named monitors.
- The Phase 24 decision log must record the corrected founder answer and point
  to this complete review.
- D15 qualifies as an ADR candidate: the namespace/default-prefix choice is
  hard to reverse after links are public, surprising without collision/default
  context, and the result of a real URL-length versus permanence/equity trade-off.
- No ADR, PRD, OpenSpec change, design, ticket, schema, migration, runtime code,
  commit, stage, or PR is authorized by this Grill-with-Docs answer. Those
  artifacts require the separately invoked specification workflow and accepted
  source reconciliation.

## Next dependent decision — D16

### Plain-language context and impact

D15 makes every real language homepage explicit, for example:

```text
hope.org/lang/en-us
hope.org/lang/fr-ca
```

That means bare `hope.org/` is no longer an English or default-language Page.
It is a neutral entry with no Giving intent. We now need one predictable rule
for visitors who type or tap only the domain.

This decision changes only the neutral root. It can never rewrite an explicit
Page or Giving link. For example, changing the default from English to French
must leave both `hope.org/lang/en-us/about` and
`hope.org/lang/en-us/give/clean-water` unchanged.

### Options

1. **Temporarily redirect the neutral root to the current default Site Locale —
   recommended.** `hope.org/` sends a deterministic temporary response to
   `hope.org/lang/en-us`; browser language, IP, and cookies are ignored. The
   visitor reaches a real homepage in one step and can use the visible language
   control. Changing the default changes only this neutral entry destination.
2. **Temporarily redirect a single-locale neutral root to its sole explicit
   locale URL; show a neutral chooser only on multi-locale Sites.** Localized
   content always remains at `/lang/{locale}`, never directly at `/`.
   Multi-locale visitors see a fast, branded list of native language names and
   explicitly choose. This is the strongest neutral `x-default` experience and
   adds no choice to a single-locale Site, but adds a click for new multi-locale
   root visits from people who expect a homepage.
3. **Redirect using browser or remembered language, with the Site default as
   fallback.** This often lands visitors in a preferred language immediately,
   but is harder to cache, test, explain, and support; shared devices and stale
   browser settings can surprise people.

### Recommendation

Choose Option 1. It gives the lowest-friction, deterministic visitor journey
without letting hidden signals change any explicit URL. A visible language
control still gives the visitor final control. Root uses a temporary response
because the current Site default may legitimately change; it never carries or
redirects Giving intent.

### Concrete staff and visitor example

Hope Missions marks French (Canada) as its new default. Staff see:

> The domain-only website address will open French (Canada). Existing English
> and French Page and Giving addresses will not change.

After publication, `hope.org/` temporarily opens `hope.org/lang/fr-ca`.
`hope.org/lang/en-us/about` still opens English, and
`hope.org/lang/en-us/give/clean-water` still opens the exact English Giving
page. A donor is never moved between Giving addresses.

### Exact question

When a visitor opens only the Site domain, should the locale-neutral root
temporarily route to the current default Site Locale, show a neutral language
chooser, or use browser/remembered language detection?

## D76 reconciliation (2026-08-30)

ADR-0197 requires complete source-replacement and destination public-base
successors under D15 before authority changes. Canonical, `hreflang`, sitemap,
Navigation, feeds, sharing and cache origins derive from each Site's own exact
public generation; URL strings are not copied. During the Moving barrier no Site
base is favorable, and after target admission only the target generation may
emit absolute Site URLs.

## D77 reconciliation (2026-08-31)

ADR-0198 uses D15's exact versioned canonicalizer and current locale/public-base
heads as hard comparison inputs. Locale roots, explicit locale bases, sitemap,
robots, canonical/`hreflang`, and Giving locale routes remain registered owners,
not ordinary Page rows. A source-only locale-bearing ordinary path receives a
durable owner-declared not-found effect; a target-only path may serve; an exact
collision or incompatible canonicalizer/locale-base generation blocks. D77
creates no language fallback, path pattern, prefix rewrite, query carry, or
runtime locale resolver.

## D78 reconciliation (2026-08-31)

ADR-0199 permits one different General Page successor only when source and
target use the identical normalized BCP-47 locale and compatible D15
canonicalizer/public-base generations. A language-family match, fallback chain,
translated-looking body, same slug, or locale suggestion never proves
succession. Site/locale roots remain excluded. The exact canonical source
address and stable target Page/route generation enter the immutable owner
qualification; D78 creates no alternate locale URL, query rule, or runtime
fallback.
