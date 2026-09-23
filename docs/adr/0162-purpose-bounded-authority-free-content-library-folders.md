# ADR-0162: Purpose-bounded, authority-free Content Library folders

**Status:** Accepted (founder-ratified Phase 23 D18 C-prime-R, 2026-08-23)

## Context

Phase 23 needs an excellent staff filing experience for ordinary CMS content
without creating another public hierarchy, classification system, permission
model, workflow, file manager, or publication state. D2 already makes the Site
Plan authoritative for Page ancestry, paths, and ordinary breadcrumbs; D4–D5
own Navigation; D6 owns Page and Article identity; D12 owns Editorial Working
Revisions and editor leases; and D1, D13–D17 own release, scheduling, dynamic
content, public windows, and public search.

Payload's hierarchy capability is useful implementation machinery, but its
provider schema, access defaults, lock behavior, hooks, version coupling, and
recursive populated-folder deletion cannot define the Core product contract.
Core also uses a privileged Payload database connection, so Supabase RLS cannot
be claimed as the authorization boundary for provider records. Web Studio must
therefore expose a small private organization contract over an exact-qualified,
replaceable adapter while preserving source-owned access and all existing
authorities.

The central product risk is a false mental model: staff may reasonably assume a
folder move changes a website address, menu, publication, or permission unless
the UI and architecture make the separation explicit. The central integrity
risk is partial or destructive hierarchy mutation under concurrency. The
decision below resolves both without introducing a generic folder platform.

## Decision

> **C-prime-amended-and-hardened (C-prime-R) — one optional, private,
> purpose-bounded Content Library Folder contract over an exact-qualified,
> replaceable Payload hierarchy adapter:** D18 gives each exact Tenant ×
> environment × Site one staff-only organizational tree for stable D6 ordinary
> Page and Article identities only. Each eligible identity has one
> nonlocalized, non-editorial Library Placement in exactly one folder or the
> null-backed **Unfiled** state; folders have opaque stable identity, one
> editable display label, one optional same-scope parent, normalized
> case-insensitive sibling-label uniqueness, and a code-owned launch maximum of
> five named levels. Existing content starts Unfiled without inferred or
> mass-written placement.
>
> A folder supplies no Page ancestry, public path or breadcrumb, Navigation,
> Site, locale, Editorial Working Revision, active-editor lease, authorship,
> chronology, saved/reviewed/scheduled/published/activated/cached/searchable
> state, D1 generation, Phase 10 safety, permission, taxonomy, D14 source/list,
> D15 curation, D16 window, D17 public-search eligibility, lifecycle,
> retention, Trash, ownership, media custody, or operational truth. Folder
> create, rename, move, reparent, and remove are structurally side-effect-dark
> to every public projection and never advance last-content-edit time, public
> content digest, or a product Editorial Revision. Folder identity, label, and
> ancestry never enter public serializers, URLs, metadata, sitemaps, search
> documents, cache keys, telemetry, or unprivileged errors. Phase 22 records,
> Reusable Sections, Page Starters/Templates, Navigation, media, and
> operational records are excluded.
>
> Web Studio—not stock Payload Admin—is the product boundary. One quiet
> **Content Library** opens on **All content**, preserves **Unfiled**, labelled
> search with **This folder / All content** scope, type/status/assignment
> filters, and a paginated content list; it uses a collapsible semantic
> disclosure folder navigator on desktop and a searchable Core Sheet/picker on
> narrow screens. The item control is **Folder — staff organization only**;
> website address and Site Plan parent remain separate read-only facts.
> **Move to folder** is the first-class touch, keyboard, voice, and screen-
> reader path, with “This will not change the page address or what is
> published”; optional drag-and-drop can only invoke the same command. Single
> moves avoid redundant confirmation; bounded bulk moves show one exact count;
> loading, empty-folder, empty-search, permission, conflict, unavailable, and
> success states preserve context and report the next safe action through
> visible and programmatic status, never toast alone.
>
> Every create, rename, item move, bounded all-or-none bulk move, folder move,
> and remove passes through one server command boundary that re-proves actor,
> source-owned capability, immutable Tenant, environment, current Site,
> eligible family and record, folder and parent, expected generation,
> normalized-label uniqueness, cycle, and depth; uses one idempotency key, a
> short exact-scope serialized PostgreSQL transaction, compare-and-set fences,
> and one privacy-safe audit receipt; threads and awaits the same authenticated
> Payload request with user, overrideAccess false, and overrideLock false; and
> admits all effects or none. Same-scope parentage and placement, stable IDs,
> one-folder membership, normalized sibling uniqueness, and referential
> integrity are structurally enforced. Payload's privileged connection is
> never described as RLS-protected, browser filters never authorize, and raw
> folder mutations are unavailable to ordinary users.
>
> **Remove folder** never invokes Payload's recursive populated-hierarchy
> deletion. After an accessible exact consequence preview and fresh generation
> proof, one transaction moves directly filed content to the selected folder's
> parent or Unfiled, reparents immediate child folders to that parent or the
> root while preserving every descendant, blocks on collision, scope, depth,
> permission, or stale consequence, and deletes only the now-empty selected
> folder. It never deletes, trashes, unpublishes, or publicly moves content.
> Retry returns the same receipt and recovery is a newly validated forward
> command, not destructive rollback.
>
> Activation requires authoritative Site scope; additive Unfiled migration and
> provider-neutral export/rollback proof; exact-pin schema, access, lock,
> version, transaction, hierarchy and deletion conformance; authority-dark,
> tenant-isolation, concurrency, failpoint, capacity, mobile, keyboard,
> screen-reader, focus, zoom, touch and reduced-motion tests; and privacy-safe
> integrity and adapter-drift health. This introduces no per-folder ACL or
> inheritance, multi-folder membership, arbitrary folder type, tenant workflow
> or depth matrix, smart folder, public folder, closure table, event-sourced
> hierarchy, background propagation, second release state, media-folder
> authority, or second generic folder engine.

