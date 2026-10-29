# Phase29 Q09 research — requested due date versus intake and access end

Read-only research, 20 October 2026. Core checkout `/home/conrad/code/core`, HEAD `3d85897ebf1515008ef5c676b1c58a15422fb9ab`. Parent reports Q08 and its complete amendments ratified. No Q09 option, new duration, anchor or field semantics are selected by this research.

Source, migration, user coverage map and owner contracts only. No tests were needed or run; no product/schema/provider/auth/dependency changes, credentials, private rows or file bytes. Only this research note was written.

## Recommended next single decision

The next useful question is **what passing an ordinary requested due date does to otherwise authorized, still-pending intake**:

> A recipient misses the requested date, but the document request is still open and their current permission remains valid. Should they still be able to send the missing or corrected file, marked late, or should that date stop ordinary submission?

Recommend **A — The ordinary requested date is a target: allow currently authorized late submission/correction and show it is overdue.** Preserve every explicit hard source cutoff, expired/revoked authority, accepted/frozen item and completed request.

The strongest alternative is **B — The requested date is a hard intake cutoff: stop ordinary submission/correction when it passes**, while any independently valid read permission keeps its existing source-defined scope/end. Help is available only through the qualified source lane; this choice does not promise reopening.

This is narrower than asking for the entire active-request lifetime now. It first determines whether “due” is an expectation or an action boundary. That meaning materially affects the later access-duration, deadline-edit, missing-work and reminder decisions.

It is a product recommendation, not a conclusion forced by existing task fields or measured ministry behavior.

## Why this is not already settled

The user's coverage map names a practical request with a due date, exact revision, reviewer and permitted submissions; it also separately calls for expiry, revocation and recovery (`Pasted text.txt:219–231`). It does not say that the due date is necessarily a permission expiry or that all late input must be accepted.

Q03 preserves source-owned deadlines, closure and current authority (`docs/features/files-documents/docs/adr/0003-recipient-corrections-and-exact-review-lineage.md:44–51`). That tells the implementation to obey an actual source rule; it does not choose the ordinary native rule or equate every due-date field with a hard cutoff.

Q06 makes normal fulfillment an exact source outcome and separately requires a finite protected-access policy (`0006-bounded-completed-request-access.md:22–45`). A date passing is not normal fulfillment, evidence acceptance or automatic completion.

Q07 governs the completed read phase after that outcome. Q08 permits an explicitly qualified fresh **read-only** authority after ordinary expiry. Neither chooses late intake or permits staff to use fresh reading access as a way to reopen submission.

The Workflow Studio owner explicitly leaves late acceptance to the source:

- `docs/prds/workflow-studio/03-runtime-and-recovery.md:55–59` separates a wait's due time and reconciliation deadline from source evidence; late-submission acceptance is a source policy, with source acceptance and timeout consequences ordered correctly.
- `contracts/requirements.json:145–156` requires external task-purpose access to be expiring and revocable and participant views to remain source-authorized.
- Thus finite access is already an owner constraint. A numeric default, anchor and equation between access end and requested date are not.

## Actual runtime and schema evidence

