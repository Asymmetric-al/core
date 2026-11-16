# DB Client Usage Matrix

Where each Supabase client may be used. The governing rule and its approved
exceptions are in the [data-access boundary](./data-access-boundary.md).

## Import surfaces (`packages/database/package.json` exports)

- Browser client: `createBrowserClient` from `@asym/database/supabase`
  (`packages/database/supabase/client.ts`). There is no
  `@asym/database/supabase/client` export.
- Server (request-cookie) client: `@asym/database/supabase/server`
- Service-role admin client: `getAdminClient` / `createAdminClient` from
  `@asym/database/supabase/admin` (server only)
- Browser table data: `@asym/database/hooks` and `@asym/database/collections`

## Matrix

| Code location                         | Browser client                                                                      | Server / admin client                                                                                                                               | Direct `@supabase/*` imports                                                                                     | Enforcement                                                                                                                                                                                   |
| ------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/**` (all app source)            | Forbidden except allowlisted auth helpers (`apps/admin/lib/authenticated-fetch.ts`) | Not script-checked; business data logic still belongs in `packages/api` (a few server modules such as `apps/admin/lib/admin-access.ts` import them) | `@supabase/supabase-js` forbidden except `apps/admin/src/cms/auth/supabase-strategy.ts`                          | `verify:data-boundary` (CI)                                                                                                                                                                   |
| `apps/*/components/**`, `features/**` | As above                                                                            | Forbidden                                                                                                                                           | Forbidden                                                                                                        | Root `eslint.config.mjs` only (editors/root-cwd runs; workspace lint does not load it)                                                                                                        |
| `apps/*/app/api/**` route handlers    | Forbidden                                                                           | Forbidden (except `api/health/route.ts`)                                                                                                            | Forbidden                                                                                                        | ESLint `no-restricted-imports` in `eslint.config.mjs` (ticket `2.2.2`). That root config is not loaded by workspace lint; the CI check is `verify:data-boundary`                              |
| `packages/ui/**`                      | Auth screens only (`components/auth/LoginScreen.tsx`)                               | Forbidden                                                                                                                                           | Forbidden                                                                                                        | Root `eslint.config.mjs` only                                                                                                                                                                 |
| `packages/api/src/**`                 | Forbidden                                                                           | Allowed; admin client for privileged business operations                                                                                            | `@supabase/ssr` `createServerClient` in request-session helpers (for example `shared/request-session-client.ts`) | Architectural rule (data-access boundary); CI/script enforcement is introduced by ticket `2.2.1`. `verify:data-boundary` scans `apps/**` only, so `packages/api` itself is not script-checked |
| `packages/auth/**`                    | `client-session.ts` (browser session helper)                                        | Allowed                                                                                                                                             | `@supabase/ssr` and `@supabase/supabase-js` in `context.ts` and `middleware.ts`                                  | Auth boundary (`packages/auth/AGENTS.md`)                                                                                                                                                     |
| `packages/database/supabase/**`       | Defines it                                                                          | Defines them                                                                                                                                        | Allowed                                                                                                          | Adapter layer                                                                                                                                                                                 |

## Quick decision guide

- Browser UI over Supabase table rows: use `@asym/database/hooks` or approved
  collection exports.
- Browser auth/session or Storage helpers: use the browser client only in an
  approved shared helper; app files need an allowlist entry in
  `scripts/verify/data-boundary-check.mjs`.
- API business logic: keep it in `packages/api/src/**` and re-export it from
  the app route handler.
- New raw `@supabase/*` usage belongs in `packages/database/supabase/*`, or in
  `packages/auth`/`packages/api` request-session code that needs
  `createServerClient` with request cookies.
