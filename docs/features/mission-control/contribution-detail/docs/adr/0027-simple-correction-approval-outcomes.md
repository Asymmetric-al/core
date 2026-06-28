# ADR-CD-027: Correction approval outcomes close the loop simply

**Status:** Accepted (grill session 2026-05-29)

## Context

After a high-risk correction request is approved or rejected, Mission Control needs to close the loop for both approvers and the original requester. The workflow should be durable enough for finance controls but simple enough that routine approvals do not generate unnecessary task or notification noise.

## Decision

Correction approval outcomes use a simple hybrid workflow:

1. **Close the approval task:** Approving or rejecting a correction request automatically completes the linked approval task.
2. **Notify the requester:** The original requester receives an in-app outcome notification by default; email follows their configured preferences.
3. **Apply approved corrections immediately:** On approval, the correction becomes effective through the same contribution operations contract and returns an operation result showing downstream effects.
4. **Create follow-up work only on rejection:** On rejection, Mission Control records the rejection reason and may create a follow-up task for the requester to revise or abandon the request.

Modern practice requirements:

- Keep the approval outcome idempotent; repeated approve/reject submissions must not duplicate tasks, notifications, or adjustments.
- Require a rejection reason.
- Audit the outcome with actor, timestamp, decision, reason when present, linked correction request id, notification delivery attempts, and task transition.
- Deep links from notifications and follow-up tasks open contribution detail with the correction request outcome in context.
- Do not create a second task on approval unless a downstream effect explicitly needs a separate work item.

## Consequences

- The approval task is the durable work queue for approvers; requester notifications provide feedback without becoming a second approval queue.
- Rejection creates actionable follow-up only when staff need to revise something.
- Approval remains fast: apply the correction, refresh contribution detail, show downstream warnings, and finish.

## Alternatives rejected

- **Silent state change:** Too easy for requesters to miss, especially on rejected corrections.
- **Always create requester tasks:** Too noisy for approved corrections; a notification is enough when no requester action is needed.
- **Notification-only outcomes:** Loses durable task lifecycle semantics for approvers.
