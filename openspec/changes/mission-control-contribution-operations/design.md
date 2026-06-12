# Design: Mission Control Contribution Operations Core

## Source Inputs

- User-provided PRD 1: Mission Control Contribution Operations Core
- `openspec/project.md`
- `openspec/specs/platform-product-intent/spec.md`
- `openspec/specs/platform-surfaces/spec.md`
- `openspec/specs/platform-boundaries/spec.md`
- `openspec/specs/platform-principles/spec.md`
- `openspec/changes/integrate-twenty-crm-core/*`
- `docs/guides/architecture/data-access-boundary.md`
- Current contribution code under:
  - `apps/admin/app/contributions/*`
  - `packages/api/src/admin/contributions/*`
  - `packages/api/src/giving/*`
  - `packages/api/src/admin/crm/detail/*`
  - `packages/api/src/stripe/*`
  - `packages/api/src/donor-portal/*`

## Architecture Direction

Build a deep `Contribution Operations Core` module behind a narrow action and
read-model interface. The module should concentrate rules that would otherwise
spread across Contribution Hub, donor CRM, staged gift routes, donor portal,
Stripe replay/refund code, and future batch/automation features.

The preferred package path is:

`packages/api/src/admin/contribution-operations/*`

The app-level routes remain thin re-exports or thin delegates from `@asym/api`.

## Core Interfaces

### Contribution detail

The detail read model is the canonical staff-facing view for a contribution.
It gathers donation, staged gift, donor, designation, payment, provider,
refund, recurring, receipt, statement, CRM, audit, task, batch, and
donor-visible state into one response.

### Contribution action

The action interface receives tenant, actor, source surface, target
contribution, action type, reason, confirmation, and payload. It enforces
permission and policy, executes or queues the domain action, records audit and
correction state, and returns canonical contribution detail.

### Correction records

Correction records explain changes to money, donor identity, designation,
fund, missionary/project allocation, refund, payment state, provider state,
official receipts, official statements, and donor-visible history. Harmless
internal metadata can update directly.

### Audit

Audit is append-only and records actor, tenant, contribution, staged gift,
source surface, action type, reason, confirmation snapshot, safe before/after
summary, provider ids, downstream effects, task ids, batch ids, and timestamp.

## Permission Policy

High-risk actions require `finance:manage_contributions`:

- refunds;
- donor relinking;
- designation/fund correction;
- payment state correction;
- Stripe replay.

If the current auth model lacks fine-grained permissions, implementation may
begin with a compatibility adapter, but the public module interface must use
the permission name so a real permission adapter can replace it later.

## Stripe Policy

Stripe remains the payment execution and payment-method authority. Staff
refund requests may call Stripe server-side, but the platform records provider
outcomes honestly and must not present finality before the Stripe result or
webhook-confirmed operational truth supports it.

## Donor-Visible State

The donor portal and donor history must read corrected contribution state from
the same persisted truth used by staff. Do not introduce hidden internal
corrections that require later manual sync to donor-facing records.

## Phase Boundaries

The initial Contribution Operations Core phase shipped hook contracts only for
notifications, tasks, automations, and batches. Scope was then expanded inside
this change, and the later phases are implemented here (see `tasks.md`
sections 7-10 for the delivered breakdown):

- Email Studio correction notification templates and send path (PRD 2);
- shared Mission Control tasks and Needs Attention (PRD 3);
- the automation rules read model with fail-closed activation gates (PRD 4);
- bulk batch execution with persisted batches and background processing
  (PRD 5).

Remaining gaps stay explicit rather than implied: automation activation fails
closed until server-side readiness checks exist, and integration telemetry
reports "not wired yet" until a persisted source is connected.

## Testing Direction

Use TDD for behavior changes. The interface-level tests should cover policy,
permission, detail read model, correction records, audit events, Stripe refund
adapter behavior, donor-visible state, and shared invocation from Contribution
Hub/CRM.
