## Context

See the proposal for scope. The previous audit found working 1.9.0 gates,
a refresh metadata regression, ownership text lost by the pinned merger, and
accepted implementations missing durable contracts. Current stable validation
adds readability and unapplied-content checks.

## Goals / Non-Goals

The goal is current, reproducible tooling with the same domain meaning and
truthful lifecycle state. Product runtime, provider qualification, new owner
decisions, and the canonical checkout's unrelated edits are outside this change.

## Decisions

### Upgrade one reviewed cohort

Pin the CLI and seven selected upstream skills to the same stable tag and
record its reviewed commit. Retain Core overlays, Bun permissions, selected
workflow boundaries, and provenance. Use the established refresh and sync
paths; do not regenerate customized instructions with openspec update.

### Prove preservation at public boundaries

Add regression tests around the actual refresh CLI and the delta verifier.
Test the merger output, including warnings and source-routing Purpose text.
Verification remains non-mutating. Strict validation remains enabled.

### Preserve domain authority during presentation changes

Keep original requirement identities, every normative clause, scenarios and
acceptance identifiers. Separate source evidence from behavior descriptions
where appropriate. Reuse declared canonical authoring sources for generated
views. Before adapting a larger requirement, establish a trace showing where
its complete binding text and scenarios remain; do not invent generic
scenarios, silently weaken clauses, or infer unresolved owner decisions.

Keep a concise concrete description and unconditionally incorporate the entire
original body from a content-addressed normative companion section. These Core
repository-root references survive sync and archive depth changes. The original
scenarios stay attached to the requirement; no narrow scenario conditions the
full contract. Separate accepted and proposed bodies have separate digests.
Source-owned generators derive companion sections from their canonical records,
and check mode is read-only. The delta gate verifies content, identity, scope,
and unconditional incorporation before and after the pinned merger. Historical
sections impose no present behavior without a current reference.

### Reconcile changes individually

For each completed candidate, record the source implementation, merge ancestry,
later amendments, synchronization state and remaining acceptance gates.
Archive only independently eligible accepted work. Pending plans, unverified
provider cleanup, and this unmerged maintenance change remain active.

### Isolate work and verification

Use the dedicated WSL worktree and an ignored link to the existing environment.
No credentials are copied or printed. Preserve the main checkout's files and
processes. Use focused red/green tests, then canonical generation, OpenSpec,
archive, skill, workspace and repository readiness gates.

## Risks / Trade-offs

- Contract meaning can change during readability edits: retain exact text,
  identifiers and scenario coverage, and independently review the trace.
- Archive order can collide with later amendments: reconcile one candidate
  at a time and rerun current delta compatibility after each accepted merge.
- Private merger helpers can change upstream: run actual dependency tests.
- CI and external reviews can move after publication: compare exact remote
  head and base, reconcile complete review threads, and report approval truth.

## Migration Plan

Repair and prove preservation seams before the upgrade. Import the reviewed
cohort, adapt current representations through their owners, and reconcile
eligible completed work. Regenerate mirrors, run the applicable full gates,
publish the PR, and finish current-head CI and review reconciliation.
Rollback reverts the reviewed packet and lockfile.
