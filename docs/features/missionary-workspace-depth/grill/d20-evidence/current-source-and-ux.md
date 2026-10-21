# D20 — Current task coverage, concurrency seams and grouped follow-up UX

Research only, 16 October 2026. The founder selected: **one current follow-up;
one task clearly lists both eligible gifts; Maya handles the reviewed group once,
while each gift retains its own record and evidence.** This is a task-coverage
decision, not just visual collapse of otherwise independent tasks. It neither
defines special-gift financial eligibility nor authorizes communication.

The parent review's proposed concurrency interpretation is used explicitly here:
completion applies to the exact reviewed gift set. An unrelated new eligible
gift may arrive without invalidating that completion and remains actionable in
one current follow-up. A material change or ineligibility of any reviewed gift
rejects the command for refresh/review; it must not silently produce a mixed
handled/withdrawn result. These are proposed safeguards for review, not observed
implementation or additional exact words attributed to the founder.

## Scope, source authority and limits

Read the applicable root/API/missionary/database/UI/Supabase instructions in this
session and reused the repository Supabase skill. This pass inspected the actual
missionary task type, row, list/board handlers, dialog, hook and API; shared staff
task links/grouping/store; prototype admin task collection; contribution preview,
selection snapshot and revision checks; product work claims and a concrete SQL
expected-version transition. It reuses the bounded gift/recognition/Stripe/
workflow/migration census in [D19 current source](/workspace/core/docs/features/missionary-workspace-depth/grill/d19-evidence/current-source-and-ux.md:9)
instead of claiming a new end-to-end or hosted inspection.

**Controlling completion distinction:** the ratified [D19 C07](/workspace/core/docs/features/missionary-workspace-depth/grill/phase28-d19-first-support-follow-up-adversarial-review.md:209)
uses the existing **Independent follow-up task** contract. [ADR-0183](/workspace/core/docs/adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:622)
expressly permits authorized human completion without closing the linked source.
Its source-controlled Website/finance correction closure is a different closed
contract. Any preliminary D19 evidence language implying that all gift-triggered
tasks must wait for source-controlled closure is superseded by that ratified
distinction. D20 must not reintroduce that mistake.

[D19 honest completion/Undo](/workspace/core/docs/features/missionary-workspace-depth/grill/phase28-d19-first-support-follow-up-adversarial-review.md:275)
separates Mark done, Not needed, optional P9 interaction recording and conditional
correction of the latest disposition. [D19 admission/materialization](/workspace/core/docs/features/missionary-workspace-depth/grill/phase28-d19-first-support-follow-up-adversarial-review.md:225)
requires durable purpose claim and projection intent; source admission and
asynchronous task materialization are not presumed to share a cross-service
transaction. Grouping does not erase those independent authorities.

No application/schema/dependency/formal-owner edits, new agents, hosted queries,
sends or runtime probes were performed. This is a bounded static trace. Searches
did not locate a qualified D20 membership/reviewed-set completion command in the
inspected paths; that is not a whole-repository, all-branches or deployed-state
absence claim. Only this evidence file is changed.

## Current task behavior and the precise missing contract

