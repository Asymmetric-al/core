# ADR-0184: Direct and governed-group capability assignment

**Status:** Accepted (founder rulings, Phase 24 Grill session — D39–D55,
2026-08-29)

## Context

Phase 24 D38 makes **Apply Website recovery settings to current work** a narrow,
Tenant-scoped, `explicit_only` Phase 12 capability. It is seeded nowhere, may
have zero effective holders, and is not implied by Owner, administrator, staff,
Content/Web Studio, policy edit, Site/source access, coordinator, task, support,
or service status. D39 must decide how a Tenant deliberately assigns that
capability without creating a Website-local authorization system.

Small ministries may need one recurring operator, for whom a direct assignment
is the clearest path. Larger ministries may have a stable operations function,
for which repeating the same grant person by person creates drift and
offboarding burden. Requiring every Tenant to create a group for one person is
equally artificial. Mature authorization systems therefore support both
specific assignment and governed group assignment, provided both resolve
through one effective-access model and every surviving path is explainable.

Core's current `/mc/admin/teams` surface is not that model. It is a seed-backed
prototype with one display-name-linked `team` string per member, local
None/View/Manage/Admin controls, and no authoritative grant mutation. Reusing it
would conflate organizational teams, access groups, role labels, and task teams;
it would also make multiple group paths, immutable identity, provenance, and
truthful revocation impossible.

There is a further privilege-escalation risk. Attaching a capability to a group
is one grant operation, but adding or activating a member later can confer the
same capability. A generic group-membership editor therefore cannot be allowed
to widen a protected group merely because another administrator previously
attached its capabilities. Membership mutation must remain a first-class
authorization mutation with a current scope and live administrative ceiling.

D40 addresses the converse continuity problem. A person may already receive
D38 through a group but need to retain that one responsibility through an
upcoming group change. A second direct source changes no present capability yet
changes what survives later. Treating that as an ordinary grant hides privilege
persistence; prohibiting it makes a legitimate staged handoff brittle.

D41 addresses what happens after that overlap ends. Current access must remain
plain and immediately understandable without erasing the immutable reason the
direct source was created. Turning history into a new current state would create
authorization drift; making current access depend on history would make an
operational explanation failure an authorization-UX failure.

D42 addresses who may read that history. The group label and free-text business
reason can reveal staffing, Member Care, security, location, or ministry context
even though D38 requires reason helper text to prohibit protected details. The
subject needs enough transparency to flag unexpected access; a membership
manager needs only the result of the pending source change; a grant reviewer
needs remediation evidence; and a security auditor may need the complete chain.
Treating those as one administrator audience would violate Phase 12's purpose
floor and physical-safety posture.

Current code is not the permanent reader: the generic GraphQL `auditLogs` query
admits admin/staff/super-admin roles, and the current `audit_logs` RLS policy
admits any same-Tenant staff membership or `is_super_admin()`. Neither implements
My Access, D42 field minimization, a registered purpose, or a separate audit-read
capability. D42 therefore cannot reuse or describe those paths as authority;
they remain evidence of the MVP posture Phase 12 must retire.

## Decision

Core permits `explicit_only` capabilities through exactly two Phase 12 grant
sources when the capability's registry metadata admits both:

1. an **assignment capability grant** bound directly to one exact active
   same-Tenant Active Tenant Assignment; and
2. an **access-group capability grant** attached to one compatible, flat,
   same-Tenant Access group whose membership rows bind exact Active Tenant
   Assignments.

The direct source is stored as a typed `assignment_capability_grants` contract.
It is not a record-scoped `named_person_grant`. The latter remains the Phase
10/12 contract for access to one protected record or bounded object scope and
retains its own grantor-departure and scope semantics. Using separate types
prevents a Tenant-wide operation assignment from silently inheriting restricted-
record lifecycle rules or vice versa.

Both D39 sources feed the same Phase 12 `resolveProjection` union, floor,
`EffectiveAccess`, governance epoch, expiry, audit, explanation, and revocation
model. Neither source has precedence. An Active Tenant Assignment holding the
same capability directly and through one or more groups has one effective
capability with multiple provenance paths. Removing one path never claims that
access ended while another current path survives.

An access-group grant remains one group-to-capability relationship. It does not
fan out authoritative direct grants to current members. Any per-principal cache
or materialization is derived, disposable, asynchronous, and never the source
of authorization. Current and later members receive the capability only while
their exact assignment, membership, group grant, delegation, expiry, floor, and
governance epoch all remain current.

D38-compatible Access groups are flat, same-Tenant, staff-assignment-only,
non-nested, non-dynamic, non-external, and non-service. D39 creates and seeds no
Website Operations group. A Tenant may deliberately attach D38 to an existing
compatible Access group whose documented purpose fits the responsibility or
create an ordinary governed Access group; Core never infers one from a role,
job title, organizational team, coordinator cohort, task assignment, or current
holder set.

Grant and membership administration remain separate:

- `permissions.manage_grants` within current Tenant scope and live grant-
  administration ceiling attaches or removes a capability on an assignment or
  Access group;
- scoped `permissions.manage_membership` adds, activates, expires, or removes
  one exact Active Tenant Assignment from an Access group; and
- every widening membership mutation re-resolves the group's complete current
  capability set and proves that the actor's live administrative ceiling may
  confer all of it. A delegated membership manager whose ceiling does not cover
  D38 cannot add or activate members after D38 is attached, although a properly
  scoped narrowing removal remains available.

A group is **protected** when its current bundle contains an `explicit_only`,
sensitive, restricted, permission-management, or other registry-classified
high-impact capability. Creating any self-benefiting source path—adding or
activating oneself, or attaching a capability to a group in which the actor is
already a member—uses Phase 12's existing self-grant, separation-of-duties, and
quorum-aware control even when the actor already has the capability through a
different path. This prevents a redundant path from becoming a persistence
backdoor after later revocation.

D40 permits one deliberate **separate direct grant** when an exact current
Active Tenant Assignment already has D38 through at least one current group path
and has no current direct D38 source. It is the same typed assignment-capability
relation, not an exception table or another permission kind. The server derives
an immutable continuity creation context and records the exact current group-
source identities and reviewed source-set head as audit/receipt evidence. Those
sources prove the review context only; the new direct source has no cascading or
live dependency on them and remains independently governed if they later end.

The person-access view presents **Add separate direct grant** only as a
secondary action after showing every current group source. Review says that the
person's current abilities will not change and that the direct source will
survive later group loss. It requires a fresh concise reason and an explicit,
unpreselected independent duration choice—**Ends on…** or **Until removed**—and
copies nothing from group reason, duration, grantor, or provenance. The ordinary
grant action never auto-creates, recommends, preselects, or silently converts
this source.

Review and commit re-prove current group-derived EffectiveAccess, absence of a
current direct edge, subject eligibility, grant authority/ceiling, self/quorum
rules, and the exact direct and group source-set heads. If every group path or
the reviewed set changes before commit, the command conflicts and returns the
current state; it never silently falls back to an ordinary direct grant or
restores access under a review that said abilities were unchanged.

Creating the direct source commits one authorization-epoch advance even though
the current capability set is unchanged, because the authorization graph and
future removal result changed. Durable audit and receipt distinguish **source
added; current abilities unchanged** from a newly gained capability. Exact
semantic replay returns that receipt; changed intent, target, reason, duration,
or reviewed source set conflicts.

Ending any direct, group-capability, or membership path makes only that path
inert. D37 fences later uncommitted effects only when current post-change
EffectiveAccess no longer contains D38. Removing one path while another survives
never reports final loss, stops the application, or transfers its authorship.

Every direct grant, group-capability mutation, and group-membership mutation
uses the one expected-head, semantic-idempotent, advisory-locked grant-state
boundary. Tenant, actor, assignment, group, capability, delegation, timestamps,
and audit attribution are server-derived. The authoritative mutation commits
state, one monotonic Tenant governance-epoch advance, durable audit, and receipt
atomically or not at all. Assignment end, suspension, membership or grant
expiry, group archive, revocation, or applicable delegation loss makes the path
inert without deleting history or attaching it to a recreated assignment.

The permanent product experience lives in Mission Control **People & access**
with distinct **People** and **Access groups** concepts, plus **My Access** for a
person's own explanation. It does not reuse the current seed-backed Teams &
Users mutation model. Canonical user-facing provenance says **Direct grant** in
administration, **Granted directly to you** in My Access, and **Through [Access
group]** for group-derived access. **Added for continuity** is provenance, not a
second permission or effective state. Technical audit retains the typed source
identities.

