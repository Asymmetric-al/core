# Phase 28 D23 — optional, personally configurable activity targets

Research date: **October 17, 2026, Asia/Bangkok**. Repository: Asymmetric-al/core,
HEAD 9cada8f3d8ab59db391d3fd20df77fcadeb09813.
Status: **Corrected decision and required amendments explicitly ratified on October 17, 2026, Asia/Bangkok.**
Disposition: **Accept with required amendments.**

This is the completed research/grill review, not a formal PRD, ADR, OpenSpec,
implementation or release qualification. The founder brief and earlier decisions
remain intact. No Q24 was posed in the initial review; subsequent ratification
and continuation are recorded below.

## Exact corrected decision to record

> **A — Optional, personally configurable activity targets.** Maya may choose
> targets for supported outreach activities, actual conversations or held meetings,
> use several separate targets, or use none. Five actual recorded outgoing calls,
> two of which became conversations, count as **five Calls made** and **two
> Conversations**. These overlapping measures are never added into seven activities.
>
> Maya controls the supported measure, positive whole-number quantity, personal
> name, schedule, start/end, overview placement and pause/resume. Weekly is the
> default schedule; Monthly and a one-off Custom date range are available. The
> canonical measure, exact dates and concise “What counts” explanation remain
> visible even when she gives the target her own name. No custom activity types,
> formulas, weighted scores, compulsory logging or imposed quotas are introduced.
>
> Progress is derived from qualified existing source records for Maya's actual
> participation in the explicitly identified ministry/workspace scope. Recording
> an activity once supplies its eligible measures. A task checkbox, note, dialer
> launch, scheduled meeting, email open or local send queue cannot manufacture
> actual contact. Names, dates, outcomes and source corrections retain their own
> meaning. Staff recording Maya's call does not make it the staff member's call.
>
> A target created for the current period compares the whole displayed period,
> including earlier eligible recorded activity. Maya can deliberately adjust this
> period, future periods, or both. Prior target versions remain understandable;
> corrections to actual activity can still change historical recorded counts.
> Pause removes the current active comparison and stops future target periods,
> while keeping source records and target history. Resume is deliberate, with no
> missed-period backlog or automatic proration.
>
> A complete permitted query may show **0 recorded calls**; it never asserts
> **no calls made**. Unknown dates, incomplete data, unavailable counts and current
> restrictions are handled truthfully. Activity targets do not send messages,
> create follow-up, change financial goals, publish a public metric, or grant
> staff/coaches access. Existing organization permissions and separately deliberate
> coaching disclosure continue to govern each exact action and projection.

The founder explicitly selected **supported activity types with personal
customization**. The four-measure catalog, bounded schedule choices, period/edit
rules and safeguards were proposed at initial review and are now explicitly
ratified as recorded below. Monthly/custom schedules
extend the inherited weekly minimum; they are not falsely described as already
required by the roadmap. This review resolves that extension explicitly and keeps
formal owner changes for the authorized specification phase.

## Evidence, current behavior and strongest alternative

