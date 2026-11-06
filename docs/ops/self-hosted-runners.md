# Self-hosted runner security

Core is public. Its current CI revision uses GitHub-hosted runners throughout;
the approved self-hosted-reachable workflow set is explicitly empty. Proxmox
infrastructure remains intact, including its existing registration, controller
and isolation settings. Older workflow revisions can still request
`[self-hosted, linux, x64, proxmox]`. A fork PR also controls its own workflow
YAML, so repository checks alone cannot stop it naming those labels. GitHub
settings and the maintainer rule remain necessary. Issue
[#2180](https://github.com/Asymmetric-al/core/issues/2180) owns this security
contract; the hosted reliability follow-up relates to
[#2218](https://github.com/Asymmetric-al/core/issues/2218).

## Maintainer rule

Never click "Approve and run" on a fork PR's workflows. To run CI on outside
code, review it first and push the reviewed commits to a same-repo branch.

## Repository guard (R1-R3)

`tests/unit/helpers/self-hosted-runner-guard.ts` scans every
`.github/workflows/*.yml` and `*.yaml` file. Its test runs in the unit suite, so
`test-unit` fails on any violation. Each problem names the file, the job (or
`on`), the rule and this runbook.

- **R1 reachability allowlist.** A workflow is reachable if any job runs on
  anything other than a literal `ubuntu-*` label, calls a reachable local
  reusable workflow, or calls a remote reusable workflow. Expressions, matrix
  values, groups, custom labels and other hosted images fail closed. The
  approved reachable set is **empty**: no first-party workflow may reach a
  self-hosted runner. Remote reusable-workflow calls fail in every file. The
  workflow harness separately asserts the seven-job inventory, hosted placement,
  conditions and fork boundaries so the empty set cannot make those checks
  vacuous. This intentionally tightens the previous exact two-workflow set.
- **R2 trigger allowlist.** Every reachable workflow, including any caller of
  one, triggers only on `merge_group`, `pull_request`, `push` and
  `workflow_dispatch`. This bans `pull_request_target`, `workflow_run`,
  `issue_comment`, review events, `workflow_call`, `schedule`,
  `repository_dispatch` and every other unmodelled event.
- **R3 privileged-trigger hygiene.** A workflow on `pull_request_target`,
  `workflow_run`, `issue_comment`, `pull_request_review` or
  `pull_request_review_comment` (today only `release-source.yml`) must:
  (a) be hosted-only; (b) have no checkout, local `uses: ./`, reusable call,
  `actions/download-artifact` or `gh run download`; (c) have no `actions/cache`
  or `setup-*` with `cache:`; (d) set read-only top-level `permissions` and no
  job-level write; (e) reference no `secrets.*` (`github.token` is allowed); and
  (f) pass `github.event.*`, `github.head_ref`, `inputs.*` and whole `github` or
  `inputs` contexts (such as `toJSON(github)`) to `run:` through `env:`, never
  by direct interpolation.

A new workflow file or trigger that trips R1 or R2 needs an explicit policy/spec
amendment on #2180, not a weaker guard. The 2026-11-06 hosted-only amendment is
recorded in `openspec/changes/make-core-ci-hosted/`; it leaves R2/R3 unchanged.

## Hosted CI policy and operation

These jobs now select the existing full GitHub-hosted Ubuntu VM directly:

| Workflow             | Jobs                                                            | Previous same-repo default                 | Current placement       |
| -------------------- | --------------------------------------------------------------- | ------------------------------------------ | ----------------------- |
| `ci.yml`             | `build`, `test-unit`                                            | Proxmox unless the hosted override matched | Literal `ubuntu-latest` |
| `ci-integration.yml` | `migrate`, `smoke`, `test-e2e-smoke`, `test-e2e`, `instant-nav` | Proxmox unless the hosted override matched | Literal `ubuntu-latest` |

Existing lightweight hosted jobs retain their appropriate labels. Builds,
PostgreSQL services and Playwright stay on full VMs. Every job retains its
existing triggers, `if:`, `needs`, check identity, checkout ref, timeout,
permissions, artifacts and workload. Hosted placement does not grant fork
access: `migrate` and `smoke` still deliberately reject forks, and the other
same-repository guards remain intact. Required gates still fail on real errors,
cancellations, unexpected skips or missing data. Existing develop-only
informational E2E policy and production-only verification are unchanged.

**Proxmox busy/offline requires no human intervention for this workflow
revision.** No job polls local capacity, obtains a controller response, reserves
a local slot or waits for local startup. There is no routing job, overflow timer,
watchdog or infrastructure-induced retry/cancellation. A healthy job lasting
more than five minutes continues normally under its existing limit. Superseded
PR runs retain the existing cancellation policy; other events are unchanged.

Proxmox remains available to older approved workflow revisions and any separately
authorized work under its existing security controls. Registered runner count is
not proof of available pool capacity. Local-first CI would require a separate
policy amendment backed by measured benefit, safe atomic assignment, isolation,
and bounded recovery after runner loss; an online/not-busy observation is
insufficient. This change neither modifies that infrastructure nor builds such
an admission mechanism.

GitHub outages, hosted concurrency/queue limits, provider image/package
availability and job execution limits remain possible failures. Diagnose the
individual job and retained logs/artifacts. Preserve truthful failures; do not
retry assertions until green or weaken required checks. Missing caches must
remain safe: each job checks out and installs its dependencies, and each
integration database job bootstraps its own disposable PostgreSQL service.

### Variable compatibility, old runs and rollback

`CI_RUNNER_FALLBACK` is unnecessary for these permanently hosted jobs. Unset,
empty, misspelled, unrelated, `github-hosted` and mixed-case values all select
the same literal hosted runner. **Do not delete the repository variable** during
rollout: older branches and already-queued runs may still depend on it.

The #2641 revision uses a case-insensitive `github-hosted` comparison. On that
older revision, unset/empty/other values restore Proxmox; earlier revisions may
have no override at all. A re-run uses its original commit/ref and workflow
revision, so it does not acquire the new policy. Bring current `develop` into an
older branch and trigger a new run. An owner may cancel their own obsolete queued
run when superseding it; do not mass-update branches or cancel unrelated work.

For rollback to a version with the #2641 expressions, retain and verify
`CI_RUNNER_FALLBACK=github-hosted` before reverting. Readback is
`gh variable list --repo Asymmetric-al/core`; do not toggle the global variable
for individual runs or unset-case tests. If the hosted escape path cannot be
confirmed, preserve literal hosted placement while reverting the affected
changes. Never recommend removing the override while restoring a local default.
This rollout does not change branch protection, enable a production merge queue,
publish a release or push to `production`.

## Threat model

| Threat                                                          | Control                                                                                                                                                                                                                                                                                                                                                                                              | Owner                          | Repo or settings  |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ----------------- |
| T1 Fork `pull_request` rewrites `runs-on` in its own YAML       | A2, A3 and the maintainer rule; then A1; D-1 records deferred isolation                                                                                                                                                                                                                                                                                                                              | Samson / Blake                 | Settings          |
| T2 `pull_request_target` path (fork checks false, secrets live) | R2 bans it on reachable workflows; R3 keeps its users hosted, checkout-free and read-only                                                                                                                                                                                                                                                                                                            | Repo guard                     | Repo              |
| T3 `workflow_run` path (artifact poisoning in base context)     | R2; R3(b) bans artifact downloads and checkout                                                                                                                                                                                                                                                                                                                                                       | Repo guard                     | Repo              |
| T4 `issue_comment` and review-event paths                       | R2; R3. No comment-triggered workflow exists today                                                                                                                                                                                                                                                                                                                                                   | Repo guard                     | Repo              |
| T5 `merge_group` path                                           | Same-repo content only, modelled by the #2201 non-fork scenario. `develop` requires 0 approving reviews, so T5 rests on trusted collaborators plus the 4 required checks (`ci-gate`, `e2e-smoke-gate`, `migrate`, `smoke`), not on review. Samson accepted this risk for now; Code Owners plus separate App identities are tracked in [#2156](https://github.com/Asymmetric-al/core/issues/2156). A7 | Repo harness; Samson / Blake   | Repo and settings |
| T6 New, other or branch-only workflow targets proxmox           | R1 on `develop`. Branch-only files are trusted collaborator content until D-1                                                                                                                                                                                                                                                                                                                        | Repo guard                     | Repo              |
| T7 Reusable or remote-workflow indirection                      | R1 (transitive local calls, remote calls fail closed); R2 bans `workflow_call` on reachable files                                                                                                                                                                                                                                                                                                    | Repo guard                     | Repo              |
| T8 Secrets exposure                                             | Fork-reachable jobs pinned by the #2158/#2201 harness; R3(e) for privileged triggers; A5 for host disk                                                                                                                                                                                                                                                                                               | Repo harness; Runner bot       | Repo and host     |
| T9 Persistence between jobs on a reused runner                  | A5 ephemeral JIT VMs; the repo cannot verify host state                                                                                                                                                                                                                                                                                                                                              | Runner bot, reviewed by Samson | Host              |
| T10 Token permissions                                           | Main workflows' `permissions` pinned by #2201; R1 permits no self-hosted-reachable file; R3(d); A6                                                                                                                                                                                                                                                                                                   | Repo guard; Samson / Blake     | Repo and settings |
| T11 Cache poisoning                                             | Caches are ref-scoped; `TURBO_TOKEN` cannot reach forks; R3(c) bans caches under base-scope triggers; A5 for host caches                                                                                                                                                                                                                                                                             | Repo guard; Runner bot         | Repo and host     |

## Decisions

### D-1 Workflow-restricted runner group (deferred)

GitHub's "Selected workflows" entries must be pinned to a branch, tag or SHA.
PR runs use `refs/pull/<n>/merge` and merge-queue runs use `gh-readonly-queue/…`
refs, so pinning `ci.yml@refs/heads/develop` would strand every PR and
merge-group job. The previously proposed isolation option moves self-hosted
jobs into reusable workflows called by ref from `develop`/`production` and sets
`restricted_to_workflows: true` on the group. It rewrites `ci.yml`,
`ci-integration.yml` and the harness, and needs an org runner group in place of
the current repo-level runners (A1). Tracked in
[#2231](https://github.com/Asymmetric-al/core/issues/2231). Hosted-only CI does
not require this integration; it is not implemented or authorized by this
change. Reintroducing local reach would first require a separate R1 amendment
and proof of dependable assignment and recovery.

### D-2 Interaction-limit replacement

Readback on 2026-10-23: the repository is public;
`pull_request_creation_policy` is `collaborators_only`, which does not expire;
the `collaborators_only` interaction limit expires `2027-03-23T13:37:37Z`; the
fork-PR approval policy is `all_external_contributors`; the runner-groups API
returns 403 to repository tokens.

The lasting control is the PR-creation policy (A2) plus fork-PR approval (A3),
with R2 closing the comment-triggered path. Runner safety does not depend on
the interaction limit. Keep renewing it as cheap comment and issue spam control
through [#1906](https://github.com/Asymmetric-al/core/issues/1906) (renew by
2027-02-23) and its weekly read-only heartbeat. No CI date check is added; it
would block merges with no code change.

## Admin checklist

Settings steps need Samson (security owner) or Blake; host steps belong to the
Runner bot. Every command below is a read-only readback.

- **A1 Runner registration (historically met).** The 2026-10-23 readback
  recorded 4 JIT runners registered at repository level on `Asymmetric-al/core`, labelled
  `self-hosted, Linux, X64, proxmox`. Repo-level registration is the A1 control:
  no other repository can schedule jobs on them. Samson ruled on 2026-10-23
  that this meets A1 (PR #2241). Readback:
  `gh api repos/Asymmetric-al/core/actions/runners --jq '.runners[] | [.name, ([.labels[].name] | join(","))] | @tsv'`.
- **A2 PR creation.** Keep `pull_request_creation_policy=collaborators_only`.
  Readback: `gh api repos/Asymmetric-al/core --jq .pull_request_creation_policy`.
- **A3 Fork-PR approval.** Keep "Require approval for all external
  contributors" and follow the maintainer rule. Readback:
  `gh api repos/Asymmetric-al/core/actions/permissions/fork-pr-contributor-approval`.
- **A4 Interaction limit.** Renew by 2027-02-23 per #1906; not load-bearing for
  runners. Readback: `gh api repos/Asymmetric-al/core/interaction-limits`.
- **A5 Ephemeral JIT VMs (met; Runner bot, reviewed by Samson).** One job per VM,
  destroyed after the job; no shared volume, toolcache, bun, Docker or `.turbo`
  state; no long-lived credentials in the template; JIT tokens minted per VM
  and never stored; LAN egress blocked. Attest it with one recent run showing
  distinct runner IDs:
  `gh api repos/Asymmetric-al/core/actions/runs/<run-id>/jobs --jq '.jobs[] | [.name, .runner_id] | @tsv'`.
  Recorded met on #2180.
- **A6 Actions settings (met).** Default `GITHUB_TOKEN` read-only and "Allow
  GitHub Actions to create and approve pull requests" off. The fork write-token
  and secrets settings apply to private repositories only (N/A). Read back by
  Samson on 2026-10-23 ([#2180 comment](https://github.com/Asymmetric-al/core/issues/2180#issuecomment-6374927694)):
  `default_workflow_permissions: read`, `can_approve_pull_request_reviews: false`.
  Readback: `gh api repos/Asymmetric-al/core/actions/permissions/workflow`.
- **A7 Branch protection (met).** `develop` uses classic branch protection:
  strict required status checks `ci-gate`, `e2e-smoke-gate`, `migrate` and
  `smoke`; enforce admins on; force pushes and deletions off; 0 required
  approving reviews; Code Owners review not required (deferred to
  [#2156](https://github.com/Asymmetric-al/core/issues/2156)). `merge_group` content is therefore not review-gated; see
  T5. Read back by Samson on 2026-10-23 ([#2180 comment](https://github.com/Asymmetric-al/core/issues/2180#issuecomment-6374927694)). Readback:
  `gh api repos/Asymmetric-al/core/branches/develop/protection` (the rules
  endpoint returns `[]` because the protection is classic).

A1, A5, A6 and A7 were recorded as met on 2026-10-23. A2 and A3 were read back
the same day (D-2); A4 stays tracked by #1906.
