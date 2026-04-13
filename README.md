# Asymmetric.al - Kingdom Impact Platform

A Turborepo monorepo using **Next.js 16.2** (App Router) and **Bun**, with three deployable apps (`apps/admin`, `apps/donor`, `apps/missionary`) and shared packages under `packages/*`.

## Quickstart

```bash
bun run setup
# first run creates .env.local with placeholders
# fill these required values, then re-run `bun run setup`:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
bun run dev:donor
# in another terminal:
bun run verify
# `bun run verify` is implemented in `scripts/verify/index.mjs`; on Windows without shims, use Git Bash / WSL: `bash scripts/verify/index.sh`
```

**Required:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
**Optional:** Other entries in `.env.example` (Stripe, demo accounts, etc.)

`bun run dev` runs **all** apps via Turbo (`turbo run dev`). Default HTTP checks in `bun run verify` use **`http://localhost:3000`** (`VERIFY_BASE_URL`), so use `bun run dev:donor` (or point `VERIFY_BASE_URL` at the app you are running).

Per-app dev commands (from root `package.json`):

- `bun run dev:donor` → donor app, port **3000**
- `bun run dev:admin` → admin app, port **3030**
- `bun run dev:missionary` → missionary app, port **4000**

### Cursor Cloud Agent (VM) secrets

For Cursor Cloud Agent runs, set secrets in the Cloud Agent Secrets settings instead of committing values to repo files.

Set these keys in the cloud environment:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (optional, server-only/admin workflows)

Security rules:

- `.env.local` stays local-only and is already gitignored.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in browser/client code.
- Browser login flows require only `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### Windows

Windows PowerShell 5.1:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup.ps1
```

PowerShell 7+:

```powershell
pwsh -File .\scripts\setup.ps1
```

First run creates `.env.local`. Fill these required values, then re-run the setup:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Skip dependency install if you already ran it:

```powershell
pwsh -File .\scripts\setup.ps1 -SkipInstall
```

#### PowerShell script checks (optional)

Install and run PSScriptAnalyzer locally (not required):

```powershell
Install-Module PSScriptAnalyzer -Scope CurrentUser
Invoke-ScriptAnalyzer -Path .\scripts\setup.ps1, .\scripts\lib\*.ps1
```

## Architecture & Tech Stack

- **Framework**: Next.js 16.2 (App Router, Turbopack in app configs)
- **UI**: Tailwind CSS 4, shadcn/ui (Maia theme), Base UI
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (shared helpers in `packages/auth`, `packages/api`)
- **Payments**: Stripe (donor and related flows)
- **State**: React 19 + TanStack Query v5
- **Animation**: `motion` (v12) and shared UI helpers such as `MotionPreset` (`packages/ui`)

## UX/UI Standards (Shadcn/UI)

The platform uses a **Zinc**-oriented light theme (Maia tokens) for desktop and mobile.

### Typography

Fonts are loaded per app in each app’s `app/layout.tsx` via `next/font/google`:

- **Sans / body**: Inter
- **Display / headings**: Syne
- **Mono**: Geist Mono

### Design Tokens

- **Padding**: Typical main content uses `px-4 py-6 sm:px-6` where applied in layouts.
- **Borders**: Prefer Maia theme tokens (`border-border`, `border-border/60`, `--radius`).
- **Motion**: `MotionPreset` and related presets from `@asym/lib/motion-presets` / `@asym/ui`.
- **Responsive**: Mobile-first patterns; sidebar access often uses Sheet/drawer-style navigation.

### Chart Standards

- **Tokens**: Maia chart CSS variables `--chart-1` … `--chart-5` where used with Recharts.
- **Bar charts** (where this convention applies): top corner radius `[4, 4, 0, 0]`, `maxBarSize={52}`, Y-axis label width and `tickMargin={8}`, short month labels on time axes when dense.

## Apps and local routing

Each surface is a **separate Next.js app** with its own `app/` tree and dev port (see Quickstart).

| Surface                 | Package                | Dev port | Notes                                                                                                                                                                 |
| ----------------------- | ---------------------- | -------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Donor                   | `@asym/donor`          |     3000 | Public site + donor dashboard under `/donor-dashboard` (authenticated areas)                                                                                          |
| Admin (Mission Control) | `@asym/admin`          |     3030 | Staff/admin UI; routes live under `apps/admin/app/` (e.g. `/`, `/contributions`, `/crm`). Many in-app links use a `/mc/...` path prefix in the Mission Control shell. |
| Missionary              | `@asym/missionary-app` |     4000 | Missionary dashboard; home route `/`                                                                                                                                  |

