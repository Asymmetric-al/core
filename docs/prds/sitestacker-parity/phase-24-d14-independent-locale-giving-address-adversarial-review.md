# Phase 24 D14 — Independent Locale Giving Addresses Adversarial UX Review

> **Status:** Completed `/grill-with-docs` decision evidence for D14. This is
> not a Phase 24 PRD, OpenSpec change, implementation plan, migration
> authorization, issue specification, or runtime change.
>
> **Founder choice:** Each Giving-enabled Site locale gets its own deliberately
> issued public Giving address.
>
> **Review date:** 2026-08-27
>
> **Later D16 clarification:** The locale-neutral Site Root Entry may be
> `x-default` only for an eligible non-Giving homepage cluster. No Giving
> address names, targets, canonicalizes to, redirects through, or falls back to
> the root; every D14 exact-locale Giving address remains unchanged.

## Final disposition

**Accept with required amendments.**

The founder's direction is the strongest permanent model for donor clarity and
safe staff sharing. An English link must always open the English Giving
presentation; a French link must always open the independently ready French
presentation. The same literal address must not change language because of a
browser, cookie, IP address, Site-default change, or provider setting.

The informal phrase **one address per Giving-enabled locale** is not precise
enough to implement safely. It could be misread as auto-creating an address
when a locale is published, limiting a locale to one historical address,
letting Site locale select financial configuration, or treating browser
language as address identity. The corrected model keeps these facts separate:

1. the Site recognizes one exact canonical locale;
2. one complete Site-locale public presentation is current;
3. the Site-level Giving capability is independently enabled, while D7
   public-Gift admission remains a separate current checkout gate;
4. one exact Giving-entry presentation is ready in that locale;
5. authorized staff deliberately issue an address; and
6. that address lifecycle may be current, route-unavailable, or terminal,
   while a separate exact-locale sharing-preference head may point to one
   current address.

A Giving entry may therefore have **zero or more issued addresses over time
for one exact locale, with at most one preferred current address in that
locale**. D12's safe replacement history still works. Every individual address
is permanently bound to exactly one Site-locale identity and one Giving-entry
meaning.

The strongest alternative is one locale-neutral address with an explicit
language chooser and no automatic redirect. It reduces staff link and QR
management, but either adds a donor choice before the task or silently
privileges one language. It also makes a shared link, preview, cache, placement,
and support conversation less reproducible. Core may later offer a neutral
Site language chooser outside Giving, but it must never become a fallback or
redirect for an issued Giving address.

One draft example is corrected. D11 already fixes
`{verified-site-public-base}/give/{staff-chosen-slug}`. D14 may place a locale
inside the public base but does not localize or replace Giving's `/give/`
route-family root. At D14 recording, the locale portion was illustrative.
D15 subsequently resolved the shared public-base grammar as
`{verified-site-public-base}/lang/{lowercase-exact-locale}`. Current examples
therefore use:

```text
https://hope.org/lang/en-us/give/clean-water
https://hope.org/lang/fr-ca/give/eau-potable
```

That current shape comes from D15; D14 still owns only exact-locale Giving
meaning and leaves Giving's `/give/` root unchanged.

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
- **Assumption** — a claim requiring representative staff, donor, or production
  proof.

## Staff and donor jobs to be done

### Primary staff job

> When one Giving purpose is ready in another Site language, help me create,
> preview, publish, copy, and support the correct public address without making
> me understand BCP 47, routing, Stripe, or database identity.

### Staff assurance job

> Show me exactly which language, Site, and Giving purpose this address will
> represent, what is still missing, and what publishing it will and will not
> change.

### Donor job

> When I open a Giving link, keep the entire pre-checkout experience in the
> promised language and let me deliberately choose another genuinely available
> language without changing what I am giving toward.

### Support job

> Let me identify the exact language address a donor used and explain its
> current status without exposing another Tenant, reading raw provider data, or
> guessing from the URL text.

## Corrected D14 decision — normative language

These clauses replace the draft D14 recommendation and MUST flow into the
later Phase 24 PRD, reconciled ADRs, OpenSpec requirements, design, tickets,
tests, and release evidence before implementation may be called complete.

### D14-R1 — Locale publication, Site Giving admission, readiness, and address issuance are independent

A recognized Site locale, an enabled Site locale, a current public
Site-locale presentation, the Site-level Giving capability, D7 admission, a
ready localized Giving-entry presentation, and an Issued Giving Address MUST
remain separate facts in storage, APIs, UI, audit, and tests.

Publishing or enabling a Site locale MUST NOT enable Site-level Giving, create
a Giving entry, issue or prefer an address, create a checkout, select a
Designation, configure Stripe, or publish missing Giving copy. D14 MUST NOT add
a second `locale_giving_enabled` Boolean or per-locale financial-admission
switch. Staff-facing **French Giving page ready** is a derived readiness
projection over separately owned Site-level Giving capability and exact French
presentation facts. D7 new-gift admission remains a separate Site-wide status.
Address issuance remains a separate, deliberate, currently authorized staff
action after exact readiness is proved.

Core MUST NOT require every configured or public Site locale to have a ready
Giving presentation or address. A useful public website and additional Site
locales can remain live while Site-level Giving is off or Giving presentation
is incomplete in one locale.

Site-level Giving capability not yet enabled blocks new address issuance. Once
an address exists, ordinary reversible new-gift containment uses D7. A later
capability disabled or needs-attention outcome alone MUST NOT mutate, hide,
stop, unprefer, or reassign any issued address; any presentation or route
effect requires its already-defined source-owner disposition.

### D14-R2 — Every issued address has one immutable exact-locale meaning

Every Issued Giving Address MUST be permanently bound to exactly one trusted
Tenant × originating environment × Site × stable Site-locale identity ×
canonical-locale generation × Giving entry × route-allocation manifest.

The address is not “French-ish,” “the current default,” or “whatever the
browser prefers.” Only canonical equivalents or deprecated-tag preferred
values proved by the pinned standards profile may resolve to one Site Locale
at identity creation. `fr`, `fr-CA`, and `fr-FR`; `pt-BR` and `pt-PT`;
`zh-Hans` and `zh-Hant`; and `sr-Latn` and `sr-Cyrl` remain distinct. No
Tenant, staff member, or locale-owner policy may alias materially different
language, script, or region presentations. Similar name or content MUST NOT
infer equivalence.

Changing the Site default locale, browser preference, staff UI language,
locale display name, CLDR version, provider locale, or Giving-entry title MUST
NOT relabel, reassign, redirect, or change an issued address.

### D14-R3 — Locale identity is canonical, versioned, and stable

New Site-locale identities MUST use a version-pinned IANA/Unicode catalog and
canonical BCP 47 tags. Core MUST preserve the actor's requested-tag provenance
where relevant while using one canonical identity for comparison. Locale input
MUST reject arbitrary strings, controls, private-use-only identity, nonhuman
language tags, unsafe extensions, and unsupported rendering options.

The stable Site-locale identity, not a mutable display label or caller string,
MUST be the address relationship. A standards-driven alias or deprecated-tag
change MAY update display and comparison metadata only through a versioned
locale-owner process; it MUST NOT mutate a previously issued URL or turn a new
locale identity into the old one. A replacement locale receives a new identity
unless the pinned standards profile proves it is the canonical/deprecated-tag
form of that same identity before creation; owner assertion alone is never
continuity evidence.

Locale MUST NOT select or imply country, jurisdiction, currency, Legal Entity,
receipt issuer, Tenant Stripe account, Stripe connected account, settlement
account, bank, accounting owner, payment method, or tax treatment.

### D14-R4 — “Ready to publish an address” is an exact conjunction, not one status

Core MAY show **Ready to publish address** only when the current actor is allowed
to issue and the server has proved, for the exact scope and expected heads:

1. the Tenant, environment, Site, verified origin/public base, and Site-locale
   identity are current and compatible;
2. the Site locale has one complete, current, public presentation release;
3. the Site-level Giving capability is enabled; D7 public-Gift admission is
   shown separately and does not participate in or stale address issuance;
4. the exact Giving entry and its localized public presentation are current,
   public-safe, and eligible;
5. required public-page UI, formatting, direction, font, accessibility, and
   disclosure capability exist for the exact locale; provider/checkout display
   language remains a separate CTA/admission concern;
6. the D11 route profile and shared address authority can represent the exact
   canonical address; and
7. no current safety, Site lifecycle, route, or source-owner
   rule blocks favorable public use.

Core MUST NOT require every Site Page, message, receipt, provider surface, or
locale to be translated before this one exact Giving presentation is ready.
Each missing dependency MUST name its owner and one safe next action. Generic
**Not ready** or opaque percentages MUST NOT substitute for the exact facts.
Private candidate editing and donor preview MAY continue while a late
publication dependency is adverse. A temporary D7 public-Gift pause does not
block or stale issuance: the resulting exact-locale page/address remains
available and truthfully shows **New gifts unavailable**. D7 still blocks every
new checkout at its separate Site-wide admission fence.

### D14-R5 — D11's fixed Giving route family remains controlling

The address shape remains
`{verified-site-public-base}/give/{staff-chosen-slug}`. D14 permits the
Site-locale owner to contribute a separately ratified locale identity to the
public base; it does not move, translate, multiply, or tenant-configure the
base-relative `/give/` route root.

Staff edit only the final public-safe words. Core MUST propose them from the
exact locale's approved Giving title, allow staff to accept or edit them, show
the complete canonical URL, and follow all D11 normalization, collision,
privacy, concurrency, and permanent-reservation rules. Core MUST NOT silently
translate, transliterate, suffix, claim, or borrow the words from another
locale.

Collision scope is the complete canonical address and all router-equivalent
forms in its allocation manifest—not a global bare slug. The same final words
MAY exist under genuinely distinct admitted locale public bases or origins.
Only the final issuance command decides availability atomically.

### D14-R6 — Address issuance is deliberate, atomic, and receipt-idempotent

Private editing, suggestions, availability hints, preview, QR preview,
autosave, locale enablement, Site-level Giving enablement, and Site publication MUST
consume no address.

The final action MUST name the exact language and durable effect, for example
**Publish French Giving address**. It MUST reauthorize the actor and re-prove
the exact locale, public presentation, Giving entry, route, lifecycle,
capability, and expected heads. It then atomically issues every equivalent form
in one immutable address manifest, makes the first or replacement address
preferred for that exact locale scope when applicable, and records the durable
business audit, result receipt, and projection outbox in the same transaction—or
changes nothing.

A retry with the same idempotency identity and exact immutable command meaning
MUST return the original receipt. A different locale, Site, Giving entry,
candidate URL, actor-authority epoch, or expected head MUST be a different
command. Lost acknowledgement MUST resolve by receipt read-back, never a second
claim.

### D14-R7 — Source ownership stays singular

The Site-locale owner owns canonical locale identity, enablement, current public
presentation, public-base participation, and locale lifecycle. Giving owns the
Site-level public-Giving capability/admission, Giving-entry meaning,
exact-locale Giving-presentation readiness inputs, address
issuance/preference/Stop, and the donor-task binding. The
CMS/Page owner owns localized authored presentation and release. The shared
route owner owns exact canonical allocation and resolution. The contribution
and financial owners alone own checkout admission and every financial fact.

No coordinator, Payload document, URL parser, Stripe setting, cache, search
document, analytics record, QR provider, or language selector becomes a second
write authority. Projections MAY combine these facts for staff or public
display but MUST remain disposable and rebuildable.

### D14-R8 — Locale and address lifecycle fail safely without collapsing states

At minimum, implementation MUST distinguish:

- Site locale recognized, enabled, public, unavailable, and terminal outcomes;
- Site-level Giving capability disabled, enabled, and needs-attention outcomes;
- D7 Site-wide public-Gift admission accepting, paused, and needs-attention
  outcomes;
- Giving-entry locale presentation not started, draft, review-blocked, current,
  unavailable, and terminal source outcomes; and
- address candidate, issued/current, route-unavailable, and Stopped terminal
  outcomes; and
- a separate nullable exact-locale sharing-preference head.

