# Design: Eve Final Release Switch And Launch Verification

## Context

#437 is a release gate and evidence aggregator, not a second switch implementation. #418 owns the single
release switch, emergency-off state, persistence, and consult semantics. This capability decides whether the
documented prerequisites for an authorized human activation are satisfied for a specific environment and
revision. It never turns “ready” into blanket action authority.

## Decisions

### 1. Readiness is a signed-off manifest bound to an exact target

The manifest includes a stable launch id, environment, application/repository revision, deployment ids,
schema/migration version, policy versions, model/eval configuration revisions, generated time, expiry/freshness
window, evidence entries, reviewers, non-blocking observations, overall result, and immutable audit reference.
It contains references and redacted summaries, never credentials or unsafe raw evidence.

Evidence from a different environment, revision, schema, or policy version does not satisfy the gate unless a
deterministic compatibility rule explicitly proves it applies. Mandatory slice evidence and safety gates are
non-waivable. An observation may document a non-blocking condition, but it cannot turn missing, stale,
mismatched, or failing required evidence into ready.

### 2. Every prior slice has a readiness entry

The manifest covers:

- #417 autonomy/source-of-truth/protected-area foundation
- #418 release/emergency governance kernel
- #419 audit/redaction
- #420 kill-switch controls
- #421 model policy/evals
- #422 memory
- #423 approvals/budgets/rate limits
- #424 retention/replay
- #425 runtime/session/workflow durability
- #426 verified admin/service identity and ownership
- #427 operations workspace
- #428 admin mount/global panel and safe page context
- #429 sandbox containment
- #430 GitHub read/review
- #431 issue-first autonomous PR operations
- #432 strict auto-merge
- #433 subagents/shared context
- #434 dynamic workflows
- #435 engineering-health monitors
- #436 email/Discord notifications

An entry identifies its acceptance tests, operational checks, documentation/runbook, responsible reviewer, and
result. Open implementation work, draft-only contracts, or missing evidence yields not-ready.

#419 owns launch audit/redaction shape. #424 owns retention, hold, and expiry for launch manifests and their
evidence metadata. Neither lifecycle policy nor an incident hold changes the readiness result.

### 3. The end-to-end checklist tests composition, not only isolated components

Required launch evidence proves:

- disabled mode blocks every trigger and records the suppression;
- admin and background identity, session ownership, and cross-user/tenant denial;
- audit/redaction, evidence reconstruction, retention/hold/expiry, and access control;
- deterministic and judge eval gates, model fallback, hard budgets/rate limits, and rollback;
- protected-area, sensitive-file, sandbox secret/network, GitHub, and production-write restrictions;
- master pause, active-run stop, domain switches, dynamic-workflow stop, force-approval, and emergency-off;
- runtime/session continuity, admin workspace/global panel, GitHub operations, subagents/shared context, dynamic
  workflows, monitors, memory, notifications, and safe external delivery;
- deployment/runtime compatibility, configuration presence (without exposing values), observability, and
  operator access to current state and controls.

### 4. Dry-run and reversal precede activation

Operators execute the checklist with the release switch off, including synthetic or isolated trigger paths.
Rollback, emergency-off, kill switches, credential/provider disable paths, and deployment rollback must be
exercised or proven with environment-appropriate non-destructive tests. A failed reversal test blocks launch.

### 5. Only an authorized human may activate #418

When every required entry is current and passing, a verified human with the dedicated release permission may
invoke #418's existing activation path. The activation request binds the exact manifest and target revision,
requires a justification, rechecks emergency/kill state immediately before transition, and emits #419 audit.
A prompt, model, tool, service identity, CI job, merge, deployment, or “ready” result cannot enable the switch.

### 6. Higher-priority controls remain authoritative

Activation does not override protected-area rules, approval requirements, budgets/rate limits, domain kill
switches, or emergency-off. Emergency-off and more restrictive policy always win. Clearing emergency-off does
not automatically resume beyond #418's persisted switch state and current policies.

### 7. Launch and emergency runbooks are discoverable and tested

The launch manifest references versioned operator documentation for readiness review, activation, status
inspection, approvals, budgets, kill switches, emergency-off, active-run termination, rollback, notification
pause, retention/incident hold, audit/replay access, credential/provider disable, and escalation ownership.
Links are checked and instructions are exercised by authorized operators before launch.

### 8. Post-activation verification is bounded and fail-safe

After human activation, a bounded verification window confirms state visibility, trigger gating, audit,
budgets, notifications, and selected safe canary behavior. A critical failure invokes the existing authorized
emergency/kill/rollback path and records the incident. #437 does not create an automatic authority-expanding
recovery mechanism.

## State Flow

1. All implementation slices land but #418 remains disabled.
2. The system generates a target-bound manifest and collects current evidence.
3. Deterministic validation marks missing/stale/failing/mismatched entries not-ready.
4. Authorized reviewers complete composition tests, dry run, reversal checks, and runbook exercise.
5. A verified release operator reviews and binds the passing manifest.
6. Immediately before activation, #418/#420 state and manifest freshness are rechecked.
7. The human invokes #418's existing activation transition; #419 records the action.
8. Bounded post-activation verification either completes or uses existing stop/rollback controls.

## Alternatives Rejected

- **Enable on merge/deploy:** phases cannot safely activate themselves.
- **A checklist with unchecked assertions:** evidence must be machine-identifiable, current, and reviewable.
- **Component tests only:** composition failures occur at identity, policy, runtime, and delivery boundaries.
- **Let Eve enable itself when ready:** self-activation violates the HITL release contract.
- **Create another switch in #437:** #418 already owns the single controlled switch.

## Risks and Mitigations

- **Stale green evidence:** target binding and expiry/freshness validation.
- **Paper-only runbooks:** operator exercise records and link checks.
- **Activation race:** immediate manifest and emergency/kill-state recheck.
- **False readiness from merged specs:** explicit implementation/evidence requirement per entry.
- **Unsafe launch evidence:** safe references/redacted summaries and existing access controls.

## Rollout

This PR implements the launch gate but leaves the release switch disabled, grants no launch permission, and
configures no target. After #417–#436 and this implementation are reviewed and deployed, operators must use
the versioned runbooks to collect target-bound evidence, complete independent review, grant temporary human
permissions, and explicitly activate the exact deployment. Merge and deployment remain inert.
