# Phase 24 D32 — source-backed task completion primary research

Date: 2026-08-28  
Status: research evidence for the Phase 24 Grill session  
Decision under review: **source-controlled task closure only** versus
**independent subordinate completion with current-source recheck**  
Scope: the shared Tasks Hub completion contract for source-backed staff work
across Website/CMS, Mobilize, finance, Support, and later registered producers

This research does not implement a feature, amend OpenSpec, change an ADR,
write the canonical decision log or glossary, create a schema, or activate a
task producer. Its research-only outcomes use the **D32-RA** namespace so they
cannot be mistaken for canonical implementation acceptance criteria.

## Subsequent D33 reconciliation — 2026-08-28

D33 keeps D32 source-controlled closure and separates responsibility outcomes:
named successor is **Reassigned**; no-successor return is **Returned** while
other responsible people remain and **Returned for reassignment** with source
**Needs assignment** only when none remain. Neither is task completion or a
mutable assignee edit, and unknown candidate proof changes nothing. See the
[D33 adversarial review](./phase-24-d33-source-validated-return-handoff-adversarial-review.md)
and [primary research](./phase-24-d33-source-validated-return-handoff-primary-research.md).

## Research question

Should an authorized staff member be able to complete only their subordinate
Tasks Hub assignment while its authoritative source condition remains open?
Or should every source-backed task stay active until the source itself proves
that the exact assigned action is no longer required? Which permanent contract
best preserves clarity, personal agency, source truth, future cross-domain
reuse, accessibility, safety, and maintainability?

## Evidence labels

- **Repository fact** — directly supported by current Core source, accepted
  ADRs, governing OpenSpec, the glossary, or a completed Phase 24 decision.
- **Verified external fact** — directly supported by current official product,
  standard, security, database, accessibility, or workflow documentation.
- **Reasonable inference** — a bounded conclusion supported by facts, with the
  inferential step stated.
- **Product judgment** — the recommended Core choice; not claimed as a
  universal product or ministry fact.
- **Assumption** — plausible but not proved with representative nonprofit
  staff or production-shaped Core data.
- **Unresolved unknown** — evidence cannot settle it; the appropriate owner
  must resolve it before the relevant contract becomes Live.

## Executive finding

**Disposition: Accept Option 1 — source-controlled task closure only — with
one required precision amendment.**

The source closes the exact **source-action assignment predicate**, not
necessarily the whole parent episode. Maria's Page assignment can therefore
close from Page source proof while Joel's Navigation assignment and the
Website correction episode remain active. That is clear without being
inflexible.

The platform still needs a separate, closed task-owned policy for genuine
human follow-up such as an ADR-0054 finance evidence-delivery task or a Support
contact activity. That is not Option 2 applied to the same source-action
assignment. It is a different task contract whose deliverable is human
follow-up rather than source correction.

Every shared task selects exactly one code-owned **completion-authority
policy**:

1. **Source-controlled source-action closure — D32's decision**
   - no independent completion control;
   - the staff action opens the authoritative source;
   - the exact task projection remains active until the source says its
     assigned action is no longer required;
   - source correction, cancellation, supersession, authority loss, or
     inapplicability maps to truthful task history.

2. **Task-owned independent follow-up — preserved platform policy**
   - allowed only when the registered task contract names a separate human
     deliverable that can truthfully finish while a linked source remains open;
   - the visible action says **Done with my task**, not an unqualified green
     **Complete**;
   - a protected synchronous Tasks Hub command reauthorizes the actor and task,
     reloads the linked source and contract generation, and explains the
     remaining source condition before atomically recording only task-owned
     completion;
   - task completion never invokes, clears, hides, publishes, approves,
     releases, closes, or otherwise mutates source truth;
   - source state stays visible on source and manager surfaces;
   - later source change may create a new assignment generation, but never
     silently erase or relabel the earlier personal completion.

Tenant administrators cannot invent a third completion meaning or choose the
policy per task through a workflow builder in D32. Each task/source contract must
define:

- whether the task is a source action or separate follow-up;
- the exact source predicate or human deliverable;
- who may complete/reopen it;
- required typed evidence, if any;
- current-source and expected-version checks;
- source-open presentation and manager reporting;
- what happens when every subordinate task is done but source work remains;
- recurrence/new-work rules;
- retention and audit; and
- body-free asynchronous reconciliation.

### Immediate Phase 24 consequence

The Website Request changes task is source-controlled in v1:

- **Open Website work** is the primary action.
- No generic completion checkbox appears.
- If Maria's Page action and Joel's Navigation action become separately typed
  source predicates, Website may end Maria's exact projection when Page truth
  proves that action is no longer required even while Joel's remains.
- D30 free prose and one optional anchor cannot establish **Maria's part is
  done** and are never parsed or AI-classified to do so.
- A future Website human follow-up can use the separate task-owned policy only
  if its deliverable is not the Website correction action and a versioned
  contract proves that distinction.

This chooses amended Option 1 for source-backed action assignments without
forcing unrelated finance, Support, Mobilize, or manual follow-up into a source
closure model that does not describe their task.

## Why this is modern best practice

### Current first-party product evidence

