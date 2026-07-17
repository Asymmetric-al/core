# Change: Add Eve Final Release Switch And Launch Verification

## Why

Eve is intended to ship through phased implementation but activate through one controlled release switch.
Issue #437 is the final HITL gate: it aggregates current, environment-bound evidence from every preceding Eve
slice and permits an authorized human to enable the already-defined #418 switch only when the complete launch
contract passes.

Merging specifications or implementation PRs is not launch evidence by itself. Missing, stale, mismatched, or
failing evidence must keep the switch off. Even after activation, emergency-off, granular kill switches,
protected-area policy, approvals, and budgets remain higher-priority constraints.

## What Changes

- Define a versioned launch-readiness manifest covering issues #417 through #436.
- Define evidence identity, environment/revision binding, freshness, reviewer, and pass/fail requirements.
- Define the end-to-end launch checklist for auth, audit, evals, protected areas, kill switches, rollback,
  runtime/UI/GitHub/subagents/workflows/monitors/memory/notifications, retention, deployment, and observability.
- Require dry-run and rollback/emergency-control proof before activation.
- Require an explicit authorized human activation using #418's existing state transition and audit path.
- Define operator runbook discovery, launch record, post-activation verification, and fail-safe rollback.
- Keep this PR spec-only: it does not implement, configure, or enable the release switch.

## Impact

- **Affected capability:** `eve-final-release-switch-launch-verification` (new)
- **Declared blockers:** #417 through #436
- **Issue covered:** #437
- **User stories covered:** 1 through 77
- **Runtime impact:** none in this PR

## Non-Goals

- Redefining #418 release-switch/emergency-off semantics or owning its persisted state.
- Treating merged PRs, draft specs, green unit tests alone, or operator assertions as complete readiness.
- Bypassing #417 protected areas, #420 kill switches, #423 approvals/budgets, or #426 identity ownership.
- Exposing credentials or sensitive evidence in a launch manifest or runbook.
- Activating any environment from this specification PR.

## Evidence

- The PRD requires full workflow readiness with one controlled switch after all named subsystems and safety
  controls are ready.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
- The implementation plan makes #437 dependent on all prior slices and names the final launch checklist.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
- #418 defines disabled-by-default state, human activation, emergency precedence, and the consult gate.
  [VERIFIED-REPO: openspec/changes/add-eve-governance-kernel-release-switch]
