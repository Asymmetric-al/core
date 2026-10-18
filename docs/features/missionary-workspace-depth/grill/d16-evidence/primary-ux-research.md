# D16 — goal authority, settings and editing UX evidence

Research date: **October 16, 2026 UTC**. Research only; no application changes,
new dependencies, authenticated competitor accounts or user studies. The founder
selected **missionary goal setting when the organization permits it**. The meaning
of the additional staff/project “on/off/optional” wording is being clarified by
the root review. This note does not silently turn it into compulsory goals,
per-record access rules, permission overrides or a finance-plan requirement.

## Recommendation and limits of the evidence

Put **Set goal / Edit goal beside the permitted goal**, with a short, ordinary
amount/currency/period form and explicit Save. Resolve actual rights on the server;
show a useful staff-managed state when editing is not permitted. Reuse existing
tenant permission settings and the existing base-maia/Base UI form components.
Do not make missionaries navigate a general account-preferences screen merely
because older MPD software stores a goal there.

For settings, use the smallest control that represents the selected policy truth.
An editing permission can be binary. An inherited editing policy can need a third
**Use organization default** choice. **Required / Optional / Off** would express a
different policy about whether a goal must exist or be used. None of those three
meanings should be inferred from the word “optional.” The root clarification is
needed to select the policy, not to select a visual component.

Competitor help supports visible goal context, direct editing and distinct
permissions. It does not prove which policy makes Asym users more successful or
that a vendor's goal has Core's finance, privacy or temporal semantics. The strongest
simple alternative is staff-managed goal values under the same source, still
available to organizations through policy. A universal staff-only product would
remove the missionary discretion already selected in A.

## Current primary comparator evidence

All sources were inspected on the research date. “Documented procedure” means
official public instructions, not a verified authenticated session. An undated
current page is not a dated release or guarantee of runtime capability.