Person detail presents one deduplicated capability row with every current path,
duration, and state. Group detail presents the group's purpose, membership
governance, additional permissions, and current/future-member consequence.
Grant, membership, revoke, archive, and delete reviews compute the current post-
change delta: who gains, who already has another path, who loses the final path,
and who retains access. A D40 success says the separate source was added, that
current abilities did not change, and how long the source remains. Later group
removal explicitly says the direct source survives. No flow silently removes,
converts, or renews another source.

D41 separates current access from historical creation provenance. After the
last current group path ends, the ordinary administration summary derives
**Direct grant** from current EffectiveAccess and its current source heads; My
Access derives **Granted directly to you**. Duration remains adjacent semantic
text. No **Continuity exception** badge, warning treatment, conversion state,
timer, worker, direct-grant mutation, extra governance-epoch advance, extra
audit event, task, notification, or email is created merely to reflect that
overlap ended. The authoritative event that ended the group path retains its
normal governance and audit effects.

Authorized expanded provenance retains **Added for continuity** and the
immutable creation basis and history. Administration uses **Why this person has
access**; My Access uses **Why you have access**. The current direct source stays
visible and usable if history or provenance loading is unavailable; the
expanded section shows a scoped, recoverable error and never substitutes audit
history for current authority. If a group path later becomes current again, the
ordinary summary shows both current sources while continuity origin remains
historical.

D42 admits exactly four server-derived, surface-bound provenance purposes:

1. `access.self_explanation` permits the exact current subject, through My
   Access and the exact Active Tenant Assignment, to see **Added for continuity
   · [date]** and the fixed explanation **Direct access was added so your access
   could continue if group access changed.** It exposes no historical group identity/label, reason, actor,
   authority/delegation, basis, receipt, other member, or protected detail.
2. `access.membership_change_review` permits a current
   `permissions.manage_membership` holder for the exact group/action to see only
   the current surviving direct source and end condition needed to understand
   the consequence. It exposes no D40 historical origin or governance reason.
3. `access.grant_governance` permits a current `permissions.manage_grants`
   holder in the exact grant-administration scope/ceiling, or a separately
   authorized Phase 12 access reviewer, to see the minimized continuity origin,
   creation/terminal facts, floor-minimized business reason, remediation
   context, and only the event-time group summary the same Phase 12 floor/
   clearance projection admits; when the label is withheld, the exact UI text
   is **Protected access group**. It exposes no complete actor/authority/
   delegation chain, receipt payload, raw identifiers, other members, or
   unrestricted chronology.
4. `access.security_audit` requires the distinct current
   `permissions.audit.read` capability, registered audit purpose, exact Tenant
   and scope, and every applicable floor/clearance/residency check. It alone may
   return the complete typed basis, event-time and current-safe group context,
   actual/acting actors, authority/delegation, receipt, and terminal chronology.
   Governed export additionally requires current `permissions.audit.export`
   under the same purpose, Tenant/scope, floor, and clearance. A group label withheld by the floor is still rendered
   **Protected access group**, never a raw ID or inferred name. Each such read/
   export writes content-minimized durable audit-of-audit evidence and never
   copies protected reason text into logs.

`permissions.audit.export` is `explicit_only`, zero by default, and seeded
nowhere. The Read-only Auditor seed carries `permissions.audit.read` only;
read never implies bulk-copy authority, and export never widens the audit
projection's fields.

The route purpose selects one projection; a person with several capabilities
does not receive their union in one response. Wrong-Tenant, wrong-assignment,
wrong-purpose, stale, downgraded, or unauthorized reads return the uniform not-
found result. Browser roles receive no raw basis/audit relation. Current/history
caches bind exact viewer, purpose, Tenant, assignment, and epoch/provenance
version, and a stale response cannot cross a purpose boundary.

Website operators, Tasks Hub, notifications, ordinary search/reporting/
analytics, AI, ordinary service/NHI, donors, missionaries, and public surfaces
receive no continuity-history field. AI authority is a ceiling, not an
entitlement; D42 registers no AI purpose for these fields. A worker or Inngest
function may execute an exact already-authorized audit export only after fire-
time reauthorization through the same projection and may not widen its fields.
Support, impersonation, `super_admin`, and service role create no shortcut. A
platform operator may use the complete audit projection only through an
explicit, purpose-bound, time-boxed Operator Tenant Grant that includes
`permissions.audit.read` and passes the same floor; viewing My Access while
impersonating receives only the self-explanation projection.

D43 adds **Ask for an access review** as a quiet secondary action beside one
exact current D40 direct source in My Access. It expands an inline one-field
form—never a modal, nested sheet, or new workflow page—that keeps the current
source and end condition visible and states **Someone authorized to manage
access will decide whether to keep or remove this direct access. Sending this
request will not change your access.** Submission requires one fresh, bounded
Unicode plain-text explanation labeled **Why should this access be reviewed?**
with plain-language guidance not to include sensitive personal, ministry, care,
or location detail. The explanation is request evidence, not a task
description, notification body, permission fact, personnel signal, or AI
prompt.

The inline form uses Core's shared Base Maia card/disclosure treatment and Base
UI controls. Its persistent label, helper, count/limit, validation, pending
state, and server error are programmatically associated; keyboard and screen-
reader order follows the visible order; status/receipt changes are announced
without a toast-only dependency; and failure preserves the entered explanation
without implying a request exists. On success the compact current-source card
states **Review requested. Your access has not changed.** with submitted time
and **Withdraw request**; current access remains visually primary. Mobile/zoom/
RTL/CJK layouts reflow to one column without a fixed drawer, horizontal
scrolling, hover-only content, or motion required for meaning.

My Access also contains one quiet subject-only **My access requests** section,
sourced from the same Phase 12 request aggregate and its governed retention.
Pending state may appear both inline beside its still-current source and in this
history. Once removal or expiry makes the reviewed source disappear from
current access, the safe terminal outcome remains in My access requests only
while that exact Active Tenant Assignment stays current and retention permits.
Assignment end removes the subject view; a recreated assignment never inherits
it, while governed administrative/audit history follows its own retention. The
section never keeps a dead grant in current access, reconstructs protected
provenance, or becomes task, reviewer, or authorization truth.

D43 reuses Phase 12's existing `permission_change_request` plus decision
aggregate as a typed holder-initiated direct-grant-review episode; it creates no
D40 exception table, Website workflow, or parallel grant engine. Creation
re-proves the authenticated subject, exact current Active Tenant Assignment,
exact current direct-grant identity and head, D40 continuity origin, Tenant,
the route-bound registered self-review-request purpose, floor, and request
head. Purpose, Tenant, subject, assignment, grant, requester, actor, and audit
attribution are server-derived and cannot be supplied or retargeted by the
caller. One exact current direct source has at most one `pending_review` holder
request. Exact semantic replay returns the original receipt; a changed reason
while one request is `pending_review` returns that current request rather than
creating a sibling. The immutable request, first event, audit evidence, and
identifier-only projection intent commit atomically. Request creation changes
no grant, EffectiveAccess, capability, epoch, expiry, group, D37 application,
or D42 history.

The closed request-kind registry fixes D43's fields and transitions. Its source
is a Tenant-composite foreign key to the exact assignment-capability grant, not
an opaque JSON payload, polymorphic `source_type/source_id`, URL, display name,
task link, or provider identifier. Common request mechanics may be reused, but
unknown kinds and invalid kind/state/field combinations fail closed rather than
falling through a generic workflow interpreter.

The exact state registry is `pending_review`, `withdrawn`, `resolved_kept`,
`resolved_removed`, and `no_longer_applicable`; subject-facing labels are
**Review requested**, **Withdrawn**, **Direct access kept**, **Direct access
removed**, and **Direct access ended before review**. A pending subject may use
**Withdraw request**; withdrawal changes no access. Submitted reasons and
terminal decisions are never edited or deleted in ordinary UX. Correction is
withdraw-and-submit-successor, provided the exact grant is still current. An
expected-head comparison makes subject withdrawal, reviewer decision, external
revocation/expiry, and duplicate submission converge to one terminal result;
the losing command refreshes that result and never overwrites it.

Only after current exact grant-decision authority passes may the review surface
compose D43's request projection with D42's `access.grant_governance` read
projection to show the requester's explanation, current direct/group sources,
independent end condition, and freshly computed post-remove consequence. D42's
separately authorized read-only reviewer or audit paths alone expose neither the
D43 request nor a decision action. The Access requests lane, task-recipient
eligibility, and both decision commands require a current same-Tenant
`permissions.manage_grants` holder within the exact live scope and assignable-
capability ceiling plus every Phase 12 self/SoD/quorum safeguard. It offers only
**Keep direct access** and **Remove direct access**. Keep requires one new concise
plain-language explanation written for the requester and carrying the same
sensitive-detail guidance, then appends the terminal request decision without
changing authority or advancing the epoch. Remove does not require duplicate
decision prose: its reviewed consequence and durable receipt state exactly
which source ended and whether access remains. Remove calls the one locked
Phase 12 grant-state mutation and atomically ends the exact direct source,
appends the request decision and grant/audit evidence, advances the Tenant epoch
once, emits the receipt, and writes identifier-only projection intent. A stale
grant/request/source/consequence/authority head writes neither a decision nor a
grant change. The receipt states separately whether EffectiveAccess ended or
remains through other current sources; removal never claims all access ended
merely because the requested direct source ended.

