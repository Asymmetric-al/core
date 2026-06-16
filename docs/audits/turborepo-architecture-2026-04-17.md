# Turborepo architecture & consistency review — 2026-04-17

Scope: whole-repo audit (cron-triggered weekly review). The active branch
`cursor/turborepo-architecture-review-16a1` has **no diff** against its base
`production`, so this report evaluates the current state of `production` itself rather
than a specific PR. The findings still aim to be high-signal and actionable
on a single follow-up PR.

Turborepo version in `devDependencies`: `turbo@^2.9.5`. Package manager:
`bun@1.3.4`. Workspaces: `apps/*`, `packages/*`, `packages/env`,
`tooling/*`.

---

## 1. Summary

The repo has a clean, conventional Turborepo shape: three Next.js apps under
`apps/*`, a healthy set of internal `@asym/*` packages under `packages/*`,
shared toolchain configs under `tooling/*`, a single root `turbo.json`,
and a single `bun.lock` lockfile. Apps depend on internal packages
through `workspace:*`, and Next.js `transpilePackages` is wired to the
internal packages.

It is **mostly aligned with Turborepo best practices**, but the repo is
leaving meaningful Turbo value on the table and has a few real
consistency issues that are worth fixing in a focused, surgical PR
before they become harder to undo:

- The root `package.json` is acting partly like an app: it carries
  runtime dependencies (`@asym/*` workspace packages, `next`, `graphql`,
  `graphql-yoga`, `sharp`, `@tailwindcss/typography`,
  `require-in-the-middle`) that no Turbo task in the root actually
  needs. This blurs the "root should be repo-management only" rule and
  inflates installs for every CI job.
- Several headline scripts bypass the Turbo task graph: `bun run
test:unit` (root `vitest run`), `bun run test:e2e*`, `bun run
format:check`, and `bun run cms:*` / `bun run legal:*` use
  `bun run --cwd <app> ...` instead of `turbo run <task> --filter=...`.
  This produces uncached, repeated work in CI and breaks Turbo's
  affected/changed-only execution model. CI also runs `bun run test:unit`
  directly, not `turbo run test:unit`, so the `test:unit` Turbo task is
  effectively unused.
- Caching: there is **no Remote Cache** wiring for Vercel deploys (only
  GHA local cache via `actions/cache@v4` keyed by `github.sha`, which
  almost never restores). `TURBO_TOKEN`/`TURBO_TEAM` are passed but not
  effective because there is no `vercel link`/Remote Cache setup
  recorded for CI.
