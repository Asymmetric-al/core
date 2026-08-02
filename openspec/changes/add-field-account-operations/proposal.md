# Add Field Account Operations

## Why

Missions sending organizations need an organization-controlled support
subledger that can explain what support was recorded for a missionary, couple,
team, or project; what finance has closed; what remains provisional; and what
was later applied to compensation, expenses, reallocations, or another
authorized use. The organization owns and controls the funds. Missionaries need
focused visibility, not a wallet or accounting console. Finance needs exact
source coverage, immutable close evidence, and handoffs into existing QBO/Xero,
payroll, and accounts-payable processes.

The current system has contribution and missionary-portal projections but no
Field Account authority. Existing support UI can derive amounts from mutable
`current_funding` or donation sums and includes dormant **Available Funds** and
**Withdraw** language. Those paths cannot survive assessments, refunds,
reallocations, multiple currencies, expenses, late facts, opening cutover, or
separate spouse/team access, and they imply authority the product does not
have.

Without one bounded capability, local implementations would create competing
balances, duplicate source admission, broad relationship-derived access,
mutable close history, blind provider retries, or false equivalence among
approval, funding, payroll, payment, accounting, and reconciliation. Phase 21
therefore needs one explicit application boundary and one immutable operational
model before any dashboard or integration is trustworthy.

## What Changes

- Add one `field-account-operations` capability behind the server-resolved
  `FieldAccountOperationsService`. Every route, job, batch, importer,
  projection, repair action, and adapter delegates through its typed commands
  and permission-safe queries.
- Add organization-controlled Support Assignments, independently versioned
  participant membership and workspace access, and one immutable-currency
  Field Account per exact assignment/currency scope.
- Add source-addressed, balanced, append-only Field Account Occurrences and
  bounded organization-control entries with exact integer-minor-unit
  conservation, semantic idempotency, same-scope constraints, forced RLS,
  version fences, and cause-owned correction.
- Add tenant-scheduled Support Cycles, source-family readiness policy,
  provisional activity, immutable Admission Coverage, Integrity Manifests,
  finance close, and separately through-dated missionary projections.
- Add an explicit zero-assessment baseline and bounded prospective
  Administrative Assessment Profiles with deterministic non-stacking
  resolution and component-correct reversals.
- Add optional contract-referenced compensation funding, artifact-always
  provider handoffs, exact per-product adapter contracts, external-result
  coverage, and truthful separation from payroll completion and payment.
- Add organization-authorized support reallocation, exit disposition,
  proof-gated charitable succession, parallel currency accounts, and exact
  externally owned conversion evidence without an Asym FX engine.
- Add optional Approved Support Plans, publication profiles, immutable Support
  Cycle statements, and the source projections required by future Phase 31
  Missionary Support Feeds.
- Add claim-level expense truth, private evidence relationships,
  purpose-specific tenant AI bindings, bounded governance and approval,
  file-first organization-card evidence, reimbursement handoffs, advances and
  repayments, travel calculations, optional prospective authorization,
  source-family effect recognition, own-identity collaboration, and exact
  cause-owned resolution.
- Add source-authoritative organization support-cost applications and noncash
  support realization without overlapping assessments, compensation, expenses,
  processor costs, or accounting ownership.
- Add source-covered per-currency Opening Positions, one operational cutover,
  production activation proof, optional D28 opening cumulative travel-capacity
  admission, purpose-owned records schedules, and exact tenant custody exports.
- Replace missionary-facing compatibility with a focused, permission-safe
  mini-CRM projection. Donation activity remains activity; only a qualified
  Support Cycle close advances a Finance-confirmed Field Account Balance.
- Add first-class real-Postgres financial/RLS/concurrency verification,
  provider-specific contract suites, and authenticated Mission Control and
  missionary browser journeys around the confirmed service seam.

## Capability Deltas

### New capability: `field-account-operations`

The capability owns the complete Phase 21 D1–D28 contract: organization-
controlled Field Accounts, support admission and close, assessment, planning,
expense and handoff operational truth, assignment-scoped projection, integrity,
opening/activation, correction, and records/export meaning.

### Modified capability: `platform-boundaries`

The platform boundary contract gains an explicit Field Account authority split:
Field Accounts are organization-controlled operational support truth and never
donor assets, worker wallets, contribution totals, bank balances, GL balances,
payroll/AP truth, payment truth, or final reconciliation. Phase-owned source,
artifact, storage, import, feed, accounting, and provider authorities remain
separate.

## Dependencies

### Required platform contracts

- Phase 1 source-of-truth ownership and complete Tenant/Legal-Entity scoping.
- Phase 2 tenant/site currency metadata and locale facets. Phase 2 provides
  descriptive configuration and evidence only; D6 retains immutable Field
  Account currency identity and qualified admission authority.
- Phase 3/10 sensitive-data classification, privacy, evidence egress, and
  least-privilege access contracts.
