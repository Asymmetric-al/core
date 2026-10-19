# D6 evidence — ministry practice and internal review of paused work

Research date and retrieval date: **2026-10-10 UTC**. Scope: the founder selected
Q6 A, a chosen internal review date when relationship-building is deliberately
put on hold. This is evidence and adversarial review, not a specification,
implementation, or further ratification. D1–D4 remain settled; D5's selected
partnership lead is not reopened. No vendor software was executed and no
missionary or donor usability study was performed.

## Finding

A chosen review date is a defensible default for accountable ministry work.
Published evidence supports dated follow-up and internal tasks, but does **not**
establish a universal missions practice of periodically reviewing every paused
relationship. Preserve the question's actual scope: one useful internal review,
with staff-chosen timing, through appropriate existing Core work and reminders.
The reminder must not become an instruction to contact the supporter, an automatic
restart, or a judgment about the supporter's commitment.

The strongest alternative remains a deliberate hold without a review date when
staff are waiting for an external change. It avoids administrative reviews that
cannot change anything. The founder chose A as the normal behavior; that does not
settle a universal recurring cadence or the admissibility of indefinite-hold
exceptions. Neither option's adoption or benefit has been measured here.

## Primary sources: published facts and limits

All URLs below were opened through the research browser on 2026-10-10. Publication
dates are the page's own dates where available, not crawler timestamps.

