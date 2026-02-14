# Working Set (AI)

Agents MUST keep this file updated during a task. Use it to build the Nia query preamble.

## Current objective
- Implement Foundation 1 schema migrations: add new queue/campaign/pledge-attempt tables, alter donor/donation/follow/tenant/pledge schema, add indexes, and provide rollback SQL.
- Align TypeScript database types with canonical schema nullability and column names (campaign fields).
- Align canonical `supabase/schema.sql` money column types with Foundation 1 migration cent-based BIGINT conversions.
- Align `campaigns.goal_amount` defaults/constraints across schema + migration to prevent fresh-DB insert failures.
- Convert existing `campaigns.goal_amount` and `campaigns.current_amount` rows from dollar NUMERIC to cent-based BIGINT in the forward migration.
- Align `DonorActivity.amount` TypeScript nullability with database constraints.
- Align `donations.currency` nullability between canonical schema, migration, and TypeScript types.
- Align `donor_pledges` money field nullability (`amount`, `total_paid`, `total_expected`) with TypeScript `MoneyCents`.

## Repo scope
- repository: Asymmetric-al/core
- in-scope paths (if known):
  - supabase/migrations/
  - supabase/schema.sql

## Stack tags (pick from docs/ai/stack-registry.md)
- PostgreSQL
- Supabase
- SQL

## Known identifiers (exact strings)
- files:
  - supabase/migrations
  - supabase/schema.sql
- symbols:
  - pledge_charge_attempts
  - campaigns
  - creator_donor_id
  - missionary_id
  - title
  - story
  - notification_queue
  - gift_date
  - donor_pledges
  - follows
  - currency
  - donor_pledges.amount
  - donor_pledges.total_paid
  - donor_pledges.total_expected
- routes:
  - N/A
- error strings:
  - N/A
- package ids:
  - N/A

## Expected behavior
- Forward migration creates new tables and required indexes, and applies all listed table alterations.
- Donation `gift_date` backfills from historical data and remains populated for existing records.
- Rollback script can safely remove added tables, indexes, and newly added columns.

## Constraints
- runtime: PostgreSQL
- tooling: SQL migrations
- env/platform notes:
  - Keep diffs minimal and schema-focused.
  - Do not introduce secrets or credentials.
  - Rules source of truth: docs/ai/rules/* (treat .cursor/rules/* as legacy).

## Verification
- git status
- apply migration on local/postgres target
- verify `gift_date` backfill with a row count check

## Nia query preamble (fill before calling Nia)
Repo: Asymmetric-al/core
Goal: Implement Foundation 1 schema migrations with rollback and backfill
Area: supabase/migrations + supabase/schema.sql
Stack: PostgreSQL, Supabase, SQL
Keywords: pledge_charge_attempts, campaigns, notification_queue, donations.gift_date, donor_pledges, donors, follows, indexes, rollback
Constraints: minimal schema diffs; no secrets; cite exact files + tables
Evidence required: file paths + table/column/index names + brief explanation
