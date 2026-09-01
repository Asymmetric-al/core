# ADR-0183: Source-owned work projects into one shared Tasks Hub

**Status:** Accepted (founder rulings, Phase 24 Grill session — D31–D55,
2026-08-29)

## Context

Core already has several task-shaped surfaces: a contribution-oriented Mission
Control task service, a separate prototype admin `/tasks` collection, and a
missionary personal-task surface. Phase 24 also needs private correction work
to reach the staff who can perform it, and later domains such as Mobilize will
have their own actionable assignments. Letting every domain create its own task
model would fragment **My tasks**, permissions, completion, reporting, and
operations. Conversely, making the shared task row the authority for Website,
Mobilize, finance, or another source would create dangerous dual ownership.

The word _assignment_ is especially ambiguous in Core. Tenant assignments,
Support assignments, role membership, capability possession, responsibility,
and a current human action requirement are different facts. Only the last may
justify work in Tasks Hub, and only through an explicit source contract.

## Decision

Core will evolve one cross-domain staff **Tasks Hub**. A consequence-owning
source may project work into it only through a finite, code-owned, versioned
**Source work projection contract**. The contract identifies one exact
actionable source occurrence, typed next actions, responsibility and current
authorization predicates, safe list facts, protected detail loader, source
destination, source applicability/end rules, recipient ceiling, retention
class, semantic idempotency, and projection policy.

An Active Tenant Assignment, Support Assignment, role, membership, saved
reviewer, historical author, capability, pipeline position, or configuration
record does not create a task merely because it is called an assignment or
owner. A task may be projected only when a registered source predicate proves
that concrete human action is currently required.

The ownership boundary is permanent:

- the source owns whether the business condition exists, its typed action
  requirements, authorization, successful correction, cancellation,
  supersession, recurrence, and historical truth;
- Tasks Hub owns only the admitted shared-work identity, recipient assignment
  projection, task presentation, personal engagement, and separately allowed
  coordination facts;
- ADR-0027 notification presentation remains a distinct recipient-specific
  attention projection; read/unread is not task or source completion; and
- an executor such as Inngest owns no product fact.

One source work occurrence has one stable product identity and, when Tasks Hub
support is active, at most one shared source-backed task identity with
recipient-specific assignment and engagement projections. A recipient sees at
most one active row for the same occurrence, role, and surface even when they
can perform several compatible admitted actions. The platform must not create
independent copied tasks whose status or source detail can drift.

Assignment grants no Tenant membership, capability, Site/source visibility, or
action authority. Every list, count, detail, deep link, reassignment, and source
action re-proves its own current authorization. Proved-zero recipients creates
no guessed fallback. Partial, indeterminate, stale, contradictory, timed-out,
or over-ceiling resolution releases nobody. Source work remains discoverable
to independently authorized staff at the source.

Protected source data is referenced, not copied. Task titles and list facts are
code-owned and purpose-minimized; task storage, notifications, comments,
search, analytics, AI, exports, caches, telemetry, and workflow events never
contain protected source bodies unless a separately governed source projection
explicitly permits that exact use. Source detail is loaded only after current
authorization at the source boundary.

Source-backed tasks use **source-controlled task closure**. Tasks Hub owns no
independent Complete, Reopen, Dismiss, Suppress, Delete, drag-to-Done, bulk-
completion, keyboard, API, import, AI, support, or worker transition for such a
task. Its active state is a projection of the current registered source action
and recipient-assignment applicability. Generic task mutations must reject it
at the server boundary; hiding a checkbox is not enforcement.

Closure is evaluated at the narrowest source-action scope the source can prove,
not blindly at the whole episode. When Maria's final assigned Page action is
authoritatively satisfied or otherwise becomes inapplicable, her assignment
leaves **My tasks** even while Joel's Navigation assignment and the shared
correction episode remain active. If the source cannot prove a narrower end,
the task uses the smallest broader truthful source predicate and explains that
scope; Tasks Hub never invents a personal Done fact to conceal weak source
modeling.

Tasks Hub may present an exact source-owned action only through that action's
source contract, current authorization, required evidence, consequences, and
expected-head command. The control remains a source action, not generic task
completion, and only its authoritative source receipt changes task
applicability.

Source outcomes project to typed, truthful task history. A satisfied assigned
action is **Completed in [source]**; work canceled, superseded, withdrawn, or
otherwise inapplicable is **No longer required**; responsibility handoff is
**Reassigned**. If another authorized actor satisfies the action, presentation
may say **Completed elsewhere** without exposing identity unless independently
authorized. Access loss removes protected presentation and never fabricates
completion. A predecessor is never reopened; recurrence creates a successor
source-work identity.

D33 makes responsibility recovery a source-owned **Source responsibility
transition**, never an edit to a Tasks Hub assignee. A current recipient may
use **This needs someone else** only when the registered source contract admits
the exact operation and action scopes. Opening/searching/selecting writes
nothing; one expected-head source command re-proves the actor, selected scopes,
current source/policy/authorization heads, and any named destination's exact
current eligibility before appending the complete successor responsibility
generation and immutable receipt.

A named handoff adds or preserves one eligible successor and ends the selected
predecessor memberships as **Reassigned**. A return names no successor, ends
the actor as **Returned**, and preserves every other current responsible
recipient. Only when nobody remains does the source enter **Needs assignment**
and present **Returned for reassignment**. Proved zero, Needs assignment, and
partial/indeterminate resolution are distinct; none guesses a person, queue,
administrator, coordinator, or fallback. A return is available only when the
source can prove its current authorized recovery surface. D29 Review
coordinators are a different route purpose and are never reused by convention.

Continuing recipients retain their assignment and engagement lineage; newly
admitted recipients alone receive fresh task/unread projection. Assignment
still grants no access. Tasks Hub, Payload, browser state, comments,
notifications, AI, service tooling, and Inngest never own, select, or certify
the transition. Inngest may only materialize/reconcile identifier-only
projections after the source transaction and durable product outbox intent.

