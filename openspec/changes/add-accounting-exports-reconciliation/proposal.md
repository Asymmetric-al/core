# Add Accounting Exports And Reconciliation

## Why

Finance staff need to explain how canonical gifts, offline deposits, Stripe
settlement activity, bank deposits, expenses, processor costs, corrections,
and retained currencies become balanced accounting work in QuickBooks Online
or Xero. The platform currently has contribution and batch-entry authorities,
but it does not yet have one product that can prove processor settlement
coverage, help staff compare expected deposits with bank evidence, compile
immutable balanced accounting releases, deliver them safely, recover uncertain
provider outcomes, and preserve evidence without becoming a second general
ledger.

Phase 20 adds that accounting handoff. It serves many-fund missions
organizations while preserving tenant control over their existing books. It
keeps gift, settlement, bank, expense, accounting-provider, and final
reconciliation truth separate; uses one quiet, exception-first finance
workspace; and gives bookkeepers first-class direct QBO and Xero integrations
plus an artifact-always recovery and audit path.

## What Changes

- Add one tenant-, actor-, and Legal-Entity-scoped Accounting Operations
  service and one derived **Ready for Accounting** workspace.
- Add immutable, source-covered **Accounting Releases** that pair a typed
  Accounting Posting Intent with one balanced provider-neutral Canonical
  Accounting Effect.
- Always retain a machine-verifiable Accounting Evidence Artifact and require
  each release to use exactly one delivery lane: direct provider delivery or a
  staff-mediated Accounting Delivery Package.
- Add prospective, tenant-owned Posting Profiles, Designation Mapping
  Versions, Accounting Reporting Targets, and capability-certified QBO and
  Xero Carrier Plans.
- Add mode-honest Stripe settlement evidence, Expected Bank Arrivals, and
  bounded Bank Match through statement import, optional certified read-only
  bank evidence, or explicit staff-confirmed evidence. QBO or Xero remains the
  final reconciliation authority.
- Add policy-bounded compensating releases, tenant-controlled release cadence,
  cause-owned Accounting Exception Cases, and shared Mission Control follow-up
  that never becomes accounting truth.
- Add destination-pinned QBO and Xero authorization, workload-shaped certified
  capacity, provider-native delivery/readback, capability-certified import
  packages, and source-family Posting Ownership Cutovers.
- Add the accounting-ready boundary for Phase 21 expense facts, organization-
  absorbed processor costs by default with one fee-cover-first
  designation-borne mode, and local-currency-first settlement with
  proof-gated retained-currency lanes.
- Preserve append-only evidence, exact provider identities, honest ambiguity,
  tenant fairness, accessible progressive disclosure, and quiet healthy-state
  UX across every workflow.

## Capability Deltas

- Add capability: `accounting-operations`
- Modify capability: `platform-boundaries`

The existing `platform-boundaries` delta remains the durable authority and
Legal Entity anchor. The new `accounting-operations` capability owns the
complete observable D1-D20 product behavior without duplicating source-domain
or accounting-provider authority.

## Dependencies

- Phase 7 and Phase 13 supply immutable legal-issuer, contribution,
  allocation, correction, currency, and ledger facts.
- Phase 14 supplies non-cash recognition context only where a posting policy
  explicitly permits it; recognition never becomes cash.
- Phase 15 supplies posted offline Entry Batches and Deposit Groups.
- Phase 16 supplies expected-cash context only; commitments are not received
  cash.
- Phase 6 and Phase 17 supply governed staff notifications where Phase 20
  needs human attention.
- Phase 12 supplies tenant capabilities, permissions, assurance, delegation,
  and protected-action governance.
- Phase 21 remains authoritative for expense reports, receipts, approval,
  reimbursement obligations, payments, and Field Accounts. The D18 lane stays
  structurally unavailable until its source-owned handoff exists.
- Stripe, bank evidence, QBO, and Xero remain external authorities at their
  declared boundaries. Their live capabilities must be proved rather than
  assumed.

## Out Of Scope

- A general ledger, bank register, bank-reconciliation engine, close process,
  accounts-payable subledger, payroll system, tax engine, or financial-
  statement restatement product.
- Tenant-authored accounting code, arbitrary posting recipes, an unrestricted
  mapping DSL, custom provider API calls, or a generic integration marketplace.
- Automatic provider-object creation without explicit proof and review,
  date-only posting cutovers, dual writes, fuzzy historical adoption, or whole-
  history replay.
- Treating Stripe payout status as bank arrival, Bank Match as final
  reconciliation, provider acceptance as release correctness, or a Mission
  Control task as accounting resolution.
- QuickBooks Desktop live sync, Sage, Aplos, NetSuite, or other accounting
  providers in the launch contract. Capability-certified artifacts may support
  later provider-specific work without weakening the QBO/Xero launch.
- Direct bank connectivity as a launch requirement. Statement import and
  explicit staff evidence remain complete supported lanes.
- Phase 21 expense capture, receipt storage, approval, reimbursement payment,
  or Field Account behavior.

## Release Posture

This change is an implementation-ready product and architecture contract. It
does not implement Phase 20, create credentials, run migrations, connect a
tenant to a provider, post accounting, or dispatch implementation tickets.
Runtime work remains gated by predecessor proof, provider certification,
security review, production-shaped tests, and explicit implementation
dispatch. The confirmed `AccountingOperationsService` public testing seam is
binding.
