# Phase 24 D18 — Undated Default Site Locale Plan Adversarial UX Review

> **Status:** Completed `/grill-with-docs` decision evidence for D18. This is
> not a Phase 24 PRD, OpenSpec change, implementation plan, schema, migration,
> issue specification, or runtime authorization.
>
> **Founder choice:** A Default Site Locale Plan stores no target date.
>
> **Review date:** 2026-08-27

> **Later D19 clarification:** A registered real source transition may create
> one deduplicated Phase 6 occurrence and one independently engaged Phase 17
> item per exact currently qualified Party+role. It never derives from Plan
> age/time, uses no recurring reminder/email/task/external channel, and has zero
> Plan/source/public/Giving/finance effect. D18's no-date/no-age-reminder
> decision is unchanged. See
> [D19](./phase-24-d19-state-driven-plan-attention-adversarial-review.md).

## Final disposition

**Accept with required amendments.**

No target date is the strongest current decision. It keeps one private language
Plan useful without inventing a launch promise, time-zone policy, reminder
contract, or scheduler that no representative Core staff evidence requires.

The informal answer “store no target date” is still incomplete. A nullable date,
generic metadata key, copied task due date, age-based priority, or “created at
plus 30 days” rule can smuggle the same semantics back in. The permanent
corrected decision is:

> A Default Site Locale Plan has no target date, launch date, due date, planned/
> scheduled activation time, expiry time, deadline, relative duration, Plan
> priority, Plan urgency, Plan reminder, or release type in Phase 24. Its
> target Site Locale and actual event/terminal timestamps remain required.
> Absence is product meaning, not an empty field. Audit, receipt, readiness-
> check, and source-event timestamps remain exact historical evidence but never
> become a Plan deadline or scheduling input.
>
> The Plan stays Active until an authorized lifecycle command makes it
> Cancelled, Superseded, Activated, Satisfied elsewhere, or No longer
> applicable. Age alone never changes authoritative readiness, priority, owner,
> state, Plan visibility, activation, expiry, or public behavior. D17 evidence
> freshness may only revoke reuse/display of cached favorable readiness proof
> and force a recheck; it never grants readiness or changes Plan/source truth.
>
> Page, Navigation, and publication workflows may retain independently
> authorized source-owned dates/schedules. Mission Control owns shared-task due
> dates and reminders. D18 copies nothing in either direction; none becomes
> Plan/Site/default truth.
>
> Staff do not see an empty date field or a disabled calendar. They see one
> persistent **Planned** state, current blockers, exact owners, and the unchanged
> current default and serving state. A future target-date capability requires representative user
> evidence and a new decision; it cannot be added through generic metadata,
> task configuration, migration, or provider behavior.

### Plain-language result

```text
French (Canada) is planned · 2 items remaining

hope.org still opens English (United States).
French will not become default automatically.

[Continue setup]  [Cancel plan]
```

There is no blank **Target date** row and no **Overdue** label. The Plan remains
where staff expect it until they finish, replace, cancel, or otherwise resolve
it.

## Evidence labels

- **Verified repository fact** — observed in current source, accepted
  ADR/OpenSpec material, or the D6–D17 decision chain.
- **Proposed repository fact** — present only in open PR #1323 or #1340 and not
  merged; useful evidence, not current authority.
- **Verified external fact** — supported by a current official product source.
- **Product judgment** — Core's proportional trade-off after comparing
  alternatives.
- **Assumption** — plausible but not proved with representative Core staff.
- **Unresolved empirical unknown** — requires usability/operational evidence
  and cannot authorize hidden behavior.

## Jobs to be done

### Staff planner job

“Keep the future language change visible without making me invent a date or
worry that Core scheduled the website.”

### Source owner job

“Let my Page, Navigation, or review work keep its own timing without turning
that date into a Site-wide promise.”

### Publisher job

“Show readiness and the final action when it is real; do not make age look like
approval or urgency.”

### Visitor and donor assurance job

“Keep the current website and explicit Page/Giving links unchanged regardless
of how long staff keep a private Plan.”

### Developer and operator job

“Keep time evidence separate from lifecycle authority and make hidden schedule,
deadline, expiry, and date-propagation paths structurally impossible.”

## Corrected D18 decision — normative language

### D18-R1 — No target-date concept exists in the Plan contract

The Default Site Locale Plan contract accepts no target date, launch date, due
date, scheduled date/time, planned/scheduled activation time, expiry time,
deadline, relative duration, or “ASAP/undecided/timed” release type in Phase 24.
Its target Site Locale and actual event/terminal timestamps remain required.
Phase 24 also introduces no Plan-owned priority, urgency, or reminder.

This is not a nullable setting and not a hidden optional field. A generic
metadata object, extension, import column, task link, automation input, provider
payload, or UI-only field cannot establish date semantics.

### D18-R2 — Time evidence remains evidence only

Created, updated, reviewed, readiness-checked, command-received, committed,
effect-observed, task-created, source-changed, and audit-recorded timestamps
remain exact instants under their source owners. They explain what happened and
support reconciliation.

No Plan audit/source timestamp selects authoritative Plan state, priority,
owner, readiness, default, root, activation, expiry, reminder, escalation, or
fallback. D17 evidence freshness is the narrow safety exception: `checked_at`
may revoke reuse/display of cached favorable proof and require a recheck, but
never grants readiness or changes Plan/source truth. Independently authorized
source-workflow schedules and Mission Control task reminders retain their own
timing contracts. Civil-time display, user time zone, and locale formatting are
presentation of evidence—not Plan authority.

### D18-R3 — The Plan persists until a real lifecycle outcome

An Active Plan remains Active regardless of age. It ends only through D17's
authorized Cancelled, Superseded, Activated, Satisfied elsewhere, or No longer
applicable outcome.

There is no auto-expiry, archival timer, inactivity timeout, age-based
suppression, “past due” transition, or age-driven background cleanup. Actor
anonymization does not expire Site-owned intent. An authoritative Tenant/Site/
privacy terminal event first produces D17's **No longer applicable** outcome;
terminal history then follows the later applicable records-schedule contract.
Retention is not Plan lifecycle.

### D18-R4 — Source-workflow and Mission Control timing remain independent

A registered Page, Navigation, publication, or other source workflow MAY carry
a date/schedule under its own accepted contract and current authorization.
Mission Control MAY carry a shared-task due date/reminder under the Mission
Control contract and current authorization.

D18 never:

- copies a source-workflow or Mission Control task time into the Plan;
- derives source-workflow or Mission Control task time from Plan creation/
  activity time;
- pushes a Plan date into a source workflow or Mission Control task;
- chooses an assignee, priority, reminder, or escalation; or
- treats a source deadline as default/readiness/activation truth.

The Plan may link to the source work/task and display its separately owned
status when the viewer is authorized. A source-workflow date remains within its
source row. A Mission Control due date remains within its task row, clearly
labelled as the review task's date—not the website's launch date.

### D18-R5 — Age cannot create hidden urgency or automation

Plan age alone cannot create an **Overdue**, **Late**, **At risk**, **Urgent**,
or **Stale** product state. It cannot move a Plan upward in priority, notify an
owner, escalate, create a task, close a task, expire intent, or trigger
activation.

D19 separately decides whether a real state change should create one deduplicated
producer occurrence under [ADR-0027: One notification presentation and
engagement model](../../adr/0027-one-notification-presentation-and-engagement-model.md)
and how exact action-capable recipients are resolved. D18 does not pre-authorize
an age threshold, periodic nag, deadline, reminder clock, or escalation. Source
workflows retain separately accepted notification rules; Mission Control
retains its independently authorized task-reminder rules.

### D18-R6 — The UI omits date controls instead of showing emptiness

**Site → Languages** does not show an empty target-date field, disabled calendar,
“Add date” affordance, blank dash, placeholder, schedule icon, countdown, or
“No deadline” form setting.

The ordinary row shows only:

- stable target Site Locale;
- **Planned** and current permitted readiness;
- remaining permitted action count;
- unchanged current-default/serving consequence; and
- **Continue setup**, **Change planned language**, or **Cancel plan** as
  permitted.

Permanent copy says the Plan never goes live automatically. It does not suggest
that staff forgot to configure something.

### D18-R7 — Persistent discoverability replaces date-driven nagging

Every authorized Site Languages view shows the active Plan on its target locale
row. A Tenant with several Sites can later see a simple **Planned default**
status and filter in the Phase 24 authorized Sites management surface for only
Sites the actor may access. D18 does not create a new dashboard or project
workspace.

Qualified source-owner work remains visible in its source editor and the shared
Mission Control work projection under D17. Hiding the Plan because it is old is
forbidden.

### D18-R8 — Lists sort by current work meaning, never invented deadlines

Within one Plan, source rows group by **You can do now** and **Needs another
owner**. Any cross-Site list may group **Ready to review** and other work the
current actor can perform before **Waiting for owner**, then use stable
Site/locale labels and stable identity as tie-breakers.

Created/updated time cannot imply deadline, urgency, priority, or Plan ordering.
A Mission Control task may sort by its own due policy inside its owner surface;
that ordering does not reorder or reinterpret the Plan as a dated release.

### D18-R9 — Readiness stays current and date-independent

D17's permission-filtered readiness projection continues to use current Page,
Navigation, locale, verified-base, generation, publication, permission, and
safety facts. It exposes `checked_at` only as freshness evidence.

