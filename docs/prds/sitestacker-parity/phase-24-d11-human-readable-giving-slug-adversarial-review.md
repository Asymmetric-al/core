# Phase 24 D11 — Human-Readable Giving Slug Adversarial Review

> **Status:** Completed `/grill-with-docs` decision evidence for D11. This is
> not a Phase 24 PRD, OpenSpec change, implementation plan, migration
> authorization, or ticket specification.
>
> **Founder choice:** Option 3 by default: a human-readable Giving slug staff
> can choose, with excellent guidance and without controlling or difficult
> collision handling.
>
> **Review date:** 2026-08-26
>
> **Later D12 resolution:** Eligible nonpreferred addresses continue opening
> their exact same-meaning pages directly by default. Preferred remains sharing
> guidance, never routing authority. **Stop this address** is a separate,
> capability-gated terminal action; it never redirects or reassigns the route.
>
> **Later D14 resolution:** Every newly issued address is bound to one exact
> stable Site Locale. A separately localized slug is a separately reviewed and
> issued address; one literal address never negotiates or falls back.
>
> **Later D15 resolution:** Every Site Locale, including the default, uses the
> fixed collision-proof
> `{verified-site-public-base}/lang/{lowercase-exact-locale}` base for
> locale-bearing public content. Giving then appends D11's unchanged
> `/give/{slug}`.

## Final disposition

**Accept with required amendments.**

The founder's UX judgment is sound. A short, meaningful address such as
`https://give.hope.org/give/water-project` is easier for ministry staff to
recognize, discuss, print, and support than a mandatory generated suffix or an
opaque token. Current Google, Payload, Sanity, Contentful, WordPress,
Givebutter, and Blackbaud guidance supports readable, source-suggested,
staff-editable URL words. The evidence does **not** prove that a pure readable
slug by itself increases completed donations, so Core will not make that
conversion claim.

The phrase “fully staff-chosen URL” is unsafe if interpreted literally. Staff
should control the meaningful final words, not the domain, locale router,
system namespace, canonicalization, route owner, or financial meaning. Core
must therefore fix the route shape and make collision recovery helpful without
silently changing what staff chose.

The corrected default is:

```text
{verified-site-public-base}/give/{staff-chosen-slug}
```

The public base contains the source-owned verified Site origin and any stable
shared-host Site or later-ratified locale prefix. D11 fixes `/give/{slug}`
relative to that base; it does not choose locale-prefix placement. The
Domain/Site/locale owners govern the base facts, Core verifies their current
heads, and Giving owns the base-relative `/give/` family. Staff accepts or edits
the final readable segment while the address is private. Core proposes a useful
value from approved public copy, but never silently adds `-2`, a year, an
acronym, an internal ID, a random token, a translation, or a transliteration. A
collision preserves the exact entry and offers selectable, available
alternatives. Only the final reviewed public publish atomically issues the
complete address. After issuance, the slug is read-only and remains governed
by D9/D10.

This is not a new identity system. The route maps to an opaque
`giving_entry_id`. The slug cannot select a Site, Designation, Legal Entity,
Stripe account, settlement account, bank account, currency, amount, cadence,
Source Code, or accounting owner.

## Evidence labels

- **Repository fact** — accepted ADR, OpenSpec requirement, PRD, glossary, or
  founder-ratified Phase 24 decision.
- **Current behavior** — code or schema on `develop`; migration evidence, not
  permanent product authority.
- **Proposed evidence** — open and unmerged Phase 22/23 work; informative, not
  governing.
- **External fact** — current primary standard, vendor documentation, or
  accessibility/security guidance.
- **Product judgment** — a deliberate Core choice inferred from evidence.
- **Assumption** — a claim requiring direct staff or production proof.

## Corrected D11 decision — normative language

These clauses replace the draft D11 recommendation and MUST flow into the
Phase 24 PRD, reconciled ADRs, OpenSpec requirements, design, tickets, tests,
and release evidence before implementation may be called complete.

### D11-R1 — Readable staff choice is the default

For every new Giving entry address, Core MUST propose a human-readable,
public-safe final segment from owner-approved public wording and MUST show the
complete prospective URL. Authorized staff MAY accept or edit that segment
before issuance. A readable segment without a mandatory generated suffix is
the ordinary default.

Core MUST NOT silently append a counter, date, acronym, Tenant code, Site code,
database ID, UUID fragment, random token, or other suffix. It MUST NOT silently
translate, transliterate, truncate, or replace meaningful approved text. A
generated or staff-entered short ending MAY be offered as an explicit,
selectable last-resort suggestion; it is never automatically applied.

### D11-R2 — Core owns the route; staff own only the meaningful segment

The standard new-address shape is
`{verified-site-public-base}/give/{slug}`. The source-owned public base contains
the current verified Site origin plus any stable shared-host Site namespace or
later-ratified locale prefix. Domain/Site/locale source owners govern the base
facts; Core verifies their current heads, and Giving owns the fixed
base-relative `/give/` prefix, canonicalization, route-kind classification,
and issuance. Staff controls only one final path segment and cannot edit the
base here.

For example, a dedicated Site origin may use
`https://give.hope.org/give/water-project`. A shared platform origin must use a
D8-governed, public-safe, permanently non-reused **Core public handle**, for
example `https://core.org/hope-missions/give/water-project`. A truly flat shared
origin is prohibited. Raw Tenant/Site UUIDs, database keys, mutable tenant
slugs, provider deployment names, and financial identifiers MUST NOT appear in
the public base.

`/give` relative to each verified Site public base is a Giving-owned
route-family root and MUST NOT be allocated to one specific gift. Ordinary CMS
Pages, redirects, plugins, catch-all routes, Site configuration, and
tenant-authored navigation MUST NOT claim or reinterpret that `/give/` family.
One issued child such as `/give/water` consumes only its exact canonical
address; it does not consume every `/give/*` child. Public administration,
preview, callback, and API endpoints MUST use separate namespaces so a growing
reserved-word list is not required inside the donor route family.

Two genuinely different admitted origins may each use `/give/water-project`,
subject to D10's exact-origin rules.

### D11-R3 — A slug is presentation, never identity or authority

The Giving owner retains an opaque immutable `giving_entry_id`; the complete
issued route maps to that identifier. Titles and slugs MUST NOT be primary
keys, foreign keys, Designation identifiers, or financial selectors. A title,
Site name, Page route, locale, or slug change MUST NOT mutate the Giving entry
or any historical gift.

Site remains presentation and attribution context. The slug MUST NOT own,
select, infer, or override Tenant, Site authority, Designation, Legal Entity,
Stripe account, Settlement Account Binding, bank, currency, amount, cadence,
Source Code, settlement, receipt issuer, or accounting identity. Every source
owner revalidates and freezes its own facts at the relevant business boundary.

### D11-R4 — Suggestions preserve staff agency

The initial suggestion follows the approved public Giving title only while the
field remains untouched. After staff edits the field, later title changes MUST
NOT overwrite it. The UI provides an explicit **Use title** action to replace
the candidate deliberately.

Normalization is visible in the field or preview before submission. Spaces
may visibly become hyphens and case may visibly follow the canonical address
profile. Core MUST NOT wait until submission to reveal a different value or
silently remove meaningful non-Latin text. The complete origin and path remain
visible throughout review.

### D11-R5 — One versioned public-route canonicalizer decides equality

Giving MUST use the same versioned canonicalizer as D10's trusted public route
authority. The browser may mirror it for preview, but only the server result is
authoritative. Comparison covers origin, IDNA host handling, effective port,
locale route, Unicode normalization, case policy, percent encoding, decoded
delimiters, dot segments, slash policy, and trailing-slash policy. Query
strings and fragments never create another address.

Locale controls suggested words, display language, and any separately
ratified explicit locale path segment. Locale never changes the canonicalization
algorithm. Any ratified locale path segment is literal canonical-path identity
and is compared by one deterministic, locale-independent, versioned
normalization and case policy. Browser, device, or user locale never silently
changes the address. D11 does not decide where a locale prefix belongs or
whether a default language uses one.

Automatic/default-locale route forms explicitly admitted by the locale owner
are router-equivalent aliases claimed atomically in the same D10 manifest. A
deliberately different localized slug or path is instead a separately reviewed
private candidate and, if published, a separately issued permanent address
bound to the same underlying Giving entry, Designation, and donor task but its
own immutable locale route and address allocation. Core never silently
translates, materializes, or reserves that distinct address. The locale owner
must classify each form before issuance. D14 resolved addresses as independently
issued and exact-locale; D15 later fixed every default-inclusive locale base
under `/lang/{lowercase-exact-locale}`.

The final slug profile MUST be internationalization-aware,
native-script-capable, deterministic, use the locale-independent
canonicalization algorithm for equality, documented, versioned, and tested
before implementation. It MUST reject empty values, path/query/fragment
delimiters, dot segments, backslashes, controls, bidirectional overrides,
default-ignorable/invisible identifier characters, malformed encoding, and
high-confidence spoofing hazards. Unicode confusable analysis is a safety
signal, not a second identity or silent rewrite.
Native-script support MUST not be replaced by the current ASCII-only deletion
behavior. Exact length and byte limits MUST be justified by database indexes,
browser/CDN/router behavior, QR output, accessibility, and production-shaped
capacity tests; D11 does not bless the current arbitrary 80-character
truncation.

### D11-R6 — Drafts are editable and non-exclusive

Typing, autosaving, duplicating, importing into a private draft, previewing,
generating suggestions, or receiving an advisory availability result MUST NOT
allocate or reserve an address. A private draft MAY retain an invalid,
unavailable, or temporarily uncheckable candidate so content work can continue;
publication and public sharing remain blocked until it is valid and atomically
claimed.

Private preview uses a separate, expiring, signed preview address. The real
candidate does not resolve publicly before issuance. Copy, QR, export, email
insertion, or other public-material actions remain unavailable until issuance.

### D11-R7 — The complete canonical address is the collision scope

Uniqueness and permanent occupancy apply to the complete D10 canonical external
origin and normalized path, not to the bare slug and not merely within one
Tenant. The same slug on distinct admitted origins MAY succeed. The same
canonical origin and path MUST fail across Sites, Tenants, environments, host
departure/return, aliases, route kinds, and all current, unavailable, terminal,
or historically issued states.

A host generation must be currently proved before positive issuance. Every
admitted host alias and locale-route equivalent is declared in one bounded
manifest and checked before exposure. Query strings and fragments do not evade
occupancy. A current application-reserved route blocks issuance even if no
historic Giving allocation exists.

### D11-R8 — Collision recovery is useful and non-enumerating

An unavailable result MUST preserve the exact staff entry, identify the field
and problem in text, and provide one next action. If the exact address already
belongs to the same immutable public-entry meaning and remains eligible, Core
shows **Use existing Giving link** instead of minting a duplicate. That match
includes Tenant, originating environment, Site attribution context, locale
route, Giving entry, Designation/donor task, route kind, and original D10
allocation scope; financial configuration remains independently resolved.

Authorized same-Tenant staff MAY see source-owned, public-safe ownership detail
when their role permits it, for example:

> **This web address is already used**
>
> It belongs to “Water Project 2024” and cannot represent another gift. You
> can open that Giving page or choose another address.

