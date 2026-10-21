# D32 — Gift and fulfilled-commitment follow-up: UX and primary research

Research checked **October 18, 2026 UTC**. The founder selected A: compatible
gift and commitment-fulfillment work may be handled in one follow-up, while each
purpose retains its own evidence and handling record. The founder also requested
tenant choice and subsequently explicitly chose **one organization-wide setting**;
see [scope clarification](scope-clarification.md). The proposed **Together /
Separately** presentation preserves that choice; other detailed amendments remain
unratified.

This note proposes the complete UX and records bounded evidence. It does not
ratify new amendments, implement task composition, claim a user study, or change
earlier evidence. Source completion, shared human handling and actual interaction
remain distinct.

## Fresh primary evidence and limits

These pages were directly opened for D32 on October 18. Relative update labels
are reproduced as displayed; no exact publication date is invented. Public
documentation establishes documented behavior, not an authenticated product test
or proof that Core's proposed combination improves satisfaction or fundraising.

| Primary source and date                                                                                                                                               | Verified observation                                                                                                                                                                    | Useful lesson and boundary                                                                                                                                                                                           |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Givebutter: Manage pledges](https://help.givebutter.com/en/articles/9708715-how-to-manage-pledges), displays “Updated over 2 weeks ago”                              | It distinguishes pledge total, installments, payments and a fulfilled status for the total commitment.                                                                                  | Keep the milestone distinguishable from a payment or installment. Do not import its payment linking, cancellation semantics, reminders or permissions over P16. This source was also cited in Q32 and was reopened.  |
| [Givebutter: Tasks](https://help.givebutter.com/en/articles/9703441-how-to-manage-your-fundraising-to-do-list-with-tasks), displays “Updated over a week ago”         | Tasks can link related records, use optional descriptions and deadlines, and be completed from the ordinary list. Its documented staff audience is broad and assignment can send email. | Related information can live in the normal task surface. Linking does not establish joint coverage; broad visibility, assignment emails and unrestricted reopening are not imported. Reopened from Q32.              |
| [Givebutter: Contact activities](https://help.givebutter.com/en/articles/5526927-how-to-track-log-and-import-contact-activities), displays “Updated over 2 weeks ago” | The feed distinguishes transaction, communication and task events; manual activities can record interactions performed outside the platform.                                            | Preserve event meaning and allow deliberate recording of an actual outside interaction. Do not treat a completed task or donation as a conversation, or copy the vendor's editing/retention permissions.             |
| [HubSpot: Complete tasks](https://knowledge.hubspot.com/tasks/complete-tasks), updated October 13, 2026                                                               | It distinguishes sending from sending-and-completing, permits skipping while leaving a task incomplete, and exposes rescheduling during a task flow.                                    | Separate a real communication from task disposition and keep unfinished work available. Core does not inherit automatic completion, bulk select-all, AI task handling or subscription requirements.                  |
| [Asana: Multi-home tasks](https://help.asana.com/s/article/multi-home-tasks-to-avoid-information-silos?language=en_US), undated current help page                     | One task can appear in multiple projects with synchronized assignee, due date and description. The page expressly describes one task, not two copies.                                   | Avoid duplicated editable work. This is not evidence that distinct source purposes should share one completion flag or permissions; Core must preserve independent meaning and coverage.                             |
| [GOV.UK: Radios](https://design-system.service.gov.uk/components/radios/), undated current guidance                                                                   | Radios support one mutually exclusive choice, with a grouped label and concise option hints. Guidance warns against preselecting an unanswered form question.                           | Two named modes are clearer than an ambiguous Off switch. Use Maia controls, not GOV.UK styling. Editing an existing saved policy must show its actual current value; that is not silently answering a new question. |
| [W3C APG: Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/), undated current guidance                                                                 | Disclosure controls have button semantics, keyboard activation and programmatically exposed expanded state.                                                                             | Put optional evidence detail and the less common partial-handling route behind clear controls. Essential purpose/action scope must remain visible. No hand-built ARIA substitute for shared primitives.              |
| [W3C: Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), current explanatory guidance                                                | Material status updates can be conveyed without moving focus.                                                                                                                           | Announce accepted handling, remaining work and refresh needs, without a focus jump or notification for every background regrouping. This is not tested conformance.                                                  |
| [W3C: Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), current explanatory guidance                                                                  | Vertical content reflows at a width equivalent to 320 CSS pixels without information/function loss, subject to defined exceptions.                                                      | Stack the two purpose sections on a phone. A wide financial table is unnecessary to review this work.                                                                                                                |

No opened source proves Core's exact gift-plus-fulfillment shared-coverage
contract. The recommendation is a product judgment: reduce repeated handling
while retaining exact outcomes. The strongest alternative remains separate
follow-ups, which makes independent lifecycles obvious and costs another task
disposition. Separate tasks do not require two donor messages. Neither option
has a measured superiority claim in this review.

## Governing repository facts

- The [founder brief](../phase28-founder-brief.md:165) requires qualified native
  gift and fulfillment stewardship. Selecting **Separately** must not disable
  either producer or erase eligible work.
- [Q32](../phase28-q32-gift-and-fulfillment-follow-up-research.md:9) uses an exact
  received final gift that independently qualifies for gift follow-up and
  completes a fixed commitment. It is an illustrative scenario, not evidence
  that today's application produces both purposes correctly.
- [D20-C01](../phase28-d20-grouped-special-gift-follow-up-adversarial-review.md:177)
  keeps fulfillment distinct until its owner qualifies shared handling.
  [C02–C04](../phase28-d20-grouped-special-gift-follow-up-adversarial-review.md:184)
  require compatible tenant, typed subject, Legal Entity, Party, responsibility,
  completion authority and independent source evidence. Similar names or dates
  do not suffice.
- [D20's ordinary journey](../phase28-d20-grouped-special-gift-follow-up-adversarial-review.md:116)
  establishes a stable reviewed set, one ordinary finish action, truthful
  residual work, conditional Undo and no automatic interaction/send.
  [Its shared-action boundary](../phase28-d20-grouped-special-gift-follow-up-adversarial-review.md:483)
  requires explicit qualified evidence for one real interaction to cover
  compatible obligations.
- [ADR0183](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:622)
  makes completion authority a code-owned contract. A tenant presentation choice
  cannot redefine financial fulfillment or mark unrelated source work complete.
- [P16 F.1–F.7](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:961)
  own received money and fulfillment applications separately; [M.2–M.3](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:1378)
  distinguish actual fulfillment from changed terms/resolution. Task completion
  cannot supply a missing milestone or stop a recurring instruction.
- [The current manual task endpoint](../../../../../packages/api/src/missionary-portal/tasks.ts:81),
  [generic task row](../../../../../packages/missionary/components/task-row.tsx:233)
  and [complete/reopen handler](../../../../../apps/missionary/app/tasks/page-client.tsx:842)
  are reusable surface context, not proof of qualified joint coverage or partial
  handling. Existing code is not accepted as correct business behavior merely
  because it is present.
- [Shared UI authority](../../../../../packages/ui/AGENTS.md:5), [configuration](../../../../../packages/ui/components.json:3)
  and [frontend rules](../../../../ai/rules/frontend.md:14) require `base-maia`,
  Base UI, semantic tokens and shared `@asym/ui` components. No new design
  system, app-local primitive or separate thank-you inbox is needed.
- [Accessibility review](../../../../ai/skills/accessibility-review/SKILL.md:1)
  and [testing rules](../../../../ai/rules/testing.md:20) require real keyboard,
  focus and user-flow proof for implementation. This note establishes none of
  that runtime evidence.

## Recommended organization setting and changes over time

Prefer two explicit radio options in existing stewardship settings:

> **Gift and commitment follow-up**
>
> **Together** — Show compatible unfinished work in one follow-up.
>
> **Separately** — Keep gift and commitment-fulfillment follow-ups separate.
>
> Both kinds of follow-up remain available. This changes how unfinished work is
> organized; it does not send messages or change giving records.

The selected scope is one organization-wide saved value, with no missionary or
project exceptions. No per-donor, currency or arbitrary-rule overrides are proposed. A default of Together is consistent with selected A but must be
recorded as a proposed initial policy, not inferred from a guessed prior value.
Missing, loading and setup-error states must not render as Separately or as a
successful save. Preserve current saved value and authorized unsaved selection
on a concurrent-edit conflict; resolve a lost response by the durable result.

Use one **Save** action with concise inline consequences. No second approval,
typed confirmation, task-by-task staff review or preview containing donor data
is necessary. Any governing activation/authorization boundary still applies;
an attractive setting is not the authority to change composition.

**Recommended temporal behavior:** safely recompose currently unhandled,
compatible purpose memberships under the current saved mode, preserving their
source identity, evidence, handled coverage and human work. Keep the canonical
D20 gift-group anchor. Together may attach eligible unhandled fulfillment work;
Separately restores that work to its qualified ordinary fulfillment task. Do not
split gift members into duplicate gift tasks or copy a mutable completion flag.

Suggested effect copy:

> Changes how unfinished follow-ups are organized. Completed history stays
> unchanged.

This recommendation is stronger than “new task rows only”: an indefinitely open
D20 gift group can keep accepting new gifts, so task-row creation is an unreliable
boundary for a supposed future-only setting. Avoid hidden policy epochs in the
user journey. If the owner instead chooses prospective-only composition, it must
define new-purpose admission coherently and state exactly what remains unchanged;
do not make an indefinite old-group exception invisible.

During bounded regrouping, show **Updating follow-up organization** only where
needed. Current policy must govern joint handling even before projection catches
up; a stale combined screen cannot accept a now-forbidden combined action.
Unchanged permitted single-purpose work should remain usable. Empty superseded
wrappers are not Done; prior links should preserve authorized history and guide
the user to current placement without a dead end or duplicate task.

Recomposition must preserve existing notes, dates, drafts and links with their
owners and audience. Do not copy private fulfillment notes into a broader gift
task, reset a due date to today, or resend task-assignment/communication events
merely because organization changed. Existing calendar and coaching projections
retain their own explicit access/selection boundaries; regrouping does not
authorize new exported descriptions or new coaching detail.

## Maya's complete journey

### Review two purposes without duplicate bookkeeping

Maya opens her ordinary list. A compatible combined task can read:

```text
Follow up with Grace
Maya's ministry · Gift and commitment follow-up

Gift follow-up
18 Oct 2026 · USD 100.00
Meets the organization's gift amount rule

Commitment fulfilled
Building fund commitment · Fulfilled 18 Oct 2026
Personal follow-up: To do

[Finish both]   [Choose what to finish]
Record an interaction…

Finishing handles the reviewed follow-ups. It does not send a message.
```

Names, labels, dates and money are illustrative, supplied only by current safe
projections. The gift's own reason must genuinely qualify; the fulfillment
milestone does not manufacture a special-gift reason. The milestone's financial
status and the human follow-up status have separate labels. **Finish both** must
not be labeled **Fulfill commitment**, which would imply a financial command.

Keep money secondary. Do not add the final gift amount to the total pledge and
present it as new money. The commitment reference identifies the exact permitted
scope, not every commitment of the supporter. Show source detail through an
optional existing link/disclosure; Maya need not review a ledger or re-confirm
financial proof to finish the human work.

When both reviewed purposes are handled, one accepted action creates the two
distinct purpose outcomes. No mandatory per-purpose checkbox, essay, interaction
record or additional confirmation dialog is needed in the ordinary case.
Suggested success copy:

> Gift and commitment follow-up finished.

Only show that result after the authoritative command accepts the exact reviewed
purposes. Never report both finished after only one purpose succeeded. Cross-owner
partial failure must recover the accepted outcome through the qualified task
contract; it must not become user-driven duplicate retries.

### Finish only what was actually handled

**Choose what to finish** is a secondary, accessible route. It expands the exact
currently reviewed purpose choices and changes the submit label to **Finish
selected follow-up** or the correct plural. For this two-purpose case, Maya can
select gift follow-up, commitment-fulfillment follow-up, or both. Do not silently
preselect an unseen purpose in this partial-handling route. Reuse the D20 reviewed
gift set within the gift purpose; this does not create an unrelated batch editor.

If only the gift thanks were handled, show:

> Gift follow-up finished. Commitment follow-up remains.

Keep the remaining purpose visible in the ordinary task surface with its
applicable due state. Do not show All caught up, close then resurrect the card,
or require Maya to recreate the remainder. If no authorized actionable residue
remains, remove the user's queue projection without exposing a hidden remaining
purpose/count or falsely claiming all underlying work is complete.

**Not needed** follows the same explicit reviewed scope and records that outcome,
not a completed interaction. A mistaken outcome uses the existing qualified
correction/Undo path; it does not delete a real message, erase source facts or
reopen every linked undertaking.

### New purpose or changed source while the detail is open

A newly arriving purpose never joins an already reviewed finish action silently.
Use a quiet **New follow-up is available to review** control, without changing
the primary action's scope, moving focus or altering a draft message. Maya can
finish the unchanged reviewed work and then review the remainder.

If the source changes a reviewed purpose materially, or its authority no longer
holds, refresh that affected review before accepting its completion. Example:

> This follow-up changed. Review the current details before finishing.

Do not expose a hidden source correction to explain the refresh. Preserve only
currently authorized drafts/context. A changed fulfillment proof need not erase
a genuine gift reason or an actual interaction. When fulfillment is withdrawn,
its unstarted human purpose follows the owner-defined end behavior while gift
work remains independently eligible. Source unavailable is different from
withdrawn; show uncertainty instead of a fabricated negative fact.

When gift thanks were finished before fulfillment arrived, do not pretend the
earlier action covered an unseen milestone. Present the remaining fulfillment
work normally. Maya can record an eligible reviewed outcome based on what she
actually did under the owner's existing rules; D32 does not force another donor
message or invent an automatic retrospective shared-coverage rule.

### Due dates and planning stay trustworthy

Grouping must not postpone earlier work. Recommended summary: **Next due** shows
the earliest existing due among currently actionable, authorized unhandled
purposes. If their dates differ, keep each date in its purpose section. If no
due date exists, show no invented deadline or overdue state. This is a proposed
presentation rule, requiring the task owner's exact date/authority contract.

Finishing one purpose recomputes the remaining work's due summary; it does not
silently extend that purpose. Together/Separately must preserve each underlying
work item's existing planning and required dates. A personal reschedule changes
only the authorized work scope identified by that control, never the financial
commitment's due/fulfilled date. Do not copy one outer-task date over every
purpose or lose an earlier manual date during a split. Where no safe date/context
composition is qualified, preserve separate eligible work instead of flattening
conflicting obligations.

## Staff, donor and separate-mode journeys

Staff can explain why two rows became one or one became two without reading a
policy-generation log. They see the saved mode and accurate effect text, and
can inspect authorized history when diagnosing a change. They must not create
a fake gift, edit a commitment or approve both purposes again to achieve grouping.

Grace's ordinary giving and receipt journey remains unchanged. A shared
follow-up does not send anything, cancel a recurring instruction, change contact
consent, suggest another donation or count as two conversations. If Maya records
one actual interaction, it remains one interaction; eligible purpose coverage
references it rather than duplicating it. Merely completing both follow-ups
does not prove that an interaction occurred.

In Separately mode, each purpose remains visible in its ordinary qualified task.
The labels distinguish **Gift follow-up** from **Commitment follow-up**. One
communication may address both in real life, but each task's recorded coverage
must be deliberate. Separate presentation is not a request to contact Grace
twice. Source corrections and already-handled coverage remain identical under
both modes.

## Accessibility, mobile and low bandwidth

Use shared Maia fieldsets/radios, button/disclosure primitives and the existing
task surface. Two short labeled purpose sections are more useful than tabs that
hide the second purpose or a financial grid with an unlabeled completion box.
Essential purpose names and finish scope remain visible; optional evidence can
be collapsed. Do not rely on hover, color or a small icon to explain what will
be handled.

Preserve logical focus/reading order, announce accepted success and remaining
work once, and expose expanded/selected states programmatically. On phones,
stack sections and controls; a sticky action must not cover focused fields or
hide the reviewed count. Verify 320 CSS-pixel reflow, zoom, keyboard navigation,
screen-reader pluralization and existing touch targets. Long international names,
translated labels, bidirectional text, exact currency and source-defined dates
must remain readable. Do not invent date precision or financial periods from
the browser's local clock.

A failed second section load is not permission to finish “both” based on the
first section. Show an incomplete review and retain permitted already-loaded
context. Lost completion response shows **We couldn't confirm the update.
Checking…** and recovers the original result; it must not tell Maya to repeat the
human action. Partial-choice drafts and message drafts survive recoverable
failures only while their contents remain authorized. This feature does not
need a new offline sync engine or global real-time task feed.

## Material concerns and exact prevention language

Likelihood is reasoned exposure without safeguards, not measured incident rate.
The findings narrow A's implementation; they do not replace it with permanent
manual duplicate work.

| Concern; severity / likelihood                                                  | What could go wrong and evidence                                                                                                       | Exact proposed requirement/fix                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Combining rows merges independent meaning; High / High                          | A generic task completion flag may close financial fulfillment, receipts or an unrelated promise. D20/ADR0183 prohibit that inference. | **Combination SHALL preserve source-purpose identities and qualified completion authority; one action SHALL record distinct outcomes only for its exact reviewed eligible purposes.**                                                       |
| Off disables stewardship; High / High                                           | A bare toggle can be read or implemented as canceling fulfillment. Both native purposes remain required.                               | **Use Together/Separately; Separately SHALL change composition only, never purpose eligibility, permanent coverage, financial truth or communication permission.**                                                                          |
| Future-only setting is ineffective on an indefinitely open group; Medium / High | A D20 task may accept new members without creating a new row. Task-row date is not a coherent current-policy boundary.                 | **The composition contract SHALL explicitly govern current unhandled membership and new admission. Recommended bounded recomposition SHALL preserve purpose identity/history and fence stale joint acceptance; no hidden policy-epoch UX.** |
| Joint finish forces a false claim; High / High                                  | Maya may have thanked for the gift without addressing fulfillment. A single compulsory checkbox loses real residue.                    | **The ordinary both-case SHALL require one deliberate action; a secondary route SHALL handle selected reviewed purposes only and retain remaining work visibly without another donor message requirement.**                                 |
| New/changed purpose sneaks into a finish; High / High                           | Async source results or policy changes can expand unseen scope.                                                                        | **New unrelated purposes SHALL remain outside the reviewed set; material changes to reviewed evidence/authority SHALL refresh affected handling before acceptance. Unchanged permitted work SHALL not be needlessly blocked.**              |
| Regrouping loses due dates or private notes; High / Medium                      | Asana's single shared due-date model does not prove Core can flatten distinct work. A split can drop manual planning or leak notes.    | **Composition SHALL preserve owner-qualified dates, notes, links and audience. The UI SHALL not postpone earlier work, copy hidden context or mark an empty superseded wrapper Done.**                                                      |
| Financial and human status labels are confused; High / High                     | “Complete commitment” suggests that clicking finishes the money obligation; final payment and fulfillment differ.                      | **Show source milestone and personal-follow-up status separately. Handling controls SHALL never claim to fulfill, receive, apply or correct money.**                                                                                        |
| Duplicate communication or fabricated interaction; High / Medium                | Comparable CRM task/activity flows support distinct events, but generic automation can conflate them.                                  | **Sending and actual interaction recording SHALL remain deliberate owner actions; shared handling SHALL not send, create a conversation or duplicate one interaction per purpose.**                                                         |
| Partial visibility falsely means all work complete; Critical / Medium           | One purpose may be hidden or later revoked. Cosmetic omission cannot justify complete-all or expose hidden counts.                     | **All action scopes and result copy SHALL reflect current authorized reviewed purposes; hidden residue SHALL not be disclosed or silently consumed.**                                                                                       |
| Mobile/network failure becomes false success; High / Medium                     | One source section may fail to load or a successful command response may be lost.                                                      | **An incomplete review SHALL not enable an unseen-purpose finish; semantic retries SHALL recover the original outcome, with accessible truthful progress, residue and error states.**                                                       |

## Proof and residual monitoring

Required implementation scenarios include: both eligible purposes together;
each purpose alone; gift handled first; fulfillment handled first; unrelated
new purpose during review; corrected fulfillment with valid gift retained;
one purpose hidden/revoked; no authorized residue; duplicate delivery; lost
response after joint acceptance; interrupted regrouping; and repeated
Together/Separately changes without new work, duplicate reminders or lost notes.

Test the actual due-date cases: equal dates, earlier fulfillment date, earlier
gift date, no date, one purpose finished, and a manual reschedule before and after
regrouping. Validate old links/history and any existing calendar/coaching
projections without expanding disclosure. No synthetic model can prove those
UI, storage, provider or authorization outcomes by itself.

Before release, use representative staff/missionary scenarios to verify that
people understand both purposes, can finish only one without lying about the
other, distinguish financial fulfillment from human follow-up, and know that
Separate does not cancel work or require two messages. Include phone, keyboard,
screen reader and poor-connection paths. No such feedback or measured
completion rate is claimed here.

Proposed operational controls: the P28 product/UX owner treats **any observed
material misunderstanding of handled scope, sending or financial fulfillment**
as a pre-release blocker and corrects/retests that surface. The P9/P28 work owner
treats **one confirmed lost purpose, duplicate handling, postponed required date
or disclosure violation** as an immediate correctness incident: stop affected
composition/acceptance, preserve minimal evidence and repair through source-owned
identities. Correct-but-confusing grouping feedback triggers user-flow review,
not weakening source/privacy safeguards or adding a general rule builder.
