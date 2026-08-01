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
- Cache output globs in `turbo.json` must never be able to match a package's own `node_modules`. Use package-relative globs (`*.tsbuildinfo`, `dist/*.tsbuildinfo`), not recursive ones (`**/*.tsbuildinfo`), and keep the `"!node_modules/**"` guard in `build.outputs` / `typecheck.outputs`. See [Turbo cache restore replaces workspace symlinks](#turbo-cache-restore-replaces-workspace-symlinks).
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
> Use `bun run build:admin` or `bun run build:admin:strict` (both use the CI build planner and
> supply CI-safe defaults including `PAYLOAD_SECRET`), or set a real secret in `.env.local` before
> invoking raw `turbo`. On Windows, the CI build planner runs app builds directly through Bun to avoid
> Turbo wrapper hangs after successful Next builds.

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

### Turbo cache restore replaces workspace symlinks

Symptom: typecheck or build fails immediately after a Turbo cache hit, with errors that look like real code defects but are not:

- `TS6059: File '.../packages/lib/responsive.ts' is not under 'rootDir' '.../packages/ui'` in `packages/ui`
- `TS2307: Cannot find module '@asym/mock-data'` in `apps/donor`

Diagnosis: inspect a workspace link directory, for example `packages/ui/node_modules/@asym/`. If entries such as `auth`, `database`, or `lib` are real directories containing only a `dist/` with a `.tsbuildinfo` inside — instead of symlinks into `packages/*` — the cache restore overwrote them.

Cause: a recursive output glob (`**/*.tsbuildinfo`) matches through the `node_modules/@asym/*` workspace symlinks, so Turbo captures paths like `packages/ui/node_modules/@asym/auth/dist/tsconfig.tsbuildinfo` into the cache artifact. Restoring that artifact materializes those paths as real directories and destroys the symlink. Fixed by scoping `build.outputs` / `typecheck.outputs` in `turbo.json` to package-relative globs plus a `"!node_modules/**"` guard.

The guard is deliberately package-relative (`!node_modules/**`, not `!**/node_modules/**`) so it only excludes a package's own `node_modules`. A bundler may legitimately vendor dependencies _into_ build output — `packages/eve-runtime/.output/server/node_modules/` already does, and Next.js `output: "standalone"` would too — and a recursive exclusion would silently cache those bundles with their dependencies stripped out.

Fix (if you hit a cache artifact written before that fix, e.g. on an older branch): delete the hollow directories, then reinstall. `bun install` on its own does not replace an existing real directory with a symlink, so the delete step is required.

```bash
find packages/*/node_modules/@asym apps/*/node_modules/@asym -maxdepth 1 -mindepth 1 -type d -exec rm -rf {} + && bun install
```

The `-type d` test matches only real directories, so intact symlinks are left alone.

`TURBO_FORCE=true` only bypasses the bad restore for one run; it is a workaround, not a fix.

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

Symptom (Windows): a cache-hit `bun run typecheck` is immediately followed by a failing build, and
`ls -la packages/ui/node_modules/@asym/` shows `lib`, `auth`, and `database` as real directories
instead of symlinks into `packages/*`.

```text
error TS6059: File '.../packages/lib/responsive.ts' is not under 'rootDir' '.../packages/ui'.
```

`tsc` writes `.tsbuildinfo` through the Bun workspace symlinks, so an unanchored output glob such as
`**/*.tsbuildinfo` captures `packages/ui/node_modules/@asym/lib/dist/tsconfig.tsbuildinfo`; restoring
that cached output materializes a real directory over the symlink.

Fix:

- Keep `turbo.json` `outputs` anchored to where `tsc` writes — `*.tsbuildinfo` at the package root
  and `dist/*.tsbuildinfo` — with `"!**/node_modules/**"` on both `build` and `typecheck`.
- Revisit that guard if Next.js `output: "standalone"` is enabled; standalone builds emit required
  dependencies into `.next/standalone/node_modules`.
- Repair an already-corrupted workspace by deleting the clobbered links before reinstalling —
  `bun install` alone leaves them in place:

```bash
find packages apps -path "*/node_modules/@asym/*" -maxdepth 4 -type d '!' -exec test -e "{}/package.json" ';' -print -prune | xargs rm -rf
bun install
```
