# D14 — Appointment, calendar-copy and authorization owner boundaries

Research only, October 16, 2026 UTC, against repository baseline
`9cada8f3d8ab59db391d3fd20df77fcadeb09813`. The founder selected optional automatic
updates for deliberately added Asym appointments in a connected personal
calendar. The appointment stays authoritative in Asym; unrelated calendar and
mailbox contents are not imported. Detailed clauses below are review
recommendations, not separately ratified decisions, formal owner amendments,
implementation or provider qualification.

## Conclusion and current producer gap

**Accept with required amendments.** D14 needs a qualified native Appointment
source as well as a calendar adapter. The inspected P9 contract supplies shared
task and activity/timeline seams, not a complete meeting-appointment contract.
The current missionary task API does admit `task_type="meeting"`, but its timing
is one optional `due_date`; generic task status writes set `completed_at`.
Neither that label nor those fields establish an appointment interval, timezone,
cancellation/version semantics or calendar-copy authority.

Bounded searches of missionary/API/database paths and the inspected owner and
OpenSpec surfaces did not establish a complete Appointment producer. This is
not a whole-system or hosted-deployment absence claim. A source census and
explicit qualification remain necessary before implementation. Q14 itself
disclaims any established appointment producer or working connector.

The minimal permanent model proposed here is:

1. **P9 owns a bounded canonical relationship-work Appointment source**, with
   source-authorized scheduling, correction, cancellation and separately proved
   outcome commands. This is a proposed owner extension, not a claim that P9
   already supplies the complete contract.
2. **P28 owns the missionary journey and the calendar-copy purpose**, including
   deliberate appointment selection, the permitted export profile, the durable
   intent for one exact copy and truthful user-facing status.
3. **P31 owns the qualified connection and provider adapter**, exact destination
   binding, credentials, provider-object mapping, transport evidence and recovery.
   Its mapping refers to the stable source copy identity; it cannot create new
   appointment truth or broaden disclosure.
4. **Tasks Hub owns only admitted work projections.** Any appointment-related
   task requires its own registered source-work predicate. A scheduled meeting
   does not automatically create another obligation, reminder or interaction log.
5. **P3/P10/P12 govern current source and external disclosure authority.** A
   provider credential or personal-calendar label supplies neither.
6. **P17/P6 own any separately selected communication.** A calendar mirror write
   is not automatically a communication event, attendee invitation or proof that
   a relationship interaction happened.

## Inspected source register

Paths are relative to `/workspace/core`. Accepted/planned owner intent is distinct
from current runtime evidence; none of these documents alone proves activation.

