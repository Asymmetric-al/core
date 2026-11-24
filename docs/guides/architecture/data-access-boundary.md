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

1. Primary: ESLint `no-restricted-imports` rules in `eslint.config.mjs` (see ticket 2.2.2) catch violations during linting.
2. Secondary: `scripts/verify/data-boundary-check.mjs` runs in CI as a belt-and-suspenders guard.

In practice item 2 (`bun run verify:data-boundary`, run in CI and
`bun run ci:preflight`) is the only enforcing check, and item 1 is an editor
aid: `bun run lint` lints each
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

## Calls from a page to the app's own API

Page code calls the app's `/api` routes only through `ownApiFetch` in
`@asym/database/own-api` (plan 5.2; WP2b, AL-2675). It sends the document's
tenant and assignment as `x-asym-tenant` and `x-asym-assignment`, read from
the document scope when each call is made, and sends neither when the
document has no scope. A file an own-API route serves is downloaded with
`ownApiDownload` (or `useOwnApiDownload` from `@asym/ui/hooks`), never linked
or opened as a page, because a page load carries no header.

The server treats both headers as proposals: `getAuthContext` passes them to
the resolver, which checks them against the caller's own live rows. The human
command lane (`tenant_guard.begin_human_command`,
`public.resolve_command_assignment`) reads `x-asym-assignment` through
`tenant_guard.request_assignment_id()` (accepting only a live membership row
the caller holds and refusing a value that is not a UUID) and reads
`x-asym-tenant` through `authz.request_tenant_id()`, refusing with `42501`
when `x-asym-tenant` is missing, malformed or differs from the command's
tenant. `authz.caller_assignment`, which the member directory
(`public.tenant_member_directory`) uses, also reads `x-asym-assignment`
through `tenant_guard.request_assignment_id()` and refuses a mismatched
`x-asym-tenant`. The values the browser client sends reach these functions,
as the session clients' values do.

The server's session clients send the result, not the proposal:
`createClient(scope)` from `@asym/database/supabase/server` and
`createRequestSessionClient(request, scope)` from `packages/api` take
`requestScopeOf(auth)`, the tenant and membership row the resolver selected.
Pass `null` only for a client that reads no tenant table (sign-in, the
callback, recovery, the health probe).

The browser client sends the same two headers on its Data API requests, the
browser query cache keys every query by the document's person, tenant and
assignment, and keys in browser storage carry the person and the tenant
(`documentStorageKey` in `@asym/database/document-storage`).

A document's scope is valid inside its segment and nowhere else, and crossing
the segment's boundary, in or out, is a document load
(`packages/database/document-scope.tsx`). A tenant's segment is its address
prefix, which `TenantDocument` guards from the address. A document whose
address names no tenant gives its scope an empty prefix and passes its
`segment` to `DocumentScopeProvider`, which then holds the boundary itself: it
renders nothing and loads a new document when the document was loaded outside
the segment, and loads a new document when it unmounts at an address outside
it. The provider refuses an empty prefix without a segment, and an empty
segment. Those reloads are the fallback: at the source, `TenantLink` and
`useTenantRouter` (`@asym/auth/tenant-navigation`) load a document for a
navigation that crosses a segment, and the donor app declares the portal's
path at its root (`PortalSegmentBoundary`), so its links, the public site's
links into the portal and the landing after every sign-in are one document
load each. The donor portal passes `/donor-dashboard`. Web Studio (slice C)
passes `segment="/web-studio"` with an empty prefix, and so inherits the same:
no scope outside `/web-studio`, a new document when it is left or entered
without one, and shared links that keep their plain addresses.

ESLint enforces the first rule: `own-api/no-direct-call`
(`tooling/eslint-config/own-api.mjs`) refuses a direct `fetch`, beacon, event
source, socket, request object, XMLHttpRequest, axios, ky or ofetch call, or
navigation to an own-API path. A navigation is a link, a form, media or object
address, a DOM write of one, `window.open`, a location change, a router push or
a server redirect. A router is Next.js's `useRouter()` or the tenant router,
`useTenantRouter()`, under any local name. The rule also refuses the global
`fetch` used as a value (aliased, bound, called through `call`, handed over as
a `fetcher`, or taken out of a global object, as in `const { fetch } = window`):
the global `fetch` is only ever called where its address is written, and
`ownApiFetch` is what code hands over for the app's own API. It runs in the
workspaces listed in `ownApiWorkspaces.linted` (the three product apps and
`@asym/auth`, `@asym/database`, `@asym/lib`, `@asym/missionary` and
`@asym/ui`), through each workspace's own lint config, so `bun run lint` runs
it. Every other workspace is excluded by name, with its reason, in
`ownApiWorkspaces.excluded`. It has no exemption: a call that cannot move onto
the wrapper is a finding to raise, not a rule to switch off.

