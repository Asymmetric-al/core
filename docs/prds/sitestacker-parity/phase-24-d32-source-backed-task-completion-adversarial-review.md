# Phase 24 D32 — Source-Controlled Closure for Source-Backed Tasks

**Status:** Founder direction resolved, pressure-tested, and recorded as Reserved  
**Decision evaluated:** Whether an eventual Tasks Hub recipient can independently
complete a D31 source-backed task before its source action ends  
**Review date:** 2026-08-28  
**Scope:** D31 Website correction tasks and the reusable cross-domain completion
contract for source-backed Tasks Hub work. This review and its companion
recording remain documentation-only: they update the decision log, governing
ADRs, and glossary, but do not implement runtime or schema, amend OpenSpec, or
create implementation tickets.

## Subsequent D33 reconciliation — 2026-08-28

D33 refines the D32 responsibility end vocabulary without changing source-
controlled closure. **Reassigned** requires a named source-proved successor. A
return names none and is **Returned** while another current responsible person
remains, or **Returned for reassignment** plus source **Needs assignment** only
when nobody remains. Tasks Hub still owns no assignee or completion mutation;
unknown/partial eligibility writes nothing. See the
[D33 adversarial review](./phase-24-d33-source-validated-return-handoff-adversarial-review.md)
and [primary research](./phase-24-d33-source-validated-return-handoff-primary-research.md).

## Final disposition

**Accept Option 1 with required amendments — source-controlled task closure
only, at the exact assigned source-action grain.**

Option 1 is the best permanent default because a D31 task is a projection of
work whose existence and successful outcome are already owned by the Website
source. Giving the projection an independent **Complete** state would create a
second, weaker assertion that can hide still-required work. Giving a generic
**Complete task** button authority to invoke a source command would instead turn
Tasks Hub into a dangerous universal action broker.

The essential amendment prevents Option 1 from becoming inflexible: closure is
not forced to wait for the entire correction episode when the source can prove
that a recipient's exact assigned action ended. Maria's Page task may close when
the source records her Page correction even while Joel's Navigation task remains
active. If a source cannot identify and prove an action-specific end, it must
assign the broader truthful job—such as **Prepare a corrected Website version**—
and keep it active until that broader source predicate ends. Tasks Hub never
invents a personal “done” fact to compensate for an under-modeled source.

## Exact corrected decision

> Every source-backed task policy SHALL declare one closed completion-authority
> kind. D31 Website correction tasks use `source_controlled`: Tasks Hub exposes
> no generic **Complete**, checkbox, bulk-complete, drag-to-Done, API completion,
> or keyboard completion operation for that task or assignment.
>
> The source contract SHALL bind each recipient work assignment to one or more
> exact typed source-action scopes and their current actionability/end
> predicates. The recipient's task presentation remains active while at least
> one assigned action scope is both required and currently authorized. A source
> command that proves an assigned action was satisfied ends that action scope;
> the recipient presentation closes when no assigned action remains. The shared
> correction task/episode closes only when its own source predicate ends.
>
> If the source cannot prove a narrower action-specific end, Core SHALL use the
> smallest broader source-owned predicate it can prove and explain that scope
> honestly. It SHALL NOT add independent task completion, parse feedback, trust
> a comment, accept a user attestation, or infer completion from read, elapsed
> time, notification, Inngest, task activity, or another recipient.
>
> A source end carries one typed reason. A satisfied action appears as
> **Completed in Website**; when another authorized actor satisfies the
> recipient's applicable action it may appear as **Completed elsewhere**
> without naming that actor unless separately authorized; cancellation,
> supersession, policy/source
> withdrawal, or no-longer-applicable work appears as **No longer required**;
> responsibility handoff appears as **Reassigned**. Access loss removes
> protected presentation and never fabricates completion. These labels are
> source-derived presentation, not editable task status.
>
> Tasks Hub remains a shared staff-work projection. It owns safe list/detail
> composition and personal read/organization state permitted by policy, but it
> neither owns Website correction truth nor executes a generic source action.
> Manual and independently lifecycle-owned tasks may use a separately admitted
> user-controlled completion policy; mixed policies are visually and
> structurally distinct.
>
> Source-end intent commits with the authoritative source transition and
> projects through a durable idempotent outbox/ledger. List and detail reads
> suppress stale active presentation by re-proving current source state before
> asynchronous projection catches up. Inngest may execute short projection and
> reconciliation work, but owns no completion decision, status reason,
> idempotency, authorization, or audit truth.

## Evidence labels

- **Verified repository fact:** confirmed in current Core source or governing
  docs on 2026-08-28.
- **Verified external fact:** confirmed by a current first-party source linked
  below.
- **Reasonable inference:** follows from verified facts but is not itself a
  governing requirement.
- **Product judgment:** the recommended permanent choice where no primary source
  proves one universal behavior.
- **Assumption:** staff/ministry behavior requiring representative validation.
- **Unresolved unknown:** deliberately left for D33 rather than guessed.

## Current behavior, intended behavior, and permanent path

| Area                                | Current behavior                                                                                                                              | D32 intended behavior                                                                    | Best permanent path                                                                                                        |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Phase 24                            | D31 defined source-backed task readiness but no runtime and originally reserved completion policy for D32. D32 now resolves that reservation. | Close the ambiguity without creating task/source dual truth.                             | Source-controlled closure at exact action scope, source-derived end reason, no generic completion mutation.                |
| D19/D20 attention                   | Actionable notification remains until source end; read only changes personal engagement.                                                      | Preserve that source-led mental model when actual work also appears in Tasks Hub.        | One active source-backed task presentation whose closure comes from typed source state.                                    |
| ADR-0054                            | Mission Control may own follow-up status for accounting tasks, but task completion cannot clear an Accounting Exception Case.                 | Preserve its ownership invariant without importing optional independent status into D31. | A task policy discriminant allows independently lifecycle-owned/manual tasks and source-controlled projections to coexist. |
| Contribution task backend           | Generic mutable statuses include `open`, `in_progress`, `completed`, `dismissed`, `suppressed`; API/UI do not encode completion authority.    | Do not reuse `completed` blindly for Website work.                                       | Additive policy/end-reason model and server rejection before any D31 writer.                                               |
| Admin `/tasks` and missionary tasks | Current UIs expose checkbox/menu/bulk completion and deletion; admin route uses an incompatible browser collection.                           | Useful visual prior art only.                                                            | Shared Base Maia components render controls from server task policy; source-controlled tasks omit completion everywhere.   |
| Source action modeling              | D31 requires typed next-action scopes and end predicates rather than prose parsing.                                                           | Make the grain precise enough that staff work closes promptly and truthfully.            | Per-assignment action membership; partial source ends close only applicable personal work.                                 |
| Inngest                             | Core has identifier-only envelopes, a durable dispatch ledger, retries, recovery, and product claims.                                         | Optional asynchronous projection, never human/source wait or completion owner.           | Source transaction + product outbox/uniqueness + current-state claim; executor replaceable.                                |

## Why Option 1 wins

### Repository authority

- ADR-0027 makes source state and personal engagement distinct.
- ADR-0054 establishes that task completion cannot clear cause-owned truth.
- ADR-0181 makes the exact Website source own `changes_requested`, its
  successor, and every final consequence.
- D31 requires source action scopes and partial end predicates. That gives Core
  a truthful way to close Maria's task without a second status.

### Current modern practice

