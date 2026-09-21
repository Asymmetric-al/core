# Phase 23 D27 Nonprofit Public Media UX and Workflow Research

**Status:** Complete supporting evidence for the founder-ratified Phase 23 D27
C-prime-R decision. This document explains the experience and measurable
quality bar without independently expanding the ratified authority; it
authorizes no implementation, schema, provider, dependency, migration, issue,
deployment, D1 activation, or release.

**Date:** 2026-08-23

## Executive verdict

D27 should deliver a **DAM-grade Public Media Catalog bounded to public
ministry publishing**, not a universal enterprise DAM and not a decorated
Payload upload collection. Staff should call it **Media**. It must make the
ordinary path—find or upload one safe image and place it on a Page—fast and
obvious while retaining exact rights, safety, revision, usage, release, Trash,
and custody evidence for the people who need it.

The permanent UX architecture is progressive disclosure around one stable
mental model:

1. **Media is reusable by the organization.**
2. **A use on a Page is contextual.** Crop, accessibility meaning, locale, and
   displayed credit belong to that use.
3. **Ready to use is not public.** Only a D1 Site release changes the public
   site.
4. **A new version never silently replaces a live one.**
5. **Folders help people find things; they grant no authority.**
6. **When something cannot be used, explain why and what to do next.**

Payload 4 supplies useful UI and upload primitives, but Payload's own current
announcement says file versioning, usage references, richer previews,
localized files, and other DAM features are still being shaped. Therefore the
Asym experience must own these product meanings above the provider.

Primary sources:

- [Payload Uploads](https://payloadcms.com/docs/upload/overview)
- [Payload Folders](https://payloadcms.com/docs/folders/overview)
- [Payload storage adapters](https://payloadcms.com/docs/upload/storage-adapters)
- [Payload 4 DAM announcement](https://payloadcms.com/posts/blog/payload-40-admin-ui-redesign-tanstack-mcp-and-more)

## People and ministry conditions

The design is not complete unless each of these people can finish their real
task safely.

### Missionary or field contributor

- Often uses a phone, unstable or expensive data, and a camera-origin HEIC or
  JPEG.
- Knows the story and whether permission was sought, but may not know file
  formats, rendition terms, license vocabulary, or every target Site.
- Needs upload progress that survives navigation, truthful recovery copy, a
  short permission/safety check, and the ability to finish details later.
- Must never be told that upload completion made anything public.

### Communications coordinator

- Uploads event batches, finds exact duplicates, applies genuinely common
  source/credit facts, resolves exceptions, and reuses media across Sites.
- Needs keyboard-efficient review, stable filters, a **Review next item** flow,
  and an accurate **Used in** impact view.
- Should not repeat metadata per Page or wait for every file in a batch before
  fixing one failure.

### Page editor

- Starts in a Page, not in a DAM.
- Needs qualified results for the current Site and slot first, a fast existing-
  versus-new choice, actual aspect-ratio preview, usage-local crop, and clear
  accessibility language.
- Must not see provider paths, hashes, scan vendors, or unrelated restricted
  media.

### Translator or locale editor

- Reuses a visual when appropriate but writes the exact locale lineage's alt
  text and caption.
- Needs source text and translation state, no silent fallback, and no global
  update when one locale changes.

### Rights and media steward

- Confirms ownership or permission, attribution, Site/territory restrictions,
  evidence reference, and expiry.
- Needs a pre-expiry queue and exact affected uses, not a surprise release
  failure.

### Ministry-safety reviewer

- Reviews people, children, workers, locations, documents, badges, screens,
  backgrounds, and activities that may create risk.
- Needs protected previews, bounded reason codes, current policy context, an
  audit trail, and immediate adverse withdrawal.
- Ordinary users must not learn that a restricted item exists from a thumbnail,
  title, search count, duplicate warning, URL, or error.

### Publisher

- Needs exact candidate blockers and affected Pages/Sites.
- Can include an approved immutable revision in a D1 release but cannot treat
  upload, metadata completion, or a provider URL as publication.

### Support or incident responder

- Needs a redacted operational view of stalled uploads, processing failures,
  missing bytes/renditions, expiring rights, stale usage projections, and
  takedown convergence.
- Needs safe retry/reconcile actions without editing product truth or viewing
  sensitive content unnecessarily.

### Departing staff handoff

- The organization retains catalog records, source/rights evidence references,
  versions, activity, and uses after an uploader leaves.
- Transient filters disappear with the user's session; no personal saved-view or
  uploader-owned folder can make organizational media unreachable. Asset
  authority never depends on the uploader's active account.

### Public visitor or donor

- Receives fast, correctly sized media without original filenames, EXIF/GPS,
  private metadata, layout shift, inaccessible alternatives, or unsafe stale
  content.
- Experiences the exact D1 generation rather than a mutable “latest” file.

## Ethical communication is product behavior, not a warning checkbox

International-development and child-safeguarding guidance makes rights and
safety materially different from ordinary marketing DAM metadata:

- Dóchas asks NGOs to respect dignity, privacy, and security; record consent;
  and retain relevant context with imagery.
- UNICEF says a child's safety and best interests outrank advocacy, requires
  informed permission from the child and guardian where appropriate, and warns
  that a home, community, background, or approximate location can create harm
  even when a name is omitted.
- Save the Children's 2024 guidance centers do-no-harm, anti-racism, inclusion,
  accountability, and locally led storytelling.
- ICRC guidance recognizes the right to object or withdraw and calls for
  specialist review where publication can heighten vulnerability.

D27 should not reproduce policy manuals in every upload. It should ask one calm
plain-language safety question, disclose required fields according to the
selected rights basis, and route uncertainty to qualified review:

> Could this media identify a person, child, location, document, badge, screen,
> or ministry activity that may need safety review?

Answers are **No**, **Yes**, and **Not sure**. **Yes** and **Not sure** keep the
item private and create an actionable review state; they do not accuse the
contributor or imply legal liability.

Source choices are progressively disclosed:

- Created or owned by our organization
- Provided with permission
- Licensed
- Public domain
- Source or permission is not yet known

Only the selected basis reveals its necessary evidence, credit, expiry,
territory, or Site questions. Sensitive evidence is referenced from a protected
owner; it is not copied into searchable Media metadata.

Sources:

- [Dóchas Guide to Ethical Communications](https://dochas.ie/resources/ethical-communications/guide-to-ethical-communications/)
- [UNICEF ethical reporting guidelines](https://www.unicef.org/media/reporting-guidelines)
- [Save the Children / Bond 2024 ethical content guidance](https://resourcecentre.savethechildren.net/document/putting-the-people-in-the-pictures-first-2024-updated-version-guidelines-for-the-ethical-production-and-use-of-content-images-and-stories)
- [ICRC ethical content gathering](https://www.icrc.org/en/article/ethical-content-gathering-public-communications)

## Exact information architecture

### Workspace name and navigation

Use **Media**, not “DAM,” “Files,” “Blobs,” or “Assets.” The quiet navigation is:

- **All media**
- **Needs attention**
- **Recently used**
- **Trash**

Do not create separate top-level pages for Uploads, Processing, Rights,
Versions, or Renditions. Those are facets and detail sections of Media.

Desktop composition:

- `StudioLayout` and the shared `PageShell` establish Core's normal shell.
- Header: **Media**, one-sentence description, current Tenant context, and the
  primary **Upload media** action.
- Optional collapsible folder rail at roughly 240–280 CSS pixels.
- Main result region.
- Detail inspector at roughly 360–420 CSS pixels only when opened.

At tablet width, folders use a sheet and details use a drawer. At narrow mobile
width, use one column and a persistent bottom action bar. No action depends on
hover, right click, drag, a wide table, or a second browser window.

### Toolbar order

1. Search
2. Quick filters: Type, Status, Site availability, Usage
3. **More filters**: rights expiry, source, uploader, upload date, folder, tags
4. Sort
5. Grid/list control
6. Upload

Filter state is URL-addressable in the full workspace, preserved through detail
inspection and Back, and represented with removable chips. The Page picker may
keep state in the dialog session but must restore the originating Page field and
focus when closed.

D20's Saved Library Views are deliberately not reused: they belong to one exact
Site-scoped D18 Content Library, while Media is Tenant-wide. D27 launches only
the four built-in Media views plus transient, URL-addressable permitted filters.
A future Media-specific saved-view decision must prove measured need, current-
authorization reapplication, and an explicit Tenant-wide personal/shared
ownership model instead of stretching D20 or storing provider-shaped queries.

### Media folders

The optional folder rail is a D27-owned private Media organizer, not D18's
Page/Article tree and not a storage browser. It provides **Unfiled**, one folder
per asset, opaque folder identity, same-Tenant parentage, and at most five named
levels. Folder names and paths never become URLs, provider keys, access,
publication, qualification, retention, or lifecycle.

**New folder**, **Rename**, **Move to folder**, and **Remove folder** are named
keyboard/touch/screen-reader commands; drag may enhance but never own movement.
Removal first shows direct-asset and child-folder counts, then one all-or-none
command moves direct assets to the parent or Unfiled and reparents immediate
children. It never deletes, trashes, unpublishes, or moves bytes. A stale count,
name collision, depth violation, lost capability, or concurrent change leaves
the tree unchanged and offers a plain refresh-and-retry path.

Phase 29 may later render or adapt this owner-supplied placement in generalized
file tooling, but it does not silently import Media into a byte/provider folder
or create a competing organization truth. Any unification is a separately
previewed and proved compatibility migration.

Use explicit pagination or **Load more** with preserved focus. Do not introduce
infinite scroll or the ARIA Feed pattern for an administrative catalog.

### Results grid

Each card contains:

- a purpose-sized private or qualified thumbnail, never the original;
- a two-line neutral staff title;
- type and dimensions;
- at most one adverse status badge when action is required;
- **Used in _n_ places** when the projection is current;
- a visibly reachable named actions menu; and
- an explicit checkbox only while selection mode is active.

Do not fill ready cards with positive badges. Do not place Trash, Replace, or
download controls directly on a thumbnail. The grid is a semantic list because
cards contain links, menus, and optional checkboxes; it is not a `listbox`. A
custom ARIA grid is forbidden unless the complete APG keyboard interaction is
implemented and manually qualified.

### Results list

The semantic table exposes:

- thumbnail and title;
- type and dimensions;
- derived staff status;
- rights/safety summary;
- Site availability;
- Used-in count; and
- updated date.

At narrow widths it becomes cards rather than a horizontally scrolling desktop
table. Shared Core responsive table abstractions should be reused when they fit
the interaction; the DAM does not fork a second table design system.

### Detail view

Sections appear in this order:

1. **Preview and status**
2. **Details**
3. **Rights & safety**
4. **Can be used on**
5. **Used in**
6. **Versions**
7. **Activity**
8. **Technical details**, collapsed by default

Contextual primary actions are **Use on page**, **Fix issue**, **Add new
version**, and **Move to Trash**. There is no ordinary **Download original** or
**Replace everywhere** action; generalized file retrieval remains Phase 29.

Technical details may expose opaque asset/revision IDs, verified type, digest,
processor/rendition profile, and storage-copy health only to an authorized
operator. They never expose tokens, signed URLs, object credentials, hidden
original names, EXIF/GPS, or consent document contents.

## Independent facts and calm labels

Do not store one giant lifecycle enum. Upload/processing, editorial
completeness, rights, safety, target-Site qualification, Trash, and D1 release
use change independently. Persist those facts and derive one calm card label:

- **Uploading**
- **Preparing for the web**
- **Needs details**
- **Under review**
- **Ready to use**
- **Unavailable for this Site**
- **Could not process**
- **Blocked for safety**
- **In Trash**

Each non-ready label opens a cause and one safe next action. **Uploaded** never
means ready or public. **Ready to use** means selectable under the current
qualification; it still does not mean live. D1 release status is displayed as a
separate **Used live on…** fact.

## Journey 1 — Single and bulk upload

The upload entry offers:

- drop files;
- **Choose files**; and
- **Take photo** where the device supports it.

Accepted kinds and source-size limits appear before selection. After selection,
one persistent upload tray follows the user through Media. It can be collapsed
but not silently discarded. Every file has an exact idempotent session.

Per-file states are:

- Queued
- Uploading with determinate progress when truthful
- Waiting for connection
- Uploaded—checking
- Preparing web sizes
- Duplicate found
- Needs details
- Ready
- Blocked
- Failed, with item-specific **Retry**

Bulk completion uses one useful summary:

> 16 ready · 3 need details · 1 could not be processed

It provides **Review next item**. Successful files remain complete; retry
targets only failures. **Apply to selected** is allowed for low-risk common
fields such as folder, tags, event, and source/credit when the user confirms the
facts are truly shared. It must not silently mass-assert consent, safety,
expiry, territory, or Site permission.

Resumability copy must match the qualified provider behavior. When guaranteed:

> Connection lost. We'll resume when you're online.

When not guaranteed:

> Connection lost. No duplicate was created. Retry this upload.

Leaving and returning must not create a second semantic asset. Cancellation
keeps a bounded recoverable session until reconciliation safely removes or
adopts the private orphan.

## Journey 2 — Duplicate resolution

An exact same-Tenant content digest offers:

> We found this exact file in your organization. Use the existing media item to
> keep its rights, versions, and usage together.

Default action: **Use existing**. Creating a separate semantic item requires an
authorized explicit reason because identical bytes can legitimately have
different rights, consent, source, or retention lives. No response, count,
timing, or title reveals a matching item in another Tenant.

Similar-image search, face recognition, and cross-Tenant physical deduplication
are not launch features.

## Journey 3 — Rights and safety

The detail flow leads with the plain source basis and safety question. It asks
only necessary follow-ups, saves partial progress, and makes **Not sure** safe.

Restricted media is row-hidden from ordinary users. Where a reviewer may know
the item exists but lacks preview permission, use a neutral protected-media
placeholder. An authorized reviewer explicitly reveals the protected preview;
the reveal, verdict, policy version, actor, and reason are audited.

Expiry produces an actionable advance queue, not noisy per-card warnings. D1
rechecks current qualification. If rights expire before a scheduled release,
the exact affected candidate is blocked with a link to repair or remove the
placement. When the earliest governing rights, consent, or safety expiry arrives
after release, current qualification and origin authorization become adverse
automatically; no staff action or new release is required. Such media always
uses controlled delivery whose freshness, stale allowances, and delivery-
retention deadline cannot cross the expiry after clock-skew margin. The affected
Live/Scheduled/Draft/Retained uses enter **Needs attention**, origin denial and
purge convergence stay visible, and the Media UI never improvises a silent
replacement or promises recall from already-downloaded copies.

For an already public safety or rights incident, an authorized reviewer uses
**Restrict and start takedown** from the exact asset/version. The consequence
step names what happens now—new use, release, and origin retrieval stop—and what
converges separately—managed CDN/browser caches and affected Pages. It requires
one bounded reason, re-proves current capability and impact, then calls the
cause-owned adverse command. This action requires D27's narrow
`public_media.restrict` capability; restricted-person or restricted-ministry
media also requires the Phase 10 `security_clearance` floor. A current Phase 10
reclassification/withdrawal can start containment independently and always
outranks a D27 **Allowed** result. Other staff see **Report a safety concern**,
which creates an urgent review item but never impersonates restriction
authority. Wrong-Tenant, stale-membership, or revoked-capability attempts reveal
nothing. The resulting incident view shows exact affected
Live/Scheduled/Draft/Retained uses, origin-block time, purge requested/completed/
failed state, oldest unresolved age, cause owner, and the next safe action. It
never auto-substitutes an image or promises erasure from downloaded or third-
party copies.

## Journey 4 — Choose media from a Page

The Page field opens one full-height responsive dialog titled **Choose media**.
Tabs are **Library** and **Upload**. The default result set is **Ready for this
Page and Site** and is pre-filtered for the exact presentation slot's compatible
media kind and rendition profile.

Qualified results are selectable. An authorized manager can enable **Show
unavailable media**; those cards are disabled and explain the exact reason and
safe next action. Unauthorized users receive no existence leak.

Selecting an image opens an inline use step:

1. Preview it in the actual slot aspect ratio.
2. Choose **This image adds meaning**, **This image is decorative**, **This
   image is a link or action**, or **This image contains essential text or
   detailed information**.
3. For ordinary meaningful media, answer **What should visitors understand from
   this image?** For the bounded text/detail branch, identify **Essential text**
   or **Chart, map, diagram, or other complex image**.
4. Recreate ordinary text as Page HTML. For an essential logo or faithful source
   artifact, provide its exact textual equivalent. For a complex image, provide
   concise alt plus a Page-owned visible or linked full equivalent. The UI shows
   the incomplete requirement beside the placement and D1 blocks until it is
   complete.
5. Configure usage-local crop/focal treatment.
6. Confirm **Use media**.

The sticky footer names the selected item and action. Closing returns focus to
the opening Page field. Uploading inside the dialog returns to the selection
journey after processing; it does not navigate to the Media workspace or lose
Page edits.

## Journey 5 — Accessibility and localization

A reusable asset may hold a neutral **Suggested visual description**, but every
placement owns:

- informative, decorative, functional, image-of-text, or complex-image
  treatment;
- locale-lineage-specific alt text;
- locale-lineage-specific caption;
- displayed credit when required;
- link/action semantics; and
- Page-owned visible or linked equivalent content when the treatment requires
  it; and
- usage-local crop or art direction.

Suggestions never overwrite an existing placement, become silent fallback, or
make an untranslated locale look complete. AI or machine-translated text, if a
later decision enables it, is suggestion-only and visibly requires human
review.

W3C explicitly makes alternative text dependent on purpose and context. The
same photo can be informative on one Page, decorative on another, and
functional when linked. The current global required `alt` field is therefore a
migration input, not final authority.

The common path remains three short choices. The fourth text/detail choice is
progressive disclosure for a real accessibility distinction, not a general
metadata form. Authors are prompted to use HTML for ordinary text. When the
visual form itself is essential, an image of text needs its exact words; a
complex chart, map, or diagram needs short alt plus a visible or linked full
equivalent. Long alt is not used as a hiding place for an entire data set.

Sources:

- [W3C Images Tutorial](https://www.w3.org/WAI/tutorials/images/)
- [Webflow per-instance alt treatment](https://help.webflow.com/hc/en-us/articles/33961330170643-Include-alt-text-on-images)
- [Sanity image type and context-specific crop/caption](https://www.sanity.io/docs/studio/image-type)

## Journey 6 — Crop, focal treatment, and presentation slots

The immutable source is never destructively cropped. The Page placement shows
only presentation-profile-owned outcomes such as Hero wide, Card, Square,
Portrait, or Social—not arbitrary pixel dimensions.

Controls include:

- drag;
- click or tap to set focus;
- arrow-key adjustment;
- named directional or numeric controls;
- reset; and
- multi-aspect preview.

WCAG 2.2 requires a single-pointer alternative to dragging. Keyboard support
alone is not a substitute for a non-drag touch/mouse method.

Source: [WCAG 2.2 Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html).

## Journey 7 — Add a new version

**Add new version** creates an immutable candidate revision. It may carry
forward neutral title, folder/tags, and source references where still accurate;
it cannot assume consent, rights, safety, or visual-description facts remain
valid.

The version view shows:

- current released revision;
- candidate revision;
- visual comparison;
- processing and qualification state;
- affected Pages and Sites; and
- **Include in next release** when authorized.

Current D1 generations continue to serve their exact old rendition. When a
successor activates, an older cached or in-flight Page may continue loading its
exact immutable media through a bounded **delivery-retained** route until the
published cache-lifetime deadline passes. This is invisible in ordinary UI and
does not make private recovery history public; current Phase 10 or other adverse
restriction still blocks origin immediately. Preview can show the candidate.
Only an authorized successor D1 release changes a use; recovery creates a newly
validated forward successor selecting privately retained safe versions. This
deliberately rejects global mutable replacement behavior
documented by Storyblok, Webflow, and Bynder.

## Journey 8 — Used in and impact

The rebuildable **Used in** projection covers:

- draft Pages;
- current Preview candidate;
- scheduled exact revisions;
- active D1 generation;
- bounded delivery-retained generations still serving a coherent cached Page;
- private recovery-retained generations;
- reusable sections/content;
- Navigation and presentation-package references;
- SEO/social placements; and
- any other exact public-projection owner.

Group uses by Site and then **Live**, **Scheduled**, **Draft**, and **Retained**.
Inside Retained, authorized detail distinguishes temporary **Finishing cached
delivery** from private **Available for recovery**; neither label appears as an
ordinary status badge.
Every row links to the exact owner the actor may access. A hidden owner is
reported as an authorized aggregate, not leaked by title or URL.

Never say **Unused** or **Safe to delete** while projection health is stale:

> Usage check is still updating. Try again before permanent disposal.

Storyblok's References and comparable CMS link views validate the staff need;
Webflow's documented custom-code exception demonstrates why provider-native
references alone are incomplete.

## Journey 9 — Trash, restore, and disposal

Moving an asset to Trash:

- stops new selection;
- does not break live or retained generations;
- shows exact impact first; and
- records actor, time, and reason.

Impact copy:

> This photo is used on the current website and in 2 drafts. Moving it to Trash
> will stop new use. The current website will not break.

Restore makes the semantic item available to authorized staff again but does
not republish, reactivate a candidate, or restore expired rights.

There is no **Empty Trash**. Permanent disposal requires current reference-
projection health, retention, hold, rights/safety incident, backup, and custody
proof. It uses the provider API through Phase 29 and never a direct Storage
metadata delete.

### Retention settings without a policy engine

Only a user with **Manage media retention policy** sees **Media settings →
Retention**. The launch screen has one bounded rule summary, not a workflow
builder:

> Keep public media for at least **{duration}** after it is both in Trash and no
> longer needed by live, Preview, scheduled, cached-delivery, or recovery
> history. Files are never deleted automatically.

An approved version records its effective date, policy/reference link, actor,
and reason. Changing it creates a new version and shows a plain-language before/
after comparison. If no version exists, the UI says **Keep until an authorized
review explicitly approves disposal**. Reducing the duration never queues or
executes deletion; a fresh, separate disposition review is still required.
Increasing it—or a new legal, consent, safeguarding, incident, source, or hold
constraint—immediately blocks pending disposal.

A source-owned **Must be disposed by {date}** obligation appears separately
from **Keep until {date}**. If those instructions conflict, the interface says
**Policy conflict—legal/records review required**, identifies the accountable
owner without exposing protected evidence, and offers no destructive shortcut.
The system never silently treats an erasure deadline as permission to bypass a
hold, or a retention floor as permission to ignore a source-owned deadline.

The disposition review shows **Why this cannot be deleted yet** or, when every
gate is healthy, the exact evaluated policy version, earliest eligible time,
affected copies, irreversible consequence, accountable actor, and confirmation.
Execution rechecks current policy and references; if either changed, the UI
says what changed and returns to review rather than offering **Try again** on a
stale destructive action. Ordinary contributors see only concise outcomes such
as **Kept by your organization's media-retention policy until {date}**.

## Journey 10 — Failure and recovery

Every failure states what remains safe, what did not happen, and one next step:

- **Missing rights:** “This photo is uploaded, but it cannot be used yet. Add
  its source and confirm that your organization may publish it.”
- **Safety before first release:** “This photo may reveal a person or location
  that needs review. It remains private and cannot be released.”
- **Safety after public use:** “This photo was public and is being restricted.
  New use, release, and origin access are blocked. Managed cache removal is
  still being checked.”
- **Processing:** “We couldn't prepare the web versions. The upload remains
  private and cannot be used yet. Retry processing.”
- **Upload-intake outage:** “New uploads are temporarily unavailable. Use only
  existing media that is still shown as ready for this Site.”
- **Delivery/storage outage:** “Some media may not load. Affected new releases
  are blocked while current live impact and recovery are checked.”
- **Permission:** “You can view this media, but you cannot change its rights
  information. Ask a media manager.”
- **Restore:** “Restored. It is available to authorized staff again, but it was
  not republished.”

Copy is selected from the exact failed subsystem and current asset/release
facts; a generic provider error never promises privacy or continued delivery.
Partial batch success is preserved. A timeout never encourages an unsafe blind
second upload or claims failure when the provider result is indeterminate.

## Accessible interaction contract

- Reuse Core fields, buttons, dialogs/drawers, menus, filter patterns, tokens,
  focus treatments, and error-summary conventions.
- Minimum 44×44 CSS-pixel touch targets.
- No hover-only, drag-only, color-only, or pointer-precision-only action.
- Visible focus; sticky bars do not obscure focused controls.
- Dialog focus containment, Escape behavior where safe, and exact focus
  restoration.
- Inline errors plus linked error summary; focus the summary after a failed
  submit, not on every keystroke.
- Polite `role="status"` summaries for upload completion and state change;
  `role="alert"` only for an actionable interruption.
- Do not announce every percentage tick. Announce the focused file's meaningful
  state changes and one batch summary.
- Result thumbnails normally use `alt=""` because the adjacent staff title
  identifies the item; the public placement's contextual description belongs
  in the placement editor.
- Checkbox name: **Select {media title}**.
- Menu name: **Actions for {media title}**.
- Honor reduced motion; no autoplaying preview or decorative progress loop.
- Support 320 CSS-pixel reflow, 200–400% zoom, forced colors, high contrast,
  RTL, CJK, long names, long translations, and text expansion.
- A crop canvas may use the WCAG two-dimensional-editor exception, but every
  instruction, field, and alternative control still reflows and remains
  reachable.

Sources:

- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- [WCAG reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- [WCAG focus not obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html)
- [ARIA modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)

## Empty states

First use:

> **No media yet**  
> Upload approved public photos for your organization. Uploads stay private
> until they are ready and included in a website release.

No result:

> **No media matches these filters**  
> Clear filters

Needs attention is empty:

> **Nothing needs attention**  
> Media with missing details, expiring rights, or processing problems will
> appear here.

Trash is empty:

> **Trash is empty**  
> Media moved out of active use will remain recoverable here under your
> organization's retention policy.

## Capability model presented through tasks

The product uses granular server capabilities, while onboarding may bundle
them into familiar roles:

- **Contribute media:** create upload sessions, finish permitted details, and
  view ordinary ready items.
- **Manage media:** edit neutral metadata, folders/tags, create candidate
  versions, and move/restore Trash.
- **Review rights and safety:** view protected evidence/preview according to
  policy and issue bounded verdicts.
- **Restrict public media:** start a media-specific adverse action; for a
  restricted person/ministry, Phase 10 `security_clearance` is also required.
- **Use media:** select qualified media for an exact Site and placement.
- **Publish Site:** include exact qualified revisions through D1.
- **Manage media retention policy:** append an effective-dated bounded policy
  version; cannot auto-purge or override stricter source/hold rules.
- **Operate custody:** reconcile, retry, quarantine, and diagnose without
  editorial or publication authority.
- **Authorize disposal:** approve Phase 29 physical disposition only after
  independent gates.

Do not build arbitrary per-asset ACL matrices. The bounded exception is a
safety-restricted visibility class with a named capability. Site-only editors
see target-Site-qualified media; Tenant media stewards see ordinary Tenant-wide
catalog records. The UI reflects server decisions and never becomes the
authorization boundary.

## Comparable-product synthesis

| Product    | Keep                                                                                                | Bound or reject                                                                                                |
| ---------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Payload 4  | Upload collection, bulk/crop/focal/image-size primitives, folders, custom UI, storage adapters      | Generic lifecycle as authority; re-upload mutation; default URL paste; assuming announced DAM work is complete |
| Sanity     | Reusable asset separated from usage-local crop, hotspot, caption, and source; version containers    | Enterprise-library dependency; public original-name assumptions                                                |
| Storyblok  | Folder/tag organization, bulk work, focal point, localized metadata, References                     | Global replacement; permanent delete-all; one public/private toggle as complete safety                         |
| Webflow    | Simple picker, per-instance alt override, locale-specific image choice                              | Public-on-upload; URL-changing replace; incomplete custom-code usage graph                                     |
| Cloudinary | Preview/detail split, structured metadata, advanced filters, protected delivery, immutable asset ID | AI/face search, arbitrary transformations, creative workflow and add-on sprawl at launch                       |
| Bynder     | Rights expiry, limited use, version history                                                         | Shared-collection permission leakage and automatic latest activation                                           |

Sources:

- [Sanity Media Library](https://www.sanity.io/docs/media-library)
- [Storyblok Assets](https://www.storyblok.com/docs/manuals/assets)
- [Webflow Assets panel](https://help.webflow.com/hc/en-us/articles/33961269934227-Assets-panel)
- [Cloudinary DAM overview](https://cloudinary.com/documentation/dam_digital_asset_management)
- [Cloudinary structured metadata](https://cloudinary.com/documentation/dam_manage_metadata)
- [Cloudinary advanced search](https://cloudinary.com/documentation/dam_advanced_search)
- [Contentful asset management](https://www.contentful.com/help/media/managing-assets/)

## Launch product profile and anti-bloat line

The complete D27 launch experience is for **public still images** used by D7
Media/Gallery, Page/Article presentation, SEO/social, and D9 certified packages.
It includes JPEG, PNG, WebP, AVIF, and common HEIC/HEIF camera intake only
through a certified safe decoder and deterministic re-encoding. Multi-frame
animation, SVG, uploaded video/audio, PDFs, fonts, icons, package source files,
private documents, form attachments, and arbitrary URL import are different
safety/accessibility/custody products and are not admitted by pretending they
are images.

The closed kind-profile catalog and custody port are additive, so a future
certified public-document or audiovisual profile does not rewrite asset,
revision, qualification, placement, usage, or D1 identity. That seam is prudent
future compatibility; implementing speculative processors or UI now is not.

Do not launch:

- AI tagging, face recognition, visual similarity, or background removal;
- comments, annotation canvases, creative approval chains, external brand
  portals, or public share links;
- arbitrary tenant metadata schemas or workflow builders;
- stock-provider and remote-URL import;
- arbitrary transformations or staff-entered pixel sizes;
- cross-Tenant asset sharing or visible cross-Tenant dedupe;
- folders as permissions, publication, retention, or Site eligibility;
- destructive global replace or Empty Trash; or
- a second catalog, workflow queue, design system, or release head.

## Measurable launch acceptance

### Task and comprehension tests

Run two moderated rounds with at least 24 unique participants from at least six
nonprofit missions organizations. Record at least three task observations for
each named perspective: missionary/mobile contributor, communications/media
manager, office administrator, Page editor, locale translator, rights steward,
ministry-safety reviewer, publisher, support/incident responder, departing-staff
handoff, and public visitor/donor. One real participant may cover more than one
role but counts only once per metric for one task attempt. Include at least six
constrained-mobile participants and four assistive-technology users.

Map the perspectives to explicit work: contributors upload/recover; media staff
find, organize, bulk-review, and version; Page editors choose/crop/describe;
translators complete an exact locale; rights/safety staff review and withdraw;
publishers resolve a D1 candidate; operators diagnose processing and takedown;
an administrator proves offboarding preserves organizational media; and public
visitors verify correct responsive output, alternatives, and privacy.

For every percentage below, the denominator is all eligible completed attempts
for that exact task. Each scored task has at least 10 independent attempts across
at least three organizations; each persona-specific journey has at least three.
An overall rate cannot hide a cohort below 80%. The two zero-misconception gates
are literal zero across all participants and both rounds.

- At least 90% complete upload-and-place without assistance.
- Median qualified reuse is under 45 seconds.
- At least 90% correctly explain **Ready to use**, **Unavailable for this
  Site**, **Add new version**, and **Move to Trash**.
- Zero participants believe upload alone publishes media.
- Zero participants expect Restore to republish media.
- At least 90% identify the next safe action from every tested blocked state.
- At least 90% correctly classify an ordinary, decorative, functional,
  image-of-text, and complex-image placement and complete the required
  equivalent without assistance.

### Journey fixtures

1. Upload a 6 MB phone photo at 400 Kbps and 300 ms RTT with two disconnects;
   exactly one semantic asset/revision survives.
2. Upload 50 files: 42 ready, four duplicates, two oversized, one corrupt, and
   one safety review; preserve successes and give every exception a cause and
   recovery action.
3. At 25,000 assets, find a known photo by title/source/folder/tag within 30
   seconds and preserve filters through detail/Back.
4. A Site A editor gets only compatible, currently qualified results and no
   Site B or restricted-media enumeration.
5. Reuse one image as descriptive, decorative, and functional across two
   locales without one use mutating another or silent fallback.
6. Complete crop/focal work with mouse drag, touch without dragging, and
   keyboard at 400% zoom.
7. Add a logo candidate while the old revision is live on three Sites; live
   remains unchanged until D1, and recovery advances a newly validated successor
   selecting the retained prior versions.
8. Move an asset used in live, scheduled, draft, and retained contexts to
   Trash; list all four, preserve output, block disposal, and restore without
   republishing.
9. Hide restricted-worker media from an ordinary editor; audit every qualified
   reveal and verdict; expose no public original, name, thumbnail, or rendition.
10. Expire a license before a schedule; block the exact candidate with affected
    uses and no silent live improvisation.
11. Withdraw one already-live restricted-worker image: immediately deny new
    use/release/origin retrieval, expose exact authorized impact, invoke purge,
    show honest cache convergence and failures, and never auto-substitute or
    claim downloaded copies disappeared.
12. Activate generation G+1 while cached/in-flight HTML from G requests its
    exact image: the G image remains readable only through bounded delivery
    retention, no request mixes generation bytes, recovery retention alone is
    private, and a current safety restriction still denies origin.
13. Exercise restriction as an authorized same-Tenant reviewer, a reviewer
    lacking Phase 10 clearance for restricted-worker media, a wrong-Tenant
    actor, and an actor whose capability was revoked between dialog open and
    submit; only the exact current authority succeeds and denials do not reveal
    protected media.
14. With no Tenant retention version, prove retain-until-explicit-review and no
    automatic purge. Then strengthen and shorten effective-dated versions while
    a disposition is pending; strengthening fences it, shortening performs no
    deletion, and every execution re-proves the current policy/reference set.
    Add a source-owned required-disposition deadline that conflicts with a hold;
    show one cause-owned legal/records exception and perform no automatic
    deletion.
15. Offboard an uploader and prove the Tenant retains its Media identity,
    versions, folder placement, evidence references, uses, and activity while
    the former actor loses access.
16. Render representative public Pages for anonymous visitors on mobile, slow
    network, screen reader, zoom, and no-JavaScript paths with the exact active-
    generation media, contextual alternatives, no private metadata, and no
    avoidable layout shift.
17. Place an ordinary poster, an essential logo/source artifact, and a complex
    ministry-impact chart. Guide the poster content to HTML, require the exact
    text equivalent for the essential image of text, require concise alt plus a
    visible or linked full equivalent for the chart, and block D1 while either
    required equivalent is missing in any locale lineage.
18. Release an otherwise ordinary image under a license expiring at time T.
    Prove controlled-delivery freshness, stale allowances, and delivery
    retention end before T after clock skew; at T, both active and delivery-
    retained origin requests deny automatically, affected uses enter Needs
    attention, purge convergence is visible, and no human restriction action or
    new release is required.

### Accessibility matrix

- Keyboard-only.
- NVDA/Firefox and JAWS/Chrome on Windows.
- VoiceOver/Safari on macOS/iOS.
- 320 CSS pixels, 200% and 400% zoom.
- Forced colors/high contrast, reduced motion, RTL, CJK, and long translation
  fixtures.
- No critical automated findings plus manual dialog, focus, status-message,
  drag-alternative, error-summary, and protected-preview verification.

### Experience/performance budgets

- Catalog results never fetch originals.
- First actionable result within 2.5 seconds on the agreed constrained-network
  profile.
- Search result response p95 at or below 750 ms for the agreed 25,000-item
  Tenant fixture.
- Search input remains responsive while results update.
- Ordinary thumbnail transfer averages at or below 100 KB.
- Upload progress remains truthful, cancelable, and recoverable.
- Processing p50/p95, oldest queue age, retry/recovery, and projection lag are
  operationally visible.

These are release gates, not aspirations. The UI is “perfect” only when the
named people can complete the named tasks safely and measurably.
