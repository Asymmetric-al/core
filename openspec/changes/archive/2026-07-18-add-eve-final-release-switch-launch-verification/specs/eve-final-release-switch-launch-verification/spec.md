# Delta for Eve Final Release Switch And Launch Verification

## ADDED Requirements

### Requirement: Launch Readiness Is Bound To An Exact Environment And Revision

Eve MUST represent launch readiness as a versioned manifest containing stable launch id, environment,
repository/application revision, deployment ids, schema/migration version, applicable policy/model/eval
configuration versions, generated time, expiry/freshness window, evidence entries, reviewers, overall result,
and immutable #419 audit reference. Evidence MUST be safe references/redacted summaries and MUST NOT contain
credentials or unsafe raw data. Evidence from a different target or expired window MUST NOT satisfy the gate
without a deterministic compatibility rule. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

#### Scenario: Evidence belongs to another deployment

- **GIVEN** a test passed for a different revision, deployment, schema, or policy version
- **WHEN** the manifest validates readiness for the target environment
- **THEN** that evidence is rejected unless an explicit compatibility rule proves applicability
- **AND** the release switch remains off when required evidence is missing

#### Scenario: Evidence expires before activation

- **GIVEN** a complete manifest passed but required evidence is now outside its freshness window
- **WHEN** activation is requested
- **THEN** readiness becomes not-ready until evidence is refreshed
- **AND** a prior human sign-off does not override staleness

### Requirement: Every Prior Eve Slice Has Passing Implementation Evidence

The manifest MUST contain a required readiness entry for each issue #417 through #436. Each entry MUST identify
the implemented capability/revision, acceptance and operational evidence, relevant runbook, responsible
reviewer, and pass/fail result. Mandatory slice evidence and safety gates MUST NOT be waived. A merged
proposal, draft OpenSpec, unchecked task list, open implementation work, missing/stale/mismatched entry, or
failing evidence MUST produce not-ready and MUST keep #418 disabled. Non-blocking observations MAY be
documented but MUST NOT change a required failing result to ready.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

#### Scenario: All specification PRs are merged but runtime work is incomplete

- **GIVEN** every Eve OpenSpec package is accepted but one or more implementation slices lack passing evidence
- **WHEN** the final readiness manifest is evaluated
- **THEN** it reports not-ready
- **AND** merged specifications are not mistaken for an implemented launch

#### Scenario: One required capability is missing

- **GIVEN** entries for nineteen prior slices pass but one required entry is missing or failing
- **WHEN** overall readiness is calculated
- **THEN** the complete launch result is not-ready
- **AND** no model, operator comment, or partial success can convert it to ready

#### Scenario: An operator records an exception for required evidence

- **GIVEN** a required safety gate is missing, stale, mismatched, or failing
- **WHEN** an operator records a waiver, exception, or non-blocking observation
- **THEN** the manifest remains not-ready because mandatory evidence cannot be waived
- **AND** the annotation cannot enable #418 or change the required result

### Requirement: End-To-End Evidence Proves Safety And System Composition

Before readiness can pass, environment-appropriate end-to-end evidence MUST prove: auth/service identity and
session ownership; cross-user/tenant denial; audit/redaction and retention/replay access; deterministic/judge
eval gates and model rollback; budgets/rate limits; protected-area, sensitive-file, sandbox, GitHub, and
production-write policy; release-off suppression; emergency-off and all relevant kill switches; active-run
stop and rollback; runtime/UI/GitHub/subagents/shared-context/dynamic-workflow/monitor/memory behavior;
platform-owner email and safe Discord policy; deployment compatibility; observability; and operator access to
current controls. Isolated unit tests alone MUST NOT satisfy required cross-capability checks.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

#### Scenario: Disabled mode is exercised across triggers

- **GIVEN** #418 is disabled
- **WHEN** admin, GitHub, schedule, workflow, monitor, notification, and work-initiation triggers are exercised
- **THEN** no autonomous effect occurs and each suppression is safely observable/audited
- **AND** a cosmetic disabled indicator without blocking behavior fails readiness

#### Scenario: Cross-tenant access is attempted end to end

- **GIVEN** a prompt, tool, event, or model output supplies another user or tenant id
- **WHEN** session, memory, context, audit, replay, or action access is attempted
- **THEN** #426-derived verified scope wins and cross-scope access is denied server-side
- **AND** the safe denial evidence is included in launch review

### Requirement: Dry Run, Emergency Controls, And Rollback Must Be Proven Before Launch

Operators MUST complete the checklist while #418 remains disabled and MUST exercise or prove, using safe
environment-appropriate methods, emergency-off, master/domain kill switches, active-run termination,
force-approval, notification pause, provider/credential disable, deployment rollback, model-policy rollback,
and data/schema rollback or forward-recovery. Any failed, destructive-only, undocumented, or inaccessible
reversal path MUST block readiness. [VERIFIED-REPO: openspec/changes/add-eve-kill-switch-control-path]

#### Scenario: A rollback path is documented but fails its exercise

- **GIVEN** deployment rollback instructions exist but the target environment check fails
- **WHEN** readiness evaluates reversal evidence
- **THEN** the manifest remains not-ready
- **AND** documentation alone does not count as operational proof

