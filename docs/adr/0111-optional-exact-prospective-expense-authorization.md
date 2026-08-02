# ADR-0111: Optional exact Prospective Expense Authorization

**Status:** Accepted (founder ruling, Phase 21 grill session — D22)

## Context

Some mission organizations require approval before selected travel, equipment,
security, project, or unusually large expenses. Others do not use preapproval,
and even tenants that do need it usually need it only for bounded circumstances.
Making a before-spend workflow universal would add friction to ordinary receipt
capture and reimbursement; treating an approval as a claim, reservation,
reimbursement promise, payment, or accounting fact would corrupt independently
authoritative truths.

Modern spend-request products demonstrate the value of a short request and
clear reviewer queue, while accountable-plan substantiation still requires the
later actual expense facts. Phase 21 already owns claim-level expense truth,
prospective governance, finite approval routes, exact Field Account funding
coverage, and source-owned corrections. The safe design therefore extends
those seams rather than creating procurement, card, workflow, or accounting
products.

## Decision

> **C-prime-amended-and-hardened (C-prime-R) — one independently optional,
> Tenant- and Legal-Entity-off-by-default, purpose-scoped Prospective Expense
> Authorization inside the existing Phase 21 Expense Program and Expenses
> doorway, structurally absent from requester, reviewer, admin, notification,
> reporting, and API projections unless prospectively activated as
> available-when-helpful or required-for-selected-expenses through D13's bounded
> non-stacking scope lattice; with one fast accessible four-question `Plan an
expense` flow; separate immutable requester-authored Request Versions, private
> plan-evidence coverage, submission-time Governance Resolutions and
> operation-scoped finite Approval Assignment Snapshots, current-authority-
> rechecked human Review Actions, and exact Organization Authorization Decisions
> pinning Tenant, Legal Entity, claimant Party, submitter/preparer, source-owned
> relationship context, purpose, certified expense family, positive integer-
> minor-unit ceiling, one ISO currency, half-open incurrence window, frozen
> permitted conditions, authority, route, and source/policy versions; guided
> approval-only behavior plus one advanced, explicitly certified, same-purpose
> and same-currency D1 capacity-reservation consequence committed atomically
> with the final decision; exact non-overlapping later D10 item/split
> Authorization Coverage, partial and multi-claim use, within-ceiling
> preservation and excess-only review, narrowing-only approval changes,
> immutable successor amendments, pre-decision withdrawal, prospective
> future-use end, expiry without timer release, proved-unused-only release,
> in-flight residual quarantine, semantic idempotency, CAS/concurrency
> protection, and append-only correction and recovery; one quiet exception-
> first `Planned expenses` staff surface with role queues, separate prepare/
> submit/view/decide/exception/reassign/delegate/configure/reserve capabilities,
> recusal, date-bounded non-transitive delegation, named independent small-
> tenant oversight, sparse privacy-minimized notifications, online-only
> authoritative actions, resumable mobile drafts, and WCAG 2.2 AA proof —
> without enabling from D13 or D19 alone, mandatory preapproval for every tenant
> or expense, claimant-selected reviewers, mutable request or decision truth, a
> second workflow or reservation engine, broad administrator bypass, self-,
> AI-, automatic-, email-link-, bulk-, or timeout approval, timer-based release,
> implicit FX, fuzzy claim coverage, public evidence, cards, wallets, spend
> limits, purchase orders, vendor onboarding, travel booking, direct payment,
> payroll or accounting authority, or any claim that planned or approved means
> reserved, incurred, substantiated, policy-eligible, reimbursable, owed,
> available, guaranteed, payable, paid, posted, synced, or reconciled.**

### Optionality and governance

The default posture is `not_managed_in_asym`, in which D22 is structurally
absent. An authorized tenant may prospectively select
`available_when_helpful` or `required_for_selected_expenses` for exact scopes
resolved through D13's deterministic, non-stacking lattice. D13 is a
prerequisite, but activating D13 or granting D19 participation never activates
D22 or grants requester, reviewer, evidence, payee, or reservation authority.

The existing D13 approval route, assignment, delegation, reassignment,
conflict, exception, and production-proof machinery is reused. Every review
action re-proves current Phase 12 authority. Claimants cannot select or satisfy
their own independent reviewers; no AI, timeout, email link, broad admin bypass,
or automatic rule can create final authorization.

### Immutable lifecycle and exact coverage

Mutable private drafts, immutable requester-authored Request Versions, private
evidence coverage, submission-time Governance Resolutions and Assignment
Snapshots, human Review Actions, final Authorization Decisions, optional
capacity reservations, later claim coverage, unused-scope declarations, and
corrections are separate facts. `Approve with changes` may only narrow the
ceiling or time window or add a permitted condition; every material widening or
identity, purpose, currency, Legal Entity, or expense-family change requires a
requester-authored successor and fresh review.

Every D10 item or purpose split consumes at most one exact authorization slice.
For each authorization and ISO currency:

```text
approved ceiling
= exact later-claim application coverage
+ proved-unused released coverage
+ unresolved or in-flight residual coverage
```

