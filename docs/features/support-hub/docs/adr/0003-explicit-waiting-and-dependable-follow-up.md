# Explicit waiting meanings with dependable follow-up

**Status:** Explicitly founder-ratified with all amendments, changes and updates,
Phase 26 D3, 10 September 2026. This includes all D3-R01–R15, P01–P16, the complete
UX blueprint and documented temporal, owner, rollout and operational requirements.
D1/D2 remain fully ratified. This is a grooming ADR, not a formal specification
or implemented runtime behavior.

## Decision

One canonical Support work status describes the next obligation. Open means a
substantive next step or due review/follow-up is owed. Waiting for requester means
needed input from admitted people seeking help is the remaining active blocker.
Waiting on our side means a colleague, owning domain or outside party must supply
an input the tenant remains responsible for obtaining. Resolved deliberately
completes the Support obligation; it does not establish delivery or owner-action
completion. Optional progress updates do not end genuine waiting. Active Support
work takes precedence; otherwise mixed active blockers use Waiting on our side
with existing permitted context, without a fifth Mixed state or task graph.

The UI exposes one readable header picker and consistent queue labels, using the
existing base-maia/Base UI system. Status changes preserve selected detail, draft,
recipient audience, focus and truthful filter membership. Correction is a new
authorized conditional event, not a history rollback or external-effect reversal.

## Why this tradeoff

One general Waiting status and requester-only Waiting with all tenant work Open
are credible simpler alternatives. The founder chose the additional distinction
to make actionable work, requester input and colleague/service waits visible in
the queue. It is consequential because work meaning controls follow-up, ownership
and historical reporting across Support and its owner-domain handoffs. No usage
study establishes universal superiority; real staff task tests remain required.

## Temporal and authority boundaries

Work status, assignment, read state, timer, draft audience, delivery and CRM/giving/
document/care outcomes remain distinct facts. One canonical authorized transition
command derives the trusted tenant and human profile/system cause, checks reviewed
versions and records state/history/reminder/recovery intent atomically. Direct
client or legacy writers cannot bypass it. Current-state snapshots are distinct
from append-only resolution/wait/reopen episodes and original command receipts.
Lower-revision late responses cannot overwrite newer work.

Snooze schedules attention without changing work status. Waiting-side-only changes
preserve the reminder. A current due reminder opens for follow-up once and preserves
its prior waiting reason; it does not imply input arrived. Explicit Open clears
deferral even when already Open; Resolve cancels the reminder. Early callbacks
retain a durable future attempt. Cancelled/replaced/resolved generations cannot
act, even after a workflow lease expires. The existing product-owned shared
workflow ledger and claim infrastructure remain the execution boundary; no new
scheduler or generic attention-state engine is introduced.

First-time admitted relevant replies, current authorized awaited outcomes and
fresh actionable adverse evidence create Open review work. Duplicate, unadmitted,
already-reviewed or provably superseded effects do not thrash status. First-time
late intake is ordered by server admission, not vetoed by an old sender timestamp.
Reopen preserves earlier resolution history. Repeated Resolve is unchanged/replay.

## Owner and rollout reconciliation

Support status cannot grant CRM/finance/care access or perform owner actions.
Existing owner commands, source attribution and stable authorized references must
be qualified; current query links are not a completed generic handoff system.
New queues/counts require complete authorized predicates before pagination and
historical metrics require real transition/calendar evidence.

Compatible contracts precede activation. Ambiguous legacy Pending/Snoozed is Open
for migration review with original status/timer evidence retained and review not
hidden by deferral. Old writers are fenced. Writer disablement preserves due work,
accepted-message recovery and history; roll-forward does not rewrite prior facts.

No default combined Send action, arbitrary closure timeout, SLA pause rule or
reminder preset is ratified through this work-granularity decision. Their safety
invariants are captured while those distinct choices remain open.

## Complete review and required proof

- [23-category review, exact D3-R01–R15 and P01–P16](../../grill/phase26-d3-adversarial-review.md)
- [UX blueprint and exact interaction copy](../../grill/phase26-d3-ux-blueprint.md)
- [Independent evidence and bounded experiments](../../grill/phase26-d3-evidence.md)
- [Ratified email continuation](0001-email-continuation-with-owner-authorized-actions.md)
- [Ratified reply defaults and audiences](0002-personal-reply-defaults-and-explicit-draft-audiences.md)

**Historical review disposition: Accept with required amendments.** Those
amendments are now fully ratified. The founder confirmed:

> Yes, I ratify this, including all the amendments, changes, and updates you’ve made. Record the ratified decision and all changes in full for this grill-with-docs session.

The complete accepted record is linked above; no required amendment is omitted.
This does not claim runtime readiness or authorize product implementation, formal
OpenSpec changes, tickets, publication or real mail.
