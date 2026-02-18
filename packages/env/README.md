# @asym/env

Shared environment schema package for Asymmetric.al. This package defines the typed `createEnv` contract for variables listed in `.env.example` and exports a validated `env` object for workspace consumers.

## Import Example

```ts
import { env } from "@asym/env";

const url = env.NEXT_PUBLIC_SUPABASE_URL;
```

## Required Vars

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

All other variables from `.env.example` are modeled in `packages/env/src/schema.ts` as optional unless otherwise noted by feature-specific docs.

## Migration Policy

| Change                    | Required updates                                                                      | Notes                                                      |
| ------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Add env var               | Update `.env.example`, add schema entry, add `runtimeEnv` mapping, update README/docs | Choose `server` vs `client` based on `NEXT_PUBLIC_` prefix |
| Change validation         | Update `packages/env/src/schema.ts` and docs                                          | Keep changes backwards-compatible when possible            |
| Remove env var            | Remove from `.env.example`, schema, and `runtimeEnv`; document migration              | Coordinate app/package cleanup before removal              |
| Make optional -> required | Update schema + required list + contributor docs                                      | Treat as breaking for local setup/CI expectations          |
| Make required -> optional | Update schema + required list + docs                                                  | Confirm fallback behavior in consuming code                |

## Add a New Env Var

1. Add the variable to `.env.example` with a safe placeholder/default.
2. Add the variable to `server` or `client` in `packages/env/src/schema.ts`.
3. Add the variable to `runtimeEnv` in `packages/env/src/schema.ts`.
4. Update this README and any feature docs that depend on it.
5. Run `bun run --filter @asym/env typecheck` and `bun run --filter @asym/env lint`.

## Skip Validation In Tests

```bash
SKIP_ENV_VALIDATION=1 bun test
```

## Where `process.env` is Allowed vs Disallowed

| Location                                | `process.env` allowed? | Reason                                         |
| --------------------------------------- | ---------------------- | ---------------------------------------------- |
| `packages/env/src/schema.ts`            | ✅ Yes (required)      | This is the only place that reads raw env vars |
| `scripts/*.mjs`, `scripts/*.ts`         | ✅ Yes                 | Tooling scripts run outside Next.js runtime    |
| `playwright.config.ts`                  | ✅ Yes                 | Test runner config, not app runtime            |
| `apps/*/app/**`                         | ❌ No                  | Use `import { env } from "@asym/env"` instead  |
| `packages/*/src/**` (runtime)           | ❌ No                  | Use `import { env } from "@asym/env"` instead  |
| `packages/*/src/**` (build-time config) | ⚠️ Gradual             | Migrate opportunistically; document exceptions |

The goal is that all runtime code uses `env.*` for type-safe, validated access. Direct `process.env` usage in runtime code is a Phase 1 migration target.
