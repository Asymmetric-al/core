# Phase 20 Multi-Currency and FX Research Evidence

**Status:** Research evidence for the Phase 20 `/grill-with-docs` session
**Date:** 2026-07-26
**Decision:** D20
**Scope:** How Accounting Releases consume Stripe currency and conversion facts,
how the ordinary local-settlement path stays quiet, and when a tenant may
activate a retained foreign settlement-currency lane.

This note is evidence, not an implementation specification, accounting advice,
tax advice, or a replacement for the ratified Phase 20 decision log. QBO and
Xero remain the accounting systems of record. Phase 20 creates truthful,
reconcilable downstream accounting projections; it does not become an FX
subledger.

## Executive conclusion

The durable default is **local/home-currency settlement from exact Stripe
Balance Transaction facts**.

For the common case, a donor may pay in one presentment currency while Stripe
converts the transaction into the exact settlement currency selected by the
active **Settlement Currency Lane Version** for the Tenant, Legal Entity,
Settlement Account Binding, Stripe account/environment, and balance type. If
that proved settlement currency equals the connected QBO home currency or Xero
base currency, Asym should quietly preselect the single-lane path and:

1. preserve the donor-facing amount and presentment currency as source truth;
2. preserve Stripe's immutable provider conversion evidence;
3. account from the corresponding Stripe Balance Transaction's exact
   settlement-currency `amount`, `fee`, and `net`; and
4. deliver a single-currency Accounting Effect to QBO or Xero.

This is what “count what is in the Stripe balance” may safely mean. It does
**not** mean posting the mutable current balance shown in the Stripe Dashboard,
using the Balance API aggregate as a journal source, or treating a payout's net
amount as contribution revenue. Those values cannot explain which gifts,
fees, refunds, disputes, reserves, and conversion effects produced the total.

Retaining and paying out a separate foreign-currency Stripe balance is an
optional advanced lane. It is allowed only after Asym proves the exact Stripe
settlement currency and payout account, the exact QBO or Xero destination
capability, and the tenant's prospective routing. QBO or Xero owns translation,
revaluation, and realized or unrealized FX accounting.

The ratified posture is therefore:

> **C-prime-amended-and-hardened (C-prime-R) — quiet local/home-currency
> settlement by default from exact Stripe balance-transaction facts,
> preserving donor presentment and provider-conversion evidence, with
> proof-gated opt-in foreign settlement-currency lanes and QBO/Xero-owned
> translation, revaluation, and FX accounting.**

## Provider facts that constrain the design

### Stripe

- Stripe distinguishes payment-method currency, charge or **presentment
  currency**, and bank-account **settlement currency**.
- By default, Stripe converts incoming funds into the account's default
  currency. Where available, multi-currency settlement lets an account accrue
  and receive payouts in additional currencies.
- For Connect, multi-currency settlement is separately enabled, region-bound,
  and available only for supported platform and connected-account
  combinations. Phase 20 must inspect the exact connected account rather than
  infer capability from the platform account.
- Each enabled settlement currency requires a supported matching-currency bank
  account. Currency availability, payout minimums, fees, and timing are
  provider- and region-dependent.
- The Stripe Balance Transaction is the accounting-grade component fact. It
  exposes a unique ID; integer-minor-unit gross `amount`; `fee`; `fee_details`;
  `net`; `currency`; nullable `exchange_rate`; `reporting_category`; `source`;
  `balance_type`; `created`; `available_on`; and `status`.
- Stripe defines `net = amount - fee`.
- When conversion applies, Stripe defines the Balance Transaction
  `exchange_rate` so that the source amount in currency A multiplied by the
  rate equals the Balance Transaction amount in currency B.
- Stripe's currency rules include zero-decimal currencies and special payout
  representations. No implementation may assume that every currency has two
  decimal places.
- Refunds, disputes, fee adjustments, and FX fees can appear as their own
  later Balance Transactions. A later refund can use a different conversion
  rate from the original payment.

### QuickBooks Online

- Multicurrency is disabled by default and is unavailable on some plans.
- It is enabled in the QBO user interface, not by the API, and cannot be
  disabled after activation.
- The home currency cannot be changed after it is fixed.
- A QBO name-list object or currency-capable account has one assigned currency.
  Income and expense accounts remain home-currency accounts.
- QBO defines `ExchangeRate` as home-currency units per one foreign-currency
  unit, `CurrencyRef` as the transaction currency, and provider-calculated
  `HomeTotalAmt` where supported.

