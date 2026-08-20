# Change: Modernize OpenSpec 1.9

## Why

Core already uses OpenSpec as its durable planning and specification system,
but live instructions still mixed `@latest` invocation, stale CRM context, and
incomplete workflow routing. Coding agents need an exact pinned CLI, seven
selected official workflows, and a clear split between intended behavior and
current reality — without replacing GitHub, TDD, quality, or the post-#1324
agent-instruction architecture.

## What Changes

- Pin `@fission-ai/openspec` at exact stable `1.9.0` (tag `v1.9.0`, commit
  `2826b8889e5223a9a8095d4428b60b56597e1020`) and invoke it only through
  `bun run openspec --`.
- Keep schema `spec-driven`. `openspec/config.yaml` is injected planning
  context. `openspec/project.md` remains the concise human index.
- Import only Explore, Propose, Update, Apply, Verify, Sync, and Archive into
  `docs/ai/skills/` via the existing refresh/sync/verify pipeline.
- Keep numbered commands `/1-start-project` through `/4-close-project` as
  lightweight wrappers around those workflows.
- Run strict validation in CI after `skills:verify`.
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
- Archiving this change before the implementation merges
- Twenty CRM runtime deletion (owned by `complete-twenty-crm-retirement`)
