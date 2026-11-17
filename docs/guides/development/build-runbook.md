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

- Most shared packages define `build` as `tsc --noEmit` (type-check only). Eve
  emits runtime artifacts; its qualification boundary is described below.
- Example: `bunx turbo run build --filter=@asym/ui` now executes the `@asym/ui` package build task.
- Turbo `build` caching tracks app artifacts (`.next/**`) and package/typecheck artifacts (`dist/**`, `*.tsbuildinfo`).
- Cache output globs in `turbo.json` must never match workspace links under `node_modules`. Use package-relative globs (`*.tsbuildinfo`, `dist/*.tsbuildinfo`), not recursive ones (`**/*.tsbuildinfo`), and keep the `"!**/node_modules/**"` guard in `build.outputs` / `typecheck.outputs`. See [`TS6059` after a cached `typecheck`](#ts6059-after-a-cached-typecheck-workspace-symlinks-replaced-by-real-directories).
- For troubleshooting, use Turbo filters directly: `bunx turbo run build --filter=@asym/<package>`.

## Eve artifacts and qualification

The generic web build planner sets `CORE_EVE_BUILD_MODE=artifacts` for its
children. Eve 0.25.1 then compiles with `--skip-sandbox-prewarm`; this applies to
both dependency and app phases without changing Turbo's dependency order.
Admin uses `bun run build:service` through the supported `withEve` build-command
option. This stable command selects artifact mode only when it executes on a
hosted preview. Production services retain the full SDK build, even when web
dependencies were compiled in artifact mode. The decision happens at service
execution because the SDK preserves previously generated service commands when
the same checkout builds another target.

These are **unqualified Release-Off artifacts**. They can expose the deployed
candidate for inspection, but do not prove a sandbox template exists or permit
autonomous effects. Auth, governance, policy, audit and release admission remain
unchanged. The bundled Vercel runtime refuses a missing sandbox template; preview
health or web smoke success is not sandbox qualification.

- `bun run --cwd packages/eve-runtime build` defaults to the full SDK build when
  `CORE_EVE_BUILD_MODE` is unset. Unknown modes fail before the SDK starts.
- `bun run --cwd packages/eve-runtime build:artifacts` explicitly compiles only.
- `bun run --cwd packages/eve-runtime build:full` always selects the full SDK
  build, including Vercel sandbox prewarming in a Vercel-targeted environment.

Turbo hashes the mode and does not cache the Eve `build` task. An artifact build
or an earlier prewarm cannot be replayed as new provider qualification. A local
non-Vercel build remains local compilation under the SDK's own behavior.

Before release, run full qualification in the correctly configured, authorized
target environment and collect the exact target-bound evidence required by the
[Eve launch runbook](../operations/eve-launch.md). Missing credentials, unavailable
governance, Release Off, or a denied prewarm remain qualification blockers. Do
not enable release to make CI pass or count artifact compilation as that proof.

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
> Use `bun run build:admin` to run the CI build planner with CI-safe defaults,
> including `PAYLOAD_SECRET`. Use `bun run build:admin:strict` only when real
> environment values are present; strict mode deliberately bypasses those
> defaults to validate the deployment environment. On Windows, the CI build
> planner runs app builds directly through Bun to avoid Turbo wrapper hangs
> after successful Next builds.

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

### `TS6059` after a cached `typecheck` (workspace symlinks replaced by real directories)

Symptom: a cache-hit `bun run typecheck` or build is immediately followed by errors that look like
code defects, such as `TS6059: File '.../packages/lib/responsive.ts' is not under 'rootDir'
'.../packages/ui'` or `TS2307: Cannot find module '@asym/mock-data'` in `apps/donor`, and
`ls -la packages/ui/node_modules/@asym/` shows `lib`, `auth`, and `database` as real directories
(holding only `dist/*.tsbuildinfo`) instead of symlinks into `packages/*`.

`tsc` writes `.tsbuildinfo` through the Bun workspace symlinks, so an unanchored output glob such as
`**/*.tsbuildinfo` captures `packages/ui/node_modules/@asym/lib/dist/tsconfig.tsbuildinfo`; restoring
that cached output materializes a real directory over the symlink.

Fix:

- Keep `turbo.json` `outputs` anchored to where `tsc` writes — `*.tsbuildinfo` at the package root
  and `dist/*.tsbuildinfo` — with `"!**/node_modules/**"` on both `build` and `typecheck`.
- Revisit that guard if Next.js `output: "standalone"` is enabled; standalone builds emit required
  dependencies into `.next/standalone/node_modules`.
- Repair an already-corrupted workspace with `node scripts/repair-workspace-links.mjs`. It replaces
  hollow `node_modules/@asym/*` directories (no `package.json`) with links to the workspace
  packages, and also runs as the root `postinstall` and inside `scripts/verify/ci-build.mjs`.
