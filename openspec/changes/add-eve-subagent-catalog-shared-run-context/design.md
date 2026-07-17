# Design: Eve Subagent Catalog and Shared Run Context

## Status

Proposed for human review. This design records the slice-17 decisions for issue #433 and introduces no live
runtime behavior.

## Context

Eve needs specialists that are independently configurable and evaluable, while still collaborating on one
governed run. A loose prompt collection would make tool access, model selection, budget ownership, evaluation,
and accountability difficult to inspect. An unstructured shared scratchpad would allow low-confidence or
conflicting claims to overwrite each other and could become an accidental sensitive-data channel.

The existing Eve changes already assign model roles and fallback policy to #421, budgets and approvals to #423,
audit shape to #419, the runtime and session durability to #425, and system/kill-switch state to #418/#420.
This design composes those owners rather than duplicating them.

## Decisions

### Real subagents, not labels

The initial catalog consists of real Eve subagents for:

- code review;
- CI triage;
- security review;
- test planning;
- OpenSpec guarding;
- data-boundary review;
- dependency review;
- documentation synchronization;
- product strategy;
- UX review;
- migration planning;
- release coordination; and
- memory curation.

Each specialist has its own instructions, allowed tool surface, model-policy role, reasoning setting, fallback
eligibility, budget, eval gate, and routing description. Future specialists may be added through the same
spec-first and eval-gated path. [VERIFIED-REPO:
docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:220]

### Broad delegation with explicit caps

The root agent may delegate whenever a specialist is useful, and a specialist may delegate when its declared
surface permits it. Every workflow type has a configured maximum subagent count/depth in v1. Exceeding the cap
is a policy event that stops additional delegation rather than an invitation to silently raise the limit.
Adaptive caps remain future work. [VERIFIED-REPO:
docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:230]

### Structured shared run context

Shared run context is a typed, run-scoped collaboration surface. It may contain safe PR metadata, issue scope,
decisions, eval status, findings, and explicitly safe page context. It is not long-term memory, a raw transcript,
a secret store, or an authoritative replacement for OpenSpec, GitHub, CI, or product databases.

Every write includes:

- schema version and field path;
- writer subagent and accountable run identity;
- provenance/source kind;
- confidence;
- risk classification;
- source evidence references;
- creation/update timestamps; and
- relationship to any earlier value or disagreement.

The store rejects malformed writes and forbidden sensitive content before persistence. Governance metadata is
app-owned; Eve session and workflow durability remain owned by the #425 runtime and its workflow host.

### Conflicts are data, not last-write-wins

When two valid writes disagree, both remain visible under a conflict record. A later resolution identifies the
resolver, evidence, policy, and selected outcome without deleting the competing claims. Unresolved high-risk or
protected-area conflicts block dependent action and require the applicable human/policy path.

### Authority remains external to the subagent graph

No subagent gains authority from delegation or from writing shared context. Model and tool output are untrusted
inputs to policy. Every action still consults release/emergency state, kill switches, approvals, budgets,
protected-area rules, and verified identity before execution.

## Ownership Boundaries

- #417 owns the autonomy, protected-area, and source-of-truth contract.
- #418/#420 own release, emergency, and kill-switch state.
- #419 owns the audit-record shape.
- #421 owns model roles, fallbacks, and eval/judge model policy.
- #423 owns approvals, hard budgets, and rate limits.
- #425 owns Eve runtime sessions and workflow durability.
- #426 owns verified current-admin/service identity and user/tenant session ownership.
- #422 owns long-term private-admin memory; shared run context must not become memory.
- #424 owns retention and replay policy for persisted governance/audit metadata.
- #433 owns the specialist catalog, delegation caps, shared-context write contract, and disagreement model.
- #434 owns dynamic workflow generation and risk-based workflow failure escalation.

## Verification Contract

Implementation tests must prove specialist discovery/routing, model-role resolution, budget enforcement, eval
gates, delegation caps, valid and invalid shared-context writes, provenance, confidence/risk requirements,
sensitive-data rejection, disagreement preservation, and resolution auditability. [VERIFIED-REPO:
docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:563]

This spec package must pass strict OpenSpec validation and repository formatting checks before review.

## Alternatives Considered

### Represent specialists as prompt labels

Rejected because labels do not provide independently inspectable tools, model policy, budgets, evals, or routing.

### Use a free-form shared scratchpad

Rejected because provenance, confidence, risk, evidence, and conflicts would be unverifiable.

### Last-write-wins conflict handling

Rejected because it hides disagreement and can let a lower-confidence conclusion silently replace safer evidence.

## Out of Scope

- Runtime or Supabase implementation.
- Dynamic workflow generation.
- Tenant operational memory.
- New product features or new autonomous authority.
- Activation of any Eve surface.
