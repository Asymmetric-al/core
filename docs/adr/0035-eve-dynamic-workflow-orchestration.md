# ADR-0035: Gate Eve dynamic workflows with typed plans and continuous policy

**Status:** Accepted

**Date:** 2026-07-18

**Issue:** #434

**Builds on:** ADR-0019, ADR-0020, ADR-0021, ADR-0022, ADR-0024, ADR-0025,
ADR-0026, ADR-0027, and ADR-0034

## Context

Eve 0.25.1 can expose a root-only `Workflow` tool that executes model-authored
JavaScript in QuickJS and can call only declared subagents. That is a useful
coordination primitive, but framework isolation alone does not bind a program
to an approved scope, specialist graph, retry envelope, current governance,
tenant identity, or application budget.

## Decision

Core enables the framework Workflow primitive with a global seven-child cap,
but requires an app-owned workflow ticket before using it. A ticket contains a
strict versioned plan: verified root session, fixed repository and target
paths, workflow type, specialist DAG, output contracts, per-step attempts and
failure policy, total call/retry caps, and the governance policy snapshot.
Deterministic validation rejects unknown fields and operations, cycles, missing
edges, ineligible specialists, scope escape, sensitive paths, and cap excess.
The plan receives a canonical SHA-256 digest.

`workflow_guard.prepare` is available only for verified Core GitHub sessions.
Protected paths and high-risk declarations require human approval. The guard
claims #426 session ownership, reads current #418/#420 governance and #433
conflicts, atomically consumes the #423 dynamic-workflow budget, verifies the
plan's governance version, and then stores a short-lived ticket in Eve
`defineState`. `workflow_guard.resume` always requires human approval and
accepts only the same plan digest and governance version.

Every specialist dispatch is checked again by a root hook. The hook reloads
governance and unresolved high/protected conflicts, verifies the session-bound
service identity, consumes the delegation budget, and atomically advances the
plan state before downstream work continues. The guard returns the exact
specialist input for each step; the pre-dispatch action hook rejects altered
messages and dependency-order violations. Specialist model selection also
rechecks the dynamic-workflow switch and consumes runtime budget on session and
step boundaries. Children cannot receive Workflow or recursively delegate.

Failure classification is application-owned. Low-risk failures may use only a
declared retry or stop their branch; medium risk pauses the workflow; high and
critical signals pause the run. Secret, tenant, identity, or policy-boundary
signals are critical. Critical classification recommends kill-switch review
but never changes a switch itself. Policy decisions and specialist lifecycle
events are redacted audit records; raw prompts and outputs are omitted.

Supabase remains the authority for governance, ownership, budgets, and audit.
Eve remains the authority for durable session-local workflow state. Product
Inngest orchestration is unchanged. The master release switch remains off, so
this PR installs a runnable but provider-inert capability and performs no
production activation.

## Consequences

- Model-authored orchestration can coordinate only the declared #433
  specialists and cannot obtain file, shell, network, environment, or import
  access inside Workflow code.
- A prior allow cannot survive governance-version drift, a kill switch, budget
  exhaustion, an unresolved protected conflict, or session ownership failure.
- Service policy decisions are now first-class, session-bound audit evidence;
  callers cannot choose identity mode, trust zone, domain, or cost.
- Paused workflows deliberately require a human and unchanged policy state;
  changed conditions require a newly prepared plan instead of implicit resume.

## Operations

Setup, inspection, failure handling, verification, and rollback are documented
in `docs/guides/operations/eve-dynamic-workflows.md`.