| Ref | Exact inspected source                                                                                                                                                                                                           | Relevant rule and limit                                                                                                                                                                                                                                                                                   |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S01 | `docs/features/missionary-workspace-depth/grill/phase28-founder-brief.md:105–115,119–125,241–249`                                                                                                                                | P9 owns Parties, qualified interactions and shared tasks; native daily scheduling/outcome honesty and a useful manual path are required. Connection scope, direction, confidentiality and recovery need qualification. No broad mailbox/address-book ingestion or shared credentials by default.          |
| S02 | `docs/features/missionary-workspace-depth/grill/phase28-q14-calendar-connection-research.md:10–24,35–64`                                                                                                                         | Selected A concerns deliberately added appointments and later Asym changes/cancellation. Native work remains independent. Provider identity, scopes, fields, disagreements and recovery were not established by the question. Its pre-answer status is provenance, not a claim that A remains unanswered. |
| S03 | `docs/prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:512–520,629–640,1157–1166`                                                                                                                           | P9 has a thin task work queue, shared party-linked tasks and a composed activity timeline. These inspected clauses do not define a meeting-appointment producer.                                                                                                                                          |
| S04 | `packages/api/src/missionary-portal/tasks.ts:13–41,81–96`; `packages/api/src/missionary-portal/task.ts:25–55,81–85`; `apps/missionary/app/tasks/page-client.tsx:114–119`                                                         | Current code has a Meeting task label, optional due date and generic completion writes. Static evidence of a narrower implementation, not a complete Appointment source or a hosted security finding.                                                                                                     |
| S05 | `docs/adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:24–48,50–100`                                                                                                                                             | Registered finite source-work contracts; source owns business condition, cancellation, supersession, recurrence and history. Tasks Hub and executors cannot own source completion. Protected source bodies are not copied into task/attention surfaces.                                                   |
| S06 | `openspec/specs/crm-core/spec.md:185–204`                                                                                                                                                                                        | Asym Postgres owns CRM records; provider identifiers remain references rather than identity or truth.                                                                                                                                                                                                     |
| S07 | `docs/prds/sitestacker-parity/roadmap.md:4405,4411–4421,4431–4449,4453–4457`                                                                                                                                                     | P31 owns connection/transport while each source owns resource meaning and effect identity. Connected is not synchronized. Explicit disconnect fences future work; outage is not deletion. Exact adapter profiles need real qualification.                                                                 |
| S08 | `docs/prds/program-roadmap/owner-constraints.md:421–466`                                                                                                                                                                         | Shared P12/P3 governed API projections, credential/scope/health ownership, and the already reserved P21 Missionary Support Feed consumer. D14 neither displaces that consumer nor widens its fields.                                                                                                      |
| S09 | `docs/adr/0209-static-field-policies-and-subtract-only-projection.md:16–27,32–37`; `docs/adr/0212-one-export-policy-and-shared-csv-safe-cell.md:15–30`                                                                           | One field-policy/projection source; external export is not inferred from on-screen visibility. Internal/care/security data remains excluded from external egress. Future record families need classification. CSV encoding details are not a calendar serializer contract.                                |
| S10 | `openspec/changes/sitestacker-parity/specs/identity-and-access/spec.md:3–11,41–51,86–104`                                                                                                                                        | One current validated context; deferred work re-proves its member/NHI/operator basis. Unknown families/surfaces fail closed. Another hat, coarse RLS or a provider credential cannot widen source authority.                                                                                              |
| S11 | `docs/prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1550–1556,1584–1587,1647–1655,1670–1672`                                                                                                            | Exact current context, live authorization epochs, scoped egress and current grant transitions. Source-specific implementation still needs proof; no browser or serialized stale grant becomes authority.                                                                                                  |
| S12 | `docs/prds/sitestacker-parity/phase-06-shared-communication-event-model.md:135–153`; `docs/adr/0026-contract-bounded-delivery-plans.md:17–23`; `docs/adr/0027-one-notification-presentation-and-engagement-model.md:23–37,57–65` | P6 communication facts, P17 contract/attention and source business outcomes remain distinct. Calendar transport does not become an email channel or a meeting outcome. Actual selected communication must use its qualified owner seam.                                                                   |
| S13 | `docs/prds/sitestacker-parity/phase-10-sensitive-data-safety.md:95–105,136–142`; `docs/adr/0211-distinct-human-approval-for-projection-widening.md:16–28`                                                                        | Restricted identity/location and current classification remain binding. Projection-policy widening follows its own approval rule; ordinary commands inside a qualified policy do not acquire an invented routine approval queue.                                                                          |

## Minimal source and copy profile

Recommend one initial qualified **one-off timed Appointment** profile. It needs
explicit source start/end meaning and an authoritative timezone/instant
interpretation, exact subject/context, current revision, scheduling and
cancellation semantics, and distinct actual outcome evidence. Do not fabricate
duration from `due_date`, treat a task type as a meeting record, or reuse finance
schedule/publication-appointment semantics merely because they also use dates.

This is a bounded implementation recommendation, not a founder-selected ban on
future all-day or recurring appointments. All-day, recurrence, series exceptions
and other native kinds require their own source/provider mapping before offering
automatic copying. Unsupported kinds stay truthful and native work remains
usable; no silently shortened or expanded approximation is permitted.

A calendar-purpose projection should be finite and understandable before Add.
A generic appointment label, admitted timing and an authenticated Asym link is
a defensible minimal profile to qualify. Richer titles, names, locations and
notes are not automatically exportable. Even timing or a timezone may reveal
sensitive context, so this is not a universal safe-field declaration. P3/P10
must qualify the actual profile. Source links confer no access to their target.

### Stable copy identity versus connection generations

The durable business identity is the intended copy of the exact appointment
for the exact consenting principal, Tenant, provider account and calendar
destination. Its concrete representation belongs to later design. Source edits,
OAuth refresh, retries and reconnecting the same account/calendar do **not**
create a new intended copy. A profile or source revision is evidence governing
an update, not a reason to mint another event.

