# Monorepo Build Runbook

This runbook defines the canonical build workflow for the Bun + Turborepo monorepo and matches CI behavior.

## Source of truth

- Root script entrypoints: `package.json`
- Turbo task graph and env hashing: `turbo.json`
- Required env schema: `packages/env/src/schema.ts`
- CI build env strategy: `.github/workflows/ci.yml`

## Canonical build entrypoints

- Full monorepo build: `bun run build` (CI-equivalent env defaults)
- Full monorepo build (strict): `bun run build:strict` (real env only)
- App-scoped builds:
  - `bun run build:admin`
  - `bun run build:donor`
  - `bun run build:missionary`
  - `bun run build:admin:strict`
  - `bun run build:donor:strict`
  - `bun run build:missionary:strict`

Notes:

- Internal packages define `build` scripts as `tsc --noEmit` (type-check only, no JavaScript emit).
- Example: `bunx turbo run build --filter=@asym/ui` now executes the `@asym/ui` package build task.
- Turbo `build` caching tracks app artifacts (`.next/**`) and package/typecheck artifacts (`dist/**`, `*.tsbuildinfo`).
- For troubleshooting, use Turbo filters directly: `bunx turbo run build --filter=@asym/<package>`.

## Environment profiles

## 1) Default local profile (CI-equivalent)

`bun run build` now injects CI-equivalent defaults when values are missing:

- `SKIP_ENV_VALIDATION=1`
- `NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=example-anon-key`

Run:

```bash
bun run lint
bun run typecheck
bun run build
```

## 2) Strict local profile (real env)

Use real values in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Then run:

```bash
bun run lint
bun run typecheck
bun run build:strict
```

This strict mode is useful when validating real credentials and env shape before release.

## Build matrix commands

Use these to isolate failures quickly:

```bash
# Single app
bun run build:admin
bun run build:donor
bun run build:missionary

# Single app (strict)
bun run build:admin:strict
bun run build:donor:strict
bun run build:missionary:strict

# Single shared package
bunx turbo run build --filter=@asym/ui
```

## Full quality gate (local PR-readiness)

```bash
bun run format:check
bun run lint
bun run typecheck
bun run build
bun run test:unit
```

Extended local validation sweep (includes Playwright + verify + husky prepare):

```bash
bun run validate:full
```

## Scoped troubleshooting flow

```bash
bunx turbo run lint --filter=@asym/admin --filter=@asym/donor --filter=@asym/missionary-app
bunx turbo run typecheck --filter=@asym/admin --filter=@asym/donor --filter=@asym/missionary-app
bunx turbo run build --filter=@asym/admin --filter=@asym/donor --filter=@asym/missionary-app
```

> **Note for `@asym/admin` builds:** `apps/admin` uses Payload CMS and requires `PAYLOAD_SECRET` at
> build time. Running `bunx turbo run build --filter=@asym/admin` directly (without the
> `run-with-ci-env.mjs` wrapper or a real `.env.local`) will fail with
> _"PAYLOAD_SECRET must be configured outside local development"_.
> Use `bun run build:admin` (wrapped) or `bun run build:admin:strict` (with real env) instead.
> This is expected behavior, not a Turborepo regression.

## Known failure modes and fixes

### Missing required env vars

Symptom: build fails during env parsing with `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` required.

Fix:

- Provide real values in `.env.local`, or
- use default commands (`bun run build`, `bun run test:e2e`) which inject CI-equivalent stub values.

### Route segment config incompatibility with Cache Components

Symptom: errors like route segment config `dynamic` / `runtime` incompatible with `nextConfig.cacheComponents`.

Fix:

- Remove conflicting route segment exports from affected `route.ts` files.
- Prefer default route-handler behavior unless a documented override is required.

### Nondeterministic prerender errors (`new Date()`, `Math.random()`)

Symptom: prerender failures on routes that touch time/randomness before request/dynamic APIs.

Fix:

- If route should be request-time rendered, call `await connection()` in the server component/page.
- Or move nondeterministic logic to request-time or client-side paths where appropriate.

### Multiple lockfile warnings during Next.js build

Symptom: warning about inferred workspace root and multiple lockfiles.

Fix:

- Set `turbopack.root` explicitly in each app `next.config.ts` to avoid lockfile-based root auto-detection in nested parent paths.
- Current repo hardening:
  - `apps/admin/next.config.ts`
  - `apps/donor/next.config.ts`
  - `apps/missionary/next.config.ts`
- Use a file-relative absolute path so root resolution does not depend on the shell working directory:
  - `const WORKSPACE_ROOT = fileURLToPath(new URL("../..", import.meta.url))`
  - `turbopack: { root: WORKSPACE_ROOT }`