Shared auth gating uses **`createAuthMiddleware`** from `packages/auth/middleware.ts`, wired in each app through **`apps/<app>/proxy.ts`** (exported `proxy`).

## Development

Use the per-app `dev:*` scripts when you only need one surface, or `bun run dev` / `bun run dev:all` when you need several (see root `package.json`).

### AI Agent Guidance System

Agent-oriented docs live under `docs/ai/`:

- **Entry point:** `AGENTS.md`
- **Stack registry:** `docs/ai/stack-registry.md`
- **Working set:** `docs/ai/working-set.md`
- **Monorepo architecture:** `docs/ai/monorepo-architecture.md`
- **Rulebooks:** `docs/ai/rules/*`
- **Skills:** `docs/ai/skills/*`

**Canonical source:** `docs/ai/`. Root `rules/` and `skills/` contain **deprecation pointers** to `docs/ai/` (not full duplicates).

Sync canonical skills into runtime folders after skill updates:

```bash
bun run skills:sync
```

- Canonical: `docs/ai/skills/*`
- Mirrors: `.agents/skills/*` and `.cursor/skills/*`

### Package Manager

This repo uses **Bun** (see root `package.json` `packageManager`, currently **1.3.x**). Prefer `bun` / `bunx` for scripts in this workspace.

### Monorepo Workspace Contract

Bun workspaces + Turborepo:

```text
apps/*       -> deployable applications (admin, donor, missionary)
packages/*   -> shared libraries used by apps
packages/env -> @asym/env (shared env schema)
tooling/*    -> eslint/tsconfig and other tooling packages
```

Placement:

- App-specific routing/UI → `apps/*`
- Shared across apps → `packages/*`
- Shared env validation → `packages/env`
- Lint/tsconfig-only packages → `tooling/*`

Conventions:

- Workspace package names use `@asym/<name>` (admin app is `@asym/admin`, missionary app is `@asym/missionary-app`).
- Internal deps use `workspace:*` (not `file:`).
- Workspace globs in root `package.json`: `apps/*`, `packages/*`, `packages/env`, `tooling/*`.

Guardrail:

```bash
bun run verify:workspace-contract
```

**Verify** (`bun run verify`):

- Runs workspace contract checks (and optional HTTP checks).
- `VERIFY_HTTP=1` checks `/`, `/login`, and `/register` against `VERIFY_BASE_URL` (default `http://localhost:3000`).
- `VERIFY_SUPABASE=1` runs `bun run setup:verify`.

### Linting

- `apps/*` → `@asym/eslint-config/nextjs.mjs`
- `packages/*` → `@asym/eslint-config/library.mjs` where configured
- Root `eslint.config.mjs` orchestrates

```bash
bun run lint
```

Details: `tooling/eslint-config/README.md`.

### How to add a new app

1. Add `apps/<app-name>/` with `package.json` named `@asym/<app-name>` (follow existing naming patterns).
2. Use `workspace:*` for internal dependencies.
3. Add `dev`, `build`, `lint`, `typecheck` scripts for Turbo.
4. Use a **unique dev port** if developers run multiple apps together (see existing apps).
5. Wire auth via `apps/<app-name>/proxy.ts` if the app should match donor/admin/missionary patterns.
6. Run `bun run verify:workspace-contract`.

Example `package.json` fragment:

```json
{
  "name": "@asym/my-new-app",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3010",
    "build": "next build",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@asym/ui": "workspace:*"
  }
}
```

### How to add a new package

1. `packages/<package-name>/` with `name: "@asym/<package-name>"`.
2. Export from the package entry; import by package name across the workspace.
3. `workspace:*` for internal deps.
4. `bun run verify:workspace-contract`.

Minimal `package.json` example:

```json
{
  "name": "@asym/my-new-package",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "@asym/config": "workspace:*"
  }
}
```

Common commands:

- `bun run format` / `bun run format:check`, `bun run lint`, `bun run typecheck`
- `bun run build` (CI-style env via `scripts/run-with-ci-env.mjs`), `bun run build:strict`, `bun run test:unit`
- `bun run test:e2e`, `bun run test:e2e:strict`, `bun run test:e2e:ui`
- `bun run verify` (optional `VERIFY_HTTP=1`, `VERIFY_SUPABASE=1`)
- `bun run verify:e2e`
- PR-style gate: `bun run format:check && bun run lint && bun run typecheck && bun run build && bun run test:unit`

