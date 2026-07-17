# Design: Eve autonomous operations foundation

## Status

Accepted for issue #417. The canonical architecture decision is
[`ADR-0018`](../../../../docs/adr/0018-governed-eve-autonomy.md); this file records
the OpenSpec change design and does not create a second ADR.

## Context

The repository already has durable product intent in OpenSpec, an always-on
instruction router in `AGENTS.md`, server-side identity and data boundaries,
CI gates, and Supabase-owned application state. Eve must compose with those
systems rather than establish a parallel authority or authorization model.

The Eve PRD requires the first implementation slice to define the OpenSpec
contract, initial autonomy ADR, governance data model at the spec level,
rollout order, feature-flag posture, and verification contract before runtime
work proceeds.

## Design decisions

### Durable behavior and evidence

OpenSpec defines Eve's durable product behavior. `AGENTS.md` remains the
canonical router for repo instructions and applicable OpenSpec specs remain the
authority for product intent. Runtime, GitHub, CI, evals, and logs provide
evidence of current observed state; version-matched official documentation
provides API facts; memory is context only and never authority.

### Accountable execution identity

Identity is resolved by the trusted execution boundary:

- Mission Control requests act as the current signed-in admin, with user,
  tenant, role, and permission scope from verified server-side session context.
- Scheduled, background, and system work acts as an app-configured service
  identity, with explicit initiator or trigger and trusted tenant/repository
  scope from app-owned job or configuration state.
- GitHub work acts through the configured bot and records the accountable
  human, service trigger, or GitHub event.

Prompts, models, tools, unverified remote payloads, and memory cannot establish
or widen identity or scope. A signature-verified GitHub event may identify a
target only after its installation and repository map to configured allowlists.

### Governance model and ownership

The app-owned governance model covers release and kill-switch state, audit,
approvals, budgets, model policy, notification records, run summaries,
shared-run-context metadata, private admin memory, replay metadata, and
retention state. Supabase owns that application data. Eve sessions and workflow
durability remain the responsibility of the isolated Eve runtime and its host.

This change defines behavior and ownership only; schema, RLS, storage, and
runtime code are implemented and verified in later slices.

### Controlled rollout

Delivery follows issues #418–#437 in governance-first phases: governance and
audit; controls and policy; runtime and sandboxing; admin surfaces; GitHub
operations; subagents and workflows; notifications, retention, and launch
verification. All implementation remains behind one app-owned release gate
that defaults to disabled. Independently runnable slices also remain behind
capability-specific flags or disabled configuration; those controls may only
restrict behavior and cannot bypass the master gate. Emergency-off and more
restrictive policy always win. Only #437 may establish launch readiness, and
only an authorized human may enable the gate.

### Verification contract

Each later slice must prove its externally observable policy and safety
outcomes with focused tests plus formatting, `skills:verify`, lint,
workspace-contract, data-boundary, typecheck, build, and unit-test gates. Final
launch verification must cover identity and ownership, audit and redaction,
evals, protected-area enforcement, budgets, kill switches, rollback, retention,
notification safety, deployment compatibility, and operator runbooks. Missing,
stale, mismatched, waived, or failing evidence keeps Eve disabled.

## Consequences

- Later implementation can progress incrementally without granting incremental
  production autonomy.
- Vercel and Supabase provisioning are later implementation concerns, not
  evidence that Eve is ready to run.
- Protected operations remain deliberately slower because human review is a
  safety property.
- Downstream Eve changes cite the durable capability spec and ADR-0018 rather
  than this archived change directory.
