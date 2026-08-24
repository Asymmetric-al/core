# ADR-0148: Curated Navigation Revisions under coherent Site generations

**Status:** Accepted (founder-ratified Phase 23 D4 C-prime-R, 2026-08-15)

## Context

The existing CMS Navigation collection is tenant-only, unversioned, and based
on copied URL strings, while the current public navbar and footer also retain
separate static sources. Making the Page tree generate menus would scatter
membership and ordering across Pages; making Navigation publish independently
would allow links and targets to become public incompatibly. Payload supplies
useful relationship, draft, version, and validation primitives, but neither its
provider status nor its latest document proves Asym's exact Site, locale,
source eligibility, or coherent release closure.

## Decision

> **C-prime-amended-and-hardened (C-prime-R) — Curated, provider-neutral
> Navigation Revisions with Page-aware assistance under D1:** for one exact
> Tenant × environment × Site × BCP-47 locale, every later-ratified Navigation
> purpose has one stable identity and an immutable semantic revision lineage.
> A Navigation Revision is the provider-neutral content snapshot and digest
> selected by D1—not a mandatory new table, event store, duplicate of Payload
> history, per-item lifecycle, or independently advancing public head—and its
> exact purpose catalog, item vocabulary, destination behavior, and nesting
> limit remain D5 decisions. Navigation alone owns visitor-menu membership,
> menu-local copy, purpose, grouping, and order; D2 Page hierarchy alone owns
> canonical paths and breadcrumbs; D3 owns ordinary Page route continuity; and
> each source phase alone owns whether its destination is eligible for the
> exact public context. Managed internal Page destinations use stable eligible
> references rather than copied URLs, so a Page move can reuse the same
> Navigation Revision while a successor D1 generation resolves the new path
> without silently moving or relabelling the item. The Page workspace exposes
> one scoped, derived Navigation-usage summary and authorized **Add to
> navigation** / **Edit placement** commands into the same expected-revision
> Navigation draft used by the Navigation workspace; it stores no Page-owned
> menu flag, label, parent, position, reverse-placement authority, hook-synced
> copy, or second mutation path. Saving and autosave remain private; exact
> real-renderer preview compiles the candidate; and a Navigation-only change or
> related Page-and-Navigation change becomes public through one ordinary
> Publish action, D1's complete dependency and permission proof, one immutable
> successor Public Site Generation, and one CAS-guarded serving-head advance.
> Planned Page retirement or ordinary unpublish must remove or deliberately
> replace affected Navigation references in that candidate, while current
> Phase 10/22 adverse safety truth suppresses an unsafe public item immediately
> without mutating authored or released history. The public runtime reads only
> the bounded, deterministic, pre-resolved Navigation projection pinned to the
> active generation—never Payload `latest`, raw provider documents, recursive
> request-time population, or N+1 eligibility checks. Exact scope is enforced
> structurally and re-proved through authorization, access control, and the D1
> compiler; expected-revision conflicts retain staff work; failures leave the
> prior complete generation live; recovery is a forward successor; and legacy
> CMS Navigation rows, static header configuration, hard-coded footer links,
> and other public consumers receive a complete exact disposition before one
> surface-authority cutover. Payload Drafts, Versions, relationships,
> validation, and locks may serve as qualified private authoring adapters but
> never define domain release or public truth. Staff receive one quiet ordered
> workspace, Page-aware shortcuts, clear **Live** versus **Draft changes**,
> cause-owned repair actions, responsive exact preview, named non-drag movement
> controls, preserved focus, and one consequence-first Publish action—without
> a Page-tree-generated menu, duplicate Page menu fields, copied managed
> internal URLs, dual writes or reads, provider hooks as publication, a second
> revision system, a second public head, per-item workflow/schedule/audience
> rules, tenant-defined schemas, arbitrary presentation data, unbounded graph
> composition, CRDT machinery, fuzzy migration, partial activation,
> destructive rollback, or a claim that activation proves downstream cache,
> search, sitemap, crawler, or third-party convergence.

## Consequences

- Navigation is intentionally curated and independent of Page hierarchy, but
  internal Page links use stable references and resolve through the exact D1
  generation rather than copied paths.
- Page-aware controls are projections and commands into one Navigation draft;
  no Page-owned menu fields or synchronization hooks exist.
- A semantic Navigation Revision is the immutable provider-neutral content
  snapshot D1 selects. Payload may implement private history after exact-pin
  qualification, but Asym does not duplicate that history or add a second
  public head.
- Public requests serve one bounded active-generation projection. Related
  changes publish together, ordinary failure leaves the prior generation live,
  current source-owned adverse truth can suppress unsafe output, and recovery
  is forward-only.
- Tenant, environment, Site, locale, permission, lifecycle, and source-family
  eligibility remain structural and release-time proof obligations; picker
  filtering never substitutes for authorization.
- Current CMS rows, static navbar/footer sources, and every public consumer
  require complete migration disposition and one authority cutover.
- Staff receive one quiet ordered editor, Page-context shortcuts, exact
  responsive preview, accessible non-drag movement, clear draft/live state,
  and one Publish action.
- D5, not this ADR, selects the exact purpose catalog, item types, destination
  behavior, duplicate-placement rules, label behavior, and nesting depth.

## Rejected alternatives

- deriving the general menu directly from the Page tree;
- storing menu membership, labels, parents, positions, or paths on Pages;
- hook-synchronized or bidirectional Page/Navigation writes;
- copied managed internal URLs, provider-latest public reads, or static
  fallback authority;
- duplicate revision history, per-item lifecycles, a second publish workflow,
  or a second serving head;
- runtime recursive provider graphs, per-item audience/workflow/schedule rules,
  tenant-defined schemas, arbitrary styling, unbounded nesting, or CRDTs; and
- fuzzy migration, long-lived dual reads, partial activation, or destructive
  rollback.

Ratification of this planning decision authorizes no implementation, schema,
migration, provider adoption, issue publication, release activation, or
production change.

## References

- [Phase 23 D4 decision log](../prds/sitestacker-parity/phase-23-web-studio-cms-decision-log.md#d4--curated-navigation-revisions-with-page-aware-assistance-under-d1)
- [Phase 23 D4 research evidence](../prds/sitestacker-parity/phase-23-d4-navigation-publication-research-evidence.md)
- [ADR-0147 — Generation-bound ordinary Page route continuity](./0147-generation-bound-automatic-ordinary-page-route-continuity.md)
- [ADR-0145 — Page-local composition and coherent generations](./0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
