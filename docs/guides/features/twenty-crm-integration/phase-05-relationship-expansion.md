# Phase 05 - Relationship Expansion

## Trigger

Use this phase after the first CRM domain is stable in Mission Control and rollback has been rehearsed.

## Goal

Expand the CRM model to the deeper relationship graph: churches, organizations, households, pledges, relationship activity, and fundraiser-friendly reporting.

## Scope

- Churches and organizations.
- Households.
- Relationship activity.
- Pledges as CRM relationship records.
- Recent donor CRM projections.
- CRM search across people, churches, organizations, and households.
- Mission Control reports that depend on CRM relationship context.

## Not In Scope

- Stripe payment state.
- Contribution ledger.
- Recurring gift payment lifecycle.
- Receipt state.
- Annual statement state.
- Refund and reconciliation authority.
- Care plans or private care notes.
- CMS publish state.

## Pledge Guardrail

Pledges may be represented in Twenty as CRM relationship commitments, but Asym must remain authoritative for payment execution, recurring gift state, donation ledger, receipts, refunds, statements, and reconciliation.

If a pledge can trigger money movement or donor-visible financial state, treat that portion as Asym-owned.

## Workflow

1. Extend the ownership matrix before each new domain.
2. Add or update Twenty object schema for the domain.
3. Add mapping and duplicate rules.
4. Add read models through `packages/api`.
5. Add native Mission Control UI.
6. Enable writes only after read parity and rollback are proven.
7. Add reconciliation rules specific to each domain.
8. Validate donor and missionary surfaces remain role-scoped.

## Checklist

- [ ] Each domain has an ownership matrix row.
- [ ] Each domain has rollback instructions.
- [ ] Churches and organizations do not create duplicate company records.
- [ ] Households have deterministic membership rules.
- [ ] Relationship activity does not duplicate care truth.
- [ ] Pledges do not become payment truth.
- [ ] CRM search respects tenant scope.
- [ ] Reports cite source systems clearly.
- [ ] Recent donor views combine CRM and finance data without moving finance truth.
- [ ] Tests cover mapping, permissions, and rollback for each new domain.

## Exit Gate

Do not proceed until relationship domains are stable, searchable, tenant-safe, and clearly separated from finance and care authority.
