# D6 implementation, database and reminder evidence

Research-only review, 2026-10-10. Source HEAD:
`225c02e9499bd6c0d493223cd4b1a4120ff787e3`. No app implementation,
migration, hosted database inspection, deployment or outbound message was made.
The current user selection is a chosen **internal review date** during a
deliberate pause. Arrival calls for a human review; it does not resume/end a
partnership, contact a supporter or complete another obligation. The Q6 note
records the selection; material amendments await ratification.

**Finding:** PostgreSQL/Supabase can support this small source-owned operation,
but the inspected task/reminder pieces do not establish a shipped D6 reminder
path. Retain D6 A. Qualify one P27 review occurrence through the accepted shared
work/notification boundaries; do not interpret the existing form controls,
table name, executor or contribution reminder routine as that qualification.

The accepted owner-contract analysis is in [ownership.md](ownership.md); the
ministry interpretation is in [ministry.md](ministry.md). This appendix owns
current-code evidence and implementation safeguards, not new owner policy.
Severity measures the consequence of the described mistake; likelihood is a
qualitative implementation risk, not measured production incidence. None of
the proposed D6 failures below is asserted to be an observed deployed D6 bug.

## What exists, and what it proves

Paths and line numbers below are repository-relative and were inspected at the
source revision above. References to comments are distinguished from behavior.

| Evidence                                                                                                                                                                         | Observed behavior                                                                                                                                                                                                                                   | Qualification limit                                                                                                                                                                                                                                                         |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `supabase/migrations/20260526193000_mission_control_tasks.sql:14–36,59–65`                                                                                                       | Shared tasks have nullable `due_at TIMESTAMPTZ`; reminder rows contain tenant, task, `remind_at TIMESTAMPTZ`, `pending/sent/cancelled` and creation time.                                                                                           | A reminder row is not a scheduled release, recipient resolver, notification engagement or source review disposition. These existing status names do not select P27 lifecycle vocabulary.                                                                                    |
| Same migration `:39–47,100–131`                                                                                                                                                  | Links carry free-form record type/id. Tasks, links and reminders are server-only: RLS enabled, anon/authenticated privileges revoked, service-role privileges granted. Declared indexes cover task status/urgency, task links and attention status. | Independent tenant/task FKs do not themselves enforce matching task tenant or exact P27 source scope. No reminder due-scan index appears in this migration. Lack of browser policies is not a leak where browser grants are revoked. No hosted grants/indexes were queried. |
| `packages/api/src/admin/mission-control-tasks/service.ts:48–84`; `store.ts:75–124`                                                                                               | Task insert, linked records insert and event insert are separate awaited Supabase requests.                                                                                                                                                         | Awaiting all three is not an atomic source/task/schedule transaction. A later failure can leave earlier committed work; a retry has no source-occurrence dedupe in this helper.                                                                                             |
| `packages/database/collections/admin-workspace.ts:52–90,766,783–837`; `apps/admin/app/(app)/tasks/tasks-content.tsx:170–179,213–240`                                             | Staff task/reminder forms use seeded in-memory collection rows. Inserts use example tenant/staff IDs and mutate the module variable. Reminder data has channel choice and a `sent` boolean.                                                         | A collection's `isPersisted` promise here does not mean database persistence or reminder dispatch. This is current UI evidence, not a product delivery receipt.                                                                                                             |
| `apps/admin/app/(app)/tasks/task-form-model.ts:123–136,149–150,188–201`; `task-form-sections.tsx:508–565`                                                                        | The default reminder subtracts one hour from `dueDate`; due date and due time are distinct form values. A `datetime-local` value is converted through browser-local `Date` into ISO. Email/notification/both are selectable.                        | This prototype supplies neither D6's governing time zone nor channel authority. Its one-hour default can fall on the previous day for a date represented at midnight; it is not an accepted D6 policy.                                                                      |
| `apps/admin/app/mc-shell.tsx:37`; `packages/ui/components/shadcn-studio/blocks/dropdown-notification.tsx:30–60,83–155`                                                           | Admin shell imports a notification dropdown whose props are trigger/open/alignment; the inspected content has hard-coded `8 New`, people, times and actions.                                                                                        | A visible bell does not establish a current source-authorized D6 inbox/count/detail/engagement path. No broad notification-center qualification is inferred.                                                                                                                |
| `apps/missionary/app/tasks/page-client.tsx:3–5,299,666–677`; `apps/missionary/app/donors/donor-tasks.tsx:3–5,76,159`                                                             | Real missionary task and donor-task pages combine the API-backed `useTasks` hook with the shared `TaskDialog`.                                                                                                                                      | This is not merely an unused form: the two write paths need reconciliation before reuse. It remains legacy task behavior, not a P27 shared review projection.                                                                                                               |
| `packages/missionary/components/task-dialog.tsx:174–211`; `task-form-model.ts:29–38,81–100`; `supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:261–265` | Dialog directly inserts/updates browser `missionary_tasks`, including `reminder_date`; the checked-in migration revokes all anon/authenticated privileges on that table.                                                                            | These paths are incompatible if those grants are applied. No deployed failure was tested. Do not repair this by broadening browser grants for D6. Bounded `reminder_date` search found no migration defining that column.                                                   |
| `packages/lib/hooks/use-tasks.ts:111–129`; `packages/api/src/missionary-portal/tasks.ts:30–41,81–98`; `task.ts:25–36`; `service.ts:79–95`                                        | Alternative API payload, strict create/update schemas and selected fields omit `reminder_date` and notes.                                                                                                                                           | API-backed task CRUD does not prove the dialog's reminder was persisted or scheduled. A form-model serialization unit test cannot close this gap.                                                                                                                           |
| `packages/api/src/missionary-portal/service.ts:252–312`; `task.ts:81–85`                                                                                                         | Legacy task list/detail/update scope by missionary profile; optional donor access checks tenant, donor and `donors.missionary_id`.                                                                                                                  | Profile ownership is not the selected Ministry Assignment source, exact current P12 recipient eligibility or D6 review authority. No cross-tenant exploit is claimed merely from this shape.                                                                                |
| `packages/api/src/workflows/serve.ts:21–31`; `functions/dispatch-recovery-scan.ts:5–24`; `recovery.ts:48–69,114–139`                                                             | Registered functions cover smoke, dispatch recovery, donation recovery, Stripe and inbound email. Existing recurring scan repairs dispatch-ledger handoffs.                                                                                         | This registry has no D6 due-review or correction-approval SLA worker. Handoff success is not notification delivery or review completion. Its five-minute cron is not a D6 timing promise.                                                                                   |
| `packages/api/src/workflows/claims.ts:7,22–38`; `supabase/migrations/20260611181000_workflow_work_claims.sql:71–88`                                                              | Work claims expire and can be replaced; active claim insertion is conflict-guarded.                                                                                                                                                                 | A lease reduces overlapping attempts; it is not a permanent effect receipt or proof that an expired worker cannot still act. Provider flow control is also not source authority.                                                                                            |
| `packages/api/src/workflows/notification-policy.ts:31–85`                                                                                                                        | Pure workflow status-to-alert-level evaluation.                                                                                                                                                                                                     | It is neither a generic due-reminder scheduler nor evidence of recipient/channel release. Infrastructure urgency does not define a ministry-review reminder's tone.                                                                                                         |