| Source and edition                                                                                                                                                                                                                                 | Published evidence                                                                                                                                                                                                                                                                                     | Relevance and authority limit                                                                                                                                                                                                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [MPDX: Status, MPD Phase](https://help.mpdx.org/article/162-mpdx-status-mpd-phase), web help, updated **2023-09-18**                                                                                                                               | Ask in Future is among the active statuses. Hidden statuses include Not Interested, Unresponsive and Never Ask. One contact can have only one status.                                                                                                                                                  | A known later follow-up need not mean all relationship work is paused. Do not import the single-contact status model, hidden-list behavior, financial colors or authorization assumptions into Core.                                                                                |
| [TntConnect: TNT Phase](https://www.tntware.com/tntconnect/help/en/pages/contacts_mpdphase.aspx), official desktop technical manual, **undated**                                                                                                   | Ask in Future includes a contact's request for later contact. Not Interested, Unresponsive and Never Ask have different meanings; lack of response does not establish refusal.                                                                                                                         | Supports distinct facts for waiting, silence and a decision. These are vendor workflow meanings, not Core's legal/contact restriction authority or an agency policy. No installed release was verified.                                                                             |
| [TntConnect: Task Types](https://www.tntware.com/tntconnect/help/en/pages/taskhistory_tasktypes.aspx), official desktop help, **undated**                                                                                                          | The guide recommends task lists for definite obligations such as appointments and promised follow-up; it describes other calling work being managed without an individually scheduled task. It also documents internal To Do work and distinguishes thank-you, newsletter and support-letter activity. | Strong counterevidence to treating every possible relationship action as another dated task. This is vendor guidance, including historical material, not measured present-day user behavior. Do not import its ranking of relational significance or personal-information examples. |
| [MPDX: Tackle MPDX Mobile Tasks](https://help.mpdx.org/article/500-tackle-mpdx-mobile-tasks), mobile help, updated **2021-11-29**                                                                                                                  | Lists current and overdue tasks; supports due dates/times and an alert selection; call completion prompts follow-up. Tasks can be created and edited on mobile.                                                                                                                                        | A familiar precedent for mobile follow-up. Does not prove offline operation, bandwidth performance, reminder delivery, mandatory recurrence or the proper Core implementation. No mobile app was tested.                                                                            |
| [MPDX: logged-out product page](https://get.mpdx.org/goodbye/), **undated**, currently published                                                                                                                                                   | Describes mobile tracking of calls, texts, emails and tasks for missionaries on the move.                                                                                                                                                                                                              | Product positioning supports considering mobile use; it is not usability or reliability evidence. The page title does not announce product closure.                                                                                                                                 |
| [OMF Japan: What does home assignment actually mean? Part 2](https://omf.org/what-does-home-assignment-actually-mean-for-missionaries-part-2-arriving/), posted **2026-06-29**                                                                     | Describes home assignment including church visits, reconnecting with supporters, sharing ministry and receiving care.                                                                                                                                                                                  | Counters any automatic equation of travel/home assignment with paused partnership work. This is an OMF Japan explanatory article, not a universal agency lifecycle rule or CRM workflow.                                                                                            |
| [Salesforce: Work with Prospects and Donors](https://trailhead.salesforce.com/content/learn/modules/nonprofit-cloud-philanthropy-and-partnerships/work-with-prospects-and-donors), current Agentforce Nonprofit/Fundraising Trailhead, **undated** | An action plan's tasks appear in Open Activities on the donor profile; opportunities separately track a particular solicitation.                                                                                                                                                                       | Supports coordinated task presentation and distinct work types. HNMI and its staff are a training example, not an observed agency deployment. This is not NPSP documentation and supplies no paused-cultivation cadence.                                                            |
| [AFP: Donor Bill of Rights](https://afpglobal.org/donor-bill-rights), current official page, **undated**                                                                                                                                           | Frames giving as voluntary; calls for professional relationships, confidentiality and respect in handling donation information, and honoring gift purposes.                                                                                                                                            | Ethical grounding for neutral internal reminders and minimal exposure. It does not prescribe review dates, technical permission rules or a general contact opt-out implementation. Its mailing-list clause concerns lists shared by the organization.                               |

## Existing Core placement

The [Q6 note](../phase27-q6-paused-work-review.md) expressly selects a default,
not mandatory recurring reviews for every pause. Its active-work requirement
does not itself settle paused-work policy.

[ADR-0183](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)
already keeps concrete human action source-owned and projects admitted work
into one shared Tasks Hub. It distinguishes task state from notification
engagement and disallows independent copied source-backed tasks. The source,
not a generic checkbox, determines whether its required action has been met.
[ADR-0027](../../../../adr/0027-one-notification-presentation-and-engagement-model.md)
owns notification presentation separately. These are repository contracts, not
evidence that a Phase 27 pause-review source contract is implemented.

The [roadmap's Phase 27](../../../../prds/sitestacker-parity/roadmap.md:4091)
requires native reminders without an optional workflow install. Its
[field-resilience phase](../../../../prds/sitestacker-parity/roadmap.md:5141)
extends baseline mobile usability through a separately qualified offline scope.
Neither vendor mobile documentation nor D6 authorizes a new offline mutation
queue. Website-specific reminder policies in the ADRs do not become donor
development defaults by reuse of shared infrastructure.

## Material concerns and exact proposed amendments

Severity describes consequence; likelihood is a qualitative design-risk judgment,
not an observed rate. All examples are pressure tests, not claimed agency workflows.

### M1 — Internal review mistaken for permission to contact

**High severity; plausible likelihood.** A task named Follow up can be read as a
call instruction, especially after an extended hold or a restriction. An overdue
badge can misleadingly portray the supporter as late or unresponsive.

**Amendment:** “The due action is an internal review of the hold. Its date neither
authorizes contact nor resumes relationship-building. Overdue describes the
staff review, not the supporter. A review can be completed from current permitted
information without contacting the supporter.”

### M2 — A default expands into repetitive administrative work

**Medium severity; plausible likelihood.** Repeated arbitrary dates encourage
perfunctory rescheduling and undermine the usefulness of the work list. Sources
do not justify weekly/monthly reviews, obligatory calls, manager sign-off, or a
new reminder setup ceremony.

**Amendment:** “Choose timing appropriate to the reason for the hold; D6 sets no
fixed interval or automatic recurrence. Keep one current review obligation.
Whether an exceptional hold may have no date remains a separate decision.”

Revising the date is not evidence that circumstances changed. Exact source
review outcomes and further-review rules remain to be qualified before shipping;
do not substitute automatic resumption or generic task completion for them.

### M3 — The same review appears as several independent jobs

**High severity; plausible likelihood if implemented locally.** Separate
partnership, task and reminder records with independent completion mislead
different staff about who owes what. An existing call task is not interchangeable
with an internal review simply because its date matches.

**Amendment:** “Represent the exact source-owned review once through Core's
shared work and reminder contracts. Reuse existing work only when it covers the
same review obligation, scope and eligible responsibility. Notification read or
dismissal does not complete the review, and generic task completion does not
resume the partnership.”

This does not select a new source type, UI route, bell item, push channel or
calendar integration. D5 responsibility remains distinct from access; loss of
an eligible lead uses the established source-owned recovery boundary.

### M4 — Pause absorbs unrelated meanings and obligations

**High severity; plausible likelihood.** A church's later budget decision,
temporary staff unavailability, no-contact restriction, ended work and stopped
giving are materially different. Prayer or practical support may continue
without a financial ask. Home assignment alone establishes no hold.

**Amendment:** “Apply the hold only to the identified relationship-building
work. It does not itself suspend giving, commitments, separately permitted
updates, or already-agreed obligations. A delayed ask alone does not pause all
work. Contact restrictions and ending remain separate authoritative facts.”

Before a pause command ships, resolve affected open asks/tasks explicitly; do
not silently cancel every task or preserve an impermissible outreach task.

### M5 — Reasons and reminders expose sensitive circumstances

**High severity; plausible likelihood.** Medical, family, pastoral or restricted
worker context may explain a pause but need not appear in tasks, search results,
notification previews or staff-wide lists.

**Amendment:** “Do not require a sensitive narrative to put work on hold. Keep
the review's list and reminder wording minimal, with protected context available
only through its existing authorized source. The reminder does not broaden
access to supporter, ministry or care information.”

Neutral wording such as “Review work on hold” is a proposal, not final copy or
proof that every recipient may see a supporter or missionary name. Do not infer
prayer commitment, disengagement or financial risk from the hold.

### M6 — Travel and intermittent connectivity make reminders misleading

**Medium severity; plausible likelihood in the intended use, not measured.**
A date appearing to change with a travelling user's phone timezone, a hidden
failed save, or reliance on an external push can make work disappear or seem done.

**Amendment:** “Keep the review available through ordinary authorized Core work
on mobile. Show the chosen date using Core's qualified date/time rules, preserve
its meaning across travel, and show whether a change was accepted. Reminder
delivery failure is not source completion or loss of the review obligation.”

Do not require an invented appointment time just to choose a review day. Confirm
actual shared date semantics before deciding date-only storage or timezone
policy. No claim of offline support or permission to cache private context follows.

## Focused proof and pilot checks

- A church asks for a January budget follow-up: staff can keep an ordinary dated
  action without pausing all work. A deliberate whole-work hold instead creates
  the exact internal review obligation. The two actions remain distinguishable.
- The review date arrives while a contact restriction is effective: staff can
  understand and review the hold without an outreach prompt, automatic contact
  or automatic resumption. An overdue review does not label the supporter late.
- Financial support or an independently authorized prayer update continues
  during the hold: no inferred stop, new prayer commitment, or second partnership
  is produced. Existing promised obligations remain truthfully represented.
- A review is already represented in compatible shared work; the date changes;
  the reminder is read; the source is reviewed elsewhere; or responsibility is
  lost: the same obligation remains coherent without copied jobs or fake completion.
- A travelling user edits the date on a phone under slow connectivity and loses
  the response: they can establish whether it saved and recover without creating
  duplicate work. Test using the supported online path; do not assume offline.
- Walk through short and long holds with actual agency staff and personally
  support-raising missionaries. Ask them to explain what is due, who should act,
  whether contacting the supporter is required, and when a review adds no value.
  Observe duplicated work, ambiguous labels and gratuitous rescheduling before
  fixing copy or date defaults. Include prayer-only and church partnerships.
  These are proposed checks; no participant counts, success thresholds, benefit
  statistics or completed pilot results are asserted.

The remaining product choice is not whether to install a separate reminders
engine. D6 needs a small source-owned review behavior that fits existing shared
work, plus explicit unresolved boundaries for exceptions and lifecycle effects.
