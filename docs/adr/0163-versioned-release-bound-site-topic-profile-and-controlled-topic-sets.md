# ADR-0163: Versioned, release-bound Site Topic Profile and controlled Topic Sets

**Status:** Accepted (founder-ratified Phase 23 D19 C-prime-R, 2026-08-23)

## Context

Phase 23 needs a simple way for ministry staff to classify ordinary Pages and
Articles so visitors can find related public content without creating a generic
tagging platform, copying operational truth into the CMS, or letting taxonomy
silently become URL, Navigation, permission, workflow, SEO, or publication
authority. Missions organizations commonly classify material by ministry focus,
audience, and resource theme, but exact geography, people-group, and ministry-
method labels can create disclosure risk when combined with otherwise safe copy.

D1 already owns exact-locale Public Site Generations; D6 owns ordinary Page and
Article identity; D14 owns Dynamic Content List source and filter semantics; D17
owns the derived Public Site Search Projection; D18 owns private staff folders;
Phase 10 owns the publication-safety ceiling; and Phase 22 owns Missionary,
Project/Campaign, Ministry Update, directory, reach, and lifecycle records. D19
must compose with those authorities rather than replace or infer them.

The exact pinned Payload hierarchy implementation is useful provider machinery
but cannot define the product lifecycle: its hierarchy deletion can cascade to
children and clear related fields, while Core's Payload adapter uses a privileged
direct PostgreSQL connection that is not protected by Supabase RLS. Stable Core
identities, Web Studio commands, structural scope constraints, immutable
revisions, and a provider-neutral compiled public boundary are therefore
required.

## Decision

