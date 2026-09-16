## Context

See proposal.md for motivation, scope, and PR #1655 status. Current Core uses
Bun/Turborepo with separate ESLint configs for admin, donor, missionary, and
shared UI. Root-only registration cannot enforce workspace linting.
`packages/ui/components.json`, shared CSS, `@asym/ui` exports, and
`cnfast`-based helpers are existing contracts to preserve.

## Goals / Non-Goals

**Goals:** one reusable tooling-owned policy; explicit consumer/authoring
profiles; honest discovery and cache acceptance; bounded debt; conditional
agent access to the same operational commands.

**Non-Goals:** design-system changes to satisfy generic defaults, application
runtime dependencies, app-local configuration/primitives, new agents or
providers, production access, or an independent framework upgrade.

## Decisions

- Own the plugin and exported policy in `tooling/eslint-config`; compose it
  explicitly into relevant root/workspace configs. A universal base policy
  would incorrectly affect non-web renderers and backend packages.
- Preserve shared configuration and CSS. Use supported component recognition
  and the installed package's demonstrated theme resolution. No fabricated
  app `components.json` or duplicated theme.
- Separate actual primitive authoring from consumption, including compositions
  inside `packages/ui`. Each exception needs a semantic reason and fixture.
- Prefer native rule-scoped suppression support for reviewed legacy debt.
  Ordinary commands must neither expand counts nor rewrite accepted debt.
  Configuration failures and new implementation violations are not debt.
- Add cross-workspace inputs/selection through existing Turborepo and CI
  surfaces. Do not enable ESLint file caching without proof of cross-file
  invalidation.
- Pin the published 0.1.0 package with a narrowly reviewed Bun compatibility
  patch for cross-project component identity through relative/mixed barrels.
  Runtime configuration uses the public ESLint plugin; no private API is called.
  Review and remove/rebase this local source repair on upgrade, and require
  canonical/local barrel plus unrelated same-name regression coverage.
- Keep operational instructions in
  `docs/ai/skills/moai-library-shadcn/references/design-system-lint.md`.
  The official `.agents/skills/shadcn` directory is ecosystem-owned;
  `docs/ai/skills/moai-library-shadcn` is the Core-owned overlay.
  Existing scoped UI instructions and real client roles point to the reference.
  Root `AGENTS.md` remains unchanged, minimizing overlap with PR #1655.
- Use the actual exported configs in Vitest compatibility fixtures and
  disposable cache/selection tests. Existing shadcn configuration, token-drift,
  Shadscan, motion, accessibility, import-boundary, and CI gates stay intact.
- Record the vetted version/provenance, exact commands, adopted matrix,
  exception rationale, and upgrade/rollback procedure in the reference as
  implementation evidence is obtained.

## Risks / Trade-offs

- Analyzer limits can misclassify wrappers, CVA-produced functions, forwarding,
  arbitrary variants, or runtime dimensions → targeted fixtures and narrow
  justified boundaries; do not register false class helpers.
- Tailwind discovery can degrade silently → explicit positive/negative health
  probes, including an invalid variant on plain HTML.
- Native suppression counts can hide replacement violations → review raw
  findings for edited code; do not describe count protection as identity tracking.
- Full analysis adds cost → measure app-local, shared-UI, and broader runs;
  use scoped iteration and correct Turborepo caching.
- Lint cannot prove rendered contrast, focus, motion, descendant CSS effects,
  opaque spreads, or recreated components → retain browser/a11y and existing
  complementary gates.
- PR #1655 remains proposed → no cherry-pick, merge, duplicated completion
  delta, or root instruction rewrite.

## Migration Plan

1. Inventory findings and classify genuine violations, authoring/runtime
   boundaries, discovery failures, analyzer limits, and temporary debt.
2. Establish compatibility fixtures before finalizing the shared policy.
3. Wire all applicable root/workspace entry points, cache inputs, and existing
   CI; adopt bounded fixes and explicit legacy acceptance.
4. Synchronize scoped agent guidance and prove command/discovery/cache
   behavior, performance, and applicable broader gates.
5. Leave this change active until merged and accepted repository reality.

Rollback is a reviewed reversal of the policy, dependency/lockfile and Bun patch changes,
wiring, debt files, tests, and scoped instruction additions. Do not revert
unrelated work or delete existing shadcn, token-drift, motion, or CI checks.
No database migration, environment variable, credential, or production
deployment is part of adoption or rollback.
