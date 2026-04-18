## Context

The active change started as a refinement of `platform-product-intent`, but it
grew into a broader cleanup of the four root platform specs:

- `platform-product-intent`
- `platform-surfaces`
- `platform-principles`
- `platform-boundaries`

The first pass made each spec individually stronger, but there was still
meaningful overlap between them. The biggest risks were:

- product truths appearing in both intent and principles
- surface-purpose language drifting into boundaries
- structural CRM/CMS ownership appearing in both intent and boundaries
- cross-surface coherence being defined in too many places
- future archive behavior merging duplicated guidance into the root specs

This design clarifies the ownership model for the four root specs so future
agents can read them together without having to guess which one wins when the
same topic appears more than once.

## Goals / Non-Goals

**Goals:**

- Make each root platform spec own a distinct layer of meaning.
- Reduce repetition before archive so the merged root specs stay readable.
- Keep overlap only where it helps a reader move from one layer to the next.
- Make the split legible to future AI coding agents working in a brownfield
  monorepo.
- Preserve the strongest product truths while moving misfiled wording to the
  correct sibling spec.

**Non-Goals:**

- Redesign the product model itself.
- Add feature-level specs or implementation detail.
- Turn root specs into an architecture manual or UI inventory.
- Replace architecture docs, AGENTS rules, or feature-specific specs.

## Decisions

### Decision: Each root spec owns a single primary question

The final ownership model is:

- **`platform-product-intent` owns:** why the platform exists, what it is trying
  to unify, what outcomes matter over time, what success means, and what does
  not belong in the core repo.
- **`platform-surfaces` owns:** what each major surface is for, what belongs
  there, what should not dominate that surface, how the surfaces connect from a
  user-experience perspective, and how the whole product should feel across
  them.
- **`platform-principles` owns:** when-in-doubt judgment, tradeoff order,
  product-level decision criteria, and the definition of “not done” when a
  feature works technically but harms trust, clarity, or cohesion.
- **`platform-boundaries` owns:** structural and trust boundaries that must not
  be crossed, including truth ownership, server-side sensitive-operation
  boundaries, role/tenant scope, publishing boundaries, and doc-alignment
  discipline when those boundaries change.

**Why this decision:** it maps cleanly to the four questions a future agent will
ask before making a change:

1. Why does this platform exist?
2. What is each surface for?
3. How should I decide when there is tension?
4. What boundaries must I not cross?

**Alternative considered:** keep more overlap so each spec is self-contained.  
**Why rejected:** that approach makes individual specs easier to read in
isolation, but it creates archive drift and conflicting guidance when multiple
specs restate the same rule with different emphasis.

### Decision: Accept only “bridging overlap,” not duplicate ownership

Some overlap is still acceptable, but only when one spec points into the next
layer:

- `platform-product-intent` may name the four major areas at a high level, but
  it does not define each surface’s detailed purpose.
- `platform-surfaces` may mention that records are shared across surfaces, but
  it should not redefine CRM/CMS trust ownership beyond the minimum needed to
  explain user-visible continuity.
- `platform-principles` may refer to donor trust, admin depth, or coherence, but
  it should not restate the full surface contract or structural rulebook.
- `platform-boundaries` may mention Mission Control first or narrow-surface
  limits, but only as hard structural boundaries, not as a general product-UX
  essay.

**Why this decision:** future agents often read only one or two specs. A small
amount of bridging overlap keeps the chain understandable, while avoiding
word-for-word repetition that causes ambiguity.

### Decision: Move CRM/CMS “truth ownership” out of product intent and into boundaries

The first refinement draft placed CRM/CMS source-of-truth wording in
`platform-product-intent`. That made the spec stronger, but it mixed the
platform’s durable why with structural ownership rules.

The final split keeps:

- **product-intent:** the platform unifies operational and public ministry work
  as part of one all-in-one system.
- **boundaries:** CRM owns operational truth; CMS owns public truth; alignment
  between them is a core platform contract.

**Why this decision:** truth ownership is a boundary rule, not a “why” rule.
Agents should find it in the structural layer, where it can be enforced and kept
aligned with other trust boundaries.

### Decision: Keep cross-surface coherence in two layers with different jobs

Cross-surface coherence appears in:

- **`platform-surfaces`** as an experience goal: one connected platform, clear
  handoffs, no broken feeling between public, donor, missionary, and staff
  experiences.
- **`platform-principles`** as a decision rule: do not create inconsistent
  vocabulary, behavior, or locally clever one-offs.

It does **not** need to be repeatedly defined in `platform-product-intent` or
`platform-boundaries` beyond brief references.

**Why this decision:** coherence has both an experience dimension and a judgment
dimension. Those are different jobs, and keeping them split avoids one spec
doing too much.

### Decision: Use `platform-boundaries` for hard constraints, not implementation specifics

The original merged boundary spec leaned heavily on package paths, runtime
details, and tool-specific patterns. The revised delta removes most of that from
the durable root boundary layer and keeps the focus on:

- surface split as a product-facing boundary
- convergence of shared logic
- CRM/CMS ownership
- server-side control for sensitive operations
- tenant and role scope
- honest money-state propagation
- publication and moderation boundaries
- separation between public and authenticated behavior
- documentation alignment when durable boundaries change

**Why this decision:** root boundary specs should survive file moves, framework
changes, or internal refactors.

## Risks / Trade-offs

- **[Risk] A future agent reads only one spec and misses a sibling rule**  
  → **Mitigation:** keep light bridging overlap and add scenarios for common
  misreads rather than duplicating full rules.

- **[Risk] Over-cleaning removes helpful context**  
  → **Mitigation:** remove only duplicated ownership, not clarifying examples or
  decision-relevant scenarios.

- **[Risk] Archive merges older wording and new wording into awkward combined root specs**  
  → **Mitigation:** keep MODIFIED vs ADDED usage deliberate, remove obsolete
  requirement names cleanly, and validate before archive.

- **[Risk] Product truths about donation trust or admin foundation become weaker after moving text**  
  → **Mitigation:** keep those truths visible in intent and principles, while
  moving only the structural mechanics into boundaries.

## Migration Plan

1. Keep all refinements inside `openspec/changes/refine-platform-product-intent-5fde/`.
2. Validate the change strictly before any archive step.
3. Review the four deltas together using the ownership model above.
4. Archive or fold forward only after the team is satisfied that each root spec
   owns one layer cleanly.
5. After archive, review the merged `openspec/specs/platform-*.md` files to
   confirm the archive result preserved the intended split.

Rollback is simple before archive: edit or remove the delta files in the active
change. After archive, rollback would require a follow-up change rather than
silent edits to the merged specs.

## Open Questions

- Should the root specs eventually gain a short shared “read order” note so
  future agents know to read intent → surfaces → principles → boundaries?
- After archive, do any architecture docs need a small cleanup pass so their
  framing lines match the refined ownership split more closely?
