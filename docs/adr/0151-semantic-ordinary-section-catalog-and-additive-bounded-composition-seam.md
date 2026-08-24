# ADR-0151: Semantic ordinary section catalog with an additive bounded-composition seam

**Status:** Accepted (founder-ratified Phase 23 D7 B-prime-R, 2026-08-21)

## Context

ADR-0145 establishes Page-local composition, bounded one-level Reusable
Sections, and coherent Public Site Generations. ADR-0150 establishes exactly
two Phase-23-owned ordinary families, Page and Article, plus one-time Page
Starters. Neither decides the ordinary section catalog or how the launch
composition should remain evolvable without prematurely rebuilding a visual
site-builder grammar.

The current prototype reuses one generic seven-block palette across ordinary
and Phase 22 content, couples CTA behavior to mutable page type, repeats block
knowledge across divergent serializers and renderers, silently removes unknown
blocks in one public path, and exposes provider media fields. A permanently
scattered flat-array design would make later bounded layout composition
expensive. A speculative recursive tree, parent table, layout AST, or nested
editor would instead impose that complexity before its product need and safe
grammar have been established.

## Decision

> **B-prime-amended-and-hardened (B-prime-R) — One small, code-owned,
> versioned Semantic Ordinary Section Catalog with closed Page and Article
> profiles and a deliberately minimal additive path to bounded future
> composition:** ordinary Phase 23 content is one provider-neutral versioned
> Composition Document whose initial format has one implicit root and a flat,
> Page-local ordered sequence of sections from Hero, Rich Text, Media, Gallery,
> Call to Action, Cards, FAQ, Quote, and Impact Statistics. Pages receive the
> full qualified catalog; Articles receive only Rich Text, Media, Gallery,
> Quote, and Call to Action. Hero is Page-only, first, and at most one;
> same-kind repeaters are bounded; every launch section, including Rich Text,
> is a leaf; and D1 Reusable Sections remain distinct, visibly shared,
> same-scope, root-only, one-level, and non-recursive references.
>
> Each local section has one opaque instance identity that survives editing
> and movement within its Page/locale revision lineage but is regenerated on
> duplication or cross-Page copy and never becomes authorization, public URL,
> or cross-locale identity; one stable code-owned semantic type; one explicit
> schema version; and typed content. One modular provider-neutral ordinary
> catalog and exhaustive candidate compiler own or prove equivalence across
> family and placement eligibility, server validation, Tenant/Site/locale
> scope, dependency extraction, accessible authoring and rendering, preview,
> public serialization, locale and export behavior, deprecation, direct
> historical migrations, diagnostics, and D1-pinned composition/profile/
> catalog/compiler/renderer compatibility. UI filtering and provider clipboard
> compatibility are assistance only: commands, imports, copy/paste, restores,
> privileged operations, and release compilation reprove the exact actor,
> scope, family, version, references, and cardinality, and copies never carry
> an unproved dependency.
>
> Authors receive one family-filtered chooser with a thumbnail, plain name,
> and purpose-first description for each eligible section; starter-led
> defaults; derived outline labels; synchronized desktop and narrow previews;
> local repair guidance plus one linked issue summary; and drag as an optional
> enhancement alongside accessible Move up, Move down, and Move to actions,
> focus preservation, status announcements, and undo. At the launch catalog's
> size, the chooser adds no categories, favorites, or search. The composition
> layer owns outer width, spacing, grid behavior, heading structure, one
> meaningful DOM and responsive order, and code-owned presentation; section
> content stores no viewport breakpoints, column coordinates, CSS classes,
> parent-specific layout, arbitrary style data, or alternate mobile order. CTA
> uses a typed source-qualified destination, media consumes only its owner's
> privacy-filtered public projection, and Impact Statistics are explicitly
> staff-authored editorial claims with optional public source/as-of context,
> never operational, financial, giving, or accounting truth.
>
> Option C is an intentional but separately researched and ratified evolution:
> a later composition-format and catalog generation may add only a small set of
> named code-owned container node types with explicit family, placement,
> allowed-child, maximum-depth, total-node, responsive-order, accessibility,
> migration, and release contracts. Existing version-1 root sections remain
> valid and are never silently wrapped, reparented, or rewritten. Unknown,
> future-version, family-ineligible, unsafe, unresolved, oversized, or
> renderer-incompatible content blocks only the candidate with an exact
> cause-owned repair path while the prior immutable public generation, raw
> candidate data, and recoverable draft remain intact; released history is
> never migrated on read, and deprecation removes a section from new insertion
> without making qualified existing content disappear. D7 creates no generic
> `children`, parent-pointer or independent-section database tree, rows,
> columns, arbitrary nesting, recursive Reusable Sections, style or breakpoint
> bag, dormant container flag, nested editor, tenant schema builder, plugin
> API, raw HTML/CSS/JavaScript, arbitrary iframe/embed or query surface, copied
> operational truth, silent unknown-block dropping, preview/public divergence,
> public original filenames or metadata, drag-only editing, destructive
> rollback, or promise that current Payload internals are permanent product
> architecture.

