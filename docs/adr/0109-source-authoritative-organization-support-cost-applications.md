# ADR-0109: Source-authoritative Organization Support Cost Applications

**Status:** Accepted (founder ruling, Phase 21 grill session — D20)

## Context

Some missions organizations apply exact organization-incurred services or
direct ministry costs to an organization-controlled support balance. Examples
can include required training or an exact usage-attributed service cost. Those
facts do not safely fit every existing lane: D3 owns administrative assessments,
D4 owns compensation-linked employer costs, D10/D13 own claimant and
organization-paid expense effects, and Phase 20 D19 owns processor-cost
attribution. Treating Phase 21 D20 as a fallback whenever one of those products
is disabled would silently duplicate or relabel economics.

Phase 21 D21 is another categorical boundary, not a residual source family.
Asset valuations, appraisals, sales, brokerage, liquidation, disposition, and
proceeds costs remain inside D21's source-mode-honest realization contract and
its pinned Realized Support Basis treatment. They are never D20 occurrences or
Phase 20 D19 processor costs, even when a provider uses a generic `fee` label.

The external source also remains mutable and provider-specific. Bills, vendor
credits, payroll/benefits records, processor costs, AP payments, and GL postings
have different identities and finality. A record's existence does not prove an
eligible Field Account effect. At the same time, importing a whole AP or
benefits ledger would turn Phase 21 into accounting, payroll, or benefits
software and make an uncommon tenant feature visible to everyone.

## Decision

> **C-prime-amended-and-hardened (C-prime-R) — an absent-unless-enabled,
> source-authoritative Organization Support Cost Application lane for only
> exact source-final, purpose-compatible residual organization service/direct-
> cost occurrences whose canonical semantic family—not configuration state—is
> exclusively owned by D20 rather than D3, D4, or D10/D13; activated
> prospectively at one source-family half-open boundary through capability-
> certified source-admission contracts, one canonical economic-occurrence root,
> and exclusive cross-lane coverage; with organization-absorbed as the safe
> default, finite tenant-owned bearing treatments, non-calculating evidence-
> backed allocation, private bounded staging, one CAS-published immutable per-
> currency conserving manifest with no unresolved target admitted to close,
> purpose-typed non-reusable Field Account Funding Coverage, and D1-only
> recognition as a D11-balanced same-currency Field Account Occurrence;
> ordinary applications and carryforward constrained by exact nonnegative
> capacity, while mandatory source-owned adverse corrections remain append-only
> and may expose a visible D11 deficit; optional advanced bounded carryforward
> through non-overlapping minor-unit tranches and explicit append-only successor
> disposition rather than worker debt, AP, availability, or silent expiry;
> source-version-pinned deterministic append-only corrections; exact externally
> supplied currency results only; independently authoritative source, Field
> Account, publication, accounting, and external-payment truth; current Phase
> 20 accounting darkness until separately certified posting ownership; complete
> structural tenant isolation and private evidence; and one quiet exception-
> first experience that is invisible when disabled and shows missionaries only
> authorized grouped post-close effects—without fallback ownership, arbitrary
> debits, unresolved-close completeness, participant-derived allocation,
> whole-ledger ingestion, retroactive reclassification, discretionary overdraft,
> live-provider close dependency, duplicate posting, sensitive-detail exposure,
> or Asym benefits, payroll, AP, GL, FX, budget, or formula authority.**

### Authority and lifecycle

Canonical semantic family fixes the one application owner. Disabling or failing
to configure D3, D4, D10/D13, or the separately governed Phase 20 D19 processor-
cost path does not move that family's facts into Phase 21 D20. D21 valuation,
sale, brokerage, liquidation, disposition, and proceeds-cost facts likewise
cannot enter D20 under any configuration. A canonical
Support Cost Economic Occurrence Root joins aliases for one real-world cost and
prevents cross-source and cross-lane duplication.

Each enabled residual family is admitted prospectively through a versioned
Support Cost Source Admission Contract. The contract pins exact source scope,
object/line identity, semantic family, source-specific finality and correction
events, completeness watermark, currency/precision, adapter/schema version,
and capability expiry. Phase 21 consumes persisted qualified evidence and does
not call a live provider during Support Cycle close.

The internal progression is Source Observation → Organization Support Cost
Occurrence → Application Determination → CAS-published Application Manifest and
purpose-typed Field Account Funding Coverage → D1 Support Cycle close. Only the
close creates a D11-balanced same-currency Field Account Occurrence. Unresolved
work is never close-complete and contains only its smallest proved target.

