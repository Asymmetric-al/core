# Own-identity, claim-bounded expense collaboration

**Status:** Accepted (founder ruling, Phase 21 grill session — D24)

## Context

Phase 21 D10 makes an immutable Expense Claim Version the claimant-asserted
source fact and an Expense Report Submission the immutable envelope that pins
exact versions and the actual submitter. D13 separately owns policy, route,
review, exception, and conflict truth. D19 says Support Assignment participant,
spouse, teammate, leader, and other relationship facts grant no access or
expense responsibility. D22 distinguishes requester, preparer, and submitter
for optional prospective authorization, but it does not authorize work on an
actual D10 claim.

Missions organizations nevertheless need spouses, teammates, ministry
assistants, accessibility helpers, and centralized expense coordinators to
prepare actual claims under their own identities. Claimant-only preparation
would make ordinary travel, intermittent-connectivity, accessibility, and
month-end workflows brittle and encourage password sharing. An account-wide
proxy would expose unrelated receipts, support balances, supporter data,
compensation, payee/bank information, and settings; blur claimant and actor
truth; and create a second authorization system beside Phase 12.

The design must therefore support narrow collaboration without impersonation,
relationship-derived permission, helper-created claimant consent, hidden
partial submission, or downstream financial authority. It must also remain
quiet and absent for tenants that do not enable it.

## Decision

> **C-prime-amended-and-hardened (C-prime-R) — one optional,
> Tenant-controlled, own-identity exact-claim-bounded Expense Collaboration
> Assignment Version that records responsibility, provenance, and a code-owned
> collaboration-mode ceiling but never replaces Phase 12 authorization; bound
> to one exact Tenant, Legal Entity, Expense Program, claimant Party, helper
> Party and accepted authenticated principal, stable Expense Claim, covered
> item/split/purpose/evidence scope, an explicit code-owned Evidence Access
> Projection Version from which stricter Phase 3/10 classification may only
> subtract, and half-open interval; activated only through a separate
> authority-free, one-time, expiring invitation accepted by the verified
> principal, and otherwise absent unless enabled under a staff-managed,
> claimant-managed, or combined appointment posture; with one quiet
> prepare-only default, exact independently revocable assignments even after
> batch setup, and one separately enabled mechanical submission operation only
> for complete unchanged Claim Versions whose material facts and evidence-link
> set are pinned by immutable authenticated Claimant Confirmation or a
> versioned tenant-admitted claimant-authored external attestation meeting an
> Asym minimum proof floor; explicit multi-claim, claimant, Legal-Entity,
> item/split, purpose, currency, and evidence coverage with no silent omission
> or hidden partial submission; separately preserved claimant, economic payer,
> evidence contributor, preparer, submitter, confirmer/attestor, reviewer,
> approver, beneficiary/payee, and actual-principal truth; minimum private
> evidence access through current-authorized non-cacheable retrieval,
> persistent scoped “Helping with expenses” context, non-transitive deny-first
> future-access revocation without fictional recall of delivered bytes,
> identity/lifecycle quarantine without automatic succession, semantic
> idempotency, commit-time reauthorization and current-version/epoch CAS,
> immutable action provenance, cause-owned observability, and append-only
> correction and recovery—without shared credentials, whole-account
> impersonation or visibility, a second PDP, generic delegation graph,
> membership-, spouse-, household-, team-, manager-, email-, OCR-, match-, AI-,
> notification-, silence-, or timeout-derived authority, helper-created
> claimant consent, stale or reusable evidence URLs, helper-selected review,
> self-approval, transitive delegation, automatic successor authority,
> payment/payroll/Field-Account/accounting authority, public helper/evidence
> leakage, or any reopening of Phase 21 D1-D23.**

### Collaboration is not authorization

An Expense Collaboration Assignment Version is an immutable responsibility,
scope, and provenance envelope. It stores one code-owned mode ceiling—
`prepare_only` or `prepare_and_submit_confirmed`—and exact claim/evidence scope.
It is not an ACL, role, arbitrary operation list, formula, workflow, account
proxy, or delegation graph and grants nothing by itself.

Phase 12 remains the sole request-time Policy Decision Point. Every read and
command, including list, detail, evidence upload/finalization/retrieval, draft
mutation, ready-for-review, submission, notification, export, repair,
background job, and support action, intersects the current assignment with the
current Active Tenant Assignment, independently granted capability, claimant,
helper Party/principal binding, Tenant, Legal Entity, Expense Program, stable
Expense Claim, item/split, purpose, evidence projection/classification, claim
state, assignment state, and governance epoch. Forced coarse RLS and complete
same-scope database constraints remain defense in depth, not the fine-grained
authorization engine.

The feature is Tenant- and Legal-Entity-off and structurally absent by default.
An enabled tenant chooses staff-managed (recommended), claimant-managed, or
combined appointment. That posture decides who may request an appointment and
never widens the tenant's code-owned mode or evidence ceiling.

### Invitation and exact appointment

