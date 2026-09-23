# Phase 24 D35 — shared recovery lane with optional coordinators primary research

**Status:** Primary research for the open D35 founder decision; not an
implementation claim, accepted OpenSpec capability, migration, or Live
behavior

**Recommended answer:** Option 1 — one source-owned shared lane plus optional
one-to-three bounded personal recovery coordinators, with no claim/lease state

**Research date:** 2026-08-29

> **Final D35 reconciliation:** This research evaluated a Site-override
> variant. The accepted D35 boundary is narrower: one Tenant policy only, with
> code-owned `source_lane_only@1` or `named_coordinators` containing one to
> three people. D35 adds no Site override or inheritance setting; current exact
> Site/source authorization narrows the Tenant route for each occurrence. Any
> earlier Site-route language in this evidence artifact is superseded by this
> reconciliation and the D35 adversarial record.

## Research question

When an exact Website Source-action scope remains required but has no current
responsible recipient, who should be expected to notice and assign it?

D33 and D34 already define how work enters source-owned **Needs assignment**
and what bounded Return recovery context may accompany that transition. D35
must now balance four legitimate needs:

- zero mandatory setup for small or new Tenants;
- one reliable, permission-safe place where authorized staff can find all
  ownerless Website work;
- optional personal accountability when a Tenant deliberately wants it; and
- no broadcast, guessed assignee, duplicate queue truth, hidden claim, or
  coordinator role that silently grants Website access.

## Evidence labels

- **Repository fact** — directly verified in current Core source, OpenSpec,
  accepted ADRs, glossary, or Phase 24 decision artifacts.
- **Verified external fact** — directly supported by a linked current official
  product, technical, standards, security, database, workflow, or accessibility
  source.
- **Reasonable inference** — a conclusion from several verified facts; not an
  external product guarantee.
- **Product judgment** — the recommended Core choice after applying governing
  repository priorities and comparing alternatives.
- **Assumption** — plausible but not established; implementation may not treat
  it as fact.
- **Unresolved unknown** — requires representative ministry research,
  production evidence, or another founder decision.

## Executive finding

**Choose Option 1 with a strict two-layer model.**

1. Website always owns one **Website work-recovery lane** containing every
   currently actionable **Needs assignment** occurrence the viewer is currently
   authorized to recover. The lane is a source-owned query/read model, not a
   queue assignment, task status, permission group, recipient list, or new
   business record.
2. A Tenant may optionally configure one to three **Work-recovery
   coordinators** for the distinct responsibility purpose **Assign returned
   Website work**. Only the complete current intersection of that route with
   exact source visibility and assignment-command authorization receives one
   shared source-backed task/attention projection with recipient-specific
   engagement.

The shared lane is complete without configuration. A new Tenant starts in
**Shared lane only**, not **Not configured**, **Needs setup**, or a degraded
state. Adding coordinators enhances discovery; it never makes the lane or
source work depend on them.

One configured person is the recommended ordinary setup. Two or three are
available only when responsibility is genuinely shared. Members are distinct,
unordered and co-equal; there is no primary, backup, rank, round robin, quorum,
claim, lease, SLA, presence, capacity, leave or escalation meaning.

Do not add a separate **Claim** or **I'm handling this** state. D35's human
action is short and authoritative: inspect current source context and assign
the underlying work through D33's source-validated command. The first successful
expected-head assignment wins and immediately ends the Needs-assignment
occurrence and every personal recovery projection. A coordinator may assign
the work to themselves only if the source independently proves them eligible
for the underlying action; that is real source assignment, not lane claiming.

### Exact recommended scope and configuration

- Tenant default: `source_lane_only` with no member rows and no setup burden.
- Optional Tenant mode: `named_coordinators` with one-to-three stable same-Tenant
  Party members.
- D35 has no Site policy or override. Current exact Site/source authorization
  narrows the Tenant coordinator set independently for each occurrence; zero,
  partial, or indeterminate qualification never broadens recipients.
- D29 Review coordinators remain a different route purpose and roster. The same
  person may be selected for both only through two deliberate saves; no copy,
  suggestion, alias, synchronization, or fallback exists.
- No email, push, SMS, recurring reminder, due date or timer is sent by default.
  A newly admitted personal recipient gets one in-product unread occurrence;
  reading clears only their engagement.

## Why this is current modern best practice

### Current first-party product evidence

