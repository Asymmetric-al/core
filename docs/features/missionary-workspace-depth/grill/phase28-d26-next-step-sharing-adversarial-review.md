# Phase 28 D26 — optional sharing of selected next steps

Research date: **October 17, 2026 UTC**. Repository HEAD:
`9cada8f3d8ab59db391d3fd20df77fcadeb09813`.
**Disposition: Accept with required amendments.**
**Status: Corrected decision and required amendments explicitly ratified on
October 17, 2026 UTC.**

This completes the research and adversarial review of [Q26](phase28-q26-coaching-next-step-summary-research.md).
It is a grooming decision record under the [founder brief](phase28-founder-brief.md:19),
not a formal PRD, ADR, OpenSpec, ticket, implementation or release qualification.
D25 remains ratified. No Q27 was posed during the initial review; subsequent
ratification and continuation are recorded below. No application code, schema,
dependencies, live data, provider configuration or external contact changed.

## Exact corrected decision to record

> **A — Optional sharing of selected next steps.** When the organization permits
> this coaching module, Maya may deliberately share an eligible summary of one
> selected task with named eligible coaches in its exact ministry/workspace
> context. Creating, assigning or completing a task does not share it. Jordan
> sees the approved short description, current permitted due date and truthful
> task status, read-only. Maya continues to manage the original task once.
>
> **Review sharing** shows exactly what Jordan will see, who will see it, and
> the existing coaching access duration. **Share next step** commits that choice.
> Dates and status follow the same task through current authorized reads. The
> shared description is deliberately approved wording; later source title or
> description changes do not silently publish new text. A change to that meaning,
> responsibility or scope withholds the summary. Maya can review it again only
> while she retains current sharing authority for that eligible task and context.
> A due-date or ordinary status change alone needs no second share action.
>
> Sharing does not expose supporter identities, private notes, source links,
> message bodies, attachments, financial details, other tasks or task history.
> It grants no ability to assign, comment, remind, edit, complete or reopen work.
> A task's completion is not proof that a call happened, a message was sent, a
> gift was received or a linked source was resolved.
>
> Each share covers the exact task occurrence and approved audience. A new task,
> recurring successor, replacement task, new coach or changed ministry is not
> included automatically. Completion and cancellation remain distinguishable;
> eligible completed work can remain visible under current sharing and retention
> rules. **Stop sharing** ends the selected disclosure without changing the task.
> Expiry, organization restrictions, source restrictions and current permissions
> govern every release. Ended access is never revived by re-enabling a setting,
> retrying an old request or restoring data.

**Recommended scope is a small task-summary module, not a coaching task manager.**
Reuse existing coaching settings, access episodes and duration. No second task
status, per-coach task copies, new task engine, permission framework, reminder
service or integration is needed. This amendment adds deliberate wording review
and exact occurrence eligibility; it does not authorize broad raw task access.

## Evidence and decision reasoning

| Evidence class             | What is established; practical limit                                                                                                                                                                                                                                                                                                                                                                             |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User-selected intent       | The user selected optional current task summaries with organization permission, deliberate missionary sharing and read-only coaches. The illustration is a support-raising preparation task; it is not an observed ministry interview.                                                                                                                                                                           |
| Ratified repository intent | D8 requires useful next-step context and forbids duplicate task truth or coach task mutations. D11 owns duration/non-revival. D24 shares selected numeric summaries; D25 separately shares narratives. Neither grants task summaries by implication. [Owner evidence](d26-evidence/governance-and-task-ownership.md).                                                                                            |
| Task/source authority      | [ADR0183](../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:24) requires finite qualified source projections and one task identity. [Independent follow-up](../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:622) can finish without closing its linked source. P9/P12 retain field, source and context boundaries.                                             |
| Current source             | A bounded fresh review finds legacy missionary tasks, service-role handlers, generic status changes and private task/supporter data. It does not find a qualified D26 sharing producer. Browser table grants are revoked; that is not proof of a coach leak or of a safe new server DTO. [Database evidence](d26-evidence/database-and-authorization.md).                                                        |
| Primary product evidence   | MPDX distinguishes planned tasks and logged work; CoachAccountable documents self-created actions and current status; TntConnect has coach reporting. Asana illustrates how sharing task access can expand through other memberships. These support explicit context and minimal projection, not importing their access or reporting policies. [Dated source register](d26-evidence/ux-and-primary-research.md). |
| Current technical guidance | Supabase/PostgreSQL documentation distinguishes table privileges, RLS, function execution, invoker/definer authority and transaction snapshots. RLS is not column redaction and an API route is not proof of authorization. Evidence records exact qualifications rather than repeating skill shorthand.                                                                                                         |
| Product judgments          | A compact review, short plain-text shared description, same-task status updates and no automatic notification are proportionate to this job. They are now ratified requirements, not measured user preferences or demonstrated performance.                                                                                                                                                                      |
| Assumptions and unknowns   | Missionaries/coaches need less repeated copying; approved safe wording will be useful for eligible task kinds; source policy can support the intended projection. Real-user comprehension, exact runtime roles/producer contracts, retained data and load remain release proof obligations. No interviews, authenticated competitor tests or deployed database inspection occurred.                              |

**Strongest alternative B:** keep all next steps in ordinary tasks and describe
progress in deliberately shared written check-ins. B is simpler and remains a
complete voluntary coaching path. Its cost is repeated copying and potentially
outdated descriptions of current status. A earns a small projection and consent
boundary by removing that maintenance. A second writable coaching checklist
would lose that benefit and is rejected. Live raw title/body access is simpler
to implement but fails the selected privacy boundary and is also rejected.

