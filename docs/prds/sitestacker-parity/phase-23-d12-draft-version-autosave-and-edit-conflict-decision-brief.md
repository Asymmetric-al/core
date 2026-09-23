# Phase 23 D12 Editorial Recovery and Edit Conflict — Decision Brief and Adversarial Evidence

- **Status:** Founder-ratified Phase 23 D12 B-prime-R
- **Date:** 2026-08-22
- **Authority:** Decision support only. This document does not authorize
  implementation, schema work, migration, provider adoption, issue publication,
  deployment, release activation, or production change.

## Decision seam

D1 separates private authoring revisions from immutable public generations.
D4 and D8 add independently authored Navigation and Reusable Section revisions.
D11 makes Payload/Lexical private editable source rather than public authority.
Those decisions do not yet say what happens while a staff member is actively
editing, how work is recovered, whether another editor may enter, which saves
become meaningful history, or which exact revision a later publish action uses.

The practical scenario is ordinary and consequential:

> Maria edits a published Page for twenty minutes. Her Wi-Fi drops as autosave
> runs. On another computer, Sam opens the same Page and corrects a link. Maria
> reconnects and clicks Preview. The product must preserve both people's work,
> identify which revision is current, keep the existing public Page unchanged,
> and explain the next action without exposing Payload internals.

The D12 question is therefore:

> Should ordinary Web Studio authoring use explicit manual saves, one bounded
> recoverable active editor with autosave, or true simultaneous collaboration?

## Executive verdict

The selected direction is sound only after hardening. The durable product
contract should be **one active editor per exact resource, owned and fenced by
one editing session; one server-authoritative private working draft; debounced
and coalesced autosave; and expected-revision compare-and-swap on every
mutation**. A lock
improves coordination; it is not the data-integrity mechanism. A save receipt,
not an animation or browser queue, is what earns the word **Saved**.

The ordinary experience stays deliberately small: one quiet status control,
automatic saving, Preview, the D1-owned publication action, and progressive
disclosure for History. A second editor enters read-only, sees who is editing,
and may take over only with explicit permission and confirmation. Network,
session, permission, and revision failures preserve the local candidate long
enough to recover or copy it, but never describe browser-only work as saved or
promise offline-first synchronization.

This is not a new collaboration platform. It excludes live cursors, CRDT/OT,
automatic merging of semantic section arrays, multiple working branches,
per-keystroke permanent history, tenant-specific timing matrices, and raw
Payload restore or access semantics. Payload supplies qualified persistence
primitives behind this provider-neutral contract; D1 remains the only ordinary
public release authority.

## Inherited boundaries

- Saving, autosaving, validation, previewing, reviewing, compiling, releasing,
  and serving are different facts. Only D1 changes ordinary public authority.
- A publish action must bind the exact reviewed, server-acknowledged source
  revision. It must never mean “whatever mutable draft is latest when a worker
  eventually runs.”
- D1 Editorial and Page Placement Revisions remain separate axes. A **Move
  Page** command is a deliberate structural action, not background autosave.
- D4 Navigation and D8 Reusable Sections may share a common working-draft
  experience, but keep their own semantic revision and publication authority.
- Phase 10 can revoke visibility or editing eligibility immediately. A stale
  browser session or lock cannot preserve authorization.
- Phase 22 specialized missionary/project/update workflows retain their own
  contributor and release rules. D12 may supply qualified primitives without
  reinterpreting those contracts.
- Scheduling, trash, locale lifecycle, configurable approval workflow, and
  generalized operational recovery remain separately owned decisions. D12 must
  compose their states later instead of forcing all lifecycle meaning into one
  status field.

## Current repository evidence

The current code proves useful primitives but is not yet a complete product
contract:

- `Pages`, `PageTemplates`, `MinistryUpdates`, `MissionaryGivingPages`, and
  `ProjectPages` enable Payload drafts and autosave. Ordinary `Pages` currently
  debounce autosave at **300 ms** and keep a visible **Save draft** button.
- No reviewed collection sets `lockDocuments`, so current behavior depends on
  Payload's provider default rather than an explicit product policy.
- No reviewed collection sets `maxPerDoc`, so version retention depends on the
  provider default.
- The reviewed collections tenant-bound ordinary reads but do not define
  `access.readVersions`. In the exact installed artifact, version reads consult
  that separate policy and an absent policy permits an authenticated user.
  Ordinary document RLS/access therefore does not prove tenant-safe version
  history; D12 must require explicit tenant-bounded version reads and
  adversarial cross-tenant tests.
- Payload's generated `payload-locked-documents` collection admits any
  authenticated Payload user for create, read, update, and delete in the exact
  installed artifact, while the provider UI calls those endpoints directly.
  Its rows have no first-class Tenant, Site, locale, or session key and no
  compound uniqueness constraint. Hidden provider collections are not
  authorization; current raw lock CRUD is a cross-tenant presence leak and
  lock-clearing footgun until replaced or contained behind a Core-owned,
  scope-exact lease boundary.
- Web Studio already reads Payload's `documentIsLocked`,
  `mostRecentVersionIsAutosaved`, `versionCount`, and
  `unpublishedVersionCount`. It distinguishes **Unsaved changes**,
  **Autosaving**, **Autosaved draft**, **Draft ahead**, and **Published**.
- The current workspace exposes four separate state-strip items plus technical
  **Versions**, **API**, **Live preview**, document ID, and version counts. That
  is valuable diagnostic scaffolding but too noisy and provider-oriented for
  the final staff experience.
- Current unit tests assert the 300 ms setting and basic labels. They do not
  establish stale-write rejection, same-user multiple-tab behavior, takeover,
  network/auth failure recovery, permission revocation, restore-as-draft,
  exact-version publication, or bounded history semantics.
- The current authenticated preview reads the latest draft by collection and
  document ID rather than an exact acknowledged source revision. It can
  therefore preview a different candidate from the one visible when the user
  invoked Preview.
- The current audit hook records every `afterChange` without classifying or
  coalescing autosaves. A 300 ms autosave cadence can therefore turn ordinary
  typing into noisy audit/log volume unless recovery writes are explicitly
  distinguished from meaningful checkpoints.
- Existing version rows carry a nullable version tenant key and hard tenant
  deletion can set that key to null. Retained history must preserve an immutable
  scope key or prevent the destructive parent disposition; losing the tenant
  key is not a valid retention strategy.

Relevant repository seams include:

- `apps/admin/src/cms/collections/pages.ts`
- `apps/admin/src/cms/collections/page-builders.ts`
- `apps/admin/src/cms/collections/page-templates.ts`
- `apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/editor-state.ts`
- `apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/NativeCollectionEditView.tsx`
- `tests/unit/cms/collection-contracts.test.ts`
- `tests/unit/cms/web-studio-editor-state.test.ts`

Supporting records:

- [Exact installed Payload lifecycle and source qualification](./phase-23-d12-payload-editorial-lifecycle-primary-source-research.md)
- [Core repository adversarial audit](./phase-23-d12-core-repository-adversarial-audit.md)
- [Modern editorial recovery UX benchmark](./phase-23-d12-editorial-recovery-ux-benchmark.md)

## Payload facts that matter

The repo pins Payload and its UI/Next/Postgres packages to internal build
`4.0.0-internal.1f9ae9a`; current public documentation is not proof that this
exact artifact behaves identically.

Current official Payload documentation and reviewed source establish these
important semantics:

- Drafts add `_status` and support **Draft**, **Published**, and **Changed** in
  Payload Admin. A draft write can update only the versions store while the
  published main document remains unchanged.
- Autosave is debounced and reports the last saved time. Payload marks an
  autosave version and its implementation coalesces repeated autosaves by
  overwriting the latest version when that latest version is already an
  autosave; it does not need a permanent row per keystroke.
- Current public docs describe an 800 ms default autosave interval, while the
  reviewed v4 source uses 2,000 ms and this repo explicitly uses 300 ms. The
  discrepancy is evidence that an exact interval is a qualified product
  setting, not a stable provider truth or founder-facing tenant option.
- Versioning stores full document snapshots, exposes author/time history,
  compare and restore operations, and defaults to a bounded 100 versions per
  collection document unless configured otherwise.
- Document locking is enabled by default in current Payload docs. One editor
  receives the lock; another can view read-only, take over, or leave. The
  documented default expiry is five minutes of inactivity.
- In the exact installed build, the lock is user-bound rather than editing-
  session-bound, lock acquisition is a find/delete/create sequence without an
  exact-resource uniqueness constraint, and the autosave editor disables its
  ordinary stale-`updatedAt` warning. Payload's lock can inform presence and
  provider UI, but it cannot be the authoritative D12 lease or the stale-write
  guard.
- Browser REST mutations enforce locks unless explicitly overridden, but
  Payload Local API update/delete operations default to overriding locks. Every
  user-scoped server operation therefore has to set `overrideLock: false`; a
  system override must be a distinct permissioned and audited cause.
- In the exact installed artifact, restore does not independently enforce the
  document lock and can copy a historical `_status` into the live record unless
  the caller explicitly restores as draft. Core must expose a product-owned
  **Restore as a new draft** command rather than raw provider restore semantics.
- The exact Local API restore wrapper defaults to privileged access and does not
  forward its typed `draft` argument into the operation. Relying on a caller to
  select draft mode is therefore insufficient; D12 needs a separate product
  command that never calls the unsafe non-draft path.
- Payload collection version reads use a distinct `readVersions` access hook;
  they do not inherit the ordinary collection `read` constraint in this build.
  Every version and comparison query must therefore prove the same tenant and
  current actor authority explicitly.
- A user identity alone is not sufficient conflict protection. Two tabs or a
  stale request from the same actor still require an expected source revision
  compare-and-swap backstop.
- Provider `maxPerDoc` pruning is row-count- and timestamp-based, not aware of
  D1 release anchors, open recovery, migration evidence, or other protected
  checkpoints. The product must own semantic retention/pinning; an inherited or
  explicit count alone is not sufficient.

Primary Payload sources:

- [Versions](https://payloadcms.com/docs/versions/overview)
- [Drafts](https://payloadcms.com/docs/versions/drafts)
- [Autosave](https://payloadcms.com/docs/versions/autosave)
- [Document locking](https://payloadcms.com/docs/admin/locked-documents)
- [Local API](https://payloadcms.com/docs/local-api/overview)

## Comparable product evidence

### Contentful

Contentful automatically saves entry work without making it public, exposes
**Draft**, **Published**, and **Changed**, and keeps publish-time snapshots for
comparison and restoration. Its conflict tooling can merge changes in different
fields and warns when the same field conflicts. That is useful for simple
records, but automatic field-level merge is unsafe for semantic section arrays
where a move, delete, or relationship change can overlap structurally.

- [Content and entries](https://www.contentful.com/help/content-and-entries/)
- [Entry-editor status](https://www.contentful.com/help/content-and-entries/entry-editor-sidebar-overview/)
- [Versions](https://www.contentful.com/help/content-and-entries/versions/)
- [Conflict resolution](https://www.contentful.com/developers/changelog/version-conflict-resolution/)

### Sanity

Sanity automatically saves into a draft distinct from published content and
provides real-time multi-editor presence and history. Its recent patch-rebasing
and convergence fixes demonstrate that simultaneous collaboration is a
specialized synchronization product, not a free consequence of using a modern
CMS. It is disproportionate to ordinary nonprofit-site editing at launch.

- [Drafts](https://www.sanity.io/docs/content-lake/drafts)
- [History experience](https://www.sanity.io/docs/user-guides/history-experience)
- [Real-time updates](https://www.sanity.io/docs/content-lake/realtime-updates)

### WordPress

WordPress keeps at most one rolling autosave per user and post, does not let an
autosave overwrite published content, offers crash/network recovery, and uses
exclusive post editing with an explicit authorized takeover. This is a proven
low-complexity collaboration model when the lock explanation is calm and the
displaced editor's last acknowledged work is recoverable.

- [Revisions and autosaves](https://wordpress.org/documentation/article/revisions/)
- [Post-lock notice and takeover](https://developer.wordpress.org/reference/functions/_admin_notice_post_locked/)

### Google Docs and Shopify

Google Docs is a useful benchmark for a quiet save indicator, grouped history,
and clear restoration, but its real-time/offline collaboration system is not an
appropriate launch architecture. Shopify's explicit-save theme workflow is
simple, but its dependence on unsaved undo and duplicated-theme backups shows
the avoidable friction of manual-save-only recovery.

- [Google Docs version history](https://support.google.com/docs/answer/190843)
- [Shopify theme-editor save and undo](https://help.shopify.com/en/manual/online-store/themes/customizing-themes/theme-editor/features-overview)

### Accessibility

Saving and failure changes are status messages. They should remain visible and
be announced politely without moving focus or producing a toast on every
autosave. A blocking conflict or takeover needs a persistent operable region,
not a disappearing notification.

- [WCAG 2.2 status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- [WAI ARIA22 `role=status` technique](https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA22)

## Options

### Option A — Explicit Save Draft with revision conflict checks

Staff click **Save draft**. Every save includes the exact loaded source revision;
a mismatch stops the save and preserves the local work for conflict review.
Publish remains separate.

**Strengths**

- Smallest persistent lifecycle and easiest behavior to explain technically.
- No lock heartbeat or autosave scheduler.
- Version history contains only deliberate saves.

**Costs and risks**

- More clicks, navigation warnings, and lost-work exposure.
- Browser crash, session expiry, or network interruption can discard a long
  editing session.
- Two editors discover the conflict only after both invest work.
- It feels materially behind current CMS expectations.

### Option B-prime — Bounded autosave with one recoverable active editor — Recommended

Each continuously edited Phase-23 resource has one server-authoritative working
draft, one short-lived session-bound active-editor lease, and one expected
source-revision token. Changes autosave after a quiet measured delay. The latest
autosave is coalesced rather than creating a new permanent version on every
request. A second staff member sees who is editing and may **View**, **Return
later**, or—only with the right permission—**Take over editing**.

Every acknowledged save returns the new source revision. A stale revision,
expired/revoked permission, lost lease, other browser tab, restore, import, or
schema/profile change stops the save; it never last-write-wins or blindly merges
nested sections. Takeover preserves the latest acknowledged source as a named
recovery checkpoint and tells the displaced editor exactly what is and is not
saved.

Every draft, version, comparison, and restore read or mutation re-proves Tenant,
Site, resource, actor, and current permission. Ordinary edit access is not
treated as automatic restore or takeover authority. Anonymous, unaffiliated,
and cross-tenant version access is denied even when a provider endpoint or
Local API call would otherwise allow it.

History has two layers:

1. one rolling, normally hidden autosave recovery slot; and
2. bounded meaningful checkpoints for explicit saves, releases, restores,
   unpublishes, migrations/imports, and pre-takeover recovery.

The Web Studio header uses one persistent, accessible line rather than four
technical cards or repeated toasts:

- **Saving…**
- **Saved just now**
- **Could not save — your work is still in this tab**
- **Published · Unpublished changes**
- **Alex is editing · View only · Take over editing**

Routine autosave is automatic. **Save now** remains available through the
status control and keyboard shortcut, while Preview, publish preparation, and
intentional navigation first flush or clearly block on unsaved work. History
shows human-readable author, time, cause, publication marker, Site/locale, and
semantic change summary—not raw Payload JSON.

Restore means **Restore as a new draft** after comparison and current revision
reproof. It never rewinds history, overwrites someone else's work, changes the
public generation, or publishes automatically. D1 later binds and publishes one
exact server-acknowledged revision; edits saved after that selection stay draft.

The autosave delay, lease duration, and bounded retention are explicit,
version-qualified platform settings rather than tenant options or inherited
Payload defaults. Start qualification with an approximately two-second idle
debounce, a renewable five-minute lease, at most one rolling autosave, and an
explicit target of 100 ordinary unpinned history entries while protected
recovery and D1-required checkpoints remain retained; production evidence may
tune timing and the ordinary bound without changing the semantic contract.

This option deliberately excludes CRDT/operational transformation, field-level
automatic merge, presence cursors, per-keystroke version rows, tenant-specific
autosave/lock settings, persistent offline-first editing, and a second custom
version engine.

**Strengths**

- Modern low-friction editing with strong loss and overwrite protection.
- Uses Payload's qualified drafts, coalesced autosave, and versions behind a
  provider-neutral product contract, while containing its current lock surface
  behind the smallest atomically safe session-lease boundary.
- Keeps saved, published, selected for release, and publicly serving distinct.
- Avoids the cost and failure surface of simultaneous collaboration.

**Costs and risks**

- Requires lease expiry/takeover, revision CAS, and exact recovery UX.
- A second editor cannot edit simultaneously.
- Same-user multi-tab, network/auth failure, and permission revocation need
  explicit production-shaped tests.
- Tenant-isolated version reads, restore-as-draft, Local API lock enforcement,
  and autosave audit-volume behavior need explicit production-shaped tests.

### Option C — True simultaneous multi-editor collaboration

Multiple staff members edit the same draft at once with live presence, semantic
patch rebasing, convergent moves/deletes, collaborative history, and offline
reconnection.

**Strengths**

- Best experience for teams that genuinely co-author the same Page at the same
  time.
- Fewer explicit takeover moments when convergence is correct.

**Costs and risks**

- Requires a CRDT/OT-class synchronization system, new availability and
  observability obligations, schema-aware conflict rules, and extensive
  accessibility and migration work.
- Nested sections, localized content, typed relationships, restores, and schema
  upgrades are much harder than collaborative plain text.
- Solves a rare launch case at disproportionate permanent cost.

## Recommendation

Choose **Option B-prime**.

It combines the strongest proven behavior without importing provider noise or
Google-Docs-scale machinery:

- Contentful and Sanity: automatic saving never means public publication.
- Contentful: clearly expose **Published with unpublished changes**.
- WordPress and Payload: one active editor, read-only inspection, explicit
  takeover, and bounded recovery.
- Google Docs: a calm persistent save line and meaningful grouped history.
- D1: publish only one exact reviewed and server-acknowledged revision.

The permanent safety backstop is expected-revision CAS, even while a lease is
healthy. Payload's current lock is an advisory adapter, not enough by itself—
especially because its generated lock collection is not tenant-scoped, Local
API mutations override locks by default, acquisition is not atomically unique,
and same-user tabs can still race. The permanent simplicity backstop is one
small content-free lease boundary, one coalesced autosave slot, one bounded
meaningful history, and no automatic semantic merge or real-time collaboration
engine.

The release gate must additionally prove tenant-isolated `readVersions`,
permissioned and audited takeover/restore, restore-only-as-new-draft, explicit
provider settings, safe retry after a lost acknowledgement, and unchanged D1
public authority throughout autosave, conflict, takeover, and recovery.

## Hardened UX/UI contract

### Healthy editing

The editor header has one compact status control beside **Preview** and the
D1-composed publication action. It replaces the current four-card technical
strip. History and recovery details live behind the status control; provider
IDs, raw API links, lock vocabulary, and permanent version counters do not
occupy the ordinary workspace.

| Condition                                 | Staff copy                                                   | Behavior                                                                                     |
| ----------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Local change not sent                     | **Unsaved changes**                                          | Start the idle debounce; **Save now** remains available                                      |
| Write in flight                           | **Saving…**                                                  | Continue editing; coalesce one successor write rather than overlap requests                  |
| Exact revision acknowledged               | **Saved just now**                                           | Adopt the returned revision receipt; exact time and actor are available in details           |
| Released revision plus newer private work | **Published · Unpublished changes**                          | Keep the current public generation unchanged                                                 |
| Another actor owns the lease              | **Alex is editing · View only**                              | Read without mutation; show takeover only when the actor is authorized                       |
| Same actor owns another editing session   | **This page is already being edited in another tab**         | Keep this tab read-only unless the person explicitly transfers control                       |
| Save cannot reach the server              | **Can't save right now · Changes remain in this tab**        | Keep the local candidate, stop false success, retry safely, and warn before destructive exit |
| Save result is unknown after disconnect   | **Checking whether your changes saved…**                     | Retry the same idempotent command and resolve its receipt before sending a new write         |
| Authentication expires                    | **Sign in again to keep editing · Your changes remain here** | Preserve the editor, reauthenticate, then reprove permission, lease, and revision            |
| Permission is revoked                     | **Your access changed · These changes were not saved**       | Stop writes immediately; never imply that signing in again restores authority                |
| Expected revision is stale                | **This draft changed while you were editing**                | Stop blind retry; preserve base, current server draft, and local candidate for comparison    |
| Draft is saved but release-invalid        | **Draft saved · Fix 3 items before publishing**              | Preserve recovery separately from D1 release validation                                      |

**Saved** is reserved for a server acknowledgement containing the exact new
source revision, timestamp, command receipt, and acknowledged content identity.
Queued, debounced, in-flight, browser-only, or retrying work is not saved.
Routine autosave uses a stable, polite status region and no success toast.
Screen readers hear meaningful failure, recovery, explicit-save, publication,
and view-only transitions—not **Saving** and **Saved** on every typing pause.

### Save pipeline

1. Opening the editor returns the exact current draft revision, public
   relationship, actor permissions, and session-specific lease result together;
   the page never briefly appears editable before becoming read-only.
2. A local edit marks only the client candidate dirty. After an explicit,
   platform-owned idle debounce, one mutation sends the exact scope, active
   lease generation/fencing token, expected revision, stable command
   idempotency key, and content digest.
3. While that mutation is in flight, new edits remain dirty and are coalesced
   into at most one successor request. Requests from one editor never overlap.
4. The server re-proves current Tenant, environment, Site, locale, resource,
   actor, permission, Phase-10 ceiling where applicable, lease owner and
   generation, schema/profile, and expected revision before advancing the
   Working Revision.
5. The client clears only the exact acknowledged candidate. Edits made during
   the request remain dirty. Preview, release preparation, and intentional
   navigation flush and await this pipeline or clearly block.

The initial qualification target is approximately a two-second idle debounce,
a renewable five-minute inactive lease, at most one rolling recovery autosave,
and a platform target of 100 ordinary unpinned history entries per resource.
Current/open recovery, the revision used by active or retained D1 generations,
and other cause-owned protected checkpoints cannot be deleted merely because a
provider row count was reached. These are version-qualified platform settings,
not tenant controls; production latency, database, usability, retention, and
accessibility evidence may tune the numbers without changing the semantic
contract.

### One active editor and takeover

There is one atomically unique current lease per exact resource scope; the
**editing session** owns it and its monotonically changing generation fences
old sessions. It is not merely a user-account lock. That prevents two tabs for
the same person from silently racing.
A second session may inspect the current acknowledged draft in read-only mode.
It sees the bounded tenant-visible display identity and last activity—not an
email address, raw user ID, or information from another scope.

**Take over editing** is a separate permissioned action. Confirmation states
that the other session will stop editing and that only its last
server-acknowledged work is guaranteed. One transaction first re-proves current
scope, permission, lease owner/generation, and expected revision; only then does
it create a labelled pre-takeover checkpoint and atomically transfer the lease
to a new generation. Failed proof creates neither checkpoint nor lease change.
The displaced editor is interrupted once, becomes read-only, keeps any unsent
local candidate in that tab, and may compare or copy it.

A visible authenticated editor renews its lease while the person is actively
using or reading the editor, even when they are not typing. Renewal is not tied
only to content changes. Hidden, suspended, crashed, or abandoned sessions stop
renewing and cannot retain authority indefinitely; mobile/background resume
re-proves lease generation, revision, and authority before the next write.

### Failure and conflict recovery

The product distinguishes three failure facts:

- **Not sent or definitely rejected:** preserve the local candidate and show the
  exact repair cause.
- **Outcome unknown:** retry the same idempotency key and identical candidate;
  use bounded automatic retries with backoff, then pause and show **Try again**
  while retaining the same key. Reconcile through receipt lookup before any
  successor write; do not spin forever or create a new write while the original
  outcome remains unknown.
- **Server accepted but another change now exists:** adopt the returned receipt,
  then send only the still-dirty successor candidate against that revision.

A stale-revision conflict never last-write-wins and never blindly retries.
Comparison preserves **Started from**, **Current draft**, and **Your unsaved
work**. It summarizes semantic section additions, removals, moves, text changes,
and relationship changes before text-level detail. Launch provides no automatic
merge for blocks, navigation, reusable references, paths, localized values, or
schema/profile changes. An authorized actor may deliberately continue from the
current draft or make the preserved local candidate the new draft only after
checkpointing both sides and repeating compare-and-swap.

D12 is not persistent offline-first editing. A bounded tab-local candidate may
remain while the editor is open; it is never described as durable, never syncs
later without reproof, and never crosses actor or Tenant scope. Destructive
navigation is warned while work is unacknowledged. The system does not claim it
can recover work after a closed tab, cleared browser, or device loss unless a
server acknowledgement already exists.

### History and restore

Healthy staff see meaningful checkpoints, not every debounce:

- current working draft and one normally hidden rolling autosave;
- explicit **Save now** when it creates a deliberate checkpoint;
- D1-selected and published revision markers;
- pre-takeover and conflict-recovery checkpoints;
- restore-as-draft; and
- qualified import, migration, or other cause-owned system writes.

Each visible checkpoint shows actor, cause, exact time, Site/locale, public
relationship, and a semantic summary. Autosave remains operational recovery,
not a claim that every keystroke is a human audit event. Ordinary autosave must
not trigger donor notifications, integrations, cache purge, public search,
publication, or other business effects.

The only ordinary command is **Restore as a new draft** after comparison. It
checkpoints the current draft, re-proves current version-read, restore,
takeover/edit, scope, lease, revision, profile, and reference authority, then
appends a successor private draft. It never rewrites history, publishes,
unpublishes, changes D1's serving head, or calls raw provider restore semantics.

### Mobile and accessibility

- The editor and history reflow to one column. History uses labelled
  **Earlier** and **Current draft** views where side-by-side comparison does not
  fit.
- The save state remains visible but never obscures focus, zoomed content, or
  the on-screen keyboard. Takeover and recovery use full-width labelled actions,
  not hover or icon-only controls.
- Every state is conveyed by text and programmatic state, never color alone.
  Failure and conflict messages remain until resolved.
- Ordinary saving never moves focus. A takeover or conflict may use an
  accessible alert dialog only because continued editing would otherwise be
  misleading; it uses least-destructive initial focus and returns focus safely.
- Keyboard users receive **Save now**, History, comparison, and takeover without
  drag or hover. Touch targets, reflow, screen-reader announcements, high
  contrast, reduced motion, and mobile background/resume are release proofs.

The complete current-product benchmark and 26-item UX pitfall register are in
[`phase-23-d12-editorial-recovery-ux-benchmark.md`](./phase-23-d12-editorial-recovery-ux-benchmark.md).

## Ruthless adversarial review

### 1. Brittleness — concern: **Yes**

- **What could go wrong:** Autosave assumes a stable connection, a lock assumes
  one tab per user, restore assumes compatible schema, or release reads whatever
  mutable draft is latest. Provider defaults can also change across the current
  internal Payload build and later releases.
- **Why it matters:** Ordinary latency, browser suspension, upgrades, and
  multiple entry points can turn a calm editor into silent overwrite or lost
  work.
- **Severity:** High.
- **Likelihood without controls:** High.
- **Permanent prevention:** Explicit product-owned timing/retention settings;
  session-scoped renewable lease; expected-revision CAS; immutable revision
  receipts; schema-aware history; exact revision selection by D1; qualified
  adapters instead of inherited defaults.

### 2. Technical debt — concern: **Yes**

- **What could go wrong:** Every collection invents save states, lock handling,
  retry code, audit behavior, and restore wrappers, or Core builds a second
  version engine beside Payload.
- **Why it matters:** Fixes diverge and every new resource family multiplies
  maintenance and migration cost.
- **Severity:** High.
- **Likelihood without controls:** High; the current collections already repeat
  autosave configuration and the UI exposes provider state directly.
- **Permanent prevention:** One provider-neutral Editorial Working Revision
  contract, one command/result vocabulary, one qualified Payload adapter, shared
  access/lease/CAS helpers, one semantic history presenter, and contract tests
  reused by every admitted resource family.

### 3. Edge cases — concern: **Yes**

- **What could go wrong:** Same-user tabs, sleep/resume, lease expiry during a
  save, acknowledgement loss after commit, auth expiry, permission revocation,
  deletion/retirement, schema change, reference withdrawal, huge documents,
  clock skew, or takeover during Preview produces ambiguous state.
- **Why it matters:** These are realistic editorial conditions and several can
  destroy or falsely report work if treated as generic network errors.
- **Severity:** High.
- **Likelihood without controls:** High over the life of the product.
- **Permanent prevention:** Typed outcomes and state-machine tests for every
  case; server time and opaque revisions; idempotent replay; resume reproof;
  exact lifecycle/reference validation; bounded documents and history; no
  implicit retry after a conflict.

### 4. Footguns — concern: **Yes**

- **What could go wrong:** A developer uses Payload Local API defaults that
  override access or locks, omits the expected revision, calls raw restore,
  lets a browser call the generated cross-tenant lock collection, labels locally
  queued work **Saved**, or lets autosave trigger ordinary hooks.
- **Why it matters:** One convenient call can bypass the entire collaboration,
  tenant, publication, or recovery contract.
- **Severity:** Critical.
- **Likelihood without controls:** Medium-high.
- **Permanent prevention:** Actor-scoped operations require
  `overrideAccess: false` and `overrideLock: false`; product commands make scope,
  revision, lease, cause, and idempotency mandatory; raw mutation/restore paths
  and generated lock CRUD are not UI entry points; static/contract tests fail
  unsafe adapters.

### 5. Tenant safety — concern: **Yes**

- **What could go wrong:** Lock-holder identity, draft content, comparison, or
  version history leaks across Tenant, Site, locale, environment, role, or
  restricted subject. Current reviewed collections omit explicit
  `readVersions`, while the installed provider treats that as separate access;
  generated lock CRUD is authenticated-only rather than tenant-scoped, and
  retained versions can lose their tenant key after hard deletion.
- **Why it matters:** Historical drafts can contain more sensitive information
  than the current public Page; a version ID is not authorization.
- **Severity:** Critical.
- **Likelihood without controls:** Medium-high, with a concrete current
  configuration gap.
- **Permanent prevention:** Explicit tenant/resource-bounded `readVersions` and
  comparison queries; an atomically unique scope-exact lease surface instead of
  raw provider locks; immutable retained scope or deletion restriction;
  server-side current membership and permission reproof; composite scope
  constraints and negative tests; bounded collaborator display identity; no
  anonymous or ID-only history/restore access. Supabase RLS is never cited as
  protection for a Payload path using a privileged direct database connection.

### 6. Over-engineering — concern: **Yes**

- **What could go wrong:** B-prime expands into presence streams, CRDT/OT,
  offline synchronization, per-field merge, multiple branches, arbitrary
  tenant lock matrices, or a universal workflow engine.
- **Why it matters:** It would create a new collaboration platform for an
  infrequent nonprofit editing case and make the common workflow harder.
- **Severity:** High.
- **Likelihood without controls:** Medium; modern editors make these features
  look deceptively adjacent.
- **Permanent prevention:** One active session, one working draft, one rolling
  recovery autosave, meaningful checkpoints, deliberate whole-resource
  conflicts, platform-owned settings, and explicit exclusion of simultaneous
  collaboration and offline-first sync.

### 7. UX/UI and user friction — concern: **Yes**

- **What could go wrong:** Technical cards, version counts, lock jargon, toasts,
  unclear saved/published language, unexpected takeover, hidden mobile actions,
  or a destructive restore make staff unsure whether their work or website is
  safe.
- **Why it matters:** Uncertainty causes duplicate work, needless support,
  premature publication, abandoned changes, and accessibility failures.
- **Severity:** High.
- **Likelihood without controls:** High; the current Web Studio state strip is
  diagnostic rather than task-led.
- **Permanent prevention:** One quiet accessible status control; exact copy and
  actions above; progressive History; read-only inspection; explicit takeover;
  semantic compare; restore as new draft; production usability tests with
  nonprofit staff and keyboard, screen-reader, mobile, and poor-network users.

### 8. Hidden coupling — concern: **Yes**

- **What could go wrong:** Autosave changes Page placement or Navigation,
  assumes D11 editor JSON, runs D9 package compilation, weakens Phase 10, adopts
  Phase 22 contributor rules, or becomes a second D1 release head.
- **Why it matters:** An ordinary text edit could unexpectedly alter structure,
  safety, public rendering, or another phase's source-owned fact.
- **Severity:** High.
- **Likelihood without controls:** Medium-high.
- **Permanent prevention:** Explicit resource adapters and ownership table;
  autosave mutates only the resource's private editable source; structural and
  public actions remain separate commands; D1 selects an exact acknowledged
  revision and pins all compatibility facts.

### 9. Failure modes — concern: **Yes**

- **What could go wrong:** A write commits but its response is lost, the lease
  transfers mid-request, the database or provider returns a partial error, the
  browser exits dirty, or history/restore fails after the current draft was
  changed.
- **Why it matters:** The user can duplicate, overwrite, or abandon work because
  the interface reports the wrong outcome.
- **Severity:** High.
- **Likelihood without controls:** High for intermittent failures at scale.
- **Permanent prevention:** Atomic command processing; stable idempotency keys
  and receipts; typed not-sent/rejected/outcome-unknown states; no overlapping
  writes; prior-generation continuity; append-only restore; persistent
  cause-owned failure UI and safe retry.

### 10. Data integrity risks — concern: **Yes**

- **What could go wrong:** Last-write-wins loses work; same-user tabs bypass a
  user-level lock; autosave clears newer local edits; restore rewrites public
  status; count-based retention deletes a protected release/recovery checkpoint;
  release or Preview compiles a different draft from the one reviewed.
- **Why it matters:** Content history, staff trust, audit evidence, and public
  meaning stop agreeing.
- **Severity:** Critical.
- **Likelihood without controls:** Medium-high.
- **Permanent prevention:** Session-bound lease plus CAS on every mutation;
  acknowledge exact content identity; coalesced serial writes; immutable
  meaningful checkpoints; semantic retention/pinning; restore-as-successor-
  draft; Preview and D1 bind the exact immutable source revision/digest.

### 11. Security and privacy risks — concern: **Yes**

- **What could go wrong:** Draft prose, restricted identities, lock metadata, or
  raw errors enter analytics; a stale authenticated tab keeps authority; local
  recovery survives a shared-device session; privileged service writes bypass
  the product command.
- **Why it matters:** Private or Phase-10-sensitive content can leak even though
  the public projection is safe.
- **Severity:** Critical.
- **Likelihood without controls:** Medium.
- **Permanent prevention:** Current authorization on every read/write; minimal
  scoped collaborator identity; no content in telemetry; bounded in-tab
  recovery cleared on exit/sign-out where possible; service-cause allowlist and
  audit; CSP/XSS defenses; cross-tenant and revocation tests.

### 12. Scalability and performance risks — concern: **Yes**

- **What could go wrong:** A 300 ms cadence, full-document snapshots, lock
  heartbeats, audit hooks, comparisons, and version indexes create write
  amplification, database bloat, slow editors, and noisy downstream work.
- **Why it matters:** Behavior that feels fine with one Page can fail under many
  tenants, long documents, migrations, or simultaneous editors on different
  resources.
- **Severity:** Medium-high.
- **Likelihood without controls:** High with the current cadence and unclassified
  audit hook.
- **Permanent prevention:** Measured idle debounce; one in-flight write;
  coalesced rolling autosave; explicit retention; autosave-dark hooks; indexed
  tenant/parent/autosave/time access paths; bounded semantic diff; minimum,
  typical, and maximum load tests with p95/p99 budgets.

### 13. Operational burden — concern: **Yes**

- **What could go wrong:** Operators manually clear stuck locks, repair version
  rows, explain provider vocabulary, recover drafts from logs, or tune settings
  tenant by tenant.
- **Why it matters:** Small nonprofits and a multi-tenant support team cannot
  sustain tribal-knowledge recovery procedures.
- **Severity:** Medium-high.
- **Likelihood without controls:** Medium-high.
- **Permanent prevention:** Automatic lease expiry, self-service authorized
  takeover, semantic history/restore, platform-owned settings, cause-owned admin
  diagnostics, documented recovery runbook, and no routine database surgery.

### 14. Observability gaps — concern: **Yes**

- **What could go wrong:** Operators cannot distinguish network failure, lost
  acknowledgement, stale revision, lock contention, denied version access,
  provider error, or public-release failure.
- **Why it matters:** Diagnosis becomes content inspection or guesswork, while
  users receive generic **Save failed** messages.
- **Severity:** High.
- **Likelihood without controls:** High.
- **Permanent prevention:** Safe cause codes and correlation IDs; metrics for
  save latency/outcome, idempotent replay, conflicts, lease expiry/takeover,
  history denial, restore, retention, and audit volume; exact source revision
  and command receipt without logging content, names, full URLs, or tokens.

### 15. Dependency and integration risks — concern: **Yes**

- **What could go wrong:** Payload's internal v4 behavior changes, documented
  autosave timing differs from the installed source, Local API defaults bypass
  locks, or hooks/integrations treat each autosave as a normal change.
- **Why it matters:** A provider upgrade can silently change correctness,
  storage, access, or operational cost.
- **Severity:** High.
- **Likelihood without controls:** High; drift is already observable between
  current docs, installed defaults, and repo configuration.
- **Permanent prevention:** Provider-neutral contract; exact build
  qualification; explicit settings and access functions; adapter integration
  tests against N and N+1; cause-classified hooks; expand-compatible rollout
  and rollback retaining old readers.

### 16. Migration and upgrade risks — concern: **Yes**

- **What could go wrong:** Existing drafts have no stable expected-revision
  token, legacy versions are outside tenant policy, schema changes make old
  snapshots unrenderable, retained rows lose their tenant key after hard delete,
  enabling locks strands sessions, or changing retention deletes needed
  evidence.
- **Why it matters:** Cutover can lose drafts, block editing, or expose history
  even if new documents behave correctly.
- **Severity:** High.
- **Likelihood without controls:** High in this brownfield CMS.
- **Permanent prevention:** Complete resource/version/lock census; deterministic
  backfill and immutable tenant validation; compatibility readers and semantic
  diff for retained schemas; shadow verification; bounded lease rollout;
  retention dry run/control totals with protected checkpoints; no
  auto-publication; rollback rehearsal.

### 17. Other development hazards — concern: **Yes**

- **What could go wrong:** Race conditions between autosave, takeover, restore,
  import, profile migration, Preview, or D1 release; blind client retries;
  untested service paths; deployment skew; unclear ownership of recovery and
  incident response.
- **Why it matters:** The happy-path UI can pass while production writes remain
  nondeterministic.
- **Severity:** Critical.
- **Likelihood without controls:** Medium-high.
- **Permanent prevention:** One atomic command boundary and lock ordering;
  idempotency plus expected-revision CAS; exhaustive API and background-job
  tests; old/new adapter compatibility; explicit owner/runbook; fail-closed
  deployment and no destructive rollback.

## Ruthless synthesis — the permanent path

1. **Freeze the provider-neutral semantics first.** Ratify Working Revision,
   revision receipt, Active Editor Lease, rolling recovery autosave, meaningful
   checkpoint, takeover, comparison, and restore-as-draft. Do not encode the
   decision as Payload UI state or a database-specific lock.
2. **Close existing access and adapter hazards before UX polish.** Define
   tenant-bounded `readVersions`; remove raw authenticated lock CRUD; preserve
   immutable scope on retained history; make every actor-scoped Local API
   operation enforce access and lease; wrap restore; classify autosave effects;
   configure timing and semantic retention explicitly.
3. **Build one atomic save command.** Require exact scope, actor, permission,
   one atomically unique resource-scoped lease owned by the editing session,
   expected revision, idempotency key, cause, content identity, and the current
   monotonically fenced lease generation; return one typed receipt. Prove same-
   user tabs and bounded lost-acknowledgement reconciliation before adding
   takeover.
4. **Deliver the quiet healthy path.** Replace technical cards with the single
   status control, serial/coalesced autosave, **Save now**, Preview flush, and
   truthful published/unpublished copy. Test it under real latency and assistive
   technology.
5. **Add cause-owned recovery.** Implement read-only contention, authorized
   checkpointed takeover, auth-preserving re-entry, revocation failure,
   three-fact conflict comparison, and bounded in-tab recovery without
   automatic block merge or offline-first promises.
6. **Add meaningful history, then restore.** Keep one rolling recovery slot and
   bounded checkpoints while pinning active/recovery/D1-required history;
   expose semantic comparison; permit only append-only restore as a new private
   draft. Prove public D1 continuity throughout.
7. **Migrate and release by evidence.** Census all D1/D4/D8/D11-admitted source
   families, backfill/reject deterministically, run cross-tenant and load
   shadow proofs, qualify the exact Payload build plus rollback candidate, and
   activate only after the production-shaped matrix passes.

## Required verification inherited by the eventual specification

1. Serial autosave preserves edits made during an in-flight request and marks
   only the exact acknowledged candidate clean.
2. Network loss before send, during send, and after commit yields three truthful
   outcomes; bounded same-key retry and receipt lookup neither duplicates nor
   discards a save, spins forever, nor permits a successor write while the first
   outcome remains unknown.
3. Different-user and same-user/two-tab races prove one writable session,
   exact-resource lease uniqueness, monotonically fenced generations,
   expected-revision rejection, and no last-write-wins path.
4. Lease expiry, crash, sleep, hidden tab, mobile suspension, and resume reprove
   current permission, lease generation, and revision without an indefinite
   lock; a healthy visible editor also retains control while reading without
   typing.
5. Authorized/unauthorized takeover, pre-takeover checkpoint, displaced-editor
   interruption, and local unsent-work preservation pass in one atomic proof,
   checkpoint, and lease-transfer transaction with no failed-proof side effect.
6. Authentication expiry preserves the local candidate through reauthentication;
   membership, permission, Tenant, Site, locale, and Phase-10 revocation stop
   saving even after successful sign-in.
7. UI, REST, Local API, background job, import, AI-assisted accept, migration,
   restore, and release paths all require the same scope, cause, access, lock,
   idempotency, and revision contract or an explicit audited system authority.
8. Anonymous, unrelated, cross-Tenant, cross-environment, cross-Site,
   cross-locale, insufficient, stale, and revoked actors cannot read locks,
   versions, comparisons, checkpoints, or restore targets.
9. Preview and D1 release bind the exact server-acknowledged revision; a later
   autosave stays private, and every failure leaves the prior public generation
   serving.
10. Conflict comparison preserves base/current/local meaning for text, section
    insert/delete/move, relationships, paths, Navigation, Reusable Sections,
    locale, and schema/profile drift without automatic semantic merge.
11. Restore checkpoints the current draft, appends one compatible new draft,
    never mutates history or public status, and fails safely on stale authority
    or incompatible references.
12. One rolling autosave and bounded meaningful retention survive sustained
    edits, takeover, restore, migration, and maximum-sized documents without
    losing required checkpoints or creating unbounded audit/integration work.
13. Save status, failure, view-only, takeover, conflict, history, and restore
    pass keyboard, screen-reader, focus, reflow, zoom, touch, high-contrast,
    reduced-motion, and mobile background/resume testing.
14. Telemetry distinguishes every stable failure cause and measures p50/p95/p99
    latency, contention, retries, conflicts, restores, access denial, and
    version/audit volume without collecting content or sensitive identity.
15. The exact installed Payload build, candidate upgrade, schema migration,
    old/new reader skew, failed deployment, and rollback preserve all drafts,
    histories, locks, and the last D1 public generation.

## Exact ratified Phase 23 D12 formulation

> **B-prime-amended-and-hardened (B-prime-R) — one quiet, bounded,
> server-acknowledged Editorial Working Revision contract with one recoverable
> active editor:** every D12-admitted Phase-23 editable resource has exactly one
> private server-authoritative Working Revision, one renewable Active Editor
> Lease enforced as the one atomically unique current lease for the exact
> Tenant × environment × Site × BCP-47 locale × typed resource, with actor and
> editing session as its owner and one monotonically changing Lease Generation
> as its fencing token, and one opaque expected Source Revision. The current
> lease generation is required by every renewal, save, takeover, restore, and
> other mutation so a displaced or expired session cannot act through an old
> token. A short explicit platform-owned idle debounce serializes and coalesces
> autosave into at most one rolling recovery version; every UI, REST, Local
> API, import, migration, AI-accept, restore, or cause-owned system mutation
> re-proves exact scope, current actor and permission, current Phase-10 ceiling
> where
> applicable, lease or explicit audited override authority, schema/profile and
> reference compatibility, idempotency key, expected revision, and acknowledged
> content identity before atomically advancing the Working Revision and
> returning one exact revision receipt. A lease coordinates people but never
> replaces CAS; same-user tabs remain distinct sessions; no stale write, raw
> provider call, blind retry, or last-write-wins path is allowed.
>
> Working Revision is a shared behavioral contract, not one fused document:
> Page/Article Editorial source, D1 Page Placement, D4 Navigation, D8 Reusable
> Section, and any other admitted source-owned resource retain separate revision
> identities, permissions, leases, commands, and publication dependencies. A
> prose autosave never moves a Page, rewrites Navigation, changes a shared
> section, switches a D9 package, or changes Phase-22 operational or specialized
> content truth implicitly.
>
> Ordinary Web Studio authoring exposes one persistent accessible status control
> beside Preview and D1's publication action—**Unsaved changes**, **Saving…**,
> **Saved just now**, **Published · Unpublished changes**, or one
> cause-owned failure—rather than technical cards, version counts, provider
> vocabulary, or success toasts. **Saved** means the server acknowledged the
> exact candidate and revision; queued, browser-only, in-flight, or
> outcome-unknown work is never called saved. Routine editing autosaves
> automatically, while **Save now** and `Ctrl`/`Cmd` + `S` flush without
> publishing. Preview, release preparation, and intentional navigation await
> the exact acknowledgement or block clearly; D1 selects and publishes only
> that immutable reviewed revision, while any later autosave remains private.
>
> A second editing session opens the current acknowledged draft read-only with
> bounded tenant-visible editor identity and last activity. It may return later
> or, only with distinct current authority, confirm **Take over editing**. The
> server uses one transaction that first re-proves current scope, permission,
> lease owner/generation, and expected revision, then creates a cause-labelled
> pre-takeover checkpoint and atomically transfers ownership under a new Lease
> Generation; failed proof changes nothing. The displaced editor is interrupted
> once, becomes read-only, retains unsent work only in that tab, and receives
> truthful compare/copy recovery. A visible authenticated editor renews while
> the person is actively using or reading it even without typing; lease renewal
> stops for hidden, suspended, crashed, or abandoned sessions. Those sessions
> cannot preserve authority indefinitely, and resume re-proves lease generation,
> revision, and permission before another write.
>
> Save failure distinguishes not-sent or rejected, committed-with-lost-
> acknowledgement, and stale-revision outcomes. The first preserves the local
> candidate and exact repair cause; the second performs bounded automatic retry
> with backoff using the identical command and idempotency key, then pauses with
> **Try again** and receipt lookup before any successor write if the outcome
> remains unknown; the third stops automation and preserves **Started from**,
> **Current draft**, and **Your unsaved work** for semantic comparison. Session
> expiry reauthenticates without clearing the editor and then re-proves all
> authority; permission, membership, Site, locale, lifecycle, reference, or
> Phase-10 revocation stops writes immediately and is never treated as a login
> problem. D12 promises no persistent offline-first synchronization or recovery
> after tab/device loss for work the server never acknowledged.
>
> History uses one normally hidden rolling autosave plus explicit bounded
> immutable meaningful checkpoints for deliberate saves, D1 release selection
> and publication markers, pre-takeover/conflict recovery, restore, and
> qualified import or migration. Each visible checkpoint carries actor, exact
> time, cause, Site/locale, source/profile schema, public relationship, and a
> semantic summary; autosave is a side-effect-dark recovery cause and never
> emits ordinary notifications, integration effects, cache/search/publication
> work, or per-keystroke permanent audit rows. Version reads, comparisons,
> lock-holder identity, checkpoints, and restores have explicit tenant- and
> resource-bounded authorization; a document or version ID alone grants
> nothing. **Restore as a new draft** compares first, checkpoints the current
> draft, repeats current scope/permission/lease/revision/compatibility proof,
> and appends a private successor—never rewriting history, publishing,
> unpublishing, changing D1's serving head, or exposing raw Payload restore.
>
> Payload drafts, coalesced autosave, and versions may implement this contract
> only after exact-build qualification with explicit access,
> `overrideAccess: false` and `overrideLock: false` for actor-scoped Local API
> use, explicit timing and semantic retention, restore wrapping, and
> N/N+1/rollback proof. Payload's current user-bound generated lock collection
> is advisory only: it cannot own D12's authoritative lease unless a qualified
> adapter proves exact resource-scope uniqueness, session ownership, monotonic
> fencing generation, and current authorization; otherwise one small Core-owned
> lease boundary provides only those facts and stores no content. Launch
> qualification begins near a two-second idle debounce, five-minute inactive
> lease, one rolling recovery autosave, and a platform target of 100 ordinary
> unpinned history entries while active/recovery/D1-required checkpoints remain
> protected, tuned only by measured platform evidence rather than tenant
> settings. Production activation
> requires cross-tenant version and lease denial, same-user/different-user race,
> lost-acknowledgement replay, takeover, auth/revocation, restore-as-draft,
> migration, load, audit-volume, mobile, and accessibility proof—without
> CRDT/OT, live cursor or presence streams, automatic field/block merge,
> multiple working branches, persistent offline
> queue, tenant autosave/lock matrices, second version engine, mutable public
> draft head, destructive rollback, or any claim that changed, queued, saved,
> valid, previewed, reviewed, selected, compiled, released, serving, indexed,
> notified, or integrated are the same fact.

## Ratification boundary

The quoted B-prime-R formulation above is the exact founder-ratified Phase 23
D12 authority. The surrounding research remains supporting analysis and does
not independently expand the decision. Ratification authorizes no
implementation, schema work, migration, provider adoption, issue publication,
deployment, release activation, or production change. The exact formulation is
also preserved in the Phase 23 decision log and ADR-0156.

Root `CONTEXT.md` remains intentionally untouched while Phase 22 PR #1323 is
open. D12 does not overwrite accepted Phase-22 terminology or source authority.
