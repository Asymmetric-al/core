> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

# Phase 25 R03 — Replacing a payment method used by recurring gifts

> **Answered 7 September2026:** Conrad selected A and requested the full journey/database/adversarial review. This preserves the original question and recommendation. The [complete R03 review](phase25-r03-adversarial-review.md) supersedes its pending status and identifies the material owner amendments separately.

Researched 7 September 2026. **Recommendation only; awaiting the founder's answer.** This is a grill question/evidence record, not a PRD, formal specification, implementation plan or ticket. The question follows R02's explicit ratification and does not reopen Ministry Updates.

## R02 ratification

Conrad explicitly ratified the reviewed R02 decision and recommendations: immediate combined authorized reading, optional ministry filtering, the C01–C16 execution safeguards, and the required future proof. These are now settled product requirements. No implementation or publication authorization was inferred from “proceed.”

## Adversarial check

### What could go wrong with this answer?

Ratification could be mistaken for proof that the current reader is safe or that its dependencies are implemented. Keep the recorded requirements separate from actual release evidence.

### What hidden assumptions are we making?

No new scope or permission follows from accepting the recommendations. Existing audience, media, paging and current-access owners must still supply and prove their contracts.

### How does this affect the whole product?

The donor reading experience is settled without creating a second publishing, permission, notification or reading-tracking system. Related home, detail, media and authentication-return paths must remain coherent.

### How does this affect the end-user experience?

Donors start reading immediately, narrow when useful, keep their valid place and receive truthful loading/recovery states. Necessary access checks stay understandable and proportional.

### Does this follow modern best practices?

Yes as reviewed: visible scope, stable reading, restrained presentation and explicit continuation. Vendor documentation and synthetic SQL remain evidence of patterns and hazards, not measured Asym usability.

### Does this fit Asym’s existing repo and product direction?

Yes against the intentional source boundaries and exact Maia/Base UI. The R02 legacy defects and real implementation proof requirements remain recorded.

### Should we adjust the recommendation?

No further amendment to R02. Record explicit ratification and move to a genuinely unresolved donor workflow.

## The real-world situation

Illustrative example, not an observed donor record: Sarah has three recurring gifts in the same organization/account context. Two use her expiring Visa; the third uses a bank account. She selects **Replace this card** in her wallet.

The product must help her finish the intended repair without mistakenly moving the bank-funded gift, changing a different donor's arrangements, or implying that saving a card fixed everything. The question is how to present the existing uses of that exact card for review—not whether saving a method grants payment authority.

## The one decision

**When a donor explicitly chooses Replace this card, how should we select the existing recurring gifts to review?**

<!-- prettier-ignore -->
| Option | What Sarah does | Benefit | Cost / tradeoff |
| --- | --- | --- | --- |
| **A. Guided replacement, eligible uses already selected — recommended** | Sees the two eligible gifts using that exact card, already selected; can deselect either; reviews the exact effects and confirms. | Closely matches her stated task and avoids repetitive selection. | Requires a complete source-qualified usage list and a clear final scope. Preselection cannot stand in for authorization or success. |
| **B. Guided replacement, choose each use** | Sees the same eligible list with none selected; selects the gifts to change, then reviews and confirms. | Every selected gift requires an individual choice. | More taps and a greater chance of accidentally leaving an intended gift on the expiring card. Still a reasonable alternative for a deliberately conservative default. |
| **C. Change one arrangement at a time** | Opens each recurring arrangement and changes its method through the existing owner journey. | Simplest individual scope and result; avoids a combined replacement presentation. | Repeated work and more chance of stopping after only one gift. This is a legitimate simpler product option, not an unsafe one. |

**Recommendation: A.** “Replace this card” supplies a clear task context, so showing its eligible uses selected is reasonable assistance. Selection remains editable and unapplied until exact review/confirmation. A generic Add payment method action does not provide the same intent and must not preselect existing arrangements. Starting from one recurring gift remains scoped to that gift unless the donor deliberately expands the task.

The strongest alternative is B: identical visibility and safety boundaries, with explicit selection of each gift. Its additional selection work does not replace authorization or the final review. A better meets the ratified effortless self-service goal while keeping consequential scope visible.

