# Phase 2 — Site, Locale & Currency Foundation

> SiteStacker Parity Program · Phase 2. Charter and matrix: `docs/prds/sitestacker-parity/`.
> This PRD is the buildable synthesis of the Phase 2 grill (decisions D1–D13). Glossary terms
> **Site**, **Entry Method**, and **Source Code** are defined in the repo-root `CONTEXT.md`.

**Status:** Groomed; tracked by epic #477 + children.
**Retitle note:** the original working title was "Tenant, Site, Channel, Locale, and Currency Primitives."
Grilling removed two words: _tenant_ already exists as the canonical product boundary (nothing to build),
and _channel_ was demoted from a boundary to an attribution tag. The phase is therefore
**Site, Locale & Currency Foundation**.

> **Current-code references** in this PRD (symbol names, expressions, line numbers) describe the repo
> as of authoring and **may drift** with refactors. They are grounding aids for pricing, not durable
> contracts — the behavior described is what matters.

---

## Problem Statement

Asymmetric.al is about to build the money and public-content depth that a missions organization
depends on: the giving ledger, receipts, contribution batches, accounting exports, public giving
pages, and gift triggers. Today the platform can only express **one** public website per tenant, in
**one** currency (US dollars, with a money type that silently assumes two decimal places), in
**one** language (English, hard-coded), and it records **almost nothing** about _where_ a gift came
from beyond the tenant.

If we build the ledger, receipts, and public pages on top of that, we bake those single-value
assumptions into money and content records that are expensive and dangerous to change later. In
plain terms:

- An organization that wants to run **more than one website** (a second brand, a regional site)
  cannot, and retrofitting a "which site" scope onto historical gifts and pages after the fact is a
  painful migration.
- The money type divides every amount by 100 to display it. That is **wrong** for real currencies
  (¥500 is `500`, not `50000`; Bahraini dinar has three decimal places), so the first non-USD gift
  would be mis-charged or mis-displayed — a money-correctness bug, the least forgivable kind.
- Receipts, reports, accounting exports, and gift triggers all need to know a gift's **site**, its
  **currency**, the **language it was rendered in**, and **what drove it** (which appeal) — and only
  a fraction of that is captured today.

The organization, its finance staff, its missionaries, and its donors all inherit these gaps
downstream: reports that cannot distinguish sites, receipts that cannot prove the language or
currency they were issued in, and no honest way to attribute giving.

## Solution

Introduce the **foundational primitives** — before the ledger, not after — so that later money and
content work can reference them without a schema refactor, while deliberately **not** building the
full management product yet.

Concretely, Phase 2:

1. Makes **Site** a first-class entity: one tenant owns **one default site plus optional
   additional sites**, each with its own domain(s), branding, language (locale), and public giving
   entry points. The existing single public website becomes that tenant's default site.
2. Fixes money at the **type** level: amounts stay integer minor units, but a **currency-aware**
   formatter/parser replaces the hard-coded division by 100, backed by a small **currency-metadata**
   primitive (decimal exponent per ISO-4217 code plus documented special cases) and ISO-4217
   validation.
3. Treats **locale** and **currency** as **facets of a site** (not a new hierarchy of tables), and
   reserves the audit stamps Phase 7 (Receipt & Statement Compliance Rules + donor-identity/credit
   model) needs (`rendered_locale` on receipts and messages).
4. Captures giving **attribution** on four orthogonal axes — **site** (where), **entry method**
   (how it entered), **source code** (what drove it), **designation** (what it is for) — dropping
   the ambiguous generic "channel."
5. Wires per-site **branding** end-to-end so multiple branded websites under one tenant actually
   render, editable through the existing Web Studio (Payload) shell.
6. Keeps the **checkout flow unchanged** — per-site difference is a theming layer — and leaves the
   **donor portal** Tenant-scoped rather than Site-scoped. Phase 24 D57 gives
   that portal exactly one current verified Tenant Donor Portal Host per
   environment; every Site enters the same Tenant account experience, and no
   Site host becomes authenticated authority. Phase 24 D58 gives that account
   experience one stable Tenant Donor Account Brand; the Default Site and entry
   Site never reskin it. Phase 24 D59 gives each public Site complete immutable
   Site Brand Versions as bounded presentation inputs; the applicable public-
   Site release authority pins one exact qualified version without creating a
   second serving head or live inheritance.
7. Updates the durable **OpenSpec** language from "the public tenant website" (singular) to "one or
   more sites per tenant," so governance matches the model.

What Phase 2 deliberately does **not** build: the multi-site management Studio, an i18n/translation
engine, a live multi-currency giving launch, FX conversion, per-site payment accounts, receipt
compliance, accounting exports, gift triggers, and domain verification. Those are named,
seam-reserved, and deferred to the phases that consume them.

Because nothing is in production yet (all current data is mock/demo), Phase 2 builds the **correct
target shape from the start** — proper constraints, `NOT NULL` scope keys, currency-aware money —
rather than a cautious, reversible, production-safe migration.

---

## User Stories

**Organization & multi-site**

1. As an **organization**, I want to operate more than one public website under a single account, so
   that a second brand or regional site does not require a separate tenant or a schema rebuild.
2. As an **organization**, I want every tenant to always have at least one default site, so that
   there is never an ambiguous "no site" state for content or gifts.
3. As an **organization**, I want my existing single website to become my default site automatically,
   so that nothing I have today breaks or disappears.
4. As an **organization**, I want each site to carry its own domain(s), so that different websites
   resolve from different addresses.
5. As an **organization**, I want a site to be a presentation-and-attribution boundary beneath the
   tenant — not a separate billing account, tenant, or payment identity — so that money and identity
   stay consolidated at the organization.

**Admin / staff (Mission Control & Web Studio)**

6. As a **staff admin**, I want to see a read-only list of my tenant's sites (name, domain(s),
   default locale, currency, branding), so that I can confirm the configuration without opening the
   database.
7. As a **content editor**, I want to edit a site's branding (name, logo, brand colors, tagline) in
   Web Studio, so that each website looks distinct without a developer.
8. As a **content editor**, I want my content edits to be automatically scoped to the correct site,
   so that I never accidentally publish one site's page onto another.
9. As a **staff admin**, I want site domain, locale, and currency shown but **read-only** for now, so
   that higher-risk settings are visible but not accidentally changed before their management phase.
10. As a **content editor**, I want each page's slug to be unique **per site** (not per tenant), so
    that two sites can both have an `/about` page without colliding.
11. As a **staff admin**, I want branding changes I make in Web Studio to appear on the live public
    site, so that editing is a real, verifiable loop.
12. As a **staff admin**, I want every branding change captured in history, so that I can see who
    changed what — reusing the CMS's built-in versioning rather than a new audit system.

**Finance / money correctness**

13. As **finance**, I want money amounts stored in each currency's correct minor unit (not a blind
    division by 100), so that a yen or dinar amount is never mis-charged or mis-displayed.
14. As **finance**, I want the currency of every gift validated against a real ISO-4217 list, so that
    a typo like "banana" or a wrong code can never enter the money records.
15. As **finance**, I want every money record — including campaigns (which lack a currency today) —
    to carry a validated currency, so that no money record is missing or unvalidated.
16. As **finance**, I want each gift to record the site it came from, so that later reports and
    accounting can be grouped and filtered by site.
17. As **finance**, I want the reporting-currency and exchange-rate-snapshot fields reserved now
    (populated later from the payment provider), so that multi-currency reporting never forces a
    money-schema refactor.
