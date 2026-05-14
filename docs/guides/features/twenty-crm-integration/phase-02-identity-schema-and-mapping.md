# Phase 02 - Identity, Schema, And Mapping

## Trigger

Use this phase after the CRM gateway and authorization bridge exist, but before importing or cutting over production data.

## Goal

Create a durable identity and mapping model so Supabase, Stripe, Payload/CMS, Twenty, and Asym surfaces can refer to the same ministry reality without collapsing distinct concepts or creating duplicate records.

## Scope

- Identity concept definitions.
- Supabase CRM anchor tables.
- Twenty object model design.
- Schema management strategy.
- Duplicate detection and merge candidate rules.
- Pure import transform functions.
- Unit tests for mapping and duplicate logic.

## Not In Scope

- Bulk import execution.
- Production write cutover.
- Cross-surface projections.
- Automatic low-confidence merges.

## Required Identity Distinctions

Keep these concepts separate:

- Supabase auth user
- Asym profile
- Tenant membership and role
- CRM person
- Donor profile
- Missionary profile
- CMS public entity
- Stripe customer
- Fund or project
- Pledge or relationship commitment
- Payment, receipt, refund, statement, and reconciliation records

## Recommended Supabase Tables

- `crm_record_links`
- `crm_merge_candidates`
- `crm_projection_state`
- CRM command and sync logs from Phase 01 and Phase 03

Exact SQL belongs in migrations created during implementation, not in this phase file.

## Workflow

1. Define identity concepts in the OpenSpec change design.
2. Design link tables with tenant IDs, Asym entity references, Twenty object names, Twenty record IDs, confidence, status, and verification timestamps.
3. Design the Twenty object model for people, companies/organizations, churches, households, tasks, notes, activity, and pledges.
4. Choose one schema management path for production: Metadata API or a clearly isolated Twenty app manifest.
5. Write deterministic matching rules by confidence level.
6. Unit test transforms and duplicate scoring before any import job runs.

## Checklist

- [x] Supabase auth user is not treated as the same thing as CRM person.
- [x] Donor profile is not treated as the same thing as CRM person.
- [x] Missionary profile is not treated as the same thing as CRM person.
- [x] Stripe customer is not treated as the same thing as donor profile.
- [x] Link tables include tenant scope.
- [x] Link tables support repair and replay.
- [x] Low-confidence matches become merge candidates, not automatic merges.
- [x] Twenty schema does not mirror the entire Asym database.
- [x] Pledge modeling distinguishes relationship intent from payment truth.
- [x] Mapping logic is covered by unit tests.

## Phase 02 Artifact Status

Phase 02 is complete as a schema and pure-logic phase:

- Identity concepts live in `packages/api/src/crm/identity/concepts.ts`.
- The Twenty object model and schema management decision live in
  `packages/api/src/crm/schema/twenty-object-model.ts`.
- Link, merge-candidate, and projection tables are created by
  `supabase/migrations/20260508000413_crm_identity_mapping.sql`.
- Pure donor and pledge transforms live in
  `packages/api/src/crm/mapping/transforms.ts`.
- Duplicate scoring and fingerprint normalization live in
  `packages/api/src/crm/mapping/duplicates.ts`.
- Unit coverage lives in `tests/unit/packages/api/crm-{identity-concepts,schema-model,mapping,duplicates}.test.ts`.

This phase does not run production imports, add webhooks, start sync/replay,
or proceed to Phase 03.

## Exit Gate

Do not proceed until identity concepts, link tables, duplicate rules, and Twenty schema setup are documented and testable. No bulk import should run before this phase passes.