The holder sees only their request status, their submitted explanation, the
holder-safe keep explanation or remove/source-end receipt, decision time, and
truthful current access consequence;
reviewer identity, protected groups, internal authority/delegation, other
holders, and raw audit evidence remain governed by D42 and the Phase 12 floor.
An independently ended source makes the request inapplicable immediately from
source truth; later projection reconciliation creates no authorization event or
extra epoch. A terminal request may have a successor episode, but history never
reopens or mutates the predecessor.

Every `pending_review` episode is a registered ADR-0183 source-work occurrence. The Phase
12 request aggregate owns actionability, status, decision, and closure; Tasks
Hub may materialize at most one shared source-backed task identity with
recipient-specific projections, and generic Complete, Reopen, Reassign,
Dismiss, Delete, comment, due-date, bulk, import, AI, support, or worker
mutations cannot decide or close it. The exact source decision, withdrawal, or
no-longer-applicable result closes its projections. Safe task list data is
code-owned and contains no request/decision explanation or continuity history;
detail loads from Phase 12 after fresh authorization. Request truth and holder
status remain available if task materialization fails or no reviewer is routed.

Phase 12 also exposes one complete permission-filtered **Access requests**
source lane; D43 `pending_review` episodes appear under the kind **Review
current access**. It admits actionable rows only for the same current exact
`permissions.manage_grants` scope/ceiling. The lane is authoritative and usable
without Tasks Hub or a personal route, but the row or task still grants no
authority; every detail and decision reauthorizes independently.
Its counts and membership come from current Phase 12 request heads, never task
rows, notifications, eligible-recipient counts, the viewer's current page, or a
worker scan.

D44 adopts one optional Tenant-wide **Access request coordinator policy**. A
configured head names one to three unique, unordered, co-equal exact current
same-Tenant Active Tenant Assignments. Designation is attention intent only:
it grants no capability, request visibility/detail, decision or removal
authority, task-administration right, notification authority, priority,
primary/backup order, or source ownership. The dedicated coordinator-policy
operation requires a current same-Tenant `permissions.manage_grants` holder
whose live administrative scope/ceiling covers the complete closed D43 request
kind; it does not require holding D38. The command validates or derives the
Tenant, assignment identities, current head, actor, and audit evidence; a client
cannot submit display names, roles, groups, emails, provider recipients, bare
people, cross-Tenant assignments, duplicates, or an empty configured head.

A confirmed zero-selection is an explicit audited clear-policy command using
the same aggregate preview/application; it stores no empty head, preserves the
source lane, and ends personal projections differentially.

Every assignment entering a newly persisted policy head must independently
pass the closed D43 kind's current grant-decision eligibility in at least one
live Tenant scope, `permissions.manage_grants` ceiling/floor, and source-
visibility prerequisites.
A member of an older head who later loses eligibility remains auditable and is
shown to the policy administrator as **Not currently eligible**, but receives
no personal projection and cannot be carried into a successor head until fresh
eligibility succeeds.

For each current `pending_review` episode, Phase 12 intersects the configured
set with current exact-scope `permissions.manage_grants`, live ceiling and
floor, compatible Active Tenant Assignment, and D43 source visibility. The
requester's principal and subject assignment never receive personal
responsibility for their own request. Known inactive, ended, incompatible, or
ineligible coordinators are excluded; incomplete, stale, or indeterminate
resolution yields no personal recipient. No configuration or zero eligible
coordinators leaves the complete **Access requests** source lane as the sole
responsibility path. Core never guesses or broadcasts to the original grantor,
Owner, administrator, every grant manager, a role, a group, or a requester-
selected reviewer. Read-only D42 access reviewers and audit readers never count
as D44 recipients.

A confirmed policy save first produces one fresh, permission-safe aggregate
preview over all current pending D43 responsibility generations. It reveals
only authorized aggregate open-request, continuing/new/ended personal-
responsibility, and shared-lane-only counts with explicit units—no person/
request matrix, request reason, or protected source detail. Any stale request,
policy, assignment, eligibility, or
aggregate head, or any indeterminate result, writes nothing. Confirmation
applies the policy to that complete current cohort as one idempotent source
operation and responsibility-application generation that pins route revision,
eligibility/authorization basis, admission cause, and sealed child set:
continuing recipients preserve engagement; newly admitted
recipients alone receive fresh personal attention; and removed recipients end
as **Coordinator responsibility changed** without fabricated read, dismissal,
completion, request resolution, or access loss. Terminal requests/history are
untouched. The server may stage a sealed cohort for scale, but activation is
logically all-or-nothing under one cutover head, never a browser loop or mixed
old/new responsibility state; requests committed after cutover use the new
policy. Current assignment or authorization loss ends active protected
attention. Later restoration never revives an ended generation but may admit a
fresh differential generation. A global authorization-epoch change only
triggers re-evaluation; if the canonical effective recipient set and
responsibility meaning are unchanged, the current generation/engagement remain
and no task or notification is emitted.

One actionable request owns one **Access-request attention occurrence**, stable
source-work identity, and immutable differential recipient generations. Each
new request opened under a configured policy creates one ADR-0183 source-backed task and one required
Phase 17 staff in-product `holder_access_review_requested_v1` item for every
then-current eligible coordinator. The item uses
`presentation.source_actionable_then_recent_90d@1`, title **Access review needs
attention**, category **Access requests**, and action **Review in People &
access**.

When a policy or eligibility change newly admits one coordinator to one or more
already-pending requests, Core creates an individual task for every exact
request but only one required recipient/responsibility-application-generation
in-product occurrence,
`access_request_responsibility_updated_v1`, with the immutable initial assigned
count and typed Access requests link. Its immutable source child membership/end
proof stays actionable under the same presentation policy until none of those
exact requests remains current for that recipient. It creates no subject list
and no unread item per child request. Continuing recipients receive no fresh
item; removed recipients receive none and end active presentation as
**Coordinator responsibility changed**.

Tasks Hub is not the only notification mechanism. Neither task/notification
projection, its engagement, nor coordinator designation owns responsibility,
recipient eligibility, request actionability, source end, grant state, or
access. Both notification keys provide typed authenticated links to Phase 12
detail/lane and no inline Keep/Remove action. Phase 12 maps the admitted exact
assignment through trusted current Tenant/Party/staff-role/surface identity;
Phase 17 never selects via stored profile, email, or display name and may narrow
but never widen or cross the active Tenant. A task may present source-controlled
Completed/No longer required after a D43 terminal receipt; the notification
instead ends Needs attention and follows its Recent-history policy.

The source transaction and projection events carry only exact typed
identifiers, request/policy heads, and a code-owned safe envelope. Holder and
decision explanations, continuity history, capability, protected provenance,
grant snapshots, and authority evidence remain in Phase 12 and are loaded only
after fresh authorization; they are never copied into task, notification,
search, analytics, logs, AI, provider, or event storage. D45 adds one optional
immediate email sibling to each exact D44 contract; the published Tenant plan
defaults Off. One `profile.access_governance_attention@1` family selection
governs both D44 `staff_email` slots atomically; mixed per-key On/Off is invalid
while each message key retains separate semantic identity and rendering. The exact self-managed
`preference.access_request_responsibility_email@1` uses the canonical Phase 17
tuple of Tenant, Active Tenant Assignment, Party, registered role/surface,
contract family, and email channel and is `inherit | disabled`:
absence/`inherit` follows deliberate Tenant
On, `disabled` narrows it, and neither broadens Tenant Off. A future email
exists only when the code-owned contract, published Tenant plan, that preference, current
D43/D44 source and recipient authorization, server-resolved contact revision,
suppression floor, locale/publication, sender/reply posture, Tenant-owned Resend
readiness, and fire-time dispatch proof all pass. Every layer may narrow and
none grants or preserves authority. Any missing or failed predicate leaves the
source lane, Tasks Hub, and required in-product item intact. Plan/preference
widening is future-only and never creates catch-up mail; current narrowing
suppresses any not-yet-submitted optional email at fire-time reproof without
claiming to retract provider-accepted mail.

