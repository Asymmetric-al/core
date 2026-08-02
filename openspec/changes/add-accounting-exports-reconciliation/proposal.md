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
  allocation, correction, currency, and ledger facts, including the original
  noncash Contribution, legal donor, accepted purpose, gift date, valuation,
  receipt, supporter, and fundraising truth.
- Phase 14 may supply separate supporter-recognition credit where an accounting
  policy explicitly permits it. Recognition never becomes cash, disposition,
  or proceeds truth.
- Phase 15 supplies posted offline Entry Batches and Deposit Groups and owns the
  canonical append-only noncash asset-lot, disposition, proceeds, finality,
  evidence, and correction projection.
- Phase 16 supplies expected-cash context only; commitments are not received
  cash.
- Phase 6 and Phase 17 supply governed staff notifications where Phase 20
  needs human attention.
- Phase 12 supplies tenant capabilities, permissions, assurance, delegation,
  and protected-action governance.
- Phase 21 remains authoritative for expense workflow, policy decisions,
  Approved Expense Snapshots, Reimbursement Obligations, Field Account Funding
  Coverage, Field Account effects, and source-owned External Payment Occurrence
  evidence. Tenant payroll/AP/manual processes remain authoritative for
  execution. One mixed compensation/reimbursement payment retains one D17
  posting owner and one complete typed payment manifest; the D18 reimbursement
  slice cannot create a standalone release when payroll/AP owns the whole
  payment. The D18 lane stays structurally unavailable until its source-owned
  handoff exists, and a Compensation Handoff Package or reservation cannot
  substitute for that contract. Phase 21 D5 support-reallocation work is also
  unsupported and structurally dark in this Phase 20 generation—even when
  close-covered—until a later separately approved Phase 20 change certifies its
  exact source schema, accountant-confirmed semantics, Posting Profile recipe,
  and D17 owner. No JournalEntry, ManualJournal, or artifact fallback may bypass
  that gate.
- Phase 21 D7 compensation-handoff profiles, adapter certifications, Provider
  Draft Operations, provider acceptance/readback or permitted staff
  confirmation, and unknown/confirmed coverage remain Phase 21 evidence. None
  creates an Accounting Posting Intent or Accounting Release by itself.
  Payroll/AP authorization is not an Accounting Destination Connection; QBO
  and Xero Accounting objects, including Xero `DRAFT ACCPAY`, remain reachable
  only through a separately certified Phase 20 source contract with
  accountant-confirmed semantics and exact D17 ownership.
- Phase 21 D15 Reimbursement Handoff Packages, Delivery Profile Versions,
  Execution Claims, Handoff Coverage, Handoff Attestations, Handoff Operations,
  provider draft/input acceptance and readback, operation ambiguity, and
  residual-only route succession remain Phase 21 handoff evidence. None is an
  External Payment Occurrence or accounting-ready source. Only an independently
  eligible Approved Reimbursement Obligation or separately source-qualified
  External Payment Occurrence may cross D18. Handoff cannot assign the posting
  owner of a future payment, and QBO/Xero Accounting objects remain Phase
  20-only.
- Phase 21 D16 advances and claimant repayments remain source-owned operational
  lifecycles. Phase 20 admits only evidence-qualified Expense Advance Issuance
  Occurrence, separately certified Expense Advance Application typed
  accounting effect where applicable, Claimant Repayment Occurrence, and their
  cause-linked corrections. Cash claimant return and advance return remain
  distinct typed occurrences. Policies, authorization, operational settlement,
  subject and repayment decisions, uncertified requirements, residuals, tasks,
  raw observations, disputes/restitution review, and Field Account coverage
  remain accounting-dark. A Requirement may support receivable recognition
  only under a separately accountant-certified contract, and every admitted
  occurrence independently resolves D17 posting ownership.
- Phase 21 D19 Support Assignment identity may accompany an admitted Field
  Account occurrence only as exact source lineage. Support Assignment
  Participant Membership, workspace access, relationships, invitations,
  operational responsibility, notification preference, communication outcome,
  and `People & access` orchestration remain accounting-dark and cannot create
  or change accounting work. Participant-free Support Assignments are
  evaluated from their independently qualified economic source contract, not
  participant presence.
- Phase 21 D20 organization-support-cost observations, economic roots, bearing
  policies, applications, determinations, coverage manifests, carryforwards,
  Field Account Funding Coverage, closed effects, and the **Support Cost
  Accounting Candidate Handoff** remain unsupported and accounting-dark in
  this Phase 20 generation. They create no D18 source, Accounting Posting
  Intent, Accounting Release, artifact delivery, or provider operation. Phase
  20 D19 remains the exclusive processor-cost attribution and treatment lane;
  D20 cannot re-admit or duplicate exact provider costs or the Processor Cost
  Attribution Manifest. A later Phase 20 change may admit a D20 occurrence only
  after separately approving its exact source schema, accountant-confirmed
  semantics, close-covered occurrence contract, compatible Posting Profile
  recipe, positive unposted or differential proof, and D17 posting owner.
  JournalEntry, ManualJournal, expense-lane, or artifact fallbacks cannot bypass
  that gate.