The tenant chooses one finite prospective treatment per certified family:
organization absorbed by default, Field Account borne, reviewed exact split,
or review required. Allocation distributes an exact source-final amount; it
never calculates one from donations, balances, participant count, a budget, or
an arbitrary formula. Each manifest conserves exact minor units per currency,
and different currencies are never added.

Ordinary applications and carryforward cannot exceed exact nonnegative capacity
or create a discretionary deficit. Mandatory source-owned adverse corrections
still append in full and may expose a visible D11 deficit; they never become a
silently clipped cost, carryforward tranche, AP item, payment, availability, or
worker debt. Optional carryforward is advanced, prospective, bounded by amount
and age, reserved once in non-overlapping tranches, and always ends through an
explicit append-only absorbed or review successor. It never silently expires.
Credits and corrections stay with the original application owner and pinned
versions and append exact deltas through a later close. D5 owns any legitimate
retired-account succession.

### Downstream and experience boundaries

Phase 21 may emit a PII-minimized **Support Cost Accounting Candidate Handoff**,
but that object is deliberately not called accounting-ready. Every current
Phase 21 D20 observation, policy, occurrence, determination, manifest, coverage,
carryforward, and candidate handoff is accounting-dark. Only a future, separately
approved Phase 20 source contract may admit a closed economic occurrence after
accountant-confirmed semantics, compatible Posting Profile treatment, positive
nonduplicate/unposted proof, and Phase 20 D17 posting ownership. QBO/Xero remains
authoritative for posted books and final reconciliation.

The feature is structurally absent when disabled, unauthorized, zero-work, or
irrelevant. Only an authorized optional-feature settings row remains
discoverable. Clean work folds into the existing Support Cycle review; only
cause-owned exceptions enter D11's queue. Missionaries see only a closed,
nonzero, D9/D12/Phase 12/D19-authorized grouped effect in existing activity or
statements, with exact ISO currency, before/effect/after bridge, and through-
date. They never see source-sensitive details, debt/payment/AP/payroll jargon,
or a claim that support is available or withdrawable.

## Consequences

- Tenants that need exact residual support costs gain a bounded source-backed
  path without turning staff evidence into arbitrary debits.
- Tenants that do not need the capability receive no new routine UI, queue,
  setup burden, notification, projection, or empty state.
- The model requires source-family certification, immutable cross-lane coverage,
  private evidence, forced coarse Tenant RLS, the Phase 12 server PDP, exact
  per-currency conservation, CAS/idempotency, drift repair, and production-
  shaped isolation/concurrency/accessibility/usability proof.
- Phase 21 does not become benefits, payroll, AP, GL, FX, budgeting, or formula
  software, and Phase 20 receives no new posting recipe from this decision.

## Rejected alternatives

- keeping every residual cost external and recreating unexplained balance
  adjustments in spreadsheets;
- forcing every residual cost into assessment, compensation, expense, or
  processor-cost semantics;
- fallback ownership based on whichever feature is enabled;
- whole-ledger ingestion, arbitrary debit/journal entry, custom formula/rules,
  participant-derived allocation, mixed-currency totals, or discretionary
  overdraft;
- live provider calls inside close, unresolved-as-complete, blind retry, mutable
  history, retroactive reclassification, dual write, or ordinary backfill;
- treating candidate handoff, provider posting, AP/payment, QBO/Xero, or task
  status as Field Account truth; and
- a standalone module, queue, zero card, per-cost notification, or sensitive
  missionary disclosure.

## Related decisions

- [ADR-0090 — Finance-closed Field Account cycles](./0090-finance-closed-field-account-cycles.md)
- [ADR-0092 — Bounded prospective Administrative Assessment Profiles](./0092-bounded-prospective-administrative-assessment-profiles.md)
- [ADR-0093 — Contract-referenced compensation funding](./0093-contract-referenced-compensation-funding.md)
- [ADR-0099 — Claim-level expense truth and purpose-routed tenant AI](./0099-claim-level-expense-truth-and-purpose-routed-tenant-ai.md)
- [ADR-0100 — Layered Field Account integrity and cause-owned repair](./0100-layered-field-account-integrity-and-cause-owned-repair.md)
- [ADR-0108 — Organization-controlled Support Assignments with separated access](./0108-organization-controlled-support-assignments-and-separated-access.md)
- [ADR-0110 — Source-mode-honest Noncash Support Realization](./0110-source-mode-honest-noncash-support-realization.md)
- [Phase 20 accounting boundary](../prds/sitestacker-parity/phase-20-accounting-exports-reconciliation.md)
- [Phase 21 decision log](../prds/sitestacker-parity/phase-21-field-accounts-decision-log.md)