> **C-prime-amended-and-hardened (C-prime-R) — one exact-scope, versioned and
> D1-release-bound Site Topic Profile with a small tenant-named catalog of
> controlled, public-safe Topic Sets:** D19 gives each exact Tenant ×
> environment × Site at most one stable Site Topic Profile identity with
> immutable versions, at most eight active Topic Sets, 500 active Topics across
> the profile, three single-parent levels including the root, and 20 direct
> Topic assignments per eligible stable D6 Page or Article. The optional setup
> starter copies roughly three editable sets—such as Ministry focus, Audience,
> and Resource theme—and 15–20 ordinary terms into that Site's private working
> profile; staff may instead start empty. Set names and terms are tenant-owned,
> assignment remains optional, and these code-owned ceilings are guardrails,
> not targets, plan controls, or tenant-configurable matrices. Phase 22
> Missionary Ministry Pages, Project/Campaign Pages, Ministry Updates,
> directories, and all specialized Phase 22 records remain excluded.
>
> Each Topic Set and Topic has one opaque stable never-reused identity and
> immutable Tenant × environment × Site scope. A Set has one localized
> preferred label, short purpose, Page/Article/both applicability, deterministic
> position, and active/retired state. A Topic has one immutable Set, one
> optional same-set parent, localized preferred label and short scope note,
> bounded localized staff-search alternate labels, deterministic sibling
> position, and active/retired/replaced state. Preferred and alternate label
> tokens are NFKC-, whitespace-, and Unicode-case-normalized and remain unique
> within exact Site × Set × locale across active, retired, and replaced
> identities; punctuation and diacritics remain meaningful. The Site default-
> locale label is required. Another public locale may supply its own label or
> one explicit visible use-default acknowledgement; with neither, the Topic is
> omitted from that locale's public projection and reported as missing-label
> health without blocking otherwise eligible content—never silent fallback.
> IDs, not labels, paths, slugs, Payload fields, or provider virtual paths, bind
> assignments, D14 filters, D17 projections, releases, audit, and migration.
>
> One stable Page or Article owns one immutable, versioned and nonlocalized
> Topic Assignment Snapshot containing direct stable Topic IDs. The observed
> profile generation is only a CAS/validation precondition, not assignment
> meaning, so a label-only profile change does not churn assignments. The editor
> says **Topics help people find related content; they do not change this page's
> address, menu, permissions, or publication; topics apply to all languages**,
> lets authors choose only existing active Topics through a search-first grouped
> picker, groups selected chips by Set, explains scope and breadcrumbs,
> preserves explicit parent and child choices, and provides no inline creation,
> free tags, comma import, or AI classification. D19 owns ancestry and direct
> assignments only: a child never automatically assigns, displays, filters, or
> searches its ancestors. D14 may explicitly qualify direct-only or include-descendants
> behavior in its own versioned contract; launch D17 consumes
> approved direct labels only. A D9 presentation may deliberately show a
> bounded direct-label row, but no Topic automatically becomes a public badge,
> facet, route, archive, SEO page, sitemap item, Navigation item, or publicly
> enumerable catalog.
>
> Site-wide classification creates no cross-locale transaction or Site-global
> serving head. Each exact Tenant × environment × Site × BCP-47 locale D1
> Public Site Generation independently pins the eligible content revision, the
> exact nonlocalized assignment snapshot, exact compatible Site Topic Profile
> structure revision, exact locale label revision or acknowledged default label
> when one is used, and current Phase-10-safe direct Topic projection plus only
> consumer-qualified ancestry semantics, then CAS-advances only that locale's
> serving head. A profile or assignment change may prepare every affected
> public locale, but Web Studio reports **Ready**, **Live**, or **Needs
> attention** per locale and may truthfully say **Live in 2 of 3 languages**;
> it never extends D10's presentation-only cohort exception, claims atomic
> all-locale activation, or silently rewrites locale Editorial Revisions. D13
> re-proves every exact pin at execution, and failure leaves each prior safe locale
> generation serving.
>
> A Topic supplies no Page/Article identity, route, slug, hierarchy,
> breadcrumb, redirect, Navigation, Dynamic Content List, publication,
> permission, audience access, workflow, review, ownership, lifecycle,
> retention, content family, donor/CRM segment, operational geography,
> financial fact, search eligibility, Phase 22 authority, or Phase 10 safety.
> The complete Page-or-Article projection—including direct Topic labels, any
> ancestry semantics explicitly requested by a qualified owning consumer, and
> their combination with copy and source facts—must pass current Phase 10 proof
> before favorable release; no starter People Group or exact Geography set is
> supplied, no catalog is automatically public, and adverse containment
> outranks ordinary D1/D17 convergence. D14 consumes only compatible stable
> Topic IDs and exact profile versions. D17 consumes only released, public-safe
> directly assigned labels through its Search Document contract; staff
> alternate labels remain private and do not enter public search, URLs,
> metadata, analytics, metrics, or logs. Public delivery reads one flat
> allowlisted compiled DTO, never Payload or a recursive mutable Topic graph.
>
> Web Studio owns one calm **Settings → Topics** manager and Core-consistent
> Page/Article picker. Setup offers **Start with examples** or **Start empty**;
> the overview shows plain-language Set purpose, family, active and usage
> counts, search, draft changes, and honest per-locale release health. Desktop
> uses a search/list-first two-pane workspace with disclosure/breadcrumb
> hierarchy and detail; a full ARIA tree is used only if a tested Core primitive
> exists. Narrow layouts use a full-height searchable Core Sheet and Core's
> comfortable 44-pixel controls. Search is primary in the content picker;
> browse-by-set is secondary. Named Move controls are authoritative and optional
> drag invokes the same command. Rename and draft edits stay quiet; reparent,
> replace/retire, and D1 **Publish site changes** show exact affected content,
> D14/D17, safety, label, and locale consequences. Loading, empty, no-match,
> read-only, missing-label, retired-selection, conflict, unavailable, unsafe,
> preparation-failure, partial-locale, and success states remain visible,
> focus-safe, recoverable through D12, and programmatically announced—never toast
> only.
>
> Every add, rename, reorder, move, replace, retire, discard-unused-draft,
> assignment, and release command re-proves authenticated actor and capability,
> immutable exact scope, eligible family and identity, expected profile and
> assignment generations, localized labels, same-set parentage, three-level
> acyclicity, normalized uniqueness, bounds, uses, D14/D17 compatibility, and
> Phase 10 consequence; uses one idempotency key, compare-and-set fence, short
> exact-profile serialized PostgreSQL transaction, awaited effects, and
> privacy-safe audit receipt; and threads the same authenticated Payload request
> with access and locks enforced. Structural composite foreign keys, unique
> label tokens, never-reused IDs, referential history, assignment ceilings, and
> supporting indexes back the command proof. Payload's privileged connection is
> never called RLS-protected, browser filters never authorize, and raw hierarchy
> create/delete/relationship mutations are unavailable to ordinary users.
>
> Rename preserves identity; released or assigned Topics are never deleted;
> reparenting previews changed ancestry and qualified consumer meaning; same-set
> Replace and retire stages one explicit successor profile plus explicit owner-
> specific Page/Article Assignment Revisions and D14 intent revisions under the
> same D1 candidate, never mutates live/history, and blocks on unresolved or
> incompatible uses; retirement without replacement blocks until assignments
> and filters are resolved; a Set retires only after its Topics; and only an
> unused never-released draft may be discarded. Old immutable generations remain
> readable, recovery is a newly proved forward version, and raw Payload recursive
> deletion is forbidden. Activation requires additive no-inference migration
> with existing content unassigned; explicit provenance-bearing import review;
> provider-neutral export and retained-reader proof; exact
> 4.0.0-internal.1f9ae9a schema, hierarchy, folder-coexistence, hook/delete/path,
> UI, access, lock, version, localization, transaction, migration and rollback
> conformance; tenant, race, failpoint, D1/D12/D13/D14/
> D17, Phase 10, capacity, mobile, keyboard, screen-reader, focus, zoom, touch
> and reflow tests; and
> privacy-safe per-locale, label, assignment, safety, projection, invariant and
> adapter-drift health. D19 introduces no universal ontology, polyhierarchy,
> per-topic ACL, workflow tag, public/private matrix, cross-Site/global
> vocabulary, tenant-authored schema, automatic archive, auto-tagging, semantic
> vector, personalization, or second release engine.

