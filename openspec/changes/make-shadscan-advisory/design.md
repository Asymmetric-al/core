# Design

## Context

See `proposal.md` for the motivation. Current state that shapes the approach:

- `.husky/pre-commit` runs `bun run verify:shadscan -- --staged`. That command
  copies the whole Git index to a temporary directory and scans it with a
  120-second limit. Worktree commits run the main checkout's hook file.
- `scripts/verify/ci-preflight.mjs` runs `verify:shadscan` as a blocking step
  before every push.
- In `.github/workflows/ci.yml`, the required `integrity` job runs the gate and
  uploads `shadscan-audit`. The `shadscan-report` job calls
  `.github/workflows/shadscan.yml`, which only downloads and publishes that
  artifact. `ci-gate` needs `integrity` but not `shadscan-report`.
- The gate validates `tooling/shadscan/policy.json`, which holds the engine,
  ruleset and schema pins plus app and category floors. It also validates
  `tooling/shadscan/findings.json`: 118 entries carrying SHA256 proof hashes
  for 138 files. The checks live in `scripts/verify/shadscan-policy.mjs`.
- `eslint-config-next@16.4.2` already registers `eslint-plugin-jsx-a11y@6.10.2`
  for the Next apps, but enables only 6 of its rules.
  - The plugin declares ESLint peers only up to 9, while Core runs ESLint
    10.13.0.
  - Its `lib/` makes no calls to the context APIs ESLint 10 removed
    (`getSourceCode()`, `getFilename()`, `getScope()`, `getAncestors()`,
    `parserOptions`).
  - It exports `flatConfigs.recommended`, which has 34 rules.
  - The Bun isolated store holds two peer variants of it.
- Native ESLint count-based suppressions already exist. They live in
  `tooling/eslint-config/suppressions.json` and are driven by
  `tooling/eslint-config/lint.mjs`. `validateSuppressions` currently allows
  only the six `@shadcn/lint` rules there. Counts cannot tell a repaired
  violation from a new one of the same rule in the same file;
  `tests/unit/scripts/design-system-suppressions.test.ts` documents that this
  same-count swap passes lint.
- No lint config sets `reportUnusedDisableDirectives`, and lint does not fail
  on warnings. First-party `apps/**` and `packages/**` sources hold 4 inline
  disable directives.
- Two first-party files import shared components under aliases:
  `Button as SharedButton` in
  `apps/admin/features/mission-control/care/components/UI.tsx` and
  `Label as UiLabel` in
  `apps/admin/features/support-hub/components/labels/LabelForm.tsx`.
- Per-category scores are computed by `categoryScores` in
  `scripts/verify/shadscan-policy.mjs`. The publish test fixture has no
  category data.
- Two active changes still require Shadscan floors: `modernize-shadscan-readiness`
  (its gate requirements and tasks 5.2, 5.5, 5.7, 5.8) and
  `add-public-ministry-pages` (open task 9.6, which runs the scanner before
  and after every `packages/ui` slice and rejects below-floor output).
- Several tests began as Shadscan proof but assert real behavior. They cover
  pending states, names, focus and composition, and live under
  `tests/unit/{apps,packages}/**/shadscan-*.test.tsx` and the
  `tests/fixtures/base-ui-compliance` Playwright and axe specs.

## Goals / Non-Goals

**Goals:**

- Zero audit cost on commit and push. One scan per CI event, off the
  required path.
- Remove every file that exists only to keep the score gate green.
- Block new static accessibility regressions through the normal lint gate,
  using the plugin version Core already locks.

**Non-Goals:**

- Comparing scores between base and head, trend dashboards, or score
  history. Absolute scores per event are enough for an advisory signal.
- Upstream Shadscan contributions or detector fixtures. The retired task 5.5
  of `modernize-shadscan-readiness` is not carried over.
- Moving lint to Oxlint, or switching to a forked a11y plugin.

## Decisions

### D1. The scan runs in the non-required `shadscan-report` job

`.github/workflows/shadscan.yml` installs dependencies, runs the audit itself
and publishes the result. The `integrity` job loses its two Shadscan steps.
`ci-gate` keeps its current needs, so the scan cannot block a merge.

- **Rejected: `continue-on-error` inside `integrity`.** It still adds about 30
  seconds of scanning to a required job. A crash would also show as a yellow
  step inside a green gate, which is easy to misread.
- **Rejected: drop the CI scan entirely.** The advisory report is the cheap,
  useful part, and the dependency is already locked.

### D2. One audit script, named like Core's other audits

`scripts/verify/shadscan.mjs` becomes `scripts/shadscan-audit.mjs`, and the
npm script `verify:shadscan` becomes `shadscan:audit`. This follows the
existing `react-doctor:audit` precedent, because `verify:*` names a blocking
gate. The script keeps these behaviors:

- an exact declared-versus-installed version check,
- the token-scrubbed environment (`GH_TOKEN`, `GITHUB_TOKEN`, `NODE_OPTIONS`
  removed),
- argument-array spawning with `shell: false`,
- `AuditReportSchema` validation,
- the raw report and the summary JSON and Markdown outputs.

It drops `--staged`, policy and ledger review, floors and the 120-second
limit; CI uses a 10-minute limit instead. Exit codes:

- **0** when a valid report is written, whatever the score.
- **Non-zero** only when no valid report exists. That covers a spawn failure,
  a timeout, invalid JSON, a schema mismatch or a version mismatch.

The summary still lists the three expected applications. An application the
scanner did not discover is shown as "not discovered", not silently omitted.
For each application it reports the overall score, every category score and
the IDs of failing rules. The category calculation (`categoryScores`) moves
from `shadscan-policy.mjs` into the summary module, under red-first tests,
before the policy file is deleted.
`scripts/verify/shadscan-publish.mjs` and `shadscan-summary.mjs` move beside
the audit script. They lose floor and classification columns and keep the
`<!-- shadscan-report -->` comment marker, so the existing comment updates in
place. When the audit step fails, the job writes the existing "evidence
unavailable" message, and the job's own red status is the visible signal.

### D3. Retire gate files outright; keep behavior tests unchanged

The following are deleted:

- `tooling/shadscan/` (the policy and the ledger),
- `scripts/verify/shadscan-policy.mjs`,
- the `shadscan-ledger`, `shadscan-policy`, `shadscan-perfect-score` and
  `shadscan-staged` script tests.

Rewritten: the `shadscan-publish` test, for the simplified report.

Kept as is: `shadscan-browser-resolution.test.ts`. It guards dependency
isolation for as long as the scanner stays installed.

All behavior, browser and axe proof tests keep their file names and
assertions. Renaming them is optional follow-up churn and is not part of
this change.

- **Rejected: keeping floors as non-blocking warnings.** A floor needs the
  policy file and its maintenance, and a warning that never blocks adds
  nothing over the published scores.

### D4. Enable the full `jsx-a11y` recommended rules on first-party web UI

`@asym/eslint-config` declares the exact `eslint-plugin-jsx-a11y@6.10.2`,
which is already in `bun.lock`. It applies `flatConfigs.recommended.rules` at
error level. The file scope is the same first-party web UI scope the
design-system policy uses: apps plus shared UI packages, excluding vendored
and generated trees.

Plugin registration must not collide:

- **Next app configs:** reuse the plugin object that `eslint-config-next`
  already registers.
- **Non-Next UI packages:** register the declared copy.

A config test proves both entry points resolve one `jsx-a11y` namespace with
no "Cannot redefine plugin" error. The test is written red first.

- **Rejected: `eslint-plugin-jsx-a11y-x` (0.2.0).** It declares ESLint 10
  peers, but it would add a second, younger dependency beside the copy Next
  already brings in.
- **Rejected: the `strict` config.** It adds rules with high false-positive
  rates on Base UI composition. Use `recommended` first and tighten later
  with evidence.

### D5. Map shared components to native elements

`settings["jsx-a11y"].components` maps each shared component that renders a
native element to that element, for example `Button` to `button`, `Input` to
`input`, `Textarea` to `textarea`, `Label` to `label`, Next `Link` to `a`,
and Next `Image` to `img`. The exact names come from the `packages/ui`
exports during apply.

The plugin matches components by their JSX name, so an import alias such as
`Button as SharedButton` would bypass the mapping. `no-restricted-syntax`
rejects any import of a mapped component under another local name: named
imports from its shared module (the `@asym/ui` path, or a relative path
inside `packages/ui`) and default imports of `next/link` and `next/image`.
Aliases of unrelated exports, such as `Link as LinkIcon` from an icon set,
are not affected because the selector matches the import source. The two
existing aliases are renamed during apply.

- **Rejected: listing every alias in the mapping.** Each new alias would
  silently bypass lint until someone added it.

Base UI's `render={<element />}` composition cannot be expressed through
`polymorphicPropName`. Those cases rely on the rendered axe checks, and are
recorded as a limitation in the guide.

### D6. Repair first; line-anchored exceptions for what remains

1. Run the enabled rules over the full scope and produce an inventory.
2. Repair real violations at their owning component, with focused tests where
   behavior changes.
3. For a false positive caused by the static rule, use an
   `eslint-disable-next-line` directive that names the rule and gives a
   `-- reason`.