| Inspected source                                                                                                                                                 | Actual behavior                                                                                                                                                                                                     | D20 consequence                                                                                                                                                                                                                             |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Missionary Task type](/workspace/core/packages/missionary/types/index.ts:112)                                                                                   | One task ID, missionary/profile ID, optional donor, title/description/notes, status, dates, generated flag/source text.                                                                                             | No typed canonical ministry/project subject, admitted gift membership, member revisions, reviewed-set identity or per-gift disposition coverage in this shape. A text source label is not that contract.                                    |
| [Task row content](/workspace/core/packages/missionary/components/task-row.tsx:205)                                                                              | Title, priority, Auto badge and two-line description; [partner link](/workspace/core/packages/missionary/components/task-row.tsx:250) opens donor detail.                                                           | No reviewable list of gift references or safe explanation of which gifts completion covers. Appending gift names/amounts to a description would be mutable copied prose, not exact source membership.                                       |
| [Task row actions](/workspace/core/packages/missionary/components/task-row.tsx:311), [checkbox](/workspace/core/packages/missionary/components/task-row.tsx:400) | Generic Edit, Mark Complete/Reopen, Delete and a checkbox. [Mounted page handler](/workspace/core/apps/missionary/app/tasks/page-client.tsx:842) directly calls complete/reopen; Edit opens TaskDialog.             | The mounted action does not bind a reviewed set. Reusing the checkbox unchanged could mark whichever group happens to exist at execution time, or supply no gift coverage at all. This is a future reuse hazard, not existing D20 behavior. |
| [Hook completion](/workspace/core/packages/lib/hooks/use-tasks.ts:466)                                                                                           | PATCHes only `{status: completed}` and on acknowledgment updates client status/completion timestamp. Reopen PATCHes `not_started`.                                                                                  | No expected task/disposition revision, member set, command ID or returned per-member receipt. It cannot distinguish “reviewed gifts handled, new gift remains” from whole-task completion.                                                  |
| [API update schema](/workspace/core/packages/api/src/missionary-portal/task.ts:25) and [writer](/workspace/core/packages/api/src/missionary-portal/task.ts:67)   | Strict generic task fields; server sets `completed_at` from status; updates by ID/profile then rereads.                                                                                                             | Neither reviewed membership nor expected-head CAS is present. Two requests can express different human intentions using the same status payload. This observation does not prove a hosted race or authorization exploit.                    |
| [API creation](/workspace/core/packages/api/src/missionary-portal/tasks.ts:30)                                                                                   | Manual input and `is_auto_generated: false` on [insert](/workspace/core/packages/api/src/missionary-portal/tasks.ts:81).                                                                                            | Not a qualified special-gift admission or grouping producer. D20 cannot rely on task title/type for membership.                                                                                                                             |
| [Mounted dialog writer](/workspace/core/packages/missionary/components/task-dialog.tsx:167)                                                                      | Browser Supabase directly writes the table and returns its donor join; [payload](/workspace/core/packages/missionary/components/task-form-model.ts:81) always supplies `is_auto_generated: false`, including edits. | Existing alternate writer must be fenced/replaced through owner commands for the new immutable contract. Do not allow an edit to erase group provenance or relabel generated work manual.                                                   |
| [Later table posture](/workspace/core/supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:261)                                             | Explicit browser-role revocation for missionary_tasks; D19 traces the earlier/later migration distinction.                                                                                                          | The direct dialog writer is an unqualified compatibility conflict. The revocation means code presence alone does not prove a working bypass; hosted effective grants/policies are unverified.                                               |
| [Generic deletion](/workspace/core/packages/api/src/missionary-portal/task.ts:102)                                                                               | Physical DELETE by task/profile, no coverage correction/receipt.                                                                                                                                                    | A grouped disposition needs retained history and source references. It must not be implemented by deleting all currently linked gifts/tasks or recreating them on Undo.                                                                     |

The existing [standalone task query](/workspace/core/packages/api/src/missionary-portal/service.ts:252)
has no explicit pagination, while the [dashboard snapshot](/workspace/core/packages/api/src/missionary-portal/service.ts:194)
caps loaded tasks and donations. Neither proves complete authorized membership
for a reviewed group. The task hook's [request sequence](/workspace/core/packages/lib/hooks/use-tasks.ts:157)
helps suppress older fetches but is not a current tenant/subject/permission
generation or immutable review boundary. Its [optimistic board move](/workspace/core/packages/lib/hooks/use-tasks.ts:374)
changes status and restores an old whole-array snapshot on error; do not use that
rollback to overwrite concurrent member arrivals or a successful covered outcome.

## Shared-task links and apparent reuse that is only presentation

The current [Mission Control link type](/workspace/core/packages/api/src/admin/mission-control-tasks/types.ts:30)
admits donor/contribution/staged gift/audit/notification/batch/provider references.
The [SQL links](/workspace/core/supabase/migrations/20260526193000_mission_control_tasks.sql:39)
have task/tenant/record IDs and generic relationship/metadata, but no admitted
member revision, qualifying special-gift purpose, handled coverage or reviewed
snapshot constraint. This is a useful structural seam, not proof that arbitrary
metadata is the new P9 membership contract. A source reference need not disclose
its body or grant access.

