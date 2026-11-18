# Design

## Context

See `proposal.md` for the motivation and the 2026-11-18 ruling. Current state
that shapes the approach:

- `.husky/pre-commit` runs `bun run verify:shadscan -- --staged`. That command
  copies the whole Git index to a temporary directory and scans it with a
  120-second limit.
- `scripts/verify/ci-preflight.mjs` runs `verify:shadscan` as a blocking step
  before every push.
- In `.github/workflows/ci.yml`, the required `integrity` job runs the gate and
  uploads `shadscan-audit`. The `shadscan-report` job calls
  `.github/workflows/shadscan.yml`, which only downloads and publishes that
  artifact. `ci-gate` needs `integrity` but not `shadscan-report`.
- The gate validates `tooling/shadscan/policy.json`, which holds the engine,
  ruleset and schema pins plus app and category floors. It also validates
  `tooling/shadscan/findings.json`: on 2026-11-18, 129 entries carrying SHA256
  proof hashes for 142 files. The checks live in
  `scripts/verify/shadscan-policy.mjs`.
- The policy protects four applications, because the scanner discovers every
  Next.js workspace as one: `apps/admin`, `apps/donor`, `apps/missionary` and
  the private operator Console `apps/factory-console` (added 2026-11-12).
- On Windows the audit loads `scripts/verify/shadscan-glob.mjs` as a Node
  module hook, which normalizes the scanner's glob paths. It has its own test,
  `shadscan-glob.test.ts`.
- The publisher skips commenting on fork pull requests
  (`scripts/verify/shadscan-publish.mjs`, tested in
  `shadscan-publish.test.ts`), and it updates the marker comment only from a
  readable summary. If the scan fails, the workflow writes only a job-summary
  line, so the previous comment remains. On a push to `develop` it updates
  one bot-owned tracking issue labelled `shadscan`.
- Outside this change, the retired paths `tooling/shadscan` and
  `shadscan-policy` appear in:
  - live gate code and tests, which this change deletes;
  - `docs/guides/development/shadscan.md`, which task 2.7 rewrites;
  - dated records under `docs/maintenance/modernization`, `docs/plans` and
    `docs/qa`;
  - two issue-scoped acceptance records: the issue-2067 runtime checklist,
    and the opt-in pinned-path list in the issue-2277 scope test.
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

**Non-Goals:**

- Comparing scores between base and head, trend dashboards, or score
  history. Absolute scores per event are enough for an advisory signal.
- Upstream Shadscan contributions or detector fixtures. The retired task 5.5
  of `modernize-shadscan-readiness` is not carried over.
- Any lint change. Full `jsx-a11y` enforcement, first proposed here as
  decisions D4-D6, is the separate unratified change `enforce-jsx-a11y-lint`.

## Decisions

### D1. The scan runs in the non-required `shadscan-report` job

`.github/workflows/shadscan.yml` checks out the submitted commit, not the
default merge ref: `github.event.pull_request.head.sha` on `pull_request`,
and the event SHA otherwise. It installs dependencies, runs the audit
itself, publishes the result, and uploads `shadscan.raw.json` as a workflow
artifact. Task 4.3 verifies that checkout. A merge-ref checkout would report
the merge result instead of the head.
The `integrity` job loses its two Shadscan steps, including the artifact
upload that lives with them today. Reviewers still need the raw findings
after the runner is gone, so the upload moves with the scan.
`shadscan-report` no longer needs `integrity`, because it no longer
downloads that job's artifact. `ci-gate` keeps its current needs, so the
scan cannot block a merge.

The audit job makes no auxiliary checkout. The `integrity` job used to
order its scan before the Phase 24 proof checkout, because a second checkout
inside the workspace would add duplicate projects to the scan. The workflow
test carries that protection over.

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
- the Windows glob hook,
- `AuditReportSchema` validation,
- the raw report and the summary JSON and Markdown outputs.

