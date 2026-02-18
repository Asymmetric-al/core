# @asym/env

Typed, validated environment variable access for the `Asymmetric-al/core` monorepo.

Fails fast on startup if required variables are missing or malformed — no more silent `undefined` bugs in production.

## Usage

```ts
import { env } from "@asym/env";

// Server-side
const key = env.SUPABASE_SERVICE_ROLE_KEY;

// Client-side (NEXT_PUBLIC_* only)
const url = env.NEXT_PUBLIC_SUPABASE_URL;
```

## Required variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |

All other variables are optional and have safe defaults where applicable.

## Migration policy

| Location | `process.env` allowed? |
|---|---|
| `packages/env/src/schema.ts` (runtimeEnv mapping) | ✅ Yes — this is the only place |
| Playwright config, shell scripts, tooling | ✅ Yes — outside Next.js runtime |
| App code (`apps/*`) | ❌ No — use `import { env } from "@asym/env"` |
| Shared packages (`packages/*`) | ❌ Gradual migration — prefer `@asym/env` |

## Adding a new env var

1. Add the variable to `.env.example` with a placeholder value and comment.
2. Add the Zod schema to the correct section (`server` or `client`) in `packages/env/src/schema.ts`.
3. Add the `process.env.VAR_NAME` mapping to `runtimeEnv` in the same file.
4. Import and use `env.VAR_NAME` in your app code.

## Skipping validation (tests / CI)

```sh
SKIP_ENV_VALIDATION=1 bun test
```

This bypasses all Zod validation. Use only in test environments where env vars are not available.