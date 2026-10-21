# Proposal: Canonical Supabase TanStack DB Data Layer

## Why

Browser-visible Supabase data is currently split across manual
`queryCollectionOptions`, route-backed read models, direct browser Supabase
calls, TanStack Query hooks, and local/demo collections. This makes new browser
data work inconsistent and makes it too easy to bypass shared hooks, RLS review,
realtime policy, and server-command boundaries.

The platform needs one durable standard: Supabase Postgres remains the source
of truth, Supabase Auth and RLS remain the browser security boundary, and
TanStack DB Supabase collections become the canonical browser data layer for
RLS-safe, browser-visible table data.

## What Changes

- Make `@supabase-labs/tanstack-db` the canonical Supabase-backed TanStack DB
  adapter for browser-visible Supabase table collections.
- Move real table collection definitions into a maintainable registry under
  `packages/database/collections`.
- Prefer `@asym/database/hooks` and collection-backed live queries for browser
  joins, filters, lists, feeds, tables, dashboards, and optimistic UI.
- Add a documented policy for when collection mutations are allowed and when
  server commands remain required.
- Allow server-side TanStack DB `queryOnce` only for clear read-shaping or query
  sharing benefits that do not weaken security, performance, or architecture.
- Update RLS, Realtime, docs, and verification guardrails to match the new data
  layer standard.

## What Does Not Change

- Supabase Postgres remains the source of truth.
- Supabase Auth and RLS remain the security boundary for browser-reachable data.
- `packages/api` remains the server-side business and privileged command
  boundary.
- Stripe, donation creation/confirmation, refunds, receipts, tax documents,
  webhooks, audit logs, role/permission changes, external sync, service-role
  operations, and multi-table workflows do not move into browser collection
  mutations.
- Reporting, analytics, finance summaries, and aggregate-heavy workflows remain
  server-side unless TanStack DB clearly improves a bounded read model.

## Expected Outcome

After this change is implemented:

- New browser data work starts in `packages/database/collections` and
  `packages/database/hooks`.
- App code uses `@asym/database/hooks` or approved collection exports instead of
  direct Supabase table reads, ad hoc fetch reads, or app-local mock arrays.
- Browser collections clearly document table, schema, keys, RLS posture,
  Realtime posture, mutation policy, and intentional exclusions.
- Server commands continue to own sensitive operations while Realtime or
  explicit invalidation refreshes browser-visible collection state.
- Tests and verification scripts prevent direct app Supabase table reads where a
  collection exists.