Pausing D7 new Site public-Gift admission MUST NOT hide an otherwise current
locale page or language alternative, mutate its address, stop a recurring
commitment, or alter financial history. Every affected locale page remains
available in its promised language with an honest **New gifts are unavailable**
state. Locale-specific presentation failure is handled by its presentation
owner; D14 never invents a locale-level D7 admission control.

A Site-level Giving capability disabled or needs-attention outcome blocks new
address issuance but, by itself, changes no issued address, sharing preference,
page, language alternative, or route. Existing source/presentation/safety
owners remain the only authorities that can narrow those outcomes.

If the exact Site-locale public presentation becomes unavailable, its Giving
addresses MUST NOT render another locale or route to a homepage. They follow
the privacy-safe route-unavailable behavior while retaining immutable
allocation and history. Reinstating the same locale identity and compatible
release MAY restore an issued/current address; it never creates a replacement
or changes preference silently.

A separately governed terminal Site-locale outcome MUST make prior addresses
permanently non-reassignable and preserve their allocation/history. It MUST NOT
fabricate a Stopped Giving Address fact or transfer those addresses to a new
locale identity.

### D14-R9 — Replacement and preference are per exact locale

A Giving entry MAY have zero or more issued addresses over time for an exact
Site locale. At most one issued/current address MAY be **Preferred for sharing**
for each exact Tenant × environment × Site × stable Site-locale identity ×
Giving-entry scope.

Issuing a French address MUST NOT change the English preferred address.
Replacing a French address MUST NOT update, redirect, stop, or reinterpret any
English address. D12 direct continuity applies only to independently current
addresses with the same exact locale and Giving-entry meaning. An unavailable
or terminal address cannot remain preferred, and clearing it MUST NOT choose a
fallback.

### D14-R10 — Direct address resolution is deterministic and never negotiates language

An explicit issued address MUST resolve only its frozen Site-locale and
Giving-entry meaning. `Accept-Language`, IP/geolocation, cookie, local storage,
authenticated profile, referrer, device, campaign, provider detection, current
Site default, and query parameters MUST NOT change that representation or
redirect it to another locale address.

A locale-neutral Site entry MAY, under its own future contract, use browser
preference to suggest a current language. On an issued Giving page, Core MAY
show a small dismissible **View in French** suggestion only when the exact
alternative is independently current and eligible. The suggestion MUST require
the donor to activate a normal link; it is never an automatic redirect or
content replacement.

Unknown, missing, restricted, unavailable, and terminal locale addresses MUST
follow their owning privacy-safe absence contract. They MUST NOT reveal whether
another locale, Giving entry, Site, Tenant, or financial configuration exists.

### D14-R11 — The public language switch is an exact relationship, not URL guessing

A Giving page MAY show a language alternative only when a trusted structural
relation proves that the target:

- represents the same Tenant, originating environment, Site, and exact Giving
  entry/donor task;
- has its own current preferred issued address and compatible public base;
- has current eligible Site-locale and Giving-entry presentations;
- has no current presentation, route, public-audience, or safety block; and
- remains within the public audience and safety contract.

The server MUST derive the target address from that relation. It MUST NOT
construct it by replacing a prefix, translating a slug, copying query text,
searching for a similar title, or asking Stripe/provider locale settings.

The public selector MUST list only current eligible alternatives and the
current language. Missing alternatives do not appear as disabled promises.
Labels use the language's own name and optional region/script, with correct
`lang`, `dir`, bidirectional isolation, and an understandable accessible name.
Flags MUST NOT represent languages.

If an otherwise eligible target locale has no current preferred address, the
public alternative is omitted and authorized staff see one exact-locale repair
action. Preference guides generated sharing/navigation only; it never changes
how any literal current address resolves.

### D14-R12 — Switching language never changes or smuggles financial intent

Before contribution/checkout admission, activating an alternative address is a
new public navigation to the same structurally bound Giving entry in another
presentation locale. It MUST revalidate every operational reference and MUST
NOT carry arbitrary query parameters, amount, cadence, currency, personal
data, payment method, provider/session identifier, cart, token, or financial
configuration into the target URL.

A separately accepted attribution owner MAY preserve an allowlisted,
sanitized, non-authoritative Source Code with its original provenance. Unknown
parameters are dropped. Query strings and fragments never create address
identity or select locale, Site, Giving entry, Designation, or money.

If a donor has already entered local pre-admission form values, Core MUST
either preserve only source-proved safe, non-authoritative UI state in memory
and revalidate it, or warn before discarding it. D14 grants no authority to
transfer payment or personal state.

After a checkout has been admitted, an address-language switch MUST NOT start
another checkout or navigate the frozen operation to another address. The
checkout/contribution owner MAY change supported display language in place
while preserving every frozen operational and financial fact.

### D14-R13 — Placements, QR artifacts, search, and metadata use the same exact manifest

D13 Core-managed placements MAY converge only to a target address with the
same exact placement locale and Giving-entry meaning. A source owner MUST NOT
replace an English placement with French merely because French is preferred in
another scope.

A locale-specific QR or share artifact MUST encode the exact issued canonical
address, name its language to staff, include a readable backup URL where the
artifact format permits, and remain immutable. No QR, social/share URL, or
advance public material is generated before issuance; no managed provider link
may later repoint it.

D14 does not require Giving pages to be indexed. If the search owner admits
them, each preferred exact-locale address self-canonicalizes; an eligible
nonpreferred address MAY emit D12's same-locale canonical to that locale's
preferred address but never a donor redirect. Only preferred canonical locale
pages participate in reciprocal self-inclusive `hreflang` clusters and
localized sitemap membership; every cluster names the current preferred URL
for itself and each admitted alternative. A nonpreferred page emits no
`hreflang` cluster or sitemap membership of its own, though its visible donor
language links MAY still work as ordinary navigation. Search metadata and
current-equivalence facts derive from the same authoritative manifest. Missing,
unavailable, terminal, unsafe, non-equivalent, nonpreferred-as-an-alternate, or
unreleased locales MUST NOT appear. A French page MUST NOT canonicalize to
English. Giving clusters omit `x-default`. D16 MAY name the genuinely neutral
non-Giving Site Root Entry as `x-default` only in an eligible homepage cluster;
it MUST NOT enter Giving metadata or funnel Giving intent to a default language.

### D14-R14 — Authorization is current, capability-shaped, and server-derived

Every read, preview, suggestion, issue, replace, prefer, Stop, copy, QR,
language-alternative, and support action MUST derive Tenant, environment, Site,
stable Site-locale identity, Giving entry, actor, authority path, and current
heads from trusted server context. Caller-controlled fields may express an
intended resource but never establish scope or authority.

Capabilities MUST separate viewing locale/address status, managing Site locale,
changing D7 Site-wide Giving admission, editing localized presentation,
issuing/replacing an
address, preferring/stopping it, and publishing source content. A broad admin,
CMS role, locale-editor role, provider credential, or service role MUST NOT
imply the others.

Staff lacking the exact capability receive a clean read-only state and one
source-owned next action such as **Ask a Giving administrator**. Hidden
resources contribute no count, title, URL, owner, timing, or existence signal.

### D14-R15 — Structural database and RLS rules make cross-scope states impossible

The later design MUST use stable same-scope relationships and constraints—not
application convention—to prevent a locale-readiness relation, address, preference,
or alternative relation from crossing Tenant, environment, Site, locale, or
Giving entry. Exact table names remain a design decision; D14 does not freeze a
premature schema.

Required invariants include:

- immutable server-derived scope on issued/history rows;
- canonical Site-locale identity plus catalog/profile version;
- same-scope composite foreign keys or equivalent database-enforced
  relationships;
- non-null exact-scope fields for favorable rows;
- permanent route-allocation uniqueness across every canonical equivalent;
- at most one preferred issued/current address per exact locale scope;
- `ON DELETE RESTRICT` or preserved tombstone/history behavior for referenced
  identity and allocation facts;
- append-only or immutable transition/receipt rows with fenced current heads;
  and
- purpose-shaped indexes for exact public resolution, staff inventory,
  preference, alternative lookup, health, and bounded reconciliation.

Data API objects MUST use least-privilege grants plus `ENABLE` and, where the
owner path matters, `FORCE ROW LEVEL SECURITY`. `SELECT`/`DELETE` policies need
operation-correct `USING`; `INSERT` needs `WITH CHECK`; `UPDATE` needs both so
an allowed row cannot be moved into a forbidden scope. Exposed views use
`security_invoker = true` or remain unexposed. Security-definer functions have
fixed safe search paths and narrow `EXECUTE` grants. Table-owner,
`service_role`, `BYPASSRLS`, direct connection, Payload Local API, worker,
import, and repair paths MUST re-prove the same business authority and receive
hostile cross-scope tests.

### D14-R16 — Concurrency, caching, and failures preserve the last known safe truth

Commands MUST pin expected Site-locale, public-release, Site-level
Giving-enable, Giving-entry, route-canonicalizer, address/preference,
authorization, and capability generations. D7 admission does not participate
in, lock, CAS, or stale address issuance. Stable lock/CAS order and bounded
transactions MUST cover concurrent locale disablement, default-locale change,
address issuance, slug collision, replacement, preference, Stop, Page
release/withdrawal, and Site move/retirement.

A lost race, stale preview, changed dependency, or ambiguous outcome MUST keep
the prior current address and public generation intact, preserve private staff
input, and return one cause-owned retry/review path. It MUST NOT guess success,
choose another locale, auto-rename a slug, or partially claim a route.

Cache, CDN, search, alternate-link, QR/share, analytics, and staff projections
MUST include exact Tenant/environment/Site/locale/address/public generations
that can change bytes or meaning. An authoritative adverse change takes effect
before favorable projections and is visible as convergence debt until every
projection is current. An unknown authority dependency fails unavailable; a
known missing locale/address follows privacy-safe absence.

### D14-R17 — Privacy, retention, audit, and observability are distinct

Durable business history MUST record the actor/authority, exact scope, locale
identity and catalog version, Giving entry, candidate/issued address manifest,
expected heads, transition, receipt, outcome, and source-owned reason without
copying private content or financial/provider payloads.

Technical logs, traces, metrics, notifications, analytics, exports, support
views, QR filenames, and error text MUST minimize or redact sensitive ministry
names, private translations, donor data, query values, tokens, Stripe IDs, and
cross-Tenant URL evidence. Staff-facing audit and technical telemetry are
separate products with separate access and retention.

Language-switch and browser-preference analytics require their own lawful,
minimized consent/retention contract. They MUST NOT become locale authority or
prove donor preference merely from one visited address.

### D14-R18 — Staff use one calm, source-owned locale-address journey

The primary mutation journey MUST live behind one Giving-owned command surface
reachable with Site and Giving-entry context. Site Languages or Web Studio MAY
show the same capability-filtered projection and deep link, but MUST NOT create
a second address form or authority.

Single-locale Sites receive the ordinary **Giving page address** experience,
with the language visible as quiet context rather than an empty localization
dashboard. Multi-locale Sites use a responsive list of locale cards—not a
Site × entry × locale matrix. Each card shows:

- native locale name plus the staff-language name where useful, never a flag;
- **Website** readiness;
- **Giving page** exact-locale presentation readiness;
- **Address** not created/current/needs attention/stopped state; and
- exactly one current primary action.

D7 **New gifts from this Site** is one Site-wide status above the locale list,
not a repeated locale toggle. When paused, its calm banner explains that every
otherwise current language page/address remains available while new checkout
starts are blocked.

Examples include **Finish French website**, **Finish French Giving page**,
**Create French Giving address**, **Review French Giving setup**, and **Copy
French address**. Internal terms such as locale lineage, BCP 47, route manifest,
canonicalizer, CAS, and slug MUST remain behind progressive disclosure.

Creation reuses D11's one editable field with fixed origin, fixed locale public
base, fixed `/give/`, and one editable final segment. Staff preview the complete
donor page in the exact language before a locale-named publish action. The
success receipt persists, says what changed and what did not, and offers
**Copy address**, **Test as donor**, and **Download French (Canada) QR code**.

### D14-R19 — Donor language controls are clear, accessible, and resilient

The issued page MUST server-render one complete exact-locale representation
with correct HTML `lang`, base direction, language-of-parts markup, UTF-8 URL
handling, logical layout, bidirectional isolation, safe fonts, and localized
formatting from separately owned facts. No-JavaScript and weak-network use MUST
retain the page, language links, purpose, and primary Giving action.

