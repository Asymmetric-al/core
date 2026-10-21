# eve-governance-kernel Specification

## Purpose

Enforce one app-owned, fail-closed release and emergency-control kernel before every autonomous Eve effect, without granting authority through deployment or local flags.

## Requirements

### Requirement: The Release Gate Defaults To Disabled

Eve MUST have one app-owned master release gate whose absent, unreadable, malformed, uninitialized, or explicit disabled state blocks every autonomous effect.

Every clause in `openspec/contracts/eve-governance-kernel.md#contract-a352761585d4a277c62e` MUST apply without exception.

#### Scenario: A fresh deployment has no release state

- WHEN an autonomous trigger arrives before the release gate has been
  explicitly enabled
- THEN the kernel treats Eve as disabled
- AND no autonomous effect occurs
- AND the skipped-because-disabled outcome is recorded

#### Scenario: A later capability is deployed

- WHEN an Eve capability is merged or deployed while the master gate is off
- THEN the capability remains inert
- AND neither its deployment nor its local flag can enable autonomy

### Requirement: Emergency-Off Always Takes Precedence

The kernel MUST provide an app-owned emergency-off state that blocks new and
in-flight autonomous effects regardless of the release-gate value. Engaging or
clearing emergency-off MUST be an accountable human action and MUST be
recorded. Clearing emergency-off MUST NOT resume paused work automatically and
MUST restore only the decision implied by the release gate and stricter policy.

#### Scenario: Emergency-off is engaged while release is enabled

- WHEN an authorized operator engages emergency-off
- THEN all new autonomous effects are blocked
- AND in-flight work reaches its governed stop boundary without another effect
- AND the state change records the accountable operator

#### Scenario: Emergency-off is cleared

- WHEN an authorized operator clears emergency-off
- THEN no paused or queued work resumes merely because it was cleared
- AND the release gate and all stricter policies are evaluated again

### Requirement: Every Autonomous Effect Consults App-Owned Governance State

The governance kernel MUST be the single consult point for autonomous effects.

Every clause in `openspec/contracts/eve-governance-kernel.md#contract-dfadd175b674c0b11751` MUST apply without exception.

#### Scenario: An autonomous action is ready to produce an effect

- WHEN the action reaches its effect boundary
- THEN it consults the governance kernel using verified app-owned state
- AND it proceeds only when release is enabled, emergency-off is clear, and no
  stricter policy blocks it

#### Scenario: Model-controlled content claims Eve is enabled

- WHEN a prompt, model response, tool result, memory item, or runtime session
  claims that Eve is enabled
- THEN the kernel ignores the claim as an authority source
- AND the persisted app-owned state determines the result

#### Scenario: Governance state cannot be read

- WHEN the kernel cannot establish a current valid governance state
- THEN it blocks the autonomous effect
- AND records the fail-closed reason for operators

### Requirement: Governance Status Is Observable To Authorized Operators

An authorized operator MUST be able to see the current release-gate state,
emergency-off state, and policy status together with decision-relevant run
summary information. The surface MUST present app-owned state and accountable
decision summaries, not hidden model reasoning or model-authored authority.

#### Scenario: An operator inspects system status

- WHEN an authorized operator opens the Eve system-state surface
- THEN the surface shows enabled or disabled release state, emergency status,
  and relevant policy status
- AND the values come from the same app-owned governance view used by the gate

### Requirement: The Governance Kernel Grants No New Authority

An allow result from the kernel MUST be necessary but MUST NOT be sufficient
for an autonomous effect. Identity, tenant, permission, approval, budget,
protected-area, production-write, and capability-specific policies MUST still
apply. The kernel MUST remain subordinate to ADR-0018 and MUST NOT widen Eve's
authority.

Issue #420 MUST own granular per-domain kill-switch controls. Issue #437 MUST
own final launch verification and the authorized release-gate transition.

#### Scenario: Release is enabled but another policy blocks the action

- WHEN the release gate is enabled but a protected-area, approval, budget,
  permission, tenant, or capability policy blocks an action
- THEN the autonomous effect does not occur
- AND the release-gate value does not override the stricter result
