# Phase 23 D20 — Saved Library Views research and decision brief

- **Status:** Founder-ratified and adversarially hardened as Phase 23 D20 on
  2026-08-23.
- **Date:** 2026-08-23
- **Decision under review:** Whether and how staff may save reusable Content
  Library queries (the original prompt calls these **Query Presets**).
- **Recommended staff term:** **Saved view**. `Query Preset` remains an adapter
  or provider term, not product language.
- **Scope:** The D18 staff-only Content Library for the D6 ordinary Page and
  Article families.
- **Explicitly separate later decisions:** Trash/restore/retention/permanent
  deletion, forms, generalized media, broader SEO, locale rollout, and
  implementation ticket slicing.
- **Mutation authorization:** Planning documentation only. Ratification changes
  the Phase 23 decision log and ADR-0164, but authorizes no schema, dependency,
  code, issue, release, deployment, or production change.

## Executive verdict

The next unresolved Phase 23 decision is **Query Presets**, presented in Web
Studio as **Saved views**. D18 settled private folders and D19 settled public
Topics; neither lets staff preserve a useful combination of filters, sort, and
columns for repeated work.

The strongest proportional answer is **Option C-prime: bounded personal and
Site-shared Saved Library Views over one typed, provider-neutral query
contract**.

This should remain small:

1. one protected code-owned **All content** view;
2. private **My views** owned by the current actor;
3. **Shared views** owned by the exact Site and usable by staff who already have
   access to that Site's Content Library;
4. one allowlisted semantic query grammar for filters, stable sort, and visible
   columns;
5. a launch ceiling of 20 personal and 20 shared views per exact Site and
   Content Library scope, plus five actor-local favorites; and
6. explicit save, clone, repair, and delete actions with no per-view role/user
   ACL builder, D1 release, public effect, or full version-history subsystem.

A Saved view is only a reusable lens. It must never grant access, save record
IDs, freeze a result set, publish content, alter folders or Topics, or become a
public query. Every use re-evaluates the saved intent against current content,
current actor authorization, and current source-owned facts.

The important architectural correction is not to expose Payload's generated
`payload-query-presets` record as Asym's product contract. Payload 4 provides a
useful list-view adapter, but its stock record stores provider-shaped query JSON
and per-record sharing constraints and has no native Tenant × environment ×
Site authority. Core needs one product boundary in front of it, plus
exact-version qualification, whether the final storage uses that collection or
an Asym-owned table.

## Why this is the next unresolved decision

The Phase 23 source prompt orders the remaining Content Library concerns as:

1. folders;
2. tags/taxonomies;
3. Query Presets; and
4. Trash.

D18 ratified purpose-bounded, authority-free Content Library folders. D19
ratified one versioned, release-bound Site Topic Profile. The current decision
log explicitly records that D1–D19 do not yet decide Query Presets, then lists
Trash and the later subjects. D20 should therefore decide the reusable staff
view layer and should not jump ahead into deletion or retention.

## How a missions ministry would actually use this

### Scenario 1 — A communications coordinator repeats the same cleanup

Each Monday a coordinator checks **Articles · Unfiled · Updated recently** and
shows title, locale readiness, last updated, and assignment. Reconstructing the
same filters and columns every week is needless work. They save it as **My
Monday cleanup** and return in one step.

The view saves the query intent, not Monday's records. New matching Articles
appear automatically; records that no longer match disappear automatically.

### Scenario 2 — A ministry standardizes a useful queue without creating a

permission system

A communications lead creates **Pages missing Topics** and shares it with the
Site. Other authorized staff can use it and can adjust it temporarily. They can
choose **Save as my view**, but cannot overwrite the Site-shared definition
unless they hold the source-owned capability to manage shared views.

Sharing the view does not grant access to any Page or Article. A staff member
sees only records already readable under current authorization. The UI says
this plainly at share time.

### Scenario 3 — A Topic is retired or a folder disappears

A personal view filters on a D19 Topic that is later retired, or on a D18
folder that is later removed through its owning lifecycle. Silently deleting
that filter would widen the result set and could expose a list the author did
not intend to see.

The view instead opens in **Needs attention**, returns no records, identifies
the unavailable condition in plain language, and offers **Edit view** or
**Reset to All content**. It never silently broadens.

### Scenario 4 — Staff leave the organization

Personal views disappear from normal use with their actor ownership. Shared
views remain Site-owned and retain creator/last-editor attribution, so
offboarding one staff member does not orphan a ministry-wide workflow. A shared
view that is no longer useful can be removed by an authorized manager; deleting
it never deletes content.

### Scenario 5 — One staff member sends another a link

Applying a Saved view produces canonical URL-backed view state. Another
authorized staff member can open a shared-view link and gets the current result
under their own access. A personal-view link opened by anyone else behaves as
unavailable without confirming that the private view exists.

## Authority already settled by D1–D19

D20 composes with and cannot reinterpret:

- **D1:** exact Tenant × environment × Site × locale publication authority,
  immutable Public Site Generations, and serving-head CAS;
- **D6:** the only ordinary content families are Page and Article;
- **D12:** recoverable editorial working revisions and the active-editor
  contract;
- **D13:** exact-revision scheduled publication;
- **D14–D16:** source-qualified Dynamic Content Lists, Page-local curation, and
  public window navigation;
- **D17:** the derived public Site Search Projection;
- **D18:** one staff-only, authority-free Content Library folder system; and
- **D19:** stable Topic IDs, controlled Topic Sets, and public-discovery
  classification.

Phase 10 remains the publication and restricted-ministry safety ceiling. Phase
12 or another already-owned authorization source must grant staff capabilities.
Phase 22 retains all authority for Missionary Ministry Pages,
Project/Campaign Pages, Ministry Updates, their directory, contributors,
routes, reach, safety, and lifecycle.

