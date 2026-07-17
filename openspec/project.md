# Asymmetric.al Core Project Context

## Overview

Asymmetric.al core is a Bun + Turborepo monorepo for a kingdom-impact platform.
It contains three Next.js App Router applications plus shared workspace
packages for API access, auth, database access, email, environment handling,
and UI.

## Product And Platform Intent (OpenSpec)

The spec tree is two-layered (OpenSpec discovers `openspec/specs/<id>/spec.md`):

**Intent layer** — durable big-picture context for **what we build** and
**why**. Scenarios in these specs may describe agent decision-making:

| Spec                                                               | Path                                             |
| ------------------------------------------------------------------ | ------------------------------------------------ |
| Product intent (customer, goals, scope, long-horizon success)      | `openspec/specs/platform-product-intent/spec.md` |
| Surfaces (admin, donor, missionary, public UX intent)              | `openspec/specs/platform-surfaces/spec.md`       |
| Principles (canonical priority ladder, decision criteria)          | `openspec/specs/platform-principles/spec.md`     |
| System boundaries (trust contracts, CRM/CMS, scope, sensitive ops) | `openspec/specs/platform-boundaries/spec.md`     |

**Capability layer** — verifiable behavior contracts for specific system
capabilities. Scenarios are written as system behavior (WHEN/THEN about the
product). The current capability specs are `donation-lifecycle`,
`contribution-operations`, `crm-core`, `identity-and-access`,
`workflow-orchestration`, `agent-instruction-system`, and
`eve-autonomous-operations`; new feature-level contracts get their own
capability spec (named for the durable capability, not the current vendor)
rather than growing the intent specs.

**Capability spec backlog** — shipped subsystems that still lack a capability
spec, in rough priority order. Each needs code-grounded authoring before it
governs current truth; add them in follow-up work rather than growing the
intent specs:

1. `support-hub` / inbound-communications (tenant-safe inbound email routing,
   support conversations — many terms already in `CONTEXT.md`).
2. `outbound-communications` / email-studio (templates, versioning, single
   Resend send boundary — `contribution-operations` and `platform-boundaries`
   already delegate to it).
3. `mission-control-automations` (declarative definitions, `automation:manage`
   gate, preview + test run before activation).
4. `mission-control-tasks` (one shared staff task model; Needs Attention as a
   view, not a separate model).
5. `public-website-cms` (published-only, tenant-scoped reads; Payload runtime
   isolated to admin).

Missionary-workspace role-scoping folds into `identity-and-access`; reporting,
mobilization, and documents stay on this watch-list until their money or
permission depth warrants a spec.

Structural detail (directory trees, diagrams, route tables) remains in
`docs/guides/architecture/overview.md`. Keep OpenSpec intent and architecture
docs aligned when behavior or naming changes.

## Monorepo Layout

- `apps/admin` (`@asym/admin`) — admin and mission-control surface
- `apps/donor` (`@asym/donor`) — donor-facing surface
- `apps/missionary` (`@asym/missionary-app`) — missionary-facing surface
- `packages/api` — shared API and data-access boundary for app code
- `packages/auth` — shared auth and middleware primitives
- `packages/database` — database package; app route handlers should not import
  it directly
- `packages/env` — shared environment schema and configuration
- `packages/ui` — shared UI system and editor surfaces
- `tooling/*` — shared linting and TypeScript config

## Technical Baseline

- Package manager and runtime: Bun
- Task runner: Turborepo (`turbo` 2.9.x)
- Framework: Next.js `16.2.6` across all Next.js workspaces
- React: `19.2.x`
- TypeScript: `6.0.x`
- Styling: Tailwind CSS `v4`, Base UI, shadcn/ui Maia theme
- Data and auth: Supabase
- Payments: Stripe
- State and data fetching: TanStack Query

All three Next.js apps currently enable `cacheComponents: true`. In this repo,
that means App Router segment config exports such as `runtime`, `revalidate`,
or `dynamic` are not the normal escape hatch. Follow the existing runtime and
data-access rules in `docs/ai/rules/backend.md` and the architecture guides.

## Architecture and Data Boundaries

- Use `packages/api` as the primary boundary for shared data access patterns.
- Treat `docs/guides/architecture/data-access-boundary.md` as the authoritative
  rule when touching route handlers or database access.
- Route handlers often depend on Node.js-only behavior, Supabase server/admin
  clients, Stripe, or `next/headers`; do not infer runtime changes from older
  Next.js patterns.
- Preserve current monorepo boundaries: apps own app-specific routes and UI,
  packages own code shared across multiple apps.

## AI Instruction System

The repo already has a strong, hand-maintained instruction system:

- `AGENTS.md` is the always-on routing layer for agents.
- `CLAUDE.md` imports `@AGENTS.md` and should stay aligned.
- `cursor.md`, `.cursor/rules/*`, `.cursor/commands/*`,
  `.github/copilot-instructions.md`, and `.github/instructions/*.instructions.md`
  are helper layers that must stay coherent with `AGENTS.md`.
