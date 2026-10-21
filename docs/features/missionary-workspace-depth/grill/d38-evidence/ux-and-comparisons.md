# D38 UX and primary comparisons — separate referral periods

Research retrieved **October 18, 2026 UTC** against Core
`9cada8f3d8ab59db391d3fd20df77fcadeb09813` and the shared research working tree.
This is a targeted design review for Q38's selected **B**, not application
implementation, a live configuration change, authenticated competitor testing,
or evidence that a ministry prefers a particular number of days.

## Recommendation and evidence boundary

**Accept B with required amendments.** Two organization fields are sufficient:
**New referral period (days)** and **Continued referral period (days)**. They may
contain equal or different valid values. Put them together in the existing
referral settings section; keep Maya's work to one current end date and the
already-qualified contextual continuation action. Do not add a same/different
mode switch, linked-value inheritance, per-missionary exceptions, an advanced
rule builder, a second calendar, or a new approval queue.

That recommendation is a product judgment from the selected customization need
and existing boundaries. The reviewed public documentation supports clear
provenance, visible dates, centrally configured defaults, explicit timer meaning
and accessible forms. It does **not** establish a support-raising industry
standard for separate initial and continued periods, an appropriate duration,
an initial clock anchor, or a safe automatic renewal policy.

The strongest alternative remains Q38 A: one shared period is simpler to
configure and explain. The founder expressly chose separate periods, making
two straightforward fields the smallest honest implementation of B. Allowing
equal values gives a tenant A-like operation without adding a persistent
inheritance relationship or discarding its freedom to diverge later.

## Governing repository facts

