# ADR-CD-030: Receipt delivery is proposed by requester and confirmed by approver

**Status:** Accepted (grill session 2026-05-29)

## Context

Some receipt-affecting corrections require approval before they become effective. The staff member requesting the correction often knows the donor context and should be able to propose how to handle the updated receipt. The approver still needs final control over any donor-facing receipt action.

## Decision

For corrections that require approval, updated receipt delivery follows a simple proposal-and-confirmation model:

1. **Requester proposes:** When submitting the correction request, the requester chooses the intended receipt delivery action: email, PDF, or defer with reason.
2. **Approver confirms:** When approving the correction, the approver sees the proposed receipt delivery action and can confirm or change it before the correction becomes effective.
3. **Approval applies both:** Once approved, the correction and confirmed receipt delivery action are processed through the same contribution operations result.

Modern practice requirements:

- The proposal must show whether email is available based on donor email address and donor email preference.
- If email is unavailable or disallowed, the UI should guide the requester and approver toward PDF generation.
- Any approver change to the proposed delivery action must be audited with before/after values and reason when required.
- Rejection does not send or generate the updated receipt; it records the proposed delivery action only as request context.
- The operation result clearly distinguishes the requested delivery action from the confirmed delivery action.

## Consequences

- Requesters can capture donor-care context while the approver remains the final gate for donor-facing receipt delivery.
- Receipt delivery does not need a separate approval workflow.
- Approved corrections stay one workflow: approve correction, apply adjustment, and run the confirmed receipt outcome.

## Alternatives rejected

- **Requester-only delivery decision:** Too much authority for donor-facing receipt action when the correction itself requires approval.
- **Approver-only delivery decision:** Loses context captured by the staff member making the correction.