It drops `--staged`, `--report-only`, policy and ledger review, floors and
the 120-second limit. The policy file's engine, ruleset and schema pins
retire with it: the declared dependency is the version pin, and the
installed scanner's own `AuditReportSchema` is the report contract. The
scanner's spawn limit is 9 minutes, so the script reports a timeout itself
inside the CI step's 10-minute limit. Exit codes:

- **0** when a valid report is written, whatever the score.
- **Non-zero** only when no valid report exists. That covers a spawn failure,
  a timeout, invalid JSON, a schema mismatch or a version mismatch.

The summary still lists every expected application: the four the policy
protects today. An application the scanner did not discover is shown as
"not discovered", not silently omitted. For each application it reports the
overall score, every category score and the IDs of failing rules. The
category calculation (`categoryScores`) moves from `shadscan-policy.mjs`
into the summary module, under red-first tests, before the policy file is
deleted.
`scripts/verify/shadscan-publish.mjs`, `shadscan-summary.mjs` and
`shadscan-glob.mjs` move beside the audit script. The publisher and summary
lose floor and classification columns and keep the
`<!-- shadscan-report -->` comment marker, so the existing comment updates in
place. The `develop` tracking issue stays, with the same content as the
comment.

When dependency installation or the audit step fails, the publisher still
runs with `if: always()` in an explicit unavailable mode. Unavailable mode
does not load a report and does not require an audit summary file:

- It writes the "evidence unavailable" statement, naming the head commit, to
  the job summary.
- For a pull request from this repository, it replaces the marker comment
  with the same statement. Today a failed scan leaves the previous head's
  scores in the comment, where they read as current.

The job's own red status remains the primary signal. The audit step records
its outcome and does not use `continue-on-error`, which would let the job
finish green. The publisher and a final step both use `if: always()`, so a
failed installation does not skip them. The final step exits non-zero when
installation or the audit failed. Tests check the final step's condition
and exit, the job summary, and the replaced marker comment for both
failures.

Pull requests from forks keep the current security model. The
`pull_request` token is read-only for forks, so the publisher already
returns `published: false` and comments nothing. Their scores, and their
unavailable statement, appear only in the job summary.

- **Rejected: a `pull_request_target` or `workflow_run` follow-up that
  comments on fork PRs.** It would hand a write token to a workflow
  processing fork-controlled output, and an advisory comment does not
  justify that risk.

### D3. Retire gate files outright; keep behavior tests unchanged

The following are deleted:

- `tooling/shadscan/` (the policy and the ledger),
- `scripts/verify/shadscan-policy.mjs`,
- the `shadscan-ledger`, `shadscan-policy`, `shadscan-perfect-score` and
  `shadscan-staged` script tests.

Rewritten: the `shadscan-publish` test, for the simplified report. Added: a
`shadscan-audit` test for the audit script and summary, and a
`shadscan-workflow` test for the reporting job.

Kept as is: `shadscan-browser-resolution.test.ts`, which guards dependency
isolation for as long as the scanner stays installed, and
`shadscan-glob.test.ts`, whose import path follows the moved hook.

Dated records and the two issue-scoped acceptance records that mention the
retired paths stay as history. Feature grill notes do too: they cite the
retired paths and are not rewritten. The retirement check therefore searches
only live paths, excluding `openspec/`, `docs/maintenance/`, `docs/plans/`,
`docs/qa/`, `docs/features/`, `tests/unit/acceptance/issue-2067/` and
`tests/unit/acceptance/issue-2277/`.

