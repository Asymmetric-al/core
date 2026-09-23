> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

> **Explicitly founder-ratified, 7 September 2026.** Conrad accepted Q16 A1–A5/J01–J12/V1–V8/C01–C22 and24h/10day pending-preference limits. Historical proposal wording below is retained as evidence. ACH presentation is additionally strengthened to feel confidently complete after proved submission, while Processing, remaining actions, received money and future activation remain truthful and distinct. Target proof and Q14 G01 remain open.

# Question 16 — Add a payment method with an optional new-gift preference

7 September 2026. **Disposition: Accept with required amendments.** Conrad selected A. The corrected A1–A5, J01–J12, C01–C22 and reviewed Maia presentation defaults below await ratification. This is a completed grooming review, not a formal specification, implementation authorization or release certificate. Q01–Q15 remain ratified. Q14 G01 remains unresolved.

## The recommendation in plain language

Keep one optional, initially unchecked choice in standalone **Add payment method**:

> **Prefer this method for new gifts**
>
> We'll select it first from your saved methods when it's available. Existing recurring gifts keep their current payment methods.

The preference belongs to Asym and helps choose the starting payment method in a later new checkout. Stripe continues to collect payment details and perform required verification. Saving, preference, payment authorization and recurring bindings remain separate facts. A donor can finish both related intentions in one flow without creating a new checkout service, financial default or complicated wizard.

The strongest alternative, B, saves the method first and asks the donor to choose the preference afterward in Wallet. It has simpler sequential results. A better preserves a donor's stated intent, especially when verification is delayed, provided the small owner contract below preserves that intent safely. This is a product judgment; a checkbox-plus-save may take the same clicks as save-plus-preference. No measured conversion improvement is claimed.

## Material amendments to ratify — A1–A5

### A1 — One Asym-owned preference, scoped to this person's giving context

The Phase 13 giving/checkout owner owns **preferred saved method for new gifts**. Phase 25 presents it. Stripe owns saved-method and execution evidence; Phase 16 owns credential identity, collection authority and recurring use. Explicitly amend the active OpenSpec phrase grouping set-default under Stripe-managed flows: collection remains provider-managed, while this preference is a source-owned selection convenience. It makes **zero Customer/subscription default, source, invoice, retry, recurring-binding, detach or lifecycle calls**.

The exact preference scope is stable acting principal + giving Party + Tenant + Legal Entity + the qualified Settlement Account Binding/account/mode/provider-Customer context. The scope is resolved through existing authority, not copied from caller assertions. This is personal to the actor within that giving context: one treasurer does not change another treasurer's starting choice. Actual financial-authorizer rights are independently proved whenever a method is saved or used. Common self-giving asks no extra identity question; represented copy says **When you give for [Party] to [organization]**.

Site, locale, currency and rail are not additional preference dimensions. The same qualified wallet context works across Sites; a transaction's currency, purpose and rail still determine eligibility. Different accounts, issuers, Parties or Tenants do not silently share a choice. Do not maintain a global flag in Stripe or generic `donors.giving_preferences` JSON.

**First-save access:** standalone Add requires no previous gift, recurring agreement or recurring authorization lineage. P4/P9 resolve or create a legitimate personal or explicitly represented Party through existing identity authority; the P13 setup owner idempotently resolves or creates the normal exact Customer binding under current setup/saving authority. This creates no historical claim, household permission or collection mandate. Add a narrow P9 A11 lookup clarification: standalone methods may use qualified P13 setup/attachment evidence; existing-recurring reads still require their P16 authorization/control evidence. Missing identity scope uses the existing identity-completion route, never a forced donation or guessed donor. Normal first Customer creation is distinct from creating duplicate Customers to work around billing/default constraints.

### A2 — Explicit preference; no automatic first/last-method promotion

The Add checkbox starts unchecked for every new standalone task, including the first or only method. Off means **save only**; it does not clear an existing preference or withdraw a separate pending request. On explicitly requests the new preference as part of this Add submission. A normal wallet action remains available for existing eligible methods, including deliberately clearing the preference.

At a new checkout: an explicit transaction choice wins; otherwise a valid standing preference may be preselected. With no preference, one eligible saved method may be visibly proposed for that transaction only; with several, the donor chooses. Neither creates standing preference truth. If the stored preference is temporarily unavailable, retain it, explain relevant unavailability and require an explicit alternate choice. Never promote another method or authorize backup charging. A method choice inside checkout, including an Express wallet choice, changes that transaction only. The explicitly named Wallet Set Preferred action changes the standing preference.

### A3 — Retain a bounded checked request through verification; newer intent wins

Keep the explicit preference request within the existing setup/operation preparation. A verified saved method becomes preferred only after current setup, redisplay/use eligibility, scope and actor authority pass. Until then the former confirmed preference remains. Show **Preference pending verification** and allow **Don't make this preferred**, which withdraws only that pending preference—not method saving, verification, recurring giving or an already completed change.

Use server-accepted intent order, not browser timestamps or webhook arrival. Set/reaffirm/Clear must validate the expected current intent revision; a late stale tab cannot become latest merely by arriving later. Report the conflict and require a deliberate refreshed preference request, while independently valid method setup can still complete. A newly accepted explicit preference request supersedes older pending requests immediately, even if its method is not ready. Reaffirming the same current method counts as new intent. Failed, withdrawn, expired or superseded requests never resurrect older pending choices. A method can still finish saving after its preference request expires; offer the ordinary preference action afterward.

**Proposed product waiting limits:** ordinarily **24 elapsed hours** from accepted Add/preference intent. A positively identified supported U.S. bank microdeposit flow may use **10 elapsed days from that same instant**, only if the owner durably classifies it before the ordinary window expires. No refresh, resend or late classification restarts a clock or revives an expired request. Earlier definitive setup failure, cancellation, expiry, revocation or removal ends applicability. Temporary readiness/provider uncertainty holds application within the original deadline; it does not erase intent or restart its clock. A transaction-specific currency incompatibility likewise does not erase a standing preference. These are conservative product limits for ratification, not claims about a generic Stripe token lifetime. There is no new Tenant-configurable timer.

Stripe SetupIntent has no general `expires_at`, and microdeposit `arrival_date` is not an expiry. Its current documentation describes a ten-day verification timeout without supplying a universal expiry field. Do not fabricate provider timestamps. These preference windows confer no financial authority and do not extend Phase 16's separate 15-minute financial preview/challenge.

### A4 — Honor the choice through one supported shared checkout

Use an Asym-controlled **masked saved-method selection** in the canonical checkout. Preselect the eligible preference there. Preserve Phase 13's **Express Checkout first** behavior; a donor can deliberately choose its wallet, another saved method or a new method. Payment Element collects new details and supplies required provider-native verification. All branches reach the same current fee/amount/scope validation, financial review, authorization, idempotent operation and source-confirmed result.

