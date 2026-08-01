# Phase 20 D9 — Mode-Honest Processor Settlement Evidence

**Evidence status:** supporting research, not the product specification
**External-source verification date:** 2026-07-26
**Decision authority:** the ratified Phase 20 decision log remains authoritative
**Scope:** Stripe processor-settlement evidence, accounting handoff, comparable
fintech patterns, and the guardrails required by D9

## How to read this note

- **Verified fact** describes current provider-owned documentation.
- **Phase 20 implication** is Asym's design conclusion from that evidence and
  the ratified D1–D8 accounting contracts.
- Provider documentation proves provider behavior, not GAAP treatment or a
  tenant's accounting policy. D4's versioned accountant-confirmed policy
  remains authoritative for the Accounting Effect and Accounting Release.

## Primary-source findings

### Stripe exposes two materially different evidence conditions

**Verified facts**

- For supported standard automatic payouts, Stripe maintains the association
  between a payout and its contributing Balance Transactions. Stripe instructs
  integrations to list all Balance Transactions for the payout, paginate the
  full result, and retrieve the composition after the payout is paid or its
  reconciliation is complete.
  [Stripe reconciliation integration](https://docs.stripe.com/plan-integration/get-started/reporting-reconciliation),
  [payout reconciliation](https://docs.stripe.com/payouts/reconciliation)
- A Payout has both transfer status and `reconciliation_status`.
  `reconciliation_status` can be `completed`, `in_progress`, or
  `not_applicable`; Stripe documents completed composition only for supported
  standard automatic payouts. A payout can also initially appear paid and
  later fail.
  [Stripe Payout object](https://docs.stripe.com/api/payouts/object)
- Manual payout timing breaks transaction-to-payout attribution. Stripe's
  reporting guidance therefore treats the Stripe balance more like a bank
  account for manual payouts rather than promising an exact payout batch.
  Instant payouts are also not attributable to an exact transaction
  population.
  [Stripe report selection](https://docs.stripe.com/reports/select-a-report),
  [payout reconciliation](https://docs.stripe.com/payouts/reconciliation)
- With automatic payout splitting, Stripe can assign composition to one
  primary payout while secondary payout objects have
  `reconciliation_status=not_applicable`; requesting composition for a
  secondary payout can fail. Same date and amount do not prove a relationship.
  [Stripe automatic payout splitting](https://support.stripe.com/questions/automatic-payout-splitting)

**Phase 20 implication**

Asym needs exactly two evidence lanes in one workspace:

1. **Exact automatic-payout composition** when Stripe declares that
   composition complete and Asym has retrieved every page.
2. **Stripe-balance-period evidence** for manual, instant, split-secondary, or
   otherwise non-attributable payouts.

The second lane may prove provider activity and the transfer, but it must say
plainly that Stripe did not identify the individual transactions composing
that payout. Asym must never create certainty with same-day, nearest-amount, or
other fuzzy matching.

### Safe arithmetic is provider-atomic and currency-bounded

**Verified facts**

- A Stripe Balance Transaction is the immutable atomic accounting building
  block. It records `amount`, `fee`, and `net`, where `net = amount - fee`,
  together with currency, source, status, type, reporting category, and
  exchange-rate evidence where applicable.
  [Stripe Balance Transaction object](https://docs.stripe.com/api/balance_transactions/object)
- Stripe recommends `reporting_category`, rather than raw transaction `type`,
  as the stable accounting-oriented classification.
  [Stripe reporting categories](https://docs.stripe.com/reports/reporting-categories)
- Minimum-balance holds and releases and Instant Payout advance funding can
  create real balance movements that are not gifts, ordinary fees, refunds, or
  disputes.
  [minimum balances](https://docs.stripe.com/payouts/minimum-balances-for-automatic-payouts),
  [Instant Payout advance funding](https://docs.stripe.com/payouts/instant-payouts-with-advance-funding)

**Phase 20 implication**

For a supported completed automatic payout, Asym proves both equations without
mixing currencies:

```text
sum(all paginated payout-content BalanceTransaction.net) = payout.amount
payout.balance_transaction.net = -payout.amount
```

The content plus the payout debit therefore nets to zero in the same Stripe
balance currency. Asym preserves each atomic `amount`, `fee`, and `net`; it
does not subtract an embedded fee a second time. A standalone fee, reserve,
advance, foreign-exchange, or adjustment row remains its own movement.

Unknown future `reporting_category` or raw `type` values must be ingested and
preserved. They create a bounded classification exception before Accounting
Release; they do not crash ingestion, disappear, inherit a guessed category,
or become an unreviewed suspense plug.

### Transfer, bank deposit, and accounting posting are separate truth

**Verified facts**

- PayPal's Disbursement Reconciliation Report, Square's Payout Entries, and
  Adyen's Settlement Details/Reconciliation reporting expose provider-owned
  transfer composition and adjustment detail rather than treating a net
  deposit as revenue truth.
  [PayPal Disbursement Reconciliation Report](https://developer.paypal.com/docs/reports/reference/disbursement-reconciliation/),
  [Square List Payout Entries](https://developer.squareup.com/reference/square/payouts-api/list-payout-entries),
  [Adyen Settlement Reconciliation Report](https://docs.adyen.com/reporting/settlement-reconciliation-report)
- Shopify presents a payout balance equation and categorized gross, fee, and
  net activity separately from revenue reporting.
  [Shopify payout reconciliation](https://help.shopify.com/en/manual/payments/shopify-payments/payouts/payout-reconciliation-report)
- QuickBooks Online uses Undeposited Funds to collect receipt activity before
  grouping the exact amounts that appear as one real bank deposit.
  [QuickBooks Online bank deposits](https://quickbooks.intuit.com/learn-support/en-us/help-article/bank-deposits/record-make-bank-deposits-quickbooks-online/L2BBZOPdr_US_en_US)
- Xero distinguishes transaction creation and clearing-account flows from the
  staff-owned reconciliation of bank-statement lines.
  [Xero bank-transaction mapping](https://developer.xero.com/documentation/best-practices/categorising-transactions/bank-transaction-mapping/),
  [Xero bank-statement API boundary](https://developer.xero.com/documentation/api/accounting/bankstatements)
- Modern Treasury models reconciliation exceptions as inspectable work with
  source evidence and resolution rather than silently forcing a match.
  [Modern Treasury reconciliation](https://docs.moderntreasury.com/platform/docs/reconciliation-overview)

**Phase 20 implication**

The durable sequence is:

```text
Phase 13 money facts
  → Stripe balance activity
  → processor payout composition or balance-period evidence
  → separate bank-deposit match
  → D4 Accounting Effect
  → immutable Accounting Release
  → QBO/Xero posting and readback
  → accounting-system reconciliation
```

`payout.paid` means Stripe reports a provider transfer state. It does not prove
that the destination bank posted the deposit, that the deposit was reconciled,
or that QBO/Xero accepted the correct accounting effect. Those axes remain
separately visible and independently recoverable.

## Failure, recovery, and tenant-safety contract

- Stripe webhooks are asynchronous hints: delivery may be duplicated, delayed,
  retried, or out of order. A signed, account-scoped webhook starts work;
  scheduled paginated API sweeps and bounded backfills prove completeness.
  [Stripe webhooks](https://docs.stripe.com/webhooks)
- Every provider read is scoped server-side to the exact connected account and
  pinned Tenant, Legal Entity, Settlement Account Binding, environment,
  livemode, and currency. Event or object metadata alone is not a tenancy
  authority.
  [Stripe Connect authentication](https://docs.stripe.com/connect/authentication)
- Provider paging and retries use bounded concurrency, exponential backoff with
  jitter, durable cursors, replay-safe upserts, and resumable checkpoints.
  Tenant-configurable retry knobs are unnecessary and unsafe.
  [Stripe rate limits](https://docs.stripe.com/rate-limits)
- `in_progress` is shown as **Waiting for Stripe detail**, not as failed.
  A failed or reversed payout updates transfer truth without deleting its prior
  evidence. A late component, category exception, source-coverage gap, bank
  difference, or outcome ambiguity stops only the affected settlement or
  Accounting Release.
- Provider identifiers are unique only inside their pinned connected-account
  and environment scope. Cross-tenant caches, queues, idempotency identities,
  artifacts, and lookup fallbacks are prohibited.
- The immutable composition snapshot records the provider/API contract
  version, retrieval interval, complete-page evidence, raw provider
  identifiers, digests, and supersession lineage. Historical evidence is not
  recomputed from a mutable current Stripe response.

## Bookkeeper-first UX

Use one quiet page: **Accounting → Reconciliation → Stripe settlements**.

The list answers, without exposing raw JSON:

- Which Legal Entity, destination, currency, and payout is this?
- What were gross activity, fees, refunds, disputes, reserves/adjustments, and
  net?
- Is composition exact, waiting, or unavailable from Stripe?
- Did the bank deposit match?
- Is the Accounting Release ready, blocked, delivered, or reconciled later in
  QBO/Xero?
- What is the single next action, if any?

The detail view keeps five separate status axes: **Stripe composition**,
**source coverage**, **provider transfer**, **bank tie-out**, and **accounting
handoff**. Manual or instant payout users see one calm explanation and the
option to adopt standard automatic payouts for exact future composition; their
current workflow remains supported. Clean settlements require no routine
approval. Exceptions are grouped by cause, affected count and amount, owner,
and one repair action.

## Ruthless adversarial findings

| Concern                            | What could go wrong and why it matters                                                                                    | Severity / likelihood | Permanent prevention                                                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness and edge cases         | Treating all payout modes as exact breaks on manual, instant, split, reserve, advance, FX, and delayed-composition cases. | High / High           | Two provider-defined evidence lanes; no heuristics; explicit unsupported-evidence state.                                              |
| Data integrity and footguns        | Double-counted fees, partial pagination, mixed currencies, or guessed categories produce plausible but wrong journals.    | Critical / Medium     | Atomic Balance Transactions, complete-page proof, currency partitions, equation checks, and unknown-category exceptions.              |
| Tenant safety and privacy          | A platform webhook or cached provider ID can be attributed to the wrong connected account or Legal Entity.                | Critical / Medium     | Server-side account scoping and compound tenant/entity/destination/environment identities throughout.                                 |
| Hidden coupling and technical debt | Letting Stripe objects become gift truth or bank-match truth makes provider changes rewrite donor and accounting history. | High / High           | Preserve Phase 13, settlement, bank, D4, Accounting Release, and provider-posting authorities separately.                             |
| Failure and observability          | Webhook loss, reordering, rate limits, or payout reversal can leave silent gaps or duplicate work.                        | High / High           | Webhook hints plus scheduled sweeps, idempotent folds, cursors, typed exceptions, metrics, and append-only recovery.                  |
| Scalability and operations         | Per-gift synchronous retrieval and unbounded retries fail during high-volume seasons.                                     | High / Medium         | Payout-centered pagination, bounded queues, backoff, incremental sweeps, and exception-only staff work.                               |
| UX friction                        | One blended “reconciled” badge hides uncertainty; raw provider detail overwhelms bookkeepers.                             | High / High           | Separate plain-language axes, progressive detail, truthful limitations, one next action, and no routine approval.                     |
| Over-engineering                   | A configurable matching/rules engine creates opaque behavior and ongoing support burden.                                  | High / Medium         | Exactly two evidence lanes, fixed arithmetic, fixed classifications plus review, and no tenant-authored matching language.            |
| Dependency and migration           | Stripe adds categories or changes a supported evidence condition.                                                         | High / Medium         | Preserve raw evidence, pin tested contracts, classify unknowns safely, and version composition snapshots.                             |
| Security and other hazards         | Replay races, stale reads, and mutable snapshots can duplicate or overwrite settled evidence.                             | Critical / Medium     | Replay-safe compound keys, compare-and-swap finalization, immutable evidence, concurrency tests, and provider-account negative tests. |

## Lean D9 recommendation

Adopt **C-prime-R — mode-honest processor settlement evidence**:

1. Exact, immutable, fully paginated payout composition only when Stripe
   supplies and completes it.
2. Truthful Stripe-balance-period evidence for every non-attributable mode,
   without invented membership.
3. Provider transfer, bank tie-out, source coverage, and accounting handoff
   remain separate authorities.
4. Webhooks accelerate; scheduled API reconciliation proves completeness.
5. One exception-first bookkeeper workspace, one next action, and no general
   matching-rule builder.

This is the smallest design that remains correct across Stripe payout modes,
preserves tenant flexibility, supports QBO/Xero clearing workflows, and avoids
both brittle exactness claims and a sprawling reconciliation subsystem.