**Conflicts resolved:** competitor coach assignment, compulsory reporting,
reminders, full task history and inherited project access do not override D8.
Generic task completion does not override ADR0183 source-controlled closure.
Future Workflow Studio features are not prerequisites or authority to send
messages here. P12/ADR0211 owns actual projection-policy widening; ordinary
Maya sharing under a qualified policy does not need a new supervisory approval.
The Supabase skill's warning about omitted `WITH CHECK` is overbroad: PostgreSQL
can use `USING` as its fallback. Explicit old/new checks are required for clarity,
but omission alone is not reported as an exploit. Source-owned confidentiality
cannot be bypassed by manually rewriting a private record into coaching text.

## User journeys and presentation

### Organization: one understandable module control

Add **Next-step summaries** to the already governed coaching configuration:
**“Allow missionaries to share selected task summaries with their coaches.”**
Absent configuration grants nothing. Staff with the exact settings capability
may enable the module within the qualified source and field ceiling. Setting
management does not grant access to task bodies or shared content. Avoid per-field
custom schema, arbitrary status formulas and a second per-task expiry system.
Disabling fences this module's affected sharing and pending activation; other
independently allowed modules and original tasks continue. Re-enable permits a
fresh deliberate share; it does not resurrect old grants. Explain the affected
sharing before the ordinary settings save, without creating a routine approval queue.

### Maya: choose, review, share

Two entry points converge on the same small flow: **Share with coach** in an
eligible task's details, and **Coaching → Next steps → Share a next step**. The
second opens an authorized picker for the current ministry context. It is not a
global task directory. Search, totals and pagination include only eligible
records; an inaccessible task cannot be inferred through a count or search hit.
Keep the original task list as the home for editing and completing tasks.

The review is a single focused sheet on wide screens and a readable page on
phones. It includes the exact approved short description, due date or **No due
date**, truthful status, named coaches, organization/ministry and effective access
duration. A qualified safe title may prefill the description for Maya; protected
raw titles cannot be used as an automatic fallback. Maya can use neutral wording
such as **“Revise my support-raising introduction.”** A short helper says
**“Keep supporter names and private details out of this summary.”** No claim is
made that sanitization can detect all confidential prose.

The preview is the actual projected recipient view, not a screenshot of Maya's
broader task. Show **“The due date and status will update from this task. Changes
to its description need another review.”** Show the existing duration with a
link to manage coaching access, not another timer. Within an already selected
Jordan context, show Jordan explicitly as the intended recipient; opening the
flow still publishes nothing. From a generic task choose named eligible coaches;
never preselect all coaches or future invitations. Adding a coach is a fresh
reviewed disclosure. No separate supervisor approval is inserted into ordinary use.

**Share next step** is the only disclosure action. Success is acknowledged by
the server: **“Shared with Jordan”**, with **View shared summary** and **Manage
sharing**. Failed authorization explains safely that sharing is unavailable;
failed persistence preserves permitted local edits without claiming success.
A lost response offers **Check sharing status** for the same operation, not a
new implicit share. Sharing itself sends no email, calendar entry or reminder.
If no eligible coach exists, the existing invitation path remains available;
acceptance later does not silently share the task.

Illustrative information hierarchy, not a rendered or usability-tested UI:

```text
Review sharing                              Maya · current ministry

Jordan will see
Revise my support-raising introduction
Planned                         Due 23 Oct 2026

Shared with                    Jordan
Access                         No scheduled end · Manage access

Dates and status update from this task.
Changes to its description need another review.

Back                           Share next step
```

### Maya: update once and retain clear control

The ordinary task displays a restrained **Shared with Jordan** indicator and
**Manage sharing**. Rescheduling or completing through the task owner's normal
command updates the authorized summary on its next successful read. This does
not mark outreach as successful or create an activity count. No coach approval
is needed for a date change. Task controls continue to obey the correct source
closure contract.

When meaning-bound title/description, source context, responsibility or
classification changes, Maya sees **“Review sharing — this task changed.”**
Save the legitimate task change normally; withhold its coaching projection.
Offer one direct review only while Maya retains current sharing authority for
that exact eligible task and context. Otherwise show a safe unavailable state
and permitted Stop sharing controls without source details. No share transfers
to a new assignee or ministry. Do not block ordinary task
editing, silently publish changed wording, or show new status against an old
misleading description. Private notes that are not shared and do not affect
source eligibility do not create repeated review prompts.

**Stop sharing with Jordan** is directly available and takes effect on server
acknowledgment. It never cancels/deletes the task or stops another independent
recipient's valid share. Recovery from a mistaken stop is a fresh reviewed share,
not an unqualified Undo that revives an ended episode. Explain that stopping
access cannot recall what Jordan already read. Completed and cancelled work
remain distinct; hiding a completed item in a collapsed section is presentation,
not deletion or revocation.

### Jordan: prepare with a calm, useful view

Use D8's existing coaching portfolio and explicit organization/ministry context
switcher. Each subject's **Next steps** contains only summaries shared with this
coach. Default to current open work, with **Closed next steps** available
without a second task ledger. Show approved description, source-qualified status,
due date and **Current as of …**, using the authorized source-read time. A
separately admitted source-change timestamp may be labeled **Task updated …**;
neither means browser re-render time. Closed entries preserve distinct permitted
completed/cancelled/superseded/withdrawn/no-longer-required labels, not one green
Done bucket. No task checkbox, pencil, comments, supporter
link, assignee lookup, action menu that mimics editing, or disabled control that
suggests Jordan can acquire those powers here. A staff member using the coach
surface gets the same narrow view; staff powers require their separate context.

