> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

> **Expanded direction and safeguards explicitly founder-ratified, 7 September 2026.** Conrad accepted the reviewed A1–A6, J01–J16, C01–C22 and presentation defaults, including the narrow provider-branding exception. Historical proposed/unratified wording below is retained as evidence. G01 remains unresolved; the social architecture is not implementation-ready and provider activation is not certified.

> **Status update,7 September2026:** Conrad selected A and requested Google/Apple/Facebook as an expansion. The complete review is in phase25-r14-adversarial-review.md; corrected direction awaits ratification and G01 remains an unresolved native-linking blocker. Historical unanswered-question wording below is preserved.

# Question 14 — A sign-in code in the first email, or on request?

7 September 2026. Research/grooming only. **Q13 fully ratified; Q14 unanswered.**

## The decision

Recommend **A — A primary sign-in link plus a quiet code alternative in the first email.** Compare with **B — A link-only initial email, with a visible Request a code action on the waiting page.**

This preserves the already ratified magic-link-first, email-based entry. It chooses when the permitted code alternative becomes available, not a new authentication strategy, access grant, password-first signup, passkey, SMS or social-login product.

### A real-world situation

Maria opens Receipts & statements on her laptop. She reads the sign-in email on her phone, but wants to retrieve and save her documents on the laptop. With A, she can enter the code from that first email into the laptop's current sign-in screen. With B, she deliberately requests a code and waits for a separate message. Neither option requires trying and failing the link first.

This is an illustrative donor situation, supported by comparable product documentation; it is not a measured Asym support incident. It assumes the proof has not already been consumed. Completing sign-in on a phone does not automatically sign in the laptop or permit a consumed code to be reused.

<!-- prettier-ignore -->
| Option | Donor experience | Benefit | Cost/tradeoff |
|---|---|---|---|
| **A — Link and code in the first email. Recommended.** | A prominent sign-in button, followed by a small alternative: enter this code on the device you want to use. The original portal page supports the code route. Only one method is needed. | Preserves familiar link-first entry while avoiding another request/message for ordinary alternate-device use. Donors can choose their browser/device deliberately. | Slightly more email content. Both routes require exact one-use producer and message qualification; the interface must not imply two required verification steps. |
| **B — Link first; code on request.** | The initial email contains the sign-in link. Request a code is immediately visible on the waiting page and sends the appropriate separate message when chosen. | A simpler initial email with one instruction; donors see a code only when they ask for it. | Another delivery wait for the code path, plus clear handling of old/new messages and replaced credentials. The fallback cannot be hidden behind a failed-link attempt or staff contact. |

**Recommendation: A.** A small, clearly subordinate alternative is a proportionate way to avoid extra email round trips. B is credible when first-email simplicity takes priority, but it shifts work to precisely the donor who needs help staying on the intended device. This is a product judgment, not a claim of measured conversion improvement or that A is universally safest.

## What current primary sources establish

