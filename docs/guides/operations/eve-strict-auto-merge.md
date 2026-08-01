# Eve strict auto-merge operations

Eve strict auto-merge is implemented but remains inert while the master release
switch is off. It is intentionally separate from `github_operator`, which has
no merge capability.

## GitHub App permissions and events

The Eve GitHub App installation requires the existing read permissions for
pull requests, checks, statuses, metadata, and administration/branch-protection
configuration, plus write permissions for pull requests, contents, and issue
comments. Subscribe the app to `check_suite` and the existing pull-request and
comment events. Do not grant an app bypass allowance in branch protection.

The `develop` branch must retain:

- admin enforcement;
- strict required status checks;
- at least one required human approval;
- conversation resolution; and
- no bypass allowance for the Eve app.

An active branch ruleset blocks Eve until that ruleset has an explicit evidence
adapter. This is a deliberate fail-closed posture.

## Runtime configuration

Use the GitHub App and tenant-linked service-principal variables documented in
`eve-github-operator.md`. No credential enters Eve's sandbox. Apply the
Supabase migration that registers `engineering.github_merge.execute` and its
five-request hourly hard budget.

## Evaluation sequence

For an `eve/issue-<number>-<slug>` PR into `develop`, Eve reads the PR, linked
issue, complete changed-file set, classic branch protection, active branch
rules, check runs, commit statuses, and reviews. It then evaluates the exact
observed head SHA.

Passing evidence causes one GitHub merge request bound to that SHA. A concurrent
push, GitHub protection rejection, or any missing evidence prevents the merge.
There is no force, admin-bypass, or protection-update request.

Completed check-suite webhooks evaluate directly without a model call. A
maintainer may mention Eve on the PR after resolving a review or protection
block to request a fresh evaluation.

## Human escalation

For a non-passing evidence decision, Eve posts at most one escalation comment
per PR head SHA. The comment lists stable reason codes and protected paths, if
present. Resolve those items and request a new evaluation; do not edit or delete
evidence to simulate a pass.

If governance, policy, or budget blocks before GitHub writes are allowed, use
Mission Control's governance, approval/budget, and audit views. A block is not a
retry authorization.

## Verification

Before enabling:

1. confirm the release switch is still off;
2. query `develop` protection and confirm the required checks and review count;
3. verify the Eve App is absent from all bypass allowances;
4. exercise a safe fixture PR and confirm policy returns `merge` without
   executing while release is disabled;
5. exercise protected-path, stale-SHA, missing-review, failing-check, active
   ruleset, and merge-rejection fixtures and confirm none call merge;
6. confirm every path creates #419 audit and governance records; and
7. run `bun run ci:preflight`, strict OpenSpec validation, and
   `bun run --filter @asym/eve-runtime info`.

## Emergency stop and rollback

Set `github_actions`, `production_writes`, or `all_automation`, or activate the
global emergency stop. These checks precede policy and GitHub calls.

To roll back capability, remove the strict tool and check-suite handler, revoke
the App's merge-capable contents permission, and leave the release switch off.
Do not delete policy or audit history. If a bad merge occurs after a future
launch, create and review a normal revert PR; never rewrite `develop` history.
