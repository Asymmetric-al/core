# D28 — Final owner review: independent feedback opt-out authority

**13 September 2026. A selected with Off and adjustable random sampling; detailed amendments remain proposed.** Reviewed the actual D28 main decision, [Email Studio integration](phase26-d28-email-studio-integration.md), [UX blueprint](phase26-d28-ux-blueprint.md), [earlier owner report](phase26-d28-owner-review.md) and the exact P17 executable manifest/source. This is a bounded final owner review, not a new product option, formal specification or implementation.

**Disposition: accept with the precise amendments below.** A separate, restriction-only P3 feedback preference action is the right permanent fix for an opt-out that would otherwise disappear after the response becomes Used or its 14-day window expires. The root's proposed **90 elapsed days from preference issuance** is a finite product policy, not a universal legal requirement or an extension of delivery-material retention.

## What the actual P17 contract supports

The catalog is **not globally limited to one action**: [P17's code-owned definition, line 568](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-17-system-messages-template-management.md#L568) defines plural `actions` as finite D6 descriptors with their issuer, expiry/replacement/replay, landing and postcondition. The [executable manifest](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-17-system-message-executable-manifest.md#L398) likewise requires exact per-key `actions` rather than tenant-authored arbitrary behavior.

However, the published reference producer API still has singular [`actionDescriptorInput?: ProtectedActionDescriptorInput`, line 2280](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-17-system-messages-template-management.md#L2280). Generated trigger bindings have one [`action_issuer_id/version`, manifest line 773](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-17-system-message-executable-manifest.md#L773). The current exact Target Live descriptor list contains neither feedback response nor feedback preference.

Therefore D28 must qualify its **closed named pair** through the source adapter/producer input, flat manifest, canonical protected presentation and preparation/seal contracts. It must not claim arbitrary multi-action runtime support is already implemented. One code-owned compound adapter may assemble the pair while invoking each real issuer; the Support adapter must not become P3's preference authority. No generic action-array builder, tenant-defined slot, new doorway or second survey template is required.

## Required corrections and exact language

### O-F01 — Independently issued secondary preference action

**Material concern: yes. Severity high; likelihood high if a shared token/state is reused.** The current rating grant ends on Used/expiry. Sharing it with Stop invitations would leave a person able to rate once but unable to stop later requests through the same email. Binding preference redemption to current Support content would also break after that content expires or is deleted.

> The invitation contract SHALL declare exactly two code-owned protected controls: a primary Support feedback-response action and a secondary P3 Stop feedback invitations action. Each has its own issuer authority, selector/verifier, purpose, intended endpoint binding, issuance/expiry, revocation/replay state and terminal/session behavior. The preference action SHALL be independently qualified for Party and no-Party endpoints under P3; it may only suppress that tenant's feedback-invitation purpose. It grants no conversation/CRM/body access and cannot increase contact permission or change other preferences.

> Preference expiry SHALL be fixed at no later than its own issued_at + 90 elapsed days, shortened only by its applicable contact/privacy/security authority. Response Used, the response's 14-day expiry, ordinary reopening, invitation Off, Support transcript expiry/deletion or an unrelated rating-only restriction SHALL NOT consume or revoke this independent preference authority. Actual tenant/endpoint validity, preference-specific protection and privacy revocation remain authoritative.

This needs a minimal P3-owned issuance/reference, not a second copy of the conversation or plaintext recipient in durable communication history. Support may supply the qualified original invitation context at issuance; current redemption is decided from the independently retained P3 endpoint/purpose authority. The owner must not retain a Support transcript just to keep an opt-out link valid.

**Proof:** Rate once, revisit the original email and stop invitations; let rating expire and then stop; expire/delete the transcript and then stop; turn invitations Off and then stop; cross-use either token in the other slot and fail. Preference denial/revocation must not be mistaken for response state, or vice versa.

### O-F02 — Credential expiry never expires an admitted opt-out

**Material concern: yes. Severity high; likelihood medium.** “90-day preference” can be implemented as a suppression TTL, silently opting the mailbox back in when the link expires.

> Ninety days limits the preference credential's redemption authority, not the resulting P3 preference. A recorded feedback opt-out remains effective under P3's own authorized preference/records lifecycle. It SHALL NOT reset at credential expiry, invitation-policy Off→On, percentage change, source reopening, template publication, provider repair, contact-key rotation or a later invitation attempt. Any permission-increasing change requires the actual separately qualified P3 preference authority; this restriction-only capability can never perform it.

**Proof:** Redeem on day 80, let the credential expire on day 90, and prove a day-91 feedback invitation remains suppressed. Replaying an already effective valid stop is idempotent; changing the purpose/endpoint or trying to enable contact fails. A deleted/replaced contact follows its actual owner lifecycle, not automatic transfer to a new contact.

### O-F03 — Explicit fixed-pair compiler and preparation qualification

**Material concern: yes. Severity high; likelihood medium.** Merely placing a second URL in the template could omit its issuer/privacy/expiry from the sealed manifest, allow slot swapping, or let the primary action's terminal handling invalidate the secondary one.

> The D28 catalog/profile and producer adapter SHALL explicitly expand the closed response/preference pair with per-slot issuer/version, purpose, recipient-authority branch, descriptor schema, current applicable fences, semantic role, expiry and source proof. Qualify the existing singular reference DTO/binding where necessary so neither slot is ignored, aliased or rendered as an ordinary tenant-editable URL. The flat activated manifest, canonical protected-node rules, serializer/seal, hashes and synthetic proof SHALL cover both exact descriptors and both final rendered destinations. No unknown/extra slot or runtime tenant action is accepted.

The invitation remains one communication effect and one compiled email. Its primary Give feedback CTA and quiet mandatory Stop feedback invitations control have distinct accessible labels and equal availability under images-blocked/plain-text rendering; the quiet secondary control is not a new survey-layout role. Neither may be hidden or transformed into a score-in-URL link. Each uses the same existing generic D6 doorway and deliberate POST protocol. Cookie/session purpose and Used/expiry cleanup apply to the correct action; one slot never borrows the other's authority.

P17 requires exact prepared bytes and current applicable safety before dispatch; adding a secondary 90-day credential does not permit re-resolving either URL later. Independent issuer failure means the invitation is not ready; do not send an invitation with its required opt-out omitted.

**Proof:** Missing/extra/duplicated/swapped slot, wrong issuer or recipient, mismatched manifest generation, changed purpose and wrong session fail before effect. Both links remain distinct in HTML/plain text and survive qualified clients. A primary response expiry does not alter the secondary descriptor; no token goes into logs, Recent copy, analytics or a plain link field.

### O-F04 — Preference lifetime does not retain provider material

**Material concern: yes. Severity high; likelihood medium.** Keeping an opt-out available for 90 days could become an excuse to retain the email envelope, raw token or full invitation indefinitely, or to reconstruct it from a sent-copy viewer.

> P3 retains only its purpose-qualified verifier/issuance/control state and the minimal endpoint authority needed for preference redemption under its declared custody. P17 prepared artifacts/provider envelopes still lose adapter/decrypt authority and purge on qualified acceptance, terminal no-send, applicable earlier delivery/action/privacy bound or other existing finality trigger. The 90-day preference period SHALL NOT lengthen the feedback invitation's send-by, rating expiry, P17 material class, Recent copy or Support transcript lifetime.

> The original email's independently issued preference link remains the recipient entry point. A rating Used/expired page SHALL NOT recreate, refresh or mint a preference credential from purged P17 material, a raw-email archive, the rating credential or a generic source lookup. Any on-page preference action must have independently established current P3 authority; the rating token is not that authority. Provide a plain explanation to use Stop feedback invitations in the original email when no independent preference authority is present.

The [P17 acceptance/purge rule](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-17-system-messages-template-management.md#L1643) and [Recent-copy URL exclusions](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-17-system-messages-template-management.md#L1564) remain unchanged. Possessing two email action links does not create two mail-delivery effects or another notification.

**Proof:** After exact provider acceptance/purge and after rating expiry, the original secondary link works under its own current authority; raw verifier/request bytes cannot be read from history or reconstructed through a receipt. Expired/revoked secondary authority has a truthful generic recovery path, never an automatic replacement email.

### O-F05 — Preserve the real unsubscribe classification boundary

**Material concern: yes. Severity high; likelihood medium.** A generic marketing unsubscribe could change unrelated contact purposes, while blindly ignoring unsubscribe headers could violate the registered mail contract.

> The fixed Stop feedback invitations action records only P3's feedback-invitation preference. P17's visible unsubscribe and RFC 8058 header/endpoint requirements apply when the actual registered purpose/classification requires them; they are not inferred merely from the word survey or bypassed by calling the mail service-related. Where required, adapter-owned RFC 8058 handling must withdraw this exact qualified purpose through P3 and follow its existing narrowly exempt GET-inert, cookieless one-click POST contract. No rating, other subscription or contact-permission increase can be admitted through that endpoint.

The existing [P17 header contract, line 1469](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-17-system-messages-template-management.md#L1469) is an expressly narrow exception to the normal handoff; it is not an alternative response protocol. This review does not classify all US/ministry feedback mail legally or introduce a generic preference center. The declared purpose and exact classification remain an activation gate.

**Proof:** Response Submit, visible preference Stop and any contract-required RFC 8058 POST have distinct accepted payloads and postconditions. Header purpose cannot be supplied by the tenant template or used to stop unrelated receipts/ordinary contact.

## Other final owner findings

The reviewed main and integration text correctly preserve Off-by-default invitation policy, one stable sampling outcome, current recipient/no-Party qualification, D5 local-only ending, generic Continue then explicit response submission, fixed response expiry from issuance, no transcript disclosure, one response receipt and honest bearer attribution. P6 uncertainty is never promoted by a rating, and feedback does not automatically reopen work, send an apology, change a CRM score or create a new task. No additional material conflict was found in those reviewed seams.

The root's global gate must still be operation-specific: Off and source-completion changes block invitation sending, while already issued response/preference actions use their own current applicability. Primary feedback source privacy may revoke a rating action without necessarily revoking the P3 restriction-only preference. Actual endpoint/tenant privacy changes may affect both through their respective owners. Do not implement all three operations with a single `feedback_enabled && conversation_exists && rating_unused` predicate.

The earlier owner report's suggestion of one no-Party feedback authority covering response/preference must be read in light of this final distinction: shared recipient qualification is reusable, but **credentials, issuers, postconditions and terminal lifetimes are separate**. The parent main/integration/data language governs after these corrections are reconciled.

## Completion and proof status

The five corrections above are the minimum precise implementation of the selected response-plus-opt-out journey. They do not add a second template, a general multi-action builder, a new public route or Phase34 dependency. The data/retention and UX companions must carry the two-grant/one-message distinction and include day-80/day-91, used-rating, removed-Support-source, slot-swap, held-data and acceptance-purge tests.

Core source remains `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`; the P17 manifest/source was freshly inspected read-only. No compiled manifest or runtime action implementation was executed or altered. The proposed 90-day preference-credential policy and fixed-pair adaptation are not claimed already shipped. Final pass depends on checking the actual amended root text; current status is **required amendments identified**.

## Final actual-document verification — passed

Re-read the amended main R08/R13/R14/R23 and P08/P18–P28, the data lifecycle/custody text, the Email Studio fixed-pair/preparation/handoff sections, and the requester UX. All five findings above are now resolved explicitly:

1. P3's independent preference grant has its own selector/verifier/purpose and proposed 90-day issuance lifetime. Rating Used/14-day expiry, ordinary Off and Support content expiry/deletion do not consume it; its own current endpoint/contact/privacy authority still applies.
2. Only the credential expires at 90 days. The admitted P3 opt-out survives under its independent authorized lifecycle; P24 explicitly tests a day-80 stop remaining effective on day 91. Policy cycles, CRM merges and key rotation cannot silently opt someone back in.
3. The root accurately distinguishes the catalog's finite plural actions from its singular reference producer interface and expressly qualifies the closed named response/preference pair, including separate issuer, purpose, recipient, expiry/revocation/Used state and immutable pins/hashes. No arbitrary multi-action builder or additional doorway is introduced.
4. Preparation retains the earlier delivery/action/privacy limits and actual acceptance purge. The original email's independent preference footer remains the entry point; the Used rating receipt cannot reconstruct or reissue a preference URL from purged P17 material. The longer grant does not extend mail-byte custody or Recent-copy permissions.
5. RFC 8058 applies only under the actual registered feedback-purpose classification and existing qualified adapter contract. The browser preference action remains independently scoped; neither path changes unrelated service/marketing authority or ratings.

The additional R08/data/P08 clarification is consistent with P6's effect model: a still-permitted/in-flight crossing holds the endpoint guard, and release requires qualified proof that no old crossing remains plus 30 elapsed days from the latest possible crossing bound. Irreducible historical uncertainty does not create permanent mailbox suppression. This permits only a different genuine opportunity; same-effect dedupe, no blind retry and immutable evidence remain intact.

**Final independent disposition: pass for this bounded owner review; no remaining material correction found.** The root main/data/UX/integration contract governs over earlier exploratory alternatives in this report and the earlier owner report. Detailed D28 amendments remain proposed pending founder ratification. This document check is not execution of the future manifest, provider, database/RLS, browser/scanner, retention/restore or usability proof groups. No additional source/runtime test or product mutation was performed.