Asym must not enable QBO multicurrency, guess a foreign account, or compute a
replacement home total. It certifies the destination and lets QBO apply its
own accounting logic.

### Xero

- The Organisation endpoint exposes the exact organisation and `BaseCurrency`.
- The Organisation Actions endpoint reports whether `UseMulticurrency` is
  `ALLOWED`; that capability can change with plan or authorization changes.
- A currency must exist in the organisation before supported foreign-currency
  documents can use it. Xero does not allow an added currency to be removed.
- Xero's base currency cannot be changed after organisation creation.
- Xero owns foreign-currency translation and realized and unrealized gains or
  losses. Its `CurrencyRate` direction differs from QBO's direction:
  foreign-currency units per base-currency unit.
- Xero explicitly warns integrations not to assume a queried object's currency
  remains unchanged merely because the app originally created it in base
  currency.

Asym must read and verify those facts. It must not add an irreversible Xero
currency without a clear tenant action, fabricate a rate, or maintain a
parallel FX-gain/loss ledger.

## Truth model

The following facts stay independently authoritative:

| Truth                                               | Owner                                | Required evidence                                                                                                                  |
| --------------------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Donor amount and presentment currency               | Contribution/payment source contract | Source occurrence ID, integer amount, ISO currency, event time                                                                     |
| Stripe conversion                                   | Stripe                               | From/to amounts and currencies, nullable provider rate, direction, provider occurrence, time, and provider-attributed fee evidence |
| Stripe balance impact                               | Stripe Balance Transaction           | Exact `amount`, `fee`, `net`, currency, source, reporting category, balance type, status, and timestamps                           |
| Stripe payout transfer                              | D9 Processor Payout Transfer         | Exact payout amount, currency, destination, status, and covered settlement components                                              |
| Bank arrival                                        | D10 Bank Match                       | Same-currency posted bank evidence and immutable match                                                                             |
| Canonical accounting projection                     | D4 Accounting Effect                 | Balanced single-currency lines with exact source coverage                                                                          |
| Provider translation, revaluation, and FX gain/loss | QBO or Xero                          | Provider-native objects, provider-calculated home/base values, readback, and drift evidence                                        |

No one row may silently overwrite another. In particular:

- the donor's original currency is not replaced by Stripe's settlement
  currency;
- Stripe's exact settlement facts are not replaced by today's market rate;
- a payout amount is not substituted for gross gift and fee components;
- a bank match never converts one side to force a match; and
- QBO/Xero home or base values do not rewrite the original Stripe evidence.

## Ordinary local-settlement path

The path is considered local/home-currency settlement only when all of the
following are true:

1. Stripe produced an exact, source-linked Balance Transaction.
2. The Balance Transaction settlement currency equals the active Accounting
   Destination's proved QBO home currency or Xero base currency.
3. The D3 Legal Entity, Stripe account, environment, Settlement Account
   Binding, balance type, and destination all match.
4. D4 can compile a balanced Accounting Effect in that one currency.
5. D7 or D8 can preserve the effect through its already-certified provider
   carrier and exact readback.

No tenant setup is needed solely because the donor paid in another currency.
Asym uses Stripe's exact settlement-currency component facts and shows the
original presentment facts only where they help support, finance, or audit.

Example:

```text
Donor paid:            EUR 100.00
Stripe balance gross:  CAD 148.23
Stripe fee:              CAD 4.91
Stripe balance net:    CAD 143.32
Accounting destination: Xero, base currency CAD
```

The Accounting Effect uses CAD 148.23 gross, CAD 4.91 fee, and CAD 143.32 net.
The contribution record still says the donor gave EUR 100.00. The provider
conversion evidence explains the bridge; it is not a staff-editable rate.

## Optional retained foreign settlement-currency lane

The tenant may choose **Keep and account for a separate [currency] balance**
only for future source occurrences. Activation requires a prospective,
immutable Settlement Currency Lane Version proving:

- the exact Tenant and Legal Entity;
- the exact Stripe account, environment, balance type, and settlement currency;
- Stripe account-country and feature availability for that currency;
- an enabled Stripe settlement balance in that currency;
- a supported matching-currency Stripe payout bank destination;
- disclosed payout minimum, payout schedule, and provider fees;
- the exact QBO company or Xero organisation;
- QBO multicurrency enabled, home currency known, and exact active
  currency-compatible accounts or names, or Xero `UseMulticurrency = ALLOWED`,
  base currency known, currency present, and exact active currency-compatible
  bank/account targets;
