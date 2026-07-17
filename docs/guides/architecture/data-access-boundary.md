# Data Access Boundary

## Trigger

Use this guide when adding or changing App Router API routes, business data
access, server-only vendor integrations, or CRM/Twenty access paths.

## Rule

`packages/api/src/*` is the single canonical layer for business database logic. Route handlers in `apps/*/app/api/` must remain thin re-exports only, and must never import `@asym/database/supabase/*`, `@supabase/ssr`, or `@supabase/supabase-js` directly.

For browser-visible Supabase table data, `packages/database/collections/*` and
`packages/database/hooks/*` are the canonical app-facing data layer. App
components and features should use `@asym/database/hooks` instead of direct
Supabase table reads when a collection exists. The browser Supabase client is
reserved for approved low-level auth/session/storage helpers, not feature-local
table reads.

Twenty CRM follows the same boundary. App source must not import raw Twenty
client wrappers from `packages/api/src/crm/client/*`, must not import
`@asym/api/crm/client*`, and must never reference server-only Twenty secrets
such as `TWENTY_API_KEY` or `TWENTY_WEBHOOK_SECRET`.

## Enforcement

1. Primary: ESLint `no-restricted-imports` rules in `eslint.config.mjs` (see ticket 2.2.2) catch violations during linting.
2. Secondary: `scripts/verify/data-boundary-check.mjs` runs in CI as a belt-and-suspenders guard.

The CI script scans API route handlers for direct Supabase imports and app
source for raw Twenty client imports or server-only Twenty credential usage.
Routes outside `app/api/` (for example `apps/donor/app/auth/callback/route.ts`,
which now re-exports `GET` from `@asym/api/auth/callback`) are outside the API
route Supabase scope but follow the same delegation pattern.

## Workflow

1. Put business logic and vendor calls in `packages/api/src/*`.
2. Export stable route or service contracts from `@asym/api`.
3. Keep `apps/*/app/api/**/route.ts` files as thin re-exports.
4. Put browser-visible Supabase table reads in `@asym/database/hooks` backed by
   the collection registry.
5. Use `@asym/env` for server-only credentials inside packages, not raw
   `process.env` reads in app/runtime modules.
6. Run `bun run verify:data-boundary` after changing routes, app data reads, or CRM/Twenty
   access paths.

The Twenty CRM integration is retired
([ADR-0001](../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md));
Asym Postgres owns all CRM truth (see the
[Phase 1 ownership matrix](../../prds/sitestacker-parity/phase-01-source-of-truth-ownership-matrix.md)).
The Twenty client code is dormant pending a scheduled cleanup ticket, so the
Twenty-specific rules above still guard real code; delete them from this guide
only when that ticket removes the code.

## Approved Exceptions

| File                             | Allowed import                   | Justification                                                                                 |
| -------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------- |
| `apps/*/app/api/health/route.ts` | `@asym/database/supabase/server` | Health endpoints are minimal connectivity probes; no business logic to delegate to API layer. |
| Any GraphQL handler (if present) | `@asym/database/supabase/server` | The GraphQL gateway is itself a data-layer boundary.                                          |
| `packages/lib/audit/logger.ts`   | internal                         | Audit logger is infrastructure, not a route handler.                                          |

## How to add a new exception

1. Justify in the PR why the file cannot delegate to `packages/api/src/*`.
2. Add the file and rationale to the Approved Exceptions table in this document.
3. If the file is under `apps/*/app/api/`, add an explicit exclusion comment/pattern in `scripts/verify/data-boundary-check.mjs`.

## Checklist

- [ ] App API route handlers are thin re-exports from `@asym/api`.
- [ ] Business database logic lives under `packages/api/src/*`.
- [ ] Supabase clients are not imported directly from `apps/*/app/api/**`.
- [ ] Browser table reads use `@asym/database/hooks` or approved collection
      exports when a collection exists.
- [ ] Browser collection mutations are limited to simple RLS-authorized
      single-table writes.
- [ ] Payments, donations, receipts, webhooks, audit, role changes, reporting,
      RPC counters, and multi-table workflows remain server-command owned.
- [ ] Raw Twenty clients stay under `packages/api/src/crm/client/*`.
- [ ] App source does not reference `TWENTY_API_KEY`,
      `TWENTY_WEBHOOK_SECRET`, or any `NEXT_PUBLIC_TWENTY_*` secret.
- [ ] `bun run verify:data-boundary` passes.

## Correct pattern

- Route handler: `apps/admin/app/api/posts/route.ts` re-exports `GET` and `POST` from `@asym/api/posts` and does not import Supabase directly.
- Business logic: `packages/api/src/posts/index.ts` imports `getAdminClient` from `@asym/database/supabase/admin`, which is the correct location for data-layer logic.

Web Studio Phase 3 staff directory endpoints follow the same pattern:

- `apps/admin/app/api/admin/missionaries/route.ts` → `@asym/api/admin/missionary-directory`
- `apps/admin/app/api/admin/funds/route.ts` → `@asym/api/admin/fund-directory`

## Incorrect pattern

Route handlers in `apps/*/app/api/` must not call Supabase clients directly.

```ts
import { getAdminClient } from "@asym/database/supabase/admin";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
  const admin = getAdminClient();
  const direct = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, "anon");
  // ...direct database access in route handler is not allowed
  return Response.json({ ok: Boolean(admin && direct) });
}
```