| Inspected mechanism                | Exact source                                                               | What it establishes                                                                                                                         | What it does not establish                                                                                                                      |
| ---------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Missionary task due field          | `packages/api/src/missionary-portal/tasks.ts:30–40,81–98`                  | Optional nullable date-time is accepted and persisted with a task.                                                                          | Native document grant expiry, hard late-intake policy or deadline/permission equivalence.                                                       |
| Task date/status mutation          | `packages/api/src/missionary-portal/task.ts:25–58,81–97`                   | Due date can be updated independently; status changes set/clear a mutable completion timestamp.                                             | Immutable source completion or permission to alter a request's authoritative deadline through generic task PATCH.                               |
| Task list/detail                   | `packages/api/src/missionary-portal/service.ts:252–275,295–312`            | Reads are scoped to missionary/task and do not exclude rows whose due date passed.                                                          | A private-recipient read-through-expiry entitlement. This is a different source and actor model.                                                |
| Overdue presentation               | `apps/missionary/app/tasks/page-client.tsx:793–821`                        | Client filters distinguish active/completed/overdue/today; “overdue” checks past date excluding today and completed/deferred tasks.         | A trusted exact server cutoff, time-zone contract or native intake denial. Browser-local filtering must not decide source permission.           |
| Original missionary task schema    | `supabase/migrations/20250101000000_init_schema.sql:286–300`               | Stores nullable TIMESTAMPTZ due/completed fields as task data.                                                                              | Meaning or enforcement of a new document request's dates. No claim is made that this historical migration alone is the effective hosted schema. |
| Shared Mission Control task schema | `supabase/migrations/20260526193000_mission_control_tasks.sql:14–36,59–65` | Due timestamp, task completion and reminder time are separate stored facts.                                                                 | Source admission, grant lifetime or permission to close a business request when a shared task becomes overdue.                                  |
| Workflow deadline contract         | `docs/prds/workflow-studio/contracts/workflow.schema.json:713–730`         | Intended workflow schema distinguishes business-day, elapsed-hour and local-day units.                                                      | A default native date rule or runtime-qualified implementation. Its numeric range is not a proposed file-request lifetime.                      |
| Document request recipe            | `contracts/recipe-catalog.json:495–523`                                    | GEN-06 distinguishes request/upload/scan/reviewer/acceptance, is disabled by default and explicitly marks exact source bindings unresolved. | The generic recipe's suggested business-day/reminder values cannot select native due-date, expiry or late-submission policy.                    |

No reached source path in this bounded inspection establishes a qualified native document request where due-date crossing changes intake or read permissions. The current task behavior is useful experience precedent and a migration input, not the product answer.

## Tasks Hub must remain a projection

`docs/adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:24–30,39–48,71–90` requires source-owned applicability and actions. Shared task closure cannot independently complete/reopen a source-backed request.

The same ADR identifies the current generic task and contribution-oriented controls as migration inputs rather than the new source-work contract (`:597–607`). Its broader source registration requirement is at `:645–649`.

Therefore:

- A recipient-facing “overdue” label or a staff Tasks Hub due date cannot change intake or grant state on its own.
- Changing a generic task date must not secretly extend the native source's authority.
- A deadline job or overdue query can project a source fact but is not the sole enforcement point.
- A source may finish the request after recipient access ends under independent authority, without restoring that recipient's reading or submission.

## Options and practical tradeoffs

### A — Ordinary requested date is a target, with authorized late intake

After the requested date passes, the still-open requirement can receive an otherwise eligible missing file or correction under current source authority. The source truthfully records receipt timing and presents lateness/overdue status as appropriate.

Why prefer this ordinary default:

- The useful outcome is receiving relevant evidence. A missed target alone need not introduce an extra staff permission-change step before an eligible person can supply it.
- It keeps expected turnaround separate from purpose/access expiry, review acceptance and fulfillment.
- Explicit hard source deadlines remain possible where the source actually requires them; this ordinary rule cannot weaken those contracts.

Costs and limits:

- An “overdue” item remains actionable, so wording must make that clear; a label such as “Uploads closed” would be false.
- Staff may receive late input while preparing review. Q03's exact correction/current-review-set fences remain mandatory; the due target is not a reviewer lock.
- This does not permit indefinite access. An independently expired grant, hard intake end, accepted/frozen requirement, completed request or current veto still denies the affected action.
- No grace-period number, reminder cadence, automatic escalation, due-date edit or late-exception workflow follows.

This rationale is a product judgment. No recipient-return distribution, late-submission volume, staffing availability or specific ministry scenario was measured.

### B — Requested date is a hard intake cutoff

At the exact source-defined cutoff, ordinary admission of new or corrected submissions stops. Current read actions may remain available only under their already-defined permission; the date does not manufacture a new read phase.

Benefits:

- A clear “send by” date has an enforceable consequence.
- The source can know when the ordinary review set stops changing through recipient self-service, subject to separately governed actions.
- It fits sources that genuinely require a fixed intake boundary.

Costs and limits:

- A recipient who misses the date cannot simply finish the task. A permitted staff/source response may be needed, and reopening may not be allowed.
- Starting an upload before the cutoff is not durable admission. The exact source must handle finalization/retry boundaries truthfully under Q03; no blanket grace follows.
- Date-only input, time zone, equality-at-cutoff and daylight-saving interpretation become consequential policy facts. They need explicit resolution before activation.
- A scan finishing later does not make a received-on-time submission late. Source admission, processing and business acceptance remain distinct.

