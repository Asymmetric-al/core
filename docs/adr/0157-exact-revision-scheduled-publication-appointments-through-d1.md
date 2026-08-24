# ADR-0157: Exact-revision Scheduled Publication Appointments through D1

**Status:** Accepted (founder-ratified Phase 23 D13 C-prime-R, 2026-08-22)

## Context

ADR-0145 makes one immutable Public Site Generation and one small serving-head
CAS the sole ordinary public authority for one exact Tenant × environment × Site
× BCP-47 locale. ADR-0154 reserves complete-cohort Site Presentation activation
to D10. ADR-0156 makes private saving server-acknowledged and requires a release
action to select one exact immutable reviewed revision while later autosaves
remain private.

Phase 23 still needs scheduled publish and scheduled unpublish. A date field,
mutable `latest` lookup, Payload scheduling job, or delayed-provider status does
not establish exact intent, current authorization, tenant safety, idempotency,
or D1 publication. Operating Payload Jobs beside Inngest would also create two
schedulers with competing retries and recovery. The smallest coherent design is
therefore a product-owned immutable appointment executed by the existing shared
durable-work boundary through D1.

## Decision

> **C-prime-amended-and-hardened (C-prime-R) — exact-revision, product-owned Scheduled Publication Appointments executed exclusively through D1:** authorized staff may create a one-time `publish` or `unpublish` appointment for one exact Tenant × environment × Site × BCP-47 locale × typed Page, with at most one unresolved appointment of each action kind, no recurrence, and a mandatory publish-before-unpublish order when both exist. A publish appointment binds the exact server-acknowledged D12 revision and every directly reviewed immutable semantic dependency; an unpublish appointment binds stable Page identity and the exact route, Navigation, redirect/lifecycle, designation, giving, and visitor consequence. Both bind completed review and organization-owned authorization with initiator attribution, responsible ownership, civil date/time, IANA timezone, chosen offset, resolved UTC not-before instant, timezone-data generation, schema version, appointment generation, and immutable idempotency fingerprint. Later autosaves, mutable `latest`, provider state, cache state, and unrelated Site releases never alter scheduled intent; Change and Replace create attributable immutable successors rather than rewriting history.
>
> Core’s product records, D1 generation, and execution receipt remain authoritative. Far-future appointments remain in Core; within a six-day handoff horizon the shared dispatch ledger sends one identifier-only future-`ts` event through the existing shared Inngest runtime. Inngest supplies delayed delivery, bounded transient retry, and load control only—never publication truth. One due function invokes the same idempotent D1 release command as Publish now in one durable step. Product claims, appointment-generation fencing, D1’s expected-head CAS, and receipt lookup provide correctness across duplicate delivery, cancellation, rescheduling, crashes, and lost acknowledgements. Stale delayed events safely no-op, while one platform-wide overdue reconciliation path supplies bounded-staleness recovery without tenant cron jobs or minute polling.
>
> At execution, D1 re-proves current appointment validity and explicit invalidation, Tenant/Site/locale scope, Phase 10 safety, route and reference integrity, current compatible renderer and presentation generations, and every pinned semantic source; prepares a content-addressed successor from the then-current D1 generation while preserving unrelated public content; and atomically activates it with the immutable execution receipt and deduplicated downstream-convergence intent. Unrelated concurrent publication permits bounded reprepare only while scheduled meaning and every semantic pin remain unchanged. Exact already-satisfied intent records a no-op receipt; materially changed, incompatible, unauthorized, or newer/different target content becomes one cause-owned Needs attention exception and never silently rebases or downgrades. Cache, CDN, sitemap, search, and crawler convergence remain separate observable facts.
>
> Publish now remains primary and Schedule… secondary. One accessible dialog shows action, exact scheduled revision, Site/path/locale, Site timezone and viewer conversion, later-edits exclusion, preview, and literal public consequence. Healthy Pages show one quiet scheduled sentence with Preview, Change, and Cancel; later drafts clearly say they are not included. Same-target manual publication requires an explicit keep-or-cancel decision. The centralized Publishing schedule contains only Upcoming, Needs attention, and History. Routine initiator offboarding does not silently erase an organization-owned completed authorization, while explicit security, governance, safety, appointment, Site, locale, or source invalidation blocks execution.
>
> D13 includes no Payload scheduling authority, Payload Jobs runner, long-lived sleeping run as truth, recurring schedule, arbitrary condition builder, release graph, partial D10 presentation activation, tenant retry configuration, auto-revert, force path, public-request execution, destructive rollback, or claim that scheduled, prepared, activated, cached, indexed, visible, and source-authoritative are the same fact. Phase 10 adverse withdrawal remains immediate, and D10 remains the sole complete-cohort Site Presentation activation.

## Consequences

- Scheduling selects exact reviewed intent rather than mutable `latest`; later
  D12 autosaves remain private and visibly excluded.