If detail is unauthorized, cross-Tenant, redacted, or sensitive, Core shows
only:

> **This web address isn't available**
>
> Choose another address.

Reserved application routes use **This address is reserved for Core. Choose
another.** Unauthorized outcomes use the same status, response schema, copy,
cache policy, and bounded latency class. Release evidence defines and
statistically verifies the permitted timing envelope across available,
occupied, terminal, and foreign-owner cases. No response, cache content, log,
suggestion, or support tool reveals another Tenant, Site, ministry, missionary,
Designation, title, history, state, date, or actor.

### D11-R9 — Suggestions are optional, meaningful, and public-safe

On conflict, Core SHOULD offer two or three currently available alternatives
derived only from the staff-entered words, an owner-approved public title, or
an explicit public distinguishing word. Staff may select, edit, or ignore
them. No suggestion is preselected or auto-published.

Examples include `clean-water`, `water-project-support`, or
`water-project-kenya` only when “Kenya” is already approved public information
and materially identifies the public effort. A year is suggested only when it
is genuinely part of the public program identity. **Add a short unique ending**
is an explicit fallback. Suggestions MUST NOT draw from private CRM fields,
member-care notes, legal names, exact locations, financial records, internal
IDs, provider data, or another Tenant's occupancy.

An advisory check runs after a pause, on blur, or through **Check
availability**—not on every keystroke. It never displays **Available** from a
failed, stale, or unknown response, and it never replaces the final atomic
claim.

### D11-R10 — Issuance is deliberate, atomic, and permanent

The complete address is issued only when authorized staff successfully perform
the reviewed public-publish command. Ordinary autosave, preview, draft
creation, scheduling, or background activation never issues or reserves an
address. Phase 24 launch does not support scheduling the first public
activation of an unissued Giving address. Scheduling later content changes on
an already issued/current address cannot allocate or change an address.
Generating a public link or QR before public activation would require a new
founder-ratified lifecycle and UX decision; D11 does not create an
advance-reservation state.

Immediately before issuance, Core shows the exact full URL, Site, locale,
owner-approved Giving purpose, and donor preview with this equivalent copy:

> **Make this Giving page public?**
>
> This web address becomes permanent when you publish. You can rename the page
> later, but this address will not change. If you need another address, Core
> will create a new one and keep this address protected.

The final server command revalidates current actor authority, assignment,
Tenant, originating environment, Site, verified host generation, locale,
Giving-entry identity/presentation eligibility, route head, publication-safety
result, and canonical occupancy inside one short transaction. D7, Designation,
and financial admission do not participate in or stale address issuance; they
independently control new-gift CTA/checkout state. No network call occurs while
locks are held.

### D11-R11 — Issued addresses are read-only; replacement is a new claim

After issuance, the address is read-only and carries **Public · cannot be
assigned to another Core Giving page** or equivalent plain-language status.
Renaming the public title MUST NOT change the route. **Create a new web
address** starts a separate private candidate; there is no **Edit address**
action for the issued value.

At most one issued/current address is marked **Preferred for sharing** for the
exact Tenant/environment/Site/locale/Giving-entry scope, so staff know which
link to use without erasing history. First issuance or a successful replacement
atomically makes the new address preferred; a failed command leaves the prior
preference unchanged. An unavailable or terminal address cannot remain
preferred; its owner command clears the head atomically and never silently
chooses a fallback. The old address remains permanently reserved under D10.
As later resolved by D12, an eligible nonpreferred address continues opening
the same immutable public-entry meaning directly by default. Preference never
participates in routing, and a separately authorized terminal action is
required to stop that exact address. No redirect, reassignment, or new meaning
is authorized.

### D11-R12 — Source ownership remains singular

The shared typed public-route authority owns canonical allocation, immutable
history, current occupancy, and route head. Giving owns the public-entry
identity, Designation binding, admission, and address manifest. Domain owns the
current verified-host generation. Site owns presentation/attribution context.
CMS owns approved public copy and may hold a stable reference to the Giving
entry/address; it does not allocate, reconstruct, release, or redirect a Giving
address.

Payload, Next.js, Vercel/CDN, DNS, Stripe, QR generation, analytics, search,
browser state, and UI availability are execution or evidence only. They are
not write authorities. An ordinary Page route and a Giving route may share an
accessible editing component but have distinct owners and lifecycle promises.

### D11-R13 — Database and authorization make a silent rename impossible

The permanent design MUST extend D10's shared route authority rather than add
a CMS slug table or Giving-only registry. It MUST provide:

- an immutable opaque Giving-entry reference and immutable original Tenant,
  environment, Site, locale, and route scope;
- one globally unique canonical external-origin-and-path collision identity;
- append-only allocation/version facts and one compare-and-set current head;
- same-scope composite foreign keys for Tenant, environment, Site, host
  generation, locale, Giving entry, route, command, receipt, audit, and outbox;
- `ON DELETE RESTRICT` for enforcement/history relationships;
- at most one preferred-for-sharing head per exact owner scope, referencing
  only an issued/current address;
- equality-leading indexes for occupancy and request lookup, with bounded
  owner-history indexes; and
- separately owned display text so privacy-approved redaction cannot release
  the minimum non-enumerating collision key.

Anonymous and authenticated Data API roles MUST have no direct mutation grant.
Applicable tables use `ENABLE ROW LEVEL SECURITY` and `FORCE ROW LEVEL
SECURITY`. Immutable allocation, history, audit, and receipt rows expose no
direct `UPDATE` or `DELETE` grant or policy. Where a mutable current/preferred
head genuinely supports an operation, `SELECT` and `DELETE` use `USING`,
`INSERT` uses `WITH CHECK`, and `UPDATE` uses both. Every mutation still enters
the sole trusted command and remains constraint-backed. That command derives
Tenant, environment, Site, actor, Giving entry, host/route heads, and authority
from server context rather than caller input. Owner, service-role, support,
worker, import, and `SECURITY DEFINER` paths repeat every invariant; definer
functions use schema-qualified objects, a pinned empty `search_path`, and least
privilege. An allowed update cannot move a row into another scope.

### D11-R14 — Concurrency, idempotency, and partial failure are explicit

Issuance seals one exact bounded address manifest and atomically claims every
canonical, host-alias, and router-equivalent locale/path form together with the
Giving-address binding, owner-scoped preferred-state head, durable business
audit, semantic receipt, and outbox—or claims none. A distinct translated or
deliberately different localized address is not an equivalent and requires its
own reviewed issuance under D11-R5; an automatic/default-locale alias declared
by the locale owner stays inside the manifest. The transaction locks or
compare-and-sets resources in one documented order. Two simultaneous claims
for the same address produce exactly one winner; the loser retains its draft
and receives ordinary collision recovery. Core never silently renames either
candidate and never adds temporary draft holds.

Semantic idempotency binds the exact canonical candidate, expected authority
heads, Giving entry, Tenant/environment/Site/locale scope, actor authority, and
command meaning. The same key and same meaning return the original receipt.
Reusing a key with changed environment or other meaning conflicts. If commit
succeeds but the response, CMS placement, QR generation, or email export fails,
a retry returns the same issued address and retries only the derived artifact
through the outbox.

### D11-R15 — Public permanence receives privacy and spoofing review

Slug copy invokes Phase 10's existing publication firewall before issuance;
the reconciled contract MUST return and pin the exact source-owner safety
decision and applicable rule/version evidence. Core derives suggestions only
from approved public material and warns that URL words are public, durable,
and may appear in browser history, analytics, logs, printed materials,
screenshots, and third-party systems. D11's deterministic URL grammar
separately rejects unsafe encoding and identifier forms. D11 adds no generic
DLP or content-moderation engine. Any new sensitive-pattern detector requires
a named owner, exact versioned patterns, false-positive recovery, and public-
seam tests in the reconciled Phase 10 contract.

Sensitive missionary or ministry contexts use an approved neutral public label;
Core MUST NOT infer or reveal a private identity merely to make a slug unique.
The allocation stores only the minimum enforcement and audit material. Raw
queries, fragments, donor data, amount, payment data, secrets, copied CRM
content, and unnecessary personal names are not part of the permanent route
record. Logs, traces, metrics, and public errors use bounded,
non-enumerating dimensions.

### D11-R16 — Staff experience uses plain language

The main label is **Web address** or **Giving page address**, never the
technical term “slug.” The fixed origin and `/give/` prefix are visually
distinct from the editable segment. The help text says what donors see, what
staff may edit, and when permanence begins. It does not teach tombstones,
canonicalization, RLS, or database constraints.

Before issuance the screen provides the complete candidate address, donor
preview, availability state, and safe collision choices only while current
source approval and publish/display authority remain valid. It shows either the
editable segment or a collapsed read-only candidate with **Edit web address**,
never both at once. After issuance, full host/path display, **Copy link**,
**Open/Test as donor**, **Download QR code**, export, and accessible full-value
text require the current need-to-know display capability and retention/use
basis. Otherwise every surface uses the source-owned safe/redacted label plus
opaque reference and suppresses revealing actions. **Review places to share**
and **Create a new web address** remain role/cause-appropriate. No action
suggests that a title, Page route, or Designation edit changes this address.

Ordinary Page UI says **Website page URL** and follows the separately proved
ordinary-Page continuity contract. Giving UI says **Giving page address ·
cannot be reused after publication**. D12 later permits the precise Giving copy
**Other address · Page opens** only for an eligible exact same-meaning direct
allocation; generic “old links work” or redirect language remains forbidden.

### D11-R17 — Accessibility, international use, and weak networks are gates

The editor MUST preserve input; identify errors with text and not color alone;
associate help/errors with the field; set `aria-invalid`; and announce advisory
status through a polite, non-chatty live region. The split visual control
exposes the complete candidate URL—including fixed origin/prefix and editable
segment—as one programmatically associated accessible description/value. It
does not announce every keystroke; staff receive a concise full-address
announcement on request, availability review, and final confirmation. After
issuance, accessibility follows the same current display rule: authorized
complete values or correctly named safe/redacted labels and opaque references;
copy/test/QR controls never reveal a hidden value. After
failed submission, focus moves once to the error summary, whose first link
targets the Giving-address field. Advisory availability checks never move
focus. Toast-only errors are insufficient. Keyboard operation, visible focus,
forced colors, screen readers, 320 CSS-pixel reflow, 200%/400% zoom,
long-origin wrapping, RTL/bidirectional isolation, native-script display,
no-JavaScript submission, and low-bandwidth recovery are release gates.

Availability is progressive enhancement. Draft saving does not depend on it,
and the form remains intact after network or final-claim failure. Public
issuance remains server-authoritative.

### D11-R18 — Abuse protection cannot become staff punishment

Permanent address claims are a scarce, irreversible resource. Only an
authorized human public-publish action may issue one in the ordinary launch.
Scheduled, bulk, import-driven, plugin-driven, AI-autonomous, advance-reserve,
and unreviewed API issuance remain unavailable. Rate and anomaly controls may
pause **new issuance** for one affected actor/Tenant scope, but MUST preserve
draft work, existing routes, adverse reservations, and an understandable
review path. Support cannot release or reassign an address.