D34 permits one bounded **Return recovery context** only for an explicit
recipient return whose authoritative source post-state creates **Needs
assignment**. Named handoff and a return that leaves another responsible
recipient collect none. Website v1 admits exactly one unselected code:
`responsibility_mismatch`, `cannot_take_current_work`, or `other`; no prose,
note, default, Tenant customization, or copied protected feedback exists.

This context proves only what the actor selected. It is not the source-derived
transition reason and cannot change authorization, eligibility, target, route,
scope, priority, time, notification, automation, completion, public state,
Giving, finance, or personnel meaning. The source owns the immutable
code/version, exact gap scopes, receipt, visibility, and schedule. Tasks Hub
references the receipt and safe outcome but never stores or interprets the
context; successor tasks, notifications, workflow events, logs, search, AI,
generic exports, and person analytics contain none. Future producers such as
Mobilize register their own evidence-backed context contract and never inherit
Website meanings from task metadata.

D35 adds an always-available Website **Needs assignment lane** and an optional
Tenant policy naming one to three **Website work-recovery coordinators**. The
lane is a permission-filtered source read model over current authoritative
ownerless scopes—not a Tasks Hub queue, task assignee, shared notification,
claim, or second lifecycle. Missing policy safely resolves to code-owned
`source_lane_only@1`; named mode contains one to three unique unordered,
co-equal same-Tenant Parties. D35 adds no Site override. Current exact
Site/source authorization narrows the Tenant members for each occurrence.

The D35 route has a distinct purpose, head, immutable members, recipient role,
history, action, and audit from D21 Website review responsibility and D29
external-review follow-up. Membership grants nothing. A complete current
resolver may project personal coordinator assignments only to the qualified
subset; proved zero or any partial, stale, contradictory, timed-out, corrupt,
over-limit, or indeterminate result projects nobody and never broadcasts or
falls back. Independently authorized staff may still assign from the source
lane.

One recovery occurrence/action has at most one shared source-backed task
identity with recipient-specific assignment and engagement. Reading changes
only that recipient's engagement; source/team counts count the occurrence
once. **Assign returned Website work** is the only primary action and assigns
correction responsibility through the current source command. It does not edit,
publish, complete, cancel, claim, or satisfy correction work. Generic task
mutations reject it, and the first valid expected-head source assignment/end
receipt alone ends applicable lane and coordinator projections. D30/D34 bodies
remain protected source references. D35 creates no second bell item, email,
SMS, push, digest, reminder, date, SLA, escalation, or default channel.

Inngest may materialize or reconcile identifier-only personal projections after
the product-owned source/outbox commit. It owns no lane, route, membership,
authorization, recipient, task, engagement, source, idempotency, or human wait.
Future sources such as Mobilize may reuse only bounded route/projection
mechanics after their own evidence-backed decision; Website policy and members
never flow across source domains.

D36 makes an ordinary D35 policy save prospective from one trusted cutover and
keeps every pre-existing recovery occurrence on its explicit applied policy/
routing basis. Save and current adoption are separate commands, capabilities,
receipts, and consequences. After a successful save, an authorized actor may
use **Update current work → Review current-work impact** and one explicit
current-work policy application; nothing current changes through Save, preview,
navigation, or cancellation.

The impact is fresh, permission-safe, non-authoritative, and recomputed before
acceptance. One accepted application has an immutable product-owned header and
normalized occurrence members/results. It is one user decision but not one
unbounded transaction: every occurrence re-proves exact source, policy,
routing, authorization, action-scope, and D35 recipient heads and appends its
own differential routing successor plus identifier-only projection intent.

Continuing recipients preserve assignment and engagement, including read state;
newly admitted recipients alone receive fresh personal assignment/unread; and
removed recipients end as **Coordinator responsibility changed**, never
Completed, Read, Dismissed, correction Reassigned, Source resolved, or Access
revoked. Applying lane-only ends personal coordinator assignments while the
source lane remains. Work already governed prospectively is unchanged.

Every application member has one durable terminal result and totals conserve
the cohort. Policy supersession stops uncommitted older-target members;
committed routing remains immutable and is corrected only by a successor policy
plus another explicit application. Product keys, receipts, expected heads, and
claims own replay safety. Inngest may chunk accepted member identifiers through
the same product command but owns no cutover, cohort, preview, authorization,
result, idempotency, or source truth.

D37 defines the exact current adoption boundary as one complete compatible
pre-cutover Tenant cohort. A closed code-owned producer/version catalog and
authoritative Website occurrence/head census own membership; current actor
visibility, Sites, filters, pages, Tasks Hub rows, recipient qualification,
and client IDs never narrow it. Unknown completeness blocks acceptance. A
separate Tenant-wide current-work application capability permits only this
operation and its minimum exact complete aggregate consequence/result; it
grants no source detail, task administration, coordinator qualification, or
correction authority. Prepared evidence has no effect and atomically seals
normalized membership before D36 member claims. Tasks Hub remains a projection
through preparation, execution, failure, and repair.

D38 makes the D37 operation authority one `explicit_only` Phase 12 capability
with zero effective holders allowed. It is seeded nowhere and implied by no
Owner/Admin/staff/Web Studio/policy/Site/source/coordinator/task/support state.
A current same-Tenant `permissions.manage_grants` holder within live scope and
ceiling administers it independently of possession. Human grants bind the exact
Active Tenant Assignment; current EffectiveAccess owns deduplicated holder
truth and complete provenance.

Zero holders does not affect prospective policy, Needs assignment, source
recovery, or Tasks Hub. Granting creates no task or application. A source
revoke/expiry/assignment or applicable delegation end makes that source inert,
but stops later uncommitted D37 members only when no current D38 source
survives; it never completes, deletes, or rewrites a task or committed source
effect. The central Phase 12 People & access/My Access product—not a Website
holder roster or the current seed-backed Teams demo—owns grant UX.