**Connection generation fences attempts; it is not a new copy business identity.**
P31 binds each attempt to current connection/destination proof while retaining
the source copy identity and any known provider object/evidence across a
same-destination reconnect. Calendar/account renames change labels, not identity.
A different destination needs an explicit current source decision; no silent
migration or duplicated fan-out follows from reconnecting.

**An unknown create result blocks another create.** Recover it under the stable
copy identity and exact destination using the qualified provider's available
evidence. A new token, connection generation, retry key or process restart cannot
turn unknown into absent. If presence/absence remains unproved, retain a truthful
unresolved state rather than risk a duplicate. Provider idempotency windows are
useful mechanisms, not the permanent business identity.

Provider-only edits never write back to Asym. The adapter needs explicit
Asym-owned-field and disagreement semantics and may not overwrite unrelated
calendar content. Missing/deleted provider objects are not permission to create
fresh copies automatically. Any deliberate re-add/replacement preserves old
evidence and uses an explicit qualified source transition; an old queue item
cannot choose it. Final external-edit/deletion and reconnect UX must be stated
in the D14 review, not left as accidental adapter behavior.

## Concern register

Severity describes potential harm without the safeguard. Likelihood is
conditional engineering judgment, not an incident rate. Each concern retains
all eight review dimensions and an exact proposed clause.

### O01 — A task label could impersonate a native appointment source

- **What:** The current Meeting task and its due date become calendar truth.
- **Why:** A due date lacks duration/timezone/cancellation semantics, and generic completion can fabricate evidence that a meeting occurred.
- **Severity:** High.
- **Likelihood:** High if the current task API is reused unchanged.
- **Evidence:** S01–S06, particularly runtime create/update schemas and ADR0183 source-controlled outcomes.
- **Effect on A:** Requires the bounded Appointment source; does not reject optional automatic updates.
- **Permanent fix:** Qualify one native source and project work rather than create another independent task truth.
- **Exact clause OC01:** “D14 SHALL consume a qualified native Appointment source with explicit temporal meaning, source revision and authorized schedule/change/cancel commands. Calendar acceptance, elapsed time, RSVP or task completion SHALL NOT establish attendance, a completed relationship interaction or shared P27 history.”

### O02 — Reconnect or retry could create a duplicate business copy

- **What:** Connection generations or source revisions are used as create identity, or an unknown first create is replayed under a fresh identity.
- **Why:** The user deliberately selected one copy but receives duplicates; later updates/cancellation can affect the wrong instance.
- **Severity:** High.
- **Likelihood:** High without stable source identity and unknown-outcome recovery.
- **Evidence:** S07–S08 durable source effects/recovery; S06 provider references are not source truth.
- **Effect on A:** Adds copy/attempt identity precision; no extra routine user confirmation.
- **Permanent fix:** Keep one stable intended-copy identity across same-account/calendar reconnect, with separately fenced connection attempts and durable provider evidence.
- **Exact clause OC02:** “The business copy identity SHALL survive source edits, retries, token refresh and same-account/calendar reconnect. Connection generation fences an attempt but SHALL NOT create another copy identity. An unknown create result SHALL prevent another create until exact scoped provider/source evidence resolves it; new credentials, retry tokens or generations are not proof of absence.”

### O03 — Calendar visibility could bypass source export restrictions

- **What:** On-screen names, notes, location or other protected context are copied into an externally retained calendar.
- **Why:** The destination can be shared or administrator-visible; a private label and OAuth consent do not grant source disclosure rights.
- **Severity:** Critical for restricted identity/location or care disclosures.
- **Likelihood:** Plausible if generic task title/description or record serialization is reused.
- **Evidence:** S09–S11/S13; current task payload admits free-form title/description, which is not calendar-export qualification.
- **Effect on A:** Narrows the offered fields and requires a truthful destination/content review.
- **Permanent fix:** Register a finite calendar-purpose projection through existing P3/P10/P12 policy, including derived labels, timestamps, links and logs.
- **Exact clause OC03:** “Adding an appointment SHALL authorize only its exact reviewed destination and admitted calendar-purpose projection. On-screen visibility, another role, OAuth consent and a provider privacy label SHALL NOT widen source egress. Internal/care/security data remains excluded; new or changed fields require source qualification before export.”

### O04 — A valid credential could act for the wrong context or destination