Dates use explicit localized calendar dates; never show an ambiguous numeric
date alone. A source date-only due value remains that calendar date across zones.
A timed due value shows a qualified safe zone label or offset sufficient to
preserve its meaning; an IANA city name or other label must not disclose a
protected location. Do not invent an overdue state for a
missing due date or use a coach's browser zone to change the task's meaning.
Use neutral **Due date passed** where supported, not performance grades, red
failure rankings or a coaching compliance score. A completed task is labeled
**Task completed**, not **Supporter contacted** unless that separate source fact
is independently qualified and separately shared—which D26 does not add.

An empty view says **“No next steps are currently shared with you.”** It does not
say Maya has no work. An unavailable response says **“Next steps are unavailable
right now. Try again.”** It is not zero or completion. Do not reveal which private
task was restricted or why. A content-review withholding does not leak the changed
title via a placeholder. Existing safe module-level availability may be shown;
protected item-specific details require current authority.

No combined cross-organization task count, productivity ranking or inferred
completion ratio. Portfolio navigation supports multiple missionaries/projects
through the already qualified scope, not a new cross-tenant task feed. Selected
current summaries may include completed work only under current source retention
and disclosure rules; no historical status log or complete past task archive is
introduced. Different coaches can legitimately see different selected sets.

### Accessibility, mobile and interrupted work

Use exact shared `base-maia`, Base UI and semantic Zinc tokens from `@asym/ui`.
Keep one column on phones, readable line lengths, short labelled sections and
one primary action. Disclosure state and work state are separate text labels;
color and icons are supporting cues. Prefer a compact list to a dashboard full
of charts. Details and additional recipients appear when requested; critical
audience/duration/currentness facts remain visible before sharing.

Require WCAG 2.2 AA: keyboard operation, visible unobscured focus, meaningful
labels and errors, 320 CSS-pixel reflow, 200% text resizing, status announcements
without focus theft, target sizes meeting 2.5.8 including its spacing exceptions,
and accessible alternatives to drag actions. Verify long Unicode names, RTL
layout, localized dates and screen-reader reading order. Preserve list position
and focus after review/stop. Announce save/result changes once, not each refresh.

No offline disclosure queue or sensitive body storage in browser persistence.
On low bandwidth, keep ordinary task work usable and clearly distinguish pending
from acknowledged sharing. On tenant, identity, coach-hat or authorization-generation
change, clear reached protected state and reject late responses. Fetch on entry,
focus and explicit refresh through the existing query pattern; do not promise
instant push delivery or introduce Realtime for this feature. Currentness means
a freshly authorized source result, not a static copied status. An open tab can
contain information previously released; the product cannot recall viewed bytes.

## Exact required amendments

These clauses are ratified future requirements for the authorized downstream
specification, not claims that the current repository implements them.

### D26-C01 — Optional module and authority

The system SHALL require current organization permission, exact eligible coaching
context, current grantor authority and deliberate task/recipient selection.
Absent or unknown permission SHALL deny sharing. Creation, assignment, acceptance,
target creation, check-in publication and completion SHALL NOT enable sharing.
Settings authority SHALL NOT grant content reads. Use P3/P10/P12 and D8, without
a second authorization registry or an unconditional coach role bypass.

### D26-C02 — Exact source and eligible task contract

Each share SHALL bind a tenant-consistent source task occurrence, missionary,
ministry/workspace, exact coaching episode and named recipient. One source task
identity SHALL remain authoritative. P9 ordinary manual/Independent follow-up
tasks are eligible only when their exact coaching projection is qualified;
source-controlled tasks require an explicit owner-qualified minimal projection
and truthful status mapping too. Neither automatic origin nor a linked record
alone decides eligibility. Unknown or unqualified task kinds SHALL be withheld.
A code-owned finite contract SHALL state allowed fields, meaning revision,
scope/assignment/classification predicates, status/date meaning and retention;
reuse the existing source-contract mechanism rather than a generic plugin engine.

### D26-C03 — Minimum disclosure

The coaching result SHALL expose only an opaque summary handle, approved short
plain-text description, qualified due value/status and safe currentness/context
metadata. It SHALL NOT expose private raw title/body, supporter data, linked
source identifiers/URLs, comments, notes, attachments, other assignees, financial
fields, outcomes or historical task transitions. A shared description SHALL be
newly authored sharing-eligible wording or an exact qualified source projection;
manual paraphrase SHALL NOT bypass protected-source restrictions. Text SHALL be
escaped and bounded; no rich HTML, attachments, auto-link expansion or AI/DLP
dependency. A sanitizer is not a confidentiality guarantee.

### D26-C04 — Review and deliberate release

Review SHALL show the exact permitted recipient view, names, context and effective
access duration. Submission SHALL validate the reviewed descriptor/source meaning
revision, selected recipients and current source authority. Adding recipients or
changing shared wording SHALL require deliberate current review. No future coach
or task SHALL inherit selection. A single short review is sufficient; no routine
staff approval or multi-step setup wizard SHALL be added.
One task's reviewed recipient-set addition SHALL commit atomically: if any
selected recipient is no longer eligible, add no new audience and return a safe
review-needed result. Existing valid shares remain unchanged.

### D26-C05 — Wording and live facts

Approved description SHALL be an immutable version of disclosure content, not
a second editable task. Due/status SHALL be derived from the same eligible
occurrence on each current read; no independently writable coaching copy.
Every source title/description change and every change to another registered
meaning-bearing field SHALL invalidate the description approval and withhold
the summary pending deliberate review. No semantic similarity, AI judgment or
cosmetic-edit guess SHALL preserve approval. Scope, linked protected-source
context, responsibility or classification changes SHALL re-evaluate eligibility
and invalidate affected approval; they SHALL NOT retarget an old share.
Invalidation SHALL be durable and revision-based: restoring earlier wording,
scope or responsibility SHALL NOT restore prior approval. Fresh review requires
current sharing authority and exact source eligibility. Due/status-only changes SHALL
continue without re-sharing while all other predicates remain valid. Unshared
private-note edits SHALL not trigger review unless eligibility actually changes.

