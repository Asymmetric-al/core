# Phase 23 D18 — Content Library folder authority, UX, and adversarial review

- **Status:** Founder-ratified and adversarially hardened; documentation
  authority is the Phase 23 decision log.
- **Date:** 2026-08-23
- **Founder decision:** Ratified C-prime-R — Purpose-bounded, authority-free
  Content Library folders over an exact-qualified Payload hierarchy adapter.
- **Scope:** Private staff organization for the two D6 ordinary content
  families, Page and Article.
- **Explicitly separate later decisions:** Taxonomy and tags, Query Presets,
  Trash and permanent deletion, generalized media organization, forms,
  permissions beyond the required source-owned capability, and implementation
  ticket slicing.
- **Mutation authorization:** None. Ratification authorizes documentation only.

## Executive verdict

Option C-prime is the correct direction, but the unhardened formulation is not
safe to ratify.

The permanent answer is one optional, Site-scoped **Content Library** lens over
an exact-qualified Payload hierarchy adapter, with one private,
nonlocalized **Library Placement** fact per eligible Page or Article identity. It is not a
second CMS, not the D2 Site Plan, not a media library, and not a public
classification system.

Three changes are mandatory:

1. Web Studio must own the product commands and experience. Core must not
   expose stock Payload folder mutation or assume the current public Folders
   documentation exactly describes the internal Payload 4 build pinned here.
2. Folder placement must remain outside product Editorial Revision,
   publication, chronology, and D1 release truth. A filing action cannot dirty
   content, create a product content revision, change an Article date, or make
   a Page appear newly edited.
3. **Remove folder** must replace Payload's raw recursive deletion behavior
   with one non-destructive, transactional rehome. Content and descendant
   folders survive.

With those changes, the design is both safer and simpler than either a generic
folder platform or a tenant-specific filing system.

## Authority already settled by D1–D17

Phase 23 D18 must compose with, and cannot reinterpret:

- D1: one stable Page identity, separate Editorial and Page Placement
  Revisions, one coherent Public Site Generation, and one serving-head
  activation;
- D2: the Site Plan, Page ancestry, public paths, and ordinary breadcrumbs;
- D4–D5: independently authored Primary and Footer Navigation;
- D6: exactly two ordinary families, Page and Article;
- D8: explicit one-level Reusable Sections;
- D12: Editorial Working Revisions and the active-editor lease;
- D14–D16: source-qualified dynamic lists, curation, and public windows; and
- D17: the derived Public Site Search Projection.

Content Library folders therefore cannot become any of those facts merely
because Payload can relate a document to a folder.

## Practical scenario

A tenant has:

- a live Page at /about/leadership;
- twelve draft campaign Pages;
- forty-six Articles;
- a D2 Site Plan that represents public addresses; and
- staff who want private folders called Website refresh and Christmas 2027.

Moving the leadership Page into Website refresh must change only where staff
find it inside Content Library. It must not:

- change /about/leadership or its Page parent;
- alter Primary or Footer Navigation;
- save or publish an Editorial Revision;
- change Article chronology or the staff-facing last-content-edit fact;
- create a D1 release candidate;
- reindex D17 public search;
- alter cache invalidation, taxonomy, safety, permission, or lifecycle;
- move media; or
- expose the folder name publicly.

If Website refresh is removed, the Page and every descendant folder must still
exist. The UI must explain exactly where they will go before the command runs.

## Current repository evidence

### Web Studio ownership and visual language

Core already makes the correct high-level split:

- Web Studio is Mission Control-native UI around Payload.
- StudioLayout and StudioTopBar own the shell and breadcrumbs.
- NativeCollectionListView uses PageShell, FilterBar, Payload list/query
  primitives, Core empty states, and Payload preferences.
- NativeCollectionEditView keeps Payload's document form while Core owns
  action framing, state, preview, and inspector context.
- Shared controls are Base UI-backed Maia + Zinc components from @asym/ui.

Relevant sources:

- apps/admin/src/cms-ui/web-studio/README.md
- apps/admin/src/cms-ui/web-studio/shell/studio-layout.tsx
- apps/admin/src/cms-ui/web-studio/shell/studio-top-bar.tsx
- apps/admin/src/cms-ui/web-studio/shell/studio-nav-rail.tsx
- apps/admin/src/cms-ui/web-studio/collections/shared/list-workspace/NativeCollectionListView.tsx
- apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/NativeCollectionEditView.tsx
- docs/guides/architecture/web-studio-living-spec.md
- docs/guides/development/site-studio-payload.md

The current native list is a useful visual seam, not a finished folder
workspace:

- its bulk-delete, bulk-edit, row-selection, and permission props are currently
  discarded;
- its empty state does not distinguish an empty collection, empty folder,
  empty search, permission-limited result, or load failure;