Core MUST NOT create an address marketplace, tenant-to-tenant transfer,
temporary hold queue, or first-come namespace auction. Rare simultaneous
collisions are resolved by the final database claim and the normal suggestion
UI.

### D11-R19 — Migration and rollout are adverse-first

Before positive D11 issuance, Core MUST inventory and reconcile current
`/give`, `/donate`, `/checkout`, CMS catch-all routes, `/missionary/...`,
`/s/...`, provider links, exported/QR links, host aliases, and locale variants.
Ambiguous legacy evidence is quarantined; the current “newest row wins” lookup
and missing history MUST NOT be interpreted as permission to claim.

Rollout installs and backfills the shared allocation authority, constraints,
grants/RLS, canonicalizer version, negative occupancy reader, and public-route
enforcement before enabling the new writer. Only proved historical issuance is
backfilled as an immutable allocation. Mixed-version readers fail closed for
unknown positive routes. The kill switch disables new claims while preserving
existing allocation and adverse behavior. Rollback never deletes allocation
facts or reopens a consumed address; repair is forward-only.

### D11-R20 — Deliberate non-goals and required reconciliation

D11 does not add editable full URLs, arbitrary nested paths, a mandatory
suffix, fuzzy collision identity, wildcard tombstones, draft reservations,
cross-Tenant discovery, automatic translation, generic redirect rules, mutable
QR destinations, public link marketplaces, new financial identity, or a
parallel slug service.

Before implementation, the reconciled Phase 24 package MUST:

- narrow Phase 5 A12 so CMS owns ordinary presentation slugs while Giving owns
  Issued Giving Addresses;
- replace Phase 13 D14b's canonical `/missionary/<slug>` Giving-link wording
  with the issued `/give/<staff-slug>?sc=...` seam while keeping Source Code in
  the query; an issued `/s/<token>` never changes destination, even to a new
  preferred address for the same Giving entry, and every destination change
  requires a new token and QR;
- preserve Phase 22's separation between a Page route and Page Giving Binding;
- limit Phase 23 same-Page redirects to ordinary Pages, never Giving intent;
  and
- carry D12's direct same-meaning continuity, nonrouting preference, and
  separately authorized terminal Stop contract into every governing artifact.

The open Phase 22 PR #1323 and Phase 23 PR #1340 remain proposed evidence until
merged or explicitly superseded. D11 qualifies as an ADR candidate but MUST be
recorded through `/to-prd` with those route contracts reconciled first.

## Best staff UX/UI path

The design should feel like naming a page, not configuring a router:

```text
Public title
[ Water Project                                      ]

Giving page address                         Not public yet
https://give.hope.org/give/ [ water-project          ]
This proposed address is not reserved or public yet.
You can change it until you publish it.

[ Preview as donor ]                       [ Continue ]
```

If staff never touch the address, an approved title change refreshes the
suggestion. After they type, Core respects their choice. The full URL always
remains visible, wraps on mobile, and shows normalization before review.

### Collision example

Hope Missions enters `water-project`, but that exact address is unavailable.
If Core cannot safely reveal its history, it keeps `water-project` in the field
and shows only:

> **This web address isn't available**
>
> Choose another address.

Core offers **clean-water**, **water-project-support**, and **Add a short unique
ending**. Nothing changes until staff chooses or types. Static help already
explains that a published address cannot later represent another gift. If
authorized same-Tenant history identifies an existing Giving page, Core names
it and offers **Open Giving page**; when the same immutable public-entry
meaning owns the address and remains eligible, the primary action is **Use
existing Giving link**.

### Publication example

This example assumes an authorized publisher, current public-copy approval, and
a non-sensitive value whose display/retention basis remains valid. After
issuance, D11-R16's reveal rule applies; otherwise Core shows the safe/redacted
label plus opaque reference and omits Copy/Test/QR.

The review shows:

```text
Giving page                 Water Project
Site                        Hope Missions
Giving URL                  https://give.hope.org/give/water-project
Donor preview               [Open preview]

This web address becomes permanent when you publish.
Renaming the page later will not change it.

[ Back ]                                      [ Publish Giving page ]
```

After success:

```text
Public · cannot be assigned to another Core Giving page
https://give.hope.org/give/water-project

[ Copy link ] [ Test as donor ] [ Download QR code ]
[ Review places to share ] [ Create a new web address ]
```

The staff member never has to understand a slug, route allocation, tombstone,
or uniqueness index. A donor sees a recognizable link. Finance still receives
the exact independently resolved Legal Entity, Stripe, settlement, and
accounting facts; the words `water-project` select none of them.

## Current behavior, intended behavior, and permanent path

| Concern              | Current `develop` behavior                                                                                                                                             | D11 intended behavior                                                                                     | Best permanent path                                                                                                                   |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `/give`              | `apps/donor/next.config.ts` has host-blind `/give` and `/donate` redirects to `/workers`.                                                                              | A Site-aware Giving route family.                                                                         | One shared typed route authority runs before static redirects, CMS, and checkout effects.                                             |
| Giving link identity | `packages/lib/payments/checkout-designations.ts` builds generic `/checkout` query links.                                                                               | The path identifies one opaque Giving entry; queries remain separately validated suggestions/attribution. | `/give/{slug}` resolves to `giving_entry_id`; checkout remains an internal execution seam.                                            |
| Site context         | `apps/admin/src/cms/public/resolve-tenant.ts` still returns `siteId: null`.                                                                                            | Every issued address freezes exact Site attribution.                                                      | Implement the founder-ratified Phase 24 Site model after `/to-prd` reconciliation, plus verified host generation, before D11 writers. |
| CMS slug safety      | Current slug fields are indexed but not unique; the public reader uses newest-first `limit: 1`.                                                                        | No ambiguous public address can issue.                                                                    | Global exact-address constraint plus route-kind exclusion; quarantine legacy ambiguity.                                               |
| Normalization        | `create-from-template-endpoint.ts` silently strips non-ASCII text, truncates at 80, and appends an eight-character operational-ID suffix for missionary/project Pages. | Visible, locale-aware suggestion with no mandatory suffix.                                                | One versioned public canonicalizer and separate ordinary-Page/Giving lifecycle policies.                                              |
| Staff copy           | Web Studio exposes a raw **URL slug** field with only a nonempty check.                                                                                                | Plain **Web address** field, full preview, meaningful errors, and deliberate issuance.                    | Reuse an accessible input component, not the same route authority or promise.                                                         |

These current seams are migration evidence. Their existence does not make them
correct and does not authorize extending them.

## Adversarial category review

Each concern below states the failure and why it matters, severity and
likelihood, supporting evidence, effect on the founder answer, and the permanent
fix with exact D11 language. “Material concern” describes the unamended Option
3 or its consequences; the corrected D11 clauses are designed to close it.

### 1. Problem validity, necessity, and alternatives

**Material concern exists in the unamended answer.**

| What could go wrong and why it matters                                                                                                                                                                                       | Severity / likelihood | Evidence or reasoning                                                                                                                                                                                                                                    | Effect on the answer                                                                    | Best permanent fix and exact language                                                                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Core could solve a cosmetic desire rather than the real staff job: confidently recognizing, sharing, and supporting the correct donor link. A blank technical slug field would shift routing complexity onto ministry staff. | Medium / High         | **Repository fact:** Web Studio currently exposes “URL slug.” **External fact:** Payload, Sanity, WordPress, Blackbaud, and Givebutter generate or edit readable words inside a provider-controlled route.                                               | Narrows “staff-chosen” to guided choice; does not invalidate Option 3.                  | **D11-R1, R4, and R16:** propose from approved public copy, show the full address, preserve staff edits, and label it **Web address**. |
| The strongest alternative—readable words plus a mandatory generated suffix—would lower collisions but burden every donor and staff interaction even when origin scoping already prevents most collisions.                    | Medium / Medium       | **External fact:** readable words and hyphens are standard guidance; automatic suffixes are common in WordPress. **Product judgment:** permanent Giving issuance makes silent numbering unacceptable. No source proves either shape improves conversion. | Rejects the mandatory suffix as the default while retaining it as an explicit fallback. | **D11-R1 and R9:** use a pure readable default; offer a short ending only when staff explicitly select it.                             |
| A no-build alternative using generic `/checkout?...` leaves durable gift intent in mutable query data and can reserve one generic path for unrelated gifts.                                                                  | High / High           | **Current behavior:** Core builds query-based checkout links. **Repository fact:** D10 says query/fragment are not separate address identity.                                                                                                            | Confirms a distinct Giving-owned path is necessary.                                     | **D11-R2, R3, and R12:** `/give/{slug}` maps to an opaque Giving entry; financial and attribution queries remain separately validated. |

### 2. Brittleness

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                                                                                                      | Severity / likelihood | Evidence or reasoning                                                                                                                                                                                                                          | Effect on the answer                                                     | Best permanent fix and exact language                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| String comparison could miss case, percent-encoding, Unicode normalization, slash, alias, IDNA, port, or locale equivalents. Two “available” spellings could then route to one address or one meaning could change after a library upgrade. | Critical / High       | **External fact:** RFC 3986, the WHATWG URL Standard, and Unicode UTS #39 distinguish parsing, normalization, and confusable analysis. **Current behavior:** Core's current normalizer decodes once and returns malformed escapes as raw text. | Changes how equality is defined; readable slugs remain valid.            | **D11-R5 and R7:** one versioned public-route canonicalizer, explicit alias manifest, reject ambiguity, and dual-version proof before upgrades. |
| Availability checks can become stale between typing and publishing or fail on weak networks. Treating a green check as a reservation makes the workflow work only under ideal timing.                                                       | High / High           | **External fact:** GOV.UK requires server validation and preserved input. **Database reasoning:** only a unique final claim resolves races.                                                                                                    | Narrows availability to advisory status.                                 | **D11-R6, R9, and R14:** no draft holds, never infer available from failure/staleness, and perform the final atomic claim.                      |
| Deriving every route forever from a mutable title makes a harmless copy edit move a donor link.                                                                                                                                             | Critical / Medium     | **Repository fact:** D10 permanently binds the issued address; CMS copy is presentation.                                                                                                                                                       | Rejects continuous title synchronization after staff choice or issuance. | **D11-R4 and R11:** suggestion follows only while untouched; issued address is read-only and never recomputed.                                  |

### 3. Technical debt

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                                                         | Severity / likelihood | Evidence or reasoning                                                                                                                                                                       | Effect on the answer                                   | Best permanent fix and exact language                                                                                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CMS, Giving, Next.js, Vercel, and a new slug service could each hold competing route truth. Drift would make collision checks lie and bypass D10.                                              | Critical / High       | **Repository fact:** ADR-0029 separates reference from copy; D10 requires a shared typed route authority. **Current behavior:** static redirects and non-unique CMS slugs already disagree. | Changes architecture, not the UX choice.               | **D11-R12–R13:** extend the shared route authority; CMS stores a stable reference; no parallel slug or redirect registry.                                                                          |
| Reusing the current ASCII-only generator and eight-character operational-ID suffix would bake a Page implementation shortcut into permanent Giving URLs and exclude supported writing systems. | High / High           | **Current behavior:** `create-from-template-endpoint.ts` strips other scripts, truncates, and suffixes missionary/project Page slugs.                                                       | Explicitly rejects reuse of current behavior.          | **D11-R1, R5, and R20:** no mandatory suffix or silent deletion; define a versioned internationalization-aware profile with locale-independent canonicalization and separate Page/Giving policies. |
| Freezing an arbitrary 80-character limit without full-URL, byte, QR, browser, database, and accessibility proof would create migration debt.                                                   | Medium / High         | **Current behavior:** 80 is an implementation constant. **External fact:** URLs serialize to bytes and Unicode may expand under encoding.                                                   | Defers a low-level number, not D11's product decision. | **D11-R5:** the design must set evidence-backed scalar, byte, and full-URL limits before implementation and test both sides of each boundary.                                                      |