- Task graph quality: lint/typecheck/test depend on a synthetic
  `transit` task that **no package defines** — it is a no-op. The intent
  (treat `^transit` as "ensure upstream packages are reachable before
  downstream lints") is reasonable but underdocumented, and several
  package outputs/inputs are inconsistent with what `tsc --noEmit`
  actually produces (no `dist/**`, but root build outputs claim
  `dist/**`).
- Boundaries: there is no `turbo.json` `boundaries` configuration and no
  package-level `turbo.json` overrides. The repo would benefit from
  enabling `turbo boundaries` once per-package overrides are in place
  for the few packages that need different inputs/outputs (notably
  `packages/database` which holds `react`/TanStack runtime code, and
  `packages/api` which depends on `next`).
- Dependency placement: a few real misplacements exist. The root
  `package.json` declares many UI/runtime deps; `packages/api` declares
  `stripe` while only `apps/donor` is the real Stripe consumer; and the
  Tailwind v4 toolchain (`@tailwindcss/postcss`, `@tailwindcss/typography`,
  `tw-animate-css`) is split between root and individual apps in an
  inconsistent way.

Net effect on Turbo value: build/lint/typecheck cache **does** work
locally; CI cache hits are rare; tests and e2e never participate; root
package widening hurts every CI job by inflating `bun install
--frozen-lockfile`. The fixes are small and don't require restructuring
apps or packages.

Verdict: **Mostly aligned, with improvements recommended.**

---

## 2. Confirmed Turborepo consistency issues

### Issue 1 — Root `package.json` is not "repo management only"

**Severity:** High

**File / lines:** `package.json` `dependencies` / `devDependencies` (line numbers drift with edits; verify in-tree)

**Turbo area:** workspace structure / dependency placement

**What is wrong**

The root `package.json` declares runtime dependencies that only apps
use:

```package.json
  "dependencies": {
    "@asym/auth": "workspace:*",
    "@asym/config": "workspace:*",
    "@asym/database": "workspace:*",
    "@asym/email": "workspace:*",
    "@asym/env": "workspace:*",
    "@asym/graphql": "workspace:*",
    "@asym/lib": "workspace:*",
    "@asym/ui": "workspace:*",
    "@tailwindcss/typography": "^0.5.19",
    "graphql": "16.12.0",
    "graphql-yoga": "5.17.1",
    "next": "16.2.1",
    "require-in-the-middle": "^8.0.1",
    "sharp": "^0.34.5"
  },
```

_(Snapshot aligned with `production` after workspace Tiptap usage moved to `packages/ui`; root no longer lists `@tiptap/*`.)_

None of these are imported by code that lives in the repo root. The
`@asym/*` workspace deps in the root let root-level test files and
`scripts/*` resolve them, but the right place for that is either
`devDependencies` or moving the test/script entrypoints into a workspace
package.

**Why it matters for this monorepo**

- Every CI job runs `bun install --frozen-lockfile` in the workspace
  root and pays the install cost for these unrelated runtime deps even
  for jobs that don't need them (lint, typecheck, format).
- It hides the real "small repo-management package" shape that Turborepo
  expects. New contributors and codemods reasoning about ownership see a
  root that looks like an app.
- A future `turbo prune --scope=@asym/donor` will copy a root that still
  carries unrelated runtime deps, defeating one of the main reasons to
  prune for Docker / serverless deploys.

**Technical explanation**

Turborepo's package graph is computed from `package.json` `dependencies`
and `devDependencies`. The root is a workspace, but it is not produced
by `turbo prune` and is not deployed. Putting runtime deps there
inflates the install graph globally, weakens
`turbo run build --filter=@asym/donor...` because it pulls more than the
filter actually needs, and complicates `turbo prune` payloads for
deploys.

**Plain language explanation**

The "front door" of the repo (the root `package.json`) currently
declares grocery items that only specific apps need. That makes every CI
machine carry around extras it never uses, and it makes the repo look
like it has one giant app at the root, which it doesn't.

---

### Issue 2 — Vitest runs outside Turbo, so `test:unit` Turbo task is dead

**Severity:** High

**File / lines:** `package.json` lines 42–45 and `turbo.json` lines 75–86;
`.github/workflows/ci.yml` line 124

**Turbo area:** task graph / caching

**What is wrong**

Root scripts call `vitest` directly:

```42:45:package.json
    "check": "bun run lint && bun run typecheck && bun run test:unit",
    "test": "bun run test:unit",
    "test:unit": "vitest run --coverage",
    "test:unit:cms": "vitest run tests/unit/cms",
```

CI also calls `bun run test:unit` (not `turbo run test:unit`):

```122:124:.github/workflows/ci.yml
      - run: bun install --frozen-lockfile
      - name: Run unit tests
        run: bun run test:unit
```

Meanwhile `turbo.json` defines a `test:unit` task with cache, outputs,
and `dependsOn: [transit]`:

```75:86:turbo.json
    "test:unit": {
      "dependsOn": ["transit"],
      "outputs": ["coverage/**"],
      "passThroughEnv": [
        "CI",
        "NODE_OPTIONS",
        "VITEST_*",
        "DEBUG",
        "FORCE_COLOR",
        "NO_COLOR"
      ]
    },
```

No package implements a `test:unit` script, and root `test:unit` doesn't
go through Turbo. The Turbo task is effectively dead config.

**Why it matters**

- Unit tests never participate in Turbo's cache or task graph. Every CI
  run re-executes the full vitest suite even if only docs changed.
- `turbo run test:unit --filter=...[origin/production]` would let CI run only
  affected workspaces. Today, that capability is unreachable because all
  tests live at the repo root and aren't fronted by Turbo.
- The same pattern applies to `format:check`, `test:e2e*`, and CMS/legal
  scripts that use `bun run --cwd <app>`.

**Technical explanation**

Turborepo only caches and parallelizes work it executes. Running
`vitest` directly bypasses both the package graph (no `^build` ordering)
and the cache (no input hashing). `bun run --cwd apps/admin cms:migrate`
is a workspace passthrough — Turbo never sees it, so it can't dedupe or
cache.

**Plain language explanation**

The repo has a configured "smart test runner" that knows what changed
and can skip tests it already ran, but the actual test command goes
around it. So CI re-runs every test every time, even when nothing
relevant changed.

---

### Issue 3 — `transit` ghost task creates implicit, undocumented contract

**Severity:** Medium

**File / lines:** `turbo.json` lines 12–14, 47, 58, 63, 76

**Turbo area:** task graph

**What is wrong**

```12:14:turbo.json
    "transit": {
      "dependsOn": ["^transit"]
    },
```

`transit` is referenced as a dependency of `lint`, `typecheck`, `test`,
and `test:unit`, but **no package defines a `transit` script**
(verified: `grep '"transit":' **/package.json` returns no matches in
workspace packages). Turbo treats missing scripts as no-ops, so this
works, but the intent is opaque.

**Why it matters**

- A future contributor adding a real `transit` script to a single
  package will silently change the task graph for every consumer.
- Turbo 2 added `with` for task-only ordering hints; using a fake task
  name to encode "make sure upstream is considered" hides the actual
  intent.
- The `^transit` chain currently does nothing useful: because no package
  has a `transit` script, the only effect is that `lint`/`typecheck`
  gain a `dependsOn: ["transit"]` on themselves locally, which still
  resolves to nothing.

**Technical explanation**

The likely intent was "lint/typecheck after upstream packages are
buildable." For TypeScript-as-source consumption (the repo's pattern
via `transpilePackages` and direct `.ts` exports in workspace
`exports`), no upstream build is required. The cleaner expressions are:

- For lint: drop the `transit` dependency (lint does not need upstream
  package output).
- For typecheck: depend on `^typecheck` if you want TS-project-reference
  ordering, otherwise drop it.
- For build: keep `dependsOn: ["^build"]` (already correct).

**Plain language explanation**

There's a placeholder step called `transit` that doesn't actually do
anything. It's confusing and could quietly break later. Either give it a
real meaning, or delete it.

---

### Issue 4 — `build.outputs` claim `dist/**` and `tsbuildinfo` for Next.js apps that don't emit them

**Severity:** Medium

**File / lines:** `turbo.json` lines 15–24

**Turbo area:** caching / outputs

**What is wrong**

```15:24:turbo.json
    "build": {
      "dependsOn": ["^build"],
      "outputs": [
        ".next/**",
        "!.next/cache/**",
        "dist/**",
        "tsconfig.tsbuildinfo",
        "*.tsbuildinfo",
        "**/*.tsbuildinfo"
      ],
```

But every internal package's `build` script is `tsc --noEmit`:

```50:52:packages/ui/package.json
    "build": "tsc --noEmit",
```

`--noEmit` produces no `dist/**` and no real `tsbuildinfo`. This means:

- Apps cache `.next/**` correctly (good).
- Internal packages cache nothing on `build`, but Turbo records a hit
  anyway because the script "succeeded with no outputs". On a cache
  restore, downstream consumers get nothing they didn't already have
  from `.ts` source.
- Listing `dist/**` and `*.tsbuildinfo` in root outputs is misleading —
  if a future package starts emitting `dist/**`, the root array applies,
  but no current package needs them.

**Why it matters**

This obscures whether internal package "builds" are actually doing
anything. Today they are pure `typecheck` runs masquerading as `build`,
which means `bun run build` runs effectively `tsc --noEmit` twice
(once as `build`, once as `typecheck`) per package.

**Technical explanation**

Either:

1. Remove the `build` script from packages that have nothing to emit
   and let `dependsOn: ["^build"]` resolve to no-ops upstream, or
2. Make `packages/*` build scripts `: # no-op` and rely solely on
   `typecheck`, or
3. If a package is intended to ship a real build later, set
   `outputs: ["dist/**"]` only in that package's `turbo.json` extension.

Then trim the root `build.outputs` to `.next/**` + `!.next/cache/**`
plus the genuinely emitted artifacts.

**Plain language explanation**

