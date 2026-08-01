# ADR-0050: Mode-honest processor settlement evidence

**Status:** Accepted (founder ruling, Phase 20 grill session — D9)

> Working record:
> `docs/prds/sitestacker-parity/phase-20-accounting-exports-reconciliation-decision-log.md`

## Context

Stripe exposes materially different settlement-evidence capabilities. A
supported standard automatic payout can expose its complete contributing
Balance Transactions after reconciliation completes. Manual payouts, Instant
Payouts, and some split-payout transfers do not expose exact
transaction-to-payout membership. Treating every transfer as an exact batch
would manufacture accounting certainty; treating every transfer only as a
balance interval would discard stronger provider evidence where it exists.

Processor transfer state also does not prove source coverage, destination-bank
arrival, Accounting Release delivery, or reconciliation inside QuickBooks
Online or Xero. Collapsing those authorities into one state would create
plausible but false financial completion.

## Decision

Phase 20 uses one normalized **Settlement Evidence Snapshot** with exactly two
truthful modes:

- **Payout-attributed evidence** is available only when the provider supports
  exact membership, reports composition complete, and Asym has retrieved and
  verified every page.
- **Balance-window evidence** preserves a bounded, contiguous account,
  balance-type, currency, and interval view when exact payout membership is not
  provider-supported. It never claims which individual transactions composed
  the transfer.

Every **Processor Payout Transfer** remains independently authoritative for its
provider-owned movement and lifecycle. **Processor Settlement Verdict**,
**Settlement Source Link** coverage, **Bank Match**, and **Accounting Release**
delivery and reconciliation remain separate derived or source-owned truths.
`payout.paid` is never bank-arrival or accounting-reconciliation proof.

Provider Balance Transactions are immutable atomic evidence. Calculations use
integer minor units, preserve `amount`, `fee`, and `net`, partition by exact
account, balance type, and currency, retrieve the payout debit separately, and
never subtract an embedded fee twice. Unknown provider categories are retained
as bounded classification exceptions rather than dropped, guessed, or posted
through a suspense plug.

Signed webhooks accelerate synchronization; scheduled, account-scoped,
fully-paginated API sweeps and resumable backfills prove completeness.
Provider evidence and later contradictions are append-only. Historical
snapshots and exported Accounting Releases are never rewritten.

The staff experience is one quiet, exception-first
**Accounting → Reconciliation → Settlements** workspace. It explains exact,
waiting, and balance-based evidence in plain language, exposes separate
composition, source-coverage, transfer, bank, and accounting axes, and gives
one safe next action. Clean settlements require no routine approval.

## Consequences

- Tenants may keep automatic, manual, or Instant payout modes; Asym explains
  the evidence trade-off without forcing a Stripe configuration.
- Standard automatic payouts receive the strongest provider-supported
  transaction-level proof.
- Non-attributable modes remain fully supported without fabricated membership.
- QBO and Xero receive immutable Accounting Releases through the clearing
  patterns ratified by D2-D8; settlement evidence does not become a second
  ledger or provider-delivery system.
- A generic processor rules engine, tenant-authored matching DSL, fuzzy final
  matching, editable provider evidence, and one mutable `reconciled` flag are
  deliberately excluded.