D20 supplies none of those authorities. In particular, a Saved view:

- grants no record, field, folder, Topic, Site, locale, or tenant access;
- changes no Page, Article, Editorial Revision, placement, route, Navigation,
  folder assignment, Topic assignment, release, schedule, search projection,
  public cache, or public page;
- owns no workflow state, review decision, task, notification, assignment,
  retention, Trash, or deletion policy; and
- is never accepted as evidence that content exists, is safe, is public, or is
  eligible for publication.

## Current repository evidence

### Web Studio already has a dormant provider seam

Core pins both `payload` and `@payloadcms/ui` to
`4.0.0-internal.1f9ae9a` in the root and Admin package manifests.

`NativeCollectionListView.tsx` already accepts Payload's `QueryPreset` and
`queryPresetPermissions`, passes them into `ListControls`, and disables the
control unless `collectionConfig.enableQueryPresets === true`. No current CMS
collection enables that flag. This is a useful integration seam, not evidence
that D20 already exists.

Exact local evidence:

- `package.json:230,232` and `apps/admin/package.json:44,64` pin
  `@payloadcms/ui` and `payload` to `4.0.0-internal.1f9ae9a`.
- `apps/admin/src/cms-ui/web-studio/collections/shared/list-workspace/NativeCollectionListView.tsx:36,58,65-66,237-243`
  imports Payload's `QueryPreset`, accepts preset state and permissions, and
  passes them to `ListControls` only when the collection configuration enables
  the feature.
- `apps/admin/src/cms/collections/pages.ts:42-79` defines a Tenant relationship
  and Tenant-scoped CRUD but no final D1 environment-and-Site key.
- `apps/admin/src/cms/collections/cms-users.ts:17-54` has Tenant-scoped user
  access and broad `staff`/`admin`/`super_admin` roles; it does not provide a
  D20 shared-view capability and must not be treated as one.

The current Page collection has a tenant relationship but not D1's complete
environment and Site authority. Enabling the provider switch now would create
a broader, under-scoped record model. D20 cannot activate before the D1 and D18
scope is real.

### Payload's generated record is provider-shaped

The exact installed/upstream pin defines a generated hidden
`payload-query-presets` collection. Its record stores a title, raw `where` JSON,
provider column JSON, optional `groupBy`, the related collection, and
operation-specific access constraints. It does not natively model D20's exact
Tenant × environment × Site scope, a provider-neutral semantic query version,
or Site ownership.

The stock constraints are separately configurable for read, update, and
delete, with defaults such as **Only Me**, **Everyone**, and **Specific Users**.
That is flexible Payload infrastructure, but exposing it directly would create
an unnecessary per-view ACL product and make permission mistakes easy.

The exact pinned Query Preset UI also deserves qualification rather than blind
adoption:

- its popup fetches no more than 50 provider presets;
- fetch, save, and delete failures are caught without a complete Core-owned
  recovery experience;
- applying a preset restores provider `where`, columns, and `groupBy`; and
- the exact pinned type/UI does not persist search text or sort even though the
  current public documentation describes saved filters, columns, and sort
  orders.

That documentation/source difference is not a reason to reject Payload. It is
a reason to pin conformance tests and keep Asym's semantic contract independent
of one internal provider build.

Exact provider evidence:

- [Payload Query Presets documentation](https://payloadcms.com/docs/query-presets/overview)
- [Pinned Query Preset configuration source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/query-presets/config.ts)
- [Pinned Query Preset access source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/query-presets/access.ts)
- [Pinned Query Preset type source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/query-presets/types.ts)
- [Pinned Query Preset UI source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/ui/src/elements/QueryPresets/QueryPresetBar/index.tsx)

### Existing Support Hub is a UX precedent, not the authority model

Support Hub already demonstrates a useful interaction pattern: URL-backed list
state plus a **Save view** dialog offering personal or workspace scope. That
supports discoverability and deep-linking. Its current persistence and
authorization model is not automatically suitable for D20 because its
saved-view scope is Tenant-oriented and caller ownership is shaped by that
domain.

Exact local evidence:

- `apps/admin/features/support-hub/components/views/SaveViewDialog.tsx:48-55,60-87,90-160`
  defaults to personal scope and uses a clear dialog, but its domain-specific
  **Whole workspace** option, saved free-text query, and toast-only outcomes are
  not the D20 contract.
- `packages/database/collections/support-hub.ts:343-362` persists a Support Hub
  filter schema with `q`, labels, assignee, and only Tenant ownership.
- `packages/api/src/admin/support-hub/adapter/supabase.ts:1030-1050` uses the
  Support Hub's own Tenant-scoped list/upsert/delete adapter.
- `apps/admin/features/support-hub/types/route-state.ts` and
  `apps/admin/features/support-hub/lib/route-state.ts` are the reusable precedent
  for typed URL state, not authorization or D20 persistence authority.

D20 should reuse Core's language, Base UI controls, typed URL-state habits, and
responsive interaction patterns, while using the D1/D18 authority boundary and
a narrower sharing model. It must not copy literal control sizes, hover-only
actions, toast-only outcomes, free-text persistence, or Tenant-only ownership
from an adjacent domain merely because the interaction looks similar.

## Current primary-product evidence

Research was refreshed on **2026-08-23** against current official product
documentation and, for Payload, the exact source commit pinned by Core. Product
examples establish patterns, not authority: Core still needs a smaller contract
that fits its Site scope and ministry workflows.

| Product/source                                                                                                                                                       | Current behavior or guidance                                                                                                                                                          | D20 implication                                                                                                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Payload Query Presets](https://payloadcms.com/docs/query-presets/overview)                                                                                          | Current docs describe saved filters, columns, and sort orders plus configurable access; the exact Core-pinned type/UI saves `where`, columns, and grouping but does not persist sort. | Treat current docs as upstream direction and the exact pin as runtime truth. Use the adapter seam, but do not expose raw provider query JSON or the stock ACL matrix. |
| [Contentful saved views](https://www.contentful.com/help/faq/search-and-content-organization/)                                                                       | Saved views preserve useful searches; critically, sharing a view changes link visibility and **does not change content permissions**. Removed role links can require cleanup.         | Make “view sharing is not record access” an invariant and avoid role-linked launch sharing that creates orphan cleanup.                                               |
| [Contentstack shared views](https://www.contentstack.com/docs/headless-cms/shared-views)                                                                             | Distinguishes view and edit access; viewers can alter then save as a new view; editor changes affect collaborators.                                                                   | Give ordinary staff “Save as my view”; reserve shared-view mutation for a capability-holder. Avoid a per-view collaborator matrix.                                    |
| [HubSpot saved views](https://knowledge.hubspot.com/records/create-and-manage-saved-views)                                                                           | Provides protected/default and custom views, personal pinning, cloning, explicit visibility, and states that deleting a view does not delete records.                                 | Keep All content protected, pinning personal, clone before editing shared state, and make non-destructive deletion unmistakable.                                      |
| [Directus presets and bookmarks](https://docs.directus.io/user-guide/settings/presets-bookmarks)                                                                     | Separates default collection presets from personal bookmarks.                                                                                                                         | Keep code-owned defaults distinct from personal and Site-shared records.                                                                                              |
| [Salesforce list-view guidance](https://help.salesforce.com/s/articleView?id=xcloud.basics_understanding_list_views_lex.htm&language=en_US&type=5)                   | A list view shows records the actor already has permission to see. Shared-list-view management is a separately governed capability.                                                   | Resolve every Saved view under current record access and separate shared-view management from ordinary use.                                                           |
| [Microsoft Dynamics saved views](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/get-started/saved-views)                                       | Uses explicit save, a visible modified indicator, and **Save as** for a personal copy when a published view is locked; it does not silently auto-save changes.                        | Show a clear changed state; make update, personal copy, and reset deliberate actions; never replace an active view mid-task.                                          |
| [WAI-ARIA Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) and [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) | A selection control must expose its value and predictable Escape behavior; async status can be announced without moving focus.                                                        | Use one real combobox/popover model, preserve focus on apply, mark results busy, and announce concise status rather than shifting focus.                              |

The repeated industry pattern is useful but not a mandate to reproduce every
sharing feature. Personal views, curated shared views, cloning, and current
record authorization solve the ministry use case. Teams, arbitrary users,
roles, and separate read/update/delete policies per view would add setup burden
without proportionate launch value.

## The exact decision to make

> **How much Saved-view capability should the D18 Content Library provide at
> launch, and who may reuse or change a saved query?**

### Option A — Filters only; no Saved views

Staff use the current Content Library filters, search, sort, and columns, but
cannot name or reopen a configuration.

**Benefits**

- smallest persistence and authorization surface;
- no shared-view lifecycle; and
- no Payload Query Preset dependency.

**Costs**

- repeated ministry workflows must be rebuilt by hand;
- useful organizational lenses stay tribal knowledge; and
- staff create browser bookmarks or spreadsheets as unofficial workarounds.

**Verdict:** Safe but too austere for a serious CMS.

### Option B — Personal Saved views only

Each staff member can save private Content Library views for the exact Site.
No view can be shared.

**Benefits**

- removes repetitive personal setup;
- simple ownership and lifecycle; and
- lower risk than collaborative view editing.

**Costs**

- every staff member recreates common ministry queues;
- administrators cannot provide a calm, consistent starting point beyond
  hard-coded defaults; and
- staff still share screenshots or verbal filter recipes.

**Verdict:** A credible minimum, but it leaves a real collaboration gap.

### Option C-prime — Bounded personal and Site-shared Saved Library Views

Provide one code-owned protected default, actor-owned private views, and
Site-owned shared views. Everyone with Content Library access may apply shared
views; a source-owned capability governs shared creation, update, and deletion.
Other staff can modify the current lens temporarily and choose **Save as my
view**.

**Benefits**

- personal convenience and ministry-wide consistency;
- one-step return to common work without copying filters;
- clean offboarding because shared views are Site-owned; and
- enough flexibility without a team/user/role sharing matrix.

**Costs**

- requires exact scope, typed query migration, capability enforcement,
  collision handling, and lifecycle UX;
- shared changes need clear impact language and optimistic concurrency; and
- the Payload adapter must be qualified rather than simply switched on.

**Verdict:** **Recommended**, with the bounded hardening below.

## Exact founder-ratified C-prime-R formulation

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

This is the founder-ratified Phase 23 D20 wording. The decision log and ADR-0164
are authoritative; the remaining sections explain and pressure-test it without
expanding its scope.

## Recommended C-prime-R contract

### 1. Exact scope and identities

There is one staff-only Saved Library View kind for the exact:

`Tenant × environment × Site × Content Library surface`

The launch Content Library surface spans the D6 Page and Article families. A
personal view additionally has one authenticated actor owner. A shared view is
owned by the Site, not by its creator, and records immutable creator plus
last-editor attribution.

Every persisted view has an opaque never-reused identity, normalized display
name, semantic query-contract version, current compare-and-set revision, scope,
kind (`personal` or `site_shared`), and typed definition. Names are unique after
Unicode normalization within the same owner/kind/scope. Identity never derives
from a mutable name.

Code-owned defaults such as **All content** are configuration, not tenant rows.
They cannot be renamed, overwritten, or deleted. Additional defaults may be
added only when the owning source fact really exists; D20 must not invent
workflow states to make a richer demo.

### 2. A typed semantic definition, not raw provider state

The definition may contain only:

- up to 10 allowlisted semantic filter conditions combined with `AND`, where
  a condition may use one bounded `any of` set containing at most 20 typed
  values;
- one stable allowlisted sort key and direction, with a stable identity
  tie-breaker; and
- up to 12 ordered visible semantic column keys from the code-owned D20
  catalog.

The 10-condition ceiling follows a mature list-view precedent. The 20-value
and 12-column ceilings are explicit launch product bounds to keep the editor,
URL state, reflow, and query plans understandable; they are not claimed as
cross-vendor standards. They may increase only after measured usability and
production-shaped performance proof. This is the existing Content Library
filter grammar made reusable, not a second or more powerful query builder.

Eligible filter operands may include source-owned Page/Article family, current
authoritative editorial/publication facts, D18 folder identity, and D19 stable
Topic identity only after those facts are implemented and qualified. The query
compiler maps semantic keys to the exact provider schema. Product records never
store raw Payload field paths as meaning.

The definition does **not** save:

- selected rows, record IDs, a result snapshot, total count, cursor, offset, or
  current page;
- a pending bulk action, destructive command, publication command, or editor
  state;
- arbitrary Payload `Where`, GraphQL, SQL, JSONPath, custom code, or tenant-
  supplied operator;
- provider column paths or internal relationship shape;
- `groupBy` at launch; or
- ephemeral free-text search input.

Excluding search text is deliberate. Search terms often contain transient
names or sensitive fragments, grow stale quickly, and are not stored by the
exact pinned Payload type/UI. Applying a view clears any prior one-off search
and labels the separate refinement **Search within this view**. Staff can then
search without marking the view changed. The save dialog warns when a current
search will not be included. A later additive contract may save search only
with separate evidence; it is not silently smuggled into D20.

### 3. Current authorization always wins

Applying a Saved view resolves scope and reads content under the current actor,
current capabilities, current field redaction, and current record access. The
view may narrow records but can never widen authorization. Counts, available
filter values, previews, exports, and bulk-action eligibility use the same
current access boundary.

The server derives Tenant, environment, Site, surface, and actor from trusted
context. Browser-supplied IDs, URL parameters, provider filters, hidden fields,
or view contents are never authorization.

Shared view visibility means only: **authorized staff in this exact Site can
see and apply this query definition**. The save dialog says:

> Anyone who can open this Site's Content Library can use this view. It does
> not give anyone access to content.

### 4. Small sharing model

At launch:

- ordinary authorized staff may create, update, rename, favorite, and delete their
  own personal views;
- all authorized Content Library staff may apply Site-shared views and clone
  them with **Save as my view**;
- one Phase 12 source-owned capability governs creating, renaming, updating,
  and deleting Site-shared views; and
- there are no team, role, individual-user, public-link, cross-Site, tenant-
  global, or cross-environment sharing choices.

The product contract names the capability semantically but does not invent a
Phase 12 key in this decision. Phase 12 must register the exact capability
before D20 activation; none currently exists. Role-string checks in Payload or
client code are not acceptable substitutes.

### 5. Deliberate capacity

Allow at most:

- 20 personal views per actor in the exact Site/Content Library scope; and
- 20 Site-shared views per exact Site/Content Library scope; and
- five actor-local favorites across personal and shared views.

Code-owned defaults do not consume the bound. These are launch guardrails, not
pricing controls. They keep discovery calm. They do **not** make the pinned
Payload UI's 50-row request a valid scope boundary: exact scope and ownership
must be filtered before pagination or limit. The UI shows the bound before the
last slot and gives clear rename/delete choices; it never fails with an
unexplained provider error. Product evidence can justify a later additive
increase.

### 6. Calm, explicit UX

Use one **View: <name>** selector beside Search and Filters—not tabs, a second
navigation rail, or a toolbar full of saved names. Its responsive picker has
three short groups:

1. **Built in** — protected code-owned **All content**;
2. **Shared with <Site>** — Site-owned views; and
3. **My views** — the current actor's private views.

Favorites are actor-local shortcuts shown first inside their owning group;
there is no organization-wide order, drag-and-drop, or custom default. The
picker becomes searchable only when its bounded contents no longer scan
comfortably. Desktop uses Core's Base UI popover/combobox semantics; narrow or
highly zoomed layouts use a dialog or sheet with the same groups. View selection
and per-view actions are separate controls so a hybrid menu keyboard model is
never invented.

The active view name is always visible. If the user changes a saved filter,
sort, or column, the interface shows **View changed** beside it. Ephemeral
**Search within this view** remains visible but does not mark the view changed.
No definition auto-saves.

**Save current view** appears only after a meaningful supported change. The
dialog presents a compact human-readable summary, asks for a short name, and
defaults to **Just me**. **Shared with <Site>** appears only to a shared-view
manager and includes the non-permission explanation above. No scary legal copy,
`scope`, `ACL`, `visibility`, `workspace`, or provider jargon is needed.

For a personal view, actions are **Update my view**, **Save as a new view**, and
**Reset changes**. For a shared view, ordinary staff receive **Save as my view**
and **Reset changes**. A shared-view manager also receives **Update shared
view**, with the quiet impact label **Updates this view for everyone who can use
it**. Personal and shared ownership never convert in place: sharing a personal
view creates a new Site-owned shared copy, and saving a shared view privately
creates a new actor-owned personal copy. This keeps ownership, attribution,
capabilities, links, and concurrent edits unambiguous.

Loading, no saved views, no matching content, at limit, invalid definition,
unavailable private link, insufficient capability, save conflict,
offline/transient failure, provider failure, and success are distinct,
persistent, recoverable states. Applying a view preserves or restores focus on
the selector, marks results `aria-busy`, and announces one concise status
without moving focus into the results. Success and errors are never toast-only.

### 7. URL state and links

Applying a view writes only its opaque ID plus separately allowlisted safe list
state to the URL so refresh and back/forward are predictable. The URL never
contains the view name, free-text search, operands, raw filters, or provider
query. The server resolves that ID from trusted actor and exact Site scope. A
personal or wrong-scope link returns one generic unavailable state without
leaking its name, filters, owner, or existence, including through logs,
analytics, or referrer headers.

Changing filters, sort, or columns does not rewrite the persisted definition;
the visible **View changed** state distinguishes the loaded base revision from
local overrides. Switching Site or environment clears the view ID and all
local list state to **All content**. Reload and back navigation must never imply
that an unsaved definition was persisted.

### 8. Stale and invalid definitions fail narrow

Every semantic key and operand is validated when saved and again when applied.
If a folder, Topic, membership-affecting field/operator/operand, or semantic
version becomes unavailable, unauthorized, retired, or unreadable, the system
must not silently remove it. Silent removal can broaden the result set. Mark
the view **Needs attention**, return no rows, identify the broken condition
without exposing inaccessible data, offer **Edit view** when authorized, and
always offer **Reset to All content**.

Presentation-only invalidity is safer to degrade rather than blank the list. A
removed column is visibly omitted and an invalid sort visibly falls back to the
explicit stable default plus identity tie-breaker; both retain **Needs
attention** until repaired. Neither case may silently change membership or
pretend the stored definition is healthy.

Supported older semantic versions remain readable during migration. Migration
is explicit and testable; it cannot reinterpret a saved condition by guessing
at a renamed provider field.

### 9. Safe lifecycle and concurrency

Personal and shared view saves use one idempotency key and expected revision.
Concurrent updates use compare-and-set. On conflict, the later editor sees that
the view changed and may reload or save their current definition as a personal
view; last-write-wins is not presented as success.

Deleting a view deletes only that convenience lens. The confirmation says
**This removes the saved view. It does not delete or change any content.** A
shared delete requires the shared-view capability and explicit confirmation.
`All content` is undeletable.

Full immutable content-style version history would be overengineering. Keep a
stable view identity, current CAS revision, and privacy-safe audit receipt for
shared create/update/delete. Recovery from an accidental shared edit is a new
explicit save or clone, not a second publication system.

### 10. Provider boundary

Payload may persist or render parts of this behavior only behind an adapter
that proves:

- exact Tenant × environment × Site scoping on every read, count, create,
  update, and delete;
- actor ownership for personal views and capability-gated Site ownership for
  shared views;
- typed semantic compilation to and from the exact pinned provider shape;
- current record access after the view is applied;
- no raw Query Preset endpoint, Local API bypass, or direct Admin UI grants a
  broader path;
- any user-local Local API call carries the authenticated request/user and
  explicitly uses `overrideAccess: false`;
- visible Core-owned error, conflict, loading, and recovery states;
- exact scope and ownership are applied before pagination or any 50-row limit,
  so another scope cannot consume or truncate the current scope's result; and
- dependency upgrades cannot silently change saved meaning.

The product truth is an Asym-owned typed store, query compiler, command boundary,
and custom Core UI. Payload Query Presets are at most a replaceable persistence
implementation behind that boundary. The stock record, endpoints, access
matrix, and UI are not D20 product surfaces. The current pin lacks native Site
and environment scope, semantic schema version, compare-and-set revision, and
persisted sort; its UI requests 50 rows, disables locking, and silently catches
several failures. Support Hub is likewise only a language/interaction precedent:
its Tenant-only, caller-shaped owner/scope path is not an authorization or
storage blueprint.

Payload's privileged PostgreSQL connection must never be described as
Supabase-RLS-protected. Structural exact-scope constraints, server-derived
identity, command authorization, optimistic concurrency, and negative isolation
tests back the product boundary.

## Ruthless adversarial review

| Category                          | Material concern? | What could go wrong and why it matters                                                                                                                                                                                   | Severity    | Likelihood without hardening | Evidence/reasoning                                                                                                                                                                | Permanent prevention                                                                                                                                                            |
| --------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | **Yes**           | Raw provider field paths, removed folders/Topics, or changed operators can make a Saved view fail or—worse—silently broaden.                                                                                             | High        | High                         | Payload stores provider-shaped `where` and columns; D18/D19 references have independent lifecycles.                                                                               | Store versioned semantic keys and stable IDs; validate on save/apply; fail narrow with repair UX; retain old readers.                                                           |
| Technical debt                    | **Yes**           | Turning on `enableQueryPresets` and exposing the generated record would spread Payload JSON, stock UI assumptions, and ACL semantics through product code.                                                               | High        | High                         | Current Core only plumbs the dormant UI seam; provider rows lack exact Site/environment scope, semantic version, CAS, and persisted sort.                                         | One Asym-owned typed store/command/compiler boundary, custom Core UI, conformance tests, and no raw provider imports outside the adapter.                                       |
| Edge cases                        | **Yes**           | Offboarded owners, duplicate normalized names, private deep links, retired operands, column/sort removal, ownership conversion, concurrent edits, cap exhaustion, and Site switches can confuse or corrupt expectations. | Medium–High | High                         | Comparable products expose ownership, cloning, sharing, and orphan-cleanup behaviors; D18/D19 add real operand lifecycles.                                                        | Site-own shared views; actor-own personal views; copy rather than convert; normalization, CAS, caps, generic unavailable state, tiered invalidity, and exhaustive state tests.  |
| Footguns                          | **Yes**           | “Everyone” sharing, per-operation ACLs, silent shared updates, raw query editing, or ambiguous Delete can expose definitions, overwrite team workflows, or be mistaken for deleting content.                             | High        | Medium–High                  | Payload defaults include Everyone/Specific Users separately for read/update/delete; modern products warn that view deletion is non-content deletion.                              | Only Just me/Site; capability-gated shared mutation; explicit impact and delete copy; clone path; no raw JSON or ACL builder.                                                   |
| Tenant safety                     | **Yes**           | A provider query scoped only by related collection can leak another tenant/Site's view name, filters, counts, Topic IDs, or content.                                                                                     | Critical    | Medium                       | Generated Payload Query Presets have no native Tenant/environment/Site columns; current Pages lack final D1 Site scope.                                                           | Trusted server-derived exact scope, structural same-scope constraints, negative isolation tests, privacy-safe errors, and no activation before D1/D18 authority.                |
| Overengineering                   | **Yes**           | Team/role/user sharing, per-operation ACLs, D1 releases, immutable view histories, arbitrary grouping, and cross-Site libraries create more administration than value.                                                   | Medium      | High                         | Payload can express a much broader matrix; enterprise comparables expose many options, but the ministry need is personal reuse plus a few shared queues.                          | One default + personal + Site-shared model; one capability; no release, groupBy, cross-Site, or per-view ACL matrix at launch.                                                  |
| UX/UI and user friction           | **Yes**           | “Query Preset” jargon, crowded tabs, hidden unsaved overrides, forced focus jumps, unexplained limits, and toast-only failure make staff distrust or abandon the feature.                                                | High        | High                         | HubSpot/Contentful/Contentstack use saved-view language and explicit clone/update patterns; Dynamics exposes modified state; WAI guidance supports status without focus movement. | One grouped `View: <name>` picker; explicit **View changed**; separate actions; responsive sheet; preserve selector focus; persistent recovery; ministry-staff usability tests. |
| Hidden coupling                   | **Yes**           | A Saved view could accidentally become a permission, workflow queue, Dynamic List, publication candidate, or public search definition.                                                                                   | High        | Medium                       | The same filter language can look reusable across D14, D17, permissions, and staff lists even though those have different authorities and safety obligations.                     | Explicit authority-negative contract; separate consumer types; no conversion or shared storage with D14/D17; current-access evaluation every time.                              |
| Failure modes                     | **Yes**           | Provider fetch/save/delete may fail silently, a stale view may open blank, a transient apply may erase useful results, or a lost response may duplicate a row.                                                           | High        | Medium–High                  | The exact pinned Payload UI catches failures without Core's required recovery and fetches a bounded list.                                                                         | Keep last valid results on transient apply failure with Retry; use visible states, idempotency, CAS, timeout telemetry, and fail-narrow membership errors.                      |
| Data integrity risks              | **Yes**           | Duplicate names, invalid operands, orphaned ownership, in-place ownership conversion, partial scope writes, and ambiguous migrations can create misleading views.                                                        | High        | Medium                       | Provider JSON is weakly semantic; multiple source-owned lifecycles can invalidate references; personal and Site ownership have different command rights.                          | Normalized scoped uniqueness, typed validation, copy-not-convert ownership, Site-owned shared records, atomic writes/audit, and explicit contract migrations.                   |
| Security and privacy risks        | **Yes**           | Even when records remain protected, a saved name, URL, operand, filter, restricted Topic/folder, staff name, workflow state, or content count can reveal sensitive ministry facts.                                       | High        | Medium                       | Contentful explicitly separates view visibility from record permissions; metadata itself can leak meaning through UI, analytics, referrers, and logs.                             | Same access on definitions/results, allowlists, opaque-ID URLs, generic unavailable state, privacy-safe telemetry, no raw URL/log data, and no saved search text.               |
| Scalability and performance risks | **Yes**           | Unlimited views and expensive predicates can overwhelm discovery, exceed provider limits, let another scope consume a 50-row fetch, or trigger slow counts and relationship joins.                                       | Medium–High | Medium                       | The pinned Payload UI requests 50 before Core has exact Site semantics; list count badges and broad relationship filters multiply query cost.                                     | Filter exact scope/owner before pagination or limit; 20+20 caps, 5 favorites, indexed predicates, stable sort, bounded columns, no per-view counts, budgets, and plan tests.    |
| Operational burden                | **Yes**           | Shared-view clutter, role-linked orphan records, stale filters, and unclear ownership create periodic administrator cleanup.                                                                                             | Medium      | High                         | Contentful documents stale role associations; broad sharing systems require ownership transfer and management.                                                                    | Site ownership, one manager capability, invalid/unused health, one simple Manage saved views surface, delete/repair actions, and no role/user sharing graph.                    |
| Observability gaps                | **Yes**           | Silent adapter errors, truncation, invalid semantic versions, or cross-scope denials may look like “no content.”                                                                                                         | High        | Medium–High                  | Pinned provider UI catches failures; empty and unavailable states are otherwise visually similar.                                                                                 | Cause-coded metrics and audit receipts, invalid-view health, cap/truncation alarms, privacy-safe scope-denial telemetry, and distinct UI states.                                |
| Dependency and integration risks  | **Yes**           | Payload internals can drift; current docs and exact pinned source already differ on sort, while the pin lacks exact scope/CAS and uses a 50-row, `lockDocuments: false`, partly silent UI path.                          | High        | High over upgrades           | Core uses an internal commit build; official current docs describe more than the pinned type/UI stores.                                                                           | Custom Core UI, exact-pin qualification, adapter-only imports, provider-neutral export, upgrade contract tests, and no reliance on undocumented stock behavior.                 |
| Migration and upgrade risks       | **Yes**           | Raw `Where` and provider columns become unreadable after schema renames or a CMS/provider change.                                                                                                                        | High        | Medium–High                  | Provider state names implementation fields, not stable product semantics.                                                                                                         | Versioned semantic DTO, old-reader retention, deterministic migration, quarantine on unknown keys, complete neutral export/import proof.                                        |
| Other development hazards         | **Yes**           | Two managers can overwrite a shared view; retries can duplicate; tests may prove only happy-path personal use; browser state can disagree with persisted state.                                                          | High        | Medium                       | Collaborative view editing and URL/persisted state create ordinary concurrency races.                                                                                             | CAS and idempotency, explicit dirty/base revision, negative and failpoint tests, no false success, and one command owner.                                                       |

No category is dismissed as impossible. The findings do not justify a general
query platform; they justify the small contract above.

## Required UX behavior

### Information architecture

- A single **View: <name>** selector sits beside Search and Filters. It is not a
  tab row and does not compete with the Content Library's family or folder
  navigation.
- The picker groups **Built in**, **Shared with <Site>**, and **My views**.
  Actor-local favorites rise within a group; they do not change the Site catalog.
- The selected row applies the view. A separate, clearly named action button
  opens rename/favorite/update/delete actions. No hover-only tiny kebab is the
  only route to a required task.
- One **Manage saved views** surface supports scan, rename, favorite, repair,
  and delete without exposing an ACL editor or provider record form.

### Apply and refine flow

1. Staff choose a view. Merely moving highlight in the picker does not apply
   it; Escape closes and preserves the previous selection.
2. The picker closes, focus returns to its trigger, and the result region becomes
   busy while the server resolves current scope, definition, and authorization.
3. Success atomically replaces the list and announces a concise status. It does
   not move focus into the result grid.
4. Applying clears the prior search, pagination, selected rows, and pending
   actions, and the concise result status says when search was cleared. A
   visible field is labeled **Search within this view**.
5. Search is one-off refinement. It is never saved and never creates a false
   **View changed** state.

### Save a personal or Site-shared copy

1. Staff configure supported filters, one sort, and visible columns. **Save
   current view** appears only for a meaningful valid definition.
2. The dialog shows a plain-language summary and warns if current search text
   will not be included. Search alone cannot enable Save.
3. It asks for a short name and defaults to **Just me**. A capability-holder may
   instead choose **Shared with <Site>**, with the explanation that use of the
   view does not grant content access.
4. Creating shared from personal or personal from shared always creates a new
   record with new ownership and identity; it never converts the source in place.
5. Save confirms inline, makes the new view active, updates the opaque-ID URL,
   and returns focus to the invoking control. On return, it re-runs against
   current facts and access.

### Change, conflict, and deletion flow

- A filter, sort, or column override displays **View changed**. Nothing
  auto-saves.
- Personal owners see **Update my view**, **Save as a new view**, and **Reset
  changes**. Ordinary shared-view users see **Save as my view** and **Reset
  changes**. Shared managers additionally see **Update shared view** plus a
  compact before/after summary.
- An optimistic concurrency conflict keeps local work and offers **Load latest**
  or **Save as my view**. It never silently merges. A remote shared update never
  replaces the current actor's results mid-task.
- Deletion uses concise confirmation—**This removes the saved view. It does not
  delete or change any content.** It does not require frightening legal copy or
  typing the view name.

### Empty, invalid, and failure flows

- **No saved views** invites the staff member to configure and save a view;
  **No matching content** offers clear filters/search reset. These are not the
  same as a load failure.
- Invalid membership conditions or unknown semantic versions show **Needs
  attention**, disclose no inaccessible name, and return no rows until repaired
  or reset.
- A missing presentation column is visibly omitted. An invalid sort visibly
  falls back to the stable default. Both remain **Needs attention** without
  blanking otherwise authorized results.
- A transient apply failure keeps the last valid results, labels them as not
  updated, and offers **Retry**. A failed create/update/delete preserves input,
  reports no false success, and exposes a persistent recovery action.
- A private or wrong-Site ID uses one generic unavailable state. It does not say
  whether the view exists.

### Accessible interaction contract

- Use the WAI-ARIA combobox/listbox pattern for the grouped selector and the
  dialog pattern for save/manage flows; do not invent a menu/listbox hybrid.
- The trigger has an accessible name and exposes the selected value without
  color alone. Highlight and selection remain distinct.
- View selection, search, save, update, clone, repair, favorite, and delete work
  by keyboard, screen reader, touch, 200% zoom, and 320-CSS-pixel reflow.
- Touch targets follow Core's comfortable target contract and visible focus
  meets Core/WCAG expectations.
- Apply preserves/restores focus on the selector; cancel returns focus to the
  invoking control. Async status uses a restrained status region so updates are
  announced without moving focus or repeatedly reading the whole list.
- Destructive-looking text says exactly what is removed and that content is not
  changed.

Useful accessibility references:

- [WAI-ARIA Combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
- [WAI-ARIA Dialog Modal pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- [WCAG 2.2 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- [WCAG 2.2 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [WCAG 2.2 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)
- [WCAG 2.2 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)

## Downstream effects of the recommendation

| Owner                    | Consequence if C-prime-R is ratified                                                                                                           |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| D1 Site authority        | Supplies exact Tenant × environment × Site scope only. Saved views never enter Public Site Generations or serving heads.                       |
| D6 ordinary families     | Supplies the eligible Page/Article family discriminant. No Phase 22 specialized family is inferred.                                            |
| D18 Content Library      | Owns the surface and source folder operands. Folder lifecycle emits invalidation/repair cause; D20 does not own folders.                       |
| D19 Topics               | Supplies stable Topic IDs as optional filter operands. Topic lifecycle may invalidate a view; D20 does not own or publish Topics.              |
| Phase 10                 | Current record and field safety still governs results. A view supplies no safety proof.                                                        |
| Phase 12 authorization   | Must provide the shared-view-management capability. D20 must not hard-code role names.                                                         |
| Payload adapter          | May map typed semantic definitions into exact-pin Query Presets only after scope, authorization, error, capacity, and migration qualification. |
| Support Hub/Core UI      | Provides reusable language and responsive URL-state patterns, not storage or authorization authority.                                          |
| Later Trash decision     | May add an allowlisted Trash-state predicate only after Trash semantics are ratified; D20 does not pre-decide deletion.                        |
| Public runtime, D14, D17 | No Saved view record or query is read, cached, indexed, rendered, or converted by public systems.                                              |
| Operations               | Needs cause-coded health for invalid shared views, adapter failures, cap/truncation, and migration—not a new release dashboard.                |

## Ruthless synthesis and implementation order if later ratified

### Must be fixed before activation

1. **Finish the D1/D18 exact-scope foundation.** Do not enable provider Query
   Presets against today's Tenant-only Page shape.
2. **Define the provider-neutral semantic query contract.** Allowlist filter,
   operator, operand, sort, and column keys; define stable IDs, schema versions,
   caps, invalidation, and old-reader behavior.
3. **Define authority and structural isolation.** Actor-own personal views,
   Site-own shared views, one source capability for shared mutation, current
   record access on every application, exact-scope constraints, and negative
   tests.
4. **Build the calm Core-owned UX contract.** All content, Shared, My views,
   active/dirty state, default-private save, clone, explicit shared update,
   fail-narrow repair, responsive/accessibility behavior, and no raw Payload
   ACL controls.
5. **Qualify the exact Payload pin.** Prove generated schema, access,
   Local/REST behavior, exact-scope filtering before pagination/limit, query compilation, errors, CAS,
   migrations, and provider upgrade boundaries.
6. **Prove failure and migration.** Test idempotency, concurrent edit, stale
   operands, offboarding, cap exhaustion, lost response, partial database/audit
   failure, old semantic readers, and neutral export/import.
7. **Activate incrementally behind one reversible Site-scoped gate.** Existing
   Content Library behavior remains the fallback; activation creates no
   inferred view rows and no public change.

### Address soon after activation

- Test with a small single-editor ministry, a larger communications team, and
  a restricted-ministry safety reviewer. Measure first-save success, repeat
  task time, ability to distinguish a view from permission, and shared-view
  repair comprehension.
- Review cap pressure, duplicate view creation, abandoned shared views, and the
  filters users actually save before adding another predicate or increasing
  limits.
- Add only evidence-backed code-owned defaults; do not turn every common query
  into permanent navigation.

### Monitor without adding launch complexity

- personal/shared counts and cap pressure by exact scope;
- save/apply/update/delete latency and cause-coded failures;
- invalid semantic version, missing operand, and repair success;
- provider result truncation or adapter-contract drift;
- expensive query plans/timeouts and large relationship filters;
- cross-scope denials and private-link probes without logging sensitive query
  definitions; and
- shared-view clutter/offboarding health.

## Required proof matrix

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

## Founder ratification under adversarial hardening

The founder ratified the exact **C-prime-R — Bounded personal and Site-shared
Saved Library Views over current authority** block above as Phase 23 D20 on
2026-08-23. Ratification establishes the planning contract but authorizes no
implementation.

## Source inventory

### Repository

- `docs/prds/sitestacker-parity/phase-23-web-studio-cms-decision-log.md`
- `docs/adr/0162-purpose-bounded-authority-free-content-library-folders.md`
- `docs/adr/0163-versioned-release-bound-site-topic-profile-and-controlled-topic-sets.md`
- `docs/guides/architecture/web-studio-living-spec.md`
- `docs/guides/development/site-studio-payload.md`
- `apps/admin/src/cms-ui/web-studio/collections/shared/list-workspace/NativeCollectionListView.tsx`
- `apps/admin/src/cms/collections/pages.ts`
- `apps/admin/src/cms/collections/cms-users.ts`
- `apps/admin/features/support-hub/components/views/SaveViewDialog.tsx`
- `apps/admin/features/support-hub/types/route-state.ts`
- `apps/admin/features/support-hub/lib/route-state.ts`
- `packages/database/collections/support-hub.ts`
- `packages/api/src/admin/support-hub/adapter/supabase.ts`
- `package.json`
- `apps/admin/package.json`

### Primary external documentation and exact provider source

- [Payload Query Presets](https://payloadcms.com/docs/query-presets/overview)
- [Payload pinned Query Preset configuration](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/query-presets/config.ts)
- [Payload pinned Query Preset access](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/query-presets/access.ts)
- [Payload pinned Query Preset types](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/query-presets/types.ts)
- [Payload pinned Query Preset UI](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/ui/src/elements/QueryPresets/QueryPresetBar/index.tsx)
- [Payload Access Control](https://payloadcms.com/docs/access-control/overview)
- [Payload Local API access control](https://payloadcms.com/docs/local-api/access-control)
- [Contentful search and organization FAQ](https://www.contentful.com/help/faq/search-and-content-organization/)
- [Contentful content views](https://www.contentful.com/help/content-and-entries/create-content-views/)
- [Contentstack shared views](https://www.contentstack.com/docs/headless-cms/shared-views)
- [Contentstack saved-view FAQ](https://www.contentstack.com/docs/headless-cms/faqs)
- [HubSpot saved views](https://knowledge.hubspot.com/records/create-and-manage-saved-views)
- [Salesforce list views](https://help.salesforce.com/s/articleView?id=xcloud.basics_understanding_list_views_lex.htm&language=en_US&type=5)
- [Directus presets and bookmarks](https://docs.directus.io/user-guide/settings/presets-bookmarks)
- [Microsoft Dynamics saved views](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/get-started/saved-views)
- [WAI-ARIA Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
- [WAI-ARIA Dialog Modal](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- [WCAG 2.2 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- [WCAG 2.2 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [WCAG 2.2 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)
- [WCAG 2.2 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)

## Decision posture

D20 is **founder-ratified and adversarially hardened**. The exact bounded
C-prime-R formulation is recorded authoritatively in the Phase 23 decision log
and ADR-0164. This research note remains supporting evidence and does not
independently expand the decision.
