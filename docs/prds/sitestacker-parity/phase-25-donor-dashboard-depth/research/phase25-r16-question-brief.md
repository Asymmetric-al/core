> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

> **Explicitly founder-ratified, 7 September 2026.** Conrad accepted Q16 A1–A5/J01–J12/V1–V8/C01–C22 and24h/10day pending-preference limits. Historical proposal wording below is retained as evidence. ACH presentation is additionally strengthened to feel confidently complete after proved submission, while Processing, remaining actions, received money and future activation remain truthful and distinct. Target proof and Q14 G01 remain open.

> **Status update, 7 September 2026:** Conrad selected A. The completed Q16 adversarial review proposes A1–A5/J01–J12/V1–V8/C01–C22 for ratification, including personal scope and bounded pending-preference clocks. Historical unanswered wording below is preserved; corrected execution is not yet ratified.

# Question 16 — Choosing a preferred method while adding it

7 September 2026. Research/grooming only. **Question15 A1–A4/J01–J12/C01–C22 and Maia presentation are ratified. Question16 is unanswered.** Q14 G01 and required target implementation/proof remain open.

## The one open choice

When adding a payment method from Wallet, should the donor be able to explicitly choose it as the preferred method for new gifts within that same journey, or make that choice afterward from Wallet?

The financial boundary is already settled: saving a method, selecting a future-gift preference, replacing existing recurring bindings and removing a method are separate effects. This question chooses how related deliberate tasks are presented; it does not reopen those boundaries or propose automatic default switching.

**Recommend A — An optional preference choice within Add payment method.** B remains a credible simpler sequence, with an immediately accessible separate wallet action after saving.

### Concrete donor example

Sara's monthly gifts use her bank account. She adds a new card for occasional new gifts that she starts herself. She wants that card selected first next time she opens checkout, while her established monthly gifts continue using the bank account.

<!-- prettier-ignore -->
| Option | Sara's experience | Benefit | Tradeoff |
|---|---|---|---|
| **A — Offer the choice within Add. Recommended.** | During the Add journey she can deliberately select “Select this first when I start a new gift.” The option is initially unchecked. After successful setup and the separately qualified preference result, the card becomes her preferred option for eligible new giving in that scope. | Completes both related intentions within one flow. Donors who only want to save a method can ignore it. | Adds one optional concept to Add, and the result must distinguish saved-method success from preference success or pending verification. |
| **B — Save first; choose preference afterward.** | Add saves the card. Back in Wallet, a clear action on that card says “Prefer for new gifts.” Sara chooses it there. | Keeps secure setup focused on one outcome and makes the separate preference change especially explicit. | The donor must remember to make the preference choice after Add completes. The action must remain easy to find; B does not mean a buried settings maze. |

Both retain the standalone preference action for existing methods. Neither automatically makes the newest or last-used method preferred, changes an established recurring arrangement, removes the old method or initiates a missed-gift retry.

## Recommended presentation

Use existing shadcn/Base UI fields and Maia spacing with one short optional choice, not a “save/default/autopay” control panel. Illustrative copy:

> **Select this first when I start a new gift**
>
> Your existing recurring gifts keep their current payment methods.

“New gift” includes a new recurring arrangement when that method is eligible; it does not mean the next installment of an established arrangement. The donor remains able to choose another method and reviews the actual payment at checkout. “Default” without this explanation is needlessly ambiguous.

A is recommended because it keeps related intentions together when the donor has both. That is a product judgment, not a measured conversion claim or a documented universal vendor standard. A checkbox-plus-save can take the same number of clicks as save-plus-preference, so no fixed click-count reduction is claimed. Do not freeze the exact component location before the post-answer journey review; the optional preference must be offered at a point where setup/readiness and its actual effects can be truthfully represented.

## Current primary evidence

