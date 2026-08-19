# Asymmetric.al Core — OpenSpec Index

Injected planning context lives in `openspec/config.yaml`. This file is the
human-oriented index. It does not prove that proposed work has shipped.

## Current vs intended

- **Intended behavior:** explicit human decision, the approved active change
  for the exact work, durable specs, accepted ADRs, then PRDs/issues.
- **Current reality:** code and migrations, tests and CI, runtime evidence,
  then documentation.
- An active change governs what a branch is trying to change. It does not
  prove the behavior shipped.

## Spec taxonomy

**Platform intent** (`openspec/specs/platform-*/spec.md`):

| Spec              | Path                                             |
| ----------------- | ------------------------------------------------ |
| Product intent    | `openspec/specs/platform-product-intent/spec.md` |
| Surfaces          | `openspec/specs/platform-surfaces/spec.md`       |
| Principles        | `openspec/specs/platform-principles/spec.md`     |
| System boundaries | `openspec/specs/platform-boundaries/spec.md`     |

**Capability specs:** `donation-lifecycle`, `contribution-operations`,
`crm-core`, `identity-and-access`, `workflow-orchestration`,
`agent-instruction-system`, `eve-autonomous-operations`.

Architecture trees and route tables stay in
`docs/guides/architecture/overview.md`.

## Monorepo boundaries

- `apps/admin` — Mission Control (port 3030)
- `apps/donor` — donor app (port 3000)
- `apps/missionary` — missionary app (port 4000)
- `packages/api` — canonical business and data-access boundary
- `packages/auth`, `packages/database`, `packages/env`, `packages/ui`
- Asym Postgres owns application and CRM truth. Twenty CRM is retired.

## Instruction ownership

- `AGENTS.md` is the always-on coding-agent router.
- Canonical skills live under `docs/ai/skills/`.
- `.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` are generated
  mirrors (`bun run skills:sync` / `bun run skills:verify`).
- TDD is required for substantive behavior. UI preserves exact `base-maia`.

## OpenSpec workflow

Use the repository-pinned local CLI only:

```bash
bun run openspec -- list
bun run openspec -- show <item>
bun run openspec -- validate --all --strict
bun run openspec -- validate --archived
```

Selected workflows: Explore, Propose, Update, Apply, Verify, Sync, Archive.
Skills start at `docs/ai/skills/openspec-explore/SKILL.md`. Numbered commands
`/1-start-project` through `/4-close-project` wrap those workflows.

Do not enable New, Continue, Fast-forward, Bulk archive, Onboard, or Stores.
Do not run `openspec update` against this customized repository.
Do not archive until implementation is accepted repository reality.

## Authoritative links

- CRM truth: `docs/adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md`
- OpenSpec rulebook: `docs/ai/rules/openspec.md`
- Data access: `docs/guides/architecture/data-access-boundary.md`
- Instruction system: `openspec/specs/agent-instruction-system/spec.md`

## Validation

- `bun run openspec:validate`
- `bun run openspec:audit-archive`
- `bun run skills:verify`
- `bun run check`
- `bun run ci:preflight`
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

- Preserve the small Next.js-managed opening block in `AGENTS.md`; keep the
  committed `.next-docs/` fallback searchable without embedding its compressed
  file index in the always-on root instructions.
- Preserve nested `AGENTS.md` files under `supabase/` and `scripts/`.
- Keep instruction diffs surgical and avoid touching product code, tests,
  database files, or unrelated infra when working on the instruction system.
- When a change affects durable workflow or intended behavior, update OpenSpec
  alongside the checked-in instruction files.