D39 admits both a typed direct assignment-capability grant and a governed flat
**Access group** grant through the same Phase 12 resolver, provenance, epoch,
and floor. Every human direct grant and group membership binds the exact active
same-Tenant staff Active Tenant Assignment. Group membership is never inferred
from a task, coordinator cohort, Mobilize workflow, organizational Team, role,
title, external directory, or visible Website data, and group assignment never
fans out copied per-person grants.

A D38-bearing Access group is protected authorization state. Capability
attachment uses `permissions.manage_grants` within a live assignable-capability
ceiling; member add/activation separately uses scoped
`permissions.manage_membership` whose live protected-group ceiling covers the
complete current group bundle and revision. Ordinary Team ownership, self-add,
dynamic/nested/external membership, and an Inngest projection cannot confer
D38. Tasks Hub may later project access-review work, but task state never owns
the grant, membership, expiry, epoch, or D37 fence.

D40 permits a deliberate **separate direct grant** while current group-derived
D38 exists. The action is secondary and current-source-first; it requires a
fresh minimized reason, an explicit unpreselected independent duration, exact
current group-source-set proof, current grant authority/ceiling, and Phase 12
self/SoD/quorum controls. It reuses the typed direct relation and records an
immutable creation basis in audit/receipt evidence rather than creating a
backup-grant table or exception engine.

Creating that source changes future revocation behavior, so state, basis,
audit, receipt, and one epoch advance commit atomically even though present
ability is unchanged. If the source set changes before commit, nothing is
written. Later group loss leaves the direct grant current and creates no Tasks
Hub item, notification, reminder, D37 application, or Inngest work; only final
EffectiveAccess loss fences D37.

D43 registers each `pending_review` **Holder-initiated direct-grant review
request** as a Phase 12 source-work occurrence under this same projection
contract. The owning
`permission_change_request` aggregate—not Tasks Hub—decides whether the request
is pending, withdrawn, resolved by keeping or removing the direct source, or no
longer applicable because that source independently ended. At most one shared
source-backed task identity may represent the occurrence, with recipient-
specific projections and current-authorization checks. The task stores no
request or decision explanation, continuity history, group label, reviewer
authority, or grant snapshot; source detail is loaded from Phase 12 only after
fresh authorization.

D43 also reuses the complete permission-filtered **Access requests** source
lane, where its current heads carry the kind **Review current access**. It
remains usable without personal routing or Tasks Hub and admits actionable rows
only for a current same-Tenant `permissions.manage_grants` holder within live
scope/ceiling. D42 provenance/audit readers do not enter the lane and cannot
resolve a D43 request. Until and after personal routing, request creation,
source-lane visibility, and holder-visible status do not depend on recipient
resolution, task delivery, or notification delivery.

D44 adopts one optional Tenant-wide **Access request coordinator policy**. A
configured policy head names one to three unique, unordered, co-equal exact
current same-Tenant Active Tenant Assignments. The designation is attention
intent only: it grants no request visibility, protected detail, grant-review or
removal authority, capability, task-administration right, notification
authority/channel preference, priority, or primary/backup status. The Tenant,
coordinator assignment identities, policy head, actor, and audit attribution
are server-validated or derived. The dedicated policy operation requires a
current same-Tenant `permissions.manage_grants` holder whose live administrative
scope/ceiling covers the complete closed D43 request kind; it does not require
holding D38. Display names, roles, groups, task teams, email addresses, and
provider recipients are not coordinator identity.

A confirmed clear ends the current policy through the same preview/application
command and persists no empty configured head; pending requests remain in the
source lane while personal projections end differentially.

Every assignment admitted to a newly persisted policy head must independently
pass the closed D43 kind's current grant-decision eligibility in at least one
live Tenant scope, `permissions.manage_grants` ceiling/floor, and source-
visibility prerequisites.
A member of an older head who later loses eligibility remains auditable and is
shown to the policy administrator as **Not currently eligible**, but receives
no personal projection and cannot enter a successor head until fresh
eligibility succeeds.

For each exact current request, the source resolver intersects that configured
set with current exact-scope `permissions.manage_grants` eligibility, live
ceiling and floor, and an active compatible same-Tenant assignment. The
requester never receives personal responsibility for their own request. Known
inactive or ineligible coordinators are excluded; an incomplete or
indeterminate resolution produces no personal recipient. No configuration or
zero qualifying coordinators leaves the complete permission-filtered **Access
requests** lane as the sole responsibility path—never an original-grantor,
Owner, administrator, all-grant-manager, role-name, guessed, or broadcast
fallback. A recipient still gains no decision authority from attention, so
every protected detail and keep/remove action independently reauthorizes at
Phase 12.

A confirmed policy save first proves one fresh, permission-safe aggregate
preview over every current pending D43 recipient generation. It reveals only
authorized aggregate open-request, continuing/new/ended personal-
responsibility, and shared-lane-only counts with explicit units—not a person/
request matrix, request reasons, or protected source detail. A stale or
indeterminate policy, request, assignment,
eligibility, or aggregate head writes nothing. Confirmation differentially
applies the accepted policy to that complete current cohort through one source-
owned responsibility-application generation that pins the route revision,
eligibility basis, admission cause, and sealed child set: continuing recipients
preserve engagement; newly admitted recipients receive one exact task per
pending request but only one safe recipient/application-generation in-product
responsibility-update occurrence; and removed recipients receive no new item
and end as **Coordinator responsibility changed** without fabricated read,
completion, dismissal, request resolution, or access loss. Terminal requests
and history remain untouched. The server may stage a sealed cohort for scale,
but activation is logically all-or-nothing, uses one cutover head, and never
depends on a browser loop or exposes a mixed old/new responsibility policy.

