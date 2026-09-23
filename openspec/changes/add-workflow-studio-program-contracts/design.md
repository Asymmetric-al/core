## Context

The canonical [Workflow Studio package](../../../docs/prds/workflow-studio/README.md) reconciles the source proposal with the September 22 phase allocation and existing accepted owners. See the proposal for intent. Source code contains shared dispatch/claims, narrow contribution rules and a Support matcher; these are an inventory starting point, not a complete Studio.

## Goals / Non-Goals

Use one typed declarative language and coordinated source operations across independent delivery checkpoints. Preserve existing native business processes, source evidence and current authority. Do not introduce tenant scripts, a second PDP, application business tables inside coordination state, direct provider actions or a second CMS.

## Decisions

The complete architecture and alternatives are in chapters 00–06 and 08 of the canonical package. A normalized versioned AST owns meaning; guided UI, React Flow and outline are views. Pure compilation/evaluation produces bounded plans; short source-version/CAS transactions persist work before provider I/O. Postgres source records, product claims, semantic effect identities, shared outbox and bounded Inngest executions retain distinct authority. Provider trace retention never defines engagement lifetime.

The effect owner deduplicates across native and optional workflow callers. A lease expiring after possible dispatch is uncertainty, not retry permission. Register/recheck/consume/reconcile makes completion-before-wait recoverable. Forms and participants use exact source acceptance and purpose-bound admission; application meaning belongs to Phase 41.

Reuse `packages/api` business boundaries, pure shared compiler contracts, approved `packages/database` hooks and exact shared `packages/ui` design. Admin composes the Studio; existing app surfaces expose scoped participant views. Candidate routes/schema/capability names require qualification against current manifests and source owners. The existing `/automations` link remains compatible during a documented route migration. Eve remains a separate governed agent capability.

## Risks / Trade-offs

- Whole-program backlog cycles → 39 explicit work slices retain all 26 source identifiers; CORE excludes future pack dependencies and uses real non-mobilization tracers.
- Authority outlives a publisher → Phase 12 NHI plus live human-owner intersection and immediate revocation fencing; preserve separately authorized native source lifetimes.
- Symbolic fixtures mistaken for runtime → inert blueprints and 105 explicitly unqualified binding entries; source-specific capability gates remain open.
- Overlapping rule engines → effects-disabled shadow comparison, retained-data migration and one atomic execution-owner selection; never run old/new effects concurrently.
- Native owner changes overwritten → source-boundary chapter and effective integration guide; no Website-specific policy/capability inheritance by generic tasks.

## Migration Plan

Before future runtime work, inventory current source/migrations and exact rule definitions, users, effects, grants and task links. Add compatible records/readers and migrate through reviewed, effects-disabled shadow evaluation. Preserve source semantic identities, deep links, immutable decisions, active versions and replay evidence. Qualify each checkpoint independently and activate narrowly by tenant/source readiness. Optional enrollment can be disabled without deleting accepted work or source history. Restores begin outward-disabled and reconcile effects, revocations and tombstones before reopening.

## Validation

The independent package verifier proves counts, IDs, source coverage, inert fixture constraints, binding references and acyclic checkpoint dependencies; its generated-view check detects drift. Strict OpenSpec validation is additional. Product completion requires all scoped future TDD, real Postgres race, source-adapter, security/privacy, browser/accessibility, provider/load/recovery and representative pilot evidence in the implementation queue. No such product test is claimed by documentation validation.

## Open Qualifications

[WS-Q01–WS-Q12](../../../docs/prds/workflow-studio/12-owner-bindings-and-decisions.md) identify exact participant admission, source commands, storage reuse, provider/deployment, retention, workload and wider-join gates. The roadmap already fixes their required boundaries; implementation must record the owner-approved binding and evidence before enabling the affected capability. Missing evidence cannot become a guessed product decision.