18. As the **organization**, I want each financial operation to freeze the
    exact Legal Entity and its effective Settlement Account Binding, while a
    single-entity tenant quietly preselects its default, so that adding sites
    never fragments payouts and later multi-entity activation never requires
    rewriting historical money. _(Amended 2026-07-27 by Phase 20 D3.)_

**Attribution**

19. As **finance**, I want each gift to carry four independent attribution facts — which site, how it
    entered, what appeal drove it, and what it is for — so that reports and triggers are precise, not
    muddled under one "channel" field.
20. As a **staff analyst**, I want a gift's entry method drawn from a fixed vocabulary
    (public checkout / portal / offline / import / api / admin / legacy), so that "online vs offline
    vs imported" is a trustworthy breakdown.
21. As a **marketer**, I want a gift to capture a source code from its giving link, so that I can
    later attribute giving to a specific appeal, email, QR code, or promotion.
22. As a **security-conscious operator**, I want source codes sanitized, length-capped, and
    formula-injection-safe, so that a crafted giving link cannot inject content into a finance CSV.
23. As **finance**, I never want a historical gift to claim an appeal it did not have, so that
    unknown attribution stays honestly null rather than fabricated.
24. As a **staff analyst**, I want a recurring gift's attribution inherited by each of its future
    charges, so that "this monthly gift came from appeal X" persists over time.

**Locale**

25. As the **organization**, I want each site to declare a default locale and its allowed locales in
    BCP-47 form (e.g. `en-US`, `es-MX`), so that language support is a property of the site.
26. As **finance/compliance**, I want each receipt and system message to record the locale it was
    rendered in, so that a future Spanish receipt can prove it was issued in `es-MX`.
27. As an **engineer**, I want locale resolution documented per purpose, so that fallback is never
    guessed: non-public contracts retain their owner-approved requested → site default → `en-US`
    order, while Phase 24 public Site routes, shell, Navigation, CMS content, search, sitemap,
    canonical, and `hreflang` use the exact requested Site Locale and never cross-language fallback.
28. As the **organization**, I do **not** want a translation engine or localized content in this
    phase, so that we do not build i18n machinery for languages that do not exist yet.

**Donor & missionary experience**

29. As a **donor**, I want the checkout to look and behave the same regardless of which site I gave
    on, with only branding differing, so that giving stays a coherent, trustworthy experience.
30. As a **donor**, I want to see the site's brand (name, logo, colors) that matches the website I am
    on, so that the giving page feels native to that ministry.
31. As a **donor**, I want my giving history in the portal to show **all** my gifts across every site
    of the organization, so that multi-site never fragments my record.
32. As a **donor**, I do not want internal attribution (which appeal/site) surfaced to me, so that my
    experience stays clean; that data is for staff.
33. As a **missionary**, I want my supporter and support views to stay normalized at the tenant, so
    that multi-site does not fragment how I see who supports me.

**Migration, governance, engineering**

34. As an **engineer**, I want the default site auto-created per tenant and existing content/gifts
    backfilled to it, so that the model is consistent from day one.
35. As an **engineer**, I want the host→site resolver to be a boundary-safe query in `packages/api`
    shared by both the public site and the giving path, so that resolution is consistent and never
    imports CMS internals into the giving code.
36. As an **engineer**, I want every new site-scoped column created `NOT NULL` with a default-site
    default, so that there is never an ambiguous "no site" row and later queries never special-case
    null.
37. As a **future maintainer**, I want the durable OpenSpec to say a tenant may operate one or more
    sites, so that no one reading the spec concludes the product is single-site.
38. As a **future maintainer**, I want the "site is a first-class child of tenant, introduced before
    the ledger" and "currency-aware minor units" decisions recorded as ADRs, so that the surprising
    choices have durable rationale.
39. As an **engineer onboarding a real customer later**, I want an honest import path (entry method
    `import`/`legacy`, null source code) reserved now, so that migrated SiteStacker history is not
    dressed up with fake precision.
40. As a **product owner**, I want a demonstrable end state — two branded sites on two domains under
    one tenant, both able to give — so that "multiple websites per tenant" is proven, not just
    schematized.

---

## Implementation Decisions

### Architecture rulings (the spine)

- **A1. Site is a first-class entity, a child of tenant ("C-lite").** One tenant → one default site
  - optional additional sites. A site absorbs what SiteStacker splits into "site" and "site channel"
    (domain + branding + language + content + public giving entry) into a single row. Phase 2 does
    **not** build SiteStacker's two-tier `site → site-channel` nesting or premature
    `site_locales`/`site_currency_settings` hierarchies — **locale and currency are facets of the
    site**, matching how Shopify Markets and Contentful model per-market/per-locale as facets of one
    site rather than separate sites. Phase 24 D66 later normalizes stable `site_locales` as A1a's
    bounded repeated-facet exception because immutable identity/public history no longer fit a
    scalar/array; it remains a facet, not another Site level. (ADR-worthy — see ADRs.)
- **A1a. Settings-as-facets, generalized (the D9 rule).** A site setting that needs a home before the
  phase that consumes it lives as a **typed column on `public.sites`**, never in a premature
  `site_*_settings` table. The "facets, not a hierarchy" rule extends to _all_ pre-phase site
  settings, not just locale and currency. This is the recorded justification against adding a
  generic `site_settings` table when the next setting arrives. A later owning phase may normalize
  a bounded repeated child aggregate only when scalar columns cannot express its cardinality and
  the phase supplies exact relational, lifecycle, concurrency, and authorization invariants.
  Phase 24 D64's versioned Site Suggested Amount Sets are that narrow exception; they do not create
  EAV/JSON settings, another Site level, or permission for arbitrary `site_*_settings` tables.
  **Phase 24 D66 amendment (2026-08-30):** stable Site Locale identity, immutable
  `/lang/{locale}` allocation, independent public history, and one current
  locale-exact Public Site Generation can no longer be represented safely by
  `default_locale` plus `allowed_locales[]`. Phase 24 therefore normalizes one
  bounded repeated `site_locales` aggregate as A1a's explicit exception. It
  remains a Site facet—not a nested Site/channel hierarchy or generic settings
  table—and stores no translation bodies, readiness checklist rows, percentages,
  Giving/message/payment state, or second serving head.
