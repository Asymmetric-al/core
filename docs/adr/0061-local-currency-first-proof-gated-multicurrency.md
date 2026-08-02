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
