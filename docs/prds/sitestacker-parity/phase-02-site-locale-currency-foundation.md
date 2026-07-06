# Phase 2 — Site, Locale & Currency Foundation

> SiteStacker Parity Program · Phase 2. Charter and matrix: `docs/prds/sitestacker-parity/`.
> This PRD is the buildable synthesis of the Phase 2 grill (decisions D1–D13). Glossary terms
> **Site**, **Entry Method**, and **Source Code** are defined in the repo-root `CONTEXT.md`.

**Status:** Draft for pricing → tickets. Not yet published as issues.
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
   **donor portal** (a tenant-scoped surface, not a site) undisturbed.
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
18. As the **organization**, I want the merchant/settlement identity to remain at the tenant (one
    Stripe account), so that adding sites never fragments payouts or reconciliation.

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
27. As an **engineer**, I want a documented locale fallback order (requested → site default →
    `en-US`), so that when localization is built later, the rule is already agreed and consistent.
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
    (domain + branding + language + content + public giving entry) into a single row. We do **not**
    build SiteStacker's two-tier `site → site-channel` nesting, nor a hierarchy of
    `site_locales`/`site_currency_settings` tables — **locale and currency are facets of the site**,
    matching how Shopify Markets and Contentful model per-market/per-locale as facets of one site
    rather than separate sites. (ADR-worthy — see ADRs.)
- **A1a. Settings-as-facets, generalized (the D9 rule).** A site setting that needs a home before the
  phase that consumes it lives as a **typed column on `public.sites`**, never in a premature
  `site_*_settings` table. The "facets, not a hierarchy" rule extends to _all_ pre-phase site
  settings, not just locale and currency. This is the recorded justification against adding a
  `site_settings` table when the next setting arrives.
- **A2. Tenant owns the money; site owns the presentation.** The merchant/settlement identity stays
  at the tenant (one standalone Stripe account per tenant — the repo resolves the tenant's stored
  Stripe secret key, no Stripe Connect). A site declares a **presentment currency** and **locale**
  as display facets. **Phase 2 constraint:** a site's presentment currency **must equal** the
  tenant's settlement currency — we never show "priced in EUR, charged in USD." A nullable per-site
  payment-account override is **reserved** (unused) for a future genuinely-separate processor.
  Verified against Stripe docs: one standalone account can present 135+ currencies, so multi-currency
  later needs **no** per-site accounts.