Bounded searches used `rg` over `packages`, `apps`, `tests` TypeScript/TSX and
`supabase/migrations` SQL. `mission_control_task_reminders` appeared in its
migration and a migration string assertion, with no runtime TypeScript
reader/writer/worker found. `processCorrectionApprovalSla` appeared in its
definition, export and tests, with no runtime scheduled caller found. These
are reproducible source-search findings, not an assertion about undisclosed
jobs or deployed catalog contents.

### Useful contribution precedent, with an important copying limit

`packages/api/src/admin/contribution-operations/approval-notifications.ts:87–131`
builds source/kind/channel/recipient dedupe keys. Its general insertion path
at `:274–324` uses the inserted subset to avoid treating old durable rows as new
delivery work. The SLA path at `:386–435,789–815` calls one RPC for source stamp
and notification creation, then attempts the optional email channel.

The actual SQL in
`supabase/migrations/20260611150000_contribution_approval_notifications.sql:467–532`
locks the exact pending correction request, inserts notification rows with
tenant/dedupe uniqueness, and stamps the request in one function. These are
useful patterns. However, it does **not** compare an expected source/date
revision or prior reminder timestamp. While the request stays pending, a
replay can report `stamped = true` even with zero newly inserted rows; delivery
is separately gated by the inserted count in TypeScript. The comment at
`approval-notifications.ts:387–391` saying replays bail on `stamped === false`
is broader than that SQL behavior. A delayed supplied timestamp is not fenced
by a greater-than test there. This is a reuse limit, not evidence that a D6
obsolete reminder has shipped.

