# Design

## Context

Current develop at `4329fa0089b9e166ee9a6f655bfd9eba8277b452` contains merged
PR #2641. Its seven dynamic runner selections default to Proxmox; only the
case-insensitive `github-hosted` override avoids local queues. See proposal.md
for the requested reliability outcome. R1 currently requires exactly the two
main workflows to retain self-hosted reachability.

## Goals / Non-Goals

Use the existing full Ubuntu VM environment for each affected workload. Preserve
all compilation, security, migration, real-stack and browser behavior, including
independent disposable databases and production-only navigation compilation.
Infrastructure changes, new routing control paths, deployment and production
verification runs are outside this change.

## Decisions

1. Replace the seven expressions with literal `ubuntu-latest`. Availability
   probes cannot reserve capacity or recover a runner lost after assignment.
   Safe assignment, measured local benefit and bounded recovery are unproven;
   implementing a controller would delay the authorized dependable baseline.
   Existing lightweight hosted jobs keep their labels.
2. Amend the owning R1 decision in `docs/ops/self-hosted-runners.md` to an
   explicit empty set, with matching guard and mutation contracts. Keep
   conservative reachability resolution and unchanged R2/R3. Assert the actual
   seven-job inventory and safe placement so security tests do not pass merely
   because no local job was discovered.
3. Keep event triggers, job IDs/conditions, dependencies, permissions, services,
   caches, artifacts, pinned actions and toolchains unchanged. No local mode,
   overflow timer, assertion retry or replacement success context is added.
   Existing fork rejection remains necessary despite hosted placement. The
   existing compilation gate is tightened to accept only explicit `true` or
   `false` planning output: its former CLI default could accept missing/garbage
   output when every result, including build, succeeded. Both the pure validator
   and executed-gate regressions cover these invalid inputs explicitly.
4. Retain `CI_RUNNER_FALLBACK` for older branches. New workflow revisions ignore
   it because they are permanently hosted. Proxmox registration, isolation and
   controller configuration remain intact; future local admission requires
   separately proved benefit, secure assignment and bounded recovery.

## Risks / Trade-offs

- GitHub availability, concurrency limits and runner resources still apply;
  inspect individual jobs/logs and report actual failures rather than promise
  outage immunity.
- Old refs retain local defaults; bring current develop into the branch and
  trigger a new run. Rerunning an old run retains its original workflow revision.
- A successful develop run omits production-only navigation; exercise a safe
  branch-scoped manual integration run and preserve production event fixtures.
- Existing acceptance fingerprints protect unrelated bytes; review each
  intentional adjustment with existing helpers rather than globally rebaseline.

## Migration Plan

Prove RED/GREEN at the existing workflow evaluator, run focused and repository
gates, then inspect real final-revision CI including compilation and integration
jobs. Record candidate/tested SHAs, run IDs/attempts, runners and actual results
in review evidence. Do not stop Proxmox to prove independence: literal hosted
placement plus runtime runner identities establishes the absence of a local
dependency. Merge only through existing review and branch protections. For a
revert to #2641 behavior, first retain/verify `CI_RUNNER_FALLBACK=github-hosted`;
if that escape path cannot be established, retain hosted labels while reverting
other changes. No production publication follows automatically.
