# D23 — Current activity sources and optional-target UX evidence

Research only, 17 October 2026 UTC. The founder selected A: separate optional
outreach-attempt targets. “Calls made” recognizes all five recorded calls and
“Conversations” separately recognizes the two exchanges; Maya may choose either,
both or none. The founder also selected supported activity types with personal
customization of names, amounts and schedules, not creation of new activity
types. Further safeguards remain candidate amendments owned by the parent review.
The earlier
[Q23 scenario](/workspace/core/docs/features/missionary-workspace-depth/grill/phase28-q23-activity-target-measures-research.md:10)
illustrates five calls, including two conversations; these are not seven
underlying activities. No recommended workload, compulsory logging, new coaching
disclosure or implemented activity-target capability is asserted here. Weekly
targets are inherited intent; a weekly default, monthly schedule or custom date
range remains a proposed supported schedule, not an already adopted owner fact.

## Scope, evidence quality and inherited meaning

Fresh static inspection followed the mounted missionary donor activity route,
request client, composer, history projection/query, donor hook/cache, task
completion route, phone/mail handoffs, email placeholder and relevant provider
wrapper/inbound workflow. Bounded searches covered missionary app/package,
missionary-portal API, database collections/hooks/types, applicable migrations,
and adjacent activity/auth/date tests. Terms included activity/outreach/weekly
target, goal, streak, donor_activities, activity type, date, task completion,
calendar and email. No qualified activity-target store, period-count endpoint or
streak implementation was located in these inspected paths. Financial funding
goals, giving charts and member-care goals are different features.

