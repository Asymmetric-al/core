# Delta for Eve Approval and Budget Policy

## ADDED Requirements

### Requirement: Approval Policy Is Separated By Trust Zone

Eve MUST evaluate approval policy by **trust zone**, with separate rules for at least three zones:
**engineering** actions, **product/admin** actions, and **memory** actions. A policy decision made for one
zone MUST NOT apply another zone's rules, and MUST NOT let a looser zone's allowance authorize an action that
belongs to a stricter zone. Each zone's rule set MUST be persisted app-owned policy, not derived at runtime
from a prompt, model output, or tool input.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
[VERIFIED-REPO: openspec/specs/platform-boundaries/spec.md]

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

Eve MUST be able to perform **operational production writes** under policy — at least tasks, notes, labels,
internal statuses, workflow metadata, memory, model settings, and review artifacts — so that it can do
operational work without a human approval for every routine write. These writes MUST still pass the
applicable trust-zone policy, the #418 consult gate, and #420 kill-switch state (for example the
production-writes switch), and MUST emit a #419 audit record.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

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

Eve MUST be blocked from broad **customer, donor, payment, identity, tenant-ownership, auth, secret,
migration, and destructive production writes** without **stricter approval**. These writes are a distinct,
higher-trust class from operational production writes and MUST NOT be authorized by an operational-write
allowance. The policy MUST require the stricter zone's explicit approval before any such write, and MUST
default to deny when the write class is uncertain.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
[VERIFIED-REPO: openspec/specs/platform-boundaries/spec.md]

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

Eve MUST enforce **hard budgets and rate limits** across at least model roles, subagents, dynamic workflows,
evals, judge models, and expensive features, so that autonomous runs cannot burn unbounded spend. When a
budget or rate limit is exceeded, the action MUST be **paused or denied** rather than allowed to overrun.
Budget and limit state MUST be persisted app-owned state consumed by the policy check. An **emergency
override** MUST be possible, but MUST require a dedicated permission and MUST create a #419 audit record;
overriding MUST NOT be selectable by a prompt, model output, or tool input.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

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

Every approval and budget decision MUST be consumed by the #418 single consult gate, MUST read only persisted
app-owned policy/budget/limit state, and MUST emit a #419 audit record identifying the actor/initiator, the
trust zone, the write class or budget, the decision (allow, deny, pause, or override), and the reason. This
change MUST only add gates and restrictions; it MUST NOT widen autonomy, MUST NOT bypass #417
protected-area/approval limits or #418 emergency-off precedence, and MUST remain a spec/ADR + policy contract
with no live autonomous behavior. Where kill-switch state and budget/approval policy disagree, the more
restrictive result MUST win. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
[VERIFIED-REPO: openspec/project.md] [VERIFIED-REPO: AGENTS.md]

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