The language control MUST be easy to find, named in plain language, keyboard
and screen-reader operable, touch-friendly, and stable under long labels, CJK,
RTL, text expansion, forced colors, reduced motion, 320 CSS-pixel reflow, and
400% zoom. It MUST not change language on focus, hover, or selection without an
explicit activation. Status changes and copy/issuance results MUST be
programmatically announced without toast-only feedback or disruptive focus.

The donor always sees the same Giving purpose after a language change. If the
alternative ceases to be eligible before activation, the target follows its
privacy-safe unavailable behavior; Core never substitutes a locale homepage or
another Giving purpose.

### D14-R20 — Rollout is additive, measured, and does not prebuild a localization platform

Rollout MUST first establish the canonical Site-locale contract and exact
fallback-free public read, then add sparse exact-locale Giving-presentation
readiness over the existing Site-level Giving authority, then address
issuance/resolution, then staff UX, then
public alternatives, then optional search/QR/placement adapters. Every stage
must tolerate old readers/writers, retain the last safe generation, and have an
independent kill switch that fails adverse-first without changing address
meaning.

Migration MUST classify every legacy candidate before favorable treatment:

- an external or unissued literal URL remains an external literal with no D14
  authority;
- a Core route authoritatively proved to have always represented one exact
  locale and Giving meaning may be bound once to that Site Locale without
  moving its address;
- a Core route proved to have negotiated languages, or otherwise ambiguous or
  unproved, remains permanently reserved/nonissuable, quarantined, and
  privacy-safe absent. D14 authorizes no legacy language gateway, redirect, or
  favorable chooser. A real census-proved continuity need requires a separate
  founder decision over its route kind, public behavior, authorization,
  migration, and retirement contract.

Migration MUST NOT copy one route to every configured locale, infer locale or
meaning from URL/title/content/browser/currency/country/provider/traffic, or
make the current Site default historical truth. No new locale-neutral Giving
route may be issued.

D14 does not add translation vendors, machine translation, translation memory,
per-field workflow, a locale rules language, locale-specific Sites, a generic
redirect service, mutable managed QR links, custom per-Tenant route roots,
locale-selected financial accounts, or mandatory indexing. New needs require
evidence and their owning decision.

## Complete staff journey

### 1. Start where staff already understand the purpose

The ordinary entry is the Giving-owned detail for one public Giving purpose,
opened with its Site context. The heading names the purpose and Site before any
language or address controls:

```text
Clean Water
Hope Missions website

Giving page addresses
Create and share a separate address for each language you support.
```

Site Languages and Web Studio may show the same summarized facts and a deep
link, but the command remains singular. Staff do not have to hunt through a
domain console or Stripe settings, and Core does not duplicate the form.

For one-locale Sites, this remains one simple **Giving page address** card. The
exact language appears as context and there is no empty language-management
screen.

### 2. Show a short vertical list, not a matrix

For a multi-locale Site, each recognized locale gets one capability-filtered
card. Healthy details stay compact; only the next action is prominent.

```text
Giving page addresses

English (United States)
Website ready · Giving page ready
Preferred address ready
hope.org/lang/en-us/give/clean-water
[ Copy address ]       More

Français (Canada) · French (Canada)
Website ready · Giving page ready
Address not created
[ Create French Giving address ]

العربية · Arabic
Website needs review
Finish the Arabic website before creating its Giving address.
[ Review Arabic website ]
```

Status uses text plus an icon, never color alone. The BCP 47 code is optional
secondary detail, not the main label. There are no flags, completion
percentages, dozens of toggles, or disabled mystery buttons.

During a D7 pause, one Site-wide banner appears above—not inside—those cards:

```text
New gifts from this Site are paused
Language pages and addresses still open. Donors cannot start a new gift.
[ Review Site availability ]
```

If the staff member lacks one capability, the card remains useful and
non-enumerating:

```text
Giving address not set up
Only a Giving administrator can publish this address.
[ Ask a Giving administrator ]
```

The action routes through an accepted owner-collaboration contract or explains
who can help; it never invents an approver or exposes hidden staff.

### 3. Turn blockers into a small, owned checklist

Selecting **Create French Giving address** opens one focused setup page. When
dependencies are ready, the checklist stays collapsed behind the plain summary
**Ready to publish**. When something is not ready, only the owning blockers and
their next actions expand:

```text
French Giving address

2 things need attention

Website content       French Giving page needs review
                      [ Review French page ]

Giving presentation  French Giving page is not ready yet
                      [ Finish French Giving page ]
```

This locale-specific presentation readiness is not a second enable switch and
is not D7's Site-wide **Pause new gifts from this Site** gate. It determines
whether the French public Giving presentation is complete enough to issue and
offer; D7 independently fences checkout admission once for the Site across all
its locales. The interface explains the consequence rather than showing two
lookalike toggles.

Missing Stripe, Legal Entity, settlement, or accounting evidence may block the
later checkout owner, but staff never choose those facts in this locale-address
flow. A calm note can say:

> Language does not change where gifts are processed. Financial setup is
> checked separately when a donor starts giving.

### 4. Reuse one beautiful address field

When ready, Core proposes final words from the approved French public title.
The fixed parts are visually present but not editable:

```text
Giving page address                         Not public yet

https://hope.org/lang/fr-ca/give/ [ eau-potable                ]

This proposed address is not reserved or public yet.
You can edit the final words until you publish it.
```

At D14 recording, the exact locale-public-base placement shown above remained
illustrative pending D15. D15 now fixes `/lang/{lowercase-exact-locale}` inside
the Site Locale Public Base. The real UI renders that ratified fixed base.
Staff never type a full URL, language code, domain, `/lang/`, `/give/`, or
provider ID.

Normalization is shown immediately and accessibly. Validation is local where
possible but the screen never claims availability until the final atomic
command. A collision keeps `eau-potable` in the field and says only:

```text
That address is not available.

Try one of these, or keep editing:
○ eau-potable-canada
○ projet-eau-potable
○ Add a short unique ending…
```

Foreign or restricted ownership is never shown. Core does not silently apply
an alternative or append `-2`.

### 5. Preview the exact donor promise

**Preview as donor** renders the exact Site, language, Giving purpose,
direction, disclosures, CTA state, and language alternatives from pinned
private inputs. A visible preview banner states:

> Private preview · French (Canada) · This address is not public yet

The preview cannot create checkout/provider state, emit analytics, enter
search, generate a live QR, or be shared as the final URL. If a dependency
changes while staff review, the final action re-proves it.

### 6. Make the permanent consequence obvious without warning theater

The final review names the durable fact in ordinary language:

```text
Publish French Giving address?

hope.org/lang/fr-ca/give/eau-potable
Clean Water · Hope Missions · French (Canada)

This address becomes permanent. Its language and Giving purpose cannot be
changed or reused later. Publishing it does not publish other languages,
change the English address, or change financial setup.

[ Publish French Giving address ]   Cancel
```

One clear confirmation is enough. Type-to-confirm, repeated modals, legalistic
copy, and a separate “reserve” step add friction without improving this bounded
decision.

### 7. Return a persistent receipt and useful next actions

Success replaces the form with a durable receipt rather than a disappearing
toast:

```text
French Giving address is ready

hope.org/lang/fr-ca/give/eau-potable

[ Copy address ]  [ Test as donor ]
[ Download French (Canada) QR code ]

English and other language addresses were not changed.
Review website placements when you are ready; the earlier address still works.
```

Copy and QR completion use accessible status announcements. The QR filename is
public-safe and language-specific. Its printable artifact includes Site/public
name, Giving purpose, language, simple scan instruction, and readable backup
URL. It never contains internal IDs or a mutable redirect token.

D13's **Review places to update** remains secondary and optional. It opens only
exact French placements for this Giving entry and uses the source-owned
preparation workflow.

### 8. Keep replacement and history understandable

The locale card shows the preferred address first and older current addresses
under **Earlier addresses**. Each older detail states **Still works · Not used
for new sharing** or the exact adverse state. Staff can copy/test an eligible
older link but cannot edit it.

**Create a new French address** repeats the deliberate flow. Successful
issuance changes only French preference; English remains untouched. **Stop this
address permanently** is a separate D12 action with its own consequence review.
There is no ambiguous Rename, Delete, Archive, Restore, Reassign, or Redirect.

### 9. Handle low bandwidth, concurrency, and recovery calmly

Every input remains locally recoverable until acknowledged. The screen says
**Saving**, **Saved**, **Could not save**, **Someone changed the French setup**,
or **We could not confirm whether it published** rather than guessing.

An unknown publish result offers **Check result**, which reads the durable
receipt. A lost collision or readiness race preserves the candidate and returns
staff to the exact field/blocker. No spinner traps the page, no background retry
claims another address, and no toast contains the only recovery instruction.

## Complete donor journey

### 1. A literal address gives one deterministic result

A donor opens the English address from an email or printed card:

```text
https://hope.org/lang/en-us/give/clean-water
```

Core serves one complete English page. The page does not inspect the browser,
IP, cookie, currency, or logged-in profile to replace it with French. The
visible brand and Giving purpose match the link the donor received.

### 2. The donor can deliberately choose a real alternative

When the French page and address are independently current, the page header or
nearby language control offers **Français (Canada)**. It is a normal semantic
link whose accessible name communicates the target language. Activating it
opens:

```text
https://hope.org/lang/fr-ca/give/eau-potable
```

The Giving purpose remains Clean Water because the server followed a trusted
same-entry relation—not because the slugs looked similar. The page is wholly
French, declares `fr-CA`, and exposes only independently valid alternatives.

### 3. Missing or changed availability never becomes a surprise fallback

If French is not ready, it is not offered as an active language link. If it
becomes unavailable after the English page rendered, opening the stale French
link yields the owning privacy-safe response. Core never sends the donor to an
English page, homepage, sibling Site, generic Giving form, or different
Designation.

If D7 new gifts from the Site are temporarily paused but the French page
remains current, the donor can still read it and use exact language links while
the page shows the honest unavailable CTA. Already-admitted checkout work
remains governed by its frozen operation, not by address routing.

### 4. Checkout language remains presentation, not money authority

At admission, checkout independently re-proves Site, Giving entry,
Designation, Legal Entity, Tenant Stripe account, settlement binding, currency,
and current safety. The address locale may be passed as an exact supported
display-language request. If a provider cannot display that exact locale, Core
must block or use a separately accepted transparent presentation outcome; it
must not silently change financial facts or call browser language proof.

Once admitted, changing display language uses the checkout owner's supported
in-place behavior. It never changes the address identity or creates a second
gift/session.

## Source of truth and ownership map

| Fact                                                                 | Authoritative owner                                     | Derived consumers                                                | Never authority                                              |
| -------------------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------ |
| Canonical BCP 47 Site-locale identity, catalog/version, lifecycle    | Phase 24 Site-locale owner                              | Page, Giving, route, shell, formatting, staff/public projections | Browser, country, currency, Payload string                   |
| Complete current Site-locale public presentation                     | CMS/Page publication owner through public generation    | Giving readiness, public route, language alternative, search     | Draft, preview, `_status`, default locale                    |
| Exact-locale Giving-presentation readiness                           | Derived from its accepted presentation/Giving owners    | Staff card, address issuance, public alternative eligibility     | New Boolean, D7 admission, Site publication, provider locale |
| Site-wide new-public-Gift admission                                  | D7 Site Public Giving Admission                         | Checkout fence and page CTA projection                           | Locale address, CMS, Stripe dashboard                        |
| Giving-entry meaning and current public eligibility                  | Giving/operational owner                                | Address, Page reference, checkout, D13 placements                | Slug/title, Page, locale, analytics                          |
| Localized Giving public copy/presentation release                    | Its accepted source owner                               | Readiness, page rendering, preview, search metadata              | Address allocation, machine translation, sibling language    |
| Issued address allocation, canonical manifest, preference, Stop      | D10–D14 shared route/Giving command boundary            | Public resolver, staff inventory, QR/share, Page reference       | CMS slug, domain provider, redirect service, QR vendor       |
| Page/Navigation/Communication placement version and publication/send | Each source owner under D13                             | Convergence projection and staff receipt                         | Giving preference/address occurrence                         |
| Designation, Legal Entity, Tenant Stripe account, settlement, money  | Phase 13/20 and their operational/financial owners      | Admission/checkout, ledger, receipt, finance UI                  | Site, locale, address, slug, CMS, provider presentation      |
| Checkout display locale after admission                              | Checkout/contribution presentation owner over frozen op | Donor checkout UI and provider request                           | Address rewriting, provider auto-detection as Core authority |
| Search canonical/hreflang/sitemap projection                         | Search owner over exact public-equivalence manifest     | Crawlers and staff health                                        | Address lifecycle, locale readiness, Google result           |
| Staff readiness/status card                                          | Rebuildable capability-filtered projection              | Staff UX only                                                    | Any source row or transition                                 |

