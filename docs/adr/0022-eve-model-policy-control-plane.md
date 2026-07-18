# ADR-0022: Govern Eve model routing through an eval-gated policy control plane

**Status:** Accepted
**Date:** 2026-07-17
**Issue:** #421
**Builds on:** ADR-0018, ADR-0019, ADR-0020, ADR-0021

## Context

Eve, admin AI features, evals, and future subagents need consistent model
selection without hard-coded provider choices at each call site. That
flexibility cannot allow a prompt, model output, ordinary admin, browser
client, or runtime process to silently change models, select a direct provider,
or remove spend controls.

This tracer bullet must prove that a verified human can draft, evaluate,
activate, and roll back policy without introducing live model calls or enabling
Eve's release gate. It composes with the app-owned governance state from
ADR-0019, accountable audit records from ADR-0020, and the model-policy kill
switch from ADR-0021.

## Decision

Eve model selection is represented by immutable, versioned policy documents.
V1 activates at most one platform-wide policy. The storage schema reserves a
tenant scope for a later schema version, but the V1 application schema accepts
only `platform`.

Each policy defines named agent, review, and judge roles. A role contains:

- a Vercel AI Gateway primary model route;
- explicit, disabled-or-enabled direct-provider fallback candidates;
- hard input-token, output-token, request-rate, and USD-micro limits;
- a reasoning setting; and
- an identified evaluation suite and minimum score.

Per-subagent entries may override role, reasoning, fallback, any budget field,
and the evaluation gate. The judge role must remain independent from the agent
role. The initial resolver is a pure control-plane function: it produces a
Gateway-primary routing plan, exposes a direct route only as an eligible
fallback from an active eval-passed policy, and blocks exhausted budgets. It
does not call any provider or grant authority to perform an action.

Policy mutation requires the dedicated `ai.settings.manage` permission. A
super admin has this platform-owner authority; an ordinary admin needs an
explicit app-owned grant. Verified identity comes from server auth context.
Denied ordinary-admin attempts emit an ADR-0020 blocked audit record. The
browser cannot write policy tables or execute policy mutation functions.

Every version follows this lifecycle:

1. create an immutable draft and canonical SHA-256 hash;
2. run the server-side safety evaluator against the stored document and hash;
3. activate only an evaluated, passing version using optimistic active-version
   comparison; and
4. roll back atomically to the previously evaluated version.

The tracer evaluator enforces the policy invariants that can be proved before
live inference exists: schema validity, named-role completeness,
Gateway-primary routing, controlled fallbacks, resolvable subagent roles and
eval gates, an independent judge, and explicit hard limits. Later model-quality
eval suites may add evidence without bypassing or replacing this lifecycle.

Draft, evaluation, activation, rollback, and emergency override persistence is
performed through service-role-only security-definer functions. Each successful
transition and its ADR-0020 audit row share one transaction. Activation and
rollback update the governance policy status and version in that same
transaction. Stale active-policy expectations, hash mismatches, failed evals,
missing rollback targets, or audit failures reject the whole transition.

Emergency budget overrides are append-only increases scoped to one active role
or subagent. They require the dedicated permission, a reason, automatic expiry
within 24 hours, and database-enforced ceilings of $100 in USD micros, two
million input tokens, two million output tokens, and 1,000 requests. Overrides
never relax another governance gate.

All mutations consult persisted governance state. Emergency-off,
`all_automation`, or `model_policy_changes` blocks the change. Runtime
resolution also revokes direct fallback eligibility immediately when those
persisted restrictions engage. A model, prompt, tool, or memory claim cannot
substitute for that state.

## Failure behavior

Missing or blocked governance, inactive or failed policy, stale expected
state, unknown role, exhausted usage, invalid override, or unavailable storage
fails closed. Clearing a switch or activating a policy does not enable Eve,
bypass ADR-0018 protected areas or approvals, or authorize provider calls.

## Boundary with adjacent slices

- ADR-0018 owns the overarching autonomy and human-authority contract.
- ADR-0019 owns release, emergency precedence, and consult-before-effect.
- ADR-0020 owns the audit record and redaction contract.
- ADR-0021 owns the granular switch shape and atomic actuation.
- ADR-0022 owns model-policy schema, permission, lifecycle, resolver, budgets,
  evaluation, and rollback.
- #433 owns which subagents exist and their tool/instruction surfaces.
- Later runtime slices own provider clients, live routing, usage metering, and
  model-quality eval execution.

## Consequences

- Model routing policy can change without editing runtime code.
- Direct providers remain non-default, policy-bound, and instantly revocable.
- An ordinary admin cannot infer model-setting authority from admin access.
- Every activated policy has a passing evaluation record and a rollback target
  after the first version.
- Callers must supply trustworthy usage snapshots and governance state to the
  resolver; the resolver itself performs no effects.
- Model-quality benchmarks remain a future eval-harness responsibility, while
  the safety and lifecycle gate is operational now.

## Verification

- Unit tests cover schema ceilings, canonical hashing, every evaluator gate,
  role/subagent resolution, fallback revocation, hard budget blocks, dedicated
  permission behavior, route validation, and control error mapping.
- Migration tests cover tables, switch consumption, lifecycle functions,
  atomic audits, rollback, grants, and browser denial.
- An isolated full migration-chain proof exercises failed and passing evals,
  activation, replacement, rollback, bounded and rejected overrides, persisted
  kill-switch rejection, one-active-policy uniqueness, audit-failure rollback,
  and service-role-only execution against real Postgres.
