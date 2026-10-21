# D14 — optional automatic calendar updates

**Disposition: Accept with required amendments.** The founder selected **A —
Optional automatic calendar updates**, with a clean, easy, beautiful, clear journey
and no needless complexity. Review date: October 16, 2026 UTC. Repository baseline:
`9cada8f3d8ab59db391d3fd20df77fcadeb09813`.

On October 16, 2026 UTC the founder instructed: “Ratify this decision and
amendment.” The corrected D14 decision and required amendments below, including
C01–C16 and P01–P16 as future acceptance obligations, are **explicitly ratified**.
The reviewed initial design and qualification sequence are accepted direction;
this does not select a provider inventory, prove implementation or authorize a
live integration. Earlier decisions retain their separate statuses. This remains
a research-only Grill record: formal owner/OpenSpec publication awaits `/to-prd`,
and tickets await `/to-issues`.

## Exact corrected decision to record

> Allow a missionary, within current organization permissions, to connect a
> supported calendar and deliberately add an eligible Asym appointment to it.
> Asym maintains that personal calendar copy when the appointment is rescheduled
> or canceled. Connecting alone adds nothing. Native appointments remain fully
> usable without a connection or while the calendar provider is unavailable.
>
> Appointment details and outcomes remain authoritative in Asym. This is a
> one-way calendar copy: it does not import unrelated events, check availability,
> read a mailbox, invite attendees or establish that a meeting occurred.
>
> Show the exact account and destination, the limited information being copied,
> and clear saved/pending/confirmed/needs-attention states. The initial recommended
> copy contains a generic appointment label, qualified timing and a sign-in-required
> Asym link, without supporter names, private notes, precise location or financial
> information. Explain that people with access to the destination calendar may
> see the copy. Provider privacy labels do not make that disclosure private.
>
> Use one durable copy identity across retries and reconnection. Resolve uncertain
> provider outcomes before attempting a replacement. External edits never change
> the Asym appointment; conflicting edits require a clear recovery choice rather
> than silent overwriting or recreation. Stopping updates and disconnecting fence
> future work immediately, while removal of existing external copies is reported
> separately and only when proven.
>
> Qualify a small native Appointment source and each offered calendar adapter
> through existing CRM, identity and integration owners before activation. Reuse
> shared infrastructure; do not build a second CRM, task engine or general calendar
> synchronization product.

This preserves A and makes its safety and user promise implementable. It does not
ratify a provider inventory, universal calendar compatibility, recurring-series
support or an instantaneous-update guarantee.

## Evidence, alternatives and actual current behavior

**Repository facts.** The current missionary task API admits a `meeting` type
but only a generic due date/status. The inspected task dialog selects a day; it
does not establish a start/end interval, named timezone, cancellation or provider
mapping. An admin settings example shows a hardcoded Google connection and buttons
without a real connection lifecycle. These are concrete implementation gaps,
not permission models or evidence of a deployed vulnerability. The bounded trace
and exact lines are in [current source and UX](d14-evidence/current-source-and-ux.md).