An undated Plan becomes **Ready to review** when current facts prove readiness,
not when time passes. A date cannot block, satisfy, accelerate, or waive a
blocker.

A suspended Site is never **Ready to review**. Its current safety/serving fact
produces **Needs attention · Site suspended** and no D19 ready occurrence or
activation action. Readiness is re-evaluated only after serving becomes
favorable and a fresh projection succeeds.

### D18-R10 — Final activation remains explicit D16 behavior

No absence/presence of time data changes D17/D16 activation. A current
authorized human reviews a newly compiled candidate and explicitly activates
the target. The current head, Plan review basis, source facts, permissions, and
safety all revalidate.

No job, cron, delayed event, workflow timer, provider scheduler, task due event,
client timer, or database trigger may activate or prepare activation because of
time.

### D18-R11 — Lifecycle, cancellation, and replacement remain D17-owned

D18 adds no state or transition. Cancel, replace, activate, satisfied-elsewhere,
and no-longer-applicable behavior—including Plan-specific follow-up cleanup and
source-work preservation—remain exactly D17-owned.

Changing a source-workflow schedule or Mission Control task due date, missing
one, or passing one cannot cancel, replace, terminalize, or re-open the Plan.

### D18-R12 — Permissions and privacy do not widen for time data

Plan visibility and all source timing details reauthorize current Tenant,
environment, Site, role/subrole, capability, field visibility, and restricted
resource scope on every read.

Hidden task dates, assignees, activity times, Plan creation times, and owner
work contribute no count, label, relative age, timing side channel, or existence
signal. Public visitors and unauthenticated surfaces receive no Plan or timing
data.

### D18-R13 — Database and API shapes cannot smuggle a date back in

The later Plan schema/command contract has no authoritative target-date/
launch-date/due-date/planned-activation/expiry-time field. Code-owned validation
rejects reserved date/schedule semantics in generic metadata, API payloads,
imports, support tools, AI commands, and direct mutation boundaries.

Ordinary immutable audit timestamps remain required. Their names, values, nulls,
defaults, indexes, or generated columns cannot be reused as lifecycle policy.
No database trigger, scheduled function, queue delay, or partial index infers
date-driven Plan state.

### D18-R14 — Source-task storage remains subordinate

Current Mission Control task storage includes `due_at`, but current task
services are finance/contribution-shaped and are not D18 authority. A later
qualified Site adapter may reference a Mission Control-owned task and its due
date; it cannot copy that value into the Plan or use Plan timestamps to
populate it.

A D17-created Plan-specific coordination request starts with `due_at = NULL`,
creates no `mission_control_task_reminders` row, and does not call the current
`getSuggestedAttentionUrgency` helper with Plan/request age. It supplies
code-owned `normal` under the current enum. A separately accepted source
contract may provide typed severity evidence; Mission Control's code-owned
policy alone maps that evidence to task urgency.
An authorized actor may later add a Mission Control-owned due date or reminder
under the shared-task contract; that edit remains visibly a follow-up date and
cannot change Plan identity, readiness, state, or activation.

Task comments, reminders, completion, suppression, due state, and events remain
task coordination facts. They do not write Plan lifecycle/readiness/default
truth.

### D18-R15 — Concurrency and idempotency ignore date-like input

Plan save/replace/cancel/review/activate idempotency meaning contains no target
date. A caller retry that adds or changes a date/schedule field is changed
meaning and is rejected rather than silently ignored or persisted.

Two clients cannot use different hidden dates to create peer Plan revisions,
attention lineages, notifications, or activation candidates. Mission Control
task-date changes may update task evidence but never re-key Plan identity.

### D18-R16 — Imports, exports, and integrations remain honest

Plan exports/API projections omit target-date/launch-date/due-date/planned-
activation/expiry-time fields rather than emitting a blank value that appears
supported. Generic integrations cannot set one.

Mission Control task exports may include Mission Control-owned due dates under that
contract; source-workflow exports may include their separately owned schedules.
Joining either export to a Plan never changes ownership or creates a website
launch date.

### D18-R17 — Migration starts with no inferred dates

Migration never derives a Plan date from Site creation, locale creation,
default activation, Page schedule, task due date, event date, campaign date,
content timestamp, calendar, message, document, import, or free text.

Existing null/blank/prototype date columns—if discovered—are evidence to remove
or quarantine, not product history to backfill.

### D18-R18 — Observability measures defects and UX, not age as failure

Zero-tolerance monitors detect admitted date fields, time-driven effects,
date-propagation, hidden schedules, expiry, and public/financial impact.

Plan age may be measured only as privacy-safe product research after governance
approval. Age alone is not an error/SLO and cannot page an owner or label a Plan
stale. UX monitoring uses comprehension, abandonment, and support cases instead.

### D18-R19 — Accessibility and low-friction behavior remain complete

The undated journey inherits D17's WCAG 2.2 AA, Core accessibility, server-
rendered action, target-size, focus, reflow, zoom, mobile, RTL/CJK, weak-network,
and status-message requirements.

Omitting a date must also remove its label, calendar, helper, error, and keyboard
stop. Screen readers do not encounter a meaningless blank. A Mission Control
task due date, when shown, has a full accessible label such as **Homepage review
task due 15 October**, adjacent non-scheduling context where ambiguity is
possible, and never **Launch date**.

### D18-R20 — Future evolution requires evidence and explicit amendment

A future date proposal must first show representative Core staff need and
separately decide:

- Plan-only civil date versus exact instant;
- edit/clear authority;
- display locale/time-zone ownership;
- source-workflow/Mission Control timing propagation (default remains no);
- reminder/escalation/expiry behavior;
- scheduling (default remains prohibited);
- concurrency, audit, migration, retention, and accessibility; and
- whether the benefit justifies new persistent state.

It must amend D18 and the later Site/default workflow contract explicitly. It
cannot enter as task metadata, provider capability, migration convenience, or
UI-only “optional” polish.

## Complete staff journey

### 1. Create the Plan without a date decision

```text
Plan French (Canada) as the website default?

hope.org still opens English (United States).
Nothing public changes when you save this Plan.
French will not become default automatically.

[Not now]  [Plan French (Canada)]
```

There is no empty date row or scheduling control.

### 2. Keep the Plan obvious in Languages

```text
French (Canada)
Planned · 2 items remaining
hope.org still opens English (United States)

[Continue setup]
```

The absence of a date does not look like missing setup.

For a suspended Site, consequence copy is conditional and truthful:

```text
English (United States) remains default.
This Site is suspended and is not currently public.
Nothing changes automatically.
```

### 3. Show separately owned timing only where it belongs

```text
Needs another owner

French homepage approval
Website publishers · Review task due 15 October
This task date does not schedule hope.org.
[Open homepage]
```

That due date belongs to the Mission Control review task. The Page/publication
workflow separately owns its schedule, if any. The Plan summary never says
**French launch: 15 October**, never copies either time, and never becomes
overdue from it.

### 4. Make several Sites manageable without a calendar

The later Phase 24 authorized Sites management surface can filter **Planned
default**. It shows only Sites the actor may access and no hidden blocker
counts.

```text
Hope Missions                French (Canada) planned · Needs attention
Field Training               Spanish planned · Ready to review
```

This is a filter/status in the Site product, not a release calendar or new task
dashboard.

### 5. Becoming ready is the only positive transition

```text
French (Canada) is ready to review

hope.org still opens English (United States).
[Preview French website]  [Review and make default]
```

Readiness comes from current facts, never Plan age.

### 6. Cancel or replace at any time

The D17 consequence screen closes Plan-specific follow-ups, preserves source
work, and leaves the current default and serving state unchanged. No date or
elapsed time changes that result.

### 7. Work on mobile and weak networks

Removing the date removes a field, validation, calendar dialog, time-zone
explanation, and keyboard stop. The one-column journey keeps Plan status,
current default/serving state, blockers, and next action complete. Server-backed
commands remain idempotent when the connection fails.

## Source of truth and ownership map

| Fact                               | Authoritative owner                                                                                                                                                               | D18 treatment                   | Forbidden ownership     |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ----------------------- |
| Plan target intent/lifecycle       | D17 Site locale-policy Plan owner                                                                                                                                                 | no date semantics               | task/provider/calendar  |
| Current default/root               | D16 Default Site Locale Version/head                                                                                                                                              | unchanged by Plan time/age      | Plan age/date           |
| Audit/receipt timestamps           | exact command/event owner                                                                                                                                                         | evidence only                   | deadline/state selector |
| Readiness `checked_at`             | D17 projection                                                                                                                                                                    | freshness evidence              | launch date             |
| Page/Navigation publication time   | source owner                                                                                                                                                                      | may appear in source row        | Plan schedule           |
| Mission Control task `due_at`      | Mission Control                                                                                                                                                                   | independent and non-propagating | Plan date/source truth  |
| Meaningful transition presentation | [ADR-0027: One notification presentation and engagement model](../../adr/0027-one-notification-presentation-and-engagement-model.md) producer/presentation owners; D19 unresolved | no D18 attention behavior       | Plan age/lifecycle      |
| Public/search/cache/Giving/finance | D16 and each source/finance owner                                                                                                                                                 | no Plan-date/age dependency     | Plan date/age authority |

