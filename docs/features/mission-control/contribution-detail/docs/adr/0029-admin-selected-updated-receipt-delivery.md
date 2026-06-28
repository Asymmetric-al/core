# ADR-CD-029: Updated receipt delivery is selected at correction time

**Status:** Accepted (grill session 2026-05-29)

## Context

Corrections can change values already represented on a sent receipt. Mission Control must make it easy for authorized staff to send the donor an updated receipt, while avoiding surprise emails and respecting donor communication preferences.

Some donors do not have an email address or have chosen not to receive email. Staff still need a way to produce an updated receipt for mailing, printing, or manual delivery.

## Decision

When an authorized admin or finance staff member makes a correction that affects receipt content, contribution detail presents a simple receipt delivery choice at the time of the change:

1. **Send updated receipt by email:** Available only when the donor has an email address and has not opted out of email receipts.
2. **Generate updated receipt PDF:** Available when email is unavailable, disallowed by donor preference, or chosen by the admin.
3. **Do not send/generate now:** Allowed only with an explicit reason when policy permits deferring receipt follow-up.

If the correction requires approval, ADR-CD-030 applies: the requester proposes the delivery action and the approver confirms or changes it before the correction becomes effective.

ADR-CD-031 defines the tenant policy layer for defaults, defer guardrails, role guardrails, and donor email opt-out behavior.

Modern practice requirements:

- Never auto-send an updated receipt solely because a correction was saved.
- Show which receipt fields changed before staff choose delivery.
- Respect donor email availability and donor email preference; if email is not allowed, guide staff to PDF generation instead.
- Record the selected delivery action in the audit trail with actor, timestamp, correction request/adjustment id, receipt snapshot id, and delivery channel.
- The operation result must show whether an updated receipt was emailed, generated as PDF, deferred with reason, or blocked.
- PDF generation creates a durable receipt snapshot even if the file is downloaded or printed later.

## Consequences

- Staff can complete receipt follow-up in the same correction workflow without needing a separate hunt through receipt actions.
- Donor communication remains deliberate and preference-aware.
- PDF fallback supports donors without email or with email opt-out.

## Alternatives rejected

- **Automatic email on correction:** Too risky; it can surprise donors and violate communication preferences.
- **Only flag receipt affected:** Too passive; staff may miss required receipt follow-up.
- **PDF only:** Ignores the simpler path for donors who expect email receipts.