- the exact D7 or D8 Carrier Plan and D16 delivery package capability;
- exact preview and readback proof;
- a no-overlap effective boundary with the prior lane; and
- the authorized actor, reason, evidence digest, and activation time.

Asym does not enable QBO multicurrency, add a QBO currency, add an irreversible
Xero currency, or create a Stripe payout bank account on the tenant's behalf.
The interface deep-links to the provider's settings where safe and then offers
**Check again**. Any provider drift quarantines only the affected prospective
lane. The Accounting Evidence Artifact remains available; a staff-mediated
package remains available only when D16 independently certifies that exact
currency and import surface.

Each currency lane remains separate through source coverage, idempotency,
release population, Accounting Effect, delivery, readback, payout, and Bank
Match. No release line or match combines currencies.

## D19 processor-cost interaction

D20 does not broaden D19.

- Stripe FX fees and conversion effects remain separate semantic roles. They
  are not ordinary charge-linked payment-processing costs.
- Organization-absorbed processing costs remain the default and work in the
  settlement currency.
- The optional D19 designation-borne uncovered-cost mode is unavailable when
  the exact processor-cost currency and the source Designation allocation
  currency differ, unless a future source-owned contract supplies an exact
  same-currency allocation basis.
- Asym never prorates a CAD fee over EUR Designation lines, never invents a
  cross-rate to make the allocation possible, and never lets one currency
  absorb another currency's residual.

An ineligible cross-currency D19 allocation is organization-borne through
D19's central target. If that target or required provider capability is
missing, one cause-owned Accounting Exception Case blocks the work. Staff can
see the reason, but cannot force a cross-currency allocation.

## Phase boundary

D20 consumes authoritative currency facts; it does not enable donor
presentment currencies.

- Phase 2 defines site, locale, source, presentment, and reporting currency
  context.
- Phase 13 preserves contribution and ledger currency truth.
- Phase 20 accounts from exact settlement evidence once an upstream source
  produces it.
- Phase 24 owns staff activation and public presentation of additional donor
  checkout currencies.

Therefore, D20 must not bypass the current Phase 2/13 single-currency launch
fence. The accounting model is future-compatible with foreign presentment
without exposing unsupported checkout choices early.

## Ruthless adversarial review

Every requested category has a concern. The bounded design below converts each
concern into a permanent contract or test rather than a staff workaround.

### 1. Brittleness — concern: yes

**What could go wrong:** The implementation assumes presentment currency equals
settlement currency, assumes `exchange_rate` is always present, assumes every
currency has two decimals, or treats one Stripe account's default currency as
unchanging truth for every transaction.

**Why it matters:** Legitimate gifts, refunds, payout adjustments, zero-decimal
currencies, or retained foreign balances would produce wrong amounts or
unreconcilable releases.

**Severity:** Critical
**Likelihood:** High without explicit currency contracts

**Permanent fix:** Persist exact currency on every amount; use currency-aware
minor-unit arithmetic; accept a nullable provider rate; derive accounting only
from source-linked Balance Transactions; partition all effects, releases, and
matches by currency; and test provider drift and special currency rules.

### 2. Technical debt — concern: yes

**What could go wrong:** Separate conversion logic grows inside Stripe
ingestion, the canonical Accounting Effect, the QBO adapter, the Xero adapter,
reports, and UI formatting.

**Why it matters:** Rate direction, rounding, and correction behavior would
diverge. Later provider changes would require risky coordinated rewrites.

**Severity:** High
**Likelihood:** High if adapters own business rules

**Permanent fix:** Keep one provider-evidence model, one currency-aware
canonical effect boundary, shared integer-money primitives, and
provider-specific compilation/readback only at D7/D8. No generic FX service or
policy DSL is needed.

### 3. Edge cases — concern: yes

**What could go wrong:** Same-currency transactions have a null rate; a refund
uses a later rate; Stripe reports a separate `stripe_fx_fee`; a payout minimum
holds a foreign balance; a destination bank changes; a provider capability is
removed; or an amount uses JPY, HUF, ISK, TWD, or another special currency
representation.

**Why it matters:** These are normal provider behaviors, not exceptional data.
Guessing produces incorrect accounting or permanently stuck work.

**Severity:** Critical
**Likelihood:** Medium overall; high at meaningful international volume

**Permanent fix:** Model each provider occurrence independently; preserve
nullable rate and exact provider category; use append-only corrections; treat
payout timing separately from accounting; recertify capabilities
prospectively; and maintain a provider-shaped edge-case fixture suite.

