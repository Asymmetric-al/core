# Change: Modernize OpenSpec 1.9

## Why

This modernization merged through PR #1325 on 2026-08-19. Core uses the
repository-pinned OpenSpec CLI, seven selected workflows, and explicit intended
versus implemented state. The preceding instructions mixed moving `@latest`
invocations, stale CRM context and incomplete routing; those are historical
reasons for this change, not current requirements. AL-1861 reconciles the
remaining documentation and adds active-delta verification without replacing
GitHub, TDD or repository quality gates.

## Accepted Contract

- Pin `@fission-ai/openspec` at exact stable `1.9.0` (tag `v1.9.0`, commit
  `2826b8889e5223a9a8095d4428b60b56597e1020`) and invoke it only through
  `bun run openspec --`.
- Keep schema `spec-driven`. `openspec/config.yaml` is injected planning
  context. `openspec/project.md` remains the concise human index.
- Import only Explore, Propose, Update, Apply, Verify, Sync, and Archive into
  `docs/ai/skills/` via the existing refresh/sync/verify pipeline.
- Keep numbered commands `/1-start-project` through `/4-close-project` as
  lightweight wrappers around those workflows.
- CI verifies skills, then Phase 25 generated views, then strict OpenSpec and
  active-delta applicability. `scripts/verify/ci-preflight.mjs` and
  `.github/workflows/ci.yml` own the executable stage order.
- Distinguish intended behavior from current reality. Archive only after
  implementation is accepted repository reality.
- Product-runtime Eve stays separate. The OpenSpec Guardian remains
  permanently read-only. This change grants no Eve write, sync, or archive
  authority.

## Capabilities

- `agent-instruction-system`: OpenSpec pin, selected workflows, source-of-truth
  model, numbered-command wrappers, CI validation, and Eve read-only boundary.

## Impact

- Root scripts, `bun.lock`, canonical OpenSpec skills and mirrors, instruction
  routing, numbered commands, CI preflight, and OpenSpec config/index.
- No product runtime, CRM deletion, Eve upgrade, or custom OpenSpec schema.

## Non-goals

- OpenSpec Stores, custom schemas, or native generated Cursor/Claude command trees
- New, Continue, Fast-forward, Bulk archive, or Onboard workflows
- A second skill registry or OpenSpec wrapper framework
- Running `openspec update` against the live customized repository
- Treating document publication or an administrative archive as product activation
- Twenty CRM runtime deletion (owned by `complete-twenty-crm-retirement`)