Email carries only generic safe copy and a descriptive authenticated Phase 12
link. It has no protected request/grant fact, inline Keep/Remove action,
secret-bearing URL, tracking, or task/source mutation. A route application may
produce at most one grouped email per newly admitted recipient/application
generation, not one per pending request. D46 creates no automatic reminder
while the D43 source has no due instant, expiry, risk transition, SLA, or other
ratified temporal requirement. D47 permits a bounded timing-pair candidate to
become evidence-qualified and a separately activated Tenant profile to become
a Phase 12 source policy, default Off, for
at most one courtesy occurrence without deadline or access meaning; it does not
activate or choose one now.
A future reminder may be admitted only as a separately
ratified Phase 12 source occurrence with durable semantic identity, exact
current EffectiveAccess and recipient-generation proof, cancellation/
supersession, and late-usefulness rules. Direct/group provenance, Tasks Hub
state, notification age, and D45 email delivery may never start or preserve it.
Digests and escalations remain later decisions. D45 adds no SMS, push, Slack,
Teams, Google Chat, generic channel array, deadline, SLA, or coordinator-
configured channel.
Inngest
may optionally materialize/reconcile either post-commit
projection after fire-time reauthorization; it owns no request, routing,
responsibility, notification truth, human wait, grant, decision, idempotency,
expiry, or revocation. A later reminder worker may only wake and attempt to
claim the product-owned occurrence; it must re-resolve current same-Tenant
source, EffectiveAccess, recipient, cancellation, and usefulness before any
presentation or dispatch.

The future cadence policy is not a capability grant, group, role, D44
coordinator-policy member, EffectiveAccess input, or evidence that a person is
responsible. Only a current same-Tenant actor independently authorized for the
Tenant-wide `permissions.manage_grants` administration purpose may eventually
publish an expected-head successor; Owner/Administrator/coordinator labels,
recipient status, group membership, task assignment, and System Messages
authority alone grant nothing. Every occurrence-time recipient and action still
re-resolves current EffectiveAccess and D44 eligibility. D47 adds no relation,
grant, policy row, preset, schedule, or UI today.

D48 fixes the first non-Off cadence application as a Phase 12 source-ordered
cutover, not a timestamp cohort. The first successful policy publication and
D43 request creation must share one stable Tenant/policy serialization
namespace even before an optional policy row exists. Only a genuine request
creation ordered after that boundary may atomically retain its cadence
admission disposition with the request, immutable receipt, audit, and safe
identifier-only handoff. Exact committed replay preserves the original result;
a later genuine successor episode is evaluated at its own source creation.

Ordinary policy absence/Off is expected no-admission. A stale concurrent read
conflicts and receives bounded whole-command retry. If an asserted active
generation has corrupt, unsupported, incomplete, or contradictory optional
cadence proof, the valid D43 request still commits with typed safe non-admission
and minimized operations evidence; optional courtesy behavior cannot strand My
Access. No pre-boundary request can enter through age, current policy join,
route change, task/notification state, restore, migration, worker, support, or
an Apply-current path. D48 changes no grant, EffectiveAccess, request state,
decision, task, or recipient. D49 recipient binding, D50 request-anchored
elapsed eligibility, and D51 Off/edit/re-enable behavior are now separately
resolved; D52 now supplies the independent finite late-usefulness ceiling.

D49 resolves the one possible reminder recipient cohort from the exact current
D44 **responsibility generation for that request**, never from the raw Tenant
coordinator roster. At the Phase 12 source occurrence, one trusted source
command must re-prove the exact current D43 request/head, D48 admission and
policy inputs, D44 route/application/responsibility-generation head, governance
epoch, requester exclusion, and every member's same-Tenant Active Tenant
Assignment plus exact scope/ceiling/floor decision authority. On complete proof,
it atomically seals the one durable occurrence slot with the canonical unordered zero-to-three-member set,
each member's exact D44 recipient-generation identity plus Active Tenant
Assignment, count/digest, immutable receipt/audit, and identifier-only handoff. A concurrent
D44 change and D49 bind must yield the complete old or complete new generation,
never a mixture or a worker-time answer. The shared serialization namespace or
equivalent predicate must exist when the optional D44 policy/generation row is
absent: first coordinator configuration racing the occurrence resolves either
as D49-first terminal proved zero or D44-first complete members. Locking only a
missing optional row is insufficient. Permanent occurrence uniqueness excludes
the D44 route/recipient generation, member count, policy revision, task/item,
channel, provider, executor, and retry identities, so none can mint a second
occurrence.

Complete proof of no eligible member seals a terminal proved-zero cohort.
Partial, stale, timed-out, contradictory, corrupt, over-limit, or otherwise
indeterminate proof leaves the same occurrence identity unreleased and appends
immutable attempt evidence without a member/handoff release; it is not a closed
recipient disposition. A retry
may transition that one unresolved occurrence to sealed members or sealed
proved zero until the separately governed source/usefulness fence ends it. It
cannot guess zero, choose a subset, fall back, or create a later occurrence.
Once a member set is sealed, every later source/presentation/provider boundary
may only narrow it monotonically. Definite assignment, authorization, source,
or requester-exclusion loss terminally suppresses that member from every
remaining effect for this occurrence; restored eligibility or a recreated
assignment never adds the member back. A continuing member remains eligible
only through a proved gap-free D44 responsibility-continuation chain from the
sealed recipient generation; remove-then-readd is a new generation and cannot
revive the member. A channel-specific consent, destination,
readiness, or suppression result may terminally narrow only that channel member
and cannot alter the source cohort or another channel. An indeterminate check is
not definite removal and releases nothing until the same sealed member can be
proved or the occurrence ends.

Human cadence-policy publication and automatic occurrence authority remain
separate. The former uses the D44-governed human `permissions.manage_grants`
policy-management command. The D49 bind is a registered system/source command
caused only by an admitted current request and later ratified source-time fact;
it derives Tenant, policy/request/responsibility heads, system attribution, and
semantic command identity from trusted product context and neither requires nor
fabricates a human policy-manager actor. Every recipient read/action still
re-proves that human's current exact D43 authority.

Sealed membership is historical occurrence evidence, not EffectiveAccess,
decision authority, continuing visibility, or a notification/task assignment.
Every source action and read still derives current authorization. Ordinary
recipient views disclose no peer cohort, protected D43 body, capability,
provenance, or denial reason. Browser base writes remain revoked; same-Tenant
composite keys, forced/equivalent RLS, matching mutation `USING` and
`WITH CHECK`, restrictive history deletion, and service-role/owner/worker/
support parity apply to any future occurrence/member persistence. D49 creates
no capability, relation, key, job, channel, or UI today.

D50 makes the one possible occurrence eligible from one immutable request-
anchored elapsed-time fact. After the successful D43 source-creation transaction
crosses D48's shared policy/request serialization fence and proves the winning
non-Off policy, it must capture one fresh trusted database-derived source-created
instant exactly once at the authoritative request write, exact
admitted code-owned duration identity/revision, bounded whole elapsed seconds,
and the resulting finite absolute UTC not-before instant as one immutable
source receipt. “Source-creation commit” is the authoritative business
transaction and not PostgreSQL physical commit time, an earlier transaction-
start time, a generic `created_at`, or
client/application/worker/task/notification/provider time. Exact replay returns
the original evidence and instant; later policy, time-zone, route, recipient,
task, executor, restore, or deployment changes never recompute them.

Elapsed days, if later admitted and shown, are exactly 86,400 seconds each.
Calendar-day or month interval fields, session/Tenant zones, DST, weekends,
holidays, business calendars, and tzdb changes cannot participate. A source
claim can begin only at the inclusive boundary where a fresh trusted database
instant is at or after the immutable not-before instant. An early wake does
nothing. A late wake attempts only the same occurrence and remains subject to
the D52 usefulness interval and D51 cancellation fence. D49 seals the complete current D44
generation at its actual successful source-seal commit, which may follow the
not-before instant; the candidate instant never snapshots recipients.

The source-created, eligibility, claim/wake, D49 seal, presentation, provider-
submission, and delivery-evidence instants are distinct facts. Phase 12 and a
product-owned claim/outbox remain authoritative; Inngest may later execute a
durable wake or reconciliation but may not supply the clock, rewrite the
instant, own uniqueness/cancellation, or treat a sleep/run result as the
business occurrence. D50 creates no duration value, policy row, field, key,
channel, job, schedule, OpenSpec requirement, migration, UI, or telemetry
artifact. D51 now settles Off/edit/re-enable cancellation; later decisions must
settle late usefulness, exact choices, and channels before activation.

