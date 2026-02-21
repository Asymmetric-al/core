# Monorepo Build Runbook

This runbook defines the canonical build workflow for the Bun + Turborepo monorepo and matches CI behavior.

## Source of truth

- Root script entrypoints: `package.json`
- Turbo task graph and env hashing: `turbo.json`
- Required env schema: `packages/env/src/schema.ts`
- CI build env strategy: `.github/workflows/ci.yml`

## Canonical build entrypoints

- Full monorepo build: `bun run build` (delegates to `turbo run build`)
- App-scoped builds:
  - `bun run build:admin`
  - `bun run build:donor`
  - `bun run build:missionary`

Notes:

- Internal packages define `build` scripts as `tsc --noEmit` (type-check only, no JavaScript emit).
- Example: `bunx turbo run build --filter=@asym/ui` now executes the `@asym/ui` package build task.
- Turbo `build` caching tracks app artifacts (`.next/**`) and package/typecheck artifacts (`dist/**`, `*.tsbuildinfo`).
- For troubleshooting, use Turbo filters directly: `bunx turbo run build --filter=@asym/<package>`.

## Environment profiles

## 1) Local strict profile (recommended for normal dev)

Use real values in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Then run:

```bash
bun run lint
bun run typecheck
bun run build
```

## 2) CI-equivalent local profile (deterministic build parity)

Use this when you need to reproduce CI build behavior locally without real Supabase credentials.

PowerShell:

```powershell
$env:SKIP_ENV_VALIDATION='1'
$env:NEXT_PUBLIC_SUPABASE_URL='https://example.supabase.co'
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY='example-anon-key'
bun run build
```

Bash:

```bash
SKIP_ENV_VALIDATION=1 \
NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co \
NEXT_PUBLIC_SUPABASE_ANON_KEY=example-anon-key \
bun run build
```

This mirrors CI strategy in `.github/workflows/ci.yml` for the build job.

## Build matrix commands

Use these to isolate failures quickly:

```bash
# Single app
bunx turbo run build --filter=@asym/admin
bunx turbo run build --filter=@asym/donor
bunx turbo run build --filter=@asym/missionary-app

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

## Scoped troubleshooting flow

```bash
bunx turbo run lint --filter=@asym/admin --filter=@asym/donor --filter=@asym/missionary-app
bunx turbo run typecheck --filter=@asym/admin --filter=@asym/donor --filter=@asym/missionary-app
bunx turbo run build --filter=@asym/admin --filter=@asym/donor --filter=@asym/missionary-app
```

## Known failure modes and fixes

### Missing required env vars

Symptom: build fails during env parsing with `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` required.

Fix:

- Provide real values in `.env.local`, or
- use CI-equivalent profile with `SKIP_ENV_VALIDATION=1` and stub values.

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