Root and applicable missionary/API/database/UI/Supabase instructions and the
repository Supabase skill were read. No app/schema/dependency/formal-owner edits,
hosted queries, provider calls, sends, migration replay or browser execution
occurred. This is not a whole-repository absence claim or proof of effective
deployed grants. Existing D14/D15 calendar/email census and D19–D21 task/source
evidence are reused explicitly where noted. Primary comparison evidence remains
in [Q23's bounded research](/workspace/core/docs/features/missionary-workspace-depth/grill/phase28-q23-activity-target-measures-research.md:72);
this pass did not re-fetch it or establish current vendor runtime behavior.

Accepted [P27 REQ27-P33](/workspace/core/docs/prds/sitestacker-parity/phase-27-donor-development/partnerships.md:2365)
already separates actual exchange, outreach and agreed follow-up. It permits
ordinary attributable manual evidence and a relevant human reply, including a
brief decline, without a transcript, sentiment/length test or prior outbound.
Attempt, voicemail, plan, cancellation, no-show, passive attendance, delivery,
open/click, uncertain/automated reply, generic note and task completion cannot
manufacture an exchange. Its occurrence-precision and same-source correction
rules apply to D23; an activity target cannot redefine those facts.

[D8-C11/C12](/workspace/core/docs/features/missionary-workspace-depth/grill/phase28-d8-adversarial-review.md:506)
make activity targets/check-ins separately deliberate and forbid missing logs
becoming inactivity, failure or a score. Counts, dates, trends and source links
can reveal restricted history. Selecting an available target category does not
automatically share any such measure with a coach, staff, public page or donor.

## Current source and the qualification gap

### S1 — There is a reached manual log, but its facts are too coarse for these measures

The [mounted route](/workspace/core/apps/missionary/app/api/missionary/donors/[donorId]/activities/route.ts:1)
exports the actual [POST_ACTIVITY handler](/workspace/core/packages/api/src/missionary-portal/donor.ts:230).
Its [strict schema](/workspace/core/packages/api/src/missionary-portal/donor.ts:10)
accepts only `note|call|meeting|email` plus a trimmed, required 1–4,000-character
note. [recordMissionaryDonorActivity](/workspace/core/packages/api/src/missionary-portal/donor.ts:120)
checks donor access and inserts type, fixed title, description and a server save
timestamp into `donor_activities`. It does not persist actor, typed ministry/
project, exact encounter/source identity, attempt-versus-exchange outcome,
occurrence precision, source revision or retry command identity in that payload.
It returns no activity receipt; the route returns `{ok:true}` with HTTP 201.

The [existing unit fixture](/workspace/core/tests/unit/packages/api/missionary-portal/donor-mutations.test.ts:74)
explicitly records `call` / `Phone Call` / “Left voicemail.” Thus the legacy type
cannot be treated as a conversation. Free text may describe a useful interaction,
but parsing it with keywords or AI would create unqualified outcome assertions.
Do not migrate every old `call`, `meeting` or `email` into a completed event or
count it as the current missionary's work simply because its donor is assigned
to that missionary now.

The [foundation schema](/workspace/core/supabase/migrations/20250101000000_init_schema.sql:222)
has a nullable donor FK/date and generic text type/status; its random row ID
does not identify one underlying encounter. The inspected later explicit table
references add money/grant handling, not those missing source fields. The
[current collection schema](/workspace/core/packages/database/collections/schemas/giving.ts:11)
still exposes that coarse shape. Schema-file review is not catalog attestation.

**Reuse:** a real server mutation boundary, strict allowed request fields and an
ordinary manual logging entry point. **Must qualify:** source-owned P9 interaction
facts, attribution and correction, without a second target-specific activity log
or a mandatory narrative merely to record an ordinary attempted call.

### S2 — Save time and fallback time are not occurrence time

The write at [donor.ts:141](/workspace/core/packages/api/src/missionary-portal/donor.ts:141)
always stamps the server's current time. The route offers no user-entered date.
The API [history mapper](/workspace/core/packages/api/src/missionary-portal/donors.ts:292)
uses `activity.date ?? activity.created_at`; the older shared
[model builder](/workspace/core/packages/database/hooks/missionary-donors-model.ts:299)
has the same fallback. A call entered Monday about Friday would enter Monday's
count if these fields were reused unchanged. A legacy undated record would gain
false precision from its entry timestamp.

The actual [display helper](/workspace/core/apps/missionary/app/donors/donors-page-dates.ts:7)
handles YYYY-MM-DD as a browser-local calendar date and timestamps as instants;
it does **not** replace invalid input with today. Its
[tests](/workspace/core/tests/unit/apps/missionary/donors-page-dates.test.ts:10)
cover instant/copy and Los Angeles date-only display. These are useful rendering
checks, not a reporting-zone/week-boundary contract. The timeline formats dates
without displaying time/zone at
[overview:199](/workspace/core/apps/missionary/app/donors/donors-page-detail-overview.tsx:199).

**Requirement:** retain entered occurrence precision separately from recorded/
corrected time. Define and display the target period and applicable zone; do not
move past events when a viewer travels. Unknown dates remain unknown and cannot
silently enter a precise weekly numerator. A visible editable today default is
the user's assertion, not evidence of occurrence. Date-only facts need no fake
midnight instant. Corrections must update the affected permitted periods without
rewriting an accepted historical target into the current one.

### S3 — Loaded donor history is neither a complete count nor proof of zero

The [API query](/workspace/core/packages/api/src/missionary-portal/donors.ts:489)
scopes donors to authenticated tenant/profile and pages 50 by default, at most 100. It then fetches at most
[2,000 activities across that donor page](/workspace/core/packages/api/src/missionary-portal/donors.ts:532).
That child query uses the already-scoped donor IDs; absence of a repeated tenant
predicate is not by itself proof of a cross-tenant leak. SQL errors are thrown.
However, the [result](/workspace/core/packages/api/src/missionary-portal/donors.ts:574)
only reports donor pagination. It does not report activity completeness,
period coverage, authoritative total or a next activity cursor. One busy donor
could consume the related window. Loading more donors does not qualify a whole
weekly interaction count.

The [anonymous projection](/workspace/core/packages/api/src/missionary-portal/donors.ts:378)
deliberately returns `activities:[]` to prevent free-text/PII disclosure. The
[timeline](/workspace/core/apps/missionary/app/donors/donors-page-detail-overview.tsx:121)
shows “No activity recorded yet” for an empty array. Reusing that condition for
target progress would conflate withheld, unqueried, truncated and truly empty
qualified evidence. The staff [CRM detail query](/workspace/core/packages/api/src/admin/crm/detail/service.ts:280)
also caps activities at 50; it is not an alternative complete counter.

**Requirement:** a count must state its exact measure, subject, period and
qualified coverage. A complete permitted source may honestly say “0 recorded
calls” without saying “You made no calls.” Unavailable/partial/withheld evidence
must not produce a precise completion percentage, lifetime total, streak,
performance label or aggregate that discloses restricted history. Target absence
is “No target set,” independently of whether any activity has been recorded.

### S4 — Current authorization is a useful legacy boundary, not new metric authority

The [operation wrapper](/workspace/core/packages/api/src/missionary-portal/route-helpers.ts:24)
gets validated auth, requires missionary role and supplies an admin client.
[assertMissionaryDonorAccess](/workspace/core/packages/api/src/missionary-portal/service.ts:278)
checks donor ID, tenant ID and `donors.missionary_id = auth.profileId`. This is a
real restriction, not unauthenticated arbitrary insertion. The later insert is
a separate database request, though; it does not atomically bind that predicate
to the write. Assignment/restriction changing between the queries is a
conditional race to qualify, not an observed exploit. The helper reads only ID;
it does not resolve an actor-specific P9 action, typed ministry/project, current
history scope or anonymous/contact-purpose constraint.

The historical chain matters: the
[February migration](/workspace/core/supabase/migrations/20260216153000_demo_readonly_rls.sql:59)
revokes table privileges and grants read-only demo access. The
[June migration](/workspace/core/supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:17)
enables RLS and removes public-read policies on these tables. Its
[activity SELECT grant/policy](/workspace/core/supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:211)
uses super-admin or donor-linked staff/owner identity; it is not the new exact
activity/target/coach permission model. There is no activity write policy in
that inspected chain; the reached server writer uses its privileged client.
No live ACL, role inheritance, deployed catalog, trigger, RPC or full migration
replay was qualified. Do not claim that RLS alone secures a service-role writer,
or enable browser writes to make a new UI work.

The [donor hook key](/workspace/core/packages/database/hooks/missionary-donors.ts:149)
includes missionary profile and “redacted,” with a 30-second stale time, but no
tenant/active-assignment/permission generation/period/measure. The API derives
scope from current auth. This is an unsafe key to copy for multi-context target
counts; it does not prove that a deployed tenant switch currently leaks data.
The [activity collection](/workspace/core/packages/database/collections/tables/giving.ts:14)
explicitly disables realtime. Do not promise live counting or revocation merely
because a collection exists.

### S5 — Network recovery can duplicate this manual log

The [mutation client](/workspace/core/apps/missionary/app/donors/donor-mutation-client.ts:19)
treats non-OK and network errors as `ok:false`; success discards the response
body. There is no stable command ID in the
[request](/workspace/core/apps/missionary/app/donors/donor-mutation-client.ts:46).
The [view handler](/workspace/core/apps/missionary/app/donors/use-donors-page-view.tsx:254)
says “Activity logged successfully,” clears input and closes after acknowledged
success, then triggers fire-and-forget query invalidation. A lost response after
commit can appear as failure and a fresh retry can insert another random-ID row.
This follows from the inspected boundary; no network/concurrency experiment ran.

Reuse acknowledged-save-before-clear. Add source-owned stable operation/result
recovery and one encounter identity. A failed refresh after accepted save remains
“Saved; progress could not refresh,” not a failed activity or invitation to log
again. Correct/remove an entry through the same permitted source with expected
revision, count adjustment and retained attribution; Undo cannot blindly restore
over a newer correction. Reclassification, import, sharing, duplicate transport
and another person's narrative must not each create an additional encounter.

### S6 — Task, calendar and email states do not prove an interaction

Current [Call/Email actions](/workspace/core/apps/missionary/app/donors/donors-page-detail.tsx:409)
are ordinary anchors to the [tel/mailto helpers](/workspace/core/apps/missionary/app/donors/donors-page-model.ts:151).
Manual Log Call/Meeting/Email actions are separate. Opening a dialer or mail
composer does not itself insert an activity in this inspected path; preserve
that boundary. It also does not prove an attempt actually occurred.

The [task update](/workspace/core/packages/api/src/missionary-portal/task.ts:25)
sets task status/completed_at and returns a task. It does not write an interaction.
A meeting-type [task schema](/workspace/core/packages/api/src/missionary-portal/tasks.ts:21)
has a nullable due date, not attendance or a qualified timed appointment. The
bounded calendar implementation census is reused from
[D14](/workspace/core/docs/features/missionary-workspace-depth/grill/d14-evidence/current-source-and-ux.md:13).
An optional provider calendar copy, future appointment, past timestamp or task
checkbox must not become a held meeting. D19/D20 independent follow-up completion
must remain useful without forced activity creation.

The reached [Email Studio](/workspace/core/apps/missionary/app/email-studio/page-client.tsx:77)
still says Coming Soon. The lower
[Resend wrapper](/workspace/core/packages/email/resend/send.ts:245)
returns success when its provider responds without an error, optionally with a
message ID. That is provider acceptance, not delivery, reading, human reply or
conversation. The [inbound workflow](/workspace/core/packages/api/src/workflows/functions/inbound-email-processing.ts:41)
retrieves and routes Support Hub messages, not a qualified missionary personal
inbox. D15's bounded personal-send evidence is reused from
[its source note](/workspace/core/docs/features/missionary-workspace-depth/grill/d15-evidence/current-source-and-ux.md:77).
An eventual admitted email source may contribute its exact authorized outreach
fact once; a bulk newsletter, synthetic test send, webhook retry or manual log
must not silently become extra personal exchanges or multiply one occurrence.

### S7 — Reuse shared controls and truthful states, not placeholder semantics

The [mounted activity dialog](/workspace/core/apps/missionary/app/donors/donors-page-dialogs.tsx:51)
has a useful compact shared Dialog/Field/Textarea/Button structure. Its call
placeholder “What did you discuss?” presupposes a conversation; its required
narrative and Save give no outcome/date/audience preview. The inline
[composer](/workspace/core/apps/missionary/app/donors/donors-page-detail-overview.tsx:59)
uses shared labelled controls, but “Post” plus a send icon is unclear for a
private source record. These are layout precedents, not final D23 semantics.

Shared [SettingsCard](/workspace/core/packages/ui/components/settings/settings-card.tsx:14),
Field, Input, Select, Calendar, Empty and Button are available in exact
[base-maia](/workspace/core/packages/ui/components.json:3).
The shared [Progress](/workspace/core/packages/ui/components/shadcn/progress.tsx:13)
converts an undefined value to zero: the D23 composition must explicitly branch
unknown/not configured/unavailable before using a numeric progress display.
No new dependency or parallel visual system is needed.

The actual [Analytics page](/workspace/core/apps/missionary/app/analytics/page-client.tsx:97)
uses Unavailable KPI copy and distinct loading/error/empty giving-chart states.
These are useful state patterns. Its giving hook
[zero-fills monthly buckets](/workspace/core/packages/lib/hooks/use-donation-metrics.ts:82)
and has a [previous-zero percentage convention](/workspace/core/packages/lib/hooks/use-donation-metrics.ts:144);
neither is a qualified activity completeness, streak or growth contract.
[Funding progress](/workspace/core/packages/api/src/missionary-portal/model.ts:360)
likewise defaults absent money goals to zero and caps percentage at 100; it is
not an activity-target configuration model. The exported
[ActivityFeed](/workspace/core/packages/missionary/components/activity-feed.tsx:28)
renders gift contributions, not interactions; no missionary app consumer was
found in the bounded symbol search. Do not label it a mounted activity dashboard.

Missionary [Save Preferences](/workspace/core/apps/missionary/app/settings/page-client.tsx:112)
only clears a local dirty flag. It cannot establish persistent targets. A future
target needs a real accepted configuration/revision; unconfigured and deliberately
removed are not database failures or an inferred target of zero.

## Smallest complete candidate journey

This is proposed UI wording, not a rendered/tested product or new disclosure
decision. Keep one compact optional target surface in the existing workspace.

1. **Choose intentionally.** “Activity targets · Optional” and “Choose a measure”
   show only qualified supported activity types, with a short definition. Allow
   a personal name, target amount and supported schedule; do not offer “Create
   activity type,” a formula builder or arbitrary source qualification. A calls
   measure includes answered and unanswered actual recorded calls; a conversations
   measure requires actual exchange. Show the exact chosen period and target;
   no recommended quota, combined activity score, ranking or traffic light.
   A personal name stays alongside the canonical measure meaning; renaming
   “Calls made” to “Conversations” must not change its source predicate. Validate
   target amounts as the qualified measure requires, without a fabricated quota.
2. **Save a clear target.** Plain review: “My target: [number] recorded calls in
   [period]. Calls that reached someone are included.” Save once with pending,
   acknowledged, conflict and unavailable states. No target leaves normal work
   usable. Settings/target editing does not grant contact, send or coaching rights.
3. **Record once from real work.** The source form has the currently allowed
   subject, method, actual outcome and occurrence date/precision; context supplies
   what is already known. A call can say “No answer,” “Left voicemail” or an
   actual conversation; labels must follow the final owner-defined taxonomy.
   Optional note remains optional for an ordinary qualified fact. Clearly state
   the source audience. “Save activity” records a fact and sends no message.
4. **Understand progress.** “5 recorded calls” and “2 conversations” may describe
   the same five encounters. Make overlap clear; do not show a synthetic total
   of 7. Only an actually selected target gets target progress. Offer permitted
   contributing records without forcing a chart or disclosing hidden bodies.
5. **Correct and recover.** An entry's correction recalculates affected allowed
   periods. Preserve input on rejection; reconcile an uncertain save under its
   original command. Accepted activity with failed progress refresh stays saved.
   Unknown dates/coverage and denied history have plain states, not zero.
6. **Change or remove the target.** State the effective period and keep accepted
   historical target meaning distinguishable. Removing a target stops that
   comparison; it does not delete interaction history, end real obligations or
   revoke/expand unrelated grants. No activity-sharing toggle is silently added.

Use keyboard-operable shared controls, visible labels, associated errors and
status announcements; restore focus to the initiating action. On phones retain
context, input and the same operation through reconnect. No hover-only meaning,
color-only result, drag-only choice, animation requirement or forced reload.
An accessible text count/definition is sufficient; charts and streaks are not
necessary to make the first useful journey complete.

## Eight concern dimensions and exact candidate clauses

Severity describes conditional implementation/reuse impact; likelihood is not a
measured production incident. Each clause refers to the inspected sources above.

| ID / dimension                       | Material concern, severity and likelihood condition                                                                           | Exact candidate requirement                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Proofs      |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| S23-C1 — Product meaning             | High; likely if legacy call/meeting labels or overlapping measures are treated as independent completed activities. S1/S6.    | Optional targets SHALL distinguish qualified recorded outreach from actual exchange and held meetings. Personal names, amounts and supported schedules SHALL not create new activity types, change canonical measure predicates or imply a recommended workload. A source occurrence MAY support more than one clearly defined measure but SHALL not be summed twice as distinct activity. Missing logs, unanswered outreach and target absence SHALL not create a score, failure, mandatory next task, contact permission or obligation. | P1–P3       |
| S23-C2 — Data integrity              | High; likely if entry timestamps, generic status, missing actor or current donor assignment supplies historical truth. S1–S3. | Count only qualified source occurrences with trusted attribution, exact subject, outcome, identity and retained occurrence precision. Recorded/updated time SHALL not replace unknown occurrence time. Define period/zone boundaries explicitly; preserve unknown/partial states and historical target revisions.                                                                                                                                                                                                                         | P4–P6       |
| S23-C3 — Tenant/security/permissions | High; conditional on privileged writer/cache/aggregate reuse or new coaching projection. S3/S4.                               | Source writes, corrections, target changes, counts and contributing-record views SHALL enforce current exact tenant/assignment/entity/action/field/history authority at acceptance and disclosure. Target availability SHALL not grant source, contact, sending or coaching rights. Apply the same restrictions to totals, dates, differences, sorting, exports and caches; client actor/flags SHALL not manufacture provenance.                                                                                                          | P7–P8       |
| S23-C4 — Lifecycle/concurrency       | High; plausible with lost replies, concurrent corrections, duplicate narratives/imports and context changes. S4/S5.           | One deliberate activity command SHALL have one stable authoritative result and encounter identity. Exact retry SHALL recover that result under current disclosure, not insert again. Corrections/removal/Undo SHALL compare the current source revision and adjust affected qualified counts without overwriting newer evidence or creating another encounter.                                                                                                                                                                            | P5, P9–P10  |
| S23-C5 — UX/accessibility            | Medium/high; likely if required prose, false zero/progress or local-only Save is copied. S2/S3/S7.                            | The compact journey SHALL expose measure meaning, exact period, optionality and source audience; use explicit saved/pending/uncertain/conflict/unavailable states. Preserve input/focus and distinguish no target, zero recorded under complete coverage, incomplete data and denied history. Do not require a narrative or chart for ordinary qualified manual facts.                                                                                                                                                                    | P6, P11–P12 |
| S23-C6 — Architecture/debt/migration | High; likely if a separate target log or legacy flags are promoted into source authority. S1/S6/S7.                           | Reuse the owning P9 interaction/correction and qualified P6/P17 outcome contracts; target configuration and projection SHALL not become a second interaction engine. Fence legacy/manual/import/background writers from forging qualified provenance. Preserve uncertain legacy evidence honestly; do not bulk-convert every call/email/meeting/task row into an exchange or current actor's work.                                                                                                                                        | P2–P5, P13  |
| S23-C7 — Performance/boundedness     | Medium/high; likely if paged donor arrays become totals or every view scans lifetime history. S3/S4.                          | Compute exact qualified period counts through bounded indexed source queries/projections with explicit coverage and freshness; do not silently truncate or fetch all note bodies. Correction/revocation must invalidate affected authorized scopes. Do not promise realtime from a disabled collection or invent a lifetime total/streak from a loaded window.                                                                                                                                                                            | P6–P8, P14  |
| S23-C8 — Recovery/audit/proof        | High; plausible with generic failures, missing receipts and privileged operations. S4/S5.                                     | Persist/recover the source command result and required attribution/audit with its accepted transition. Accepted source writes SHALL remain accepted after refresh/materialization failure. Monitor denied/stalled/uncertain projections without protected narrative payloads. Activation SHALL require actual authority, migration, source, race and accessibility evidence; mocked UI/API checks alone are insufficient.                                                                                                                 | P9–P14      |

## Falsifiable proof outcomes proposed, not run

1. Five deliberately recorded calls, including two conversations, produce the
   permitted five-call and two-conversation measures without a seven-event total.
   A target on one category does not auto-enable another or disclose either.
2. Opening tel/mailto, saving a draft, copying text, completing an independent
   task, scheduling/cancelling/no-showing a meeting and receiving an open/click
   create no invented actual exchange. A real unanswered call can be outreach.
3. A brief attributable human response may qualify as exchange without prior
   outbound/transcript/sentiment test. Automated/uncertain replies cannot. A
   provider-accepted send remains the exact allowed outreach fact, not proof of
   delivery or response; bulk/synthetic sends do not become personal exchanges.
4. A legacy `call` with “Left voicemail,” missing actor/outcome/date, imported
   note or current donor reassignment does not silently acquire completed-
   conversation/current-actor attribution. Qualify migration per source evidence.
5. Two narratives of one encounter, retries, import replay and source re-sharing
   leave one encounter. Correcting an outcome/date updates the affected measures
   without a second activity; unrelated simultaneous activity remains intact.
6. Late entry, date-only, explicitly unknown date, travel, daylight-saving and
   period-boundary cases use the declared occurrence/zone contract. Truncated,
   denied, unavailable and complete-empty evidence yield distinct honest states.
7. Real-role cross-tenant, inactive-assignment, restricted relationship and
   revoked capability attempts fail at source acceptance and result disclosure;
   valid exact-scope manual facts still work. Neither source-read nor target-
   manage authority automatically confers the other or any contact/send right.
8. A permitted target/category does not expose coach/staff/private-history
   counts, dates, source links or inferable deltas without independent current
   disclosure. Old context/cache responses are discarded on scope/revocation.
9. Commit followed by lost response reconciles the same command once; genuine
   rejection preserves input. A failed count refresh after acknowledged save
   reports saved source and unavailable progress, without a fresh insert.
10. Simultaneous correction, deletion/restriction and Undo use expected source
    revisions; stale operations cannot restore a newer-invalid fact. Required
    audit/result and the accepted source transition cannot disagree after failure.
11. Create/change/remove target has real acknowledged persistence, no-op and
    conflict outcomes, and a truthful effective period. Personal names, amounts
    and supported schedules persist without changing the canonical type/predicate
    or silently adding custom types; boundary and invalid amounts are validated. Removed target does not
    erase activity or unrelated obligations; prior target meaning is not rewritten.
12. Keyboard, screen-reader, phone/zoom, reduced-motion and interrupted-network
    journeys retain input/context/focus and name states without color/hover.
    Optional note is not required to record an ordinary qualified manual fact.
13. Actual migration inventory and old route/browser/import/background tests
    demonstrate no bypass into forged source/outcome/actor fields; safe legacy
    history stays available under its restrictions without invented certainty.
14. A high-volume donor and activity set beyond the present 2,000-row window
    yields correct qualified period results or explicit incomplete state, never
    an incorrect precise count. Inspect real query plans, tenant selectivity,
    correction/revocation invalidation and projection-recovery bounds.

## Verification and remaining limits

Read-only inspection of the
[mutation unit test](/workspace/core/tests/unit/packages/api/missionary-portal/donor-mutations.test.ts:74)
shows mocked ownership predicates and the current voicemail insert payload.
The [client test](/workspace/core/tests/unit/apps/missionary/app/donors/donor-mutation-client.test.ts:40)
checks API URL/payload/success. The
[anonymous mutation tests](/workspace/core/tests/unit/packages/api/missionary-portal/donor-anonymous-mutations.test.ts:115)
exercise tags/profile writes, not this activity command. These tests do not
qualify actual DB roles, atomic authorization, period totals, retry deduplication,
actor/source attribution or activity anonymity. No test execution is claimed.

The existing D19/D20 Vitest precollection blocker (`@sentry/nextjs/config` package
export resolution) was not rerun without a new justification. No deployment,
live database ACL, complete schema replay, network race, actual provider outcome,
query plan, cache switch, accessibility session or current UI screenshot was
obtained. The proposed checks above remain activation work, not passed evidence.
Only this research note is changed by this subtask; structural links/line bounds
and whitespace are checked separately from application correctness.
