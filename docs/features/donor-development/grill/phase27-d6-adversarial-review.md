# Phase 27 D6 — chosen internal review date for paused cultivation

Reviewed 2026-10-10 against Core checkout
`225c02e9499bd6c0d493223cd4b1a4120ff787e3`.

**Disposition: Accept with required amendments — ratified 2026-10-10.** The
founder explicitly confirmed, “Yes, ratify this amended D6.” The amended decision
and its required safeguards below are accepted. D1–D4 remain ratified and D5 A
remains selected. This review is a completed grooming artifact,
not a formal PRD/OpenSpec, implementation, activation, ticket or donor contact.

Founder: “A — Choose an internal review date. but make sure it will work well and
be congruent with the rest of Asym (core repo) product and the reminders will go
to the right place and work well.”

## Conclusion in everyday language

Keep A. When staff deliberately pause developing a ministry partnership, they
normally choose a date to reconsider that pause. Keep one review in the existing
shared work system. When it becomes due, show the currently responsible,
authorized person an internal notification that opens the right review.

The review is not a request to call the supporter. It never restarts work,
changes giving, or marks anything complete on its own. A departure, changed
lead, failed notification or unread badge must not make the obligation disappear.
If nobody is eligible, authorized staff can see that assignment needs repair;
Asym must not guess a recipient or reveal private ministry information.

The permanent solution follows Asym's accepted shared task and notification
architecture. It does **not** reuse the current finance task wrapper unchanged:
that wrapper defaults to the actor and Finance Operations, and its writes are
not one transaction. Current staff/missionary task surfaces also do not establish
a qualified shared reminder service. Those are adoption gaps to fix at the
existing owners, not reasons to build a separate donor-development inbox.

## Evidence, authority and limits

Evidence classes used throughout:

- **Repository intent:** ratified owner decisions, ADRs and applicable OpenSpec
  contracts. These govern design but do not prove delivery.
- **Current source fact:** inspected code, migrations and executed scoped checks
  at this checkout. No live environment or database was inspected.
- **Published practice:** current primary documentation retrieved 2026-10-10,
  with publication date/edition limits in the appendices.
- **Product judgment:** a proposed choice for Asym, identified as such. No
  invented church workflow, measured preference, load capacity or adoption rate.
- **Unknown:** a fact that has not been demonstrated; its proof gate is explicit.

| Evidence                                              | What it establishes                                                                                                                                          |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Ownership](d6-evidence/ownership.md)                 | P9/P27 source work, P12 authority, P6/P17 attention, P28 surfaces, ADR-0183/0027/0026, and exact applicability of adjacent policies.                         |
| [Implementation](d6-evidence/implementation.md)       | Current task tables/helpers, staff prototype, missionary paths, reminder gaps, contribution reminder patterns and installed/declaration version differences. |
| [Authorization](d6-evidence/authorization.md)         | Tenant/entity scope, current responsibility versus access, grants/RLS/service paths, safe recipient generations and protected output paths.                  |
| [UX](d6-evidence/ux.md)                               | Current surfaces/date differences; official CRM and accessibility evidence; mobile, date, notification and outcome criteria.                                 |
| [Ministry practice](d6-evidence/ministry.md)          | MPDX/TntConnect, Salesforce nonprofit and AFP evidence, counterevidence to excessive scheduling, and explicit limits of inferred agency needs.               |
| [Executed checks](d6-evidence/source-probe/README.md) | 48 existing tests, 2 source-service failure/retry counterexamples and 5 IANA calendar checks; exact environment and test limits.                             |

Important sources include [ADR-0183](../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:24),
[ADR-0027](../../../adr/0027-one-notification-presentation-and-engagement-model.md:18),
[ADR-0026](../../../adr/0026-contract-bounded-delivery-plans.md:17),
[P27](../../../prds/sitestacker-parity/roadmap.md:4085),
[platform boundaries](../../../../openspec/specs/platform-boundaries/spec.md:401)
and the [outbound-communications owner contract](../../../../openspec/changes/sitestacker-parity/specs/outbound-communications/spec.md:24).