Stripe's supported existing-method APIs accept a server-resolved PaymentMethod at confirmation. Thus this is a real supported integration, not a promise that a local setting can reorder Payment Element. Do not use Customer billing defaults, consent filters, detach/reattach, DOM hacks or duplicate payment handlers to mimic preference. Where Asym owns saved selection, do not simultaneously present a conflicting native saved-method picker in the ordinary new-method branch.

For a new recurring arrangement, the selected method enters Phase 16's existing exact initial-payment/executor branch. It never creates another PaymentIntent beside an invoice-owned initial payment. Choosing a preference never bypasses new recurring consent, CVC/3DS, bank mandate, eligibility or exact fee review.

### A5 — Save and preference have separate truthful results and purposes

Standalone Add uses a scope-bound SetupIntent and provider-hosted fields, with explicit **on_session** usage for its donor-present future-checkout purpose. Stripe describes usage as an optimization, not an authorization boundary. Saving/redisplay consent is separate from the optional preference; neither permits unattended collection. Later recurring use must obtain its own applicable Phase 16 agreement and qualification.

A successful save is not rolled back, detached or repeated because the preference failed. A lost response is **Checking**, not automatically Failed. Recover the exact original operation; retry only the unresolved currently authorized part. No donation or receipt is created by Add/preference. Required bank setup, mandate-copy and verification messages remain with their qualified owner/provider contracts; there is no extra preference-change email, marketing enrollment or routine staff task. Q13's receipt-email choice cannot suppress independently required setup messages.

A1's ownership/scope, A2's exact defaults, A3's deferred intent and clocks, A4's shared checkout adoption and A5's purpose/result rules are explicit execution refinements. They preserve A but are not silently treated as previously ratified.

## Adversarial check

### What could go wrong with this answer?

A checkbox could change Stripe billing defaults and redirect existing collection; a bank verified days later could overwrite a newer card choice; a saved method could be labeled ready/preferred too soon; or a local badge could promise a checkout selection the provider widget cannot honor. The corrected design addresses these real mechanisms without claiming a hosted incident occurred.

### What hidden assumptions are we making?

We have no measured Asym usability result for this composition. Saved, redisplay-eligible, usable, preferred and authorized to charge are different facts. A masked method belongs to an exact account/Party context; matching last four digits proves none of that. Current wallet code and modern documentation do not prove a configured end-to-end feature.

### How does this affect the whole product?

P13 owns one new-checkout selection preference; P16 retains recurring and credential truth; identity owners retain current actor/Party rights. Mission Control remains read-only for donor payment-instrument presentation unless another owner grants a separate action. Missionaries receive no payment preference or verification detail. Public giving and Donor Portal share checkout logic without mixing responsibilities. No impact, newsletter, document, campaign or Field Account feature is added.

### How does this affect the end-user experience?

Most donors see a hosted form, one checkbox and a clear saved result. Verification and partial-result details appear only when relevant. Their choice survives the expected bank step, valid edits survive return/errors, and later changes win. No extra financial confirmation is needed merely for this reversible selection preference; actual gifts retain their full review.

### Does this follow modern best practices?

Yes: explicit optional intent, predictable field behavior, protected financial data, clear results and current eligibility. PayPal is useful evidence for separating preference from automatic payments; Church Center demonstrates saved-unverified versus usable. Accessibility guidance supports semantics and status, not a claim that one exact layout universally converts better.

### Does this fit Asym’s existing repo and product direction?

Yes with A1's explicit OpenSpec owner refinement and completion of the existing shared checkout/setup foundations. It does not fit the current local wallet state, raw-field prototype, generic JSON settings writer or provider-global default shortcut. ADR-0001 and the existing API boundary favor a single authoritative owner and approved projections.

### Should we adjust the recommendation?

Keep A. Adopt the precise defaults, actor scope, bounded pending request and supported checkout selection. Use B's direct preference action after expiry, withdrawal or conflict, rather than routinely making donors repeat a still-valid choice. Do not build a separate wallet service or deferred workflow product.

## What was verified and how patterns are classified