- FilterBar needs a persistent accessible search label and named filter-removal
  controls before reuse here;
- the Studio navigation rail is hidden below the medium breakpoint, so the
  Content Library needs its own mobile folder trigger; and
- active Studio links need semantic current-page state, not visual styling
  alone.

These are bounded prefactoring seams, not reasons to invent another UI system.

### Existing tenant boundary

Payload content uses a privileged direct PostgreSQL connection in the cms
schema. Existing tenant access and tenant-assignment hooks are in:

- apps/admin/src/cms/access/tenant-context.ts
- apps/admin/src/cms/access/tenant-access.ts
- apps/admin/src/cms/hooks/tenant.ts
- apps/admin/src/cms/hooks/audit.ts

Supabase RLS must not be claimed as protection for those privileged Payload
operations. D18 needs server-side exact-scope proof and structural database
constraints. The current production model also does not yet provide the final
authoritative Site identity on every eligible document; activation must compose
with D1/D2's exact Site authority rather than inventing nullable or slug-derived
Site truth.

## Exact Payload evidence

Core pins the Payload package family to the internal build
4.0.0-internal.1f9ae9a, corresponding to upstream commit
1f9ae9ab37bd7a69894762c833fad3e65124c314. The repository's
vendor/payload-upstream snapshot is historical v3.77 audit evidence and is not
the runtime.

### Public documentation is directionally useful, not exact-pin proof

