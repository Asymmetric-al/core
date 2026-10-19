# D6 evidence — paused partnership review, work destinations and accessible dates

Research checked **2026-10-10 (UTC)**. This is a bounded adversarial UX/practice
review of the founder's selected default: choose an internal review date when
staff deliberately pause further partnership development. It is not a formal
specification, implementation, approval of an activation package, or evidence
that a reminder has been delivered. D1–D4 and D5's selected lead context apply.
Material additions below remain proposals for the parent review to ratify.

## Finding and strongest alternative

Keep the selected default, but make it a small contextual action: **Pause
partnership work → choose Review date → save**. Show the existing responsible
lead and a short explanation: **“Review whether to keep this work on hold,
resume it or end it. This does not schedule contact.”** Inherit context; do not
ask again for donor, ministry, purpose, task title, assignee and delivery channel
when those facts are already known and valid. Do not require a wizard, reasons
catalog, recurring schedule, notification preferences tour or second inbox.

The strongest no-build alternative is a dated internal task in the existing work
process plus an explicit note that development is on hold. For a pilot this can
be evaluated with representative fictional cases and existing task conventions;
it requires no new reminder product. It is enough if users can reliably find the
next review, identify responsibility and distinguish internal review from donor
contact. If that works, do not add another review-management screen. It does not
prove that Core's current prototype task store or a manually copied task is a
safe production implementation of source-owned paused work. Existing accepted
contracts require one authoritative occurrence and source-controlled completion.

D6 adds value only where a deliberate pause would otherwise leave the next
internal decision unclear. A donor saying “call me next month”, one deferred ask,
or an already-agreed stewardship obligation should normally retain its ordinary
dated work. Creating both a follow-up task and a pause review for the same
purpose adds noise. A request never to contact again must not be disguised as
“try again on the review date”. No vendor evidence below establishes a universal
pause-review interval or a requirement to keep renewing every pause forever.

## Local evidence and destination constraints

All paths below were inspected on 2026-10-10. They are source inspection, not
browser execution, production verification or a claim of accessibility conformance.

- **Accepted Tasks Hub boundary:**
  [ADR-0183](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:24),
  accepted 2026-08-29, admits concrete source-owned human work through an explicit
  projection contract. Lines 40–55 separate source truth, task projection and
  notification engagement; lines 57–76 require current permission and reject
  generic Complete/Reopen/Dismiss for source-backed work. This supports one
  review obligation visible in Tasks and the partnership, rather than two tasks
  whose statuses can disagree. It does not already register P27 pause work.
- **Accepted notification owner:**
  [ADR-0027](../../../../adr/0027-one-notification-presentation-and-engagement-model.md:18)
  separates attention from source/task truth. Lines 34–45 give staff notification
  presentation and contextual missionary surfaces; actionable items remain in
  Needs attention after being read. Lines 502–510 require shared Base Maia/Base
  UI, mobile/low-bandwidth completeness and quiet arrival without focus theft,
  automatic opening, sound or toast-only history. These are adopted boundaries;
  Website-specific reminder timing and codes elsewhere in that ADR must not be
  imported as P27 policy.
- **Existing navigation:** admin
  [mc-shell.tsx](../../../../../apps/admin/app/mc-shell.tsx:111) and missionary
  [navigation-items.ts](../../../../../apps/missionary/components/navigation-items.ts:44)
  both already expose Tasks. The admin shell is used by the protected
  [layout](<../../../../../apps/admin/app/(app)/layout.tsx:32>). Admin task views
  include All/My/Overdue in
  [tasks-content-sections.tsx](<../../../../../apps/admin/app/(app)/tasks/tasks-content-sections.tsx:30>).
  Missionary task views include Today/Overdue and list/board choices in
  [page-client.tsx](../../../../../apps/missionary/app/tasks/page-client.tsx:212).
  These are useful interaction precedents, not evidence that the two stores are
  one qualified Tasks Hub.
- **Prototype warning verified:** admin
  [useTasksRows](../../../../../packages/database/hooks/admin-workspace.ts:33)
  reads `adminTasksCollection`; its
  [collection](../../../../../packages/database/collections/admin-workspace.ts:805)
  queries and mutates local rows, explicitly described as transition/demo data
  at lines 10–12. Missionary
  [use-tasks.ts](../../../../../packages/lib/hooks/use-tasks.ts:169) reads
  `/api/missionary/tasks`. Do not solve D6 by writing into both stores.
