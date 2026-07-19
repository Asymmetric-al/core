# eve-model-policy Specification

## Purpose

Define Eve's app-owned, versioned model-policy control plane: named
Gateway-primary roles, controlled direct-provider fallbacks, per-subagent
settings, dedicated human permission, eval-gated activation, atomic rollback,
hard budgets, and persisted kill-switch subordination without enabling live
provider calls or widening Eve's authority.

## Requirements

### Requirement: The Shared Model Policy Uses Named Roles And Per-Subagent Settings

Eve MUST express model choice as a **shared model policy of named roles** (for example an agent role, a
review role, a judge role), not as a single hard-coded model, so that Eve, admin AI features, evals, and
external coding-agent guidance resolve models through consistent roles. The policy MUST support **per-subagent
overrides** (a subagent MAY carry its own model role, reasoning setting, fallback, budget, and eval gate). V1
MUST use **one platform-wide policy**, and the schema MUST leave room for tenant-specific overrides later
without requiring them now. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:187]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:471]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:480]

#### Scenario: A caller resolves a model through a named role

- GIVEN the shared model policy defines a named role
- WHEN Eve, an admin AI feature, an eval, or external guidance needs a model for that role
- THEN it resolves the model from the policy's role definition, not from a hard-coded model id
- AND changing the role's model in policy changes every caller of that role without code changes

#### Scenario: A subagent overrides the platform role

- GIVEN a subagent declares its own model role and settings
- WHEN that subagent runs
- THEN its per-subagent override applies for that subagent only
- AND subagents without an override fall back to the platform role definition

#### Scenario: V1 stays single-policy with room to grow

- GIVEN V1 uses one platform-wide model policy
- WHEN a reviewer checks the schema
- THEN the schema can express tenant-specific overrides in a later version
- AND no tenant override is required or active in V1

### Requirement: Gateway Is The Primary Route And Direct Providers Are Controlled, Non-Default Fallbacks

The shared model policy MUST use the **Vercel AI Gateway as the primary model route**. Any **direct provider**
— including an external partner inference gateway — MUST be expressible only as a **controlled fallback**: it
MUST NOT be the default or primary route, MUST be eligible only when an authorized admin has explicitly
configured it and its eval gate has passed, and MUST be **revocable at any time** (by policy edit or by the
#420 model-policy kill switch) without touching Eve runtime code. A direct provider MUST NOT become active
implicitly, by prompt, by model output, or by tool input. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:205]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:468]

#### Scenario: Gateway remains the default route

- GIVEN the shared model policy is active
- WHEN a role resolves to a model with no explicitly-activated fallback
- THEN routing goes through the Vercel AI Gateway as the primary route
- AND no direct provider is used unless it has been explicitly configured and eval-passed as a fallback

#### Scenario: A partner GPU gateway is proposed as a controlled fallback

- GIVEN an authorized admin proposes an external GPU inference gateway as a direct-provider fallback for a role
- WHEN the fallback is added to the policy
- THEN it is recorded as a non-default fallback, inactive until its eval gate passes and an admin activates it
- AND it never becomes the primary route and never overrides Gateway-primary routing implicitly

#### Scenario: A fallback provider is revoked instantly

- GIVEN a direct-provider fallback is active for a role
- WHEN an authorized admin revokes it (by policy edit or the model-policy kill switch)
- THEN the role immediately stops using that provider and returns to Gateway-primary routing
- AND the revocation takes effect without any Eve runtime code change and is audited

### Requirement: Model-Policy Edits Require A Dedicated AI-Settings Permission

Editing the model policy MUST be guarded by a **dedicated AI-settings permission** that is distinct from
general admin access, so that ordinary admin authority does not imply model authority. Edits MUST be made from
Mission Control by a verified human holding that permission; policy edits MUST NEVER be selectable or
triggerable by prompt, model output, or tool input. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:191]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:197]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:474]

#### Scenario: A general admin without AI-settings permission is refused

- GIVEN an admin who lacks the dedicated AI-settings permission
- WHEN they attempt to edit the model policy
- THEN the edit is refused because general admin access does not imply model authority
- AND the attempt is recorded

#### Scenario: A prompt attempts to change model policy

