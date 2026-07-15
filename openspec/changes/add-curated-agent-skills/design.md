# Design: Curated Repo-Local Agent Skills

## Context

The requested source list contains six topics. Core already has strong overlap
for two, has a conflicting package-manager standard for one, and has concrete
catalog gaps for three. Canonical skills must live under `docs/ai/skills/` and
generated mirrors must remain subordinate to OpenSpec, `AGENTS.md`, and rulebooks.

## Curation decisions

| Requested topic             | Disposition                | Rationale                                                                                                                                                                                                                                                                                      |
| --------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Make interfaces feel better | Reuse existing guidance    | `impeccable`, `emil-design-engineering`, `emil-design-eng`, and `anim` already cover optical alignment, typography, touch targets, polish, motion, and live UI iteration under Core's token/Base UI rules. The upstream's fixed visual values would conflict with those rules.                 |
| 12 principles of animation  | Reuse existing guidance    | `animation-vocabulary`, `anim`, `improve-animations`, and `review-animations` cover the useful vocabulary and review workflow. The source advertises MIT in frontmatter but contains no repository license text, and generic rules such as mandatory press scaling/springs conflict with Core. |
| Accessibility fixes/review  | Add `accessibility-review` | Core has a11y rules and axe coverage but no narrow remediation workflow joining semantics, keyboard/focus, Base UI, forms, perception, manual review, and automated limits.                                                                                                                    |
| Vitest practices            | Promote as `vitest`        | A generic `antfu/skills` install exists in `skills-lock.json`, but its content targets Vitest 5 beta. The canonical adapter follows Core's resolved Vitest 4.1.x, config, setup, commands, and coverage caveat.                                                                                |
| pnpm practices              | Exclude                    | Core standardizes on Bun and Turborepo. Package-manager-neutral dependency cleanup already lives in `npm-deps-cleanup`; pnpm-specific commands/config would be misleading.                                                                                                                     |
| Playwright CLI              | Add `playwright-cli`       | Interactive agent-driven browser inspection is distinct from committed Playwright Test patterns. The adapter uses the official CLI conditionally without adding a dependency.                                                                                                                  |

## Skill shape

Each new `SKILL.md` contains only narrow triggers, Core precedence, a reusable
workflow, guardrails, and a checklist. Detailed provenance is progressively
disclosed through `references/upstream.md`. No upstream skill file is copied
verbatim.

## Runtime and Eve boundary

`bun run skills:sync` mirrors canonical files into `.agents/skills/`,
`.cursor/skills/`, and `.claude/skills/`. That filesystem compatibility is the
only Eve-adjacent effect. This change adds no Eve-specific imports, registry
code, prompts, orchestration, runtime packages, or subagent behavior.

## Verification

- Validate each new skill with the skill-creator validator.
- Run `bun run skills:sync` and `bun run skills:verify`.
- Run formatting and focused instruction-system/OpenSpec checks.
- Confirm no pnpm files/commands, dependency changes, product code, or Eve
  runtime changes enter the diff.
