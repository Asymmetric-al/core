# ADR-0034: Use declared Eve specialists and append-only shared run context

**Status:** Accepted

**Date:** 2026-07-18

**Issue:** #433

**Builds on:** ADR-0018, ADR-0019, ADR-0020, ADR-0021, ADR-0022, ADR-0024,
ADR-0025, ADR-0026, and ADR-0027

## Context

Eve needs specialists that are independently inspectable, configurable, and
evaluable. Prompt labels would not create isolated tool or instruction
boundaries. Specialists also need to exchange findings during one durable run,
but a free-form scratchpad would let unsupported or sensitive claims overwrite
better evidence and could become an accidental secret or PII channel.

## Decision

Core declares thirteen real Eve subagents under
`packages/eve-runtime/agent/subagents/`: code review, CI triage, security
review, test planning, OpenSpec guarding, data-boundary review, dependency
review, documentation synchronization, product strategy, UX review, migration
planning, release coordination, and memory curation.

The app-owned catalog gives each specialist dedicated instructions, routing
metadata, a named `specialist.*` model role, reasoning setting, fallback
eligibility, token/request/cost budget, eval gate, workflow eligibility, and an
explicit tool surface. The children have read/search and `shared_context`
access; mutating shell, file-write, and network defaults are disabled. They
declare no nested children, which enforces v1 depth one. Workflow-specific
count caps are app-owned inputs to the dynamic orchestrator in #434.

Each subagent compiles with an offline verification model. At session start,
production selection can occur only through the active, eval-passed #421 model
policy after verified #426 ownership, #418/#420 governance, and the dedicated
`engineering.subagent.delegate` #423 budget all pass. Resolver failure or an
inactive release switch leaves the offline fallback in place and makes no
provider call.

Shared run context is append-only Supabase governance metadata rooted at Eve's
durable root session. It accepts only safe PR metadata, issue scope, decisions,
eval status, findings, and explicitly safe page context. Each claim records its
schema version, tenant, root and child session, accountable run, fixed writer,
field, value, provenance, confidence, risk, evidence, relationship, related
claims, and timestamp. Tenant and writer scope are derived server-side, never
from tool input.

Malformed or sensitive values are rejected before persistence and audited
without copying the rejected value. Contradictory claims produce an explicit
conflict containing every claim. Resolution is a separate immutable record
with resolver, policy, selected claims, evidence, outcome, and timestamp; the
original claims are never updated or deleted. An unresolved high-risk or
protected conflict blocks dependent autonomous action.

Eve continues to own session and workflow durability. Shared context is not
long-term memory and never outranks OpenSpec, repo instructions, GitHub/CI
reality, or product databases. The master release switch remains off.

## Consequences

- Specialist identity, model policy, budgets, evals, and tools are reviewable
  as code rather than implicit prompt behavior.
- Delegation cannot add mutation authority, recursively fan out, or select a
  tenant, user, provider, or budget from model input.
- Safe findings can be reused across specialists without hiding provenance or
  disagreement.
- Conflict preservation and append-only resolution cost more storage than
  last-write-wins, but retain the evidence required for accountable action.
- #434 can build dynamic orchestration on stable catalog and cap contracts
  without redefining specialist or shared-context policy.

## Operations

Setup, inspection, verification, conflict handling, and emergency controls are
documented in `docs/guides/operations/eve-subagents-shared-context.md`.
