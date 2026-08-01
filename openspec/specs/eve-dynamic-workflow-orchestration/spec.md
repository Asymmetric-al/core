# eve-dynamic-workflow-orchestration Specification

## Purpose

TBD - created by archiving change add-eve-dynamic-workflow-orchestration. Update Purpose after archive.

## Requirements

### Requirement: Dynamic Workflows Use Validated Typed Plans

Eve MUST represent every dynamic workflow as a versioned, typed plan that declares its run/workflow identity,
goal, authorized scope, step graph, registered specialist assignments, inputs, outputs, dependencies, retry
limits, failure policy, budget envelope, and #433 delegation cap. Deterministic validation MUST reject cycles,
missing dependencies, unknown specialists, schema violations, unbounded retries, cap violations, and work
outside the authorized scope before execution. Generated prose or code MUST NOT execute merely because a model
included it in the plan. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

#### Scenario: A valid plan is accepted for governance evaluation

- **GIVEN** a typed plan uses registered specialists, supported operations, bounded retries, and valid edges
- **WHEN** deterministic plan validation runs
- **THEN** the plan may proceed to the governance consult gate
- **AND** validation itself does not authorize any step

#### Scenario: A generated plan contains an unsupported operation

- **GIVEN** a model places arbitrary code or an unknown tool operation in a workflow step
- **WHEN** deterministic plan validation runs
- **THEN** the plan is rejected before execution
- **AND** the rejection and safe reason are audited

### Requirement: Every Workflow And Consequential Step Passes Current Governance

The runtime MUST evaluate #418 release/emergency state and #420 relevant kill-switch state before every step,
retry, delegation, and resume, regardless of whether the operation is classified as consequential. The #418
consult gate MUST evaluate the workflow before start and MUST evaluate the full applicable action policy
immediately before each consequential effect using current #417 protected-area/source-of-truth policy, #421
model policy, #423 approval/budget/rate-limit state, and #426 verified identity/session ownership. Workflow
generation MUST NOT grant authority unavailable to the underlying action, and the most restrictive applicable
result MUST win. [VERIFIED-REPO: openspec/changes/add-eve-approval-budget-policy/specs/eve-approval-budget-policy/spec.md]

#### Scenario: Policy changes after a workflow starts

- **GIVEN** a workflow was allowed to start but production writes are disabled before a write step
- **WHEN** the runtime consults policy immediately before that step
- **THEN** the step and its dependents do not execute
- **AND** the pause or denial is audited against current persisted state

#### Scenario: A stop condition changes before a non-consequential operation

- **GIVEN** release-off, master pause, or dynamic-workflows-off becomes active after the prior step
- **WHEN** the workflow is about to retry, delegate, resume, or run any next step
- **THEN** it checks #418/#420 state and does not continue
- **AND** classifying the operation as non-consequential cannot bypass the stop

#### Scenario: A workflow claims broader authority

- **GIVEN** a plan or shared-context entry claims that protected-area work is approved
- **WHEN** the consult gate evaluates the underlying action
- **THEN** it ignores the claim and uses app-owned policy and approval state
- **AND** the protected-area rule remains effective

### Requirement: Dynamic Orchestration Preserves Delegation Caps And Shared-Context Safety

Dynamic workflows MUST use only the real specialists and structured shared run context defined by #433. The
configured workflow-specific subagent count and depth caps MUST include root and nested delegation and MUST be
hard limits. Workflow steps MUST preserve schema validation, provenance, confidence, risk, evidence, and
unresolved disagreements; orchestration MUST NOT create an alternate ungoverned context channel.
[VERIFIED-REPO: openspec/changes/add-eve-subagent-catalog-shared-run-context/specs/eve-subagent-catalog-shared-run-context/spec.md]

#### Scenario: Nested delegation reaches the cap

- **GIVEN** active specialists and descendants have reached the configured workflow cap
- **WHEN** another step attempts to delegate
- **THEN** delegation is denied or the workflow pauses under policy
- **AND** no hidden or alternate subagent is created

#### Scenario: Workflow inputs contain an unresolved protected-area disagreement

- **GIVEN** shared context preserves conflicting high-risk findings
- **WHEN** a dependent step is ready to execute
- **THEN** the step pauses for the applicable resolution path
- **AND** orchestration does not select the convenient finding silently

### Requirement: Workflow Failures Escalate By App-Owned Risk

Every workflow failure MUST be assigned an app-owned risk classification. Low-risk failures MAY stop only the
affected branch or use a declared bounded retry. Failures that invalidate dependent work MUST stop the
workflow for review. Suspicious behavior, protected-area contact, policy-bypass evidence, cross-scope access,
secret exposure, or unsafe tool behavior MUST pause the entire run before further action. Critical/systemic
failures MAY request the authorized #420 switch path; this capability MUST NOT create or bypass that path.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

#### Scenario: A harmless leaf step fails

- **GIVEN** a non-consequential leaf step fails with a low-risk classification and has a retry remaining
- **WHEN** failure policy is applied
- **THEN** only its declared bounded retry or branch-stop behavior occurs
- **AND** unrelated authorized branches are not escalated without policy reason

#### Scenario: Suspicious behavior is detected

- **GIVEN** a step attempts an undeclared protected file, secret, identity, tenant, or tool boundary
- **WHEN** the behavior is classified
- **THEN** the whole run pauses before further action
- **AND** audit records the safe evidence and the existing #420 control path remains available to an authorized actor

#### Scenario: A model attempts to downgrade a failure

- **GIVEN** persisted classification rules mark a failure high risk
- **WHEN** a planner or subagent labels it harmless
- **THEN** the app-owned high-risk result wins
- **AND** the run remains paused

### Requirement: Dynamic Workflow Activity Is Auditable And Budget-Bounded

Eve MUST emit #419 audit records sufficient to reconstruct plan creation, deterministic validation, policy
decisions, step lifecycle, delegation, retries, budget consumption, failure classification, pause,
cancellation, and authorized resume. Every generation, step, retry, subagent, eval, and judge call MUST consume
the applicable #423 budget and rate limit. Exhaustion MUST stop or pause work; a workflow MUST NOT self-grant
an override. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

#### Scenario: Retry budget is exhausted

- **GIVEN** a failed step has a declared retry but the applicable budget is exhausted
- **WHEN** the workflow considers the retry
- **THEN** the retry does not run
- **AND** the budget stop and resulting workflow state are audited

#### Scenario: An authorized operator resumes a paused workflow

- **GIVEN** a paused workflow has an approved resolution and current policy permits resume
- **WHEN** the verified operator resumes it through the existing control path
- **THEN** execution continues only from a validated safe state
- **AND** the actor, justification summary, policy decision, and resulting state are audited

### Requirement: This Change Grants No New Product Or Production Authority

Issue #425 MUST continue to own sessions, workflow durability, and the workflow host; #424 MUST own retention and
redacted replay for persisted workflow audit artifacts; app-owned systems MUST continue to own governance
state; and #426 MUST continue to derive user/tenant scope from verified initiator context. The implementation
MAY add release-gated runtime code, governance metadata, and specialist-coordination tools required by this
capability, but MUST NOT modify canonical product/Inngest `workflow-orchestration`, deploy or activate Eve,
enable a provider, perform a production write, or grant authority beyond the underlying action.
[VERIFIED-REPO: openspec/project.md]

#### Scenario: The package is reviewed for scope

- **GIVEN** this change is under review
- **WHEN** its repository effects are inspected
- **THEN** runtime code and schema remain consumers of the existing governance, ownership, budget, and audit
  owners
- **AND** the #418 release switch remains off and no deployment or product-workflow change occurred