An Expense Collaboration Invitation Version is opaque, one-time, expiring, and
authority-free until the intended authenticated and verified principal accepts
through current authorization and CAS. Auth invitation or account creation is
not Tenant membership, Party association, principal binding, or collaboration
authority. Pending, expired, rejected, superseded, and ambiguous invitations
grant nothing.

Acceptance creates one exact, independently revocable assignment for one
stable Expense Claim. Previewed batch setup may reduce staff work but still
creates individual versions with their own claimant/helper/principal binding,
scope, evidence projection, interval, mode, provenance, and successor lineage.
A helper cannot appoint another helper or expand their own assignment.

### Prepare-only and claimant-confirmed submission

The ordinary `prepare_only` mode permits only staged private evidence
contribution, minimum currently authorized evidence access, unsubmitted draft
preparation, and **Ready for claimant review** within the exact assignment.

The optional `prepare_and_submit_confirmed` mode adds only mechanical
submission of a complete, unchanged Claim Version already covered by an
immutable Claimant Confirmation Version. Confirmation pins the exact Claim
Version digest and all material assertions, including claimant, Legal Entity,
economic payer, item/split amounts in integer minor units, ISO currency,
incurred date, merchant/payee assertion, business purpose, funding
classification, evidence-link set, missing-receipt declaration, applicable
tax/relationship answers, and attestation policy/method/source. Any material
successor stales it.

A claimant without an Asym login may use only a versioned tenant-admitted,
claimant-authored external attestation that meets the Asym minimum proof floor,
pins the same digest and explicit assertion, and preserves source, time,
method, evidence strength, and admitting actor. Tenant policy may strengthen
the floor but cannot treat helper assertion, forwarded email, reply-link
possession, silence, timeout, notification delivery, a prior claim, or model
inference as confirmation. The helper cannot create, admit alone, alter, or
reuse the claimant's confirmation.

### Actor and review separation

Claimant, economic payer, evidence contributor, preparer, submitter,
confirmer/attestor, reviewer, approver, beneficiary/payee, and actual actor
principal remain separate typed facts. On-behalf wording never rewrites the
actual actor. The claimant's assertion comes from exact confirmation, not from
the helper or submitter identity.

A helper who prepared, submitted, paid, benefited from, or contributed evidence
to a claim cannot satisfy an independent D13 review step for that claim even if
they hold a general reviewer role. The helper cannot choose the review route,
review or approve, issue an exception, edit bank/payee data, mark paid, create
an Approved Expense Snapshot or Reimbursement Obligation, move Field Account
capacity, release payment/payroll, or deliver accounting.

### Complete submission and exact scope

A multi-claim Expense Report Submission is admitted only when every included
Claim Version and item/split has current exact collaboration coverage, current
Phase 12 authority, permitted evidence visibility, and current confirmation. A
report cannot cross claimant Parties or Legal Entities. Currency remains exact
per claim/item. Different purposes may be grouped only when every exact slice
qualifies.

Uncovered work is blocked or intentionally submitted through a separately
selected envelope. It is never silently omitted, and partial server success is
never represented as complete submission. A material edit creates a successor
Claim Version and requires fresh confirmation and submission.

### Evidence, concurrency, and lifecycle

Helper evidence input is staged, private, resumable, scanned,
non-authoritative, and reauthorized at finalization and linking. Sender,
filename, OCR, merchant/date/amount similarity, or model confidence may suggest
a candidate but cannot select claimant, establish authority, confirm, or
submit. Ambiguous or quarantined evidence remains private.

Evidence is retrieved only through a server-authorized, current-PDP,
non-cacheable private gateway. Reusable bearer URLs are not the authority seam.
Deny-first revocation fences future reads/writes and new evidence delivery,
invalidates authorization caches, suppresses stale notifications, advances the
governance epoch, and appends a successor; it does not claim to recall a copy
already received.

Protected commands use semantic idempotency and one short local transaction
that reauthorizes immediately before commit and CAS-checks current claim,
assignment, principal binding, evidence disposition, and governance epoch.
Immutable action/audit provenance and identifier-only outbox facts append in
the same transaction. External storage, scan, email, and notification work is
recoverable outbox work. Last-write-wins, blind retry, and distributed-
transaction fiction are prohibited.

Helper/claimant disablement, offboarding, leave, death/incapacity, spouse/team
separation, Party merge/split, principal relink, Legal Entity change,
classification change, and tenant deactivation deny new work first and
preserve provenance. Drafts become an owned reassignment/disposition task. No
spouse, teammate, helper, participant, manager, or household member
automatically succeeds to claimant authority; ambiguous identity change
quarantines instead of retargeting.

### Quiet product experience

When enabled, setup uses one plain-language card with the prepare-only default,
literal evidence/action consequences, and progressive disclosure of the
advanced confirmed-submit mode. There is no generic permissions matrix or
`Full access` choice.

