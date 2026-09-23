> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

# Question 11 — Change email once, guide the selected related changes

> **Explicitly founder-ratified, 7 September 2026.** Conrad accepted the complete corrected journey and execution requirements J01–J12, C01–C22 and A1–A5. Proposal/review wording below is the historical research record; these reviewed requirements are now accepted. Owner-contract implementation and target/provider/browser release qualification remain separate required work.

**7 September 2026 · Phase 25 founder grooming · A and corrected execution explicitly founder-ratified**

**Disposition: Accept with required amendments.** Keep A. Give the donor one calm task with one new-address entry, plainly selected uses, necessary verification and an accurate result for each use. This improves the experience without pretending that changing a login and changing an organization's contact record are one database operation.

This is a researched decision review, journey and evidence record. It is not a PRD, formal specification, implementation ticket or release certification. Q01–Q10 remain ratified. The selected direction is settled; J01–J12, C01–C22 and the five explicit owner amendments below are presented for execution ratification. No GitHub, live-provider or Core runtime change occurred. The only new executable work was isolated synthetic research, using disposable networkless Auth/PostgreSQL containers and no real email delivery.

## Corrected decision to record

> **Q11 — Guide explicitly selected related email changes together.** Email remains the donor-facing sign-in name in Phase 4's email-first account journey. The address is an identifier; verification supplies proof. Preserve the existing stable account, personal donor/Party binding and historical giving. Present actual Sign-in email and My contact email with this organization as distinct source-owned uses. A targeted entry selects its stated use only; an additional permitted personal-contact use requires deliberate selection. Enter the proposed new address once, explain the selected effects, then guide the required proofs and each owner's result in one recoverable task. Do not create permanent mirroring, account merging or cross-organization contact updates.
>
> For the ordinary email-only sign-in change, qualify separate current-inbox authorization and new-inbox possession proofs for the exact request. Reuse the required current proof rather than adding a redundant third sign-in challenge; honor applicable existing stronger-authentication rules. Preserve the exact verified session on the device where verification finishes and explicitly retire the principal's other existing sessions. Reconcile identity-bound permissions through the existing authorization owner before stale authority can admit protected access. Do not promise every existing permission is unchanged.
>
> Complete a selected contact change through its own current authorization, revision and purpose-bound proof. Continue without repeated address entry or redundant acceptance when the original instruction remains valid. Show confirmed, pending, blocked and indeterminate outcomes independently. A completed sign-in change is never rolled back because the contact step fails. Before initiation, Cancel discards the draft; afterward, Finish later leaves the request pending until its qualified expiry. Use a different address requires proved supersession. No cosmetic Cancel, implicit consent, newsletter enrollment, financial effect or historical-document rewrite is allowed.

The recommendation includes A1–A5 below. They are material owner refinements, not hidden implementation details.

## Adversarial check

### What could go wrong with this answer?

A attractive single email field could hide two effects, carry old verification onto a new mailbox, identify a different donor by matching email, or claim completion while Auth is still pending. Old sessions can remain usable after the provider changes email. These are demonstrated mechanisms or explicit owner gaps, not assumptions that the current screen is complete.

### What hidden assumptions are we making?

The ordinary donor still controls both inboxes and can complete the existing identity proof. Email is not necessarily their only contact channel, every organization does not share the same contact address, and one Auth account can have assignments in more than one Tenant. Losing the old inbox is a distinct recovery case. No research establishes that every donor wants all email uses changed together.

### How does this affect the whole product?

Auth owns the sign-in address; the CRM owns the organization's contact revision; Phase 12 owns current permission consequences; Phases 6/17 own message preparation, dispatch and evidence. Staff and missionary surfaces consume those outcomes. Shared deployment does not merge their authority. External missionary newsletters, financial authorizations, receipts and statements retain their existing owners.

### How does this affect the end-user experience?

The donor enters one address, understands its selected uses, sees one next action and receives a truthful result. Contact-only edits remain narrow. Codes support paste/autofill; leaving and returning preserves accepted progress through the owner. Errors do not require starting over or guessing which address now works. A donor does not need to learn CRM terminology to complete the task.

### Does this follow modern best practices?

Yes, as a product judgment grounded in current primary guidance and actual provider behavior: separate identity from a mutable address, require appropriate proof, avoid redundant entry, make links scanner-safe, and distinguish pending from complete. Email-first is Asym's accepted direction, not a claim that email is universally the strongest authentication method. Email codes are not phishing-resistant, and two inbox confirmations do not constitute MFA or establish NIST AAL2 compliance.

### Does this fit Asym’s existing repo and product direction?

It fits ADR-0001's ownership, Phase 4's stable identity/email-first direction, Phase 9's limited contact scope, Phase 12's current authorization and Phase 24's unified portal. It requires explicit reconciliation of Phase 4's overloaded verification field, the Tenant-specific identity-change hook, and Phase 17's Reserved/deferred message contracts. Existing read-only email and strict profile PATCH are safeguards to preserve until proper commands exist.

### Should we adjust the recommendation?

Strengthen A with explicit selected scope, purpose-bound proof, separate durable results, stable claim proof, global-credential security reconciliation and honest provider limits. Keep one guided journey. The strongest alternative—complete the two self-service edits independently with links—is simpler to coordinate but makes a donor retiring an address repeat work and reconcile results themselves. It remains a legitimate narrow path, not the primary combined experience.

## What the research actually establishes

Evidence labels used throughout: **repository fact** means inspected source/contract at the named head; **executed proof** means a recorded isolated experiment; **external fact** means current primary documentation; **inference** is reasoning from those facts; **product judgment** is a recommended choice; **unverified** means a required implementation/provider/browser result has not been demonstrated.

<!-- prettier-ignore -->
| Pattern or precedent | Classification | What Asym should take from it |
| --- | --- | --- |
| Stable principal/profile/Party references, current source authorization | **Durable pattern** | A changed email does not create a new human, legal donor, account claim or gift owner. |
| One task with explicitly selected uses and independently evidenced effects | **Durable pattern** | Reuse donor effort while preserving each owner's authority and recovery. |
| Fundraise Up's associated future-receipt choice | **Useful precedent** | Show relevant related effects; do not copy default selection, universal receipt routing or account ownership rules. |
| Planning Center Services' contact/login distinction; Blackbaud's verification | **Useful precedent** | Name uses and verification states; their separate pages do not dictate Asym's task layout. |
| Existing copied profile email | **Temporary bridge** | A display mirror can exist only with explicit provenance/currentness; it cannot become login truth. |
| `profile.email || donor.email` as one settings field | **Implementation accident** | It obscures which owner supplied the value and must be replaced for this journey. |
| Enabling email in generic profile PATCH, matching all records by new email, or “Update everywhere” | **Conflict with first principles** | These bypass authority, conflate mutable delivery data with identity and create unsafe propagation. |
| Shared Maia fields/checkboxes/OTP wrapper | **Useful precedent** | Reuse the shared components and semantic tokens, then prove the composed journey is accessible. |