D51 makes an Active-to-Off publication an immediate, irreversible source
narrowing without pretending to recall distributed effects. Policy head and
cancellation are related but not identical: every successful policy save
appends an immutable revision and advances the expected
Tenant/environment/policy-kind head, while only a successful Active-to-Off
transition advances a separate monotonic cancellation epoch. Exact retry and an
already-Off no-op preserve the existing epoch. Non-Off edits and re-enable keep
the advanced epoch and apply only to genuine D43 source creations ordered after
their boundary under D48's shared serialization, so old D50 packages neither
recalculate nor accidentally cancel on an interval edit,
and work fenced by Off can never resume, catch up, or mint another occurrence.

D48 admission pins the current cancellation epoch. D49 seal, in-product
release, external preparation/decryption, and external submission-attempt admission re-prove that
pin against the current epoch under an absent-row-safe stable serialization
namespace. Off-first denies every later irreversible admission from the old
epoch. Seal-first preserves source history but not permission for a later
descendant. Irreversible-admission-first preserves the exact truthful effect and
evidence even if it becomes visible or resolves after Off. The Off transaction
is O(1) in request count—policy revision, epoch, audit/receipt, and identifier-
only outbox intent—not a current-work census, lock, count, or row-by-row fanout.
Projection cleanup may lag, replay, or rebuild but cannot permit a post-fence
admission.

Each descendant requires one registered channel-specific product-owned
irreversible-effect admission. For in-product attention, that boundary is the
atomic role-safe presentation release that makes the item queryable, not a
human read. A released reminder may
retain immutable history while ADR-0027 ends active/unread reminder presentation
from the source fence without fabricating read or dismissal. For an external
email effect under the currently governed model, the boundary is the Phase 6
provider-submission attempt fence committed before the first byte can leave
Asym, not provider acceptance. Work in canonical dispatch phase **Prepared
definitely unsubmitted** is suppressible. Once attempt admission wins, dispatch
phase is permanently **Submission may have begun**; the independent provider
outcome remains exactly **None**, **Accepted**, **Definitely rejected**, or
**Indeterminate** as evidence permits. Off permits reconciliation/webhook evidence reduction but
no further provider call, same-key follow-up, new attempt, blind resend, or
claim of recall. Any future push, Slack, Teams, Google Chat, or other step must
separately register and prove its own admission/finality/recovery boundary and
cannot inherit email assumptions or introduce a generic cancellation engine.

The D51 policy command changes no D43 request, grant, EffectiveAccess, holder
decision, D44 responsibility, access, or ADR-0183 task and creates no second or
cancellation task, task mutation, cancellation notification, bell item, unread
reset, email, chat, or provider message. A future complete policy editor keeps
Off as a local draft in the D44/D47-governed future route-addressable Base Maia
Access requests settings form, then
shows one inline consequence review with **Turn off courtesy reminders** and
**Cancel**. It truthfully says Asym stops every pending reminder it can still
prevent, earlier in-product reminder history may remain, a reminder already
being sent may still arrive, re-enable applies only to new access review
requests, and requests/tasks/access do not change. There is no instant toggle,
autosave, nested modal, typed phrase,
checkbox ritual, current-work count/list, recipient disclosure, or second
confirmation.

D51 is a documentation decision only. It adds no runtime, schema, OpenSpec,
policy row, epoch field, migration, key, channel, event, workflow, telemetry, or
UI artifact. D52 separately settles useful-lateness expiry and terminal ending
for otherwise-current unresolved work when no Off or independent source-
terminal fence has won.

D52 now settles that otherwise-current late-usefulness case with one immutable
source-owned half-open interval. Every later activated code-owned timing
profile pairs positive finite whole-second `wait_for_seconds` and
`useful_for_seconds`. In the same successful D43 source-creation transaction,
D48/D50 pin the profile identity/revision and both values and derive finite UTC
`not_before` and `useful_until` facts. D49 seal and every still-unreleased
member/channel irreversible admission capture a fresh trusted primary-database
claim after locks and require `not_before <= claim_instant < useful_until`, the
matching D51 epoch, current D43 actionability, the sealed D49 member, and every
current assignment, authorization, privacy, consent, destination, readiness,
suppression, and channel fence. Equality at the upper bound is expired.

Expiry terminally closes unresolved work without release, replacement, or
catch-up. D49 indeterminate remains historically indeterminate rather than
being relabeled proved zero; sealed zero remains zero. A cohort sealed before
expiry remains immutable evidence, while each unreleased descendant independently
expires. A local item released in time follows ADR-0027 and D43 source
actionability; D52 is not a presentation-retention deadline. Email still
**Prepared definitely unsubmitted** at expiry is suppressed. A pre-expiry
**Submission may have begun** attempt's one admitted initial provider call may
start, finish, or reconcile afterward only as the immediate bounded continuation
of the same pre-I/O critical section with its envelope already prepared; a
stalled/restarted process makes no call or retry. Its independent provider
outcome remains, but no new attempt, follow-up call, replacement,
rekey, resend, or recall claim may begin after expiry. Future provider TTL can
only narrow delivery and never owns or extends source usefulness.

The future editor adds no separate grace-period field, custom duration, expiry
countdown, Due/Overdue or missed badge, task date, catch-up action, provider
status, or recipient failure noise. Each visible cadence card is one complete
profile and says **If Asym cannot create the reminder soon enough, it skips it
instead of sending it late.** D42-authorized audit may disclose localized
source-created, eligible, useful-until, sealed, terminal-skip, release, and
provider evidence. D52 changes no D43 request, grant, EffectiveAccess, D44
responsibility, task, access, read state, or historical effect and creates no
second task, notification, successor occurrence, digest, escalation, or unread
reset. Inngest may wake/reconcile identifiers but owns no clock, transition,
terminal result, uniqueness, idempotency, or audit fact.

D52 is documentation only: no profile/value, runtime, schema, migration,
OpenSpec, message key, plan, channel, provider request, event, workflow,
telemetry, or UI artifact is added. D53 and D47's representative-evidence gate
must admit exact complete timing pairs before activation.

D53 now makes current Off an absence contract rather than an Off row or hidden
feature. Until an exact complete pair passes D47 and a separate full activation
package, Core has no cadence registry value, policy row, API, event, key, plan,
job, flag, telemetry, setting, route, disabled option, empty state, help link,
beta badge, or “coming soon” artifact. The complete Access requests lane, D44
task/initial attention, and D45 initial-email posture remain the entire current
experience.

D53 reuses D47's preregistered representative gate and existing repository/
product-governance review. It adds no product evidence table, research workflow,
approval service, committee permission, recurring recertification, analytics
system, or live experiment. Each exact `(wait_for_seconds,
useful_for_seconds)` pair independently proves behavior against the full D46
baseline, comprehension, fatigue/fairness/harm, accessibility/localization,
international/mobile/low-bandwidth use, omission-versus-staleness, and D48–D52
technical feasibility. Evidence for one pair cannot qualify another; changed
seconds, research protocol version, or material semantic/interaction meaning
require a new proposal. Meaning-preserving editorial, accessibility, and
localization corrections do not.

Passing evidence yields a privacy-minimized, version-controlled **evidence-
qualified timing-pair proposal** only. The proposal becomes an immutable
selectable **activated access-review timing profile** only after founder/
product ratification and one later activation package closes stable meaning,
content, D54 presentation, channels, Phase 12/17/6 authorization and data
contracts, OpenSpec, concurrency/idempotency, migration/mixed-version, load,
kill/repair, tests, and release evidence. No evidence result, merge, provider,
worker, or flag independently activates it.

Future policy writes accept only a fully activated profile identity/revision;
the server resolves its exact seconds. Callers, Tenants, imports, support,
workers, providers, experiments, and data rows cannot author or rewrite the
pair. Research never becomes runtime input. An activated pair is immutable;
contrary evidence requires a new reviewed narrowing/withdrawal decision and
cannot rewrite pinned history. A later temporary rollout/kill control may only
narrow an already activated feature and must have an owner/removal rule; D53
creates none now.

Ordinary profile retirement blocks new policy selection/reselection only. A
Tenant whose current selected head references it continues prospective D43
source admission until a deliberate policy change. D55 now makes urgent safety
withdrawal a terminal exact-profile platform fence that preserves the selected
head while effective cadence becomes Off. D56 must still settle its authority/
evidence-review contract; no profile may activate before that closes.