## Consequences

- Page receives nine semantic launch sections; Article receives five. Family,
  position, cardinality, version, reference, and scope rules are authoritative
  server contracts rather than chooser conventions.
- Version 1 is one flat composition under an implicit root. Stable versioned
  semantic leaves and one exhaustive provider-neutral catalog/compiler make a
  later bounded-container generation additive without building it now.
- Ordinary section data remains independent of outer width, spacing, grid,
  breakpoint, CSS class, parent layout, and alternate mobile order. Code owns
  one meaningful DOM order and responsive presentation.
- D1 Reusable Sections remain distinct visible root-level one-level references;
  there is no recursive shared-content or container graph.
- Provider schema, clipboard, draft, and preview facilities remain adapter
  mechanisms. Exact Asym scope, access, compatibility, and D1 release proof are
  enforced independently.
- Unknown or incompatible data fails only the candidate with actionable cause
  while raw work and the prior public generation remain intact. Historical
  releases are immutable and migrations create successor drafts.
- Future Option C requires a separate decision defining a small named container
  catalog, hard child/depth/node constraints, accessible editing, migration,
  and release proof. Existing version-1 Pages remain valid.

## Rejected alternatives

- freezing the current shared seven-block prototype and its duplicated
  serializers as the permanent catalog;
- exposing one universal catalog to both Page and Article;
- launching rows, columns, wrappers, arbitrary nesting, responsive style bags,
  parent-pointer storage, or a generic content AST in anticipation of Option C;
- tenant-authored block schemas, plugins, raw executable content, arbitrary
  queries, or copied operational truth;
- relying on provider filters, clipboard compatibility, Local API defaults, or
  mutable Payload publication state for authority; and
- silent block removal, migration on read, destructive rollback, drag-only
  editing, or forced future reparenting.

## Phase 23 D14 additive catalog amendment

Founder-ratified Phase 23 D14 is the first use of this ADR's additive catalog
seam. It adds exactly one source-discriminated **Dynamic Content List** semantic
leaf, presented to ordinary staff as **Content list**, while retaining D7's
flat version-1 implicit root, closed family qualification, server authority,
provider-neutral compiler, and prohibition on arbitrary query surfaces. The
leaf stores versioned semantic Selection Intent rather than copied source
records and is governed by ADR-0158's Dynamic Source Catalog. This amendment
does not introduce a container generation, generic query grammar, provider
record surface, tenant-authored schema, or second catalog authority.

Ratification of this planning decision authorizes no implementation, schema,
migration, provider adoption, issue publication, release activation, or
production change.

## References

- [Phase 23 D7 decision log](../prds/sitestacker-parity/phase-23-web-studio-cms-decision-log.md#d7--small-semantic-ordinary-section-catalog-with-an-additive-bounded-composition-seam)
- [Phase 23 D7 adversarial evidence](../prds/sitestacker-parity/phase-23-d7-ordinary-page-block-catalog-research-evidence.md)
- [ADR-0145 — Page-local composition, bounded reuse, and coherent Public Site Generations](./0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [ADR-0150 — Two semantic ordinary Page families and bounded Page Starters](./0150-two-semantic-ordinary-page-families-and-bounded-page-starters.md)
- [ADR-0158 — Versioned Dynamic Source Catalog and source-discriminated Content List](./0158-versioned-dynamic-source-catalog-and-content-list.md)
