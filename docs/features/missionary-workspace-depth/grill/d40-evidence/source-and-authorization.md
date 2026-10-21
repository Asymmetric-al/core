# D40 — current source and authorization review

Reviewed October 18, 2026 against Core `9cada8f3d8ab59db391d3fd20df77fcadeb09813`
and the shared research working tree. This is a bounded static source review for
Q40 answer A: one authoritatively missed recurring occurrence, recovery ended,
with the next ordinary gift still scheduled. It is not a deployed database,
runtime, browser, provider or penetration-test result. No application code,
schema, old evidence, old model, test, verifier or probe was changed or executed.
Repository Supabase, backend, data-access, app and API instructions were read.

## Governing qualification

The [active recurring contract](../../../../../openspec/changes/add-recurring-giving/specs/donation-lifecycle/spec.md:73)
separates occurrence execution, payment finality, ledger posting and executor
control. Its [explicit supersession](../../../../../openspec/changes/add-recurring-giving/specs/donation-lifecycle/spec.md:86)
says the legacy one-subscription/one-`donor_pledges` row is migration evidence and
must not be extended as the target write model. Its existence is not activation
proof. The permanent D40 path consumes the qualified P16 group/line/cohort
source contract; it does not add a missed-gift column to this old row.

[P16 D.8–D.9](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:887)
already requires safe source truth, no per-attempt notice, no default automatic
donor-outreach task, and a grouped in-product missed-occurrence notice only
after the exact key becomes Live. Reserved/unknown keys create no notification
item and later activation does not catch up history. [P16 G.1–G.2](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:1035)
assigns health to one line/pledge, preserves history when current health improves,
and requires a versioned source evaluation with stale/conflict handling.

[ADR-0183](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:24)
requires a finite source contract for required human work; task and notification
engagement do not own financial truth. D40 selects no automatic review task for
this case. It leaves other qualified attention work intact. A deliberately made
ordinary task remains user-owned work, not a new financial obligation.

## Current-source findings

Severity and likelihood below describe the risk **if the inspected path is
reused to claim D40**, not an established production incident or measured rate.

### S1 — The legacy recurring DTO cannot prove the selected condition

**Material concern: yes. Severity high; likelihood high on direct reuse.**
The [legacy webhook mapper](../../../../../packages/api/src/stripe/recurring.ts:28)
reduces most provider subscription states to `active`; failure increments a
[counter](../../../../../packages/api/src/stripe/recurring.ts:254), without a
terminal occurrence, ended recovery, source cursor or completeness result.
[Subscription handling](../../../../../packages/api/src/stripe/recurring.ts:174)
writes `next_charge_at`, while the missionary [query](../../../../../packages/api/src/missionary-portal/donors.ts:543)
selects `next_payment_date` and the [card](../../../../../apps/missionary/app/donors/donors-page-detail-recurring.tsx:149)
renders it. The migration [copied the old date into the new timestamp](../../../../../supabase/migrations/20260214090000_foundation_1_schema.sql:363)
once; that is not a current synchronization contract. The [DTO mapper](../../../../../packages/api/src/missionary-portal/donors.ts:308)
also defaults missing status to active, missing frequency to Monthly and missing
counts to zero; its [type](../../../../../packages/api/src/missionary-portal/donors.ts:39)
has no currency or occurrence-source coverage envelope.

**Consequence:** a transient failure, stale date or unknown source could look
like a final missed gift with a reliable next date. This narrows the answer's
admission, not its product choice. **Exact requirement:** “D40 is admitted only
from the current qualified P16 occurrence and its current permitted ordinary
schedule, with source revision/freshness and independent uncertainty states.
Do not infer Missed, ended recovery, expected amount, next date or collection
availability from a legacy active flag, elapsed time, counters, a missing row,
or copied schedule field. Uncertain fields display Status updating or an
equivalent truthful state while independently valid facts remain visible.”

### S2 — No automatic task was found in the reached path; absence is not qualification

**Material concern: yes, a proof gap. Severity high; likelihood unknown.**
The reached [invoice handler](../../../../../packages/api/src/stripe/webhooks.ts:399)
calls the legacy mapper, which [writes only the pledge](../../../../../packages/api/src/stripe/recurring.ts:271).
The inspected missionary task create route [forces generated false](../../../../../packages/api/src/missionary-portal/tasks.ts:81).
A bounded search of `packages/api/src`, `packages/lib` and `apps/missionary`
found no missed-occurrence-to-missionary-task producer. This does not prove that
all automation, integration, deployment or future source producers have no
such effect; the source-qualified P16 lane was not demonstrated here.