Before activation, no reminder UI appears. After at least one profile is fully
activated, the D44/D47-governed future route-addressable **People & access →
Access requests → Settings** surface may add one compact Base Maia vertical
radio fieldset containing only the Tenant's current effective Off choice—whether
represented by absence or an explicit later policy revision—plus activated
profiles; it does not require a seeded placeholder. Unqualified/unsupported/experimental options
are absent. A retired profile is absent from new choices and new selection APIs
but remains truthfully visible in a separate read-only **Current setting**
summary outside the selectable radio choices wherever the Tenant's policy head
still references it. One profile is one plain choice; usefulness is not another control. The
persistent helper states that this creates one courtesy reminder only while the
request is waiting, sets no due date or access change, and skips work that can no
longer be created soon enough. An available, collapsed-by-default **How timing
works** disclosure renders the selected pair in plain language—**Eligible after
[wait]; if it cannot be created within the next [usefulness], it is skipped**—
without internal field names. D48 future-only, D51 Off consequences, explicit
Save/Cancel, expected-head receipt/recovery, accessibility, localization,
mobile, and low-bandwidth rules remain mandatory. D53 creates no UI now.

D54 selects one future required in-product reminder descendant for every still-
qualified member of the exact D49 sealed cohort. It is a distinct recipient-
specific Phase 17 item whose stable protected meaning is only that the exact
current access review is still waiting at its admitted courtesy point. It is not
a resend, deadline, escalation, no-response finding, awareness claim, access
change, request decision, task mutation, or reissued initial notification. The
future activation package—not D54—must assign/register its stable key and exact
reminder-specific source-end rule; no key is named or reserved now.

At release, trusted server code atomically re-proves the D43 `pending_review`
head, D48 admission, exact D49 member and uninterrupted D44 responsibility
continuation, D51 epoch, D52 half-open usefulness interval, current same-Tenant
assignment/Party/role/surface authorization and privacy/source visibility,
semantic uniqueness, and valid Phase 17 group attachment. Product-database
uniqueness binds the durable reminder occurrence and sealed member. Duplicate
replay returns the same child; changed immutable meaning conflicts. A failed
projection/group attachment publishes no orphan and can repair only that same
effect while every gate remains current.

The item and an eligible matching `holder_access_review_requested_v1` child use
one deterministic, rebuildable **Access-review attention group** for the same
Tenant, exact D43 request episode, recipient, role/surface/privacy boundary, and
uninterrupted D44 responsibility lineage. The multi-request
`access_request_responsibility_updated_v1` aggregate never joins. If a late-
admitted or re-admitted coordinator has no eligible initial child, Core presents
the reminder as a complete one-child group; it never fabricates, clones, revives,
or backfills an initial request item.

Each child keeps independent immutable occurrence, applicability, engagement,
and history. Only the reminder receives fresh unread state; older child state and
timestamps remain unchanged. The group owns no read, archive, source, task, or
access state. Its badge contribution is the Boolean OR of currently authorized
visible unread children and at most one. Needs-attention membership derives from
current actionable children. Expanding, scrolling, sorting, or receiving a
realtime invalidation marks nothing read. Any explicit group engagement action
must resolve to item-level idempotent expected-set writes so a concurrent new
child is not silently cleared.

The future item uses ordinary **Attention** and
`presentation.source_actionable_then_recent_90d@1`; safe list content is
**Access review is still waiting**, **Access requests**, and **Review this
request in People & access.** It exposes no holder/requester identity, reason,
capability, grant/group/provenance, authority evidence, decision, member-care,
location, or ministry detail. One typed authenticated action opens the current
request after fresh authorization; no inline Keep/Remove, task controls, avatar,
urgency styling, due/overdue copy, sound, focus theft, or guaranteed-delivery
language is permitted.

D43 resolution ends each applicable child's active presentation under its own
source rule. D51 Off after release may end only the reminder child's active/
unread contribution; it does not alter the initial child, request, grant,
EffectiveAccess, D44 responsibility, or task. D52 bounds first release only and
does not shorten truthful released history. Authorization/assignment loss
removes active and recent reads immediately; later restoration never revives an
old recipient projection.

D54 reuses Phase 17 grouping and current Base Maia/Base UI primitives rather
than adding notification threads, a group-engagement table, generic grouping
rules, a custom keyboard widget, or another notification/task system. Visual
and programmatic grouping/order must match under keyboard, screen reader, forced
colors, zoom/reflow, text spacing, reduced motion, localization/RTL/CJK, mobile,
time-zone display, and low-bandwidth tests. Current hardcoded bell demo content
and contribution reminder code are migration inputs, not design/data authority.

D45's `profile.access_governance_attention@1` governs only its two initial-email
slots and is not inherited. The D54 local descendant is required; every reminder
external step remains absent/not-applicable until separately admitted and proved.
D54 is documentation only and adds no runtime, schema/RLS migration, OpenSpec,
key, manifest/census row, plan, step, renderer, preference, route, worker,
telemetry, or UI. Counts remain unchanged under D53.

D55 adopts one irreversible platform safety withdrawal for one exact activated
timing-profile identity/revision. It is distinct from ordinary retirement,
Tenant Off, D51's Tenant cancellation epoch, rollout/kill flags, provider pause,
and incident workflow. Ordinary retirement stops new selection but preserves a
current head's execution; safety withdrawal permanently makes that revision
unavailable and non-executable everywhere. It can only narrow. It never grants
authority, selects a fallback, rewrites timing, clears itself, or becomes a
generic override facility.

The Tenant's **Selected access-review timing-policy head** remains the exact
Tenant-authored head. A separate derived **Effective access-review cadence
disposition** applies the safety withdrawal and is Off whenever that head
references the withdrawn revision. The platform writes no Off successor, edits
no Tenant row, impersonates no Tenant actor, and performs no Tenant census or
fanout. A successor—even with the same elapsed pair—must be a separately
evidenced/activated profile revision that fixes the safety cause, and each
Tenant must deliberately select it. Neither a successor nor changed evidence
revives old D43 episodes or descendants.

Tenant policy commands compare and mutate the selected head, never the derived
effective result. Therefore a deliberate Save from a withdrawn selected profile
to Off is a real Active-to-Off Tenant policy transition and advances D51's
cancellation epoch even though the safety floor already made behavior
effectively Off. Selecting an available successor uses the ordinary expected-
head, prospective-only non-Off rule. Neither action can be collapsed into a
no-op because “effective was already Off.”

The withdrawal is one immutable, append-only, platform-scoped decision keyed to
the exact profile revision, with a server-derived accountable actor/initiator,
trusted database effective instant, stable safe reason class, restricted
evidence reference/digest, decision/contract revision, and durable idempotency.
Duplicate replay returns the same decision; changed target, reason/evidence, or
authority conflicts. Update, clear, delete, retarget, import, support edit,
feature-flag actuation, worker inference, and Tenant/browser write are forbidden.
The exact authorized-human/assurance and evidence-review rule is D56's separate
pre-activation decision; D55 does not smuggle in an unreviewed operator role.

Every new selection/reselection API and every D43 admission, D49 seal, local
release, and external irreversible-effect boundary must prove the exact profile
revision is not withdrawn using current trusted product state. Missing,
unreadable, malformed, stale, unknown-revision, or mixed-version-unsupported
safety proof fails closed for the optional reminder only; the D43 request,
Access requests lane, initial D44 attention, and one source-backed task remain
available. The product database owns the result. Client/cache, Realtime,
Inngest, provider, feature-flag, support, and process memory may only invalidate,
execute, or narrow and can never authorize.

Fence-versus-selection and fence-versus-D43 races have two safe serial results.
Fence-first rejects a withdrawn choice or records the request's safe reminder
non-admission. Selection/admission-first may preserve the selected/pinned
profile, but the newly committed fence makes it effectively Off and blocks D49
and every descendant that has not crossed its registered irreversible boundary.
The save/read receipt returns both selected and effective truth; it never claims
the withdrawn choice is active merely because its Tenant write committed first.
No retry, later cache refresh, restore, successor, or fence-reader repair may
catch up that old work.

For already admitted work, the fence is monotonic narrowing. Uncommitted D49
seal and every unreleased local/external member terminally close under a stable
safety-withdrawn/no-release reason without being relabeled D49 proved zero, D52
expired, D51 Tenant Off, or request-resolved. A released local reminder ends
active/unread contribution under ADR-0027 and may retain only its authorized
generic non-unread Recent/audit history while its decoder/renderer/privacy
contract remains safe; a shared presentation defect uses its own Phase 17
containment and is not inferred from the timing fence. Initial D44 attention and
the unchanged request/task/access remain. External work still **Prepared definitely
unsubmitted** is suppressed. If **Submission may have begun** committed first,
the one already admitted frozen call may complete/reconcile under D51/D52's
existing ambiguity rule, but D55 permits no new call, retry, rekey, fallback,
replacement, follow-up, or recall claim.