## Domain invariants and valid cardinality

1. One Site identity is behavior-neutral and may have many Site-locale
   identities; a language never creates another Site.
2. One Site-locale identity has one canonical tag under a pinned catalog
   generation; aliases do not create several authorities.
3. Site-locale public release, exact-locale Giving-presentation readiness, D7
   Site public-Gift admission, Giving-entry eligibility, and address lifecycle can
   change independently.
4. One Issued Giving Address has exactly one immutable Site locale and exactly
   one immutable Giving-entry meaning.
5. One exact Site-locale × Giving-entry scope may have zero or many issued and
   still-current addresses over time, but at most one preferred address.
6. One address can never belong to several locales, Sites, environments,
   Tenants, or Giving entries.
7. A generated language alternative targets the independently current
   preferred address for the same exact Giving entry in that target Site
   Locale; it is not a redirect or alias.
8. A current default locale has no historical power over issued addresses.
9. Locale does not own or select financial identity; checkout re-proves it.
10. Unavailability narrows favorable use but never releases or reassigns
    identity. Terminal history is append-only.
11. A favorable projection can lag authority, but may never lead it. An adverse
    authority result must not be hidden by a stale cache or provider page.
12. Conservation applies to address claims: one canonical address manifest is
    either claimed once for one immutable meaning or not claimed at all.

## Lifecycle and transition model

| Scope/fact                       | Meaningful states/outcomes                                                                | Valid transitions                                                       | Forbidden shortcut                                                                                  |
| -------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Site locale                      | recognized, enabled nonpublic, public, unavailable, terminal                              | source-owned successor transitions with exact release/cohort proof      | delete/recreate same identity; default-locale relabel; automatic public fallback                    |
| Exact-locale Giving readiness    | blocked with cause, ready, stale/unknown                                                  | derived from current owner heads; refreshed without owning a transition | stored god Boolean; second enable switch; provider setting becomes authority                        |
| D7 public-Gift admission         | accepting, pausing, paused, recovering, needs attention                                   | D7 command/fence for exact Site                                         | locale/address clears or overrides the Site-wide fence                                              |
| Giving-entry locale presentation | not started, draft, needs review, current, withdrawn/unavailable, terminal source outcome | source-owned revision/review/release/withdraw                           | field fallback; copy interpreted as translation; address issuance publishes                         |
| Address candidate                | suggested/editing, blocked, ready, stale, outcome unknown                                 | private edits/revalidation; final issue or discard                      | reservation on autosave/preview; silent alternative; background issue                               |
| Issued address lifecycle         | current, route-unavailable, Stopped terminal                                              | adverse availability; compatible recovery; explicit Stop                | rename/reassign/redirect/release; preference treated as lifecycle; automatic Stop                   |
| Sharing preference head          | absent, one current exact-locale target, clearing/stale outcome                           | issue/replacement or adverse clear through exact CAS                    | two preferred targets; fallback selection; changing literal route resolution                        |
| Language alternative             | eligible, omitted, stale projection                                                       | derived from current source heads; refresh/remove adverse-first         | guessed sibling URL; disabled promise; locale-home fallback                                         |
| Pre-admission donor navigation   | exact locale page, explicit alternative navigation, new-admission unavailable             | user-selected semantic link; server revalidation                        | automatic redirect; arbitrary query/state copy; silently changed task                               |
| Admitted checkout                | frozen operation states owned by contribution/payment                                     | owner-supported in-place presentation-locale change                     | navigate to another address; create duplicate operation; alter currency/provider/financial identity |

## Current behavior, intended behavior, and permanent path

| Area                           | Current behavior on `develop`                                                                                                    | Intended D14 behavior                                                                                                | Best permanent path                                                                                                                     |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Site context                   | `PublicRequestContext.siteId` remains `null`; host resolution is tenant-first.                                                   | Exact trusted Tenant/environment/Site/locale context.                                                                | Complete/reconcile the Phase 2 host→Site→tenant and Phase 24 locale contracts before address writers.                                   |
| Donor language                 | Shared site configuration is English-oriented and no exact public locale route authority ships.                                  | Literal address always serves one exact locale.                                                                      | Canonical locale catalog plus fallback-free public resolver and correct HTML language/direction.                                        |
| Checkout locale                | A nullable reserved `locale` may be supplied through the draft/query handoff and is not derived from an issued address.          | Address supplies exact display-locale context but never trusts wire locale for authority.                            | Server resolves address identity, revalidates entry/scope, and passes a supported presentation request after admission.                 |
| Giving links                   | CMS/public pages can store raw href text and current handoff code builds `/checkout?...` query URLs.                             | Stable reference resolves to an issued exact-locale `/give/{slug}` address.                                          | D10–D14 route authority plus ADR-0029 reference-not-copy; leave unproved legacy literal links literal.                                  |
| Slug generation                | Some CMS creation code strips non-ASCII and adds internal ID suffixes.                                                           | D11 preserves staff-approved native-script/public-safe words and never silently suffixes.                            | One versioned Unicode/route profile with preview, advisory confusable checks, atomic claim, and no provider slug authority.             |
| CMS localization               | No accepted runtime exact-locale Page model ships. Payload localization would fall back by default if enabled.                   | Exact whole-presentation reads with fallback disabled.                                                               | Merge or supersede proposed Phase 22/23 contracts, qualify exact Payload behavior, and keep provider mechanics behind a shared port.    |
| Locale publication proposals   | PR #1323/#1340 propose independent exact-locale revisions/releases/generations but remain open and review-required.              | D14 consumes accepted final contracts only.                                                                          | Reconcile their final accepted forms with D14; never treat open ADR text as shipped authority.                                          |
| Search/language alternatives   | No D14 equivalence manifest exists.                                                                                              | Only true current exact-locale equivalents appear.                                                                   | One manifest drives public links, canonical/hreflang/sitemap metadata, cache, and health; search remains conditional.                   |
| Database/RLS                   | No D14 locale-enable/address schema or RLS policies exist. Current privileged CMS paths and nullable seams are not D14 proof.    | Structural exact-scope constraints plus layered authorization.                                                       | Additive migrations, explicit grants, operation-correct RLS, poison tests for privileged paths, and one authoritative command service.  |
| Nonprofit/provider comparables | Blackbaud/Fundraise Up expose locale parameters/browser rules; provider support and custom copy vary.                            | Core issues stable exact addresses and keeps donor choice explicit.                                                  | Borrow clear staff language/locale settings; reject query-only identity, browser override of literal links, incomplete plugin fallback. |
| QR/share                       | No locale-exact immutable Core artifact contract ships.                                                                          | Exact address, language label, backup URL, no repointing.                                                            | Source-owned immutable artifact generation after issuance with destination verification and D13 placement handling.                     |
| Financial identity             | Tenant Stripe/settlement is operationally separate, while some current handoffs accept nullable currency/locale transport hints. | Every Tenant retains its own Stripe account under the owning finance contract; Site/locale/address never selects it. | Freeze/re-prove finance facts in contribution admission; keep locale and currency as independent presentation/economic axes.            |

## Adversarial category review

Every requested category has a material concern if the founder answer remains
the informal phrase **independent address per Giving-enabled locale**. The
amendments above control those concerns. None requires replacing the founder's
direction.

### 1. Problem validity, necessity, and alternatives

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                                    | Why it matters                                                                                                                                                  | Severity | Likelihood | Evidence or reasoning                                                                                                                                                                                                             | Effect on answer                                                                                           | Permanent fix                                                                                                              | Exact language                                                                                                   |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Core could solve a real multilingual-sharing problem with a second locale-Giving toggle and a large negotiation platform. The strongest alternative is one neutral URL plus a chooser. | Duplicate controls burden small teams; a negotiated URL lowers link count but makes literal sharing, preview, caching, placement, and support nondeterministic. | High     | High       | **Repository fact:** D6/D7 already keep Site-level Giving independent and own admission. **External fact:** Google recommends distinct language URLs; W3C explains negotiation is imperfect and recommends a clear user override. | Narrows the choice to distinct exact-locale addresses over derived readiness; no second admission Boolean. | Use the existing Site-level Giving authority, sparse exact-locale presentation readiness, and deliberate D10/D11 issuance. | **D14-R1, R4, R20:** separate facts; no `locale_giving_enabled`; no general negotiation or translation platform. |

### 2. Brittleness

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                          | Why it matters                                                                                                                          | Severity | Likelihood | Evidence or reasoning                                                                                                                                                                                                                                             | Effect on answer                                                    | Permanent fix                                                                                                                                         | Exact language                                                                             |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| An unprefixed address could silently change language when the Site default changes; Next.js, CDN middleware, cookies, or `Accept-Language` could negotiate a different page. | A printed permanent URL would stop being reproducible and could present the wrong language or disclosures without any visible redirect. | Critical | High       | **Repository fact:** D11 leaves locale placement open but freezes address meaning; Phase 2 has a broad generic fallback. **External fact:** Next.js supports browser-language routing as framework capability; Google warns against automatic language redirects. | Keeps Option 1 but requires the literal URL to freeze exact locale. | Bind stable Site-locale identity/catalog version in the allocation; exclude browser/default/framework state from route resolution and cache identity. | **D14-R2–R3, R10, R16:** default/browser/provider changes never reinterpret an issued URL. |

### 3. Technical debt

**Material concern exists: yes.**

| What could go wrong                                                                                                                                          | Why it matters                                                                                                            | Severity | Likelihood | Evidence or reasoning                                                                                                                                                                             | Effect on answer                                                       | Permanent fix                                                                                                                                               | Exact language                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Raw locale strings, separate route registries, copied alternate URLs, mutable status Booleans, and provider fallback code could proliferate across surfaces. | Canonicalization and lifecycle changes would drift, creating duplicate routes, stale links, and ownerless repair scripts. | High     | High       | **Current behavior:** Core already carries `en_US`, `en-US`, nullable locale, and raw URL seams. **Repository fact:** ADR-0029 prohibits copy/sync ownership; D10/D11 define one route authority. | Requires extension of existing owners, not another localization stack. | One canonical Site-locale identity/profile, one D10/D11 route command, stable references, rebuildable projections, and no stored derived readiness Boolean. | **D14-R3, R7, R15, R20:** singular owners and versioned adapter boundary. |

### 4. Edge cases

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                                                                                      | Why it matters                                                                                                                     | Severity | Likelihood | Evidence or reasoning                                                                                                                                                                                | Effect on answer                                           | Permanent fix                                                                                                                                             | Exact language                                            |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| A locale may be public while Giving copy is draft; Site admission may be paused while the page is current; the default may change; tags may be deprecated; script/region variants may differ; a sibling address may stop during a click. | Without explicit outcomes, teams will invent fallback, hide a useful page, stop the wrong address, or create duplicate identities. | High     | High       | **Repository fact:** D7–D13 deliberately separate serving, admission, allocation, preference, Stop, and placement. **External fact:** BCP 47 includes script/region and canonicalization complexity. | Expands Option 1 with an explicit state/transition matrix. | Treat every axis independently; exact canonical locale; derived alternatives; current reproof; reversible unavailability versus terminal Stop/retirement. | **D14-R2–R3, R8–R12, R16** and the lifecycle table above. |

