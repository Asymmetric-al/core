# ADR-0164: Bounded personal and Site-shared Saved Library Views over current authority

**Status:** Accepted (founder-ratified Phase 23 D20 C-prime-R, 2026-08-23)

## Context

Phase 23 needs a calm way for ministry staff to return to useful Content
Library filters, sort, and columns without repeatedly rebuilding the same lens.
D18 already owns private staff filing, D19 owns stable public-safe Topics, and
current record and field authorization owns what each actor may read. A Saved
Library View must compose those authorities without becoming permission,
workflow, publication, public search, or content truth.

Comparable CMS and CRM products support personal and shared saved views, but
their broad sharing matrices and provider-shaped query storage exceed this
launch need. Core's exact pinned Payload build stores Query Presets as raw
provider-shaped `where` and column JSON, offers an `Only Me / Everyone /
Specific Users` access model, fetches a bounded provider list without D1's
exact scope, suppresses several UI failures, and does not persist the advertised
sort in its pinned type. Payload Local API access also bypasses access control by
default unless an acting user is supplied with `overrideAccess: false`.

D20 therefore needs a small Asym-owned semantic product boundary: one protected
default, actor-owned private views, Site-owned shared views, exact scope, current
authorization on every apply, bounded query grammar, visible recovery, and a
replaceable provider adapter.

## Decision