- **PayPal — Useful precedent, particularly for B.** Its current help says to add a method first, select it in Wallet and set it preferred. It explicitly separates this preference from automatic payments. This is strong evidence for clear separation, but not proof that PayPal uses A's inline choice. [Official preferred-method guide](https://www.paypal.com/us/cshelp/article/how-do-i-set-a-card-as-a-preferred-payment-method-help821).
- **Amazon Pay — Dated useful precedent.** Its official June2022 article distinguishes Add from Edit/set-default. The page remains available, but its current live UI was not independently tested. Do not import its account-wide scope, backup charging or one-click payment behavior. [Wallet guide](https://pay.amazon.com/blog/for-shoppers/how-to-manage-your-amazon-wallet).
- **Church Center — Useful readiness distinction.** Its current bank-transfer guide describes saved but Unverified bank methods that cannot yet be used. Saved, usable and preferred are distinct facts. Its provider-specific timing/country limits are not adopted. [Bank-transfer guide](https://help.planningcenter.com/en/138395-bank-transfer-donations.html).
- **Blackbaud — Historical problem evidence, not current-limit evidence.** A vendor product manager's 2023 response described donors mistaking wallet updates for recurring-gift updates; the same thread records a July2024 enhancement permitting explicit application to recurring gifts. Do not repeat the older limitation as current behavior. The lesson is explicit scope; Q03 already owns Asym's guided recurring replacement. [Vendor discussion and later update](https://community.blackbaud.com/discussion/comment/270287/).
- **Stripe — Provider qualification.** Current official docs show subscription-level methods take precedence over Customer defaults; subscriptions without an explicit method can inherit Customer defaults. Smart Retry precedence can use those fields too. Therefore a donor-facing new-checkout preference cannot blindly write `invoice_settings.default_payment_method` and promise existing giving is unaffected. Invoice settings that save a method as subscription default are another distinct effect. Docs were retrieved through Stripe CLI. [Payment-method settings](https://docs.stripe.com/billing/subscriptions/payment-methods-setting), [Smart Retries](https://docs.stripe.com/billing/revenue-recovery/smart-retries), [Customer update](https://docs.stripe.com/api/customers/update).

Stripe's saved-method presentation also has its own redisplay and ordering rules. A local preference cannot be assumed to select an arbitrary method inside Payment Element; the exact shared checkout must prove supported presentation/selection without changing existing billing consumers or broadening redisplay permission. This is a common engineering prerequisite for both A and B, not a second founder choice. [Saved-method display](https://docs.stripe.com/payments/save-customer-payment-methods).

No reviewed primary source proved an exact donor Add-plus-preference control or measured A's superiority. The recommendation uses the verified task boundaries and Conrad's established preference for quiet, coherent task completion.

## Fit with the current repository

Current inspected develop: `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`.

<!-- prettier-ignore -->
| Source | Settled versus open |
|---|---|
| Ratified Q03, especially separate effects and abandoned setup | Add/default/removal do not follow automatically from replacement. Saving alone supplies no future-default consent. A's explicit extra choice does not change that rule. |
| Q06, Q09 and Q15 | Saving or preferring a method does not complete a recurring repair, retry a miss, save an edited gift or restart canceled giving. Those journeys retain exact owner authorization. |
| Phase25 roadmap:2861; active donor lifecycle delta:141–154 | Add/remove/default capabilities are intended. The delta groups them under Stripe-managed flows but does not decide this optional combined presentation. Its default wording needs explicit owner qualification to preserve the user-ratified future-new-gift boundary. |
| Phase16 cohort/authorization model and ADR-0001 | Existing arrangement methods/authority belong to their owners. A convenience preference cannot become billing or a second financial source of truth. |
| Current wallet `page-client.tsx:1254 onward,1370–1400` | Uses MOCK_METHODS, local `isDefault`, first-method auto-default and local setDefault. These are **Implementation accidents** for the target, not persisted/current consent or safe provider behavior. Raw-card prototype collection is not adopted. |
| Current Stripe pins | SDK22.2.0/API2026-05-27.dahlia unchanged. Documentation is not a silent upgrade or exact connected-account execution proof. |

Current GitHub bodies were read: [#615](https://github.com/Asymmetric-al/core/issues/615) is OPEN and owns a read-only staff instrument panel, not donor preference mutation; [#812](https://github.com/Asymmetric-al/core/issues/812) is OPEN and owns exact recurring changes, not a generic wallet default/detach writer. #615's old provider-Customer/phone-entry wording and #704's older per-line subscription fan-out must be reconciled with current P9/P16/Q03, not adopted as default implementation authority. Bounded searches found no distinct implemented donor-default ticket; this is not proof that no related issue exists anywhere. No ticket was created or changed.

**Durable patterns:** provider-hosted collection, explicit scope, current eligibility, no unauthorized recurring mutation, exact result truth and shared Maia. **Useful precedents:** PayPal's separate preference and task grouping with clear optional consent. **Temporary bridge:** the existing generic Billing Portal entry. **Conflict with first principles:** treating Customer billing defaults as harmless UI preference, collecting raw card details or inventing successful persistence from a local badge.

## Boundaries for either answer and post-answer work

1. Preference applies only in the qualified organization/Party/financial-account context; it is not a global cross-Tenant/represented-donor choice. The owner must make that scope understandable without technical selectors in the ordinary case.
2. Setup, verification and preference have independently truthful outcomes. Pending bank verification cannot appear ready. If Add succeeds and preference fails or is unknown, retain the saved method and recover the preference result; do not ask the donor to add the card again.
3. Keep the previous confirmed preference unless an explicit replacement succeeds. A lone usable method can be offered at checkout without fabricating an explicit standing-preference decision. First-method behavior must be resolved deliberately in execution review.
4. The treatment of a preference requested before delayed verification completes is not silently chosen here. Resolve whether to retain a bounded request or ask again when usable, with exact expiry/authority/race behavior, after the founder selects the journey.
5. If a preferred method is unavailable for a later gift, allow a clear eligible choice. Preference does not authorize backup charging or override the method the donor deliberately selects for that transaction.
6. The same owning Add/default commands and current access controls serve both options. No new universal wallet ledger, per-provider UI stack or bulk recurring executor is justified. Source/provider defaults and donor selection preference require explicit contract mapping, not route-level Stripe writes.

The narrow A/B choice can be made now. The subsequent adversarial review will resolve exact ownership/scope, initial defaults, setup/preference ordering, delayed/partial outcomes, current checkout adoption and proof requirements without relitigating Q03's settled separation.

No runtime, database, browser or financial test ran for this question. Provider configuration, source, GitHub and canonical ADR/OpenSpec remain unchanged. Exact connected-account qualification and Q14 G01 stay open. This is not a readiness declaration or a formal specification.
