# Eve dynamic workflow operations

Dynamic specialist orchestration is installed but remains provider-inert while
Eve's master release switch is off.

## Runtime boundary

The root agent exposes two separate tools:

- `workflow_guard` validates and prepares, inspects, cancels, or resumes one
  versioned plan; and
- `Workflow` runs QuickJS coordination code that can call only the declared Eve
  subagents.

Never invoke Workflow without the ticket returned by
`workflow_guard.prepare`. The plan must use repository `Asymmetric-al/core`,
the verified root session, one supported `delegate_specialist` operation per
step, registered specialists eligible for the workflow type, in-scope paths,
an acyclic dependency graph, explicit output fields, and bounded attempts.
The global framework cap is seven; lower workflow-specific catalog caps win.
Use each exact `authorizedCalls[].input` returned by the guard. The action hook
rejects altered messages, undeclared specialists, and calls made before their
dependencies complete.

Workflow code has no filesystem, shell, network, environment, import, or host
process access. Children do not receive Workflow and declare no subagents.

## Policy and persistence

Apply `20260718074651_eve_dynamic_workflow_policy.sql`. It adds the
`dynamic_workflows` action-policy domain, the
`engineering.dynamic_workflow.execute` action, an orchestration budget, and
the service-only `consult_eve_runtime_budget_policy` RPC.

The RPC derives identity and initiator fields from `eve_session_ownership`,
derives trust zone/domain/cost from the app catalog, checks the current release
and relevant switches, locks the budget usage window, consumes an allowed call,
and writes the policy decision plus redacted audit in one transaction. It
accepts no caller-selected identity mode, domain, cost, or approval policy.

Eve `defineState` stores the short-lived plan ticket and step states in the
root durable session. Supabase does not duplicate that runtime state. Supabase
continues to own governance, budgets, shared-context conflicts, identity
bindings, and audit evidence.

## Pause and resume

Low-risk step errors may retry only when the plan declares another attempt and
the current policy budget allows it. A dependency-invalidating or exhausted
budget condition pauses the workflow. Scope, protected-area, governance, or
suspicious-tool signals pause the run. Secret exposure, cross-tenant or
identity failure, and policy bypass are critical and request human review of
the existing kill-switch controls; the workflow cannot actuate them.

Resume only with `workflow_guard.resume`. It always requires explicit human
approval and revalidates the current governance, shared context, policy budget,
plan digest, and original governance version. If policy changed, cancel and
prepare a new plan.

## Verification

Before any launch:

1. run the focused dynamic workflow, approval-budget, runtime, and migration
   tests;
2. apply the migration to a disposable local Supabase database and prove a
   session-bound service consultation writes one allowed decision and audit;
3. run `bun run --filter @asym/eve-runtime info`, `build`, and `eval`;
4. run strict OpenSpec validation and `bun run ci:preflight`;
5. confirm anon/authenticated cannot call the runtime RPC or read the tables;
6. confirm `release_enabled` remains false and no deployment was performed.

## Emergency stop and rollback

`emergency_off`, `all_automation`, `active_runs`, and `dynamic_workflows` stop
new model or delegation boundaries. Budget and shared-context blocks also fail
closed. Cancel the affected root session workflow, preserve all policy and
audit records, retire the active model policy if necessary, and keep release
off. Removing the Workflow tool rolls back orchestration without deleting
session ownership, budget usage, decisions, or audit evidence.
