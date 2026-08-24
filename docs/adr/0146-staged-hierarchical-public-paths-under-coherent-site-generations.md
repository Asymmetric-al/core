# ADR-0146: Staged hierarchical public paths under coherent Public Site Generations

**Status:** Accepted (founder-ratified Phase 23 D2 C-prime-R, 2026-08-15)

## Context

Phase 23 needs its Page tree to mean something predictable without allowing a
single parent move to mutate public routes immediately. Page hierarchy,
canonical paths, breadcrumbs, navigation, redirects, specialized Phase 22
routes, and downstream caches are related but do not share one source owner.
Payload hierarchy plugins can help persist candidate structure, but recursively
updating descendants is not a coherent multi-tenant public release contract.

## Decision

Phase 23 adopts one locale-exact staged hierarchical Public Path model for
ordinary Phase-23-owned Pages. For one Tenant × environment × Site × BCP-47
locale, an immutable Page Placement Revision owns one stable parent-Page
reference, one bounded local web-address segment, sibling order, and its
deterministically derived canonical normalized path. Page identity is stable;
the complete full path is not separately editable; sibling reordering changes
no URL; and internal Content Library folders are not public path ancestors.

A parent or web-address change remains a candidate with no public effect until
the complete affected descendant closure passes actor, scope, expected-base,
parent, cycle, root, depth, length, normalized-uniqueness, reserved-route,
source-owned-route, reference, renderer, and current Phase 10/22 admission
proof. Candidate preparation may be chunked and resumable while the prior
generation serves. One finished compatible successor activates only through
D1's idempotent compare-and-swap of the sole Public Site Generation serving
head. There is no second Site Plan release authority.

Web Studio exposes one Page tree and one accessible **Move Page** interaction.
Optional drag-and-drop has equivalent parent-selection and ordering controls.
URL-neutral reorder stays quiet; path-changing work shows the current and
after-publish addresses, exact affected count, old-to-new route delta,
continuity status, and cause-owned blockers. Only genuinely large moves expand
into a resumable searchable impact review; unchanged descendants require no
manual approval.

The released hierarchy owns ordinary canonical paths and breadcrumbs.
Navigation remains independently versioned and is never rearranged or
source-mutated by a tree move. D2 produces the exact immutable route delta and
dependency impact but does not decide redirect type, target, retention, chain
policy, tombstone, menu publication, locale enablement or fallback,
search/sitemap/cache completion, or current safety truth. A path-changing
activation consumes an already-valid disposition from the applicable route
owner rather than inventing one.

Phase 5 remains the sole public resolver; Phase 10 adverse containment always
outranks ordinary release; Phase 22 Public Ministry Page routes remain
source-owned and read-only to the generic tree; Phase 24 owns Site, locale,
domain, and fallback truth; Phase 29 owns media and file identity; and Phase 30
owns migration transport while Phase 23 owns target Page/path validation and
activation.

## Consequences

- Staff receive one understandable Page movement experience rather than route,
  release, and dependency machinery.
- A large structural change may take time to prepare but becomes public all at
  once, or not at all.
- Same-scope route uniqueness, hierarchy integrity, and activation races require
  structural proof rather than provider hooks or read-before-write checks.
- Redirect governance, navigation publication, locale policy, and downstream
  convergence remain explicit follow-on decisions instead of hidden D2 side
  effects.
- Recovery activates a newly validated successor; it never destructively
  rewinds history or restores an obsolete or unsafe route.

## Rejected alternatives

- flat independently editable full paths that can disagree with the Page tree;
- immediate live hierarchical mutation;
- provider nested-document state as public authority;
- a second Site Plan serving head;
- recursive live descendant rewrites;
- tree movement that also rearranges navigation;
- application-only uniqueness or newest-row collision selection; and
- unsafe generic redirects, implicit locale fallback, or destructive rollback.