| Primary source                                                                                                                                                         | Verified behavior                                                                                                                                                                                                              | Relevance                                                                                                                                                    | Limit                                                                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Contentful Entry Tasks API](https://www.contentful.com/developers/docs/references/content-management-api/entry-tasks/)                                                | An assignee can resolve an entry task; resolved and unresolved are task states; unresolved tasks block publishing; task resolution records resolver/time and can be reopened. Publishing remains a separate current operation. | Strong evidence that subordinate completion and source/publication state can be distinct while the source rechecks task state at its consequential boundary. | Contentful lets task assignees lack entry read access, an anti-pattern Core must reject. Task state also directly gates publish, which Core must adopt only through a source-owned rule. |
| [Sanity Studio Tasks](https://www.sanity.io/docs/user-guides/tasks)                                                                                                    | Assigned document tasks can be checked off; done tasks remain in history; unfinished tasks appear beside the document publish action.                                                                                          | Independent task completion can improve a personal inbox while document work and publish context remain visible.                                             | Sanity tasks are native content collaboration, not a proof that Core Website correction should permit a generic checkbox.                                                                |
| [GitLab merge-request homepage](https://docs.gitlab.com/user/project/merge_requests/homepage/)                                                                         | A reviewer's work can become inactive after they review while the merge request remains active waiting for other approvals.                                                                                                    | Direct evidence that one person's completed subordinate responsibility and the parent's unresolved status can coexist clearly.                               | Code review is not Tasks Hub and does not define Core task completion.                                                                                                                   |
| [GitLab merge-request approvals](https://docs.gitlab.com/user/project/merge_requests/approvals/)                                                                       | Individual reviewer status is separate from whether all required approvals are satisfied.                                                                                                                                      | Supports explicit personal completion plus independently derived aggregate/source readiness.                                                                 | Approval is structured and source-native; free-form Website correction work may not have equivalent proof.                                                                               |
| [GitHub pull-request reviews](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/about-pull-request-reviews) | Review conversations may be resolved independently; required requested-changes/approvals can still block merge; new commits can dismiss stale approvals.                                                                       | Shows subordinate completion, source gate, and source-generation invalidation as distinct facts.                                                             | GitHub's comment/review/branch-protection model is much richer than Core D32.                                                                                                            |
| [GitHub required status checks](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks)                 | Required checks must pass on the latest commit SHA; results from earlier commits do not satisfy the current source requirement.                                                                                                | Strong precedent for current-source generation recheck and new assignment/proof after material source change.                                                | CI checks are machine-produced, not human task completion.                                                                                                                               |
| [GitHub sub-issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/adding-sub-issues)                                                   | Sub-issues have independent identities and parent linkage; parent progress can report sub-issue completion.                                                                                                                    | Shows why subordinate work and parent state need separate grains and labelled counts.                                                                        | GitHub issues are themselves work authorities; a Core task is not Website/finance/Support truth.                                                                                         |
| [Asana Tasks API](https://developers.asana.com/reference/tasks)                                                                                                        | A task records completed, completed_at and completed_by independently and can retain an external source ID.                                                                                                                    | A durable personal completion fact can coexist with a referenced external source.                                                                            | Asana does not guarantee the external source is rechecked or remain authoritative.                                                                                                       |
| [HubSpot Tasks API](https://developers.hubspot.com/docs/api-reference/latest/crm/activities/tasks/guide)                                                               | Tasks have an owner, COMPLETED/NOT_STARTED status and associations to CRM records.                                                                                                                                             | CRM work commonly completes independently while the associated contact/deal remains.                                                                         | Associations do not prove correct source semantics or authorization.                                                                                                                     |
| [Salesforce task completion](https://help.salesforce.com/s/articleView?id=000385307&language=en_US&type=1)                                                             | A completed Task moves to Activity History for its associated record.                                                                                                                                                          | Personal work completion and ongoing record lifecycle are separate, familiar CRM concepts.                                                                   | Salesforce task completion is not source revalidation.                                                                                                                                   |
| [Dynamics 365 Sales activities](https://learn.microsoft.com/en-gb/dynamics365/sales/manage-activities)                                                                 | Staff mark a task/activity complete after performing it; activities remain associated with customer records and history.                                                                                                       | Supports an independent human-follow-up completion policy for CRM/Support-like activity.                                                                     | It does not protect a separate high-stakes source invariant.                                                                                                                             |
| [Dynamics 365 mobile activities](https://learn.microsoft.com/en-us/dynamics365/sales/sales-mobile/view-activities-record)                                              | Mobile users can complete, cancel, delete and reassign activities from record context.                                                                                                                                         | Demonstrates the expectation for low-friction mobile personal-work hygiene.                                                                                  | These generic controls are unsafe for Core source-backed tasks without policy filtering.                                                                                                 |
| [Blackbaud Raiser's Edge NXT actions](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/en-gb/content/bb-actions-manage-single.html)              | Staff mark a constituent action complete to record progress and remove it from the To-Do list while keeping history.                                                                                                           | Nonprofit CRM users encounter independent subordinate completion.                                                                                            | Cultivation actions are human activities, not source correction or finance truth.                                                                                                        |
| [Dynamics 365 Finance workflow task actions](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/fin-ops/organization-administration/workflow-actions)          | A developer-designed workflow task may complete, reject, delegate, request change, reassign or release; completing can advance the document workflow.                                                                          | Proves source-coupled completion is sometimes legitimate only when the source workflow deliberately defines it.                                              | It argues against a generic Tasks Hub **Complete** invoking arbitrary source commands.                                                                                                   |
| [GOV.UK complete multiple tasks pattern](https://design-system.service.gov.uk/patterns/complete-multiple-tasks/)                                                       | GOV.UK recommends starting with the smallest useful status set; completed tasks use plain black text so outstanding work gets emphasis.                                                                                        | Supports restrained state language and avoiding a triumphant green state when the parent/source remains open.                                                | The pattern is for service task lists, not Core's authority model.                                                                                                                       |

### What the evidence actually proves

**Verified external fact:** independent subordinate completion is common and
can coexist with a parent record, document, merge request, application, or
workflow that remains open. Source-controlled gates and source-generation
rechecks are also common.

**Verified external fact:** the products use different relationships:

- task completion may be mere personal/activity history;
- it may be one input to a current source gate;
- it may advance a source workflow when deliberately designed; or
- it may become stale when source content changes.

There is no universal meaning for **Complete task**.

**Reasonable inference:** the platform must support more than one completion-
authority policy, but one source-action assignment must have one unambiguous
owner of closure. Independent completion is modern for a separately defined
human follow-up task; applying it to the same source action would create shadow
source truth.

**Product judgment:** choose amended Option 1 for every source-action
assignment. Preserve independently completable human follow-up as a separate
task-owned contract. This is the strongest permanent path, rather than a
universal checkbox or an inflexible whole-episode wait.

## Current behavior, accepted intent and permanent path

### Current repository behavior

Core currently has several incompatible task-shaped surfaces:

- [Mission Control task types](../../../packages/api/src/admin/mission-control-tasks/types.ts)
  expose mutable open/in-progress/completed/dismissed/suppressed states but no
  completion-policy type, source generation, source applicability, expected
  version, subordinate outcome or source recheck contract.
- [Mission Control task creation](../../../packages/api/src/admin/mission-control-tasks/service.ts)
  creates task, links and event through separate dependency calls; it provides
  no completion command or atomic source-aware transition.
- [Admin Tasks](<../../../apps/admin/app/(app)/tasks/task-columns.tsx>) displays a
  generic completion toggle labelled **Mark task complete/incomplete** and
  uses an emerald checked state.
- [Admin task state](<../../../apps/admin/app/(app)/tasks/tasks-content.tsx>)
  mutates the collection directly and sets client-generated completion time.
- [Missionary Tasks](../../../apps/missionary/app/tasks/page-client.tsx)
  exposes complete/reopen behavior under a separate task surface.
- [Mission Control migration](../../../supabase/migrations/20260526193000_mission_control_tasks.sql)
  stores one mutable status/completed_at but no composite Tenant-safe
  source-completion relationship or source-backed completion policy.

These are current behaviors and migration inputs, not permission to place a
generic green checkbox on D31 work. Current local completion can become stale,
race with source state, accept client time, and hide open source work.

### Historical accepted intent entering D32

- [ADR-0183](../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)
  already required one cross-domain Tasks Hub, finite source contracts,
  reference-not-copy, current authorization, identifier-only intents and
  source-owned applicability/end. Entering this decision, it expressly
  reserved independent completion for D32 and forbade generic completion;
  D32 now resolves that reservation through the two-policy contract below.
- [ADR-0054](../../adr/0054-cause-owned-accounting-exceptions-with-shared-follow-up.md)
  says finance task completion, dismissal or suppression cannot clear the
  Accounting Exception Case; the task owns follow-up status separately.
- [ADR-0027](../../adr/0027-one-notification-presentation-and-engagement-model.md)
  separates source state, notification presentation, personal engagement and
  completion.
- D19/D20 establish that reading clears unread but not actionable source work.
- D30 protects reviewer feedback from task/comment copies.
- D31 creates one shared task identity with recipient assignment/engagement
  projections and makes source end inapplicability authoritative.
- [Workflow orchestration OpenSpec](../../../openspec/specs/workflow-orchestration/spec.md)
  keeps product records/idempotency/authorization authoritative and Inngest
  only the durable executor.
- [Platform boundaries](../../../openspec/specs/platform-boundaries/spec.md)
  require the shared Mission Control staff work model and guarded domain
  services.

### Best permanent path

Add one required **completion-authority policy key** to every admitted shared
task, from a small versioned code-owned registry:

- conceptual `source_controlled` authority for a source-action assignment; or
- conceptual `task_owned_follow_up` authority for a separately defined human
  follow-up.

Do not add:

- a tenant-authored completion rules language;
- one generic completion mutation shared by manual and source-backed tasks;
- completion by drag/drop or bulk checkbox without per-task policy evaluation;
- a workflow/Inngest completion state;
- source mutation from task status;
- task completion inferred from notification read, inactivity, due date,
  comment, reminder, email, worker success or provider response;
- D30 prose/anchor classification;
- hidden auto-reopen or auto-complete;
- a green source-success badge for subordinate completion; or
- one status field overloaded to mean staff effort, source resolution,
  cancellation, access loss and projection inapplicability.

## Corrected completion-authority model

### Policy A — source-controlled closure

The task projection is active exactly while its **source-action assignment
predicate** is true. It does not wait for the entire parent episode when the
source can prove a narrower action ended.

For example:

- a correction episode may still require both Page and Navigation work;
- Maria's task references the typed Page action predicate;
- the source proves Maria's Page action is no longer required after a valid
  source update;
- Maria's task closes from that source proof even while Joel's Navigation task
  and the parent correction episode remain open.

This precision removes the main UX objection to Option 1. Staff are not forced
to wait for unrelated work. They simply cannot self-assert that source-owned
work is done when the source has the facts to decide it.

Current first-party source-driven closure examples include:

- [GitHub linked pull requests and issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue):
  a linked issue automatically closes when the pull request merges into the
  default branch. The authoritative merge event—not a separate issue checkbox—
  causes the linked closure.
- [GitHub required checks](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks):
  the latest commit SHA owns whether a required check satisfies the current
  merge condition.
- [Jira sub-task blocking](https://support.atlassian.com/jira-cloud-administration/docs/configure-sub-tasks/):
  parent workflow conditions can prevent resolution until all required
  subordinate statuses satisfy the current rule.

These are analogies, not an instruction to copy their data models. They show
that source events and exact current predicates can close or gate associated
work without asking a person to maintain two truths.

#### When Policy A is required

Use source-controlled closure when:

- the task's imperative is the source action itself;
- source data can determine whether the exact assigned action remains
  required;
- completion could otherwise imply publication, approval, payment, release,
  donor communication, permission, compliance, safety, or external-provider
  success;
- several staff may act concurrently and only the source can determine the
  winning/current result;
- an ambiguous provider outcome requires source readback; or
- no independently meaningful human deliverable exists.

### Policy B — task-owned independent follow-up with linked-source recheck

This is a separate human follow-up task, not an independently completable copy
of the source-action assignment. Completing it means only:

> **This authorized person records that this exact assigned follow-up is
> finished under the named task contract and current source generation.**

It does not mean:

- the source condition is resolved;
- another assignee's work is done;
- a Website successor exists or is approved;
- content is published;
- money moved, reconciled, released, refunded or posted;
- a donor/missionary/support outcome occurred;
- a provider accepted anything;
- a control passed; or
- the task description was factually correct.

#### When Policy B is allowed

Independent completion is allowed only when all are true:

1. The task/source contract registers a named human deliverable distinct from
   the source action and source resolution.
2. A person can truthfully finish that deliverable while the source remains
   open—for example, making a phone call, gathering a document, handing work
   off, or recording a bounded source-permitted attestation.
3. The task contract defines any required typed evidence and the consequence
   of completion.
4. The source page remains discoverable and truthful after personal completion.
5. Manager/operations views separately show source state and task state.
6. The contract defines what happens if all subordinate tasks finish while the
   source condition remains.
7. A later source change defines whether new work creates a successor
   assignment generation.
8. Current authorization and source generation are rechecked synchronously.

This separate policy is compatible with ADR-0054's finance follow-up: a person can
finish a task such as gathering or communicating evidence while the Accounting
Exception Case remains authoritative and open until its own proof passes.
Support follow-up may similarly finish while a ticket waits on a customer or
provider. A future Mobilize source may register an equivalent human deliverable
only after that domain defines it; D32 invents none.

### Why no global tenant switch exists

A Tenant setting such as **Allow staff to complete source tasks** would flatten
incompatible meanings:

- Website correction;
- content review;
- Support contact attempt;
- finance evidence gathering;
- Mobilize field follow-up;
- provider readback; and
- donor-facing communication.

The completion authority belongs in a finite source work projection contract,
not tenant preference. Tenants may later control permitted task coordination
within safe bounds, but cannot redefine what business event **done** means.

## Strongest alternatives

### Universal Option 1 — source-controlled closure only

**Strengths**

- one visible state;
- no false personal success;
- no task/source reconciliation ambiguity;
- simplest reporting and migration;
- safest for Website, finance, publication and provider-sensitive work; and
- easiest to explain on mobile and to new staff.

**Material weakness**

Human follow-up sometimes has a valid endpoint before the parent case ends.
For example, a finance staff member may have contacted the accountant and
submitted requested evidence while the Accounting Exception waits for
readback. Preventing that task from leaving **My tasks** makes the personal
workload inaccurate and encourages staff to use comments, due-date hacks,
private lists or out-of-band tools.

**Verdict**

Correct default, not a complete cross-domain platform policy. The amended exact
source-action predicate prevents needless waiting where the source can observe
the assigned action. Policy B covers genuinely independent human follow-up.

### Option 2 — independently complete the same source-action assignment

**Strengths**

- familiar task checkbox;
- accurate personal workload;
- preserves an individual's effort history;
- supports human follow-up that a source cannot directly observe; and
- resembles modern CMS/CRM/nonprofit task products.

**Material weakness**

It can make **My tasks** and manager dashboards green while the source still
needs work. It requires reactivation, recurrence, all-completed/source-open,
reporting, privacy, concurrency and source-generation rules. Generic current
Core task controls provide none of those safeguards.

**Verdict**

Reject for source-action assignments. The source already owns whether that
action remains required. Preserve the underlying UX need through a separately
registered task-owned follow-up whose deliverable is not the source action.

### Generic Complete invokes the source action

This is valid only when a source deliberately renders its exact protected
command in Tasks Hub with the same wording, confirmation, evidence,
authorization and result presentation. It is not **task completion**; it is a
source action shown in another route.

The generic Tasks Hub cannot call arbitrary Website, CMS, Mobilize, Support or
finance commands from one checkbox. The
[Dynamics workflow task](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/fin-ops/organization-administration/workflow-actions)
example demonstrates why source developers define available actions per
workflow; it does not justify a platform-wide shortcut.

## Source, task and notification ownership

| Fact                                       | Owner                                      | Can change it                                                | Ends or affects                     |
| ------------------------------------------ | ------------------------------------------ | ------------------------------------------------------------ | ----------------------------------- |
| Source condition exists                    | Producer source                            | Exact protected source commands/events                       | Source condition only               |
| Exact source-action assignment predicate   | Producer source contract                   | Source transition/current responsibility+authorization       | Policy A task applicability         |
| Source correction/resolution evidence      | Producer source                            | Source proof/CAS                                             | Source lifecycle                    |
| Task completion policy                     | Code-owned source work projection registry | Versioned product release                                    | Allowed task controls/semantics     |
| Task-owned follow-up completion            | Shared Tasks Hub                           | Authorized assignee/task command after linked-source recheck | Only that follow-up task generation |
| Task assignment/queue/due/reminder/comment | Shared Tasks Hub under contract            | Authorized task operations                                   | Human coordination only             |
| Task source-inapplicability mapping        | Source event + Tasks Hub projection        | Idempotent reconciliation/current read ceiling               | Active task presentation/history    |
| Notification unread/read                   | ADR-0027 engagement model                  | Exact recipient                                              | Personal attention only             |
| Inngest run/step status                    | Workflow executor                          | Inngest/runtime                                              | Technical execution only            |

### Invariants

1. No task state changes source truth.
2. Every admitted shared task has exactly one completion-authority policy version.
3. Policy A exposes no independent task completion mutation.
4. Task-owned follow-up completion refers to one task assignment generation and
   the linked source generation observed at recheck.
5. Source end always makes the projection inapplicable regardless of task
   state.
6. Source state remains queryable and visible to its independently authorized
   audience when a task-owned follow-up completes.
7. A completed subordinate task cannot satisfy a source guard unless the
   source contract explicitly consumes that task fact as one bounded input and
   independently revalidates all source requirements. D32 grants no such
   consumer automatically.
8. Read/unread, archive, reminder, notification delivery and task completion
   are separate.
9. Recurrence/new source work never silently rewrites completed task history.
10. A source action rendered from Tasks Hub remains a source command, not a
    generic completion control.

## Staff UX and UI

### One task row, policy-specific action

The same shared Tasks Hub composition can serve both policies without making
staff learn internal architecture.

#### Policy A row

> **Correct the French Website review**  
> Hope.org · French (Canada)  
> **Correction still needed**  
> **Open Website work**

No checkbox, Done menu item, drag-to-Done lane, keyboard shortcut, bulk
completion or green success affordance appears. The detail says:

> **How this task is completed**  
> This task closes automatically when Website confirms that this action is no
> longer needed.

If Maria finishes the Page action and Website proves that exact predicate
ended, her row moves to Recent even while the parent correction header says
**1 action still needed** for Joel.

#### Task-owned follow-up row

> **Send the accountant the requested reconciliation evidence**  
> Accounting exception · Hope Ministries  
> **Your follow-up is in progress**  
> The accounting exception remains open until Finance verifies the evidence.  
> **Open finance record** · **Done with my task**

The visible action is **Done with my task**, not **Resolve exception** or an
unqualified completion checkbox. A short inline consequence appears before the
button in the detail page; routine completion should not add a second
confirmation modal when it is reversible and no extra evidence is required.

### Completion interaction

Task-owned follow-up completion:

1. Happens on the route-addressable task detail or an equally contextual
   expanded row, not a tiny unlabeled circle.
2. Presents source state and exact subordinate meaning before the action.
3. Uses one deliberate button with a stable label.
4. Shows required typed evidence fields only when the registered task contract
   requires them.
5. Retains inputs and context across validation/network failure.
6. Returns one truthful receipt:

> **Your task is done**  
> The accounting exception is still open while Finance verifies the evidence.  
> **View source** · **Undo**

7. Moves focus to the next logical item or a persistent status region after
   the row leaves the active list; it never drops focus to the document body.
8. Offers **Undo** only while current authorization/source/task policy still
   permits reopening; undo appends history rather than deleting completion.

### Status vocabulary

Use two visibly labelled dimensions when the task-owned follow-up policy applies:

| Dimension | Examples                                                                             | Avoid                                           |
| --------- | ------------------------------------------------------------------------------------ | ----------------------------------------------- |
| My task   | Assigned; In progress; Done with my task; Reopened; No longer needed                 | Resolved Website; Finance fixed; Support closed |
| Source    | Correction still needed; Waiting for source evidence; Resolved by source; Superseded | Hidden after my task; inferred green            |

GOV.UK's current task-list guidance recommends starting with the smallest
status set and presenting completed work as plain black text so outstanding
work receives emphasis. Core should not use an emerald check as the primary
signal for **Done with my task** while a source condition remains open.

### Manager and source views

Manager/source-owner views never collapse the two dimensions into one progress
percentage without labels. They show:

- source conditions open;
- active subordinate tasks;
- subordinate tasks done;
- source-backed tasks made inapplicable by source end;
- zero/indeterminate routing;
- source still open with no active subordinate task; and
- freshness of projection versus source generation.

Counts use explicit grains:

- **3 source cases still open**;
- **2 active staff tasks**;
- **4 staff follow-ups done**.

Never show **4 of 4 complete** without simultaneously saying whether the
source is still open. Task completion is not source progress unless the source
contract independently defines and recomputes that exact progress.

### Mobile, low bandwidth and international use

- The source state and completion consequence appear before the completion
  control on narrow screens.
- A task cannot be completed by swipe, drag or an unlabeled icon alone.
- The action has a generous touch target, visible focus and text label.
- Completion uses one small synchronous command and returns a compact receipt;
  it does not load rich CMS content or D30 feedback.
- Offline mode does not optimistically finalize completion. The UI may show
  **Saving…** locally, then reconciles the server receipt.
- If the response is lost, reopening uses the idempotency receipt rather than
  asking the user to repeat blindly.
- All chrome localizes; task/source terms remain distinct in each language.
- International names, RTL, CJK and mixed direction render safely.
- Dates are viewer-localized but server-generated source/task instants remain
  authoritative.

## Completion command and lifecycle

### Task-owned follow-up protected command

The completion command accepts only:

- task identity;
- expected task/assignment generation;
- one client-generated semantic idempotency key;
- task-contract-defined typed evidence fields, if any; and
- optional UI return context that carries no authority.

It does not accept Tenant, source state, source generation, actor, assignee,
completion policy, completed_at, source outcome, authorization, audit
attribution or recipient role from the caller.

The server:

1. derives active Tenant, actor Party/profile and current role context;
2. loads the task, exact source link, projection contract and expected
   assignment generation;
3. rejects completion for Policy A and returns the source-led next action;
4. calls the registered source adapter to load current applicability,
   generation, visibility and actor authorization;
5. if the source/action is already inapplicable, maps that exact source end
   rather than inventing a personal completion;
6. if the source generation changed incompatibly, rejects stale completion and
   returns current context;
7. validates any closed typed evidence contract;
8. atomically appends the subordinate-completion occurrence, task event,
   current task projection and immutable idempotency receipt;
9. writes no source mutation;
10. returns both task and source facts in the response.

The command is synchronous because the user needs an immediate, authoritative
answer about their own task. Inngest must not decide whether the click
succeeded.

### Policy A lifecycle

Conceptually:

**active → source_action_satisfied | source_cancelled | source_superseded |
source_not_applicable | responsibility_or_authority_ended**

The source-action predicate may end independently of its parent source episode.
Task history records the precise mapping; it does not label access loss or
supersession as staff completion.

### Task-owned follow-up lifecycle

Conceptually:

**active → staff_completed**

and, where the contract allows and current checks pass:

**staff_completed → reopened → staff_completed**

Source end can occur from any current task state:

- **source_ended_before_staff_completion**; or
- **source_ended_after_staff_completion**.

These are two pieces of historical evidence, not competing terminal states.
Implementation may use append-only events plus a current projection instead of
encoding every combination in one status enum.

### Reopen and correction

Independent completion must be safely correctable:

- an immediate **Undo** appears in the success state when reauthorization says
  reopen is still available;
- a later **Reopen my task** action may appear in history if the source remains
  applicable, the assignment generation is still current and the actor is
  authorized;
- reopen appends an event and advances task version; it never deletes
  completed_at/by history;
- if the task was reassigned, source-ended or superseded, the stale actor
  cannot reopen it;
- a manager may reopen only through an expressly authorized task policy, not
  universal admin power; and
- new source work normally creates a successor assignment generation rather
  than silently reopening an old completed fact.

### All subordinate tasks done while source remains open

This state must be designed, not treated as impossible.

Each task-owned follow-up contract classifies the linked source condition after
completion:

- **waiting_without_staff_action** — no active task is expected while the
  source waits for customer/provider/evidence/time; source remains visible in
  its truthful waiting state; or
- **staff_action_still_required** — the source proves work remains but no
  active assignment exists; this is a protected routing gap, not source
  completion.

Core never:

- marks the source green;
- auto-reopens every completed task;
- chooses the last completer or broad administrator;
- changes a completed outcome to incomplete silently;
- creates recurring reminders by default; or
- hides the open source from independently authorized users.

The source resolver may create a new assignment generation only when a
meaningful new/current source-action predicate justifies it.

## Cross-domain application

### Website/CMS

Default to Policy A. Content edits, navigation changes, candidate successor
creation, review readiness and publication are source-owned and observable.
The source can close exact Page/Navigation task predicates separately where it
has structured proof.

A manual CMS task such as **Obtain legal approval wording from counsel** could
use the task-owned follow-up policy only if it is modeled as a distinct human follow-up and its
completion does not claim that counsel approved or that the Page is ready. D32
does not invent such a task.

### Mobilize

Future Mobilize producers must choose policy per typed action:

- source-record mutations, approvals, stage transitions or external outcomes
  use Policy A;
- independently meaningful human follow-up may use the task-owned policy.

No current evidence establishes specific Mobilize task types. Names such as
contacting a person or gathering documents are illustrative only.

### Finance

ADR-0054 already separates Accounting Exception truth from Mission Control
follow-up. Therefore:

- source/provider/accounting correction, readback, release, reconciliation and
  case proof use Policy A/source commands;
- bounded human follow-up such as delivering requested evidence may use Policy
  B;
- a completed task never clears a block, changes money, records provider
  success, releases work or decides accounting materiality; and
- task evidence cannot substitute for a provider/source readback unless the
  finance source contract explicitly admits a typed attestation and performs
  its own source transition.

### Support

The Support ticket/conversation owns its status, customer response, privacy,
assignment and resolution rules. A separate follow-up call or internal
coordination task may complete under the task-owned policy while the ticket remains waiting.
A source command such as **Close support ticket** stays Policy A and must retain
Support's exact confirmation, authorization and audit.

### Manual Tasks Hub work

Manual tasks not backed by an authoritative source condition use the ordinary
manual completion policy governed by Tasks Hub. They are not forced into
Policy A/B source rechecks merely to share UI components.

The platform therefore has a closed distinction:

- manual task completion;
- source-controlled task closure; and
- independently completable source-backed follow-up.

The UI derives allowed controls from the trusted task kind/policy, never from
source_module strings or client flags.

## Races, temporal correctness and idempotency

| Race or late event                                     | Required result                                                                                                                                       |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Staff completion vs source action end                  | One transaction observes the current source generation. If source end won, map source end; otherwise record only subordinate completion.              |
| Completion vs reassignment/takeover                    | Expected assignment generation permits one current actor; stale actor gets current owner/context and writes nothing.                                  |
| Completion vs role/membership revocation               | Final current authorization denies; query-time policies already remove visibility.                                                                    |
| Duplicate click/lost response                          | Same idempotency key and canonical meaning returns the original receipt; changed meaning rejects.                                                     |
| Completion retried after 24 hours                      | Product DB identity/receipt still deduplicates; workflow/provider windows are irrelevant.                                                             |
| Completion vs reopen                                   | Task version/CAS serializes; append-only events preserve both attempts.                                                                               |
| Reopen vs source end                                   | Source end wins applicability; no reopened active task survives.                                                                                      |
| Old source generation vs new source work               | Stale task cannot complete current work; new meaningful work creates/updates the correct assignment generation.                                       |
| All tasks complete vs new source action                | No inferred source completion; source resolver emits a new generation only from current structured state.                                             |
| Worker receives completion before task materialization | Product intent/current task command reconciles by stable identity or safely retries; no orphan completion.                                            |
| Source-end event is delayed                            | Read-time source applicability prevents stale active presentation; async worker repairs history/projection.                                           |
| Source recurs after task history retention             | New source occurrence/task generation; prior completion never suppresses it.                                                                          |
| Bulk completion includes mixed policies                | Source-action tasks reject; task-owned follow-ups each reauthorize/recheck and return per-item outcomes. Initial release should omit bulk completion. |
| Clock skew/backdated client value                      | Database/server time and monotonic versions own order; client completed_at is ignored.                                                                |

No source-backed completion is last-write-wins. The durable identity includes
Tenant, source work occurrence, shared task, assignment generation, completion
policy version and semantic action. A task title, timestamp, route, actor name,
Inngest event/run ID or notification ID is not an idempotency key.

## Database and authorization safety

### Conceptual persisted facts

This is a contract, not a frozen schema.

1. **Task completion policy registration**
   - code-owned key/version;
   - allowed task kind/source contract;
   - source adapter;
   - allowed completer relationship;
   - evidence contract;
   - reopen policy;
   - source-open presentation;
   - all-completed/source-open classification;
   - recurrence behavior.

2. **Task assignment generation**
   - Tenant, shared task and source-work identity;
   - assignee/queue relationship;
   - generation/version;
   - current task policy;
   - source generation admitted at assignment;
   - active/inapplicable projection;
   - no protected source body.

3. **Subordinate completion occurrence**
   - Tenant and assignment generation;
   - server-derived actor/role;
   - policy version;
   - source generation observed at recheck;
   - typed outcome/evidence reference;
   - server time;
   - semantic idempotency key/receipt;
   - append-only correction/reopen lineage.

4. **Current task projection**
   - derived active/done/reopened/source-ended presentation;
   - never source truth;
   - rebuildable from product records.

### Structural constraints

- Composite Tenant-aware keys/foreign keys connect task, assignment,
  completion, source link, actor and evidence.
- One current assignment generation exists per admitted relationship.
- One successful completion occurrence exists per semantic completion key.
- Policy A has a database/application invariant forbidding a
  staff-completion occurrence.
- Task-owned completion references the exact registered policy version.
- Completion/reopen events are append-only; current projection can be rebuilt.
- Task deletion cannot cascade into source history or immutable completion
  evidence.
- Assignment/access loss cannot rewrite historical actor attribution.
- Current source generation is stored as evidence, not as copied mutable source
  truth.
- Server/database time is non-null; caller time is display-only at most.

### RLS, grants and trusted context

PostgreSQL's current
[row-security documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
and Supabase's current
[RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security)
require attention to table-owner/service bypass, grants, existing-row
**USING** and resulting-row **WITH CHECK** behavior.

The final boundary must:

- revoke anonymous writes and all unnecessary authenticated grants;
- authorize list, detail, complete, reopen, bulk, export and source navigation
  separately;
- restrict task-owned follow-up completion to the exact current allowed completer;
- derive Tenant, actor, role, source, assignment and timestamps from trusted
  context;
- prevent an allowed update from changing Tenant, assignee, source, policy or
  generation;
- preserve equivalent checks in views, functions, RPCs, service role,
  Inngest/reconciler and support tooling;
- non-enumerate hidden task/source/actor existence;
- reauthorize every object reference even if it is a UUID; and
- prove cross-Tenant poison cases for old/new rows and all mixed policies.

Assignment never grants source capability. A Tasks Hub administrator does not
automatically receive protected source detail or authority to complete on
behalf of someone else. A source administrator does not automatically receive
task-history privacy access.

## Privacy and data minimization

- Completion events contain task/source identities, policy/outcome codes and
  trusted attribution—not D30 feedback, source content, customer/donor details
  or free-form comments.
- D32 creates no universal completion note. Evidence requirements are a later
  explicit task-contract decision; arbitrary notes are not smuggled into event
  metadata.
- A typed evidence reference stays in its governing protected domain when
  possible; task history receives only safe status/receipt facts.
- Task/source state shown to managers is authorization-filtered; no hidden
  assignee names, restricted ministry locations or protected Site labels leak
  through counts.
- Search, exports, analytics and AI index only safe task projection fields.
- Logs, traces, metric labels, Inngest events and dead letters remain
  identifier-/reason-code-only.
- Retention follows separate source, task-history, engagement, technical-log
  and evidence classes.
- Source privacy redaction or retention cannot leave a copied body in task
  completion history because no body was copied.

OWASP's current
[Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
supports deny-by-default and current permission checks on every request, while
its [Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
supports excluding sensitive personal and payment data from ordinary logs.

## Inngest boundary

### Synchronous product commands

Inngest is not used to accept:

- **Done with my task**;
- reopen/undo;
- the source action;
- current authorization;
- current source generation;
- completion evidence validation; or
- the user-facing receipt.

Those effects are synchronous product commands guarded by product idempotency
and CAS.

### Appropriate asynchronous work

Inngest may:

- materialize or reconcile a source-end mapping into task history;
- project a newly current task assignment generation;
- fan out safe recipient engagement changes;
- repair pending intents/dead letters;
- reconcile source-open/no-active-task gaps;
- refresh body-free search/read projections; and
- execute retention/purge work under its governing contract.

The worker re-reads current product state immediately before writing. It never
trusts transport order.

### Why no human wait workflow

Official Inngest documentation says:

- [event/function idempotency](https://www.inngest.com/docs/guides/handling-idempotency)
  is limited to 24 hours;
- [retries](https://www.inngest.com/docs/guides/error-handling) require
  idempotent side effects;
- [cancellation](https://www.inngest.com/docs/features/inngest-functions/cancellation)
  cannot stop an already executing step; and
- [concurrency](https://www.inngest.com/docs/guides/concurrency) controls
  executing steps and does not guarantee ordering across functions.

Therefore a long-lived **wait for task completed** function would create
shadow lifecycle, versioning, privacy and cancellation hazards. Product task
and source records own human-duration state. Inngest only runs short
materialization/reconciliation effects through the product dispatch ledger and
work claims.

## Accessibility and interaction safety

Current [WCAG 2.2](https://www.w3.org/TR/WCAG22/) requires logical focus order,
programmatically available name/role/value and status messages, sufficient
target size, predictable changes, and error-prevention behavior for stored user
data. Applying those outcomes:

- **Done with my task** is a text-labelled button, not only a visual checkbox.
- The accessible name includes enough row context when multiple tasks have the
  same action.
- Policy A simply omits completion; it does not render a disabled unexplained
  checkbox. **How this task is completed** explains the source behavior.
- A task-owned follow-up describes the continuing linked-source state before the action.
- Completion does not trigger merely from focus, selection, drag or swipe.
- The pending state disables duplicate activation without removing label or
  progress meaning.
- Inline validation and server conflict messages are programmatically
  associated with the action/evidence fields.
- The success/status message is announced politely without stealing focus.
- When an active row leaves a filtered list, focus moves predictably to the
  next task, prior task, list heading or explicit completion status.
- Undo is a real button with a sufficient target and visible focus.
- No state relies on green, strikethrough, icon or position alone.
- Completed task/source-open wording remains understandable at 320 CSS pixels,
  400% zoom, forced colors, long translation and screen-reader browse mode.
- Bulk completion, if ever added, cannot be the only efficient keyboard path
  and must report per-item outcomes.

WAI's
[listbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/) warns that
listbox options cannot accessibly contain ordinary nested links/buttons.
Task rows with source links and completion controls should use semantic list or
table composition, not masquerade as listbox options.

## Failure modes and safe recovery

| Failure                                                      | User-visible truth                                                                                        | Permanent recovery                                                                                |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Policy A task receives generic completion request            | **This task closes from Website/Finance/Support work. Open the source to continue.**                      | Reject with no state change; log safe policy-mismatch reason                                      |
| Linked source already ended before task-owned completion     | **This work is no longer needed** with exact safe source reason                                           | Map source end idempotently; do not claim the person completed it                                 |
| Source generation changed                                    | **This task changed. Review the latest source before marking your part done.**                            | Refresh current task/source; retain inputs                                                        |
| Actor lost assignment or permission                          | Omit protected detail/action; if request was already open, say access changed without leaking replacement | Deny; reconcile assignment; preserve history                                                      |
| Completion DB commit succeeds but response is lost           | On retry, show original receipt                                                                           | Product semantic idempotency and receipt lookup                                                   |
| Task event commits but read projection lags                  | Receipt is authoritative; list may say **Updating…** briefly                                              | Async reconcile; read-your-write path where practical                                             |
| Source end event is lost                                     | Source page is correct; stale task is hidden by current applicability check                               | Dispatch recovery/reconciler repairs task history                                                 |
| All task-owned follow-ups done; source action still required | Source stays **Needs attention**; protected owner view says **No active staff task**                      | Source resolver decides whether a new source-action assignment or separate follow-up is justified |
| All task-owned follow-ups done; source waits externally      | Source says **Waiting for…**; no false staff task                                                         | No repair required; source event opens new work if staff action returns                           |
| Reopen races with source end                                 | Source end wins                                                                                           | Reopen rejects/mapping remains source-ended                                                       |
| Duplicate completion after 24 hours                          | One completion occurrence                                                                                 | Product unique key, not provider dedupe                                                           |
| Inngest unavailable                                          | Manual completion/source commands still work                                                              | Durable dispatch intent and manual/recovery reconciler resume                                     |
| Task source adapter unavailable                              | Completion cannot prove current source                                                                    | Fail closed, retain task/input, operational signal                                                |
| Protected evidence contains invalid/unsafe data              | Explain exact field issue without echoing sensitive value                                                 | Reject; no task/source mutation; secure validation/audit                                          |
| Task projection deleted/corrupted                            | Source remains authoritative and discoverable                                                             | Rebuild projection from source occurrence and append repair evidence                              |
| Mobile/offline client queues completion                      | Do not show final Done offline                                                                            | Require online server receipt; retain local intent only in memory                                 |

Failures after an authoritative task completion but before secondary effects
complete are visible as projection/notification/analytics lag. They never roll
back the recorded subordinate completion or mutate source truth.

## Research-only acceptance outcomes

These outcomes are research inputs, not canonical implementation criteria. A
later spec effort must reconcile and translate them.

### Platform decision and ownership

- **D32-RA1:** Every admitted shared task selects exactly one versioned
  code-owned completion-authority policy.
- **D32-RA2:** The closed initial authorities are source-controlled closure for
  a source-action assignment and task-owned completion for a separately
  defined human follow-up.
- **D32-RA3:** Every source-action assignment uses source-controlled closure
  against its exact source-action predicate.
- **D32-RA4:** Option 2 is rejected for the same source-action assignment;
  independently completable work must be a separately named task-owned
  follow-up.
- **D32-RA5:** Tenants cannot author or override completion semantics through a
  generic setting or workflow expression.
- **D32-RA6:** The source owns condition existence, exact source-action
  predicates, correction/resolution and source history.
- **D32-RA7:** Tasks Hub owns admitted task coordination and completion of a
  separately registered task-owned follow-up only.
- **D32-RA8:** Notification engagement, task completion, source state and
  Inngest execution remain four distinct facts.
- **D32-RA9:** No task state can publish, approve, release, pay, refund, post,
  reconcile, communicate, close or otherwise mutate source truth.
- **D32-RA10:** A source command rendered from Tasks Hub remains a source
  action with its exact confirmation/evidence/authorization, never a generic
  completion mutation.
- **D32-RA11:** Manual Tasks Hub work has its own manual completion policy and
  is not misclassified as source-backed.
- **D32-RA12:** Website/CMS, Mobilize, finance and Support reuse the policy
  registry only after each registers its own semantics.

### Source-controlled closure

- **D32-RA13:** Policy A task applicability follows the exact source-action
  assignment predicate, not necessarily the whole parent source episode.
- **D32-RA14:** The source can close Maria's Page task while Joel's Navigation
  task and parent correction remain active.
- **D32-RA15:** Policy A exposes **Open [source] work** and no independent
  completion checkbox/menu/shortcut/drag/bulk action.
- **D32-RA16:** Policy A detail explains in plain language how the source will
  close the task.
- **D32-RA17:** Source action satisfaction maps to truthful task history without
  fabricated staff completion.
- **D32-RA18:** Source cancellation, supersession, not-applicable, authority
  loss and responsibility change remain distinct history outcomes.
- **D32-RA19:** Policy A is required when the task imperative is the source
  action itself.
- **D32-RA20:** Policy A is required for safety-, money-, publication-,
  approval-, permission- or provider-outcome-sensitive completion unless a
  narrower separate follow-up is registered.
- **D32-RA21:** Policy A completion uses source CAS/current proof and never task
  status as the source condition.
- **D32-RA22:** Query-time source applicability hides stale active Policy A
  projections even if async reconciliation lags.
- **D32-RA23:** A generic completion request against Policy A rejects with
  source context and no mutation.
- **D32-RA24:** D30 prose and anchor never prove a Policy A predicate ended.
- **D32-RA25:** Website correction v1 uses Policy A unless a later registered
  contract proves a distinct subordinate deliverable.

### Task-owned independent follow-up

- **D32-RA26:** The task-owned policy names one human follow-up deliverable
  distinct from the linked source action and resolution.
- **D32-RA27:** A task-owned follow-up is unavailable if that independent
  meaning cannot be stated and tested.
- **D32-RA28:** The visible action is **Done with my task**, not unqualified
  Complete/Resolve/Fix/Close source language.
- **D32-RA29:** The source-open consequence appears immediately before the
  completion control.
- **D32-RA30:** Completion reauthorizes the current actor, assignment, source
  visibility and exact task operation.
- **D32-RA31:** Completion reloads current source applicability and generation
  synchronously.
- **D32-RA32:** If source already ended, the result records source end rather
  than personal completion.
- **D32-RA33:** If source changed incompatibly, stale completion writes nothing
  and returns current context.
- **D32-RA34:** Task-owned completion atomically appends task outcome, trusted
  attribution, task event, projection and idempotency receipt.
- **D32-RA35:** Task-owned completion writes no source mutation or source
  resolution signal.
- **D32-RA36:** The response includes separate task and current source facts.
- **D32-RA37:** Routine reversible completion adds no confirmation modal when
  no evidence is required.
- **D32-RA38:** Required evidence is closed, typed and contract-specific; D32
  creates no universal free-form note.
- **D32-RA39:** Success says **Your task is done** and explicitly states when
  source work remains.
- **D32-RA40:** Completed task-owned follow-up leaves personal active views but cannot
  hide the source from authorized source/manager views.
- **D32-RA41:** Source-end-after-personal-completion preserves both facts and
  their order.
- **D32-RA42:** Task-owned follow-up is compatible with ADR-0054 while
  finance source proof remains authoritative.

### Reopen, recurrence and no-active-task handling

- **D32-RA43:** Task-owned completion is correctable through append-only reopen
  history when the contract and current state permit.
- **D32-RA44:** Immediate Undo is offered only after a successful receipt and
  fresh reopen authorization.
- **D32-RA45:** Reopen never deletes completed_at/by or prior outcome evidence.
- **D32-RA46:** A stale former assignee cannot reopen after reassignment,
  authority loss or source end.
- **D32-RA47:** A later material source change normally creates a successor
  assignment generation rather than silently reopening prior history.
- **D32-RA48:** A recurrence after source end creates a new source occurrence
  and task generation.
- **D32-RA49:** Prior read or completion does not suppress fresh work.
- **D32-RA50:** Every task-owned follow-up contract classifies all-done/source-open as
  waiting-without-staff-action or staff-action-still-required.
- **D32-RA51:** Waiting-without-staff-action creates no artificial active task.
- **D32-RA52:** Staff-action-still-required with no active task is a protected
  routing gap, not completion.
- **D32-RA53:** Core never auto-reopens all completers or picks the last
  completer as fallback.
- **D32-RA54:** New task generation occurs only from a meaningful current
  source-action predicate.
- **D32-RA55:** Time passage, due date or reminder never creates a successor or
  changes completion meaning.

### UX, status and reporting

- **D32-RA56:** Task rows use policy-specific controls derived from trusted
  task kind/policy, not source strings or client flags.
- **D32-RA57:** Policy A omits a completion control rather than showing a
  disabled unexplained checkbox.
- **D32-RA58:** Source-action and task-owned follow-up policies share one visual system but retain distinct
  consequence copy.
- **D32-RA59:** A task-owned follow-up's source state and task state are separately
  labelled on list, detail, source and manager surfaces.
- **D32-RA60:** Completed subordinate work is not presented as green source
  success.
- **D32-RA61:** Completed rows use visually quiet history styling while active
  source work remains prominent.
- **D32-RA62:** Manager metrics label source-case, active-task and completed-
  follow-up grains separately.
- **D32-RA63:** No aggregate says all work complete merely because all
  subordinate tasks are complete.
- **D32-RA64:** Source detail remains one navigation action from the task and
  preserves context/return location.
- **D32-RA65:** Completion success provides **View source** and authorized Undo
  without forcing navigation.
- **D32-RA66:** Network/source conflict retains evidence input and task context.
- **D32-RA67:** Offline UI does not claim final completion without server
  receipt.
- **D32-RA68:** No completion occurs by swipe, drag, focus, row selection or an
  icon-only target.
- **D32-RA69:** Initial source-backed bulk completion is omitted; any later
  version freezes selection, rechecks each task and returns per-item outcomes.
- **D32-RA70:** Search/filter/sort never coerce source-open and task-done into
  one ambiguous status.

### Accessibility, localization and low bandwidth

- **D32-RA71:** Completion controls have visible text labels and programmatic
  names that disambiguate repeated tasks.
- **D32-RA72:** Task rows use semantic list/table composition, not rich
  interactive listbox options.
- **D32-RA73:** Focus order preserves source-state explanation before the
  completion action.
- **D32-RA74:** Completion pending/success/error states are programmatically
  announced without focus theft.
- **D32-RA75:** When a row leaves a filtered list, focus moves predictably to a
  useful adjacent/list/status target.
- **D32-RA76:** State is not communicated through green, checkmark,
  strikethrough or position alone.
- **D32-RA77:** Controls satisfy WCAG 2.2 AA target size, focus visibility and
  focus-not-obscured outcomes.
- **D32-RA78:** The complete journey works at 320 CSS pixels, 400% zoom, forced
  colors and browser text scaling.
- **D32-RA79:** Long translations, international names, CJK, RTL and
  mixed-direction values remain readable with bidi isolation.
- **D32-RA80:** Task list/completion uses compact safe data and does not fetch
  rich source content or protected feedback.
- **D32-RA81:** Mobile and low-bandwidth tests measure user-visible completion
  latency and ambiguous-response recovery.
- **D32-RA82:** Automated accessibility checks are supplemented by manual
  keyboard, screen-reader, zoom, forced-colors and touch proof.

### Lifecycle, concurrency and idempotency

- **D32-RA83:** Source-action and task-owned follow-up lifecycles use separate typed outcome
  meanings, not one overloaded completed status.
- **D32-RA84:** Source end from any task state remains authoritative and
  history preserves whether personal completion happened earlier.
- **D32-RA85:** Completion versus source end resolves against one current
  source generation.
- **D32-RA86:** Completion versus reassignment/takeover uses expected
  assignment generation.
- **D32-RA87:** Completion versus authorization loss denies at the final
  current check.
- **D32-RA88:** Completion/reopen use expected task version/CAS.
- **D32-RA89:** Same idempotency key and canonical meaning returns the original
  receipt.
- **D32-RA90:** Changed meaning under the same idempotency key rejects.
- **D32-RA91:** Product uniqueness remains effective beyond Inngest's 24-hour
  dedupe window.
- **D32-RA92:** Server/database time owns completion ordering; client time does
  not.
- **D32-RA93:** Out-of-order async events converge from current product state.
- **D32-RA94:** Old/new materializer or policy versions cannot write against an
  incompatible current contract.
- **D32-RA95:** Recurrence and successor assignment are explicit, never
  last-write-wins reopening.

### Database, RLS and authorization

- **D32-RA96:** Tenant is included in all task, assignment, completion,
  evidence, event and receipt identities/relationships.
- **D32-RA97:** Same-Tenant composite constraints protect links even through
  privileged paths.
- **D32-RA98:** One current assignment generation and one semantic completion
  effect are structurally enforced.
- **D32-RA99:** Policy A cannot admit a staff-completion occurrence.
- **D32-RA100:** A task-owned completion occurrence references exact assignment, policy and
  observed source generations.
- **D32-RA101:** Task and completion events are append-only; current views are
  rebuildable.
- **D32-RA102:** Anonymous grants are absent and authenticated grants expose
  only intended operations.
- **D32-RA103:** Complete and reopen policies check existing and resulting rows
  with correct USING/WITH CHECK semantics.
- **D32-RA104:** Tenant, actor, role, source, assignment, policy, generation and
  timestamps are server/database derived.
- **D32-RA105:** Assignment, task admin or source visibility alone never grants
  completion authority.
- **D32-RA106:** Views, RPCs, service role, Inngest, support, export, search,
  cache and bulk paths preserve equivalent authorization.
- **D32-RA107:** Unauthorized task/source/actor existence is non-enumerating.
- **D32-RA108:** Delete/cascade behavior preserves source and completion
  history.
- **D32-RA109:** Cross-Tenant and wrong-context poison tests cover every
  current/mixed policy path.

### Privacy, Inngest and failure recovery

- **D32-RA110:** Completion records/events carry safe IDs, policy/outcome codes
  and trusted attribution, not protected source bodies.
- **D32-RA111:** D30 feedback, Page content, donor/finance/member-care data and
  arbitrary task notes remain out of logs/events/search/analytics/AI.
- **D32-RA112:** D32 creates no universal completion reason/note field.
- **D32-RA113:** Typed evidence remains source/protected-domain owned where
  possible and task history stores only safe reference/outcome facts.
- **D32-RA114:** Task/source/engagement/workflow retention classes remain
  separate.
- **D32-RA115:** Manual completion and reopen are synchronous product commands,
  never Inngest acceptance.
- **D32-RA116:** Inngest may perform short source-end, projection, recipient and
  reconciliation effects only.
- **D32-RA117:** Inngest event/run state, cancellation, ordering and 24-hour
  dedupe never become completion authority.
- **D32-RA118:** Product dispatch ledger, work claims, unique keys and receipts
  own async recovery/idempotency.
- **D32-RA119:** Linked-source adapter failure makes task-owned completion fail closed
  while retaining user context.
- **D32-RA120:** A committed completion survives secondary projection failure
  and remains recoverable from product evidence.

### Rollout, testing and traceability

- **D32-RA121:** Completion policy fields/readers/denial guards deploy
  additively before a completion writer.
- **D32-RA122:** Existing generic task completion is denied for source-backed
  rows until a policy is registered.
- **D32-RA123:** Existing completed task rows are not inferred/backfilled as
  source-backed outcomes without authoritative source/task identity.
- **D32-RA124:** Website source-action assignments ship source-controlled;
  a task-owned follow-up producer canaries only after its separate deliverable
  is proved.
- **D32-RA125:** Rollback disables a completion policy/writer without changing
  source state or deleting completion history.
- **D32-RA126:** Tests cover positive, negative, authorization, privacy,
  boundary, all pairwise races, duplicate/lost response, source-generation,
  recurrence and mixed-version outcomes.
- **D32-RA127:** Production-shaped tests certify task list and completion
  latency, DB work, async lag and tenant fairness for recorded workload shapes.
- **D32-RA128:** Representative staff testing proves people can distinguish
  **my task is done** from **the source is resolved** by role, domain, device
  and locale.
- **D32-RA129:** Accessibility/mobile/low-bandwidth failures block Live for the
  relevant policy/producer.
- **D32-RA130:** Decision log, glossary, ADR, OpenSpec, design, tickets,
  implementation, tests and release evidence trace the same completion-policy
  keys, states, copy, owners and non-effects.

## Named monitors

These are recommended initial release thresholds, not universal industry
constants. Safety thresholds are zero tolerance. Experience/performance
thresholds must be recalibrated from a recorded canary baseline, but not omitted
because baseline work remains.

| Signal                                               | Initial threshold                                                                                                            | Owner                                      | Mandatory response                                                                                                                     |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| task_completion_cross_tenant_effect_total            | Any event                                                                                                                    | Security + Data Platform                   | Disable completion/reopen writer, contain access, preserve safe evidence, run incident response and poison-path audit before re-enable |
| task_completion_unauthorized_success_total           | Any accepted completion/reopen by an unauthorized or stale actor                                                             | Security + Tasks Hub                       | Fence command, restore truthful projection, audit all affected tasks and repair authorization/CAS tests                                |
| task_source_action_manual_completion_total           | Any source-action assignment accepting task-owned completion                                                                 | Tasks Hub + source owner                   | Stop writer/producer cohort, reverse only task projection through audited correction, never alter source, enforce policy constraint    |
| task_completion_source_mutation_total                | Any task completion directly or indirectly changes source truth                                                              | Architecture + source owner + Security     | Kill integration, contain source effects, use source-owned correction/compensation and redesign boundary                               |
| task_completion_without_source_recheck_total         | Any task-owned follow-up completion lacking current linked-source/contract recheck                                           | Tasks Hub + source adapter owner           | Fence policy, inspect affected outcomes and add adapter/version proof                                                                  |
| task_done_source_success_mislabel_total              | Any UI/report/export labels task-owned completion as source resolved/successful                                              | Product/UX + Data/Analytics                | Correct wording/semantic model and affected reports; add snapshot/comprehension tests                                                  |
| task_source_open_hidden_after_task_done_total        | Any authorized source condition becomes undiscoverable solely because a task completed                                       | Source owner + Tasks Hub                   | Restore source visibility, repair filters/grouping and inspect similar contracts                                                       |
| task_source_predicate_close_lag_seconds              | Any Policy A task active more than 60 seconds after received source-action end; read-time stale exposure is zero tolerance   | Tasks Hub + Workflow Operations            | Apply source applicability ceiling immediately and reconcile projection/history                                                        |
| task_completion_stale_generation_success_total       | Any stale task/source/assignment generation accepted                                                                         | Data Platform + Tasks Hub                  | Fence writer generation, reconcile history, add race regression and inspect downstream effects                                         |
| task_completion_duplicate_effect_total               | Any duplicate subordinate completion for one semantic key                                                                    | Tasks Hub + Data Platform                  | Retain one product effect/receipt, reconcile derived history and repair uniqueness/idempotency                                         |
| task_completion_client_time_accepted_total           | Any caller timestamp becomes authoritative completed/reopened time                                                           | Tasks Hub + Security                       | Correct stored projection from server evidence where lawful, remove caller authority and audit imports                                 |
| task_all_done_source_action_required_gap_age_seconds | Any source proving staff action required with no active task for more than 5 minutes                                         | Source owner + Tasks Hub                   | Re-run source resolver, create only justified new generation, expose protected routing gap and inspect contract                        |
| task_waiting_source_false_gap_total                  | Any correctly waiting-without-staff-action source causes a replacement task/nag                                              | Product/UX + source owner                  | End noisy projection, fix classification and audit notification/reminder fan-out                                                       |
| task_completion_source_adapter_error_rate            | Above 1% over 15 minutes or any fail-open response                                                                           | Source adapter owner + Workflow Operations | Fail closed, retain inputs, inspect adapter/auth/source health and pause affected completion policy                                    |
| task_completion_ambiguous_response_rate              | Above 0.5% over 30 minutes                                                                                                   | Tasks Hub + Web Platform                   | Inspect latency/timeouts/receipt lookup, improve reconcile-before-retry and pause expansion if users repeat actions                    |
| task_completion_policy_mismatch_attempt_rate         | Above 2% of source-action task opens over 30 days                                                                            | Product/UX + source owner                  | Test **How this task is completed** copy and action hierarchy; fix UI without adding generic completion                                |
| task_completion_task_source_count_drift_total        | Any dashboard conflates source cases, active tasks and completed follow-ups                                                  | Data/Analytics + Tasks Hub                 | Correct semantic layer, repair derived counts and label every grain                                                                    |
| task_completion_protected_body_propagation_total     | Any protected source body in completion event/evidence/log/trace/metric/search/export/Inngest payload                        | Security/Privacy + source owner            | Stop sink, quarantine/remove unauthorized copies under retention policy and trace every propagation path                               |
| task_completion_inngest_authority_total              | Any Inngest run/event/cancel/result accepted as product completion                                                           | Workflow Architecture + Tasks Hub          | Disable function, restore from product records, repair idempotency/source checks                                                       |
| task_completion_human_wait_run_total                 | Any long-lived Inngest run waiting for human completion                                                                      | Workflow Architecture                      | Cancel safely, migrate state to product records and replace with short identifier-only effects                                         |
| task_completion_dead_letter_age_seconds              | Any D32 reconciliation dead letter unresolved for 15 minutes                                                                 | Workflow Operations + Tasks Hub            | Classify, repair/replay same product command and expose protected operational status                                                   |
| task_completion_mobile_success_rate                  | Below 90% of eligible canary attempts excluding valid business rejection                                                     | Product/UX + Web Platform                  | Investigate wording, target, reflow, latency and source conflicts; block expansion until repaired                                      |
| task_completion_accessibility_blocker_total          | Any unresolved critical/serious manual or automated defect before Live                                                       | Accessibility + Tasks Hub/source UI        | Block activation, repair and rerun keyboard, screen-reader, zoom, forced-colors and touch proof                                        |
| task_completion_comprehension_error_rate             | More than 1 of 10 representative participants says task-owned done means source resolved, or cannot explain Policy A closure | Product Research + UX                      | Block affected policy/wording; revise and repeat moderated testing across roles/locales/devices                                        |
| task_completion_manual_data_repair_total             | More than 1 direct SQL/data repair in 30 days                                                                                | Tasks Hub + Data Platform                  | Stop normalizing manual repair; identify and implement missing command/reconciler invariant                                            |

Monitor payloads and metric labels contain policy/source contract codes and
low-cardinality outcome reasons only. They never include source text, D30
feedback, names, Tenant labels, task titles, locations or high-cardinality
identifiers.

## Migration, rollout and rollback

### Required sequence

1. Record amended Option 1 and the separate task-owned follow-up distinction.
2. Resolve source-backed return/handoff in canonical D33. Before any
   Independent follow-up task writer, separately decide its completion-evidence
   rule.
3. Reconcile ADR-0183, ADR-0054, ADR-0027, platform boundaries, workflow
   orchestration and the affected domain specifications.
4. Define the closed completion-authority policy registry and source adapter
   contract.
5. Harden shared Tasks Hub before source-backed completion:
   - trusted task kind/policy;
   - source/assignment generations;
   - atomic task event/receipt commands;
   - append-only completion/reopen evidence;
   - composite Tenant constraints;
   - RLS/grants/privileged parity;
   - source applicability ceiling;
   - safe manager/read models.
6. Deploy readers and denial guards before any writer. Generic current task
   completion must reject source-action assignments.
7. Ship Website Policy A only, in shadow then canary, proving exact Page/
   Navigation predicate closure without waiting for the whole episode.
8. Canary a task-owned follow-up only after its domain owner proves a distinct
   human deliverable, current-source recheck and source-open UX. Do not invent
   Mobilize behavior to obtain a pilot.
9. Add asynchronous reconciliation through the existing product
   dispatch-ledger/Inngest path only after synchronous source/task commands are
   correct.
10. Expand producer by producer with contract, authorization, accessibility,
    performance and operational evidence.

### Mixed-version safety

- Old readers treat unknown policy tasks as non-completable and offer the
  source action only.
- New readers work before new writers.
- Unknown policy/source adapter versions fail closed.
- Writer fences prevent old/new completion commands from accepting the same
  cohort.
- Source-action tasks created before D32 get Policy A explicitly; policy is
  never inferred from source_module/title/status.
- Current generic completed rows are not backfilled into source-action or
  task-owned history without deterministic source/task identity and evidence.
- Task-owned completion can be disabled while preserving prior completion and
  source history.
- Inngest-disabled operation leaves synchronous completion/source commands and
  product records valid.

### Rollback

Rollback disables the affected completion writer/policy and rolls projections
forward from product records. It never reopens/resolves source work, deletes
completion history, rewrites actor attribution, restores old permission or
uses source mutation to make task UI consistent. A falsely accepted task
completion is corrected through an append-only task correction/reopen event,
not destructive SQL.

## Proof portfolio

### Positive and boundary

- one Policy A task closes on its exact source-action predicate while sibling
  task/parent episode remains open;
- all Policy A source-end reasons map distinctly;
- one task-owned follow-up completes while source remains waiting/open;
- source already ended before completion;
- exact evidence boundary and maximum-plus-one once D33 defines it;
- immediate Undo and later authorized reopen;
- waiting-without-action versus action-required/no-active-task;
- source recurrence and new assignment generation.

### Negative and authorization

- generic completion against every Policy A entry point including API, row,
  drawer, keyboard, bulk, drag/drop and stale client;
- wrong Tenant, Site, locale, environment, source, role, Party, assignee,
  assignment generation, policy and source generation;
- task admin, source admin, support impersonation and service role without the
  exact completion relationship;
- assignment/source visibility without completion authority;
- forged actor/Tenant/policy/completed_at/evidence/source status;
- protected text in every completion/event/log/export/search field.

### Concurrency, idempotency and failure

- completion versus source end, reassignment, authority loss, policy upgrade,
  source revision and reopen;
- duplicate clicks, lost response, retry after more than 24 hours and changed
  meaning under same key;
- completion commit followed by projection/notification failure;
- source adapter unavailable/timeout/ambiguous;
- source-end event lost/duplicated/out-of-order;
- old/new writer generations;
- Inngest disabled, dead-letter and manual replay;
- task projection deleted and rebuilt.

### UX, accessibility and production shape

- representative staff can correctly explain task/source/read state for both
  policies;
- completion wording by Website, finance and Support role without inventing
  Mobilize claims;
- semantic list/table, keyboard, screen reader, focus after removal, status
  announcements, target size, 320px reflow, 400% zoom, forced colors, CJK, RTL
  and long localization;
- mobile/touch and low-bandwidth ambiguous-response recovery;
- one, contract maximum and production-shaped tasks/tenants with p50/p95/p99
  command/list/source-adapter latency, DB work, payload bytes and async lag;
- one noisy Tenant cannot starve source-end reconciliation for another.

Tests verify product and user-visible outcomes. A green Inngest run, called
mock, updated status column or rendered check icon proves none of the D32
contract by itself.

## Assumptions and unresolved unknowns

1. Representative ministry staff have not yet tested the proposed **How this
   task is completed**, **Done with my task**, and two-dimension manager copy.
2. The final Tasks Hub schema, task grain, assignment generation and source
   adapter registry are not implemented.
3. Website can plausibly expose typed Page/Navigation action predicates, but
   the final Phase 24 source model must prove them. D30 prose/anchor cannot.
4. No specific Mobilize human follow-up or completion meaning is approved by
   this research.
5. ADR-0054 permits independent task follow-up, but each finance task still
   needs a precise task-owned deliverable and evidence contract.
6. Support may have human activity tasks, but Support ticket status and
   privacy remain source-owned.
7. D32 does not determine whether task-owned completion requires no evidence,
   typed evidence or a reason; that is a later cross-domain Tasks Hub decision.
8. Exact retention periods and manager access belong to governing source/task/
   privacy policies.
9. Initial lag, error and comprehension thresholds are explicit canary
   judgments and require calibration from measured Core evidence.
10. Official product examples establish patterns and hazards, not ministry
    demand or Core-specific UX success.

## Evidence limits

- Contentful/Sanity native editorial tasks are closer to their content source
  than Core's cross-domain projection and may let task state gate publication.
- GitHub/GitLab code review has structured commits, approvals and branch rules
  that free-text Website correction lacks.
- Asana/HubSpot/Salesforce/Dynamics/Blackbaud prove familiar task-owned
  completion but generally do not provide Core's source recheck or tenant/RLS
  boundary.
- GitHub linked issue auto-close proves source-driven linkage, not that Core
  should use keywords or make task state issue truth.
- Jira allows configurable automation and task workflows; Core rejects a
  tenant-authored D32 completion DSL.
- GOV.UK task-list guidance supports restrained status presentation, not the
  authority model.
- W3C, OWASP, PostgreSQL and Supabase govern accessibility/security/database
  outcomes, not product demand or exact task semantics.
- Inngest documentation describes executor behavior, not product ownership or
  exactly-once business effects.
- Existing Core task code is narrower than the accepted architecture and may
  be unsafe for source-backed reuse.

## Deferred cross-domain Tasks Hub evidence question

### After source-backed handoff is resolved — what evidence should **Done with my task** require?

#### Why this needs a founder decision

D32 now keeps source-action assignments source-controlled and preserves a
separate task-owned policy for genuine human follow-up. The next unresolved
question is what staff must provide when they finish that follow-up.

Always requiring a note makes routine tasks slow and invites sensitive donor,
missionary, finance or Support details into the wrong record. Never requiring
evidence makes high-consequence attestations vague. The Tasks Hub needs one
consistent rule that lets each registered task contract ask only for what its
deliverable actually needs.

#### Hope Ministries example

Ana has a task-owned finance follow-up: **Send the accountant the requested
reconciliation evidence**. The Accounting Exception remains open until Finance
verifies it. A delivery task may need a typed safe receipt/reference, while a
simple internal **Confirm you contacted Joel** follow-up may need only one
deliberate completion click. Neither should require Ana to paste donor or bank
details into a generic task note.

#### Option 1 — contract-defined evidence with a one-click default — recommended

Every task-owned follow-up contract declares one closed evidence policy:

- no extra input for routine, reversible follow-up;
- a small typed choice/reference/attestation when that deliverable genuinely
  requires it; or
- completion unavailable until evidence is recorded through the authoritative
  source surface.

Tasks Hub never adds a universal free-text note. The UI reveals evidence fields
only after they are relevant, explains why, validates inline and keeps
protected evidence in its governing domain.

**User experience:** most tasks remain one deliberate click; higher-consequence
work asks only for the exact proof staff expect. Mobile forms stay short and
privacy risk stays bounded.

**Impact:** best balance of speed, clarity, audit and cross-domain safety. It
requires a small code-owned evidence-policy registry and source-specific tests,
not a workflow builder.

#### Option 2 — always one-click with no completion evidence

Every task-owned follow-up completes immediately after current authorization
and source recheck.

**User experience:** fastest and simplest. Staff never face an extra field.

**Impact:** insufficient where a task's whole purpose is to record a delivery,
contact outcome, reference or attestation; teams will put evidence in comments
or external tools and audits become ambiguous.

#### Option 3 — always require one concise completion note

Every completed follow-up requires a short plain-text explanation.

**User experience:** consistent but repetitive; routine staff must type
low-value text, especially on mobile and low bandwidth.

**Impact:** creates sensitive-data, retention, translation, search and
low-information-note risk; a free-text note is weaker than typed evidence for
high-consequence work.

#### Recommendation

**Recommend Option 1 — contract-defined evidence with a one-click default.**
It preserves the joyful one-click path for ordinary tasks while making exact
evidence possible where the task contract—not a generic UI—proves it is
necessary.

This remains a later cross-domain Tasks Hub decision. The canonical Phase 24
D33 question first resolves how a recipient returns or hands off source-backed
work, because that affects the immediate Website task journey and prevents
Option 1 from becoming inflexible.

## Primary evidence index

### Core repository

- [Platform principles](../../../openspec/specs/platform-principles/spec.md)
- [Platform boundaries](../../../openspec/specs/platform-boundaries/spec.md)
- [Workflow orchestration](../../../openspec/specs/workflow-orchestration/spec.md)
- [ADR-0025 — producer-owned protected actions](../../adr/0025-producer-owned-protected-actions.md)
- [ADR-0027 — notification presentation and engagement](../../adr/0027-one-notification-presentation-and-engagement-model.md)
- [ADR-0029 — reference-not-copy](../../adr/0029-reference-not-copy-cms-operational.md)
- [ADR-0054 — source-owned accounting cases and shared follow-up](../../adr/0054-cause-owned-accounting-exceptions-with-shared-follow-up.md)
- [ADR-0181 — candidate-scoped external review](../../adr/0181-source-authorized-candidate-scoped-external-review.md)
- [ADR-0182 — one candidate-review responsibility lane](../../adr/0182-one-current-candidate-review-responsibility-lane.md)
- [ADR-0183 — source work projects into Tasks Hub](../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)
- [D30 adversarial review](./phase-24-d30-required-request-changes-explanation-adversarial-review.md)
- [D31 primary research](./phase-24-d31-source-owned-correction-attention-primary-research.md)
- [D31 adversarial review](./phase-24-d31-source-owned-correction-attention-adversarial-review.md)
- [Current Mission Control schema](../../../supabase/migrations/20260526193000_mission_control_tasks.sql)
- [Current Mission Control task types](../../../packages/api/src/admin/mission-control-tasks/types.ts)
- [Current Mission Control task service](../../../packages/api/src/admin/mission-control-tasks/service.ts)
- [Current Admin task completion UI](<../../../apps/admin/app/(app)/tasks/task-columns.tsx>)
- [Current Admin task state](<../../../apps/admin/app/(app)/tasks/tasks-content.tsx>)
- [Current Missionary task UI](../../../apps/missionary/app/tasks/page-client.tsx)
- [Workflow dispatch ledger](../../../supabase/migrations/20260611134500_workflow_dispatch_ledger.sql)
- [Workflow event envelope](../../../packages/api/src/workflows/events.ts)
- [Product work claims](../../../packages/api/src/workflows/claims.ts)

### Current official CMS, task, CRM, nonprofit and work-management sources

- [Contentful Entry Tasks API](https://www.contentful.com/developers/docs/references/content-management-api/entry-tasks/)
- [Sanity Studio Tasks](https://www.sanity.io/docs/user-guides/tasks)
- [GitHub pull-request reviews](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/about-pull-request-reviews)
- [GitHub resolving reviews](https://docs.github.com/en/pull-requests/concepts/resolving-reviews)
- [GitHub required status checks](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks)
- [GitHub linked pull requests and issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue)
- [GitHub sub-issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/adding-sub-issues)
- [GitLab merge-request homepage](https://docs.gitlab.com/user/project/merge_requests/homepage/)
- [GitLab approvals](https://docs.gitlab.com/user/project/merge_requests/approvals/)
- [Jira Cloud sub-task controls](https://support.atlassian.com/jira-cloud-administration/docs/configure-sub-tasks/)
- [Jira Cloud transition work item](https://support.atlassian.com/jira-software-cloud/docs/transition-an-issue/)
- [Asana Tasks API](https://developers.asana.com/reference/tasks)
- [HubSpot Tasks API](https://developers.hubspot.com/docs/api-reference/latest/crm/activities/tasks/guide)
- [Salesforce task completion](https://help.salesforce.com/s/articleView?id=000385307&language=en_US&type=1)
- [Dynamics 365 Sales activities](https://learn.microsoft.com/en-gb/dynamics365/sales/manage-activities)
- [Dynamics 365 mobile activities](https://learn.microsoft.com/en-us/dynamics365/sales/sales-mobile/view-activities-record)
- [Dynamics 365 workflow task actions](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/fin-ops/organization-administration/workflow-actions)
- [Blackbaud actions](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/en-gb/content/bb-actions-manage-single.html)
- [GOV.UK complete multiple tasks](https://design-system.service.gov.uk/patterns/complete-multiple-tasks/)

### Current official workflow, security, database and accessibility sources

- [Inngest execution](https://www.inngest.com/docs/learn/how-functions-are-executed)
- [Inngest retries](https://www.inngest.com/docs/guides/error-handling)
- [Inngest idempotency](https://www.inngest.com/docs/guides/handling-idempotency)
- [Inngest cancellation](https://www.inngest.com/docs/features/inngest-functions/cancellation)
- [Inngest concurrency](https://www.inngest.com/docs/guides/concurrency)
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [OWASP IDOR Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html)
- [OWASP Mass Assignment](https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html)
- [OWASP Logging](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase API security](https://supabase.com/docs/guides/api/securing-your-api)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [WAI focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)
- [WAI listbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/)

## Subsequent D35 resolution

D35 confirms that Website recovery coordination remains source-controlled:
Tasks Hub projects one shared recovery identity with recipient-specific
assignment/engagement, but generic task mutation cannot assign or end the
underlying correction. The Website expected-head assignment/end receipt is the
only closure authority. See the [D35 adversarial record](./phase-24-d35-shared-lane-optional-recovery-coordinators-adversarial-review.md).
