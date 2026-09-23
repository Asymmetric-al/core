# D25: ratified Email Studio and receiving boundary

**Fully founder-ratified, 12 September 2026.** This record makes the already accepted D25 owner amendments explicit. It adds no new decision. The complete authority is [D25-R01–R32 and all amendments](phase26-d25-adversarial-review.md), [data contract](phase26-d25-data-contract.md), [both setup and maintenance journeys](phase26-d25-setup-ux.md), [evidence](phase26-d25-evidence.md), and [independent seam review](phase26-d25-email-studio-seam-review.md). Governing source pins remain in the [original evidence manifest](phase26-d25-source-evidence.json).

## One product journey across distinct owners

| Fact or action                                                                                            | Authoritative owner                                 | Support Hub's role                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tenant Resend account, encrypted credential revisions, provider registration and delivery evidence        | Shared P6/P17 connection owner                      | Consume exact qualified references and purpose-scoped capabilities.                                                                                     |
| Receiving candidate, qualified address-to-inbox binding, activation, safe early intake and reconciliation | P26 receiving/configuration owner                   | Present the two equal setup guides and manage Support handling through current authorized commands.                                                     |
| Actual From, Reply-To acceptance and sender defaults                                                      | P17 identity/destination owners                     | Show actual values; select qualified references; never equate public incoming address with From or silently replace tenant defaults.                    |
| Canonical reusable wording, signature sources, approved versions, presentation and immutable preparation  | Email Studio/P17, including D4/D18/D23/D24          | Show contextual previews and eligible selectors. Support's Tiptap reply draft is the current human-authored instance, not a second shared source store. |
| Human reply/work admission                                                                                | Support with the qualified P17 preparation contract | Commit the exact authorized reply and permitted work effects once, then hand off durable sending intent.                                                |
| Transport and externally observed outcomes                                                                | P6 tenant Resend adapter                            | Display authoritative delivery/recovery state; never infer success from setup or draft save.                                                            |
| CRM identities, relationships, giving and care records                                                    | Their respective Core domains                       | Permission-aware contextual navigation and separately authorized actions; setup verification creates no Party or business interaction.                  |

Setup lives in Support inbox settings, with contextual return from shared integrations and Email Studio. It is not a second credential console or template catalog. Plain fields handle addresses, DNS records and setup instructions; Tiptap serves the accepted reply, note, wording and signature content surfaces. No secret or verification code enters reusable content, private reply drafts, browser persistence, search or ordinary Support history.

## Three explicit amendments to carry forward

### 1. Receiving-purpose credentials under the same connection

P17's existing outgoing Sending-access key remains purpose-limited and domain restricted. D25 adds a separate inbound credential facet to the same tenant connection, with the same protected custody, revision, rotation, revocation and destruction controls. This is an explicit amendment to an outgoing-only key description, not evidence that that description already covered receiving.