Before withdrawal, the ordinary Tenant editor shows only selectable activated
profiles. After withdrawal, a Tenant whose selected head references it sees one
read-only **Current setting** summary outside the radio choices: **Selected:
[profile label]**, **Status: Unavailable for safety**, **Effective: Off**, and
**Courtesy reminders are off. Existing access requests, tasks, and access are
unchanged. This setting will not restart.** The withdrawn profile is absent from
choices and save APIs. A secondary **Choose a new setting** action opens the
ordinary Off/available-profile fieldset with no replacement preselected and Save
disabled until the authorized user deliberately chooses. Cancel leaves the
preserved head unchanged. There is no auto-save, forced replacement, blocking
modal, countdown, incident detail, internal “fence/head/revision” jargon,
disabled radio, mass notification/task/banner, or claim that previously
submitted mail was recalled.

The summary and Save result expose selected and effective facts in visible text
and programmatic structure, keep errors/status near the fieldset, preserve focus,
and remain complete under keyboard, screen reader, forced colors, 320-CSS-pixel/
400-percent reflow, text spacing, localization/RTL/CJK, mobile, and low bandwidth.
Tenant-visible safe cause is separate from restricted evidence, actor, incident,
affected-Tenant counts, and person-level research. D42-governed audit may expose
the exact decision evidence to an independently authorized purpose.

Future persistence must deny Tenant/browser mutation; use exact profile-
revision relationships, uniqueness, restrictive deletion, least grants, a
single trusted command, and privileged-path parity. Tenant-facing reads use a
safe derived projection and never expose the platform base relation or incident
existence beyond the Tenant's own selected revision. No allowed update can move
or clear a withdrawal, because withdrawal is append-only and terminal. An O(1)
withdrawal commit precedes asynchronous projection cleanup; every authoritative
query/effect gate still enforces it before cleanup.

D55 is documentation only. Current Core has no D43–D55 cadence profile,
withdrawal row, policy/effective resolver, API, capability, key, manifest/census
entry, plan/step, schema/RLS, OpenSpec requirement, route, UI, flag, worker,
telemetry, or automatic trigger. The Eve automation kill-switch implementation
is a separate bounded-context precedent for persisted restrictive state, audit,
and fail-closed consultation—not a reusable table, JSON flag, capability, or
control surface. Its current service-role RPC accepts actor/initiator metadata as
parameters, so it is specifically not D55's trusted attribution boundary. Counts
remain unchanged under D53.

The future human cadence-policy publication path uses D44-governed Phase 12
`permissions.manage_grants` policy-management authority and current same-Tenant
Active Tenant Assignment; the automatic D49 source bind does not. D48/D49 create
no capability. The current broad MVP staff capability map and
Mission Control shell role gate are migration inputs, not authorization
precedent. Tenant, actor, policy head, ordering, disposition, and attribution
remain server-derived; any expected D43 source/request head is a checked
concurrency precondition only.

D43 request and decision reads/writes remain exact-Tenant, exact-assignment,
purpose-bound server operations behind revoked browser base relations, forced
coarse Tenant RLS, composite Tenant-aware relationships, and the same
service-role/`BYPASSRLS` parity as every Phase 12 grant command. `USING` and
`WITH CHECK` both prevent cross-Tenant or subject/grant retargeting. D44
policy/member/application/recipient-generation relations inherit
the same browser revocation, forced RLS, Tenant-composite assignment/request
keys, `USING`/`WITH CHECK`, and privileged-path parity; no allowed mutation can
move one across Tenant, assignment, policy, request, or recipient. Request and
decision explanations inherit Phase 12 access-governance retention, hold,
disposition, export, audit-read, residency, classification, and redaction
policy. They are excluded from task rows, notifications, search snippets,
analytics, telemetry, logs, workflow payloads, embeddings, and ordinary AI.
No inferred request is backfilled from an existing grant or history row.

The current contribution `contribution_correction_requests` implementation is
a finance-owned action-approval workflow, not D43's schema or lifecycle
precedent: it stores contribution payload and reason, links mutable approval/
follow-up task IDs, copies reason into a task description, and owns reminder/
escalation behavior. The current contribution-oriented
`mission_control_tasks` service and seed-backed browser `/tasks` collection are
also not D43 infrastructure: their generic mutable assignee, Complete/Reopen,
Dismiss/Delete, comment, due-date, reminder, and queue controls conflict with
source-controlled closure, and the current contribution Needs Attention route
uses broad roles rather than exact Phase 12 capability/purpose proof. D43 reuses only the prospective Phase 12
`permission_change_request` concept and ADR-0183 projection boundary; no
current runtime path implements D43 or D44.

The current staff bell at
`packages/ui/components/shadcn-studio/blocks/dropdown-notification.tsx` is
hardcoded demo content (`8 New`, fake avatars, and fake actions) wired into
`apps/admin/app/mc-shell.tsx`; it is not the Phase 17 notification authority or
D44 UX/data precedent. Existing contribution-approval notifications use
contribution-domain tables/preferences and profile/role checks and are likewise
migration inputs, not the D44 source, recipient, authorization, or delivery
model.

The UI uses Core's shared Base Maia primitives, semantic tokens, responsive
stacked layouts, durable receipts, and accessible focus/status behavior. It does
not hide D38 in a generic module rung, create a wide permission matrix, nest a
grant modal inside the prototype Team sheet, or state that deleting a group
revokes access for everyone when other paths may survive.

D44 adds no new top-level navigation, dashboard, or dedicated Responsibility
tab. People & access → Access requests (or its established settings area)
shows a compact **Access request coordinators** summary and **Change
coordinators** action. That action opens one route-addressable Base Maia Sheet
with the explanation **Choose up to three people to receive personal attention
for access requests. They must already be allowed to manage the access being
reviewed. If nobody qualifies, requests remain available in Access requests.**
The chooser lists only independently eligible current assignments, treats
selections as unordered removable rows/chips, and keeps later-ineligible
members visible as **Not currently eligible**. The same Sheet presents the
fresh complete current-request consequence preview and confirmation without a
nested modal. Inline errors, persistent success, keyboard/focus/status
semantics, one-column mobile/zoom reflow, RTL/CJK wrapping, and low-bandwidth
retry use existing Core patterns; no color, hover, motion, toast, or wide matrix
is required to understand or complete the flow.

Asym Postgres and the Phase 12 authorization service own groups, memberships,
grants, requests, the D44 coordinator policy/application and recipient
generations, epochs, audit, and effective-access inputs. Website owns D35 policy
and D37 application truth. UI collections, caches, Tasks Hub, notifications,
Payload, Realtime, analytics, workers, and Inngest are projections or executors;
none may decide, delay, copy, or repair authorization by inventing a holder or
recipient.

## Consequences

- Small Tenants can grant one person without group ceremony; larger Tenants can
  administer a stable job function without repetitive direct-grant drift.
- Supporting both sources adds provenance and consequence-preview work, but it
  does not add another resolver, permission engine, or Website-owned table.
- Access groups must be modeled independently from organizational and task
  teams and support zero-to-many immutable assignment memberships.
- Group capability attachment can narrow which delegated membership managers
  may later widen membership. The grant review must disclose that consequence;
  absence of a delegated widener does not create an implicit fallback grant.
- The model safely represents and explains overlapping direct/group paths. D40
  permits deliberate continuity creation only through the secondary reviewed
  flow; holder counts
  deduplicate current Active Tenant Assignments after every source, expiry,
  floor, assignment, delegation, and epoch rule is evaluated.
- D41 adds no grant state. It derives a quiet current source label from current
  Phase 12 truth and keeps continuity origin in purpose-scoped expanded
  provenance.
  Loss of audit-history availability cannot hide or disable current direct
  access.
- D42 gives each journey only the historical fields needed for its exact
  purpose. Grant administration does not imply full audit retrieval, and
  possession of D38 does not imply another person's provenance.
- D43 gives the exact holder a safe correction path without granting self-
  revocation or creating a second authorization source. The request and
  decision reuse Phase 12's existing permission-change aggregate; source-backed
  Tasks Hub presentation reuses ADR-0183 and remains replaceable.
- D44 gives each Tenant a bounded optional personal-attention cohort without
  making a coordinator an access role or broadcasting protected review work.
  The complete source lane remains safe and usable when nobody is configured or
  currently eligible.
- Newly admitted coordinators receive both Tasks Hub responsibility and Phase
  17 staff in-product attention. Current-work rerouting coalesces the bell
  update per recipient/responsibility-application generation while preserving
  one task per request.
- The seeded Read-only Auditor bundle carries `permissions.audit.read` within
  scope, but its name never authorizes and the capability never bypasses the
  Phase 12 floor or clearance.
- Group rename is presentation-only. Archive/delete is an authorization
  mutation with truthful effective-access consequences and retained history.
- D38 remains optional and zero-holder-safe. D39 creates no required holder,
  seeded group, unread item, notification, email, reminder, recurring task,
  holder cap, or automatic access request.
