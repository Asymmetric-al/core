# Phase 24 D33 — source-validated return and handoff primary research

**Status:** Research record for the accepted D33 founder direction; not an
implementation claim, OpenSpec capability, migration, or Live behavior

**Founder direction:** Option 1 — source-validated return or handoff

**Research date:** 2026-08-28

## Research question

How should the current recipient of a source-backed Website task say that the
work needs somebody else without letting Tasks Hub become a second assignment
authority, widening access, surprising another worker, duplicating work, or
stranding the source condition?

The answer must work for a small ministry where the right person is obvious,
for a larger Tenant where eligibility must be searched, and for zero,
indeterminate, stale, concurrent, out-of-office, deactivated, or access-lost
cases. It must also establish a reusable source contract for later Tasks Hub
producers such as Mobilize without pretending those domains have identical
responsibility rules.

## Evidence labels

- **Repository fact** — directly verified in current Core source, migrations,
  OpenSpec, accepted ADRs, or the Phase 24 decision record.
- **Verified external fact** — directly supported by a linked current official
  product, technical, standards, or security source.
- **Reasonable inference** — a conclusion drawn from several verified facts;
  useful, but not itself an external product guarantee.
- **Product judgment** — the recommended Core choice after applying repository
  priorities and comparing alternatives.
- **Assumption** — plausible but not established by repository or external
  evidence; implementation may not treat it as fact.
- **Unresolved unknown** — requires representative ministry research, product
  telemetry, or a later founder decision.

## Executive finding

**Accept Option 1 with a precision amendment: provide two source-owned outcomes
behind one calm secondary action.**

The task detail action is **This needs someone else**. It opens one deliberate,
responsive Base Maia panel that says what will move and that the action will
not grant access, mark the Website work done, publish anything, or alter other
recipients. The source then offers only the paths it can currently prove:

1. **Hand off to an eligible person** — choose exactly one purpose-minimized,
   currently source-eligible person. The source rechecks both parties, exact
   action scopes, policy and expected heads and atomically appends a successor
   responsibility generation.
2. **Return without naming a successor** — end only the initiating recipient's
   current assignment scopes and append a complete source responsibility
   generation that preserves any other current recipients. If nobody remains,
   move the exact scopes to source-owned `needs_assignment`. This path remains
   available when the actor may lawfully relinquish even if no successor can be
   proved. It never guesses a person, queue, broad administrator, or role.

These are not task-row edits. Tasks Hub initiates a typed intent and renders the
authoritative receipt. Website owns the eligibility resolver, transition,
successor, end reason, audit, source state and repair. The predecessor outcome
is **Handed off** only when a named successor actually commits. A no-successor
return is **Returned** while other responsible people remain, or **Returned for
reassignment** when nobody remains. Calling every outcome merely **Reassigned**
would hide the important zero-successor state.

### Immediate product consequence

- The primary row action remains **Open Website work**.
- **This needs someone else** is an available secondary action in task detail,
  not a checkbox, drag gesture, bulk action, inline assignee field, or overflow-
  only mystery.
- The current recipient may initiate only for their own current assignment
  generation. A source manager's takeover or reassignment of somebody else's work
  is a separately authorized source command.
- A direct destination is selected only from a source-supplied list and is
  revalidated on submit. Typing a name or identifier does not make a person
  eligible.
- Candidate resolution failure can hide direct handoff while preserving a safe
  source return when current relinquishment authority is independently proved.
- If current actor/assignment/source authority is itself indeterminate, the
  command writes nothing and explains that Website could not confirm the
  change.
- Unchanged recipients retain their task and engagement state. A genuinely new
  successor gets one task projection and one fresh in-product unread state.
- D31's default remains: no recurring reminder or email. Handoff does not
  silently opt either person into email.

## Why this is modern best practice

### Current first-party product evidence

