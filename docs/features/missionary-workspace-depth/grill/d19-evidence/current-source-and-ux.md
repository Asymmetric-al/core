# D19 — Current gift/task source and first-support follow-up UX

Research only, 16 October 2026. The founder selected native personal follow-up
for a supporter's first qualifying support to the exact ministry/project, even
when that supporter already gives elsewhere in the organization. This note
records current code, inherited limits and candidate qualification requirements.
It does not implement a trigger, qualify historical coverage or activate work.

## Scope and confidence

Read root and relevant missionary/API/database/UI/Supabase instructions and the
repository Supabase skill. Inspected the mounted missionary task dialog/list/
donor-task views, hooks, portal task/read/redaction APIs; the current donation
endpoint, Stripe settlement-to-staging path, background workflow registration,
dispatch ledger and recovery functions; shared Mission Control task creation,
finance callers, migrations and selected tests. Reused the D1/D3/D4 retained-data
and D15 communication findings only as context, not as new runtime proof.

Bounded searches covered `packages/api/src/missionary-portal`, `donations`,
`donate`, `stripe`, `giving`, `workflows`, `admin/mission-control-tasks`, selected
contribution-operation callers, missionary UI, database hooks and forward SQL.
Search terms included `first_gift`, `firstGift`, first gift, `thank_you`,
`missionary_tasks`, `mission_control_tasks`, `getSupporterRoster`,
`getPartyCreditActivity`, recognition and source-work projection terms.

**Finding:** no qualified first-support evaluator/producer or recognition-to-D19
task adapter was located in those paths. A manual Thank You task type and real
payment/finance exception workflows do exist. This is not an assertion that no
other branch, operational script or deployed system contains such work. No
hosted schema/grants/data, provider traffic, scheduler registration, deployed
feature state or production workload was inspected. No installs, live calls,
sends, migrations or application edits occurred; only this note was written.

## Selected behavior and inherited limits

| Authority inspected                                                                                                                                                                                                                            | Consequence for this decision                                                                                                                                                                                                                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Phase 28 roadmap](/workspace/core/docs/prds/sitestacker-parity/roadmap.md:4173), [owner constraints](/workspace/core/docs/prds/program-roadmap/owner-constraints.md:74)                                                                       | Native first/special/fulfillment work is already required. D19 selects first-support subject scope, not whether native tasks exist. It adds no automatic donor-facing send.                                                                                                            |
| [Phase 35](/workspace/core/docs/prds/sitestacker-parity/roadmap.md:4837) and [first-gift conditions](/workspace/core/docs/prds/sitestacker-parity/roadmap.md:4843)                                                                             | Optional recipes support organization-first and designation-first conditions and cannot delay native P28. Incomplete history cannot prove first. A designation is not automatically a ministry/project.                                                                                |
| [P35 ownership/deduplication](/workspace/core/docs/prds/sitestacker-parity/roadmap.md:4859)                                                                                                                                                    | Reuse the permanent source-purpose identity for the same intended effect across native and configurable work. Preserve genuinely distinct organizational/personal communications; neither “always merge” nor “always send twice” follows.                                              |
| [P16 authoritative money/fulfillment](/workspace/core/docs/prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:74)                                                                                                               | Posted contribution lines and conserved fulfillment applications are distinct. A commitment, expected occurrence, processing payment or recognition assertion is not a new received gift.                                                                                              |
| [P16 terminal-miss projection](/workspace/core/docs/prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:887)                                                                                                                     | Its informational missed-recurring notice creates no default outreach task. D19 must not accidentally expand that source's policy.                                                                                                                                                     |
| [P14 legal donor/recognition wall](/workspace/core/docs/prds/sitestacker-parity/phase-14-donor-credit-operations.md:26), [church-member contactability](/workspace/core/docs/prds/sitestacker-parity/phase-14-donor-credit-operations.md:1167) | A legal donor, recognized supporter and permitted recipient differ. Visible-but-not-contactable member rows have no messaging/list affordance or automatic enrollment. P14 explicitly leaves mediated member thanks as a separate P28 question; D19 does not silently answer it.       |
| [ADR-0183 source task contract](/workspace/core/docs/adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:24), [closure](/workspace/core/docs/adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:71)                 | A shared task projects one source occurrence/current required action. Source-backed work has no independent generic Complete/Delete/Reopen/drag-to-Done. Current authority and the source receipt govern closure.                                                                      |
| [P27 actual exchange](/workspace/core/docs/prds/sitestacker-parity/phase-27-donor-development/partnerships.md:2365), [voluntary contribution](/workspace/core/docs/prds/sitestacker-parity/phase-27-donor-development/context.md:17)           | A sent thank-you is outreach, not necessarily a conversation. Task completion, phone launch and generic notes do not create an exchange. Optional history does not become compulsory reporting or a prerequisite to normal use; real source obligations retain their own requirements. |

