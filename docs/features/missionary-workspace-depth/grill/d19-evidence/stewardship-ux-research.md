# D19 first-support follow-up — primary UX evidence

Research date: **2026-10-16 UTC**. The founder selected first qualifying support
for the **ministry/project**, including an existing organizational donor's first
support for that ministry. The recommendations below develop the whole journey;
they do not ratify the review, qualify a financial source or demonstrate a shipped
task producer. Earlier pending wording in the [Q19 frontier](../phase28-q19-first-support-follow-up-research.md)
is pre-answer provenance.

This was public-document research and repository reading only. No authenticated
vendor UI, real donor data, live product mutation, message, provider call, new
dependency or application change was used. Documented procedures are not observed
usability, accessibility conformance, reliable delivery or improved fundraising.
All external sources were checked on the research date; historical dates, relative
dates and unavailable pages are identified rather than silently called current.

## Recommended small journey

Use the ordinary daily queue and existing task/contact surfaces. One item explains
**who the follow-up concerns, which ministry it concerns, why it appeared and who
is responsible**. Opening it offers currently permitted contact actions, a reminder
or **Mark done**. This finishes the independent human follow-up deliverable; it
does not assert a call, send, delivery or supporter response. **Log interaction**
is optional. When deliberately chosen, that path can record the actual outcome
and finish the task without duplicate typing. No mandatory outcome modal,
narrative or coaching report belongs in the ordinary completion path.

Proposed row for an eligible named supporter:

> **Follow up with Grace**
>
> First qualifying gift to [Ministry] · [qualified gift date]
>
> [Current responsible person, where useful] · [actual due/review date, if set]

The title is illustrative, not permission to expose a name. **First qualifying gift
to [Ministry]** is the useful reason; **New donor** incorrectly implies organization-
wide novelty. Display an amount only where authorized and useful, with the exact
allocation and currency; a list row does not need a financial headline. Expose
source/currentness and the eligible gift detail progressively. Do not mix gift
date, record-entry date, detection date, task due date and interaction occurrence.

No separate stewardship application, automation builder, achievement score,
fundraising rank or compulsory daily target is needed. Native task creation is
already required; enabling an optional P35 workflow pack is not a prerequisite.

## Repository constraints that control the recommendation

- The [founder brief, daily work and stewardship](../phase28-founder-brief.md)
  requires reason/source/currentness/responsibility/action, phone-friendly
  completion and recovery, qualified first/special/fulfillment/recurring work,
  permanent source-purpose coordination, anonymity and correction of stale
  unstarted tasks. Task status and actual interaction remain different facts.
- The [Q19 owner analysis](../phase28-q19-first-support-follow-up-research.md)
  identifies P13 contribution, P14 recognition, P16 commitment/occurrence, P9 task,
  P28 personal-follow-up and P6/P17 communication owners. A stable ministry/project
  need not equal a designation, worker, account or public page. New assignments,
  code changes and imports cannot restart the relationship's first-support history.
- [ADR-0183, Independent follow-up task](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)
  permits an authorized assignee to finish the human deliverable while its linked
  source remains open. D19 fits this existing contract; it needs no new source-review
  ledger. **Mark done** must not pretend to resolve the financial source or record
  an actual interaction. Completion semantics are code-owned, not a tenant toggle.
- [P9](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md)
  and [P27 shared context](../../../../prds/sitestacker-parity/phase-27-donor-development/context.md)
  preserve current audience and eligible new interaction boundaries. A task does
  not authorize broad CRM browsing, private-note reuse, past-history access or
  coaching. A missing log is not evidence that no relationship work occurred.
- [P14 church-remittance ownership](../../../../prds/sitestacker-parity/phase-14-donor-credit-operations.md)
  explicitly excludes church-member thank-you letters; attribution visibility is
  not acknowledgment authority. Anonymous/mediated thanks and recipient resolution
  cannot be invented by this UI. Legal donor, recognized supporter and permitted
  message recipient may differ.
