# Phase 23 D12 Payload Editorial Lifecycle — Exact-Build Primary-Source Research

- **Status:** Decision evidence only; no implementation authority
- **Research date:** 2026-08-22
- **Decision seam:** B-prime — bounded autosave with one recoverable active
  editor
- **Scope:** Exact Payload draft, autosave, version, lock, access, restore,
  transaction, hook, and failure semantics that constrain D12

## Executive finding

Payload supplies useful draft and version primitives, but its provider defaults
do **not** constitute the D12 concurrency, tenant-isolation, recovery, or release
contract.

The exact build used by Core has five material facts that the product contract
must address explicitly:

1. Core's page collections do not define `access.readVersions`. In this Payload
   build, an absent `readVersions` rule allows any authenticated user, while
   version endpoints consult that rule rather than the ordinary tenant-scoped
   `read` rule. This is a real cross-tenant exposure risk, not a hypothetical
   future concern.
2. Payload's lock is user-bound and advisory. Same-user tabs are not separated,
   Local API mutations bypass locks by default, lock acquisition has no unique
   resource constraint, and the autosave version write has no expected-revision
   compare-and-swap (CAS).
3. Autosave coalesces a rolling version, which is desirable, but two concurrent
   accepted writes can still overwrite that same rolling version. The Admin UI
   deliberately skips stale-data detection when autosave is enabled.
4. Raw restore is not a safe product command. The installed Local API defaults
   to bypassing access and fails to forward its typed `draft` option; the restore
   operation therefore defaults to restoring the historical status into the
   live collection. The omission remains present in Payload's current upstream
   `main` snapshot reviewed on 2026-08-22.
5. Core inherits a 100-version provider retention limit with timestamp-based
   pruning, while current public docs and exact source disagree about the
   default autosave interval. Neither default should carry product meaning.

The durable guardrail is therefore small but stronger than provider locking:
one tenant-bound, editor-session-bound lease; one server-authoritative private
working revision; expected-revision CAS plus an idempotent save sequence on
every mutation; coalesced autosave; explicit meaningful checkpoints; and a
product-owned **Restore as new draft** action. D1 remains the only ordinary
public release authority.

## Evidence provenance and precedence

Core executes registry packages pinned to
`4.0.0-internal.1f9ae9a`:

- `package.json:225-232`
- `apps/admin/package.json:39-44,64`