### 4. Edge cases

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                                                            | Severity / likelihood | Evidence or reasoning                                                                                                                                        | Effect on the answer                                                                          | Best permanent fix and exact language                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Two Sites use the same slug on different custom origins, or one shared Core host serves many Tenants. A bare globally unique slug either over-blocks valid names or leaks cross-Tenant occupancy. | High / High           | **Repository fact:** D10 identity is exact origin plus path. **External fact:** URI meaning is scoped by origin.                                             | Narrows uniqueness to the full canonical address and requires a stable shared-host namespace. | **D11-R2 and R7:** different admitted origins may reuse the slug; shared hosts require a permanent Tenant/Site prefix.                                                                                                   |
| `/give`, `/give/preview`, a CMS Page, an API path, or a catch-all could collide with the Giving router.                                                                                           | Critical / Medium     | **Repository fact:** ADR-0026 reserves `/give`; current Next.js redirects and CMS catch-all are migration conflicts.                                         | Requires a fixed route family and operational-route separation.                               | **D11-R2 and R7:** `/give` is not a gift; CMS cannot occupy the family; preview/API/admin use other namespaces; application-reserved routes block issuance.                                                              |
| A non-Latin, RTL, mixed-script, percent-encoded, invisible, dot-segment, slash-like, or confusable slug could display differently than it routes or imitate another gift.                         | Critical / Medium     | **External fact:** WHATWG URL and UTS #39; **repository fact:** international language support is Phase 24 scope and Phase 10 treats slugs as safety egress. | Narrows accepted input but does not force English or opaque tokens.                           | **D11-R5, R15, and R17:** native-script support with versioned validation, visible serialization, bidi isolation, and production-shaped spoofing tests.                                                                  |
| Staff tries to schedule or create print/QR materials before publication, duplicates a draft, loses domain verification, or changes locale before publish.                                         | High / Medium         | **Repository fact:** D10 excludes scheduled/advance issuance and makes drafts non-exclusive; externally distributed material creates donor reliance.         | Narrows D11 to the already-ratified lifecycle boundary.                                       | **D11-R6 and R10:** drafts/duplicates/schedules consume nothing; scheduling and advance public materials remain unavailable until separately decided; reviewed public publish revalidates every current head and issues. |

### 5. Footguns

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                    | Severity / likelihood | Evidence or reasoning                                                                                                                                          | Effect on the answer                   | Best permanent fix and exact language                                                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Core silently publishes `water-project-2` after a race. Staff may print an address they never reviewed, and the suffix may imply an unintended duplicate. | High / Medium         | **External fact:** WordPress auto-numbering is common for ordinary content. **Product judgment:** D10 permanence makes that ordinary CMS behavior unsafe here. | Rejects automatic conflict resolution. | **D11-R1, R8, R9, and R14:** preserve input, one atomic winner, offer selectable alternatives, never rename silently.                      |
| Staff can type a whole URL or nested path and accidentally claim a system route, wrong domain, or misleading hierarchy.                                   | High / High           | **UX reasoning:** editable full URLs expose high-consequence implementation detail; Phase 23 proposed full-preview plus constrained Page route editing.        | Narrows staff control to one segment.  | **D11-R2 and R16:** fixed, read-only origin/prefix; one editable segment labeled **Web address**.                                          |
| Support, an import, AI, or direct SQL can release or bulk-burn desirable permanent paths.                                                                 | Critical / Medium     | **Security reasoning:** irreversible namespace claims are a scarce resource; D10 forbids override/reuse.                                                       | Adds authority and abuse constraints.  | **D11-R13 and R18:** no direct Data API writes, no support release, no bulk/autonomous issuance, scoped anomaly pause only for new claims. |
| A staff member copies the prospective public URL before issuance and assumes it works.                                                                    | Medium / Medium       | **UX/product reasoning:** the full URL must be reviewable, but an unissued address has no public meaning.                                                      | Clarifies actions and status.          | **D11-R6 and R16:** use a signed preview; disable Copy/QR/export until issue; label the candidate **Not public yet**.                      |

### 6. Tenant safety

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                   | Severity / likelihood | Evidence or reasoning                                                                                                           | Effect on the answer                               | Best permanent fix and exact language                                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A uniqueness response reveals that another Tenant used a missionary, ministry, or sensitive place name. Repeated probes become a cross-Tenant directory. | Critical / Medium     | **Repository fact:** ADR-0028 and D10 require structural, non-enumerating isolation.                                            | Restricts collision detail, not readable slugs.    | **D11-R8, R9, and R15:** generic cross-Tenant response, public-safe suggestions only, bounded telemetry, no foreign metadata, and a statistically verified bounded latency class across outcomes. |
| Tenant-scoped uniqueness permits the same external origin/path after a domain transfer, allowing an old QR to start a new Tenant's gift.                 | Critical / Medium     | **Repository fact:** D10 makes exact external-origin/path occupancy global across Core and reapplies it after fresh host proof. | Confirms global exact-address protection.          | **D11-R7 and R13:** unique canonical origin/path without Tenant in the collision key; Tenant remains immutable owner evidence, not an escape.                                                     |
| Cache keys or router context omit Tenant/Site/host generation and serve another Site's Giving entry.                                                     | Critical / Medium     | **Current behavior:** host-blind redirects exist. **Repository fact:** public isolation must precede route/content selection.   | Requires enforcement before caches and catch-alls. | **D11-R12, R14, and R19:** verified host/route heads in the command; shared route lookup ahead of cache/CMS; isolation and stale-cache tests.                                                     |

### 7. Database, RLS, and authorization safety

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                      | Severity / likelihood | Evidence or reasoning                                                                                                                                                                                               | Effect on the answer                            | Best permanent fix and exact language                                                                                                                                                            |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| App-only checks or a nullable/non-unique slug column allow duplicate canonical addresses and “newest wins” resolution.                                      | Critical / High       | **Current behavior:** CMS slugs are indexed, not unique, and reader uses newest-first `limit: 1`. **Postgres guidance:** constraints must carry invariants; foreign-key lookup columns require appropriate indexes. | Replaces the current data seam.                 | **D11-R13:** globally unique canonical collision identity, immutable allocation facts, CAS head, same-scope FKs, restrictive deletes, and equality-leading indexes.                              |
| An update policy has `USING` but no effective `WITH CHECK`, allowing an authorized row to move to another Tenant/Site/Giving entry or canonical address.    | Critical / Medium     | **Supabase/Postgres fact:** policy clauses differ by operation; `UPDATE` needs both, while privileged roles may bypass ordinary RLS unless separately constrained.                                                  | Adds structural mutation requirements.          | **D11-R13:** operation-appropriate policies, `FORCE RLS`, immutable scope/constraints, revoked direct grants, and repeated invariants for privileged paths.                                      |
| Caller-supplied `tenant_id`, `site_id`, `actor_id`, `giving_entry_id`, host, locale, or “available” flag poisons the claim.                                 | Critical / Medium     | **Repository fact:** authority and attribution must derive from trusted context.                                                                                                                                    | Narrows command input to intent, not authority. | **D11-R10 and R13:** server derives actor/scope/current heads and rechecks them inside the transaction.                                                                                          |
| A separately writable “preferred address” pointer refers across scope, two rows become preferred concurrently, or an unavailable address remains preferred. | High / Medium         | **Data-model reasoning:** staff clarity requires one current preferred link, but mutable shadow state can drift.                                                                                                    | Adds one constrained owner-scoped head.         | **D11-R11 and R13:** at most one issued/current preferred head under same-scope composite FKs and CAS; unavailable/terminal transitions clear it without fallback; allocation remains immutable. |

### 8. Overengineering

**Material concern exists if collision avoidance is generalized beyond the proved need.**

| What could go wrong and why it matters                                                                                                                                                                                       | Severity / likelihood | Evidence or reasoning                                                                                                                                                | Effect on the answer                                                 | Best permanent fix and exact language                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Core creates temporary holds, auctions, regex reservation rules, a globally searchable name marketplace, or a separate slug microservice to avoid rare races. This increases state, expiry jobs, abuse, and recovery burden. | Medium / Medium       | **Database reasoning:** an exact unique constraint and atomic final claim solve the real race. **Product judgment:** drafts need not consume scarce permanent names. | Rejects speculative machinery.                                       | **D11-R6, R14, R18, and R20:** no draft holds/marketplace/parallel service; final CAS plus helpful loser UX.                             |
| One universal Page/Giving URL lifecycle abstraction hides materially different donor-safety rules.                                                                                                                           | High / High           | **Repository fact:** Phase 23 ordinary Page continuity and D9/D10 Giving non-reassignment are different contracts.                                                   | Permits shared UI primitives but rejects shared ownership/lifecycle. | **D11-R12 and R16:** shared accessible component is allowed; route owner, copy, issuance, and replacement behavior stay domain-specific. |

### 9. UX/UI and user friction

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                   | Severity / likelihood | Evidence or reasoning                                                                                                                                         | Effect on the answer                          | Best permanent fix and exact language                                                                                                                                                                                                   |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A blank “slug” field, invisible normalization, jargon, or a generic duplicate error makes staff guess what donors will see and how to recover.           | High / High           | **External fact:** mature CMS tools derive from titles and validate uniqueness; W3C/GOV.UK require identified errors, preserved input, and useful correction. | Expands Option 3 into a guided workflow.      | **D11-R4, R8, R9, R16, and R17:** propose, show the whole URL, preserve input, explain consequence, and provide selectable corrections.                                                                                                 |
| Live checking on every keystroke becomes noisy, slow, and unreliable on mobile or field networks; stale green feedback destroys confidence.              | Medium / High         | **External fact:** GOV.UK cautions against premature validation without evidence and retains server validation.                                               | Changes check timing, not the default.        | **D11-R9 and R17:** debounce/on blur/manual check; explicit unknown state; final server claim; draft saving independent.                                                                                                                |
| A permanent-warning modal becomes frightening or requires typed confirmation for a routine action, while a weak warning lets staff miss the consequence. | Medium / Medium       | **UX judgment:** the consequence is material but comprehensible; typed rituals add friction without proving understanding.                                    | Calibrates the review.                        | **D11-R10 and R16:** one full-address review with donor preview and plain consequence; ordinary publish button, no typed phrase.                                                                                                        |
| Giving and ordinary Page editors use identical “old links work” copy, leading staff to assume a Giving link may safely redirect or change meaning.       | Critical / Medium     | **Proposed evidence:** Phase 23 Page redirects are ordinary-Page behavior. **Repository fact:** D9/D10 forbid moving Giving intent.                           | Requires explicit domain labels and promises. | **D11-R16 and R20:** **Website page URL** versus **Giving page address · cannot be reused after publication**; at D11 close no continuity claim preceded D12, and D12 later permits only exact direct same-meaning **Page opens** copy. |
| Long origins, native script, RTL, zoom, screen readers, and weak networks make the split URL control or status inaccessible.                             | High / Medium         | **External fact:** WCAG error identification, suggestion, status, reflow, focus, and text-spacing requirements apply.                                         | Adds release gates.                           | **D11-R17:** keyboard, screen reader, 320px, 200%/400%, bidi isolation, forced colors, no-JS, and low-bandwidth proof.                                                                                                                  |