The current [Payload Folders documentation](https://payloadcms.com/docs/folders/overview)
describes folders as nested relationship-based organization, with one folder or
no folder and collection opt-in. That supports the product direction.

The pinned internal v4 source uses its newer generalized hierarchy model and
must be qualified directly:

- [folder preset](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/hierarchy/presets.ts)
- [folder relationship field](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/hierarchy/createFolderField.ts)
- [hierarchy resolution](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/hierarchy/resolveHierarchyCollections.ts)
- [exact-build folder test configuration](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/test/folders/config.ts)

The exact preset enforces single folder membership. That is a good match for
one-folder-or-Unfiled semantics.

### Raw folder deletion is unsafe for this product

The exact pinned
[before-delete hook](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/hierarchy/hooks/collectionBeforeDelete.ts)
recursively deletes child folder records. Its
[after-delete hook](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/hierarchy/hooks/collectionAfterDelete.ts)
then clears folder references on related documents.

That behavior may be defensible for a provider primitive, but it is too
destructive and surprising for Core's staff experience. A raw delete cannot be
the product command.

### Provider cycle checks do not close the concurrency race

The pinned
[before-change hook](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/hierarchy/hooks/collectionBeforeChange.ts)
walks ancestors and rejects direct cycles. Two concurrent moves can still both
pass their initial reads and jointly create a cycle. Core needs one short,
scope-bounded serialized transaction that re-reads and revalidates ancestry
before writing. No closure table or workflow engine is required.

### Local API and transaction defaults are footguns

[Payload Local API access documentation](https://payloadcms.com/docs/local-api/access-control)
states that Local API operations bypass access by default unless the caller
passes the user and sets overrideAccess to false. The general
[Local API documentation](https://payloadcms.com/docs/local-api/overview) also
documents lock-bypass behavior.

[Payload transaction documentation](https://payloadcms.com/docs/database/transactions)
requires nested mutations to receive the same request object so they remain in
the same transaction. An unawaited nested mutation can also produce a false
success response.

Every staff-origin D18 command must therefore pass the authenticated request,
user, overrideAccess false, and overrideLock false, await every nested write,
and keep every database mutation in one transaction.

### A folder move cannot be an Editorial Revision

[Payload Versions](https://payloadcms.com/docs/versions/overview) records
document updates as versions, and
[Payload Drafts](https://payloadcms.com/docs/versions/drafts) distinguishes
draft-only writes from writes to the main collection.

D18's product model must not equate a provider version caused by administrative
metadata with a D1/D12 Editorial Revision. Library Placement is a private,
nonlocalized, non-editorial fact associated with the stable Page or Article identity. A
move must not:

- acquire or replace the D12 active-editor lease;
- advance Editorial Working Revision;
- create an unpublished-content indication;
- update public content digest or D1 candidate inputs;
- advance editorial display, first-live, latest-live, or last-content-edit
  chronology; or
- run public release, search, cache, or publication hooks.

The adapter may physically co-locate provider metadata only if conformance
tests prove all of those semantic separations. Otherwise it must use one small
private, non-versioned placement relation over the same Payload hierarchy. It
may not bypass Payload with unsupported direct writes.

## Comparable CMS and accessibility evidence

The comparison is not “which product has the fanciest tree.” The useful modern
pattern is a distinct staff organization surface with search, filters, and
clear separation from public structure:

- [Contentful's content views](https://www.contentful.com/help/content-and-entries/create-content-views/)
  place search, filters, recent views, and folders in a content sidebar.
- [Contentful's web app overview](https://www.contentful.com/help/getting-started/contentful-web-app-overview/)
  separates Content and Media work areas.
- [Sanity Structure](https://www.sanity.io/docs/studio/structure-introduction)
  organizes document browsing around an editor's mental model and explicitly
  warns that complex structures can hurt performance.
- [Drupal taxonomy](https://www.drupal.org/docs/user_guide/en/structure-taxonomy.html)
  classifies public content and can generate public listing behavior. That is
  evidence for keeping taxonomy separate from a private folder.

A true ARIA tree is not “a nested list with roles added.” The
[WAI-ARIA Tree View Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/)
requires managed focus, arrow navigation, Home/End, expansion behavior,
selection semantics, and dynamic-set metadata. Payload's pinned stock tree does
not provide the complete interaction contract Core would need to claim.

The launch folder navigator should therefore use an ordinary semantic nested
navigation/disclosure pattern. It is easier to understand, works with normal
Tab order, and avoids a custom composite-widget maintenance burden. If a later
measured need justifies an ARIA tree, it must implement and manually test the
complete APG contract.

Drag-and-drop may be a pointer convenience only. [WCAG 2.2 Dragging
Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements)
requires an alternative that does not depend on dragging.

## Hardened domain contract

### Exact scope and eligibility

- One folder tree exists per exact Tenant × environment × Site.
- The immutable operational Tenant identity and current server-resolved Site
  identity define scope; tenant/site slugs and browser input do not.
- Only D6 ordinary Page and Article identities are eligible at launch.
- The placement is nonlocalized: all locale revisions of the same stable Page
  identity appear in the same staff folder.
- A Page or Article has exactly one folder or the null-backed **Unfiled**
  state.
- **Unfiled** is a derived system view, not a magic folder row.
- Phase 22 Missionary, Project/Campaign, and Ministry Update records, Reusable
  Sections, Page Starters/Templates, Navigation, media, operational records,
  and arbitrary future collections are excluded.

### Folder identity and invariants

- Folder identity is an opaque, immutable ID.
- A folder has one editable, short display label and one optional parent in the
  same exact scope.
- Display labels are never identifiers, public paths, storage prefixes, cache
  keys, or permission boundaries.
- Unicode-normalized and case-folded sibling labels are unique within the same
  parent. The same label may exist under a different parent.
- Labels reject blank-only values, control characters, path semantics, and
  unsafe markup.
- Launch depth is limited to five named folder levels from the Content Library
  root. The limit is code-owned, not a tenant setting.
- Folder creation, reparenting, and removal are serialized within the exact
  Tenant × environment × Site tree, with ancestry and depth re-read under the
  same short transaction.

### Authority-negative contract

Library Placement and folder ancestry supply none of the following:

- Page identity, family, Site, locale, or source ownership;
- D2 parent Page, canonical path, route continuity, or ordinary breadcrumb;
- Navigation membership, group, copy, role, or order;
- Editorial Revision, D12 working state, lock, authorship, or chronology;
- saved, reviewed, scheduled, published, activated, cached, or searchable
  status;
- D1 candidate input, Public Site Generation, or serving-head authority;
- Phase 10 safety, reach, consent, or adverse containment;
- taxonomy, tag, D14 source/list membership, D15 curation, or D16 window;
- D17 public-search eligibility or deletion health;
- permissions, inheritance, assignment, retention, Trash, deletion, or
  recovery;
- media file identity, custody, metadata, folder, or lifecycle; or
- operational identity, giving, CRM, finance, payment, or accounting truth.

Folder names and ancestry never enter the public serializer, public URL,
metadata, sitemap, search document, cache tag, analytics payload, or
unprivileged error response.

### Commands

One Web Studio server boundary owns:

- Create folder
- Rename folder
- Move folder
- Move to folder
- Move selected to folder
- Remove folder

Every command:

1. resolves the current actor and source-owned capability;
2. resolves exact Tenant, environment, Site, eligible family, record, folder,
   and parent from trusted server state;
3. re-proves same-scope relationships and current visibility;
4. checks expected command/folder/placement generation;
5. checks sibling-label uniqueness, cycle, and depth;
6. uses one idempotency key and one short transaction;
7. passes the authenticated Payload request/user with access and locks
   enforced;
8. awaits every nested write;
9. writes one privacy-safe audit receipt in the same transaction; and
10. returns a stable success, conflict, permission, validation, or unavailable
    cause.

Bulk movement is code-bounded and all-or-none. A mixed-permission, stale, or
wrong-scope selection is rejected with the affected item identified only to an
authorized actor. Stock Payload's sequential partial-success move is not the
product behavior.

No mutation is queued offline. A lost response can be retried with the same
idempotency key and returns the same receipt.

### Exact non-destructive Remove folder behavior

Raw Payload hierarchy deletion is unavailable to ordinary users.

After an exact consequence preview and expected-generation reproof, one
transaction:

1. moves the folder's directly filed Pages and Articles to its parent folder,
   or to **Unfiled** when the removed folder is at the root;
2. reparents each immediate child folder to the removed folder's parent, or to
   the Content Library root;
3. preserves every deeper descendant folder and content identity;
4. blocks before writing if the rehome would create a normalized sibling-name
   collision, depth breach, wrong-scope relation, or stale consequence;
5. deletes only the now-empty selected folder; and
6. records the exact rehome result.

It never deletes, trashes, unpublishes, or changes the public output of a Page
or Article. There is no destructive rollback; retry is idempotent and recovery
is a new validated forward command.

## Finished Web Studio UX/UI

### Information architecture

Web Studio has two deliberately distinct work areas:

| Staff concept   | Content Library                                   | Site Plan                               |
| --------------- | ------------------------------------------------- | --------------------------------------- |
| Purpose         | Find and privately organize Page and Article work | Manage public Page ancestry and address |
| Move action     | Move to folder                                    | Move Page                               |
| Placement label | Folder — staff organization only                  | Website location / Parent Page          |
| Breadcrumb      | Private Content Library context                   | Public ordinary breadcrumb              |
| Public effect   | None                                              | May change route in a D1 release        |
| Publication     | Unchanged                                         | Independently governed                  |

Never use the ambiguous label **Location** for both.

### Desktop

The route opens in the existing StudioLayout and StudioTopBar.

PageShell shows:

- **Content Library**
- “Find and organize Pages and Articles for your team. Folders do not change
  website addresses, navigation, or publication.”
- primary **New content**
- secondary **New folder**

The body is a calm two-pane workspace:

- a 240–280 pixel collapsible folder rail; and
- the current folder's paginated content list.

The rail begins with:

- **All content** — the default entry;
- **Unfiled**; and
- **Folders**.

Folders use nested semantic navigation with explicit disclosure buttons, not an
unqualified ARIA tree. Folder state is URL-addressable by stable opaque ID, not
by label path. A broken or removed folder address returns to the nearest
surviving ancestor or Unfiled with an explanation.

The main toolbar contains:

- a persistently labelled search box;
- search scope: **This folder** or **All content**;
- Page / Article type filter;
- status and assignment filters already owned by their sources; and
- the existing progressive **Columns & filters** control.

Rows show only useful scan facts:

- title;
- Page or Article;
- editorial/publication status from its owner;
- last content edit, not folder-operation time; and
- Library folder when the result spans folders.

A Page's public address and Site Plan parent are visible as separate read-only
context on detail and move surfaces. They are never editable through the folder
control.

### Mobile and narrow layouts

The current Studio rail disappears below the medium breakpoint, so Content
Library supplies a full-width **Folder: {name}** trigger. It opens a Core
Sheet/Drawer containing All content, Unfiled, folder search, and the nested
folder navigator.

Content results use the repository's responsive table/card conventions. The
move picker becomes a full-height searchable sheet. No task requires hover,
precision drag, or a desktop viewport.

### Creating and renaming folders

**New folder** opens one small Core Dialog:

- Name
- Inside
- helper text: “For staff organization only. Your website will not change.”

Rename is inline when context and validation remain clear, otherwise the same
small Dialog. Success is concise: “Folder renamed.” The persistent page
context—not repeated warning banners—keeps the public separation clear.

### Moving one or many items

**Move to folder** opens a searchable folder picker with:

- current folder;
- All folders / Unfiled;
- full ancestor labels for duplicate names in different branches;
- only exact-scope valid destinations; and
- one quiet line: “This will not change the page address or what is
  published.”

A single non-destructive move does not receive a second ceremonial confirmation
after the user selects a destination and presses **Move**. Bulk movement shows
the exact count and requires one proportional confirmation.

While pending, the prior list remains visible. Success is reflected in the
list and an aria-live status region; a toast may supplement but never own the
result. Failure preserves selection and context and names the next safe action.

Drag-and-drop may be added only as a tested desktop shortcut over the same
command. **Move to folder** remains first-class for keyboard, touch, voice, and
assistive-technology users.

### Removing a folder

The action is **Remove folder**, never Delete content.

The consequence dialog uses exact current counts and plain text:

> Remove “Campaign”? 12 items will stay in “2027,” and 3 subfolders will move
> up one level. Nothing will be deleted, unpublished, or moved on the website.

For a root folder:

> Remove “Campaign”? 12 items will become Unfiled, and 3 subfolders will move
> to the top level. Nothing will be deleted or unpublished.

If the consequence changed after the preview, the command does not guess. It
refreshes the dialog and asks the user to confirm the current result.

### Required states

| State                        | Required experience                                                              |
| ---------------------------- | -------------------------------------------------------------------------------- |
| Initial loading              | Preserve shell and selected-folder context; skeleton the list; expose busy state |
| Empty folder                 | “No content in this folder” plus New content and Move content here               |
| Empty search                 | “No matches in {scope}” plus Clear search                                        |
| Unfiled empty                | Quiet success: “Everything is organized” with All content                        |
| Permission-limited           | Show only authorized results; do not imply another result exists                 |
| Network/provider unavailable | Keep the list and selection; explain that nothing moved; Retry                   |
| Stale folder or placement    | Keep prior truth, identify the conflict, Refresh                                 |
| Validation collision         | Name the conflicting sibling and offer Rename or choose another parent           |
| Lost permission              | Explain that access changed; no leaked labels or counts                          |
| Success                      | Persistent updated list and programmatic announcement; toast optional            |

### Accessibility and Core consistency

- Use shared @asym/ui Base UI Maia + Zinc Button, Dialog, Sheet, Popover,
  Checkbox, Empty, ScrollArea, Tooltip, and status patterns.
- Add a persistent accessible name to shared FilterBar search and names to
  active-filter removal controls before reuse.
- Expose current navigation with semantic current-page state.
- Every icon-only action has a name; actions are never hover-only.
- Restore focus to the invoking control after Dialog or Sheet close.
- Keep visible focus rings, 44-pixel Core touch targets, 200% and 400% zoom
  reflow, reduced-motion behavior, and logical source/focus order.
- Axe is necessary but not sufficient. Manual keyboard, screen-reader,
  zoom/reflow, touch, and reduced-motion checks are release gates.

## Full adversarial review

### 1. Brittleness — material concern: yes

- **What could go wrong:** Implementation follows current public Payload folder
  examples while Core runs a different internal v4 hierarchy API. Provider
  fields, hooks, and view behavior then drift on upgrade.
- **Why it matters:** A private organizer can become an outage or data-movement
  risk if it is tightly coupled to an undocumented prerelease surface.
- **Severity / likelihood:** High / High.
- **Evidence:** Exact package pin and exact hierarchy source differ materially
  from the current public configuration model.
- **Permanent prevention:** One narrow provider-neutral adapter, exact-commit
  conformance tests, and a blocked upgrade until migrations, access, mutation,
  delete, and UI adapter tests pass.

### 2. Technical debt — material concern: yes

- **What could go wrong:** Raw provider names and behavior spread through
  collections, public serializers, UI, and tests, or Core creates a universal
  Folder abstraction with custom types and inheritance.
- **Why it matters:** Either path makes later provider upgrades and the separate
  media/taxonomy decisions expensive.
- **Severity / likelihood:** High / Medium.
- **Evidence:** D1/D2 already separate Page identity, public placement, and
  content; the current Web Studio intentionally wraps rather than forks
  Payload.
- **Permanent prevention:** One Content Library query/command boundary, one
  Library Placement semantic, no provider virtual-path fields in product
  contracts, and no generic folder engine.

### 3. Edge cases — material concern: yes

- **What could go wrong:** Unicode/case-equivalent siblings, root-null
  uniqueness, deleted parents, mixed-permission bulk sets, stale selections,
  deep nesting, concurrent inverse moves, record Site changes, and folder
  removal collisions can produce confusing or invalid state.
- **Why it matters:** These are ordinary multi-editor scenarios, not exotic
  attacks.
- **Severity / likelihood:** High / High.
- **Evidence:** Relationship existence alone does not prove same scope,
  uniqueness, cycle safety under concurrency, or current authorization.
- **Permanent prevention:** Stable IDs, normalized sibling uniqueness,
  scope-aware constraints, five-level depth, transactionally serialized
  ancestry reproof, expected generations, and bounded all-or-none bulk work.

### 4. Footguns — material concern: yes

- **What could go wrong:** Raw Payload delete recursively deletes descendants;
  Local API calls bypass access or locks; a user assumes a folder move changes
  the website; a partial provider bulk move is reported as success.
- **Why it matters:** Each makes accidental harm easy for staff or developers.
- **Severity / likelihood:** High / Medium-high.
- **Evidence:** Exact pinned delete hooks and official Local API defaults.
- **Permanent prevention:** Hide raw mutation surfaces; use named Core
  commands, enforced access/locks, non-destructive Remove folder, and
  all-or-none bounded bulk behavior.

### 5. Tenant safety — material concern: yes

- **What could go wrong:** Search, counts, breadcrumbs, recent folders,
  destination pickers, or mutations expose or accept another Tenant, Site, or
  environment. Super-admin work can act on an implicit scope.
- **Why it matters:** Folder labels may disclose sensitive ministry plans even
  when content bodies remain protected.
- **Severity / likelihood:** Critical / Medium.
- **Evidence:** Payload uses a privileged direct database connection; picker
  filters and UI hiding are not authorization or RLS.
- **Permanent prevention:** Server-resolve and re-prove every scope component;
  exact-scope structural relationships; explicit audited super-admin scope;
  no counts or existence hints for unauthorized records.

### 6. Overengineering — material concern: yes

- **What could go wrong:** Per-folder ACLs, inherited behavior, smart folders,
  multi-folder membership, tenant-defined purposes, icons/colors, automation,
  background propagation, or a closure table turn filing into a platform.
- **Why it matters:** Setup and support become harder while authority becomes
  ambiguous.
- **Severity / likelihood:** Medium / High.
- **Evidence:** The user need is finding ordinary editorial work. D2, D8,
  D14–D17, taxonomy, Trash, and media already have or require distinct owners.
- **Permanent prevention:** One optional tree, one folder or Unfiled, one
  display label, one parent, code-owned eligibility/depth, no per-folder
  permission or public effect.

### 7. UX/UI and user friction — material concern: yes

- **What could go wrong:** Staff confuse Library folders with Site Plan
  hierarchy, face two noisy trees, lose mobile navigation, or must drag to move
  content. Repeated legalistic warnings become invisible noise.
- **Why it matters:** The feature is useful only if staff can find and move
  work quickly and confidently.
- **Severity / likelihood:** High / High.
- **Evidence:** Core's current rail disappears on mobile; current empty states
  are not folder-aware; a true ARIA tree has a substantial keyboard contract.
- **Permanent prevention:** One quiet two-pane library, All content default,
  clear labels, separate read-only website context, nested disclosure
  navigation, searchable picker, named actions, responsive Sheet, precise
  states, and proportional confirmation only.

### 8. Hidden coupling — material concern: yes

- **What could go wrong:** Moving or renaming a folder triggers a Payload
  version, D12 editor state, D1 release, Page path, Navigation, D14 list, D17
  indexing, cache invalidation, permission, or lifecycle behavior.
- **Why it matters:** A harmless filing action would acquire public or workflow
  consequences and make future changes dangerous.
- **Severity / likelihood:** High / High without explicit separation.
- **Evidence:** Payload folder membership is a document relationship, while
  Payload Versions records updates. D1–D17 have separate authority contracts.
- **Permanent prevention:** Library Placement is non-editorial; static and
  integration tests prove folder data is absent from every public compiler,
  serializer, release input, search document, cache tag, permission, taxonomy,
  and lifecycle path.

### 9. Failure modes — material concern: yes

- **What could go wrong:** A timeout leaves the user unsure; an audit failure
  occurs after mutation; duplicate retry repeats work; concurrent remove/move
  invalidates a preview; a nested operation escapes the transaction.
- **Why it matters:** Staff can no longer trust whether content was organized
  or preserved.
- **Severity / likelihood:** High / Medium.
- **Evidence:** Payload transaction correctness depends on threading and
  awaiting the same request; current provider bulk movement may partially
  succeed.
- **Permanent prevention:** One transaction and receipt, same request through
  every nested write, idempotency, expected generation, refreshed consequences
  on conflict, all-or-none bounded writes, and no offline mutation queue.

### 10. Data integrity — material concern: yes

- **What could go wrong:** Orphan placement, cross-scope parent, cycle,
  excessive depth, duplicate normalized sibling, or partial move corrupts the
  tree.
- **Why it matters:** Search and staff navigation become inconsistent and
  repairs become manual.
- **Severity / likelihood:** High / Medium-high.
- **Evidence:** A simple foreign key proves target existence, not matching
  Tenant/Site scope or concurrent ancestry correctness.
- **Permanent prevention:** Scope-aware referential constraints where cleanly
  supported, equivalent transactional enforcement otherwise, integrity
  diagnostics, root-aware uniqueness, serialized cycle/depth validation, and
  atomic bulk operations.

### 11. Security and privacy — material concern: yes

- **What could go wrong:** Sensitive folder labels appear in public JSON,
  URLs, logs, analytics, error text, browser history, search, or another
  tenant's picker.
- **Why it matters:** Labels such as country, worker name, or campaign can
  expose restricted plans.
- **Severity / likelihood:** Critical / Medium.
- **Evidence:** Folder labels are free editorial text; public/provider
  serializers and privileged Local API are separate trust boundaries.
- **Permanent prevention:** Private collection and endpoints, opaque IDs in
  internal routes and telemetry, no folder fields in public selects, redacted
  errors/metrics, authorized audit only, and exact isolation tests.

### 12. Scalability and performance — material concern: yes

- **What could go wrong:** Full-tree hydration, recursive live counts,
  provider virtual path calculation, N+1 ancestor reads, or offset-heavy
  cross-family lists slow large tenants.
- **Why it matters:** A feature that helps at 50 records can become the reason
  a 50,000-record Content Library is unusable.
- **Severity / likelihood:** Medium-high / Medium.
- **Evidence:** Payload's hierarchy path projection can add queries; Sanity
  warns complex structures affect performance; the stock tree uses limits and
  incremental loads.
- **Permanent prevention:** Five-level bound, lazy child loading, server folder
  search, paged/keyset content results, no decorative recursive counts, set-
  based reads, and indexes for scope/parent/name and
  scope/folder/family/status/updated identity.

### 13. Operational burden — material concern: yes

- **What could go wrong:** Required filing, tenant-specific rules, manual
  folder setup, destructive cleanup, or undocumented public consequences
  create support work and tribal knowledge.
- **Why it matters:** Small nonprofit teams need a useful default without a CMS
  consultant.
- **Severity / likelihood:** Medium / Medium.
- **Evidence:** Folders are an optional organizer, not required product truth.
- **Permanent prevention:** Zero setup, All content default, Unfiled, optional
  folders, code-owned limits, safe commands, plain consequences, integrity
  health, and provider-neutral export.

### 14. Observability gaps — material concern: yes

- **What could go wrong:** Cross-scope rejects, orphan placement, failed
  rehomes, cycle attempts, slow queries, conflict spikes, or provider drift are
  invisible.
- **Why it matters:** Support sees “folders are broken” without a cause or safe
  recovery.
- **Severity / likelihood:** High / High if omitted.
- **Evidence:** The current broad CMS audit does not record folder command,
  old/new parent, expected/result generation, or result cause.
- **Permanent prevention:** Privacy-safe structured receipts and metrics with
  actor, scope, command ID, opaque folder/item IDs, old/new parent, count or
  digest, generation, latency, outcome, and cause; integrity and adapter
  conformance health.

### 15. Dependency and integration risks — material concern: yes

- **What could go wrong:** Internal Payload v4 changes hierarchy APIs, hooks,
  generated migrations, UI imports, or deletion semantics.
- **Why it matters:** Core currently treats v4 as a spike dependency, not an
  unquestioned production baseline.
- **Severity / likelihood:** High / High.
- **Evidence:** Exact pinned source already differs from public configuration
  documentation and stock UI behavior is not Core-qualified.
- **Permanent prevention:** One replaceable adapter, no undocumented imports
  outside it, an enablement kill switch, exact-source conformance tests, and
  blocked upgrades until schema, migration, access, command, and UX tests pass.

### 16. Migration and upgrade risks — material concern: yes

- **What could go wrong:** A migration infers folders from public paths,
  Navigation, tags, titles, or Page ancestry; rollback drops organization;
  provider virtual paths become export identity.
- **Why it matters:** That would manufacture authority and make provider exit
  difficult.
- **Severity / likelihood:** High / Medium.
- **Evidence:** Current eligible documents have no folder placement, so a clean
  additive default is available.
- **Permanent prevention:** Existing records become Unfiled without inference;
  shadow-validate constraints before commands; rollback disables commands and
  preserves inert data; export stable folder IDs, scope, parent, label, and
  stable content bindings—not provider virtual fields.

### 17. Other development hazards — material concern: yes

- **What could go wrong:** TOCTOU cycles, stale optimistic UI, raw REST/GraphQL
  mutations, audit outside the transaction, destructive rollback, incomplete
  accessibility tests, or silent provider pagination failure.
- **Why it matters:** These defects emerge under concurrency and real staff
  behavior even when happy-path demos pass.
- **Severity / likelihood:** High / Medium.
- **Evidence:** Exact provider operations are hook-driven; current Core E2E
  tests verify only shell/route smoke for native lists.
- **Permanent prevention:** Transaction-level reproof, raw-path denial tests,
  server-acknowledged UI, failpoint tests, migration rehearsal, accessibility
  and mobile verification, and private canary/health metrics.

## Ruthless synthesis

### Must be fixed before implementation may begin

1. **Freeze the semantic boundary.** Library Placement is private,
   nonlocalized, non-editorial, one-folder-or-Unfiled, and side-effect-dark to
   D1–D17.
2. **Resolve exact scope structurally.** Eligible stable Page and Article identities and
   folders must have authoritative Tenant × environment × Site identity. Do
   not ship a tenant-only or nullable-Site fallback.
3. **Qualify the exact Payload cohort.** Record the pinned hierarchy API,
   field shape, delete hooks, version behavior, access/lock defaults, and
   transaction behavior in conformance tests.
4. **Own all mutations at one command boundary.** Raw provider folder
   mutations are unavailable to ordinary users. Enforce actor, capability,
   exact scope, eligibility, idempotency, CAS, locks, and transactionality.
5. **Install invariants.** Stable IDs, same-scope parent/membership,
   normalized sibling uniqueness, one optional placement, five-level depth,
   cycle protection under serialization, and referential integrity.
6. **Implement non-destructive removal.** Rehome direct content and immediate
   children, preserve descendants, delete only the now-empty selected folder,
   and block on changed consequences or collision.
7. **Prove authority darkness.** Folder-only changes must not alter product
   content revisions, last-content-edit chronology, paths, Navigation,
   publication, D1 generations, D14–D17 behavior, caches, permissions,
   taxonomy, lifecycle, or public DTOs.

### Must pass before shipping

8. **Build the finished Core experience.** Content Library opens on All
   content, has Unfiled, a calm desktop folder rail, searchable move picker,
   responsive mobile Sheet, exact folder-removal consequences, and distinct
   empty/error/conflict states.
9. **Close current shared UI seams.** Accessible FilterBar labels and filter
   removal names, semantic active navigation, real permission-aware selection
   actions, and folder-aware empty states.
10. **Complete the access matrix.** Tenant staff, read-only staff, wrong Site,
    wrong environment, super-admin, anonymous, raw REST/GraphQL, and Local API
    paths cannot enumerate or mutate outside exact scope.
11. **Test concurrency and failure.** Simultaneous inverse moves,
    move-versus-remove, changed consequence, duplicate retry, lost response,
    permission revocation, audit failure, provider timeout, and migration
    rollback all fail safely.
12. **Test UX and accessibility with people and tools.** Staff must reliably
    distinguish Content Library from Site Plan without coaching. Verify
    keyboard, screen reader, focus restoration, mobile, touch, zoom, reduced
    motion, axe, and no drag-only dependency.
13. **Prove capacity.** Use production-shaped skewed tenants to validate lazy
    expansion, search, pagination, indexes, mutation latency, and absence of
    N+1 path/count work.
14. **Make failures operable.** Dashboards and alerts cover adapter drift,
    orphan health, transaction rollback, scope/cycle/depth/collision rejects,
    conflict rates, and latency without logging private labels.

### Monitor after activation

- folder adoption and Unfiled usage as usability signals, never quotas;
- move and remove conflicts, retries, rejection causes, and latency;
- folder search and expansion latency at large-tenant percentiles;
- orphan and invariant health; and
- Payload dependency drift. Every upgrade stays blocked until conformance
  passes.

## Required proof matrix

1. Existing Page and Article identities appear in Unfiled with no inferred
   placement and no mass content update.
2. One item and a bounded selection move atomically; duplicate retry returns
   the same receipt.
3. A folder-only move changes no Editorial Working Revision, D12 lease,
   product content chronology, public digest, D1 candidate, path, Navigation,
   D14–D17 projection, cache tag, or public response.
4. Wrong-Tenant, wrong-environment, wrong-Site, wrong-family,
   permission-hidden, stale-generation, and raw-provider requests cannot read,
   count, search, select, or mutate forbidden folders.
5. Case/Unicode-normalized sibling collisions, cycles, depth breaches,
   deleted parents, and inverse concurrent moves fail without partial state.
6. Removing leaf, populated, root, and nested folders preserves every content
   and descendant-folder identity and rehomes them exactly as previewed.
7. Move-versus-remove, changed consequences, audit failure, database failure,
   and lost response preserve prior truth or return the same committed receipt.
8. Tree/list queries at the production envelope are indexed, lazy, paginated,
   and free of recursive count/path N+1 behavior.
9. Desktop, mobile, keyboard, touch, screen reader, zoom, focus restoration,
   and reduced-motion flows pass automated and manual verification.
10. An exact Payload upgrade cannot merge until schema, migration, hierarchy,
    delete, access, lock, transaction, adapter, and UI conformance tests pass.
11. Provider-neutral export and import round-trip folder identity, scope,
    parentage, labels, and stable content placement without public inference.
12. Rollback disables reads/actions while preserving inert folder data until a
    complete export/rehome census authorizes later removal.

## Founder-ratified exact formulation

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

## Decision posture

The founder ratified this exact C-prime-R as Phase 23 D18 on 2026-08-23. The
[Phase 23 decision log](../phase-23-web-studio-cms-decision-log.md) is the
authority; this file remains supporting evidence and does not independently
expand the decision. [ADR-0162](../../../adr/0162-purpose-bounded-authority-free-content-library-folders.md)
records the architectural consequence.

Ratification authorizes no implementation, schema, migration, dependency or
provider adoption, issue publication, deployment, D1 activation, release, or
production change.