### D26-C06 — Truthful lifecycle

Source owners SHALL retain completion, cancellation, reopening, supersession and
deletion meaning. An Independent follow-up can finish while its linked source
remains open; a source-controlled task cannot be completed through a generic
task checkbox. The summary SHALL map only the exact qualified source states,
distinguish completed, cancelled and other admitted terminal meanings, and withhold
unknown mappings. An Independent follow-up task may reopen only when its owning
contract permits reopening that same occurrence; an otherwise valid summary may
reflect its current status. A source-controlled predecessor SHALL NOT reopen.
Recurrence, replacement or renewed source work creates the source-owned successor
occurrence and SHALL require fresh selection.
Task completion SHALL NOT create or prove an interaction, send or financial effect.

### D26-C07 — Scope, duration and non-revival

Use D8/D11's existing access duration and current source restrictions. D26 SHALL
NOT introduce a separate per-task expiry engine. Stop, expiry or module disable
SHALL fence affected grants and pending effects. Re-enable, extension after end,
new membership, restore and old retries SHALL NOT revive ended grants. Fresh
sharing uses a new admitted disclosure generation without requiring a needless
new invitation when the underlying coaching relationship is still valid.
Temporary read failure or review withholding is distinct from terminal expiry.
No scope transfer, grant widening or new history is implied by a date change.

### D26-C08 — Read-only coach and separate identities

Coach access SHALL authorize no task/source write, comment, assignment, reminder,
completion, reopening, bulk operation or API equivalent. Existing independent
staff rights SHALL not widen a coaching result. All protected reads, counts,
search, filters, sort inputs, portfolio entries, URLs and error responses SHALL
apply the same exact current audience and source policy before materialization.
No raw-task drilldown, export, public link, email digest or calendar publication
is introduced by this decision.

### D26-C09 — Database integrity

Use non-null tenant/scope/episode/source/recipient relationships with tenant-aware
keys/FKs or the owning source's equivalent atomic integrity boundary. A source
pointer alone SHALL NOT grant source access. Prevent duplicate live inclusion of
the same occurrence/recipient/episode; keep distinct historical generations.
Constrain positive revisions, valid state/date combinations, nonblank bounded
descriptors and exact source status/date types. Derive tenant, actor, grantor,
owner, recipient binding and audit attribution from trusted context/source;
caller IDs are references to validate, never authority. Generic updates SHALL
not rebind identity or move a row into an otherwise forbidden scope. Financial
precision is inapplicable to this DTO: no money SHALL be copied or calculated.

### D26-C10 — Grants, RLS and privileged paths

Keep protected sharing facts and raw task bodies unavailable to anonymous or
generic browser table access. Exposed tables require least-privilege grants and
RLS; SELECT must enforce current exact scope, and mutations must enforce both
permitted old state (`USING`) and proposed new state (`WITH CHECK`) plus immutable
field restrictions. RLS alone SHALL NOT be treated as column redaction. A
security-invoker view works only with its necessary underlying grants; do not
grant coaches raw tasks just to make a view succeed. Any privileged projection
command SHALL explicitly enforce the same predicates, have restricted execution,
safe search path and a fixed allowlisted result. Audit function owners, table
owners, bypass roles, views, RPCs, service-role paths and storage independently.
The coach DTO SHALL NOT reuse the current raw missionary task response.

### D26-C11 — Atomic commands and races

Share/review/stop SHALL use trusted current authorization, expected revisions,
durable semantic operation identity and required atomic audit. Duplicate submits
resolve the same result; changed meaning under the same operation ID is rejected.
Different task/recipient intentions remain distinct. Concurrent share, source
mutation, expiry, stop and read SHALL have a defined owner-controlled release
ordering. If restriction wins before authorization/release, no payload may be
released; if release legitimately wins first, later revocation cannot recall it.
Use actual current time at admission, including after lock waits, not transaction-
start time. An MVCC snapshot or cached allow alone cannot prove revocation safety.
Source writes remain successful when a subsequent summary refresh fails.
An authorized controller SHALL be able to stop the exact sharing generation
without loading protected source content or validating pending draft wording.
Source unavailability SHALL NOT prevent revocation; actor/context authorization
remains required. Grant-widening validation SHALL not obstruct this narrowing path.

### D26-C12 — Honest availability and client isolation

Return unavailable/withheld/ended distinctions only where their disclosure is
permitted; never substitute zero, empty work or completion. Protected results
SHALL be bound to tenant, subject, actor/hat, recipient, episode, disclosure and
authorization/source revisions. Clear reached state and reject old responses
when context or grants change. Revalidation SHALL precede displaying a result
as current. Shared public caches and persistent offline bodies SHALL NOT contain
these summaries. No stable response may be repopulated after a stop from an old
loader, browser Back, recovered mutation or another tab's earlier cache.

### D26-C13 — Current view, retention and deletion

Sharing current state SHALL NOT authorize historical task/body versions or a
complete task archive. Completed/cancelled entries may remain discoverable only
while source retention and current grants allow. Source deletion/purge SHALL
fence the summary; it SHALL not leave an orphaned readable snapshot or erase
required lawful audit by cascade. Minimize retained description copies under the
qualified P9/P12/retention contract, separate protected business history from
technical logs, and support required deletion/anonymization and legal holds
through their owner. Backups/restores SHALL reapply current denial before release.
There is no newly invented forever-retention period.

### D26-C14 — Bounded service and simplicity

