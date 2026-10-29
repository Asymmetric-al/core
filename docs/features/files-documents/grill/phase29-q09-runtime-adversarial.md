# Phase29 Q09A — authorized late intake: runtime adversarial review

Research date: 20 October 2026. Core checkout `/home/conrad/code/core`, HEAD `3d85897ebf1515008ef5c676b1c58a15422fb9ab`. Conrad selected A: the ordinary requested due date is a target, so otherwise-authorized late submissions and Q03-permitted pending corrections remain available. Q01–Q08 remain binding.

Source/migration/test inspection and public technical documentation, plus the parent's reported bounded test run described below. No tests were executed by this subagent for Q09. No product/config/schema/dependency/provider/auth changes, credentials, private rows or file bytes. Only this research note was written.

## Judgment

Accept A with a narrow consequence: **passing the ordinary target does not itself deny an otherwise eligible admission**. It does not make all late input authorized, remove hard source cutoffs, extend finite source permission, reopen completed/frozen work or turn upload into business acceptance.

The critical permanent boundary is the source's durable admission of exact finalized bytes under current authority. The source must preserve its receipt time, relevant target/revision evidence and semantic effect separately from later scanning, review, correction and fulfillment.

Current source has useful private-custody and stale-response mechanisms. It does not establish a native private-recipient admission/finalization service or qualified timeliness model. Ordinary task dates and existing upload success callbacks cannot supply those missing semantics.

## Actual source: what can and cannot be reused

### 1. Task due dates are editable task data, not native authority

`packages/api/src/missionary-portal/tasks.ts:30–40,81–98` accepts a nullable date-time and persists it with a task. `task.ts:25–58,81–97` allows due-date/status updates; completion time is mutable application now. `service.ts:252–275,295–312` reads tasks under missionary/task scope without an overdue exclusion.

The inspected schema stores due and completed timestamps separately (`supabase/migrations/20250101000000_init_schema.sql:286–300`). Shared staff task schema likewise has due, completion and reminder timestamps (`20260526193000_mission_control_tasks.sql:14–36,59–65`). These are source-confirmed data shapes, not proof of the effective hosted schema or native document policy.

Current presentation also differs by surface:

- `apps/missionary/app/tasks/page-client.tsx:793–821` filters “overdue” with browser date helpers, excluding today and completed/deferred tasks.
- `packages/lib/hooks/use-tasks.ts:267–290` counts overdue using status plus browser-local day boundaries; the memo depends on task data, not an authoritative source clock transition.
- `apps/admin/app/(app)/tasks/task-form-model.ts:188–201` serializes a date-only `yyyy-MM-dd` plus a separate optional time.
- Its drawer explicitly interprets the date part as a local calendar day (`task-drawer.tsx:44–78`), while `tasks-content.tsx:106–125,150–158` compares parsed date strings against a browser-local midnight.
- The missionary form serializes an ISO instant (`packages/missionary/components/task-form-model.ts:83–100`).
- Staff form reminder creation defaults to an hour before its supplied due date (`task-form-model.ts:124–136`). That is not a Q09 reminder decision.

These are concrete differences and reuse hazards. This review did not reproduce a browser timezone defect and does not claim a live native intake bypass. Do not reuse any of these client comparisons as authoritative timeliness, admission permission or automatic date policy.

### 2. Stale-response fencing exists and is useful

`packages/lib/hooks/use-tasks.ts:132–192` maintains a request sequence, ignores older/unmounted fetch completions, exposes failed fetches as errors, and only replaces tasks on success. That is useful for keeping a late earlier response from overwriting a newer received/closed/restricted state.

It remains a task hook, with its own profile/scope behavior. It does not prove a private recipient projection, current authorization or a complete tenant/request switch fence. Q09 should reuse the discipline through the proper shared query/source design, not copy the hook wholesale.

An error must not become “no files,” “no outstanding work,” “on time,” “late,” “completed” or a new upload prompt. A truthful unknown/refresh state and a durable admitted receipt can coexist.

### 3. Eve has prepare/upload/complete, but not native evidence admission

`packages/api/src/eve/retention/control.ts:94–154`:

1. Creates a random artifact identity and tenant/profile path.
2. Calls a prepare RPC.
3. Computes a digest and uploads without upsert.
4. Calls a completion RPC with the server-generated content metadata.
5. Performs cleanup on reported failures.

