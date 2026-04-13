# Data Access Boundary

## Rule

`packages/api/src/*` is the single canonical layer for business database logic. Route handlers in `apps/*/app/api/` must remain thin re-exports only, and must never import `@asym/database/supabase/*`, `@supabase/ssr`, or `@supabase/supabase-js` directly.

## Enforcement

1. Primary: ESLint `no-restricted-imports` rules in `eslint.config.mjs` (see ticket 2.2.2) catch violations during linting.
2. Secondary: `scripts/verify/data-boundary-check.sh` runs in CI as a belt-and-suspenders guard.

The CI script currently scans `apps/*/app/api/**/*.ts`. This is why `apps/donor/app/auth/callback/route.ts` is not included in grep scope: it lives under `app/auth/`, not `app/api/`.

## Approved Exceptions

| File                                    | Allowed import                   | Justification                                                                                  |
| --------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------- |
| `apps/donor/app/auth/callback/route.ts` | `@asym/database/supabase/server` | Auth callback must exchange an auth code for a session before any API-layer delegation exists. |
| `apps/*/app/api/health/route.ts`        | `@asym/database/supabase/server` | Health endpoints are minimal connectivity probes; no business logic to delegate to API layer.  |
| Any GraphQL handler (if present)        | `@asym/database/supabase/server` | The GraphQL gateway is itself a data-layer boundary.                                           |
| `packages/lib/audit/logger.ts`          | internal                         | Audit logger is infrastructure, not a route handler.                                           |

## How to add a new exception

1. Justify in the PR why the file cannot delegate to `packages/api/src/*`.
2. Add the file and rationale to the Approved Exceptions table in this document.
3. If the file is under `apps/*/app/api/`, add an explicit exclusion comment/pattern in `scripts/verify/data-boundary-check.sh`.

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
