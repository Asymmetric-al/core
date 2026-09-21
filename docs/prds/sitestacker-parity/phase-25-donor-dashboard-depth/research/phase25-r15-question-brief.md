> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

> **Explicitly founder-ratified, 7 September 2026.** Conrad accepted Question15 A1–A4, J01–J12/C01–C22 and the reviewed Maia presentation defaults. Historical selected/proposed/unratified wording below is retained as evidence. Target implementation and real database/provider/accessible journey proof remain required; Q14 G01 remains unresolved.

> **Status update, 7 September 2026:** Conrad selected A. The complete Question15 adversarial review proposes A1–A4, J01–J12/C01–C22 and reviewed presentation defaults for ratification. Historical unanswered wording below is retained as evidence; corrected execution is not yet ratified.

# Question 15 — A helpful starting point when restarting giving

7 September 2026. Research and grooming only. **Q14 expanded direction and safeguards ratified; Q15 unanswered.** Q14's native identity-linking blocker G01 remains unresolved. Social activation is not implementation-ready.

## The one decision

When a donor starts giving again from a fully canceled recurring gift, should the form propose their previous amount and frequency, or use the ordinary current new-gift defaults?

**Recommend A: propose the previous amount and frequency as editable starting values when currently eligible.** Both options preserve the same eligible ministry context and enter the same canonical new-recurring-giving journey. Neither restores canceled authorization.

Ada previously gave **USD 75 monthly** to a ministry. She canceled months ago and now wants to give again. This is an illustrative situation, not a measured Asym support incident.

<!-- prettier-ignore -->
| Option | What Ada sees | Benefit | Tradeoff |
|---|---|---|---|
| **A — Previous values as editable suggestions. Recommended.** | Restart giving opens the current new-recurring-gift form with USD 75 and Monthly proposed, if still valid. A quiet note explains where those values came from. | Less repeated entry; the old gift provides useful context while Ada can change her budget or frequency. | Remembered values may influence her choice even when her circumstances changed. Clear editable fields and current review are essential. |
| **B — Ordinary current new-gift defaults.** | The same ministry and recurring intent remain selected. The form uses its normal current defaults/suggestions rather than her former financial inputs. Her previous gift may appear as a historical reference. | Encourages a fresh financial choice and avoids privileging an old budget. | Someone who wants to repeat their old gift must make or enter those choices again. |

B does not mean a blank form, lost ministry context, a one-time-gift detour, repeated profile entry or forced card re-entry. A does not mean one-click collection or copying every historical setting. The product judgment favoring A is reduced re-entry with explicit fresh confirmation; no researched source establishes a measured conversion advantage.

## The proposed experience

The historical gift offers **Restart giving** only when its owning service permits that action. The next view says **Start a new recurring gift**, with a short explanation: “We've used your previous amount and frequency as a starting point. You can change either.” Existing shadcn/Base UI components and Maia tokens provide the layout, fields, controls, focus and error treatment. Do not introduce a second theme, special restart wizard or new checkout stack.

The amount and frequency stay visibly editable. Ada reviews current schedule, optional end, payment method and fee choices through the existing new-giving journey. A final readable summary separates **Today**, **Next gift** and the continuing pattern. Change links preserve her other entries and return to review. This is a proposed presentation direction, not a frozen component tree or final copy specification.

