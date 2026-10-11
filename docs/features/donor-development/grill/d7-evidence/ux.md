# D7 evidence — closing current development work with findable history

**Research/retrieval: 2026-10-10 UTC.** The founder selected closing the current
work, keeping its history, when there is nothing further to pursue and no useful
review date. This note reviews that choice; proposed amendments are not
independently ratified. It is research only: no UI, code, formal specification,
live record, vendor system or notification was changed.

## Recommendation and strongest alternative

Retain A for its stated premise. Label the action **Close development work**,
with its supporter/ministry context available. Do not label the person or church
Lost, Inactive donor, Never Ask or Archived. Closing this effort says something
about staff work; it does not establish a donor's wishes, terminate a
relationship, certify a successful ask or change giving.

The strongest B is **an owned, undated hold while awaiting a known external
change**, with continuing intent and an identifiable lead. For example, staff
still intend to pursue a partnership after the church selects new leadership,
but neither party can give a useful date. That is different from deciding there
is no further work to pursue. B could remain findable through held-work filtering
and source context while being excluded from currently actionable workload. It
need not add recurring tasks, invented dates, automatic event detection, an
exception-approval committee or a new queue. An ordinary existing interaction
might reveal the change; an undated hold alone does not guarantee it will be
noticed.

B's real costs are another open-work category, ongoing responsibility, clear
reporting and a credible way for staff to return deliberately. A's real risk is
that staff misread closure as abandonment, lose continuing intent in history or
create another record when they return. These are design judgments, not measured
workflow statistics. **“No useful date” alone is insufficient evidence that work
should close.** The founder's additional premise—nothing further to pursue—is
necessary. Do not quietly introduce B under another status name or prohibit it
for every possible future ministry situation based on this illustrative case.

A no-new-screen implementation direction is a contextual close action using the
existing source detail and shared work/history views. Display a short consequence
summary and only actual blockers. If the source can establish that nothing blocks
closure, one deliberate final action is sufficient; no giant obligations wizard,
mandatory essay or parallel archive manager is justified. Reopening the same
journey versus a linked successor remains the next founder decision. No generic
Undo or Reopen behavior is authorized by this note.

## Rechecked Core evidence

All references were read on 2026-10-10. They establish current source or accepted
intent, not end-to-end D7 behavior or accessibility conformance.

