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
  only the six `@shadcn/lint` rules there.
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

Base UI's `render={<element />}` composition cannot be expressed through
`polymorphicPropName`. Those cases rely on the rendered axe checks, and are
recorded as a limitation in the guide.

### D6. Repair first; shrink-only suppression only for residual debt

1. Run the enabled rules over the full scope and produce an inventory.
2. Repair real violations at their owning component, with focused tests where
   behavior changes.
3. For a false positive caused by the static rule, use an inline disable that
   names the rule and gives a `-- reason`.
4. Record only what cannot be repaired safely in this change. Use native
   ESLint `--suppress-rule` for that, widen `validateSuppressions` to allow
   `jsx-a11y/*` rules under the existing first-party path checks, and open a
   tracked issue listing the residual entries.

Native suppressions are count-based. Unpruned suppressions already fail lint,
which gives the spec's shrink-only behavior without new tooling.

### D7. Amend the sibling change only after ratification

After the owner ratifies this proposal, `modernize-shadscan-readiness` is
amended:

- Withdraw these four ADDED requirements:
  - "Workspace UI Audits Are Reproducible And Complete"
  - "Each Application Has An Independent Score Floor"
  - "Each Application Category Has An Independent Score Floor"
  - "Audit Classifications Preserve Evidence"
- Turn open tasks 5.2, 5.5, 5.7 and 5.8 into untracked bullets under a dated
  "Superseded 2026-10-30 by `make-shadscan-advisory`" heading.
- Add the same dated note to its proposal and design.

Its UI-repair, component-review and browser-evidence requirements stay
unchanged. The contract section
`openspec/contracts/ui-quality-audits.md#contract-7aab1c5a8227bf2da9b4`
stays in place as history. Per `openspec/contracts/README.md`, an
unreferenced section imposes no present behavior.

## Risks / Trade-offs

- **[Risk]** A future ESLint release breaks jsx-a11y 6.10.2, whose peer range
  is out of date. → The config test and the required lint job fail visibly.
  The fallback is `eslint-plugin-jsx-a11y-x`, adopted as a separate change.
- **[Risk]** Nothing blocks the score, so it can drift down unnoticed. →
  Every PR shows the score in one comment, while lint and axe block the
  regressions that matter. A drop seen in review is triaged under the
  "Triaged By Review" requirement.
- **[Risk]** The jsx-a11y inventory is larger than expected. → D6's
  shrink-only suppression and tracked issue keep the change bounded without
  accepting new debt.
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
2. **Add a11y lint.** Change the lint config, the inventory, repairs and any
   suppressions (D4–D6).

The sibling-change amendment (D7) lands with commit 1, since both describe
the same authority change.

**Rollback:** revert either commit independently. Reverting commit 1 restores
the gate exactly as it was. The restored ledger must then be re-reviewed
against current source before it can pass, so rollback is not free once
other work has landed.

## Open Questions

- How many jsx-a11y recommended violations exist today? This decides
  whether D6 ends with zero suppressions or a tracked residual. It does not
  change the tasks.
