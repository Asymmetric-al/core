# ADR-0023: Contract-bounded Delivery Plans

**Status:** Accepted (founder ruling, Phase 17 grill session — D7)

> Full record: `docs/prds/sitestacker-parity/phase-17-system-messages-template-management.md`
> (ratified decision D7).

## Context

One business event can require an immediate receipt, a later reminder, an
in-product alert, or an escalation. Putting those steps in producer code makes
tenant-safe variation difficult; giving tenants a general workflow graph inside
System Messages duplicates Phase 34 and creates another timing and state engine.

## Decision

Each message contract declares only a small, versioned set of fixed, named
Delivery Plan step slots and permitted choices. The producer owns the event,
facts, recipient authority, business eligibility, timing fences, cancellation
fences, and source truth. Phase 17 owns the contract's bounded capability
envelope: which named steps may be enabled, disabled, delayed, escalated, or
assigned a permitted channel. Authorized tenant staff publish the
tenant-specific **Delivery Plan** by choosing only among those declared options.
For platform scope, the exact meaning-specific platform profile instead declares
one immutable Asym-owned fixed plan/version; it cannot resolve tenant
configuration or be altered by tenant staff.

Every authoritative producer occurrence enters Phase 6 through one bounded
`compileAndReleaseCommunicationPlanOccurrence` command. The producer supplies
one `plan_occurrence_token@1`, the source occurrence and fence, the complete
bounded candidate facts (which may be empty), and independent member tokens. The
top-level token is canonical opaque 1–128-byte UTF-8, PII/secret-free, unique
within the stable producer namespace, and retained raw only by the producer for
replay; Phase 6 stores its schema/version and derived slot hash, never raw bytes.
The generated registry—not the producer—resolves top-level scope/event/contract/
plan authority even for zero candidates plus every exact immutable binding
projection and effective plan.
Phase 6 inserts or locks one unique `communication_plan_occurrences` coordination
header and inserts or exactly replays the complete canonically ordered child set
in one PostgreSQL transaction. It verifies the exact compilation hash, member
count and digest, then writes `released_at` last. Claim SQL admits a child only
through its released same-scope parent. Exact retries return the prior header
and children, including a valid zero-member result; changed plan, binding,
condition, recipient, membership, count, digest, or child input under the same
plan-occurrence token hard-conflicts without partial eligibility.

After atomic release, every eligible step remains its own recipient-specific
Phase 6 intent with an independent occurrence slot and outcome. An eligible
external-delivery intent proceeds through its channel executor. An eligible
`in_product` intent creates one local `available` event and the Asym/Postgres
role-safe Phase 17 attention projection; it creates no provider submission,
provider state, or provider outcome. The coordination header is not a workflow
run, scheduler, outbox, queue, communication ledger, or outcome truth, and a
step cannot write business records.

Delivery Plans MUST NOT expose arbitrary event creation, audience queries,
free-form recipients, formulas, code, nested branches, loops, waits unrelated
to a producer-owned clock, record mutations, tasks, or general automation.
Those capabilities remain Phase 34 workflow definitions. A plan and its
effective revision are pinned before execution; later edits affect only future
eligible events.

## Consequences

- Staff get one understandable plan editor with contract-named choices, impact
  preview, synthetic test, immutable publication, and audit.
- Producer cancellation and current safety/consent fences remain live until a
  step crosses its preparation boundary.
- Crash before commit exposes no parent or child; crash after commit but before
  response exactly replays. Concurrent identical compilers converge on one
  released occurrence, while changed or disjoint membership under the same
  occurrence token conflicts. A committed unreleased header is an alerted,
  unclaimable invariant violation with no force-release path.
- Sibling delivery and engagement outcomes are independent only after the
  complete bounded plan occurrence has been atomically released.
- Plan execution reuses Phase 6; Phase 17 adds no queue, scheduler, outbox, or
  second communication ledger.
- Tests cover duplicate events, late workers, daylight-saving boundaries,
  disabled steps, changed plans, zero-member results, every compile crash point,
  concurrent same/changed compilers, finite-bound overflow, claim visibility,
  cancellation, and cross-tenant/platform isolation.
