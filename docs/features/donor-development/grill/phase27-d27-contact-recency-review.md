# Phase 27 D27 — actual personal exchanges and clear relationship context

2026-10-11, Asia/Bangkok. Research retrieved 2026-10-11 UTC.
**Amended D27 explicitly ratified.** Review disposition: **Accept, with
clarifying safeguards.** The founder subsequently instructed, “Yes, ratify this
amended D27.” The exact reviewed decision and its safeguards are ratified without
substantive change. This is the completed focused best-practice/UX review, not a formal
PRD/OpenSpec, shipped capability, tested prototype or permission activation.

## Recorded decision

> **D27 — Base personal-exchange recency on an actual conversation or personal
> exchange, and show outreach separately.** A source-qualified completed
> conversation, meeting involving a real exchange, or relevant human personal
> response can update the partnership's recorded exchange date. A substantive
> personal inbound message can establish contact even if earlier outreach happened
> outside Asym or is not recorded; no matching outbound message is required.
> A short personal response or decline can qualify without a word-count,
> sentiment, financial or positive-outcome threshold.
>
> A sent message alone remains outreach, including a thoughtful thank-you that
> needs no answer. A call attempt, voicemail left, meeting booking, attendance
> metadata, calendar completion, email open/click, delivery signal, automated reply,
> generic note or task completion cannot alone prove an exchange. Uncertain
> source evidence remains uncertain; no blanket inference from an event name.
>
> Show **Last recorded exchange**, with a short explanation and its permitted
> source type, separately from **Recent outreach** and existing **Next follow-up**.
> Use what actually happened and when, not the date it was entered. Missing,
> private, unavailable or undated history must not become “Never contacted,”
> a false latest date, or a judgment that someone neglected the relationship.
>
> Preserve D26's voluntary missionary participation, qualified shared history and
> source boundaries. Recording the actual interaction once is sufficient; no
> compulsory logging, extra approval, transcript, next task or meaningfulness
> checkbox is introduced. This measure does not grade missionaries, value donors,
> trigger contact, change stages, reopen work or override consent and agreed plans.

## What current practice supports—and what it does not

There is **no universal CRM definition** of last contact. HubSpot's current
documentation counts logged one-to-one email in Last contacted and distinguishes
activity, engagement and reply dates. That is a credible broader convention than
A. Asym should not use a familiar broad label while silently giving it narrower
semantics. The selected narrower measure is a product choice; the transferable
practice is to preserve distinct outcomes, use accurate labels and show the
underlying evidence without making people re-enter it.

