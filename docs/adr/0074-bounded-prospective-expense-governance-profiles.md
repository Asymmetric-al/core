# Bounded prospective Expense Governance Profiles

**Status:** Accepted (founder ruling, Phase 21 grill session — D13)

## Context

Phase 21 D10 establishes immutable claim-level expense truth, exact item/split
dispositions, Approved Expense Snapshots, and independently authoritative
obligation, Field Account, payment, and accounting outcomes. It intentionally
left the tenant's expense-policy catalog and approval topology unresolved.

Real missions organizations vary by relationship, jurisdiction, worker group,
expense family, purpose or grant, amount, evidence, and timing. One fixed rule
and reviewer would force off-system exceptions. An arbitrary rules language or
workflow graph would create hidden ordering, self-approval, historical
reproducibility, and operational hazards. The ordinary tenant needs one short
setup and one reviewer; complex tenants need bounded, explainable variation.

## Decision

Each Tenant × Legal Entity has one quiet Expense Program that is Off until
intentionally activated. Activation creates an immutable prospective Expense
Program Activation Version with one guided Legal-Entity default Expense
Governance Profile Version, certified bounded assignments, finite Expense
Approval Route Versions, exact currencies, source contracts, evaluator
versions, and activation proof.

An Expense Governance Profile Version contains only code-owned, versioned
policy modules for required facts and evidence, timing, eligibility,
same-currency amount controls, certified calculations, and permitted exception
treatment. Assignments may be scoped only by source-owned relationship or
jurisdiction, a prospectively versioned Expense Policy Cohort, certified
expense family, exact purpose/project/grant, exact claimant, or the Legal-Entity
default. Cohort placement is a separate immutable prospective Membership
Version; activation pins the admitted eligibility contract and tested coverage
watermark, not a permanent claimant roster.

Every exact Expense Claim Version item or split receives one immutable Expense
Governance Resolution using the policy effective on its incurred date. A
code-owned specificity lattice chooses the unique maximally specific matching
assignment. Same-profile maximal matches collapse; conflicting incomparable
maximal matches block only the affected coverage and identify the combined
scope needed. Profiles never stack, and admin order, numeric priority, labels,
or creation time never decide.

Policy and approval time remain separate. The policy is selected at incurred
date in the Legal Entity's pinned business timezone. The finite Approval Route
Version is selected when the immutable Expense Report Submission is created
and becomes an immutable Approval Assignment Snapshot. A material claim change
creates D10's successor Claim Version and a fresh Resolution; a new submission
uses its incurred-date policy and then-current route. Reassignment or delegation
appends a governed successor snapshot, while current capability and conflict
status are rechecked at decision time.

The route catalog is finite:

- one independent reviewer, as the guided default;
- manager or project owner followed by finance when required;
- specialist or restricted-grant review for exact affected coverage, with a
  required final finance step where configured; and
- named independent small-tenant oversight where ordinary role separation is
  not feasible.

All approval is human and conflict-free. A claimant or another interested actor
cannot satisfy their own independent review. AI, policy evaluation, amount,
provider status, timer, reminder, job, or notification cannot approve. There is
no automatic or timeout approval. **Approve clean claims** remains a human,
consequence-previewed command that creates independent exact decisions and
splits incompatible scope, currency, policy, route, exception, and consequence.

D10's only line dispositions remain `approved`, `needs_information`,
`rejected`, and `excluded`. A reviewer exception is immutable approval evidence,
not a fifth status or generic override. It requires the violated clause,
permitted basis, reason, exact coverage, authority, and independent review.
Structural isolation, conservation, version, authorization, and integrity
failures are never waivable.

Every amount, threshold, and route band uses exact ISO currency and integer
minor units with a pinned certified basis. Thresholds compare only same-currency
amounts. Mixed-currency report totals, naked cross-currency numbers, implicit
FX, and live conversion are prohibited. A future conversion-dependent module
must consume immutable externally owned conversion evidence; Phase 21 does not
become an FX engine.

