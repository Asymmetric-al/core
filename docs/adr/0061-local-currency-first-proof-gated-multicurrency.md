# Local-currency-first, proof-gated multicurrency accounting

**Status:** Accepted (founder ruling, Phase 20 grill session — D20)

> Working record:
> `docs/prds/sitestacker-parity/phase-20-accounting-exports-reconciliation-decision-log.md`

## Context

A donor's presentment currency, Stripe balance or settlement currency, payout
currency, accounting-provider home or base currency, and reporting currency are
different authorities. Most tenants will use the simple path: Stripe converts a
foreign-currency payment into the tenant's ordinary local settlement currency,
and finance accounts for the exact local-currency result. Some tenants may
instead retain and pay out a supported foreign settlement currency.

Neither Stripe's mutable current balance nor a payout's net amount is adequate
posting truth. They cannot, by themselves, preserve the exact gross amount,
provider fee, net amount, provider category, conversion evidence, and source
relationship required by the Phase 20 accounting contracts. A retained
foreign-currency lane also depends on independently changeable Stripe, bank,
QuickBooks Online or Xero, subscription, currency, and account capabilities.

Asym is not a foreign-exchange engine or general ledger. Phase 20 must preserve
exact provider evidence and hand off a balanced economic effect without
manufacturing a conversion rate, revaluation, realized gain or loss, or
cross-currency equivalence.

## Decision

Phase 20 is **local-currency-first**. The ordinary path uses one quiet,
home-or-base-aligned settlement-currency lane when Stripe settles into the
currency that exactly equals the destination's certified QBO `HomeCurrency` or
Xero `BaseCurrency`. A currency the destination can merely accept through
multicurrency is not the quiet default. The ordinary lane requires no
multicurrency setup in Asym.

For this ordinary path:

- the Accounting Effect is derived from the exact, account-scoped Stripe
  Balance Transaction, including its integer-minor-unit `amount`, `fee`, `net`,
  currency, balance type, reporting category, source relationship, provider
  timestamps, and provider-supplied nullable exchange-rate evidence;
- `amount - fee = net` is proved in that Balance Transaction's currency;
- the donor's source amount and presentment currency remain separate immutable
  contribution facts;
- provider conversion facts remain separate immutable **Provider Conversion
  Evidence**, including explicit from and to currencies, amount basis, rate
  direction, source, effective time, and provider-attributed conversion costs
  where the provider exposes them; and
- the mutable Stripe balance, a Dashboard total, or payout net is never used as
  a substitute for those atomic facts.

Each Accounting Effect, Accounting Release, Provider Delivery Plan, Accounting
Delivery Package, and Bank Match has exactly one currency. Currency participates
in identity, idempotency, control totals, settlement partitioning, and account
selection. Asym never adds, nets, allocates, or exactly matches unlike
currencies merely because their displayed values are equal.

A tenant may prospectively activate a retained foreign-settlement-currency lane
only through a versioned **Settlement Currency Lane Version**. Activation is
proof-gated to one Tenant, Legal Entity, Stripe account and environment, balance
type, settlement currency, exact payout destination, Accounting Destination
Connection, and effective half-open interval. Its Capability Certificate must
prove:

- Stripe currently permits that settlement currency and payout configuration;
- the exact payout bank account accepts that currency;
- the destination accounting provider supports the currency under the tenant's
  current organization, region, subscription, and multicurrency configuration;
- the exact active QBO or Xero accounts and required provider objects carry the
  same currency; and
- the selected D7 or D8 provider-native carrier can preserve and read back the
  complete Canonical Accounting Effect without silent dimension or currency
  loss.

Certificates expire and are rechecked after material provider, bank,
subscription, account, destination, or currency changes. Asym does not
automatically enable QBO multicurrency, add Xero currencies, or make another
irreversible provider-side choice. Staff make such changes in the provider and
then use **Check again**.

QBO or Xero owns provider-native translation, home-currency totals, realized
and unrealized foreign-exchange treatment, and revaluation. Asym preserves the
provider's exact rate direction and evidence but never substitutes today's
rate, a staff-entered rate, an inferred rate, or a synthetic `1.0`. If the
provider-native lane cannot preserve the Canonical Accounting Effect, the
release remains not ready and retains its evidence-always artifact. A
staff-mediated D16 package may proceed only when its exact import surface is
independently certified for that currency and effect.

A refund, dispute, fee return, conversion cost, or later correction consumes
its own provider occurrence and Balance Transaction evidence, including its own
currency and rate when present. It creates an append-only D11 compensating
release rather than mechanically reversing the original local amount or
rewriting historical conversion evidence.

The D19 ordinary processor-cost allocator excludes foreign-exchange and
conversion-cost categories. Designation-borne ordinary processor cost is not
available when the eligible processor cost and source Designation allocation
do not share one proved currency basis. Asym never prorates a local-currency
fee across foreign-currency source lines. The affected exact ordinary cost is
organization-borne through D19's central target; if that target or its provider
capability is missing, the work remains not ready rather than accepting a staff
override.

