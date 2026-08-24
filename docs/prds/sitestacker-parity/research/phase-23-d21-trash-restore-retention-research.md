# Phase 23 D21 research — Trash, restore, retention, and permanent purge

**Status:** Founder-ratified and adversarially hardened as Phase 23 D21 on
2026-08-23.

## Decision boundary

Phase 23 still needs one removal lifecycle for the ordinary `Page` and `Article`
families. Trash must remain distinct from unpublish and archive: unpublish changes
public eligibility while preserving ordinary editorial use; Trash removes the whole
content identity from normal work while keeping it recoverable; permanent purge is
the exceptional irreversible operation.

This decision does not govern Phase 22 specialized public ministry pages, delete
media binaries, or create a general records-retention product.

## Current Core collisions

- `apps/admin/src/cms/collections/pages.ts` has drafts and autosave but does not
  enable Payload Trash. Its current `tenantScopedDeleteAccess` is broader than the
  Site-scoped, capability-gated lifecycle Phase 23 requires.
- `apps/admin/src/cms/access/tenant-access.ts` treats delete like tenant-scoped
  access; it does not distinguish move-to-Trash, restore, or permanent purge.
- `apps/admin/src/cms/hooks/audit.ts` records a collection deletion, but does not
  represent the separate lifecycle events or their causes.
- `NativeCollectionListView.tsx` receives Trash and delete permission props but
  does not yet provide an Asym-owned Trash workflow. Payload's stock collection
  list therefore cannot be assumed to express Core's product authority. The
  current Core list also links to the stock list as an escape hatch; D21
  activation must remove or capability-harden every such route so it cannot
  expose Payload's bypass, Empty Trash, bulk, or broader provider behavior.
- Existing Phase 23 decisions require adverse-first public withdrawal, exact
  release authority, search-deletion health, and schedules that cannot resurrect
  an ineligible Page. A provider-level delete toggle alone cannot uphold those
  contracts.
- Folders and topics organize or classify content but do not own its lifecycle.
  Trashing a Page or Article must not recursively delete folders, topics,
  references, schedules, navigation entries, or media.

## Current primary-source evidence

