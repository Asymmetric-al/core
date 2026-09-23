> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

> **Explicitly founder-ratified, 7 September 2026.** Conrad accepted A1–A4, J01–J12, C01–C22 and all reviewed presentation defaults. Historical proposal/review wording below is preserved; those corrected requirements are now accepted. Target implementation and release qualification remain required.

> **Status update,7 September2026:** Conrad selected A. The corrected execution review is complete and awaits ratification; this historical question brief is not the final execution record. See phase25-r13-adversarial-review.md.

# Question 13 — Quieter receipt emails for ongoing recurring giving

**7 September 2026 · Research/grooming only · Q12 fully ratified · Q13 unanswered**

Conrad explicitly accepted Question12's complete corrected content, J01–J12/C01–C22 and presentation defaults. Its historical proof bundle is unchanged. This next question returns to the organization/receipt preference frontier that Q07 left distinct from Ministry Update controls and Q09 parked for explicit owner-policy review.

## One deliberate policy decision

**Recommend A — Let donors quiet eligible routine recurring-receipt emails.** Compare with **B — Retain the current source-governed delivery policy without that new donor control.**

This is an explicit proposal to refine one narrow Phase7 receipt-delivery eligibility rule. It is not an ordinary unrestricted settings toggle and does not silently override a ratified contract. The reason to revisit it is the founder's request for meaningful receipt preferences and a quiet donor experience, supported by actual contemporary donor-platform differences. Whether a donor can stop legally/source-required messages is not offered as a choice.

The exact existing Phase17 rule remains: once the receipt owner has admitted an eligible required email, Phase17 cannot disable its required step. A donor preference, if approved, must be evaluated by the proper source owner before future eligible notice admission. It cannot reclassify a message in the UI, rewrite a prepared recipient/body or override a mandatory legal, financial, security or delivery-safety restriction.

## Plain-language situation and options

Maria supports several ministries through ongoing recurring gifts. In this illustration, the organization's existing rules issue and email an eligible receipt for each successful installment. Maria wants the gifts to continue and wants access to the issued receipts, but would prefer fewer repetitive emails.

This is a hypothetical need, not measured donor behavior or a claim that every jurisdiction/source issues a per-gift receipt. Phase7 may instead govern an annual cumulative plan; that remains intact.

<!-- prettier-ignore -->
| Option | Maria's experience | Benefit | Cost or tradeoff |
| --- | --- | --- | --- |
| **A — Quiet eligible routine recurring-receipt emails (recommended)** | She can explicitly stop future receipt emails for owner-certified routine later recurring successes, where that choice is permitted. Issued receipts remain accessible in Receipts & statements. | Gives donors meaningful control over repetitive mail without treating every service message as marketing or changing giving/document facts. | Requires a narrow source-policy refinement, precise eligibility/provenance and delivery-race proof. It cannot launch as a generic receipt checkbox. |
| **B — Keep the current source-governed delivery policy** | There is no new donor receipt-quieting control. Emails continue when the existing source policy admits them as required and eligible; the portal explains why those service messages are separate from optional communications. | Consistent automatic confirmation and another opportunity to notice an unexpected transaction outside the portal, with less new classification/preference work. | A donor whose recurring receipt emails are routinely admitted has no self-service way to quiet those particular copies. |

Both preserve source-governed receipt issuance, artifact access, legal donor, giving history, recurring authorization and required notices. B does **not** mean every gift always sends an email; receiptability, recipient eligibility, annual plans, source suppression exceptions and delivery safety remain real constraints.

## Recommendation and proposed boundary

A is the better direction for this product because it makes receipt preferences useful to established recurring donors while keeping the stronger boundaries where they belong. It permits individual choice rather than assuming every donor wants fewer confirmations. This is a product judgment, not a retention/conversion claim.

