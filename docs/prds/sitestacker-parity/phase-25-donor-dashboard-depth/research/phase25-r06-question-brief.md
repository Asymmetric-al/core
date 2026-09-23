> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

# Question 06 — The next step after fixing payment details

> **Ratified 7 September 2026.** Conrad explicitly ratified Question 06’s corrected decision and C01–C20. The review and proof obligations below remain authoritative grooming evidence; historical requests for ratification are now answered. Implementation and provider qualification remain separate.

> **Historical brief; answered 7 September 2026.** Conrad selected the quiet optional next step. The [completed Q06 review](phase25-r06-adversarial-review.md) supersedes the pre-answer examples and requires full-original-intent completion plus exact current source/provider qualification. Its corrected C01–C20 requirements await ratification. Do not re-ask the original choice.

Research and founder question,7September2026. **Historical pre-answer recommendation; see the superseding review above.** Question05 and its corrected C01–C20 execution requirements are explicitly ratified. This remains grooming; no implementation, source/GitHub/provider changes, formal specification or issues are authorized.

## The one decision

When a donor entered through a failed-gift alert and has successfully completed a source-owned payment repair, should the confirmation proactively offer a small optional next step to review a related missed gift that is **still eligible for retry**?

The alternative is to finish the repair confirmation and leave that same permitted recovery action available in the existing recurring-gift detail. Both approaches retain the required recovery capability and truthful status. This is a decision about a proactive contextual handoff, not whether recovery exists or whether saving should charge.

## Concrete situation and options

Illustrative example, not an observed donor or tested provider case: Alex gives USD50 each month. A scheduled payment fails. Alex follows the failed-gift alert and completes the payment repair. Its own confirmation is shown. The source confirms that the specific earlier USD50 payment remains eligible for review/retry and that no conflicting attempt is underway.

This is an illustrative owner-admitted case, not a verified future-method-replacement tracer. This eligibility condition matters: some changes or splits close the old recovery path. Do not promise the same offer after every method replacement, or make a method change a mandatory prerequisite for all recovery.

<!-- prettier-ignore -->
| Option | What Alex sees | Practical benefit | Tradeoff |
| --- | --- | --- | --- |
| **A — Offer a quiet optional next step (recommended)** | The completed repair is clearly confirmed. A small related item explains that the earlier USD50 gift was not received and offers **Review this missed gift**, alongside a clear way to finish. Opening it enters the existing separate financial review. | Alex can finish the problem that brought them here without searching for the earlier payment or assuming the method save collected it. | Introduces another choice after successful maintenance. It must feel optional and helpful, with no guilt, implied debt, automatic navigation or preselected charge. |
| **B — Finish the repair here** | The confirmation explains the completed repair and the earlier gift's actual state. Alex can finish; the permitted retry remains visible in recurring-gift detail when they choose to return there. | Keeps completion focused on the repair and avoids proactively asking about another financial action. | Alex needs another navigation step to find recovery and may leave with the earlier gift unresolved. The confirmation must still be truthful about that fact. |

## Best recommendation

Choose **A**, narrowly for a visit that began from the related failed-gift problem and only when fresh source eligibility admits the next step. Generic wallet maintenance stays a maintenance journey; it does not become a request to cover historical gifts.

The recommendation follows the donor's expressed task while preserving voluntary giving. Completion remains completion: the donor has completed the source-owned payment repair shown in the confirmation and can leave. Recovery is a separate choice with a clear amount/date/meaning and its own existing review and durable result. No modal automatically opens, no payment happens on save and no recovery choice is selected across R03's repaired arrangements.

The interface should keep the confirmed result visually dominant and use one restrained related next action rather than a debt banner or a multi-step checkout funnel. Compose existing Maia/Base UI components on the already required confirmation page. The source supplies the safe next-action link and current state; the portal creates no new recovery journal, task, notification or financial executor.

### Necessary boundaries already settled