The contribution email helper
`approval-notification-email.ts:190–207,225–264` loads recipient emails by
tenant/profile, supplies a provider idempotency key, checks the provider's
success result and counts failures. The helper does not itself re-resolve
current exact P27 responsibility/access/channel preference just before send;
nor does its return count supply a durable D6 delivery/review receipt. Its
caller chooses approvers/settings before looping (`approval-notifications.ts:747–787`).
Retain the atomic source/effect and truthful failure ideas; do not copy its
approver recipients, reminder-hour rounds, email defaults or domain authority.

## Material concerns and acceptance safeguards

### I1 — Saving a date appears to promise a reminder that has no qualified path

**Severity:** high. **Likelihood:** high if the existing reminder field/table
is used as proof of capability. **Evidence:** shared schema, in-memory staff
collection, split missionary writes and worker registry above. **Decision:**
retain A; this changes activation evidence, not the pastoral choice.

**Proposed exact safeguard:** “A saved review date is durable P27 source truth.
Promised reminder behavior requires the registered source occurrence, bounded
recipient/channel contract, current authorization, shared work projection and
qualified release/recovery path. No prototype `sent` value, scheduled-job
registration, successful handoff or UI save substitutes for those facts.”

**Acceptance proof:** through the actual server command, save, hard-reload and
view the same review from the authorized staff and missionary contexts. Wake
the actual registered path with optional Studio unavailable; demonstrate the
qualified internal attention and source action. Disable release execution and
show truthful unresolved work rather than a false “reminded”/“reviewed” state.
This proof must use the reconciled real data paths, not the seeded collection.

### I2 — Source, task and reminder split apart after failure or replay

**Severity:** high. **Likelihood:** high if the three-insert helper is copied.
**Evidence:** `service.ts:62–77`, `store.ts:75–124`; shared generic links do not
encode a P27 source occurrence. **Decision:** retain A; require the existing
source-command boundary, not a new task service.

**Proposed exact safeguard:** “One authorized source operation commits the
review intent and the durable work/effect obligation together, or commits
neither. At most one appropriate shared task represents that source occurrence;
projection retries recover the same work. Stable command identity and a source
receipt recover a committed result after a lost response. Reusing existing
work must prove the same applicable review purpose; a coincident date/title
does not merge unrelated tasks.”

The transaction may contain the authoritative task binding or a durable
projection obligation under the shared contract. This does not require the
browser projection and every future executor attempt to commit synchronously.
Supabase client calls, `Promise.all`, collection transactions and an RPC name
do not automatically provide a cross-request database transaction. Use the
qualified server command and a real database transaction; keep external sends
outside it and release only committed intent. No new table/enum/RPC spelling is
selected here.

**Acceptance proof:** inject failure at each persistence boundary; retry the
same command before/after response loss; race two requests. Observe either no
accepted review or one accepted source intent with recoverable work, never an
orphaned “success,” duplicate shared task or lost schedule. Include wrong
tenant/task/source binding rejection at database and command boundaries. Party
scope remains tenant-only where owned that way; do not invent Party legal-entity
columns to enforce the Ministry Assignment's exact source scope.

### I3 — The right date becomes the wrong day, or changes when the lead travels

**Severity:** medium/high. **Likelihood:** high if existing browser-local date
conversion/defaults are reused. **Evidence:** staff form/date code above and
missionary `task-form-model.ts:62–63,96–97`; PostgreSQL docs below.
**Decision:** retain a simple chosen date; require explicit human interpretation,
not a new recurring-schedule designer or mandatory time picker.

**Proposed exact safeguard:** “Show the governing calendar date and time zone
for the chosen review, preserve its source meaning, and define the conversion
used for due attention. A viewer's browser zone, travel, server/session zone or
lead reassignment must not silently reinterpret it. An intentional change uses
the source command and is visible as such. Do not silently inherit midnight,
one hour before, business days, quiet hours or a repeat interval from another
feature.”

A date without a time and an instant are distinct concepts. `timestamptz`
preserves an instant; it does not retain the original IANA zone or intended
calendar date. These facts do not force a particular physical column layout.
For an instant-based release, resolve the agreed date/zone semantics explicitly;
for a calendar-date comparison, evaluate in the governing zone. If time-of-day
options are later accepted, define ambiguous/nonexistent local-time handling.

