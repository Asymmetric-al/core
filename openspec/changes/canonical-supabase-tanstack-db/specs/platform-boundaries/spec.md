# Delta for Platform System Boundaries

## ADDED Requirements

### Requirement: Supabase TanStack DB Collections Own Browser-Visible Table State

Browser-visible Supabase table state MUST be represented through shared
TanStack DB collections owned by `packages/database/collections` and app-facing
hooks owned by `packages/database/hooks`.

The platform MUST use the repo-owned Supabase TanStack DB adapter wrapper for
browser collections instead of ad hoc app-level Supabase table reads, route-only
read models, or feature-local arrays when the data is a real Supabase table and
safe for browser access under RLS.

Supabase Postgres remains the source of truth. Supabase Auth and RLS remain the
security boundary for browser-reachable table data.

#### Scenario: A browser feature needs a list of RLS-safe table rows

- GIVEN a browser-visible feature needs rows from a Supabase table that is safe
  for the user under RLS
- WHEN an agent chooses a data-access pattern
- THEN the feature uses an `@asym/database` collection or hook
- AND it does not add a direct app-level Supabase table read

#### Scenario: A table is not safe under current RLS

- GIVEN a table contains secret-bearing, finance-sensitive, private, or
  tenant-wide rows without production-safe RLS and redaction
- WHEN an agent considers exposing it as a browser collection
- THEN the agent keeps that table out of browser collections
- AND they add scoped RLS, a safe view, or a server read model before exposing
  browser-visible data

### Requirement: Collection Mutations Are Limited To Simple RLS-Allowed Writes

TanStack DB collection mutations MUST be limited to single-table, user-initiated
CRUD actions when RLS authorizes the action and optimistic UI is appropriate.

Collection mutations MUST NOT own payments, donation creation or confirmation,
refunds, receipts, tax documents, email sending, webhooks, audit logs,
service-role operations, role changes, RPC counter workflows, multi-table
business workflows, external system sync, file processing, payouts, or anything
involving secrets.

#### Scenario: A user edits a simple preference row

- GIVEN the user is allowed by RLS to update a single preference row
- WHEN the UI applies an optimistic update
- THEN a collection mutation may write the row
- AND the mutation rolls back if Supabase rejects the write

#### Scenario: A donor submits a payment or donation

- GIVEN a donor action creates or confirms money movement
- WHEN the implementation chooses where the mutation belongs
- THEN the action remains behind a server command boundary
- AND the browser collection only reflects safe resulting state after the
  server-owned workflow persists it

### Requirement: Server Read Helpers Do Not Weaken Command Boundaries

TanStack DB `queryOnce` MUST NOT be used in server, route, or shared package
code except through an approved `@asym/database` helper for bounded read
shaping, collection-compatible query reuse, or tests that compare server and
browser query behavior.

Server code MUST keep plain Supabase, SQL, views, functions, or existing API
read models when they are simpler, faster, more secure, aggregate-heavy,
service-role dependent, or command-adjacent.

#### Scenario: A server component needs the same safe filtered list as a browser hook

- GIVEN a server component needs a bounded read shaped like an existing browser
  collection query
- WHEN `queryOnce` can express that read without broadening data exposure or
  pulling excessive data into memory
- THEN the server may use the approved `@asym/database` queryOnce helper
- AND it does not create an ad hoc Supabase client or collection adapter

#### Scenario: A finance report needs authoritative aggregate data

- GIVEN a report needs aggregate-heavy or finance-authoritative data
- WHEN an agent considers replacing the report path with TanStack DB
- THEN the report stays server-side through SQL, views, functions, or server
  Supabase queries
- AND TanStack DB may only display bounded report results when appropriate

### Requirement: Realtime Exposure Is Explicit And RLS-Gated

Realtime Postgres Changes MUST be enabled only for tables whose payloads and
RLS posture are appropriate for live browser-visible updates.

Visible app tables MAY use Realtime by default after RLS is safe. Internal,
high-churn, sensitive, large-payload, audit, webhook, payment, sync, and
non-UI tables MUST be excluded unless a specific product need and RLS design
justify inclusion.

#### Scenario: A feed table is browser-visible and RLS-safe

- GIVEN a feed table is visible to the current user under RLS
- WHEN collection state should update after other users or server commands write
  rows
- THEN the table may be added to `supabase_realtime`
- AND the collection registry documents Realtime as enabled

#### Scenario: A webhook log or payment attempt table changes frequently

- GIVEN a table contains webhook logs, provider internals, payment attempts,
  audit events, large payloads, or internal sync state
- WHEN an agent considers enabling Realtime for convenience
- THEN the table remains excluded from Realtime
- AND any UI that needs status uses a safe server read model or bounded polling
  strategy

### Requirement: Collection Registry Documents Data Ownership And Exclusions

The platform MUST maintain a collection registry that identifies every shared
collection or collection-like data source by kind: real Supabase table,
derived collection, queryOnce/server read helper, local-only UI collection, or
legacy temporary collection.

The registry MUST make RLS posture, Realtime posture, primary keys, mutation
policy, and intentional browser/server exclusions visible to future agents and
developers.

#### Scenario: A developer adds a new browser data feature

- GIVEN a developer needs to know which collection owns a feature's data
- WHEN they inspect the registry
- THEN they can identify the intended collection or server read path
- AND they can see whether browser mutations or Realtime are allowed

#### Scenario: A local-only collection remains after migration

- GIVEN a collection is intentionally local-only or demo-only
- WHEN it remains in the codebase
- THEN the registry marks it local-only
- AND documents why it is not backed by Supabase yet or what must happen before
  it can be persisted