- [Microsoft Power Automate approvals](https://learn.microsoft.com/en-us/power-automate/get-started-approvals)
  complete through the defined approval response and configured all/first/
  sequential policy—not a generic “done” checkbox. This supports action-owned
  closure, though Core rejects its automatic guest-role behavior.
- [GitHub review decisions](https://docs.github.com/en/pull-requests/reference/pull-request-reviews)
  are exact source actions—approve, comment, or request changes—and required
  review state follows review/branch truth rather than a separate personal
  completion toggle.
- [Salesforce Orchestration work items](https://help.salesforce.com/s/articleView?id=platform.orchestrator_concepts_work_items.htm&language=en_US&type=5)
  demonstrate why end reason matters: a work item can display Completed because
  a person completed it, a stage completed, or orchestration was canceled/error.
  Core should not collapse those meanings into one green status.
- [Microsoft Planner](https://support.microsoft.com/en-US/Planner/assign-people-to-tasks)
  and [Asana](https://help.asana.com/s/article/understanding-tasks) allow users to
  complete tasks, but in those products the task is itself the work authority.
  That is the strongest alternative, not evidence that a subordinate Core
  projection needs independent completion.
- [Microsoft Graph Planner](https://learn.microsoft.com/en-us/graph/api/resources/planner-overview?view=graph-rest-1.0)
  requires ETag preconditions for mutations. Even task-authoritative systems
  treat concurrent status writes as versioned operations; Core's source-owned
  action requires the stronger source CAS.

### Product judgment

Option 2's benefit is personal workload hygiene. D31's action-grained source
model supplies that benefit without two completion truths: a person's row ends
when their exact source action ends. If source instrumentation is too coarse,
adding “I am done” would hide the modeling defect rather than fix it. Option 1
therefore has lower cognitive, authorization, audit, migration, and operational
cost while remaining flexible for staff.

## Normative D32 rules

### D32-R1 — Completion authority is explicit and closed

Every task policy declares one code-owned completion-authority kind. D31 uses
`source_controlled`. Unknown, absent, caller-selected, or incompatible policy
fails closed. Tenant configuration cannot convert a source-controlled task to
user-controlled completion.

### D32-R2 — Exact source-action scope controls personal closure

Each recipient assignment references the exact safe action-scope identities
admitted by its D31 routing generation. One action scope has one registered
actionability/end predicate and immutable source lineage. Personal presentation
is active while any assigned scope remains required and visible.

### D32-R3 — Coarse source work stays honestly coarse

If a source cannot prove a narrow action end, it assigns the smallest broader
truthful action and copy. It cannot ask a recipient to attest completion, parse
the explanation, infer from changed content, or create a hidden task-only
substatus.

### D32-R4 — No generic completion surface

List checkbox, task detail action, context menu, keyboard shortcut, command
palette, bulk action, drag-and-drop, mobile swipe, API, RPC, import, automation,
AI tool, and support path all omit or reject task completion for
`source_controlled` work.

### D32-R5 — Task never brokers a generic source command

The task CTA navigates to the exact source action surface. Tasks Hub does not
translate **Complete** into an arbitrary Page, Navigation, publication,
Mobilize, finance, or other domain command. A later exact source may expose its
own deliberate action through a typed producer surface, but that is not generic
task completion.

### D32-R6 — Source CAS determines action outcome

Every action/end command re-proves Tenant, actor, capability, source, action
scope, current heads, dependencies, participant/approval policy, and expected
version in the source transaction. One winner records the outcome; stale or
concurrent losers change no source/task state.

### D32-R7 — End reason is first-class

Source action satisfaction, whole-episode satisfaction, cancellation,
supersession, no-longer-applicable, policy withdrawal, responsibility handoff,
and access loss remain distinct. They cannot all display **Completed** or share
one audit event.

### D32-R8 — Personal, shared-task, and source grains remain separate

An assigned action may end for Maria while Joel's remains. Maria's presentation
then leaves active work with its exact source reason; the shared task/episode
remains active while any source action remains. One recipient never completes
another recipient by manipulating task state.

### D32-R9 — Read and organization never complete work

Read/unread, opened, clicked, focused, viewed, pinned, sorted, filtered,
collapsed, and any later permitted personal organization remain engagement
only. They cannot satisfy an action or choose an end reason.

### D32-R10 — Authorization loss is not success

Capability, Tenant assignment, responsibility, source visibility, or Site
access loss immediately removes active/protected presentation. It records the
correct routing/access end and never **Completed in Website**. Later gain does
not revive the old task.

### D32-R11 — Truthful status vocabulary

Active copy uses **Needs action** or the exact action label. Successful action
uses **Completed in Website**. Source withdrawal/supersession/cancellation uses
**No longer required** with a permitted reason. Responsibility successor uses
**Reassigned**. Access loss shows no protected history unless current policy
allows a generic non-sensitive record. Status never relies on color.

### D32-R12 — The UI explains the absence of completion

Detail says: **Complete this work in Website. This task updates automatically
from Website state.** The primary button names the source action/destination.
The UI does not show a disabled checkbox without explanation or use training to
paper over generic task controls.

### D32-R13 — Manual tasks remain possible but unmistakable

An independently lifecycle-owned or manual task may use user-controlled
completion under a different policy. Its controls, audit, status, bulk actions,
and API are selected by the server policy. Mixed lists identify source and
completion behavior without noisy badges or hidden semantics.

### D32-R14 — Source end projects asynchronously but reads fail truthful

The source transaction records end reason/head and durable projection intent.
Task/notification history may update asynchronously. Active list, count, detail,
and action re-prove current source state and suppress stale actionable
presentation before the projector catches up.

### D32-R15 — Durable idempotency binds source meaning

Source end, projection intent, per-action closure, recipient projection, task
history, and notification end each have durable semantic identities and
database uniqueness. Same key/same meaning reuses the result; changed meaning
conflicts. Transport and Inngest keys are additional only.

### D32-R16 — Out-of-order events cannot regress status

Projection applies only a newer compatible source head and monotonic action
end. Old active/create events after end are ignored; cancellation after success
does not rewrite success; a successor episode never reopens predecessor history.

### D32-R17 — Protected feedback remains reference-only

Completion/end projections contain action codes, source heads, reason codes,
and safe identifiers only. They do not copy D30 explanation, anchor content,
reviewer identity, Page/CMS body, missionary/member-care facts, donor data, or
financial details.

### D32-R18 — RLS and privileged paths enforce policy

Task policy/completion authority, scope, source/action IDs, recipient, current
state, and end reason are immutable or server-derived. RLS/grants, `USING`,
`WITH CHECK`, hardened RPCs, service role, support, AI, worker, import/export,
and cache paths prevent a user-controlled transition or policy conversion.

### D32-R19 — Inngest is projection execution only

If used, Inngest receives identifier-only end intents, reloads current source
state, claims the product projection, and writes idempotently. Retry,
cancellation, replay, run status, event age, and concurrency never determine
completion or replace source/DB locking.

### D32-R20 — Cross-domain reuse is policy reuse, not semantic flattening

Website, Mobilize, finance, approvals, and later sources may use
`source_controlled` only when each declares exact action/end/reason semantics.
No generic Tasks Hub enum guesses domain completion. Manual tasks use a separate
owner and contract.

### D32-R21 — Migration is additive and denies old writers first

Completion-policy discriminants, source reasons, readers, generic-mutation
denials, source adapters, and reconciliation land before any D31 task writer.
No historical completion is inferred from old task status, comments,
notifications, content diffs, or timestamps. No dual completion writers run.

### D32-R22 — Observability separates source, projection, and UX

Body-free business audit records source action/end; task audit records
projection; security audit records denied/privileged access; technical telemetry
records lag/retry/drift. A green worker, hidden row, or task label never proves a
source outcome.

## Complete staff UX/UI

### My tasks row

```text
Website · Needs action
Prepare the French Page correction
hope.org · French (Canada)
Completes from Website state                         [Open Website work]
```

The list has no completion checkbox, swipe action, row menu completion, or
drag-to-Done behavior. A compact source label distinguishes it from a manual
task without adding a warning badge. The whole row has one semantic detail link;
the source action is a separate valid control, not nested interactive markup.

### Detail

```text
Prepare the French Page correction                         Website

Assigned to you · Needs action
Hope Ministries · hope.org · French (Canada)

What needs to change
The Contact us link opens the English page.

Complete this work in Website
This task updates automatically from Website state. Marking a task cannot
publish the Website or change Giving.

[Open Website work]
```

The source explanation remains lazy, protected, inert, original-language text.
If the current user may see action context but not reviewer identity, the
reviewer is labelled **External review**. The absence of **Complete** is
explained once in the action area, not through a disabled unexplained checkbox.

### Action-specific closure

Maria selects **Open Website work**, prepares the exact Page correction, and
commits the valid source action. The source success state says:

```text
Page correction prepared
Your Website task is complete. Other correction work may still be required
before a new version can be reviewed.
```

Her task history shows:

```text
Completed in Website
Page correction prepared · 28 Aug 2026
```

Joel's Navigation task remains **Needs action**. Neither task claims that a new
candidate is review-ready until the source says so.

### Other source ends

| Source event                                         | Recipient presentation                                                      | Never say                                               |
| ---------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------- |
| assigned action satisfied                            | **Completed in Website**                                                    | completed merely because viewed/checked                 |
| candidate superseded or correction no longer applies | **No longer required**                                                      | completed successfully                                  |
| candidate canceled                                   | **No longer required · Candidate canceled** when authorized                 | completed, deleted without history                      |
| responsibility moves to successor                    | **Reassigned** in authorized history                                        | completed by old recipient                              |
| permission/access lost                               | remove protected active/recent presentation; generic denial on an open page | completed, reassigned to named person unless authorized |
| source temporarily unavailable                       | retain safe shell only when current auth can be established; show retry     | completed, no longer required                           |

### Mixed manual and source-backed tasks

The Tasks Hub page can contain both kinds without surprise:

```text
My tasks · 4 active

Website · Completes in Website
Prepare the French Page correction                 [Open Website work]

Manual task
Call the venue about Saturday training              [ ]
```

Bulk completion selects only user-controlled tasks. If a mixed selection
contains a source-controlled task, the UI excludes it and announces: **1 task
completes in its source and was not changed.** Server APIs enforce the same
rule; UI filtering is not protection.

### Mobile, accessibility, and field conditions

- At 320 CSS pixels, source, action, subject, status, and CTA stack without
  horizontal scrolling; action remains reachable with one thumb.
- Controls use a 44 CSS pixel design target and meet WCAG 2.2 AA; there is no
  drag-only or swipe-only completion.
- Dynamic task removal preserves logical focus and announces the exact source
  outcome through a status region without moving focus unexpectedly.
- `Completed in Website`, `No longer required`, and `Reassigned` have text and
  programmatic semantics, not color alone.
- Original-language feedback uses `dir="auto"`, bidi isolation, preserved line
  breaks, no auto-links, and no machine translation claim.
- Weak-network and ambiguous source responses leave the task active until a
  current source receipt proves the outcome; retry uses the same business key.
- Source-end projection delay cannot leave a stale actionable row available;
  current list/detail/action authorization suppresses it while history catches
  up.

## Source of truth and ownership map

| Fact                               | Authority                                   | Projection                       | Never authority                         |
| ---------------------------------- | ------------------------------------------- | -------------------------------- | --------------------------------------- |
| correction episode/action required | Website source contract/head                | active task/attention            | task status, read, worker               |
| action scope and end predicate     | exact versioned source adapter              | safe action label/id             | D30 prose, task description, AI         |
| source action result and actor     | source command/audit                        | authorized task history          | task click, user attestation            |
| completion-authority policy        | code-owned Tasks Hub/source policy registry | control availability/copy        | Tenant setting, client, task row patch  |
| shared task identity               | Tasks Hub keyed to source work              | My tasks/history/source backlink | personal copied task                    |
| recipient assignment/action subset | D31 routing generation                      | personal task row                | permission, exclusive source lock       |
| personal read/organization         | exact recipient engagement                  | badge/list treatment             | action or completion                    |
| satisfied end reason               | source action result                        | **Completed in Website**         | cancellation, supersession, access loss |
| inapplicable end reason            | source lifecycle                            | **No longer required**           | successful completion                   |
| handoff end reason                 | source responsibility generation            | **Reassigned**                   | old recipient completion                |
| access loss                        | Phase 12/current source authorization       | immediate absence/denial         | completion or source end                |
| projection execution               | durable outbox/ledger + optional executor   | technical outcome                | source/task business truth              |
| protected body                     | D30 source records class                    | authorized detail only           | task/event/audit/search copy            |

## Domain invariants

1. Every source-backed task has exactly one code-owned completion-authority
   policy; D31 uses `source_controlled`.
2. A caller or Tenant cannot change completion authority.
3. One recipient assignment binds only exact typed source-action scopes.
4. A personal presentation is active iff at least one assigned scope is
   currently required, assigned, visible, and authorized.
5. Task state never makes a source action true, false, satisfied, waived, or
   inapplicable.
6. Read, click, comment, age, date, notification, and executor state never close
   source-controlled work.
7. A successful source action ends only its admitted scope.
8. One recipient's scope end never ends another still-required scope.
9. The shared task/episode remains current until its source predicate ends.
10. Success, no-longer-required, handoff, and access loss are distinct reasons.
11. Access loss is never represented as successful completion.
12. Source-end state is monotonic for an exact action epoch; recurrence uses a
    successor scope/episode.
13. Old events cannot regress an ended action to active.
14. Manual/user-controlled tasks never borrow D32 source completion authority.
15. Generic completion mutations cannot target `source_controlled` tasks.
16. Source-controlled bulk completion is impossible at UI, API, RPC, worker,
    support, import, AI, and database seams.
17. Task list/history never copies protected D30 feedback.
18. Source end commits independently of task projection availability.
19. Current reads suppress stale active projection after authoritative end.
20. No D32 state changes public Website, Giving, finance, permission, reviewer
    authority, or candidate except an independently authorized source command.

## Conceptual data, RLS, and authorization

This contract intentionally avoids freezing final table names.

- Task policy has an immutable server-derived `completion_authority` and policy
  version. A check constraint/typed relation prevents unsupported combinations
  of manual fields and source-controlled policy.
- Recipient assignment has same-scope links to routing member and one or more
  action-scope membership rows; JSON is not the authority for scope, status,
  actor, recipient, policy, or end reason.
- Source action state/end is owned by its source table. Task stores only an
  idempotent projection head/reason/reference and safe display facts.
- Composite Tenant/environment/source/task/assignment relations and partial
  uniqueness prevent cross-scope links, duplicate active assignments, and two
  closure projections for one action head.
- Scope, completion policy, source/action identity, recipient, source head, end
  reason, and trusted actor are immutable/server-derived. Deletion is restrictive
  or governed; task deletion cannot erase source/audit history.
- Ordinary browser roles cannot write source-controlled status. One
  `packages/api` path selects allowed operations from current server policy.
- `USING` proves the existing task/assignment is currently in scope;
  `WITH CHECK` proves a permitted personal engagement update cannot transform
  policy, scope, recipient, source, or source-derived state.
- Table owner/service role, definer RPC, worker, support, AI, export/import,
  Realtime, and cache paths pass the same policy/cross-Tenant poison matrix.
- Lists/counts authorize before totals; detail and source CTA independently
  re-prove protected visibility/action capability. Assignment grants nothing.

## Lifecycle, concurrency, and idempotency

| Event/race                                        | Required result                                                                      |
| ------------------------------------------------- | ------------------------------------------------------------------------------------ |
| task projected for active assigned scopes         | one active personal row; no completion control                                       |
| one of several assigned scopes succeeds           | end that scope; personal row remains if another assigned scope is active             |
| final assigned scope succeeds                     | personal presentation becomes **Completed in Website** through source projection     |
| other recipient's scope succeeds                  | only their applicable projection changes                                             |
| entire correction becomes no longer applicable    | every current projection uses exact **No longer required** reason                    |
| responsibility handoff                            | old assignment ends **Reassigned**; successor generation gets independent engagement |
| access loss                                       | protected row/detail/action disappear; no success history fabricated                 |
| same source action submitted twice                | source idempotency returns one receipt/end; one projection history event             |
| two actors submit same action                     | expected-head CAS admits one result; loser sees current source state                 |
| source succeeds but response is lost              | retry with same semantic key returns source receipt; no second candidate/end         |
| end projects before create                        | create sees ended head and creates no stale active/unread row                        |
| old active event arrives after end                | monotonic head rejects it                                                            |
| projection succeeds then worker retries after 24h | DB product uniqueness returns same effect despite provider window                    |
| Inngest canceled after projection write           | durable claim/uniqueness preserves one effect; reconciliation confirms current state |
| projection unavailable                            | source truth/discovery remain; current reads fail truthful; ledger retries           |
| mixed-version old client tries complete           | server policy denies; task/source unchanged                                          |

## Full adversarial review by required category

### 1. Problem validity, necessity, and alternatives

**Material concern: Yes — a familiar checkbox is not automatically appropriate
for a source-backed projection.**

| What could go wrong                                                                                                                                         | Why it matters                                                                      | Severity | Likelihood | Evidence label/reasoning                                                                                                                                                                                                                   | Effect on answer                                                           | Permanent fix                                                                                                         | Exact rule/spec language                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------: | ---------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Core could add independent completion merely because staff expect tasks to be checkable, or remove Tasks Hub entirely because source action already exists. | The first creates dual truth; the second fragments cross-domain workload discovery. |     High |       High | **Repository fact:** ADR-0054 separates cause and task; D31 establishes a real cross-domain work projection. **External fact:** task-authoritative products allow completion, while approval/review products close through domain actions. | Accepts Option 1 but requires action-grained closure and shared discovery. | Treat source action as closure authority and make exact assigned action scopes small enough to reflect personal work. | **D32-R1–R3:** “D31 tasks are source-controlled; coarse sources must use truthful broader work rather than task-only completion.” |

### 2. Brittleness

**Material concern: Yes — Option 1 is brittle if it waits only for a whole
candidate when staff own smaller actions.**

| What could go wrong                                                                                                             | Why it matters                                                                  | Severity |  Likelihood | Evidence label/reasoning                                                                     | Effect on answer                  | Permanent fix                                                                                            | Exact rule/spec language                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | -------: | ----------: | -------------------------------------------------------------------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Maria finishes Page work but her task stays active until Joel finishes Navigation because closure is bound only to the episode. | My tasks becomes inaccurate and staff demand manual completion as a workaround. |     High | Medium-high | **Founder example/D31 fact:** one episode can contain multiple typed actions and recipients. | Narrows Option 1 to action scope. | Bind assignment memberships to source-action end predicates; keep episode and personal closure separate. | **D32-R2, R8:** “Personal presentation closes when its final assigned source-action scope ends, not necessarily when the whole episode ends.” |

### 3. Technical debt

**Material concern: Yes — current task statuses and UIs have no completion-
authority discriminant.**

| What could go wrong                                                                                   | Why it matters                                                                             | Severity | Likelihood | Evidence label/reasoning                                                                          | Effect on answer               | Permanent fix                                                                                     | Exact rule/spec language                                                                                                                                       |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------: | ---------: | ------------------------------------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Developers scatter `if source_module === website` checks or clone task components to hide completion. | Policy diverges across list/detail/mobile/API/bulk operations and new domains repeat bugs. |     High |       High | **Current source:** contribution/admin/missionary task seams use different status/control models. | Changes implementation design. | One immutable typed task policy resolved server-side and shared Base Maia render/action registry. | **D32-R1, R4, R13:** “Control availability and mutation commands SHALL derive from one versioned completion-authority policy, never source-name conditionals.” |

### 4. Edge cases

**Material concern: Yes — partial success, cancellation, handoff, access loss,
and recurrence are not all completion.**

| What could go wrong                                                                                                                               | Why it matters                                                                    | Severity |     Likelihood | Evidence label/reasoning                                                                                                   | Effect on answer                                   | Permanent fix                                                                       | Exact rule/spec language                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | -------: | -------------: | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| A task disappears after supersession or access loss and is reported as completed; one of several scopes ends; a successor event revives old work. | Staff history and performance reporting become false; protected details can leak. |     High | High aggregate | **Salesforce external fact:** work-item Completed can hide several end causes. **D31:** routing/access/source ends differ. | Requires first-class reasons and monotonic epochs. | Typed end reason, per-action membership, access-safe history, successor identities. | **D32-R7–R11, R16:** “Success, inapplicability, handoff, and access loss SHALL remain distinct and predecessor scopes never reopen.” |

### 5. Footguns

**Material concern: Yes — completion can be invoked from more surfaces than the
visible checkbox.**

| What could go wrong                                                                                                                                           | Why it matters                                          | Severity |                   Likelihood | Evidence label/reasoning                                               | Effect on answer      | Permanent fix                                                                             | Exact rule/spec language                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | -------: | ---------------------------: | ---------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Bulk actions, keyboard shortcuts, drag, mobile swipe, command palette, old client, import, API, AI, or support tooling marks source-controlled work complete. | UI-only hiding leaves a privilege and integrity bypass. | Critical | High unless centrally denied | **Current source:** existing UIs expose checkbox/menu/bulk completion. | Strengthens Option 1. | Server operation registry rejects completion for policy kind; all clients render from it. | **D32-R4, R18:** “Every mutation seam SHALL reject task completion for `source_controlled`; UI omission is not enforcement.” |

### 6. Tenant safety

**Material concern: Yes — source status projection can mix tenants or roles.**

| What could go wrong                                                                                                   | Why it matters                                                                  | Severity |                     Likelihood | Evidence label/reasoning                                                                                                    | Effect on answer                | Permanent fix                                                                              | Exact rule/spec language                                                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | -------: | -----------------------------: | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A worker closes a task with another Tenant's matching source ID, or a manager history reveals restricted Site action. | Cross-Tenant/private ministry information leaks and legitimate work disappears. | Critical | Medium without composite scope | **OpenSpec fact:** Tenant isolation is structural. **Current task migration:** standalone UUID/text links are insufficient. | Requires structural safeguards. | Composite Tenant/environment/source/action/task keys, current authorization, safe history. | **D32-R18:** “Every source-end relation, list, history, worker, cache, and privileged path SHALL prove identical Tenant/environment and current role scope.” |

### 7. Database, RLS, and authorization safety

**Material concern: Yes — an allowed task update could transform policy or
source-derived status.**

| What could go wrong                                                                                                                        | Why it matters                                                        | Severity |                         Likelihood | Evidence label/reasoning                                                                                           | Effect on answer                             | Permanent fix                                                                                                                 | Exact rule/spec language                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- | -------: | ---------------------------------: | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Caller changes `completion_authority`, end reason, recipient, source head, or status; service role bypasses policies; duplicate ends race. | User-controlled completion or cross-scope corruption becomes durable. | Critical | High if generic update is extended | **PostgreSQL fact:** `USING` and `WITH CHECK` govern different mutation aspects; privileged owners may bypass RLS. | Requires one hardened command/read boundary. | Immutable columns, check constraints, unique source heads, source-only projection RPC, least grants, forced RLS/poison tests. | **D32-R15, R18:** “Caller input SHALL NOT choose policy, source end, reason, actor, scope, or recipient; both existing and resulting rows are constrained.” |

### 8. Overengineering

**Material concern: Yes — solving completion could grow into configurable task
state machines.**

| What could go wrong                                                                                             | Why it matters                                                                              | Severity |  Likelihood | Evidence label/reasoning                                                                   | Effect on answer        | Permanent fix                                                                                              | Exact rule/spec language                                                                                                 |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------: | ----------: | ------------------------------------------------------------------------------------------ | ----------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Core adds tenant-authored statuses, formulas, stage graphs, completion hooks, votes, dependencies, or AI rules. | It duplicates general workflow scope and makes every source adapter harder to reason about. |     High | Medium-high | **Repository fact:** Phase 34/general workflows are separate; source contracts are finite. | Narrows implementation. | Closed completion-authority kinds and source reason vocabulary extension by ratified source contract only. | **D32-R1, R20:** “D32 SHALL NOT create a Tenant-authored completion/state-machine DSL or generic source-command broker.” |

### 9. UX/UI and user friction

**Material concern: Yes — removing a standard control can feel broken or
controlling unless the source journey is better.**

| What could go wrong                                                                                                     | Why it matters                                                         | Severity |                     Likelihood | Evidence label/reasoning                                                                                                                              | Effect on answer                       | Permanent fix                                                                                                                                                         | Exact rule/spec language                                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | -------: | -----------------------------: | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Staff see no checkbox, cannot tell how to finish, or must navigate several pages; closure lags and the row looks stuck. | Tasks Hub loses joy, trust, and adoption despite correct architecture. |     High | High without exact copy/action | **Product judgment:** source-led action is clearer only if direct, contextual, fast, and action-grained. **WCAG:** labels/status/focus must be clear. | Accepts Option 1 with UX requirements. | Explain **Completes in Website**, use one imperative CTA/deep link, source action receipt, current-state suppression, action-specific closure, focus/status recovery. | **D32-R11–R14:** “The task SHALL make the completion owner, action, consequence, and source outcome obvious in one view.” |

### 10. Source of truth, ownership, and domain invariants

**Material concern: Yes — task history can compete with source history.**

| What could go wrong                                                                                           | Why it matters                                                 | Severity |               Likelihood | Evidence label/reasoning                                  | Effect on answer                      | Permanent fix                                                                                                    | Exact rule/spec language                                                                                                |
| ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | -------: | -----------------------: | --------------------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Task `completed_at/by` is treated as source result while source records another actor/reason or remains open. | Audit, reporting, automation, and staff understanding diverge. | Critical | High with generic schema | **ADR-0054/0181:** source owns cause/review consequences. | Central reason for choosing Option 1. | Task history references the source action receipt/head and labels projection actor separately from source actor. | **D32-R6–R8, R22:** “Only source audit proves action success; task audit proves projection, never business completion.” |

### 11. Hidden coupling

**Material concern: Yes — closure can couple Tasks Hub to every source command
or vendor event schema.**

| What could go wrong                                                                              | Why it matters                                                                         | Severity |  Likelihood | Evidence label/reasoning                                                                                     | Effect on answer  | Permanent fix                                                                                                       | Exact rule/spec language                                                                                                         |
| ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | -------: | ----------: | ------------------------------------------------------------------------------------------------------------ | ----------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Task UI calls Page/Navigation/Mobilize commands directly or maps provider event names to status. | Source/API upgrades break Tasks Hub and a generic task surface gains domain authority. |     High | Medium-high | **Platform boundary:** business mutation belongs in source packages; workflow events use product identities. | Rejects Option 3. | Typed source destination and source-owned action surface; task consumes only stable action/end projection contract. | **D32-R5, R19–R20:** “Tasks Hub SHALL not dispatch arbitrary source commands or use vendor/UI identities as completion meaning.” |

### 12. Failure modes

**Material concern: Yes — source success and projection success can separate or
be ambiguous.**

| What could go wrong                                                                                                                                | Why it matters                                           | Severity | Likelihood | Evidence label/reasoning                                                                                                    | Effect on answer                                       | Permanent fix                                                                                              | Exact rule/spec language                                                                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | -------: | ---------: | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Source commits but response/task projection fails; task history updates but source did not; current read cannot reach source; dead letter is lost. | Staff repeats work or sees false active/completed state. | Critical |     Medium | **Core workflow fact:** ledger/recovery exists because handoffs fail. **Inngest fact:** retries require idempotent effects. | Requires atomic source intent and fail-truthful reads. | Source receipt + outbox, monotonic task projection, current-state suppression, dead-letter/reconciliation. | **D32-R14–R16, R19:** “Projection failure never changes source; ambiguous source response remains active until receipt lookup proves outcome.” |

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: Yes — partial ends, duplicate actions, and out-of-order
events can regress work.**

| What could go wrong                                                                                                      | Why it matters                                                                      | Severity | Likelihood | Evidence label/reasoning                                                                                       | Effect on answer                       | Permanent fix                                                                                       | Exact rule/spec language                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | -------: | ---------: | -------------------------------------------------------------------------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Two actors finish one action, old active arrives after end, cancellation races success, or a later episode shares a key. | Duplicate successors, wrong labels, reopened tasks, and overwritten history result. | Critical |     Medium | **D25–D31:** source CAS/idempotency required. **Inngest:** dedupe time-bounded and cancellation step-boundary. | Strengthens exact source/action epoch. | Expected heads, durable semantic keys, typed precedence, monotonic projections, successor identity. | **D32-R6–R8, R15–R16:** “Every race SHALL converge to one source result and non-regressing per-action/task projection.” |

### 14. Data integrity risks

**Material concern: Yes — generic `completed` fields erase reason and grain.**

| What could go wrong                                                                                                                      | Why it matters                                                                       | Severity |                   Likelihood | Evidence label/reasoning                                                                                                  | Effect on answer                | Permanent fix                                                                                                   | Exact rule/spec language                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------: | ---------------------------: | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| One status/timestamp conflates action satisfaction, supersession, handoff, access loss, and whole-episode end; JSON action arrays drift. | History cannot be repaired or interpreted and per-recipient work closes incorrectly. |     High | High if current model reused | **Current source:** mission tasks use broad status enum; **Salesforce evidence:** “Completed” can encode multiple causes. | Requires typed data amendments. | Relational action memberships, source head/receipt, end-reason code, occurred/effective timestamps, uniqueness. | **D32-R2, R7–R8:** “Action membership and source end reason SHALL be structurally represented; generic status/JSON SHALL NOT be authority.” |

### 15. Security and privacy risks

**Material concern: Yes — end projection/history can leak feedback and actor
identity.**

| What could go wrong                                                                                                                                               | Why it matters                                                                        | Severity |      Likelihood | Evidence label/reasoning                                                        | Effect on answer             | Permanent fix                                                                                                 | Exact rule/spec language                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------: | --------------: | ------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Events, task history, notifications, manager reports, or Inngest runs copy explanation, anchor, source body, restricted actor/location, donor, or finance detail. | Protected content outlives source authorization/retention and spreads across systems. | Critical | Medium lifetime | **D30/D31:** body-free projection. **Current event envelope:** identifier-only. | Narrows end payload/history. | Safe action/reason codes and opaque source receipt only; detail reloaded under current purpose authorization. | **D32-R17–R19:** “Completion projection and audit SHALL remain body-free and never widen source identity/detail access.” |

### 16. Scalability and performance risks

**Material concern: Yes — current-source reproof for every row can become an
N+1 bottleneck; stale projection cannot simply be trusted.**

| What could go wrong                                                                                                                    | Why it matters                                                                    | Severity | Likelihood | Evidence label/reasoning                                                                                              | Effect on answer               | Permanent fix                                                                                                                               | Exact rule/spec language                                                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | -------: | ---------: | --------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Large task pages call each source separately, workers update many recipients serially, or task queries trust lagging status for speed. | Lists become slow or show stale actionable work; large tenants starve small ones. |     High |     Medium | **D31:** bounded recipients/batched authorization. **Inngest:** keyed concurrency manages resources, not correctness. | Adds query/worker constraints. | Batch current applicability projection, indexed head, cursor pages, set-based recipient close, tenant-fair executor, lazy protected detail. | **D32-R14, R19:** “Active reads SHALL be current and production-bounded without per-row body/source RPC or permission bypass.” |

### 17. Operational burden

**Material concern: Yes — stuck active rows and ambiguous end reasons otherwise
require manual database correction.**

| What could go wrong                                                                                                            | Why it matters                                                                           | Severity | Likelihood | Evidence label/reasoning                                                        | Effect on answer                   | Permanent fix                                                                                                | Exact rule/spec language                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | -------: | ---------: | ------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Operators inspect private feedback, edit status directly, replay unsafe events, or close rows manually after projection drift. | Repair leaks content, damages audit, and demands developer intervention from ministries. |     High |     Medium | **Repository pattern:** workflow ledger/reconciliation and source-owned repair. | Requires runbooks and safe repair. | Body-free diagnostics, source-derived reconciler, owner-only audited replay/fence, no direct completion SQL. | **D32-R14–R16, R22:** “Every drift state SHALL have an idempotent source-derived roll-forward path with no body inspection or manual completion.” |

### 18. Observability and auditability gaps

**Material concern: Yes — a green task or worker is easy to misread as business
success.**

| What could go wrong                                                                                                                       | Why it matters                                       | Severity |              Likelihood | Evidence label/reasoning                         | Effect on answer                | Permanent fix                                                                                        | Exact rule/spec language                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | -------: | ----------------------: | ------------------------------------------------ | ------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Metrics report completion from task end, hidden row, or Inngest success instead of source receipt; logs lack correlation to diagnose lag. | Product reports lie and incidents remain unresolved. |     High | High without vocabulary | **ADR facts:** projection/engagement not source. | Requires three evidence planes. | Source business audit, task projection audit, technical telemetry with stable body-free correlation. | **D32-R22:** “Only a source receipt counts as action success; projection and executor outcomes are named separately.” |

### 19. Dependency and integration risks

**Material concern: Yes — workflow providers can delay, replay, or retain events
and become mistaken completion systems.**

| What could go wrong                                                                                                                                       | Why it matters                                            | Severity | Likelihood | Evidence label/reasoning                                                            | Effect on answer        | Permanent fix                                                                                        | Exact rule/spec language                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | -------: | ---------: | ----------------------------------------------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Inngest event ID expires, replay duplicates history, cancellation occurs after write, outage leaves stale row, or provider dashboard is treated as truth. | Task status drifts and vendor replacement becomes unsafe. |     High |     Medium | **Official Inngest:** 24-hour idempotency, step retries, between-step cancellation. | Keeps Inngest optional. | Product outbox/claim/uniqueness, identifier-only event, current source reload, replaceable executor. | **D32-R15, R19:** “Provider guarantees SHALL be defense-in-depth only and cannot define or certify completion.” |

### 20. Migration, rollout, and upgrade risks

**Material concern: Yes — old clients can mutate new source-controlled tasks.**

| What could go wrong                                                                                                                        | Why it matters                                         | Severity | Likelihood | Evidence label/reasoning                                     | Effect on answer                      | Permanent fix                                                                                                                 | Exact rule/spec language                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ | -------: | ---------: | ------------------------------------------------------------ | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Schema adds policy but old API/UI ignores it; backfill labels old completed tasks as source success; rollback removes reader after writes. | Durable false history and hidden work survive deploys. | Critical |     Medium | **Current repo:** multiple incompatible task clients/models. | Requires one-writer additive rollout. | Denial guard first, additive nullable/read-compatible policy, no inferred backfill, shadow, pilot, kill switch, roll-forward. | **D32-R21:** “Old writers SHALL be unable to mutate source-controlled tasks before any such task exists; rollback never rewrites/deletes source/task history.” |

### 21. Testability, traceability, and proof

**Material concern: Yes — “updates automatically” is not falsifiable without
exact action/end/reason/race outcomes.**

| What could go wrong                                                                                                                                            | Why it matters                                            | Severity | Likelihood | Evidence label/reasoning                                    | Effect on answer                               | Permanent fix                                                                                          | Exact rule/spec language                                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | -------: | ---------: | ----------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Tests check hidden checkbox or worker call but miss direct APIs, partial scopes, reason copy, stale reads, races, authorization, migration, and accessibility. | Implementation passes while work remains wrong or unsafe. |     High |       High | **Repository rule:** prove public seams and trace OpenSpec. | Requires complete acceptance/evidence mapping. | 126 criteria below plus positive/negative/auth/race/migration/a11y/production tests; stable D32 terms. | “Every D32 rule SHALL trace decision→glossary→ADR→OpenSpec→design→ticket→test→release evidence by D32-AC ID.” |

### 22. Other development hazards

**Material concern: Yes — completion shortcuts can trigger publication, finance,
AI, or performance-management consequences.**

| What could go wrong                                                                                                                                                                                       | Why it matters                               | Severity |       Likelihood | Evidence label/reasoning                                                                                 | Effect on answer                         | Permanent fix                                                                                                                   | Exact rule/spec language                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | -------: | ---------------: | -------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Task completion publishes content, clears review, moves money, changes permissions, evaluates staff performance, or lets AI act beyond the human; absence of completion becomes inaccessible or punitive. | Cross-domain harm and staff distrust result. | Critical | Medium aggregate | **Platform boundaries:** publication, finance, permissions, AI authority, and honest state are separate. | Adds absolute non-effects and humane UX. | No generic source command, no task-derived KPI, exact action authorization, accessible source path, D33 recovery for inability. | **D32-R4–R5, R10–R13, R20:** “D32 task closure SHALL create no independent public/finance/permission/AI/HR effect and SHALL not become performance evidence.” |

## Acceptance criteria

### Policy and source-action grain

1. **D32-AC001 — Closed policy.** Every task policy resolves to one known
   code-owned completion-authority kind; unknown or absent policy denies
   completion and source-backed release.
2. **D32-AC002 — D31 policy.** Every D31 Website correction task resolves to
   `source_controlled` at creation and read.
3. **D32-AC003 — No Tenant override.** Tenant settings, Site settings, task
   edits, imports, or feature flags cannot convert completion authority.
4. **D32-AC004 — Manual-task separation.** A manual or independently
   lifecycle-owned task may use an explicitly different completion policy
   without weakening D31 behavior.
5. **D32-AC005 — Exact scope membership.** Each recipient assignment references
   one or more typed source-action scopes from the exact D31 routing generation.
6. **D32-AC006 — No free-text scope.** Explanation, anchor text, comments,
   labels, task title, or AI output cannot create or end an action scope.
7. **D32-AC007 — Registered predicate.** Every action scope has a code-owned
   current actionability and end predicate with a version/digest.
8. **D32-AC008 — Unknown predicate.** Missing, incompatible, ambiguous, or stale
   predicate versions fail closed and expose no completion claim.
9. **D32-AC009 — Personal active rule.** A recipient row remains active while at
   least one of their assigned scopes is required, assigned, visible, and
   authorized.
10. **D32-AC010 — Partial personal closure.** Ending one of several assigned
    scopes does not close the personal row while another scope remains.
11. **D32-AC011 — Final personal closure.** Ending the recipient's final assigned
    scope makes their personal presentation source-complete/inapplicable.
12. **D32-AC012 — Other recipient independent.** Maria's Page scope end cannot
    end Joel's still-required Navigation presentation.
13. **D32-AC013 — Shared episode independent.** Personal scope closure cannot
    end the shared correction episode while any registered source action remains.
14. **D32-AC014 — Truthful coarse scope.** A source lacking narrow proof uses a
    broader truthful source action/title and never creates task-only completion.

### Controls, copy, and UX

15. **D32-AC015 — No list checkbox.** Source-controlled rows expose no completion
    checkbox or equivalent row toggle.
16. **D32-AC016 — No detail completion.** Detail exposes no generic **Complete
    task** button, menu item, or form operation.
17. **D32-AC017 — No bulk completion.** Mixed and source-controlled selections
    cannot bulk-complete source-controlled rows.
18. **D32-AC018 — No drag/swipe.** Board drag-to-Done and mobile swipe completion
    omit or reject source-controlled work and have no hidden gesture path.
19. **D32-AC019 — No shortcut.** Keyboard, command palette, automation, AI tool,
    import, support, API, RPC, and direct DB mutation cannot complete it.
20. **D32-AC020 — Old-client denial.** An old generic client sending a completion
    mutation receives policy denial and changes no task/source/audit state.
21. **D32-AC021 — Source CTA.** Primary action uses a source-specific imperative
    label and navigates to an exact currently authorized source surface.
22. **D32-AC022 — Completion owner copy.** Row/detail clearly says **Completes
    in Website** or **This task updates automatically from Website state**.
23. **D32-AC023 — No disabled mystery.** The UI does not leave an unexplained
    disabled checkbox where manual tasks show a usable one.
24. **D32-AC024 — Consequence copy.** Detail says task state cannot publish,
    change Giving, or resolve the Website correction.
25. **D32-AC025 — Direct source return.** Browser Back/Forward and a stable
    backlink preserve task-list filter, cursor, scroll, and logical focus.
26. **D32-AC026 — Mixed policy clarity.** Manual and source-controlled rows are
    distinguishable by concise source/completion copy, not color alone.
27. **D32-AC027 — Mixed bulk feedback.** If a mixed selection is attempted, the
    UI names how many source-controlled tasks were excluded and why.
28. **D32-AC028 — Server parity.** Every control shown/omitted corresponds to the
    same server-authorized operation registry; UI policy cannot drift.

### End reasons and history

29. **D32-AC029 — Successful reason.** Only a proved assigned source-action
    success may display **Completed in Website**.
30. **D32-AC030 — Exact actor.** Successful history attributes the source actor
    from trusted source audit, never task assignee, opener, worker, or projector.
31. **D32-AC031 — System source actor.** A valid system-owned source result is
    labelled accurately and never attributed to a human assignee.
32. **D32-AC032 — No-longer-required reason.** Cancellation, supersession,
    withdrawal, and inapplicability display **No longer required**, not success.
33. **D32-AC033 — Reassignment reason.** Responsibility handoff displays
    **Reassigned** in authorized history and never completion by the old person.
34. **D32-AC034 — Access-loss reason.** Access loss removes protected
    presentation and never fabricates **Completed** or names a successor.
35. **D32-AC035 — Source-unavailable state.** Temporary source failure displays
    a retryable unavailable state, not active certainty or terminal status.
36. **D32-AC036 — Whole-episode success.** Review-ready/successor-ready copy
    appears only after the source episode predicate—not one personal scope—ends.
37. **D32-AC037 — Multiple scopes history.** One recipient's several action
    results retain individual source reasons while personal row history remains
    comprehensible and nonduplicative.
38. **D32-AC038 — Authorized reason detail.** History shows only reason detail
    the current actor may see; otherwise it uses a safe generic label.
39. **D32-AC039 — Body-free status.** Status/reason rows contain no D30 body,
    anchor content, reviewer email, CMS body, or copied private detail.
40. **D32-AC040 — No reopening predecessor.** A later correction episode creates
    a successor task identity and never reopens old completed/inapplicable work.
41. **D32-AC041 — No performance inference.** Source reason/duration/closure is
    not automatically used as staff performance or productivity truth.
42. **D32-AC042 — Records-class independence.** Task-history retention cannot
    extend readable D30 body retention or rewrite source audit.

### Source action, races, and idempotency

43. **D32-AC043 — Fresh source authorization.** Every source action re-proves
    Tenant, actor, assignment, capability, visibility, action scope, policy,
    dependencies, and current heads.
44. **D32-AC044 — Source CAS.** Concurrent actions use expected source heads so
    one admitted result wins and losers change no source/task state.
45. **D32-AC045 — Same-key retry.** Same source-action key and same canonical
    meaning returns the original receipt/end without duplicate effect.
46. **D32-AC046 — Changed-key conflict.** Same key with changed source, scope,
    actor-purpose, candidate, payload, or expected meaning hard-conflicts.
47. **D32-AC047 — Lost response.** If source succeeds and response is lost,
    receipt lookup/retry proves the same outcome without a second successor.
48. **D32-AC048 — Ambiguous response.** Network/timeout uncertainty leaves task
    presentation nonterminal until current source receipt/head is proved.
49. **D32-AC049 — Atomic outbox.** Source end head/reason/receipt and durable
    projection intent commit atomically or none commit.
50. **D32-AC050 — Projection idempotency.** One source end creates at most one
    task-assignment history transition and notification end per semantic grain.
51. **D32-AC051 — Old active after end.** Delayed create/active events cannot
    re-expose work after a newer source end.
52. **D32-AC052 — End before create.** End projected before create results in no
    active/unread debt and one accurate authorized history projection if policy
    retains it.
53. **D32-AC053 — Success/cancel race.** Typed source precedence/locking yields
    one final reason; task last-write-wins is impossible.
54. **D32-AC054 — Handoff/action race.** Source head decides whether the old or
    successor assignment can act; no result is attributed to the wrong route.
55. **D32-AC055 — Access/action race.** Revocation committed before action
    authorization denies it; committed valid action retains its true historical
    actor even if access later ends.
56. **D32-AC056 — Duplicate executor.** Parallel workers/replays claim one
    projection effect through durable product uniqueness.
57. **D32-AC057 — Provider-window independence.** Replay after Inngest's 24-hour
    dedupe period still produces one effect.
58. **D32-AC058 — Clock independence.** Local timezone, task age, retry time,
    due date, and worker timestamp never determine source completion.

### Database, RLS, authorization, and privacy

59. **D32-AC059 — Composite scope.** Source action, receipt, task, assignment,
    policy, and history relations prove identical Tenant/environment and exact
    source grain.
60. **D32-AC060 — Immutable policy.** No permitted update changes completion
    authority, policy version, source/action identity, scope, recipient, or
    reason authority.
61. **D32-AC061 — Unique source end.** Database constraints prevent multiple
    terminal projections for one exact source action head/reason epoch.
62. **D32-AC062 — Relational membership.** Assigned action scopes use constrained
    typed relations, not caller-controlled JSON arrays as authority.
63. **D32-AC063 — Restrictive deletion.** Deleting task/account/source cannot
    silently erase immutable source receipt/history outside governed retention.
64. **D32-AC064 — Browser source-status writes denied.** Ordinary browser roles
    cannot insert/update/delete source-derived task status or end reason.

65. **D32-AC065 — Generic API denied.** Generic task completion endpoints reject
    `source_controlled` policy before any write or audit success.
66. **D32-AC066 — `USING` correctness.** Any permitted engagement mutation proves
    the existing assignment belongs to the current recipient/scope/policy.
67. **D32-AC067 — `WITH CHECK` correctness.** Resulting engagement rows cannot
    change task policy, recipient, scope, source state, reason, or another user.
68. **D32-AC068 — Owner/service parity.** Table owner, service role, worker,
    definer RPC, support, and migration paths pass completion-policy poison tests.
69. **D32-AC069 — Hardened RPC.** Definer functions have safe search path, least
    execute grants, trusted context, expected-head checks, and no caller actor/
    reason override.
70. **D32-AC070 — AI parity.** AI can navigate/invoke only the exact source
    action available to its initiating human and cannot call task completion.
71. **D32-AC071 — Import/export parity.** Import cannot set source completion;
    generic export contains only currently authorized body-free status/history.
72. **D32-AC072 — Cache parity.** Caches key Tenant/principal/role/source/policy/
    authorization head and cannot show stale active or protected history.
73. **D32-AC073 — Realtime parity.** Realtime transmits safe invalidation/head
    identifiers only; client refetches authorized current projection.
74. **D32-AC074 — Non-enumerating denial.** Counts, URLs, errors, and history do
    not reveal hidden action, source, actor, or recipient facts.

### Protected data and propagation

75. **D32-AC075 — Identifier-only outbox.** Source-end intent carries strict
    identifiers, action/reason codes, schema version, and safe correlation only.
76. **D32-AC076 — No body in task.** Task status/history/title/list facts do not
    copy D30 explanation, anchor content, or arbitrary source text.
77. **D32-AC077 — No body in provider.** Inngest event/run/step/error history
    contains no protected feedback, CMS body, actor email, or broad source row.
78. **D32-AC078 — No body in telemetry.** Logs, traces, metrics, analytics,
    alert labels, and error messages remain body-free and low-cardinality.
79. **D32-AC079 — No body in notification.** Source-end notification preview or
    grouping never copies feedback or becomes a completion receipt.
80. **D32-AC080 — No body in search/AI.** Task search, vector index, AI context,
    recommendation, and summary exclude protected feedback/status reason detail.
81. **D32-AC081 — No body in comments.** Completion/end events cannot auto-create
    a comment, paste reviewer prose, or mention collaborators.
82. **D32-AC082 — No body in exports.** Generic task/report exports contain safe
    codes/labels only and cannot bypass source records class.
83. **D32-AC083 — Current detail auth.** Completed/inapplicable task detail
    reloads explanation/anchor only under current D30 source-purpose permission.
84. **D32-AC084 — Body disposal independence.** Quarantine/disposal of readable
    feedback leaves body-free action/task history valid and never restores body.
85. **D32-AC085 — Actor minimization.** List/history names a source actor only
    when current role/purpose permits; otherwise it uses safe attribution.
86. **D32-AC086 — Restricted context.** Missionary/member-care/location, donor,
    payment, finance, and security facts never enter D32 projection by default.
87. **D32-AC087 — Client persistence.** Protected completed-task detail is not
    stored in localStorage, service worker/offline cache, analytics, or URL.
88. **D32-AC088 — Screenshot-conscious list.** My tasks and manager aggregates
    remain useful without displaying protected feedback snippets.

### Projection, Inngest, performance, and operations

89. **D32-AC089 — Source reload.** Every projection worker reloads/claims current
    source/task state instead of trusting event payload state.
90. **D32-AC090 — Retry-safe step.** A retried step that committed before timeout
    returns/reuses the same projection effect.
91. **D32-AC091 — Cancellation-safe.** Inngest cancellation between steps or
    deploy interruption cannot roll back source or create conflicting status.
92. **D32-AC092 — Final failure visible.** Exhausted projection retries create a
    body-free owned dead letter and leave source discovery/current read truthful.
93. **D32-AC093 — Provider outage.** Inngest outage leaves durable intent and an
    alternate/recovery executor can converge without changing product identity.
94. **D32-AC094 — Provider replacement.** Removing Inngest changes no source,
    task policy, action/reason, recipient, history, or idempotency meaning.
95. **D32-AC095 — No wait-for-human run.** No long function sleeps/waits for a
    person; source action and projection are separate durable occurrences.
96. **D32-AC096 — Tenant fairness.** Worker concurrency/scan ordering prevents a
    large Tenant from starving another without being used as correctness lock.
97. **D32-AC097 — Bounded set closure.** One source action closes its bounded
    recipient assignments set-wise/idempotently without unbounded per-row calls.
98. **D32-AC098 — Cursor lists.** Active/history lists use stable cursor
    pagination and authorize before totals; no client security filtering.
99. **D32-AC099 — Indexed current head.** Active suppression/status queries use
    indexed typed scope/head/reason fields, not body or unbounded JSON scans.
100.  **D32-AC100 — Batched applicability.** One page re-proves current
      applicability through a bounded typed/batched seam without N+1 body loads.
101.  **D32-AC101 — Lazy detail.** Protected source detail loads only on
      authorized demand and never to compute list completion/status.
102.  **D32-AC102 — Repair command.** Projection drift has an owner-only audited,
      idempotent source-derived reconciler; direct SQL/manual completion is barred.

### Migration and rollout

103. **D32-AC103 — Discriminant before writer.** Completion policy/reason schema
     and old-writer denial land before any source-controlled task exists.
104. **D32-AC104 — Reader compatibility.** Old readers safely omit/render
     source-controlled tasks read-only; no old UI presents usable completion.
105. **D32-AC105 — New reader/old schema.** New code handles absent policy data
     safely and does not guess source-controlled completion.
106. **D32-AC106 — No inferred backfill.** Old `completed` task rows, comments,
     content diffs, notifications, timestamps, and audits create no D32 result.
107. **D32-AC107 — Shadow proof.** Shadow compares action scopes, current end,
     reason, recipients, active suppression, and expected controls without users.
108. **D32-AC108 — One completion writer.** No period permits task and source to
     write competing completion truth for the same source-backed work.
109. **D32-AC109 — Cohort fence.** Source/Tenant cohort activation and kill
     switch stop new projection while preserving source truth/history.
110. **D32-AC110 — Mixed-version event.** Unsupported schema/reason versions
     dead-letter safely and never default to **Completed**.
111. **D32-AC111 — Rollback after writes.** Rollback keeps durable rows readable/
     ignored safely and source discovery complete; it never deletes/relabels.
112. **D32-AC112 — Roll-forward.** Source-derived reconciliation is the primary
     repair after durable writes, not destructive rollback.
113. **D32-AC113 — Existing manual tasks preserved.** Migration does not convert
     independently lifecycle-owned/manual tasks to source-controlled policy.
114. **D32-AC114 — Cross-domain admission.** Mobilize/finance/later sources use
     source-controlled policy only after their exact action/end/reason contract
     and authorization tests are ratified.

### Test, accessibility, traceability, and zero effects

115. **D32-AC115 — Positive partial journey.** Maria's Page source success closes
     only her final Page assignment while Joel's Navigation work remains active.
116. **D32-AC116 — Positive episode journey.** Final required source scope end
     reconciles shared task/attention with exact reason and fresh review state.
117. **D32-AC117 — Negative completion matrix.** Every UI/API/RPC/bulk/shortcut/
     drag/swipe/import/AI/support path fails to complete source-controlled work.
118. **D32-AC118 — Reason matrix.** Success, cancellation, supersession,
     inapplicability, handoff, access loss, source outage, and recurrence produce
     distinct authorized outcomes.
119. **D32-AC119 — Race matrix.** Duplicate, lost response, action/action,
     success/cancel, handoff/action, revoke/action, active/end, out-of-order,
     replay, cancellation, and >24-hour retries converge correctly.
120. **D32-AC120 — Authorization poison matrix.** Wrong Tenant/Site/role/
     recipient plus browser/service/RPC/support/AI/cache/Realtime/export paths
     expose no completion or protected fact.
121. **D32-AC121 — Accessibility proof.** Automated plus manual keyboard,
     screen-reader, focus, 320px, 400% zoom, forced colors, reduced motion,
     target-size, touch, RTL/CJK, status, and task-removal tests pass.
122. **D32-AC122 — Weak-network proof.** Offline, timeout, ambiguous source
     success, stale cache, projection lag, and retry preserve truthful active/
     end behavior and source receipts.
123. **D32-AC123 — Comprehension proof.** Representative staff can explain why
     there is no checkbox, where work completes, what their task status means,
     and whether Website/Giving changed without coaching.
124. **D32-AC124 — Production proof.** Production-shaped 0/1/2/50 recipients,
     multi-action recipients, multi-Site/Tenant, paging, source outage, and lag
     meet declared budgets without auth shortcuts.
125. **D32-AC125 — Traceability proof.** D32 terms/policy/reasons/rules/numbers
     match decision log, glossary, ADR, OpenSpec, design, tickets, tests, and
     release evidence by D32-AC ID.
126. **D32-AC126 — Absolute non-effects.** Task closure projection creates no
     independent publication, review approval, candidate mutation, permission,
     message, reminder, date, Giving/finance, AI privilege, or performance score.

## Named monitors and required responses

| Signal                                            | Threshold                                                                   | Owner                               | Required response                                                                                                                    |
| ------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `source_task_false_source_completion_total`       | Any (`>0`)                                                                  | Website Security + Tasks Platform   | Critical fence/incident; disable mutation path, preserve evidence, restore through source roll-forward, audit all affected episodes. |
| `source_task_generic_completion_attempt_total`    | Any successful attempt; alert if denied attempts >10/hour/source            | Tasks Platform                      | Successful attempt is stop-ship; for denied burst identify stale client/automation, disable it, preserve policy denial.              |
| `source_task_policy_conversion_total`             | Any source-controlled→other conversion                                      | Security + Database                 | Fence writer, inspect scope/history, repair immutable policy and constraint before release.                                          |
| `source_task_cross_tenant_end_total`              | Any                                                                         | Security Incident Commander         | Disable worker/read path, contain exposure/work loss, investigate every Tenant, repair composite integrity.                          |
| `source_task_wrong_actor_attribution_total`       | Any confirmed mismatch                                                      | Source owner + Audit Platform       | Correct via append-only projection repair, never rewrite source receipt; fix actor mapping and affected reports.                     |
| `source_task_success_reason_mismatch_total`       | Any non-success displayed Completed or success displayed other reason >300s | Tasks Platform + source owner       | Suppress stale history, reconcile from source receipt, fix reason registry/precedence.                                               |
| `source_task_action_scope_overclose_total`        | Any unrelated recipient/scope closed                                        | Website Source + Security           | Fence adapter, restore active presentation from source, inspect all same-contract episodes, add race test.                           |
| `source_task_action_scope_underclose_age_seconds` | Any satisfied scope active >300s                                            | Tasks/Workflow Operations           | Reconcile, inspect outbox/reader suppression, repair projection; escalate at 30 minutes.                                             |
| `source_task_stale_active_read_total`             | Any actionable detail/action served after authoritative end                 | Website API + Authorization         | Disable affected cache/read, purge, fix current-head reproof, inspect access/action logs.                                            |
| `source_task_access_loss_completion_total`        | Any access loss labelled success                                            | Security + Product                  | Remove history projection, repair reason mapping, review privacy exposure and all same-path tasks.                                   |
| `source_task_projection_lag_seconds`              | p95 >60s for 15m or any >300s                                               | Workflow Operations                 | Recover ledger, inspect DB/executor, preserve source-current read suppression, pause expansion if sustained.                         |
| `source_task_dead_letter_age_seconds`             | Any unowned >15m or unresolved >60m                                         | Workflow Operations + adapter owner | Assign incident, prove current source state, repair/replay idempotently or use alternate executor.                                   |
| `source_task_duplicate_end_effect_total`          | Any                                                                         | Tasks Platform + Database           | Fence worker, choose source receipt as authority, repair duplicate projection append-only, fix uniqueness/claim.                     |
| `source_task_old_active_regression_total`         | Any ended scope becomes active without successor identity                   | Tasks Platform                      | Remove regression, repair monotonic head/version check, inspect all delayed events.                                                  |
| `source_task_protected_body_propagation_total`    | Any body in task/event/log/search/AI/export/cache                           | Privacy/Security + sink owner       | Stop sink, quarantine/purge governed copies, investigate producer/logs, add negative fixture.                                        |
| `source_task_revocation_visibility_lag_seconds`   | Any protected presentation >60s after denial                                | Authorization + Security            | Purge cache/session, block path, fix invalidation/reproof, run poison matrix.                                                        |
| `source_task_active_list_latency_ms`              | p95 >500ms for 15m                                                          | Tasks Platform + Database           | Inspect index/plans/batching, tune/fair-page without stale/auth shortcut.                                                            |
| `source_task_source_detail_latency_ms`            | p95 >1,000ms for 15m                                                        | Website API                         | Optimize typed detail/batch seam without broad prefetch/body cache.                                                                  |
| `source_task_tenant_fairness_ratio`               | Largest-Tenant oldest projection lag >3× median for 15m                     | Workflow Operations                 | Repair tenant-keyed concurrency/scan fairness; never drop or rate-limit required effects.                                            |
| `source_task_inngest_duplicate_effect_total`      | Any                                                                         | Workflow Platform                   | Treat as product-idempotency defect, fence function, repair claim/unique key, reconcile.                                             |
| `source_task_mobile_action_success_ratio`         | <90% or >5-point gap vs desktop in pilot                                    | Product UX + Accessibility          | Block expansion, study exact source navigation/focus/network failure, repair and retest.                                             |
| `source_task_accessibility_serious_total`         | Any unresolved serious/critical before Live                                 | Accessibility owner                 | Block activation, fix shared policy-aware UI, rerun manual/automated matrix.                                                         |
| `source_task_completion_comprehension_ratio`      | <90% correctly distinguish task/source/end reasons                          | Product Research + Tasks Product    | Revise copy/composition/action grain, repeat study; do not add training or independent checkbox first.                               |
| `source_task_stuck_coarse_scope_ratio`            | >5% active >7d after recipient reports their part done in pilot             | Website Product + Research          | Study source action grain; add proven typed sub-action/end if justified, never task-only completion.                                 |

## Ruthless synthesis

### Resolve before recording

1. Choose Option 1 at exact assigned source-action grain, not whole-episode-only.
2. Require one immutable code-owned completion-authority policy; no Tenant toggle.
3. Deny generic completion across UI/API/bulk/old-client/AI/support/import seams.
4. Require source receipt/CAS and distinct success, inapplicable, handoff, and
   access-loss reasons with truthful actor attribution.
5. Preserve independently lifecycle-owned/manual task completion under separate
   policy, consistent with ADR-0054.
6. Require current reads to suppress stale active work while eventual projection
   catches up and keep Inngest subordinate.

### Capture in later spec/design

- Closed task-policy registry and mixed-policy operation/action matrix.
- Exact Website action-scope/end/reason registry and per-assignment memberships.
- Source receipt, outbox, monotonic projection head, body-free history, and
  reconciliation model.
- Composite integrity, RLS/grants/RPC/privileged parity, retention, and audit.
- Full Base Maia list/detail/source/history/error/access UX and D33 handoff.
- Compatibility matrix, shadow comparison, pilot gates, kill switch, and
  roll-forward runbooks.
- Cross-domain admission rules; Mobilize must prove its own actions and reasons.

### Mandatory safeguards

1. Source CAS and product uniqueness, never generic task update or provider key.
2. Policy denial at server before any source-controlled writer.
3. Relational action scopes and typed end reasons, no authoritative JSON/text.
4. Reference-not-copy protected detail and identifier-only events.
5. Current authorization/head on list, detail, action, history, worker, cache,
   support, AI, Realtime, import/export, and reconciliation.
6. Additive one-writer rollout with old-client denial and no inferred backfill.

### Implementation order

1. Ratify D32 and glossary/ADR/OpenSpec delta; answer D33.
2. Define exact Website action/end/reason contracts and Phase 12 capabilities.
3. Reconcile shared task target with current contribution/admin/missionary seams.
4. Land policy discriminant, reason/head integrity, server denials, readers,
   audit, and source receipt/outbox before writers.
5. Build policy-aware shared UI and source actions; prove current-state
   suppression and all races.
6. Shadow, pilot one bounded cohort, monitor, then expand source by source.

### Monitor rather than pre-build

- Whether source action scopes are too coarse: use the stuck-coarse-scope and
  comprehension signals; improve source modeling, not a checkbox by default.
- Whether source-controlled tasks feel unfamiliar: use mobile/action and
  comprehension evidence; improve copy/navigation rather than dual state.
- Whether Inngest is the smallest executor: compare lag, duplicates, dead
  letters, operator effort, portability, and cost against a simple worker.

## ADR and glossary reconciliation

### ADRs

- **Amend ADR-0181** with source-action-scoped correction closure, typed end
  reasons, source receipt authority, and task-projection non-authority.
- **Preserve ADR-0054.** It permits independently lifecycle-owned Mission Control
  follow-up status while forbidding it from clearing cause truth. D32 adds a
  different task-policy kind for projections whose own closure is source-
  controlled; it does not repeal task-owned completion where explicitly owned.
- **Do not change ADR-0027 or ADR-0182.** Notification engagement and review-lane
  responsibility remain separate.
- **Amend ADR-0183** to own the closed completion-authority distinction across
  domains: source-backed action projections close from source scopes, while
  independently lifecycle-owned human follow-up may own only task completion.
  D32 does not turn ADR-0054 into a universal task ADR.

Exact ADR-0181 addition:

> A Website correction task is a `source_controlled` projection bound to exact
> source-action scopes. It exposes no generic task-completion operation. A
> recipient presentation closes when its final assigned source-action predicate
> ends; other required scopes and the correction episode remain independent.
> Source receipt/head and typed reason alone prove success, inapplicability, or
> handoff. Task, notification, worker, and engagement state cannot clear or
> execute Website correction truth.

### Glossary

Add:

> **Completion authority** (Phase 24 D32): The closed code-owned task policy
> declaring which domain can end one task's actionable lifecycle. A D31 source-
> backed Website task is `source_controlled`; a separately owned manual or
> human-follow-up task may be `task_owned_follow_up`. It is not a Tenant
> preference or mutable task field.
>
> _Avoid_: completion toggle mode; workflow status setting; task type label;
> user preference.

> **Source-action scope** (Phase 24 D32): The exact typed, versioned unit of
> source work assigned to one or more recipients, with a source-owned current
> actionability and end predicate. It permits Maria's Page work to end without
> ending Joel's Navigation work or the whole correction episode.
>
> _Avoid_: checklist text; reviewer sentence; anchor label; task substatus; AI-
> inferred work item.

> **Source end reason** (Phase 24 D32): The source-owned typed explanation for
> why an action/task projection is no longer actionable, such as satisfied,
> no-longer-required, reassigned, or returned. D33 uses returned-for-
> reassignment only when no responsible recipient remains; access loss remains
> authorization state and never masquerades as successful completion.
>
> _Avoid_: generic completed; closed by worker; hidden; dismissed.

## Subsequent D33 resolution

D33 accepts source-validated return or handoff. **This needs someone else**
opens one source-led responsive flow; browsing writes nothing, and one current
expected-head source command owns the transition.

- A named eligible successor produces **Reassigned** without duplicating an
  existing compatible task or unread state.
- Return names no successor, preserves other current responsible recipients,
  and produces **Returned**.
- Only when nobody remains does return produce **Returned for reassignment**
  plus source **Needs assignment**.
- Proved zero, Needs assignment, and indeterminate remain distinct;
  indeterminate/partial proof never mutates or guesses a fallback.
- Assignment grants no access, engagement never transfers, and Tasks Hub,
  Payload, notification, AI, and Inngest remain non-authoritative.

The complete decision is in the
[D33 adversarial review](./phase-24-d33-source-validated-return-handoff-adversarial-review.md)
and [primary research](./phase-24-d33-source-validated-return-handoff-primary-research.md).

## Evidence index and limits

### Core

- [ADR-0027](../../adr/0027-one-notification-presentation-and-engagement-model.md)
- [ADR-0054](../../adr/0054-cause-owned-accounting-exceptions-with-shared-follow-up.md)
- [ADR-0181](../../adr/0181-source-authorized-candidate-scoped-external-review.md)
- [ADR-0183](../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)
- [D31](./phase-24-d31-source-owned-correction-attention-adversarial-review.md)
- [Platform boundaries](../../../openspec/specs/platform-boundaries/spec.md)
- [Current Mission Control task migration](../../../supabase/migrations/20260526193000_mission_control_tasks.sql)
- [Current task service](../../../packages/api/src/admin/mission-control-tasks/service.ts)
- [Current workflow ledger](../../../packages/api/src/workflows/ledger.ts)

### Primary external

- [Microsoft Power Automate approvals](https://learn.microsoft.com/en-us/power-automate/get-started-approvals)
- [GitHub pull-request reviews](https://docs.github.com/en/pull-requests/reference/pull-request-reviews)
- [Salesforce Orchestration work items](https://help.salesforce.com/s/articleView?id=platform.orchestrator_concepts_work_items.htm&language=en_US&type=5)
- [Microsoft Planner assignments](https://support.microsoft.com/en-US/Planner/assign-people-to-tasks)
- [Microsoft Graph Planner versioning](https://learn.microsoft.com/en-us/graph/api/resources/planner-overview?view=graph-rest-1.0)
- [Asana task ownership](https://help.asana.com/s/article/understanding-tasks)
- [Inngest idempotency](https://www.inngest.com/docs/guides/handling-idempotency)
- [Inngest retries](https://www.inngest.com/docs/guides/error-handling)
- [Inngest cancellation](https://www.inngest.com/docs/features/inngest-functions/cancellation)
- [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

No external source proves Core's exact completion policy. The recommendation is
a repository-governed product judgment: task-authoritative products support the
strongest alternative, while approval/review systems and Core's source-action
model support action-owned closure. The exact numeric monitoring thresholds are
initial pilot gates, not industry constants.

## Subsequent D35 resolution

D35 adds one source-controlled coordinator task action, **Assign returned
Website work**. It assigns correction responsibility through the D33 Website
source command and has no independent Complete, Reopen, Reassign, Delete,
Dismiss, Snooze, claim, date, reminder, comment, bulk, or drag transition. One
shared task identity supports personal assignments/engagement, while the first
current expected-head source assignment/end receipt alone ends applicable
recovery scopes. See the [D35 adversarial record](./phase-24-d35-shared-lane-optional-recovery-coordinators-adversarial-review.md).
