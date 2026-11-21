# Proposal

## Why

Every push from a developer or agent machine runs the whole local preflight:
about twenty serial stages that end in the full unit suite and include a
network call. On a busy machine it takes close to an hour and fails from load
alone. On 2026-11-18 one push failed it four times in a row. It cannot pass
on native Windows at all. Required CI (`ci-gate`, `e2e-smoke-gate`, `migrate`
and `smoke`, with admins enforced) already runs every one of those stages, so
nothing the hook stops could reach `develop` without CI. Agents also learn
about format and lint failures only at commit or push, because no harness
formats or lints a file when an agent edits it (issue #2710).

## Authority

The owner ruled on 2026-11-18. Step 4 as offered: "Fast pre-push profile
(keep the `PASS ci:preflight` line the factory reads), plus harness hooks
that format and lint on edit". Owner: "do #4".

On the same day the owner said the factory "will not be fully central to how
we are building anymore, it's not irrelevant, it's juts not central". This
change therefore keeps what the factory checks and spends nothing more on it
than one profile selector set by its publish step.

The owner also said: "work carefully to not break anything or cause any
regression in quality", and asked that agents follow the practices in the
Next.js AI-agents guide (`.next-docs/01-app/02-guides/ai-agents.mdx`). The
three Next.js guidance items below come from the gap check against that
guide.

## What Changes

- **BREAKING (workflow):** a push that does not target `production` runs a
  fast profile instead of the full preflight. The fast profile runs the
  runtime check, Prettier on the files the branch changed, lint and typecheck
  of the affected workspaces (the same `turbo --affected` selection CI
  uses), the two verifiers that take under a second, and each
  other repository verifier only when the push changes its inputs (the phase
  projection checks, strict OpenSpec validation and delta checks, the data
  boundary, CMS sole-entry and workspace contract checks, and the shadcn
  upstream review). It runs no unit, acceptance or build stage, and leaves
  `skills:verify` and `verify:eslint` to the full profile because they took
  183 s and 54 s on the loaded Windows host. It needs the network only for
  the shadcn upstream review, which runs for a push that changes one of its
  inputs, an empty or unreadable branch diff, or a review baseline or
  tsconfig chain that cannot be read.
- `bun run ci:preflight` keeps running the full profile, now with the
  acceptance suite as its own stage. `bun run ci:preflight -- --full` keeps
  its meaning (full profile plus compilation of every app).
  `bun run ci:preflight -- --fast` runs the fast profile by hand.
- A push that targets `production` still passes the production guard and
  then runs `ci:preflight -- --full`. The guard is unchanged.
- The factory's publish step sets `ASYM_PRE_PUSH_PROFILE=full`, so its pushes
  keep running the full profile. Only a full-profile pass prints
  `==> PASS ci:preflight`; the fast profile's pass line cannot match it.
- A failed stage prints its name, the exact command that re-runs it alone,
  and the last lines of its output, then stops. A pass names the profile.
- One shared edit hook (`scripts/agent-hooks/after-edit.mjs`) runs Prettier
  (write) on the files of one agent edit and then ESLint on the source files
  among them, one run each, with the root configuration the pre-commit hook
  uses. It applies no ESLint fixes, because each fix in that configuration
  can remove, move or rewrite code mid-task; it reports lint errors and
  fixable problems in a few lines, stops within a 100 s budget, and acts only
  inside its own checkout. It is wired as one hook per harness: Claude Code
  (`.claude/settings.json`, `PostToolUse`), Codex (`.codex/hooks.json`,
  `PostToolUse`) and Cursor (`.cursor/hooks.json`, `afterFileEdit`).
- The three product apps' `AGENTS.md` gain a runtime-verification step
  (`next-dev-loop`, reuse the running dev server, compile through the Next.js
  MCP tools, no `next build` while editing). The factory Console's
  `AGENTS.md` gains the generated Next.js managed block, and the root block's
  heading matches the generated text.
- The push-gate rulebook tells agents what to do when `next build` or
  `next dev` stops with an upgrade recommendation.

## Non-goals

- No workflow, branch-protection, review-automation or required-check
  change. Workstream C (#2711) owns CI scope, including moving
  `verify:shadcn-config` into a required check.
- No change to `test:unit`, `test:acceptance` or other test scripts in
  `package.json`, to `.husky/pre-commit`, or to ESLint and Prettier
  configuration.
- No stop-time typecheck or test hook in any harness, and no `next` CLI or
  Next.js MCP call in the edit hook.
- No change to the `agentUpgrade` setting (an owner decision).
- No further factory change: its publish step only sets the selector.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-instruction-system`: adds requirements for local push profiles,
  for agent-harness edit hooks, and for runtime verification guidance in the
  Next.js apps. The existing pre-push isolation requirement is unchanged and
  applies to both profiles.

## Impact

- `.husky/pre-push` (unchanged entry point), `scripts/git/pre-push.mjs`,
  `scripts/verify/ci-preflight.mjs` and their tests.
- `scripts/archon-factory/pack/.shared/publication.mjs` (one environment
  selector on the publish step) and the qualification script that mirrors it,
  with tests.
- New `scripts/agent-hooks/after-edit.mjs` and its tests;
  `.claude/settings.json`, new `.codex/hooks.json` and `.cursor/hooks.json`.
- Documents that describe the push gate: `docs/ci.md`, `CONTRIBUTING.md`,
  `README.md`, `contribution-workflow.md`, `docs/ai/rules/general.md`,
  `docs/ai/rules/testing.md`, `docs/ai/protected-paths.md`,
  `docs/ai/repo-groundtruth.md`, `docs/ops/production-release.md`, and the
  app `AGENTS.md` files named above.
- Required CI still covers everything the fast profile leaves out or scopes,
  except `verify:shadcn-diff` (network), which no CI job runs today; the fast
  profile now runs it when a push changes one of its inputs, and the full
  profile always runs it.
- The factory's scope validator protects `scripts/agent-hooks/**`,
  `.codex/hooks.json` and `.cursor/hooks.json` beside `.claude/**`.
- Rollback: revert the change's commits. The hook returns to running the full
  preflight on every push; the factory selector is then ignored.