- **Method update never initiates a charge.** R03 replacement also cannot silently retry, change defaults, remove the old method or resume/restart giving.
- Phase16 already requires a bookmarkable, durable confirmation after apply. The offer follows that completed result; it does not replace it with a mandatory repair-and-payment wizard.
- Phase16 already puts method update, currently eligible recovery and Stop retries on recurring detail. OptionB preserves those actions; it does not remove recovery or create a new support task.
- The source determines exact occurrence/cohort, scope, remaining retry slot, method/authorization, fee/amount, next scheduled action and current eligibility. Opening a review is not acceptance; acceptance is revalidated at its existing command boundary.
- Existing automatic recovery may already be authorized. **This save does not start a retry** is different from **nothing else can charge**. Explain any source-known scheduled retry/in-flight payment. Choosing Done or not opening the offer neither stops nor adds retries; Stop retries remains its explicit owning action.
- A relevant line/cohort mutation or split can close the old recovery path. A terminal miss, stopped recovery, pending repair, unresolved external outcome or incompatible scope cannot be made eligible by this UI.
- ACH retains its dedicated exact-cohort review, one-use recovery grant and provider qualification. Do not replace it with a generic invoice-pay action or assume card behavior applies.
- Several repaired arrangements do not become a grouped catch-up amount, obligation or preselected retry set. Keep the related source-qualified handoff narrow; do not widen from a wallet save to every past failure.
- Leaving the flow is a valid completion. No guilt-based language, mandatory reason, penalty, hidden catch-up debt or required new gift is introduced.

## What current research establishes

Patterns are classified before borrowing them. Sources were retrieved7September2026; documented vendor journeys are not tested vendor accounts or measured Asym outcomes.

