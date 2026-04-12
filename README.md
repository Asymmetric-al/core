# Asymmetric.al - Kingdom Impact Platform

A high-performance Next.js 16.2.1 (App Router) Turborepo monorepo for mission-focused organizations, with three apps (`apps/admin`, `apps/donor`, `apps/missionary`) and shared workspace packages (`packages/*`).

## Quickstart

1. **Install prerequisites:** [Bun](https://bun.sh) and Git on your PATH.
2. **Run setup** (creates `.env.local` on first run if needed, installs dependencies, checks that committed skill mirrors match `docs/ai/skills/`, then runs repo setup checks):
   - macOS / Linux / Git Bash: `bun run setup`
   - Windows PowerShell: see [Windows](#windows) below (`.\scripts\setup.ps1`).
3. **Fill required Supabase values** in `.env.local` if the first run stopped with “missing required env vars”, then run setup again.
4. **Start dev:** `bun run dev` (or an app-specific script from `package.json`).
5. **Optional smoke check:** `bun run verify` (uses Bash; on Windows without a Bash shim, run `bash scripts/verify/index.sh` from Git Bash or WSL).

**After `git pull` when skill files changed:** run `bun run skills:verify`. If it reports drift between `docs/ai/skills/` and the mirrors under `.agents/skills/` and `.cursor/skills/`, run `bun run skills:sync` and commit the updated mirror files so CI and teammates stay aligned.

**Required:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
**Optional:** All other entries in `.env.example` (Stripe, demo accounts, Unlayer, etc.)

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

- **Framework**: Next.js 16.2.1 (App Router, Turbopack) - _Optimized for Performance_
- **UI System**: Tailwind CSS 4 + shadcn/ui (Maia Theme) + Base UI
- **Theme**: Light Zinc Aesthetic (Zinc/Zinc), Shadcn/UI Maia Theme
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Unified across platforms)
- **Payments**: Stripe (Advanced integration)
- **State Management**: React 19 + TanStack Query v5
- **Animations**: Motion + Tailwind Motion

## UX/UI Standards (Shadcn/UI)

The platform follows a standardized **Zinc Light** theme, optimized for both desktop and mobile viewports with a seamless, responsive transition.

### Typography

- **Primary**: Inter (`tracking-tight`)
- **Mono**:
- **Headings**:

### Design Tokens

- **Padding**: Standardized `px-4 py-6 sm:px-6` for main content areas.
- **Borders**: Use maia theme tokens, not hard coded zinc. Default to `border-border` or `border-border/60`. Keep rounding driven by the Maia radius token `--radius`.
- **Motion**: Staggered reveals and smooth transitions using `MotionPreset`.
- **Responsive**: Mobile-first navigation with robust drawers (Sheet) for sidebar access on smaller screens.

### Chart Standards

- **Aesthetic**: Data-dense, high-contrast using Maia `oklch` theme tokens. Use `--chart-1` through `--chart-5` for series colors.
- **Bar Charts**:
  - **Radius**: Uniform corner radius of `[4, 4, 0, 0]` on the top segment of stacked bars or all segments of non-stacked bars. Avoid fully rounded domed tops.
  - **Density**: Use `maxBarSize={52}` for bold, wide bars that scale responsibly.
  - **Axes**: Ensure Y-Axis labels have sufficient width (min `40px`) and margin (`tickMargin={8}`) to prevent numerical cutoff.
  - **Labels**: Use `month` only for X-Axis time series (e.g., "Nov", "Dec") to maintain high density without clutter.

## Multi-Tenant Architecture & Routing

This platform is architected for a multi-tenant environment, allowing a single deployment to serve multiple organizations with isolated data and customized subdomains.

### Production Routing Model

In a live production environment, the platform uses dynamic routing based on host headers (subdomains):

| User Role                      | Production URL               | Routing Logic                                                             |
| :----------------------------- | :--------------------------- | :------------------------------------------------------------------------ |
| **Public Site**                | `tenanturl.org/`             | Root application serving public content and giving pages.                 |
| **Organization Admin**         | `tenanturl.org/admin`        | Administrative interface for the organization (Mission Control).          |
| **Missionaries/Field Workers** | `my.tenanturl.org`           | Dedicated subdomain for field workers to manage their support and donors. |
| **Donors/Partners**            | `tenanturl.org/givingportal` | Portal for donors to manage their contributions and pledges.              |

### Demo Site Accessibility

For this demonstration and development environment, we have implemented aliases to allow easy access to all modules from a single domain:

- **Mission Control (Admin)**: Accessible via [/admin](/admin) (mapped to `/mc`)
- **Missionary Dashboard**: Accessible via [/my](/my) (mapped to `/`)
- **Donor Portal**: Accessible via [/dashboard](/dashboard) (mapped to `/donor-dashboard`)

### Implementation Details

- **Apps**: Route ownership is split across Next.js apps in `apps/*` (see each app's `app/` directory).
- **Shared auth middleware**: Lives in `packages/auth/middleware.ts` (apps opt in to using it).
- **Conceptualization**: Production routing may use host-based rules; local dev generally runs the apps directly on their dev ports.

## Project Modules

### Mission Control (Admin Dashboard)

The administrative headquarters for organization leaders. Manage CRM, Contributions, Member Care, and Mobilization with advanced reporting and automation tools.

- Route: `/mc`

### Missionary Dashboard

Empowering field missionaries with donor engagement tools, task management, and impact feeds.

- **My Feed/Ministry Updates**: A high-fidelity social engagement platform designed for missionaries to share their journey directly with their support base.
  - **Functionality**: Supports rich text (HTML) storytelling, multi-media carousels for multiple photos, and real-time interaction (Likes, Prayers, Comments).
  - **Premium Style**: Features a high-end "Maia" aesthetic with animated micro-interactions. Clicking a reaction triggers a delightful burst of floating emoji particles (❤️, 🙏, 🔥) and visceral pulsing effects.
  - **Workflow**: Missionaries can save drafts, manage visibility (Public vs Partners Only), and handle follower requests with manual or automated approval levels.
  - **Media Management**: Integrated media toolbar allows for quick image uploads and carousel creation to make updates visually engaging.
- Route: `/`

### Donor Portal

A seamless experience for kingdom partners to manage their giving and follow mission progress.

- **Personalized Impact Feed**: A unified, high-fidelity view of updates from all missionaries the donor supports.
- **The Connection Concept**: The platform creates a direct link between generosity and real-world impact.
  - **Automatic Integration**: When a donor makes a contribution to a missionary or clicks "Follow" on their profile, that missionary's feed is automatically integrated into the donor's personalized dashboard.
  - **Real-Time Updates**: Donors receive instant access to stories, prayer requests, and progress reports, allowing them to see exactly how their partnership is making a difference.
  - **Two-Way Interaction**: Donors can respond with reactions and comments, fostering a genuine relationship between the field and the support base.
- Route: `/donor-portal`

## Development

This project is optimized for both local development and the **Example Cloud (example.com)** environment.

### AI Agent Guidance System

This repository includes comprehensive AI agent guidance under `docs/ai/`:

- **Entry point:** `AGENTS.md` - routing rules for all AI agent work
- **Stack registry:** `docs/ai/stack-registry.md` - canonical tech stack list
- **Working set:** `docs/ai/working-set.md` - living task context (keep updated)
- **Monorepo architecture:** `docs/ai/monorepo-architecture.md` - workspace structure
- **Rulebooks:** `docs/ai/rules/*` - domain-specific guidelines (frontend, backend, testing, etc.)
- **Skills:** `docs/ai/skills/*` - reusable workflow patterns (repo-owned, versioned)

**Important:** `docs/ai/` is the canonical source. The `rules/` and `skills/` directories at the repository root contain deprecation shims only.

**Repo-owned skills (how it fits together):** Edit and review skills under `docs/ai/skills/<name>/SKILL.md`. `AGENTS.md` points agents at those paths for routing. The same content is copied into **committed mirrors** at `.agents/skills/` (Codex-style discovery) and `.cursor/skills/` (Cursor) by the sync script so tools can surface them without a personal global install. CI runs `bun run skills:verify` to ensure mirrors match the canonical tree.

**Skill scripts (root `package.json`):**

| Command | What it does |
| --- | --- |
| `bun run skills:sync` | Copies canonical `docs/ai/skills/*` into `.agents/skills/` and `.cursor/skills/`, prunes stale canonical copies from mirrors, and overlays extra packs from `.agents/skills` into `.cursor/skills` where configured. Run after you edit skills under `docs/ai/skills/`. |
| `bun run skills:verify` | Fails if mirrors drift from canonical sources or the git tree is dirty after sync (same check used in CI and in `bun run setup` / `scripts/setup.ps1`). |
| `bun run skills:refresh-upstream` | Copies **vendored** upstream skills from `.agents/skills/` into `docs/ai/skills/` for the pinned set (`supabase`, `supabase-postgres-best-practices`). Use this after refreshing those packages with the Skills CLI (see below). |

When you add or change a skill **only** under `docs/ai/skills/`:

```bash
bun run skills:sync
bun run skills:verify
```

Commit both the canonical files and any mirror updates.

**Updating vendored Supabase skills from upstream** (maintainers / periodic refresh):

1. `npx skills add supabase/agent-skills -y` — updates `.agents/skills/*` and `skills-lock.json` for packages tracked by the Skills CLI.
2. `bun run skills:refresh-upstream` — vendors the refreshed copies into `docs/ai/skills/supabase` and `docs/ai/skills/supabase-postgres-best-practices` (reconcile any repo-specific sections in those trees if the vendor copy overwrote them; see `scripts/refresh-upstream-skills.mjs`).
3. `bun run skills:sync` then `bun run skills:verify` — refresh mirrors and confirm a clean tree.

`setup:verify` (run at the end of setup) calls your Supabase URL with the anon key; a **401** means the URL and anon key are not a matching pair for the same project (fix values in `.env.local` and re-run setup).

### Package Manager

This project uses **bun** (v1.3+). Do not use npm/yarn/pnpm.

- **Startup Command**: `bun run dev`

### Monorepo Workspace Contract

This repository uses Bun workspaces + Turborepo with this contract:

```text
apps/*      -> deployable applications (admin, donor, missionary)
packages/*  -> shared runtime libraries used by apps
packages/env -> shared environment schema/config package (@asym/env)
tooling/*   -> shared tooling/config packages (eslint, tsconfig, etc.)
```

Use these placement rules:

- Put code in `apps/*` when it is app-specific routing/UI/behavior.
- Put code in `packages/*` when it is shared across two or more apps.
- Use `packages/env` for shared environment schemas/configuration.
- Put code in `tooling/*` only for build/lint/type/tooling configuration packages.

Workspace conventions:

- Every workspace package name must use `@asym/<name>`.
- Internal workspace dependencies must use `workspace:*` (not `file:` links).
- Root workspace globs in `package.json` are canonical: `apps/*`, `packages/*`, `packages/env`, `tooling/*`.

Guardrail command:

```bash
bun run verify:workspace-contract
```

This command validates workspace globs, package names, and internal dependency protocol.

Verify command behavior:

- `bun run verify` runs cross-platform verification with workspace contract checks.
- `VERIFY_HTTP=1 bun run verify` additionally checks `/`, `/login`, and `/register` on `http://localhost:3000`.
- `VERIFY_SUPABASE=1 bun run verify` additionally runs Supabase verification.

### Linting

Linting uses a unified ESLint flat config strategy:

- `apps/*` consume `@asym/eslint-config/nextjs.mjs`
- `packages/*` should consume `@asym/eslint-config/library.mjs`
- root `eslint.config.mjs` is a fallback/orchestrator config

Canonical lint entrypoint:

```bash
bun run lint
```

Architecture boundaries are enforced with `no-restricted-imports` so apps do not import from other apps directly.
Shared code should be moved into `@asym/*` packages.

For full config details, migration notes, and the pragmatic exception policy, see:
`tooling/eslint-config/README.md`.

### How to add a new app

1. Create a new folder under `apps/<app-name>/`.
2. Add `apps/<app-name>/package.json` with a scoped name (`@asym/<app-name>`).
3. Add any internal dependencies as `workspace:*`.
4. Add the app scripts (`dev`, `build`, `lint`, `typecheck`) so Turbo can orchestrate it.
5. Run `bun run verify:workspace-contract`.

Minimal app `package.json` example:

```json
{
  "name": "@asym/my-new-app",
  "private": true,
  "scripts": {
    "dev": "next dev",
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

1. Create a new folder under `packages/<package-name>/`.
2. Add `packages/<package-name>/package.json` with `name: "@asym/<package-name>"`.
3. Export from the package entrypoint and keep cross-package imports via package names.
4. Use `workspace:*` for internal dependencies.
5. Run `bun run verify:workspace-contract`.

Minimal package `package.json` example:

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

- `bun run format` (fix), `bun run format:check` (verify), `bun run lint`, and `bun run typecheck`
- `bun run build` (CI-equivalent defaults), `bun run build:strict` (real env), `bun run test:unit`
- `bun run test:e2e` (CI-equivalent defaults), `bun run test:e2e:strict` (real env), `bun run test:e2e:ui`
- `bun run verify` for localhost smoke (on Windows use Git Bash / WSL: `bash scripts/verify/index.sh`)
- `bun run verify:e2e` to re-run Playwright and validate the JSON report
- PR-readiness (matches blocking CI): `bun run format:check && bun run lint && bun run typecheck && bun run build && bun run test:unit`

### Git Hooks Setup

Git hooks now enforce two checkpoints:

- `pre-commit`: staged-file lint + format (`lint-staged`)
- `pre-push`: CI parity gate (`bun run ci:preflight`)

If you get "command not found" errors:

**macOS/Linux:**

```bash
mkdir -p ~/.config/husky && echo 'export PATH="/usr/local/bin:$PATH"' > ~/.config/husky/init.sh
```

**Windows:**

```bash
mkdir -p ~/.config/husky && echo 'export PATH="/c/Program Files/nodejs:$PATH"' > ~/.config/husky/init.sh
```

**Using nvm:** Replace with `export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"`

One-time setup per machine.

### Turborepo (Task Orchestration + Cache)

Use Turbo for consistent task execution (and caching where applicable):

- Local dev: `bunx turbo run dev`
- Cached checks: `bunx turbo run lint typecheck build`
- Formatting: `bun run format` (fix) / `bun run format:check` (verify)
- Internal package `build` tasks are source-first validation (`tsc --noEmit`) so packages participate in the Turbo graph without forcing a `dist`-first workflow.

Remote caching (Vercel Remote Cache) is enabled for internal PRs and protected branch CI (fork PRs do not have access to the required secrets/vars).

For a deterministic local build workflow (strict env vs CI-equivalent stub env), see `docs/guides/development/build-runbook.md`.
For lockfile/workspace-root warnings in Next builds, see the runbook section `Multiple lockfile warnings during Next.js build`.

### Key Dependencies

| Package               | Version | Notes                                      |
| --------------------- | ------- | ------------------------------------------ |
| Next.js               | 16.2.1  | App Router + Turbopack                     |
| React                 | 19.2.3  | Concurrent features                        |
| TypeScript            | 5.9.3   | Strict mode                                |
| motion                | 12.x    | Animation library (formerly framer-motion) |
| @tanstack/react-query | 5.x     | Server state management                    |
| @supabase/ssr         | 0.8.x   | Server-side Supabase client                |
| @sentry/nextjs        | 10.x    | Error monitoring                           |

### Verification Steps

```bash
# Fix formatting (only when needed)
bun run format

# PR-readiness (matches blocking CI)
bun run format:check && bun run lint && bun run typecheck && bun run build && bun run test:unit

# Optional (non-blocking in CI, but recommended for flow changes)
bun run test:e2e

# Full local validation sweep (includes husky prepare + build)
bun run validate:full

# Strict sanity checks with real env values in .env.local
bun run build:strict
bun run test:e2e:strict

# T1 merge gate (workspace contract only)
bun run verify:t1

# Check for outdated packages
bun outdated
```

### Supabase schema + money-unit QA (separate from T1)

The Supabase schema/migration + money-unit verifier changes are intentionally high-risk and should be QA-gated separately from T1.
Treat these as a dedicated branch/ticket track before merge:

```bash
# Optional DB+money QA gate (not part of the T1 contract gate)
bun run verify:supabase-money
```

`verify:money-units` samples these columns from Supabase/Postgres via the Supabase REST API:
`donations.amount`, `donor_pledges.amount`, `funds.target_amount`, `funds.goal_amount`, and `funds.current_amount`.

Interpretation:

- `YES`: values appear to be stored as integer cents.
- `NO`: values appear to be dollars (or mixed units), not cents.
- `INCONCLUSIVE`: sampled values are ambiguous; confirm with schema/migrations or known transactions.
- `ERROR`: the table/query could not be read with the current key or schema.

Notes:

- Uses `SUPABASE_SERVICE_ROLE_KEY` when present; otherwise falls back to `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- If any column reports `NO`, the script exits non-zero to make CI/local verification fail loudly.
- Files under this separate QA track include `supabase/migrations/20260214090000_foundation_1_schema.sql`, `supabase/schema.sql`, and `scripts/verify-money-units.ts`.

## Key Conventions

1. **RSC First**: Keep components as React Server Components unless interactivity is required.
2. **Next.js 16.2.1 Compliance**: Always `await` dynamic `params` and `searchParams` in routes and layouts.
3. **Zinc and Shadcn/ui Maia Aesthetic**: Use `zinc-900` for primary actions and `zinc-500` for secondary text.
4. **Responsive Integrity**: Test all UI changes on both 375px (Mobile) and 1440px (Desktop) viewports.

---

## App-Connected Development

To run this project locally against the hosted Supabase project, you only need the public URL + anon key.

Follow the Quickstart above, and set these required values in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### How to request access

Ask a maintainer for access to the shared dev Supabase project and request the project URL + anon key. Do not request service-role keys or database credentials.

### Demo login (optional)

The demo login flow uses `/api/auth/demo-account` with the public anon client and pre-seeded demo users.
Set `DEMO_ADMIN_EMAIL`, `DEMO_MISSIONARY_EMAIL`, `DEMO_DONOR_EMAIL`, and `DEMO_PASSWORD` in `.env.local` to enable the demo buttons.

For full sign-in mode, demo-only mode, and middleware/layout integration details, see
`docs/auth/sign-in.md`.

## Supabase CLI Workflow (Hybrid)

Use the repo entrypoint for all local Supabase CLI commands:

```bash
bun run supabase -- <supabase-subcommand>
```

How it resolves:

- Prefers a machine-global `supabase` CLI when available (fast path).
- Falls back to a pinned CLI version via `npx` when global CLI is missing.

Optional global install (recommended for speed):

```bash
# macOS / Linux (Homebrew)
brew install supabase/tap/supabase

# Windows (Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

## Supabase Demo Seed

Deterministic demo seed + optional read-only public policies live in:

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

Required env vars:

- `NEXT_PUBLIC_SUPABASE_URL=https://btewedpsxwsjczvmegby.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` (required safety gate)
- `SUPABASE_DB_URL` (direct Postgres connection URL for SQL execution)

Commands:

```bash
bun run db:migrate:hosted
bun run seed:demo:hosted
bun run seed:demo:verify
```

`seed:demo:verify` prints row counts and confirms the single-profile seed invariant.

## License

asymmetric.al is open source software licensed under the GNU Affero General Public License v3.0 only (AGPL-3.0-only).

- Full license text: see the `LICENSE` file in this repository.
- Source for the running service: the hosted app links to the exact tag or commit for the version you are using (Help > About, or `/help/about`).

### What AGPL means for hosted use

If you run a modified version of this software for users over a network, you must offer those users the Corresponding Source for the version that is running.

### Trademarks

The AGPL covers the source code in this repository. It does not grant permission to use our name, logo, or other trademarks. Treat all project marks as reserved unless we publish a separate trademark policy.

### Third party software

This project may include or integrate third party open source components. If we ship bundled third party code, we will include attributions and license notes in `THIRD_PARTY_NOTICES.md` or `NOTICE`.

---

Built with ❤️ for the Kingdom.
