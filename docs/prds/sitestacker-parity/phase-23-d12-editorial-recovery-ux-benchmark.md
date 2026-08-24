# Phase 23 D12 Editorial Recovery UX Benchmark

- **Status:** Research evidence and UX benchmark for the founder-selected
  B-prime option; not yet a ratified Phase 23 decision
- **Date:** 2026-08-22
- **Scope:** Autosave, save status, one active editor, view-only and takeover,
  network and session failure, revision conflicts, history, restoration,
  accessibility, and mobile behavior
- **Authority:** This document informs the Phase 23 D12 adversarial review. It
  does not authorize implementation, schema changes, provider adoption,
  migration, deployment, release activation, or production change.

## Executive conclusion

The strongest launch design is not manual-save-only and not Google-Docs-style
simultaneous collaboration. It is a calm, draft-first editor with:

1. one exact, server-authoritative working draft;
2. one renewable active-editor lease scoped to the exact resource and editing
   session;
3. debounced and coalesced autosave that never changes public authority;
4. an expected-revision compare-and-swap check on every write;
5. one persistent, plain-language save and collaboration status surface;
6. an explicit, permissioned takeover that preserves acknowledged work and
   never silently discards the displaced editor's local work;
7. a bounded history that separates one rolling recovery autosave from
   meaningful checkpoints; and
8. restoration only as a new private draft after comparison and current-state
   reproof.

That model borrows mature interaction lessons from Payload, WordPress,
Contentful, Webflow, Google Docs, and Shopify without inheriting any provider's
data model, product status vocabulary, default timing, or unsafe conflict
semantics. It deliberately excludes simultaneous editing, live cursors,
automatic field or block merging, persistent offline-first authoring, and an
additional version engine.

## Authority boundary

The external products below are **evidence and inspiration**, not Phase 23
authority:

- Payload is the qualified private authoring provider. Its drafts, versions,
  autosave, and document locks are implementation primitives, not the public
  publication contract.
- Phase 23 D1 remains the only ordinary Site Plan publication authority. A
  save, autosave, preview, checkpoint, takeover, compare, or restore never
  changes the public Site Plan generation.
- The installed Payload build and Core's adapter behavior outrank current
  public Payload examples where they differ.
- Contentful, Sanity, WordPress, Webflow, Shopify, and Google Docs demonstrate
  interaction choices and failure costs. Their status models and collaboration
  architectures are not imported.
- W3C guidance supplies accessibility requirements and established interaction
  patterns. It does not choose the domain lifecycle.

## Primary-source benchmark

### Payload CMS

