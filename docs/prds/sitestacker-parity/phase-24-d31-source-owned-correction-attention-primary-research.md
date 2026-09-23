# Phase 24 D31 — source-owned correction attention primary research

Date: 2026-08-28  
Status: research evidence for the Phase 24 Grill session  
Founder answer: **Source-owned correction attention**  
Forward requirement: source-created staff assignments must be able to become
Tasks Hub work across Website/CMS, Mobilize, and later product domains

This research does not implement the feature, amend OpenSpec, change an ADR,
create a schema, activate a notification key, or decide the full Tasks Hub
product. Its research-only outcomes use the **D31-RA** namespace so they cannot
be mistaken for canonical implementation acceptance criteria.

## Subsequent D33 reconciliation — 2026-08-28

D33 resolves source-backed assignment changes as source-owned immutable
responsibility transitions, not Tasks-Hub-owned assignee/queue edits. A named
handoff commits one eligible successor; return preserves other current
recipients and uses **Needs assignment** only when none remains. Candidate
unknown never mutates, personal engagement never transfers, and D29's route is
not reused by convention. Statements below describing Tasks Hub as owning the
active assignee/queue apply only to separately admitted manual or Independent
follow-up tasks, not D31 source-backed correction responsibility. See the
[D33 adversarial review](./phase-24-d33-source-validated-return-handoff-adversarial-review.md)
and [primary research](./phase-24-d33-source-validated-return-handoff-primary-research.md).

## Research question

Is source-owned routing to the people currently authorized and responsible for
the next correction a sound modern practice? How should Core preserve a clear,
private, low-noise staff journey now while deliberately building toward one
shared Tasks Hub for Website/CMS, Mobilize, contribution operations, and other
producer-owned work? Which facts belong to the source, notification engagement,
and Tasks Hub, and is Inngest an appropriate part of the durable projection?

## Evidence labels

- **Repository fact** — directly supported by current Core source, accepted
  ADRs, governing OpenSpec, the glossary, or a completed Phase 24 decision.
- **Verified external fact** — directly supported by current official product,
  standards, security, database, or workflow-runtime documentation.
- **Reasonable inference** — a bounded conclusion supported by facts, with the
  inferential step made explicit.
- **Product judgment** — the recommended Core choice; not claimed as a
  universal industry or ministry fact.
- **Assumption** — plausible but unproved with representative nonprofit staff
  or production-shaped Core data.
- **Unresolved unknown** — evidence cannot currently settle it; it remains
  visible for a later product, design, or governing-owner decision.

## Executive finding

**Disposition: Accept with required amendments.**

The founder direction is strong and aligns with modern work-management,
content-workflow, CRM, nonprofit-CRM, authorization, and durable-execution
practice when it means all of the following:

1. The source owns one immutable correction episode and the exact predicate
   describing why human work remains.
2. A code-owned source responsibility contract identifies people responsible
   for a current next-action kind; present authorization filters that set.
   Merely possessing a broad capability does not make every editor or
   administrator responsible.
3. One person receives at most one active personal attention projection for
   the same correction episode, even if that person can perform several
   applicable source actions.
4. The personal surface never grants access, copies protected D30 feedback,
   guesses a fallback recipient, or infers responsibility from reviewer prose.
5. Reading clears only personal unread state. Source correction or
   supersession—not task completion, notification engagement, worker state, or
   elapsed time—ends the underlying correction condition.
6. Core reserves a typed, provider-neutral **staff-work projection contract**
   now. When Tasks Hub supports the producer, the same logical assignment
   appears there; Core must not show a parallel notification card and a
   duplicate task that look like two pieces of work.
7. Tasks Hub may own human-work concerns such as the active task assignee,
   queue, personal organization, due date, reminder, comments, and task
   engagement, but none of those facts rewrites the source correction episode,
   its D30 explanation, candidate state, permission, or completion proof.
8. A source-backed task uses D32 source-controlled closure at its exact assigned
   source-action scope. Its primary action is **Open correction** and no generic
   checkbox can complete, reopen, or dismiss it. A separately defined human
   follow-up may own only its task completion; neither model changes source
   truth.
9. Task summaries and asynchronous event envelopes are identifier-only and
   purpose-minimized. The protected Request changes explanation remains at the
   source and is revealed only after fresh authorization on the source detail
   route.
10. A product-owned outbox/dispatch intent makes projection recoverable.
    Inngest is an appropriate optional executor for post-commit
    materialization, recipient recalculation fan-out, and reconciliation. It is
    not the source of truth, assignment resolver, authorization boundary,
    durable business-idempotency guard, or a function that waits for a human to
    finish.

The most important amendment is the distinction between **authorized** and
**responsible**. Broadcasting to everyone who technically can edit a Website
or Mobilize record is noisy, discloses private context too broadly, and creates
diffuse accountability. The source must name a bounded responsibility kind
from trusted structured state; then current authorization proves which
responsible people may receive and act.

## Modern-practice verdict

### What official products establish