Fundraise Up documents a related future-receipt email choice. Planning Center **Services**, specifically, explains that a contact-email change does not itself change login. Blackbaud distinguishes authentication details and verification. These are documented workflows, not comparative user research showing that one vendor achieves the best donor outcomes. [Fundraise Up](https://fundraiseup.com/docs/donor-portal-experience/), [Planning Center Services](https://help.planningcenter.com/en/142864-update-your-profile.html), [Blackbaud](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/admin/content/id-auth.html).

Google's named address uses and Apple's deliberate primary-email change are useful consumer precedents for clear effects. Do not import their alias inventories, fallback policies or waiting periods. Givebutter's deliberate plan-linking reinforces that an address edit is not automatic ownership of matching gifts. [Google](https://support.google.com/accounts/answer/6316959?hl=en), [Apple](https://support.apple.com/en-us/109353), [Givebutter](https://help.givebutter.com/en/articles/4529176-how-to-edit-and-manage-your-recurring-donation).

OWASP supports fresh proof and careful handling of an email change, but its password/MFA recipes are not authority to require a new password for Asym's email-first donors. NIST's assurance framework restricts email as an out-of-band authenticator while distinguishing address-validation/recovery uses. Q11 makes no stronger-assurance conformance claim and adds no mandatory passkey/MFA enrollment. [OWASP Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), [OWASP Email Verification](https://cheatsheetseries.owasp.org/cheatsheets/Email_Validation_and_Verification_Cheat_Sheet.html), [NIST SP 800-63B-4](https://pages.nist.gov/800-63-4/sp800-63b.html).

## Mapped donor journey — J01–J12

**Illustrative situation, not measured ministry behavior:** Maria is signed in to Global's donor portal. She is retiring an old personal address and wants the new address for sign-in and her contact information with Global. She still controls both inboxes. Her history, receipts and recurring gifts belong to the same account and legal donor throughout.

<!-- prettier-ignore -->
| Stage | What Maria sees and does | Required behavior underneath |
| --- | --- | --- |
| J01 — Start with the right context | Open Change sign-in email or Edit my contact email from the relevant settings section. See the actual current value. | Resolve the current account and this organization's permitted personal contact separately. Loading/unavailable does not become an editable blank or the other owner's fallback. Represented giving is not contact-edit permission. |
| J02 — Select the related use | The targeted use is selected. An optional “Also update my contact email with Global” is clear and initially unselected unless Maria already explicitly chose it. | A generic Change email entry shows the two permitted uses inline without a separate chooser page. Equal current strings do not imply consent to change both. Do not enumerate other Tenants. |
| J03 — Enter once and review effects | Enter the new address once. See Sign-in: old → new and My contact email with Global: old → new for selected uses. | No send/mutation on typing, blur, checkbox selection or rerender. Validate one supported mailbox consistently. A semantic no-op does not create a fake change or verification email. |
| J04 — Understand the security step | Read concise copy about confirming the old and new inboxes, keeping the completing device signed in, and signing out other devices. Then Continue to verification. | For Both, confirm both lanes' known readiness before initiation. Record exact immutable selected intent, actor, current revisions and correlations. Honor existing stronger-auth/managed-identity rules without surprise enrollment. |
| J05 — Follow one clear next action | See “Confirm your current email” with the exact intended address and a clearly labelled code/link action. Current and proposed addresses remain distinguishable. | Normal email-only Auth change requires distinct current/new proofs. The required current proof can satisfy fresh authorization; do not add an unnecessary third challenge. Contact-only never invokes Auth change and uses its own exact contact proof. |
| J06 — Complete verification accessibly | Paste/autofill a whole code, or open the branded confirmation page and deliberately confirm. If she confirms the new inbox first, show that progress and the remaining old-inbox action. | Either supported order is valid. GET/HEAD/preview/scanner retrieval is inert at the Asym landing. Redemption is deliberate POST bound to the exact actor/request/address/purpose. Never treat a raw provider confirmation GET as scanner-safe. |
| J07 — Confirm the actual sign-in result | See Pending verification until the provider confirms the new current address. Then “Sign-in email changed,” with a separate security-finishing state if needed. | Neither HTTP200, USER_UPDATED nor a callback parameter proves completion. Reconcile current provider state, stable ID, required P12 consequences and exact session cleanup. Never silently restore the old email on failure. |
| J08 — Finish the selected contact change | If selected, the same new address is used for My contact email with Global without asking her to retype it. | Only the contact owner's command may apply the current revision. Reuse mailbox proof solely through a qualified same-request exact-purpose certificate. If that mapping cannot be proved, require the necessary clearly explained contact proof rather than silently weakening it. |
| J09 — Show the real result | Two concise result lines when both finish. If only sign-in changed: “Your sign-in email changed. Your contact email with Global still needs attention.” Offer the actual next action for that step. | Completed effects remain completed. Retry only incomplete currently admitted work. For an unknown outcome, read back the original request and say “Checking the change”; do not issue a fresh change or show unproved failure/success. |
| J10 — Leave and return truthfully | Before initiation: Cancel. After initiation: Finish later. The pending summary says the current address remains in use until the required verification completes. | Leaving does not invalidate sent proofs. Once one proof succeeds, the remaining valid deliberate proof may complete the request. Recover accepted progress through its owner; ordinary unaccepted drafts have only the promised bounded retention. |
| J11 — Correct, expire or recover | Use a different address starts a clearly superseding request. Expired proof gets a governed restart. “I can't access my old email” leads to the qualified recovery route. | Supersession invalidates old proofs and resets required progress. Do not label sending the current email, closing the page or an admin write as Cancel. No duplicate account, unverified staff relink, account merge or verification bypass as recovery. |
| J12 — Continue with confidence | Return to the relevant settings or donor destination. On the next sign-in, use the new address. Contact results and any remaining action remain understandable. | Preserve history and normal source-authorized access; re-prove sensitive/restricted rights as required. Dispose of stale same-user caches and late responses. Preferences, newsletter enrollment, financial authorizations and historical documents retain their own truth. |

**Completion copy, illustrative:** “Sign-in email changed. Use maria.new@example.invalid next time.” “Contact email with Global updated.” Add “Other devices have been signed out” only after the qualified cleanup is confirmed. If verification finishes on another device, that is the retained verified session; do not incorrectly promise the original browser also stays signed in. Bind that session to the same principal and exact request before cleanup; a browser signed in as somebody else cannot silently inherit or display Maria's task. The original browser can sign in and resume the same accepted task without replaying completed changes. Necessary security completion work cannot be hidden under an optional contact-sync spinner.

**Contact-only variation:** Maria changes only Global's personal contact address. Retain her login and other-device sessions. Prove the new contact address for this exact purpose and apply through the contact owner. Her stable claim binding remains intact; no identity-email-change event is emitted merely because the CRM address changes. New-contact proof does not opt her into marketing, clear a hard bounce or alter receipt delivery policy.

**Different current addresses:** Show both before/after values. Reuse the proposed address only for selected uses. Do not force the existing contact and login to match first. If one selected use becomes ineligible after acceptance, preserve completed effects and explain the remaining exact conflict; do not apply a substitute contact, new Tenant or changed address silently.

## UI execution that makes the journey feel easy

Use one short responsive workspace in the shared **shadcn `base-maia`** system, Base UI primitives where the shared component uses them, existing zinc/semantic tokens and shared Field, Input, Checkbox and Button composition. No app-local design-system fork, nested modal chain, new universal settings framework or permanent large stepper. A short progress line is enough when verification actually has multiple steps.

Keep headings in plain sentence case, comfortable spacing, clear action priority and complete inspectable addresses. Explain extra detail only beside the action it affects. Pending verification is a neutral state; correction errors identify the field and preserve input. A successful poll does not need a toast. Only meaningful status transitions are announced, and focus moves for an explicit navigation/error that needs attention, not every rerender.

Use email-appropriate keyboard/autocomplete, allow paste and correction, and expose a clear accessible label. Code entry supports full-code paste, one-time-code autofill and ordinary keyboard editing. The existing shared OTP wrapper uses **input-otp1.4.2**, not a Base UI OTP primitive; retain it if the actual composition passes. Six visual slots must not impose six separate transcription tasks. At narrow width and200/400% zoom, labels, domains, errors and actions remain readable without horizontal form scrolling. Browser Back, the mobile keyboard, reduced motion and screen-reader browse/focus behavior require real proof. [shadcn Field](https://ui.shadcn.com/docs/components/base/field), [shadcn Input OTP](https://ui.shadcn.com/docs/components/base/input-otp), [WCAG Accessible Authentication](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html).

Do not ask Maria to enter the same visible address twice. Use a clear review and actual inbox proof. Preserve valid information through the supported same-process journey; do not interpret accessible redundant-entry guidance as a mandate to persist secrets across sessions. Show specific progress without announcing every countdown tick. [WCAG Redundant Entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html), [WCAG Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).

## Five owner amendments requiring explicit ratification

### A1 — Separate established ownership proof from current contact proof

Phase4:146/154/166 currently uses `donors.email_verified_at` for claiming, reveal and contact verification. If a contact-only edit retains that timestamp, the new mailbox looks verified without proof. If it clears the only timestamp, an unchanged established account may lose access. Neither is acceptable.

> An established principal/profile-to-donor/Party claim binding and its accepted proof are distinct from the current organization-contact email and its verification revision. A new address never inherits an old address's verification. Contact-only change does not erase valid established claim proof or invoke the Auth identity-change event. Reads use stable binding plus current authorization; proof for a new contact is bound to its exact address, Party, purpose, request and revision.

This requires a narrow Phase4/9 proof/revision amendment and safe migration, not a new address book or the deferred generic `contact_points` model. Preserve stable principal IDs, donor/Party links, legal donor and financial/document evidence. A new person obtaining an old mailbox cannot overwrite an already established donor binding. A collision or known ambiguous/retired binding uses the existing exception owner; no oldest-match guessing. Do not promise detection of unknowable mailbox recycling: Phase4 still permits initial claiming of a clean unclaimed record by fresh mailbox possession. Changing that broader rule would require its own explicit founder decision.

### A2 — A bounded request with real independent owner steps

> Before the first Auth/contact/message effect, persist the exact selected intent, trusted actor, launch Tenant/environment/host, permitted personal Party/contact, expected identity/contact revisions, proposed normalized address, proof/operation correlations and qualified expiry. It records intent, not success. Each owner step keeps its own admitted command and durable result. Accepted scope is immutable; changed instructions form a reviewed successor/residual request. Do not replay or reverse a completed step to compensate for another result.

Use a narrow identity/contact request kind in the owning facilities, only where their semantics fit. Do not disguise it as account claiming, reuse a financial replacement parent or invent a generic workflow engine. Sign-in transitions serialize by shared principal; contact changes compare the exact same-Tenant contact revision. Two portals can race one shared credential, while unrelated contact edits should not be globally serialized. Email-value-only comparison is insufficient: the native test demonstrated an A→B→A race that fools it. Use monotonic owner revisions.

Finish later is the deliberate post-initiation lifecycle; a provider Cancel control is not required. Different-address supersession was positively observed locally. Actual same-address resend, proof expiry, recovery cancellation and every target integration still require their specific contract proof; do not generalize one observed replacement into all operations.

### A3 — Shared-credential permission and session reconciliation

The identity change affects the shared account, while #686's named hook is Tenant-specific. It cannot safely update only the portal that launched the request.

> One accepted shared-credential change reaches every affected existing Tenant assignment through the existing Phase12 identity/epoch owner. The donor sees no other-Tenant membership inventory and no other-Tenant contact updates. Ordinary grants survive where current source rules permit; sensitive-tier grants are suspended/re-attested and restricted named grants rechecked. Contact-only change does not trigger this path. Before the external identity change can outrun local security reconciliation, the existing policy decision point honors the exact identity transition/current basis. All supported Auth writers and direct-provider paths must satisfy that boundary.

An identity transition fence is a narrow owner input that prevents new protected admission on an obsolete basis, not a second permissions engine. Do not hold a database transaction open while the donor checks email. Reconcile provider ambiguity and affected Tenant epochs durably. An uncompleted attempt must not permanently revoke ordinary access or mint new grant authority when its temporary fence is released.

> After sign-in email is confirmed, retain the exact verified current provider session and explicitly retire that principal's other existing sessions through the Auth owner. Confirm both the retained session and cleanup result. A missing session, SDK no-error, local logout or provider email update alone is not cleanup proof. New protected access still requires current authorization; token signature validity or expiry alone does not establish it.

Local A14/A15 prove the mechanism at provider GET/user and refresh endpoints. They do not prove every PostgREST/storage/service route rejects stale authority. The policy applies to this account's existing sessions across its organizations, which must be explained before starting without exposing other memberships. New valid sign-ins after the operation are a separate lifecycle; repeated reconciliation must not indefinitely revoke newly authorized sessions.

`logout-others` is time-relative, not an API with a business-request idempotency key. Serialize its bounded cleanup under the same identity transition and retain the exact finishing session. While its outcome is unresolved, newly minted other sessions cannot be admitted to protected Asym access on an obsolete or unresolved identity basis; do not claim the provider cannot mint them. Once security completion is durably confirmed, no retry or stale worker may invoke cleanup for that request. An empty session snapshot alone cannot establish completion if a timed-out provider call could still act later. Prove provider completion/readback and admission ordering, including delayed-call races, before qualifying this lane. If that evidence is unavailable, do not fabricate exactly-once behavior or mark the security step complete. No general session-management product is required.

### A4 — Complete the owning contact and message contracts

Phase17 currently marks `identity_email_change_v1` Reserved and defers contact/security completion notices. A polished screen cannot activate those purposes by calling another sender.

> Qualify the exact current/new-inbox actions, contact proof and security/contact completion occurrences through the identity/contact owners, Phase17 preparation and Phase6 dispatch. Before enabling a lane, freeze its recipients, purpose, proof mapping, occurrence identity, expiry, idempotency, security consequence and recovery. No direct SMTP/Resend/default-Auth sender bypass or unsupported alternate recipient/channel is permitted. Reuse new-inbox proof for a selected contact only under an explicit exact-purpose same-request mapping.

> Preserve authored communication preferences and higher restrictions. A changed contact address is neither consent nor suppression removal. Future dispatch uses exact admitted Party/contact revision and purpose, not Tenant-plus-email first-match lookup. Previously prepared recipients/payload remain frozen; stale unstarted work is suppressed/expired or deliberately source-reissued under a new identity, never retargeted in place. Already-admitted or unknown delivery is reconciled honestly.

The recommended minimum message journey is precise: normal Auth change sends its two distinct verification messages, then one source-owned security completion notice to the previously verified sign-in address. That notice uses minimal content, a safely masked new address and the qualified account-security help destination; it does not expose other organizations or provide a mutation-on-open undo link. The new address receives the verification it actually needs and the completing donor sees the result in the portal; add no discretionary duplicate success email. Contact-only sends its exact new-contact verification and presents its confirmed result in the portal, without implying a login change. Both reuses the new-inbox proof only where the exact-purpose mapping is qualified, avoiding an unnecessary third verification message. If an existing applicable security policy requires additional notices, explicitly reconcile that owner requirement rather than silently bypassing it.

The old-address security notice is an explicitly proposed identity-owner occurrence/admission under A4. Canonical Phase17 maps the native provider `email_changed_notification` to current `user.email`; do not simply readdress that native purpose using `old_email`. Qualify the old-address occurrence or an explicit successor contract, and preserve/reconcile any independently required current-address native notice. This recipient-policy change is part of the visible owner amendment, not a template-edit shortcut.

Message delivery remains independent of identity completion: a failed completion notice cannot roll back Auth, bypass suppression/security restrictions or redirect to an unselected address. Preserve its exact failed/unknown delivery evidence and owner recovery. No missionary notification, external newsletter enrollment or new receipt-policy control is introduced. Unsupported combinations fail readiness before Both starts; a separately qualified contact-only lane may remain available.

### A5 — Describe credential-availability disclosure honestly

The local provider returns authenticated `422 email_exists` for an already registered Auth address before inbox verification. A generic Asym message does not remove that direct endpoint's signal.

> Public guest attribution and claim/setup retain their uniform non-enumeration contract. In the authenticated sign-in-email-change lane, the adopted provider may reveal that a requested credential address is unavailable. Asym adds no donor, profile, other-account or Tenant-membership details, never uses this signal to select or merge an identity, and documents applicable abuse controls at every reachable endpoint. Accept this narrow provider assurance boundary explicitly; do not claim zero authenticated credential-existence signal.

This is not a demonstrated disclosure of giving or Tenant membership. The recommendation accepts a bounded credential-availability limitation consistent with the inspected provider, with required direct-endpoint abuse qualification. If the desired policy instead prohibits that signal even to an authenticated caller, this lane remains unqualified until a supported deployment/provider solution is positively proved. Hiding a publishable key or limiting only the UI wrapper does not solve it. No new gateway is presumed.

## Ownership, storage and lifecycle

<!-- prettier-ignore -->
| Fact | Authoritative owner | What is persisted or checked |
| --- | --- | --- |
| Current/pending sign-in address and provider session | Phase4 identity owner using Auth execution evidence | Stable principal ID, exact provider currentness and correlation; a profile mirror is display-only. |
| Existing claim/access binding | Phase4 with Phase9 Party relation and Phase12 current authorization | Accepted historical claim proof and stable same-Tenant donor/Party binding, independently of mutable contact. |
| Current organization contact | Phase4/9 admitted personal-contact command | Exact normalized/raw-supported address, monotonic contact revision, proof and provenance. No caller-set verified flag. |
| Selected combined task | Narrow identity/self-service owner | Immutable accepted uses and expected revisions; independent child results and bounded recovery, not duplicated email truth. |
| Permission consequences | Existing Phase12 policy decision point and governance epochs | Principal transition/currentness plus affected Tenant outcomes; no cache/read model becomes an authority. |
| Verification and notices | Source producer → Phase17 preparation → Phase6 dispatch | Exact recipient/action/purpose and immutable occurrence; dispatch evidence distinct from proof or human reading. |
| Consent and suppression | Existing consent owners and delivery-safety evidence | Authored choices preserved; current eligibility re-evaluated against the new exact contact revision. |
| Gifts, commitments, legal donor and documents | Existing Phases7/13/16/18/19 | No mutation caused by this task. Future purpose-specific recipients are separately governed. |

The bounded task's presentation states are **draft; accepted/pending proof; applying/reconciling; completed; incomplete with a known next action; indeterminate; expired; superseded**. These describe existing owner steps rather than replace their domain lifecycles. A draft can be discarded. Accepted scope cannot be edited in place. Verification may complete an already accepted instruction without a redundant final Save. Indeterminate is not a terminal failure or permission to start again. Superseded proofs cannot affect a successor. A completed step is immutable history; changing back is a new instruction. No state name grants permission.

Every apply rechecks actor, subject, selected purpose, request/revision, current identity/permission state and same-Tenant contact relationship. Atomic local intent/proof/contact updates use owner transactions and constraints. Provider effects and messages cannot join one PostgreSQL transaction; recover them by exact durable effect correlation and authoritative readback. Append evidence without storing bearer tokens in ordinary history. Temporary proof retention and cleanup follow the qualified purpose, never an invented permanent email/token archive.

The following storage invariants must be implemented by those owners; physical table names and a new generic schema are deliberately not frozen:

- Required scope, stable actor/subject, accepted selected uses, normalized proposed mailbox, request kind and expected revisions are non-null when intent is accepted. A previously absent contact address is a distinct source state; missing old contact is not an empty verified string. A request must select at least one currently eligible use. Sign-in/contact step cardinality is at most one each per accepted two-use request.
- Every Tenant-owned Party, donor, contact and proof relationship carries the same Tenant constraint. The shared Auth principal is referenced as a global principal with separately proved Tenant membership, not falsely made Tenant-local. Auth's global credential uniqueness and Phase4's same-Tenant donor normalization/uniqueness are distinct constraints; a collision never transfers identity.
- Trusted server context supplies actor, scope, attribution and authority. Caller references cannot set author/owner/Tenant, verification timestamps, grant state or success. Effective old-row and resulting-row authorization plus immutable accepted scope prevent a permitted update from moving a request/proof into another actor, Party or Tenant. Apply equivalent checks to privileged services, functions and views; inspect actual grants and execution owner instead of assuming RLS protects service-role writes.
- Monotonic identity/contact revisions, exact request/purpose/proof uniqueness, single-use proof consumption and same-key/different-content rejection prevent stale writes. The active Auth-transition invariant is global per principal; contact contention is exact per scoped contact. Timestamp equality or email-string equality is not revision control.
- Accepted instruction/proof/result attribution is append-only or immutable as its existing owner requires; correction appends superseding evidence. Deleting a temporary request must not cascade into an established identity, Party, gifts, documents or necessary security history. Privacy erasure/anonymization and proof retention follow their existing owner policy rather than uncontrolled cascade delete.
- Index stable request lookup, current principal transition, current scoped contact revision and due reconciliation/expiry work. Validate plans with production-shaped cardinality. This task adds no money columns, currency conversion or financial precision changes. Do not create a uniqueness rule from a nullable legacy email without the owner's duplicate/normalization migration.

## Full 22-category adversarial review

These are proposed execution requirements for A, not an implemented contract or formal PRD. Severity describes consequences; likelihood distinguishes observations from target risks. Root executed 76 native migrations with 10 local assertions and 15 isolated GoTrue observations. Those prove their exact fixtures, not target Asym/P12, PostgREST, browser, message delivery or hosted behavior. A1–A5 are the explicit owner amendments/assurance boundaries described separately.

### 01 — Problem validity, necessity, and alternatives

**Material concern: No additional concern with the selected need. What/why:** Retiring an address can require two changes; A preserves that task. Separate named editors remain a credible alternative for purpose clarity and lower coordination complexity. **Severity:** Not applicable to the need. **Likelihood:** No measured Asym usability advantage is claimed. **Evidence:** Q11's selected example; P17:473 explicitly leaves donor contact-change command semantics unfinished. **Impact on A:** Keep it; do not re-ask A/B. **Permanent fix:** Make each selected purpose and outcome clear without treating one address as every use.

> C01 — Provide one guided email-change task for the actual human's sign-in email and this organization's currently authorized personal contact use. Explicitly select the uses; permit different addresses. Add no automatic synchronization, purpose-destination product or other-organization contact changes.

### 02 — Brittleness

**Material concern: Yes. What/why:** Mutable email strings, fallback displays and email-only comparison can conceal intervening changes or identify the wrong request. **Severity:** High. **Likelihood:** Current profile-or-donor fallback is observed; native email-only CAS ABA was reproduced. **Evidence:** model.ts:450–455; native fixture; A1/A2. **Impact on A:** Requires stable identities/revisions. **Permanent fix:** Bind request, proof, display and operation to source IDs and monotonic revisions; do not infer continuity from matching old text.

> C02 — Read sign-in and contact current/pending states separately from their owners. Bind drafts, proofs and accepted steps to stable principal/Party/contact identity and expected revisions. Email returning to an earlier value is not the original revision. Source refresh cannot silently substitute a different target or proof.

### 03 — Technical debt

**Material concern: Yes. What/why:** Adding email to generic profile PATCH or duplicating Auth/contact state would conceal distinct ownership behind one Save. **Severity:** High. **Likelihood:** Target services are absent; strict existing patches provide a useful boundary. **Evidence:** settings-patch.ts:3–18; profile/index.ts:15–29; P4:138–150; P17:473. **Impact on A:** Needs narrow source completion. **Permanent fix:** Extend proper owners and retain one bounded task coordinator; retire misleading display paths after qualified cutover.

> C03 — Complete typed identity and personal-contact commands under their existing owners. App routes remain thin. The guided task composes independent operations/results; generic profile PATCH, direct Auth mirror edits, unrelated claim commands and a second identity/contact ledger cannot implement it.

### 04 — Edge cases

**Material concern: Yes. What/why:** Case/whitespace, Unicode, aliases, existing accounts, missing addresses and changed selections can produce inconsistent verification or misleading no-ops. **Severity:** High. **Likelihood:** Multiple current normalizers exist; exact target boundaries remain unproved. **Evidence:** P4:181; #506:18–19; normalize.ts:1–6; email/address.ts. **Impact on A:** Requires exact input semantics. **Permanent fix:** One supported mailbox parser/canonicalizer and safe collision handling; never use header extraction as identity validation.

> C04 — Normalize and validate exactly one supported mailbox consistently across uniqueness, proof, provider requests and contact apply. Preserve permitted display form without unproved dot/plus rewriting. Reject ambiguity safely; retain invalid input. A source-proved no-op creates no new identity event, verification claim or success-shaped change.

### 05 — Footguns

**Material concern: Yes. What/why:** Checking Both, closing the page or selecting a current email can be mistaken for authorization, cancellation or completed work. **Severity:** High. **Likelihood:** GoTrue current-email submission leaving pending change intact was observed. **Evidence:** local Auth observations; A2; Q11 scope. **Impact on A:** Clarifies stage-specific controls. **Permanent fix:** Explicit review, truthful pending status and no unsupported Cancel label.

> C05 — Review exact selected uses before effects. Before initiation, discard cancels only the proposal. After initiation, Finish later leaves the request pending until qualified expiry; it does not cancel. Use a different address requires proved supersession. No current-email no-op, password reset, admin reassignment or arbitrary Auth-table cleanup masquerades as cancellation.

### 06 — Tenant safety

**Material concern: Yes. What/why:** A shared credential has wider identity impact than the launch Tenant, while contact and represented permissions remain scoped. **Severity:** Critical. **Likelihood:** Structural source boundary; target cross-Tenant integration unproved. **Evidence:** P4:133; P24 D57; #686's Tenant-specific callback. **Impact on A:** Requires explicit A3 integration. **Permanent fix:** Coordinate principal change privately through each affected permission owner; do not fan out contact edits or reveal other memberships.

> C06 — Derive the actual principal, launch Tenant/environment/host and permitted personal contact subject server-side. Contact-only change touches no Auth identity or other Tenant. A shared sign-in change reaches every affected existing Tenant's P12 reconciliation without exposing their identities, grants or contacts to the donor.

### 07 — Database, RLS, and authorization safety

**Material concern: Yes. What/why:** Loose references, transferred verified flags or stale-session access can bypass correct-looking UI. **Severity:** Critical. **Likelihood:** Native fixtures establish limited current behavior; target schema/doors remain unproved. **Evidence:** P4:146/154/166; P12:177–185; native10 assertions. **Impact on A:** Requires A1/A3 and actual enforcement. **Permanent fix:** Proper scope keys, versioned proof, constrained commands and equivalent checks at every reachable door.

> C07 — Enforce trusted scope, same-Tenant references, proper principal bindings, monotonic revisions, closed states and semantic uniqueness. Browsers cannot write proof, claim binding, success or Auth mirrors directly. Verify effective grants, RLS USING/resulting-row checks, functions/views and privileged paths. Provider session tests alone do not certify PostgREST or Asym authorization.

### 08 — Overengineering

**Material concern: No additional system is necessary. What/why:** A global address book, workflow platform or replacement authentication stack would exceed this task. **Severity:** Moderate if introduced. **Likelihood:** Conditional design temptation. **Evidence:** P9:377–378 defers generic contact normalization; existing owner boundaries and A1/A2 suffice logically. **Impact on A:** Keep bounded. **Permanent fix:** Add only required typed request/proof/recovery extensions; reuse appropriate primitives without false ownership.

> C08 — Build only the reviewed two-use task and narrow owner amendments. Add no generic contact_points product, permanent email-sync relation, identity graph, new passwordless method, broad workflow engine or speculative provider gateway. Required durable request/proof and causal access enforcement remain mandatory owner work.

### 09 — UX/UI and user friction

**Material concern: Yes. What/why:** One generic Email field or Done result can hide which address changed, where verification went or what remains. **Severity:** High when access/task completion is blocked. **Likelihood:** Current single read-only field is observed; target usability untested. **Evidence:** settings/page-client.tsx:328–345; model fallback; A's example. **Impact on A:** Requires a complete accessible journey. **Permanent fix:** Purpose-specific labels, fully inspectable authorized addresses in the signed-in task, privacy-safe masking where the delivery/security context requires it, independent stages and reachable recovery.

> C09 — Show sign-in versus this organization's contact use plainly, with exact selected scope, current/pending values and independently evidenced outcomes. Preserve safe input and focus through errors/returns. Use exact Maia/Base UI, keyboard/mobile/screen-reader support and restrained status. No generic Done or Changed message hides unfinished selected work.

### 10 — Source of truth, ownership, and domain invariants

**Material concern: Yes. What/why:** Email is a mutable identifier, not the person or access owner. An overloaded verification field can falsely verify new contact or erase established claim proof. **Severity:** Critical. **Likelihood:** Explicit P4 contract conflation; target fix absent. **Evidence:** P4:128/146/154/166; P9:377–378; A1. **Impact on A:** Requires explicit owner amendment. **Permanent fix:** Separate established binding/proof from current contact revision/proof.

> C10 — Preserve the immutable principal and established profile/donor/Party claim binding when either address changes. Current contact verification is revision-bound and separate from accepted claim/access evidence. New contact inherits no old verified flag; clearing its verification cannot erase established login proof. Money, legal donor and issued document facts remain unchanged.

### 11 — Hidden coupling

**Material concern: Yes. What/why:** Contact edits can accidentally transfer consent, clear suppression, redirect queued mail or change document access. **Severity:** High/Critical. **Likelihood:** Current address-only consent fallback is observed; target miscoupling conditional. **Evidence:** consent.ts:118–124; P17:1457/1742/2614; Q07/Q08. **Impact on A:** Keeps communication owners independent. **Permanent fix:** Exact Party/contact-revision/purpose decisions and immutable prepared recipients.

> C11 — Preserve authored On/Off choices and higher restrictions; contact change creates neither opt-in nor unsubscribe nor suppression removal. Producers re-prove future delivery eligibility for the new contact revision. Frozen queued recipients are never rewritten; stale work is suppressed/expired or owner-reissued. Receipt policy, issued facts, Updates hiding and external newsletters do not change.

### 12 — Failure modes

**Material concern: Yes. What/why:** Lost responses and independent owner failures can leave one use changed while a blanket error invites duplicate work. **Severity:** High. **Likelihood:** Expected distributed failure; target recovery unproved. **Evidence:** independent Auth/contact ownership; local provider observations; A2. **Impact on A:** Requires durable per-step outcomes. **Permanent fix:** Resolve original operation identities and expose only source-admitted residual actions.

> C12 — Distinguish preparing, verification required, pending, confirmed, blocked, failed, expired, superseded and indeterminate for each selected step. Persist correlation before effects. Recover the original operation after uncertainty; never blindly repeat a successful step or auto-reverse it. Known ineligible selected steps prevent a misleading Both start; later partial results remain explicit.

### 13 — Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: Yes. What/why:** Two Tenant-origin requests, resend, old proofs or concurrent contact changes can overwrite newer intent. **Severity:** Critical. **Likelihood:** Native ABA and provider supersession behavior were exercised; integrated races unproved. **Evidence:** A12 invalidates old proofs/resets progress; A13 supports either proof order; A2/A3. **Impact on A:** Requires exact serialization. **Permanent fix:** Principal-scoped Auth admission, contact-scoped revisions and bounded supersession.

> C13 — Serialize Auth changes against the shared principal revision and contact changes against their exact scoped revision. Bind proof/acceptance to immutable request content and expiry. Same-key changed content conflicts. Supersession invalidates old proofs and resets required progress; late events cannot revive predecessors. After commitment, changing back requires a new reviewed request, not rollback.

### 14 — Data integrity risks

**Material concern: Yes. What/why:** A reused inbox, duplicate email or current contact string can be misread as proof of another person's historical donor ownership. **Severity:** Critical. **Likelihood:** Duplicate-oldest matching exists; takeover of the target was not demonstrated. **Evidence:** donor-matching.ts:203–223; P4 no-guess/binding rules; A1. **Impact on A:** Strengthens claim collision guards. **Permanent fix:** Current established binding wins; known conflicts use existing exception handling.

> C14 — Mailbox possession never overwrites an existing principal/Party claim binding, merges accounts or selects another donor. Known retired, reassigned, conflicting or ambiguous evidence uses the identity owner's exception path. Preserve P4's separately governed initial unclaimed-record rule; do not promise detection of unobservable inbox recycling or silently invent universal staff identity checks.

### 15 — Security and privacy risks

**Material concern: Yes. What/why:** Old sessions/proofs, leaked credentials and direct provider availability responses remain security surfaces beyond app copy. **Severity:** Critical. **Likelihood:** Direct email_exists and old-session survival after change were observed. **Evidence:** Auth A14/A15 later prove exact logout-others fixture behavior; P12; A5. **Impact on A:** Requires explicit session and assurance policies. **Permanent fix:** Current verified-session retention, other-session retirement, protected proof handling and honest disclosure limits.

> C15 — After credential change, retain the exact newly verified current session and retire other existing Auth sessions through the qualified owner path. Enforce the same causal P12 boundary at all supported writers/doors; do not infer Asym/PostgREST denial from GoTrue alone. Only the qualified protected-action protocol transports its required capability; raw provider credentials never enter ordinary URLs, browser persistence or telemetry. Explicitly qualify authenticated credential-availability disclosure without adding donor/Tenant details.

### 16 — Scalability and performance risks

**Material concern: Yes. What/why:** Unbounded assignment reconciliation, repeated verification/send loops or per-address probing can overload identity/message owners. **Severity:** High during saturation. **Likelihood:** Conditional; no production workload was measured. **Evidence:** P12 per-Tenant epochs/no synchronous principal fanout for group changes; P17 bounded hook/dispatch contracts. **Impact on A:** Requires proportionate bounded work. **Permanent fix:** Durable scoped processing and admission fences that remain effective during backlog.

> C16 — Bound request/proof/resend work, source reads and affected-assignment reconciliation under published owner budgets. Coalesce exact repeats without losing security effects; rate/abuse controls must cover actual reachable provider paths. Backlog never permits stale sensitive access or invents completion. No global contact fanout or arbitrary production-capacity claim follows from local proof.

### 17 — Operational burden

**Material concern: Yes. What/why:** Staff may be asked to repair ambiguous identity, override verification or reset email directly when source state is unclear. **Severity:** High. **Likelihood:** Conditional; current UI routes all email changes to support. **Evidence:** settings/page-client.tsx:345; P4 exception owner; provider pending no-op. **Impact on A:** Requires bounded truthful recovery. **Permanent fix:** Self-service for qualified normal cases; proper security/identity help for exceptions.

> C17 — Keep normal qualified changes self-service and diagnose the exact pending/failed owner stage. Lost-inbox, collision or suspect requests use existing qualified account-security/identity recovery, with minimal safe context. Staff cannot proxy donor proof, merge on email similarity, perform raw SQL/admin-email fixes or promise an unproved cancellation capability. Do not create a new helpdesk product.

### 18 — Observability and auditability gaps

**Material concern: Yes. What/why:** Provider request success can be mistaken for completed change; excessive email/token logging becomes another sensitive store. **Severity:** High. **Likelihood:** Conditional target risk; existing source requires audited identity transitions. **Evidence:** P4:109/146; P17 immutable message/result contracts; A2. **Impact on A:** Requires precise minimized evidence. **Permanent fix:** Separate technical stages, accepted identity/contact facts, access reconciliation and delivery outcomes.

> C18 — Record trusted actor, exact request/step/scope/revision and source outcomes with required owner audit. Track pending age, reconciliation failures and stale-proof rejection using minimized references, not tokens or raw private payloads. A sent message proves neither possession nor completion; a page visit proves neither consent nor acknowledgment. Name monitor owners, thresholds and responses.

### 19 — Dependency and integration risks

**Material concern: Yes. What/why:** Secure-email-change alone does not guarantee both inbox proofs; Reserved messages or generic callbacks cannot supply missing source semantics. **Severity:** Critical. **Likelihood:** Local GoTrue configuration distinction was observed. **Evidence:**15 Auth observations; P17:452/470–473/1090; #886; A4. **Impact on A:** Requires positive lane qualification. **Permanent fix:** Exact current/new proof configuration and adopted source/message/host contracts.

> C19 — Qualify the normal Auth-change lane for both bound current- and new-inbox proofs; the demonstrated configuration requires autoconfirm=false and secure-email-change=true. Do not apply that Auth ceremony to contact-only changes. Complete Reserved/deferred producer contracts and P24 host binding before activation; generic callbacks, provider defaults and untested configuration do not prove readiness.

### 20 — Migration, rollout, and upgrade risks

**Material concern: Yes. What/why:** Reinterpreting verified_at, old clients or bypass writers can restore the original claim/contact confusion after the new UI ships. **Severity:** Critical. **Likelihood:** Target cutover conditional; current/target contracts differ materially. **Evidence:** P4/#506/#509; strict patches; A1–A4. **Impact on A:** Requires owner-first adoption. **Permanent fix:** Inventory every writer/reader and qualify explicit proof migration and containment.

> C20 — Reconcile owner contracts/issues and migrate claim/contact proof only from trustworthy evidence, never email equality or a current verified account. Qualify every supported identity writer, strict client contract and read/dispatch path before activation. Unsupported versions fail safely. Containment preserves completed steps, immutable history and security fences; rollback never restores unsafe mirrors or guesses missing proof.

### 21 — Testability, traceability, and proof

**Material concern: Yes. What/why:** Native fixtures and a local Auth server cannot certify the actual protected donor journey, cross-owner races or hosted session enforcement. **Severity:** High. **Likelihood:** Present evidence boundaries make this gap explicit. **Evidence:**76 migrations/10 native assertions;15 GoTrue observations; unimplemented target seams. **Impact on A:** Retain required proof as activation gates. **Permanent fix:** Trace exact clauses to real target source and accessible end-to-end tests.

> C21 — Require actual target Postgres authorization/constraints/concurrency, Auth/message/host contracts, shared-principal P12 and PostgREST/session tests, fault/replay/migration cases and accessible donor E2E. Test both proof orders, supersession, retained-current/retired-other sessions and partial outcomes. Label local/synthetic/source evidence separately; no missing material proof becomes implementation-ready through this ratification.

### 22 — Other development hazards

**Material concern: No additional independent concern after these boundaries. What/why:** Account deletion, passwordless replacement, new grants, contact destinations, consent transfer and financial actions were checked and excluded. **Severity:** Not applicable to a new concern; prohibited side effects could be critical. **Likelihood:** No such mutation occurred here. **Evidence:** selected scope; prior ratifications; A1–A5. **Impact on A:** Preserve focus. **Permanent fix:** Keep future capabilities and formal publication separately authorized.

> C22 — Q11 coordinates only the explicitly selected email-change uses. It creates no claim/merge, unrelated recipient authority, new capability grant, newsletter enrollment, financial action or historical document rewrite. A1–A5 and the proposed session/lifecycle rules require explicit reviewed ratification. Formal PRD/specification, tickets, provider changes and implementation remain separate later work.

## Evidence from Core and the provider

The inspected develop head is **7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd**. Evidence refresh distinguished contracts from runtime and live behavior. A merged contract is not implemented functionality; an open specification branch is not a merged contract; a local test is not hosted qualification.

<!-- prettier-ignore -->
| Evidence | Current verified finding | Implication |
| --- | --- | --- |
| R01 — Settings UI and PATCH | Settings email is read-only/support-directed at `page-client.tsx:328–345`. Name/phone/avatar saves are real. Both donor-settings and profile PATCH schemas exclude email. | Preserve the strict write boundary; a newly enabled input is not an email-change implementation. |
| R02 — Display and identity resolution | `donor-portal/model.ts:450–455` falls back from profile email to donor email. `auth/context.ts:260–303` positively obtains provider user and resolves profile by stable user ID. | Replace the misleading display fallback for this task while preserving stable-ID resolution. |
| R03 — Auth return and placeholders | Callback sanitizes `next` but can prefer role home; some password/reset UI uses placeholder behavior. | Source-owned qualified return and actual status reconciliation are required; do not present those controls as tested email-first recovery. |
| R04 — Creation mirror | Native creation trigger copies Auth email into profile. No inspected Auth-email UPDATE synchronization supplies the intended guided contact change. | Never assume automatic synchronization or turn a mirror into business authority. |
| R05 — Claim/proof model | Phase4:146/154/166 overloads current contact verification and established claim/reveal proof. Phase9 reserves generic contact normalization. | A1 is an explicit owner amendment, with qualified legacy migration and no new address book. |
| R06 — Permission change | Phase12/#686 preserves ordinary grants under current rules but suspends/re-attests sensitive grants and rechecks restricted named grants. | A3 must reconcile the shared principal across affected Tenant assignments; contact-only is different. |
| R07 — Message ownership | Phase17 reserves email-change purposes and defers specified contact/security notices; #886 requires exact protected-action mappings. | Complete source contracts before activation, with no alternate sender bypass. |
| R08 — Contact matching | `email/consent.ts:118–124` uses exact donor ID positively, then Tenant/email/limit1 fallback. Guest matching can choose the oldest of duplicate addresses. | Exact subject/contact revision is required; the fallback is not safe authority for the new task. No deployed takeover was demonstrated. |
| R09 — Client currentness | Existing session code clears Query on logout/user change. Same principal can change email/contact/permission revisions without changing ID. Prior Q10 proof showed Query clear alone need not empty DB materialization. | Explicitly dispose of stale Query/DB data and late responses on relevant currentness changes. No new second cache authority. |
| R10 — Shared UI | Exact base-maia, Base UI1.5.0 and shared components; OTP uses input-otp1.4.2. | Compose and prove accessibility; do not replace a sound wrapper due to a false “every component must be Base UI” assumption. |

Repository references: [ADR-0001](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md), [Phase4](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-04-identity-account-claiming-foundation.md), [Phase9](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md), [Phase12](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-12-full-role-permission-configuration.md), [Phase17](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-17-system-messages-template-management.md). Exact source excerpts, provider source hashes and independent owner/runtime/UX notes are retained with the proof bundle. The artifact validation verifies repository paths before publishing links.

### Actual local proof completed for this review

**Provider:**15 observations against cached Supabase Auth/GoTrue **v2.188.1**, image `sha256:87db8c737af49a64236c461882ed3925f8b1e5c2c47176c64694dedc65153573`, with PostgreSQL17.10 and a signed local hook sink. All accounts/credentials were synthetic. No network, exposed port, hosted service or real email delivery was used. Containers were removed.

<!-- prettier-ignore -->
| Observation | Result |
| --- | --- |
| A01 | Email update returns200 with old current email plus pending new email. Acceptance is not completion. |
| A02 | The signed hook's current-inbox hash is `token_hash_new`; the new-inbox hash is `token_hash`, verified against actual pending provider columns. |
| A03–A05 | A direct GET consumes the first proof; replay is403; the distinct second proof completes the change with the same Auth UUID. |
| A06–A08 | After email change alone, an old access token is still accepted by GET/user and original refresh works. Old-email password bootstrap fails and new-email bootstrap succeeds. Password was fixture setup, not the proposed donor flow. |
| A09 | A directly authenticated request for an existing Auth address returns422/email_exists before inbox proof. |
| A10 | Submitting the unchanged current address returns200 and leaves the pending change intact. It is not Cancel. |
| A11 | With autoconfirm enabled, secure-email-change enabled still permits completion with one new-inbox proof. The flag alone does not prove the proposed two-proof lane. |
| A12–A13 | A different pending address invalidates the old new-inbox proof and resets progress. New-inbox-first/current-inbox-second also completes successfully. |
| A14–A15 | Exact newly verified session + logout scope=others returns204; retained GET/user and refresh succeed200; former other-session GET/user fails403 and refresh fails400; other session rows are absent. |

Supabase's current hook documentation confirms the counterintuitive hash mapping and that an enabled hook replaces SMTP delivery. Its sign-out documentation explains session scopes and warns that signed access tokens have their own expiry. The local experiment adds endpoint-specific evidence: GoTrue GET/user rejected the removed session; no claim is made that signature-only checks elsewhere do so. [Send Email Hook](https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook), [Sign-out scopes](https://supabase.com/docs/guides/auth/signout).

The provider's direct confirmation link is not a suitable scanner-safe Asym link. A branded inert landing and deliberate protected POST must be qualified through #886. The normal proposed two-proof configuration was demonstrated with autoconfirm=false and secure email change=true. Local config labels and generic docs are not substitutes for this exact behavior. [Supabase email templates](https://supabase.com/docs/guides/auth/auth-email-templates), [tagged verification source](https://github.com/supabase/auth/blob/v2.188.1/internal/api/verify.go).

**Core database:** all76 native migrations and10 focused assertions ran against a separate disposable networkless PostgreSQL17.10 database. D01–D04 confirmed the creation mirror, absence of Auth-update propagation and stable owned/unrelated gift visibility. D05–D06 denied ordinary authenticated profile/donor email SQL updates with42501. D07 kept Auth/principal/gift bindings unchanged after the isolated privileged contact write. D08 accepted another legacy donor with the same email. D09 blocked an email-value comparison after a differing value; D10 showed it can succeed stale after A→B→A. These are actual legacy-schema observations, not proof of the proposed claim/revision/P12 model.

The initial two Auth fixture attempts failed before observations because of the isolated role's missing `auth,public` search path (`identities` relation lookup). Creating extensions alone did not fix that. The fixture was corrected and successful results rerun; failed attempts remain in the bundle. First cleanup's immediate removal check raced asynchronous container removal; a subsequent inventory found none, and later runs explicitly waited for absence. None was a product failure or hidden successful test.

**Not run:** hosted configuration or real delivery; complete Asym email-first frontend; P4/P12/P17 integration; target RLS/two-session permission concurrency; production data migration; mobile/screen-reader E2E; provider-rate capacity; donor usability study. The research is complete for this decision, while implementation and release qualification remain mandatory work. No result here certifies launch readiness.

## Dependencies and conflict register

Fresh reads recorded PR872 **MERGED** at `b886c2eb2fe4c98cc8723a232d860138c86b10c2`; PR1323 **OPEN** at `70c50e8c97556c43be5543332fb0993b468b90ab`; PR1340 **OPEN** at `9069dcad67f9630323474ca5ee8bcc85ca7bf0f6`; PR1558 **OPEN** at `ab1a1703a725be454376990a7fe68aef2e048026`. Those are evidence heads, not deployed behavior. Earlier phase-foundation research remains in the grooming notebook; this turn refreshed dependencies material to Q11 rather than silently re-ratifying predecessors.

<!-- prettier-ignore -->
| Existing dependency | Verified state/dependency distinction | Required Q11 reconciliation |
| --- | --- | --- |
| [#506](https://github.com/Asymmetric-al/core/issues/506) | Open/todo, native blocked_by empty; older body says can start immediately. | A1 canonical proof/normalization/claim binding and exact revision constraints must be reconciled explicitly. |
| [#509](https://github.com/Asymmetric-al/core/issues/509) | Open/blocked; body names#505/#506/#508; native blocker#1482. | Preserve email-first verified claiming; separate established claim proof from current contact proof. |
| [#511](https://github.com/Asymmetric-al/core/issues/511) | Open/blocked; body#506; native#1482. | Adopt current P4/17 message seam, not an older direct-send interpretation. |
| [#686](https://github.com/Asymmetric-al/core/issues/686) | Open/blocked; body#669 and external#489/#493/#604/#628/#645; native array empty. | A3 shared-principal causal reconciliation and ordinary/sensitive/restricted distinctions. Its old “consent code absent” statement is stale. |
| [#886](https://github.com/Asymmetric-al/core/issues/886) | Open/blocked; body and native#876/#878/#879. | Exact proof recipient/hash mapping, inert landing, deliberate action and provider-contract tests. |
| [#1482](https://github.com/Asymmetric-al/core/issues/1482) | Open/blocked; body/native#1481. | Qualified current portal host/account brand and Auth producer integration. |

Empty native blocker arrays do not establish readiness; body dependencies and governing contracts still apply. No issue body or GitHub relationship was changed. Future authorized planning must reconcile these exact predecessors before adding work and must not duplicate their responsibilities.

## Required independently verifiable proof — P01–P16

These are acceptance-evidence groups for future authorized work, not tests claimed to have passed. Each must verify user/domain outcomes at real boundaries, including negative cases.

<!-- prettier-ignore -->
| Group | Required evidence |
| --- | --- |
| P01 — Current reads and selected intent | Actual Auth current/pending vs contact values; targeted/generic entry; equal/different/missing addresses; only selected own-person uses; no caller-supplied role/subject authority; known readiness before Both. |
| P02 — Normalization and no-op | One canonical identity/contact/provider comparison; whitespace/case policy; plus/dot/IDN and supported Unicode boundaries; reject malformed/header/multiple mailbox input; no fake event for a semantic no-op. |
| P03 — Claim invariants | Reused old address cannot rebind an established donor; duplicates/conflicts/merge races use owner review; new proof cannot adopt old verified timestamp or another principal's gifts; clean unclaimed first-claim rule remains truthful. |
| P04 — PostgreSQL authorization | Actual authenticated/anon/service roles, grants, RLS USING and effective new-row checks, same-Tenant FKs, exact principal/Party scope, null/default/check/unique constraints, views/functions/storage where used; direct forged binding/verified/result writes denied. |
| P05 — Concurrent commands | Two real DB sessions race same principal from different Tenants; same contact revision; claim vs contact edit; A→B→A; same key/same effect versus changed payload; only current admitted request applies. |
| P06 — Exact Auth proof contract | Pinned SDK/Auth and intended deployment settings; current/new token/hash mapping; either proof order; enrolled MFA/managed identity where applicable; request accepted vs pending vs complete; no third redundant challenge. |
| P07 — Scanner and browser authority | GET/HEAD, previews, scanners, replay, forwarded links, wrong principal/browser/Tenant/host and expired/superseded proof; deliberate POST only; safe return; no automatic account switch into another person's task. |
| P08 — Session and permission causality | Exact retained finishing-device session; other refresh revocation; every protected HTTP/DB/storage/stream door's current authority; direct Auth writers; new assignment/session during transition; delayed cleanup versus new sign-in; no stale worker after completion. An empty session snapshot cannot prove a timed-out provider effect is finished. |
| P09 — Combined/partial outcomes | Auth success/contact conflict; lost response before/after each effect; provider timeout; stale contact proof; security reconciliation failure; resume same request without duplicate effect/rollback; real incomplete/unknown UX. |
| P10 — Supersession and recovery | Different-address supersession, same-address resend semantics, expiry and cooldown; reset proof progress exactly; Finish later vs draft Cancel; lost inbox/security recovery with no unverified relink; no required cosmetic provider Cancel. |
| P11 — Contact/consent/message races | Exact new revision proof, existing On/Off preserved, new-address suppression, queued old recipient, already-admitted unknown send, no backlog retry/marketing enrollment, source-owned security/completion messages. |
| P12 — Cache/privacy/diagnostics | Same-user revision transitions in Query/DB, bfcache/logout/user switch, late response discard, no tokens/full addresses/protected URLs in analytics/replay/logs, safe support references and source record retention. |
| P13 — Mobile/accessibility/localization | Real donor E2E with keyboard, screen reader, full OTP paste/autofill, mobile keyboard, narrow width,200/400% zoom, long addresses, local language/status/expiry display, slow network, Back and safe recovery. |
| P14 — Migration and mixed versions | Trusted historical claim evidence mapping; ambiguous legacy records; old/new readers/writers; active pending requests during cutover; owner rollback/roll-forward without undoing committed identity/contact facts or dropping security fences. |
| P15 — Operational capacity and abuse | Realistic principal/Tenant assignment fanout, bounded queries/index plans/work queues, hook/redemption/readback load, direct provider credential-availability/rate limits, no unbounded browser polling or automatic resend. Numeric budgets/configuration are recorded before activation and tested at their boundaries. |
| P16 — End-to-end traceability | Q11→terms/explicit owner amendments→authorized OpenSpec/design→nonduplicative existing/new work→exact tests→release evidence. All J/C/A references, proof types, recipient semantics, current versions and limitations agree. No mock-only certification. |

## Synthesis — the permanent path and order

**Before recording corrected execution as ratified:** accept or amend the exact selected-use defaults, two-inbox normal Auth lane, retained finishing-device/other-session policy, independent results/Finish later, and A1–A5. The direct-provider availability limitation is material and visible. This review supplies the proposed answer; it does not ask the founder to design database tables or investigate discoverable facts. No Q12 question is opened until this review decision is settled.

**Capture in the eventual authorized owner/specification work:** first reconcile stable claim/contact proof and canonical revision/normalization semantics (A1). Then define the bounded request and source commands (A2), shared identity security boundary (A3), and exact message/contact proof producers (A4). Preserve A5's explicit assurance bar. These are required present-phase dependencies, not optional future-phase enhancements. They amend predecessors deliberately; the grooming report itself does not edit their canonical files.

**Require in implementation, in dependency order:** establish real owner constraints/admission and migration proof; qualify exact Auth/message/contact/session contracts including every reachable writer; connect one guided shared-UI journey to those commands; prove interruption, current permissions, communication races, accessibility and realistic capacity; then enable only qualified lanes. Do not start Both when a required lane is known unavailable. Do not promise self-service completion for a recovery case whose owner is unqualified. Preserve the existing help path without giving staff an unverified identity override.

**Rollout:** inventory current Auth, profile, donor, matching, claiming, consent and dispatch readers/writers; deploy compatible owner schema/readers before admitted writes; backfill claim proof only from trustworthy evidence; fail closed on unknown mappings; enable by independently qualified lane and controlled scope. A kill switch stops new requests while allowing safe readback/reconciliation of accepted work. Roll-forward/rollback retains committed Auth/contact facts, historical evidence and required security fences. Direct database repair, restoring an old address as compensation and resending old occurrences are not rollback strategies.

**Whole-product scope:** the donor portal supplies self-service; Mission Control supplies authorized support/operations; missionaries do not gain donor identity-edit rights; public giving/claiming remains guest-first under its existing contract. Phase26 receives a clear owner-routed help seam, Phase28 consumes current permissions, Phase30 must preserve binding/contact-proof provenance, Phase32 cannot treat email change as external newsletter enrollment, and Phase33 may consume minimized operational evidence. No new Support Hub, CRM address book, external newsletter sync, reporting product or My Campaigns feature is built here.

### Risks suitable for monitoring after qualification

Monitoring supplements proof; none of the material authorization, collision, message-routing or migration requirements is deferred to monitoring. Thresholds below are proposed operational triggers, not observed incident rates or provider service guarantees.

<!-- prettier-ignore -->
| Signal and threshold | Owner | Required response |
| --- | --- | --- |
| Any confirmed wrong-principal/Tenant/contact effect or stale protected admission:1 event | Identity security owner with P12 owner | Contain new affected operations, preserve evidence, reconcile current authority, investigate every affected door; do not merely change UI text. |
| Any accepted request still indeterminate beyond its declared owner reconciliation deadline | Identity/self-service operations | Resume original readback/reconciliation or escalate using its safe reference. Never start a replacement solely to clear the alert. |
| Any required verification/security occurrence beyond its admitted dispatch/expiry deadline without a resolved result | P6 delivery operations and producing owner | Classify queued/admitted/unknown result, contain invalid action, expose truthful donor retry/help; no fallback sender/recipient or bulk resend. |
| Any confirmed mismatch between declared normal two-proof/session policy and deployed provider behavior | Auth integration owner | Disable new affected lane, preserve pending-work recovery, qualify configuration/version and rerun provider-contract proof before reactivation. |
| A donor journey cannot complete using supported keyboard/screen-reader/paste path, or a privacy-safe support report reproduces a dead end | Donor experience owner | Treat as a release defect, repair the shared composition and rerun the actual journey. No need to collect sensitive input recordings. |
| Any active request beyond its qualified retention/expiry cleanup rule, or missing terminal evidence for a purported success | Identity data/operations owner | Reconcile original state, repair retention/attribution through owner tools, investigate automation; no arbitrary record deletion. |

Provider expiry, rate limits and reconciliation deadlines must be the qualified owners' concrete configuration, documented and measured at activation. This review does not invent universal seconds, addresses-per-account limits, throughput or retention periods.

## Coverage and decision status

- **Confirmed direction:** A; email-first sign-in name; one guided selected task; exact Maia; preserve previous Phase25 ratifications and product surfaces.
- **Recommended corrected execution awaiting ratification:** J01–J12, C01–C22, A1–A5, the purpose-qualified proof reuse and finishing-device session policy.
- **Verified this turn:** current source/contracts and relevant GitHub dependency state;15 isolated provider observations;76 native migrations+10 legacy assertions; preserved five prior setup paths and prior proof bundles.
- **Required implementation work, not waived:** owner amendments, real target SQL/concurrency, deployment/provider/contact-message qualification, accessible donor E2E, migration and release evidence P01–P16.
- **No new product assumption treated as fact:** donors may intentionally use different contact/login addresses; the retiring-address scenario is illustrative; no measured vendor UX superiority or unknowable mailbox-recycling detection is claimed.

**Final recommendation:** retain A and ratify the corrected journey with the five explicit owner amendments. The donor experience stays small and clear because the source contracts—not extra screens or hidden synchronization—carry the necessary complexity.
