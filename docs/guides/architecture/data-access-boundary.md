# Data Access Boundary

## Trigger

Use this guide when adding or changing App Router API routes, business data
access, server-only vendor integrations, or CRM access paths.

## Rule

`packages/api/src/*` is the single canonical layer for business database logic. Route handlers in `apps/*/app/api/` must remain thin re-exports only, and must never import `@asym/database/supabase/*`, `@supabase/ssr`, or `@supabase/supabase-js` directly.

For browser-visible Supabase table data, `packages/database/collections/*` and
`packages/database/hooks/*` are the canonical app-facing data layer. App
components and features should use `@asym/database/hooks` instead of direct
Supabase table reads when a collection exists. The browser Supabase client is
reserved for approved low-level auth/session/storage helpers, not feature-local
table reads.

Asym Postgres owns all CRM truth. Twenty CRM is retired. App source must not
restore Twenty clients, credentials, routes, webhooks, synchronization, or
projections. Do not import `@asym/api/crm/client*` or recreate
`packages/api/src/crm/client/*`, and never reference `TWENTY_API_KEY`,
`TWENTY_WEBHOOK_SECRET`, or any `NEXT_PUBLIC_TWENTY_*` value.

## Enforcement

1. Enforcing check: `scripts/verify/data-boundary-check.mjs` (`bun run verify:data-boundary`) runs in CI and `bun run ci:preflight`.
2. Editor aid only: ESLint `no-restricted-imports` rules in the root `eslint.config.mjs` (see ticket 2.2.2), for the reason below.

`bun run lint` lints each
workspace with its own `eslint.config.mjs`, which loads the shared
`restrictedImports()` rule from `tooling/eslint-config/restricted-imports.mjs`
(cross-app and `motion/react` bans only). The route-handler and
component/feature Supabase bans, and the Twenty client ban
(`appRestrictedImports()`), are declared only in the root `eslint.config.mjs`,
so they apply to root-config runs and editors, not to `bun run lint` or the CI
lint job.

`bun run verify:data-boundary` (run in the CI `lint` job and by
`bun run ci:preflight`) fails when:

- a file under `apps/*/app/api/**` or `apps/*/src/app/api/**` imports
  `@asym/database/supabase/{admin,server,client}`, `@supabase/ssr` or
  `@supabase/supabase-js` (every `api/health/route.ts` is skipped);
- any file under `apps/**` imports `@supabase/supabase-js`, or the browser
  client entry point `@asym/database/supabase`, outside the script's per-file
  allowlists;
- any file under `apps/**` references a retired Twenty client path or
  credential (`TWENTY_API_KEY`, `TWENTY_WEBHOOK_SECRET`, `NEXT_PUBLIC_TWENTY_*`);
- any file under `apps/`, `packages/` or `scripts/`, or `.env.example`,
  contains a retired Twenty runtime marker (the `TWENTY_*` and `CRM_SYNC_*`
  variables or the removed `crm/client` paths).

Routes outside `app/api/` (for example `apps/donor/app/auth/callback/route.ts`,
which now re-exports `GET` from `@asym/api/auth/callback`) are outside the API
route Supabase scope but follow the same delegation pattern. The script does
not check `@asym/database/supabase/server` or `/admin` imports in app server
code outside `app/api/`; business data logic still belongs in `packages/api`.

## Workflow

1. Put business logic and vendor calls in `packages/api/src/*`.
2. Export stable route or service contracts from `@asym/api`.
3. Keep `apps/*/app/api/**/route.ts` files as thin re-exports.
4. Put browser-visible Supabase table reads in `@asym/database/hooks` backed by
   the collection registry.
5. Use `@asym/env` for server-only credentials inside packages, not raw
   `process.env` reads in app/runtime modules.
6. Run `bun run verify:data-boundary` after changing routes, app data reads, or CRM
   access paths.

