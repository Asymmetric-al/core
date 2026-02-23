# DB Client Usage Matrix

This matrix defines where each Supabase client is allowed or forbidden.
Use it as the source of truth for import boundaries across apps and shared
packages.

## Client Types

- Browser client: `@asym/database/supabase/client`
- Server client: `@asym/database/supabase/server`
- Admin client: `@asym/database/supabase/admin`

## Allowed / Forbidden Matrix

| Area                                                                                                          | Browser client                            | Server client                  | Admin client                                       |
| ------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------ | -------------------------------------------------- |
| `apps/*/components/**`                                                                                        | Allowed (client-only, user-scoped access) | Forbidden                      | Forbidden                                          |
| `apps/*/features/**`                                                                                          | Allowed (client-facing feature logic)     | Forbidden                      | Forbidden                                          |
| `apps/*/app/api/**` route handlers                                                                            | Forbidden (direct import)                 | Forbidden (direct import)      | Forbidden (direct import)                          |
| `packages/ui/**`                                                                                              | Forbidden                                 | Forbidden                      | Forbidden                                          |
| Server-capable shared packages (`packages/api/**`, `packages/auth/**`, `packages/lib/**` server-only modules) | Forbidden                                 | Allowed in server-only modules | Allowed only for privileged server-side operations |

## Enforcement Notes

- UI layers are lint-restricted from importing
  `@asym/database/supabase/server` and `@asym/database/supabase/admin`.
- API route handlers are lint-restricted from direct Supabase imports
  (`@asym/database/supabase/*`, `@supabase/ssr`, `@supabase/supabase-js`).
- Route handlers should call approved wrappers/domain modules instead of
  creating clients directly.
- Admin client usage must remain server-only and must never cross a client
  component boundary.
- If uncertain, default to the least-privileged client and preserve RLS
  assumptions.
