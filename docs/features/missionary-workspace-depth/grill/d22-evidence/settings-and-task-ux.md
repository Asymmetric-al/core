# D22 — Amount-rule settings and personal follow-up UX evidence

Research date: **October 17, 2026 UTC**. Research and design recommendations only;
no implemented feature, authenticated vendor inspection, user study, financial
calculation qualification or accessibility conformance is claimed.

The founder selected an **optional, organization-configurable amount rule** and
explicitly chose **one organization-wide policy**, without scope overrides.
An eligible received gift can qualify because of its amount without being called
extra support or unusually generous. D21 still excludes history-only inference.
The exact controls and copy below are recommendations for the D22 review, not
additional founder decisions. Read this with the
[Q22 boundary note](../phase28-q22-amount-based-gift-follow-up-research.md),
[D19](../phase28-d19-first-support-follow-up-adversarial-review.md),
[D20](../phase28-d20-grouped-special-gift-follow-up-adversarial-review.md) and
[D21](../phase28-d21-explicit-gift-follow-up-adversarial-review.md).

## Recommended smallest complete experience

Use one **Amount-based follow-up** section in the existing organization settings,
with organization On/Off actions and one positive **At least** amount per
explicitly selected currency. Show the actual eligible organizational scope as
plain text, not a scope picker. Do not introduce per-worker exceptions, formulas, donor segments,
condition groups, arbitrary actions, historical baselines or a policy builder.
An inclusive comparison is a recommended fixed meaning, visible in the label;
it is not a hidden mathematical convention or an already-ratified requirement.

Meaningful customization is whether the rule runs and which same-currency amounts
it uses. The organization can add/remove a supported currency and change its amount.
No unconfigured currency silently inherits USD, a converted value or another row.
Keep source eligibility, approved amount basis, current access, coordination,
source correction and historical-origin protections fixed. These establish what
the product truthfully means; they are not optional safeguards to turn off.

Use the existing qualified task responsibility and scheduling contracts. A new
recipient picker, due-date policy, notification channel or per-worker scope control
is not necessary to express this amount rule. The separate staff recipe
[DON-03](../../../../prds/workflow-studio/07-core-workflow-catalog.md:1223)
allows currency threshold, inclusive boundary, owner and timing edits, but its
source binding remains unresolved and it does not require importing those controls
into native Phase 28. If later evidence establishes a real owner/timing need,
compose its existing owner-qualified capability rather than a parallel policy.

For missionaries, use the existing calm personal queue: **Follow up with Grace**,
a truthful amount-rule reason, permitted gift/context, the existing act/remind/
finish choices, and optional interaction logging. A second qualifying reason does
not create a second intended follow-up. Neither configuration nor task completion
sends a donor message or claims that a thank-you happened.

## Current repository reuse and limits

Read-only inspection on the research date found useful compositions in
`apps/admin/features/support-hub/components/settings/`:

| Existing source                                 | Useful pattern                                                                           | Boundary on reuse                                                                                                                                                                                         |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SettingsPanel.tsx`                             | Maia card, visible heading/description, labelled region.                                 | Feature-local composition, not evidence of a generic financial settings owner. Consume shared `@asym/ui`; do not fork primitives or copy a new visual system.                                             |
| `SettingsRow.tsx`                               | Labels above fields on phones, two columns when space permits; shared field composition. | A shared wrapper does not itself prove every dynamic currency row is correctly named or described.                                                                                                        |
| `SettingsToolbar.tsx`                           | Persistent Save changes/Discard and unsaved-change text.                                 | Its default `Saved` label follows a supplied dirty flag. A clean local form is not proof of a server receipt or current policy.                                                                           |
| `notifications/NotificationPreferencesForm.tsx` | Draft controls followed by explicit save and success/error handling.                     | Agent-level preferences and fallback defaults/agent selection are not authority for tenant financial policy.                                                                                              |
| `automations/AutomationDryRunPreview.tsx`       | Comparison result and preview explanation can be legible in a small panel.               | It evaluates a client-selected loaded support conversation. It is not an authoritative gift preview, full-history sample or finance qualification engine; its loading/empty behavior must not define D22. |
| `automations/AutomationRuleForm.tsx`            | Existing settings vocabulary and draft interaction.                                      | Do not import its generic conditions/actions, enabled-by-default initialization or premature Active label.                                                                                                |

These paths are relative to the settings directory. The governing UI remains exact
`base-maia`, Base UI, shared `packages/ui`, semantic tokens and the existing Core
form/data boundaries. No new library, page framework, workflow engine or integration
is proposed. Reading source is not a browser, mobile or screen-reader test.

## Fresh primary-source register

Every external page below was read **2026-10-17**. “Documented” means public vendor
documentation, not observed authenticated behavior. Publication/update dates are
reported only when exposed by the page. Vendor success claims are not user research
for Core, and none chooses an appropriate threshold or proves financial semantics.

| ID / primary URL                                                                                                                                                     | Date and evidence class                                                            | Relevant documented fact                                                                                                                                                                                         | Limit / design implication                                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E01 [Virtuous: Create an automated task](https://support.virtuous.org/hc/en-us/articles/360060363771-How-Do-I-Create-an-Automated-Task)                              | Updated 2025-07-02; documentation.                                                 | A Single Gift Threshold Exceeded milestone uses an entered amount. Separate milestones include first gift and cumulative giving. Editing the template changes future generated tasks, not tasks already created. | Supports a named, explainable criterion and explicit edit effects. Does not qualify Core's amount basis, comparator, actor or pending-admission behavior.                     |
| E02 [Bloomerang: Task from new donations or pledges](https://help.bloomerang.com/en/articles/12632482-create-a-task-in-bloomerang-crm-from-new-donations-or-pledges) | Displayed 2025-12-11; documented **Zapier integration**.                           | The template can filter by minimum amount. Its Test action creates a real CRM task.                                                                                                                              | Not evidence of that template being native; not permission to treat pledges as received money. Do not import Zapier or a side-effecting test into D22.                        |
| E03 [Bloomerang: Journey Automation](https://help.bloomerang.com/en/articles/17568756-about-journey-automation)                                                      | Page says “Updated this week”; documentation. Old article 12632840 redirects here. | Native journeys offer amount/campaign/fund/appeal filters and task steps after publication. Donation entry is documented as delayed 24 hours to allow correction/merging.                                        | Native comparable pattern, distinct from E02. No adoption of its delay, multi-step builder, email sending, priority rules, limits or claims of improved giving.               |
| E04 [HubSpot: Test your workflow](https://knowledge.hubspot.com/workflows/test-your-workflow)                                                                        | Updated 2026-08-03; documentation.                                                 | A criterion test can match without the record actually enrolling. Simulated actions do not execute. Its separate Send preview operation sends email previews.                                                    | Supports separating condition match from actual effect. D22's preview must be inert throughout; do not copy the separate email operation or imply a guaranteed task forecast. |
| E05 [HubSpot: Turn off workflows](https://knowledge.hubspot.com/workflows/turn-off-workflows)                                                                        | Updated 2026-09-28; documentation.                                                 | New enrollment stops, while existing enrollments and delays have separately documented behavior.                                                                                                                 | Supports explaining Off's scope. Its detailed workflow lifecycle is not a Core rule or reason to build that complexity.                                                       |
| E06 [GOV.UK: Text input](https://design-system.service.gov.uk/components/text-input/)                                                                                | Current guidance; no whole-page update date asserted.                              | Visible labels/hints, decimal input mode and explicit units support number entry. Prefix/suffix presentation does not replace a currency label. Number-input steppers can introduce unwanted changes.            | Use supported locale/currency entry in the existing form. Do not copy GOV.UK components or assume all currencies have two decimals.                                           |
| E07 [GOV.UK: Check answers](https://design-system.service.gov.uk/patterns/check-answers/)                                                                            | Current guidance; undated here.                                                    | People should be able to review entered information, change it without losing other answers, and understand the final action.                                                                                    | Supports an inline policy summary. Does not require a separate review page, wizard or confirmation on every edit.                                                             |
| E08 [GOV.UK: Error summary](https://design-system.service.gov.uk/components/error-summary/)                                                                          | Current guidance; no whole-page update date asserted.                              | Its pattern uses a focused summary linked to corresponding inline errors and consistent messages.                                                                                                                | Useful for a multi-row form. This specific pattern is guidance, not a claim that WCAG requires a summary for every error.                                                     |
| E09 [W3C: Labels or instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html)                                                           | WCAG 2.2 SC 3.3.2 explanatory guidance; current read.                              | Input purposes, choices and needed constraints must be understandable.                                                                                                                                           | Use actual labels and concise instructions; the Understanding document is informative and does not prove conformance.                                                         |
| E10 [W3C: Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)                                                                         | Page updated 2026-05-11; SC 4.1.3 explanatory guidance.                            | Qualifying status messages without a context change must be programmatically determinable without taking focus. Excessive announcements can be disruptive.                                                       | Announce save/error/preview status appropriately; do not announce every keystroke or claim every content change is a status message.                                          |
| E11 [W3C: Target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)                                                                 | SC 2.5.8 explanatory guidance; current read.                                       | The AA criterion uses 24-by-24 CSS pixels with specified exceptions, including spacing.                                                                                                                          | Core's more generous touch recommendation is a local design target, not a statement that 44 pixels is this WCAG AA minimum.                                                   |

Earlier D19–D21 MPDX/Tnt and task evidence is reused only through the linked local
reviews; it was not newly tested in a product. No public source establishes the
best threshold, optimum task volume, tenant currency needs, benefit for missionaries
or whether a particular organization should enable this optional rule.

## Staff journey, controls and copy

Use one form, with progressive disclosure only where it removes irrelevant fields.
Keep the saved state distinct from the editable draft. Default Off is a recommendation
consistent with optional activation; do not infer it from a loading failure.

| State / action              | Minimal surface and proposed copy                                                                                                                                                                          | Required truth                                                                                                                                                                                                                                                                                  |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Read known current settings | **Amount-based follow-up**. “Create personal follow-up for eligible gifts that meet your organization's amount rule.” Saved state: **Off** or **On**. “Applies to: [exact eligible organizational scope].” | The scope text comes from the owner and current permission. A partial view cannot be described as all workspaces.                                                                                                                                                                               |
| Loading or unavailable      | **Loading settings…** or “Settings are unavailable. Try again.”                                                                                                                                            | Neither an unchecked switch, an empty currency list nor a default amount may impersonate loaded policy.                                                                                                                                                                                         |
| Start configuring           | **Enable amount-based follow-up**; reveal **Currency** and **At least** amount. **Add currency** when useful.                                                                                              | Activation and amount edits remain a draft until Save. Choose only currencies supported by the qualified source, with ISO codes in labels; no implicit default amount. The separate Turn off action concerns saved policy only.                                                                 |
| Enter amounts               | “At least [amount] [ISO currency]” with the source-approved basis described in plain language.                                                                                                             | Validate a positive exact amount at that currency's supported precision. Zero is not an Off shortcut. Do not silently strip decimal/grouping separators or round to a different policy.                                                                                                         |
| Several currencies          | One row per configured currency; **Remove [ISO currency]**. “Other currencies do not use this amount rule.”                                                                                                | No duplicate rows, mixed-currency comparison or FX. Removing a row is a draft change until saved and affects that criterion prospectively. Require a valid row before enabling.                                                                                                                 |
| Review before save          | **Amount condition:** “[Approved source basis] is at least [ISO amount].” “This creates follow-up work, not messages to supporters.”                                                                       | The approved amount basis is an owner fact, not an arbitrary editable financial-field menu. This sentence describes the policy, not proof that every matching gift produces a new task.                                                                                                         |
| Commit                      | **Save changes** and **Discard**; persistent **Unsaved changes** until acknowledgment. On initial activation, **Save and turn on** can make the effect clearer.                                            | No unrelated confirmation wizard. Persisted state changes only after authoritative success; the page retains an accurate saved summary.                                                                                                                                                         |
| Successful edit / enable    | “Amount rule saved.” Brief impact: “Applies to new eligible gifts. Existing follow-ups remain.”                                                                                                            | This summarizes the prospective rule. It does not reinterpret old historical/imported gifts, replay held unadmitted work or change previously captured policies.                                                                                                                                |
| Turn off                    | **Turn off** beside the saved On state. Help: “Stops new amount-based follow-ups. Existing follow-ups remain.” Details: “Follow-ups already queued may still appear.”                                      | This separately commits Off for the persisted rule, without validating or saving unsaved amount edits. Invalid draft amounts must not prevent stopping new admissions. Already accepted work remains; source corrections still follow D20. Other reasons remain enabled under their own policy. |
| Save conflicts              | “These settings changed. Review the latest settings before saving.”                                                                                                                                        | Preserve the user's safe draft for comparison; do not overwrite another authorized editor or silently adopt their amounts.                                                                                                                                                                      |
| Save outcome unknown        | “We couldn't confirm whether your changes were saved. Check status.”                                                                                                                                       | Resolve the original change before treating it as failed or offering an unqualified fresh save. Do not show Off/On from optimistic state as authoritative.                                                                                                                                      |
| Lost permission             | “You can no longer change these settings.”                                                                                                                                                                 | Only display the previously/currently authorized summary. Preserve useful work where permitted without leaving a deceptive enabled Save action.                                                                                                                                                 |

“New eligible gifts” is deliberately product-level wording: its exact source-live
eligibility boundary belongs to the main owner contract. The review's settled
recommendation is prospective On/amount edits, original captured policy within the
current episode, no revival of held unadmitted pre-Off work, and preservation of
already accepted work. Do not convert local time, page-open time, client receipt
time or a user-editable date into that boundary. Show a date/time only if backed
by the relevant owner receipt and format it clearly for the user's locale.

After a successful separate Off action with an edited draft, say **Amount rule is
off. Your amount changes have not been saved.** Keep the safe draft visibly unsaved
until the user saves or discards it; never let a later generic Save silently turn
the rule back on. Activation must remain explicit. This small separation lets staff
stop the persisted rule without first repairing a half-entered currency amount.

### Preview without creating a second reporting product

The minimum useful preview is a plain-language rule summary and a small, inert
amount example in the selected currency. A below/equal/above comparison can explain
the inclusive boundary without any donor data. Label synthetic values **Example**,
never a suggested threshold, observed donor or inferred historical baseline.

Use **Meets amount condition** / **Does not meet amount condition**. Do not say
“Task will be created”: current source qualification, origin, responsibility,
permissions and existing compatible coverage can change the effect. Always make
the inert scope explicit: **This preview does not create tasks.**

If authorized real examples are available through a qualified existing owner read,
they may be an optional secondary aid. Show source basis, currency, time/coverage
and whether the result is a sample. **Examples unavailable** is not **0 matches**.
A bounded sample is not a forecast of total new tasks or all organizational giving.
Do not require a historical scan, new reporting engine, arbitrary sample threshold
or cross-tenant access to configure a simple amount. Never turn a preview into
admission, notification, delivery or backfill.

## Missionary journey and meaning

1. Open the ordinary current queue. Keep **Follow up with Grace** as the human task
   title. Add an authorized reason such as **Met the organization's amount rule**.
   Expanded detail can show **At least [ISO amount] when added**, the applicable
   ministry and permitted source amount/date. This is not a donor rank, anomaly,
   urgency score or claim of additional support.
2. Open permitted contact/gift context. A gift satisfying first-support, special
   and amount criteria coordinates under the existing exact purpose/coverage
   rules. List distinct useful reasons on the existing work, not one task per
   matching setting. A large ordinary installment may meet this rule without
   being described as extra; a smaller independently qualifying gift still counts
   for its own reason.
3. Act, remind later or finish through existing D19/D20 controls. Normal small
   groups need no mandatory checkbox ceremony. Larger groups retain the declared
   exact set, inspectable pagination and optional subset handling selected in D20.
   Newly arriving gifts are not silently included in a completion request.
4. Completing the independent task records that deliverable's disposition, not
   a call, sent message, thank-you, delivery or mandatory report. Actual interaction
   logging remains optional and separate. A rule edit or Off does not erase human
   history; a source correction retains the prescribed predecessor/history path.
5. From ordinary permitted history, **Add follow-up** remains available when the
   actor can create one. Show **Open follow-up** only for authorized, qualified
   compatible work. Neither a name/title match nor manual creation proves native
   coverage; hidden work cannot be disclosed to explain duplicate coordination.

If today's threshold changed, preserve the truthful reason at admission rather
than relabeling an old task as if it met today's amount. If that threshold is not
authorized for this viewer, use the allowed minimal reason instead of exposing
hidden policy/source values. No extra policy page is needed inside the task.

## Material concerns and proposed clauses

Each concern explicitly records eight dimensions. Likelihood is a qualitative
engineering/design assessment, not an observed incidence rate. Clauses and proofs
are proposals for the owner's specification and implementation qualification.

### S01 — Customization becomes a second rules engine

1. **Failure:** A generic condition/action builder or per-worker override disguises a simple optional amount policy.
2. **Importance:** It increases mistakes, configuration burden and overlapping intended effects.
3. **Severity:** High.
4. **Likelihood:** Plausible, because a general builder already exists elsewhere.
5. **Evidence:** Local support form; E01's typed milestone; separate DON-03 scope.
6. **Decision impact:** A needs meaningful currency/amount configuration, not unlimited logic or new authority.
7. **Permanent fix:** One finite, source-qualified policy surface using existing responsibility and task owners.
8. **Exact proposed clause SUX01:** “The native amount rule SHALL use one organization-wide policy, exposing activation and explicit same-currency thresholds for its qualified eligible subjects. It SHALL NOT introduce scope overrides, arbitrary predicates/actions, worker overrides, source-field formulas or independent task ownership. Protected source, permission and coordination semantics SHALL remain fixed.”

**Proof:** Configure two currencies and disable/remove one criterion without a
workflow builder, recipient ACL or another task engine. No control can bypass
source qualification, D19/D20 coverage or D21's history-inference boundary.

### S02 — Currency or amount labels imply false financial meaning

1. **Failure:** An unlabeled scalar, implicit FX, locale parsing or wrong allocation basis changes the intended rule.
2. **Importance:** Valid-looking settings can repeatedly produce the wrong work.
3. **Severity:** Critical.
4. **Likelihood:** Plausible with generic decimal fields and dollar defaults.
5. **Evidence:** Q22 finance boundaries; E06/E09; E01 does not specify Core's basis.
6. **Decision impact:** A remains useful only if staff can understand the exact comparison.
7. **Permanent fix:** Explicit ISO currency, qualified amount basis/precision and visible inclusive boundary; exact validation.
8. **Exact proposed clause SUX02:** “Each enabled currency SHALL have one explicit positive threshold at its qualified precision and a visibly inclusive ‘at least’ meaning. Unconfigured currency SHALL NOT inherit or convert a threshold. Labels, parsing, validation and summaries SHALL preserve the approved source amount basis; amount eligibility SHALL NOT assert extra support or donor intent.”

**Proof:** Exercise zero-, two- and three-decimal supported currencies, alternate
decimal/group separators, invalid/duplicate rows, split allocations and exact
equality. No silent rounding, converted match or misleading whole-gift label.

### S03 — Off/edit hides accepted work or restarts historical work

1. **Failure:** Off promises all tasks disappear; re-enable revives held old gifts; an edit rewrites an admitted reason.
2. **Importance:** Staff cannot reliably control future work or interpret existing tasks.
3. **Severity:** High.
4. **Likelihood:** Plausible when settings are read as live filters over all history.
5. **Evidence:** E01/E05 distinguish future and existing effects; D22 temporal recommendation; D20 correction contract.
6. **Decision impact:** A must stay prospective and preserve independent human work.
7. **Permanent fix:** Authoritative admission boundary, captured policy and precise impact text.
8. **Exact proposed clause SUX03:** “Off SHALL stop new authoritative amount-rule admissions without deleting accepted follow-up, including queued materialization. Re-enable/edit SHALL NOT backfill history or revive held unadmitted pre-Off work. Existing admissions SHALL retain their captured policy meaning; actual source corrections SHALL continue through D20. The UI SHALL explain these distinct effects.”

**Proof:** Off races with admission/materialization; change the amount while work
is held; turn On again; import history; correct a source allocation. Show no new
unadmitted historical flood, no lost accepted work and no false current-rule reason.

### S04 — Preview is interpreted as a count, guarantee or real test

1. **Failure:** Preview creates tasks, substitutes zero for unavailable data or promises all matches become new work.
2. **Importance:** It can send unintended work and mislead activation decisions.
3. **Severity:** High.
4. **Likelihood:** Plausible; E02 explicitly uses a side-effecting test.
5. **Evidence:** E02/E04; current support dry-run is not a financial source.
6. **Decision impact:** Useful preview must not require a new authoritative reporting product.
7. **Permanent fix:** Inert condition examples; separately qualified, scoped real samples only when available.
8. **Exact proposed clause SUX04:** “Preview SHALL create no tasks, admissions, messages or backfill. It SHALL distinguish amount-condition matching from actual effect eligibility and distinguish unavailable/incomplete examples from confirmed zero. No sample or predicate match SHALL be represented as a guaranteed future task count.”

**Proof:** Preview with no donor access, an unavailable read, partial pages,
already-covered gifts and a synthetic equal-boundary value. Verify zero writes,
truthful coverage and no false zero or guaranteed task outcome.

### S05 — Draft, saved and unknown authority are confused

1. **Failure:** A default switch says Off while loading, a draft says Active, or a timeout says Saved/failed without evidence.
2. **Importance:** Staff cannot tell what policy is actually in effect.
3. **Severity:** High.
4. **Likelihood:** Likely if generic dirty-state/default initialization is copied.
5. **Evidence:** Local settings toolbar and form; E07/E10; current permission contract.
6. **Decision impact:** Simple controls must still provide durable, current truth.
7. **Permanent fix:** Saved summary, explicit draft status, conflict handling and original-operation reconciliation.
8. **Exact proposed clause SUX05:** “Loaded saved policy, unsaved draft, submitting, conflict and unknown outcome SHALL remain distinct. Success SHALL require authoritative acknowledgment. Turning off the persisted rule SHALL remain available despite invalid unsaved amount edits and SHALL NOT save those edits or imply later reactivation. Lost permission or stale version SHALL NOT silently save, and ambiguous outcomes SHALL be reconciled before an unqualified new attempt.”

**Proof:** Two editors, refresh, tenant switch, permission revoke and response loss
before/after successful save. Turn off with a malformed unsaved amount; verify
persisted Off, unchanged stored amounts and a distinct unsaved draft. Preserve
truthful state and safe input; never show Off/On solely from a local default,
duplicate a disputed save or reactivate through a subsequent generic Save.

### S06 — Explanations or previews disclose hidden scope

1. **Failure:** Threshold details, sample totals, source links or duplicate explanations expose inaccessible money/work.
2. **Importance:** A helpful UI can leak what its underlying row permissions protect.
3. **Severity:** Critical.
4. **Likelihood:** Plausible with broad previews and shared task explanations.
5. **Evidence:** D19–D21 disclosure constraints; source inspection does not prove D22 authorization.
6. **Decision impact:** Tenant customization is not new missionary financial or staff access.
7. **Permanent fix:** Current permission-shaped settings, examples, reasons and response projections.
8. **Exact proposed clause SUX06:** “Settings, scope summaries, previews, counts, reasons and related-work links SHALL obey current disclosure rights. Configuration or task presence SHALL grant no additional source access. Hidden existence SHALL NOT be exposed to explain eligibility, nonmatching or coordination.”

**Proof:** Restricted ministry, anonymous contribution, hidden staff work, revoked
preview permission and late response after tenant switch expose no protected
name, amount, count or existence hint; authorized ordinary work remains usable.

### S07 — A new criterion duplicates work or mandates reporting

1. **Failure:** First/special/amount reasons create repetitive tasks, or Finish requires notes and claims a donor was thanked.
2. **Importance:** The rule adds burden instead of useful personal follow-up.
3. **Severity:** High.
4. **Likelihood:** Plausible if each condition writes a task independently.
5. **Evidence:** D19 independent deliverable; D20 exact grouping; D21 manual/native coordination; E01 shows criteria, not Core equivalence.
6. **Decision impact:** A is another qualified reason within the existing journey.
7. **Permanent fix:** Existing exact source-purpose coordination, scoped completion and optional actual-interaction log.
8. **Exact proposed clause SUX07:** “Amount qualification SHALL coordinate with existing native/manual work only through owner-qualified purpose and coverage. Multiple reasons SHALL NOT duplicate one intended effect or suppress distinct work. Completion SHALL remain an independent task disposition, with no mandatory notes or implied call, send, thanks or delivery.”

**Proof:** One gift with three reasons, two gifts plus a mid-action arrival,
manual work before admission, a separate promise and a changed source. Correct
coverage remains; no forced log, hidden residue leak or duplicate intended task.

### S08 — Compact settings fail on phones or assistive technology

1. **Failure:** Currency is only a decorative suffix; Remove buttons are indistinguishable; errors/focus/save status are inaccessible.
2. **Importance:** A wrong row or unreadable amount can change organizational behavior.
3. **Severity:** High.
4. **Likelihood:** Plausible with dynamic rows and a dense desktop-first layout.
5. **Evidence:** E06–E11 and local Maia/field compositions; no rendered accessibility test performed.
6. **Decision impact:** Exceptional UX requires ordinary editing to remain clear across input modes.
7. **Permanent fix:** Explicit row names, appropriate input mode, visible errors, logical focus and persistent status.
8. **Exact proposed clause SUX08:** “Settings and follow-up actions SHALL be operable with keyboard, touch and assistive technology using visible labels, currency-aware instructions, meaningful dynamic-row names and recoverable errors. Save/preview status SHALL be conveyed accessibly without unnecessary focus changes. No essential control or explanation SHALL require hover, color alone or a transient toast.”

**Proof:** Test a narrow phone viewport with the keyboard open, zoom/reflow,
screen-reader row navigation, add/remove focus, decimal entry, error recovery,
low-bandwidth save and retained task focus after completion. Measure applicable
target sizes and spacing; do not infer conformance from component selection.

## Strongest alternatives and qualification limits

The strongest simpler alternative was **B: no amount-only native rule**: source-
qualified first/special work and manual initiative would remain, without threshold
settings or ordinary large-installment tasks. The founder selected A. Within A,
one organization threshold without currency typing is superficially simpler but
financially misleading for multiple currencies; a fully programmable rules engine
adds complexity without demonstrated need. The finite per-currency model is the
recommended middle course, not a vendor-established universal best practice.

Validate the actual design with representative staff and missionaries, including
mobile, keyboard and assistive-technology use. Ask them to explain scope, equality,
unconfigured currency, Off with already queued work, an unavailable preview, an
older task after an edit and what Finish records. These are proposed qualitative
tasks, not invented interviews or a statistically validated threshold. A small
study can identify confusion; it cannot prove universal usability or financial
correctness. Owner qualification and implementation tests remain separate.

The permanent experience needs no new dependencies, integrations or mandatory
data-entry ritual. Exact financial basis, supported precision, source-live episode
rules, effective authority and runtime coordination must be proven by their owners;
public documentation and this note cannot establish them. No formal PRD, ADR,
OpenSpec, app, schema, live tenant setting or external contact was changed here.