All behavior, browser and axe proof tests keep their file names and
assertions, including every path the ledger cites as proof before it is
deleted. That set is wider than `tests/unit/apps`, `tests/unit/packages` and
`tests/fixtures/base-ui-compliance`; it includes
`tests/e2e/react-cleanup-memory.spec.ts` and
`tests/unit/scripts/shadcn-config-guardrails.test.ts`. The list is kept in
`retained-proof-paths.md` in this change, because the ledger that names them
is deleted. The final-head check compares each complete assertion span on
`develop` with the head. A span starts at `expect(` or `assert.` and runs to
the end of the whole assertion expression: chained modifiers and matchers
such as `.not`, `.resolves` and `.toEqual(...)`, their arguments, and any
callback body. Ending at the close of `expect(` alone would let a changed
matcher pass. A substring search of changed lines misses an edit inside the
`page.evaluate` callback of `expect.poll` in
`tests/e2e/react-cleanup-memory.spec.ts`. Added `it(` or `test(` cases are
allowed. Those declarations are not assertions.
Renaming them is optional follow-up churn and is not part of this change.

- **Rejected: keeping floors as non-blocking warnings.** A floor needs the
  policy file and its maintenance, and a warning that never blocks adds
  nothing over the published scores.

### D4-D6. Moved

Decisions D4 (enable the full `jsx-a11y` recommended rules), D5 (map shared
components to native elements) and D6 (line-anchored exceptions and the debt
baseline) moved on 2026-11-18 to the proposed change `enforce-jsx-a11y-lint`,
where they are D1-D3. The owner did not ratify them. The identifiers stay
reserved here so earlier references remain unambiguous.

### D7. Amend other active changes after ratification

The owner ratified the retirement on 2026-11-18. Every active change whose
open work still requires a Shadscan floor or an extra scan is amended in the
same commit as this record.

**`modernize-shadscan-readiness`:**

- Withdraw these four ADDED requirements:
  - "Workspace UI Audits Are Reproducible And Complete"
  - "Each Application Has An Independent Score Floor"
  - "Each Application Category Has An Independent Score Floor"
  - "Audit Classifications Preserve Evidence"
- Turn open tasks 5.2, 5.5, 5.7 and 5.8 into untracked bullets under a dated
  "Superseded 2026-11-18 by `make-shadscan-advisory`" heading. (The proposal
  was drafted on 2026-10-30; the supersession takes effect from the ruling.)
- In open task 4.9, mark only the "review affected finding proofs" clause as
  superseded, because it serves the retired ledger. Its other work stays.
- Add the same dated note to its proposal and design.
- Replace its delta's Purpose, which describes score floors and
  classification, with this change's Purpose word for word. Every delta for
  `ui-quality-audits` then carries the same Purpose, so no archive order
  leaves a withdrawn floor in the durable Purpose and none of them warns.

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

- **[Risk]** Nothing blocks the score, so it can drift down unnoticed. →
  Every PR shows the score in one comment. A drop seen in review is triaged
  under the "Triaged By Review" requirement.
- **[Risk]** Static accessibility regressions lose their only blocking check
  beyond the 6 `jsx-a11y` rules that `eslint-config-next` enables, and no
  axe spec gates a `develop` merge today. → The proposal says so plainly.
  The CI scope workstream (issue #2711) moves an axe spec into the required
  smoke checks; `enforce-jsx-a11y-lint` awaits its own ruling.
- **[Risk]** A deleted gate test also covered something real. → Only tests
  of the gate's own mechanics are deleted (policy, ledger, floors, staged
  snapshot). The token-scrubbed environment, version check, glob hook,
  fork-safe publishing and marker update keep their tests.
- **[Risk]** Husky sets a relative `core.hooksPath` (`.husky/_`), which Git
  resolves in the worktree where the commit runs, so a worktree that has not
  run `bun install` runs no hook at all. → Verify the hook by running the
  branch's `.husky/pre-commit` file directly, and never cite a commit as
  proof that it ran.

## Migration Plan

Land the retirement on one branch in small commits: the planning record and
amendments (D7), then the audit and publish scripts test first (D2), then
hook, preflight, scripts and docs, then the deletions (D3), and last the
`ci.yml`, `shadscan.yml` and `docs/ci.md` edits (D1), which acceptance tests
fingerprint until issue #2706 removes those pins.

**Rollback:** revert the commits. That restores the gate exactly as it was.
The restored ledger must then be re-reviewed against current source before it
can pass, so rollback is not free once other work has landed.
