# Asymmetric.al - Kingdom Impact Platform

A high-performance Next.js 16.4.2 (App Router) Turborepo monorepo for mission-focused organizations, with three apps (`apps/admin`, `apps/donor`, `apps/missionary`) and shared workspace packages (`packages/*`).

## Quickstart

For the optional six-agent GitHub issue-to-`develop` workflow, use the
[Samson Codex Cloud guide](docs/guides/development/samson-codex-cloud.md).
`node scripts/factory/setup-cloud.mjs` installs frozen dependencies and native
personal instructions; `--verify-only` checks existing setup without repair.
The coordinator controls native handoffs; setup does not start an issue trial.

1. **Install prerequisites:** [Node.js 24.22.1](https://nodejs.org/), [Bun 1.4.3](https://bun.sh), and Git on your PATH.
2. **Choose your setup path.**

### Credential-free Mission Control sandbox

Use this path for a fresh clone, disposable agent environment, or first run when
you do not have Supabase credentials yet:

```bash
bun run setup:mission-control:cloud
bun run dev:mission-control
```

Then open `http://localhost:3030`. The setup command creates gitignored
`.env.local` defaults, installs dependencies with the frozen lockfile, and runs
`bun run skills:verify`.

### Hosted Supabase app development

Use this path when you have a Supabase project URL and anon public key:

1. **Run setup** (creates `.env.local` on first run if needed, installs dependencies, checks that committed skill mirrors match `docs/ai/skills/`, then runs repo setup checks):
   - macOS / Linux / Git Bash: `bun run setup`
   - Windows PowerShell: see [Windows](#windows) below (`.\scripts\setup.ps1`).
2. **Fill required Supabase values** in `.env.local` if the first run stopped with "missing required env vars", then run setup again.
3. **Start dev:** `bun run dev` (or an app-specific script from `package.json`). For a single surface, `bun run dev:donor` is typical (donor on port 3000).
4. **Optional smoke check:** `bun run verify` (implemented in `scripts/verify/index.mjs`). Set `VERIFY_HTTP=1` and `VERIFY_BASE_URL=<app-url>` when you also want HTTP route checks.

**After `git pull` when skill files changed:** run `bun run skills:verify`. If it reports drift between `docs/ai/skills/` and the mirrors under `.agents/skills/`, `.cursor/skills/`, and `.claude/skills/`, run `bun run skills:sync` and commit the updated mirror files so CI and teammates stay aligned.

**Required for hosted Supabase app development:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

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

Use this when a fresh Cursor Cloud Agent, disposable agent environment, or human in the same sandbox needs the Mission Control Dashboard without a real Supabase project.

```bash
bun run setup:mission-control:cloud
bun run dev:mission-control
```

Then open `http://localhost:3030`. The setup command writes gitignored `.env.local` defaults, installs dependencies with `bun install --frozen-lockfile`, and runs `bun run skills:verify`. The defaults include `ASYM_USE_CI_ENV_DEFAULTS=1`, `SKIP_ENV_VALIDATION=1`, `E2E_AUTH_BYPASS=true`, `NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co`, `NEXT_PUBLIC_SUPABASE_ANON_KEY=example-anon-key`, `PAYLOAD_SECRET=cloud-agent-mission-control-placeholder`, `PLAYWRIGHT_ADMIN_BASE_URL=http://localhost:3030`, and `PLAYWRIGHT_ADMIN_PORT=3030`. Existing explicit `E2E_AUTH_BYPASS=false` values are preserved unless you pass `--force-bypass`. Replace placeholders with real Supabase/demo account secrets when testing live auth or hosted data.

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

The script order matches `bun run setup` on Unix: verify the approved Node.js runtime and pinned Bun version, install dependencies (unless `-SkipInstall`), run `bun run skills:verify`, then `bun run setup:verify`. After pulling changes that touch skills, run `bun run skills:verify`; if it reports mirror drift, run `bun run skills:sync` and commit the updated mirrors.

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

- **Framework**: Next.js 16.4.2 (App Router, Turbopack in app configs, Instant Navigation via `cacheComponents` + `partialPrefetching`) — _optimized for performance_
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

Fonts are loaded per app in each app’s `app/layout.tsx` through shared `next/font/local` modules in `@asym/ui/fonts`:

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

## Product planning

The [SiteStacker parity program](docs/prds/sitestacker-parity/README.md)
tracks outcome parity and phase dependencies. The
[Phase 25 Donor Dashboard Depth specification](docs/prds/sitestacker-parity/phase-25-donor-dashboard-depth.md)
records the ratified donor scope, acceptance criteria, source contracts and
qualification gates. It is planning authority, not implemented or activated
behavior; its source-owner amendments remain proposed.

## Development

Use the per-app `dev:*` scripts when you only need one surface, or `bun run dev` / `bun run dev:all` when you need several (see root `package.json`).

`bun run build` and the `build:<app>` commands compile Eve dependency artifacts
without provisioning sandboxes. Hosted admin previews use the same unqualified
artifact mode and leave Eve Release Off. Standalone Eve and production service
builds retain full qualification; see the
[build runbook](docs/guides/development/build-runbook.md#eve-artifacts-and-qualification)
before treating any preview as launch evidence.

For React and Next.js source cleanup, use `bun run react-doctor:audit`, retain
`bun run react-doctor:raw`, and finish with `bun run react-doctor:check`.
The strict command requires all eight targets to complete with no unexcepted
warnings or errors. `bun run test:react-cleanup` runs the isolated component
browser fixtures. See the [React Doctor guide](docs/guides/development/react-doctor.md)
for exact exceptions, source-copy integrity, and verification limits.

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

**Skill ownership and discovery:** Canonical skills are authored and reviewed under `docs/ai/skills/<name>/`. Ecosystem-owned skills are maintained under `.agents/skills/<name>/` using their reviewed source and provenance; `.agents/skills/` therefore contains both ecosystem sources and generated canonical copies. `bun run skills:sync` publishes the combined runtime set to `.cursor/skills/` and `.claude/skills/`, including canonical overlays. Do not hand-edit generated copies. The singular `.agent/skills/` path is unsupported. Project skills need no personal/global installation.

**Skill scripts (root `package.json`):**

| Command                                  | What it does                                                                                                                                                                                                                                                |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun run skills:sync`                    | Writes canonical copies and generated runtime mirrors. Run after changing either a canonical or ecosystem source.                                                                                                                                           |
| `bun run skills:verify`                  | Computes expected mirrors in scratch and fails on drift without changing tracked files. It does not require an otherwise clean working tree.                                                                                                                |
| `bun run skills:refresh-upstream`        | Refreshes configured local sources and direct GitHub groups. Consult source-specific provenance; some groups follow upstream branches, so this is an intentional maintenance operation, not a freshness check.                                              |
| `bun run skills:refresh-security-audit`  | Fetches the reviewed immutable Cloudflare commit, validates all 20 upstream files and the license, preserves the Core overlay, and publishes the complete canonical tree and lock metadata transactionally. It never starts an audit or runs imported code. |
| `bun run skills:refresh-emilkowalski`    | Promotes the installed public Emil trees while preserving Core overlays and compatibility corrections. Keep upstream `prototype` under Core's `emil-prototype` identity.                                                                                    |
| `bun run skills:refresh-jakubkrehel`     | Promotes only installed `better-*` and `interface-review` trees with Core overlays; do not add unrelated pack members.                                                                                                                                      |
| `bun run skills:refresh-frontend-design` | Promotes Anthropic `frontend-design`, retaining explicit-only invocation and Core design authority.                                                                                                                                                         |
| `bun run skills:refresh-taste-skill`     | Promotes current upstream `taste-skill` under `design-taste-frontend`; retains removed `redesign-existing-projects` as a documented snapshot. Both remain explicit-only.                                                                                    |
| `bun run skills:refresh-obra-tdd`        | Promotes the Superpowers companion. Core's authoritative TDD workflow remains `docs/ai/skills/tdd/SKILL.md`.                                                                                                                                                |
| `bun run skills:refresh-inngest`         | Refreshes the configured official Inngest source pins and required references without adding product runtime dependencies.                                                                                                                                  |
| `bun run skills:refresh-reui`            | Downloads and validates the hosted ReUI bundle into review staging; it does not publish canonical files or modify MCP configuration.                                                                                                                        |

**Reviewed project-local installation:** First check existing repository skills and [skill routing](docs/ai/rules/agent-skill-routing.md). For a new or refreshed ecosystem skill, select its exact source revision and review its license and complete subtree. Skills CLI 1.5.7 accepts this targeted copy form; run it from an isolated scratch install directory against the reviewed checkout:

```bash
npx --yes skills@1.5.7 add <reviewed-local-checkout> --skill <upstream-skill-name> --agent codex --copy -y
```

The absence of `--global` keeps installation project-local; `--agent codex --copy` explicitly chooses real `.agents/skills/` directories instead of client auto-detection or generated-client symlinks. Preserve installed aliases when upstream names move. Do not run an entire pack installer to update one member. No global installation, paid activation, credential write, or imported lifecycle/script execution belongs to this refresh workflow.

**Publishing a reviewed refresh:**

1. Read the skill's `references/upstream.md`, current manifests, and Core overlays. Record the immutable source revision or hosted content hashes; a lock content hash alone does not pin a Git branch. `experimental_install` rewrites all lock entries and can re-resolve upstream names, so it is not the normal restore path for aliases or retained snapshots. Do not use `skills check`, `update`, or `upgrade` as read-only checks.
2. Review every required reference, script, asset and notice, including additions and removals. Preserve legitimate Core assets, invocation metadata, code-example fixes, installed-version compatibility and ownership boundaries. Paid, removed, unknown-permission and untraceable sources remain documented snapshots until verified evidence supports an update. In particular, retain `emil-design-engineering` without rerunning its paid/global activation installer as part of routine maintenance.
3. Use the matching repository refresh command where configured. For manually maintained skills, stage the complete candidate beside its canonical or ecosystem destination, back up the old tree and lock bytes, then replace the directory and update lock/provenance together. Restore both after any failure; never leave a partially copied tree or a new lock with old content. Keep raw upstream hashes distinct from adapted hashes. Do not execute imported code as a copying side effect.
4. Run `bun run skills:sync`, then `bun run skills:verify`. Verification must leave tracked state unchanged; review and commit the owning sources, provenance/lock updates and generated mirrors together. Follow the focused checks in [skill routing](docs/ai/rules/agent-skill-routing.md) and each source's provenance.

**Manual source adapters:** Resend CLI, Tiptap, Next.js app architecture, the Payload public-v4 adapters, bendc frontend guidelines and other sources not configured in `skills:refresh-upstream` use their documented reviewed-checkout procedures. Keep application dependencies and existing credentials outside skill maintenance. Cursor Team Kit and Babysitter retain their configured companion-agent handling; do not import unrelated always-on rules.

**ReUI Pro:** [ReUI agent setup](docs/guides/development/reui.md) covers authenticated MCP, live documentation and shared `base-maia` installs. `bun run verify:reui --live` checks discovery and registry access using the existing opaque runtime credential. Review the complete staged bundle, retain Core overlays and compatibility corrections, mark its manifest reviewed, then publish, sync and verify. Never run the hosted installer over this repository.

**Security-audit operating mode:** The Cloudflare skill supplies focused guidance by default. Only an explicit audit, pen-test, comprehensive security review or report request starts its complete workflow. Preserve every read-only source, sandbox, independent-verification and external-output rule; a skill installation is not authorization to audit a target. Run its reviewed validator tests explicitly under WSL/Linux Node.

`setup:verify` (run at the end of setup) calls your Supabase URL with the anon key; a **401** means the URL and anon key are not a matching pair for the same project (fix values in `.env.local` and re-run setup).

### Package Manager

This repo uses **Bun** pinned in root `package.json` `packageManager` and `.bun-version` (currently **1.4.3**). Install that exact version locally (`bun run verify:bun-version` after setup). Prefer `bun` / `bunx` for scripts in this workspace; CI installs with `bun ci`. Apps still run on **Node.js 24** (CI pins **24.22.1**) via Next.js (`next build` / `next start`). Do not use `bun --bun`, and do not add `bunVersion` to `apps/*/vercel.json` — that switches Vercel Functions onto the Bun runtime ([changelog](https://vercel.com/changelog/bun-1-4-is-now-available-in-vercel-functions)), which is not this repo’s deploy path.

### Monorepo Workspace Contract

Vercel installs with `bunx bun@1.4.3 install --cwd ../.. --frozen-lockfile` to keep the build-image package manager on the workspace pin. See [CI toolchain guidance](docs/ci.md#bun-toolchain).

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

UI lint uses one shared six-rule policy in the three apps, shared UI, and
missionary package. For scoped checks, raw legacy findings, discovery health,
and suppression pruning, follow the
[Core design-system lint workflow](docs/ai/skills/moai-library-shadcn/references/design-system-lint.md).

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
- `bun run verify:shadscan` (locked workspace audit, independent app floors and reviewed evidence; [guide](docs/guides/development/shadscan.md))
- Canonical PR/push-readiness gate: `bun run ci:preflight` (routine development skips full compilation; dependency/build changes compile affected apps). Full QA/release checkpoint: `bun run ci:preflight -- --full`.

Unit tests use Vitest's supported V8 coverage provider. Reports measure imported
source under configured filters; they are not a whole-repository coverage census.
Product builds use TypeScript 7, while AST/parser/editor tools retain the maintained
TypeScript 6 API. See the [compiler boundary](docs/guides/typescript-6-readiness.md)
and [tooling qualification record](docs/maintenance/modernization/development-tools.md).

### Git Hooks Setup

Husky hooks:

- **pre-commit:** `lint-staged`, then the locked Shadscan gate against the staged snapshot
- **pre-push:** `bun run ci:preflight`; production-targeting pushes always select `--full`.

`lint-staged` runs `eslint --fix` on staged workspace code (`apps/`, `packages/`, `tooling/`) and `prettier --write` on **every** staged file. Keep the Prettier glob as `*`: the pre-push gate runs `prettier . --check` across the repo, so any narrower allowlist lets files (`tests/`, `scripts/`, repo-root paths) commit unformatted and fail at push time. Exclusions belong in `.prettierignore`, not in the glob. `tests/unit/format-gate.contract.test.ts` enforces this.

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

For the credential-free Anthropic OSS Scanner image, explicit offline service
startup, verification profiles and private report triage, see the
[OSS Scanner runbook](.oss-scanner/README.md).

### Key Dependencies

| Package               | Version | Notes                                                         |
| --------------------- | ------- | ------------------------------------------------------------- |
| Next.js               | 16.4.2  | App Router + Turbopack in app configs                         |
| React                 | 19.3.1  |                                                               |
| TypeScript            | 7.0.2   | Native workspace compiler; root TS 6 API/editor compatibility |
| motion                | 12.x    | Animation (successor to framer-motion)                        |
| @tanstack/react-query | 5.x     | Server state                                                  |
| @supabase/ssr         | 0.8.x   | Supabase server/client helpers                                |
| @sentry/nextjs        | 10.x    | Error monitoring (via `@asym/lib`, etc.)                      |

### Verification Steps

```bash
bun run format

bun run ci:preflight

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
2. **Next.js 16.4.2 compliance:** Always `await` dynamic `params` and `searchParams` in routes and layouts (follow current App Router patterns for this repo’s Next version).
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

### Offline shared-font verification

The three Next apps compile their existing fonts from reviewed local assets.
After changing fonts or their loaders, run `bun run verify:fonts:offline` in
Linux/WSL with Playwright Chromium installed. The check proves compilation and
browser font loading without external network access, plus missing-file failure.
See [shared font provenance and maintenance](packages/ui/fonts/README.md) for details. Normal preflight,
all-app builds and relevant E2E still apply.

### Development build checkpoints

Core does not automatically deploy merges into `develop`. Use an explicit `qa:smoke` preview when a feature is ready to review; the preview compiles on GitHub and uploads prebuilt output to Vercel. Routine PRs keep correctness checks without compiling all three apps. Full compilation remains required for production releases. Existing development URLs serve the last successful deployment until explicitly refreshed. See [CI policy](docs/ci.md#development-deployment-checkpoints-al-1921).
