# Phase 24 D50 — Request-Anchored Elapsed Clock Primary Research

**Date:** 2026-08-29

**Founder answer:** **Option 1 — one elapsed duration from the authoritative D43
source-creation commit, resolved to an immutable absolute eligibility instant
and never reset by D44 responsibility changes**

**Disposition:** **Accept with required amendments**

**Scope:** temporal meaning, source anchor, elapsed arithmetic, source-versus-
worker/seal/delivery instants, concurrency, recovery, UX, security, migration,
and proof only; no cadence value, useful-lateness value, later policy-edit
behavior, content, channel, schema, OpenSpec, worker, telemetry, or UI artifact

> **Post-D51 historical note (2026-08-29):** D51 now makes Active-to-Off a
> monotonic source fence, keeps non-Off edits and re-enable prospective, and
> forbids revival/catch-up without changing D50's immutable time package. D52
> useful-lateness is next. D50's original D51 question remains historical.

## Purpose and research standard

D50 resolves the clock model for the single possible courtesy-reminder
occurrence admitted by D47/D48 and bounded to D49 recipients. The founder chose
request-anchored elapsed time over a Tenant-local civil calendar or a clock that
restarts when D44 responsibility changes.

The user-facing shorthand “from the request creation commit” needs correction
before it is safe to specify. PostgreSQL does not expose a generic physical
commit timestamp as ordinary business truth; `CURRENT_TIMESTAMP`/
`transaction_timestamp()` represent transaction start, `statement_timestamp()`
represents statement receipt, and `clock_timestamp()` changes during execution.
A later age scan over `created_at`, an application server clock, or a worker
wake would produce different results under locks, retries, restore, and clock
skew. D50 therefore defines the business fact as one trusted database-generated
**source-created instant**, captured once inside the successful D43 source-
creation transaction after the command wins its authoritative prerequisites.
The transaction retains that instant or retains nothing. One finite fixed
elapsed duration is added once to produce the immutable **access-review reminder
eligibility instant**.

This research tests that corrected choice against Core's governing source,
authorization, task, notification, workflow, time, and UX boundaries; current
official PostgreSQL, Supabase, IANA, IETF, IAM, CMS/nonprofit, and Inngest
documentation; transactional-outbox/idempotency practice; accessibility;
failure recovery; and production-shaped scale.

Evidence labels are strict:

- **Repository fact:** verified in the current Core repository.
- **Verified external fact:** verified in current official first-party
  documentation.
- **Requirement inference:** required by a governing repository or verified
  platform boundary.
- **Product judgment:** a deliberate Core choice where more than one safe model
  exists.
- **Assumption:** plausible but not established with representative ministry or
  production evidence.
- **Unresolved unknown:** needs a later founder, source, UX, or operational
  decision.

Vendor behavior is comparative evidence only. Core imports no vendor interval,
deadline, recurrence, time zone, fallback, timeout, scheduler, calendar, or
executor merely because it demonstrates one temporal pattern.

## Executive finding

**Accept with required amendments.** Request-anchored elapsed time is the best
permanent model for this narrowly defined courtesy attention because the
reminder has no promised local date, office-day meaning, deadline, SLA, expiry,
or access consequence:

- PostgreSQL stores `timestamptz` instants normalized to UTC and documents that
  adding one civil `day` can differ from adding 24 hours across daylight-saving
  transitions.
- IANA documents that time-zone rules change through government decisions and
  propagate through tzdb releases. That machinery is necessary for genuine
  civil promises but needless for a fixed elapsed nudge.
- Microsoft Entra separates configured review timing from actual processing:
  start processing can be delayed while the review remains defined by its
  configured duration. Okta says reviewer reassignment does not extend the
  campaign end date. Both support keeping responsibility changes out of source
  time.
- SailPoint and GitHub demonstrate the strongest alternative: explicit local
  times, weekdays, time zones, and schedule previews. Their richer calendar
  semantics are valid for those products but do not establish a Core ministry
  requirement.
- Inngest can durably sleep until an instant and retry work, but its event/
  function deduplication is finite and its wake time is execution—not business
  time. Core's product record, claim, and receipt must remain authoritative.
- AWS's transactional-outbox guidance confirms that source state and dispatch
  intent must commit together while consumers remain idempotent.

The corrected Core model has four deliberately separate temporal facts:

1. The **D43 source-created instant** is captured by the trusted source
   transaction and becomes immutable only if that transaction commits.
2. The **D50 eligibility instant** is the source-created instant plus the exact
   pinned elapsed duration. It is an inclusive not-before fact.
3. A **D49 recipient-resolution/cohort-seal instant** is later operational and
   cannot reset or reinterpret D50.
4. Worker wake, claim, presentation, provider acceptance, and delivery times are
   execution/evidence only and cannot change either source instant.

D50 creates no countdown, due date, local-calendar engine, task date, scheduler,
or runtime artifact. If the feature later passes every remaining gate, the
future settings surface quietly explains:

> **Timing**
>
> Timing starts when the access request is created. Changing coordinators won't
> restart it.

One secondary disclosure may say:

> It uses elapsed time, so weekends and time zone changes don't alter the
> interval. This does not set a due date.

No current UI is added.

## Exact corrected D50 decision

1. D50 selects **request-anchored fixed elapsed time** for the single possible
   D47 courtesy-reminder occurrence of an exact D48-admitted D43 request episode.
2. D50 does not activate a reminder. D46's no-reminder baseline and every D47
   evidence gate remain controlling until all later decisions and release proof
   are complete.
3. The canonical anchor is the immutable **D43 source-created instant**: one
   finite database-generated instant captured once inside the successful source-
   creation transaction at the final request write after D48's shared policy/
   request serialization winner and authoritative Tenant, policy, request-head,
   and admission prerequisites have been proved.
4. “Source-created instant” is not a claim that PostgreSQL supplies a physical
   commit timestamp. It is not browser/app/worker time, a transaction-start
   value chosen by convention, HTTP arrival/response time, a restored
   `created_at` age scan, or a provider timestamp. Exact clock function and
   precision await design, but capture must be explicit, single-valued, and
   proven after the command's blocking prerequisites.
5. If the D43 creation transaction rolls back or never commits, no source-created
   instant, cadence admission, eligibility instant, occurrence, or temporal
   handoff exists. A later genuine retry may create a later episode/instant only
   under D43/D48 idempotency rules.
6. A committed lost-response replay returns the original source-created instant,
   admitted policy input, elapsed duration, eligibility instant, request
   episode, and receipt. It never asks the current clock or policy to recalculate.
7. The elapsed duration is the exact bounded finite positive value carried by the
   admitted code-owned D47 policy choice/version under D48. D50 chooses no
   numeric value and permits no free-form number, float, cron, RRULE, month,
   civil date, or Tenant-authored expression.
8. If a future approved choice is described in “days,” one day means exactly
   86,400 elapsed PostgreSQL/POSIX-style seconds. It never means the next local
   date, a 23/25-hour DST day, weekday, business day, or holiday-aware day.
9. Inside the same successful D43 source transaction, Phase 12 performs checked
   fixed-duration arithmetic once and retains one finite UTC-normalized
   **access-review reminder eligibility instant** with the exact source/policy/
   duration evidence needed to reproduce the result and no precision loss
   relative to the chosen authoritative representation.
10. Missing, zero/negative, unsupported, contradictory, non-finite, overflowed,
    or otherwise invalid temporal proof cannot strand the valid D43 request. It
    follows D48's typed safe non-admission path, creates no temporal/recipient/
    reminder handoff, and records minimized durable operations evidence.
11. The source-created and eligibility instants are immutable historical facts.
    Tenant time-zone changes, tzdb updates, DST, weekends, holidays, D44 route or
    eligibility changes, task engagement, policy presentation, executor delay,
    and provider behavior cannot move or reinterpret them.
12. A later cadence-policy edit or Off publication may be authorized to suppress
    or cancel not-yet-completed work only through the separately ratified D51
    lifecycle. It can never rewrite either D50 instant or manufacture a new
    occurrence identity.
13. Temporal eligibility is inclusive: the time predicate is false while the
    trusted primary product-database instant is before the retained eligibility
    instant and may become true when it is equal to or later than that instant,
    subject to every current source/policy/usefulness/authorization fence.
14. The product primary database is the comparison authority. Browser, Node/
    server-process, replica, cache, Inngest, cron host, recipient device,
    provider, and external integration clocks are never sufficient to claim the
    occurrence.
15. A worker or executor that wakes early must perform no effect and leave the
    source occurrence safely claimable later. Sleeping until an instant is only
    an optimization; the source predicate and product claim decide.
16. A worker or executor that wakes late does not re-anchor, round, or shift the
    eligibility instant and does not create catch-up work by age. Later founder
    decisions—beginning with D51 policy lifecycle and followed separately by
    useful-lateness—must decide whether any effect remains permitted.
17. D49's resolution attempt and eventual `sealed_members` or
    `sealed_proved_zero` instant occur at or after D50 eligibility. D49
    `recipient_resolution_indeterminate` attempts remain unreleased and never
    move D50's anchor or eligibility instant.
18. D44 responsibility-generation creation, differential route application,
    coordinator add/remove, assignment end/recreation, or eligibility
    restoration never starts, pauses, extends, or resets D50 time.
19. Task creation, assignment, completion, due/reminder fields, comments,
    notification read/archive/open state, channel preference, provider
    acceptance, and delivery evidence never start, satisfy, reset, or alter D50
    time.
20. PostgreSQL session `TimeZone`, API formatting, viewer locale, and display
    zone may change only presentation. APIs and receipts use one unambiguous
    canonical instant representation with no precision loss relative to the
    authoritative stored value; exact storage/wire format remains design work.
    Display values are derived and never round-trip as write authority.
21. D50 uses PostgreSQL's operational timeline, which does not model leap
    seconds. Its elapsed “day” is therefore exactly 86,400 database-timeline
    seconds; no leap-second table, astronomical clock, or TAI conversion is
    introduced for this courtesy feature.
22. The successful source transaction atomically retains the request, D48
    disposition, source-created instant, policy/duration evidence, eligibility
    instant, audit/receipt, and any applicable identifier-only temporal-intent
    dispatch record. It creates no D49 member or channel handoff before D49
    terminally resolves recipients.
23. Product-database uniqueness and claims—not a timestamp, task, event ID,
    Inngest run, wake, cron tick, or provider key—own the at-most-one occurrence
    and idempotent business effect.
24. Duplicate, delayed, missing, or out-of-order events and executor retries
    load the exact retained source instants and converge through the same product
    occurrence/claim. Inngest's finite deduplication cannot be permanent truth.
25. Inngest may later receive an identifier-only post-commit temporal intent and
    use `sleepUntil` or another proved wake mechanism. Product dispatch-ledger
    recovery and indexed due-work recovery remain available if Inngest is
    disabled, loses a handoff, exceeds retention, or wakes late.
26. The automatic occurrence is a registered Phase 12 product/system command.
    Tenant, source actor, request/policy heads, duration, source-created instant,
    eligibility instant, occurrence identity, and audit attribution are derived
    from trusted server/source context, never caller input or impersonation of a
    human policy manager.
27. Future persistence must enforce non-null Tenant scope, same-Tenant composite
    relationships, finite/range/cardinality checks, restrictive deletion,
    immutable source evidence, least grants, RLS `USING`/`WITH CHECK`, forced or
    equivalent owner behavior, and privileged-path authorization parity. D50
    does not freeze table, column, index, function, or lock names.
28. ADR-0017's donor-anchored civil-date schedule and ADR-0039's civil
    publication appointment remain correct in their domains because each makes
    a human calendar promise. D50 does not reuse or contradict them; this
    courtesy nudge deliberately makes no civil promise.
29. Future UX says when timing starts and that coordinator/time-zone changes do
    not restart it. It never presents a countdown, local due date, overdue badge,
    SLA, neglect score, guaranteed delivery time, editable anchor, or per-request
    schedule.