- **A2. Legal Entity owns financial identity; site owns presentation.** Tenant
  remains the outer isolation boundary, but merchant, settlement owner, legal
  issuer, and accounting owner are roles of the canonical Phase 7/20 **Legal
  Entity**. Every financial root freezes `legal_entity_id`; an effective-dated
  **Settlement Account Binding** connects that entity to the exact Stripe
  Connect account/environment. The ordinary one-entity tenant sees no selector:
  its seeded default entity prefills setup, but persistence never falls back to
  a mutable tenant default. A Site declares presentment currency and locale as
  display facets and never selects a merchant through a
  `payment_account_ref`. Phase 2 still constrains the launch path to
  presentment currency = the resolved settlement currency; Phase 24 may later
  activate additional donor presentment, while Phase 20 D20 governs certified
  settlement lanes. Adding a second Legal Entity is explicit and must not
  silently split a cart, change an old gift, or follow a Site boundary.
  _(Amended 2026-07-27 by Phase 20 D3/D20; supersedes the 2026-07-11
  tenant-account and reserved site-override wording.)_
  _(Clarified 2026-07-26 by Phase 20 D20: Phase 20 may consume exact
  downstream provider-conversion and settlement evidence, but it does not
  widen this transaction allowlist. Phase 24 alone may later activate
  additional donor presentment currencies.)_
  _(Clarified 2026-07-30 by Phase 21 D6: Site currency, donor presentment,
  and Phase 20 settlement evidence neither create, select, nor define a Field
  Account or its default. Phase 21 alone owns the explicit Legal-Entity Default
  Field Account Currency Version and each prospective, source-family-specific
  Field Account Currency Activation Version. Once that authority exists, D6 may
  consume separately qualified Phase 20, provider, or bank evidence as the exact
  target-currency admission basis; consuming evidence never transfers account-
  identity or default authority to Phase 2 or the evidence source.)_
  _(Clarified 2026-08-30 by Phase 24 D61: a Site owns one explicit default and
  a bounded enabled Donor Presentment Currency ceiling for new giving intent.
  The donor-visible set is the payment-owner-derived intersection with current
  exact Tenant, environment, Legal Entity, Settlement Account Binding,
  connected-account, route/cart, frequency, amount, and payment-method
  qualification. One trusted coarse country may suggest a member only for an
  empty intent; locale, browser language, URL, profile, Site default, provider
  global support, or client input never authorizes it. Manual donor choice is
  still server-revalidated and freezes one currency for the entire accepted
  gift intent. D61 adds no payment account to Site, no FX engine, no retained
  settlement lane, and no Checkout Sessions dependency.)_
