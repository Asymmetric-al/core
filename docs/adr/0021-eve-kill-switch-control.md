# ADR-0021: Restrict Eve through atomic, app-owned kill switches

**Status:** Accepted
**Date:** 2026-07-17
**Issue:** #420
**Builds on:** ADR-0018, ADR-0019, ADR-0020

## Context

ADR-0019 established one disabled-by-default governance kernel, but its initial
state did not define a stable granular switch shape or an authorized mutation
path. Eve needs independently controllable restrictions for all automation,
active runs, GitHub actions, production writes, sandbox networking, dynamic
workflows, model-policy changes, and force-approval mode before any live
runtime integration is introduced.

The control path must not become another source of authority. A prompt, model,
tool response, memory record, browser client, or runtime session cannot decide
that a switch is clear. Every deliberate human actuation must also remain
reconstructable under ADR-0020, including transitions that do not change the
stored value.

## Decision

Eve governance state has one explicit boolean value for each of these keys:

- `all_automation`
- `active_runs`
- `github_actions`
- `production_writes`
- `sandbox_networking`
- `dynamic_workflows`
- `model_policy_changes`
- `force_approval`

The app-owned governance singleton is the source of truth. The schema rejects
missing, extra, or non-boolean switch values. The reusable governance check
must receive the autonomous domain from trusted application code and block
when emergency-off, the release gate, the master switch, the matching domain
switch, force-approval, or policy readiness forbids the action.

Only an authenticated admin route may invoke the initial control path. The
browser supplies the target switch, target value, expected state version, and
an optional reason; verified actor and initiator identity come from server auth
context. Service and model-adjacent identities are rejected by the application
control even though the database function is service-role-only.

Each actuation calls one security-definer database function that:

1. validates the switch and accountable identity inputs;
2. locks the governance singleton and checks the expected state version;
3. applies the transition, incrementing the version only when state changes;
4. appends an ADR-0020 audit row for either a successful change or an
   idempotent skipped transition; and
5. returns the resulting switch state and audit identifier.

The state transition and audit insert share one transaction. If either fails,
neither commits. Reasons are bounded and redacted before they reach the
function. The admin UI requires a deliberate confirmation and makes clear that
clearing a restriction does not enable Eve or grant authority.

There is no live runtime in this slice. Future runtimes must consult the same
persisted state immediately before each meaningful effect; durable or
long-running work must also re-consult at governed checkpoints so the
`active_runs` and master restrictions can stop further effects.

## Failure behavior

Missing, malformed, unavailable, or stale governance state fails closed. A
stale expected version rejects the entire actuation so concurrent admins
cannot silently overwrite one another. Audit failure rolls back the state
transition. Clearing a switch never bypasses release, emergency, identity,
tenant, approval, protected-area, budget, or capability-specific policy.

## Boundary with adjacent slices

- ADR-0018 owns the overarching autonomy and human-authority contract.
- ADR-0019 owns the release gate, emergency precedence, app-owned state, and
  mandatory consult-before-effect kernel.
- ADR-0020 owns the accountable audit record and redaction contract.
- ADR-0021 owns the eight-switch shape, atomic authorized actuation, and
  per-domain policy consumption.
- #421 owns model-policy drafting, evaluation, activation, and rollback.
- #437 owns final readiness verification and the authorized release-gate flip.

## Consequences

- Operators can prove and exercise stop controls before runtime exists.
- Every actuation is attributable and cannot diverge from its audit record.
- Callers must classify every autonomous effect into a trusted domain.
- Concurrent changes require the caller to refresh and deliberately retry.
- Future long-running runtimes must add governed checkpoints; stored switch
  state alone cannot interrupt code that never re-consults policy.

## Verification

- Migration tests cover all eight keys, exact state shape, row locking,
  optimistic versioning, atomic audit insertion, and service-role-only RPC
  execution.
- Kernel tests prove the master switch, every autonomous domain, and
  force-approval behavior block effects before execution.
- Control and route tests prove verified admin attribution, redaction, invalid
  input rejection, and fail-closed database errors.
- Admin tests prove all controls are visible and require confirmation.