Current Resend API-key and OAuth documentation offer Full access for the required non-send reads. The receiving key therefore has provider-level **Full access**. Asym's closed server read allowlist limits its own use; it does not turn that key into a provider-enforced read-only credential. Same-account proof must use exact current registered objects/canary evidence, not labels, hints or incoming metadata. An unproved candidate can perform only bounded account-proof reads before ordinary body or attachment retrieval. No generic HTTP proxy, Support-visible secret, outbound adapter use, fallback account or new OAuth product is authorized. The residual whole-account compromise risk remains explicit and must be qualified through the owner's actual security/incident proof. [Resend API-key permissions](https://resend.com/docs/api-reference/api-keys/create-api-key), [OAuth scopes](https://resend.com/docs/guides/building-a-resend-oauth-client).

### 2. Shared authenticated ingress with owner dispatch

The registered opaque connection endpoint establishes tenant/account/environment and authenticates exact raw bytes before destination parsing. It dispatches registered receiving events to P26 and outbound evidence to P6. Receiving events do not acquire outbound-reducer semantics. Registration changes preserve the required subscription union and stable business deduplication across secret rotation; a webhook per inbox is unnecessary.

Message headers remain untrusted facts inside an authenticated provider event. In particular, header-derived `received_for` does not establish independent SMTP-envelope authority. Exact destination/source qualification is a release gate, with restricted recovery for insufficient or contradictory evidence. Neither Email Studio wording nor CRM matching determines routing authority. [Resend received-email representation](https://resend.com/docs/api-reference/emails/retrieve-received-email).

### 3. Managed Support destination proof within P17

P17 retains ownership of Human reply destination acceptance. D25 adds a typed managed Support route proof variant: exact tenant/account/environment/domain/public address/inbox binding/configuration generation, qualified new-mail and reply-return behavior, accountable monitoring and current authority. P26 produces the evidence; the current authorized, stepped-up P17 manager accepts and pins it. Existing external-mailbox challenges retain their same-initiating-actor rule and protected code handling. Receiving Asym's own challenge cannot self-verify an external mailbox.

Candidate capture and a fixed, inert qualification canary through the existing P17/P6 controlled real-sink path can work in Testing before ordinary inbox activation. This breaks the otherwise circular demand to activate before testing the return path. It does not allow arbitrary test messages, a tenant-editable verification template, a platform sending fallback or ordinary customer mail. A real external controlled mailbox can originate and answer the qualification exchange. Exact provider/account and current-authority proof remains mandatory.

Accepting one inbox destination is not a hidden update of the global Human replies default. Any owner-level default change remains a separate explicit operation with visible impact.

## Complete use and maintenance sequence

1. Staff chooses an existing public address or a new dedicated address with equal prominence and no preselection. Draft save preserves progress without activation.
2. Shared connection owners qualify current receiving credentials and registered ingress. Support establishes safe candidate custody before external forwarding/DNS instructions can cause arrivals.
3. The email administrator performs the applicable outside change; protected provider confirmation and P17 destination proof remain distinct. A completed DNS check alone is insufficient.
4. Testing qualifies new intake and reply return through current exact bindings. Real early messages remain separate from verification traffic with original receipt time, finite custody and no acknowledgement/CRM/work effects before admission.
5. Review shows public incoming address, actual From, Reply-To, managed signature, handling and current readiness separately. Conditional activation records binding, audit and durable continuation together.
6. Real admitted correspondence uses ordinary Support/Tiptap, D18 wording, D23 signatures and D24 shortcuts. P17 prepares; Support admits; P6 dispatches and reconciles. Setup is not a new message-preparation or delivery path.
7. Change, repair, pause, rotation, retirement and restoration preserve exact admitted identities and finite old-return dependencies. Changing a source or signature never rewrites prepared/sent correspondence. Canceling setup does not claim to reverse external forwarding or DNS, discard accepted input, or delete outside copies.

## Secret recovery and evidence correction

The immutable official CLI README at [commit 0155104, line 502](https://github.com/resend/resend-cli/blob/0155104e5960c251f696e2518b76664f5d0ea1b9/README.md#L502) confirms that current webhook GET output is secret-bearing. Earlier contrary search-excerpt interpretation was corrected before this ratification and must not be restored. Capture creation/rotation responses under protected custody; scrub read responses too. A qualified exact-object GET may recover an interrupted owner operation with current authority and correct object/revision proof. This is not a general secret browser, nor a promise of indefinite provider recovery.

## Status and proof

All three amendments are now accepted grooming decisions. Their later propagation into system-wide ADR/OpenSpec/design and implementation belongs to the explicitly authorized next stage; no governing history is silently rewritten here. D25's **50 implementation/release proof groups remain required and unexecuted**. The original two probes and seven synthetic source observations are preserved as limited source evidence. [Current ratification validation](d25-ratification-q26-validation.json) verifies recording, preservation, traceability and stage boundaries, not live provider readiness.
