# Twenty CRM Integration Phase Pack

> **Status (2026-07-06): Superseded — Twenty CRM retired** by
> [ADR-0001](../../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md).
> Asym Postgres is the system of record for all CRM truth (people,
> relationships, notes, tasks, activity); see the
> [Phase 1 ownership matrix](../../../prds/sitestacker-parity/phase-01-source-of-truth-ownership-matrix.md).
> No product surface reads from or depends on Twenty; the one-way mirror never
> turns on; sync code is dormant pending a scheduled cleanup ticket. This
> document is preserved for historical reference — do not execute its phases
> or runbooks.

## Purpose

Break the attached Deep Twenty CRM Integration Plan into implementation phases that can be executed, reviewed, and stopped independently.

This folder intentionally separates two concerns:

- The phase files define the recommended rollout sequence.
- `implementation-inventory.md` reports what the current repo already has and does not have.

Do not reorder or weaken the phase sequence just because some implementation pieces already exist. Existing code can reduce effort inside a phase, but it should not skip the phase gate.

## Source Inputs

- `twenty_crm_deep_integration_plan.pdf`
- `openspec/project.md`
- `openspec/specs/platform-product-intent/spec.md`
- `openspec/specs/platform-surfaces/spec.md`
- `openspec/specs/platform-principles/spec.md`
- `openspec/specs/platform-boundaries/spec.md`
- `docs/guides/architecture/data-access-boundary.md`
- `docs/guides/operations/twenty-crm-cutover.md`
- `docs/guides/development/tanstack-integration.md`
- `docs/ai/rules/backend.md`
- Official Twenty docs checked during planning:
  - https://docs.twenty.com/developers/extend/api
  - https://docs.twenty.com/developers/extend/webhooks
  - https://docs.twenty.com/developers/self-host/capabilities/docker-compose
  - https://docs.twenty.com/developers/extend/apps/getting-started

## Phase Order

| Phase | File                                                    | Outcome                                                                              |
| ----- | ------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 00    | `phase-00-strategy-and-proof.md`                        | Decide the durable platform contract and prove Twenty can run safely beside Asym.    |
| 01    | `phase-01-core-seam-and-authorization.md`               | Build the server-side CRM gateway, auth bridge, env contract, and audit command log. |
| 02    | `phase-02-identity-schema-and-mapping.md`               | Establish identity concepts, link tables, duplicate rules, and Twenty schema setup.  |
| 03    | `phase-03-sync-eventing-and-replay.md`                  | Add webhook ingestion, outbound jobs, idempotency, replay, and reconciliation.       |
| 04    | `phase-04-first-domain-mission-control.md`              | Cut one safe CRM domain into native Mission Control screens.                         |
| 05    | `phase-05-relationship-expansion.md`                    | Expand to churches, organizations, households, pledges, and relationship reporting.  |
| 06    | `phase-06-cross-surface-projections-and-shadow-mode.md` | Add donor, missionary, CMS, and event projections in shadow mode.                    |
| 07    | `phase-07-production-cutover-and-operations.md`         | Rehearse rollout, monitoring, rollback, and production cutover domain by domain.     |

## Rollout Principles

- Twenty is a CRM subsystem behind Asym, not the platform shell.
- Supabase Auth remains the platform auth authority.
- Mission Control remains the staff operations home.
- Finance, Stripe state, receipts, statements, care truth, CMS publish state, and automation truth stay Asym-owned unless a later OpenSpec change says otherwise.
- All Asym-to-Twenty access goes through `packages/api`.
- No browser code receives Twenty credentials.
- No production cutover happens before shadow-mode parity, runbooks, rollback, and monitoring exist.

## How To Use These Files

1. Start with `phase-00-strategy-and-proof.md`.
2. Do not enter the next phase until the current phase exit gate is satisfied.
3. Use `implementation-inventory.md` only for sizing and task discovery.
4. Keep active implementation issues small enough to complete within one phase.
5. Update OpenSpec and architecture docs before behavior becomes durable.
6. Use `docs/guides/operations/twenty-crm-cutover.md` for Phase 07 cutover,
   rollback, restore, and secret-rotation execution.
