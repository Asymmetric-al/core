# Phase 24 D31 — Source-Owned Correction Attention and Tasks Hub Readiness

**Status:** Founder answer pressure-tested; ready to record with required
amendments  
**Founder answer:** **Option 1 — source-owned correction attention**  
**Additional founder direction:** Actionable assignments across Core should
eventually appear as tasks for their recipients in one Tasks Hub, including
CMS/Website and future domains such as Mobilize. The design must build toward
that shared future without prematurely choosing Inngest or making a task the
source of business truth.  
**Review date:** 2026-08-28  
**Scope:** Phase 24 D30 `changes_requested` correction work, its personal
attention presentation, and the cross-domain seam required for a future shared
staff Tasks Hub. This document does not implement a schema, runtime, OpenSpec,
or task product.

## Subsequent D33 reconciliation — 2026-08-28

D33 now accepts source-validated return or handoff at the same exact action
grain. Tasks Hub never owns a mutable source-backed assignee. A named handoff
appends one source-proved successor generation; a return names no successor and
preserves every other current responsible recipient. Only when nobody remains
does the source enter **Needs assignment** and show **Returned for
reassignment**. Unknown/partial candidate proof changes nothing, assignment
grants no access, engagement never transfers, and D29 Review coordinators are
not a generic correction-work route. See the
[D33 adversarial review](./phase-24-d33-source-validated-return-handoff-adversarial-review.md)
and [primary research](./phase-24-d33-source-validated-return-handoff-primary-research.md).

## Final disposition

**Accept with required amendments.**

The founder's direction solves the correct problem: after an external reviewer
ends a review with actionable private feedback, the consequence-owning source
should identify and present the next real work to the people who can do it.
Historical authorship, a generic reviewer-coordinator roster, a task queue, a
notification, and a workflow executor are all weaker owners.

The unamended phrase **source-owned correction attention** is nevertheless too
ambiguous to implement safely. It could be misread as “notify every editor,”
“copy the feedback into a task,” “let task completion finish the correction,”
or “send an Inngest event and trust its deduplication.” It also does not say
what an **assignment** means. In Core, an Active Tenant Assignment, a Support
Assignment, task responsibility, capability, participation, and notification
eligibility are different facts. Most of those facts must not create tasks just
because they contain the word “assignment.”

The permanent correction is:

> When an exact source-owned external-review result enters
> `changes_requested`, the consequence-owning source SHALL open one immutable-
> identity, state-driven **Correction attention episode** for the exact Tenant,
> environment, Site, source, candidate, review epoch, and result. A closed,
> versioned source contract SHALL declare its safe title, exact next-action
> code or codes, current actionability predicate, responsibility resolver,
> capability and visibility predicates, protected detail projection,
> destination, end rule, and bounded recipient ceiling. The source SHALL NOT
> infer routing from the reviewer's prose, optional anchor, historical author,
> broad role, notification engagement, task state, AI, or workflow-provider
> state.
>
> One complete routing generation SHALL select only people who are both in the
> exact source-responsibility set and currently authorized to see the minimum
> necessary source facts and perform at least one still-required next action.
> Capability alone does not assign every capable staff member; assignment
> grants no access. Proved zero recipients creates no guessed fallback.
> Indeterminate, partial, ambiguous, or over-ceiling resolution releases
> nobody and remains visible on the independently authorized source surface.
>
> Each selected recipient SHALL receive one recipient-specific, deduplicated
> actionable presentation for the correction episode, even when that person
> can perform several admitted next actions. Personal read/unread state is
> presentation only. Reading clears unread but never ends, hides, completes,
> dismisses, or transfers work. Current authorization is re-proved for list,
> count, detail, navigation, and every action. Access loss removes protected
> presentation immediately and never transfers engagement history.
>
> The source remains the sole authority for whether correction work exists and
> when each required action or the episode ends. A valid corrected-successor or
> other registered source transition ends the applicable recipient
> presentations; a task, notification, click, comment, timer, worker, or
> provider cannot do so. D31 creates no default due date, reminder, email,
> recurrence, urgency escalation, public effect, Giving effect, or finance
> effect.
>
> D31 SHALL build toward one cross-domain staff Tasks Hub through a versioned
> **Source work projection contract**. One source work identity may have
> recipient-specific work-assignment and engagement projections, so every
> selected recipient sees one task in **My tasks** without creating competing
> copies of source truth. Website/CMS, Mobilize, contribution operations, and
> later producers reuse the envelope, identity, authorization, lifecycle,
> idempotency, and observability contract; each retains its own action,
> visibility, retention, and completion rules. A source-backed task references
> protected source detail. Source end always makes the projection inapplicable,
> while task state can never clear source work. D32 now selects source-
> controlled closure at the exact assigned source-action scope: a recipient's
> projection closes when their final applicable source action ends, not
> necessarily when the whole correction episode ends. The task does not copy
> D30 feedback or become a second writer.
>
> A durable transactional outbox or equivalent product ledger SHALL make task
> and notification projection replayable. Inngest MAY execute the asynchronous
> handoff only if the later design proves that its durable retries,
> observability, fan-out, and concurrency controls provide proportional value.
> Inngest SHALL NOT own the source episode, recipient resolution,
> authorization, durable deduplication, task identity, or completion. Its
> 24-hour event-id deduplication and execution concurrency are never substitutes
> for database uniqueness, source compare-and-swap, or request-time reproof.

## Evidence labels

- **Verified repository fact** means confirmed in current Core documentation,
  migrations, or source on 2026-08-28.
- **Verified external fact** means supported by a current first-party product,
  standards, or vendor document linked in this review.
- **Reasonable inference** means a conclusion that follows from those facts but
  is not itself an accepted Core requirement.
- **Product judgment** means the recommended permanent choice where primary
  evidence does not prove one universal answer.
- **Assumption** means a ministry or staff behavior that needs representative
  research before it may be treated as measured fact.
- **Unresolved unknown** means deliberately deferred policy that is surfaced as
  a later one-at-a-time Grill question, not silently guessed here.

## Current behavior, intended behavior, and permanent path

| Area                      | Current repository behavior                                                                                                                                                                                                                                                                                                                       | D31 intended behavior                                                                                    | Best permanent path                                                                                                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D30 review result         | ADR-0181 now owns one terminal `changes_requested` result, protected explanation, optional source anchor, and authorization-context end. No runtime exists for Phase 24.                                                                                                                                                                          | The result opens source-owned correction work without changing Live Website or Giving.                   | One exact result causes one source episode and an atomic durable projection intent; no feedback copy.                                                                                            |
| D19/D20 attention         | Accepted forward design uses recipient-specific Phase 17 actionable notifications, personal engagement, source-owned end, and no tasks by default. The canonical runtime is not yet implemented.                                                                                                                                                  | D31 uses the same state-driven attention semantics for actual correction work.                           | Preserve ADR-0027: notification remains an attention projection; a future task is a separate shared-work projection linked to the same source occurrence.                                        |
| Platform Tasks direction  | Merged `platform-boundaries` requires one shared Mission Control staff task model. The delivered contribution PRD says CMS, missionary workflows, Support Hub, Email Studio, automations, and batches should later reuse it.                                                                                                                      | D31 must not create a CMS-only task table or task vocabulary.                                            | One cross-domain Tasks Hub contract with finite source adapters; D32 source-controls exact source-action closure while separately owned human follow-up may retain task-owned completion.        |
| Contribution task backend | `mission_control_tasks` exists, but its issue/link unions are contribution-specific. Inserts of task, links, and event are sequential rather than one atomic/idempotent operation. `assignee_profile_id` is nullable and not a same-Tenant composite reference. Tables have RLS enabled but only service-role grants in their defining migration. | Treat current code as shipped contribution behavior and migration evidence, not a complete D31 contract. | Evolve or replace it additively behind one shared task service only after current-data compatibility, same-scope constraints, idempotency, source-backed policy, and authorization are designed. |
| Admin `/tasks` surface    | The current route uses a separate browser collection and placeholder `tenant-1` / `staff-1` logic, exposes create/edit/delete/comments/reminders, and lets the client set completion. It is not the contribution task backend's authoritative UI.                                                                                                 | Reuse its helpful page/drawer interaction ideas only, not its authority or data model.                   | Build a route-addressable, server-authorized Tasks Hub using shared Base Maia components; distinguish manual tasks from source-backed tasks.                                                     |
| Missionary tasks          | A separate missionary task model and UI exist. Repository registry guidance says missionary workflows can contain donor context and require role-scoped RLS before browser collections.                                                                                                                                                           | Do not merge tables or expose staff work in the missionary app merely because both say “task.”           | Later Tasks Hub contracts may project a role-scoped surface only when the source and Phase 12 admit it; surface split remains real.                                                              |
| Mobilize                  | Current Core has Mobilize candidates and related admin data, but D31 discovered no accepted generic “every Mobilize assignment creates a task” contract.                                                                                                                                                                                          | Reserve a cross-domain adapter seam without inventing Mobilize workflows.                                | A future Mobilize decision registers exact actionable episodes; passive pipeline membership, ownership, or candidate state creates no task by convention.                                        |
| Inngest                   | Core pins `inngest` 4.5.1 and has one platform client, safe identifier-only envelopes, a durable workflow dispatch ledger, recovery scans, and product-owned work claims. It does not currently project Tasks Hub work.                                                                                                                           | Evaluate it as an optional asynchronous executor.                                                        | Reuse the existing ledger/envelope pattern if selected; keep product truth and durable idempotency in Postgres.                                                                                  |
| Permissions               | Current broad staff capability mappings and current task stores do not prove exact Website correction action capability.                                                                                                                                                                                                                          | Recipient resolution must use current source-specific capability and visibility.                         | Add explicit least-privilege action capabilities and poison-test browser, RPC, service-role, support, AI, cache, and export paths.                                                               |

### Repository conflicts explicitly resolved

1. **ADR-0027 says a notification is never a task.** D31 does not collapse
   them. Notification and task are separate projections over one source work
   occurrence, with separate personal engagement and shared-work semantics.
2. **D19/D20 deliberately create no task.** That remains true for their
   review-required notification contract. D31 covers a new, concrete correction
   obligation and deliberately records the future shared-task projection seam.
3. **ADR-0054 gives Mission Control task ownership of coordination fields but
   not cause truth.** D31 applies the same permanent pattern: the Website source
   owns correction existence/completion; Tasks Hub may own allowed assignee,
   personal organization, comments, dates, and reminders only when a later
   source policy explicitly admits them.
4. **The delivered contribution task model is called shared.** Its architectural
   direction governs; its current contribution-specific unions, weak composite
   integrity, and non-atomic create flow do not become correct merely because
   they shipped.
5. **The admin and missionary task UIs already exist.** They are current product
   evidence, not permission to join incompatible authorities or preserve demo
   placeholders.

## Problem validity, jobs, and strongest alternative

### Valid job

An authorized staff member needs to notice and act on a private, source-owned
correction without searching every Website candidate, receiving irrelevant
feedback, or treating an email as the workflow. A manager or operator needs to
see whether actionable work is stranded without reading private details they
cannot otherwise access. A future Tasks Hub needs the work to appear alongside
other assigned staff work without turning every domain into a task-system
owner.

### Invalid extrapolation

“Many assignments create tasks” does **not** mean all records named assignment
create tasks. Active Tenant Assignments confer tenant relationship; Support
Assignments identify organization-controlled subjects; collaboration or review
assignments may grant bounded responsibility; capabilities permit actions.
Only a registered transition into a current human action requirement may open
a source work occurrence.

### Strongest alternative

The strongest no-build alternative is a persistent **Changes requested** state
and filter on Website source pages with no personal attention and no task. It is
simpler, cannot drift into a second task system, and remains an essential
fallback. It is insufficient as the permanent answer because cross-domain
staff work would stay fragmented and a qualified recipient could reasonably
miss the handoff. D31 therefore keeps source discovery **and** adds the one
bounded projection.

### Example

Eli requests changes because Hope Ministries' French **Contact us** link opens
the English page. The source candidate knows which finite source component and
correction-action contract apply; it does not ask AI to interpret Eli's prose.
Maria is in the current Page correction-responsibility set and can see and edit
the Page. Joel is in the current Navigation correction-responsibility set and
can see and edit Navigation. Each sees one permission-filtered work row, even if
one person is responsible for several admitted actions. A broad Website viewer
and another Page editor who is capable but not currently responsible receive
nothing. If the source cannot prove an action/responsibility mapping, it shows
the unresolved condition to independently authorized source staff and releases
no guessed personal item.

## Modern-practice evaluation

The founder direction is consistent with modern products **after** Core's
stricter authority amendments:

