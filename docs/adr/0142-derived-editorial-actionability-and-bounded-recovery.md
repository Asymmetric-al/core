# ADR-0142: Derived editorial actionability and bounded recovery

**Status:** Accepted (founder-ratified Phase 22 D25 C-prime-R, 2026-08-14)

## Context

Public Page work may remain unreleased for months while its Page head, media,
subject, assignment, authorization, safety ceiling, catalog, route, or public
release changes. Keeping every old draft perpetually actionable confuses stored
content with current authority; fixed expiry can destroy missionary work and
hide organizational delay. A second lifecycle table, archive workflow,
actor-specific draft branch, or timer matrix would duplicate D1/D4/D5/D22/D24
and place recurring operational load on Postgres.

Payload supplies private content and version storage, but its autosave,
`_status`, restore, locks, native publish, and maximum-version behavior do not
prove Asym's exact current scope, action authority, evidence purpose, or public
release. The current 300 ms prototype autosave also creates avoidable write and
logging pressure against the shared Postgres substrate.

## Decision

Adopt the exact founder-ratified Phase 22 D25 C-prime-R formulation:

> **C-prime-amended-and-hardened (C-prime-R) — cause-gated,
> action-specific editorial recovery over existing Phase 22 truth, with one
> bounded recovery buffer and no D25 database state machine:** Phase 22 D25
> governs unreleased D1 Public Page working content and D4/D5 Page Release
> Candidates only. Age is display-only context and never approves, publishes,
> rejects, withdraws, expires, archives, deletes, creates a task or notification,
> changes public reach, or establishes retention authority. For every read and
> deliberate command, one finite server-side resolver derives only the actions
> the current Principal may perform from the exact current Tenant, Legal Entity,
> environment, Site, Page Family, Page, locale, D1 working head, immutable
> candidate, D2 release and reach facts, D3/D20 catalog and renderer generations,
> D9 media eligibility, D17 subject and Phase 9/D19 association lifecycle, Phase 10 ceiling, Phase 12
> authorization epoch, and each other already-required owner generation; the
> owning command re-proves those facts at commit. A failed proof removes only the
> actions that require it and never becomes one mutable candidate-level status.
>
> **D25 adds no authoritative actionability, stale, archive, expiry, retention,
> health, recovery, or resolution table or column; no per-autosave event, audit
> row, outbox row, content body, full diff, cross-schema foreign key, trigger,
> polling scan, duplicate task, or materialized D25 projection in operational
> Postgres.** It reuses D1/D2/D4/D5/D24's existing heads, opaque content-version
> references, digests, immutable candidates, actor provenance, decisions,
> withdrawals, releases, idempotency evidence, and owner generations. D22 may
> present a disposable, permission-filtered action result and owner cause, but
> neither that result nor elapsed time owns or closes work.
>
> **Payload remains the private editorial content/version store.** The
> production-certified Payload adapter coalesces autosave into one bounded,
> non-semantic recovery buffer for the exact Page and locale beneath the
> expected coherent working head and current editor lease; it creates no durable
> per-actor branch, advances no semantic head, freezes no candidate, emits no
> notification, and records no per-keystroke operational history. A stale or
> losing browser session may preserve only an ephemeral in-memory recovery copy
> and cannot overwrite or create another product head. Only unreferenced scratch
> may be compacted. Deliberate D1 revisions and the exact content sources
> referenced by candidates, decisions, withdrawals, and releases are protected
> by their existing reference closure outside scratch-pruning behavior. The
> launch save cadence is a code-owned trailing two-second dirty-aware debounce
> with a 15-second maximum wait, explicit **Save draft**,
> safe-navigation/editor-handoff flush, digest no-op suppression, one in-flight
> write per exact generation, and late-write fencing; it is not a tenant knob.
> Payload defaults, `maxPerDoc`, `_status`, locks, autosave, restore, trash,
> native publish, and the current 300 ms prototype interval are not product or
> retention authority. Blind native version pruning is disabled for these Page
> collections, and D24's bounded reconciler alone may reclaim
> reference-proved scratch or inert prepares. Cross-store prepare and cleanup
> use one command identity, bounded
> quarantine, authoritative reference recheck, and orphan reconciliation so
> cleanup cannot race a candidate or revision commit; missing proof preserves
> the item and opens a private operational exception rather than guessing.
>
> **A submitted Page candidate remains immutable and visible in D22's `To
review` view to currently authorized staff until an existing D4/D5 review
> outcome or explicit withdrawal.** Age never hides organizational
> responsibility. A real owner-domain change may prevent approval or release
> while still allowing independently authorized actions such as **View
> submission**, **Request changes**, terminal rejection, explicit withdrawal, or
> D24 **Edit page**; unavailable actions are omitted or replaced by a
> permission-safe owner explanation, not shown as misleading disabled controls.
> A prospective Review & Release Profile change never converts an old backlog
> into automatic publication.
>
> **Recovery is append-only, same-scope, and separate from submission.**
> **Review saved changes** or **Use as starting point** creates one newly
> attributed D1 successor from the exact current working head while separately
> referencing the preserved same-Page, same-locale, same-family, same-subject
> content source. It revalidates every current D3/D20 semantic target, D9 media
> reference, D17 subject and Phase 9/D19 association lifecycle fact, Phase 10 safety result, and
> Phase 12 authorization; removed, incompatible, or unsafe material is not
> silently copied. The contributor then uses the unchanged D4 action **Submit for
> review** or **Publish changes**. Recovery never mutates a candidate, rewinds a
> head, invokes Payload restore, performs an automatic or last-write-wins merge,
> submits, publishes, or resurrects a prior authorization. A different Page,
> locale, family, or post-release subject is outside D25 reuse and must follow
> its ordinary owner-authorized Page and D8 succession contracts.
>
> **Withdrawal reuses D1/D4/D5's existing explicit, immutable occurrence.** It
> removes the candidate from actionable review, changes no live release, and
> preserves only the permission-filtered evidence required by its applicable
> purpose. “Recoverable” grants no current or former actor access and does not
> mean retained forever.
>
> **Retention behavior is derived from existing references, not stored as
> another workflow:** coalescible recovery scratch; current working or submitted
> editorial content; and content referenced by immutable candidate, decision,
> withdrawal, or release evidence. Phase 22 defines those semantic distinctions
> and protection requirements but invents no universal schedule, legal hold, or
> erasure authority. Payload executes editorial-byte storage and compaction
> under the applicable tenant-visible records/privacy policy; D9 and Phase 29
> retain public-media meaning and byte-lifecycle ownership; D2 retains release
> authority. Owner-authorized erasure first preserves referential integrity
> through the minimum permitted non-content tombstone or digest and, when
> current public output is affected, invokes the existing Phase 10/D2/D8/D18
> containment or successor path. Age, a Payload cap, a cleanup job, storage
> movement, task closure, or actor revocation never proves erasure eligibility.
>
> **The ordinary experience stays quiet.** Healthy editors see only **Saved
> privately** and a subtle last-saved time. If preserved work can no longer
> proceed unchanged, Asym says: **“Your earlier changes are saved, but this page
> has changed since then. Review them against the current page before submitting
> again.”** A currently authorized editor receives **Review saved changes** and,
> where D10 permits it, **View saved version**. Staff see the exact current
> visitor consequence, the source-owned blocker, and one literal authorized
> action. The UI does not use **Expired**, **Archived**, branch/merge language,
> technical version numbers, destructive **Restore**, success walls,
> age-created alarms, or per-autosave announcements.
>
> **Dependency failure is inert and recoverable.** If Payload, an owner proof,
> or the disposable resolver is unavailable or contradictory, the last safe
> public release remains independently governed, unreleased work remains
> private, no action is reported successful, and Asym says it cannot currently
> confirm the action. Idempotent authoritative readback and inspect-before-retry
> determine whether a deliberate revision, withdrawal, candidate, or successor
> committed. Tenant-safe aggregate telemetry may measure autosave write rate,
> recovery-buffer counts, orphan age, reference-integrity failures, cleanup
> outcomes, resolver denial causes, and latency without raw prose, media, diffs,
> public identifiers, per-keystroke events, or cross-tenant cardinality.
>
> **No per-actor durable draft, parallel branch, D25 status machine, generic
> stale cause, tenant expiry matrix, age-based task or reminder, per-autosave
> version/audit stream, full-content operational copy, raw Payload-table join,
> native restore/delete authority, whole-history scan, automatic cross-scope
> copy, silent field or media resurrection, former-contributor access, duplicate
> D22 issue, Phase-29 editorial-text takeover, Phase-40 dependency, blind retry,
> destructive rollback, or claim that saved, recoverable, current, actionable,
> reviewable, approved, released, public, retained, erased, or externally
> forgotten are the same fact is permitted.**

Binding interpretation: the **Editorial Actionability Evaluation** is a
non-authoritative read result, not a stored status. Every owning command performs
its own current proof and may permit or deny actions independently. The
**Public Page Recovery Buffer** is one private mutable CMS recovery object beneath
the sole D1 Page-and-locale head; it is never a Page Revision, candidate,
evidence occurrence, per-actor branch, or retention class.

A deliberate Page Revision or candidate may reference only an immutable,
non-autosave Payload semantic version and digest. D24's reconciler, rather than
Payload's blind cap or a new D25 job, owns bounded reference-safe scratch and
orphan cleanup. D22 displays an age only as context and does not create a cause,
task, notification, or **Needs attention** item from time alone.

## Consequences

### Positive

- Missionaries, teammates, and staff keep meaningful private work without
  turning stored bytes or elapsed time into current authority.
- Healthy editing stays quiet, while real conflicts produce one clear action and
  preserve the current safe public release.
- Operational Postgres receives no D25 lifecycle table, copied content, expiry
  scan, per-autosave audit/outbox stream, or actor-specific draft branch.
- Immutable semantic versions, exact references, generation fencing,
  idempotency, and fail-closed cleanup keep lineage reconstructable.

### Costs and constraints

- The Payload adapter must be certified against the exact installed internal
  prerelease for autosave, locks, access, semantic sealing, native-cap behavior,
  and upgrades.
- The two-second/15-second save contract, no-op suppression, one in-flight write,
  and generation fencing require production-shaped database load proof.
- Every preserved-content view and reuse must re-prove current exact scope,
  Phase 10-safe rendering, and Phase 12 authority.
- Purpose-owned retention, export, hold, erasure, and tombstone behavior remain
  separate from editorial actionability and must be integrated without a
  universal Page timer.

## Rejected alternatives

### Keep every old item actionable indefinitely

Rejected because retention does not prove current authority, safety, scope, or
release eligibility and would make old organizational work indistinguishable
from healthy current work.

### Fixed or tenant-configurable expiry and deletion

Rejected because age does not prove invalidity, one timer cannot fit scratch,
working, candidate, decision, and release purposes, and staff delay must not
destroy missionary work or hide responsibility.

### Persisted stale/actionable/archive state or a D25 workflow engine

Rejected because it duplicates D1/D4/D5/D22/D24, creates drift and maintenance,
and turns a derived answer into parallel truth.

### Per-actor durable drafts, branches, CRDTs, or automatic merging

Rejected because D1 owns one coherent Page-and-locale head and the product needs
bounded handoff and recovery, not a general collaboration platform.

### Payload native restore, status, publish, or version cap as authority

Rejected because provider behavior does not prove Asym's current actor, scope,
safety, evidence purpose, review, release, or retention contract.

Ratification of this planning decision authorizes no implementation, migration,
retention execution, deletion, notification, issue publication, or production
activation.

## References

- [Phase 22 ratified D25 decision](../prds/sitestacker-parity/phase-22-public-ministry-pages-decision-log.md#d25--what-happens-to-abandoned-old-withdrawn-or-no-longer-current-public-page-drafts-and-submitted-candidates)
- [Phase 22 ratified D25 research evidence](../prds/sitestacker-parity/phase-22-public-ministry-pages-research-evidence.md#48-ratified-d25-research--cause-gated-actionability-with-bounded-recoverable-editorial-work)
- [ADR-0118 — Typed Public Ministry Pages and explicit contributor assignments](./0118-typed-public-ministry-pages-and-explicit-contributor-assignments.md)
- [ADR-0121 — Tenant-chosen Public Content review and release profiles](./0121-tenant-chosen-public-content-review-and-release-profiles.md)
- [ADR-0122 — Simple Public Page review with quiet Phase-10 eligibility](./0122-simple-public-page-review-with-quiet-phase-10-eligibility.md)
- [ADR-0139 — Derived Public Page operations with cause-owned actions](./0139-derived-public-page-operations-with-cause-owned-actions.md)
- [ADR-0141 — Attribution-preserving Staff-authored Page Revisions](./0141-attribution-preserving-staff-authored-page-revisions.md)
