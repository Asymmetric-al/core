# Purpose-separated advances and claimant repayments

**Status:** Accepted (founder ruling, Phase 21 grill session — D16)

## Context

Phase 21 D10 and D13 establish claim-level expense truth and approved expense
snapshots. D14 adds exact organization-card evidence, including personal or
nonbusiness portions, and D15 establishes reimbursement obligations, external
handoff, and separately evidenced payments. None of those decisions determines
how an organization advance is applied to approved expenses or whether a
source residual should become an operational request for a claimant to return
money.

Collapsing advances, personal card portions, reimbursement overpayments,
returned money, Field Account capacity, payroll deductions, and accounting
into one mutable claimant balance would infer legal debt, conceal gross
approved expense, enable double reimbursement or overcollection, and turn
Asym into a wallet, collections product, payroll engine, AP aging system, tax
engine, or second accounting system.

## Decision

Phase 21 provides one optional, off-by-default **Advances & repayments**
experience per Tenant and Legal Entity. One quiet setup surface compiles into
independently activatable, immutable prospective **Expense Advance Policy
Version** and **Claimant Repayment Policy Version** records. Each pins the
source-owned claimant relationship, applicable-jurisdiction determination,
purpose and source family, ISO currency, effective interval, organization
authority, substantiation and evidence requirements, and external handling
rules. Policy cannot determine worker classification, tax treatment, legal
enforceability, payroll-deduction authority, payment, accounting, or final
reconciliation.

An immutable **Expense Advance Authorization Version** proves only the
organization's prospective authority. A distinct source-qualified **Expense
Advance Issuance Occurrence** and its evidence observations establish what the
external process issued. Authorization, provider acceptance, check creation,
or accounting does not prove issuance or claimant use. An advance may satisfy
approved expense coverage only after the pinned source contract proves
**Advance Application Readiness**. This is the canonical predicate represented
by D16's phrase `claimant-use readiness`; it proves application eligibility,
not general availability or withdrawability.

One Approved-Expense-Snapshot-rooted, serializable **Expense Settlement
Determination** atomically conserves exact approved coverage in one application
currency into non-overlapping **Expense Advance Applications**, the remaining
Reimbursement Obligation, typed residuals, and separately authorized
tenant-enabled non-reusable Field Account Funding Coverage. It never creates a
gross reimbursement and reduces it later. When funding is enabled, the exact
approved funding component of the Expense Advance Authorization Version creates
the purpose-typed coverage before capacity can be reused. Only a separately
qualified Field Account Effect may fulfill it; application alone cannot. Field
Account coverage is an organization-controlled reservation, not a debit,
payment, claimant-owned balance, or permission to net a future return.

An unused advance, personal/nonbusiness card portion, or reimbursement
overpayment is only a source candidate for review. A distinct immutable
**Repayment Subject Determination** pins the source evidence, responsible Party,
relationship and jurisdiction authority, conflict/dispute route, actor, and
version; card assignment or personal classification cannot provide that proof.
A currently admissible, responsibility-proved **Claimant Repayment Decision**
records exactly one
disposition: `correct_source`, `no_return_requested`,
`request_external_return`, or `refer_to_external_specialist`. Only
`request_external_return` creates an operational **Claimant Repayment
Requirement**. The requirement records what finance is asking the claimant to
return under tenant policy; it is not adjudicated debt, collection authority,
payroll authority, accounting truth, or proof that money moved. `Source-final`
means the current pinned source version passes its family-specific finality
contract and compare-and-swap reproof at the decision instant; later source
corrections remain valid append-only facts.

One externally handled economic return has one stable **Claimant Repayment
Occurrence** and zero or more immutable, source-labelled evidence observations.
Stronger evidence corroborates or conflicts with the occurrence; it does not
mint a duplicate or silently upgrade evidence strength. Exact many-to-many
**Claimant Repayment Coverage** conserves each occurrence in one exact return
currency across requirements plus a typed unapplied residual. A different
source currency requires exact externally owned source and settlement amounts,
conversion authority/rate, rounding, and residual; Asym never supplies FX.
Failure, return, correction,
dispute, and reissue append facts rather than editing history.

If source truth changes after money was returned, Phase 21 preserves the
original decision and occurrence and opens a **Repayment Restitution Review**.
Any organization-to-claimant restoration requires its own authorized source
and qualified payment evidence. It is never silently netted against future
reimbursement, compensation, another repayment requirement, or Field Account
capacity.

