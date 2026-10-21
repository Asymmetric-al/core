# D33 — Missionary gift reporting: UX and primary research

Research checked **October 18, 2026 UTC**. The founder selected **A — Optional
missionary reporting**, with organization control and **Off by default**. This
note evaluates that selected direction and proposes its full journey. Detailed
amendments below are recommendations for the D33 review, not a claim of separate
ratification or an implemented report product.

The central UX rule is simple: Maya reports an actual receipt for finance; finance
continues the same intake. The report, remaining physical handling and financial
recording have different meanings. The interface must make the next action clear
without making Maya operate the finance workbench.

## Fresh official evidence and its limits

All pages below were directly opened for this review on October 18. An old or
undated public manual is not evidence of a new release. Relative update labels
are preserved as displayed. These are documented product behaviors and standards
guidance, not authenticated interaction tests, ministry interviews or measured
improvements in conversion, fundraising, speed or satisfaction.

| Source and displayed date                                                                                                                                                                                              | Verified observation                                                                                                                                                                                                 | Applicable lesson; boundary not imported                                                                                                                                                                                                                                                                                         |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [TntConnect: Dealing with gifts](https://www.tntware.com/tntconnect/help/en/pages/gifts_dealingwith.aspx), undated                                                                                                     | Describes a missionary recording a gift received directly before forwarding it to the organization, and problems reconciling that local entry with later organization processing.                                    | Direct receipt followed by organizational handling is a documented missionary workflow. Reuse one Core intake rather than the manual local-money and matching/deletion workarounds in this manual. Its gift-purpose heuristics, personal-gift handling and zero-value noncash suggestions do not govern Core. Reopened from Q33. |
| [MPDX: Flows view for appeals](https://help.mpdx.org/article/774-flows-view-for-appeals), updated October 13, 2022                                                                                                     | Distinguishes gifts held by the missionary from gifts processed by the donation system, and asks for the particular processed gift when several exist.                                                               | Keep reported receipt separate from organizational processing and preserve item-specific lineage. Do not copy a supporter-wide exclusive board state, amount editing or drag as financial evidence. This is dated workflow evidence, not a recent product announcement.                                                          |
| [Givebutter: Add and manage offline transactions](https://help.givebutter.com/en/articles/2705864-how-to-add-and-manage-offline-transactions), displays “Updated over 2 weeks ago”                                     | Admins/editors can enter an offline transaction from a transaction list or contact. Saving can affect campaign totals; receipt sending is a separate option.                                                         | Contextual entry avoids finding the same contact again. Core must deliberately differ: a missionary report creates neither recorded support nor receipt authority. Do not copy public-feed fields, mandatory campaign, zero-value noncash or delete-and-reenter correction. Reopened from Q33.                                   |
| [Donorbox: Add offline donations](https://donorbox.zendesk.com/hc/en-us/articles/360020294172-How-can-I-add-offline-donations-cash-checks-or-credit-cards-processed-by-other-sources), updated October 11, 2026, 01:03 | Entry is available from the donation list and individual/organization profile; the profile path avoids another search. Donation creation can include a receipt, and an omitted campaign receives a default campaign. | Reuse authorized context and distinguish people from organizations. Do not import automatic campaign attribution, donor creation or receipt generation into a report-only action.                                                                                                                                                |
| [Blackbaud RE NXT: Manage gift batches](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-gifts-batch.html), undated                                                                           | Batches can be saved and resumed; approval and creation/posting of financial records have distinct documented stages.                                                                                                | Durable prepared work is not the same as a recorded financial result. This does not require a second approver for Maya's report or alter P15's ratified commit rules. Reopened from Q33.                                                                                                                                         |
| [GOV.UK: Question pages](https://design-system.service.gov.uk/patterns/question-pages/), undated current guidance                                                                                                      | Recommends asking only necessary information, permitting unknown answers where valid, identifying optional fields and not asking users to re-enter information already supplied.                                     | Apply those principles to one short source-qualified report. Its starting recommendation of one question per page is not a mandate to introduce a multi-page wizard into Core's short ordinary form. No GOV.UK component/style import.                                                                                           |
| [GOV.UK: Dates](https://design-system.service.gov.uk/patterns/dates/), undated current guidance                                                                                                                        | Supports approximate dates where exact recall is unreasonable and says a calendar should not be the only entry method.                                                                                               | Preserve source-qualified occurrence precision and a usable text-entry route. Do not manufacture an exact timestamp, tax date or timezone from the browser.                                                                                                                                                                      |
| [GOV.UK: Confirmation pages](https://design-system.service.gov.uk/patterns/confirmation-pages/), undated current guidance                                                                                              | A confirmation should explain the accepted result and what happens next; returning to a saved confirmation should remain useful.                                                                                     | Show accepted report identity, current status and permitted next action. A report is one part of a larger journey; no automatic PDF export, email, separate full-screen success ceremony or unproved finance SLA is required.                                                                                                    |
| [W3C: Error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html), current WCAG 2.2 explanatory guidance                                                                              | Detected input errors must identify the affected item and describe the problem in text.                                                                                                                              | Put a useful error beside the field and provide the shared form's summary/focus behavior. Red borders and a disappearing toast are insufficient.                                                                                                                                                                                 |
| [W3C: Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), current WCAG 2.2 explanatory guidance                                                                                        | Material status messages can be exposed to assistive technology without moving focus.                                                                                                                                | Announce accepted submission, unresolved save and refreshed status without repeatedly interrupting the user. This source is not proof of Core conformance.                                                                                                                                                                       |
| [W3C: Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), current WCAG 2.2 explanatory guidance                                                                                                          | Vertical content must retain information and function at a width equivalent to 320 CSS pixels, subject to defined exceptions.                                                                                        | The short report and its status must work as a single column; no wide finance grid is necessary.                                                                                                                                                                                                                                 |

The strongest simpler alternative remains staff-entered reporting: fewer reporting
actors and no missionary entry form, at the cost of another human handoff. The
selected A is a reasonable product judgment because the user holding the item can
capture the actual event where permitted. The sources establish that this job
exists; they do not prove every ministry should enable it. Off by default and an
ordinary staff path preserve that choice without two intake systems.

## Repository facts and authority

- The [founder brief](../phase28-founder-brief.md:175) requires actual offline
  gifts awaiting finance and incomplete attribution, while reserving reported
  intake to P15 and posted money/receipts to their owners. Its [daily-work
  direction](../phase28-founder-brief.md:119) requires phone-friendly, recoverable
  work with reasons, responsible actors and truthful completion.
- [Q33's original choice](../phase28-q33-missionary-offline-gift-report-research.md:11)
  contrasts optional missionary reporting with staff entry. Its original
  unanswered wording is historical question provenance; the founder's subsequent
  A answer controls this review.
- [P15's solution](../../../../prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md:55)
  gives offline money one batch commit path and separates quick entry from the
  workbench experience. The PRD's [status](../../../../prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md:3)
  is groomed-not-built; its documented intended behavior is not a runtime claim.
- [P27's exact P15 extension](../../../../prds/sitestacker-parity/phase-27-donor-development/requests.md:75)
  already defines attributed actual receipt, honest incomplete facts, one intake,
  independent handling/recording and current source-owned recovery. It expressly
  rejects routine photographs, signatures and extra approval.
- [REQ27-F56–F64](../../../../prds/sitestacker-parity/phase-27-donor-development/requests.md:569)
  separate reporter, reported holder and accountable next actor; report/read/
  correct/route powers are distinct from finance. Source-authorized correction
  preserves history; matching names, amounts, dates or check numbers do not prove
  that two reports refer to one item.
- [REQ27-F65–F72](../../../../prds/sitestacker-parity/phase-27-donor-development/requests.md:623)
  require native shared work, honest money, minimal data, safe recovery and owner
  qualification. Pending reports cannot enter financial, public-progress or
  fulfillment totals. Reporting is not a new stage for every online gift.
- [P27's shared interface contract](../../../../prds/sitestacker-parity/phase-27-donor-development/requests.md:103)
  already requires brief forms, one ordinary deliberate save, honest asynchronous
  states, no sensitive persistent browser draft and a small phone-usable intake
  view. Its staff scope does not itself grant missionary authority; D33 supplies
  the selected consumer direction subject to qualification.
- [Core UI authority](../../../../../packages/ui/AGENTS.md:5), [configuration](../../../../../packages/ui/components.json:3)
  and [frontend rules](../../../../ai/rules/frontend.md:14) require exact
  `base-maia`, Base UI, semantic Maia/Zinc tokens and shared `@asym/ui`. Shared
  [field primitives](../../../../../packages/ui/components/shadcn/field.tsx:1)
  already support ordinary form composition. No new design system, native app or
  copied vendor layout is needed.
- The [accessibility review workflow](../../../../ai/skills/accessibility-review/SKILL.md:1)
  and [testing rules](../../../../ai/rules/testing.md:20) require real browser,
  keyboard and focus verification for implementation. Reading those rules or
  reusing a primitive does not prove the composed flow accessible.

A fresh bounded static search of `apps/missionary/app`,
`packages/api/src/missionary-portal` and `packages/missionary` found offline
analytics and anonymity references, not a qualified gift-report entry or intake
service in those searched paths. This is not a repository-wide absence claim.
Existing chart handling is not a source for D33 financial totals. This review
neither implemented nor exercised a report, role, database policy or provider.

## Recommended staff setup and Off journey

Use one concise setting in the existing relevant organization settings surface:

> **Missionary gift reporting**
>
> Allow authorized missionaries to report gifts they actually receive for finance.
>
> **Off / On**
>
> Reports do not record donations or issue receipts.

Show the actual saved value and ordinary save feedback. Off is the selected
initial state. On is a policy ceiling, not a blanket grant to every person with a
missionary label. Reuse existing current permissions and source routing; do not
add a form builder, per-currency rules, per-gift approval matrix or a new roster
just to configure this doorway.

Before enabling, the source's required accountable handling/recovery route must
be qualified. Reuse its existing setup and permitted repair link. If unavailable,
show **“Gift reporting is not ready. Set up the finance intake route first.”**
only to an authorized administrator who can act on that setting. Do not make Maya
choose a finance employee or expose a staff directory to compensate for missing
configuration. Once enabled, a later routing problem follows the qualified owned
exception; it does not silently email everyone or lose accepted reports.

Turning Off stops new missionary report admission. Explain at save:

> **New missionary reports will stop. Existing reports and outstanding handling
> continue under their current permissions.**

It does not cancel accepted reports, release physical property, remove lawful
history, revoke all existing read rights or make finance start again. Permission
to view, correct or continue any accepted source occurrence remains independently
checked. Off cannot be used as a deletion or privacy-erasure shortcut.

When Off, do not show a disabled primary button throughout Maya's workspace.
Where a gift-report entry link or prior route is reached, a short explanation and
the organization's already qualified staff contact/handling instruction suffice:
**“Your organization handles gift reports through staff.”** If no permitted
contact can be named, use the existing general organization support route, without
inventing a recipient or implying a report was submitted. Historical accessible
reports remain useful independently of whether creation is On.

## Maya's ordinary report journey

1. **Start in context.** A permitted ministry/project or existing contact/request
   surface offers **“Report a gift for finance.”** The same action opens the same
   source flow; there is no second local report. Keep organization and ministry
   context visible, especially for users with several assignments. An existing
   selected contact is useful context, not proof of legal donor identity.
2. **Explain the action once.** Use **“Record what you actually received. Finance
   will review and record the gift.”** Explain current source-approved audience
   in plain language near the form. Do not call this private preparation or imply
   only Maya and one named finance user can ever read it.
3. **Capture the actual facts in one short form.** Display source-known context;
   request only the minimum qualified report evidence. Accept source-supported
   unknowns instead of making Maya create a donor, invent a currency or guess a
   date. Keep less common details behind **“Additional details for finance
   (optional)”**, without hiding uncertainty or material handling responsibility.
4. **Submit deliberately once.** Use **“Submit report”**. Explain that this
   submits the attributed receipt report, not an email to the donor or a financial
   posting. A second confirm dialog, signature, mandatory essay or photograph is
   unnecessary for the ordinary source-qualified case.
5. **Show authoritative acceptance and the next step.** After success, show
   **“Report submitted”**, a stable reference, permitted current finance status
   and any source-required handling. Provide **“View report”** and return to the
   previous work context. Do not require users to copy details into another task.

Suggested field language is a UX proposal over P15's owner contract, not a new
parallel schema:

| Fact needed                                  | Plain presentation                                                                                                                                           | Integrity and friction boundary                                                                                                                                                                                                |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tenant and permitted ministry/source context | Existing organization/ministry header; context change only through an authorized choice                                                                      | Server derives tenancy and author. A ministry label is not a guessed payee/Legal Entity or a donor designation.                                                                                                                |
| What was actually received                   | **“What did you receive?”** with only source-supported item/tender choices                                                                                   | Cash/check can be straightforward. Do not introduce a comprehensive investment, inventory or valuation form; unsupported items follow the existing source route.                                                               |
| Known giver/donor detail                     | **“Donor, if known”**, authorized existing selection or qualified unresolved detail                                                                          | A bearer may differ from the donor. Unknown identity does not mean legally anonymous. Do not expose the whole CRM or force creating a Party, surname, email or postal address.                                                 |
| Known amount/currency                        | **“Amount, if known”** with explicit currency, or the supported unknown state                                                                                | Use exact supported precision, clear localized entry and a visible ISO currency code. Missing currency cannot default silently; unknown is not zero. Noncash is described through its qualified owner rather than valued here. |
| Actual occurrence                            | **“When did you receive it?”**; an explicit Today choice and source-supported approximate/unknown option                                                     | Do not silently turn the save date into receipt date. Preserve date precision and business meaning; no mandatory exact time or tax-year question.                                                                              |
| Reported handling                            | Where source evidence needs it, **“Do you still have it?”** with qualified answers such as **“I still have it”**, **“I handed it over”**, **“I'm not sure”** | An actual prior receipt does not prove current possession. Do not ask for GPS, storage address or a chain-of-custody diary. Additional handoff evidence follows the qualified source action.                                   |
| Important unresolved detail                  | Optional concise source-approved detail, such as an unclear payee or mixed envelope                                                                          | Wrong payee and incomplete information use the restricted source exception; no silent reassignment to a guessed organization, upload requirement or raw bank fields.                                                           |

The form is allowed to be incomplete in the owner-defined ways; it is not allowed
to omit the actual receipt assertion, required source scope or accountable
recovery. A donor saying “I mailed it” remains a promise/outreach fact, not a
received-item report. The submission wording plus the explicit facts supplies
ordinary deliberate attestation; do not add an empty ceremonial checkbox.

One physical check with multiple intentions remains one intake. Maya need not
split it into reports to satisfy several appeals or ministry references. Two
actual checks remain distinct, even from the same person on the same day for the
same amount. Reporting from a Request must not force an appeal association;
reporting independently must not require a synthetic Request.

## Status that supports real next actions

Use a readable record summary with one primary next action. Under it, show the
independent facts that matter rather than a procession of finance workflow steps:

```text
Gift report                         Reference GR-…
Maya's ministry
Reported amount: USD 100.00          Check

Finance recording: Awaiting finance
Handling: Reported still with Maya

Next step: [source-approved current handling instruction]
Reported by Maya · 18 October 2026

View report details
```

Names, amounts, instruction and reference appear only when currently permitted.
The example is illustrative, not a fixed identifier format or a new status enum.
**Reported still with Maya** must retain the reported occurrence/currentness;
it does not claim verified continuous custody. Show a source-qualified handoff
action only to the actor who may perform it. Do not offer a generic Done checkbox
that claims financial recording or erases a remaining physical obligation.

| Actual condition                                       | Helpful current wording                                                       | What must not be implied                                                                                                 |
| ------------------------------------------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Accepted report; finance recording pending             | **“Report submitted. Awaiting finance.”**                                     | No posted contribution, receipt, deposit, completed reconciliation, donor message or financial progress.                 |
| Acceptance known; status projection unavailable        | **“Report submitted. Current status is unavailable.”**                        | A failed refresh does not undo the report; do not invite a new report to repair it.                                      |
| Finance recorded the exact item; transfer still needed | **“Recorded by finance”** and **“Handling still needed”**                     | Financial recording is not physical handover or clearance.                                                               |
| Qualified handoff recorded; finance has not recorded   | **“Handoff reported”** and **“Awaiting finance”**                             | Transfer does not post money. A reported handoff is not verified receipt by the next person unless that evidence exists. |
| Current source information needs resolution            | **“Needs review”**, plus the permitted responsible next action/reason         | Do not infer loss, fraud, rejection or failure from missing data.                                                        |
| Maya can read the report but not financial detail      | Show the separately permitted minimal recording outcome, if qualified         | No broken link into the staff finance workbench; possession/authorship grants no ledger access.                          |
| Selected receipt or handling fact corrected            | **“Report corrected”** with permitted history and the actual remaining action | Correction is not deletion, a refund or automatic undo of financial recording.                                           |
| Returned, lost, duplicate, rejected or mistaken        | The exact source-qualified disposition and remaining work                     | Do not coerce all exceptions to Done, or leave a resolved exception perpetually pending.                                 |
| Current access lost                                    | **“This report is no longer available in your current access.”**              | Do not show hidden details, cached totals or infer deletion. Source-owned handling continues through an eligible actor.  |

Reporting does not enroll Grace in newsletters, create a coaching summary,
manufacture a conversation, trigger a personal thank-you task from pending money,
or send anything. Later owner-qualified financial facts may independently meet
ratified stewardship rules. The donor encounters no new checkbox, signature,
receipt or checkout step because Maya reported the item.

## Finance, correction and recovery journeys

**Finance continuation.** Staff see the same source intake and the report's
qualified facts in existing P15 work. They resolve permitted missing facts and
continue the established staging/commit flow without asking Maya to retype the
report or creating a second gift. A report is evidence to assess, not authority
to trust every asserted donor, amount or payee. If finance already recorded the
item independently, an authorized exact reconciliation connects it; no new
posting, receipt or fulfillment is created merely to make the report look done.

**Correction.** Offer **“Correct report”** only for source-supported current
report corrections that Maya may perform. Otherwise provide the qualified staff
route without exposing protected facts. Preserve the earlier assertion and
attribution. A disagreement after finance processing must enter the owner's
correction/reconciliation behavior, not allow a casual form edit to rewrite
money. A changed amount may be corrected where authorized without deleting and
reentering the report. A generic task finish must not stand in for correction.

**Dispositions.** Show consequential source actions with honest verbs such as
**“Report a problem”** or the specific permitted handoff/return action. Do not
invent a separate messaging inbox or broad exception taxonomy. Ask for only the
evidence the actual source disposition needs; keep routine progress free from
extra approvals. A real unresolved physical obligation survives staff departure,
appeal closure, the feature becoming Off and ordinary preparation cleanup.

**Interrupted submission.** Before acceptance, **“Submitting report…”** is not
success. For an uncertain result, show **“Checking whether your report was
submitted…”** and reconcile the same operation. Known rejection can show
**“Report not submitted”** with the actual repair. A changed permission or Off
policy can legitimately reject an unaccepted form; a lost response after an
accepted report must recover that result without creating another intake.

Preserve still-authorized entered fields through a validation or transient error.
Do not clear the form before acceptance. No sensitive persistent device draft or
automatic replay on reconnect is introduced. After a tenant/context change,
clear unsafe state and ignore stale results. If the accepted result itself is no
longer readable, give a safe response without leaking its former body.

## Visual and interaction design

Use the ordinary shared record shell: clear context above a restrained report
title; one-column fields in meaningful groups; one primary submission or next
action; quiet secondary detail/history. Reuse shared Field, Input, selection,
Alert and responsive sheet/page composition. Avoid a dashboard of decorative
metrics, a batch grid, stepper, financial pipeline or new notification center.

On a phone, the form and current status must work without horizontal scrolling,
hover or dragging. Do not require navigating a desktop finance screen. Focus
returns to the invoking control or a stable meaningful location after closing;
errors preserve input and move focus according to the existing shared form
pattern. Keep the focused input and primary action reachable above the software
keyboard, and avoid a sticky footer obscuring errors or content.

Require persistent labels, programmatic field/error association, useful linked
errors, visible focus, non-color status text and quiet status announcements.
Verify keyboard, screen reader, 320 CSS pixel reflow/equivalent zoom, light/dark,
reduced motion and long/RTL text. Core's comfortable 44px touch target preference
is distinct from WCAG 2.2 AA's 24px minimum or its specified exceptions.

Use exact currency-aware values rather than hardcoded dollars or two decimals.
Offer an appropriate mobile keyboard without losing supported decimal precision
or valid locale input. Show unambiguous localized dates; never turn an uncertain
date into a fabricated exact timestamp. Person/organization names remain intact;
no surname, email, Western postal structure or salutation is required simply to
report a check. Keep optional narrative out of cards, notifications and logs by
default; current-source projection determines every visible field.

## Material concerns and exact prevention language

Severity and likelihood below are qualitative design assessments, not incident
rates. All concerns narrow or clarify A; none requires rejecting the selected
entry point.

| Concern and evidence                                                              | Severity / likelihood                               | What could go wrong and why                                                                                      | Required amendment language                                                                                                                                                                    |
| --------------------------------------------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reporting confused with money; vendor direct-entry models and P27-F68             | High / plausible                                    | Pending reports inflate support, imply a receipt or trigger donor follow-up before source financial facts exist. | **“A report SHALL remain an attributed intake fact and SHALL NOT itself create recorded-support totals, a contribution, receipt, fulfillment or donor communication.”**                        |
| One Done state; P27-F63 and MPDX's distinct in-hand/processed concepts            | High / plausible                                    | Posting first hides an untransferred check; transferring first invents posting.                                  | **“Financial recording and required physical handling SHALL remain independently visible and source-resolved; neither SHALL imply the other.”**                                                |
| Required false details; P27-F58 and GOV.UK unknown-answer guidance                | High / likely if a finance form is reused           | Maya chooses a guessed donor/currency/entity or abandons a legitimate report.                                    | **“The missionary form SHALL admit owner-qualified incomplete intake and SHALL NOT require a fabricated Party, financial value or exact occurrence.”**                                         |
| Feature Off erases unresolved obligations                                         | High / plausible                                    | Existing reports vanish or staff re-enter them; physical handling loses accountability.                          | **“Off SHALL stop new missionary report admission without cancelling accepted source intake, current handling or independently permitted continuation/read/correction.”**                      |
| Broad context/prefill implies donor identity or rights; P27-F59/F60               | High / plausible                                    | Selecting a contact exposes the organization roster or fixes the bearer as legal donor.                          | **“Context reuse SHALL preserve current scope and known provenance; contact selection, possession or authorship SHALL grant no additional identity, finance or disclosure authority.”**        |
| Correction by delete/recreate or duplicate retry; P27-F61/F67 and vendor contrast | High / plausible                                    | Two gifts are recorded, or prior evidence disappears.                                                            | **“Correction and uncertain-submit recovery SHALL continue the qualified source occurrence and operation; finance SHALL reconcile exact lineage without reposting.”**                          |
| Premature success or stale status                                                 | Medium to high / plausible on weak networks         | Maya thinks finance has the item, repeats the report or loses work after a failed refresh.                       | **“The UI SHALL distinguish accepted report, unknown save result and unavailable current status; a failed secondary read SHALL NOT relabel accepted reporting as failed.”**                    |
| Extra evidence ceremony and screen complexity                                     | Medium / likely if full finance workbench is copied | Ordinary phone reporting becomes a multi-step clerical task with unnecessary sensitive collection.               | **“The ordinary qualified report SHALL use one short deliberate submit, without a routine photograph, signature, second approval, mandatory essay, donor address or bank-field requirement.”** |
| Hidden privacy expansion and unsafe late responses                                | High / plausible                                    | A new report/coach card or context switch discloses donor/missionary details.                                    | **“Every report summary, search, notification, history and recovered result SHALL apply its current source-purpose disclosure; no new coaching or public audience is implied.”**               |
| Inaccessible controls and unsupported money/date assumptions                      | Medium / plausible                                  | Phone, keyboard, screen-reader or international users cannot report accurately.                                  | **“The composed form/status/recovery flow SHALL preserve qualified precision and uncertainty and pass the actual mobile, locale and accessibility outcomes below.”**                           |

## Falsifiable UX acceptance outcomes

These are required future implementation proofs, not results produced by this
documentation review.

1. With Off, Maya cannot create a new report through the UI or a retained open
   form. Accepted reports remain available only under independent current read
   rights; unresolved source work continues.
2. With On but without the exact report permission, Maya cannot report. An
   authorized missionary can complete the ordinary actual-check journey with
   one submit and no finance workbench, photo, signature or routine approver.
3. A source-supported unknown donor, amount, currency, intended entity or date
   remains truthful. No fake donor, zero, default currency/entity or compulsory
   precise timestamp is created. Required source accountability still exists.
4. A statement that a check was promised or mailed cannot be saved as actual
   receipt merely by supplying a date or moving a card.
5. The same check reported from permitted related contexts remains one source
   occurrence when exactly qualified; two distinct equal-looking checks remain
   distinct. Independent duplicate reports are not silently merged by similarity.
6. Finance continues an accepted intake without re-keying its known facts into
   a second intake. An already recorded exact gift reconciles without another
   posting, receipt or fulfillment.
7. Posting before transfer shows recorded finance and remaining handling;
   transfer before posting shows qualified handoff and awaiting finance. Neither
   generic Complete nor Off makes both facts true.
8. A permitted reporter can see minimal qualified recording evidence without
   acquiring finance detail or landing on an unusable privileged link.
9. Correction, wrong payee, loss, return, rejection, dispute and duplicate
   disposition retain accurate history and the actual remaining obligation;
   the resolved exception can end without a perpetual task.
10. Double-tap, lost response, reload and reconnect recover the same accepted
    report. A known successful report with failed status refresh stays submitted;
    same operation with changed meaning is not silently retried.
11. Off/revocation racing submit has the source-defined ordered result. Current
    access loss and context switch clear protected state and reject late output;
    saved references do not resurrect access.
12. Reporting makes no donor contact, newsletter enrollment, coaching share,
    recorded conversation, receipt, public total or gift-stewardship eligibility
    from the report alone.
13. Actual browser tests cover keyboard-only reporting/correction, focus return,
    screen-reader errors/status, 320px reflow, mobile keyboard, long/RTL names,
    light/dark contrast and no color-only or hover-only meaning.
14. Supported zero-, two- and three-decimal currencies, ambiguous locale input,
    approximate/unknown dates and timezone boundaries preserve source meaning.
    A small supported amount never rounds to a displayed zero.
15. A low-bandwidth user retains authorized input after a correctable failure;
    sensitive data is not silently persisted to the device or sent after an
    unapproved reconnect. Missing routing/source service has a visible qualified
    owner/repair path, not a hidden substitute ledger.

Before release, a moderated end-to-end exercise should include an authorized
missionary and finance operator using synthetic items: known check, unknown
donor, wrong payee, correction, handoff-before-recording and lost response. Verify
that participants can explain what was submitted, what finance has recorded and
what still requires handling. No fabricated pass rate or time budget is recorded
here; any later benchmark must state sample, device/network, task and measured
result. Permission correctness, duplicate prevention and financial truth are
release gates, not risks to defer to monitoring.
