# ADR-0100: Layered Field Account integrity and cause-owned repair

**Status:** Accepted (founder ruling, Phase 21 grill session — D11)

Phase 21 owns immutable source-addressed balanced Field Account Occurrences,
their independently persisted bounded organization-control-side entries, the
derived non-writable Field Account Control Position, Support Cycle Integrity
Manifests, Field Account integrity-verification verdicts, and cause-owned Field
Account Integrity Cases.

Every occurrence is structurally isolated by Tenant, Legal Entity, approved
purpose, Field Account, and ISO currency; uses checked integer minor units;
commits all same-currency Field-Account-side and organization-control-side
entries atomically; pins exact source and policy versions; conserves
non-overlapping source coverage; and is protected by semantic idempotency plus
account-version fences. The control side is independently persisted. It is
never manufactured by negating the Field-Account-side net position, mapped to
a tenant-authored chart of accounts, or used as a general-ledger substitute.

Every successful Support Cycle Close atomically publishes one fresh immutable
Support Cycle Integrity Manifest. The manifest proves exact opening/activity/
closing continuity, internally balanced occurrences, independent control-side
balance, complete required pairs, unique and complete source coverage, scope
and currency isolation, and deterministic rebuild over both:

- the half-open business-date interval `[cycle_start, cycle_end)`; and
- the monotonic committed-ingestion interval
  `(previous_cursor, captured_cursor]`.

For the first post-activation close, `previous_cursor` is the canonical
ingestion cursor captured and proved by the active Phase 21 D17 Opening Coverage
Manifest, and opening continuity begins with that manifest's active
Finance-confirmed position plus any separately covered append-only correction.
The first `[cycle_start, cycle_end)` starts at the one common operational through
boundary proved across every predecessor source family. No imported history or
in-flight occurrence may fall into neither interval or both intervals.

Timestamps, cached readiness, samples, capped scans, scheduled sweep results,
or live QBO/Xero/provider calls cannot authorize a close. Workload-shaped,
cursor-resumable verification prepares current evidence and performs bounded
historical re-verification, but each close and each financial case clearance
requires its own fresh complete proof.

One proved defect creates or advances one typed Field Account Integrity Case
at the smallest proved affected scope. Mission Control may own assignment,
comments, reminders, and follow-up presentation; it does not own the financial
cause, verdict, correction, containment radius, or clearance. A completed,
acknowledged, snoozed, or deleted task cannot clear the case.

Repair is limited to:

- deterministic rebuild of a disposable projection;
- proved idempotent replay of exact authorized missing work;
- correction through the domain that owns the source fact;
- an append-only linked reversal or compensating Field Account Occurrence;
- a prospective configuration successor; or
- governed engineering recovery for proved storage, migration, or platform
  corruption with exact before/after evidence.

Mandatory adverse corrections remain appendable inside containment. No role or
tenant setting can authorize direct row or balance edits, mutation/deletion of
posted history, force close, force balance, tolerance, plug, generic suspense,
generic mark-fixed, or a tenant-wide freeze for a local defect.

Phase 20 may provide independently persisted accounting-coverage, delivery,
readback, and drift evidence. Phase 20, QBO, and Xero retain Accounting Release,
posted-book, and final-reconciliation authority, while Phase 21 retains Field
Account integrity authority. A Phase 20-owned cause creates an Accounting
Exception Case; a Phase 21-owned cause creates a Field Account Integrity Case.
Neither financial case is cleared by their shared Mission Control follow-up.

**Phase 21 D23 precision amendment (2026-08-01).** D23 owns only profile-
resolution and effect/coverage/conservation cases. Approval, card/source,
payment, claimant settlement, organization support cost, noncash realization,
Field Account integrity, and Phase 20 accounting cases remain with their cause
owners. A first late D23 qualification is a new occurrence rather than a
correction. Mission Control task completion never qualifies, reverses, repairs,
or clears the financial condition.

**Phase 21 D25 precision amendment (2026-08-02).** An Expense Claim Resolution
Case is not a Field Account Integrity Case. If D25 exposes a proved arithmetic,
coverage, isolation, or close-integrity defect, D11 alone opens the typed
Integrity Case, contains the affected scope, authorizes repair, and requires
fresh integrity proof. Either case or its Mission Control task may reference
the other, but no case/task state clears, repairs, or completes the other.

**Phase 21 D27 precision amendment (2026-08-02).** D27 may reference and
present the first and later D11 close/integrity evidence, but its readiness
manifest, operational projection, optional-capability state, or Mission
Control follow-up cannot close, force, waive, clear, or reinterpret a Support
Cycle or Field Account Integrity Case. Post-start containment continues to use
the smallest cause-owned scope and never suppresses mandatory adverse
correction or append-only repair.

## Consequences

- A clean cycle presents one machine-prepared review and one authorized
  **Close support cycle** action; staff do not complete an accounting checklist.
- Tenants may configure cadence, authorized closers, routing, reminders,
  optional proportional review, and stricter advisories, but cannot weaken the
  invariants.
- Unaffected scopes continue while the smallest proved unsafe scope is
  contained.
- Missionaries see only the last proved ISO-labelled balance and through date,
  plus calm scope-safe review copy when their newer activity is affected.
- Historical manifests and occurrences remain portable and verifiable across
  projection, schema, and implementation upgrades.

## Related decisions

- [ADR-0090 — Finance-closed Field Account
  cycles](./0090-finance-closed-field-account-cycles.md)
- [ADR-0091 — Rail-qualified support-cycle
  admission](./0091-rail-qualified-support-cycle-admission.md)
- [ADR-0054 — Cause-owned accounting exceptions with shared
  follow-up](./0054-cause-owned-accounting-exceptions-with-shared-follow-up.md)
- [ADR-0116 — Evidence-gated Core Field Accounts production
  activation](./0116-evidence-gated-core-field-accounts-production-activation.md)
