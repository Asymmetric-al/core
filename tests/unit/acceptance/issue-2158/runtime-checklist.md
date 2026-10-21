# Issue #2158 — runtime acceptance checklist (not automated)

Spec: [rev 3 comment](https://github.com/Asymmetric-al/core/issues/2158#issuecomment-6269823612)

These checks run during final acceptance on an implementation PR’s own CI. They are **not** covered by the static workflow YAML tests in this directory.

## Self-hosted isolation (done criterion 5)

- [ ] Every **self-hosted** job in the PR’s CI run has a **distinct `runner_id`** in the GitHub Actions jobs API (or equivalent in the “Set up job” log).
- [ ] JIT `runner_name` values may repeat across jobs (same VM pool); **`runner_id` must not** repeat for self-hosted jobs in the same workflow run.
- [ ] No job depends on filesystem, Docker, or process state left by an earlier job in the same or a prior run (fresh VM per registration).

## Resource and connectivity (done criteria 7–8)

- [ ] Moved jobs complete on 4 vCPU / 8 GB runners without OOM kills or timeout failures attributable to hardware limits.
- [ ] Endpoints used by moved jobs are `127.0.0.1` / `localhost` or public internet only (no LAN/tailnet).

## Integration workflow dispatch (done criterion 9)

- [ ] A manual `workflow_dispatch` of **CI Integration** runs `instant-nav` and `test-e2e` successfully on self-hosted runners.

## Fork behavior (manual or simulated event)

- [ ] On a fork `pull_request`, `migrate` and `smoke` run on GitHub-hosted runners and **fail** with “fork PRs need a maintainer to run CI” (not skip/succeed).
- [ ] On a fork PR, hosted gates (`ci-gate`, `e2e-smoke-gate`, `integration-gate`) **fail** when heavy dependencies were skipped due to the fork guard.