| ID  | Exact source                                                                                                                                                                                                                     | Fact and implication                                                                                                                                                                                                                                                                                                                                                                          |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | [Q7](../phase27-q7-undated-holds.md)                                                                                                                                                                                             | The example expressly requires no further useful development work or outstanding development follow-up. Its boundaries preserve history, gifts, commitments, promises and communication restrictions; later same-record/successor semantics remain open. The original pre-answer prompt is preserved below the recorded selection; parent review owns accepted/proposed status.               |
| R2  | [ADR-0183](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:71), accepted 2026-08-29                                                                                                                 | Generic task Complete/Reopen/Delete/drag-to-Done cannot settle source work. Lines 93–100 distinguish Completed in source, No longer required, Reassigned and access loss. This is the controlling completion/history contract; it is not a registered P27 close command.                                                                                                                      |
| R3  | [ADR-0027](../../../../adr/0027-one-notification-presentation-and-engagement-model.md:18)                                                                                                                                        | Source, task and notification engagement remain different facts. Lines 42–55 distinguish current attention from recent history and current authorization. Closing applicable source work can end attention under its contract, without fabricating read or awareness.                                                                                                                         |
| R4  | [Admin task predicates](<../../../../../apps/admin/app/(app)/tasks/tasks-content.tsx:110>), [filter label](<../../../../../apps/admin/app/(app)/tasks/tasks-content-sections.tsx:204>)                                           | Default rows hide both completed and cancelled (lines 142–145), while the toggle says Include Completed. Due/overdue statistics exclude only completed (lines 110–120), so a cancelled dated row can contribute to the count despite being absent from the default list. Static source counterexample, not an executed production incident. This must not become D7's work/history predicate. |
| R5  | [Admin stats labels](<../../../../../apps/admin/app/(app)/tasks/tasks-content-sections.tsx:114>), [task controls](<../../../../../apps/admin/app/(app)/tasks/task-columns.tsx:120>)                                              | The Completed card says “Closed mission tasks”; a generic checkbox toggles completion. [Mutation](<../../../../../apps/admin/app/(app)/tasks/tasks-content.tsx:164>) sets/clears `completed_at` from browser time; lines 200–208 delete a task. These are unsuitable precedents for source-controlled closure, truthfully classified outcomes or audit time.                                  |
| R6  | [Admin collection](../../../../../packages/database/collections/admin-workspace.ts:805), [hook](../../../../../packages/database/hooks/admin-workspace.ts:33)                                                                    | Admin Tasks uses local transition/demo rows, identified explicitly at collection lines 10–12. These affordances do not prove persisted, authorized shared Tasks Hub closure.                                                                                                                                                                                                                  |
| R7  | [Missionary task statuses](../../../../../packages/lib/hooks/use-tasks.ts:10) and [stats](../../../../../packages/lib/hooks/use-tasks.ts:268)                                                                                    | Personal tasks have completed/deferred, with deferred excluded from due/overdue. This is another existing work vocabulary, not a donor-development undated-hold or closure policy. Do not map D7 blindly to either app's status enum.                                                                                                                                                         |
| R8  | [CRM timeline](<../../../../../apps/admin/app/(app)/crm/detail-drawer.tsx:300>) and [Activity tab](<../../../../../apps/admin/app/(app)/crm/detail-drawer.tsx:642>)                                                              | Constituent detail already has contextual activity/timeline presentation. Empty state says its read model is expanding. This is a useful history destination, not evidence that cultivation history exists. [Bulk archive](<../../../../../apps/admin/app/(app)/crm/page-client.tsx:68>) currently only reports unavailable; it is not D7's action.                                           |
| R9  | [Ratified D6 calendar rule](../phase27-d6-adversarial-review.md:199)                                                                                                                                                             | Dated pause retains its source-owned calendar date/zone and source schedule/history. D7 must not rewrite old review timing to make closure appear timely. A current close receipt timestamp is distinct from a chosen review date and any separately governed historical effective date.                                                                                                      |
| R10 | [Frontend rules](../../../../ai/rules/frontend.md:19), [accessibility review](../../../../ai/skills/accessibility-review/SKILL.md:22), [touch guidance](../../../../ai/skills/emil-design-engineering/touch-accessibility.md:46) | Reuse shared Base Maia/Base UI, semantic labels, focus/error/reflow behavior and 44px touch hit areas. Research-only review does not require artificial implementation tests or allow claiming conformance.                                                                                                                                                                                   |

## Fresh official practice and accessibility evidence

All following pages were fetched and read **2026-10-10**. Publisher dates are
shown where available; undated means no trustworthy article revision date was
exposed. “Latest” CiviCRM documentation is not a pinned installed release. No
vendor app was exercised. Examples below are comparators, not exact equivalents
to Core's continuing supporter/ministry development journey.

