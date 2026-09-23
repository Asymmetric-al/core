# ADR-0152: Family-qualified exact semantic Reusable Sections

**Status:** Accepted (founder-ratified Phase 23 D8 B-prime-R, 2026-08-21)

## Context

ADR-0145 establishes Page-local composition, explicit one-level Reusable
Sections, and coherent Public Site Generations. ADR-0150 makes Page Starters
one-time local copies, and ADR-0151 establishes the family-qualified semantic
leaf catalog and separately ratified path to future bounded Page-local
containers. Those decisions do not yet identify which semantic unit may be
shared or define the complete authoring and release consequences of changing
it.

The product must let tenants create visually distinctive Sites without turning
shared editorial content into a nested page-builder graph. Visual uniqueness is
not evidence that several semantic sections must remain synchronized as one
editorial fact. Modern CMS evidence instead supports separating exact reusable
content, copied starting layouts, Page-local arrangement, and bounded
presentation choices.

## Decision

> **B-prime-amended-and-hardened (B-prime-R) — Family-qualified exact semantic
> Reusable Sections with presentation-neutral sharing and expressive Page-local
> composition:** every family-qualified D7 leaf except Hero may become one
> explicit, independently versioned Reusable Section containing exactly one
> typed semantic leaf, including its bounded same-kind repeater where defined,
> and bound to one stable subject, exact Tenant × environment × Site × BCP-47
> locale, qualified family/type/catalog/schema generation, and immutable
> revision. A Page may deliberately interleave local and shared leaves in any
> D7-valid order and may use the same subject in more than one valid placement;
> every placement retains fresh stable Page-local identity, and consequence
> views distinguish distinct Pages from exact placements.
>
> The Reusable Section owns shared semantic content and typed source-owner
> references only—never route, SEO, Navigation, Site chrome, Page hierarchy,
> multi-section structure, layout inheritance, style data, or copied
> operational truth—and does not impose one fixed tenant-neutral skin. D8
> preserves a separate versioned presentation-resolution seam: an exact Page
> placement may later select only a compatible named code-owned presentation
> variant permitted by the separately ratified Site Presentation Profile and
> Section Variant contract, without becoming a semantic-content override,
> independent placement workflow, or approval authority. D8 itself creates no
> token catalog, arbitrary style field, CSS/JavaScript lane, tenant component
> schema, or promise that any imagined design is safe no-code configuration.
> D6 Page Starters provide expressive multi-section beginnings as one-time
> local copies, Page-local composition provides selection and order, and D7's
> separately ratified bounded-container evolution remains the only path to
> richer local composition.
>
> Ordinary insertion remains local by default. **Save this section for reuse**
> and **Reuse existing** are deliberate actions. Saving an existing local leaf
> for reuse atomically creates the shared draft and replaces only that exact
> local placement with its reference under one expected-revision command;
> failure leaves the original local leaf intact. Every shared placement is
> visibly labelled with type, Site, locale, exact live/draft state, and separate
> current-public-Page, draft-only-Page, and placement counts; selecting it
> offers exactly **Change every use**, **Make a local copy**, and **View uses**.
> **Change every use** enters one focused accessible shared editor rather than
> casual inline global editing. **Make a local copy** atomically materializes
> the exact selected shared revision as a fresh local D7 section and replaces
> only that reference, permanently removing that placement from future shared
> propagation; failure preserves the reference. Staff without shared-content
> management authority may inspect consequences and make a local copy on an
> otherwise authorized Page but cannot change every use.
>
> A shared draft changes nothing public. Ordinary **Publish Page** pins the
> current released shared revision unless inclusion of a new shared revision is
> explicit; it never promotes another author's unrelated shared draft.
> Creating a Page's first use of a never-released shared subject may offer one
> explicit **Publish Page and shared section** action rather than requiring two
> disconnected publications.
> **Publish shared changes** shows one proportional accessible consequence
> review with exact current public Pages and placements, draft-only uses,
> responsive previews in the actual Site presentation, and cause-owned
> blockers. It compiles the exact successor shared revision with the active
> qualified Page revisions—preserving unrelated Page drafts—inside one
> non-authoritative D1 candidate. Final activation re-proves actor, permission,
> complete scope, locale without unauthorized fallback, family/cardinality,
> exact section and Page revisions, schema/catalog/compiler/renderer/
> presentation compatibility, assets and source projections, current safety,
> complete affected closure, manifest digests, and expected serving head before
> one idempotent CAS. Every qualified public use changes coherently or none
> does; public rendering consumes one flattened exact-version projection and
> never traverses mutable provider relationships.
>
> Retirement removes a shared subject from new selection while preserving
> qualified uses and immutable history; a referenced or ever-released subject
> is not destructively deleted through ordinary UI. Missing, incompatible,
> cross-scope, unsafe, or restored historical references remain explicit
> candidate errors with repair paths, never silent omission, substitution, or
> locale fallback. Restoration and rollback create newly proved successor
> candidates; candidate or provider failure leaves the prior safe generation
> live; Phase 10 adverse privacy/reach containment remains immediate and
> independently authoritative. The public-use graph is owned by D1 manifests;
> indexed reverse-use data is a rebuildable authoring/diagnostic projection.
> Payload Blocks, Relationships, Joins, Versions, drafts, locks, and Local API
> remain qualified adapter mechanisms rather than Tenant, access, scope,
> dependency, or release authority.
>
> D8 therefore creates no shared Hero, narrow arbitrary type subset,
> multi-section shared subject, synchronized Page subtree, recursive reuse,
> cross-Tenant/Site/locale reuse, per-placement semantic override, wrapper or
> folder inheritance, live `latest` reference, partial fan-out, copied Page
> draft, manual dependency census, giant release transaction, repeated Page
> approval, raw HTML/CSS/JavaScript or unqualified embed, inferred legacy
> sharing, destructive rollback, or claim that shared content, Page Starter,
> presentation profile, section variant, Site chrome, or public release are the
> same fact. C-prime remains a future separately researched option only if
> measured demand proves that an exact multi-section assembly must remain one
> synchronized editorial fact across Pages; visual uniqueness alone is not
> that evidence.

