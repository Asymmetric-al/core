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

These counts were taken on 2026-10-30. On 2026-11-18 the ledger held 129
entries citing 142 proof paths.

The existing axe-based Playwright checks cover rendered behavior. Standard
lint can block static accessibility regressions: `eslint-plugin-jsx-a11y`
runs today, but `eslint-config-next` enables only 6 of its rules. Full
enforcement is proposed separately in `enforce-jsx-a11y-lint`, which is not
ratified (see Authority).

## What Changes

- **BREAKING (workflow):** Shadscan no longer blocks a commit, push, local CI
  preflight or required CI check. The pre-commit hook stops running it.
- CI still runs the exact locked scanner once, in a non-required job. It
  publishes per-application and per-category raw scores and failing rules to
  the job summary, and to one updated PR comment for pull requests from this
  repository. Fork pull requests keep job-summary-only reporting, because
  their token is read-only. A failed or missing scan is reported as
  unavailable evidence, never as a pass, and it replaces any earlier scores
  in the comment.
- Retire the per-application and per-category floors, the hashed findings
  ledger, the policy file and the gate-mechanics tests. Retire the 100/100
  target. Reviewers triage reported findings: confirmed defects are repaired
  with behavior tests or tracked as issues.
- Keep every behavioral, Playwright and axe test written as Shadscan proof.
  They are ordinary regression tests now.
- Amend the active `modernize-shadscan-readiness` change. Withdraw its
  superseded gate, floor and classification requirements and its 100/100
  tasks, and label them as dated history. Its UI-repair, component-review and
  browser-evidence requirements and their open tasks stay as they are.
- In the same step, amend open task 9.6 of the active
  `add-public-ministry-pages` change, which still requires Shadscan runs
  before and after every `packages/ui` slice and rejects below-floor output.

### Accessibility coverage after this change

Retiring the gate removes the only check that blocked on a static
accessibility score. This change does not replace it with another blocking
accessibility check:

- Lint keeps its current `jsx-a11y` coverage: the 6 rules
  `eslint-config-next` enables, in the three Next applications only.
- The axe-based Playwright checks keep their coverage and severity, but on a
  pull request to `develop` none of them gates the merge. The five specs in
  the gating smoke suite (`test:e2e:smoke`) use no axe check, and the
  `test-e2e` production-gate job gates only production-targeted events
  (checked against `ci-integration.yml` on 2026-11-18).

So, until a later change lands, no gating check on `develop` blocks a new
accessibility regression beyond those 6 lint rules. Two separate pieces of work are meant to
close that gap: moving an axe spec into the required smoke checks (CI scope
workstream, issue #2711), and the unratified `enforce-jsx-a11y-lint` change.
Nobody should read this change as closing it.

## Non-goals

- Removing Shadscan, its pinned dependency or its read-only MCP server.
- Reverting product behavior added during the audit, such as the signed-in
  navigation palettes, pending states or accessible names.
- Changing the forced-light theme policy, the `@shadcn/lint` design-system
  policy, Base UI, `base-maia`, or shared `packages/ui` ownership.
- Adding new end-to-end routes or changing the existing axe severity policy.
- Changing ESLint configuration or enforcing more `jsx-a11y` rules. That work
  is the separate, unratified `enforce-jsx-a11y-lint` change.

## Authority

The owner approved official scanner scores and the 100/100 target on
2026-10-04 in `modernize-shadscan-readiness`.

On 2026-11-18 the owner ratified the retirement part of this change. The
program step offered to the owner read:

> "One ruling that retires the Shadscan gate and hashes, the React Doctor
> ledger (PR #2705) and the fingerprint comparisons. Adopt only the retirement
> part of the Shadscan change; its jsx-a11y baseline is a new ledger."

The owner replied: "Do #2".

Scope of that ruling for `make-shadscan-advisory`:

- **Ratified:** the retirement of the Shadscan gate, its per-application and
  per-category floors, its policy file and its SHA256-bound findings ledger,
  with advisory CI reporting in their place (tasks sections 1, 2 and 4).
- **Superseded:** the 2026-10-04 approval of score floors and the "genuine
  100/100 in every app and category" target recorded in
  `modernize-shadscan-readiness`. Its approval of official scanner scores now
  means advisory scores. Its approval of forced light and of the signed-in
  donor and missionary palettes is unchanged.
- **Not ratified:** full `jsx-a11y` enforcement with a line-anchored debt
  baseline, which this change first proposed as section 3 with design
  decisions D4-D6. The owner was told that part "is a new ledger" and
  approved only the retirement. That part now lives, unchanged in substance,
  in the separate proposed change `enforce-jsx-a11y-lint`, which SHALL NOT be
  implemented before its own ratification.

The ruling covers the amendments to `modernize-shadscan-readiness` and
`add-public-ministry-pages` that design D7 describes.

## Capabilities

### New Capabilities

- `ui-quality-audits`: how Core runs and reports UI audits and enforces
  accessibility. No durable spec exists yet at this path. The active
  `modernize-shadscan-readiness`, `enforce-jsx-a11y-lint` and
  `make-react-doctor-advisory` (pull request #2705) changes also propose
  ADDED requirements here. This change adds advisory reporting, review
  triage and the retention of rendered and behavioral evidence. The
  sibling's superseded requirements are withdrawn in its own delta, so the
  merged capability has no contradictory clauses. Every delta for this
  capability uses this delta's Purpose word for word, so the changes can
  archive in any order.

### Modified Capabilities

None. No durable spec requirement changes.

## Impact

- **Hooks and gates:** `.husky/pre-commit`, `scripts/verify/ci-preflight.mjs`,
  root `package.json` scripts.
- **CI:** the `integrity` job and the `shadscan-report` job in
  `.github/workflows/ci.yml`, plus `.github/workflows/shadscan.yml`.
- **Gate tooling:**
  - Rewritten: `scripts/shadscan-audit.mjs` (from
    `scripts/verify/shadscan.mjs`), with `scripts/shadscan-publish.mjs`,
    `scripts/shadscan-summary.mjs` and the Windows glob hook
    `scripts/shadscan-glob.mjs` beside it.
  - Removed: `scripts/verify/shadscan-policy.mjs` and `tooling/shadscan/`.
  - Gate tests under `tests/unit/scripts/shadscan-*.test.ts`: the ledger,
    policy, perfect-score and staged tests are removed; the publish test is
    rewritten; an audit test and a workflow test are added.
- **Docs:** `docs/guides/development/shadscan.md`, `docs/ci.md`,
  `CONTRIBUTING.md`, `README.md`, `docs/ai/rules/frontend.md`, and the other
  live documents and skills that describe the gate or its ledger.
- **Planning:** the `modernize-shadscan-readiness` delta, tasks and history
  note, and task 9.6 of `add-public-ministry-pages`.
- **Untouched:** lint configuration, product routes, data, authorization,
  tenancy, money and deployments.

## Rollback

Revert the implementation commits. That restores the hook, gate, policy,
ledger and floors exactly from git history. A restored ledger must be
re-reviewed against current source before the gate can pass again.
