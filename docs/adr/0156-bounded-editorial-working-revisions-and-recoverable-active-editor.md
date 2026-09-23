# ADR-0156: Bounded Editorial Working Revisions and recoverable active editor

**Status:** Accepted (founder-ratified Phase 23 D12 B-prime-R, 2026-08-22)

## Context

Phase 23 already separates private source revisions from D1's immutable public
generations, gives Navigation and Reusable Sections distinct revision axes, and
keeps Payload/Lexical behind provider-neutral contracts. It did not yet define
what **Saved** means, how routine work is recovered, how two editing sessions
coordinate, what creates meaningful history, or how a restore affects public
truth.

The existing prototype offers useful Payload draft, version, autosave, and lock
primitives, but those provider defaults do not prove exact tenant/resource
scope, session-level lease ownership, fencing, stale-write prevention,
tenant-bounded version access, safe restore, or a public release boundary. The
ordinary product therefore needs a small behavioral contract that preserves
work and prevents concurrent corruption without adopting a real-time
collaboration platform.

## Decision

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

## Consequences

- Every admitted editable resource gets one private server-authoritative Working
  Revision, exact revision receipts, expected-revision CAS, and at most one
  current session-owned Active Editor Lease for its exact scope.
- Lease Generation is a monotonically changing fencing token required on every
  mutation. Lease coordination never replaces authorization, validation,
  idempotency, or CAS.
- Routine autosave is debounced, serialized, and coalesced. The UI says
  **Saved** only after exact server acknowledgement and never treats a browser
  queue or uncertain response as durability.
- A second session is read-only by default. Permissioned takeover checkpoints
  the prior draft and atomically transfers the lease under a new generation;
  displaced work remains available for truthful compare or copy.
- Working Revision is a shared behavior, not a fused document. Editorial,
  Placement, Navigation, Reusable Section, and other source-owned resources keep
  separate revision identities and commands.
- History is bounded and semantic. One rolling autosave supports ordinary
  recovery, while meaningful checkpoints remain immutable; restore creates a
  new private successor and never rewrites or publishes history.
- Payload may supply qualified persistence primitives, but its raw lock,
  version, access, and restore behavior is not product authority. A small
  content-free Core lease boundary is used if the exact adapter cannot prove the
  required uniqueness, session ownership, fencing, and authorization.
- D1 remains the sole ordinary public release authority. Saving, previewing,
  reviewing, compiling, releasing, serving, indexing, and notifying remain
  separate facts.

## Rejected alternatives

- explicit-save-only editing as the ordinary experience;
- true simultaneous CRDT/OT collaboration, live cursors, automatic semantic
  merge, multiple branches, or persistent offline-first queues at launch;
- provider locks or user IDs treated as authoritative lease/fencing scope;
- last-write-wins, blind retry, raw restore, destructive rollback, or mutable
  “latest draft” publication;
- one fused document or implicit cross-axis mutation;
- per-keystroke permanent versions and audit effects, autosave notifications,
  tenant timing matrices, or a second version engine; and
- claims that queued, saved, valid, previewed, reviewed, selected, compiled,
  released, serving, indexed, notified, or integrated are equivalent.

## Implementation proof gates

Implementation remains unauthorized by this ADR. A future authorized change
must prove at minimum:

- exact-resource lease uniqueness, session ownership, generation fencing,
  renewal, expiry, takeover, resume, and stale-writer denial under races;
- idempotent save receipts and lost-acknowledgement replay without duplicate
  versions or successor writes before outcome resolution;
- tenant/environment/Site/locale/resource-bounded authorization for drafts,
  versions, comparisons, lease identity, checkpoints, and restore;
- strict independence among Editorial, Placement, Navigation, Reusable Section,
  and other admitted revision axes;
- truthful network/auth/revocation/conflict recovery and restore-as-new-draft
  without changing the public generation;
- bounded autosave/version/audit/storage/load behavior with semantic retention
  and safe pruning;
- keyboard, focus, screen-reader status, reflow, mobile, RTL/CJK,
  localization, and reduced-motion behavior; and
- exact Payload build/access/restore/upgrade qualification, including
  N/N+1/rollback readers and either an adequate lock adapter or the small
  Core-owned lease boundary.

Ratification of this planning decision authorizes no implementation, schema,
migration, provider adoption, issue publication, deployment, release
activation, or production change.

## References

- [Phase 23 D12 decision log](../prds/sitestacker-parity/phase-23-web-studio-cms-decision-log.md#d12--bounded-editorial-working-revisions-and-recoverable-active-editor)
- [Phase 23 D12 decision brief and adversarial evidence](../prds/sitestacker-parity/phase-23-d12-draft-version-autosave-and-edit-conflict-decision-brief.md)
- [Phase 23 D12 Payload primary-source research](../prds/sitestacker-parity/phase-23-d12-payload-editorial-lifecycle-primary-source-research.md)
- [Phase 23 D12 Core repository audit](../prds/sitestacker-parity/phase-23-d12-core-repository-adversarial-audit.md)
- [Phase 23 D12 editorial recovery UX benchmark](../prds/sitestacker-parity/phase-23-d12-editorial-recovery-ux-benchmark.md)
- [ADR-0145 — Page-local composition, bounded reuse, and coherent Public Site Generations](./0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [ADR-0148 — Curated Navigation Revisions under coherent Site generations](./0148-curated-navigation-revisions-under-coherent-site-generations.md)
- [ADR-0152 — Family-qualified semantic Reusable Sections](./0152-family-qualified-semantic-reusable-sections.md)
- [Phase 22 specification PR #1323](https://github.com/Asymmetric-al/core/pull/1323)
