# Phase 23 D13 Scheduled Publication Operations — Decision Brief and Adversarial Evidence

- **Status:** Founder-ratified Phase 23 D13 C-prime-R
- **Date:** 2026-08-22
- **Authority:** Decision support only. This document does not authorize
  implementation, schema work, migration, provider adoption, issue publication,
  deployment, release activation, or production change.

## Decision seam

D1 makes an immutable Public Site Generation and one small serving-head CAS the
sole ordinary public authority for one exact Tenant × environment × Site ×
BCP-47 locale. D10 owns the exceptional complete-cohort presentation activation.
D12 makes **Saved** mean one exact server-acknowledged private revision and keeps
later autosaves private. Those decisions do not yet establish what a future
publish or unpublish instruction means, which revision it targets, what happens
when the target or its context changes, or how delayed execution is recovered.

The practical scenario is ordinary and consequential:

> A staff member schedules Page revision 42 to publish at 9:00 AM in the Site's
> timezone. Revision 43 is autosaved later, another Page is published before the
> appointment, and the delayed provider delivers the event twice. The product
> must publish exactly the authorized revision without reverting unrelated public
> work, explain the result clearly, and leave one durable outcome.

The D13 question is therefore:

> Should scheduling be a mutable field or provider job, or a product-owned exact-
> revision appointment that executes through D1's existing release authority?

## Executive verdict

The founder selected and ratified the latter. One immutable, tenant-bounded
Publication Appointment records the exact reviewed intent. Inngest wakes and
retries that intent but never owns schedule, authorization, publication, or
audit truth. At the due time, the same idempotent D1 release command used by
**Publish now** performs current reproof and the serving-head CAS.

The ordinary experience remains deliberately small: **Publish now** is primary,
**Schedule…** is secondary, the dialog states exactly what, where, and when, and
one quiet Page sentence exposes Preview, Change, and Cancel. A central schedule
shows only Upcoming, Needs attention, and History. The system permits one
unresolved publish and one unresolved unpublish per Page and locale, but no
recurrence or general automation builder.

## Exact founder-ratified formulation

> **C-prime-amended-and-hardened (C-prime-R) — exact-revision, product-owned Scheduled Publication Appointments executed exclusively through D1:** authorized staff may create a one-time `publish` or `unpublish` appointment for one exact Tenant × environment × Site × BCP-47 locale × typed Page, with at most one unresolved appointment of each action kind, no recurrence, and a mandatory publish-before-unpublish order when both exist. A publish appointment binds the exact server-acknowledged D12 revision and every directly reviewed immutable semantic dependency; an unpublish appointment binds stable Page identity and the exact route, Navigation, redirect/lifecycle, designation, giving, and visitor consequence. Both bind completed review and organization-owned authorization with initiator attribution, responsible ownership, civil date/time, IANA timezone, chosen offset, resolved UTC not-before instant, timezone-data generation, schema version, appointment generation, and immutable idempotency fingerprint. Later autosaves, mutable `latest`, provider state, cache state, and unrelated Site releases never alter scheduled intent; Change and Replace create attributable immutable successors rather than rewriting history.
>
> Core’s product records, D1 generation, and execution receipt remain authoritative. Far-future appointments remain in Core; within a six-day handoff horizon the shared dispatch ledger sends one identifier-only future-`ts` event through the existing shared Inngest runtime. Inngest supplies delayed delivery, bounded transient retry, and load control only—never publication truth. One due function invokes the same idempotent D1 release command as Publish now in one durable step. Product claims, appointment-generation fencing, D1’s expected-head CAS, and receipt lookup provide correctness across duplicate delivery, cancellation, rescheduling, crashes, and lost acknowledgements. Stale delayed events safely no-op, while one platform-wide overdue reconciliation path supplies bounded-staleness recovery without tenant cron jobs or minute polling.
>
> At execution, D1 re-proves current appointment validity and explicit invalidation, Tenant/Site/locale scope, Phase 10 safety, route and reference integrity, current compatible renderer and presentation generations, and every pinned semantic source; prepares a content-addressed successor from the then-current D1 generation while preserving unrelated public content; and atomically activates it with the immutable execution receipt and deduplicated downstream-convergence intent. Unrelated concurrent publication permits bounded reprepare only while scheduled meaning and every semantic pin remain unchanged. Exact already-satisfied intent records a no-op receipt; materially changed, incompatible, unauthorized, or newer/different target content becomes one cause-owned Needs attention exception and never silently rebases or downgrades. Cache, CDN, sitemap, search, and crawler convergence remain separate observable facts.
>
> Publish now remains primary and Schedule… secondary. One accessible dialog shows action, exact scheduled revision, Site/path/locale, Site timezone and viewer conversion, later-edits exclusion, preview, and literal public consequence. Healthy Pages show one quiet scheduled sentence with Preview, Change, and Cancel; later drafts clearly say they are not included. Same-target manual publication requires an explicit keep-or-cancel decision. The centralized Publishing schedule contains only Upcoming, Needs attention, and History. Routine initiator offboarding does not silently erase an organization-owned completed authorization, while explicit security, governance, safety, appointment, Site, locale, or source invalidation blocks execution.
>
> D13 includes no Payload scheduling authority, Payload Jobs runner, long-lived sleeping run as truth, recurring schedule, arbitrary condition builder, release graph, partial D10 presentation activation, tenant retry configuration, auto-revert, force path, public-request execution, destructive rollback, or claim that scheduled, prepared, activated, cached, indexed, visible, and source-authoritative are the same fact. Phase 10 adverse withdrawal remains immediate, and D10 remains the sole complete-cohort Site Presentation activation.

