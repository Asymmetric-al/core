# PRD 1: Mission Control Contribution Operations Core

## Suggested issue

- Title: Build Mission Control Contribution Operations Core
- Labels: `type:feature`, `status:ready`, `complexity:hard`,
  `ready-for-agent`

## Problem statement

Mission Control needs a complete, trustworthy contribution operations
experience. Staff must be able to manage gifts from both the Contribution Hub
and the donor CRM record without creating duplicate gift truth, duplicate
schemas, or disconnected workflows.

The repo already has a contribution list, contribution detail sheet, CRM donor
gift history, staged gift actions, receipt resend, CRM post retry, Stripe raw
event replay helpers, refund webhook handling, and staged gift audit events.
Those are foundations, but they do not yet form one complete contribution
operations hub with canonical detail, correction framework, refund action
handling, official document operations, recurring-gift context, reason prompts,
permission checks, shared audit, and extension hooks for notifications, tasks,
Needs Attention, automation, and batches.

## Solution

Build a shared Contribution Operations Core for Mission Control. The core
provides one backend contribution truth and two staff entry points:

- **Contribution Hub:** gift-first search and operations.
- **CRM donor record:** donor-first context and operations without leaving the
  donor record.

Both entry points may present different layouts, but they must call the same
backend operations, use the same schema, enforce the same permissions, write
the same audit events, and return the same canonical gift truth after each
action.

## Goals

- Create a deep contribution operations module with a stable action interface.
- Build a canonical contribution detail read model.
- Expand contribution search/filter inputs for gift-first staff work.
- Add a correction framework for money, identity, designation, provider,
  refund, official-document, and donor-visible changes.
- Enforce high-risk contribution permission, reason, and confirmation.
- Write an audit event for every meaningful contribution action.
- Support full and partial refund requests through Stripe while recording
  provider outcome honestly.
- Update donor-visible state from the same persisted truth.
- Provide hook points for PRD 2 notifications, PRD 3 tasks/Needs Attention,
  PRD 4 automations, and PRD 5 batches without implementing those full systems.

## Non-goals

- Do not move payment execution away from Stripe.
- Do not move contribution truth into Payload or Twenty.
- Do not build Email Studio templates; PRD 2 owns that.
- Do not build the full shared task system; PRD 3 owns that.
- Do not build automation builder; PRD 4 owns that.
- Do not build bulk action execution; PRD 5 owns that.
- Do not replace the donor portal.

## User stories

- As a finance admin, I can open a contribution from the Contribution Hub and
  work gift-first.
- As a finance admin, I can open a contribution from a donor CRM record and
  work donor-first without losing context.
- As staff, I see the same gift truth in CRM and Contribution Hub.
- As finance admin, I see donor, gift, designation, payment, receipt, refund,
  recurring, CRM, and audit context in one contribution detail.
- As finance admin, I can search by donor name, donor address/location, phone,
  date range, Stripe identifiers, payment method, payment type, safe last-four,
  status, receipt state, refund state, designation, fund, missionary, project,
  campaign, batch, and contribution fields when available.
- As finance admin, I can see the full audit trail, including whether an action
  came from CRM or Contribution Hub.
- As finance admin, harmless metadata edits save directly.
- As finance admin, money, identity, designation, provider, refund, receipt,
  statement, and payment-state changes create correction records.
- As finance admin, donor relinking, amount correction, designation/fund
  correction, missionary/project allocation correction, refund correction,
  receipt/statement correction, payment-state correction, Stripe replay, and
  CRM repost are supported by the shared action layer.
- As finance admin, I can issue full or partial refunds and see Stripe provider
  outcomes without the platform overstating finality.
- As finance admin, Stripe errors include clear next steps.
- As finance admin, I can resend receipts from either CRM or Contribution Hub.
- As finance admin, I can see the donor-visible outcome before confirming a
  correction.
- As donor, my giving history reflects corrected truth quickly and honestly.
- As admin, staff without finance permission are blocked from high-risk money
  actions server-side.
- As developer, contribution operations rules live inside deep, testable
  modules shared by CRM and Contribution Hub.

## Implementation decisions

### Module

Create a shared domain module, preferred path:

`packages/api/src/admin/contribution-operations/*`

Suggested files:

- `types.ts`
- `schemas.ts`
- `policy.ts`
- `permissions.ts`
- `detail-read-model.ts`
- `corrections.ts`
- `audit.ts`
- `actions.ts`
- `refunds.ts`
- `notifications-hook.ts`
- `tasks-hook.ts`

Suggested action interface:

```ts
executeContributionAction({
  tenantId,
  actorProfileId,
  actorPermissions,
  sourceSurface,
  contributionId,
  actionType,
  reason,
  confirmationToken,
  payload,
}) -> ContributionActionResult
```

The result includes canonical contribution detail, audit event id, correction
id where created, notification decision if relevant, task ids if relevant, and
provider outcome if relevant.

### Canonical detail read model

The contribution detail read model includes, when available:

- gift identity;
- donor identity and contact context;
- donor address/location and phone/mobile;
- gift date and created date;
- amount, currency, gross, net, fee, tax-deductible amount;
- payment type and payment method;
- safe last-four/brand/bank label;
- Stripe PaymentIntent, charge, refund, webhook, and replay context;
- fund, designation, missionary, project, campaign, and allocation context;
- receipt and statement state;
- refund state;
- recurring gift state;
- staged gift state;
- CRM post state;
- linked audit events;
- linked tasks;
- linked batch runs;
- donor-visible state summary.

### Direct edits versus corrections

Direct updates are allowed only for harmless internal metadata such as safe
internal notes or tags that do not change money, identity, designation,
official donor records, provider state, or donor-visible history.

Use correction records for any change touching money, donor identity,
designation, fund, missionary/project allocation, refund, payment state,
provider state, official receipts, official statements, or donor-visible
contribution history.

### High-risk policy

Always require reason and confirmation for:

- refunds;
- donor relinking;
- designation or fund correction;
- payment state correction;
- Stripe replay.

The high-risk permission is `finance:manage_contributions`. The backend must
enforce it for any action that changes money truth.

### Audit

Every meaningful contribution action writes an audit event with:

- actor;
- tenant;
- contribution and staged gift;
- source entry point;
- action type;
- timestamp and correlation id;
- reason and confirmation snapshot when required;
- before/after summary where safe;
- related provider ids;
- related tasks;
- related batches;
- downstream effects.

### Stripe

Stripe remains payment execution and payment-method authority. Refund actions
record Stripe API outcomes and wait for webhook-confirmed finality where
needed. The platform must not imply a refund is final before Stripe confirms
the state.

### Routes

Keep app routes thin. Add package-backed routes for:

- canonical contribution detail;
- contribution action execution.

Existing staged gift routes may remain as compatibility delegates while UI
migrates to the shared action contract.

## Testing decisions

Tests must verify behavior and business rules, not helper structure.

Add failing tests first for:

- policy and reason/confirmation requirements;
- `finance:manage_contributions` permission enforcement;
- non-suppressible prompt behavior;
- direct metadata edit versus correction record;
- correction records and audit events for money, identity, designation,
  provider, refund, receipt, statement, payment state, Stripe replay, CRM
  repost;
- tenant isolation for detail reads and mutations;
- canonical detail returned consistently to CRM and Contribution Hub;
- donor-visible state after correction;
- Stripe full refund, partial refund, over-refund rejection, duplicate refund,
  provider errors;
- receipt resend and CRM repost audit behavior;
- query invalidation after successful mutations;
- Playwright smoke: find gift in Contribution Hub, perform low-risk action,
  see audit event, verify donor CRM record reflects the change.

## Definition of done

- Staff can work a contribution from CRM donor record or Contribution Hub.
- Both entry points use one backend action layer.
- No duplicate contribution truth exists.
- High-risk actions require `finance:manage_contributions`, reason, and
  confirmation.
- Every meaningful action writes an audit event.
- Corrections use the direct edit versus correction record split.
- Donor-visible corrections update from the same truth.
- Focused unit, integration, and smoke tests pass.
- Repo gates pass: format, lint, typecheck, build, unit tests, data boundary
  verification, workspace contract, shadcn diff verification, and skills
  verification.