One actionable D43 request owns one **Access-request attention occurrence** and
stable source-work identity. Request creation, an accepted policy application,
or a material current-recipient eligibility change advances an immutable,
differential recipient generation without rewriting the request. Current
assignment or authorization loss ends active protected recipient projections;
restoration never revives an ended generation but may create a fresh one after
current re-resolution. A global authorization-epoch change only triggers re-
evaluation; an unchanged canonical recipient set and responsibility meaning
preserves the generation/engagement and emits no task or notification.

For each newly opened request, every then-current eligible coordinator receives
two independent personal projections: an exact Tasks Hub assignment/engagement
and the required Phase 17 staff in-product
`holder_access_review_requested_v1` item. It uses
`presentation.source_actionable_then_recent_90d@1`, title **Access review needs
attention**, category **Access requests**, and action **Review in People &
access**. When a policy or eligibility change newly admits a coordinator to one
or more existing requests, each exact task is still created, but Phase 17
creates one `access_request_responsibility_updated_v1` item for that recipient/
responsibility-application generation with only the immutable initial assigned count and typed Access
requests link. Its immutable child request/source-end proof stays actionable
under the same policy until none remains current for that recipient; it never
creates N unread items or a subject list.

Tasks Hub is therefore not the exclusive notification mechanism. Neither
projection, and neither one's engagement state, owns responsibility, recipient
eligibility, request actionability, source end, grant state, or access. Both
notification keys deep-link to freshly authorized Phase 12 detail/lane and
provide no inline Keep/Remove action. Phase 12 maps the admitted exact
assignment through trusted current Tenant/Party/staff-role/surface identity;
Phase 17 never selects via stored profile, email, or display name and may narrow
but never widen or cross the active Tenant. Tasks Hub may derive Completed/No
longer required from a D43 terminal receipt; a notification instead ends Needs
attention and follows its Recent-history policy.

Projection intents and events carry only typed identifiers, policy/request
heads, and a code-owned safe envelope. They never copy the holder or decision
explanation, continuity history, protected provenance, grant snapshot, or
authority evidence. Protected detail loads from Phase 12 only after fresh
authorization. D45 adds one optional immediate email sibling to each exact D44
contract. The published Tenant Delivery Plan defaults Off. The
`profile.access_governance_attention@1` family selection governs both D44
`staff_email` slots atomically; mixed per-key On/Off is invalid while each
message key retains separate semantic identity and rendering. The exact
recipient's self-managed
`preference.access_request_responsibility_email@1` uses the canonical Phase 17
tuple of Tenant, Active Tenant Assignment, Party, registered role/surface,
contract family, and email channel and is `inherit | disabled`:
absence/`inherit` follows deliberate Tenant On while
`disabled` narrows it; neither value can broaden Tenant Off. Current D43/D44
source, recipient, authorization, destination/contactability, suppression,
locale/publication, sender/reply, Tenant-owned Resend, and dispatch proof must
also pass at preparation and provider submission. Any absent, stale, unknown,
or failed predicate sends no email and changes no source request, task, required
in-product item, or access. Plan/preference widening never backfills existing
work. Current Tenant Off, recipient `disabled`, source/auth/contact/suppression/
readiness loss suppresses any not-yet-submitted optional email at fire-time
reproof; provider-accepted mail cannot be recalled.

The email is generic and inert: Tenant-safe context, one descriptive
authenticated People & access link, no holder/requester identity, explanation,
capability, group/provenance, grantor, peer, raw identifier, inline decision,
secret URL, attachment, or tracking. A new request has at most one email member
per admitted recipient generation; a current-work responsibility application
has at most one grouped email member per recipient/application generation,
never one email per child request. Provider state is delivery evidence only.
D46 creates no automatic reminder while this source has no due instant, expiry,
risk transition, SLA, or other ratified temporal requirement. D47 permits a
bounded candidate to become evidence-qualified and a separately activated
Tenant profile to become that Phase 12 source policy without creating Due,
Overdue, SLA, escalation, no-response, or access
meaning; no policy or reminder is activated now. Tasks Hub therefore stores
no authoritative due/reminder field for D43 work and shows no overdue state,
reminder action, or placeholder control. A later reminder source occurrence
does not create a second task or task-owned reminder; the existing source-backed
task remains current only under its D43 action scope. Task age, engagement,
priority, assignment, or a user-entered date may never create, reschedule,
cancel, or complete the reminder. Digest and escalation remain separate future
decisions.

D48 makes the first later non-Off cadence application prospective at genuine
D43 request creation. Existing source-backed tasks and requests are unchanged
and cannot enter through task age, due/reminder fields, assignment, import,
rebuild, migration, notification engagement, or worker reconciliation. A
post-boundary request's Phase 12 source disposition—not task creation time—may
eventually permit one separately governed reminder occurrence. That occurrence
never creates, reopens, duplicates, completes, or reassigns the D43 task. D49
binds bounded attention descendants once to the exact current D44 responsibility
generation and then permits narrowing only; the existing task/current assignment
remains work truth. D50 separately supplies immutable request-anchored elapsed
eligibility and D51 supplies immediate source-fenced Off with prospective non-
Off edits/re-enable; usefulness and channel decisions remain gated.

D49 binds the possible reminder to one exact then-current D44 responsibility
generation at the Phase 12 source occurrence, not to Tasks Hub assignment. The
source atomically seals the complete unordered zero-to-three-member candidate
result with its occurrence receipt and durable handoff. Proved zero is a
terminal empty result; indeterminate releases nobody, retains the same
occurrence identity, and never falls back to a role, queue, original grantor,
administrator, or task assignee.

The D43 source-backed task remains one task whose current personal projections
continue to follow D44 responsibility. A coordinator newly admitted before the
reminder occurrence may therefore receive the ordinary task/responsibility-
update attention and also enter the reminder cohort, but the reminder creates
no second task, task reminder row, due date, assignee mutation, completion,
priority, unread reset, or engagement transfer. A later D44 route change may
add or end current task responsibility while never adding or replacing a member
in the already sealed reminder cohort. Task data, task history, and task UI are
never repair inputs for D49.
D45 adds no SMS, push, Slack, Teams, Google Chat, deadline, SLA, generic
`channels[]`, or coordinator-configured destination. Inngest may optionally
materialize or reconcile either post-commit projection, but it does not own
routing, authorization, human wait, delivery truth, or source state. If a later
source-owned reminder uses Inngest for wake-up, the task remains a projection
and the worker must claim the product occurrence and re-prove current source,
recipient, authorization, cancellation, and usefulness before any effect.

