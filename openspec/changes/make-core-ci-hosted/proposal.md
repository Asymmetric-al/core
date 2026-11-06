# Reliable hosted Core CI

## Why

PR #2641 added a hosted override, but normal CI still depends on available
Proxmox runners whenever the repository variable is unset or mistyped. Routine
verification needs to complete without checking local capacity or changing a
global variable. This follow-up relates to AL-2218 without closing its separate
capacity-planning scope.

## What Changes

- Place the existing seven build, unit, migration, smoke and browser jobs on
  standard GitHub-hosted Ubuntu VMs directly.
- Tighten the R1 approved self-hosted-reachable workflow set from exactly
  `ci.yml` and `ci-integration.yml` to the explicit empty set. Preserve R2/R3
  and conservative discovery, fork rejection, permissions and all verification.
- Reject absent or invalid compilation-request output at the existing gate,
  including the otherwise-successful build case, as the requested fail-closed
  contract requires.
- Document the unchanged Proxmox infrastructure, legacy variable compatibility,
  old-branch rollout and a rollback that retains the hosted escape path.

## Capabilities

### New Capabilities

- `ci-runner-policy`: dependable CI placement, truthful gates and explicit
  self-hosted reachability approval.

### Modified Capabilities

None. The active development-build-policy compilation and release contracts
remain binding.

## Impact

Changes are confined to CI runner labels, compilation-plan validation in the
existing gate script, their contract and acceptance tests, and
operational/specification documentation. No application, runtime toolchain,
lockfile, database, branch-protection or deployment changes are intended.
Proxmox retirement, a scheduler, local admission and recovery services, and
production execution are excluded. Revert only with `CI_RUNNER_FALLBACK` retained
as `github-hosted` for revisions that require it; never restore the unsafe
default without an available hosted path.
