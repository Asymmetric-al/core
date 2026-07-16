# ADR-0014: Product-owned, rail-isolated recurring recovery

**Status:** Accepted (founder rulings, Phase 16 grill session 2026-07-12/13 — D6–D10)

> Full record: `docs/prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md`
> (ratified decisions D6–D10).

## Context

Stripe can execute invoices and report payment finality, but its configurable
retry behavior cannot safely express the ratified donor schedule, collision,
communication, card-budget, and ACH-return rules. Running Asym retries on top of
provider Smart Retries risks duplicate attempts. Treating card and ACH alike is
also incorrect: ACH initiation, settlement, return exposure, reusable mandate,
and lawful re-presentation are distinct facts.

## Decision

Asym owns one narrow recurring-recovery policy, occurrence ledger, command
ledger, and scheduler; Stripe owns payment execution and provider-confirmed
finality. Provider-native automatic retry MUST be disabled or proven incapable
of creating an authorization attempt outside the product-owned D7 schedule.
Stripe may execute an Asym-owned, occurrence-bound command and report its
evidence; it may not replace, expand, reschedule, or independently own retry
policy. Candidate slots, runway, suppression, collision fences, budget, and
episode state remain product authority.

For cards, an eligible soft-failed weekly occurrence may use fixed +2 and +4
calendar-date slots; every other supported cadence may use +2, +4, and +6. A
normal scheduled occurrence wins over an unresolved older recovery. The
triggering occurrence and the next three normally scheduled occurrences may
each receive that bounded burst; the fourth later occurrence and subsequent
ones are regular-schedule-only until a genuine success or new authorization
resolves the failure episode. Misses never accumulate, increase a later charge,
move the calendar grid, or create debt, cash, a receipt, or a back-charge.

ACH receives no unattended same-occurrence representment. One exact R01- or
R09-returned occurrence may be reinitiated only by a donor-confirmed one-use
action under the same proven authorization lineage and only when the actual
provider/ODFI path proves lawful same-entry treatment and exclusive execution
ownership; otherwise the occurrence closes missed and the normal schedule
continues. Other return reasons never enter this exception.

Every attempt is occurrence-bound, idempotent, mutually exclusive with another
executor, and fenced by pause, skip, end, cancellation, authorization loss,
provider-control loss, schedule collision, live safety advice, and a
credential-wide ceiling. Communication is triggered by meaningful state
transitions, not raw attempts; mandatory rail/network/legal notices override the
normal quiet policy through one recorded delivery owner.

## Consequences

- Recovery is deterministic, testable, and independent of late processing or
  settlement, so the donor's calendar never drifts.
- Card and ACH use separate eligibility predicates, evidence, language, and test
  matrices rather than a generic retry abstraction.
- Staff can explain the triggering miss, recovery cycle N of 3, current slots,
  next normal gift, and no-catch-up balance; missionaries see only a calm,
  privacy-safe support projection.
- Durable semantic idempotency, advice versioning, reconciliation, stop controls,
  and fault/concurrency tests are release blockers.
- No tenant-authored retry calendar, unlimited retry loop, collections balance,
  generic dunning journey builder, or parallel payment engine is introduced.
