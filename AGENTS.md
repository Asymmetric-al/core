<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Core repository instructions

This is the always-on Codex entrypoint for `Asymmetric-al/core`. Keep it a compact constitution and router. Detailed procedures belong in the nearest nested `AGENTS.md`, a canonical rulebook, a discovered skill, configuration, or ordinary documentation.

## Start every task

1. Identify the app, package, or operational area in scope.
2. Read the nearest applicable `AGENTS.md` before editing that subtree.
3. Inspect current source, tests, manifests, and configuration before choosing a workflow.
4. For non-trivial behavior, workflow, or durable-convention changes, read `openspec/project.md`, the relevant `openspec/specs/**`, and matching active changes under `openspec/changes/**`.
5. Load a discovered skill when its description matches. Do not use skill instructions as a substitute for repository context.
6. Preserve user-owned changes and keep the diff focused on the requested outcome.

## Repository map

Core is a Bun + Turborepo monorepo with three Next.js App Router applications:

- `apps/admin` (`@asym/admin`) — Mission Control
- `apps/donor` (`@asym/donor`) — donor experience
- `apps/missionary` (`@asym/missionary-app`) — missionary experience

Apps own surface-specific routes and UI. Shared behavior belongs in workspace packages such as `packages/api`, `packages/auth`, `packages/database`, `packages/env`, and `packages/ui`. Use `package.json`, `turbo.json`, and `docs/ai/monorepo-architecture.md` for the current workspace and command details; do not duplicate volatile package versions here.

## Authority and evidence

When repository sources conflict, use this order:

1. The current user request and applicable safety or approval boundaries.
2. Merged OpenSpec intent; active OpenSpec changes describe proposed work and do not silently override current source.
3. This file, then the nearest nested `AGENTS.md` and applicable canonical rulebook.
4. Current source, tests, manifests, lockfiles, installed package documentation, and runtime evidence.
5. Current official external documentation for the installed version.
6. General model knowledge only as a last resort.

Prefer verifiable local evidence over remembered APIs. When runtime state matters and a relevant tool is actually registered and available, inspect it rather than guessing. Optional helpers such as Nia are never required for basic repository correctness; the conditional Nia workflow lives in `docs/ai/nia.md`.

## Scoped instructions

Open the closest file for the path being changed:

| Scope                               | Instruction file                 |
| ----------------------------------- | -------------------------------- |
| Admin app                           | `apps/admin/AGENTS.md`           |
| Donor app                           | `apps/donor/AGENTS.md`           |
| Missionary app                      | `apps/missionary/AGENTS.md`      |
| Server APIs and mutations           | `packages/api/AGENTS.md`         |
| Auth and sessions                   | `packages/auth/AGENTS.md`        |
| Database types and browser data     | `packages/database/AGENTS.md`    |
| Shared UI                           | `packages/ui/AGENTS.md`          |
| Product Eve runtime                 | `packages/eve-runtime/AGENTS.md` |
| Supabase migrations and seed        | `supabase/AGENTS.md`             |
| Operational and maintenance scripts | `scripts/AGENTS.md`              |

Nested files contain only local constraints. They do not replace repository-wide rules.

## Domain routing

| Work                                 | Read before editing                                     |
| ------------------------------------ | ------------------------------------------------------- |
| General workflow, branches, PRs, CI  | `docs/ai/rules/general.md`                              |
| Frontend, UI, UX, accessibility      | `docs/ai/rules/frontend.md` and `packages/ui/AGENTS.md` |
| Backend, auth, Supabase, data        | `docs/ai/rules/backend.md`                              |
| API routes or business data access   | `docs/guides/architecture/data-access-boundary.md`      |
| Tests, Playwright, a11y, performance | `docs/ai/rules/testing.md`                              |
| OpenSpec changes                     | `docs/ai/rules/openspec.md`                             |
| TypeScript configuration             | `docs/ai/rules/typescript-future-proofing.md`           |
| Skill selection or maintenance       | `docs/ai/rules/agent-skill-routing.md`                  |
| Automated code review                | `docs/ai/rules/review-bots.md`                          |

## Critical Core invariants

- **Product safety:** tenant and permission correctness outrank convenience. Preserve financial and operational truth, keep secrets and privileged effects server-side, and never weaken auth, payment, webhook, or data boundaries for a shortcut. Relevant durable intent lives in `openspec/specs/platform-principles/spec.md` and `openspec/specs/platform-boundaries/spec.md`.
- **Data ownership:** business database logic belongs in `packages/api`; app API route handlers stay thin. Browser-visible table access uses approved `packages/database` collections and hooks. Follow the data-access boundary guide and its enforced exceptions.
- **UI system:** every UI or UX change must preserve exact `base-maia`, Base UI primitives, Zinc-oriented semantic CSS-variable tokens, shared ownership in `packages/ui`, and the existing Core design language. Do not introduce another style, preset, primitive base, component system, or app-local fork.
- **TDD:** substantive features, bug fixes, and behavior-changing refactors use red-green-refactor at the nearest stable seam. Documentation-only, formatting-only, exact generated mirrors, and provenance-only changes use deterministic structural verification instead of artificial failing tests.
- **Next.js navigation:** all apps use Cache Components and partial prefetching. For route work, inspect the app config and treat each server await as an intentional Stream, Cache, or Block decision. Detailed rules and tests live in the frontend rulebook and matching Next.js skills.
- **Generated and mirrored content:** consult `docs/ai/protected-paths.md` before editing generated, mirrored, or vendored trees. Canonical skill sources live in `docs/ai/skills`; use `bun run skills:sync` to write mirrors and `bun run skills:verify` to check them without mutation.

## Next.js and runtime truth

For Next.js work, read the nearest matching `node_modules/next/dist/docs/`. If installed docs are unavailable, search the committed `.next-docs/` tree directly. Do not regenerate or embed a compressed documentation index in this file.

Use live Next.js diagnostics or browser inspection only when the relevant server and tool are available. Tool registration belongs in `.codex/config.toml`; task-specific usage belongs in the matching skill or rulebook, not in this always-on file.

## Skills

Codex discovers repository skills from `.agents/skills` and loads their full instructions only when invoked or matched. Use clear skill descriptions as the routing layer; do not maintain an individual skill catalog here.

For canonical skill authoring or ambiguous routing, use `docs/ai/rules/agent-skill-routing.md`. Edit canonical sources rather than generated mirrors, then run the repository sync and verification commands.

## Commands and verification

Use Bun and the scripts declared in the current root `package.json`.

- Dev: `bun run dev:admin`, `bun run dev:donor`, `bun run dev:missionary`
- Standard code gate: `bun run check`
- Individual gates: `bun run lint`, `bun run typecheck`, `bun run test:unit`, `bun run format:check`
- Workspace contract: `bun run verify:workspace-contract`
- PR/push readiness: `bun run ci:preflight`

Run the smallest relevant checks while iterating, then the broader gate proportional to risk. Do not bypass hooks or claim checks that were not run. Secrets stay out of source, docs, commands, and logs.

## Code review rules

- Report behavior findings only with concrete `file:line` evidence.
- Prioritize data loss, tenant/auth bypass, money/payment/webhook errors, migration hazards, crashes, and real regressions.
- Missing coverage on new money, auth, or data behavior is substantive; formatting and naming are not blockers unless they hide correctness risk.
- On re-review, raise only new blocking or important findings. Do not create fix-then-nit loops.
