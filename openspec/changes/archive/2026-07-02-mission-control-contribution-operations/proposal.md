# Proposal: Mission Control Contribution Operations Core

## Why

Mission Control needs a complete contribution operations foundation. Staff
must be able to manage gifts from the Contribution Hub and from a donor CRM
record without duplicate gift truth, duplicate schemas, or disconnected
workflows.

The current repo has useful pieces: contribution lists, contribution detail
sheet, CRM donor gift history, staged gift actions, receipt resend, CRM post
retry, Stripe webhook/replay plumbing, and staged gift audit events. Those
pieces need one durable contribution operations contract so money, identity,
designation, provider, official-document, and donor-visible changes stay
traceable and trustworthy.

## What Changes

- Define Contribution Operations Core as the canonical Mission Control
  backend for staff contribution actions.
- Define the Contribution Hub and donor CRM record as two entry points into the
  same backend action layer.
- Add durable requirements for canonical contribution detail, correction
  records, audit events, high-risk permission checks, reason/confirmation
  policy, refund/provider outcome handling, donor-visible state updates, and
  extension hooks for notifications/tasks/automation/batches.
- Keep Stripe as the payment execution and payment-method authority.
- Keep CRM/Twenty, Payload, donor portal, and UI surfaces from becoming
  competing gift truth.

## What Does Not Change

- Contribution truth does not move to Twenty, Payload, or a public/donor
  surface.
- Stripe remains payment execution authority.
- Email template implementation, shared Mission Control tasks, automation
  builder, and bulk batch engine are owned by PRDs 2-5 and were delivered
  through split PRs #394-#405 after the core contract landed.
- App route handlers remain thin; business logic remains in `packages/api`.

## Expected Outcome

After this change is implemented:

- Staff can work the same contribution from the Contribution Hub or donor CRM
  record.
- High-risk actions require `finance:manage_contributions`, reason, and
  confirmation.
- Corrections and audit events explain money, identity, designation, provider,
  official document, and donor-visible changes.
- Donor-visible state updates from the same operational truth.
- Tests prove policy, permission, audit/correction, read model, refund, and
  shared action-contract behavior.