Use existing packages/API/query/UI systems. The ratified initial profile is one
selected task per review, a shared description of at most **240 Unicode code
points**, and authorized summary/picker pages of **25 items**, with a server
maximum of **100 items per request**. These are reviewable product/engineering
bounds, not evidence of measured capacity. Pagination SHALL traverse all eligible
items deterministically; never silently cap a workspace's total. Reuse existing
source limits where stricter. Indexed scoped reads, bounded field sizes and
source-qualified filters SHALL precede pagination; no per-row remote fetches or
unbounded organization scans. Load qualification must publish the supported
tenant/coach/subject/task distribution and applicable service SLO before release.

### D26-C15 — UX and accessibility

Implement the journeys above with shared Base UI/base-maia components. Show work
status separately from sharing status, exact audience/context/duration before
release, server-acknowledged save state and direct Stop sharing. Jordan gets a
readable summary without edit-like controls. Date-only and timed dates retain
their distinct source meanings. WCAG 2.2 AA, keyboard/focus, mobile reflow,
screen-reader feedback, localization/RTL, low-bandwidth recovery and context
switching SHALL be qualified with actual user-visible tests. No rankings,
compulsory reporting, automatic nudges or presumed coach assent.

### D26-C16 — Business history and operations

Retain source-qualified actor/context, task occurrence, recipient, policy and
meaning versions, disclosure generation, operation ID, transition and safe reason
for share/review/stop/correction. Required audit failure SHALL roll back the
sharing mutation; a downstream view failure SHALL NOT undo a committed effect.
Technical logs SHALL exclude descriptions, donor facts, tokens and private source
IDs except approved opaque correlations. Authorized support must diagnose scope,
revision and availability without reading protected bodies by default. An
idempotent owner command, not direct SQL repair, owns recovery.

### D26-C17 — Rollout and source qualification

Before activation, inventory retained task IDs/producers/writers and actual DB
grants/RLS/functions; reconcile legacy storage with the canonical task owner.
No existing task, coach or missing setting SHALL be auto-enrolled. Deploy additive
compatible schema/contracts before readers, fence old writers and unknown contract
versions, then enable only qualified source kinds. Keep ordinary tasks/check-ins
usable if the module is disabled. Kill/rollback SHALL stop disclosure, preserve
source work/audit and not restore old grants; use roll-forward corrections after
new data exists. Exact owner gates block the affected task kind, not all Phase28.

### D26-C18 — Traceable proof

Carry D26-C01–C18 and P01–P24 below into the later authorized owner amendments,
glossary, OpenSpec projections, design, tasks, issues, tests and release evidence
without treating this research as implementation. Actual P12 policy widening
must follow ADR0211; data ownership remains P9/source, not coaching. Source gaps,
runtime/retention/load qualification and usability evidence SHALL be visible
release gates, not deferred into vague monitoring. No formal artifact transition
is authorized by this answer alone.

## Material concern register

Severity describes the consequence of an unamended design. Likelihood is a
qualitative engineering assessment under the stated naive implementation, not
observed incident frequency. **Plausible** means a realistic path exists;
**likely if reused** names concrete current code that would produce the problem.
The clauses above contain the exact corrected language, not merely mitigations.

| ID  | What could go wrong and why it matters                                                                                                              | Severity / likelihood                              | Evidence or reasoning                                                                                       | Effect on A; permanent fix and exact amendment                                                           |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| F01 | A separate coaching checklist diverges; every task kind is assumed shareable. Users maintain duplicate status or disclose an unqualified source.    | High / plausible                                   | ADR0183 one identity and source contracts; current legacy tasks do not prove coaching eligibility.          | Narrow A to a qualified summary of the original occurrence; C02/C05/C17.                                 |
| F02 | Reusing the missionary task API releases private descriptions/supporter joins, or raw table grants bypass the intended boundary.                    | Critical / likely if reused without a new boundary | Current API/DB evidence; server-only existing table does not make service-role output safe for coaches.     | Requires a dedicated minimal result and real authorization qualification; C03/C08–C10.                   |
| F03 | Later title/body edits silently expose names or attach current status to old, now-inaccurate wording.                                               | High / plausible                                   | Mutable task text versus deliberate initial preview; same ID does not imply same meaning.                   | Adds approved descriptor version and deterministic invalidation; C04/C05.                                |
| F04 | Done, cancelled, reopened or recurring work is misrepresented; a new occurrence inherits access. Completion becomes a false call/send/gift fact.    | High / plausible                                   | ADR0183 independent/source-controlled closure; D23 qualified activity counting.                             | Clarifies source mappings and occurrence identity; C02/C06.                                              |
| F05 | Tenant/subject/recipient/hat changes broaden a grant, cache, count or search result.                                                                | Critical / plausible                               | P12 current source/field policy and context-fencing obligations; arbitrary IDs are not authority.           | Requires scope-complete integrity and all-surface enforcement; C01/C08–C12.                              |
| F06 | Stop, expiry or disable races with release; stale retry or backup resurrects access.                                                                | High / plausible                                   | D8/D11 non-revival; MVCC snapshots, transaction-start clocks and asynchronous clients.                      | Adds exact ordering, terminal generations and stale-result rejection; C07/C11–C13/C17.                   |
| F07 | Due dates shift across zones; missing/unknown/unavailable is rendered overdue, empty or done.                                                       | Medium / plausible                                 | Source date-only/timed distinction; mobile/offline delays and unmapped states.                              | Requires source date semantics and truthful availability; C06/C12/C15.                                   |
| F08 | Sharing is easy to do accidentally; coach controls imply write powers; setup becomes a bulky permission wizard.                                     | High for disclosure, medium friction / plausible   | Selected deliberate sharing; GOV.UK review pattern, D8 read-only and shared UI rules.                       | Adds one explicit recipient review, direct stop, narrow module settings; C01/C04/C08/C15.                |
| F09 | Approved free text launders restricted details; exports, telemetry, previews or retained bodies extend the audience.                                | High / plausible                                   | D8 source restrictions apply to paraphrase; safe fields do not make sensitive prose anonymous.              | Prohibits source laundering and indirect egress, minimizes retention/logs; C03/C08/C13/C16.              |
| F10 | Double-submit creates duplicate shares; source change during preview admits stale wording; lost response causes new effects.                        | High / plausible                                   | Multi-tab/mobile concurrency and existing generic last-write-wins task mutations.                           | Requires semantic idempotency, expected revisions and atomic audit; C04/C09/C11/C16.                     |
| F11 | Many subjects/tasks cause full scans, N+1 source fetches, silent caps or authorization-after-pagination.                                            | Medium to high / plausible                         | Portfolio use is explicit; existing bounded task reads do not prove a complete scalable summary.            | Requires bounded pages/fields, authorized indexed enumeration and measured capacity; C08/C14/C17.        |
| F12 | Staff can neither explain nor repair an incorrect share; logs expose content or audit vanishes on deletion.                                         | High / plausible                                   | Durable sharing history differs from diagnostics; legacy hard-delete is not the future correction contract. | Requires attributed business transitions, protected logs and owner recovery; C13/C16.                    |
| F13 | Mixed-version rollout, unqualified source policy or restored data creates broad accidental sharing.                                                 | High / plausible                                   | Current implementation lacks the intended producer; P12 widening needs owner qualification.                 | Requires denied-by-default additive rollout, writer fencing and scoped kill; C01/C10/C17/C18.            |
| F14 | A useful optional view becomes surveillance, compulsive logging or a claim of instant/live recall, and review notes are mistaken for release proof. | Medium to high / plausible                         | Voluntary D8 coaching, untested UX and inherent limits of previously disclosed data.                        | Keeps selection optional, metrics modest, currentness honest and proof status explicit; C06/C12/C15/C18. |

