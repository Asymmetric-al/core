# Phase 24 D46 — No Automatic Access-Review Reminder Primary Research

**Date:** 2026-08-29  
**Decision:** Option 1 — no automatic reminder in v1 until a source-owned
temporal requirement exists  
**Status:** Founder-selected decision, adversarially reconciled for specification  
**Scope:** D43 holder direct-grant review, D44 Access request coordinator
responsibility, D45 initial attention, and the permanent admission boundary for
any later reminder

> **Post-D47 historical note (2026-08-29):** Earlier statements in this D46
> research that D47 is unresolved, decides next, or must qualify a candidate
> preserve the D46-time evidence snapshot. Current direction is the dated D47
> resolution below: D47 conditionally admits only an independently validated,
> bounded, default-Off Phase 12 cadence-policy class and activates no reminder
> or artifact. D48 has since limited first application to genuine D43 request
> creations ordered after the first successful non-Off source boundary, with no
> pre-boundary enrollment. D49 has since bound one exact current D44
> responsibility cohort atomically at the source occurrence and permits later
> narrowing only. D50 has since selected one immutable request-anchored elapsed
> eligibility instant from exact seconds and a trusted source-created instant
> captured after D48 serialization; it is no due date or delivery promise. D51
> cancellation is now next.

## Purpose and research standard

D46 decides whether a still-pending D43 access review should create a second,
automatic, timed attention occurrence. The founder selected **no automatic
reminder in v1 until a source-owned temporal requirement exists**. This research
tests that decision against Core's governing ADRs and OpenSpec boundaries,
current repository behavior, current first-party product documentation, modern
notification UX, PostgreSQL temporal/concurrency behavior, and Inngest's actual
capabilities and limits.

This document deliberately does **not** reserve a reminder table, nullable
deadline, enum member, manifest key, Delivery Plan slot, worker, timer, Inngest
function, feature flag, UI control, or migration placeholder. It defines the
proof a later proposal must supply before any of those implementation choices
become legitimate.

Evidence labels are strict:

- **Repository fact:** verified in the current Core repository.
- **Verified external fact:** verified in current official first-party material.
- **Requirement inference:** necessary to preserve a governing Core boundary.
- **Product judgment:** a deliberate Core choice where evidence does not dictate
  one answer.
- **Assumption:** plausible but not established by representative user evidence.
- **Unresolved unknown:** requires research or another founder decision.

## Executive finding

**Disposition: Accept with required amendments.** The selected no-reminder
decision is the strongest permanent v1 path, not a temporary workaround. D43
defines no due date, expiry, SLA, risk transition, ministry cadence, calendar, or
timezone rule from which a truthful reminder instant can be derived. D44 already
keeps pending work in the complete **Access requests** source lane, Tasks Hub,
and a required source-actionable in-product item; D45 may add one optional
Tenant-default-Off initial email. Adding a seven-day timer or Tenant cadence now
would invent urgency, duplicate attention, and create a second temporal authority.

Current products support this distinction rather than one universal cadence:

- Microsoft Entra access-review reminders occur halfway through a configured
  review duration, and entitlement-approval reminders reference a configured
  decision deadline.
- Contentful task reminders derive from an optional due date.
- Microsoft Planner's near/past-due notifications derive from task due dates.
- SailPoint permits request-age reminder schedules only through an explicit
  source configuration that also defines timeout, frequency, send time, and
  timezone, and pins the existing policy to pending requests.
- Salesforce's ordinary approval process has no native reminder; its official
  workaround requires explicit fields and scheduled Flow automation.

These products do not prove Core should never remind. They prove that a reminder
is a business-timing decision owned by the workflow that knows what “late” means,
not a generic notification feature or executor default.

The permanent seam is therefore contractual: a later reminder is admitted only
after Phase 12 owns a real, versioned temporal requirement; its calendar and
lateness semantics are explicit; a new stable reminder meaning creates one
producer-owned occurrence; current source, recipient, and authorization are
re-proved; product-database identity prevents duplicates; cancellation and repair
are defined; and Phase 17 separately governs presentation and channels. Inngest
may then accelerate due work, but Core's source record, due claim, uniqueness,
and reconciliation remain authoritative.

## Exact corrected D46 decision

1. Core creates **no automatic reminder** for a D43 `pending_review` request in
   v1. Request age alone is not a deadline, SLA, risk transition, due date,
   expiry, or authorization to interrupt someone again.
2. D46 adds no reminder occurrence, stable message key, Phase 17 manifest row,
   Delivery Plan slot, Tenant or personal preference, task due date, timer,
   scheduler, queue, cron, Inngest sleep, email, push, digest, escalation,
   fallback recipient, or automatic keep/remove outcome.
3. D46 adds no schema or runtime placeholder for a hypothetical reminder. No
   `remind_at`, `due_at`, `reminder_sent_at`, cadence enum, reminder policy blob,
   generic schedule relation, reserved feature flag, empty manifest entry, or
   disabled UI control is created merely to “keep the door open.”
4. The authoritative D43 request lifecycle remains exactly `pending_review`,
   `withdrawn`, `resolved_kept`, `resolved_removed`, or
   `no_longer_applicable`. D46 changes no transition, grant, capability,
   EffectiveAccess, authorization epoch, retention rule, or decision authority.
5. Pending work remains continuously discoverable through the permission-filtered
   Phase 12 **Access requests** lane, its source-backed Tasks Hub projection, and
   the required D44/Phase 17 in-product item. D45's optional initial email remains
   independently governed and is never replayed as a reminder.
6. Tasks Hub stays a work projection, not the temporal source. D46 adds no Due,
   Overdue, Snooze, Remind, recurrence, or task-owned timer control to the
   source-backed task and does not create a second task.
7. Notification Center keeps the original source-actionable item; request age
   does not reopen unread, create another item, extend an ended item, or imply
   the coordinator ignored it.
8. D46 retains only the exact localized source-owned submitted timestamp already
   required by D43 where authorized. It adds no relative-age badge, derived-age
   sort/filter, countdown, or aging emphasis. Core does not label a request
   **Due**, **Overdue**, **Late**, **Escalated**, or **Reminder scheduled** without
   an admitted source temporal fact.
9. No automatic reminder is inferred from Tenant timezone, locale, work week,
   calendar, role, task preference, email preference, coordinator policy,
   request creation time, elapsed age, provider state, analytics, or another
   domain's reminder/SLA configuration.
10. Current finance-specific contribution reminder code remains isolated
    migration input. D43–D46 cannot reuse its keys, tables, roles, deadlines,
    recipients, tasks, or Inngest behavior as access-governance authority.
11. Enabling D43–D45, changing coordinators, changing email plan/preference,
    repairing contact/readiness, deploying D46, or migrating current requests
    creates no reminder or historical/backfill attention.
12. Separately approved, privacy-reviewed, time-bounded product research may
    use already-permitted aggregate pending-age or attention-gap facts. D46 adds
    no telemetry pipeline, and measurement never creates a deadline, message,
    recipient, escalation, priority score, staff-performance score, or action.
13. A future automatic reminder is inadmissible until Phase 12 owns a source-
    authoritative, separately ratified temporal requirement or policy and proves
    why a reminder is necessary for that source lifecycle. D47 separately decides
    whether a validated Tenant cadence may qualify without a due instant, expiry,
    or risk transition.
14. A future proposal must define one stable reminder business meaning. Because
    “this still needs attention at the admitted source time” differs from initial
    assignment, Phase 17 registers one new stable message key bound to one new
    producer-owned source occurrence; it is not a resend of D44/D45 and not a
    channel-specific duplicate.
15. Before admission, the source must define exact temporal type, authoritative
    clock, calendar-day versus elapsed-duration semantics, named IANA timezone
    authority, daylight-saving gap/overlap behavior, weekend/holiday behavior,
    not-before instant, useful-lateness/expiry window, policy revision, change/
    cancellation behavior, migration behavior, and finite occurrence ceiling.
16. A future due operation creates at most one durable semantic occurrence per
    exact Tenant, source episode/head, temporal-requirement revision, reminder
    meaning/version, and admitted ordinal. Product-database uniqueness and an
    atomic source command own this invariant; event IDs, Inngest runs, provider
    keys, task IDs, and notification IDs do not.
17. At due-claim and again before every presentation or external submission, the
    system re-proves the exact D43 request is still pending, the temporal
    requirement/head remains current, the D44 recipient generation is current,
    the requester remains excluded, and every recipient has current same-Tenant
    source visibility and decision authorization. False, absent, stale, partial,
    contradictory, timed-out, or indeterminate proof yields no new effect.
18. Source withdrawal, keep/remove, no-longer-applicable transition, temporal-
    requirement replacement/removal, assignment end, recipient loss, or
    authorization loss cancels or suppresses uncommitted/not-yet-presented work
    under its exact fence. A committed historical occurrence is not rewritten;
    provider-accepted delivery is non-retractable and its destination resolves
    current truth safely.
19. Phase 17 separately decides whether an admitted reminder has in-product or
    external delivery steps, their requiredness, preferences, suppression,
    rendering, accessibility, and provider proof. A source reminder occurrence
    does not itself authorize a channel, and a channel addition does not create
    another reminder occurrence.
20. Tasks Hub remains independent: an admitted future reminder may correlate to
    the same source work identity but cannot create/complete/reassign a task,
    copy a due date into Tasks Hub, or infer source completion from engagement.
21. Inngest is optional execution acceleration only. If later selected, it
    receives identifiers after product commit, uses the product dispatch ledger
    and work claims, re-reads current product truth after wake, and has a
    database-backed recovery scan. It owns no human wait, clock policy, due fact,
    cancellation truth, recipient, semantic identity, or outcome.
22. D46 decides automatic reminders only. A staff-triggered manual nudge, digest,
    escalation, reassignment, deadline, expiry, or no-response consequence is a
    different product meaning and requires a separate decision.

## Current behavior, intended behavior, and best permanent path