- **A3. Dual representation in one database.** Payload and Supabase share a **single Postgres**
  (Payload in schema `cms`, app data in `public`; the Payload DB URL falls back to the Supabase DB
  URL). So a site is represented by `public.sites` (operational source of truth: identity, tenant
  FK, currency/money facets, and default flag — the row that gifts' `site_id` points at) and a
  `cms.sites` Payload collection (presentation: branding, content scoping) sharing the **same UUID**.
  Fields are **disjoint** and it is one database, so there is **no cross-database sync engine** — it
  mirrors the existing tenant dual-representation (Supabase-authoritative, Payload aligned on login).
- **A4. Domains are operational Site facets, not CMS fields.** The resolver is a boundary-safe
  Supabase query in `packages/api` shared by both the public site and the giving path, never
  importing Payload (which the data-access boundary forbids in the giving code). Web Studio shows
  domains **read-only** in Phase 2; domain verification and management are deferred. Note: today's
  resolver is host→**tenant** only (it has no concept of a site, which does not yet exist in the
  repo); Phase 2 introduces host→**site**→tenant resolution as a **new** capability, not a relocation
  of existing site logic.

  **Phase 24 D72 supersession:** domains do not remain scalar/array fields on `public.sites`.
  Operational Domain authority owns relational exact-host bindings with one current Primary Site
  Domain and optional non-website-serving Redirect Site Domains. Provider/DNS/TLS facts are evidence only;
  CMS and `public.sites` may expose read-only projections but are not role write authorities. Exact
  physical table/column names remain for the Phase 24 implementation spec.
  Because Core environments use isolated Supabase databases, V1 Tenant-controlled public roles are
  production-only unless one platform-wide cross-environment hostname-claim authority lands first;
  nonproduction uses protected private preview hosts.

  **Phase 24 D73 amendment:** replacing an existing Primary Site Domain always binds one explicit
  former-primary website disposition in the same immutable Domain role successor. It also prepares
  compatible successors for the exact current public Site Locale origin heads; no scalar Site field,
  provider assignment, apex/`www` relation, migration, or historical redirect may infer the result.
  Independently source-owned routes remain independently owned, and stopping website use is not
  provider detachment or hostname release.

  **Phase 24 D74 amendment:** one exact Tenant-controlled custom hostname may later disconnect
  through a separate Tenant self-service command only after a complete current finite owner
  manifest proves no positive hosting dependency. The authoritative transition first establishes
  an adverse Disconnecting barrier, then reconciles exact Core-controlled provider removal outside
  the database transaction, and only after current authenticated absence ends the current Site-
  binding interval and global occupancy claim. Canonical hostname identity, immutable history, and
  D9–D15 reservations survive. DNS, registration, renewal, email, provider-account ownership,
  and cross-host cascade remain separate authorities; future fresh claims follow D75/ADR-0196.

  **Phase 24 D75 amendment:** after D74 final release, every Tenant uses the same Add domain flow
  only after a Core-owned seven-day exact-host DNS-control challenge. An unproved attempt is private,
  nonexclusive, provider-dark, and reserves nothing. One transaction consumes fresh proof, acquires
  the platform-wide current claim, and creates a new private binding generation; old bindings are
  never retargeted. No former positive state follows, while D9–D15 adverse reservations remain.
  Provider attachment, TLS, DNS routing, Site readiness, and public role activation are later gates.

  **Phase 24 D76 amendment:** an exact still-connected custom hostname may move between two Sites
  in the same Tenant/environment through one prepared successor without D74 release, D75 claim,
  routine DNS proof, or mutation of the old binding. Destination role is explicit; an active source
  Primary requires a different qualified replacement; D6/D73 and every D9–D15 owner retain their
  authority. One acknowledged adverse Moving generation precedes append-and-advance of the private
  global host head plus both Sites' complete Domain/public heads. Launch is a provider no-op on the
  shared donor project and may expose only a bounded neutral gap, never two favorable Sites.

  **Phase 24 D77 amendment:** before that Moving generation, D76 consumes one
  immutable authority digest produced from the existing small code-owned critical
  owner-family registry and complete source/destination effective-host route
  manifests. Critical unknown blocks. Source-only ordinary addresses compile
  durable not-found effects into the new binding generation, target-only
  addresses retain their owner effect, exact collisions require owner action,
  and only an already owner-qualified successor may continue. The comparison is
  derived proof, not another route owner, adapter framework, resolver, redirect
  table, or provider rule.

  **Phase 24 D78 amendment:** one D77 different-identity collision may continue
  only through the ordinary Page owner's directional, exact-address,
  revision-bound General Page successor qualification. Source and target Site
  identities remain distinct and immutable; qualification neither moves nor
  copies a Page. Exact Tenant/environment/Site/locale/family/public/safety/
  route generations remain mandatory. Same-path direct service requires the
  target Primary; a Redirect Site Domain remains redirect-only to the Primary.
  Missing/stale/rejected proof remains not-found and D78 adds no provider or
  money effect.

  **Phase 24 D79 amendment:** before D76 activation, D78 remains bound to the
  exact reviewed target release. After activation, each relation pins one
  sparse, opaque target General Page/locale Page Purpose Continuity Version. A
  changed candidate effective Page release, including exact meaning-bearing
  localized/shared/Reusable Section/reference dependencies, explicitly
  preserves the current version or declares that D80 must create a fresh
  independent private Page. D80 leaves the source version/relations unchanged
  and the target inherits none. Site, locale, Page family,
  audience, Reach, safety, route,
  binding, and publication remain separate owner facts; D79 introduces no
  tenant-authored purpose field/taxonomy, provider/money effect, or second Site/
  Page identity.

- **A5. Attribution = four orthogonal axes, no generic "channel."** `site_id` (where), `source`
  represented canonically as **entry method** (how it entered), `source_code` (what drove it), and
  designation (fund/campaign, what it is for). Phase 13 owns those axes on committed contributions;
  Phase 15 captures them only on pre-commit batch rows; Phase 16 freezes them on commitment terms
  and occurrence snapshots. The word "channel" is retired as a gift field to avoid its three-way
  ambiguity: SiteStacker "site channel" = our _site_; `campaigns.channel` remains a distinct
  **communication medium**; marketing origin = _source code_. Existing `donations.source` and
  `donations.campaign_id` columns are historical migration/removal evidence only and are not
  repurposed as the target contract.
- **A6. Pre-production posture.** No production data exists, so build the **correct target shape**
  with proper constraints (`NOT NULL` `site_id` defaulting to the tenant's default site, enum/check
  constraints, currency-aware types) and let the demo seed conform. No staged nullable-then-tighten
  migration, no dry-run report, no dark-launch gate — those protect live systems we do not have. The
  honest-import pattern (`entry_method = legacy`/`import`, `source_code = null`) is reserved for
  future real-data onboarding, not for mock data.

### Deep modules (built to be tested in isolation)

**Module 1 — Currency (money type + `currency_metadata` + validation).** Home: `packages/api`
(importable by both giving and CMS paths; no CMS imports). Encapsulates all currency-special-case
knowledge behind a stable, boring interface so the rest of the codebase never divides by 100 again.

- Interface (shape): `minorUnitExponent(code) → 0 | 2 | 3`, `formatMoney(minorUnits, code) → string`,
  `parseMoneyToMinorUnits(input, code) → integer`, `isSupportedCurrency(code) → boolean`,
  `assertTransactable(code, tenantSettlementCurrency)`.
- `currency_metadata` primitive: ISO-4217 code → decimal exponent +
  special-case flags for the documented Stripe exceptions (the
  ISK/UGX/HUF/TWD charge-vs-payout quirks; the three-decimal currencies).
  **Source of truth is a TS constant in `packages/api`, mirrored to a seed
  table** so canonical server-side owners such as Phase 13 contribution
  acceptance and Phase 7 facts validation can look up exponents and reject
  unknown codes at the DB boundary. Legacy donation-saga/receipt-formatting
  callers are migration/removal evidence, not target owners. The metadata is
  comprehensive (a correctness lookup for any currency).
- **Transaction allowlist ≠ metadata:** the set of currencies a gift may transact in is, in Phase 2,
  **exactly the tenant's settlement currency**. `currency_metadata` stays comprehensive; the
  allowlist is narrow and honest about un-launched capability.
- This module replaces the current cents assumption in the donate path (the code multiplies the
  incoming amount by 100 to derive minor units).

**Phase 24 D61 activation boundary.** Phase 24 may widen the transaction
allowlist only through a server-owned, source-labelled qualification for the
exact current financial route and complete gift context. The canonical money
value is always checked integer minor units plus ISO currency; presentation
formatting also consumes an explicit canonical locale but never infers currency
from it. D61 cannot launch while any amount entry, preset, fee calculation,
minimum/maximum, review, provider adapter, recurring term, confirmation,
receipt, refund, history, staff/reporting projection, or idempotency path still
uses floating major units, `×100`, two-decimal formatting, implicit USD, or a
caller-authorized currency. JPY, BHD, ISK, HUF, TWD, current Stripe limits, and
lossless provider round-trip are release evidence, not optional later polish.

**Phase 24 D62 setup-qualification boundary.** Selecting another currency in
the Site's existing Currencies setup automatically asks the Payments owner for
one versioned, source-labelled **Donor Presentment Currency Qualification**;
Phase 2 stores no caller-authored or CMS-authored `ready` flag. The setup check
may prove only the stable offering cohort available before a donor exists:
exact Tenant, live environment, Site financial route, Legal Entity, effective
Settlement Account Binding, connected account and charge topology, ISO
currency, current giving mode/cadence family, at least one admissible rail,
canonical money-pipeline generation, and pinned provider-contract evidence.
Actual destinations, amount, method, donor/issuer eligibility, and current
provider execution are re-proved by the accepted checkout command.

The check is declarative and side-effect-free: it creates no PaymentIntent,
SetupIntent, Customer, subscription, charge, refund, settlement/accounting
record, or provider configuration change, and test-mode evidence never
qualifies a live Site. Initial activation requires at least one qualified
route; a partial result names its exact current mode and a default currency
must cover every current entry that relies on that default. Unknown, stale,
contradictory, unavailable, or mismatched evidence does not qualify. Provider
reads happen through the Payments adapter outside the Site-policy transaction;
the final authorized save atomically compares the Site-policy revision and
exact qualification generations before changing the complete default/enabled
set. Physical table, queue, cache, refresh duration, and provider API shape stay
implementation design rather than Phase 2 authority.

**Phase 24 D63 transition boundary.** A donor-requested change from one
qualified Donor Presentment Currency to another is a new monetary revision of
the same still-mutable gift intent, never an FX calculation or accepted-money
edit. A pristine intent changes without warning. If any amount, preset,
fee-cover decision, derived total/claim, payment selection/input, authorization,
client secret, or provider session exists, the original currency and every
field remain unchanged until the donor confirms the exact loss. The server then
re-proves the complete target-currency cart and preserves only an explicit
allowlist of currency-independent purpose, cadence, attribution, identity/
contact, tribute, consent, and form intent whose meaning remains valid. Every
currency-denominated or provider-dependent field clears by default; no numeric
digits, rate, rounding, or fee equivalence carries forward.

The canonical cart model therefore permits an absent `amount_minor` only on a
mutable draft line whose currency is explicit. Ready-for-review, accepted,
provider-bound, recurring, contribution, receipt, refund, ledger, and
accounting states require the owning phase's checked positive integer minor
amount and exact current limits. The authoritative acceptance boundary rejects
any line without a valid target-currency amount. Phase 2 freezes no physical
nullable-column strategy, provider-object update/replacement choice, dialog
component, or preset source; it requires the semantic distinction so preserving
purpose never requires preserving or fabricating money.

**Phase 24 D64 native-suggestion boundary.** Operational Postgres owns one
optional immutable, versioned Site Suggested Amount Set for each exact Tenant,
Site, ISO currency, and `one_time` or exact Phase 16 recurring cadence. Repeated
values are a normalized bounded Site child aggregate under A1a, not scalar
`public.sites` columns, a generic settings blob, CMS content, or another Site
hierarchy. Each reviewed current set contains zero to six unique positive
integer-minor-unit amounts with the set currency and canonical exponent. No
suggestion is selected automatically. Values outside the applicable current
amount envelope, ambiguous grouping under the authenticated staff UI locale,
duplicates, excess precision, overflow, or a seventh value reject atomically.
The staff locale is the authoring-parser authority and supplies a visible input
example; the explicit Site/public locale formats preview/donor output but never
reinterprets stored integer Money.

Every value is entered in its target currency. Core performs no authoring-time
or runtime FX, rounding, ordinal mapping, cross-currency/cross-frequency digit
copy, or live inheritance. Preset existence never enables a currency, creates a
cadence, proves a payment route, changes a minimum/maximum, or supplies accepted
money. D61/D62 and Phase 16 own those facts; Phase 13 accepts the donor's exact
chosen Money. An authorized D64 save is the review and creates a prospective
successor under expected revision—no Payload publication workflow or new
approval engine. For an otherwise qualified context, missing or intentionally
empty sets mean custom amount only.
Deliberate currency/cadence policy disablement preserves versions but retires
their public use; a later policy re-enable must explicitly reaffirm former
values through a successor before they return. A transient payment-
qualification pause preserves the reviewed policy and follows D62 recovery
without fabricating custom eligibility.
Physical version/head tables remain an implementation-design choice, but same-
Tenant/Site composite integrity, one current head per exact scope, immutable
history, direct-DML revocation, FORCE RLS with complete `USING`/`WITH CHECK`,
and service-path parity are not optional.

**Module 2 — Site context resolver (host → site → tenant).** Home: `packages/api` (boundary-safe
Supabase query; no Payload import), shared by the CMS public API and the giving path. This is a
**new** capability — today's resolver returns a tenant only.

- Interface (shape): `resolveSiteFromHost(host) → { site, tenant } | null`,
  `defaultSiteForTenant(tenantId) → site`.
- Resolution order after D72: exact normalized current Domain binding → explicit bounded private-
  preview subdomain binding → environment-gated dev/local override. A Primary Site Domain may resolve
  favorable Site context; a Redirect Site Domain returns a distinct route-owner-qualified redirect
  decision and never resolves as a serving alias. Unknown production hosts never fall back to a
  Tenant Default Site. Current custom host uniqueness is platform-wide.
- The authenticated donate path derives tenant from the auth context and **defaults `site_id` to the
  tenant's default site**; host resolution is used by the CMS public routes and by the public
  anonymous checkout when it is built (Phase 5 — Public Website Runtime Contract).

**Module 3 — Attribution builder.** Home: `packages/api` (used by the giving path; no CMS import).
Assembles a gift's four attribution axes and hardens the user-controlled input.

- Interface (shape): `buildAttribution({ host, params, authContext, entrySurface }) →
{ site_id, entry_method, source_code }`.
- Entry-method vocabulary (kept separate from gift/commitment type):
  `public_checkout | portal | offline | import | api | admin | legacy`, enforced by the canonical
  owner contract's DB check/enum. **Caller → entry_method mapping** (the `entrySurface` is
  caller-supplied; if it disagrees with `authContext`, the authenticated context wins):
  - authenticated donor portal `/donate` → `portal`
  - anonymous public checkout (Phase 5 — Public Website Runtime Contract) → `public_checkout`
  - staff-entered gift → `admin`
  - offline batch entry → `offline`
  - programmatic API caller → `api`
  - data import/onboarding → `import`
  - pre-Phase-2 / unknown historical → `legacy`
