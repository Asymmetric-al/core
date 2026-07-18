# eve-kill-switch Specification

## Purpose

Define the granular, app-owned controls that let authorized operators restrict
every Eve automation domain, atomically audit each actuation, and require every
governed effect to consume persisted switch state without granting authority.

## Requirements

### Requirement: The Kill-Switch Suite Covers Every Autonomous Domain

Eve MUST provide a kill-switch suite whose switches cover, at least: **all automation** (a master pause),
**active runs** (stop in-flight work), **GitHub actions**, **production writes**, **sandbox networking**,
**dynamic workflows**, **model-policy changes**, and a **force-approval mode** that requires human approval
for every action. Each switch MUST be independently actuatable so that a narrow domain can be disabled
without disabling the whole system, and the master pause MUST be able to halt all domains at once.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

#### Scenario: An owner disables a single domain

- GIVEN the kill-switch suite is available
- WHEN an authorized owner disables the GitHub-actions switch
- THEN Eve performs no GitHub actions
- AND other domains (for example sandbox work that touches no protected area) remain governed by their own
  switches and the release switch, not forced off by this one

#### Scenario: An owner engages the master pause

- GIVEN several autonomous domains would otherwise be permitted
- WHEN an authorized owner engages the all-automation (master pause) switch
- THEN every autonomous domain — automation, active runs, GitHub actions, production writes, sandbox
  networking, dynamic workflows, and model-policy changes — is halted
- AND force-approval applies until the master pause is explicitly cleared by a human

### Requirement: Kill Switches Are Externally And Admin Actuatable Before Runtime Integrations Exist

Each kill switch MUST be actuatable from the admin workspace by an authorized human, and this control path
MUST exist and be provable **before** Eve's runtime integrations exist, so that platform owners can stop Eve
automation ahead of any live surface. Actuation MUST be a deliberate human action performed as the current
authorized admin (or an authenticated external control caller), never selectable or triggerable by prompt,
model output, or tool input. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

#### Scenario: An owner stops automation from the admin workspace before runtime exists

- GIVEN Eve's runtime integrations have not yet been built
- WHEN an authorized owner sets a kill switch from the admin workspace
- THEN the switch state is persisted and observable
- AND when the corresponding runtime later ships behind the governance kernel, it starts subject to that
  persisted switch state

#### Scenario: A prompt attempts to actuate or clear a switch

- GIVEN a prompt, model output, or tool response asks to flip or clear a kill switch
- WHEN the request is evaluated
- THEN it is rejected because switch actuation requires a verified authorized human (or authenticated
  external control) identity, not model-controlled input
- AND the attempt is recorded

### Requirement: Every Kill-Switch Change Creates An Audit Record

Every kill-switch actuation — setting, clearing, or force-approval toggling, for any domain — MUST create an
audit record. The record MUST use the audit contract defined by #419 (actor, initiator, identity mode,
action, target switch/domain, result, and evidence summary) so that who changed which switch, when, and why
is reconstructable. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

#### Scenario: Disabling production writes is audited

- GIVEN an authorized owner disables the production-writes switch
- WHEN the switch change is applied
- THEN an audit record is created identifying the actor, the target switch, the new state, and the time
- AND the record is inspectable in the admin audit history (per #419)

#### Scenario: Force-approval mode is toggled

- GIVEN force-approval mode is off
- WHEN an authorized owner turns it on
- THEN an audit record captures the actor and the transition
- AND clearing it later likewise creates its own audit record

### Requirement: Policy Checks Consume Kill-Switch State And Cannot Be Bypassed

Every policy check that gates an autonomous action MUST consume the current kill-switch state and MUST block
the action when the relevant domain switch (or the master pause, or force-approval) forbids it. Policy checks
MUST read only the persisted app-owned switch state and MUST NOT be satisfiable by a prompt, model output,
tool input, or memory claim that a switch is off. When a switch blocks an action, the action MUST abort and
the block MUST be recorded. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
[VERIFIED-REPO: openspec/specs/platform-boundaries/spec.md]

#### Scenario: A blocked domain stops the matching action

- GIVEN the sandbox-networking switch is disabled
- WHEN an autonomous action attempts sandbox network egress
- THEN the policy check reads the disabled switch and aborts the action
- AND the blocked attempt is recorded with the reason

#### Scenario: Force-approval turns autonomous actions into approvals

- GIVEN force-approval mode is engaged
- WHEN any autonomous action is evaluated
- THEN the policy check requires explicit human approval before the action may proceed
- AND no action runs autonomously while force-approval is engaged

#### Scenario: A model output claims a switch is off

- GIVEN a model output or tool response asserts a kill switch is cleared
- WHEN the policy check evaluates an action in that domain
- THEN it uses only the persisted app-owned switch state, never the claim
- AND the action is blocked if the persisted switch forbids it

### Requirement: The Control Path Drives #418 State, Is Subordinate To #417, And Grants No New Authority

The kill-switch control path MUST drive the emergency/kill-switch **state** that the #418 governance kernel
persists — #418 owns the state and the single consult gate, #420 owns the controls that set it. This change
MUST only restrict autonomy; it MUST NOT widen it, and clearing a switch MUST NOT bypass the #417
protected-area blocks, production-write limits, human-approval requirements, or the #418 release switch and
emergency-off precedence. The change itself MUST remain a spec/ADR + control-path contract and MUST NOT
introduce live autonomous behavior. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
[VERIFIED-REPO: openspec/project.md] [VERIFIED-REPO: AGENTS.md]

#### Scenario: Clearing a kill switch is not blanket permission

- GIVEN every kill switch is cleared and the release switch is enabled
- WHEN Eve evaluates an action touching a protected area or requiring approval
- THEN the #417 protected-area and approval rules and #418 emergency-off precedence still apply and can block it
- AND cleared switches do not override those higher-authority constraints

#### Scenario: The control path is reviewed for scope creep

- GIVEN this kill-switch change is under review
- WHEN a reviewer checks what it enables
- THEN it introduces only the per-domain switches, their admin/external actuation, audit emission, and
  policy-check consumption — no live autonomous surface
- AND anything granting new autonomy is deferred to a later, separately-gated slice