- Canonical repo-local skills live under `docs/ai/skills/*/SKILL.md`; mirrors in
  `.cursor/skills/*`, `.agents/skills/*`, and `.claude/skills/*` (plus `.claude/commands/` and `.claude/agents/`) are runtime copies, not the source
  of truth.
- Optional **Skills CLI** or vendored ecosystem installs (for example
  mattpocock packs) are mirror-only helpers under `.agents/skills/<name>/`
  and `.cursor/skills/<name>/` unless explicitly promoted into
  `docs/ai/skills/<name>/`. Refresh them with the Skills CLI or documented
  vendor source, then run `bun run skills:sync` and `bun run skills:verify`.
  Pins live in **`skills-lock.json`** (CLI-installed paths, vendored upstream
  paths under `skills/deprecated/` or `skills/misc/`, and repo-local stubs
  such as **`prd-to-plan`** / **`domain-model`**). Treat these like other
  conditional helpers: they do not override OpenSpec or canonical
  `docs/ai/skills/` — route from **`AGENTS.md`**.
- Local Next.js docs under `node_modules/next/dist/docs/` are the framework
  source of truth; committed `.next-docs/` is the fallback for environments
  where `node_modules` is absent.
- Next.js devtools MCP is configured in root `.mcp.json` and
  `.cursor/mcp.json`. TanStack work uses the official TanStack CLI plus
  current Intent skills as routed by `AGENTS.md`; there is no repo-owned
  TanStack MCP server in those MCP configs.
- Nia is the preferred source for repo-grounded research and fresh third-party
  dependency context when the client exposes it. If Nia is configured in the
  workspace but unavailable in the current session, agents should fall back to
  repo reads plus official docs and state that fallback honestly.
- Provider plugins and Codex capability layers are conditional helpers. They
  are useful when installed, but they do not override OpenSpec, repo-local
  instructions, canonical skills, or local framework docs.

## OpenSpec Expectations

- Use `openspec/project.md` for durable project context and repo-wide
  conventions.
- Use `openspec/specs/**` for the current intended behavior of durable systems.
- Use `openspec/changes/**` for proposed or active work that changes behavior,
  workflow, or long-lived repo conventions.
- Archive a change promptly once its work has shipped and been verified
  (`bunx @fission-ai/openspec@latest archive <change> --yes`). Completed
  changes left active make `openspec/specs/**` stale, because their deltas
  never merge into current truth.
- The OpenSpec change is the canonical feature-definition unit (`proposal.md`
  for why/what, `design.md` for how). PRDs under `docs/prds/` are optional
  supporting narrative linked from a change; on conflict, OpenSpec wins.
- Before non-trivial feature work, behavior changes, or multi-step project work,
  read this file plus the relevant specs and active changes.
- Use `bunx @fission-ai/openspec@latest <command>` as the repo-safe default for
  OpenSpec CLI work. If `openspec` is already installed on `PATH`, that is
  equivalent. If Bun is unavailable, use
  `npx -y @fission-ai/openspec@latest <command>`.
- Prefer `bunx @fission-ai/openspec@latest list`,
  `bunx @fission-ai/openspec@latest show`,
  `bunx @fission-ai/openspec@latest view`, and
  `bunx @fission-ai/openspec@latest validate` to inspect current OpenSpec
  state.
- Do not run `openspec update` casually in this repo. The repo hand-maintains
  AGENTS, Cursor, Copilot, and Codex-facing instruction files, and bulk
  regeneration could overwrite or duplicate important routing logic.

## Current-State Notes (transient, not durable intent)

These record where the shipped product does not yet match durable intent, so
agents do not mistake scaffolding for the intended contract. Remove each note
when the gap closes.

- The public `/workers` missionary directory and missionary profile pages
  render demo scaffolding from `@asym/mock-data` with a mock checkout that does
  not call the real donate API. They are not yet backed by real CRM missionary
  entities or CMS page content. The durable intent (CRM owns the missionary,
  CMS owns the page, public giving is native) lives in `platform-boundaries`
  and `platform-surfaces`; the mock pages are placeholder scaffolding, not the
  contract.

## Validation Commands

Use these commands as the repo-wide verification baseline:

- `bun run check`
- `bun run lint`
- `bun run typecheck`
- `bun run test:unit`
- `bun run format:check`
- `bun run verify:workspace-contract`

Scoped app commands:

- `bun run dev:admin`
- `bun run dev:donor`
- `bun run dev:missionary`
- `bunx turbo run lint --filter=@asym/admin`
- `bunx turbo run lint --filter=@asym/donor`
- `bunx turbo run lint --filter=@asym/missionary-app`
- `bunx turbo run typecheck --filter=@asym/admin`
- `bunx turbo run typecheck --filter=@asym/donor`
- `bunx turbo run typecheck --filter=@asym/missionary-app`

## Operating Constraints

- Preserve the Next.js-managed block and compressed docs index in `AGENTS.md`.
- Preserve nested `AGENTS.md` files under `supabase/` and `scripts/`.
- Keep instruction diffs surgical and avoid touching product code, tests,
  database files, or unrelated infra when working on the instruction system.
- When a change affects durable workflow or intended behavior, update OpenSpec
  alongside the checked-in instruction files.