### 5. Footguns

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                                                                 | Why it matters                                                                                    | Severity | Likelihood  | Evidence or reasoning                                                                                                                                                                          | Effect on answer                                                | Permanent fix                                                                                                                               | Exact language                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Site publication, **Publish all languages**, copy translation, provider locale, autosave, or availability check could issue a route; switching could carry amount/session data; a collision could auto-append `-2`. | Staff could create a permanent public or financial effect while performing ordinary content work. | Critical | Medium-High | **Repository fact:** D11 bans draft reservation, auto suffix, and background issuance; proposed Phase 23 bans publish-all and fallback. **External fact:** provider defaults commonly do both. | Removes ambiguous controls while preserving the simple journey. | One locale-named final action; no address before atomic issue; preserve candidate; clean canonical language link; no arbitrary state carry. | **D14-R5–R6, R11–R12, R18:** deliberate issuance and explicit donor navigation only. |

### 6. Tenant safety

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                                            | Why it matters                                                                                       | Severity | Likelihood | Evidence or reasoning                                                                                                                           | Effect on answer                                    | Permanent fix                                                                                                                                              | Exact language                                                             |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Locale rosters, language alternatives, collision feedback, cache keys, QR inventories, staff counts, or timing could reveal another Tenant, Site, restricted ministry, or private translation. | Existence can itself be sensitive; a public or staff projection can leak even if base rows have RLS. | Critical | Medium     | **Repository fact:** D9–D13 require non-enumeration and privacy-safe absence; Core's safety priority covers restricted missionary/public facts. | Requires projection-level isolation, not UI hiding. | Server-derived exact scope, public-eligible alternatives only, uniform foreign collision text, non-enumerating counts/cursors/errors, hostile cache tests. | **D14-R10–R11, R14–R17:** hidden resources contribute no existence signal. |

### 7. Database, RLS, and authorization safety

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                                                                                 | Why it matters                                                                                                                                        | Severity | Likelihood  | Evidence or reasoning                                                                                                                                                                                        | Effect on answer                                              | Permanent fix                                                                                                                                                                                                           | Exact language                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| A caller-selected locale, mutable scope column, weak FK, app-only unique check, `USING` without `WITH CHECK`, table-owner/view/service-role bypass, or privileged Payload/worker path could move or expose an address across scope. | One bad mutation can permanently bind a donor link to the wrong Tenant, Site, locale, or Giving purpose; service privilege is not business authority. | Critical | Medium-High | **Current behavior:** no D14 schema exists and CMS has privileged paths. **External fact:** PostgreSQL owners/BYPASSRLS can bypass RLS; Supabase requires grants plus policies and `security_invoker` views. | Blocks implementation on convention or provider access alone. | Immutable server-derived scope; same-scope composite integrity; canonical uniqueness; one preferred head; explicit grants; `ENABLE/FORCE RLS`; correct `USING`/`WITH CHECK`; hardened functions/views and poison tests. | **D14-R14–R16:** database and every privileged path enforce identical scope and current authority. |

### 8. Overengineering

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                            | Why it matters                                                                                                         | Severity | Likelihood | Evidence or reasoning                                                                                                                                                  | Effect on answer                                           | Permanent fix                                                                                                                                               | Exact language                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- | -------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Core could add fallback graphs, locale × currency matrices, translation vendors/memory, per-field workflow, a route DSL, draft reservations, or a generic redirect/QR service. | Speculative architecture would make the basic ministry task harder and duplicate Phase 17/22/23/finance/source owners. | High     | High       | **Repository/proposed evidence:** exact-locale content owners deliberately reject mixed fallback and generic workflow; D6 says optional capabilities stay independent. | Narrows Option 1 to the smallest complete permanent model. | Stable Site locale + sparse exact presentation facts + ordinary D10/D11 issuance + derived alternatives; measure before adding an owner-specific extension. | **D14-R7, R20:** explicit non-goals and no new localization platform. |

### 9. UX/UI and user friction

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                                              | Why it matters                                                                                                             | Severity | Likelihood | Evidence or reasoning                                                                                                                                                                            | Effect on answer                                                     | Permanent fix                                                                                                                                             | Exact language                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Technical tags, flags, empty tabs, a giant locale matrix, opaque readiness percentages, generic **Publish**, or several lookalike enable toggles could make staff publish/share the wrong thing. | Occasional nonprofit staff need consequence clarity; donors lose trust when the language or purpose differs from the link. | High     | High       | **External fact:** W3C says flags do not map to languages and alternative controls must be discoverable; comparable CMSs expose locale statuses but also demonstrate fallback/publish-all traps. | Requires the full source-owned locale-card journey, not a schema UI. | Single-locale quiet mode; responsive cards; native/staff names; separate Website/Giving/Address facts; one action; exact URL/preview; persistent receipt. | **D14-R18–R19** and the complete staff/donor journeys above. |

### 10. Source of truth, ownership, and domain invariants

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                    | Why it matters                                                                                             | Severity | Likelihood | Evidence or reasoning                                                                                                                                                | Effect on answer                                             | Permanent fix                                                                                                                                        | Exact language                                                     |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Site locale, Page release, Giving readiness, address, preference, D7 admission, Designation, currency, and Stripe could become a shared mutable “locale setup” record. | Dual ownership lets presentation changes move money or operational changes rewrite public content/history. | Critical | High       | **Repository fact:** platform boundaries and ADR-0029 keep CRM/Giving operational truth distinct from CMS presentation; D1 makes Site presentation/attribution-only. | Sharpens, rather than rejects, independent locale addresses. | Keep owner records singular; encode cardinality, immutable scope, one preferred head, permanent allocation, and no financial inference structurally. | **D14-R1–R3, R7–R9, R15** plus the ownership/invariant maps above. |

### 11. Hidden coupling

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                                                        | Why it matters                                                                                   | Severity | Likelihood | Evidence or reasoning                                                                                                                                                              | Effect on answer                                  | Permanent fix                                                                                                                                          | Exact language                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| Locale could implicitly select currency/country/Stripe, default locale could own routes, SEO could become address authority, Page publication could issue, or D13 placement could define sibling identity. | A harmless translation/default/search edit would gain financial or permanent-route blast radius. | Critical | High       | **Founder/repository fact:** Site/locale never owns financial identity; D11 locale public base is unresolved but address meaning is immutable; search and placement are consumers. | Requires one-way dependencies and negative tests. | Versioned locale/address pins; finance reproof at admission; search/placements derive from route truth; no reverse write; no default-locale authority. | **D14-R2–R3, R7, R12–R13:** locale is presentation context only. |

### 12. Failure modes

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                                           | Why it matters                                                                                                                 | Severity | Likelihood | Evidence or reasoning                                                                                                                                                                                  | Effect on answer                                                 | Permanent fix                                                                                                                                                                    | Exact language                                                                                |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Route claim may commit while the release becomes stale; the response may be lost; public alternate/search/cache may lag; a provider may not support the locale; authority may be unavailable. | Staff might share a wrong/dead link, retry into a second allocation, or see false green while donors receive another language. | Critical | Medium     | **Repository fact:** D10–D13 separate authoritative writes from projections and require durable receipts. **External fact:** Stripe supports a finite explicit locale set; CMS/provider state can lag. | Adds safe partial/unknown outcomes; does not weaken determinism. | Reprove inside command; commit one receipt; resolver gates favorable use on exact current presentation; read back unknown outcomes; omit uncertain alternatives; never fallback. | **D14-R4, R6, R8, R10, R16–R17:** prior safe generation survives and failure names its owner. |

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                                                | Why it matters                                                                                                                         | Severity | Likelihood | Evidence or reasoning                                                                                     | Effect on answer                                                      | Permanent fix                                                                                                                                                                | Exact language                                                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Default change versus issue, publish versus withdraw, two slug claims, A→B→C preference, Stop versus click, locale retirement, canonicalizer upgrade, duplicate delivery, or deploy skew may race. | Individually valid actions can jointly create two preferred addresses, reuse a path, expose stale content, or return the wrong locale. | Critical | High       | **Repository fact:** D7–D13 all require append-only versions, CAS, semantic idempotency, and no fallback. | Requires explicit fences and state transitions before implementation. | Pin all relevant heads; deterministic lock/CAS order; one transaction for allocation/preference; semantic receipt identity; adverse-first projection; forward-only recovery. | **D14-R6, R8–R9, R16** and the lifecycle table; no blind retry or rollback rewind. |

### 14. Data integrity risks

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                                                   | Why it matters                                                                                                  | Severity | Likelihood | Evidence or reasoning                                                                                                                                          | Effect on answer                                            | Permanent fix                                                                                                                                                            | Exact language                                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `en-US`/`en-us` duplicates, deprecated aliases, a guessed historical default, cloned addresses, several preferred heads, wrong sibling links, or stale metadata can corrupt identity and attribution. | Once printed/shared, bad route meaning is expensive or impossible to repair without breaking D9–D12 continuity. | Critical | Medium     | **External fact:** RFC 5646/IANA require canonicalization and support deprecated subtags; **current behavior:** Core lacks one exact locale-address authority. | Adds canonical identity/version and structural constraints. | Stable locale ID, canonical tag/profile, immutable allocation, exact uniqueness/cardinality, source-proved migration, checksums/reconciliation, no inferred equivalence. | **D14-R2–R3, R9, R13, R15, R20:** invalid states cannot be written. |

### 15. Security and privacy risks

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                                                                                        | Why it matters                                                                                     | Severity | Likelihood | Evidence or reasoning                                                                                                                                                                                                                                                                   | Effect on answer                                                       | Permanent fix                                                                                                                                                       | Exact language                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- | -------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| A native-script slug may reveal a restricted location/person, Unicode confusables may spoof, unpublished locales may enumerate, arbitrary query carry may expose donor data, and raw language headers may become fingerprinting telemetry. | Giving URLs, logs, QR files, caches, and analytics are durable public/operational egress surfaces. | Critical | Medium     | **Repository fact:** Phase 10/D11 require approved public-safe copy and privacy/security profiles. **External fact:** Unicode confusable detection is advisory/versioned; WCAG requires programmatic page/part language while W3C i18n recommends correct direction and bidi isolation. | Keeps native language support but bounds it through explicit profiles. | Approved public-safe source copy; D11 advisory checks; bidi isolation; no hidden roster; allowlisted query carry only; redacted/minimized logs/analytics/retention. | **D14-R5, R10–R12, R14, R17–R19:** privacy-safe by construction, not blanket ASCII. |

### 16. Scalability and performance risks

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                                  | Why it matters                                                                             | Severity | Likelihood  | Evidence or reasoning                                                                                                                                                                          | Effect on answer                                                      | Permanent fix                                                                                                                                                                            | Exact language                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | -------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Site × locale × Giving entry × historical address rows, N+1 sibling checks, dense empty readiness records, `Vary: Accept-Language`, or unbounded staff/source scans may grow poorly. | Multilingual larger Tenants amplify storage, cache fragmentation, latency, and noisy work. | High     | Medium-High | **Repository reasoning:** D11/D13 require bounded indexed route/placement work. **External fact:** browser-language variation complicates discovery/caching; providers use finite locale sets. | Adds a sparse/indexed performance shape without invented launch caps. | O(1) canonical route lookup; indexed current preferred/sibling projections; sparse started locales; paginated inventory; no header-varying Giving content; production-shaped benchmarks. | **D14-R10, R15–R17, R20:** measure p50/p95/p99 and certified cohort capacity before activation. |

### 17. Operational burden

**Material concern exists: yes.**

| What could go wrong                                                                                                                                  | Why it matters                                                                                        | Severity | Likelihood | Evidence or reasoning                                                                                                                        | Effect on answer                                | Permanent fix                                                                                                                                                     | Exact language                                                         |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | -------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Every configured locale could create empty rows, URLs, tasks, alerts, QR files, translation chores, and direct-database/provider repair obligations. | Small ministry teams cannot operate a localization platform, and healthy language work becomes noise. | High     | High       | **Repository fact:** D6 makes additional locales/Giving independently optional; proposed Phase 23 keeps one-locale UI quiet and rows sparse. | Makes locale addresses opt-in and cause-driven. | Create no address/work until staff starts the exact need; derive quiet cards; group source work; one cause-owned recovery; no global matrix/task spam/SQL repair. | **D14-R1, R4, R18, R20:** sparse work and simple source-owned journey. |

### 18. Observability and auditability gaps

**Material concern exists: yes.**