- [D15 connected email C11](../phase28-d15-connected-email-adversarial-review.md)
  separates local/provider acceptance from delivery, reading and exchange. Sending
  does not automatically complete a task. A deliberate task outcome can reference
  an existing qualified outreach fact instead of creating a duplicate one.
- [Shared UI instructions](../../../../../packages/ui/AGENTS.md) and the checked
  [configuration](../../../../../packages/ui/components.json) retain exact
  base-maia, Base UI, Zinc semantic tokens and shared ownership. The
  [accessibility review skill](../../../../ai/skills/accessibility-review/SKILL.md),
  frontend/testing rules and shared touch guidance informed future checks; no
  UI implementation or conformance run is claimed.

## Primary evidence ledger

**D** = documented product procedure; **H** = historical/indexed evidence;
**G** = guidance. The column dates are the page's visible dates, not crawler dates.
These are comparators, not adoption of external access rules or automation policy.

| ID  | Primary URL and date                                                                                                                                                                  | Relevant documented fact                                                                                                                                                                            | Useful lesson / limitation                                                                                                                                                                                                                                                                                                                      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E01 | D: [TntConnect TNT Tab tutorial](https://www.tntware.com/tntconnect/help/en/pages/contacts_mpdtabtutorial.aspx), undated                                                              | Its example describes a first gift as joining the user's support team; adding it creates a thank-you task.                                                                                          | Supports a relationship-specific reason. It does not establish Core's ministry mapping, complete history, allocation basis or current permission contract. The tutorial's newsletter enrollment and manual gift behavior are not adopted.                                                                                                       |
| E02 | D, older manual: [TntConnect Log History](https://www.tntware.com/tntconnect/help/en/pages/taskhistory_loghistory.aspx), undated; page includes older comments                        | Records method, Attempted/Done/Received, occurrence date and purpose; a call can serve a thank-you purpose.                                                                                         | Separate method from purpose and attempt from completion. Do not import mandatory logging advice, copied email bodies, broad prayer/care notes or coaching disclosure. Old comments are not proof of current release behavior.                                                                                                                  |
| E03 | D: [TntConnect automatic task updates](https://www.tntware.com/tntconnect/help/en/pages/video_autoactionsupdatetasks.aspx), undated                                                   | Page describes updating existing automatic tasks rather than duplicating them; its series distinguishes first, extra, special and resumed gifts.                                                    | Supports continuity and specific reasons, not verified idempotency. Embedded video was not exercised. A heading includes first gift of a new pledge amount; do not confuse that with first-ever support for a ministry.                                                                                                                         |
| E04 | D: [MPDX Notifications](https://help.mpdx.org/article/1199-notifications), updated **2022-09-26**                                                                                     | Selected events can create contact tasks; events distinguish started giving, special/larger gifts, resumed giving and lack of a logged thank-you.                                                   | Clear reasons are useful. The exact historical scope of started giving is undocumented here; MPDX's configurable task switch, time thresholds and activity metrics do not override required Core tasks or voluntary reporting.                                                                                                                  |
| E05 | D: [MPDX Mobile Tasks](https://help.mpdx.org/article/500-tackle-mpdx-mobile-tasks), updated **2021-11-29**                                                                            | Current/history views, task detail, dates, filtering, completion details and optional next-work entry are documented.                                                                               | Supports a reachable phone task flow. Do not copy numerous tags/prompts, permanent deletion or assume its use of “archive” equals Core's source lifecycle. No current app, offline or assistive-technology test was performed.                                                                                                                  |
| E06 | D: [MPDX mobile logging](https://help.mpdx.org/article/517-automatically-logging-tasks-when-contacting-partners), updated **2021-12-08**                                              | After returning from a phone action, user chooses Attempted, Left Message, Completed or Appointment Scheduled; OK records, Cancel does not, Add Info offers further detail.                         | A device handoff is not a proven encounter. A short explicit outcome is stronger than auto-completion on return. Documentation does not prove the app observes whether an external email was actually sent.                                                                                                                                     |
| E07 | H: [DonorElf News Feed Events](https://donorelf.helpscoutdocs.com/article/34-news-feed-events), retained earlier update **2016-11-24**                                                | Fresh search-index text associates a first gift with a thank-you recommendation. **Fresh direct open again returned 404.**                                                                          | Event → reason → action is useful historical evidence only. No current runtime, first-scope algorithm or accessibility claim. Do not import its lateness assumptions, pledge-lowering advice or unsupported recovery percentages.                                                                                                               |
| E08 | D: [Virtuous Complete a Task](https://support.virtuous.org/hc/en-us/articles/360060363551-How-Do-I-Complete-a-Task), updated **2025-07-02**                                           | Completion is available from several task surfaces. Depending on type, a contact-note prompt appears and can be deselected; accidental completion can be moved back on the task board.              | Useful separation of future task and optional past-action note, and a recovery precedent. A drag-only recovery path is insufficient for Core; it does not specify all history/concurrency consequences.                                                                                                                                         |
| E09 | D: [Virtuous email receipt templates](https://support.virtuous.org/hc/en-us/articles/360050894512-How-do-I-Create-an-Email-Receipt-Template), updated **2025-07-02**                  | The receipt email can contain warm thank-you wording with a PDF tax receipt attached.                                                                                                               | Never claim organizational receipts contain no thanks. Receipt generation still does not prove this distinct personal follow-up occurred. No new tax-receipt capability or financial rule is inferred.                                                                                                                                          |
| E10 | D: [Bloomerang individual/bulk tasks](https://help.bloomerang.com/en/articles/12632531-create-and-manage-individual-and-bulk-tasks), displayed **2026-09-03**                         | Purpose/channel/assignee are distinct; finish options include Complete, Save as Interaction and Archive. Its reactivation instructions remove a completed date or delete the converted interaction. | Supports explicit task versus interaction semantics. **Do not copy destructive history recovery**, email-reply completion or unrestricted reassignment; recovery must preserve Core provenance and actual encounters.                                                                                                                           |
| E11 | D: [Bloomerang View Tasks](https://help.bloomerang.com/en/articles/12632464-view-tasks), displayed **2026-03-06**                                                                     | Tasks appear in the dashboard, active list and constituent timeline; list ordering is by due date with status/channel filters. Timeline exposes purpose, channel, description and date.             | One record can have several useful views. No copied “All” authority, red-only overdue cue, export permission or mandatory menu inventory follows.                                                                                                                                                                                               |
| E12 | D: [Bloomerang mobile tasks](https://help.bloomerang.com/en/articles/17568900-bloomerang-crm-mobile-app-add-and-manage-tasks), current redirected page says **“Updated this week”**   | Groups tasks by timing, offers contact handoff, asks whether to create an interaction and separates Complete from Complete and Make Follow-Up. Optional daily push uses the account time zone.      | Useful compact phone flow and visible temporal basis; not proof that handoff succeeded or a reason to add push dependencies. Initial [older URL](https://help.bloomerang.com/en/articles/12632829-bloomerang-crm-mobile-app-add-and-manage-tasks) returned a 2026-09-03 version before redirecting. No precise current update date is inferred. |
| E13 | D: [Blackbaud Raiser's Edge NXT, Manage a Single Action](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/en-gb/content/bb-actions-manage-single.html), undated | Completion records result/date; open lists can include completed work through filtering. Restricted names can be replaced by a restricted label.                                                    | Supports current permissions and recoverable history. **Do not copy Good/Bad donor-outcome grading or marking incomplete work complete merely to remove it from a queue.** A restricted placeholder is not permission to reveal a record's existence.                                                                                           |

The main conclusion is a design recommendation, not a popularity vote: compose
task, contact action and actual outcome in one small journey, while retaining their
different authority and truth. None of these pages validates Core's first-support
algorithm, incomplete-history behavior, anonymous projection, financial correction
semantics or duplicate-effect safety.

## Minimal end-to-end interaction

| Moment                          | Recommended experience                                                                                                                                                                                                                                                   | Truth that must survive                                                                                                                                                                                               |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Start the day                   | Use the existing queue; show first-support work alongside other relevant work. Make ministry and reason readable. Preserve current filters/position on return.                                                                                                           | A source-created task is not a donor ranking, proof of urgency or a mandate to contact today. No amount-based promotion or default public score.                                                                      |
| Open the item                   | Show first-support reason, current responsibility, permitted contact context and a concise source link. Keep dates/amounts behind appropriate disclosure.                                                                                                                | Show only this ministry's authorized allocation/history. Do not reveal that the supporter gives elsewhere merely to explain A. A household label is not permission to select any member as recipient.                 |
| Choose an action                | Offer qualified **Write email**, **Call**, or existing manual action where available, plus **Remind me**, **Mark done** and optional **Log interaction**.                                                                                                                | The product need not invent SMS, mailbox access or a new sender. Check actual contactability and authority again at consequential use. Opening an app is not a send.                                                  |
| Work later                      | Choose a day or a supported date/time through the existing task/reminder owner. Confirm the resulting date and, for timed reminders, time zone.                                                                                                                          | Rescheduling changes attention, not the gift date, task purpose or completed-history claim. It must not mint another first-support task. No universal 24/48-hour rule is justified by this research.                  |
| Optionally record what happened | If Maya chooses **Log interaction**, a short sheet asks the relevant outcome, method and occurrence date/time, prefilled only from trustworthy context. Notes remain optional. Show the actual audience for eligible shared context.                                     | A failed call, message submitted, conversation and card posted are distinguishable. Logging is not a prerequisite for **Mark done**. No narrative, rating, next action, donation ask or coach disclosure is required. |
| Finish once                     | **Mark done** deliberately finishes the independent follow-up deliverable without inventing an interaction. An optional combined log-and-finish command can avoid duplicate entry. If qualified outreach already exists, reference it instead of recording another send. | Explicit action remains necessary; receipt dispatch or D15 provider acceptance cannot silently complete this duty. Completion does not clear the financial source or assert delivery/read/response.                   |
| Return to the queue             | Show a concise confirmation and preserve sensible focus. Completed/disposed work remains reachable through permitted history.                                                                                                                                            | A temporary toast is not the only recovery route. Correcting mistaken task disposition cannot unsend a message, delete an encounter or erase the gift correction trail.                                               |

For ordinary completion, **Mark done** can be one deliberate action with no form.
Show **Follow-up marked done**, not **Thank-you sent**. Do not force the missionary
through an outcome interview or task creation fields already known from the source.
Only the optional interaction path asks what actually happened. Where an eligible
existing outreach fact is selected, reference it rather than requiring another
manual log. No generic confirmation modal is needed after a reversible,
fully explained internal disposition; an external send retains its owning review.

## Outcome, identity and exception precision

These are proposed labels conditioned on verified state, not a new status model.
Map them onto the existing owners instead of storing a second set of truths.

| Situation                                               | Clear proposed wording / behavior                                                                                                                                       | Misleading shortcut to reject                                                                                                                                       |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First support is established                            | **First support for [Ministry]**; show its permitted source explanation.                                                                                                | “New donor,” “first gift ever,” or first in a capped/filtered list.                                                                                                 |
| History is incomplete                                   | **First-support status isn't confirmed.** Do not present a first-support reason as established; keep ordinary permitted manual work available.                          | Turning missing history into a new-donor label or silently asking the missionary to certify finance completeness. No compulsory new investigation queue is assumed. |
| Call app opened; no outcome recorded                    | Return to the same task; optional **Log interaction** has no preselected success. **Mark done** retains its independent task meaning.                                   | Treating return-to-app, call duration, copied phone number or task completion as a completed thank-you.                                                             |
| An attempt did not reach the person                     | **Tried to reach them**; show method and actual date if recorded. Offer a voluntary reminder.                                                                           | “Thanked,” “conversation completed,” automatically generated repeat calls or an imposed next-action report.                                                         |
| Existing connected-email fact                           | **Submitted to [provider]**, when that is what D15 proves; deliberate task disposition can reference it.                                                                | “Delivered,” “read,” “replied,” automatic task completion or duplicate manual send history.                                                                         |
| Send outcome unknown                                    | **Sending status isn't confirmed.** Retain the original D15 recovery path.                                                                                              | Offering Send again, another account, another channel or automatic task completion as uncertainty repair.                                                           |
| Task outcome save unknown                               | **Checking whether your update was saved…** Resolve the same command.                                                                                                   | “Nothing changed,” another history entry or a fresh send to compensate for a missing acknowledgment.                                                                |
| No currently permitted contact route                    | **No permitted contact method is available.** Show a qualified existing repair path only when the actor has permission.                                                 | Fake actionable Email, exposing a hidden address, compulsory contact-data collection or a new mediated-send promise.                                                |
| Anonymous/source-restricted support                     | If the source allows awareness, show its authorized anonymous summary; omit identity and contact controls. Otherwise omit the item entirely.                            | A named personal-contact duty, hidden identity in URLs/notifications, or a “request access” shortcut that invents disclosure rights.                                |
| A source correction invalidates unstarted work          | **This follow-up no longer applies.** End the ineligible task through the owning contract, preserving its terminal predecessor and lineage; details only as authorized. | Generic “Completed,” deleting performed history or claiming every refund means the donor withdrew support.                                                          |
| Another authorized worker already handled the same duty | Show the current permitted disposition and existing outcome; no second same-purpose card.                                                                               | Duplicating tasks per staff viewer or inferring that an organizational receipt necessarily fulfilled personal ministry follow-up.                                   |
| Accidental task completion                              | Offer the ordinary permitted correction/reopen path with current eligibility checks and a preserved record of what changed.                                             | Deleting an interaction to reactivate a task or pretending a correction recalls an external message.                                                                |

An uncontactable state is not an invitation to build a second admin workflow. The
source must decide whether an item is blocked, informational or no longer eligible.
The UX must explain that state without fabricating a successful thank-you or
leaving an impossible active duty indefinitely. No new anonymous mediation,
church-member letter or route around a donor restriction is selected by D19.

When a gift funds two genuinely distinct ministries, distinct source-purpose
follow-ups may be justified. Do not collapse them merely because the contact or
payment is shared. Conversely, several staff members or designation aliases for
one stable ministry do not create several obligations. If one deliberate
communication can satisfy multiple duties, that requires an explicit qualified
relationship between the communication and each duty; no generic bulk-complete
or automatic cross-project send is added here. A simple shared view of current
responsibility and permitted prior outcome is the first UX requirement.

Returns/corrections require the financial owner's new facts, not UI speculation.
A corrected allocation, chargeback or newly discovered earlier gift can invalidate
the displayed reason. Preserve what the missionary actually did and when. Do not
send a retraction or another thank-you merely because the source changed; do not
silently reinterpret a first-ever task as another kind of stewardship obligation.

## Phone, accessibility, time and low bandwidth

Use a readable list and task detail/sheet within base-maia; this does not require
a Kanban board or a special mobile app. Keep the reason next to the action, allow
long names/ministry names to wrap and leave useful touch targets. Retain keyboard
operation, focus return after a row disappears, and screen-reader access to state.
Status cannot rely only on red/green. Swiping or dragging may be enhancements but
cannot be the sole route to reschedule, complete or correct a task.

| ID  | Primary guidance, checked 2026-10-16                                                                                                                                     | Exact implication / limit                                                                                                                                                                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A01 | [WCAG 2.2 SC 4.1.3, status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)                                                                   | Qualifying saving/saved/error messages need programmatic exposure without taking focus. This does not require announcing every background queue update or repeatedly interrupting the user.                                                                     |
| A02 | [SC 2.4.11, focus not obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html)                                                             | Author content must not entirely obscure the focused component. Full visibility is preferable but stronger than this AA minimum. Test sticky action bars and virtual keyboards.                                                                                 |
| A03 | [SC 2.5.8, target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)                                                                            | AA uses 24 CSS pixels with specified exceptions/spacing alternatives. Core's larger shared touch target guidance is a separate design requirement, not a universal WCAG AA 44-pixel rule.                                                                       |
| A04 | [SC 1.4.10, reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) and [SC 1.4.1, use of color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) | Queue/detail should reflow without two-dimensional reading for ordinary content; state must have a non-color cue. A complex-table exception is not a reason to force this small task flow into horizontal scrolling.                                            |
| A05 | [SC 2.5.7, dragging movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)                                                                      | Author-created drag operations need a non-drag single-pointer alternative unless an exception applies. Keyboard access is also required under its own criteria; a keyboard-only alternative does not by itself satisfy this pointer requirement.                |
| A06 | [APG date-picker dialog example](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/), updated **2025-08-12**                              | Documents input description, calendar keyboard navigation, selection announcement and focus return. Explicitly says example code is not production-ready and mobile/AT support must be tested. Use existing qualified shared controls, not copied bespoke ARIA. |
| A07 | [W3C international date formats](https://www.w3.org/International/questions/qa-date-format), undated older article                                                       | All-numeric dates can be ambiguous across locales; meaningful month/year or clear format context helps. Its old implementation examples are not stack advice, and locale is not proof of time zone.                                                             |

Use the user's explicit scheduling time-zone context for a timed reminder and
show it where the choice matters. A “Tomorrow” shortcut must resolve to a visible
calendar date in that context, not a hidden UTC boundary. Do not infer a donor's
local time from country, phone prefix or preferred language. Preserve the
distinction between a date-only task and an actual timestamp; do not invent
midnight appointments or force an exact interaction time the user does not know.
Travel, DST gaps/overlaps and different calendars/locales require qualification
of the existing task/date owner, not a second scheduler. Bloomerang's documented
8 AM notification is a comparator detail, **not a selected Core cadence**.

On slow connections, show the known loading/currentness state; an empty queue is
not proof that no work exists before the read completes. Keep authorized local
form input during a recoverable interruption, without promising persistence
across logout, tenant changes or browser restarts. Resolve an uncertain save by
its original receipt before enabling a duplicate outcome. Cached data never
authorizes a new contact action; current source/contactability gates still apply.
No offline send queue or notification delivery guarantee is introduced.

## Material concerns — eight dimensions and exact proposed clauses

Each concern supplies failure, importance, severity, likelihood, evidence, effect
on the selected answer, permanent prevention and exact clause. Likelihood is an
implementation-risk judgment, not an observed incident rate. Proofs below are
future checks, not tests conducted during this research.

### UX01 — A truthful reason becomes “new donor” or restarts on reassignment

**Failure:** A first visible row, new designation or new worker is treated as
first-ever ministry support. **Importance:** The task misstates the relationship
and can cause repetitive or embarrassing contact. **Severity:** High.
**Likelihood:** Plausible with legacy first-gift fields or partial lists.
**Evidence:** E01/E04/E07 do not define integrated history; Q19 and the brief
require qualified history and stable scope. **Effect on A:** Preserve A; make its
basis explicit. **Permanent fix:** source-qualified stable ministry/subject/purpose
projection with a truthful reason and unknown state.
**Exact clause SUX01:** **A first-support label and task require the qualified
ministry/project history basis; unknown history, assignment changes and display
limits cannot establish or restart first support.**
**Proof:** existing organization donor/new ministry, partial migration, earlier
gift arriving late, reassignment and designation-alias fixtures.

### UX02 — Shared staff and multiple projects produce duplicate or missing duties

**Failure:** Every viewer receives a separate card, duplicate events recreate work,
or deduplication by person suppresses a distinct ministry purpose.
**Importance:** Repeated thanks and missed ownership undermine useful coordination.
**Severity:** High. **Likelihood:** Plausible in shared CRM and event processing.
**Evidence:** E03 supports updating tasks; E11 shows common records across views;
the brief requires permanent source-purpose coordination. **Effect on A:** A needs
one intended effect per qualified purpose, not one per user or payment.
**Permanent fix:** stable obligation identity, current responsibility and permitted
disposition visibility across views.
**Exact clause SUX02:** **Represent the same qualified duty once across staff and
workflow views; retain genuinely distinct ministry purposes and never infer that
another purpose's receipt or task fulfilled this one.**
**Proof:** concurrent staff reads/completions, replayed events, two ministries on
one payment, one ministry with multiple mappings, and optional workflows disabled.

### UX03 — An intention, app handoff or accepted send becomes a personal exchange

**Failure:** Checking a box or opening a dialer manufactures a completed thank-you;
provider acceptance becomes delivered/read/replied; history is entered twice.
**Importance:** Future relationship work and shared context rely on false events.
**Severity:** High. **Likelihood:** Plausible when one-click task completion is
incorrectly treated as proof of an interaction.
**Evidence:** E02/E06/E08/E10 distinguish task and outcome; D15 C11 excludes
automatic task completion and unsupported delivery claims. **Effect on A:** Keep
the short completion flow while recording exact meaning.
**Permanent fix:** independent task completion plus optional deliberate interaction
with method/time/provenance and reference to existing qualified outreach.
**Exact clause SUX03:** **Task disposition never invents outreach, delivery or an
exchange; Mark done needs no mandatory outcome form. Optional interaction logging
can link actual work once, distinguishing an attempt, provider submission and
completed conversation.**
**Proof:** Mark done without logging, cancel dialer, unanswered call, message draft
abandoned, accepted/unknown send, already-recorded outreach and duplicate completion.

### UX04 — A task reveals or invents contact rights

**Failure:** Anonymous or uncontactable support exposes identity, another ministry's
history, a household member's address or a forbidden outreach button.
**Importance:** A useful reminder becomes unauthorized disclosure/contact.
**Severity:** Critical for prohibited identity disclosure. **Likelihood:** Plausible
if source event access is confused with recipient permission.
**Evidence:** P14/P9 constraints and Q19; E13 shows a vendor restricted-name pattern
without proving Core permission. **Effect on A:** Preserve A within current source
and recipient gates; no new mediation or church-member stream.
**Permanent fix:** minimal authorized projection and actionable/blocked/informational
states evaluated across every surface and consequential action.
**Exact clause SUX04:** **A first-support task grants no identity, contact method,
history or sending right; anonymous awareness and unavailable contact paths stay
within existing owners, including titles, notifications, links and recovery.**
**Proof:** anonymous, shared mailbox/household, church attribution, DAF recognition,
revocation while open, exports/snippets and cached-task tests.

### UX05 — Corrections erase real history or create false completion

**Failure:** A reversed/reallocated gift deletes a performed thank-you; removing a
stale task labels it completed; reopen erases an interaction or causes new contact.
**Importance:** Source changes and human work are independent historical facts.
**Severity:** High. **Likelihood:** Plausible with destructive task/history coupling.
**Evidence:** The brief explicitly preserves completed history; E10/E13 contain
recovery/removal patterns that would be unsafe to copy literally.
**Effect on A:** A requires source-aware disposition and durable history, not a
refund-driven messaging program. **Permanent fix:** distinguish no-longer-applicable,
performed and corrected-task facts under current source authority.
**Exact clause SUX05:** **Source changes correct or end ineligible unstarted work
with terminal predecessor/lineage preserved and without erasing actual outcomes;
task recovery never deletes an interaction,
recalls a message or automatically starts replacement outreach.**
**Proof:** refund before/after action, partial reallocation, earlier historical gift,
accidental completion, and current ineligibility when reopening.

### UX06 — Stewardship becomes a compulsory report or donor-worth ranking

**Failure:** Completion demands a narrative, next action, coach sharing, Good/Bad
rating or targets; money-based ranking and nagging dominate the queue.
**Importance:** The workflow becomes pressure and administrative burden rather
than useful relationship support. **Severity:** Moderate; High for unauthorized
sharing. **Likelihood:** Plausible if full competitor reporting patterns are copied.
**Evidence:** E02/E04/E13 include broader activity/assessment patterns; founder
brief preserves voluntary context and excludes inferred inactivity.
**Effect on A:** Required native tasks do not require compulsory relationship logs.
**Permanent fix:** independent task completion, optional factual interaction and
eligible notes, visible audience, voluntary next action and ordinary date-based
organization.
**Exact clause SUX06:** **Finishing or deferring this work requires no narrative,
rating, coaching enrollment or future-contact commitment; missing logs never
become a judgment about missionary effort or supporter value.**
**Proof:** complete/defer without notes or next action, no coach rights, overdue
queue with no guilt copy, and absent-history presentation.

### UX07 — Phone, assistive technology or international time makes work ambiguous

**Failure:** Tiny controls, drag-only recovery, color-only overdue state, hidden
focus or an ambiguous date causes a wrong or inaccessible action.
**Importance:** Users cannot understand or safely finish their ordinary daily work.
**Severity:** High for exclusion or wrong outcome. **Likelihood:** Likely without
explicit device/AT/date tests. **Evidence:** A01–A07 and E05/E12.
**Effect on A:** Keep the small journey; qualify the actual shared interactions.
**Permanent fix:** shared accessible controls, readable labels/order, explicit
calendar/time-zone context and non-drag recovery.
**Exact clause SUX07:** **Queue, contact handoff, reminder, outcome and correction
remain usable with keyboard, touch and supported assistive technology; dates and
timed reminders expose their actual temporal meaning without locale guesses.**
**Proof:** screen reader/keyboard/narrow viewport/zoom, long RTL names, different
locale conventions, travel, DST and date-only versus timed task cases.

### UX08 — Interrupted reads or saves produce false emptiness and duplicate work

**Failure:** Loading looks like no tasks; a timed-out completion is repeated;
an unknown email is resent or stale cached authority permits action.
**Importance:** Work is missed, duplicated or disclosed through misleading recovery.
**Severity:** High. **Likelihood:** Plausible on phone networks and concurrent use.
**Evidence:** Brief recovery/currentness requirements and D15's unknown-send
contract; vendor help does not establish end-to-end failure semantics.
**Effect on A:** A needs truthful local states, not full offline sync.
**Permanent fix:** distinct loading/empty/failed/unknown states, durable source
receipt recovery and current-action gates, preserving recoverable form input.
**Exact clause SUX08:** **An interrupted operation is reconciled under its original
identity before duplication; unknown saves/sends and incomplete reads are never
presented as definite failure, successful contact or an empty workload.**
**Proof:** lost completion response, double tap, revoke during submit, delayed
queue read, interrupted handoff, tenant switch and old-link recovery.

## Proposed user tasks and evidence still needed

Future task-based evaluations should establish whether a missionary can:

1. Explain why an existing organizational donor appears as first support for this
   ministry without believing they are a new donor everywhere; mark the human
   follow-up done without a compulsory log or a manufactured sent-message fact.
2. Open the relevant authorized context, make a call, record an unsuccessful
   attempt and voluntarily choose a later reminder without a written report.
3. Record an actual thank-you once, distinguish submitted email from delivery,
   and find the result later without a duplicate manual log.
4. See another worker's permitted completion and avoid a repeat while retaining
   truly separate work for a second ministry.
5. Understand an anonymous, unavailable-contact or unknown-history state without
   expecting newly granted access or being stuck with an impossible button.
6. Recover accidental task disposition or interrupted save without erasing history,
   repeating an external send or losing the relevant queue position.
7. Use the full flow on a phone and with a keyboard/screen reader, including a
   reminder across a time-zone/DST boundary and an outcome with a known date only.

These are proposed evaluations, not performed interviews or measured outcomes.
Use synthetic or explicitly authorized data, record confusion as well as success,
and test current denied paths. Source qualification, actor/recipient projection,
financial corrections, durable duplicate prevention, P9/P17 ownership, actual
browser/provider recovery and accessibility remain implementation evidence gates.
Do not convert documentation freshness or a local synthetic probe into proof of
the complete production journey.

The strongest simpler policy alternative was organization-first plus manually
noticed ministry beginnings. It would reduce this particular generated reason but
leave missionaries to notice a newly supported ministry themselves. **The founder
chose A**; this comparison does not reopen native tasks or suppress independently
qualified stewardship. Within A, the simplest useful implementation is one
source-qualified purpose in the existing task engine and queue, with truthful
outcomes and current permissions. No new automation framework, communications
provider, activity-scoring system or compulsory reporting program is necessary.
