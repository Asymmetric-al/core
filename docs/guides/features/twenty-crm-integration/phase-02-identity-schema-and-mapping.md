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

- [ ] Supabase auth user is not treated as the same thing as CRM person.
- [ ] Donor profile is not treated as the same thing as CRM person.
- [ ] Missionary profile is not treated as the same thing as CRM person.
- [ ] Stripe customer is not treated as the same thing as donor profile.
- [ ] Link tables include tenant scope.
- [ ] Link tables support repair and replay.
- [ ] Low-confidence matches become merge candidates, not automatic merges.
- [ ] Twenty schema does not mirror the entire Asym database.
- [ ] Pledge modeling distinguishes relationship intent from payment truth.
- [ ] Mapping logic is covered by unit tests.

## Exit Gate

Do not proceed until identity concepts, link tables, duplicate rules, and Twenty schema setup are documented and testable. No bulk import should run before this phase passes.