**Exact requirement:** “A D40 occurrence alone creates no automatic review,
outreach or reminder task, no task urgency increment and no required completion
badge through any UI, API, worker, import, automation, notification or replay
path. Viewing, acknowledging or dismissing its information creates no task.
Other independently qualified source obligations remain. Prove absence of
these effects at the qualified producer boundary and representative downstream
paths before activation.” This makes the selected answer falsifiable without
claiming current production conformance.

### S3 — Ordinary task discovery and creation have concrete recovery gaps

**Material concern: yes. Severity high; likelihood high if unchanged.**
The existing [Add Task control](../../../../../apps/missionary/app/donors/donor-tasks.tsx:159)
preselects the donor, a useful discoverability pattern. But the mounted
[dialog](../../../../../packages/missionary/components/task-dialog.tsx:181)
writes `missionary_tasks` directly from the browser, while the later
[grant declaration](../../../../../supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:261)
revokes all anon/authenticated access. With that effective state the write
cannot work; no hosted state was tested. Loosening the grants is not a D40 fix.
The API [creates a row and then reads it](../../../../../packages/api/src/missionary-portal/tasks.ts:81)
in separate operations without a durable creation token in the input: a lost
response or failed readback can prompt a duplicate retry. [Task fetching](../../../../../packages/lib/hooks/use-tasks.ts:184)
retains data and sets an error, but the [donor pane](../../../../../apps/missionary/app/donors/donor-tasks.tsx:69)
does not consume that error and its [empty branch](../../../../../apps/missionary/app/donors/donor-tasks.tsx:201)
can claim “No tasks yet.”

**Exact requirement:** “Reuse the ordinary task experience through its qualified
server command. Opening Add follow-up is not a write; deliberate Save creates
the ordinary task. A durable identity for the same submitted creation intent
returns the same result after retry or lost response; a separately deliberate
new task remains possible. Show existing permitted related work when known;
do not equate unavailable, incomplete or failed retrieval with no work. Preserve
the draft on failure and recover ambiguous success before offering another
Save. Do not widen browser table access to repair the existing dialog.”
This is a required delivery safeguard, not a second task system or automatic
one-task-per-occurrence restriction.

### S4 — Existing task ownership is narrower than the necessary durable contract

**Material concern: yes. Severity high; likelihood conditional/medium.**
The [task schema](../../../../../supabase/migrations/20250101000000_init_schema.sql:287)
has a nullable profile FK, independent donor FK, no tenant column and no
source-occurrence relationship. This is not itself proof of a cross-tenant
exploit: profile identity and server checks constrain current access. The
[create route](../../../../../packages/api/src/missionary-portal/tasks.ts:30)
has a strict allowlist, takes missionary identity from auth, and [checks a
supplied donor](../../../../../packages/api/src/missionary-portal/service.ts:278)
against donor, tenant and signed-in missionary. However [read](../../../../../packages/api/src/missionary-portal/service.ts:252),
[update](../../../../../packages/api/src/missionary-portal/task.ts:81) and delete
use profile scope without an independently established tenant/source tuple;
updates only recheck donor scope when replacing it with a non-null value.
The generic mutation has no source-kind guard and can act on an owned row
regardless of `is_auto_generated`. Source-backed tasks must not inherit this
generic closure surface under ADR-0183.

**Exact requirement:** “Resolve current tenant, actor, recipient, target source
and permitted relationship from trusted server context. Validate both old-row
access and the resulting row and every changed relationship atomically; callers
cannot alter tenant, source ownership, protected actor fields, or generation
class. A manual follow-up cannot be transformed into source-backed required
work or vice versa. Source-owned closure and ordinary task completion remain
distinct. Same-tenant referential integrity and deletion behavior must preserve
source audit truth without retaining unauthorized display content.” These are
qualification requirements for the existing task owner, not a new D40 schema.

### S5 — Raw table and privileged routes are separate exposure paths

**Material concern: yes. Severity high; likelihood conditional/medium.**
The reached wrapper [authenticates and supplies an admin client](../../../../../packages/api/src/shared/with-operation.ts:137);
RLS is not the per-row guard for that privileged route. [The finance SELECT
grant](../../../../../supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:157)
and [pledge SELECT policy](../../../../../supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:234)
permit authenticated owner/staff raw-row reads in the declared migration state.
Row filtering does not redact columns. The same legacy row has provider/payment
references, retry internals and pause context in its [schema](../../../../../supabase/migrations/20260214090000_foundation_1_schema.sql:340).
The later [field-policy data](../../../../../supabase/migrations/20261005050728_field_policy_foundation.sql:285)
denies some missionary fields but does not by itself enforce that decision on
every direct table read. The reached missionary DTO excludes provider IDs but
that is not proof of equivalent protection at other surfaces.

