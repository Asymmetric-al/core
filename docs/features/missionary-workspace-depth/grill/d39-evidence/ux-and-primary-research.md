# D39 — original referral timing: UX and primary research

Reviewed **October 18, 2026** against Core
`9cada8f3d8ab59db391d3fd20df77fcadeb09813` and the shared research tree.
The founder selected Q39 A: the first period is anchored to when the referral
was originally given to Maya; recording it later cannot give it a fresh period.
During review the founder also selected **calendar-date deadlines for new
referrals, clearly showing the last day**. This explicitly amends D38’s elapsed
unit for New only; Continued retains D36’s elapsed 24-hour unit. The calendar
selection is recorded; the full corrected decision and amendments are not yet
ratified.
This note supplies research, proposed journey requirements and counterexamples.
It does not ratify amendments, change application code, qualify a producer, or
create a formal specification. No earlier verifier or model was executed.

## Conclusion

Keep the ordinary referral form and list. Explain the original-date rule beside
the relevant field and show the resulting source-backed end date before the
first consequential acceptance. An old referral should be savable as permitted
history without pretending it is new active work; when already expired, use the
existing authorized **Continue referral** action. Do not ask Maya to choose an
expiry date, change a period or navigate a new policy screen.

The founder has resolved the main date-only difficulty by selecting calendar
deadlines for all initial windows. Users need not invent hours and minutes.
Preserve original precision and show the last included day. The exact proposed
convention is **N calendar days including the original date D: follow up through
D + N − 1, expiring at the start of D + N in the frozen organization policy
timezone**. This is explicit proposed amendment language, not a finding from
competitor products. It must appear in the reviewed corrected decision rather
than be delegated to a date picker or database cast.

## Governing boundaries inspected