[Shared task creation](/workspace/core/packages/api/src/admin/mission-control-tasks/service.ts:62)
inserts a task, links and event separately. [The current adapter](/workspace/core/packages/api/src/admin/mission-control-tasks/store.ts:47)
uses Finance Operations and contribution exception meanings. It does not create
the selected native personal follow-up contract atomically or resolve its
responsibility. [Needs Attention grouping](/workspace/core/packages/api/src/admin/mission-control-tasks/read-model.ts:95)
groups **urgency + issue type** in memory; it preserves items for display and
does not grant one disposition over their source facts. Reusing it as D20's
coverage algorithm would confuse visual grouping with one current deliverable.

The separate admin Tasks UI is not the implemented shared P9 owner either:
[its schema](/workspace/core/packages/database/collections/admin-workspace.ts:70)
has one optional linked entity; [its collection](/workspace/core/packages/database/collections/admin-workspace.ts:805)
reads and mutates the module's `adminTaskRows` array. TanStack transaction-shaped
callbacks in that fixture do not establish server transactions, durable receipts
or source-level grouping. ADR-0183 [explicitly names these current models as migration inputs](/workspace/core/docs/adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:651).

**Required direction:** add the exact covered-gift membership and disposition
command to the owning shared independent-task contract. Use one task engine and
ordinary task history; do not create a parallel gift-handling ledger or borrow
financial correction closure because a contribution ID is linked.

## Existing snapshot/CAS/claim mechanics: useful lessons, bounded reuse

| Pattern inspected                                                                                                                                                                                     | Useful mechanism                                                                                     | What must not be borrowed as D20 policy or proof                                                                                                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Contribution selection hash](/workspace/core/packages/api/src/admin/contribution-batches/route.ts:100) and [preview match](/workspace/core/packages/api/src/admin/contribution-batches/route.ts:118) | Binds action plus selected IDs/payload, verifies count/hash equality.                                | This checks agreement between supplied preview and selection; it is not server-certified current gift membership/eligibility, authority or a substitute for per-member revisions. Hashing attacker-supplied values does not make them authoritative.     |
| [Persisted batch selection](/workspace/core/packages/api/src/admin/contribution-batches/route.ts:193)                                                                                                 | Persists the chosen records/preview and creates indexed item records.                                | Batch and items are separate requests in this path. The finance batch is a different product operation, not one atomic D20 completion. No threshold, reason requirement, confirmation token UX or background cutoff is adopted.                          |
| [Batch preview](/workspace/core/packages/api/src/admin/contribution-batches/preview.ts:104) and [chunk processing](/workspace/core/packages/api/src/admin/contribution-batches/process-batch.ts:630)  | Explicit affected/skipped records and recoverable bounded execution.                                 | Financial batch skip/per-item outcome behavior cannot silently become D20 completion: a materially changed reviewed gift requires rejection/refresh of the reviewed command, not quietly marking its siblings done.                                      |
| [Contribution expected-revision check](/workspace/core/packages/api/src/admin/contribution-operations/action-runtime.ts:430)                                                                          | Clear stale-detail recovery message and 409 when supplied revision differs.                          | This helper permits absent expectedRevision and skips mismatch checking without an exposed current revision. A prior read/check alone is not atomic commit-time CAS. D20's exact reviewed binding must be mandatory at its own authoritative command.    |
| [Concrete SQL expected-version transition](/workspace/core/supabase/migrations/20260718003127_eve_kill_switch_control.sql:117)                                                                        | Locks current state, compares required expected version, writes successor and audit in one function. | It is an Eve global-governance operation, not a task API or permission precedent. Do not reuse its global lock, actor model, authority or fail every D20 completion merely because an unrelated new group member arrived. It illustrates mechanics only. |
| [Product work claims](/workspace/core/packages/api/src/workflows/claims.ts:22) and [SQL](/workspace/core/supabase/migrations/20260611181000_workflow_work_claims.sql:26)                              | One active claim per tenant/source item, service-role RPC and TTL recovery for runners.              | Claims expire; they guard attempts, not permanent human-handled coverage. A runner lease cannot authorize a human disposition, certify its gift set or replace a durable command receipt.                                                                |
| [Dispatch idempotency](/workspace/core/packages/api/src/workflows/ledger.ts:117)                                                                                                                      | Reuses exact tenant/key handoff and supports asynchronous projection recovery.                       | D20 effect identity and immutable disposition result remain product truth. Handoff success or a replayed worker must never complete gifts arriving after the original review.                                                                            |