Payload's documented model separates draft saves from publication. With
autosave enabled, the Admin UI shows when a document was last saved; repeated
autosaves are coalesced so they do not necessarily create an unbounded version
row for every edit. Payload also documents one active lock holder, read-only
inspection, takeover, return, and a five-minute default inactivity expiry.
These are useful primitives for B-prime. [Payload autosave](https://payloadcms.com/docs/versions/autosave),
[drafts](https://payloadcms.com/docs/versions/drafts),
[versions](https://payloadcms.com/docs/versions/overview), and
[document locking](https://payloadcms.com/docs/admin/locked-documents).

What D12 should adopt:

- automatic draft recovery without automatic publication;
- coalesced autosaves;
- read-only entry when another person is editing;
- explicit takeover rather than silent lock stealing; and
- visible last-save feedback.

What D12 must harden or replace:

- provider-default intervals, lock duration, and version retention;
- provider terminology in the staff UI;
- any assumption that a lock alone prevents stale writes;
- any user-scoped Local API mutation that inherits Payload's documented
  `overrideLock: true` default; and
- raw provider restore behavior instead of a product-owned restore-as-draft
  command.

### Webflow

Webflow's 2025 CMS autosave release removed the repetitive save step, preserved
edits as drafts, labeled a published item with pending work as **Changes in
Draft**, and concentrated the remaining action menu on publication. That is a
strong model for keeping routine saving quiet while keeping the next deliberate
action clear. [Webflow CMS autosave](https://webflow.com/updates/cms-auto-save).

Webflow also exposes an important warning. Its June 2026 content-editor guide
still says that when people edit the same content simultaneously, the last edit
wins. B-prime should explicitly reject that behavior; a calm interface cannot
justify silent data loss. [Webflow content editing](https://help.webflow.com/hc/en-us/articles/33961251014931-Edit-site-content-as-a-content-editor).

Webflow creates named or automatic backup points, requires a saved-state
indicator before a manual backup, lets staff preview a backup before restoring,
and creates another backup before restoration. Its documentation also exposes
how restoration can affect IDs, schedules, integrations, inventory, security
settings, and locales. The lesson is that restore needs impact preview and must
not be treated as a simple undo button. [Webflow backups](https://help.webflow.com/hc/en-us/articles/33961244069395-Save-and-restore-backups).

What D12 should adopt:

- **Published · Unpublished changes** as an immediately understandable state;
- automatic recovery with publication kept explicit;
- a preview-before-restore step; and
- preservation of the current state before restoration.

What D12 must reject:

- last-write-wins;
- whole-site destructive restoration for a page-level editorial mistake; and
- a green saved indicator before the exact revision is server-acknowledged.

### Contentful

Contentful distinguishes **Draft**, **Published**, **Changed**, and **Archived**.
Its **Changed** state means the old published content remains available while
newer edits are private. This is strong evidence for expressing both public and
draft state in one short line rather than showing staff a provider status code.
[Contentful entry status](https://www.contentful.com/help/content-and-entries/entry-editor-sidebar-overview/)
and [state semantics](https://www.contentful.com/developers/docs/tutorials/general/determine-entry-asset-state/).

Contentful can merge edits made to different fields but warns when two people
edit the same field. That is reasonable for simple independent fields, but it
is not safe evidence for automatically merging nested page sections where a
move, delete, relationship change, or schema migration can overlap
semantically. [Contentful version-conflict resolution](https://www.contentful.com/developers/changelog/version-conflict-resolution/).

Contentful also treats autosave as a distinct webhook cause, and documents a
five-second active-edit cadence that can emit repeated autosave events. That is
direct evidence that Core must classify and coalesce autosave effects instead
of allowing routine typing to trigger ordinary integrations, notifications,
audit noise, or publication work. [Contentful webhook behavior](https://www.contentful.com/developers/docs/extensibility/webhooks/overview/).

What D12 should adopt:

- a plain-language public-versus-draft state;
- an out-of-date warning that preserves both sides; and
- an explicit autosave event class.

What D12 must reject:

- automatic field-level merging for structured block arrays;
- per-autosave downstream business effects; and
- assuming ordinary document-read access automatically grants version-history
  access.

### WordPress

WordPress keeps a maximum of one rolling autosave per user and post, does not
let autosaves overwrite published content, identifies autosaves in history, and
offers recovery after power, browser, or network failure. It also supports
version comparison and bounded revision retention. This is the closest mature
analogue for low-complexity editorial recovery.
[WordPress revisions and autosaves](https://wordpress.org/documentation/article/revisions/).

WordPress's lock UI identifies the current editor and offers an authorized
takeover. When an editor loses the lock, WordPress attempts to save their latest
changes as a revision and explicitly tells them whether that revision was
saved. This is strong evidence that takeover must preserve the latest
acknowledged state and communicate the displaced editor's recovery boundary.
[WordPress lock notice source](https://developer.wordpress.org/reference/functions/_admin_notice_post_locked/).

What D12 should adopt:

- a bounded rolling autosave rather than per-keystroke history;
- recovery that does not overwrite published content;
- comparison before restoration;
- explicit takeover; and
- a clear displaced-editor message about what was saved.

What D12 must improve:

- one active editor means one active rolling slot is sufficient for the exact
  resource; takeover checkpoints preserve cause-specific history;
- recovery should be semantic for Page sections, not only an HTML/text diff;
  and
- restore should create a new private draft rather than present an ambiguous
  rewind.

### Sanity

Sanity keeps draft content separate from published content and exposes clear
published/draft history labels. It stores real-time edits as backend patches
and retains history according to a bounded plan period. This demonstrates both
the value of explicit public-versus-draft labels and the much larger
synchronization system required for true simultaneous editing.
[Sanity drafts](https://www.sanity.io/docs/content-lake/drafts) and
[history](https://www.sanity.io/docs/user-guides/history-experience).

What D12 should adopt:

- explicit draft and public markers in history; and
- bounded retention with the current draft and released revision preserved.

What D12 must not infer:

- that modern CMS software requires real-time coauthoring; or
- that patch streams, presence, convergence, and collaborative history are
  free consequences of autosave.

### Google Docs

Google Docs is a useful interaction benchmark because online changes save
without a save button, the last-edit control exposes who changed the file and
when, and history groups revisions and permits naming, comparison, restoration,
or copying an earlier version. Offline editing saves locally only when that
capability is enabled and later synchronizes to Drive. [Google Docs saving](https://support.google.com/docs/answer/49114),
[offline files](https://support.google.com/drive/answer/2375012), and
[version history](https://support.google.com/docs/answer/190843).

What D12 should adopt:

- quiet save feedback;
- human-readable last-editor and last-edit context;
- grouped meaningful history; and
- copying/restoring into a safe working state rather than erasing evidence.

What D12 must not import:

- Google-Docs-scale simultaneous collaboration;
- a promise of persistent offline editing at launch; or
- generic **Saved** copy for edits that exist only in browser memory.

### Shopify

Shopify's theme editor uses an explicit Save action, provides undo and redo only
for unsaved changes, and documents that those controls stop working after a
save. Its code editor exposes unsaved files and a per-file timeline, but
restoring a file replaces the complete file and cannot recover deleted files.
Shopify recommends duplicating a theme as a backup before broader changes.
[Shopify theme editor](https://help.shopify.com/en/manual/online-store/themes/customizing-themes/theme-editor/features-overview),
[theme-code history](https://help.shopify.com/en/manual/online-store/themes/customizing-themes/edit-code/edit-theme-code),
and [theme backups](https://help.shopify.com/en/manual/online-store/themes/customizing-themes/edit).

What D12 should adopt:

- a familiar `Ctrl`/`Cmd` + `S` **Save now** accelerator even though routine
  saving is automatic; and
- clear differentiation between session undo and durable version history.

What D12 should avoid:

- manual-save-only dependence;
- clearing the useful undo boundary without durable recovery; and
- requiring staff to duplicate an entire site as an ordinary safety step.

## Exact staff-facing state model

The UI should expose one persistent status control in the editor header. It is
both a readable summary and the entry point to **Save now**, **History**, and
recovery details. Publication remains a separate action.

| Product state                      | Visible copy                                                 | Primary behavior                                                                                               | Announcement behavior                                                                           |
| ---------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Server-clean draft                 | **Saved just now**                                           | No action required; details expose exact time and last editor                                                  | Do not repeatedly announce while idle                                                           |
| Local edit not yet sent            | **Unsaved changes**                                          | Debounce autosave; **Save now** remains available                                                              | Do not announce every keystroke                                                                 |
| Save in flight                     | **Saving…**                                                  | Continue editing; one coalesced next save may follow                                                           | Announce politely only if the state persists long enough to be meaningful                       |
| Save acknowledged                  | **Saved just now**                                           | Adopt returned revision token                                                                                  | Announce after explicit save or recovery from an error, not after every background cycle        |
| Released revision plus newer draft | **Published · Unpublished changes**                          | Existing public generation remains unchanged                                                                   | Announce when this state first appears, not on each edit                                        |
| Network unavailable before send    | **Can't save right now · Changes remain in this tab**        | Retain local recovery buffer; retry with backoff; offer **Try now**                                            | Announce once as an error; keep message visible                                                 |
| Save outcome uncertain             | **Checking whether your changes saved…**                     | Retry the same idempotent operation before declaring conflict                                                  | Polite progress announcement, followed by one conclusive result                                 |
| Authentication expired             | **Sign in again to keep editing · Your changes remain here** | Preserve local work, reauthenticate without replacing the editor, then reprove permission, lease, and revision | Move focus only when the user opens the sign-in dialog; preserve context after return           |
| Another session owns the lease     | **Alex is editing · View only**                              | Permit reading; show **Take over editing** only to authorized actors                                           | Persistent message; no repeated toast                                                           |
| Same actor owns another tab        | **This page is already being edited in another tab**         | Stay read-only or explicitly take over; never make both tabs writable                                          | Persistent message that identifies the tab/session condition rather than blaming another person |
| Lease lost or taken over           | **Sam is now editing · Your saved work is safe**             | Freeze mutation, preserve local unsent work, and offer recovery comparison                                     | Blocking dialog only when continued typing could mislead the editor                             |
| Revision mismatch                  | **This draft changed while you were editing**                | Preserve local candidate, stop blind retry, and open deliberate comparison                                     | Persistent error plus an operable review action                                                 |
| Permission revoked                 | **Your access changed · These changes were not saved**       | Stop all writes; preserve only the minimum in-tab recovery allowed by current safety policy                    | Blocking message; never imply reauthentication will restore authority                           |
| Validation incomplete during draft | **Draft saved · Fix 3 items before publishing**              | Keep draft recovery independent from release validation                                                        | Announce summary once; link to the first error and an error summary                             |

### Copy rules

- **Saved** means the server acknowledged the exact revision now held by the
  client. Queued, debounced, in-flight, locally cached, or retrying work is not
  saved.
- **Published** means the D1 public generation contains that exact revision. It
  never means merely saved or selected for release.
- Do not expose **lock**, **CAS**, **version row**, **autosave overwrite**, or
  **Payload** in ordinary staff copy.
- Use an exact timestamp and actor in the status detail. Relative copy such as
  **just now** is a convenience, not the only audit fact.
- Avoid success toasts for routine autosaves. The stable status line is quieter
  and remains available after the animation would have disappeared.

## Recommended interaction flow

### 1. Opening an editor

The server returns the exact source revision, current public relationship,
current actor permissions, and lease result together. The editor does not first
render as editable and then demote itself after a second request.

- If the lease is available, the browser receives a session-specific lease and
  enters edit mode.
- If another session owns it, the editor opens read-only with the editor's
  display name, last known activity time, and the actions the current actor may
  actually perform.
- A same-user second tab is described as another tab, because a user-level lock
  would otherwise allow the two tabs to overwrite each other.
- If current read authority is absent, the resource does not open merely
  because an old lock or version URL exists.

### 2. Editing and autosaving

- Mark the document locally dirty immediately after a user edit.
- After a short idle debounce, send one save with the lease identity, expected
  source revision, idempotency key, Tenant, Site, resource, and locale context.
- Continue coalescing new input while one save is in flight. Do not start
  overlapping writes for the same editor session.
- Adopt a new expected revision only from the server acknowledgement.
- Clear the local dirty state only for the exact acknowledged content. Edits
  made during the request remain dirty and trigger the next coalesced save.
- Keep **Save now** in the status menu and support `Ctrl`/`Cmd` + `S`; it flushes
  the current candidate but does not publish.
- A draft autosave must not generate ordinary donor, integration, notification,
  cache-purge, SEO, analytics, or release effects.

### 3. Preview, publication preparation, and navigation

- Preview flushes pending work and opens only after the exact revision to be
  previewed is acknowledged. If saving fails, Preview explains why it cannot
  show the unsaved candidate rather than silently previewing an older draft.
- Publication preparation binds one exact acknowledged revision. Later
  autosaves remain draft and cannot change the selected release payload.
- Internal navigation first attempts a bounded flush. If work remains only in
  the tab, a persistent leave warning offers **Stay and retry** or **Leave and
  discard unsaved changes**. It is shown only while real unsaved work exists.
- Browser close and reload receive the same warning only while local work is
  unacknowledged. A permanently enabled warning trains users to ignore it.

### 4. Active-editor lease

The lease is a coordination hint and UX affordance, not the integrity
backstop. Expected-revision CAS remains mandatory.

- Scope it to Tenant, Site, resource family, resource identity, locale where
  independently edited, actor, and browser editing session.
- Renew it while the authenticated editor is visibly active, not only when a
  save changes content. A writer may spend several minutes reading or thinking.
- Release it best-effort on intentional exit; expiry handles crashes, laptop
  sleep, and lost connectivity.
- When a mobile or desktop tab resumes after suspension, reprove lease,
  revision, and permission before accepting another server write.
- Do not expose a countdown during healthy editing. Surface the lease only when
  it changes the user's available action.

### 5. View-only and takeover

Read-only is a usable mode, not a dead-end error screen. Staff can inspect the
current draft and public preview, follow references, and return to the page
list. Editing controls are disabled semantically and visually rather than left
active until a failing save.

Only an actor with explicit takeover authority sees **Take over editing**.
Activation opens a concise confirmation:

> **Take over editing?**
>
> Alex will switch to view-only. Alex's latest saved changes are safe. Changes
> that have not reached the server may remain only in Alex's browser.

The safer cancel action receives initial focus. Confirmation atomically
re-proves permission, lease, and current revision, preserves the current server
draft as a cause-labelled pre-takeover checkpoint, transfers the lease, and
records the actor and reason. It does not attempt to fetch or merge unsent
content from the displaced browser.

The displaced editor is interrupted once because continued editing would be
misleading:

> **Sam is now editing this page.**
>
> Your latest saved changes are safe. Any unsaved changes are still in this tab
> and have not been added to Sam's draft.

The displaced editor may compare or copy their unsaved text only while current
safety and read authority still permit it. The UI never reloads and discards
that local candidate automatically.

### 6. Network failure and lost acknowledgements

There are three different failures and the UI must not collapse them:

1. **Not sent:** the browser knows the request never left; retain the candidate
   and retry after connectivity returns.
2. **Rejected:** the server returned a definite validation, permission, lease,
   or revision response; stop generic retry and present the cause-owned action.
3. **Outcome unknown:** the request may have committed but the response was
   lost; retry the same idempotency key and content identity to recover the
   acknowledgement before treating it as a conflict.

While unavailable, the browser may maintain one tab-scoped recovery buffer for
the exact actor, Tenant, Site, resource, locale, base revision, and editor
session. It is not called saved, is cleared after acknowledgement or secure
sign-out, has a short bounded lifetime, and is not synchronized as a second
draft. Phase 10 safety must qualify whether sensitive or restricted content may
use browser persistence; otherwise recovery remains memory-only and the copy
must truthfully say **keep this tab open**.

Persistent offline-first editing, background synchronization across devices,
and arbitrary offline queues are out of scope.

### 7. Session expiry and permission change

WCAG 2.2's reauthentication guidance says users should continue without losing
their entered data after authentication expires. D12 should preserve the
editor and its local candidate while reauthentication occurs, then reprove
current permission, lease, and revision before retrying. [WCAG 2.2 reauthentication](https://www.w3.org/WAI/WCAG22/Understanding/re-authenticating.html)
and [technique G105](https://www.w3.org/WAI/WCAG22/Techniques/general/G105).

Reauthentication does not override a revocation. If the actor no longer has
edit authority, the editor freezes, states that the unsaved candidate was not
saved, and follows the current safety policy for any recovery handoff. It does
not silently publish, save under a system identity, or let a stale browser
retain a lease.

### 8. Revision conflict

Every save includes the exact revision the editor believes it is extending. A
mismatch is not retried blindly and never last-write-wins.

The conflict view preserves three facts:

- **Started from:** the acknowledged base revision;
- **Current draft:** the latest authorized server revision; and
- **Your unsaved work:** the local candidate.

For the launch UX, do not attempt an automatic three-way merge of nested
sections. Present a semantic comparison and let the editor deliberately apply
their changes to the current draft. If the conflict cannot be resolved in one
session, preserve the local candidate as one cause-labelled recovery checkpoint
without making it the working draft or public authority.

The ordinary actions are:

- **Review differences**;
- **Continue from current draft**, keeping the recovery checkpoint; and
- **Use my version as the new draft** only for actors with the relevant
  overwrite/takeover authority, after preserving the current draft and
  re-running CAS.

There is no **merge automatically** action for blocks, relationships, paths,
navigation, localized values, or reusable-section references.

### 9. History and restoration

History is progressive disclosure from the status control, not a permanent
technical sidebar.

The default list contains meaningful checkpoints:

- current working draft;
- D1 publication markers;
- explicit **Save now** checkpoints when semantically meaningful;
- pre-takeover recovery;
- conflict recovery;
- restore-as-draft;
- unpublish or retirement causes owned elsewhere; and
- qualified import or migration checkpoints.

The rolling autosave is hidden during healthy editing and appears only when it
is the best recovery candidate. Each visible entry shows actor, cause, exact
time, Site/locale, public relationship, and a short semantic summary. It does
not expose raw Payload JSON or present every debounce as human-authored history.

Comparison defaults to a selected earlier checkpoint versus the current
server-authoritative draft. For Page blocks, it reports additions, removals,
moves, content changes, relationship changes, and profile/schema differences
semantically. Text-level detail remains available inside a changed field.

The only ordinary restoration command is **Restore as a new draft**. Its
confirmation explains:

- which checkpoint will be copied;
- that the current draft will remain in history;
- that the public website will not change; and
- that another publish action is required later.

Restoration re-proves current access, lease, source revision, Site/locale,
schema/profile compatibility, and referenced-resource validity. It creates a
new checkpoint; it never edits historical evidence in place.

## Desktop and mobile presentation

### Desktop

- Keep one compact status control adjacent to Preview and publication actions.
- Put lease/recovery explanations immediately below the header only when they
  require action.
- Use a full-height comparison surface for history, with the earlier and
  current revision clearly labelled and neither side editable.
- Keep the editor's keyboard focus and scroll position through ordinary
  autosaves.

### Mobile and narrow viewports

- Reflow to one column; do not compress a three-pane desktop editor into tiny
  columns. W3C identifies responsive one-column presentation as a standard way
  to preserve functionality at narrow widths. [WCAG reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).
- Keep the save state visible in a compact top bar. If the bar is sticky, it
  must not obscure the focused editor control. [WCAG focus not obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum).
- Put history comparison into labelled **Earlier** and **Current draft** tabs
  with a summary first; side-by-side is optional only when width permits.
- Present takeover and recovery actions as full-width labelled buttons, not
  icon-only controls.
- Use explicit move-up/move-down controls for ordered blocks in addition to
  drag gestures.
- Meet the repo's touch-target tokens and at least WCAG 2.2's 24-by-24 CSS-pixel
  minimum or sufficient spacing. [WCAG target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum).
- Treat mobile backgrounding like a suspended session. On resume, reprove
  permission, lease, and revision before accepting new writes; do not assume a
  heartbeat continued while the operating system suspended the tab.

Shopify's current theme editor provides a useful responsive precedent: its
multi-panel desktop editor changes to a stacked layout on narrower screens
instead of covering the page structure with settings. This is presentation
inspiration only. [Shopify responsive editor](https://help.shopify.com/en/manual/online-store/themes/customizing-themes/theme-editor/features-overview).

## Accessibility contract

WCAG 2.2 requires status messages to be programmatically determinable without
taking focus. It also emphasizes avoiding unnecessary interruption.
[WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).

Apply that requirement as follows:

- The visible save line uses a polite status region for meaningful transitions.
- Coalesce announcements. Do not announce **Saving** and **Saved** after every
  short debounce cycle while a person types.
- Announce the first failure, the successful recovery from failure, an explicit
  save result, a material publication-state change, and a new view-only state.
- Keep errors visible. Do not rely on color, an icon, hover, or an expiring
  toast.
- Ordinary saving never moves focus.
- A takeover or conflict that makes further editing unsafe may use a modal or
  alert dialog because it requires acknowledgement. Follow the WAI dialog
  pattern: labelled dialog, contained tab sequence, `Escape` where dismissal is
  safe, visible close/cancel action, least-destructive initial focus, and focus
  restoration. [WAI alert-dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/)
  and [modal-dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).
- All actions are keyboard operable. **Save now**, **History**, **Review
  differences**, and **Take over editing** cannot depend on hover or drag.
- Error summaries identify the number of release-blocking errors and link to
  the first affected field without discarding the current editing position.
- Read-only mode exposes its state programmatically; visually disabled controls
  are either truly disabled or replaced by their read-only presentation.
- Exact timestamps remain available to screen-reader and zoom users even when
  compact visual copy uses **just now**.

## Pitfall register and permanent prevention

| Pitfall                                       | What goes wrong                                                             | Prevention                                                                                        |
| --------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Optimistic **Saved**                          | The UI claims safety before server acknowledgement                          | Derive **Saved** only from the returned exact revision                                            |
| Lock without CAS                              | Expiry, same-user tabs, imports, or privileged calls overwrite newer work   | Require expected-revision CAS on every mutation                                                   |
| User-level lock identity                      | Two tabs for the same person both appear authorized                         | Bind lease to browser editing session as well as actor                                            |
| Activity means only typing                    | A person reading or thinking loses the lease unexpectedly                   | Renew while the authenticated visible editor remains active; retain TTL as crash recovery         |
| Infinite heartbeat                            | A forgotten background tab blocks everyone indefinitely                     | Stop renewal while hidden/suspended and require reproof on resume                                 |
| Immediate silent takeover                     | The first editor continues typing into a dead session                       | Confirm takeover, preserve a server checkpoint, and interrupt the displaced editor once           |
| Last-write-wins                               | Recent work disappears without a resolvable event                           | Reject stale revisions and preserve both candidates                                               |
| Blind automatic merge                         | Section moves, deletes, or relationships combine incorrectly                | Use semantic comparison and deliberate human resolution                                           |
| Retry with a new identity after lost response | A committed save is duplicated or appears as a conflict                     | Retry the same idempotency key before classifying the result                                      |
| Per-keystroke versions                        | History, audit, storage, and integrations become noisy                      | Debounce writes, coalesce one rolling autosave, and keep meaningful checkpoints                   |
| Autosave invokes business effects             | Typing triggers notifications, cache purge, webhooks, or publication        | Cause-classify autosave and keep its downstream behavior dark                                     |
| Local work called saved                       | Closing or crashing the browser loses supposedly safe work                  | Say it remains in this tab/browser and expose the recovery limit truthfully                       |
| Permanent offline queue                       | Stale work syncs later against changed policy or content                    | Exclude offline-first sync; use a bounded session recovery buffer only                            |
| Reauthentication implies authority            | Revoked users resume writing after login                                    | Reprove permission, lease, Tenant/Site, and revision after authentication                         |
| Raw provider restore                          | History can publish, unpublish, overwrite, or restore invalid relationships | Expose only compare plus restore-as-new-draft under product checks                                |
| Restore erases current draft                  | A correction destroys the work it is intended to repair                     | Checkpoint current draft first and append a restored draft                                        |
| Version-history access inherited accidentally | An editor sees another tenant's or restricted history                       | Apply explicit tenant- and resource-bounded version access on every read                          |
| Preview shows an older save                   | Staff approve a preview that omits their visible edits                      | Flush and bind Preview to the returned exact revision                                             |
| Publish means “latest later”                  | A worker releases edits that were never reviewed                            | Bind publication to the selected immutable acknowledged revision                                  |
| Toast-only failure                            | The error disappears or is missed by assistive technology                   | Keep a persistent status/action surface and announce the transition                               |
| Save-status chatter                           | Screen readers repeatedly interrupt composition                             | Coalesce polite announcements and reserve assertive treatment for actionable failures             |
| Sticky mobile status covers focus             | Keyboard and zoom users cannot see the active field                         | Verify focus visibility and responsive reflow at narrow widths                                    |
| Takeover leaks identity                       | An editor name or activity appears outside its tenant/scope                 | Return only the bounded display identity required for collaboration                               |
| Local recovery leaks restricted content       | Browser persistence survives sign-out or shared-device use                  | Scope, expire, and clear recovery; qualify persistence by safety tier                             |
| Schema/profile changes during editing         | A stale draft writes fields or blocks no longer valid                       | Stop save, preserve recovery, reload the qualified schema, and require deliberate reconciliation  |
| Resource deletion/retirement during editing   | The editor recreates or mutates a retired object                            | Reject save under current lifecycle authority and offer bounded recovery/export only if permitted |

## UX observability without content surveillance

Measure the workflow, not the content. Useful tenant-bounded events include:

- autosave attempted, acknowledged, rejected, and acknowledgement recovered;
- save latency and retry duration;
- failure class: connectivity, authentication, permission, lease, validation,
  stale revision, or provider error;
- lease contention, expiry, resume reproof, and takeover;
- local recovery offered and resolved;
- conflict review opened and resolution chosen;
- history comparison opened;
- restore-as-draft attempted, succeeded, or rejected; and
- navigation abandoned because unsaved work remained.

Do not record draft text, rich-text payloads, secret URLs, restricted-worker
details, or raw provider errors in analytics. Operational logs retain exact
correlation IDs and cause codes under existing tenant and security boundaries.

## Production-shaped proof matrix

The interaction is not ready based on happy-path component tests. It needs
deterministic proof for:

1. save success, validation failure, network loss before send, network loss
   during send, and acknowledgement loss after commit;
2. edits made while an earlier save remains in flight;
3. different-user contention and same-user two-tab contention;
4. authorized takeover, unauthorized takeover, displaced-editor notification,
   and preserved unsent local work;
5. lease expiry, deliberate exit, browser crash, laptop sleep, mobile
   background/resume, and stale heartbeat;
6. session expiry followed by successful reauthentication without data loss;
7. permission revocation, tenant removal, Phase 10 restriction, or Site access
   change during editing;
8. CAS mismatch caused by another edit, restore, import, migration, or system
   command;
9. Preview and D1 publication binding the exact acknowledged revision while
   later work stays draft;
10. compare and restore-as-new-draft preserving the current draft and public
    generation;
11. cross-tenant and cross-Site denial for locks, versions, comparisons,
    recovery checkpoints, and restore;
12. large rich-text and block documents under realistic latency;
13. keyboard-only, screen-reader, zoom/reflow, touch, and reduced-motion use;
14. history retention and autosave coalescing under sustained editing; and
15. autosave producing no unintended notification, integration, cache, SEO,
    publication, or public-rendering side effect.

## Synthesized D12 UX recommendation

The hardened B-prime UX should be described as:

> **One quiet, bounded, server-acknowledged editorial recovery contract with
> one session-scoped active editor, one coalesced rolling autosave, expected-
> revision CAS, explicit permissioned takeover, truthful in-tab failure
> recovery, and bounded cause-labelled history; keeping the current public D1
> generation unchanged while ordinary editing exposes one accessible status
> line, read-only inspection, deliberate conflict comparison, and restore only
> as a new private draft.**

The product should feel automatic during the 99% case and become explicit only
when a real cause requires action. The safety architecture remains exact even
though ordinary staff see only **Saving**, **Saved**, **Unpublished changes**,
**View only**, **Review differences**, and **Restore as new draft**.

## Primary sources

### Payload

- [Autosave](https://payloadcms.com/docs/versions/autosave)
- [Drafts](https://payloadcms.com/docs/versions/drafts)
- [Versions](https://payloadcms.com/docs/versions/overview)
- [Document locking](https://payloadcms.com/docs/admin/locked-documents)
- [Local API](https://payloadcms.com/docs/local-api/overview)

### Contentful

- [Entry editor status and versions](https://www.contentful.com/help/content-and-entries/entry-editor-sidebar-overview/)
- [Entry-state semantics](https://www.contentful.com/developers/docs/tutorials/general/determine-entry-asset-state/)
- [Version conflict resolution](https://www.contentful.com/developers/changelog/version-conflict-resolution/)
- [Versioning](https://www.contentful.com/help/faq/versioning/)
- [Autosave webhook behavior](https://www.contentful.com/developers/docs/extensibility/webhooks/overview/)

### WordPress

- [Revisions and autosaves](https://wordpress.org/documentation/article/revisions/)
- [Post-lock and takeover notice source](https://developer.wordpress.org/reference/functions/_admin_notice_post_locked/)

### Webflow

- [CMS autosave](https://webflow.com/updates/cms-auto-save)
- [Content-editor concurrency](https://help.webflow.com/hc/en-us/articles/33961251014931-Edit-site-content-as-a-content-editor)
- [Backups and restore](https://help.webflow.com/hc/en-us/articles/33961244069395-Save-and-restore-backups)

### Sanity

- [Drafts](https://www.sanity.io/docs/content-lake/drafts)
- [History experience](https://www.sanity.io/docs/user-guides/history-experience)

### Shopify

- [Theme editor](https://help.shopify.com/en/manual/online-store/themes/customizing-themes/theme-editor/features-overview)
- [Theme-code history](https://help.shopify.com/en/manual/online-store/themes/customizing-themes/edit-code/edit-theme-code)
- [Theme backup guidance](https://help.shopify.com/en/manual/online-store/themes/customizing-themes/edit)

### Google Docs

- [Automatic saving](https://support.google.com/docs/answer/49114)
- [Offline files](https://support.google.com/drive/answer/2375012)
- [Version history](https://support.google.com/docs/answer/190843)

### W3C WAI

- [WCAG 2.2 status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- [WCAG 2.2 reauthentication](https://www.w3.org/WAI/WCAG22/Understanding/re-authenticating.html)
- [G105: preserve data through reauthentication](https://www.w3.org/WAI/WCAG22/Techniques/general/G105)
- [WAI alert-dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/)
- [WAI modal-dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [WCAG 2.2 reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- [WCAG 2.2 target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)
- [WCAG 2.2 focus not obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum)