- The appointment is an organization-owned, attributable authorization. Routine
  initiator offboarding does not erase it, but current explicit security,
  governance, safety, Site, locale, source, or appointment invalidation blocks
  execution.
- One Page and locale may have one unresolved publish and one unresolved
  unpublish, ordered as a single optional public window. D13 does not create
  recurrence or a general automation engine.
- Change, Replace, Cancel, and reschedule create immutable attributable lifecycle
  records. A stale already-dispatched event is harmless because appointment
  generation and receipt are rechecked.
- Inngest is the only delayed executor. Product records, claims, D1 CAS, and
  receipts remain authoritative and permit provider-independent recovery.
- Far-future product storage plus a bounded future-event horizon avoids one
  sleeping run per appointment, tenant cron jobs, and minute polling. One shared
  low-frequency overdue reconciler is the bounded-staleness backstop.
- Publish now and scheduled execution use one D1 release command. A due
  appointment prepares from the current generation, preserving unrelated public
  work while refusing a material semantic rebase or silent downgrade.
- Scheduling remains a quiet Page action. Ordinary staff see revision, scope,
  time, consequence, and cause-owned resolution—not provider or database
  vocabulary.
- D1 activation and cache, CDN, sitemap, search, crawler, and visitor convergence
  remain separate observable facts.

## Rejected alternatives

- mutable schedule fields, `latest`-at-execution selection, Payload `_status`,
  Payload Jobs, provider run state, or provider event deduplication as truth;
- two schedulers, tenant-specific cron, per-minute polling, public-request
  execution, or one long sleeping run per distant appointment;
- multiple unresolved schedules of the same action kind, recurring rules,
  release graphs, conditional automation, tenant retry matrices, auto-revert,
  and force execution;
- silent reschedule, in-place target mutation, last-write-wins, blind retry,
  sequence/time inference, material automatic rebase, and destructive rollback;
- entire-Site or entire-locale head pinning for an ordinary Page appointment,
  partial D10 presentation activation, or scheduled mutation of unrelated
  drafts; and
- claims that scheduled, prepared, activated, cached, indexed, visible, and
  source-authoritative are one fact.

## Implementation proof gates

Implementation remains unauthorized by this ADR. A future authorized change
must prove at minimum:

- immutable appointment/successor records, exact publish revision and semantic
  dependency pins, stable unpublish identity and consequences, resolved-action
  uniqueness, publish-before-unpublish order, and immutable receipts;
- exact Tenant/environment/Site/locale/Page composite integrity, private
  authority relations, RLS and grants, current authorization and invalidation,
  identifier-only events, and forged cross-scope denial;
- civil time, IANA timezone, selected offset, resolved UTC, timezone-data
  generation, nonexistent and repeated daylight-saving time handling, database
  clock use, and no-before execution;
- horizon dispatch, existing-ledger handoff recovery, stale-event no-op,
  generation-fenced work claims, duplicate delivery beyond provider
  deduplication, transient retry, lost-acknowledgement receipt lookup, provider
  outage, and bounded overdue reconciliation;
- one shared D1 command for immediate and scheduled publication, exact
  expected-head CAS, current-head preparation, preservation of unrelated work,
  already-satisfied no-op, bounded compatible reprepare, and semantic-conflict
  refusal;
- races among execute, cancel, reschedule, replace, manual publish, Page trash,
  route change, locale/Site disablement, permission or source invalidation,
  initiator offboarding, and Phase 10 adverse containment;
- clear Page-first scheduling, exact-revision preview, later-draft warning,
  literal publish/unpublish consequence, conflict choices, cause-owned Needs
  attention, and quiet Upcoming/History states;
- keyboard, screen-reader, focus, reflow, mobile, localization, RTL/CJK, and
  time-zone accessibility; and
- account-wide Inngest execution budgeting, quota alerts, measured burst and
  backlog behavior, N/N+1 event/schema compatibility, rollback, retained-worker
  compatibility, and separately recoverable public-delivery convergence.

Ratification of this planning decision authorizes no implementation, schema,
migration, provider adoption, issue publication, deployment, release
activation, or production change.

## References

- [Phase 23 D13 decision brief and adversarial evidence](../prds/sitestacker-parity/phase-23-d13-scheduled-publication-operations-decision-brief.md)
- [Phase 23 D13 Inngest scheduling and cost research](../prds/sitestacker-parity/research/phase-23-d13-inngest-scheduling-cost-research.md)
- [ADR-0145 — Page-local composition, bounded reuse, and coherent Public Site Generations](./0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [ADR-0154 — Complete-cohort Site Presentation Activation through D1](./0154-complete-cohort-site-presentation-activation-through-d1.md)
- [ADR-0156 — Bounded Editorial Working Revisions and recoverable active editor](./0156-bounded-editorial-working-revisions-and-recoverable-active-editor.md)
- [Workflow orchestration specification](../../openspec/specs/workflow-orchestration/spec.md)
- [Phase 22 specification PR #1323](https://github.com/Asymmetric-al/core/pull/1323)