| What could go wrong                                                                                                                                              | Why it matters                                                                                                                 | Severity | Likelihood | Evidence or reasoning                                                                                                                                           | Effect on answer                                                   | Permanent fix                                                                                                                                                                | Exact language                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| A provider/CMS status or log line may say “published” without proving locale, route, preference, current presentation, actor, or what a donor actually received. | Staff cannot explain incidents or safely repair wrong-language/cache/switch failures; technical logs are not business history. | High     | High       | **Current behavior:** no D14 durable history exists; some CMS audit is logger-oriented. **Repository fact:** D10–D13 require receipts and distinct convergence. | Adds durable business records plus privacy-safe technical signals. | Immutable issue/preference/Stop receipts; exact head/provenance; source events; wrong-locale/redirect/stale-target/projection-lag metrics; staff-visible freshness/recovery. | **D14-R6, R16–R17:** authority, observation, and projection remain distinct. |

### 19. Dependency and integration risks

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                                                                     | Why it matters                                                                                                              | Severity | Likelihood | Evidence or reasoning                                                                                                                                                                                             | Effect on answer                                             | Permanent fix                                                                                                                                                                                   | Exact language                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| IANA/CLDR changes, Next.js auto-routing, Payload default fallback/experimental status, Stripe locale limits, CMS provider publishing behavior, CDN/search behavior, or QR vendor redirects may redefine Core semantics. | External dependencies evolve and some defaults directly conflict with exact locale, immutable address, or source ownership. | High     | High       | **Live fact:** PRs #1323/#1340 remain unmerged. **External fact:** Payload fallback is on by default; Stripe locale and currency are separate; CMS/nonprofit platforms have incomplete/different locale behavior. | Blocks adapter activation until exact conformance is proved. | Pin/version locale and provider behavior; shared exact-locale port; disable fallback/auto-routing on issued paths; provider-neutral exports/readers; finite adapter registry and kill switches. | **D14-R3, R7, R10, R13, R16, R20:** providers consume, never own, address or locale truth. |

### 20. Migration, rollout, and upgrade risks

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                                                   | Why it matters                                                                                                                | Severity | Likelihood | Evidence or reasoning                                                                                                                                                                  | Effect on answer                                                      | Permanent fix                                                                                                                                                                                                        | Exact language                                                                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Legacy locale-neutral/query checkout URLs could be assigned from current default or majority traffic; old/new code may disagree; rollback may collapse divergent locale facts or release allocations. | Existing donor links could silently change language/meaning, and new durable writes make a destructive down migration unsafe. | Critical | High       | **Current behavior:** no exact locale route model; raw `/checkout?...` and nullable locale seams exist. **Repository fact:** proposed exact-locale contracts are not merged authority. | Requires evidence-classified additive migration and forward recovery. | Readers/negative occupancy first; inventory; fixed-locale proof binds once; negotiated/ambiguous/unproved routes remain reserved, quarantined, and privacy-safe absent; N/N-1 compatibility and allocations survive. | **D14-R20:** never infer from URL text, title, country, currency, browser, provider, traffic, or current default; no speculative chooser route. |

### 21. Testability, traceability, and proof

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                                        | Why it matters                                                                                               | Severity | Likelihood | Evidence or reasoning                                                                                                                                             | Effect on answer                                                        | Permanent fix                                                                                                                                                                          | Exact language                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | -------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Words like “enabled,” “current,” “compatible,” “same Giving purpose,” and “ready” could pass unit tests while glossary, ADR, PRD, OpenSpec, tickets, runtime, and donor outcomes disagree. | Engineers would invent fallback, permissions, cardinality, or state-transfer behavior during implementation. | High     | High       | **Repository fact:** D13 explicitly deferred locale compatibility to D14; open PRs depend on a Phase 24 exact-locale contract; current runtime does not prove it. | Requires exact falsifiable criteria and end-to-end trace before coding. | Trace founder answer → glossary → D14 evidence → reconciled ADR/PRD/OpenSpec → design/tasks/tickets → owner/public/database/a11y tests → release evidence; test user-visible outcomes. | **D14-R1–R20** plus all acceptance criteria below; open proposal conflicts must be resolved before implementation-ready status. |

### 22. Other development hazards

**Material concern exists: yes.**

| What could go wrong                                                                                                                                                                                  | Why it matters                                                                                                                           | Severity | Likelihood | Evidence or reasoning                                                                                                                                                           | Effect on answer                                                         | Permanent fix                                                                                                                                                                                               | Exact language                                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| The draft `/fr/donner/...` example contradicts D11; support may override a collision; external DNS may escape Core; “locale retirement” may accidentally invent a second terminal address lifecycle. | Terminology or operational shortcuts can silently undermine a technically correct data model and make historical behavior unrecoverable. | High     | Medium     | **Repository fact:** D11 fixes `/give/`; D10 notes Core cannot control an externally rerouted domain; proposed Phase 23 treats locale withdrawal separately from Page identity. | Corrects examples and narrows lifecycle language; direction still holds. | Keep literal `/give/`; no support collision override; distinguish Core allocation from observed external response; reversible locale withdrawal unless existing Stop/Site-retirement authority is terminal. | **D14-R5, R8, R14, R17, R20:** no new route/lifecycle exception by convention. |

## Required acceptance criteria and proof

The later PRD/OpenSpec and implementation MUST make every criterion below
independently falsifiable. A UI snapshot, mocked worker, provider sandbox, or
unit test alone does not satisfy an outcome that requires real Postgres/RLS,
public routing, accessibility, migration, or production-shaped proof.

### Scope, identity, and ownership

1. Publishing/enabling a Site locale creates no Giving entry, readiness
   override, candidate, address, preference, QR, checkout, provider object, or
   financial mutation.
2. Changing Site-level Giving capability/admission creates no locale content,
   address, Page release, QR, language alternative, or financial identity and
   alone never mutates, hides, stops, unprefers, or reassigns an existing
   address/page/link.
3. D14 introduces no per-locale financial-admission or
   `locale_giving_enabled` Boolean; staff readiness is reproducibly derived
   from source facts.
4. Every issued address resolves to one immutable trusted Tenant,
   environment, Site, stable Site-locale identity/catalog generation, and
   Giving entry.
5. `en-US` casing/alias forms canonicalize to one identity, while configured
   `fr`/`fr-CA`, `pt-BR`/`pt-PT`, `zh-Hans`/`zh-Hant`, and
   `sr-Latn`/`sr-Cyrl` remain distinct; only pinned standards-profile
   canonical equivalents/deprecated preferred values may share identity.
6. Invalid, private-use-only, nonhuman, control-bearing, unsafe-extension, and
   unsupported locale inputs fail before favorable identity or address work.
7. A default-locale, display-name, CLDR, browser, provider, or title change
   leaves every issued address locale and meaning unchanged.
8. Address locale cannot select or change Designation, Source Code, amount,
   cadence, currency, Legal Entity, Tenant Stripe account, settlement, bank,
   receipt issuer, or accounting owner.
9. CMS/Page content uses stable operational references and cannot allocate,
   reconstruct, redirect, reassign, or release an address.
10. Giving/address commands cannot publish Page/Navigation/Communication
    content or advance a public generation; D13 owner preparation remains
    separate.
11. Search, cache, analytics, QR, provider, and staff projections cannot write
    any locale, address, preference, admission, presentation, or finance fact.
12. One behavior-neutral Site remains one identity across languages; no
    per-locale Site is created.

### Address creation, replacement, and staff outcomes

13. A one-locale Site shows one uncluttered Giving page-address journey with
    exact language context and no empty localization dashboard.
14. A multi-locale Site shows responsive locale cards with native/staff names,
    Website/Giving page/Address states and one separate Site-wide New gifts
    status, with one current action; no flags, codes-first matrix, opaque
    percentage, or disabled mystery control appears.
15. A staff member may view only authorized locale/address detail; hidden
    resources add no count, label, owner, timing, cursor, or existence signal.
16. Staff lacking issue authority receive a clean read-only state and one
    accepted owner route; a provider/service/admin role does not silently widen
    capability.
17. **Ready to publish address** appears only after every D14-R4 input and
    current actor capability is server-proved; every blocker names its owner
    and one safe action. D7 pause, Designation/financial admission, and provider
    checkout-language support do not block or stale issuance; they govern only
    the CTA/checkout outcome.
18. Core suggests the final segment from exact-locale approved public copy,
    preserves staff edits, and never silently translates, transliterates,
    truncates, suffixes, claims, or replaces it.
19. The UI shows the complete fixed public base, literal `/give/`, editable
    final segment, exact locale, Giving purpose, and private/unreserved status.
20. Private editing, autosave, suggestion, availability check, preview,
    locale/Site publication, background work, and QR preview consume no route.
21. A collision preserves input, reveals no foreign/restricted owner, offers
    only public-safe optional alternatives, and creates no claim until staff
    deliberately choose and publish.
22. Two genuinely distinct canonical locale public bases can issue the same
    final words; two forms canonicalizing to the same complete address
    serialize to one winner.
23. The final review and button name exact language, address, Site, Giving
    purpose, permanence, and all important non-effects.
24. Successful issuance atomically records allocation/locale/meaning,
    exact-locale preference effect, business audit, durable result receipt, and
    projection outbox or records none; the persistent receipt supplies Copy,
    Test as donor, locale-named QR, and optional D13 review.
25. An exact locale may retain several issued/current replacement addresses,
    but database/service/UI tests prove at most one preferred current address;
    sibling locales do not change.
26. Older current same-locale addresses continue directly under D12; current,
    route-unavailable, and Stop lifecycle are distinct from preferred or
    nonpreferred sharing guidance and never relabelled
    Rename/Delete/Archive/Redirect.

### Donor resolution, language switching, and public metadata

27. The same literal issued URL returns the same exact locale, HTML `lang`,
    base direction, purpose, canonical, and address meaning across browser
    languages, cookies, profiles, IP locations, devices, crawlers, cache
    regions, logged-in/out state, and no-JavaScript use.
28. No issued Giving route performs automatic locale redirect, content
    negotiation, default-language fallback, locale-home fallback, or sibling
    Giving fallback.
29. A visible language link appears only for a structurally same-entry,
    independently issued/current/preferred, current-presentation, safe, and
    eligible target; raw slug/title similarity cannot create it.
30. Missing, draft, withdrawn, stopped, terminal, restricted, stale, or
    authority-unknown targets are omitted from favorable alternatives and fail
    under their exact privacy-safe adverse contract when directly requested.
31. Activating a language link navigates to the target canonical address and
    revalidates scope/meaning; it never constructs the target by string
    replacement or translation.
32. Alternative labels use native names with region/script where useful,
    correct link-level `lang`/direction/bidi isolation, and an understandable
    accessible name; flags are absent.
33. Unknown query strings/fragments, amount, cadence, currency, donor data,
    payment/provider/session/cart/token state do not cross the address switch.
    Only an accepted attribution owner may carry sanitized typed Source Code.
34. Meaningful local pre-admission input is either safely preserved in memory
    under owner revalidation or receives a clear loss warning before
    navigation; D14 never transfers financial state.
35. After checkout admission, language changes cannot navigate to another
    address or create another operation; a supported in-place display change
    leaves all frozen facts identical.
36. D7 Site public-Gift pause keeps an otherwise eligible exact-locale page and
    language relation intact while new admission is honestly unavailable; it
    creates no address lifecycle change.
37. Locale presentation withdrawal makes its routes/alternatives unfavorable
    without another-language fallback or allocation release; restoring the same
    identity can restore only the same address meaning.
38. If Giving pages are indexable, tests prove self-canonical preferred pages,
    only current reciprocal self-inclusive `hreflang`, exact sitemap
    alternatives, no cross-language canonical, and no ineligible locale
    metadata. A nonpreferred page may emit D12's same-locale canonical but emits
    no `hreflang` cluster or sitemap membership of its own; its visible donor
    language links remain ordinary navigation. If pages are not indexable, no
    favorable search claim is emitted.
39. A locale QR encodes the exact immutable issued URL, contains public-safe
    language/purpose/back-up information, is unavailable before issue, and can
    never repoint through a provider.

### Database, authorization, concurrency, and failure proof