- Phase 4 own-identity principals, invitations, Party lifecycle, and merge
  lineage.
- Phase 6 governed notifications and preferences.
- Phase 9/10 CRM operational Party, relationship, and restricted-person truth.
- Phase 12's sole server-side policy decision point, capability vocabulary,
  governance epochs, and principal-bound workspace projections.
- Phase 13 contribution, Designation, accepted-purpose, posting, source-version,
  and money-allocation truth.
- Phase 15 offline source and noncash disposition facts.
- Phase 18 approved-data/facts-package/document rendering, exact generated-
  artifact bytes, access, and lifecycle contracts; D26 and Phase 29 do not
  replace that owner boundary.
- Phase 20's sole accounting doorway, QBO/Xero delivery, exact provider
  readback, and drift/reconciliation truth.

### Activation-critical sliced prerequisites

- D17/D27 production activation requires the certified Phase 29 opening-source
  private-byte/access seam and Phase 30 import-session transport/staging seam.
  Those phases provide custody and preparation mechanics only; they cannot
  define, reconcile, admit, or activate Phase 21 meaning.

### Optional capability bindings

- Phase 14 donor-credit truth may contribute source-owned adjustments but never
  Field Account authority.
- Phase 16 commitments may contribute an optional planning projection only.
- Phase 28 owns fundraising goals, coaching, contactability, and relationship
  resources; none can widen Field Account access or balance truth.
- Phase 17 owns governed message content/preparation and the executable message
  manifest only for an enabled message slice. Phase 6 retains recipient-specific
  intent, outbox, suppression, dispatch, outcome, and communication history.
  This change admits no Phase 17 executable message key by itself; optional sends
  remain absent until a separate Phase 17 manifest amendment and proof pack,
  while in-product tasks and projections continue without those sends.
- Phase 29 must provide certified custody before a Phase-21-owned private-byte-
  bearing expense, card, AI-evidence, or D26 package/export slice activates.
  Manual, metadata-only, and authoritative-feed evidence paths remain distinct.
- Phase 30 owns inbound transport and staging for selected bulk opening, card,
  policy, or migration inputs; Phase 21 owns validation and admission. D28 clean-
  boundary and native exact-baseline paths do not require its bulk lane.
- Phase 31 owns external support-feed authorization, transport, cursors,
  provider mappings, delivery evidence, and removal posture.

Missing optional capability dependencies do not block independently certified
Core Field Accounts after the activation-critical D17/D27 prerequisites are
proved. Missing selected dependencies block only their exact cutover or
capability lane and never authorize temporary duplicate models.

## Out Of Scope

- General ledger, trial balance, financial statements, close/consolidation,
  bank ledger, final bank reconciliation, or audit opinion.
- Worker classification, payroll/tax calculation or submission, compensation
  entitlement, AP aging, bill/vendor management, payment initiation, bank/card
  issuance, direct reimbursement, collections, or proof of payment.
- Donor or worker ownership of support, withdrawals, wallets, cash-out,
  guaranteed wages, donor receipt facts, or public earmarking to an individual.
- GAAP, tax, accountable-plan, records-law, private-benefit, employment, or
  jurisdictional legal advice and compliance warranty.
- Generic rules/workflow/case/provider/AI frameworks, arbitrary scripts,
  formulas, SQL, field mapping, or universal payroll payloads.
- Direct QBO/Xero writes, FX translation/revaluation, or final reconciliation
  outside Phase 20.
- Mandatory optional modules, whole-history replay, dual write, mutable
  cutoffs/balances, fuzzy identity/matching, discretionary overdrafts,
  suppression of mandatory adverse corrections that expose a deficit, or
  cross-currency totals.

## Release Posture

This change is FORWARD and not implemented. D1–D28 are the frozen product
authority. Core production activation requires D27's complete readiness proof
and D17's sole operational cutover; optional slices remain absent, manual, or
external until their exact dependencies and production certification exist.

Approved implementation slicing is published under
[#1109](https://github.com/Asymmetric-al/core/issues/1109), with lane epics
[#1110](https://github.com/Asymmetric-al/core/issues/1110) through
[#1120](https://github.com/Asymmetric-al/core/issues/1120) and tracer tickets
P21-01 through P21-101. `ready-for-agent` marks discoverability only; native
blocked-by relationships and this OpenSpec change remain authoritative. The
approved specification issue
[#1108](https://github.com/Asymmetric-al/core/issues/1108) stays unchanged and
outside the implementation hierarchy.

The multi-provider compensation launch is not complete until at least two
distinct direct-write adapters have current production authorization and exact
production-shaped certification. Sandbox, logo, local fixture, pending partner
approval, or generic provider connection is insufficient.

No route, UI, database object, background worker, provider adapter, or import
may ship as an alternate Field Account writer. Implementation work begins only
from the canonical PRD, this change, the D1–D28 decision log, and applicable
owning-phase contracts.