That is a real private-custody mechanism, not simulated UI. Its inputs are deliberately redacted replay/debug content, however, so it is not an unchanged-original document upload pipeline.

`supabase/migrations/20260718022535_eve_retention_replay_tracer.sql` supplies:

- Bucket/path, size/hash, status and timestamp constraints (`35–69`).
- Private bucket declaration, browser table privilege revokes, service CRUD and a supplied-role/profile/tenant helper (`120–155`).
- Prepare checking actor, optional run owner, allowed category and exact path, then inserting artifact/lifecycle facts (`157–213`).
- Completion checking the actor, then changing an owner/tenant `upload_pending` row to `available`, setting `uploaded_at = NOW()` and appending a lifecycle event (`217–247`).
- Service-only execution of prepare/complete (`549–560`).

The inspected completion command does not carry a native request/requirement/recipient revision, source permission epoch, exact pending correction target, request definition/target revision, intake cutoff or semantic retry identity. Its expiry derives from replay retention, not recipient submission authority. Missing those native checks is an **integration gap if transplanted**, not proof that this specialized admin artifact is incorrectly governed.

Scoped migration search found the prepare/complete definitions in this migration; no later redefinition surfaced in that search. No deployed function, role, bucket or grant was queried.

### 4. Ambiguous completion must not become destructive cleanup

`retention/control.ts:125–152` removes the stored object after any returned completion error, then deletes metadata only while `upload_pending`. The code does not first distinguish an explicitly rejected transaction from a committed completion whose response was lost.

This is a concrete unsafe pattern to copy into native admission: if a completion committed but transport delivered an error, deleting its bytes could contradict durable received state. The bounded source review identifies that possible failure path; it does **not** claim a reproduced production incident, observed lost response or tested database/provider outcome.

The two nearby tests at `tests/unit/packages/api/eve-retention-control.test.ts:198–278` use an explicit mocked **check-constraint failure**. They verify cleanup ordering/preservation when cleanup fails; they do not exercise committed-but-response-lost or establish safe unknown-outcome recovery.

For native intake, reconcile the stable admission identity and exact object before discarding anything or retrying as a new submission. Cleanup needs its own current disposition/claim, cannot remove promoted/received bytes, and cannot treat a browser close as cancellation.

### 5. Other “admission” and upload APIs have different meaning

`packages/api/src/generated-documents/purpose-catalog/admission.ts:14–18,37–66` explicitly allocates **nothing**. It is a fail-closed purpose-availability front door for a future generated-document service, with an application-time result stamp. It is not a durable recipient receipt or transaction boundary.

`packages/lib/cloudinary-client.ts:24–68` gets a signature, uploads directly and returns provider JSON. `packages/lib/assets.ts:13–37` writes the returned metadata with a browser database client. The legacy editor directly uploads then returns a public URL (`packages/ui/components/shadcn/rich-text-editor/legacy-rich-text-editor.tsx:43–62`). None establishes native source admission, exact requirement scope, current deadline policy or a private received outcome.

`packages/api/src/workflows/adapters/inbound-email.ts:410–426` falls back from missing provider received time to processing-time now for conversation routing. That fallback cannot be copied into native submission timeliness: unknown receipt evidence is not a new authoritative receipt.

These observations do not imply all legacy paths are reachable in production or share the same audience; they establish why a transport return value or nearby field named “admitted/received/uploaded” is insufficient.

## Permanent source contract needed

### Target, permission and receipt remain separate

Q09 makes the **ordinary requested target nonblocking by itself**. The source's current action predicate still includes exact tenant/environment, principal/recipient revision, request/requirement, permitted submission or correction, expected source/member revision, stronger hard cutoff, finite authority and relevant restrictions.

Do not implement A by removing every time check, treating an open task as a grant, or adding “late allowed” as a bypass around accepted/frozen/closed state. Missing optional requested-date data is different from unresolved authorization or a missing hard-boundary policy. A deliberately absent optional target need not manufacture lateness or block an otherwise authorized source operation; unknown required authority must still deny it.

A source may close intake before or after the target under its own qualified policy. Q06 fulfillment and Q08 fresh read authority never reopen it. Q09 selects no duration, mandatory date, grace interval, reminder or new exception queue.

