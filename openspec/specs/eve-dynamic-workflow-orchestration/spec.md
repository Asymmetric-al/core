# eve-dynamic-workflow-orchestration Specification

## Purpose

Compose bounded Eve workflows from qualified operations with explicit dependencies, verified shared context, durable recovery, and existing governance authority.

## Requirements

### Requirement: Dynamic Workflows Use Validated Typed Plans

Eve MUST represent every dynamic workflow as a versioned, typed plan that declares its run/workflow identity, goal, authorized scope, step graph, registered specialist assignments, inputs, outputs, dependencies, retry limits, failure policy, budget envelope, and #433 delegation cap.

Every clause in `openspec/contracts/eve-dynamic-workflow-orchestration.md#contract-aa7a5532629d42eddf95` MUST apply without exception.

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

The runtime MUST evaluate #418 release/emergency state and #420 relevant kill-switch state before every step, retry, delegation, and resume, regardless of whether the operation is classified as consequential.

Every clause in `openspec/contracts/eve-dynamic-workflow-orchestration.md#contract-ccea5a04b3fed3b61c78` MUST apply without exception.

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

Dynamic workflows MUST use only the real specialists and structured shared run context defined by #433.

Every clause in `openspec/contracts/eve-dynamic-workflow-orchestration.md#contract-bbad2272d1df15fc0fb7` MUST apply without exception.

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

Every workflow failure MUST be assigned an app-owned risk classification.

Every clause in `openspec/contracts/eve-dynamic-workflow-orchestration.md#contract-633ed3e05aa32f483e7e` MUST apply without exception.

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

Eve MUST emit #419 audit records sufficient to reconstruct plan creation, deterministic validation, policy decisions, step lifecycle, delegation, retries, budget consumption, failure classification, pause, cancellation, and authorized resume.

Every clause in `openspec/contracts/eve-dynamic-workflow-orchestration.md#contract-4254d29dc37e531e2335` MUST apply without exception.

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

Issue #425 MUST continue to own sessions, workflow durability, and the workflow host; #424 MUST own retention and redacted replay for persisted workflow audit artifacts; app-owned systems MUST continue to own governance state; and #426 MUST continue to derive user/tenant scope from verified initiator context.

Every clause in `openspec/contracts/eve-dynamic-workflow-orchestration.md#contract-f09821f9feefb8b4d77e` MUST apply without exception.

#### Scenario: The package is reviewed for scope

- **GIVEN** this change is under review
- **WHEN** its repository effects are inspected
- **THEN** runtime code and schema remain consumers of the existing governance, ownership, budget, and audit
  owners
- **AND** the #418 release switch remains off and no deployment or product-workflow change occurred