### Git Hooks Setup

Husky hooks:

- **pre-commit:** `lint-staged`
- **pre-push:** `bun run ci:preflight`

If hooks cannot find tools, configure PATH for Husky (see Husky docs). Example init snippet (adjust for your Node/Bun install):

**macOS/Linux:**

```bash
mkdir -p ~/.config/husky && echo 'export PATH="/usr/local/bin:$PATH"' > ~/.config/husky/init.sh
```

**Windows (Git Bash):**

```bash
mkdir -p ~/.config/husky && echo 'export PATH="/c/Program Files/nodejs:$PATH"' > ~/.config/husky/init.sh
```

### Turborepo (Task Orchestration + Cache)

- `bunx turbo run dev` / filtered tasks per package
- `bunx turbo run lint typecheck build`
- `bun run format` / `bun run format:check`

Turbo remote caching depends on your CI/provider setup (e.g. `TURBO_TOKEN` / Vercel integration). See Turborepo docs for your environment.

Build env details: `docs/guides/development/build-runbook.md`.

### Key Dependencies

| Package               | Version | Notes                                    |
| --------------------- | ------- | ---------------------------------------- |
| Next.js               | 16.2.1  | App Router + Turbopack in app configs    |
| React                 | 19.2.3  |                                          |
| TypeScript            | 5.9.3   |                                          |
| motion                | 12.x    | Animation (successor to framer-motion)   |
| @tanstack/react-query | 5.x     | Server state                             |
| @supabase/ssr         | 0.8.x   | Supabase server/client helpers           |
| @sentry/nextjs        | 10.x    | Error monitoring (via `@asym/lib`, etc.) |

### Verification Steps

```bash
bun run format

bun run format:check && bun run lint && bun run typecheck && bun run build && bun run test:unit

bun run test:e2e

bun run validate:full

bun run build:strict
bun run test:e2e:strict

bun run verify:t1

bun outdated
```

### Supabase schema + money-unit QA (separate from T1)

```bash
bun run verify:supabase-money
```

`verify:money-units` samples columns via the Supabase REST API (see `scripts/verify-money-units.ts` and README notes in-repo for column list and exit codes).

## Key Conventions

1. **RSC first** unless the UI needs client hooks or browser-only APIs.
2. **Dynamic route APIs:** follow current Next.js App Router patterns for `params` / `searchParams` (this repo targets Next 16.2).
3. **Theming:** Maia/Zinc tokens and shared UI patterns in `@asym/ui`.
4. **Responsive checks:** exercise mobile and desktop widths for UI changes.

---

## App-Connected Development

Hosted Supabase only needs the public URL and anon key in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### How to request access

Ask a maintainer for the shared dev Supabase URL and anon key. Do not use service-role keys or DB credentials for normal app development.

### Demo login (optional)

Demo availability and sign-in go through **`/api/auth/demo-account`** (implemented in `packages/api`, re-exported per app). Configure demo users in `.env.local` per `.env.example` / `docs/auth/sign-in.md`.

Details: `docs/auth/sign-in.md`.

## Supabase CLI Workflow (Hybrid)

```bash
bun run supabase -- <supabase-subcommand>
```

- Uses a global `supabase` CLI when available.
- Otherwise uses a pinned CLI via `npx` (see `scripts/supabase-cli.mjs`).

Optional global install:

```bash
brew install supabase/tap/supabase
# Windows (Scoop):
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

## Supabase Demo Seed

- `supabase/seed.sql`
- `supabase/migrations/20260216153000_demo_readonly_rls.sql`
- `scripts/seed-demo.sh`

### Local

```bash
bun run db:migrate:local
# or
bun run seed:demo:local
```

### Hosted (explicit target)

Required env vars (hosted script validates the project ref; default ref is defined in `scripts/seed-demo.sh`):

- `NEXT_PUBLIC_SUPABASE_URL` (must match the intended Supabase project)
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`

Commands:

```bash
bun run db:migrate:hosted
bun run seed:demo:hosted
bun run seed:demo:verify
```

## License

Licensed under **AGPL-3.0-only**. See `LICENSE`.

### What AGPL means for hosted use

If you run a modified version for users over a network, you must offer them the corresponding source for that version.

### Trademarks

The license covers source code, not trademarks. Do not use project names or logos without permission unless a separate policy says otherwise.

### Third party software

Attributions for bundled third-party code: `THIRD_PARTY_NOTICES.md`.

---

Built with ❤️ for the Kingdom.