40. Same-scope composite relationships, non-null favorable scope, canonical
    uniqueness, one-preferred constraints/heads, immutable history, and
    restricted delete behavior reject every cross-Tenant/environment/Site/
    locale/Giving-entry fixture at the database boundary.
41. Explicit grants and operation-specific RLS prove `SELECT`, `INSERT`,
    `UPDATE`, and `DELETE` separately, including both `USING` and `WITH CHECK`
    so an allowed update cannot move scope or favorable state.
42. Table-owner, `service_role`, `BYPASSRLS`, security-definer/view, direct
    database, Payload Local API, worker, import, support, AI, and repair tests
    cannot bypass current business authorization or reveal another scope.
43. Exposed views obey invoker RLS; definer functions have safe fixed search
    paths and narrow grants; public/anon roles cannot mutate operational
    address records directly.
44. Simultaneous same/different-locale claims, default-locale change, host move,
    locale withdraw, Page release, A→B→C replacement, Stop-first/issue-first,
    capability revocation, and Site retirement have one serialized result and
    preserve every invariant.
45. Duplicate identical commands and lost responses return one durable receipt
    and consume one address; changed locale, entry, candidate, expected head, or
    authority epoch rejects idempotency-key reuse.
46. No provider/network call runs while authoritative route/preference locks
    are held; timeouts cannot leave a partial canonical allocation.
47. A stale preview, dependency change, or lost race preserves private input
    and the prior public generation/preference, identifies the owner cause, and
    offers one safe retry/review/check-result action.
48. Unknown authority yields a no-store unavailable result; known absence uses
    privacy-safe absence; neither is rounded to success or another language.

### Migration, accessibility, operations, and production-shaped proof

49. Legacy inventory distinguishes fixed-locale, negotiated, ambiguous,
    query-bearing, externally managed, and unproved routes. Externals remain
    literal; a fixed-locale route is bound once only from authority evidence;
    negotiated/ambiguous/unproved Core routes remain reserved, nonissuable,
    nonpreferred, quarantined, and privacy-safe absent unless a census-proved
    need receives a separate founder decision. Current default, browser
    traffic, title, country, currency, or content guessing is prohibited.
50. Readers and negative route occupancy land before writers; old/new versions
    coexist safely; writer cohorts and projection adapters have independent
    kill switches; rollback disables new effects but retains every allocation
    and locale fact.
51. Payload fallback is disabled at every exact-locale public/preview/compile
    seam, and contract/static tests reject raw fallback-capable provider reads
    or Next.js automatic locale middleware over issued Giving routes.
52. Keyboard, screen reader, visible focus, native labels, RTL/CJK/long text,
    bidirectional URLs, forced colors, reduced motion, target size, 320 CSS
    pixels, 400% zoom, no-JavaScript, slow/interrupted network, copy/status
    announcement, and recovery journeys pass with no lost information or
    function.
53. Production-shaped tests publish observed Site/locale/entry/address
    cardinality, index/query plans, cache correctness, and p50/p95/p99 route,
    preferred-sibling, staff-inventory, issue, and convergence latency against
    a separately certified launch envelope—never vague “fast/scalable” claims.
54. Representative ministry staff can create/recover a locale address and
    correctly explain its permanence, exact language, collision behavior,
    non-effects, source-owned blockers, and why locale does not choose money;
    donors can identify/switch language without coaching.
55. Trace evidence links each D14 requirement and founder answer through
    glossary, reconciled ADR/PRD/OpenSpec, design/task/ticket, database/service/
    browser test, deployment cohort, monitor, and release receipt without
    contradictory terms, numbers, states, or roles.

## Named production monitors

Anything monitored below has a named signal, threshold, owner, and response.
Safety/identity signals are zero tolerance. Product-friction signals trigger
research and UX correction, never weakened invariants.

| Signal                                            | Threshold                                                               | Owner                           | Required response                                                                                                                                                                                          |
| ------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `giving_address_wrong_locale_response_total`      | Any                                                                     | Giving + Public Runtime         | Declare P0; disable affected favorable route, purge unsafe cache, preserve evidence, and repair forward from authoritative locale/address heads.                                                           |
| `giving_locale_fallback_content_total`            | Any field/page served from another locale                               | Public Runtime + CMS owner      | Remove affected positive generation, disable fallback-capable adapter, prove source reads, and republish only a complete exact locale.                                                                     |
| `giving_language_auto_redirect_total`             | Any issued Giving request redirected/rewritten by language inference    | Public Runtime                  | Disable locale middleware/redirect cohort immediately, purge route/CDN state, and inspect browser/default/provider coupling.                                                                               |
| `giving_address_automatic_locale_issue_total`     | Any address issued without the deliberate locale-named command          | Giving Platform + Security      | Disable new issuance, preserve receipt/audit evidence, identify the unauthorized trigger, and prove zero unintended public/provider effects before restoration.                                            |
| `giving_address_locale_reassignment_total`        | Any                                                                     | Public Route + Security         | P0 identity/isolation incident; stop relevant issue/serve paths, quarantine allocations, preserve audit, and repair without reuse.                                                                         |
| `giving_locale_cross_tenant_detail_leak_total`    | Any roster/collision/URL/count/timing leak                              | Security                        | Contain projection/cache/support surfaces, start privacy incident handling, and add the exact hostile fixture before restoration.                                                                          |
| `giving_locale_financial_inference_total`         | Any locale-selected currency/Legal Entity/Stripe/settlement effect      | Giving + Finance                | P0; stop new admissions in affected scope, preserve operations, restore source-owned finance selection, and reconcile every affected receipt.                                                              |
| `giving_d13_cross_locale_publish_total`           | Any Page/Communication/QR effect to another locale                      | Exact source owner + Security   | Contain the source-owned public/send effect, stop the adapter cohort, preserve immutable evidence, and issue a source-owned correction.                                                                    |
| `giving_address_canonicalizer_disagreement_total` | Any old/new profile disagreement for an active/candidate address        | Public Route Platform           | Halt issuance/upgrade cohort, dual-evaluate inventory, quarantine ambiguous candidates, and activate only after no semantic disagreement remains.                                                          |
| `giving_language_switch_invalid_target_total`     | Any emitted Core link lacking current exact proof                       | Public Runtime                  | Remove/omit the projection adverse-first, reconcile address/preference/presentation heads, and inspect caching/outbox lag.                                                                                 |
| `giving_hreflang_ineligible_target_total`         | Any locally emitted cross-locale/ineligible/nonreciprocal target        | Search owner                    | Remove affected positive metadata/sitemap entries until rebuilt from the exact current equivalence manifest.                                                                                               |
| `giving_locale_issue_outcome_unreconciled_total`  | Any command still unknown after 5 minutes                               | Giving Platform                 | Read back the durable receipt, prevent a second allocation, page the owner, and keep copy/QR/placement actions unavailable until reconciled.                                                               |
| `giving_locale_switch_projection_lag_seconds`     | Above 300 seconds for a current source-head change                      | Public Runtime                  | Reconcile outbox/index/cache; omit uncertain alternatives; investigate capacity/idempotency before widening the cohort.                                                                                    |
| `giving_provider_display_locale_mismatch_total`   | Any donor-visible unsupported/silent provider language substitution     | Checkout/Provider Integration   | Suppress the affected checkout CTA/handoff through its presentation/checkout safety owner, preserve the page/address/language links, and qualify an exact fix without inventing locale-level D7 admission. |
| `giving_locale_address_collision_rate`            | Above 10% over 7 days with at least 50 final claims                     | Giving Product + Route Platform | Review canonicalization/suggestion quality and tenant-safe alternatives; improve guidance, never auto-suffix or weaken permanent uniqueness.                                                               |
| `giving_locale_setup_abandonment_rate`            | Above 20% over 7 days with at least 25 starts, excluding owner blockers | Giving Product/UX               | Run task-based staff research on the failing step/copy, correct the journey, and retain deliberate issuance and owner boundaries.                                                                          |
| `giving_language_switch_click_failure_rate`       | Above 0.5% for 15 minutes with at least 100 clicks                      | Public Runtime                  | Inspect stale target/lifecycle/cache/provider failures; remove invalid alternatives and repair without default-language fallback.                                                                          |

## Ruthless synthesis — strongest path forward

### Required before D14 is recorded

1. Interpret **Giving-enabled locale** as plain-language derived readiness,
   not a second admission toggle.
2. Correct the French example to preserve D11's fixed base-relative `/give/`
   route family.
3. Define exact canonical Site-locale identity and bind every address to it
   immutably.
4. Preserve D12 cardinality: several same-locale historical/current addresses
   may exist, with at most one preferred.
5. Make language switching a current, exact, user-selected relationship with
   no fallback, redirect, guessing, or financial-state carry.
6. Make D13 compatibility exact locale equality, not “close enough” language.
7. State explicitly that locale never selects currency, Legal Entity, Tenant
   Stripe account, settlement, bank, or accounting identity.

This document and the Phase 24 decision log record those amendments. The root
glossary receives the minimum stable terms needed to prevent later ambiguity.

### Required in the later PRD/design

1. Reconcile the final accepted Phase 2/22/23 Site-locale, exact-release,
   public-generation, route, search, and migration contracts with D14.
2. Define the canonical locale catalog/profile, stable Site-locale lifecycle,
   and exact readiness projection without a god Boolean.
3. Specify the D10/D11 address-allocation extension, preference grain,
   structural constraints, grants/RLS, privileged-path defenses, command
   transaction, receipt, and projection outbox.
4. Specify the single source-owned staff journey, capability matrix, blocker
   routing, exact copy, native-label/a11y behavior, no-JS public selector, QR,
   and recovery states.
5. Define optional search metadata from the exact equivalence manifest rather
   than making indexability part of D14.
6. Inventory and evidence-classify legacy URLs; define mixed-version,
   backfill, cohort, kill-switch, roll-forward, and non-destructive rollback
   behavior.
7. Convert all acceptance criteria and monitors above into traceable OpenSpec
   scenarios, implementation tickets, tests, dashboards, alerts, runbooks, and
   release evidence.

### Required implementation order

1. Land/reconcile canonical trusted Site and Site-locale resolution, versioned
   BCP 47 profile, and fallback-free exact-locale public read.
2. Add negative route occupancy and read support for immutable locale-bound
   address manifests before any writer can issue them.
3. Add structural constraints, grants/RLS, current capabilities, command/CAS,
   receipt/idempotency, and privileged-path poison tests.
4. Inventory legacy fixed/negotiated/ambiguous/external addresses; bind only
   proved one-locale identities and keep every negotiated/ambiguous/unproved
   Core route reserved, quarantined, and privacy-safe absent pending a real
   census and separate founder decision.
5. Add the accessible staff locale-card, readiness, candidate, donor preview,
   deliberate issue, and recovery journey for a bounded internal cohort.
6. Activate public exact-locale resolution and D7/Designation/financial
   admission composition with last-known-safe behavior.
7. Add user-selected server-rendered language alternatives, then locale QR/
   share artifacts, then D13 source adapters.
8. Add search/hreflang/sitemap only for separately admitted indexable cohorts.
9. Qualify production cardinality, latency, cache, accessibility, staff/donor
   comprehension, monitors, incident recovery, and rollback before widening.

### Monitor, do not prebuild

- Measure collision and abandonment before changing D11's readable-slug
  default.
- Measure language-switch use/failure and missing-language demand before
  adding preference prompts or more locale operations.
- Measure provider display-locale gaps before building in-house checkout
  localization beyond the owning contract.
- Measure actual locale/address cardinality and query cost before adding
  materialized global matrices or speculative hard limits.
- Every monitored condition uses the named signal, threshold, owner, and
  response above. There is no ownerless “watch this later.”

## Repository and external research synthesis

### Repository facts verified on 2026-08-27

- At evidence capture, Phase 22 PR #1323 and Phase 23 PR #1340 remained open;
  their planning material was treated as proposed evidence, not merged
  authority. Existing D7–D13 evidence remained preserved.
- Root `CONTEXT.md` and D1 define Site as Tenant-owned public presentation and
  attribution context. Site, locale, and address never own Giving/financial
  identity.
- Accepted `openspec/specs/platform-boundaries/spec.md` keeps Giving and other
  operational truth in CRM/operational owners and public content/publication in
  CMS. Sensitive effects remain server-side and capability-scoped.