## Consequences

- Every family-qualified D7 leaf except Hero may be reused as exactly one
  semantic leaf. No synchronized multi-section content graph is introduced.
- Ordinary Page composition remains local and expressive. Page Starters copy;
  Reusable Sections synchronize; presentation profiles style; compatible
  variants alter bounded treatment; Page-local composition arranges.
- Reuse is deliberate and visibly consequential. Staff can inspect uses,
  change every qualified use through one focused workflow, or atomically
  detach one placement as a fresh local copy.
- Shared and Page drafts remain independent. Publication pins exact immutable
  shared revisions and compiles the complete active consumer closure through
  one D1 candidate and expected-head activation.
- Exact scope, family, revision, presentation compatibility, source safety, and
  permission are server-side release proofs. Provider relationships and
  reverse-use indexes are not public or authorization truth.
- Retirement and recovery preserve immutable history. Candidate failure does
  not disturb the prior safe public generation.
- Site Presentation Profiles and Section Variants require a separate founder
  decision; this ADR preserves their seam but does not define their catalogs or
  UX.

## Rejected alternatives

- a narrow arbitrary subset of otherwise family-qualified D7 leaves;
- live shared multi-section assemblies, nested reuse, synchronized Page
  subtrees, or wrapper/folder inheritance;
- per-placement semantic overrides or independent placement workflows;
- storing route, SEO, Navigation, hierarchy, layout inheritance, style data,
  or copied operational truth in a Reusable Section;
- mutable `latest` references, partial fan-out, destructive rollback, or
  provider-owned release authority; and
- using multi-section synchronization to solve tenant visual differentiation.

## Implementation proof gates

Implementation remains unauthorized by this ADR. A future authorized change
must prove at minimum:

- exhaustive D7 family/type/catalog/schema eligibility with Hero structurally
  excluded;
- exact Tenant × environment × Site × BCP-47 locale isolation across commands,
  reads, provider hooks, copies, imports, restores, reverse-use queries, and
  privileged paths;
- atomic local-to-shared conversion and shared-to-local detachment under
  expected revisions, with failure preserving the original placement;
- separate exact public-Page, draft-only-Page, and placement consequence counts
  and an accessible actual-Site responsive preview;
- no public effect from drafts, no unrelated draft promotion, complete closure
  compilation, final authority reproof, idempotent D1 CAS activation, and
  all-or-nothing qualified propagation;
- flattened exact-version public rendering with no mutable provider traversal;
- Phase 10 adverse-first containment, explicit repair for missing or
  incompatible references, prior-generation retention, and successor-only
  recovery;
- rebuildability and reconciliation of reverse-use projections from D1
  manifests; and
- stale-client, concurrency, permission-revocation, schema-upgrade,
  maximum-fan-out, migration, accessibility, and rollback/recovery tests.

Ratification of this planning decision authorizes no implementation, schema,
migration, provider adoption, issue publication, deployment, release
activation, or production change.

## References

- [Phase 23 D8 decision log](../prds/sitestacker-parity/phase-23-web-studio-cms-decision-log.md#d8--family-qualified-exact-semantic-reusable-sections)
- [Phase 23 D8 adversarial evidence](../prds/sitestacker-parity/phase-23-d8-reusable-section-scope-and-propagation-research-evidence.md)
- [ADR-0145 — Page-local composition, bounded reuse, and coherent Public Site Generations](./0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [ADR-0150 — Two semantic ordinary Page families and bounded Page Starters](./0150-two-semantic-ordinary-page-families-and-bounded-page-starters.md)
- [ADR-0151 — Semantic ordinary section catalog with an additive bounded-composition seam](./0151-semantic-ordinary-section-catalog-and-additive-bounded-composition-seam.md)