## Independent review of every requested category

Every category was considered independently. Findings recur because one root
defect can affect multiple boundaries; that does not create extra requirements.
No active production vulnerability or incident is claimed from these design risks.

| Category                                                         | Material concern?                                    | Independent evaluation and exact resolution                                                                                                                                                                                        |
| ---------------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Problem validity, necessity and alternatives                  | **Yes**                                              | A solves repeated status entry only if it reuses the original task. B remains a viable complete narrative path; a second checklist fails the root job. F01/F14; C02/C05/C18.                                                       |
| 2. Brittleness                                                   | **Yes**                                              | Mutable descriptions, unsupported task kinds/statuses and stale grants break under ordinary edits. F03/F04/F06; C02/C05–C07/C12.                                                                                                   |
| 3. Technical debt                                                | **Yes**                                              | Legacy task storage/DTO and copied coach status would become competing authority. No new package is needed. F01/F02/F13; C02/C05/C10/C17.                                                                                          |
| 4. Edge cases                                                    | **Yes**                                              | Missing dates, cancellation, reopen, recurrence, reassignment, deletion, multiple coaches and interrupted saves require distinct outcomes. F03/F04/F06/F07/F10; C04–C07/C11–C13.                                                   |
| 5. Footguns                                                      | **Yes**                                              | Implicit audience selection, editable-looking coach controls and a stop action that cancels work would mislead. F08/F14; C01/C04/C08/C15.                                                                                          |
| 6. Tenant safety                                                 | **Yes**                                              | Shared-account contexts, scope-moving updates, indexes/caches/search can cross boundaries despite an initial UI check. F05/F06; C08–C12.                                                                                           |
| 7. Database, RLS and authorization safety                        | **Yes**                                              | FK/uniqueness/null/default/update/role/function boundaries must be qualified; row access cannot substitute for field redaction. Money copying is explicitly absent. F02/F05/F06/F10/F12; C09–C13/C16/C17.                          |
| 8. Overengineering                                               | **Yes**                                              | A new task manager, form engine, per-task expiry service, auto-reminders or provider sync adds no necessary value. F01/F08; C02/C07/C08/C14.                                                                                       |
| 9. UX/UI and user friction                                       | **Yes**                                              | Hidden disclosure state, excessive steps, ambiguous dates, small screens and inaccessible feedback undermine control. F07/F08/F14; C04/C12/C15 and the full journeys.                                                              |
| 10. Source of truth, ownership and invariants                    | **Yes**                                              | Coaching must own only disclosure, not source progress or source completion. A current snapshot must not become write authority. F01/F03/F04; C02/C05/C06/C09.                                                                     |
| 11. Hidden coupling                                              | **Yes**                                              | Sharing must not depend on all Workflow Studio, expose linked sources or treat check-in/target consent as task consent. F01/F02/F13; C01/C02/C08/C17.                                                                              |
| 12. Failure modes                                                | **Yes**                                              | Lost share responses, committed source updates with failed refresh and unavailable authorization must not invent success/zero. F06/F07/F10/F12; C11/C12/C16.                                                                       |
| 13. Lifecycle, temporal correctness, concurrency and idempotency | **Yes**                                              | Mutable source, live status, expiry, terminal share generations and replay require separate clocks and ordering. F03/F04/F06/F10; C05–C07/C11–C13.                                                                                 |
| 14. Data integrity                                               | **Yes**                                              | Duplicate inclusion, orphaned summaries, stale wording and row rebinding can corrupt the perceived task state. F01/F03/F05/F10/F12; C05/C09/C11/C13.                                                                               |
| 15. Security and privacy                                         | **Yes**                                              | Disclosure extends beyond task selection through text, linked donors, metadata, logs and retained copies. F02/F05/F09; C03/C08/C10/C12/C13/C16.                                                                                    |
| 16. Scalability and performance                                  | **Yes**                                              | Portfolio size and long histories can cause unbounded reads or silent omissions; no capacity result is known. F11; C08/C14/C17.                                                                                                    |
| 17. Operational burden                                           | **Yes**                                              | Poor error/review reasons or SQL-only repair would make every grant change a support incident. F08/F12/F13; C12/C15–C17.                                                                                                           |
| 18. Observability and auditability                               | **Yes**                                              | Logs do not prove who deliberately shared which version; content-rich diagnostics themselves leak. F09/F12; C13/C16.                                                                                                               |
| 19. Dependency and integration risks                             | **Yes — source contracts; no new vendor dependency** | P9/P12/D8 qualification is real; competitor functionality and shared-task existence do not supply it. No external task/calendar/email synchronization is introduced. F01/F13; C02/C08/C17/C18.                                     |
| 20. Migration, rollout and upgrades                              | **Yes**                                              | Old writers, missing settings, nonempty retained data and backups can undermine safe defaults or revive access. F06/F13; C07/C13/C17.                                                                                              |
| 21. Testability, traceability and proof                          | **Yes**                                              | Vague “eligible/current/read-only” cannot be accepted as tested behavior; source/privacy/UX claims need falsifiable evidence. F01/F02/F14; C18 and P01–P24.                                                                        |
| 22. Other development hazards                                    | **Yes**                                              | Human knowledge cannot be recalled; optional coaching can drift into monitoring/compliance, and broad dependency gates can stall unrelated work. F14/F13; C12/C15/C17/C18. No additional money or provider mutation is authorized. |