> **C-prime-R — Bounded personal and Site-shared Saved Library Views over
> current authority.** Phase 23 shall provide one staff-only **Saved Library
> View** capability for the D18 Content Library, scoped to exactly one `Tenant ×
environment × Site × Content Library surface`. `Query Preset` is provider
> terminology and shall not appear in ordinary staff UX. A Saved Library View
> is only a reusable live lens over content the current actor may already read;
> it grants no record, field, family, folder, Topic, Site, locale, tenant,
> workflow, publication, export, bulk-action, or public-site authority and
> creates no operational or publication truth.
>
> The surface shall contain one protected code-owned **All content** view,
> actor-owned **My views**, and exact-Site-owned **Shared views**. **All
> content** means all Content Library records currently readable by the actor,
> never all tenant records. Authorized Content Library staff may create,
> rename, update, favorite, and delete their own views and may apply or save a
> personal copy of a shared view. One Phase 12 source-owned capability—not a
> role string or a view-defined ACL—shall be registered to govern shared-view
> create, rename, update, and delete; no exact capability exists today, so D20
> cannot infer one from broad staff roles. Shared views retain creator and
> last-editor attribution but remain Site-owned through staff offboarding.
> There shall be no team,
> role, individual-user, public-link, cross-Site, cross-environment, or
> tenant-global sharing matrix at launch.
>
> Each persisted view shall have an opaque never-reused identity, normalized
> scoped name, personal or Site ownership, semantic contract version, current
> compare-and-set revision, immutable creator attribution, last-editor
> attribution, and a typed provider-neutral definition. That definition shall
> reuse the Content Library's own supported filter surface rather than invent a
> second query builder: conditions are combined with `AND`; a typed condition
> may offer a bounded `any of` value set; arbitrary nested Boolean expressions,
> regular expressions, raw Payload `Where`, GraphQL, SQL, JSONPath, custom
> code, tenant-supplied operators, and provider field or column paths are
> forbidden. A view may save at most 10 filter conditions, at most 20 values in
> one `any of` condition, one stable allowlisted sort plus identity tie-breaker,
> and at most 12 ordered visible semantic columns. Stable D18 folder and D19
> Topic identities may be operands only after their owning contracts exist and
> are qualified.
> Source-owned relative-date tokens may be saved only with deterministic
> server-side Site-time-zone semantics.
> A shared view may contain only operands explicitly classified
> `site_shareable` by their source-owned catalog. The share dialog shall make
> clear that its name and saved choices become visible to authorized Site staff,
> even though underlying content access does not change.
>
> A definition shall never persist matching rows, record IDs, result counts,
> cursors, offsets, the current page, selected rows, pending commands, editor
> state, bulk actions, groupings, permissions, or free-text search. Applying a
> view clears pagination, selection, pending actions, and ephemeral search so
> one-off state cannot change its apparent meaning. The resulting status shall
> say when search was cleared. Staff may then use a
> visibly separate **Search within this view** refinement; it does not mark the
> view changed and is never saved. The save dialog shall say when a present
> search term will not be included.
>
> Every apply shall resolve the opaque view server-side from trusted actor and
> exact scope, validate its semantic version and operands, compile it through
> one provider adapter, and run the resulting list under current record and
> field authorization. Sharing a view never shares access. Names, operands,
> available choices, counts, previews, exports, and actions receive the same
> authorization treatment as results. URLs may contain only an opaque view ID
> and separately allowlisted safe list state—never the view name, free text,
> raw filters, or provider query—and private or wrong-scope links shall return
> one generic unavailable response without confirming existence.
>
> Invalid membership-affecting conditions, inaccessible operands, and unknown
> semantic versions shall fail narrow: show **Needs attention**, disclose no
> inaccessible name, and return no rows until repaired or reset. A removed
> presentation-only column may be omitted with the same visible warning, and an
> invalid sort may fall back to the explicit stable default sort, because
> neither changes membership. No invalid element may be silently dropped. Old
> supported versions shall remain readable through deterministic migrations;
> unsupported definitions shall be quarantined, never guessed.
>
> UX shall use one calm `View: <name>` selector beside Search and Filters—not a
> row of tabs. Its grouped, searchable picker shall show **Built in**, **Shared
> with <Site>**, and **My views**, with actor-local favorites first and no
> organization-wide reordering. Selection and per-view management actions
> shall be separate accessible controls. Desktop shall use Core's established
> Base UI popover/combobox pattern; narrow or highly zoomed layouts shall expose
> the same content in a dialog or sheet. **Save current view** shall show a
> compact human-readable summary, require a name, default to **Just me**, and
> show **Shared with <Site>** only to a shared-view manager with plain copy that
> sharing does not grant content access. No `scope`, `ACL`, `visibility`,
> `workspace`, or provider jargon shall be exposed.
>
> A changed saved definition shall show explicit text **View changed** and
> shall never auto-save. Personal actions are **Update my view**, **Save as a
> new view**, and **Reset changes**. Ordinary staff changing a shared view
> receive **Save as my view** and **Reset changes**; a manager additionally
> receives **Update shared view** with a compact change summary and the quiet
> warning that it updates the view for everyone who can use it. Shared updates
> use idempotency and compare-and-set. A conflict offers **Load latest** or
> **Save as my view** and never silently merges or reports last-write-wins as
> success. A newer shared definition shall not replace an actor's current
> results mid-task.
> Personal and shared ownership shall never convert in place. Sharing a
> personal view creates a new Site-owned copy; saving a shared view privately
> creates a new actor-owned copy. The source view remains unchanged unless the
> actor separately performs an authorized update.
>
> Applying a view shall preserve or restore focus on the selector, mark the
> result region busy while loading, atomically replace results on success, and
> announce a concise result or error status without moving focus into the list.
> Escape shall close the picker without applying the merely highlighted view.
> Save, update, clone, repair, reset, favorite, and delete shall work by
> keyboard, screen reader, touch, 200% zoom, and 320-CSS-pixel reflow with
> visible focus and Core touch targets. Loading, no-match, provider failure,
> invalid-definition, capability denial, cap, conflict, and success states
> shall be visually and programmatically distinct and never toast-only.
>
> Launch shall allow at most 20 personal views per actor per exact scope, 20
> shared views per exact scope, and five actor-local favorites across personal
> and shared views; code-owned views consume no quota. Limits shall be explained
> before exhaustion and link to one **Manage saved views** surface. Deleting a
> view deletes only the convenience lens and shall say plainly that no Page or
> Article is changed. Switching Site or environment resets to **All content**;
> no view or condition crosses scope. D20 adds no view descriptions,
> notifications, automatic seed rows, automatic defaults, drag ordering,
> per-view result badges, immutable view-history subsystem, D1 release step,
> public index, or conversion into D14 Dynamic Content Lists or D17 search.
>
> The product boundary shall be an Asym-owned typed Saved Library View store,
> semantic query compiler, command service, and custom Core UI. Payload Query
> Presets may be used only as a replaceable persistence implementation behind
> that provider-neutral adapter after the exact pinned build proves complete
> exact-scope CRUD, current-user
> authorization including `overrideAccess: false` where Local API acts for a
> user, scope-and-ownership filtering before pagination or limit, visible error
> handling, transaction and retry behavior, query compilation, migration,
> neutral export, and upgrade
> conformance. Direct exposure of `payload-query-presets`, its raw endpoints,
> its stock **Only Me / Everyone / Specific Users** constraint matrix, or its
> silent-failure UI is forbidden. The adapter shall emit privacy-safe
> cause-coded health for invalid definitions, scope denials, capacity,
> truncation, conflicts, query cost, and migrations without logging names,
> operands, search text, or raw definitions.

## Binding interpretation

