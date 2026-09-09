> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

> **Fully ratified, 8 September 2026:** Conrad accepted Q25 B and A1–A5/J01–J18/V01–V14/C01–C22, including Email Studio/P6/Resend and the seven-day first-handoff/thirty-day Core-detail defaults, earlier P6 stops and reviewed Maia presentation. Earlier proposed/unanswered wording below is historical. T01–T20 remain required target proof; ratification does not certify implementation or measured UX.

> **Current status, 8 September 2026:** Conrad selected **B — Send immediately, marked unverified**. The [completed adversarial review](phase25-r25-adversarial-review.md) preserves one-submit B and proposes corrected execution for ratification. The unanswered wording and recommendation A below are historical pre-answer research, not the current decision.

# Question 25 — When a newsletter request reaches the missionary

8 September 2026. **Q24 is fully ratified**: A1–A4/J01–J18/V01–V14/C01–C22, including current-fund scope, preservation of older financial records and three/two Maia previews. **Question 25 is unanswered.** This is the next researched founder decision in the continuing Phase 25 Grill with Docs session.

## The one decision

For the missionary-newsletter request you described in Q07, should an **unverified requested email address be confirmed before the request is released to the missionary**, or should the missionary receive the request immediately with its unverified status made clear?

The already-confirmed product direction stays intact: a guest, donor or non-donor can request the missionary's externally sent newsletter; Core passes the appropriate request information to the missionary through email and a missionary-dashboard notification. The missionary manages the external newsletter. This question decides the timing/verification threshold for that handoff. It does not introduce a newsletter subscription engine, require a donor account or change Ministry Updates preferences.

## Concrete example

Illustrative Maria visits a missionary's giving page and requests the newsletter. She is not signed in and enters her name and email. There is no current qualified proof that she controls that address. She may have entered it correctly, mistyped it or used another person's address; these are test scenarios, not claims about observed Asym abuse rates.

<!-- prettier-ignore -->
| | **A — Confirm the email before handoff. Recommended.** | **B — Send the request immediately, marked unverified.** |
| --- | --- | --- |
| Maria's experience | After submitting, she sees a clear Check your email instruction and completes a short confirmation. The request then becomes eligible for the missionary email and dashboard notice. | After submitting, the request becomes eligible for the missionary email and dashboard notice immediately. No additional mailbox step is required by Core. |
| What the missionary receives | The exact request with source-qualified confirmation evidence, without a separate notice for its earlier unverified attempt. | The request with plain Email not verified context. Confirmation or deciding whether to add the address remains part of the missionary's external handling. |
| Strongest benefit | Reduces mistaken or forged-address requests reaching the missionary and improves the reliability of the contact detail before human follow-up. | Shortest submission journey; legitimate requests are not lost merely because the visitor overlooks a confirmation email. |
| Main cost | A mailbox switch and delivery dependency can cause abandonment; the flow needs clear correction/resend and honest pending states. | More uncertain contact information reaches the missionary, potentially creating cleanup or additional confirmation work. A label alone does not prevent unwanted downstream mail. |
| Already adequate proof | Reuse existing current proof for the exact requested address when the owning policy permits it; do not make every signed-in user confirm again. | Preserve actual available proof and label unknown only where it is unknown. |
| External enrollment | Neither form submission nor confirmation means Subscribed. External enrollment remains with the missionary and their real system. | Same distinction. |

B is a credible lower-friction request-intake pattern, not an inherently unlawful option. Both require clear request intent, appropriate disclosure and abuse controls. A confirmation email can itself be abused, so A is not a substitute for those controls.

## Best recommendation

**Choose A — Confirm an unverified email before the missionary handoff**, while skipping a redundant confirmation when the existing owner can certify sufficient current proof for the exact address the person deliberately chose.

The request is specifically about future email contact, and the missionary handles that contact outside Core. Correcting a bad address after it has already reached an external list or a person's inbox is less reliable than confirming it first. A adds a small visitor step in the uncertain-address case to avoid exporting that uncertainty to every missionary.

Keep that step limited to this request. It must not block browsing, giving or unrelated account functions. A guest should not have to register, invent a password or become a Donor merely to ask for the newsletter. A signed-in session, donation, social-provider flag or prior receipt is not automatically sufficient proof for a different requested address; the source owner must qualify reuse rather than the UI guessing.

Proposed visitor wording before confirmation is **Check your email to finish your newsletter request**. After the owner has accepted the confirmed request for the agreed handoff, use a truthful request-status message. Do not claim the missionary read it, added the person to the external list or will send the next newsletter on a particular date. The precise accepted/queued/sent wording must follow the selected execution's source outcomes, including independent email and dashboard delivery.

This is a product recommendation, not an assertion that double opt-in is universally required or that all nonprofits use it. No Asym usability study or measured completion/spam improvement is claimed. The strongest reason to choose B is avoiding the inbox detour; A must address that cost rather than dismiss it.

## Current primary research and what transfers

All sources below were checked on 8 September 2026.

