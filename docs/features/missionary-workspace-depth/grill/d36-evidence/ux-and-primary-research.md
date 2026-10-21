# D36 — organization-set continuation period: UX and primary research

Research date: **October 18, 2026 UTC**. The founder selected **A — Use the
organization's configured period**: authorized staff set a finite period; Maya
sees the resulting end date and continues without choosing another date. The
request also emphasizes avoiding unnecessary complexity. This is product
direction, not measured user preference. The
[Q36 note](../phase28-q36-referral-window-policy-research.md) records the question
before that selection; D35 and its amendments are ratified.

**Recommendation: accept with required amendments.** Use one organization-wide
whole-day field for ordinary referral continuations, shared by authorized staff
and missionary actions. Do not supply an unsupported numerical default. Show
Maya the period and a clearly labeled estimated end before action; show the
source-accepted end afterward. Period changes affect new accepted cycles, while
already accepted deadlines stay intact.

The temporal proposal coordinated with the root reviewer is **exact elapsed
24-hour days from trusted source acceptance after waits**. It is an explicit
proposed D36 rule, not a claim that every ministry interprets a day this way or
that another ADR already governs this referral feature. The source controls the
actual acceptance and deadline; the browser only presents permitted facts.

This note supplies research, concrete copy and proposed acceptance outcomes. It
is not amendment ratification, a formal specification, a UI implementation,
production proof or a new permission grant. No old evidence/model/verifier is
modified or rerun.

## Governing evidence and current limits

