# PRD 2: Email Studio Donor Correction Notifications

## Delivered split status

Delivered through split PRs #395-#396. Do not create a new `status:ready`
implementation issue from this historical PRD unless a follow-up gap is
identified against the shipped code.

## Problem statement

Contribution corrections can change what a donor sees, receives, or trusts.
Donors need clear notifications for money and official document changes, while
staff need settings so the product does not send noisy or confusing emails for
small internal actions.

The repo already has Email Studio, React Email Editor, provider-neutral
template storage, merge tags, immutable template versions, and Resend delivery.
Contribution operations must use that foundation rather than creating ad hoc
donor emails.

## Solution

Create donor correction notification support inside Email Studio. All
donor-facing contribution correction emails use Email Studio templates. The
contribution operations system chooses the template family/variant from the
real action type and outcome, applies notification policy, validates required
merge tags at activation and send time, sends through Resend, and records the
notification decision in the contribution audit trail.

If a required template is missing, inactive, or invalid at send time, the
contribution action still succeeds. The email is blocked, the audit trail
records the failure, and a follow-up task is created according to assignment
settings.

## Goals

- Add system template families for donor correction notifications.
- Keep templates editable through React Email Editor.
- Protect required merge tags at activation and send time.
- Add notification policy by action type.
- Allow a bounded personal note without replacing official template content.
- Record every notification decision.
- Use Resend through the existing delivery layer.
- Bridge failures into the shared task system from PRD 3.

## Initial template families

- refund notification family
- amount correction notification family
- designation correction notification family
- receipt correction notification family
- statement correction notification family
- payment state correction notification family
- donor relinking notification family

Variants include refund started, refund completed, refund failed, partial
refund completed, full refund completed, receipt corrected, statement
corrected, designation changed, and payment state corrected.

## Default notification policy

- refunds: auto-notify
- amount corrections: auto-notify
- receipt changes: auto-notify
- statement changes: auto-notify
- designation changes: always ask
- payment state corrections: always ask
- donor relinking: staff chooses

Suppression of a money or official document notification requires a reason.

## Implementation decisions

- Extend the existing Email Studio provider-neutral template model.
- Drafts may save with missing required tags, but active system bindings cannot
  activate without required tags.
- Send-time validation checks the active template/version again.
- Donor-facing automation and bulk notification sends must call the same
  notification module; they must not call Resend directly.
- Missing/invalid templates block only the email, not the contribution action.
- Failure tasks default to actor plus Finance Operations queue; tenant settings
  may choose actor-only, queue-only, or both.

## Testing decisions

Test behavior from the staff/donor perspective:

- template activation validation with required tags present and missing;
- send-time validation for inactive/invalid templates;
- policy modes: auto-notify, always ask, staff chooses;
- suppression reason requirement;
- variant selection for refund started/completed/failed, receipt corrected,
  designation changed;
- personal note inclusion through a safe field;
- blocked template behavior creates audit and task intent;
- automation-triggered donor emails cannot bypass Email Studio templates.

## Definition of done

- Contribution notification template families exist in Email Studio storage.
- Templates are editable through React Email Editor.
- Required merge tags are enforced before activation and before send.
- Notification settings exist by action type.
- Staff can add a short personal note.
- Missing or invalid templates block the email, not the contribution action.
- Failed or blocked notification tasks are created and auditable.
- Donor-facing sends use Resend through existing delivery paths.
- Focused unit and app tests pass.
