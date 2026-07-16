## 1. Specification and research gates

- [x] 1.1 Create the `canonical-supabase-tanstack-db` OpenSpec change package
- [x] 1.2 Validate the OpenSpec change package
- [x] 1.3 Verify current TanStack DB, `@supabase-labs/tanstack-db`, Supabase
      Realtime, and RLS docs/source behavior
- [x] 1.4 Confirm current dependency versions and package constraints

## 2. Adapter foundation

- [ ] 2.1 Add `@supabase-labs/tanstack-db` to `@asym/database`
- [ ] 2.2 Add the repo-owned browser Supabase collection wrapper
- [ ] 2.3 Add approved `queryOnce` helper exports for bounded server reads
- [ ] 2.4 Add wrapper tests for schema typing, keys, composite keys, Realtime
      options, and mutation rollback behavior

## 3. Collection registry and domains

- [ ] 3.1 Split collection schemas and table collections into maintainable domains
- [ ] 3.2 Add a canonical collection registry with table, kind, key, RLS,
      Realtime, mutation, and exclusion metadata
- [ ] 3.3 Preserve backward-compatible exports for current app imports
- [ ] 3.4 Add registry completeness and schema/key tests

## 4. RLS and Realtime safety

- [ ] 4.1 Identify every browser-exposed collection table and its effective RLS
      posture
- [ ] 4.2 Add production-safe RLS policies or keep unsafe tables server-only
- [ ] 4.3 Add defensive Realtime publication migration for approved visible
      tables
- [ ] 4.4 Document tables intentionally excluded from browser collections or
      Realtime
- [ ] 4.5 Add representative allowed/blocked RLS checks where the test harness
      supports them

## 5. Real table collection migration

- [ ] 5.1 Convert existing real table collections to the Supabase adapter wrapper
- [ ] 5.2 Add safe new table collections only after RLS/redaction is resolved
- [ ] 5.3 Keep sensitive and aggregate-heavy tables out of browser collections
- [ ] 5.4 Add representative live query join tests

## 6. Route-backed and local collection migration

- [ ] 6.1 Convert admin locations to live table collections where safe
- [ ] 6.2 Convert donor history to live query composition or document any server
      read model that must remain
- [ ] 6.3 Migrate Support Hub collections to real `support_*` tables where safe
- [ ] 6.4 Classify admin workspace seeded collections as real table, derived, or
      explicit local-only

## 7. Hook and app migration

- [ ] 7.1 Refactor `packages/database/hooks` to use live queries by default for
      browser-visible data
- [ ] 7.2 Update admin app reads to `@asym/database/hooks` where collections fit
- [ ] 7.3 Update donor app reads and mocks to collection-backed hooks where safe
- [ ] 7.4 Update missionary app feed, comments, tasks, and profile reads where
      collections fit
- [ ] 7.5 Preserve server-command flows for payments, receipts, audit, webhooks,
      role changes, reporting, and multi-table workflows

## 8. Guardrails and docs

- [ ] 8.1 Update `scripts/verify/data-boundary-check.mjs`
- [ ] 8.2 Add or update tests for data-boundary enforcement
- [ ] 8.3 Update TanStack, data-boundary, frontend, backend, testing, stack, and
      AI guidance docs
- [ ] 8.4 Update repo-owned skills or mirrors only through the documented sync
      workflow when canonical skill content changes

## 9. Verification

- [ ] 9.1 Run `bun install`
- [ ] 9.2 Run `bun run verify:workspace-contract`
- [ ] 9.3 Run `bun run verify:data-boundary`
- [ ] 9.4 Run `bun run typecheck`
- [ ] 9.5 Run `bun run lint`
- [ ] 9.6 Run `bun run test:unit`
- [ ] 9.7 Run `bun run build:admin`
- [ ] 9.8 Run `bun run build:donor`
- [ ] 9.9 Run `bun run build:missionary`
- [ ] 9.10 Run `bun run test:e2e:smoke` when local environment supports it