The chosen scope is the source-qualified ministry/project subject. It is not the
current worker's profile ID, a label, one campaign/fund code, every alias or a
fresh first gift after reassignment. Exact admissible recognition bases and
historical/correction policies require their owning contracts; a direct eligible
gift is the clean explanatory scenario, not a hidden exclusion of every future
qualified recognition profile.

## Actual source-to-work paths

### Payment success and background recovery

1. [Donation POST](/workspace/core/packages/api/src/donations/index.ts:78)
   resolves an authenticated donor/admin/staff context, requires an idempotency
   key and calls the existing gift-intake/saga path. Its request uses legacy
   `missionaryId`; it is not D19's ministry/project identity registry.
2. [Stripe webhook](/workspace/core/packages/api/src/stripe/webhooks.ts:468)
   persists the verified raw event, requests a tenant-scoped workflow dispatch
   identified by Stripe event ID and has a fallback inline processing path.
   Webhook acceptance is not task creation or completed personal thanks.
3. [PaymentIntent processing](/workspace/core/packages/api/src/stripe/webhooks.ts:252)
   resolves a legacy donation, preserves terminal paid status, writes the new
   status, then calls `stageGiftFromStripeDonation` for completed payments.
   [Staging](/workspace/core/packages/api/src/giving/staged-gifts.ts:312)
   reuses a donation-linked staged gift, creates its initial allocation and
   handles a duplicate insert. These are payment/intake identities, not a
   certified historical first-support occurrence or D19 effect key.
4. [Registered workflows](/workspace/core/packages/api/src/workflows/serve.ts:21)
   include smoke, dispatch recovery, donation-saga recovery, Stripe processing/
   recovery and inbound email. No first-support task handler appears in this
   inspected registration. The [Stripe worker](/workspace/core/packages/api/src/workflows/functions/stripe-event-processing.ts:64)
   claims the raw event before applying it and records its authoritative
   processing outcome. The [saga worker](/workspace/core/packages/api/src/workflows/functions/donation-saga-recovery.ts:14)
   explicitly concerns payment recovery, not stewardship completion.
5. [Dispatch ledger](/workspace/core/packages/api/src/workflows/ledger.ts:117)
   creates/reuses a row by tenant/idempotency key. [SQL](/workspace/core/supabase/migrations/20260611134500_workflow_dispatch_ledger.sql:7)
   enforces that key and records handoff states. The [adapter](/workspace/core/packages/api/src/workflows/dispatch.ts:19)
   explicitly says handoff deduplication does not replace product idempotency
   or product work claims. It is useful infrastructure, not proof of atomic
   D19 source admission, task/history creation and permanent effect consumption.

The current webhook calls staging after its donation update. Do not splice a
task insertion into that status branch and call every successful payment the
first gift. It would bypass the selected subject, full eligible history,
effective allocation/correction facts and other gift entry paths. This is a
conditional reuse hazard, not an observed duplicate task incident.

### Current missionary reads cannot establish first support

