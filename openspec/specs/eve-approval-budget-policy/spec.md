# eve-approval-budget-policy Specification

## Purpose

Define the non-bypassable trust-zone, write-class, hard-budget, approval, and
bounded emergency-override policy consumed before any governed Eve effect.

## Requirements

### Requirement: Approval Policy Is Separated By Trust Zone

Eve MUST evaluate approval policy by **trust zone**, with separate rules for at least three zones: **engineering** actions, **product/admin** actions, and **memory** actions.

Every clause in `openspec/contracts/eve-approval-budget-policy.md#contract-02fc9f28920de90f0239` MUST apply without exception.

#### Scenario: The same action class is judged by its own zone

- GIVEN engineering, product/admin, and memory zones each have their own approval rules
- WHEN Eve evaluates an engineering action (for example opening a code PR) and a memory action (for example
  writing an admin memory) in the same run
- THEN each is judged against its own zone's rules
- AND an allowance in one zone does not authorize the action in the other zone

#### Scenario: A zone cannot borrow a looser zone's rule

- GIVEN a product/admin action requires stricter approval than an engineering action
- WHEN a request tries to have the product/admin action approved under the engineering zone's looser rule
- THEN the policy check rejects the cross-zone reuse
- AND the action is evaluated only under its own trust zone

### Requirement: Operational Production Writes Are Allowed Under Policy

Eve MUST be able to perform **operational production writes** under policy — at least tasks, notes, labels, internal statuses, workflow metadata, memory, model settings, and review artifacts — so that it can do operational work without a human approval for every routine write.

Every clause in `openspec/contracts/eve-approval-budget-policy.md#contract-057353bcbc1139e44481` MUST apply without exception.

#### Scenario: An operational write proceeds under policy

- GIVEN the release switch is enabled, no kill switch blocks production writes, and budget is available
- WHEN Eve updates an internal task status or writes a review artifact
- THEN the trust-zone policy allows it as an operational write
- AND a #419 audit record captures the actor, action, target, and result

#### Scenario: An operational write is paused when its domain is disabled

- GIVEN the #420 production-writes kill switch is engaged
- WHEN Eve attempts an otherwise-allowed operational write
- THEN the action is blocked because policy checks consume kill-switch state
- AND the block is recorded

### Requirement: Sensitive And Business-Data Writes Are Blocked Without Stricter Approval

Eve MUST be blocked from broad **customer, donor, payment, identity, tenant-ownership, auth, secret, migration, and destructive production writes** without **stricter approval**.

Every clause in `openspec/contracts/eve-approval-budget-policy.md#contract-1b83a11d67bf2b511307` MUST apply without exception.

#### Scenario: A business-data write is denied without stricter approval

- GIVEN Eve holds only an operational-write allowance
- WHEN it attempts to write a donor, payment, or identity record, run a migration, or perform a destructive
  production write
- THEN the policy denies the action because that write class requires stricter approval
- AND the denial is recorded with the reason

#### Scenario: An ambiguous write class defaults to the stricter rule

- GIVEN a write cannot be confidently classified as purely operational
- WHEN the policy evaluates it
- THEN it is treated as the higher-trust class and requires stricter approval
- AND it is not silently allowed as an operational write

### Requirement: Hard Budgets And Rate Limits Are Enforced With An Audited Emergency Override

Eve MUST enforce **hard budgets and rate limits** across at least model roles, subagents, dynamic workflows, evals, judge models, and expensive features, so that autonomous runs cannot burn unbounded spend.

Every clause in `openspec/contracts/eve-approval-budget-policy.md#contract-56468369d5e5524835d2` MUST apply without exception.

#### Scenario: An action is paused when its budget is exhausted

- GIVEN a subagent role has reached its hard budget cap
- WHEN a new run tries to spend against that role
- THEN the policy check reads the exhausted budget state and pauses or denies the run
- AND the pause/denial is recorded

#### Scenario: An emergency override is permissioned and audited

- GIVEN a budget is exhausted and an authorized operator holds the emergency-override permission
- WHEN the operator engages the override to let a critical action proceed
- THEN the override is allowed only because of the dedicated permission
- AND a #419 audit record captures the override actor, the budget affected, and the justification summary

#### Scenario: A model output claims budget is available

- GIVEN a model output or tool response asserts that budget remains
- WHEN the policy check evaluates spend
- THEN it uses only the persisted app-owned budget state, never the claim
- AND the action is paused or denied if the persisted budget forbids it

### Requirement: Policy Decisions Are App-Owned, Audited, And Grant No New Authority

Every approval and budget decision MUST be consumed by the #418 single consult gate, MUST read only persisted app-owned policy/budget/limit state, and MUST emit a #419 audit record identifying the actor/initiator, the trust zone, the write class or budget, the decision (allow, deny, pause, or override), and the reason.

Every clause in `openspec/contracts/eve-approval-budget-policy.md#contract-31f1d111f9189e6ce177` MUST apply without exception.

#### Scenario: An allow decision is not blanket permission

- GIVEN a trust-zone policy would allow an operational write and budget is available
- WHEN the action also touches a #417 protected area or is forced to approval by #420 force-approval mode
- THEN the #417 protected-area rules and #420 force-approval still apply and can block or gate it
- AND the #423 allow does not override those higher-authority constraints

#### Scenario: The policy is reviewed for scope creep

- GIVEN this approval/budget change is under review
- WHEN a reviewer checks what it enables
- THEN it introduces only the trust-zone approval rules, the operational-vs-business-data write
  classification, the hard-budget/rate-limit policy, and their audited emergency override — no live
  autonomous surface
- AND anything granting new autonomy is deferred to a later, separately-gated slice