D50 makes that future source claim eligible from an immutable absolute UTC not-
before instant derived once from the D43 source-created instant plus exact
code-owned elapsed seconds. The source-created instant is captured by the
database only after D48's policy/request serialization result is proved and is
authoritative only when the source transaction commits; it is not task
`created_at`, due/reminder time, an optional physical commit timestamp, or a
browser/application/worker/provider clock. Days, if later admitted, are exact
86,400-second periods rather than civil, working, or PostgreSQL calendar-day
intervals. D44 reassignment, task edits/engagement, Tenant-zone/DST changes, and
executor delay cannot restart or move it.

Not-before eligibility is not task Due/Overdue state or a promised send time.
Early wakes do nothing; late wakes may attempt only the same product occurrence
subject to D52 usefulness and D51 cancellation rules, and D49 still binds recipients
at the actual successful source-seal commit. Tasks Hub stores no authoritative
copy, performs no age scan or repair, and creates no second task, reminder row,
date, countdown, badge, or engagement mutation. Inngest may later sleep until or
reconcile the product-owned instant but never becomes its clock or audit owner.
D50 adds no runtime/schema/UI/OpenSpec artifact now.

D51 keeps cadence Off entirely outside Tasks Hub truth. A successful Active-to-
Off source-policy publication advances a separate monotonic cancellation epoch
at one O(1) Phase 12 commit; every later reminder source/effect admission must
re-prove the epoch pinned by its D48 request. Non-Off edits do not advance that
epoch, and re-enable retains the advanced value, so existing D50 packages keep
their original timing while Off-fenced work never resumes or catches up. No
task scan, task age, assignment, due/reminder field, worker cancellation, or
task projection may create, delay, repair, or override the fence.

Off changes no D43 request or existing source-backed task. It creates no second
or cancellation task, completion, reassignment, comment, priority, unread
change, cancellation notification, email, or provider effect. A reminder item
released before Off may have its active presentation source-ended under
ADR-0027 and remain truthful history, but this neither completes nor mutates the
D43 task. Bounded projection reconciliation may lag; current source checks must
still deny any post-fence reminder admission. D51 adds no Tasks Hub runtime,
schema, OpenSpec, UI, event, worker, or telemetry artifact.

D52 keeps the bounded reminder-usefulness interval outside Tasks Hub truth as
well. One D48-admitted request pins the immutable source interval
`[not_before, useful_until)` from a complete code-owned timing profile. D49 seal
and every still-unreleased reminder descendant require a fresh trusted product-
database claim inside that interval. When the exclusive upper bound wins, the
unreleased occurrence/member closes as usefulness-expired/no-release and can
never catch up; D49 indeterminate history remains indeterminate rather than
being guessed to zero.

Expiry does not complete, reopen, reassign, prioritize, date, comment on, or
otherwise mutate the unchanged D43 source-backed task. It creates no task
reminder row, second/cancellation task, missed-reminder badge, cancellation
message, due/overdue state, countdown, catch-up action, or successor occurrence.
Task age, `remind_at`, engagement, assignment, and worker state cannot compute,
extend, or repair the source window. A reminder item released before expiry may
remain truthful presentation history under ADR-0027 and D43 actionability,
without changing task state. Inngest may wake/reconcile identifiers but does
not own expiry, idempotency, or task truth. D52 adds no Tasks Hub runtime,
schema, OpenSpec, UI, event, worker, or telemetry artifact.

D53 keeps evidence qualification and current Off entirely outside Tasks Hub.
Before an exact pair passes D47 and a later full activation generation, no task
field, reminder row, due date, badge, filter, empty state, coming-soon control,
activity entry, help link, job, or projection may represent the proposed
feature. Task age, completion, assignment, engagement, and existing reminder
fields are neither research evidence nor profile authority.

A qualifying research artifact creates only a product proposal and no task.
Even after later activation, the unchanged D43 source-backed task remains the
one work record; the profile and its eventual notification descendants cannot
complete, reopen, reprioritize, date, or duplicate it. D53 adds no Tasks Hub runtime, schema,
OpenSpec, UI, event, worker, or telemetry artifact.

D54 selects one distinct recipient-specific local reminder item in Phase 17 and
one narrow Access-review attention group; it does not create another task or add
task reminder, due, overdue, priority, recurrence, dismissal, badge, comment, or
activity semantics. Creating the reminder gives only that new item fresh unread
state. It never retimestamps, reopens, marks unread, marks read, completes,
reassigns, reprioritizes, or otherwise mutates the initial D44 item or the one
source-backed task. The group has no task identity or completion state.

The aggregate `access_request_responsibility_updated_v1` item for a newly
admitted coordinator spans one sealed set of already-pending requests and cannot
join a request-specific group. Core never manufactures hidden per-request
initial items to make grouping look complete. A recipient with no eligible
initial request child receives a complete one-child access-review group if the
later reminder is lawfully released. D43 source resolution—not read, expand,
archive, task state, or reminder state—ends the work and both applicable
attention projections.

D54 remains documentation only under D53. No task schema, task event, projection
row, OpenSpec requirement, worker, UI control, or telemetry is added now.

D55 makes one exact timing-profile revision effectively Off through a platform
safety withdrawal while preserving the Tenant's selected head. It does not
complete, reopen, cancel, reassign, reprioritize, date, comment on, duplicate, or
otherwise mutate the one still-source-backed D43 task. The request remains in
the Access requests lane and its initial D44 attention remains available; only
the optional courtesy-reminder descendants are narrowed.