#### Scenario: Emergency-off is proven

- **GIVEN** an authorized operator performs the safe emergency-control exercise
- **WHEN** emergency-off is engaged during a test run
- **THEN** new and in-flight autonomy stop as #418/#420 require and the result is audited
- **AND** clearing the exercise does not silently self-activate Eve

### Requirement: Activation Uses Only The Existing #418 Human-Controlled Transition

The system MUST permit only a verified human with dedicated release permission to enable Eve, and MUST use
only #418's existing activation path after binding a current passing manifest, recording justification, and immediately rechecking
manifest freshness plus #418 emergency and #420 relevant kill-switch state. Prompts, models, tools, service
identities, CI, merges, deployments, schedules, or ready results MUST NOT enable the switch. #437 MUST NOT
define a second switch or change #418 persistence/semantics. [VERIFIED-REPO: openspec/changes/add-eve-governance-kernel-release-switch]

#### Scenario: An authorized human activates a passing target

- **GIVEN** the exact target has a current passing manifest and no emergency or blocking switch state
- **WHEN** a verified human with release permission confirms the bound manifest and justification
- **THEN** the existing #418 path may transition the switch and #419 records actor, target, manifest, and result
- **AND** the transition grants no authority beyond existing policy

#### Scenario: A CI job reports readiness

- **GIVEN** CI produces a passing manifest
- **WHEN** no authorized human has invoked the #418 activation path
- **THEN** the release switch remains disabled
- **AND** CI success is evidence, not activation authority

### Requirement: Activation Never Overrides Higher-Priority Safety Controls

An enabled #418 release switch MUST NOT bypass #417 source-of-truth/protected-area limits, #418 emergency-off,
#420 granular domain kill switches/control paths, #423 approval/budget/rate-limit policy, #426 verified
identity/ownership, or any more restrictive current rule. Emergency-off MUST always win. Clearing emergency-
off MUST NOT silently resume more autonomy than #418's persisted state and current policy permit.
[VERIFIED-REPO: openspec/changes/add-eve-governance-kernel-release-switch]

#### Scenario: A protected-area action follows activation

- **GIVEN** launch is complete and the release switch is enabled
- **WHEN** Eve proposes an action in a protected area
- **THEN** the existing protected-area approval/block remains effective
- **AND** launch readiness is not treated as blanket authorization

#### Scenario: Emergency-off is engaged after activation

- **GIVEN** Eve is enabled
- **WHEN** an authorized operator engages emergency-off
- **THEN** all autonomy stops regardless of the passing launch manifest
- **AND** the manifest cannot override emergency state

### Requirement: Operators Have Versioned Launch, Emergency, And Recovery Runbooks

The manifest MUST reference accessible versioned runbooks for readiness review, activation, state inspection,
approvals, budgets, kill switches, emergency-off, active-run termination, rollback, notification pause,
retention/incident hold, audit/replay access, provider/credential disable, and escalation ownership. Links and
required permissions MUST be verified and the procedures MUST be exercised by authorized operators before
readiness passes. Runbooks MUST NOT expose secrets. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

#419 MUST own audit/redaction for launch decisions, while #424 MUST own retention, hold, and expiry for launch
manifests and evidence metadata. Retention state or an incident hold MUST NOT override a not-ready result.

#### Scenario: An emergency runbook link is stale

- **GIVEN** a required emergency procedure is inaccessible, outdated, or lacks a responsible owner
- **WHEN** runbook readiness is evaluated
- **THEN** launch remains not-ready
- **AND** the missing operational path is reported without exposing sensitive configuration

### Requirement: Post-Activation Verification Is Bounded And Fail-Safe

After human activation, a bounded verification window MUST confirm visible switch/control state, trigger
gating, audit, budgets, notification safety, and selected non-destructive canary behavior. A critical failure
MUST use the existing authorized emergency/kill/rollback path and MUST be audited; it MUST NOT trigger an
authority-expanding automatic recovery. Successful completion MUST close the launch record with the exact
target and evidence. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

#### Scenario: A critical canary fails

- **GIVEN** the switch was enabled against a passing manifest but a critical post-activation canary fails
- **WHEN** the launch response policy runs
- **THEN** the authorized existing stop/rollback path is invoked and the incident is recorded
- **AND** Eve does not widen permissions or self-reconfigure to continue

### Requirement: Implementation And Deployment Do Not Activate Eve

This implementation MUST reuse rather than redefine the #418 switch and MUST NOT seed release state, grant
launch permissions, set environment values, configure credentials/providers, run a real launch, or enable
autonomous behavior. Applying its migration, merging, and deploying MUST leave the release switch off until
the explicit authorized human activation contract is satisfied. [VERIFIED-REPO: openspec/project.md]

#### Scenario: The package is merged

- **GIVEN** this implementation is accepted, migrated, and deployed
- **WHEN** the repository or environment is inspected
- **THEN** Eve remains disabled until all implementations/evidence and a later authorized human activation exist
- **AND** merge, migration, and deployment themselves perform no activation