- [Payload Trash](https://payloadcms.com/docs/trash/overview) adds a `deletedAt`
  field, a dedicated Trash route, read-only trashed documents, restore, permanent
  delete, and Empty Trash. Its API can explicitly include trashed documents.
  Payload routes all Trash actions through collection `delete` access and its
  standard confirmation can offer a permanent-delete bypass. These are useful
  primitives, not a sufficient Asym authorization or lifecycle contract.
- [Contentstack About Trash](https://www.contentstack.com/docs/headless-cms/about-trash)
  documents a bounded 14-day recovery period and limits visibility and restoration
  to content the user could previously access. Its
  [restore guidance](https://www.contentstack.com/docs/headless-cms/restore-deleted-content)
  says restored content does not retain published status. This supports restoring
  privately instead of unexpectedly republishing.
- WordPress documents a default 30-day Trash lifetime through
  [`EMPTY_TRASH_DAYS`](https://developer.wordpress.org/advanced-administration/wordpress/wp-config/)
  and its scheduled cleanup routine
  [`wp_scheduled_delete`](https://developer.wordpress.org/reference/functions/wp_scheduled_delete/).
  Thirty days is therefore a recognizable minimum recovery convention, not a
  universal rule for every content class.
- Google advises that removed URLs without a suitable replacement return a real
  [404 or 410 response](https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors),
  rather than a soft 404 or an unrelated redirect. Trashing must therefore trigger
  the existing route/search/sitemap withdrawal path; it must not silently redirect
  everything to the home page.

## Concrete ministry scenario

A staff member moves the published article “2025 Flood Response” to Trash. It has
English and Spanish variants, appears in navigation and public search, and embeds a
photo used by two other pages. The safe result is immediate public withdrawal of
both variants, visible convergence status, preservation of the photo and all
references, and a recoverable read-only identity. Restoring it creates a private
working revision for staff review; it does not republish, reschedule, reindex, or
reinsert the article into navigation. If the old URL has no approved replacement,
the public route ultimately returns a genuine 404 or 410.

## Options

### Option A — No Trash; direct permanent delete

**Benefit:** The smallest schema and UI.

**Cost:** A routine mistake becomes irreversible, while reference, release, search,
route, schedule, and audit cleanup still must be solved. This is deceptively simple
and unsuitable for volunteer and occasional ministry staff.

### Option B — Uniform provider Trash with automatic 30-day purge

**Benefit:** Closest to Payload's stock behavior and familiar CMS expectations.

**Cost:** Treating every item alike can permanently remove previously public or
referenced content before downstream deletion debt, legal or ministry holds, route
history, and audit needs are resolved. Provider `delete` access and Empty Trash are
also too coarse for Core's Site and capability boundaries.

### Option C-prime — Asym-owned, reference-aware recoverable Trash

Use Payload Trash only as storage/provider machinery behind Asym-owned commands,
authorization, impact checks, and UI.

- Scope Trash to one exact Tenant × environment × Site and one stable ordinary
  Page or Article identity, including its locale variants.
- “Move to Trash” immediately makes the identity publicly ineligible. Search,
  sitemap, navigation, dynamic lists, schedules, caches, and routes converge
  adverse-first through their existing owners. A failed downstream removal remains
  visible and retryable; it never reports false success.
- Keep a code-owned **90-day recovery window**. After 90 days, automatic
  purge may remove only a never-released, unreferenced, unheld draft whose current
  scope, lifecycle, and purge eligibility are re-proven at execution time.
- Ever-released, referenced, held, or deletion-debt-bearing content remains in
  Trash until a separately authorized explicit purge succeeds. Purge preserves the
  minimum non-content tombstone, path disposition, and audit evidence needed to
  prevent identity reuse, bad redirects, or unverifiable history.
- Restore preserves the stable identity and history but creates a **private working
  revision**. It never automatically republishes, reschedules, recaches, reindexes,
  or re-adds navigation. D3 reservation normally prevents path collision; an
  exceptional legacy/corrupt-data or authorized-transfer conflict must be resolved
  explicitly before restoration completes.
- Trashed content is read-only and excluded from ordinary Content Library results
  and saved views. A dedicated staff-only Trash surface shows family, who trashed
  it, when, recovery timing, public/reference impact, and blockers. Current access
  is rechecked for every view and action.
- Do not cascade into media, folders, topics, or referenced records. Media cleanup
  remains with its own lifecycle owner.
- At launch, provide no Empty Trash, bulk permanent purge, per-tenant retention
  matrix, locale-only Trash, or generic workflow engine. Permanent purge is a rare,
  capability-gated action with a clear irreversible confirmation.
- Commands are idempotent, compare-and-swap protected, cause-attributed, and
  audited so retries and concurrent edits cannot resurrect or purge the wrong
  revision.

## Recommendation

Choose **Option C-prime**. It keeps the everyday experience simple—Move to Trash,
inspect, restore—while reserving complexity for the rare operation that can truly
destroy data. The narrow 90-day automatic-purge lane gives occasional ministry
staff a realistic opportunity to discover a mistake while preventing indefinite
clutter for disposable drafts without imposing a tenant-configurable policy matrix.
Previously public, referenced, or held content gets the stronger proof its real
operational consequences require.

## Founder ratification

The founder selected **Option C-prime — Asym-owned, reference-aware recoverable
Trash** for adversarial hardening on 2026-08-23 and then explicitly ratified the
exact C-prime-R formulation below as **Phase 23 D21** on 2026-08-23.

## Exact founder-ratified C-prime-R formulation

> **C-prime-R — Asym-owned, reference-aware recoverable Trash with private
> restoration and proof-gated purge.** Phase 23 shall provide one recoverable
> Trash lifecycle for each stable ordinary `Page` or `Article` identity in one
> exact Tenant × environment × Site. Trash applies to the whole identity and
> every locale variant together. Locale-specific withdrawal remains a release
> or publication action, not a second Trash model. Phase 22 specialized public
> ministry pages and Phase 29 media-binary disposal remain outside D21.
>
> Trash, unpublish, archive, and permanent purge shall remain visibly and
> semantically distinct. **Unpublish** removes a release from public service
> while leaving the identity in ordinary editorial work. **Archive** is a
> recoverable editorial classification when an owning decision defines it.
> **Move to Trash** removes the identity from ordinary work and starts its
> recovery lifecycle. **Permanently delete** irreversibly removes eligible
> content bodies and versions while preserving only the minimal non-content
> tombstone, route disposition, and audit evidence required by their owners.
> Trash shall never be presented as a synonym for unpublish or archive.
>
> A successful **Move to Trash** command shall atomically establish the source
> fact that the identity is trashed and therefore immediately ineligible for
> favorable public service. Existing D1 owners shall then remove or suppress
> every affected public release, locale, route, public Navigation target, Dynamic
> Content List result, public search document, sitemap entry, cached
> projection, social preview, and scheduled publication adverse-first. A
> downstream failure shall leave the source safely trashed, expose cause-coded
> **Removal needs attention** health, and remain retryable. It shall never keep
> serving content, resurrect it, or report full completion merely because the
> provider row acquired `deletedAt`.
> Adverse suppression shall not rewrite a D4 authored or released Navigation
> Revision. It preserves the stable target reference and creates cause-owned
> repair debt; the next favorable Site Plan release must resolve or deliberately
> remove that reference before activation.
>
> Moving content to Trash shall not cascade into referenced or child Pages,
> Articles, folders, Topics, navigation definitions, schedules, media records, or media
> binaries. Before the command, Asym shall derive a bounded impact preview from
> current source owners. For an unpublished and unreferenced draft, the action
> may complete directly with a persistent **Moved to Trash — Undo** status. For
> anything public, scheduled, linked, or otherwise consequential, one calm
> confirmation shall name the content, say **This takes every language version
> offline**, and summarize current routes, navigation, schedules, and other
> affected surfaces. Its actions shall be **Cancel** and **Take offline and move
> to Trash**. Unknown or truncated impact blocks the command; it is not treated
> as no impact. A required Site root/home replacement or D2 hierarchy repair
> also blocks ordinary Trash and names the existing cause-owned next action;
> D21 never fabricates a replacement, reparents child Pages, or leaves an
> invalid Site generation. At launch, each command handles one identity; there is no bulk
> move, bulk restore, bulk purge, select-all-across-results, or **Empty Trash**.
> The command shall also respect D12's active-editor fence: it requires a clean,
> saved expected revision and cannot remove an identity held by another valid
> editor lease. The actor is directed to coordinate or use the separately
> authorized unpublish path for urgent public withdrawal; Trash never discards
> unsaved work or overrides an active editor by guessing that a lease is stale.
>
> Trash shall be a quiet staff-only Content Library destination, not another
> permanent navigation hierarchy. Ordinary lists, D20 Saved Library Views,
> public queries, and favorable release builders exclude trashed identities by
> construction. The dedicated Trash list shall show only identities the current
> actor may currently inspect in the exact Site and shall provide search plus
> bounded family/status filters. Each row shall show title, Page or Article,
> who moved it, when, a plain recovery message, and one derived status:
> **Recoverable**, **Removal needs attention**, **Review required**, or
> **Eligible for permanent deletion**. A simple draft shall say **Protected from
> permanent deletion until <date>**, never falsely promise deletion on that
> date. Ever-released, referenced, held, or unresolved content shall instead say
> **No automatic deletion — review required**. A detail
> view shall be read-only but retain authorized versions, locale coverage,
> references, public-removal health, route disposition, and audit history.
> **Undo** appears only for the direct move of a never-released private draft and
> means restoring that draft privately. An ever-released identity never offers a
> generic Undo that could imply republication; its action is always **Restore as
> draft**.
>
> Every identity shall have one code-owned minimum recovery window of 90 complete
> days from the authoritative server timestamp. Tenant administrators cannot
> shorten it, and daylight-saving or browser clocks cannot change it. After the
> window, automatic purge may process only a never-released, currently
> unreferenced, unheld draft whose exact scope, identity revision, access-neutral
> purge policy, references, route state, schedules, and deletion convergence are
> all re-proven at execution. A failed or uncertain proof leaves it in Trash as
> **Review required**. Ever-released, referenced, held, or deletion-debt-bearing
> content is never automatically purged. D21 creates no tenant retention matrix,
> general legal-hold product, or promise that backups are synchronously erased;
> policy-specific retention or erasure remains with its source owner.
>
> **Restore as draft** shall preserve the stable content identity, attribution,
> versions, locale content, folder and Topic assignments, and surviving
> references, but shall create or select a private working revision. Restore
> shall never republish, reschedule, recache, reindex, recreate a social preview,
> or reinsert navigation. It shall not imply that previous public-removal debt is
> repaired. The former path remains governed by D2/D3 route authority. D3
> historical path reservation normally prevents a collision. If legacy or
> corrupt data, or an explicitly authorized route transfer, nevertheless creates
> one, restore blocks as an exceptional repair with **Choose a new path** or the
> authorized route-resolution flow; the system never steals a path, silently
> changes a slug, or restores under an invented URL.
> Restoring while another actor changed, purged, or restored the identity fails
> safely and offers **Refresh status**.
> The minimal route claim/disposition survives permanent content purge and the
> stable identity is never recycled, so a later Page cannot silently inherit the
> old URL or history.
>
> **Permanently delete** shall be a separate Phase 12 semantic capability and
> an Asym-owned command, not Payload's ordinary delete checkbox. It shall appear
> only after the minimum window and current eligibility proof, and only to a
> capability holder. One irreversible confirmation shall state exactly what
> content and version history will be removed, what minimal evidence remains,
> and that restoration will no longer be possible. Focus starts on **Cancel**;
> the destructive action is labeled **Permanently delete**. D21 shall not require
> typing a title or `DELETE` at launch: authorization, eligibility proof, clear
> consequences, separated action placement, and confirmation provide protection
> without ritual friction. Purge shall never reuse the stable identity, infer a
> redirect, delete shared media, or erase required audit and route evidence.
> Current stable references, a required Site root/home role, unresolved hierarchy,
> or any adverse-convergence debt shall block purge until its owning workflow
> resolves the cause.
> Permanent purge also blocks until every current source reference—including
> authored Navigation repair debt—is resolved by its owner; purge cannot make a
> dangling reference disappear by deleting its evidence.
>
> Every Trash command shall derive Tenant, environment, Site, actor, capability,
> identity, expected revision, and authoritative time on the server; use
> idempotency and compare-and-set; recheck current authorization and lifecycle;
> and append immutable cause attribution. Provider Local API calls acting for a
> user shall preserve that user context and shall not use privileged access as
> product authorization. A wrong-Site, wrong-Tenant, wrong-environment, missing,
> or unauthorized identity returns one non-enumerating unavailable result. Trash
> visibility, counts, references, audit projections, job payloads, logs, traces,
> and alerts shall not expose content or cross-scope existence.
>
> Payload 4 Trash may supply `deletedAt`, trashed-document querying, read-only
> provider views, and provider persistence only behind this replaceable product
> boundary. The stock permanent-delete bypass, **Empty Trash**, bulk permanent
> deletion, one coarse `delete` access decision, raw Trash endpoints, and stock
> UI shall not become Asym authority. Repository and provider upgrades must pass
> contract tests proving non-trash queries exclude trashed identities, all
> locale data survives move and private restore, versions cannot be restored
> while trashed, provider access cannot bypass Asym commands, and provider
> errors never become false success.
>
> The staff experience shall use plain ministry language, progressive
> disclosure, Core semantic colors and components, comfortable touch targets,
> and no legalistic or frightening copy. Established shared Base UI primitives
> shall own dialog, menu, focus, and keyboard behavior; D21 shall not invent ARIA
> replicas or an app-local component system. Reversible move/restore results shall
> be persistent and programmatically announced without stealing focus.
> Consequential and irreversible dialogs shall follow the modal-dialog pattern:
> keyboard focus contained inside, Escape and visible Cancel available before
> commitment, initial focus on the least destructive action, and logical focus
> restoration after completion. Loading, impact unavailable, permission denial,
> conflict, path collision, downstream-removal debt, restore success, purge
> eligibility, purge failure, and purge success shall each be visually and
> programmatically distinct and never toast-only. The complete flow shall work
> with keyboard, screen reader, touch, 200% zoom, 320-CSS-pixel reflow, reduced
> motion, slow networks, and session expiry.
>
> D21 shall not add a generic lifecycle engine, customizable Trash stages,
> tenant-set retention rules, recycle-bin folders, approval workflow, restore
> wizard, Trash-aware Saved Views, content-body tombstone archive, or media
> garbage collector. It authorizes no implementation. Activation requires the
> proof matrix below and production-shaped usability testing with both frequent
> communications staff and occasional ministry administrators.

## Why this UX fits ministry staff

Nonprofit missions ministries commonly have a small communications team, a staff
member wearing several roles, and occasional administrators who may return after
weeks away. The safe design therefore cannot depend on memorizing the difference
between provider states or interpreting technical reference graphs.

### The everyday mental model

Staff need only remember four sentences:

1. **Unpublish** when the page should come offline but remain normal work.
2. **Move to Trash** when the whole Page or Article should leave normal work.
3. **Restore as draft** brings it back privately for review.
4. **Permanently delete** is rare, authorized, and cannot be undone.

The interface repeats those exact verbs. It does not alternate among Delete,
Remove, Archive, Bin, Recycle, Retire, or Destroy for the same action.

### Routine draft cleanup

1. From the row action or editor overflow, staff choose **Move to Trash**.
2. For a never-released, unreferenced draft, the row disappears from ordinary
   work and a persistent status says **Moved to Trash** with **Undo**.
3. Focus moves to the next logical row or returns to the Content Library heading
   if no row remains. The action result is announced without forcing focus into
   a toast.
4. Undo restores a private draft; it never implies public release.

A confirmation dialog would add friction without adding meaningful protection to
this recoverable, no-impact case. W3C's confirmation technique is directed at
actions that cannot be undone; the recovery window is the error-prevention
mechanism for routine Trash moves.

### Taking public or referenced content offline

1. Staff choose **Move to Trash**.
2. The interface performs a bounded preflight. While it runs, the action says
   **Checking impact…** and cannot be submitted twice.
3. The confirmation starts with the human consequence—not the graph mechanics:
   **This takes every language version offline.**
4. It groups only non-zero current impacts: public URLs, navigation locations,
   future schedules, search/dynamic discovery, and referenced content. Long
   groups collapse behind **Show all**, but the visible summary says when more
   exists. Missing or truncated evidence blocks the command.
5. **Cancel** is the initial focus and ordinary button. **Take offline and move
   to Trash** is visually destructive but not surrounded by alarmist legal copy.
6. After success, a persistent status links to **View removal status** and
   **Restore as draft**. It never says the page is fully removed until all
   required adverse projections have converged.

### Finding and restoring an item

1. **Trash** is a quiet secondary destination from Content Library, with a count
   only when attention is required—not a badge that pressures constant cleanup.
2. Search uses title and authorized metadata. Four derived filters answer real
   questions: recoverable, removal needs attention, review required, and eligible
   for permanent deletion.
3. The read-only detail explains **Why can't I edit? Restore this item as a draft
   before editing it.** It shows versions and dependencies for inspection.
4. **Restore as draft** gives a concise consequence summary. A clean restore
   completes directly. An exceptional legacy/corrupt-data path collision or a
   concurrent change becomes an inline, persistent blocker with a single next
   action.
5. Success opens the private working revision only when the user invoked restore
   from detail; from a list, it keeps the list context and moves focus logically
   to the next row. Back navigation never exposes a stale editable Trash record.

### Rare permanent deletion

The action is absent until both authority and current eligibility are proven. It
is never beside **Restore as draft** as an equal primary choice. The dialog names
the item, explains that bodies and versions go away while minimal audit/route
evidence remains, and focuses **Cancel**. No title-typing ceremony is required:
that pattern can make staff perform a ritual without reading the consequence and
is not required by W3C. A lost response returns to an idempotent **Check status**
flow rather than inviting a second purge.

## Primary-source and repository evidence after selection

### Payload 4 and the exact Core pin

Core pins `payload` and `@payloadcms/ui` to
`4.0.0-internal.1f9ae9a`, corresponding to commit
`1f9ae9ab37bd7a69894762c833fad3e65124c314`.

- Current [Payload Trash documentation](https://payloadcms.com/docs/trash/overview)
  says `trash: true` injects `deletedAt`, excludes Trash from ordinary queries
  unless `trash: true` is requested, preserves read-only Trash detail and
  versions, and blocks version restore until the document is restored.
- The same documentation says soft delete, restore, and permanent delete all use
  collection `delete` access. It distinguishes an attempted move by
  `data.deletedAt` and permanent deletion by absent `data`, but still presents
  one provider operation. That is sufficient provider plumbing, not an Asym
  capability model.
- Payload's current stock list offers bulk restore, permanent delete, **Empty
  Trash**, and a checkbox that bypasses Trash from the ordinary delete dialog.
  The exact pinned
  [`ListEmptyTrashButton`](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/ui/src/elements/ListHeader/TitleActions/ListEmptyTrashButton.tsx)
  confirms all-items permanent deletion and silently converts a Trash-count fetch
  error into count zero. D21 therefore cannot expose that stock action or infer
  health from its count.
- The exact pinned
  [`appendNonTrashedFilter`](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/utilities/appendNonTrashedFilter.ts)
  appends `deletedAt exists: false` when Trash is enabled and the caller did not
  opt in. Contract tests must preserve this negative-by-default behavior across
  upgrades.
- The pinned Trash E2E suite proves localized fields can survive draft moves,
  Trash detail is read-only, and provider restore works. It also proves the stock
  UI intentionally exposes bulk selection and permanent-delete paths that D21
  rejects as product surfaces:
  [pinned Trash E2E source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/test/trash/e2e.spec.ts).

### Comparable CMS lifecycle evidence

- [Contentstack Trash](https://www.contentstack.com/docs/headless-cms/about-trash)
  uses a dedicated view, a 14-day recovery period, search/type separation, and
  previous-access visibility. Its
  [restore documentation](https://www.contentstack.com/docs/headless-cms/restore-deleted-content)
  says restored content does not retain published status. The private-restore
  rule is therefore established practice, while 14 days is a provider choice,
  not a universal requirement.
- WordPress's official
  [`wp_scheduled_delete`](https://developer.wordpress.org/reference/functions/wp_scheduled_delete/)
  documents a 30-day default before scheduled permanent deletion. This is a
  familiar lower-bound precedent, not evidence that 30 days is sufficient for
  an occasional ministry administrator.
- HubSpot's current
  [deleted-record recovery](https://knowledge.hubspot.com/records/restore-deleted-records)
  and [deleted-email recovery](https://knowledge.hubspot.com/marketing-email/restore-deleted-emails)
  use a 90-day recovery horizon. Its current
  [content recovery guidance](https://knowledge.hubspot.com/website-pages/restore-a-previous-version-of-content)
  also returns support-restored pages, posts, and emails as drafts that must be
  reviewed and republished. HubSpot's object and email choices are comparable
  product evidence, not proof that every CMS must use 90 days.
- [Contentful](https://www.contentful.com/help/faq/backup-security-and-hosting/)
  cannot restore an individually deleted entry and advises archive before delete.
  This is evidence that archive and irreversible deletion need clear separation;
  it is not a reason to copy Contentful's lack of recovery.
- [Sanity's current recovery guidance](https://www.sanity.io/docs/developer-guides/find-and-restore-deleted-documents)
  uses retained history and stable document identity, with plan-dependent windows
  from 3 to 365 days, including 90 days on Growth. This reinforces that
  recoverability needs an explicit product contract rather than an assumption
  about backups.

No primary source establishes one universal retention duration. The preliminary
C-prime proposed 30 days because WordPress makes that familiar. The hardened
candidate changes the fixed launch window to **90 days** because Asym's intended
ministry administrators may use the CMS intermittently, Page/Article text storage
is modest relative to media, HubSpot uses 90 days across recoverable CRM and email
content, and Sanity offers a 90-day mainstream history tier. Keeping it code-owned
avoids a retention-policy matrix; restricting automatic purge to never-released,
unreferenced, unheld, fully converged drafts contains storage without putting
consequential content on a blind timer.

### Public-route and accessibility evidence

- Google says a removed page without a suitable replacement should return a real
  [404 or 410](https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors),
  while a genuine replacement may receive a 301. D21 must not redirect every
  trashed path to a home or directory page.
- W3C [G168](https://www.w3.org/WAI/WCAG22/Techniques/general/G168) recommends
  confirmation for irreversible deletion and specifically uses **Empty Trash**
  as an example. This supports confirmation for purge while allowing recovery to
  protect routine Trash moves.
- The WAI-ARIA
  [modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
  requires contained keyboard focus, Escape, a visible close/cancel control, and
  logical focus return; for difficult-to-undo actions it recommends initial focus
  on the least destructive action.
- WCAG's current
  [status-message failure guidance](https://www.w3.org/WAI/WCAG22/Techniques/failures/F103.html)
  explains that async success, application state, progress, and errors must be
  programmatically determinable rather than discoverable only by visual scanning.

## Ruthless adversarial review

| Category                          | Material concern? | What could go wrong and why it matters                                                                                                                                                                                                                              | Severity | Likelihood without hardening | Evidence or reasoning                                                                                                                                           | Permanent prevention                                                                                                                                                                                                              |
| --------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | **Yes**           | A single `deletedAt` flag can appear safe while navigation, schedules, caches, search, or a locale still serves the identity. Restore can also fail after a path transfer or schema change.                                                                         | Critical | High                         | Payload models provider Trash, while D1/D2/D3/D13/D17 own separate serving facts and adverse convergence.                                                       | Treat Trash as a source lifecycle command with adverse-first projections, explicit route ownership, retryable health, stable identity, and contract tests across every consumer.                                                  |
| Technical debt                    | **Yes**           | Enabling stock Trash would spread provider verbs, one coarse delete permission, raw endpoints, and cleanup assumptions through product code. A custom general workflow engine would create the opposite debt.                                                       | High     | High                         | Current Pages use broad `tenantScopedDeleteAccess`; pinned Payload exposes stock bypass and Empty Trash.                                                        | Keep one small Asym command/DTO/capability boundary over Payload primitives; prohibit raw provider product surfaces; add no generic lifecycle engine or tenant rule builder.                                                      |
| Edge cases                        | **Yes**           | Staff can trash the last homepage, a multi-locale identity, a page under active edit, a scheduled revision, a referenced Page, an item already trashed/restored, an item whose route was transferred, or an item during Site activation.                            | Critical | High                         | These are ordinary consequences of D1 Site Plan releases, D2/D3 routes, D12 active editor, D13 schedules, D14 lists, D17 search, and D18/D19 relationships.     | Explicit lifecycle matrix, current preflight, CAS, idempotency, whole-identity semantics, schedule invalidation, route conflict handling, and race/failpoint tests.                                                               |
| Footguns                          | **Yes**           | Ambiguous Delete copy, a nearby permanent checkbox, bulk Empty Trash, browser-clock countdowns, or silent cascade can destroy content or mislead staff.                                                                                                             | Critical | High                         | Payload's stock UI exposes the checkbox and Empty Trash; W3C treats irreversible deletion as confirmation-worthy.                                               | Exact verbs, private restore, server time, no launch bulk/Empty Trash, no cascade, least-destructive initial focus, one explicit purge confirmation, and no false completion.                                                     |
| Tenant safety                     | **Yes**           | A privileged Local API call, caller-supplied Site ID, related-record filter, count, reference preview, or audit detail could expose another Tenant/Site or authorize a cross-scope action.                                                                          | Critical | Medium–High                  | Current Payload connection is privileged and current Page access is Tenant-only, not exact Site/environment capability authority.                               | Server-derived exact scope, structural constraints, capability checks, `overrideAccess: false` for user-bound Local API, non-enumerating errors, and negative cross-scope tests for every read/count/action.                      |
| Overengineering                   | **Yes**           | Custom retention matrices, recycle-bin folders, approval stages, legal-hold UI, restore wizards, granular locale Trash, and Trash-aware Saved Views would burden staff and database before evidence exists.                                                         | High     | Medium–High                  | The founder asked for safety without needless complexity; current comparable CMSs use simple dedicated recovery surfaces.                                       | One code-owned 90-day window, four derived statuses, one detail view, one capability for purge, and explicit launch exclusions. Add only measured needs later.                                                                    |
| UX/UI and user friction           | **Yes**           | Occasional staff may confuse unpublish, archive, Trash, and purge; dense dependency graphs, confirmation on every draft, toast-only results, hidden Trash, or ritual title typing can cause mistakes and abandonment.                                               | High     | High                         | CMS comparables use dedicated Trash; W3C distinguishes reversible recovery from irreversible confirmation and requires accessible focus/status behavior.        | Four fixed verbs, progressive preflight, direct reversible draft move with Undo, consequence-based public-content dialog, plain statuses, quiet Trash entry, persistent recovery, and ministry-staff usability tests.             |
| Hidden coupling                   | **Yes**           | Trash logic embedded separately in navigation, schedules, search, sitemap, cache, media, and route handlers will drift; a provider upgrade can change query inclusion.                                                                                              | Critical | High                         | D1 already centralizes release authority and the pinned provider implements non-Trash filtering internally.                                                     | One lifecycle event/source fact and registered consumer contracts; owners derive projections; adapter conformance tests; no consumer writes lifecycle state back.                                                                 |
| Failure modes                     | **Yes**           | Database commit may succeed while withdrawal, audit, or job dispatch fails; a lost response may cause retry; purge may partially remove versions; restore may return success while remaining invisible or conflicted.                                               | Critical | Medium–High                  | Distributed projections are not transactionally identical to the source write; pinned stock count handling can hide errors.                                     | Source-first safe state, outbox/idempotency, CAS, state-specific receipts, no false success, retry/reconciliation, purge transaction or compensating quarantine, and staff-visible health.                                        |
| Data integrity risks              | **Yes**           | Identity reuse, orphan versions, duplicate restore, stale references, slug theft, partial locale survival, or recursive deletion can corrupt meaning and reporting.                                                                                                 | Critical | Medium–High                  | Payload retains versions/locales but route/reference semantics belong to Asym; Contentstack documents dependency-sensitive restore scenarios.                   | Never-reused identity, route ledger, whole-identity move, non-cascade, reference proof, exact-revision commands, private working restore, tombstone, and integrity constraints/tests.                                             |
| Security and privacy risks        | **Yes**           | Trash can become a covert archive of sensitive ministry content; unauthorized staff may discover titles, routes, history, references, thumbnails, or actor identities after losing access. Logs may retain content.                                                 | Critical | Medium                       | Payload can include Trash through `trash: true`; history/detail remain accessible subject to provider access; restricted ministry content needs current policy. | Reapply current Phase 10 and Phase 12 access to every projection, omit thumbnails/snippets unless authorized, non-enumerating failures, privacy-safe telemetry, audit projection rules, and prompt revocation effects.            |
| Scalability and performance risks | **Yes**           | Preflight can fan out across locales, references, schedules, indexes, and cached surfaces; indefinite complex Trash and unindexed `deletedAt` queries can slow lists and jobs.                                                                                      | High     | Medium                       | D21 crosses several bounded owners; provider stock count queries all Trash; public consequential content may remain indefinitely.                               | Bounded summary queries, indexed scope/lifecycle/time keys, count ceilings, stable pagination, batched reconciliation, no N+1 references, purge backpressure, and production-shaped plans.                                        |
| Operational burden                | **Yes**           | Staff or developers could manually reconcile stuck removals, explain opaque purge blockers, clean abandoned drafts, or restore from backups. A noisy Trash badge can create unnecessary work.                                                                       | High     | Medium–High                  | Downstream convergence and reference changes are expected; backups are not an editor recovery UX.                                                               | Automatic retry/reconciliation, derived blocker text with one owner/action, safe automatic purge only for simple drafts, quiet attention badge, runbook, and no routine developer database edits.                                 |
| Observability gaps                | **Yes**           | Teams may not know content is still cached/indexed, purge is blocked, a job stalled, or cross-scope probes are occurring. A zero count could mean provider failure.                                                                                                 | Critical | High                         | D17 already identifies deletion health as operationally important; pinned Empty Trash converts fetch failure to zero.                                           | Cause-coded metrics and traces for source age, projection lag, retries, blockers, scope denials, and purge outcomes; staff-facing status separated from operator detail; no content in telemetry.                                 |
| Dependency and integration risks  | **Yes**           | Payload may change Trash access arguments, query defaults, UI routes, version behavior, or Local API semantics; search/CDN integrations may acknowledge before actual removal.                                                                                      | High     | Medium                       | Core runs an internal Payload v4 pin; current behavior differs from a complete Asym lifecycle.                                                                  | Exact-pin tests plus upgrade conformance, adapter boundary, no stock UI authority, consumer acknowledgements with reconciliation, and neutral lifecycle export.                                                                   |
| Migration and upgrade risks       | **Yes**           | Adding `deletedAt` can change default queries and indexes; existing hard-deleted records have no recovery history; rollback can accidentally expose trashed rows; future CMS migration can lose tombstones.                                                         | Critical | Medium                       | Payload appends non-Trash filters when enabled; this is a material query semantic change.                                                                       | Expand/backfill/verify/activate migration, dual-read darkness tests, explicit rollback behavior that keeps Trash ineligible, neutral export/import of lifecycle/tombstones, and no inferred recovery for historical hard deletes. |
| Other development hazards         | **Yes**           | Double clicks, two actors, auto-purge racing restore, stale eligibility, session expiry, job replay, clock skew, partial deploy, or weak tests can delete or resurrect the wrong identity. Ownership between product, search, route, and operations may be unclear. | Critical | Medium–High                  | Every destructive asynchronous lifecycle has ordinary concurrency and rollout races.                                                                            | Server time, idempotency keys, expected revision, transactional lock/lease for purge, deployment kill switch, explicit owner matrix, race/failpoint/property tests, and reversible activation.                                    |

Every category has a material concern because D21 coordinates a destructive source
state with several independently owned public projections. The result is not a
reason to add more workflow. It is a reason to keep the product contract narrow
and make its few boundaries exact.

## Ruthless synthesis

### Must be fixed before activation

1. **Establish exact scope and source authority.** Ordinary Page and Article
   identities must carry exact Tenant × environment × Site ownership, stable
   identity, revision, Trash lifecycle, and server timestamps before any UI is
   enabled.
2. **Separate the four lifecycle verbs.** Define source-owned unpublish, archive,
   Move to Trash, and permanent purge semantics and enforce their labels across
   list, editor, commands, audit, API, and support tooling.
3. **Build the Asym command boundary.** Separate move, restore-as-draft, and purge
   capabilities; add server-derived scope, current access, CAS, idempotency,
   cause attribution, non-enumerating errors, and no Local API bypass.
4. **Wire adverse-first consequences through existing owners.** D1/D2/D3/D13/
   D14/D17/navigation/cache/sitemap/social consumers must suppress safely,
   acknowledge, retry, and expose unresolved debt without being allowed to
   resurrect the identity.
5. **Prove non-cascade and reference safety.** Trash cannot delete folders,
   Topics, references, schedules, or media. Preflight must be bounded, current,
   and blocking when unknown. Route collision and replacement behavior must use
   existing route authority.
6. **Deliver the calm Core-owned UX.** Direct reversible draft move, impact-aware
   consequential confirmation, quiet Trash list, read-only detail, Restore as
   draft, rare separated purge, persistent statuses, responsive accessibility,
   and no stock checkbox/Empty Trash.
7. **Implement the bounded retention policy.** Use the authoritative 90-day window;
   auto-purge only re-proven never-released simple drafts; keep consequential or
   uncertain content for explicit review; preserve tombstones.
8. **Qualify the exact Payload pin and migration.** Prove query exclusion,
   locales, versions, access, restore, failure, schema/index plans, rollback
   darkness, and upgrade conformance at `4.0.0-internal.1f9ae9a`.
9. **Test the dangerous races before release.** Purge-versus-restore,
   trash-versus-publish, schedule-versus-trash, Site activation, path transfer,
   lost response, job replay, partial projection failure, cross-scope probes,
   and staged-deploy rollback must all fail safe.

### Address soon after activation

- Conduct moderated task tests with frequent communications staff, occasional
  ministry administrators, and a restricted-ministry reviewer. Measure whether
  they choose unpublish versus Trash correctly, understand private restoration,
  locate a removed item, interpret removal debt, and stop an accidental purge.
- Review blocked-purge age and causes, route conflicts, restore completion,
  accidental-move Undo use, and support contacts before changing retention or
  enabling any bulk action.
- Add an operator runbook for stuck adverse convergence and eligibility repair;
  staff UX should expose only the consequence and next action.

### Monitor without adding launch complexity

- move/restore/purge command latency, conflict, retry, and idempotent replay;
- age from source Trash to removal acknowledgement by projection owner;
- counts and oldest age for **Removal needs attention** and **Review required**;
- automatic-purge candidates, successes, proof failures, and queue backpressure;
- path collisions, schedule invalidations, and unexpected reference growth;
- cross-scope and unauthorized attempts without content or existence details;
- Trash volume, list/query plans, retention storage, and provider drift; and
- accessibility/usability regressions, Undo rate, and wrong-action support cases.

## Required proof matrix

| Gate                       | Required evidence                                                                                                                                                                                                                | Rejects                                                                              |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Semantic darkness          | Unpublish, archive, Trash, restore, and purge produce distinct source states, copy, commands, audit causes, and UI; no alias or fallback conflates them.                                                                         | One overloaded Delete/Status field or provider semantics as product truth.           |
| Exact isolation            | Wrong Tenant, environment, Site, actor, role/capability, and revoked-access tests cannot view Trash existence, counts, title, references, history, previews, audit, or act.                                                      | Client scope, Tenant-only filter, related-record inference, or privileged Local API. |
| Adverse-first service      | On move, every locale becomes immediately ineligible; route, navigation, dynamic list, search, sitemap, cache, social, and scheduled-release tests converge or show retryable debt.                                              | `deletedAt` success while public content remains silently favorable.                 |
| Active-editor safety       | Own dirty state, autosave in flight, another valid editor lease, expired lease, session loss, and urgent-unpublish tests prove Trash never discards unsaved work or overrides D12.                                               | Stale browser action trashing another editor's work.                                 |
| Navigation history         | A trashed target disappears from public Navigation adverse-first while the D4 authored/released revision and stable reference remain; the next favorable release blocks until repair, and purge blocks on unresolved references. | Silent mutation of authored history or purge erasing repair debt.                    |
| Non-cascade                | Moving, restoring, and purging cannot delete or mutate child/referencing Pages, folders, Topics, navigation, references, schedules, media records, or binaries outside their owner's explicit command.                           | Database cascade or hook side effects as lifecycle policy.                           |
| Impact preflight           | Simple draft bypass, consequential summary, unknown/truncated block, changing references, and permission-redacted detail behave as specified under bounds.                                                                       | Empty impact inferred from timeout, truncation, or denied reads.                     |
| Restore privacy            | Restore preserves identity/locales/history/assignments but yields private working state; it does not publish, schedule, index, cache, navigate, or clear unrelated debt.                                                         | “Return to original state” causing surprise republication.                           |
| Route safety               | Trashed path claim/disposition, legitimate replacement, 301, 404/410, transfer, collision, and restore conflict obey D2/D3 without homepage redirect, theft, or silent slug mutation.                                            | Trash inventing route authority.                                                     |
| Retention and purge        | Server-time 90-day boundary, DST/clock skew, simple-draft proof, ever-released block, reference/hold/debt block, lost response, retry, concurrent restore, partial failure, and tombstone pass.                                  | Timer-only hard delete, blanket purge, or false completion.                          |
| Payload exact pin          | `trash: true`, default exclusion, query opt-in, localized drafts, read-only detail, versions, differentiated provider access, schema/indexes, stock UI bypass suppression, and Local/REST behavior pass at the exact pin.        | Documentation alone or stock UI treated as sufficient.                               |
| Migration and rollback     | Existing rows remain active, Trash queries/indexes are production-safe, activation is reversible, rollback cannot re-expose Trash, and neutral export/import preserves stable lifecycle/tombstones.                              | One-step schema/UI enablement.                                                       |
| Accessibility              | Keyboard, screen reader, touch, 200% zoom, 320px reflow, reduced motion, slow connection, and session-expiry tests pass; dialog focus and persistent live status behave as specified.                                            | Mouse-only rows, toast-only outcome, destructive initial focus, inaccessible modal.  |
| Ministry usability         | Representative staff correctly choose unpublish vs Trash, understand every-language withdrawal and private restore, locate and recover an item, read blockers, and safely complete/abort purge without coaching.                 | Expert-only provider vocabulary or graph-first impact UI.                            |
| Failure containment        | Database, audit, outbox, worker, search, CDN, and provider failpoints preserve safe source state, local context, retryability, and truthful receipts; no duplicate or resurrected identity.                                      | Partial success hidden behind one green toast.                                       |
| Performance and capacity   | Production-shaped indexes, bounded preflight, stable pagination, non-Trash query regression, queue backpressure, purge batch, and no-N+1 reference proof pass at forecast scale.                                                 | Full-graph scans, unbounded counts, or synchronous fan-out on button press.          |
| Observability and recovery | Cause-coded staff health, operator metrics/traces, oldest-age alerts, reconciliation, and runbook recover each simulated fault without logging content.                                                                          | Generic CMS error, count-zero-on-failure, or manual database repair as routine.      |

## Decision status

The exact C-prime-R formulation above is founder-ratified and adversarially
hardened as Phase 23 D21. Ratification establishes planning authority only; no
implementation, schema migration, ticket, provider adoption, deployment, or
release is authorized by this research record.

## Source inventory

### Repository evidence

- `apps/admin/src/cms/collections/pages.ts`
- `apps/admin/src/cms/access/tenant-access.ts`
- `apps/admin/src/cms/hooks/audit.ts`
- `apps/admin/src/cms-ui/web-studio/collections/shared/list-workspace/NativeCollectionListView.tsx`
- `apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/editor-state.ts`
- `docs/ai/rules/frontend.md`
- `docs/ai/rules/testing.md`
- `docs/ai/skills/accessibility-review/SKILL.md`
- `docs/prds/sitestacker-parity/phase-23-web-studio-cms-decision-log.md`
- `docs/adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md`
- `docs/adr/0147-generation-bound-automatic-ordinary-page-route-continuity.md`
- `docs/adr/0148-curated-navigation-revisions-under-coherent-site-generations.md`
- `docs/adr/0157-exact-revision-scheduled-publication-appointments-through-d1.md`
- `docs/adr/0161-derived-public-site-search-projection-and-adverse-first-convergence.md`
- `docs/adr/0162-purpose-bounded-authority-free-content-library-folders.md`
- `docs/adr/0163-versioned-release-bound-site-topic-profile-and-controlled-topic-sets.md`
- `package.json`
- `apps/admin/package.json`

### Primary external evidence

- [Payload Trash](https://payloadcms.com/docs/trash/overview)
- [Payload Access Control](https://payloadcms.com/docs/access-control/overview)
- [Pinned Payload Collection Trash view](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/next/src/views/CollectionTrash/index.tsx)
- [Pinned Payload Empty Trash button](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/ui/src/elements/ListHeader/TitleActions/ListEmptyTrashButton.tsx)
- [Pinned Payload non-Trash filter](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/utilities/appendNonTrashedFilter.ts)
- [Pinned Payload Trash tests](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/test/trash/e2e.spec.ts)
- [Contentstack About Trash](https://www.contentstack.com/docs/headless-cms/about-trash)
- [Contentstack Restore Deleted Content](https://www.contentstack.com/docs/headless-cms/restore-deleted-content)
- [WordPress scheduled Trash deletion](https://developer.wordpress.org/reference/functions/wp_scheduled_delete/)
- [HubSpot deleted-record recovery](https://knowledge.hubspot.com/records/restore-deleted-records)
- [HubSpot deleted-email recovery](https://knowledge.hubspot.com/marketing-email/restore-deleted-emails)
- [HubSpot deleted-content restoration](https://knowledge.hubspot.com/website-pages/restore-a-previous-version-of-content)
- [Contentful recovery limitations](https://www.contentful.com/help/faq/backup-security-and-hosting/)
- [Sanity deleted-document recovery](https://www.sanity.io/docs/developer-guides/find-and-restore-deleted-documents)
- [Google removed-page guidance](https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors)
- [W3C confirmation technique G168](https://www.w3.org/WAI/WCAG22/Techniques/general/G168)
- [WAI-ARIA modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [WCAG status-message failure F103](https://www.w3.org/WAI/WCAG22/Techniques/failures/F103.html)