- **A3. Dual representation in one database.** Payload and Supabase share a **single Postgres**
  (Payload in schema `cms`, app data in `public`; the Payload DB URL falls back to the Supabase DB
  URL). So a site is represented by `public.sites` (operational source of truth: identity, tenant
  FK, currency/money facets, default flag, domains — the row that gifts' `site_id` points at) and a
  `cms.sites` Payload collection (presentation: branding, content scoping) sharing the **same UUID**.
  Fields are **disjoint** and it is one database, so there is **no cross-database sync engine** — it
  mirrors the existing tenant dual-representation (Supabase-authoritative, Payload aligned on login).
- **A4. Domains live in `public.sites` (operational).** So the resolver can be a boundary-safe
  Supabase query in `packages/api` shared by both the public site and the giving path, never
  importing Payload (which the data-access boundary forbids in the giving code). Web Studio shows
  domains **read-only** in Phase 2; domain verification and management are deferred. Note: today's
  resolver is host→**tenant** only (it has no concept of a site, which does not yet exist in the
  repo); Phase 2 introduces host→**site**→tenant resolution as a **new** capability, not a relocation
  of existing site logic.
- **A5. Attribution = four orthogonal axes, no generic "channel."** `site_id` (where), `source`
  repurposed as **entry method** (how it entered), `source_code` (what drove it), and the existing
  designation (fund/campaign, what it is for). The word "channel" is retired as a gift field to avoid
  its three-way ambiguity: SiteStacker "site channel" = our _site_; the repo's `campaigns.channel` is
  a **comms medium** and is **left untouched** (channel survives there, unrelated to gift
  attribution); marketing origin = _source code_. The `donations.source` and `donations.campaign_id`
  columns were added by the foundation migration; `source` carries a `DEFAULT 'direct'` and legacy
  backfilled values (mirroring `donation_type`) but is not consumed by the giving path, and
  `campaign_id` is not written by the saga — so repurposing `source` as entry method must remap those
  existing `'direct'`/`donation_type` values (see Module 4 backfill), not assume nulls.
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
- `currency_metadata` primitive: ISO-4217 code → decimal exponent + special-case flags for the
  documented Stripe exceptions (the ISK/UGX/HUF/TWD charge-vs-payout quirks; the three-decimal
  currencies). **Source of truth is a TS constant in `packages/api`, mirrored to a seed table** so
  the SQL/RPCs that format or validate money server-side (e.g. the donation saga, receipt formatting)
  can look up exponents and reject unknown codes at the DB boundary. The metadata is comprehensive (a
  correctness lookup for any currency).
- **Transaction allowlist ≠ metadata:** the set of currencies a gift may transact in is, in Phase 2,
  **exactly the tenant's settlement currency**. `currency_metadata` stays comprehensive; the
  allowlist is narrow and honest about un-launched capability.
- This module replaces the current cents assumption in the donate path (the code multiplies the
  incoming amount by 100 to derive minor units).

**Module 2 — Site context resolver (host → site → tenant).** Home: `packages/api` (boundary-safe
Supabase query; no Payload import), shared by the CMS public API and the giving path. This is a
**new** capability — today's resolver returns a tenant only.

- Interface (shape): `resolveSiteFromHost(host) → { site, tenant } | null`,
  `defaultSiteForTenant(tenantId) → site`.
- Resolution order: exact `primary_domain` match → `alias_domains[]` match → subdomain-slug →
  explicit override (dev/local) → tenant default site. Host uniqueness is enforced (a domain maps to
  exactly one site).
- The authenticated donate path derives tenant from the auth context and **defaults `site_id` to the
  tenant's default site**; host resolution is used by the CMS public routes and by the public
  anonymous checkout when it is built (Phase 3).

**Module 3 — Attribution builder.** Home: `packages/api` (used by the giving path; no CMS import).
Assembles a gift's four attribution axes and hardens the user-controlled input.

- Interface (shape): `buildAttribution({ host, params, authContext, entrySurface }) →
{ site_id, entry_method, source_code }`.
- Entry-method vocabulary (repurposed `donations.source`; gift _type_ stays in
  `donation_type`/`is_recurring`): `public_checkout | portal | offline | import | api | admin |
legacy`, enforced by a DB check/enum. **Caller → entry_method mapping** (the `entrySurface` is
  caller-supplied; if it disagrees with `authContext`, the authenticated context wins):
  - authenticated donor portal `/donate` → `portal`
  - anonymous public checkout (Phase 3) → `public_checkout`
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
- Backfills existing content and gifts to the tenant's default site. **Entry-method backfill is
  lossless:** the existing `donations.source` values (which mirror `donation_type`, defaulting to
  `'direct'`) are remapped to `legacy`; any rows already denoting `import` are **preserved** as
  `import`; the new check/enum constraint is then enforced. Backfilled gifts get `source_code = null`
  (never a fabricated appeal).
- Seeds the **two-site demo** (two hosts, two brand-color sets, one public home page each) so the
  acceptance test "two domains, one tenant, two brands, both give" can pass.

**Module 5 — Branding / theming resolver.** Home: shared UI/config consumed by the donor app (reads
the site's presentation facet; no giving-path coupling). Turns a site's branding facet into the
tokens the donor app applies, closing the edit→live loop.

- Interface (shape): `resolveSiteBranding(site) → { name, logo, tagline, brandTokens }`, where
  `brandTokens` are CSS custom properties (`--brand-*`) with a documented fallback to platform
  defaults.
- The donor public layout consumes this via a site-config context (replacing the current static
  brand-config import); checkout reads brand tokens instead of hard-coded colors; the footer's
  hard-coded sections become templated. The checkout **flow** is untouched — only theming varies.

### Data model

_All site settings that need a home before their consuming phase are **typed columns on
`public.sites`**, per A1a — not `site_\*_settings` tables._

- **`public.sites`** (operational SoT): `id (uuid)`, `tenant_id (fk, not null)`, `slug`,
  `is_default (bool)`, `primary_domain`, `alias_domains (text[])`, `default_locale (bcp-47)`,
  `allowed_locales (text[])`, `presentment_currency`, `reporting_currency`,
  `payment_account_ref (nullable, reserved)`, `default_designation (nullable)`, `is_active`.
  Unique host index across `primary_domain` + `alias_domains`.
- **`cms.sites`** (Payload collection): same `id`, `tenant` relationship, branding fields
  (name, logo→Media, tagline, brand color tokens), content-scoping. Presentation only; disjoint from
  the operational columns.
- **`currency_metadata`** (seed table mirroring the TS constant): `code (pk)`, `exponent`,
  special-case flags.
- **`currency_rate_snapshots`** — **shape reserved, behavior deferred**: sourced later from the
  payment provider's balance transaction (its exchange rate and settled amount/fee/net; both
  presentment and settlement amounts). Nullable when no conversion is needed.
- **Column additions (table-by-table):**
  - `site_id` (`NOT NULL`, default = tenant default site) on CMS content collections
    (Pages, Navigation, MissionaryGivingPages, ProjectPages) and the giving records
    (`donations`, `staged_gifts`, `donor_pledges`).
  - `campaigns.site_id` **nullable** (a campaign may be tenant-wide or site-specific). Note:
    `campaigns` already carries `channel` (a comms medium, left untouched per A5); this phase adds
    `currency` and the nullable `site_id`.
  - `source_code` + the repurposed `source` (entry method) on `donations`, `staged_gifts`,
    `donor_pledges` — explicit **indexed columns**, not JSON, so reports/triggers filter efficiently.
  - **`currency`** added to **`campaigns`** — the one money table missing it. `donor_pledges`,
    `pledge_charge_attempts`, `donations`, `staged_gifts`, and `funds` **already have** a `currency`
    column (`NOT NULL DEFAULT 'usd'`); for those, Phase 2 adds only **ISO-4217 validation** of the
    existing column, not a new column.
  - Reserved (nullable) money-context columns on giving records: `presentment_currency`,
    `settlement_currency`, `exchange_rate_snapshot_id` — default to the single currency in Phase 2.
  - `rendered_locale` (nullable, defaults to site default) reserved on receipts and system messages.
    It is a reserved **column contract** for the receipts/messages entities that Phase 7 (Receipt &
    Statement Compliance Rules + donor-identity/credit model) creates — Phase 2 builds no receipts
    table. Capture semantics: `rendered_locale` is stamped from the **effective locale at
    render/issuance time** and is thereafter **immutable** — a frozen fact, not a live pointer to the
    site's current `default_locale` — so a later `default_locale` change never misreports a
    historical receipt.
  - **Not** site-scoped (stay tenant-wide): funds/designations, donor/CRM tables, and **Media**
    (Media is already tenant-scoped today via its `tenant` relationship + access hooks; per-site
    asset isolation, if ever needed, is later work — no Media change in Phase 2).
- **Reserved override-resolution contract (D9 shape, storage deferred):** for receipts and system
  messages, a setting/message resolves in the order **tenant default → site override → locale
  override**. Phase 2 reserves this _ordering contract_ only, as a reserved ordering contract for the
  receipts/messages entities that Phase 7 (Receipt & Statement Compliance Rules + donor-identity/credit
  model) creates; the override storage and editor are deferred to Phase 7. Phase 7 **may extend** this
  override-resolution contract with a jurisdiction axis.

### Contracts & wiring (thin, on top of the deep modules)

- **Donate contract:** `donatePostSchema` and the donation-saga RPC accept optional `site_id` and
  `source_code`; the authenticated path defaults `site_id` to the tenant default site and
  `entry_method = portal`; the saga writes all four axes onto the gift.
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

All five deep modules are tested (consistent with Phase 1's "all deep modules" coverage):

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
2. **Site context resolver** — host resolution by primary domain, alias, subdomain, and default-site
   fallback; host uniqueness; unknown host behavior; the donate-path default-site path.
3. **Attribution builder** — entry-method vocabulary enforcement and the caller→entry_method mapping;
   `source_code` sanitization (allowlist filtering, length cap, **CSV formula-injection
   neutralization**, PII/raw-query rejection); default-site assignment for portal/offline/import;
   recurring inheritance.
4. **Site provisioning & backfill** — idempotent default-site creation; backfill assigns existing
   content/gifts to the default site; the **lossless entry-method remap** (`'direct'`/`donation_type`
   values → `legacy`, existing `import` preserved, `source_code` null — no fabricated source); the
   two-site demo seed produces the acceptance-test fixtures.
5. **Branding/theming resolver** — branding lookup → tokens with fallback to platform defaults; the
   donor layout consumes the context (no hard-coded colors leak back into checkout).

**Integration / acceptance:**

- **The headline acceptance test:** two sites on two hosts under one tenant render two distinct
  brands, and a gift on each is stored with the correct `site_id`, currency, and (if present)
  `source_code`.
- Donor portal shows a donor's gifts across **both** sites (multi-site does not fragment history).
- The donation saga persists all four attribution axes and the currency-aware amount.

**Prior art:** follow the existing unit-test patterns under `tests/unit` (including the CMS/Payload
DB-config tests) and the Phase 1 evidence pattern for the completion write-up.

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
  Named and **reserved for the giving-cart phase**, not built here. Per A1a, when each of these
  lands it becomes a typed column on `public.sites`, not a `site_*_settings` table.
- **Receipt compliance** (legal name/address/tax-language storage), **accounting exports**, **gift
  triggers**, **reports** — deferred to Phase 7 (Receipt & Statement Compliance Rules +
  donor-identity/credit model) and the later reporting/export phases; Phase 2 reserves the primitives
  (reporting currency, rate-snapshot shape, attribution axes, `rendered_locale`, and the
  override-resolution contract) they will consume. The issuing tenant/site **jurisdiction/country** —
  which gates receipt numbering (US non-gapless vs Canada/CRA gapless) and tax language — is part of
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
  confirm one standalone account handles 135+ presentment currencies (so multi-currency needs no
  per-site accounts), that minor units vary by currency (the correctness fix), that reporting FX
  should be snapshotted from the provider's balance transaction (not self-computed), and that a
  Stripe Customer is currency-locked (subscriptions cannot mix currencies) — so a future recurring/
  multi-currency phase will need a Customer-per-(donor × currency) mapping or Stripe's
  multi-currency-customers feature.
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

_Intentionally pre-ticket: this PRD is blocked on the pricing pass before issues are created._
Anticipated ticket shape (subject to pricing):

1. OpenSpec change + parity-matrix update (platform-surfaces singular → multi-site; Site entity).
2. `public.sites` + `cms.sites` data model + default-site provisioning + demo seed (Module 4).
3. Currency module: `currency_metadata` (TS constant + seed) + money helpers + ISO-4217 validation
   (Module 1); replace the donate-path cents assumption.
4. Site context resolver in `packages/api` — host→site→tenant (Module 2).
5. Attribution builder + `source` repurpose + `source_code` capture/sanitization (Module 3);
   donate schema + saga axes.
6. CMS site-scoping retrofit (the six touch-points) + per-site slug uniqueness.
7. Branding/theming resolver + donor-app wiring (Module 5); checkout brand tokens; footer templating.
8. Web Studio `cms.sites` (branding editable, rest read-only, create/delete gated) + Mission Control
   read-only Sites list.
9. Two ADRs (site-before-ledger; currency-aware minor units).
10. Phase 2 evidence file.
