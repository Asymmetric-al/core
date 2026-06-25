# ADR-CD-026: Correction approval notifications use tasks plus configurable channels

**Status:** Accepted (grill session 2026-05-29)

## Context

High-risk correction requests need durable routing to approvers without relying on a single ephemeral channel. Mission Control already has Tasks, in-app surfaces, email delivery, and a per-user notification preference pattern in Support Hub. Contribution operations should reuse those patterns through hook contracts without building the full automation builder in this phase.

## Decision

When a high-risk correction request is created, the system uses a **hybrid notification model**:

1. **Approval task (default on):** Create one durable Mission Control task linked to the gift and correction request. The task is the primary work item for approvers.
2. **In-app notification (default on):** Notify eligible approvers in Mission Control according to approval ownership policy (ADR-CD-025).
3. **Email notification (optional):** Send email to approvers when tenant or user preferences allow it.

Configuration layers:

- **Tenant defaults (super admin):** Which channels are enabled by default and whether task creation is required for correction approvals.
- **Per-user preferences:** Each staff member can choose how they are notified (in-app, email, both, neither where allowed) and whether correction-approval events should create a task assigned to them.
- **Policy enforcement:** Notification routing still respects approval ownership policy and granular capabilities; preferences cannot grant approval rights.

Modern practice requirements:

- One correction request maps to at most one approval task; notifications are idempotent and deduplicated.
- Every notification and task creation writes an audit event with actor/system, channel, target users/roles, and correction request id.
- Deep links open contribution detail with the pending correction request in context.
- Default conservatively: task + in-app on; email off unless opted in or enabled by tenant default.
- Email alone must not be the only durable work item when task creation is enabled at tenant level.

## Consequences

- Backend exposes hook contracts for task creation and notification dispatch; full automation builder remains out of scope.
- User preference storage follows the same hybrid model as table preferences: server source of truth, local responsive cache.
- Support Hub notification preference patterns are a reference implementation, not a hard dependency.
- Approver workload must remain visible in Tasks even if a user disables personal email/in-app alerts.

## Alternatives rejected

- **In-app only:** Too easy to miss when approvers are not actively in Mission Control.
- **Email only:** Not durable enough for finance approvals; poor traceability inside the product.
- **Task only with no notifications:** Works for power users but hides urgency from approvers who rely on alerts.
- **Fixed non-configurable channels:** Ignores tenant operating differences and individual notification needs.
