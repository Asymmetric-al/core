# eve-governance-kernel normative contract clauses

A section is binding only when the matching requirement unconditionally references
it. A proposed or historical section does not become accepted by residing here.
The reference, requirement identity, scenarios, and normal source-authority rules
form one contract. Preserve all clauses; see openspec/contracts/README.md.

<!-- prettier-ignore-start -->

<a id="contract-dfadd175b674c0b11751"></a>

## Every Autonomous Effect Consults App-Owned Governance State

<!-- BEGIN CONTRACT {"id":"dfadd175b674c0b11751","name":"Every Autonomous Effect Consults App-Owned Governance State"} -->

The governance kernel MUST be the single consult point for autonomous effects.
Immediately before an externally meaningful effect, it MUST evaluate app-owned
release state, emergency and kill-switch state, policy status, and the trusted
execution context required for a decision. Missing, stale, unavailable,
malformed, disabled, or restrictive state MUST fail closed and produce an
observable blocked or skipped reason.

Prompts, model output, tool input, memory, shared context, and runtime session
state MUST NOT establish or widen release, emergency, identity, tenant,
permission, or policy authority. Runtime-owned session and workflow durability
MUST NOT override app-owned governance state.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-a352761585d4a277c62e"></a>

## The Release Gate Defaults To Disabled

<!-- BEGIN CONTRACT {"id":"a352761585d4a277c62e","name":"The Release Gate Defaults To Disabled"} -->

Eve MUST have one app-owned master release gate whose absent, unreadable,
malformed, uninitialized, or explicit disabled state blocks every autonomous
effect. Merging, deploying, or configuring an individual Eve capability MUST
NOT enable autonomy as a side effect. Capability-specific flags MAY further
restrict behavior but MUST NOT enable autonomy while the master gate is off.

Only the final #437 launch verification MAY establish readiness, and only a
verified human using the authorized control path MAY enable the release gate.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->