| Official source                                                                                                                                                                                | Verified fact                                                                                                                                                       | Useful precedent                                                                                             | Core boundary or caution                                                                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Jira Service Management queues](https://support.atlassian.com/jira-service-management-cloud/docs/get-to-know-the-main-jira-service-management-features/)                                      | Jira describes queues as where agents find and triage customer work.                                                                                                | A shared lane can provide durable discovery without naming a person first.                                   | Jira queue/work-item ownership is product-specific; Core's lane remains a Website source view.                                                                        |
| [Jira assign to self](https://support.atlassian.com/jira-service-management-cloud/docs/assign-yourself-to-a-customers-request/)                                                                | An agent can find an unassigned queue item and use **Assign to me**.                                                                                                | Self-selection should become actual assignment, not a separate hidden claim.                                 | Core rechecks exact Website action eligibility rather than relying on service-desk membership.                                                                        |
| [Jira work-item permissions](https://support.atlassian.com/jira-cloud-administration/docs/work-item-permissions/)                                                                              | Jira separates permission to change an assignee from permission to be assigned.                                                                                     | Lane visibility, assignment-command authority, and destination eligibility must remain separate predicates.  | Core requires source-specific relationship/attribute checks beyond Jira's role model.                                                                                 |
| [Asana Service Management queue](https://help.asana.com/s/article/understanding-your-queue-How-tickets-are-assigned-and-managed)                                                               | Asana describes a queue as a shared inbox whose explicitly added members claim tickets.                                                                             | Shared discovery plus bounded audience is common in service operations.                                      | D35's recovery action is brief; copying a claim lifecycle would add unnecessary state and abandonment risk.                                                           |
| [Adobe Workfront team requests](https://experienceleague.adobe.com/en/docs/workfront/using/teams-groups/work-with-team-requests/team-requests-overview)                                        | A team request remains pending until a team member volunteers and accepts it as their assignment.                                                                   | Team discovery can converge into one personal owner.                                                         | Workfront distinguishes team requests from collaborative multi-assignee work; Core converges directly through source assignment and needs no intermediate team owner. |
| [Dynamics 365 no-auto-assignment](https://learn.microsoft.com/en-us/dynamics365/customer-service/administer/assignment-methods)                                                                | Pick-based mode keeps work in a queue for representatives/supervisors, and Microsoft explicitly warns queues must be monitored so items do not remain unattended.   | A source lane alone is safe but has a real discovery/accountability risk.                                    | Core addresses that risk with optional bounded personal attention, not mandatory automated routing.                                                                   |
| [Dynamics 365 queues](https://learn.microsoft.com/en-us/dynamics365/customer-service/administer/set-up-queues-manage-activities-cases)                                                         | Queues centralize pending work; private-queue membership controls the queue view but does not itself restrict record access.                                        | Queue visibility and record/source access are separate controls.                                             | This directly supports Core's assignment/attention-does-not-grant-access invariant.                                                                                   |
| [Dynamics 365 workflow queue actions](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/fin-ops/organization-administration/workflow-actions)                                         | A work item queue can be monitored by several people; one person accepts, may complete/reassign/release, and developer-defined workflow controls available actions. | One source-designed action should end sibling presentations consistently.                                    | D35 does not create a generic workflow engine or allow a queue acceptance to complete Website work.                                                                   |
| [Zendesk manual assignment](https://support.zendesk.com/hc/en-us/articles/4408887127450-Manually-assigning-a-ticket)                                                                           | Zendesk exposes **take it** for self-assignment and allows assignment to a group or agent.                                                                          | Familiar self-assignment language can reduce friction where actual assignment is allowed.                    | Core uses **Assign to me** only as an exact source assignment, never a claim or permission grant.                                                                     |
| [Salesforce queues](https://help.salesforce.com/s/articleView?id=000384841&language=en_US&type=1)                                                                                              | Salesforce queues have explicit members and, depending on sharing settings, queue members may take ownership.                                                       | A deliberately bounded roster can create accountability without broadcasting the whole organization.         | Core route membership alone never authorizes viewing or taking the source work.                                                                                       |
| [HubSpot task queues](https://knowledge.hubspot.com/tasks/use-task-queues)                                                                                                                     | HubSpot says shared task queues help distribute work, while also stating a queue is a grouping/filter label and all shared users may complete task-owned work.      | A shared filtered view and bounded sharing are useful interaction precedents.                                | Core source completion and assignment cannot be inherited from HubSpot's task-owned queue semantics.                                                                  |
| [Contentful Entry Tasks](https://www.contentful.com/developers/docs/references/content-management-api/entry-tasks/)                                                                            | A task may target a team; every team member receives email, and Contentful warns the API does not verify assignee read access to the entry.                         | Team fan-out creates visibility but can create noise and access mismatch.                                    | Core bounds personal fan-out to three, defaults to in-product only, and independently rechecks source access/action authority.                                        |
| [Sanity Studio Tasks](https://www.sanity.io/docs/user-guides/tasks)                                                                                                                            | Sanity combines an inbox of assigned/in-progress tasks with document-local unfinished-task discovery.                                                               | Personal discovery and source-context discovery can coexist.                                                 | Sanity tasks are task-owned; Core maintains one source lane plus subordinate projections.                                                                             |
| [Blackbaud workflow inboxes](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/infinitydevguide/content/workflow/coworkflowtasksandinboxes.html)                                      | Blackbaud Enterprise CRM defines workflow tasks as source workflow steps routed through explicit inboxes to users or roles.                                         | Nonprofit CRM precedent supports an owning workflow plus a shared operational inbox.                         | Core uses stable explicit people rather than a role fallback and does not let inbox state own the source.                                                             |
| [Blackbaud inbox visibility](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/infinitydevguide/content/workflow/infinityworkflowsdktraining/coviewingataskwithinaworkflowinbox.html) | Users need inbox permission or a role with inbox permission to view tasks in that inbox.                                                                            | Shared lanes require explicit current visibility checks.                                                     | Coordinator configuration is responsibility intent, not a permission role; source authorization remains separate.                                                     |
| [W3C table pattern](https://www.w3.org/WAI/ARIA/apg/patterns/table/)                                                                                                                           | W3C recommends native HTML tables where possible and distinguishes them from composite interactive grids.                                                           | A desktop recovery list should use the simplest semantic list/table that satisfies its interaction needs.    | Core must not add spreadsheet-style grid complexity merely because rows have actions.                                                                                 |
| [WCAG 2.2 additions](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)                                                                                                              | WCAG 2.2 adds focus-not-obscured, target-size and redundant-entry criteria.                                                                                         | Sticky actions, mobile sheets and list controls require visible focus, usable targets and no repeated input. | Core's Base Maia/shared UI contract still governs implementation details.                                                                                             |
| [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)                                                                               | OWASP recommends least privilege, default deny and validating authorization on every request.                                                                       | Lane query, personal projection, detail, candidate search and final assignment each reauthorize.             | UI visibility or route membership is never sufficient enforcement.                                                                                                    |
| [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)                                                                                                        | PostgreSQL distinguishes row visibility with `USING` from resulting-row validity with `WITH CHECK`; owners and `BYPASSRLS` can bypass policies.                     | Both current and resulting Tenant/source/recipient scope need structural protection.                         | Privileged service-role commands must explicitly preserve the same domain boundary.                                                                                   |
| [Inngest idempotency](https://www.inngest.com/docs/guides/handling-idempotency)                                                                                                                | Inngest event/function idempotency windows are 24 hours and it recommends idempotent application behavior.                                                          | It can reduce duplicate projection execution.                                                                | Product database identity/receipts own permanent semantic uniqueness.                                                                                                 |
| [Inngest durable execution](https://www.inngest.com/docs/learn/how-functions-are-executed)                                                                                                     | Inngest persists successful step state and retries failed steps.                                                                                                    | It is appropriate for post-commit task/attention materialization and reconciliation.                         | It must not own the lane, route, authorization, claim, assignment, or source outcome.                                                                                 |

### What the evidence proves

**Verified external fact:** shared queues/lanes are common for discoverable
unassigned work. Products variously add explicit queue membership, team
notifications, self-claim, supervisor assignment, automatic routing, or release
back to queue. They do not converge on one universal model.

**Reasonable inference:** the durable pattern is to keep the shared backlog
discoverable, separate queue membership from record/action permission, and
converge through an authoritative assignment transition. Personal notification
is useful when a bounded responsible group exists, but broad team fan-out can
create noise and access confusion.

**Product judgment:** Core should use the shared lane as the guaranteed
no-configuration safety net and optional coordinators as attention only. It
should not import claim leases, capacity routing, round robin, SLA, task-owned
completion, team access grants, or email-every-member defaults.

### Why one to three

No external source establishes three as a universal optimum. The bound is a
Core product judgment already accepted for D29: one person is usually clearest,
while up to two additional co-equal people provide deliberate coverage for
small and mid-sized ministries without broadcasting capability holders. It is
a versioned v1 ceiling, not a Tenant-configurable limit or staffing claim.

## Current behavior, accepted intent and permanent path

### Current repository behavior

**Repository facts:**

- The admin `/tasks` prototype is browser/in-memory and exposes arbitrary
  assignee, status, completion and deletion interactions. It has no source-
  owned Needs-assignment lane or route-purpose distinction.
- `mission_control_queues` and `mission_control_tasks.queue_id` exist for the
  contribution-oriented shared task service, but a generic queue row does not
  prove Website source visibility, recovery responsibility or assignment
  authority.
- The current task assignment policy can assign the actor, a Finance queue, or
  both. It is not a D35 route resolver.
- Current tables have broad service-role grants and no authenticated policies;
  future D35 writers/readers require a new explicit server/RLS boundary.
- Missionary tasks are a separate personal system and are not evidence for a
  staff recovery lane.

Current code is migration/UI input only. Naming a new
`mission_control_queues` record `website-needs-assignment` and attaching every
manager would create the exact dual authority D31–D34 reject.

### Accepted intent entering D35

- OpenSpec makes Tenant safety and permission correctness primary, requires one
  shared staff work model, and favors clear system behavior over repeated
  manual glue.
- ADR-0183 says the source owns source work, exact action scopes,
  responsibility transitions and end. Tasks Hub owns subordinate discovery/
  engagement projections only.
- D33 says a return with no remaining recipient enters source-owned **Needs
  assignment**; it is not zero eligibility, a queue, or a guessed fallback.
- D34's Return recovery context is a non-authoritative triage hint and cannot
  route, prioritize or notify by itself.
- D29 Review coordinators are explicitly limited to external-review next-lane
  recovery and cannot be copied into correction-work recovery.
- Reading clears unread only. Source action/end clears actionable work.
- Inngest executes identifier-only product work but owns no product fact.

### Permanent path

Create a distinct code-owned route purpose and source read model:

- **Website work-recovery lane** — source query over current Needs-assignment
  occurrences for the viewer's exact current recovery visibility/action scope.
- **Website work-recovery route** — optional Tenant responsibility intent
  for personal attention about the action **Assign returned Website work**.
- **Work-recovery coordinator** — one member of that route; not a role,
  permission, assignee, queue member, reviewer, primary/backup, or employee
  classification.

The route may reuse D29's append-only typed route revision, member selection,
recipient resolver, personal occurrence and differential
projection machinery. It must use a separate purpose code, route rows, heads,
memberships, item role, copy, audit, authorization, source applicability and
end.

## Strongest alternatives

### Option 1 — shared lane plus optional bounded personal recovery — selected recommendation

This is the only alternative that makes no-setup discovery complete and still
lets a ministry choose explicit accountability. It adds configuration only for
Tenants that value personal attention and caps fan-out.

### Option 2 — shared source lane only — strongest alternative

This is the strongest alternative. It has the smallest data model, no roster
configuration, no personal projection lag, no notification fan-out and the
lowest privacy burden. Mature service products demonstrate that teams can work
from shared queues.

It loses because those products also warn or operationally assume that someone
monitors the queue. A small ministry may not have a service-desk habit, and
ownerless Website corrections can remain invisible in practice. Optional
bounded personal attention solves that without weakening the lane.

### Option 3 — broadcast all Website managers/editors

Reject. Capability or broad access does not prove responsibility. Broadcast
creates duplicate unread items, unclear accountability, privacy expansion and
alert fatigue, and it scales with staff rather than actual chosen coverage.

### Generic queue claim/lease

Reject for D35. Claim/pick models are valuable when a worker will spend a long
period resolving a service ticket and a team needs a temporary exclusive
owner. Here the recovery action is to make the real source assignment. A
separate claim adds `unclaimed/claimed/released/expired/stolen` states, timers,
abandoned claims, mobile recovery, reporting and permissions without changing
the authoritative Website action owner.

### Auto-assign to a coordinator

Reject. Work-recovery coordinators are responsible for assigning, not
necessarily performing, Page, Navigation or Communications correction work.
Auto-assignment would conflate recovery attention with source eligibility and
could trap work with someone who lacks the underlying action authority.

## Domain model and invariants

### Canonical terms

**Website work-recovery lane** — the source-owned current view of exact Website
Source-action scopes in Needs assignment which the viewer is currently allowed
to discover/recover. It has no members or assignee and grants nothing.

**Website work-recovery route** — a versioned Tenant responsibility-intent
policy optionally naming one to three people for personal attention about the
distinct source action Assign returned Website work.

**Work-recovery coordinator** — a stable same-Tenant Party selected in that
route. Membership alone grants no lane, source, task, candidate, assignment,
publication, Giving, finance, Support, review, manager or route-management
access.

**Recovery attention occurrence** — one source-backed shared-task/notification
occurrence for an exact Needs-assignment generation, with recipient-specific
presentations/engagement for the currently admitted coordinator intersection.
It is not the underlying correction assignment and has no independent Complete
or assignee state.

### Invariants

1. Every current Needs-assignment generation appears in exactly one source
   lane identity, independent of coordinator configuration/projection health.
2. Lane inclusion is derived from source actionability and viewer authorization,
   never from task/route membership.
3. New Tenants have a complete shared-lane-only posture; no setup is required
   to preserve source discovery.
4. A personal route has one-to-three distinct stable same-Tenant Parties,
   unordered and co-equal.
5. Shared-lane-only has no member rows and is not an invalid empty route.
6. The Tenant route purpose/head/members are separate from D29 and every other
   route.
7. D35 has no Site policy, override, route union, or inheritance selector.
8. Current exact Site/source authorization narrows each occurrence; proved
   zero, partial, or indeterminate personal coverage leaves the shared lane as
   the complete path without broadening recipients.
9. Route membership grants no source access or action. Event-time intersection
   admits only currently authorized exact recipients.
10. An independently authorized non-coordinator may view/act from the lane.
11. A configured coordinator who lacks exact current authorization receives no
    personal item and cannot infer the occurrence.
12. One Needs-assignment generation has at most one shared recovery-attention
    task identity and at most one recipient presentation/engagement per exact
    Party+role+surface.
13. Reading/marking read changes only that recipient's engagement.
14. Source assignment/end closes the lane occurrence and every applicable
    personal projection; task/notification state cannot do so.
15. No separate claim, lease, claimant, lock, timeout, release or takeover
    state exists.
16. A self-selection becomes the actual D33 source assignment only after exact
    target eligibility and expected heads pass.
17. No email, recurring reminder, push, SMS, due date, timer, SLA or escalation
    exists by default.
18. Route and task projection failure never hides source Needs assignment.

## Staff UX and UI

### Website work-recovery lane

Place the lane inside the Website operational information architecture, not as
a generic queue editor:

```text
Website
  Changes requested
    Needs correction
    Needs assignment (3)
```

Authorized staff see one calm navigation count derived from current source
rows; it is not unread and does not notify everybody. The page title is
**Needs assignment** with helper copy:

```text
Website work that still needs an owner
Assign each item to someone Website currently allows for that exact work.
```

Desktop uses the existing task/list language and the simplest semantic native
table or list, not an ARIA spreadsheet grid. Safe columns/row facts are:

- action-led title such as **Assign French Page correction**;
- Site and explicit locale;
- source-action type (Page, Navigation, Communications, Site/default);
- truthful age such as **Returned 2 hours ago**;
- D34 context only when the viewer is independently allowed to see it; and
- one primary row action **Assign work**.

Do not show protected D30 feedback, coordinator rosters, former-recipient
health/absence, candidate directory, capability internals, task IDs, source
heads, claims or worker status. Search/filter over safe Site, locale,
source-action family and age; use cursor pagination and stable deterministic
ordering (oldest actionable first is a transparent operational default, not an
urgency/SLA claim).

Mobile uses one-column cards with the same accessible names/facts/action,
server filters in a full-height Base Maia sheet, and no hidden horizontal
table, hover, drag, swipe, long press or dense action menu. Low-bandwidth
loading returns the first source page without resolving candidate people; the
eligible-person picker loads only after **Assign work**.

### Lane detail and assignment

Opening a row loads protected source detail only after current authorization
and uses the D33 source-validated destination picker. The panel says:

```text
Assign returned Website work
French (Canada) Page · hope.org

This correction is still open and has no current owner. Assignment does not
grant Website access.

[Choose an eligible person]
```

If the viewer is also currently eligible to perform every exact selected
scope, the picker may offer **Assign to me** as a convenient first option. It
still invokes the same source command; it is not **Claim**, **Take**, **Start**,
or a keyboard shortcut. If not eligible, self is absent without revealing
protected denial reasons.

The first successful source assignment shows **Assigned to Amélie** (identity
only if permitted), removes the row/count and ends all personal projections.
A stale concurrent actor sees **This work was already assigned. Nothing was
changed by your request.** plus current permitted context. A toast is not the
only evidence; source history/receipt persists and status is announced.

### Empty, unavailable and error states

- Empty: **All returned Website work has an owner.** No confetti or false claim
  that corrections are completed.
- No currently eligible targets: keep the row; say **No eligible person is
  available right now** and link to the authorized source recovery/config
  path. Never guess.
- Viewer loses source access: remove protected row/detail immediately; do not
  call it assigned/resolved.
- Source resolver indeterminate: **We couldn't verify who can take this.
  Nothing changed.** Keep source row visible when lane authorization remains.
- Offline: show last rendered safe data as stale only if policy permits, disable
  mutation with explanatory copy, and refresh/reauthorize before action.
- Projection unavailable: lane remains the authoritative path; personal task
  may show a safe temporary source link/status.

### Personal coordinator experience

An admitted coordinator sees one Tasks Hub row, correlated with one unread
attention presentation rather than duplicated chores:

```text
Website · Needs assignment
Assign returned French Page work
hope.org · French (Canada)

[Assign work]
```

Task detail explains:

```text
You received this because Hope selected you as a returned-work coordinator.
Other coordinators may also see this item. Reading does not reserve it.
```

Opening clears only that person's unread state. There is no Complete, Dismiss,
Snooze, Claim, Assign task, Delegate, Delete or recurring reminder. If another
authorized staff member assigns from the shared lane, every coordinator row
ends from the same source receipt.

### Configuration UX

Extend the existing coherent **Settings → Websites → Reviews** page with one
distinct card after external-review follow-up:

```text
Returned Website work
Who receives personal attention when correction work is returned without an
owner.

Shared recovery lane                         Always available to authorized staff
Personal attention                          Shared lane only

[Add returned-work coordinators]
```

This default is calm and complete; no warning/error/setup badge appears.

Selecting **Add returned-work coordinators** opens the same shared Base Maia
bounded-route sheet pattern as D29, but with different purpose-led copy and no
copy-from-Review-coordinators shortcut:

```text
Returned-work coordinators
Choose who should receive personal attention to assign ownerless Website work.
This does not grant Website access or assign the correction to them.

[Search people]
```

One selection is labelled **Usually clearest**. **Add coverage** progressively
reveals the second/third selection. At three, show **3 people selected ·
maximum** with replace/remove instructions. Members are shown as rows outside
the combobox with full international display name and a permission-safe status:

- **Can currently receive returned-work attention for at least one visible
  Site**; or
- **Cannot currently receive attention — selecting this person grants no
  access**.

Do not expose invisible Sites or qualification reasons. Do not show ordered
slots, primary/backup, checkboxes to select all managers, groups, teams, roles,
round robin, schedules, avatars-as-status, capacity, workload, presence, email,
or reminder settings.

The card distinctly names D29:

```text
Review coordinators and returned-work coordinators are separate. Select the
same person in both only when you intend both responsibilities.
```

There is no **Use Review coordinators** button. Search may show a neutral
**Also a review coordinator** tag only when the route manager is separately
authorized to know that fact; it does not preselect or rank.

### Tenant settings

Tenant save is one step and prospective under D36. Removing the
final member returns to **Shared lane only** through a clear consequence panel,
not an invalid empty route or “turn off recovery” action. The shared lane can
never be disabled.

D35 presents no Site exceptions. The selected Tenant coordinators receive a
personal item only when independently authorized for the exact Site/source
occurrence; otherwise the shared lane remains the truthful source path.

Configuration does not create source assignments, change existing source work,
grant access, publish content, alter Giving, or send email. D36 requires a
separate reviewed current-work policy application; D37 defines its complete
compatible Tenant cohort and distinct application capability.

### Accessibility, localization and low bandwidth

- Reuse shared `@asym/ui`, Base UI and exact Base Maia/Zinc semantic tokens.
- Use native table/list semantics where possible; do not add composite-grid
  keyboard behavior unless a later editable-grid requirement proves necessary.
- Every row/card has one meaningful accessible name and one primary action;
  icon/avatar/color/order never carries decisive meaning.
- Focus is visible and not obscured by sticky headers/footers or mobile safe
  areas; successful row removal moves focus to the next row or page heading.
- Counts, loading, empty state, assignment success/conflict and route-save
  result are polite programmatic status messages.
- Targets meet shared touch-size policy; the flow works at 320 CSS pixels,
  400% zoom, forced colors, reduced motion and keyboard/screen reader only.
- International names, duplicate names, Unicode, CJK, RTL/bidi, long Site names
  and localized plurals are explicit proof cases.
- Candidate/coordinator search is cancelable, debounced, paginated and server-
  filtered; no full Tenant directory downloads or eager per-row candidate
  calls.
- Safe list pages stay small and resumable; a dropped connection never loses a
  committed source assignment or produces an optimistic false owner.

## Source of truth and ownership

### Ownership map

| Fact                                                | Authority                                                            | Derived consumers                | Never authority                         |
| --------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------- | --------------------------------------- |
| Needs-assignment actionability and exact gap scopes | Website source responsibility head                                   | Lane, task/attention projections | Task queue/status, route, worker        |
| Lane membership for viewer                          | Current source visibility/recovery authorization                     | Website list/count               | Coordinator route, task presence        |
| Optional responsibility intent                      | Versioned Website work-recovery route                                | Recipient resolver/settings      | Role, group, capability, D29 route      |
| Current personal recipients                         | Complete event-time route × exact current authorization intersection | Task/attention occurrences       | Configured roster alone                 |
| Underlying work assignment                          | D33 source responsibility command/receipt                            | Lane removal/task end/history    | Claim, task Complete, coordinator click |
| Recipient read/unread                               | Attention engagement owner                                           | Badge/emphasis                   | Source/task assignment or completion    |
| Technical materialization                           | Product dispatch ledger plus optional Inngest                        | Telemetry/repair                 | Source result, route, claim             |

### Shared lane versus personal projection

The lane is evaluated from source state and authorization at read time. It is
not materialized by copying protected rows into a generic queue. Safe cached
counts/read models may accelerate it only if source-head tagged, Tenant scoped,
permission safe and invalidated/reconciled from the source.

Personal task/attention is a subordinate materialized projection. It may lag or
fail without changing lane/source truth. Query-time source ceilings suppress a
stale personal item after assignment/end.

## Routing and authorization separation

### Four independent predicates

1. **Lane visibility:** may this actor discover this exact Needs-assignment
   occurrence?
2. **Recovery action authority:** may this actor initiate assignment for these
   exact scopes?
3. **Coordinator attention eligibility:** is this actor in the effective D35
   route and currently allowed to receive the safe personal projection?
4. **Destination eligibility:** may the selected target actually receive every
   exact underlying Source-action scope?

Passing one never implies another. A coordinator may receive a safe item but
have to open a source page where only a subset of actions is available. A non-
coordinator may recover from the lane. An eligible correction worker may be a
destination without being a route manager/coordinator.

### Resolver posture

The personal recipient resolver returns only:

- `complete_nonempty` — bounded exact recipient intersection;
- `proved_zero` — route is valid but nobody currently qualifies;
- `source_lane_only` — effective policy deliberately creates no personal item;
  or
- `indeterminate` — partial, stale, timed-out, truncated, contradictory,
  corrupt, over-limit or unknown proof.

Only `complete_nonempty` releases personal occurrences. Every other posture
uses the shared lane without audience broadening. `proved_zero` is not zero
authorized lane viewers or zero eligible work assignees.

## Data model and database safety

### Conceptual persisted facts

1. Existing D33 source **Needs-assignment generation** with exact Tenant,
   environment, source work, action-scope digest, responsibility head, D34
   context reference and source lifecycle.
2. Append-only **work-recovery route revision** with Tenant scope, purpose,
   explicit mode, expected predecessor and current head.
3. Normalized immutable **route member** rows referencing stable same-Tenant
   Parties and an unordered-set digest.
4. Immutable **personal recovery occurrence/generation** recording effective
   route/head, complete qualified recipient set, source head and result posture.
5. One shared **source-backed task identity** per Needs-assignment generation +
   `assign_returned_website_work` purpose, with recipient-specific membership/
   engagement projections.
6. Identifier-only projection/outbox intent and receipts.

The lane itself is primarily a source query/read model, not a mutable queue
table. No claim record exists.

### Structural constraints

- Every route/member/occurrence/task relationship carries composite Tenant and
  environment scope.
- Exactly one current route head exists per Tenant/environment/scope/purpose.
- Route mode is one of `source_lane_only` or `named_coordinators`; invalid empty
  named-coordinator routes are impossible and D35 has no Site override.
- Personal route has one-to-three unique stable Party members and a canonical
  unordered digest; duplicate/fourth member rejects atomically.
- D29 and D35 purpose codes/heads/members cannot be referenced interchangeably.
- One current personal recovery occurrence exists per exact Needs-assignment
  generation and routing leg.
- One shared task identity and one recipient projection/engagement exist per
  exact semantic identity.
- Source assignment/end receipt and projection intent commit atomically at the
  source; lane/task materialization never owns the outcome.
- Historical route/occurrence/recipient/receipt lineage uses restrictive
  deletes or governed identity tombstones; profile deletion cannot erase
  attribution.
- No JSON roster, mutable task assignee/queue, comments, notification audience,
  CMS collection or workflow-provider state substitutes for normalized facts.

### RLS, grants and privileged paths

- Browser business writes to routes, source recovery and projections are
  revoked; privileged commands live in `packages/api` with thin app handlers.
- Lane/list/detail reads require Tenant equality plus exact current source
  visibility/recovery purpose. Counts/search/export use the same predicate.
- Route-management reads/writes require separate current Tenant route-
  management authority and enumerable-person scope.
- Personal task reads require exact current recipient membership plus source
  safe-projection applicability; source detail reload reauthorizes separately.
- If browser-readable mutable projections exist, RLS `USING` constrains old
  rows and `WITH CHECK` constrains resulting Tenant, purpose, source, Party and
  engagement scope.
- Security-definer functions fix `search_path`, use least grants and derive
  Tenant, actor, route/source scope and attribution from trusted context.
- Service-role, support, import, AI, job, worker and repair paths call the same
  domain boundary or equally strict source-certified repair command.
- Candidate/coordinator IDs are opaque; error/timing/count behavior does not
  enumerate cross-Tenant, invisible or unqualified people/work.

## Lifecycle, concurrency and idempotency

### Source occurrence lifecycle

```text
Needs assignment
  ├─ assign exact eligible successor -> Assigned (terminal recovery occurrence)
  ├─ source action satisfied/ended   -> Source ended
  ├─ source scopes superseded        -> Superseded
  └─ authorization/visibility change -> projections recomputed/removed
```

No `claimed`, `claim_expired`, `claim_released`, `claim_stolen`, `snoozed`,
`dismissed` or `completed_in_task` transition exists.

### Race handling

| Race/failure                                        | Required result                                                                                      |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Two lane users assign different people              | One expected-head source command wins; loser writes nothing and sees current result                  |
| Coordinator and non-coordinator assign concurrently | Same source compare-and-swap; route status confers no precedence                                     |
| Assign-to-me versus another target                  | Same target-eligibility and expected-head command; one winner                                        |
| Source ends while panel open                        | Source end wins/loser returns truthful terminal result; no task assignment                           |
| Coordinator loses access after occurrence           | Personal presentation disappears; lane/source remain for other authorized staff                      |
| Route member changes while occurrence active        | Prospective save; only D36’s separate reviewed current-work application may change the applied basis |
| Same assignment command delivered twice             | Same semantic idempotency returns original receipt                                                   |
| Same key reused with different target/scopes        | Reject changed meaning                                                                               |
| Source commit succeeds; response lost               | Receipt lookup returns success; no duplicate assignment                                              |
| Source commit succeeds; personal projection fails   | Lane closes from source; reconciliation repairs task history/end                                     |
| Personal item materializes late after assignment    | Query-time source ceiling suppresses it; worker records inapplicable projection                      |
| Resolver returns partial/indeterminate coordinators | Release no personal items; shared lane remains                                                       |
| No current personal recipients                      | Shared lane remains; no guessed/broadcast fallback                                                   |
| Inngest unavailable                                 | Synchronous source/route commands remain truthful; dispatch ledger/recovery scan repair projections  |

### Idempotency identities

- Needs-assignment generation identity derives from exact Tenant, source work,
  action scopes and responsibility generation—not title or task row.
- Route revision identity/digest derives from scope, purpose, mode and unordered
  stable Party set.
- Personal occurrence identity includes source generation, route purpose/head,
  routing leg and complete selected-set digest.
- Task identity is unique per source generation + recovery action purpose;
  recipient projection identity adds Party+role+surface.
- Actual assignment idempotency remains D33 source meaning, independent of
  attention/task projection.

## Privacy, notifications and audit

### Safe projection

Lane/task safe facts are code-owned action title, source family, Site, explicit
locale, age/time and exact safe destination. Protected feedback, candidate
content, D30 explanation/anchor, hidden actor identity, staff directory,
coordinator siblings, eligibility denials and source bodies remain at the
source.

D34 context appears only to viewers with its independent recovery-context
permission. Personal task/notification previews omit it by default and link to
the source.

### Notifications

- New qualifying source occurrence creates one in-product unread state for
  each newly admitted coordinator recipient.
- Shared lane viewers who are not recipients get no unread merely from lane
  authorization.
- Reading one item clears only that recipient's unread state.
- Source assignment/end closes all actionable projections without altering
  historical read timestamps.
- No recurring reminder, email, SMS, push, due date or countdown by default.
- Route configuration/change sends no work email and does not reset unchanged
  engagement.
- A later general notification policy may add bounded channels only through a
  separately decided safe contract; it cannot alter source truth/recipients.

### Audit planes

1. **Source business history:** Needs assignment, D34 context, actual assignment
   or end, actor and receipt.
2. **Route/personal-attention history:** configuration intent, effective route,
   complete recipient result and projection lifecycle.
3. **Recipient engagement:** unread/read timestamps.
4. **Technical execution:** outbox, workflow run, retry, failure and latency.

These records correlate by opaque product identities but do not substitute for
one another. Audit/export/analytics do not expose protected staff or source
facts outside purpose.

## Scalability and performance

- Lane queries use Tenant/environment/source-state/action-scope indexes, cursor
  pagination and bounded safe filters. Do not load all work or count in the
  browser.
- Counts are source-head tagged and permission scoped. Cached counts are
  invalidated/reconciled and may lag only with truthful stale/error handling.
- Personal fan-out is bounded to three; one shared task identity prevents
  copied-task drift.
- Resolver evaluates route members as one set and batches current authorization;
  no per-row/per-recipient N+1 source calls.
- Lane list never resolves assignee candidates until detail/action demand.
- Large Tenants use server-side coordinator/candidate search and pagination;
  no directory download.
- Tenant-aware workflow concurrency/flow control prevents one large Tenant's
  projection backlog from starving another.
- No quantitative traffic/candidate/backlog capacity claim is frozen without
  production-shaped evidence; named SLO/threshold monitors govern canary.

## Inngest boundary

### Synchronous product-owned effects

Source Needs-assignment creation/end, actual assignment, route save, explicit
current-item route application, immutable receipts and durable dispatch intent
are product-owned transactional commands. The browser receives success only
from those commands.

### Appropriate asynchronous effects

Inngest may perform short identifier-only replay-safe steps for:

- materializing/updating/ending shared task identity and recipient projections;
- creating one newly admitted unread occurrence;
- reconciling missing/stale task/attention records;
- rebuilding safe lane counts/read models;
- recording permitted aggregate operational metrics; and
- escalating dead letters under existing Tenant notification policy.

Each step reloads current product/source records, uses Tenant-scoped product
claims and records outcomes back to product-owned tables.

### Forbidden Inngest roles

Inngest never:

- owns the lane, source work, route, recipient set, unread, claim or assignment;
- chooses, ranks, rotates or broadens coordinators/targets;
- waits for human claim/assignment;
- parses D34 context or protected feedback;
- carries names, source bodies, route rosters or broad authorization in events;
- creates a fallback recipient when resolution is zero/indeterminate;
- treats run/step success as Website assignment; or
- supplies the only idempotency, audit, recovery or retention record.

Its 24-hour deduplication is a transport aid, never permanent business
uniqueness.

## Failure modes and safe recovery

| Condition                                 | User-visible behavior                                            | Operational recovery                                                         |
| ----------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Lane read fails                           | Calm scoped error with retry; no empty-success claim             | Diagnose source/read model; preserve source truth                            |
| Lane count differs from list              | List/source wins; mark count unavailable/stale                   | Rebuild count from source heads                                              |
| Coordinator projection fails              | Shared lane remains; recipient may see safe degraded link/status | Reconcile from source/route receipt                                          |
| Configured recipient becomes unauthorized | No personal item/detail; route intent remains prospective        | Resolver records zero/partial posture; shared lane covers                    |
| No authorized lane viewer exists          | No data leakage; operational critical visibility gap             | Security/Website owner repairs authority/config; never broaden automatically |
| Assignment target becomes ineligible      | Refresh target choices; Needs assignment remains                 | Source rejects without mutation                                              |
| Two assignments race                      | Winner receipt; loser sees assigned/current context              | No repair unless projection lag                                              |
| Route save conflicts                      | Current settings shown; stale save writes nothing                | Fresh edit/expected-head retry                                               |
| Route purpose accidentally aliases D29    | Deny constraint/command                                          | Stop writer, repair route data before release                                |
| Old client mutates queue/assignee/task    | Server rejection; source unchanged                               | Denial telemetry and client refresh                                          |
| Protected data enters projection/event    | Stop sink and quarantine/purge where lawful                      | Security/privacy incident path                                               |
| Worker dead-letters                       | Lane/source stay usable                                          | Product-owned reconciliation/manual roll-forward                             |

## Migration, rollout and rollback

### Required sequence

1. Resolve D35 and record the exact lane/route/coordinator terms, no-claim
   invariant and optional configuration posture in decision/glossary/ADR.
2. Add source lane query/current-head readers and safe count independently of
   Tasks Hub/personal routing.
3. Add append-only D35 route purpose, Tenant modes, member constraints,
   recipient resolver and receipts using D29 infrastructure without shared rows.
4. Add generic task/queue/claim mutation denial for D35 source-backed items
   before any producer or UI entry point.
5. Add policy-aware shared task/attention readers and query-time source ceilings.
6. Shadow lane results and recipient intersections against current source/
   authorization; release no personal items.
7. Canary the lane for one Website action family and bounded Tenant cohorts.
8. Canary optional personal projection for explicitly configured Tenants after
   source lane reliability is proven.
9. Add Inngest projection/reconciliation only after product receipts/manual
   roll-forward work without it.
10. Expand adapters and later source domains only through their own registered
    source/action/route/privacy contracts.

### Backfill

Do not infer route members from D29 Review coordinators, Website managers,
editors, task assignees, original actors, comments, notifications, groups,
teams, roles or capabilities. New/migrated Tenants default to shared lane only.

Current source occurrences may appear in the lane when the source can
deterministically establish current Needs assignment. Historical task rows do
not manufacture source work. Personal attention for current occurrences is
governed by D36’s explicit application and D37 cohort, never silently backfilled.

### Mixed-version safety

- Old clients cannot mutate D35 task assignee/status/claim; server denial is
  authoritative.
- New readers treat absent D35 route as shared lane only.
- New writers use additive purpose/version fields old readers ignore safely.
- Unknown route purpose/version fails closed without hiding the lane.
- New tasks never depend on an old generic queue writer.
- Projection workers tolerate route changes and stale work by reloading current
  source/route heads.

### Rollback

Disable new D35 route/config/personal projection writes. Keep the source lane
and accepted route/source history. Stop dispatch; reconcile task/attention
forward from immutable receipts when restored. Never reverse an actual source
assignment or delete a Needs-assignment occurrence because personal attention
is disabled.

## Proof portfolio

The later implementation must prove:

- new/migrated Tenant shared-lane-only behavior with no setup;
- exact lane visibility/count/list/detail/search/filter authorization;
- Tenant route with one, two, three, duplicate, fourth, inactive, deactivated,
  invisible and currently unauthorized people;
- Tenant lane-only and one-to-three named-coordinator modes, with no Site override;
- no implicit D29 roster copy/union/fallback and deliberate same-person separate
  selection;
- complete nonempty, proved zero, shared-lane-only, partial, indeterminate,
  timeout, over-limit and corrupt recipient resolution;
- coordinator personal item versus independently authorized non-coordinator lane
  action;
- recipient has personal item but lacks one/more source actions;
- Assign to me exact eligibility and no claim record;
- two-person/three-person simultaneous assignment, source end, policy/access
  change and route-save races;
- duplicate click, lost response, same-key changed target and worker replay;
- lane works through Tasks Hub/Inngest failure and personal projection repairs;
- no generic Complete, Dismiss, Snooze, Claim, Delegate, Reassign task, Delete,
  bulk, API, import, AI, support or direct-DB bypass;
- protected-data sink tests for tasks, notifications, emails, logs, events,
  analytics, caches, exports, search and AI;
- no email/reminder and unchanged recipient engagement preservation;
- desktop native table/list, mobile card, keyboard, screen reader, focus,
  status, 320px/400%, touch, forced colors, reduced motion, Unicode/CJK/RTL,
  duplicate names and no-avatar states;
- cursor pagination, large Tenant/backlog, Tenant fairness, slow/offline/lost
  connection and no N+1 candidate resolution;
- additive migration, old/new mixed versions, D36/D37 current-item treatment, kill
  switch and roll-forward recovery; and
- end-to-end traceability from decision through release evidence.

## Research-only acceptance outcomes

### Decision and scope

- **D35-RA1:** Recommend Option 1 — source-owned shared lane plus optional
  bounded personal recovery.
- **D35-RA2:** The shared lane is the complete no-configuration safety path.
- **D35-RA3:** A new or migrated Tenant starts in **Shared lane only**, not an
  error or setup-needed posture.
- **D35-RA4:** Personal recovery is an optional enhancement and never a source
  dependency.
- **D35-RA5:** D35 concerns attention to assign work, not ownership/completion
  of the underlying correction.
- **D35-RA6:** Shared lane, personal coordinator route, source assignment and
  Tasks Hub projection remain separate owners.
- **D35-RA7:** D35 introduces no universal workflow engine or Tenant-authored
  routing DSL.
- **D35-RA8:** Broadcast-to-capability-holder is rejected.
- **D35-RA9:** Generic queue ownership is rejected as source authority.
- **D35-RA10:** Auto-assignment to coordinators is rejected.

### Canonical domain model

- **D35-RA11:** The source read model is **Website work-recovery lane**.
- **D35-RA12:** Optional responsibility intent is **Website work-recovery
  route**.
- **D35-RA13:** User-facing members are **Work-recovery coordinators**.
- **D35-RA14:** Personal source-backed projection is a **Recovery attention
  occurrence**.
- **D35-RA15:** The route purpose is **Assign returned Website work**.
- **D35-RA16:** Lane is not a queue, assignee, team, role, permission, claim or
  task status.
- **D35-RA17:** Coordinator is not a reviewer, manager, editor, primary, backup,
  claimant or permission role.
- **D35-RA18:** Recovery attention is not the underlying correction assignment.
- **D35-RA19:** Needs assignment remains the authoritative source state.
- **D35-RA20:** D34 context remains a triage hint and cannot create recipients.

### Route configuration

- **D35-RA21:** Tenant mode is shared-lane-only or one-to-three-member personal
  recovery.
- **D35-RA22:** One configured person is presented as usually clearest.
- **D35-RA23:** Second/third people require deliberate **Add coverage**.
- **D35-RA24:** Members are distinct, stable same-Tenant Parties, unordered and
  co-equal.
- **D35-RA25:** Duplicate or fourth member rejects atomically and preserves the
  previous current route.
- **D35-RA26:** Three is a versioned Core v1 ceiling, not Tenant configuration or
  universal best-practice claim.
- **D35-RA27:** Shared-lane-only has no member rows and is valid/completed setup.
- **D35-RA28:** Removing the final member deliberately returns to shared lane
  only; it cannot disable the lane.
- **D35-RA29:** D35 has one Tenant route policy and no Site override.
- **D35-RA30:** Current Site/source authorization independently narrows the
  Tenant route for each occurrence.
- **D35-RA31:** Zero/partial/indeterminate personal eligibility uses the shared
  lane and never silently broadens, unions, or guesses members.
- **D35-RA32:** A Site-specific route requires later representative evidence
  and a separate founder decision.
- **D35-RA33:** D29 and D35 have separate purpose, revisions, heads, members,
  occurrence, item role, copy, authorization and audit.
- **D35-RA34:** Same person may be in both only through deliberate separate
  selection.
- **D35-RA35:** No copy/sync/suggestion/fallback from D29 exists.

### Lane UX

- **D35-RA36:** Website navigation exposes **Changes requested → Needs
  assignment** to currently authorized staff.
- **D35-RA37:** Navigation count is source-derived and is not unread/personal
  notification.
- **D35-RA38:** Page helper says the work still needs an owner and assignment is
  source validated.
- **D35-RA39:** One row/card represents one exact Needs-assignment generation,
  not one recipient or copied task.
- **D35-RA40:** Safe row facts are action title, Site, explicit locale, source-
  action type, age and one **Assign work** action.
- **D35-RA41:** D34 context appears only under its independent source permission.
- **D35-RA42:** Protected feedback, former-recipient personal detail and route
  roster never appear in lane list.
- **D35-RA43:** Default ordering is stable/transparent and never claims hidden
  urgency, SLA or AI priority.
- **D35-RA44:** Search/filter remains limited to safe source-owned facts.
- **D35-RA45:** Desktop prefers native table/list over composite ARIA grid.
- **D35-RA46:** Mobile uses equivalent one-column cards with no horizontal
  scrolling, hover, drag, swipe or long press requirement.
- **D35-RA47:** Empty state says all returned work has an owner, not all
  correction work is completed.
- **D35-RA48:** No-target and indeterminate states keep the row/source work and
  never guess.
- **D35-RA49:** Candidate resolution loads only on row action, not for every
  list row.
- **D35-RA50:** Lane stays usable independently of Tasks Hub/Inngest.

### Assignment and no-claim model

- **D35-RA51:** Initial D35 has no claim, lease, lock, claimant or handling state.
- **D35-RA52:** **Assign to me** is offered only when the actor is currently
  eligible for every exact selected underlying scope.
- **D35-RA53:** Assign to me invokes the same D33 source command as selecting
  another target.
- **D35-RA54:** No shortcut, keypress, row selection or task click creates
  assignment/claim.
- **D35-RA55:** First successful expected-head source assignment wins.
- **D35-RA56:** A concurrent loser writes nothing and sees the current permitted
  result.
- **D35-RA57:** Actual source assignment/end removes lane occurrence and all
  actionable personal projections.
- **D35-RA58:** Task Complete/Dismiss/Snooze/Delete cannot resolve the lane.
- **D35-RA59:** Coordinators are responsible for the assignment action, not
  automatically for performing correction work.
- **D35-RA60:** Bulk assignment is absent initially; each source occurrence is
  independently reauthorized and assigned.

### Personal attention UX

- **D35-RA61:** One shared source-backed task identity supports recipient-
  specific projections/engagement.
- **D35-RA62:** Each admitted coordinator sees at most one row for one exact
  recovery occurrence/role/surface.
- **D35-RA63:** Personal copy says why the recipient received it and that other
  coordinators may also see it.
- **D35-RA64:** Reading clears only the recipient's unread engagement and never
  reserves work.
- **D35-RA65:** There is no Complete, Dismiss, Snooze, Claim, Delegate,
  Reassign-task, Delete, reminder or due date control.
- **D35-RA66:** Newly admitted recipients alone receive one fresh in-product
  unread state.
- **D35-RA67:** Unchanged recipients retain engagement without new unread.
- **D35-RA68:** Removed/ineligible recipients lose current presentation without
  fabricated completion or permission revocation.
- **D35-RA69:** No email, push, SMS or recurring reminder is sent by default.
- **D35-RA70:** A separately authorized non-coordinator may act from the lane.

### Configuration UX

- **D35-RA71:** Settings location is **Settings → Websites → Reviews → Returned
  Website work**.
- **D35-RA72:** Default card says shared lane always available and personal
  attention shared-lane-only.
- **D35-RA73:** Default card has no warning, error or setup-needed badge.
- **D35-RA74:** **Add returned-work coordinators** opens one responsive Base Maia
  bounded-route sheet.
- **D35-RA75:** Picker searches only enumerable active same-Tenant stable people.
- **D35-RA76:** Qualification is shown separately and selection grants no access.
- **D35-RA77:** Selected members appear as rows outside the combobox with names
  and safe status text.
- **D35-RA78:** No ordered slots, groups, roles, teams, select-all, workload,
  presence, schedules or notification settings appear.
- **D35-RA79:** The UI explicitly distinguishes Review coordinators from
  returned-work coordinators.
- **D35-RA80:** There is no one-click copy/use-Review-coordinators control.
- **D35-RA81:** D35 settings expose no Site exception, inheritance, or distinct-
  route control.
- **D35-RA82:** Ordinary saves create no source assignment, access, email,
  publication, Giving or financial effect.
- **D35-RA83:** D36 requires prospective save plus separate reviewed current-
  backlog application; D37 owns its complete cohort/action/disclosure contract.

### Routing and authorization

- **D35-RA84:** Lane visibility, recovery action authority, coordinator
  attention eligibility and target eligibility are four independent predicates.
- **D35-RA85:** Route membership passes none of the other predicates by itself.
- **D35-RA86:** Event-time recipient resolution intersects route with current
  exact Tenant/source/action authorization.
- **D35-RA87:** Only complete nonempty intersection releases personal
  projections.
- **D35-RA88:** Shared-lane-only, proved-zero, partial, stale, timeout,
  over-limit, contradiction, corruption or unknown proof broadens nobody.
- **D35-RA89:** Different coordinators may see different lawful actions; item
  possession never unions authority.
- **D35-RA90:** Non-coordinator lane access/action remains independently
  possible.
- **D35-RA91:** Destination eligibility is rechecked at final D33 assignment and
  is not inferred from coordinator status.
- **D35-RA92:** A route manager may configure intent without receiving lane/
  personal/source action access.
- **D35-RA93:** AI acts only within initiating user's same predicates and cannot
  widen audience/assignment.

### Data and integrity

- **D35-RA94:** Lane derives from authoritative Needs-assignment generations;
  it is not a mutable queue table.
- **D35-RA95:** Route revisions and normalized members are append-only,
  versioned and purpose-scoped.
- **D35-RA96:** One current route head exists per Tenant/environment/scope/
  purpose.
- **D35-RA97:** One-to-three unique-member and mode/member cardinality are
  database constrained.
- **D35-RA98:** D29/D35 cross-purpose relationships are structurally forbidden.
- **D35-RA99:** One personal occurrence/shared task identity exists per exact
  source generation/purpose/routing leg.
- **D35-RA100:** Recipient membership/engagement uses exact Party+role+surface
  semantic uniqueness.
- **D35-RA101:** Source receipt and identifier-only projection intent commit
  atomically.
- **D35-RA102:** No mutable JSON roster, generic queue/assignee/status/comment,
  notification audience or CMS collection owns D35 facts.
- **D35-RA103:** Historical attribution survives profile deactivation through
  governed Party/tombstone retention.
- **D35-RA104:** No historical source work or route is inferred from legacy
  tasks/roles/capabilities.

### Database, RLS and privileged paths

- **D35-RA105:** Browser business writes are revoked; privileged commands live
  in `packages/api` behind thin handlers.
- **D35-RA106:** Lane/list/count/detail/search/export all apply exact current
  Tenant/source recovery authorization.
- **D35-RA107:** Route management uses separate Tenant purpose authority
  and enumeration-safe people search.
- **D35-RA108:** Personal task read requires exact recipient membership and
  current safe source applicability.
- **D35-RA109:** Source detail and final assignment independently reauthorize.
- **D35-RA110:** RLS `USING` and `WITH CHECK` constrain old/resulting scope where
  mutable projections exist.
- **D35-RA111:** Security-definer functions fix `search_path`, use least grants
  and trusted context.
- **D35-RA112:** Service-role, support, import, AI, job, worker and repair paths
  preserve the same domain boundary.
- **D35-RA113:** `BYPASSRLS`, generic admin, queue or task-manager status never
  supplies product authority.
- **D35-RA114:** Counts/errors/timing do not enumerate cross-Tenant/invisible
  work or people.

### Privacy, notifications and audit

- **D35-RA115:** Lane/task projections contain only code-owned minimum safe
  facts and source references.
- **D35-RA116:** Protected D30 feedback, source bodies, hidden identities,
  roster siblings and denial reasons remain source-owned.
- **D35-RA117:** D34 context appears only under its independent source purpose.
- **D35-RA118:** Workflow events/logs/traces/metrics/caches/search/AI/email/
  generic exports exclude protected content and rosters.
- **D35-RA119:** Source business, route/personal attention, engagement and
  technical execution are separate audit planes.
- **D35-RA120:** Recipient engagement never becomes assignment/source evidence.
- **D35-RA121:** Personal fan-out stays bounded to three and unchanged recipients
  are not renotified.
- **D35-RA122:** Staff/person analytics, workload scoring and performance ranking
  are not introduced.
- **D35-RA123:** Route/source retention follows purpose schedules and personal
  projection does not lengthen protected-source retention.

### Accessibility, localization and performance

- **D35-RA124:** Shared UI uses `@asym/ui`, Base UI and exact Base Maia/Zinc
  semantics.
- **D35-RA125:** Native list/table is preferred over an unnecessary composite
  ARIA grid.
- **D35-RA126:** Focus stays visible/not obscured and moves predictably after
  row removal, cancel, success or conflict.
- **D35-RA127:** Counts/loading/empty/success/conflict are announced as status
  messages without toast-only evidence.
- **D35-RA128:** Keyboard, screen reader, touch, 320px/400%, forced colors,
  reduced motion and no-hover paths are proven.
- **D35-RA129:** Names/Sites/locales support Unicode, CJK, RTL/bidi, duplicates,
  long translations and no avatar.
- **D35-RA130:** Mobile cards preserve the same facts/action as desktop rows.
- **D35-RA131:** Lane queries are indexed/cursor-paginated and candidate search
  is lazy/server-side.
- **D35-RA132:** Resolver batches route authorization and avoids per-row/
  per-recipient N+1 calls.
- **D35-RA133:** Tenant-aware flow control prevents starvation by large Tenants.
- **D35-RA134:** Slow/offline use never creates optimistic false assignment or
  loses committed receipts.

### Concurrency, failure and Inngest

- **D35-RA135:** Every actual assignment/source-end race uses expected source
  heads and has one winner.
- **D35-RA136:** Same semantic retry returns original product receipt; changed
  target/scopes under same key rejects.
- **D35-RA137:** Lane/source truth remains usable through personal projection,
  notification or Inngest failure.
- **D35-RA138:** Query-time source ceiling suppresses late/stale personal items.
- **D35-RA139:** Inngest may materialize/reconcile identifier-only projections
  after product commit.
- **D35-RA140:** Inngest never owns/chooses lane, route, recipient, unread,
  claim, target or assignment.
- **D35-RA141:** Product claims and permanent database uniqueness guard every
  retryable effect.
- **D35-RA142:** Inngest's 24-hour deduplication is not permanent product
  idempotency.
- **D35-RA143:** Dead letters are visible/recoverable without hiding or
  broadening source work.
- **D35-RA144:** Body-free diagnostics distinguish source, lane, route resolver,
  task, engagement, outbox and worker failure.

### Migration, testing and traceability

- **D35-RA145:** Lane readers ship and prove reliable before optional personal
  projection.
- **D35-RA146:** D35 denial guards deploy before producer/UI writers.
- **D35-RA147:** New/migrated Tenants receive no inferred coordinators and use
  shared lane only.
- **D35-RA148:** No historical route, claim or source occurrence is inferred.
- **D35-RA149:** Shadow source lane and recipient resolver precede canary.
- **D35-RA150:** Canary expands by Website action family and bounded Tenant
  cohort.
- **D35-RA151:** Rollback stops route/personal writers but preserves lane/source
  truth and rolls projections forward.
- **D35-RA152:** Tests cover positive, negative, boundary, authorization,
  concurrency, migration, privacy, accessibility and production-shaped
  outcomes.
- **D35-RA153:** Tests prove user/source outcomes and forbidden effects, not only
  rows or component rendering.
- **D35-RA154:** Exact terminology/purpose/cardinality/no-claim/notification
  contract traces through decision, glossary, ADR, OpenSpec, design, tickets,
  code, tests and release evidence.
- **D35-RA155:** D35 remains Reserved until complete implementation, migration,
  authorization, privacy, accessibility, operational/canary and release proof.
- **D35-RA156:** Broad repository verification remains deferred until the end
  of the Grill session as directed.

## Named monitors

| Signal                                               | Threshold                                                                                                                      | Owner                                | Required response                                                                                           |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `website_recovery_lane_missing_current_total`        | Any authoritative Needs-assignment occurrence absent for an independently authorized lane viewer                               | Website source owner + Data Platform | Stop lane expansion, repair read model/auth query, reconcile from source heads                              |
| `website_recovery_lane_false_row_total`              | Any non-current/source-ended occurrence shown actionable                                                                       | Website source owner + Web Platform  | Apply source ceiling, purge stale cache/projection, add regression                                          |
| `website_recovery_lane_cross_tenant_total`           | Any cross-Tenant list/count/detail/search/export disclosure                                                                    | Security + Data Platform             | Incident, stop path, preserve evidence, assess exposure and repair                                          |
| `website_recovery_lane_no_authorized_viewer_total`   | Any active Needs-assignment occurrence with zero independently authorized recovery viewers for 15 minutes                      | Security + Website owner             | Critical operational review; repair authority/configuration without guessed audience                        |
| `website_recovery_lane_count_drift_absolute`         | Count differs from current authorized source rows by any value for more than 5 minutes                                         | Website Platform                     | Mark count stale/unavailable, rebuild from source, inspect invalidation                                     |
| `website_recovery_personal_without_route_total`      | Any personal occurrence without the exact current/routing-leg D35 route evidence                                               | Tasks Hub + Website                  | Stop projector, end false projection under audit, repair resolver                                           |
| `website_recovery_personal_unauthorized_total`       | Any personal item/detail released without exact current recipient authorization                                                | Security + Tasks Hub                 | Incident, revoke projection/cache, inspect all route/resolver paths                                         |
| `website_recovery_route_d29_alias_total`             | Any D29/D35 shared/aliased/synchronized member or purpose row                                                                  | Website domain owner + Data Platform | Stop writer, split lineage, audit recipients, add structural constraint                                     |
| `website_recovery_route_cardinality_violation_total` | Any duplicate, zero-member personal mode, or more than three members                                                           | Data Platform                        | Stop writer, preserve previous head, repair constraint/migration                                            |
| `website_recovery_site_override_total`               | Any D35 Site policy, route, inheritance selector, union, or fallback                                                           | Website domain owner + Security      | Stop writer/resolver, remove the unsupported route, and restore Tenant policy plus exact Site authorization |
| `website_recovery_assignment_from_claim_total`       | Any claim/task state directly creating underlying source assignment                                                            | Website source owner + Tasks Hub     | Stop command, reverse only unauthorized projection under source adjudication, remove claim coupling         |
| `website_recovery_claim_record_total`                | Any D35 claim/lease/lock/timeout record or UI introduced                                                                       | Product + Architecture               | Block release, remove speculative lifecycle, require new founder decision                                   |
| `website_recovery_stale_head_success_total`          | Any stale source/route/policy/authorization head accepted                                                                      | Website source owner + Data Platform | Disable writer, repair CAS, inspect downstream effects                                                      |
| `website_recovery_duplicate_assignment_total`        | More than one successor effect for one Needs-assignment generation                                                             | Data Platform                        | Fence writer/idempotency, reconcile source history, add race regression                                     |
| `website_recovery_duplicate_task_total`              | More than one shared task or equivalent recipient row per semantic identity                                                    | Tasks Hub                            | Reconcile/merge projection, fix uniqueness, preserve source history                                         |
| `website_recovery_unread_duplicate_total`            | More than one unread occurrence per recipient generation                                                                       | Notifications owner                  | Deduplicate engagement, repair semantic key                                                                 |
| `website_recovery_unchanged_recipient_reset_total`   | Any unchanged recipient gets new unread/read reset                                                                             | Notifications owner + Tasks Hub      | Repair engagement projection, add differential-route regression                                             |
| `website_recovery_email_or_reminder_total`           | Any default email/push/SMS/recurring reminder/due timer emitted                                                                | Communications + Product             | Stop emitter, cancel queued sends where safe, audit recipients, repair policy                               |
| `website_recovery_protected_sink_total`              | Any protected body/roster/denial reason in task preview, event, log, trace, metric, cache, search, AI, email or generic export | Security + Privacy                   | Stop sink, purge/quarantine where lawful, assess incident, add sink test                                    |
| `website_recovery_projection_lag_seconds`            | p95 above 60 seconds for 15 minutes or any item above 300 seconds                                                              | Tasks Hub + Workflow Platform        | Reconcile from source/route receipt, inspect outbox/worker, preserve lane                                   |
| `website_recovery_dead_letter_age_seconds`           | Any D35 projection dead letter above 15 minutes                                                                                | Workflow Platform + Tasks Hub        | Product-owned replay/reconciliation, policy escalation, no source mutation                                  |
| `website_recovery_assignment_conflict_rate`          | Above 5% of attempts for 30 minutes                                                                                            | Website Platform + Product UX        | Inspect stale UI/concurrency/latency; do not weaken expected heads                                          |
| `website_recovery_lane_age_seconds`                  | Any critical returned work ownerless above 4 hours or p95 ordinary above 1 business day                                        | Website operations owner             | Review lane/coordinator adoption and source eligibility; assign through authorized source path              |
| `website_recovery_source_lane_only_tenant_rate`      | Observe only; no success threshold until representative adoption evidence                                                      | Product Research                     | Use for research, never coerce coordinator setup                                                            |
| `website_recovery_coordinator_fanout`                | Any occurrence above three recipients                                                                                          | Tasks Hub + Website                  | Stop projector, inspect resolver/cardinality, end excess projections                                        |
| `website_recovery_mobile_success_rate`               | Below 90% of eligible canary attempts or more than 5 points below desktop                                                      | Product UX + Web Platform            | Inspect reflow/touch/latency/copy; block expansion                                                          |
| `website_recovery_keyboard_completion_rate`          | Below 95% in moderated keyboard-only proof or any blocker                                                                      | Accessibility owner + Web Platform   | Stop release, repair list/sheet/focus behavior, retest                                                      |
| `website_recovery_screen_reader_blocker_total`       | Any critical name/status/focus/action defect                                                                                   | Accessibility owner                  | Stop-ship affected surface, repair and independently retest                                                 |
| `website_recovery_low_bandwidth_abandonment_rate`    | More than 10 percentage points above normal Website task action                                                                | Product UX + Web Platform            | Reduce payload/requests, improve retry/stale copy, block expansion if causal                                |
| `website_recovery_staff_comprehension_rate`          | Below 90% correctly distinguish lane, coordinator attention and underlying owner in representative testing                     | Product Research + Website           | Revise terms/hierarchy/copy and repeat testing before expansion                                             |
| `website_recovery_manual_db_repair_total`            | Any direct repair not derived from immutable source/route receipt                                                              | Data Platform                        | Stop ad hoc repair, document incident, build audited roll-forward command                                   |

The percentage/time thresholds are first-canary investigation contracts, not
claims about current usage. Zero-tolerance Tenant/authorization/source-truth
signals cannot be weakened by later UX evidence. Lane age thresholds require a
documented business-hours definition before implementation and do not create an
SLA or automatic escalation.

## Assumptions and unresolved unknowns

### Assumptions implementation may not treat as verified facts

- Some ministries will benefit from personal recovery coordinators beyond the
  shared lane. Verify through interviews, task shadowing and canary adoption.
- One to three is enough for the first product version. Verify recipient noise,
  coverage and Tenant sizes before any versioned ceiling change.
- Ownerless assignment is normally a short triage action, so a separate claim
  provides less value than cost. Verify assignment duration/conflict rates.
- Settings → Websites → Reviews remains the clearest information architecture
  as other Website operations grow. Verify card comprehension and navigation.
- Site-level exceptions are needed for some multi-site ministries. Verify use
  without forcing every Tenant to configure them.

### Unresolved unknowns

1. Whether saving/changing coordinators should affect currently active
   Needs-assignment items automatically, prospectively only, or through an
   explicit impact preview. This is the recommended D36 decision below.
2. Final business-hours/time-zone definition for age monitors; D35 stores no
   due date or SLA.
3. Actual lane backlog, action-family distribution, conflict rate, assignment
   time, coordinator adoption and mobile/low-bandwidth performance.
4. Final retention/redaction policy for route/recipient history after staff
   departure or privacy request.
5. Whether any future source domain genuinely needs claim/lease semantics; it
   must not inherit them from D35 without its own evidence and decision.

## D36 — when coordinator settings change, what happens to current ownerless work?

### Why this needs a founder decision

D35 makes route configuration optional and source work independently visible in
the lane. A settings save can therefore be safely prospective, but staff who
configure Ana to fix an existing backlog may reasonably expect her to receive
those items. Automatically sending every current item can create a sudden burst
of unread work and expose Sites the manager did not intend to affect.

### Hope Ministries example

Hope Ministries has twelve current Website items in **Needs assignment**. It
adds Ana as its first returned-work coordinator. Should Ana immediately receive
twelve personal items, receive only future items, or should the manager review
the current impact and deliberately apply the new route?

### Option 1 — prospective save plus explicit current-work impact preview — recommended

Saving the route immediately governs future Needs-assignment generations. The
success result says **12 current items still use the shared lane** and offers
**Review current returned work**. A fresh permission-safe preview groups safe
counts by Site/action family, shows Ana will receive one item per selected
current occurrence, and performs one explicit expected-head differential
handoff. Unchanged recipients keep engagement; newly admitted recipients get
one unread; removed recipients end truthfully.

**UX:** no surprise notification burst, but staff configuring for a backlog
have a clear next step in the same context. Canceling the impact action does not
undo the prospective route save.

**Impact:** matches D29's recorded prospective-plus-explicit-current pattern,
preserves audit/authorization, and avoids hidden batch behavior.

### Option 2 — automatically apply to all current work

Every successful route save immediately recomputes and releases personal
attention for all current eligible Needs-assignment occurrences.

**UX:** intuitive for staff who expect settings to take effect now, but one save
can create many items, cross Sites, reset attention, and take longer/fail
partially. Consequences are difficult to understand before submit.

**Impact:** lower clicks, higher blast radius and notification/privacy risk.

### Option 3 — future work only with no current-work action

The route applies only to future Needs-assignment generations. Existing work
remains lane-only until assigned individually.

**UX:** quiet and simple but frustrating when the reason for configuration is
the existing backlog; staff must repeat manual assignment work.

**Impact:** smallest route workflow, highest manual glue.

### Recommendation and exact question

**Recommend Option 1 — prospective save plus explicit current-work impact
preview.** It keeps an ordinary settings change small and reversible while
making backlog adoption obvious and safe. It reuses D29's recorded UX and
differential successor semantics without silently coupling the two route
purposes.

Do you choose **Option 1 — prospective plus explicit impact preview**, **Option
2 — automatically apply to all current ownerless work**, or **Option 3 — future
work only**? You may amend any option.

## Primary evidence index

### Core repository

- [`openspec/project.md`](../../../openspec/project.md)
- [`openspec/specs/platform-principles/spec.md`](../../../openspec/specs/platform-principles/spec.md)
- [`openspec/specs/platform-boundaries/spec.md`](../../../openspec/specs/platform-boundaries/spec.md)
- [`openspec/specs/workflow-orchestration/spec.md`](../../../openspec/specs/workflow-orchestration/spec.md)
- [`ADR-0181`](../../adr/0181-source-authorized-candidate-scoped-external-review.md)
- [`ADR-0182`](../../adr/0182-one-current-candidate-review-responsibility-lane.md)
- [`ADR-0183`](../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)
- [`D29 primary research`](./phase-24-d29-explicit-website-review-coordinators-primary-research.md)
- [`D31 primary research`](./phase-24-d31-source-owned-correction-attention-primary-research.md)
- [`D32 primary research`](./phase-24-d32-source-backed-task-completion-primary-research.md)
- [`D33 primary research`](./phase-24-d33-source-validated-return-handoff-primary-research.md)
- [`D34 primary research`](./phase-24-d34-conditional-recovery-context-primary-research.md)
- [`D34 adversarial review`](./phase-24-d34-conditional-return-recovery-context-adversarial-review.md)
- [`Phase 24 decision log`](./phase-24-multi-site-management-decision-log.md)
- [`CONTEXT.md`](../../../CONTEXT.md)
- [`mission_control_tasks` migration](../../../supabase/migrations/20260526193000_mission_control_tasks.sql)
- [`Mission Control assignment policy`](../../../packages/api/src/admin/mission-control-tasks/assignment-policy.ts)

### Current official CRM, CMS, service-desk, work-management and nonprofit sources

- [Atlassian — Jira Service Management queues](https://support.atlassian.com/jira-service-management-cloud/docs/get-to-know-the-main-jira-service-management-features/)
- [Atlassian — assign yourself to a work item](https://support.atlassian.com/jira-service-management-cloud/docs/assign-yourself-to-a-customers-request/)
- [Atlassian — work-item permissions](https://support.atlassian.com/jira-cloud-administration/docs/work-item-permissions/)
- [Asana — Service Management queue](https://help.asana.com/s/article/understanding-your-queue-How-tickets-are-assigned-and-managed)
- [Adobe Workfront — team requests](https://experienceleague.adobe.com/en/docs/workfront/using/teams-groups/work-with-team-requests/team-requests-overview)
- [Microsoft — Dynamics assignment methods](https://learn.microsoft.com/en-us/dynamics365/customer-service/administer/assignment-methods)
- [Microsoft — Dynamics queues](https://learn.microsoft.com/en-us/dynamics365/customer-service/administer/set-up-queues-manage-activities-cases)
- [Microsoft — Dynamics workflow task actions](https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/fin-ops/organization-administration/workflow-actions)
- [Zendesk — manual ticket assignment](https://support.zendesk.com/hc/en-us/articles/4408887127450-Manually-assigning-a-ticket)
- [Salesforce — queues](https://help.salesforce.com/s/articleView?id=000384841&language=en_US&type=1)
- [HubSpot — task queues](https://knowledge.hubspot.com/tasks/use-task-queues)
- [Contentful — Entry Tasks](https://www.contentful.com/developers/docs/references/content-management-api/entry-tasks/)
- [Sanity — Studio Tasks](https://www.sanity.io/docs/user-guides/tasks)
- [Blackbaud — workflow tasks and inboxes](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/infinitydevguide/content/workflow/coworkflowtasksandinboxes.html)
- [Blackbaud — workflow inbox visibility](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/infinitydevguide/content/workflow/infinityworkflowsdktraining/coviewingataskwithinaworkflowinbox.html)

### Current official accessibility, security, database and workflow sources

- [W3C — table pattern](https://www.w3.org/WAI/ARIA/apg/patterns/table/)
- [W3C — WCAG 2.2 additions](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)
- [OWASP — Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [PostgreSQL — row security policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Inngest — handling idempotency](https://www.inngest.com/docs/guides/handling-idempotency)
- [Inngest — durable execution](https://www.inngest.com/docs/learn/how-functions-are-executed)

## Evidence limits

- Official product documentation proves documented behavior, not comparative
  success for nonprofit ministry staff.
- Blackbaud demonstrates nonprofit workflow inbox patterns but does not prove
  how current Asym Tenants staff multi-site Website recovery.
- External queue products often let team/queue membership grant visibility,
  assignment or completion. Core's governing source/authorization decisions
  explicitly override those looser semantics.
- No representative ministry interviews, lane/task telemetry, backlog sizes,
  coordinator adoption, assignment duration or low-bandwidth measurements were
  available here.
- One-to-three, no Site override, no-claim and settings placement are researched
  Core product judgments that require comprehension/usability/canary proof.
- Exact indexes, pagination budgets, business-hour thresholds, retention and
  notification-channel policy remain implementation/design decisions; this
  record constrains outcomes without inventing unsupported capacity/legal
  claims.

## Subsequent D36 resolution

D36 selects prospective D35 policy save plus a separately authorized,
permission-safe, explicit current-work policy application. The save never
changes old occurrences; each keeps an applied policy/routing basis. One
accepted application owns a normalized cohort/result ledger and changes each
still-current occurrence atomically through differential routing: continuing
engagement is preserved, new recipients alone receive fresh unread, and
removed recipients end as **Coordinator responsibility changed**. Source Needs
assignment remains authoritative through every partial, stale, failed, or
lane-only result. D37 defines the exact cohort/capability; D38 now defines
explicit-only zero-holder grant governance; D39 permits typed direct and
protected flat Access-group assignment sources through one EffectiveAccess
model; D40 permits only a deliberately reviewed separate direct continuity
source with exact current overlap proof. See the
[D36 adversarial record](./phase-24-d36-prospective-save-explicit-current-work-application-adversarial-review.md).

## Subsequent D37 resolution

D37 selects one complete compatible pre-cutover Tenant cohort proved from a
closed producer/version catalog and authoritative source occurrence/head
census. Unknown completeness blocks acceptance; visibility, Sites, filters,
tasks, recipient qualification, and client input never define membership.

The separate Tenant-wide application capability authorizes only that operation
and exact complete aggregate item/assignment consequences needed for consent;
it grants no source detail or recipient authority. Prepared evidence is
no-effect, normalized membership seals atomically before claims, and D36
executes each member under current exact heads without unreviewed widening. See
the [D37 adversarial record](./phase-24-d37-complete-tenant-current-work-cohort-adversarial-review.md)
and [D37 primary research](./phase-24-d37-complete-tenant-current-work-cohort-primary-research.md).