| State                           | Verified position                                                                                                                                                                                                                            | D46 consequence                                                                                                       |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Current repository behavior** | Core has no shipped D43 request, D44 coordinator route, D45 access-request email, or D46 reminder. The current `/tasks` prototype exposes generic reminders/due dates, while contribution approvals own finance-specific SLA/reminder code.  | Neither current surface is authority or a reusable D46 shortcut.                                                      |
| **Governing intended baseline** | Phase 12 owns D43 source state and D44 recipients; ADR-0183 owns source-backed task projection; ADR-0027 owns in-product engagement; ADR-0026 and Phase 17 own bounded message steps; the workflow contract keeps Inngest non-authoritative. | No layer currently owns a D43 temporal requirement. Silence is the only truthful automatic-reminder behavior.         |
| **Selected D46 behavior**       | Keep the source lane, task, required in-product item, and optional initial D45 email; create no second timed occurrence and expose no reminder setting.                                                                                      | Excellent UX comes from durable discoverability and honest state, not a disabled control or invented “overdue” badge. |
| **Best permanent future path**  | Ratify a source temporal requirement and complete the admission contract before adding any source occurrence, schedule persistence, manifest key, plan step, worker, or UI.                                                                  | The future remains extensible without present-day schema debt or a generic scheduler DSL.                             |

## Governing Core evidence

| Repository evidence                                                                                                                                                                         | Verified finding                                                                                                                                                                                                        | D46 requirement                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| [Phase 24 decision log](./phase-24-multi-site-management-decision-log.md)                                                                                                                   | D43 has no due date, SLA, expiry, urgency transition, or evidence-backed response time; the founder selected no automatic reminder until a source temporal requirement exists.                                          | Record Option 1 exactly and remove any implicit timer.                                          |
| [Phase 12 role and permission configuration](./phase-12-full-role-permission-configuration.md)                                                                                              | Phase 12 owns the five-state D43 aggregate, one pending episode, exact source heads, current authorization, complete Access requests lane, and D44 recipient generations.                                               | A later reminder must be a Phase 12 source occurrence, never notification/task/workflow truth.  |
| [D43 primary research](./phase-24-d43-governed-holder-access-review-primary-research.md)                                                                                                    | No primary evidence establishes an optimal SLA, cadence, expiry, or no-response action.                                                                                                                                 | Request age cannot be converted into a deadline.                                                |
| [D44 primary research](./phase-24-d44-access-request-coordinator-routing-primary-research.md)                                                                                               | D44 provides one-to-three bounded coordinators and complete lane fallback; each current personal recipient receives a source-backed task and required in-product attention. Reminder/escalation is explicitly deferred. | Do not broaden recipients or create a timer through routing.                                    |
| [D45 primary research](./phase-24-d45-optional-initial-email-primary-research.md)                                                                                                           | D45 adds one optional immediate `staff_email` sibling, future-only, and explicitly adds no reminder, digest, deadline, SLA, escalation, repeat-send, or automatic decision.                                             | Never relabel an initial email retry/replay as a reminder.                                      |
| [ADR-0026](../../adr/0026-contract-bounded-delivery-plans.md)                                                                                                                               | The producer owns event, business eligibility, timing and cancellation fences; Delivery Plans permit only fixed named steps and forbid general waits/automation.                                                        | Phase 17 cannot invent the reminder clock or expose a cadence DSL.                              |
| [ADR-0027](../../adr/0027-one-notification-presentation-and-engagement-model.md)                                                                                                            | Notification availability/engagement is separate from source state and tasks; only a new meaningful source transition may create new attention.                                                                         | Elapsed age/read state cannot produce another unread item.                                      |
| [ADR-0183](../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)                                                                                                          | The source owns recurrence, cancellation, supersession, completion, and history; generic task due dates/reminders cannot mutate D43.                                                                                    | No task-owned reminder or duplicate task identity.                                              |
| [Phase 17 executable manifest](./phase-17-system-message-executable-manifest.md)                                                                                                            | D44/D45 keys are Reserved and have only immediate local plus optional email slots; reminders remain absent. Binding timing is fixed immediate or a named producer-owned date.                                           | Do not reserve a D46 key/slot before admission and proof.                                       |
| [ADR-0032](../../adr/0032-immutable-prepared-message-and-whole-message-recovery.md)                                                                                                         | Prepared delivery has permanent semantic identity and ambiguous provider submission is reconcile-only, never a new occurrence.                                                                                          | Provider retry cannot become a reminder.                                                        |
| [Workflow orchestration OpenSpec](../../../openspec/specs/workflow-orchestration/spec.md)                                                                                                   | Product records, dispatch ledger, work claims, provider records, and authorization remain authoritative; events are identifier-only.                                                                                    | Inngest may wake execution later but cannot own the wait or due fact.                           |
| [Current workflow ledger](../../../supabase/migrations/20260611134500_workflow_dispatch_ledger.sql) and [work claims](../../../supabase/migrations/20260611181000_workflow_work_claims.sql) | Core already has product-owned dispatch recovery and active-claim uniqueness; the installed Inngest SDK is 4.5.1.                                                                                                       | Reuse those execution primitives only after source admission; create no D46-specific queue now. |
| [Core frontend rules](../../../docs/ai/rules/frontend.md) and [shared UI configuration](../../../packages/ui/components.json)                                                               | Staff UI uses shared `@asym/ui`, Base UI behavior, Base Maia/Zinc tokens, semantic status, accessible forms, and server-owned privileged writes.                                                                        | D46 adds no app-local scheduler widget or disabled reminder control.                            |

## Current official external evidence

### IAM and access governance