The helper remains visibly signed in as themselves under a persistent
**Helping Jordan with expenses** context and sees only exact assigned claims.
The claimant receives one **Alex prepared an expense for you** task and lands
on the first changed or unconfirmed material fact. Calm statuses distinguish
`Draft`, `Ready for your review`, `Confirmed`, `Submitted for review`, and
`Needs changes`. Advanced submission names whose facts were confirmed, the
exact version, the actual submitter, and the continued separation from
approval, reimbursement, payment, and accounting.

Healthy work creates no recurring admin task. Event-triggered review and one
orphan-work queue replace periodic bureaucracy. The entire flow requires WCAG
2.2 AA, mobile/reflow, keyboard, screen-reader context, visible focus, status
announcement, financial error-prevention, and comprehension proof.

### Independent downstream truth

D24 never creates, qualifies, dates, fulfills, or modifies D13 approval, an
Approved Expense Snapshot, Reimbursement Obligation, D23 Field Account effect
or coverage, D15 compensation/payment handoff, External Payment Occurrence,
payroll, Phase 20 Accounting Release or Bank Match, provider posting/readback,
QBO/Xero truth, missionary statement, supporter feed, or public-giving truth.
Downstream owners may retain only minimum non-authoritative actor provenance
after their own independent admission succeeds.

Submitted-claim correction uses D10 successor versions and fresh confirmation/
submission. Every downstream owner retains its own append-only correction
path. Helper identity is available to the claimant and protected audit purpose
but excluded from public/supporter/statement projections, ordinary telemetry,
and purpose-unrelated notifications.

**Phase 21 D25 precision amendment (2026-08-02).** A D24 helper may participate
in D25 only through the exact current Assignment, Evidence Access Projection,
operation ceiling, and their own identity. D25 cannot widen prepare-only scope,
manufacture claimant confirmation or unavailability, let a helper answer as
the claimant, transfer authority after revocation or lifecycle change, or turn
case assignment/completion into review, payment, Field Account, statement, or
accounting authority. Every D24 negative boundary remains binding.

## Consequences

- Ordinary spouse, teammate, assistant, accessibility, and centralized-
  preparation workflows work without shared credentials or account proxying.
- The clean path remains one helper preparation action followed by one claimant
  review/submit task; tenants that do not need collaboration see nothing.
- Exact scope, confirmation, actor separation, private evidence, and request-
  time authority increase implementation/test rigor but prevent false claimant
  assertions and privacy leaks.
- Phase 12 remains the sole authorization product; D13 remains the sole review/
  exception product; no generic delegation or workflow engine is created.
- Runtime release depends on the completed Phase 3/9/10/12 projection,
  Party/principal, Legal-Entity, PDP, governance-epoch substrate and D10's
  Phase-29-compatible private receipt-byte seam.
- D1-D23 and every downstream money/accounting authority remain unchanged.

## Alternatives rejected

- **Claimant-only preparation and submission.** Rejected because it breaks
  common missions, accessibility, travel, and month-end workflows and creates
  password-sharing pressure.
- **Broad account-level proxy or impersonation.** Rejected because it exposes
  unrelated private/financial data, obscures actual actors, enables capability
  creep, and duplicates or bypasses Phase 12.
- **Infer authority from spouse/team/Support Assignment participation.**
  Rejected because relationship and participation are not authorization and
  can change independently.
- **One generic delegate permission or tenant-authored operation matrix.**
  Rejected because it creates a second permissions product and cannot safely
  separate evidence, prepare, confirm, submit, review, and payment powers.
- **Treat email, OCR, matching, notification, silence, or timeout as claimant
  confirmation.** Rejected because none proves who asserted the immutable claim
  facts.
- **Reusable signed evidence URLs as revocable access.** Rejected because token
  expiry or revocation cannot honestly recall delivered/cached bytes.
- **Automatic helper/spouse succession after incapacity or departure.**
  Rejected because operational relationship never establishes claimant or
  representative authority.

## Related decisions

- [ADR-0059 — Accounting-ready expense handoff](./0059-accounting-ready-expense-handoff.md)
- [ADR-0071 — Claim-level expense truth and purpose-routed tenant AI](./0071-claim-level-expense-truth-and-purpose-routed-tenant-ai.md)
- [ADR-0074 — Bounded prospective Expense Governance Profiles](./0074-bounded-prospective-expense-governance-profiles.md)
- [ADR-0076 — Artifact-always reimbursement handoff](./0076-artifact-always-reimbursement-handoff.md)
- [ADR-0080 — Organization-controlled Support Assignments and separated access](./0080-organization-controlled-support-assignments-and-separated-access.md)
- [ADR-0083 — Optional exact Prospective Expense Authorization](./0083-optional-exact-prospective-expense-authorization.md)
- [ADR-0084 — Source-family Expense Field Account Effect Recognition](./0084-source-family-expense-field-account-effect-recognition.md)
- [Phase 12 permission configuration](../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md)
- [Phase 21 decision log](../prds/sitestacker-parity/phase-21-field-accounts-decision-log.md#d24--own-identity-claim-bounded-expense-collaboration)
- [D24 research evidence](../prds/sitestacker-parity/phase-21-mission-dashboard-product-research-evidence.md#d24-decision-research--own-identity-expense-collaboration)