30. D50 adds no schema, migration, key, Delivery Step, task field, message,
    setting, calendar, cache, event, queue, job, cron, Inngest function, feature
    flag, telemetry, UI, or hidden placeholder now. D51 and later value/content/
    channel/evidence decisions remain mandatory before activation.

## Current behavior, intended behavior, and permanent path

| State                         | Verified position                                                                                                                                                                                    | D50 consequence                                                                                           |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Current shipped behavior**  | D43–D50 are not shipped. Existing generic task reminders, contribution approval timers, donor recurring schedules, document appointments, and demo notification UI have different owners/meaning.    | No current timer, row, job, field, or UX is a D50 implementation precedent.                               |
| **Current governing design**  | D47 only permits a possible future default-Off courtesy policy; D48 admits genuine new requests prospectively; D49 seals one exact current D44 responsibility generation at source occurrence.       | D50 may define temporal semantics only and must preserve all no-runtime/no-placeholder gates.             |
| **Founder-selected behavior** | One exact elapsed duration is anchored to the immutable D43 source-created instant and resolves to one finite UTC eligibility instant.                                                               | Calendar/zone and D44 responsibility changes do not reset or reinterpret it.                              |
| **Best permanent path**       | Capture and derive both source instants atomically with D43/D48, persist one product-owned temporal intent, recover through product claims/outbox, and treat every later time as execution/evidence. | Deterministic replay and replaceable execution without importing a calendar engine or worker-owned clock. |

## Governing Core evidence

| Repository evidence                                                                                                                                       | Verified finding                                                                                                                                                                                                                                                                             | D50 requirement                                                                                       |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| [Phase 24 decision log](./phase-24-multi-site-management-decision-log.md)                                                                                 | D50 offered request-elapsed, Tenant-local calendar, and D44-generation-reset clocks; founder selected request-elapsed.                                                                                                                                                                       | Record one exact source anchor and reject hidden responsibility reset.                                |
| [Root glossary](../../../CONTEXT.md)                                                                                                                      | **Access-review reminder eligibility instant** is an immutable finite UTC instant derived inside successful D43 creation from trusted source-created instant plus admitted elapsed duration; it explicitly avoids physical commit timestamp, age scan, calendar arithmetic, and worker time. | Use this term and preserve its owner/avoid list consistently.                                         |
| [D43 primary research](./phase-24-d43-governed-holder-access-review-primary-research.md)                                                                  | D43 owns one exact pending episode, trusted source transaction, lifecycle, and receipt.                                                                                                                                                                                                      | The D43 source transaction owns the temporal anchor; no task/projection can.                          |
| [D47 primary research](./phase-24-d47-bounded-tenant-reminder-cadence-primary-research.md)                                                                | A future policy may have at most one occurrence, no due/SLA meaning, code-owned finite values, and source-owned time; exact clock/value remained open.                                                                                                                                       | D50 closes only clock semantics and does not activate/select values.                                  |
| [D48 primary research](./phase-24-d48-new-request-only-cadence-application-primary-research.md)                                                           | Cadence admission is decided atomically at genuine source creation with the exact policy input; invalid optional proof cannot strand D43.                                                                                                                                                    | Derive eligibility only for valid admitted creation and use safe non-admission on invalid time proof. |
| [D49 primary research](./phase-24-d49-current-recipient-cohort-primary-research.md)                                                                       | Recipient resolution happens at one later source occurrence and may be indeterminate before terminal seal.                                                                                                                                                                                   | D49 attempt/seal time is separate and cannot become/reset D50 time.                                   |
| [D49 adversarial review](./phase-24-d49-current-recipient-cohort-adversarial-review.md)                                                                   | D49 consumes exact current D44 responsibility generation; no task/channel/executor owns membership or source occurrence.                                                                                                                                                                     | D44 changes do not become a temporal anchor.                                                          |
| [Phase 12](./phase-12-full-role-permission-configuration.md)                                                                                              | Phase 12 owns request, policy, recipient generation, expected-head/authorization/RLS, source occurrence, and immutable receipts.                                                                                                                                                             | D50 stays one Phase 12 source fact and server command.                                                |
| [ADR-0184](../../adr/0184-direct-and-governed-group-capability-assignment.md)                                                                             | Access governance uses current purpose-bound EffectiveAccess and exact source history; current broad runtime gates are nonprecedent.                                                                                                                                                         | Temporal writers/readers remain same-Tenant, purpose-bound, and least privilege.                      |
| [ADR-0183](../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)                                                                        | Tasks Hub cannot own recurrence, reminders, source completion, or access outcomes.                                                                                                                                                                                                           | Task age/dates never produce or change D50.                                                           |
| [ADR-0027](../../adr/0027-one-notification-presentation-and-engagement-model.md)                                                                          | Notification presentation/engagement is downstream and independently authorized.                                                                                                                                                                                                             | Read/archive/presentation/delivery timestamps are evidence only.                                      |
| [ADR-0026](../../adr/0026-contract-bounded-delivery-plans.md)                                                                                             | Source producers own temporal eligibility; Delivery Plans cannot invent waits, recurrence, or source state.                                                                                                                                                                                  | Phase 17/6 consumes the occurrence only after source claim.                                           |
| [Workflow OpenSpec](../../../openspec/specs/workflow-orchestration/spec.md)                                                                               | Product records/claims/dispatch ledger stay authoritative; Inngest is replaceable and events identifier-only.                                                                                                                                                                                | Wake/executor time never becomes source; outbox/claim recovery is mandatory.                          |
| [Identity and Access OpenSpec](../../../openspec/specs/identity-and-access/spec.md)                                                                       | Identity/Tenant/role/capability resolve server-side; application checks and RLS enforce isolation in depth.                                                                                                                                                                                  | Caller cannot nominate source time, Tenant, policy, or occurrence.                                    |
| [Platform principles](../../../openspec/specs/platform-principles/spec.md) and [platform boundaries](../../../openspec/specs/platform-boundaries/spec.md) | Tenant/permission correctness outrank convenience and CRM owns permission-sensitive workflow.                                                                                                                                                                                                | CMS, tasks, AI, providers, and public/donor/missionary surfaces cannot own D50.                       |
| [ADR-0017](../../adr/0017-donor-anchored-civil-date-recurring-schedules.md)                                                                               | Recurring giving is a donor calendar promise, so it intentionally uses frozen civil dates/zones and no-drift schedule epochs.                                                                                                                                                                | Distinguish semantic domains; do not generalize civil scheduling into courtesy attention.             |
| [ADR-0039](../../adr/0039-proof-gated-publication-resolution-and-appointment.md)                                                                          | Publication appointments pin civil input plus resolved UTC instant because staff explicitly choose a future local appointment.                                                                                                                                                               | D50 needs only the resolved instant because no civil input/promise exists.                            |
| [Frontend rules](../../../docs/ai/rules/frontend.md) and [shared UI configuration](../../../packages/ui/components.json)                                  | Core UI uses shared `@asym/ui`, Base UI, Base Maia/Zinc, accessible forms/status, and no app-local fork.                                                                                                                                                                                     | Any later timing summary uses the existing quiet design language; no UI now.                          |

## Current official external evidence

### PostgreSQL, UTC instants, civil time, and tzdb