Expiry stops new reliance but does not prove unused scope or release capacity.
Only current proof that an exact slice is unused and not linked, uploading,
correcting, appealing, or otherwise in flight permits release. Ambiguous work
stays quarantined and append-only recovery preserves the original decision.

### Capacity consequence

`approval_only` is the guided default. A tenant may separately certify
`approval_with_compatible_capacity_reservation` for a bounded scope. It may use
only exact same-Tenant, Legal-Entity, purpose, Field Account, and ISO-currency
D1 planning capacity. The final human decision and full reservation commit
atomically; a partial or failed reservation cannot produce an approved result
or silently fall back to approval-only. A later qualified Field Account effect
fulfills or reclassifies the overlapping reservation exactly once.

**Phase 21 D24 precision amendment (2026-08-02).** D22 and D24 may reuse one
code-owned prepare/submit authorization kernel and actor vocabulary, but their
authoritative objects never substitute for each other. A D22 preparer,
submitter, Request Version, external attestation, Governance Resolution,
Assignment Snapshot, Authorization Decision, reservation, or later-claim
Authorization Coverage grants no authority to prepare, confirm, or submit a
D10 actual claim through D24. D24 requires its own exact stable-Expense-Claim
assignment, current Phase 12 decision, Evidence Access Projection, and—when
another actor submits—Claimant Confirmation Version over the complete unchanged
Claim Version.

Conversely, D24 collaboration, confirmation, or submission cannot create,
amend, withdraw, approve, consume, release, or succeed D22 prospective truth.
When a later claim legitimately uses D22 authorization, D22 owns exact
Authorization Coverage while D24 owns only helper responsibility/action
provenance; D10/D13 still own actual claim, submission, policy, route, and
review. Claimants, D22 preparers/submitters, and D24 helpers remain unable to
satisfy any independently required review step.

### Experience and boundaries

When enabled, `Add expense` remains primary and `Plan an expense` is a
secondary action in the existing Expenses doorway. The ordinary flow asks only
what is planned, the maximum and currency, the expected date/window, and the
purpose. Staff receive one accessible, exception-first `Planned expenses` view
with exact terms, owner role, target review date, next action, and expandable
history. Drafts may resume offline; every authoritative submission, decision,
reservation, release, and application requires a committed online result.

D22 creates no incurred Expense Claim, Approved Expense Snapshot,
Reimbursement Obligation, Field Account debit, advance, handoff, payment,
payroll operation, Accounting Posting Intent, Accounting Release, Bank Match,
or QBO/Xero truth. Missing required authorization never blocks capture of an
actual claim or evidence; D13 records the typed exception. Phase 20 rejects all
D22 prospective facts before accounting-source admission.

## Consequences

- Tenants that do not need preapproval receive no configuration, navigation,
  queue, notification, report, API, or requester friction.
- Tenants that do need it gain a fast, exact, auditable flow without a second
  workflow, reservation, procurement, or payment engine.
- Approval, reservation, claim, substantiation, obligation, payment, and
  accounting remain independently truthful.
- Exact minor-unit coverage, current-authority reproof, atomic reservation,
  concurrency protection, and append-only recovery increase implementation and
  test rigor but prevent duplicate capacity use and false financial claims.

## Alternatives rejected

- **Require preapproval for every expense.** Rejected because it creates
  needless tenant and missionary friction and does not reflect varied policy.
- **Use a simple mutable approved amount on the later claim.** Rejected because
  it cannot preserve request, route, authority, partial use, expiry, residual,
  or correction truth.
- **Treat approval as a spend limit or guaranteed funding.** Rejected because
  organization authorization is not cash availability, obligation, or payment.
- **Build a generic workflow or procurement product.** Rejected because D13's
  bounded finite routes already provide the required seam and broader scope
  would add complexity without Phase 21 authority.
- **Release unused capacity automatically at expiry.** Rejected because a
  qualifying expense may have been incurred but not yet submitted.

## Related decisions

- [ADR-0090 — Finance-closed Field Account cycles](./0090-finance-closed-field-account-cycles.md)
- [ADR-0099 — Claim-level expense truth and purpose-routed tenant AI](./0099-claim-level-expense-truth-and-purpose-routed-tenant-ai.md)
- [ADR-0100 — Layered Field Account integrity and cause-owned repair](./0100-layered-field-account-integrity-and-cause-owned-repair.md)
- [ADR-0102 — Bounded prospective Expense Governance Profiles](./0102-bounded-prospective-expense-governance-profiles.md)
- [ADR-0104 — Artifact-always reimbursement handoff](./0104-artifact-always-reimbursement-handoff.md)
- [ADR-0108 — Organization-controlled Support Assignments with separated access](./0108-organization-controlled-support-assignments-and-separated-access.md)
- [Phase 12 permission configuration](../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md)
- [Phase 20 accounting boundary](../prds/sitestacker-parity/phase-20-accounting-exports-reconciliation.md)
- [Phase 21 decision log](../prds/sitestacker-parity/phase-21-field-accounts-decision-log.md#d22--optional-exact-prospective-expense-authorization)
- [D22 research evidence](../prds/sitestacker-parity/phase-21-mission-dashboard-product-research-evidence.md#d22-founder-selection-and-adversarial-hardening)