| Actual read/model                                                                                                                                                                                                                                                                                             | Concrete limitation                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Context resolution](/workspace/core/packages/api/src/missionary-portal/service.ts:159) resolves profile and legacy missionary rows with tenant predicates. [Snapshot](/workspace/core/packages/api/src/missionary-portal/service.ts:194) reads 250 donations by missionary ID, 250 donor rows and 100 tasks. | Useful current portal seam; incomplete loaded pages cannot prove absence of older qualifying support. Worker/profile, legacy missionary and exact ministry/project identities must not be silently equated. |
| [Donation row type](/workspace/core/packages/api/src/missionary-portal/model.ts:43) carries legacy ID/donor/amount/currency/status/date; [gift mapping](/workspace/core/packages/api/src/missionary-portal/model.ts:317) filters settled rows and renders them.                                               | No certified history-coverage, recognition basis, contribution-line provenance or exact source-subject first-occurrence evidence exists in that inspected shape. A displayed gift is not that certificate.  |
| [Legacy migration](/workspace/core/supabase/migrations/20260214090000_foundation_1_schema.sql:384) backfills `first_gift_date` using `MIN(gift_date)` over donations grouped by donor.                                                                                                                        | No ministry/project partition, effective posted-line qualification or history-completeness statement. It is not a D19 eligibility field, even if a permitted frontend may read it.                          |
| [Supporter projection](/workspace/core/packages/api/src/missionary-portal/donors.ts:332) assembles legacy activities/pledges and filters `donors.missionary_id`.                                                                                                                                              | No qualified `getSupporterRoster`/P14 recognition producer was located in the inspected portal/giving/contribution paths. Do not reconstruct church/DAF/household recognition from this shape.              |
| [Standalone tasks](/workspace/core/packages/api/src/missionary-portal/service.ts:252) retrieves all matching profile tasks; the hook then filters/sorts in memory.                                                                                                                                            | Unlike the snapshot cap, the standalone query exposes no explicit paging contract. Neither cap truncation nor unbounded whole-list loading is the intended complete, bounded D19 workspace.                 |

### Manual task writers and privacy

- [Task POST](/workspace/core/packages/api/src/missionary-portal/tasks.ts:30)
  accepts title/description/type/status/priority/due date/donor/sort key. Its
  [insert](/workspace/core/packages/api/src/missionary-portal/tasks.ts:81)
  explicitly writes `is_auto_generated: false`. There is no contribution-line,
  ministry subject, source-purpose occurrence, expected revision or semantic
  command identity in this schema.
- The mounted [TaskDialog save](/workspace/core/packages/missionary/components/task-dialog.tsx:167)
  is a **different writer**: browser Supabase directly inserts/updates
  `missionary_tasks`, returning an unredacted donor join in that code path.
  [Its payload builder](/workspace/core/packages/missionary/components/task-form-model.ts:81)
  includes client profile identity, notes/reminder date and always
  `is_auto_generated: false`, including editing an existing task.
- [PATCH](/workspace/core/packages/api/src/missionary-portal/task.ts:25) permits
  generic task edits. It assigns server `completed_at` when status becomes
  completed and writes by task ID/profile ID. [DELETE](/workspace/core/packages/api/src/missionary-portal/task.ts:102)
  physically deletes by those predicates and returns success when the request
  reports no error. No source-kind guard, expected-head comparison, durable
  outcome receipt or independent interaction write is present in these methods.
- [Route helper](/workspace/core/packages/api/src/missionary-portal/route-helpers.ts:24)
  uses a privileged client after requiring missionary role. [Donor attachment](/workspace/core/packages/api/src/missionary-portal/service.ts:278)
  checks tenant/profile ownership for the selected legacy donor. These checks
  are facts to retain, but do not implement P12 exact source/subject/action
  authority for a shared ministry/project work item.
- [Task projection](/workspace/core/packages/api/src/missionary-portal/model.ts:261)
  returns title/description and donor ID unchanged, then redacts the joined
  donor using [the anonymity helper](/workspace/core/packages/api/src/missionary-portal/redaction.ts:101).
  This protects name/email/avatar in that join; it does not scrub previously
  copied identity inside a title/description or establish an anonymous-safe
  source relationship ID. D19 must produce safe list facts and current-source
  detail rather than create raw named task text and hope this helper hides it.

These are current-code reuse limits, not a claim that the existing manual
task feature already presents source-backed D19 tasks or leaks hosted data.

### Shared staff task adapter is not yet the D19 source contract

