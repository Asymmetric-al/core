# Change: Add Eve Dynamic Workflow Orchestration

## Why

Eve's governance, runtime, subagent catalog, shared run context, budgets, and kill-switch contracts are
specified in earlier slices, but Eve still lacks a contract for constructing a workflow dynamically when a
fixed sequence cannot coordinate the work. Issue #434 is the HITL slice that defines that orchestration
surface without granting any new action authority.

The workflow planner must be flexible enough to select and sequence real specialists while remaining a
consumer of app-owned governance. A generated plan is coordination data, not permission. Risky failures,
suspicious behavior, protected-area contact, exhausted budgets, and kill-switch state must interrupt that
coordination predictably and audibly.

## What Changes

- Define an Eve-specific dynamic workflow plan and validation contract.
- Require every generated step, dependency, input, output, retry, and delegation to remain inside the
  already-authorized run scope and #433 workflow-specific subagent caps.
- Require #418 release/emergency and #420 relevant kill-switch checks before every step, retry, delegation, and
  resume, plus full action-policy evaluation before each consequential effect.
- Classify workflow failures by risk and define local stop, run pause, and dynamic-workflow disable paths.
- Require suspicious or protected-area behavior to pause before action and emit #419 audit evidence.
- Require budgets, rate limits, kill switches, emergency-off state, and verified identity ownership to remain
  authoritative throughout the run.
- Keep this package spec-only: it creates no runtime, workflow host, schema, tool, or production authority.

## Impact

- **Affected capability:** `eve-dynamic-workflow-orchestration` (new)
- **Dependencies:** #417, #418, #419, #420, #421, #423, #425, #426, and #433
- **Issue covered:** #434
- **User stories covered:** 47, 48, 49, 53, and 54
- **Runtime impact:** none in this PR

## Non-Goals

- Replacing the #425 workflow host or defining its vendor/implementation.
- Modifying or replacing canonical `openspec/specs/workflow-orchestration/spec.md`, which owns product/Inngest
  durable background execution rather than Eve-generated specialist coordination.
- Creating a second release switch, kill switch, approval engine, budget ledger, audit store, or identity model.
- Widening GitHub, production-write, protected-area, or deployment authority.
- Implementing scheduled monitors, notifications, or launch activation.
- Treating a generated workflow or model decision as authorization.

## Evidence

- The PRD requires broad dynamic workflows and risk-based failure escalation while preserving workflow caps,
  budgets, kill switches, and protected-area safety.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
- The implementation plan assigns those outcomes to issue #434 and requires suspicious or protected-area
  behavior to pause and record audit.
  [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
- The subagent/shared-context package assigns dynamic generation and workflow-failure escalation to #434.
  [VERIFIED-REPO: openspec/changes/add-eve-subagent-catalog-shared-run-context/design.md]