The cache configuration claims it's saving build outputs that nothing
actually creates. It's not breaking anything, but it's making the
config look like it's doing more than it is.

---

### Issue 5 — `packages/api` declares `stripe` but only `apps/donor` consumes it

**Severity:** Medium

**File / lines:** `packages/api/package.json` lines 60–69; `apps/donor/package.json` line 46

**Turbo area:** dependency placement / package graph

**What is wrong**

`packages/api` lists `stripe` as a dependency:

```60:69:packages/api/package.json
  "dependencies": {
    "@asym/auth": "workspace:*",
    "@asym/database": "workspace:*",
    "@asym/env": "workspace:*",
    "@asym/lib": "workspace:*",
    "@supabase/ssr": "^0.8.0",
    "next": "16.2.1",
    "stripe": "^17.7.0",
    "zod": "^4.3.6"
  },
```

`apps/donor` also declares `stripe@^17.7.0`. `apps/admin` and
`apps/missionary` do not depend on Stripe, but they import `@asym/api`
broadly, which forces Turbo to invalidate them whenever Stripe-only
modules in `@asym/api` change. Worse, transitive resolution pulls
`stripe` into `apps/admin` and `apps/missionary`'s dep graph and
install set.

**Why it matters**

- Cache invalidation widens unnecessarily: a Stripe-only change in
  `@asym/api/donate/*` invalidates admin and missionary builds.
- Donor's deploy bundles include Stripe (correct). Admin/missionary's
  install graph also gets Stripe (incorrect).

**Technical explanation**

Either split Stripe-touching code into a `@asym/api/donate` subpackage
(e.g. `packages/api-donate`), or move Stripe to a `peerDependency` of
`@asym/api` declared as optional, with the donor app supplying the
dependency. The cleanest split is a new package — Turborepo benefits
strongly from narrow packages.

**Plain language explanation**

A library used by all three apps is carrying a payment-processor
dependency that only one app needs. That makes the other two apps
rebuild and re-install more than they should.

---

### Issue 6 — `eslint`, `typescript`, `tailwindcss`, `postcss` duplicated in every app and the root

**Severity:** Medium

**File / lines:** root `package.json` lines 144, 153, 156, 159; each app `package.json` `devDependencies`

**Turbo area:** dependency placement / hygiene

**What is wrong**

`eslint`, `typescript`, `postcss`, `tailwindcss` are all declared at the
root and again in every app. With Bun workspaces this resolves to
hoisted versions, but the per-package version pins drift:

- Root: `typescript@5.9.3` (pinned)
- Each app: `typescript@^5.7.3` (caret)

The same drift exists for `tailwindcss` (root `^4`, apps `^4.1.0`),
`react`/`react-dom` (root pinned `19.2.3`, packages `^19.0.0`), and
`@types/react` (root `^19.2.7`, apps `^19.2.14`).

**Why it matters**

- Bun resolves to the highest matching range, which usually works, but
  silent version drift across packages can cause subtle TS/ESLint
  behavior differences during partial installs (e.g. `turbo prune`
  outputs).
- It violates the principle that toolchain versions should be the same
  across the monorepo unless a package has a documented reason.

**Technical explanation**

Either:

1. Hoist to root only (use `peerDependencies` from packages where
   needed) and remove duplicates from apps, or
2. Use Bun's `overrides`/`resolutions` to pin a single version of each
   toolchain dep across the workspace.

Option 1 fits Turborepo conventions; option 2 fits Bun-specific patterns
without restructure.

**Plain language explanation**

The same tools are declared in many places with slightly different
version rules. They mostly resolve the same, but the rules are
inconsistent and could silently drift.

---

### Issue 7 — No `boundaries` rules; no per-package `turbo.json`

**Severity:** Medium (architectural)

**File / lines:** root `turbo.json` (no `boundaries` section); `packages/*` (no `turbo.json` files)

**Turbo area:** boundaries / package boundaries

**What is wrong**

Turbo 2 supports `turbo boundaries` for enforcing import rules across
packages. The repo has none. It also has no per-package `turbo.json`,
which is fine today but means inputs/outputs cannot be tightened per
package without changing the root.

Concretely, there's nothing preventing:

- `packages/ui` from importing `@asym/api` (a server-leaning package)
- `packages/database` from importing `@asym/ui` (UI in a data package)
- `packages/lib` from importing app code