Phase 24 continues to own which additional donor presentment currencies may be
offered at checkout. D20 only consumes authoritative currency and settlement
facts that an upstream source is already permitted to create; it does not
activate foreign-currency giving.

**Phase 24 D61 amendment (2026-08-30).** “Local-currency-first” at donor entry
means one nonauthoritative, country-level suggestion for an empty gift intent,
not location-owned money truth or Stripe Adaptive Pricing. The donor may choose
only from the intersection of the Site's enabled presentment currencies and the
payment owner's current exact qualification for the complete route/cart. Their
explicit choice wins for that gift intent, one cart remains one currency, and
the accepted money path freezes it before any provider effect. Missing or
ambiguous location uses the qualified Site default; when that is unavailable
but other qualified choices exist, the donor must choose explicitly; when none
exist, Giving fails closed without taking down the public Site. This behavior
does not enable retained settlement, calculate FX, change accounting, create a
currency preference, or require Checkout Sessions. D61 reuses this ADR's
presentment/settlement ownership and creates no second multicurrency
architecture.

**Phase 24 D62 amendment (2026-08-30).** Adding a presentment currency is one
ordinary **Site → Currencies** setup flow. Selecting `CAD — Canadian dollar`
automatically starts a read-only, Payments-owned qualification; there is no
separate certification wizard, provider matrix, synthetic test charge, or
provider-setting mutation. Setup proof is deliberately bounded: it proves the
current stable offering envelope for each named live Site financial route and
giving mode, while final checkout acceptance still re-proves the actual cart,
amount, cadence, payment method, binding, account, and provider contract before
creating any provider effect. Sandbox success is not live proof, and **Ready**
never promises issuer authorization or future renewal success.

Site policy remains the Tenant's desired currency ceiling; Payments remains the
sole qualification owner. A newly selected currency may be saved only when at
least one current route qualifies, partial readiness must name the exact mode,
and a Site default must qualify across every current entry that relies on that
default. Effective donor availability remains the intersection of Site intent
and current exact qualification. Unknown, stale, contradictory, or incomplete
evidence is never green. Later drift preserves Site intent and all historical
money while pausing only new affected currency/mode attempts until current
proof returns. Ordinary presentment conversion into an existing settlement
currency still requires no retained foreign balance, additional bank account,
QBO/Xero multicurrency, Adaptive Pricing, or FX engine.

**Phase 24 D63 amendment (2026-08-30).** A donor may deliberately change the
presentment currency of an unaccepted, editable gift intent. A pristine intent
changes immediately. When any entered/prefilled amount, fee choice, payment
selection/input, or provider session would be lost, Core keeps the original
intent untouched and first asks one consequence-specific confirmation. Success
creates one new monetary cart revision: revalidated purpose, cadence,
attribution, contact, tribute, and other currency-independent intent may stay;
all amounts, presets, fee-cover meaning, amount-derived claims, payment/
mandate/authorization state, browser payment state, and old attempt identity
clear. The donor then enters new amounts in the target currency. Core never
converts, rounds, or carries numeric digits across currencies.

D63 ends at the pre-acceptance boundary. A confirming, authenticating,
processing, capture-pending, successful, or outcome-unknown payment cannot
change currency, and an accepted contribution or recurring agreement is
immutable. The target currency and every preserved fact are re-proved before
the original clears; stale qualification, concurrency, authorization, or
provider-retirement ambiguity writes nothing. An attempted provider operation
is never reused for another currency. Stripe currently permits some
pre-confirmation PaymentIntent currency updates, so the Payments adapter may
update or replace only a still-unattempted, unexposed provider object when its
pinned contract proves stale execution impossible; this ADR chooses new Core
money identity without falsely claiming a provider prohibition. Draft revision
evidence follows ordinary bounded cart retention and never becomes permanent
ledger or donor history merely because the donor explored another currency.

**Phase 24 D64 amendment (2026-08-30).** Suggested gift amounts are optional,
reviewed native fundraising presentation, not FX output. Operational Postgres
owns one immutable, versioned **Site Suggested Amount Set** for each exact
Tenant, Site, ISO presentment currency, and one-time or exact Phase 16 recurring
cadence. A set contains zero to six unique positive integer-minor-unit amounts,
rendered in ascending order, with no automatic selection. Ordinary open giving
always retains a custom amount. An authorized save is the review and creates the next current
version prospectively; D64 creates no Payload money authority, approval queue,
FX source, Stripe Price, live inheritance, personalization engine, or
cross-currency/cross-frequency digit copy.

The set suggests only. Phase 13 owns the donor-selected Money and revalidates it
through the same acceptance path as custom input; accepted gifts, carts with an
explicit donor amount, recurring agreements, receipts, refunds, ledger, and
accounting never follow a later set revision. D61/D62 qualification still owns
whether a currency/cadence can be offered. Missing or intentionally empty sets
produce a clean custom-amount-only donor flow only while that context remains
qualified. D63 loads only the successful
target currency/frequency set and never auto-selects an amount. Amount-dependent
impact, matching, benefit, tax, or fee claims remain outside D64 until a
separately governed content contract can bind and invalidate them safely.