### Preserve immutable receipt and its timing evidence

The authoritative received act is the source's durable admission of the finalized exact original and its occurrence under current permission, consistent with Q03. File selection, transfer start, provider upload completion alone, successful scan, preview readiness and staff acceptance are separate facts.

Record enough exact source/revision evidence to explain which target applied and when admission occurred. Do not evaluate a historic receipt against whichever target happens to be current today and silently rewrite its original timeliness. A separately authorized source correction/amendment may affect a current projection under explicit policy, while preserving what was originally recorded; Q09 does not choose retroactive date-edit semantics.

All required recipient material received on time must not become “recipient overdue” solely because scanning or staff review continues after the target. Source-qualified receipt does not mean safety clearance, evidence sufficiency or fulfilled request. If review identifies a new correction need, represent that current source action and its applicable timing without erasing the earlier on-time receipt.

A correction has its own exact receipt and timing. Its admission fences only the exact predecessor according to Q03, preserving unrelated current supporting files and prior decisions. A later correction must not retroactively make the original receipt late or transfer its safety/acceptance verdict.

### Source time, target interpretation and ordering

An authoritative timestamp is not a caller date, blob metadata, browser clock or arbitrary callback arrival. Capture/validate the source-admission occurrence at the winning current-authority transition, after relevant waits and state validation, and commit it with the exact effect. Preserve the same occurrence on retries.