## Binding interpretation

### One appointment, one exact intent

- The unit is one immutable `publish` or `unpublish` appointment for one exact
  Tenant × environment × Site × locale × Page.
- A publish appointment selects one acknowledged D12 editorial revision and the
  exact directly reviewed Reusable Section, media, source, and other semantic
  dependency revisions that determine its public meaning.
- It does not freeze the complete Site or locale generation. D1 prepares from
  the current serving generation so unrelated safe publications are preserved.
- A scheduled unpublish selects stable Page identity plus its required route,
  Navigation, redirect/lifecycle, designation, giving, and visitor consequence.
- A change never mutates the old appointment. It creates an immutable successor
  and supersedes the prior appointment with attribution.

### Bounded lifecycle

- At most one unresolved publish and one unresolved unpublish may exist for the
  same exact Page and locale. If both exist, publish must precede unpublish.
- D13 does not add recurrence, repeated cycles, content-release bundles,
  conditional rules, auto-revert, or tenant-configured retry matrices.
- Publishing the exact scheduled revision early may complete the appointment as
  already satisfied. Publishing a different revision requires an explicit choice
  to cancel or retain the scheduled revision; it never silently downgrades.
- A later same-Page publish must explicitly keep, change, or cancel a pending
  unpublish.
- Phase 10 adverse withdrawal and explicit security invalidation always win.

### Organization-owned authorization

Creating an appointment requires current publish permission, completed review,
and all current source and safety proofs. The resulting authorization is owned
by the organization and remains attributable to its initiator and responsible
owner. Routine initiator offboarding therefore does not silently cancel a valid
appointment. Explicit security, governance, safety, Site, locale, source, or
appointment invalidation blocks execution. Offboarding and permission-management
flows must surface affected future appointments for deliberate reassignment or
cancellation.

## Scheduler and execution boundary

The product database owns the appointment, its generation, lifecycle, evidence,
and final receipt. The existing shared dispatch ledger owns durable handoff.
Inngest is the sole delayed executor and receives only identifiers.

Far-future appointments remain in product storage. Within a six-day provider
horizon, the dispatch ledger emits one future-`ts` Inngest event. This avoids a
long-lived sleeping function, a scheduler per tenant, and a high-frequency
global poll. The existing dispatch recovery path repairs missed handoff; one
low-frequency platform-wide overdue reconciler may repair due appointments that
still lack a conclusive receipt.