### 10. Source of truth, ownership, and domain invariants

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                          | Severity / likelihood | Evidence or reasoning                                                                                                                                                                                  | Effect on the answer                              | Best permanent fix and exact language                                                                                                                       |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CMS title, Page slug, Giving row, route table, and provider link each believe they own the public URL. Circular sync lets a projection become write authority.  | Critical / High       | **Repository fact:** ADR-0029 requires reference-not-copy; D1 separates Site from financial identity; D10 names the route owner.                                                                       | Requires an explicit ownership matrix.            | **D11-R3 and R12:** route allocation owns address truth; Giving owns entry meaning; CMS stores public copy/reference; providers execute only.               |
| A slug or path implicitly becomes the Designation or payment-owner key, so renaming it changes money routing or historical interpretation.                      | Critical / Medium     | **Repository fact:** ADR-0044 makes Legal Entity the canonical financial identity; founder-ratified D1/D2 and D10 prevent Site/address presentation from selecting it; Phase 13 separates Source Code. | Strongly narrows what the slug means.             | **D11-R3:** opaque `giving_entry_id`; slug is display/routing only; all money and attribution facts are independently revalidated/frozen.                   |
| Invalid combinations—same address with different owner, current head without allocation, deleted history, or two preferred links—remain possible by convention. | Critical / Medium     | **Database reasoning:** application checks alone cannot protect concurrent or privileged writes.                                                                                                       | Adds explicit invariants rather than changing UX. | **D11-R13:** unique collision key, immutable scopes, same-scope FKs, restrictive deletes, terminal monotonicity inherited from D10, and one preferred head. |

### 11. Hidden coupling

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                                                        | Severity / likelihood | Evidence or reasoning                                                                                                        | Effect on the answer                                 | Best permanent fix and exact language                                                                                                                                                                                           |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Encoding campaign year, location, Site hierarchy, Designation, Legal Entity, locale, or Source Code into route identity makes future edits or reorganizations unexpectedly move donor intent. | High / High           | **Repository fact:** Site, locale, Giving entry, Designation, Source Code, and financial identity have separate owners.      | Restricts generated suggestions and lookup behavior. | **D11-R3 and R9:** words are public presentation only; qualifiers are optional only when genuinely public identity; queries/source owners remain separate.                                                                      |
| A Page's Giving button copies a raw URL and later drifts from the preferred issued address.                                                                                                   | High / Medium         | **Repository fact:** Phase 22 proposes a Page Giving Binding distinct from Page route; ADR-0029 favors stable references.    | Requires reference-based projection.                 | **D11-R12 and R20:** Page binds to the stable Giving entry/address reference and resolves the preferred share link; CMS does not reconstruct it.                                                                                |
| Provider-hosted links, `/s/<token>`, QR files, or CDN redirects become mutable aliases around the immutable Core address.                                                                     | Critical / Medium     | **Repository fact:** D10 forbids any destination change for an issued short token; providers are not Core address authority. | Narrows integration behavior.                        | **D11-R12, R14, and R20:** an issued token stays bound to its original destination/address and meaning or becomes unavailable; every destination change, including a same-entry preferred replacement, gets a new token and QR. |

### 12. Failure modes

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                                                                            | Severity / likelihood | Evidence or reasoning                                                                                                               | Effect on the answer                                        | Best permanent fix and exact language                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| The availability service, host proof, route authority, safety classifier, or Giving owner times out. Guessing “available” can create a duplicate; blocking all draft work makes outages unnecessarily disruptive. | High / Medium         | **Repository fact:** D10 requires favorable actions to fail closed. **UX reasoning:** private content drafting has no route effect. | Separates draft continuity from public safety.              | **D11-R6, R9, and R14:** save the draft and show unknown; block issue/share only; final claim fails safely with recoverable state.                   |
| Allocation commits but the response is lost, so staff retry and consume another permanent address or print inconsistent links.                                                                                    | Critical / Medium     | **Repository fact:** ADR-0015 and D10 require semantic idempotency and reconciliation after ambiguous success.                      | Adds durable command receipts.                              | **D11-R14:** same semantic retry returns the original address; changed meaning conflicts; derived QR/email work retries independently.               |
| Route claim succeeds but CDN publication, CMS placement, QR generation, or analytics fails. Rolling back the authoritative claim could reopen a public address that may already have escaped.                     | Critical / Medium     | **Distributed-systems reasoning:** a local commit and external effects cannot be one database transaction.                          | Requires roll-forward secondary effects.                    | **D11-R14 and R19:** allocation/audit/outbox commit together; secondary effects retry; never delete the issued claim as compensation.                |
| Public router and allocator disagree after deploy. A confirmed address may 404 or an unallocated path may resolve.                                                                                                | Critical / Medium     | **Current behavior:** routes exist in static Next.js config and CMS lookup.                                                         | Requires adverse-first rollout and operational kill switch. | **D11-R19:** negative reader and constraints precede writer; mixed versions fail closed; kill switch halts positive issuance while preserving facts. |

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                                                                                   | Severity / likelihood | Evidence or reasoning                                                                                              | Effect on the answer                                                          | Best permanent fix and exact language                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Draft, advisory availability, scheduled content, issued/current, unavailable, terminal, and replacement are conflated. A scheduler could accidentally become an address allocator or a draft could poison the namespace. | High / High           | **Repository fact:** D10 distinguishes candidate and issued states and excludes scheduled/advance issuance.        | Defines the issuance boundary.                                                | **D11-R6 and R10:** drafts/checks/schedules are non-exclusive; only reviewed public publish issues; scheduling a new unissued Giving page and advance public materials remain unavailable.    |
| Two staff, Site retirement, host rebind, locale change, and route publication race. Individually valid actions could jointly issue under stale authority.                                                                | Critical / Medium     | **Database reasoning:** a uniqueness check outside the write transaction cannot serialize owner/head changes.      | Adds CAS and lock ordering.                                                   | **D11-R10, R13, and R14:** revalidate and compare-and-set exact heads/manifests in one short transaction; one winner; losers reload without silent rename.                                    |
| A title edit, backdated content date, retry, or new canonicalizer version rewrites the historical path.                                                                                                                  | Critical / Medium     | **Repository fact:** D10 allocation facts and chronology are immutable.                                            | Prohibits recomputation/backdating effects.                                   | **D11-R4, R5, R11, and R19:** issued display/collision facts are stored, not recomputed; canonicalizer upgrades are prospective and proved; history order is immutable.                       |
| Creating a replacement implicitly disables, redirects, or changes the old address without a founder rule.                                                                                                                | Critical / High       | **Repository fact:** D10 permits old exact meaning to continue or become unavailable, but forbids another meaning. | At D11 close this created the next lifecycle decision; D12 later resolved it. | **D11-R11/R20 plus D12:** replacement is a new claim; eligible old behavior is direct same-meaning continuity; no redirect, fallback, reassignment, or implicit terminal state is authorized. |

### 14. Data integrity risks

**Material concern exists.**

| What could go wrong and why it matters                                                                                                              | Severity / likelihood | Evidence or reasoning                                                                                                                                      | Effect on the answer                      | Best permanent fix and exact language                                                                                                                                       |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Raw display slug and canonical collision key are conflated, recomputed, or updated independently, causing historical drift and lookup disagreement. | Critical / Medium     | **External fact:** display serialization and comparison normalization are distinct concerns. **Repository fact:** D10 versioning preserves interpretation. | Requires separate immutable facts.        | **D11-R5 and R13:** store issued display representation, canonicalizer version, and collision identity under one allocation; never recompute history as write authority.    |
| Duplicate drafts are treated as duplicate authoritative rows, or imported content prematurely consumes names.                                       | Medium / High         | **Product reasoning:** collaborative drafts and duplication are normal; only exposure creates permanent donor reliance.                                    | Keeps draft validation permissive.        | **D11-R6:** duplicate/unresolved candidates are allowed privately; only the issuance transaction creates authority.                                                         |
| Alias/locale manifests partially claim, leaving one equivalent path free or bound to another entry.                                                 | Critical / Medium     | **Repository fact:** D10 requires every admitted equivalent to the same safety result.                                                                     | Requires all-or-nothing alias processing. | **D11-R7 and R14:** bounded manifest checked and claimed atomically or publication fails; no positive partial success.                                                      |
| Deleting a Site, Page, locale, or Giving record cascades away collision evidence and makes reuse possible.                                          | Critical / Low-Medium | **Database reasoning:** ordinary cascades conflict with permanent reservation.                                                                             | Changes delete behavior.                  | **D11-R13:** immutable route allocation plus same-scope FKs and `ON DELETE RESTRICT`; lifecycle state and privacy-approved redaction replace deletion of enforcement facts. |

### 15. Security and privacy risks

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                                                                                 | Severity / likelihood | Evidence or reasoning                                                                                                                                                                    | Effect on the answer                                  | Best permanent fix and exact language                                                                                                                                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A permanent URL exposes a missionary's legal name, precise location, religion-sensitive work, member-care fact, email, phone, or internal case label through browser history, referrers, logs, screenshots, and paper. | Critical / Medium     | **Repository fact:** Phase 10 explicitly treats URL slugs as a publication-firewall egress. **External fact:** privacy minimization requires data to be adequate, relevant, and limited. | Narrows source data and adds a pre-issue safety gate. | **D11-R9 and R15:** approved public copy only, neutral alternatives, the existing Phase 10 firewall with exact pinned rule/version evidence in its reconciled contract, deterministic URL grammar, and minimum permanent record; D11 adds no generic DLP engine. |
| Unicode lookalikes, invisible characters, mixed scripts, or misleading domain/path display create phishing-like Giving links.                                                                                          | Critical / Medium     | **External fact:** UTS #39 documents identifier restrictions/confusable detection and warns skeletons are not normalization.                                                             | Narrows unsafe forms without banning native script.   | **D11-R5, R15, and R17:** versioned profile, visible canonical preview, spoofing rejection/review, bidi isolation, and test vectors.                                                                                                                             |
| Availability and support tools enable cross-Tenant enumeration even when the main error copy is generic.                                                                                                               | Critical / Medium     | **Security reasoning:** timing, cache keys, logs, exports, and privileged UI can leak the same fact.                                                                                     | Broadens non-enumeration to all seams.                | **D11-R8, R13, R15, and monitor controls:** uniform unauthorized response, bounded dimensions, least privilege, timing/cache tests, any leak is P0.                                                                                                              |
| Permanent route enforcement is misread as permission to keep all public names and operational logs forever.                                                                                                            | High / Medium         | **Repository fact:** ADR-0038 and D10 separate minimum enforcement evidence from display/personal data.                                                                                  | Adds retention separation.                            | **D11-R13 and R15:** privacy-minimal collision identity remains; display metadata, logs, exports, backups, and audit each follow named owner/retention/disposal contracts.                                                                                       |

