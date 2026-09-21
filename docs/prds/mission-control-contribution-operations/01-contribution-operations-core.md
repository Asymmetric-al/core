# PRD 1: Mission Control Contribution Operations Core

**Current requirements amended 2026-09-16 (AL-1861).** These bodies use the
ratified [owner contracts](../../features/mission-control/contribution-detail/README.md).
The [original PRD](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/mission-control-contribution-operations/01-contribution-operations-core.md)
records the earlier requirements and delivery history (split PRs #386–#405). Those
original delivery claims do not establish implementation of the amended target.

## Problem statement

Mission Control needs a complete, trustworthy contribution operations
experience. Staff must be able to manage gifts from both the Contribution Hub
and the donor CRM record without creating duplicate gift truth, duplicate
schemas, or disconnected workflows.

The original May–June implementation supplied shared staff actions and read
models. Preserve compatible UI and command seams while adopting the current
Phase 13 ledger, Phase 12 permissions, Phase 16 recurring and Phase 7/17/18/19
document/communication contracts. Current source and tests establish remaining
implementation work; the original delivery record is not a new runtime audit.

## Solution

Use one shared Contribution Operations Core as the staff command/projection
boundary over the Phase 13 contribution header, designation lines, postings
and canonical effective fold. It serves two staff entry points:

- **Contribution Hub:** gift-first search and operations.
- **CRM donor record:** donor-first context and operations without leaving the
  donor record.

Both entry points call the same owner commands, enforce current Phase 12
access and return the same effective gift truth. Phase 13 money effects, Phase
16 recurring state, Phase 7/18 document truth, Phase 19 statement runs and
Phase 17/6 communication outcomes remain independently owned. The staff module
cannot create a second ledger, receipt renderer, notification store or CRM sync.

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
- Provide stable integration surfaces for the PRD 2 notifications, PRD 3
  tasks/Needs Attention, PRD 4 automations, and PRD 5 batch implementations
  delivered through the split PR sequence.

## Non-goals

- Do not move payment execution away from Stripe.
- Do not move contribution truth into Payload or restore Twenty clients, sync,
  post/repost operations or rollback routes.
- Do not move PRD 2 Email Studio templates, PRD 3 shared tasks, PRD 4
  automation builder, or PRD 5 bulk execution ownership into the core module;
  those adapters consume the shared owner contracts rather than reimplementing them.
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
  date range, payment method, payment type, safe last-four, status, receipt
  state, refund state, designation, fund, missionary, project, campaign, batch,
  and contribution fields when available.
- As a provider-authorized operator, I can search or inspect Stripe
  PaymentIntent, charge, refund, webhook, and replay identifiers only when I
  have `contributions.use_provider_actions`.
- As finance admin, I can see the full audit trail, including whether an action
  came from CRM or Contribution Hub.
- As finance admin, harmless metadata edits save directly.
- As finance admin, money, identity, designation, provider, refund, receipt,
  statement, and payment-state changes create correction records.
- As finance admin, donor relinking, amount correction, designation/fund
  correction, missionary/project allocation correction, refund correction,
  source-authorized receipt/statement follow-up, payment-state correction and
  qualified Stripe replay use their owning commands through the shared action layer.
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

The staff-facing domain boundary lives under:

`packages/api/src/admin/contribution-operations/*`

Existing module names are source-navigation evidence; adapt them to the owner
commands instead of building another financial authority:

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

The route derives tenant, actor and EffectiveAccess from authenticated context;
caller input does not supply authority. The result includes canonical detail,
source/posting revision, audit/correction-request/task references and separate
provider, document and communication outcomes. An accepted command is not proof
that those downstream effects completed.

### Canonical detail read model

The read model consumes the Phase 13 effective fold and separately authorized
owner projections. Header/line ids and legacy UUID continuity follow Phase 13
D2; original scalar donation columns are not current money truth. Include only
currently authorized fields, with source-qualified unavailable states:

- gift identity;
- donor identity and contact context;
- donor address/location and phone/mobile;
- gift date and created date;
- amount, currency, gross, net, fee, tax-deductible amount;
- payment type and payment method;
- safe last-four/brand/bank label;
- Stripe PaymentIntent, charge, refund, webhook, and replay context only for
  viewers with `contributions.use_provider_actions`; other viewers receive safe
  payment summaries and safe last-four/brand/bank labels;
- eligible giving destination, designation line, missionary/project context,
  and separate Giving Campaign attribution;
- receipt and statement state;
- refund state;
- recurring gift state;
- staged gift state;
- Phase 13 posting state and independently owned integrity/recovery facts;
- linked audit events;
- linked tasks;
- linked batch runs;
- donor-visible state summary.

### Direct edits versus corrections

Direct updates are allowed only for harmless internal metadata such as safe
internal notes or tags that do not change money, identity, designation,
official donor records, provider state, or donor-visible history.

Money corrections append Phase 13 postings through exact source commands.
Identity corrections, official documents, statements and provider recovery
retain their own admission and outcomes. Do not use a local adjustment overlay,
settled-row patch or a UI status edit to implement their effects.

### High-risk policy

Always require reason and confirmation for:

- refunds;
- donor relinking;
- designation or fund correction;
- payment state correction;
- Stripe replay.

Phase 13 declares action-specific capabilities and Phase 12 enforces current
EffectiveAccess. The broad historical `finance:manage_contributions` gate is
not the complete target. High-risk money work requires capability, reason and
active audit; second approval is optional per tenant and off by default.
Enabled separation of duties excludes the requester. A prior external effect
does not itself enable mandatory approval.

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

Follow Phase 13 D2 atomic ledger cutover and Phase 18 D17 clean document
replacement. Preserve stable gift UUIDs and authorized navigation; do not keep
a donation-table/receipt-render compatibility runtime or a retired CRM command
as a shortcut to satisfying old routes.

## Testing decisions

Tests must verify behavior and business rules, not helper structure.

Add failing tests first for:

- policy and reason/confirmation requirements;
- action-specific Phase 13 capability and current Phase 12 access enforcement;
- non-suppressible prompt behavior;
- direct metadata edit versus correction record;
- correction records and audit events for money, identity, designation,
  provider, refund, document, statement, payment state and qualified Stripe replay;
- tenant isolation for detail reads and mutations;
- canonical detail returned consistently to CRM and Contribution Hub;
- donor-visible state after correction;
- Stripe full refund, partial refund, over-refund rejection, duplicate refund,
  provider errors;
- exact artifact access/delivery audit and denial of retired CRM post/repost;
- append-only postings and the shared effective fold;
- default direct money admission, enabled second approval and requester exclusion;
- no local receipt generation or unsupported document fallback;
- query invalidation after successful mutations;
- Playwright smoke: find gift in Contribution Hub, perform low-risk action,
  see audit event, verify donor CRM record reflects the change.

## Definition of done

- Staff can work a contribution from CRM donor record or Contribution Hub.
- Both entry points use one backend action layer.
- No duplicate contribution truth exists.
- High-risk actions enforce current action capability, reason, confirmation
  and active audit; optional second approval defaults off.
- Every meaningful action writes an audit event.
- Harmless metadata follows its owner; money corrections append Phase 13
  postings. Document, provider and message outcomes remain separately truthful.
- Donor-visible corrections update from the same truth.
- Focused unit, integration, and smoke tests pass.
- Repo gates pass: format, lint, typecheck, build, unit tests, data boundary
  verification, workspace contract, shadcn diff verification, and skills
  verification.