## Acceptance and proof obligations

These are required future tests and evidence, not results claimed by this review.
Use real source commands/roles for authorization tests, actual concurrent sessions
for races, retained-data fixtures for migration, and rendered UI for accessibility.
Do not count mocked permission booleans or this document's finite models as proof.

| ID  | Falsifiable required outcome                                                                                                                                                                                                                                     | Clauses             |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| P01 | A permitted Maya shares one eligible ordinary task with Jordan after exact review; Jordan receives only the allowlisted description/date/status/context.                                                                                                         | C01–C04             |
| P02 | No setting, disabled setting, absent coach acceptance or insufficient source authority denies activation; creating a task/target/check-in shares nothing.                                                                                                        | C01/C07             |
| P03 | A valid due/status-only source update appears on the next authorized read without new share action or copied status write.                                                                                                                                       | C05/C06/C12         |
| P04 | Any source title/description edit is saved but new text never reaches Jordan without review. Restoring the original text after an intervening revision cannot restore old approval.                                                                              | C03–C05             |
| P05 | Private unshared-note changes alone do not re-share text or needlessly withhold an otherwise eligible summary.                                                                                                                                                   | C05                 |
| P06 | Scope, responsibility, classification, source-policy or identity changes fail closed; old selection cannot follow a new ministry/assignee automatically.                                                                                                         | C02/C05/C07/C09     |
| P07 | Independent task completion does not close a linked source or increase interaction counts; source-controlled closure rejects generic complete/reopen mutations.                                                                                                  | C06/C08             |
| P08 | Completed/cancelled/other admitted terminal states remain truthful. Only owner-permitted Independent follow-up reopening may reuse the same selected occurrence; a source-controlled predecessor cannot reopen, and successors/replacements/copies are unshared. | C02/C06             |
| P09 | Cross-tenant/subject/recipient IDs and coach requests to raw task endpoints, views, RPCs, collections, Realtime and storage cannot retrieve or mutate unauthorized data.                                                                                         | C08–C10             |
| P10 | Direct old/new-row mutations cannot rebind tenant/actor/source/episode/recipient or edit audit; actual grants, RLS, definer/invoker and service-role paths agree.                                                                                                | C09/C10/C16         |
| P11 | Search, counts, sorts, filters, pages and errors reveal no excluded task, title, donor or permission-sensitive hidden total.                                                                                                                                     | C03/C08/C14         |
| P12 | Two identical submissions produce one inclusion/effect; repeated operation with changed payload rejects; lost response reconciles the same committed result.                                                                                                     | C09/C11             |
| P13 | Concurrent share/review versus source edit/stop/disable is exercised in both orderings with real locks/sessions; stale revisions cannot admit disclosure.                                                                                                        | C04/C05/C07/C11     |
| P14 | Read versus revoke and expiry is exercised in both orderings; requests delayed by locks recheck actual cutoff, including equality. No promise is made to recall prior bytes.                                                                                     | C07/C11/C12         |
| P15 | Re-enable, expired-share extension, new membership, retries, old tabs and restore cannot revive terminal disclosure generations; fresh sharing is deliberate.                                                                                                    | C07/C12/C17         |
| P16 | Multiple valid coaches can see different selected sets; removing one preserves the task and other grants. Authorized Stop succeeds during a source outage or invalid pending wording without loading protected task content.                                     | C01/C04/C07/C09/C11 |
| P17 | Date-only, timed/zone, missing date, DST, local day boundary, locale and unknown status produce exact source meaning or explicit unavailable state.                                                                                                              | C06/C12/C15         |
| P18 | Source commit success plus summary failure stays successful; unavailable source/auth is not zero/empty/done; re-entry/refresh revalidates before current display.                                                                                                | C11/C12             |
| P19 | Tenant/hat/user switches, two tabs, browser Back and out-of-order responses cannot repopulate the wrong or ended context.                                                                                                                                        | C08/C12             |
| P20 | Purge/deletion/retention/hold/anonymization preserve required lawful evidence while ending unauthorized readable snapshots; logs have no protected bodies.                                                                                                       | C13/C16             |
| P21 | 240/241 code-point input, combining/emoji text and blank text boundaries; 25/100/101-page requests; deterministic multi-page traversal without silent total caps.                                                                                                | C03/C14             |
| P22 | Production-shaped task/coach/tenant distributions show indexed bounded authorization-before-pagination reads, no N+1, and meet the published applicable SLO.                                                                                                     | C14/C17             |
| P23 | Keyboard/screen-reader/mobile/RTL/long-name/low-bandwidth tests and actual missionary/coach/staff usability sessions prove audience, live-field and stop-action comprehension.                                                                                   | C04/C12/C15         |
| P24 | Nonempty migration, mixed versions, unknown contracts, kill switch and post-write rollback/restore preserve source work, no auto-enrollment and no broad reader.                                                                                                 | C17/C18             |

