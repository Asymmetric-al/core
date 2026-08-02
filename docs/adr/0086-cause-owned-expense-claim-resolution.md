# Exact, cause-owned Expense Claim resolution cases

**Status:** Accepted (founder ruling, Phase 21 grill session — D25)

## Context

Phase 21 already keeps claimant-authored Expense Claim Versions, D13 policy
decisions and Approved Expense Snapshots, D15/D16 reimbursement and payment
truth, D23 Field Account effects, D12 statements, and Phase 20 accounting
truth independently authoritative. D24 permits exact-claim collaboration under
the helper's own identity but grants no review, financial, or correction
authority.

Real expense work still encounters missing evidence, claimant withdrawal,
requests for another review, organization source mistakes, policy questions,
claimant unavailability or identity change, and conflicts discovered after a
downstream effect. A mutable report-wide `Reopen` or generic `Resolve` action
would hide which source fact changed, overwrite prior decisions, block clean
sibling expenses, and falsely imply that obligations, payments, Field Account
effects, statements, or accounting were reversed together. A general workflow
or case-management product would add comparable risk and administration for a
rare exception path.

Phase 21 therefore needs one quiet coordination seam that makes the next safe
action obvious while leaving every authoritative source owner responsible for
its own append-only successor or correction.

## Decision

> **C-prime-amended-and-hardened (C-prime-R) — one exceptional-only,
> immutable, exact-scope and code-cause-owned Expense Claim Resolution Case,
> embedded as one quiet contextual expense update and one exception-first
> finance workspace rather than exposed as a case-management or workflow
> product; bound to one Tenant, Legal Entity, Expense Program, claimant Party,
> stable Expense Claim, triggering Claim Version, exact item/split/purpose/ISO-
> currency coverage, cause-contract version, root source fact and owner,
> evidence/classification references, current authorization/governance
> versions, and a proportional complete Downstream Impact Manifest; opened
> idempotently only for an actual issue under the closed causes information
> required, claimant withdrawal requested, claimant review requested,
> organization source error, policy application question, claimant unavailable
> or identity changed, and downstream-effect conflict, with same-cause
> duplicates converging and distinct exact cases grouped only for presentation;
> giving each actor one plain-language, source-owned next safe action while
> clean and separable claim coverage continues, claimant, helper, organization,
> reviewer, lifecycle, and actual-principal facts remain separately attributed,
> and material changes receive an exact before/after and downstream-impact
> preview; completing only from the root source owner's proof plus an explicit
> disposition for every affected downstream family, while D10, D13, D15/D16,
> D23, D12, Phase 20, payroll/AP, and providers alone append their own
> successor, supplement, withdrawal, decision, obligation, payment/return,
> later-cycle Field Account, statement, accounting, or provider correction
> truth; enforced by complete same-scope constraints, integer minor units and
> exact ISO currencies, semantic idempotency and non-overlap, the sole Phase 12
> PDP before enumeration and at commit, version/governance/conflict/downstream
> CAS reproof, deterministic locking, private D10/Phase-29 evidence, and one
> atomic local case-action, actor-provenance, immutable-audit, projection, and
> identifier-only-outbox commit, with PII-minimized governed notifications,
> tenant-fair recovery, and production-shaped security, failure, load,
> accessibility, and comprehension proof—without a fifth D13 disposition,
> tenant-authored catch-all, generic Resolve/Close/Reopen/Unapprove/Override/
> Edit-as-claimant/Mark-paid/rollback, destructive mutation or deletion,
> relationship/helper/lifecycle succession, silence/timer/notification/AI/
> provider-ambiguity authority, custom workflow or status DSL, report-wide
> blocking where exact coverage can proceed, cross-currency arithmetic,
> reusable evidence URLs, hidden partial success, broad administrator or
> service-role authority, or any claim that case completion proves approval,
> reimbursability, obligation, funding, payment, Field Account inclusion,
> statement correction, accounting delivery, provider acceptance, posting, or
> reconciliation.**

### Exact case identity and coverage

One immutable case basis binds one Tenant, Legal Entity, Expense Program,
claimant Party, stable Expense Claim, triggering Claim Version, exact item/
split/purpose/ISO-currency coverage, versioned code-owned cause, root source
identity and owner, evidence/classification references, authorization and
governance versions, and a proportional complete Downstream Impact Manifest.