| Repository evidence                                                                                                                                                                                                  | Governing consequence                                                                                                                                                                                                                               |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Founder brief](../phase28-founder-brief.md:21)                                                                                                                                                                      | Research/grill only; one meaningful product decision at a time. Resolve engineering from evidence and present genuine product choices honestly.                                                                                                     |
| [Q39 original research](../phase28-q39-initial-referral-clock-research.md)                                                                                                                                           | No prior accepted window in the scenario. Date-only/unknown facts and late-entry policy selection were explicitly reserved for this review.                                                                                                         |
| [D34](../phase28-d34-expired-referral-history-adversarial-review.md#exact-corrected-decision-to-record)                                                                                                              | Expired history is a minimal permitted projection; unknown expiry must remain unknown. Names, referrer identity and contact details do not become universally readable.                                                                             |
| [D35](../phase28-d35-referral-continuation-adversarial-review.md#exact-corrected-decision-to-record)                                                                                                                 | One deliberate authorized continuation; missionary control Off initially; independent staff authority; current restrictions; no automatic renewal or restored private content.                                                                      |
| [D36](../phase28-d36-configured-referral-period-adversarial-review.md#exact-corrected-decision-to-record)                                                                                                            | Continued period starts at authoritative acceptance, uses elapsed 24-hour days and ends at an exact instant. Its facts persist through retries and edits.                                                                                           |
| [D38](../phase28-d38-separate-referral-periods-adversarial-review.md#exact-corrected-decision-to-record)                                                                                                             | Two independent organization periods; no new clock-mode setting or per-person exception. Existing accepted endpoints stay fixed under ordinary settings edits. The founder’s new calendar selection amends only New’s unit; Continued is unchanged. |
| [D37](../phase28-d37-starting-guide-research-and-design.md#decision-in-plain-language)                                                                                                                               | Optional guidance can explain ordinary work; no mandatory course, progress score or onboarding gate is justified by referral timing.                                                                                                                |
| [Platform principles](../../../../../openspec/specs/platform-principles/spec.md) and [OpenSpec index](../../../../../openspec/project.md:6)                                                                          | Truthful state and current permission correctness precede convenience. Intended behavior, current source and runtime qualification are different evidence classes.                                                                                  |
| [Frontend rules](../../../../ai/rules/frontend.md), [shared UI contract](../../../../../packages/ui/AGENTS.md) and [actual component config](../../../../../packages/ui/components.json)                             | Exact base-maia, Base UI shared primitives and semantic Zinc-oriented tokens remain. No vendor design system or app-local control library is imported.                                                                                              |
| [Accessibility skill](../../../../ai/skills/accessibility-review/SKILL.md), [touch guidance](../../../../ai/skills/emil-design-engineering/touch-accessibility.md), [testing rules](../../../../ai/rules/testing.md) | Semantic fields/errors, focus, mobile targets, state announcements and manual verification are required; a structural review is not browser or WCAG proof.                                                                                          |

The installed shared [Calendar](../../../../../packages/ui/components/shadcn/calendar.tsx:19)
is an available composition building block, not evidence of a ready historical
referral date form. Bounded searches of missionary portal `model.ts` and
`service.ts` did not identify a referral/date-window producer. This is not a
claim that every repository path or deployed system was inspected. No actual
end-to-end referral UI, authenticated competitor product or live permissions
were tested here.

## Fresh official comparisons

All pages below were opened afresh on October 18, 2026. Publication dates are
reported separately where shown. The facts are documented vendor/guidance
behavior, not evidence of comparative efficacy or ministry preference.

| Source                                                                                                                                        | Verified fact                                                                                                                                                          | Use and limit for Core                                                                                                                                                            |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [MPDX — Add Referrals to Contacts](https://help.mpdx.org/article/194-add-referrals-to-contacts), updated June 8, 2023                         | The contact's referral list includes a referral date and provenance. Recent means added within two weeks; On Hand is based on specified contact statuses.              | Keep provenance/date understandable near ordinary work. Neither the Recent filter nor the label proves an expiry anchor or recommended duration.                                  |
| [TntConnect — TNT Phase](https://www.tntware.com/tntconnect/help/en/pages/contacts_mpdphase.aspx), undated manual                             | Expired Referral describes the lapse of a reasonable contact window, distinct from refusal or unresponsiveness. It suggests checking with the referrer where helpful.  | Expired should describe the window, not evaluate the supporter or missionary. Do not adopt fixed phases, mandatory reconfirmation or a universal number.                          |
| [HubSpot — default activity properties](https://knowledge.hubspot.com/properties/hubspots-default-activity-properties), updated June 11, 2026 | Activity date means when an activity occurred; Create date means when its record was created. Missing imported Activity date defaults to record creation time.         | The separation is useful. The missing-date fallback is a concrete incompatible precedent: Core must not silently convert import time into referral-given time.                    |
| [CoachAccountable — Course Actions](https://www.coachaccountable.com/knowledgeBase/coaching/courses/building/actions), undated knowledge base | Relative due dates are calculated from action assignment, rather than course start.                                                                                    | Name the exact starting event. Its assignment clock and zero-day scheduling do not override D39 or D38; no coaching course/action system is needed.                               |
| [CoachAccountable — Course Settings](https://www.coachaccountable.com/knowledgeBase/coaching/courses/basics), undated knowledge base          | Course due times can use coach or participant zones, with different group behavior.                                                                                    | Timezone meaning must be explicit. Core should not copy configurable clock modes or infer a missionary's location from data.                                                      |
| [GOV.UK — Dates](https://design-system.service.gov.uk/patterns/dates/), living guidance                                                       | Input should match the type of date. Approximate dates are appropriate where an exact date is unlikely to be known. Calendar controls need an alternative typed input. | Capture factual precision honestly; do not force a false timestamp or calendar-only navigation. These principles do not select a calculation convention or new component library. |
| [GOV.UK — Date input](https://design-system.service.gov.uk/components/date-input/), history includes July 2026 changes                        | Use labeled grouped fields for dates users know or can look up. It warns against using exact-date entry where people are unlikely to know the exact date.              | Keep labels and format unambiguous; unknown must have an honest path. Core's shared control style remains authoritative.                                                          |
| [GOV.UK — Error message](https://design-system.service.gov.uk/components/error-message/), living guidance                                     | Error wording should match the relevant field and explain how to fix the specific input problem.                                                                       | Separate invalid dates from unavailable settings, lost responses and denied authority. Avoid a generic red Date field for service or permission failures.                         |
| [W3C — Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), WCAG 2.2 explanation                               | Important non-focus-changing results must be available programmatically to assistive technology.                                                                       | Announce saved/unknown-result/status updates without focus theft or a ticking countdown.                                                                                          |
| [W3C — Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), WCAG 2.2 explanation                                                 | Ordinary vertical content must retain meaning and function at 320 CSS-pixel width without two-dimensional scrolling.                                                   | Stack the field, explanation, endpoint and action; no referral-form exception or fixed-width policy table is justified.                                                           |

No source establishes a preferred missionary referral duration or answers the
date-only policy question. Public fundraising guidance supports purposeful
relationships; it cannot convert a work window into consent or a donor's intent.

## Complete minimal journey

### Staff setup and control

Keep D38's two fields in the existing organization referral settings. The New
helper can now say: **“Used for the first follow-up window, beginning when the
referral was originally given to its recipient.”** The Continued helper retains
its accepted-action/elapsed-time meaning. Update New’s label to **New referral
period (calendar days)** and Continued’s to **Continued referral period (24-hour
days)** so the units are not concealed behind identical days labels. Explain
that the original date is day one. One short explanation says entering a referral
later does not restart its initial period. Provide a contextual example using
the actual configured period, clearly identified as an example; do not invent a
default number.

The missionary-continuation control remains separately operable, initially Off,
and staff action grants remain under existing permission administration. A
period edit does not enable a feature or grant an action. Withholding new actions
does not rewrite old endpoints or delete permitted history. No additional
“Expire referrals” switch, selectable start-event mode, per-person override or
unknown-date auto-renewal option is justified.

Unknown New configuration blocks only a dependent first-window acceptance.
Qualified continuation must still work when its own configuration and authority
are valid. Present loading failure separately from Not configured. Do not show
Maya settings links she cannot use.

### Maya records a referral

Use the ordinary permitted referral-entry surface, with current source identity
and recipient context already clear. Add one factual question where needed:
**“When was this referral given to you?”** Help: **“Use the original date, even if
you are entering it later.”** Staff entering on behalf of another person see
**“When was this referral given to [approved recipient label]?”** Their own receipt
or data-entry date is not substituted.

Known trustworthy source facts are shown with provenance rather than demanded
again. Otherwise start unfilled, with an explicit **“I don't know the date”**
path. A visible Today shortcut may fill a date deliberately; Today must never be
an invisible fallback for blank input, an import, a retry or an existing record.
No user must invent a time of day to submit a date they actually know. Capture
more precise source facts when available without exposing unnecessary clock
controls in every ordinary form.

Use a shared, typeable date entry with a visible format example and associated
help. A calendar can be optional for a recent date. Historical dates cannot
require month-by-month navigation. Preserve intended civil dates through browser
timezone conversion. Changing a display timezone must not move a received date
to the prior day. The date-entry question is factual evidence capture, **not**
the expiry-date choice that D36/D38 exclude.

When all source facts and policy terms are qualified, display a compact inline
result before acceptance: **“Follow up through [full date]”**, with the governing
organization timezone and short help explaining that the named day is included.
Show the exact transition instant in supporting detail when it helps. Continued
windows retain **“Follow-up ends [date, time, timezone]”**. If
already ended: **“This first follow-up window has ended. Saving this record won't
restart it.”** Do not disable recording merely because it is late, force a false
recent date, or silently combine Save with Continue. Record retention and the
scope of persisted historical evidence still follow the native source's rules.

Save returns the actual accepted outcome. A known expired result enters only
currently permitted history. Offer the ordinary **Continue referral** action
when D35 eligibility and current authority allow; its existing concise review
already explains the renewed terms. There is no second intake workflow or
mandatory explanatory text for the user to write.

### Everyday use, unknowns and correction

The normal list shows the currently applicable status and endpoint. Do not show
both policy values on every row. Details can explain **Given to you**, **First
follow-up ended**, and the current continued window when relevant, with disclosure
evaluated independently. D34's expired projection must not gain a referrer name,
original private note or unsupported timing detail just because the entry form
captured it.

Unknown source date or insufficient precision is **“Date not confirmed”** or a
similarly specific unresolved-data explanation, not Active, Expired or Never.
Do not create a second lifecycle status machine or new review queue merely to
show the explanation. An authorized existing source correction action supplies
missing facts. If Maya cannot correct them, explain the existing staff/help path
when it is safe to disclose. Unknown timing cannot be routed to Continue as if
ordinary expiry had been proved.

A typo correction is separate from continuing a referral. Before a consequential
correction, show the changed factual value and the source-defined effect on
future presentation/access. Preserve the original attribution and prior accepted
evidence. Do not reset the clock or grant continuation through an edit. Already
accepted window corrections require the source's explicit correction contract;
the generic form cannot decide to rewrite their deadlines. Editing an ordinary
note has no timing effect.

If another actor has already saved or continued the same lineage, show the
currently permitted outcome. A known accepted write with a failed refresh says
**“Saved. Current status couldn't be refreshed.”** An unknown response says
**“We couldn't confirm the result. Check status.”** Recovery targets that original
action; it does not start a fresh period or claim Maya performed another actor's
action. Permission loss clears protected content rather than preserving it as
a convenient offline preview.

### Mobile, accessibility and quiet visual design

Use Core's existing form shell, spacing, typography, semantic status colors and
normal Save/Cancel treatment. A calm label plus brief explanation carries the
meaning. Avoid a timeline dashboard, countdown, overdue performance badge,
shaming language or decorated policy cards. An original-date fact does not add
a donor checkout question, public display, coach access or activity credit.

Use persistent visible labels, fieldsets where appropriate, accessible error
associations, keyboard access and focus restoration after a row moves out of
the active list. Preserve normal international names and wrap long labels/dates.
Ambiguous numeric-only dates and timezone abbreviations should not carry the
sole meaning of an endpoint. Use existing explicit locale/timezone preferences;
never infer a protected ministry location to explain a clock.

On weak connections, keep unsaved text in the current authorized session, expose
saving versus saved and permit deliberate recovery. Do not add permanent local
PII storage or an offline queue that later auto-submits privileged actions. A
save success must remain visible beyond a toast. Verify keyboard-only use,
screen-reader labels and announcements, 320 CSS-pixel reflow/400% zoom, Core touch
targets and error recovery on the real implementation before release.

## The date-only decision cannot be hidden

For an exact, qualified source instant, an initial period of N days produces an
endpoint N × 86,400 seconds later. A date such as October 10, 2026 alone is not an
instant. It has no asserted hour, offset or timezone. Even a known timezone may
have a 23- or 25-hour civil day at a daylight-saving transition.

| Candidate treatment                             | Advantage                                                                                         | Material consequence                                                                                                                                                                                                                     |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Calendar-date deadlines for all initial windows | One easy original-date question and one inclusive deadline date; no recollection of hours/minutes | Explicitly changes D38's elapsed-day rule for initial windows only. Must define inclusive day counting, authoritative timezone and transition boundary; continued windows retain D36's exact elapsed-time rule. Not selected by A alone. |
| Require exact original time                     | One exact arithmetic path                                                                         | Ordinary users may not know it; pressures invented precision and makes historical intake brittle. Not the recommended ordinary UX.                                                                                                       |
| Explicit start-of-day policy anchor             | Supports date-only entry; avoids extending beyond every possible event instant on that day        | May shorten practical follow-up by nearly a day. Must be labeled a calculation convention, preserve original precision and specify the source zone and anomalous civil dates. Not selected by A alone.                                   |
| Explicit end-of-day policy anchor               | Supports date-only entry and preserves the full named last day in many cases                      | Can extend beyond N elapsed days after the actual event; conflicts with a literal elapsed-event interpretation unless explicitly amended. Not selected by A alone.                                                                       |
| Interval/uncertainty-based eligibility          | Preserves the distinction between possible source times                                           | Adds a confusing uncertain band and extra states/actions near expiry; disproportionate as the ordinary interface unless a real requirement justifies it.                                                                                 |

**Selected direction:** calendar-date deadlines for all new referrals. This is
one source-owned rule, not a tenant-selectable clock mode. Continued windows
remain elapsed 24-hour days. The original elapsed alternatives above document
tradeoffs; they are not remaining options after the founder’s answer.

**Proposed inclusive counting:** the original date D is day one. With a 30-day
New period, October 1 gives **Follow up through October 30**. A one-day period
means through the original date itself. Expiry is the first valid instant at the
start of D + N in the accepted organization policy timezone. Resolve unusual
zone transitions through the qualified temporal implementation; if a final civil
date does not exist in that zone, do not invent a readable “through” day or quietly
change the convention. Qualification must define and test that boundary. The
accepted endpoint and zone are preserved rather than recalculated when staff
change the organization zone or the user travels.

Use **“Follow up through [full date]”** with the source policy timezone visible in
detail and boundary-sensitive actions. The named date is inclusive. This wording
is deliberately different from Continued’s **“Follow-up ends [date, time,
timezone]”**. Keep the distinction in staff settings help and source evidence;
Maya normally sees only the applicable outcome. No calendar-mode menu, repeated
math question or new configuration card is needed.

**Preserve precision without pretending a civil date is an instant.** Manual
date-only input stays the reported day, with its original precision and
provenance. The organization counts that reported day as day one and governs the
deadline with its configured timezone; this does not assert that the original
event occurred at midnight or in that zone. Do not demand conversion of a
remembered local day to an organization day when no original time is known.
For an exact source timestamp, derive D in the organization policy timezone and
retain the original instant as evidence. A verbal day and an exact timestamp near
a date line may produce different policy dates because the available evidence
has different precision. Explain this when resolving a discrepancy; do not
silently overwrite a reported day. Any material correction after acceptance
uses the native correction contract rather than a normal edit/reset path.

Missing or invalid organization timezone blocks only the acceptance requiring
it; there is no device-timezone or protected-location fallback. The timezone is
existing organization configuration, not another per-referral choice. Capture
the accepted policy zone/terms and calculated endpoint once so later rendering
cannot change the business outcome.

Completely unknown dates remain unknown. Preserving permitted evidence is
different from asserting a valid active window. Month/year estimates may be
retained as source facts if the source supports their precision, but must not
be rounded into a precise day merely to satisfy a date component. No new
approximate-date parser is required by this recommendation.

Late first acceptance also needs a named **policy-selection event**. Applying
today's New period to an old introduction must be explained as today's terms
applied at first acceptance, not as proof those terms governed the original day.
Using historical effective policy requires genuine historical evidence, not a
guessed default. The final synthesis must select one meaning explicitly and
keep it separate from original timing; the UI cannot settle it by prefill.

## Adversarial UX concerns and exact candidate requirements

Likelihood below means plausible design/implementation exposure, not measured
production incidence. These clauses are proposed input to the D39 synthesis.

| Concern, severity / likelihood                                             | Why it matters and effect on A                                                                                                               | Candidate exact prevention                                                                                                                                                                                                                                                                            |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Forced or fabricated time; high / likely if an exact timestamp is required | False precision makes expiry untrustworthy and penalizes ordinary recollection. Narrows the implementation of A.                             | **The intake SHALL preserve the supplied precision and SHALL NOT manufacture an original timestamp from a date-only or unknown value. New referral windows SHALL use the explicitly adopted calendar-date rule while keeping the original evidence precision separate from its calculated boundary.** |
| Created/imported time reused; high / plausible                             | An ordinary retry/import can renew old work. HubSpot's documented fallback illustrates the hazard. Changes the source mapping requirement.   | **Created, recorded, imported and original-referral timing SHALL remain distinguishable. Missing original facts SHALL NOT default to the current time.**                                                                                                                                              |
| Date capture confused with forbidden expiry control; medium / plausible    | A blanket prohibition can make evidence capture impossible; a generic date picker can become an unauthorized deadline override. Clarifies A. | **Users MAY supply authorized factual original timing; they SHALL NOT choose an arbitrary end date or duration for an individual referral.**                                                                                                                                                          |
| Late referral blocked from truthful recording; high / plausible            | Users may invent recent dates or lose legitimate history. Narrows intake behavior.                                                           | **A valid old referral SHALL remain recordable under current source/retention rules without receiving a fresh window. Continued work requires the separately authorized ordinary continuation.**                                                                                                      |
| Unknown shown as expired or actionable; high / plausible                   | Invents lifecycle facts and can bypass continuation prerequisites. Changes unknown-state wording and behavior.                               | **Unknown timing SHALL have a truthful data-quality explanation and SHALL NOT qualify as Active, Expired or eligible for ordinary continuation merely because its date is missing.**                                                                                                                  |
| Correction silently extends access; high / plausible                       | An ordinary edit can bypass period and continuation controls. Requires source correction boundary.                                           | **Timing corrections SHALL preserve attribution and historical evidence and SHALL use the source's explicit correction contract; editing SHALL NOT implicitly accept a continuation or rewrite an accepted window.**                                                                                  |
| Deadline display implies the wrong last usable moment; high / plausible    | Users misunderstand exact expiry, travel and DST behavior. Clarifies presentation.                                                           | **Elapsed-day endpoints SHALL expose date, time and timezone. New’s calendar-date rule SHALL explicitly state inclusion of the final named day and its governing zone. Source precision SHALL remain distinguishable from calculated policy boundaries; display-zone changes SHALL NOT move either.** |
| Unknown response shown as failure; high / plausible on mobile networks     | A second Save or Continue may duplicate an effect. Changes recovery copy.                                                                    | **Outcome recovery SHALL distinguish rejected, accepted, refresh-failed and unconfirmed results and recover the original durable effect before inviting a new action.**                                                                                                                               |
| New switches and modes; medium / likely if “customizable” is overread      | Adds hidden state and contradicts settled simplicity. Narrows settings scope.                                                                | **D39 SHALL reuse D38's two periods and D35/current permissions; it SHALL NOT add per-person dates, clock modes or an expiry-disable value.**                                                                                                                                                         |
| Hidden date provenance widens expired view; high / plausible               | Technical evidence can expose a relationship or referrer. Narrows disclosure.                                                                | **Every date, provenance label and explanation SHALL follow the same current field/purpose policy as the containing surface; D34 history SHALL remain its closed permitted projection.**                                                                                                              |

## Falsifiable user-outcome checks

1. Enter a trustworthy old exact referral instant while its first window is still
   open: derive the original policy date in the organization zone, count calendar
   days inclusively, and never substitute Save time.
2. Enter the same facts after that endpoint: truthful history can be saved, no
   fresh active window appears, and only an authorized ordinary Continue is
   offered when eligible.
3. Leave the source date unknown: no Today fallback, invented endpoint or
   ordinary-expiry continuation appears; authorized correction has a clear path.
4. Enter a date without a time: the original value remains date-only and the
   adopted calculation rule is visible; the form never insists on invented time.
   Verify N=1 and October 1 plus 30 days means through October 30. Test travel,
   daylight-saving and date-line cases without fabricating source precision.
5. Import an old source date with a new import timestamp: both meanings persist;
   no new window is granted by import. A missing original date remains missing.
6. Change either organization period: existing accepted endpoints do not move;
   the unaffected operation remains usable if independently qualified.
7. Toggle missionary continuation Off while a draft is open: source acceptance
   rechecks authority; history and independently authorized staff actions retain
   their own rules; no stale queued action replays on re-enabling.
8. Correct a typo after acceptance: history and source correction evidence remain;
   no generic edit or Undo invents a continuation or silently rewrites the window.
9. Lose the Save/Continue response: Check status recovers the original effect and
   current permitted view without duplicate action or false attribution.
10. Use keyboard, screen reader, narrow mobile view, zoom and a weak connection:
    input/help/status/actions remain perceivable and usable without hover, color
    alone, a calendar-only path, a toast-only result or a client-side clock grant.

These are acceptance scenarios, not claims of executed runtime tests. Research
supports the interaction principles; product judgment selects the small shape;
the founder selected calendar-date deadlines during this review. The exact
inclusive counting and precision clauses remain proposed amendments until
ratified with the corrected decision. No ministry interviews or measured
usability improvement are claimed.
