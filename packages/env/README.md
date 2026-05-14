# @asym/env

Shared environment schema package for Asymmetric.al. This package defines the typed `createEnv` contract for variables listed in `.env.example` and exports:

- `serverEnv`: validated server/runtime variables
- `clientEnv`: validated `NEXT_PUBLIC_*` variables
- `runtimeEnvFlags`: deployment context helpers (`NODE_ENV`, `VERCEL_ENV`, `VERCEL_TARGET_ENV`)
- `env`: full backward-compatible export (same validated source object)

## Import Examples

```ts
import { serverEnv, clientEnv } from "@asym/env";

const supabaseUrl = clientEnv.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = serverEnv.SUPABASE_SERVICE_ROLE_KEY;
```

## Requiredness Model

Always required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Conditionally required:

- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SENTRY_DSN`

These become required for protected deployments (production or custom staging target) and remain optional in local/preview workflows.

Cloudinary server/client keys are conditionally required only when Cloudinary is enabled in protected deployments.

Twenty CRM variables are server-only and optional during the non-production
gateway/sync phases:

- `TWENTY_API_URL`
- `TWENTY_API_KEY`
- `TWENTY_WEBHOOK_SECRET`
- `TWENTY_WORKSPACE_ID`
- `TWENTY_RATE_LIMIT_RPM` (defaults in callers to `100` when unset)
- `CRM_SYNC_INBOUND_ENABLED` (defaults off)
- `CRM_SYNC_OUTBOUND_ENABLED` (defaults off)
- `CRM_SYNC_REPLAY_ENABLED` (defaults off)
- `CRM_SYNC_RECONCILIATION_ENABLED` (defaults off)
- `CRM_SYNC_WEBHOOK_TOLERANCE_SECONDS` (defaults to `300`)

Do not add `NEXT_PUBLIC_TWENTY_*` variables. Browser and app source must use
Asym API contracts, not raw Twenty credentials.

`DOCRAPTOR_API_KEY` is optional and server-only. DocRaptor examples authenticate with the API key as `user_credentials` or Basic Auth username, so keep it out of `NEXT_PUBLIC_*` variables.

## Migration Policy

| Change      | Required updates                                                                      | Notes                                                      |
| ----------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Add env var | Update `.env.example`, add schema entry, add `runtimeEnv` mapping, update README/docs | Choose `server` vs `client` based on `NEXT_PUBLIC_` prefix |

Optional client flags include `NEXT_PUBLIC_VIEW_TRANSITIONS_ENABLED` (experimental React View Transitions; default off).
| Change validation | Update `packages/env/src/schema.ts` and docs | Keep changes backwards-compatible when possible |
| Remove env var | Remove from `.env.example`, schema, and `runtimeEnv`; document migration | Coordinate app/package cleanup before removal |
| Make optional -> required | Update schema + required list + contributor docs | Treat as breaking for local setup/CI expectations |
| Make required -> optional | Update schema + required list + docs | Confirm fallback behavior in consuming code |

## Add a New Env Var

1. Add the variable to `.env.example` with a safe placeholder/default.
2. Add the variable to `server` or `client` in `packages/env/src/schema.ts`.
3. Add the variable to `runtimeEnv` in `packages/env/src/schema.ts`.
4. Update this README and any feature docs that depend on it.
5. Run `bun run --filter @asym/env typecheck` and `bun run --filter @asym/env lint`.

## Skip Validation In CI or Tests

```bash
SKIP_ENV_VALIDATION=1 bun test
```

## Where `process.env` Is Allowed

| Location                          | `process.env` allowed? | Reason                                         |
| --------------------------------- | ---------------------- | ---------------------------------------------- |
| `packages/env/src/schema.ts`      | ✅ Yes (required)      | Single source of truth for raw env reads       |
| `scripts/*.mjs`, `scripts/*.ts`   | ✅ Yes                 | Tooling scripts run outside Next.js runtime    |
| `playwright.config.ts`            | ✅ Yes                 | Test runner config, not app runtime            |
| `apps/*/app/**`                   | ❌ No                  | Use `clientEnv` / `serverEnv` from `@asym/env` |
| `packages/*/**` runtime modules   | ❌ No                  | Use `clientEnv` / `serverEnv` from `@asym/env` |
| `packages/*/**` build-time config | ⚠️ Gradual             | Migrate opportunistically; document exceptions |
