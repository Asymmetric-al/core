# Delta for Eve Governance Kernel

## ADDED Requirements

### Requirement: Release Switch Is Disabled By Default

Eve MUST ship with a single master release switch that defaults to **disabled**, and no autonomous Eve
behavior (review, work initiation, PR operation, auto-merge, production-record writes, notifications,
scheduled runs) may execute while it is disabled. The switch MUST NOT be enabled until governance, auth,
audit, evals, protected-area policy, kill switches, and rollback paths are verified (the #437 launch gate).
Merging a later Eve slice MUST NOT by itself enable the switch. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

#### Scenario: A fresh deployment starts with the release switch unset

- GIVEN Eve is deployed and the release switch has never been explicitly enabled
- WHEN any autonomous trigger fires (PR event, schedule, work-initiation path)
- THEN the kernel treats the system as disabled and no autonomous action runs
- AND the trigger is recorded as skipped-because-disabled rather than executed

#### Scenario: A later slice is merged while the switch is off

- GIVEN a subsequent Eve slice (runtime, GitHub operator, subagents, monitors) is merged
- WHEN it is deployed behind the governance kernel
- THEN its autonomous surface stays inert until the release switch is explicitly enabled after the #437 verification
- AND enabling requires a deliberate human action, never a side effect of merging code

### Requirement: Emergency-Off State Halts All Autonomy Regardless Of The Release Switch

The kernel MUST provide an **emergency-off** state that, when set, forces the whole system to
disabled / human-approval-only regardless of the release switch value, and that MUST take precedence over an
enabled release switch. Setting or clearing emergency-off MUST be a human action and MUST be recorded. This
is the kernel's system-wide emergency state; the granular per-domain kill-switch control path is defined
separately (#420) and consumes this state. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

#### Scenario: Emergency-off is engaged while the release switch is on

- GIVEN the release switch is enabled and Eve is operating
- WHEN an operator engages emergency-off
- THEN all in-flight and new autonomous actions stop and the system requires human approval for everything
- AND the emergency-off event is recorded with its initiator

#### Scenario: Clearing emergency-off does not silently resume

- GIVEN emergency-off is engaged
- WHEN it is cleared by a human
- THEN the system returns only to the state the release switch dictates (still disabled if the switch is off)
- AND resumption of autonomy is never automatic beyond what the release switch already allows

### Requirement: The Governance Kernel Persists System State And Every Autonomous Action Consults It

The governance kernel MUST persist, as app-owned data, at least: release-switch state, emergency/kill-switch
state, run summaries, and policy status. Every autonomous Eve action MUST consult the kernel immediately
before acting and MUST abort when the system is disabled or emergency-off. Kernel state MUST be owned by app
data; Eve's own session and workflow durability remain owned by the Eve runtime (per #417). The kernel MUST
NOT be bypassable by prompt, model output, tool input, or memory. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
[VERIFIED-REPO: openspec/specs/platform-boundaries/spec.md]

#### Scenario: An autonomous action checks the kernel before acting

- GIVEN an autonomous Eve action is about to run
- WHEN it begins
- THEN it first reads the kernel's release-switch and emergency-off state
- AND it proceeds only if enabled and not emergency-off, otherwise aborts and records the reason

#### Scenario: A prompt claims the system is enabled

- GIVEN a prompt, model output, or tool response asserts Eve is enabled
- WHEN the kernel evaluates whether to allow an action
- THEN it uses only the persisted app-owned kernel state, never the claim
- AND an action is blocked if the persisted state is disabled or emergency-off

### Requirement: Disabled And Emergency State Are Observable And Provably Blocking

An authorized admin MUST be able to see the current release-switch state, emergency-off state, and policy
status. The change MUST be accompanied by tests proving that disabled mode blocks autonomous behavior (the
disabled gate is not merely cosmetic). [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

#### Scenario: An admin inspects Eve system state

- GIVEN an authorized admin opens the Eve system-state view
- WHEN the kernel reports status
- THEN the admin sees enabled/disabled, emergency-off, and policy status
- AND the view exposes decision-relevant status, not raw hidden model reasoning

#### Scenario: A test asserts the disabled gate

- GIVEN the release switch is disabled
- WHEN the test drives an autonomous trigger
- THEN the test observes no autonomous action occurred
- AND the skipped-because-disabled outcome is recorded

### Requirement: The Kernel Is Subordinate To #417 And Grants No New Authority

The governance kernel MUST only gate autonomy; it MUST NOT widen it. It MUST NOT override the #417 contract
(layered source-of-truth order, spec-first product path, protected-area and production-write limits) and MUST
NOT allow an enabled release switch to bypass protected-area blocks or human-approval requirements. The
kernel change itself MUST remain a spec/ADR + governance-state change and MUST NOT introduce live autonomous
behavior. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
[VERIFIED-REPO: openspec/project.md] [VERIFIED-REPO: AGENTS.md]

#### Scenario: An enabled switch is mistaken for blanket permission

- GIVEN the release switch is enabled
- WHEN Eve evaluates an action that touches a protected area or requires approval
- THEN the #417 protected-area and approval rules still apply and can block it
- AND the enabled switch does not override those higher-authority constraints

#### Scenario: The kernel change is reviewed for scope creep

- GIVEN this governance-kernel change is under review
- WHEN a reviewer checks what it enables
- THEN it introduces only the disabled-by-default gate, emergency-off state, persisted status, and
  observability — no live autonomous surface
- AND anything granting new autonomy is deferred to a later, separately-gated slice
