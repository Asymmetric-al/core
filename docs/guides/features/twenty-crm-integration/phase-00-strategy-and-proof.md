# Phase 00 - Strategy And Proof

> **Status (2026-07-06): Superseded — Twenty CRM retired** by
> [ADR-0001](../../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md).
> Asym Postgres is the system of record for all CRM truth (people,
> relationships, notes, tasks, activity); see the
> [Phase 1 ownership matrix](../../../prds/sitestacker-parity/phase-01-source-of-truth-ownership-matrix.md).
> No product surface reads from or depends on Twenty; the one-way mirror never
> turns on; sync code is dormant pending a scheduled cleanup ticket. This
> document is preserved for historical reference — do not execute its phases
> or runbooks. The exit-gate alternative below — keep the existing Asym CRM
> implementation — is the path the founder chose.

## Trigger

Use this phase when leadership is considering Twenty CRM as the operational CRM engine for Asym, but before any production code depends on Twenty.

## Goal

Make the integration decision explicit, document ownership, and prove Twenty can run beside Asym without compromising auth, tenant safety, money integrity, or platform coherence.

## Scope

- OpenSpec change package for the proposed integration.
- Ownership matrix for CRM, CMS, finance, care, auth, and public surfaces.
- Deep integration definition.
- Twenty source review and official-doc review.
- Twenty deployment proof in local or development infrastructure.
- API and webhook smoke tests against a non-production Twenty instance.
- Supabase Postgres versus dedicated Postgres decision for Twenty.

## Not In Scope

- Production data migration.
- Donor or missionary surface changes.
- Payment, receipt, recurring gift, statement, or reconciliation behavior changes.
- Raw Twenty UI as the normal Mission Control experience.
- Twenty app manifests, front components, or AI agents as a required dependency.

## Deliverables

- `openspec/changes/integrate-twenty-crm-core/proposal.md`
- `openspec/changes/integrate-twenty-crm-core/design.md`
- `openspec/changes/integrate-twenty-crm-core/tasks.md`
- Proposed spec deltas under
  `openspec/changes/integrate-twenty-crm-core/specs/`
- Ownership matrix inside the design doc.
- Written Twenty infrastructure proof plan.
- Written yes/no decision for using Supabase Postgres as Twenty's backing Postgres.
- First-domain recommendation for Phase 04.

## Phase 00 Artifact Status

The Phase 00 documentation gate is in place in
`openspec/changes/integrate-twenty-crm-core/`.

- Integration strategy: `proposal.md` and `design.md`
- Ownership matrix: `design.md`
- Non-production Twenty proof plan: `design.md`
- Supabase Postgres versus dedicated Postgres decision: `design.md`
- Proposed OpenSpec deltas: `specs/platform-boundaries/spec.md` and
  `specs/platform-surfaces/spec.md`
- Phase 01 status: not started by this package

## Workflow

1. Read the current OpenSpec specs and architecture docs.
2. Write the integration proposal as a product and architecture contract, not just a vendor choice.
3. Complete the ownership matrix before any domain is moved.
4. Run Twenty as a separate service with server, worker, Redis, storage config, and Postgres.
5. Smoke test Twenty Core API, Metadata API or schema setup path, webhooks, worker restart, and backup/restore.
6. Decide whether Twenty uses Supabase Postgres or its own managed Postgres.
7. Pick the first safe cutover domain, preferring notes/tasks/people over money-adjacent domains.

## Checklist

- [ ] Supabase Auth remains the Asym auth authority.
- [ ] Mission Control remains the staff operations shell.
- [ ] Twenty is explicitly a CRM subsystem, not the public shell, donor shell, missionary shell, CMS, or finance system.
- [ ] CRM operational truth and CMS public truth are distinct and linked.
- [ ] Finance truth stays in Asym.
- [ ] Care truth stays in Asym.
- [ ] Every ownership matrix row has system of record, write authority, conflict winner, sync direction, and rollback owner.
- [ ] Twenty can run with server, worker, Redis, storage, and Postgres.
- [ ] Webhook signature verification requirements are known.
- [ ] API limits and batch behavior are known.
- [ ] Toolchain isolation plan exists for any Twenty app tooling.

## Exit Gate

Do not proceed until the project has a written OpenSpec change, an ownership matrix, and a successful non-production Twenty proof. If the Twenty infrastructure proof fails, stop here and either choose a different CRM backing strategy or keep the existing Asym CRM implementation.