[Mission Control task types](/workspace/core/packages/api/src/admin/mission-control-tasks/types.ts:10)
cover finance/correction/provider issues. The [Supabase adapter](/workspace/core/packages/api/src/admin/mission-control-tasks/store.ts:47)
ensures **Finance Operations**, fixes source to `contribution_operations` and
defaults assignment to actor plus that queue. Actual callers include
[correction approval](/workspace/core/packages/api/src/admin/contribution-operations/approval-notifications.ts:475)
and [blocked correction-notification follow-up](/workspace/core/packages/api/src/admin/contribution-operations/notifications/store.ts:492).
They do not establish a missionary stewardship recipient or broadcast policy.

[Creation](/workspace/core/packages/api/src/admin/mission-control-tasks/service.ts:62)
performs task insert, link insert and event append as separate awaited calls.
The inspected [store](/workspace/core/packages/api/src/admin/mission-control-tasks/store.ts:75)
implements those as separate Supabase requests. Its input has no permanent
source-purpose dedupe key. [Needs Attention](/workspace/core/packages/api/src/admin/mission-control-tasks/attention.ts:9)
does accept a caller key, and [SQL](/workspace/core/supabase/migrations/20260526193000_mission_control_tasks.sql:78)
uniquely constrains tenant/key on **attention items**, not every task creation.
Do not infer transactionality or permanent first-support deduplication from the
presence of an attention key, audit event or a workflow dispatch key.

The shared task identity and source-action model in ADR-0183 remains the target;
extending its owning seam is different from constructing a third task store.
Finance exception assignment and urgency defaults are not missionary stewardship
defaults. A source-defined responsible person is required; no guessed staff
queue, all-staff broadcast or current viewer fallback.

## Schema, grants and retained-data qualification

- [Initial missionary-task schema](/workspace/core/supabase/migrations/20250101000000_init_schema.sql:287)
  has a profile FK with `ON DELETE CASCADE`, a donor FK and mutable task facts.
  It has no tenant/source-purpose tuple or completed interaction history in that
  definition. The inspected forward migration text did not locate additions for
  all fields later referenced by the dialog (`notes`, `reminder_date`,
  `is_auto_generated`). This is schema-source uncertainty requiring a retained
  schema census, not proof those fields are absent in a hosted database.
- The initial RLS-disabled declaration is **not the latest inspected posture**.
  [The later migration](/workspace/core/supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:17)
  enables RLS/drops public read on the task table; [line 265](/workspace/core/supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:261)
  revokes anon/authenticated privileges explicitly. Therefore the browser
  TaskDialog writer conflicts with that intended server-only table posture; do
  not characterize it as a demonstrated authorization bypass. Hosted grants,
  membership, policy composition and application of the migration remain unproved.
- [Mission Control schema](/workspace/core/supabase/migrations/20260526193000_mission_control_tasks.sql:14)
  has tenant FKs, mutable generic statuses and source/issue labels. Links,
  comments and task events cascade with task deletion. [Grants](/workspace/core/supabase/migrations/20260526193000_mission_control_tasks.sql:109)
  enable RLS, revoke browser roles and grant service-role access. Application
  commands must still enforce exact tenant/source/action authority; RLS does not
  supply it to privileged writers. No live role/grant probe was performed here.

Before adapting retained tasks, inventory source IDs, titles/bodies, donor and
worker references, manual/generated flags, due/status/completion values,
comments/events/links, source aliases, actor/tenant provenance and actual schema.
Do not classify an old task as the new source occurrence by title, date, amount
or `thank_you` alone. Preserve completed work and unresolved obligations under
their lawful source/retention rules; make uncertain historical mappings explicit.
Fence incompatible browser/API/import/background writers before activation.
Do not backfill outward work or regenerate old thanks merely because source
history, mappings, a deployment or a restore becomes available.

## Existing UI seams and the smallest useful journey

The [shared configuration](/workspace/core/packages/ui/components.json:3) is
base-maia, Base UI and Zinc semantic tokens. Reuse its existing Button, Badge,
Sheet/Dialog and accessible status/error patterns. This note selects no new
package, new app, separate inbox or independent work store.