## Domain invariants and valid cardinality

1. A Default Site Locale Plan has one stable target Site Locale and zero
   authoritative target dates, launch dates, due dates, planned/scheduled
   activation times, expiry times, or deadlines.
2. Plan audit/source timestamps remain evidence and never select Plan state;
   source-workflow schedules and Mission Control task timing retain their own
   separate contracts.
3. Plan age changes no state, priority, owner, readiness, visibility,
   activation, expiry, or public result.
4. An Active Plan persists until a D17 terminal command/outcome.
5. Source-workflow dates/schedules remain source-owned; Mission Control task due
   dates/reminders remain Mission Control-owned; neither propagates into Plan.
6. Plan time does not populate source-workflow schedules or Mission Control
   task dates, reminders, or priorities.
7. Readiness depends only on current source facts and authorization.
8. A Plan never activates from time, a source-workflow schedule, or a Mission
   Control task due/reminder event.
9. Generic metadata, imports, providers, jobs, triggers, or direct SQL cannot
   establish date semantics.
10. UI/API/export absence is honest; no blank field implies future support.
11. Hidden source-workflow dates, Mission Control timing, or activity times leak
    no existence signal.
12. Historical timestamps cannot be backdated to change product truth.
13. D18 adds no lifecycle state, scheduler, queue, task, or workflow engine.
14. A future date requires a separately accepted amendment and migration.

## Lifecycle and transition model

D18 adds no lifecycle state. D17 remains controlling:

```text
Absent → Active → Cancelled | Superseded | Activated
                         | Satisfied elsewhere | No longer applicable
```

Time is not an arrow in this model. Passing an hour, day, month,
source-workflow schedule, Mission Control task due date, retention date, or
calendar event produces no transition.

## Current behavior, intended behavior, and permanent path

| Concern      | Current `develop` behavior                                                                                                                                                                                                                                                                                                                    | D18 intended behavior                                                                  | Permanent path                                                               |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Plan date    | no Plan runtime or date contract                                                                                                                                                                                                                                                                                                              | no date concept                                                                        | keep D17 schema/commands date-free                                           |
| Site/default | no stable implemented Site/default; `siteId: null`                                                                                                                                                                                                                                                                                            | D16 remains sole current authority                                                     | D15/D16 before D17/D18                                                       |
| Task timing  | `mission_control_tasks.due_at` and reminder rows exist; the generic manual-task UI starts from today's date; an available finance-shaped helper can calculate higher urgency at `24`/`48` hours when invoked with an older `firstSeenAt`, while the current create path supplies the current instant and proves no later automatic escalation | Mission Control-owned; a Plan-created request begins undated, unreminded, and `normal` | qualify the Site adapter without date propagation or adopting the age helper |
| CMS schedule | Payload supports drafts and can support scheduling; current Page config does not authorize D18                                                                                                                                                                                                                                                | no Plan scheduling                                                                     | keep CMS source policy separate                                              |
| Audit time   | timestamps exist broadly                                                                                                                                                                                                                                                                                                                      | evidence only                                                                          | immutable receipts/events                                                    |
| UX           | no Site Languages Plan UI                                                                                                                                                                                                                                                                                                                     | persistent undated row/filter                                                          | Maia Site surface; no calendar/dashboard                                     |
| Migration    | no valid Plan history                                                                                                                                                                                                                                                                                                                         | infer neither Plans nor dates                                                          | additive start-empty rollout                                                 |

## Full adversarial review by required category

Every category has a material concern if “store no target date” is treated as
an informal UI choice. The selected direction survives only when absence is a
contract invariant across storage, commands, projections, source-workflow/
Mission Control integration, lifecycle, operations, and staff language.

### 1. Problem validity, necessity, and alternatives

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                                                                                                     | Severity / likelihood | Evidence and reasoning                                                                                                                                                                                                                                                                                                                                                                                | Effect on D18                                         | Permanent fix and exact language                                                                                                                                |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Core could add a date merely because other CMS products support one, freezing a field before a known ministry coordination job exists. The strongest alternative is one optional Plan-only civil date; it offers a shared aspiration but immediately requires edit, clear, locale, reminder, “late,” and ownership policy. |           High / High | **Repository fact:** D17 already preserves durable intent, source work, owners, and readiness without time. **Verified external fact:** Contentful task due dates are optional, and Sanity explicitly supports an active **Undecided** release; capability is not proof of Core need. **Unresolved unknown:** no representative Core staff research establishes that a Plan date improves completion. | Confirms Option 1 and rejects speculative date state. | **D18-R1, R6, and R20:** Phase 24 has no Plan date concept or empty affordance; future adoption requires evidence and a separately accepted contract.           |
| Removing the field but making old Plans hard to find would solve schema simplicity while failing the staff job.                                                                                                                                                                                                            |         High / Medium | **Repository fact:** D17-AC35 already requires persistent discovery in **Site → Languages**. **External evidence:** mature tools keep work visible in the source context and/or a central actionable-work view.                                                                                                                                                                                       | Narrows “no date” to include structural rediscovery.  | **D18-R7–R8:** every active Plan remains in its permitted locale row and the later Phase 24 authorized Sites filter, ordered by action meaning rather than age. |

### 2. Brittleness

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                                                 | Severity / likelihood | Evidence and reasoning                                                                                                                                                                                                                                                                                               | Effect on D18                                              | Permanent fix and exact language                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| A nullable `target_date`, flexible JSON metadata, `created_at + 30 days`, copied task due date, or provider release time can behave as a hidden deadline. It works until a time zone changes, a task is rescheduled, or another integration interprets it differently. |           High / High | **Current source:** shared tasks expose `due_at`, reminder rows, and an available age-based urgency helper; current creation does not prove later automatic escalation. **External fact:** Sanity keeps release type, estimated time, and the separate Schedule action explicit because they have different meaning. | The informal answer is unsafe; absence must be structural. | **D18-R1–R5 and R13–R14:** no nullable/sentinel/metadata date, no derivation, no propagation, and no age-driven Plan state or urgency. |

### 3. Technical debt

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                              | Severity / likelihood | Evidence and reasoning                                                                                                                                                                                                                   | Effect on D18                                                   | Permanent fix and exact language                                                                                                                                                  |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A dormant date column, scheduler interface, calendar component, compatibility alias, or “future use” event creates unsupported branches every schema, import, API, UI, and migration must preserve. |           High / High | **Product judgment:** truly absent state costs less than a permanently nullable seam. **Repository fact:** D17 deliberately avoids a second workflow/scheduler product.                                                                  | Strengthens Option 1 from a UI omission into a domain omission. | **D18-R1, R13, R16–R17, and R20:** add no field/index/event/queue/UI seam and require a later versioned amendment instead.                                                        |
| Reusing generic task seams could inherit the manual form's today default or adopt the available 24/48-hour urgency helper with Plan/request age.                                                    |         High / Medium | **Current source:** manual task form state starts its date at today; `getSuggestedAttentionUrgency` can use an older `firstSeenAt`, while the current task create path passes the current instant and safely defaults `dueAt` to `null`. | Requires a qualified Site adapter rather than generic reuse.    | **D18-R14:** a Plan-created coordination request starts with `due_at = NULL`, no reminder, and explicit `normal` urgency; later Mission Control edits remain independently owned. |

### 4. Edge cases

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                                                                                      | Severity / likelihood | Evidence and reasoning                                                                                                                                                                                                                                  | Effect on D18                                                      | Permanent fix and exact language                                                                                                                                   |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A Plan may remain active for years; cross DST, leap-day, and time-zone changes; become ready immediately; regress after review; have a Mission Control task that is backdated, rescheduled, overdue, or deleted; or outlive its creator. Treating any clock as Plan truth makes valid history inconsistent. |           High / High | **Repository fact:** D17 lifecycle already handles current-source changes, creator departure, terminal Site states, replacement, and independent owner work. **Product judgment:** event sequence and current heads are stable where civil time is not. | Adds explicit time-independence and separately owned timing cases. | **D18-R2–R5, R9, and R11–R15:** wall-clock passage, source-workflow schedules, and Mission Control timing cause no Plan state; only authorized D17 transitions do. |
| A Mission Control task may legitimately acquire a due date after the Plan was created. Blocking that would overreach; rolling it up would create a false launch promise.                                                                                                                                    |         Medium / High | **Accepted repository direction:** Mission Control owns task due dates/reminders under ADR-0054; D17 Plan truth remains Site-owned.                                                                                                                     | Narrows D17’s older “no due dates” wording.                        | **D18-R4 and R14:** permit independently authorized Mission Control timing, label it as a task date, and prohibit both-way propagation or Plan-lifecycle effect.   |

### 5. Footguns

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                                                              | Severity / likelihood | Evidence and reasoning                                                                                                                                                                                                                    | Effect on D18                                               | Permanent fix and exact language                                                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A blank calendar, **No deadline**, red age, **Overdue**, countdown, “schedule later,” or default-today picker tells staff a missing date is incomplete or that Core will switch the website later. An adapter could also turn `created_at` into a due date without a schema change. |           High / High | **Verified external fact:** WordPress distinguishes Draft/Pending from Future/Scheduled, and Sanity requires an explicit schedule action. **Current source:** the generic task form’s date default makes accidental population plausible. | Requires consequence-led copy and negative UI/schema proof. | **D18-R5–R6, R10, R13–R14, and R19:** omit all date controls/states; say the current language remains live and nothing changes automatically; reject derived task timing. |