### 4. Footguns — concern: yes

**What could go wrong:** An admin turns on QBO multicurrency without realizing
it is irreversible, adds a non-removable Xero currency, picks the wrong foreign
bank account, or assumes the Stripe Dashboard balance is ready-to-post
revenue.

**Why it matters:** The result can be permanent provider configuration,
misrouted cash, duplicate accounting, or a material misstatement.

**Severity:** Critical
**Likelihood:** Medium

**Permanent fix:** Never auto-enable irreversible provider settings. Use one
review-first activation, plain-language consequences, exact provider identity
and currency, preview/readback, authorized action, and **Check again** after
the tenant completes provider setup.

### 5. Tenant safety — concern: yes

**What could go wrong:** A cached capability, Balance Transaction, exchange
rate, payout account, or accounting target from one tenant, Legal Entity,
Stripe account, environment, or destination is reused for another.

**Why it matters:** This could leak financial data or post one organization's
money into another organization's books.

**Severity:** Critical
**Likelihood:** Low with correct isolation; unacceptable if it occurs

**Permanent fix:** Include Tenant, Legal Entity, provider account, environment,
balance type, currency, Settlement Account Binding, Accounting Destination,
and effective interval in authorization, storage keys, queries, caches,
idempotency keys, queue partitions, manifests, and negative isolation tests.

### 6. Over-engineering — concern: yes

**What could go wrong:** Asym builds a rate engine, FX subledger, revaluation
jobs, user-editable conversion tables, arbitrary currency-routing rules, or an
accounting-provider emulator.

**Why it matters:** That duplicates QBO/Xero, expands compliance and
correctness risk, and burdens the majority of single-settlement-currency
tenants.

**Severity:** High
**Likelihood:** Medium because multicurrency invites abstraction

**Permanent fix:** Support exactly two product paths: quiet local/home-currency
settlement and a proof-gated retained foreign-currency lane. Persist provider
evidence, compile balanced single-currency effects, and leave translation,
revaluation, and FX accounting to QBO/Xero.

### 7. UX/UI and user friction — concern: yes

**What could go wrong:** Every tenant sees dense multicurrency settings,
finance staff cannot tell donor currency from accounting currency, warnings
become constant noise, or an advanced lane activates without explaining bank
and accounting consequences.

**Why it matters:** Staff may abandon setup, mistrust the numbers, or make a
dangerous configuration choice.

**Severity:** High
**Likelihood:** High if provider concepts are exposed directly

**Permanent fix:** Hide advanced setup unless foreign activity or explicit
interest exists. Show one calm local-path sentence, one optional advanced
action, a progressive proof checklist, representative preview, exact
consequence copy, accessible amount formatting, and cause-specific exceptions.

### 8. Hidden coupling — concern: yes

**What could go wrong:** Presentment activation, settlement routing, D19 fee
allocation, payout matching, and QBO/Xero posting become one mutable setting.

**Why it matters:** Changing a checkout currency could unexpectedly change
accounting ownership, fee attribution, or bank routing.

**Severity:** High
**Likelihood:** Medium

**Permanent fix:** Preserve independent contracts and identifiers for
presentment, provider conversion, Settlement Currency Lane Version, payout,
Bank Match, processor-cost policy, Accounting Effect, and provider delivery.
Join them through immutable references and coverage manifests, not shared
mutable booleans.

### 9. Failure modes — concern: yes

**What could go wrong:** Stripe omits or delays a Balance Transaction; the rate
contradicts the source amounts; a provider rejects the currency; delivery has
an ambiguous timeout; a capability changes after preview; or readback differs.

**Why it matters:** Blind retry can duplicate accounting, while silent fallback
can post an unproved value.

**Severity:** Critical
**Likelihood:** Medium

**Permanent fix:** Fail closed per affected occurrence; create one D13
cause-owned exception; use operation-granular idempotency and unknown-outcome
recovery; retain the D16 evidence artifact; read before retry; compare exact
readback; and quarantine only the affected lane.

### 10. Data integrity risks — concern: yes

**What could go wrong:** A floating-point rate introduces drift; gross, fee,
and net no longer conserve; one source occurrence is covered twice; a refund
rewrites the original rate; or staff edits the historical currency route.

**Why it matters:** Releases will not reconcile to Stripe, the bank, or the
accounting provider.

**Severity:** Critical
**Likelihood:** High without database and domain invariants