Payload's REST routes are mounted at `/web-studio/api` (`routes.api` in
`apps/admin/payload.config.ts`), outside Mission Control's `/api`, and
Payload's own code calls them, and its server functions, from Web Studio's
pages. The rule sees none of those calls: Payload builds their addresses from
its runtime config, and the headers are added at run time. The Web Studio
document's fetch hook
(`apps/admin/src/cms-ui/web-studio/shell/web-studio-document-fetch.ts`) adds
the document's tenant and assignment to every same-origin call under
`/web-studio/api`, and to every server function Payload posts from a Web Studio
page, there as Web Studio's own claim headers (`x-asym-web-studio-tenant`,
`x-asym-web-studio-assignment`), because the proxy deletes the pair from a page
request. The headers are claims, never a choice. Payload's strategy compares a
REST call's with the organization the Web Studio cookie selects and refuses a
write that names no document
(`apps/admin/src/cms/auth/supabase-strategy.ts`); the Payload layout compares a
server function's the same way before Payload runs it and refuses one that
names no document (`apps/admin/src/cms/web-studio-server-function.ts`). Each
refusal names itself (the `x-asym-web-studio-refusal` header on a REST call,
the digest of a server function's error) and opens one notice that asks the
person to reload. Two cases do not: a stale tab's write to Payload's
preferences, which are the person's own, answers a plain 401 with no refusal
header and opens no notice; and a refused bulk delete opens the notice, but
Payload's list then reloads the document into the organization now chosen,
about a second later, and the notice goes with it.

The rule reads one module at a time. It follows an address through that
module's literals, constants, object literals held in a constant, choices,
concatenation, an origin before the path, `new URL`, the parameters of its
own functions, the value a function declared in the module returns, and the
`pathname` of an object `href`. It does not see:

- an address built in another module and passed in, or returned by a function
  of another module;
- the value returned by a method, a function held in an object, or a
  callback, rather than a function declared in the module;
- an address read from data at run time, such as a contribution batch's
  `nextAction.href` from the server's JSON;
- a `fetch` reached through a local alias of `window` or a parameter
  (`const w = window; w.fetch(…)`, `target.fetch`);
- an SWR or TanStack Query key that names a path: a key is not a request, and
  the fetcher it is given decides how the call is made;
- HTTP clients other than axios, ky and ofetch, and routers other than
  Next.js's and the tenant router.

End to end, the request-scope specs (`bun run test:e2e:request-scope:admin`,
`:missionary` and `:donor`) prove that each app's own-API calls carry the
document's scope, and the donor portal's leave the portal without it. They run
in CI's `test-e2e` job, which reports on every pull request and blocks
promotion to `production` through `e2e-gate`, while `develop` is gated by the
smoke-level jobs.

## Missionaries reads

Mission Control's CRM reads worker IDs, profile IDs, tenant, location and
creation/update times under the selected staff assignment. Names come from the
tenant member directory. The own-missionary policy admits the same six columns
for the caller's own row, including the two keys that gift and pledge policies
use. Care fields remain server-only and `anon` holds no grant.

`GET /api/missionaries`, the admin directory, portal, dashboard and metrics
reads, and GraphQL `missionaries`/`missionary` still use the service-role
client. The browser must not instantiate `missionariesCollection` for sync.

## Reads on the caller's token

Since the second release of WP2b (AL-2675), the database admits a signed-in
read of a tenant table only for the tenant and the assignment the request
names: the `x-asym-tenant` and `x-asym-assignment` headers, which the shared
own-API wrapper, the browser client and the server's session clients send. A
read on the caller's token that names no tenant returns nothing from a tenant
table. The reads in `public` that need no tenant (the caller's own profile,
the published public posts and locations, the comments and reactions of a
public post, a claimant's own claims, and the global field-policy rows) are
the reviewed exceptions of `docs/security/tenant-policy-exceptions.json`,
which holds `public` policies only. The caller's own assignments come from
`authz.memberships`, outside `public`; Auth and Storage keep their own
policies, Storage's testing live membership in the tenant the object path
names. Commenters' names on a public post come from the first release's
`public.post_comment_authors(post)`, not from other people's `profiles` rows,
which only their owner may read.

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
