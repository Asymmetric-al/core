# ADR-CD-028: Pending correction approvals use simple reminders and optional escalation

**Status:** Accepted (grill session 2026-05-29)

## Context

High-risk correction requests can block receipts, CRM updates, reconciliation, and staff follow-up. If a request remains pending too long, staff need visibility and a lightweight nudge without turning contribution detail into a full SLA or automation engine.

## Decision

Pending correction approvals use a simple tenant-configurable SLA policy:

1. **Reminder:** After a configured pending interval, remind eligible approvers through their configured channels.
2. **Optional escalation:** After a longer configured interval, escalate to the configured finance approver/admin role.
3. **Visible stale state:** Contribution detail and Tasks show that the correction request has been pending too long.
4. **Never auto-approve:** Time-based rules can remind or escalate, but they cannot approve or apply the correction.

Modern practice requirements:

- Tenant defaults define reminder and escalation intervals; super admins can change them.
- Reminder/escalation delivery respects approval ownership policy, notification preferences, and granular capabilities.
- Delivery is idempotent and low-noise; repeated reminders should not spam users.
- Reminder and escalation events are audited with correction request id, target role/users, channel, and timestamp.
- Pending-too-long state is derived from request timestamps and policy, not manually maintained status.

## Consequences

- Stuck approvals become visible without adding a complex SLA engine.
- Tenants can match their operating cadence while preserving conservative finance controls.
- Approvals still require an authorized human decision.

## Alternatives rejected

- **No SLA:** Simple, but allows corrections to stall silently.
- **Escalation only:** Misses the lighter nudge that solves most delays.
- **Automatic approval after timeout:** Unsafe for financial controls and conflicts with approval ownership.