**Permanent fix:** Use integer minor units for money, preserve raw provider
rate evidence without using binary floating-point for accounting arithmetic,
enforce `amount - fee = net` where Stripe defines it, make source coverage
unique per currency and occurrence, use immutable prospective lane versions,
and correct append-only.

### 11. Security and privacy risks — concern: yes

**What could go wrong:** Provider tokens leak into evidence, donor PII appears
in journal descriptions, an unauthorized role activates a foreign lane, or a
deep link reveals another destination.

**Why it matters:** Financial authorization and donor privacy are high-impact
assets.

**Severity:** Critical
**Likelihood:** Low to medium

**Permanent fix:** Reuse D14 encrypted authorization grants and destination
pinning; apply least privilege and role-gated activation; keep secrets,
cardholder data, and unnecessary donor PII out of manifests and memos; use
safe provider-ID suffixes; audit every activation; and test object-level
authorization.

### 12. Scalability and performance risks — concern: yes

**What could go wrong:** One API request is made per UI row, every release
refetches entire provider history, or foreign-currency traffic monopolizes the
tenant queue.

**Why it matters:** January and month-end accounting would become slow,
rate-limited, and expensive.

**Severity:** High
**Likelihood:** Medium at scale

**Permanent fix:** Use incremental D9 ingestion, source-indexed Balance
Transactions, currency-partitioned bounded work, D15 provider-adaptive
capacity, cached capability evidence with freshness bounds, bulk-safe
pagination, and reconciliation controls that do not require full-history
replay.

### 13. Operational burden — concern: yes

**What could go wrong:** Finance staff repeatedly choose rates, manually map
every converted gift, or investigate ordinary local conversions as exceptions.

**Why it matters:** The product would add bookkeeping work instead of removing
it.

**Severity:** High
**Likelihood:** High with a provider-centric UI

**Permanent fix:** Derive the common local path automatically; require no
multicurrency configuration for it; group only genuine causes in the D13
workspace; offer provider-directed remediation and **Check again**; and keep
manual rate entry out of the product.

### 14. Observability gaps — concern: yes

**What could go wrong:** Operators see a generic “FX failed,” cannot identify
the source occurrence or rate direction, or cannot distinguish provider drift
from a missing Balance Transaction.

**Why it matters:** Recovery becomes guesswork and may trigger unsafe replays.

**Severity:** High
**Likelihood:** Medium

**Permanent fix:** Record safe structured dimensions for Tenant, Legal Entity,
provider account suffix, environment, source, Balance Transaction, currency
pair, lane version, destination, operation, and cause. Expose per-currency
control totals and cause-specific staff messages without leaking PII or
secrets.

### 15. Dependency and integration risks — concern: yes

**What could go wrong:** Stripe changes availability or payout constraints;
QBO plan or currency settings change; Xero removes multicurrency entitlement;
an account becomes inactive; or provider rate semantics are interpreted in the
wrong direction.

**Why it matters:** A previously valid plan can become invalid while historical
evidence remains correct.

**Severity:** Critical
**Likelihood:** Medium over the product lifetime

**Permanent fix:** Store provider version/provenance, certify exact
capabilities, expire and refresh proof, preserve historical versions, maintain
provider-specific rate-direction adapters, run contract tests against current
official docs and sandboxes, and quarantine prospectively on drift.

### 16. Migration and upgrade risks — concern: yes

**What could go wrong:** A future provider adapter or accounting platform
expects a different rate direction, historical rows lack explicit currency,
or a tenant moves from local conversion to retained foreign settlement across
an ambiguous date boundary.

**Why it matters:** Historical accounting could become uninterpretable or be
posted twice.

**Severity:** High
**Likelihood:** Medium

**Permanent fix:** Make currency and evidence provenance mandatory from the
first schema; use versioned provider adapters and half-open prospective lane
intervals; preserve exact artifacts and readbacks; and prohibit mutable
cutoffs, dual-write, or whole-history replay.

### 17. Other development hazards — concern: yes

**What could go wrong:** Concurrent lane activation overlaps versions;
duplicate webhooks double-cover a Balance Transaction; rounding differs across
services; a retry posts after the destination changed; or tests validate only
USD with ideal provider responses.

**Why it matters:** These race and verification gaps create intermittent,
high-impact accounting defects.

**Severity:** Critical
**Likelihood:** Medium without explicit controls