<!-- prettier-ignore -->
| Primary source | Documented behavior | Meaning for this decision |
| --- | --- | --- |
| [Church Center recurring donations](https://help.planningcenter.com/en/138387-recurring-donations.html), published3September2026 | Failure email links to payment/profile repair. The failed date is not automatically retried; a donor who wants to cover it makes a separate one-time gift. | **Durable pattern:** distinguish future repair from the earlier failed payment. **Useful precedent:** contextual navigation from failure. Asym's eligible Phase16 recovery must not be replaced by this vendor's new-gift workaround. |
| [Fundraise Up recurring plans](https://fundraiseup.com/docs/recurring-plans/) and [portal redesign](https://fundraiseup.com/docs/changelog/donor-portal-redesigned/) | Automatic recovery and donor edit/retry/resume controls coexist. Failure communication leads to payment repair. | **Useful precedent:** make related repair/recovery reachable. These docs do not establish that a donor method save immediately retries, and vendor restart semantics are not Asym authority. |
| [Givebutter recurring management](https://help.givebutter.com/en/articles/4529176-how-to-edit-and-manage-your-recurring-donation) and [ACH guide](https://help.givebutter.com/en/articles/4552121-how-to-accept-ach-payments) | Automatic retry behavior is documented, with differing timing across the general and ACH guides. | **Useful precedent:** source/rail-specific recovery explanation. No universal vendor schedule or method-save trigger is inferred. |
| [Netflix payment-problem guide](https://help.netflix.com/en/node/2065) | Payment repair, explicit retry/troubleshooting and automatic retries can coexist in a recovery journey. | **Useful precedent** for connecting related actions; access to a paid subscription is a different relationship from voluntary giving. No subscription-debt or access-pressure model is adopted. |
| [Stripe Smart Retries](https://docs.stripe.com/billing/revenue-recovery/smart-retries), [PaymentMethod update](https://docs.stripe.com/api/payment_methods/update), [invoice pay](https://docs.stripe.com/api/invoices/pay) | Method precedence, retry eligibility and explicit collection are different provider operations/conditions. | **Durable pattern:** source-qualified effects and truthful scheduled state. Reading these docs authorizes no provider operation; donor routes cannot bypass Phase16. |

No source proves that A produces a retention uplift or is always preferable. The recommendation is a product judgment for the failure-led visit: one optional contextual handoff removes navigation while preserving the completed repair and separate financial decision. The strongest alternative is B's quieter completion, not a deliberately disconnected or broken recovery product.

## Current Core ownership evidence

Live develop remains **7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd**. Exact current [Phase16 source](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md):

- **667–669:** payment method update never charges; an eligible exact scheduled-gift review/acceptance substitutes an existing slot rather than adding pressure.
- **677:** relevant line/cohort mutations/splits close the old indivisible recovery path. Method repair does not guarantee earlier-payment eligibility.
- **768–774:** ACH-specific exact-cohort review, one-use grant and qualified fallback.
- **2160:** recurring detail already exposes method update, eligible Try now and Stop retries together.
- **2169:** after apply, the same flow ends on a bookmarkable confirmation page.

Existing owner tickets were inspected, not rewritten:

- [#812](https://github.com/Asymmetric-al/core/issues/812), body29–30: reconciled method readiness and its own immutable confirmation.
- [#816](https://github.com/Asymmetric-al/core/issues/816), body27,32–33,67: save-only repair, no revival of terminal misses, owner-projected recovery eligibility. OPEN, `status:blocked`; native blockers empty despite body dependencies.
- [#818](https://github.com/Asymmetric-al/core/issues/818), body20–27,57,83–84: dedicated ACH proof/authorization. OPEN, `status:blocked`; native blockers empty despite body dependencies.

Those contracts settle recovery authority and completion. They do **not** explicitly mandate this optional contextual handoff from a completed repair result. The question therefore remains open at the correct presentation level. Existing future-replacement confirmation in R03 is retained.

The database implication is intentionally small: use the existing owner's durable command result plus current eligible next-action projection and exact source references. Do not save a separate portal Boolean such as missedGiftPayable, manufacture retry capacity, or add a second command system. Scoped deep links are navigation and require current authorization. The existing typed financial review supplies the actual money action and its idempotent outcome.

## Stripe verification boundary

The existing Stripe CLI1.50.5 fetched the current official pages above. Core's pinned integration remains SDK22.2.0/API**2026-05-27.dahlia**. A read-only refresh in the existing CLI default/test scope returned a standard US account with `charges_enabled=false`, `payouts_enabled=false`, `details_submitted=false`, empty capabilities and **zero connected accounts** (`has_more=false`). No live flag, credential output or financial mutation was used.

That scope cannot certify the connected-account recovery implementation. It does not prove production is disabled or that Stripe cannot support an action. This question chooses an optional source-qualified handoff; exact provider/account/mode contract tests remain owner implementation gates before it can be activated. No retry, invoice payment, new authorization or wallet modification was tested or performed.

## Brief adversarial check of Question05 ratification

### What could go wrong with this answer?

Ratification could be mistaken for release readiness. Keep Q05's explicit source/permission/document/migration proof gates.

### What hidden assumptions are we making?

The completed review did not select a default period or precise Recently changed control. Those remain labeled presentation recommendations.

### How does this affect the whole product?

Gift grouping still shares financial semantics with Mission Control and preserves the narrower donor projection and existing source owners.

### How does this affect the end-user experience?

The gift stays recognizable, important changes remain findable, and real documents/help stay connected without hidden money effects.

### Does this follow modern best practices?

The researched pattern and required accessible end-to-end proof remain sound; ratification adds no claim of measured donor outcomes.

### Does this fit Asym’s existing repo and product direction?

Yes. Source-correlation completion and retirement of conflicting legacy paths remain prerequisites rather than permission for a second ledger.

### Should we adjust the recommendation?

No new amendment is needed. Record Q05 as ratified and ask only the new Q06 presentation decision.

## Proof to require if A is selected

These are prospective checks, not tests run for Question06:

1. Failure-led visit → source-proved completed repair → optional exact eligible handoff → separate review → deliberate acceptance → source-confirmed result, preserving source IDs and current scope.
2. Choosing Done performs no additional financial/lifecycle/preference effect and does not silently alter an already authorized retry schedule.
3. Generic wallet maintenance does not solicit historical gifts; several R03 replacements do not produce a catch-up balance or preselected retry set.
4. Closed/terminal/split/in-flight/unknown/stopped/unauthorized cases omit an invalid action or explain the owning next state truthfully. Eligibility changing between display and acceptance safely rejects or refreshes.
5. Back/reload/auth return/two-tab races retain the existing durable repair result without repeating it. The handoff never becomes an access token or new financial authority.
6. Donors can explain that repair completed, the earlier gift has its own state, review does not charge, acceptance has a clear effect, and leaving remains valid. Verify mobile/keyboard/screen-reader behavior with exact Maia wrappers.

## Question to present

**Question06 — The next step after fixing payment details:** should a failure-led repair confirmation proactively offer the optional review of a related missed gift that is still eligible, or finish the repair and leave recovery available in recurring-gift detail?

Recommend **A — Offer a quiet optional next step**. **B — Finish the repair here** remains a valid quieter alternative. Await one founder answer; Q06 is not ratified by the prior Q05 acceptance.