For D20, an aggregate group head may help presentation and routing, but a
mechanical equality check on an append-only membership head would conflict with
the proposed ability to finish reviewed A/B while new C arrives. The owning
command must instead distinguish benign out-of-set admission from a material
change to reviewed member revisions, task authority/purpose/responsibility,
previous dispositions or relevant source eligibility. This is not permission to
ignore every task-level revision conflict.

## Small complete UX using the current design system

Use existing [base-maia configuration](/workspace/core/packages/ui/components.json:3)
and shared [Sheet](/workspace/core/packages/ui/components/shadcn/sheet.tsx:41),
buttons, badges and status/error components. No report builder, new inbox,
per-gift tick-off ceremony or new component package is required by this choice.
The following copy is illustrative and must follow actual source outcomes.

```text
Follow up with Grace
Maya's ministry · 2 special gifts
[Review gifts]

Follow up with Grace
For Maya's ministry

Gifts covered by this follow-up
Oct 12 · [permitted amount and currency] · [View gift]
Oct 15 · [permitted amount and currency] · [View gift]

Marking done applies to the 2 gifts listed above.
It doesn't send a message or record a conversation.

[Mark done]     [Not needed]       [Record interaction…]
```

1. One current item identifies the supporter, exact permitted ministry and
   authorized gift count. Do not say **2 donations completed**, expose hidden
   totals, or sum different currencies. Optional individual money detail keeps
   its source currency; a combined headline is unnecessary.
2. Open a compact task sheet/detail listing the exact authorized reviewed set.
   Source references remain discoverable after handling under current rights.
   A date/amount alone is not a sufficient identity; distinguish same-day gifts
   with a permitted reference/description without leaking restricted metadata.
3. **Mark done** or **Not needed** applies to those listed gifts through the
   independent-task command. No message, contact attempt, reason essay or shared
   history entry is compulsory merely to clear task work. Optional Record
   interaction has its own P9 audience and distinct result.
4. Keep the reviewed set stable while the sheet is open. An unrelated new gift
   may appear as **Another gift arrived. It will remain for follow-up.** Offer
   **Review current gifts** if Maya deliberately wants to include it, rather
   than silently expanding the original command.
5. When A/B completes and C remains, say **Marked done for 2 gifts. 1 new gift
   remains.** Keep one current follow-up for the residue, with an ordinary next
   review action. Do not remove the row, show All caught up, then resurrect it
   as if the completion failed. Completed coverage remains distinct from current
   work even when shown in one task's history.
6. If A or B materially changes or loses eligibility, say **This follow-up
   changed. Review the current gifts before marking it done.** No member in the
   rejected reviewed command is newly handled. Explain only currently permitted
   changes; permission loss must not reveal which hidden gift existed.
7. Once all current reviewed work is handled, retain the ordinary task result
   and coverage history. A later gift is new permitted work; it must not be
   silently appended to a prior completed receipt or treated as already handled.