**Permanent fix:** Use compare-and-swap activation, database uniqueness for
source coverage and intervals, deterministic decimal/rational rate handling,
destination-pinned idempotency, read-before-retry recovery, production-shaped
sandbox fixtures, property tests, and end-to-end readback assertions.

## Ruthless synthesis and implementation order

The safest permanent path is:

1. **Preserve independent currency truths first.** Make every monetary fact
   carry an ISO currency and integer minor-unit amount. Persist provider
   conversion provenance and never mutate source presentment.
2. **Make the ordinary path automatic.** When Stripe's exact balance currency
   equals QBO home or Xero base currency, compile the single-currency effect
   without exposing advanced setup.
3. **Make source coverage and corrections append-only.** Uniquely cover each
   Balance Transaction component once; represent refunds and later adjustments
   as their own occurrences.
4. **Reuse existing Phase 20 capability contracts.** D7/D8 certify carriers,
   D9 owns processor evidence, D10 owns same-currency Bank Match, D11 owns
   corrections, D13 owns exceptions, D14 owns authorization, D15 owns
   capacity, and D16 owns evidence-always packages.
5. **Add exactly one optional foreign lane.** Require exact Stripe payout and
   QBO/Xero capability proof, prospective activation, no overlap, exact
   preview, and readback. Do not build a routing-rule engine.
6. **Keep FX accounting in QBO/Xero.** Asym transmits exact provider facts and
   preserves evidence; the accounting provider owns home/base translation,
   revaluation, and gains or losses.
7. **Ship only after production-shaped currency testing.** Include provider
   drift, missing evidence, ambiguous delivery, corrections, special currency
   exponents, accessibility, and tenant-isolation tests.

This order minimizes irreversible configuration risk while giving advanced
tenants a first-class path that does not complicate the majority experience.

## Staff UX contract

### Default view

For an ordinary single-settlement-currency tenant, show one quiet summary:

> **Foreign gifts settle in CAD**
> Stripe converts supported foreign gifts to CAD. Asym sends each
> transaction's exact CAD gross, fee, and net to your CAD accounting
> destination. Donor records keep the original amount and currency.

Do not show an FX settings matrix, rate field, currency glossary, or warning
banner. A compact **How this works** disclosure may show the four independent
facts: donor paid, Stripe balance gross, Stripe fee, and Stripe balance net.

### When foreign activity needs attention

Reveal a currency card only when:

- the tenant explicitly explores retained foreign settlement;
- a Stripe foreign settlement balance or payout destination is detected;
- the settlement currency differs from the proved QBO home or Xero base
  currency;
- capability proof has expired or drifted; or
- an affected occurrence has a cause-owned exception.

The card shows:

- donor paid amount and currency;
- Stripe balance gross, fee, and net with currency;
- provider conversion rate, direction, and time when present;
- Stripe payout bank and currency;
- QBO home currency or Xero base currency;
- current lane and effective boundary; and
- one plain-language next action.

### Optional lane activation

Use one progressive, review-first flow:

1. **Goal:** “Keep and account for a separate USD balance.”
2. **Stripe proof:** availability, balance currency, matching payout bank,
   minimum, schedule, and fees.
3. **Accounting proof:** exact QBO/Xero organisation, home/base currency,
   multicurrency entitlement, exact accounts, and carrier compatibility.
4. **Preview:** representative gross, fee, net, payout, provider-native
   objects, home/base presentation, and zero-difference controls.
5. **Consequences:** explain irreversible QBO/Xero settings and provider
   responsibilities before the tenant leaves Asym to configure them.
6. **Activate:** one authorized prospective action with no historical replay.

Where configuration must happen in Stripe, QBO, or Xero, use
**Open [provider] settings** followed by **Check again**. Never imply Asym
changed a provider setting it cannot or should not control.

### Error language

Use cause-specific messages:

- “Stripe balance details are not available yet.”
- “This USD payout account no longer matches the USD balance.”
- “QuickBooks multicurrency is not enabled.”
- “Xero no longer allows new foreign-currency transactions on this plan.”
- “This accounting account is CAD, but this release is USD.”
- “We could not confirm whether QuickBooks accepted this release. We are
  checking before retrying.”

Avoid generic “FX error,” “sync failed,” or “balance mismatch” messages.

### Accessibility and responsive behavior

- Every amount announces both value and currency; color is never the only
  currency or status cue.
- Rate direction is written in words, not only as a symbol.
- Tables provide a responsive list/detail alternative rather than horizontal
  overflow as the only mobile experience.