- **Supabase — implementation capability, with limits.** Its email-template docs expose a code usable instead of the confirmation link; passwordless docs say the link/code paths share initiation and differ in email content. This supports feasibility of a combined presentation. It does not prove Asym's complete one-email/two-route flow or authorize bypassing its source-owned handoff. The docs also identify link prefetching and tracking pitfalls. [Email templates](https://supabase.com/docs/guides/auth/auth-email-templates), [passwordless sign-in](https://supabase.com/docs/guides/auth/auth-email-passwordless).
- **Church Center — Useful precedent.** Its current donor-facing passwordless entry uses an emailed or supported texted code. This establishes a normal donor-product code journey, not Asym permission to adopt its phone, campus, shared-profile or session policies. [Church Center login](https://help.planningcenter.com/en/141275-log-in-to-church-center.html).
- **Claude — Useful precedent for the device problem.** Its current help explicitly describes requesting on one device and reading on another, then using a code on the original device. Its specific device-detection and click-to-code behavior is not the proposed Asym implementation. [Claude login](https://support.claude.com/en/articles/13189465-log-in-to-your-claude-account).
- **Fundraise Up — Useful precedent for a simple first email.** Its portal help describes branded email-link access and fresh access after expiry. It does not prove the proposed B code fallback exists there. [Portal access](https://fundraiseup.com/support/donorportal-access/).

These are official documented behaviors retrieved7 September2026. No comparative donor study, hosted auth request, mail send or actual sign-in/browser test ran. Exact code length, expiry, retry limits and session duration are not frozen from provider examples.

The Supabase changelog index was retrieved after the browser tool rejected its Markdown content type. Its June3 default-SMTP free-plan template restriction was checked. It does not license an unbranded default-email fallback or a parallel sender: Asym's accepted Send Email Hook → P17 → P6 → transport boundary remains authoritative. No project settings, provider configuration or package version was changed. [Supabase change](https://supabase.com/changelog/46599-changes-to-email-template-customisation-on-free-tier).

## Exact repository fit: settled versus open

Current local and remote develop matched **7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd**. Repository instructions, CONTEXT, ADR-0001, OpenSpec identity/platform boundaries and predecessor decisions were checked. Current implementation is not automatically the permanent design.

<!-- prettier-ignore -->
| Source | Settled rule | Q14 implication |
|---|---|---|
| P4:40,129–136 | Optional verified claiming; magic-link-first/OTP entry; password only after authentication; shared credentials do not grant Tenant access. | Do not re-ask the login-method strategy. Same versus separate email for the code alternative is not specified. |
| P4:134,314–346 | Identity owns purpose, credential lifecycle and claim authority; messages use the typed Send Email Hook and P17/P6. Legacy invitation redemption has its own deliberate lifecycle. | No direct provider-template/send shortcut; do not broaden ordinary sign-in presentation into invitation or email-change authority. |
| P17 main PRD:1018–1093 | Inert GET/HEAD, protected selector/verifier handoff and deliberate same-origin POST; exact magiclink hook mapping includes token/token_hash. Landing alone is not sign-in. | Both options preserve current scanner resistance and secret exclusions. Supabase raw URL examples do not override this accepted contract. |
| P17 executable manifest:725–726,734–744 | Magic-link and email-OTP keys are separately Reserved and need exact adoption/hook/secret/rate/expiry proof. | Separate catalog keys do not require two emails. A combined human presentation needs explicit source/message adoption/refinement; no silent key collapse or duplicate dispatch. |
| Q04/Q11 and P24 | Exact personal/represented scope; distinct sign-in/contact work; verified Tenant portal brand/host and safe return context. | A code cannot select another donor by shared email, transfer a session between devices or redirect to an unproved target. Ordinary sign-in does not inherit Q11's two-address change/session-revocation flow. |

Source links: [P4 entry](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-04-identity-account-claiming-foundation.md#L132), [P17 protected handoff](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-17-system-messages-template-management.md#L1018), [Reserved identity messages](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-17-system-message-executable-manifest.md#L725).

**Durable patterns:** verified possession, source-owned single-use proof, current Tenant/Party authorization, protected return, magic-link-first and exact Maia. **Useful precedents:** code entry and link-first interfaces elsewhere, existing shared OTP wrappers. **Implementation accidents relative to target:** password-first Register/Login screens and support-only password-reset placeholder. **Conflict with first principles:** raw authority-redeeming GET fallback, a second authentication ledger or automatic cross-device session transfer merely to make a code alternative work.

## Actual source and dependency findings

The current shared LoginScreen/FullLoginCard use password authentication; RegisterScreen calls password signup. The donor forgot-password page states reset is not enabled. The inspected callback exchanges an OAuth/PKCE code on GET and prioritizes a legacy role-home destination; it is not proof of P17 protected-action redemption or complete Ministry Updates/document return. Ordinary signInWithOtp/verifyOtp target flow was not found in the inspected donor/auth/API inventory. Current resolved Supabase js/auth-js is2.103.0 and SSR0.8.0; hosted configuration was not checked.

Fresh read-only issue bodies: #509/#511/#886 remain Open. #509 owns claiming and depends on#505/#506/#508. #511's direct template/authority-in-redirect wording conflicts with newer P4/P17/Q11. #886's older opaque-handle GET→303 description conflicts with the current inert GET/HEAD and deliberate POST handoff. Later authorized work must reconcile these bodies rather than duplicate the substrate or implement stale instructions. No GitHub state changed.

## What the answer will and will not settle

Q14 chooses **initial fallback availability and the associated ordinary donor journey**. It does not silently ratify precise token schema, key mapping, code length, timeout, resend count, UI slot design or a new auth table.

If A is chosen, the following execution review must prove one current source-owned proof with two permitted human routes and at-most-once completion; secret exclusions; correct hook/message adoption; throttling and expiry; known/unknown-account response safety; two tabs/Tenants/devices; late or consumed messages; sign-in as the wrong current principal; lost responses and safe recovery; and preserved intended destination. A phone completion does not create an automatic laptop session. The code is an alternative before consumption, not a transferable session or second factor. No numerical producer limit is assumed.

Both options use calm Maia/Base UI on the portal and the existing branded auth-message system. They should support paste/autofill and accessible instructions with one evident route and a secondary alternative. The exact code-input composition remains for the post-answer review.

Other frontiers remain tracked: wallet add/remove/default qualification, fresh-restart presentation, complete auth/claim runtime and remaining Phase25 coverage. P16 already settles Manage, Skip/Pause/Change/Cancel, bounded/indefinite pause and neutral direct cancellation. The parked Remove-origin continuation mostly follows accepted R03 and was not recycled as a fresh question. A possible later restart fork is safe prior-gift prefill versus unprefilled canonical new-giving checkout; it is not selected here.

**Recommendation remains A. Await the founder's answer to Question14.** Q13's full corrected execution is ratified; no PRD/formal specification, issue, implementation, provider or environment change is authorized by this question brief.
