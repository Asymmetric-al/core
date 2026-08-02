# Immutable Support Cycle statements with automatic tenant publication

**Status:** Accepted (founder ruling, Phase 21 grill session — D12)

Phase 21 uses the immutable D11 **Support Cycle Integrity Manifest** and its
exact covered Field Account Occurrences as the sole financial authority for a
Support statement. It does not create a second statement-facts ledger, mutable
historical query, statement run, or publication batch.

A successful Support Cycle Close atomically commits its manifest and one
durable post-close source occurrence. It never waits for document rendering,
validation, storage, access, notification, QBO/Xero, payroll, reimbursement
payment, or another external provider.

When the effective D9 **Support Workspace Publication Profile Version**
authorizes Support statements, one post-commit idempotent Phase 21 Approved
Data View deterministically assembles the exact immutable Phase 18 Facts
Package from the closed manifest and its covered occurrences. Phase 18 admits
that package only through the code-owned
`field_account.support_statement@1` governed-business purpose and owns the
logical document, current accessible PDF, exact artifact bytes, immutable
same-facts artifact successors, retention, and private artifact access.
During grooming, that purpose is a reserved additive contract rather than a
claim of current runtime support. Phase 21 implementation must register and
certify it through the existing Phase 18 service before any tenant can
activate it.

Publication is a prospective tenant policy, not a recurring task:

- the ordinary posture is Off until a tenant intentionally activates a
  compatible balance-publishing D9 profile;
- compatible guided profiles preselect **Show support statements** in the
  existing one-time activation review, where the tenant may turn it off;
- balance-hidden profiles reveal no statement, placeholder, count, search
  result, alert, or existence signal;
- the Profile may offer the statement-ready event family with the tenant-safe
  default Off, but each recipient's channel choice lives only in a separate
  Support Workspace Notification Preference Version and uses the existing
  Phase 17/6 protected document-artifact communication seam; and
- enabling publication does not silently expose prior cycles. Any historical
  publication is a separate bounded, previewed, explicitly authorized action,
  while access removal takes effect immediately.

A healthy close creates no statement administration. Staff do not select
dates, recipients, accounts, templates, rows, or delivery addresses; approve
or publish each cycle; reconcile render counts; retry transient work; or
resend a notice to make portal access work.

The missionary workspace presents one quiet **Support statements** history.
Each current authorized item is scoped to one exact Tenant, Legal Entity,
Support Assignment, currently Phase 12-authorized recipient principal,
charitable purpose, Field Account, Support Cycle, and ISO currency. Support
Assignment Participant Membership alone grants nothing. It shows the period
and **Finance-confirmed through** date,
opens a responsive semantic summary, and offers one **View or download PDF**
action. Prior periods are collapsed; technical artifact versions are not
shown as peer files. Support-cycle cadence governs publication—monthly by
default and biweekly where the tenant closes biweekly. Different currencies
remain separate, ISO-labelled statements that may be grouped visually by
period but are never converted or summed.

The statement explains only the closed facts: opening balance, present
balance-changing categories, closing balance, exact through date, and linked
later correction meaning. Nonzero reservations or reimbursement obligations
may appear only when the close manifest pins their exact source/version and a
typed inclusion relationship. A separately labelled open-items section states
whether each position is included in the closing balance and never implies
payment or availability. The artifact excludes donor rosters, donor contact
data, payment instruments, internal notes, raw provider identifiers, and
unrelated CRM data. It states that it is organization-controlled support
activity and is not a tax receipt, bank statement, payslip, proof of payment,
or statement of funds available for withdrawal.

A later financial fact or correction appends through its owning domain and a
later Support Cycle; it never rewrites a prior close or statement facts. A
same-facts accessibility or presentation repair may create an immutable Phase
18 artifact successor behind the same logical statement row. Current
authorization is rechecked before every enumeration, view, full download, or
range request. Private object identity or a short-lived delivery mechanism is
never authorization.

Transient downstream failures recover automatically. The last correct
balance and prior statement remain independently available and truthfully
dated. A prolonged preparation delay appears only inside the statement area.
After automatic recovery is exhausted, one deduplicated cause-owned staff
exception identifies the affected safe scope, owner, and next action; it never
requires finance to reopen the close. Document, access, communication,
accounting, payroll, reimbursement-payment, and external-provider outcomes
remain independently authoritative.

**Phase 21 D25 precision amendment (2026-08-02).** A D25 case or derived
**Complete** label cannot mutate a published statement, its Approved Data View,
Facts Package, artifact, or underlying close. D25 may request and observe only
the exact D12-owned correction or later-statement result. Prior artifacts remain
immutable, access remains independently authorized, and a statement result
cannot complete a D25 case until its manifested source disposition is proved.

## Consequences

- D11 remains the sole Field Account close-facts authority.
- Phase 21 owns statement eligibility, the Approved Data View, financial
  meaning, and correction semantics; Phase 18 owns document and artifact
  truth; Phase 17 owns governed content; Phase 6 owns delivery outcome.
- The existing D9 profile supplies tenant control without creating recurring
  work or a second settings model.
- A statement artifact cannot block, reopen, advance, or correct a Support
  Cycle Close.
- A final closure statement may remain protected finance evidence, but record
  retention never grants a former missionary continuing portal access.
- The current prototype's **Available Funds**, **Withdraw**, and generic
  **Download Report** controls are replacement targets, not reusable Phase 21
  semantics.

## Rejected alternatives

- live regeneration of prior statements from current projections;
- a Phase 19-style statement run, second scheduler, recipient workspace, or
  per-cycle approval and Publish action;
- a duplicate Phase 21 statement-facts authority;
- arbitrary official date ranges or a second monthly rollup over biweekly
  Support Cycles;
- mandatory email, PDF attachment by default, or delivery as document truth;
- retroactive mass publication when a profile is enabled;
- one mixed-currency or converted authoritative statement total;
- stable bearer URLs or authorization checked only when the document is
  created;
- donor-PII expansion or claims of ownership, availability, withdrawability,
  tax treatment, payroll readiness, payment, bank reconciliation, or
  QBO/Xero posting.

## Related decisions

- [ADR-0062 — Finance-closed Field Account cycles](./0062-finance-closed-field-account-cycles.md)
- [ADR-0067 — Proof-gated parallel currency Field Accounts](./0067-proof-gated-parallel-currency-field-accounts.md)
- [ADR-0070 — Optional Approved Support Plans and bounded workspace publication](./0070-optional-approved-support-plans-and-bounded-workspace-publication.md)
- [ADR-0072 — Layered Field Account integrity and cause-owned repair](./0072-layered-field-account-integrity-and-cause-owned-repair.md)
- [Phase 18 executable document-purpose and authority manifest](../prds/sitestacker-parity/phase-18-document-purpose-authority-manifest.md)
- [Phase 21 decision log](../prds/sitestacker-parity/phase-21-field-accounts-decision-log.md)