Withdrawal creates no admin task, coordinator task, reminder-canceled task,
activity entry, badge, bulk cleanup, or per-Tenant fanout. Settings provides the
authorized safe explanation; Tasks Hub is neither the safety-control surface nor
its audit. A successor profile or later Tenant save never reopens old reminder
work or changes the task. D55 is documentation only and adds no task/runtime/
schema/OpenSpec/UI/event/worker/telemetry artifact now.

Generic task completion, reassignment, dismissal, deletion, comments, due
dates, reminders, bulk tools, imports, support, AI, and workers cannot mutate
the request or grant. Only the Phase 12 request withdrawal, keep/remove
decision, or source-derived no-longer-applicable result closes the source
occurrence and ends applicable projections.

The source transaction writes the immutable request event/audit/receipt and an
identifier-only projection intent atomically. A remove decision atomically
commits the exact locked grant mutation and request decision before projection.
Task and Notification Center materialization may independently fail, lag,
replay, or be rebuilt without losing the request, completing the other
projection, or changing authorization. Inngest may optionally execute delivery
and reconciliation after fire-time reauthorization, but it owns no request
state, recipient eligibility, human wait, decision, idempotency, expiry, or
revocation.

The exact subject's quiet **My access requests** source view remains independent
of task projection. Pending state may also appear inline beside the current
source; after removal or expiry makes that source disappear from current access,
the governed subject-only request history retains the safe terminal outcome.
Current-source presentation and request history never substitute for or
overwrite one another.

The current finance-owned contribution correction-request workflow is not the
D43 lifecycle or projection precedent. It copies request reason into a mutable
Mission Control task, links approval/follow-up task IDs back onto its request,
and owns reminders and escalation. The current contribution-oriented
`mission_control_tasks` service and seed-backed browser `/tasks` collection
likewise expose generic task status, assignee, completion, reopen, delete,
comment, due-date, reminder, and queue controls; the contribution Needs
Attention route is broad-role-gated rather than Phase 12 capability/purpose-
authorized. They remain migration inputs;
D43 reuses only the prospective Phase 12 `permission_change_request` concept and
this ADR's source-work projection contract.

The current staff bell at
`packages/ui/components/shadcn-studio/blocks/dropdown-notification.tsx` is
hardcoded demo presentation wired into `apps/admin/app/mc-shell.tsx`, not the
Phase 17 notification authority or D44 delivery precedent. Existing
contribution-approval notifications use contribution-owned tables/preferences
and profile/role checks; they likewise remain migration inputs rather than the
D44 request, recipient, authorization, task, or notification schema.

Core's existing Support Hub move reason is a distinct purpose-owned contract:
it records free-text conversation-routing correction history. It is not a
generic Tasks Hub reassignment reason and neither contract is reused, copied,
or synchronized by name.

An **Independent follow-up task** is a different shared-task contract. It owns
a human follow-up deliverable that can truthfully finish while its linked
source remains open, so its authorized assignee may record **Done with my
task** without clearing or hiding the source. ADR-0054 accounting follow-up and
ordinary manual tasks remain compatible with that model. Completion authority
is a closed, code-owned contract decision—not a Tenant preference, mutable task
field, source-name convention, or generic workflow rule.

Source commits write a durable, identifier-only projection intent in the same
authoritative transaction as the source occurrence. Task and notification
materialization may be asynchronous, independently retryable, and
reconcilable. Product database uniqueness, expected-head compare-and-swap,
current-state claims, and semantic receipts own idempotency and race safety.

Inngest is an optional short-lived materialization/reconciliation executor. If
selected, it uses Core's existing identifier-only event envelope, dispatch
ledger, work claims, Tenant-aware flow control, retries, dead-letter handling,
and recovery. It never parses source prose, selects recipients from event data,
stores protected bodies, waits for the human lifecycle, becomes the only
deduplication layer, or mutates source truth because a task changed. The source
and task contracts remain usable and recoverable if Inngest is unavailable or
replaced.

Website/CMS, contribution operations, Mobilize, Support, and later producers
reuse this platform contract only after each registers and proves its own
actionable predicate, permissions, safe projection, task grain, and source end.
D31 does not invent Mobilize workflows or create a Tenant-authored workflow
DSL.

## Consequences

- The current contribution task service, prototype admin Tasks collection, and
  missionary personal tasks are migration inputs, not interchangeable
  authorities. A later Tasks Hub design must converge the staff model without
  dual writing or treating demo data as source truth.
- A shared Tasks Hub can present **My tasks** across domains while preserving
  source-specific privacy, authorization, action, retention, and completion.
- Source-backed and independent follow-up tasks share one Tasks Hub but expose
  different completion controls and histories from an immutable server-resolved
  completion authority. D31 Website correction uses source-controlled closure.
- D43 holder review work is another source-controlled occurrence, reusing one
  projection contract without making a task, queue, notification, or workflow
  the permission-change request or decision.
- D44 gives a Tenant bounded personal responsibility without broadcasting
  protected access-review work. The complete source lane remains the safe
  operational fallback when configuration or current eligibility yields no
  recipient.
- Tasks Hub is not the only D44 attention surface. A new request yields both an
  exact task and required ADR-0027 staff in-product item; current-work rerouting
  preserves exact tasks but coalesces in-product attention per recipient and
  responsibility-application generation. Both keep independent engagement and
  source-owned applicability.
- Source-controlled closure operates per assigned source-action scope, so one
  person's finished work need not wait for unrelated recipients or the whole
  source episode.
- Source-backed responsibility changes use the same action grain and immutable
  differential generation model; a generic task assignee field is never
  operational responsibility.
- Named handoff, return with continuing recipients, and return into Needs
  assignment remain visibly and structurally different outcomes.
- Notification unread and task active counts may differ truthfully; the UI
  correlates them so one recipient does not see duplicate chores.