## Consequences

- Each exact Tenant × environment × Site receives one optional private Content
  Library tree. Existing Page and Article identities remain useful in Unfiled;
  no inferred filing or mass content rewrite is needed.
- A Content Library Folder has opaque stable identity, a display label, and one
  optional same-scope parent. Library Placement has exactly one folder or the
  null-backed Unfiled state. Neither fact varies by locale or Editorial
  Revision.
- The five-level ceiling and one-folder membership keep the ordinary staff
  model legible while leaving the provider adapter replaceable. A future need
  must be evidenced before expanding either constraint.
- Folder-only changes are side-effect-dark to D1–D17. They do not dirty
  content, alter chronology, paths, Navigation, publication, scheduling,
  dynamic sources, public windows, search, cache keys, permissions, lifecycle,
  or media custody.
- Web Studio owns the finished Content Library experience. Staff see All
  content, Unfiled, clearly scoped search and filters, a responsive folder
  navigator/picker, the first-class Move to folder command, explicit
  consequence previews for removal, and accessible contextual status.
- All mutation paths share one server command boundary and one semantic
  operation. Optional drag-and-drop invokes the same command; it is never the
  sole path.
- Raw provider mutations are unavailable to ordinary users. The server
  re-proves source-owned capability and exact scope, preserves Payload access
  and lock enforcement, and commits folder facts plus the privacy-safe audit
  receipt atomically.
- Remove folder rehomes direct content and immediate children before deleting
  only the selected empty folder. It cannot delete, trash, unpublish, archive,
  or publicly move content.
- Authorized audit evidence may identify the exact private records needed for
  accountability. Public output, ordinary telemetry, low-cardinality metrics,
  and unprivileged errors never expose folder identity, labels, or ancestry.
- Taxonomy/tags, Query Presets, Trash/permanent deletion, generalized media,
  workflow, and broader permissions remain separate decisions. D18 cannot be
  used to infer them.

## Rejected alternatives

- using folders as Page ancestry, paths, breadcrumbs, Navigation, Site,
  permission, taxonomy, publication, lifecycle, or public-search truth;
- putting Library Placement on every content revision or locale;
- allowing tenant-global or cross-Site trees, multiple folder membership,
  per-folder ACL or permission inheritance, arbitrary folder types, public or
  smart folders, or tenant-configured depth/workflow matrices;
- exposing stock Payload Admin or raw provider mutations as Web Studio;
- bypassing Payload access or document locks, relying on browser filtering for
  authorization, or describing the privileged provider connection as
  RLS-protected;
- drag-only filing, automatic inferred filing, forced folder creation,
  hidden Unfiled, eager recursive counts, or toast-only outcomes;