### 6. Tenant safety

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                      | Severity / likelihood | Evidence and reasoning                                                                                                                                                                                             | Effect on D18                                                                     | Permanent fix and exact language                                                                                                                                                                 |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A roll-up of hidden task due dates, owner timing, “last active,” old/urgent counts, or reminder outcomes can reveal another Tenant, restricted ministry location, unpublished campaign timing, or existence of hidden work. |     Critical / Medium | **Accepted OpenSpec direction:** tenant isolation and non-enumeration apply to rows, projections, caches, and privileged paths. **Repository fact:** D17 already forbids hidden blocker counts and timing signals. | Does not reject no-date; requires filtered display and audience-complete caching. | **D18-R7, R12–R14, and R18:** reauthorize exact scope, omit hidden counts/timing, never aggregate source-workflow or Mission Control dates into Plan status, and test cross-Tenant poison cases. |

### 7. Database, RLS, and authorization safety

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                                                                                           | Severity / likelihood | Evidence and reasoning                                                                                                                                                                                     | Effect on D18                                                                           | Permanent fix and exact language                                                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Even with no named column, permissive JSON, RPCs, `SECURITY DEFINER`, service-role workers, imports, support tools, AI commands, generated views, or direct Data API paths could accept or infer temporal semantics. An allowed update could move a row into forbidden “scheduled” meaning without crossing RLS. |     Critical / Medium | **Repository fact:** service paths can bypass ordinary RLS, so command validation and same-boundary poison tests are required. **Current source:** shared-task date/reminder storage is real and adjacent. | Requires exact schemas and operation-correct authorization, not application convention. | **D18-R12–R17:** reject reserved keys recursively before effects; server-derive audit time; prohibit temporal generated columns/triggers; test `USING` and `WITH CHECK` plus every privileged path. |
| A Plan-specific task row could be written with a guessed due date or age urgency while the Plan table remains date-free.                                                                                                                                                                                         |         High / Medium | **Current source:** task `due_at`, reminder rows, and urgency helpers exist.                                                                                                                               | Changes implementation requirements for the future D17 adapter.                         | **D18-R14:** enforce null initial due date, zero reminder rows, explicit `normal` urgency, and no reverse flow from later task timing.                                                              |

### 8. Overengineering

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                                                                                                                             | Severity / likelihood | Evidence and reasoning                                                                                                                                                                                                                | Effect on D18                                         | Permanent fix and exact language                                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Supporting dates properly would pull in civil-time versus instant policy, tenant time zones, recurrence, snooze, notification preferences, escalation, calendar views, scheduler recovery, late/overdue semantics, and admin configuration. Implementing only half would be brittle; implementing all would be a project product without evidence. |           High / High | **Verified external fact:** mature CMS release scheduling is a distinct workflow with explicit schedule/unschedule behavior and permissions. **Repository fact:** Phase 34 owns arbitrary workflow and D17 intentionally stays small. | Confirms no-build as the proportional permanent path. | **D18-R1, R5–R6, R10, and R20:** keep one persistent Plan and current source work; add no scheduler/calendar/reminder framework. |

### 9. UX/UI and user friction

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                 | Severity / likelihood | Evidence and reasoning                                                                                                                                                                                                                                                                         | Effect on D18                                            | Permanent fix and exact language                                                                                                                                                                                                                |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Without careful copy, staff may think “planned” means scheduled, or may fear they forgot a required date. With no rediscovery path, they may forget the Plan. A dense release calendar would increase effort and hide the next action. |           High / High | **External evidence:** Sanity makes **Undecided** distinct from timed releases; Contentful exposes pending tasks centrally while keeping task due dates optional; WordPress separates Pending from Future. **Assumption:** Core’s exact copy still needs representative comprehension testing. | Accepts no-date only with a complete persistent journey. | **D18-R6–R8 and R19:** show exact target, **Planned**, current default/serving state, current blockers, and one next action; omit “unscheduled/no deadline”; provide the later Phase 24 authorized Sites filter and mobile/accessibility proof. |
| A Mission Control-owned date shown as **Review due** can still be mistaken for the website launch date.                                                                                                                                |         High / Medium | **Product judgment:** proximity to the Plan makes unlabeled timing ambiguous.                                                                                                                                                                                                                  | Requires more precise task-row copy.                     | **D18-R4 and R19:** use **Review task due 15 October** plus **This task date does not schedule the website** where needed; never roll it into Plan summary.                                                                                     |

### 10. Source of truth, ownership, and domain invariants

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                          | Severity / likelihood | Evidence and reasoning                                                                                                                                                                                      | Effect on D18                                                      | Permanent fix and exact language                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Plan audit time, task due date, Page schedule, CMS release estimate, readiness `checked_at`, or public cache TTL could become a competing launch/default authority. That creates circular synchronization and historical drift. |       Critical / High | **Repository fact:** D16 owns current default/root, D17 owns private intent, source domains own their facts, Mission Control owns task timing, and ADR-0029 prefers stable reference over copied authority. | Requires an explicit ownership map and non-propagation invariants. | **D18-R2–R4, R9–R14, and source map:** Plan lifecycle is event/head-owned; source-workflow and Mission Control timing stay separately owned; D16 explicit activation alone changes public default. |

### 11. Hidden coupling

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                                                             | Severity / likelihood | Evidence and reasoning                                                                                                                                                  | Effect on D18                      | Permanent fix and exact language                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Plan behavior could silently depend on Mission Control `due_at`/reminders/urgency, Payload scheduling, Inngest timers, Vercel cache time, a provider release clock, email delivery, or analytics age. Future changes in those systems would then alter Site behavior unexpectedly. |         High / Medium | **Current source:** shared task timing exists, while no Site Plan adapter exists. **Repository principle:** integrations execute/project; they do not own domain truth. | Narrows allowed integration seams. | **D18-R4–R5, R10, R14, and R16:** typed reference-only adapters, no bidirectional timing, no timer dependence, and provider-neutral Plan lifecycle. |

### 12. Failure modes

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                                            | Severity / likelihood | Evidence and reasoning                                                                                                                                                                              | Effect on D18                                                  | Permanent fix and exact language                                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A timer may fire twice, late, early, or after authorization/source/default changes; a provider may accept a schedule but lose the response; a reminder may fail after a Plan write. Any time-owned Plan behavior would create ambiguous public or staff outcomes. |     Critical / Medium | **Verified external fact:** scheduling products expose explicit schedule/unschedule states and failure handling. **Repository fact:** D16 requires fresh human review and expected-head activation. | Rejects timers and deferred activation entirely.               | **D18-R3, R5, R10, and R15:** no timer/reminder/schedule effect; Plan commands remain receipt-reconciled and public activation remains explicit D16 work. |
| Unsupported date input could be silently ignored while the Plan saves, leaving staff believing a commitment was recorded.                                                                                                                                         |         High / Medium | **Product judgment:** partial acceptance is misleading and hard to repair.                                                                                                                          | Requires atomic validation before the durable business effect. | **D18-R13 and R15:** reject the entire changed-meaning command before Plan revision, receipt, task, event, or outbox effect.                              |

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                                                            | Severity / likelihood | Evidence and reasoning                                                                                         | Effect on D18                                    | Permanent fix and exact language                                                                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Wall-clock comparison could expire an Active Plan, reorder concurrent revisions, revive an old target, or make two identical histories produce different results. Client clocks, time zones, DST, leap seconds/days, backdated imports, and out-of-order events amplify the risk. |     Critical / Medium | **Repository fact:** D17 uses expected revisions, current heads, CAS, immutable receipts, and one race winner. | Makes sequence/current-head semantics mandatory. | **D18-R2–R3, R11, and R15:** only authorized D17 transitions change lifecycle; trusted event sequence, not timestamps, establishes currentness; time-travel tests prove equivalence. |
| Reusing an idempotency key with a newly supplied date might be treated as the same command or silently mutate hidden state.                                                                                                                                                       |         High / Medium | **Repository rule:** changed meaning under one key must reject.                                                | Adds an explicit negative retry case.            | **D18-R15:** unsupported temporal input is changed meaning and rejects with zero additional effects; valid date-less retries return the original outcome.                            |

### 14. Data integrity risks

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                                                                  | Severity / likelihood | Evidence and reasoning                                                                                                                    | Effect on D18                                                   | Permanent fix and exact language                                                                                                                             |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Migration/backfill could infer a target date from Page schedules, task due dates, creation time, calendars, campaigns, analytics, comments, or free text. Imports might accept a date column while the UI cannot show it. The result is stale shadow state and contradictory reporting. |           High / High | **Current source:** there is no authoritative Plan history to migrate. **Repository principle:** inferred intent is not historical truth. | Requires start-empty migration and strict round-trip contracts. | **D18-R13, R16–R17:** infer no Plan/date, reject temporal import keys atomically, omit date properties from reads/exports, and quarantine/remove prototypes. |
| A task date edit could revise Plan identity, dedupe lineage, readiness, or reports through a convenience join.                                                                                                                                                                          |         High / Medium | **Repository fact:** D17 task projection is subordinate and semantic-deduped.                                                             | Adds explicit non-revision/non-dedupe behavior.                 | **D18-R4, R14–R15:** task timing changes only task history; they create no Plan revision, new attention lineage, readiness change, or public effect.         |