| ID  | Primary source and date                                                                                                                                                                                                                      | Documented job/behavior                                                                                                                                                                                                          | Confidence, limit and Asym implication                                                                                                                                                                                                                                |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B01 | [MPDX Preferences](https://help.mpdx.org/article/454-preferences-settings), updated **2022-09-22**                                                                                                                                           | Monthly Goal appears in account preferences and can be edited and saved; the text says the organization should set its amount. MPD Info has start/end dates and a recurring commitment goal, with a development/accuracy caveat. | Dated documented procedure. Supports separating amount-setting responsibility from who enters it; does not establish exact current permission checks or a mandatory approval workflow. Do not import the caveated goal calculation.                                   |
| B02 | [MPDX quick settings guide](https://help.mpdx.org/article/1368-mpdx-quick-reference-guide-settings), updated **2024-06-25**                                                                                                                  | Recommends the organization's monthly goal and MPD timeframe. Language/locale affects presentation; default currency matters to donation reporting.                                                                              | Official guide, not an Asym currency contract. Do not change a goal's ISO currency when a person changes display language or preferences.                                                                                                                             |
| B03 | [TntConnect General options](https://www.tntware.com/tntconnect/help/en/pages/options-general.aspx) and [Analysis view](https://www.tntware.com/tntconnect/help/en/pages/analysis-analysisview.aspx), no publication/update date established | Monthly goal is used in support-progress analysis; General options documents editing it by double-clicking the Monthly Goal text in Analysis. Analysis distinguishes the goal from averages/commitments.                         | Concrete desktop documentation. Supports access near the goal, but hidden double-click editing is a poor phone/discoverability prescription. No tenant role/default inheritance evidence follows from a desktop options field.                                        |
| B04 | [Sola features](https://www.trustsola.com/features), undated current marketing                                                                                                                                                               | Describes monthly/one-time fundraising goals and configurable permissions for leaders/administrators to oversee support progress. It also advertises creating a fundraising plan.                                                | Vendor product claim, not an authorization specification or success study. Does not show exact goal-edit rights, project override precedence, mandatory participation or goal/finance source separation. Do not import its “Require a Plan” heading as Core policy.   |
| B05 | [Epistle MPD](https://www.epistle.org/mpd/), undated current marketing                                                                                                                                                                       | Says it helps missionaries track progress/reach goals and describes MPD/CRM/coaching/currency capabilities. Some mobile coverage retains “soon” language.                                                                        | No inspected exact goal editor, permission/default hierarchy or financial goal calculation contract. This is useful scope context, not evidence for a three-state policy or implemented app parity. No fundraising efficacy claim is adopted.                         |
| B06 | [HubSpot sales goals](https://knowledge.hubspot.com/reports/create-sales-goals), updated **2026-08-06**; [custom goals](https://knowledge.hubspot.com/reports/create-custom-goals), updated **2026-06-30**                                   | Goals have contributors, measure and duration; custom monetary goals identify currency. Its reporting compatibility requires matching date property/frequency. Creation/editing depend on permissions and product seats.         | Current documented procedure. Useful support for explicit measure/currency/period and qualified comparisons. Its quotas, account-wide goal-name uniqueness, commercial seats, formulas, team rankings and refresh timings are not Core rules.                         |
| B07 | [HubSpot goal management](https://knowledge.hubspot.com/goals/view-and-manage-your-goals), updated **2025-11-26**; [permissions guide](https://knowledge.hubspot.com/user-management/hubspot-user-permissions-guide), updated **2026-10-13** | Goal detail has a visible Edit goal action; Quick edit includes target amount. Permissions separately control goals and View/Edit levels. Goal detail exposes duration/dates/creator.                                            | Strong current UI/permission comparator. Direct edit is compatible with governed access; a broad “Goals on” label is not enough to explain whether someone can view, create or edit. Do not copy its general reporting/dashboard builder.                             |
| B08 | [Salesforce permission-group muting](https://trailhead.salesforce.com/content/learn/modules/permission-set-groups/mute-permissions-in-permission-set-groups), undated current official training                                              | Muting a permission in one group does not remove the same permission supplied by another profile/permission set/group. Its summaries account for effective permissions.                                                          | Concrete example of configuration differing from effective access. This does not select Salesforce's additive permission model for Core. It supports showing effective result and source rather than presenting an unchecked local switch as an authoritative denial. |
| B09 | [Atlassian Goals permissions](https://support.atlassian.com/platform-experiences/docs/set-up-permissions-for-goals-app/), current public help, no update date captured                                                                       | Site default applies to **new** goals; existing goals retain their access. General/specific access are separately documented.                                                                                                    | Relevant modern goal-settings counterexample: “default” can mean a creation-time starting value rather than live inheritance. Core must name its own semantics. Do not import this product's goal-sharing ACL, owner rights or notifications.                         |

The evidence does not support mandatory team leaderboards, a custom rules editor,
routine goal-change approvals, inherited numeric targets, or automatic newsletter/
coach/public-page updates. The ability to record a target is useful independently
of those features.

## Source separation the UI must preserve

The [founder brief](../phase28-founder-brief.md), [Q16 owner research](../phase28-q16-goal-authority-research.md)
and accepted [ADR-0098](../../../../adr/0098-optional-approved-support-plans-and-bounded-workspace-publication.md)
already distinguish P28 Goal Versions, P21 approved finance Support Plans and
prospective public-page goal adoption. These are stronger authority than a
competitor's product model. The Q16 note's earlier Awaiting answer status is
superseded only for the A/B answer by the current founder selection; it is not
evidence that the extra policy detail has been selected.

| Meaning                                          | Clear presentation                                                                             | Avoid                                                                                                                                                |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Internal fundraising target                      | **Monthly support goal — USD 2,500** or the source's exact qualified special-gift goal/period. | Salary, available balance, approved spending or a promise of monthly income.                                                                         |
| No goal recorded                                 | **No goal set**, with Set goal only if currently allowed.                                      | Defaulting missing data to 0, 0% progress or “fully funded.”                                                                                         |
| Staff manages the permitted goal                 | Show the actual goal with **Managed by your organization** and useful source context.          | A broken Edit button; hiding the authorized value merely because editing is denied.                                                                  |
| Approved-plan adoption, when separately eligible | **Copy from approved plan** with exact plan/version, amount, currency and scope before Save.   | Live sync, overwriting the plan, inferring a goal from any visible balance or making a finance plan mandatory.                                       |
| Goal changed internally                          | Show the newly accepted Goal Version and effective context.                                    | Rewriting old goal versions, labeling earlier progress against a new denominator without qualification, or silently changing a released public goal. |
| Public giving target                             | Its own currently released target/source binding.                                              | Suggesting that Save goal publishes or replaces it. A short boundary note is appropriate where confusion is likely.                                  |
| Optional coach goal sharing                      | Only the already authorized shared goal/version and compatible context.                        | Treating edit permission as permission to share or granting the read-only coach an editor role.                                                      |
| Goal progress                                    | Source-qualified amount/measure plus compatible goal/currency/period and currentness.          | Dividing any visible total by any target or importing a vendor's forecasting formula.                                                                |

## Policy control options pending the clarified meaning

These are **conditional designs**, not three policy proposals to implement at once.
Use the existing settings surface and source-capability resolver. Goal **values**
and the policy governing **who may change them** are different records and jobs.

| If the selected product meaning is…                                        | Smallest useful control                                                                                                              | Consequence shown in plain language                                                                                                                                                                                                                            |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Organization allows or disallows missionary editing                        | A clearly labeled two-choice setting: **Missionaries may edit their own goals** / **Staff manage goals**.                            | State the affected scope. Permission to edit remains subject to current source rights; this control grants neither staff-wide access nor public publication.                                                                                                   |
| Selected missionary/project exceptions inherit a live organization default | At that supported scope only: **Use organization default — [current result]**, **Allow missionary editing**, **Staff manage goals**. | Show **Effective setting: … · From organization default / This [scope]**. Show a reset-to-default action only where an override exists. A changed parent affects inherited settings, not explicit overrides, only if that precedence is the selected contract. |
| Default is merely the starting value for future records                    | Label **Default for new [supported scope]** and explain existing records are unchanged.                                              | Do not label a copied value “inherited.” B09 demonstrates why the distinction matters.                                                                                                                                                                         |
| Goals are required/optional/disabled                                       | Three explicit policy labels can represent that selected meaning, with its independently defined effect.                             | This cannot stand in for edit authority; “Required” would add an obligation not selected merely by A. Do not invent this behavior while clarification is pending.                                                                                              |

For two or three mutually exclusive policy choices, vertically stacked radios
usually keep meanings and short explanations visible on a phone. This is a design
recommendation, not a requirement to replace every existing permission control.
If the existing settings convention uses a binary control and the semantics are
truly binary, reuse it with a precise label and visible result. Do not encode
inheritance using an ambiguous half-checked checkbox or use a three-position
switch with only On/Off/Optional text.

Loading is not Off. An unavailable policy resolver is not a staff-only policy.
Show a noninteractive loading/unavailable state until truth is known. After Save,
show the accepted effective result. If another administrator changed the policy,
show the current result and resolve the conflict; do not silently overwrite it.
Permissions still need server enforcement on every write, regardless of the
control's appearance. Do not hard-code job titles as access authority.

## Minimal end-to-end journeys

| Actor / point in journey        | Proposed behavior and copy                                                                                                                                    | Important boundary                                                                                                                                  |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authorized staff opens settings | One goal-policy section in the existing relevant organization settings, with supported scope and the effective result.                                        | Do not add a nested rule builder, arbitrary audience editor or per-goal approval queue.                                                             |
| Staff changes a policy          | Select the actual policy, read a concise consequence, then **Save changes**.                                                                                  | Do not activate several new permissions merely by expanding the section. A routine reversible setting does not need a second confirmation modal.    |
| Missionary sees a goal          | Amount, ISO currency, recurring/special meaning and period are legible together; **Edit goal** appears only with actual capability.                           | Editing denial does not erase permitted read access. An unavailable source is not “No goal set.”                                                    |
| Missionary opens Edit goal      | Carry existing value and context into one short form. Show amount and currency together; only qualified editable fields are controls.                         | Do not silently choose USD or infer period from the browser date. No separate “make public” control belongs in this routine internal edit.          |
| Missionary enters an amount     | Useful decimal keyboard, persistent label, clear currency/period, source-qualified precision validation.                                                      | Input mode is a keyboard hint, not validation or decimal-safe money storage.                                                                        |
| Missionary saves                | **Save goal**; during submission prevent duplicate mutation without losing focus/input. Show **Goal saved** only after authoritative acceptance.              | A timeout means save unconfirmed until exact reconciliation; do not manufacture a second version with a new request key.                            |
| Policy changes mid-form         | **Your organization now manages this goal. Your changes weren't saved.** Refresh the allowed view and preserve safe unsaved input only while still permitted. | Use this wording only after proving rejection. A lost response might already have saved and needs reconciliation instead.                           |
| Goal changes in another tab     | **This goal changed while you were editing. Review the current goal before saving.** Present permitted old/current/proposed facts clearly.                    | No last-write-wins overwrite or automatic numeric merge.                                                                                            |
| Save outcome is uncertain       | **We haven't confirmed whether your goal was saved. Checking…** followed by the reconciled result or persistent recovery.                                     | Do not simultaneously show Saved and offer another independent Save. This is a native database mutation, not D15's external-mail no-replay product. |
| Approved plan changes later     | A separately qualified comparison can invite deliberate adoption if authorized.                                                                               | Neither goal nor plan silently rewrites the other. No unsolicited staff/coach/donor notification is implied.                                        |

The ordinary phone journey is: **goal card → Edit goal → amount/context → Save →
updated goal**. Context is already the review; a second wizard is unnecessary.
Currency/period/scope changes with a materially different meaning deserve a clear
in-place explanation and deliberate Save, not an automatic conversion or a hidden
rounding operation. The interface can remain small even when the source stores
immutable versions and attribution.

## Primary form and accessibility guidance

The following was independently checked on **2026-10-16**. The Base UI
[release notes](https://base-ui.com/react/overview/releases) list v1.9.0 released
**2026-10-09**, matching Core's pinned package. For other living guidance, no
publication date is asserted. Standards describe requirements and patterns;
following a component example does not prove the complete Asym journey conforms.

| ID  | Exact primary source                                                                                                                                                                                        | Relevant documented guidance and bounded application                                                                                                                                                                                                                                                                                                                                                                                              |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S01 | [GOV.UK Text input](https://design-system.service.gov.uk/components/text-input/); [Base UI Number Field](https://base-ui.com/react/components/number-field)                                                 | Decimal keyboard hints, visible labels and unit/currency context support entry. Base UI exposes locale/number formatting, but its numeric value model is not an exact-money persistence contract. Choose and qualify the existing input component; do not infer safe parsing/storage from currency formatting.                                                                                                                                    |
| S02 | [W3C radio pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/); [GOV.UK Radios](https://design-system.service.gov.uk/components/radios/)                                                              | A labeled group represents one choice; keyboard interaction includes Tab, arrows and Space. Displaying an existing saved policy is different from arbitrarily preselecting an unanswered question. These sources establish no meaning for a third business-policy state.                                                                                                                                                                          |
| S03 | [WCAG On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html); [Error Prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html)                      | Unexpected context changes are constrained; all autosave is not prohibited. Error-prevention alternatives include reversibility, checking/correction or confirmation. Editing a monetary target is not automatically a payment, and stored user-controllable data also matters. Explicit Save plus appropriate correction/version behavior can avoid a redundant confirmation modal; a review must establish which criterion and exception apply. |
| S04 | [Base UI Number Field](https://base-ui.com/react/components/number-field); [Radio Group](https://base-ui.com/react/components/radio-group)                                                                  | readOnly and disabled are distinct component states. Number-field onValueCommitted may occur on blur or keyboard interaction; it is not source-business authorization to save a goal or policy. Current rights and server validation remain independent.                                                                                                                                                                                          |
| S05 | [GOV.UK Error summary](https://design-system.service.gov.uk/components/error-summary/); [Base UI Forms](https://base-ui.com/react/handbook/forms)                                                           | Errors need an associated correction path; Base UI supports server errors and submission-oriented validation. GOV.UK's focused error-summary pattern is useful for a full form, not a universal requirement to add a full-page summary to every small editor. Preserve correctable input.                                                                                                                                                         |
| S06 | [WCAG Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html); [Base UI Button](https://base-ui.com/react/components/button)                                                     | Displayed waiting/success/error statuses can require programmatic announcement without moving focus. Base UI recommends focusableWhenDisabled for loading buttons and a stable accessible name where visual text changes. Do not announce every keystroke or claim success before persistence.                                                                                                                                                    |
| S07 | [WCAG Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html); [Focus Not Obscured Minimum](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) | AA target sizing uses 24×24 CSS pixels or applicable exceptions, not a universal 44-pixel mandate. Author-created content must not entirely obscure keyboard focus. Comfortable larger controls and keeping a phone field above the keyboard are product recommendations to verify, not identical normative claims.                                                                                                                               |

Keep the policy choice, amount, currency/period labels and ordinary Save reachable
without hover. A concise form may fit a shared dialog or page; this research does
not freeze that implementation detail. Test focus entry/return, invalid input,
loading and announcements in the actual chosen surface. Small radiobutton artwork
does not by itself measure the complete clickable target, and a visually roomy
layout does not by itself establish keyboard/screen-reader correctness.

## Money, locale and control-state requirements

Recommendations below must be implemented against the actual source money contract,
not by replacing it with a UI library's JavaScript number model.

- Keep the ISO currency explicit. A bare dollar sign is ambiguous. If only one
  currency is admissible, show its fixed value rather than a fake chooser. If a
  chooser is genuinely allowed, restrict it to qualified options and explain that
  changing currency does not convert or relabel the existing amount automatically.
- Display formatting may follow locale; persisted amount/currency semantics do
  not. Parse supported localized input deliberately, show errors for ambiguous
  input, and never strip punctuation in a way that turns a decimal into thousands.
  Preserve editing text long enough to correct an invalid value.
- Respect the source's currency precision and magnitude bounds. Do not assume
  every currency has two decimals, round excess precision silently, store floating
  point artifacts, or use the current exchange rate to compare incompatible goals.
  Missing, explicit zero and a positive target are different states; zero's
  admissibility and comparison behavior belong to the source contract.
- Keep the monthly/one-time meaning and any required dates visible with the amount.
  Show only the date/period choices actually supported by the owning goal profile.
  Do not silently reinterpret a monthly amount as an annual target or vice versa.
- Unknown capability: no speculative editable form. Known view-only capability:
  readable value and concise management explanation. No read permission: do not
  fetch/reveal the value in a disabled input. Temporary submission: preserve the
  user's work and expose a clear in-progress result. These states are not one
  disabled-control style.
- Progressive disclosure may hide secondary explanation or truly conditional
  fields; it must not hide the current currency, target meaning, policy result,
  material consequence or an error needed to complete the form.

Core pins **@base-ui/react 1.9.0** in [packages/ui/package.json](../../../../../packages/ui/package.json)
and has shared [NumberField](../../../../../packages/ui/components/shadcn/number-field.tsx),
[Input](../../../../../packages/ui/components/shadcn/input.tsx),
[Field](../../../../../packages/ui/components/shadcn/field.tsx) and
[RadioGroup](../../../../../packages/ui/components/shadcn/radio-group.tsx) wrappers.
These establish available components, not a prequalified currency editor.
The existing number-field wrapper exposes steppers; that does not make increment/
decrement buttons mandatory for a fundraising amount. Avoid accidental wheel,
arrow or scrub changes where they are not useful, and test the selected component.
Retain base-maia/Zinc styling and shared ownership rather than copying a vendor's
design system or adding a currency-input dependency.

## Material concerns and testable recommendations

Severity and likelihood are reasoned judgments, not measured Asym incident rates.
The local GU identifiers are proposed acceptance language, not published policy.

| Concern / impact                                                                                                                      | Severity / likelihood                                           | Evidence and decision effect                                                                                | Proposed exact clause / useful proof                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| On/Off/Optional conflates editing, visibility and required participation. Users enable a materially different behavior than intended. | High / likely with ambiguous labels.                            | A plus unresolved rider; B07/B09. Policy meaning must precede control choice.                               | **GU01:** Each setting SHALL name one selected policy meaning and show its effective result; inheritance/default semantics SHALL be explicit. Test staff explaining each option without coaching; no hidden compulsory goal or extra audience.                                 |
| A local override looks denied while another authority grants editing, or a copied default is presented as live inheritance.           | High / plausible.                                               | B08/B09; existing P12 authority. Changes effective-state display and tests, not Core permission precedence. | **GU02:** UI and writes SHALL use the owning effective capability/policy result and its qualified provenance. Test inherited/explicit/unknown states and a parent-policy change; no parallel client ACL.                                                                       |
| A mission goal changes finance plans, historical progress or a public released target.                                                | High / plausible with legacy scalar reuse.                      | Founder brief/ADR-0098/Q16. Requires source-qualified Goal Versions.                                        | **GU03:** Goal editing SHALL preserve independent financial/public sources and exact version/currency/period context. Test internal edit, prior public release, approved-plan copy and later plan change independently.                                                        |
| Wrong locale/precision changes the amount, or missing data becomes zero.                                                              | High / plausible in international use.                          | B02/B06 plus source money semantics. Requires explicit currency and safe parsing.                           | **GU04:** The form SHALL preserve exact source amount/currency meaning and reject ambiguous or unsupported precision without silent conversion. Test comma/point/grouped entry, paste, zero/missing, supported 0/2/3-decimal currencies and boundaries.                        |
| Stale permissions or concurrent edits falsely report success or overwrite someone else's goal.                                        | High / ordinary race plausible.                                 | Current-rights/version requirements. Needs server rejection/reconciliation and honest copy.                 | **GU05:** Save SHALL use current authority and expected source revision; uncertain results SHALL reconcile the same command before another independent mutation. Test both orders of permission loss/save, lost response and two-tab edits.                                    |
| View-only/unknown/offline states create false buttons or hide useful permitted information.                                           | Medium–high / likely if represented by one disabled form.       | B07; clear-state UX recommendation.                                                                         | **GU06:** Unavailable truth, known read-only truth, lack of read access and missing goal SHALL remain distinct. Test no unauthorized fetch, no “Set goal” while rights are unknown and useful staff-managed viewing.                                                           |
| Phone, keyboard or assistive-technology users cannot understand or correct the form.                                                  | High for affected users / plausible without integrated testing. | Shared UI constraints and standards verification below.                                                     | **GU07:** The ordinary settings and goal journeys SHALL have visible labels, programmatic grouping/errors/status, usable focus and responsive controls. Test actual supported browsers/devices rather than claiming a component alone proves conformance.                      |
| Routine planning becomes a configurable rules/approval/notification product.                                                          | Medium / plausible scope expansion.                             | Stronger simpler alternatives; no primary evidence of necessity.                                            | **GU08:** The initial journey SHALL use the existing settings/capability system and short goal editor; extra workflow, reminders, notifications and rule builders require separate authority. Test a normal goal change completes without a staff queue or unrelated settings. |

## Evidence gaps and completion boundary

No competitor's authenticated authorization, arithmetic, live error handling,
mobile accessibility or tenant overrides were verified. No source establishes
Asym-user preference for a switch versus radios or its ideal goal-entry defaults.
The extra On/Off/Optional meaning remains a founder clarification, not something
vendor research can answer. Current source/capability/money owners must qualify
the actual form fields, precision, effective timing and update semantics before
implementation. This note adds no new product decision, code or provider dependency.

## Subsequent review synthesis

After the initial review, the founder explicitly clarified: **editing permission
only; staff allow or disable missionary editing, and setting a goal remains
optional**. This supersedes this note's earlier pending-clarification language.
The [completed D16 review](../phase28-d16-goal-management-adversarial-review.md)
records that confirmed meaning. Its recommended Staff-managed / Missionary-managed
labels, organization-default inheritance and remaining amendments are not fully
ratified by this clarification. No Required/Optional/Not-used goal usage is added.
The main review reconciles individual View only versus Staff-managed,
one canonical goal-policy scope across aliases, applicable Legal Entity,
conditional ending and all-path restore fencing. Earlier conditional exploration
in this evidence note is preserved as research, not competing final design.

Actual probe claims retain their exact limits: permission re-enable is not a
backup restore test; no-op and a separately read-authorized receipt endpoint
were not executed. The completed review's C01–C20/P01–P24 govern the proposed
future proof, not a claim that those features are implemented.

## Subsequent ratification

On October 16, 2026 UTC the founder explicitly ratified the corrected D16 decision
and required amendments, including C01–C20 and P01–P24 as future acceptance
obligations. The [main D16 review](../phase28-d16-goal-management-adversarial-review.md)
is the reconciled decision; conditional alternatives and recommendation labels
above describe research before ratification, not competing current decisions.
The earlier clarification alone was narrower; the subsequent ratification accepts
the full corrected amendment package. This changes intended-behavior status only.
Executed probes, source snapshots and all runtime/qualification limits remain
unchanged. No full application, live database or production claim follows.