- **Bell is not delivery proof:** admin shell imports and renders
  [dropdown-notification.tsx](../../../../../packages/ui/components/shadcn-studio/blocks/dropdown-notification.tsx:55),
  including hardcoded “8 New” and sample people. ADR-0027 lines 548–558 explicitly
  identify this and Support-owned preferences as migration inputs, not global
  notification authority. A shared
  [preferences matrix](../../../../../packages/ui/components/settings/notification-preferences-matrix.tsx:28)
  is a presentation primitive; it does not authorize a new channel or preference.
- **Dates currently differ:** admin
  [task-form-model.ts](<../../../../../apps/admin/app/(app)/tasks/task-form-model.ts:195>)
  saves `yyyy-MM-dd`, reparses with `new Date` at line 149, and its optional
  reminder helper subtracts an hour from a Date at lines 123–135. Missionary
  [task-form-model.ts](../../../../../packages/missionary/components/task-form-model.ts:96)
  saves ISO instants. Admin due/overdue comparisons in
  [tasks-content.tsx](<../../../../../apps/admin/app/(app)/tasks/tasks-content.tsx:112>)
  use `new Date`. These are reasons to verify calendar-day semantics across
  surfaces, not evidence that a particular production bug has been reproduced.
- **No authoritative P27 clock found:**
  [database types](../../../../../packages/database/types/database.ts:100)
  contain Tenant `default_timezone` and Missionary `timezone` at line 132.
  Field existence does not select which owns P27 due-day boundaries. Existing
  source-owned timezone/instant principles apply; the exact calendar-date rule
  needs to be recorded before activation rather than inferred from the browser.
- **Component reuse:** admin
  [TaskDueDateSection](<../../../../../apps/admin/app/(app)/tasks/task-form-sections.tsx:226>)
  uses a labeled shared Calendar/Popover and displays a formatted chosen date;
  it is not a reason to force calendar navigation as the only entry method.
  [UI rules](../../../../../packages/ui/AGENTS.md:57),
  [accessibility review](../../../../ai/skills/accessibility-review/SKILL.md:22)
  and [touch guidance](../../../../ai/skills/emil-design-engineering/touch-accessibility.md:46)
  require keyboard/focus/error/mobile verification and 44px touch hit areas.

## Current primary practice and technical sources

Every URL below was fetched on **2026-10-10**. Publication/modified dates are
reported only where the source supplies them. Salesforce sitemap dates are
metadata from the previously retained official sitemap, not independently
proved content revision dates. None of these applications was exercised live.