| Official source                                                                                                                               | Verified fact                                                                                                                                                  | D46 implication                                                                                | Evidence limit                                                                                                       |
| --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| [Microsoft Entra — create an access review](https://learn.microsoft.com/en-us/entra/id-governance/create-access-review)                       | Reviewer reminders are a separate option and are sent halfway through the configured review duration.                                                          | The source review window, not the notification layer, determines reminder time.                | Entra campaigns are not D43 one-off holder requests.                                                                 |
| [Microsoft Entra — manage access reviews](https://learn.microsoft.com/en-us/entra/id-governance/manage-user-access-with-access-reviews)       | Reviewers can work from My Access; default reminders occur halfway to the review end when configured.                                                          | Durable work remains available independently; a reminder is meaningful because an end exists.  | Entra's default does not establish a Core default.                                                                   |
| [Microsoft Entra — deployment planning](https://learn.microsoft.com/en-us/entra/id-governance/deploy-access-reviews)                          | Planning explicitly asks what timeline is enforced, what happens on no response, and what communications/actions follow.                                       | Timing, no-response consequence, and communication must be decided together by the source.     | Planning guidance does not choose Core's response time.                                                              |
| [Microsoft Entra — entitlement request process](https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-process)         | Approval/reminder messages reference configured decision dates and requests can expire.                                                                        | A truthful reminder may state a date only when the source owns it.                             | Entitlement requests grant new access and have different risk semantics.                                             |
| [Microsoft Graph approval-stage schema](https://learn.microsoft.com/en-us/graph/api/resources/accesspackageapprovalstage?view=graph-rest-1.0) | Approval stages own automatic-denial and escalation durations.                                                                                                 | Temporal policy belongs to the approval aggregate, not an executor.                            | Microsoft field names are not a Core schema recommendation.                                                          |
| [Okta — certification campaigns](https://help.okta.com/en-us/Content/Topics/identity-governance/access-certification/campaigns.htm)           | Campaigns have scheduled starts/ends and close on the end or when reviews finish.                                                                              | Reminders can derive from an explicit campaign window.                                         | D43 is not a campaign and should not inherit recurrence.                                                             |
| [Okta — manage requests](https://help.okta.com/en-us/content/topics/identity-governance/access-requests/manage-requests.htm)                  | Okta owns a 60-day inactivity expiry and warnings; activity can reset the lifecycle.                                                                           | Temporal requirements may be dynamic and must version/reschedule at the source.                | Okta's 60-day number is not evidence for Core.                                                                       |
| [SailPoint — reminder, escalation, and timeout policies](https://documentation.sailpoint.com/saas/help/requests/config_emails.html)           | Administrators configure timeout, reminder start, frequency, time, and timezone; changes affect new requests while pending requests retain their prior policy. | If Core later admits cadence, it needs exact policy/version/timezone/effective-time semantics. | SailPoint's configurable engine is intentionally more complex than D46 v1.                                           |
| [SailPoint — approval administration](https://documentation.sailpoint.com/saas/help/requests/approvals_admin.html)                            | Administrators can inspect request age and deliberately open a manual remind-email action.                                                                     | Age visibility and manual follow-up are separable from automatic reminders.                    | A Core manual reminder remains a separate later decision, and SailPoint's email composer is not safe copy authority. |
| [SailPoint — certification due template](https://documentation.sailpoint.com/saas/help/common/emails/et_certs_certdue.html)                   | Weekly certification reminders stop after completion/deadline and expose a next due date.                                                                      | Cancellation, finite cadence, and deadline are part of the reminder meaning.                   | Certification campaigns differ from D43.                                                                             |

### CMS, CRM, nonprofit, and work management

| Official source                                                                                                                        | Verified fact                                                                                                                                                                   | D46 implication                                                                | Evidence limit                                                                            |
| -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| [Contentful Tasks](https://www.contentful.com/help/content-and-entries/tasks/)                                                         | A task reminder is sent two days before an optional due date; pending work remains in the Tasks page.                                                                           | No due date means no automatic reminder in the clearest CMS analogue.          | Contentful tasks own generic completion and are not source-backed access work.            |
| [Microsoft Planner notifications](https://support.microsoft.com/en-US/Planner/stay-updated-with-notifications-in-planner)              | Near/past-due notifications derive from task due dates, are user-configurable, and coexist with durable task views.                                                             | Due-time attention should not be added to a task that has no due fact.         | Planner tasks own their due date; D43's task does not.                                    |
| [Salesforce approval reminder guidance](https://help.salesforce.com/s/articleView?id=000387415&language=en_US&type=1)                  | Approval Processes do not natively include reminder email; the official workaround requires custom state plus a scheduled record-triggered Flow.                                | “Just send a reminder” creates fields, automation, and maintenance debt.       | This is a workaround, not a recommended Core architecture.                                |
| [Salesforce To Do List](https://trailhead.salesforce.com/content/learn/modules/to-do-list-for-task-management/discover-the-to-do-list) | Salesforce task/cadence/work-item timing is represented by due dates owned by those work types.                                                                                 | Central work discovery and timed automation remain distinct concepts.          | Sales tasks are not access-governance source truth.                                       |
| [Blackbaud Grantmaking reminders](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/grantmaking/content/reminders.html)       | Automated reminders attach to incomplete Activities/Requirements, commonly relative to a due date; a successfully sent reminder does not automatically resend when rescheduled. | Nonprofit software also requires a source condition and durable sent identity. | It permits recipient/content flexibility Core must not import into sensitive access work. |

### Notification UX, accessibility, time, and execution

| Official source                                                                                                                        | Verified fact                                                                                                                                                              | D46 implication                                                                              | Evidence limit                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| [Apple HIG — Notifications](https://developer.apple.com/design/human-interface-guidelines/notifications)                               | Notifications should be timely, concise, valuable, nonduplicative, and free of sensitive data; Apple specifically warns against multiple notifications for the same thing. | Do not repeat attention without proven value and a new meaning.                              | Mobile guidance informs but does not govern staff web/email.                         |
| [Android notification design](https://developer.android.com/design/ui/mobile/guides/home-screen/notifications)                         | Notifications should not be the primary communication method or an empty “come back” nudge.                                                                                | Persistent source work must remain primary.                                                  | Android does not define Core timing.                                                 |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) and [Interruptions guidance](https://www.w3.org/WAI/WCAG22/Understanding/interruptions.html) | Status messages must be programmatically exposed; non-emergency interruptions should be suppressible/postponable at AAA.                                                   | Avoid chatty repeated attention and preserve accessible durable state.                       | D46's release floor remains WCAG 2.2 AA; the interruption criterion is advisory AAA. |
| [PostgreSQL date/time types](https://www.postgresql.org/docs/current/datatype-datetime.html)                                           | `timestamptz` stores an instant in UTC but not the original zone; named IANA zones carry daylight-saving rules that can change.                                            | A future civil-time rule must preserve source zone/rule meaning separately from the instant. | This does not choose the business calendar.                                          |
| [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)                                                 | Composite uniqueness is enforceable; conditional uniqueness uses a partial unique index.                                                                                   | Permanent occurrence uniqueness belongs in PostgreSQL.                                       | Exact future schema awaits admission.                                                |
| [PostgreSQL `SELECT`](https://www.postgresql.org/docs/current/sql-select.html)                                                         | `SKIP LOCKED` is suitable for queue-like consumers but deliberately yields an inconsistent view.                                                                           | It may claim due work, never decide whether the reminder is due.                             | A future design may choose another claim mechanism.                                  |
| [Inngest sleeps](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/sleeps)                                       | `step.sleepUntil` can wake durable execution at a future instant.                                                                                                          | Inngest is technically viable acceleration after product admission.                          | A sleep is not a business record or recovery proof.                                  |
| [Inngest cancellation](https://www.inngest.com/docs/features/inngest-functions/cancellation/cancel-on-events)                          | `cancelOn` can correlate cancellation, but cancellation occurs at step boundaries and does not replace a current-state check.                                              | Source terminal state must still suppress at fire time.                                      | Delivery already executing may finish.                                               |
| [Inngest idempotency](https://www.inngest.com/docs/guides/handling-idempotency)                                                        | Event/function idempotency lasts 24 hours.                                                                                                                                 | It cannot own uniqueness for reminders days or weeks later.                                  | Inngest remains useful when backed by product identity.                              |

## Evidence synthesis

### Verified conclusions

- Modern automatic reminders are not free-floating notification features. They
  derive from a due date, campaign/review window, expiry, or explicit temporal
  policy owned by the business workflow.
- Durable work views remain necessary because external notification can be
  delayed, suppressed, disabled, or missed.
- Repeated notifications create fatigue and can cause people to disable the
  entire channel.
- Temporal configuration requires more than a number: effective revision,
  timezone, calendar behavior, cancellation, finite cadence, and no-response
  consequence matter.
- PostgreSQL can own durable temporal identity and concurrency; Inngest can wake
  execution but its 24-hour deduplication cannot own a long-lived reminder.
- Core currently has no source temporal fact for D43 and no D46 runtime contract.

### Product judgments

- The absence of a D43 deadline is intentional quiet state, not missing data to
  be filled with seven days.
- No disabled reminder control should appear in v1. Showing an unavailable
  control makes a nonexistent feature look misconfigured and adds noise.
- D46 makes no source-lane presentation expansion: the existing exact localized
  submitted timestamp remains, while relative-age badges and new age sorting/
  filtering remain unadmitted.
- A future reminder is a new business meaning and source occurrence, whereas a
  later transport for that reminder extends the same reminder key.
- Source-owned database scanning plus optional Inngest acceleration is safer
  than making a long-running Inngest function the only wake/cancel truth.

### Assumptions and unknowns

- **Assumption:** the durable lane, task, required in-product item, and optional
  initial email are sufficient for v1 ministry operations.
- **Assumption:** the existing exact localized D43 submission timestamp supplies
  sufficient temporal context without a new derived-age badge or false SLA.
- **Unresolved unknown:** representative ministries have not established a
  target decision time, acceptable reminder frequency, business calendar, or
  preferred manual follow-up path.
- **Unresolved unknown:** D43 production volume, age distribution, abandonment,
  staff comprehension, and notification-fatigue rates do not yet exist.
- **Unresolved unknown:** whether a later temporal requirement is a due instant,
  expiry, risk-tier transition, or tenant-validated cadence must be decided by
  the owning Phase 12 product policy—not inferred here.

## Source of truth and domain invariants

| Fact                                                   | Authority                                                            | May consume                          | Must never own/infer                                         |
| ------------------------------------------------------ | -------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------ |
| D43 request state, actionability, and terminal outcome | Phase 12 request aggregate                                           | Access requests, Tasks Hub, Phase 17 | Task, notification, email, worker, provider                  |
| D44 current responsible recipients                     | Phase 12 coordinator policy/resolver and immutable generation        | Task and attention projections       | Profile, email, role name, Inngest payload                   |
| Current v1 reminder policy                             | This D46 decision: none admitted                                     | UI guards, tests, traceability       | Tenant setting, task field, feature flag                     |
| Future temporal requirement/policy                     | Phase 12 source-authoritative, separately ratified temporal contract | Due claimant, occurrence command     | created-at convention, browser, Tasks Hub, Phase 17, Inngest |
| Future reminder occurrence                             | Source transaction/receipt                                           | Phase 6/17 plan compiler             | schedule runner, task, notification, provider                |
| Future semantic uniqueness                             | Product database under Tenant-composite identity                     | retries, repair, workflows           | event ID, run ID, provider idempotency                       |
| Future presentation/channel                            | Registered Phase 17 message contract and bounded Delivery Plan       | Notification Center/channel adapter  | source timing, task completion                               |
| Task state/engagement                                  | ADR-0183 Tasks Hub projection                                        | staff work surfaces                  | reminder due fact, D43 completion                            |
| Delivery outcome                                       | Phase 6/17 plus provider evidence                                    | operations/history                   | awareness, task completion, request decision                 |

Current invariants:

1. `pending_review` does not imply Due, Late, Overdue, or reminder-eligible.
2. Zero D46 source occurrences implies zero D46 message intents, tasks, provider
   submissions, unread items, preferences, or timers.
3. D46 adds no user-facing request-age derivation. Privacy-safe operational age
   research may derive aggregates from source timestamps but is never a write,
   presentation, timing, or reminder authority.
4. D43 terminal truth remains sufficient to end D44/D45 projections; D46 cannot
   delay or override it.
5. Tasks Hub, Notification Center, email, analytics, and Inngest remain mutually
   non-authoritative for D43 business truth.
6. New/migrated Tenants and assignments receive no inferred reminder policy.
7. The absence of a placeholder is the extensible state; a later reviewed
   additive design is preferred over speculative columns and enums now.

Future-admission invariants:

1. No source temporal requirement means no due candidate and no occurrence.
2. One exact temporal requirement revision and reminder meaning produces at most
   one committed semantic occurrence per admitted ordinal.
3. A reminder occurrence records that the source condition became due under a
   specific rule; it never proves human awareness or nonperformance.
4. Source terminal state or supersession before atomic occurrence commit yields
   no occurrence. If occurrence and terminal commands race, locking/CAS permits
   one serial result and downstream current-state fences suppress stale delivery.
5. Timing policy, source applicability, recipient authority, presentation, and
   delivery are separate gates; no lower layer broadens an upper denial.
6. A changed temporal requirement creates a successor revision; it does not
   mutate historical occurrence identity or silently move a sealed provider
   envelope.
7. A later channel adds a named step/profile/adapter to the same stable reminder
   meaning. Only changed business meaning warrants another stable key.
8. A future reminder never creates a second task for the same D43 source work or
   copies a due date into Tasks Hub unless the source-work contract separately
   admits that exact presentation.

## Future reminder admission contract — no present implementation placeholder

This section is a gate for a later proposal, not a design to implement now.
Every item is required before a reminder schema/key/job/UI may be proposed.

### 1. Problem and temporal authority proof

The source proposal must provide representative evidence that initial durable
attention is insufficient and identify the business consequence that makes a
second interruption useful. It must name exactly one source temporal fact or
versioned policy and its owner. A real due instant, expiry, or risk transition
can qualify after full admission proof. A Tenant cadence without one of those
facts qualifies only if D47 separately admits that class and its validation
standard. `request.created_at + N` without a ratified source rule is prohibited.

### 2. Stable reminder meaning and grain

The proposal must define the exact sentence that is newly true at the reminder
time, its source fence, one stable Phase 17 message key bound to the producer-
owned occurrence, and one occurrence grain. It must
decide whether the meaning is per request or a recipient-level aggregate,
provide a finite child/recipient ceiling, and prove anti-storm behavior for
current-work rerouting. “Resend the initial notification” is invalid because it
cannot distinguish source meaning, identity, or outcome.

### 3. Complete temporal semantics

The source contract must decide all of the following together:

- absolute instant, civil date/time, elapsed duration, or source event transition;
- authoritative database/service clock and allowed clock skew;
- elapsed versus calendar-day arithmetic;
- named IANA timezone authority and how its revision is pinned;
- daylight-saving nonexistent/ambiguous local-time policy;
- weekend and holiday inclusion/exclusion and calendar owner/version;
- not-before instant and bounded useful-lateness/expiry window;
- behavior when the source fact/policy/timezone/calendar changes;
- activation/backfill treatment for already-pending requests; and
- finite count: one occurrence or a separately ratified recurrence sequence.

A canonical UTC instant alone is insufficient when the business rule began as a
civil date/time; PostgreSQL does not retain the original zone in `timestamptz`.
A bare UTC offset is insufficient for future daylight-saving changes.

### 4. Atomicity, concurrency, uniqueness, and cancellation

The occurrence command must use product-database uniqueness and lock or compare
the exact request/temporal heads in one transaction. Its logical identity binds
Tenant, source episode/head, temporal-requirement revision, reminder meaning/
version, and admitted ordinal. Duplicate ticks, scans, retries, Inngest events,
and manual repair converge on that identity; changed inputs conflict or create a
source-authorized successor.

Source withdrawal/decision/no-longer-applicable, temporal replacement/removal,
recipient change, authorization loss, and reminder due claims must have explicit
race tests. `SKIP LOCKED` may distribute queue-like claims but cannot decide
admission. A missed wake has a bounded database recovery scan. Work outside the
useful-lateness window expires as no-send rather than arriving arbitrarily late.

### 5. Recipient and authorization proof

At occurrence and materialization, the source resolves current D44 recipients
from current Active Tenant Assignments, excludes the requester, enforces the
one-to-three ceiling, and re-proves exact Phase 12 source visibility and
`permissions.manage_grants` scope/ceiling/floor. The future design must decide
how a responsibility change shortly before due interacts with reminder noise;
it may not send to the prior recipient, guess another person, or broadcast.

### 6. Presentation and delivery separation

Only after the source occurrence is admitted may Phase 17 register its new
stable reminder meaning. The reviewed generation separately defines required or
optional in-product/email/other named steps, safe facts, stale-safe rendering,
deep link, presentation/end rule, preference, suppression, destination,
readiness, provider outcome, and accessibility. An initial-email preference is
not silently assumed to authorize reminder frequency. Tasks Hub is work, not a
channel, and receives no duplicate task from the reminder.

### 7. Execution and recovery

The source transaction atomically commits its temporal occurrence/receipt and
an identifier-only product dispatch/projection handoff. Phase 17 compiles the
permitted plan and Phase 6 owns recipient communication intents, preparation,
provider handoff, and delivery evidence. A database due scanner is sufficient
and remains the recovery authority.
Inngest may additionally receive an identifier-only event and use
`step.sleepUntil`/`cancelOn`, but every wake reacquires a product work claim and
re-reads current source truth. Inngest's 24-hour event/function idempotency is a
transport aid only. Removing Inngest or losing a wake cannot lose or duplicate
the product occurrence.

### 8. Evidence before activation

Activation requires positive, negative, boundary, timezone/DST, holiday,
authorization, tenant-isolation, duplicate, concurrency, cancellation, late-
wake, lost-handoff, recovery, migration, rollback, accessibility, low-bandwidth,
and production-volume proof. No future reminder becomes Live from documentation
alone.

## UX/UI contract

### V1 coordinator journey

Maria receives one source-backed task and one required in-product item when a
request becomes her responsibility; she may receive D45's optional initial email.
If she returns later, the same task and source-actionable item remain available,
and **People & access → Access requests** remains the complete authorized lane.
No second unread item, red badge, modal, toast, email, or “overdue” label appears
merely because time passed.

The source lane may show neutral source metadata:

```text
Review current access
Review requested Aug 22, 2026
Status: Review requested

[Review request]
```

D46 preserves that existing exact localized source timestamp and adds no
relative **8 days ago** badge, age-based sort/filter, countdown, color emphasis,
or due/late label. Any later temporal presentation requires the same separately
ratified source policy as the reminder itself.

### Tenant administrator journey

There is no D46 reminder row in **System Messages**, no cadence control in
**Access request coordinators**, and no due/reminder switch in Tasks Hub. D45's
Delivery card continues to show only required in-product attention and optional
initial email. If contextual documentation is necessary, concise helper copy is:

> Access requests do not have an automatic reminder or deadline. Pending requests
> remain available in Access requests and Tasks Hub.

Do not render a disabled **Reminders — Coming later** control. That creates false
affordance, support questions, and pressure to preserve speculative schema.

### Holder journey

The holder sees **Review requested. Your access has not changed.**, the submitted
time, and the current source/terminal outcome under D43. They see no countdown,
reviewer performance, reminder history, coordinator identity, or implied decision
deadline. No-response cannot silently keep or remove access.

### Operations and accessibility

Operations may inspect aggregate age buckets and projection health without
request prose, subject identity, coordinator identity, or staff scoring. Shared
`@asym/ui`, Base UI behavior, Base Maia/Zinc tokens, semantic headings/status,
visible focus, keyboard order, 320-CSS-pixel/400%-zoom reflow, forced colors,
reduced motion, localized absolute time, RTL/CJK, and WCAG 2.2 AA remain the UI
baseline. Status updates are programmatically announced without focus theft;
time passage itself never triggers a live-region announcement.

### Future admitted reminder UX minimum

If a later source temporal requirement is admitted, the source view must show
the truthful due/expiry basis before enabling reminder configuration. Preview
must state who may receive which attention, exact timing semantics/timezone,
future-only/backfill behavior, cancellation conditions, and that Tasks Hub/source
truth do not change. Recipient-facing copy must be stale-safe and send users to
current authenticated detail; no inline Keep/Remove action or protected request
reason appears in a reminder.

## Failure and race matrix

| Scenario                                        | Required current/future behavior                                                                                                   |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| V1 request remains pending for any duration     | No reminder occurrence, UI urgency, task due date, or channel send.                                                                |
| D46 deploys with current pending requests       | No schema backfill, message, unread reset, task rewrite, or email.                                                                 |
| Contribution reminder job sees a D43 identifier | Reject by product area/contract; never reuse finance timing.                                                                       |
| Task user selects a generic reminder control    | Server rejects for source-backed D43 work; permanent UI should omit it.                                                            |
| Analytics reports old requests                  | Report aggregate age only; no automatic product mutation or staff score.                                                           |
| Future due tick duplicates or retries           | Product uniqueness returns the one prior occurrence/receipt.                                                                       |
| Future source resolves before due claim         | No occurrence; existing projections close from source truth.                                                                       |
| Due claim races terminal decision               | Lock/CAS yields one serial result; any committed reminder delivery re-proves current source and suppresses stale unsubmitted work. |
| Temporal policy/timezone changes before due     | Old requirement revision becomes inapplicable; successor derives its own instant and identity.                                     |
| Coordinator changes before due                  | Old recipient receives nothing; current resolver/authorization determines bounded recipients under the admitted policy.            |
| Inngest wake is early                           | Database not-before fence returns no effect; exact work remains recoverable.                                                       |
| Inngest wake is late                            | Send only inside the source-owned useful-lateness window; otherwise record no-send/expired evidence.                               |
| Inngest cancellation is missed                  | Fire-time source/head check suppresses; `cancelOn` is not sole safety.                                                             |
| Inngest unavailable                             | Product due state and recovery scan remain valid; source/lane/task continue.                                                       |
| Duplicate provider acceptance is ambiguous      | Reconcile the same prepared identity; never create another reminder occurrence/key.                                                |
| Authorization or assignment ends                | Remove protected presentation and suppress future delivery; do not fabricate completion.                                           |
| Cross-Tenant identifier injected                | Tenant-composite lookup/RLS/verified context returns no row/effect and records safe denial.                                        |

## Full adversarial category review

| Category                                                          | Material concern?                                                               | Ruthless finding and exact amendment                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Problem validity, necessity, and alternatives**                 | **Yes — high severity, high likelihood without D46.**                           | **What/why:** a reminder would solve a plausible missed-attention symptom, but no known D43 user requirement defines lateness; the strongest alternative is the selected no-build path plus durable lane/task/in-product/initial email. Vendor timers attach to source windows or explicit policies. **Effect:** validates Option 1 and rejects seven-day/Tenant cadence now without prejudging D47. **Permanent fix/spec:** “No automatic reminder until Phase 12 owns a source-authoritative, separately ratified temporal requirement or policy; request age alone is insufficient, and D47 decides cadence-only qualification.” |
| **Brittleness**                                                   | **Yes — high severity, medium likelihood.**                                     | **What/why:** `created_at + N days`, local offsets, browser clocks, or one sleeping run break under DST, policy changes, late workers, and source closure. **Evidence:** PostgreSQL zone rules and Inngest cancellation limits. **Effect:** narrows the future seam. **Permanent fix/spec:** require authoritative clock, temporal type, IANA zone, calendar/DST/lateness rules, versioned source head, database recovery, and fire-time reproof before admission.                                                                                                                                                                  |
| **Technical debt**                                                | **Yes — high severity, high likelihood if placeholders are added.**             | **What/why:** nullable reminder columns, enums, disabled UI, generic scheduler tables, or reserved keys become de facto contracts and duplicate Phase 17/34. **Effect:** strengthens no-build. **Permanent fix/spec:** add no schema/runtime/UI placeholder in D46; a later additive change begins only after admission proof and owns migration/rollback.                                                                                                                                                                                                                                                                          |
| **Edge cases**                                                    | **Yes — high severity, high likelihood over time.**                             | **What/why:** source closes at due instant, coordinator changes, DST skips/repeats local time, timezone/holiday policy changes, wake arrives late, no recipients qualify, or provider accepts after closure. **Effect:** no current implementation; future gate expands. **Permanent fix/spec:** every case in the failure/race matrix is a release-blocking outcome test.                                                                                                                                                                                                                                                          |
| **Footguns**                                                      | **Yes — high severity, medium likelihood.**                                     | **What/why:** generic task Remind/Snooze controls, copied finance timers, manual database edits, or “test reminder” buttons could spam staff or imply SLA. **Effect:** current task/UI controls must reject/omit D43 reminder semantics. **Permanent fix/spec:** only a registered source command may create a future occurrence; no generic task, admin, support, import, AI, browser, or provider write path.                                                                                                                                                                                                                     |
| **Tenant safety**                                                 | **Yes — critical severity, low-to-medium likelihood without composite guards.** | **What/why:** a timer/event with a bare request or recipient ID could wake in the wrong Tenant or after assignment recreation. **Effect:** future seam is Tenant-composite and current-assignment-bound. **Permanent fix/spec:** derive Tenant and actor from verified server context, require Tenant-composite relationships/queries/events/claims, reject cross-Tenant or recreated-assignment reuse, and never route from email/profile.                                                                                                                                                                                         |
| **Database, RLS, and authorization safety**                       | **Yes — critical severity, medium likelihood if later built generically.**      | **What/why:** caller-supplied tenant/actor/recipient/time, permissive service-role access, nullable uniqueness, weak `USING` without `WITH CHECK`, or an update that retargets a schedule can bypass policy. **Effect:** no schema now; future schema must make invalid states impossible. **Permanent fix/spec:** append-only/source-successor mutation, composite FKs, non-null typed heads, checks, permanent unique semantic identity, deny-by-default RLS, matching `USING`/`WITH CHECK`, narrow SECURITY DEFINER RPC, and fire-time EffectiveAccess re-derivation.                                                            |
| **Overengineering**                                               | **Yes — medium severity, high likelihood.**                                     | **What/why:** recurrence builders, holiday engines, workflow canvases, channel arrays, or Tenant-authored rules solve hypothetical needs and duplicate Phase 34. **Effect:** validates smallest path. **Permanent fix/spec:** no generic scheduler/DSL; a later source admits only its exact finite timing and occurrence contract.                                                                                                                                                                                                                                                                                                 |
| **UX/UI and user friction**                                       | **Yes — medium severity, high likelihood.**                                     | **What/why:** repeated unread items, relative-age badges, red aging, fake overdue states, disabled settings, and duplicate task/email channels create noise and shame volunteers without a deadline. **Evidence:** Apple warns against multiple notifications for the same thing. **Effect:** no second attention and no D46 presentation expansion. **Permanent fix/spec:** omit reminder/age controls and badges, retain durable work surfaces, preserve only D43's existing exact localized source timestamp, and user-test any later timing UI after source-policy ratification.                                                |
| **Source of truth, ownership, and domain invariants**             | **Yes — critical severity, high likelihood if layer boundaries blur.**          | **What/why:** Tasks Hub, Phase 17, analytics, or Inngest could become a second clock/closure authority. **Effect:** selected decision unchanged; future source contract made explicit. **Permanent fix/spec:** Phase 12 owns temporal fact and occurrence; Tasks Hub presents work; Phase 17 presents/delivers; workflow executes; provider reports transport only.                                                                                                                                                                                                                                                                 |
| **Hidden coupling**                                               | **Yes — high severity, medium likelihood.**                                     | **What/why:** coupling to contribution SLA tables, task reminder fields, notification read state, initial-email preference, or Inngest run IDs makes unrelated changes alter access reminders. **Effect:** prohibit reuse by convention. **Permanent fix/spec:** closed access-governance contract identifiers and adapters; shared infrastructure only below explicit domain seams; reminder preference/channel policy reviewed independently.                                                                                                                                                                                     |
| **Failure modes**                                                 | **Yes — high severity, high likelihood for timed work.**                        | **What/why:** lost wake, duplicate wake, stuck claim, early/late execution, ambiguous provider response, partial fan-out, or failed cancellation can lose or duplicate attention. **Effect:** no current runtime; future must fail safely. **Permanent fix/spec:** product due-state/recovery scan, expiring work claims, atomic occurrence receipt, per-recipient results, same-identity reconciliation, bounded lateness, and visible repair state; source work remains usable.                                                                                                                                                   |
| **Lifecycle, temporal correctness, concurrency, and idempotency** | **Yes — critical severity, high likelihood.**                                   | **What/why:** independently valid due and terminal commands can jointly emit stale work; changed schedules can duplicate; 24-hour event dedupe expires. **Effect:** major future admission requirement. **Permanent fix/spec:** define every pre-due/due/emitted/canceled/superseded/expired condition, lock/CAS source heads, permanent DB uniqueness, successor revisions, finite ordinals, exact retry, and no transport-owned identity.                                                                                                                                                                                         |
| **Data integrity risks**                                          | **Yes — high severity, medium likelihood.**                                     | **What/why:** duplicated occurrences, orphan schedules, mutable history, stale recipient membership, or inconsistent counts corrupt audit and reporting. **Effect:** future model must be source-relational, not JSON. **Permanent fix/spec:** Tenant-composite FKs, immutable receipts, sealed membership/digest where aggregation is admitted, no cascade delete, deterministic repair, and no inferred historical backfill.                                                                                                                                                                                                      |
| **Security and privacy risks**                                    | **Yes — critical severity, medium likelihood.**                                 | **What/why:** a reminder can expose that someone has sensitive access, the holder/reason/capability, or internal coordinator behavior through email, logs, metrics, calendars, and support tools. **Effect:** no present egress; future content wall mandatory. **Permanent fix/spec:** identifier-only execution; minimum safe rendered facts; authenticated inert links; current authorization; no reason/provenance/subject list; purpose-bound retention/export/logging; no open/click engagement inference.                                                                                                                    |
| **Scalability and performance risks**                             | **Yes — medium severity, medium likelihood if later activated.**                | **What/why:** one sleeping run or email per request/recipient can grow with pending backlog and route changes; unindexed due scans cause load spikes. **Effect:** no current load; future proof required. **Permanent fix/spec:** finite fan-out and occurrence grain, indexed set-wise due selection, bounded claim batches, anti-storm aggregation decision, per-Tenant flow control, backpressure, and production-shaped load evidence.                                                                                                                                                                                          |
| **Operational burden**                                            | **Yes — medium severity, high likelihood for arbitrary cadence.**               | **What/why:** staff would need to explain calendars, late sends, duplicate mail, missed wakes, and provider failures without a business SLA. **Effect:** avoid operations machinery now. **Permanent fix/spec:** no D46 runtime; future activation must include owner, runbook, repair UI, calendar policy, kill switch, and replacement-safe recovery.                                                                                                                                                                                                                                                                             |
| **Observability and auditability gaps**                           | **Yes — high severity, medium likelihood.**                                     | **What/why:** logs alone cannot prove why a reminder was due, canceled, skipped, or delivered, while delivery telemetry cannot prove awareness. **Effect:** future occurrence/receipt/history requirements added; current monitors enforce absence. **Permanent fix/spec:** durable source temporal revision and occurrence receipt; typed no-send/cancel reasons; product/provider identities kept separate; privacy-safe metrics with named owners/responses.                                                                                                                                                                     |
| **Dependency and integration risks**                              | **Yes — high severity, medium likelihood.**                                     | **What/why:** Inngest outages/version semantics, provider delays, timezone database changes, or email suppression can diverge from source. **Effect:** no dependency required now; optional future executor only. **Permanent fix/spec:** product database and recovery remain complete without Inngest/provider; pin contracts; re-prove at fire time; no shared fallback or provider-owned recurrence.                                                                                                                                                                                                                            |
| **Migration, rollout, and upgrade risks**                         | **Yes — high severity, medium likelihood.**                                     | **What/why:** adding cadence to already-pending requests can backfill storms; mixed versions can disagree on due logic; rollback after sends cannot retract mail. **Effect:** current migration is zero-write. **Permanent fix/spec:** later reader/denial guards first, additive source policy, shadow due evaluation, no-send canary, explicit old-request treatment, compatible mixed-version fence, kill switch, roll-forward recovery, and no blind rollback claim.                                                                                                                                                            |
| **Testability, traceability, and proof**                          | **Yes — high severity, high likelihood if “later” stays vague.**                | **What/why:** “send a reminder eventually” is not falsifiable and terminology can drift across D43–D46, ADRs, manifest, OpenSpec, tickets, and UI. **Effect:** this document supplies negative v1 and future admission criteria. **Permanent fix/spec:** exact terms, 120 assertions, acceptance criteria, race fixtures, source-to-release trace IDs, and activation blocked until all artifacts agree.                                                                                                                                                                                                                            |
| **Other development hazards**                                     | **Yes — medium severity, medium likelihood.**                                   | **What/why:** clock skew, tzdata changes, data restoration, support impersonation, test sends, AI prioritization, or metrics-driven auto-enablement could bypass the decision. **Effect:** closes residual paths. **Permanent fix/spec:** authoritative clock/version proof, no production-like test sends, no edit-on-behalf/AI activation, restore reconciliation, and monitors that may pause/quarantine but never create a reminder.                                                                                                                                                                                            |

## Final disposition and ruthless synthesis

**Accept with required amendments.** Record the exact corrected D46 decision in
this document. The strongest path is:

### Resolve before recording

1. State unambiguously that v1 has no automatic reminder because D43 has no
   source temporal requirement—not because implementation is deferred.
2. State that no schema/runtime/UI placeholder is authorized.
3. Preserve D43–D45 source, work, attention, and initial-email behavior unchanged.
4. Reserve manual reminder, digest, escalation, deadline/expiry, and no-response
   consequence for separate decisions.

### Capture in spec/design

1. The future eight-part admission contract above.
2. Exact ownership: Phase 12 timing/occurrence; ADR-0183 work; Phase 17
   presentation/delivery; optional Inngest execution.
3. Existing exact localized source-timestamp UX only, with no new relative age,
   sort/filter, due/overdue, or reminder affordance.
4. No backfill, recurrence, generic scheduler, or channel DSL by implication.

### Require during implementation

1. Negative architecture tests proving no D43/D44 path can invoke finance/task/
   workflow reminder APIs or create a reminder occurrence.
2. Server rejection and UI omission of generic task reminder/due-date mutation
   for D43 source-backed work.
3. Source-lane/task/in-product reliability independent of D46 and D45 email.
4. Only if later admitted: atomic source command, permanent uniqueness, complete
   temporal semantics, cancellation/recovery, current authorization, bounded
   presentation/channel compilation, and production proof.

### Monitor without silently changing behavior

Every response below may stop, quarantine, repair, or start human research. No
monitor may create a reminder, deadline, recipient, message, task, preference,
escalation, or source outcome.
These names are acceptance/evidence labels, not authorization for new v1
telemetry. Zero-artifact signals use CI/release audit wherever possible;
operational rows may consume an already-permitted signal only. D46 creates no
pipeline, table, event, job, scheduled snapshot, dashboard, or alert. Product
discovery requires a separately approved, privacy-reviewed, time-bounded,
preregistered research plan before collection.

| Signal                                                  | Threshold                                                                                                                                               | Owner                             | Required response                                                                                                                                             |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `access_d46_unadmitted_reminder_occurrence_total`       | Any D43/D44 source occurrence whose meaning is automatic reminder before a separately ratified source temporal contract is Live                         | Phase 12 + Security               | Stop writer/dispatch, quarantine effects, preserve source work, audit all affected Tenants, remove unauthorized path, and incident-review any disclosure.     |
| `access_d46_unadmitted_reminder_delivery_total`         | Any in-product/email/push/chat/SMS/provider delivery identified as a D43 reminder                                                                       | Phase 17 + Privacy + Security     | Disable exact delivery path, contain provider copies where lawful, preserve D43/D44/D45 truth, identify recipients, and repair contract gates.                |
| `access_d46_placeholder_contract_total`                 | Any D43 reminder column/table/enum/key/plan slot/worker/timer/flag/UI control activated without the complete admission proof                            | Architecture + Data Platform      | Block migration/release, remove or quarantine the unratified artifact through a safe additive correction, and reconcile traceability.                         |
| `access_d46_false_urgency_ui_total`                     | Any D43 request/task/item labelled Due, Overdue, Late, Escalated, or Reminder scheduled without a current source-owned temporal fact                    | Phase 12 + UX                     | Remove false state, correct projections from source truth, test affected locales/surfaces, and assess user harm.                                              |
| `access_d46_source_lane_visibility_gap_total`           | Any current authorized `pending_review` head omitted from the complete permission-filtered Access requests lane                                         | Phase 12 + Security               | P0 for affected scope; repair source query/projection, assess hidden work, and do not compensate by sending reminders.                                        |
| `access_d46_substantiated_missed_attention_report`      | Any permission-safe report substantiated as missed despite the then-current source/lane/routing/IA surfaces                                             | Access Product + UX Research      | Triage the cause, repair a verified source/lane/routing/IA defect, or approve a privacy-reviewed research brief; never infer a cadence or send automatically. |
| `access_d46_temporal_research_brief_approved`           | Product, UX Research, IAM, Privacy, and Architecture approve a preregistered representative sampling plan and name one candidate source temporal policy | Same approving group              | Conduct the bounded study and return to D47/D46-successor review; approval does not qualify the policy, choose a cadence, or authorize implementation.        |
| `access_d46_no_deadline_comprehension_criterion_failed` | Any separately approved moderated study misses its preregistered criterion or finds a participant reasonably inferred Due/Overdue/SLA                   | UX Research + Security + Phase 12 | Revise existing source/task/item IA/copy, document the evidence limit, and retest without adding fake urgency or reminder UI.                                 |
| `access_d46_cross_tenant_due_or_claim_total`            | Any future-admission shadow/proof read, claim, or occurrence crosses Tenant or Active Tenant Assignment scope                                           | Security + Data Platform          | P0; stop shadow/activation, contain data, audit context/RLS/service-role paths, and require new isolation proof.                                              |

## Research assertions — D46-RA001 through D46-RA120

### Repository and governing facts

- **D46-RA001 — Repository fact:** Phase 12 owns D43 request state,
  actionability, decisions, terminal outcomes, and holder-visible truth.
- **D46-RA002 — Repository fact:** D43's closed lifecycle is
  `pending_review | withdrawn | resolved_kept | resolved_removed |
no_longer_applicable`.
- **D46-RA003 — Repository fact:** D43 defines no due date, SLA, expiry, urgency
  transition, business calendar, or no-response action.
- **D46-RA004 — Repository fact:** one exact current direct source has at most one
  current `pending_review` holder request.
- **D46-RA005 — Repository fact:** Phase 12 provides one complete permission-
  filtered Access requests lane independently of personal routing.
- **D46-RA006 — Repository fact:** ADR-0183 makes Tasks Hub a presentation/
  engagement projection and keeps recurrence/cancellation/completion at source.
- **D46-RA007 — Repository fact:** generic task due-date/reminder/snooze/complete
  controls cannot mutate or close a D43 source-backed task.
- **D46-RA008 — Repository fact:** D44 resolves an optional one-to-three-person
  current coordinator cohort and guesses no fallback recipient.
- **D46-RA009 — Repository fact:** D44 creates required in-product attention and
  source-backed task projection independently of the source lane.
- **D46-RA010 — Repository fact:** D45 adds only one optional immediate
  `staff_email` sibling and explicitly adds no reminder/repeat-send.
- **D46-RA011 — Repository fact:** D45 plan/preference widening creates no
  historical/backfill email for current requests.
- **D46-RA012 — Repository fact:** ADR-0026 makes the producer own event timing
  and cancellation fences.
- **D46-RA013 — Repository fact:** ADR-0026 forbids arbitrary waits, loops,
  event creation, tasks, and general automation in Delivery Plans.
- **D46-RA014 — Repository fact:** ADR-0027 permits new attention only for a new
  meaningful source transition, never elapsed age or engagement state.
- **D46-RA015 — Repository fact:** notification engagement, task engagement,
  source state, and external delivery are independent truths.
- **D46-RA016 — Repository fact:** the current Phase 17 manifest contains no D46
  reminder key/timing and keeps D44/D45 candidates Reserved.
- **D46-RA017 — Repository fact:** Core's workflow OpenSpec says Inngest is an
  executor and product records/claims/ledger remain authoritative.
- **D46-RA018 — Repository fact:** contribution approval reminder/SLA code is
  finance-specific migration input, not D43–D46 authority.
- **D46-RA019 — Repository fact:** Core currently uses Inngest 4.5.1 and has
  product dispatch-ledger/work-claim primitives but no D43 reminder function.
- **D46-RA020 — Repository fact:** shared frontend rules require `@asym/ui`, Base
  UI behavior, Base Maia/Zinc tokens, accessible semantic state, and server writes.

### Verified current external facts

- **D46-RA021 — Verified external fact:** Microsoft Entra access-review reminders
  occur halfway through a configured review duration.
- **D46-RA022 — Verified external fact:** Microsoft warns access-review email can
  be delayed while pending work remains directly available in My Access.
- **D46-RA023 — Verified external fact:** Microsoft entitlement approval/reminder
  messages refer to configured decision dates and request expiry.
- **D46-RA024 — Verified external fact:** Microsoft deployment guidance treats
  timeline, no-response action, automatic action, and communication as explicit
  review-policy decisions.
- **D46-RA025 — Verified external fact:** Okta certification campaigns have
  scheduled starts/ends and close at completion or end.
- **D46-RA026 — Verified external fact:** Okta's request inactivity expiry and
  warning behavior is a product-owned lifecycle that can reset on activity.
- **D46-RA027 — Verified external fact:** SailPoint explicitly configures reminder
  start, count/frequency, send time, timezone, escalation, and timeout.
- **D46-RA028 — Verified external fact:** SailPoint policy changes affect future
  requests while pending requests retain their submission-time configuration.
- **D46-RA029 — Verified external fact:** SailPoint requires a timezone for its
  reminder schedule and provides a schedule preview.
- **D46-RA030 — Verified external fact:** SailPoint says reassignment does not
  restart its configured escalation timing.
- **D46-RA031 — Verified external fact:** SailPoint exposes a deliberate manual
  Remind User action separately from automatic policies.
- **D46-RA032 — Verified external fact:** Contentful reminds an assignee two days
  before an optional task due date.
- **D46-RA033 — Verified external fact:** Microsoft Planner's near/past-due
  notifications derive from task due dates and have user controls.
- **D46-RA034 — Verified external fact:** Salesforce Approval Processes lack a
  native reminder email; official guidance uses explicit fields and scheduled Flow.
- **D46-RA035 — Verified external fact:** Blackbaud Grantmaking reminders attach
  to incomplete source Activities/Requirements and commonly a due date.
- **D46-RA036 — Verified external fact:** Blackbaud records a successful reminder
  and does not automatically resend it merely because it is rescheduled.
- **D46-RA037 — Verified external fact:** Apple advises against multiple
  notifications for the same thing even when the person has not responded.
- **D46-RA038 — Verified external fact:** Apple describes a notification as
  timely, high-value information and recommends concise copy.
- **D46-RA039 — Verified external fact:** Apple advises excluding sensitive,
  personal, or confidential data from notifications.
- **D46-RA040 — Verified external fact:** WCAG interruption guidance recommends
  suppressible/postponable non-emergency interruptions.
- **D46-RA041 — Verified external fact:** WCAG 2.2 AA requires programmatically
  determinable status messages without unnecessary focus movement.
- **D46-RA042 — Verified external fact:** PostgreSQL stores `timestamptz` as an
  instant and does not retain the original source timezone.
- **D46-RA043 — Verified external fact:** PostgreSQL supports composite
  uniqueness and partial unique indexes for conditional uniqueness.
- **D46-RA044 — Verified external fact:** Inngest supports durable sleeps and
  event-correlated cancellation, but cancellation is not a product-state check.
- **D46-RA045 — Verified external fact:** Inngest event/function idempotency is
  limited to 24 hours.

### Exact selected decision and v1 boundaries

- **D46-RA046 — Product judgment:** accept no automatic reminder in v1 until a
  source-owned temporal requirement exists.
- **D46-RA047 — Product judgment:** the strongest alternative—one fixed
  seven-day reminder—is rejected because seven days has no source/user evidence.
- **D46-RA048 — Requirement inference:** request creation time plus elapsed age
  cannot by itself authorize a reminder.
- **D46-RA049 — Requirement inference:** D46 registers no stable reminder key or
  source occurrence in v1.
- **D46-RA050 — Requirement inference:** D46 creates no schema/runtime/UI
  placeholder merely for future extensibility.
- **D46-RA051 — Product judgment:** no disabled or “coming later” reminder control
  appears in Tenant, coordinator, recipient, or task settings.
- **D46-RA052 — Requirement inference:** Tasks Hub gains no D43 due date,
  overdue state, reminder, recurrence, or snooze control.
- **D46-RA053 — Requirement inference:** elapsed age creates no second in-product
  item, unread reset, badge, or notification group transition.
- **D46-RA054 — Requirement inference:** D45 initial email cannot be replayed,
  resent, or relabelled as D46.
- **D46-RA055 — Product judgment:** D46 adds no digest, escalation, fallback,
  deadline, expiry, recurrence, or no-response decision.
- **D46-RA056 — Requirement inference:** D43 lane/request history remain complete
  and usable whether Tasks Hub, Phase 17, email, or workflows fail.
- **D46-RA057 — Product judgment:** v1 recovery uses the source lane, exact task,
  required in-product item, and optionally enabled initial email.
- **D46-RA058 — Requirement inference:** D46 retains only D43's existing exact
  localized source submission timestamp and adds no relative-age presentation.
- **D46-RA059 — Requirement inference:** no surface may say Due, Overdue, Late,
  Escalated, or Reminder scheduled without a source temporal fact.
- **D46-RA060 — Requirement inference:** D46 adds no age badge, countdown,
  aging emphasis, or age-derived source-lane sort/filter.
- **D46-RA061 — Requirement inference:** ordinary human follow-up outside Core
  does not become D43 source, task, reminder, or delivery truth.
- **D46-RA062 — Product judgment:** a product-owned manual reminder remains a
  separate later decision rather than being smuggled into an “automatic only”
  answer.
- **D46-RA063 — Requirement inference:** finance reminder code/tables/keys/roles
  cannot be reused for D43 without a reviewed source contract.
- **D46-RA064 — Requirement inference:** D46 activation generates no effect for
  already-pending requests.
- **D46-RA065 — Requirement inference:** D44 route or D45 plan/preference/contact
  changes do not create a D46 occurrence.
- **D46-RA066 — Requirement inference:** migration infers no cadence from tenant
  timezone, locale, role, address, task, history, or provider data.
- **D46-RA067 — Requirement inference:** D43 withdrawal/decision/source-end races
  remain governed solely by existing Phase 12 CAS/receipts.
- **D46-RA068 — Requirement inference:** monitoring request age cannot itself
  send, score, escalate, or change priority.
- **D46-RA069 — Requirement inference:** no hidden cron/recovery scan may treat
  age as reminder admission.
- **D46-RA070 — Requirement inference:** no Inngest event, sleep, function, run,
  cancellation, or dedupe record is created for D46 v1.
- **D46-RA071 — Requirement inference:** no Resend/provider request or delivery
  evidence exists for D46 v1.
- **D46-RA072 — Requirement inference:** no Tenant reminder policy/default is
  stored or displayed.
- **D46-RA073 — Requirement inference:** no recipient reminder preference is
  created or inferred from D45 initial-email preference.
- **D46-RA074 — Requirement inference:** no D43 request field is added to hold a
  hypothetical reminder/due instant.
- **D46-RA075 — Requirement inference:** no generic reminder/cadence enum or JSON
  policy is added to Core for D46.
- **D46-RA076 — Requirement inference:** no Reserved manifest key/slot/profile is
  created before future source admission.
- **D46-RA077 — Requirement inference:** no feature flag can silently activate a
  D43 reminder path absent the same reviewed contracts.
- **D46-RA078 — Product judgment:** age metrics have no success/failure target
  until a representative research cohort exists.
- **D46-RA079 — Requirement inference:** current generic task reminder controls
  are migration hazards and must reject/omit D43 source-backed work.
- **D46-RA080 — Requirement inference:** the no-reminder decision changes no
  permission, access source, request result, or authorization epoch.

### Future admission, lifecycle, and proof

- **D46-RA081 — Requirement inference:** a later reminder requires one exact
  source-owned, versioned temporal requirement.
- **D46-RA082 — Requirement inference:** that requirement must name an instant,
  civil date/time, duration, or source transition rather than an untyped number.
- **D46-RA083 — Requirement inference:** source owner, policy/head/version, and
  authoritative clock must be fixed and auditable.
- **D46-RA084 — Product judgment:** a real due/expiry/risk transition may
  motivate admission; D47 separately decides whether a validated Tenant cadence
  alone may qualify.
- **D46-RA085 — Requirement inference:** reminder meaning differs from initial
  assignment and therefore requires a new stable Phase 17 message key bound to
  the producer-owned source occurrence.
- **D46-RA086 — Requirement inference:** the future reminder is one new source
  occurrence committed only when the temporal condition becomes due.
- **D46-RA087 — Requirement inference:** a reminder is never a resend/retry of
  the initial D44/D45 occurrence.
- **D46-RA088 — Requirement inference:** Phase 17 presentation is admitted only
  after the source occurrence and remains separately governed.
- **D46-RA089 — Requirement inference:** email/push/chat/SMS channel steps each
  require their own reviewed profile/adapter/readiness proof.
- **D46-RA090 — Product judgment:** initial-email preference cannot silently
  authorize a reminder's distinct frequency/meaning.
- **D46-RA091 — Requirement inference:** future recipients resolve from the
  current exact D44 responsibility generation, not the original recipient.
- **D46-RA092 — Requirement inference:** the requester remains excluded from
  personal responsibility for their own review.
- **D46-RA093 — Requirement inference:** every recipient requires current exact
  source visibility and grant-decision authorization at occurrence and delivery.
- **D46-RA094 — Requirement inference:** the exact D43 head must still be
  `pending_review` at due claim and every later side effect.
- **D46-RA095 — Requirement inference:** false, absent, stale, partial,
  contradictory, timed-out, or indeterminate proof produces no new effect.
- **D46-RA096 — Requirement inference:** elapsed/calendar semantics and source
  not-before/useful-lateness boundaries must be explicit.
- **D46-RA097 — Requirement inference:** civil-time rules require a named IANA
  zone and preserve their source-zone semantics separately from a UTC instant.
- **D46-RA098 — Requirement inference:** daylight-saving gaps/overlaps need one
  code-owned deterministic policy and boundary tests.
- **D46-RA099 — Requirement inference:** weekend/holiday behavior requires an
  explicit owner, calendar, revision, and fallback; absence cannot guess.
- **D46-RA100 — Requirement inference:** a late wake sends only inside a bounded
  source-owned utility window; stale backfill is suppressed.
- **D46-RA101 — Requirement inference:** browser/worker/provider clocks cannot
  decide due; the authoritative product clock and skew policy are fixed.
- **D46-RA102 — Requirement inference:** temporal changes create successor
  revisions and never mutate historical occurrences/prepared messages.
- **D46-RA103 — Requirement inference:** source terminal state or requirement
  removal cancels uncommitted/not-yet-presented work under current fences.
- **D46-RA104 — Requirement inference:** recipient removal/auth loss suppresses
  that recipient and never triggers guessed fallback or broadcast.
- **D46-RA105 — Requirement inference:** product-database uniqueness binds
  Tenant, source episode/head, temporal revision, reminder key/version, and ordinal.

### Operations, UX, assumptions, and the next decision

- **D46-RA106 — Requirement inference:** duplicate ticks/scans/events/retries
  converge on the same source receipt; changed input conflicts/succeeds separately.
- **D46-RA107 — Requirement inference:** due/terminal races use atomic lock/CAS
  plus fire-time source reproof; two valid commands cannot create an unsafe effect.
- **D46-RA108 — Requirement inference:** future database design needs Tenant-
  composite FKs, non-null typed heads, checks, append-only history, and uniqueness.
- **D46-RA109 — Requirement inference:** future RLS uses deny-by-default matching
  `USING`/`WITH CHECK` and prevents permitted rows becoming cross-Tenant/retargeted.
- **D46-RA110 — Requirement inference:** service-role/SECURITY DEFINER execution
  derives tenant/actor/recipient from trusted product context and reauthorizes.
- **D46-RA111 — Requirement inference:** product dispatch ledger/work claims may
  guard execution attempts but source semantic identity guards the business effect.
- **D46-RA112 — Product judgment:** Inngest may accelerate a future wake only
  after commit and with database recovery; it is optional and replaceable.
- **D46-RA113 — Requirement inference:** recovery scans reconcile the same due
  identity and cannot create an occurrence outside the source utility window.
- **D46-RA114 — Requirement inference:** a long-running Inngest human workflow is
  rejected because Core product state may outlive run/provider policy.
- **D46-RA115 — Requirement inference:** future reminder grain/fan-out is finite
  and must prove anti-storm behavior for route changes/large pending cohorts.
- **D46-RA116 — Requirement inference:** reminder payloads/logs/metrics/workflows
  exclude D43 explanation, subject identity, provenance, capability, and raw ids.
- **D46-RA117 — Requirement inference:** current/future UX meets WCAG 2.2 AA,
  localized time, keyboard, reflow, forced-color, screen-reader, and low-bandwidth proof.
- **D46-RA118 — Assumption:** some ministries may later benefit from a truthful
  reminder once the source defines a real decision-time expectation.
- **D46-RA119 — Unresolved unknown:** no representative evidence currently sets
  the need, timing, calendar, recipient grain, channel, or acceptable frequency.
- **D46-RA120 — Product judgment:** D47 should decide whether a validated
  Tenant cadence may ever qualify as a source temporal requirement without a
  due date, expiry, or risk transition.

## Falsifiable acceptance criteria

1. D46 records exactly **no automatic reminder in v1 until a source-owned
   temporal requirement exists**; no seven-day or Tenant cadence is active.
2. No D43/D44 automatic-reminder source occurrence, stable key, manifest row,
   Delivery Plan slot, communication intent, provider request, or unread item exists.
3. D46 introduces no reminder/due/cadence column, table, enum, JSON policy,
   feature flag, worker, timer, cron, Inngest function, or disabled UI placeholder.
4. D43's five states/transitions, source heads, decisions, grant effects, epochs,
   audit, and holder history remain unchanged.
5. Any duration of `pending_review` alone produces no new task, notification,
   email, push, digest, escalation, or source mutation.
6. The permission-filtered Phase 12 Access requests lane remains complete and
   usable without D44 routing, Tasks Hub, Phase 17, D45 email, or Inngest.
7. Each D44 recipient retains at most the existing source-backed task projection;
   D46 adds no task due/overdue/remind/snooze/recurrence/completion control.
8. Notification Center retains the original source-actionable item without a
   second occurrence, unread reset, badge increase, or time-based revival.
9. D45 initial email remains one independently governed initial occurrence and
   is never resent/retried under a new identity as D46.
10. D46 activation, coordinator changes, plan/preference changes, contact repair,
    migration, or role/assignment changes backfill no current/historical request.
11. UI contains no Due/Overdue/Late/Escalated/Reminder scheduled claim without a
    current source temporal fact.
12. Authorized UI retains D43's existing exact localized source submission time;
    D46 adds no relative-age text/badge, age-derived sort/filter, countdown, or
    aging emphasis.
13. Tenant System Messages, coordinator settings, personal notifications, Tasks
    Hub, and holder My Access expose no D46 reminder control/default/preference.
14. Generic current task reminder/due-date APIs reject D43 source-backed work at
    the server boundary even if an old client renders the control.
15. Contribution reminder/SLA code cannot accept a D43/D44 product area, source
    kind, request identity, recipient generation, or event.
16. Metrics/reports may aggregate age but cannot create reminder eligibility,
    priority, performance scoring, recipients, or automatic actions.
17. New/migrated Tenants/assignments infer no reminder policy from timezone,
    locale, role, task, address, D45 preference, history, or provider data.
18. Rollback/disablement of D43–D45 needs no D46 data repair because D46 writes
    no runtime state; existing source/task/attention histories remain valid.
19. A later reminder proposal is rejected unless Phase 12 supplies a source-
    authoritative, separately ratified current temporal requirement or policy
    and business need; cadence-only qualification remains D47's decision.
20. The future requirement identifies temporal type, owner, clock, policy/head/
    version, not-before instant, and useful-lateness/expiry window.
21. Calendar-based future timing defines elapsed/calendar semantics, named IANA
    zone, DST gap/overlap, weekend/holiday policy, calendar owner/version, and display.
22. A future reminder defines one stable business meaning/key and source
    occurrence grain; it is not a resend or channel-specific source duplicate.
23. A future channel adds only a named step/profile/adapter to that reminder key
    unless business meaning changes.
24. Future semantic uniqueness is permanently enforced by the product database
    over exact Tenant/source/head/temporal-revision/key/version/ordinal identity.
25. Duplicate tick, scan, event, workflow retry, manual repair, and crash replay
    return the same occurrence/receipt; changed inputs do not partially replay it.
26. Due claim and D43 terminal commands atomically lock/CAS exact source heads;
    every serial result preserves one terminal truth and no unsafe stale delivery.
27. Requirement replacement/removal and request terminal state cancel/suppress
    old uncommitted/not-yet-presented work without rewriting historical evidence.
28. Future occurrence/materialization resolves only current D44 recipient
    generations, excludes requester, enforces 1–3 ceiling, and re-proves current
    same-Tenant authorization/source visibility.
29. Zero, partial, stale, contradictory, timed-out, over-ceiling, or
    indeterminate recipient/source/timing proof releases nobody and sends nothing.
30. Recipient loss before effect produces no fallback/broadcast; provider-
    accepted delivery is not recalled and links resolve current truth safely.
31. Future presentation/channel requiredness, preferences, suppression,
    destination, readiness, safe facts, rendering, engagement, and outcomes are
    reviewed separately under Phase 17.
32. A future reminder does not create/complete/reassign a Tasks Hub task, copy a
    due date into the task, or infer source outcome from task/notification engagement.
33. If Inngest is used, only identifiers enter after product commit; every wake
    reacquires a product claim/reloads source, and database recovery works without it.
34. Inngest's 24-hour event/function idempotency, run ID, sleep, and cancel event
    never own source timing, cancellation, semantic uniqueness, or completion.
35. A future due scanner uses deterministic indexed bounded selection and an
    atomic claim; `SKIP LOCKED` if used is only claim distribution, not admission.
36. Future tables/functions use Tenant-composite relationships, non-null typed
    heads, append-only receipts, checks, no cascade history deletion, and indexes
    for due/current identity and reconciliation.
37. Future RLS/grants/RPCs/service-role paths preserve the same Tenant/current-
    assignment/authorization boundary with matching mutation `USING` and
    `WITH CHECK`; caller input cannot select tenant/actor/recipient/audit identity.
38. Reminder facts/events/logs/metrics/search/exports/support/AI/cache/provider
    payloads exclude D43 explanation, subject identity, capability, provenance,
    authority evidence, raw identifiers, and unadmitted small-cohort data.
39. Future copy/deep links are stale-safe, authenticated, GET/HEAD/scanner inert,
    current-authorized, and contain no inline Keep/Remove action.
40. Current and future applicable surfaces meet shared Base Maia/Base UI and
    WCAG 2.2 AA proof at keyboard, screen reader, 320 CSS pixels/400% zoom,
    forced colors, reduced motion, localized time, CJK/RTL, and low bandwidth.
41. Future load proof covers many Tenants, large pending cohorts, 1–3 recipients,
    due spikes, route changes, duplicate wakes, recovery scans, and backpressure
    with explicit units/ceilings.
42. Future rollout is additive: denial/readers first, source writer, shadow due
    evaluation, no-send canary, presentation/channel canary, then activation;
    old-request/backfill behavior and mixed-version compatibility are explicit.
43. Future rollback stops new occurrence/materialization, preserves source/
    occurrence/delivery evidence, recalls no accepted message, and supports
    duplicate-free roll-forward recovery.
44. Decision log, glossary, ADRs, Phase 12/17, OpenSpec, design, tickets,
    implementation, tests, monitors, and release evidence use identical D46
    absence/admission/ownership/temporal/idempotency/channel terminology.
45. Manual reminder, digest, escalation, deadline/expiry, no-response action,
    and future recurrence remain separately traceable decisions and cannot be
    inferred from D46.

## D47 — May a validated Tenant cadence qualify without a due/expiry/risk fact?

**Historical resolution (2026-08-29):** D47 selected Option 1: an evidence-
admitted, bounded, Tenant-default-Off cadence may later qualify as separate
Phase 12 source policy for at most one courtesy occurrence without deadline or
access meaning. D47 activates no policy, reminder, schema, key, worker, or UI;
current-request impact, recipient-generation binding, clock/calendar, and
channels remain later decisions.

### Why this needs one separate decision

Hope Mission has no formal deadline for holder-initiated access reviews, but its
distributed staff normally review governance work during a weekly meeting. The
ministry asks whether a single reminder after its chosen cadence may be a
legitimate source temporal requirement even though no access expires, no risk
tier changes, and no no-response consequence occurs.

Current evidence cuts both ways. Microsoft Entra and Contentful derive reminders
from review windows or due dates. SailPoint also supports explicit request-age
cadence, but only as a source-owned policy with timeout, frequency, send time,
timezone, schedule preview, and submission-time versioning. That proves a
cadence-only model can be modern; it does not prove every Tenant should configure
one or that free-form timing is safe.

### Option 1 — a bounded, independently validated Tenant cadence may qualify — recommended

A Tenant cadence may become a Phase 12 source temporal requirement only after
representative evidence validates the need and code-owned choices. The policy is
Tenant-default Off, allows at most one reminder, uses bounded evidence-backed
presets rather than free-form recurrence, pins exact timezone/effective revision,
is future-only, and explicitly creates no Due/Overdue/SLA/expiry/no-response
consequence. Publication requires independent authority, impact preview, and the
complete D46 admission contract; personal/channel choices still narrow later.

**Benefit:** respects real ministry operating rhythms without pretending the
request has a deadline; SailPoint demonstrates the policy/version/timezone pattern.  
**Cost:** cadence itself becomes a source policy and adds validation, settings,
calendar, versioning, migration, support, and fatigue risk. No preset may be
chosen until research supports it.

### Option 2 — only a consequence-bearing source fact may qualify

A future automatic reminder requires a real due date, expiry, or risk transition.
A Tenant meeting rhythm or preferred age never becomes source timing by itself.

**Benefit:** clearest meaning, least noise, no invented operational SLA, and the
smallest temporal model.  
**Cost:** ministries with a legitimate recurring review rhythm cannot receive a
Core reminder until they adopt a formal consequence-bearing time rule.

### Option 3 — one product-wide cadence

Core chooses one fixed interval for every Tenant, with at most one reminder per
pending request and no Tenant timing choice. The exact interval would still need
an evidence-backed value and the full D46 admission proof.

**Benefit:** simpler configuration and support than Tenant-specific cadence.  
**Cost:** one global number cannot reflect different ministry rhythms, still
invents timing without a consequence fact, and risks presenting a platform norm
as a service expectation. A free-form schedule/recurrence builder remains
rejected under every option.

### Recommendation and exact question

Recommend **Option 1 — a bounded, independently validated Tenant cadence may
qualify**, but this is permission to consider that temporal-requirement class,
not authorization to build a setting or choose 3/7/14 days now. It preserves
ministry flexibility while keeping D46's current no-placeholder/no-reminder
state and rejecting a generic schedule engine.

**Which D47 temporal-admission policy should Core record: Option 1, Option 2, or
Option 3?** You may amend any option.

## Evidence limits

- Vendor reminders demonstrate patterns, not Core user demand or an optimal
  ministry cadence.
- Microsoft, Okta, SailPoint, Contentful, Planner, Salesforce, and Blackbaud own
  different source lifecycles, permissions, content, and commercial defaults.
- WCAG interruption guidance is informative AAA beyond Core's AA release floor;
  it does not prohibit useful source-owned reminders.
- PostgreSQL and Inngest evidence proves implementation properties, not product
  necessity.
- No representative nonprofit missions cohort establishes D43 response time,
  abandonment, fatigue, manual-nudge demand, or business-calendar semantics.
- This is research/specification only. It activates no D43–D46 runtime behavior.

## Final research disposition

Record D46 as **no automatic reminder in v1 until a source-owned temporal
requirement exists**. Preserve the complete source lane, source-backed task,
required in-product item, and independently governed optional initial email.
Add no timer, task due date, message key, preference, schema/runtime/UI
placeholder, or Inngest human wait. A future reminder becomes legitimate only
through the complete source-owned admission contract, then a separate Phase 17
presentation/channel contract and proof-gated activation. Proceed next to D47's
single cadence-admission decision.