<!-- prettier-ignore -->
| Source | Verified lesson | Application and limit |
| --- | --- | --- |
| [GOV.UK: Confirm an email address](https://design-system.service.gov.uk/patterns/confirm-an-email-address/), current undated pattern | Confirmation proves access to a mailbox at that time, not a person's identity. The guide warns that email loops interrupt the journey and should be used only when needed; it covers correction, resend, expiry and blocking/non-blocking choices. | Supports a narrow request-specific check with clear next steps, not a universal registration gate. This service-pattern advice is not a newsletter law or proof that A always wins. |
| [Mailchimp: Choose Opt-in Settings](https://mailchimp.com/help/set-signup-preferences/), current undated guide | Documents both methods and single opt-in as its usual audience default. Its settings apply to its own signup forms; integrations/API intake are not automatically governed by those switches. | Makes B a serious alternative and warns against assuming a provider setting protects a custom Core form. Its automatic subscription outcome does not transfer to this request-only handoff. |
| [Kit: The all-important double opt-in](https://help.kit.com/en/articles/2971364-the-all-important-double-opt-in), 25 June 2026 | Recommends confirmation and documents it as the default for its forms/landing pages, emphasizing correct addresses and list quality. | Provides current support for A's reliability tradeoff. Vendor engagement/deliverability claims are not measured Asym outcomes; mailbox confirmation is not complete abuse prevention. |

These are relevant email/contact patterns, not evidence that a donor portal must operate a newsletter list. The contrast between Mailchimp and Kit shows there is no single universal modern default. The decision should fit this request's actual human handoff and the user's external-newsletter boundary.

## Repository facts: why this remains open

Current source checkpoint: `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. Active P22/P23 checkpoints remain the session's inspected branches. The owner, product and UX lanes independently checked for overlap with ratified answers.

- **Q07 explicitly leaves this open.** `phase25-r07-revised-question.md:79` identifies guest verification as an unresolved execution decision. Its ratified two-control review separately excludes newsletter public-intake/verification/operational-owner decisions. The founder confirmed the request direction, not this threshold.
- **Q11/Q14 do not settle newsletter intake.** They govern contact/sign-in and identity proof, not a blanket claim that every logged-in/provider email is sufficient for every request purpose. Q14's email link/code interface may inform familiar UX, but its Auth protocol must not silently create an account or grant rights in this request-only flow.
- **P22 needs the already-identified bounded catalog amendment.** `docs/prds/sitestacker-parity/phase-22-public-ministry-pages.md:619–629` currently excludes forms from the release catalog. A first-party request action needs explicit owner qualification; no arbitrary embed or new builder is authorized.
- **P23 D26 is the existing public-form foundation.** Its PRD `:707–723` and decision log `:6453–6580` require a versioned purpose, one qualified Primary Outcome and independently governed notifications. It must not become an unowned request inbox or duplicate work record.
- **Recipient verification is not visitor verification.** D26 decision log `:6482–6490` verifies the organization-controlled operational Email Destination—the missionary/recipient route. That does not establish possession of the visitor's submitted newsletter address.
- **The Phase 32 gate is explicit.** D26 decision log `:6542–6543` reserves newsletter consent/confirmation for the subscription owner. Implementing the requested handoff therefore requires a narrow, explicit **request-only purpose amendment** across the owners. Do not evade that boundary by relabeling actual subscription enrollment as a generic contact form.
- **P28 guest visibility is not automatic.** Roadmap `:3130–3137` limits ordinary missionary workspace visibility to active supporter/referral relationships. A guest request needs an exact request-recipient projection; it must not create a fake donor/supporter relationship to make the notification accessible.

This is follow-through on your explicit Q07 requirement within this session, with acknowledged P22/P23/P28/P32 and P17/P6 dependencies. It is not a newly invented Phase 25 newsletter product or a claim those cross-phase capabilities already exist. The unresolved request Primary Outcome and exact delivery/proof architecture remain work for the selected-answer review; the founder is not being asked to choose a database or API.

## Common boundaries and the next review

Both answers preserve a short, clearly labeled Maia request flow and the following invariants:

1. **One exact request purpose.** Share only appropriate request information with the currently authorized missionary recipient; explain the effect before submission. No organization marketing opt-in, protected Updates membership, gift claim or external enrollment is inferred.
2. **Trusted recipient routing.** The visitor does not supply the missionary's delivery address or impersonate their routing. Current Tenant, Page/purpose and recipient access remain with their owners.
3. **Mailbox proof is narrow.** It is not legal identity, future deliverability, marketing permission for unrelated purposes or proof the missionary completed enrollment. A changed address requires its own qualified state; proof for one address cannot migrate to another.
4. **Two requested delivery channels, independent truth.** Email and dashboard notification reference the same qualified request. A partial delivery or retry cannot duplicate the request, roll back the successful channel or claim the external list changed.
5. **No forced account.** Use the appropriate existing purpose/verification owner without accidental Auth signup, an invented donor row, a new generic verification service or automatic social-account linking.
6. **No noise added by default.** No missionary alert for each typing/edit/resend, reminder campaign, engagement score, automatic new support task or external-list synchronization.

After the answer, map the complete guest and signed-in journeys; qualify current-proof reuse, fields/disclosure, scanner-safe confirmation, address correction, expiry/resend, duplicates/retries, withdrawal, retired missionary routing, partial channel delivery, data retention and abuse limits. Decide the minimum correct Primary Outcome and owner amendments against the existing contracts. Ground exact confirmation copy in durable outcomes, and verify mobile/keyboard/assistive-tech behavior. Those are one coherent execution review, not a sequence of cosmetic founder questions.

Q24 ratification is recorded in the [grooming notebook](../decision-log.md); its historical bundle is unchanged. **Q14 G01 remains unresolved.** No email, notification, provider action, target implementation/test, canonical ADR/OpenSpec/source edit, `/to-prd` or `/to-issues` was performed for this next-question research.

**Founder decision pending: when should a newsletter request reach the missionary?**