- Inngest may reconcile D43/D44's derived task and notification projections,
  but request truth, recipient responsibility, expiry, decision, and revocation
  are effective from current Phase 12 product state without waiting for a
  workflow run.
- D52 bounds every possible courtesy-reminder admission with one immutable
  source interval, preventing both exact-instant fragility and stale outage
  catch-up while leaving already released truthful presentation/history under
  its own source-applicability lifecycle.
- D53 makes evidence qualification an offline release gate rather than product
  state. Tenants see no nonexistent/disabled feature, and the future editor can
  stay one small fieldset containing only truthful selectable choices.
- D54 creates honest fresh local attention without duplicate work: a new item
  may reopen one narrow request group, while older engagement, the D44 aggregate,
  and the one source-backed task remain unchanged.
- D55 preserves Tenant policy authorship while one terminal exact-profile safety
  disposition makes the effective cadence Off and blocks every not-yet-
  irreversible descendant without mass writes or catch-up.
- OpenSpec, schema/RLS, API commands, UI, tests, tickets, and release evidence
  must implement the same typed sources, protected-group ceiling, provenance,
  continuity context, causal-revocation rules, D42 viewer/purpose disclosure,
  D43 holder request/decision boundary, and D44 coordinator/task/in-product
  attention and D45 initial-email boundary before activation of the D38–D45
  runtime described here. D46's negative contract and D47–D52's admission,
  source-order, recipient, elapsed-clock, cancellation, and usefulness
  invariants must also hold; any later reminder requires its own future
  activation package.

## Rejected alternatives

- **Direct assignment only:** rejected because stable larger teams would repeat
  the same grant and offboarding work person by person and accumulate drift.
- **Governed group only:** rejected because it forces a one-person or two-person
  ministry to create an artificial group for one operator.
- **Automatic or seeded Website Operations group:** rejected because a default
  group would create implied authority and noisy administration.
- **Reuse the current Teams & Users model:** rejected because it is seed-backed,
  display-name-linked, single-team, and not authorization truth.
- **Copy group access into one direct grant per member:** rejected because it
  creates partial-failure, concurrency, scale, lifecycle, and provenance debt.
- **Use `named_person_grant` for direct Tenant capability assignment:** rejected
  because record-scoped grants and Tenant operation assignments have different
  scope and lifecycle invariants and must remain type-distinct.
- **Let any group editor add members after a protected capability is attached:**
  rejected because membership would become an indirect privilege-escalation
  path around grant scope, ceiling, and self-grant controls.
- **Nested, dynamic, external, cross-Tenant, or service membership:** rejected
  for D38 because current and future effective holders would become difficult or
  impossible to preview, constrain, and revoke causally.
- **Silently replace, merge, copy, or remove an existing source:** rejected
  because it rewrites administrator intent and provenance.
- **Prohibit every redundant direct source:** rejected because a staged
  responsibility handoff can otherwise require brittle cross-authority timing
  or an avoidable access gap.
- **Use the ordinary direct-grant flow for overlap:** rejected because it hides
  that current abilities remain unchanged while future source survival changes.
- **Create a continuity table, role, workflow, task, or Inngest process:**
  rejected because the same typed direct relation and locked Phase 12 mutation
  already own the required fact.
- **Keep a prominent continuity badge after overlap ends:** rejected because it
  turns historical creation context into noisy, stigmatizing current status and
  obscures the current source and duration.
- **Automatically convert or relabel the grant when the last group path ends:**
  rejected because current source labels are projections, while a conversion
  would fabricate a lifecycle mutation, epoch, and audit event.
- **Hide or discard continuity origin after overlap ends:** rejected because it
  would erase the administrator's reviewed reason for creating a persistent
  path and make later access review less trustworthy.
- **Show full history to the subject or every manager:** rejected because a
  former group, business reason, actors, and delegation can expose staffing or
  ministry context unrelated to the viewer's current action.
- **Reserve every origin field for security audit:** rejected because it denies
  the subject a safe explanation and makes routine grant remediation depend on
  a specialist or raw audit access.
- **Use role names, generic `auditLogs`, or raw audit-table access as D42
  authority:** rejected because those current MVP paths lack the required
  capability, purpose, field minimization, and physical-safety floor.
- **Union projections for a multi-capability viewer:** rejected because the
  requested surface purpose—not the largest role or union of held powers—must
  decide which fields are disclosed.
- **Website-local roles, grants, rosters, approvals, or access reviews:**
  rejected because Phase 12 already owns those cross-product authorization
  concerns.
- **Immediate holder self-revocation:** rejected because viewing or possessing
  a grant does not imply authority to mutate it, and an accidental revoke can
  interrupt work or interact unexpectedly with surviving sources.
- **Treat a Tasks Hub row, generic ticket, email, or support case as the review
  request:** rejected because delivery/coordination state would become a second,
  lossy authority for an access-governance lifecycle.
- **Create a new continuity-review workflow or request table:** rejected because
  Phase 12 already owns typed permission-change requests and decisions, while
  ADR-0183 already owns shared-work projection mechanics.
- **Copy holder or reviewer explanations into task/search/notification/AI
  data:** rejected because the prose can contain protected access context and is
  unnecessary for routing or list presentation.
- **Send every request to every current grant manager:** rejected because it
  creates duplicate responsibility, churn-driven fanout, notification fatigue,
  and wider disclosure than a bounded Tenant-selected cohort needs.
- **Use the original grantor, Owner, administrator, role, group, or requester-
  selected reviewer as fallback:** rejected because none proves both deliberate
  responsibility and current exact-scope eligibility, and requester selection
  permits self-routing.
- **Make coordinator designation a review permission:** rejected because an
  attention policy cannot bypass current capability, ceiling, floor, self, SoD,
  quorum, or source-visibility checks.
- **Apply coordinator changes only to future requests:** rejected because
  turnover could strand existing work even though routing changes no access;
  the confirmed aggregate preview safely applies a differential generation to
  all current pending requests.
- **Make Tasks Hub the only coordinator notification:** rejected because task
  coordination and personal Notification Center engagement are distinct. D44
  requires staff in-product attention; D45 adds the optional Tenant-default-Off,
  recipient-opt-out immediate email sibling described above. D46 keeps runtime
  absent; D47 permits a bounded candidate to become evidence-qualified and only
  a separately activated profile to become
  separate Phase 12 source policy, never permission or task time. Digest and
  escalation remain later decisions.
- **Create one unread bell item per existing request after a routing change:**
  rejected because a policy edit could cause a notification storm. Current-
  request tasks remain exact, while one safe recipient/responsibility-
  application-generation item
  points to the complete authorized source lane.
- **Inngest as the grant, expiry, or revocation authority:** rejected because a
  workflow executor cannot be required for permission correctness.
- **Keep a reminder useful until its D43 request ends:** rejected because an
  unbounded request lifetime would turn outages and worker recovery into stale
  recipient-facing catch-up.
- **Require exact-instant reminder execution:** rejected because normal locks,
  queues, deploys, and brief outages cannot satisfy a zero-width product
  interval reliably.
- **Use provider TTL or executor retry age as D52 truth:** rejected because
  those channel/transport controls cannot govern pre-handoff or in-product work
  and may only narrow the product-owned source interval.
- **Seed/store Off or proposed pairs now:** rejected because even an inert row,
  enum, flag, or disabled control freezes an unproved contract and creates
  migration/testing/support debt.
- **Build an evidence registry/workflow in the product:** rejected because D47
  already defines the review gate; runtime neither needs nor should interpret
  research methodology or approval evidence.
- **Qualify values through a vendor default, live A/B test, Tenant-authored
  number, or popularity metric:** rejected because those signals neither prove
  Core's source meaning nor protect privacy, fatigue, fairness, and access-
  governance comprehension.

## References

- [Phase 12 — Full role and permission configuration](../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md)
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
- [ADR-0027 — One notification presentation and engagement model](./0027-one-notification-presentation-and-engagement-model.md)
- [ADR-0181 — Source-authorized candidate-scoped external review](./0181-source-authorized-candidate-scoped-external-review.md)
- [ADR-0183 — Source-owned work projects into one shared Tasks Hub](./0183-source-owned-work-projects-into-one-shared-tasks-hub.md)
- [Identity and access OpenSpec](../../openspec/specs/identity-and-access/spec.md)
- [Platform boundaries OpenSpec](../../openspec/specs/platform-boundaries/spec.md)
- [Platform surfaces OpenSpec](../../openspec/specs/platform-surfaces/spec.md)
- [Workflow orchestration OpenSpec](../../openspec/specs/workflow-orchestration/spec.md)