- `source_code`: captured from a **fixed param allowlist** (`t`, `c`, `utm_source`, `utm_medium`,
  `utm_campaign`, `utm_content`, `utm_term`), URL-decoded, trimmed, length-capped, restricted
  character set, and **formula-injection-neutralized for CSV export**. Absent → `null`. Never the raw
  query string.
- Capture policy: **last-touch within the session**; the donor app reads allowlisted params on
  landing and passes them into the `/donate` payload. First-touch/multi-touch/cross-device and a
  durable cart entity are deferred to the giving-cart phase.

**Module 4 — Site provisioning & backfill.** Home: `packages/api` + migration/seed. Idempotent
creation of the default site and conformance of existing (mock) data.

- Interface (shape): `ensureDefaultSite(tenant) → site` (idempotent), plus a migration/seed routine.
- Seeds `public.sites` (operational) and aligns the `cms.sites` Payload document on the same UUID.
  Seeds the default site from the tenant's existing primary domain + locale + settlement currency.
- Backfills existing CMS content to the tenant's default site. There is no production gift data and
  no legacy-gift runtime to preserve: historical `donations.source` values are migration/removal
  evidence only. Any retained fixture conversion maps an unknown historical entry method to
  `legacy`, preserves an explicitly proven `import`, and leaves `source_code_id = null` rather than
  fabricating attribution; target writes go only to the Phase 13/15/16 owner contracts above.
- Seeds the **two-site demo** (two hosts, two brand-color sets, one public home page each) so the
  acceptance test "two domains, one tenant, two brands, both give" can pass.