### 16. Scalability and performance risks

**Material concern exists.**

| What could go wrong and why it matters                                                                                                | Severity / likelihood | Evidence or reasoning                                                                                                                                                       | Effect on the answer                                        | Best permanent fix and exact language                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Permanent allocation history grows without bound, and every public request scans history or every Tenant.                             | High / Medium         | **Database reasoning:** permanent evidence is expected; request-path scans are not. Equality-leading current-head indexes and bounded owner manifests avoid scale coupling. | Adds read-model/index requirements.                         | **D11-R13:** exact canonical-key lookup and current head on request path; history and audit are separately indexed/paginated; no cross-Tenant scan.                         |
| Per-keystroke checks, unbounded suggestion search, or global confusable comparisons overload the route authority and make typing lag. | Medium / High         | **UX/external fact:** weak-network forms should not depend on chatty validation. **Unicode reasoning:** confusable analysis can be expensive and heuristic.                 | Restricts advisory work.                                    | **D11-R9 and R17:** debounce/on blur/manual checks, at most a few suggestions, bounded locale/security profile, final database claim authoritative.                         |
| One large Tenant or compromised actor permanently issues thousands of names, creating hot indexes and namespace denial.               | High / Low-Medium     | **Security/product reasoning:** claims cannot be garbage-collected without violating D10.                                                                                   | Adds scoped abuse controls.                                 | **D11-R18:** authorized human issuance, no bulk/autonomous path, per-actor/Tenant anomaly pause, durable evidence retained.                                                 |
| Vague “fast” requirements hide regressions in staff availability feedback and public resolution.                                      | Medium / Medium       | **Testability reasoning:** thresholds and representative cardinalities are needed for production proof.                                                                     | Adds measured SLOs without choosing a complex architecture. | Production proof MUST publish dataset shape and p50/p95/p99 for route lookup/claim/check; named monitor thresholds below trigger investigation rather than unsafe fallback. |

### 17. Operational burden

**Material concern exists.**

| What could go wrong and why it matters                                                                | Severity / likelihood | Evidence or reasoning                                                                                              | Effect on the answer                                    | Best permanent fix and exact language                                                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Permanent popular-name collisions send staff to support, which manually edits SQL or releases a path. | Critical / Medium     | **Product reasoning:** readable names collide; a support release would violate D10 donor safety.                   | Requires self-service recovery and no override.         | **D11-R8, R9, R13, and R18:** explain safely, suggest choices, **Use existing link**, immutable DB constraints, and no support release capability.                                                                       |
| Staff accumulate multiple issued links and cannot tell which one to distribute.                       | Medium / High         | **Product reasoning:** D10 permits new addresses but never deletes old history.                                    | Adds an inventory/read-model requirement.               | **D11-R11/R16 plus D12:** at most one issued/current **Preferred for sharing** link; other eligible addresses show **Page opens**; unavailable/terminal transitions clear preference with no fallback; Stop is separate. |
| Reserved-route additions or legacy ambiguities require repeated manual cleanup during deployments.    | High / Medium         | **Current behavior:** static redirects, CMS catch-all, and non-unique slugs exist.                                 | Requires one registry and a staged migration.           | **D11-R2, R7, and R19:** one finite application-route registry, quarantine ambiguity, forward-only reconciliation, no newest-row guess.                                                                                  |
| Staff assume scheduling or QR generation silently reserves an address before publication.             | High / Medium         | **UX reasoning:** hidden scarce-resource claims are surprising, while distributed materials create donor reliance. | Makes the boundary explicit without adding a new state. | **D11-R6, R10, and R16:** neither action silently reserves; scheduling a new unissued Giving page and advance public materials are unavailable until separately founder-ratified.                                        |

### 18. Observability and auditability gaps

**Material concern exists.**

| What could go wrong and why it matters                                                                                                           | Severity / likelihood | Evidence or reasoning                                                                                    | Effect on the answer                 | Best permanent fix and exact language                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Technical logs show an error but staff and support cannot establish who issued which address under which authority or whether a retry succeeded. | High / Medium         | **Repository fact:** durable business audit is distinct from technical telemetry.                        | Adds auditable receipts.             | **D11-R14:** atomic receipt/audit records actor, authority heads, candidate/canonicalizer, Giving/Site scope, outcome, and idempotency meaning.     |
| Core misses a catastrophic reassignment, cross-route positive conflict, cross-Tenant leak, or namespace-burning attack.                          | Critical / Low-Medium | **Security/operations reasoning:** zero-tolerance invariants require explicit signals and owners.        | Adds release and runtime monitors.   | Named zero-threshold monitors below; kill switch stops new positive issuance, never existing adverse enforcement.                                   |
| Product friction is invisible, so staff abandon after collisions or repeatedly replace newly issued URLs.                                        | Medium / Medium       | **Product judgment:** no external source proves the chosen default; Core must measure its own usability. | Makes the UX hypothesis falsifiable. | Collision, abandonment, early-replacement, support-case, and accessibility-feedback monitors below, with Product/UX owners and response thresholds. |

### 19. Dependency and integration risks

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                   | Severity / likelihood | Evidence or reasoning                                                                                                                                   | Effect on the answer                           | Best permanent fix and exact language                                                                                                                            |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Next.js redirects, Payload lookup, Vercel/CDN configuration, or a plugin bypasses the route authority and serves a claimed path.                         | Critical / High       | **Current behavior:** host-blind `/give` redirect and ambiguous CMS lookup exist.                                                                       | Blocks implementation on route reconciliation. | **D11-R2, R12, and R19:** typed authority precedes all positive routers/caches; deploy negative reader first; production route-family proof.                     |
| Stripe Payment Links, provider IDs, QR generators, analytics, or email tools become the URL source of truth or mutate destinations.                      | Critical / Medium     | **External fact:** Stripe QR codes do not expire; provider URLs have their own lifecycle. **Repository fact:** Core keeps providers execution-only.     | Clarifies provider boundary.                   | **D11-R12 and R14:** Core address is authoritative; provider artifacts reference it and retry from outbox; provider identity never reallocates or selects money. |
| Payload's built-in slug field or CMS uniqueness is adopted as the operational allocator. It cannot enforce global exact-origin history or D10 semantics. | High / High           | **External fact:** Payload supports title-derived, lockable, unique slugs, but that is a CMS field primitive.                                           | Allows UX reuse, rejects authority reuse.      | **D11-R12–R13:** a CMS component may mirror candidate UX; only the shared route command can issue.                                                               |
| Phase 13 short links or Source Code queries repoint to “fix” a changed Giving URL.                                                                       | Critical / Medium     | **Repository fact:** D10 binds an issued token to one exact destination and entry/source meaning; Source Code is attribution, not destination identity. | Requires contract supersession.                | **D11-R20:** `/give/{slug}?sc=...`; every destination change, even to a same-entry preferred replacement, gets a new token and QR.                               |

### 20. Migration, rollout, and upgrade risks

**Material concern exists.**

| What could go wrong and why it matters                                                                                   | Severity / likelihood | Evidence or reasoning                                                                                           | Effect on the answer                        | Best permanent fix and exact language                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------ | --------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| New writers issue routes while old public runtimes still redirect `/give` or ignore the reservation.                     | Critical / High       | **Current behavior:** static redirect exists; no shared operational Sites/address registry exists on `develop`. | Blocks writer activation, not the decision. | **D11-R19:** constraints/negative reader/public enforcement first, then writer; mixed-version unknown positives fail closed.              |
| A guessed legacy backfill permanently poisons a desirable path, while omitting a proved old link allows dangerous reuse. | Critical / Medium     | **Product reasoning:** permanent non-reuse makes both false positives and false negatives expensive.            | Requires evidence-classified migration.     | **D11-R19:** backfill proved issuance only; quarantine ambiguity; inventory known links/aliases/locales; never infer “free” from absence. |
| A canonicalizer/library upgrade changes equality and creates new collisions or frees an old spelling.                    | Critical / Low-Medium | **External fact:** URL/Unicode/IDNA implementations evolve.                                                     | Requires versioned upgrade proof.           | **D11-R5 and R19:** preserve version on allocations, dual-run comparison/backfill, quarantine conflicts, prospective activation only.     |
| Rollback deletes new facts or restores an old writer that can reuse addresses.                                           | Critical / Medium     | **Repository fact:** D10 repair is forward-only.                                                                | Constrains rollback strategy.               | **D11-R19:** roll back positive issuance/UI, never allocation facts/negative readers; restore service by roll-forward repair.             |

### 21. Testability, traceability, and proof

**Material concern exists.**

| What could go wrong and why it matters                                                                                         | Severity / likelihood | Evidence or reasoning                                                                                            | Effect on the answer                           | Best permanent fix and exact language                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------ | --------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| “Readable,” “available,” “helpful,” “public-safe,” and “permanent” remain subjective, while tests assert only component state. | High / High           | **Repository fact:** OpenSpec requires falsifiable scenarios; Core prefers public-seam/domain outcomes.          | Requires a full proof matrix.                  | The acceptance criteria below cover positive, negative, boundary, auth, concurrency, migration, accessibility, and production-shaped outcomes for **D11-R1–R20**.   |
| D11 drifts between glossary, founder log, ADR, Phase 5/13/22/23, OpenSpec, tickets, code, and release evidence.                | High / High           | **Repository fact:** open predecessor route documents currently contain conflicting ownership/lifecycle wording. | Blocks implementation until reconciliation.    | **D11-R20:** trace founder answer → `Giving Address Slug` glossary → this evidence → PRD/reconciled ADR → OpenSpec scenarios → DAG tickets → tests → release proof. |
| Tests cover an “available” precheck but not the final public result, RLS bypass, aliases, or two concurrent winners.           | Critical / Medium     | **Database/security reasoning:** the browser state is not the invariant.                                         | Shifts proof to the public and database seams. | Required proof includes exact public resolution, DB constraints/RLS/privileged paths, canonical variants, concurrency, idempotency, and failure recovery.           |