- **What:** Account names, matching emails, another active hat or a service credential substitute for current principal/calendar authority.
- **Why:** A calendar write can leak another Tenant's appointment or modify somebody else's destination while provider authentication still succeeds.
- **Severity:** Critical.
- **Likelihood:** Plausible on broad or client-selected connection paths.
- **Evidence:** S07–S11; one validated context and provider/source ownership separation.
- **Effect on A:** Requires exact verified bindings and current execution proof.
- **Permanent fix:** Bind immutable provider identity and calendar destination to the consenting principal/Tenant and re-prove the correct delegated execution basis.
- **Exact clause OC04:** “Every operation SHALL bind the exact consenting Asym principal, Tenant, source copy, verified provider account and calendar destination, and re-prove current source/export and destination authority. A familiar email, token, another hat or privileged database path cannot supply that authority.”

### O05 — Cancel or revoke could be defeated by delayed external work

- **What:** A stale update restores canceled details, an old create runs after cancellation, or successful local cancellation is presented as confirmed external deletion.
- **Why:** The database and provider do not share an atomic transaction; retries and in-flight requests can produce a different external state than the UI implies.
- **Severity:** High.
- **Likelihood:** Plausible under ordinary network delay, lock contention and unknown outcomes.
- **Evidence:** S07/S08 source fences, durable evidence, missed/out-of-order events and disconnection requirements.
- **Effect on A:** Requires current admission and truthful reconciliation; no impossible cross-system atomicity claim.
- **Permanent fix:** Use durable source intent, current fences before new provider calls, exact copy/provider mapping and separately attributed reconciliation/cleanup outcomes.
- **Exact clause OC05:** “New provider calls SHALL be admitted only under the current source revision, copy intent and connection authority. Cancellation/revocation fences unstarted stale effects. An already-started remote operation may finish; its observed outcome and any separately authorized cleanup SHALL be reconciled without claiming atomic provider rollback or inventing appointment completion.”

### O06 — Disconnect could imply bulk deletion or silent renewed authority

- **What:** Disconnect deletes native appointments or broad external content; reconnect replays old effects or re-exports everything without current proof.
- **Why:** Stopping a connection, losing eligibility, a temporary outage and removing a calendar copy have different source consequences.
- **Severity:** High.
- **Likelihood:** Plausible if the adapter has only a connected boolean.
- **Evidence:** S07: explicit disconnect fences future work, but source outage is not deletion; S10 deferred work current authority.
- **Effect on A:** Requires explicit bounded lifecycle and recovery semantics.
- **Permanent fix:** Preserve source/copy history, fence old connection attempts and qualify any resumed exact-copy reconciliation separately from creating copies.
- **Exact clause OC06:** “Disconnect SHALL fence future operations under the old connection generation without canceling native appointments or claiming external copies were removed. Reconnect preserves same-destination copy identity but supplies no automatic source authorization or historical replay. Resumed updates, cleanup, re-add or destination change require their exact current source transition and outcome evidence.”

### O07 — A copy operation could silently become supporter communication

- **What:** Provider attendees, conferencing, invitation or notification defaults generate outreach or misleading interaction history.
- **Why:** The founder selected a personal-calendar copy, not invitations to supporters or a new messaging channel.
- **Severity:** High.
- **Likelihood:** Plausible when provider defaults or generic calendar payloads are copied.
- **Evidence:** S01/S02 and S12 communication/attention/source-outcome separation.
- **Effect on A:** Narrows the initial adapter profile without removing the selected calendar job.
- **Permanent fix:** Exclude unselected outward effects and qualify any later communication through its existing P17/P6 owner rather than the calendar transport.
- **Exact clause OC07:** “D14 SHALL NOT authorize attendee invitations, provider-generated outreach, contact admission or a new communication channel. Suppress unselected outward effects in the qualified adapter. A mirror write is not automatically a communication event or completed interaction; any selected communication retains its separate P17/P6 purpose, eligibility and evidence.”

### O08 — Reconciliation could become general calendar ingestion

- **What:** Broad list/watch/read permissions are used to import unrelated events, free/busy, contacts or mailbox material.
- **Why:** A limited reliability read is easily expanded into a second source calendar or surveillance surface.
- **Severity:** High.
- **Likelihood:** Plausible under broad provider scopes or generic connector frameworks.
- **Evidence:** S01/S02 explicitly exclude broad ingestion; S07/S08 require exact source-qualified operations.
- **Effect on A:** Permits only the bounded reads necessary to prove the exact linked-copy outcome.
- **Permanent fix:** Qualify allowed readback fields, operations and retention per provider profile; keep unrelated provider contents out of storage, logs and application views.
- **Exact clause OC08:** “Reconciliation SHALL read only the qualified identity, revision, ownership and outcome facts necessary for exact linked Asym copies. It SHALL NOT import unrelated calendar events, mailbox contents, contacts or free/busy information. Broader provider credentials do not grant broader application operations.”