| ID  | Source, product and source date                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Supported fact / brief excerpt                                                                                                                                                                                                                      | D7 implication and limits                                                                                                                                                                                                                        |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| E1  | [Salesforce: Work with Prospects and Donors](https://trailhead.salesforce.com/content/learn/modules/nonprofit-cloud-philanthropy-and-partnerships/work-with-prospects-and-donors). Integrated Nonprofit philanthropy/partnerships, currently linked as Agentforce Nonprofit, **not NPSP**. Undated article; retained official sitemap metadata lastmod 2026-09-08.                                                                                                                              | Opportunity tracks work on a “particular solicitation”. Interaction summaries can relate to account and opportunity; a resulting gift commitment and transactions are separate records.                                                             | A closed solicitation does not settle the whole relationship or ledger. Training narrative, not a real nonprofit usage study; it does not supply a Core closure policy.                                                                          |
| E2  | [Blackbaud: Configure Opportunity Statuses](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-opportunity-status-configure.html). Raiser's Edge NXT web view, undated.                                                                                                                                                                                                                                                                                                  | Status counting options are Open, Closed, Closed–Success, Closed–Deferred and Closed–Declined. Days-until-overdue applies to open statuses and is unavailable for closed ones.                                                                      | Strong support for separating closure from successful outcome and open-work aging. Do not import a generic customizable status engine or apply ask status to the donor.                                                                          |
| E3  | [Blackbaud: Manage Opportunity Statuses](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-opportunity-statuses.html), RE NXT web view, undated.                                                                                                                                                                                                                                                                                                                        | A status change applies to that opportunity rather than other opportunities the constituent may have.                                                                                                                                               | Supports scope-specific outcomes; does not establish that all development efforts should be bounded opportunities.                                                                                                                               |
| E4  | [Blackbaud: Action Statuses](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-actions-statuses.html), RE NXT web view, undated.                                                                                                                                                                                                                                                                                                                                        | Offers basic Open/Past due/Completed or custom statuses whose completion meaning is configured; examples include Done, Completed or Closed.                                                                                                         | Counterexample to assuming the label Closed has one universal meaning. Core's accepted source completion rules control; do not adopt a status-to-completed mapping by label alone.                                                               |
| E5  | [Virtuous: What is the Gift Ask Pipeline?](https://support.virtuous.org/hc/en-us/articles/360051317631-What-is-the-Gift-Ask-Pipeline), CRM+, edited **2025-07-02**.                                                                                                                                                                                                                                                                                                                             | Closed and Declined have different outcomes. Fulfilled-giving totals require both a linked gift and Closed status.                                                                                                                                  | Closing work alone cannot prove money received, successful ask or donor conversion. These are ask reporting semantics, not a cultivation closure model.                                                                                          |
| E6  | [Virtuous: How Do I Archive a Contact?](https://support.virtuous.org/hc/en-us/articles/360050635632-How-Do-I-Archive-a-Contact), CRM+, edited **2025-11-17**; [View Archived Contacts](https://support.virtuous.org/hc/en-us/articles/360050636312-How-Do-I-View-Archived-Contacts), edited **2023-04-22**.                                                                                                                                                                                     | Contact archive removes the contact from the main screen and contact/individual query results, while preserving giving history. Archive viewing/unarchiving is documented for administrators.                                                       | “Archive” can have contact-wide discovery/permission consequences. D7 should preserve ordinary authorized source-history access, not put a still-valid constituent behind an admin archive. Vendor retention/deletion claims do not govern Core. |
| E7  | [Virtuous: How Do I Complete a Task?](https://support.virtuous.org/hc/en-us/articles/360060363551-How-Do-I-Complete-a-Task), CRM+, edited **2025-07-02**.                                                                                                                                                                                                                                                                                                                                       | Completion can prompt for an optional contact note; “Tasks are future actions and Notes are past actions.” Vendor permits restoring accidental completion via task board.                                                                           | Separates planned work from records of performed work. Its generic checkbox/drag reversal must not replace Core's source-controlled actions or pre-decide D7 reopening.                                                                          |
| E8  | [CiviCRM Activities](https://docs.civicrm.org/user/en/latest/organising-your-data/activities/), latest CiviCRM User Guide, undated.                                                                                                                                                                                                                                                                                                                                                             | Records interaction history and staff work. Default statuses separately include Scheduled, Completed, Cancelled and Not Required.                                                                                                                   | Clear primary evidence that work no longer needed is not inherently completed. Does not prescribe Core's exact status catalog, notifications or data model.                                                                                      |
| E9  | [CiviCase Everyday Tasks](https://docs.civicrm.org/user/en/latest/case-management/everyday-tasks/), latest CiviCRM User Guide, undated.                                                                                                                                                                                                                                                                                                                                                         | Cases can be found from search, dashboard or the contact. Activity history can be filtered by status/date/type. Changing case status records a Change Case Status activity, capturing the change as an event.                                       | Supports current-state plus findable history and attributable decisions. Case management differs from donor cultivation; configurable timelines, linked-case bulk updates and case forms are not recommended for D7.                             |
| E10 | [CiviCase Reports and analysis](https://docs.civicrm.org/user/en/latest/case-management/reports-and-analysis/), latest User Guide, undated.                                                                                                                                                                                                                                                                                                                                                     | Dashboard totals by type/status link to corresponding cases; activity reports can combine case and non-case assignments. Case history/audit and current views serve different purposes.                                                             | Supports count-to-list consistency and contextual history. No claim that Core needs the case report/export subsystem or anonymization implementation.                                                                                            |
| E11 | [WCAG 2.2 Understanding 3.3.4 Error Prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html), AA, updated **2025-09-16**; [GOV.UK Button](https://design-system.service.gov.uk/components/button/), undated current guidance.                                                                                                                                                                                                                        | Relevant data-changing submissions need at least one of reversibility, error checking or review/confirmation. GOV.UK reserves warning buttons for serious destructive actions and notes double-submit risk from slow connections/motor impairments. | Does not require a multistep wizard, an extra checkbox or red Delete styling for every closure. Do not promise Undo before source semantics are decided. A visible exact consequence and deliberate final command can provide review.            |
| E12 | WCAG 2.2 Understanding [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), updated **2026-05-11**; [1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), updated **2026-09-06**; [2.4.11 Focus Not Obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html), updated **2026-06-15**. AA. [GOV.UK Error summary](https://design-system.service.gov.uk/components/error-summary/), undated current page. | Expose meaningful result/error status without relying on focus theft; preserve narrow-layout access and visible focused controls. Error summaries link to correctable inputs with matching messages.                                                | These requirements need later rendered keyboard/screen-reader/touch checks. Reading source or passing axe does not prove the full closing/history flow.                                                                                          |

The additionally fetched Virtuous Gift Ask Statuses article (edited 2025-07-02)
contains inconsistent wording about the number of allowed Closed statuses. That
cardinality is neither relied on here nor needed for D7's outcome distinction.
No vendor evidence proves that undated holds are wrong or that closing a
continuing effort improves actual ministry outcomes.

## Graded findings, effect and exact proposed correction

Severity describes potential harm; likelihood is qualitative exposure in this
proposal, not measured incidence. Source-supported facts are R/E references;
proposed product rules and scenarios are explicitly inference.

| ID / category                                        | Severity / likelihood             | Evidence and answer effect                                                                                                                                                                                   | Exact proposed corrective language                                                                                                                                                                                                                                                                                                                            |
| ---------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| U1 — Semantics, dignity, comprehension               | High / plausible                  | E1–E6 distinguish account/ask/task/financial meanings; R1 defines limited scope. Inference: Lost/Archive/End partnership encourages wider interpretation. **Retain A with narrower label.**                  | “Close development work records an authorized staff decision about this effort only. It does not mark the supporter lost, uninterested or inactive, end a ministry relationship, certify an ask's success or change contact permission.”                                                                                                                      |
| U2 — Strongest alternative / forced false choice     | Medium / plausible                | R1 has two premises; E2 recognizes deferred closure but does not mandate it. Inference: unknown date may coexist with continuing intent. **Preserve the premise; do not generalize A to every wait.**        | “Absence of a useful date does not itself close work. Staff deliberately conclude that this current development effort has no further useful work. A dated pause remains available when appropriate; event-dependent undated holds remain a distinct policy question, not an automatic conversion.”                                                           |
| U3 — Workload, history, findability                  | High / plausible                  | R4/R8 and E6/E9/E10 expose hiding/history differences. **Material findability amendment.**                                                                                                                   | “Remove the closed effort from current development workload while retaining its authorized source history and a clear way to include closed work from the supporter/ministry context. Closing does not archive the constituent or require an administrator to retrieve ordinary permitted history.”                                                           |
| U4 — Truthful outcomes and reporting                 | High / likely if prototype reused | R2/R4/R5 are direct source evidence; E2/E5/E8 distinguish closure from completion/success. **Require shared meaning across lists, totals and history.**                                                      | “Only a source action that proves a specific requirement was satisfied counts as completed. Work superseded or no longer required is recorded as such. Closing development work is not a donation, successful ask, completed contact or donor loss. Current-work counts and their drill-downs use the same applicability rule.”                               |
| U5 — Outstanding obligations without a wizard        | High / plausible                  | R1 explicitly preserves promises; source-specific scope in R2. Inference: a generic close-all shortcut loses work, while demanding all finance end blocks harmless closure. **Material gate clarification.** | “Before closing, the source checks the obligations that matter to this effort. Block when required disposition is unresolved or cannot be established, with a safe route to resolve it. Do not auto-complete, delete or silently transfer remaining work. Independently valid commitments and other work retain their source, responsibility and visibility.” |
| U6 — Minimal deliberate action / concurrency         | High / plausible                  | R5 permits generic mutable actions; E11 supports error prevention without prescribing extra steps. **Keep contextual and current.**                                                                          | “Show the exact work and consequences in one contextual close action, with only relevant blockers. The source rechecks current authority and obligations at submission. Stale, failed or unresolved results do not show success or remove the work. Retry must return the original result rather than create another closure.”                                |
| U7 — Dates, backdating and audit                     | High / plausible                  | R5 browser `completed_at` and R9 date semantics; E9 records status-change events. **Do not turn close into a reporting-date editor.**                                                                        | “Record when and by whom the source accepted closure. Do not rewrite the prior review date, interaction dates or history to make work look timely. Any later supported historical effective date is a separate governed fact, shown distinctly from when it was recorded; this decision adds no backdating control.”                                          |
| U8 — Attention, continuing tasks and restoration     | High / plausible                  | R2/R3 separate source completion, attention and access. **Constrain side effects.**                                                                                                                          | “End only attention/work made inapplicable by the source decision; preserve other obligations. A superseded review is not fabricated as performed, while a review actually satisfied by an admitted source action may be completed truthfully. Read state, restored access or a later gift does not reopen closed work.”                                      |
| U9 — Accessible mobile closing and return to history | Medium / likely exposure          | R10/E11/E12 require semantics, feedback, reflow and focus. **Qualify later implementation.**                                                                                                                 | “Use labeled shared controls with touch-sized targets, visible focus and plain-text status. Keep the consequence, blocker and history link usable on a narrow screen. After closure removes a row, move focus predictably within the current context and expose the result without a disappearing toast as the only record.”                                  |
| U10 — Low bandwidth, counts and source freshness     | High / plausible                  | E11 double-submit guidance; R4 count divergence is static evidence. Network risks are inference, not executed failures. **Require truthful recovery.**                                                       | “When a response is lost, retain context and reconcile source truth before retry. Loading or incomplete obligation data never means none remain. Normal authorized refresh recovers the closed status and history without realtime; lists, counts and attention converge without inventing completion.”                                                       |
| U11 — History privacy and personnel interpretation   | High / plausible                  | R2 current grants/minimized projection and R3 authorization continue to apply. Inference: keeping history can be mistaken for perpetual broad access or staff performance scoring. **Scope preservation.**   | “Preserved history remains subject to current source permissions and lawful retention. Historical responsibility is not current assignment. A closure record proves the recorded decision, not donor rejection, actual contact or staff effectiveness; protected explanations are not copied into task or notification titles.”                               |

U5 must not become “close every gift commitment before closing cultivation”. An
ongoing commitment is financial truth with its own lifecycle. Conversely, a
promised call or meaningful stewardship obligation cannot disappear because
someone changes a cultivation label. The eventual source contract must identify
which obligations block this exact closure and which already have an independently
valid continuation. UI simplification cannot silently invent that continuation.
An indeterminate check is not a zero-obligation result, and an unauthorized user
must not be shown protected reasons or revealing hidden-work counts.

U4 is also a measurement safeguard. Record closure as an administrative source
event, not a donor interaction that resets last-contact metrics. Keep historical
outcomes distinct from today's current-work filter. Do not interpret all closed
work as failed relationships or all removed tasks as completed work. Any future
rate/report needs its stated cohort and outcome definition; no new KPI or metric
threshold is proposed here.

## Proposed compact interaction, not a UI specification

Use the existing source detail's action area. A candidate title is **Close
development work**; body **“Remove this effort from current development work.
Its history remains available.”** Keep the selected supporter and ministry
clear through existing context. A short scope explanation can clarify that
giving, contact preferences and other relationships keep their own rules.

If an eligible user has no blocking work, show the deliberate final Close
command. If work needs resolution, show the exact permitted blocker and a
contextual link; do not ask staff to click through empty categories or copy all
promises into a new close form. For incomplete verification, use a truthful
message such as **“We couldn't confirm the remaining work. Try again.”** Never
substitute **“No remaining work”**. A reason taxonomy or mandatory free-text
explanation is not selected here. Existing sensitive notes remain source-owned.

After success, show a neutral **Closed development work** status and an
accessible **View history** route. Do not use a success checkmark as proof of a
successful donor outcome, or a trash icon suggesting record deletion. The
history view should explain what changed and when; it must not preselect
same-record reopening or successor creation. A source action may be available
later only after that dependent decision and its permissions are defined.

## Acceptance evidence for the later implementation

These are falsifiable correctness/usability checks, not executed tests, measured
success rates, a final screen design or authorization to implement now.

1. **Meaning and strongest alternative.** With fictional cases, users distinguish
   a declined one-off ask, ordinary waiting for an agreed call, continuing intent
   awaiting an external change and genuinely finished development effort. They
   can explain which work will close and why giving/relationship/contact rights
   remain independent. If they choose Close merely because they cannot enter a
   date, the premise or labels need revision.
2. **Closure versus performance.** Close an effort without a gift, close an actual
   defined review with a closure outcome, and separately supersede a future
   review. Source history and task outcomes distinguish the facts. No unperformed
   contact becomes completed; donor-last-contact and gift totals do not change.
3. **Findability.** From the permitted supporter/ministry context and a closed-work
   filter, find the effort and prior history after leaving and returning. Current
   workload omits it. History access does not require a contact-archive admin
   role or expose another ministry/tenant's protected work. Empty states and
   active filters make the search scope clear.
4. **Obligations.** A promised follow-up blocks or receives only its explicitly
   allowed source disposition. A separate continuing gift commitment is not
   automatically stopped. An incomplete check cannot pass as none remaining.
   Hidden obligations produce an authorized safe resolution route without leaking
   sensitive descriptions/counts. A new obligation arriving between preview and
   submit invalidates the stale close when required by the source rule.
5. **Count-to-list and historical truth.** Current/overdue counts drill down to
   exactly the permitted currently applicable rows, including completed,
   cancelled, no-longer-required and closed cases in the fixture set. A closed
   past-due item is not still Critical. Historical reports retain their declared
   period/outcome meaning rather than rewriting all prior views as closed today.
6. **Time integrity.** Client clock skew and different browser zones do not change
   the source's accepted close timestamp. D6's old review date/zone and history
   remain intact. There is no implicit backdate/future-close field. If a later
   governed historical correction exists, recorded-at and effective-date are
   visibly distinct and corrections preserve prior evidence.
7. **Races and lost response.** Double submit, response loss after commit,
   disconnect, stale browser, old notification link and concurrent lead/authority
   changes produce one truthful source outcome or a clear unresolved/conflict
   state. No duplicate close event, falsely completed promise, automatic reopening
   or success toast before authority is established.
8. **Task/attention lifecycle.** Required related work that survives remains
   findable with valid responsibility. Superseded attention ends under its source
   rule without fabricated read or delivery. Changing notification preferences,
   restoring permissions or a subsequent donation does not revive closed work.
9. **Accessible field use.** Exercise keyboard-only action and history access,
   screen reader labels/result announcements, touch, 320 CSS px/reflow, zoom,
   long translated/RTL labels and reduced motion. When the closed row disappears,
   focus remains meaningful. Verify loading/error/blocker states and that no
   important consequence requires hover, color or a toast.
10. **No unnecessary product.** Test the compact contextual action and existing
    history/Tasks destinations before adding a closure wizard or archive screen.
    If participants cannot retrieve closed work or distinguish an event-dependent
    hold, revise that specific behavior. More mandatory fields and notifications
    are not proof that the underlying decision is clearer.

## Scope and verification limits

Only this evidence note was written. Public documents and named Core sources
were inspected; local reference paths and whitespace were checked. No vendor
workflow, staff pilot, browser/assistive-technology behavior, server command,
reporting pipeline or cross-device closure was executed. Static prototype
counterexamples are explicitly bounded. No source supports a universal closure
policy, donor-value judgment, notification cadence or claimed outcome gain.