- Accepted
  [`ADR-0029`](../../adr/0029-reference-not-copy-cms-operational.md) requires
  CMS to store stable operational references plus presentation—not copied
  Giving, money, or identity truth—and makes operational truth win on drift.
- Accepted
  [`ADR-0026`](../../adr/0026-public-website-surface-in-donor-app.md) reserves
  `/give` as a public route family. D11 later makes it the fixed Giving-owned
  base-relative route root.
- Phase 2's older requested → Site default → `en-US` fallback is a broad
  contextual default, and its dated amendments allow narrower purpose owners.
  D14 expressly prohibits that fallback for issued Giving-address resolution
  and historical interpretation.
- D6 keeps the core public website launch independent from Giving and
  additional locales. D7 gives Site-wide public-Gift admission exact
  `Tenant × environment × Site × public_checkout` authority and keeps it
  separate from serving and finance. D9–D12 establish privacy-safe absence,
  no Giving redirects, permanent reservation, D11 readable slugs, direct
  continuity, per-scope preference, and terminal Stop. D13 keeps placement
  writes with their source owners and deferred exact locale compatibility to
  D14.
- Current runtime does not implement D14: `PublicRequestContext.siteId` remains
  `null`; donor metadata uses one English-oriented config; checkout has only a
  nullable reserved locale transport field; raw CMS links and current
  `/checkout?...` handoffs are not issued locale identities; no locale router,
  exact `hreflang`, D14 schema, or locale-address RLS exists.
- Current CMS slug creation can strip non-ASCII and append internal ID material.
  That behavior is migration evidence and conflicts with D11's permanent
  native/public-safe staff choice; it is not reused as D14 authority.
- Open PR
  [#1323](https://github.com/Asymmetric-al/core/pull/1323) proposes sparse
  independent exact-locale public ministry revisions/releases and no fallback.
  Open PR [#1340](https://github.com/Asymmetric-al/core/pull/1340) proposes a
  bounded exact-locale Page model, fallback-disabled reads, language-named
  actions, current public generations, and exact search alternatives. Both are
  open, mergeable, blocked, and review-required, so they are proposed evidence
  until merged or superseded.
- Live Phase 22/23 issues explicitly depend on Phase 24 canonical locale,
  lifecycle, exact resolution, and cohort facts. That confirms D14's need but
  also blocks truthful runtime implementation until those contracts are
  reconciled.

### Current external and comparable evidence

- [Google multilingual-site guidance](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)
  recommends a different URL per language, warns that dynamic/browser-language
  variation may not be crawled, recommends user-controlled language links, and
  says to avoid automatic language redirects. It permits localized UTF-8 URL
  words but does not require translating Core's `/give/` route root.
- [Google canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
  recommends self-referential canonicals and a canonical in the same language
  for `hreflang`; canonical and alternate-language relationships are separate.
  [Google localized-version guidance](https://developers.google.com/search/docs/specialty/international/localized-versions)
  requires real, reciprocal alternate URLs.
- [W3C language-negotiation guidance](https://www.w3.org/International/questions/qa-when-lang-neg)
  explains that negotiation can be helpful but is imperfect because browser
  settings may be missing, wrong, or shared. Its
  [translated-page guidance](https://www.w3.org/International/questions/qa-site-conneg.en.html)
  recommends discoverable alternatives on each page and demonstrates native
  labels using `lang`, `dir="auto"`, and bidirectional isolation. Its
  [link-language guidance](https://www.w3.org/International/questions/qa-link-lang.en)
  says flags represent countries, not languages.
- [RFC 5646 / BCP 47](https://www.rfc-editor.org/info/rfc5646/), the
  [IANA Language Subtag Registry](https://www.iana.org/assignments/language-subtags-tags-extensions),
  and [Unicode LDML/CLDR](https://unicode.org/reports/tr35/) establish canonical
  language-tag, alias, script, region, and versioned display-name behavior. A
  permissive CMS locale string is not enough for permanent address identity.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) requires programmatically
  determinable page/part languages, keyboard/focus/input predictability,
  accessible status, target-size support, and reflow. W3C's
  [Reflow explanation](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
  ties 320 CSS pixels to 400% zoom.
- [Next.js internationalization](https://nextjs.org/docs/app/guides/internationalization)
  supports subpath/domain locale routing and browser-language selection. Those
  are framework capabilities, not Core product authority; issued `/give`
  routes must bypass automatic locale redirects.
- [Payload localization](https://payloadcms.com/docs/configuration/localization)
  uses field-level localization, enables fallback by default, permits loose
  locale codes, and exposes experimental localized status. Core must explicitly
  disable fallback and keep Payload behind its exact-locale owner port.
- [Contentful locale-based publishing](https://www.contentful.com/help/localization/locale-based-publishing/),
  [Sanity localization](https://www.sanity.io/docs/studio/localization), and
  [Storyblok internationalization](https://www.storyblok.com/docs/concepts/internationalization)
  show real needs for independently managed locale work, but also demonstrate
  provider-specific fallback, publish-all, flag, and default-language traps.
- [Blackbaud's current French donation-form guidance](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/en-ca/content/donfm-languages.html)
  allows an explicit locale URL parameter to override browser language and warns
  that add-ins may not translate. This validates exact donor-language control
  but also shows why query parameters and provider completeness cannot be Core
  address/readiness authority.
- [Fundraise Up localization](https://fundraiseup.com/docs/localization-settings/)
  separates organization-enabled interface languages from campaign-specific
  custom content, supports region variants/RTL, and offers several browser/URL/
  query detection paths. Core borrows separate staff-facing readiness but
  rejects browser/query override of a literal issued address.
- [Stripe Checkout Session documentation](https://docs.stripe.com/api/checkout/sessions/create)
  exposes locale as an IETF display-language parameter, while
  [Stripe multi-currency documentation](https://docs.stripe.com/payments/checkout/localize-prices)
  separately governs presentment currency. This supports D14's strict rule that
  language is not currency or Stripe-account authority.
- [PostgreSQL RLS documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
  distinguishes `USING`/`WITH CHECK` and notes owner/BYPASSRLS behavior.
  [Supabase Data API security](https://supabase.com/docs/guides/api/securing-your-api)
  requires grants and RLS as separate layers, while
  [Supabase RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security)
  covers `security_invoker` views and service-role bypass. D14 therefore
  requires both structural scope and privileged-path proof.

### Evidence limits and unresolved unknowns

- No primary evidence proves that a readable localized slug or separate locale
  address increases completed donations. That remains a founder UX judgment,
  not a conversion claim.
- No representative Core ministry staff or donors were observed completing
  this proposed journey during D14. Task comprehension and friction therefore
  require the usability gate and named product monitors.
- Core production has no D14 locale-address cohort from which to infer
  cardinality, collision, switching, provider mismatch, or latency. Launch
  limits must come from measured qualification, not invented numbers.
- External CMS/nonprofit/payment behavior is comparative evidence only. It
  cannot override accepted Core ownership, no-fallback, permanent-address, or
  tenant-safety decisions.
- At D14 recording, exact locale placement in the public base remained
  unresolved. D15 subsequently fixed the default-inclusive collision-proof
  `/lang/{lowercase-exact-locale}` Site Locale Public Base while preserving
  D14's exact locale meaning.
- The final accepted Phase 22/23 exact-locale and public-generation contracts
  may differ from their open PR text. Implementation must reconcile the merged
  result instead of coding against this snapshot.

## Documentation and ADR status

- Root glossary defines **Site Locale** and **Exact-locale Giving Address** and
  updates Issued/Preferred address and Core-managed placement language to exact
  locale scope.
- This document is the full D14 founder/adversarial evidence. The Phase 24
  decision log contains the concise ratified record and the next single
  question.
- D14 narrows Phase 2's generic locale fallback for issued Giving addresses and
  supplies the exact locale contract deferred by D13.
- D14 is an ADR candidate because it freezes permanent public identity,
  ownership, fallback, and route behavior. Creating an accepted ADR, Phase 24
  PRD, OpenSpec change, design/tasks, tickets, schema, migration, or runtime
  code requires the separately invoked specification workflow.
- Runtime implementation remains blocked on accepted Site/Site-locale and exact
  public-generation contracts plus the route/authorization/migration proof
  above. That does not block recording the founder decision.

## Next dependent decision — D15 (subsequently resolved)

### Plain-language context and impact

D14 says every Giving address permanently belongs to one exact Site Locale.
D11 says that locale belongs to the **Site-locale public base**, before Giving
adds its fixed `/give/{slug}` route. D15 therefore had to choose one public-base
strategy for ordinary Pages, Navigation, Giving, canonical/`hreflang`/sitemap,
cache identity, and public generations together—not a Giving-only prefix.

If the default language gets no visible locale segment, an English Page and
Giving address can stay short:

```text
hope.org/about
hope.org/give/clean-water
```

But both must remain English when Hope Missions later makes French its default.
That is safe only with permanently pinned route meaning and creates one hidden
default-language exception across every public route owner.

An explicit segment for every Site Locale is slightly longer but gives the
whole public Site one visible rule:

```text
hope.org/lang/en-us/about
hope.org/lang/en-us/give/clean-water

hope.org/lang/fr-ca/a-propos
hope.org/lang/fr-ca/give/eau-potable
```

Staff still edit only the Page path or final Giving words; Core supplies the
fixed locale public base. Donors, visitors, staff, support, caches, and search
can identify which exact representation a URL names.

Current `develop` has no D10/D11 Issued Giving Address cohort. If a prior
D10/D11-issued unprefixed cohort is later discovered, only an address with
authoritative exact-locale binding and continuing D12 eligibility keeps that
exact meaning and works directly. Negotiated, ambiguous, or unproved legacy
Giving routes remain reserved/quarantined and privacy-safe absent under D14.
Ordinary Page routes retain their own source-owner continuity contract. Nothing
in D15 authorizes a Giving redirect, chooser, or relabel. D15 subsequently
selected an explicit default-inclusive base and, after collision review, fixed
the grammar to `/lang/{lowercase-exact-locale}`.

Google treats subdirectories on one generic domain as easy to set up and low
maintenance; separate locale domains require more infrastructure. Neither
Google nor Next.js chooses Core's product rule, so this remains a founder
decision.

### Options

1. **Every Site Locale gets an explicit segment across all public routes —
   recommended.** Examples: `hope.org/lang/en-us/about` and
   `hope.org/lang/en-us/give/clean-water`, alongside
   `hope.org/lang/fr-ca/a-propos` and
   `hope.org/lang/fr-ca/give/eau-potable`. This creates one visible invariant and a
   later default change cannot reinterpret a route. The cost is a slightly
   longer default-language URL.
2. **The default Site Locale is unprefixed; additional locales get a segment
   across all public routes.** Examples: `hope.org/about` and
   `hope.org/give/clean-water`, alongside `hope.org/lang/fr-ca/a-propos` and
   `hope.org/lang/fr-ca/give/eau-potable`. This keeps the common routes shortest but
   requires permanent default-route pins and extra alias, collision, migration,
   cache, and source-owner continuity cases.
3. **Each Site Locale uses its own domain or subdomain across all public
   routes.** Examples: `en.hope.org/about`,
   `en.hope.org/give/clean-water`, `fr.hope.org/a-propos`, and
   `fr.hope.org/give/eau-potable`. This supports deliberate regional brand
   separation, but as a default adds DNS, verification, certificates,
   canonical/search, incident, migration, and staff-management burden.

### Recommendation

Choose Option 1. A public Site and its permanent Giving links benefit more from
one visible, predictable invariant than from saving one path segment. The staff
UX remains simple because locale is a fixed base supplied consistently by every
source owner; staff edit only meaningful Page/Giving words.

### Exact question

Should every Site Locale—including the default—use an explicit locale segment
in one public base consumed consistently by Pages, Navigation, Giving, search,
cache, and public generations, or should the default locale remain unprefixed?

## D76 reconciliation (2026-08-30)

A moved hostname does not turn one Site Locale's Giving identity into another
Site's locale address. Every source locale address retains its own exact owner
outcome/reservation. The destination needs independently issued Site-locale
Giving addresses after its own readiness; D76 cannot infer them from matching
locale tags, paths, Designations or Tenant scope.