**Exact requirement:** “Qualify all grants, policies, safe views/RPCs, API,
service-role, export, search, cache and integration paths against the same
recipient-specific P16 field ceiling. A safe UI cannot justify raw protected
columns remaining reachable through another endpoint. Enforce authorization
and projection before serialization, including hidden JSON, counts and links.
Disable unqualified exposure rather than adding permissive policies.” D40 does
not authorize card/bank details, decline reasons, exact retry schedules,
provider IDs, sibling-line data, restricted funds, location or private context.

### S6 — Manual context must not become an enduring copy of protected source truth

**Material concern: yes. Severity high; likelihood medium on naive prefill.**
The task [projection](../../../../../packages/api/src/missionary-portal/model.ts:261)
passes through stored title/description and donor ID while separately
redacting the donor join. [Redaction](../../../../../packages/api/src/missionary-portal/redaction.ts:101)
does not sanitize names or protected content previously copied into free text.
The [donor-access check](../../../../../packages/api/src/missionary-portal/service.ts:278)
proves relationship ownership, not contactability or authorization for a new
financial source-purpose. Therefore an anonymous/withheld occurrence cannot
gain a contact action merely because a donor relation exists.

**Exact requirement:** “The source-linked manual task contains only the
ordinary task fields and an authorized source reference/minimal safe context.
Do not copy financial diagnostics or protected donor data into task text,
notifications, coaching or analytics. Recheck current source and recipient
access on read and save; revoke/redact protected context when access changes.
Completing the task never marks a payment received, repairs a mandate, closes
recovery, changes schedule, fulfills a commitment or records donor contact.
The user separately records work actually done through its owning workflow.”

For an occurrence corrected after a task was deliberately made, update its
source presentation; do not silently rewrite the user's title, delete the task,
or manufacture a completion. A brief changed-context notice can prompt Maya to
keep, edit or finish her ordinary work. A lost source link does not authorize
disclosure of why access was removed.

### S7 — Transport deduplication does not establish occurrence correctness

**Material concern: yes. Severity high; likelihood medium on reuse.**
The [event store](../../../../../packages/api/src/stripe/event-store.ts:233)
deduplicates provider event IDs and [claim RPC](../../../../../supabase/migrations/20260512190000_phase_03_giving_pipeline.sql:247)
locks processing. Its [complete RPC](../../../../../supabase/migrations/20260512190000_phase_03_giving_pipeline.sql:287)
checks the lock. These are useful transport mechanisms. However the reached
[handler runs before completion](../../../../../packages/api/src/stripe/webhooks.ts:532)
and [legacy counter mutation](../../../../../packages/api/src/stripe/recurring.ts:254)
is a separate write, with no occurrence-effect identity or cursor check here.
An ambiguous failure after the pledge write and before raw-event completion
is not proved exactly-once by the raw event ID. Concurrent distinct events can
also contend on read/modify/write counters. Cancellation guards exist and are
valuable; they do not qualify all out-of-order payment/correction transitions.

**Exact requirement:** “Render D40 only from P16's durable semantic occurrence,
versioned evaluator and correction history. Duplicate provider events, multiple
attempts, replay and out-of-order delivery cannot multiply misses, notices or
tasks, regress current health or overwrite a later schedule. Source success,
correction, cancellation, pause, end and future-collection loss update their
own facts and applicable work. D40 adds no money mutation or payment loop.”

### S8 — Existing channel controls are not the chosen tenant setting

**Material concern: yes. Severity medium; likelihood high on direct reuse.**
The settings [array](../../../../../apps/missionary/app/settings/page-client.tsx:69)
advertises “Recurring Gift Failed” with email/SMS enabled and per-attempt wording.
Its [Save handler](../../../../../apps/missionary/app/settings/page-client.tsx:112)
only updates local state. It demonstrates neither persisted tenant configuration
nor a source/communication activation contract.

**Exact requirement:** “Use persisted, authorized tenant presentation controls
for the approved informational feature and existing governed communication
preferences. Disablement must not alter or erase occurrence/schedule/ledger
truth, disable independent required work, or secretly switch to automatic tasks.
Do not adopt this legacy per-failure channel matrix, invent a missed-count
threshold, or expose unsupported sends. Saving settings reports only a durable
accepted result, with existing-data and prospective effects explained.”

## Database and authorization checks performed