Current task rows expose [checkbox completion](/workspace/core/packages/missionary/components/task-row.tsx:400)
and [generic Complete/Reopen/Delete menus](/workspace/core/packages/missionary/components/task-row.tsx:328).
[The hook](/workspace/core/packages/lib/hooks/use-tasks.ts:466) PATCHes completed
status and renders a local timestamp after acknowledgment; it does not record
what actually happened. [Board movement](/workspace/core/packages/lib/hooks/use-tasks.ts:374)
optimistically changes status and restores a saved whole-array snapshot on error.
These are manual-task mechanics, not safe source-outcome/Undo semantics for D19.

[Delete recovery UI](/workspace/core/apps/missionary/app/tasks/page-client.tsx:610)
already provides explicit pending status, persistent error and focus handling.
Reuse those interaction qualities, not the destructive action for source-owned
work. [Dashboard projection](/workspace/core/packages/missionary/components/dashboard-view.ts:73)
calls every noncompleted loaded task attention; [dashboard rendering](/workspace/core/packages/missionary/components/dashboard-home.tsx:431)
shows four items and says caught up when that loaded set is empty. Neither is a
complete first-support source projection.

Candidate journey and copy, requiring real source backing:

```text
Your work
Thank Sam for first support
For Maya's ministry · [permitted received date]
First qualifying support for this ministry
[Review follow-up]
```

1. Put one permitted source-backed item in the existing daily/task experience.
   Show the actual subject and reason. Do not display an organization-wide
   giving history or “new donor” label just to explain that it is ministry-first.
   Amount/currency are optional detail only when independently authorized.
2. Open a compact existing sheet/detail with **Why this is here**, a safe link to
   the qualifying source, source currentness, current responsible person and
   admitted actions. Reuse the same item from supporter detail. Do not make a
   second personal copy or require a setup wizard to see required native work.
3. Offer a qualified personal-contact path only when permitted. D15 connected
   email may be one such path when available; manual work remains possible.
   Opening a composer/dialer does nothing to task completion or exchange history.
4. A source-backed **Record outcome** flow collects only the minimum needed to
   describe the actual action and its actual date/precision; any narrative or
   new next-step choice stays optional unless its own source requires it.
   One-way thanks, attempted contact, no permitted contact and completed
   conversation retain distinct meanings. This note does not invent the final
   outcome catalog or say every attempt satisfies the stewardship obligation.
5. After a confirmed source result, show persistent **Follow-up recorded** plus
   the truthful source outcome. Other independent obligations remain visible.
   A lost acknowledgment says **We couldn't confirm the update** with recovery
   of the same command; it must not invite another send or fresh completion.

| State                                                | Candidate truthful behavior                                                                                                                                                |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Complete eligible history establishes first support  | Show the bounded reason and source-owned next action once.                                                                                                                 |
| History incomplete or matching/correction unresolved | Do not assert first or hide the limitation as zero. Preserve independently valid work; expose investigation only to its qualified owner, not a fabricated missionary task. |
| Anonymous or visible-but-not-contactable source      | Use only the admitted awareness/source action. No stable hidden identity, address, contact button or inferred consent. Do not insist a thank-you can be sent.              |
| Gift corrected before the work is completed          | Re-evaluate through the source. Show the qualified changed/no-longer-required result; do not leave a stale manual checkbox in charge.                                      |
| Gift corrected after an actual thank-you             | Preserve that historical action. A correction does not unsend it, delete history or automatically request another thank-you.                                               |
| Access or responsibility changes                     | Remove inaccessible details and reject late reads/writes. Handoff does not create another first-support event or grant new access.                                         |
| Existing equivalent source work                      | Reuse its permitted source identity/status. No additional task merely because a second event/recipe surfaced it.                                                           |
| Ordinary scheduling or personal engagement           | Only expose actions allowed by the registered source/engagement contract; hiding an item cannot settle the source obligation.                                              |
| Mistaken recorded outcome                            | Use an authorized source correction with current revision and durable receipt. Do not blindly reopen a task, roll back whole history, refund money or repeat a message.    |