- GIVEN a prompt, model output, or tool response asks to change a role's model or activate a provider
- WHEN the request is evaluated
- THEN it is rejected because policy edits require a verified human with the AI-settings permission, not
  model-controlled input
- AND the attempt is recorded

### Requirement: Model-Policy Changes Are Draftable, Eval-Gated, Activatable, Rollback-Capable, And Audited

Every model-policy change MUST move through a lifecycle: an authorized admin **drafts** it, it is **evaluated**
against an eval gate, it may be **activated** only if the eval gate passes, and any activation MUST be
**rollback-capable** to the previously active policy. Every draft, activation, rollback, and emergency
override MUST **emit a #419 audit record** (actor, identity mode, action, target, result, evidence summary) so
that model changes cannot silently weaken Eve. Activation MUST be blocked if the eval gate has not passed.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:194]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:477]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:113]

#### Scenario: Activation is blocked until the eval gate passes

- GIVEN an admin has drafted a model-policy change
- WHEN they attempt to activate it before the eval gate has passed
- THEN activation is blocked
- AND activation is permitted only once the eval gate passes, and the activation is audited

#### Scenario: A regressed change is rolled back

- GIVEN a newly activated model policy is found to weaken Eve
- WHEN an authorized admin rolls it back
- THEN the previously active policy is restored
- AND the rollback emits an audit record identifying actor, prior policy, and time

### Requirement: Hard Budgets And Rate Limits Apply Per Role And Subagent With Audited Emergency Override

The model policy MUST carry **hard budgets and rate limits** that apply to roles, subagents, dynamic
workflows, evals, judge models, and expensive features, so that autonomous runs, subagents, evals, and judges
cannot burn unbounded spend. An **emergency override** of a budget or rate limit MUST require the dedicated
permission and MUST be audited. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:209]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:483]

#### Scenario: A role hits its budget ceiling

- GIVEN a role's hard budget is exhausted
- WHEN a caller requests that role
- THEN the request is refused (or degraded per policy) rather than spending past the ceiling
- AND the block is recorded

#### Scenario: Emergency override is permissioned and audited

- GIVEN a budget or rate limit is blocking work and an override is needed
- WHEN an admin with the dedicated permission engages an emergency override
- THEN the override applies within its scope
- AND it emits an audit record identifying the actor, scope, and reason

### Requirement: Judge And Eval Models Are Configured Separately From Agent Models

Eve **judge/eval model roles MUST be configurable independently** of the agent model role, so that eval
quality can be measured without being coupled to the model under test. Changing an agent role's model MUST NOT
change the judge role's model, and vice versa. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:213]

#### Scenario: The judge model is independent of the agent model

- GIVEN the policy defines an agent role and a separate judge role
- WHEN an admin changes the agent role's model
- THEN the judge role's model is unchanged
- AND evals continue to measure the agent against the independently-configured judge

### Requirement: Model Policy Consumes Kill-Switch State, Is Subordinate To #417/#418, And Grants No New Authority

The model-policy capability MUST **consume the #420 model-policy-changes kill-switch state** from the #418
governance kernel: when that switch (or the master pause) forbids model-policy changes, drafting, activation,
and provider changes MUST be blocked, reading only persisted app-owned state and never a prompt/model/tool
claim that a switch is off. This change MUST only add a governed policy surface; it MUST NOT widen Eve's
authority, and no model-policy state may bypass #417's protected-area blocks, production-write limits, or
human-approval requirements, nor #418's release-switch/emergency-off precedence. The implementation MUST remain
an app-owned control plane and MUST NOT introduce live provider calls or enable the Eve release gate. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:185]
[VERIFIED-REPO: openspec/project.md] [VERIFIED-REPO: AGENTS.md]

#### Scenario: The model-policy kill switch blocks activation

- GIVEN the #420 model-policy-changes kill switch is engaged
- WHEN an admin attempts to activate a model-policy change or a provider fallback
- THEN the policy check reads the persisted switch state and blocks the activation
- AND the blocked attempt is recorded

#### Scenario: Model policy grants no new authority

- GIVEN a model policy is active and every kill switch is cleared
- WHEN Eve evaluates an action that touches a protected area or requires approval
- THEN the #417 protected-area and approval rules and #418 emergency-off precedence still apply and can block it
- AND the active model policy never overrides those higher-authority constraints