The complete launch execution lane is **Handle outside Asym**. Asym does not
connect claimant bank accounts, collect money, initiate payroll deductions,
offset compensation or reimbursement, or calculate, impose, or adjudicate
interest, penalties, tax, employment, or legal status. Specialist-owned exact
correction evidence may be recorded under a separately certified source
contract. Payroll deduction and setoff fail closed unless a separately
certified external contract proves exact authority,
gross amount, component, net result, execution, outcome, and Phase 20 D17
posting ownership. Insider, related-party, and private-benefit cases require
independent conflict-safe specialist handling.

Phase 20 receives only separately certified, PII-minimized advance issuance,
approved-expense application, claimant-return, and cause-linked correction
occurrences under accountant-confirmed policy and an independently assigned
Phase 20 D17 posting owner. Policies, tasks, residual projections, disputes, raw
evidence, Requirements, and Field Account reservations remain accounting-dark.
A Requirement becomes a receivable only under a separately accountant-certified
policy/source contract; the cash return and advance return remain distinct
typed occurrences. QBO/Xero and bank reconciliation never establish Phase 21
return truth.

The claimant experience shows only active, role-scoped work using calm copy
such as **Advance being processed**, **Advance to account for**, **Not yet
applied to approved expenses**, **Finance asked you to return**, **Return
recorded by finance**, and **Return confirmed** only at the exact supported
evidence strength. Finance receives one exception-first surface grouped by
cause. The product never displays a generic debt, collection, available
balance, `Mark paid`, `Mark repaid`, payroll deduction, or automatic netting
action.

**Phase 21 D23 precision amendment (2026-08-01).** Expense Settlement
Determination is a claimant-reimbursable partition and is never fabricated for
organization-card, organization cash/debit/direct-payment, or certified-
payable coverage. Those D23 sources root directly in exact D10/D13 approved
economic-payer coverage and their certified source occurrence. D22 prospective
coverage must first reclassify into actual D10/D16 Funding Coverage before a
D23 effect can fulfill it.

**Phase 21 D25 precision amendment (2026-08-02).** A claimant withdrawal,
unavailability or identity change, returned payment, or downstream conflict in
D25 never creates debt, a Claimant Repayment Requirement, payroll deduction,
offset, negative reimbursement, or unrelated netting. D16 alone may establish
and correct exact purpose-separated advance application or claimant-repayment
truth from its qualified source evidence. D25 observes that source-owned result
without deciding or executing it.

## Consequences

- Approved expenses, advances, residuals, reimbursement obligations, requested
  returns, actual returned money, accounting, and reconciliation remain
  independently inspectable truths.
- Tenants can activate advance and repayment capabilities independently
  without exposing unused navigation or workflow.
- Exact atomic settlement prevents double reimbursement and Field Account
  capacity reuse without adding a routine finance step.
- Staff-attested evidence remains **Return recorded by finance**; stronger
  **Return confirmed** copy requires its separately qualified authority.
- Cross-currency treatment requires exact externally owned conversion evidence;
  Asym does not operate an FX engine.
- Production release requires conservation, source-finality, responsibility,
  isolation, concurrency, correction, privacy, workload, accessibility, and
  representative-user proof from the Phase 21 decision log.

## Rejected alternatives

- one mutable claimant advance or repayment balance;
- automatically treating a personal card portion or overpayment as debt;
- applying advances after creating the full reimbursement obligation;
- inferring responsibility from card assignment, portal role, or worker page;
- direct ACH/debit collection or personal bank/card custody;
- payroll deduction, compensation offset, reimbursement netting, or Field
  Account debit initiated by Phase 21;
- AP aging, dunning, collections, an Asym interest/penalty/tax calculation
  engine, or a universal legal-debt workflow;
- generic `Mark paid` or `Mark repaid`, fuzzy matching, destructive correction,
  or accounting/bank evidence as returned-money proof.

## Related decisions

- [ADR-0059 — Accounting-ready expense handoff](./0059-accounting-ready-expense-handoff.md)
- [ADR-0071 — Claim-level expense truth and purpose-routed tenant AI](./0071-claim-level-expense-truth-and-purpose-routed-tenant-ai.md)
- [ADR-0074 — Bounded prospective Expense Governance Profiles](./0074-bounded-prospective-expense-governance-profiles.md)
- [ADR-0075 — File-first organization-card transaction evidence](./0075-file-first-organization-card-transaction-evidence.md)
- [ADR-0076 — Artifact-always reimbursement handoff](./0076-artifact-always-reimbursement-handoff.md)
- [Phase 21 decision log](../prds/sitestacker-parity/phase-21-field-accounts-decision-log.md)