This is a bounded new Phase 25 presentation choice. It does not establish one cross-group atomic command, staff mass-binding authority or an unverified provider capability.

## What is already settled

<!-- prettier-ignore -->
| Requirement | Evidence and meaning |
| --- | --- |
| Exact selected-line preview and apply | [Phase 16 PRD](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md#L347) and [issue812](https://github.com/Asymmetric-al/core/issues/812) require server-resolved compatibility, Current/After terms, affected lines/cohorts, next dates, authorization and provider operations. Selection defaults are not prescribed. |
| No silent sibling changes | The same owner contract requires prospective splitting where needed; sharing a card or provider Customer does not merge groups or expand selected scope. |
| Saving is separate from collection and missed-gift retry | [Phase16 recovery](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md#L665) and [issue816](https://github.com/Asymmetric-al/core/issues/816) separate method repair from an exact-occurrence retry. An ordinary save does not charge, create catch-up debt or retry a missed gift. |
| Provider-owned collection and exact authority | [Issue815](https://github.com/Asymmetric-al/core/issues/815), Phase16 credential/authorization rules and [issue799](https://github.com/Asymmetric-al/core/issues/799) require exact account/mode/credential/authorizer lineage. A saved method is not authorization for arbitrary later use. |
| Partial and unknown results stay truthful | [Issue811](https://github.com/Asymmetric-al/core/issues/811)/[812](https://github.com/Asymmetric-al/core/issues/812) use source command results and reconciliation. An unresolved provider result is not a failed request to submit again under a new identity. |
| Removal has a stronger prerequisite than selective replacement | [Donor self-service OpenSpec delta139–153](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/openspec/changes/add-donor-self-service/specs/donation-lifecycle/spec.md#L139) requires compatible replacement for every affected active line before removing an in-use method. Deselecting a usage does not permit deletion underneath it. This remains an active change's inherited contract, not implemented proof. |
| Safe masked display | Issue811 requires owner-qualified method labels and forbids leaking sibling credentials. Matching last four digits or a display label is not credential identity. |

The phrase **default for future giving** is a proposed clear UI meaning consistent with these boundaries and the user’s Phase25 coverage requirement. The inspected PRDs do not contain a universal verbatim rule that every provider's default affects future gifts only. What is established is that changing an existing arrangement requires its owner-authorized command; a generic default setting cannot silently rebind it. Exact default labeling remains separate from R03's selection decision.

## Required boundaries for any selected option

1. **Select actual compatible uses, not lookalike cards.** The server resolves exact credential lineage, current account/Party, permission, authorizer, provider scope and current arrangement terms. Never identify the old credential by last four digits, email, common customer ID or browser input alone. Do not reveal an inaccessible usage merely to explain a total.
2. **Show the exact reviewed scope.** Source-safe gift summaries identify destination, original amount/currency, cadence/status and effective/next-use information. Do not add unlike currencies or expose restricted ministry names. The final action names what will change. If preview changes materially, refresh it before applying.
3. **Keep task intent narrow.** Add/Save, preferred method for future new giving, replacement of selected existing uses, removal, and retry are distinct effects. They may share a clear journey without becoming one implicit command. No silent fallback charging on another saved method.
4. **Keep owner boundaries across arrangements.** Within a group, Phase16 owns splits and child operations. Across groups, independently valid previews/commands retain their own scope and results. A shared review cannot transfer payment consent, merge groups, promise cross-group atomicity or extend staff bulk permissions. Additional confirmation is needed only when the owner/provider actually requires it, with a clear reason.
5. **Use the owner's eligibility and lifecycle.** A paused arrangement may still need a replacement for its future return; do not silently exclude it just because it is paused. Show its paused status and preserve it. Replacement cannot resume, restart a canceled authorization, change amount/date/designation or alter an in-flight gift.
6. **Separate repair from recovery.** No replacement action starts or enables an otherwise forbidden missed-gift retry. Previously authorized scheduled recovery remains a distinct owner fact, explained where relevant. The implementation must account for provider retry behavior; a reassuring label alone is not sufficient proof.
7. **Collect and verify safely.** Use provider-hosted fields. Reuse one collection only where actual account/rail/authorization rules permit it. A bank method awaiting verification is not ready, and a new card may require additional authentication. No financial details are collected by this grooming session.
8. **Report exact outcomes and preserve references.** Distinguish method saved, individual arrangements updated, still confirming and needs action. Resolve unknown outcomes before retrying; preserve the old method while any active usage remains unresolved. A failed replacement must not silently cancel the recurring gift. No global all-fixed toast based only on collection success.
9. **Keep the UI ordinary and accessible.** Use shared base-maia/Base UI, visible selection labels, accessible review/focus/error handling, safe mobile layout and local recovery. A combined review does not justify a new bulk-workflow builder or a new payment-method truth table.

These are inherited constraints or recommendations to pressure-test with the answer. R03 itself is not yet ratified.

## Current implementation versus the permanent path

`develop` was refreshed at **7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd** during this question's research.

- The [wallet client](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/donor/app/%28dashboard%29/donor-dashboard/wallet/page-client.tsx#L1254) uses local sample methods and local mutation handlers; raw card/CVC form state is prototype evidence, not an acceptable collection pattern. **Classification: Implementation accident / conflict with first principles.**
- The [donor model413–441](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/donor-portal/model.ts#L413) derives payment-method summaries from recurring subscription IDs and historical method labels. This does not prove a complete authoritative inventory of an exact credential's uses. **Classification: Temporary bridge.**
- The [billing route](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/donor-portal/billing.ts#L17) opens a generic Stripe portal session. It is not the source-owned preview/apply experience required by Phase16. This does not imply that Stripe's hosted portal universally lacks a particular capability. **Classification: Temporary bridge.**
- Owner previews, immutable command results, scope-qualified masked methods and provider-managed fields are the **Durable pattern**: intentional separation of financial authority from presentation.

The bodies of issues **811,812,813,615,709,799,815,816** were read and their open states verified on 7 September. Reuse/reconcile them instead of publishing duplicate Phase25 commands. [Issue615](https://github.com/Asymmetric-al/core/issues/615) explicitly leaves donor-side completion of payment-method update requests to Phase25; its old shorthand needs current-direction review. [Issue709](https://github.com/Asymmetric-al/core/issues/709) still prescribes fan-out to all subscriptions inside one group. It does not authorize cross-group updates or checkbox defaults; the [Phase16 A6 congruence amendment](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-16-cross-prd-congruence-2026-07-13.md#L175) and issue812 supersede its older mutation assumptions.

## Current official product evidence

These are documented journeys and, where labeled, historical user feedback. No vendor account UI or Asym donor usability test was run for R03. External examples are **Useful precedent**, not authority to change Core's ownership or consent model.

<!-- prettier-ignore -->
| Source | Evidence useful here | Limitation |
| --- | --- | --- |
| [Blackbaud current Portal Features](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-feature-configuration.html) | Donors can save card/bank methods and opt to apply them to active recurring gifts. Card-information edits apply to active card gifts. | Does not establish checkbox defaults, arbitrary card-to-bank changes or cross-account authority. |
| [Blackbaud product-manager discussion](https://community.blackbaud.com/discussion/64784/donor-portal-updating-recurring-gifts), 2023 with July2024 update | Reports actual confusion when donors thought a wallet update repaired recurring giving. The later reply announces explicit application to active recurring gifts. | Historical feedback and product response, not current prevalence or an Asym usability metric. The old limitation must not be presented as current. |
| [Church Center methods](https://help.planningcenter.com/en/141286-add-and-manage-payment-methods.html), published September3,2026 | In-use methods cannot be deleted before the recurring donation uses another method; unverified US bank methods have a visible verification step. | No documented multi-arrangement replacement or selection default in this article. |
| [Fundraise Up donor guide](https://fundraiseup.com/docs/donor-portal-guide/) | Method changes occur in the selected recurring-plan detail. | The article's apply-to-all checkbox concerns contact information, not proof of bulk payment-method changes. |
| [Givebutter recurring management](https://help.givebutter.com/en/articles/4529176-how-to-edit-and-manage-your-recurring-donation), June2026 | Contextual management and expiry alerts connect the donor to the relevant arrangement. | Do not import its lifecycle/retry limits or assume its link authorization is Core's contract. |
| [PayPal preferred method](https://www.paypal.com/us/cshelp/article/how-do-i-set-a-card-as-a-preferred-payment-method-help821) | A wallet preferred method does not change automatic agreements; those have their own selection. | Useful distinction, not a requirement to make Asym donors repeat the same task for each gift. |
| [Netflix methods](https://help.netflix.com/en/node/134233) | Additional methods can act as automatic backups. | **Conflict with Asym if copied:** saving a method cannot silently authorize charging it after another fails. |

Pushpay's wallet guide remains supporting evidence from the immediately preceding browser research; the current text reader did not render it. No new capability claim depends on that unavailable refresh. No retention percentages or dated retry limits are used to justify A.

## Stripe evidence and exact integration limits

Current Stripe documentation was retrieved using `stripe docs` and the Stripe documentation tool, including the specific Elements variants where a page is an index. The inspected repo pins **stripe22.2.0** and API **2026-05-27.dahlia**. The CLI is **1.50.5**; no upgrade was performed.

<!-- prettier-ignore -->
| Source | Relevant fact and consequence |
| --- | --- |
| [Subscription payment methods](https://docs.stripe.com/billing/subscriptions/payment-methods-setting) | Subscription-specific settings and payment-type restrictions matter. A generic customer default is not a complete description of every existing arrangement's method. |
| [Smart Retries](https://docs.stripe.com/billing/revenue-recovery/smart-retries) | Subscription defaults take precedence over customer defaults. Changing only the customer default can leave an old subscription method in use. Scheduled retries and detecting a new method can affect recovery; the owner must prevent replacement from silently enabling an unauthorized missed-gift collection. |
| [Update Customer API](https://docs.stripe.com/api/customers/update) | The legacy `source` update can retry eligible past-due invoices. Do not implement a supposedly charge-free repair through an endpoint with unaccounted collection effects. This does not mean every default-field update immediately charges. |
| [Save without payment, Elements](https://docs.stripe.com/payments/save-and-reuse?payment-ui=elements) | SetupIntent collection supports saving for later use without a payment. Collection alone does not establish that all selected recurring bindings changed successfully. |
| [ACH setup, Elements](https://docs.stripe.com/payments/ach-direct-debit/set-up-payment?payment-ui=elements) | Bank verification and mandate acceptance are separate required steps; additional-action states are not readiness. Do not request unrelated balances/transaction access merely because an example includes extra Financial Connections permissions. |
| [Direct-charge method sharing](https://docs.stripe.com/connect/direct-charges-multiple-accounts) | Eligible cloned methods have independent identities and are not automatically synchronized. Same-looking methods are not a global replacement/delete authority. No new cloning architecture is selected by R03. |

A fresh **read-only default/test CLI probe**, explicitly using the pinned API version, returned: platform type standard, US; charges disabled; payouts disabled; details not submitted; empty capabilities; **zero connected accounts**, with no further page. No `--live` request or financial mutation was made. Private fields and credentials were not printed or copied into this record.

Therefore the exact connected-account capability/control/authorization behavior is **not verified** in this environment. Issue799's account/mode/merchant/application evidence gate remains mandatory. This does not block deciding the desired UI; it prevents claiming the implementation or a single provider operation works. No other account or live environment's state is inferred.

## What this question will settle and what it will not

An answer settles the default selection experience for an explicitly initiated replacement and whether a combined review is part of Phase25. It does not settle a new authorization model, permit an unverified payment command, make provider operations atomic or authorize implementation now.

Later acceptance must prove: complete source-qualified usage discovery; exact old-credential identity; exclusion of other methods and unauthorized Parties; paused/canceled behavior; no amount/date/lifecycle/consent side effects; safe selection changes; exact review/apply with stale-preview rejection; partial/unknown results; no hidden retry; no in-use removal; provider-hosted collection and authentication; real PostgreSQL authorization/concurrency; exact test-account contracts; and accessible donor journeys. These are evidence obligations, not tests run in this question turn.

The proposed wording and selection defaults are product judgments. A's recommendation is stronger because it follows explicit task intent while retaining precise review, not because a vendor established that prechecked gifts are universally best.