- [Asana tasks](https://help.asana.com/s/article/understanding-tasks) use one
  assignee for clear accountability and put assigned work in **My tasks**;
  [multi-homing](https://help.asana.com/s/article/multi-home-tasks-to-avoid-information-silos)
  shows one task in several project contexts without creating divergent copies.
  Core should adopt the one-identity/multiple-projection principle, not Asana's
  access-by-collaborator behavior.
- [Microsoft Planner](https://support.microsoft.com/en-US/Planner/assign-people-to-tasks)
  can assign one task to several people and any one completion completes it for
  all. Its warning that removing someone from a plan does not automatically
  remove task access is direct evidence that assignment and access must be
  re-proved separately in Core.
- [Atlassian](https://support.atlassian.com/jira-cloud-administration/docs/work-item-permissions/)
  separates permission to assign work from whether someone is assignable and
  from browse access. Core needs an even stronger source-detail check.
- [Salesforce](https://help.salesforce.com/s/articleView?id=Can-I-assign-tasks-or-events-to-other-users&language=en_US&type=1)
  requires both activity access and read access to the related record and puts
  newly assigned work in the user's task list. Its related-record pattern
  supports reference-not-copy, while its broad CRM permission hierarchy is not
  Core's Tenant/RLS model.
- [HubSpot Tasks](https://knowledge.hubspot.com/tasks/filter-tasks-and-manage-task-views)
  defaults task views to the current assignee; its [task queues](https://knowledge.hubspot.com/tasks/use-task-queues)
  demonstrate automatic workflow-created tasks and shared queues. Core should
  not import default reminders, recurring tasks, or queue-wide disclosure into
  D31 without a separate decision.
- [Blackbaud CRM event tasks](https://webfiles-sc1.blackbaud.com/files/support/guides/enterprise/400/events.pdf)
  tie owner, instructions, status, due date, and optional reminders to nonprofit
  operational records. This proves comparable demand, not that every D31 task
  needs a date, reminder, or editable copied description.
- Current [Inngest idempotency guidance](https://www.inngest.com/docs/guides/handling-idempotency)
  explicitly recommends product code be idempotent and documents only a 24-hour
  event/function idempotency window. [Retries](https://www.inngest.com/docs/guides/error-handling)
  resume at step boundaries but still require idempotent side effects;
  [concurrency](https://www.inngest.com/docs/functions/concurrency) limits
  executing steps rather than in-progress runs; and
  [cancellation](https://www.inngest.com/docs/features/inngest-functions/cancellation)
  acts between steps. These are useful execution facilities, not business
  invariants.
- [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
  and `CREATE POLICY` semantics require deliberate `USING` and `WITH CHECK`
  behavior; table owners and privileged roles need separate hardening. Assignment
  visibility cannot be protected by a Tasks Hub filter alone.
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) requires logical focus order,
  unobscured focus, alternatives to drag-only operation, minimum target sizing,
  and programmatic status messages. A polished drawer is not accessible if task
  disappearance loses focus or status is communicated only by color.

No primary source proves one universal task cardinality, one exact projection
latency, or that Inngest is necessary. Those are Core product and architecture
judgments constrained by the repository's governing ownership model.

## Normative D31 rules

### D31-R1 — Only actionable source transitions open work

A registered source predicate changing from false to true opens one Correction
attention episode. A role grant, Active Tenant Assignment, Support Assignment,
participant membership, capability, saved reviewer, reviewer contact, Page
visit, task open, timestamp, or age does not create a task by itself.

### D31-R2 — The source owns existence and completion

The exact Website source owns the episode, candidate lineage, next-action
meaning, actionability, current facts, terminal transition, and source audit.
Notification, Tasks Hub, CMS presentation, Inngest, analytics, and caches are
never writers of those facts.

### D31-R3 — One finite source work contract

Every admitted source registers a closed versioned contract containing a safe
title key; subject type; exact source/candidate/epoch grain; next-action codes;
actionability, visibility, capability, responsibility, and end predicates;
safe list facts; protected detail loader; typed destination; retention class;
recipient ceiling; and task/notification projection policies. Missing,
ambiguous, or unknown contract versions fail closed.

### D31-R4 — Prose and anchors never route work

D30 explanation text and optional source anchor are protected evidence. They
may help an authorized human understand the work but may not be parsed,
classified, embedded, searched, or AI-interpreted to choose action codes,
recipients, queues, priority, dates, or completion.

### D31-R5 — Responsibility plus capability plus visibility

A recipient must be in the exact source-responsibility result and currently
hold the exact action capability, Tenant assignment, Site visibility, source
visibility, and detail visibility needed for their projection. Capability alone
does not assign everyone. Responsibility alone grants nothing.

### D31-R6 — Complete bounded resolution

Routing produces one of: complete bounded recipient set, proved zero, or
indeterminate. All selected recipients release all-before-any. Partial,
ambiguous, stale, or over-ceiling sets release none. The existing D19 global
hard ceiling of 50 recipient-role projections remains the outer safety bound;
each source contract declares the smallest justified lower ceiling.

### D31-R7 — One source identity, personal assignment projections

One correction episode has one source work identity. The future Tasks Hub may
store one task/work record plus recipient assignment rows; it must not create
independent copied tasks whose titles, detail, status, or completion can drift.
One recipient sees at most one active task presentation for an episode, even if
several admitted action codes apply to that recipient.

### D31-R8 — Assignment is not access or exclusive ownership

A work-assignment row records current responsibility presentation. It grants no
source, task-detail, Tenant, Site, Page, Navigation, Mobilize, donor, missionary,
Giving, finance, or reviewer-feedback access. Unless a later source policy says
otherwise, it also does not imply that only that person may perform a source
action already authorized to another actor.

### D31-R9 — Personal engagement stays personal

Seen, read, unread, list position, collapsed detail, and permitted personal
organization belong to the exact recipient+role+surface. They never change
source work, another recipient, a task's terminal result, priority, permission,
or public behavior.

### D31-R10 — Source-backed closure follows exact source-action truth

A source transition always makes the applicable task projection no longer
actionable. No task **Complete**, **Dismiss**, **Delete**, **Suppress**, or
**Resolve** operation may clear, waive, or alter Website correction truth. D31
tasks use D32 source-controlled closure: a recipient's presentation ends when
their final assigned source-action scope ends, even if unrelated scopes or the
episode remain active. Generic task mutation paths reject source-backed tasks.
A separately defined Independent follow-up task may own only its human
follow-up completion and cannot clear or hide source work.

### D31-R11 — Source detail is referenced, never copied

Task and notification rows store only typed identifiers, safe code-owned list
facts, and source lineage. They do not store D30 explanation text, anchor
content, reviewer email, arbitrary source JSON, CMS content, private missionary
data, donor details, or rendered HTML. The source detail endpoint re-proves
authorization and returns the minimum projection when opened.

### D31-R12 — One calm cross-surface experience

Before Tasks Hub integration, the canonical Phase 17 attention presentation may
navigate directly to the source. After integration, the recipient still sees
one actionable row and one active count—not a notification row plus an
identically worded duplicate task. Notification unread and task/source active
state remain technically distinct but the UI correlates them by source work
identity.

### D31-R13 — Source discovery always remains

The Website source surface retains a permission-filtered **Changes requested**
state and correction filter. Projection delay, proved zero recipients, task
service outage, Inngest outage, user preference, or notification failure never
hides source truth from otherwise authorized source staff.

### D31-R14 — No default timer or channel

D31 creates no target date, due date, age escalation, SLA, priority change,
reminder, recurrence, digest, email, SMS, push, sound, provider message, or
calendar event. A later Tasks Hub policy may admit separately owned coordination
dates or channels without turning them into Website schedule or completion.

### D31-R15 — Source transitions end applicable siblings

When a corrected successor is validly created or the exact registered end rule
becomes true, the source atomically records the end head/outbox intent. Every
recipient projection then leaves active views. If action-specific predicates
end separately, only the affected recipient/action membership ends; the source
episode ends when no registered correction action remains.

### D31-R16 — Route change uses immutable generations

Recipient loss or an explicit source-responsibility change never mutates
historical assignment truth or transfers read state. The source appends one
successor routing generation; continuing recipients keep their engagement,
responsibility-only removed recipients leave active views but retain authorized
body-free non-unread Recent history with the exact Reassigned/Returned reason,
and new recipients receive fresh personal engagement. Authorization loss still
removes active and recent protected presentation; later access alone never
revives an old assignment.

### D31-R17 — Zero and uncertainty differ

Proved zero recipients is a valid bounded outcome and creates no guessed task.
Indeterminate resolution is an operational failure, remains discoverable on the
source surface, and is reconciled. Neither falls back to creator, last editor,
all staff, all admins, Website Review coordinators, Finance Operations, or a
generic queue.

### D31-R18 — Durable product idempotency

The source occurrence, routing generation, work identity, recipient assignment,
notification intent, task intent, and terminal transition each have durable
semantic identities and database uniqueness. Same key and same canonical
meaning returns the existing result. Same key with changed meaning hard-
conflicts. Transport request IDs and Inngest's 24-hour deduplication are only
additional defenses.

### D31-R19 — Atomic source write, eventual projections

The D30 terminal source command writes the result, episode, initial routing
proof or pending-resolution intent, and durable outbox/dispatch claim in its
authoritative transaction. Task and notification projection may be eventual.
Their failure cannot roll back or falsify the accepted review result; replay and
reconciliation must converge.

### D31-R20 — Inngest remains an optional executor

If used, Inngest receives the existing strict identifier-only workflow envelope
and reloads current source/task state inside each claimed step. Its function is
tenant-keyed for proportional concurrency, uses bounded retries, exposes final
failure, and is safe under replay, cancellation, out-of-order events, and
provider outage. A simpler database outbox worker remains valid if it meets the
same contract with less burden.

### D31-R21 — Tasks Hub is shared, adapters are source-specific

The platform owns one task identity, assignment, engagement, comments/date/
reminder policy vocabulary, search/list contract, and audit model. Website,
Mobilize, contribution operations, Support, and later sources own their
admissibility, action codes, facts, authorization, detail, destination, and end
rules. D31 creates no generic workflow DSL or Tenant-authored trigger builder.

### D31-R22 — Manual and source-backed tasks are visibly different

A source-backed task is code-created and source-linked; source end always makes
it inapplicable and D32 gives it no independent completion transition. Fields
or controls that its source policy does not admit are omitted rather than
disabled without explanation. Manual and independently lifecycle-owned
follow-up tasks may allow their own completion and coordination under separate
closed policies. Users are never asked to guess which semantics apply.

### D31-R23 — Protected feedback follows D30 everywhere

D30 explanation text remains original-language, inert plain text under its
source records class. It is excluded from task list rows, notification preview,
emails, Inngest payloads/history, logs, traces, metrics, analytics, search,
vector indexes, AI, comments, generic exports, and client persistence. Detail
uses `dir="auto"` and the source's authorized quarantine/disposition path.

### D31-R24 — Tenant and role scope are structural

Every conceptual key and relationship carries Tenant and environment; Site and
source scope are present where applicable. Same-scope composite foreign keys,
restrictive deletion, immutable scope columns, forced RLS where supported,
explicit grants, operation-correct `USING`/`WITH CHECK`, hardened functions,
and privileged-path reproof prevent cross-scope mutation or visibility.

### D31-R25 — Stable human, current session, trusted actor

Historical recipient identity uses Core's stable human/Party lineage, not
email or display name. Current access resolves through the authenticated
principal and Active Tenant Assignment. Tenant, actor, recipient, role, source,
capability, and audit attribution are derived server-side and never accepted as
caller authority.

### D31-R26 — Lists are safe and efficient

Tasks Hub defaults to **My tasks** and server-side current authorization. List
rows use safe code-owned title and context facts only; protected detail is lazy.
Queries are cursor-paginated, deterministically ordered, indexed by exact
Tenant/recipient/active/source grain, and batch current authorization/source
state to avoid N+1 checks. Caches are Tenant-, principal-, role-, policy-, and
authorization-revision-keyed and never outlive access.

### D31-R27 — UX remains source-led

The primary row action is the exact imperative next action, such as **Open
Website work**, not **View task**. The route opens the source at the permitted
context. The task detail explains why it exists, how task state differs from
source completion, who or
what created it, current source state, and the no-public/no-Giving consequence.
It never claims the external reviewer assigned staff personally.

### D31-R28 — Accessibility and field conditions are release gates

Base Maia shared components must support semantic list/table structure, visible
focus, logical DOM/focus order, no nested interactive rows, non-color state,
status announcements, 320-CSS-pixel reflow, 400% zoom, forced colors, reduced
motion, keyboard and screen-reader operation, at least WCAG 2.2 AA target
requirements with a 44-CSS-pixel design target, localized long text, RTL/CJK,
touch, low bandwidth, offline/retry, and focus recovery when a task ends.

### D31-R29 — Migration is additive and one-writer

No Phase 24 tasks are inferred from historical comments, reviews, candidates,
notifications, admin demo tasks, missionary tasks, or contribution task rows.
Land versioned contracts, constraints, authorization, readers, source detail,
shadow projection, reconciliation, and observability before one cohort writer.
Never dual-write two task authorities.

### D31-R30 — Observability separates truth from projection

Durable business history records source occurrence, routing proof, safe action
codes, projection intent/outcome, source end, and actor lineage without protected
body. Security audit records access/denial/quarantine. Technical telemetry uses
low-cardinality identifiers and error codes. Task status, Inngest run state,
notification delivery, and dashboard health never become business evidence.

## Complete staff UX and information architecture

### 1. The handoff is quiet, immediate, and truthful

Eli submits **Request changes**. His result page truthfully confirms that the
feedback was recorded and his access ended. It does not say that Maria was
notified, that a task was created, or that staff read the feedback unless those
separate facts are authoritative.

The Website source records one correction episode and durable projection
intent. Current Website and Giving remain unchanged. No toast, focus theft,
email, timer, or calendar entry is created for staff.

### 2. The source resolves responsibility without reading the prose

The source evaluates the versioned candidate/source contract and current
responsibility, capability, and visibility. The UI never asks Eli to assign
staff, choose a department, set priority, or supply a due date. It never uses an
LLM or keyword match to infer that “link” means Navigation.

If exact routing is proved, personal work presentations release. If it is
zero or indeterminate, authorized source staff see a calm source-level state:

```text
Changes requested
The current Website and Giving are unchanged.

Correction work is not assigned
Core could not identify an authorized person for the next action.

[Review Website access and responsibility]
```

The control appears only to someone authorized for that source administration;
it is not a shortcut to D29 coordinators or all administrators.

### 3. Tasks Hub defaults to the person's work

The permanent Tasks Hub is the existing top-level **Tasks** destination, evolved
into a real server-authorized shared product rather than another CMS page. Its
default view is **My tasks** with a plainly labelled active count. Useful
secondary views can include **All active** for authorized managers and
**Completed** history; **Due today** and **Overdue** do not fabricate membership
for undated D31 work.

Desktop example:

```text
Tasks
Work assigned to you across Core.

My tasks · 3 active

Website
Prepare a corrected Website version
hope.org · French (Canada)
Changes were requested · Completes from Website state
                                                    [Open Website work]
```

List rows do not show the D30 explanation, reviewer identity, private anchor,
or another recipient's name. A source badge and meaningful subject help staff
scan cross-domain work without creating separate CMS/Mobilize tabs as separate
task products. Search covers safe title, source label, permitted subject label,
and status—not protected feedback.

### 4. Detail explains the contract before the action

On wide screens, a route-addressable Base Maia Drawer may preserve list context.
On small screens, the same route uses a full-page composition rather than a
cramped side sheet. Browser Back returns to the same filter, scroll, and focus
position. A deep link remains usable without first loading the list.

```text
Prepare a corrected Website version                         Website

Assigned to you
Hope Ministries · hope.org · French (Canada)

Why this needs attention
Changes were requested for this Website version.
The current Website and Giving are unchanged.

What needs to change
The Contact us link opens the English page.

Related section
Contact us link · French (Canada)                   [View original section]

How the Website correction ends
Only creating a corrected Website version—or another valid source end—ends the
Website correction. Task status cannot change the Website.

[Open Website work]
```

The protected explanation and reviewer identity load only if the current actor
may see them. If reviewer identity is hidden, the UI says **External review**;
it never substitutes an email address. The task says **Assigned to you by the
Website workflow**, not **Assigned by Eli**, because the source resolver—not the
reviewer—created responsibility.

### 5. Source action—not a checkbox—does the work

**Open Website work** navigates to the exact permitted source route and keeps
the current candidate, requested changes, authorized editor controls, and
successor consequence together. If Maria can prepare Page changes but not
Navigation changes, she sees only the Page projection and the source's existing
route-to-owner behavior for the rest. D31 never manufactures an edit permission.

After a valid source transition, a status message says:

```text
Page correction prepared. Your Website task is complete.
Other correction work may still be required.
```

Focus moves to the next logical element or a stable list heading, not to the top
of the page. The exact assigned source-action end makes Maria's row
inapplicable while unrelated assignments remain. Task history says **Completed
in Website**, **Completed elsewhere**, **No longer required**, **Reassigned**,
or **Returned** from the authoritative source reason; **Returned for
reassignment** appears only when nobody remains and source Needs assignment.
Access loss is never completion. Tasks
Hub cannot reopen source work, and a later request-changes episode creates a
successor source work identity.

### 6. Reading never masquerades as action

Opening the task clears that recipient's unread indicator. The row remains in
**My tasks · 3 active**. The bell count may fall while the active task count
does not. Copy and iconography explicitly distinguish **Unread** from **Active**;
color is supplemental.

### 7. Permission changes fail cleanly

If Maria loses Site access while the detail is open, the next detail/action
request denies and protected feedback disappears. The page shows:

```text
Access changed
This task is no longer available to you. No Website change was made.
[Back to My tasks]
```

The client removes cached protected detail, retains no offline body, and does
not expose whether Joel or another person received a successor assignment.
Historical business audit remains body-free.

### 8. Weak networks retain confidence

The list can render its safe cached shell only when current authorization can
be re-proved; protected detail is never available from a stale offline cache.
Loading, empty, retryable failure, authorization loss, and indeterminate source
state are visibly different. Clicking the source action during a network error
does not optimistically complete the task. Repeating a safe request uses the
same semantic idempotency key where a mutation is involved.

### 9. Mobile and international use remain first-class

At 320 CSS pixels, title, source, locale, status, and action stack without
horizontal scrolling. The row's primary link and overflow actions are separate
focus targets, never a clickable row containing nested buttons. Touch targets
use a 44 CSS pixel design target. The task body preserves original language,
Unicode, line breaks, bidi isolation, and `dir="auto"`; interface copy follows
the user's locale. No machine translation is presented as the reviewer's words.
No due-date timezone appears because D31 creates no date.

### 10. Cross-domain coherence does not erase source differences

A later Mobilize task may read **Review Ana's interview packet** and open the
Mobilize source. A contribution task may read **Resolve failed refund** and
carry finance urgency under its own contract. They share row anatomy, **My
tasks**, assignment presentation, navigation, engagement, list behavior, and
audit vocabulary. They do not share Website feedback retention, Mobilize
candidate privacy, financial completion proof, or action permissions.

## Source of truth and ownership map

| Fact                                          | Authority                                                              | Permitted projections                     | Never authoritative                                          |
| --------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------ |
| external review result and D30 explanation    | exact Website consequence-owning source under ADR-0181                 | protected source detail                   | task description, notification, Inngest event, comment       |
| whether correction work exists                | exact source actionability predicate and episode head                  | Tasks Hub/notification active state       | read, task status, worker run, elapsed time                  |
| exact next-action meaning                     | registered source work contract                                        | safe action code/label and destination    | reviewer prose, anchor text, AI classification               |
| responsibility set                            | source-specific responsibility resolver                                | immutable routing generation              | capability holders, historical authors, generic queue        |
| ability to act now                            | Phase 12/current Tenant+source authorization                           | request-time allow/deny                   | task assignment, stale cache, profile ID                     |
| stable recipient history                      | CRM/Party identity plus immutable routing occurrence                   | authorized audit attribution              | email, display name, browser account alone                   |
| source work identity                          | source occurrence key                                                  | task and notification correlation         | vendor run ID, row timestamp, copied task ID                 |
| shared task identity and allowed coordination | platform Tasks Hub under source task policy                            | My tasks, source backlink, manager view   | source completion, Website/public truth                      |
| recipient work assignment                     | Tasks Hub projection of source responsibility generation               | recipient My tasks row                    | permission or exclusive source lock                          |
| personal read/unread                          | exact recipient+role presentation owner                                | bell/list treatment                       | work completion or other users' state                        |
| task detail                                   | source-authorized minimum projection loaded at read time               | current detail route                      | list cache, export, event payload                            |
| source-end applicability                      | exact source-action/end projection under D32 source-controlled closure | typed task history and active suppression | manual task state as source completion, notification archive |
| projection dispatch/retry                     | durable Core outbox/dispatch ledger; optional Inngest executor         | technical status and reconciliation       | source/result/task business truth                            |
| durable business history                      | source and task audit owners, body-free                                | authorized audit/report                   | logs, traces, Inngest dashboard                              |
| protected body lifecycle                      | D30 source records class                                               | authorized read/quarantine/disposal       | task retention, notification retention                       |

## Domain invariants

1. One exact D30 `changes_requested` result opens at most one correction
   episode.
2. One episode belongs to exactly one Tenant and environment and one exact
   source/candidate/review epoch.
3. A task exists only for a registered actionable source occurrence, never for
   a nominal assignment, role, capability, or membership.
4. Source actionability and source end are authoritative and cannot be written
   by Tasks Hub, notification, Inngest, or a recipient.
5. One episode has one cross-surface source work identity.
6. One routing generation is immutable and complete before recipient release.
7. Proved zero, complete bounded, and indeterminate routing outcomes are
   different and cannot be coerced into each other.
8. A recipient must satisfy responsibility, capability, visibility, identity,
   and current Tenant assignment independently.
9. Assignment grants no access; access grants no assignment.
10. One exact episode+recipient Party+role+surface has at most one active
    personal presentation.
11. One shared task identity may have several recipient assignment projections;
    copied tasks never compete over completion.
12. One recipient's read, layout, or future personal organization never mutates
    another recipient or the source.
13. A recipient with several action codes sees one task row with only the
    action subset they may see.
14. D30 body and anchor content never enter task/notification list storage,
    event transport, telemetry, search, AI, or comments.
15. Task and notification are separate projections and cannot complete or
    archive one another.
16. Source end eventually removes every applicable active projection but never
    rewrites immutable history.
17. Permission loss removes protected presentation immediately; later gain
    never revives old engagement.
18. Same semantic work identity cannot create a second task after any transport
    deduplication window expires.
19. Task projection failure cannot reverse, delay, or falsify the accepted D30
    source result.
20. No D31 state changes Website Live content, Giving, Designations, donor
    intent, finance, public routing, or reviewer authority.
21. Task due dates, reminders, comments, priorities, and manual completion are
    absent unless the exact source-backed task policy later admits them.
22. Every cross-domain producer uses one platform projection vocabulary but
    retains its source-specific authorization, facts, lifecycle, and retention.

## Conceptual data, RLS, and authorization contract

This is a logical contract, not permission to freeze these table names before
the future Tasks Hub design reconciles current task stores.

### Conceptual records

| Record                           | Required meaning and constraints                                                                                                                                                                          |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `source_correction_episode`      | Source-owned immutable identity; composite Tenant/environment/Site/source/candidate/review-epoch/result uniqueness; current actionability/end head; restrictive deletion; no feedback body duplication.   |
| `source_work_contract_version`   | Code-owned finite manifest version and schema digest; no Tenant-authored executable expression or workflow graph.                                                                                         |
| `source_work_routing_generation` | Append-only complete/zero/indeterminate outcome, source/authorization/responsibility heads, contract version, recipient count, generated and ended instants; one current released generation per episode. |
| `source_work_routing_member`     | Same-scope episode/generation, stable recipient Party, intended role/surface, safe action-code subset, immutable resolution evidence; composite uniqueness prevents duplicate membership.                 |
| `source_work_projection_intent`  | Durable outbox/ledger row for task/notification target, schema version, semantic idempotency key, status, attempts, next attempt, safe identifiers/error codes; unique per Tenant+projection meaning.     |
| `shared_task`                    | One platform work identity, source type/id/episode link, task policy version, safe title/context codes, source-derived active/end state, created/ended metadata; no D30 body.                             |
| `shared_task_assignment`         | Same-Tenant task and exact routing member, stable recipient Party/role/surface, generation, active/end reason; at most one active assignment at its semantic grain.                                       |
| `shared_task_engagement`         | Exact assignment+recipient personal read/unread and later permitted personal organization; never source status.                                                                                           |
| `shared_task_event`              | Append-only body-free task projection/assignment/status audit with trusted actor/system attribution and source event link.                                                                                |

### Required integrity

- Every cross-record relation includes Tenant and environment in a composite FK
  or proves equal scope inside one hardened server transaction. A standalone
  UUID reference is insufficient.
- Site, source, candidate, result, routing generation, task, assignment, Party,
  role, and audit attribution cannot be moved across scope by update.
- Source and routing identities use `ON DELETE RESTRICT` or governed terminal
  disposition; tenant deletion follows the platform's separately approved
  lifecycle and cannot silently erase legally/audit-relevant history.
- Partial unique indexes or equivalent constraints enforce one current episode
  head, one released routing generation, one task per source work identity, and
  one active assignment per recipient grain.
- JSON may carry only versioned safe display facts with a strict schema. It may
  not hide tenant IDs, recipients, capabilities, status, feedback, source body,
  or mutable authorization truth.
- Database timestamps record facts; application clocks, local time zones, and
  worker receipt time never decide actionability or order terminal races.

### Authorization and RLS

1. Browser code cannot insert/update/delete source episodes, routing,
   projection intents, source-backed tasks, assignments, or audit.
2. One `packages/api` command/query boundary derives Tenant, environment,
   principal, Party, Active Tenant Assignment, role, capabilities, and actor.
3. List authorization requires current assignment ownership **and** the safe
   source/list predicate; detail requires current protected source visibility;
   action requires current source action capability and all expected heads.
4. Source-backed task mutations expose only explicitly registered operations.
   The generic manual-task mutation path rejects their task policy kind.
5. Tables use least grants, RLS, and `FORCE ROW LEVEL SECURITY` where the chosen
   ownership model permits it. Policies cover SELECT, INSERT, UPDATE, and DELETE
   separately with correct existing-row `USING` and resulting-row `WITH CHECK`.
6. Security-definer/RPC functions set a safe search path, revoke public execute,
   validate caller identity, derive trusted scope, lock expected heads, and
   cannot accept caller-supplied actor/recipient/tenant as authority.
7. Service-role, scheduled worker, support, import/export, AI, cache, Realtime,
   and reconciliation paths repeat the same source-purpose checks or consume a
   purpose-bound projection that cannot widen them.
8. Realtime payloads carry safe invalidation identifiers only; clients refetch
   an authorized projection. They never broadcast feedback or assignment sets.
9. An allowed update cannot transform a permitted task/assignment into another
   Tenant, recipient, role, source, policy kind, or terminal state.
10. Authorization-denied list/count behavior is non-enumerating. Badge counts
    are computed after the same current authorization filter as rows.

## Lifecycle, temporal correctness, concurrency, and idempotency

| Starting state/event                             | Authoritative operation                                                  | Required result                                                                      |
| ------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| no correction episode → D30 result commits       | source transaction proves exact result and current heads                 | one episode and durable projection intent; Website/Giving unchanged                  |
| initial resolver complete, recipients 1..ceiling | source/platform compiler writes one immutable generation and all members | release all task/notification intents together                                       |
| resolver proves zero                             | generation records zero with proof                                       | no guessed recipient; source discovery remains                                       |
| resolver indeterminate/partial/overflow          | no released generation                                                   | no recipient leak; operator/source state shows safe unresolved condition             |
| recipient opens item                             | personal engagement mutation                                             | unread clears for that recipient; work remains active                                |
| recipient opens source action                    | authorization reproof                                                    | navigate to current permitted source or deny cleanly; no completion                  |
| one action predicate ends but others remain      | source commits new head/end fact                                         | affected assignment projections end; remaining work stays active                     |
| corrected successor becomes valid                | source expected-head command                                             | episode ends; all applicable tasks/attention end; fresh review is separate           |
| candidate superseded/canceled/source removed     | exact registered end reason                                              | active projections end; immutable history remains; no successor inferred             |
| access/capability lost                           | current authorization revision changes                                   | protected list/detail/action disappear immediately; async end reconciliation follows |
| responsibility route changes                     | source appends successor generation                                      | continuing recipients keep engagement; removed end; new recipients start unread      |
| access later regained without new generation     | authorization only                                                       | no old-task revival                                                                  |
| same result/intent delivered twice               | same semantic key and meaning                                            | one episode/task/assignment; return/reuse existing receipt                           |
| same key, changed payload/meaning                | conflicting producer/adapter input                                       | hard conflict and alert; never first/last-write-wins                                 |
| task projection write succeeds, response is lost | retry/reconciliation                                                     | unique semantic key returns same task; no duplicate                                  |
| end event races task creation                    | source head and task upsert transaction/reproof                          | never expose active task after authoritative end; zero unread debt if unseen         |
| two recipients act concurrently                  | source action CAS                                                        | one valid source transition wins; loser gets current state; no duplicate successor   |
| old create arrives after newer end               | worker reloads current source head                                       | create is suppressed or immediately terminal; never reopen                           |
| Inngest function retries/replays                 | product claim and DB uniqueness                                          | same durable effect independent of 24-hour provider window                           |
| Inngest cancellation/provider outage             | durable intent remains pending/failed                                    | source truth remains; another executor/recovery can converge                         |
| deployment mixes adapter versions                | schema/version negotiation                                               | unsupported versions dead-letter safely; no guessed field/default                    |

## Is Inngest a good fit?

### Proportionate answer

**Possibly, for asynchronous projection and reconciliation; not required and
not yet a D31 decision.**

Core already has the right pattern in `packages/api/src/workflows`: a strict
identifier-only envelope, a durable `workflow_dispatch_requests` ledger,
product-owned semantic idempotency, recovery scans, tenant-keyed concurrency,
and workers that reload and claim current product rows. Reusing that machinery
could avoid another queue, improve retry visibility, and let task and
notification projections fan out independently.

It would be the wrong fit if D31 used Inngest to:

- decide whether correction work exists or is complete;
- parse feedback or choose recipients;
- carry feedback bodies or broad source snapshots;
- provide the only idempotency guard;
- serialize source actions through a concurrency key;
- wait for human work in one long-running function;
- schedule default reminders or escalation;
- hide an incomplete Tasks Hub domain behind vendor workflow state.

### Selection criterion for the later design

Choose Inngest only if a production-shaped comparison shows that its existing
Core ledger integration delivers materially better retries, dead-letter
visibility, fan-out, rate/concurrency control, and operations than a smaller
Postgres outbox worker. Both candidates must pass the same source-owned,
identifier-only, current-state-reproof, idempotency, portability, outage, and
reconciliation contract. D31 records no vendor dependency in the source or task
schema.

## Full adversarial review by required category

Each category reviews the bare founder answer plus its Tasks Hub direction. A
material concern marked **Yes** means the bare wording is unsafe or incomplete;
it does not mean the corrected design remains unacceptably risky.

### 1. Problem validity, necessity, and alternatives

**Material concern: Yes — the need is real, but “all assignments create tasks”
would solve the wrong problem at the wrong level.**

| What could go wrong                                                                                                                                                       | Why it matters                                                                                                                                           | Severity |                             Likelihood | Evidence or reasoning                                                                                                                                                                                                                                      | Effect on current answer                                                         | Best permanent fix                                                                                           | Exact decision/spec language to add                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------: | -------------------------------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Core could turn every Tenant role, Support Assignment, candidate owner, capability, or workflow relation into a task and flood staff with records that require no action. | Task overload hides urgent mission work, creates misleading accountability, and makes the Tasks Hub a mirror of the database rather than a work surface. |     High | High if “assignment” remains undefined | **Repository fact:** Core has several semantically different assignment concepts. **External fact:** Asana and HubSpot define tasks around concrete to-dos, not every membership. **Assumption:** Core has no representative study proving desired volume. | Narrows and changes the bare answer; does not invalidate source-owned attention. | Admit only a versioned false→true human-action predicate and keep source discovery as the no-build fallback. | **D31-R1:** “Only a registered current human action requirement opens source work; nominal assignment, membership, capability, or role creates no task.” |
| A source-only filter could be sufficient for some low-frequency work, making personal projection unnecessary complexity.                                                  | Building attention and Tasks Hub integration without a missed-handoff problem would waste effort.                                                        |   Medium |                                 Medium | **Repository fact:** D19 already keeps persistent source discovery. **Product judgment:** correction work has an explicit recipient handoff, but no Core usability baseline exists.                                                                        | Narrows rollout and mandates evidence, not rejection.                            | Pilot against source-only discovery and measure findability/completion without adding reminders.             | “Source discovery SHALL remain complete; task projection expands only after pilot comprehension and missed-handoff evidence meet recorded thresholds.”   |

### 2. Brittleness

**Material concern: Yes — naive routing works only when prose, permissions,
responsibility, and task state happen to align.**

| What could go wrong                                                                                                                                                  | Why it matters                                                                                                                   | Severity | Likelihood | Evidence or reasoning                                                                                                                                                                                         | Effect on current answer      | Best permanent fix                                                                                                                        | Exact decision/spec language to add                                                                                                          |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------: | ---------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Parsing “Contact us link” from D30 prose or using its optional anchor to infer Page versus Navigation can misroute multilingual, vague, or mixed-source corrections. | Wrong staff may see private feedback; correct staff may never receive work; model/parser changes silently change responsibility. | Critical |       High | **Repository fact:** D30 permits free-form original-language prose and zero/one non-authoritative anchor. **Reasonable inference:** neither encodes a complete action graph.                                  | Requires a central amendment. | Finite source adapters enumerate typed next-action codes from source/candidate structure; ambiguous work releases no personal projection. | **D31-R3–R4:** “Reviewer prose, anchor text, embeddings, and AI SHALL NOT determine action code, recipient, queue, priority, or completion.” |
| Persisting a mutable recipient array on the task works only until roles, Site restrictions, and responsibility routes change.                                        | It leaks protected work after access loss and cannot preserve routing history or personal engagement correctly.                  | Critical |       High | **Repository/ADR fact:** current access must be re-proved; D19 uses immutable routing generations. **External fact:** Planner documents that removal from a plan does not itself remove assigned-task access. | Narrows recipient storage.    | Immutable routing generations plus request-time authorization and explicit successor generation.                                          | **D31-R16:** “Route changes append a generation; they never rewrite recipients or transfer engagement.”                                      |

### 3. Technical debt

**Material concern: Yes — Core already has three incompatible task-shaped seams.**

| What could go wrong                                                                                                                                                                            | Why it matters                                                                                                                                                      | Severity | Likelihood | Evidence or reasoning                                                                                                                                                                     | Effect on current answer                             | Best permanent fix                                                                                                                       | Exact decision/spec language to add                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------: | ---------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reusing the contribution backend unchanged, copying the admin demo collection, or adapting missionary tasks could create CMS-specific forks, incompatible statuses, and permanent dual writes. | Cross-domain task views, authorization, reporting, migrations, and repair become irreconcilable; one task may appear complete in one surface and active in another. | Critical |       High | **Current source:** contribution tables/service, admin `/tasks`, and missionary tasks use different shapes and authorities. **Merged OpenSpec:** one shared staff task model is required. | Changes implementation path, not the product answer. | Treat current seams as migration inputs; converge through one versioned shared task service with explicit manual/source-backed policies. | **D31-R21, R29:** “No source-specific task table, browser collection, or dual writer may become canonical; migration is additive and one-writer.” |
| Copying D30 feedback into task descriptions appears convenient and becomes shadow state with separate retention, search, comments, and edits.                                                  | Private external feedback can leak or drift, and staff cannot know which copy is authoritative.                                                                     | Critical |       High | **ADR-0029:** reference-not-copy. **D30:** body excluded from tasks/search/AI.                                                                                                            | Strongly narrows task storage.                       | Store typed source reference and fetch minimum detail on authorized open.                                                                | **D31-R11, R23:** “Task storage and event transport SHALL contain no request-changes body or anchor content.”                                     |

### 4. Edge cases

**Material concern: Yes — realistic zero, mixed-action, stale, and permission
races change who may see or perform work.**

| What could go wrong                                                                                                                                                                        | Why it matters                                                                                                            | Severity |  Likelihood | Evidence or reasoning                                                                                                                                                                    | Effect on current answer           | Best permanent fix                                                                                                             | Exact decision/spec language to add                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | -------: | ----------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| A correction spans Page and Navigation; one person can do both, two can do one each, or nobody can see the full feedback. Duplicate rows, missing actions, or overbroad detail can result. | Staff either duplicate effort or receive information/actions outside their scope.                                         |     High | Medium-high | **Founder example** explicitly contains Page/Navigation split. **Repository fact:** earlier D13 routes authorized updates and owners separately.                                         | Refines work grain and projection. | One episode, typed action memberships, one personal row per recipient, action-filtered detail, zero/indeterminate safe states. | “One recipient with several admitted actions receives one row; each projection SHALL expose only that recipient's currently visible action subset.” |
| Source end races task creation; a user opens an item during revocation; the same recipient loses and later regains access; a successor gets another request changes result.                | Stale work can revive, protected text can flash, unread debt can be fabricated, or distinct episodes can dedupe together. | Critical |      Medium | **ADR-0027/D19:** access loss, source end, and later authority are explicit lifecycle cases. **Inngest docs:** retries and cancellation occur at boundaries, not atomically with source. | Requires lifecycle amendment.      | Current-head reproof, immutable episode/generation IDs, end-before-release suppression, no old revival.                        | **D31-R15–R19:** “Old create after end never exposes active work; a later result uses a successor episode identity.”                                |

### 5. Footguns

**Material concern: Yes — familiar task controls can silently contradict source
truth.**

| What could go wrong                                                                                                                                  | Why it matters                                                                   | Severity |                        Likelihood | Evidence or reasoning                                                                                                                             | Effect on current answer                              | Best permanent fix                                                                                                                                | Exact decision/spec language to add                                                                                                             |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------: | --------------------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| A generic **Mark complete**, **Dismiss**, **Delete**, bulk complete, or drag-to-Done control can hide unresolved Website work or appear to clear it. | Staff and managers may mistake subordinate task state for source completion.     | Critical | High if current task UI is reused | **Current UI:** admin and missionary tasks expose client completion/delete/bulk controls. **ADR-0054:** task completion cannot clear cause truth. | Requires the D32 source-controlled closure amendment. | Reject generic semantics; close only from the exact assigned source-action receipt and keep independently owned follow-up tasks visibly separate. | **D31-R10, R22 / D32:** “Source-backed tasks SHALL reject generic completion and close only from their registered source-action applicability.” |
| A fallback to creator, last editor, every admin, or Finance queue makes empty routing look successful.                                               | Private feedback leaks and ministries assume work has an owner when it does not. | Critical |                       Medium-high | **Repository fact:** current contribution assignment defaults actor+Finance queue; D19 rejects guessed fallback.                                  | Narrows routing defaults.                             | First-class proved-zero and indeterminate states plus source admin recovery.                                                                      | **D31-R17:** “Zero and indeterminate routing never fall back to historical actors, all staff, coordinators, or a generic queue.”                |

### 6. Tenant safety

**Material concern: Yes — task hubs aggregate exactly the records most likely to
cross Tenant and role boundaries.**

| What could go wrong                                                                                                                                                                                  | Why it matters                                                                                                                       | Severity |                            Likelihood | Evidence or reasoning                                                                                                                                | Effect on current answer       | Best permanent fix                                                                                                                              | Exact decision/spec language to add                                                                                                                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------: | ------------------------------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A globally unique task/recipient UUID, broad service query, Realtime payload, cache, badge count, manager view, or export can omit Tenant/Site scope and expose another ministry's work or feedback. | Cross-Tenant exposure is a critical confidentiality incident and can reveal protected missionary/location or donor-adjacent context. | Critical | Medium without structural constraints | **Merged OpenSpec:** Tenant isolation is structural. **Current migration:** task links and assignees are not expressed as same-Tenant composite FKs. | Requires structural amendment. | Composite scope keys, request-time source reproof, tenant/principal keyed caches, safe invalidation, poison tests across every privileged path. | **D31-R24–R26:** “Every task relation, list/count/detail/action, cache, export, Realtime, worker, and support path SHALL prove identical Tenant/environment and current role scope.” |

### 7. Database, RLS, and authorization safety

**Material concern: Yes — current shipped tables do not prove the future
source-backed mutation and visibility contract.**

| What could go wrong                                                                                                                                                                                                          | Why it matters                                                                                                             | Severity |                                    Likelihood | Evidence or reasoning                                                                                                                                                                                               | Effect on current answer                                            | Best permanent fix                                                                                                                                                       | Exact decision/spec language to add                                                                                                                                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------: | --------------------------------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App-only uniqueness can create duplicate tasks; nullable standalone profile/queue FKs can cross scope; broad service role can bypass RLS; update can transform a permitted manual task into a privileged source-backed task. | Duplicate work, cross-Tenant links, forged attribution, and unauthorized state transitions become durable data corruption. | Critical | High if existing tables are extended casually | **Current source:** only queue key has Tenant uniqueness; task create inserts task, links, event sequentially; service-role owns writes. **PostgreSQL:** RLS needs explicit policies and privileged-owner handling. | Requires a new conceptual integrity/mutation boundary before reuse. | Atomic server command/RPC, durable semantic keys, composite FKs, immutable discriminant/scope, least grants, forced RLS, separate policies and privileged poison matrix. | **D31-R18, R24–R25:** “Caller input SHALL NOT set trusted tenant, actor, recipient, role, source, task kind, or terminal state; `USING` and `WITH CHECK` SHALL prevent allowed-row transformation.” |
| Assignment visibility could be treated as permission to read the whole D30 body or perform every source action.                                                                                                              | Assignment becomes an authorization-escalation path.                                                                       | Critical |                                   Medium-high | **Atlassian external fact:** assignability and assign permission are separate; **Core fact:** Phase 12 is sole PDP.                                                                                                 | Reinforces answer with independent predicates.                      | Separate safe-list, protected-detail, and action capabilities; task assignment alone authorizes none.                                                                    | **D31-R5, R8, R25:** “Each list, detail, destination, and source action SHALL independently re-prove its minimum current authorization.”                                                            |

### 8. Overengineering

**Material concern: Yes — cross-domain readiness can easily become a generic
workflow platform prematurely.**

| What could go wrong                                                                                                                                                                                                           | Why it matters                                                                                                            | Severity | Likelihood | Evidence or reasoning                                                                                                                                            | Effect on current answer            | Best permanent fix                                                                                              | Exact decision/spec language to add                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------: | ---------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| D31 could introduce arbitrary Tenant triggers, workflow graphs, formulas, AI routing, priorities, dependencies, subtasks, comments, attachments, schedules, SLAs, queues, and escalation to solve speculative Mobilize cases. | It duplicates Phase 34/general workflow direction, delays a clear handoff, and creates an unmaintainable policy language. |     High |       High | **Repository fact:** current platform distinguishes declarative guarded automation and source-owned workflows. **Product judgment:** D31 needs one finite event. | Narrows extensibility deliberately. | Closed code-owned source adapters and a small projection envelope; expand only through separately proved needs. | **D31-R3, R21:** “D31 SHALL NOT introduce a Tenant-authored trigger/routing/workflow DSL or fields unused by this source contract.” |

### 9. UX/UI and user friction

**Material concern: Yes — a duplicate, ambiguous, or generic task experience
would be worse than source discovery.**

| What could go wrong                                                                                                                                                                                                                                     | Why it matters                                                                                                               | Severity |                           Likelihood | Evidence or reasoning                                                                                                                                                                                   | Effect on current answer                                             | Best permanent fix                                                                                                                                           | Exact decision/spec language to add                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------: | -----------------------------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Users could see a bell item and separate task with different counts; a generic drawer could imply editable task completion clears Website work, show a due-date blank, and say “Assigned by Eli”; mobile could hide context behind nested interactions. | Staff cannot tell whether reading, opening, task status, or source action changes which truth; confidence and adoption fall. |     High | High without an explicit composition | **Current repo:** task UI and notification direction have separate semantics. **External fact:** My Tasks views work when ownership/action is clear. **WCAG:** focus/order/status must be programmatic. | Requires the detailed UX contract and D32 source-controlled closure. | One correlated row, source-led imperative CTA, **Completes in Website** explanation, no generic checkbox, responsive detail, and preserved list state/focus. | **D31-R12, R22, R26–R28 / D32:** “The UI SHALL explain that the exact source action closes the recipient projection automatically.” |
| Showing protected feedback in list preview improves scanning but leaks content in shoulder surfing, screenshots, analytics, browser memory, and manager views.                                                                                          | D30's privacy boundary would be defeated by convenience.                                                                     | Critical |                               Medium | **D30 fact:** body is protected and body-free channels/search/telemetry are required.                                                                                                                   | Narrows list content.                                                | Safe code-owned list facts; lazy protected detail; current authorization; no persistent offline body.                                                        | **D31-R11, R23, R26:** “List, badge, search, analytics, export, and event payloads SHALL remain body-free.”                         |

### 10. Source of truth, ownership, and domain invariants

**Material concern: Yes — “task for the recipient” invites dual ownership.**

| What could go wrong                                                                                                    | Why it matters                                                                                     | Severity |                       Likelihood | Evidence or reasoning                                                                                                                               | Effect on current answer                                                   | Best permanent fix                                                                                                                                                                 | Exact decision/spec language to add                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------: | -------------------------------: | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tasks Hub may treat `completed` as clearing Website `changes_requested`, or several personal task copies may disagree. | Historical and current truth diverge; automation and reporting may take action on the wrong state. | Critical | High if generic tasks are reused | **ADR-0054:** cause owns clearing; task follow-up is subordinate. **Asana external fact:** one task can appear in multiple projects without copies. | Requires one shared identity and D32 source-controlled assignment closure. | One source work identity, one shared task identity, recipient projections, and exact source-action receipts; task-owned completion exists only for a separately defined follow-up. | **D31-R2, R7, R10 / D32:** “Only source applicability ends a source-backed assignment; independent follow-up completion remains a separate fact.” |

### 11. Hidden coupling

**Material concern: Yes — adapters can silently couple Tasks Hub to CMS schema,
DOM anchors, current role names, or Inngest.**

| What could go wrong                                                                                                                                                                                                | Why it matters                                                                                                              | Severity |  Likelihood | Evidence or reasoning                                                                                                                                                      | Effect on current answer | Best permanent fix                                                                                                | Exact decision/spec language to add                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | -------: | ----------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Task identities or routes derived from Payload collection names, DOM positions, translated labels, email, current profile IDs, vendor run IDs, or JSON payload paths break on CMS, identity, or provider upgrades. | Old tasks become unopenable, cross-link incorrectly, or revive; Mobilize cannot reuse the contract without CMS assumptions. |     High | Medium-high | **ADR-0029:** schema boundary uses stable validated references. **D30:** anchor is opaque/source-bound. **Current Inngest:** events use product-domain subject identities. | Narrows identity design. | Stable opaque product IDs, versioned adapter/action codes, Phase 12 identity resolution, provider-neutral outbox. | **D31-R3, R18, R20–R21:** “No UI structure, label, email, app route, or workflow-provider identity SHALL define product task meaning.” |

### 12. Failure modes

**Material concern: Yes — the source write and secondary projections can
partially succeed or return ambiguous outcomes.**

| What could go wrong                                                                                                                                                           | Why it matters                                                                                                              | Severity | Likelihood | Evidence or reasoning                                                                                                                                                            | Effect on current answer           | Best permanent fix                                                                                                                                  | Exact decision/spec language to add                                                                                                                            |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------: | ---------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Review result succeeds but outbox/task fails; task succeeds and response is lost; task appears after source end; dead letter is unnoticed; reconciliation writes a duplicate. | Staff either miss real work or see stale/duplicate work, while the external reviewer cannot retry safely after access ends. | Critical |     Medium | **Current task service:** multi-step non-atomic create. **Current Core workflow ledger:** durable handoff/recovery exists. **Inngest:** retries require idempotent side effects. | Requires durable failure contract. | Atomic source+intent, deterministic semantic task identity, current-state claim, explicit failed/dead-letter states, reconciler and receipt lookup. | **D31-R18–R20, R30:** “Every secondary projection SHALL be replayable and convergent; source success is never inferred from projection success or vice versa.” |

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: Yes — several individually valid operations can jointly
create duplicate successors, stale assignments, or reopened work.**

| What could go wrong                                                                                                                                                               | Why it matters                                                                                                                 | Severity | Likelihood | Evidence or reasoning                                                                                                                                                                                | Effect on current answer       | Best permanent fix                                                                                                                                   | Exact decision/spec language to add                                                                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------: | ---------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Two recipients create a successor concurrently; an old create races end; route change races read; provider dedupe expires after 24 hours; cancellation occurs after a task write. | Duplicate candidates/tasks, wrong unread counts, and forbidden stale access can result despite each handler appearing correct. | Critical |     Medium | **D25–D30:** source actions use expected-head CAS. **Inngest docs:** event/function idempotency is time-bounded, cancellation occurs between steps, concurrency limits execution not business races. | Strongly refines architecture. | DB uniqueness and expected heads at durable business grain; immutable generations; worker reproof; same-meaning receipts; changed-meaning conflicts. | **D31-R15–R20:** “Database/source invariants SHALL remain correct under duplicate, delayed, replayed, canceled, concurrent, and out-of-order execution.” |

### 14. Data integrity risks

**Material concern: Yes — duplicated task rows and mutable JSON links can drift
from source and recipient truth.**

| What could go wrong                                                                                                                                                                | Why it matters                                                         | Severity |  Likelihood | Evidence or reasoning                                                                                                                 | Effect on current answer          | Best permanent fix                                                                                                               | Exact decision/spec language to add                                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | -------: | ----------: | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| One task per recipient copy can carry different descriptions/status; task links can point across Tenant; task deletion can erase audit; backfill can infer work from old comments. | Repair requires manual database surgery and destroys historical trust. | Critical | Medium-high | **Current migration:** generic text/JSON links and cascade behaviors do not encode D31 invariants. **ADR-0029:** copied state drifts. | Changes data grain and migration. | One work/task identity plus assignment rows, composite relations, restrictive deletion, append-only audit, future-only episodes. | **D31-R7, R24, R29:** “No copied per-recipient task truth or inferred historical D31 work SHALL be created.” |

### 15. Security and privacy risks

**Material concern: Yes — D30 feedback may contain accidental secrets or
sensitive ministry/location information.**

| What could go wrong                                                                                                                                                                                         | Why it matters                                                                                                        | Severity |                   Likelihood | Evidence or reasoning                                                                                                                                                                  | Effect on current answer                      | Best permanent fix                                                                                                                               | Exact decision/spec language to add                                                                                                                                       |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | -------: | ---------------------------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Feedback can leak through list summary, task description/comments, notifications, Inngest event history, errors, logs, search, AI, exports, Realtime, caches, or screenshots available to broader managers. | It may expose donor/payment data, identities, restricted locations, or security material beyond the source's purpose. | Critical | Medium over product lifetime | **D30:** body-free projection contract. **Current workflow envelope:** rejects body/secret-like context keys. **External task products:** collaborators/queues often widen visibility. | Narrows every projection and management view. | Identifier-only transport, safe code-owned facts, protected on-demand detail, retention/quarantine, body-free audit, negative propagation tests. | **D31-R11, R23–R25:** “No task, event, telemetry, search, AI, comment, export, cache, or manager projection SHALL copy protected feedback or widen source authorization.” |

### 16. Scalability and performance risks

**Material concern: Yes — per-recipient fan-out and per-row source reproof can
degrade across large Tenants and many domains.**

| What could go wrong                                                                                                                                                                           | Why it matters                                                                                          | Severity | Likelihood | Evidence or reasoning                                                                                                                                                          | Effect on current answer                | Best permanent fix                                                                                                                                     | Exact decision/spec language to add                                                                                                 |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------: | ---------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| “Every capable person” produces unbounded task fan-out; task list performs one authorization/source/body query per row; one large Tenant monopolizes workers; badge count scans mutable JSON. | Tasks become slow/noisy, database connections saturate, and small ministries wait behind large tenants. |     High |     Medium | **D19 repository judgment:** bounded recipients and production-shaped 0/1/50 tests. **Inngest:** tenant-keyed concurrency can limit resource use but not business cardinality. | Narrows routing and query architecture. | Source-minimal recipient ceiling, cursor pagination, safe indexed columns, batch projections, per-Tenant worker fairness, lazy detail, no body search. | **D31-R6, R20, R26:** “Recipient fan-out and query/work execution SHALL be bounded, indexed, batch-authorized, and fair by Tenant.” |

### 17. Operational burden

**Material concern: Yes — task drift, dead letters, permission churn, and
several existing task stores can require recurring manual repair.**

| What could go wrong                                                                                                                     | Why it matters                                                                                                | Severity |                   Likelihood | Evidence or reasoning                                                                              | Effect on current answer                           | Best permanent fix                                                                                                                                    | Exact decision/spec language to add                                                                                                                                           |
| --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------: | ---------------------------: | -------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Operators may need to query several tables, inspect Inngest, copy feedback, close duplicates, or manually reassign after staff changes. | Small nonprofit tenants cannot depend on developer intervention; manual body handling increases privacy risk. |     High | Medium-high without runbooks | **Current repo:** multiple task seams and workflow ledger already require reconciliation concepts. | Requires operational design before writer rollout. | One task service, body-free correlation IDs, automated reconciliation, owner-only safe repair commands, dead-letter runbook, no direct SQL/body copy. | **D31-R20–R21, R29–R30:** “Every drift/failure SHALL have an observable, idempotent, audited roll-forward path that does not require direct body inspection or SQL mutation.” |

### 18. Observability and auditability gaps

**Material concern: Yes — technical success can be mistaken for business
completion, while privacy limits what can be logged.**

| What could go wrong                                                                                                                                     | Why it matters                                         | Severity |                             Likelihood | Evidence or reasoning                                                                                                                    | Effect on current answer        | Best permanent fix                                                                                                                               | Exact decision/spec language to add                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | -------: | -------------------------------------: | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| A green Inngest run or task `completed` row appears to prove correction; conversely body-free logs make an operator unable to correlate a missing task. | Audits become false or incidents become undiagnosable. |     High | High unless vocabularies are separated | **ADR-0027/0054:** presentation/task state is not source truth. **Current workflow ledger:** product and dispatch statuses are distinct. | Requires typed evidence planes. | Durable body-free business audit, security access audit, technical projection telemetry, stable correlation IDs, explicit source-vs-task labels. | **D31-R30:** “Business history, security audit, and technical telemetry SHALL be separate; no provider/task state may certify source completion.” |

### 19. Dependency and integration risks

**Material concern: Yes — Inngest or a CMS/task plugin could become a hidden
required authority or leak private payloads.**

| What could go wrong                                                                                                                                                                                         | Why it matters                                                                                                | Severity | Likelihood | Evidence or reasoning                                                                                                                                     | Effect on current answer                                   | Best permanent fix                                                                                                                                                                            | Exact decision/spec language to add                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------: | ---------: | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vendor outage, rate/concurrency limits, retention, replay, cancellation, schema change, or event dedupe expiry can delay/duplicate work; a Payload plugin could couple operational tasks to CMS migrations. | Source work becomes unavailable or corrupt when a provider changes; private content may enter vendor history. |     High |     Medium | **Current source:** Core has an Inngest adapter/ledger and separate CMS/operational boundary. **Official Inngest docs:** limits and 24-hour dedupe exist. | Narrows dependency role; does not reject optional Inngest. | Provider-neutral source/outbox/task schema, identifiers-only envelope, reload/claim current data, durable product uniqueness, alternate/recovery executor, no Payload-owned operational task. | **D31-R20–R21:** “The workflow/CMS provider SHALL remain replaceable execution/presentation infrastructure and SHALL own no source, recipient, idempotency, task, or completion fact.” |

### 20. Migration, rollout, and upgrade risks

**Material concern: Yes — mixed task models and mixed app/schema versions make
a flag-off rollback unsafe after new records exist.**

| What could go wrong                                                                                                                                                                                  | Why it matters                                                            | Severity | Likelihood | Evidence or reasoning                                                                                                                                      | Effect on current answer                       | Best permanent fix                                                                                                                                                                     | Exact decision/spec language to add                                                                                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | -------: | ---------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| New code writes source-backed task kinds that old readers let users edit/delete; dual write creates two rows; backfill fabricates current work; rollback removes the only reader while tasks remain. | Historical corruption and hidden active work can survive deploy rollback. | Critical |     Medium | **Current repo:** contribution backend and admin demo route are incompatible. **Reasonable inference:** ordinary feature flags do not undo durable writes. | Requires explicit sequencing and roll-forward. | Additive schema, old-reader safe ignore/read-only behavior, no backfill, shadow compare, pilot, one writer, task-projection kill switch, retain source discovery, roll-forward repair. | **D31-R29:** “Readers and denial guards SHALL precede writers; rollback stops projection only and preserves readable source truth and durable task records.” |

### 21. Testability, traceability, and proof

**Material concern: Yes — “create a task for the recipient” is not falsifiable
without exact grain, end, permission, and cross-artifact terminology.**

| What could go wrong                                                                                                                                                                                                                                                        | Why it matters                                                                                                          | Severity | Likelihood | Evidence or reasoning                                                                                                                        | Effect on current answer                        | Best permanent fix                                                                                                       | Exact decision/spec language to add                                                                                          |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------: | ---------: | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Tests check row insertion or Inngest invocation but not the user-visible source outcome, unauthorized absence, duplicate suppression, races, migration, or accessibility. ADR/OpenSpec/tickets may call the same object notification, task, assignment, issue, and review. | Implementation can pass while leaking, duplicating, or falsely completing work; later phases cannot trace requirements. |     High |       High | **Repository rule:** stable public seams and OpenSpec traceability govern. **User requirement:** all categories and production-shaped proof. | Requires precise acceptance suite and glossary. | Canonical terms, 132 outcome criteria below, positive/negative/auth/race/migration/a11y tests, release evidence mapping. | “Every D31 rule SHALL trace decision→glossary→ADR→OpenSpec→design→ticket→test→release evidence using the D31-AC identifier.” |

### 22. Other development hazards

**Material concern: Yes — generic task semantics can accidentally alter public,
financial, reviewer, or AI behavior outside the named categories.**

| What could go wrong                                                                                                                                                                                                                                                                                     | Why it matters                                                                                               | Severity |       Likelihood | Evidence or reasoning                                                                                                                                        | Effect on current answer                                 | Best permanent fix                                                                                                                                     | Exact decision/spec language to add                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------: | ---------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Task priority or due date could be mistaken for Website schedule; an AI assistant could reassign/complete beyond its user; external reviewer could receive a staff task; bulk actions could end multiple source episodes; “Mobilize reuse” could expose missionary/member-care data in Mission Control. | It crosses publication, identity, role, privacy, and mission-care boundaries and may create real-world harm. | Critical | Medium aggregate | **Platform boundaries:** public/auth, CRM/CMS, AI authority, role scope, and publication are structural. **Earlier D18:** task dates do not schedule a Site. | Adds explicit zero-effects and source-policy boundaries. | Source-specific action matrices, no external task, human-authority parity for AI, bulk source CAS per item, body-free lists, separate dates/retention. | **D31-R8, R14, R21, R23–R25:** “D31 SHALL create no authority, public/Giving/finance effect, reviewer task, schedule, cross-role detail, AI privilege, or bulk completion side channel.” |

## Acceptance criteria

These criteria prove product outcomes, not table or vendor implementation. They
are intentionally sequential and use the canonical `D31-AC` namespace.

### Source occurrence and contract

1. **D31-AC001 — Exact opening transition.** One valid D30
   `changes_requested` result for an exact candidate/review epoch creates or
   reuses exactly one Correction attention episode.
2. **D31-AC002 — Other results excluded.** Approve, decline, expiry,
   cancellation, replacement, revocation, supersession, and delivery state do
   not open a D31 episode.
3. **D31-AC003 — Nominal assignments excluded.** Creating or changing an Active
   Tenant Assignment, Support Assignment, participant membership, role,
   capability, saved reviewer, contact, or candidate owner creates no task
   without a registered actionable source transition.
4. **D31-AC004 — Exact source grain.** Episode identity includes Tenant,
   environment, Site, source, candidate, review epoch, result, and source
   contract version at the required grain.
5. **D31-AC005 — One source owner.** The exact consequence-owning source alone
   determines whether correction work exists, remains actionable, or ends.
6. **D31-AC006 — Complete manifest.** Every admitted source contract declares
   safe title, subject, next-action code, predicates, resolver, capabilities,
   facts, detail, destination, end rule, records class, ceiling, and projection
   policy.
7. **D31-AC007 — Unknown version denied.** Missing, disabled, unknown,
   incompatible, or digest-mismatched source contracts release no recipient
   projection and create an observable safe failure.
8. **D31-AC008 — No prose routing.** Changing only D30 explanation wording,
   language, punctuation, or Unicode normalization never changes action codes or
   recipients.
9. **D31-AC009 — No anchor routing.** Adding, removing, expiring, quarantining,
   or failing to resolve the optional source anchor never independently assigns
   work or grants access.
10. **D31-AC010 — No AI routing.** No LLM, embedding, keyword classifier,
    translation, sentiment, or secret detector may select a recipient, source
    action, priority, queue, or completion.
11. **D31-AC011 — Safe source fallback.** Proved zero, indeterminate routing,
    task outage, and notification outage leave the source **Changes requested**
    state discoverable to independently authorized source staff.
12. **D31-AC012 — Candidate immutability.** Opening or projecting correction
    work never edits the reviewed candidate or D30 result.
13. **D31-AC013 — Public non-effect.** Episode creation changes no Live Website,
    locale route, public URL, search indexing, cache, or publication state.
14. **D31-AC014 — Giving/finance non-effect.** Episode creation changes no
    Giving address, designation, donation, donor task, financial record, money
    movement, or finance report.
15. **D31-AC015 — Fresh successor.** A corrected successor has a new candidate
    identity and requires every currently applicable fresh-review proof.
16. **D31-AC016 — Immutable result history.** Ending, rerouting, projecting, or
    disposing of readable feedback never rewrites the original review result or
    body-free audit.

### Recipient resolution and work assignment

17. **D31-AC017 — Responsibility required.** A person with action capability but
    outside the exact current source-responsibility set receives no assignment.
18. **D31-AC018 — Capability required.** A responsible person without the exact
    current next-action capability receives no actionable assignment.
19. **D31-AC019 — List visibility required.** A recipient must currently be
    authorized for every safe fact shown in their list row.
20. **D31-AC020 — Detail visibility required.** Task assignment alone never
    authorizes the D30 explanation, reviewer identity, anchor, candidate, or
    source detail.
21. **D31-AC021 — Action authorization required.** Opening a permitted detail
    never implies permission to perform every source action.
22. **D31-AC022 — Stable human grain.** Aliases, linked accounts, multiple
    emails, and multiple Active Tenant Assignments for one stable human cannot
    create duplicate recipient work at the same Party+role grain.
23. **D31-AC023 — Role separation.** The same human acting under two materially
    distinct admitted roles has independently authorized projections and no
    shared engagement by accident.
24. **D31-AC024 — Complete release.** A complete bounded routing generation and
    all of its member rows commit before any selected recipient can see work.
25. **D31-AC025 — Proved zero.** A complete zero-recipient result creates no
    personal assignment, notification, generic queue row, or guessed fallback.
26. **D31-AC026 — Indeterminate denied.** Lookup failure, missing head, partial
    membership, permission timeout, ambiguity, or stale data releases nobody.
27. **D31-AC027 — Ceiling enforced.** A result over the source-declared ceiling
    or D19's outer 50-recipient-role bound releases nobody and alerts the owning
    source team.
28. **D31-AC028 — No historical fallback.** Creator, last editor, prior reviewer,
    original initiator, D29 coordinator, all staff, all admins, and Finance
    Operations are never implicit correction recipients.
29. **D31-AC029 — Multiple action union.** One recipient responsible for several
    admitted actions in the same episode sees one personal row containing only
    their permitted action subset.
30. **D31-AC030 — Split action isolation.** Two recipients responsible for
    different action subsets cannot see one another's protected facts or invoke
    one another's actions through task data.
31. **D31-AC031 — Assignment grants nothing.** Direct task URL, assignment ID,
    notification ID, Realtime event, or manager view cannot bypass current
    source authorization.
32. **D31-AC032 — Non-exclusive by default.** A work assignment does not revoke
    an independently authorized source actor's existing action permission or
    become a source lock unless a later source policy explicitly says so.

### Task, notification, and coordination boundaries

33. **D31-AC033 — One source work identity.** Task, notification, source detail,
    outbox, and audit correlate to one stable source work identity without using
    a vendor run ID as product identity.
34. **D31-AC034 — One shared task.** The future Tasks Hub holds at most one
    source-backed task/work record for the episode identity, with recipient
    assignment projections rather than divergent copied tasks.
35. **D31-AC035 — One personal row.** Each exact recipient+role+surface sees at
    most one active task row for the episode and routing generation.
36. **D31-AC036 — Notification remains distinct.** Notification item/group/
    engagement state cannot insert, update, complete, dismiss, or delete the
    shared task or source episode.
37. **D31-AC037 — Task remains subordinate.** Task assignment, read, comment,
    due date, reminder, priority, personal organization, completion attempt, or
    deletion attempt cannot change source actionability.
38. **D31-AC038 — Source-controlled closure.** No list, detail, keyboard
    shortcut, context menu, bulk action, API, direct mutation, AI, import,
    support, or worker path may independently complete a source-backed task;
    only its registered source-action applicability may end it.
39. **D31-AC039 — Dismiss/delete absent.** D31 tasks cannot be dismissed,
    suppressed, archived while actionable, deleted, duplicated, merged, or
    reopened through generic task operations.
40. **D31-AC040 — Invalid generic mutation rejected.** A caller who sends a
    manual-task edit/status/delete command against a source-backed task receives
    a safe denial and changes nothing.
41. **D31-AC041 — No copied body.** Task title, description, notes, comments,
    labels, list facts, links, activity events, and audit contain no D30
    explanation or anchor content.
42. **D31-AC042 — No default date.** D31 creates no target date, start date, due
    date, due time, calendar entry, age-derived due state, or Website schedule.
43. **D31-AC043 — No default channels.** D31 creates no email, SMS, push,
    browser/OS alert, recurring reminder, digest, provider message, or sound.
44. **D31-AC044 — No default urgency.** Correction age, unread age, review age,
    worker delay, and task age cannot escalate priority or urgency.
45. **D31-AC045 — Completion-policy separation.** A due date, reminder,
    comment, personal organization, or Independent follow-up task completion
    remains Tasks Hub truth. It cannot schedule or complete Website work; a
    source action closes only through its authoritative source receipt.
46. **D31-AC046 — Correlated presentation.** After task integration, the staff
    experience presents one active work row/count rather than duplicate task
    and attention rows for the same recipient/source identity.
47. **D31-AC047 — Unread separate from active.** Reading clears only the
    recipient's unread/bell treatment while their active task remains in **My
    tasks** until their final assigned source-action scope ends or authorization
    removes presentation.
48. **D31-AC048 — Cross-domain vocabulary.** Website, Mobilize, contribution,
    and later tasks use the same platform work/task/assignment/engagement terms
    while retaining source-specific action and completion terms.

### Staff UX, mobile, accessibility, and recovery

49. **D31-AC049 — My tasks default.** Tasks Hub opens to a clearly labelled
    current-user active view and never defaults an ordinary recipient to all
    Tenant work.
50. **D31-AC050 — Honest row copy.** The D31 row says **Prepare a corrected
    Website version**, names only permitted Site/locale context, and identifies
    **Website** as the source.
51. **D31-AC051 — Body-free list.** List, badge, search results, previews,
    manager aggregate, browser title, and URL reveal no protected explanation or
    reviewer identity.
52. **D31-AC052 — Source-led CTA.** The primary action uses an imperative source
    label such as **Open Website work**, not an ambiguous **Resolve** or
    **Complete task**.
53. **D31-AC053 — Completion distinction.** Detail says **Completes in
    Website**, explains that the exact source action closes the recipient
    projection automatically, and exposes no generic task completion control.
54. **D31-AC054 — Attribution honesty.** The UI never says the external reviewer
    personally assigned staff; it attributes the work to the Website source and
    shows reviewer identity only when independently authorized.
55. **D31-AC055 — Route-addressable detail.** A permitted detail has a stable
    first-party route, supports browser Back/Forward and deep links, and re-proves
    current authorization on direct entry.
56. **D31-AC056 — Responsive composition.** Wide screens may use a Base Maia
    Drawer preserving list context; small screens use a full-page detail that
    reflows at 320 CSS pixels without horizontal scrolling.
57. **D31-AC057 — List state preserved.** Returning from detail preserves safe
    filter, sort, cursor, scroll, and focus context without persisting protected
    body.
58. **D31-AC058 — Logical focus after source end.** When source action ends and
    makes the task projection inapplicable, focus moves to the next row, prior
    row, or labelled list heading and a programmatic status message announces
    the source outcome without inventing task status.
59. **D31-AC059 — No nested interactive row.** Row navigation and secondary
    controls have valid separate semantics and keyboard targets; no interactive
    element is nested inside another interactive row target.
60. **D31-AC060 — Non-color state.** Unread, active, access-changed, completed,
    failed, and indeterminate states have text/programmatic meaning in addition
    to color or icon.
61. **D31-AC061 — Touch and pointer.** Controls meet WCAG 2.2 AA target spacing
    and a 44 CSS pixel product design target; every drag interaction has a
    single-pointer and keyboard alternative.
62. **D31-AC062 — Zoom/forced colors/motion.** Task list and detail remain usable
    at 400% zoom, forced colors, reduced motion, text spacing overrides, and
    keyboard-only operation without obscured focus.
63. **D31-AC063 — International content.** Original-language feedback renders as
    inert Unicode plain text with preserved line breaks, bidi isolation, and
    `dir="auto"`; interface labels localize independently and no machine output
    masquerades as the reviewer's words.
64. **D31-AC064 — Weak-network truth.** Loading, offline, retryable projection
    error, current authorization denial, stale source, and successful source end
    are distinct; no optimistic task completion or stale body display occurs.

### Database, RLS, authorization, and identity

65. **D31-AC065 — Composite scope integrity.** Every episode, generation,
    member, task, assignment, event, and projection-intent relationship proves
    identical Tenant and environment, plus Site/source scope where applicable.
66. **D31-AC066 — Immutable scope.** No permitted update can change Tenant,
    environment, Site, source, candidate, episode, task kind, recipient Party,
    role, or routing generation.
67. **D31-AC067 — Unique episode.** Database constraints prevent two correction
    episodes for one exact D30 result under concurrent or repeated commands.
68. **D31-AC068 — Unique task.** Database constraints prevent two shared task
    identities for one exact source work identity regardless of transport or
    replay timing.
69. **D31-AC069 — Unique active assignment.** Database constraints prevent two
    active assignment projections for the same task+recipient Party+role+
    surface+routing meaning.
70. **D31-AC070 — Restrictive lifecycle.** Deleting a Site, source, candidate,
    task, account, or profile cannot silently cascade away immutable source/task
    business history outside the approved Tenant deletion/retention contract.
71. **D31-AC071 — Browser writes denied.** `anon` and ordinary `authenticated`
    browser clients cannot insert, update, or delete source episodes, routing,
    projection intents, source-backed tasks, assignments, or audit tables.
72. **D31-AC072 — Server-derived scope.** Tenant, environment, actor, stable
    Party, Active Tenant Assignment, role, recipient, capability, source, and
    audit attribution come from trusted server context, never caller authority.
73. **D31-AC073 — SELECT policy.** List/count/detail queries return only rows the
    current principal may see now and apply source visibility before pagination
    totals or badges are exposed.
74. **D31-AC074 — Mutation `USING`.** Every permitted mutation proves that the
    existing row belongs to the caller's current allowed scope and task policy.
75. **D31-AC075 — Mutation `WITH CHECK`.** Every permitted mutation proves the
    resulting row remains in the same allowed scope and cannot widen recipient,
    source, task kind, or authority.
76. **D31-AC076 — Forced RLS/owner proof.** Table-owner, migration, security-
    definer, and service-role paths cannot rely on ordinary RLS and pass the same
    cross-Tenant/cross-role poison matrix.
77. **D31-AC077 — Hardened RPC.** Any definer/RPC has fixed safe search path,
    least execute grants, trusted auth derivation, expected-head locking, and no
    caller-controlled actor or recipient override.
78. **D31-AC078 — AI parity.** An AI assistant can list, open, or invoke only the
    same D31 operations as its initiating human and carries that human's trusted
    attribution and approval boundary.
79. **D31-AC079 — Support parity.** Support/impersonation tools reveal no task or
    feedback without a separately authorized, audited purpose and never mutate
    source or task truth through a hidden bypass.
80. **D31-AC080 — Cache/Realtime parity.** Cache keys include Tenant, principal,
    role, task/source policy and authorization revision; Realtime sends safe
    invalidation only and requires an authorized refetch.

### Lifecycle, concurrency, and durable idempotency

81. **D31-AC081 — Atomic source intent.** The authoritative D30 command commits
    result, episode, source head, and durable projection intent atomically or
    commits none of them.
82. **D31-AC082 — Eventual task tolerance.** A task/notification projection
    outage never rolls back, changes, or hides the source result from authorized
    source discovery.
83. **D31-AC083 — Same-meaning retry.** Retrying an episode, routing, task, or
    assignment command with the same semantic key and canonical meaning returns
    the existing identity/receipt without a second effect.
84. **D31-AC084 — Changed-meaning conflict.** Reusing a semantic key with changed
    Tenant, source, candidate, recipient set, action set, policy, or body-free
    facts hard-conflicts and alerts rather than overwriting.
85. **D31-AC085 — Lost response.** If a task/assignment write commits and its
    response is lost, the retry returns the same task and assignment identities.
86. **D31-AC086 — One source winner.** Concurrent corrected-successor commands
    use expected heads so exactly one admitted source transition wins and losers
    receive current truthful state.
87. **D31-AC087 — End-before-create.** A delayed create/projection event arriving
    after source end creates no active or unread presentation.
88. **D31-AC088 — Create/end race.** A create racing source end cannot expose an
    active task after the source's terminal head commits.
89. **D31-AC089 — Partial action end.** When one registered action ends and
    others remain, only applicable assignment/action projections end; remaining
    recipients retain one accurate active row.
90. **D31-AC090 — Full episode end.** When no registered correction action
    remains, every projection reconciles as source-inapplicable under D32
    source-controlled closure and body-free terminal history records one source
    end.
91. **D31-AC091 — Permission loss.** Current permission/capability/assignment/
    Site-visibility loss removes list, detail, action, search, badge, recent,
    export, and cached protected presentation immediately.
92. **D31-AC092 — Later access no revival.** Later access gain does not revive an
    old assignment or inherit unread/read; only an admitted successor routing
    generation can create current work.
93. **D31-AC093 — Route successor.** Current responsibility change appends one
    successor generation; continuing recipients keep engagement, removed
    recipients end, and new recipients begin with independent unread state.
94. **D31-AC094 — Repeated episode.** A later `changes_requested` result after a
    corrected successor uses a new episode identity and cannot reopen or merge
    the earlier completed task.
95. **D31-AC095 — Time independence.** Clocks, age, timezone, scheduled worker,
    retry time, due date, and unread duration never decide source actionability
    or completion.
96. **D31-AC096 — Reconciliation convergence.** Repeated reconciliation from any
    stale/partial projection converges to the one current source-derived task
    state without rewriting immutable source or routing history.

### Privacy, integration, and Inngest

97. **D31-AC097 — Identifier-only intent.** Outbox, dispatch ledger, and optional
    Inngest event carry only strict versioned identifiers and safe routing codes;
    unknown fields and body/secret-like context keys reject safely.
98. **D31-AC098 — No protected provider history.** D30 explanation, anchor
    content, reviewer email, CMS body, missionary/member-care facts, donor data,
    payment details, secrets, attachments, and broad records never enter Inngest
    event/run history.
99. **D31-AC099 — Worker reload.** Every worker reloads and claims current source
    and task state from Core before each durable side effect; event payload state
    is never trusted as current authority.
100.  **D31-AC100 — Product idempotency beyond 24 hours.** Replaying the same
      projection after Inngest's documented 24-hour dedupe window still produces
      one durable task effect.
101.  **D31-AC101 — Provider concurrency is not a lock.** Inngest concurrency
      configuration may protect resources/fairness but cannot replace DB
      uniqueness or source CAS.
102.  **D31-AC102 — Retry-safe steps.** Every retried step is independently
      idempotent; a step that committed before timeout cannot duplicate the task,
      assignment, notification, or audit.
103.  **D31-AC103 — Cancellation-safe work.** Function cancellation between
      steps, dashboard cancellation, deploy interruption, and later replay cannot
      leave source/task truth in an invalid or unrecoverable state.
104.  **D31-AC104 — Final failure visible.** Exhausted retries create a body-free
      failed/dead-letter state with owner, correlation, next response, and source
      discoverability; they do not mark work complete.
105.  **D31-AC105 — Vendor outage.** Inngest unavailability leaves durable source
      intent pending and allows bounded recovery or an alternate executor without
      reauthoring the source/task model.
106.  **D31-AC106 — Provider replacement.** Removing or replacing Inngest changes
      no product identity, source lifecycle, recipient resolution, authorization,
      task status, or durable audit meaning.
107.  **D31-AC107 — No long human wait function.** D31 does not keep one Inngest
      run sleeping/waiting for human completion; source transitions and projection
      events remain independent durable occurrences.
108.  **D31-AC108 — Separate fan-out outcomes.** Task and notification projection
      can retry/fail independently; one channel's success or engagement cannot
      certify the other's success or source completion.

### Performance, migration, rollout, and operations

109. **D31-AC109 — Bounded production shapes.** Tests cover zero, one, two, and
     50 recipient-role projections, one person with several actions, many Sites,
     many tenants, and the smallest source-declared ceiling.
110. **D31-AC110 — Cursor pagination.** Active/completed lists use deterministic
     cursor pagination and stable tie-breakers; no unbounded Tenant fetch or
     client-only security filter is allowed.
111. **D31-AC111 — Indexed safe query.** Production query plans use explicit
     Tenant+recipient+active/source indexes and do not scan protected JSON or
     explanation text for list, count, sort, or search.
112. **D31-AC112 — Batched authorization.** A page of tasks uses a bounded typed
     projection/reproof path rather than one independent source RPC per row,
     without weakening source-specific authorization.
113. **D31-AC113 — Tenant fairness.** Worker concurrency and scan ordering prevent
     one large Tenant or noisy source from starving other tenants; fairness is
     not used to serialize business correctness.
114. **D31-AC114 — Body lazy-load.** Protected explanation/detail loads only on
     authorized detail demand and is absent from prefetched lists, service
     workers, offline caches, and background analytics.
115. **D31-AC115 — Additive compatibility.** New task kind/policy/version can be
     deployed with old code/schema combinations that safely ignore or render it
     read-only; no old client can mutate it as a manual task.
116. **D31-AC116 — No inferred backfill.** Historical review comments,
     notifications, candidates, task rows, audit timestamps, and task statuses
     create no D31 episode/task by inference.
117. **D31-AC117 — Shadow before release.** Shadow projection compares expected
     source work, recipient sets, task identities, authorization, and end state
     without showing users or copying protected feedback.
118. **D31-AC118 — One writer.** Activation enables exactly one source/adapter
     writer per contract version and never dual-writes admin demo, missionary,
     contribution, and new shared task authorities.
119. **D31-AC119 — Safe kill switch.** A source/adapter kill switch stops new
     task/notification release and keeps source discovery/current truth; it does
     not delete durable rows or reverse D30 results.
120. **D31-AC120 — Roll-forward repair.** After durable task writes, rollback
     preserves readable compatible records and uses source-derived roll-forward
     reconciliation; it never resets or destructively deletes shared task data.

### Audit, testing, accessibility proof, and zero effects

121. **D31-AC121 — Business audit.** Durable body-free audit identifies source
     episode, result, action codes, routing generation/outcome, recipient Party/
     role, task/projection identities, source end, actor/system attribution, and
     correlation without private body.
122. **D31-AC122 — Security audit.** Protected detail reads/denials, privileged
     actions, quarantine/disposal, support access, assignment changes, and policy
     failures have purpose-appropriate body-free security evidence.
123. **D31-AC123 — Technical telemetry.** Dispatch, projection, latency, retry,
     dead-letter, reconciliation, cache, and authorization telemetry uses bounded
     codes and cannot become a business or completion record.
124. **D31-AC124 — Positive journey proof.** End-to-end tests prove D30 result →
     exact recipients → one personal row → authorized Page source action → only
     Maria's applicable assignment closes while Joel remains → final source end
     → fresh review requirement.
125. **D31-AC125 — Negative journey proof.** Tests prove unrelated staff,
     external reviewer, donor, missionary, public visitor, wrong Site, wrong
     Tenant, wrong role, and capability-only users receive no row/detail/action.
126. **D31-AC126 — Authorization poison matrix.** Browser, direct API/RPC,
     service role, security definer, support, AI, Realtime, cache, worker,
     reconciliation, search, and export paths all reject cross-scope cases.
127. **D31-AC127 — Race/idempotency proof.** Tests deterministically exercise
     duplicate delivery, lost response, same-key conflict, create/end,
     action/action, route/read, permission/detail, retry, cancellation, replay,
     and out-of-order races.
128. **D31-AC128 — Migration proof.** Tests cover new-reader/old-schema,
     old-reader/new-schema, writer fences, shadow mismatches, pilot kill switch,
     rollback after writes, and roll-forward reconciliation.
129. **D31-AC129 — Accessibility proof.** Automated checks plus manual keyboard,
     screen-reader, focus, zoom, forced-colors, target-size, motion, RTL/CJK,
     touch, and 320-pixel tests pass on list, detail, end, denial, error, and empty
     states.
130. **D31-AC130 — Usability proof.** Representative staff can explain who owns
     the task, what must be done, whether Website/Giving changed, how the task
     completes, and the difference between unread and active without coaching.
131. **D31-AC131 — Traceability proof.** D31 terms, rules, numbers, states, roles,
     and criteria match decision log, glossary, ADR, OpenSpec delta, design,
     implementation tickets, tests, and release evidence with no contradiction.
132. **D31-AC132 — Absolute zero effects.** Every D31 path creates zero new
     permission, external reviewer authority, public/CMS publication, Giving or
     financial effect, message channel, date/reminder, AI authority, and source
     completion except the exact separately authorized source action.

## Named monitors and mandatory responses

Monitoring supplements constraints and release tests; it never substitutes for
them. Thresholds are initial product judgments and must be versioned when real
pilot evidence justifies change.

| Signal                                             | Threshold                                                                                                            | Owner                                       | Mandatory response                                                                                                                                 |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `source_work_cross_tenant_exposure_total`          | Any event (`>0`)                                                                                                     | Security Incident Commander + Data Platform | Disable affected list/detail/worker path, contain access, preserve body-free evidence, perform Tenant-wide impact review, repair before re-enable. |
| `source_work_unauthorized_detail_total`            | Any confirmed detail/body exposure                                                                                   | Security + Website source owner             | Revoke/fence adapter and caches, quarantine leaked copies, investigate every privileged path, notify under incident policy.                        |
| `source_work_protected_body_propagation_total`     | Any body/anchor content in task, notification, event, telemetry, search, AI, export, or cache                        | Privacy/Security + owning sink team         | Stop sink, purge/quarantine governed copies, rotate unsafe derived artifacts where applicable, negative-test all propagation seams.                |
| `source_work_duplicate_episode_total`              | Any duplicate semantic episode                                                                                       | Website source + Database                   | Fence writer, select authoritative identity through source evidence, link/contain duplicate without deleting audit, fix uniqueness/idempotency.    |
| `source_work_duplicate_task_total`                 | Any task count >1 per source work identity                                                                           | Tasks Platform                              | Disable adapter writer, preserve one authoritative projection, reconcile assignments/history, add regression fixture.                              |
| `source_work_orphan_assignment_total`              | Any assignment without valid same-scope task+routing member                                                          | Tasks Platform + Database                   | Block reads/writes, repair by source-derived reconciliation, fix FK/transaction before rollout continues.                                          |
| `source_work_routing_partial_release_total`        | Any visible member from incomplete/ambiguous/overflow generation                                                     | Website Security                            | Immediate cohort kill switch, remove all affected presentation, inspect every recipient, fix all-before-any transaction.                           |
| `source_work_recipient_overflow_total`             | Any resolver result above source ceiling or 50                                                                       | Website Product + Authorization             | Release none, inspect responsibility configuration/contract, lower noise or explicitly version justified ceiling; never truncate recipients.       |
| `source_work_zero_recipient_age_seconds`           | Any actionable proved-zero episode >24 hours during pilot                                                            | Tenant Website owner + Product Operations   | Inspect source discoverability/responsibility UX; use separately authorized recovery, not guessed fallback or reminder.                            |
| `source_work_indeterminate_age_seconds`            | Any indeterminate routing >300 seconds                                                                               | Website Platform on-call                    | Keep release closed, repair dependency/heads, rerun resolver, document root cause; escalate at 30 minutes.                                         |
| `source_work_projection_lag_seconds`               | p95 >60 seconds for 15 minutes or any actionable intent >300 seconds                                                 | Tasks/Workflow Operations                   | Inspect ledger/worker/DB saturation, recover idempotently, keep source discovery truthful, pause cohort on sustained breach.                       |
| `source_work_dead_letter_age_seconds`              | Any dead letter unowned for 15 minutes or unresolved for 60 minutes                                                  | Workflow Operations + source adapter owner  | Assign incident, replay only after current-state proof, deploy fix/alternate executor, reconcile impacted source identities.                       |
| `source_work_source_task_divergence_total`         | Any active task after source inapplicable >300 seconds, or missing task for released intent >300 seconds             | Tasks Platform                              | Fence incorrect reader/writer, run source-derived reconciliation, inspect out-of-order/version handling.                                           |
| `source_work_false_source_completion_total`        | Any source change attributable only to task/notification/provider state                                              | Website Security + Product                  | Critical stop-ship/incident; disable mutation path, restore source from authoritative history through roll-forward, audit all affected candidates. |
| `source_work_permission_revocation_lag_seconds`    | Any protected presentation available >60 seconds after authoritative denial                                          | Authorization + Security                    | Purge caches/sessions, disable stale projection, investigate invalidation/reproof, do not restore until poison tests pass.                         |
| `source_work_old_assignment_revival_total`         | Any old assignment shown after access gain without successor generation                                              | Tasks Platform + Authorization              | Remove projection, repair generation query, inspect inherited engagement and all similar identities.                                               |
| `source_work_unread_active_count_divergence_ratio` | >0.1% sampled rows or any cross-user engagement mutation                                                             | Notifications + Tasks Platform              | Rebuild recipient projection, correct badge/active query, inspect correlation without merging authorities.                                         |
| `tasks_hub_active_list_latency_ms`                 | p95 >500 ms for 15 minutes at production-shaped load                                                                 | Tasks Platform + Database                   | Inspect plans/indexes/N+1 authorization, cap page safely, tune batch projection; never bypass permission checks.                                   |
| `tasks_hub_protected_detail_latency_ms`            | p95 >1,000 ms for 15 minutes excluding known client network                                                          | Website API + Tasks Platform                | Inspect source batch/detail path and cache safety; optimize without prefetching/storing body broadly.                                              |
| `source_work_tenant_fairness_oldest_lag_ratio`     | Largest-Tenant oldest lag >3× median for 15 minutes                                                                  | Workflow Operations                         | Apply/repair tenant-keyed fair concurrency and scan ordering; do not drop events or weaken idempotency.                                            |
| `source_work_inngest_duplicate_effect_total`       | Any duplicate durable effect across retry/replay or >24-hour redelivery                                              | Workflow Platform + Tasks Platform          | Treat as product-idempotency defect, fence function, repair uniqueness/claim, reconcile all same-key records.                                      |
| `source_work_unsafe_event_rejection_total`         | Any attempted event containing body/secret-like key                                                                  | Security + source adapter owner             | Reject non-retriably, inspect producer and logs for exposure, remove payload field, add fixture before re-enable.                                  |
| `tasks_hub_mobile_action_success_ratio`            | <90% in moderated production-shaped task attempts or >5 percentage-point gap vs desktop                              | Product UX + Accessibility                  | Block expansion, study exact failure, repair responsive/focus/network composition, repeat representative test.                                     |
| `tasks_hub_accessibility_serious_total`            | Any unresolved critical/serious defect before cohort Live                                                            | Accessibility owner + Tasks Platform        | Block activation/expansion, fix shared component or composition, rerun manual and automated proof.                                                 |
| `source_work_staff_comprehension_ratio`            | <90% of representative participants correctly distinguish unread, task state, source state, and public/Giving effect | Product Research + Website Product          | Revise copy/composition/policy, repeat study; do not add reminders or training as the primary fix.                                                 |
| `source_work_task_volume_per_recipient_7d`         | Pilot p95 exceeds approved baseline by 2× or >10% tasks opened and immediately abandoned as irrelevant               | Product Operations + source owners          | Audit contracts/routing, suppress invalid sources via kill switch, narrow action predicates/recipients; never mass-dismiss silently.               |

## Ruthless synthesis

### Must be resolved before D31 is recorded

1. Define **assignment** as a recipient projection of a current actionable
   source occurrence—not an Active Tenant Assignment, Support Assignment,
   capability, membership, author, or generic ownership field.
2. Require finite source action contracts and prohibit prose/anchor/AI routing.
3. Require responsibility **and** current capability/visibility, complete bounded
   generations, proved-zero behavior, and no guessed fallback.
4. Define one source work identity, one eventual shared task identity, and
   recipient-specific assignment/engagement projections.
5. Preserve ADR-0027 and ADR-0054 ownership: notification and task remain
   projections; task state never clears source truth.
6. Apply D32 source-controlled closure at exact assigned source-action scope;
   preserve task-owned completion only for separately defined human follow-up.
7. Record Tasks Hub readiness across Website/CMS, Mobilize, and later domains
   without claiming every named assignment creates work.
8. Keep Inngest optional and subordinate to a durable Core outbox/ledger,
   product idempotency, and current-state reproof.

### Requirements for the later PRD/OpenSpec/design

1. Canonical Source work contract/version registry and per-source admission.
2. Exact Website correction action codes, responsibility resolvers, action/
   visibility capabilities, safe facts, destinations, end rules, records class,
   and recipient ceiling.
3. Shared Tasks Hub manual/independent-follow-up/source-backed policy model, task identity,
   recipient assignment, personal engagement, search/list, manager view,
   history, and D32 completion-authority contract.
4. Phase 17 correlation without task/notification collapse or duplicate active
   rows/counts.
5. Conceptual schema constraints, mutation commands, RLS/grants, privileged
   parity, retention/deletion, body-free audit, and current-state read paths.
6. Durable outbox/dispatch/reconciliation contract and an evidence-based Inngest
   versus smaller worker decision.
7. Full Base Maia list/detail/source UX, copy, internationalization,
   accessibility, mobile, low-bandwidth, failure, and permission-loss states.
8. Mobilize and every later source must separately prove its actionable
   predicate, privacy, task grain, recipient resolver, and source end; D31 does
   not invent those workflows.

### Mandatory implementation safeguards

1. One `packages/api` owner for shared task commands/queries and one owner per
   source adapter; thin routes and no direct protected browser writes.
2. Semantic database uniqueness and expected-head CAS, not timestamps,
   provider IDs, or 24-hour event dedupe.
3. Same-scope composite integrity, immutable discriminants/scope, restrictive
   deletion, least grants, operation-correct RLS, hardened RPC, and poison tests.
4. Identifier-only outbox/events; protected detail lazy-loaded from source;
   body-free lists, telemetry, search, exports, notification, AI, and task data.
5. All-before-any routing release, current authorization on every seam, safe
   zero/indeterminate states, and immutable successor generations.
6. Additive readers/denials before one writer, shadow comparison, cohort kill
   switch, source discovery fallback, and roll-forward after durable writes.
7. Generic task complete/reopen/dismiss/delete/bulk semantics must reject D31
   source-backed tasks; only exact source-action receipts close them, and no
   task-owned state can clear source truth.

### Implementation order and dependencies

1. Ratify D31 terms plus the D32 source-controlled closure, ADR, and glossary.
2. Define exact Phase 12 Website action/detail/list/management capabilities and
   source responsibility contracts.
3. Reconcile current contribution task backend, admin `/tasks`, missionary task
   surface, Phase 17 notification direction, and Tasks Hub target architecture.
4. Land additive task/source-work identity, constraints, APIs, protected detail,
   authorization, audit, and old-reader denial behavior.
5. Land durable projection ledger and choose the smallest executor satisfying
   the contract; if Inngest wins, reuse Core's existing envelope/ledger/claim
   pattern.
6. Build shared Base Maia Tasks Hub and source surfaces; prove **Completes in
   Website**, absent generic controls, action-grained closure, and distinct
   Independent follow-up task behavior without source ambiguity.
7. Shadow Website episodes/recipients/tasks and permission outcomes, then pilot
   one source/Tenant cohort with kill switch and named monitors.
8. Expand only after security, divergence, projection, accessibility, mobile,
   comprehension, and task-volume gates pass. Admit Mobilize only through its
   own source decision and adapter proof.

### Risks eligible only for monitoring

- Whether source-owned correction attention materially improves discovery over
  source-only filters: use comprehension, action-success, volume, and
  zero-recipient signals; remove invalid projections rather than invent email.
- Whether the outer 50-recipient bound is ever approached: use overflow and
  volume signals; narrow source responsibility rather than truncate silently.
- Whether Inngest is operationally superior to a smaller outbox worker: compare
  projection lag, dead letters, duplicate effects, operator time, portability,
  and cost under the same contract.
- Whether source/task terminology remains clear after D32: use representative
  comprehension; improve one coherent composition rather than documentation or
  staff training as the primary repair.

## Exact final corrected decision

**Disposition: Accept with required amendments.** Record:

> A terminal D30 `changes_requested` result opens one exact source-owned,
> state-driven Correction attention episode. A finite versioned source contract
> declares typed next actions, responsibility/capability/visibility predicates,
> safe facts, protected detail, destination, end, retention, recipient ceiling,
> and projection policy. Routing never parses reviewer prose or its optional
> anchor and never uses AI, historical authorship, capability alone, or a
> generic queue. One complete bounded generation selects only currently
> responsible **and** authorized people; proved zero guesses nobody and
> indeterminate/partial/overflow releases nobody. Each selected recipient gets
> one deduplicated personal actionable presentation for the episode and only
> their permitted action subset. Read/unread is personal presentation;
> assignment grants no access.
>
> The Website source alone owns correction existence, actionability, source
> completion, and successor truth. Task, notification, worker, Inngest, timer,
> or engagement state cannot clear or mutate source work. Source end always
> makes the projection inapplicable. Under D32, each recipient's source-backed
> projection closes only when their final assigned source-action scope ends;
> generic task completion is unavailable and unrelated scopes may remain
> active. An independently lifecycle-owned human follow-up is a separate task
> contract whose completion never clears or hides source work.
>
> D31 builds toward one cross-domain Tasks Hub by defining a provider-neutral
> Source work projection contract: one source work identity, one shared task
> identity, recipient-specific work assignments/engagement, protected
> reference-not-copy detail, and source-specific action/end policies. Website,
> Mobilize, contribution operations, and later producers reuse the platform
> envelope and task vocabulary only after each registers its own actionable
> source contract. Nominal roles, memberships, Active Tenant Assignments,
> Support Assignments, and capabilities do not automatically create tasks.
>
> Source result/episode/projection intent commit atomically; task and
> notification projections are eventual, replayable, independently authorized,
> and durably idempotent. Inngest may be selected only as a short asynchronous
> projection/reconciliation executor behind Core's product outbox/ledger,
> current-state claim, database uniqueness, and source CAS. It carries
> identifiers only and owns no recipient, authorization, task, source, or
> completion fact. D31 creates no copied feedback, date, reminder, recurrence,
> channel, priority escalation, public/Giving/finance effect, or new authority.

## ADR and glossary disposition

### ADRs

- **Create ADR-0183** because the founder has now ratified the cross-domain
  architectural seam: registered source-owned human work projects into one
  shared Tasks Hub without transferring source authority. It records the
  provider-neutral projection contract, one source/shared-task identity,
  recipient-specific assignment and engagement, reference-not-copy detail,
  current authorization, durable idempotency, optional Inngest execution, and
  D32 source-controlled closure.
- **Amend ADR-0181** because it owns the exact external-review result and
  successor boundary. Add D31's source-owned correction episode, finite source
  action/routing contract, protected reference-not-copy detail, and source-end
  authority, with ADR-0183 as the shared-task boundary.
- **Do not change ADR-0027's notification ownership.** Add only a related-
  decision cross-link: task and notification are separate projections over the
  same source work identity.
- **Preserve ADR-0054's cause-owned/shared-follow-up invariant.** ADR-0183 now
  generalizes that ownership pattern without pretending the accounting-specific
  ADR owns Website or Mobilize tasks.
- **Do not amend ADR-0182.** D31 correction attention is not the review lane or
  D28/D29 reassignment.

Exact ADR-0181 amendment language:

> A `changes_requested` result opens one source-owned correction-attention
> episode. The source registers typed next-action, responsibility, current
> authorization, safe projection, destination, and end rules; it never derives
> routing from reviewer prose or anchor content. Task and notification
> presentations are subordinate recipient projections. Assignment grants no
> access, task state cannot clear source work, and source end makes projections
> inapplicable. Protected feedback remains source-referenced and body-free in
> all projection, event, search, telemetry, and generic export seams.

### Glossary

Add:

> **Correction attention episode** (Phase 24 D31): The exact source-owned,
> state-driven occurrence opened by one `changes_requested` result while one or
> more registered correction actions remain required. It owns source work
> identity and end meaning, not permission, notification engagement, or task
> coordination state.
>
> _Avoid_: rejection task; reviewer-assigned task; correction comment; open
> notification; CMS workflow job; Inngest run.

> **Source work projection contract** (Phase 24 D31): A finite, versioned
> platform envelope through which a consequence-owning source projects an exact
> actionable occurrence into shared Tasks Hub and attention surfaces. It names
> typed action, recipient, visibility, detail, destination, end, retention, and
> idempotency semantics while leaving business truth with the source.
>
> _Avoid_: generic assignment event; universal workflow; task trigger DSL;
> copied source snapshot; provider payload.

> **Source-backed task** (Phase 24 D31): One shared staff-work projection that
> references an exact source work identity and may have recipient-specific
> assignment/engagement projections. It grants no source access and no task
> state can clear source truth. D32 requires its personal projection to close
> only from the final assigned source-action scope, not an independent task
> completion.
>
> _Avoid_: source record; duplicate personal task; approval result; completion
> authority; notification; source lock.

## Subsequent D32 resolution

D32 accepts Option 1 with one precision amendment: source-backed closure is
controlled at each exact assigned source-action scope, not blindly at the
whole correction episode. Maria's Page projection closes when Website proves
her final Page action ended while Joel's Navigation work and the shared episode
may remain active. The task exposes **Open Website work**, explains **Completes
in Website**, and has no generic completion/reopen/dismiss/delete/bulk path.

The separately completed work supported by ADR-0054 is classified as an
**Independent follow-up task**, not an independently completable copy of the
same source action. It may record **Done with my task** while the linked source
remains open, but cannot clear or hide source truth. Completion authority is a
closed code-owned contract, never a Tenant toggle or mutable task field.

The complete D32 decision, 22-category adversarial review, 126 acceptance
criteria, and named monitors are in
[phase-24-d32-source-backed-task-completion-adversarial-review.md](./phase-24-d32-source-backed-task-completion-adversarial-review.md).
The primary evidence and 130 research outcomes are in
[phase-24-d32-source-backed-task-completion-primary-research.md](./phase-24-d32-source-backed-task-completion-primary-research.md).

## Evidence index

### Core repository authority and current evidence

- [Platform principles](../../../openspec/specs/platform-principles/spec.md)
- [Platform boundaries](../../../openspec/specs/platform-boundaries/spec.md)
- [ADR-0025 — producer-owned protected actions](../../adr/0025-producer-owned-protected-actions.md)
- [ADR-0027 — one notification presentation and engagement model](../../adr/0027-one-notification-presentation-and-engagement-model.md)
- [ADR-0029 — reference-not-copy CMS↔operational](../../adr/0029-reference-not-copy-cms-operational.md)
- [ADR-0054 — cause-owned accounting exceptions with shared follow-up](../../adr/0054-cause-owned-accounting-exceptions-with-shared-follow-up.md)
- [ADR-0181 — candidate-scoped external review](../../adr/0181-source-authorized-candidate-scoped-external-review.md)
- [ADR-0182 — one current review lane](../../adr/0182-one-current-candidate-review-responsibility-lane.md)
- [ADR-0183 — source-owned work projects into one shared Tasks Hub](../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)
- [D19 — state-driven attention](./phase-24-d19-state-driven-plan-attention-adversarial-review.md)
- [D20 — review-required episodes](./phase-24-d20-every-review-required-episode-adversarial-review.md)
- [D30 — request-changes explanation](./phase-24-d30-required-request-changes-explanation-adversarial-review.md)
- [Shared Mission Control Tasks PRD](../mission-control-contribution-operations/03-shared-tasks-needs-attention.md)
- [`mission_control_tasks` migration](../../../supabase/migrations/20260526193000_mission_control_tasks.sql)
- [Current task service](../../../packages/api/src/admin/mission-control-tasks/service.ts)
- [Current admin Tasks surface](<../../../apps/admin/app/(app)/tasks/tasks-content.tsx>)
- [Current workflow dispatch adapter](../../../packages/api/src/workflows/dispatch.ts)
- [Current durable workflow ledger](../../../packages/api/src/workflows/ledger.ts)
- [Current identifier-only workflow envelope](../../../packages/api/src/workflows/events.ts)
- [Shared Base Maia contract](../../../packages/ui/AGENTS.md)
- [Frontend rules](../../ai/rules/frontend.md)

### Current primary external evidence

- [Asana — Understanding tasks](https://help.asana.com/s/article/understanding-tasks)
- [Asana — Multi-home tasks](https://help.asana.com/s/article/multi-home-tasks-to-avoid-information-silos)
- [Microsoft Planner — Assign people to tasks](https://support.microsoft.com/en-US/Planner/assign-people-to-tasks)
- [Microsoft Graph — Planner resource versioning](https://learn.microsoft.com/en-us/graph/api/resources/planner-overview?view=graph-rest-1.0)
- [Atlassian — Work-item permissions](https://support.atlassian.com/jira-cloud-administration/docs/work-item-permissions/)
- [Salesforce — Task assignment and related-record access](https://help.salesforce.com/s/articleView?id=Can-I-assign-tasks-or-events-to-other-users&language=en_US&type=1)
- [HubSpot — Create tasks](https://knowledge.hubspot.com/tasks/create-tasks)
- [HubSpot — Task views](https://knowledge.hubspot.com/tasks/filter-tasks-and-manage-task-views)
- [HubSpot — Task queues](https://knowledge.hubspot.com/tasks/use-task-queues)
- [Blackbaud CRM — Event tasks](https://webfiles-sc1.blackbaud.com/files/support/guides/enterprise/400/events.pdf)
- [Inngest — Idempotency](https://www.inngest.com/docs/guides/handling-idempotency)
- [Inngest — Errors and retries](https://www.inngest.com/docs/guides/error-handling)
- [Inngest — Concurrency](https://www.inngest.com/docs/functions/concurrency)
- [Inngest — Cancellation](https://www.inngest.com/docs/features/inngest-functions/cancellation)
- [Inngest — Events and 24-hour deduplication](https://www.inngest.com/docs/events)
- [PostgreSQL — Row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [PostgreSQL — `CREATE POLICY`](https://www.postgresql.org/docs/current/sql-createpolicy.html)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [WAI — Focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)

### Evidence limits

- Comparable products prove that assigned work, My Tasks, related-record links,
  shared queues, and workflow-created tasks are established patterns. They do
  not prove Core's source-owned completion boundary or recipient cardinality.
- No primary evidence proves that ministries want every Mobilize assignment to
  create a task. D31 reserves the adapter seam and explicitly requires future
  source evidence.
- No primary evidence proves Inngest is required. Its fit must be demonstrated
  against Core's existing product ledger and a smaller executor under
  production-shaped load/failure tests.
- The 50 outer recipient ceiling and initial latency/comprehension thresholds
  are inherited repository/product judgments, not industry constants. They are
  monitored and versioned, never silently changed.

## Subsequent D35 resolution

D35 applies D31's shared-task boundary to ownerless correction recovery: one
permission-filtered Website **Needs assignment lane** is always available, and
an optional Tenant-only one-to-three-person recovery route may add personal
coordinator assignments to one shared source-backed task identity. The lane is
not a task/queue and personal projection is not source truth. Reading is
personal engagement; only the current expected-head Website assignment/end
receipt ends the exact recovery scopes. D35 adds no Site override, generic task
mutation, default channel, or Mobilize roster. See the [D35 adversarial record](./phase-24-d35-shared-lane-optional-recovery-coordinators-adversarial-review.md).