Inspected develop: `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. Source/ADRs/OpenSpec, actual issue bodies, official docs and installed types were read. **Repository intent**, **implemented behavior**, **provider capability**, **product judgment** and **live proof** remain distinct.

Pinned owner references: [P9 A11](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md#L448), [P13 giving](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md), [P16 credential/authorization separation](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md#L1478), [active wallet requirement](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/openspec/changes/add-donor-self-service/specs/donation-lifecycle/spec.md#L139).

<!-- prettier-ignore -->
| Evidence | Classification / application |
|---|---|
| [ADR-0001](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md), P9 A11, P13/P16 and Q03 | **Durable pattern:** Asym owns its preference; Stripe owns saved-method evidence; exact collection authority is separate. Saving/default/Replace/Remove are distinct effects. |
| Shared base-maia/Base UI, current Field/Checkbox/Card/Button | **Durable pattern:** exact existing visual system and shared ownership. Component availability does not prove the composed flow accessible. |
| [PayPal preferred-method guide](https://www.paypal.com/us/cshelp/article/how-do-i-set-a-card-as-a-preferred-payment-method-help821) | **Useful precedent:** setting preference separately from automatic payments; it documents B's sequential action, not A's checkbox. |
| [Church Center bank verification](https://help.planningcenter.com/en/138395-bank-transfer-donations.html) | **Useful precedent:** a saved unverified bank is not yet usable. Its fees/country limits/timelines are not Asym policy. |
| [Blackbaud discussion](https://community.blackbaud.com/discussion/comment/270287/) | **Historical problem evidence:** wallet/recurring confusion, followed by a2024 enhancement. Do not present the earlier limitation as current. |
| [Amazon Pay wallet article](https://pay.amazon.com/blog/for-shoppers/how-to-manage-your-amazon-wallet) | **Dated useful precedent:** explicit Add versus default action; not a verified2026 interface or authority for automatic backup charging. |
| Current Billing Portal entry | **Temporary bridge:** not the adopted custom donor preference owner. |
| Current first-method auto-default, local Set Default, fabricated metadata and raw fields | **Implementation accidents:** not saved state, explicit consent or proper method collection. |
| Customer default used as a “new gifts only” preference; redisplay flags changed to sort methods | **Conflict with first principles:** changes the wrong authoritative fact and may affect existing consumers or consent. |

### The provider integration is resolved at the API level

Current pins: Node Stripe **22.2.0**, API **2026-05-27.dahlia**; installed Stripe.js **9.8.0**. No upgrade is required merely for this feature. Official Stripe pages were retrieved through Stripe CLI; examples remain subordinate to Core's exact scopes and owning commands.

1. **Saved method:** Stripe documents a server-confirmed PaymentIntent using an existing `payment_method`, then `handleNextAction` if required. Installed types support this. Stripe.js also supports `confirmParams.payment_method`, mutually exclusive with `elements`; Core uses its server validation/confirmation boundary rather than an ungoverned client payment call. [Existing-method flow](https://docs.stripe.com/payments/existing-customers?platform=web&ui=direct-api), [confirmation reference](https://docs.stripe.com/js/payment_intents/confirm_payment).
2. **New method and Express wallet:** supported ConfirmationToken paths allow server validation before confirmation. Both feed the same financial finalizer and exact fee review. A method-driven total change needs the owner's refreshed authorization, not a stale wallet-approved amount. [Server confirmation](https://docs.stripe.com/payments/finalize-payments-on-the-server?platform=web&type=payment), [Express Checkout](https://docs.stripe.com/elements/express-checkout-element/accept-a-payment?payment-ui=elements).
3. **Widget limitation:** Payment Element has no documented exact saved-PaymentMethod default field. `paymentMethodOrder` orders method types; CustomerSession redisplay filters are consent classes. Its saved-method ordering may prioritize Customer default/newest methods. Use A4's masked selector, not billing/consent manipulation. [Saved-method display](https://docs.stripe.com/payments/save-customer-payment-methods).
4. **Existing billing:** Customer defaults may supply subscription fallback and retry method selection. Legacy Customer `source` updates have a specific retry side effect; do not inaccurately claim every default-field edit immediately charges. Q16 writes none of those fields. [Retry precedence](https://docs.stripe.com/billing/revenue-recovery/smart-retries), [Customer update](https://docs.stripe.com/api/customers/update).
5. **Standalone setup:** create the exact scoped SetupIntent before mounting collection when qualified U.S. bank microdeposit fallback is required. The generic deferred-intent setup guide suppresses that fallback; choosing it for convenience would remove a real donor path. Preserve provider-hosted CVC/3DS/bank verification, clear saving/redisplay purpose and required communications. [SetupIntents](https://docs.stripe.com/payments/setup-intents), [save and reuse](https://docs.stripe.com/payments/save-and-reuse?payment-ui=elements), [ACH setup](https://docs.stripe.com/payments/ach-direct-debit/set-up-payment?payment-ui=elements).

**Concrete CVC handoff:** when recollection is required, temporarily replace the ordinary Asym saved-method region with Payment Element and a scoped CustomerSession, required card CVC recollection enabled, native removal disabled and genuine redisplay consent preserved. Keep the chosen card's safe identity as context, but do not promise native preselection; the donor may need to select it within the provider verification UI. Do not display two conflicting active pickers. Route the supported ConfirmationToken/CVC token and server-resolved selected-method proposal through the same finalizer; validate the actual method and current quote before the financial effect. ConfirmationToken has a payment-method preview, not a generic exact saved-method ID field: never invent that field or identify a card by its mask. A deliberately different method requires current review rather than silent substitution. Resume the normal shared flow after verification; no raw CVC collector or disabled risk rule. [Stripe CVC-token support](https://docs.stripe.com/changelog/acacia/2024-09-30/support-payment-method-options-confirmation).

Installed Stripe.js `payment.d.ts:312–346` exposes the optional selected saved-method ID in the Payment Element change event. Treat it only as the donor's proposed selection; the server re-resolves actual scope/eligibility and provider result. A browser event or token preview is not authority, successful verification or proof of a posted gift.

An express-wallet card is not necessarily the same credential as the organization-saved card with similar display metadata. Provider verification and explicit wallet choice do not rewrite the standing preference.

### Current code and evidence limits

- `wallet/page-client.tsx:1255,1370–1394` uses MOCK_METHODS/local state, guesses metadata and marks the first local method default. Its remove/transfer handlers also operate locally. None is target persistence.
- `packages/api/src/donor-portal/settings-patch.ts:16` permits arbitrary `givingPreferences`; `index.ts:121–122` writes that JSON. It is not a qualified preference command. Never read a payment-method preference from it as authority or automatically migrate arbitrary values.
- Public `checkout-client.tsx:22,905,1704–1729` still uses CardElement/confirmCardPayment; `checkout-donation.ts:113–122` coerces recurring input to one-time. Complete the intended P13/P16 Payment Element/Express/shared-owner work; do not add a separate Q16 payment path or remove a guard and pretend the missing owner exists.
- P16's credential, setup/preparation and typed command targets remain forward work. The new personal preference head and setup-bound intent contract are also not implemented.
- Read-only shadcn docs and actual shared Checkbox/Field/Card/Button were inspected. The real Checkbox needs an associated label/hit area; CardTitle is a div, not inherently a heading. No add/init/update UI command changed the repository.
- Installed Stripe types and current docs establish the supported API strategy. No new financial/account call, database/concurrency test or rendered donor journey ran. The earlier Q15 **36 pure/mock tests were not rerun or counted as Q16 proof**. No artificial test was added to mirror recommendations. Earlier sanitized account snapshots lack exact connected-account qualification and are not fresh live evidence.

## Mapped journey — J01–J12

<!-- prettier-ignore -->
| Step | Donor experience | Exact behavior |
|---|---|---|
| **J01 — Open the correct Wallet** | Add payment method in the current organization; represented context is clear only when relevant. | Resolve current actor/Party/account scope before protected details. No cross-context flash, extra personal-role question or inference from email. |
| **J02 — See one optional choice** | Provider-hosted collection plus an initially unchecked Prefer this method for new gifts checkbox. | Outside hosted fields, before the final Add action. It is a proposed preference only; opening/focus/checking does not create a financial effect or write preference. |
| **J03 — Choose save-only or prefer** | Check if wanted; otherwise simply save. | Encode false/absent correctly as no preference request, never clear or opt-in. Preserve same-task intent across valid errors/redirects; a fresh task starts unchecked. |
| **J04 — Complete secure setup** | Current hosted card/bank fields, required authentication and relevant verification instructions. | One durable scoped setup operation; minimal provider-required information. Saving/redisplay consent is distinct from preference and recurring debit authorization. |
| **J05 — Save without preference** | Payment method saved, or saved with Bank verification needed. | Existing current/pending preference is untouched. First/only-method saving creates no Preferred badge/event. |
| **J06 — Save and prefer when ready** | Payment method saved and Preferred for new gifts when both are confirmed. | Current method/scope/authority and latest intent checked; only P13 preference changes. Successful saving and preference are independently durable. |
| **J07 — Wait for bank verification** | Bank verification needed; Preference pending verification; former choice remains for now. | Retain exact bounded request under A3 and show its actual expiry, clearly labelled as the preference-request deadline. Explain that expiry stops automatic preference application, not later valid bank verification/save or manual preference. Separately show any genuinely known provider deadline/action. Required provider/owner messages remain qualified; no preference marketing email. |
| **J08 — Change mind or finish later** | Don't make this preferred withdraws the pending choice; verification can continue. | Newer accepted intent wins, including reaffirming an existing choice. Expiry/supersession does not remove the method or revive an older pending request. |
| **J09 — Recover partial/unknown results** | Saved, but preference not updated; or Checking your preference. | Read the original operation; never re-add/detach to fake atomicity. A newer choice is preserved. Historical result and today's current preference are separate reads. |
| **J10 — Return to Wallet** | Quiet masked method row, accurate verification status and Preferred for new gifts only when confirmed. | Normal standalone preference/clear actions stay available. Do not collapse different credentials by last four or expose another actor's choices. |
| **J11 — Start a new gift** | Eligible preference starts selected among saved methods; Express Checkout remains available; Change is easy. | Current explicit transaction choice wins. Every branch gets current eligibility, exact fee/money review and actual financial authorization; no standing preference rewrite. |
| **J12 — Handle later unavailability/removal** | Clear current choices or Add when none are usable. | Temporary ineligibility retains preference without selecting it; proven removal clears only matching references. No replacement promotion, backup charge or automatic recurring repair. |

This is a logical map, not twelve pages. The normal case remains one Add surface and its result.

## Reviewed content and Maia presentation defaults — V1–V8

**V1 — One coherent surface.** Reuse the canonical provider-setup shell, shared base-maia/Base UI and Zinc-oriented semantic tokens. One column, clear title, normal whitespace, one primary action. No card carousel, oversized decorative card, nested modal stack, fee-saving upsell or app-local component fork.

**V2 — Small explicit control.** Use Field + Checkbox with a persistent label and short description. A checkbox matches an optional part of a Save submission; it does not falsely imply an immediate preference update. It starts false and never needs a third/indeterminate state. Do not auto-submit or move focus when checked. The [WAI checkbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/) informs keyboard/name/state behavior; [switch guidance](https://www.w3.org/WAI/ARIA/apg/patterns/switch/) does not prohibit switches universally, but this flow's semantics favor a checkbox.

**V3 — Say precisely what changes.** Label Prefer this method for new gifts. Description distinguishes saved selection from existing recurring methods. Keep actual organization/represented context visible without raw account IDs. Do not label the method merely Default, and do not promise priority inside Apple Pay/Google Pay/Link or every provider widget.

**V4 — Truthful action labels.** Save payment method when that is the effect; a step that starts verification must say so. A checked preference can be described within this submission without an extra confirmation modal. No Donate/Pay/Replace all label. Provider verification may involve a temporary authorization or microdeposit; do not promise that no verification activity can occur, but no donation or missed-gift retry is initiated here.

**V5 — Conditional detail, durable result.** Normal checked success: Payment method saved + Preferred for new gifts. Pending bank: Bank verification needed + Preference pending verification, with a concise explanation and withdrawal. Show **We'll remember this preference request until [date/time]. After that, you can still verify the method and choose it in Wallet.** Format the absolute deadline accessibly with an unambiguous timezone where needed; it is not a bank-verification expiry unless provider evidence separately proves that. If no prior preference exists, say It isn't preferred yet rather than inventing an old choice. Unknown result says Checking, not Failed. Persistent result content is primary; toast is supplementary. Immediate-success Add needs no clock explanation.

**V6 — Accessible composition.** Associate label, description and error; give the checkbox/label the shared comfortable hit area, not just its small glyph. Use real headings and appropriate status announcements; do not alert on every keystroke/poll. Support keyboard, screen readers, paste/autofill where safe,320 CSS px reflow,200% text/400% zoom, long translations/RTL, reduced motion and hosted-iframe focus. Sticky controls cannot obscure fields or the software keyboard. [Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), [focus visibility](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html).

**V7 — Preserve work without creating a draft product.** Retain safe boolean/context in the bounded setup process through errors and provider return. Clear private state on actor/Party/context change. Background refetch cannot reset the checkbox or a checkout method already deliberately chosen. Reauthentication resumes authorized existing work; it does not repeat setup automatically or transfer a session.

**V8 — Quiet ongoing Wallet.** Display safe brand/type/last four and only relevant readiness/preference state. Distinguish unavailable from removed and pending from confirmed. Wrap distinguishing text instead of making it hover-only. No routine preference email, staff task, missionary alert, confetti, retention prompt or extra receipt. Required setup/mandate/verification communications are different and remain intact.

## Minimal permanent owner and database design

This is the proposed source contract to record, not a migration or a claim that its schema already exists.

### One head, existing operation history, no second wallet

Use one typed **new-gift preference head** in the P13 giving/checkout owner per A1 scope. It points to zero or one currently effective method and zero or one latest preference intent, with:

- a server-generated identity and non-null, structurally qualified scope;
- `row_revision` for every head mutation;
- `intent_revision` for explicit preference intent ordering; and
- current method/reference plus latest intent/reference and owner timestamps.

The target method is an exact source-scoped saved-method reference, not a bare `pm_` string, `payment_credential_lineage` masquerading as permission, or duplicate card vault. Credential readiness/redisplay remains source/provider evidence. Keep request/acceptance/result and exact setup correlation in the already-required bounded payment-setup/command facilities, extending their finite kind/target schemas where necessary. No fake recurring group primary, generic user-settings JSON, independent copy per app or new universal workflow journal.

Preference stores no amount, currency balance, schedule, card number, bank details, billing address or mandate content. Currency/rail eligibility is calculated at use. Source/audit records contain only scope, reference, selected effect, revision, reason and actor evidence needed to explain a result. It is a nonfinancial preference: apply the existing privacy/operational-audit retention policy, not an automatic seven-year money-record rule. Financial/authorization evidence retains its own owning retention.

### Precise concurrency and cleanup

<!-- prettier-ignore -->
| Event | Required head/intent effect |
|---|---|
| New explicit checked preference request | Under owner lock, accept a new intent revision and supersede older pending intent. Retain current effective method until the new request qualifies. |
| Method becomes ready | Compare exact latest intent ID/revision, deadline, current actor/scope and current method evidence; then set effective preference atomically with the command result. Do not compare only a nullable method pointer or arrival time. |
| Reaffirm current method / explicit Clear | New intent revision even if the visible value is unchanged; older pending work cannot later overwrite it. Clear does not detach. |
| Withdraw pending request | Compare the current latest pending intent identity/revision and cancel only that intent; advance its intent order, preserve effective method and setup. Stale withdrawal of B cannot advance or cancel later C. An already applied request needs an ordinary new preference action. |
| Remove current preferred A while pending B is valid | After exact owner removal proof, clear A and increment row revision only; B's distinct current intent remains eligible. Its readiness check must not rely on an obsolete whole-row revision. |
| Remove pending B | End and advance intent order only if B is still the current matching pending request. Stale removal of B cannot cancel or advance C's intent. Older pending requests never reactivate. |
| Late removal of previously effective A after C became effective | Clear only a still-matching A reference; C remains unchanged. |
| Temporary method ineligibility | Retain preference intent/reference, but do not select it for the incompatible checkout. Require a current alternate choice. |
| Save-only Add | No preference-head effect. It neither supersedes another pending preference nor creates explicit consent from being first/last. |

The two revisions distinguish donor intent from housekeeping. They prevent a late bank event from undoing a newer choice without making unrelated method cleanup erase a valid pending choice. They are not a generalized event-sourcing framework. Accepted ordering is server-defined; stale simultaneous requests conflict/recover rather than last-write-wins by arrival. Exact request replay returns its original result; new intent requires a deliberate new operation.

### Structural and authorization requirements

Composite unique/FK constraints bind head, intent, setup and saved reference to the exact Tenant/entity/account/mode/Customer/Party context. A1 scope is immutable under ordinary updates. The existing governed same-real-world-Party canonical-reference repair remains possible with provenance preserved; it cannot transfer another person's choice or resolve conflicting preferences by guessing. Scope switches and true owner/account changes require current qualified context, not silent rebinding.

Use deny-by-default grants and protected server commands for head/intent writes. Approved projections expose only the actor's current scope. Inspect effective RLS, views, RPC execution/search_path, Storage/Realtime and privileged bypass paths; possession of a source ID or provider Customer is not permission. USING and WITH CHECK govern old/resulting row restrictions; PostgreSQL can inherit USING when WITH CHECK is omitted, so audit actual behavior instead of declaring a literal omission automatically unsafe. [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html).

Serialize preference intents, saved-method removal/revocation, authority invalidation and setup readiness through the same owner fences and canonical lock order. Unique constraints plus revision-qualified writes handle the head; cross-row eligibility requires current transactional validation, not a mutable cross-table CHECK. Provider calls stay outside database transactions behind durable setup operations. Immutable accepted request/result history is not changed by a later current preference. [PostgreSQL transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html).

The separate removal owner's complete reference inventory includes all matching preference heads and pending intents, including other authorized actors' references to the same provider method. After proved removal, server-private targeted cleanup clears only still-matching references under the shared admission/lock rules; it does not disclose other people's preferences or counts. A personal preference command cannot manage another actor's choice. Existing recurring/in-flight use checks still govern whether removal itself is allowed; this cleanup adds no removal permission or replacement wizard.

## Lifecycle and failure contract

The preference request has a small closed outcome set: **awaiting setup/readiness, applied, superseded, withdrawn, expired, rejected/failed**; transport uncertainty is **being reconciled**, not a guessed new terminal business state. Setup owns its own provider states. A saved method can exist while its preference is pending, expired or failed.

Authoritative readiness events and scheduled owner reconciliation may advance a still-valid accepted preference. Read-only GET/status, page prefetch and link scanners do not accept or apply new preference intent. A provider return is untrusted input; re-read the exact source/provider state. If provider redirects carry required transient secret parameters, consume through the qualified callback and remove them before ordinary navigation/logging; do not pretend those provider parameters never exist.

Partial outcomes retain useful success. A saved method is never automatically detached because preference failed. Unknown setup uses the same operation; unknown preference reads its exact result/head. No new idempotency key just because a response was lost. Refresh may display a historical completed result plus today's separately current preference without rewriting history.

Expiry of the pending preference cannot prevent later valid bank verification or ordinary explicit preference setting. Conversely, later verification cannot resurrect expired intent or use an expired financial challenge. Optional preference withdrawal is not bank cancellation, donor cancellation or rollback of a completed command.

## Category review — C01–C22

Likelihood is conditional exposure without the stated controls, not a measured incident rate. Every category was reviewed independently. Exact proposed requirement language follows each concern.

### C01 — Problem validity, necessity and alternatives

**Material concern: Yes. Severity: Moderate. Likelihood: ordinary donor variation.** Adding a choice can clutter a simple task; automatic defaults can solve the wrong problem. PayPal supports the credible separate-action B, while no study proves A's superiority. This **narrows A** to one optional related intention rather than a new wallet product.

**Permanent prevention / exact requirement:** “Offer one initially unchecked new-gift preference choice within standalone Add and retain the normal separate wallet action. Saving alone remains useful. Do not claim fixed click reduction or measured conversion benefit, and do not add unrelated recurring migration, marketing or personalization steps.”

### C02 — Brittleness

**Material concern: Yes. Severity: High for broken promises; Moderate for delay. Likelihood: ordinary provider/readiness changes.** A local preferred flag cannot control native saved-method order; method eligibility and bank completion can change after entry. Pinned types and current provider docs expose this gap. This **requires A3/A4**, not a label-only implementation.

**Permanent prevention / exact requirement:** “Honor the preference through the supported Asym saved-method choice and current owner confirmation. Separate saved, redisplay-eligible, usable and preferred states. Revalidate current scope/method/intent at application and checkout; never rely on provider list order, a callback boolean or an obsolete readiness snapshot.”

### C03 — Technical debt

**Material concern: Yes. Severity: High. Likelihood: likely if prototypes are extended.** The current wallet is local state, generic givingPreferences accepts arbitrary JSON, and the public checkout has older payment collection. Reusing those as authority creates duplicate unsafe paths. This **changes the implementation foundation**, not A's user goal.

**Permanent prevention / exact requirement:** “Use one P13 preference head and the existing typed setup/command facilities, consumed through approved projections and shared UI. Do not add payment preference to generic donor JSON, app-local Stripe handlers, a copied wallet database or optimistic browser authority. Complete and adopt the shared intended checkout; remove incompatible prototype paths.”

### C04 — Edge cases

**Material concern: Yes. Severity: Moderate/High. Likelihood: common for bank and multi-context users.** First/only method, absent preference, pending bank, two cards with equal masks, account switch, removal, expiry and saved-but-preference-failed cases produce misleading states without explicit rules. This **requires J01–J12/A2/A3**.

**Permanent prevention / exact requirement:** “Exercise first/only/multiple methods, no current choice, same masks, pending/failed setup, exact represented contexts, unavailable/removed preference and delayed completion. Off never clears another preference. Preserve saved success independently; require current explicit choice where a requested preference no longer qualifies.”

### C05 — Footguns

**Material concern: Yes. Severity: Critical if financial defaults are touched. Likelihood: plausible with generic provider samples.** Customer source/default edits, native removal, save-default settings and raw-card demos can initiate wrong effects. Provider docs show existing billing consumers; prototype handlers are not real safeguards. This **requires a strict zero-financial-effect preference command**.

**Permanent prevention / exact requirement:** “Preference writes make no Customer/source/subscription default, invoice/payment, retry, detach, recurring-binding, fee or lifecycle call. Checkbox changes are local intent until explicit submission. Setup uses hosted fields and its qualified non-donation purpose. No saved-method or preference action authorizes backup charging or a missed-gift retry.”

### C06 — Tenant safety

**Material concern: Yes. Severity: Critical for cross-scope payment data. Likelihood: plausible with global flags/shared accounts.** A shared login, Customer or card mask could mix actors, represented donors, issuers or processor accounts. P9/P16 separate these relationships. This **requires A1 scope at every seam**.

**Permanent prevention / exact requirement:** “Resolve the exact principal/giving-Party/Tenant/entity/binding/account/mode/Customer context server-side; structurally bind preference, setup and target method. Reauthorize reads, acceptance, delayed completion and checkout. Include qualified scope in caches/jobs/results; no Site switch, email match or guessed provider ID grants access or copies preference.”

### C07 — Database, RLS and authorization safety

**Material concern: Yes. Severity: High; Critical if permission bypass reaches financial data. Likelihood: present target-proof gap.** There is no implemented qualified head/intent command. RLS alone cannot constrain bypass roles, mutable scope or cross-row readiness. This **requires the minimal structural model and real database proof**, not a new permissive preference JSON field.

**Permanent prevention / exact requirement:** “Enforce one head per exact scope, composite scope FKs, immutable context, valid nullable current/pending references, unique command/replay identity, monotonic intent and row revisions, and protected accepted evidence. Deny browser writes; prove effective USING/WITH CHECK, grants, views and privileged function paths. Actor/owner/audit values come from trusted current context; allowed updates cannot move the preference to another scope.”

### C08 — Overengineering

**Material concern: No in the corrected bounded design.** Checked whether a checkbox requires a card vault, generalized workflow engine, new event bus, per-Site/currency settings or a billing migration; none is necessary. One head plus existing setup-bound intent is justified by delayed results and concurrent choice. This **supports A without speculative infrastructure**.

**Exact requirement:** “Keep the finite owner preference and current/pending distinctions; reuse setup, command, projection, query and repair infrastructure. Add no generic wallet domain, per-provider interface fork, tenant-configurable timing system, duplicate payment executor or preference recommendation algorithm.”

### C09 — UX/UI and user friction

**Material concern: Yes. Severity: Moderate; High when the wrong method is implied. Likelihood: ordinary mobile and interrupted tasks.** Unclear Default copy, premature success, repeated preference entry, tiny checkbox hit areas and overwritten edits damage confidence. Current component/code inspection and cited accessibility guidance support the concern. This **requires V1–V8 and complete journey proof**.

**Permanent prevention / exact requirement:** “Use the reviewed Maia label, single optional control, readable scope and conditional status. Preserve valid work, accessible focus/keyboard/announcements and simple current-choice recovery. No nested modal sequence, hidden necessary explanation, guilt, duplicate payment selector, input-resetting refetch or toast-only completion.”

### C10 — Source of truth, ownership and domain invariants

**Material concern: Yes. Severity: High. Likelihood: likely with ambiguous default terminology.** Provider Customer defaults, actor preference, credential readiness and recurring authorization could become competing truth. ADR-0001 and the established phase boundaries require separation. This **requires A1's explicit owner amendment**.

**Permanent prevention / exact requirement:** “P13 alone owns new-gift selection preference; Stripe owns provider storage/readiness evidence, and P16 owns recurring authorization/binding/credential lineage. Preference is not payment permission, a mandate, money or provider default. Zero or one current preference exists per A1 scope; pending intent does not replace it before qualified application.”

### C11 — Hidden coupling

**Material concern: Yes. Severity: High. Likelihood: plausible across shared checkout/native components.** Express Checkout, Payment Element, fee calculation or bank notices could bypass or implicitly rewrite preference. R03/R06/Q15 effects and Q13 receipt choice have different meanings. This **requires one shared financial finalizer and separate messaging authority**.

**Permanent prevention / exact requirement:** “Saved, new-field and Express choices feed the same current financial operation and review; explicit transaction choice never rewrites standing preference. Do not use preference as redisplay consent or recurring authority. Required bank/setup communications remain intact; no receipt/Ministry Update/newsletter preference is changed or used to suppress them.”

### C12 — Failure modes

**Material concern: Yes. Severity: Moderate/High. Likelihood: normal distributed failures.** Provider setup may succeed before a response or preference write fails. Treating the task as externally atomic can duplicate setup or delete a useful method. This **requires independent durable results**, not compensation tricks.

**Permanent prevention / exact requirement:** “Persist exact setup and preference intent/result correlation before effects. Preserve a successfully saved method if preference fails, conflicts, expires or is unknown. Reconcile the same operation and only retry unresolved currently permitted work. No automatic detach, re-add, new idempotency key, false success or endless spinner.”

### C13 — Lifecycle, temporal correctness, concurrency and idempotency

**Material concern: Yes. Severity: High for stale selection/intent loss. Likelihood: ordinary delayed bank and multi-tab behavior.** A late ready event can overwrite newer intent, and a pointer returning to its old value can conceal intervening choices. Row cleanup may invalidate the wrong pending work. This **requires A3 and the two-revision rule**.

**Permanent prevention / exact requirement:** “Use server-accepted intent revisions, separate from row housekeeping revisions. New set/reaffirm/Clear validates the expected current intent revision; stale-tab conflict cannot overwrite a later choice. Withdraw/removal compares the exact still-current target before affecting intent order. Latest valid explicit intent wins. Compare exact intent, deadline and current authority at completion; no timestamp-based last-write-wins or older-request resurrection. Apply24-hour/10-day bounded product windows from the original accepted instant without refresh extension, under the documented classification rule.”

### C14 — Data integrity risks

**Material concern: Yes. Severity: High. Likelihood: plausible with loose IDs/derived flags.** Wrong method references, generic JSON, duplicate heads, mismatched provider namespaces or blind cleanup can corrupt selection/history. Current local isDefault is not an authoritative mapping. This **requires typed references and atomic owner updates**.

**Permanent prevention / exact requirement:** “Head and intent references must match the exact scoped setup/method and be independently unique where required. Apply/clear/current cleanup and durable result commit atomically. No mask/fingerprint-only merge, copied first-method truth, arbitrary JSON migration, cross-account method reuse or destructive deletion of still-required evidence.”

### C15 — Security and privacy risks

**Material concern: Yes. Severity: High/Critical for exposed payment or identity data. Likelihood: plausible without current filtering.** Setup links, client secrets, card details, another representative's choice or old cached context can leak. Hosted fields reduce scope but do not by themselves certify compliance. This **requires minimization and current authority**, not extra donor burden.

**Permanent prevention / exact requirement:** “No raw PAN/CVC/bank data enters Asym forms, stores, logs or analytics. Use opaque source references, private scoped caches, controlled callback cleanup and current authority. Restrict setup/intent audit visibility; no missionary exposure or routine staff actor-preference editing. Respect source privacy/retention and required payment evidence separately.”

### C16 — Scalability and performance risks

**Material concern: Yes. Severity: Moderate. Likelihood: grows with methods/contexts/provider delay.** Fetching all history, polling every method or calling Stripe per UI row makes a small preference expensive and slow. Existing bounded owner/query patterns are sufficient. This **requires measured bounded work**, not new queues/partitioning.

**Permanent prevention / exact requirement:** “Read one exact head/current preference plus bounded authorized method choices, resolving the preferred reference directly even beyond a loaded page. Batch provider qualification under existing limits; no browser provider loops or full-giving-history scan. Use declared production-shaped fixtures and adopted portal/API budgets before activation; report provider waiting distinctly and make no unmeasured performance claim.”

### C17 — Operational burden

**Material concern: Yes. Severity: Moderate/High for repair. Likelihood: ordinary failures.** Staff could need SQL or provider-global edits to repair a saved-but-not-preferred result. The domain needs explanatory results, not a second support console. This **requires existing operations integration**.

**Permanent prevention / exact requirement:** “Expose authorized exact setup/preference result and reason to existing owner diagnostics. Resolve through scoped idempotent owner commands/reconciliation; no direct SQL or Stripe-default repair. Routine success, valid waiting and user withdrawal create no staff task. Required intervention has an existing owner and safe action.”

### C18 — Observability and auditability gaps

**Material concern: Yes. Severity: Moderate/High. Likelihood: likely if only a badge/toast is logged.** Operators cannot explain which intent won or whether saving actually completed, while logging full form contents creates unnecessary risk. This **requires narrowly correlated source evidence**.

**Permanent prevention / exact requirement:** “Record accepted actor/scope, setup correlation, intent/revision, requested effect, expiry classification and immutable result/reason. Distinguish technical transport status from saved/readiness/preference facts and from later payment authorization. Minimize logs and separate security records from routine preference history; no read/open surveillance.”

### C19 — Dependency and integration risks

**Material concern: Yes. Severity: High. Likelihood: current integration/adoption gap.** Latest docs, pinned types and an unqualified account do not prove the actual saved-method/verification/fee composition. Deferred setup can silently remove bank fallback. This **requires the resolved supported pattern plus exact implementation proof**.

**Permanent prevention / exact requirement:** “Adopt A4/A5 through supported pinned APIs and intent-first setup where microdeposit fallback is qualified. Keep Express Checkout first and no duplicate saved selection. Prove exact account/rail/Customer/redisplay/CVC/mandate behavior and zero billing-default/retry effects. No SDK upgrade, unsupported widget ordering, provider-filter hack or new Customer workaround is part of Q16.”

### C20 — Migration, rollout and upgrade risks

**Material concern: Yes. Severity: High. Likelihood: realistic mixed-version/cutover failures.** Importing local default flags or rolling back to CardElement/mock/native-default paths would create false preferences or new effects. P16's fresh-build posture rejects dual-writing unsafe prototypes. This **requires additive owner adoption and containment**.

**Permanent prevention / exact requirement:** “Land source/head/setup contracts inert, classify only proven legacy preference evidence, adopt the shared checkout and remove incompatible writers once. No preference inferred from mock state, card order, generic JSON or provider billing default. Test N/N−1, pending-intent expiry and roll-forward; kill new acceptance/auto-application without discarding saved setup, result reads or protected recurring stop/reconciliation.”

### C21 — Testability, traceability and proof

**Material concern: Yes. Severity: High. Likelihood: current proof gap.** A source/type review could be mislabeled a successful provider or accessible journey test. Target preference code is absent. This **requires falsifiable source/database/provider/E2E evidence**, not synthetic assurances.

**Permanent prevention / exact requirement:** “Trace A1–A5/J01–J12/V1–V8/C01–C22 into later authorized owner contracts, glossary, nonduplicate tickets and T01–T15 proof. Verify actual PostgreSQL scope/concurrency, exact provider negative effects and accessible full journey. Do not count old pure/mock tests or type availability as target/live proof.”

### C22 — Other development hazards

**Material concern: Yes. Severity: Moderate/High. Likelihood: plausible terminology and scope drift.** Default can again mean every payment; a switch may falsely look immediately applied; pending intent may be mistaken for financial permission or a new support requirement. This **requires stable terminology and explicit stage boundaries**.

**Permanent prevention / exact requirement:** “Use Preferred for new gifts for the standing selection and explicit saved/verification/preference outcomes. Keep ordinary Add distinct from Replace, Remove, current-gift Change, repair and restart. Preserve Q14 G01 and remaining phase gaps; ratification accepts direction, not implementation or publication. No provider configuration, source feature or formal PRD/issues are created during grooming.”

## Required target proof — T01–T15, not represented as run

<!-- prettier-ignore -->
| ID | Falsifiable acceptance evidence |
|---|---|
| **T01** | A legitimate first-method donor needs no previous donation or recurring authorization. Identity and normal Customer setup resolve through their owners without a fabricated historical claim. Unchecked Add, including first/only method and absent checkbox serialization, changes no current or pending preference. Explicit checked intent and standalone set/clear have exact scoped results. |
| **T02** | Real PostgreSQL scope/FK/grant/RLS/function tests deny another principal/Party/Tenant/entity/account/mode/Customer, forged audit data and scope-transforming updates, including privileged paths and approved exposed channels. |
| **T03** | Two connections exercise simultaneous checked intents, stale-tab set/Clear, same-value reaffirmation, withdrawal and duplicate request keys. Latest accepted intent is deterministic; stale expected revision cannot overwrite; exact replay returns the prior result. Stale Withdraw B and late Remove A cannot mutate newer C. |
| **T04** | Remove effective A while pending B; remove pending B; revoke actor/method; temporary ineligibility; detach evidence and readiness races. Cover the same method referenced by multiple actors with private complete cleanup. Current cleanup cannot erase a valid unrelated intent, and no removed/revoked method becomes selected. |
| **T05** | Readiness before/after24 hours and before/at/after10 elapsed days; first positive microdeposit classification before/after ordinary expiry; clock skew, resend, duplicate webhook and later verification. No timer reset or expired-request resurrection; method success remains independent. |
| **T06** | Qualified SetupIntent path has exact Customer/account/mode, hosted fields, declared on_session purpose, valid redisplay evidence, authentication and bank fallback. No donation PaymentIntent/default/retry/detach call occurs in Add/preference. |
| **T07** | Saved preference is actually selected in the shared masked-method UI; no unsupported Payment Element ordering. New-field and Express alternatives retain first-class access and reach the same current owner finalizer. |
| **T08** | Explicit transaction selection survives refetch and standing-preference changes elsewhere; one eligible method without preference remains transaction-only, multiple require choice, unavailable preference requires alternate choice without promotion. |
| **T09** | Current fee/funding/rail/mandate/CVC/3DS requirements apply to saved, new and Express branches. Actual approved method/total matches confirmation; new recurring initial-owner exclusivity remains intact. |
| **T10** | Provider success/response loss, preference SQL failure, delayed webhook, worker crash and repeated return preserve original saved result and current intent. No duplicate setup, false failure, automatic detach or infinite spinner. |
| **T11** | Full J01–J12 donor E2E includes two devices for verification, safe reauthentication/return, expired intent, current/represented scope, partial outcomes, clear preference and later checkout. No new generic draft-sync product. |
| **T12** | Manual keyboard/NVDA/VoiceOver/mobile/touch/zoom/RTL/long-label/slow-network and automated accessibility checks cover hosted frames, checkbox hit area, focus/status and retained safe input. |
| **T13** | Required setup/mandate/verification notices remain correct under marketing opt-out and Q13 receipt quieting. Preference alone emits no receipt, marketing event, staff task or missionary detail. Logs/URLs/caches exclude forbidden data. |
| **T14** | Fresh-build migration/N/N−1/kill rehearsal rejects prototype/JSON/provider-default imports and preserves saved methods, accepted results, bounded pending intent and recurring safety. |
| **T15** | Declared method/context/load fixtures and query plans meet adopted existing budgets with bounded provider work. Observed donors understand saved versus preferred, unchanged recurring methods, delayed verification and transaction override; any material wrong-payment expectation blocks release until corrected. |

## Dependencies, synthesis and sequencing

Relevant actual bodies: #615 is a read-only staff instrument panel; #812 owns exact recurring changes. Neither supplies a generic donor preference writer. Q03 already requires finite setup/default/detach kinds and truthful targets; P13/P16 #795/#799/#800/#801/#802/#809/#810/#811 provide related command/control/creation/authority foundations. Old #704 per-line subscription/default fan-out and stale #615 Customer assumptions do not override later ownership. Searches found no distinct implemented donor preference ticket; that is a bounded search finding, not proof that no related issue exists. No GitHub changes were made.

**Record now:** selected A, this review, proposed A1–A5/J01–J12/V1–V8/C01–C22, the supported provider strategy and actual evidence limits. **Before recording corrected execution as settled:** obtain explicit ratification of personal scope/owner refinement, default rules, bounded deferred intent and waiting limits, shared saved-method composition and result/purpose semantics. These are visible material decisions, not hidden hardening.

**Permanent implementation sequence after the later authorized specification:**

1. Reconcile the exact P9/P13/P16/OpenSpec owner language and current tickets; define the finite preference scope/head and setup-bound intent without duplicate ownership.
2. Complete and prove setup, current permission, head/intent concurrency, result/reconciliation and required messaging foundations; no checkbox on a mock writer.
3. Adopt the supported saved/new/Express method inputs in one canonical checkout finalizer, with exact current fee and authorization handling.
4. Compose the small Maia Add/preference flow and Wallet/current-checkout display; remove incompatible prototypes rather than maintain a second path.
5. Execute T01–T15, qualify real account/rail/browser behavior and required terms, then activate bounded scope with the existing operations system.

The API strategy and ownership are resolved by this review; actual source implementation, database and provider/browser execution are still proof obligations. Qualify the exact required setup/mandate/verification message key, sender/delivery responsibility and Live admission/provider behavior for each enabled rail before activation. An unavailable required message path keeps that rail's setup path unavailable; do not claim an email was sent, send duplicates or substitute an unrelated receipt/marketing key. No extra preference-change message is needed. Q14 G01 and wider phase coverage remain separately open. No frontend preference flag can waive those prerequisites.

**Monitor only after qualification:**

<!-- prettier-ignore -->
| Signal | Threshold | Owner | Response |
|---|---|---|---|
| Preference/Add causes an unrequested billing/default/recurring/retry effect or wrong-scope access | One confirmed occurrence | Payments owner; Security for exposure | Contain new affected actions, preserve setup/result/recurring stop and reconciliation, investigate exact operation/evidence and requalify before reactivation. |
| Expired/superseded/withdrawn intent applies, or confirmed valid selection is overwritten by refetch | One confirmed reproducible case | Giving/checkout owner | Stop the affected auto-application path, repair the current preference through the owner and rerun ordering/checkout tests. No financial rollback is inferred. |
| Ready-method preference effect remains indeterminate | Five elapsed minutes from recorded uncertainty; exclude normal bank verification | Giving/payment operations owner | Surface the existing reconciliation case and inspect the same operation. Do not repeat setup. This is a proposed triage threshold, not a bank-settlement SLA. |
| Required setup/verification step or preference state is inaccessible/misleading | One confirmed reproducible defect | Donor Portal owner | Fix shared composition/copy, rerun affected accessible E2E and contain the affected path if it prevents correct completion. |

Ordinary save-only use, valid verification waiting, user withdrawal, an expired optional request or choosing a different method is not an incident. Do not add engagement surveillance or preference-change emails to make monitoring easier.

## Final disposition and corrected record

**Accept with required amendments.**

“Phase25 offers one initially unchecked Prefer this method for new gifts choice within standalone Wallet Add. P13 owns the exact actor/giving-context selection preference; Stripe owns secure storage/verification and P16 retains collection authority. Adopt A1–A5, J01–J12, V1–V8 and C01–C22: explicit defaults, supported shared saved-method selection, bounded current-guarded pending intent, independent saved/preference results and clear Maia presentation. No provider billing default, current recurring gift, retry, fee choice, receipt/communication preference or method removal is changed. Actual checkout still requires current financial review and authorization. Target database/provider/accessible proof and remaining phase dependencies stay required.”

The review is complete. A is selected; corrected execution awaits ratification. No runtime feature, provider configuration, canonical ADR/OpenSpec, PRD or implementation issue was changed or published.
