# Eve Agent Brief: Specialist Catalog and Shared Run Context

## Goal

Extend the existing Eve runtime with a first-party catalog of specialist agents that can collaborate on one
governed run without broadening Eve's authority. Specialists must be discoverable as real Eve subagents, use
app-owned model and budget policy, and exchange only structured, safe, run-scoped claims.

## User

The primary users are Asymmetric maintainers and verified administrators operating Eve through the existing
GitHub and admin HTTP channels. They need independently inspectable specialist behavior, bounded delegation,
and evidence-backed collaboration that survives durable Eve execution.

## Jobs to be done

- Route engineering and product-analysis work to a specialist with dedicated instructions and an explicit
  read-oriented tool surface.
- Select specialist models through the active Eve model policy, never from prompts or hardcoded providers.
- Keep every specialist inside token, request, cost, evaluation, and delegation limits.
- Let specialists share safe findings, decisions, issue scope, PR metadata, eval status, and safe page context.
- Preserve contradictory claims and block reliance on unresolved high-risk disagreements until a governed
  resolution is recorded.

## Initial specialist catalog

The first release contains code review, CI triage, security review, test planning, OpenSpec guarding,
data-boundary review, dependency review, documentation synchronization, product strategy, UX review,
migration planning, release coordination, and memory curation specialists.

## Interaction surfaces

- Existing GitHub channel for repository events and issue/PR work.
- Existing authenticated Eve HTTP channel for admin sessions.
- Declared Eve subagent tool calls from the root agent.
- A typed `shared_context` tool inside each specialist for run-scoped reads and writes.

## Tools and authority

Specialists receive repository read/search tools plus `shared_context`. Mutating shell, file-write, and network
tools are explicitly disabled. Any later mutation must still pass the existing governance, protected-area,
approval, budget, audit, release, and kill-switch controls owned by prior Eve slices. Delegation and shared
context never grant authority.

## Model and budget policy

Every specialist maps to a named role in the app-owned model policy and declares reasoning, fallback
eligibility, a required eval suite and score, session token ceilings, request/cost ceilings, and routing
metadata. The runtime's compiled fallback is an offline verification model while the release switch is off;
an active persisted policy may select the actual AI Gateway route only after governance and budget checks.

## Shared run context

Context is append-only, tenant-scoped, and rooted at Eve's durable root session. Each claim records schema
version, field path, category, writer, run/session lineage, provenance, confidence, risk, evidence references,
relationship metadata, and timestamps. Sensitive or malformed values are rejected before persistence.
Disagreements retain every claim and are resolved by a separate append-only resolution record.

## State and durability

Eve remains responsible for session, turn, subagent, and workflow durability. Supabase stores only app-owned
governance metadata for shared claims, disagreements, resolutions, policy consumption, and audit records.
This is run-scoped collaboration, not long-term memory.

## Evals and verification

Deterministic tests cover catalog completeness, routing, model roles, budgets, eval gates, delegation caps,
tool boundaries, schema validation, sensitive-data rejection, conflict preservation, resolution auditability,
and tenant/session isolation. Eve discovery and build checks prove all thirteen agents compile as declared
subagents. The production release switch remains off.

## Out of scope

- Dynamic workflow-program generation and failure escalation, owned by issue #434.
- Production activation, owned by issue #437.
- New business-data write authority.
- Long-term tenant or user memory.

## Confirmation

The accepted OpenSpec change for issue #433 and the maintainer's instruction to implement and open the full
sequential PR stack provide the implementation confirmation for this brief.
