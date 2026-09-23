# D29 — Final owner consistency review

**13 September 2026. A selected; detailed D29 amendments remain proposed for ratification.** Reviewed the actual [D29 main](phase26-d29-adversarial-review.md), [UX](phase26-d29-ux-blueprint.md), [Email Studio integration](phase26-d29-email-studio-integration.md), available [data contract](phase26-d29-data-contract.md) and [earlier owner review](phase26-d29-owner-review.md). This is a bounded final review, not a new product scope or modification of earlier ratifications.

**Final result: Pass. Both initial findings below are resolved in the actual main decision, Email Studio integration and data contract.** No material owner-seam defect remains in this bounded final review. The preserved initial findings explain the two profile precisions and their proof obligations; they do not make acknowledgement mandatory or alter the contact-first journey.

## F29-O1 — Preserve full human-reply precedence after possible acknowledgement submission

**Status: resolved.** The following records the initial finding; the final actual-document check below confirms the correction.

**Material concern: yes. Severity high; likelihood plausible during provider uncertainty.** R18 and the integration correctly suppress an unsubmitted acknowledgement when a human reply wins the gate. Their current shorthand can be implemented as a pre-crossing-only check, leaving an otherwise permitted acknowledgement retry after useful human correspondence has already been admitted.

The ratified [D13-R15](phase26-d13-adversarial-review.md) is more precise: a public human reply for the same currently handled request and the exact confirmation recipient can suppress the initial automatic send; a later qualified human reply admission also ends further confirmation provider-call/decrypt authority, including an otherwise allowlisted retry of an indeterminate envelope. Current-source reconciliation remains available, and already in-flight outcomes are not recalled. D13 artifact line 79 contains this rule; its identifier is R15, not R11.

**Exact amendment for D29-R18, Email Studio and data lifecycle:**

> Apply the full D13-R15 human-reply rule to the new web acknowledgement. A qualifying public human reply for the same currently handled request and exact acknowledgement recipient takes precedence under the shared source/current gate. A reply only to another helper/recipient or unrelated request does not suppress it; a draft or unsubmitted preparation is not a completed human crossing. Once the acknowledgement may have submitted, a later qualifying human reply admission ends all additional acknowledgement provider-call/decrypt authority, including otherwise permitted indeterminate same-key follow-ups. Preserve body-free reconciliation and already-in-flight results without recall. Later staff/provider failure cannot revive the acknowledgement.

This keeps the first actual email lineage honest: use an already qualified acknowledgement thread where it genuinely exists, otherwise establish the first human outbound thread. It prevents a late automated receipt from starting another thread or arriving as newly retried mail after the useful answer.

**Required proof extension:** Extend P29 or the actual acknowledgement race group to include (a) human crossing first; (b) acknowledgement possible first then human admission; (c) an indeterminate acknowledgement whose next provider call would otherwise be allowed; (d) a reply to another recipient/request; and (e) later failure/duplicate event. Only the relevant human response stops further optional confirmation calls, with no new key, reconstructed payload or false no-send claim.

## F29-O2 — Declare the new acknowledgement's exact history/copy posture

**Status: resolved.** The following records the initial finding; the final actual-document check below confirms the correction.

**Material concern: yes. Severity medium; likelihood plausible from default inheritance.** The new profile currently says P17/Recent-copy exclusions remain intact, but that does not select a concrete Recent-copy policy. P17 has multiple classes; an implementation could accidentally give this minimal automatic receipt a readable retained copy or use the human-correspondence exception to duplicate generated content in Support.

The existing [D13-R17](phase26-d13-adversarial-review.md) deliberately uses one automatic event with actual outcome, body-free expected skips, **Recent sent copy Off-only**, no permanent generated body/subject in `support_messages`, and a clearly synthetic **Template used** preview when useful. D13-P30 names the associated proof. The new web profile needs its own explicit posture rather than an implied inheritance from an email-only key.

**Exact amendment for D29-R17/R18/R22 and the new profile inventory:**

> The web-Contact acknowledgement uses Recent sent copy Off-only. Represent its actual admitted automatic correspondence once through the P6 occurrence and original form/Support linkage, with real automatic attribution and outcome. Expected suppression is body-free processing evidence, not a fake outgoing message. Do not retain the generated acknowledgement body/subject as permanent Support/P6 transcript data or use D4's human-correspondence exception. A publication preview may use synthetic values labelled Template used; it is not the actual sent message and cannot reconstruct restricted execution material. The source-bound fifteen-minute prepared-material deadline and all earlier P17 finality/privacy/safety erasure rules remain authoritative.

This is the smallest complete posture consistent with the informational receipt and existing automatic-confirmation design. It introduces no new reveal UX, general archive or additional lifetime. The original requester form text remains real Support source content under its own finite D16/D17 policy.

**Required proof extension:** Confirm Off-only capture, one actual automatic event, no generated body/subject in permanent source/history/search/export/log/restore paths, and a synthetic-only publication preview. Exact acceptance/terminal/no-longer-useful state denies execution-material read/decrypt and invokes the existing purge owner without erasing true delivery evidence.

## Confirmed consistent boundaries

