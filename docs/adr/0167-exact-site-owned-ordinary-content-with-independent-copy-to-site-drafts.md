# ADR-0167: Exact Site-owned ordinary content with independent Copy-to-Site drafts

**Status:** Accepted (founder-ratified Phase 23 D23 B-prime-R, 2026-08-23)

## Context

Phase 23 must support ministries that operate several public Sites without
turning ordinary Pages and Articles into Tenant-global content, forcing staff to
recreate useful content manually, or prematurely adopting a live cross-Site
sharing and synchronization platform. D1, D2, D8, D9, and D22 already make Site
and exact locale material to content identity, placement, reusable composition,
presentation, preview, and release.

Modern cross-space references can support live sharing, but only with dedicated
resource identity, authorization, resolution, deletion, migration, and failure
semantics. Payload's generic duplicate and locale-copy mechanics do not
understand Asym's Site, D1 release, D2 path, reference, Media-safety, or
no-authority boundaries. The durable choice is exact Site ownership plus one
governed convenience command that creates an independent private draft.

## Decision

> **B-prime-amended-and-hardened (B-prime-R) — Exact Site-owned ordinary
> content with one-time, exact-revision independent Copy-to-Site drafts.** Every
> ordinary Page and Article identity belongs to one required exact Tenant ×
> environment × Site; its locale variants remain D22's subordinate exact
> lineages, and missing Site, a Site array, or implicit Tenant-global ordinary
> content is forbidden. Navigation, Reusable Sections, folders, Topics, saved
> views, Trash, presentation packages, Site chrome, Phase 22 specialized
> content, and dynamic or operational facts retain their already-ratified
> owners. Page Starters remain Asym-owned code templates. Media remains
> tenant-wide only under Phase 2 and current target-use safety proof. The
> canonical Phase 2/D1 Site registry, host-to-Site-to-Tenant resolver, required
> Site ownership, per-Site path constraints, and exact-Site authorization are
> hard prerequisites; no tenant-only interim duplicate is permitted.
>
> An authorized **Copy to another Site...** command may copy exactly one Page
> or Article from one exact visible acknowledged source revision into one
> different target Site within the same exact Tenant and environment. It is a
> governed starting action, never sharing, inheritance, synchronization,
> recursive distribution, merge, overwrite, or migration. It creates a fresh
> target stable identity, one explicit target locale lineage, fresh Page-local
> block and anchor identities, a separately selected D2 placement/path draft,
> and an independent private working revision explicitly stored as **Draft —
> not live**. It never mutates the source. Later source edits, publication,
> withdrawal, Trash, permission changes, or deletion never propagate to or
> impair the target. Protected immutable provenance supports audit and help but
> is not a relationship dereferenced by editing, preview, release, public
> reads, search, Trash, or recovery.
>
> The action is available only after D12 has one acknowledged saved source
> revision; pending or failed autosave, offline work, and unresolved conflict
> block it with a direct recovery action. Server-derived scope and the sole
> permission resolver must prove exact-source-revision read authority plus
> target-Site create/edit authority both at preflight and commit. Only eligible
> target Sites are listed, each with Site name and primary domain; a client
> cannot assert Tenant, environment, Site, locale, or favorable state. A target
> locale defaults only when the identical normalized locale is enabled. Any
> different-locale start explicitly branches through D22, labels copied prose
> as untranslated source material, and never performs silent locale fallback
> or treats `en-US` and `en-GB` as equivalent.
>
> A versioned, code-owned, family-qualified transfer manifest classifies every
> eligible field, rich-text node, semantic block, certified custom block, and
> relationship as **copy**, **materialize/remap**, **review after copying**, or
> **never copy**. Unclassified or incompatible catalog members fail preflight.
> Compatible editorial content and bounded SEO copy may copy. A D8 Reusable
> Section materializes as fresh Page-local target content. Page-local IDs and
> internal anchors are remapped. Target references, embeds, dynamic-source
> bindings, absolute source-domain links, and tenant-wide Media are revalidated
> against target authority, availability, rights, rendition, metadata, and
> current Phase 10/29 safety. An internal Page link maps only through an
> explicit eligible target selection; it never remains a dangling source-Site
> relationship. Unsupported structural content blocks creation; intentionally
> repairable omissions are disclosed before commit, represented in a bounded
> actionable repair manifest, and block D1 release when required. Nothing
> silently disappears, falls back, rewrites, or becomes safe merely because the
> source was live.
>
> Source path/placement and Navigation, folder, Topic, saved-view,
> active-editor, comments, review/approval, schedule, publication, D1
> generation, canonical, search, cache, sitemap, analytics, Trash/retention,
> presentation, Site-settings, audit, operational, and Phase 10/22 eligibility
> facts never copy as authority. The source slug is only a visible suggestion.
> The target domain and complete proposed address remain explicit; D2 validation
> and a database uniqueness constraint reject collisions at commit. The command
> never overwrites an existing Page or silently appends a suffix.
>
> Preflight creates an immutable, expiring plan digest bound to actor, exact
> source identity/revision/locale and schema/catalog generation, target Site and
> locale, proposed D2 path, copied/remapped content, disclosed repairs, excluded
> facts, and idempotency key. Commit re-proves current authorization, source
> head and non-Trash lifecycle, target ownership/active state/locale, catalog
> compatibility, reference and Media safety, and path claim. One short atomic
> transaction, with every nested provider operation awaited under the same
> request/transaction, creates target identity, locale draft, placement,
> repair manifest, protected provenance, durable audit/outbox fact, and unique
> idempotency receipt together or creates none. Remote provider or network checks
> complete before that short transaction; commit rechecks their durable
> version/safety facts and never holds a database transaction open across remote
> I/O. The unique receipt stores the canonical request digest and qualified
> adapter generation. An identical lost-response replay resolves the same
> receipt; reuse of the key with different source, target, revision, locale,
> path, or options fails as an idempotency conflict with no mutation. A later
> unauthorized caller receives a non-enumerating unavailable result rather than
> receipt details. A replay after the target entered Trash or was purged returns
> only its currently authorized terminal disposition and never resurrects it;
> a deliberate new copy requires a new key. Best-effort metric delivery cannot
> roll back an already committed target, but its delivery debt remains
> observable.
>
> The occasional action lives in the Page/Article **More actions** menu only
> when an eligible target exists and opens one responsive dialog or sheet—not a
> wizard, dashboard, bulk tool, or alarming confirmation. It fixes the visible
> source context; requires an explicit destination when several exist; shows
> exact language and target address; states **Creates an independent draft on
> `<Site>`. Future edits will not stay in sync. Nothing will be published.**;
> and summarizes **Ready to copy / Review after copying / Stays with
> `<source Site>`**. The final action reads **Create independent draft on
> `<target Site>`**.
> While running it shows an announced busy/reconciliation state and prevents a
> second submission. Success navigates in the same tab to the target editor,
> focuses its heading, and persistently shows **`<Site> · <domain> · <locale> ·
Draft — not live`**, calm independent-copy provenance, and release-blocking
> repairs before review-only items. Every repair links to the affected field or
> block; no essential state exists only in a toast, color, icon, hover, or
> motion. Cancel restores focus and submitted errors retain input, expose a
> linked summary, and follow Core keyboard, screen-reader, touch, reflow, zoom,
> and reduced-motion contracts.
>
> Public host resolution remains host-to-Site-to-Tenant before every exact-scope
> query. Preview names Site, domain, locale, and target revision and remains
> private, `no-store`, and `noindex`. Copy produces no route, Navigation entry,
> canonical, social card, sitemap/search document, cache invalidation result, or
> public output. Only the target Site and locale's later complete D1 release may
> make it public; repair blockers and all current adverse safety facts win.
> Copy is bounded to one existing ordinary revision, depth-zero relationship
> reads, batched validations, existing Page/block size limits, and retained
> safe Media references rather than byte duplication. It never starts recursive
> graph work, queue, workflow engine, or background synchronization system. Its
> compact repair projection is not a second work-management database; D1 always
> recomputes current blockers from authoritative target facts.
>
> Payload `4.0.0-internal.1f9ae9a` remains a qualified persistence and authoring
> adapter only. Ordinary Page/Article collections set `disableDuplicate` and
> `admin.disableCopyToLocale`; stock duplicate UI/API, `duplicateFromID`,
> provider locale fallback, plugin tenant cleanup, provider latest-version
> selection, and elevated Local API defaults are not product authority. The
> Asym port passes authenticated user context, `overrideAccess: false`, exact
> Site predicates, `fallbackLocale: false`, the shared transaction request, and
> explicit `_status: 'draft'` through an exact-pin conformance suite. Every
> custom package declares compatible transfer behavior; provider/schema drift
> fails closed.
>
> Migration uses restartable expand, one proven default-Site backfill per legacy
> identity, checksum/constraint and shadow-read verification, cutover, then
> contract before enabling copy. Transfer manifests and source/target catalog
> generations evolve additively with deterministic qualified migrators and
> retained readers; no read-time mutation or lossy down migration may collapse
> Site or locale distinctions. Acceptance requires exhaustive manifest coverage;
> native-action suppression; exact-scope authorization and non-enumeration;
> generic-provider conformance; source-save/conflict, permission-revocation,
> Trash, inactive-Site/locale, schema-skew, path-race, incompatible-block,
> reference/Media, transaction, audit/outbox, lost-response, duplicate-retry,
> deploy-skew, adapter-generation, migration, rollback, preview, and
> public-no-effect fixtures; pure transfer-plan compiler tests; exact Payload
> plus real PostgreSQL constraint tests; proof that same-key/different-request
> conflicts mutate nothing and that old receipts never resurrect trashed or
> purged targets; bounded-linear maximum-Page load tests with no recursive or
> N+1 traversal; plus
> representative ministry staff completing the Hope-to-Relief flow and
> explaining source revision, destination, independence, repair, and release
> consequences without coaching across keyboard, screen reader, touch, 320 CSS
> pixels, 400 percent zoom, long/RTL labels, and slow or interrupted networks.
> This decision records architecture only and authorizes no implementation,
> schema, migration, provider adoption, issue publication, release activation,
> deployment, or production change.