**Acceptance proof:** same selected date seen in east/west zones, UTC day
boundary, both DST transitions, changed browser zone, changed lead and delayed
worker. A DST day may be 23 or 25 hours; “one calendar day” is not always 24
elapsed hours. Prove neither early attention nor a missed/duplicated occurrence
under the accepted conversion. Synthetic calendar examples alone do not
qualify Core's implementation.

### I4 — Reschedule, disposition or concurrent wake releases obsolete attention

**Severity:** high. **Likelihood:** medium/high under retries and ordinary
concurrent editing. **Evidence:** legacy task PATCH is unversioned
(`missionary-portal/task.ts:38–58,81–85`); the contribution RPC has only its
pending-source lock, not a D6 date/revision fence. **Decision:** retain A.

**Proposed exact safeguard:** “The source owns applicability and current review
revision. A wake-up is a request to re-evaluate, not permission to remind.
Release, date change and source review disposition must serialize/recheck the
relevant source head so an obsolete revision cannot newly admit attention.
Accepted source changes end obsolete pending work without deleting unrelated
obligations or inventing a new review task merely because a date changed.”

Do not encode pause/resume/end solely in executor sleep state. Persist the
accepted source receipt; shared work closes only from the source-authorized
disposition. Concurrent conflicting human commands require a truthful stale
result/current reread, not silent last-writer success. Reopening/next-review
occurrence identity is still owner-defined, not a fixture enum or partial
index chosen in this appendix. Previously released attention has truthful
history; no design can unsend an already sent external message. Any future
external channel needs its release-ordering/current-authority contract, not
an impossible promise to undo delivery.

**Acceptance proof:** deterministic races for date change versus wake, review
versus wake, two conflicting reviewers and an old worker resuming after a new
revision. The winning source decision is authoritative, with no new obsolete
release and no duplicate unresolved work. Test both commit orders explicitly.

### I5 — A lease or provider key is mistaken for exactly-once review attention

**Severity:** high. **Likelihood:** medium/high during retry/outage recovery.
**Evidence:** claim expiry/replacement above; contribution provider key and
notification dedupe above. **Decision:** retain A and reuse product effect
receipts rather than add a second executor.

**Proposed exact safeguard:** “Task identity, source occurrence, recipient
engagement and delivery attempt remain distinct. Retries of the same admitted
attention reuse its durable effect identity, including source scope and the
qualified recipient/channel purpose. Claim expiry never authorizes a stale
worker to change a newer source head or overwrite a newer result. Provider
dedupe retention and in-memory job IDs do not bound product dedupe.”

The existing claim's active uniqueness is not a fence at the later effect
write. Protect that write with the accepted current source/attempt authority
and durable uniqueness/receipt. Do not use a no-op update to return or mutate
another recipient's hidden row, and do not treat a uniqueness error as access
authority. The D3 database-mechanics proof remains applicable to PostgreSQL
mechanics; it is not D6 authentication or receipt implementation proof.

**Acceptance proof:** duplicate event, retry after committed lost response,
claim expiration while the old worker is still alive, replacement worker,
manual replay and optional Studio wake. There is one logical attention per
admitted purpose, truthful attempt outcomes and no obsolete overwrite. A
legitimately new later review is not suppressed as an old retry.

### I6 — The reminder finds the old lead or becomes an access grant

**Severity:** high. **Likelihood:** medium/high across long pauses.
**Evidence:** profile-owned legacy task queries and profile-email lookup above;
shared tasks allow nullable queue/profile assignments. **Decision:** retain the
D5 eligible partnership-lead default and accepted source-owned handoff.

**Proposed exact safeguard:** “Resolve current exact source responsibility and
recipient authority at release and protected presentation/action. A lead,
task assignee, email address, ministry membership or staff label is not an
access grant. Respect a separately authorized review responsibility; changing
the partnership lead does not blindly transfer every existing task. If no
eligible recipient is provable, preserve discoverable source work for
independently authorized operations and release no protected personal notice.”

Use the actual qualified P12/P27/P28 source projection, not `donors.missionary_id`
as a universal target. Do not fall back to the creator, all tenant admins,
finance operations or an Eve operator channel merely because those are already
coded recipients. Cache keys/invalidations and bell/list/count/search exports
must preserve exact current scope. Returning the same shared task on two
authorized surfaces does not require mirrored task rows.