**Module 5 — Public-Site branding / theming resolver.** Home: shared UI/config consumed by the donor
app (reads the site's public presentation facet; no giving-path or authenticated-account coupling).
Turns a site's branding facet into the tokens an eligible public Site applies, closing the
edit→live loop.

- **Phase 24 D59 amendment (2026-08-30):** the old four-field example is not a set of independently
  mutable live settings. The resolver consumes one exact complete **Site Brand Version** selected
  by the applicable public-Site release authority and returns one serialized same-revision safe
  projection containing its public identity, approved assets, dedicated semantic brand roles,
  approved typography treatment, and code-owned Site-frame choices. Exact persistence and
  field/token names remain for the Phase 24 implementation spec.
- The brand projection uses dedicated centralized semantic brand roles; it never replaces Core's
  neutral, status, focus, form, validation, payment, legal, spacing, radius, breakpoint, or motion
  semantics. A documented fallback uses code-owned safe structure plus the trusted Site text
  identity and never displays Asym, GiveHope, another Tenant, the Default Site, the Tenant Donor
  Account Brand, or another Site as the public brand.
- The donor **public-Site** layout consumes this via a site-config context (replacing the current static
  brand-config import); checkout reads brand tokens instead of hard-coded colors; the footer's
  hard-coded sections become templated. The checkout **flow** is untouched — only theming varies.
  Authenticated, claim, recovery, and account layouts must not consume this resolver or its Site
  context; Phase 24 D58 keeps their Tenant Donor Account Brand stable across every entry path.
- Site branding owns identity/default assets and approved shell presentation only. Page and campaign
  imagery remain CMS content; Navigation owns labels, destinations, order, and visibility; page
  templates own block composition; legal/support owners supply their exact links and disclosures.
  Those records consume the Site brand but cannot create route- or block-local brand overrides.

### Data model

_Scalar Site settings that need a home before their consuming phase are **typed
columns on `public.sites`**, per A1a—not generic `site_\*_settings` tables. D66
Site Locales and D72 Site Domains are normalized repeated facets because their
independent identity, lifecycle, uniqueness, and history require relations._

- **`public.sites`** (operational SoT): `id (uuid)`, `tenant_id (fk, not null)`, `slug`,
  `is_default (bool)`, `default_locale (bcp-47)`,
  `allowed_locales (text[])`, `presentment_currency`, `reporting_currency`,
  `default_designation (nullable)`, `is_active`. No merchant/account selector
  lives on the Site.
  **D72 supersession:** legacy/proposed `primary_domain` and `alias_domains[]` are
  migration inputs/projections only. A relational Domain binding facet owns
  canonical host identity, complete Tenant/environment/Site scope, current
  Primary/Redirect role, lifecycle, immutable history, and globally unique
  current-host occupancy. A publicly activated, nonretired Site has exactly one
  current primary, including during serving suspension; a Redirect Site Domain's
  website role never serves Site website content, while separately authorized
  source-owned routes retain only their own behavior. Exact physical names remain design-owned.
  D74 disconnection ends only the current binding/occupancy interval after an acknowledged adverse
  fence and provider-absence proof; it never deletes the hostname identity or protected history.
  D75 fresh reuse creates a new private binding generation only after an exact Core DNS challenge
  is atomically consumed with the current global claim. Verification attempts are not bindings or
  reservations, and former positive Site meaning never follows the hostname.
  D76 same-Tenant movement retains the current global occupancy, appends a new Site-binding
  generation, and advances the one private current head only after an adverse cutover fence and
  complete source/destination role/public evidence. It never updates an old `site_id`, moves a
  provider project, copies Site state, or reinterprets Giving/auth routes.
  D77 binds that move to one current critical-owner/effective-route authority digest. Historical
  source-only ordinary paths receive explicit negative route effects that survive the new binding
  until their owner publishes a separately qualified successor; later destination content cannot
  claim them from absence, path, slug, similarity, or provider routing.
  D78 defines that sole different-Page exception as one immutable
  source-address-to-target-General-Page owner qualification bound to exact
  reviewed public revisions. It is neither Page equivalence nor a Site/content
  relationship and cannot be symmetric, transitive, inferred, or reused.
  D79 preserves exact revision proof before cutover and then binds each active
  relation to one opaque Page Purpose Continuity Version for the stable target
  Page/locale. A changed effective Page meaning-bearing dependency digest
  explicitly keeps the version or declares that the candidate requires D80's
  fresh independent private Page. D80 never advances the source head, transfers
  D78/D79 state, or rewrites/copies the Site, locale, Page, relation, or owner
  facts. It uses one separately reviewed same-Site D2 placement/path and remains
  private until later ordinary D1 publication; D81 settles the recoverable
  source Working Revision.
  **D66 supersession:** `default_locale` and `allowed_locales` are migration
  inputs/compatibility projections only once Phase 24 lands. Authoritative
  identity moves to same-scope stable Site Locale rows and the sole Default Site
  Locale/Public Site Generation heads. No old and new field may remain dual
  writable.
- **`public.site_locales`** (Phase 24 operational SoT): one stable immutable ID
  under exact Tenant and Site inside one deployment-environment-isolated
  Supabase project/database; canonical BCP 47 identity under a pinned standards
  profile; generated immutable `/lang/{locale}` segment after first public use;
  and private lifecycle metadata. Composite same-scope unique keys and foreign
  keys prevent cross-Tenant/Site relationships. Deployment environment remains
  a trusted command/cache/audit coordinate, not a partially persisted Site key.
  If multiple deployment environments ever share one database, Core must first
  add a non-null environment discriminator to `public.sites` and every dependent
  key/FK in one expand-and-cut-over migration; partial coexistence is forbidden.
  Public release history/head remains with the existing Public Site Generation authority;
  `site_locales` has no `is_ready` or `is_public` Boolean. Delete is restrictive
  after any route, release, default, receipt, or artifact reference.
  **D68 authoring-preference amendment:** a Site may additionally own an optional
  partial order of stable same-Site Site Locale IDs named **Suggested translation
  sources**. It ranks explicit staff Copy/Compare choices only and never changes
  Default Site Locale, Site Locale identity/lifecycle, Translation Basis, public
  alternatives, runtime fallback, or Public Site Generation. The logical value
  requires same-scope membership/unique order and one optimistic revision; the
  later accepted Phase 24 design must choose a structurally constrained representation,
  not another locale-string array or generic settings blob.
  **D69 Copy-head amendment:** a D68-eligible Site Locale may project at most two
  distinct exact logical source heads for one explicit Copy action: the current
  server-acknowledged private Working Revision and the current authoritative
  public source revision. These heads belong to D12 and D1/Public Site
  Generation respectively; they are not `site_locales` columns, a locale
  lifecycle state, a Site setting, a provider-latest pointer, or a scheduled
  third option. Selecting private source work freezes/reuses immutable source-
  owned checkpoint evidence, creates only a private target, and gains no public
  locale authority. D69 adds no physical Site Locale schema until the accepted
  Phase 24 design proves the composed owner/constraint boundary.
  **D70 Copy-qualification amendment:** Copy Qualification and Source Finding
  Summary belong to exact resource revisions and their source owners, not
  `site_locales`. They create no locale-ready/copy-ready flag, allowed-source
  list, Site setting, fallback, publication proof, or repeated locale relation.
  Enabling a Site Locale never qualifies content or fabricates qualification
  evidence.
- **`cms.sites`** (Payload collection): same `id`, `tenant` relationship, content scoping, and the
  CMS-owned Site Brand Version lifecycle (complete drafts, immutable versions, approved same-Tenant
  assets, and source provenance). Presentation only; disjoint from the operational columns. The
  applicable public-Site release authority pins the exact qualified brand version into public
  output; this logical owner does not freeze the physical version-storage shape before Phase 24
  design or create a second serving head.
- **`currency_metadata`** (seed table mirroring the TS constant): `code (pk)`, `exponent`,
  special-case flags.
- **`currency_rate_snapshots`** — **shape reserved, behavior deferred**: sourced later from the
  payment provider's balance transaction (its exchange rate and settled amount/fee/net; both
  presentment and settlement amounts). Nullable when no conversion is needed. If implemented, this
  is a reference to or projection of immutable Phase 20 D9/D20 provider evidence, never a second
  editable rate authority. `sites.reporting_currency` remains a display/reporting preference and
  does not establish QBO home currency or Xero base currency.
- **Canonical owner contracts (no new legacy giving columns):**
  - `site_id` (`NOT NULL`, default = tenant default site) is added to CMS content collections
    (Pages, Navigation, MissionaryGivingPages, ProjectPages).
  - Phase 13 owns committed contribution attribution and money truth. Its cart and append-only
    contribution ledger carry the indexed `site_id`, `entry_method`, `source_code_id`, and
    designation axes plus the accepted contribution currency. Phase 15 may capture and freeze those
    values on an editable batch row only to commit them into Phase 13; it never becomes a second
    committed-gift authority.
  - Phase 16 owns recurring-commitment and fixed-total-pledge intent. Its immutable term versions
    and occurrence snapshots carry their own `site_id`, `entry_method`, `source_code_id`, and
    currency context, then any received gift is represented by a separate Phase 13 contribution.
  - `campaigns.site_id` is **nullable** because a Phase 13 campaign may be tenant-wide or
    site-specific. `campaigns` retains its distinct communication-medium field and gains validated
    currency plus the nullable site reference.
  - Phase 20 owns immutable processor settlement and conversion evidence, including exact
    presentment currency, settlement currency, provider exchange rate, settled amount, fee, and net.
    Phase 2 does not add generic nullable FX columns to every giving record or make
    `sites.reporting_currency` an accounting authority.
  - Legacy `donations`, `staged_gifts`, `donor_pledges`, and `pledge_charge_attempts` names are
    historical migration/removal evidence only. They receive no new normative columns or runtime
    ownership from this phase.
  - Locale/jurisdiction are validated **context facets**, not one shared
    `rendered_locale` authority. Phase 7 freezes the governing locale and
    jurisdiction inputs needed by an official facts version; Phase 18 records
    the actual rendered locale on the immutable generated-document version;
    Phase 17 pins the resolved message/content version and locale; and Phase 6
    records the locale actually dispatched. No owner falls back to a site's
    current `default_locale` when reading historical evidence.
  - **Not** site-scoped (stay tenant-wide): funds/designations, donor/CRM tables, and **Media**
    (Media is already tenant-scoped today via its `tenant` relationship + access hooks; per-site
    asset isolation, if ever needed, is later work — no Media change in Phase 2).

#### Dated Phase 16 amendment — giving time zone (2026-07-13)

Phase 16 (Pledges & Recurring Commitments) adds one required tenant-level
**`giving_timezone`** setting in `org_settings`. It is a canonical IANA time-zone
identifier used only for recurring schedule intent: donor-selected local dates,
occurrence cutoffs, retry candidate dates, and projected dates. It is separate
from Phase 7's `tax_timezone`, because a recurring schedule's civil date and a
gift's legal tax year answer different questions and may legitimately differ.