The matching official Payload commit is
[`1f9ae9ab37bd7a69894762c833fad3e65124c314`](https://github.com/payloadcms/payload/commit/1f9ae9ab37bd7a69894762c833fad3e65124c314).
All exact-build source links below are pinned to that commit. Core's checked-in
`vendor/payload-upstream` is v3.77.0 and is expressly a historical audit mirror,
not runtime source (`docs/vendor/payload.md:3-22`).

For a behavior conflict, evidence precedence is:

1. Core configuration and the exact installed/pinned source;
2. official documentation for conceptual and supported API behavior;
3. a pinned snapshot of current upstream source to determine whether a known
   exact-build hazard has since changed.

This matters because the current
[Autosave documentation](https://payloadcms.com/docs/versions/autosave) says the
default debounce interval is 800 ms, while both the
[installed source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/versions/defaults.ts#L1-L3)
and [upstream `main` snapshot `134c89b`](https://github.com/payloadcms/payload/blob/134c89b7955d0dcde9137643ab86873ff542dbd4/packages/payload/src/versions/defaults.ts#L1-L3)
use 2,000 ms. Core explicitly uses 300 ms.

## Current Core baseline

### Draft and autosave configuration

- `Pages` enables drafts with `interval: 300` and
  `showSaveDraftButton: true` at
  `apps/admin/src/cms/collections/pages.ts:64-71`.
- Shared missionary/project page-builder collections use the same values at
  `apps/admin/src/cms/collections/page-builders.ts:568-576`.
- The reviewed page collections do not set `maxPerDoc`, `lockDocuments`, or
  `access.readVersions`.
- Payload Postgres is configured without disabling transactions at
  `apps/admin/payload.config.ts:112-116`.

The 300 ms value is substantially more aggressive than both contemporary docs
and the exact provider source. It may be appropriate only after measured proof
under realistic typing, relationship-field, upload, validation, latency, and
hook load. It should be an explicit code-owned operational value, not a tenant
matrix and not an inherited default.

### Current Web Studio status surface

`resolveNativeDocumentPrimaryState` already distinguishes lock, trash, upload,
save, invalid, modified, autosaved, draft, and published states
(`apps/admin/src/cms-ui/web-studio/collections/shared/document-workspace/editor-state.ts:42-145`).
The same module always constructs four status cards—editing, publication,
autosave, and preview—at lines 148-161, with provider-oriented descriptions at
lines 206-237. These are useful diagnostic seams, but they are too noisy for the
ordinary D12 experience. D12 should derive one calm status line and reveal
conflict/history detail only when it changes the next action.

### Current audit behavior

Every reviewed page-builder collection installs `logCmsChangeAudit`
(`apps/admin/src/cms/collections/page-builders.ts:579-595`). That hook logs every
`afterChange` at `apps/admin/src/cms/hooks/audit.ts:8-26`. The exact Payload
update pipeline runs collection `afterChange` hooks after autosave writes too
([source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/collections/operations/utilities/update.ts#L442-L475)).
At a 300 ms cadence, undifferentiated autosaves can create high-volume logs that
still do not provide a durable, meaningful editorial audit trail.

## Exact-build findings

### 1. Version history has an independent tenant boundary

**Concern: yes — critical severity, high likelihood once version UI/API is
reachable.**

Core page collections tenant-bind ordinary reads, creates, updates, and deletes
(`apps/admin/src/cms/collections/pages.ts:50-58` and
`apps/admin/src/cms/collections/page-builders.ts:587-596`) but define no
`readVersions` policy.

In the exact build:

- collection defaults install `create`, `delete`, `read`, `unlock`, and
  `update`, but not `readVersions`
  ([source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/collections/config/defaults.ts#L57-L65));
- `executeAccess` returns `true` for any authenticated request when the supplied
  access function is absent
  ([source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/auth/executeAccess.ts#L13-L41));
- list, count, and by-ID version operations consult
  `collectionConfig.access.readVersions`, not ordinary `read`
  ([list source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/collections/operations/findVersions.ts#L70-L100),
  [by-ID source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/collections/operations/findVersionByID.ts#L67-L116));
- Local API version reads additionally default `overrideAccess` to `true`
  ([list source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/collections/operations/local/findVersions.ts#L117-L150),
  [by-ID source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/collections/operations/local/findVersionByID.ts#L92-L129)).

The official Payload multi-tenant plugin confirms the required query shape: it
wraps `readVersions` separately and changes the tenant path from `tenant` to
`version.tenant`
([source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/plugin-multi-tenant/src/utilities/addCollectionAccess.ts#L7-L55)).

**Permanent prevention:** every D12 source collection must define an explicit,
fail-closed, version-row-aware tenant and role predicate. Every user-derived
Local API call must pass both the authenticated user/request and
`overrideAccess: false`. Historical rows without a provable tenant must be
quarantined, not interpreted as global. Cross-tenant list, count, by-ID,
compare, diff, and restore tests are release gates.

### 2. Payload locking is coordination, not concurrency control

**Concern: yes — high severity, high likelihood under multiple tabs or staff.**

The official
[Document locking documentation](https://payloadcms.com/docs/admin/locked-documents)
describes a five-minute default inactivity lease, read-only entry, takeover,
and a Local/REST `overrideLock` option. The exact implementation narrows what
that guarantee means:

- update lock checks default `overrideLock` to `true`; enforcement occurs only
  when callers explicitly pass `false`
  ([source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/utilities/checkDocumentLockStatus.ts#L18-L62));
- browser REST update forces `overrideLock: false` by default
  ([source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/collections/endpoints/updateByID.ts#L10-L41)),
  but Local API update defaults `overrideAccess: true` and leaves
  `overrideLock` unqualified
  ([source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/collections/operations/local/update.ts#L218-L283));
- the conflict check compares only user ID, so two tabs or devices belonging to
  the same user can both mutate
  ([source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/utilities/checkDocumentLockStatus.ts#L77-L96));
- after the check, the mutation path deletes every matching lock regardless of
  whether locking was overridden
  ([source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/utilities/checkDocumentLockStatus.ts#L99-L105));
- Admin lock acquisition is a find-then-delete-expired-then-create sequence
  ([source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/ui/src/utilities/handleFormStateLocking.ts#L59-L147));
- the internal lock collection indexes the document relation but declares no
  unique document constraint and uses generic authenticated access
  ([source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/locked-documents/config.ts#L32-L74)).

Two simultaneous acquisitions can therefore both observe no active lock and
create records. A same-user second tab is not a second editor to Payload. A
server-side call can bypass the lock unintentionally. The internal lock record
also is not an appropriate tenant-facing presence record.

**Permanent prevention:** use one compact Core-owned lease record per exact
tenant/source resource, keyed uniquely and owned by an unguessable editor
session rather than only a user. Acquire, renew, take over, and expire it with
atomic conditional writes. Recheck current tenant, actor permission, lease
generation, and source revision on every mutation. Payload locking may remain
as supplementary Admin UI coordination, but it must not be the integrity
backstop.

### 3. Autosave coalescing is useful but is not CAS

**Concern: yes — high severity, medium likelihood in ordinary operation.**

Payload's Admin UI debounces form state and marks requests as `autosave=true`
and `draft=true`
([source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/ui/src/elements/Autosave/index.tsx#L67-L162)).
Its queue processes network work sequentially and retains only the latest
queued task rather than building an unbounded backlog
([source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/ui/src/hooks/useQueue.ts#L22-L83)).

On the server, if the newest version is already an autosave, `saveVersion`
updates it instead of creating another row
([source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/versions/saveVersion.ts#L72-L110)).
That rolling-slot behavior is appropriate for recovery and avoids a permanent
row per pause in typing.

However, `updateLatestVersion` reads the latest row and then updates that row by
ID without an expected revision predicate
([source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/versions/updateLatestVersion.ts#L34-L94)).
Its recovery branch handles a thrown update by accepting a newer row, but it
does not stop two normally successful concurrent writes from becoming
last-writer-wins
([source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/versions/updateLatestVersion.ts#L95-L138)).

The Admin editor also explicitly disables first-edit stale-data detection when
autosave is enabled, to avoid confusing the editor with their own saves
([source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/ui/src/views/Edit/index.tsx#L469-L545)).
The provider UI therefore cannot detect the D12 lost-update cases by itself.

**Permanent prevention:** each request carries the exact acknowledged source
revision, editor-session lease generation, and monotonically increasing client
save sequence/idempotency key. The server accepts the write only if all still
match in one transaction and returns a new immutable save receipt. A stale
request receives a typed conflict; it never silently overwrites. Keep at most
one request in flight per editor, coalesce later local changes, and reconcile an
ambiguous/lost acknowledgement against the idempotency key before retrying.

### 4. Save acknowledgement and navigation are separate facts

**Concern: yes — medium severity, medium likelihood on unreliable networks.**

The exact Admin autosave indicator begins before the request and is hidden only
after a successful submission path; queue exceptions are logged to the browser
console by `useQueue`
([autosave source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/ui/src/elements/Autosave/index.tsx#L80-L186),
[queue source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/ui/src/hooks/useQueue.ts#L62-L78)).
A committed response lost in transit and a rejected write can look similar from
the browser. A spinner ending is not proof of durability.

**Permanent prevention:** the status vocabulary is server-evidence-based:

- **Saving…** — a request is in flight;
- **Saved at _time_** — the server returned the exact accepted revision receipt;
- **Not saved — reconnecting** — no accepted receipt is known, with local work
  preserved in the active tab;
- **Your copy is no longer current** — CAS or lease failed, with non-destructive
  copy/download/review actions.

Publish, Preview of the saved draft, route navigation, session logout, and
takeover must first drain or explicitly resolve the pending save. Browser-only
content is never called saved, and D12 does not claim full offline-first editing.

### 5. Restore must be a product-owned, draft-only operation

**Concern: yes — critical severity, medium likelihood once History is exposed.**

The exact collection restore operation defaults `draft` to `false`, copies the
historical status, updates the live collection when not restoring as draft, and
then saves a new version
([source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/collections/operations/restoreVersion.ts#L41-L57),
[write source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/collections/operations/restoreVersion.ts#L257-L299)).
It uses update access when access is enabled, but does not enforce the active
document lock. It correctly rejects restoring a version while the document is
trashed and runs hooks inside the operation transaction
([source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/collections/operations/restoreVersion.ts#L98-L144),
[transaction source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/collections/operations/restoreVersion.ts#L339-L393)).

REST can pass `draft=true`
([source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/collections/endpoints/restoreVersion.ts#L10-L22)).
The Local API is more hazardous: it defaults `overrideAccess` to `true` and,
although its type accepts the draft flag, does not destructure or forward it
([source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/collections/operations/local/restoreVersion.ts#L74-L113)).
The same omission is still present in the reviewed
[current upstream snapshot](https://github.com/payloadcms/payload/blob/134c89b7955d0dcde9137643ab86873ff542dbd4/packages/payload/src/collections/operations/local/restoreVersion.ts#L76-L110).

**Permanent prevention:** do not expose raw Payload restore. **Restore as new
draft** must:

1. authorize the current tenant, actor, history read, and update capability;
2. load and verify the exact source version within the same tenant;
3. revalidate/migrate it against the current semantic schema and D11 profile;
4. acquire or prove the active editor lease and expected current revision;
5. create a new private non-autosave checkpoint without altering immutable
   history or public state; and
6. return the new draft receipt for Preview and later D1 release.

An incompatible historical version is a visible cause-owned exception, not a
partial restore. No restore action may publish, unpublish, move a Page, or
change Navigation automatically.

### 6. Provider version retention is not semantic retention

**Concern: yes — high severity for recovery/audit claims, medium likelihood over
time.**

Payload defaults collection `maxPerDoc` to 100
([source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/collections/config/sanitize.ts#L253-L273));
official [Versions documentation](https://payloadcms.com/docs/versions/overview)
also documents 100 and `0` for unlimited retention. Core leaves this unset.

When a new version is created, enforcement finds the row at `max + 1` sorted by
`updatedAt` and deletes every version at or before that timestamp
([source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/versions/enforceMaxVersions.ts#L15-L82)).
It does not know which rows are legally, operationally, or editorially
meaningful. Cleanup errors are logged but do not fail the originating save at
lines 83-88.

**Permanent prevention:** explicitly define bounded recovery/checkpoint
retention and its user-facing promise. Keep the one rolling autosave separate
from deliberate checkpoints. Do not treat Payload versions as D1 public release
history, legal audit, or indefinite backup; those source-owned immutable facts
remain in their owning contracts. If D12 checkpoints need protection from
pruning, preserve them by semantic class or archive them before provider
cleanup—do not simply set unlimited retention without capacity evidence.

### 7. Hooks and transactions need cause classification

**Concern: yes — medium severity, high likelihood without a guardrail.**

Payload starts a transaction for the update operation and commits or rolls back
the request as a unit
([source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/collections/operations/updateByID.ts#L58-L78),
[commit source](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/collections/operations/updateByID.ts#L246-L269)).
Official [transaction documentation](https://payloadcms.com/docs/database/transactions)
requires nested Local API work to receive the same `req` to join that
transaction, and warns against unawaited work sharing a transaction.

Autosave still runs validation transforms and after-change hooks. A generic
hook can therefore send duplicate notifications, enqueue excessive rebuilds,
or write audit noise for recovery saves.

**Permanent prevention:** carry a code-owned editorial cause through
`req.context`—for example autosave, checkpoint, restore-to-draft, takeover, or
D1 release. Recovery autosave may update the private working projection and
aggregated telemetry only. Expensive publication, search, notification, and
integration effects remain release-owned. Meaningful actions receive durable
audit records in the same transaction or a transactionally written outbox;
per-pause autosaves receive metrics, not a permanent audit row.

## Adversarial scenario matrix

| Scenario                                         | What fails without hardening                             | Required permanent behavior                                                                               |
| ------------------------------------------------ | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Two staff open one Page                          | Last accepted autosave can overwrite the rolling version | One session lease plus expected-revision CAS; second editor is read-only                                  |
| Same user opens two tabs                         | Payload sees one user and allows both                    | Distinct editor-session IDs; stale tab is rejected, never merged silently                                 |
| Lease heartbeat arrives after takeover           | Old editor can appear active again                       | Lease generation/fencing token; old generation cannot renew or save                                       |
| Autosave commits but response is lost            | Blind retry or false **Not saved** state                 | Reconcile by idempotency key/save sequence before retrying                                                |
| User types during a slow save                    | Unbounded queue or old response overwrites new state     | One in flight; retain/coalesce the newest local candidate; monotonic receipts                             |
| Publish is clicked during autosave               | Release can bind an older or mutable latest draft        | Drain save and publish the exact acknowledged revision through D1                                         |
| Permission or Phase 10 eligibility is revoked    | An old lock/session can continue writing                 | Recheck tenant and current authorization on every save, takeover, restore, and release                    |
| Local API helper omits safety flags              | Access and locks are bypassed by default                 | One reviewed adapter that always passes `req`, user, `overrideAccess:false`, and qualified lock handling  |
| Historical version lacks tenant                  | Version access can become ambiguous                      | Fail closed and quarantine; never infer tenant from current browser context                               |
| Restore a published historical version           | Raw restore can immediately change live content          | Restore only as a new private draft; public state unchanged                                               |
| Restore an old schema                            | Invalid/unknown blocks can partially reappear            | Current-schema validation/migration or a visible blocked exception                                        |
| 101st meaningful version                         | Provider pruning may remove an important checkpoint      | Explicit bounded semantic retention; D1 release facts stored independently                                |
| Hook receives frequent autosaves                 | Notification, revalidation, and audit storms             | Cause-aware hooks; autosave side-effect-dark; aggregated observability                                    |
| Database commit succeeds but hook response fails | Browser may not know whether data persisted              | Durable receipt/idempotency reconciliation; no blind retry                                                |
| Editor closes tab offline                        | Work after last accepted receipt is lost                 | Warn while unresolved; preserve copy in-tab; promise recovery only through last acknowledged server draft |

## Minimum D12 implementation guardrails

These guardrails implement B-prime without turning D12 into a collaboration
platform:

1. **One exact working resource.** Identify the tenant, Site, source family,
   document, locale/source scope, and working-revision lineage explicitly.
2. **One active editor lease.** A small unique lease row, session ownership,
   short expiry, heartbeat, generation/fencing token, permissioned takeover,
   and automatic expiry. No row per keystroke.
3. **One authoritative revision token.** Every save, checkpoint, restore, and
   release is conditional on the exact acknowledged revision and lease
   generation.
4. **One coalesced recovery slot.** Debounced autosave updates the private
   working candidate; it does not create permanent history on every pause.
5. **One request in flight.** Coalesce subsequent edits; reconcile lost
   acknowledgements; do not apply responses out of order.
6. **Meaningful checkpoints only.** **Save checkpoint** first drains autosave,
   then creates a non-autosave immutable source version with actor and cause.
7. **Draft-only restore.** Restore creates a new private checkpoint from an
   authorized historical source under the current schema. It never publishes.
8. **Exact release binding.** D1 releases the exact server-acknowledged source
   revision after final permission and policy reproof. “Latest draft” is not a
   release target.
9. **Explicit provider adapter.** Centralize user-derived Payload calls so
   access, lock, tenant, transaction, cause, and idempotency options cannot be
   accidentally omitted.
10. **Quiet status UI.** One persistent `role="status"` region announces only
    meaningful transitions. Blocking conflicts/takeovers are persistent and
    keyboard operable; autosave success is not a toast.

Explicit non-goals: CRDT/OT, live cursors, automatic semantic-array merge,
multiple editing branches, offline-first synchronization, tenant-configurable
autosave timing matrices, permanent per-keystroke versions, and treating a
Payload lock as publication authority.

## Proof gates before shipping

### Tenant and permission safety

- Prove cross-tenant denial for version list, count, by-ID, comparison, diff,
  restore, and any custom history endpoint.
- Prove `version.tenant` scoping, including missing/malformed historical tenant
  values and super-admin behavior.
- Prove every user-derived Local API path sets `overrideAccess: false` and
  cannot silently override the lease.
- Revoke role/tenant/Phase 10 eligibility during editing and prove the next
  write, takeover, restore, preview, and release fail closed.

### Concurrency and recovery

- Race first acquisition from two users and from two sessions of one user;
  exactly one lease generation wins.
- Race heartbeat, expiry, takeover, autosave, checkpoint, restore, and release;
  stale generations and stale revision tokens never write.
- Simulate slow responses, response reordering, duplicate requests, timeout
  after commit, reconnect, browser refresh, logout, and server restart.
- Prove a lost acknowledgement is reconciled by idempotency key and never
  creates duplicate meaningful versions.
- Prove pending local work remains copyable when conflict or authorization
  prevents saving.

### Version and release integrity

- Prove repeated autosaves coalesce while manual checkpoints remain immutable.
- Prove published content is unchanged by autosave, checkpoint, failed save,
  conflict, takeover, and restore-to-draft.
- Prove D1 releases the reviewed acknowledged revision, not whatever draft is
  latest later.
- Prove retention preserves the documented recovery window and cannot prune D1
  public generations or owning-phase audit facts.
- Restore current, old-schema, partial, trashed, and cross-tenant versions; only
  a valid new private draft may result.

### UX, accessibility, and operations

- Keyboard and screen-reader tests cover **Saving…**, **Saved**, save failure,
  read-only entry, takeover, conflict, session expiry, and restore confirmation.
- Status changes use a polite live region without focus theft; blocking
  conflicts remain visible and operable.
- Measure save rate, payload size, p95 latency, CAS rejection, lease takeover,
  lost-ack reconciliation, queue depth, version growth, pruning failures, and
  hook fan-out by tenant and source family without logging content.
- Confirm autosaves do not trigger publication, external notifications, search
  indexing, public cache invalidation, or one durable audit row per pause.

## Primary sources

- Payload:
  [Versions](https://payloadcms.com/docs/versions/overview),
  [Drafts](https://payloadcms.com/docs/versions/drafts),
  [Autosave](https://payloadcms.com/docs/versions/autosave),
  [Document locking](https://payloadcms.com/docs/admin/locked-documents),
  [Local API](https://payloadcms.com/docs/local-api/overview),
  [Local API access control](https://payloadcms.com/docs/local-api/access-control),
  [Transactions](https://payloadcms.com/docs/database/transactions), and
  [Hook context](https://payloadcms.com/docs/hooks/context).
- Exact Core runtime source:
  [Payload commit `1f9ae9a`](https://github.com/payloadcms/payload/commit/1f9ae9ab37bd7a69894762c833fad3e65124c314).
- Current upstream comparison snapshot:
  [Payload commit `134c89b`](https://github.com/payloadcms/payload/commit/134c89b7955d0dcde9137643ab86873ff542dbd4).