- Source-backed and manual tasks require visibly different allowed controls.
- No historical task, comment, notification, candidate, or assignment is
  backfilled into source-backed work without an authoritative source occurrence
  and deterministic identity.
- Rollout is additive: source readers and denial guards precede a single
  writer, shadow projection precedes release, and rollback stops projection
  while preserving source work and durable task records for roll-forward
  reconciliation.
- OpenSpec, design, tickets, implementation, tests, and release evidence must
  reconcile the shared task model before any Phase 24 producer activates it.

## Rejected alternatives

- **One task model per domain:** rejected because it fragments My tasks,
  authorization, audit, reporting, migration, and operations.
- **Task as business/source truth:** rejected because a generic task state
  cannot safely complete Website, Mobilize, finance, publication, or other
  source-owned work.
- **Independent completion of the same source-action assignment:** rejected
  because it creates a green personal task while the source still says that
  exact assigned action remains required. A separately defined human follow-up
  may instead use an Independent follow-up task.
- **Wait for the whole source episode:** rejected where the source can prove a
  narrower assigned action ended, because it leaves completed personal work
  inaccurately active and pressures staff toward unsafe checkbox workarounds.
- **Tenant-selectable completion mode:** rejected because ministries cannot
  redefine what Website, Mobilize, finance, publication, or provider success
  means through task settings.
- **Generic Tasks Hub assignee picker:** rejected because it makes the
  projection a responsibility writer, can assign inaccessible people, and
  bypasses source action/policy/current-head proof.
- **Administrator-only ordinary handoff:** rejected as the default because it
  adds unnecessary ministry coordination when the current recipient and exact
  destination can be source-validated; it remains available as a separately
  authorized source management path.
- **Automatic/unknown fallback:** rejected because empty/failed choice lookup
  cannot prove a recipient or a return; Needs assignment remains source-owned
  and discoverable without guessed audience.
- **Task for every named assignment or capability holder:** rejected because it
  creates noise, misleading accountability, and privacy-widening broadcasts.
- **Send each access request to every current grant manager:** rejected because
  it creates duplicate personal responsibility, churn-driven fanout,
  notification fatigue, and wider disclosure than a bounded Tenant-selected
  cohort needs.
- **Use the original grantor, Owner, administrator, role, or requester-selected
  reviewer as fallback:** rejected because none proves current exact-scope
  eligibility or deliberate responsibility and the last permits self-routing.
- **Make Tasks Hub the only access-request attention mechanism:** rejected
  because task coordination and recipient notification engagement are distinct
  platform concerns. D44 requires the ADR-0027 staff in-product notification;
  D45 adds the optional Tenant-default-Off, recipient-opt-out immediate email
  sibling described above. D46 keeps reminder runtime absent; D47 permits a
  bounded candidate to become evidence-qualified and only a separately
  activated profile to become Phase 12 source
  policy, not task time. D48 limits first application to genuinely new source
  episodes and creates no task/backfill/current-cohort path. Digest and
  escalation remain later decisions.
- **Create one unread bell item per already-pending request after a routing
  change:** rejected because a policy edit could create a notification storm.
  Exact tasks remain per request while one safe recipient/responsibility-
  application-generation item
  points to the complete authorized source lane.
- **Let coordinator designation authorize review or removal:** rejected because
  responsibility intent cannot bypass current Phase 12 capability, ceiling,
  floor, self, SoD, or quorum checks.
- **Copy protected source detail into the task:** rejected because it creates
  shadow state and incompatible retention, search, disclosure, and correction
  paths.
- **Parse reviewer prose or use AI to route work:** rejected because free text
  and optional anchors do not prove typed action or responsibility.
- **Use Inngest run state or 24-hour event deduplication as product truth:**
  rejected because transport execution is not durable business identity,
  authorization, or completion.
- **Long-running Inngest human workflow:** rejected because human work state
  belongs in Core product records and may outlive provider runs, policies, and
  authorization epochs.
- **Build a generic workflow engine in D31:** rejected because it freezes
  speculative Mobilize/CMS behavior and duplicates separately governed
  workflow direction.

## Related decisions