### 15. Security and privacy risks

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                                                                                                 | Severity / likelihood | Evidence and reasoning                                                                                                                                                                                                    | Effect on D18                                                                 | Permanent fix and exact language                                                                                                                                                         |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Planned launch timing, source-workflow schedules, Mission Control due dates, last activity, reminder failures, and “old” badges can reveal sensitive campaign timing, missionary location/activity, staffing gaps, or restricted work through logs, exports, caches, notifications, support screens, or public errors. |     Critical / Medium | **Accepted platform boundary:** sensitive data must be minimized and non-enumerating. **Product judgment:** no-date removes an unnecessary sensitive attribute but does not make audit or separately owned time harmless. | Requires minimization, current authorization, and non-public storage/display. | **D18-R2, R12–R13, R16, and R18:** retain necessary audit evidence under its owner, expose only permitted timing, exclude public surfaces/caches, and redact logs/exports appropriately. |

### 16. Scalability and performance risks

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                                                     | Severity / likelihood | Evidence and reasoning                                                                                                                                                                                 | Effect on D18                                                      | Permanent fix and exact language                                                                                                                                                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Periodic scans of every active Plan for age, reminders, expiry, or escalation scale with all old Plans and create retry storms, hot indexes, duplicate notifications, and large-Tenant unfairness. Conversely, an unindexed authorized filter could make rediscovery slow. |         High / Medium | **Product judgment:** event/current-state reads are cheaper and more deterministic than perpetual age polling. **Repository fact:** D17 already requires bounded projections and performance monitors. | Confirms no timer scans; preserves a small indexed discovery seam. | **D18-R3, R5, R7–R8, and R18:** no age-selecting worker/index; query exact Tenant/Site/current active Plan and the later authorized status projection; benchmark production-shaped authorized lists. |

### 17. Operational burden

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                                                         | Severity / likelihood | Evidence and reasoning                                                                                                                            | Effect on D18                                                | Permanent fix and exact language                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dates create recurring support around wrong time zones, missed/duplicate reminders, overdue cleanup, schedule recovery, stale calendars, and direct database repairs. No date can still create forgotten Plans if operators rely on tribal knowledge instead of persistent UI. |           High / High | **External evidence:** full schedulers require explicit management surfaces. **Repository fact:** D17 gives Plans an ordinary Site-language home. | Requires both no scheduler and no manual cleanup dependency. | **D18-R3, R6–R8, R10, R17–R18:** active Plans remain visible and explicitly resolvable; no age cleanup, calendar administration, timer runbook, or SQL repair path. |

### 18. Observability and auditability gaps

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                                                                    | Severity / likelihood | Evidence and reasoning                                                                                                                                          | Effect on D18                                              | Permanent fix and exact language                                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Operators may confuse a Plan’s age with an SLO breach, or technical freshness/retry windows with a staff deadline. Hidden temporal fields and propagation may never appear in ordinary logs. A staff member still needs durable history of who planned/cancelled/activated what and when. |           High / High | **Repository fact:** D17 has a provisional 300-second readiness freshness ceiling and command/routing operational thresholds; those are not business lifecycle. | Requires separate business audit and invariant monitoring. | **D18-R2, R18, monitors:** immutable event/receipt history remains; zero-tolerance temporal-field/effect monitors catch violations; age alone neither pages nor mutates. |

### 19. Dependency and integration risks

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                                      | Severity / likelihood | Evidence and reasoning                                                                                                                                                                                                             | Effect on D18                                  | Permanent fix and exact language                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Payload/Sanity scheduling, Contentful-style task reminders, Mission Control dates, email providers, calendars, or workflow packages may appear convenient and later become unavailable, rate-limited, differently authorized, or semantically incompatible. |         High / Medium | **Verified external fact:** vendor products distinguish their own release/task timing semantics. **Repository fact:** Core source/platform boundaries and Mission Control—not provider convenience—own their respective authority. | Keeps D18 provider-neutral and avoids lock-in. | **D18-R4, R10, R14, R16, and R20:** integrations may expose separately owned facts only; no external field/event becomes Plan date, state, or activation authority. |

### 20. Migration, rollout, and upgrade risks

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                             | Severity / likelihood | Evidence and reasoning                                                                                                                                                        | Effect on D18                                                   | Permanent fix and exact language                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Writers might accept date fields before readers reject them; old clients may send prototype aliases; a backfill may reinterpret timestamps; rollback may leave timers or reminders active after the UI disappears. |         High / Medium | **Current source:** no Plan runtime or valid legacy Plan dates exist. **Repository rule:** reader/constraint compatibility precedes writers and rollback must preserve truth. | Requires an additive, start-empty, negative-capability rollout. | **D18-R13, R16–R17, and R20:** land strict readers/contracts first, write no temporal state, run no backfill/timer, reject aliases, and preserve inert Plan history through rollback. |

### 21. Testability, traceability, and proof

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                                                                                                                                       | Severity / likelihood | Evidence and reasoning                                                                                                                                                                                                                                   | Effect on D18                                          | Permanent fix and exact language                                                                                                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A screenshot with no date field can pass while APIs accept dates, workers expire Plans, tasks inherit age urgency, exports leak timing, time zones change outcomes, or staff cannot rediscover the Plan. Documentation may also retain contradictory “no due dates” wording that wrongly blocks Mission Control-owned dates. |           High / High | **OpenSpec rule:** requirements must be observable and falsifiable across positive, negative, authorization, failure, concurrency, migration, and accessibility scenarios. **Repo audit:** D17 wording and the unanswered D18 log require clarification. | Requires cross-layer absence tests and explicit trace. | **D18-R1–R20 and D18-AC1–AC60:** prove schema/API/UI absence, clock invariance, task independence, privacy, UX, migration, and trace glossary → decision → eventual ADR/PRD/OpenSpec/design/tickets/tests/release evidence. |

### 22. Other development hazards

**Material concern exists: yes.**

| What could go wrong and why it matters                                                                                                                                                                             | Severity / likelihood | Evidence and reasoning                                                                                                                                                                                                               | Effect on D18                                                       | Permanent fix and exact language                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| “No date” could be read as “never draw attention,” causing a ready Plan to sit unnoticed; or D19 could reintroduce a disguised inactivity clock. Feature flags might hide the UI while a background timer remains. |         High / Medium | **External UX synthesis:** durable source status plus state-driven actionable work is a stronger modern pattern than recurring age reminders. **Product judgment:** notification presentation is a separate decision from Plan time. | D18 stays date-free and leaves only a narrowly framed D19 decision. | **D18-R5–R8 and R20:** no age-based behavior; persistent discovery is mandatory; D19 may decide one deduplicated state-transition attention projection, never time-triggered lifecycle or public effect. |

## Final disposition after adversarial review

**Accept with required amendments.**

The answer remains correct. The required amendments are the exact corrected
decision at the start of this record plus D18-R1–R20. They change “do not fill
in a target date” into the stronger permanent rule: the Plan owns no date
concept, source-workflow and Mission Control timing stay independently owned,
time never drives Plan lifecycle or urgency, the Plan stays structurally
discoverable, and future temporal behavior requires its own evidence and
explicit amendment.

## Required acceptance criteria and proof

### Contract and storage absence

1. **D18-AC1 — No Plan date storage.** Schema inspection finds no Plan-owned
   target-date, launch-date, due-date, deadline, planned/scheduled activation-
   time, expiry-time, duration, priority, urgency, reminder, scheduler, timer,
   or related index/trigger/queue. D17's **Activated** terminal state/event/
   receipt and trusted actual activation timestamp remain permitted evidence.
2. **D18-AC2 — Absence is not null.** No nullable field, empty string, zero
   date, sentinel, release type, or generic metadata key represents “no target
   date.”
3. **D18-AC3 — No command property.** Create, replace, review, cancel, and
   activate command types and JSON/OpenAPI schemas expose no optional or
   nullable Plan date/schedule/priority property.
4. **D18-AC4 — No read property.** API, RPC, view, cache, event projection,
   and export reads omit the property; none returns `targetDate: null` or a
   blank date column.
5. **D18-AC5 — Reserved Plan aliases reject.** Within a Plan command/envelope,
   `target_date`, `targetDate`, `launch_at`, `launchDate`, `due_at`, `dueDate`,
   `deadline`, `scheduled_at`, `activate_at`, `remind_at`, `expires_at`,
   `duration`, Plan `priority`, Plan `urgency`, and equivalent aliases return a
   structured unsupported-field error. Separate typed Mission Control commands
   remain governed by the task contract.
6. **D18-AC6 — Nested Plan smuggling rejects.** The same Plan semantics nested
   in Plan-owned metadata, extensions, Plan task-link metadata, provider
   payloads, AI tool input, import extras, or versioned Plan envelopes are
   rejected recursively by an exact allowlist. A separately authorized typed
   Mission Control mutation is not Plan metadata.
7. **D18-AC7 — Atomic invalid input.** A rejected temporal payload creates no
   Plan, revision, event, receipt, task, link, notification, outbox, cache, or
   audit business effect beyond the security/validation attempt record.