### 22. Other development hazards

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                                                                                              | Severity / likelihood | Evidence or reasoning                                                                                                                                                                | Effect on the answer                                                               | Best permanent fix and exact language                                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Multiple active addresses for one unchanged immutable public-entry meaning create inventory, canonical-link, analytics, and staff-choice ambiguity. Immediately stopping the old one instead breaks bookmarks and printed QR codes. | High / High           | **Repository fact:** D10 allows the old exact meaning to continue or become unavailable but forbids another meaning; at D11 close the founder had not selected between those states. | Did not invalidate D11; created D12, which later chose eligible direct continuity. | **D11-R11/R20 plus D12:** at most one preferred link; other eligible addresses directly open the same page; replacement never redirects/reassigns; terminal Stop is separate. |
| The term “Site URL,” “Page slug,” “Giving URL,” or “campaign URL” is used inconsistently and developers accidentally apply ordinary Page redirects to Giving.                                                                       | High / Medium         | **Repository fact:** Phase 5/13/22/23 use overlapping route vocabulary.                                                                                                              | Requires glossary and explicit route-kind language.                                | Add **Giving Address Slug** to `CONTEXT.md`; use **Issued Giving Address**, **Giving entry**, and **Website page URL** consistently; reconcile predecessors under D11-R20.    |
| The team treats readable slugs as an SEO requirement and adds indexing, canonical redirects, or duplicate-language behavior that donor safety does not require.                                                                     | Medium / Medium       | **Evidence limitation:** Google describes crawlable URL structure, not Giving conversion or a requirement that donation pages be indexed.                                            | Prevents unnecessary SEO coupling.                                                 | D11 uses readability for human recognition; indexing/canonical-search policy remains separately owned and cannot weaken D9/D10 or create redirects.                           |
| A custom domain leaves Core. Staff assume permanent reservation controls external DNS/hosting and communicate a guarantee Core cannot enforce.                                                                                      | High / Low-Medium     | **Repository fact:** D9/D10 limit runtime control to requests routed through Core.                                                                                                   | Clarifies staff copy and support boundary.                                         | Issuance/retirement help MUST say Core protects the address whenever it routes through Core; Domain still requires current proof and Core cannot control external hosting.    |

## Required acceptance criteria and proof

These are outcome tests, not permission to choose a particular component or
table name. The later OpenSpec package MUST express equivalent falsifiable
scenarios and trace each one to D11-R1–R20.

### Staff and donor outcomes

1. Given the approved title “Water Project,” an untouched private editor shows
   the complete proposed `.../give/water-project` URL without a mandatory
   suffix; staff can publish it in the ordinary no-conflict path without
   knowing the word “slug.”
2. Given a staff-edited candidate, a later title change leaves the candidate
   unchanged; **Use title** changes it only after explicit activation.
3. Given normalization-relevant input, the exact eventual displayed value is
   visible before review; publication never emits a different silently
   transformed segment.
4. Given an unavailable candidate, the field retains the exact input, explains
   the problem in text, and offers at most three public-safe, optional choices;
   no choice is auto-selected or published.
5. Given an address already owned by the same immutable public-entry meaning
   and every current eligibility check passes, authorized staff receive **Use
   existing Giving link**, not a duplicate allocation. A matching Giving-entry
   ID with different originating environment, Site attribution, locale route,
   Designation/donor task, or route kind does not qualify.
6. Given a foreign, restricted, redacted, or cross-Tenant collision, the UI uses
   the same status, schema, copy, cache policy, and statistically verified
   bounded latency class and reveals no owner or history detail in responses,
   logs, or telemetry.
7. Given a private draft, duplicate, preview, failed availability request, or
   autosave, no permanent allocation exists and content work remains savable.
8. Given reviewed public publish, the exact permanence consequence is visible
   first and the successful receipt contains the one issued URL and all
   router-equivalent manifest claims. Scheduling or background activation of a
   new unissued address and copy/QR/public placement before publication are
   unavailable and create no allocation.
9. Given a successful issue, the URL is read-only, title edits do not change it,
   and the UI shows **Public · cannot be assigned to another Core Giving
   page**, sharing actions, and **Create a new web address** rather than **Edit
   address**.
10. Given the donor opens the issued address, it resolves to the exact opaque
    Giving entry and independently validates current Site/Giving/financial
    authority. Slug words and query parameters cannot select a different
    Designation, Legal Entity, Stripe account, amount, cadence, currency, or
    Source Code.

### Canonicalization and boundary outcomes

11. The proof set covers empty/minimum/maximum and one-over scalar, UTF-8 byte,
    encoded-segment, and full-URL limits once D11-R5's limits are certified.
12. It covers spaces, underscores, repeated/edge hyphens, case, composed and
    decomposed Unicode, native scripts, expected and unexpected mixed scripts,
    confusables, invisible/default-ignorable characters, controls, bidi
    overrides, percent and double encoding, malformed encoding, slash and
    backslash, dot segments, query/fragment delimiters, IDNA hosts, ports,
    aliases, locale routes, and trailing-slash forms.
13. The same readable slug on two distinct admitted origins succeeds. The same
    canonical origin/path across Sites, Tenants, environments, host
    departure/return, aliases, route kinds, or lifecycle states fails without
    revealing occupancy history.
14. `/give` relative to each verified Site public base cannot be assigned to
    one gift; ordinary Pages and catch-all routes cannot occupy that
    base-relative `/give/*` family; preview/admin/API/callback routes cannot
    collide with staff-authored Giving children. A flat shared platform origin
    is rejected.

### Authorization, concurrency, and failure outcomes

15. Caller-supplied Tenant, environment, Site, actor, role, host, locale, Giving
    entry, Designation, canonical value, availability, or preferred-state
    poisoning has zero authoritative effect.
16. Direct anonymous/authenticated Data API writes fail. Immutable allocation,
    history, audit, and receipt facts expose no direct `UPDATE`/`DELETE` grant
    or policy. For genuinely mutable heads, tests exercise
    operation-appropriate RLS (`USING` for `SELECT`/`DELETE`, `WITH CHECK` for
    `INSERT`, both for `UPDATE`), `FORCE RLS`, table-owner, service-role,
    `BYPASSRLS`, support, worker/import, view/function/RPC, and
    `SECURITY DEFINER` poison paths.
17. Two concurrent claims for one address produce exactly one all-or-nothing
    bounded manifest and one durable winner receipt. The loser retains the
    draft and no automatic suffix. Concurrent host rebind, Site lifecycle,
    environment, locale, and preferred-head changes cannot jointly violate
    scope or leave a partially claimed equivalent. D7/Designation/financial
    admission changes commute with issuance and cannot create a partial claim:
    while new gifts are paused, an otherwise presentation-eligible address may
    issue/remain issued-current, render the exact page and owner-provided **New
    gifts unavailable** state, and expose no enabled new-gift CTA/checkout.
18. Same idempotency key plus identical meaning returns the original receipt;
    changed canonical candidate, environment/owner scope, expected head, or
    command meaning conflicts. A lost response after commit creates no second
    address.
19. Every canonical and router-equivalent manifest allocation plus binding,
    preferred-head update, business audit, receipt, and outbox is atomic. A QR,
    CMS, CDN, email, or analytics failure retries only the derived effect and
    never releases or changes the address.
20. Authority outage, stale or failed advisory check, unknown transaction
    outcome, and mixed-version runtime fail closed for positive issuance while
    preserving the draft and a clear recovery path.

### Migration, accessibility, and production outcomes

21. Migration inventory covers `/give`, `/donate`, `/checkout`, CMS catch-all,
    `/missionary/...`, `/s/...`, provider links, QR/export records, every admitted
    host alias, and locale variant. Ambiguous duplicate routes quarantine; no
    “newest row wins” or absence-means-free rule remains.
22. Reader-first mixed-version and rollback tests prove that no old runtime can
    serve or reopen a consumed route and no rollback deletes allocation facts.
23. Keyboard-only and representative screen-reader tests prove field
    labelling; one programmatically associated complete URL including the fixed
    origin/prefix and editable segment; concise on-request, availability-review,
    and final-confirmation announcement without per-keystroke chatter;
    help/error association; status announcements; one focus move to the error
    summary after failed submission; the first summary link targeting the
    Giving-address field; no focus movement for advisory checks; preserved
    input; visible focus; and no toast-only failure. Post-issuance tests cover
    authorized complete values and required safe/redacted-label plus opaque-
    reference alternatives; copy/test/QR/export controls cannot reveal a value
    the viewer lacks current display/retention authority to see.
24. Layout proof covers 320 CSS pixels, 200% and 400% zoom, text spacing, forced
    colors, long origins, native-script and RTL/bidirectional display, no-JS
    submission, high latency, disconnect/retry, and stale advisory feedback.
25. Representative ministry staff can accurately explain: what they may edit,
    when the URL becomes permanent, why a collision does not mean another
    tenant is visible, what to do next, and that the URL does not choose where
    money goes. Donor testing confirms the visible link and resulting Giving
    purpose do not create a misleading expectation.
26. Production-shaped load evidence publishes dataset cardinality, origin
    distribution, permanent-history depth, concurrency, and p50/p95/p99 for
    public route lookup, final claim, and advisory check. It verifies index use
    and bounded telemetry without high-cardinality personal labels.

## Named production monitors

Thresholds below are Core product SLO judgments to validate in staged traffic;
they are not presented as external industry standards. “Any” thresholds protect
zero-tolerance invariants. Product thresholds trigger investigation, not a
weakening of permanent non-reuse.

| Signal                                             |                                                                                                                                       Threshold | Owner                         | Required response                                                                                                                                 |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------: | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `issued_giving_address_reassignment_success_total` |                                                                                                                             Any value above `0` | Giving + Public Route on-call | P0: disable new issuance, preserve evidence, verify public zero-effects, and roll forward the invariant fence.                                    |
| `giving_namespace_positive_route_conflict_total`   |                                                                                                                             Any value above `0` | Public Route Platform         | P0: disable positive publishing for the affected origin; reconcile allocation and router heads before restoration.                                |
| `giving_slug_cross_tenant_detail_leak_total`       |                                                                                                                             Any value above `0` | Security                      | P0 isolation response: disable unsafe availability/detail paths, purge affected cache output, preserve evidence, and notify the incident owner.   |
| `giving_slug_prohibited_sensitive_data_total`      |                                                                                                                       Any confirmed issued slug | Security + Tenant Support     | Contain public exposure, follow owner privacy process, create a safe replacement if authorized, and retain only D10-minimum reservation evidence. |
| `giving_issue_outcome_unreconciled_total`          |                                                                                                     Any command still ambiguous after 5 minutes | Giving Platform               | Reconcile by durable receipt/readback; prevent a second allocation and page on-call.                                                              |
| `giving_slug_publish_collision_rate`               |                                                                                                 Above 10% over 7 days with at least 50 attempts | Giving Product/UX             | Review namespace and suggestion quality with affected staff; never add a silent suffix or release history.                                        |
| `giving_slug_collision_abandonment_rate`           |                                                                                               Above 20% within 24 hours, at least 25 collisions | Giving Product/UX             | Usability review of copy, alternatives, and recovery; test amended design with staff.                                                             |
| `giving_slug_new_address_within_7d_rate`           |                                                                                                       Above 1% of issued addresses over 30 days | Giving Product/UX             | Investigate preview, public-safety warning, title suggestion, and review-step comprehension.                                                      |
| `giving_slug_advisory_to_publish_race_rate`        |                                                             Above 1% over 24 hours with at least 100 attempts, or 3 same-origin races in 1 hour | Public Route Platform         | Inspect staleness and transaction contention; improve refresh/indexes, not draft reservations.                                                    |
| `giving_slug_availability_error_rate`              |                                                                                                Above 1% for 15 minutes with at least 100 checks | Public Route on-call          | Page owner; keep issue fail-closed, preserve drafts, and show the recoverable unknown state.                                                      |
| `giving_slug_check_p95_ms`                         |                                                                                          Above 1 second for 15 minutes with at least 100 checks | Public Route Platform         | Inspect query/index/cache regression; degrade to explicit check while final Postgres authority remains unchanged.                                 |
| `giving_address_issuance_burst`                    | More than 50 by one actor in 24 hours; after 30 days of history, also at least 20 and more than 10 times `max(1, trailing-30-day daily median)` | Security + Site Operations    | Pause only new issuance for the affected scope, investigate authority/automation, and preserve every existing allocation.                         |
| `giving_slug_security_profile_rejection_rate`      |                                                                                                Above 5% over 7 days with at least 50 candidates | Localization + Security       | Review locale profile and examples with affected Tenants; change a versioned profile prospectively only after proof.                              |
| `giving_slug_collision_support_cases`              |                                                                                                                          More than 5 in 30 days | Giving Product                | Improve inline guidance and docs; support receives no release/reassignment capability.                                                            |

