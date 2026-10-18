# D31 — Any positive confirmed excess: UX and primary research

Research checked **October 18, 2026 UTC**. The founder selected A: any positive
eligible, source-confirmed excess can qualify, however small; there is no new
minimum-excess setting. This note is research and proposed design language for
the adversarial review. It is not ratification of additional amendments, an
implemented financial classifier or evidence of a completed usability study.
D30's existing artifacts were not changed.

## Evidence, freshness and limits

The following public primary product pages and technical documentation were
directly opened on October 18 for D31. The first four were also cited in Q31;
they were reopened, rather than treating the earlier note as new research.
Relative update labels are reported as displayed, not converted to invented
dates. Public documentation is not authenticated product testing or proof of
Core users' preferences. Older documented behavior is useful as a concrete
counterexample, not evidence of a product's current private implementation.

| Source/date                                                                                                                                                                                         | Verified observation                                                                                                                                                       | Bounded lesson; conflict with Core                                                                                                                                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [TntConnect: Dealing with gifts](https://www.tntware.com/tntconnect/help/en/pages/gifts_dealingwith.aspx), undated manual                                                                           | The described detector compares a gift with the normal pledge amount and pledge currentness; a smaller extra gift may instead receive a less-than-normal research task.    | Size/currentness heuristics can miss a genuine small excess. Do not import inferred catch-up, donor labels, manual financial workarounds or its claim that ordinary handling is perfect.                                        |
| [MPDX: Processing-fee adjustment](https://help.mpdx.org/article/1085-adjusting-a-recurring-gift-amount-to-reflect-the-eft-credit-card-processing-fee), updated May 3, 2021                          | The article documents small fee-covered differences triggering a larger-than-commitment notification and suggests adjusting the recorded commitment to avoid those alerts. | This is a specific documented unwanted-alert case, not its prevalence. Core must exclude fee-cover misclassification at source; Maya must not edit commitment terms to silence attention. Do not adopt the historical fee rate. |
| [Blackbaud Altru: Apply a payment](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/altru/help/content/tkApplyAPaymentToAnOutstandingCommitmentOfTheDonor.html), undated                  | Payment above a due installment can be applied to a later installment or the pledge balance.                                                                               | Installment overage is not proof of support beyond the applicable commitment. Core P16 owns application; this is not authority to copy Altru's defaults or payment editor into the missionary workspace.                        |
| [Bloomerang: Split payments](https://help.bloomerang.com/en/articles/17568336-create-or-edit-split-payments), displays “Updated this week”                                                          | One payment can contain distinct donation, pledge and recurring portions; recurring application distinguishes a scheduled from an extra payment.                           | Preserve the difference between total gift, applicable component and qualified excess. Reject its split limit, automatic acknowledgement options and financial editing permissions as Core requirements.                        |
| [TntConnect: Updating automatic tasks](https://www.tntware.com/tntconnect/help/en/pages/video_autoactionsupdatetasks.aspx), undated landing-page description                                        | The text describes updating existing automatic tasks instead of duplicating them.                                                                                          | It is a narrow precedent for reduced duplicate work. The embedded video was not watched; no claim is made about reviewed sets, races, immutable history or privacy. Core D20 is stronger than this description.                 |
| [Givebutter: Tasks](https://help.givebutter.com/en/articles/9703441-how-to-manage-your-fundraising-to-do-list-with-tasks), displays “Updated over a week ago”                                       | Tasks link relevant records, use optional descriptions and support status/filtering. Its staff visibility and assignment-email behavior are broad.                         | Contextual tasks are a useful precedent. Do not import broad visibility, automatic assignment emails, blanket completion/reopening or its workflow dependency over Core.                                                        |
| [MDN: Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat), current documentation; exact update date not established | Currency codes, locale and digit options affect display; currency defaults use minor-unit digits, while significant/fraction-digit settings can round.                     | Localized presentation must preserve the source's supported currency precision. Formatting is not financial authority; no browser-rounded display value may decide whether excess is positive.                                  |
| [W3C: Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), current explanatory guidance                                                                                                | Vertical text must reflow at a width equivalent to 320 CSS pixels without losing information/functionality, subject to defined exceptions.                                 | The task's amount and reason can fit ordinary stacked content. A wide financial table is unnecessary for the primary action. This explanatory page is not a claim of tested conformance.                                        |
| [W3C: Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), current explanatory guidance                                                                              | Material status updates can be programmatically exposed without taking focus.                                                                                              | Announce accepted completion or a required refresh without stealing focus. Do not repeatedly announce every financial-source reconciliation or confuse missing information with zero.                                           |

No source establishes a universally correct excess minimum or that small
confirmed excesses are unwanted. The selected no-minimum decision is a product
judgment, supported by simpler controls and exact source qualification. It does
not follow empirically from these pages. The evidence specifically argues
against using a threshold to hide incorrect fee, matching or rounding semantics.

## Repository facts that govern the journey

- The [founder brief](../phase28-founder-brief.md:165) requires qualified native
  above-commitment stewardship. [D21-C03](../phase28-d21-explicit-gift-follow-up-adversarial-review.md:187)
  preserves that work independently of optional workflows. D31 does not create
  a new general On/Off control or make D30's narrow exception universal.
- [D21-C04–C05](../phase28-d21-explicit-gift-follow-up-adversarial-review.md:198)
  require exact live gift/application, target, terms, currency, subject and
  Party. Unknown matching, catch-up, advance coverage, changed terms and excess
  without new money cannot manufacture this occurrence.
- [P16 F.1–F.5](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:961)
  separate money, commitment targets, application and certainty. **Gift:
  Received** can coexist with **Commitment match: Needs review**. The latter
  must not hide correctly received money or imply it is absent from its fund.
- [P16 F.6–F.7](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:1019)
  prohibit invented debt/prepayment and own corrections. A missionary task is
  not an application command. [P16 M.2–M.3](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:1378)
  explicitly allow applied-above-current-commitment after a reduction; that
  existing financial display is not proof of a new qualifying gift.
- [D22](../phase28-d22-amount-based-gift-follow-up-adversarial-review.md:16)
  compares a whole source-qualified eligible gift amount with its separate
  organization-set amount. Its thresholds cannot filter D31's excess portion.
  D29 donor-stated additional support and D30 donor-accepted one-time purpose
  remain separate reasons, not prerequisites or inferred conclusions.
- [D20's existing journey](../phase28-d20-grouped-special-gift-follow-up-adversarial-review.md:116)
  is one compatible current task, individually evidenced gifts, stable reviewed
  scope, one ordinary handling action and explicit residual work. Reuse it;
  adding a reason is not another gift or another completed interaction.
- The [current manual task endpoint](../../../../../packages/api/src/missionary-portal/tasks.ts:81),
  [generic Auto badge](../../../../../packages/missionary/components/task-row.tsx:233)
  and [complete/reopen handler](../../../../../apps/missionary/app/tasks/page-client.tsx:842)
  do not prove source-qualified D31 or D20 group handling. Preserve sound
  primitives, not unqualified business behavior.
- [The current currency utility](../../../../../packages/lib/utils.ts:1)
  formats a JavaScript number using fixed `en-US` and `USD`. It is intentionally
  documented as a USD helper; it is not a suitable general D31 currency/precision
  contract. This is a static reuse hazard, not an assertion that D31 currently
  calls it or that every use of the helper is defective.
- [Shared UI authority](../../../../../packages/ui/AGENTS.md:5), [configuration](../../../../../packages/ui/components.json:3)
  and [frontend rules](../../../../ai/rules/frontend.md:14) require exact
  `base-maia`, Base UI, semantic tokens and shared `@asym/ui` components. This
  review does not add a library, theme, local component fork or animation system.
- [Accessibility review](../../../../ai/skills/accessibility-review/SKILL.md:1),
  [touch guidance](../../../../ai/skills/emil-design-engineering/touch-accessibility.md:43)
  and [testing rules](../../../../ai/rules/testing.md:20) require appropriate
  keyboard/focus/mobile proof. Documentation-only checks do not establish it.

## The smallest complete UX

The feature adds an understandable factual reason to existing work. It adds no
configuration step for the minimum, no small-gift inbox, no obligatory review
queue for every uncertain gift and no new missionary financial editor. Any
positive source-qualified amount can qualify; invalid precision, fee cover,
unmatched support and floating-point residue cannot be called small excess.

The strongest alternative is a tenant minimum excess by currency. It could
reduce low-value-to-the-organization task volume but adds another policy and
temporal boundary, excludes some confirmed small gifts, and risks masking
classifier errors. The founder selected A. A hidden filter, percentage cutoff,
rounding tolerance, donor-specific override or use of D22's amount must not
quietly reintroduce B. Normal task due/priority/Not needed controls remain
available; they handle current work rather than altering financial truth.

### 1. Staff and donor: keep ordinary work ordinary

Staff do not configure a minimum. Explain the behavior in contextual help only
where users need it, for example:

> Personal follow-up includes any confirmed support above the applicable
> recorded commitment. There is no minimum excess amount.

Do not add a disabled settings field, fake “0.00 minimum” input or a global
switch borrowed from D30. If the source comparison is unqualified, the remedy
belongs to the appropriate financial/source owner; no setting can make unknown
comparison results valid. Qualification/rollout remains an implementation gate,
not a new tenant policy UI.

Grace gives normally. D31 adds no checkout question, donor approval, receipt,
charge, subscription change or donor-facing label. It does not announce that she
intended to give extra. Her permitted record may accurately show received money
while commitment matching is unresolved; normal posting/receipting and other
independent work continue under their owners.

Authorized finance staff resolve an actual ambiguous application through P16's
existing conserved command. D31 must not require a second confirmation after
the financial source already supplies a qualified result. It must not place an
ordinary unresolved gift in a new missionary “investigate extra support” queue.

### 2. Maya receives one helpful task

Use the existing task list and detail surface. For an eligible, permitted gift,
recommended factual wording is:

> **Follow up with Grace**
>
> Maya's ministry · 1 gift
>
> Support above the recorded commitment

The title is illustrative and subject to current supporter/ministry privacy.
The reason does not mean “donor-stated additional support,” “overpayment,” debt,
credit, an increase in future recurring instructions or greater donor value.
Do not label the donor generous, special or high priority based on the amount.

Keep the money secondary to the personal action. The detail can show the
permitted gift and then the qualified component:

> Received gift: **USD 5.00**
>
> Above the applicable commitment: **USD 5.00**

This example is the Q31 scenario: earlier gifts had already fulfilled the exact
comparison scope. It is not a formula for subtracting a current monthly target
from the latest payment. Where only part of a gift is excess, label that part
separately from the permitted gift amount. Do not display unrelated allocations
or a full organization total merely to explain the calculation.

An optional **Why this follow-up?** disclosure can show a short, source-approved
explanation, the relevant commitment reference/period when permitted, and the
source's freshness/through-date when material. It must not require Maya to open
a ledger, read allocation rows or repeat source calculations before she can
handle the task. If those extra details are restricted, do not ship them to the
browser for cosmetic hiding. The reason itself and its inferred financial fact
also need a qualified audience; generic wording is not an access bypass.

### 3. A tiny amount remains a real, legible amount

For a source-supported two-decimal currency, **USD 0.01** must remain USD 0.01
where the qualifying amount is displayed. For a supported three-decimal
currency, a source amount of **BHD 0.001** must not become BHD 0.00 or 0.01.
For a supported zero-decimal currency, **JPY 1** is a whole minor-unit amount.
These are precision test examples, not a promise that every currency is enabled
in every tenant. Use the actual source-supported currency and precision.

Do not use compact notation, whole-dollar rounding, an approximate FX amount,
“less than 1,” a rounded zero, or a display formatter's fallback currency for
the fact that explains eligibility. Conversely, do not pad unsupported precision
or invent fractional units. Invalid source precision is a source-qualification
problem, not a display workaround or an implicit threshold.

Localization may change separators, symbol placement and numerals, but must
preserve the exact amount and disambiguate the currency. No browser float
subtraction, current goal value or formatted string comparison determines
eligibility. Format the qualified source result through a shared exact-money
presentation path; this evidence does not mandate a new formatter dependency or
freeze an implementation library.

### 4. Handle the reviewed group once

If another compatible special-gift member exists, D31 joins the current task
under D20. Each gift appears once with its own permitted reasons. One gift
qualifying for excess, donor-stated additional support and an amount rule is
still one gift member. Multiple allocation/recognition lines do not multiply
the work. No mixed-currency combined total is needed.

Maya reads the group, contacts Grace through an independently permitted channel
or outside Asym, and finishes the reviewed group once. An actual interaction
can be recorded deliberately. No mandatory note, per-gift checkbox, extra amount
acknowledgement or second confirmation dialog is introduced for a small excess.

The normal button remains **Finish follow-up for 2 gifts**, with the reminder
that finishing does not send a message. Unrelated new gifts do not silently join
the reviewed set or invalidate unchanged members. Show the actual result, such
as **Follow-up finished for 2 gifts. 1 new gift remains.** A changed reviewed
member must be refreshed under D20 before its handling is accepted.

### 5. Unclear matching and corrections stay honest

| Actual state                                         | Required experience                                                                                                                                                                                                                      |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Money received; commitment match unresolved          | Preserve the permitted **Gift: Received** fact and existing **Commitment match: Needs review** state where authorized. Withhold this unqualified reason. Do not show zero excess, a missing gift or a new missionary investigation task. |
| Applicable source not available or projection behind | Use the source's qualified unavailable/updating state. Do not show “No excess” or create a speculative larger-gift badge. Existing independently eligible work continues.                                                                |
| Exact zero or negative result                        | No D31 reason. Do not describe the donor as deficient or create a corrective gratitude task. Other reasons remain independent.                                                                                                           |
| Source comparison confirmed later                    | Admit only under the owner's qualified live-occurrence/correction contract and D20 coverage. Do not infer a history replay rule, arbitrary waiting period or notification from this UX.                                                  |
| Correction changes an unhandled positive excess      | Refresh the permitted amount/reason and affected review. A still-positive eligible amount is not disqualified because it is small. Preserve other reasons and human edits.                                                               |
| Source removes this reason                           | Withdraw this reason under its owner; if another reason remains, preserve the work. If no qualifying unstarted work remains, use the existing source-ended outcome, not Done.                                                            |
| Earlier task already handled                         | Preserve actual handling/interaction evidence. A reduced commitment, repaired comparison or replay does not create a new gift or repeat already covered work.                                                                            |
| Completion response lost                             | Show an uncertain/checking state and resolve the original durable result. Do not encourage another completion or claim that sending was undone.                                                                                          |
| Authority or privacy changes                         | Stop later protected release and invalidate affected action scope. Preserve only currently authorized context; no old amount/title/summary can grant access.                                                                             |

A **View source** or existing **Report an issue** path may route a discrepancy
only when current permissions permit it. Do not add a required new support form
or expose finance contacts, comparison targets or private source existence to
someone who cannot see them. Maya must never be prompted to increase a recorded
commitment, split money, create a fake pledge or label a gift additional merely
to make the task disappear or appear.

## Visual, mobile and accessible behavior

Use one calm task row and the established detail sheet, with readable labels,
semantic Maia tokens and one primary action. A tiny qualifying amount does not
justify tiny text, an alarming color, an oversized celebration or a large money
headline. A brief factual reason is more useful than a standalone Auto badge.

On phones, stack gift facts and the excess component instead of requiring a
horizontal financial table. Long international names, translated reasons and
currency codes must wrap without hiding the action's reviewed scope. Respect
the source's date precision and the existing locale/time-zone convention; no
invented occurrence time or new address fields. Keep important reason text
available without hover, color distinctions or an icon-only control.

Use native semantics/shared Base UI primitives, logical reading order, clear
accessible names and visible keyboard focus. Announce material completion and
refresh states once; do not move focus because a new gift or background amount
update arrives. Core's comfortable 44 CSS-pixel touch convention is not a claim
that WCAG AA universally requires 44 pixels. Verify actual 320 CSS-pixel reflow,
zoom and screen-reader amount/currency reading. Low-bandwidth failures must not
change a partially loaded set into an apparently complete review.

## Material concerns and exact prevention language

Likelihood is qualitative exposure without safeguards, not measured incidence.
Every finding below narrows implementation or explanation; none justifies
replacing the selected no-minimum decision with a hidden threshold.

| Concern; severity / likelihood                                                              | Failure, impact and evidence                                                                                                             | Exact proposed prevention                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mathematical comparison becomes donor intent; High / High                                   | “Extra gift” can imply an additional-support instruction, increased recurring terms or overpayment. D29 and P16 distinguish those facts. | **The D31 reason SHALL describe source-confirmed support above the applicable recorded commitment, without asserting additional intent, debt, credit or changed future instructions.**                                            |
| Fee cover or installment overage becomes excess; High / High                                | MPDX documents a fee-triggered alert; Altru demonstrates later-installment application. Incorrect work persists regardless of a minimum. | **Only the exact owner-qualified excess SHALL create this reason. Fee cover, catch-up, advance application, unmatched money and one installment's overage SHALL NOT qualify by themselves.**                                      |
| Small positive amount displays zero or wrong currency; High / High if generic helper reused | Formatting rounds; the inspected shared helper is fixed USD. Users cannot understand why an apparently zero excess creates work.         | **Displayed qualifying excess SHALL preserve supported source currency and exact precision; zero rounding, compact/FX substitution and unsupported fractional units are forbidden. Display values SHALL NOT govern eligibility.** |
| New minimum/disable controls quietly restore B; High / Medium                               | D22 is a different whole-gift rule; D30's optionality is a narrow exception.                                                             | **D31 SHALL introduce no minimum, percentage, hidden materiality tolerance, per-person override or new optionality switch; D22 and D30 settings SHALL NOT filter this independent reason.**                                       |
| Unresolved matching looks like missing money or creates missionary burden; High / High      | P16 explicitly separates received money from match certainty. A new review queue would duplicate finance ownership.                      | **Unresolved comparison SHALL withhold only this reason while preserving qualified received-money visibility and independent work. D31 SHALL require no missionary financial edit or duplicate exception queue.**                 |
| Additional reason duplicates handling; High / High                                          | One gift can satisfy several native predicates; task-title matching cannot prove coverage.                                               | **Multiple reasons SHALL remain attached to one D20 gift member and permanent handling identity. Current grouped completion SHALL cover only the exact reviewed authorized members.**                                             |
| Current reduction or correction manufactures new gratitude; High / Medium                   | P16 can show applied-above-current commitment without new money.                                                                         | **A changed commitment or corrected projection without a new qualified monetary occurrence SHALL NOT independently create new D31 work or revive handled coverage.**                                                              |
| Helpful explanation leaks commitment facts; High / Medium                                   | Even a generic above-commitment label reveals a financial comparison; optional details may expose another ministry or private terms.     | **Current permission SHALL govern reason existence, exact amount, comparison context and every derived surface before delivery; details SHALL NOT be sent for cosmetic hiding.**                                                  |
| Broad tasks/customization copied from other products; High / Medium                         | Givebutter documents broad staff visibility, email assignment and unrestricted uncompletion.                                             | **Reuse Core task/source/privacy contracts; comparator UI patterns SHALL NOT enlarge audience, trigger sending or bypass D20 history and correction.**                                                                            |
| Group updates disrupt mobile or accessible action; Medium / Medium                          | New rows and asynchronous status may shift focus or change an unseen action set.                                                         | **Essential amounts/reasons and reviewed scope SHALL remain readable and operable across phone, keyboard, screen reader and low-bandwidth paths; background updates SHALL NOT silently change completion scope.**                 |

## Proof and bounded monitoring

Before release, demonstrate a source-qualified tiny positive amount, exact zero,
negative/reversed amount and invalid precision. Include supported zero-, two-
and three-decimal currencies and localized presentation; no case may use a
wrong currency or round an eligible amount to zero. The minimum supported unit
is a representation boundary, not an adjustable business minimum.

Test the Q31 scenario independently of firstness, fulfillment, donor-stated
additionality, one-time purpose and D22 amount matching. Then combine reasons
on one gift and distinct gifts in one reviewed group. Prove that fee cover,
advance/catch-up, unresolved matching, term reduction and historical replay do
not manufacture this reason. These are required source/domain outcomes, not
claims that a formatter or finite model proves the real financial classifier.

Use representative missionary and authorized staff tasks to verify that people
can explain why the task exists, distinguish gift amount from excess, recognize
that no donor intent was inferred, and finish only the reviewed gifts. Include
phone, keyboard and screen-reader evaluation. No interviews, sample size,
completion-rate measurement or successful live test is claimed by this note.

The P28 product/UX owner should treat **any observed misunderstanding that the
donor owes money, changed future giving, stated additional intent, or was
automatically contacted** as a pre-release blocker: correct the copy/interaction
and repeat the scenario. The P28 feature owner with the P16 source owner should
investigate **one reproducible fee/match/rounding false positive or duplicate
handling report** immediately, preserve minimal evidence and stop the affected
admission path if correctness cannot be maintained. Do not respond by adding a
threshold or changing donor terms. These are proposed operational responses,
not measured current incidents or permission to defer source qualification.

The remaining implementation question is whether each actual source can prove
the comparison and privacy projection. That requires owner integration proof;
it does not require another product minimum or a new missionary finance flow.