8. **D18-AC8 — No derived database state.** No view, function, generated
   column, trigger, policy, or query derives Plan timing with `COALESCE` or
   arithmetic over audit, task, Page, publication, or analytics time.
9. **D18-AC9 — No timer infrastructure.** D18 emits no cron, delayed job,
   scheduled event, `next_action_at`, reminder, expiry, or deferred-activation
   effect.
10. **D18-AC10 — Future additions fail closed.** Compatibility tests reject a
    newly introduced temporal key until a separately accepted, versioned D18
    amendment and migration exist.

### Evidence time, lifecycle, and public non-effects

11. **D18-AC11 — Trusted audit timestamps.** Created, revised, reviewed,
    checked, received, committed, observed, cancelled, superseded, and
    activated times come from their trusted server/database owner and retain
    explicit evidence labels.
12. **D18-AC12 — Caller time has no authority.** Caller-supplied audit time is
    rejected or ignored and cannot change event ordering, current revision,
    lifecycle, readiness, priority, visibility, or public output.
13. **D18-AC13 — Clock-invariant authority.** Two identical authoritative Plan
    histories evaluated under different clocks and user time zones produce the
    same business state. The sole permitted clock-dependent difference is D17
    freshness revoking reuse/display of cached favorable readiness proof and
    requiring a recheck; time never grants an action.
14. **D18-AC14 — Long time travel.** Advancing time by hours, leap days, DST
    changes, months, or years creates no Plan transition, Plan urgency,
    Plan-owned/derived reminder, expiry, hide/archive, task, or public effect.
    D17 freshness may only revoke stale favorable proof and require a recheck;
    independently authorized Mission Control reminders remain valid task
    behavior.
15. **D18-AC15 — Active persists.** An Active Plan remains persistently
    visible until one valid D17 Activated, Cancelled, Superseded, Satisfied
    elsewhere, or No longer applicable outcome commits.
16. **D18-AC16 — Readiness is factual.** Passing time cannot satisfy, waive,
    add, or reorder a blocker; current source facts alone determine permitted
    readiness.
17. **D18-AC17 — Freshness is not a deadline.** Readiness evidence older than
    the provisional 300-second ceiling suppresses **Ready to review** or shows
    **Could not be checked**; it never shows late/overdue or changes lifecycle.
18. **D18-AC18 — Operational time is not product time.** Retry, unknown-command,
    dead-letter, cache, and latency SLO thresholds may alert operators but
    cannot mutate Plan/default/source/task business state.
19. **D18-AC19 — No Plan-originated public effect.** No clock, due, schedule,
    reminder, task, provider, Page, publication, cache, or notification event,
    merely by timing or through D18, advances the D16 default head or creates a
    Plan-originated root/route/search/canonical/`hreflang`/sitemap/public-cache
    effect. A source-owner publication may create its own public effect only
    under its separate contract.
20. **D18-AC20 — Finance neutrality.** No Plan time/age or D18/source-workflow/
    Mission Control timing event creates or changes Giving, currency, Legal
    Entity, Stripe, settlement, bank, receipt, contribution, commitment,
    ledger, or accounting truth. Finance owners retain independently authorized
    temporal behavior under their own contracts.

### Source-workflow, Mission Control, and integration independence

21. **D18-AC21 — Plan request starts undated.** A D17 Plan-specific shared
    coordination request writes `due_at = NULL` even though the shared task
    schema supports a date.
22. **D18-AC22 — No initial reminder.** That request creates zero
    `mission_control_task_reminders` rows and emits no reminder event.
23. **D18-AC23 — Neutral initial urgency.** The Site adapter supplies literal
    code-owned `normal` urgency under the current enum and does not call
    `getSuggestedAttentionUrgency` using Plan, request, audit, or source age.
24. **D18-AC24 — No generic-form default.** Programmatic Plan routing cannot
    inherit the manual task form’s default-today date, medium priority, or
    default reminder behavior.
25. **D18-AC25 — Mission Control may act independently.** A currently
    authorized actor may later set/clear a Mission Control-owned task due date
    or reminder under the shared-task contract without creating a Plan field or
    revision.
26. **D18-AC26 — Task-date edit is Plan-inert.** Changing, backdating,
    rescheduling, clearing, or passing a Mission Control task due date creates
    no Plan revision, peer request, dedupe-key change, readiness change,
    terminal outcome, or activation.
27. **D18-AC27 — Task urgency is Plan-inert.** Mission Control-owned urgency
    changes and reminder delivery/failure never become Plan priority, state,
    readiness, or public truth.
28. **D18-AC28 — Page scheduling is independent.** Creating, changing,
    cancelling, missing, or executing a Page/publication schedule never
    schedules or activates the Plan.
29. **D18-AC29 — Task date display is subordinate.** When permitted, UI copy
    reads **Review task due 15 October** and, where ambiguous, **This task date
    does not schedule the website**; it never reads **French launch** or rolls
    the date into Plan summary.
30. **D18-AC30 — Terminal cleanup is narrow.** D17 terminal outcomes
    idempotently close only Plan-specific follow-ups and pending notifications/
    reminders, preserve task/source/audit history, and never clear unrelated
    source-workflow timing, Mission Control history, or source work.

### Authorization, privacy, imports, and migration

31. **D18-AC31 — Exact-scope reads.** Every Plan/source-time read reauthorizes
    current Tenant, environment, Site, role/subrole, capability, field, and
    restricted-resource scope.
32. **D18-AC32 — Hidden timing is non-enumerating.** Forbidden task dates,
    owner activity, Plan age, reminder state, and source schedules add no count,
    label, relative time, ordering clue, cache variation, latency clue, or
    existence signal.
33. **D18-AC33 — Operation-correct RLS.** Applicable `SELECT`, `INSERT`,
    `UPDATE`, and `DELETE` tests cover both `USING` and `WITH CHECK`; a permitted
    mutation cannot move a record into hidden temporal/scheduled meaning.
34. **D18-AC34 — Privileged poison matrix.** Service role, table owner,
    `BYPASSRLS`, RPC/`SECURITY DEFINER`, Payload Local API, worker, import,
    support, impersonation, break-glass, AI, Data API, direct SQL, and repair
    paths cannot store or infer Plan temporal semantics.
35. **D18-AC35 — Public absence.** Unauthenticated/public APIs, HTML, metadata,
    search, sitemap, cache, logs, and errors expose no Plan existence, age,
    audit time, task date, schedule, or reminder signal.
36. **D18-AC36 — Import rejects safely.** CSV/API/import fixtures containing
    temporal/priority Plan columns fail before any row/effect; the importer
    reports the unsupported field without echoing sensitive values.
37. **D18-AC37 — Export stays honest.** Plan exports contain neither populated
    nor blank temporal/priority columns. Authorized source-workflow exports and
    Mission Control task exports retain their own clearly owned fields.
38. **D18-AC38 — No inferred migration.** Migration creates no Plan or Plan
    date from locale/Site creation, Page/publication/task/reminder dates,
    audits, calendars, campaigns, analytics, files, comments, documents,
    messages, imports, or free text.
39. **D18-AC39 — Prototype quarantine.** Any discovered prototype/null/blank
    Plan-date data is inventoried and removed or quarantined as unsupported;
    it is never treated as user intent or backfilled.
40. **D18-AC40 — Retention stays separate.** Actor anonymization does not
    expire Site-owned intent or reinterpret audit time as a deadline. An
    authoritative Tenant/Site/privacy terminal event first commits D17's **No
    longer applicable** outcome; terminal history then follows the later
    applicable records-schedule contract.

### Staff UX, accessibility, and rediscovery

41. **D18-AC41 — No Plan date affordance.** The Plan form/summary on desktop
    and mobile contains no date picker, blank row, dash, calendar/schedule icon,
    **Add date**, **No date set**, **Unscheduled**, **No deadline**, countdown,
    or disabled date field. Separately authorized source/task editors retain
    their own controls.
42. **D18-AC42 — No Plan age status.** The Plan summary/state never shows
    **Late**, **Overdue**, **Stale**, **At risk**, red age, or urgency derived
    only from elapsed time. A source-workflow/task row or owner surface may show
    its separately authorized status without rolling it into the Plan.
43. **D18-AC43 — Consequence-led row.** The active target row names the exact
    Site Locale, **Planned**/current readiness, permitted remaining work,
    current default and serving state, non-automatic consequence, and one
    permitted next action. A suspended Site says its current default remains
    unchanged and the Site is not currently public; it never claims a live
    language is serving.
44. **D18-AC44 — Persistent Languages home.** Every successful authorized
    **Site → Languages** read includes the active Plan on its target locale row
    regardless of age.
45. **D18-AC45 — Later multi-Site discovery.** The later Phase 24 authorized
    Sites management surface can filter **Planned default**, reveals only
    permitted Sites, and creates no separate calendar/project dashboard.
46. **D18-AC46 — Actionable ordering.** Within the Plan, **You can do now**
    precedes **Needs another owner**. Cross-Site ordering uses actionability,
    then stable Site/locale labels and stable identity; time never implies
    priority or ordering.
47. **D18-AC47 — Pre-registered copy-comprehension gate.** Before broad
    release, Product Research pre-registers and executes a representative
    protocol naming minimum sample size, role mix, locale/language mix, device/
    bandwidth/accessibility mix, task start/end, scoring, pass thresholds, and
    confidence rule before observing results. It must test finding/resuming the
    Plan, exact current default, serving versus suspended state, no automatic
    change, and task-date-versus-launch-date comprehension. Failure against the
    predeclared threshold blocks the tested copy and requires a repeated study.