- Every recurring schedule epoch freezes the effective `giving_timezone`; a
  later tenant-setting change affects new epochs only and never silently moves
  an existing donor's dates.
- Checkout displays the donor's effective giving-zone date before consent. The
  browser time zone, server time zone, Stripe UTC timestamp, settlement time,
  and staff locale are never implicit fallbacks.
- A tenant must choose the setting during onboarding. Missing or invalid config
  fails closed for recurring creation and schedule mutation. Demo/seed data may
  carry an explicit deterministic IANA value, but production code must not hide
  missing configuration behind a US default.
- Reads of historical epochs use the frozen zone even if current tenant config
  is absent. This preserves explainability without permitting new writes.
- Phase 16 owns the one shared civil-date schedule engine and its DST,
  short-month, leap-year, and twice-monthly test matrix; Phase 2 owns only the
  governed tenant setting and validation contract.

- **Reserved message-context contract (D9 shape, resolution deferred):** Phase
  2 supplies validated Tenant, Site, locale, and jurisdiction context to
  downstream communication contracts; it does **not** own message-template
  storage, override priority, or fallback. Phase 17 owns deterministic
  contract-scoped resolution across the allowed Tenant/Site/locale scopes,
  including a tenant-configurable priority, immutable resolved-version
  evidence, the Asym system default as the final fallback, and render-failure
  fallback plus alerting. Phase 7 supplies legal receipt/statement facts only.

### Contracts & wiring (thin, on top of the deep modules)

- **Public-giving acceptance contract:** the public-giving input accepts
  optional `site_id` and `source_code`; the authenticated path defaults
  `site_id` to the tenant default Site and `entry_method = portal`. The Phase 13
  acceptance service validates and freezes all four axes on the canonical
  contribution source revision. Phase 2 supplies context and validation only;
  it neither extends the legacy donation saga nor writes a gift.
- **CMS site-scoping retrofit — the concrete touch-points:**
  1. Introduce host→site→tenant resolution (Module 2) and use it in the CMS public routes.
  2. Add `siteId` to the CMS request context (default-site-aware).
  3. Add the `site` relationship/FK to the site-scoped content collections
     (Pages, Navigation, MissionaryGivingPages, ProjectPages).
  4. Make the public read API routes site-aware (filter by site, not just tenant).
  5. Change page slug uniqueness from per-tenant to per-**site** (composite unique).
  6. Make the create-from-template endpoint accept `siteId`; Web Studio auto-assigns new content to
     the tenant's default site (the multi-site picker is deferred).
- **Admin surfaces:** Web Studio exposes `cms.sites` with **branding editable**, domains/locale/
  currency **read-only**, and **create/delete gated**. Mission Control gets a **read-only** Sites
  list. Permissions and audit reuse Payload's tenant-scoped access hooks and versioning — no new
  permission surface.
- **OpenSpec change (required deliverable):** update `platform-surfaces` from "the public tenant
  website" (singular) to "a tenant may operate one or more sites," and introduce **Site** as a
  first-class entity in `platform-boundaries` / `platform-product-intent`. Update the parity matrix
  and note the SiteStacker "site channel" ≈ Asym "site" mapping for the future import phase.

### ADRs to write

- **ADR: Site is a first-class child of tenant, introduced before the giving ledger; locale and
  currency are per-site facets (not a table hierarchy).** Hard to reverse, surprising against the
  canonical "tenant is the boundary," a real trade-off against SiteStacker's two-tier shape.
- **ADR: Currency-aware minor units over a blanket division by 100.** Encodes the correctness
  decision and the `currency_metadata` source-of-truth (TS constant + seed table).

---

## Testing Decisions

**What a good test is here:** exercise external behavior through each deep module's stable interface
with representative and adversarial inputs, not its internals. Money and attribution are the
highest-value targets because they are correctness- and security-sensitive.

All five deep modules are tested (consistent with the program's all-deep-modules testing
convention, from the tombstoned phase-01 operating-foundation PRD):

1. **Currency module** — two distinct concerns, tested separately:
   - _Metadata + formatter correctness (comprehensive unit tests, no live provider call):_
     `minorUnitExponent`, `formatMoney`, `parseMoneyToMinorUnits` for two-decimal (USD/EUR),
     zero-decimal (JPY/KRW), three-decimal (BHD/KWD, including the "last digit must be 0" behavior),
     and the ISK/UGX/HUF/TWD special cases; round-trip `parse → format` stability. The three-decimal
     "last digit must be 0" rule (real, but not on a citable Stripe page) is a **metadata/formatter
     unit test** here; a **live** three-decimal charge verification is deferred to the phase that
     actually launches a three-decimal currency (nothing in Phase 2 transacts one).
   - _Transactability:_ `assertTransactable` rejects every non-settlement currency in Phase 2, and
     ISO-4217 validation rejects unknown codes.
2. **Site context resolver** — host resolution by Primary Site Domain, distinct route-qualified
   Redirect Site Domain result, bounded platform subdomain, and dev-only override; platform-wide
   host uniqueness; unknown production host without Default-Site fallback; the authenticated
   donate-path default-site path remains separately derived from auth context.
3. **Attribution builder** — entry-method vocabulary enforcement and the caller→entry_method mapping;
   `source_code` sanitization (allowlist filtering, length cap, **CSV formula-injection
   neutralization**, PII/raw-query rejection); default-site assignment for portal/offline/import;
   recurring inheritance.
4. **Site provisioning & clean-start fixtures** — idempotent default-site
   creation; existing CMS content in an approved pre-production reset may be
   assigned to that default Site, but no greenfield gift backfill or legacy
   entry-method remap becomes a runtime contract. The two-site demo seed
   produces canonical Phase 13 acceptance fixtures without fabricated source
   evidence.
5. **Public-Site branding/theming resolver** — branding lookup → tokens with a safe, non-marketing
   semantic fallback; the public Site layout consumes the context (no hard-coded colors leak back
   into checkout and no Site brand leaks into authenticated account chrome).

**Integration / acceptance:**

- **The headline acceptance test:** two sites on two hosts under one tenant render two distinct
  brands, and a gift on each is stored with the correct `site_id`, currency, and (if present)
  `source_code`.
- Donor portal shows a donor's gifts across **both** sites through the one
  Tenant Donor Portal Host (multi-site does not fragment history or create a
  per-Site account origin). Both Sites enter the same Tenant Donor Account
  Brand; authorized gift rows may retain their source-Site attribution without
  reskinning the surrounding account shell.
- Each demo Site resolves one distinct complete Site Brand Version through the
  applicable public-Site release authority. Drafts never affect public output;
  a design release changes only the exact Site; one response cannot mix revisions;
  cross-Tenant/cross-Site brand
  or asset references fail closed; public giving keeps the Site presentation
  while exact legal/payment truth remains non-overridable.
- The Phase 13 public-giving acceptance path persists all four attribution axes
  and the currency-aware amount on the canonical contribution revision.

**Prior art:** follow the existing unit-test patterns under `tests/unit` (including the CMS/Payload
DB-config tests) and the phase-evidence pattern (`docs/ops/phase-evidence/`) for the completion
write-up.

---

## Out of Scope (named, seam-reserved, deferred)

- **Multi-site management Studio** — creating/deleting sites via UI, domain management. (Branding
  edit only; create/delete gated; second site seeded via migration.)
- **i18n / translation engine, localized content, CMS localization.** (Locale facet + fallback
  contract + `rendered_locale` stamp only.)