1. **A Saved Library View is a convenience lens only.** It creates no access,
   content, folder, Topic, workflow, publication, release, public search,
   public-page, export, bulk-action, or operational authority.
2. **Scope is exact and immutable.** Every view belongs to one Tenant,
   environment, Site, and D18 Content Library surface. Switching Site or
   environment resets to the protected **All content** view.
3. **Launch has three quiet groups.** Code owns **All content**; an actor owns
   **My views**; the exact Site owns **Shared views**. The shared-view manager
   capability comes from Phase 12 and is not inferred from role strings.
4. **Sharing copies rather than converts.** A personal-to-shared action creates
   a new Site-owned view; a shared-to-personal action creates a new actor-owned
   view. The source remains unchanged.
5. **Definitions are typed and bounded.** The saved contract stores stable
   semantic filters, one stable sort plus identity tie-breaker, and ordered
   semantic columns. It never stores raw provider query state or volatile
   results, search, pagination, selection, commands, or permissions.
6. **Current access always wins.** Applying or previewing a view resolves it
   server-side under trusted scope and current record and field authorization.
   Shared visibility never grants content access or confirms hidden operands.
7. **Invalidity is impact-classified.** Membership-affecting invalidity fails
   narrow with no rows; missing presentation columns may be visibly omitted;
   an invalid sort may visibly use the stable default. Nothing is silently
   dropped, widened, guessed, or overwritten.
8. **Collaboration is explicit.** Definitions never autosave. Shared mutation
   uses idempotency and compare-and-set, with **Load latest** or **Save as my
   view** recovery instead of silent merge or last-write-wins.
9. **The UI remains one quiet control.** A grouped selector beside Search and
   Filters owns applying and finding views; management actions remain separate
   accessible controls and adapt to a dialog or sheet on narrow layouts.
10. **Payload is replaceable machinery.** Asym owns the store contract,
    semantic compiler, commands, authorization, UX, migration, and proof.
    Stock Payload Query Preset records, ACL choices, endpoints, and UI are not
    the product contract.

## Source-of-truth boundaries

| Fact                                                                                           | Authority after D20           | D20 rule                                                                |
| ---------------------------------------------------------------------------------------------- | ----------------------------- | ----------------------------------------------------------------------- |
| Saved Library View identity, ownership, bounded semantic definition, version, and CAS revision | D20                           | Provider-neutral exact-scope convenience state.                         |
| Current record, field, count, preview, export, and action eligibility                          | Existing authorization owners | Re-proved on every apply; never copied into a view.                     |
| Ordinary Page and Article identity and content                                                 | D6, D11, and D12              | Views reference live authorized content without becoming content truth. |
| Private staff filing and folder lifecycle                                                      | D18                           | Stable folder IDs may be qualified operands; D20 does not own folders.  |
| Topic identity, lifecycle, and shareable classification                                        | D19                           | Stable Topic IDs may be qualified operands; D20 does not own Topics.    |
| Shared-view management capability                                                              | Phase 12                      | One source-owned capability; no role-string or view-defined ACL.        |
| Dynamic public lists                                                                           | D14                           | No Saved view converts to or updates a Dynamic Content List.            |
| Public Site Search Projection                                                                  | D17                           | No Saved view enters public search or changes search eligibility.       |
| Site generations, releases, scheduling, and safety                                             | D1, D13, and Phase 10         | D20 has no release head, scheduled action, or public effect.            |
| Missionary, Project/Campaign, Ministry Update, directory, reach, and lifecycle records         | Phase 22                      | Specialized records remain outside the D18/D20 launch surface.          |
| Payload Query Preset schema and endpoints                                                      | Payload adapter               | Replaceable implementation detail after exact-pin conformance only.     |

## Consequences

- Ministry staff can save recurring personal work lenses and use a small set of
  Site-owned shared lenses without learning provider terminology.
- Sharing remains understandable: everyone with Site Content Library access may
  see and apply a shared definition, but each receives only currently authorized
  rows, fields, counts, previews, and actions.
- Staff see one grouped **View** selector rather than a noisy tab strip or
  separate dashboard. Save defaults to **Just me**; shared changes state their
  impact and never autosave.
- Search remains a visibly separate ephemeral refinement. Applying a view clears
  volatile state, announces what changed without stealing focus, and preserves a
  stable recovery path.
- Broken membership filters fail narrow. Presentation-only degradation remains
  visible without unnecessarily hiding otherwise authorized results.
- Site ownership lets shared views survive staff offboarding; personal views
  follow the actor lifecycle and are never transferred.
- The 20-personal, 20-shared, five-favorite, 10-condition, 20-any-of, one-sort,
  and 12-column ceilings prevent an accidental general query platform while
  leaving ordinary ministry workflows flexible.
