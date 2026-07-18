# ADR-0019: Gate Eve autonomy through one app-owned governance kernel

**Status:** Accepted for issue #418 on 2026-07-17

> Parent autonomy decision:
> `docs/adr/0018-governed-eve-autonomy.md`
>
> Durable capability contract:
> `openspec/specs/eve-governance-kernel/spec.md`
>
> Archived source change:
> `openspec/changes/archive/2026-07-17-add-eve-governance-kernel-release-switch/`
>
> Source product documents:
> `docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md`
> and `docs/prds/eve-autonomous-operations/02-implementation-plan.md`

## Context

ADR-0018 requires Eve to ship behind one human-controlled release gate that
defaults to disabled. Later slices need a single, durable definition of that
gate before they introduce audit, policy, runtime, admin, or GitHub behavior.
Without one kernel, each integration could invent its own feature flag or trust
model-controlled input, making it impossible to prove that Eve is actually off.

Issue #418 defines the governance decision and implements its first enforceable
path: service-role-only Supabase state, a reusable fail-closed consult helper,
decision/run summaries, and read-only admin visibility. It does not add a live
autonomous runtime or a release-gate mutation control.

## Decision

### 1. One app-owned release gate controls all autonomous behavior

Eve has one master release gate. Its absent or initial value means disabled.
Merging, deploying, or configuring an individual Eve capability cannot enable
autonomy while that gate is off. Only the final #437 launch verification may
establish readiness, and only a verified human using the authorized control
path may enable it.

Capability-specific flags may restrict a surface further, but they cannot act
as alternative master switches.

### 2. Emergency-off has unconditional precedence

Emergency-off is independent from the release-gate value. When engaged, it
forces all Eve behavior into disabled or human-approval-only operation,
including new and in-flight autonomous actions. The action and accountable
operator must be recorded.

Clearing emergency-off does not itself resume work. The system returns only to
the state implied by the release gate and all stricter policies. No queued or
paused run resumes merely because emergency-off was cleared.

### 3. The governance kernel is the single consult point

Every autonomous action must consult the kernel immediately before its
externally meaningful effect. The kernel reads app-owned governance state,
including release-gate state, emergency and kill-switch state, policy status,
and the run-summary context required to explain the decision.

The consult result is fail-closed. Missing, malformed, unavailable, stale, or
disabled state blocks the action and records a reason. An allow result from the
kernel is necessary but never sufficient: identity, tenant, permission,
approval, budget, protected-area, and capability-specific policy may still
block the action.

### 4. Model-controlled content cannot influence gate authority

Prompts, model output, tool input, runtime session state, shared context, and
memory cannot establish that Eve is enabled or that an emergency restriction
has been cleared. The kernel derives its decision only from verified,
app-owned state and trusted execution context.

Eve runtime sessions and workflow durability remain runtime-owned, but runtime
state cannot override governance state.

### 5. Operators receive decision-relevant status

Authorized operators must be able to observe whether Eve is enabled or
disabled, whether emergency-off is engaged, and whether policy state permits
autonomy. Surfaces expose decision summaries and accountable state changes,
not hidden model reasoning or model-authored claims of authority.

### 6. This kernel grants no authority

The kernel only removes permission. An enabled release gate does not bypass
ADR-0018, protected-area rules, production-write limits, human approvals,
budget policy, tenant isolation, or later granular kill switches.

Issue #420 owns the granular kill-switch control path. Issue #437 owns final
readiness verification and the authorized release-gate flip. This decision
defines the state and consult contract they must use.

## Consequences

- Every autonomous surface has one mandatory, fail-closed activation check.
- Emergency-off remains effective even when the release gate is enabled.
- Later slices can be delivered and tested without activating Eve.
- Governance persistence and operator controls must be app-owned and
  auditable; runtime state cannot become authorization state.
- Each autonomous effect incurs a governance consult, which is a deliberate
  safety cost.

## Alternatives rejected

- **Independent flags per integration:** rejected because they cannot prove a
  system-wide disabled state or express emergency precedence consistently.
- **Prompt or runtime-derived enablement:** rejected because model-controlled
  or session-local state is not a trusted authorization source.
- **Emergency-off as another ordinary flag:** rejected because a normal flag
  cannot provide unconditional, system-wide precedence.
- **Treat an enabled gate as blanket authorization:** rejected because release
  readiness and action authorization are distinct decisions.
