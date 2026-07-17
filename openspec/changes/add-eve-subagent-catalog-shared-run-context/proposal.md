# Proposal: Eve Subagent Catalog and Shared Run Context

## Summary

Define the first real Eve specialist catalog and the structured shared run context that lets those specialists
collaborate without losing provenance, risk, evidence, or disagreements. This change is the OpenSpec contract
for GitHub issue #433 and implementation-plan slice 17.

## Why

The Eve platform is intended to delegate deeply across code review, CI, security, testing, OpenSpec, data
boundaries, dependencies, documentation, product strategy, UX, migrations, releases, and memory curation.
Those responsibilities need to be real Eve subagents with explicit instructions, tools, models, budgets, evals,
and routing—not an undifferentiated collection of prompts. [VERIFIED-REPO:
docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:216]

Delegation also needs a safe collaboration surface. The PRD permits any subagent to contribute to shared run
context, but every write must be schema-validated and carry provenance, confidence, risk, source evidence, and
conflict handling. Conflicting claims must remain visible as disagreements rather than being silently
overwritten. [VERIFIED-REPO:
docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:237]

The implementation plan makes this slice dependent on the shared model policy (#421), approval and budget
policy (#423), and standalone runtime (#425). It must compose those capabilities without redefining them.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:260]

## What Changes

- Add the `eve-subagent-catalog-shared-run-context` capability contract.
- Require the initial specialist set to be implemented as real Eve subagents with dedicated instructions,
  allowed tools, model role, reasoning setting, fallback eligibility, budget, eval gate, and routing policy.
- Permit broad root-to-specialist and specialist-to-specialist delegation while enforcing workflow-specific
  subagent caps in v1.
- Define shared run context as structured collaboration data for safe PR metadata, issue scope, decisions,
  eval state, findings, and explicitly safe page context.
- Require every shared-context write to pass schema validation and include writer identity, provenance,
  confidence, risk, source evidence, and timestamps.
- Preserve contradictory values as explicit disagreements until a governed resolution is recorded.
- Keep model selection under #421, spend and approval under #423, audit under #419, runtime execution under
  #425, and release/emergency state under #418/#420.

## What Does Not Change

- This change adds no live Eve subagents, runtime modules, shared-context store, Supabase schema, tools, model
  routes, or eval implementation.
- It does not authorize subagents to exceed the root agent's authority, bypass approvals, touch protected areas,
  or perform business-data writes.
- It does not define dynamic workflow generation or failure escalation; those belong to #434.
- It does not make shared run context a source of truth. OpenSpec, repo instructions, verified runtime state,
  and authoritative external systems remain higher authority.
- It does not enable tenant operational memory or allow sensitive donor, payment, credential, secret, or raw
  production data into shared run context.

## Expected Outcome

A validated, human-reviewable OpenSpec package that makes the specialist catalog, delegation bounds, shared
context schema, provenance requirements, and conflict-preservation behavior explicit before implementation.
The implementation remains disabled behind the Eve release switch until the final #437 launch gate passes.

## Traceability

- Parent PRD: `docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md`
- Implementation plan: `docs/prds/eve-autonomous-operations/02-implementation-plan.md`
- Parent issue: #416
- Owning issue: #433
- Blockers: #421, #423, #425
- Downstream consumer: #434