- The standard Help profile selects exactly one certified Support Primary Outcome. P23's Verified Email Destination remains a different outcome elsewhere, not automatic fallback or another simultaneous owner.
- Atomic form occurrence/Primary responsibility/child dispatch obligations precede browser Received. Optional guides, acknowledgement or notification/executor failure do not erase accepted work; receipt is not email delivery or staff reading.
- The requester source is a true form-origin message, not inbound RFC email, an internal note or a D26 staff brief. A Party is optional; the first staff reply uses its explicitly qualified form-response endpoint and actual native mail lineage, with no fake provider/Message-ID, first-CRM-match substitution or automatic CC.
- New form acknowledgement starts Off. Enabling uses one P23 Visitor Acknowledgement child and a new valid web source/recipient/P17 profile. Reusing wording never transfers an email-only D13 key's authority. Utility is fifteen minutes from trusted form admission, with one shared tenant/mailbox 24-hour courtesy guard across automatic receipt families and current source/policy/route/contactability fences.
- D14 starts a genuine owed form-response clock at trusted source admission through an explicit source qualification, not an invented provider date. D28 can consider completed form work only after actual accepted human public correspondence and all its existing conditions; form/guide/automatic receipt alone grants no credit or feedback effect.
- Authenticated Help uses app tenant/principal/subject and its own qualified release/route binding. It does not impersonate a public Site, personalize cached CMS content or expose private context through guide selection/URLs. Optional source context is rechecked and can be deliberately omitted; shared-device/context changes clear private state.
- The contact form remains native semantic plain text and no-JS capable. Staff rich authoring retains D23 Tiptap; no public rich editor/upload, alternate P17 doorway or generic form builder is added. Explicit new-tab public guide links preserve the current draft and carry no form content in referrers.
- Published contact display data is not P23 Verified Email Destination authority. Direct email/phone clicks create no fake accepted request, call or communication record. Ambiguous POST success recovers the same occurrence; no automatic email fallback or silent cross-channel merge occurs.

## Status and evidence limits

The exact D13 clauses were read from the ratified session artifacts. Governing P17 sources remain pinned to Core `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`; P23/P24/P25 planning pins and their actual limits are preserved in the earlier owner/evidence records. No source/runtime or provider test was added in this review, and no earlier decision was rewritten.

The remaining source/profile, database/RLS, browser/no-JS/accessibility, timing/race, retention and provider requirements are unexecuted release proof, not evidence that today's generic form or email code already conforms.

## Final actual-document check — Pass

Re-read the final main decision, Email Studio integration and data contract on 13 September 2026 after both corrections were incorporated. This supersedes the initial conditional result without changing D29's proposed-for-ratification status.

- **F29-O1 resolved:** D29-R18/P29 and the Email Studio timing paragraph now expressly apply D13-R15 after acknowledgement submission may have begun. A qualifying public human reply for the same current request and exact recipient ends all further acknowledgement provider-call/decrypt authority, including otherwise permitted indeterminate same-key follow-ups. Already-in-flight outcomes remain reconcilable without recall, and later human-send failure cannot revive the acknowledgement. The data lifecycle's acknowledgement/human-reply race row carries the same rule and its D13-R15 reference.
- **F29-O2 resolved:** D29-R17/P27, the Email Studio preparation/history paragraph and the data custody inventory explicitly select **Recent sent copy Off-only**, a body-free Automatic confirmation event with actual state, no permanent generated body/subject in Support history, and only a synthetic **Template used** publication preview. Restricted execution bytes remain governed by existing P17 material/finality/privacy disposal and are not a staff content-view API.
- **Source and recipient qualification remains explicit:** The new optional web acknowledgement is one P23 Visitor Acknowledgement child, initially Off, qualified for its exact accepted form occurrence and submitted response endpoint. D13's receiving-email-only source/key is not silently reused; compatible published wording needs its own valid source/profile qualification. The fifteen-minute trusted form-admission utility, shared tenant/mailbox twenty-four-hour courtesy guard and current adverse gates are unchanged.
- **The first real staff email remains truthful:** D29-R14/P25 and the integration qualify a D4/P17 form-response recipient source without requiring a Party or inventing incoming RFC/provider facts. Staff see the declared endpoint and current authorization; no automatic CC or CRM-address substitution is introduced. A genuine compatible acknowledgement thread may be continued; otherwise the human reply creates the first real outgoing lineage. Subsequent real mail uses existing intake/correlation rules.
- **Acceptance and delivery remain separate owners:** D29-R13 and the data acceptance lifecycle require one certified Support Primary Outcome and the atomic occurrence/route/primary-responsibility/child/dispatch receipt before browser Received. P17 authors, qualifies and freezes any actual message; P6 submits and reconciles it. A later optional acknowledgement/provider/executor failure cannot erase accepted work or silently switch the Primary Outcome to email-only delivery. Public contact display and mailto/tel clicks create no false P6 email or Support acceptance.

No root document was edited by this reviewer, no earlier ratification was reopened, and no runtime, database, browser, provider or live-message proof was executed or claimed. The conclusion is consistency of the proposed owner contract and its required acceptance proof, not deployed conformance.