## Consequences

- Every ordinary Page and Article has exactly one Site owner; no record becomes
  Tenant-global or jointly owned merely to support reuse.
- Staff can start a related Page on another authorized Site without manual
  re-entry, but the result is immediately independent and never stays synced.
- Copying is gated on the canonical Phase 2/D1 Site substrate and one
  acknowledged exact source revision. No interim tenant-only duplicate is
  allowed.
- A finite versioned transfer manifest and target validation make copied,
  remapped, review-only, excluded, and incompatible content explicit.
- Paths, Navigation, assignments, schedules, publication, discovery, Trash,
  presentation, safety, and operational truth remain with their existing owners.
- One atomic idempotent command prevents partial targets, duplicate retries,
  silent overwrites, and resurrection through stale receipts.
- Target state is unmistakably private and repair-first. Copy has no public
  effect until the target Site and locale later pass their own D1 release.
- Native Payload duplicate and Copy-to-Locale behavior cannot bypass the Asym
  command; Payload remains a qualified replaceable adapter.
- This costs more validation, migration, conformance testing, and explicit repair
  behavior than raw JSON duplication, but avoids permanent cross-Site coupling
  and a much larger synchronization product.

## Rejected alternatives

- **Manual recreation only:** simple structurally, but needlessly burdens staff,
  encourages stale re-entry, and discards safe reusable editorial work.