At execution, one function calls one durable step that invokes the shared D1
command. Automatic retry is limited to transient failures. Semantic conflicts
become one cause-owned Needs attention record. Duplicate or stale delivery
checks appointment generation and receipt, then safely no-ops. Provider event
deduplication, run status, logs, and trace retention are never correctness or
audit evidence.

## Time contract

Every appointment stores the staff member's entered civil date/time, IANA
timezone, explicitly resolved UTC offset, resolved UTC instant, and timezone-
data generation. The Site timezone is the default intent zone and is shown by
name, abbreviation, and current offset; the viewer's local conversion is
secondary context.

- A nonexistent daylight-saving time is rejected with the next valid choices.
- A repeated time requires selection of the intended displayed offset.
- A material timezone-rule reinterpretation before dispatch becomes Needs
  attention rather than silently shifting the promised civil time.
- Execution is **not before** the resolved instant. The UI must not promise an
  exact second; a measured threshold determines when a delayed action is shown
  as overdue and sent to reconciliation.

## UX contract

### Page action

- **Publish now** remains the primary action.
- **Schedule…** is its secondary adjacent action, not a separate automation
  product or mandatory scheduler-first workflow.
- The single accessible dialog shows action, exact revision, Site, public path,
  locale, Site-zone date/time, viewer conversion, preview, later-edits warning,
  and literal public consequence.
- The final button says **Schedule publish** or **Schedule unpublish**, never the
  ambiguous **Save**.

### Persistent state

A healthy Page shows one quiet sentence such as:

> Publishes August 31 at 9:00 AM CDT · Revision 42

with **Preview**, **Change**, and **Cancel**. When later work exists, it says
plainly that the scheduled revision remains unchanged and offers **Replace
scheduled version…**. Replacement re-runs applicable review and readiness proof.

The central Publishing schedule contains only **Upcoming**, **Needs attention**,
and **History**, with bounded Site, locale, and family filters. It uses staff
language—never jobs, queues, attempts, provider runs, or CAS. Routine success is
quiet; exceptions identify the cause, owner, consequence, and next safe action.

### Accessibility

Date and time permit typed entry as well as a keyboard-complete picker. Controls
have persistent labels and format help, errors are textual and programmatically
associated, state changes are announced without stealing focus, focus is
restored on close, and no information depends on color. Production proof covers
keyboard, screen reader, zoom/reflow, mobile, localization, RTL/CJK, and daylight-
saving cases.

## Adversarial disposition

Every required category contains a concern, but none requires broadening D13:

| Category                         | Severity | Permanent disposition                                                                            |
| -------------------------------- | -------: | ------------------------------------------------------------------------------------------------ |
| Brittleness                      |     High | Exact revision and semantic pins; current-head D1 preparation preserves unrelated releases.      |
| Technical debt                   |     High | One D1 release command for immediate, scheduled, and repair paths.                               |
| Edge cases                       |     High | Explicit time, lifecycle, conflict, already-satisfied, and invalidation outcomes.                |
| Footguns                         |     High | Consequence-first dialog, acknowledged revision, named timezone, preview, literal action labels. |
| Tenant safety                    | Critical | Composite scope, private relations, RLS/grants, secured commands, forged-scope denial.           |
| Over-engineering                 |   Medium | Two one-time action kinds only; no recurrence, rule builder, or release graph.                   |
| UX/UI friction                   |     High | Page-first action, one quiet status sentence, exception-first central list.                      |
| Hidden coupling                  |     High | Payload, Inngest, renderer, cache, and search remain subordinate adapters.                       |
| Failure modes                    |     High | Dispatch ledger, fenced claims, D1 CAS, receipt read-back, bounded reconciliation.               |
| Data integrity                   | Critical | Immutable successors, unresolved-action uniqueness, ordering, references, receipts.              |
| Security and privacy             | Critical | Identifier-only events and content-free operational logs.                                        |
| Scalability and performance      |     High | Shared horizon dispatch, bounded due queries/concurrency, no tenant polling.                     |
| Operational burden               |   Medium | Product status and repair actions with one cause owner.                                          |
| Observability gaps               |     High | Appointment-to-receipt correlation and separately observed delivery convergence.                 |
| Dependency and integration risks |     High | One Inngest executor, no Payload Jobs authority, provider-independent recovery.                  |
| Migration and upgrade risks      |     High | Versioned schemas/events, compatibility gates, N/N+1 readers, retained evidence.                 |
| Other development hazards        |     High | Database time, immutable generations, deterministic race tests, Phase 10 precedence.             |

