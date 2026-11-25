# Upgrade UI SDK to 0.1.0-beta.17 and OpenSpec to 2.2.0

## Why

Core currently pins Vercel UI SDK (`@ui-sdk/core` and `@ui-sdk/react`) to
`0.1.0-beta.2` and OpenSpec (`@fission-ai/openspec`) to `2.1.0`.

- **UI SDK `0.1.0-beta.17`** (`vercel-labs/ui` commit `d850982bd8aed202e07009825c3d9daf643fa24e`,
  tagged `@ui-sdk/core@0.1.0-beta.17` and `@ui-sdk/react@0.1.0-beta.17`,
  2026-11-24) delivers 15 beta releases of bug fixes and behavioral hardening
  across `@ui-sdk/core` and `@ui-sdk/react`: stricter agent step validation,
  explicit failure when a consumer cancels a `set*` agent action or passes
  out-of-bounds numeric values, inert/hidden region filtering, improved label
  spacing, WebMCP `consequentialHint` and refusal reporting, `checkPattern`
  ignoring `aria-hidden` native form inputs (fixing radio-group/rating
  conformance checks), `createReorder` pointer-capture and focus-follow fixes,
  `usePrimitive` bind-write flushing, and refreshed `ui-sdk` skill guidance.
- **OpenSpec `2.2.0`** (`Fission-AI/OpenSpec` commit `f1cd852f4edce22b8df9548a4df889172ca8ff25`,
  tagged `v2.2.0` and `@fission-ai/openspec@2.2.0`, 2026-11-24) introduces the
  official `openspec` router skill (with its `references/` files) as the
  single starting point for OpenSpec requests, hardens `openspec-archive-change`
  to check archive collisions before writing main specs, and refines delta/spec
  parsing (frontmatter handling and raw-HTML detection in `specs-apply.js` and
  `requirement-blocks.js`).

Upgrading both cohorts deliberately keeps Core's shared UI wrappers, browser
conformance checks, specification validation pipeline, and agent skill catalog
current and verified.

## What Changes

- **UI SDK cohort (`0.1.0-beta.2` → `0.1.0-beta.17`):**
  - Bump exact pins for `@ui-sdk/core` and `@ui-sdk/react` to `0.1.0-beta.17` in
    `packages/ui/package.json` and regenerate `bun.lock` cleanly without
    duplicate resolutions or unrelated dependency bumps.
  - Audit and migrate Core's UI SDK wrappers (`agent-bridge.tsx`, `rating.tsx`,
    `shortcut.tsx`, `shortcut-help.tsx`, `sortable-list.tsx`), consumers
    (`apps/admin`, `apps/donor`, `apps/missionary`), unit tests, and Playwright
    specs for confirmed `0.1.0-beta.3`–`0.1.0-beta.17` behavior changes (including
    cancelled `setValue` failing cleanly, out-of-bounds numeric refusal, step
    shape validation, and `checkPattern` ignoring `aria-hidden` radio inputs).
  - Refresh canonical `docs/ai/skills/ui-sdk/` from commit `d850982bd8aed202e07009825c3d9daf643fa24e`
    (verified byte-identical to `packages/ui/node_modules/@ui-sdk/core/skills/ui-sdk/`),
    preserving Core's description, note, marked overlay, scanner annotations,
    and Apache-2.0 change notices; update `references/upstream.md`,
    `skills-lock.json`, `docs/ai/skill-source-audit.json`,
    `docs/ai/skills-maintenance-log.md`, and `tests/unit/docs/skills-lock-current-paths.test.ts`.
- **OpenSpec cohort (`2.1.0` → `2.2.0`):**
  - Bump exact pin for `@fission-ai/openspec` to `2.2.0` in root `package.json`
    and regenerate `bun.lock`.
  - Extend `scripts/refresh-upstream-skills.mjs` to target tag `v2.2.0`, include
    the new `openspec` router skill alongside Core's seven curated workflows,
    and deterministically reconcile both `openspec/SKILL.md` and its three
    `references/*.md` files to Core's repository-local policy (pinned
    `bun run openspec --` wrapper, no Stores, no custom schemas, no
    `openspec init`/`openspec update`/`openspec config profile` against the
    live repo, resume existing changes without recreating them, archive only
    after merge).
  - Run the managed refresh (`node scripts/refresh-upstream-skills.mjs --only=Fission-AI/OpenSpec`),
    verify idempotency, sync all runtime mirrors (`bun run skills:sync` /
    `bun run skills:verify`), update audit records and hashes, update Core
    instruction/routing docs (`docs/ai/rules/openspec.md`,
    `docs/ai/rules/agent-skill-routing.md`, `openspec/project.md`), and update
    OpenSpec/skill regression tests (`tests/unit/docs/openspec-modernization.test.ts`,
    `tests/unit/docs/skill-inventory-audit.test.ts`,
    `tests/unit/docs/skills-lock-current-paths.test.ts`,
    `tests/unit/scripts/openspec-skill-refresh.test.ts`).
  - Verify `scripts/verify/openspec-delta-compatibility.mjs`,
    `scripts/lib/openspec-contracts.mjs`, and strict OpenSpec CLI validation
    against `@fission-ai/openspec@2.2.0`.

## Non-goals

- Do not upgrade Node, React, Next.js, Turborepo, TanStack, Base UI, or
  unrelated dependencies.
- Do not enable the five rejected OpenSpec workflows (`openspec-new-change`,
  `openspec-continue-change`, `openspec-ff-change`,
  `openspec-bulk-archive-change`, `openspec-onboard`), Stores, custom schemas,
  or global skill installs.
- Do not run `openspec update` or `openspec init` against the live checkout.
- Do not alter `base-maia`, Zinc tokens, CSS layer order (`@layer ui-sdk;`
  first), `packages/ui` wrapper ownership, or deny-by-default `AgentBridge`
  semantics.
- Do not archive this OpenSpec change before merge.

## Impact

- **Affected capabilities:** `agent-instruction-system` (adds the `openspec`
  router skill alongside the seven curated OpenSpec workflows while retaining
  all existing prohibitions) and `shared-ui-primitives` (no new spec delta;
  existing requirements remain governing and are verified against UI SDK
  `0.1.0-beta.17`).
- **Touched areas:** Root `package.json`, `packages/ui/package.json`, `bun.lock`,
  `skills-lock.json`, `scripts/refresh-upstream-skills.mjs`,
  `docs/ai/skills/{ui-sdk,openspec,openspec-*}/**`, generated mirrors
  (`.agents/skills/**`, `.claude/skills/**`, `.cursor/skills/**`),
  `docs/ai/rules/{openspec,agent-skill-routing}.md`, `openspec/project.md`,
  `docs/ai/skill-source-audit.json`, `docs/ai/skills-maintenance-log.md`, UI SDK
  wrappers/tests where migration is needed, and docs/scripts/UI/E2E tests.
- **Rollback:** Revert the PR merge commit (or cohort commits) on `develop`,
  re-run `bun install --frozen-lockfile`, `bun run skills:verify`, and
  `bun run openspec:validate` to return cleanly to UI SDK `0.1.0-beta.2` and
  OpenSpec `2.1.0`.