The claimant experience asks only applicable requirements and gives exact,
plain-language recovery. Reviewers use one exception-first queue and clean-only
bulk approval. Admins use a four-step guided setup—who can submit, what is
required, who reviews, and review/turn on—with conflict simulation,
representative examples, prospective effective dates, and progressive
disclosure of variants and history. Healthy work creates no recurring admin
task.

Expense approval, Reimbursement Obligation, Field Account Funding Coverage,
External Payment Occurrence, Phase 20 handoff, Accounting Release, and final
QBO/Xero truth remain independently authoritative. Phase 20 receives only the
PII-minimized approved and governance-decision lineage its existing contract
requires, never receipt bytes, policy configuration, approval queues, mutable
routes, or authority to decide eligibility.

**Phase 21 D24 precision amendment (2026-08-02).** An Expense Collaboration
Assignment is claim-preparation responsibility and provenance, never an
Approval Assignment Snapshot, reviewer delegation, route-selection input, or
decision authority. The D13 route resolves independently when the immutable
Expense Report Submission is created. A helper who prepared, submitted, paid,
benefited from, or contributed evidence to a claim cannot satisfy an
independent review step for that claim even when the person holds a general
reviewer capability. Claimant confirmation is an assertion about one exact
Claim Version, not policy approval; D13 review and exception evidence remain
separate human decisions.

A D24-assisted multi-claim submission is admitted only when every included
Claim Version and item/split has complete current collaboration coverage,
Phase 12 authority, permitted evidence visibility, and exact claimant
confirmation. It never crosses claimant Parties or Legal Entities, silently
omits uncovered work, disguises partial submission, or lets a helper choose a
route. Material change creates the ordinary D10 successor plus fresh D13
resolution and route snapshot; D24 never reopens or rewrites prior policy or
approval truth.

**Phase 21 D25 precision amendment (2026-08-02).** D25 is not a fifth Expense
Policy Decision disposition, Reviewer Exception, route, assignment, or generic
override. **Request another review** records exact new D13 review evidence over
the same immutable facts while preserving the earlier decision; changed facts
use a D10 successor and fresh submission before D13 resolves again. Case or
task state, comments, relationship, timer, notification, AI output, or broad
administrator access cannot choose a reviewer, waive policy, or approve.

## Consequences

- Ordinary tenants receive one enabled default and one reviewer without an
  enterprise policy builder.
- Complex tenants receive bounded prospective variants without profile
  stacking or hidden rule precedence.
- Historical decisions remain reproducible across policy, staff, role,
  currency, cohort, project, and provider changes.
- Reviewer absence, conflicts, and policy ambiguity affect only exact coverage
  and recover through append-only assignment or configuration succession.
- Separate capabilities govern profile/route administration, activation,
  assignment, delegation, ordinary approval, exception approval, evidence
  access, and protected audit retrieval.
- Production release requires resolver, temporal, segregation-of-duties,
  exact-currency, race, isolation, downstream-boundary, load, accessibility,
  usability, portability, and failure-injection proof defined in the Phase 21
  decision log.

## Rejected alternatives

- one universal policy and one finance reviewer;
- arbitrary policy expressions, scripts, formulas, rule ordering, numeric
  priority, or workflow graphs;
- profile stacking or silent fallback from unknown source context;
- mutable or retroactively effective policy and route edits;
- report-level approval or broad **Approve anyway**;
- self-, AI-, automatic-, amount-, notification-, or timeout-based approval;
- implicit FX, converted report totals, or an Asym-owned rate engine;
- policy, evidence, payment, payroll/AP, QBO, or Xero state as interchangeable
  authority.

## Related decisions

- [ADR-0059 — Accounting-ready expense handoff](./0059-accounting-ready-expense-handoff.md)
- [ADR-0062 — Finance-closed Field Account cycles](./0062-finance-closed-field-account-cycles.md)
- [ADR-0071 — Claim-level expense truth and purpose-routed tenant AI](./0071-claim-level-expense-truth-and-purpose-routed-tenant-ai.md)
- [Phase 21 decision log](../prds/sitestacker-parity/phase-21-field-accounts-decision-log.md)
