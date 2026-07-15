# Design: Canonical Supabase TanStack DB Data Layer

## Goals

- Establish a single Supabase-backed TanStack DB adapter path for browser-visible
  table data.
- Keep the browser/server boundary explicit enough that future features do not
  move privileged workflows into client collections.
- Make table exposure decisions auditable through code, docs, and tests.
- Preserve developer ergonomics through `@asym/database/hooks` while improving
  live query consistency.

## Non-Goals

- This change does not make TanStack DB a payment, reporting, audit, webhook, or
  privileged command engine.
- This change does not remove Supabase RLS or replace server-side authorization.
- This change does not require every server read to use TanStack DB.
- This change does not expose service-role or secret-bearing data to browser
  clients.

## Data Layer Categories

### Browser RLS-Safe Table Collections

Use `@supabase-labs/tanstack-db` through a repo-owned wrapper in
`packages/database/collections/supabase-collection.ts`.

Allowed when:

- The table or safe view is browser-visible by product intent.
- RLS is enabled and scoped by tenant, user ownership, role, or public policy.
- The selected columns do not expose secrets, provider internals, private notes,
  audit details, or unnecessary PII.
- Realtime payload size and update frequency are acceptable for user-visible UI.

Examples: posts, post comments, follows, visible location rows, support hub
staff rows behind staff RLS, and other scoped dashboard/list data.

### Browser Collection Mutations

Use collection mutations only for simple, single-table, user-initiated writes
that RLS allows and where optimistic UI is appropriate.

Examples: low-risk preferences, simple comments, simple follows, and other
single-row CRUD where the browser is allowed to form the write.

### Server Commands

Use `packages/api`, Server Actions, or thin route handlers for commands that
require server authority.

Required for:

- Stripe and payments.
- Donation creation or payment confirmation.
- Receipts, statements, and tax documents.
- Email sending and webhooks.
- Audit logs.
- Service-role operations.
- Admin privileged operations and role or permission changes.
- RPC counter workflows and workflows requiring compensation.
- Multi-table writes that must succeed or fail together.
- File processing, payouts, external sync, and anything with secrets.

Server commands SHOULD rely on Realtime to update browser collections where that
path is enabled and reliable. They MAY explicitly invalidate Query/TanStack DB
state where Realtime is disabled, intentionally excluded, or insufficient.

### Server Reads And `queryOnce`

Use plain server Supabase queries when they are simpler, faster, more secure, or
need service-role access.

Use TanStack DB `queryOnce` only when it provides clear value:

- Sharing query shape with browser collection hooks.
- Producing a bounded one-shot read model.
- Comparing server and browser query behavior in tests.
- Avoiding duplicated filtering/sorting/joining logic without pulling excessive
  data into memory.

Do not use `queryOnce` for heavy reporting, aggregate-heavy finance workflows,
privileged service-role reads, or commands.

### Derived And Local-Only Collections

Derived collections may compose real table collections for UI-specific shapes.
They must be documented as derived and must not become separate sources of
truth.

Local-only collections may remain only for true UI state, test fixtures, or
explicit demo-only surfaces. They must be marked local-only in the registry and
have a removal or persistence decision where the feature is product-facing.

## RLS And Realtime Policy

Every browser-exposed table or view must have an explicit RLS posture before it
is listed as a browser collection. Demo public-read policies are not production
tenant isolation.

Realtime defaults to on for normal user-visible app tables once RLS is safe.
Realtime defaults to off for:

- Audit logs.
- Webhook and email event logs.
- Payment attempts and provider internals.
- Receipt/render artifacts.
- Large assets or large JSON payloads.
- Internal sync queues.
- Tables users do not actively view live.

Realtime exclusions must be recorded in the collection registry and docs.

## Package Ownership

- `packages/database/supabase/*` remains the low-level Supabase adapter area.
- `packages/database/collections/*` owns collection schemas, wrappers, registry,
  and approved queryOnce helpers.
- `packages/database/hooks/*` owns app-facing hooks.
- `packages/api/src/*` owns business DB logic and server-command workflows.
- Apps should consume hooks and stable package exports, not package internals.

## Migration Shape

Implement in vertical slices:

1. Add failing tests or guardrails for the behavior being changed.
2. Implement the smallest wrapper/collection/hook/doc/enforcement change.
3. Verify the focused behavior.
4. Move to the next table or surface category.

This avoids broad rewrites that expose unsafe tables before RLS and command
boundaries are ready.