The candidate boundary is deliberately narrow: **later successful recurring-gift receipt emails that the owning rules positively certify as discretionary for this choice**. One-time gift receipts and initial/new-commitment confirmations are outside this proposed quieting control. So are independently required correction, financial, authorization, security and statement notices. That does not assert every such event always emits email; it preserves whatever the proper source actually requires or permits.

Do not substitute a new monthly digest, monthly statement, annual receipt plan or notification backlog. Official receipt creation follows Phase7, artifacts/access follow18, and statements/delivery profiles follow19. Ministry Update preferences and missionary newsletters remain Q07's separate decisions. A does not change Stripe execution, payment retries, consent to marketing, the donor's email address or another person's receipt rights.

Until a real positive case is qualified under the source's jurisdiction/purpose/policy and required message/network rules, A has no enabled quieting lane. The owner must not infer that every repeat installment is discretionary or that holding an account is authority over a represented legal donor's delivery preference.

The next question asks whether to introduce this narrow product policy. Exact control granularity, default/migration behavior, current-versus-future arrangements, new/restarted/changed commitments, safe return-to-On, pending-message races, API/database ownership and accessible copy must be pressure-tested after the answer before corrected execution is ratified. These are not silently settled by the example. No change occurs merely because this brief exists.

## Current primary research