### O09 — A connected settings card could replace the complete native job

- **What:** Native appointments wait for a provider, or Connected is shown as proof that updates succeeded.
- **Why:** Users cannot trust which time is current, and an optional connector becomes an accidental prerequisite for native work.
- **Severity:** Medium–high.
- **Likelihood:** Plausible; no complete source/connector was established by this review.
- **Evidence:** S01/S02 manual/native independence; S07 connected-versus-synchronized distinction; S08 reserved first feed consumer.
- **Effect on A:** Requires exact positive journeys and honest limitation/recovery states.
- **Permanent fix:** Keep native commands independent and qualify each offered end-to-end provider profile, including actual source/retry/cancellation outcomes.
- **Exact clause OC09:** “Native scheduling SHALL remain usable without a connection and during provider failure. Show native save, mirror pending, confirmed current mirror, disagreement and unknown outcome distinctly. A settings card, generic framework or synthetic fixture does not qualify D14; exact provider/source paths and complete user journeys must pass before activation.”

## Genuine open scope versus qualification work

The Appointment producer, exact provider account/calendar binding, write/read
permissions, finite export fields, temporal mapping, stable copy identity,
external disagreement behavior, cancellation and reconnect semantics need
concrete owner clauses and proof. They are not reasons to ask the founder a
generic engineering question. The D14 review can state the minimal recommended
behavior and its limits explicitly without pretending each detail was selected
in the original A answer.

Two-way calendar import, attendee invitations, general mailbox/free-busy access,
automatic copying of all appointments, cross-account migration, and broad
external cleanup are additional product scope. All-day/recurring-series support
also needs an explicit qualified source profile rather than inference from a
generic task. No such expansion is supplied here.

The strongest simpler alternative remains Q14 B: manual Add to calendar with
honest responsibility for later changes. It does not satisfy selected A as the
permanent implementation. A useful manual recovery path remains available
without disguising an unmanaged copy as continuously connected.

## Required later owner reconciliation and proof

| Owner                                 | Exact bounded amendment                                                                                                                                                                                                                             |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P9 / CRM OpenSpec                     | Proposed native relationship-work Appointment identity, temporal/source lifecycle, current commands and explicit outcome meaning; source-preserving treatment of existing Meeting tasks. No unproved automatic conversion from task due dates.      |
| P28                                   | Missionary scheduling/copy journey, deliberate per-appointment admission, stable copy intent, exact field profile, status and native/manual recovery.                                                                                               |
| P31                                   | Exact supported adapter/account/calendar profiles, connection-generation fences, persistent same-destination mapping, credential custody, readback, retry/disconnect and observed outcomes. Preserve the separately reserved Support Feed consumer. |
| P3/P10/P12 / active identity OpenSpec | Registered new source/export family, current context and field/purpose floors, scoped execution authority and governed egress. Actual policy widening retains ADR0211; ordinary qualified operations gain no blanket new approval queue.            |
| Tasks Hub / ADR0183                   | Any real actionable projection must name its exact source occurrence and closure rule. No duplicate personal task or provider-owned completion.                                                                                                     |
| P17/P6                                | No implied new channel. Any later communications require their own exact source/recipient/consent/content/dispatch contract and proof.                                                                                                              |

Necessary positive/negative outcomes include: a native one-off timed appointment
without a provider; one deliberate copy and later update/cancellation; exact
scope/export denial; same-account/calendar reconnect retaining one copy identity;
unknown create blocking duplicate creation; duplicate/out-of-order source work;
both cancellation/provider-admission orders with honest in-flight outcomes;
external edit/deletion disagreement; disconnect and permitted recovery without
historical replay; no attendees/mailbox/free-busy effects; and distinct meeting
outcome versus task/provider evidence. Actual provider, authorization, API/UI,
accessibility and realistic workload tests remain required.

No application, schema, formal owner/spec, external account, credential or live
calendar was changed. No runtime/provider/database test ran in this owner
subtask. No other D14 agent's probe is claimed as proof of these source contracts.
