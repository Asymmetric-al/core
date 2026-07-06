# Proposal: Integrate Twenty CRM as the backing CRM subsystem

> **RETIRED (2026-07-06) — do not merge, do not build from this change.**
> Withdrawn by founder ruling
> [ADR-0001](../../../docs/adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md)
> (see also the
> [Phase 1 Source-of-Truth Ownership Matrix](../../../docs/prds/sitestacker-parity/phase-01-source-of-truth-ownership-matrix.md)):
> Asym Postgres is the system of record for all CRM truth and Twenty CRM is
> retired as a product dependency. Production never held Twenty data. The spec
> deltas under `specs/` are withdrawn and must never be merged into
> `openspec/specs/`. The Twenty-specific code is dormant pending a scheduled
> cleanup ticket, which will also archive this package. The document below is
> preserved unedited as the historical record of what was proposed and
> partially implemented.

## Why

Asymmetric.al needs a durable CRM foundation for operational identity,
relationships, notes, tasks, activity, and ministry relationship workflows
without weakening the existing platform boundaries around auth, finance, CMS,
care, public surfaces, donor trust, and tenant safety.

The current repo already has Mission Control, a Supabase-backed admin CRM page,
strong data-access boundaries, and OpenSpec truth around CRM as operational
truth. What is missing is the explicit contract for using Twenty as the backing
CRM subsystem and the proof that Twenty can run beside Asym safely before any
production code depends on it.

## What Changes

- Define Twenty as an internal CRM subsystem behind Asym-owned server
  boundaries.
- Preserve Supabase Auth as the platform auth authority.
- Preserve Mission Control as the staff operations shell and primary CRM
  experience.
- Preserve Asym-owned finance, care, CMS, public website, donor portal, and
  missionary workspace authority.
- Add a proposed OpenSpec delta for the Twenty-backed CRM boundary.
- Add a proposed OpenSpec delta for Mission Control surface behavior when CRM
  data is backed by Twenty.
- Document an ownership matrix for the domains affected by the integration.
- Document the non-production Twenty infrastructure proof plan.
- Record the Phase 00 database decision path: dedicated Twenty Postgres by
  default, not the existing Supabase platform Postgres.
- Define the Phase 07 production cutover and operations contract for the
  approved CRM domains, including monitoring, runbooks, rollback rehearsal,
  backup/restore proof, secret rotation, support ownership, and release gates.

## What Does Not Change

- No new CRM domains are added during Phase 07.
- No donor, missionary, public website, payment, receipt, statement,
  reconciliation, CMS publishing, automation, auth, or care authority moves to
  Twenty.
- Raw Twenty UI does not become the normal Mission Control CRM experience.
- Existing phase order is not changed based on current implementation status.

## Expected Outcome

The completed integration package should leave the project with a reviewable
product, architecture, and operations contract:

- OpenSpec package exists and validates.
- Ownership boundaries are explicit enough to prevent accidental authority
  drift.
- The Twenty proof plan names topology, smoke tests, evidence, and stop
  criteria.
- The Postgres decision path is documented before any Twenty runtime or schema
  work begins.
- Production cutover is domain-gated, monitored, rollback-ready, and tied to a
  concrete evidence note before any approved domain stays live.