| Event/state                                    | Required honest presentation and behavior                                                                                                                                                                                                                                                          |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New C while reviewing A/B                      | A/B can finish if their relevant current facts/authority remain valid. C is not included by a filter, all-current-group UPDATE or replay.                                                                                                                                                          |
| A corrected/withdrawn while A/B review is open | Reject the reviewed disposition; refresh the set. Financial correction remains its own accepted event; the task command must not manufacture a mixed handled/withdrawn result.                                                                                                                     |
| Lost response after A/B accepted               | **We couldn't confirm the update** while recovering the original command receipt. A retry returns that exact A/B result and cannot finish C. Current authority still governs what can be shown.                                                                                                    |
| Duplicate click or two tabs                    | At most one accepted disposition over the same still-unhandled coverage; loser receives a truthful already-handled/conflict outcome, never a second interaction.                                                                                                                                   |
| New current work exists when Undo is requested | Do not blindly reopen old task/history or create a second current task. Recheck the latest human disposition and current membership/responsibility; apply a qualified correction only if safe, otherwise offer refresh with a clear explanation. No new merge/reopen policy is invented by the UI. |
| Access loss                                    | Clear protected detail and reject stale commands/responses; do not show stale member names/counts in error or history panels.                                                                                                                                                                      |
| Partial load/large authorized group            | State coverage honestly and provide bounded source paging. Never label loaded rows “all gifts.” The reviewed set must be definite and inspectable; do not make an invisible off-page set the action's scope.                                                                                       |
| Correction after actual communication          | Preserve the actual communication/interaction through its owner. Undo/Not needed cannot recall sending, undo a gift or delete that history.                                                                                                                                                        |

Mark done should not require a redundant confirmation dialog when the exact scope
is already clearly reviewed. Source changes may require refreshed review; that is
different from routine double confirmation. The design must support keyboard and
screen readers without pointer drag, appropriate focus return after disposition,
phone/320 CSS px reflow, zoom, long names and RTL. Announce new work without
silently moving focus or changing the action's scope. Keep recoverable outcomes
visible beyond a toast. Component reuse is not accessibility qualification.

## Eight concern dimensions and exact candidate safeguards

These are conditional future-implementation hazards, not accusations that an
unimplemented D20 flow currently fails in production.

| ID / dimension                 | Material concern; severity and conditional likelihood                                                                                         | Candidate requirement                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S20-C1 — Product meaning       | High; likely if visual grouping, receipt grouping or organization-first coverage substitutes for the selected personal task unit.             | The native shared-task contract SHALL bind one current compatible special-gift follow-up to its exact tenant/entity, canonical supporter, ministry/project, purpose and responsibility scope. Every covered gift SHALL retain its authoritative source identity/evidence. D19 first-support and other distinct purposes SHALL not be silently merged or consumed.            |
| S20-C2 — Integrity/concurrency | High; likely if `status=completed` clears an evolving group. New arrivals disappear, corrected gifts are certified or retries handle residue. | The command SHALL bind an immutable reviewed member set and relevant member revisions plus disposition intent/current task authority. It SHALL atomically validate every reviewed member and record exactly that coverage once. Unrelated later members SHALL remain unhandled; material reviewed changes SHALL reject the command without newly handling its other members. |
| S20-C3 — Security/privacy      | High; plausible through hidden-member counts, shared source links or service-role callers.                                                    | Current authorization SHALL precede membership enumeration/counts/detail and disposition. Actor/tenant/purpose/subject/responsibility SHALL be trusted source-derived values. Task membership SHALL grant no financial, contact or history access; all alternate writers, caches, logs, exports and late responses SHALL preserve current scope and anonymity.               |
| S20-C4 — Architecture/reuse    | High; likely if finance batch/attention grouping, demo admin tasks or workflow claims become authority.                                       | D20 SHALL extend the existing independent shared-task coverage/history contract, not a new task engine or financial-source closure ledger. Durable admission/projection intent, product receipts and exact commands SHALL remain authoritative; scheduler claims and dispatch keys SHALL guard execution only.                                                               |
| S20-C5 — UX/accessibility      | Medium–high; likely if a checkbox has invisible scope, new arrivals change the button target or optional notes become mandatory.              | One compact review SHALL make each covered gift inspectable and the disposition meaning clear. Mark done/Not needed SHALL not imply outreach; interaction remains optional. Residue, stale reviewed facts, unknown acknowledgment, access loss and conditional Undo SHALL have distinct persistent outcomes with keyboard/phone/focus parity.                                |
| S20-C6 — Performance/coverage  | Medium–high; plausible if unbounded member arrays or a capped snapshot defines all-current coverage.                                          | Reads and projections SHALL be bounded and source-paged with accurate authorized coverage. A command SHALL never expand from reviewed IDs to current filters. Source evaluation, active grouping and history query plans/locks SHALL be qualified at declared workloads, without a global tenant lock or invented performance claims.                                        |
| S20-C7 — Migration/debt        | High; plausible if old task descriptions/generated flags are interpreted as membership or a generic writer resets provenance.                 | Inventory retained task/link/source/coverage/disposition data and fence incompatible writers before activation. Ambiguous old tasks SHALL not acquire fabricated covered gifts. Preserve accepted history and legitimate open work; restore/import/reassignment SHALL not duplicate or silently consume grouped obligations.                                                 |
| S20-C8 — Reliability/proof     | High; plausible if accepted coverage/history is split across requests or replay returns the group's new state as the old result.              | Persist the accepted reviewed coverage and immutable command result with the owning disposition transaction; reconcile secondary projections without repeating disposition. Retry SHALL return the original result under current read authority. Prove new-arrival/correction/permission/Undo/crash races with real product commands before activation.                      |