- Exact-scope, privacy, authorization, concurrency, query-cost, migration,
  accessibility, and provider-drift proof become activation prerequisites.

## Rejected alternatives

- no Saved views, forcing staff to recreate repeated work;
- personal-only views, which force ministries to document or manually reproduce
  common queues;
- tenant-global, cross-Site, cross-environment, team, role, individual-user, or
  public-link sharing;
- using a saved view as permission, workflow, ownership, publication, release,
  public list, public search, folder, Topic, operational, or financial truth;
- raw Payload `Where`, provider paths, GraphQL, SQL, JSONPath, regex, formulas,
  scripts, arbitrary operators, or nested Boolean query builders;
- persisting rows, IDs, snapshots, counts, cursors, pages, selections, pending
  commands, bulk actions, free-text search, permissions, or editor state;
- personal/shared ownership conversion in place, shared definition autosave,
  implicit merge, or last-write-wins;
- silent removal of invalid conditions, silent sort fallback, provider-failure
  empty states, toast-only feedback, focus jumps, tab overflow, or mouse-only
  controls;
- per-view descriptions, notifications, result badges, custom shared ordering,
  full immutable view history, D1 release, or a second operational dashboard;
- direct exposure of `payload-query-presets`, its raw endpoints, stock sharing
  constraint editor, or silent-failure UI; and
- assuming Payload's privileged connection is Supabase-RLS-protected or using
  browser filters as authorization.

## Implementation proof gates

Implementation remains unauthorized by this ADR. A future authorized change
must prove at minimum:

1. Wrong-Tenant, wrong-environment, wrong-Site, wrong-actor, wrong-surface, and
   wrong-capability attempts cannot read or infer names, definitions, operands,
   counts, existence, previews, results, or mutations.
2. Two actors applying one shared view receive only their currently authorized
   records, fields, counts, previews, exports, and actions.
3. The bounded semantic grammar, stable IDs, normalized scoped names, old
   readers, deterministic migrations, neutral export, invalid quarantine, and
   rollback survive source rename, retirement, adapter replacement, and upgrade.
4. Membership-affecting invalidity fails narrow; missing columns and invalid sort
   degrade only as specified and visibly; no provider failure becomes a false
   empty result or widened query.
5. Personal and shared create, rename, apply, favorite, copy, update, repair,
   reset, delete, offboarding, cap, retry, lost-response, capability-revocation,
   and private-link paths are idempotent and correctly scoped.
6. Concurrent shared edits use compare-and-set, expose one recoverable conflict,
   never auto-replace an actor's in-progress results, and never report
   last-write-wins or partial work as success.
7. Trusted scope and authorization are applied before pagination and limits;
   allowlisted filters use indexed plans, stable sort and pagination, bounded
   relationship resolution, timeouts, and no N+1 behavior under production-
   shaped load.
8. URLs, referrers, analytics, logs, metrics, audit, and health contain no view
   names, free text, hidden operand labels, or raw definitions; wrong-scope and
   private IDs remain indistinguishable.
9. The exact pinned Payload schema, CRUD access, Local and REST behavior, UI
   fetch bound, error handling, query compilation, transaction, retry,
   migration, neutral export, and upgrade behavior pass a replaceable adapter
   conformance suite.
10. Applying, saving, sharing, updating, or deleting a view changes no content,
    access, workflow, folder, Topic, public list, release, cache, search
    projection, or public page.
11. Ministry staff complete apply, search-within, save, share, copy, update,
    conflict recovery, repair, reset, favorite, and delete on desktop and narrow
    layouts with keyboard, screen reader, touch, 200% zoom, 320-CSS-pixel
    reflow, visible focus, and non-toast status feedback.
12. Privacy-safe cause-coded health distinguishes scope denial, invalid
    membership, presentation degradation, provider failure, cap, truncation,
    conflict, query cost, and migration without creating a new launch
    operations dashboard.

### Exact conformance matrix