Today those mistakes don't appear (verified `packages/ui` does not
import `@asym/database` server modules), but the rules aren't enforced.

**Why it matters**

Boundaries become harder to fix as the repo grows. The current shape is
a perfect time to lock the architecture in with `turbo boundaries`.

**Technical explanation**

Add `boundaries` rules to `turbo.json` (Turbo ≥ 2.5):

```jsonc
{
  "boundaries": {
    "tags": {
      "ui": { "dependencies": { "deny": ["api", "database-server"] } },
      "data": { "dependencies": { "deny": ["ui"] } },
    },
  },
}
```

Then tag each package via a per-package `turbo.json` that extends the
root. Run `bunx turbo boundaries` in CI as part of the lint job.

**Plain language explanation**

There are no rules stopping someone from accidentally importing a UI
component from inside a data layer (or vice versa). The repo is clean
right now; locking in those rules now is much easier than later.

---

## 3. Missed Turborepo opportunities

### Opportunity A — Wire Vercel Remote Cache for CI properly

**Impact:** High

**Files:** `.github/workflows/ci.yml` (every job), root `turbo.json`

**What could be improved**

CI currently uses GHA's local cache keyed by `github.sha`:

```26:30:.github/workflows/ci.yml
      - uses: actions/cache@v4
        with:
          path: .turbo
          key: turbo-${{ runner.os }}-${{ github.sha }}
          restore-keys: turbo-${{ runner.os }}-
```

`TURBO_TOKEN`/`TURBO_TEAM` are passed but there is no `vercel link` /
remote-cache identifier and no validation that the team is reachable.
Each commit gets a fresh cache key (`github.sha`), so restores rely on
the `restore-keys` fallback only.

**Why it matters**

- Vercel deploys (donor/admin/missionary) cannot share build artifacts
  with GHA. Every push triggers redundant work.
- With Remote Cache, `turbo run build --filter=...` between Vercel and
  CI would commonly be a cache hit when only docs/test files changed.

**Technical explanation**

1. Run `bunx turbo login && bunx turbo link` once and commit the resulting
   `.turbo/config.json` (or set `TURBO_TEAM` + `TURBO_TOKEN` and rely on
   env-based linking).
2. Drop the `actions/cache@v4` step (Remote Cache supersedes it) or keep
   it as a small local fallback.
3. Make sure Vercel project settings use `bun run build:<app>` (which
   already routes through Turbo for the per-app filter).

**Plain language explanation**

The repo is paying for a shared remote cache (the env vars are wired)
but isn't actually using it. Turning it on would make pull requests and
deploys much faster without changing any code.

---

### Opportunity B — Replace root passthrough scripts with Turbo filters

**Impact:** Medium

**Files:** `package.json` lines 75–83, 101–106; CI workflow

**What could be improved**

Many root scripts use `bun run --cwd <app> ...`:

```75:83:package.json
    "legal:validate": "bun run --cwd apps/donor legal:validate",
    "legal:generate:md": "bun run --cwd apps/donor legal:generate:md",
    "legal:generate:html": "bun run --cwd apps/donor legal:generate:html",
    "legal:generate:pdf": "bun run --cwd apps/donor legal:generate:pdf",
    "legal:generate:all": "bun run --cwd apps/donor legal:generate:all",
    "cms:migrate": "bun run --cwd apps/admin cms:migrate",
    "cms:migrate:create": "bun run --cwd apps/admin cms:migrate:create",
    "cms:migrate:status": "bun run --cwd apps/admin cms:migrate:status",
    "cms:importmap": "bun run --cwd apps/admin cms:importmap",
```

These bypass Turbo entirely.

**Why it matters**

Even commands that legitimately don't need caching (like `cms:migrate`)
benefit from Turbo's task graph because they pick up the right
environment, the right `passThroughEnv`, and remain visible in the task
graph for `turbo query`. CI workflows that script around Turbo are also
harder to evolve.

**Technical explanation**

Define a non-cached Turbo task per script and route through filters,
e.g.:

```jsonc
"cms:migrate": { "cache": false, "passThroughEnv": ["DATABASE_URL", "PAYLOAD_*"] }
```