The policy must not mark the request fulfilled/accepted merely because intake stopped. “Closed to submissions” and “completed” have different meanings.

## Why not make “due ends all access” the main alternative?

That combines two questions: whether further evidence may be admitted, and whether the recipient may read their existing authorized materials/status/history.

The existing decisions already require those actions and clocks to be independently governed. A source can deliberately assign the same instant to a hard intake end and an access end when its actual policy warrants that. But a generic due-date field should not silently become both.

For a clean founder choice, compare target versus hard intake cutoff while holding current read permission constant. If an earlier independent access cap coincides with or precedes the due date, it still controls both options; do not extend it so the chosen due-date policy appears more useful.

Likewise, hard intake cutoff plus readback is **not** a new post-completion grant. The source has not necessarily completed. Reads continue only if the existing active-stage policy admits them; Q07 does not begin from deadline crossing.

## Engineering boundaries whichever option is selected

These clarify the choice without selecting a schema, duration or clock anchor:

1. **Name the actual fact.** A target/requested date, enforced intake end, recipient source-access end, review target and completion event must not be conflated. They may share an instant only through explicit source policy.
2. **Bind the applicable scope.** The source must say whether a date governs one requirement, a particular request revision or some other exact scope. This question does not invent per-file/date columns or force one request-wide deadline.
3. **Do not let task UI decide it.** Client isPast/isToday, sorting, a cron job or worker lease cannot be the authoritative action check.
4. **Preserve source receipt.** Under Q03, durable finalized-byte admission is different from selection/transfer start and from later checking/acceptance. A lost response replays the same received outcome; it does not create another submission or a different lateness result.
5. **Current restrictions still win.** Even option A denies ungranted intake after grant expiry, revocation, source closure, acceptance/freeze or a binding hard source cutoff.
6. **Separate fulfillment.** Neither overdue nor intake-closed means accepted or completed. Q06/Q07 begin only at the exact normal source-fulfillment event.
7. **No silent editing policy.** Changing a target or a hard cutoff is an independently authorized source operation. It cannot revive ended permission, erase original timing evidence or reopen completed intake through generic task edits.
8. **No new communication.** Due/overdue meaning does not select reminders, warning emails, grace notices or a new staff task. Existing communication/task owners apply only after explicit selection.

The actual temporal interpretation can be resolved after the meaning is chosen: absolute instant versus source-local date, display precision and trusted admission boundary. No number or date arithmetic default is imported here.

## Sequencing recommendation

This fork is worth resolving **before choosing active-request duration or detailed fresh-access settings**. A “30 days from request creation” proposal is incomplete if the source's due date, admission cutoff and later review stage are still ambiguous.

Recommended progression:

1. Choose the ordinary requested-date behavior: target with authorized late intake, or hard intake cutoff.
2. Resolve the **initial active-stage source-access policy**, including its anchor/end and its relationship to pending review and any declared intake cutoff. It must preserve current purpose-based authority and the finite external-access owner contract.
3. Resolve allowed date changes and late-intake exceptions only where the chosen behavior creates a genuine need.
4. Then finish Q08's fresh read timing/anchor/repetition policy, using the completed and active authority contracts rather than another generic TTL.

This is not a prescribed questionnaire. If parent source-owner research finds the ordinary native due semantics already explicitly ratified elsewhere, honor that owner rather than re-asking.

## Alternative next question if “due” remains too source-specific

The next defensible alternative is the **fresh-access anchor** left open by Q08: does a finite fresh period begin at its authoritative issuance, or at a separately bounded first qualified use? The latter requires an independent unused-admission limit; neither permits an unbounded “activate whenever” promise.

That alternative is coherent but should not quietly supply a fresh duration/count or backfill the active-request policy. Current code does not decide which anchor is right. Prefer resolving ordinary intake semantics first because that exposes whether there is a usable source journey to renew later.

## Evidence limits

No native request deadline or active-access feature was exercised; no existing tests were rerun merely to support the next question. Current schema/source, intended Workflow contracts and selected Phase29 decisions are separate evidence layers. No actual tenant time-zone, provider behavior, live policy or user research was inspected.

The recommendation is one bounded founder-level choice. It does not adopt soft dates, hard cutoffs, a lifetime, an expiry anchor, reminders or reopening before Conrad answers.