| Gate                     | Required evidence                                                                                                                                                                                                                                         | Rejects                                                                            |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Authority darkness       | Applying, sharing, updating, or deleting a view changes no content, access, workflow, folder, Topic, release, public search, cache, or public page.                                                                                                       | Saved view as permission, workflow, D14, or release authority.                     |
| Exact scope              | Wrong Tenant, environment, Site, actor, surface, and capability cannot read names, definitions, counts, apply, clone, update, or delete.                                                                                                                  | Browser filters and related-collection-only isolation.                             |
| Current access           | Two actors applying the same shared view receive only their currently readable records/fields/counts/actions.                                                                                                                                             | Shared view granting or leaking content.                                           |
| Semantic stability       | The 10-condition/20-any-of/one-sort/12-column grammar round-trips; folder/Topic rename preserves stable-ID meaning; membership invalidity fails no-rows; missing columns and invalid sort degrade only as visibly specified; unknown versions quarantine. | Silent condition drop, widened results, provider path as truth, guessed migration. |
| Payload exact pin        | Schema, CRUD/access, Local/REST, UI fetch bound, error handling, sort/search behavior, transaction, migration, and upgrade conformance pass at `4.0.0-internal.1f9ae9a`.                                                                                  | “Payload supports presets” as sufficient evidence.                                 |
| Personal lifecycle       | Create, rename, apply, favorite, clone, update, delete, actor offboarding, cap, retry, and private deep-link tests pass.                                                                                                                                  | Orphan or cross-user private visibility.                                           |
| Shared lifecycle         | Site ownership, manager capability, copy-not-convert sharing, ordinary Save as my view, shared CAS conflict, attribution/audit, delete copy, offboarding, and cap tests pass.                                                                             | Everyone/role/user ACL matrix, ownership conversion, and last-write-wins.          |
| Failure containment      | Provider/database/audit failure, timeout, lost response, invalid membership, presentation degradation, and scope-before-limit behavior are visible, retry-safe, and never return widened results or false success.                                        | Silent empty list, cross-scope truncation, and duplicate records.                  |
| Performance              | Allowlisted filters use indexed production-shaped plans, stable pagination/sort, bounded columns, timeouts, and no N+1 relationship resolution.                                                                                                           | Arbitrary queries and unbounded counts.                                            |
| Migration/export         | Provider-neutral round trip, old-reader retention, explicit semantic migration, invalid quarantine, and rollback pass.                                                                                                                                    | Raw `Where` lock-in.                                                               |
| Accessibility/usability  | Ministry staff complete save, share, clone, repair, reset, and delete on desktop/mobile with keyboard, screen reader, touch, zoom, and reflow; apply preserves selector focus while busy/status semantics communicate change.                             | Jargon, tab overflow, forced focus jump, toast-only, mouse-only interaction.       |
| URL and metadata privacy | URLs contain only opaque IDs and safe allowlisted state; names, free text, operands, and raw definitions stay out of URLs, referrers, analytics, and logs; wrong-scope/private IDs are indistinguishable.                                                 | Saved-view metadata or existence leaking across scopes.                            |
| Observability            | Cause-coded scope denial, invalid view, adapter failure, cap/truncation, migration, and query-cost health are actionable and privacy-safe.                                                                                                                | One generic CMS error or raw query logging.                                        |

Ratification of this planning decision authorizes no implementation, schema,
migration, dependency or provider adoption, issue publication, deployment, D1
activation, release, or production change.

## References

- [Phase 23 D20 research, provider qualification, nonprofit UX, adversarial review, and proof gates](../prds/sitestacker-parity/research/phase-23-d20-saved-library-views-research.md)
- [ADR-0145 — Page-local composition, bounded reuse, and coherent Public Site Generations](./0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [ADR-0158 — Versioned Dynamic Source Catalog and source-discriminated Content List](./0158-versioned-dynamic-source-catalog-and-content-list.md)
- [ADR-0161 — Derived Public Site Search Projection and adverse-first convergence](./0161-derived-public-site-search-projection-and-adverse-first-convergence.md)
- [ADR-0162 — Purpose-bounded, authority-free Content Library folders](./0162-purpose-bounded-authority-free-content-library-folders.md)
- [ADR-0163 — Versioned, release-bound Site Topic Profile and controlled Topic Sets](./0163-versioned-release-bound-site-topic-profile-and-controlled-topic-sets.md)
- [Payload Query Presets](https://payloadcms.com/docs/query-presets/overview)
- [Payload Local API access control](https://payloadcms.com/docs/local-api/access-control)
- [Payload Query Preset types at Core's exact pin](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/query-presets/types.ts)
- [Payload Query Preset UI at Core's exact pin](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/ui/src/elements/QueryPresets/QueryPresetBar/index.tsx)
- [Contentful search and content organization](https://www.contentful.com/help/faq/search-and-content-organization/)
- [Contentstack shared views](https://www.contentstack.com/docs/headless-cms/shared-views)
- [HubSpot saved views](https://knowledge.hubspot.com/records/create-and-manage-saved-views)
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- [WCAG 2.2 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- [Phase 22 specification PR #1323](https://github.com/Asymmetric-al/core/pull/1323)
