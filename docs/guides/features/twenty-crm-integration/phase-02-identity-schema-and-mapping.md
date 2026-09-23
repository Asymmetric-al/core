# Retired Twenty CRM plan: Phase 02 - Identity, Schema, And Mapping

Twenty CRM is retired. Asym Postgres owns CRM records, including native notes
and relationships; Mission Control reads and writes through the existing
`packages/api` domain services. The native replacement and removal of Twenty
clients, routes, webhooks, synchronization and environment-schema fields merged
into `develop` through [PR #1325](https://github.com/Asymmetric-al/core/pull/1325)
on 2026-08-19.

The old integration sequence is withdrawn. There is no Twenty production
cutover, mirror activation, replay, rollback-to-Twenty or new-domain rollout
to execute. Repository removal is complete; only the independently recorded
external cleanup proof remains outstanding.

## Current ownership and remaining work

- [ADR-0001](../../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md)
  fixes native CRM ownership and prohibits reintroducing Twenty.
- The [Phase 1 ownership matrix](../../../prds/sitestacker-parity/phase-01-source-of-truth-ownership-matrix.md)
  identifies the record owners; new CRM work follows those existing boundaries.
- The [data-access boundary](../../architecture/data-access-boundary.md)
  governs API services, authorized projections and browser access.
- [Complete Twenty CRM retirement](../../../../openspec/changes/complete-twenty-crm-retirement/tasks.md)
  records the merged implementation separately from the still-unverified
  external Vercel/Twenty Cloud cleanup. Its remaining external proof does not
  mean the repository integration is still present or that credentials were
  removed from every provider.
- Existing compatibility records and retained business/audit facts keep their
  owning-domain retention rules. Retiring the vendor is not permission to
  delete those records or edit old migrations.

## Historical record

The [exact former document at `7abd2c11`](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/guides/features/twenty-crm-integration/phase-02-identity-schema-and-mapping.md)
preserves the withdrawn plan, original claims, commands and evidence in Git.
It is an immutable historical source, not an operational runbook. This stable
document path remains as the current retirement entry so existing links do not
route an implementer into obsolete setup instructions.