- Phase 21 D21 **Noncash Support Realization Manifests**, Realized Support
  Basis, cost-treatment selections, D2/D11 close-covered Field Account effects,
  and corrections remain derivative, unsupported, and accounting-dark in this
  Phase 20 generation. The underlying Phase 15 disposition projection also has
  no current posting, artifact, or adapter lane. A later Phase 20 change may
  admit noncash-disposition accounting only after separately certifying exactly
  one canonical economic source, exact schema, accountant-confirmed semantics,
  non-overlapping coverage, compatible Posting Profile recipe, positive
  unposted or differential proof, and D17 posting owner. It must prove that a
  Phase 15 disposition and derivative D21 Field Account effect cannot both post
  for the same coverage. Brokerage, liquidation, appraisal, valuation,
  custody, transfer, sale, and other noncash-disposition costs remain outside
  Phase 20 D19 and Phase 21 D20. QBO/Xero and the tenant's accountant retain
  asset derecognition, gain/loss, cash, fee, period, books, and final-
  reconciliation authority.
- Phase 21 D22 prospective-authorization postures, requests, private evidence
  references, Governance Resolutions, Assignment Snapshots, Review Actions,
  Decisions, compatible capacity reservations, later-claim Authorization
  Coverage, unused-scope declarations, residuals, successors, and corrections
  remain unsupported and accounting-dark. They create no D18 source, Posting
  Intent, Accounting Release, artifact, provider operation, Expected Bank
  Arrival, Bank Match, or QBO/Xero object. Only an independently qualified
  later approved expense, obligation, source-qualified payment occurrence, or
  other certified economic source may enter its exact Phase 20 lane.
- Phase 21 D23 Expense Field Account Effect Recognition Profiles, Effect
  Bases, Field Account Funding Coverage and Dispositions, Effect Coverage,
  operational Expense Field Account Effects, Support Cycle inclusion/through
  dates, exceptions, and corrections remain unsupported and accounting-dark.
  They govern support-balance timing only and cannot create, select, date,
  modify, deliver, or reconcile accounting work. An independently certified
  approved expense, obligation, source-final organization-paid occurrence,
  payment occurrence, or correction may enter its own closed D18 lane with an
  exact D17 owner, without inheriting D23 mode, effect identity, close, or
  date. QBO/Xero bill, payment, readback, drift, and Bank Match evidence cannot
  qualify or rewrite D23.
- Phase 21 D24 Expense Collaboration Assignment Versions, invitations and
  acceptance, Evidence Access Projection Versions, Claimant Confirmations or
  admitted external attestations, helper actions, and actor provenance remain
  unsupported and accounting-dark. They cannot replace Phase 12 authorization
  or establish incurrence, substantiation, approval, obligation, payment,
  Field Account effect, posting, or reconciliation. Only an independently
  qualified expense source may enter its existing Phase 20 lane; minimum D24
  provenance may accompany it only as non-authoritative lineage.
- Phase 21 D25 Expense Claim Resolution Cause Contract Versions, Cases,
  Occurrences, Projections, Downstream Impact Manifests and dispositions,
  coordination tasks/messages/responses, source-owner requests, and completion
  proofs remain unsupported and accounting-dark. They create no D18 source,
  posting owner, Accounting Release, artifact, provider operation, Expected
  Bank Arrival, Bank Match, or reconciliation evidence. Only an independently
  authoritative correction may enter its existing lane; D25 may retain opaque
  correlation and observe the Phase 20 result but cannot choose treatment or
  period, deliver accounting, clear an Accounting Exception Case, or prove
  posting or reconciliation.
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
- Phase 21 D26 record-family schedules, retention resolutions, tenant records
  archives, custody assertions/transfers, holds, offboarding retrieval, or copy
  disposition. A Phase 21 Records Export Package is not an Accounting Delivery
  Package, QBO/Xero backup, or accounting source.

## Release Posture

This change is an implementation-ready product and architecture contract. It
does not implement Phase 20, create credentials, run migrations, connect a
tenant to a provider, post accounting, or dispatch implementation tickets.
Runtime work remains gated by predecessor proof, provider certification,
security review, production-shaped tests, and explicit implementation
dispatch. The confirmed `AccountingOperationsService` public testing seam is
binding.