- recursive populated-folder deletion, partial bulk movement, mutable
  consequence previews, blind retries, manual database repair, or destructive
  rollback;
- closure tables, event-sourced hierarchy, background propagation, a second
  release state, or a second generic folder engine without measured need; and
- absorbing Phase 22 records, Reusable Sections, Page Starters/Templates,
  Navigation, media, operational data, tags/taxonomies, Query Presets, or Trash
  into this decision.

## Implementation proof gates

Implementation remains unauthorized by this ADR. A future authorized change
must prove at minimum:

1. Existing Page and Article identities appear in Unfiled with no inferred
   placement, mass update, product Editorial Revision, chronology change, or
   public effect.
2. Single and bounded all-or-none bulk moves are atomic and idempotent; lost
   responses and duplicate retries return the same receipt.
3. Folder-only mutations are demonstrably dark to every D1–D17 authority,
   public digest, path, Navigation, cache tag, public serializer, and product
   edit timestamp.
4. Wrong-Tenant, wrong-environment, wrong-Site, wrong-family,
   permission-hidden, stale-generation, forged, browser-filter-only, and raw
   provider requests cannot enumerate or mutate forbidden folder facts.
5. Stable identity, same-scope ancestry/placement, one-folder membership,
   normalized sibling uniqueness, depth, cycle prevention, and referential
   integrity survive concurrent inverse mutations.
6. Leaf, populated, root-level, and nested folder removal preserves every
   content and descendant identity and performs exactly the freshly previewed
   rehome or no change.
7. Move-versus-remove, changed consequences, collision, capability revocation,
   audit failure, database failure, provider timeout, lost response, and retry
   leave prior truth intact or return the same committed result.
8. The exact pinned Payload cohort passes schema, access, lock, version, hook,
   transaction, hierarchy, pagination, deletion, and adapter conformance before
   activation and after each upgrade.
9. Production-shaped skew proves indexed lazy navigation, folder/all-content
   search, pagination, bounded bulk operations, acceptable mutation latency,
   and no recursive count/path N+1 behavior.
10. Server-rendered, no-JavaScript where applicable, mobile, 320-pixel reflow,
    keyboard, touch, voice, screen-reader, zoom, focus restoration,
    reduced-motion, drag fallback, empty/error/conflict, and live-status flows
    pass automated and manual accessibility tests.
11. Provider-neutral export/import preserves stable folder identity, exact
    scope, parentage, label, and placement; rollback disables actions and
    preserves inert data until an authorized complete census.
12. Privacy-safe integrity and adapter-drift health detects orphans, scope,
    cycle, depth, collision, transaction, retry, conflict, and latency failures
    without exposing private folder data or creating noisy healthy alerts.

Ratification of this planning decision authorizes no implementation, schema,
migration, dependency or provider adoption, issue publication, deployment, D1
activation, release, or production change.

## References

- [Phase 23 D18 primary-source research, staff UX, adversarial review, and proof gates](../prds/sitestacker-parity/research/phase-23-d18-content-library-folder-authority-research.md)
- [ADR-0145 — Page-local composition, bounded reuse, and coherent Public Site Generations](./0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [ADR-0146 — Staged hierarchical public paths under coherent Site Plan releases](./0146-staged-hierarchical-public-paths-under-coherent-site-generations.md)
- [ADR-0150 — Two semantic ordinary content families and bounded Page Starters](./0150-two-semantic-ordinary-page-families-and-bounded-page-starters.md)
- [ADR-0156 — Bounded Editorial Working Revisions and recoverable active editor](./0156-bounded-editorial-working-revisions-and-recoverable-active-editor.md)
- [ADR-0161 — Derived Public Site Search Projection and adverse-first convergence](./0161-derived-public-site-search-projection-and-adverse-first-convergence.md)
- [Payload Folders](https://payloadcms.com/docs/folders/overview)
- [Payload Local API access control](https://payloadcms.com/docs/local-api/access-control)
- [Payload database transactions](https://payloadcms.com/docs/database/transactions)
- [WAI-ARIA Authoring Practices: Tree View Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/)
- [WCAG 2.2 Understanding 2.5.7: Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements)
- [Phase 22 specification PR #1323](https://github.com/Asymmetric-al/core/pull/1323)