## Ruthless synthesis — strongest path forward

### Required before D11 is recorded

1. Replace “fully staff-chosen URL” with the corrected bounded choice in
   D11-R1–R3: staff chooses one readable segment; Giving owns route syntax and
   allocation while Domain, Site, locale, and financial owners retain their
   source facts.
2. Record **Giving Address Slug** in the glossary so developers cannot confuse
   a display segment with Giving or financial identity.
3. At D11 close, leave old-address behavior to D12 rather than smuggling a
   redirect, shutdown, or continuity rule into implementation. D12 has now
   resolved it as direct same-meaning continuity with a separate terminal Stop.

Those three conditions are satisfied by this D11 evidence and the grooming log
update. The decision is therefore safe to record as **Accept with required
amendments**, but it is not implementation authorization.

### Required in the PRD and design

1. Reconcile Phase 5, 13, proposed 22, and proposed 23 ownership/lifecycle
   wording under D11-R20.
2. Specify the fixed Giving route family and shared-host namespace rule.
3. Define the source-owner matrix, opaque Giving-entry binding, exact D10
   collision identity, all-or-nothing equivalent-address manifest, and
   owner-scoped preferred-for-sharing head.
4. Finish the versioned international slug profile and evidence-backed length
   limits; do not copy today's ASCII-only/80-character code.
5. Specify the complete staff state machine and copy: untouched suggestion,
   edited draft, invalid/unavailable/unknown, reviewed, issued/current,
   issued/unavailable, issued/terminal, and replacement candidate. Scheduling
   or advance sharing cannot issue under D11.
6. Resolve the default-language versus separately issued localized-address
   workflow before the PRD freezes locale URL placement.
7. Carry D12's later resolution into replacement: an eligible nonpreferred
   same-entry address continues directly, preference remains nonrouting, and
   Stop is separate and terminal.

### Required implementation safeguards and order

1. Build the founder-ratified Site/domain/host-generation seam after `/to-prd`
   reconciliation and the shared typed route authority first.
2. Add immutable allocation facts, CAS heads, same-scope constraints/indexes,
   restrictive deletes, grants/RLS, trusted command, audit/receipt, and outbox.
3. Deploy the canonical negative occupancy reader ahead of every CMS, static,
   cache, and Giving route; leave positive issuance disabled.
4. Inventory and evidence-classify legacy routes. Backfill only proved
   issuance; quarantine ambiguity.
5. Add the accessible staff editor and advisory checker as a non-authoritative
   client of the route command.
6. Enable atomic reviewed public issuance and post-issuance sharing artifacts
   behind a scoped kill switch; leave scheduled and advance-reserve issuance
   unavailable.
7. Replace generic public Giving links only after public-route, final checkout,
   and stale-session enforcement agree.
8. Run the complete public-seam, database, authorization, concurrency,
   migration, accessibility, staff-comprehension, and load proof before rollout.

This order prevents a polished editor from publishing into today's unsafe
host-blind and ambiguous routing seams.

### Monitor, do not prebuild

- Do not add mandatory suffixes, holds, auctions, or bulk tooling for
  hypothetical collision volume. Monitor actual collision and abandonment
  rates; Product/UX responds at the named thresholds.
- Do not ban native script because spoofing is possible. Monitor profile
  rejection and confirmed sensitive/spoofing incidents; Localization and
  Security evolve the versioned profile prospectively.
- Do not create special sharding or a route microservice before production
  evidence. Monitor lookup/check latency, index plans, and issuance bursts;
  Public Route owns the response.

## Repository and external research synthesis

### Repository facts verified on 2026-08-26

- Accepted `docs/adr/0026-public-website-surface-in-donor-app.md` reserves the
  future `/give` route family in the donor application.
- Accepted `docs/adr/0029-reference-not-copy-cms-operational.md` keeps CMS
  presentation separate from operational Giving truth.
- Accepted `docs/adr/0028-defense-in-depth-public-isolation.md` requires
  structural, fail-closed, non-enumerating public isolation.
- Accepted
  `docs/adr/0038-purpose-owned-records-schedules-and-verified-disposal.md`
  separates purpose-owned retention from “keep everything forever.”
- Accepted `docs/adr/0044-canonical-legal-entity-financial-boundary.md` makes
  Legal Entity the canonical financial identity. Founder-ratified D1 and D10
  separately prevent Site/address presentation from selecting it.
- Phase 10 names URL slugs as publication-firewall egress for restricted
  missionary/person data.
- D9 requires privacy-safe not found by default and forbids Giving redirects.
  D10 permanently binds the exact issued origin/path and makes drafts
  non-authoritative.
- Current code still contains host-blind `/give`/`/donate` redirects, generic
  query-based checkout links, missing operational Site context, ambiguous CMS
  lookup, non-unique CMS slug fields, and an ASCII-only ID-suffixed generator.
- Open PR #1323 and PR #1340 contain useful founder-ratified Page/route design,
  but remain unmerged proposed evidence and cannot silently govern D11.

### Current external/comparable evidence

- [Google URL structure guidance](https://developers.google.com/search/docs/crawling-indexing/url-structure)
  recommends simple descriptive words, audience-language URLs, hyphens, and
  consistent case. It is crawlability guidance, not donation-conversion proof.
- [Google multilingual guidance](https://developers.google.com/search/docs/advanced/crawling/managing-multi-regional-sites)
  supports distinct language/region URLs rather than automatic content routing
  as URL identity.
- [Payload text/slug documentation](https://payloadcms.com/docs/fields/text),
  [Sanity slug documentation](https://www.sanity.io/docs/studio/slug-type), and
  [Contentful slug validation](https://www.contentful.com/developers/changelog/content-model-editor-update/)
  demonstrate title-derived suggestions, staff editing, and publication-time
  uniqueness. They are UX primitives, not proof of D10-grade route authority.
- [WordPress slug documentation](https://wordpress.com/support/permalinks-and-slugs/)
  and its [unique-slug function](https://developer.wordpress.org/reference/functions/wp_unique_post_slug/)
  demonstrate common automatic numeric suffixes and redirects. Those ordinary
  content defaults conflict with D9/D10 and are deliberately not copied.
- [Givebutter campaign URL guidance](https://help.givebutter.com/en/articles/2267413-how-to-customize-a-campaign-url)
  supports staff-readable customization and warns that changes break old links.
  Its donor-confidence statement is a vendor claim, not independent evidence.
- [Blackbaud donation-link guidance](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/guided-fundraising/content/admin-donation-link.html)
  likewise shows readable donation links and the cost of changing distributed
  communications.
- [Stripe Payment Link sharing guidance](https://docs.stripe.com/payment-links/share)
  says its QR codes do not expire, supporting the risk that physical Giving
  links remain in circulation. It does not establish Core's route model.
- [RFC 3986](https://www.rfc-editor.org/rfc/rfc3986.html), the
  [WHATWG URL Standard](https://url.spec.whatwg.org/), and
  [Unicode UTS #39](https://www.unicode.org/reports/tr39/) support explicit,
  versioned parsing/comparison and identifier-safety rules; confusable
  detection is not canonicalization.
- [WCAG error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html),
  [error suggestion](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html),
  [status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html),
  and [GOV.UK validation guidance](https://design-system.service.gov.uk/patterns/validation/)
  support preserved input, specific inline errors, useful correction, status
  announcements, and server validation.

### Evidence limits and unresolved unknowns

- No current primary source proves that a pure readable slug produces more
  completed gifts than readable-plus-suffix. The default is a founder product
  judgment grounded in staff/donor clarity, to be tested with representative
  users and monitored.
- No external source makes permanent non-reuse a universal nonprofit norm.
  That remains Core's founder-approved donor-safety invariant under D10.
- Repository code does not yet prove a safe Site-aware route allocator; D11
  cannot ship by extending current slug fields or redirects.
- Actual collision, abandonment, early-replacement, latency, and locale-profile
  rejection rates are unknown until staged traffic. Named monitors make those
  assumptions falsifiable.
- The final locale/Unicode character profile and numeric limits require a later
  bounded design decision and production proof; current ASCII deletion is not
  an acceptable default.
- At D11 close, D12 still had to decide old live-address behavior. D12 now
  authorizes only eligible direct same-meaning continuity plus a separate
  terminal Stop; redirect, reassignment, and fallback remain forbidden.

## Documentation and ADR status

`Giving Address Slug` is defined in root `CONTEXT.md`, and the Phase 24 grooming
log records the founder choice, this amended disposition, the complete staff
experience, affected contracts, required evidence, and D12's later resolution.
This report is the durable adversarial evidence appendix.

D11 is an ADR candidate because it fixes route ownership, identity, and
issuance boundaries across Giving, CMS, public routing, and Sites. The accepted
ADR and OpenSpec changes are intentionally produced only when Phase 24 enters
the separately invoked `/to-prd` workflow and reconciles open Phase 22/23 route
work. That sequencing blocks implementation, not the completed founder
decision.

### Later D13 placement-convergence clarification — 2026-08-27

D13 preserves D11's reference-not-copy intent. A reference-backed Page or
Navigation placement stores stable same-scope Giving-entry meaning; it does not
copy a mutable preferred URL into authored content or resolve mutable
preference live under an already released generation. Preference change may
prepare a private complete Site-locale publication candidate that reuses the
stable reference and pins the exact issued address generation. Only the Page/
Navigation source's ordinary review and Public Site Generation CAS can make it
public.

Communications, QR-definition, and future adapters remain independently
source-owned and qualify only after their exact version/freeze/release contract
exists. Literal, approved/frozen, scheduled, prepared, sent, downloaded,
printed, and external artifacts never mutate. Missing initiator authority
creates source-owned attention, not a Giving edit or current generic Mission
Control task. The complete decision and proof are in
[`phase-24-d13-authorized-giving-placement-convergence-adversarial-review.md`](./phase-24-d13-authorized-giving-placement-convergence-adversarial-review.md).

## D76 reconciliation (2026-08-30)

Moving a hostname to another Site does not transfer a human-readable Giving
slug or its issued canonical address. The destination cannot infer eligibility
from the same slug, Page, Designation or Tenant. Permission-safe source details
remain Giving-owned; public routing sees only the existing exact reservation/
outcome before destination website handling.