The Twenty CRM integration is retired
([ADR-0001](../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md)).
Asym Postgres owns all CRM truth. The Twenty client code was removed from
`develop` by PR #1325 (merged 2026-08-19); do not restore it or rewrap it as
a generic provider adapter. Retained compatibility identifiers such as
`staged_gifts.twenty_record_id` belong to their owning domains and do not
authorize vendor calls. External provider cleanup proof stays with
`openspec/changes/complete-twenty-crm-retirement` task 4.5 (#602).

## Missionaries reads

`public.missionaries` is server-only (#2364,
`supabase/migrations/20261026105000_missionaries_server_only_reads.sql`).
Every read goes through `packages/api/src/*` or the GraphQL handler using the
service-role admin client: `GET /api/missionaries`, the admin directory, the
donor and missionary portals, dashboard and metrics reads, and GraphQL
`missionaries`/`missionary`. `anon` holds no privilege on the table. The
`authenticated` role keeps column SELECT on `id` and `profile_id` for its own
row only, so the own-missionary branch of the `donations` and `donor_pledges`
read policies keeps working. No browser or user-key code reads it, and
`missionariesCollection` must not be instantiated for browser sync.

`GET /api/donate` returns checkout config only, `{ "publishableKey": "<pk>" }`.
It no longer returns designations or donor rows.

## Approved Exceptions

Only the rows marked "script" are encoded in
`scripts/verify/data-boundary-check.mjs`; the others are policy exceptions
outside the paths or imports the script checks.

| File                                                    | Allowed import                                | Enforced by                     | Justification                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------- | --------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/*/app/api/health/route.ts`                        | `@asym/database/supabase/server`              | script (path skip); root ESLint | Health endpoints are connectivity probes. The current admin, donor and missionary health routes re-export `createAppHealthHandler` from `@asym/api/health/app` and import no Supabase client.                                                                                                     |
| `apps/admin/src/cms/auth/supabase-strategy.ts`          | `@supabase/supabase-js` (and `@supabase/ssr`) | script (raw-import allowlist)   | Server-side Payload auth strategy that verifies Supabase sessions; not a table read path.                                                                                                                                                                                                         |
| `apps/admin/lib/authenticated-fetch.ts`                 | `@asym/database/supabase` (browser client)    | script (browser allowlist)      | Browser auth helper that reads the session to attach the access token to fetches; not a table read path.                                                                                                                                                                                          |
| `packages/graphql/handler.ts`                           | `@asym/database/supabase/admin`               | not scanned (package)           | GraphQL is a shared-record surface adapter, not a second product surface. Gift begin and Ministry Update Engagement mutations MUST go through `@asym/api` command modules (ADR-0120). The gateway exception covers remaining queries/selects and Yoga context construction, not those mutations.  |
| `packages/lib/audit/logger.ts`                          | `@asym/database/supabase/admin`               | not scanned (package)           | Audit logger is infrastructure, not a route handler.                                                                                                                                                                                                                                              |
| `apps/admin/app/api/cms/**` and `apps/admin/src/cms/**` | Payload Local API                             | not a banned import             | Payload CMS runs inside the admin app, so CMS data access cannot delegate to `packages/api` without moving the Payload runtime. Public code paths are further confined to the single published-content reader choke-point by the hard `verify:cms-public-sole-entry` gate (issue #523, ADR-0028). |

## How to add a new exception

1. Justify in the PR why the file cannot delegate to `packages/api/src/*`.
2. Add the file and rationale to the Approved Exceptions table in this document.
3. If the script would flag the file, add it to the matching per-file
   allowlist in `scripts/verify/data-boundary-check.mjs`; each allowlist covers
   one class of banned import.

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
- [ ] No new Twenty client, credential, route, webhook, or sync path is added.
- [ ] App source does not reference `TWENTY_API_KEY`,
      `TWENTY_WEBHOOK_SECRET`, or any `NEXT_PUBLIC_TWENTY_*` secret.
- [ ] `bun run verify:data-boundary` passes.

## Correct pattern

- Route handler: `apps/donor/app/api/posts/route.ts` re-exports `GET` and `POST` from `@asym/api/posts` and does not import Supabase directly.
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