The semantic identity is the Tenant, Legal Entity, stable Claim, cause-contract
version, root source identity, and exact coverage digest. A replay with the
same meaning converges on the original result. Different data under the same
key conflicts. Overlapping unresolved causes are explicitly related and
ordered or rejected as a visible conflict; later creation never silently wins.
Distinct exact cases may be grouped into one report-level presentation, but
their authority, coverage, actions, and completion remain separate.

Clean, separable claim coverage continues. Only a code-declared inseparable
coverage relationship may require atomic movement with the affected slice.

### Closed causes and actions

The versioned cause catalog is closed to:

1. `information_required`;
2. `claimant_withdrawal_requested`;
3. `claimant_review_requested`;
4. `organization_source_error`;
5. `policy_application_question`;
6. `claimant_unavailable_or_identity_changed`; and
7. `downstream_effect_conflict`.

Free text may explain a cause but cannot create routing or authority. A new
cause requires a prospective contract version, named source owner, permitted
actors and actions, migration treatment, and proof. Tenants may choose bounded
owners, reminder posture, existing D13 routes, and help copy; they may not
author states, financial meanings, scripts, formulas, timers, or workflow
graphs.

Each actor receives one literal action permitted by the current cause and
source owner. Claimants may provide information, state that evidence is
unavailable, request another review, request withdrawal of eligible unapproved
coverage, or confirm and submit a D10 successor. A D24 helper remains within
the exact current assignment and never becomes the claimant, confirmer,
reviewer, approver, lifecycle successor, or financial actor. Staff may record
organization-authored facts and correction proposals under their own
identities, not edit or attest as the claimant. Only an authorized,
conflict-free D13 reviewer records the existing D13 disposition or permitted
Reviewer Exception.

Silence, elapsed time, notification delivery, stale credentials, account
deletion, relationship, manager assertion, OCR/match/AI output, or provider
ambiguity proves neither unavailability, consent, succession, nor completion.

### Completion and source-owned correction

There is no authoritative mutable `open`, `resolved`, `approved`, `reopened`,
`paid`, or `corrected` case scalar. Immutable case occurrences build a small,
rebuildable coordination projection. User labels such as **Needs your update**,
**With finance**, **Waiting on source**, **Correction in progress**, and
**Complete** are derived presentation only and may not be consumed as financial
truth.

Completion is derived only when the versioned root-cause predicate is proved
by its source owner and every affected downstream family is explicitly
`corrected`, `unaffected`, `not_applicable`, or safely `quarantined`. Each
owner appends its own result:

- D10 owns linked Claim Version and submission successors;
- D13 owns review, policy decision, Reviewer Exception, snapshot supplement,
  successor, reversal, or correction;
- D15/D16 and external payroll/AP own obligation, handoff, payment, return, and
  residual truth;
- D23 owns later permitted-cycle operational effect correction;
- D12 owns immutable statement correction or successor truth;
- Phase 20 owns any qualifying Compensating Accounting Release, provider
  operation, readback, and drift result; and
- providers and QBO/Xero remain authoritative only for what their evidence
  proves.

The original close, snapshot, handoff, payment, statement, Accounting Release,
and provider result remain immutable. Case completion does not prove that any
of those outcomes occurred.

### Authorization, evidence, and atomicity

Phase 12 is the sole Policy Decision Point before enumeration and again at
commit. Every row repeats Tenant and Legal Entity scope and uses complete same-
scope constraints. Forced coarse RLS is defense in depth; service-role,
table-owner, `BYPASSRLS`, view, function, export, support, background-job,
cache, list, count, and search paths receive explicit denial and
non-enumeration proof.

Receipt bytes and sensitive evidence remain in D10's Phase-29-compatible
private lifecycle. Access is current-authorized, application-mediated, and
non-cacheable; a case stores typed references rather than reusable bearer URLs
or copied evidence. Classification may only reduce disclosure.

One consequential local action reauthorizes and CAS-checks current case,
claim, route, collaboration, evidence, lifecycle, classification, conflict,
downstream manifest, and governance versions. It then atomically appends the
case action, actual actor provenance, immutable audit, projection update, and
identifier-only outbox fact or commits nothing. Deterministic narrow locking,
semantic idempotency plus content digest, inspect-before-retry, explicit
unknown/waiting states, and bounded whole-transaction retry prevent double
correction and partial authoritative success.

### Quiet experience

