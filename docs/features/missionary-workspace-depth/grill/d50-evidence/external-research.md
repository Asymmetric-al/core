# D50 — Recurring campaign origin and deliberate future amendments

Research/access date: **2026-10-18 (Asia/Bangkok)**. Status: evidence for the founder's selected **Q50 A**, as communicated in this task: reassigning a tracking code does not change the campaign attribution of the same continuing recurring commitment. Separately authorized prospective attribution amendments remain possible. This note does not ratify additional review details, amend formal owners or establish implementation.

## What the research establishes

Current public documentation provides useful examples of recurring-plan continuity, explicit campaign amendments, amendment history and campaign archival. It does **not** establish a vendor consensus about reusable tracking-code remapping. None of the inspected sources describes Core's exact registry operation.

The practical recommendation is to preserve the selected commitment attribution by default, explain the effect when a code changes, and keep any deliberate future-attribution amendment separate. “Original campaign” should describe acquisition history; after an authorized amendment, it must not misleadingly label the commitment's current future-attribution value. That distinction is product judgment grounded in the selected answer and existing Core owners, rather than a universal nonprofit rule.

Nine relevant primary pages were freshly opened and their relevant body text inspected. Four URLs also informed D49 and were reverified for this task. Publication dates below are only dates displayed by the source; example years, search crawl dates and copyright years are not publication dates. No authenticated product access, account creation, donation, payment retry or live configuration change occurred.

## Source register

### S1. Donorbox — archived campaign and continuing plans