**Important inherited financial behavior:** Phase 16 B4 requires an initial contribution attempt after final authorization submission, even when the continuing schedule starts later. Merely opening, editing or reviewing the form does not charge. The confirmation must disclose the initial amount, any multiple charges, and the future schedule. It must not suggest that choosing a future continuing date means nothing is collected today. This applies equally to A and B; Q15 is not silently changing that owner decision. [Phase 16 B4](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md#L454).

## What the current research establishes

- **Fundraise Up — Useful precedent:** a donor opens a canceled plan, chooses Reactivate, reviews renewal parameters and confirms. Its documentation does not identify which fields are prefilled or establish its internal authorization model. Adopt contextual entry and explicit confirmation, not an unsupported claim that it implements A exactly. [Canceled-plan renewal](https://fundraiseup.com/support/canceled-restart/).
- **LaunchPass — Useful precedent for B:** fully canceled subscribers return through the original community/current checkout context; current terms may differ. Its documentation distinguishes canceling from canceled. Do not import community access or approval workflows. [Restart guidance](https://help.launchpass.com/en/articles/5180395-how-to-renew-or-restart-a-canceled-subscription).
- **GOV.UK — Durable usability principles:** readable financial review, nearby change actions, preserved entries and an action-specific final button reduce ambiguity. Apply the behavior through Maia rather than importing another visual system. [Check answers](https://design-system.service.gov.uk/patterns/check-answers/).
- **Stripe — provider boundary:** clearing a scheduled cancellation differs from restarting a fully canceled subscription, which requires a new subscription. Creation can finalize a first invoice; a future billing anchor can introduce prorations under default configurations. Core must use its existing qualified planner and no-hidden-proration policy, not copy dates into a route-level Stripe call. Official pages were retrieved using the Stripe CLI. [Cancellation](https://docs.stripe.com/billing/subscriptions/cancel), [creation](https://docs.stripe.com/api/subscriptions/create), [billing anchors](https://docs.stripe.com/payments/checkout/billing-cycle?payment-ui=stripe-hosted).
- **Saved methods:** a currently qualified method may be offered in the canonical checkout. Its presence does not revive the canceled gift's authorization; fresh agreement must cover the new scope. Avoid unnecessary card re-entry without treating a stored credential as permission. [Stripe save-and-reuse](https://docs.stripe.com/payments/save-and-reuse?payment-ui=elements).

## Repository fit and dependency register

Current inspected develop: `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`.

<!-- prettier-ignore -->
| Evidence | Meaning |
|---|---|
| CONTEXT:1094; ADR-0001; ADR-0012; Phase 1 ownership matrix | Asym owns recurring intent and linked history; Stripe owns execution evidence. Fixed-total pledges are distinct. |
| Phase 16:595–601, 1838–1841 | Paused giving resumes its existing schedule. Fully canceled giving needs a fresh successor and authorization; the old record remains unchanged. Pending cancellation is not proved stopped. |
| Phase 16:397–417, 1054–1083, 2139–2169 | Current cadence/destination eligibility, exact Party/entity/account/currency authority and explicit financial review govern new giving. Old grandfathered availability is not new-gift eligibility. |
| Q09 and active donation-lifecycle OpenSpec | Focused editing concerns an existing arrangement; it does not revive canceled authorization. The active specification is intended contract evidence, not proof of live behavior. |
| [Issue 813](https://github.com/Asymmetric-al/core/issues/813), read live | OPEN and explicitly blocked/undispatched. It permits safe non-authoritative presentation prefill but does not choose this default. Its body names #800/#809/#811, all OPEN; native blocked_by currently returns zero edges. Preserve the body dependencies and later reconcile the graph. |
| Current donor pledges and portal billing service | A generic Billing Portal redirect exists, not the target source-owned restart journey. It is a **Temporary bridge**. Mutable legacy fields are not a design authority. |
| Stripe pins | SDK 22.2.0 and API 2026-05-27.dahlia verified. Latest documentation is not an automatic upgrade or proof of exact connected-account capabilities. |

Fresh scoped authorization, immutable canceled history and one shared creation path are **Durable patterns**. Prefilling known eligible values is a **Useful precedent/product judgment**. Copying old mutable lifecycle fields is an **Implementation accident**. Reusing canceled authorization or creating another executor while the old stop is unknown is a **Conflict with first principles**.

## Boundaries to preserve in either option

1. Retain only currently authorized ministry context. A closed, restricted or changed destination is explained; never silently substitute another fund or expose a restricted worker.
2. Preserve exact currency and minor units. No historical number may be silently converted or reinterpreted. Propose amount/frequency only when currently permitted.
3. Do not copy past dates, expired end limits, fee elections, payment defaults, canceled mandates, recovery budgets, attribution or communication consent. New terms follow the current owner flow and visible review.
4. Do not include sibling gifts merely because they shared an old payment. Current source-qualified scope determines the proposal.
5. Paused, cancellation-pending, ended-as-scheduled and completed fixed pledges retain their distinct meanings. Q15's example and choice concern fully canceled recurring giving.
6. Old submitted payments may still resolve. Source checks must prevent unsafe overlap; a new form cannot bypass a provider-control fence.
7. Double taps and unknown responses resolve the same durable operation. Do not charge twice or infer that two intentionally separate gifts are duplicates from amount/ministry similarity alone.
8. Q13's applicable receipt preference persists; starting again does not reset consent or generate historical receipts. New commitment/initial-payment notices retain their own classification.

After the founder chooses, the adversarial review will qualify the exact proposal allowlist, current schedule presentation, unavailable cases, fresh authorization, retries, history and accessible donor journey. No Q15 answer or final execution requirements are presumed here.

## Evidence limits and coverage

This turn completed source, current GitHub-body and official provider/product documentation research. No application, browser, PostgreSQL authorization/concurrency or provider financial test ran. Exact connected-account capability remains unverified. No runtime code, canonical ADR/OpenSpec, GitHub issue or provider configuration changed. Historical proof bundles and the five existing setup-change paths remain preserved.

Q14 is ratified as product direction while G01 remains unresolved. Q15 remains unanswered. Wallet/default behavior and remaining coverage stay in the grooming register; the phase is not ready for formal specification or publication merely because this next question is well researched.