Healthy claims create no case, queue entry, notification, setup, or admin
work. The claimant sees one contextual card only when they can act or a
material outcome affects the exact claim: what finance needs, which expense,
why, one primary action, and what happens next. Changed facts use a prefilled
before/after review rather than repeated entry. Helpers retain the persistent
**Helping with expenses** identity context and see only currently authorized
actions.

Finance reuses **Expenses → Needs attention** with cause-grouped views such as
**Response received**, **Waiting for claimant**, **Source correction**,
**Downstream correction**, and **Aging**. The detail surface progressively
reveals original facts, request/response authorship, policy and decision, later
financial activity, and the one next safe action. Consequential actions show
exact scope and downstream impact. Bulk operations are limited to homogeneous
routing or communication; each item is reauthorized and reports an explicit
outcome.

Phase 6/17 notifications carry only an opaque reference, safe stage/action,
and minimum timing context. Delivery never decides or completes the case.
Mission Control may mirror assignment, target, reminder, and follow-up, but its
task state cannot own or satisfy the root cause or any financial disposition.
There is no new case-management navigation, workflow builder, or recurring
recertification task.

The complete flow must pass WCAG 2.2 AA, 320-pixel reflow, keyboard and screen-
reader operation, visible focus, announced status/error recovery, financial
review-and-confirm, localization/RTL, slow-network, and representative-user
comprehension proof.

## Consequences

- Claimants and finance receive a fast, understandable recovery path without
  destructive reopening or a second approval/workflow product.
- Exact scope permits clean sibling work to continue and confines failures to
  the smallest proved coverage.
- Source owners retain correction authority, so case completion cannot rewrite
  or masquerade as payment, Field Account, statement, or accounting truth.
- Immutable occurrences, exact impact coverage, and commit-time reproof add
  implementation rigor but make concurrency, retry, repair, and audit
  deterministic.
- Production release depends on the certified Phase 3/9/10/12 authorization
  and classification substrate, D10/D13/D24 models, exact Legal Entity scope,
  and Phase-29-compatible private evidence seam.
- D1-D24 remain binding and unchanged.

## Alternatives rejected

- **Report-wide reopen and resubmit.** Rejected because it blocks clean work,
  destroys prior decision meaning, and hides which coverage changed.
- **Generic mutable case with Resolve/Close/Reopen.** Rejected because the
  status becomes a shadow approval and financial state machine.
- **Tenant-defined workflow, cause, or status builder.** Rejected because it
  creates untestable authority, migration, and support burden for rare work.
- **One action that rolls back every downstream system.** Rejected because the
  authoritative owners and their correction timing differ and external
  outcomes may be ambiguous.
- **Comments, email, silence, timers, AI, or notification delivery as proof.**
  Rejected because none establishes the required source fact or actor.
- **Mission Control task completion as domain completion.** Rejected because a
  coordination task cannot establish claimant, review, payment, Field Account,
  statement, accounting, or provider truth.
- **Broad administrator or service-role override.** Rejected because technical
  access is not product authority and would bypass tenant and evidence safety.

## Related decisions and evidence

- [ADR-0059 — Accounting-ready expense handoff](./0059-accounting-ready-expense-handoff.md)
- [ADR-0071 — Claim-level expense truth and purpose-routed tenant AI](./0071-claim-level-expense-truth-and-purpose-routed-tenant-ai.md)
- [ADR-0073 — Immutable Support Cycle statements](./0073-immutable-support-cycle-statements-with-automatic-tenant-publication.md)
- [ADR-0074 — Bounded prospective Expense Governance Profiles](./0074-bounded-prospective-expense-governance-profiles.md)
- [ADR-0076 — Artifact-always reimbursement handoff](./0076-artifact-always-reimbursement-handoff.md)
- [ADR-0084 — Source-family Expense Field Account Effect Recognition](./0084-source-family-expense-field-account-effect-recognition.md)
- [ADR-0085 — Own-identity expense collaboration](./0085-own-identity-claim-bounded-expense-collaboration.md)
- [Phase 12 permission configuration](../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md)
- [Phase 21 decision log](../prds/sitestacker-parity/phase-21-field-accounts-decision-log.md#d25--exact-cause-owned-expense-claim-resolution)
- [D25 research evidence](../prds/sitestacker-parity/phase-21-mission-dashboard-product-research-evidence.md#d25-decision-research--exact-expense-claim-resolution-without-destructive-reopening)
