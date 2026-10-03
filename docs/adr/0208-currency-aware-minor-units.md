# ADR-0208: Currency-aware minor units

**Status:** Accepted (Phase 2 Currency module, with explicit later owner amendments).

This records the settled target contract requested by [AL-481](https://github.com/Asymmetric-al/core/issues/481), not implementation, provider qualification, or activation evidence.

## Context

The earlier money type displayed amounts using `/100` and accepted major-unit
input using `×100`. Those expressions silently assume two decimal places. JPY
and KRW have zero decimal places; BHD and KWD have three. A blanket cents rule can
misstate or mischarge money before any FX feature exists. Ledger, giving,
recurring, receipt, refund, and reporting work must consume the correct primitive
from the start rather than inherit scattered USD assumptions.

## Decision

Represent money as **checked integer minor units plus a validated ISO-4217
currency code**. Parsing must preserve exact units and reject invalid precision
or values rather than silently round or store floating major units. Currency
metadata supplies the exponent and provider-specific rules; callers do not embed
`/100`, `×100`, or a universal two-decimal convention.

The authoritative metadata is a TypeScript constant in `packages/api`, mirrored
to the `currency_metadata` seed table for database-boundary exponent lookup and
unknown-code rejection by canonical owners. The seed is a mirror, **not a second
independently edited authority**. Shared helpers encapsulate this knowledge for
both giving and CMS consumers, without importing CMS runtime into giving:

- `minorUnitExponent(code)` supplies the currency exponent.
- `formatMoney(minorUnits, code)` formats the value; presentation also consumes
  an explicit canonical locale.
- `parseMoneyToMinorUnits(input, code)` produces checked integer units.
- `isSupportedCurrency(code)` checks metadata support.
- `assertTransactable(code, tenantSettlementCurrency)` enforces the Phase 2
  transaction allowlist against the independently resolved settlement context.

Locale controls presentation, never currency inference or transaction authority.
Keep Stripe/provider exceptions inside the module and qualified adapters:
ISK/UGX compatibility representations, HUF/TWD charge-versus-payout quirks, and
three-decimal constraints cannot be generalized into one exponent-only provider
conversion. Provider-specific amount constraints, including the three-decimal
last-digit rule, remain distinct from the canonical currency value.

**Comprehensive metadata is not comprehensive transactability.** Phase 2 permits
only presentment currency equal to the resolved settlement currency. The historical
helper parameter name does not make a mutable Tenant default a money owner:
Phase 7/20 Legal Entity and exact Settlement Account Binding govern the financial
context, and financial roots freeze their owner-resolved facts. Site currency is a
presentation/policy facet, not a merchant selector.

Phase 24 D61 may later widen donor presentment only through server-owned Payments
qualification for the exact current Tenant, environment, Legal Entity, Settlement
Account Binding, connected account, route/cart, frequency, amount, and payment
method. A Site setting, locale, provider's global currency list, or client choice
cannot authorize a currency. Phase 20 settlement/conversion evidence does not
itself widen the donor transaction allowlist.

## Trade-offs and alternatives

Keeping the two-decimal convention until the first non-USD launch would save
immediate primitive and seed-mirror work, but embed wrong arithmetic in each
new financial consumer. Scattered per-caller exceptions would duplicate provider
knowledge and make parser, display, database, and provider paths disagree.

The shared currency-aware primitive costs metadata maintenance, exact parsing,
provider adapters, and a consistently maintained seed mirror ahead of launch.
That cost is accepted for money correctness even while the transaction allowlist
remains narrow. Comprehensive metadata lets callers validate and represent money
without claiming that the platform can transact every represented currency.

## Consequences

Phase 13 ledger/giving acceptance, Phase 15 batch input, Phase 16 recurring terms,
Phase 7 receipt facts, Phase 18 rendered documents, refunds, history, staff and
reporting projections, and provider callers must carry the same checked amount
and validated currency. Entry, presets, fees, limits, review, confirmation, and
idempotency paths cannot reintroduce floating major units or implicit USD.
Currency correctness and lossless provider round-trips remain qualification work
for the owning implementation and any later currency launch.

This decision introduces no FX launch or editable exchange-rate authority.
Reserved rate-snapshot shapes may later reference or project immutable Phase 20
provider evidence. Site reporting currency is a display/reporting preference,
never QBO home currency, Xero base currency, or accounting authority. Broader
presentment and settlement lanes remain separately qualified owner contracts.

## Related contracts

- [Phase 2 PRD](../prds/sitestacker-parity/phase-02-site-locale-currency-foundation.md#deep-modules-built-to-be-tested-in-isolation)
- [Legal Entity glossary](../../CONTEXT.md)
- [Platform money-integrity principle](../../openspec/specs/platform-principles/spec.md#requirement-operational-truth-and-money-integrity)
- [Platform Site/financial boundary](../../openspec/specs/platform-boundaries/spec.md#requirement-site-is-a-tenant-owned-presentation-and-attribution-entity)
- [Site before ledger](0207-site-before-ledger-with-locale-and-currency-facets.md)