| Source read                                                                                                                                                                            | Binding consequence                                                                                                                                                                                                                                                                              |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Root instructions](../../../../../AGENTS.md), [OpenSpec index](../../../../../openspec/project.md)                                                                                    | Current behavior, selected intent and ratified amendments must be distinguished. No external product's defaults override accepted domain intent. This research does not establish runtime qualification.                                                                                         |
| [Platform principles](../../../../../openspec/specs/platform-principles/spec.md)                                                                                                       | Permission correctness outranks convenience; truthful state and clear handoffs matter. Do not label an unknown result failed or an accepted historic action Active now.                                                                                                                          |
| [D34 corrected decision](../phase28-d34-expired-referral-history-adversarial-review.md#exact-corrected-decision-to-record)                                                             | Active work stays the default. Expired history is bounded, separately permitted and does not reveal contact details/private context. A date is not a grant.                                                                                                                                      |
| [D35 corrected decision](../phase28-d35-referral-continuation-adversarial-review.md#exact-corrected-decision-to-record)                                                                | Missionary continuation is optional, organization-controlled and initially Off. Independent staff authority remains. Off stops new missionary acceptance; it does not undo accepted work or staff rights.                                                                                        |
| [D36 exact amendments](../phase28-d36-configured-referral-period-adversarial-review.md#exact-required-amendments)                                                                      | Continued periods use finite positive whole elapsed days, 86,400 seconds each; Maya has no date override. Saved changes are prospective. Missing configuration is not zero/infinity/default. Source acceptance, exact expiry, current authority and lost-response recovery are already governed. |
| [Q38 original scope](../phase28-q38-referral-period-scope-research.md#the-single-choice)                                                                                               | The A/B question chose configuration scope, not a day count or initial clock anchor. Imports/late recording must not quietly manufacture a fresh initial window.                                                                                                                                 |
| [Frontend rules](../../../../ai/rules/frontend.md), [shared UI contract](../../../../../packages/ui/AGENTS.md), [components configuration](../../../../../packages/ui/components.json) | Preserve exact `base-maia`, Base UI, shared `@asym/ui` ownership, semantic Zinc-family tokens and existing save conventions. No imported visual system or new app-local primitives.                                                                                                              |
| [Accessibility review skill](../../../../ai/skills/accessibility-review/SKILL.md), [testing rulebook](../../../../ai/rules/testing.md)                                                 | Native semantics/shared primitives, associated labels/errors, keyboard/focus, usable touch targets, restrained announcements and manual accessibility verification. Automated checks alone are insufficient.                                                                                     |

The local accessibility-review skill was read and applied to this design review.
`components.json` was inspected and retains `base-maia`, Zinc and CSS variables.
No UI was edited; no CLI generation, browser test or actual conformance claim is
made. Source qualification and current code analysis belong to the companion
governance/security review; this note does not assume a usable referral producer.

## Fresh primary evidence and deliberate limits

All following pages were opened afresh on the retrieval date above. Dates below
are publisher-displayed update dates, not retrieval dates or inferred ages.
Public documentation was inspected; no product account or user interview was
available. Search results without a relevant opened primary page were excluded
from decision evidence.

| Source                                                                                                                                                  | Verified documented behavior                                                                                                                                                                                                    | Transfer to Core and limit                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [MPDX: Add Referrals to Contacts](https://help.mpdx.org/article/194-add-referrals-to-contacts), updated June 8, 2023                                    | Records the introducer connection and referral date. Dashboard Recent means added in the last two weeks; On Hand is based on selected contact statuses.                                                                         | Preserve relationship provenance and distinguish current work. Two weeks is a display filter, **not** expiry, retention, consent or a recommended initial period. No separate continued period is documented here.                                                                 |
| [TntConnect: TNT Phase](https://www.tntware.com/tntconnect/help/en/pages/contacts_mpdphase.aspx), manual undated                                        | Expired Referral identifies a reasonable contact window that has passed, separate from refusal/unresponsiveness. The guidance suggests checking with a referrer when useful.                                                    | Use factual Expired wording, not an overdue-performance judgment. No numerical window or renewal calculation is documented. Do not import its fixed phase model or turn its suggestion into mandatory reconfirmation.                                                              |
| [HubSpot: Create tasks](https://knowledge.hubspot.com/tasks/create-tasks), updated September 21, 2026                                                   | User preferences can prefill due date/time/reminder values for specified task-entry routes; individuals can adjust each task. Date/time rendering follows preferences. Defaults are saved explicitly.                           | Defaults can remove repeated entry; the setting must explain its scope. Core's organization periods are not overridable task defaults, and this evidence does not authorize a personal date control, task creation or reminders.                                                   |
| [Pipedrive: The Rotting feature](https://support.pipedrive.com/en/article/the-rotting-feature), updated September 3, 2026                               | Optional inactivity periods are configured by stage. Several edits/activities reset the timer, including actions another user may not see. A future activity does not itself prevent the inactivity warning.                    | This is a useful **counterexample**: a timer can surprise people when its meaning or reset cause is hidden. Core must not reset accepted referral expiry after edits, activity, task scheduling or hidden events. Do not copy a stage matrix, red-only status or the term Rotting. |
| [CoachAccountable: Course Actions](https://www.coachaccountable.com/knowledgeBase/coaching/courses/building/actions), page undated                      | Relative action due dates are based on assignment, not course start; zero means same-day action scheduling in that product.                                                                                                     | Name the source event that starts each period. Its assignment clock and zero-value semantics do not select Core's initial anchor or override D36 positive periods. Course completion/progress mechanics are unrelated.                                                             |
| [CoachAccountable: Course Settings](https://www.coachaccountable.com/knowledgeBase/coaching/courses/basics), page undated                               | Describes coach-versus-participant timezone handling and a different group behavior.                                                                                                                                            | Timezone context must be explicit. Core should use existing locale/zone preferences for its accepted instant rather than add a course-style zone setting or calendar-clock choice.                                                                                                 |
| [GOV.UK: Text input](https://design-system.service.gov.uk/components/text-input/), change history includes June 2026                                    | Visible labels, short hints, appropriately sized inputs and numeric mobile input mode are recommended. Placeholder text does not replace labels. The guidance identifies accidental value changes as a risk of number spinners. | Use Core's existing field primitive with a visible days unit, persistent label and numeric-entry affordance. Do not copy GOV.UK styling/components or treat its one-question-page guidance as a reason to make a two-setting wizard.                                               |
| [GOV.UK: Error message](https://design-system.service.gov.uk/components/error-message/), ongoing component guidance, no single publication date claimed | Field errors explain input mistakes and how to correct them; retain input. Permission/service problems are not field-validation errors.                                                                                         | Preserve entered duration drafts. Explain unavailable authority/service results at the action level, not with a red duration field. Core may use its existing contextual feedback rather than copying a new page for every failure.                                                |
| [W3C: Understanding SC 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), living WCAG 2.2 explanation                            | Status changes must be programmatically available to assistive technology without requiring focus.                                                                                                                              | Saving, saved, refreshed terms and unknown-result recovery need accessible status feedback. Avoid continuous countdown announcements or focus theft.                                                                                                                               |
| [W3C: Understanding SC 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), living WCAG 2.2 explanation                                    | Non-excepted vertical content must retain information/functionality at 320 CSS-pixel width without two-dimensional scrolling.                                                                                                   | Stack settings and exact end-date text on small screens/zoom. A two-field form has no genuine two-dimensional-layout exception.                                                                                                                                                    |

## Minimal complete staff journey

1. **Find the setting.** Existing relationship/referral administration contains a
   **Referral follow-up periods** section. Staff with the current policy-management
   capability can edit; merely having Continue authority does not confer settings
   access. Do not create a new settings destination or missionary setup wizard.
2. **Understand it.** Show two inputs, in logical order:
   - **New referral period (days)** — “Used for a new referral's first follow-up
     window.” The final helper must identify the qualified initial source event
     before activation; it must not invent “when Maya first opens it.”
   - **Continued referral period (days)** — “Used when an eligible expired referral
     is deliberately continued.”
   - Shared explanation: **“Each day is 24 hours. Changes apply to future windows.
     Existing end dates stay the same.”** Applying elapsed-day semantics to the
     new period is a recommended explicit amendment, not a claim Q38 B alone
     selected the initial clock.
3. **Choose values.** Show saved qualified values, or an explicit **Not configured**
   state. Do not silently copy the continued value into initial settings, invent
   14/30/90 days, prefill an apparent recommendation, enforce unequal values or
   compare the values as though one must be shorter. Present supported minimum/
   maximum values only after the owning source contract qualifies them.
4. **Save predictably.** Existing Save/Cancel conventions, no auto-save on blur or
   extra routine confirmation. Distinguish saved values from drafts. Retain both
   drafts on validation/service failures. Save changed valid settings atomically
   with their expected base revision; never partially apply two submitted edits
   and report one generic success.
5. **Handle existing tenants.** A qualified continued value survives; an untouched
   unconfigured new-period field does not erase it or block an unrelated continued
   edit/action. An attempt to clear an already configured value is a validation
   error, not Never. Only the operation that requires missing terms is unavailable.
   Do not use a full-screen setup gate on ordinary existing work.
6. **Understand the effect.** On accepted save show durable inline confirmation:
   **“Periods saved. Existing referral end dates are unchanged.”** Current server
   values replace the draft only on known success. A concurrent edit returns
   current saved terms with a concise review message; it must not silently keep
   a stale form looking saved.
7. **Control optional functionality.** Keep the existing plainly scoped **Allow
   missionaries to continue expired referrals** control and its Off default.
   Explain **“Stops new missionary continuations. Referrals already continued
   keep their end dates.”** Duration settings remain relevant to independent
   staff continuation, so do not hide them just because missionary self-service
   is Off. Restricting that capability must remain possible despite an invalid
   unsaved duration draft.

“Disable entirely” needs an exact scope, not an ambiguous Disable expiry switch.
Under the accepted D35/D36 rules, optional missionary continuation can be Off;
qualified source/role access can restrict other paths. Zero, empty or infinity
cannot stand for disabled expiry. A requested all-actor referral shutdown would
be a different product amendment with explicit consequences for staff and active
work; this review does not quietly infer it from a general customization phrase.

## Maya's everyday journey

| Moment                                 | Visible experience                                                                                                                          | Required meaning                                                                                                                                                            |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New active referral                    | Ordinary referral list/detail shows the source-approved recognizable label, Active status and applicable **Follow-up ends** date/time/zone. | Use its accepted initial terms; do not show a two-period comparison, settings form, countdown or prompt to pick a date.                                                     |
| Returning on another device or zone    | Same referral and accepted instant, formatted using existing preferences.                                                                   | Do not compute a new deadline or infer location from sensitive ministry information. The same instant may have a different local calendar date.                             |
| Expired entry                          | Existing D34 Expired filter shows only its currently permitted limited history and exact expiry when known.                                 | This remains separate from contactability. Missing date is unknown, not today or never. No alarming overdue badge or performance score.                                     |
| Deliberate continuation                | Existing **Continue referral** action explains the continued period and estimated end.                                                      | Current permissions/source eligibility still govern; no date picker or routine extra modal. New-period settings are irrelevant to this action.                              |
| Accepted continuation                  | **“Referral continued.”** Show actual accepted end and current permitted status.                                                            | Preserve list/filter context and meaningful focus when the row leaves Expired. Do not claim the current state is Active solely because an earlier action succeeded.         |
| Relevant terms changed while reviewing | **“The referral period changed. Review the updated end date.”** Refresh reviewed terms before a new deliberate intent.                      | A settings change is not permission for a stale action. D36's relevant-change semantics remain; ordinary within-date estimate drift alone does not trigger repeated review. |
| Response lost                          | **“We couldn’t confirm the result. Check status.”**                                                                                         | Recover the same intent. Do not make a second fresh cycle, show an optimistic Active badge or announce definite failure.                                                    |
| Continuation unavailable               | No actionable control; concise explanation only within the already authorized context if it helps.                                          | Do not expose a locked private entry, depend on a hover tooltip, send Maya to inaccessible settings or require a new staff-request queue.                                   |
| Tenant changes periods later           | Existing referral end date remains stable.                                                                                                  | The date is an accepted source fact, not a live formula reading today's settings.                                                                                           |

## UX hazards, severity, likelihood and precise prevention

Likelihood is a reasoned pre-mitigation estimate, not an observed defect rate.
These findings narrow B's delivery and preserve its selected flexibility.

| Concern                                                    | Severity / likelihood                              | Why it matters and evidence                                                                                   | Exact requirement to add                                                                                                                                                        |
| ---------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Silent inherited value or coupled fields                   | Medium / plausible                                 | A change to one period can unexpectedly change the other; the founder selected independent control.           | **The two configured values SHALL be independent; equal values SHALL be valid; missing one SHALL NOT fall back to the other.**                                                  |
| Initial clock implied by ordinary form copy                | High / plausible                                   | Q38 explicitly leaves the anchor open. Late entry/import could otherwise make old introductions appear fresh. | **Initial-period activation SHALL require an explicit source-owned start-event and late/import contract; UI copy SHALL describe that actual event, not choose it.**             |
| Unclear Disable/zero/empty semantics                       | High / plausible                                   | D35 Off only restricts the missionary lane; D36 rejects indefinite sentinel values.                           | **Optional-feature controls SHALL name the disabled actor/action; period input SHALL NOT disable expiry, erase accepted terms or broaden authority.**                           |
| New configuration blocks existing continuation             | Medium / likely without scoped readiness           | An existing tenant may have a valid continued setting before configuring initial periods.                     | **An absent initial setting SHALL gate only dependent initial operations and SHALL NOT invalidate a qualified continued setting or accepted windows.**                          |
| Date-only wording suggests the whole day remains available | High / plausible                                   | D36 ends at an exact instant; timezone/date-line effects are real.                                            | **The primary detail/action view SHALL expose the exact accepted end with time and zone; shortened list formatting SHALL not state an inclusive through-day promise.**          |
| Draft saved/accepted distinction collapses                 | High / plausible                                   | Concurrent edits and response loss occur on ordinary networks; wrong certainty encourages duplicate actions.  | **Saved, unsaved, rejected and unknown outcomes SHALL remain distinct; recovery SHALL target the original accepted effect.**                                                    |
| Two fields become a settings framework                     | Medium / likely under broad customization language | No evidence supports per-project calendars, inheritance, timers or formula builder.                           | **D38 SHALL add only the two organization duration values and reuse existing action/permission controls; no new override hierarchy is authorized.**                             |
| Keyboard/mobile/status failure                             | Medium / plausible                                 | Repository accessibility rules and W3C require semantic interactions and usable reflow.                       | **The settings and action flow SHALL preserve associated labels/errors, keyboard focus, shared touch targets, 320 CSS-pixel reflow and restrained accessible status messages.** |

## Verification needed before activation

These are acceptance criteria, not claims of completed runtime testing:

- Staff can locate, understand and save different values; equal values save too.
  They can accurately predict which value a new versus continued referral uses.
- Existing accepted dates stay unchanged after either policy value changes.
  Editing the new value cannot alter continued action terms, and vice versa.
- Untouched initial Not configured state preserves a qualified continued value;
  a deliberate invalid/cleared submitted value cannot masquerade as disabled.
- Missionary self-service Off works despite a draft duration error; staff scope
  remains independent; no setting edit grants contact or read permission.
- Cross-tenant/role values are never shown in settings, previews, errors,
  autocomplete or recovery. A read-only policy viewer cannot mutate it.
- Keyboard/screen-reader users hear the field's label, days unit, current value,
  error and saved/unknown result. Focus survives row disappearance and dialogs
  follow shared behavior. Color and toast are not the only meaning carriers.
- At 320 CSS-pixel width and zoom, long international names and localized exact
  end dates remain readable without horizontal form scrolling. Touch controls
  use Core's shared target conventions. No new address/name-entry convention is
  introduced by this feature.
- A slow/lost connection preserves inputs, prevents accidental duplicate taps,
  reports uncertainty honestly and recovers the same save/continuation. No
  offline privileged action is silently queued for later execution.
- Intended staff and missionaries can explain that expiry is a follow-up window,
  not proof of consent, erasure, failure or communication delivery. Any credible
  unsafe misunderstanding blocks rollout of the affected journey until fixed.

There was no observed-user study, real browser/assistive-technology session or
production-shaped performance run in this research. P28 product/UX and the
shared accessibility owner must own that proof. No UX adoption percentage or
universal day count is invented. The remaining initial clock and precise disable
scope must be settled explicitly by the main decision; they are not safe topics
to place in passive monitoring.