Keyboard and screen-reader users need the same source action without drag; focus
must recover predictably after an item leaves the current view. Keep explanation
text available beyond a toast, label icons, preserve long names/RTL and 320 CSS
px/zoom reflow. On slow phones show bounded lists and recoverable loading/error
states; no placeholder count may claim completeness. Existing components alone
do not prove this full journey accessible.

The [task hook](/workspace/core/packages/lib/hooks/use-tasks.ts:157) rejects older
fetch sequences, but its initial-fetch state and dependencies at lines 192–200
do not constitute a tenant/subject authority-generation reset. D19 must clear
unsafe context state and reject late source responses/mutation callbacks on
switch/revocation. No mounted tenant-switch exploit was attempted or claimed.

## Eight material dimensions and candidate requirements

Severity/likelihood below describe the conditional implementation shortcut, not
a proven deployed D19 incident. These are recommendations for the parent review.

| ID / dimension                        | Material concern and conditional likelihood                                                                                                                                           | Exact candidate requirement                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S19-C1 — Product/source meaning       | High; likely if the legacy minimum date or a designation alias is reused. False first-gift labels, duplicate firsts on reassignment and recognition/money conflation undermine trust. | The producer SHALL certify the exact tenant, canonical ministry/project subject, supporter/recognition basis, qualifying source occurrence and complete applicable history under the current owner policy. Unknown history SHALL NOT prove first. Alias, worker or code changes SHALL NOT mint a new first-support identity.                                                                                                                      |
| S19-C2 — Data integrity/concurrency   | High; plausible on concurrent first allocations, webhook retries or correcting earlier history. A task key or browser state becomes the source truth.                                 | Admission SHALL serialize the qualifying first-support decision against relevant current source/history revisions, persist its source-purpose identity and durable projection intent, and enforce at most one intended follow-up effect. Conflicting corrections SHALL resolve through source rules; no status-only task write may overwrite them.                                                                                                |
| S19-C3 — Security/tenant/privacy      | High; plausible if raw task titles and retained donor IDs bypass the safe join or privileged writers trust caller scope.                                                              | Current P12/owner authority SHALL precede enumeration, counts, detail and mutation. Code-owned safe list facts and source-loaded detail SHALL preserve anonymity/contactability; task assignment SHALL grant no access. Browser, service-role, search/cache/realtime/export and background paths SHALL enforce the same boundary.                                                                                                                 |
| S19-C4 — Architecture/owner coupling  | High; likely if Finance Operations creation, Stripe success or optional workflow recipes become the producer.                                                                         | D19 SHALL extend the P28/P9/shared-task source contract, consume exact P13/P14/P16 facts and reuse existing dispatch infrastructure only as execution. It SHALL NOT create a separate task store, use finance queue defaults, wait for P35 or equate handoff success with source completion.                                                                                                                                                      |
| S19-C5 — UX/accessibility             | Medium–high; likely if generic checkboxes or a crowded task form are reused. Users accidentally certify a conversation or cannot explain why work appeared.                           | One source-backed item SHALL show subject/reason/currentness and a permitted action; optional narration SHALL remain optional. Actual outcomes, source closure, deferred engagement and sent/unknown communication SHALL be distinguishable. Keyboard/phone/error/acknowledgment recovery SHALL preserve the same job without drag or repeated entry.                                                                                             |
| S19-C6 — Performance/completeness     | Medium–high; likely if a 250-row history or whole-task-array query is treated as complete. Missing first-support facts or unbounded client memory results.                            | Qualification SHALL use complete source-backed history with explicit coverage, bounded server queries/paging and authorized counts. Evaluation/recovery SHALL avoid full-history scanning per rendered card; workload/index/query-plan proof SHALL precede activation, without invented latency claims.                                                                                                                                           |
| S19-C7 — Migration/debt/retention     | High; plausible if manual/generated flags and historical titles are converted automatically or cascade deletion removes evidence.                                                     | A retained schema/data/writer census SHALL precede migration. Preserve lawful completed effects and unresolved work with provenance; quarantine ambiguous mappings, fence incompatible writers and reconcile restore/correction/erasure before replay. Migration/backfill SHALL NOT itself create outward work or resurrect consumed effects.                                                                                                     |
| S19-C8 — Reliability/operations/proof | High; plausible if separate insert/link/event requests and current mocked tests are treated as end-to-end assurance.                                                                  | The source SHALL expose durable outcomes and recoverable pending/failed/unknown states; accepted work plus projection intent SHALL not disappear between requests. Recovery SHALL reuse exact identity and current authority. Qualification SHALL include real-role, source/claim/correction races, crash/ack-loss, mixed writers and accessible user journeys; current mocks and this blocked test attempt SHALL not count as D19 runtime proof. |