P9 has relationship-task/timeline seams; it does not yet establish the complete
Appointment producer needed here. **Proposed owner amendment:** P9 owns the
canonical relationship-work Appointment and authorized scheduling/cancellation/
outcome commands; P28 owns the missionary journey and calendar-export purpose;
P31 owns credentials, destination connections, transport and provider evidence.
Tasks Hub projects qualified source work where applicable, without owning the
appointment or its outcome. This reconciles [ADR-0183](../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md),
the current CRM OpenSpec and [P31](../../../prds/sitestacker-parity/roadmap.md#phase-31).
Full citations and conflicts are in [owner boundaries](d14-evidence/owner-boundaries.md).

**Primary external facts.** Google documents an app-created-calendar scope and
conditional event changes; Microsoft Graph's delegated calendar permission is
broader than a single chosen calendar. Stable event IDs/transaction IDs help
recovery but do not justify an unlimited exactly-once guarantee. Deleting an organizer-owned event
can send attendee cancellations; notification suppression is not a universal
no-email guarantee. Exact official sources, qualifications and uncertainties are
in [provider contracts](d14-evidence/provider-calendars.md).

**Strongest alternatives.**

| Alternative                  | Advantage                                                                                                          | Limitation and decision                                                                                                                                                                                                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Native scheduling only       | No external disclosure, credentials or maintenance.                                                                | Remains a complete usable path, but alone does not satisfy selected A.                                                                                                                                                                                                                      |
| One-off Add to calendar/file | Smallest handoff and no enduring provider grant.                                                                   | Changes/cancellations need manual correction; label it a manual copy. Retain a qualified manual path, not a misleading Synced label.                                                                                                                                                        |
| Subscribed iCalendar feed    | One-way automatic refreshing without broad write OAuth.                                                            | Client-controlled refresh and bearer-link/cached-copy issues; Outlook documents refresh may exceed 24 hours, Google supplies no numeric bound in the inspected help. Not equivalent to directly confirmable appointment updates/removal. Do not add a second subscription engine initially. |
| Bounded managed copy         | Directly identifiable write/update/removal outcomes for selected appointments; avoids repeated manual maintenance. | Requires a real adapter and durable recovery. Recommended implementation of A, with the bounded contract below.                                                                                                                                                                             |
| Full two-way sync/scheduler  | Could add availability, broad event import and meeting management.                                                 | Not requested; introduces conflicting authorities, unrelated data ingestion and invitations. Excluded from this decision.                                                                                                                                                                   |

**Product judgments, not observed user facts.** Recommend one dedicated Asym
calendar destination per consenting principal and Tenant context, with one active
managed copy per appointment for that context. Prefer qualifying Google's
app-created-calendar profile first because of its documented scope boundary.
This is an engineering sequence, not a founder-selected Google-only product
promise. A dedicated calendar aids recognition but is not an access sandbox;
Microsoft's scope remains broad even with such a destination. Google's
`calendar.app.created` covers the app-created calendars allowed by that grant,
not just this Tenant's mapped events. It does not by itself authorize
`CalendarList.list`; an unknown calendar-creation response therefore needs a
proved bounded recovery strategy. Any extra metadata-list scope must be explicitly
justified and disclosed, never silently added to make setup convenient. Offer no provider
button until its exact profile passes the acceptance suite. Do not add an
arbitrary multi-account/calendar-routing settings product initially.

Recommend the first source profile cover **individual timed appointments**.
An existing task with only a due date is not automatically eligible. All-day and
recurring-series semantics require a separately qualified source profile, rather
than guessed times or a hidden generic recurrence engine. This was an explicit
initial-scope recommendation in the review and is now part of the ratified design;
it does not bar later separately qualified appointment profiles.

**Unverified:** actual provider grants, conditional behavior at the deployed API
profile, complete native source implementation, live RLS, mobile usability and
supported load. Research and a local model cannot prove these. No Asym-user study,
preferred-provider distribution or calendar volume was supplied. Those unknowns
do not prevent deciding A; they prevent claiming release readiness.

## The smallest complete user journey

1. **Native first.** Maya creates/edits a timed appointment in Asym. The form shows
   date, start/end and a recognizable zone. One Save saves the appointment.
   No calendar setup is required to schedule or record what actually happened.
2. **Connect once.** In the appointment's Calendar area, show **Add to calendar**.
   If needed, open the existing account connection flow and explain:
   **“Add appointments you choose. Changes made in Asym will update their calendar
   copies.”** Show the actual provider scope honestly. Return to the original
   appointment; connecting by itself exports no appointment. Canceled consent,
   missing scopes and interrupted setup leave truthful recoverable states.
3. **Review once, add deliberately.** Show the actual account and exact destination,
   appointment timing/zone, generic copied title and **View in Asym** link preview.
   Explain **“People who can view this calendar may see these entries. Contact
   details and notes stay in Asym.”** The ordinary repeat journey has one explicit
   Add action with the destination and brief shared-content summary visible;
   no repeated multi-step wizard or field-permission matrix. Changing destination
   requires deliberate review, never an automatic fallback.
4. **Use clear status.** Put calendar state beside the appointment, with detail
   only when useful. Native **Saved** is independent of calendar **Adding…** or
   **Updating…**. After exact current-version acknowledgement show **Updated in
   calendar**, with the last confirmed time available. Do not imply continuous
   live verification or that the calendar app has refreshed its screen.
5. **Reschedule/cancel in Asym.** One native Save queues the linked update.
   **“Appointment saved. Calendar update pending.”** is valid partial-success
   copy. Cancellation queues exact owned-copy removal; show **Removal pending**
   until proven. A canceled appointment remains canceled even if removal fails.
6. **Recover without expertise.** A persistent **Needs attention** state explains
   a known issue and offers only the relevant action: reconnect, review a calendar
   conflict, or inspect the external copy. A timeout starts automatic targeted
   status checking, not a second Create button. Show **“We haven't confirmed the
   calendar change yet. Your appointment is saved in Asym.”** Do not ask Maya to
   diagnose transaction IDs or outbox entries.
7. **Respect external choices.** If managed details were changed in the calendar,
   offer **Restore from Asym** after a safe review, or **Stop automatic updates**
   while retaining that external copy. External deletion does not silently recreate
   it; **Add again** requires proof the former copy is gone and fresh authority.
   If attendees/organizer behavior changed, do not offer a restoration/removal
   that could unexpectedly notify them; explain the conflict and link to the
   calendar for deliberate handling.
8. **Leave cleanly.** **Remove from calendar** stops that binding and requests
   removal of its proved copy; it leaves the native appointment intact.
   **Disconnect calendar** immediately stops ordinary future operations and
   does not wait for external cleanup. Explain **“Automatic updates will stop.
   Entries already in your calendar may remain.”** Provide the destination link
   and exact known outcome. Never delete an entire calendar to clean up Asym
   entries, and never revive stopped bindings simply because Maya reconnects.

Permission-derived UI shows only currently usable actions. If the organization
withholds the feature, the appointment remains usable and the calendar area gives
an appropriate concise explanation, without a fictitious Connect button. A
mid-flow permission change is enforced server-side and yields a truthful state;
client hiding is not the security boundary. Temporary token/provider failures
pause still-enabled bindings: Reconnect shows the exact destination and that
selected appointments will resume, then rechecks authority and reconciles.
Explicit Disconnect stops those bindings. Connecting again exports nothing and
does not resume them; a deliberate Resume updates action may reuse an existing
proved copy after review. Neither route changes copy identity or treats an
uncertain create as a new event.

Use Core's base-maia/Base UI/Zinc components, quiet hierarchy, persistent readable
status, accessible labels and focus, inline validation and responsive layouts.
No icon/color-only states, disabled mystery controls, transient-toast-only failure
or heavyweight full-calendar grid is required. Unicode account labels and
localized dates are supported; timezone abbreviations alone are insufficient.
The form retains safe in-memory input through a recoverable failure, but does
not add unqualified offline persistence/replay of restricted data. A slow network
must not cause duplicate submission or falsely successful visual feedback.

## Required exact clauses

These are ratified requirements for the later authorized specification. C01–C16
and P01–P16 are local D14 identifiers, not newly published OpenSpec requirements
or GitHub issues.

**C01 — Deliberate bounded scope.** The system SHALL create a managed calendar copy
only after an authorized missionary explicitly selects Add for an eligible
appointment and exact destination. Connecting SHALL export no appointments by
itself. Initial scope SHALL NOT include unrelated calendar/mailbox/contact import,
free/busy, attendee invitations, automatic conferencing, two-way editing or copying
all existing/future appointments. A complete native and clearly labeled manual
path SHALL remain available under the same source disclosure rules.

**C02 — One appointment authority.** The authorized specification SHALL add the
bounded P9 Appointment source, P28 calendar-purpose projection and P31 adapter
contract described above. The source SHALL own schedule, cancellation, revisions
and separately recorded outcomes. A generic due date, task completion, provider
acceptance, RSVP or elapsed appointment time SHALL NOT imply attendance,
communication delivery, a completed relationship interaction or P27 history.

**C03 — Truthful controls and state.** UI SHALL derive permitted actions from
current server-resolved capabilities, distinguish native save from provider
outcome, and show exact account/destination plus admitted copied content before
Add. It SHALL expose recoverable pending/conflict/unavailable states persistently,
announce status accessibly and retain the native journey during provider failure.
Connected SHALL NOT be labeled synchronized. Acknowledged state SHALL identify
its source revision/confirmation time rather than promise continuous currentness.

**C04 — Exact current identity.** Every source command, queue dispatch, targeted
readback and repair SHALL use the applicable current P12 principal/Tenant/purpose
and owner ceiling, plus verified provider account/calendar authorization. Caller
IDs are untrusted selectors, not authority. OAuth initiation/callback SHALL bind
the initiating session, Tenant, provider and allowed return path with transaction-
bound code/PKCE/state protections. Expired, replayed or substituted callbacks SHALL
fail safely. Background work SHALL use its actual qualified service context;
service-role access SHALL NOT stand in for source permission. Generation changes
fence stale attempts but SHALL NOT generate a new copy business identity.

**C05 — Minimal external disclosure.** The initial calendar-purpose projection
SHALL contain only a generic appointment label, qualified timing and an opaque,
authenticated Asym link, plus unavoidable provider protocol metadata. No supporter
identity/contact details, internal notes, precise location, meeting secret,
financial/care data, attachments or attendee list SHALL be copied. The preview
SHALL disclose that calendar sharing/administration and device notifications can
expose copied metadata. Links SHALL grant no access by possession and contain no
access token. Source readability, OAuth consent and provider Private labels SHALL
NOT independently authorize egress. Provider metadata/defaults SHALL be inspected;
unselected outward communication effects SHALL be excluded.

**C06 — Durable database boundaries.** Every tenant-scoped appointment/copy/attempt
reference SHALL preserve Tenant through composite keys or an equally proven
constraint. Required identity/purpose/destination fields SHALL be non-null; mutable
labels SHALL NOT be keys. Structural constraints SHALL enforce admissible row
states and semantic uniqueness, including at most one active or unresolved managed
copy per source appointment/principal/context in the initial profile and unique
mapped provider-event identity within its exact destination. Closed evidence SHALL
prevent old attempts from reviving stopped work. Clients SHALL NOT mutate Tenant,
actor, source owner, destination identity, provider IDs, authority, revisions or
audit attribution through an ordinary row update. Trusted commands derive these.
Raw internal tables/secrets SHALL have no public/browser grants. RLS, all applicable
policies, old-row USING and new-row WITH CHECK behavior, views/RPCs and privileged
paths SHALL be tested independently; RLS alone is insufficient. Definer functions,
if necessary, SHALL restrict execution, schema resolution and returned data.

**C07 — Atomic native acceptance, separate external work.** Source mutation,
desired copy revision, command audit and required durable work SHALL commit
atomically. A known rolled-back transaction SHALL create no external operation.
Provider network work SHALL occur outside the source transaction. One authoritative
mutation boundary SHALL serialize conflicting changes and check expected revision;
stale clients/workers SHALL not overwrite newer source truth. Only definitely
undispatched work may be coalesced. Attempted/possibly submitted envelopes and
destinations SHALL be immutable evidence.

**C08 — Idempotency and uncertainty.** Copy identity SHALL outlive HTTP requests,
worker leases and credential rotations. Retry SHALL use the original effect
identity and qualified provider correlation. A lost response SHALL be unknown,
not failed or safe to recreate. Reconciliation SHALL target only the exact mapped
copy/operation. No new-key create, title/email matching, changed account/calendar
or expired provider deduplication window SHALL be treated as proof of absence.
Initial dedicated-calendar creation SHALL have its own safe setup recovery; an
uncertain setup SHALL not blindly create another calendar. Unknown outcomes and
tombstones SHALL survive reconnect and ordinary replay. Database restoration
SHALL enter dispatch quarantine; a restored snapshot SHALL NOT be treated as
proof of current authority or absence of an external effect. A provider
profile unable to safely resolve an effect SHALL expose a bounded attention state
instead of claiming exactly-once delivery.

**C09 — Time meaning.** The initial eligible source SHALL supply a one-off timed
interval with end after start, resolved instants and retained named source zone
and local scheduling meaning. Date-only tasks SHALL not acquire invented times.
Nonexistent local times SHALL require correction; ambiguous times SHALL identify
the chosen occurrence/offset. Changing viewer/device zone SHALL change display,
not the appointment instant. Changing the appointment's zone SHALL explicitly
review its resulting local time and instant. Timezone-rule changes affecting
future appointments SHALL be reconciled through a reviewed source revision,
not an adapter-only rewrite. All-day/recurrence SHALL remain unsupported until
an explicit source profile qualifies civil dates/exclusive ends and series/
exception/cancellation semantics. No floating local timestamps or assumed
24-hour civil days SHALL enter the managed-copy profile.

**C10 — Safe external disagreement.** Before modifying or removing a mapped event,
the adapter SHALL establish exact ownership/destination and detect changes to
Asym-managed fields and attendee/organizer behavior using provider-qualified
conditional operations or an equally proven concurrency boundary. A preflight
GET without race protection SHALL NOT be called safe. Unrelated user fields
such as permitted calendar color/reminders SHALL be preserved by narrow updates.
Conflicts SHALL pause that copy and offer qualified Restore from Asym or Stop
updates. External edits SHALL not write native facts; missing/forbidden reads SHALL
not be conflated with confirmed deletion. A former copy SHALL not be recreated
without fresh deliberate action and resolved prior effects. Detected attendance
or organizer changes SHALL block effects that could send unselected invitations/
cancellations. Unsupported conditional safety blocks that adapter's activation.

**C11 — Stop, cancel, disconnect and cleanup.** Cancellation SHALL change native
appointment truth and request qualified exact-copy removal. Stop updates SHALL
end future ordinary copy work; Remove SHALL additionally request removal. Explicit
disconnect or current authority loss SHALL fence new ordinary operations under
the old authority/generation immediately. Operations already submitted may finish;
late evidence SHALL update their original attempt only, never restore authority.
Cleanup after loss of ordinary access SHALL require a separately qualified narrow
teardown authority and valid provider permissions over proved prior copies. If
unavailable, retain an honest unresolved-removal result and safe manual guidance.
Disconnection SHALL never wait for cleanup, imply remote erasure or cancel the
native appointment. Explicit disconnection SHALL stop affected bindings; temporary
token/provider failure SHALL pause them. No whole-calendar deletion or unrelated-
event mutation is allowed. Reconnect SHALL not reroute, re-create or reactivate
stopped copies. A separate deliberate Resume updates may reuse a proved retained
copy only after current authority, destination review and reconciliation; it
SHALL preserve identity/evidence and not bypass unresolved effects.

**C12 — Failure and fallback.** The system SHALL distinguish known rejection,
unknown outcome, transient outage, revoked connection, conflict and confirmed
removal. Safe automatic retries SHALL use bounded backoff and provider Retry-After;
permanent failures SHALL require relevant repair. Native work SHALL remain usable.
Manual handoff SHALL be explicitly a separate, non-updating copy using the same
admitted projection; it SHALL not be offered as a harmless retry while a managed
create is unresolved. Source outage SHALL not be interpreted as deletion or
permission loss; it SHALL pause new disclosure until current authority is provable.

**C13 — Qualified provider profile.** Each offered adapter SHALL document actual
scope breadth, immutable account/destination identity, export fields, temporal
mapping, create correlation, conditional update/delete behavior, notifications,
revocation, throttling, setup recovery and supported account types/API versions.
Use existing P31 custody/outbox/repair seams. No general calendar watch/delta/feed
engine or new vendor/package is required by this decision. A directly confirmable
managed-copy profile is recommended over refresh-delayed subscribed feeds. A
provider's name or SDK presence SHALL not constitute qualification. D14 SHALL not
displace P31's retained Missionary Support Feed first-consumer obligations.

**C14 — Bounded operation and useful evidence.** Dispatch/reconciliation SHALL be
indexed and bounded to accepted linked work, with per-tenant/provider fairness,
finite batches, retry budgets and pagination; no full-calendar scans. Source
revision, effect identity, actor/context, destination reference, attempt timestamps,
provider correlation and known/unknown outcomes SHALL be durably attributable.
Technical telemetry SHALL omit credentials and private payloads. Repair SHALL
reuse the original identity and current authority, with no routine direct database
editing. Each profile SHALL publish tested workload/latency limits before
activation; no unmeasured scalable/instantaneous claim is allowed.

**C15 — Rollout, retention and recovery.** Deploy additive source/schema/grants/
constraints first, then compatible commands/workers/UI, then enable only qualified
provider profiles. Existing users/appointments SHALL not be auto-enrolled. Unknown
schema/profile versions SHALL fail closed for external work. A kill switch SHALL
stop new ordinary provider operations while retaining authorized reconciliation
and evidence. Retain mappings, unresolved attempts and stop/revocation fences
through roll-forward. A snapshot may lack later effects or revocations: restore
SHALL quarantine dispatch, recover post-snapshot evidence only through qualified
durable records/provider correlation and re-prove current authority and exact
copy state. Unrecoverable evidence SHALL leave recovery unknown and prohibit
fresh creates/replays; stale restored credentials/jobs SHALL not resume dispatch. Deletion,
anonymization and retention SHALL use source/P31/P12 policy, minimize retained
payloads and preserve necessary minimal attribution/correlation; no cascading
delete SHALL silently destroy unresolved effect evidence. Do not invent an email-
specific retention period for calendar evidence. No financial/money facts change.

**C16 — Traceable outcome proof.** The authorized specification SHALL map this
answer and glossary meanings to the proposed owner amendments, OpenSpec scenarios,
design, implementation tasks, later issues, tests and release evidence. Provider
and source profiles SHALL pass P01–P16 with actual boundaries before activation.
Model tests or settings screenshots SHALL not stand in for database/provider/UI
proof. Actual launch limits and representative-user feedback SHALL be attached
to that release evidence; no invented usage findings are permitted.

## Consolidated concerns

Severity is impact if prevention is absent; likelihood is a reasoned assessment,
not an observed incident rate. These ten concerns cover the category findings
without repeating the same eight-part analysis twenty-two times. Each identifies
what fails, consequence, severity/likelihood, evidence, disposition effect and
exact permanent correction.

| Concern                                         | What could go wrong; why it matters                                                                                                                                                                           | Severity / likelihood                                                            | Evidence or reasoning; effect on A                                                                                                                            | Permanent fix and exact language                                                                                                                  |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| R01 — Source gap and scope creep                | A task due date becomes a meeting, a calendar copy becomes another master, or a whole scheduler is built to solve duplicate maintenance. Users get wrong schedules/history and unnecessary complexity.        | High / likely if current task/settings examples are reused unchanged.            | Inspected meeting task and P9/ADR-0183/P31 owner seams; adds a bounded source amendment, preserves A.                                                         | One native source and one-way personal copy, manual/native alternatives, finite first profile: C01/C02/C09/C13; P01/P02/P09/P15.                  |
| R02 — Unintended disclosure and OAuth authority | A shared calendar/lockscreen exposes supporter/care details; a consent callback binds the wrong account, or broad scopes are treated as rights. Readable source data is exported without the correct purpose. | Critical for excluded sensitive data / plausible.                                | ADR-0209/0212, P12, RFC 9700, Google/Graph scope docs; narrows content and connection contract.                                                               | Minimal reviewed projection, exact callback/account binding, honest scope and external-visibility copy: C03–C05/C13; P03/P04/P11.                 |
| R03 — Tenant/row mutation bypass                | A valid source row is rebound to another Tenant, principal, account or destination; service-role, views or RPCs bypass source limits. This leaks or corrupts records.                                         | Critical / plausible without explicit paths and constraints.                     | Identity OpenSpec, P12 and current Supabase/PostgreSQL semantics; requires database and server enforcement.                                                   | Tenant-aware FKs, immutable identity, grants/RLS/USING/WITH CHECK and live service ceilings: C04/C06/C07; P04/P05/P06.                            |
| R04 — Duplicate or stale external effect        | Lost create acknowledgement, reconnect or retries create duplicate events; late updates restore canceled data; deleting correlation breaks repair. Users act on stale or duplicate appointments.              | High / likely under ordinary network failure without prevention.                 | Provider IDs/transaction limitations, P31/P6 unknown-outcome precedent, local protocol probes; changes identity/lifecycle design.                             | Durable business identity across generations, immutable attempts, exact reconciliation and version fences: C06–C08/C11/C15; P06/P07/P10/P14.      |
| R05 — Incorrect time                            | Date-only conversion, DST gap/fold, travel or rule changes shift a meeting or duration. The user misses or miscommunicates an appointment.                                                                    | High / plausible, predictable at temporal boundaries.                            | Current date-only UI, PostgreSQL/official provider time semantics and zoneinfo probes; narrows first source profile.                                          | Exact interval/zone, gap/fold handling and reviewed timezone changes: C02/C09; P02/P09.                                                           |
| R06 — External edits cause loss or outreach     | Automatic overwrite destroys a user's change; deletion of an externally converted meeting sends cancellations. A read-before-write check races.                                                               | High / plausible when people edit in their calendar.                             | Google conditional-event docs, Graph changeKey/conditional contract gap, provider attendee side effects; changes conflict handling and adapter qualification. | Conditional owned-field mutations; pause conflicts/attendees, no writeback or silent recreate: C05/C10/C13; P08/P11.                              |
| R07 — Revocation/cleanup confusion              | Disconnect is delayed by cleanup, old jobs resume after reconnect, or UI promises removal despite revoked credentials. Privacy and trust fail.                                                                | High / plausible.                                                                | P31 explicit disconnection/outage boundary and unavoidable in-flight remote effects; makes stop/removal distinct.                                             | Immediate local fence, separately qualified cleanup, late-evidence retention, truthful leftovers: C08/C11/C12/C15; P07/P10/P14.                   |
| R08 — Misleading or burdensome UX               | Connected is presented as current, provider failure loses a native save, repeated wizards hinder use, hidden/disabled controls contradict permissions or date/zone is unclear.                                | Medium–high / likely if demo UI and optimistic toasts are reused.                | Static source, MPDX/CRM patterns and WCAG; changes complete journey and copy, not basic A.                                                                    | One native Save and deliberate Add; persistent truthful status, relevant recovery, permission-derived accessible UI: C03/C09/C12; P01/P03/P12.    |
| R09 — Unbounded operations and weak evidence    | Broad polling/import, unfair retry storms or secret-filled logs add cost, leak data and leave staff repairing events manually.                                                                                | High for disclosure; medium for burden / plausible as usage grows.               | P31 budgets/recovery, provider rate limits and lack of supplied scale evidence; bounds operations and proof.                                                  | Existing outbox/connection owner, exact linked readback, finite budgets, meaningful correlation and monitored deadlines: C12–C14; P07/P13/P16.    |
| R10 — Premature rollout or false proof          | Old workers ignore new fences, an automatic backfill exports old meetings, restore replays accepted work, or passing mocks is claimed as provider/RLS proof.                                                  | High / plausible if feature activation is conflated with schema/UI availability. | Existing source gaps, actual unqualified provider paths and durable side-effect reasoning; adds activation/migration gates.                                   | Additive versioned rollout, no automatic enrollment, kill switch, restore quarantine and traceable real acceptance: C13/C15/C16; P04/P08/P14–P16. |

## Every requested review category

“Concern exists” evaluates the unamended answer, not a claim that Core currently
has an exploitable production defect. The linked R/C/P entries supply the detailed
impact, likelihood, evidence, permanent remedy and exact acceptance language.

| #   | Category                                                     | Material concern?                           | Individual assessment and amendment                                                                                                                                                                                                                                                                                        |
| --- | ------------------------------------------------------------ | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Problem validity, necessity and alternatives                 | **Yes**                                     | Duplicate appointment maintenance is the selected problem; actual user frequency is unmeasured. Manual copy and subscribed feeds are real simpler alternatives. A stays; bound it to deliberate managed copies and qualify the missing source (R01; C01/C02/C13).                                                          |
| 2   | Brittleness                                                  | **Yes**                                     | Due-date assumptions, provider defaults, account labels, deduplication windows and external edits change. Use explicit temporal/provider contracts and durable identity (R01/R04/R05/R06; C06–C10/C13).                                                                                                                    |
| 3   | Technical debt                                               | **Yes**                                     | Reusing mock connection state or adding a separate task/calendar authority would institutionalize false ownership and duplicated delivery logic. Extend the existing owners only (R01/R08; C02/C03/C13).                                                                                                                   |
| 4   | Edge cases                                                   | **Yes**                                     | Canceled OAuth, token expiry, external deletion, shared calendars, DST, reconnect to a different account, lost setup response and cancel-during-create all need defined outcomes (R02/R04–R08; C04/C08–C12).                                                                                                               |
| 5   | Footguns                                                     | **Yes**                                     | Connect-all defaults, donor names in event titles, “Retry” as new create, whole-calendar deletion and one-off download while create is uncertain can cause harm. Exclude these paths (R02/R04/R06/R07; C01/C05/C08/C10–C12).                                                                                               |
| 6   | Tenant safety                                                | **Yes**                                     | Queue, callback, cache, deep-link and destination substitutions can cross Tenant or principal boundaries despite valid credentials. Bind and reauthorize every path, including status/repair views (R02/R03; C04–C06/C14).                                                                                                 |
| 7   | Database, RLS and authorization safety                       | **Yes**                                     | Allowed-row UPDATE can change protected relationships; broad grants/definers/service-role can evade limits. Test old/new state, composite relationships and actual caller roles; no live-schema safety is inferred (R03/R04; C04/C06–C08/C15).                                                                             |
| 8   | Overengineering                                              | **Yes**                                     | Full two-way sync, free/busy, mailbox import, series editing, configurable export fields and a new integration framework exceed A. One profile/copy/journey suffices; reliability is still necessary (R01/R09; C01/C02/C13/C14).                                                                                           |
| 9   | UX/UI and friction                                           | **Yes**                                     | Misleading success/permissions, excess setup, mobile interruption, inaccessible feedback and ambiguous zones directly reduce usefulness. Require the complete concise journey and real task testing (R05/R08; C03/C09/C12/P12).                                                                                            |
| 10  | Source of truth, ownership and invariants                    | **Yes**                                     | Appointment, task, provider event and completed interaction can be conflated. Keep one native appointment, stable unique copy references and separate outcome/delivery facts (R01/R04; C02/C06–C08).                                                                                                                       |
| 11  | Hidden coupling                                              | **Yes**                                     | Native scheduling could depend on provider availability, credential generation could become identity, or P6 email settings could be reused for calendar invitations. Separate the authorities and source transaction (R01/R04/R06; C02/C07/C08/C13).                                                                       |
| 12  | Failure modes                                                | **Yes**                                     | Source succeeds while provider fails; provider succeeds while response is lost. Neither rollback nor a fresh create repairs both. Persist intent, show partial success and reconcile exact effects (R04/R07/R08; C07/C08/C11/C12).                                                                                         |
| 13  | Lifecycle, temporal correctness, concurrency and idempotency | **Yes**                                     | Out-of-order responses, cancel/disconnect races, expired leases and timezone changes can violate intent. Stable effect identity, revision fences and defined temporal transitions are mandatory (R04–R07; C07–C11).                                                                                                        |
| 14  | Data integrity                                               | **Yes**                                     | Duplicate copies, changed destination IDs, erased evidence or task-derived appointments corrupt scheduling/recovery. Constraints plus one mutation boundary preserve the authoritative facts (R01/R03/R04; C02/C06–C09/C15).                                                                                               |
| 15  | Security and privacy                                         | **Yes**                                     | External calendars, provider admins, notifications, URLs, logs and retained copies are disclosure surfaces; cancellation is not recall. Minimize payloads, protect credentials and disclose limits (R02/R03/R07/R09; C04–C06/C11/C14/C15).                                                                                 |
| 16  | Scalability and performance                                  | **Yes**                                     | Broad scans/retry storms and a popular tenant can starve useful work. Use indexed exact bindings, bounded queues and tested declared limits; no invented throughput promise (R09; C12–C14/P13).                                                                                                                            |
| 17  | Operational burden                                           | **Yes**                                     | Unknown creates or permissions faults can become routine database repair. Give owner-scoped diagnostics and safe same-identity recovery; preserve native work (R04/R07/R09; C08/C11/C12/C14).                                                                                                                              |
| 18  | Observability and auditability                               | **Yes**                                     | “Synced” and generic errors conceal who authorized which destination/version and whether an effect happened. Separate business history, permission audit and redacted transport evidence (R04/R08/R09; C03/C07/C14).                                                                                                       |
| 19  | Dependency and integration risks                             | **Yes**                                     | Actual OAuth breadth, rate limits, API version changes, provider defaults and undocumented conditional behavior differ. Qualify each profile; do not assume Google guarantees apply to Graph (R02/R06/R09; C04/C10/C13/C14).                                                                                               |
| 20  | Migration, rollout and upgrade risks                         | **Yes**                                     | Old code, backfills and restored queues can leak/replay content after intent changed. Additive rollout, strict version gates, no auto-enrollment and current-authority restore reconciliation are required (R10; C15).                                                                                                     |
| 21  | Testability, traceability and proof                          | **Yes**                                     | “Automatic updates work” is too vague and existing settings UI proves nothing. Record exact owner amendments, C/P trace and real adapter/database/UX evidence, preserving known gaps (R10; C16/P01–P16).                                                                                                                   |
| 22  | Other development hazards                                    | **No additional independent concern found** | Checked money precision, financial invariants, public/CMS publication, newsletter consent, third-party dependency additions and the old stack. This copy admits no money values, public publication or new dependency. Shared risks in those areas remain covered by R01–R10; no speculative extra subsystem is justified. |

## Lifecycle and data model implications

The smallest durable model is the existing qualified source appointment plus P31
connection, one managed-copy binding, desired source revision, retained attempt
receipts and shared outbox work. These are required facts, not a mandate for five
new tables. Do not duplicate source content into a provider-owned CRM record.

| Entity / fact                             | Authority                           | Required invariant                                                                                                                                           |
| ----------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Appointment schedule/cancellation/outcome | Proposed P9 source, surfaced by P28 | Source mutations are authorized/versioned; cancellation and recorded outcome are distinct; elapsed time is not completion.                                   |
| Deliberate copy selection                 | P28 purpose through source command  | At most one active or unresolved binding per appointment/principal/context initially; destination is exact and immutable for that binding.                   |
| Credentials/account/calendar              | P31                                 | Verified stable external identity; connection generation fences attempts, not business identity. Credentials never enter client data or outbox payloads.     |
| Desired external representation           | Source-qualified projection         | Derived from current admitted appointment revision; no new authority from a cached payload.                                                                  |
| Attempt/result                            | P31 with source correlation         | Submitted envelope is immutable; accepted, rejected and unknown are distinct; late evidence cannot reactivate work.                                          |
| Provider event                            | External copy                       | Provider is authoritative about acceptance/current external content; Asym remains authoritative about intended native appointment. Disagreement is explicit. |

The binding has not-added, enabled and stopped intent; delivery can independently
be pending, confirmed, unknown, rejected/conflicted or removal-pending/removed.
Those orthogonal facts should not become one giant overloaded status enum. UI
collapses them into the few understandable states above. A canceled source cannot
be reactivated by provider responses. A deliberate future rebooking is a source
command with its own qualified identity; no silent reuse of an uncertain old copy.

Source-first commit plus durable outbox solves local partial writes; it cannot
make a database transaction atomic with Google/Microsoft. If stop wins before
dispatch authorization, no new provider request begins. If dispatch began first,
the remote request may succeed after stop: retain evidence and perform only
qualified cleanup. No distributed lock can promise recall of an already observed
external calendar entry.

Schema design must also specify nullable receipt fields by lifecycle, trusted
server timestamps, positive revisions, end-after-start constraints, connection/
copy lookup indexes and bounded pending-work indexes. Index referencing FK columns
where query plans justify them. Source deletion uses governed retention rather
than cascading through unresolved effects; attribution remains meaningful if an
account is removed. No monetary column or new money calculation is introduced.
A source link must recheck access after login/Tenant switching; it must not disclose
another Tenant's title or confirm hidden record existence through errors.

## Required outcome proofs

These are ratified future acceptance requirements, not claims of tests already passed.

| ID  | Falsifiable acceptance scenario                                                                                                                                                                                                                                                                                                                               | Clauses         |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| P01 | With no connection or provider offline, a missionary saves/reschedules/cancels an appointment and records its real outcome; no provider field blocks native work. Connect alone exports zero appointments.                                                                                                                                                    | C01–C03/C12     |
| P02 | Existing meeting tasks lacking interval/zone cannot be silently exported; a qualified timed appointment retains exact schedule/revision; task completion and provider acceptance do not create attendance/history.                                                                                                                                            | C02/C09         |
| P03 | First/repeat Add shows exact destination and copy preview; canceled OAuth and denied capability add nothing; confirmation appears only after current-version evidence.                                                                                                                                                                                        | C03–C05         |
| P04 | Cross-Tenant/principal IDs, mixed account/calendar references, callback swaps/replay, expired/revoked permission and stale service-owner contexts are denied across command, readback, queue, repair, cache and deep-link paths.                                                                                                                              | C04–C06         |
| P05 | Test real anon/authenticated/non-owner/service paths for reads/inserts/updates/deletes; old-row permission cannot authorize Tenant/actor/destination rebinding; internal tables, views/RPCs, storage/exports and credentials expose no alternate path.                                                                                                        | C04–C06         |
| P06 | Concurrent Add requests with different HTTP keys yield one durable business copy; source/audit/outbox roll back together; stale expected revision is rejected; post-commit process loss preserves work.                                                                                                                                                       | C06/C07         |
| P07 | Provider accepts create but response is lost; retry, lease expiry, job duplication and credential rotation produce no fresh-key replacement. Reconcile original exact identity. Unknown setup creation is also recoverable without name-only calendar matching.                                                                                               | C07/C08/C12     |
| P08 | Edit/delete a mapped event externally between read and write. Actual provider condition prevents stale overwrite/removal; unrelated fields remain; 404/403 ambiguity does not manufacture deletion. Unsupported conditional behavior blocks the provider profile.                                                                                             | C10/C13         |
| P09 | Exercise DST gap/fold, UTC-offset and date boundaries, half/quarter-hour zones, travel/view-zone change, end-before-start and source-zone edits; preview and provider event agree exactly. Unsupported all-day/series inputs fail clearly.                                                                                                                    | C09             |
| P10 | Exercise both real transaction orders for cancel/disconnect versus dispatch, late create acceptance, lost delete response, reconnect to same/different account and source outage. No stale operation revives or reroutes a stopped copy; unresolved cleanup is truthful.                                                                                      | C07/C08/C11/C12 |
| P11 | Inspect actual provider payloads, event visibility, reminders and attendee behavior. Asym-originated event payloads contain no excluded content, credentials or attendee list; incidental attendee data from targeted readback is not retained in logs. Externally added attendees cannot cause an unselected email/cancellation through later update/delete. | C05/C10/C13     |
| P12 | On phone, narrow/zoomed layout, keyboard and screen reader, representative missionaries can connect/add/change/cancel/recover/disconnect and explain what is copied and what remains after disconnect. Record task success, errors and comprehension; fix observed ambiguity.                                                                                 | C03/C09/C12     |
| P13 | At each declared supported workload and provider quota, bounded fair dispatch preserves accepted work, respects Retry-After and avoids unrelated calendar reads; measure native-save and queue latency separately. Limits must be recorded before activation.                                                                                                 | C12–C14         |
| P14 | Exercise old/new app-worker-schema combinations, interrupted backfill, feature disable and restoring a backup with stale tokens/accepted jobs. No automatic enrollment or unsafe dispatch/recreation occurs; missing post-snapshot evidence remains recovery unknown, never proof of absence or permission.                                                   | C08/C11/C15     |
| P15 | Trace decision/glossary to owner amendments, OpenSpec/design/tasks/issues/tests/release; verify the retained P31 Support Feed consumer and other P28 decisions remain intact.                                                                                                                                                                                 | C02/C13/C16     |
| P16 | From durable evidence an authorized operator can explain source acceptance versus provider outcome, recover safely with original identity and handle removal/retention without direct SQL repair or exposing private payloads. Alerts have accountable owners and tested routing.                                                                             | C08/C12/C14–C16 |

## Synthesis and implementation order

**Resolved before recording this reviewed answer:** the selected A means deliberate
one-way personal copies; connection is not bulk export; native truth and provider
state differ; subscriptions are not interchangeable with confirmable updates;
the current task/UI is insufficient; unknown effects cannot be retried as new
business effects. This review resolves those ambiguities and supplies exact
corrected language. No further generic approval question is needed to finish it.

**Capture during authorized specification, in dependency order:**

1. Qualify the small P9 appointment source and P28 export purpose with P12, including
   actual field classification, temporal meaning and current permissions. Update
   the source/glossary/OpenSpec trace together; do not silently extend Tasks Hub.
2. Qualify one concrete P31 provider profile end to end. Prefer the narrow
   app-created-calendar option first; prove exact setup/event identity, scopes,
   conditional changes, side effects and cleanup. A failed provider qualification
   withholds that provider, not native scheduling. No unsupported-provider button.
3. Specify/implement the atomic source-command/outbox and stable-copy constraints,
   then the full ordinary UI and recovery journey. The interface remains small
   because consistency/recovery belongs in shared owners, not user settings.
4. Pass actual role/database/concurrency/provider/timezone/migration/accessibility
   proofs, and representative-user tasks, before a limited opt-in activation.
   Publish the supported profile and measured operating envelope. Expand providers
   only when they pass the same contract; do not lower safeguards for nominal parity.

**Required implementation safeguards:** C01–C16/P01–P16 are release gates,
particularly current authority, limited projection, semantic uniqueness, immutable
attempt correlation, conditional provider mutation and truthful revoke/removal.
They are not risks merely to monitor. A missing guarantee requires a safe narrower
profile or withholding the adapter; a settings toggle is not a workaround.

**Residual operational monitoring:** thresholds below are ratified operational
policy for future implementation, not observed baseline statistics or provider delivery guarantees.

| Signal                                                                                         | Threshold                                                                                          | Accountable owner                     | Required response                                                                                                                                                   |
| ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unauthorized destination/content, duplicate managed effect or post-fence new dispatch          | Any confirmed instance                                                                             | P12/security + P31 adapter owner      | Contain the affected profile, preserve evidence, reconcile affected copies and requalify before resuming.                                                           |
| Accepted calendar intent without a terminal/attention outcome                                  | Oldest unresolved intent exceeds 5 minutes                                                         | P31 operations owner                  | Inspect provider/queue health and original correlation; surface persistent delayed status; retry only when safe. Never silently drop/recreate.                      |
| Cancellation/removal not confirmed                                                             | Still unconfirmed 60 seconds after native cancellation/removal                                     | P28 journey owner with P31 operations | Keep explicit Removal pending/Needs attention and safe calendar link; investigate under original identity. This is an attention threshold, not a removal guarantee. |
| Provider scope/schema/conditional contract changes, permanent rejection or revoked credentials | Any detected incompatible change or permanent failure                                              | P31 adapter owner                     | Pause affected operations, expose the relevant repair and requalify the profile; do not broaden permissions silently.                                               |
| Incorrect comprehension, inaccessible action or misleading saved state                         | Any reproducible critical task blocker or mistaken disclosure/removal belief in supported journeys | P28 UX/accessibility owner            | Correct copy/flow and repeat the affected task before expanding rollout. No claimed success percentage without a study.                                             |
| Throughput exceeds tested envelope or a tenant starves another                                 | Any breach of the declared profile limit/fairness contract                                         | P31 operations + database owner       | Apply admitted backpressure, preserve durable work and remeasure before raising limits; never accept and discard.                                                   |

## Verification and limits

The [local mechanics probes](d14-evidence/mechanics-probe.md) passed **24/24**
expected model outcomes, including two deliberate unsafe counterexamples. They
challenge retry/fence/time assumptions in
a small model; they are not Core, PostgreSQL RLS, live-provider or browser proof.
[Technical research](d14-evidence/technical-and-proof-boundaries.md) documents the
primary Supabase/PostgreSQL/OAuth/accessibility sources used. Independent owner,
current-source/UX and provider reviews were reconciled into this decision.

Formatting, local links, decision/category/requirement/proof identifiers and the
unchanged founder brief are checked separately. No application code, database,
provider credential, external calendar, live tenant setting, notification,
dependency, formal owner/OpenSpec file or GitHub issue was changed by this review.