**Phase 24 D65 cross-reference (2026-08-30).** D65 consumes the successful
target set only after its separate line-scoped Donor Gift-Schedule Transition
clears source money and schedule meaning. It reuses D63's explicit
preserve/clear, revision, idempotency, and provider-safety primitives at
line/payment-group grain; it neither converts nor carries digits, maps preset
position, changes cart currency, or makes this FX ADR the owner of schedule
transitions.

Deliberate currency/cadence disablement retires a set from public use while
preserving history; later re-enable requires an explicit successor reaffirming
former values under current policy. A transient qualification pause preserves
the reviewed set but never permits custom input to bypass D61/D62/Phase 16.

Phase 21 D6 does not turn D20 certification into a universal Field Account
gate. A retained Stripe source may reference only the exact D20 settlement,
payout-destination, and accounting evidence its Phase 21 activation path
needs; offline-deposit and direct-credit paths qualify under their separate
Phase 21 D2 evidence contracts. Phase 21 owns Field Account activation,
admission, close, and balance truth, and QBO/Xero connectivity never becomes a
universal prerequisite for those authorities.

## Staff experience

Tenants on the ordinary path see one calm explanation, for example:

> Stripe converts foreign gifts to CAD. Asym sends Stripe's exact CAD gross,
> fee, and net amounts to Xero.

They do not see a multicurrency setup wizard. A currency detail card appears
only when foreign presentment activity exists or staff explicitly choose
**Keep and account for a separate currency balance**. It shows donor
presentment, Stripe balance currency, gross/fee/net, provider conversion
evidence, payout destination, and accounting home or base currency without
mixing those meanings.

Phase 24's ordinary presentment setup stays in the existing Site **Currencies**
card. The staff member chooses a currency, receives one inline result such as
**Ready for one-time and recurring gifts**, **Ready for one-time gifts ·
Recurring needs setup**, **Payment setup needed**, or **Couldn’t check right
now**, and completes one explicit save. A partial save clearly says that Site
intent applies wherever payment setup later qualifies; staff do not maintain a
route or payment-method matrix. Status is text-first and accessible, and an
exception exposes one cause-owned action such as **Finish payment setup** or
**Try again**, never raw Stripe identifiers or compliance detail.

The optional lane uses one review-first checklist, discloses provider
prerequisites and irreversible settings before staff leave Asym, previews the
exact accounting destination and carrier, and gives one contextual next action.
Missing, expired, contradictory, or drifted proof creates a cause-specific
accounting exception; it never silently falls back to a different currency or
posting plan.

## Consequences

- The common tenant path remains automatic, understandable, and free of
  unnecessary multicurrency administration.
- Gross gift truth, provider costs, conversion evidence, settlement, payout,
  bank arrival, accounting delivery, and provider reconciliation remain
  independently inspectable.
- Tenants that genuinely retain foreign balances keep a first-class path
  without forcing that complexity on everyone else.
- QBO and Xero remain authoritative for book translation and foreign-exchange
  accounting; Asym remains an evidence-preserving accounting handoff.
- A tenant cannot post a retained-currency lane until every material provider
  capability and exact destination binding is proved. This is intentional
  fail-closed behavior, not a generic provider outage.
- Rate, currency, partial-refund, zero-decimal-currency, destination-drift, and
  provider-readback fixtures become required certification and regression
  coverage.

## Boundaries and failure behavior

- No aggregate-current-balance, payout-net-only, or net-revenue accounting.
- No inferred conversion fee, market-rate lookup, editable provider rate, or
  Asym-authored foreign-exchange gain or loss.
- No cross-currency arithmetic, residual allocation, Bank Match, or balancing
  plug.
- No automatic provider-side activation of irreversible multicurrency
  settings.
- No currency conversion to make a bank record, provider object, or accounting
  plan appear to match.
- No retroactive lane activation, current-configuration reinterpretation, or
  mutation of an exported Accounting Release.
- A missing or contradictory Balance Transaction, unsupported currency,
  mismatched bank account, expired capability, or provider readback difference
  quarantines only the affected unreleased work through the existing D13
  Accounting Exception Case.
- Provider artifacts and evidence remain available even while direct delivery
  is unavailable; artifact availability is not evidence of accounting
  delivery, import, or reconciliation.

## Alternatives rejected

### Treat the Stripe balance or payout net as the accounting amount

Rejected because a mutable aggregate or net transfer does not preserve gross
gift, fee, category, conversion, and occurrence-level evidence and can produce
net-revenue accounting.

### Require every tenant to configure multicurrency accounting

Rejected because it adds irreversible provider settings and operational burden
to the dominant local-settlement workflow without improving its accounting
truth.

### Forbid retained foreign-currency balances

Rejected because some tenants have legitimate same-currency bank and accounting
workflows that QBO or Xero can represent when all capabilities are proved.

### Make Asym calculate translation and foreign-exchange gains or losses

Rejected because it would turn Asym into a competing accounting subsystem,
duplicate QBO/Xero policy, and create material rate, period, and revaluation
liability.

### Allocate local processor costs across foreign source amounts

Rejected because a numeric proportion does not establish a common currency
basis. D19 remains available only where exact source and processor-cost
evidence share one proved currency.