| Primary source                                                                                                                              | Verified fact                                                                                                                                                                                                                           | Useful lesson for Core                                                                                                                                    | What it does not prove                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| [Contentful Entry Tasks API](https://www.contentful.com/developers/docs/references/content-management-api/entry-tasks/)                     | Entry tasks are attached to an entry, have a user-or-team assignee and active/resolved state, and appear in an assigned-tasks collection. Contentful explicitly says its task API does not verify that the assignee can read the entry. | Contextual work plus a personal queue is useful; assignment without authorization is a documented real-world footgun Core must prevent.                   | Contentful's 512-byte body, email reminders, publish blocking, team semantics, or task-as-content authority fit Core. |
| [Asana Tasks API](https://developers.asana.com/reference/tasks)                                                                             | A task has one nullable assignee, a concise name, completion state, project memberships, and OAuth-protected external metadata including an external ID.                                                                                | A single personal work item can retain a stable external/source identity and appear in My Tasks without copying the external system's authority.          | One assignee is universally best, or Asana completion should resolve a Core source condition.                         |
| [Asana app components](https://developers.asana.com/docs/app-components)                                                                    | Task widgets can display current data from an attached outside resource whenever the task opens.                                                                                                                                        | A task can be a contextual window into current source data rather than a stale copied description.                                                        | Core should depend on live third-party widgets or expose protected feedback through them.                             |
| [Microsoft Planner API](https://learn.microsoft.com/en-us/graph/api/resources/planner-overview?view=graph-rest-1.0)                         | Planner represents assignees as an assignments collection and separates common list fields from larger task-detail resources.                                                                                                           | Multiple-assignee products exist, and list/detail data minimization is a proven performance and privacy pattern.                                          | Multi-assignment provides clear accountability for this correction case.                                              |
| [HubSpot Tasks API](https://developers.hubspot.com/docs/api-reference/latest/crm/activities/tasks/guide)                                    | A task can have one owner, status, priority, due/reminder time, body, and associations to CRM records.                                                                                                                                  | Shared tasks can link back to source records and support one owner's work view.                                                                           | Core needs all CRM task fields, due dates by default, copied source text, or task-owned business completion.          |
| [Blackbaud Raiser's Edge NXT actions](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/en-gb/content/bb-actions.html) | Nonprofit CRM actions combine record context, assigned fundraiser(s), date, status, summary, notes, and task/interaction type.                                                                                                          | Nonprofit staff expect assigned work to remain connected to the constituent or opportunity it serves.                                                     | Website/Mobilize corrections are constituent actions or should inherit relationship-cultivation fields.               |
| [Blackbaud action measures](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/en-ca/content/bb-action-measures.html)   | Blackbaud warns that actions assigned to multiple fundraisers may be double-counted in analytics.                                                                                                                                       | Multi-recipient representations require explicit counting semantics; recipient copies must not inflate one source episode into several business problems. | Blackbaud's reporting grain is Core's desired task grain.                                                             |
| [Blackbaud task/role security](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/crm/us/40/Content/ADMSystemRolesAssignTasks.html) | A navigation task does not itself secure its underlying feature; visibility depends on granted features.                                                                                                                                | Assignment and navigation must never substitute for feature authorization.                                                                                | Core should reproduce Blackbaud's role or navigation model.                                                           |
| [Jira issue transition API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/)                                  | Issue transitions are permission-checked and can return conflict during concurrent transition attempts.                                                                                                                                 | State changes and concurrency conflicts need source-side authorization and explicit outcomes.                                                             | Jira should become Core's workflow/task model.                                                                        |

**Verified external fact:** contemporary products support both one and multiple
assignees, contextual source links, personal work lists, due dates, reminders,
notifications, comments, and manually completed tasks. There is no universal
task cardinality or assignment model.

**Reasonable inference:** the consistent, useful pattern is contextual
traceability from work item to owning source plus a personal list. The
documented Contentful mismatch and Blackbaud counting warning show why Core
must not equate assignment with permission or recipient copies with business
occurrences.

**Product judgment:** D31 should freeze source ownership, responsibility and
authorization rules, one source-work and shared-task identity with
recipient-specific assignment/engagement projections, and the future Tasks
Hub integration boundary. D31 did not prematurely freeze collaboration fields,
due dates, reminder policy, completion authority, or a cross-domain task
taxonomy. D32 now resolves the source-action completion relationship explicitly
while preserving task-owned follow-up as a different contract.

### Inngest's proven fit and hard limits

Current official Inngest documentation establishes:

- [Durable execution](https://www.inngest.com/docs/learn/how-functions-are-executed)
  persists step state and retries failed steps without re-running already
  completed steps.
- [Error handling](https://www.inngest.com/docs/guides/error-handling) still
  requires side effects to be idempotent; a timed-out write may have succeeded
  before the retry.
- [Event and function idempotency](https://www.inngest.com/docs/guides/handling-idempotency)
  deduplicates for only 24 hours. That is a handoff aid, not permanent product
  uniqueness.
- [Cancellation](https://www.inngest.com/docs/features/inngest-functions/cancellation)
  cannot stop an already executing step; it takes effect between steps.
- [Concurrency keys](https://www.inngest.com/docs/guides/concurrency) can bound
  execution per tenant and mitigate noisy neighbors, but constrain executing
  steps rather than total runs. FIFO is documented within one function;
  ordering across functions is not guaranteed.
- [Events](https://www.inngest.com/docs/events) and
  [usage limits](https://www.inngest.com/docs/usage-limits/inngest) show that
  event data and run state are retained in workflow infrastructure under
  plan-dependent history limits.
- [Fan-out](https://www.inngest.com/docs/guides/fan-out-jobs) lets independent
  consumers retry independently.

These facts strongly support the repository's accepted workflow boundary:
Inngest can execute recoverable task materialization after authoritative
product intent exists. They also prove why it cannot safely own D31:

- a 24-hour dedupe window cannot enforce one active task for a correction that
  may remain open for weeks;
- cancellation cannot revoke an already executing write, so the worker must
  re-read and conditionally write current product state;
- function ordering cannot define source lifecycle order;
- event/run storage makes D30's protected explanation inappropriate event
  data; and
- retries require product-owned unique keys, compare-and-swap, and work claims.

**Product judgment:** use the existing product-owned dispatch ledger and
Inngest worker pattern if task materialization is asynchronous. Do not create a
months-long Inngest function that waits for task completion. A task is a
product record and remains valid, inspectable, and repairable if workflow
dispatch is disabled.

## Repository findings

### Governing decisions already answer much of D31

- [Workflow orchestration OpenSpec](../../../openspec/specs/workflow-orchestration/spec.md)
  says Inngest is only the durable executor; product records, tenant
  authorization, product idempotency keys, work claims, and the product-owned
  dispatch ledger remain authoritative. Events are identifier-only and tenants
  share platform workflow infrastructure.
- [Platform boundaries OpenSpec](../../../openspec/specs/platform-boundaries/spec.md)
  says Mission Control tasks are the shared staff work model for present and
  future automation-created work. It also says Needs Attention is a view over
  shared task and issue state rather than a separate contribution-only task
  system.
- [ADR-0027](../../adr/0027-one-notification-presentation-and-engagement-model.md)
  separates source state, notification availability/presentation, personal
  engagement, and business completion.
- [ADR-0054](../../adr/0054-cause-owned-accounting-exceptions-with-shared-follow-up.md)
  establishes the closest permanent precedent: a source-owned exception
  remains authoritative while a tenant-safe, idempotent,
  outbox-reconcilable shared task owns human follow-up only.
- D19/D20 established one state-driven personal **Needs attention** episode:
  read is personal, work remains actionable until source end, and no recurring
  reminder or email exists by default.
- D30 makes the protected Request changes explanation source-owned and forbids
  copying its body into tasks, notifications, analytics, logs, search, CMS
  fields, or successor content.

The founder's cross-domain note is therefore not merely speculative. It
clarifies that Website correction attention belongs on the same long-term
shared-work spine as Mobilize and other product domains, while each producer
retains its own business truth.

### Current behavior is not the target design

The current runtime has no Phase 24 correction episode, source responsibility
resolver, D31 attention projection, Website task adapter, or Mobilize task
adapter.

The existing Mission Control schema and service are an incomplete precedent:

- [mission_control_tasks migration](../../../supabase/migrations/20260526193000_mission_control_tasks.sql)
  stores one optional assignee, mutable status, source strings, generic links
  and JSON metadata, but has no cross-table composite Tenant constraints,
  recipient engagement model, source-completion policy, or active-task
  uniqueness.
- The migration enables RLS but revokes browser roles and grants service-role
  access; there are no row policies protecting a direct staff read path.
- [task store](../../../packages/api/src/admin/mission-control-tasks/store.ts)
  inserts a task, links, and event in separate calls rather than one atomic
  product command.
- [task types](../../../packages/api/src/admin/mission-control-tasks/types.ts)
  are contribution-specific closed unions; Website and Mobilize do not fit
  without a deliberate generalization.
- [admin task UI](<../../../apps/admin/app/(app)/tasks>) is backed in part by
  seed-shaped admin workspace data and is not proof of a production Tasks Hub
  contract.

**Repository fact:** none of that existing code is safe authority merely
because it exists. D31 must build toward the accepted shared model without
binding Phase 24 to these brittle current details.

## Exact corrected D31 research recommendation

> When an exact source-owned correction episode begins, the source evaluates
> one registered, code-owned responsibility contract for each still-required
> next-action kind and projects attention only to the bounded people who are
> both currently responsible and currently authorized for that action in the
> exact Tenant, Site, locale, environment, candidate, and protected context.
> One person receives at most one active personal projection for the correction
> episode. Possessing a capability alone never broadcasts responsibility; the
> D30 explanation is never parsed to invent an action or recipient; zero or
> indeterminate recipients guesses no fallback.
>
> The source correction episode owns existence, action kinds, protected
> feedback, and end proof. Notification infrastructure owns presentation and
> personal unread/read engagement only. The future Tasks Hub owns shared human
> work coordination only and references, rather than copies, source facts.
> Source-linked work cannot be generically completed, dismissed, or suppressed
> while the source condition remains true. When Tasks Hub support is Live, the
> same logical assignment appears as one coherent task experience rather than a
> duplicate task plus notification.
>
> The source transaction writes a typed, identifier-only, product-owned
> projection intent. Materialization is idempotent, replayable, current-state
> revalidated, and safe if delayed. Inngest may execute that post-commit work
> through the existing dispatch ledger, work claims, per-Tenant concurrency,
> recovery, and dead-letter path. Inngest never owns recipient selection,
> authorization, task identity, source completion, protected content, or
> durable uniqueness.

## Recommended authority model

### Four separate facts

| Fact                                             | Canonical owner                                           | Mutability                                                      | What it may drive                                                                                       | What it must never mean                                                                                  |
| ------------------------------------------------ | --------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Correction episode exists and remains actionable | Exact producer source                                     | Source state transition; historical episode immutable after end | Current action kinds, source page, projection intent, end event                                         | A task exists, someone read it, someone promised to work, or a notification delivered                    |
| Current responsible-and-authorized recipient set | Source responsibility resolver plus current authorization | Recomputed from current structured relationships and grants     | Recipient-specific attention/task projection                                                            | A saved recipient snapshot grants access or every capable user is responsible                            |
| Human work coordination                          | Shared Tasks Hub                                          | Mutable under task policy and authorization                     | Assignee/queue, personal organization, allowed due date/reminder, task engagement, coordination history | Source correction completed, candidate changed, review passed, Page published, Mobilize action succeeded |
| Personal attention engagement                    | Phase 17 notification/engagement model                    | Per Tenant+Party+role+surface item                              | Unread/read and recent presentation                                                                     | Assignment accepted, task completed, source resolved, another person's engagement                        |

### Conceptual source records

This is a conceptual contract, not a schema prescription.

1. **Correction episode**
   - stable episode ID;
   - Tenant, environment, source kind and source aggregate ID;
   - exact candidate/review epoch and D30 result reference;
   - typed current next-action kinds;
   - opened/source-ended/superseded evidence;
   - immutable recurrence lineage;
   - source version/CAS generation;
   - no assignee, task status, due date, reminder, unread state, or copied
     explanation body.

2. **Responsibility contract**
   - code-owned, versioned source/action-kind key;
   - trusted structured relationships eligible to establish responsibility;
   - exact authorization capabilities and context predicates;
   - bounded resolver result and deterministic order;
   - proved-zero and indeterminate outcomes;
   - no tenant-authored expression language, prose parsing, AI classification,
     role-name convention, or broad administrator fallback.

3. **Staff-work projection intent**
   - Tenant and correction episode identity;
   - recipient Party/profile identity only when proved;
   - responsibility-contract version and action-kind set;
   - presentation/task contract key;
   - safe source deep-link descriptor;
   - semantic idempotency key and source version;
   - pending/materialized/obsolete/dead-letter handoff evidence;
   - no D30 explanation, Page body, contact/donor data, missionary location,
     arbitrary URL, source snapshot, or caller-supplied authority.

4. **Shared task projection**
   - stable Tasks Hub ID;
   - same-Tenant source link and projection-intent identity;
   - one shared source-work/task identity plus recipient assignment grain;
   - task policy key including D32 source-controlled action-scope
     applicability;
   - current authorized assignee or queue under the task contract;
   - PII-minimized title and summary-contract key;
   - allowed task coordination fields;
   - materialization freshness and source version;
   - ordinary task/event history;
   - no duplicated source feedback or mutable source-state mirror.

5. **Recipient engagement**
   - Tenant, task/item, Party, role and surface;
   - seen/read/unread timestamps and recent-presentation ceiling;
   - no source or task completion meaning.

### Stable semantic identities

The following identity shapes are recommendations to be refined in design:

- correction episode:
  **Tenant + source kind + source aggregate + review epoch + recurrence
  sequence**;
- one recipient's present attention:
  **Tenant + correction episode + recipient Party + role/surface policy**;
- task projection intent:
  **Tenant + correction episode + task-grain key + intended recipient/lane**;
- materialization effect:
  **Tenant + projection intent + task-contract version**.

The keys use stable product identities, not timestamps, free text, usernames,
role display labels, routes, Inngest run IDs, notification IDs, or mutable task
titles. A database unique constraint, current-active exclusion rule, or
equivalent product guard enforces each active cardinality; Inngest's event ID
is supplemental handoff deduplication only.

## Responsibility and recipient resolution

### Responsible is narrower than capable

Source-owned attention is safe only when the source has a legitimate,
structured responsibility relationship. Examples may include the exact owner
of a Website source action, an explicitly configured source lane, or a
currently claimed source work lane. These are examples of data shapes, not
claims that ministries universally organize work this way.

The resolver must not:

- send to every user with Website, CMS, Navigation, Mobilize, administrator,
  Tenant-owner, or broad staff capability;
- use the candidate creator or most recent editor merely because those values
  exist;
- parse D30 prose, sentiment, keywords, locale names, or the optional anchor to
  guess a department, permission, or assignee;
- infer responsibility from a role's display name;
- use presence, last-active, time zone, workload, or historical task
  completion as permission or responsibility;
- fall back to D29 Website Review coordinators, the Tenant owner, support,
  platform administrators, or an arbitrary first user unless a later explicit
  governing decision creates that exact fallback;
- accept Tenant, recipient, actor, action kind, capability, or assignment from
  caller-controlled form/event data.

The source may use a D30 source anchor only as a safe navigation aid. If an
independent structured source contract can prove the affected action kind, it
may route that kind. The feedback body is never that proof.

### Resolution outcomes

Each source/action-kind evaluation returns exactly one:

- **resolved recipients** — a bounded nonempty set of people both responsible
  and authorized now;
- **proved zero** — the contract proves that no currently eligible person
  exists; create no personal item or task and expose a protected operational
  gap to the correct source owner;
- **indeterminate** — data, adapter, authorization, or resolver state cannot
  safely decide; create no guessed recipient and surface a protected
  operational defect;
- **not applicable** — this action kind no longer remains required.

A resolver can return the same person for several action kinds. D31 merges
those applicable kinds into that person's one current attention projection.
It does not fabricate several review results or several unread events.

### Authorization drift

Current permission must be re-proved:

- when calculating a recipient;
- before materializing or reassigning a task;
- for every list, count, search, filter and detail projection;
- before showing D30 feedback or a source anchor;
- before every source or task mutation;
- when a role, membership, Site, locale, environment, source relationship, or
  policy changes; and
- immediately before a privileged async worker effect.

Loss of responsibility or authority removes the personal active projection
without fabricating read, completion, dismissal, or source resolution.
Historical assignment events remain in a protected business/audit view.
Newly eligible people receive a current projection only if the same correction
episode still needs their action. A previously ended episode never revives.

## UX and UI recommendation

### One coherent surface, not two competing inboxes

Before Tasks Hub support is Live, D31 may use the accepted Phase 17
source-actionable **Needs attention** presentation. Once Tasks Hub owns this
producer contract, the global bell, **Needs attention**, source page, and Tasks
Hub must resolve one shared logical work identity:

- the bell may say there is unread work;
- **Needs attention** and **My tasks** may be two filters/views over that work;
- the source detail supplies the authoritative explanation, evidence and
  action;
- neither surface creates a second task, a second unread occurrence, or a
  separate completion checkbox.

If the same item appears in more than one navigation surface, the row/card uses
the same title, source, status language, assignee, and deep-link destination.
Read engagement is shared for that recipient, not independently unread in each
surface.

### Recommended personal list row

The list row should answer, in this order:

1. **What needs me?** — **Correct the French Website review**
2. **Where?** — **Hope.org · French (Canada)**
3. **Why is it still here?** — **A corrected version is still needed**
4. **What can I do?** — **Open correction**
5. **Who owns the work?** — assignee/lane only when the chosen task contract
   makes this meaningful
6. **What happened recently?** — source-derived state change, not a raw worker
   timestamp

The row does not display the D30 explanation body, arbitrary reviewer text,
anchor excerpt, hidden recipient count, other assignees the viewer cannot see,
or a misleading age-based severity. The source Site/locale is included only
when the viewer remains authorized to know it.

### Recommended source-detail composition

On the authoritative Website correction surface:

1. A calm heading: **Changes requested**
2. Consequence text: **The current Website and Giving are unchanged.**
3. The protected D30 explanation and optional original-section anchor.
4. A **Next step** panel listing only actions this viewer can perform.
5. Task coordination, if Tasks Hub is Live: **Assigned to you**, **Reassign**
   or **I cannot do this** only when allowed by the task policy.
6. Primary source action: **Prepare corrected version** or the exact
   source-owned action.
7. A secondary **Open in Tasks** link for people who prefer the shared work
   view.

Task metadata is subordinate. The explanation and source action remain in the
same page so staff are never forced to shuttle between a ticket and the
Website editor to understand the work.

### Source-controlled task behavior

D32 selects source-controlled closure for D31 source-backed tasks. Generic
manual-task controls have no valid D31 semantics and must reject this policy.

While the correction predicate remains true:

- the primary task action is **Open correction**;
- generic **Mark complete**, **Dismiss**, **Archive**, and **Suppress** are
  unavailable;
- hover-only controls are forbidden;
- if a user tries a stale completion route, the server revalidates and returns
  **This task stays open until the correction is completed in Website** with
  the authorized action link;
- read/unread changes do not change task or source status;
- reassignment never grants source access;
- a due date or reminder, if later allowed, organizes the task but never
  changes the source predicate or creates urgency in source data.

When the source correction ends:

- every applicable personal projection leaves active views;
- the shared task becomes source-inapplicable and D32 maps that exact source
  outcome into truthful **Completed in Website**, **No longer required**,
  **Reassigned**, or D33 **Returned** history without fabricating who performed
  it; **Returned for reassignment** appears only when nobody remains;
- recipients do not need to clear duplicate checkboxes;
- authorized recent history retains the source/task linkage under the
  governing presentation and retention policies; and
- recurrence creates a linked new episode and new task identity.

### State language

Use language that exposes the owner of truth:

| Condition                                 | Staff-facing wording                                                                       | Avoid                            |
| ----------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------- |
| Source condition open, projection current | **Correction needed**                                                                      | Failed, overdue, unresolved task |
| Task projection pending                   | **Correction recorded · task is being prepared** only where staff need that fact           | Assigned, sent, delivered        |
| No proved recipient                       | **No currently eligible owner** on a protected owner surface                               | Sent to admins, nobody cares     |
| Authorization lost                        | **You no longer have access to this work**                                                 | Completed, dismissed             |
| Source corrected                          | **Completed by Website correction**                                                        | Marked done by notification      |
| Candidate superseded/cancelled            | **No longer needed** with exact reason                                                     | Completed                        |
| Projection worker failed                  | Source remains authoritative; protected operations say **Task projection needs attention** | Correction failed                |

### Accessibility, internationalization and mobile

The task list should default to ordinary semantic headings, links, buttons,
lists and, where genuinely tabular comparison is needed, a native table. WAI's
[listbox guidance](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/) warns that
interactive controls nested inside listbox options are not accessible as
ordinary interactive content; Core should not use a custom listbox for rich
task rows.

Current [WCAG 2.2 understanding guidance](https://www.w3.org/WAI/WCAG22/understanding/)
requires logical focus order, programmatic name/role/value, status-message
exposure, reflow and minimum target-size outcomes. Therefore:

- unread, assignment, source status and projection errors use text, not color
  alone;
- one row has an ordinary descriptive link and separately labelled secondary
  controls;
- opening a row does not mark the source complete;
- live count updates use a polite status message and never steal focus;
- 320 CSS-pixel reflow, 400% zoom, forced colors, keyboard-only use, screen
  readers, touch, long translations, CJK, RTL, mixed-direction names, and
  browser text scaling are release proof;
- source names and user-authored text use Unicode-safe display and bidi
  isolation;
- mobile keeps title, source and primary action visible before optional
  metadata;
- list retrieval is paginated and low-bandwidth; rich source content loads
  only after deliberate navigation;
- optimistic unread changes may update locally, while task/source state waits
  for authoritative confirmation; and
- ambiguous network outcomes reconcile from product receipts rather than
  asking staff to repeat a potentially successful source action.

## End-to-end staff journeys

### Journey A — one authorized responsible person

1. Eli submits **Request changes** for the exact immutable French candidate.
2. The Website source atomically commits the D30 result, opens one correction
   episode, and records identifier-only staff-work projection intent.
3. The source responsibility contract proves Maria is responsible and
   authorized for the current correction action.
4. Maria receives one unread personal item. If Tasks Hub support is Live, it is
   the same logical work item in **My tasks**, not a duplicate.
5. Maria opens it. Unread clears; the task and source remain open.
6. Maria reads the protected explanation on the Website source page and uses
   **Prepare corrected version**.
7. The authoritative source transition ends the correction episode.
8. Maria's active task leaves **Needs attention** and enters truthful recent
   history automatically.

### Journey B — one person matches several actions

1. The source proves Maria is responsible and authorized for two currently
   applicable correction action kinds.
2. D31 creates one personal attention identity, not two unread cards.
3. The detail page shows both permitted next actions under the one correction
   episode.
4. Tasks Hub retains one source-work/task identity with action memberships and
   recipient projections. D32 closes each recipient projection when their final
   assigned source-action scope ends; the whole episode remains independent.

### Journey C — different people own different action kinds

1. Maria is responsible for Page correction; Joel is responsible for
   Navigation correction.
2. Each sees only the action kinds, source details and feedback their exact
   authorization permits.
3. Neither person's read state affects the other.
4. A source transition that proves only one action kind is no longer required
   ends only its applicable projection. The correction episode ends only when
   the source's complete predicate is false.
5. Task reporting counts one correction episode separately from recipient or
   task counts.

### Journey D — no safely resolvable recipient

1. The source result is accepted; the correction episode remains true.
2. The resolver returns proved zero or indeterminate.
3. Core sends no personal item and guesses no administrator, initiator,
   reviewer coordinator, or Tenant owner.
4. An independently authorized source-owner/operations view shows a
   privacy-safe **No currently eligible owner** condition.
5. A later responsibility or authorization change triggers reconciliation.
6. If an eligible person now exists and the episode remains open, Core creates
   the current projection without rewriting the original result.

### Journey E — authorization changes after assignment

1. Maria loses Site access while the correction remains open.
2. Query-time authorization removes the work from Maria immediately, even if
   background reconciliation is delayed.
3. The system records no fabricated read, completion or dismissal.
4. A current source resolver may route to a newly responsible and authorized
   person. The new person's item is unread and links to the same source episode.
5. Historical assignment evidence remains protected and does not expose source
   details through the old task.

### Journey F — projection is delayed or duplicated

1. The source commit succeeds but immediate Inngest handoff fails.
2. Staff source state remains correct and the external reviewer still receives
   a truthful receipt.
3. The product dispatch ledger/recovery scan retries.
4. A worker obtains the product work claim, reloads current source and
   authorization, and idempotently upserts the required projection.
5. Duplicate or out-of-order events converge on the same product identity.
6. If the source already ended, the worker records the intent obsolete and
   creates no stale active task.

### Journey G — Mobilize producer

1. A Mobilize source later opens a different source-owned work episode, such as
   an exact approved Mobilize action needing an authorized staff step.
2. Mobilize supplies its own action kinds, responsibility resolver,
   authorization predicates, source route, completion proof and safe summary
   contract.
3. The shared staff-work projection contract materializes work into the same
   Tasks Hub.
4. Website code does not learn Mobilize states; Mobilize does not reuse Website
   permissions; Tasks Hub does not become either source's workflow authority.

This journey is an architectural compatibility example, not evidence that a
particular Mobilize workflow has been approved.

## Lifecycle, temporal correctness, concurrency and idempotency

### Source correction lifecycle

The source correction episode has a small closed lifecycle:

**open → ended_corrected | ended_superseded | ended_cancelled |
ended_not_applicable**

An episode never reopens. If the same semantic condition becomes actionable
again after an authoritative end, the source creates a linked successor
episode. Task reopening, unread toggles, worker replay, permission restoration,
or a later candidate never revive the prior episode.

### Projection lifecycle

One staff-work intent may be:

**pending → materialized | obsolete | dead_letter**

A materialized recipient projection may be:

**active → source_ended | authority_lost | responsibility_changed |
superseded**

These names are conceptual. The final design may encode lifecycle as current
rows plus append-only events rather than one mutable status column. The
semantic distinctions are mandatory:

- **source_ended** is not human completion;
- **authority_lost** is not dismissal;
- **responsibility_changed** is not source resolution;
- **obsolete before materialization** creates no phantom task;
- **dead_letter** is a projection failure, not a failed correction.

### Atomic boundaries

The authoritative D30 Request changes command must atomically commit:

- terminal exact-review result;
- protected feedback reference and optional source anchor;
- correction episode and exact initial action-kind evidence;
- source audit/receipt and semantic idempotency result; and
- identifier-only staff-work projection/outbox intent.

It must not wait for Tasks Hub or Inngest. If the task projection insert is
implemented in the same Postgres transaction through a stable shared domain
function, it may materialize synchronously. If it is asynchronous, only the
projection intent belongs in the source transaction.

Task materialization atomically commits, per product effect:

- one task/projection row;
- same-Tenant source and intent link;
- current assignment/queue under the selected task contract;
- initial task event; and
- materialization receipt/freshness.

The current sequential task→link→event code does not satisfy this boundary.

### Race table

| Concurrent events                                               | Required winner/convergence                                                                                          |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Request changes vs approve/decline/cancel/expiry/takeover       | Exact source review CAS permits one terminal result; loser writes no correction episode or projection intent         |
| Source correction ends while task worker starts                 | Worker re-reads source under product claim; no stale active task survives                                            |
| Two task workers handle the same intent                         | Product unique identity/upsert and work claim produce one business effect                                            |
| Same event ID after 24 hours                                    | Product idempotency still returns the original materialization; no duplicate                                         |
| Recipient loses authority during worker execution               | Final server/DB check rejects or writes a non-visible ended projection; query-time policy already hides it           |
| Two role/responsibility changes race                            | Source/version fence applies the latest valid resolver generation; stale generation cannot restore a prior recipient |
| Staff source action and generic task completion race            | Source command decides source truth; task completion cannot mask an open condition                                   |
| Source ends before a user first reads                           | Active presentation ends with no fabricated read or unread debt                                                      |
| Recurrence begins while previous task remains in recent history | New episode has a distinct identity and unread engagement; previous history is not reopened                          |
| Manual replay after code/schema upgrade                         | Versioned adapter revalidates current intent; incompatible versions quarantine rather than guess                     |

### Temporal rules

- D31 stores no target date, plan date, default deadline, automatic reminder,
  escalation-by-age, or expiry.
- Source-workflow dates remain source-owned.
- Tasks Hub may later own explicitly chosen due dates/reminders under its own
  contract; they do not copy into the correction episode or influence source
  end.
- All authoritative timestamps are server/database generated and stored as
  instants. User-facing dates use the viewer's locale and selected time zone.
- Time passage alone never proves work completed or a recipient changed.
- Projection freshness is measured against source sequence/version, not wall
  clock alone.

## Database, RLS and authorization safety

### Required structural constraints

The final relational design should make these invalid states impossible or
reachable only through one protected server command:

- a correction episode linked across Tenants, Sites, environments, candidates
  or review epochs;
- a task, source link, recipient, queue or engagement row crossing Tenants;
- two active materializations for one semantic task identity;
- one personal engagement row attached to another person's task projection;
- an active task referencing an ended or nonexistent projection intent without
  an explicit stale transitional state;
- an assignee who is not a current member/Party in the same Tenant;
- caller-written actor, Tenant, assignee, responsibility, source status,
  authorization proof, audit or completion fields;
- a task body or event carrying protected feedback;
- deletion cascading from a mutable task into immutable source review evidence;
  or
- task completion changing a source-owned result by foreign-key cascade,
  trigger, convenience view or background convention.

Use composite Tenant-aware candidate keys and foreign keys where practical,
closed check constraints for contract/status kinds, partial/exclusion
uniqueness for active identities, non-null source references, explicit delete
behavior, and indexes shaped for Tenant+recipient+active list reads,
source-episode reconciliation and pending/dead-letter scans.

PostgreSQL's current
[row-security documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
notes that table owners normally bypass RLS and that referential-integrity
checks bypass row security. Composite same-Tenant constraints are therefore
integrity protection, not a substitute for non-enumerating APIs and policies.

### RLS and grants

Supabase's current
[RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security)
states that grants and policies are separate checks; **USING** controls the
existing row and **WITH CHECK** controls the resulting row. The final design
must:

- revoke anonymous access;
- grant authenticated users only the exact read/engagement operations the
  product exposes;
- enable and force RLS on protected tables where the adopted repository
  pattern requires it;
- scope every policy by current Tenant, Party/profile, role, surface, source
  visibility and task relationship;
- use both **USING** and **WITH CHECK** for assignment, engagement and any
  mutable task fields so an allowed update cannot move a row into a forbidden
  Tenant/person/source;
- secure views with invoker semantics or an equivalent safe API boundary;
- restrict functions/RPCs, set a safe search path, and derive trusted fields
  inside the server/database boundary;
- keep service-role/Inngest paths behind the repository's tenant guard and the
  same authorization semantics;
- re-prove source detail authorization even after task-list authorization;
- non-enumerate hidden Tenant/Site/locale/source/task/recipient identities; and
- test every table, view, function, RPC, export, search, count, cache and
  privileged path with cross-Tenant poison fixtures.

### Authorization principles

OWASP's current
[Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
recommends least privilege, deny by default, and permission validation on every
request. Its
[IDOR guidance](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html)
requires object-level checks even when identifiers are hard to guess.

For D31 this means:

- a task ID or source deep link is never a bearer grant;
- assignment is not membership, authorization, source responsibility or
  reviewer authority;
- list visibility does not automatically imply protected-feedback visibility;
- the source action reauthorizes against current source state;
- the worker never trusts recipient/actor/action fields in an event;
- support/platform tooling cannot impersonate a recipient or reveal feedback
  without a separately governed path;
- an inaccessible item is omitted rather than shown with leaked title/count;
  and
- ordinary administrators do not receive a universal bypass simply because
  task routing failed.

## Privacy and security

### Data minimization

Tasks Hub list/search rows should carry only a code-owned localized title,
safe source label, permitted context label, current work status, assignment
metadata, safe deep-link descriptor and timestamps necessary for coordination.
The task description does not copy:

- the D30 explanation;
- reviewer name unless separately authorized and useful;
- Page/CMS body, navigation label, Giving URL, donor/finance information;
- missionary/member-care location or sensitive ministry details;
- email, phone, address or constituent data;
- arbitrary source errors, provider responses or stack traces; or
- source anchors as URLs/selectors/copy.

The task opens a server-authorized source page to obtain current protected
details. If a list row cannot be useful without sensitive content, the
producer must define a purpose-minimized safe summary contract; it must not
fall back to truncating arbitrary source text.

### Workflow envelopes and telemetry

The existing
[workflow event schema](../../../packages/api/src/workflows/events.ts) is
strict, identifier-only and rejects context keys that resemble bodies,
payloads, secrets or broad content. D31 should reuse and, only if needed,
version that contract—not create a task-specific free-form event.

Inngest event/context, dispatch ledger fields, work claims, metric labels,
traces, logs, error messages, dead-letter summaries and notification previews
must remain body-free. Workers load protected data from Core only inside a
tenant-scoped command and should not need the D30 explanation to materialize a
task.

OWASP's current
[Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
recommends excluding or specially protecting sensitive personal data, secrets,
bank/payment details and data above the logging system's classification.
D31 logs stable IDs, source/task contract keys, reason codes, attempts,
latency and outcomes—not free text or raw record snapshots.

### Retention, deletion and export

- Immutable review and correction evidence follows its source-owned retention
  class.
- Task coordination/history follows the shared Tasks Hub retention class.
- Personal engagement follows ADR-0027's presentation policy.
- Technical workflow logs follow workflow/operations retention.
- Ending or deleting a task never deletes source evidence.
- Source retention or privacy redaction does not silently leave protected text
  in task descriptions, comments, search indexes, exports or Inngest history,
  because D31 never copies it there.
- Generic task exports omit or reference protected source data unless the
  exporter independently proves the exact source audience and policy.
- Party merge, Tenant transfer, employee departure and account deletion
  preserve lawful business attribution without keeping stale active access.

## Failure modes and safe recovery

| Failure                                   | Safe behavior                                                                     | Recovery                                                                              |
| ----------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Source commit fails                       | No result, correction episode or projection intent commits                        | Return precise source error; ordinary retry uses semantic idempotency                 |
| Source commits, immediate dispatch fails  | Source truth remains valid; no claim that a task was created                      | Dispatch ledger retries; protected operational status shows lag                       |
| Inngest event is duplicated/replayed      | Product unique key/work claim makes effect a no-op                                | Return existing receipt and reconcile current source                                  |
| Worker receives stale source version      | It cannot create/update favorable current task state                              | Reload latest version; obsolete or retry with current intent                          |
| Task insert succeeds but link/event fails | Transaction rolls back or reconciler repairs one product-owned atomic effect      | Never expose orphan task as complete materialization                                  |
| Worker exhausts retries                   | Correction remains open; no guessed assignment                                    | Dead-letter plus protected owner response and manual replay                           |
| Tasks Hub unavailable                     | Source page remains authoritative and usable by independently authorized staff    | Restore projection later from durable intent                                          |
| Source route unavailable                  | Task remains truthful about coordination but cannot claim source action succeeded | Show temporary source-unavailable state; retry route, not source command              |
| Authorization service indeterminate       | Fail closed; omit protected content and mutation                                  | Retry/reconcile; protected signal                                                     |
| Recipient loses access                    | Query-time omission immediately                                                   | End/reassign projection from current resolver; preserve audit                         |
| Recipient count explodes                  | Do not fan out unboundedly                                                        | Contract-bound resolver stops/quarantines; product owner corrects responsibility data |
| Source ends before materialization        | No active task is created                                                         | Mark intent obsolete with source receipt                                              |
| Source recurs after end                   | New linked episode/task identity                                                  | Preserve prior history; no reopen                                                     |
| Inngest is disabled or vendor unavailable | Product rows and manual/recovery paths remain valid                               | Re-enable and resume ledger; no data migration required                               |
| Ambiguous worker response                 | Read product materialization receipt before retry                                 | Retry only missing business effect                                                    |

## Inngest decision

### Appropriate uses

Inngest is a good fit for:

- consuming a committed identifier-only staff-work projection intent;
- retrying task materialization after transient failure;
- fan-out when one episode legitimately creates multiple independently
  identified projection effects;
- per-Tenant concurrency/fairness so a large tenant cannot starve others;
- processing responsibility/authorization-change reconciliation triggers;
- end-of-source reconciliation for applicable task projections;
- periodic bounded recovery scans over product-owned pending/dead-letter
  ledgers; and
- operator-visible execution diagnostics subordinate to product receipts.

### Inappropriate uses

Inngest must not:

- decide whether Request changes succeeded;
- select recipients from role names or event payload;
- retain the D30 explanation or rich source snapshot;
- use its event/run ID as the product task identity;
- rely on 24-hour event dedupe for permanent uniqueness;
- treat FIFO/concurrency as a source lock or ordering authority;
- wait for weeks/months for a human to complete the task;
- infer completion from a canceled/successful workflow run;
- directly bypass task/source RLS through an unguarded service client;
- send default email/reminders merely because a task exists;
- mutate Website, CMS, Mobilize, Giving, finance or public state; or
- become required for reading or repairing the authoritative source.

### Recommended deployment shape

1. The source command commits its result, correction episode and projection
   intent.
2. The existing shared workflow dispatch ledger records the handoff request
   with an identifier-only envelope.
3. Immediate Inngest send is best effort; ledger recovery owns lost handoff.
4. The worker acquires a product work claim keyed to the exact projection
   effect.
5. It loads current source, resolver version, authorization and task policy
   from Core.
6. It atomically creates/updates/ends the shared task projection and receipt.
7. It releases the claim and records body-free result codes.
8. A reconciler compares current source intents to task projections and repairs
   missing, duplicate, stale or orphaned effects.

This makes Inngest useful without making the product dependent on its internal
run state. A simple synchronous materializer may be used during an early,
low-volume phase if it invokes the same product command and still records
recoverable intent; the contract must not require Inngest merely for fashion.

### Direct executor comparison

| Approach                                                               | Benefits                                                                                                                                                                                       | Material risks                                                                                                                                                                                                            | Permanent judgment                                                                                                                                                                                            |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Source transaction directly creates task, link and event               | Immediate visibility; one Postgres transaction can provide strong atomicity; simplest runtime if source and task tables share the database                                                     | Couples every producer to task internals; large recipient fan-out lengthens the source command; a task-schema outage can block the authoritative Request changes result; later Mobilize/CMS producers may fork logic      | Accept only behind one shared product task-projection command and only when it cannot make source success depend on optional work presentation. Still write recoverable intent.                               |
| Product outbox/dispatch ledger + short Inngest materializer/reconciler | Matches accepted Core orchestration; source commit is independent; built-in retries, observability and per-Tenant flow control; one cross-domain adapter seam; easy replay from product intent | Eventual visibility; duplicate/out-of-order delivery; provider retention; active-step cancellation limit; 24-hour Inngest dedupe is insufficient; operational dependency and dead-letter handling                         | **Recommended default once shared Tasks Hub integration is built.** Use short revalidating effects, product DB uniqueness/idempotency and a manual/recovery path. Never wait for the human in a workflow run. |
| Product outbox + a non-Inngest database worker/cron                    | Same authority separation; avoids workflow-vendor dependency; may be simpler for a tiny local-only projection                                                                                  | Rebuilds leasing, retries, fairness, backoff, dead letters, observability and operator replay already governed in Core; risks a second job runner and divergent semantics                                                 | Valid only if an existing repository-native worker already owns this exact class or measured constraints show Inngest is unsuitable. Do not invent a parallel worker for D31.                                 |
| Compute tasks dynamically from source on every Tasks Hub read          | No materialization lag or duplicate stored tasks; source always current                                                                                                                        | Cross-domain queries become tightly coupled, expensive and difficult to paginate/search; task-owned assignment/comments/dates cannot exist cleanly; authorization failures can fan out; no durable personal task identity | Reject as the permanent cross-domain Tasks Hub model. It may power a temporary source-local view but not the shared work spine.                                                                               |
| Long-running Inngest function waits for task/source completion         | Workflow code appears visually linear; wait events are durable                                                                                                                                 | Human work may last beyond plan/runtime windows; source policy or authorization can change; cancellation cannot stop active steps; function state becomes a shadow lifecycle; replay/versioning and privacy become harder | Reject. A product task/correction episode is the durable state. Inngest functions should be short materialization/reconciliation effects.                                                                     |

**Recommendation:** use a product-owned outbox/dispatch intent and the existing
Inngest execution plane for short projection and reconciliation jobs. Keep the
materializer callable independently so operators can recover while Inngest is
unavailable. Do not use **waitForEvent** as the human task lifecycle. The
database source episode, task row, source/task events, product idempotency key
and work claim provide durability; Inngest only executes.

## Research-only acceptance outcomes

These outcomes are deliberately exhaustive research inputs. A later spec
effort must reconcile, merge and renumber them into canonical requirements.

### Decision, ownership and terminology

- **D31-RA1:** One exact Request changes result creates at most one open
  source-owned correction episode for the exact Tenant/source/candidate/review
  epoch.
- **D31-RA2:** The source predicate alone determines whether the correction
  episode remains actionable.
- **D31-RA3:** Notification read/unread, task status, assignment, comments,
  dates, reminders, worker state and delivery state are never correction
  authority.
- **D31-RA4:** The correction episode is not a comment, task, notification,
  Page, CMS document, Mobilize record, email, workflow run or public state.
- **D31-RA5:** Tasks Hub is the intended shared human-work surface across
  registered Website/CMS, Mobilize and future producers; no producer creates a
  competing general task model.
- **D31-RA6:** Every participating producer retains its own source state,
  action kinds, authorization, completion proof and history.
- **D31-RA7:** Tasks Hub owns only shared human-work coordination fields under
  its contract.
- **D31-RA8:** Phase 17 owns personal presentation/engagement, not source or
  task completion.
- **D31-RA9:** The glossary distinguishes correction episode, responsibility
  contract, staff-work projection intent, shared task projection and personal
  engagement.
- **D31-RA10:** Staff copy consistently says **Correction needed** or
  source-specific equivalent and never labels a projection failure as a failed
  correction.

### Responsibility and recipient resolution

- **D31-RA11:** Each still-required source action kind selects one registered,
  code-owned and versioned responsibility contract.
- **D31-RA12:** A recipient must be both currently responsible under that
  contract and currently authorized for the exact action/context.
- **D31-RA13:** Broad capability possession alone never selects every capable
  user as a recipient.
- **D31-RA14:** Candidate creator, last editor, D29 coordinator, Tenant owner,
  support user and platform administrator are not implicit fallbacks.
- **D31-RA15:** D30 free prose is never parsed, keyword-matched, AI-classified
  or sentiment-scored into an action kind, assignee, queue or permission.
- **D31-RA16:** A D30 anchor can navigate to exact retained source context but
  cannot determine responsibility unless a separate structured source contract
  independently proves the action kind.
- **D31-RA17:** Caller/event values cannot choose Tenant, actor, recipient,
  responsibility, action kind, capability or authorization evidence.
- **D31-RA18:** One person matching several action kinds receives one active
  personal attention identity for the correction episode.
- **D31-RA19:** Several recipients never inflate one correction episode count;
  reports label episode, task and recipient counts separately.
- **D31-RA20:** The resolver result is bounded by a source contract and rejects
  or quarantines an unexpected fan-out rather than broadcasting.
- **D31-RA21:** Proved-zero recipients create no personal projection and one
  protected source-owner operational gap.
- **D31-RA22:** Indeterminate resolution fails closed, creates no guessed
  recipient and remains observable/retryable.
- **D31-RA23:** A hidden or unauthorized source produces no recipient/title/count
  existence leak.
- **D31-RA24:** Responsibility/authorization changes trigger current-state
  reconciliation without rewriting the original review result.
- **D31-RA25:** Restoration of permission after an episode ended cannot revive
  its old projection.

### Task projection and shared-work compatibility

- **D31-RA26:** The source transaction writes one typed product-owned
  staff-work projection intent alongside the correction episode or commits
  neither.
- **D31-RA27:** Projection intent contains identifiers, contract keys, source
  version and safe routing metadata only.
- **D31-RA28:** Projection intent and task never copy the D30 explanation,
  source body, Page content, reviewer prose or protected anchor content.
- **D31-RA29:** One stable product semantic key identifies each intended task
  effect for longer than any provider dedupe window.
- **D31-RA30:** A database constraint or equivalent product guard prevents two
  active task projections for the same selected task identity.
- **D31-RA31:** Tasks Hub retains a same-Tenant typed link to the authoritative
  correction episode and exact projection intent.
- **D31-RA32:** A task ID/deep link never grants source access or source action
  permission.
- **D31-RA33:** A source-linked task selects a versioned D32 source-controlled
  applicability policy, presentation contract and safe summary contract.
- **D31-RA34:** D31 preserves one shared task identity and recipient action
  projections; D32 rejects independent completion of the same source action.
- **D31-RA35:** Once Tasks Hub support is Live, Needs attention and My tasks
  show one logical work identity rather than duplicate notification/task cards.
- **D31-RA36:** One recipient's read state is shared across authorized views of
  that logical item and remains separate from task/source state.
- **D31-RA37:** Task list/search/index data is PII-minimized and uses code-owned
  localized copy.
- **D31-RA38:** Protected feedback is fetched only from the source detail after
  fresh authorization.
- **D31-RA39:** Task comments, if later available, are task coordination only
  and cannot amend D30 feedback or source truth.
- **D31-RA40:** Task due dates/reminders, if later enabled, are Tasks Hub facts
  and never enter the correction episode or define urgency/completion.
- **D31-RA41:** No default email, push, recurring reminder, due date or
  age-based escalation is created by D31.
- **D31-RA42:** Task assignment/reassignment never grants a role, capability,
  Tenant membership, Site visibility or source access.
- **D31-RA43:** Task deletion/dismissal/suppression cannot delete, hide or
  resolve the source correction.
- **D31-RA44:** Generic task export/search/AI surfaces omit protected source
  feedback unless a separately governed source-authorized projection exists.
- **D31-RA45:** Website and Mobilize adapters share only the staff-work
  projection contract, never each other's source states or permissions.

### UX and UI

- **D31-RA46:** A personal row identifies what needs the user, the permitted
  source context, why it remains open and one direct next action.
- **D31-RA47:** The default title is a short code-owned sentence fragment,
  consistent with the shared Tasks Hub language system.
- **D31-RA48:** The task row never exposes the protected explanation, arbitrary
  reviewer text, hidden recipients or raw technical errors.
- **D31-RA49:** Opening a row clears unread only after the item/detail is
  successfully presented; it never completes source or task work.
- **D31-RA50:** The source detail keeps D30 feedback, exact context and source
  action together; staff need not copy between task and CMS screens.
- **D31-RA51:** The source detail shows only action kinds and feedback the
  viewer may currently access.
- **D31-RA52:** The primary control is **Open correction** or the exact
  source-owned action; **Open in Tasks** is secondary.
- **D31-RA53:** A source-governed active task has no generic Mark complete,
  Dismiss, Archive or Suppress control.
- **D31-RA54:** A generic completion attempt rejects after current revalidation
  and explains that the task closes from its source action rather than hiding
  source work.
- **D31-RA55:** Reassign and **I cannot do this** appear only when the task
  contract permits them and explain that they do not grant access or resolve
  the correction.
- **D31-RA56:** Source end automatically removes applicable work from active
  views without requiring duplicate checkbox cleanup.
- **D31-RA57:** Source-corrected history says **Completed by Website
  correction** or source-specific equivalent without fabricating a human
  completer.
- **D31-RA58:** Superseded/cancelled/not-applicable work says **No longer
  needed** with the exact safe source reason rather than **Completed**.
- **D31-RA59:** Projection delay is visible only where useful and never claims
  Assigned/Sent/Delivered before product materialization exists.
- **D31-RA60:** Zero/indeterminate routing appears only on an independently
  authorized owner/operations surface with a clear corrective path.
- **D31-RA61:** Mobile presents title, context, state and primary action before
  optional metadata.
- **D31-RA62:** Low-bandwidth list queries avoid rich Page/CMS/Mobilize content,
  assets and protected feedback.

### Accessibility and internationalization

- **D31-RA63:** Task lists use ordinary semantic elements unless a data grid is
  genuinely required; rich rows are not implemented as listbox options.
- **D31-RA64:** Keyboard focus order follows visual/reading meaning and every
  action is available without hover, drag or pointer precision.
- **D31-RA65:** Unread, source state, assignment and errors are not conveyed by
  color alone.
- **D31-RA66:** Dynamic count/state changes use an appropriately polite
  programmatic status message without moving focus.
- **D31-RA67:** The journey works at 320 CSS pixels, 400% zoom, browser text
  scaling and forced colors with no lost controls/content.
- **D31-RA68:** Controls meet WCAG 2.2 AA target-size/spacing outcomes and
  visible focus requirements.
- **D31-RA69:** Long translated labels, international names, CJK, RTL and
  mixed-direction values remain readable with bidi isolation.
- **D31-RA70:** Source/user-authored feedback remains in its original language
  and direction unless a separately approved translation workflow exists.
- **D31-RA71:** Pagination/load-more is keyboard and screen-reader usable and
  never creates an infinite-feed trap.
- **D31-RA72:** Manual keyboard, screen-reader, touch, zoom, forced-colors,
  localization and low-bandwidth proof supplement automated checks.

### Source and projection lifecycle

- **D31-RA73:** Correction episode lifecycle is closed and terminal; ended
  episodes never reopen.
- **D31-RA74:** Recurrence after authoritative end creates a linked successor
  episode and fresh unread/task identity.
- **D31-RA75:** Source correction, supersession, cancellation and
  not-applicable ends remain semantically distinct.
- **D31-RA76:** Projection lifecycle distinguishes pending, materialized,
  obsolete and dead-letter handoff state.
- **D31-RA77:** Recipient projection end distinguishes source end, authority
  loss, responsibility change and supersession.
- **D31-RA78:** Source resolution before first view creates no fabricated read
  or unread debt.
- **D31-RA79:** Time passage alone never ends, reroutes, completes or escalates
  a correction episode.
- **D31-RA80:** Projection freshness compares source/contract versions, not only
  timestamps.
- **D31-RA81:** A task/source recurrence preserves predecessor/successor
  lineage without mutating historical assignment.
- **D31-RA82:** Personal recent history follows the accepted presentation
  policy and disappears immediately on access loss.

### Atomicity, concurrency and idempotency

- **D31-RA83:** Request changes vs approve/decline/cancel/expiry/takeover uses
  one source CAS so exactly one terminal result can win.
- **D31-RA84:** The source result, correction episode, audit, receipt and
  projection intent commit atomically.
- **D31-RA85:** Task row, same-Tenant links, initial task event and
  materialization receipt commit atomically.
- **D31-RA86:** Same semantic request/key returns the existing source/task
  receipt; changed meaning under the same key rejects.
- **D31-RA87:** Product uniqueness remains valid beyond Inngest's 24-hour event
  deduplication window.
- **D31-RA88:** Every retryable task projection effect uses a product work
  claim or equivalent fence.
- **D31-RA89:** A worker reloads current source, resolver, authorization and
  task policy immediately before mutation.
- **D31-RA90:** A stale worker cannot restore an old recipient or active task
  after source end/authority loss.
- **D31-RA91:** A source that ends before materialization produces no stale
  active task.
- **D31-RA92:** Ambiguous worker outcomes reconcile the product receipt before
  retry.
- **D31-RA93:** Out-of-order events converge from current product state rather
  than trusting transport order.
- **D31-RA94:** Task completion and source action races preserve source truth
  and cannot hide an open correction.

### Tenant, database and authorization safety

- **D31-RA95:** Tenant is present in primary/unique identities and composite
  relationships for episode, intent, task, source link, recipient and
  engagement data.
- **D31-RA96:** Same-Tenant composite constraints prevent cross-Tenant links
  even through service/owner paths.
- **D31-RA97:** Anonymous grants are absent and authenticated grants expose only
  intended operations.
- **D31-RA98:** RLS policies apply current Tenant+Party+role+surface+source
  visibility and task relationship.
- **D31-RA99:** Update policies check both existing and resulting rows with
  USING/WITH CHECK semantics.
- **D31-RA100:** Views, functions, RPCs, exports, search, counts, caches and
  service/Inngest paths preserve the same non-enumerating boundary.
- **D31-RA101:** Trusted Tenant, actor, author, recipient, responsibility,
  assignment, completion and audit fields are server/database derived.
- **D31-RA102:** Assignment cannot transform an allowed task into another
  Tenant/person/source scope.
- **D31-RA103:** Delete behavior preserves immutable source/audit evidence and
  cannot cascade task deletion into source truth.
- **D31-RA104:** Every object reference is reauthorized even when UUIDs are
  unguessable.
- **D31-RA105:** Cross-Tenant poison tests cover list, badge, detail, mutation,
  reassignment, search, export, cache, worker and support paths.

### Privacy, operations and Inngest

- **D31-RA106:** Task summaries, events, logs, metrics, traces, dead letters,
  cache keys and notification previews contain no D30 body or rich source
  snapshot.
- **D31-RA107:** Workflow envelopes reuse the strict identifier-only contract
  and reject unknown/broad/sensitive fields.
- **D31-RA108:** Inngest is optional execution infrastructure; product records
  remain valid/readable/recoverable if it is disabled.
- **D31-RA109:** Inngest executes short materialization/reconciliation effects,
  not a human-duration waitForEvent workflow.
- **D31-RA110:** Per-Tenant and global concurrency limits mitigate noisy
  neighbors but do not replace source locks or authorization.
- **D31-RA111:** Immediate dispatch failure does not fail the authoritative
  source result; the product ledger recovers handoff.
- **D31-RA112:** Retry exhaustion creates a protected task-projection
  dead-letter and owner response without changing source state.
- **D31-RA113:** Manual replay invokes the same versioned product command and
  product idempotency guard.
- **D31-RA114:** Reconciliation detects missing, duplicate, stale and orphaned
  projections by Tenant and source identity.
- **D31-RA115:** A non-Inngest worker is adopted only through an explicit
  governing decision or existing shared executor, never as a D31-only second
  job runner.

### Migration, proof and traceability

- **D31-RA116:** Rollout is additive: source episode/intent writer first remains
  safe while task projection is dormant.
- **D31-RA117:** Readers/materializer deploy before activation; one producer
  canaries before Website/Mobilize expansion.
- **D31-RA118:** Existing mutable Mission Control rows are not backfilled as
  D31 tasks without authoritative source episodes and deterministic identities.
- **D31-RA119:** Production proof covers positive, zero/indeterminate,
  authorization drift, cross-Tenant, duplicate, lost handoff, stale ordering,
  source-end, recurrence, migration, accessibility and production-shaped scale
  cases.
- **D31-RA120:** Decision log, glossary, ADR, OpenSpec, design, tickets,
  implementation, tests and release evidence trace one vocabulary and one
  source/task authority map across Website, Tasks Hub and each later registered
  producer.

## Named monitors

Thresholds below are recommended initial release stop/response thresholds, not
claimed industry constants. Product/Engineering may tighten them from canary
evidence; weakening a safety stop requires the governing owner and recorded
evidence.

| Signal                                               | Initial threshold                                                                                                                                         | Owner                                | Mandatory response                                                                                                                                       |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| staff_work_cross_tenant_exposure_total               | Any event                                                                                                                                                 | Security + Data Platform             | Disable affected writer/reader/worker, contain access, preserve body-free evidence, run incident response and cross-Tenant poison audit before re-enable |
| staff_work_unauthorized_projection_read_total        | Any event, including count/title existence                                                                                                                | Security + owning producer           | Revoke/fence projection, inspect all list/search/cache/export seams, repair policies and notify incident owner                                           |
| staff_work_protected_body_propagation_total          | Any D30/source body in task, event, log, trace, notification, search or export                                                                            | Security/Privacy + Tasks Hub         | Stop sink/materializer, quarantine/remove unauthorized copies under retention policy, trace every propagation path and add regression proof              |
| staff_work_duplicate_active_projection_total         | Any duplicate semantic active identity                                                                                                                    | Tasks Hub + Data Platform            | Fence materializer, retain one authoritative link, reconcile duplicates without rewriting source history and repair uniqueness/idempotency               |
| staff_work_missing_projection_age_seconds            | Any required projection absent for more than 5 minutes after a committed intent while adapter is Live                                                     | Workflow Operations + Tasks Hub      | Reconcile immediately, inspect dispatch/claims/dead letter, keep source discoverable and never fabricate success                                         |
| staff_work_source_end_projection_lag_seconds         | Any active projection still visible more than 60 seconds after received source-end intent; any unauthorized visibility is already a zero-tolerance signal | Tasks Hub + owning producer          | Run end reconciler, hide by query-time source ceiling, repair stale version/fence                                                                        |
| staff_work_projection_lag_seconds                    | p95 above 60 seconds for 15 minutes or any intent above 5 minutes                                                                                         | Workflow Operations                  | Inspect backlog/fairness/provider health, scale within certified envelope or pause producer activation                                                   |
| staff_work_dispatch_dead_letter_total                | Any D31 dead letter unresolved for 15 minutes                                                                                                             | Workflow Operations + producer owner | Classify permanent/transient, repair/replay same product command, expose protected operational state                                                     |
| staff_work_resolver_indeterminate_total              | Any result                                                                                                                                                | Owning producer + Authorization      | Fail closed, diagnose adapter/permission/data fault, re-run resolver; never use fallback                                                                 |
| staff_work_proved_zero_recipient_open_total          | Any new episode enters proved-zero                                                                                                                        | Owning producer/product owner        | Show protected owner condition, verify whether responsibility configuration or staffing must change; do not page or guess                                |
| staff_work_recipient_fanout_contract_violation_total | Any resolver result over its registered bound                                                                                                             | Security + producer owner            | Stop fan-out, quarantine intent, inspect responsibility data/contract and explicitly revise bound only with evidence                                     |
| staff_work_stale_worker_favorable_write_total        | Any stale worker creates/restores active task/recipient                                                                                                   | Workflow + Data Platform             | Fence worker version, contain rows, reconcile from current source, add out-of-order/concurrency regression                                               |
| staff_work_source_active_generic_completion_total    | Any generic completion/dismissal accepted while source remains actionable                                                                                 | Tasks Hub + producer owner           | Restore truthful active presentation, audit affected work, remove bypass and add completion-policy tests                                                 |
| staff_work_source_active_completion_attempt_rate     | Above 2% of active source-linked task opens over 30 days                                                                                                  | Product/UX + Tasks Hub               | Study wording/control placement by role/device/locale; improve explanation or composition without enabling false completion                              |
| staff_work_duplicate_visible_surface_total           | Any recipient simultaneously sees a separate notification and task representing the same logical assignment as two active items                           | Phase 17 + Tasks Hub                 | Collapse to shared identity/engagement, correct counts and preserve one source link                                                                      |
| staff_work_episode_task_count_drift_total            | Any metric/report treats recipient/task copies as additional correction episodes                                                                          | Data/Analytics + Tasks Hub           | Correct semantic layer and dashboards, backfill derived counts only, add grain labels/tests                                                              |
| staff_work_task_source_link_broken_total             | Above 0.1% of active tasks or any broken link caused by cross-Tenant/wrong-source identity                                                                | Tasks Hub + producer owner           | Disable affected adapter if safety-related; repair typed links from source intent and test referential integrity                                         |
| staff_work_task_list_latency_budget_breach           | p95 exceeds the recorded certified device/network/tenant-shape budget in two consecutive windows                                                          | Tasks Hub + Web Platform             | Profile indexes/payload/pagination, stop rich source joins and block rollout expansion until within budget                                               |
| staff_work_mobile_primary_action_success_rate        | Below 90% in representative canary journeys, excluding source-valid business rejection                                                                    | Product/UX + Web Platform            | Investigate reflow, latency, wording and auth drift; fix before expansion                                                                                |
| staff_work_accessibility_blocker_total               | Any unresolved critical/serious manual or automated accessibility defect before Live                                                                      | Accessibility + Tasks Hub/producer   | Block activation; repair and rerun keyboard, screen-reader, zoom, forced-colors and mobile evidence                                                      |
| staff_work_inngest_noisy_neighbor_lag_ratio          | A tenant's burst causes another tenant's projection p95 to exceed 2 times its certified baseline for 15 minutes                                           | Workflow Operations                  | Apply/adjust per-Tenant plus global flow control, bound fan-out and rerun production-shaped fairness proof                                               |
| staff_work_manual_repair_total                       | More than 1 direct data repair in 30 days for D31 projection state                                                                                        | Tasks Hub + Data Platform            | Stop normalizing SQL repair; identify missing command/reconciler invariant and implement the permanent path                                              |

Safety signals count from synthetic canaries and protected audit/receipt
comparison, not by indexing protected feedback. Monitors must not put Tenant
names, user names, source labels, explanation text or high-cardinality IDs in
metric labels.

## Migration, rollout and rollback

### Permanent rollout order

1. Record D31's corrected authority and future Tasks Hub boundary.
2. Apply D32's source-controlled closure and typed end reasons before exposing
   any source-backed task or terminal presentation.
3. Reconcile D19/D20/D30/D31, ADR-0027, ADR-0054, workflow orchestration and
   platform boundaries into one spec vocabulary.
4. Define producer registration, responsibility contracts, safe summaries,
   source-end applicability, D32 completion authority and protected deep links.
5. Harden the shared task model before Phase 24 depends on it:
   - generalize contribution-only closed unions deliberately;
   - add same-Tenant composite constraints and active uniqueness;
   - add atomic task/link/event/receipt command;
   - add exact RLS/grants/views/functions and privileged-path parity;
   - add source-completion policy and recipient engagement integration;
   - remove seed/prototype authority assumptions.
6. Deploy additive source episode and projection-intent readers/writers behind
   a producer feature fence with task materialization disabled.
7. Deploy the versioned materializer/reconciler, dead-letter tooling and
   observability before enabling dispatch.
8. Shadow-compute resolver/task identities and compare with no user-visible
   tasks.
9. Canary one low-blast-radius Website source/tenant cohort; prove recipient,
   permission, task/source end, accessibility, mobile and low-bandwidth
   journeys.
10. Expand by producer contract only after evidence. Mobilize registers its own
    separate source semantics; it does not inherit Website assumptions.

### Mixed-version safety

- Old code ignores additive episode/intent/task-policy fields.
- New source writer works while task materializer is disabled; intent remains
  pending and recoverable.
- New materializer rejects unknown source/task contract versions without
  guessing.
- Old task readers do not expose protected fields because none are copied.
- A writer fence prevents two materializer generations from owning the same
  contract cohort.
- No backfill infers D31 source episodes from existing mutable task/comment/
  notification rows.
- If Tasks Hub projection is disabled after writes, source state and projection
  intents remain valid; manual/recovery materialization can resume.

### Rollback posture

Rollback means disable the affected producer adapter/materializer and roll
forward the projection, not undo the authoritative Request changes result.
Already written tasks remain subordinate and can be reconciled or marked
no-longer-needed from source evidence. Never delete source review/correction
history, restore reviewer authority, reopen an ended episode, or publish/alter
Website, Giving or Mobilize state to make the task UI look consistent.

## Required proof portfolio

### Positive and boundary tests

- one source episode, one recipient, one active logical item;
- one recipient matching several action kinds remains one D31 attention item;
- several recipient/action combinations preserve one episode count;
- exact contract maximum and maximum-plus-one fan-out;
- zero and indeterminate resolver outcomes;
- source end before/after materialization and before/after first read;
- recurrence after every terminal source end;
- safe task title/deep link with no protected body.

### Negative authorization and privacy tests

- every cross-Tenant relationship and guessed ID;
- same Tenant but wrong Site, environment, locale, source, role, Party,
  candidate or action kind;
- assignee without underlying source read/action permission;
- permission lost between list, detail, materialization and mutation;
- service-role/Inngest/support/export/search/cache paths;
- forged event Tenant/recipient/action/actor;
- D30 body/anchor data injected into every task/event/log field;
- generic task completion/dismissal while source remains open.

### Concurrency and failure tests

- every pair of source terminal actions;
- two materializers, duplicate events, 24-hour-plus replay and changed payload
  under the same product key;
- out-of-order open/end/authorization-change events;
- worker cancellation during an executing step;
- DB write succeeds but response is lost;
- task row succeeds but link/event would fail;
- dispatch unavailable, Inngest disabled, dead letter and manual replay;
- source ends or recipient loses access during worker execution;
- old/new materializer generations and unknown contract versions.

### UX, accessibility and production-shaped tests

- representative Website and later Mobilize staff can explain source state,
  task state and unread state correctly;
- users identify the next action and consequences without opening technical
  details;
- keyboard, screen reader, touch, 320px reflow, 400% zoom, forced colors,
  long localization, CJK, RTL and mixed direction;
- low-bandwidth list/detail navigation without loading rich source data into
  the list;
- one, contract-max and production-shaped episode/task volumes across small
  and large tenants;
- per-Tenant fairness under one noisy-tenant burst;
- p50/p95/p99 latency, rows scanned, payload bytes, DB CPU/connections, worker
  attempts and materialization lag against a recorded certified envelope.

Tests prove user-visible and domain outcomes, not merely that an Inngest run
was green or an insert function was called.

## Assumptions and unresolved unknowns

1. No representative ministry research yet proves how Website correction
   responsibility is recorded, how often it spans action kinds, or how many
   people should see it.
2. No approved Phase 24 runtime currently defines source action kinds or a
   Website responsibility resolver.
3. The D30 explanation and its zero-or-one optional anchor are intentionally
   insufficient for automatic typed task splitting. Any design claiming it can
   derive Page versus Navigation assignment from that prose is unsupported.
4. The eventual Mobilize producer workflows, action kinds, permissions,
   responsibility relationships and completion proofs have not been specified
   here. Compatibility is a boundary, not invented Mobilize behavior.
5. Official products prove both one- and multi-assignee patterns and both
   source-controlled and task-owned completion. D32 chooses source-controlled
   closure for a source-action assignment and reserves task-owned completion
   for a separately defined human follow-up.
6. Current Mission Control code is production code for bounded contribution
   seams but lacks the generalization and structural guarantees D31 needs. Its
   presence does not make it the finished Tasks Hub.
7. Exact task retention, comments, due-date/reminder policy, queue model,
   personal organization and notification preferences belong to the Tasks Hub
   specification, not D31.
8. Exact responsibility-result bounds and production workload distributions
   require source-domain evidence and representative Tenant data.
9. Inngest plan limits, pricing and retention can change. Core's permanent
   correctness cannot rely on them.
10. Initial lag, UX and fairness thresholds are explicit product judgments for
    canary safety and must be calibrated with measured baselines; no vendor
    source supplies Core-specific SLOs.

## Evidence limits

- Comparable task products demonstrate viable interactions and documented
  hazards; none proves nonprofit Website or Mobilize demand, Core language, or
  task grain.
- Contentful's permission mismatch is evidence of a footgun, not evidence that
  Contentful is generally unsafe or that Core uses its architecture.
- Blackbaud confirms nonprofit CRM action/task expectations but mixes
  relationship interactions with work; D31 is source correction, not donor
  cultivation.
- Asana external IDs and task widgets prove source traceability patterns, not
  that a third-party task system should own Core work.
- Microsoft Planner's multiple assignments prove possibility, not clarity or
  accountability.
- Inngest documentation proves executor behavior and limits, not Core product
  demand or exactly-once business effects.
- PostgreSQL, Supabase, OWASP and W3C define mechanics/outcomes; they do not
  choose Core's responsibility contracts, task grain, retention or UX copy.
- Repository docs express accepted boundaries, while existing runtime code may
  be narrower or unsafe for reuse. Intended behavior must not be inferred from
  current code alone.

## Subsequent D32 resolution

D32 accepts amended Option 1. D31 Website tasks have no independent Complete
state; each recipient projection closes from its exact assigned source-action
predicate, so Maria's Page task can finish while Joel's Navigation task and the
parent episode remain active. A separately defined human follow-up may retain
task-owned **Done with my task** only because it is not the same source action
and cannot clear or hide source truth.

See the completed
[D32 adversarial review](./phase-24-d32-source-backed-task-completion-adversarial-review.md)
and
[D32 primary research](./phase-24-d32-source-backed-task-completion-primary-research.md).

## Primary evidence index

### Core repository

- [Workflow orchestration OpenSpec](../../../openspec/specs/workflow-orchestration/spec.md)
- [Platform boundaries OpenSpec](../../../openspec/specs/platform-boundaries/spec.md)
- [Platform principles](../../../openspec/specs/platform-principles/spec.md)
- [ADR-0027 — notification presentation and engagement](../../adr/0027-one-notification-presentation-and-engagement-model.md)
- [ADR-0054 — source-owned exceptions and shared tasks](../../adr/0054-cause-owned-accounting-exceptions-with-shared-follow-up.md)
- [ADR-0181 — source-authorized candidate review](../../adr/0181-source-authorized-candidate-scoped-external-review.md)
- [ADR-0182 — one candidate-review responsibility lane](../../adr/0182-one-current-candidate-review-responsibility-lane.md)
- [ADR-0183 — source-owned work projects into one shared Tasks Hub](../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)
- [D19 state-driven attention research](./phase-24-d19-state-driven-attention-primary-research.md)
- [D20 every review-required episode](./phase-24-d20-every-review-required-episode-adversarial-review.md)
- [D30 required explanation research](./phase-24-d30-required-request-changes-explanation-primary-research.md)
- [D30 adversarial review](./phase-24-d30-required-request-changes-explanation-adversarial-review.md)
- [Phase 24 decision log](./phase-24-multi-site-management-decision-log.md)
- [Core glossary](../../../CONTEXT.md)
- [Current Mission Control schema](../../../supabase/migrations/20260526193000_mission_control_tasks.sql)
- [Current task service](../../../packages/api/src/admin/mission-control-tasks/service.ts)
- [Current task store](../../../packages/api/src/admin/mission-control-tasks/store.ts)
- [Workflow dispatch ledger](../../../supabase/migrations/20260611134500_workflow_dispatch_ledger.sql)
- [Workflow event envelope](../../../packages/api/src/workflows/events.ts)
- [Workflow dispatcher](../../../packages/api/src/workflows/dispatch.ts)
- [Product work claims](../../../packages/api/src/workflows/claims.ts)

### Current official task, CMS, CRM and nonprofit-CRM sources

- [Contentful Entry Tasks API](https://www.contentful.com/developers/docs/references/content-management-api/entry-tasks/)
- [Contentful Tasks help](https://www.contentful.com/help/content-and-entries/tasks/)
- [Asana Tasks API](https://developers.asana.com/reference/tasks)
- [Asana create task API](https://developers.asana.com/reference/createtask)
- [Asana app components](https://developers.asana.com/docs/app-components)
- [Microsoft Planner API overview](https://learn.microsoft.com/en-us/graph/api/resources/planner-overview?view=graph-rest-1.0)
- [Microsoft Planner create task](https://learn.microsoft.com/en-us/graph/api/planner-post-tasks?view=graph-rest-1.0)
- [HubSpot Tasks API](https://developers.hubspot.com/docs/api-reference/latest/crm/activities/tasks/guide)
- [Jira Cloud issue API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/)
- [Jira workflow rules](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-workflows/)
- [Blackbaud actions](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/en-gb/content/bb-actions.html)
- [Blackbaud action records](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/en-gb/content/bb-action-record.html)
- [Blackbaud action measures](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/en-ca/content/bb-action-measures.html)
- [Blackbaud task/role security](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/crm/us/40/Content/ADMSystemRolesAssignTasks.html)

### Current official Inngest sources

- [Durable execution](https://www.inngest.com/docs/learn/how-functions-are-executed)
- [Error handling and retries](https://www.inngest.com/docs/guides/error-handling)
- [Idempotency](https://www.inngest.com/docs/guides/handling-idempotency)
- [Events](https://www.inngest.com/docs/events)
- [Cancellation](https://www.inngest.com/docs/features/inngest-functions/cancellation)
- [Concurrency](https://www.inngest.com/docs/guides/concurrency)
- [Flow control](https://www.inngest.com/docs/guides/flow-control)
- [Fan-out](https://www.inngest.com/docs/guides/fan-out-jobs)
- [Wait for event](https://www.inngest.com/docs/features/inngest-functions/steps-workflows/wait-for-event)
- [Usage limits and retention](https://www.inngest.com/docs/usage-limits/inngest)

### Current official security, database and accessibility sources

- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [OWASP IDOR Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html)
- [OWASP Mass Assignment Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html)
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- [PostgreSQL current constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [PostgreSQL current row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase API security](https://supabase.com/docs/guides/api/securing-your-api)
- [WCAG 2.2 understanding documents](https://www.w3.org/WAI/WCAG22/understanding/)
- [WAI-ARIA listbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/)
- [WAI-ARIA grid pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/)

## Subsequent D35 resolution

D35 confirms that coordinator assignments are a valid future Tasks Hub
consumer only as subordinate recipient-specific projections of one shared
source-backed recovery identity. The Website source-owned Needs assignment lane
remains complete without Tasks Hub or Inngest, and source assignment/end remains
the only completion authority. The optional route is Tenant-only, one to three
people, access-neutral, distinct from D21/D29, and never copied into Mobilize.
See the [D35 adversarial record](./phase-24-d35-shared-lane-optional-recovery-coordinators-adversarial-review.md).