## Consequences

- Each exact Tenant × environment × Site receives at most one optional working
  Site Topic Profile. Staff may start empty or copy a deliberately small set of
  editable ministry-oriented examples.
- Topic Sets and Topics are stable product identities. Labels, localized search
  aliases, ancestry, order, and lifecycle are revisioned facts; provider paths
  and fields are replaceable implementation details.
- One nonlocalized Topic Assignment Snapshot classifies one stable ordinary Page
  or Article across locales. Locale labels and release remain independently
  exact, so one missing translation does not silently fall back or create a
  false cross-locale transaction.
- Topics are controlled public-discovery vocabulary only. They do not become
  operational CRM facts, private folders, workflow tags, permissions, URLs,
  menus, public archives, SEO pages, or release state.
- D14 and D17 consume Topics only through explicit compatible contracts. D14
  owns descendant-filter semantics; launch D17 indexes approved direct labels
  only. Neither reads a mutable provider graph at request time.
- Phase 10 evaluates the complete content-and-topic projection. No catalog is
  automatically public, staff aliases remain private, and adverse suppression
  outranks ordinary release and search convergence.
- Web Studio owns a search-first, plain-language, accessible manager and picker.
  There is no inline free tagging, AI auto-tagging, raw Payload hierarchy UI, or
  separate Topic publication action.
- Rename preserves identity; reparent, replace, and retire are versioned,
  previewed, reference-safe forward operations. Released or referenced Topics
  are never raw-deleted.
- The launch ceilings deliberately keep authoring, query cost, and operations
  bounded. A future expansion requires measured tenant evidence and renewed
  capacity proof rather than a tenant-authored complexity matrix.

## Rejected alternatives

- free-form tags, inline term creation, comma import, or automatic AI tagging;
- a platform-global, tenant-global, cross-Site, universal missions, operational,
  or people-group ontology;
- copying language, content family, author, geography, designation, donor,
  workflow, permission, or accounting facts into Topics;
- label-, slug-, path-, provider-ID-, or newest-record-based assignment and
  filtering;
- polyhierarchy, arbitrary depth, per-topic ACLs, per-topic workflow, a public/
  private matrix, personalized taxonomy, or tenant-authored schemas;
- automatic ancestor assignment, display, filtering, or search behavior;
- automatic Topic routes, archives, SEO pages, sitemaps, Navigation, public
  catalog enumeration, or a second release head;
- duplicate per-locale assignment, silent label fallback, all-locale atomicity,
  or extending D10 beyond its presentation-only cohort;
- using D18 folders, operational tags, Payload virtual paths, or stock Payload
  Admin as D19 product authority;
- raw recursive deletion, in-place replacement, blind bulk rewrite, destructive
  rollback, or manual database repair; and
- absorbing Phase 22 Missionary, Project/Campaign, Ministry Update, directory,
  reach, or lifecycle records into the ordinary D19 model.

## Implementation proof gates

Implementation remains unauthorized by this ADR. A future authorized change
must prove at minimum:

1. Stable Topic Set, Topic, structure revision, locale label revision, and
   assignment identities survive rename, reparent, replacement, locale change,
   provider upgrade, export/import, and rollback without label or path coupling.
2. Wrong-Tenant, wrong-environment, wrong-Site, wrong-family, forged-parent,
   forged-assignment, permission-hidden, raw-provider, and Local API bypass
   attempts cannot read, enumerate, count, assign, mutate, or release forbidden
   Topic facts.
3. Composite same-scope foreign keys, normalized-label uniqueness, one-set
   membership, one same-set parent, acyclicity, depth, assignment, and catalog
   ceilings hold under concurrent inverse mutations.
4. A nonlocalized assignment applies across locale lineages while each exact
   locale generation independently pins compatible structure, assignment,
   label, compiler, and Phase 10 results with no cross-locale atomic claim.
5. Missing locale labels omit only optional Topic presentation, create visible
   health, never silently fall back, and block only an explicitly label-requiring
   consumer candidate while the prior safe generation remains live.
6. D14 direct-only and include-descendants modes are deterministic and
   version-qualified; D17 indexes only released public-safe direct labels;
   private aliases, drafts, retired terms, and the full catalog never leak.
7. Whole-projection Phase 10 tests cover mosaic combinations of copy, Topic,
   ancestry, operational facts, generalized geography, people group, and
   restricted ministry; adverse suppression converges ahead of ordinary release
   and search cleanup.
8. Rename, reorder, reparent, replace, retire, assignment, bounded bulk action,
   release, lost response, duplicate retry, stale impact, capability revocation,
   transaction failure, provider timeout, and audit failure commit exactly once
   or preserve prior truth.
9. Exact pinned Payload schema, hierarchy, hooks, delete, path, UI, access, lock,
   version, localization, transaction, migration, folder-coexistence, and upgrade
   behavior passes a replaceable adapter conformance suite.
10. Production-shaped skew proves indexed picker search, paginated management,
    set-based usage and impact counts, bounded compile cost, no recursive public
    graph reads, acceptable release latency, and safe capacity ceilings.
11. Start-empty, starter-copy, optional assignment, rename, move, replace,
    retire, translation, conflict, unavailable, partial-locale, and recovery UX
    passes mobile, keyboard, screen-reader, focus, zoom, touch, reflow, and
    programmatic-status verification.
12. Additive migration leaves existing content unassigned; provenance-bearing
    import requires explicit mapping; provider-neutral export and retained
    historical readers round-trip every stable identity and immutable revision;
    integrity and adapter-drift health remain privacy-safe and actionable.

### Exact conformance matrix

