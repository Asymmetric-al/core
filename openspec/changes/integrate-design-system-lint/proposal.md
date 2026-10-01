## Why

Core's shared Base UI components and exact `base-maia` system already carry
design decisions that consumer code can accidentally override. Integrate
`@shadcn/lint` into normal linting and conditional agent workflows so those
decisions are checked consistently, with explicit authoring boundaries and
visible legacy debt.

## What Changes

- Add one tooling-owned six-rule policy to applicable first-party web UI,
  shared by root and workspace ESLint entry points.
- Verify component resolution, real Tailwind theme analysis, and consumer
  cache invalidation; preserve existing lint, CI, hooks, and UI guardrails.
- Inventory existing findings, fix bounded safe usages, and represent
  remaining debt explicitly without silently expanding accepted debt. The
  2026-09-22 completion scope includes retiring all accepted legacy UI debt.
- Extend the existing Core shadcn overlay and scoped client/role routes.
  Synchronize generated mirrors through the existing scripts.
- Add compatibility fixtures, instruction-routing checks, operational
  commands, upgrade/rollback guidance, and measured verification evidence.

## Capabilities

### New Capabilities

- `design-system-lint`: Shared web-UI enforcement, exceptions, legacy debt,
  discovery health, cache correctness, and compatibility verification.

### Modified Capabilities

- `agent-instruction-system`: Conditional routing to the canonical
  design-system lint workflow across supported clients and existing roles.

## Impact

Affected areas are `tooling/eslint-config`, root/app/shared-UI lint and task
configuration, development dependencies and lockfile, focused tests,
scoped agent guidance, and corrections across the affected first-party UI
surfaces. Business behavior, production data, secrets, deployments, unrelated framework migrations,
and new agent/provider infrastructure are outside scope.

## Completion scope confirmed on 2026-09-22

The user requested deep current-upstream research, a fully operational modern
lint setup, and explicitly selected **Include legacy UI cleanup**. The prior
accepted baseline is migration input, not the completion target. Upgrade the
vetted analyzer and compatible tooling, reproduce and close analysis gaps,
then classify and repair the complete fresh inventory. Completion requires
zero remaining bulk-accepted findings, no ordinary lint warnings, and
verified UI behavior; do not obtain that result by broad policy relaxations,
moving styles into opaque code, or accepting additional debt.

PR [#1655](https://github.com/Asymmetric-al/core/pull/1655) was open at
`fc5e54dd05f21744e152991273a81e38dde92f38` on 2026-09-16, targeting
`develop`, with required owner approval still outstanding. Its guidance is
proposed. This change leaves root `AGENTS.md` and its
`clarify-agent-task-completion` delta untouched, and uses scoped routing,
explicit-only skill semantics, authorized completion, and proportional
checks that preserve required gates.

The merged instruction spec still mentions a compressed Next.js index,
while the current root, tests, `openspec/project.md`, and active
`slim-codex-agent-router` change require its absence. Preserve the current
managed opening block and index-free root; resolving that older spec
lifecycle is outside this change.

Rollback reverts the new policy, dependency/lockfile changes, command/task
wiring, and matching documentation/spec delta together. Preserve unrelated
UI fixes only after independent review. Leave this change active until the
implementation is merged and accepted repository reality.