## Falsifiable proof outcomes proposed, not run here

1. Two eligible special gifts for the same compatible scope appear once, with
   both authoritative references; two transport deliveries of one gift do not
   add two members or two current tasks.
2. Different ministry, tenant/entity, supporter, responsibility or incompatible
   purpose cannot enter that group by matching name/email/designation text.
3. Reviewing A/B then receiving C permits exactly A/B disposition and leaves C
   in one current actionable follow-up; final copy and count match that result.
4. Replaying A/B's command after C arrives returns the original A/B receipt and
   does not modify C, even after a prior response was lost.
5. A material source change, withdrawal or lost eligibility for reviewed A
   rejects the reviewed A/B command; B is not silently marked handled. Refresh
   offers the now-qualified set without disclosing denied facts.
6. Two tabs/assignees and competing Done/Not needed commands serialize with one
   truthful result per reviewed coverage; changing authority cannot be smuggled
   through a stale scope or service-role field.
7. Once A/B is fully handled, later C is new work and does not reopen or enlarge
   the old completed receipt. First-support coverage remains separately consumed.
8. Conditional Undo checks the exact latest human disposition, current facts and
   any new current work; it preserves newer history and never creates two active
   tasks, erases a source record or repeats a communication.
9. Anonymous/restricted members cannot be inferred through counts, totals,
   source links, task titles, pending previews, history or delayed cache results.
10. A group with multiple currencies lists source facts without inventing a
    total. Partial/stale coverage never becomes an unqualified all-gifts claim.
11. A crash between admission and materialization, or after disposition before
    response, preserves recoverable source intent/receipt without double work.
12. Retained manual/generated tasks and browser/API/import/background writers
    cannot bypass the new closed coverage contract or erase historical evidence.
13. Phone/keyboard/screen-reader users can review, finish, see residue, recover
    a stale set and correct a permitted mistake without mandatory narrative,
    duplicate entry, drag-only action or an extra confirmation for every save.

## Existing tests and verification limits

The [D19 test attempt](/workspace/core/docs/features/missionary-workspace-depth/grill/d19-evidence/current-source-and-ux.md:321)
failed before collection because the installed Sentry package lacks the
`./config` export required by Vitest configuration. This documentation-only
follow-up adds no justification to rerun that unchanged blocked command or
install/change dependencies. No tests were run in this pass.

Previously inspected task form/delete tests exercise manual payloads or mocked
operations, not reviewed gift coverage. [Contribution batch tests](/workspace/core/tests/unit/packages/api/admin/contribution-batches.test.ts:1)
and [work-claim tests](/workspace/core/tests/unit/packages/api/workflows/work-claims-recovery.test.ts:1)
are relevant existing test locations for the mechanics above; their presence
does not establish D20 semantics or passing actual Core authorization/transaction
behavior. No new actual database, complete migration-chain, production workload
or browser accessibility qualification is claimed by this source trace.