- Activation and remediation are fully keyboard operable with visible focus.
- Provider-return and validation errors focus a plain-language error summary
  and preserve entered intent.
- Irreversible consequences are persistent review text, not tooltip-only copy.
- Live status uses restrained announcements and never causes repetitive screen
  reader noise.

## Required invariants

- Every monetary amount has an explicit ISO currency and currency exponent
  behavior.
- Every Stripe settlement component references exactly one provider account,
  environment, source, Balance Transaction, balance type, and currency.
- `amount - fee = net` is verified for the relevant Stripe Balance Transaction.
- A missing or contradictory provider component cannot enter an Accounting
  Release.
- One Accounting Effect and one release delivery operation contain one
  currency only.
- Idempotency, uniqueness, control totals, and source coverage include
  currency and destination.
- Bank Match requires exact currency equality and never converts either side.
- Historical lane versions, rates, artifacts, and provider readbacks are
  immutable.
- A local-settlement path requires exact equality with the proved QBO home or
  Xero base currency.
- A retained foreign lane requires current, exact provider capability proof.
- Current Stripe balance and payout net may be operational displays, but are
  never the source of revenue or fee lines.
- QBO/Xero owns translation, revaluation, and realized or unrealized FX.
- No D19 Designation allocation crosses currencies.

## Edge-case and test matrix

| Scenario                                                                       | Expected result                                                                                                                                       |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| EUR donor payment converts to CAD Stripe balance; Xero base is CAD             | Preserve EUR donor truth and Stripe conversion evidence; post exact CAD gross/fee/net through the quiet local path                                    |
| CAD payment settles in CAD with null exchange rate                             | Treat as normal same-currency evidence; do not synthesize `1.0`                                                                                       |
| JPY zero-decimal payment or special Stripe payout currency                     | Use provider currency rules and integer minor units; no two-decimal assumption                                                                        |
| Partial refund occurs later at a different rate                                | Persist the refund's own Balance Transaction and rate evidence; create an append-only correction; do not reverse the original CAD amount mechanically |
| Stripe reports `stripe_fx_fee` separately                                      | Preserve it as its own semantic occurrence; exclude it from D19 ordinary processing-cost allocation                                                   |
| Stripe Balance Transaction is delayed                                          | Keep only the affected source out of the release and open one cause-owned exception; no estimate                                                      |
| Balance Transaction gross/fee/net do not conserve                              | Quarantine the occurrence as contradictory provider evidence                                                                                          |
| Dashboard current balance differs from summed release components               | Show it only as operational context; investigate uncovered provider occurrences rather than forcing the release to the aggregate                      |
| Payout contains gifts, refunds, fees, and reserves                             | Reconcile through D9 components; never book payout net as contribution revenue                                                                        |
| Stripe retains USD, but QBO multicurrency is off                               | Block the USD lane; deep-link to QBO settings; activate only after explicit tenant action and successful recertification                              |
| QBO multicurrency is on, but target account/name is CAD                        | Block exact carrier plan; show the incompatible object; never substitute another account                                                              |
| QBO reports a home total different from Asym's preview                         | Preserve QBO readback and quarantine drift; QBO calculation remains provider truth                                                                    |
| Xero plan does not allow multicurrency                                         | Keep the local/base path; block only new foreign-lane work and preserve artifacts                                                                     |
| Xero currency was added but later entitlement is lost                          | Preserve historical objects; quarantine prospective delivery until capability returns or route changes                                                |
| Xero or QBO rate direction is accidentally inverted                            | Provider contract test fails before activation; no delivery                                                                                           |
| Foreign payout balance is below Stripe minimum                                 | Accounting component may be ready while payout remains pending; never fabricate an arrival                                                            |
| Foreign payout destination changes after certification                         | Expire the lane proof and quarantine future affected work; released history remains unchanged                                                         |
| Duplicate Stripe webhook and nightly backfill see the same Balance Transaction | One source-coverage record wins idempotently; no duplicate effect                                                                                     |
| Concurrent admins activate different USD lanes                                 | Compare-and-swap permits one non-overlapping prospective version; loser returns to review                                                             |
| D19 designation-borne mode sees EUR source allocation and CAD fee              | Do not allocate cross-currency; apply the frozen organization-borne or exception behavior                                                             |
| Phase 24 has not enabled EUR presentment                                       | D20 does not expose or enable EUR checkout; only already-authoritative upstream facts are consumed                                                    |
| Direct provider delivery times out after submission                            | Read exact provider state before retry; preserve unknown outcome and evidence artifact                                                                |
| Provider object is edited after creation                                       | Readback/drift evidence records the change; no rewrite of canonical source or released artifact                                                       |
| Tenant/legal-entity/provider IDs are mixed                                     | Authorization and isolation tests reject the request before data access or delivery                                                                   |