4. Record only what cannot be repaired safely in this change, using the same
   directive form with a reason that cites a tracked issue. Open that issue
   with the residual list.

Each directive covers one line and one rule. That gives the spec's
shrink-only behavior:

- A new violation on any other line fails lint, even in a file with
  exceptions.
- First-party UI configs set `linterOptions.reportUnusedDisableDirectives` to
  `"error"`, so a directive whose violation was repaired fails lint until it
  is deleted. That also applies to the 4 existing directives, and any that
  are stale are removed during apply.
- A focused test scans first-party sources and fails when a `jsx-a11y`
  directive names no rule or has no `--` reason.

`validateSuppressions` stays limited to `@shadcn/lint` rules, so
accessibility debt cannot move into the count-based file.

- **Rejected: native count-based suppressions for `jsx-a11y`.** Counts cannot
  detect a same-count swap: repairing one violation and adding another of the
  same rule in the same file passes. Core's own suppression test documents
  this. It would break the spec's guarantee that a new violation fails.
- **Residual limit:** a different violation of the same rule on the same
  excepted line stays hidden. Review covers that narrow case.

### D7. Amend other active changes only after ratification

After the owner ratifies this proposal, every active change whose open work
still requires a Shadscan floor or an extra scan is amended.

**`modernize-shadscan-readiness`:**

- Withdraw these four ADDED requirements:
  - "Workspace UI Audits Are Reproducible And Complete"
  - "Each Application Has An Independent Score Floor"
  - "Each Application Category Has An Independent Score Floor"
  - "Audit Classifications Preserve Evidence"
- Turn open tasks 5.2, 5.5, 5.7 and 5.8 into untracked bullets under a dated
  "Superseded 2026-10-30 by `make-shadscan-advisory`" heading.
- In open task 4.9, mark only the "review affected finding proofs" clause as
  superseded, because it serves the retired ledger. Its other work stays.
- Add the same dated note to its proposal and design.

Its UI-repair, component-review and browser-evidence requirements stay
unchanged, and so do open tasks 3.5, 5.3, 5.4 and 5.6 and the rest of 4.9.
That change stays active until those tasks are complete; it is not archived
just because this change merges.

**`add-public-ministry-pages`:** in open task 9.6, replace the before-and-after
Shadscan runs, floor recording and below-floor rejection with a review of the
advisory report on the slice's pull request. The rest of the task, including
its accessibility and browser proof, is unchanged.

Completed changes that mention Shadscan floors only in verification records
or workflow notes, such as `modernize-openspec-current-contracts`, stay as
history. The contract section
`openspec/contracts/ui-quality-audits.md#contract-7aab1c5a8227bf2da9b4`
also stays as history. Per `openspec/contracts/README.md`, an unreferenced
section imposes no present behavior.

## Risks / Trade-offs

- **[Risk]** A future ESLint release breaks jsx-a11y 6.10.2, whose peer range
  is out of date. → The config test and the required lint job fail visibly.
  The fallback is `eslint-plugin-jsx-a11y-x`, adopted as a separate change.
- **[Risk]** Nothing blocks the score, so it can drift down unnoticed. →
  Every PR shows the score in one comment, while lint and axe block the
  regressions that matter. A drop seen in review is triaged under the
  "Triaged By Review" requirement.
- **[Risk]** The jsx-a11y inventory is larger than expected. → D6's
  line-anchored exceptions and tracked issue keep the change bounded without
  accepting new debt, at the cost of one directive per residual line.
- **[Risk]** Unused-disable reporting at error also covers the 4 existing
  directives for other rules. → Any stale ones are deleted during apply.
  Deleting an unused directive cannot change behavior.
- **[Trade-off]** Static lint cannot see through Base UI `render` composition.
  The existing axe browser checks remain the authority for those cases.
- **[Risk]** A worktree commit runs the main checkout's hook file. → Hook
  removal only takes effect once it is merged into the main checkout's
  branch. Verify by running the hook file from the branch directly, and
  never claim a worktree commit exercised it.

## Migration Plan

Land the work in two commits on one branch, so each is revertible:

1. **Retire the gate.** Change the hook, preflight, CI, scripts, tests and
   docs (D1–D3).
2. **Add a11y lint.** Change the lint config, the inventory, repairs, alias
   renames and any inline exceptions (D4–D6).

The amendments to other active changes (D7) land with commit 1, since they
describe the same authority change.

**Rollback:** revert either commit independently. Reverting commit 1 restores
the gate exactly as it was. The restored ledger must then be re-reviewed
against current source before it can pass, so rollback is not free once
other work has landed.

## Open Questions

- How many jsx-a11y recommended violations exist today? This decides
  whether D6 ends with zero residual exceptions or a tracked residual. It
  does not change the tasks.