**Acceptance proof:** reassignment, deletion/departure, loss of just one
legal-entity grant, dual staff/missionary contexts, stale tab and ambiguous/no
recipient. Removed recipients receive no newly released protected content;
remaining eligible users see the same source work. Unauthorized task/notification
IDs and counts reveal no protected data. The privacy appendix owns the exact
authorization contracts; this note does not invent a recovery role.

### I7 — “Sent,” “read” or a checkbox falsely completes the review

**Severity:** high. **Likelihood:** medium if generic task controls are reused.
**Evidence:** staff `sent` flag and generic toggle `tasks-content.tsx:170–177`;
missionary status PATCH `task.ts:47–51`; contribution email returns delivery
counters. **Decision:** retain A and source-controlled review meaning.

**Proposed exact safeguard:** “Keep the chosen review, due work, notification
engagement, transport attempt and human review disposition distinct. Due time,
reading, channel suppression, provider acceptance and a generic task checkbox
do not resume/end cultivation or count as a completed review. Only the accepted
source operation supplies that disposition and ends the appropriate work.”

The in-product reminder should take the eligible person to the current review
context. Do not publish private pause reasons in a subject/preview by default.
An email/SMS/digest/repeat/escalation option requires separately qualified
authority; the existing staff form's “Both” control is not D6 permission.
Missed attention remains an actionable internal item under the shared
presentation contract, not an invented supporter-risk score or outreach task.

**Acceptance proof:** read/unread, navigation, generic Complete, archive where
allowed, transport failure and muted optional channel leave unresolved source
work truthful. An actual stay-paused/resume/end decision records the source
outcome; staying paused does not secretly choose another review date or cadence.

### I8 — Outage recovery floods people, misses work or requires a new scheduler

**Severity:** medium/high. **Likelihood:** medium as volume and pauses grow.
**Evidence:** no shared-reminder runtime in the bounded search; existing
dispatch recovery reads bounded due handoffs, whereas the contribution SLA
routine reads all pending correction requests for a tenant (`:735–741`).
**Decision:** retain native reminders and existing executor architecture.

**Proposed exact safeguard:** “Use bounded due-work recovery with a query/index
matching the qualified source predicate. Recover missed eligible work through
the same source/effect identity. Keep failures and unassigned work visible to
authorized operations; do not emit one catch-up notification per missed poll,
silently mark work reviewed, or create one independent scheduler/job per
partnership as an unnecessary default.”

PostgreSQL transactions, conditional writes and indexed due queries are a
sufficient substrate; D6 does not require a new queue product or generic
calendar engine. `SKIP LOCKED`, if used for multi-consumer queue work, skips
locked rows and is not a complete report of all due work. Recovery must revisit
them. Existing Cron or Inngest can wake a qualified native path, but platform
availability is not proof that a particular registered job is active. One
admitted due attention plus persistent unresolved work is preferable to an
unselected reminder cadence; exact follow-on reminders remain an owner choice.

**Acceptance proof:** stop/restart execution, backlog beyond one batch, poison
item, locked row, expired claim and duplicate wake; valid peers progress and
every still-applicable skipped item is recoverable. At representative scale,
inspect actual query plans, latency, lock waits and connection usage. No
capacity, polling interval or percentile budget has been measured or adopted
in this research. Suitable monitors are overdue unreleased work, retry failure,
stale revision rejection and unassigned work; unauthorized releases, duplicate
logical effects and invalid scope are zero-tolerance invariant failures.

### I9 — Rollout backfills a reminder or reviews history that no human chose

**Severity:** high. **Likelihood:** medium if legacy reminder fields are
treated as accepted P27 source events. **Evidence:** profile-owned legacy tasks,
in-memory examples and conflicting reminder payload paths above. **Decision:**
retain deliberate D4 admission and D6 chosen review date.

**Proposed exact safeguard:** “Legacy task/due/reminder fields and old activity
are evidence to reconcile, not approved pause, admission or review events.
Preserve existing independent obligations. Require an explicit authorized
mapping and source acceptance where retained data cannot prove the chosen
partnership/review. Fence old writers before activating the new invariant;
recovery and rollback preserve source receipts and unresolved work.”