## Required verification before shipping

- Unit tests for currency exponent lookup, integer arithmetic, nullable rates,
  and explicit QBO/Xero rate-direction conversion.
- Property tests proving gross/fee/net conservation and that no grouping,
  allocation, release, payout match, or idempotency scope crosses currency.
- Stripe fixtures for charge, payment, refund, dispute, payout, reserve,
  adjustment, `stripe_fee`, and `stripe_fx_fee` categories.
- Duplicate webhook, out-of-order webhook, nightly backfill, missing source,
  delayed Balance Transaction, and contradictory evidence tests.
- QBO sandbox tests for multicurrency off/on, fixed home currency,
  currency-compatible accounts/names, exact provider preview, ambiguous
  timeout, readback, and drift.
- Xero sandbox tests for base currency, `UseMulticurrency` allowed/denied,
  currency present/absent, plan downgrade, exact provider preview, readback,
  and drift.
- Stripe settlement capability tests for account country, supported currency,
  matching bank destination, payout minimum, and destination change.
- Full and partial refund tests where the later provider rate differs.
- D19 tests proving FX fees are ineligible and cross-currency allocation fails
  closed.
- D10 tests proving same-currency exact match and rejecting converted matches.
- Tenant, Legal Entity, provider account, environment, balance type, currency,
  destination, cache, queue, object authorization, and permission isolation.
- Artifact-equivalence tests proving direct and certified staff-mediated
  delivery represent the same canonical Accounting Effect.
- Keyboard, focus, error-summary, screen-reader, contrast, mobile, reduced
  motion, and plain-language usability tests with representative finance
  staff and bookkeepers.
- Load and rate-limit tests at certified seasonal volume using D15 capacity,
  adaptive backpressure, bounded retries, and operation-level observability.

## Non-goals

D20 does not:

- enable donor checkout or presentment currencies; Phase 24 owns that;
- use the current Stripe balance as a journal;
- treat payout net as gross gift truth;
- maintain market rates or let staff enter an accounting rate;
- build an FX trading, hedging, treasury, or cash-position product;
- calculate QBO/Xero revaluation or realized/unrealized gains and losses;
- reconcile the tenant's final books; QBO/Xero owns final reconciliation;
- combine currencies inside one Accounting Effect, release operation, or Bank
  Match;
- allocate D19 processor cost across currencies;
- auto-enable irreversible QBO or Xero settings;
- auto-add an irreversible Xero currency;
- guarantee Stripe multi-currency settlement in every country or currency;
- rewrite historical releases when a rate, payout account, destination,
  provider plan, or lane changes; or
- absorb Phase 21 missionary Field Account or expense-product ownership.

## Official primary sources

### Stripe

- Balance Transaction object:
  https://docs.stripe.com/api/balance_transactions/object
- Supported currencies, presentment versus settlement, minor units, and
  special cases: https://docs.stripe.com/currencies
- Multi-currency settlement, matching bank accounts, availability, and payout
  minimums: https://docs.stripe.com/payouts/multicurrency-settlement
- Connect multi-currency settlement:
  https://docs.stripe.com/connect/multicurrency-settlement
- Connect currency behavior: https://docs.stripe.com/connect/currencies
- Balance reporting:
  https://docs.stripe.com/reports/report-types/balance
- Reporting categories:
  https://docs.stripe.com/reports/reporting-categories
- Localized presentment:
  https://docs.stripe.com/payments/currencies/localize-prices

### QuickBooks Online

- Manage multiple currencies:
  https://developer.intuit.com/app/developer/qbo/docs/workflows/manage-multiple-currencies
- QuickBooks Online multicurrency help:
  https://quickbooks.intuit.com/learn-support/en-us/help-article/multicurrency/learn-multicurrency-quickbooks-online/L5krkKQi8_US_en_US

### Xero

- Organisation and base-currency capability:
  https://developer.xero.com/documentation/api/accounting/organisation
- Organisation currencies:
  https://developer.xero.com/documentation/api/accounting/currencies
- Xero integration multicurrency guidance:
  https://developer.xero.com/documentation/best-practices/data-integrity/multicurrency/
- Xero Central multicurrency overview:
  https://central.xero.com/s/article/About-multicurrency