| Area                     | Static observation and required proof                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RLS and grants           | Initial schema disabled RLS; the [demo migration](../../../../../supabase/migrations/20260216153000_demo_readonly_rls.sql:43) enabled it and reset policies; the later [canonical migration](../../../../../supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:21) removes public reads and keeps tasks server-only. Apply-order declarations were inspected, not a live catalog. Inspect effective policy OR composition, roles and grants in the qualified database before activation. |
| `USING` and `WITH CHECK` | The inspected task surface denies browser access; the reached pledge policy is SELECT-only, so no update `WITH CHECK` can be certified or blamed for those routes. Service-role mutations need equivalent old-row/new-row predicates. Future applicable UPDATE policies must enforce both; PostgreSQL can inherit `USING` as the check when `WITH CHECK` is omitted, so syntax absence alone is not a vulnerability finding.                                                                                    |
| Functions/RPCs           | Reached raw-event claim/complete functions use explicit search paths, no `SECURITY DEFINER` declaration, and [revoke PUBLIC/anon/authenticated EXECUTE](../../../../../supabase/migrations/20260512190000_phase_03_giving_pipeline.sql:425), granting service role. Their correctness is transport-specific; this does not prove a D40 source/mutation RPC. Inspect ownership, bypass, invoker/definer, view and role grants for the eventual source projection.                                                |
| Keys and FKs             | Legacy tasks have independent nullable profile/donor FKs; legacy pledge tenant/missionary/fund FKs use SET NULL. These are not the target P16 aggregate integrity design. Require qualified same-tenant source/recipient/intent references and defined deletion/redaction semantics rather than adding a second D40 authority.                                                                                                                                                                                  |
| Money and dates          | Legacy amounts became [BIGINT minor units](../../../../../supabase/migrations/20260214090000_foundation_1_schema.sql:464), but D40 owns no arithmetic. Require currency-aware source values and the actual schedule date/zone convention; no sum across currencies or invented dates.                                                                                                                                                                                                                           |
| Performance              | Current donor paging limits related rows to [2,000](../../../../../packages/api/src/missionary-portal/donors.ts:450), and snapshot [tasks to 100](../../../../../packages/api/src/missionary-portal/service.ts:214). Limits are facts, not measured capacity or completeness. Use bounded source-detail lookup, pagination and indexes at the actual tenant/source grain; never infer no miss/no task from truncation.                                                                                          |
| Storage/export/retention | D40 creates no upload or storage bucket. Existing protected source rules must govern any references, exports, cached data, backup/restore and minimal audit trail. No new retention override is justified by “informational.” No hosted policies or backup flow were exercised.                                                                                                                                                                                                                                 |

## Test evidence and required acceptance proof

Existing [auth ownership tests](../../../../../tests/unit/packages/api/missionary-portal/auth-ownership.test.ts:27)
mock the query builder and assert profile/tenant predicates; they are not RLS
integration tests. Existing [recurring tests](../../../../../tests/unit/packages/api/stripe-recurring-pledges.test.ts:250)
assert failed counters without a new status and include cancellation-preservation
cases. They do not prove D40 occurrence finality, no-task effects, current
permitted source projections, source correction, or durable manual-intent retry.
They were read, not run.

Required qualification cases, without inventing a second product model:

1. One terminal missed occurrence with a verified next ordinary occurrence
   displays permitted amount/currency/date/history and creates **zero** automatic
   task/reminder/send effects. Duplicate delivery and reload preserve zero.
2. Initial failure, recovery open, processing, unknown/stale/conflicting source,
   voluntary skip/pause/end, and unavailable future collection do not enter D40
   by inference; they retain their independently governed treatment.
3. Two lines sharing a collection incident preserve authorized composition and
   do not multiply the incident or disclose a hidden sibling. Two independent
   occurrences remain distinguishable; one later success does not erase history.
4. A current-schedule change or correction between page load and save rechecks
   source/context and makes the result understandable without silently rewriting
   an ordinary task. Lost-response retry returns the original task; another
   deliberately chosen task remains possible.
5. A user in another tenant, another missionary, revoked role, stale assignment,
   anonymous recipient or disallowed field receives no protected source data or
   action, including direct IDs, REST/RPC, export and cache/realtime paths. Allowed
   old-row access cannot be used to forge forbidden resulting state.
6. Source read error is not empty history; truncated tasks are not “none.” Tenant
   disable/re-enable changes only approved presentation/future eligibility and
   produces no historical task/notification catch-up or loss of existing work.
7. Reserved/unknown communication key yields zero notification artifacts; a Live
   key still uses its exact existing source/recipient/channel contract. D40 itself
   enables no dispatch and no task conversion.
8. Ordinary completion has no effect on contribution, commitment, schedule,
   recovery, source attention closure or sent-communication evidence.

These are required product/source tests and release evidence, not tests claimed
to have passed during this documentation review. No observed load, latency,
tenant size, defect frequency or production incident rate is asserted here.