48. **D18-AC48 — Meaningful states only.** Staff copy uses **Planned**,
    **Waiting for owner**, **Needs attention**, **Changed since review**,
    **Could not be checked**, and **Ready to review** only when current D17
    evidence supports them. Suspension produces **Needs attention · Site
    suspended**, never **Ready to review**, and emits no ready occurrence until
    a fresh favorable serving/readiness check succeeds.
49. **D18-AC49 — Full accessibility matrix.** Date omission removes its label,
    helper, error, keyboard stop, and screen-reader blank; remaining controls
    pass WCAG 2.2 AA, Core target/focus/reflow/zoom/forced-color/reduced-motion,
    long/CJK/RTL, and status-announcement requirements.
50. **D18-AC50 — Mobile/weak-network completeness.** At 320 CSS pixels and
    400% zoom, one reading order retains Site, target locale, current default/
    serving state, current Plan state, and one next action; server-backed
    commands reconcile unknown outcomes without duplicate Plan/task effects.

### Concurrency, performance, rollout, and trace

51. **D18-AC51 — Same-meaning retry.** Repeating a valid undated command with
    the same business key returns the original receipt and creates no duplicate
    Plan/revision/request/notification/audit effect.
52. **D18-AC52 — Changed-meaning retry.** Reusing that key with any temporal or
    priority property rejects as changed meaning and cannot alter or reveal the
    prior receipt.
53. **D18-AC53 — Concurrent clocks are irrelevant.** Concurrent Plan replace/
    cancel/review and default-head changes resolve through D17 expected
    revisions/CAS. Concurrent source-workflow schedule and Mission Control task
    due-date edits resolve under their own owners and remain Plan-inert;
    timestamp order cannot choose a Plan/default winner.
54. **D18-AC54 — No age scans.** Query plans, job registries, and production
    telemetry show no worker/index scanning Active Plans by age for mutation,
    notification, expiry, or escalation.
55. **D18-AC55 — Production-shaped list bound.** Before release, the later spec
    names a supported-capacity fixture with exact Tenant/Site/locale/Plan/
    source-row cardinalities. At that fixture, at least 100 authorized Plan/
    Languages/Sites-filter reads over 15 minutes stay at or below D17's
    provisional `500 ms` p95 budget without per-row timing queries or cross-
    Tenant cache reuse.
56. **D18-AC56 — Mixed-version safety.** Old clients sending date aliases fail
    clearly; old readers tolerate the date-free Plan; no code version can
    unlock a dormant scheduler or reinterpret an audit timestamp.
57. **D18-AC57 — Rollback safety.** Disabling Plan writers/UI leaves inert
    private history and requires no timer shutdown, reminder purge, date repair,
    public rollback, or source-date restoration.
58. **D18-AC58 — Observability separation.** Dashboards distinguish immutable
    business history, security audit, technical freshness/retries, invariant
    violations, and usability signals; none labels old age as a Plan defect.
59. **D18-AC59 — Decision-chain trace.** Exact no-date/source-independence
    language traces through the glossary, D17 clarification, D18 record,
    decision log, and eventual ADR/PRD/OpenSpec/design/schema/API/UI/tickets/
    tests/release/runbooks without contradictory terms.
60. **D18-AC60 — D19 neutrality.** D18 tests permit no age-based reminder or
    escalation and do not assume whether a future real state transition creates
    one deduplicated in-product attention projection; D19 must decide that
    separately without changing D18’s no-date invariant.

## Named monitors and required responses

All temporal-boundary monitors below are zero-tolerance invariants. Existing
D17 freshness, command-outcome, routing, authorization, performance, and UX
monitors remain controlling; their time windows measure system operation, not a
Plan deadline.

| Signal                                                    |                                                                                                                                                                                                                                                                     Threshold | Owner                                                | Required response                                                                                                                                   |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `site_default_plan_temporal_field_total`                  |                                      Any persisted, accepted, projected, cached, imported, or exported Plan target-date/launch-date/due-date/planned-activation/expiry-time/Plan-reminder/Plan-priority/Plan-urgency field; actual D17 terminal-event timestamps are excluded | Site Locale owner + Data Architecture                | Block writer/release, disable the path, preserve evidence, remove the unsupported seam through a compatible migration, and inspect every consumer.  |
| `site_default_plan_time_driven_transition_total`          |                                                                                                   Any authoritative Plan readiness/lifecycle/public effect caused solely by wall time or age; D17 freshness revoking cached favorable proof and requiring recheck is excluded | Site command owner + Security                        | Treat as P0, stop the timer/effect, restore authoritative D17 heads/history, prove public and Tenant scope, and add a clock-invariance regression.  |
| `site_default_plan_auto_schedule_total`                   |                          Any timer/cron/delayed/provider-scheduled trigger, or any job lacking the exact current D16 human-authorized receipt and current revalidation, capable of preparing/activating from time alone; exact receipt-driven D16 effect workers are excluded | Site Publication owner + Security                    | Disable the producer, prove zero default/public effects, remove schedule authority, and reconcile every emitted effect.                             |
| `site_default_plan_task_temporal_coupling_total`          |                                                                                                                                                       Any non-null Plan-adapter initial task `due_at`, any initial reminder row, or any urgency derived from Plan/request age | Shared Task owner + Site adapter owner               | Disable the adapter, preserve task/source history, clear only unsupported Plan-derived coordination state, and add adapter contract proof.          |
| `site_default_plan_source_date_rollup_total`              |                                                                                                                                                                                              Any Page/task/publication date displayed or stored as Plan/website launch timing | Site Product + source owners + Mission Control owner | Remove the roll-up, correct misleading presentation, verify no lifecycle/public effect, and retain the date only under its owning contract.         |
| `site_default_plan_audit_time_authority_total`            |                                                                                                                       Any authoritative Plan business state, ordering priority, ownership, or activation selected from audit timestamps; D17 freshness revocation is excluded | Site Locale owner + Audit owner                      | Fence the command/projection, restore revision/event-sequence truth, repair affected rows/views, and add caller-time poison proof.                  |
| `site_default_plan_unsupported_date_input_accepted_total` |                                                                                                      Any reserved Plan temporal/priority key within a Plan mutation/envelope is accepted, partially applied, or silently ignored; typed Mission Control commands are excluded | API owner + Site command owner                       | Stop affected contract version, reconcile partial effects, reject the key before business writes, and add fixture coverage.                         |
| `site_default_plan_temporal_metadata_smuggle_total`       | Any forbidden Plan target-date/launch-date/due-date/planned-activation/expiry/reminder/priority/urgency meaning in Plan/event/task-link metadata or extensions; trusted actual evidence timestamps and separately typed source-workflow or Mission Control facts are excluded | Security + Data Platform                             | Disable the path, quarantine unsafe projections, assess disclosure/downstream actions, and tighten recursive allowlists.                            |
| `site_default_plan_overdue_ui_total`                      |                                                                                                                                                      Any Plan-level date picker, blank date, calendar, countdown, due/late/overdue/stale/unscheduled/no-deadline presentation | Site Product/UX                                      | Block release, remove the misleading control/state, confirm no hidden behavior, and rerun comprehension/accessibility tests.                        |
| `site_default_plan_active_age_terminalization_total`      |                                                                                                                                                                                         Any Active Plan hidden, archived, escalated, expired, or terminalized solely from age | Site Product + Site command owner                    | Restore active intent/history, stop the rule/job, identify affected staff, and verify every D17 terminal outcome.                                   |
| `site_default_plan_timing_disclosure_total`               |                                                                                                                                                                                   Any forbidden Tenant/Site/source timing, relative age, reminder, or schedule signal exposed | Security + Privacy owner                             | Contain the surface/cache/export, revoke exposure, assess incident scope, repair cache keys/policies, and add non-enumeration proof.                |
| `site_default_plan_visibility_omission_total`             |                                                                                                                                                                                        Any successful authorized Site-Languages/Sites-filter projection omits its Active Plan | Site Experience owner                                | Treat as release defect, repair projection/cache invalidation, surface the Plan without fabricating urgency, and run affected-scope reconciliation. |
| `site_default_plan_undated_comprehension_gate`            |                                                                                                                                           Missing/incomplete pre-registered representative protocol, or failure against its predetermined comprehension/confidence thresholds | Site Product Research + UX                           | Block the tested copy/layout, identify the misunderstanding, revise consequence/task-date language, and repeat the pre-registered study.            |

## Ruthless synthesis — strongest path forward

### Must be resolved before D18 is recorded

1. Record **no target date** as absence across model, API, UI, events, imports,
   exports, jobs, and integrations—not as `NULL` or a hidden optional setting.
2. Clarify D17’s broad “no due dates” wording: D17/D18 forbid Plan-owned and
   Plan-derived timing; source-workflow dates/schedules remain source-owned,
   while Mission Control owns shared-task dates/reminders.
3. Preserve the persistent **Site → Languages** row and require **Planned
   default** filtering in the later Phase 24 authorized Sites management
   surface so no date does not mean forgotten work.
