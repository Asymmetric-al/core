# Add Curated Repo-Local Agent Skills

## Why

Core's shared skill catalog has broad frontend craft, motion, accessibility
testing, and Playwright Test coverage, but it lacks narrow canonical routes for
accessibility remediation, restrained animation-opportunity discovery, and
interactive Playwright CLI work. Vitest exists only as a generic ecosystem
mirror whose upstream text targets a different major version than Core's
installed harness.

## What Changes

- Add canonical Core adapters for accessibility review, restrained animation
  opportunity discovery, Vitest 4 practices, and Playwright CLI browser
  automation under `docs/ai/skills/`.
- Record upstream repositories, paths, reviewed commit SHAs, licenses,
  adaptation decisions, and refresh workflows.
- Route the new skills narrowly from `AGENTS.md` and the applicable frontend and
  testing rulebooks.
- Generate Codex, Cursor, and Claude Code mirrors through `skills:sync`.
- Reuse existing Impeccable and Emil/Core motion skills instead of duplicating
  the interface-polish and 12-principles sources.
- Keep `find-animation-opportunities` distinct from existing motion audit,
  review, and implementation guidance by making it read-only, limiting its
  output, and requiring explicit non-opportunities.

## What Does Not Change

- No Eve runtime, orchestration, subagent, routing implementation, or behavior.
- No application code, production behavior, dependency, database, or env var.
- No pnpm skill, pnpm command, pnpm config, pnpm lockfile, or package-manager
  migration; Core remains Bun + Turborepo.
- Playwright CLI remains optional one-off agent tooling and does not replace
  Core's committed `@playwright/test` suites.

## Expected Outcome

Agents receive small task-triggered skills that match Core's actual stack and
can later be consumed by Eve subagents through the same filesystem catalog,
without loading every skill into every prompt or changing Eve today.