Then change root scripts to:

```jsonc
"cms:migrate": "turbo run cms:migrate --filter=@asym/admin"
```

**Plain language explanation**

Several "shortcuts" at the root jump straight into a single app instead
of going through the build runner. That works, but it makes the build
runner blind to those tasks and harder to reason about.

---

### Opportunity C — Use `turbo run typecheck --filter=...` and `--affected` in CI

**Impact:** Medium

**Files:** `.github/workflows/ci.yml`

**What could be improved**

CI runs `bun run typecheck` and `bun run lint` (which call
`turbo run ...`) without `--affected` filters. On a docs-only PR the
full graph still runs.

**Technical explanation**

Use `turbo run lint typecheck build test:unit --affected` (Turbo 2's
`--affected`) or the older `--filter='...[origin/${{ github.base_ref }}]'`
on PRs.

**Plain language explanation**

CI runs every check on every change instead of just the parts affected
by the change. Turning on the "only affected" mode would cut PR build
times noticeably.

---

### Opportunity D — Adopt `turbo prune` for Vercel deploys

**Impact:** Medium (deploy speed; image size)

**Files:** `apps/*/vercel.json`

**What could be improved**

The current `vercel.json` files only opt out of branch deploys:

```1:10:apps/donor/vercel.json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "git": {
    "deploymentEnabled": {
      "main": false,
      "develop": false,
      "production": false
    }
  }
}
```

There is no `installCommand` / `buildCommand` that uses `turbo prune`
to reduce the deploy context.

**Technical explanation**

For Vercel monorepos, the recommended pattern is to set
`buildCommand: "cd ../.. && bunx turbo run build --filter=@asym/donor..."`
and use the project's Root Directory. Even more aggressively, run
`bunx turbo prune --scope=@asym/donor --docker` in a CI step that
uploads a pruned bundle for self-hosted/Docker deploys (not needed for
Vercel today, but useful when introducing a worker/queue service).

**Plain language explanation**

When deploying, the build pulls in the whole monorepo. Turbo has a tool
that ships only what each app needs, which makes deploys smaller and
faster.

---

### Opportunity E — Stop repeating `tsc --noEmit` as both `build` and `typecheck`

**Impact:** Low/Medium

**Files:** `packages/{api,auth,config,database,email,env,graphql,lib,missionary,ui}/package.json`

**What could be improved**

Every package has identical `build` and `typecheck` scripts: `tsc
--noEmit`. Running `bun run check` ends up running each twice.

**Technical explanation**

Either:

1. Remove `build` from packages that don't emit and rely on `typecheck`
   for type validation, or
2. Make `build` produce real output (`tsc -b` with project references)
   so the cache has something to restore, plus update root `outputs` to
   `dist/**` for those packages via per-package `turbo.json`.

Option 1 is the smallest change today. Option 2 unlocks faster
downstream typechecks via project references.

**Plain language explanation**

Each package does the same type-check work twice under different names.
Deleting one removes wasted work without losing safety.

---

### Opportunity F — Tighten `build.env` to per-app subsets

**Impact:** Low/Medium

**Files:** `turbo.json` lines 25–43

**What could be improved**

```25:43:turbo.json
      "env": [
        "NODE_ENV",
        "NEXT_PUBLIC_*",
        "GOOGLE_SITE_VERIFICATION",
        "BING_SITE_VERIFICATION",
        "SUPABASE_*",
        "PAYLOAD_SECRET",
        "DATABASE_URL",
        "PAYLOAD_DATABASE_URI",
        "DONOR_APP_URL",
        "SKIP_ENV_VALIDATION",
        "RESEND_API_KEY",
        "RESEND_WEBHOOK_SECRET",
        "RESEND_ENCRYPTION_KEY",
        "SENTRY_DSN",
        "CLOUDINARY_API_SECRET",
        "ALLOW_DEMO_ACCOUNTS",
        "DEMO_ONLY_LOGIN"
      ],
```

`PAYLOAD_*` is admin-only. `RESEND_*` is admin-only. `DONOR_APP_URL` is
donor-only. Hashing them globally means a Resend API key rotation
invalidates donor builds too.

**Technical explanation**

Move app-specific env vars into per-package `turbo.json` overrides:

```jsonc
// apps/admin/turbo.json
{
  "extends": ["//"],
  "tasks": {
    "build": { "env": ["PAYLOAD_*", "RESEND_*"] },
  },
}
```

Note: arrays in package configs **override** root arrays (Turbo does not
extend them). So the per-package array must include everything the
package needs.

**Plain language explanation**

Today, rotating a key for one app invalidates the cached builds of all
apps. Pinning each app's env list locally would stop that.

---

### Opportunity G — Add `format` and `verify:*` as Turbo tasks

**Impact:** Low

**Files:** `package.json` lines 35–37, 67–73

**What could be improved**

`bun run format`, `format:check`, and the `verify:*` scripts run
directly. Wrapping them as cached Turbo tasks would let them
participate in the change-detection model and benefit from Remote
Cache.

**Plain language explanation**

A few quality-check commands skip the build runner. Wiring them in
gives them the same "skip if nothing changed" benefit.

---

## 4. Watchlist

These are lower-confidence concerns worth validating before acting.

- **Workspaces overlap.** Root `package.json` lists `"packages/env"`
  explicitly even though `"packages/*"` already matches it
  (`package.json` lines 7–12). Bun tolerates this, but it's redundant
  and confusing. Assumption: this was added defensively when `env` was
  first split out; it can be deleted.
- **`@asym/ui` peer + dev React.** `packages/ui/package.json` declares
  `react`/`react-dom` as both `peerDependencies` and `devDependencies`,
  and the dev versions are caret while peers are `^18.0.0 || ^19.0.0`.
  Apps pin `19.2.3`. Bun should resolve this consistently, but it's
  worth confirming the dedupe across CI installs (`bun pm ls react`).
- **`graphql` and `graphql-yoga` at the root.** They appear unused at
  root and are also declared (with a slightly different `graphql-yoga`
  patch) inside `packages/graphql`. Worth tracing whether anything in
  `scripts/` actually imports them from the root.
- **`require-in-the-middle` at root.** Looks like Sentry's instrumentation
  hook dependency. If Sentry is initialized only inside `@asym/lib`,
  this should move there.
- **`canvas` at root (`devDependencies`).** Native build with system
  packages installed in CI for every job (libpixman, libcairo, etc.).
  If only one test/package needs `canvas`, scope the install to that
  job and move the dep into the right package.
- **`vitest.config.ts` lives at the repo root and globs across `tests/`,
  `packages/api/tests/`, `packages/auth/`.** This works today but
  prevents per-package vitest configs and per-package Turbo `test:unit`
  caching. A future refactor that moves tests into their respective
  packages would make `turbo run test:unit --filter=...` viable.

---

## 5. Recommended changes before merge

Order them small-to-large; the first three are cheap wins.

1. **Stop running tests outside Turbo.** Either change `package.json`
   `test:unit` to `turbo run test:unit` and add a `test:unit` script in
   each package that owns tests, or (smaller) keep root vitest but
   delete the `test:unit` task from `turbo.json` to remove dead config.
   Update CI to call the resulting command.

2. **Fix or delete the `transit` task.** Either rename it to a real,
   documented task (e.g. `prepare-source` with a `: # noop` placeholder
   in every package) or delete it and switch `lint`/`typecheck`/`test`
   to `dependsOn: ["^typecheck"]` (or nothing).

3. **Trim root `dependencies`.** Move `next`, `graphql`, `graphql-yoga`,
   `sharp`, `@tailwindcss/typography`,
   `require-in-the-middle`, and the `@asym/*` workspace deps into the
   packages and apps that actually use them. Keep root limited to
   repo-wide tooling.

4. **Wire Vercel Remote Cache.** Run `bunx turbo link`, ensure
   `TURBO_TOKEN`/`TURBO_TEAM` are present in CI, and remove (or shrink)
   the GHA `actions/cache@v4` step. Verify with `turbo run build --dry`
   that CI hits the remote cache.

5. **Move Stripe out of `packages/api`.** Either split a
   `@asym/api-donate` subpackage or convert `stripe` to an optional
   `peerDependency` of `@asym/api` with the donor app providing the
   real install.