| Primary evidence                                                                                                                                                                            | Verified fact and consequence for Asym                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [HubSpot contact properties](https://knowledge.hubspot.com/properties/hubspots-default-contact-properties), updated 2026-07-02; retrieved 2026-10-11                                        | Last contacted includes logged one-to-one email; Last activity includes notes/tasks, while replies have separate properties. Use a specifically labeled exchange measure and keep outreach visible. This is not evidence that A is an industry mandate. |
| [CiviCRM Activities](https://docs.civicrm.org/user/en/latest/organising-your-data/activities/), current published manual; retrieved 2026-10-11                                              | Activities include many types and outcomes. Generic activity completion does not establish an actual relationship conversation. Source type and real outcome matter.                                                                                    |
| [MPDX mobile logging](https://help.mpdx.org/article/517-automatically-logging-tasks-when-contacting-partners), published instructions; retrieved 2026-10-11                                 | Launching a contact action and recording its outcome are distinct. Reuse source-backed outcomes; do not infer a completed conversation from opening a phone or mail application. Do not import MPDX's coaching/reporting expectations.                  |
| [Apple Mail Privacy Protection](https://support.apple.com/en-by/guide/iphone/iphf084865c7/ios), current public guide; retrieved 2026-10-11                                                  | Mail privacy features prevent reliable observation of whether the recipient opened a message. Opens cannot prove an exchange. The US-guide request returned an internal retrieval error; the same official BY guide was successfully read.              |
| [W3C form instructions](https://www.w3.org/WAI/tutorials/forms/instructions/) and [status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), retrieved 2026-10-11 | Persistent labels/instructions and perceivable status support understandable forms and recovery. Placeholder-only explanations and visual-only save feedback are insufficient.                                                                          |
| [Nielsen Norman Group: visibility of system status](https://www.nngroup.com/articles/visibility-system-status/), retrieved 2026-10-11                                                       | Timely understandable feedback reduces uncertainty about actions and state. Apply it to saved, pending, unavailable and unknown outcomes; do not import e-commerce pressure tactics into relationship work.                                             |

The [practice appendix](d27-evidence/practice.md) gives further primary comparisons,
publication/retrieval dates and contrary behavior. The [UX appendix](d27-evidence/ux.md)
maps these principles to Core's actual components and flow. The
[ownership appendix](d27-evidence/ownership.md) establishes source boundaries and
current implementation gaps. Published product behavior is not measured proof
that our proposed design works for a particular missions organization. No tenant
interviews, comparative conversion results or new runtime tests are claimed.

## The proposed experience

Use a compact summary within the existing partnership record, with source links
where permitted. These illustrative English labels and dates must be localized.
Do not create a new dashboard or three large competing status cards.

```text
Grace Church · [permitted ministry partnership]

Last recorded exchange     6 Oct 2026 · Phone conversation
Recent outreach           10 Oct 2026 · Personal email
Next follow-up            20 Oct 2026 · [existing source action]

History                                          Add update
```

Explain “exchange” briefly: **A conversation, meeting or personal message received.
Messages sent are shown separately.** The displayed event must satisfy the actual
source/partnership criteria; the explanation is not a rule that every inbound
payload or every calendar meeting qualifies. A source descriptor makes the date
understandable without asking users to learn the internal metric.

Reuse D26's clear sharing context and shared controls. When an already-qualified
source interaction exists, project it once; do not ask a missionary or staff member
to log it again. For an unrecorded actual conversation, reuse the source-backed
Add update flow with a clear event/outcome choice, visible occurrence date and
optional concise context. Known partnership/recorder information comes from the
current authorized context; never demand another name/address/contact form or a
transcript. Date-only entry is sufficient where that is all the person knows.
A visibly prefilled Today is an editable user assertion, not permission to derive
encounter time from database save time. Allow unknown date without inventing one.

Do not expose a second “Was this meaningful?” switch or require prose to prove
relationship quality. Actual short replies and negative outcomes are not less
real. Uncertain automatic event metadata does not justify an AI judgment, a new
classifier or a mandatory review queue for every message; qualify the owning
source outcome, and let an authorized person record/correct factual evidence when
useful. Sharing, classification, actual participants and author identity remain
distinct source facts.

## Focused UX review

| Area                                            | Finding and permanent treatment                                                                                                                                                                                                                                                                                                                                           |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Clear language and information architecture     | **Material concern.** A bare Last contacted field can imply HubSpot-like sent-message coverage; Last meaningful contact can sound evaluative. Use Last recorded exchange with definition/source type, Recent outreach and independent existing follow-up. Do not hide these distinctions in an unexplained score.                                                         |
| Staff workload and unnecessary steps            | **Material concern.** Duplicate activity entry, mandatory transcript, another sharing approval or a separate meaningful checkbox creates friction. Reuse the same source event and D26 composer; capture only actual outcome/date and optional context. Existing record identity is reused.                                                                               |
| Missionary experience                           | **Material concern.** Missing entries or an old date can become pressure to report or contact again. Preserve voluntary participation, no compliance scoring or compulsory follow-up, and no automatic change to paused/closed work.                                                                                                                                      |
| Donor, public and giving experience             | **No new direct flow is needed.** This internal measure must not add checkout, donor-account, newsletter or public-page fields/steps. Indirect risk remains: do not create unnecessary follow-ups from an old exchange date or expose internal relationship assessment. No donor conversion improvement is claimed.                                                       |
| Administrators and tenant consistency           | **Material concern.** Relabeling a broad activity date or allowing each view to count different events makes the product inconsistent. One qualified meaning across staff and missionary projections; tenant labels/presentation cannot silently change evidence, privacy or missionary-autonomy rules. Ordinary label/layout choices are not a new configuration engine. |
| Mobile and low bandwidth                        | **Material concern.** A dense full timeline or ambiguous spinner makes recording/finding a recent conversation slow. Lead with the compact summary, progressively load history, retain permitted unsent text, distinguish saving from saved and recover the same operation. No default sensitive browser persistence or silent offline publication.                       |
| Accessibility                                   | **Material concern.** Date meaning, unavailable state and errors must survive screen readers, keyboard use, color loss and zoom. Reuse Base UI/base-maia through `@asym/ui`, persistent help, named source links, visible unobscured focus and restrained status announcements; verify at 320 CSS pixels/equivalent zoom.                                                 |
| International names, addresses and localization | **Material concern if old display assumptions are copied.** Render existing permitted display names without requiring first/last splits, Latin characters or repeated addresses. Support long/multiscript names, RTL and localized dates. This feature needs no new address input, transliteration rule or identity model.                                                |
| Dates, travel and historical entry              | **Material concern.** Save-time fallbacks, ambiguous numeric dates or converting date-only facts through UTC can make old contact look new. Keep occurrence precision/timezone meaning separate from recorded-at; localize display, do not fabricate a midnight instant, and treat unknown date explicitly.                                                               |
| Empty, missing and private history              | **Material concern.** No visible exchange is not Never contacted. Use No recorded exchange for an honestly empty permitted slice; errors/unavailable coverage are distinct. Explain the recorded/permitted coverage generically without signaling the existence of private events.                                                                                        |
| Correction, recovery and feedback               | **Material concern.** Correcting, restricting or deduplicating the newest event may legitimately move the derived date backward. Recompute from authoritative eligible history; do not maintain an irreversible maximum or recalculate from only the visible page. Show truthful pending/error/current states and safe correction.                                        |
| Source accuracy and attribution                 | **Material concern.** A church affiliation, selected participant, general activity completion or provider reply event can falsely imply an actual exchange in every ministry partnership. Use exact source identity, real outcome and qualified purpose/participants; a private date is still private information.                                                        |

## Edge cases resolved without another questionnaire

| Case                                                                                 | Treatment                                                                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Personal email sent; no response recorded                                            | Show outreach. It does not advance exchange recency. Do not say the person ignored it or automatically set Waiting/Overdue.                                                                                                                               |
| Thank-you or update that needs no reply                                              | Still valuable outreach; no missing-response warning or automatic follow-up.                                                                                                                                                                              |
| Short human reply, including a personal decline                                      | Can qualify if it is an actual relevant personal response. No minimum length or positive-sentiment rule. A decline does not authorize another solicitation; existing restrictions govern.                                                                 |
| Substantive incoming personal message with no prior Asym outbound                    | Can qualify from its own source evidence. Do not require a recorded message pair or invent an earlier conversation.                                                                                                                                       |
| Out-of-office, delivery receipt, automated acknowledgment or uncertain “reply” event | Does not alone qualify. Keep the source outcome truthful; a transport reply label is insufficient.                                                                                                                                                        |
| Call launched, unanswered, voicemail left; meeting booked/cancelled/no-show          | Activity/outreach or scheduling history only, unless there is separate actual-exchange evidence. Passive event attendance is not a personal conversation.                                                                                                 |
| General note, gift, opened email, completed task or Support record                   | None independently resets recency. An actual qualified exchange underlying a source can be reused without copying protected content or changing that source's owner.                                                                                      |
| Backdated conversation and later note edit                                           | Use the real occurrence date; editing or entering it today is not another exchange. No import-triggered wave of contact reminders.                                                                                                                        |
| Eligible exchange with unknown date                                                  | Preserve it. Do not fill from created_at or epoch. Where useful, show Latest dated exchange plus the visible fact that another recorded exchange has no date; do not falsely claim a definitive latest date or derive reliable age.                       |
| Protected source or expired message body                                             | A separately retained, currently permitted body-free contact fact may still qualify under its owner. Body expiry alone need not erase it. Conversely, a hidden event cannot leak through date/count/source hints; a copied body cannot restore authority. |
| One church, several people or ministries                                             | Attribute only to the exact qualified partnership and actual recipient/participant context. Church membership or an appeal link does not reset every related partnership.                                                                                 |
| Two contributors describe one meeting                                                | Keep distinct attributed words and one underlying encounter; no extra contact from viewing, sharing, correction or duplicate ingestion.                                                                                                                   |
| Paused/closed work receives a genuine current reply                                  | Record what actually happened without implicitly reopening work, changing stage, reviving reminders or assigning a task.                                                                                                                                  |

## Repository fit and exact developing requirements

Current source inspection establishes gaps, not a delivered D27 feature:

- [CRM grid model](../../../../packages/api/src/admin/crm/model.ts:58) derives
  `lastTouchAt` from `donor.updated_at`. Preserve P9's operational last-touch meaning;
  D27 needs a separately named source-qualified projection, not a relabeled column.
- [Detail activity query](../../../../packages/api/src/admin/crm/detail/service.ts:279)
  limits activity history to 50 rows. The
  [display fallback](../../../../packages/api/src/admin/crm/detail/service.ts:452)
  uses created-at/epoch when occurrence is missing. Neither is sufficient to derive
  a truthful personal-exchange date across full eligible history.
- [Missionary activity creation](../../../../packages/api/src/missionary-portal/donor.ts:120)
  writes a save-time activity timestamp. A logged type/note is not a qualified
  occurrence/outcome contract. Existing screens and mocked tests do not establish
  actual D27 authorization, source completeness or UX.
- [ADR0031](../../../adr/0031-body-free-history-with-expiring-recent-copy.md)
  separates durable body-free communication facts from expiring copies. Retain
  its distinction without converting protected or unqualified metadata into a
  permission to disclose an exchange.

The exact owner clarification for later /to-prd is: **P27 owns the narrower
personal-exchange meaning; P9's qualified interaction facts and P6/17's qualified
communication outcomes supply evidence. P26 retains its protected source and
need; P28 consumes the same permitted measure. Generic lastTouchAt and each
source's retention/disclosure rules remain unchanged.** No formal owner file or
OpenSpec is edited in this interview turn.

1. **R01 — Evidence:** derive exchange recency only from an actual source-qualified
   personal exchange in the exact partnership. Support ordinary attributed manual
   evidence and qualified inbound evidence without a mandatory message pair,
   transcript, word-count or sentiment classifier.
2. **R02 — Distinct meanings:** preserve exchange, outreach, delivery, scheduling,
   next action and generic last touch as different facts. Sharing/editing/saving
   alone changes none of the underlying contact or work outcomes.
3. **R03 — Time and completeness:** use actual occurrence precision and qualified
   historical coverage; no created-at/epoch fallback, guessed unknowns or max over
   a capped display list. Corrections/restrictions/deduplication must update the
   derived result truthfully, including backward movement or loss of certainty.
4. **R04 — Current authority:** apply exact tenant/source/partnership/field/history
   authority to the date, source descriptor, counts, sorting/filtering, caches and
   links—not only the body.
   Reuse D26 source commands, durable identity and current result authorization;
   do not copy its facts into a competing event store.
5. **R05 — Clear minimal UI:** use the compact recorded-exchange/outreach/follow-up
   distinction, readable source explanations, one source-backed entry and existing
   correction. Reuse identity details and show only needed fields. No mandatory
   meaningfulness checkbox, approval or donor-facing flow is introduced.
6. **R06 — Honest states and recovery:** distinguish empty permitted history,
   incomplete/undated coverage, loading, unavailable, saved, pending and unknown
   results without leaking hidden facts. Preserve permitted draft context and
   reconcile the same save intent before creating another one.
7. **R07 — Inclusive delivery:** verify Core shared UI with keyboard, screen reader,
   mobile touch/keyboard, 320 CSS pixel reflow/zoom, contrast, RTL, long names,
   localized dates, timezone travel and low-bandwidth behavior in the actual flow.
8. **R08 — Dignity and independence:** preserve voluntary missionary participation
   and useful one-way care. Neither absent reply nor older recency implies poor
   performance, a task, contact permission, stage change or a reopened partnership.
   Existing real obligations keep their independent source meaning.

## Acceptance and implementation order

| ID       | Independently testable outcome                                                                                                                                                                                                                                       |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AC01** | Sending a personal email updates permitted outreach only. A subsequent qualified human exchange updates exchange recency using occurrence time; delivery/open signals do not.                                                                                        |
| **AC02** | A thank-you needing no answer has no inferred pending-response/overdue warning; a genuine brief reply or decline is not rejected for length, sentiment or lack of money.                                                                                             |
| **AC03** | A qualified human inbound can count without a stored prior outbound. Automated/uncertain reply events and generic activity completion cannot manufacture human exchange.                                                                                             |
| **AC04** | Call attempts, voicemail left, booked/cancelled/no-show meetings and passive attendance do not count without actual exchange evidence. A truthful manually recorded conversation does.                                                                               |
| **AC05** | Record once and view the permitted source on staff and missionary surfaces; two narratives, duplicate transport, imports, edits and shares do not create extra encounters.                                                                                           |
| **AC06** | Backdated, date-only, unknown-date and timezone-travel cases keep actual precision. Unknown dates do not become save time, epoch, a definitive latest date or reliable aging; future plans or invalid future-completed dates do not become actual contact.           |
| **AC07** | The qualifying latest exchange outside the first 50 display rows is still found. Correct/restrict/merge the newest record and derive the truthful earlier/unknown result without a stale permanent maximum.                                                          |
| **AC08** | Cross-tenant IDs, church-affiliation-only links, different ministry purposes and merely selected participants cannot update another partnership or reveal protected date/source/count information.                                                                   |
| **AC09** | Source-body expiry retains only separately qualified permitted facts; source revocation blocks unauthorized derivatives/results. Neither copied bodies nor access to a church bypasses the source boundary.                                                          |
| **AC10** | A missionary can decline to log without losing ordinary use or receiving a score/penalty. New contact does not reopen paused/closed work or invent a next task; consent and actual obligations remain intact.                                                        |
| **AC11** | A user identifies what exchange and outreach dates mean, finds their source and corrects a mistaken occurrence without a second logging step, transcript, address form or meaningfulness checkbox.                                                                   |
| **AC12** | Empty, filtered, incomplete, undated, loading and unavailable views are distinct and do not imply Never contacted or reveal private event existence.                                                                                                                 |
| **AC13** | Slow/dropped saves, context switches and late results preserve permitted drafts and one accepted effect; no silent offline publication, duplicate encounter or incorrect success message.                                                                            |
| **AC14** | Actual keyboard/screen-reader/touch/mobile-keyboard, light/dark contrast, reflow/zoom and RTL tests preserve source links, instructions, focus and status. Long/multiscript names and localized dates remain understandable.                                         |
| **AC15** | Donor checkout, account and public surfaces acquire no field, step or internal recency exposure. No new contact is triggered merely by an older exchange date or missing reply.                                                                                      |
| **AC16** | Representative staff and missionaries can distinguish sent outreach, real exchange, unknown coverage and an agreed future follow-up without coaching. Any unsafe confusion blocks rollout expansion until corrected and retested. No results are claimed in advance. |

First carry the selected meaning and R01–R08/AC01–AC16 through /to-prd into the
qualified source/consumer contracts. Then qualify actual event outcomes, complete
current-authority projections and correction/replay behavior. Compose the small
shared UI and prove the real interaction with assistive technology and intended
users before enabling it. Later /to-issues publishes traceable implementation work;
neither command has been invoked here. A new generic event engine, mandatory
reporting feature or broad settings screen is unnecessary.

Documentation review and scenario analysis are complete; implementation tests and
user evaluation are specified, not claimed executed. No prior experiment was
rerun. The [independent review](d27-evidence/independent-review.md) challenges the
integrated result, and [document checks](d27-evidence/review-checks.json) verify
source preservation, links and synchronized decision meaning.

## Adversarial check

### What could go wrong with this answer?

A narrow metric could hide useful outreach or be mistaken for neglect. Misleading
source/date fallbacks could fabricate a conversation. The separate visible facts,
voluntary participation, exact outcomes and honest coverage prevent those shortcuts.

### What hidden assumptions are we making?

We have selected a product meaning, not discovered a universal CRM standard.
Whether the proposed labels and compact layout are immediately understood by
missionaries and staff needs actual observation. Source APIs and permissions
must be qualified; current activity screens are not that proof.

### How does this affect the whole product?

P27 gains a clear derived meaning shared through qualified projections. P9's
generic last touch, P6/17 communications, P26 privacy and D26 autonomy keep their
owners. Donor/public/giving flows gain no extra work or internal disclosure.

### How does this affect the end-user experience?

Users can see a real exchange, recent outreach and their existing follow-up at a
glance. They record an interaction once and can correct it. One-way care remains
visible and valued without a false reply requirement or pressure to log activity.

### Does this follow modern best practices?

It follows outcome separation, accurate labels, minimal entry, visible state and
accessible inclusive controls. It deliberately differs from broad Last contacted
conventions where the chosen product meaning differs. Published examples support
that distinction; they do not prove usability or justify importing coercive metrics.

### Does this fit Asym’s existing repo and product direction?

Yes. The original brief asks for this distinction and D26 reserves it. The current
updated-at field, capped timeline and save-time/epoch fallbacks must not become
the new measure. Use existing source ownership and shared UI rather than preserving
those weaknesses or introducing a second CRM.

### Should we adjust the recommendation?

**Accept A with the clarifying safeguards above.** Retain the user's choice and
make its labels, evidence and recovery precise. No additional micro-question or
repeat ratification is required for these ordinary design details.

## Explicit ratification

2026-10-11, Asia/Bangkok. The founder explicitly ratified amended D27 and
instructed the Phase 27 interview to continue. The recorded decision, R01–R08,
AC01–AC16, source boundaries, missionary autonomy and researched UX treatment
remain unchanged. The original research appendices and document-check report are
preserved as dated evidence. Ratification does not claim implementation, actual
source qualification or observed usability. No runtime experiment is rerun.

[Q28](phase27-q28-relationship-attention.md) continues with the substantive
relationship-attention approach. The
[ratification/continuation checks](d27-ratification-q28-validation.json) verify
exact decision preservation and the unanswered next question.