## Inngest cost and operational findings

Current Inngest pricing counts one function run plus each step as executions.
A normal D13 appointment therefore targets one delayed event and approximately
two executions—one function run and one execution step—excluding downstream D1
work that an immediate publication would also require. One platform-wide
15-minute one-step reconciliation scan would add approximately 5,760 executions
per 30-day month; a one-minute equivalent would add approximately 86,400 and is
rejected.

The repository's existing five-minute and two-minute one-step recovery scans
already imply approximately 60,480 monthly executions. Production launch must
therefore model account-wide usage, confirm the actual contracted quota and
overage price, configure budget and quota alerts, and test provider exhaustion.
Hobby availability is not a production durability contract.

## Implementation proof gates

Implementation remains unauthorized by this decision. A future authorized
change must prove at minimum:

- immutable appointment and successor history; exact publish revision and
  semantic dependency identity; stable unpublish target and consequence;
- composite Tenant/environment/Site/locale/Page integrity, explicit grants and
  RLS, identifier-only events, and forged cross-tenant denial;
- one unresolved appointment per action kind, publish-before-unpublish order,
  idempotency fingerprints, generation fencing, and receipt closure;
- one shared D1 command for Publish now and scheduled execution, current-head
  preparation, exact expected-head CAS, safe already-satisfied no-op, and no
  silent downgrade or material rebase;
- delayed handoff, missed-handoff recovery, stale-event no-op, duplicate
  delivery beyond provider deduplication, lost acknowledgement, bounded retry,
  overdue reconciliation, and provider-outage recovery;
- DST gaps and overlaps, timezone-rule change, near-now scheduling, database
  clock use, and truthful delayed/overdue wording;
- manual publish, later autosave, replacement, cancel-versus-execute,
  reschedule-versus-claim, Page trash, disabled Site/locale, route conflict,
  renderer incompatibility, source invalidation, initiator offboarding, and
  Phase 10 adverse-action races;
- independent cache, CDN, sitemap, search, and crawler convergence without
  treating those facts as D1 activation; and
- keyboard, screen-reader, mobile, reflow, localization, accessibility, load,
  usage-budget, alerting, N/N+1, rollback, and retained-worker compatibility.

## References

- [Phase 23 D13 Inngest scheduling and cost research](./research/phase-23-d13-inngest-scheduling-cost-research.md)
- [ADR-0145 — Page-local composition, bounded reuse, and coherent Public Site Generations](../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [ADR-0154 — Complete-cohort Site Presentation Activation through D1](../../adr/0154-complete-cohort-site-presentation-activation-through-d1.md)
- [ADR-0156 — Bounded Editorial Working Revisions and recoverable active editor](../../adr/0156-bounded-editorial-working-revisions-and-recoverable-active-editor.md)
- [Workflow orchestration specification](../../../openspec/specs/workflow-orchestration/spec.md)
- [Inngest pricing](https://www.inngest.com/pricing)
- [Inngest delayed functions](https://www.inngest.com/docs/guides/delayed-functions)
- [Inngest sleeps](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/sleeps)
- [Payload scheduled publish](https://payloadcms.com/docs/versions/drafts#scheduled-publish)
- [Sanity scheduled drafts](https://www.sanity.io/docs/studio/scheduled-drafts)
- [Contentful scheduled publishing](https://www.contentful.com/help/scheduled-publishing/)
- [Storyblok content authoring](https://www.storyblok.com/docs/manuals/content-authoring)
- [WAI-ARIA date picker dialog example](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/)