| Official source                                                                                                                                                             | Verified fact                                                                                                                                                     | Useful precedent                                                                                       | Boundary or caution for Core                                                                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [GitHub issue assignees](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/assigning-issues-and-pull-requests-to-other-github-users)            | GitHub limits who can assign and limits possible assignees to people with defined repository relationships or permissions.                                        | The picker should contain eligible destinations, not an arbitrary directory.                           | GitHub issue assignment is not Website responsibility or access authority.                                                                                 |
| [GitHub assignee API](https://docs.github.com/en/rest/issues/assignees)                                                                                                     | GitHub exposes separate checks for whether a user can be assigned generally and to a specific issue.                                                              | Eligibility is contextual and should be rechecked for the exact work item.                             | Core needs Tenant, Site, source, action, policy and authorization heads beyond repository access.                                                          |
| [Jira work-item permissions](https://support.atlassian.com/jira-cloud-administration/docs/work-item-permissions/)                                                           | Jira separates permission to change an assignee from permission to be assigned.                                                                                   | Initiator authority and destination eligibility are different predicates.                              | A generic Jira-style editable field would still violate D31/D32 source ownership.                                                                          |
| [Jira permission interaction](https://support.atlassian.com/jira-cloud-administration/docs/how-permissions-interact-with-each-other/)                                       | Jira applies more-specific assignment restrictions over general edit permission and can further restrict changes by workflow state.                               | Generic edit/admin permission must not imply source handoff authority.                                 | Core's source command must be narrower and deny by default.                                                                                                |
| [Contentful Entry Tasks](https://www.contentful.com/developers/docs/references/content-management-api/entry-tasks/)                                                         | Contentful permits the creator/admin to reassign, the assignee to resolve, and warns that its API does not ensure the assignee can read the entry.                | Role-specific task actions are normal; reassignment notifications and audit facts are expected.        | The explicit access mismatch is evidence against assuming assignment grants source visibility. Core must validate before offering and again before commit. |
| [Sanity Studio Tasks](https://www.sanity.io/docs/user-guides/tasks)                                                                                                         | Sanity keeps assigned tasks, notifications, comments and document context in its Studio inbox.                                                                    | Contextual task discovery and one coherent inbox reduce staff friction.                                | Sanity tasks are task-owned; Core Website responsibility remains source-owned.                                                                             |
| [Asana task assignment](https://help.asana.com/s/article/assign-tasks-to-teammates?language=en_US)                                                                          | Asana uses one assignee, permits reassignment, distinguishes collaborators, and recommends clear actionable task details.                                         | One accountable next owner is clearer than an ambiguous recipient group; collaborators are not owners. | Asana allows broad peer reassignment and assignment-based access elevation in some configurations, which Core must not copy.                               |
| [Asana task privacy](https://help.asana.com/s/article/understanding-privacy-and-visibility-in-asana)                                                                        | Asana documents that organization membership alone does not imply task visibility and task sharing can change access.                                             | Assignment and visibility must be made explicit.                                                       | Core deliberately chooses the stricter invariant: assignment never grants source access.                                                                   |
| [Microsoft Planner assignment](https://support.microsoft.com/en-US/Planner/assign-people-to-tasks)                                                                          | Planner uses a familiar **Assign to** picker over plan members and supports multiple assignees.                                                                   | Familiar person selection reduces training cost.                                                       | Core should preserve the familiar picker interaction while changing the authority boundary and exact copy.                                                 |
| [Dynamics 365 assignment methods](https://learn.microsoft.com/en-us/dynamics365/customer-service/administer/assignment-methods)                                             | Unified routing filters by skills, presence and capacity; exact matching can leave work unassigned when no qualified representative exists.                       | No match is a truthful queue/recovery state, not permission to choose a weaker person silently.        | Core has not established authoritative skills, presence, capacity or calendar domains for Website; it must not invent them in D33.                         |
| [Dynamics 365 presence](https://learn.microsoft.com/en-us/dynamics365/customer-service/use/oc-manage-presence-status)                                                       | Routing uses configured allowed presence and exposes presence analytics.                                                                                          | Availability can be a legitimate input only when a governed source owns it.                            | A task comment, guessed calendar status or profile label is not an authoritative availability signal in Core.                                              |
| [Salesforce task assignment](https://help.salesforce.com/s/articleView?id=Can-I-assign-tasks-or-events-to-other-users&language=en_US&type=1)                                | Salesforce assigns activities to active users and requires task edit plus read access to the related record.                                                      | Active status and related-record access belong in destination eligibility.                             | Core must also prove exact source action authority and Tenant scope.                                                                                       |
| [Salesforce task ownership](https://help.salesforce.com/s/articleView?id=sales.creating_tasks.htm&language=en_US&type=5)                                                    | A task has one owner at a time and reassignment removes it from the former owner's task list.                                                                     | A clean predecessor/successor staff journey is expected.                                               | A Core predecessor remains immutable history rather than a row overwritten in place.                                                                       |
| [HubSpot task queues](https://knowledge.hubspot.com/tasks/use-task-queues)                                                                                                  | Shared queues distribute task-owned work and allow queue members to complete it; HubSpot explicitly calls a queue a grouping label.                               | Queues can be useful for task-owned triage.                                                            | A generic HubSpot-like queue cannot become Website responsibility or completion truth.                                                                     |
| [Adobe Workfront delegation](https://experienceleague.adobe.com/en/docs/workfront/using/manage-work/delegate-work/how-to-delegate-work)                                     | Workfront exposes who delegated to whom, dates, confirmations and filters.                                                                                        | Handoff/delegation needs visible lineage and a clear success state.                                    | Workfront delegation can propagate permissions and retain them after delegation stops; Core must not treat source handoff as access delegation.            |
| [Adobe Workfront delegation overview](https://experienceleague.adobe.com/en/docs/workfront/using/manage-work/delegate-work/delegate-work-overview)                          | Workfront distinguishes assignment from delegation, scopes delegation to the assignee's own work, and documents lag and permission caveats.                       | Planned out-of-office delegation is a separate lifecycle, not a synonym for one-task reassignment.     | D33 should not build tenant-wide delegation or copy access side effects.                                                                                   |
| [Blackbaud workflow tasks and inboxes](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/infinitydevguide/content/workflow/coworkflowtasksandinboxes.html)         | Blackbaud Enterprise CRM routes human workflow steps through task inboxes and resumes the owning workflow after the task decision.                                | Nonprofit CRM precedent supports source-defined human steps with inbox projection.                     | The workflow source, not a generic inbox row, owns the effect.                                                                                             |
| [Blackbaud GrantsConnect workflow-level users](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/grantsconnect/content/gc-workflows-manage-permissions-users.html) | Users are admitted to exact workflow levels and their assigned workflow permission controls which applications and actions they can access.                       | Assignment target, workflow scope and action permission remain distinct facts.                         | This aligns with Core's assignment-does-not-grant-access invariant without importing Blackbaud's role model.                                               |
| [Blackbaud Raiser's Edge workflows](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/wd-workflows.html)                                               | A workflow can stop if the activating user leaves or loses required access.                                                                                       | Lifecycle and personnel changes are real nonprofit operational hazards.                                | Core should bind authority to current server context, not a historical activator or copied credential.                                                     |
| [W3C combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)                                                                                                  | A combobox can constrain input to an allowed set and defines established keyboard behavior.                                                                       | A source-constrained searchable people picker can be accessible and familiar.                          | Candidate options must have simple accessible names; complex interactive content does not belong inside options.                                           |
| [WCAG 2.2 status messages](https://www.w3.org/TR/WCAG22/#status-messages)                                                                                                   | Status changes must be programmatically determinable without taking focus.                                                                                        | Success, refresh, conflict and candidate-loading changes need assistive-technology announcements.      | Announcements must not disclose protected names or source content.                                                                                         |
| [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)                                                            | OWASP recommends least privilege, default deny and authorization on every request.                                                                                | Picker load and final submit both reauthorize; no client result is authority.                          | Core's governing OpenSpec makes this mandatory even if an external product is looser.                                                                      |
| [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)                                                                                     | PostgreSQL distinguishes row visibility/modification with `USING` and new-row validity with `WITH CHECK`; table owners and `BYPASSRLS` roles can bypass policies. | A permitted update must not move a row into a forbidden Tenant or owner state.                         | Prefer an append-only server command; service-role paths must reproduce the same authorization boundary explicitly.                                        |
| [Inngest idempotency](https://www.inngest.com/docs/guides/handling-idempotency)                                                                                             | Inngest event and function idempotency windows are 24 hours and Inngest advises idempotent application code.                                                      | It can reduce duplicate projection execution.                                                          | It cannot own permanent handoff identity, authorization, audit or semantic idempotency.                                                                    |
| [Inngest durable execution](https://www.inngest.com/docs/learn/how-functions-are-executed)                                                                                  | Inngest persists step state and retries failed steps independently.                                                                                               | It is appropriate for short post-commit projection and reconciliation.                                 | The synchronous source transition and user receipt must not wait on or be defined by an Inngest run.                                                       |

### What the evidence proves

**Verified external fact:** mature products commonly make reassignment easy,
but they differ on who may initiate it, who may receive it, whether assignment
changes access, whether work stays queued, and whether the task or source owns
the lifecycle.

**Reasonable inference:** there is no universal best-practice reassignment
widget. The durable practices are to separate initiator authority from receiver
eligibility, validate the exact destination in current context, expose truthful
no-match behavior, preserve lineage, and keep task discovery distinct from
source access and source state.

**Product judgment:** D33 should borrow the familiar low-friction interaction,
not the external products' looser authority. A generic assignee field, task-
owned delegation, assignment-based access grant or fallback queue conflicts
with Core's governing decisions and is rejected.

## Current behavior, accepted intent and permanent path

### Current repository behavior

**Repository facts:**

- The admin `/tasks` surface is a seed/in-memory prototype with browser-side
  completion, reopening, status editing, assignment and deletion controls.
- `mission_control_tasks` stores one mutable `assignee_profile_id`, optional
  queue, generic status, generic timestamps and loosely typed links/events. It
  has no completion-authority discriminator, source-action assignment
  generation, routing head, destination eligibility receipt, handoff occurrence
  or typed predecessor end reason.
- The current Mission Control assignment policy can attach the initiating actor,
  a default queue, or both. It does not prove current source responsibility.
- The migration enables RLS but revokes authenticated access and grants service
  role broadly. Future privileged writers therefore need explicit server-side
  authorization; RLS alone cannot constrain service-role behavior.
- Missionary tasks are a separate personal model and are not evidence that a
  staff Website assignment may be reassigned the same way.

Current code is useful UI and migration input. It is not the intended D33
authority model and must not be extended by adding a filtered dropdown to the
existing mutable assignee column.

### Accepted repository intent entering D33

- OpenSpec prioritizes Tenant safety and permission correctness above
  convenience, then operational truth, then experience.
- Mission Control tasks are the one future shared staff work model.
- ADR-0183 keeps source work and completion source-owned while Tasks Hub owns
  projection and allowed coordination facts.
- D31 creates one source-work identity with recipient-specific assignment and
  engagement projections; assignment grants no access.
- D32 closes at exact source-action scope and treats responsibility handoff as a
  source end, not task completion.
- D29 supplies a specialized external-review recovery route and reusable
  differential-handoff precedent. Its Review coordinators are not a generic
  correction-work route and cannot be copied or reused by D33.
- D27/D28 preserve one visible responsibility lane and one explicit next-lane
  choice rather than parallel hidden review paths.
- Inngest is an optional executor over product-owned records, claims and a
  dispatch ledger. It owns no human state or product outcome.

### Best permanent path

The source exposes one versioned **Source responsibility transition contract**
for each registered source-action kind. It has separate operations for:

- resolving safe current choices;
- previewing exact affected assignment scopes and consequences;
- handing those scopes to one exact eligible person;
- returning them to the source-owned reassignment lane; and
- reading an immutable transition receipt.

The contract is shared in shape, not in business policy. Website, Mobilize,
finance or another producer registers its own actionability, responsibility,
eligibility, privacy, destination, expected heads and source transition. A
source that cannot prove the contract offers only **Open [source]** and its own
recovery surface; Tasks Hub does not synthesize reassignment.

## Strongest alternatives

### Option 1 — source-validated return or handoff — selected and recommended

The recipient initiates from Tasks Hub; the source returns current permissible
paths and commits the transition. It is one deliberate interaction, supports a
known successor or a safe return, preserves one authority, and scales across
domains through a typed contract.

### Option 2 — source administrators reassign everything

This is the strongest alternative. It minimizes who may mutate responsibility
and makes escalation ownership simple. It is appropriate as a break-glass or
source-management path.

It is not the best normal journey. Small ministries frequently lack a
dedicated always-available Website administrator; leave, misrouting and role
changes would require off-platform communication and a second person for a
safe, ordinary correction. It also encourages staff to leave stale tasks open
or misuse completion. Source validation already supplies the safety boundary,
so administrator-only initiation adds friction without improving destination
proof.

### Option 3 — generic Tasks Hub assignee field

This is familiar but invalid. It makes the projection a responsibility writer,
accepts directory membership as eligibility, permits old clients and bulk APIs
to bypass source policy, and can display protected context to a person who
cannot access the source. No amount of UI filtering repairs the dual authority.

### Option 4 — generic out-of-office delegation

This appears convenient but is a different product. Delegation commonly leaves
the original assignee responsible, introduces a delegate, applies a time range,
and can propagate access. D33 ends one exact assignment generation and creates
a source-owned successor or recovery state. Core should design staff
availability/delegation only when an owning domain and representative ministry
need are proven.

## Recommended staff UX and UI

### Entry point and hierarchy

The task row stays quiet and scannable:

```text
Website · Needs action
Prepare the French Page correction
hope.org · French (Canada)

[Open Website work]
```

Task detail presents the same primary action first and a plainly labelled
secondary action beneath the assignment/context area:

```text
[Open Website work]
This needs someone else
```

Do not use an unlabeled icon, destructive styling, a disabled generic assignee
field, drag and drop, long-press, swipe, bulk toolbar, keyboard-only shortcut or
overflow-only action. This is uncommon but important recovery, not the primary
happy path and not a dangerous/destructive command.

### One deliberate panel

Selecting **This needs someone else** opens a responsive dialog on desktop and
a full-height sheet on narrow screens, composed from shared `@asym/ui` Base UI
primitives and Maia/Zinc semantic tokens. The title and copy answer consequence
questions before any picker:

```text
Who should take this Website work?

Website will confirm who can receive the French (Canada) Page correction.
This will not give anyone new access or mark the correction done.
```

The exact safe affected scope is visible. If the current task groups several
compatible scopes, the source supplies a concise list. The UI never infers
scope from task prose. When scopes cannot be moved together, the source returns
separate actions or requires opening Website; Tasks Hub does not offer a
misleading all-or-nothing control.

### Two truthful paths

Use two radio-card choices or equivalent single-choice controls, not tabs or a
wizard:

```text
( ) Hand off to someone
    Choose a person Website currently allows for this work.

( ) Return this work
    Remove my responsibility. Other responsible people stay; if nobody remains,
    Website will keep it visible as needing an owner.
```

The direct handoff choice reveals a source-constrained, single-select people
picker. The return choice requires no fake destination. Neither selection
changes state until the consequence-led final button is pressed.

### Eligible-person picker

- The picker is labeled **Hand off to** and accepts only returned opaque
  destination references.
- It supports keyboard search and selection through the established WAI-ARIA
  combobox pattern and shared Base UI primitives.
- A row uses one simple accessible name: full display name followed by a short,
  source-authorized qualifier when needed, such as `Amélie Dubois — French
editor`. Avatar, color and initials are supplementary only.
- Search is Unicode-aware, diacritic-tolerant where the shared people-search
  contract supports it, and does not assume Western given/family name order.
- It does not accept arbitrary email, paste, free-form IDs, teams, roles,
  external reviewers, saved reviewer contacts or cross-Tenant people.
- It excludes the initiating actor as a no-op destination. A person already
  responsible for the selected scope may remain selectable for deliberate
  consolidation: the preview explains that their existing responsibility stays,
  the actor is removed, and no duplicate row or unread pulse is created. If the
  person owns another compatible scope, the source may merge presentation into
  their one existing projection without merging source history.
- It does not label anybody **Available**, **Recommended**, **Best match** or
  **On leave** unless a separately governed source supplies that exact current
  fact. Alphabetic or other neutral deterministic ordering is preferred over
  unexplained ranking.
- Large sets use server-side search and cursor pagination; the client never
  downloads the Tenant directory and filters locally.

### Return state and zero destinations

When no direct person can currently be proved, the panel says:

```text
No eligible person is available right now.

You can return this work to Website for reassignment. It will leave your tasks,
but the correction will remain open and visible to authorized Website staff.

[Return for reassignment]
```

Do not disable the whole panel, silently keep the current actor, guess a broad
admin, display an empty broken picker, or say the work is reassigned before a
successor exists. If no continuing or registered source-recovery recipient is
available, the source remains `needs_assignment` with no personal recipient
and an operational routing-gap monitor. This is an honest exceptional state,
not successful handoff.

If destination resolution is temporarily indeterminate but the source can
still independently prove the actor's current right to relinquish, direct
handoff is unavailable and **Return for reassignment** remains offered with
truthful copy. If relinquishment authority is also indeterminate, every final
action is withheld and the UI offers **Try again** and **Open Website work**.

### Consequence-led final action

After one person is selected:

```text
Amélie will receive this Page correction in Tasks.
You will no longer be assigned to it.

[Hand off to Amélie]
```

For return:

```text
This Page correction will leave your tasks. Other responsible people will stay.
If nobody remains, Website will show Needs assignment. It will not be marked
done.

[Return for reassignment]
```

Do not add a second confirmation dialog. The panel itself is the review step.
Disable the final button only during the current request, preserve visible
focus, expose a textual busy state, and make duplicate activation safe at the
server.

### Success, stale and failure presentation

Successful direct handoff:

```text
Handed off to Amélie
Website accepted the change. The correction is still open.
```

Successful return when others remain:

```text
Returned
Amélie remains responsible. The correction is still open.
```

Successful return when nobody remains:

```text
Returned for reassignment
This is no longer in your tasks. Website still needs an owner.
```

The confirmation is announced as a status message, the task list updates from
the authoritative receipt/current source ceiling, and focus returns to the
next sensible task or list heading. A toast alone is insufficient; durable
history remains available on the source-authorized detail surface.

If another actor changed the assignment first:

```text
This assignment changed
Website has refreshed the current owner and available choices. Nothing was
changed by your request.
```

If the selected person ceased to qualify:

```text
Amélie can no longer receive this work
Choose another eligible person or return it for reassignment.
```

Do not expose whether the cause was termination, suspension, Site access,
conflict, assurance, leave, policy or another protected fact unless the actor
is separately authorized to see that reason.

### History vocabulary

- **Handed off to [person]** only when the viewer may see the successor's
  identity; otherwise **Handed off**.
- **Returned** when the predecessor ended without naming a successor and other
  current responsible people remain.
- **Returned for reassignment** when the predecessor ended without naming a
  successor and nobody remains.
- **Taken over by [person]** only for the separately authorized D27 takeover
  command and only when identity is visible.
- **Assignment ended** for a body-free historical record when policy forbids a
  more specific presentation.
- **Access changed** is a current visibility result, not a successful handoff or
  task completion reason.

The task is never marked **Completed**, **Dismissed**, **Canceled** or
**Reassigned to Website** merely because the recipient returned it.

### Mobile, low bandwidth and international use

- The narrow-screen sheet keeps the title, exact scope and final action visible
  without horizontal tables or hover dependencies.
- People choices and final actions meet the shared touch-target and visible-
  focus contract; all interaction is keyboard operable.
- Candidate loading is progressive. Return does not depend on downloading the
  complete candidate set.
- Network failure preserves the panel choice in memory but revalidates before
  retry; it never caches authorization as authority.
- Names, source qualifiers and messages support Unicode, bidirectional text and
  localization. Actor names are never interpolated into machine-generated
  grammatical structures that cannot be localized safely.
- Dates are not required for D33. A future availability product must define
  Tenant/user time zones and daylight-saving behavior separately.
- The UI remains useful without avatars, profile photos, presence, email or a
  fast connection.

## Source of truth and domain invariants

### Ownership map

| Fact                                           | Authority                                              | Derived consumers                             | Never authority                         |
| ---------------------------------------------- | ------------------------------------------------------ | --------------------------------------------- | --------------------------------------- |
| Current correction condition and action scopes | Website source adapter                                 | Tasks Hub, notifications, operational views   | Task title, comment, unread, worker     |
| Current recipient responsibility               | Website source responsibility head                     | Task assignment projection                    | Mutable task assignee column            |
| Who may initiate own return                    | Website source command plus current session            | Tasks UI                                      | Generic task edit/admin capability      |
| Who may receive exact scopes                   | Current source eligibility resolver                    | Purpose-limited picker                        | Tenant directory, role name, task queue |
| Return/handoff transition                      | Immutable Website source occurrence and receipt        | Task history, notifications, audit projection | Client response, Inngest run            |
| Task discovery and engagement                  | Tasks Hub                                              | My tasks, counts                              | Website success/completion              |
| Read/unread                                    | Recipient notification/engagement projection           | Badge and list emphasis                       | Responsibility or source state          |
| Dispatch/reconciliation execution              | Product dispatch ledger plus optional Inngest executor | Technical telemetry                           | Human/source outcome                    |

### Invariants

1. One predecessor recipient-assignment generation has at most one terminal
   source responsibility transition.
2. A direct handoff receipt identifies exactly one committed successor
   responsibility generation.
3. A return receipt identifies no named successor, preserves every other
   current responsible recipient, and advances the exact scopes to
   `needs_assignment` only when nobody remains.
4. The initiating actor, Tenant, predecessor, source work, action scopes,
   environment and timestamps come from trusted server/source context.
5. A destination reference is usable only for the resolver query, source heads
   and actor context for which it was issued; submit always re-evaluates it.
6. Assignment never grants Tenant membership, Site visibility, content edit,
   publication, review, communication, Giving, finance or source action
   authority.
7. Returning or handing off one recipient's scopes cannot end, reset, mark
   unread, or reassign an unchanged sibling recipient.
8. The predecessor history is immutable. A later transfer creates another
   generation; it never overwrites the first actor or outcome.
9. A newly admitted scope can merge into the successor's existing one-row task
   projection only if the source contract proves compatible identity and
   presentation; source action history stays distinct.
10. No eligible successor is a valid source state, not a reason to weaken
    eligibility or retain a false current owner silently.
11. Indeterminate actor/source authority writes nothing. Indeterminate
    destination search may still allow a separately proved return.
12. Same semantic command retry returns the original receipt. Changed meaning
    under the same idempotency key rejects.
13. Every successful source transition and identifier-only projection intent
    commits atomically.
14. Task/notification lag cannot restore actionable presentation to the ended
    predecessor or hide source discovery of unassigned work.
15. AI can prepare or explain the same allowed action but cannot enumerate more
    people, widen eligibility or bypass the human confirmation required of the
    initiating user.

## Lifecycle and transition model

### Recipient-assignment generation

The conceptual lifecycle is:

```text
active
  ├─ handed_off ──────────> successor generation active
  ├─ returned ────────────> successor keeps continuing recipients
  │                          or source state needs_assignment
  ├─ taken_over ──────────> successor generation active
  ├─ source_satisfied ────> terminal
  ├─ source_inapplicable ─> terminal
  └─ authority_ended ─────> protected removal/recovery
```

Every terminal edge is source-owned and immutable. `handed_off`, `returned`
and `taken_over` are responsibility outcomes, not work completion. The parent
correction episode and other action scopes may remain active.

### Valid D33 transitions

- `active -> handed_off` only when one exact successor generation commits in
  the same source transaction.
- `active -> returned` only when the current recipient may relinquish the exact
  scopes; the complete successor preserves other responsible recipients and
  enters `needs_assignment` only if none remain.
- `active -> taken_over` is not this recipient command; it belongs to the
  separately authorized source takeover path.
- A terminal predecessor never returns to `active`. A later responsibility
  change creates a successor generation.

### Forbidden transitions

- Task assignee field update without a source receipt.
- `returned -> completed` because no successor was found.
- Direct handoff to self. A currently equivalent co-recipient may be named only
  for deliberate consolidation that creates no duplicate assignment/unread.
- Cross-Tenant, cross-environment, cross-Site, cross-source or cross-action
  destination reuse.
- Automatic restoration of a predecessor when a successor later becomes
  ineligible.
- Automatic route weakening from exact eligibility to closest match.
- Handoff based only on a comment, explanation, mention, email, saved reviewer,
  queue membership, role label, AI inference or historical assignment.

## Source command and eligibility contract

### Resolve choices

The server receives only an opaque task/source reference and expected client
view version. It derives the current Tenant, actor, active assignment,
registered source adapter, exact scopes and allowed operation. The source
returns:

- one short-lived opaque choice-set identity;
- exact safe scope labels and consequences;
- whether direct handoff is supported;
- whether return is supported;
- purpose-minimized eligible destinations or a cursor/search capability;
- current assignment, source, routing, policy and authorization heads;
- a protected no-match/indeterminate posture; and
- source-owned final-action labels.

The response contains no protected feedback body, source document, broad
directory, raw role/capability claims, credential, signed URL or reusable
authorization token.

### Direct handoff commit

The synchronous privileged command conceptually accepts:

- task/source reference;
- opaque choice-set identity;
- opaque destination reference;
- exact selected source-action scope identities if the source offered a
  subset choice;
- expected assignment/source/routing/policy/authorization heads; and
- a durable client-generated idempotency key tied to canonical meaning.

It derives and rechecks everything else. In one short transaction it:

1. locks or compare-and-swaps the current responsibility head;
2. proves the actor still owns the predecessor assignment and may hand it off;
3. proves the destination is a different, active, same-Tenant person currently
   eligible for every selected scope;
4. proves current source actionability, Site/environment scope, privacy,
   conflict/independence and policy facts;
5. ends the predecessor with `handed_off`;
6. appends one successor responsibility generation;
7. appends an immutable source transition receipt and trusted attribution; and
8. writes identifier-only task/notification projection intent.

It returns the source receipt. It does not wait for task materialization,
notification delivery or Inngest.

### Return commit

Return uses the same current actor, assignment, scope, source and expected-head
proof but has no destination person. It atomically:

1. ends only the predecessor with `returned`;
2. appends a complete successor generation that preserves every other current
   responsible recipient and their exact scope memberships;
3. advances the exact scopes to `needs_assignment` only if nobody remains;
4. may invoke only the exact D31 source contract's separately registered
   recovery-attention resolver, which can alert coordination recipients but
   cannot silently make them correction owners; D29 Review coordinators are
   never reused by convention;
5. appends the source receipt and trusted attribution; and
6. writes identifier-only projection intent.

If no other responsible recipient remains and every registered recovery-
attention recipient is the returning actor, already equivalently engaged,
inactive, unauthorized, unavailable under a governed policy, or otherwise
ineligible, Core creates no guessed correction assignment or duplicate
attention. Work stays source-discoverable with a routing gap.

### Eligibility predicates

Every offered person must satisfy all source-required predicates at both query
and commit, including where applicable:

- same exact Tenant and environment;
- current Active Tenant Assignment and active profile/person relationship;
- current Site/source visibility;
- current action-specific capability and source edit authority;
- current source responsibility policy and recipient ceiling;
- conflict, independence, assurance or separation-of-duties rules;
- not the current actor for the same assignment edge;
- if already an equivalent current recipient, source policy admits explicit
  consolidation and the preview discloses that no fresh task/unread is created;
- no source-defined exclusion, suspension or terminal lifecycle state; and
- any registered, authoritative availability predicate.

The resolver must not invent generic skills, capacity, working hours,
geography, language proficiency or out-of-office facts. Those are eligible
inputs only after another decision defines their source, meaning, freshness,
privacy and failure posture.

## Database, RLS and authorization safety

### Conceptual persisted facts

The eventual design needs, names notwithstanding:

1. **Source responsibility head** — Tenant, environment, source-work identity,
   action-scope set/digest, current routing generation, state and version.
2. **Recipient-assignment generation** — immutable identity, predecessor,
   recipient Party/profile reference, responsibility role, admitted scopes,
   source/routing/policy heads, active interval and typed terminal reason.
3. **Responsibility transition occurrence** — predecessor, transition kind,
   nullable successor, actor, exact scope digest, expected/committed heads,
   semantic idempotency identity, receipt and timestamps.
4. **Destination choice set** — preferably ephemeral or short-retained opaque
   resolver state with no broad directory snapshot; never the authority after
   submit.
5. **Projection intent/receipt** — identifier-only task and notification
   materialization/reconciliation record.

### Structural constraints

- Composite keys and foreign keys include Tenant wherever relationships cross
  task, source, assignment, person, receipt or projection tables.
- A person handoff requires one non-null successor and a return forbids one.
- Predecessor and successor must share Tenant, environment, source work and
  admitted scope lineage.
- A successor generation cannot equal its predecessor or current actor edge.
- One semantic transition effect exists for one predecessor/idempotency
  meaning; duplicate delivery cannot append another successor.
- One recipient has at most one active equivalent projection per source work,
  action role and surface.
- Terminal reason and successor presence combinations are constrained rather
  than trusted to application convention.
- Source transition and projection intent share a transaction boundary.
- Historical Party/actor attribution survives profile deactivation or deletion
  through the repository's governed identity/tombstone pattern; `ON DELETE SET
NULL` must not erase business attribution.
- Mutable title, description, task status, assignee, queue, comment or event
  JSON cannot substitute for these relationships.

### Grants, RLS and privileged paths

- Authenticated clients do not receive direct INSERT/UPDATE/DELETE grants on
  source responsibility transitions or source-backed assignment authority.
- A privileged `packages/api` command performs current actor and source checks;
  app handlers remain thin.
- Read policies and server queries scope every task, choice and history read by
  Tenant, current assignment/purpose and source visibility.
- If any mutable projection table is exposed under RLS, `USING` constrains the
  old row and `WITH CHECK` constrains the new row so a permitted update cannot
  move data to another Tenant, person, source, policy or completion authority.
- Security-definer functions fix `search_path`, use least grants, derive actor
  and Tenant from trusted context, and do not accept caller-authored attribution
  or authorization claims.
- Service-role, job, import, support, AI and repair paths call the same domain
  command or an equally strict source-certified repair boundary. BypassRLS is
  never treated as product permission.
- Counts, autocomplete, `404` behavior and timing must not enumerate another
  Tenant or disclose protected eligibility reasons.

## Privacy and security

- Candidate search returns only purpose-minimized same-Tenant identity needed
  for this choice. A task recipient does not automatically receive a Tenant
  directory entitlement.
- Protected correction explanation, anchor, candidate content and Site details
  remain source-loaded; they do not enter destination options, task snapshots,
  event envelopes, traces, metrics, cache keys, search/AI indexes or emails.
- The destination's name appears to the predecessor only while that display is
  separately permitted. Durable body-free history can say **Handed off**.
- The target learns only the task's D31-admitted safe list facts until they open
  the source and pass current authorization.
- No automatic email is sent by default. A later tenant notification policy may
  govern optional assignment email within bounded safe templates, but cannot
  change source state or eligibility.
- Optional handoff notes are not assumed by D33. If later admitted, they need a
  separate purpose, length, retention, privacy and display decision; do not
  reuse D30's protected review explanation as a routing note.
- Audit records separate actor identity, source responsibility effect and
  technical execution. They do not store hidden eligibility reasons as free
  text.
- Exports and analytics expose aggregate, purpose-approved routing outcomes,
  not protected candidate rosters or staff absence/health inferences.

## Failure, concurrency and recovery

| Condition                                     | User-visible result                                                        | Authoritative response                                      |
| --------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Selected target becomes ineligible            | Explain that the person can no longer receive it; refresh choices          | Reject; write nothing                                       |
| Another actor hands off/takes over first      | Explain that assignment changed and show permitted current context         | Expected-head loser writes nothing                          |
| Same submit delivered twice                   | Return original success                                                    | Same key and canonical meaning resolves to receipt          |
| Same key reused for different target/scopes   | Explain request conflict safely                                            | Reject changed meaning                                      |
| Source commit succeeds, response is lost      | Retry resolves original receipt; task does not reappear as actionable      | Product receipt lookup, not a second transition             |
| Source commit succeeds, task projection fails | Show authoritative success; stale predecessor suppressed by source ceiling | Outbox retry/reconciliation materializes projection         |
| Task projection appears before notification   | Task is actionable; unread may arrive later without duplicate task         | Independent monotonic projections                           |
| Candidate resolver times out                  | Preserve return if independently safe; otherwise offer retry/source link   | No candidate guessed or cached as authority                 |
| No eligible destination                       | Explain return and unassigned consequence                                  | `needs_assignment`, routing-gap monitor                     |
| Current actor loses source authority          | Remove protected action/detail; do not call it handoff                     | Source ends/repairs assignment under typed authority result |
| Successor becomes ineligible after commit     | Do not restore predecessor automatically                                   | End successor generation and enter new recovery evaluation  |
| Source adapter unavailable                    | Keep source work authoritative and discoverable                            | No task mutation; recover adapter/dispatch                  |
| Inngest unavailable                           | Synchronous transition still succeeds or fails truthfully                  | Dispatch ledger/recovery scan catches projection intent     |
| Partial source-recovery route resolution      | Do not release a partial personal set                                      | Fail closed or use source-defined complete bounded result   |
| User closes panel mid-request                 | Reopen reflects receipt/current state                                      | Idempotent command and current source read                  |
| Offline/low-bandwidth retry                   | Explain pending network request, never optimistic ownership                | Submit only when connected; current recheck                 |

### Ping-pong and repeated transfers

Repeated legitimate handoff must remain possible; a hard cycle ban would trap
staff after circumstances change. The product instead makes current ownership
and recent source-authorized transition history visible, uses a concise reason
only if a later decision requires it, and monitors abnormal churn. Automated
back-and-forth routing is forbidden unless a separately governed source policy
defines a terminating, idempotent rule.

## Out-of-office, inactivity and inaccessible recipients

### Planned leave

**Verified external fact:** Workfront's planned delegation is a time-bounded,
separate model that leaves the original assignee and delegate visible and has
distinct permission consequences.

**Product judgment:** D33 does not silently become a universal availability or
delegation feature. A staff person may return or directly hand off an exact
current task before leave. Future planned delegation requires its own owner,
time-zone rules, acceptance/consent decision, scope selection, future-work
rules, permission boundary and expiration behavior.

### Deactivated or access-lost current recipient

The source must reconcile automatically. A deactivated person cannot be
required to sign in and return work. Their personal projection becomes
inapplicable without a false completion/handoff claim, and the exact scopes
enter source recovery. Historical attribution remains.

### Inaccessible proposed recipient

The person is never offered when the source can prove lack of access. A stale
choice is rejected on commit. Core does not copy Contentful's documented
failure mode in which assignment succeeds but the assignee cannot read the
entry.

### Zero eligible people

Zero is not failure of the UI. It is a source-owned `needs_assignment`
posture with an explicit staff message, source discovery path, routing-gap age,
and accountable operational monitor. Core never assigns a super-admin, author,
requester, historical coordinator, closest skill match or service account by
default.

## Inngest boundary

### Synchronous product-owned work

Choice resolution, final authorization, expected-head conflict, source
responsibility transition, immutable receipt and outbox/dispatch intent are
product-owned. The user receives success only from that authoritative command.

### Appropriate asynchronous work

Inngest may execute short, identifier-only, replay-safe jobs for:

- materializing/merging successor task projections;
- ending predecessor projections;
- creating one new recipient unread projection;
- reconciling missing/stale projections;
- emitting permitted aggregate telemetry; and
- escalating exhausted projection failures through existing policy.

Each step reloads current product records under Tenant scope and uses product
claims. Event IDs and function idempotency reduce duplicate execution but the
database owns permanent semantic uniqueness.

### Forbidden Inngest roles

Inngest does not:

- wait for a person to accept or finish work;
- choose, rank or remember eligible recipients;
- parse review explanations or handoff notes;
- own the current assignment, return, handoff or completion state;
- carry names, protected content, broad permission claims or source bodies;
- repair uncertainty by guessing a destination; or
- become the only history, receipt, idempotency or recovery mechanism.

## Migration, rollout and rollback

### Required rollout order

1. Freeze the D33 contract in the decision log, glossary/ADR and later
   OpenSpec/design without changing current runtime claims.
2. Add immutable source responsibility generations, transition receipts,
   expected heads, typed end reasons and outbox facts additively.
3. Add server-side denial guards so generic assignment/status/bulk/API/import/
   AI/service-role paths cannot mutate D31/D32/D33 source-backed tasks.
4. Add source choice resolution and transition commands behind a kill switch;
   prove Website eligibility and return rules before any task entry point.
5. Add policy-aware readers and query-time source ceilings to suppress stale
   predecessors.
6. Shadow resolve eligible choices and compare them with current Website
   responsibility without exposing the action.
7. Canary **This needs someone else** for selected Tenants/Sites and one Website
   source-action family at a time.
8. Enable projection/reconciliation workers only after synchronous source
   receipts and manual roll-forward repair are proven.
9. Expand across Page, Navigation, Communications and Site/default adapters
   only with adapter-specific authorization, privacy, race and zero-recipient
   evidence.
10. Register Mobilize or another domain only after it proves an independent
    source responsibility contract; do not copy Website predicates by name.

### Backfill

Do not infer historical handoffs from mutable `assignee_profile_id`, task
events, comments, notifications, authors or queue changes. Existing rows may be
classified as legacy/manual or linked only where an authoritative source can
deterministically issue a current assignment generation. Historical unknowns
remain unknown.

### Mixed-version safety

- Old clients cannot see a writable generic assignee/status control for a
  source-backed task, and the server rejects it even if sent.
- New readers tolerate absent D33 fields by treating the item as not handoff-
  capable and linking to its source.
- New writers use additive facts that old readers ignore safely.
- Projection workers understand versioned contracts and fail closed on unknown
  source adapters or transition kinds.
- Feature shutdown removes the D33 entry point but leaves source work,
  generations, receipts and repair usable.

### Rollback

Stop new D33 commands and projection dispatch. Do not delete or reverse source
transitions already accepted. Reconcile their task projections forward from
immutable receipts. If an implementation defect created a false task
projection, correct only the projection under audit; never rewrite Website
responsibility history without a separately authorized source correction.

## Proof portfolio

The later implementation must prove user-visible and domain outcomes, not only
component or SQL details:

- direct handoff to one currently eligible person;
- return with a registered source-recovery route, with unchanged recipients,
  with only the current actor eligible, and with proved zero;
- direct target already owns an equivalent projection;
- grouped compatible scopes and unsupported partial-scope movement;
- current actor, target, Site, policy, source or action authorization loss at
  every request boundary;
- cross-Tenant, cross-environment, cross-Site, cross-source and guessed-ID
  denial;
- stale picker, stale expected head, concurrent handoff/takeover/source end and
  repeated-click/lost-response races;
- source success plus projection/notification/dispatch failure and replay;
- deactivation before and after commit;
- successor eligibility loss without predecessor resurrection;
- no generic complete/reopen/dismiss/delete/reassign/bulk/import/API/AI bypass;
- screen-reader names, keyboard-only picker/dialog behavior, focus restoration,
  status announcements, zoom/reflow, touch, reduced motion and contrast;
- long and bidirectional names, diacritics, duplicate display names, absent
  avatars, narrow screens and slow/interrupted connections;
- source history versus task projection history and identity-redacted history;
- additive migration with old reader/new writer and new reader/old writer; and
- kill switch, dispatch-off, Inngest outage, reconciliation and roll-forward
  repair.

## Research-only acceptance outcomes

### Decision, ownership and vocabulary

- **D33-RA1:** D33 accepts source-validated return or handoff with the precision
  amendments in this record.
- **D33-RA2:** **This needs someone else** is the one recipient-facing entry
  action for both direct handoff and source return.
- **D33-RA3:** **Hand off** means one named successor responsibility generation
  committed; **Return** means no named successor, preserves other current
  recipients, and uses `needs_assignment` only if nobody remains.
- **D33-RA4:** Tasks Hub initiates and presents; the registered source owns
  eligibility, transition, successor, end reason and audit.
- **D33-RA5:** A generic mutable assignee field never represents source
  responsibility.
- **D33-RA6:** The current recipient may initiate only for their own current
  assignment generation.
- **D33-RA7:** Coordinator takeover/reassignment of another person's work uses
  a separately authorized source command.
- **D33-RA8:** Return and handoff never mean task completion, correction
  completion, approval, publication or public effect.
- **D33-RA9:** The task predecessor is immutable history; every later owner is a
  successor generation.
- **D33-RA10:** D33 defines a shared contract shape, not shared cross-domain
  business eligibility.

### Staff UX and interaction

- **D33-RA11:** The primary task action remains **Open Website work**.
- **D33-RA12:** **This needs someone else** is a visible text action in task
  detail, not an icon-only or overflow-only control.
- **D33-RA13:** No row checkbox, inline assignee edit, drag, swipe, bulk action
  or keyboard shortcut performs source handoff.
- **D33-RA14:** One responsive Base Maia panel explains exact scope and
  consequences before selection.
- **D33-RA15:** The panel explicitly says handoff grants no access and does not
  mark the correction done.
- **D33-RA16:** Direct handoff and return are one required single choice, not
  parallel accidental actions.
- **D33-RA17:** Direct handoff reveals a source-constrained single-select people
  picker.
- **D33-RA18:** Return requires no fake person, queue or administrator target.
- **D33-RA19:** The final action label includes the actual consequence and, when
  permitted, selected display name.
- **D33-RA20:** The deliberate panel is the confirmation; no second confirmation
  dialog is added.
- **D33-RA21:** A successful handoff says the Website correction remains open.
- **D33-RA22:** A successful return names the responsible people who remain or,
  if none remain, says Website still needs an owner.
- **D33-RA23:** A stale-head conflict says the assignment changed and that the
  attempted request changed nothing.
- **D33-RA24:** A newly ineligible destination produces a refreshed choose-or-
  return path without exposing the protected reason.
- **D33-RA25:** A toast never serves as the only success/failure record or
  assistive-technology announcement.

### Choice resolution and destination eligibility

- **D33-RA26:** Initiator authority and receiver eligibility are separate
  server predicates.
- **D33-RA27:** Every eligible destination is same-Tenant, active and currently
  qualified for every moved source-action scope.
- **D33-RA28:** Query-time eligibility never substitutes for submit-time
  reauthorization.
- **D33-RA29:** Destination references are opaque, short-lived and bound to the
  exact choice/source/head context.
- **D33-RA30:** Arbitrary email, pasted identifier, external reviewer, saved
  reviewer, team, role and queue are not person destinations.
- **D33-RA31:** The current actor is not a direct destination for their own
  assignment.
- **D33-RA32:** An already equivalent recipient is never offered as a duplicate
  assignment but may be selected for deliberate consolidation when the source
  preview proves they remain responsible without a new task or unread pulse.
- **D33-RA33:** Compatible new scopes may merge into one existing recipient task
  projection without merging source history.
- **D33-RA34:** Candidate names and qualifiers are purpose-minimized and do not
  expose hidden eligibility facts.
- **D33-RA35:** Search is server-side and cursor-based for large eligible sets;
  the Tenant directory is never downloaded for client filtering.
- **D33-RA36:** Candidate ordering is deterministic and neutral unless the
  source owns and explains a ranking policy.
- **D33-RA37:** Core does not infer availability, skills, language proficiency,
  capacity or working hours in D33.
- **D33-RA38:** A governed availability fact may narrow eligibility later but
  cannot grant source permission.
- **D33-RA39:** Candidate search and error behavior do not enumerate cross-
  Tenant or protected people.
- **D33-RA40:** A selected person can receive only after the final atomic source
  command succeeds.

### Return, source-recovery route and zero-recipient behavior

- **D33-RA41:** Return ends only the initiating recipient's exact assignment
  scopes.
- **D33-RA42:** Return preserves other current responsible recipients and
  advances the exact scopes to source-owned `needs_assignment` only if nobody
  remains.
- **D33-RA43:** Only a separately registered D31 source-recovery resolver may
  create recovery-attention projections; it cannot silently make those people
  correction owners, and D29 Review coordinators are never copied or reused by
  convention.
- **D33-RA44:** The returning actor is excluded from a no-op successor route for
  the same assignment.
- **D33-RA45:** Unchanged current responsible and recovery-attention recipients
  retain their task and engagement state.
- **D33-RA46:** A newly admitted recovery-attention recipient receives at most
  one compatible coordination projection and one unread occurrence; that
  projection is not correction responsibility.
- **D33-RA47:** Partial, stale, contradictory, timed-out or over-ceiling route
  results never release a partial personal set.
- **D33-RA48:** Proved zero creates no guessed assignee, queue, admin or service
  account.
- **D33-RA49:** Return with continuing responsible people is **Returned**;
  zero-responsible return is **Returned for reassignment**, never **Reassigned**
  or **Completed**.
- **D33-RA50:** Source work remains discoverable to independently authorized
  Website staff when no personal recipient exists.
- **D33-RA51:** A routing-gap monitor owns prolonged unassigned work.
- **D33-RA52:** Candidate-resolution indeterminacy may preserve return only when
  relinquishment authority is separately proved.
- **D33-RA53:** Indeterminate actor/assignment/source authority writes nothing.
- **D33-RA54:** The UI offers retry and the exact source destination when no
  safe transition is currently available.
- **D33-RA55:** Returning cannot silently restore or retain the actor as current
  owner.

### Lifecycle, concurrency and idempotency

- **D33-RA56:** Valid terminal predecessor reasons include `handed_off`,
  `returned`, separately authorized `taken_over`, source end and authority end.
- **D33-RA57:** `handed_off` requires one exact committed successor generation.
- **D33-RA58:** `returned` forbids a named successor on that transition
  occurrence.
- **D33-RA59:** A terminal predecessor never reopens; changed responsibility
  creates another generation.
- **D33-RA60:** Successor ineligibility does not resurrect the predecessor.
- **D33-RA61:** Source-action, assignment, routing, policy and authorization
  heads are rechecked at commit.
- **D33-RA62:** Expected-head compare-and-swap allows at most one concurrent
  winner.
- **D33-RA63:** Handoff versus return, takeover, source satisfaction,
  cancellation, policy change and access loss are race-tested.
- **D33-RA64:** Same idempotency key and canonical meaning returns the original
  receipt.
- **D33-RA65:** Same idempotency key with changed target or scopes rejects.
- **D33-RA66:** Lost success responses are recovered from product-owned receipt
  lookup.
- **D33-RA67:** Duplicate clicks, API retries, worker replay and manual recovery
  cannot append duplicate successors.
- **D33-RA68:** Repeated legitimate handoff remains possible through successive
  generations rather than overwriting history.
- **D33-RA69:** Core monitors handoff churn instead of imposing a brittle cycle
  ban.
- **D33-RA70:** Automatic routing loops are forbidden without a separately
  governed terminating source policy.

### Database, RLS and authorization

- **D33-RA71:** Tenant, environment, source work, action scope, predecessor,
  actor and timestamps are derived from trusted context.
- **D33-RA72:** Composite Tenant-aware relationships connect source heads,
  assignments, transitions, people, receipts and projections.
- **D33-RA73:** Person-handoff and return successor/null combinations are
  database-constrained.
- **D33-RA74:** One predecessor has at most one terminal transition effect.
- **D33-RA75:** One recipient has at most one active equivalent task projection
  for the same source work/action role/surface.
- **D33-RA76:** Source transition and identifier-only projection intent commit
  atomically.
- **D33-RA77:** Historical actor attribution survives profile deactivation or
  deletion under governed identity retention.
- **D33-RA78:** Authenticated clients have no direct source-responsibility
  mutation grant.
- **D33-RA79:** A privileged `packages/api` source command is the authoritative
  mutation boundary.
- **D33-RA80:** App route handlers remain thin and do not reproduce business
  authorization.
- **D33-RA81:** RLS `USING` and `WITH CHECK` protect both old-row visibility and
  new-row validity wherever a mutable projection is exposed.
- **D33-RA82:** Security-definer functions use fixed `search_path`, least grants
  and trusted actor/Tenant derivation.
- **D33-RA83:** Service-role, support, import, job, AI and repair paths preserve
  the same source authorization.
- **D33-RA84:** BypassRLS or generic admin status never means product handoff
  authority.
- **D33-RA85:** Database repair corrects projections from source receipts and
  does not invent source transitions.

### Privacy, notifications and audit

- **D33-RA86:** Assignment grants no access, capability, membership, Site
  visibility, publication, communication, Giving or finance authority.
- **D33-RA87:** Protected correction content remains at the source and is not
  copied into tasks, choices or workflow events.
- **D33-RA88:** The candidate list is a purpose-limited eligibility projection,
  not a staff directory.
- **D33-RA89:** Successor identity is shown in history only under current
  purpose authorization.
- **D33-RA90:** The successor initially sees only D31-admitted safe task facts.
- **D33-RA91:** New successor assignment creates one in-product unread state.
- **D33-RA92:** Unchanged recipients' read/unread state is not reset.
- **D33-RA93:** D33 sends no recurring reminder or email by default.
- **D33-RA94:** Task history, source business audit and technical execution logs
  remain distinct evidence planes.
- **D33-RA95:** Audit records trusted actor, predecessor, transition kind,
  successor reference when permitted, scopes, heads, receipt and time.
- **D33-RA96:** Eligibility denial reasons are not copied as free text into
  history, telemetry or notifications.
- **D33-RA97:** Optional handoff explanation/note is deferred and cannot reuse
  D30 feedback without a separate purpose decision.
- **D33-RA98:** AI and search indexing exclude protected candidate rosters,
  source content and hidden routing facts.
- **D33-RA99:** Analytics use purpose-approved aggregates rather than employee-
  monitoring or absence inferences.
- **D33-RA100:** Support-safe diagnostics use identifiers and typed states, not
  protected bodies or directory dumps.

### Accessibility, localization and performance

- **D33-RA101:** The panel and picker use shared `@asym/ui`, Base UI and exact
  Base Maia/Zinc semantics.
- **D33-RA102:** The people picker follows the established combobox keyboard and
  focus contract.
- **D33-RA103:** Option accessible names remain simple strings; interactive
  controls are not nested inside options.
- **D33-RA104:** Success, conflict, loading and refreshed-choice status changes
  are announced without stealing focus.
- **D33-RA105:** Focus returns predictably after cancel, success and failure.
- **D33-RA106:** Color, avatar and initials never carry the only identity or
  state meaning.
- **D33-RA107:** The flow supports keyboard-only, touch, screen reader, zoom,
  reflow, contrast and reduced-motion use.
- **D33-RA108:** Mobile uses a readable sheet and no hover, wide table or hidden
  swipe requirement.
- **D33-RA109:** Search and display support Unicode, diacritics, bidirectional
  names and non-Western name order.
- **D33-RA110:** The flow works without profile photos, email, presence or fast
  bandwidth.
- **D33-RA111:** Return does not require loading a complete eligible-person
  collection.
- **D33-RA112:** Eligible search is indexed, paginated and Tenant-fair; no N+1
  source call occurs per option.
- **D33-RA113:** The final command is one short synchronous source transaction,
  not a long-held browser or workflow session.
- **D33-RA114:** No exact hard candidate-count limit is frozen until production-
  shaped data establishes one; bounded pagination and response budgets remain
  required.
- **D33-RA115:** Time zones and planned delegation are explicitly out of D33
  rather than handled incorrectly.

### Failure recovery, Inngest and operations

- **D33-RA116:** Source success plus task-projection failure still yields a
  truthful source receipt and stale-predecessor suppression.
- **D33-RA117:** Projection reconciliation is monotonic from current source
  state and immutable receipts.
- **D33-RA118:** Inngest may project/reconcile but never choose recipients or own
  human/source state.
- **D33-RA119:** Inngest events are identifier-only and exclude names and
  protected source content.
- **D33-RA120:** Product claims and permanent database uniqueness guard every
  retryable effect.
- **D33-RA121:** Inngest's 24-hour deduplication window is never permanent
  product idempotency.
- **D33-RA122:** Dispatch outage does not block or redefine the synchronous
  source transition.
- **D33-RA123:** Recovery scans repair projection handoff and do not create a
  business handoff.
- **D33-RA124:** Dead-lettered projection work is visible under current Tenant
  notification policy and manual repair remains available.
- **D33-RA125:** Body-free diagnostics distinguish resolver, command, outbox,
  task projection and notification failures.

### Migration, proof and cross-domain reuse

- **D33-RA126:** No historical handoff is inferred from mutable task assignee,
  queue, comment, notification or author facts.
- **D33-RA127:** New schema and readers are additive and old clients fail closed
  for source-backed reassignment.
- **D33-RA128:** Denial guards deploy before any D33 producer or UI entry point.
- **D33-RA129:** Choice/command adapters shadow before canary exposure.
- **D33-RA130:** Rollback stops new commands but preserves accepted source
  transitions and rolls projections forward.
- **D33-RA131:** Page, Navigation, Communications and Site/default adapters each
  prove their own action, privacy, return and eligibility contracts.
- **D33-RA132:** Mobilize cannot register merely by copying Website predicates;
  it must define its own source responsibility and successor rules.
- **D33-RA133:** Positive, negative, boundary, concurrency, migration,
  accessibility and production-shaped tests trace to D33 requirements.
- **D33-RA134:** Tests assert user-visible/source outcomes and no unauthorized
  effect, not only picker rendering or database rows.
- **D33-RA135:** Release evidence includes canary metrics, routing gaps, false
  handoff checks, task-projection lag and representative staff comprehension.
- **D33-RA136:** Current prototype task behavior is documented as current, not
  represented as accepted or Live D33 behavior.
- **D33-RA137:** D33 remains Reserved until OpenSpec, design, implementation,
  migration, authorization, a11y, operational and release proof exist.
- **D33-RA138:** Broad repository verification remains deferred until the end
  of the Grill session as directed.

## Named monitors

| Signal                                              | Threshold                                                                             | Owner                                | Required response                                                                                                           |
| --------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `source_handoff_false_success_total`                | Any receipt without the exact authoritative source transition                         | Website source owner + Data Platform | Stop writer cohort, disable D33 command, reconcile from source audit, open incident                                         |
| `source_handoff_cross_tenant_total`                 | Any cross-Tenant candidate read or transition                                         | Security + Data Platform             | Stop-ship/incident, revoke affected path, preserve evidence, assess disclosure                                              |
| `source_handoff_ineligible_success_total`           | Any committed successor failing eligibility at commit time                            | Website source owner + Identity      | Stop writer, inspect policy/head race, correct projection only after source adjudication                                    |
| `source_handoff_wrong_scope_total`                  | Any sibling recipient or unselected scope changed                                     | Website source owner                 | Stop affected adapter, repair from receipts, add regression                                                                 |
| `source_handoff_duplicate_successor_total`          | Any duplicate successor for one semantic transition                                   | Data Platform                        | Fence writer/idempotency, stop replay, reconcile duplicates under audit                                                     |
| `source_handoff_stale_head_success_total`           | Any stale assignment/source/policy head accepted                                      | Data Platform + Website              | Disable command, inspect CAS boundary, repair affected occurrences                                                          |
| `source_return_false_reassigned_total`              | Any zero-successor return displayed/audited as named reassignment                     | Tasks Hub + Product UX               | Correct vocabulary/projection, audit staff impact, block expansion                                                          |
| `source_return_routing_gap_age_seconds`             | p95 above 1 business day or any critical Website correction above 4 hours             | Website operations owner             | Review the exact source recovery contract/eligibility, route only through authorized source recovery, no guessed assignment |
| `source_return_no_discovery_total`                  | Any returned source work invisible to all independently authorized source staff       | Website source owner + Security      | Stop return path, restore source discovery under audit, repair authorization                                                |
| `source_handoff_projection_lag_seconds`             | p95 above 60 seconds for 15 minutes or any item above 300 seconds                     | Tasks Hub + Workflow Platform        | Run reconciliation, inspect outbox/worker, communicate operational degradation                                              |
| `source_handoff_stale_predecessor_actionable_total` | Any ended predecessor remains actionable after current source read                    | Tasks Hub                            | Apply source ceiling, disable stale writer/cache, reconcile                                                                 |
| `source_handoff_missing_successor_task_total`       | Any eligible committed successor lacks task projection after 300 seconds              | Tasks Hub + Workflow Platform        | Reconcile receipt, inspect uniqueness/dispatch, preserve source truth                                                       |
| `source_handoff_duplicate_successor_task_total`     | Any successor sees duplicate equivalent rows                                          | Tasks Hub                            | Merge/reconcile projection, fix uniqueness, do not alter source history                                                     |
| `source_handoff_unread_duplicate_total`             | More than one unread occurrence for one successor generation                          | Notifications owner                  | Deduplicate recipient engagement, repair projection key                                                                     |
| `source_handoff_unchanged_recipient_reset_total`    | Any unchanged recipient unread/engagement reset                                       | Notifications owner + Tasks Hub      | Correct projection, add sibling-recipient regression                                                                        |
| `source_handoff_candidate_resolver_error_rate`      | Above 1% for 15 minutes, excluding safe business zero                                 | Website Platform                     | Disable direct picker if needed, preserve safe return/source link, investigate adapter                                      |
| `source_handoff_command_error_rate`                 | Above 1% for 15 minutes, excluding expected stale/ineligible rejections               | Website Platform + SRE               | Inspect source command, hold cohort expansion, repair before re-enable                                                      |
| `source_handoff_conflict_rate`                      | Above 5% of attempts for 30 minutes                                                   | Product + Website                    | Review stale UI/prefetch/race design; do not weaken CAS                                                                     |
| `source_handoff_churn_per_occurrence`               | More than 3 responsibility transitions in 24 hours for one occurrence                 | Website operations owner             | Review routing clarity/eligibility with authorized history; no automatic lock                                               |
| `source_handoff_candidate_enumeration_denial_total` | Any guessed/cross-purpose candidate reference reveals existence or detail             | Security                             | Incident review, normalize denial, rate-limit/repair resolver                                                               |
| `source_handoff_protected_payload_total`            | Any protected content/name roster in event, log, trace, metric, cache key or email    | Security + Privacy                   | Stop emitter, purge where possible, rotate exposed links/credentials if any, assess incident                                |
| `source_handoff_service_role_bypass_total`          | Any privileged path commits without equivalent product authorization                  | Security + Data Platform             | Disable path, review all service-role callers, repair audit                                                                 |
| `source_handoff_mobile_success_rate`                | Below 90% of eligible canary attempts or more than 5 points below desktop             | Product UX + Web Platform            | Investigate reflow, picker, focus, latency and copy; block expansion                                                        |
| `source_handoff_staff_comprehension_rate`           | Below 90% correctly predict recipient/source outcome in representative testing        | Product Research + Website           | Revise copy/hierarchy and repeat testing before expansion                                                                   |
| `source_handoff_keyboard_completion_rate`           | Below 95% in moderated keyboard-only proof or any blocking defect                     | Accessibility owner + Web Platform   | Stop release, repair focus/combobox/dialog behavior, retest                                                                 |
| `source_handoff_screen_reader_critical_defects`     | Any blocker in choice, consequence, status or focus flow                              | Accessibility owner                  | Stop-ship affected surface, repair and independently retest                                                                 |
| `source_handoff_low_bandwidth_abandonment_rate`     | More than 10 percentage points above normal task action on canary slow-network cohort | Product UX + Web Platform            | Reduce request/asset cost, preserve retry state, inspect timeout copy                                                       |
| `source_handoff_dead_letter_age_seconds`            | Any D33 projection dead letter above 15 minutes                                       | Workflow Platform + Tasks Hub        | Reconcile from product receipt, escalate under Tenant policy, keep source authoritative                                     |
| `source_handoff_manual_db_repair_total`             | Any direct data repair not generated from an immutable source receipt                 | Data Platform                        | Stop ad hoc repair, document incident, build audited roll-forward command                                                   |

Thresholds are release contracts for the first canary, not claims about current
traffic. Product Research must revisit experience thresholds with real Tenant
and staff evidence without weakening the zero-tolerance safety signals.

## Assumptions and unresolved unknowns

### Assumptions that implementation may not silently treat as fact

- Small ministries sometimes know the correct successor without an
  administrator. Verify through representative interviews and task shadowing.
- A current recipient should generally be allowed to relinquish their own
  assignment. Verify across Website governance postures and sensitive action
  families.
- Most eligible candidate sets are small enough for a single-select searchable
  people picker. Verify distribution before freezing list limits or ranking.
- One immediate in-product unread assignment is sufficient by default. Verify
  notification expectations without importing generic sales-CRM email norms.

### Unresolved unknowns

1. Whether return or direct handoff needs a structured reason, optional note or
   no user-authored evidence. This is the recommended D34 decision below; do not
   add free text before deciding its purpose.
2. Whether Core will later own a staff availability/out-of-office domain and
   which source may use it.
3. Which source-action scopes may be grouped into one recipient projection and
   moved together.
4. Whether any Website action has legal, safeguarding, separation-of-duties or
   language-qualification rules beyond current D23–D29 contracts.
5. Representative Tenant size, eligible-candidate distribution, directory
   privacy expectations, mobile conditions and low-bandwidth latency.
6. Final retention and identity-redaction policy for responsibility transition
   history after staff departure or privacy requests.

## D34 — What context should staff provide when returning or handing off work?

### Why this needs a founder decision

D33 already records actor, scopes, predecessor, source heads, and a named
successor when one exists. Requiring prose for every ordinary handoff adds
friction and invites sensitive explanations about health, leave, performance,
or conflict. But a return that leaves **Needs assignment** may be easier to
triage if recovery staff know why responsibility was released.

### Hope Ministries example

Maria can hand the French Page correction directly to Amélie with all relevant
Website context attached by source reference. If she instead returns it and no
responsible person remains, should Core require or invite additional context?

### Option 1 — context only when it changes recovery — recommended

- Named eligible successor: no required reason or note.
- Return while another responsible person remains: no required reason.
- Return that creates **Needs assignment**: one required short code-owned reason
  such as **Not the right person**, **Needs a different role**, **Cannot take
  this work**, or **Another reason**.
- No generic free-text note, task comment, or copied D30 explanation. A later
  source-specific note would require its own evidence and privacy decision.

**UX:** common named handoff stays one decisive step; ownerless recovery gains
just enough structured context without asking staff to narrate personal facts.

**Impact:** lowest routine effort, useful recovery triage, bounded localization/
analytics, and lower privacy/retention risk than free text.

### Option 2 — require context for every transition

Every named handoff and return requires one structured reason and may include an
optional concise private source-owned note.

**UX:** uniform but adds a mandatory step to obvious transfers; staff may select
meaningless reasons or disclose personal details merely to proceed.

### Option 3 — collect no user-provided context

Every transition relies only on trusted source scope, actor, destination, heads,
result, and timestamps. No reason or note is collected.

**UX:** fastest and most private, but ownerless returns provide no structured
triage clue and recurring routing problems are harder to understand.

### Recommendation

**Recommend Option 1 — context only when it changes recovery.** It preserves the
lowest-effort modern handoff journey and asks for bounded meaning only when the
transition creates an actual responsibility gap. It avoids turning D33 into a
comment system or collecting sensitive personal explanations by default.

## Subsequent D34 resolution

D34 accepts context only for a recipient-initiated return whose authoritative
post-state creates **Needs assignment**. Named handoff and a covered return
collect none. Website v1 records exactly one unselected, code-owned **Return
recovery context**—`responsibility_mismatch`, `cannot_take_current_work`, or
`other`—with no prose, note, default, Tenant customization, or copied D30
feedback.

The source owns the immutable code/version and exact gap scopes. It is a
self-reported recovery hint, not a cause, permission, eligibility, route,
priority, timer, notification, completion, public/financial effect, or
personnel fact. Tasks Hub and Inngest reference identifiers only. See
[`phase-24-d34-conditional-return-recovery-context-adversarial-review.md`](./phase-24-d34-conditional-return-recovery-context-adversarial-review.md).

## Primary evidence index

### Core repository

- [`openspec/project.md`](../../../openspec/project.md)
- [`openspec/specs/platform-principles/spec.md`](../../../openspec/specs/platform-principles/spec.md)
- [`openspec/specs/platform-boundaries/spec.md`](../../../openspec/specs/platform-boundaries/spec.md)
- [`openspec/specs/workflow-orchestration/spec.md`](../../../openspec/specs/workflow-orchestration/spec.md)
- [`ADR-0181`](../../adr/0181-source-authorized-candidate-scoped-external-review.md)
- [`ADR-0183`](../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)
- [`D31 primary research`](./phase-24-d31-source-owned-correction-attention-primary-research.md)
- [`D31 adversarial review`](./phase-24-d31-source-owned-correction-attention-adversarial-review.md)
- [`D32 primary research`](./phase-24-d32-source-backed-task-completion-primary-research.md)
- [`D32 adversarial review`](./phase-24-d32-source-backed-task-completion-adversarial-review.md)
- [`Phase 24 decision log`](./phase-24-multi-site-management-decision-log.md)
- [`CONTEXT.md`](../../../CONTEXT.md)
- [`mission_control_tasks` migration](../../../supabase/migrations/20260526193000_mission_control_tasks.sql)
- [`Mission Control assignment policy`](../../../packages/api/src/admin/mission-control-tasks/assignment-policy.ts)
- [`Admin Tasks content`](<../../../apps/admin/app/(app)/tasks/tasks-content.tsx>)
- [`Admin Tasks columns`](<../../../apps/admin/app/(app)/tasks/task-columns.tsx>)
- [`Admin Tasks drawer`](<../../../apps/admin/app/(app)/tasks/task-drawer-sections.tsx>)

### Current official product sources

- [GitHub — assigning issues and pull requests](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/assigning-issues-and-pull-requests-to-other-github-users)
- [GitHub — REST issue assignees](https://docs.github.com/en/rest/issues/assignees)
- [Atlassian — Jira work-item permissions](https://support.atlassian.com/jira-cloud-administration/docs/work-item-permissions/)
- [Atlassian — Jira permission interaction](https://support.atlassian.com/jira-cloud-administration/docs/how-permissions-interact-with-each-other/)
- [Contentful — Entry Tasks](https://www.contentful.com/developers/docs/references/content-management-api/entry-tasks/)
- [Sanity — Studio Tasks](https://www.sanity.io/docs/user-guides/tasks)
- [Asana — assign tasks](https://help.asana.com/s/article/assign-tasks-to-teammates?language=en_US)
- [Asana — task privacy and visibility](https://help.asana.com/s/article/understanding-privacy-and-visibility-in-asana)
- [Microsoft — Planner assignment](https://support.microsoft.com/en-US/Planner/assign-people-to-tasks)
- [Microsoft — Dynamics assignment methods](https://learn.microsoft.com/en-us/dynamics365/customer-service/administer/assignment-methods)
- [Microsoft — Dynamics representative presence](https://learn.microsoft.com/en-us/dynamics365/customer-service/use/oc-manage-presence-status)
- [Salesforce — activity assignment restrictions](https://help.salesforce.com/s/articleView?id=Can-I-assign-tasks-or-events-to-other-users&language=en_US&type=1)
- [Salesforce — task ownership](https://help.salesforce.com/s/articleView?id=sales.creating_tasks.htm&language=en_US&type=5)
- [HubSpot — task queues](https://knowledge.hubspot.com/tasks/use-task-queues)
- [Adobe Workfront — delegate tasks and issues](https://experienceleague.adobe.com/en/docs/workfront/using/manage-work/delegate-work/how-to-delegate-work)
- [Adobe Workfront — delegation overview](https://experienceleague.adobe.com/en/docs/workfront/using/manage-work/delegate-work/delegate-work-overview)
- [Blackbaud — workflow tasks and inboxes](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/infinitydevguide/content/workflow/coworkflowtasksandinboxes.html)
- [Blackbaud — GrantsConnect workflow-level users](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/grantsconnect/content/gc-workflows-manage-permissions-users.html)
- [Blackbaud — Raiser's Edge workflows](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/wd-workflows.html)

### Current official technical, security and accessibility sources

- [W3C — ARIA combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
- [W3C — WCAG 2.2 status messages](https://www.w3.org/TR/WCAG22/#status-messages)
- [OWASP — Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [PostgreSQL — row security policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Inngest — handling idempotency](https://www.inngest.com/docs/guides/handling-idempotency)
- [Inngest — durable execution](https://www.inngest.com/docs/learn/how-functions-are-executed)

## Evidence limits

- Official product documentation establishes product behavior, not comparative
  effectiveness for nonprofit ministry staff.
- Current Blackbaud workflow documentation provides useful nonprofit CRM/CMS
  precedents but does not prove that current Asym Tenants use those workflows.
- No current representative ministry interviews, usability sessions, task
  telemetry, candidate-set distribution or low-bandwidth measurements were
  available in this research pass.
- External products often make assignment itself an access or task-authority
  fact. Core explicitly does not; repository authority overrides those
  patterns.
- Exact performance SLOs, candidate page sizes and retention periods require
  implementation design and production-shaped evidence. D33 freezes safe
  behavior and monitors, not unsupported capacity claims.

## Subsequent D35 resolution

D35 selects one always-available, permission-filtered Website **Needs
assignment lane** plus an optional Tenant-only route of one to three Website
work-recovery coordinators. The lane is source truth; coordinator task and
personal engagement are subordinate projections. The route is separate from
D21/D29, grants no access, has no Site override or guessed fallback, and the
first valid D33 source assignment/end receipt closes the exact current recovery
scopes. See the [D35 adversarial record](./phase-24-d35-shared-lane-optional-recovery-coordinators-adversarial-review.md).