PostgreSQL NOW/CURRENT_TIMESTAMP refer to transaction start; clock_timestamp advances with current wall time. A transaction may wait across a target or a hard authority end, so a transaction-start stamp is not automatically the admission instant or a fresh permission check. Qualify the actual source linearization/time boundary; do not prescribe one SQL function as a universal cure. No hosted PostgreSQL version was queried. [PostgreSQL date/time semantics](https://www.postgresql.org/docs/current/functions-datetime.html)

Date-only and offset-less date-time parsing also differ in JavaScript: standard date-only forms imply UTC, while date-time forms without an offset use local time. That matters to the observed task representations, but their behavior cannot decide the native policy. [MDN Date.parse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse)

The native source must explicitly qualify its target interpretation, zone where relevant, precision, equality boundary and invalid/unknown handling before projecting timeliness. Q09's permission choice does not itself choose local end-of-day, UTC midnight, a calendar, an elapsed interval or a new numeric tolerance.

For a soft target crossing during an otherwise valid transfer, source admission remains allowed and its receipt truth determines the applicable timing. If an independent **hard** access/intake boundary or revocation wins before admission, late permission does not rescue the unadmitted attempt. If admission already committed and only its response is delayed, the original fact survives and is recovered under current disclosure authority.

### Concurrent source effects must order correctly

Admission/correction must serialize against source completion, acceptance/freeze, definition/recipient changes, a real cutoff/authority change, another correction, and cancellation/disposition. A request-wide open flag or pending status alone cannot detect a changed exact member/review set.

When admission wins, its required receipt, exact relation/review-set change and required history/effect intent agree durably; later processing does not manufacture another receipt. When an incompatible source transition wins, reject or reconcile the stale operation without admitting it to another item, silently restoring the predecessor or deleting retained evidence.

A due-target crossing alone is **not** such an authorization change under A. Do not make a background overdue job change the source to intake-closed. Jobs and browser presentation can lag without weakening current hard restrictions or rewriting timeliness.

Semantic retries recover one admitted outcome; same intent with different bytes, target, recipient, request revision or payload conflicts. Preserve exact admitted effect identity across different transport attempts. Private replay JSON, filenames, counts and receipt history still require current disclosure permission.

### SQL and service paths need actual proof

`packages/database/supabase/admin.ts:15–46` creates a service-key client. `packages/api/src/shared/with-operation.ts:128–167` authenticates/role-gates then supplies it to the handler. This is useful shared plumbing, not the native recipient action predicate.

The native authority boundary needs same-scope request/recipient/member/byte/policy references, unique semantic effects, required receipt/provenance and permitted old/new state constraints. Independent UUID FKs do not establish all same-request/tenant relationships. Do not trust actor, tenant, “received_at,” due-policy kind, lateness verdict, original ID, classification, readiness or acceptance supplied by the browser.

Evaluate effective grants, column privileges, composed policies, views/RPCs, actual service/definer roles and storage paths. Omitted WITH CHECK may inherit USING for UPDATE/ALL; its absence alone is not a bypass. Definer RLS behavior depends on owner/table ownership/FORCE/BYPASSRLS, not the keyword alone. Current source-only inspection does not establish deployed role safety. Existing official semantics are documented in [PostgreSQL CREATE POLICY](https://www.postgresql.org/docs/current/sql-createpolicy.html) and [row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html).

No broad migration of unrelated task/provider policies is authorized by this choice. Qualify the smallest source-owned native seam.

## Risk assessment and exact amendments

Severity is prospective consequence if the new lane is implemented with the omission; likelihood is qualitative, not incident frequency. Source-confirmed adjacent patterns and hypothetical native consequences are distinguished above.

| Risk                                                              | Severity / likelihood                                        | Required amendment                                                                                                                               |
| ----------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| “Late allowed” becomes indefinite or unrestricted intake          | High / plausible                                             | Target crossing alone does not deny, but every other current source boundary remains enforced; unknown required policy fails closed.             |
| Task overdue flag closes source intake or access                  | High / likely under naive reuse                              | Tasks Hub/UI project source state; they cannot mutate native authority or fulfill the request.                                                   |
| Staff review delay makes an on-time recipient late                | High product-integrity impact / plausible                    | Recipient outstanding work and immutable receipt timing are distinct from scan/review/fulfillment.                                               |
| Processing callback retimestamps a received file                  | High / plausible                                             | One trusted source-admission occurrence and exact effect; later stages retain independent timestamps.                                            |
| Old target edits rewrite historical lateness                      | Medium–high / plausible                                      | Bind original target/revision evidence; preserve historical fact and govern later correction explicitly.                                         |
| Browser timezone/date-only parsing changes outcome                | Medium–high / observed inconsistent adjacent representations | One qualified source temporal interpretation; localization cannot change authority or historical facts.                                          |
| NOW before lock wait backdates receipt/permission                 | High / plausible reuse hazard                                | Qualify trusted occurrence/current checks after relevant waits; no universal SQL-function shortcut or invented grace.                            |
| Transfer began before hard expiry so finalization bypasses it     | High / plausible                                             | Start is not receipt; fresh source check at final admission, while an already committed fact is recovered rather than re-created.                |
| Failed finalization response triggers deletion of admitted bytes  | High / concrete adjacent cleanup path                        | Distinguish definite rejection from unknown success; reconcile exact state before cleanup or resubmission.                                       |
| Two corrections or review race advances wrong target              | High / plausible                                             | Exact item/member/review-set revision ordering and Q03 predecessor fence; siblings and independent uses preserved.                               |
| Late correction rewrites original receipt or inherits clearance   | High / plausible                                             | New immutable occurrence with independent timing and processing; no original-history rewrite or verdict transfer.                                |
| Stale response/empty-error view invites duplicate submission      | Medium–high / existing prevention pattern available          | Fence stale results; preserve durable receipt and explicit unknown/error states; recover same operation.                                         |
| Hidden timers/reminders create a new policy                       | Medium / likely under task-form reuse                        | No inherited one-hour reminder, business-day default, grace window, cadence or auto-closure from this choice.                                    |
| Replayed metadata leaks after authority end                       | High / plausible                                             | Internal result recovery and current recipient disclosure are independently gated.                                                               |
| Counts reveal protected missing work or falsely signal completion | High / plausible                                             | Filter current source projection before counts/pages; files, receipts, actionable obligations and fulfilled requirements are different measures. |

## Existing test inspection and parent's bounded verification

The parent reports **6 tests passed, 2 files, no name filters, Vitest 5.0.3, 2.09 seconds**, using the repository's Node-backed `bunx --no-install vitest` command in WSL with Node 24.21.0. An initial direct Bun execution failed during JSDOM worker setup and executed zero tests; using the existing Node-backed command resolved that execution mismatch without changes. These are **existing adjacent tests**, not tests of a proposed Q09 implementation. Do not add their numbers to historical passes or claim native admission proof.

### Executed by parent: six response-order/error cases

The two complete files contain these cases:

- `tests/unit/packages/lib/use-tasks-request-order.test.tsx`
  - `keeps the post-save refresh after auth bootstrap starts the initial fetch` (`:50–82`)
  - `keeps the newest refresh result when an older empty response arrives last` (`:89–124`)
  - `ignores an older failure while the newest refresh is pending` (`:126–154`)
  - `preserves the newest error when an older success arrives afterward` (`:156–185`)
- `tests/unit/packages/lib/use-tasks-fetch-lifecycle.test.tsx`
  - `clears loading and exposes a network rejection through the non-throwing result boundary` (`:15–25`)
  - `clears loading for HTTP failures and preserves their readable error` (`:26–39`)

They render the existing hook in JSDOM with mocked authentication/fetch. The passing run verifies that bounded stale-result/error-handling behavior relevant to received-versus-empty/current states. It does not prove native permission, timeliness, browser/AT accessibility, real cache behavior, source transitions or tenant-switch safety.

### Optional only if the parent needs the specific cleanup precedent

File `tests/unit/packages/api/eve-retention-control.test.ts`, pattern:

```text
keeps pending metadata when completion and Storage cleanup both fail|removes pending metadata only after failed completion cleanup succeeds
```

Two cases at `:198–278` use mocked definite constraint rejection and cleanup outcomes. A pass would demonstrate current orchestration only. It **would not** resolve the unknown-commit/delete concern; do not run them merely to make a broader safety claim.

### Inspected but not recommended as new Q09 proof

- `tests/unit/packages/missionary/task-form-model.test.ts:10–100`: three form mapping/default cases. No deadline enforcement or timezone-crossing proof.
- `tests/unit/apps/admin/app/tasks/task-form-model.test.ts:34–140`: includes the unrelated one-hour reminder default. No native policy.
- `tests/unit/packages/api/missionary-portal/auth-ownership.test.ts:27–124`: four mocked ownership lookup cases. No native request-only actor or real RLS.
- `tests/unit/packages/api/workflows/work-claims-recovery.test.ts:43–99,164–273`: mocked work lease/recovery; `:275–302` uses migration source-string assertions, not concurrent SQL execution.
- Q03 correction/service tests and Q07 precise timestamp tests are already historical evidence. Repeating them without a new concern would not qualify the new decision.

For any additional optional execution, prefer the previously established cleared environment, dummy loopback values, masked `.env.local`, read-only filesystem, tmpfs test artifacts and disabled network. Those isolation details are not independently asserted for the parent's reported command. No new tests, installs or global live fixtures are required for this research.

## Required later proof for the native lane

1. Ordinary target crosses while all other source predicates remain valid: intake still admits; a real independent hard cutoff/expiry/revocation denies at its authoritative boundary.
2. On-time durable receipt with slow scanning/review remains on-time receipt; open staff work alone does not make recipient overdue. Missing/partial/correction work reflects the source's actual current action.
3. Selection/start/provider transfer/receipt/processing/acceptance/fulfillment are separately truthful, including quarantine, wrong-type or invalid evidence and later requested correction.
4. Exact target revision and qualified time/zone/precision produce consistent before/at/after results; invalid/missing optional target and unknown required policy are distinguished.
5. Correction/acceptance/completion/recipient/target/authority/disposition races have one rightful source ordering; no unrelated supporting file is superseded.
6. Same-operation retries, conflicting payload, lost response after commit and late callbacks preserve exact receipt/history; no cleanup deletes a committed winner or replays private metadata after authority ends.
7. Real user/recipient/service/RPC/storage/column/RLS behavior denies forged tenant, principal, target, timestamp, lateness, readiness and old-to-new state transforms.
8. Safe current projections/counts/page caches and actual recipient/staff UI distinguish outstanding overdue work, received pending checks/review, needed correction, unknown verification and completed/read-only status.
9. Generic task date/status edits, worker lease expiry, due reminders and fresh Q08 read grants cannot reopen intake, extend authority or change native historical receipt.
10. Source event/audit/effect intent, recovery/restore and mixed-version rollout preserve exact receipt and hard adverse state; no notification or new queue is introduced as an accidental consequence.

No native feature proof is claimed. The safe permanent path is a source-owned admission and timeliness projection using existing identity/custody/task/communication owners, with explicit current authority and immutable received facts.