| Gate                    | Required evidence                                                                                                                                                                                                                                                                              | Rejects                                                               |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Authority darkness      | Topic-only changes do not alter routes, Navigation, permissions, workflow, content family, Phase 22 records, operational facts, public eligibility, or unsafe public facet counts                                                                                                              | Generic tags as hidden authority                                      |
| Exact scope             | Wrong Tenant, environment, Site, Topic Set, family, and role cannot read, count, search, assign, parent, or mutate                                                                                                                                                                             | Request-filter-only isolation                                         |
| Exact Payload pin       | Schema, relationship depth/population, hierarchy, after-read path leakage, hooks, parent/topic delete on has-many assignments, omitted access/lock overrides, UI inline creation, localization, transaction, folder coexistence, migration, and rollback conformance at 4.0.0-internal.1f9ae9a | Public-doc or v3 snapshot assumptions                                 |
| Stable identity         | Rename, translation, reorder, reparent, replacement, retained-reader, and export/import preserve opaque IDs and exact versions                                                                                                                                                                 | Labels, slugs, and provider IDs as truth                              |
| Label integrity         | NFKC/casefold/space collisions across preferred and alternate labels; missing locale; explicit default-label acknowledgement; punctuation/diacritic preservation                                                                                                                               | Silent fallback and duplicate vocabulary                              |
| Hierarchy               | Self/cross-set/cross-scope parent, cycle, depth four, inverse concurrent move, and stale parent fail atomically                                                                                                                                                                                | Read-before-write ancestry only                                       |
| Assignment              | Optional selection, 20 cap, exact parent/child direct choices, duplicate rejection, family applicability, stale retirement, D12 conflict and recovery                                                                                                                                          | Free tags, inline create, inferred ancestors, locale copies           |
| D1 locale release       | Each locale pins exact profile structure, assignment, label, compiler, and safety versions; missing optional labels omit safely; locale A may activate while locale B stays on its prior safe generation                                                                                       | Site-global head, cross-locale atomic claim, or blanket content block |
| Phase 10 safety         | Direct labels and only consumer-qualified ancestry semantics are proved with the complete public projection; adverse change suppresses before ordinary convergence                                                                                                                             | Per-term safety badges or publish-then-filter                         |
| D13 scheduling          | Scheduled execution re-proves exact profile, assignment, label, safety, D14, and public eligibility                                                                                                                                                                                            | Mutable latest at execution                                           |
| D14 integration         | Filters store stable Topic IDs plus exact compatible contract/profile versions; direct-only and explicit include-descendants modes are separately deterministic                                                                                                                                | Automatic ancestry, label/path filters and runtime provider graph     |
| D17 integration         | Only released public-safe directly assigned labels enter launch Search Documents; retired/unsafe labels contain, delete, and cannot resurrect                                                                                                                                                  | Private aliases, implicit ancestors, raw tags, stale upsert           |
| Lifecycle               | Rename, reparent, same-set replace, retire, set retirement, discard-unused-draft, retry, and lost response preserve history and exact impact                                                                                                                                                   | Raw delete, cascade, cross-set merge                                  |
| Concurrency/failure     | Duplicate retry, simultaneous normalized rename, inverse move, rename/retire/replace versus assignment/publish, stale profile/assignment CAS, audit/database/provider failure, and locale partial activation produce no partial product truth                                                  | Last-write-wins and false success                                     |
| Migration/export        | Existing content stays unassigned; mapped imports require review/provenance; exact neutral round trip and retained readers pass                                                                                                                                                                | AI/string inference and provider lock-in                              |
| Performance             | Indexed plans, lazy/paginated management, set-based impacts, bounded fan-out, flat public DTO, no public N+1 under production-shaped load                                                                                                                                                      | Whole-tree/public recursive reads                                     |
| Accessibility/usability | Ministry staff complete setup, assignment, move, replacement and release on desktop/mobile with keyboard, screen reader, touch, zoom and 320-pixel reflow                                                                                                                                      | Jargon, drag-only, toast-only, tree-only UI                           |
| Observability           | Per-locale release, label gaps, invalid references, safety, D14/D17, invariant and adapter health are actionable and privacy-safe                                                                                                                                                              | One generic CMS sync status                                           |

Ratification of this planning decision authorizes no implementation, schema,
migration, dependency or provider adoption, issue publication, deployment, D1
activation, release, or production change.

## References

- [Phase 23 D19 research, nonprofit UX, adversarial review, and proof gates](../prds/sitestacker-parity/research/phase-23-d19-site-topic-profile-research.md)
- [ADR-0145 — Page-local composition, bounded reuse, and coherent Public Site Generations](./0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [ADR-0150 — Two semantic ordinary content families and bounded Page Starters](./0150-two-semantic-ordinary-page-families-and-bounded-page-starters.md)
- [ADR-0158 — Versioned Dynamic Source Catalog and source-discriminated Content List](./0158-versioned-dynamic-source-catalog-and-content-list.md)
- [ADR-0161 — Derived Public Site Search Projection and adverse-first convergence](./0161-derived-public-site-search-projection-and-adverse-first-convergence.md)
- [ADR-0162 — Purpose-bounded, authority-free Content Library folders](./0162-purpose-bounded-authority-free-content-library-folders.md)
- [Cru taxonomy guide](https://www.cru.org/content/dam/cru/gsw/How-To-Use-Crus-Taxonomy.pdf)
- [OMF Canada resource library](https://omf.org/ca/resources/all-resources/)
- [Contentful taxonomy](https://www.contentful.com/help/taxonomy/)
- [Drupal taxonomy](https://www.drupal.org/docs/user_guide/en/structure-taxonomy.html)
- [Payload hierarchy before-delete source at the exact Core pin](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/hierarchy/hooks/collectionBeforeDelete.ts)
- [Payload hierarchy after-delete source at the exact Core pin](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/hierarchy/hooks/collectionAfterDelete.ts)
- [WAI-ARIA Authoring Practices: Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
- [OCHA Data Responsibility](https://centre.humdata.org/data-responsibility/)
- [Phase 22 specification PR #1323](https://github.com/Asymmetric-al/core/pull/1323)