4. Keep D19 neutral: D18 authorizes no age reminder, but it does not pre-decide
   whether a meaningful state transition should create one attention projection
   under [ADR-0027: One notification presentation and engagement model](../../adr/0027-one-notification-presentation-and-engagement-model.md).

This record, its D17 clarification, glossary amendment, and decision-log entry
resolve those documentation prerequisites. It authorizes no implementation.

### Requirements the later PRD/OpenSpec/design must capture

- D18-R1–R20 and D18-AC1–AC60 verbatim or with traceably equivalent language.
- A date-free Plan schema and strict command/read/import/export contracts.
- Event/head-based lifecycle, server-owned evidence timestamps, and no
  age-selecting worker or generated state.
- A qualified Site-to-Mission-Control adapter with null initial `due_at`, no
  reminder row, explicit `normal` urgency under the current enum, exact Mission
  Control ownership, and no reverse timing propagation.
- Source-row copy and permission filtering that make any task date clearly a
  task date and never a launch/default promise.
- Persistent authorized discovery, mobile/no-JavaScript/weak-network behavior,
  WCAG 2.2 AA, non-enumeration, and production-shaped list performance.
- Negative migration and privileged-path proof, including exact `USING` and
  `WITH CHECK` behavior where RLS applies.

### Implementation order and dependencies

1. Land the reconciled D15 stable Site Locale and D16 sole current-default/root
   authority; D18 cannot be implemented against `siteId: null` or a shadow
   default.
2. Land D17’s one-Plan lifecycle, current-source readiness, permission model,
   and persistent UI without any date seam.
3. Add negative schema/API/import/export/AST tests before enabling Plan writers.
4. Qualify one source-workflow/Mission Control adapter at a time; prove null
   initial task date, no initial reminder, explicit `normal` urgency, semantic
   dedupe, and independent authorized task edits.
5. Shadow the authorized Plan/readiness projection, then release the
   consequence-led Languages row and later Phase 24 Sites filter to bounded
   Tenant cohorts.
6. Run the full authorization, concurrency, time-travel, accessibility,
   low-bandwidth, migration, performance, comprehension, and zero-public-effect
   gates before expansion.
7. Activate the zero-tolerance monitors and retain forward-repair capability;
   rollback disables writers/presentation while preserving inert private
   history and source-owned work.

### Deliberate non-goals

D18 does not build a release calendar, project manager, date field, “ASAP”
type, scheduler, recurrence, snooze, reminder cadence, SLA, escalation,
auto-expiry, auto-archive, auto-activation, generic workflow engine, or second
source/publication/task authority.

## Research and evidence used

### Verified repository facts

- `supabase/migrations/20260526193000_mission_control_tasks.sql` defines shared
  task `due_at`, task-reminder `remind_at`, task-link JSON metadata, urgency,
  and audit timestamps. Those are real adjacent seams, not Plan authority.
- `packages/api/src/admin/mission-control-tasks/service.ts` defaults an omitted
  task `dueAt` to `null` but calls `getSuggestedAttentionUrgency` unless the
  adapter supplies urgency.
- `packages/api/src/admin/mission-control-tasks/urgency.ts` can calculate higher
  generic attention urgency at default `24`- and `48`-hour thresholds when
  invoked with an older `firstSeenAt`. The ordinary create path passes the
  current instant, so later automatic escalation is not proved. A Site adapter
  must not adopt Plan/request age.
- `apps/admin/app/(app)/tasks/task-form-model.ts` initializes a new manual task
  with today as its date; the future programmatic Site adapter must not inherit
  that form default.
- Accepted ADR-0054 says Mission Control owns task due dates, reminders, and
  follow-up state while the source case owns business truth. D18 applies the
  same ownership boundary without claiming D18 is an accounting case.
- [ADR-0027: One notification presentation and engagement model](../../adr/0027-one-notification-presentation-and-engagement-model.md)
  defines an in-product notification as a role-safe attention projection, not
  source/task/business truth, and already provides the
  `presentation.source_actionable_then_recent_90d@1` policy relevant to the
  separate D19 question.
- D15–D17 keep stable locale identity, the sole current root/default head,
  private Plan intent, fresh readiness, and public activation separate. D18
  changes none of those authorities.

### Verified primary external evidence

- [Sanity Content Releases](https://www.sanity.io/docs/user-guides/content-releases)
  distinguishes **Undecided**, **ASAP**, and **At time** and states that setting
  a time alone does not schedule release; an explicit Schedule action is still
  required. This supports explicit separation, not importing Sanity’s release
  model into Core.
- [Contentful Tasks](https://www.contentful.com/help/content-and-entries/tasks/)
  makes a task due date optional, associates its reminder with that task date,
  and supplies a central Pending Tasks view. This supports optional task timing
  plus structural rediscovery, not a Plan launch date.
- [WordPress Post Status](https://wordpress.org/documentation/article/post-status/)
  distinguishes Draft/Pending from Future/Published. Private or pending work is
  not implicitly scheduled.
- [Payload drafts](https://payloadcms.com/docs/versions/drafts) separates draft,
  published, and changed state from optional scheduling. Payload capability is
  not Core Plan authority.
- [Microsoft Approvals](https://support.microsoft.com/en-us/office/approvals-in-lists-document-libraries-2bd0954d-5797-4be3-b78a-846f26338e17)
  exposes approval status in source context and a central approvals experience.
- [Blackbaud Work Center](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-work-center-lists.html)
  centralizes assigned actions. Dates/overdue state belong to those actions,
  not to unrelated public Site truth.

### Evidence limits and product judgment

- No representative Core ministry evidence currently proves a target-date job,
  desired reminder cadence, acceptable notification noise, or a launch-date
  ownership model. That absence is why D18 chooses the smaller contract.
- External products demonstrate separable patterns; they do not override Core’s
  accepted ADR/OpenSpec boundaries.
- D18 makes no current quantitative claim about staff comprehension. The later
  specification must pre-register a representative protocol and pass threshold
  before release; current copy remains a product hypothesis.

## Documentation status

- Root glossary: amended to state the Plan has no Plan-owned timing,
  source-workflow dates/schedules remain source-owned, and Mission Control owns
  shared-task dates/reminders.
- D17 record: later-D18 clarification narrows “no dates” to Plan-owned/derived
  timing and preserves ADR-0054 task ownership.
- Phase 24 decision log: records the founder answer, corrected decision,
  adversarial disposition, UX, evidence, requirements, and D19 question.
- ADR/PRD/OpenSpec/design/schema/migration/runtime/tickets: unchanged and not
  authorized by this grill decision. The later specification workflow must
  carry D18 into the governing Site/default contract before implementation.

## D19 — Bringing staff back when an undated Plan becomes actionable

### Plain-language context and impact

Your no-date decision prevents arbitrary deadlines and reminder noise. The next
UX question is how Maria learns that work owned by other people is now complete
and her Plan is **Ready to review**.

This is not a deadline question. The trigger would be a real source/Plan state
change. Reading a notification would never complete the Plan, and nothing would
change the website automatically.

### Options

1. **Create one state-driven in-product Needs attention item — recommended.**
   A meaningful transition such as **Ready to review** or **Changed since
   review** creates one deduplicated producer occurrence. [ADR-0027: One
   notification presentation and engagement model](../../adr/0027-one-notification-presentation-and-engagement-model.md)
   presents it only to the exact currently authorized recipient(s) who can
   perform the displayed next action under a code-owned route—never the creator
   by default, every editor, or an arbitrary assignee. Reading clears only the
   unread indicator; the item remains in **Needs attention** and cannot be
   archived while actionable. It leaves **Needs attention** when the producer-
   owned actionable condition ends, then preserves authorized recent history
   under `presentation.source_actionable_then_recent_90d@1`. It sends no
   recurring reminder or email by default. With no qualified recipient, Core
   creates no guessed item; the Plan remains discoverable in **Site →
   Languages** and the later Phase 24 authorized Sites management surface.
2. **Use Site → Languages and the later Phase 24 Sites filter only.** This is
   the smallest model and adds no notification, but staff managing several
   Sites are more likely to miss a newly actionable Plan unless they revisit
   those views.
3. **Send periodic inactivity reminders.** Core would nudge staff after elapsed
   time. This introduces arbitrary cadence, time-zone, snooze, preference,
   escalation, and notification-fatigue policy. It would require an explicit
   decision superseding D18's no-age-reminder contract and is not recommended.

### Recommendation

Choose Option 1. It reacts once to meaningful work becoming actionable, uses
the platform’s accepted notification model, and avoids turning age into urgency.
Source owners still receive only their qualified Mission Control follow-up;
Maria does not get repeated “still waiting” noise.

### Concrete staff example

```text
Needs attention

hope.org · French (Canada)
Ready to review

English (United States) is still live.
Nothing changes automatically.

[Review planned change]
```

No item appears merely because 30 days passed or someone refreshed a page. A
suspended Site emits no **Ready to review** occurrence; **Site → Languages**
shows **English (United States) remains default · Site suspended · Not currently
public**. Core re-evaluates and may emit only after serving becomes favorable
and a fresh readiness check succeeds.

### Exact question

When an undated Default Site Locale Plan becomes actionable, should Core create
one state-driven in-product **Needs attention** item, rely only on **Site →
Languages** and the later Phase 24 Sites filter, or explicitly supersede D18 to
send periodic inactivity reminders?