## Proposed proof outcomes, not executed D19 tests

1. Existing organization supporter first supports Maya's exact eligible subject:
   one source occurrence and one personal follow-up; unrelated prior support is
   not disclosed. A second source alias for the same subject makes no new first.
2. A distinct eligible ministry/project may have its own qualifying first;
   changing worker, display name, campaign code or current assignment does not.
3. Split/direct/recognition paths obey the certified profile and count one
   intended source effect; household/DAF/member presence never grants contact.
4. Empty/incomplete/backfilled history, unsettled money, pledge intent and a
   provider success before source qualification cannot produce a false first.
5. Two concurrent qualifying inputs plus repeated Stripe/import/workflow events
   yield the one source-selected effect; the other work is not silently lost.
6. Earlier-history correction, refund/reallocation and identity correction
   update unstarted applicability safely and retain completed outreach truth.
7. Anonymous/count/title/link/notification/search/cache exports contain no
   forbidden identity, and context changes reject late responses and writes.
8. Generic manual PATCH/Delete/drag/import/browser writers cannot change or
   relabel source-backed work, including resetting its generated/source flags.
9. Source completion records actual minimal evidence once; an attempted call,
   opened composer, provider acknowledgment or ordinary task tick manufactures
   neither a conversation nor a delivered thank-you.
10. Crash between source acceptance/projection, lost response, concurrent source
    correction/Undo and restore recover the same receipt without replaying
    messages, reopening consumed work or rolling back intervening history.
11. Native qualified work functions without optional tenant workflows or an
    external email connection; the same intended P35 effect later reuses it.
12. Representative phone/keyboard/screen-reader users understand why the item
    appeared, act or record a truthful limitation, recover interrupted work and
    distinguish completed history from current obligations at bounded workload.

## Tests inspected and attempted

- [Mission Control unit tests](/workspace/core/tests/unit/packages/api/admin/mission-control-tasks.test.ts:230)
  mock insert/link/event dependencies; attention-key behavior is tested
  separately at line 328. These are useful existing seam tests, not real DB
  transaction, first-support, source authority or concurrency evidence.
- [Task form tests](/workspace/core/tests/unit/packages/missionary/task-form-model.test.ts:10)
  verify manual defaults/payload conversion. [Delete recovery tests](/workspace/core/tests/unit/apps/missionary/app/tasks/task-delete-recovery.test.tsx:86)
  exercise failed/pending/success focus behavior against mocked task operations.
- [Stripe workflow tests](/workspace/core/tests/unit/packages/api/workflows/stripe-event-workflow.test.ts:176)
  cover persisted-event handoff/recovery/claim behaviors with mocked boundaries;
  [webhook tests](/workspace/core/tests/unit/packages/api/stripe-webhooks.test.ts:233)
  cover payment event cases. None inspected establishes D19 first-support meaning.

One bounded existing-test command was attempted:

```sh
./node_modules/.bin/vitest run tests/unit/packages/api/admin/mission-control-tasks.test.ts tests/unit/packages/missionary/task-form-model.test.ts --reporter=dot
```

It exited 1 **before collection**: `ERR_PACKAGE_PATH_NOT_EXPORTED`, because
`packages/lib/node_modules/@sentry/nextjs` does not export `./config` requested
while loading `vitest.config.ts`. No selected tests ran. No dependency install,
config workaround or broad rerun was attempted. Actual Core/Supabase source
commands, deployed permissions, background execution, retention/correction
mechanics, user accessibility and production-shaped performance remain unproved.