- **Live multi-currency giving, FX conversion, per-site payment accounts.** (Currency primitives +
  reserved money-context columns + reserved rate-snapshot shape only; presentment = settlement.)
- **Per-site deep giving-behavior settings** — anonymous-giving toggle, recurring options, minimum/
  maximum amounts, cover-fees, payment-method selection, and success/failure redirect behavior.
  Named and **reserved for later giving phases**, not built here. Per A1a, the anonymous-giving,
  amount, cover-fees, payment-method, and redirect settings become typed columns on `public.sites`
  when their owning phases land, not a `site_*_settings` table. _(Amended 2026-07-13 by Phase 16
  (Pledges & Recurring Commitments): recurring-cadence availability is the deliberate exception.
  Phase 16 owns it as tenant-scoped, versioned recurring-policy records with grandfathered existing
  schedules; there is no per-site cadence override unless a later phase explicitly ratifies one.)_
  _(Amended 2026-08-30 by Phase 24 D64: repeated Site Suggested Amount Sets are a bounded normalized
  child aggregate because Site × currency × exact cadence × up to six values cannot be represented
  safely as scalar columns. This does not move cadence availability into the Site or open a generic
  settings-table exception.)_
- **Receipt compliance** (legal name/address/tax-language storage), **accounting exports**, **gift
  triggers**, **reports** — deferred to Phase 7 (Receipt & Statement Compliance Rules +
  donor-identity/credit model) and the later reporting/export phases; Phase 2 reserves the primitives
  (reporting currency, rate-snapshot shape, attribution axes, `rendered_locale`, and the
  override-resolution contract) they will consume. The issuing tenant/site **jurisdiction/country** —
  which gates later document identity (the U.S. short opaque acknowledgment reference versus the
  Phase 18 proof-gated Canadian exact-issuer `R-` series with uniqueness, nonreuse, and explicit
  disposition accounting—not a mathematical gaplessness promise) and tax language — is part of
  this deferred receipt-compliance bundle and is **not** a reserved column on `public.sites` in
  Phase 2; Phase 7 introduces it and **may extend** the reserved override-resolution contract with a
  jurisdiction axis.
- **Surfacing attribution to missionaries** — deliberately deferred (attribution is staff/finance-
  facing in Phase 2); missionary views stay normalized at the tenant.
- **CRM projection of site/attribution** — attribution stays in the Asym ledger; the CRM operates at
  tenant scope (the earlier Twenty wording is retired —
  [ADR-0001](../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md)).
- **Domain verification, preview-domain routing, resolver caching strategy** — deferred to the
  Public-Website-runtime phase; Phase 2 pins only the resolver contract.
- **Advocacy / personal-fundraising microsites** — SiteStacker achieves "many missionary sites" via
  advocacy campaigns rolling up to shared funds, not provisioned sites; that is later work.
- **First-touch/multi-touch attribution, cross-device stitching, durable cart/checkout-session
  entity** — the giving-cart phase.

---

## Further Notes

- **Vendor grounding.** SiteStacker's own model (official docs) puts "a website" at the **site
  channel** level (domain + template + language + content + contributions) and reserves a separate
  **site** only for siloed content or a different payment processor/currency — "9 times out of 10
  make a new Channel, not a new Site." We collapse that two-tier shape into a single `site` and keep
  attribution as orthogonal tags, which reproduces the outcome with far less nesting. Stripe docs
  confirm that available presentment and settlement currencies depend on the
  exact connected account, country, capabilities, settlement configuration,
  and current provider contract—not a universal standalone-account claim.
  Minor units vary by currency (the correctness fix), reporting FX should be
  snapshotted from exact provider evidence rather than self-computed, and
  recurring/customer currency compatibility must be capability-checked by the
  owning phase. Site count never determines payment-account count.
- **Founder intent captured.** The public website renders in the **donor app**; its content backend
  is **Payload CMS** in the admin app; the **Site/Web Studio** manages content (and later, sites).
  Each tenant has one default website plus optional others, all connected under the tenant. The
  checkout stays the same across sites — only colors and branding change — and this was verified to
  fit the existing apps without disruption. The one thing that was in the architecture docs but not
  the durable spec — that a tenant may run more than one website — is corrected by the OpenSpec change
  above.
- **Glossary.** `CONTEXT.md` now defines **Site**, **Entry Method**, and **Source Code**; "channel"
  is explicitly avoided as a gift field.
- **Evidence plan.** On completion, a Phase 2 evidence file under `docs/ops/phase-evidence/` records:
  commands run, the five module test suites, the two-site acceptance run (two brands, both give), the
  currency-correctness suite (JPY/BHD/etc.), the OpenSpec change, and an explicit list of what
  Phase 2 did **not** build.

---

## Tracking Issues

Tracked as epic **#477** + children (created via `/to-issues`). Ticket shape:

1. OpenSpec change + parity-matrix update (platform-surfaces singular → multi-site; Site entity).
2. `public.sites` + `cms.sites` data model + default-site provisioning + demo seed (Module 4).
3. Currency module: `currency_metadata` (TS constant + seed) + money helpers + ISO-4217 validation
   (Module 1); replace the donate-path cents assumption.
4. Site context resolver in `packages/api` — host→site→tenant (Module 2).
5. Attribution builder + `source_code` capture/sanitization (Module 3); public
   input plus the Phase 13 contribution-acceptance handoff.
6. CMS site-scoping retrofit (the six touch-points) + per-site slug uniqueness.
7. Complete Site Brand Version lifecycle + resolver + donor-app wiring
   (Module 5); dedicated semantic brand roles; production-faithful preview;
   checkout presentation; footer templating; no arbitrary code or live
   inheritance.
8. Web Studio `cms.sites` (branding editable, rest read-only, create/delete gated) + Mission Control
   read-only Sites list.
9. Two ADRs (site-before-ledger; currency-aware minor units).
10. Phase 2 evidence file.

## Dated Phase 17 message-resolution amendment (2026-07-19)

**Old statement.** Phase 2 D9 reserves one fixed receipt/system-message override
order: tenant default → site override → locale override. Phase 2 also owns site
locale context, the requested → site default → `en-US` locale fallback, and the
immutable `rendered_locale` fact.

**New winner.** For a System message contract that explicitly permits tenant
choice, Phase 17 allows exactly one of two platform-defined safe content
fallback priorities and records the selected policy version plus the complete
resolution trace. Phase 17 also owns system-message locale activation,
per-contract locale readiness, and the message-presentation inheritance for an
organization or permitted Phase 2 site.

**Compatibility boundary.** Phase 2's fixed order remains binding except where
a later purpose owner defines a narrower closed resolver. Phase 17 governs the
eligible system-message contracts described above. Phase 18 governs generated
official and protected documents: normal configured assignment/inheritance is
the primary resolution; if that exact primary is unusable and the purpose allows
recovery, the fixed D15 order checks one compatible prior publication at the
same scope and exact locale, then one purpose-permitted ancestor publication at
the exact locale. It never uses a system, sibling, foreign-locale, tenant-
reordered, or fragment-mixed fallback. Every other contract continues to use
Phase 2's fixed order except Phase 24 public Site routes, shell, Navigation,
CMS content, search, sitemap, canonical, and `hreflang`, whose exact-locale,
no-cross-language-fallback rule is owned by D15 and D66. `rendered_locale`
remains a frozen issuance/render fact.
Phase 24, not Phase 17 or Phase 18, owns broad site, CMS, public-shell, staff-
shell, domain, currency, and jurisdiction localization.
