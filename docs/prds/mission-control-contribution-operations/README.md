# Mission Control Contribution Operations PRD Set

This folder preserves the delivered Mission Control Contribution Operations
PRDs. For new work, read the [current owner map](../../features/mission-control/contribution-detail/README.md)
and [document authority guide](../../ai/document-authority.md). Phase 13/12
supersedes the earlier ledger, Campaign-as-Fund and default-approval models;
Phase 16 owns recurring behavior; Phase 7/17/18/19 owns the corresponding
receipt, message, document and statement contracts. Valid shared staff UI and
action boundaries remain reusable. The historical implementation order was:

1. Contribution Operations Core
2. Email Studio Donor Correction Notifications
3. Shared Mission Control Tasks and Needs Attention
4. Mission Control Automation Builder
5. Bulk Contribution Actions and Batch Results

The first phase creates the shared contribution truth and action interface. The
later phases must build on that interface rather than creating feature-local
gift, task, notification, automation, or batch truth.

## Repo grounding

Shipped contribution-operations implementation areas:

- `apps/admin/app/(app)/contributions/*`
- `packages/api/src/admin/contributions/*`
- `packages/api/src/admin/contribution-operations/*`
- `packages/api/src/admin/contribution-batches/*`
- `packages/api/src/admin/mission-control-tasks/*`
- `packages/api/src/admin/mission-control-automations/*`
- `packages/api/src/admin/crm/table-preferences/*`
- `packages/api/src/giving/staged-gifts.ts`
- `packages/api/src/giving/receipts.ts`
- `packages/api/src/admin/crm/detail/service.ts`
- `packages/api/src/admin/crm/detail/gift-history.ts`
- `packages/api/src/stripe/*`
- `packages/api/src/donor-portal/*`
- `packages/email/*`
- `packages/api/src/email/*`

Prior art only, not the shared contribution task boundary:

- `apps/admin/app/(app)/tasks/*`
- `packages/api/src/missionary-portal/tasks.ts`

## Cross-cutting rules

- Mission Control is the staff operations home for contribution operations.
- Stripe remains payment execution and payment-method authority.
- Contribution Hub and donor CRM may have different layouts, but must share one
  backend contribution action layer.
- Donor-visible correction state must update from the same persisted truth; no
  delayed side-sync model.
- High-risk contribution actions require server-side permission, reason, and
  confirmation.
- Route handlers in `apps/*/app/api/**` stay thin and delegate to `@asym/api`.
- Follow TDD for behavior changes.