**Acceptance proof:** one old profile with multiple ministries, missing dates,
incompatible reminder field, duplicate tasks, ended context and old cached
client. No guessed Ministry Assignment, fabricated history, retrospective
email or mass task completion occurs. Disable execution safely and re-enable
against current receipts without replaying old reminders as new work.

## Versions, primary documentation and verification limits

Installed package versions were read from package files on 2026-10-10, without
installing or changing dependencies:

| Package                 | Declared source                                | Workspace-installed version                                          |
| ----------------------- | ---------------------------------------------- | -------------------------------------------------------------------- |
| `@supabase/supabase-js` | `packages/database/package.json:86`, `2.117.3` | `node_modules/@supabase/supabase-js/package.json`, `2.103.0`         |
| `@supabase/ssr`         | `packages/database/package.json:85`, `0.12.7`  | `packages/database/node_modules/@supabase/ssr/package.json`, `0.8.0` |
| `inngest`               | `packages/api/package.json:200`, `^4.22.0`     | `packages/api/node_modules/inngest/package.json`, `4.5.1`            |
| `date-fns`              | `packages/missionary/package.json:25`, `4.4.0` | `packages/missionary/node_modules/date-fns/package.json`, `4.1.0`    |

`supabase/config.toml:27–34` selects local PostgreSQL major 17. This does not
establish a hosted version, migration application, extension version, active
job or deployment package. The previous isolated D3 PostgreSQL 17.11 exercise
is not a deployment query. No newly documented Supabase method is assumed to
exist in the older installed client.

Primary documentation refreshed 2026-10-10:

- [PostgreSQL 17 date/time types](https://www.postgresql.org/docs/17/datatype-datetime.html):
  `date` and `timestamp` represent different information; timezone-aware
  timestamps are stored as UTC instants and do not retain the originally
  supplied zone. Full IANA names describe daylight-saving rules; an offset
  alone does not.
- [PostgreSQL 17 date/time functions](https://www.postgresql.org/docs/17/functions-datetime.html#FUNCTIONS-DATETIME-CURRENT):
  `now()`/`transaction_timestamp()` describe transaction start,
  `statement_timestamp()` statement start, and `clock_timestamp()` actual
  changing time. A long transaction's `now()` is not a constantly advancing
  wall clock. Select the intended comparison point explicitly and keep work
  transactions short; the browser's clock is not source authority.
- [PostgreSQL 17 SELECT locking clauses](https://www.postgresql.org/docs/17/sql-select.html#SQL-FOR-UPDATE-SHARE):
  `SKIP LOCKED` provides an inconsistent view appropriate to queue consumers,
  not a complete view for reporting; it does not avoid ordinary table locks.
- [Supabase database configuration](https://supabase.com/docs/guides/database/postgres/configuration#managing-timezones):
  databases default to UTC and the provider recommends retaining it. This is
  not a product decision to interpret every human review date as UTC.
- [Supabase database functions](https://supabase.com/docs/guides/database/functions):
  invoker is default/preferred; a definer runs as its owner. Fixing
  `search_path` and restricting execute are separate requirements. Use the
  existing qualified server authority boundary, never a privileged function
  merely to bypass failed access checks. PostgreSQL owners/BYPASSRLS and
  applicable grants/policies determine access; a function's name or schema
  alone does not.
- [Supabase Cron overview](https://supabase.com/docs/guides/cron) and
  [quickstart](https://supabase.com/docs/guides/cron/quickstart): Cron uses
  `pg_cron`; jobs and run details are observable separately. Scheduling by an
  existing name replaces that job, and run-history records are not cleaned
  automatically. This establishes available platform mechanics, not a reason
  to select Cron over Core's executor or a D6 timing SLA.

The coordinated root review ran the focused source tests and synthetic probes;
see [source-probe](source-probe/README.md). Its test runner had to use a bounded scratch
config after the repository config failed to load `@sentry/nextjs/config`.
The report there owns exact commands, counts, versions and qualifications.
The source/mock tests and calendar counterexamples are useful regression and
mechanics evidence, not a live Supabase transaction, actual delivery, browser
authorization, production scheduler or scale proof. This reviewer did not
duplicate that run or change dependencies to bypass it.

No new PostgreSQL race lab is needed to decide D6 A. The remaining proof that
matters is the implemented source-to-task-to-qualified-attention path, under
the real transaction, recipient authority, time interpretation and retry
boundaries. Those are acceptance requirements for later implementation, not
reasons to introduce more product machinery during this decision review.
