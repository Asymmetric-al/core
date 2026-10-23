# Issue #2158 — runtime acceptance checklist (not automated)

Spec: [rev 3 comment](https://github.com/Asymmetric-al/core/issues/2158#issuecomment-6269823612), as amended by [Scope addendum 1](https://github.com/Asymmetric-al/core/issues/2158#issuecomment-6307912945) (Blake-approved Oct 20, 2026).

These checks run during final acceptance on an implementation PR’s own CI. They are **not** covered by the static workflow YAML tests in this directory. One checklist serves both #2158 implementation PRs; each item states which PR it applies to.

- **PR A** (#2159): `.github/workflows/ci.yml` — `build`, `test-unit` moved to self-hosted; hosted `ci-gate`.
- **PR B** (#2160): `.github/workflows/ci-integration.yml` — `migrate`, `smoke` (fork-aware), `test-e2e-smoke`, `test-e2e`, `instant-nav` moved to self-hosted; hosted `e2e-smoke-gate`, `integration-gate`.

## Self-hosted isolation (done criterion 5)

**PR A (`ci.yml`) and PR B (`ci-integration.yml`)**

- [ ] Every **self-hosted** job in the PR’s CI run has a **distinct `runner_id`** in the GitHub Actions jobs API (or equivalent in the “Set up job” log).
- [ ] JIT `runner_name` values may repeat across jobs (same VM pool); **`runner_id` must not** repeat for self-hosted jobs in the same workflow run.
- [ ] No job depends on filesystem, Docker, or process state left by an earlier job in the same or a prior run (fresh VM per registration).

## Resource and connectivity (done criteria 7–8)

**PR A (`ci.yml`) and PR B (`ci-integration.yml`)**

- [ ] Moved jobs complete on the runner pool — **4 vCPU / 12 GiB RAM + 8 GiB swap (`OOMPolicy=continue`)** per addendum 1 — with no OOM-killed processes and no timeout failures. In the PR run this covers `build` and `test-unit` (PR A) and `test-e2e` (PR B).
- [ ] Endpoints used by moved jobs are `127.0.0.1` / `localhost` or public internet only (no LAN/tailnet). _(Unchanged by addendum 1.)_

## Integration workflow dispatch (done criterion 9)

**PR B only (`ci-integration.yml`)** — not applicable to PR A, which leaves `instant-nav` and `test-e2e` untouched.

- [ ] A manual `workflow_dispatch` of **CI Integration** runs `instant-nav` and `test-e2e` successfully on self-hosted runners.

## Fork behavior (done criteria 11–12)

Per addendum 1, these are **accepted on static coverage**; no live fork-PR run is required. Static coverage means: the workflow guards (fork-aware `runs-on` plus the fork-only fail step on `migrate`/`smoke`; the exact same-repo guard on the other heavy jobs), the hosted fail-closed gates exercised by the acceptance tests in this directory (`ci-gate` step executed against skipped/failed needs; `e2e-smoke-gate` / `integration-gate` scripts executed under bash), and the repository’s fork PR approval policy.

**PR B (`ci-integration.yml`) — required checks `migrate`, `smoke`**

- [ ] On a fork `pull_request`, `migrate` and `smoke` run on GitHub-hosted runners and **fail** with “fork PRs need a maintainer to run CI” (not skip/succeed). _Static: `ci-integration.acceptance.test.ts`._

**PR A (`ci-gate`) and PR B (`e2e-smoke-gate`, `integration-gate`)**

- [ ] On a fork PR, hosted gates **fail** when heavy dependencies were skipped due to the fork guard (`ci-gate` on PR A; `e2e-smoke-gate` and `integration-gate` on PR B). _Static: `ci.acceptance.test.ts`, `ci-integration.acceptance.test.ts`._