- **Live Tenant-shared content with Site variants:** flexible, but requires a new
  identity, override, authorization, release-cohort, dependency, deletion,
  cache, migration, and failure model that current ministry demand does not
  justify.
- **Payload native Duplicate or Copy-to-Locale as product behavior:** document-
  shaped provider mechanics cannot preserve Asym's exact Site, locale, path,
  reference, safety, private-draft, and D1 release invariants.
- **Recursive, bulk, cross-environment, overwrite, merge, or synchronization
  commands:** these create a distribution platform rather than the bounded
  one-revision convenience established by D23.

## Activation boundary

Ratification records architecture only. A future authorized implementation must
prove exhaustive transfer-manifest coverage, exact-scope and non-enumerating
authorization, current-state revalidation, atomic/idempotent creation, path and
reference races, native-action suppression, exact Payload adapter conformance,
restartable Site migration, private/no-public-effect behavior, bounded-linear
maximum-Page performance, privacy-safe observability, and representative ministry
staff usability and accessibility across conflict, repair, collision, retry, and
uncertain-response scenarios.

## References

- [Phase 23 D23 research, exact formulation, adversarial review, and proof gates](../prds/sitestacker-parity/research/phase-23-d23-multisite-content-scope-decision-brief.md)
- [Phase 23 decision log](../prds/sitestacker-parity/phase-23-web-studio-cms-decision-log.md)
- [ADR-0145 — Page-local composition and coherent Site generations](./0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [ADR-0146 — Staged hierarchical public paths](./0146-staged-hierarchical-public-paths-under-coherent-site-generations.md)
- [ADR-0152 — Family-qualified semantic Reusable Sections](./0152-family-qualified-semantic-reusable-sections.md)
- [ADR-0153 — Certified Site-bound custom Presentation Packages](./0153-certified-site-bound-custom-presentation-packages.md)
- [ADR-0156 — Bounded working revisions and recoverable active editor](./0156-bounded-editorial-working-revisions-and-recoverable-active-editor.md)
- [ADR-0165 — Asym-owned recoverable Trash](./0165-asym-owned-reference-aware-recoverable-trash.md)
- [ADR-0166 — Bounded localized editorial profile](./0166-bounded-localized-editorial-profile-over-exact-locale-lineages.md)
- [Payload collection configuration](https://payloadcms.com/docs/configuration/collections)
- [Payload Local API access control](https://payloadcms.com/docs/local-api/access-control)
- [Payload transactions](https://payloadcms.com/docs/database/transactions)
- [Storyblok multi-space orchestration](https://www.storyblok.com/docs/manuals/multi-space-orchestration)
- [Contentful cross-space references](https://www.contentful.com/developers/docs/references/content-management-api/cross-space-references/)
- [Sanity cross-dataset references](https://www.sanity.io/docs/studio/cross-dataset-references)

Ratification of this planning decision authorizes no implementation, schema,
migration, dependency or provider adoption, issue publication, deployment, D1
activation, release, or production change.