6. **Tighten `build.env` per app via per-package `turbo.json` extends.**
   Move `PAYLOAD_*` and `RESEND_*` to `apps/admin/turbo.json` (and
   `packages/email/turbo.json` if needed) and `DONOR_APP_URL` to
   `apps/donor/turbo.json`.

7. **Replace passthrough scripts with Turbo filters.** Convert root
   `cms:*`, `legal:*`, and `boneyard:*` scripts to
   `turbo run <task> --filter=<scope>` and add the matching tasks to
   `turbo.json` (with `cache: false` where appropriate).

8. **Add a typed boundary baseline.** Introduce
   `turbo boundaries` rules and tag packages via per-package
   `turbo.json` `extends`. Add `bunx turbo boundaries` to the lint job.

9. **Use `--affected` in CI** for `lint`, `typecheck`, and
   `test:unit` jobs on PRs to skip work for unrelated changes.

10. **Reconcile toolchain versions.** Pin `typescript`, `tailwindcss`,
    `react`, `react-dom`, `eslint` once at the root and remove from
    apps (or use Bun overrides). This prevents silent drift.

---

## 6. Optional Cursor prompt

Use this prompt to drive the smallest safe fix in a follow-up PR:

> Do the following minimal Turborepo cleanup without changing app
> behavior or restructuring packages:
>
> 1. In `package.json`, move runtime dependencies that are not used by
>    any code in the repo root out of `dependencies`:
>    - Move `@asym/auth`, `@asym/config`, `@asym/database`, `@asym/email`,
>      `@asym/env`, `@asym/graphql`, `@asym/lib`, `@asym/ui`, `next`,
>      `graphql`, `graphql-yoga`, `sharp`,
>      `@tailwindcss/typography`, and `require-in-the-middle` into the
>      apps/packages that import them. Run `bun install` and update
>      `bun.lock`.
> 2. Remove `"packages/env"` from root `workspaces` (it is already
>    matched by `"packages/*"`).
> 3. In `turbo.json`, delete the `transit` task and remove `transit`
>    from `dependsOn` of `lint`, `typecheck`, `test`, and `test:unit`.
>    Set `lint.dependsOn` to `[]` and `typecheck.dependsOn` to
>    `["^typecheck"]`.
> 4. In `turbo.json`, trim `build.outputs` to
>    `[".next/**", "!.next/cache/**"]`. If a package later emits
>    `dist/**` or `tsbuildinfo`, add it back via that package's
>    `turbo.json`.
> 5. In `turbo.json`, delete the `test:unit` task (since the root
>    `test:unit` script bypasses Turbo). Or, if you want to use Turbo
>    for tests, change root `test:unit` to `turbo run test:unit` and
>    add `test:unit: vitest run` in the packages that own tests.
> 6. In `.github/workflows/ci.yml`, replace `bun run test:unit` with
>    whichever of step (5) you chose. For `lint`, `typecheck`, `build`
>    jobs, change the command to
>    `bunx turbo run <task> --affected` on `pull_request` events.
> 7. In `apps/admin/turbo.json` (new file) and `apps/donor/turbo.json`
>    (new file), add `extends: ["//"]` and override `build.env` to
>    include only the env vars that app actually uses (`PAYLOAD_*`,
>    `RESEND_*` for admin; `DONOR_APP_URL` for donor). Remove those
>    keys from root `build.env`.
> 8. In `packages/api/package.json`, change `stripe` from a hard
>    dependency to an optional `peerDependency`. Confirm `apps/donor`
>    still declares its own `stripe` dependency.
>
> Do not refactor app code. Do not rename packages. After the change,
> run `bun install --frozen-lockfile`, `bunx turbo run lint typecheck
build --dry-run`, and `bun run check`. Verify there are no new
> errors and that `turbo run build --filter=@asym/donor` succeeds.

---

## 7. Final verdict

**Mostly aligned, with improvements recommended.**

The structure is good: clear `apps/` vs `packages/` vs `tooling/` split,
a single root `turbo.json`, workspace deps on `workspace:*`, and a
single Bun lockfile. The main losses are (1) tests bypassing Turbo,
(2) a noisy/over-broad root `package.json`, and (3) Remote Cache that
isn't actually wired even though the secrets are present. Each is
fixable in a focused PR without restructuring apps or packages, and
each pays off on every CI run after the fix.