| Evidence class               | Verified finding and limit                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Founder direction            | Separate optional attempt/outcome targets, substantial personal customization and clear UX; then supported types rather than user-created types. The five/two scenario illustrates meaning, not a recommended workload or observed interview.                                                                                                                                                                                   |
| Governing owner              | [Program owner constraints](../../../prds/program-roadmap/owner-constraints.md:128) assign weekly targets to the **P28 Support-Raising Goal Version**. Reuse a bounded optional activity section of that owner. A separate goal engine is unnecessary.                                                                                                                                                                          |
| Inherited domain constraints | [P27 REQ27-P33](../../../prds/sitestacker-parity/phase-27-donor-development/partnerships.md:2365), P9 interaction identity, P6 communication grain, P12 current authority, D8 voluntary coaching and D16 financial-goal boundaries apply. The [owner review](d23-evidence/owner-target-boundaries.md) traces ADR/OpenSpec conflicts and scope.                                                                                  |
| Current implementation       | Inspected activity entry accepts a kind and required note, uses save-time, and lacks qualified outcome/participant/occurrence-precision/command facts. The display mapper falls back from occurrence to creation time; related rows are capped at 2,000 without a period-count completeness contract. These are reuse hazards, not proof of a deployed target defect. [Source census](d23-evidence/current-activity-source.md). |
| Current primary comparisons  | MPDX distinguishes outgoing attempts from actual conversations; TntConnect separates results/date/actor; Pipedrive documents configurable measures, periods, titles and drilldown; HubSpot documents explicit goals and refresh limitations. Epistle/DonorElf public claims establish less detail. [Dated UX source register](d23-evidence/activity-target-ux.md#current-primary-comparison).                                   |
| Technical primary evidence   | PostgreSQL/Supabase effective grants, RLS, function/view privilege and current protected aggregates remain distinct; Graph/Gmail acceptance does not prove delivery or conversation; calendar dates differ from instants. [Database note](d23-evidence/database-target-lifecycle.md), [source semantics](d23-evidence/activity-source-semantics.md), [temporal evidence](d23-evidence/period-and-count-counterexamples.md).     |
| Executed evidence            | **27/27 finite counterexamples reproduced** for temporal/cardinality shortcuts using Python 3.12.14 and system tzdata 2026b. These are counterexamples, not 27 passing Core feature tests. No new PostgreSQL experiment or old probe rerun was needed. [Results](d23-evidence/counterexample-probe/results.json).                                                                                                               |
| Product judgment             | Supported measures, one compact form, restrained optional cards, explicit temporary adjustments and no scoring are the simplest useful complete design. No measured satisfaction, fundraising uplift, optimum quantity or universal coaching method is claimed.                                                                                                                                                                 |
| Remaining proof              | Actual source identity/outcome/participant adapters, target commands, P12/DB/egress boundaries, calendars, UI/user testing and workload qualification must pass P01–P32. Documentation and synthetic fixtures cannot establish them.                                                                                                                                                                                            |

**Strongest alternative:** retain useful activity history and optional targets only
for actual exchanges/held meetings. It reduces configuration and avoids an
emphasis on call volume. It also excludes legitimate planning around actions Maya
can initiate, even when nobody responds. Selected A is preferable when the types
remain separate, every target stays voluntary and no effort/quality inference is
made. Existing manual tasks alone cannot provide a truthful activity measure:
Done does not establish an encounter. No provider connection is necessary for
ordinary qualified manual evidence.

External examples do not override Core. MPDX's fixed dial goals/traffic lights,
HubSpot's quotas or frozen post-due totals, Pipedrive's activity-added/done counters,
and TntConnect's exhaustive logging/message-copy advice are **not adopted**.
Weekly/monthly/custom dates are a bounded personal planning choice, not a general
sales-performance system. No AI classification, telephony observation, mailbox
ingestion or new dependency follows.

## A small, complete user journey

### Discover and set a target

Use **My activity targets** in the existing missionary workspace. With none set,
show one quiet invitation: **“Choose what you want to focus on. Targets and logging
are optional.”** Ordinary contact, task and newsletter work remains fully usable.
No pre-filled numerical workload, red empty card, coach enrollment or quota prompt.

**Add target** opens one short shared Maia form:

1. **Measure** — supported choices, each with one sentence explaining its unit.
2. **Target** — a positive whole number; leave it blank initially.
3. **Schedule** — Weekly, Monthly or Custom dates. Show the resolved date range.
4. Optional **Name**, **Show on my overview**, start and end. Use the measure as
   the initial name. Weekly/monthly may repeat; their start/end select full periods
   shown as exact dates. Custom dates is one period and covers a partial-week or
   partial-month plan without automatic proration.
5. A concise **Dates use [named timezone]; week starts [day]** summary. Use a qualified organization default when available; otherwise show a
   visible zone/week-start suggestion for personal confirmation at setup. Allow
   deliberate adjustment without requiring a new calendar service. Keep calendar details behind
   an Edit link rather than showing a timezone configuration screen by default.

Show **For [authorized workspace/ministry]** above Save and in target detail.
Use the existing context without another picker when it is unambiguous. A context
switch requires a deliberate new scoped target, not a hidden filter change.

An organization may offer small optional starter presets using these same supported
fields. **Start from an organization suggestion** appears only when an admitted
preset exists. Maya previews and may edit its quantity/name/schedule before Save,
or starts blank. Staff manage presets through the exact authorized P28 action;
no role-name or financial-edit shortcut. Adoption creates a personal version,
not a live link: later preset changes never overwrite it or enroll anyone. No
layered override hierarchy or rules builder is needed.

One **Save target** persists the reviewed settings. Starting mid-period says
**“Includes eligible recorded activity from [start date].”** Do not silently
prorate the quantity. Distinguish a personal goal from an organization requirement.
Organization-configurable availability uses existing authority; staff cannot make
logging compulsory or reinterpret a measure. D16 financial editing permission does
not grant permission to edit Maya's activity targets.

### Four understandable supported measures

| Visible measure       | What counts once                                                                                                                                                                                             | What does not prove it                                                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Calls made**        | One actual outgoing calling attempt by Maya, including answered, unanswered, busy or voicemail outcomes.                                                                                                     | Incoming calls as “made,” opening the dialer, copying a number, future work or generic Done.                                                             |
| **Personal messages** | One deliberately authored personal outreach occurrence, qualified as manually sent or accepted for sending by the provider. Help: **“Recorded as sent or accepted for sending. Delivery is not confirmed.”** | Draft/local queue/unknown send result, newsletter/bulk copies, receipts, opens or clicks. A later bounce does not erase a real submission.               |
| **Conversations**     | One source-qualified actual encounter/exchange in which Maya participated: an actual conversation, meeting exchange or relevant human personal response.                                                     | Attempts alone, automated/uncertain replies, sentiment/length tests, or counting every fragment of one exchange separately. A brief decline can qualify. |
| **Meetings held**     | One actual relevant meeting with Maya's qualified personal participation, in person or remote.                                                                                                               | Booking, calendar end time, cancellation, no-show, passive attendance or a task checkbox.                                                                |

The catalog is the required initial outcome, with each lane enabled only after its
real source profile is qualified. A missing source adapter is an implementation
gate, not permission to deliver a fake count or permanently drop a required lane.
No extra approval, transcript, provider integration or compulsory narrative is
needed to record ordinary source-qualified manual activity.

Conversations is not a new sessionization system. P27 establishes exchange meaning,
but not a “new conversation every ten minutes/message/thread/day” rule. P9/P6 must
provide the canonical encounter identity and correction relationship. Known
same-encounter fragments/narratives are evidence of one encounter. Uncertain
identity remains uncertain; do not pretend software can detect all duplicate
human assertions without a qualified source link.

### See progress and record once

Illustrative card; eight is fictional, not a suggested goal:

> **Stay in touch**  
> For Maya’s ministry · Calls made  
> 19–25 October 2026 · Asia/Bangkok  
> **5 recorded / target 8**  
> Includes answered and unanswered calls.  
> View recorded calls · Edit target

A separate Conversations card can show **2 recorded / target 3**. Never show a
summed “seven activities,” conversion score or effort rank. If Maya records more
than the target, keep the real number; a decorative bar may end at 100%, while its
text remains **12 recorded / target 8**. No streak, pressure notification or
celebration is needed to make this useful. Hiding/reordering cards changes only
presentation; it does not stop a target, change source data or revoke sharing.

**View recorded calls** is shown only with independently authorized source-history
access. It opens the permitted history for the same person, scope, measure and
dates, with real outcome/occurrence precision and allowed correction. Aggregate-only
access gets the count and definition without a misleading detail action or any
new row/body grant. A narrower detail projection must not masquerade as all inputs
to the aggregate or disclose hidden exclusions. The first page is not the total. Preserve international names
and localize numbers/date presentation without silently changing period meaning.
The canonical measure subtitle stays visible even if a personal name is misleading.

**Record activity** is available from existing contact/task/history context. Carry
forward known authorized context, ask the actual method/result and occurrence date
at its true precision, and keep notes optional. For calls, plain outcomes such as
**No answer** and **Spoke with them** are clear; do not default to a successful
exchange. Show the actual source audience. This adds no new per-note ACL or private
diary. Target credit needs no duplicate log and grants no additional sharing.

Activity save and count refresh are separate outcomes. **“Activity saved. Updating
your recorded count…”** is truthful when a projection is delayed. A lost response
uses the original operation's status; it must not encourage another source row.
Task Done/Not needed remains independently usable without logging a conversation.

### Adjust, pause, return and correct

| Action                            | Exact experience                                                                                                                                                                                                                                                                                                                      |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rename or arrange                 | Edit the name/show-on-overview/order; retain canonical measure and dates. Offer Move up/down/menu actions, not drag-only ordering. No effective-date chooser for presentation edits.                                                                                                                                                  |
| Change recurring quantity         | Show old/new quantities and dates. Choose **This period only**, **This and future periods** (visible default), or **Future periods only**. A temporary capacity change needs no new target. Preserve the applied prior version in history.                                                                                            |
| Change measure, scope or calendar | Use an explicitly prospective new version/replacement and show the first affected period. Do not rewrite the existing period's meaning. A one-off replacement is a new deliberate target, not a relabelled old count.                                                                                                                 |
| Pause                             | Immediately mark the current comparison **Paused** and stop future target periods. Source activity continues independently; no target failure, deficit carry-forward or automatic proration. Past target history remains.                                                                                                             |
| Resume                            | Show **Resume for [current range]** and the quantity, with a next-period alternative for repeating targets. A resumed current period includes its full eligible recorded history, not only activity after Resume. No missed-period backfill.                                                                                          |
| End/remove from active targets    | End the active comparison immediately and stop future comparisons; retain lawful target/source history. A completed or paused-expired one-off period naturally ends and offers Add another target, not a shifted Resume. “Remove” must not silently delete interactions or history. Retention follows the owner, not eternal storage. |
| Correct source activity           | Correct date/outcome/attribution or known duplication once at its owner. Affected current and past recorded counts may decrease or move periods; previous target denominators are not rewritten.                                                                                                                                      |
| Permissions change                | Hide or render actions view-only according to current authority, cancel unsafe late responses and clear restricted data. Do not explain a lower count by revealing hidden records.                                                                                                                                                    |

When no target is set, show no denominator or percentage. A complete permitted empty result says
**“No recorded calls in this period.”** Loading says **“Loading recorded activity…”**;
an outage says **“Activity counts are unavailable. Try again.”** Known permitted
undated/partial evidence is explained without assigning a guessed date or implying
it is all activity. Never turn a missing value into the shared Progress component's
default zero. A resolved partial count may be shown as partial, without a false
complete attainment verdict.

Use existing exact base-maia/Base UI composition and semantic tokens. Mobile cards
stack naturally; the primary count and date range stay readable without charts or
hover. Visible labels, keyboard navigation, accessible errors/status, non-color
meaning, focus retention, usable touch targets and 200% zoom are acceptance gates.
Preserve still-authorized draft input on recoverable errors. Do not add persistent
offline storage of protected contact/activity details merely for this feature.

## Exact requirements for the developing specification

These C01–C24 clauses were proposed required amendments at initial review and
are now ratified future obligations. They define behavior and owner seams without
prematurely selecting tables, locks, a scheduler or a vendor.

**C01 — Voluntary scope and customization.** The product SHALL support optional
personal targets over supported activity types, with selectable measure, exact
positive whole quantity, personal name, schedule/start/end, presentation and
pause/resume. There SHALL be no user-defined activity types, formulas, weights,
compulsory logs, quotas, missing-log penalties, rankings or automatic next work.
Organization presets MAY suggest supported measure/name/quantity/schedule through
current exact management authority. Personal adoption SHALL be deliberate and
editable; later preset edits SHALL NOT overwrite or enroll personal targets.
Tenant configuration SHALL NOT defeat these voluntary/source/privacy boundaries.

**C02 — One target authority.** The existing P28 Support-Raising Goal Version
owner SHALL own the bounded optional activity-target definitions and retained
period/revision meaning. P9/P27 and P6/P17 retain source authority. Target owner,
current actor and actual activity participant SHALL remain distinct. D16 financial
edit rights, approved support-plan updates and public goal pins SHALL NOT confer
activity-target mutation, synchronization or disclosure. An activity-only plan
SHALL be useful without creating, adopting, editing or possessing a financial
fundraising goal, Support Plan or public page; no placeholder amount/currency
SHALL be fabricated.

**C03 — Qualified supported catalog.** Calls made, Personal messages,
Conversations and Meetings held SHALL have the exact units/outcomes above and
source-owned identity, participation, date-precision, correction and permission
profiles. A measure SHALL NOT be selectable as a working count until those actual
paths are qualified. Personal labels SHALL retain a visible canonical measure
and SHALL NOT change its definition or historical classification.

**C04 — Real source evidence.** Actual source-qualified manual evidence SHALL
remain sufficient without required prose, transcript or provider. Plans, generic
notes/audit rows, task completion, application launch, automated replies and
delivery/open/click telemetry SHALL NOT manufacture an occurrence or exchange.
Qualified brief human responses do not require positive sentiment, a word count
or a stored prior outbound message.

**C05 — Exact participation and purpose.** Each personal target SHALL bind one
human owner in one tenant and one explicitly identified authorized ministry/
workspace purpose. Count the actual qualified caller/sender/participant, not the
logger, current assignee, recipient or every assignment member. A new UI filter,
transfer, Party merge or profile rename SHALL NOT silently reattribute historical
participation or change the target's scope. Team/organization rollups are separate
unselected measures, not sums of personal cards.

**C06 — Cardinality and overlapping measures.** Within each measure/scope/period,
count each canonical source occurrence once. Recipient copies, narratives, joint
participants, subject joins, retries and correlated provider/manual representations
SHALL NOT multiply it. Distinct genuine calls remain distinct. Overlapping measures
SHALL NOT be summed as unique activity or weighted performance. Source uncertainty
SHALL NOT be resolved by invented thread/time/text/sentiment heuristics.

**C07 — Truthful personal-message outcomes.** Qualified provider acceptance or
attributable manual sent evidence MAY count one personal-message occurrence, with
provenance and the visible delivery limitation. Local queue acceptance, unknown or
definitively unsubmitted outcomes SHALL NOT count as confirmed submission. A later
bounce does not erase real submission; correction proving no submission does.
Bulk newsletters/automatic receipts are excluded. No count authorizes resending,
expands D15 recipient/channel rights or requires inbox access.

**C08 — Bounded schedules.** Weekly (default), Monthly and one-off Custom dates
SHALL be supported as the proposed extension to the inherited weekly contract.
Weekly/monthly repeat only as deliberately selected, with optional end; Custom
does not introduce a recurrence language. Display exact inclusive local dates,
with internal half-open calendar boundaries. Repeating start/end select full
periods; a one-off partial period uses Custom dates. No fixed 168-hour week, rolling
seven-day substitution, deficit carry-forward or automatic proration.

**C09 — Stable calendar and real occurrence.** Each accepted period SHALL retain
its exact calendar meaning, IANA zone, weekly first day where relevant and
resolved boundaries. Setup uses a qualified organization work-calendar default when available, or a
visible personally confirmed zone/week-start suggestion otherwise; no new calendar
service or invisible financial-calendar default is required. It allows explicit
personal selection; browser travel/locale/settings changes SHALL
NOT rebucket history. Use source occurrence, never creation/update/import/task
time. Date-only facts retain their source date semantics without invented midnight;
cross-calendar uncertainty SHALL be unplaced unless the owner can establish
membership. Unknown dates remain unknown. Ambiguous/nonexistent local times and
timezone-rule changes require one controlled owner resolution.

**C10 — Full selected-period comparison.** Creating or resuming a current-period
target SHALL compare all eligible, currently permitted dated records in the
displayed period, including earlier records. Show the scope before Save. This
creates no earlier-period targets, retrospective tasks or obligations. D22's
prospective gift-admission cutoff SHALL NOT be imported into this denominator.

**C11 — Target revisions versus corrected actuals.** Repeating quantity edits
SHALL explicitly support current only, current-and-future, or future only; retain
the original/applied period target revisions. Earlier closed target denominators
SHALL NOT silently acquire today's quantity. Measure/scope/calendar changes are
prospective and explicit. Within a repeating series, a calendar/schedule change
starts at the next complete new-calendar period whose start is no earlier than
the old current period's end; show exact dates and any untargeted transition gap.
Do not overlap periods or invent a prorated bridge. Independently chosen weekly
and monthly targets may overlap as separate, non-additive comparisons. Authorized
source corrections, deduplication, restriction
or lawful deletion SHALL still rederive affected historical actuals/certainty.

**C12 — Lifecycle.** Unset, active, paused and ended targets SHALL have distinct
meaning. Pause removes the active current comparison and stops future target
periods, without deleting facts/history or disabling recording. Resume SHALL show
current or next range and quantity for repeating targets, without catch-up periods.
A one-off resumes only within its existing eligible range; paused expiry ends it.
An expired/ended one-off offers Add another target, never an invented next range. End/removal ends
active/future comparison, not source records. No target/zero recorded/paused/
unavailable SHALL be conflated; target quantities cannot encode Off as zero.

**C13 — Explainable truthful progress.** Count, canonical measure, exact dates,
target quantity and scope SHALL remain visible. A complete permitted empty query
may show zero recorded, never zero real activity. Coverage, unknown date, source
unavailability and currentness SHALL be represented truthfully without leaking
hidden exclusions. Counts above target remain exact; no-target has no ratio.
When separately authorized, drilldown SHALL use the same measure/period and its
qualified row projection, independent of pagination. Aggregate-only entitlement
SHALL NOT imply raw history access or a complete detail-row reconciliation.

**C14 — No disclosure by implication.** Current P12 subject/action/field/history
authority SHALL govern definitions, source facts, aggregates, gaps, dates, trends,
links, receipts, exports and notifications. Choosing a target SHALL NOT enable
coaching, public publication or staff access. Separately qualified body-free or
aggregate-only rights MAY exist without raw source-row SELECT or body access;
the aggregate input and release must be authorized. Aggregate implementation SHALL
NOT widen underlying event/participant table grants merely to make an invoker
view work. Retention of a fact is not retention of its body.

**C15 — One current server boundary.** CRM target/source reads and writes SHALL
use qualified Asym server contracts with P12 as the sole fine-grained authority.
Trusted context supplies tenant/actor; the owner validates the exact target owner,
typed subject and action/fields. Every worker, import, RPC, view, service-role path,
cache and egress SHALL preserve the same current authority. Tenant RLS is a
backstop, not a second independent SQL permission engine.

**C16 — Database integrity and least privilege.** Actual storage SHALL enforce
same-tenant typed references, required identity/version fields, valid state/date
combinations, exact positive whole quantities within a published finite storage/
API bound, immutable origin/owner/author and unique accepted command/current-head
semantics. Reject fractional/nonfinite/overflow values before coercion. Audit and
required acceptance evidence SHALL be append-only to ordinary callers, subject to
lawful retention. Routine assignment removal SHALL NOT cascade-delete retained
history. Review effective grants, USING and WITH CHECK, all policies, view/function
ownership, execution privileges and privileged paths; allowed-row updates SHALL NOT
retarget ownership, tenant, attribution or approval into a forbidden state.

**C17 — Atomic commands and recovery.** Target/source commands SHALL bind stable
semantic operation identity, intended values and expected revision. Required
version/head/evidence/result commit atomically; failures leave no partial accepted
head. Reused identity with changed intent conflicts; no-op intent does not create
another business version. Resolve lost responses from the original authorized
result. Current authority must be fenced at acceptance, not only read before Save.
Loss of edit rights does not remove an independently allowed receipt read.

**C18 — Derived counts and current release.** Counts SHALL be rebuildable from
qualified sources, never an independently writable success ledger. Bind derived
results to exact target/period, source revision/coverage and permitted projection;
correct, invalidate or suppress them on relevant source/authority changes. Reject
late responses after scope changes. A stale cache or materialized view SHALL NOT
release revoked facts merely because its computation was once authorized.

**C19 — Record-once accessible UX.** Use existing shared Maia primitives, ordinary
contextual recording and one deliberate Save. Preserve input on recoverable errors;
separate accepted source saves from delayed counts. Notes are optional. What counts,
actual audience, date precision and count limitations SHALL be understandable without
hover or color. Keyboard, screen reader, touch, non-drag ordering and mobile/zoom
flows SHALL be qualified. No forced coach, task, send or financial action follows.

**C20 — Audit and privacy-preserving diagnosis.** Durable history SHALL retain
authorized target changes/effective periods, source correction provenance and
actor/owner attribution. Technical telemetry SHALL identify operation, failure
class, adapter, freshness and authorization-safe scope references without source
bodies, donor names, hidden counts or credentials. Logs are not business history;
history is not an unrestricted export or eternal private-content archive.

**C21 — Performance and operational qualification.** Query by admitted
tenant/participant/subject/measure/period; prove the actual distinct-occurrence
plan and indexes with P12 and realistic skew. No per-card full history download,
first-page count, N+1 authorization call per row or cross-tenant rebuild. Publish
tested workload/latency/resource bounds before activation. Resource rejection or
partial coverage SHALL never silently truncate a claimed total. Repair through
source correction or bounded projection rebuild, not writable manual counters.

**C22 — Safe migration and rollout.** Qualify source adapters before target
activation. Existing type-only/unknown-date logs SHALL NOT be backfilled as known
outcomes/participants/periods. Existing sources remain usable at their true precision.
Use compatible additive owner changes, mixed-version tests, bounded per-tenant
activation and a target-only kill switch. Preserve source work, privacy fences,
accepted target history and idempotent receipts during disable/restore/roll-forward.

**C23 — No accidental platform expansion.** D23 SHALL NOT create financial or
currency calculations, donor scores, stage changes, newsletter consent, automatic
contact/tasks, new calendar/email/telephony ingestion, arbitrary workflow/formula
builders, new dependencies or a duplicate CRM. Existing source-specific provider
contracts remain responsible for their own outcomes and retries.

**C24 — Traceable activation proof.** C01–C23 SHALL be mapped to the glossary,
P28/P9/P27/P6/P12 owner requirements, relevant ADR/OpenSpec boundary, design, future
tasks/tickets, implementation and release evidence through P01–P32. New owners or
accepted decision conflicts require explicit resolution, not a copied competitor
pattern. No “supported,” “accurate,” “accessible” or capacity claim precedes its
actual source/UI/authorization/load qualification.

## Material findings and permanent fixes

Severity describes consequence if the shortcut is shipped. Likelihood is a
qualitative engineering judgment, not an incident rate. Each finding below states
all eight requested dimensions; the following category review evaluates each
category independently and maps it to these exact fixes.

### F01 — Customization without a stable meaning

- **What/why:** Free-text measures, formulas or renamed cards can imply conversations when only attempts occurred, making progress misleading and costly to maintain.
- **Severity:** High for factual meaning; medium for avoidable product complexity.
- **Likelihood:** Plausible under the original “heavily customizable” wording; materially narrowed by the founder's clarification.
- **Evidence:** Confirmed supported-types choice; P9 audit taxonomy is not a target catalog; Pipedrive/HubSpot separate measures/types from names. UX E06/E10/E11.
- **Effect on A:** Narrows customization to useful personal controls; preserves both attempts and outcomes.
- **Permanent prevention:** Stable supported source profiles plus visible canonical subtitles, bounded schedules and presentation controls.
- **Exact change:** **C01–C03, C08, C19, C23**. Prove **P01, P02, P16, P27**.

### F02 — Existing display/log rows cannot establish activity truth

- **What/why:** Counting call kinds, task Done, arbitrary notes or calendar rows falsely claims a call/conversation happened; requiring prose burdens ordinary logging.
- **Severity:** High.
- **Likelihood:** Likely if existing generic log UI/API is reused as the metric contract.
- **Evidence:** Current source type+required-note/save-time shape; P27-P33 explicitly excludes these proxies. Source census and source-semantics AS23-01.
- **Effect on A:** Changes the implementation prerequisite, not the selected product outcome.
- **Permanent prevention:** Qualify the real source's occurrence/outcome/actor/precision projection and optional-note recording; count that once.
- **Exact change:** **C03–C05, C19, C22**. Prove **P03, P04, P08, P28**.

### F03 — Row fan-out and attribution inflate personal counts

- **What/why:** Recipient copies, narratives, multi-subject joins and retries multiply one occurrence; logger or replacement assignee receives someone else's credit. Distinct real calls may also be wrongly collapsed by a heuristic.
- **Severity:** High.
- **Likelihood:** Likely with timeline COUNT(\*) or group-send recipient counts.
- **Evidence:** P9 endpoint audit emissions, P6 person-copy grain, P27 one-encounter rule; synthetic C01–C06/C12 and canonical-identity gap for asynchronous exchanges.
- **Effect on A:** Adds exact unit/participant/source identity and non-additive card rules.
- **Permanent prevention:** Source-qualified occurrence/participant identity, exact scoped distinct counting, owner corrections and explicit uncertainty; no new sessionization store.
- **Exact change:** **C05–C06, C13, C18**. Prove **P05–P07, P09, P26**.

### F04 — Message acceptance masquerades as delivery or conversation

- **What/why:** Queue/HTTP success counts as completed personal engagement, or unknown sends are retried to improve progress, causing duplicate outreach and false history.
- **Severity:** High.
- **Likelihood:** Plausible with a binary sent/failed adapter.
- **Evidence:** D15; freshly checked Microsoft Graph 202 and Gmail send-limit caveats; P6 recipient/outcome ownership.
- **Effect on A:** Narrows the message metric to its provable submission fact, with a neutral headline and explicit limitation.
- **Permanent prevention:** Qualified provider/manual evidence, stable source correlation and separate later delivery/correction states; preserve D15 no-blind-resend rule.
- **Exact change:** **C03, C06–C07, C23**. Prove **P10, P26**.

### F05 — Time and source corrections rewrite the wrong period

- **What/why:** Creation-time fallback, fixed-hour weeks, travel or timezone conversions move activity; unknown dates become false precision; late corrections double-count or cannot reduce totals.
- **Severity:** High for trustworthy history.
- **Likelihood:** Likely with the current mapper or browser-local grouping; DST errors occur at realistic boundaries.
- **Evidence:** P27 occurrence precision; current date fallback; W3C time guidance/Unicode week data; executed T01–T13.
- **Effect on A:** Adds stable period geometry and honest occurrence precision; no restriction on legitimate late entry.
- **Permanent prevention:** Owner-qualified calendar membership and current source rederivation; distinguish target history from correctable actuals.
- **Exact change:** **C08–C11, C18**. Prove **P11–P15, P26**.

### F06 — Target edits and pause become arbitrary or punitive

- **What/why:** Today's scalar rewrites prior expectations; temporary capacity changes require extra targets; pause erases work, leaves an active guilt counter or silently creates catch-up periods. Missing records become “poor effort.”
- **Severity:** High for autonomy and interpretation; medium for interaction cost.
- **Likelihood:** Plausible with a mutable quantity and vague Pause behavior.
- **Evidence:** P28 optional targets, D8-C11 voluntary/adaptable coaching, Pipedrive period-specific quantities; synthetic C07/C09. No optimum quota evidence exists.
- **Effect on A:** Makes personal customization/lifecycle precise without a performance-management system.
- **Permanent prevention:** Explicit current-only/current+future/future-only edits, retained versions, paused comparison and no deficits/rankings.
- **Exact change:** **C01, C10–C12, C19**. Prove **P14–P17**.

### F07 — Shared owner container becomes shared authority

- **What/why:** A financial goal permission, assignment or public-page goal pin exposes or changes private activity targets; a second target engine drifts from P28 ownership.
- **Severity:** Critical for unauthorized change/disclosure; medium for duplicated architecture.
- **Likelihood:** Plausible if one Goal Version is treated as one blanket permission or copied whole into public JSON.
- **Evidence:** P28 owner-constraints 128–139, P22 pinned financial release, P12 scoped rights, D16 financial edit scope; owner/database notes.
- **Effect on A:** Reuses the correct owner while narrowing fields/actions and public projections.
- **Permanent prevention:** Bounded typed activity arm and explicit personal action/subject rights, not inherited financial access or duplicated ownership.
- **Exact change:** **C02, C05, C14–C16, C24**. Prove **P18, P19, P29**.

### F08 — Counts and caches disclose protected activity

- **What/why:** Aggregate-first redaction, stale permissions, coach history expansion or cross-tenant cache keys reveal restricted records through counts, dates, differences or links even without bodies.
- **Severity:** Critical for sensitive ministry/contact context.
- **Likelihood:** Plausible; current inspected cache lacks the new projection's tenant/authority/period binding.
- **Evidence:** P12/P27 current-purpose projection, D8–D10 separate share scope; current cache source finding; PostgreSQL stored-view behavior.
- **Effect on A:** Adds current authorization at input and release; target opt-in is not sharing consent.
- **Permanent prevention:** Qualified aggregate-only/body-free projection where authorized, tenant/scope/source/permission-bound cache, revocation fences and no hidden-exclusion badge.
- **Exact change:** **C14–C15, C18, C20–C22**. Prove **P19–P22, P29, P30**.

### F09 — Allowed updates escape their original scope

- **What/why:** Raw table/RPC/service mutation changes tenant, target owner, actor or subject; weak FKs permit cross-tenant references; partial writes leave a head without evidence.
- **Severity:** Critical.
- **Likelihood:** Plausible under generic CRUD/privileged-path reuse, not a demonstrated deployed exploit.
- **Evidence:** Current check-then-insert service path; P12 server/PDP boundary; primary PostgreSQL/Supabase grants, USING/WITH CHECK and definer rules.
- **Effect on A:** Requires the actual qualified mutation and database backstops before activation.
- **Permanent prevention:** Trusted context, immutable identity/attribution, same-tenant typed relationships, least grants, atomic owner command and current authority fence.
- **Exact change:** **C15–C17**. Prove **P18, P20, P23–P25**.

### F10 — Retries, concurrency and projection delay manufacture success

- **What/why:** Double Save creates versions/events; stale editors overwrite changes; permission revocation races succeed; a saved activity whose count refresh fails looks unsaved and invites duplicate entry.
- **Severity:** High, critical for an authorization escape.
- **Likelihood:** Plausible under ordinary mobile/network failure; current source has no durable command identity.
- **Evidence:** Source census; P27 atomic acceptance/result recovery; inherited D16 mechanisms, with original proof limits.
- **Effect on A:** Keeps the simple Save while requiring meaningful idempotency and state-specific feedback.
- **Permanent prevention:** Durable business-operation identity, expected revision, atomic required evidence/result, current-authority serialization/revalidation and independent projection recovery.
- **Exact change:** **C17–C19**. Prove **P23–P26**.

### F11 — An unavailable or partial count is rendered as zero

- **What/why:** A failed/capped query, hidden evidence or default progress value says “no activity”; pages omit eligible records; actual counts over target are truncated. Users make decisions from a false denominator or coverage claim.
- **Severity:** High.
- **Likelihood:** Likely if the capped donor-list fetch or shared undefined-to-zero progress behavior is used directly.
- **Evidence:** 2,000-row cap, current Progress default, existing analytics Unavailable precedent; synthetic C08–C11.
- **Effect on A:** Requires an explicit progress-state contract and same-scope drilldown.
- **Permanent prevention:** Complete qualified server query, exact count text, distinct unavailable/partial/undated states and no “zero real work” language.
- **Exact change:** **C13, C18–C19, C21**. Prove **P09, P21, P27, P31**.

### F12 — Convenience becomes a second CRM or operations burden

- **What/why:** New activity ledgers, weekly jobs, copied message bodies, custom formulas and broad scans drift, leak data, require manual repairs or amplify load across tenants.
- **Severity:** High for privacy/integrity; medium for debt/performance/operations.
- **Likelihood:** Plausible if “fully functional” is interpreted as a general analytics/integration platform.
- **Evidence:** Existing P9/P6/P28 owners, current capped fetch, source/profile qualification gaps; no need for new provider established by research.
- **Effect on A:** Narrows architecture to source-derived personal planning and bounded existing owner extensions.
- **Permanent prevention:** No writable counter store; scoped indexed aggregation, bounded rebuild, minimal non-content telemetry and existing retention/restore controls.
- **Exact change:** **C02, C18, C20–C23**. Prove **P26, P28–P32**.

### F13 — Rollout or legacy backfill invents a reliable past

- **What/why:** Kind-only logs become confirmed calls, created timestamps become occurrence dates, all users acquire targets, or old clients bypass new constraints. Rollback destroys accepted history or restores revoked projection access.
- **Severity:** High, critical for restored unauthorized disclosure.
- **Likelihood:** Plausible during mixed-version rollout or generic backfill.
- **Evidence:** Inspected historical source shape, source owner precision rules, prior decisions' no-inferred-authority boundaries.
- **Effect on A:** Requires source-first qualification and conservative migration, not invented historical accuracy.
- **Permanent prevention:** Preserve legacy precision, activate qualified lanes only, additive compatible changes, no automatic enrollment, target-only stop switch and current-authority restore qualification.
- **Exact change:** **C03, C14, C22, C24**. Prove **P28–P30, P32**.

### F14 — “Beautiful and proven” is claimed without user or release proof

- **What/why:** Superficially polished cards hide units, stale state, mobile/accessibility problems or excessive controls; documentation fixtures are promoted to production assurance.
- **Severity:** Medium for friction, high where it misstates permission/count meaning.
- **Likelihood:** Plausible without explicit acceptance and traceability.
- **Evidence:** Fresh comparable/docs research supports patterns, not actual Core usability; no missionary interview, accessible prototype study or production load run occurred.
- **Effect on A:** Adds concrete design and proof criteria without replacing the selected outcome or requiring speculative features.
- **Permanent prevention:** Restrained Maia composition, realistic end-to-end comprehension tasks, independent authorization/source tests and honest evidence labels.
- **Exact change:** **C13, C19, C21, C24**. Prove **P27, P31, P32**.

## All 22 categories evaluated independently

“Material concern: Yes” means the original short answer needs the cited amendment;
it does not claim a current production incident. F01–F14 provide severity,
likelihood, evidence, impact and exact permanent clauses for every mapped concern.

| #   | Category                                                      | Material concern and checked result                                                                                                                                                                                                                                                                                                                                              |
| --- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Problem validity, necessity, and alternatives                 | **Yes — F01/F02/F06.** Separate controllable outreach and actual exchange is a valid selected planning job; exchange-only/history-only is the strongest alternative. Undefined customization/counting would fail it. C01–C04/C10–C12 preserve voluntary utility without an arbitrary tracker.                                                                                    |
| 2   | Brittleness                                                   | **Yes — F03–F05/F11.** Tested assumptions about row grain, outcome, date precision, timezones, reply identity and complete pages fail realistic cases. C05–C09/C13/C18 replace those assumptions.                                                                                                                                                                                |
| 3   | Technical debt                                                | **Yes — F02/F07/F12.** Reusing generic type/note logs, duplicating the Goal Version owner or adding writable counters creates drift. C02–C04/C18/C21/C23 require owner extensions and rebuildable projections.                                                                                                                                                                   |
| 4   | Edge cases                                                    | **Yes — F03–F06/F10/F11.** Group contacts, joint calls, multiple contexts, brief declines, unknown replies, bounce-after-acceptance, date-only/DST/travel, mid-period creation, temporary edits and lost responses are explicitly covered. C05–C13/C17–C19.                                                                                                                      |
| 5   | Footguns                                                      | **Yes — F01/F06/F07/F09–F11.** Misleading renames, zero-as-Off, hidden Pause effects, generic goal permissions, retargeting and retry-as-new-save are harmful ordinary actions. C02–C03/C11–C19 prevent them.                                                                                                                                                                    |
| 6   | Tenant safety                                                 | **Yes — F05/F07–F09/F12.** Same IDs across tenants, multi-assignment users, source joins, caches, coach projection and restore all require exact current scopes. C05/C14–C18/C21–C22.                                                                                                                                                                                            |
| 7   | Database, RLS, and authorization safety                       | **Yes — F07–F10.** Reviewed tenant-aware keys/FKs, nullability/defaults, exact integer quantity, states, delete behavior, append-only evidence, indexes, all mutation grants/policies/views/functions/services and USING/WITH CHECK. Target values are counts; no money/FX schema is needed. C15–C18/C21–C22 require actual-role tests; coarse tenant RLS alone is insufficient. |
| 8   | Overengineering                                               | **Yes — F01/F07/F12.** Custom formulas/types, shadow source storage, full dashboard/recurrence engine and new providers add cost without a selected need. C01–C03/C08/C23 bound the feature; multiple personal controls remain useful.                                                                                                                                           |
| 9   | UX/UI and user friction                                       | **Yes — F01/F02/F06/F11/F14.** Checked discover/setup/log/drilldown/edit/pause/recovery, mobile, keyboard, labels, touch, language/dates and low-bandwidth states. C13/C19 and the full journey above remove required prose, duplicate entry, hidden dates and misleading empty states. No new donor/public step.                                                                |
| 10  | Source of truth, ownership, and domain invariants             | **Yes — F02–F05/F07/F12.** P28 owns target versions; source owners own occurrences/outcomes/participation; counts are derived. C02–C07/C09/C16/C18 prevent dual ownership, fan-out and silent historical reinterpretation.                                                                                                                                                       |
| 11  | Hidden coupling                                               | **Yes — F04/F07/F12.** Financial Goal Version permission/public pin, provider recipient grain, task completion and UI filters must not determine activity authority/meaning. C02/C05/C07/C14/C23 keep each exact relationship explicit.                                                                                                                                          |
| 12  | Failure modes                                                 | **Yes — F08–F11/F13.** Partial accepted writes, ambiguous saves, stale projections, revoked late responses and provider uncertainty need separate visible outcomes. C07/C13–C19/C22 support safe recovery rather than duplicate entry or fabricated zero.                                                                                                                        |
| 13  | Lifecycle, temporal correctness, concurrency, and idempotency | **Yes — F03/F05/F06/F10.** Defined target create/active/pause/resume/end, current/future edits, correction, retries, period rollover and authorization races. C06/C08–C12/C17–C18. No transport-only dedupe or implicit historical freeze.                                                                                                                                       |
| 14  | Data integrity risks                                          | **Yes — F02–F05/F09–F11/F13.** Duplicates, bad attribution, date fallback, inconsistent revisions and silent legacy coercion are material. C03–C09/C16–C18/C22 preserve source precision and exact totals.                                                                                                                                                                       |
| 15  | Security and privacy risks                                    | **Yes — F07–F09/F12/F13.** Counts can reveal sensitive ministry/contact patterns; body-free is not public. Examined coaches, logs, exports, retained facts/bodies and restore. C14–C16/C18/C20/C22 require purpose-scoped projection and minimization; no new retention entitlement.                                                                                             |
| 16  | Scalability and performance risks                             | **Yes — F03/F11/F12.** Row fan-out, donor-page caps, broad history download and per-row auth do not scale or prove completeness. C18/C21 require real indexed plans, skew/concurrency workloads and explicit limits; no invented capacity claim.                                                                                                                                 |
| 17  | Operational burden                                            | **Yes — F06/F10/F12/F13.** Manual counter repair, ambiguous saved state, recurring catch-up jobs and bad backfills would generate support work. C11–C12/C17–C18/C20–C22 require normal correction, receipt recovery and bounded rebuild.                                                                                                                                         |
| 18  | Observability and auditability gaps                           | **Yes — F05/F06/F10/F12/F14.** A number alone cannot explain target version, corrected actuals, acceptance or delayed projection. C11/C17/C20 require durable business history separately from safe operational telemetry.                                                                                                                                                       |
| 19  | Dependency and integration risks                              | **Yes — F03/F04/F12.** Existing P9/P6/P27/P12 qualification and provider outcome semantics are real dependencies; duplicates/late events cannot be counted naively. C03–C07/C18/C23. **No additional vendor/package dependency is justified** by this decision.                                                                                                                  |
| 20  | Migration, rollout, and upgrade risks                         | **Yes — F07/F08/F13.** Mixed clients, changing source shapes, public goal pins, legacy dates and restored permissions require additive/qualified rollout. C02/C14/C22/C24. No invented historical targets or lost accepted history.                                                                                                                                              |
| 21  | Testability, traceability, and proof                          | **Yes — F01–F14.** A one-sentence choice is insufficient to test units, authority, corrections or usability. C01–C24/P01–P32 bind precise outcomes and distinguish current code, proposed contracts and executed synthetic evidence.                                                                                                                                             |
| 22  | Other development hazards                                     | **Yes — F06/F07/F14.** Surveillance pressure, public serialization of private target fields and unsupported confidence claims remain material even with correct arithmetic. C01–C02/C14/C24 prevent them. No additional distinct hazard was identified after checking localization, offline state, retention and operational ownership.                                          |

## Acceptance and proof matrix

These are **required future proofs**, not claims that the current feature passed.
Use actual owner adapters and effective roles for integration/security tests.

| ID  | Falsifiable outcome / clauses                                                                                                                                                                                                                                                                                                                                              |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P01 | No target leaves normal work intact; supported personal controls work. Optional organization preset adoption is editable/deliberate; later preset changes cannot overwrite/enroll. Custom type/formula and compulsory logging are absent. C01–C03.                                                                                                                         |
| P02 | A personal label “Conversations” on Calls made still displays Calls made/its unit and cannot change source classification. Unsupported profile is not advertised as functional. C03.                                                                                                                                                                                       |
| P03 | Five actual outgoing calls including two actual conversations produce 5 and 2; no combined 7. Incoming call may count exchange but not Calls made. C03–C06.                                                                                                                                                                                                                |
| P04 | No-answer/busy/voicemail, brief decline, genuine inbound exchange, held/unscheduled meeting, no-show, task Done and dialer launch follow their precise units without required prose/transcript. C03–C04.                                                                                                                                                                   |
| P05 | One encounter with multiple supporters/narratives/subject joins counts once in each admitted target; separate true repeated calls remain separate. C05–C06.                                                                                                                                                                                                                |
| P06 | Staff logs Maya's encounter; Maya is the qualified participant, not staff/current assignee. Replacement assignment, Party merge, CC and recipient-only participation do not reattribute it. C05.                                                                                                                                                                           |
| P07 | Multiple human reply fragments and known manual/provider corroboration preserve one source occurrence; uncertain correspondence is not silently merged or claimed duplicate-free. C06.                                                                                                                                                                                     |
| P08 | Legacy kind-only/date-unknown records remain at actual precision; a qualified source correction may admit them without creating a second event. No invented provider/transcript requirement. C04/C09/C22.                                                                                                                                                                  |
| P09 | The target total equals the authorized distinct source cohort across all pages; a 2,001st eligible source is not lost to the existing display cap; scope-filter changes cannot alter the saved denominator. C05–C06/C13.                                                                                                                                                   |
| P10 | Draft/local queue/unknown/rejection do not count confirmed submission; qualified acceptance/manual sent counts once; later bounce preserves submission, correction disproving submission removes it; none proves exchange. C07.                                                                                                                                            |
| P11 | Weekly/monthly select first/last whole periods; Custom admits partial ranges without proration. Boundaries cover 167/169-hour DST weeks, leap February, year boundary and exact end/start instant once. C08–C09.                                                                                                                                                           |
| P12 | Travel/browser locale and later preference/tz-rule updates do not silently move accepted periods. Calendar transitions start a nonoverlapping complete new period, showing any gap; ambiguous/nonexistent wall times use qualified source handling. C09/C11.                                                                                                               |
| P13 | Date-only retains its day without invented midnight; ambiguous cross-calendar membership is unplaced; unknown never becomes created_at. Late entry counts actual occurrence period. C09.                                                                                                                                                                                   |
| P14 | Mid-period create/resume includes the whole shown eligible period, with no proration/earlier-period targets or D22 activation cutoff. C10/C12.                                                                                                                                                                                                                             |
| P15 | Outcome/date/duplicate/restriction corrections recalculate both affected past/current counts while preserving target versions and current source permissions. C11/C18.                                                                                                                                                                                                     |
| P16 | Quantity edits current-only/current+future/future-only change exactly those periods; presentation edits do not create timing choices; measure/scope/calendar changes cannot reinterpret old periods. C03/C11.                                                                                                                                                              |
| P17 | Pause/end/resume with rollover and one-off expiry produces no unintended active comparison, shifted one-off, catch-up period, deleted activity or target-as-zero. Hiding a card changes presentation only. C12/C19.                                                                                                                                                        |
| P18 | Actual constraints reject cross-tenant/type/owner retargets, null required IDs, invalid dates/states, fractional/nonfinite/overflow quantities and direct audit rewrite; routine assignment removal preserves lawful history. C15–C16.                                                                                                                                     |
| P19 | An authorized activity-only plan works with absent or staff-managed financial goals, without Support Plan/page/placeholder money. Financial edit rights/public release and a generic coach role cannot edit/read the personal target or hidden source. Exact aggregate-only rights need no raw source-row/body grant and render no misleading history action. C02/C13–C14. |
| P20 | Actual nonsuper/non-BYPASS roles, permissive/restrictive policy combinations, USING/WITH CHECK, column grants, views, functions, RPC/service/worker paths preserve current P12 authority. C15–C16.                                                                                                                                                                         |
| P21 | Current permitted complete zero, no target, loading, unknown date, partial coverage, stale and unavailable are distinct; no hidden-record count/difference is exposed. C13–C14/C18.                                                                                                                                                                                        |
| P22 | Permission/scope changes during fetch/compute/release, old tabs, cache, Realtime/export and receipt recovery cannot release revoked content; surviving read rights still allow a safe receipt. C14–C18.                                                                                                                                                                    |
| P23 | Same intended command retry returns one accepted effect; changed payload with same identity conflicts; no-op does not create another business version; timeout recovers the original result. C17.                                                                                                                                                                          |
| P24 | Required audit/result failure rolls back target head; source save followed by projection failure stays saved and has clear updating/retry-count behavior. C17–C19.                                                                                                                                                                                                         |
| P25 | Controlled Save/revoke, Save/Save, Pause/Resume and period-rollover/edit races prove both orderings through the actual owner, not seeded authority booleans. C11–C12/C17.                                                                                                                                                                                                  |
| P26 | Rebuild from actual source revisions equals incremental/current query counts; duplicate/out-of-order provider/import/source correction is idempotent; no new provider or private body copy required. C06–C07/C18/C23.                                                                                                                                                      |
| P27 | Keyboard/screen reader/touch/200%-zoom/mobile/low-bandwidth journeys complete setup, record, inspect, temporarily edit, pause, resume and recover; setup/detail show the exact workspace without an unnecessary picker; labels, audience, overlapping counts and unknown states are understood. C13/C19.                                                                   |
| P28 | Old-source/new-target and new-source/old-client compatibility plus legacy precision backfill tests pass without automatic enrollment or false historical actuals. C03/C22.                                                                                                                                                                                                 |
| P29 | Public financial goal pins/projections remain field-scoped across activity revisions; backup/restore rechecks current rights before any count release. C02/C14/C22.                                                                                                                                                                                                        |
| P30 | Tenant activation/disable/restore preserves normal source recording, accepted target history and receipts; kill switch suppresses only affected target processing/UI without widening access. C22.                                                                                                                                                                         |
| P31 | Documented production-shaped distribution includes large tenant, multi-context participant, long custom range, concurrent reads/corrections and permission narrowing; exact counts and approved latency/resource budgets hold without page truncation/N+1/full-browser download. C21.                                                                                      |
| P32 | Release evidence maps every clause to actual owner/spec/design/test, records unresolved coverage explicitly and names operational owners/runbooks. No prototype/synthetic assertion is labelled production qualification. C20–C24.                                                                                                                                         |

Usability qualification should include a new support raiser, an established
missionary with limited time, and an authorized coach/staff reviewer of the
separate permitted projection. These are recruitment criteria, not invented
interview results or factual ministry personas. Before activation, participants
must be able to explain five/two overlap, the chosen period, recorded-vs-real
activity, temporary adjustment and sharing limits without facilitator correction.
Any critical mistaken belief that a target sends, shares, proves delivery or
requires logging blocks release until fixed and retested. Record sample size and
outcomes; do not claim statistical conversion benefits from a small qualitative test.

## Synthesis, sequencing and monitored risks

**Before recording this reviewed answer:** resolve supported types versus custom
types (now explicitly answered); identify the existing Goal Version owner (done);
separate attempt/exchange/meeting/message units, calendar precision, personal
authority and voluntary disclosure (resolved above). Record the exact corrected
decision with **proposed** amendment status at initial review. The subsequent
explicit ratification below changes that status, not the evidence. No runtime
implementation proof is needed to record a design judgment, and none is pretended.
No further product question was required to finish this review.

**During the authorized specification/design phase, in dependency order:**

1. Bind C02–C07 to P9/P27/P6/P17 occurrence, participant, method/outcome,
   precision and correction projections under P12. Resolve asynchronous encounter
   cardinality at the source owner. This is necessary before defining a truthful
   count. Do not create a temporary P28 source ledger.
2. Extend the P28 Goal Version activity section with the bounded catalog,
   weekly/monthly/custom periods and lifecycle, while preserving financial/public
   field scopes. Bind target and source date semantics, exact integer range and
   retention to actual owner contracts; update glossary/ADR/OpenSpec only where
   the authorized transition requires it, not by inventing another decision layer.
3. Design the small contextual setup/cards/log/edit journey using shared Maia
   components. Prove comprehension and access states. The counts must not depend
   on an unqualified existing log or the donor-page display cap.
4. Implement actual source/target commands, structural DB backstops, current
   authorization, idempotent receipt recovery and source-derived counts together.
   Qualify source lanes and all C/P mappings before exposing them as functional.
5. Run actual integration/race/accessibility/usability/restore/load gates, then
   activate per tenant with the target-only stop switch and named operations
   owners. Preserve earlier evidence as bounded history, not release proof.

**Implementation safeguards are mandatory, not “monitor”:** source identity and
outcome truth, exact participant/purpose, tenant isolation, P12 authorization,
current disclosure fences, occurrence precision, no false zero, atomic accepted
effects, correct revisions and safe rollback. A detector is not permission to ship
a known weakness in these boundaries.

The following are proposed initial operating thresholds, not measured capacity or
universal standards. Assign real people to these role owners before activation.

| Signal                                                                                                      | Threshold                                                                                                                             | Owner                                    | Required response                                                                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unauthorized target/source/count disclosure or mutation                                                     | Any confirmed occurrence                                                                                                              | Security incident lead + P12 owner       | Disable the affected target projection/action; preserve safe evidence, investigate all paths and require requalification before re-enable. Do not disable unrelated source work automatically. |
| Qualified count differs from same-scope authoritative rebuild, duplicate accepted effect, or misattribution | Any reproducible mismatch                                                                                                             | P9/P6 source owner + P28 owner           | Suppress the affected exact result as unavailable, repair source/correlation or projection, replay boundedly and rerun the failed proof. Never edit a manual counter.                          |
| Source save accepted but target projection remains behind                                                   | More than 60 seconds continuously for 5 minutes in an affected qualified scope                                                        | P28 service owner                        | Keep “Updating” truthful, investigate backlog/invalidation, recover the projection and check for duplicate-entry prompts. This is an initial alert budget, not promised provider latency.      |
| Target read latency                                                                                         | Server p95 over 1 second for 15 minutes at the approved tested workload                                                               | API/DB on-call                           | Inspect scoped plan/card fan-out/authorization cost; restore the approved budget or disable the affected expensive view without returning a partial total.                                     |
| Users infer mandatory reporting, false delivery, additive 5+2, or automatic sharing                         | Any validated critical comprehension failure during release/pilot; repeat of a fixed misconception in two independent support reports | Product/UX owner                         | Fix wording/flow and retest the affected journey; keep unsafe feature exposure disabled if it changes consent or disclosed meaning. No optimization toward logging volume.                     |
| Legacy or new adapter lacks qualified occurrence/outcome/participant coverage                               | Any attempted activation of an unqualified profile                                                                                    | Source integration owner + release owner | Block that profile's activation, qualify the actual adapter and tests; show honest unavailable capability until corrected, not a fabricated zero.                                              |

## Proof completed and limits

Six independent evidence workstreams cover owners, current code, source semantics,
UX comparisons, calendar/cardinality counterexamples and database/current-authority
boundaries. Their findings are reconciled in the
[cross-review record](d23-evidence/cross-review-reconciliation.md).

The new finite probe reproduced **27/27** shortcuts: DST 167/169-hour weeks,
shared endpoints, fixed offset drift, travel/week-start/year boundaries, floating
dates, ambiguous/nonexistent local times, entry-time fallback, correction double
increment, overlapping measures, fan-out, duplicate transport/source evidence,
mutable denominators, capped counts, no-target division, incomplete/unknown
data, full-period creation and variable month lengths. [Probe source](d23-evidence/counterexample-probe/probe.py) and
[results](d23-evidence/counterexample-probe/results.json) preserve the exact scope.
These establish counterexamples, not the correctness of a proposed implementation.

No new PostgreSQL fixture would prove the missing actual source occurrence,
participant or P12 integration, so none was added. Earlier D9/D10/D16/D22 evidence
retains its original limitations and was not rerun. The
[prior-artifact snapshot](d23-evidence/prior-evidence-sha256.json) and
[documentation verification](d23-evidence/review-verification.json) check preserved
evidence, references, clause/proof/category coverage and decision status; they are
not application tests. No hosted Supabase audit, provider send, browser prototype,
user interview, production benchmark or actual source authorization test occurred.

No application, schema, formal owner/ADR/OpenSpec, dependency, ticket, live setting,
provider operation or external message changed. The result is a finished reviewed
decision and precise permanent-path contract. Subsequent ratification is recorded
below; formal specification still requires the authorized transition.

## Subsequent explicit ratification

On October 17, 2026, Asia/Bangkok, the founder instructed: **“Ratify this decision
and amendment. Then continue with this phase 28 grill-with-docs session.”**

This ratifies the corrected decision, **C01–C24** and **P01–P32** as future
obligations: separate optional supported activity measures; personal customization;
the existing Goal Version activity owner; bounded weekly/monthly/custom schedules;
full-period comparison; deliberate adjustment/pause/resume; source-qualified
participation and corrections; exact current authority and no implied disclosure.
The initial operating thresholds and UX profile are accepted design judgments,
not measured capacity or user-study outcomes. No organization quantity is imposed.

The [initial verification result](d23-evidence/review-verification-initial.json)
and [initial verifier](d23-evidence/verify-review-initial.py) are preserved unchanged.
Twenty-seven finite counterexamples retain their original limits. No experiment
was rerun, and no actual source/P12/target command/UI/provider/capacity qualification
is inferred. No application/schema, formal owner/ADR/OpenSpec, dependency, live
configuration, ticket or external contact changed. The founder brief and earlier
ratifications remain intact. The continued session separately asks
[Q24 about an optional coaching activity-summary module](phase28-q24-coaching-activity-summary-research.md);
D23's ratification itself grants no new coaching disclosure.