**Source:** [What happens to recurring donations once the campaign is archived?](https://donorbox.zendesk.com/hc/en-us/articles/360020294052-What-happens-to-recurring-donations-once-the-campaign-is-archived). **Displayed update:** August 18, 2025, 13:18; timezone unspecified. **Access:** 2026-10-18.

**Exact short excerpt:** “They will continue to be recorded under the old campaign.”

**Documented behavior:** archiving a campaign does not stop its recurring payments. The article separately points staff to switching a recurring plan's campaign from the Recurring Plans area.

**Useful lesson:** the availability of a campaign for new fundraising can be distinct from attribution on an existing recurring plan.

**Limit:** Donorbox's archived state is not proof of Core's closed-node rules, payment authorization, financial destination or campaign permissions. The page does not discuss reusable tracking codes, deleted campaigns, campaign mergers or historical-as-of hierarchy reporting. It documents one product's archival behavior, not a mandate to keep collecting under every kind of closed campaign.

### S2. Donorbox — explicit plan campaign edit

**Source:** [How to move a donation to another campaign](https://donorbox.zendesk.com/hc/en-us/articles/360020293052-How-to-move-a-donation-to-another-campaign). **Displayed update:** August 22, 2026, 11:15; timezone unspecified. **Access:** 2026-10-18. Reverified from D49.

**Exact short excerpt:** “On the Plan's Details Page, click on the 'Edit' pencil icon next to the campaign name.”

**Documented behavior:** a plan is located by its Plan ID, a campaign is selected on the plan and the change is saved. A distinct one-time-donation workflow identifies a particular donation and reviews its destination before confirmation.

**Useful lesson:** deliberate plan attribution changes and individual-gift corrections can be separate understandable operations.

**Limit:** this page does not specify whether moving a recurring plan changes earlier installments or precisely which pending occurrence receives the new campaign. It does not prove an immutable audit log. Its campaign/designation controls must not merge those separate Core concepts or grant Core actors new editing rights.

### S3. Blackbaud Raiser’s Edge NXT — prospective amendments and pending retry

**Source:** [Recurring Gift Amendments](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/en-ca/content/bb-recurring-gift-amendments.html). **Publication/update:** not displayed. **Access:** 2026-10-18; Canadian-English help. Reverified from D49.

**Exact short excerpt:** “recurring gift payments that have already been processed remain unchanged.”

**Documented behavior:** amendments can change a recurring gift's campaign, appeal, fund and other details for future installments; the record exposes amendment history. If an installment is pending in a retry cycle, the amendment applies to the next scheduled installment. The inspected page also limits amendment eligibility, including terminated/completed gifts and an installment scheduled on the current date.

**Useful lesson:** future changes need an operational boundary and an explanation of pending work, rather than an unrestricted “applies immediately” promise.

**Limit:** the page governs Blackbaud amendments, not Core registry remaps. Its restrictions and mixed campaign/fund editing surface are not Core policy. It does not independently resolve every kind of retry; compare S4 rather than claiming all retries use entirely frozen values.

### S4. Blackbaud Raiser’s Edge NXT — an important contrary retry behavior

**Source:** [Retry Failed Recurring Gift Payments](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-recurring-gift-retry-failed-payment.html). **Publication/update:** not displayed. **Access:** 2026-10-18.

**Exact short excerpt:** “When you retry a payment, it's for the current amount on the recurring gift record.”

**Documented behavior:** a manual retry from a failed-payment record can use an amount different from the original attempt. Successful retry updates that payment record; another failure retains its zero-value record and updates failure comments.

**Useful contrary evidence:** vendors do not uniformly document the same immutable-occurrence semantics across every field and retry action.

**Limit:** this is an **amount** rule; the page does not state which campaign a retry uses. S3's retry-cycle amendment note and this manual-retry rule must not be collapsed into an unsupported campaign guarantee. No attempt was made to reconcile their internals or test the product. Core's accepted-occurrence attribution and financial authorization rules remain authoritative; this is not a recommendation to copy Blackbaud's amount behavior.

### S5. Salesforce NPSP — acquisition campaign versus later upgrade appeal

**Source:** [Track Upgrades, Downgrades, and Other Recurring Giving Changes](https://help.salesforce.com/s/articleView?id=sfdo.npsp_track_rd_changes.htm&language=en_US&type=5). **Publication/update:** not displayed. **Access:** 2026-10-18. The article's illustrative 2020/2021 campaigns do not date its current publication.

**Exact short excerpt:** “Update the Campaign.”

**Documented behavior:** an example donor originally acquired through one campaign later responds to an upgrade appeal. Staff deliberately edit the recurring donation's amount and campaign. The change-log view exposes recent changes and a full timeline; campaign/status/payment-method changes are logged separately from amount-derived upgrade/downgrade classification.

**Useful lesson:** acquisition origin and a later, intentional attribution amendment can both matter. A commitment's current campaign need not be mislabeled as its original acquisition campaign after such an amendment.

**Limit:** the example does not authorize automatic remapping or prove how closed installment Opportunities change. A donor response appears in this vendor example, but it does not establish a new universal Core consent requirement for a reporting-only amendment. This is NPSP documentation, not a Nonprofit Cloud runtime claim.

### S6. Salesforce NPSP — pause and resume within an existing recurring record

**Source:** [Pause a Recurring Donation](https://help.salesforce.com/s/articleView?id=sfdo.npsp_pause_a_recurring_donation.htm&language=en_US&type=5). **Publication/update:** not displayed. **Access:** 2026-10-18.

**Exact short excerpt:** “NPSP won't create Opportunities for those installments marked paused.”

**Documented behavior:** users select installments to pause on the existing recurring record and later remove the pause there. The article warns that changing schedule details, including amount or frequency, replaces the schedule and reactivates paused installments.

**Useful lesson:** pause/resume is presented as management of the existing arrangement. Material side effects of another edit deserve clear disclosure.

**Limit:** the article does not explicitly promise campaign preservation through pause, prove suppression of a processor's charges, or decide canceled-plan restart semantics. Its twelve-installment limit and reactivation-on-schedule-change behavior are vendor choices, not recommendations for Core. Core's own pause rules must not be weakened to match them.

### S7. Salesforce NPSP — configured campaign copying

**Source:** [Configure Recurring Donations](https://help.salesforce.com/s/articleView?id=sfdo.npsp_configure_recurring_donations.htm&language=en_US&type=5). **Publication/update:** not displayed. **Access:** 2026-10-18. Reverified from D49.

**Exact short excerpt:** “When selected, NPSP copies the Campaign you specified on the Recurring Donation to its installment Opportunities.”

**Documented behavior:** copying the recurring record's campaign to installments is a setting. A separately enabled change log records specified recurring-field changes and has configurable read access.

**Useful lesson:** an explicit attribution source and understandable change history are real product capabilities; they should not be inferred from a generic “recurring” label.

**Limit:** the configuration page does not select original versus current tracking-code mapping, guarantee retroactive changes to all closed installments, or prove a deployed configuration. Core's selected rule does not require importing another campaign-copy toggle, optional audit switch or Salesforce object model.

### S8. CiviCRM — source precedence when creating later contributions

**Source:** [Recurring Contributions — Developer Guide](https://docs.civicrm.org/dev/en/latest/financial/recurring-contributions/). **Publication/update:** not displayed. **Access:** 2026-10-18; `latest` documentation, not a pinned installed version. Reverified from D49.

**Exact short excerpt:** “Recurring contributions record an intent to make ongoing contributions.”

**Documented behavior:** installment creation combines incoming information with recurring/template information. Explicit incoming campaign attribution takes precedence over recurring-record data, then template/fallback data. The guide separately explains that an exceptional contribution amount edit need not express changed future intent; synchronization behavior changed in version 5.61.

**Useful contrary evidence:** recurring implementations can admit different explicit sources rather than a universal, immutable original-campaign field. Evidence precedence needs to be qualified.

**Limit:** developer documentation does not establish the UI or intent behind a particular incoming value. The amount-sync explanation does not prove corresponding campaign-sync behavior. Copying the latest prior gift is not a recommended fallback for missing Core origin evidence. No processor, API, extension or adapter was exercised or proposed.

### S9. Donorbox — actual collection pause versus cancellation

**Source:** [How do I Cancel or Pause recurring donations as an organization?](https://donorbox.zendesk.com/hc/en-us/articles/360020293932-How-do-I-Cancel-or-Pause-recurring-donations-as-an-organization). **Displayed update:** March 30, 2026, 21:20; timezone unspecified. **Access:** 2026-10-18.

**Exact short excerpt:** “This will suspend further charges to the donor until the plan is resumed.”

**Documented behavior:** for Stripe plans, pause is a separate action from cancel, and the paused plan presents Resume. The article also discusses processor-specific restrictions.

**Useful lesson:** people can understand pausing an existing plan as distinct from ending it. A clear status and a direct action can be sufficient; attribution should not require a new decision each time.

**Limit:** the article does not specify campaign behavior, rule out every possible reactivation route after cancellation, or establish Core's new-checkout requirement. Its processor-specific restrictions were not independently verified here and are not copied into Core. No actual collection-control claim is made about Asym.

## Lifecycle comparison and recommended Core interpretation

The Core interpretation column distinguishes the selected answer or existing owner boundary from this note's UX judgment. It does not turn a competitor comparison into product authority.

| Situation                                                          | Relevant verified evidence                                                           | Core interpretation / recommendation                                                                                                                                                                      |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Staff reassign a reusable tracking code                            | No exact external analogue verified                                                  | Selected A: the same continuing commitment retains its qualified campaign basis; registry edit alone is not a commitment amendment.                                                                       |
| A later appeal intentionally changes a plan's attribution          | S2, S3, S5                                                                           | Retain the separately authorized prospective amendment path. Describe its exact scope and preserve prior history.                                                                                         |
| Campaign is archived or otherwise closed to new work               | S1 supports continuity for its particular archived state                             | Retain identity and truthful status. Core closure/availability rules still decide whether new work is permitted; do not substitute another campaign or convert attribution status into payment authority. |
| Existing arrangement pauses, then resumes                          | S6 and S9 distinguish pause from ending                                              | Existing Core boundary: pause/resume does not create a new origin. Do not re-read today's mapping solely because payments resume.                                                                         |
| Canceled arrangement restarts                                      | No inspected external source settles Core's exact restart contract                   | P16 already requires fresh checkout/authorization and does not carry old attribution forward. Do not reinterpret “keep original campaign” to cover a new commitment.                                      |
| Occurrence is already accepted, pending or retried                 | S3 has a pending-retry amendment boundary; S4 demonstrates field-specific divergence | Preserve the occurrence's qualified accepted meaning under Core's own owner contract. A late callback/retry is not a new donor attribution decision.                                                      |
| Current campaign differs from acquisition campaign after amendment | S5 provides the clearest example                                                     | Show the current applicable attribution and put acquisition/amendment history in the existing record details. Avoid a permanently inaccurate “Original campaign” label.                                   |
| Origin evidence is absent or ambiguous                             | S8 describes explicit precedence, not a universal reconstruction rule                | Preserve qualified no-campaign separately from unknown evidence. Do not manufacture either from today's registry or the latest gift.                                                                      |

## Minimal complete UX recommendations

1. **Explain the mapping edit where it happens.** A useful sentence for the code edit is: **“Existing recurring gifts keep their recorded campaign.”** Combine it with D49's explanation of earlier gifts. If needed, add **“This changes campaign reporting, not where donations go.”** These statements describe the selected attribution behavior; they do not promise a payment, receipt or designation change.
2. **Keep one readable recurring record.** Use **“Campaign for future installments”** for a qualified currently applicable value. Offer acquisition and amendment history through the existing details/history surface. A prospective scheduled amendment needs an honest effective-boundary description; do not collapse multiple applicable states into a misleading single value. Do not expose technical revisions or require a campaign wizard on ordinary pause/resume.
3. **Separate explicit amendment from registry maintenance.** Show the authorized editor the existing campaign, proposed campaign and which eligible future installments the change covers. A draft review may say **“Earlier gifts keep their recorded campaign.”** If an accepted occurrence is excluded, explain that concrete exception. Do not promise **“the next payment”** or **“immediately”** without source-qualified evidence. Mapping-edit rights alone must not expose commitment-amendment controls.
4. **Handle old campaigns without forced reassignment.** Display a qualified campaign identity with its actual status where authorized. No automatic replacement, hidden reassignment or false “needs payment update” warning should result merely from an attribution campaign becoming inactive. Do not promise ongoing processing when Core's real operational rules block it.
5. **Make missing information truthful and recoverable.** A source-qualified absence can display **“No campaign recorded”**; unavailable or unresolved evidence needs a different state such as **“Campaign information unavailable.”** Neither state authorizes choosing the current code mapping. Exact error wording depends on what the viewer may know. Keep ordinary record access useful while correction/reconciliation remains permission-bound.

These are design recommendations, not observed usability results. No separate attribution setting, campaign-origin scoring, routine approval queue, mandatory donor reconfirmation for a reporting-only change, or new integration is justified by this research.

## Local owner boundaries checked

The [Q50 research note](../phase28-q50-recurring-campaign-origin-research.md) supplied the precise frontier; its prepared/unanswered wording at the time of reading is superseded for this task by the founder's A answer communicated by the parent. Parent-owned decision/session updates are outside this file's scope.

[P16 C.4–C.5](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md#c4-bounded-and-indefinite-pause) preserves the existing schedule through pause/resume and defines restart after cancellation as fresh checkout, with old attribution excluded from carry-forward. The [term-version contract](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md#recurring_commitment_term_versions) permits prospective attribution changes without overwriting history. The [occurrence-line contract](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md#recurring_occurrence_lines) copies qualified frozen attribution into contribution generation rather than rereading mutable checkout state.

The remaining reconciliation of P13/P16 campaign mapping language belongs to the owning review. This note does not choose an attribution capture clock, transaction/lock design, campaign-hierarchy reporting basis, new closed-node exception, migration backfill rule, or new amendment actor. A current URL and a documented workflow are not proof of atomicity, provider compatibility or deployed runtime behavior.

## Scope and evidence limits

The best-supported practical pattern is **continuity with deliberate, explained amendments**, not “every modern fundraising product does this.” The strongest contrary examples are NPSP's intentional upgrade-campaign change, CiviCRM's incoming-source precedence, and Blackbaud's manual-retry amount behavior. None contradicts the founder's narrower choice to prevent a code-registry edit from silently changing the same commitment's campaign.

No authenticated vendor testing, comparative user study, fabricated ministry practice, financial operation, application test, older evidence program or model execution was performed. Modern usability quality and Core's exact lifecycle correctness still require their own implementation and evaluation evidence.
