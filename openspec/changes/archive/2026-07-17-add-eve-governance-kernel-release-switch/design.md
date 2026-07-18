# Design: Eve governance kernel and release switch

## Status

Accepted for issue #418. The canonical architecture decision is
[`ADR-0019`](../../../../docs/adr/0019-eve-governance-kernel.md); this file
records the OpenSpec change design and does not create a second ADR.

## Context

The Eve foundation establishes a single disabled-by-default release gate and
keeps app-owned governance separate from runtime durability. This slice fixes
the state and decision boundary so downstream capabilities do not create
scattered flags, prompt-derived authority, or inconsistent emergency behavior.

## Design decisions

### Release state

The master release gate has two values: disabled and enabled. Missing,
unreadable, malformed, or uninitialized state is interpreted as disabled. A
merge or deployment cannot change the value as an implicit side effect.

### Emergency precedence

Emergency-off is stored independently and takes precedence over an enabled
release gate. Engaging and clearing it are accountable human actions. Clearing
it restores only the decision implied by the release gate and all stricter
policy; it never resumes paused work automatically.

### Governance state boundary

The app-owned governance view contains release state, emergency and granular
kill-switch state, policy status, and run-summary information needed for
operator visibility and decision evidence. `eve_governance_state` persists one
global singleton and `eve_run_summaries` persists decision outcomes. Both live
in Supabase, have RLS enabled, explicitly deny `anon` and `authenticated`, and
are available only through server-owned service-role paths. Eve runtime
sessions and workflow durability remain runtime-owned and cannot override this
state.

### Mandatory consult

Every autonomous effect consults the kernel immediately before acting. The
kernel fails closed and records a skipped or blocked reason when release state
is disabled, emergency-off is engaged, state is unavailable, or a stricter
policy blocks the action. Prompt, model, tool, memory, and session content are
never inputs that can establish authority.

An allow decision is only one precondition. Identity, tenant, permission,
approval, budget, protected-area, production-write, and capability-specific
rules continue to apply.

The shared `runGovernedEveAction` boundary reads current persisted state,
records the decision before an allowed effect, and refuses to invoke the effect
when the state is missing, unreadable, disabled, emergency-off, kill-switched,
or policy-blocked. If the required pre-effect decision record cannot be written,
the effect is also blocked.

### Observability

Authorized operators receive enabled/disabled, emergency, and policy status
plus decision-relevant summaries. The interface must not expose hidden model
reasoning or treat a model-authored explanation as governance truth.

The first admin surface is deliberately read-only. #420 owns granular control
mutations and #437 owns the final release-gate transition, so #418 does not
offer a UI or API action that can enable Eve.

### Adjacent ownership

- #418 owns the release/emergency state contract and single consult gate.
- #420 owns granular per-domain kill-switch controls and their mutations.
- #437 owns launch evidence and the final human-authorized gate change.

## Verification contract

- Strict OpenSpec validation must pass before archival.
- The durable capability must preserve ADR-0018 and grant no new authority.
- Later executable implementations must prove that disabled and emergency
  states prevent autonomous effects and produce observable block reasons.
- #418's focused migration, kernel, route, and UI tests prove the first
  executable path while the release gate remains disabled.
- Existing repository validation and data-boundary gates remain mandatory.

## Consequences

The system gains one non-bypassable place to answer whether autonomy may
proceed, with explicit fail-closed and emergency semantics, app-owned storage,
and honest operator visibility. The cost is a mandatory governance lookup and
decision record before autonomous effects. Later slices still own mutation
controls and live runtime integrations.
