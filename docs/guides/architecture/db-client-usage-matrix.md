# DB Client Usage Matrix

This guide defines where each Supabase client is allowed in this monorepo and
which imports are forbidden.

## Canonical import surfaces

- Browser client: `@asym/database/supabase/client`
- Server client: `@asym/database/supabase/server`
- Admin client: `@asym/database/supabase/admin`

Direct imports from `@supabase/ssr` and `@supabase/supabase-js` are reserved for
the database adapter layer in `packages/database/supabase/*`.

## Allowed and Forbidden Matrix

| Code location                                      | Browser client       | Server client                                   | Admin client                               | Direct `@supabase/*` imports | Enforcement                                                                                      |
| -------------------------------------------------- | -------------------- | ----------------------------------------------- | ------------------------------------------ | ---------------------------- | ------------------------------------------------------------------------------------------------ |
| `apps/*/components/**`                             | Allowed              | Forbidden                                       | Forbidden                                  | Forbidden                    | ESLint `no-restricted-imports` in `eslint.config.mjs` (ticket `2.2.2`)                           |
| `apps/*/features/**`                               | Allowed              | Forbidden                                       | Forbidden                                  | Forbidden                    | ESLint `no-restricted-imports` in `eslint.config.mjs` (ticket `2.2.2`)                           |
| `packages/ui/**`                                   | Allowed              | Forbidden                                       | Forbidden                                  | Forbidden                    | ESLint `no-restricted-imports` in `eslint.config.mjs` (ticket `2.2.2`)                           |
| `apps/*/app/api/**` route handlers                 | Forbidden            | Forbidden                                       | Forbidden                                  | Forbidden                    | ESLint `no-restricted-imports` in `eslint.config.mjs` (ticket `2.2.2`)                           |
| `packages/api/src/**` business handlers            | Forbidden            | Allowed when request-context reads are required | Allowed for privileged business operations | Forbidden                    | Architectural rule (data-access boundary); CI/script enforcement is introduced by ticket `2.2.1` |
| `packages/auth/**` and middleware/proxy auth flows | Forbidden            | Allowed                                         | Forbidden                                  | Forbidden                    | Auth boundary rule (`nextjs-supabase-auth` skill and backend rules)                              |
| `packages/database/supabase/**`                    | Not a consumer layer | Not a consumer layer                            | Not a consumer layer                       | Allowed                      | Adapter layer; this is the only layer that should depend on raw Supabase SDK imports             |

## Route handler policy

Route handlers under `apps/*/app/api/**` should be thin and primarily re-export
business handlers from `@asym/api/*`. They should not instantiate Supabase
clients directly, including `@asym/database/supabase` and
`@asym/database/supabase/*` imports.

## Quick decision guide

- Building UI state in components/features: use only
  `@asym/database/supabase/client` when a Supabase client is needed.
- Implementing API business logic: keep it in `packages/api/src/**`, then
  re-export from app route handlers.
- Working on low-level Supabase adapter code: limit raw `@supabase/*` imports to
  `packages/database/supabase/*`.