| Official source                                                                                                                | Verified fact                                                                                                                                                 | D50 implication                                                                                                                          | Evidence limit                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| [PostgreSQL 18 — Date/Time Types](https://www.postgresql.org/docs/current/datatype-datetime.html)                              | `timestamptz` input is converted to UTC, stored internally as an instant, and displayed in the current session zone; the original input zone is not retained. | Retain one absolute eligibility instant and keep display zone derived; never reconstruct source semantics from formatted output.         | PostgreSQL calls this UTC operationally but does not model leap seconds.                                                      |
| [PostgreSQL — Date/Time Functions](https://www.postgresql.org/docs/current/functions-datetime.html#FUNCTIONS-DATETIME-CURRENT) | `transaction_timestamp()` is transaction start, `statement_timestamp()` is statement start/receipt, and `clock_timestamp()` changes during execution.         | “Commit time” is ambiguous; later design must capture one explicit DB source-created instant after authoritative blocking prerequisites. | The source meaning selects the primitive; the docs do not choose it for Core.                                                 |
| [PostgreSQL — Date/Time Operators](https://www.postgresql.org/docs/current/functions-datetime.html)                            | Adding `interval '1 day'` to a timezone-aware timestamp can differ from adding `interval '24 hours'` across DST.                                              | Implement fixed elapsed arithmetic explicitly; do not use calendar-day semantics by accident.                                            | Exact SQL representation remains design work.                                                                                 |
| [IANA time-zone database](https://data.iana.org/time-zones/tz-link.html)                                                       | Time-zone boundaries and DST rules change through government decisions and updates propagate through downstream software/tzdb releases.                       | A civil model requires versioned zone/rule handling; selected elapsed instants avoid that source dependency.                             | Display formatting still needs current localization/zone handling.                                                            |
| [RFC 3339](https://www.rfc-editor.org/rfc/rfc3339.html)                                                                        | It defines an unambiguous Internet timestamp profile and defines a day as 24 hours while documenting leap-second representation.                              | Require unambiguous lossless source/audit interchange under the later chosen representation and document Core's PostgreSQL timeline.     | RFC 3339 is comparative representation evidence, not a mandate for exact wire precision/format or a scheduler/database model. |

### IAM, CRM, CMS, nonprofit, and comparable products

| Official source                                                                                                                              | Verified fact                                                                                                                                  | D50 implication                                                                                                              | Evidence limit                                                                   |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [Microsoft Entra — create access review](https://learn.microsoft.com/en-us/entra/id-governance/create-access-review)                         | Review duration is configured in days and reminders occur halfway; a configured start can be processed a few hours late.                       | Product temporal meaning and actual processing time are distinct; worker delay must not move source eligibility.             | Entra's exact day arithmetic is not documented sufficiently to copy.             |
| [Okta — reassign review items](https://help.okta.com/en-us/content/topics/identity-governance/access-certification/iga-reassign-reviews.htm) | Reassigning a review item does not extend the campaign end date.                                                                               | Strong direct evidence against resetting source time when responsibility changes.                                            | Core has no campaign deadline or automatic access action.                        |
| [SailPoint — reminder/escalation policies](https://documentation.sailpoint.com/saas/help/requests/config_emails.html)                        | SailPoint supports days-after-request, frequencies, times, time zone, and schedule preview; configuration changes affect only future requests. | Demonstrates the strongest calendar alternative and prospective versioning; it is more complex than selected Core semantics. | Core rejects repeat reminders, escalation, timeout, fallback, and vendor values. |
| [GitHub — scheduled reminders](https://docs.github.com/en/subscriptions-and-notifications/concepts/scheduled-reminders)                      | GitHub can send reminders for current open review requests at configured schedules/time zones.                                                 | Calendar-based current-work reminders are legitimate but materially different from one request-anchored occurrence.          | Pull-request review is lower sensitivity and recurring/grouped.                  |
| [Contentful — Tasks](https://www.contentful.com/help/content-and-entries/tasks/)                                                             | A task with a due date receives a reminder two days before that deadline.                                                                      | Many CMS reminders derive from a real due date; D50 cannot borrow that meaning because D43 has none.                         | Contentful tasks and deadlines are not access governance.                        |
| [Blackbaud Grantmaking — Reviews](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/grantmaking/content/reviews.html)               | Nonprofit reviewers can have explicit due/acceptance dates and visibility windows.                                                             | Calendar timing is appropriate when the source makes those promises; Core's D43 request does not.                            | Blackbaud review committees and dates do not establish Core cadence demand.      |

No directly comparable current first-party online-giving/e-commerce source found
in this review establishes a more appropriate clock for sensitive access-review
courtesy attention. Payment billing anchors and donor promises have different
financial and consent semantics; importing them would be false comparability.

### Concurrency, authorization, durable execution, and accessibility

| Official source                                                                                                                        | Verified fact                                                                                                                        | D50 implication                                                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [PostgreSQL 18 — Transaction Isolation](https://www.postgresql.org/docs/current/sql-set-transaction.html)                              | `READ COMMITTED` takes statement snapshots while `SERIALIZABLE` rejects nonserializable read/write outcomes.                         | D43/D48 temporal capture and competing policy/request commands require one source order and whole-command retry. |
| [PostgreSQL — Row Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)                                              | `USING` protects existing rows and `WITH CHECK` protects inserted/updated rows; owners and `BYPASSRLS` can escape ordinary policies. | Caller updates cannot retarget time/Tenant, and privileged paths need equivalent authorization.                  |
| [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)                                 | Grants and policies are separate; service/secret roles bypass RLS and views may expose more than intended.                           | Browser grants stay revoked, views/functions are audited, and workers enforce the same source boundary.          |
| [RFC 9110 — Idempotent Methods](https://www.rfc-editor.org/rfc/rfc9110.html#name-idempotent-methods)                                   | Retrying a non-idempotent request is unsafe unless its application semantics are known idempotent or non-application is known.       | Lost-response request/claim retries need durable business identities and receipts, not timestamp coincidence.    |
| [AWS — Transactional Outbox](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html) | Atomic database/outbox write avoids dual-write loss; consumers must tolerate duplicates and preserve order where needed.             | Retain temporal intent with source truth, then recover identifier-only dispatch idempotently.                    |
| [Inngest — Sleeps](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/sleeps)                                     | `step.sleepUntil()` can resume at a future date/time and sleeps are durable without consuming active concurrency.                    | Inngest is a useful optional wake mechanism after source commit.                                                 | A wake is not a guarantee of exact execution time or source authority. |
| [Inngest — Durable Execution](https://www.inngest.com/docs/learn/how-functions-are-executed)                                           | Steps persist state and retry independently across interruptions.                                                                    | Executor retries can resume identifier-only work but must re-read product truth/claims.                          | Inngest's state store cannot replace source/audit truth.               |
| [Inngest — Idempotency](https://www.inngest.com/docs/guides/handling-idempotency)                                                      | Event/function idempotency keys deduplicate for a 24-hour period, not permanently.                                                   | Permanent one-occurrence uniqueness must live in Core's database.                                                |
| [WCAG 2.2 — Reflow](https://www.w3.org/TR/WCAG22/#reflow)                                                                              | Content must reflow at 320 CSS pixels/400% zoom except genuine two-dimensional necessities.                                          | Timing explanation/audit uses stacked content, not a wide timeline.                                              |
| [W3C — Status Messages](https://www.w3.org/WAI/WCAG21/Understanding/status-messages)                                                   | Status changes must be programmatically determinable without moving focus and should avoid excessive chatty announcements.           | Save/recovery results use persistent restrained semantic status, never a live countdown announcement.            |
| [W3C — Headings and Labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels)                                           | Labels must describe topic or purpose clearly.                                                                                       | Use plain **Timing** and source-oriented helper copy, not “UTC policy,” “timer,” or “scheduler.”                 |

## Evidence synthesis

### Verified conclusions

1. Absolute-instant and civil-calendar arithmetic are materially different and
   PostgreSQL can perform either; the domain promise must choose.
2. `timestamptz` preserves the instant but not the original zone. Since D50
   makes no civil promise, the missing original zone is intentional, not data
   loss.
3. A generic “database commit time” is not a sufficient specification. Core must
   capture one explicit source-created instant inside the successful source
   transaction.
4. Reviewer reassignment need not reset temporal windows; Okta documents that it
   does not extend campaign end time.
5. IAM and collaboration products legitimately use local schedules when their
   UX promises weekdays/times. That is the strongest alternative, not universal
   best practice.
6. Durable executors can wake late, retry, duplicate, or exceed observability/
   deduplication windows. Product source time and claims must survive them.
7. Atomic source/outbox state plus idempotent consumers is the proven reliability
   boundary; sending first or storing only an executor timer creates dual truth.
8. Excellent UX requires explaining the anchor and non-reset behavior without a
   deadline, countdown, or technical clock vocabulary.

### Product judgments

- Choose fixed elapsed time because the courtesy occurrence has no local-date,
  office-day, legal, financial, or donor promise.
- Define a future approved “day” as exactly 86,400 database-timeline seconds so
  DST and zone edits cannot alter results.
- Capture source-created time after the command wins authoritative blocking
  prerequisites, not automatically at transaction start.
- Retain one derived eligibility instant rather than repeatedly computing
  `created_at + current_policy` in due scans.
- Use the primary product database for eligibility comparison; read-replica or
  executor clocks cannot authorize an effect.
- Treat D49 seal, wake, dispatch, presentation, provider, and delivery times as
  evidence only.
- Keep civil scheduling ADRs intact in their own promise-bearing domains rather
  than forcing a universal time engine.

### Assumptions and unresolved unknowns

- **Assumption:** ministry administrators understand **elapsed time from request
  creation** without expecting business days. Verify with representative
  ministries across zones and field contexts.
- **Assumption:** coordinator reassignment attention plus a request-anchored
  reminder near the same time is preferable to an indefinitely reset clock.
  Verify attention-volume and comprehension before activation.
- **Unknown:** exact non-Off duration choices; no vendor value is adopted.
- **Unknown:** D51 policy edit/Off/re-enable behavior for admitted but not-yet-
  sealed occurrences and a subsequent separate useful-lateness decision.
- **Unknown:** stable message content, channel admission, quiet-time, destination,
  and provider behavior.
- **Unknown:** exact Postgres capture function/precision and later schema/index/
  claim design; these must conform to the source semantics above.
- **Unknown:** the production primary-database clock SLO in the eventual hosting
  topology; release design must make it explicit and observable.

## Authoritative temporal facts and ownership

| Fact                                   | Owner                              | Meaning                                                       | May alter D50 source truth?                                                  |
| -------------------------------------- | ---------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| D43 source-created instant             | Phase 12 D43 creation transaction  | Trusted immutable anchor retained only by successful creation | It is source truth; no later actor may change it.                            |
| Admitted elapsed duration/version      | Phase 12 D47/D48 policy admission  | Exact code-owned fixed duration input for this episode        | Immutable evidence; later policy cannot rewrite it.                          |
| D50 eligibility instant                | Phase 12 D43/D48 source receipt    | Anchor plus fixed elapsed duration; inclusive not-before fact | Immutable; only a later source lifecycle may cancel usefulness, not move it. |
| Current database comparison instant    | Primary product database           | Current authoritative time used during a source claim         | Decides whether not-before has been reached; not persisted as a new anchor.  |
| Executor wake instant                  | Inngest/cron/worker                | Optimization indicating when code resumed                     | No. Early/late wake must re-read source.                                     |
| D49 resolution-attempt instant         | Phase 12 attempt evidence          | When a recipient-resolution attempt occurred                  | No. Indeterminate retry does not reset time.                                 |
| D49 cohort-seal instant                | Phase 12 D49 terminal receipt      | When members/proved-zero became terminally sealed             | No. It is later source evidence, not temporal anchor.                        |
| Dispatch/claim/preparation instant     | Product dispatch/Phase 6           | When downstream work was recorded/claimed/prepared            | No.                                                                          |
| Presentation/provider/delivery instant | Phase 17/Phase 6/provider evidence | When an effect became visible/accepted/delivered              | No.                                                                          |
| Viewer-local formatted date/time       | UI presentation                    | Derived explanation in the viewer's locale/zone               | No; never accepted back as authority.                                        |

## Domain invariants

1. Every D48-admitted D43 episode has at most one immutable D50 anchor/duration/
   eligibility tuple for the stable reminder class.
2. A source-created instant exists if and only if its D43 creation transaction
   committed successfully; rollback leaves no temporal fact.
3. Eligibility instant equals source-created instant plus the exact admitted
   fixed elapsed duration under the versioned resolver and never current policy.
4. Both instants are finite, UTC-normalized, same-Tenant, same-episode, immutable,
   and server-derived.
5. Invalid duration/arithmetic produces typed cadence non-admission, never a
   malformed or default eligibility instant and never a failed D43 request.
6. Before the eligibility instant, no D49 source occurrence may terminally seal
   recipients or release reminder work.
7. Equality at the eligibility instant satisfies only the temporal not-before
   predicate; every other current source/authorization/lifecycle fence still
   applies.
8. D44 changes never alter the temporal tuple.
9. Time zone, DST, weekend, holiday, tzdb, locale, and display changes never
   alter the temporal tuple.
10. Worker, replica, cache, event, task, notification, provider, and client times
    never authorize an occurrence.
11. Exact replay returns the same tuple and receipt.
12. One source occurrence identity is independent of all timestamps; equal
    timestamps do not merge work and different timestamps cannot duplicate it.
13. D49 and every descendant may be later than eligibility but cannot re-anchor
    it or describe lateness as Due/Overdue/neglect.
14. Source transaction and temporal-intent dispatch are atomic where a dispatch
    row is applicable; external executor submission happens only after commit.
15. Unknown, missing, unsupported, or contradictory D50 proof is no-release and
    cannot be repaired by current-age recomputation.

## Temporal lifecycle and state matrix

The labels below specify observable semantics, not mandatory enum/table names.

| Semantic state                              | Temporal meaning                                                                                   | Permitted transition                                                                                                                             | Forbidden transition                                                                |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| Cadence not admitted                        | No valid D48 temporal input exists.                                                                | D43 request remains valid with no reminder.                                                                                                      | Infer time from age/current policy.                                                 |
| Waiting before eligibility                  | Immutable tuple exists and primary DB time is before eligibility.                                  | Become temporally eligible when database predicate is inclusive true, or later source lifecycle may cancel under D51.                            | Early seal/send, reset, local rounding.                                             |
| Temporally eligible, unresolved             | Not-before passed but D49 has not terminally resolved.                                             | D49 attempts the same occurrence; any cancellation/usefulness transition requires a separately ratified later decision that D50 does not choose. | Create another occurrence or move instant.                                          |
| `recipient_resolution_indeterminate`        | D49 attempt failed complete recipient proof.                                                       | Retry same occurrence without changing D50 tuple.                                                                                                | Reset anchor, create member handoff, treat as zero.                                 |
| `sealed_members`                            | D49 terminally sealed current recipients.                                                          | Downstream paths only narrow under D49/later channel rules.                                                                                      | Recompute D50, add time-based member, create second occurrence.                     |
| `sealed_proved_zero`                        | D49 terminally proved no eligible recipient.                                                       | Terminal for the one occurrence.                                                                                                                 | Wait for a later coordinator or reset clock.                                        |
| Later lifecycle outcome (unresolved by D50) | Reserved only as a semantic dependency for a future ratified policy-lifecycle/usefulness decision. | Whatever that later decision explicitly permits.                                                                                                 | Infer cancellation, expiry, suppression, resurrection, or a finite window from D50. |

## Race, boundary, and edge matrix

| Scenario                                                 | Required D50 result                                                                                           |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| D43 creation waits on D48 policy serialization           | Capture source-created instant only after authoritative prerequisites; transaction-start time is not assumed. |
| Creation transaction rolls back                          | No anchor, eligibility, intent, or occurrence exists.                                                         |
| Response is lost after creation commit                   | Exact replay returns original tuple/receipt.                                                                  |
| Retry truly begins after a noncommitted attempt          | A successful new creation may capture a later source instant; it cannot duplicate the episode.                |
| Eligibility addition overflows supported timestamp range | D43 commits through typed safe non-admission; no malformed instant/handoff.                                   |
| Duration is missing/unknown/zero/negative                | Typed safe non-admission; no default.                                                                         |
| Source-created plus duration crosses DST spring gap      | Add exact elapsed seconds; DST is irrelevant.                                                                 |
| Source-created plus duration crosses DST fall overlap    | Add exact elapsed seconds; no duplicate/ambiguous instant.                                                    |
| Leap day/month/year boundary                             | Exact elapsed seconds; no calendar clamp/recovery.                                                            |
| Leap second occurs                                       | Follow PostgreSQL operational timeline; do not invent TAI/leap adjustment.                                    |
| Tenant or viewer time zone changes                       | Only future display changes; source tuple is byte-for-byte stable.                                            |
| tzdb package changes                                     | Display conversion may change; source instant and eligibility remain fixed.                                   |
| D44 coordinator changes shortly before eligibility       | Clock does not reset; D49 uses current responsibility when it later seals.                                    |
| D44 changes while D49 is indeterminate                   | D49 may later seal current responsibility under D49; D50 tuple never moves.                                   |
| Task is reassigned/completed or gets a user date         | No D50 effect.                                                                                                |
| Notification is read/archived/opened                     | No D50 effect.                                                                                                |
| Worker wakes one instant before eligibility              | Primary DB comparison denies; no source/member handoff.                                                       |
| Worker wakes exactly at eligibility                      | Temporal predicate may pass; all other fences/claim still required.                                           |
| Worker wakes long after eligibility                      | Same tuple; a later founder decision decides whether still useful, never catch-up by convention.              |
| Primary DB clock steps backward after tuple creation     | Fixed tuple remains; claim may occur later and clock-SLO monitor responds.                                    |
| Primary DB clock steps forward                           | Claim must use product fence/monitor; no worker clock override or recomputation.                              |
| Read replica is ahead/behind primary                     | Replica cannot authorize source claim; primary/current product command decides.                               |
| Two due claims race                                      | Product uniqueness/claim yields one winner; timestamp equality is irrelevant.                                 |
| Restore/replay/reprojection occurs                       | Preserve exact tuple; never recompute from restored row age/current policy.                                   |
| Later policy interval changes or turns Off               | Tuple remains immutable; D51 decides prospective/cancellation effect.                                         |

## Failure, recovery, and repair matrix

| Failure point                                        | Safe behavior                                                                    | Recovery evidence                                                 |
| ---------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Before source transaction commit                     | No visible/request temporal effect.                                              | Retry source command under D43/D48 identity rules.                |
| After commit, before response                        | One immutable tuple/receipt exists.                                              | Replay by business idempotency identity.                          |
| Source row commits but temporal intent would not     | Transaction rolls back; no dual truth.                                           | Atomic source/outbox invariant.                                   |
| Immediate executor submission fails after commit     | Source tuple remains authoritative.                                              | Dispatch-ledger recovery submits identifier-only work later.      |
| Executor sleep/run disappears or is disabled         | No source truth is lost.                                                         | Indexed product due-work recovery/claims use eligibility instant. |
| Duplicate event after Inngest's 24-hour dedup window | Event can rerun but product claim prevents duplicate occurrence/effect.          | Permanent DB uniqueness/receipt.                                  |
| Worker uses local clock or stale replica             | Claim is denied by primary source command.                                       | Typed non-authoritative-clock error plus retry.                   |
| Database clock health is outside operational SLO     | New claims are fenced according to runbook; existing tuples remain immutable.    | Clock-offset monitor and primary infrastructure evidence.         |
| API serializes in wrong session zone                 | Source bytes remain safe; response/display is corrected.                         | Canonical UTC serialization test and immutable tuple.             |
| D50 receipt is missing/corrupt/contradictory         | Release nothing; quarantine affected occurrence.                                 | Trusted backups/audit only; no current-age repair.                |
| Provider accepts after request becomes terminal      | Later source/channel fences and provider evidence govern; D50 remains unchanged. | Monotonic source/provider reconciliation.                         |
| Rollback disables feature after tuples exist         | Stop new/unsubmitted claims, retain requests/tuples/receipts/tasks.              | Roll-forward recovery; never erase/recompute history.             |

## UX/UI and user journeys

### Current product — no D50 UI

D50 creates no current setting, helper text, clock, date, countdown, task field,
badge, filter, audit tab, notification, or empty state. Showing one would imply
the optional reminder exists before D46/D47 evidence and activation gates pass.

### Future Tenant administrator journey after every later gate passes

The cadence editor remains in **People & access → Access requests**, beside the
source policy—not in Tasks, Notifications, System Messages, Workflows, or a
generic scheduler. Timing is a read-only consequence of the later code-owned
cadence choice, not another independent control:

> **Timing**
>
> Timing starts when the access request is created. Changing coordinators won't
> restart it.

One secondary **How timing works** disclosure says:

> It uses elapsed time, so weekends and time zone changes don't alter the
> interval. This does not set a due date.

Do not show UTC, seconds, tzdb, source-created, not-before, worker, scheduler,
queue, cron, or Inngest vocabulary in ordinary settings. Do not show a live
clock, calculated backlog date, current-request count, per-request override,
time-zone picker, business calendar, delivery time, or another Save action.

A separately authorized audit view may show **Created**, **Eligible after**,
**Recipient resolution**, and **Delivery evidence** as clearly separated rows.
Each absolute instant uses localized text with an explicit zone/offset and an
unambiguous machine-readable value; it never labels eligibility as due or late.
Ordinary settings/request lists do not need these instants.

### Coordinator journey

- The source lane and existing D44 task remain the primary way to find/action
  work; no countdown or urgency rank changes their behavior.
- A future reminder says only that an access review is still waiting and links
  to freshly authorized current status/actions.
- Coordinator reassignment does not expose or reset a timer. New coordinators
  already receive D44 responsibility/task/update attention.
- A reminder that becomes eligible outside local working hours creates no claim
  that the coordinator was available, notified, or late. Channel presentation
  remains separately governed.
- Opening, reading, or dismissing attention does not change source time.

### Holder, missionary, donor, public, and operations journeys

- The holder sees no reminder countdown, coordinator schedule, staff response
  judgment, or internal eligibility instant. D43 status remains unchanged.
- Missionary/donor/public surfaces receive no D50 facts merely because one
  person has several product roles.
- Operators see minimized durable time evidence only under a purpose-bound,
  audited support path and cannot edit/re-anchor it.
- Search, analytics, AI, exports, and logs cannot turn elapsed time into staff
  performance, risk, neglect, or access-decision inference.

### Accessibility, localization, mobile, and low bandwidth

- Use shared Base Maia/Zinc and semantic `@asym/ui` primitives; no custom
  scheduler/timeline/calendar component.
- Labels/copy remain consistent across settings, audit, Tasks Hub, Notification
  Center, and source detail while preserving each surface's ownership.
- Persistent save/recovery status is programmatically announced without moving
  focus; no per-second countdown or chatty live region exists.
- Prove keyboard/screen-reader operation, visible/unobscured focus, forced
  colors, 320 CSS pixel/400% reflow, zoom, RTL/CJK, and long translations.
- Display formatting uses locale-aware text plus explicit zone/offset where an
  instant is genuinely needed. Relative-only text such as “three days ago” is
  not sufficient audit evidence.
- Low-bandwidth/offline operation loads the source request/task first. Failure
  to load optional timing/audit detail never blocks action and stale client time
  is never presented as authoritative.

## Strongest alternatives

### Tenant-local calendar window from D43 source creation

This is the strongest alternative. It can match a familiar office-day promise,
land at a consistent Tenant-local time, and support an evidence-backed working-
day extension. SailPoint and GitHub demonstrate mature time-zone/day/time
configuration, and Core already has high-quality civil scheduling for donor
recurrence and publication appointments.

It loses for D50 because D43 makes no civil promise. Importing a Tenant access-
operations zone, DST gap/overlap policy, tzdb generations, zone edits, weekend/
holiday calendars, multi-region expectations, preview, and historical repair
would create real debt without user evidence. Reusing ADR-0017's giving zone
would also couple unrelated donor intent to access governance. If representative
ministries later require a civil promise, that is a new governing decision—not
a display tweak.

### Reset elapsed time on every current D44 responsibility generation

This directly reduces the chance that a newly assigned Carla receives D44
responsibility-update attention and a reminder close together. It loses because
route churn could postpone the reminder indefinitely, an administrator could
implicitly snooze temporal behavior by editing coordinators, exact replay would
depend on mutable responsibility history, and D44 would become a second clock
owner. Okta's explicit rule that reassignment does not extend a campaign end
supports keeping those concerns separate. D44 already gives Carla current work
and attention; D50 must not manufacture a reset.

## Full adversarial category review

Every category has a material concern for an unamended “elapsed from commit”
shorthand. The corrected decision and D50 acceptance criteria below supply the
exact permanent language.

| Category                                                      | Material concern? | What could go wrong and why it matters                                                                                                                        | Severity / likelihood  | Evidence or reasoning                                                                                         | Effect on answer                                                            | Permanent fix and exact required language                                                                                                                             |
| ------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Problem validity, necessity, and alternatives                 | **Yes**           | D50 could make an unvalidated reminder appear necessary or select a clock before a real attention problem/value exists.                                       | High / High            | D46 found no representative need; calendar and elapsed models are both modern when their domain promise fits. | Narrows, does not invalidate.                                               | **“D50 defines temporal semantics only; D46 remains the product baseline and no reminder/value activates without the full evidence gate.”**                           |
| Brittleness                                                   | **Yes**           | “Commit time,” `created_at` age, worker clock, session zone, or `interval '1 day'` can produce different instants under locks, DST, restore, and deployments. | Critical / High        | PostgreSQL documents distinct clock functions, UTC conversion, and day/hour differences.                      | Replaces shorthand with an explicit source tuple.                           | **“Capture one DB-generated source-created instant after authoritative prerequisites and derive one fixed-duration eligibility instant once.”**                       |
| Technical debt                                                | **Yes**           | Reusing civil calendar engines, adding a generic scheduler, or reserving dormant fields would create coupled compatibility contracts.                         | High / High            | ADR-0017/0039 solve real civil promises; D50 has none and no runtime yet.                                     | Reduces implementation surface.                                             | **“Add no artifact now; later implement one typed Phase 12 elapsed tuple and product claim without a generic calendar/workflow.”**                                    |
| Edge cases                                                    | **Yes**           | Rollback, lost response, overflow, DST, leap day/second, zone change, clock step, early/late wake, replica lag, and equal timestamps can misfire.             | Critical / High        | Time and distributed execution produce realistic boundary failures globally.                                  | Adds complete matrices and typed invalid-time behavior.                     | **“Every boundary has a deterministic source-owned result; invalid time safely non-admits cadence and never strands D43.”**                                           |
| Footguns                                                      | **Yes**           | Admins/developers could edit anchors, add per-request dates, treat D44 changes as reset, or use current age as repair.                                        | Critical / Medium-high | Generic tasks/schedulers make these shortcuts easy; D47 forbids them.                                         | Adds uniform immutable/no-override rule.                                    | **“No editable anchor, snooze, per-request date, reset, age scan, support override, or timestamp-based uniqueness.”**                                                 |
| Tenant safety                                                 | **Yes**           | Session/worker/cache/replica context could compare or display another Tenant's tuple or route claims across Tenants.                                          | Critical / Medium      | Governing OpenSpec requires server-derived Tenant and isolation in depth.                                     | Adds exact Tenant branding everywhere.                                      | **“Every tuple, claim, event, cache, audit read, and display lookup is same-Tenant/purpose-bound; cross-Tenant outcomes deny uniformly.”**                            |
| Database, RLS, and authorization safety                       | **Yes**           | Caller-supplied timestamps, mutable rows, weak FKs, missing `WITH CHECK`, views, or service bypass could retarget or advance eligibility.                     | Critical / High        | PostgreSQL/Supabase document grants/RLS/owner/BYPASSRLS behavior.                                             | Adds release-blocking persistence/auth constraints without freezing schema. | **“Server-derived immutable instants, same-Tenant composites, finite checks, least grants, RLS mutation parity, and privileged-path reauthorization are mandatory.”** |
| Overengineering                                               | **Yes**           | Time-zone pickers, holiday calendars, recurrence, arbitrary duration, scheduling canvas, and one sleeper per request solve speculative needs.                 | High / High            | One fixed elapsed occurrence needs none; external calendars are richer for different promises.                | Rejects speculative abstractions.                                           | **“One closed duration and one retained instant; no calendar DSL, cron/RRULE, recurrence, or executor-owned timer.”**                                                 |
| UX/UI and user friction                                       | **Yes**           | UTC jargon, countdowns, due/overdue badges, editable dates, or hidden time-zone effects can confuse staff and imply blame/deadlines.                          | High / High            | WCAG requires clear labels/status; D47 meaning is courtesy only.                                              | Adds exact quiet copy and no-UI-now rule.                                   | **“Show only Timing, source anchor/non-reset helper, and no-due disclosure after activation; no countdown/date/urgency surface.”**                                    |
| Source of truth, ownership, and invariants                    | **Yes**           | Task, notification, worker, Inngest, provider, or current policy could become a competing clock.                                                              | Critical / High        | ADR-0183/0027/0026 and workflow OpenSpec separate source and execution.                                       | Clarifies sole temporal owner.                                              | **“Phase 12 D43/D48 owns anchor/duration/eligibility; every later instant is execution or evidence and cannot rewrite it.”**                                          |
| Hidden coupling                                               | **Yes**           | D50 could couple to giving timezone, publication calendar, D44 generation, task fields, channel quiet time, or Inngest limits.                                | High / High            | Those owners and semantics differ.                                                                            | Removes coupling while preserving later seams.                              | **“No other domain/calendar/recipient/channel/executor identity enters D50 arithmetic or occurrence uniqueness.”**                                                    |
| Failure modes                                                 | **Yes**           | Dual-write loss, early execution, late wake, duplicate event, ambiguous response, or clock outage can lose or duplicate effects.                              | Critical / High        | AWS outbox, RFC 9110, and Inngest docs all require durable idempotent recovery.                               | Adds atomic source intent, product claim, and no-release failures.          | **“Commit source tuple plus applicable dispatch intent atomically; every worker rechecks primary source and claims one durable occurrence.”**                         |
| Lifecycle, temporal correctness, concurrency, and idempotency | **Yes**           | Policy/request races, D44 resets, clock boundaries, retry, and later Off edits can jointly move or duplicate the occurrence.                                  | Critical / High        | D48/D49 already require source serialization and stable identity.                                             | Adds immutable tuple and defers cancellation to D51.                        | **“One source tuple per episode, inclusive not-before, exact replay, no reset/recompute, and separately governed cancellation/usefulness.”**                          |
| Data integrity risks                                          | **Yes**           | Null/default/overflowed instants, session-zone round-trip, destructive cascade, or backfill can corrupt historical interpretation.                            | Critical / Medium-high | PostgreSQL typing/constraints can prevent most invalid states; display does not preserve input zone.          | Adds checked finite immutable evidence.                                     | **“No admitted malformed tuple; invalid proof safe-non-admits, deletion is restrictive, and restore preserves exact instants.”**                                      |
| Security and privacy risks                                    | **Yes**           | Timing lists/countdowns/analytics can expose sensitive requests or score coordinator responsiveness; logs/events can leak details.                            | Critical / Medium      | Access work and missionary/member-care contexts may be sensitive; D42/D43 minimize egress.                    | Adds purpose/data minimization.                                             | **“Identifier-only handoffs; no protected details/countdowns/performance inference; full temporal audit is separately authorized and logged.”**                       |
| Scalability and performance risks                             | **Yes**           | Per-request sleepers as sole truth, full age scans, unindexed due queries, or Tenant-wide locks fail at scale.                                                | High / Medium          | D43 corpus is production-shaped; Inngest sleep/dedup have finite product limits.                              | Requires O(1) creation and indexed recoverable claims.                      | **“Derive once at creation; claim via bounded indexed product work with per-Tenant flow control and no full current/terminal scan.”**                                 |
| Operational burden                                            | **Yes**           | Clock ambiguity, manual date repairs, stuck sleeps, and current-age reconstruction create tribal knowledge/direct SQL.                                        | High / Medium          | Durable receipts/outbox and explicit clock semantics make repair deterministic.                               | Adds runbook/repair boundary.                                               | **“Operations inspect immutable tuple/claim/dispatch evidence, never edit time or rebuild from age; clock incidents fence claims.”**                                  |
| Observability and auditability gaps                           | **Yes**           | Logs alone cannot prove source anchor, policy input, eligibility, attempt/seal, or why execution was early/late.                                              | High / High            | Business history differs from executor traces; Inngest history can be shorter than sleeps.                    | Adds durable business evidence and named monitors.                          | **“Persist source/duration/eligibility/receipt; correlate later attempts/effects; traces remain secondary and privacy-minimal.”**                                     |
| Dependency and integration risks                              | **Yes**           | Inngest limits, provider delays, OS/tzdb updates, session zones, and read replicas can silently change behavior.                                              | High / Medium-high     | Official docs expose finite dedup/sleep/history and time-zone mutability.                                     | Keeps dependencies replaceable/subtractive.                                 | **“Executors/providers wake or narrow only; primary product source and claims recover independently of every dependency.”**                                           |
| Migration, rollout, and upgrade risks                         | **Yes**           | Mixed code may treat null as now, recompute old rows, backfill pre-D48 work, or send after rollback.                                                          | Critical / High        | D48 forbids backfill and workflow OpenSpec requires additive rollback-safe adoption.                          | Adds deny-compatible sequencing.                                            | **“Readers deny unknown before writers; no historical backfill; feature stays Off through mixed versions; rollback preserves tuples and stops claims.”**              |
| Testability, traceability, and proof                          | **Yes**           | Tests may mock worker time while missing DB boundary, DST/zone non-effect, RLS bypass, replay, accessibility, or scale.                                       | Critical / High        | D50 spans source DB, executor, UX, and audit seams.                                                           | Adds continuous IDs and production-shaped outcome tests.                    | **“Trace D50 through glossary/ADR/OpenSpec/design/tickets/code/tests/release and prove exact source, negative, race, auth, migration, a11y, and scale outcomes.”**    |
| Other development hazards                                     | **Yes**           | Imports, restore, support, AI, experiments, date libraries, session configuration, or future channels may reinterpret elapsed time.                           | Critical / Medium      | All are outside D50 authority but plausible future entry points.                                              | Adds uniform extension boundary.                                            | **“Any new anchor/arithmetic/calendar/reset requires a new governed decision; ancillary paths cannot mutate or reinterpret D50.”**                                    |

## Final disposition and ruthless synthesis

### Final disposition

**Accept with required amendments.** Option 1 is the clearest, least brittle,
and least debt-producing permanent clock only after “commit time” is sharpened
to one trusted source-created instant retained by the successful D43 transaction,
one exact fixed-duration eligibility instant is derived there, and every later
clock is made explicitly non-authoritative.

### Resolve before recording

Resolved in this document:

1. canonical source-created anchor semantics;
2. exact fixed elapsed versus civil arithmetic;
3. immutable inclusive eligibility instant;
4. source/database versus worker/seal/delivery instants;
5. no D44 reset and no current-policy recomputation;
6. invalid-time safe non-admission;
7. idempotent atomic intent and replaceable executor recovery;
8. Tenant/RLS/privacy, UX, migration, and proof boundaries.

### Capture in the later specification and design

1. Source-created/duration/eligibility tuple and exact invariants.
2. Explicit database capture point/function/precision and fixed-duration resolver
   conforming to D50 semantics.
3. Same-Tenant constraints, immutability, RLS/grants/privileged parity, stable
   occurrence identity, claims, and dispatch recovery.
4. Inclusive primary-database not-before predicate plus early/late/clock-health
   outcomes.
5. Exact instant taxonomy and purpose-limited audit projection.
6. Quiet Base Maia timing copy and complete accessibility/localization proof.
7. Traceability through glossary, ADRs, OpenSpec, design, tasks, GitHub tickets,
   code, tests, and release evidence.

### Require before any implementation or activation

1. Record D51 policy-edit/Off/re-enable semantics, then separately record useful-
   lateness, exact evidence-backed values, and presentation/channel contracts.
2. Revalidate representative need against D46's no-reminder baseline.
3. Deploy deny-compatible readers/authorization/RLS before writers and keep the
   feature Off across mixed versions.
4. Prove clock capture, arithmetic, exact replay, primary-clock/replica fences,
   source/worker races, outbox recovery, privileged parity, and rollback.
5. Meet bounded query/lock/claim/recovery budgets at the D43 production-shaped
   corpus without age scans or sleeper-only recovery.
6. Pass moderated timing/no-deadline comprehension and WCAG 2.2 AA/mobile/RTL/
   CJK/low-bandwidth gates.

### Named monitors without premature telemetry authorization

These are required release/audit signals. D50 does not authorize their runtime
implementation now.

| Signal and threshold                                                                                                                                                                                 | Owner                                        | Response                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `D50-PREMATURE-ARTIFACT-GATE`: any D50 schema/key/job/UI/flag/telemetry/runtime artifact before remaining gates; threshold **> 0**                                                                   | Architecture + Phase 24 docs owner           | Block release, remove artifact, and prove no data/effect was created.                                                       |
| `D50-EARLY-OCCURRENCE-AUDIT`: any D49 terminal seal or reminder handoff while primary DB time is before eligibility; threshold **> 0**                                                               | Phase 12 + IAM + SRE                         | Stop claims, quarantine occurrence, assess disclosure, repair source/claim fence, and re-prove boundaries.                  |
| `D50-REPLAY-DRIFT-AUDIT`: same D43 episode/receipt returns a different source-created/duration/eligibility tuple; threshold **> 0**                                                                  | Data Integrity + Phase 12                    | Disable blind retry, preserve original committed receipt, quarantine conflict, and repair idempotency.                      |
| `D50-CURRENT-POLICY-RECOMPUTE-AUDIT`: any due/repair path derives eligibility from current policy plus `created_at`; threshold **> 0**                                                               | Phase 12 + Data Integrity                    | Stop path, restore retained tuple authority, inspect affected work, and add architecture/negative tests.                    |
| `D50-D44-RESET-AUDIT`: any responsibility/route/assignment change moves an eligibility instant; threshold **> 0**                                                                                    | IAM + Access Product                         | Freeze writer, restore original tuple, audit affected occurrences, and repair coupling.                                     |
| `D50-TIMEZONE-REINTERPRETATION-AUDIT`: any Tenant/viewer/session/tzdb/DST change alters retained source bytes; threshold **> 0**                                                                     | Data Platform + Phase 12                     | Stop mutation, restore immutable value, correct display-only path, and re-prove.                                            |
| `D50-INVALID-TEMPORAL-PROOF-AUDIT`: any invalid duration/overflow creates an admitted tuple or blocks D43; threshold **> 0**                                                                         | Phase 12 + Data Integrity                    | Fence cadence path, preserve D43 via safe non-admission, quarantine malformed work, and repair validation.                  |
| `D50-NONPRIMARY-CLOCK-AUDIT`: any occurrence claim authorized by client/app/worker/cache/replica/provider time without primary DB reproof; threshold **> 0**                                         | Security + SRE + Workflow Platform           | Stop claimant, route through product command, audit effects, and add negative tests.                                        |
| `D50-PRIMARY-CLOCK-OFFSET`: absolute primary DB clock offset exceeds **5 seconds for two consecutive 1-minute samples**                                                                              | SRE + Database Platform                      | Fence new reminder claims, investigate/synchronize clock and failover topology, then resume only after two healthy samples. |
| `D50-DUPLICATE-OCCURRENCE-AUDIT`: more than one source occurrence/effect for one stable Tenant/environment/D43 episode/class; threshold **> 0**                                                      | Data Integrity + Workflow Platform           | Stop dispatch, quarantine duplicates, preserve first valid receipt/provider evidence, and repair uniqueness/claims.         |
| `D50-SLEEPER-ONLY-RECOVERY-GATE`: disabling executor leaves due product work undiscoverable by ledger/indexed recovery; threshold **> 0**                                                            | Workflow Platform + SRE                      | Block release, add product-owned recovery, and prove executor replacement/disablement.                                      |
| `D50-PII-TIME-EGRESS-AUDIT`: protected request/member data or individual responsiveness score enters event/log/cache/analytics/AI; threshold **> 0**                                                 | Privacy + Security                           | Stop egress, purge where supported, assess exposure, minimize contract, and re-prove.                                       |
| `D50-UX-MISCONCEPTION-GATE`: any moderated participant interprets timing as Due/Overdue/SLA/access consequence or coordinator reset in the release sample; threshold **> 0 critical misconceptions** | UX Research + Accessibility + Access Product | Block activation, revise copy/placement, and repeat across required cohorts.                                                |
| `D50-REMAINING-TIME-GATES`: any policy edit/Off/re-enable outcome before D51 or any useful-lateness outcome before its separate later founder decision; threshold **> 0**                            | Access Product + Architecture                | Freeze/remove inference, preserve immutable D50 tuple, and record the missing decision.                                     |
| `D50-TRACEABILITY-GATE`: any conflicting anchor/unit/eligibility/owner statement across governing artifacts; threshold **> 0**                                                                       | Phase 24 docs owner                          | Block handoff, reconcile artifacts, and repeat semantic/identifier checks.                                                  |

## Research assertions

### Repository and governing facts

- **D50-RA001 — Repository fact:** Core currently ships no D43 request, D47
  access-review cadence, D48 admission, D49 recipient cohort, or D50 eligibility
  instant.
- **D50-RA002 — Repository fact:** The root glossary defines the D50 eligibility
  instant as immutable, finite, UTC, request-anchored, elapsed, and explicitly
  not a physical commit timestamp, age scan, civil deadline, or worker time.
- **D50-RA003 — Repository fact:** D43 makes Phase 12 the authoritative owner of
  one exact request episode, source transaction, lifecycle, and receipt.
- **D50-RA004 — Repository fact:** D47 permits only a possible future evidence-
  admitted default-Off cadence and deliberately chooses no numeric value.
- **D50-RA005 — Repository fact:** D47 permits at most one stable courtesy-
  reminder occurrence per exact D43 request episode/reminder class.
- **D50-RA006 — Repository fact:** D47 gives the reminder no Due, Overdue, SLA,
  escalation, expiry, no-response action, priority, or access consequence.
- **D50-RA007 — Repository fact:** D48 admits only genuine post-boundary D43
  creation episodes and forbids current-request age-in/backfill.
- **D50-RA008 — Repository fact:** D48 requires invalid optional cadence proof to
  safely non-admit the cadence without stranding the valid D43 request.
- **D50-RA009 — Repository fact:** D49 consumes the exact current D44
  responsibility generation at the one source occurrence; configured rosters,
  tasks, and channels are not recipient truth.
- **D50-RA010 — Repository fact:** D49's canonical terminal/nonterminal states
  include `sealed_members`, `sealed_proved_zero`, and
  `recipient_resolution_indeterminate`.
- **D50-RA011 — Repository fact:** Phase 12 owns access-request policy, trusted
  source ordering, recipient generations, occurrences, authorization, and
  immutable receipts.
- **D50-RA012 — Repository fact:** ADR-0184 requires current purpose-bound
  EffectiveAccess and same-Tenant Active Tenant Assignment rather than role-
  label or broad runtime authorization.
- **D50-RA013 — Repository fact:** ADR-0183 makes Tasks Hub a projection that
  cannot own reminders, recurrence, source time, or access outcome.
- **D50-RA014 — Repository fact:** ADR-0027 makes notification presentation and
  engagement downstream evidence, not source/task truth.
- **D50-RA015 — Repository fact:** ADR-0026 makes the product source own temporal
  eligibility and prohibits Delivery Plans from inventing waits/recurrence.
- **D50-RA016 — Repository fact:** Workflow OpenSpec keeps product records,
  authorization, dispatch ledger, and work claims authoritative over Inngest.
- **D50-RA017 — Repository fact:** Workflow events are identifier-only and must
  exclude full records, secrets, rendered content, and broad CRM payloads.
- **D50-RA018 — Repository fact:** Identity-and-access OpenSpec resolves identity,
  Tenant, role, memberships, and capabilities server-side and enforces RLS in
  depth.
- **D50-RA019 — Repository fact:** Platform boundaries keep permission-sensitive
  operational workflow in CRM and prohibit public/CMS/donor/missionary/AI
  shortcuts from widening authority.
- **D50-RA020 — Repository fact:** ADR-0017 intentionally uses civil dates and a
  frozen giving zone because recurring giving is a donor calendar promise.
- **D50-RA021 — Repository fact:** ADR-0039 intentionally pins civil input and a
  resolved UTC instant because staff explicitly choose a local publication
  appointment.
- **D50-RA022 — Repository fact:** Core frontend rules require shared `@asym/ui`,
  Base UI, Base Maia/Zinc semantics, accessible forms/status, and no app-local
  component fork.
- **D50-RA023 — Repository fact:** Phase 17 has no admitted access-review reminder
  key, content, recipient plan, or presentation runtime before D50/later gates.
- **D50-RA024 — Repository fact:** Current generic task timers, contribution
  approval timers, donor schedules, document appointments, and demo bell content
  have different owners and are nonprecedent.

### Verified current external facts

- **D50-RA025 — Verified external fact:** PostgreSQL `timestamptz` converts input
  to UTC and stores an instant without retaining the originally supplied zone.
- **D50-RA026 — Verified external fact:** PostgreSQL renders `timestamptz` in the
  current session `TimeZone`, so output formatting can differ without changing
  the stored instant.
- **D50-RA027 — Verified external fact:** PostgreSQL documents that one calendar
  `day` can differ from 24 hours across DST and stores interval month/day/
  microsecond fields separately.
- **D50-RA028 — Verified external fact:** PostgreSQL
  `transaction_timestamp()`/`CURRENT_TIMESTAMP` represent transaction start,
  not physical commit.
- **D50-RA029 — Verified external fact:** PostgreSQL `statement_timestamp()`
  represents statement receipt/start while `clock_timestamp()` changes during
  statement execution.
- **D50-RA030 — Verified external fact:** PostgreSQL `SERIALIZABLE` rejects
  read/write patterns that cannot correspond to one serial execution and
  requires whole-transaction retry.
- **D50-RA031 — Verified external fact:** PostgreSQL RLS distinguishes `USING`
  and `WITH CHECK`; owners/`BYPASSRLS` need deliberate treatment.
- **D50-RA032 — Verified external fact:** Supabase grants and RLS are separate,
  views may bypass expected policy behavior, and secret/service roles bypass
  RLS.
- **D50-RA033 — Verified external fact:** RFC 3339 defines unambiguous Internet
  timestamps, a day as 24 hours, and leap-second representation.
- **D50-RA034 — Verified external fact:** IANA tzdb changes as governments change
  time-zone boundaries, UTC offsets, and DST rules and those updates propagate
  through software releases.
- **D50-RA035 — Verified external fact:** SailPoint access-request reminder
  settings include days-after-request, frequency, times, time zone, and schedule
  preview.
- **D50-RA036 — Verified external fact:** SailPoint reminder/escalation/timeout
  changes apply only to requests created after the change; pending requests
  retain submission-time configuration.
- **D50-RA037 — Verified external fact:** Microsoft Entra can remind reviewers
  halfway through the configured review duration.
- **D50-RA038 — Verified external fact:** Microsoft Entra documents that actual
  processing of a configured review start may be delayed by hours.
- **D50-RA039 — Verified external fact:** Okta explicitly states that reassigning
  a review item does not extend its campaign end date.
- **D50-RA040 — Verified external fact:** GitHub scheduled reminders use
  configured schedules/time zones and evaluate current open review work.
- **D50-RA041 — Verified external fact:** Contentful's task reminder is tied to a
  real task due date and sent two days before it.
- **D50-RA042 — Verified external fact:** Blackbaud Grantmaking separately models
  reviewer due/acceptance dates and visibility windows.
- **D50-RA043 — Verified external fact:** Inngest `step.sleepUntil()` can durably
  resume work at a future date/time without active concurrency consumption.
- **D50-RA044 — Verified external fact:** Inngest persists successful step state
  and independently retries failed steps across interruptions.
- **D50-RA045 — Verified external fact:** Inngest event/function idempotency keys
  deduplicate for 24 hours rather than permanently.
- **D50-RA046 — Verified external fact:** AWS transactional-outbox guidance
  atomically stores source change and event intent and requires idempotent
  consumers because duplicates can occur.
- **D50-RA047 — Verified external fact:** RFC 9110 says automatic retry of a non-
  idempotent operation is unsafe unless application semantics are idempotent or
  non-application is known.
- **D50-RA048 — Verified external fact:** WCAG requires descriptive labels,
  programmatically determinable status without forced focus, and 320 CSS pixel/
  400% reflow for ordinary responsive content.

### Corrected decision and temporal invariants

- **D50-RA049 — Product judgment:** Request-anchored fixed elapsed time best fits
  one optional courtesy occurrence with no civil-date or office-calendar
  promise.
- **D50-RA050 — Requirement inference:** The anchor is one trusted database-
  generated D43 source-created instant retained only by the successful source
  transaction.
- **D50-RA051 — Requirement inference:** The anchor is not a physical commit
  timestamp, automatic transaction-start value, browser/app/worker time, HTTP
  timing, or later `created_at` scan.
- **D50-RA052 — Product judgment:** Capture occurs after the command wins
  authoritative blocking Tenant/policy/request/admission prerequisites; exact
  Postgres function/precision is explicit later design.
- **D50-RA053 — Requirement inference:** Rollback/noncommit leaves no anchor,
  admission tuple, eligibility instant, occurrence, or temporal handoff.
- **D50-RA054 — Requirement inference:** Committed lost-response replay returns
  the identical source-created/duration/eligibility tuple and receipt.
- **D50-RA055 — Requirement inference:** The exact bounded finite positive
  duration and policy version are pinned by D47/D48 admission and never read
  from current policy during due work.
- **D50-RA056 — Product judgment:** D50 selects no number and rejects free-form,
  floating, cron, RRULE, month, civil, or Tenant-authored durations.
- **D50-RA057 — Product judgment:** A future approved “day” is exactly 86,400
  elapsed PostgreSQL/POSIX-style seconds, not a calendar/business day.
- **D50-RA058 — Requirement inference:** Phase 12 derives and retains one finite
  UTC-normalized eligibility instant once inside the successful source
  transaction without precision loss relative to the chosen authoritative
  representation.
- **D50-RA059 — Requirement inference:** Missing/invalid/nonpositive/
  unsupported/overflowed temporal proof safely non-admits cadence without
  failing D43 or creating downstream work.
- **D50-RA060 — Requirement inference:** Source-created and eligibility instants
  are immutable and cannot be recomputed from current policy/age.
- **D50-RA061 — Product judgment:** Equality satisfies the temporal not-before
  predicate; every other source/authorization/lifecycle fence remains required.
- **D50-RA062 — Requirement inference:** Only the primary product database's
  current time can authorize the temporal predicate at claim.
- **D50-RA063 — Requirement inference:** An early worker/sleep/cron must produce
  no effect and leave product work safely recoverable.
- **D50-RA064 — Requirement inference:** A late worker does not move the instant
  or create catch-up by convention; D51 governs policy lifecycle and a later
  separate founder decision governs useful-lateness.
- **D50-RA065 — Requirement inference:** D49 attempts/seal occur at or after
  eligibility and never become the D50 anchor.
- **D50-RA066 — Requirement inference:** D49
  `recipient_resolution_indeterminate` retries preserve the same D50 tuple and
  stable occurrence.
- **D50-RA067 — Requirement inference:** D44 responsibility/route/assignment
  changes never begin, pause, extend, or reset D50.
- **D50-RA068 — Requirement inference:** Task creation/age/assignment/date/
  completion/engagement never starts, satisfies, or changes D50.
- **D50-RA069 — Requirement inference:** Notification, channel, provider,
  preparation, presentation, acceptance, and delivery instants are downstream
  evidence only.
- **D50-RA070 — Requirement inference:** Tenant/browser/viewer/provider zones,
  DST, weekend, holiday, locale, and tzdb changes never alter source bytes.
- **D50-RA071 — Requirement inference:** APIs/receipts use one unambiguous
  canonical instant representation without precision loss relative to source;
  exact storage/wire format remains design-neutral and viewer rendering is
  derived only.
- **D50-RA072 — Product judgment:** Viewer-local display may include explicit
  zone/offset for comprehension but never round-trips as write authority.
- **D50-RA073 — Product judgment:** Core follows PostgreSQL's no-leap-second
  operational timeline; no TAI/leap-second engine is justified for this nudge.
- **D50-RA074 — Requirement inference:** Successful source creation atomically
  retains request/admission/time tuple/receipt and any applicable identifier-
  only temporal-intent dispatch, but no D49 member/channel handoff.
- **D50-RA075 — Requirement inference:** Occurrence identity is a stable business
  key independent of every timestamp; timestamps never deduplicate work.
- **D50-RA076 — Requirement inference:** Dispatch-ledger/outbox recovery submits
  identifier-only temporal intent after commit and never recalculates time.
- **D50-RA077 — Requirement inference:** Inngest is an optional wake/retry
  executor; product records, due recovery, claims, and receipts survive its
  disablement/limits.
- **D50-RA078 — Requirement inference:** Automatic occurrence uses a registered
  product/system source purpose and server-derived actor/context, not human
  policy-manager impersonation.
- **D50-RA079 — Requirement inference:** Future storage and every path preserve
  non-null Tenant, same-Tenant composites, finite checks, immutability, least
  grants, RLS mutation parity, and privileged authorization.
- **D50-RA080 — Requirement inference:** D50 creates no artifact now and leaves
  D51, values, usefulness, content, channels, and activation proof unresolved.

### UX, security, failure, migration, and operations

- **D50-RA081 — Product judgment:** No D50 UI exists while the reminder remains
  inactive and downstream decisions are unresolved.
- **D50-RA082 — Product judgment:** Future source settings use **Timing** with
  **Timing starts when the access request is created. Changing coordinators
  won't restart it.**
- **D50-RA083 — Product judgment:** One secondary disclosure says **It uses
  elapsed time, so weekends and time zone changes don't alter the interval.
  This does not set a due date.**
- **D50-RA084 — Product judgment:** Ordinary UX omits UTC/seconds/tzdb/source-
  created/not-before/worker/scheduler/Inngest jargon.
- **D50-RA085 — Requirement inference:** Ordinary UX has no countdown, due/
  overdue badge, local date promise, editable anchor, per-request override,
  time-zone picker, business calendar, or second Save.
- **D50-RA086 — Product judgment:** Purpose-authorized audit separates Created,
  Eligible after, Recipient resolution, and Delivery evidence instead of one
  ambiguous timestamp.
- **D50-RA087 — Product judgment:** Coordinator copy never implies lateness,
  office availability, prior notification, neglect, or access consequence.
- **D50-RA088 — Product judgment:** Holders, missionaries, donors, and public
  users see no internal reminder clock or staff-response timing.
- **D50-RA089 — Product judgment:** Low-bandwidth/offline source lane/task works
  before optional timing/audit detail and never trusts client time.
- **D50-RA090 — Requirement inference:** Future UI proves descriptive labels,
  semantic/persistent restrained status, keyboard/screen-reader behavior,
  320px/400% reflow, forced colors, RTL/CJK, and long localization.
- **D50-RA091 — Requirement inference:** Absolute audit display includes
  locale-aware text plus explicit zone/offset and an unambiguous machine value;
  relative-only text is insufficient.
- **D50-RA092 — Requirement inference:** Events/logs/caches/search/analytics/AI
  carry no protected request/member detail or individual responsiveness score.
- **D50-RA093 — Requirement inference:** Full temporal audit is purpose-bound,
  read-audited, retention/export/deletion-controlled, and never a write path.
- **D50-RA094 — Requirement inference:** Source derivation is O(1) per new request
  with no current/terminal request scan.
- **D50-RA095 — Requirement inference:** Future due recovery is indexed/bounded,
  product-claimed, Tenant-flow-controlled, and independent of one sleeper per
  request.
- **D50-RA096 — Requirement inference:** Executor disablement cannot make due
  product work undiscoverable; dispatch ledger/indexed recovery remains.
- **D50-RA097 — Requirement inference:** Read replicas, caches, and executor state
  may support observation but cannot authorize the source claim.
- **D50-RA098 — Product judgment:** A primary DB absolute clock offset over five
  seconds for two consecutive minute samples fences new reminder claims until
  health recovers.
- **D50-RA099 — Requirement inference:** Restore/replay/reprojection preserves
  exact retained tuples and never recomputes from age/current policy.
- **D50-RA100 — Requirement inference:** Rollback stops new/unsubmitted claims
  while retaining D43/D44 work, tuples, receipts, audit, and accepted effects.
- **D50-RA101 — Requirement inference:** Mixed-version readers treat missing/
  unknown/unsupported temporal evidence as no-release, never “eligible now.”
- **D50-RA102 — Requirement inference:** No migration/backfill creates D50 tuples
  for pre-D48 or existing pending requests.
- **D50-RA103 — Requirement inference:** Invalid temporal proof uses D48 safe
  non-admission and cannot transform a valid D43 request into a failed command.
- **D50-RA104 — Requirement inference:** Operations quarantine and reconcile
  from immutable tuple/receipt/claim/dispatch evidence; they never edit time or
  run current-age repair.

### Proof, assumptions, unknowns, and next decision

- **D50-RA105 — Requirement inference:** Design/tests explicitly choose and
  verify the Postgres capture point/function/precision after authoritative
  blocking prerequisites.
- **D50-RA106 — Requirement inference:** Property tests prove fixed arithmetic
  across DST, zones, leap days, month/year boundaries, and tzdb changes without
  source drift.
- **D50-RA107 — Requirement inference:** Deterministic barriers prove one instant
  before, exactly equal, and one instant after eligibility against primary DB
  time.
- **D50-RA108 — Requirement inference:** Lost-response/noncommit retries prove
  original committed tuple stability and no duplicate episode/occurrence.
- **D50-RA109 — Requirement inference:** D48 policy-publication/request-creation
  races prove one admitted policy/duration/anchor result.
- **D50-RA110 — Requirement inference:** D44 change races prove byte-for-byte
  unchanged D50 tuple and no hidden reset.
- **D50-RA111 — Requirement inference:** Early/late/missing/duplicate/out-of-
  order executor tests prove source recheck, no early effect, and no worker
  re-anchor.
- **D50-RA112 — Requirement inference:** Duplicate events after Inngest's 24-hour
  window still converge through permanent product uniqueness/claims.
- **D50-RA113 — Requirement inference:** Ordinary and owner/service/
  security-definer/worker/support paths produce equivalent authorization/RLS
  results.
- **D50-RA114 — Requirement inference:** Cross-Tenant, forged time, forged policy,
  stale replica, and session-zone tests deny uniformly without an existence
  oracle.
- **D50-RA115 — Requirement inference:** Accessibility proof combines automation
  with keyboard/screen-reader/zoom/forced-color/RTL/CJK/low-bandwidth manual
  evidence.
- **D50-RA116 — Requirement inference:** Performance proof covers at least
  100,000 terminal requests in one Tenant and 10,000 current requests across
  many Tenants with indexed claims and no full scan.
- **D50-RA117 — Requirement inference:** D50 terms/IDs trace consistently through
  glossary, ADRs, OpenSpec, design, tasks, GitHub tickets, code, tests, and
  release evidence.
- **D50-RA118 — Assumption:** representative ministries understand elapsed time
  as fixed time from request creation and do not infer business days; moderated
  research must verify this.
- **D50-RA119 — Unresolved unknown:** exact values, D51 policy lifecycle, later
  useful-lateness, stable content, channels, quiet-time, and provider behavior
  remain separately gated.
- **D50-RA120 — Product judgment:** D51 should next decide later non-Off edit,
  Off, and re-enable behavior for already-admitted but not-yet-D49-sealed work,
  because that lifecycle determines whether an immutable eligible instant may
  still produce its one occurrence.

## Falsifiable acceptance criteria

### Source anchor, duration, and eligibility

- **D50-AC001:** The recorded decision selects one fixed elapsed duration from
  the trusted D43 source-created instant for each D48-admitted request episode.
- **D50-AC002:** The source-created instant is database-generated, finite,
  single-valued, retained only by successful D43 creation, and captured at the
  final request write after D48's shared policy/request serialization winner
  and every authoritative blocking prerequisite are proved.
- **D50-AC003:** Neither prose nor implementation equates the source-created
  instant with physical commit time, transaction start by convention, browser/
  app/worker time, HTTP timing, provider time, or later age scan.
- **D50-AC004:** Design names and tests the exact Postgres capture function,
  precision, placement, and bounded transaction path that satisfy D50 semantics.
- **D50-AC005:** A rolled-back/noncommitted creation leaves no anchor,
  eligibility, temporal intent, or occurrence.
- **D50-AC006:** A committed lost-response replay returns the exact original
  request/admission/source-created/duration/eligibility tuple and receipt.
- **D50-AC007:** The duration is one supported bounded finite positive code-owned
  value/version admitted by D47/D48; free-form/float/cron/RRULE/month/civil/
  custom inputs are rejected.
- **D50-AC008:** Any future choice described in days proves exactly 86,400
  elapsed PostgreSQL/POSIX-style seconds per day and never calendar/business-day
  arithmetic.
- **D50-AC009:** Checked arithmetic derives one finite UTC-normalized eligibility
  instant once inside the same successful source transaction with no precision
  loss relative to the chosen authoritative representation.
- **D50-AC010:** Missing/nonpositive/unsupported/contradictory/overflowed time
  proof commits D43 through typed cadence safe non-admission and creates no
  temporal/member/reminder handoff.

### Source versus execution/evidence instants

- **D50-AC011:** Source-created/duration/eligibility evidence is immutable and
  cannot be updated or recalculated from current policy/time/age.
- **D50-AC012:** Later policy edits may only act through a ratified lifecycle;
  they never rewrite D50 instants or occurrence identity.
- **D50-AC013:** Temporal predicate is false before and inclusive true at/after
  eligibility using trusted primary DB time, subject to all other fences.
- **D50-AC014:** Browser, app server, Node process, worker, cron host, cache,
  replica, device, provider, and integration clocks cannot authorize a claim.
- **D50-AC015:** A read replica never performs the authoritative eligibility/
  occurrence mutation even when its timestamp appears current.
- **D50-AC016:** Early wake/claim releases no D49 member/reminder work and leaves
  the stable product occurrence safely recoverable.
- **D50-AC017:** Late/missing wake preserves the original tuple and invokes only
  later-ratified usefulness/cancellation; it never reanchors or catches up by
  age.
- **D50-AC018:** D49 resolution/seal occurs only after eligibility and its
  attempt/seal timestamps never start/reset D50.
- **D50-AC019:** Every D44 route/responsibility/assignment/eligibility change
  leaves source-created/duration/eligibility bytes unchanged.
- **D50-AC020:** Task, notification, channel, provider, presentation, acceptance,
  and delivery timestamps never start/satisfy/reset/alter D50.

### Serialization, idempotency, failure, and recovery

- **D50-AC021:** API/receipt machine values use one unambiguous canonical instant
  representation, independent of database session/display zone and without
  precision loss relative to the authoritative value; exact wire/storage format
  remains design work.
- **D50-AC022:** Viewer-local formatting is derived, includes explicit zone/
  offset where needed, and is never accepted back as source authority.
- **D50-AC023:** Leap-second tests/documentation match PostgreSQL's operational
  no-leap-second timeline and do not add a TAI/leap/calendar subsystem.
- **D50-AC024:** Source request/admission/time tuple/receipt and any applicable
  identifier-only temporal dispatch intent commit atomically or not at all.
- **D50-AC025:** D50 source creation emits no D49 member or channel handoff before
  D49 terminal recipient resolution.
- **D50-AC026:** Permanent product uniqueness enforces one occurrence per stable
  Tenant/environment/D43 episode/class independently of every timestamp/event/
  run/channel/provider identity.
- **D50-AC027:** Duplicate/concurrent/out-of-order claims converge on one product
  receipt/effect and never use equal timestamps as uniqueness.
- **D50-AC028:** Dispatch recovery can submit stored identifier-only temporal
  intent after a failed immediate handoff without recalculating time.
- **D50-AC029:** Inngest sleep/retry/disablement/retention/dedup limits cannot
  lose source truth or prevent indexed product recovery.
- **D50-AC030:** Task/notification/generic scheduler/AI/support/import/restore
  paths cannot create, edit, reset, or repair the tuple.

### Tenant, database, RLS, authorization, and privacy

- **D50-AC031:** Tenant, source actor, request/policy heads, duration, instants,
  occurrence identity, and attribution are derived from trusted server/source
  context.
- **D50-AC032:** Every future temporal relation is `tenant_id NOT NULL` and uses
  same-Tenant composites; cross-Tenant access/mutation denies uniformly.
- **D50-AC033:** Database constraints reject nonfinite/out-of-range/invalid-
  order/retargeted/multiple tuples and restrictive deletes preserve history.
- **D50-AC034:** Browser relations have no raw temporal write grant; RLS
  `USING`/`WITH CHECK`, views, RPCs, functions, and grants preserve the same
  boundary.
- **D50-AC035:** Owner/service-role/BYPASSRLS/security-definer/worker/support/
  operator/impersonation paths reapply equivalent authorization and attribution.
- **D50-AC036:** Caller/event/task/notification/provider input cannot nominate
  Tenant, actor, anchor, duration, eligibility, policy head, or occurrence.
- **D50-AC037:** Events/logs/caches/search/analytics/AI contain no protected D43
  prose/provenance/member PII or individual responsiveness score.
- **D50-AC038:** Purpose-authorized audit separates source/eligibility/seal/
  delivery evidence, logs access, obeys retention/export/deletion policy, and is
  never a write authority.
- **D50-AC039:** Session `TimeZone`, locale, DST, tzdb, Tenant setting, or viewer
  preference changes presentation only and never stored tuple bytes.
- **D50-AC040:** Donor/public/missionary/ordinary holder surfaces receive no
  internal D50 clock/audit projection.

### UX, accessibility, performance, and operations

- **D50-AC041:** No D50 UI/control/placeholder ships while the reminder remains
  inactive and downstream decisions are unresolved.
- **D50-AC042:** Future settings label the read-only summary **Timing** with
  **Timing starts when the access request is created. Changing coordinators
  won't restart it.**
- **D50-AC043:** One optional disclosure says **It uses elapsed time, so weekends
  and time zone changes don't alter the interval. This does not set a due
  date.**
- **D50-AC044:** Ordinary UX shows no UTC/seconds/tzdb/source-created/not-before/
  worker/scheduler jargon, countdown, due/overdue, editable anchor/date, time-
  zone picker, business calendar, override, or second Save.
- **D50-AC045:** Coordinator reminder copy remains neutral and never claims
  lateness, fault, neglect, office availability, prior notice, deadline, or
  access consequence.
- **D50-AC046:** Persistent status/recovery is programmatically announced without
  unexpected focus movement; there is no chatty live timer or color-only state.
- **D50-AC047:** Future user-visible surfaces pass keyboard, screen-reader,
  visible/unobscured focus, forced-color, zoom, 320px/400% reflow, RTL/CJK,
  localization, and long-content tests.
- **D50-AC048:** Low-bandwidth/offline failure never blocks source request/task;
  stale client time/timing detail is not presented as authoritative.
- **D50-AC049:** Source derivation is bounded O(1), and due recovery uses indexed
  Tenant-scoped claims with published query/lock budgets and no full age/current/
  terminal scan.
- **D50-AC050:** Operations can correlate one tuple/receipt/dispatch/claim/
  attempt/effect without PII in general logs and without editing/recomputing time.

### Migration, traceability, and remaining gates

- **D50-AC051:** Rollout deploys deny-compatible readers, constraints,
  authorization, and RLS before any writer and keeps the feature Off through
  mixed versions.
- **D50-AC052:** Missing/unknown/unsupported/contradictory D50 evidence is no-
  release, never eligible-now/default duration/current-age inference.
- **D50-AC053:** No migration/backfill creates temporal tuples/intents/
  occurrences for pre-D48 or existing pending requests.
- **D50-AC054:** Rollback stops new/unsubmitted temporal claims while preserving
  D43/D44 work, tuples, receipts, audit, dispatch, and accepted-effect evidence.
- **D50-AC055:** Production-shaped proof includes at least 100,000 terminal
  requests in one Tenant and 10,000 current requests across many Tenants plus
  clock/claim/dispatch contention without unbounded scan/noisy-neighbor leakage.
- **D50-AC056:** Positive, negative, boundary, time, authorization, concurrency,
  idempotency, migration, rollback, recovery, accessibility, privacy,
  performance, and production-shaped tests assert domain/user outcomes rather
  than one SQL/executor implementation.
- **D50-AC057:** D50 terminology, decision, invariants, RA/AC IDs, and evidence
  trace consistently through glossary, ADRs, OpenSpec, design, tasks, GitHub
  tickets, code, tests, and release proof.
- **D50-AC058:** Every named monitor retains exact signal, threshold, owner, and
  response; monitor specification authorizes no telemetry artifact now.
- **D50-AC059:** No implementation begins before D51 policy lifecycle, the later
  separate useful-lateness decision, exact evidence-backed values, content/
  channel decisions, D46 validation, and source-specific OpenSpec/design/
  rollout proof are complete.
- **D50-AC060:** Focused verification finds exactly 120 continuous unique D50
  research assertions, exactly 60 continuous unique D50 acceptance criteria,
  all 22 adversarial categories, no runtime/OpenSpec/schema artifact, and
  exactly one next D51 question.

## D51 — How should later cadence changes affect admitted but not-yet-irreversible work?

### Why this is the next decision

Hope Mission has an active future cadence and several D48-admitted requests.
One occurrence is still waiting before eligibility; another is temporally
eligible but `recipient_resolution_indeterminate`; a third has sealed D49
members but no presentation/provider step has crossed an irreversible boundary.
The Tenant first changes the non-Off interval, then turns reminders Off during
a sensitive season, and later re-enables them.

D50 proves that none of those commands may rewrite a source-created or
eligibility instant. D51 must now decide whether old active policy generations
continue, cancel, or rebase before recipient seal and whether Off suppresses a
sealed occurrence whose presentation/provider step is not yet irreversible.
This is both safety and UX:
an **Off** control that still permits unsent old reminders is surprising, while
retroactively recomputing all pending instants creates the exact backfill/
reschedule debt D48/D50 rejected.

SailPoint applies reminder configuration changes only to future requests and
lets pending requests retain their submission-time configuration. [SailPoint
reminder policy](https://documentation.sailpoint.com/saas/help/requests/config_emails.html)
Microsoft Entra separates edits to the current review from edits to future
series instances, showing that current and prospective effects are independent
governed choices. [Microsoft Entra access reviews](https://learn.microsoft.com/en-us/entra/id-governance/create-access-review)
Stripe preserves immutable Price history and requires a separate explicit
subscription update for existing subscriptions, while HubSpot says enabling
re-enrollment does not retroactively enroll records. [Stripe price management](https://docs.stripe.com/products-prices/manage-prices)
[HubSpot re-enrollment](https://knowledge.hubspot.com/workflows/add-re-enrollment-triggers-to-a-workflow)
These products validate prospective non-Off edits and no automatic resurrection
but do not settle what Core's privacy/safety **Off** must mean. Core must resolve
that conflict explicitly rather than import SailPoint/Stripe continuation into
a sensitive optional attention feature.

Every option preserves immutable D48 admission/D50 instants/history, one source
occurrence identity, no current-request backfill, no second task, and the
historical non-retractability of already provider-accepted effects. D51 chooses
no cadence value, useful-lateness duration, content, or channel.

### Option 1 — prospective non-Off edits; Off stops every not-yet-irreversible prior-generation effect — recommended

A non-Off interval edit applies only to genuinely later D43 requests. Existing
admitted requests retain their immutable original duration/eligibility tuple.
Publishing Off creates a monotonic source fence that terminally cancels every
not-yet-D49-sealed occurrence admitted under prior active generations,
including `recipient_resolution_indeterminate`, and suppresses every not-yet-
irreversible descendant of an already sealed occurrence. Cancellation releases
no new member or reminder handoff; an already provider-accepted effect remains
historical and cannot be recalled. Re-enabling applies only to later genuine
requests and never resurrects canceled or suppressed work.

**UX/impact:** changing a value has predictable prospective scope, while **Off**
truthfully stops every reminder effect that has not crossed its irreversible
boundary. Re-enable cannot cause a backlog burst. The cost is a deliberately
asymmetric rule—Off is a safety stop, not merely another prospective value—which
must be stated clearly in preview/confirmation and proved without a fragile
row-by-row partial fanout.

### Option 2 — every edit, including Off, is prospective only

All admitted requests and sealed-but-unpresented occurrences retain their
original cadence behavior. Off prevents only later requests from being
admitted; old occurrences may still seal and later present.

**UX/impact:** this is the simplest immutable-version rule and most closely
resembles SailPoint's pending-request behavior. It is weaker operationally and
for privacy because an administrator choosing **Off** may reasonably believe no
new reminder will appear. Explaining “Off, except previously admitted unsent
reminders” adds friction and makes emergency stop behavior unreliable.

### Option 3 — rebase or pause every admitted current effect on each policy edit

Every interval change or re-enable recalculates/reschedules admitted unsealed
requests from their original source-created instant; Off pauses them and any
sealed-but-unpresented descendants until another edit.

**UX/impact:** current policy appears globally consistent, but it rewrites
operational expectations, can make requests immediately eligible, creates
backlog bursts, needs Tenant-wide preview/atomic migration/recovery, and risks a
policy-version change minting or resurrecting occurrences. It is the most
brittle and debt-heavy option.

### Recommendation and exact question

**Recommend Option 1 — prospective non-Off edits, with Off as a monotonic safety
cancellation/suppression for every prior-generation effect that is not yet
irreversible; re-enable applies only to later genuine requests.** It preserves
immutable D50 history, gives Off an honest safety meaning, and prevents both
retroactive rescheduling and re-enable catch-up. Option 2 is the strongest
alternative but makes Off operationally surprising. Option 3 contradicts
D48/D50's prospective/immutable boundaries.

**Which D51 lifecycle should Core record: Option 1 — prospective non-Off edits
plus monotonic Off cancellation/suppression of all not-yet-irreversible prior-
generation effects, Option 2 — all edits including Off are prospective only,
or Option 3 — rebase/pause all admitted current work on every edit?** You may
amend any option.

## Evidence limits

- PostgreSQL/IANA evidence proves elapsed and civil semantics differ; it does not
  establish ministry demand or a cadence value.
- “UTC” in product prose follows PostgreSQL's conventional instant semantics;
  PostgreSQL does not model leap seconds, which is explicitly documented.
- IAM/CMS/nonprofit products demonstrate both elapsed/window and calendar/due-
  based reminders. None proves Core's exact non-deadline semantics.
- Inngest proves useful execution capabilities and finite dedup/observability
  limits; it is not evidence that Core should select it or store source truth
  there.
- AWS outbox guidance proves the dual-write boundary, not a particular Core
  schema/queue/worker.
- WCAG guidance establishes accessibility outcomes, not exact Base Maia
  component composition.
- The five-second primary-clock monitor threshold is a conservative product/SRE
  guard for this non-money courtesy path and must be reconciled with the final
  hosting clock SLO before activation.
- Representative ministry comprehension, timing expectations, attention volume,
  global/mobile/low-bandwidth use, and policy-Off expectations remain mandatory
  research gates.

## Final research disposition

**Accept with required amendments.** Use one trusted database-generated D43
source-created instant, one exact admitted fixed elapsed duration, and one
immutable finite UTC-normalized eligibility instant. Treat primary DB comparison
as the only temporal claim authority and every worker/seal/delivery time as
execution or evidence. Never reset for D44, timezone, DST, task, policy display,
or executor change. Preserve invalid-proof safe non-admission, atomic temporal
intent, product idempotency/recovery, quiet accessible UX, and no runtime
artifact now. Ask D51 next.