External technical checks: [PostgreSQL 17 date/time](https://www.postgresql.org/docs/17/datatype-datetime.html),
[Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security),
and [Supabase changelog](https://supabase.com/changelog) were rechecked. PostgreSQL
`timestamptz` preserves an instant, not the originally entered IANA zone. RLS and
grants are separate; a service role can bypass RLS. **Do not repeat the inaccurate
shortcut that omitted `WITH CHECK` always permits row reassignment:** for applicable
policies PostgreSQL can reuse `USING`; the real obligation is to prove both old-row
and resulting-row authorization, including all permissive policy combinations.
The announced Data API default-exposure change is not evidence of this project's
configuration. D6 needs explicit grants and policy proof, not an assumption about
defaults. No new Supabase extension or vendor is required by this decision.

Conflicts resolved: ADR-0183 supersedes copying domain-specific task stores as the
future architecture. ADR-0027 supplies presentation semantics for admitted D6
attention. Its detailed Website access-request timing/cohort rules are scoped to
that source; D6 does not inherit them. A task plus notification pair for D6 is the
ratified D6 binding of this chosen review/reminder purpose, not a claim that every
task universally requires a notification. Vendor reminders do not override Core's
source, access, messaging or financial boundaries.

## Exact amended decision — ratified 2026-10-10

> **D6 — A deliberately paused ministry-partnership journey normally receives
> one internal review on a date chosen by an authorized person.** That review
> asks whether the work should remain on hold, resume or end. It neither contacts
> the supporter nor changes the partnership, gifts, commitments or other promised
> work merely because time passes, a message arrives, or someone reads it.
>
> If an actual review concludes that ordinary paused work should stay on hold,
> choose its next review date in that same action. Simply postponing the current
> review changes its date and does not count as a completed review. Exceptional
> undated holds remain a separate decision.
>
> Phase 27 owns the review obligation and its outcome. Use one appropriately
> qualified shared task and the existing notification system; do not create a
> separate reminder inbox, copied task, automatic recurrence or configurable
> reminder engine. An existing task may satisfy the review only if it represents
> this same authorized obligation, not merely the same person or date.
>
> Default responsibility is the ministry partnership's eligible lead. A
> separately authorized review assignee is permitted without changing the
> partnership lead. Route attention through current source responsibility and
> independent access, with source-controlled handoff. Preserve visible assignment
> recovery when no eligible person exists; never guess a creator, former lead,
> finance queue, administrator, ministry participant or broad audience.
>
> Staff find the review in the shared Mission Control Tasks Hub and authorized
> partnership context, with due attention in the established staff notification
> surface. A missionary receives only an independently qualified projection of
> the same work and attention in their workspace. D6's initial delivery profile
> is internal-only, using the exact P6/P17 contract. No new email, SMS, push,
> supporter notification or broad missionary inbox is implied.
>
> Preserve the chosen calendar date and its displayed governing work time zone.
> Keep upcoming, due and overdue work truthful; worker delays or notification
> failure do not remove the obligation. A due notification remains actionable
> under the existing presentation policy until its source applicability ends.
> Reading, archiving, deleting or completing a generic task cannot substitute
> for the authorized source review.
>
> Save the source decision, review schedule, responsibility, history and durable
> projection intent consistently. Retries must return the same accepted effect.
> Rescheduling, handoff, access loss, review, resumption and ending invalidate
> stale pending attention without rewriting history or dropping unrelated work.
> This is a chosen-date default, not a fixed cadence or a requirement to revisit
> every permanent restriction indefinitely.

## Exact requirements to carry into the later spec and design

These are the ratified safeguards and proof obligations of D6. They are not
formal specification publication. Numbering is stable for traceability.

**R01 — Scope and proportion.** Dated internal review is the normal deliberate
temporary-pause path. Do not infer a pause from delayed response, a gift, travel,
home assignment, an expired task, score or one postponed ask. No fixed weekly,
monthly or annual interval; no automatic repeated reminder or manager approval.
Permanent contact restrictions and ended cultivation retain their own source
meaning. Exceptional undated holds are not authorized by D6; if later proposed,
they require a distinct owned exception contract, not a blank date loophole.

**R02 — One source obligation.** P27 owns one current review obligation for the
selected pause/review occurrence. P9/shared work coordinates its admitted task;
P6/P17 owns recipient attention/delivery; P12 owns authorization. There is at most
one shared task identity per occurrence and at most one active row per admitted
recipient/role/surface. No writable portfolio, calendar, notification or workflow
state may become review authority. Reuse existing work only through an explicit
same-obligation link and source-compatible closure; never repurpose a promise,
call task or another review simply because its date matches.

Reuse requires independently authorized observation of the task identity and
the selected reuse effect. Deduplication grants no access and reveals no hidden
task. Without the minimum observation authority, hidden-present and hidden-absent
cases receive the same safe denial/defer outcome.

**R03 — Correct responsibility.** Default to the current eligible partnership
lead from its authoritative responsibility source. A permitted explicit review
assignee is a separate, visible choice. Resolve recipients through exact current
Tenant Assignment/Party/role/surface and source eligibility; no email/name join
or caller-supplied actor identity. Assignment never grants access. A lead change
must explicitly reconcile open review responsibility, not silently overwrite
every task owner. An eligible retained explicit assignee remains responsible
unless the source handoff changes that assignment.

**R04 — Loss and handoff.** One expected-version source operation records the
responsibility change and its history. End the predecessor's current assignment
truthfully; preserve continuing recipients' engagement. Newly admitted recipients
receive only their independently admitted attention. Current access loss removes
protected projections immediately. Zero eligible recipients creates no personal
notification; partial or indeterminate resolution releases nobody. Keep the
review visible as needing assignment at the source to actors independently
authorized to repair that partnership's responsibility. Prove this recovery
surface before activation; do not introduce an implicit queue or super-reader.

**R05 — Destinations.** For staff, use the one shared Mission Control Tasks Hub
and the authorized CRM/partnership Tasks context. Due attention uses the established
staff notification surface and a typed authenticated source link. These are views
of the same work. For a missionary assignee, admit the same source identity only
through the existing qualified P28/contextual missionary task and notification
projection; no staff-only route, copied missionary task or automatic ministry-
membership disclosure. Do not enable a recipient/surface combination whose task,
link, source action and attention route have not all been qualified.

**R06 — One internal attention contract.** Register a finite P27 review-due
producer contract through P6/P17 before promising reminders. Initial D6 delivery
is in-product only; exact recipient, source occurrence, schedule/responsibility
generation, applicability/end and safe payload are part of its binding. Use
`presentation.source_actionable_then_recent_90d@1`: read does not remove required
work, archive is unavailable while actionable, and source end starts the existing
90-day authorized Recent presentation ceiling. Access loss remains immediate;
durable body-free audit follows its separate retention policy. Do not revive
ended engagement on restored access or retry. No optional channel, digest,
escalation, snooze policy or default email is added by this decision.

**R07 — Calendar semantics.** The UI asks for a calendar date, not a time of day.
Use the Tenant's authoritative work time zone as the initial governing IANA zone,
show it beside the date, and save the chosen date and that zone with the source
schedule. Missing/invalid zone must be resolved explicitly through shared-work
setup rather than guessed from the browser. The date stays stable across travel,
recipient changes and later Tenant time-zone edits. Such edits do not silently
reschedule accepted work. Due begins at the first valid instant of that calendar
date in the saved zone; a nonexistent calendar date is rejected with a correction
message. Overdue begins on the following local date if review remains required.
Today is valid; ordinary new scheduling in the past is rejected. Preserve a
server-derived UTC due instant and conversion provenance consistently; time-zone
rule updates require controlled reconciliation rather than different readers
silently computing different schedules. No exact-minute notification promise or
one-hour-before default is inferred. Imports of historical due work use R15.

**R08 — Source review and end.** Before the date, work is Upcoming; on the date,
Due; afterward, Overdue describes the internal review, never the supporter. Due
and overdue are derived from the source schedule, not independently writable
states. Only an authorized source action records Reviewed/keep on hold with the
next deliberate date, Resume, or End, with the relevant existing obligations
accounted for. Keeping a hold after an actual review completes this review
occurrence and creates the next deliberately scheduled occurrence atomically;
merely changing an uncompleted date revises the current occurrence. No generic
Complete/Delete/Dismiss/Reopen/API/bulk/AI route may bypass source closure.
The full journey lifecycle/uniqueness contract remains a separate interview
branch; these actions do not decide that contract by implication.

**R09 — Atomic acceptance and durable effects.** The source write atomically
records the accepted pause/review schedule or its revision, responsibility,
history, semantic command receipt and the durable requirement to materialize
shared work/attention through existing platform seams. A failed required write
rolls back acceptance. Derived materialization may retry after commit; the source
shows the saved obligation and truthful pending/error state until reconciled.
No network/provider call inside the source transaction; no new generic outbox
platform where the existing owner seam suffices. Source save is not proof that
a notification was created, delivered, read or reviewed.

**R10 — Stale work and idempotency.** Expected source/schedule/responsibility
versions serialize competing transitions. A durable command replay returns its
original receipt only through a currently authorized result projection; current
authorized source state is disclosed separately and the old mutation is never
rerun. Changed semantic input under the same key conflicts. A due
worker rechecks current source applicability, due schedule and recipient authority
before admitting attention. Product uniqueness covers the source review occurrence,
current attention generation and exact recipient/role/surface; transport IDs and
date strings alone are insufficient. Rescheduling before attention release fences
old work; if release wins first, later revision ends only its old applicability
and any new due attention has an explicit successor identity. Never retarget an
already prepared old-recipient envelope to a new person. Retries, lost responses,
overlapping workers and native/Studio execution cannot create a second intended
task or attention occurrence. No clock tick itself resumes cultivation.

**R11 — Supabase integrity and authorization.** Derive Tenant, actor, audit
attribution and execution identity from trusted context; validate selected source,
date and assignee against current authority. Use tenant-aware keys/FKs across
review, journey, ministry, work and recipient bindings, preserving exact Legal
Entity source scope. Required identity/date/zone/revision fields are non-null;
enforce valid state/field combinations, positive revisions and semantic uniqueness
at the owning transaction/database boundary. Reject updates that move a permitted
row into a forbidden Tenant/entity/source/owner or bypass lifecycle. Prove grants,
RLS `USING` and resulting-row `WITH CHECK` behavior, all combined policies, views,
RPC execute privileges/search paths and privileged workers. Do not expose a new
table just to make a browser write work. Prefer source-controlled mutation over
unrestricted generic table updates. RLS alone does not validate business action
or conceal every unique/FK conflict. Return permission-safe outcomes. Index
actual scoped due-work and recipient predicates, including referenced keys.

Every schedule/edit, deferred execution, read/count, repair, notification
admission/presentation and result/replay disclosure re-proves the applicable
current Principal and Tenant Authorization Context: human Active Tenant Assignment
or the applicable Service/Operator context, exact scope, door-declared processing
purpose, field/history floors, capability and current authorization/governance
epoch. Fence consequential execution against stale source or authority.
Background work never fabricates or borrows a human assignment. Authorized
multi-Legal-Entity access within the active Tenant remains possible under the
exact current grants; same-Tenant membership alone is insufficient.

**R12 — Privacy and retention.** Default task/notification copy is a neutral
internal-review title, permitted date/status and typed source link. Protected
pause reasons, supporter notes, member-care details, worker locations and private
ministry identity remain at the authorized source. No donor/public projection.
Recheck lists, counts, search, caches, exports, realtime subscriptions, audit views,
generated documents and links; changing tenants invalidates scoped presentation.
Do not add storage objects. No historical cascade delete or hard deletion of
actors may silently erase accepted review/receipt history. Separate editable
business context from append-only attribution and retention-limited presentation;
apply owner-controlled anonymization and backup/export policy without copying
protected bodies into an allegedly permanent log.

Before restored readers or workers activate, reapply current revocation,
redaction/expiry and consumed/cancelled occurrence authority. Restore cannot
revive old recipients, erased payloads or consumed attention; if current fences
cannot be recovered and reconciled, hold affected delivery/presentation rather
than guessing from the old snapshot.

**R13 — Coherent low-friction UX.** One contextual pause action shows the chosen
date, governing zone and responsible person; ask only for missing or materially
changed facts. Show the saved review and clear Review action in existing work
views. Keep due review visible after a notification is read. No duplicate reminder
dialog, separate enrollment, compulsory supporter contact or fixed cadence.
Use shared Base UI/base-maia controls, keyboard/text date entry, accessible labels,
inline errors/status announcements, non-color state and mobile layouts. Preserve
input on failed or interrupted saves and resolve ambiguous success from the
durable receipt before offering another submission. No claimed offline mutation
support; refetch authoritative state on reconnection. Respect international names
and locale display without changing stored date meaning.

**R14 — Recovery and operations.** A lost trigger or failed notification leaves
the source obligation discoverable and its due state correct. Existing durable
dispatch/reconciliation must recover accepted work without requiring an open
browser or optional Studio. Page due work by indexed, deterministic scope/time/ID
and bound each execution; isolate tenant backlog, use retry limits/backoff and
lease/version fencing, and expose permanent failures to the platform operator.
The partnership lead owns review follow-through; authorized assignment managers
own missing responsibility; platform operations owns materialization failures.
Do not create another cultivation task or donor message to report a reminder
failure. No manual SQL is the normal recovery path.

**R15 — Activation and migration.** Qualify one complete producer/task/recipient/
surface/notification profile before enabling new D6 pauses for that cohort.
Expand schema and qualified readers before writers; drain or fence incompatible
workers before changing semantic identities. Map legacy tasks/reminders only
with proved source identity, responsibility and date meaning. Ambiguous rows
become governed migration exceptions, never guessed leads/dates. Backfill starts
without notification effects. Reserved-to-Live activation never replays
historical notification candidates. Attention for still-current legacy work
requires a separately qualified prospective P27 source transition after
activation; migration or cohort review alone is insufficient. No launch-time
storm. A delivery kill switch stops unadmitted attention while
source work remains findable; rollback preserves new source receipts/history,
using compatible readers or roll-forward rather than destructive table removal.

**R16 — Proof and measured limits.** Before activation, execute the acceptance
matrix below against actual Supabase constraints/policies/commands and every
enabled surface, including controlled races and response loss. Qualify declared
record counts, recipient counts, due-event burst, concurrent users/workers and
query plans for the intended rollout; no capacity claim from stubs or a table's
existence. Reuse P6/P17 latency/throughput budgets when stricter. The initial
planning operational alert threshold for an eligible, still-current due review
whose required local attention has not materialized is **15 minutes past its
eligible due instant**. Measure from the later of the calendar due boundary and
the authoritative acceptance of the current schedule/recipient eligibility, so
a review first scheduled for today is not instantly a late-delivery failure.
Retries or repeated worker checks never restart that clock. This is a planning
operational threshold, not a measured
guarantee or an exact-time user promise. Prove recovery at the rollout envelope
before enabling it. Diagnostics may contain safe IDs and typed reasons, not
protected source text.

## Category-by-category adversarial review

Severity is the consequence if the flaw is adopted; likelihood is qualitative
design risk, not an observed production rate. “Likely” means the current code or
ordinary workflow makes accidental adoption credible; “plausible” means a
realistic failure path without measured frequency. No finding claims D6 is a
shipped vulnerability. Each category states its own result and maps to exact
amendments above and falsifiable acceptance below.

### 1. Problem validity, necessity, and alternatives

**Material concern: Yes — an intentional review can become unnecessary recurring
administration. Severity: Medium. Likelihood: Plausible.** A mandatory repeated
date for every quiet or permanently restricted relationship would create empty
work and pressure to make inappropriate contact. The real problem is an accepted
internal review being forgotten, not all relationships needing frequent touch.
TntConnect's definite-obligation guidance is counterevidence to blanket task
creation; MPDX's Ask in Future supports ordinary deferred follow-up, not a pause
engine ([ministry evidence](d6-evidence/ministry.md)).

**Effect on A:** narrows it to the stated chosen-date default. The strongest
alternative is an explicitly owned undated hold awaiting an external change;
that reduces scheduled review but weakens discoverability unless its separate
exception contract is defined. Existing dated shared work is the simpler solution
for the selected ordinary path. **Permanent fix/exact change:** R01–R02; do not
infer recurrence, undated exceptions or pause from one delayed ask. **Proof:**
AC01/AC13 plus no task emitted merely from travel, contact status or gift arrival.

### 2. Brittleness

**Material concern: Yes — date, recipient and implementation assumptions can
silently change. Severity: High. Likelihood: Likely if existing code is copied.**
A creator may leave; a lead may travel; a date-only value may be rendered on the
previous day; the current reminder table may be mistaken for a working scheduler.
Current surfaces use inconsistent date conversions and the runtime reminder path
is not qualified ([implementation](d6-evidence/implementation.md)); the calendar
probe demonstrates real 23/25-hour and date-shift counterexamples.

**Effect on A:** changes its supporting guarantees, not the chosen review purpose.
**Permanent fix/exact change:** R03–R07 and R10: authoritative current routing,
recorded calendar meaning, source revisions and explicit surface qualification.
**Proof:** AC03/AC06/AC09 reject stale recipients and keep the saved date stable
through timezone/lead changes and late execution.

### 3. Technical debt

**Material concern: Yes — copying existing task/reminder paths would preserve
fragmented authority. Severity: High. Likelihood: Likely.** The finance wrapper,
admin prototype and missionary task paths have different persistence, assignment
and completion behavior. Another P27 reminder store or polymorphic metadata blob
would make eventual shared-task convergence more expensive. ADR-0183 explicitly
exists to solve this fragmentation; source findings show it is not yet a reason
to assume the convergence is implemented.

**Effect on A:** changes the implementation path. **Permanent fix/exact change:**
R02/R05/R09/R15: add the finite P27 source contract to the existing shared owners;
do not create a second task engine or retain indefinite dual writers. **Proof:**
AC01/AC03/AC15 demonstrate one authority through migration, views and retries.

### 4. Edge cases

**Material concern: Yes — partial pauses and changed circumstances can discard
real obligations. Severity: High. Likelihood: Plausible.** One postponed ask can
be mistaken for a paused partnership; a departed lead, closed ministry, identity
merge or permanent contact restriction can make the original next step wrong.
Ratified D2/D3 preserve real people, independent asks and historical meaning;
source obligations do not end by changing cultivation state.

**Effect on A:** narrows applicability and requires explicit correction/end
handling. **Permanent fix/exact change:** R01/R04/R08/R10/R12 plus the scenario
table below: preserve unrelated work and route exact invalidation through its
owner. **Proof:** AC06/AC10/AC13, including a delayed equipment ask while ordinary
stewardship continues, merge collisions and permission loss before the review.

### 5. Footguns

**Material concern: Yes — familiar buttons/defaults can do the wrong thing.
Severity: High. Likelihood: Likely without guardrails.** Generic Done/Delete,
drag-to-complete, a one-hour-before reminder, “Follow up” copy, or assigning the
clicking person can falsely satisfy review, prompt contact, or route it to Finance.
These are concrete current patterns, not hypothetical exotic configuration.

**Effect on A:** changes controls and default routing. **Permanent fix/exact
change:** R03/R06–R08/R13: neutral Review wording, no auto-resume/contact, source-
controlled transitions and server rejection of incompatible generic actions.
**Proof:** AC02/AC05/AC09/AC12 through keyboard, bulk, direct API and UI paths;
hidden controls alone do not count as enforcement.

### 6. Tenant safety

**Material concern: Yes — recipient joins and projections can cross scope.
Severity: Critical. Likelihood: Plausible.** Profile/email/name joins, a stale
selected Tenant, weak task-link FKs or cache keys could expose a church or sensitive
ministry to another organization. Existing task tables include tenant columns
but simple UUID references do not themselves enforce all same-tenant relationships
([authorization](d6-evidence/authorization.md)).

**Effect on A:** adds a release-blocking invariant. **Permanent fix/exact change:**
R03/R05/R11–R12: exact Tenant/entity/source/assignment/role/surface binding, current
authorization for every output and tenant-aware relationships/cache invalidation.
**Proof:** AC04/AC11 with overlapping display names, cross-tenant referenced IDs,
tenant switches, deep links, pagination, exports and background execution.

### 7. Database, RLS, and authorization safety

**Material concern: Yes — table presence or RLS enablement can be mistaken for
authorized, atomic behavior. Severity: Critical. Likelihood: Plausible.** Current
task tables revoke browser grants and allow service-role access; service roles
bypass RLS. Generic callers can still be wrong about tenant or recipient. Split
writes can leave a task without links/history; mutable status can bypass source
closure. An allowed row update might change its source/owner into a forbidden
state. Current migration tests are structural, not live-policy proof.

**Effect on A:** requires the proper shared mutation boundary before reuse.
**Permanent fix/exact change:** R09–R12 explicitly cover keys/FKs, nullability,
checks, semantic uniqueness, deletes, append-only history, trusted attribution,
grants, both update predicates, views/RPCs, service paths and indexes. No new money
columns or rounding algorithm are necessary; retain source finance precision.
No new object storage is needed. **Proof:** AC04/AC07/AC08/AC11 against actual
Supabase direct/API/privileged paths; no policy proof inferred from test stubs.

### 8. Overengineering

**Material concern: Yes — adjacent reminder frameworks can overwhelm a simple
review. Severity: Medium. Likelihood: Plausible.** Importing Website courtesy
cadence profiles, a new coordinator hierarchy, generic workflow language, custom
notification inbox or configurable multi-channel escalation solves unrequested
problems. Those policies have separate source meanings and constraints.

**Effect on A:** narrows the solution. **Permanent fix/exact change:** R01–R02,
R05–R06 and R14: one review, shared work, one internal due attention and existing
execution/recovery seams. No new vendor, timer platform, policy DSL or mandatory
external channel. **Proof:** AC01/AC03/AC14; review the dependency graph for one
source owner and native operation without optional Studio/email.

### 9. UX/UI and user friction

**Material concern: Yes — staff can fail to find or understand the review.
Severity: High. Likelihood: Likely if prototypes become the contract.** Multiple
task destinations, a demo bell, ambiguous calendar conversion, duplicate reminder
setup, hidden work after read and a staff-only missionary link make the feature
unreliable in daily use. Official Salesforce/Virtuous/Blackbaud examples support
contextual task visibility; W3C/GOV.UK evidence supports clear dates, accessible
input and status, not a specific Asym lifecycle ([UX evidence](d6-evidence/ux.md)).

**Effect on A:** changes the interaction and route qualification. **Permanent
fix/exact change:** R05–R08/R13: one contextual save, visible date/zone/responsible
person, ordinary work surfaces and source Review action; preserve slow-network
input, locale meaning and independent missionary access. No donor checkout step.
**Proof:** AC03/AC09/AC12 with keyboard, screen reader, touch, mobile width and
interrupted connection. Real mission-user feedback remains a release validation
need, not a fact claimed from vendor documentation.

### 10. Source of truth, ownership, and domain invariants

**Material concern: Yes — notification or task state can become shadow review
truth. Severity: High. Likelihood: Likely without an explicit contract.** A read
badge, Complete checkbox, calendar event or worker flag could falsely mean the
pause was reviewed, or two independent task copies could disagree. ADR-0183 and
ADR-0027 expressly separate these facts.

**Effect on A:** clarifies the authoritative model. **Permanent fix/exact change:**
R02/R06/R08–R10: P27 source outcome; one current review/task; recipient-specific
attention; immutable accepted history; derived due/overdue; no finance or consent
mutation. Completion, cancellation and recurrence have source receipts.
**Proof:** AC01/AC05/AC10/AC13 enforce cardinality and valid state combinations
through the authoritative transaction and database, not UI convention.

### 11. Hidden coupling

**Material concern: Yes — reminder delivery can accidentally depend on unrelated
surfaces or providers. Severity: High. Likelihood: Plausible.** Requiring optional
Studio, a live browser, an email provider, a donation, a public page or a staff
role could prevent legitimate review work or widen access. P27 requires native
reminders; P28 reuses shared work under independent grants; in-product-only
qualification need not wait for an email provider.

**Effect on A:** changes dependencies. **Permanent fix/exact change:** R05–R06,
R09/R14–R15: source-owned scheduling, role-qualified routes and internal-only
delivery. Financial and public facts remain read context if separately allowed.
**Proof:** AC03/AC13/AC14 with Studio/email disabled and no donation/public page.

### 12. Failure modes

**Material concern: Yes — a committed source change can lose its follow-through.
Severity: High. Likelihood: Plausible, with a demonstrated reuse counterexample.**
A partial task write, dropped trigger, unavailable worker, failed projection or
lost response can leave invisible work or duplicate a retry. The current task
service probe shows an accepted task dependency before a link failure and a
second accepted task on unqualified retry; it does not claim live DB corruption.

**Effect on A:** requires durable acceptance/recovery. **Permanent fix/exact
change:** R09–R10/R14: atomic source/receipt/history/durable intent, truthful
materialization state and same-effect replay/reconciliation. No notification
failure marks review complete. **Proof:** AC07/AC08 at every write and post-commit
boundary, including source success with lost HTTP response and worker outage.

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: Yes — stale due work can survive a valid revision.
Severity: High. Likelihood: Plausible.** Rescheduling, review, resumption, handoff
and late worker execution can each look valid alone yet produce stale or duplicate
attention together. Timestamp-only or provider-request deduplication does not
identify the durable review effect. Current contribution RPC atomicity is useful
but not proof of a D6 expected-schedule fence.

**Effect on A:** defines review-specific transition semantics. **Permanent
fix/exact change:** R07–R10: date/zone provenance, expected-head mutation, one
current occurrence, successor review after deliberate completed review, and
immutable recipient-specific effects. **Proof:** AC06–AC10 with real overlapping
transactions, boundary instants, stale retries and both orders of release versus
reschedule/end. No automatic timer transition to active cultivation.

### 14. Data integrity risks

**Material concern: Yes — merges/imports or duplicate links can corrupt history.
Severity: High. Likelihood: Plausible.** Reusing a task by person/date, backfilling
from task descriptions or losing old ministry references can combine distinct
obligations and report a review that never occurred. Current generic link
metadata is not a sufficient source identity or uniqueness contract.

**Effect on A:** narrows reuse and correction. **Permanent fix/exact change:**
R02/R08–R12/R15: semantic identity, exact scoped relationships, historical source
meaning, explicit correction and effect-dark migration. No silent reparenting,
hard-delete repair or invented completed-review time. **Proof:** AC01/AC10/AC15,
including duplicate imports, merged identities and conflicting current reviews.

### 15. Security and privacy risks

**Material concern: Yes — safe-looking reminders can reveal sensitive missions
information. Severity: Critical. Likelihood: Plausible.** A pause reason might
contain member-care context or location; task titles/counts, exported lists,
push/email previews, logs or old-recipient payloads could disclose it. Assignment
does not authorize source disclosure, and old access does not remain valid.

**Effect on A:** changes payload, access and retention rules. **Permanent
fix/exact change:** R03–R06/R11–R12: neutral copy, authorized source loading,
current role-safe audience, no unsolicited channel, bounded Recent presentation
and separate body-free audit. Preserve authorized history without indefinite
protected copies. **Proof:** AC04/AC06/AC11 across caches, links, counts, exports,
logs and revoked recipients, not just the visible task page.

### 16. Scalability and performance risks

**Material concern: Yes — naive due scans and per-relationship workers can
degrade or starve tenants. Severity: High. Likelihood: Plausible at growth.**
Current reminder table presence supplies no indexed scheduler/load proof; current
UI pagination is not an authoritative work inventory. Unbounded polling, fanout
and client-loaded-row selection would miss or delay due work.

**Effect on A:** adds measured admission limits, not a speculative distributed
system. **Permanent fix/exact change:** R11/R14/R16: indexed scope/due predicates,
stable bounded paging, bounded retries, tenant fairness and production-shaped
query plans. Qualify recorded units/counts/bursts before rollout; use the explicit
planning 15-minute materialization alert threshold. **Proof:** AC16 at the
declared rollout envelope and just beyond admission limits; no scalability
claim is derived from the 50 stub/structural tests.

### 17. Operational burden

**Material concern: Yes — orphaned reviews can require recurring cleanup.
Severity: Medium. Likelihood: Plausible.** If nobody owns assignment repair or a
failed projection, staff may chase former employees, create replacement tasks
or request database fixes. Automatic repeated dates can also create busywork.
Current patterns do not qualify P27's recovery ownership.

**Effect on A:** clarifies normal recovery. **Permanent fix/exact change:**
R01/R04/R13–R15: source-visible assignment exceptions, ordinary work visibility,
same-effect platform recovery and no mandatory recurrence. **Proof:** AC06/AC08
plus a staff walkthrough of missing-lead repair and a platform recovery drill
without direct SQL or duplicate tasks.

### 18. Observability and auditability gaps

**Material concern: Yes — “reminded” can hide several different outcomes.
Severity: High. Likelihood: Likely without explicit evidence vocabulary.**
Scheduled, materialized, available, read and reviewed are different facts; a
worker success log is not review completion. Separate writes or mutable event
details can lose who chose or changed the date. Protected context in logs creates
a second privacy problem.

**Effect on A:** requires distinct durable and technical evidence. **Permanent
fix/exact change:** R06/R08–R10/R12/R14/R16: source receipts/history and trusted
actor attribution; projection/delivery outcomes and personal engagement separate;
safe correlation IDs, typed failure reasons and named monitoring ownership.
**Proof:** AC05/AC08/AC11 plus reconstructing save, reschedule, handoff and recovery
without reading protected source bodies from telemetry.

### 19. Dependency and integration risks

**Material concern: Yes — provider guarantees or package assumptions can be
mistaken for product correctness. Severity: High. Likelihood: Plausible.**
Execution deduplication windows do not enforce permanent business identity;
Inngest is not the source of schedule truth. Installed Supabase/SSR/Inngest/Vitest
versions differ from declarations in this workspace. A notification should not
depend on an unrelated email account or unsupported browser writes.

**Effect on A:** narrows dependencies and required proof. **Permanent fix/exact
change:** R06/R09–R10/R14–R16: internal-only delivery, product-held semantic
identity, current source checks and exact installed/deployed version qualification.
No new vendor/extension or webhook authority is necessary. **Proof:** AC07/AC14
with delayed/duplicate/missing executor events and provider outage. Future optional
external channels require their own delivery contracts, not D6 implication.

### 20. Migration, rollout, and upgrade risks

**Material concern: Yes — old writers or backfill can revive unsafe behavior.
Severity: High. Likelihood: Plausible.** Old clients may complete a source-backed
task generically, interpret the date differently or send all past-due reminders
at launch. Rolling back schema after new receipts exist can lose history. Current
prototype/legacy fields lack enough authority to infer accepted D6 obligations.

**Effect on A:** requires bounded activation. **Permanent fix/exact change:**
R11/R15–R16: compatible readers first, source-controlled old-path rejection,
effect-dark backfill, no historical catch-up, qualified prospective source
transitions for legacy current work, per-profile activation and
non-destructive rollback/roll-forward. **Proof:** AC15 with mixed workers/clients,
ambiguous data, interrupted backfill, disable/re-enable and post-write rollback.

### 21. Testability, traceability, and proof

**Material concern: Yes — a ratified idea or passing unit suite can be reported
as a working reminder. Severity: High. Likelihood: Likely without explicit gates.**
The current branch contains planning contracts; source tables and mocked tests
do not establish recipient routing, authorization, UI or production recovery.
The normal test runner also failed before startup here; that must not be hidden.

**Effect on A:** changes completion criteria. **Permanent fix/exact change:**
R16 and AC01–AC16, with this evidence chain carried through the authorized later
PRD/OpenSpec/design/issues/tests/release artifacts. Record explicit ratification
without implying implementation or activation. **Proof:** deterministic document/link
checks now; actual authorized source/DB/concurrency/browser/accessibility/migration
and workload proof at implementation. Current 50+5 checks retain exact limits.

### 22. Other development hazards

**Material concern: No additional independent concern found.** Checked for hidden
donor/public writes, altered money precision, new object storage, AI authority,
compulsory offline support, unbounded customization, destructive rollback and
unowned delivery. They are either absent from the bounded D6 solution or already
have concrete controls in R01/R05–R06/R11–R15 and the categories above. No extra
platform, compliance checklist or dependency is justified merely to lengthen the
review. This is not a claim that future implementation needs no further review.

## Lifecycle and edge-case resolution

These describe review obligations, not new database enums or a complete journey
state machine. Source applicability, responsibility eligibility, due status,
delivery and personal engagement remain separate axes.

| Situation                                                    | Required outcome                                                                                                                                                            |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Staff schedule a normal temporary pause                      | Save one dated review, its eligible responsibility or explicit source assignment exception, and history. Show Upcoming; no supporter contact.                               |
| Church asks only to discuss an equipment ask later           | Preserve other partnership work. A dated task for that ask may be sufficient; do not automatically pause the whole journey.                                                 |
| Today selected                                               | Save once, become Due in the saved zone, admit one eligible internal attention occurrence; never call it already reviewed.                                                  |
| Review date arrives while still paused                       | Current source-qualified recipient gets the one due attention; date changes no business outcome.                                                                            |
| Notification read; review untouched                          | Work stays Due/Overdue and in required attention. Read is personal engagement only.                                                                                         |
| Person chooses Keep on hold after reviewing                  | Record that review and deliberately choose the next review date; close the old occurrence, create its successor in the same source transaction. No automatic recurrence.    |
| Person merely postpones an uncompleted review                | Revise the current schedule with history; do not falsely count a completed review. Fence pending old attention and truthfully end old active attention if already released. |
| Two people reschedule, or reschedule races with resume       | One expected-head transition wins; the other receives a conflict/current authorized state. No two current schedules or silent last-write-wins.                              |
| Lead leaves, loses permission or changes                     | Preserve source work; source-controlled handoff or needs-assignment recovery. No task to their successor solely because a name/email matches.                               |
| Review has an explicit eligible assignee different from lead | Preserve the deliberate assignment until an authorized handoff; do not blindly follow every lead change.                                                                    |
| Review is no longer needed before worker wakes               | No stale notification admission. End existing task/attention applicability truthfully without invented read or completion.                                                  |
| Reminder save succeeds but response is lost                  | Read the accepted receipt; return the same review/work identity. Do not duplicate on retry.                                                                                 |
| Notification projection fails after source commit            | Source review remains visible; show/reconcile delivery state separately. Retry same effect, alert platform owner if threshold exceeded.                                     |
| Existing restriction or sensitive missionary context         | Review only from permitted information. No outreach exemption or copied protected reason. No disclosure through badge counts or exports.                                    |
| Valid existing promise/call/task is still outstanding        | Preserve it or explicitly handle it through its owner. Pause is not cancellation of every task, recurring gift or receipt.                                                  |
| Duplicate Party/ministry correction or merge collides        | Use owning identity/lifecycle correction contract; preserve old links/history. Do not silently merge review outcomes or create a new purpose to bypass collision.           |
| Tenant zone changes or lead travels                          | Accepted calendar date/zone remain; a deliberate source revision is needed to reschedule. Show governing zone to avoid different interpretations.                           |
| Deleted/anonymized person or ended ministry                  | Preserve lawful source attribution/history and stop ineligible attention; apply owner's retention and explicit future-work disposition.                                     |
| Indefinite or permanent no-contact situation                 | Do not manufacture endless dates or silently offer undated ordinary pause. Use the separately authorized restriction/end/exception behavior; D6 adds no such policy.        |

## Acceptance and traceability matrix

“Must pass” means a release condition for the later implementation, not a claim
that these behaviors were already exercised by this documentation review.

| ID   | Falsifiable outcome                                                                                                                                                                                                                                                                                                                                                                                                 | Requirements     |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| AC01 | One pause save and repeated identical submissions yield one current review and at most one source-backed task identity; wrong payload under a reused key conflicts.                                                                                                                                                                                                                                                 | R01–R02, R09–R10 |
| AC02 | Default is the qualified partnership lead; creator, overall Party rep, finance queue, ministry member and former lead receive nothing without explicit source qualification.                                                                                                                                                                                                                                        | R03–R04          |
| AC03 | Staff work list, authorized partnership context and due notification resolve the same review; allowed missionary surface resolves the same source identity, with a working role-safe link. Unsupported surface cannot activate.                                                                                                                                                                                     | R05–R06          |
| AC04 | Cross-Tenant access fails; cross-entity access without the exact current grant fails, while explicitly authorized multi-entity work within the active Tenant succeeds. Cover read/count/mutate/export/realtime/delivery and overlapping names. Forbidden scope/source/assignee changes fail in all admitted DB/RPC/API/privileged paths. Unauthorized hidden-task-present/absent reuse cases are indistinguishable. | R02, R11–R12     |
| AC05 | Due time, gift receipt, notification read/archive and generic task/bulk/API completion do not resume/end cultivation or satisfy review. Required work stays visible after read.                                                                                                                                                                                                                                     | R01, R06, R08    |
| AC06 | Eligible handoff, no eligible person, indeterminate resolution, revocation between check and release, receipt replay after revocation and restored access all preserve correct work/history without recipient guessing, unauthorized result disclosure or revived engagement.                                                                                                                                       | R03–R04, R10–R12 |
| AC07 | Controlled overlapping workers and response-loss retries create one intended attention. Reschedule/resume/end racing release cannot leave stale active attention or overwrite a successor's schedule.                                                                                                                                                                                                               | R09–R10          |
| AC08 | Failure injected at each authoritative write boundary rolls back acceptance; failure after commit preserves the source and is repaired from its durable identity. Retry never creates a replacement obligation.                                                                                                                                                                                                     | R09, R14         |
| AC09 | Date-only input, today, past rejection, 23/25-hour days, different hemispheres, travel, zone edits and a nonexistent date preserve the documented date meaning; no midnight-UTC shift or inherited one-hour reminder.                                                                                                                                                                                               | R07              |
| AC10 | Reviewed-and-continue records completion and a chosen successor date; rescheduling records a changed date without a completed-review fact. Resume/end explicitly account for open work.                                                                                                                                                                                                                             | R08–R10          |
| AC11 | No review title, payload, trace, export, cache, notification preview or generic task comment leaks protected pause reasons, care notes, worker location or unauthorized ministry identity.                                                                                                                                                                                                                          | R11–R12          |
| AC12 | Keyboard/screen-reader/mobile users can pause, correct a date error, find due work and record review; failed/slow saves retain input and truth. No notification-dismiss gesture hides unresolved work.                                                                                                                                                                                                              | R13              |
| AC13 | No donation, designation, commitment, consent, receipt, public page or unrelated task changes from pause, reminder, retry, review or notification engagement.                                                                                                                                                                                                                                                       | R01, R08, R12    |
| AC14 | Missing/Reserved notification contract cannot emit attention or delivery through an improvised sender; internal-only profile runs without email or optional Studio. No duplicate native/Studio effect.                                                                                                                                                                                                              | R06, R10, R15    |
| AC15 | Backfill and Reserved-to-Live activation emit no historical attention; any legacy-work attention proves its separately qualified prospective source transition. Mixed versions, disable/re-enable, rollback and a backup restored from before revocation/redaction/reschedule/completed review cannot revive recipients, payloads or consumed effects.                                                              | R12, R15         |
| AC16 | At the declared rollout data/tenant/concurrency envelope, scoped queries and due recovery meet measured owner budgets and the planning alert threshold, with a deliberately overloaded tenant unable to starve others.                                                                                                                                                                                              | R14, R16         |

Executed now: the [proof appendix](d6-evidence/source-probe/README.md) documents
50 passing scoped source/structural checks and 5 calendar checks. These support
identified counterexamples and reuse limits; **none is mislabeled as a complete
AC01–AC16 production qualification**. The standard repository test configuration
was blocked by an installed Sentry export mismatch; the scoped harness and its
limits are preserved. No full CI, live RLS, accessibility or workload result is
claimed.

Documentation verification passed: all 22 numbered categories have an explicit
material-concern disposition; every material finding has severity, likelihood,
effect on A, exact prevention requirements and proof references. R01–R16,
AC01–AC16, all seven required post-answer checks, 70 relative links across the
nine reviewed Markdown files, selected-versus-proposed status and the recorded
50+5 check counts were verified. Scoped formatting and whitespace checks also
pass. These verify the review packet, not application behavior.

## Ruthless synthesis: order, dependencies and stop conditions

1. **Before recording the amended decision:** retain A's chosen-date default;
   distinguish source work, attention and actual review; resolve exact destinations,
   source lead/assignee routing, no-recipient recovery, date semantics and source
   closure through R01–R08. This report resolved those recommendations, and the
   founder explicitly ratified amended D6 on 2026-10-10. No additional approval
   of the same decision is required; implementation qualification remains open.
2. **Capture in the later spec/design:** carry R01–R16 and AC01–AC16 through the
   P27 producer, P9/ADR-0183 shared-work, P12 recipient/access, P6/P17 in-product
   and P28 surface seams. Resolve remaining journey lifecycle and exceptional
   undated-hold product branches in this interview before final phase completion.
   They are not hidden D6 defaults. No new global ADR is needed to restate the
   accepted architecture. Use `/to-prd` for formal publication.
3. **Implement and qualify predecessor seams first:** qualify current responsibility
   resolution and source-authorized recovery; calendar semantics; atomic source
   mutation/receipt/history; then task projection/closure; then exact local
   notification profile and recipient surface. Replace or extend weak existing
   seams within their owners. Do not copy the finance wrapper, demo bell or old
   missionary browser-write path. Qualify role-safe read paths before fanout.
4. **Require implementation safeguards:** database constraints and current
   authorization, controlled race/failure tests, replay and source reconciliation,
   neutral payloads, privacy-preserving presentation expiry, measured indexed scans,
   migration fencing and compatible rollback. Activate only a complete tested
   profile. A safe internal-only profile has no Resend dependency and needs no
   new clock platform or optional Studio.
5. **Monitor only operational residuals after those gates:** use the table below.
   Missing authorization proof, an absent notification implementation, unresolved
   lifecycle semantics, unknown workload limits and inaccessible UX are **blockers**,
   not things to monitor after release.

| Residual signal                                                                                | Threshold                                                                                   | Accountable owner                                           | Required response                                                                                                                                                                                                                        |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Eligible current due review lacks its required local attention                                 | Age exceeds **15 minutes** after eligible due instant, excluding typed not-applicable cases | Platform operations/on-call                                 | Investigate source/dispatch/qualification, reconcile the same effect; disable new attention admission for broken profile if needed. Preserve source work; no substitute email. Threshold is a planning target, not measured performance. |
| Active review loses qualified responsibility                                                   | **One** proved-zero review or one indeterminate resolution                                  | P27 source owner; current authorized responsibility manager | Show source recovery exception immediately, resolve current assignment/eligibility; never broaden access or guess a queue.                                                                                                               |
| Scope leak, unauthorized recipient or duplicate durable active effect                          | **One** verified violation                                                                  | Security/on-call with P27 and P6/P17 owners                 | Stop affected profile, preserve evidence, revoke protected presentation, repair source/contract and requalify before resumption. These remain zero-tolerance release tests.                                                              |
| Permanent projection failure or retry exhaustion                                               | **One** typed terminal failure under the platform's existing retry policy                   | Platform operations                                         | Surface error and recover/replay original source identity; do not mark review complete or ask staff to repair SQL.                                                                                                                       |
| Human review remains unfinished past chosen local date                                         | **One** currently actionable overdue review                                                 | Current review assignee/partnership lead                    | Keep it visible in the existing due/overdue work view; review or deliberately revise it. No new automatic escalation/cadence.                                                                                                            |
| Staff cannot find/act on a review in the admitted surface, or can mistake it for donor contact | **One** reproducible failure in the supported task flow                                     | P27 product/design owner                                    | Fix the flow/copy or suspend that recipient/surface profile; repeat the affected accessibility/usability acceptance before widening rollout.                                                                                             |

Named owners here are product/operational roles, not newly invented capabilities
or actual personnel assignments. Map them to existing accountable teams at
activation. No quantified throughput, success rate, user preference or field
study result has been fabricated.

Traceability chain: [Q6 selection](phase27-q6-paused-work-review.md) → this amended
D6/R01–R16/AC01–AC16 → [grooming log](phase27-grill-log.md) and accepted glossary
meaning → later canonical PRD/OpenSpec/design → implementation tasks/issues →
source tests/qualified release evidence. Formal artifacts and GitHub tickets
have not been created or marked done. No new permission or delivery key is
reserved merely by a research note.

## Adversarial check

### What could go wrong with this answer?

The wrong person receives private context, a changed date leaves stale attention,
or “Done” hides an unreviewed pause. R02–R12 require one source obligation,
current authorized routing, source closure and fenced effects.

### What hidden assumptions are we making?

That current task/reminder surfaces already implement the intended shared model,
that everyone interprets a date identically, and that every pause deserves
recurring contact. Source inspection and calendar checks disprove those shortcuts.
No universal missions cadence or empirical user preference is assumed.

### How does this affect the whole product?

P27 supplies a narrowly owned work purpose to existing P9/shared-task, P12 and
P6/P17 seams. P28 receives only admitted projections. Finance, public CMS,
communication consent and optional workflow ownership remain with their sources.

### How does this affect the end-user experience?

Choose a date in context, see who is responsible, find the review in normal work,
and act from a working source link. Due means reconsider internally; reading a
notice does not lose work. No new inbox, duplicate task or compulsory contact.

### Does this follow modern best practices?

Official missions and CRM documentation supports dated work and contextual task
presentation, while TntConnect cautions against treating every interaction as a
scheduled task. Supabase/PostgreSQL evidence supports explicit authorization,
calendar semantics and durable identity. No vendor-specific policy overrides Core.

### Does this fit Asym’s existing repo and product direction?

Yes, as an extension of accepted source-owned work and notification contracts.
Some current implementation paths need qualification or correction; their existence
does not justify a second source store or define D6 behavior.

### Should we adjust the recommendation?

Keep A with the exact amendments above. The durable solution is one dated review,
one qualified source-backed task and separately governed internal attention to the
right current person, with visible recovery and no automatic business transition.