## Synthesis and order of work

1. **Resolved before recording this answer:** retain one task truth; distinguish
   work status from disclosure; approve wording separately from live due/status;
   preserve source-controlled versus Independent completion; use exact occurrence
   and current context; keep narrative-only B as a useful ordinary path. A remains
   the selected choice. The founder subsequently ratified this corrected decision,
   C01–C18 and P01–P24 as future obligations, without claiming implementation.
2. **Capture in the later authorized spec/design:** C01–C18 and P01–P24; full
   Maya/Jordan/staff flows; the finite task-kind/status projection manifest; exact
   owner/field/retention boundaries and dependency edges. P9/source and P12 must
   qualify the intended projection, including ADR0211 where actually applicable.
   This is an implementation release gate, not a question the founder must answer
   about SQL. Do not add a new read permission by consumer assumption.
3. **Require during implementation:** qualify the source contract and retained
   task migration first; implement the current authorization/minimal projection
   and atomic sharing boundary; then the small task/coaching UI; then prove all
   reached APIs/storage/roles/client races, accessibility and supported capacity.
   Activate qualified source kinds only after these checks. Ordinary tasks and
   written check-ins remain independent throughout.
4. **Release proof, not vague follow-up:** use real missionary/coach/staff users
   before release. Each must correctly identify the named audience, the live
   fields, the fields excluded, whether a new task is shared, what completion
   proves and what Stop sharing changes. Any observed unintended disclosure or
   false action/outcome understanding blocks the flow until corrected and retested.
   Record actual participants, contexts, device/assistive setup, result and limits;
   this review claims none. Exact load/retention/authorization qualification must
   also be recorded before activation, not waived because a prototype looks right.
5. **Monitor only residual operational/UX risk after qualification**, under the
   explicit table below. Privacy and source correctness are not monitoring-only
   substitutes for release gates. Owner labels are accountable product/engineering
   roles; named on-call assignment must exist at activation.

| Residual signal                                                                                         | Threshold                                                                      | Owner                                  | Required response                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wrong audience/field/occurrence release or ended-share resurrection                                     | **One confirmed occurrence**                                                   | Security on-call + P12/coaching owner  | Disable affected projection, preserve restricted evidence, contain/reconcile and prove correction before re-enable.                                     |
| Duplicate active inclusion, contradictory source status or stale descriptor released after invalidation | **One confirmed invariant violation**                                          | P9/task and coaching engineering owner | Fence affected path/kind, reconcile through owner command and fix/test before restoring it.                                                             |
| Denied source fetch rendered as empty or completed                                                      | **One confirmed occurrence**                                                   | Coaching engineering owner             | Correct the availability mapping and regression coverage; withhold affected result until safe.                                                          |
| Query/load or completeness regression                                                                   | **Any breach of the published applicable SLO or supported completeness bound** | Platform on-call + source owner        | Inspect scoped plans/load, apply truthful limits or disable affected profile; requalify before expansion. Actual SLO/bounds are a release prerequisite. |
| User believes private wording/new tasks auto-share, coach can edit, or Stop sharing cancels the task    | **One credible observed misunderstanding in a supported flow**                 | Product design owner                   | Reproduce and revise copy/flow, retest affected journey; pause expansion when it can cause disclosure. Do not gather protected prose in analytics.      |
| Repeated review prompts after due/status-only changes                                                   | **One reproducible false invalidation**                                        | Task/coaching engineering owner        | Correct meaning-revision classification; do not loosen genuine confidentiality gates to reduce prompts.                                                 |

## Verification and limits

The evidence directory contains fresh owner/source review, dated primary research,
database analysis, bounded counterexamples and independent review. The structural
verifier checks references, all 22 review categories, clause/proof traceability and
preservation of the prior D25 evidence. See [verification](d26-evidence/review-verification.json)
and [review resolution](d26-evidence/cross-review-resolution.md).

Counterexamples test specific proposed invariants against unsafe alternatives;
they are not a Supabase policy test, actual database concurrency experiment,
rendered UI, usability study or performance qualification. Static source findings
are limited to inspected files. No promise is made that every task producer,
tenant deployment or external product behavior was exercised. The completed
deliverable is the reviewed decision and exact future obligations; implementation
and formal specification remain outside this session's authorization.

## Subsequent explicit ratification

On October 17, 2026 UTC, the founder instructed: **“Ratify this decision and
amendment. Then continue with this phase 28 grill-with-docs session.”**
This accepts the corrected D26 decision, C01–C18, the bounded initial profile,
P01–P24 and the specified monitoring responsibilities as future requirements.
It does not establish a delivered task producer, new active permission, runtime
qualification, completed user testing or authorization to create formal
specifications, tickets or implementation.

The [ratification evidence manifest](d26-evidence/ratification-evidence-sha256.json)
preserves thirteen initial research/review artifacts, including the original
verifier and result. Their unratified status flags remain dated historical
evidence. No counterexample, earlier PostgreSQL experiment or runtime test was
rerun during ratification. D25 and its retained evidence remain unchanged.

The session continues with one separately researched
[Q27](phase28-q27-returning-missionary-preparation-research.md). Its answer is not
implied by D26 ratification; existing source and permission boundaries remain
binding.
