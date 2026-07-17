# Design: Eve Dynamic Workflow Orchestration

## Context

#434 depends on the governance and budget controls that decide whether work may occur, the runtime that owns
durable sessions, and #433's catalog/context contract. This design connects those capabilities without
duplicating them. The workflow layer may decide how authorized work is coordinated; it may not decide whether
the work is authorized.

This capability is deliberately named `eve-dynamic-workflow-orchestration`. It does not modify or replace
canonical `openspec/specs/workflow-orchestration/spec.md`, which owns product/Inngest durable background
execution. This contract concerns Eve-generated specialist coordination only.

## Decisions

### 1. A generated workflow is a validated plan, not executable permission

The planner produces a versioned plan containing the run and workflow identifiers, goal, authorized scope,
step graph, specialist assignment, declared inputs/outputs, dependency edges, retry limits, failure policy,
budget envelope, delegation cap, and policy snapshot references. Before execution, deterministic validation
rejects cycles, missing dependencies, unknown specialists, invalid schemas, cap violations, unbounded retries,
and steps outside the authorized scope.

Model-generated text never becomes code or policy merely because it appears in the plan. The runtime executes
only supported typed operations through existing tool boundaries.

### 2. Governance is checked continuously

The runtime MUST check #418 release/emergency state and #420 relevant kill-switch state before every step,
retry, delegation, and resume, including operations classified as non-consequential. The #418 consult gate
also evaluates the workflow before start and the full applicable action policy immediately before each
consequential effect. It consumes #417 protected-area/source-of-truth rules, #421 model policy, #423
approvals/budgets/rate limits, and #426 verified identity/session ownership. A prior allow does not remain valid
when policy state, scope, budget, or evidence changes.

Workflow generation grants no new authority. Each step must be independently allowed by the same policy that
would govern the underlying action outside a dynamic workflow.

### 3. #433 owns delegation and context boundaries

The workflow may select and sequence only registered #433 specialists. Workflow-specific count/depth caps
remain hard limits, including nested delegation. Steps exchange information through #433 structured shared
run context; they do not create an alternate context channel or overwrite preserved disagreements.

### 4. Failures escalate by risk

Failure handling is deterministic from app-owned classification rules:

- **Low risk:** a bounded, non-consequential step failure stops that branch or applies its declared retry.
- **Medium risk:** the workflow stops and requests review when the result could invalidate dependent work.
- **High risk:** suspicious behavior, protected-area contact, evidence of policy bypass, cross-scope access,
  secret exposure, or unsafe tool behavior pauses the whole run before further action.
- **Critical/systemic risk:** the run pauses and the existing #420 dynamic-workflows or broader kill switch may
  be engaged through its authorized control path; this capability does not engage switches on its own.

The most restrictive applicable classification wins. A planner or subagent cannot downgrade it.

### 5. Audit records reconstruct planning and execution

#419 audit records cover plan creation, deterministic validation, policy decisions, step start/result, retries,
delegation, budget consumption, failure classification, pause, cancellation, and authorized resume. Records
reference safe evidence and redacted summaries rather than hidden reasoning or unsafe raw content.

### 6. Runtime and state ownership remain external

#425 owns session/workflow durability and the workflow host. App-owned governance owns policy, budgets,
approvals, audit metadata, and configuration. #424 owns retention and redacted replay for persisted workflow
audit artifacts. #426 owns verified user/tenant scope. This design defines how those owners compose; it does
not introduce a new database or runtime service.

## State Flow

1. A verified initiator requests work within an established run scope.
2. The planner proposes a typed workflow using registered specialists and declared constraints.
3. Deterministic validation rejects malformed or out-of-scope plans.
4. The consult gate evaluates the plan against current governance and budget state.
5. The #425 host checks release/kill state around every step, retry, delegation, and resume and checks full
   action policy before consequential effects.
6. Outputs enter #433 shared context with provenance; failures follow risk escalation.
7. Completion, pause, cancellation, or resume is audited.

## Alternatives Rejected

- **Execute arbitrary generated code:** too broad and bypasses typed tool and governance boundaries.
- **Authorize the workflow once at start:** stale authorization could survive policy, budget, or risk changes.
- **Let the model classify its own failures:** risk classification must remain app-owned and deterministic.
- **Create a separate Eve workflow database here:** duplicates #425 runtime and existing governance ownership.

## Risks and Mitigations

- **Plan complexity hides unsafe work:** deterministic graph validation and per-step consult gates.
- **Nested delegation exceeds caps:** count/depth accounting includes all descendants.
- **Retries burn budget:** retries are bounded and consume #423 budget/rate-limit state.
- **Failure loops:** terminal failure states and audited retry ceilings.
- **Generated scope drift:** immutable authorized scope plus revalidation before execution.

## Rollout

This PR defines only the contract. Later implementation must remain behind #418's disabled release switch and
#420 dynamic-workflow control until focused tests and #437 launch verification pass.