<!-- prettier-ignore -->
| Source | Verified behavior | Classification and limit |
| --- | --- | --- |
| Fundraise Up's supporter email documentation | Supporters can opt out of later recurring installment receipt emails beginning with the second installment; first-plan and one-time receipt emails have no supporter opt-out in that table. Receipt generation under organization rules and portal access continue. | **Useful precedent** for a narrow recurring distinction. Its administrative settings, per-plan scope, annual summaries and provider/network limits are not copied into Asym. [Official documentation](https://fundraiseup.com/docs/emails-settings/). |
| Church Center Giving notification preferences | The Giving-specific instructions allow donors to turn emailed receipts off and choose a listed receipt address. | **Useful precedent** showing a broader donor control. The article's general notification preface says email is unaffected, but its Giving-specific section is explicit. Do not generalize other push preferences or its multiple-address model into Asym. [Current guide, September 3, 2026](https://help.planningcenter.com/en/141287-view-notifications-and-update-preferences.html). |
| Givebutter transactional/marketing distinction | Marketing unsubscribe does not stop transactional receipt/system mail; automatic receipt documentation also contains import/offline exceptions. | **Useful precedent** for separating marketing withdrawal from service eligibility; it does not establish a universal receipt-opt-out or exceptionless always-send rule. [Unsubscribed contacts](https://help.givebutter.com/en/articles/5497894-how-unsubscribed-contacts-are-handled), [automatic receipts](https://help.givebutter.com/en/articles/2219216-how-to-manage-automatic-receipts-and-thank-you-messages). |
| IRS written acknowledgment guidance | Describes required substantiation content and donor recordkeeping. | **Source of a narrow US document requirement**, not permission to infer a worldwide email opt-out rule. Jurisdiction/purpose/delivery eligibility still needs the receipt owner's qualified policy. [IRS guidance](https://www.irs.gov/charities-non-profits/charitable-organizations/charitable-contributions-written-acknowledgments). |

These are documented product/official guidance facts retrieved 7 September 2026. No comparative donor study, actual opt-out/re-opt-in journey, live message send or legal qualification was performed. No dated retention claim or provider-limit statistic is used to settle the answer.

The latest [Stripe receipts documentation](https://docs.stripe.com/receipts) was also consulted through the Stripe CLI. It distinguishes receipt availability from automatic email settings and explains that Connect charge patterns affect which account's settings apply. This is **Useful precedent** for treating provider receipt delivery as a separate integration concern. It does not establish that an Asym preference controls every Stripe email or that a Stripe receipt is Asym's official donor receipt. Exact connected-account configuration/capabilities were not reverified and no provider setting or financial action was changed.

## Governing repository evidence and amendment mechanism

Develop and remote were freshly checked at **7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd**. Existing five setup paths are preserved. Repository facts constrain both options:

- **ADR-0001/P7/P18/P19:** receipt facts, legal donor, source issuance, artifact access and statement operations are distinct from a delivery preference. Email success never creates a legal receipt, and email quieting never deletes one.
- **Phase17 executable manifest:383–405, `profile.receipt_required_email@1`:** `giving_receipt` is `required_official_transactional@1`; the Phase7 producer emits after issuance and its delivery policy establish an eligible required email. Phase17 then cannot disable it. The named correction-source suppression exception remains capability/reason/audit-bound, not a donor preference. The profile requires one authorized recipient and one required email step without a Tenant timing/channel override.
- **Phase17 main PRD:420–421:** receipt-issued/replaced keys are required where legally/operationally eligible. The wording is conditional; it is not proof all gifts always email.
- **Phase7:58–66:** an active Canadian pack can freeze individual-cash versus annual-cumulative cash treatment; annual cumulative forbids a per-gift official receipt. A setting cannot reinterpret the frozen plan.
- **Phase19:593–637:** future and one-statement delivery preferences have their own authorized profiles and higher legal/safety/current eligibility constraints. Q13 does not replace them with a monthly-statements checkbox.
- **Q07:** marketing/Ministry Update controls do not decide receipt eligibility; external missionary newsletter lists remain outside portal control. The founder's wish for receipt preferences is why the narrow source-policy refinement is being presented explicitly now.

Thus A's permanent mechanism is **prospective owner-policy evaluation**, not a Phase17 required-step override or an unexplained `do_not_email` shortcut. Any admitted/prepared/in-flight work must retain its proper source lifecycle; no historical body/recipient is rewritten and no uncertain provider result becomes a new send/retry. Exact applicability to outstanding versus future occurrences must be resolved with the owner, not guessed from UI timing.

Source links: [receipt-required profile](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-17-system-message-executable-manifest.md#L383), [Phase7](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-07-receipt-statement-compliance-and-donor-credit.md), [Phase19](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-19-year-end-statement-operations.md).

## Current behavior is not proof of the proposed control

Settings currently contains Instant Donation Receipts and Monthly Statements switches backed by local state and a simulated save. The real stored notification-frequency field has no located sender consumer in the inspected paths. Those controls do not establish a working delivery policy or safe donor opt-out.

Legacy receipt paths also disagree: `packages/api/src/giving/receipts.ts:329–355` treats receipts as transactional and bypasses `do_not_email`, while the correction delivery-option evaluator at `packages/api/src/admin/contribution-operations/receipt-delivery.ts:100–117` can block email from the donor's doNotEmail flag. The current consent gate is real; stale issue text claiming it is unmerged must not be followed. This inconsistency requires owner reconciliation under either future adoption path, not a new universal toggle.

Fresh read-only issue work found #555/#557/#680/#875/#876/#887/#890/#938 Open, and reconfirmed PR502 merged. The owner notes separately preserve P19-related #981/#982/#983/#1017/#1023/#1024 contracts and body/native dependency evidence. No issue or GitHub relationship was changed. Exact existing predecessor work must be reconciled before any later ticket publication; this question creates none.

## What is and is not being decided

- **Already ratified:** Q01–Q12 and their reviewed requirements; source-owned required-message boundaries; document truth and access; separate marketing and missionary controls.
- **Requested founder decision:** whether to add the narrow donor-controlled routine recurring receipt-email eligibility refinement in A, or retain B's current source delivery policy without that new control.
- **Not yet accepted:** detailed setting scope/defaults, admission/retry timing, implementation commands, schema or migration. If A is chosen, these receive the full execution/adversarial review before ratification.
- **Not authorized:** PRD/formal specification, issues, implementation, provider settings or live sends. Research and local decision records only.

**Recommendation: A**, with the explicit narrow source-policy refinement and unchanged protection for independently required messages. Await the founder's answer to Question13.