| ID  | Edition, source and date                                                                                                                                                                                                                                                                                                                                                                                  | Source-supported excerpt or fact                                                                                                                                                                                                                 | Limit for D6                                                                                                                                                                                                       |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| E1  | Salesforce integrated Nonprofit philanthropy and partnerships, currently linked as Agentforce Nonprofit, **not NPSP**: [Work with Prospects and Donors](https://trailhead.salesforce.com/content/learn/modules/nonprofit-cloud-philanthropy-and-partnerships/work-with-prospects-and-donors). No article date displayed; retained sitemap lastmod 2026-09-08.                                             | “The Open Activities component shows the tasks in her action plan.” Action plans also appear in the donor profile's related list.                                                                                                                | Supports contextual work visibility. Does not document a universal relationship pause, review date or reminder policy.                                                                                             |
| E2  | Salesforce Lightning/Sales Cloud: [Discover the To Do List](https://trailhead.salesforce.com/content/learn/modules/to-do-list-for-task-management/discover-the-to-do-list). No article date displayed; retained sitemap lastmod 2026-05-28. Source lists Starter, Professional, Enterprise, Performance and Unlimited Editions.                                                                           | Standard tasks appear in the To Do List when created and display a due date; task history also appears on the record's activity timeline.                                                                                                        | Shared list plus record is comparable practice. Cadence features and licensing must not be claimed as universal Nonprofit behavior; no evidence for copying recurrence.                                            |
| E3  | Virtuous CRM+: [How Do I Create a Task?](https://support.virtuous.org/hc/en-us/articles/360059923452-How-Do-I-Create-a-Task), article API `edited_at` **2025-07-16**.                                                                                                                                                                                                                                     | “All Tasks generally work the same and can be managed from within the Tasks page”; tasks may originate on contacts, gift asks, grants and campaigns. Owner and due date are explicit. Recurrence is a separate choice.                           | The vendor's two-day default, 48-hour notification and email/digest rules are documented choices, not evidence that Core needs them. No task outcome statistics or universal pause policy are supplied.            |
| E4  | Blackbaud Raiser's Edge NXT **web view**: [Manage a Single Action](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-actions-manage-single.html), undated.                                                                                                                                                                                                                        | Assigning an action gives its fundraiser a top-navigation notification linking to the action. Assign-and-complete does not notify. Add to calendar is an explicit separate action, with ICS/Google/Outlook options.                              | Supports useful deep links and separation of action state from attention. It does not prove a due-date reminder or require external calendar integration for Core.                                                 |
| E5  | W3C WAI APG: [Date Picker Dialog Example](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/), page updated **2025-08-12**.                                                                                                                                                                                                                                                | Input has an associated date-format description; selected date affects the button name; focus returns to that button; month/year changes are announced.                                                                                          | An illustrative pattern, not a production-ready component. The page explicitly warns of browser/AT support gaps, particularly mobile/touch, and requires testing. Use Core's primitives, not a copied ARIA widget. |
| E6  | GOV.UK Design System: [Ask users for dates](https://design-system.service.gov.uk/patterns/dates/), undated current guidance.                                                                                                                                                                                                                                                                              | Relative dates can suit reminders; calendar controls suit near-future dates and weekday comparison. “Never make a calendar control that depends on JavaScript as the only input option.” Provide text input as well.                             | Not a command to adopt GOV.UK styling or three separate birth-date boxes. Review dates can be months away; typed/native date entry reduces calendar paging.                                                        |
| E7  | W3C Internationalization: [Working with Time and Timezones](https://www.w3.org/TR/timezone/), **Group Draft Note 2025-07-26**.                                                                                                                                                                                                                                                                            | A floating date/time is not fixed to a particular instant or timezone; date-only values are a common example when the local expression should remain constant for different viewers. Distinguishes calendar fields, instants and timezone rules. | Draft best-practice guidance, not a normative WCAG rule or a choice of Core's business timezone. Supports preserving the selected date separately from any delivery instant.                                       |
| E8  | MDN HTML reference: [input type=date](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/date), modified **2026-06-09**.                                                                                                                                                                                                                                                          | Value contains year, month and day without time; normalized `yyyy-mm-dd` differs from browser-locale presentation.                                                                                                                               | Technical reference, not accessibility certification or a mandate to replace the shared picker. Avoid treating locale display text as storage format.                                                              |
| E9  | WCAG 2.2 Understanding [4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), updated **2026-05-11**, AA.                                                                                                                                                                                                                                                             | Status changes can be programmatically determined and presented without receiving focus.                                                                                                                                                         | Saving feedback must be accessible; each background due item does not require an assertive announcement or focus change.                                                                                           |
| E10 | GOV.UK Design System [Error summary](https://design-system.service.gov.uk/components/error-summary/), current undated page; change history includes **2025-02** focus clarification.                                                                                                                                                                                                                      | Focus summary, link to invalid answers and use the same message at summary and input.                                                                                                                                                            | A useful error-recovery pattern; exact summary/layout should follow Core's established form conventions and form size.                                                                                             |
| E11 | WCAG 2.2 Understanding [1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), updated **2026-09-06**; [2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), updated **2026-05-11**; [2.4.11 Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html), updated **2026-06-15**. All AA. | Reflow, pointer target size/spacing and visible focused controls must survive narrow layouts and author-created overlays.                                                                                                                        | WCAG minimum is 24 CSS px or an applicable exception, not a universal 44px criterion. Core's own touch guidance is stronger. Automated checks alone cannot prove this flow.                                        |

## Graded adversarial findings and exact bounded corrections

Severity assesses consequence if implemented poorly. Likelihood is a qualitative
assessment of exposure in this design, **not measured incidence**. “Evidence”
identifies observed source/contract; “inference” identifies the proposed product
conclusion. None of these findings claims a production incident.

| ID and category                                               | Severity / likelihood | Evidence, inference and answer effect                                                                                                                                                                            | Proposed corrective language                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| U1 — Necessity, cognitive load, process burden                | Medium / high         | E1–E4 support contextual tasks and shared lists. Existing Tasks navigation avoids a new destination. Inference: a separate pause wizard duplicates information. **Retain A; narrow the flow.**                   | “Choose the internal review date while pausing the partnership. Use its current valid lead and context. Do not require a separate task form, recurring schedule, new inbox or notification setup.”                                                                                                                                                                                                                 |
| U2 — Notification destination, preferences and visibility     | High / high           | ADR-0027 and ADR-0183 separate source, task and attention. Admin bell is demonstrably demo content. E3's email behavior is not Core authority. **Material delivery clarification.**                              | “For the first D6 profile, the source review work appears in shared Tasks and its authorized partnership context; the due occurrence produces one qualified in-product attention projection through existing owners. No default email, SMS, push, digest or calendar integration is added. Reading attention never completes review work. Later optional delivery preferences cannot remove required source work.” |
| U3 — Calendar date, timezone and locale                       | High / medium         | E7–E8 distinguish a calendar date from an instant; local form paths differ. No exact P27 governing timezone rule was found. **Needs an explicit semantic rule before activation, not a timezone wizard.**        | “Preserve the chosen calendar date across devices and travel. The source uses an explicit recorded business-timezone policy for due/overdue boundaries; browser timezone and worker runtime do not decide them. Show the full date and clarify the governing zone where necessary. Choosing a review date does not promise a delivery hour.”                                                                       |
| U4 — Review action, completion and contact permission         | High / medium         | ADR-0183 prohibits generic completion as business truth; Q6 separates pause from one deferred ask or contact restriction. E1–E4 do not override this. **Retain A with source action.**                           | “The review asks the authorized lead to keep the work on hold, resume or end it. A generic task checkbox, notification read/archive or arrival of the date changes none of those facts and never authorizes contact.”                                                                                                                                                                                              |
| U5 — One obligation, edit/retry and stale attention           | High / medium         | ADR-0183 permits one task identity per source work occurrence. Low-bandwidth reuse and date edits expose duplicate/stale cases. **Clarify delivery/review lifecycle; do not build a new engine.**                | “Reuse the same appropriate review obligation. Date changes, replay and reconnect must not leave a second current review or a reminder for the replaced date. Attention opens current authorized source context; it does not replay an old decision.”                                                                                                                                                              |
| U6 — Lead eligibility, role views and privacy                 | High / medium         | ADR-0183 lines 57–69 require fresh eligibility and minimized facts. D5 responsibility grants no access; broad missionary inbox remains later work. **Keep source-based responsibility.**                         | “Show the review only through the lead's admitted role and surface. Lead loss or lack of access creates a source-visible responsibility problem for independently authorized staff, not a guessed recipient, copied protected reason or broadcast. A task assignment grants no access.”                                                                                                                            |
| U7 — Accessible date input and errors                         | Medium / high         | E5–E6 date patterns and local Calendar/Popover precedent; shared primitives need behavioral verification. **Retain A; avoid a calendar-only gate.**                                                              | “Offer labeled direct date entry with the existing calendar where useful. State the expected format, show the chosen full date, identify invalid dates in text, retain entered values and return focus predictably. Use the shared components and test keyboard plus screen-reader/touch behavior.”                                                                                                                |
| U8 — Mobile, interruption and low bandwidth                   | High / medium         | E9–E11 and ADR-0027 quiet arrival are direct requirements; reconnect risk is inference, not tested failure. **Require truthful save/read recovery.**                                                             | “Keep the action and date usable on narrow screens with visible focus and touch targets. Show saving, saved, failed or unresolved status truthfully; preserve input on failure. Reconcile a lost response before retry creates work. Reloading Tasks/source must recover current work without realtime, animation or a transient toast.”                                                                           |
| U9 — Indefinite pauses, duplicate follow-up and human dignity | Medium / high         | Q6 selects a default, not universal recurrence; E3 treats recurrence as separate. Inference: mandatory arbitrary dates produce meaningless reviews and inappropriate pressure. **Do not expand founder choice.** | “This is the normal internal review default for a deliberate pause, not a rule that every wait requires a pause or that every pause repeats forever. Do not generate fundraising urgency, donor contact or adverse donor labels from a missed internal review.”                                                                                                                                                    |
| U10 — End, resume and existing obligations                    | High / medium         | Q6 explicitly preserves unrelated promises, finance and permission. Task source owns applicability under ADR-0183. **Preserve independent work.**                                                                | “Source-authorized resumption, ending or rescheduling updates only the applicable pause-review work and attention. It does not silently cancel stewardship tasks, commitments, gifts or other asks. An ended review is presented with its truthful source outcome, not fabricated completion.”                                                                                                                     |

For U3, an economical candidate is **organization/business calendar date**: the
chosen day remains the same for every viewer; due on that day and overdue after
that day in the source's recorded governing timezone. A timezone-setting change
must not silently shift existing review dates or release obsolete attention.
This is a recommendation for an explicit source rule, **not a discovered Core
contract**. If an existing approved date owner supplies another policy, reuse it
and explain its user-visible result. Do not silently select missionary device
time or UTC midnight because that is how one existing form serializes dates.

For U9, no indefinite-pause exception, allowed reason set, mandatory next date on
every review, escalation cadence or default number of days is selected by this
note. Resolve exceptional indefinite holds in the pause policy when needed; do
not make the UI pretend that an arbitrary date answers that unresolved question.

## Meaningful acceptance evidence for a later implementation

These are proposed correctness and usability checks, not tests executed in this
research task, a formal feature specification or an invented adoption benchmark.

1. **Purpose and minimal flow.** With fictional cases, have a responsible staff
   user distinguish an ordinary agreed follow-up, a single deferred ask and a
   deliberate partnership pause. From the partnership they can choose the date
   and save without recreating known context. They can explain that this is an
   internal review, not permission or a promise to contact the donor. If they
   repeatedly select pause for ordinary follow-up, revise labels/model before
   adding automation.
2. **One durable destination.** With the permitted staff role, the same review
   obligation can be found through Tasks and partnership context. Reading the
   due attention leaves actionable work visible. A permitted missionary role
   uses its admitted contextual/task surface; a donor role and wrong tenant see
   none. No second generic inbox or unqualified email setting appears.
3. **Source completion.** Generic Complete, drag-to-Done, archive and dismiss
   cannot settle a source-backed review. Each admitted review outcome changes
   only the source-defined obligation. A future decision to keep paused has
   explicit policy semantics; it is not inferred from a read receipt or reused
   unchecked recurrence flag.
4. **Calendar correctness.** Choose the same civil date from UTC-negative,
   UTC-positive and travelling browsers; reload both relevant surfaces and
   confirm the displayed review date is unchanged. Check the governed due day,
   next day, leap day, DST transition and valid/invalid input. Change display
   locale, including day/month ambiguity and Thai/Arabic presentation, without
   changing the stored day. Independently verify a governing timezone edit's
   declared policy; do not silently backfill or shift existing dates.
5. **Date edits and races.** Edit a future review, postpone an already due review,
   and resume/end before a delayed worker or old link runs. Current Tasks and
   source context agree; old attention is no longer current under its source
   rules; no duplicate current work or stale release occurs. Evidence must come
   from the eventual owning path, not a mocked toast counter.
6. **Eligibility and limited disclosure.** Remove the lead's relevant eligibility
   before due and before opening a saved link. Protected details/counts/reasons
   disappear as required. No guessed manager or cross-role notification is
   created. Independently authorized staff can identify the source responsibility
   problem. Restoring access does not revive obsolete engagement.
7. **Accessible field work.** Exercise keyboard-only selection and text entry,
   screen reader with calendar month/year changes, cancellation/focus return,
   validation recovery, 320 CSS px/reflow, zoom, touch, long translated labels,
   RTL, reduced motion and sticky controls. Confirm hit areas meet Core guidance;
   missing dates/errors and review state do not depend on color. New background
   attention does not steal focus or assertively announce sensitive detail.
8. **Interrupted connection.** Throttle/disconnect while saving, lose the response
   after server success, then reload/retry. Input and truthful outcome recover;
   exactly one current obligation remains. Turn off realtime and optional
   delivery: normal authorized Tasks/source reads still expose the work. A
   pending response never produces false “Saved” or an assumed offline success.
9. **Independent obligations and dignity.** A due review while contact is
   prohibited remains an internal decision. Existing giving and agreed
   stewardship tasks remain correctly represented. No donor-facing contact,
   finance mutation, shame label or automatic resumption occurs.

The pilot is falsifiable without invented success rates: if an ordinary task
plus contextual paused status already supports these mental-model/navigation
cases, a dedicated review screen is unnecessary. If users cannot distinguish
internal review from donor follow-up, or cannot locate responsibility when the
lead is unavailable, the proposal needs revision; reminder volume is not proof
of successful stewardship.

## Verification limits

Public official documents and named repository sources were read; no remote
writes, task creation, notifications, outreach, UI edits or schema edits were
performed. No vendor's workflows were executed and no production reminder
reliability, staff efficiency or accessibility conformance was measured. Source
pages without dates are marked undated. Product recommendations and likelihood
assessments are labeled inference. Research did not choose an executor, new
notification preference, activation manifest, schema or generic scheduling
platform. The existing task and bell prototypes are evidence of UX conventions
and migration work, not evidence that D6 is already implementable by wiring up
a date picker.