- [ADR-0025 — Producer-owned protected actions](./0025-producer-owned-protected-actions.md)
- [ADR-0027 — One notification presentation and engagement model](./0027-one-notification-presentation-and-engagement-model.md)
- [ADR-0029 — Reference-not-copy CMS to operational data](./0029-reference-not-copy-cms-operational.md)
- [ADR-0054 — Cause-owned accounting exceptions with shared follow-up](./0054-cause-owned-accounting-exceptions-with-shared-follow-up.md)
- [ADR-0181 — Source-authorized candidate-scoped external review](./0181-source-authorized-candidate-scoped-external-review.md)
- [Phase 24 D31 adversarial review](../prds/sitestacker-parity/phase-24-d31-source-owned-correction-attention-adversarial-review.md)
- [Phase 24 D31 primary research](../prds/sitestacker-parity/phase-24-d31-source-owned-correction-attention-primary-research.md)
- [Phase 24 D32 adversarial review](../prds/sitestacker-parity/phase-24-d32-source-backed-task-completion-adversarial-review.md)
- [Phase 24 D32 primary research](../prds/sitestacker-parity/phase-24-d32-source-backed-task-completion-primary-research.md)
- [Phase 24 D33 adversarial review](../prds/sitestacker-parity/phase-24-d33-source-validated-return-handoff-adversarial-review.md)
- [Phase 24 D33 primary research](../prds/sitestacker-parity/phase-24-d33-source-validated-return-handoff-primary-research.md)
- [Phase 24 D35 adversarial review](../prds/sitestacker-parity/phase-24-d35-shared-lane-optional-recovery-coordinators-adversarial-review.md)
- [Phase 24 D35 primary research](../prds/sitestacker-parity/phase-24-d35-shared-lane-optional-recovery-coordinators-primary-research.md)
- [Phase 24 D36 adversarial review](../prds/sitestacker-parity/phase-24-d36-prospective-save-explicit-current-work-application-adversarial-review.md)
- [Phase 24 D36 primary research](../prds/sitestacker-parity/phase-24-d36-prospective-current-work-application-primary-research.md)
- [Phase 24 D37 adversarial review](../prds/sitestacker-parity/phase-24-d37-complete-tenant-current-work-cohort-adversarial-review.md)
- [Phase 24 D37 primary research](../prds/sitestacker-parity/phase-24-d37-complete-tenant-current-work-cohort-primary-research.md)
- [Phase 24 D38 adversarial review](../prds/sitestacker-parity/phase-24-d38-explicit-tenant-capability-grant-adversarial-review.md)
- [Phase 24 D38 primary research](../prds/sitestacker-parity/phase-24-d38-explicit-tenant-capability-grant-primary-research.md)
- [Phase 24 D39 adversarial review](../prds/sitestacker-parity/phase-24-d39-direct-and-governed-group-capability-assignment-adversarial-review.md)
- [Phase 24 D39 primary research](../prds/sitestacker-parity/phase-24-d39-direct-and-group-capability-assignment-primary-research.md)
- [Phase 24 D40 adversarial review](../prds/sitestacker-parity/phase-24-d40-deliberate-continuity-direct-grant-adversarial-review.md)
- [Phase 24 D40 primary research](../prds/sitestacker-parity/phase-24-d40-deliberate-continuity-direct-grant-primary-research.md)
- [Phase 24 D41 adversarial review](../prds/sitestacker-parity/phase-24-d41-current-direct-source-historical-provenance-adversarial-review.md)
- [Phase 24 D41 primary research](../prds/sitestacker-parity/phase-24-d41-current-direct-source-historical-provenance-primary-research.md)
- [Phase 24 D42 adversarial review](../prds/sitestacker-parity/phase-24-d42-purpose-tiered-continuity-provenance-adversarial-review.md)
- [Phase 24 D42 primary research](../prds/sitestacker-parity/phase-24-d42-purpose-tiered-continuity-provenance-primary-research.md)
- [Phase 24 D43 adversarial review](../prds/sitestacker-parity/phase-24-d43-governed-holder-access-review-adversarial-review.md)
- [Phase 24 D43 primary research](../prds/sitestacker-parity/phase-24-d43-governed-holder-access-review-primary-research.md)
- [Phase 24 D44 adversarial review](../prds/sitestacker-parity/phase-24-d44-access-request-coordinator-routing-adversarial-review.md)
- [Phase 24 D44 primary research](../prds/sitestacker-parity/phase-24-d44-access-request-coordinator-routing-primary-research.md)
- [Phase 24 D45 adversarial review](../prds/sitestacker-parity/phase-24-d45-optional-initial-email-adversarial-review.md)
- [Phase 24 D45 primary research](../prds/sitestacker-parity/phase-24-d45-optional-initial-email-primary-research.md)
- [Phase 24 D46 adversarial review](../prds/sitestacker-parity/phase-24-d46-no-automatic-reminder-adversarial-review.md)
- [Phase 24 D46 primary research](../prds/sitestacker-parity/phase-24-d46-no-automatic-reminder-primary-research.md)
- [Phase 24 D47 adversarial review](../prds/sitestacker-parity/phase-24-d47-bounded-tenant-reminder-cadence-adversarial-review.md)
- [Phase 24 D47 primary research](../prds/sitestacker-parity/phase-24-d47-bounded-tenant-reminder-cadence-primary-research.md)
- [Phase 24 D48 adversarial review](../prds/sitestacker-parity/phase-24-d48-new-request-only-cadence-application-adversarial-review.md)
- [Phase 24 D48 primary research](../prds/sitestacker-parity/phase-24-d48-new-request-only-cadence-application-primary-research.md)
- [Phase 24 D49 adversarial review](../prds/sitestacker-parity/phase-24-d49-current-recipient-cohort-adversarial-review.md)
- [Phase 24 D49 primary research](../prds/sitestacker-parity/phase-24-d49-current-recipient-cohort-primary-research.md)
- [Phase 24 D50 adversarial review](../prds/sitestacker-parity/phase-24-d50-request-anchored-elapsed-clock-adversarial-review.md)
- [Phase 24 D50 primary research](../prds/sitestacker-parity/phase-24-d50-request-anchored-elapsed-clock-primary-research.md)
- [Phase 24 D51 adversarial review](../prds/sitestacker-parity/phase-24-d51-immediate-irreversible-narrowing-adversarial-review.md)
- [Phase 24 D51 primary research](../prds/sitestacker-parity/phase-24-d51-immediate-irreversible-narrowing-primary-research.md)
- [Phase 24 D52 adversarial review](../prds/sitestacker-parity/phase-24-d52-bounded-usefulness-window-adversarial-review.md)
- [Phase 24 D52 primary research](../prds/sitestacker-parity/phase-24-d52-bounded-usefulness-window-primary-research.md)
- [Phase 24 D53 adversarial review](../prds/sitestacker-parity/phase-24-d53-evidence-admitted-complete-timing-profile-adversarial-review.md)
- [Phase 24 D53 primary research](../prds/sitestacker-parity/phase-24-d53-evidence-admitted-complete-timing-profile-primary-research.md)
- [Phase 24 D54 adversarial review](../prds/sitestacker-parity/phase-24-d54-distinct-grouped-reminder-presentation-adversarial-review.md)
- [Phase 24 D54 primary research](../prds/sitestacker-parity/phase-24-d54-distinct-grouped-reminder-presentation-primary-research.md)
- [Phase 24 D55 adversarial review](../prds/sitestacker-parity/phase-24-d55-monotonic-profile-safety-fence-adversarial-review.md)
- [Phase 24 D55 primary research](../prds/sitestacker-parity/phase-24-d55-monotonic-profile-safety-fence-primary-research.md)
- [ADR-0184 — Direct and governed group capability assignment](./0184-direct-and-governed-group-capability-assignment.md)