| Source inspected                                                                                                                                                                                                         | Established boundary                                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Founder referral journey](../phase28-founder-brief.md:137)                                                                                                                                                              | Referrals require source-linked history, expiry and deliberate continuation. No universal period, automatic extension or contact permission follows.                                                                                 |
| [Q36 scope](../phase28-q36-referral-window-policy-research.md#scope-left-unselected-by-the-original-question)                                                                                                            | The selected question concerns the renewed period, not the initial referral window, retention, consent or per-use arbitrary date-setting power.                                                                                      |
| [D35 C05/C06](../phase28-d35-referral-continuation-adversarial-review.md#exact-required-amendments)                                                                                                                      | The source must establish and explain current window terms and check authority after waits. A generic Active status is not sufficient. D36 supplies the proposed period rule within that boundary.                                   |
| [D35 exact decision](../phase28-d35-referral-continuation-adversarial-review.md#exact-corrected-decision-to-record)                                                                                                      | One missionary self-service control, initially Off for new/unconfigured tenants; staff authority remains independently governed. A source period does not enable that capability. Accepted work is not undone by later Off.          |
| [D34 amendments](../phase28-d34-expired-referral-history-adversarial-review.md#exact-required-amendments)                                                                                                                | Expired history remains a minimal current-purpose projection. Names, dates, counts and action context are not public by default.                                                                                                     |
| [P9 canonical ownership](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:353) and [owner constraint](../../../../prds/program-roadmap/owner-constraints.md:81)                         | Native CRM owns relationship identity, provenance, expiry and source reporting. The period must not be implemented as an app-only clock or duplicate referral store.                                                                 |
| [P12 actor context](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1552) and [purpose](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1654)      | Current source/action/field authority and contactability remain separate. A longer window does not lengthen a grant or override privacy.                                                                                             |
| [ADR-0183 elapsed-clock passage](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:470)                                                                                                       | A different, specifically scoped source reminder uses immutable source-anchored elapsed seconds after serialization. It is a useful architectural precedent, not inherited authority, a referral duration or a reminder to add here. |
| [Shared UI contract](../../../../../packages/ui/AGENTS.md:5), [configuration](../../../../../packages/ui/components.json:3), [frontend rules](../../../../ai/rules/frontend.md:14)                                       | Exact `base-maia`, Base UI, shared `@asym/ui` ownership and semantic tokens remain governing.                                                                                                                                        |
| [Field](../../../../../packages/ui/components/shadcn/field.tsx:1), [input](../../../../../packages/ui/components/shadcn/input.tsx:1) and [number field](../../../../../packages/ui/components/shadcn/number-field.tsx:1) | Existing shared primitives can provide one labeled period field with associated help/error feedback. No calendar library or new widget system is needed.                                                                             |
| [Accessibility review](../../../../ai/skills/accessibility-review/SKILL.md:1), [testing rules](../../../../ai/rules/testing.md:20)                                                                                       | Browser interaction, focus, actual rendering and accessibility must be tested later. Documentation checks cannot establish them.                                                                                                     |

The complete source continuation/window producer and live authorization paths
are not qualified by this UX lane. Existing static evidence from Q36/D35 remains
bounded historical evidence. No authenticated competitor application or Core
user interview was run. The recommendations below distinguish documented facts,
product judgments and release proof still needed.

## Fresh primary research

All sources below were directly opened on **October 18, 2026**. An undated page
or old manual is not newly published because it was fetched today. Source claims
are limited to publicly readable documentation; screenshots' filenames are not
used as publication dates.

| Primary source and date                                                                                                                                                               | Verified documented behavior                                                                                                                                        | Useful lesson and limit                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [MPDX — Create, Edit, and Log Tasks](https://help.mpdx.org/article/180-create-edit-and-log-tasks), updated February 18, 2021                                                          | Task creation distinguishes a due date/time and notification timing.                                                                                                | Fundraising users encounter explicit timing, but a task due date or notification is not a referral access window. Do not copy mandatory per-use task inputs or reminders into D36.      |
| [Pipedrive — Rotting feature](https://support.pipedrive.com/en/article/the-rotting-feature), updated September 3, 2026                                                                | Staff configure inactive days; edits, activity and email operations can reset the inactivity count, sometimes without visible change history for a reader.          | A simple labeled period field is relevant. Its resetting attention timer is the wrong authority model for referral expiry; no edit, email or logged activity may silently extend D36.   |
| [CoachAccountable — Course Actions](https://www.coachaccountable.com/knowledgeBase/coaching/courses/building/actions), undated current knowledge-base page                            | Course action due dates can be relative days plus a time, anchored to when the action is assigned rather than course start.                                         | State the correct anchor rather than leaving “days” ambiguous. Do not import its calendar/time controls, course completion, notifications or progress metrics.                          |
| [CoachAccountable — Making Actions Better](https://blog.coachaccountable.com/2013/07/making-actions-better/), July 3, 2013                                                            | Displays the client's corresponding time when coach and client use different time zones.                                                                            | A visible time zone helps people share a deadline. This is dated domain precedent, not a modern usability study or a reason to create a coach view for referral windows.                |
| [Microsoft Planner — Time, time zones and working time](https://support.microsoft.com/en-us/planner/planner-time-zones-working-time), current undated support article                 | Different zone views represent one deadline; converted dates can fall on another day. The article explicitly describes gradual rollout of basic-plan time features. | Distinguish stored deadline from display zone. Do not claim universal deployed availability or import plan working calendars, time-display switches or a second zone setting into Core. |
| [UK Home Office — Date-time](https://design.homeoffice.gov.uk/design-system/components?name=Date-time), current undated guidance                                                      | Uses readable date/time presentation with machine-readable time semantics; states that ordering and clock format should suit users.                                 | Present an unambiguous absolute endpoint. Its UK-specific preference for a 12-hour clock is not a universal rule for Core's international audience.                                     |
| [TC39 — Temporal.Duration](https://tc39.es/proposal-temporal/docs/duration.html), current undated technical documentation                                                             | Conversion between days and hours can consider time-zone offset changes when a zoned relative point is supplied; fixed 24-hour interpretation is distinct.          | Calendar days and elapsed hours are not interchangeable. This establishes the distinction, not a need for a new dependency or the product choice itself.                                |
| [GOV.UK — Text input](https://design-system.service.gov.uk/components/text-input/), current guidance                                                                                  | Whole-number inputs should support a numeric mobile keyboard; warns that native number inputs can change accidentally during scrolling.                             | Use one labeled shared field with deliberate editing and error feedback. Do not copy GOV.UK's components or bypass Core's Base UI ownership.                                            |
| [GOV.UK — Error message](https://design-system.service.gov.uk/components/error-message/), current guidance                                                                            | Specific error descriptions are more useful than generic “required” or “an error occurred” messages.                                                                | Explain empty, fractional or out-of-range period input beside the field. Do not describe a server/network failure as an invalid number.                                                 |
| [W3C — Labels or instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html), current explanatory guidance                                                 | Inputs need sufficient labeling/instructions; excessive instruction can also confuse.                                                                               | Show units and the effect of saving without a dense policy essay or placeholder-only label.                                                                                             |
| [W3C — Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), current explanatory guidance                                                               | Appropriate dynamic feedback is programmatically available without unnecessary focus interruption.                                                                  | Announce save, failure and material preview changes; do not announce every passing second.                                                                                              |
| [W3C — Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) and [Focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html), current explanatory guidance | Ordinary content should reflow at 320 CSS pixels under stated exceptions; focus order preserves meaning and operation.                                              | Period editing and continuation must remain understandable on phones and after a row moves out of Expired. Guidance is not a completed conformance test.                                |

No inspected source establishes a correct default of 14, 30, 90 or 365 days, an
appropriate maximum for all ministries, a legal retention period or empirical
Core user preference. Those numbers must not be represented as researched best
practice. Illustrative examples below are arithmetic examples, not policy
recommendations.

## One staff setting, with no hidden link to self-service

Recommended field label:

> **Follow-up period after continuation**
>
> **Days**
>
> The new follow-up period ends this many 24-hour days after continuation is
> accepted. Current access and contact rules still apply.

Place this in the existing referral/relationship settings area, near the D35
missionary self-service control. Keep the period field available while that
control is Off: authorized staff still need the same qualified ordinary
continuation terms. Hiding it behind missionary On would turn a timing rule into
an accidental staff restriction.

Use one positive whole number and one unit, **days**. Do not add day/week/month
selectors, business-day calendars, weekend rules, a time-of-day selector,
per-ministry exceptions or separate staff/missionary defaults. A qualified
existing ordinary referral-policy surface may host it, but D36 must not silently
change the initial-referral period or invent reuse of an unestablished policy.

Use the existing form's Save convention. A period edit is not saved merely
because focus leaves the field unless that is already the governing settings
pattern. Saving a period must never turn missionary self-service On. The setting
summary can show the accepted period and actual saved/effective state without
forcing staff through a separate publication screen for every ordinary edit.
Actual policy governance remains binding where it applies.

### Unconfigured and invalid states

For new/unconfigured scope, leave the period **unset** rather than silently
inserting an arbitrary default. Show authorized administrators:

> **Set a follow-up period before referrals can be continued.**

Unconfigured terms are a source setup condition for ordinary staff and missionary
continuation, not proof that staff lost permission. Source qualification still
blocks the action until valid terms exist. Missionaries who cannot configure it
receive concise permitted help, not an editable date form or an instruction to
guess a deadline. D34 history remains independently available.

Once a valid period exists, do not offer **Clear period** as a second disable
control. Staff can enter another valid period; actor permissions and the D35
self-service control retain their separate meaning. An empty draft edit fails
validation without deleting the saved policy.

Suggested field errors:

- Missing value: **“Enter the follow-up period in days.”**
- Fraction, zero or negative: **“Enter a whole number of days greater than zero.”**
- Outside the supported range: **“Enter a number of days within the shown range.”**
- Save failed: **“The period couldn't be saved. Your previous setting is unchanged.”**
  Use the last sentence only after a definite no-effect failure; an unknown save
  outcome instead offers safe status recovery.
- Another administrator changed it: **“This setting changed. Review the current
  period before saving.”** Preserve the user's unsaved input without overwriting
  the newer accepted policy.

The supported finite upper bound must be published and validated by the owner
before activation. The UI's range/help and server validation come from that same
qualified constraint. This note does not invent a maximum of 365 days or freeze a
storage representation. Reject unsupported values explicitly rather than clamp,
round, coerce an overflow or interpret blank/zero as indefinite.

## Policy edits affect new cycles only

Before Save, show the consequence in one short sentence:

> **Applies to referrals continued after this change takes effect. Existing
> follow-up end dates stay the same.**

This is a prospective policy change, not a bulk extension or shortening. A
current period edit does not rewrite old cycle terms, backdate acceptance,
restart retention or remove history. Where approval delays effectiveness, show
pending versus current values truthfully; do not call a submitted request the
active period.

An unaccepted continuation reviewed under materially superseded policy must
refresh its terms and require a new deliberate action. Do not silently apply a
new number, even if the changed period sounds beneficial. An already accepted
continuation keeps its accepted endpoint; later source correction or restriction
still follows its own qualified contract. D35 Off does not rewrite that endpoint.

## Time semantics: one rule, clear display

Proposed exact rule: **one configured day means 24 elapsed hours**. The new
cycle starts at the trusted source acceptance instant after required waits;
its deadline is that instant plus the configured number of 24-hour periods.
There is no new local-midnight rule, timezone-derived extra day or early expiry
because a daylight-saving transition occurs.

This recommendation avoids a separate business/calendar/time-of-day policy.
The strongest alternative is a local-calendar deadline at a fixed civil time,
which can better fit some workflows but requires explicit zone, gap/overlap and
end-of-day conventions. No observed ministry need establishes that added policy
here. Do not implement a hidden calendar-day interpretation while labeling the
field as the elapsed rule.

Example arithmetic, checked with Python's standard-library UTC arithmetic and
`zoneinfo` in this lane; this is **not a product test**:

| Illustrative accepted start in New York | Two elapsed days later            | Meaning                                                                             |
| --------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------------- |
| 7 March 2026, 10:00, UTC−05:00          | 9 March 2026, 11:00, UTC−04:00    | Exactly 48 hours across spring daylight-saving change; local clock time advances.   |
| 31 October 2026, 10:00, UTC−04:00       | 2 November 2026, 09:00, UTC−05:00 | Exactly 48 hours across autumn daylight-saving change; local clock time moves back. |

Two days is illustrative, not a selected default. The accepted absolute endpoint
stays the same when a user travels, changes display zone or changes locale. Use
the existing resolved display-zone convention and make the zone explicit. A
source-qualified fallback such as clearly labeled UTC is preferable to an
unlabeled guessed zone; this is not a new per-referral timezone setting.

### Date, time and zone presentation

Show a readable localized date **and time**, with a named zone and its offset at
that endpoint. For example, **“1 November 2026, 19:00 (Bangkok, UTC+07:00)”**.
The example is formatting guidance, not a selected period. A 12- or 24-hour clock
follows existing locale/user conventions; never force a UK-specific format
because one design-system page uses it.

Avoid **“through 1 November,” “valid until midnight,” “14 days left”** as the only
representation. Those phrases imply unselected day-boundary rules or hide the
absolute deadline. A relative description may supplement an absolute endpoint
but cannot replace it. Preserve actual endpoint precision; formatting must not
round into another date or conceal a material timezone difference. If exact
seconds are material to a boundary view, make them available in that context
without a constantly ticking countdown.

An abbreviation such as CST is insufficient by itself because it is ambiguous.
The visible offset must correspond to the endpoint, not the user's current
summer/winter offset. When a zone's clock repeats a time, the offset distinguishes
the occurrences. Daylight-saving rules affect presentation, not elapsed duration.

## Maya's journey and honest previews

1. **Find the existing referral.** Maya uses D34's Expired view and D35's current
   authorized **Continue referral** action. The period rule does not expose any
   additional name, private note or referrer context.
2. **See the organization-set effect.** Show the number of days and a clearly
   labeled estimated endpoint beside the action. No date picker, override or
   new settings trip is required.
3. **Continue deliberately once.** The source checks current policy, scope,
   expiry/cycle and permission after waits, then accepts one cycle with an
   authoritative start and endpoint. A preview is not acceptance.
4. **Receive the actual result.** Use D35's **“Referral continued.”** plus the
   accepted endpoint when currently permitted. Current Active visibility is
   independently checked. If the row leaves Expired, keep the filter, accessible
   outcome feedback and logical focus rather than navigating unexpectedly.

Suggested pre-action copy:

> **Continues for N days.**
>
> **Estimated end: [localized date, time and zone].**
>
> The period starts when continuation is accepted. Contact rules still apply.
>
> **Continue referral**

`N` and the endpoint stand for source-supplied values, not user inputs. The
estimated label is necessary because acceptance occurs after review and network
or serialization waits. Do not present the preview timestamp as an exact
promised endpoint and silently move it after the click. Do not shorten the
accepted period by anchoring it to page load just to make that preview exact.

Ordinary clock advance within the displayed end calendar date does not require
second-by-second equality, reauthorization on every timer tick or another modal.
The estimate honestly accommodates that timing difference. The actual accepted
endpoint is shown afterward. Before acceptance, a changed relevant policy or a
changed displayed end calendar date requires refreshed terms and a new deliberate
intent. This includes the realistic near-midnight case; do not silently give
Maya a different end date from the one she reviewed.

Suggested changed-date feedback:

> **The estimated end date changed. Review the updated date before continuing.**

Refresh the small existing action context, keep its understandable identity and
show the normal **Continue referral** control again. A changed zone/display
context must be made explicit and the reviewed presentation refreshed; changing
presentation is not authority to alter an already accepted endpoint. No new
calendar form or mandatory per-use confirmation is needed.

Do not live-update the text every second or continuously announce it to a screen
reader. Refresh when source/policy/context becomes stale or the user re-enters
the action, and handle the acceptance boundary authoritatively. Long same-date
waits remain estimates; do not imply the exact preview time was guaranteed or
invent a UI-only timeout that changes source authority.

## Pending, errors and lost responses

| Situation                                               | Clear behavior                                                                                                                                                                                             |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Period not configured                                   | Authorized staff see the setup field and explanatory state. Other users see only permitted unavailable-action guidance; no arbitrary fallback period appears.                                              |
| Policy fetch fails                                      | **“Couldn't load the follow-up period. Try again.”** Do not present unset, zero, a remembered cross-tenant value or a usable unqualified action.                                                           |
| Continuation in progress                                | **“Continuing…”** with appropriate accessible pending feedback. Prevent accidental repeat input; source idempotency still governs.                                                                         |
| Relevant policy changes before acceptance               | **“The follow-up period changed. Review the updated period before continuing.”** No silent accepted substitution.                                                                                          |
| Definitive source rejection                             | Preserve independently readable history and explain only permitted facts. Do not claim an active cycle or a new end date.                                                                                  |
| Lost or ambiguous response                              | **“We couldn't confirm the result. Check status.”** Recover the same original intent; do not recompute another deadline or create a new cycle.                                                             |
| Proven accepted result, later current-state fetch fails | **“Referral continued. Current status is unavailable. Refresh.”** An accepted endpoint may be shown as that recorded cycle's endpoint if currently authorized, not as a guarantee of current Active state. |
| Another actor already continued                         | Show the actual permitted current state and its accepted endpoint. Do not attach Maya's preview period/deadline to somebody else's accepted cycle or claim her authorship.                                 |
| Later restriction or ordinary expiry                    | Current state and disclosure follow the owner. The prior accepted cycle remains historical evidence, not proof that this actor may still see or contact the person.                                        |

D35's safe recovery semantics remain unchanged: a recovered result refers to
the original accepted cycle, even after another policy edit, another expiry or
self-service Off. No browser offline queue, automatic re-enable replay or
background renewal is introduced. Editing a task, logging a call, sending an
email or opening the record does not move the deadline.

## Phone, input and accessibility

Use shared Field/Input or the qualified shared NumberField composition, with a
visible label, unit and associated error/help text. An on-screen numeric keypad
is useful for the whole-day value. Avoid accidental scroll-wheel changes,
placeholder-only units, silently rounded fractions and a small spinner as the
only way to edit. Existing number-field availability is not proof its chosen
composition has passed this exact form's keyboard/touch tests.

The normal layout is one staff field and one compact read-only missionary terms
block. Do not add a calendar widget, two-column policy editor or duration slider.
Long dates, zones and international names wrap at phone width; no essential
meaning depends on a tooltip. Use standard readable time semantics and the
existing Core locale conventions. Keeping both date and zone visible is more
useful than an oversized countdown or animated urgency treatment.

Validate 320 CSS-pixel reflow, zoom, touch targets, keyboard operation, visible
focus, status announcements and reduced motion in the implemented journey.
Source terms changing should be announced once as meaningful feedback, without
moving focus unexpectedly. After an accepted row leaves Expired, use D35's
logical surviving focus/outcome location. Preserve form input on recoverable
errors without preserving unauthorized or cross-tenant source facts.

## Material concerns and precise amendments

Severity/likelihood below are qualitative assessments of likely naive designs,
not measured incident rates.

| Concern; severity / likelihood                                               | What could go wrong and why it matters                                                                                               | Exact proposed requirement                                                                                                                                                                                                                                                                    |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Arbitrary numerical default; Medium / High if examples are copied            | A plausible 30-day period becomes presumed ministry policy without evidence or an explicit organization choice.                      | **“New/unconfigured scope SHALL have no implied continuation period. Source continuation requires an explicitly configured, validated finite whole-day value; unsupported input SHALL fail rather than be clamped or treated as indefinite.”**                                                |
| Off hides staff timing configuration; High / Medium                          | Staff remain authorized under D35 but cannot configure their shared source terms, or saving terms accidentally enables missionaries. | **“The ordinary continuation period SHALL apply consistently to authorized staff and missionary cycles. Its configuration remains available to authorized staff while missionary self-service is Off; saving it SHALL NOT enable self-service.”**                                             |
| Calendar/elapsed mismatch; High / High without explicit semantics            | DST, timezone or month arithmetic silently changes the length or date shown.                                                         | **“Each configured day SHALL mean exactly 24 elapsed hours from trusted source acceptance after waits. Display-zone changes SHALL NOT alter the accepted absolute endpoint.”**                                                                                                                |
| Preview presented as guaranteed; High / Medium                               | Network delay or midnight moves the accepted date without Maya realizing; freezing page-load time shortens the new period.           | **“Before acceptance show the source-derived period and explicitly estimated end. A relevant policy or displayed end-calendar-date change SHALL require refreshed review and a new deliberate intent; ordinary estimated-time drift SHALL NOT create a second-by-second confirmation loop.”** |
| Retrospective policy edits; High / Medium                                    | A staff settings change quietly shortens or lengthens existing active windows and invalidates previously understood deadlines.       | **“Ordinary period changes SHALL apply to newly accepted cycles after effectiveness. Existing cycles retain their accepted period and endpoint; source correction remains a separate qualified operation.”**                                                                                  |
| Duplicate retries create new dates; High / Medium                            | Lost responses, policy edits or another expiry cause recovery to start the clock again.                                              | **“Recovery SHALL return the original permitted outcome and endpoint without recalculating or extending the accepted cycle. Unknown outcomes SHALL not be displayed as rejection or success.”**                                                                                               |
| A date implies all-day availability; Medium / High if date-only copy is used | Users assume access through midnight although the source expires earlier.                                                            | **“Present the relevant endpoint as an unambiguous localized date/time with visible zone/offset, not an unselected through-day convention or relative count alone.”**                                                                                                                         |
| Tiny timing choice becomes a scheduler; Medium / Medium                      | Extra calendars, period overrides, reminders and reset-on-activity behavior create complexity and hidden extensions.                 | **“D36 SHALL introduce no per-continuation date choice, business-day engine, recurring extension, countdown, extra notification or activity-based deadline reset.”**                                                                                                                          |
| Unknown producer or bounds treated as ready; High / Medium                   | Attractive copy masks missing authoritative terms or unsupported overflow limits.                                                    | **“Before activation, the source SHALL qualify supported bounds, current policy/acceptance arithmetic and display/recovery behavior; the UI SHALL use that same validated constraint and SHALL NOT invent an operational fallback.”**                                                         |

## Strongest alternatives

**Permitted individual date adjustment** is the strongest product alternative:
it can suit an exceptional case but adds a user choice and date-setting power.
The founder selected organization configuration instead. Do not smuggle the
alternative into an Advanced link or staff-only per-command date override in the
ordinary continuation path.

**One fixed Asym number** would remove configuration but no researched source
justifies a universal value. **Calendar-day expiry at a chosen local time** can
be understandable, but adds zone and DST policy without demonstrated need here.
**A fixed preview endpoint** is visually simple but consumes part of the new
period while the user waits. **A mandatory confirmation modal** does not solve
stale source terms and adds friction when it repeats already visible facts.
The proposed organization period, honest estimate and accepted endpoint are the
clearest bounded path within the selected answer.

## Later proof that makes the journey real

1. New/unconfigured scope shows no implied number. Valid configuration is
   possible with missionary self-service Off, and saving it leaves that control
   unchanged. Clearing an existing field does not delete the accepted policy.
2. Empty, fractional, zero, negative, unsupported large and overflow values
   receive accurate field feedback. Actual supported minimum/maximum and their
   adjacent invalid values are exercised once the owner-qualified bound exists.
3. Staff and missionary continuation of the same kind of eligible source use
   the same accepted period, with independent action authority. No permission
   or initial-referral-period change follows from editing this setting.
4. Before acceptance, Maya can explain the period, estimated end and absence of
   a date choice. She understands that nothing was sent and contact rules still
   apply, without facilitator coaching beyond the ordinary UI.
5. Spring/fall DST, positive/negative offsets, different locales and changing
   display zones preserve exactly the same elapsed duration and accepted
   absolute endpoint. Date/time/zone display remains unambiguous.
6. A preview near midnight that would produce a different displayed calendar
   end date refreshes and needs a fresh deliberate action. Harmless passing
   seconds within the disclosed estimate do not create a rejection loop.
7. Relevant policy revision during review rejects stale terms without silent
   substitution. An ordinary later policy edit leaves previously accepted
   endpoints unchanged and is clearly described in the settings UI.
8. Lost response, duplicate request, another actor's continuation, later expiry
   and self-service Off recover the same original outcome without starting a
   fresh clock. Durable outcome and current Active state remain distinct.
9. Real phone/touch, keyboard, focus, screen-reader, zoom/reflow, long names and
   zones, weak connection and unavailable-source states pass the whole journey.
10. No record edit, communication, task completion, login, settings read or
    display refresh renews a referral or restarts retention.

These are proposed acceptance cases, not executed product tests. The two DST
arithmetic examples were checked independently with standard-library UTC/zone
conversion; they establish those examples only. Formatting and reference checks
are documentation evidence. Source policy, migration, database/RLS, concurrency
and actual user/comprehension qualification remain required in their owning
implementation work before activation.
