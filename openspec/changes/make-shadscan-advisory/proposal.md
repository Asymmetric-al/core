# Proposal

## Why

Shadscan is a third-party static scorer. Its first workspace audit found real
accessibility and pending-state defects, and those repairs are worth keeping.
Core then made its score a blocking gate on every commit, push and CI run.
That gate now costs more than it detects:

- Every commit scans the whole workspace. On Windows this exceeds the gate's
  120-second timeout, so commits there fail outright.
- 118 hashed ledger entries bind findings to proof files. Unrelated work, such
  as a GraphQL upgrade, Prettier formatting or a new verifier, must rehash the
  ledger. 126 commits have touched it.
- 51 entries grade shared libraries for application features. 59 record scanner
  blind spots around shared `packages/ui` wrappers and Base UI composition.
- The "genuine 100/100 in every category" target cannot be met while Core
  forces a light theme. Theme rules alone hold 15 of 145 scored points.

Standard tools already in Core's dependency graph do the useful part better:
`eslint-plugin-jsx-a11y` runs today, but `eslint-config-next` enables only 6 of
its rules. The existing axe-based Playwright checks cover rendered behavior.

## What Changes

- **BREAKING (workflow):** Shadscan no longer blocks a commit, push, local CI
  preflight or required CI check. The pre-commit hook stops running it.
- CI still runs the exact locked scanner once, in a non-required job. It
  publishes per-application and per-category raw scores and failing rules to
  the job summary and one updated PR comment. A failed or missing scan is
  reported as unavailable evidence, never as a pass.
- Retire the per-application and per-category floors, the hashed findings
  ledger, the policy file and the gate-mechanics tests. Retire the 100/100
  target. Reviewers triage reported findings: confirmed defects are repaired
  with behavior tests or tracked as issues.
- Enforce the full `jsx-a11y` recommended rule set in first-party web UI lint.
  Map shared `packages/ui` components to their native semantics, and reject
  import aliases that would bypass that mapping. Record any violation left
  after repair as a line-anchored, rule-named exception that fails lint once
  it is unused, so debt can only shrink.
- Keep every behavioral, Playwright and axe test written as Shadscan proof.
  They are ordinary regression tests now.
- When this change is ratified, amend the active `modernize-shadscan-readiness`
  change. Withdraw its superseded gate, floor and classification requirements
  and its 100/100 tasks, and label them as dated history. Its UI-repair,
  component-review and browser-evidence requirements and their open tasks
  stay as they are.
- In the same step, amend open task 9.6 of the active
  `add-public-ministry-pages` change, which still requires Shadscan runs
  before and after every `packages/ui` slice and rejects below-floor output.

## Non-goals

- Removing Shadscan, its pinned dependency or its read-only MCP server.
- Reverting product behavior added during the audit, such as the signed-in
  navigation palettes, pending states or accessible names.
- Changing the forced-light theme policy, the `@shadcn/lint` design-system
  policy, Base UI, `base-maia`, or shared `packages/ui` ownership.
- Adding new end-to-end routes or changing the existing axe severity policy.

## Authority

The owner approved official scanner scores and the 100/100 target on
2026-10-04 in `modernize-shadscan-readiness`. That approval stays the governing
intent until the owner ratifies this proposal. Implementation SHALL NOT start,
and no other active change SHALL be amended, before that ratification.

## Capabilities

### New Capabilities

- `ui-quality-audits`: how Core runs and reports UI audits and enforces
  accessibility. No durable spec exists yet at this path. The active
  `modernize-shadscan-readiness` change also proposes ADDED requirements here.
  This change adds advisory reporting and standard accessibility enforcement.
  The sibling's superseded requirements are withdrawn in its own delta, so the
  merged capability has no contradictory clauses.

### Modified Capabilities

None. No durable spec requirement changes.

## Impact

- **Hooks and gates:** `.husky/pre-commit`, `scripts/verify/ci-preflight.mjs`,
  root `package.json` scripts.
- **CI:** the `integrity` job and the `shadscan-report` job in
  `.github/workflows/ci.yml`, plus `.github/workflows/shadscan.yml`.
- **Gate tooling:**
  - Rewritten: `scripts/verify/shadscan.mjs`, `shadscan-publish.mjs` and
    `shadscan-summary.mjs`.
  - Removed: `scripts/verify/shadscan-policy.mjs` and `tooling/shadscan/`.
  - Gate tests under `tests/unit/scripts/shadscan-*.test.ts`: the ledger,
    policy, perfect-score and staged tests are removed; the publish test is
    rewritten.
- **Lint:** `tooling/eslint-config` (Next, library and design-system entry
  points), including unused-disable reporting for first-party UI files.
  `eslint-plugin-jsx-a11y@6.10.2` is already locked. The count-based
  suppression file stays limited to `@shadcn/lint` rules.
- **Docs:** `docs/guides/development/shadscan.md`, `docs/ci.md`,
  `CONTRIBUTING.md`, `README.md` and `docs/ai/rules/frontend.md`.
- **Planning:** the `modernize-shadscan-readiness` delta, tasks and history
  note, and task 9.6 of `add-public-ministry-pages`, after ratification.
- **Untouched:** product routes, data, authorization, tenancy, money and
  deployments.

## Rollback

Revert the implementation commits. That restores the hook, gate, policy,
ledger and floors exactly from git history. A restored ledger must be
re-reviewed against current source before the gate can pass again. Lint
rollback removes the added rules and their inline exceptions together.
