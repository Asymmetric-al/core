# Asymmetric.al - Kingdom Impact Platform

A high-performance Next.js 16.2.6 (App Router) Turborepo monorepo for mission-focused organizations, with three apps (`apps/admin`, `apps/donor`, `apps/missionary`) and shared workspace packages (`packages/*`).

## Quickstart

1. **Install prerequisites:** [Bun](https://bun.sh) and Git on your PATH.
2. **Run setup** (creates `.env.local` on first run if needed, installs dependencies, checks that committed skill mirrors match `docs/ai/skills/`, then runs repo setup checks):
   - macOS / Linux / Git Bash: `bun run setup`
   - Windows PowerShell: see [Windows](#windows) below (`.\scripts\setup.ps1`).
3. **Fill required Supabase values** in `.env.local` if the first run stopped with "missing required env vars", then run setup again.
4. **Start dev:** `bun run dev` (or an app-specific script from `package.json`). For a single surface, `bun run dev:donor` is typical (donor on port 3000).
5. **Optional smoke check:** `bun run verify` (implemented in `scripts/verify/index.mjs`; on Windows without a Bash shim, run `bash scripts/verify/index.sh` from Git Bash or WSL).

**After `git pull` when skill files changed:** run `bun run skills:verify`. If it reports drift between `docs/ai/skills/` and the mirrors under `.agents/skills/` and `.cursor/skills/`, run `bun run skills:sync` and commit the updated mirror files so CI and teammates stay aligned.

**Required:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
**Optional:** Other entries in `.env.example` (Stripe, demo accounts, etc.)

`bun run dev` runs **all** apps via Turbo (`turbo run dev`). Default HTTP checks in `bun run verify` use **`http://localhost:3000`** (`VERIFY_BASE_URL`), so use `bun run dev:donor` (or point `VERIFY_BASE_URL` at the app you are running).

Per-app dev commands (from root `package.json`):

- `bun run dev:donor` → donor app, port **3000**
- `bun run dev:admin` → admin app, port **3030**
- `bun run dev:mission-control` → Mission Control admin app, port **3030**, with Cloud Agent-friendly dev defaults
- `bun run dev:missionary` → missionary app, port **4000**

Dev env source of truth is the repo-root `.env.local`. Each app's `next.config.ts` loads that root file with `@next/env`; dev scripts do not copy secrets into app directories. If older tooling requires app-local env files, run `bun run env:link-apps` to create symlinks, or Windows hardlinks when file symlink permissions are unavailable. The helper refuses to overwrite an existing app `.env.local` unless rerun with `--force`.

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

### Mission Control Cloud Agent setup

Use this when a fresh Cursor Cloud Agent, or a human in the same sandbox, needs the Mission Control Dashboard without a real Supabase project.

```bash
bun run setup:mission-control:cloud
bun run dev:mission-control
```

Then open `http://localhost:3030`. The setup command writes only gitignored `.env.local` defaults: `SKIP_ENV_VALIDATION=1`, `E2E_AUTH_BYPASS=true`, placeholder public Supabase values, and the admin Playwright base URL. Existing explicit `E2E_AUTH_BYPASS=false` values are preserved unless you pass `--force-bypass`. Replace placeholders with real Supabase/demo account secrets when testing live auth or hosted data.

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

The script order matches `bun run setup` on Unix: install dependencies (unless `-SkipInstall`), run `bun run skills:verify`, then `bun run setup:verify`. After pulling changes that touch skills, run `bun run skills:verify`; if it reports mirror drift, run `bun run skills:sync` and commit the updated mirrors.

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

- **Framework**: Next.js 16.2.6 (App Router, Turbopack in app configs) — _optimized for performance_
- **UI system**: Tailwind CSS 4 + shadcn/ui (Maia theme) + Base UI
- **Theme**: Light Zinc aesthetic (Zinc/Zinc), shadcn/ui Maia theme
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

- **Entry point:** `AGENTS.md` — routing rules for all AI agent work
- **Stack registry:** `docs/ai/stack-registry.md` — canonical tech stack list
- **Working set:** `docs/ai/working-set.example.md` — template for local `docs/ai/working-set.md` scratch context
- **Nia MCP:** `docs/ai/nia.md` — repo-scoped Nia search, MCP setup, and local sync rules
- **Monorepo architecture:** `docs/ai/monorepo-architecture.md` — workspace structure
- **Rulebooks:** `docs/ai/rules/*` — domain-specific guidelines (frontend, backend, testing, etc.)
- **Async QA Foreman:** `docs/ai/rules/async-qa-foreman.md` — optional background `/qa-foreman` subagent (`.cursor/agents/qa-foreman.md`) for grind-style verification while the main agent implements.
- **OpenSpec Guardian:** `docs/ai/rules/openspec-guardian.md` — optional background `/openspec-guardian` subagent (`.cursor/agents/openspec-guardian.md`) for prompt intent and OpenSpec alignment while the main agent implements.
- **Skills:** `docs/ai/skills/*` — reusable workflow patterns (repo-owned, versioned)

**Canonical source:** `docs/ai/`. Root `rules/` and `skills/` contain **deprecation pointers** to `docs/ai/` (not full duplicates).

**Repo-owned skills (how it fits together):** Edit and review skills under `docs/ai/skills/<name>/SKILL.md`. `AGENTS.md` points agents at those paths for routing. The same content is copied into **committed mirrors** at `.agents/skills/` (Codex-style discovery) and `.cursor/skills/` (Cursor) by the sync script so tools can surface them without a personal global install. CI runs `bun run skills:verify` to ensure mirrors match the canonical tree.

**Skill scripts (root `package.json`):**

| Command                           | What it does                                                                                                                                                                                                                                                                                                                                                                                         |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun run skills:sync`             | Copies canonical `docs/ai/skills/*` into `.agents/skills/` and `.cursor/skills/`, prunes stale canonical copies from mirrors, and overlays extra packs from `.agents/skills` into `.cursor/skills` where configured. Run after you edit skills under `docs/ai/skills/`.                                                                                                                              |
| `bun run skills:verify`           | Fails if mirrors drift from canonical sources or the git tree is dirty after sync (same check used in CI and in `bun run setup` / `scripts/setup.ps1`).                                                                                                                                                                                                                                              |
| `bun run skills:refresh-upstream` | Vendors the pinned set into `docs/ai/skills/`: `supabase`, `supabase-postgres-best-practices`, and `npm-deps-cleanup` from repo-local `.agents/skills/` (after targeted Skills CLI refreshes); `emil-design-engineering` from `$HOME/.cursor/skills/` (after the animations.dev installer). Use the matching upstream workflow for each skill, then run `skills:sync` / `skills:verify` (see below). |

**Manual-vendored skills:** `docs/ai/skills/resend-cli/`, `docs/ai/skills/bendc-frontend-guidelines/`, `docs/ai/skills/payloadcms-payload/`, and `docs/ai/skills/payloadcms-cms-migration/` are not part of `skills:refresh-upstream`. Refresh them from the source documented in each `references/upstream.md`, then run `bun run skills:sync` and `bun run skills:verify`.

When you add or change a skill **only** under `docs/ai/skills/`:

```bash
bun run skills:sync
bun run skills:verify
```

Commit both the canonical files and any mirror updates.

**Updating vendored skills from upstream** (maintainers / periodic refresh):

1. Use targeted Skills CLI refreshes only, such as `npx skills add supabase/agent-skills -y`, `npx skills add anthonyshew/dotfiles -y`, or `npx skills add mattpocock/skills -y`; these update `.agents/skills/*` and `skills-lock.json` for packages tracked by the Skills CLI.
2. Do **not** use `npx skills check` as a read-only check. In `skills@1.5.7`, that subcommand was observed to update project skills; treat it like `skills update` and review or revert the generated diff.
3. `curl -s "https://animations.dev/api/activate-design-engineering?email=<maintainer-email>" | bash` — updates the upstream-installed `emil-design-engineering` skill under `~/.cursor/skills/`.
4. `bun run skills:refresh-upstream` — vendors the refreshed copies into `docs/ai/skills/supabase`, `docs/ai/skills/supabase-postgres-best-practices`, `docs/ai/skills/npm-deps-cleanup`, and `docs/ai/skills/emil-design-engineering` (reconcile any repo-specific notes in those trees if the vendor copy overwrote them; see `scripts/refresh-upstream-skills.mjs`).
5. Follow `references/upstream.md` for manual-vendored skills such as Resend CLI, Payload CMS, and bendc frontend guidelines.
6. `bun run skills:sync` then `bun run skills:verify` — refresh mirrors and confirm a clean tree.

**Updating the vendored Resend CLI skill from upstream** (maintainers / on CLI releases):

1. Replace `docs/ai/skills/resend-cli/` with the `skills/resend-cli/` directory from the desired [`resend/resend-cli`](https://github.com/resend/resend-cli) tag (see `docs/ai/skills/resend-cli/references/upstream.md`).
2. `bun run skills:sync` then `bun run skills:verify`.

`setup:verify` (run at the end of setup) calls your Supabase URL with the anon key; a **401** means the URL and anon key are not a matching pair for the same project (fix values in `.env.local` and re-run setup).

### Package Manager

This repo uses **Bun** pinned in root `package.json` `packageManager` (currently **1.3.14**). Install that exact version locally (`bun run verify:bun-version` after setup). Prefer `bun` / `bunx` for scripts in this workspace; CI installs with `bun ci`.

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
- Exception: the native PDF Studio migration intentionally consumes the five
  vendored Phase 47 React PDF tarballs under `vendor/react-pdf-packages/*.tgz`
  until those packages are published or promoted into this monorepo.
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

1. **RSC first:** Keep components as React Server Components unless interactivity requires client hooks or browser-only APIs.
2. **Next.js 16.2.1 compliance:** Always `await` dynamic `params` and `searchParams` in routes and layouts (follow current App Router patterns for this repo’s Next version).
3. **Zinc and shadcn/ui Maia aesthetic:** Maia/Zinc tokens and shared UI patterns in `@asym/ui`; use `zinc-900` for primary actions and `zinc-500` for secondary text where this convention applies.
4. **Responsive integrity:** Test UI changes on both ~375px (mobile) and ~1440px (desktop) viewports.

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
