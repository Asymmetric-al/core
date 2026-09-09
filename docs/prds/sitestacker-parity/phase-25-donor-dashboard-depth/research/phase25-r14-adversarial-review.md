> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

> **Expanded direction and safeguards explicitly founder-ratified, 7 September 2026.** Conrad accepted the reviewed A1–A6, J01–J16, C01–C22 and presentation defaults, including the narrow provider-branding exception. Historical proposed/unratified wording below is retained as evidence. G01 remains unresolved; the social architecture is not implementation-ready and provider activation is not certified.

# Question 14 — Email link/code and Google, Apple and Facebook sign-in

**Research date: 7 September 2026. Disposition: Accept with required amendments to the product direction.** The first-email link-plus-code choice is selected. Google, Apple and Facebook are requested additions. The reviewed amendments below are not yet founder-ratified.

**Material limit:** the desired social experience is feasible at the provider-adapter level, but its safe native account-linking architecture is not yet qualified for Core. G01 below is an unresolved activation blocker, not an implementation detail being waved away. Apple eligibility and the exact provider application/configuration evidence also remain unverified. This review is complete as research; it does **not** declare the expanded feature implementation-ready, deployed or ready for `/to-issues`.

No application source, provider account, credentials, GitHub state, or live service was changed. No formal PRD/specification or implementation ticket was produced. Q01–Q13 remain ratified.

## Recommendation in plain language

Keep email as the clear primary entry. The first email contains a prominent safe sign-in link and a secondary code; using either completes the same qualified sign-in request once. Add Google, Apple and Facebook as explicit alternatives when each is qualified and offered by the organization. Donors should not need to know which authentication library Asym uses, manage duplicate donor records or navigate a technical error page.

Use the existing Supabase Auth system and shared Core clients/callbacks. Provider sign-in proves a provider identity; Core still resolves the right account, verified donor claim and current organization permissions. Do not create another authentication server, token issuer or per-provider donor database to make three buttons appear.

The largest finding is **account linking before the donor portal opens**. Supabase can attach a provider identity to an existing global account by email. Google's own guidance explains why a third-party email marked verified may not prove current mailbox control. The inspected Facebook adapter makes a provider-specific trust assumption about returned email. A portal check after this linkage cannot undo access already granted to the Auth account itself. Therefore “just call signInWithOAuth, then check the donor row” is rejected as a complete solution.

## Material amendments to record

- **A1 — Activate the requested scope explicitly.** Revise P4's reserved Google/Apple seam and add Facebook to Phase25's desired donor entry. Preserve optional claiming, email-first link/code and the existing universal fallback. Social sign-in is not MFA, enterprise SSO, passkey enrollment, a donor grant or consent to communications.
- **A2 — Permit a narrow external-provider branding exception.** Asym-controlled portal, sign-in, recovery and email surfaces retain the Tenant brand and verified host. Provider-owned consent/authentication screens may display their provider and the qualified shared Asym application identity. Explain Asym's role briefly before leaving the Tenant page. Official provider marks/buttons may follow mandatory provider styling inside the shared Maia composition. No general rebranding or central email-sender fallback is approved.
- **A3 — One supported platform integration; honest Tenant controls.** Prefer Asym-operated provider apps separated by environment, with exact registered callbacks and minimal identity scopes. Tenant settings determine which qualified entry choices are offered. They do not claim to prohibit a globally authenticated account from having used a provider elsewhere. Any genuine method/assurance restriction stays a separately qualified P12 security policy. No per-Tenant Supabase project, BYO-provider matrix or new broker is introduced for cosmetic branding.
- **A4 — Correct the provider-email/linking trust rule before activation.** A new provider assertion may not attach an authenticator to an existing principal unless the required current identity/possession policy is enforced at a supported native pre-link/credential boundary. `email_verified`, `user_metadata`, a matching contact or a provider inventory is insufficient by itself. G01 must be resolved with exact target-version evidence; portal-only gates, private-table policy alone and experimental flags are not accepted substitutes.
- **A5 — Complete the bounded account lifecycle.** Connecting a method proves the current account and the new provider identity; disconnecting preserves a proven usable alternative and explicitly handles possible global sign-in-email/session consequences through Q11/P12. Different provider emails, Apple relay and an identity already attached elsewhere do not trigger automatic Auth-user or CRM merges. Existing recovery/claim owners handle ambiguity.
- **A6 — Truthful adoption and release.** No dead provider buttons, unsupported Apple eligibility assumption, unqualified public Facebook launch or simulated email-code flow. Qualify each provider's exact app, domains, secrets, privacy/lifecycle obligations and user journeys before activation. Support for all three remains requested scope; any blocked lane remains explicitly incomplete. Email can operate independently, but it is not described as completion of the social requirement.

These are material owner/scope/branding refinements. They require explicit ratification; they are not merely button styling. J01–J16 and C01–C22 below supply the proposed execution and recovery requirements.

## Adversarial check

### What could go wrong with this answer?

An unsafe email match can yield an existing account's credential, not just an empty profile. A social account can fail to return a usable email, Apple relay can fail to receive Tenant mail, an unlink can change the sign-in address, and a callback can lose the intended ministry/document destination. A polished button does not resolve these issues.

### What hidden assumptions are we making?

Provider support is not configured production readiness. A verified-email label is not universally fresh mailbox possession. We have not verified an eligible Asym Apple app, public Facebook application, hosted Auth version or safe native linking control. We have no donor conversion study proving a preferred button order.

### How does this affect the whole product?

Supabase principals are shared, so credential changes may affect staff, missionary and donor sessions even though their business rights remain separate. P4/P12/Q11 own those consequences. CRM identity, gift ownership, recurring authorization, receipt delivery and Ministry Update preferences do not change because someone chooses Google or Apple.

### How does this affect the end-user experience?

Routine returning donors should complete one familiar sign-in and return to their intended page. Email/code remains reachable. Additional proof is justified only by an actual account-linking, claiming or security need, with plain explanations and no forced duplicate account, unrelated profile completion or circular recovery.

### Does this follow modern best practices?

Supported OAuth/PKCE, stable provider subjects, minimal scopes, deliberate linking, accessible provider controls and separate authorization are sound patterns. Blind auto-linking, uncontrolled callbacks and a homemade broker are not improvements merely because they reduce one visible click.

### Does this fit Asym’s existing repo and product direction?

The desired experience fits only with explicit P4/P17/P24 refinements and intact P12 ownership. Current code is password-based and does not implement the full claiming/OTP/social target. P12 forbids solving this with a parallel identity engine in coarse RLS; native Auth credential safety must also be resolved.

### Should we adjust the recommendation?

Keep the selected email experience and requested three-provider direction. Adopt the bounded shared integration and branding exception, but reject immediate unconditional enablement. Resolve G01 before calling the expanded architecture implementation-ready; do not disguise that missing native capability as a future monitoring task.

## What Supabase and the providers actually support

<!-- prettier-ignore -->
| Method | Verified capability | Practical conditions and boundaries |
|---|---|---|
| Email link + code | Supabase exposes token/hash alternatives from the email sign-in producer. | One exact issuance, purpose, recipient, expiry/replacement and one-use outcome must be proved. P17's protected email landing remains inert on GET/HEAD. A code is an alternative, not a second factor or transferable session. |
| Google | Supabase supports redirect OAuth and SSR/PKCE. | Use identity scopes only and stable verified subject evidence. Google distinguishes authoritative Gmail/Workspace email from other addresses. Automatic matching needs G01 qualification. |
| Apple | Supabase supports Apple OAuth. | Apple eligibility, Services ID/app association, verified domains, expiring web client secret, relay sender registration and account-change handling need qualification. Supabase OAuth does not supply full name. |
| Facebook | Supabase supports Facebook OAuth. | Exact email/public-profile permission and public app readiness matter. Email can be absent. Do not invent placeholder email or enable email-optional principals as a cosmetic fix. Meta review/deletion obligations must match the actual app/use case. |

Primary capability sources: [Supabase passwordless](https://supabase.com/docs/guides/auth/auth-email-passwordless), [email templates](https://supabase.com/docs/guides/auth/auth-email-templates), [Google](https://supabase.com/docs/guides/auth/social-login/auth-google), [Apple](https://supabase.com/docs/guides/auth/social-login/auth-apple), [Facebook](https://supabase.com/docs/guides/auth/social-login/auth-facebook). These establish documented support, not a tested Asym configuration.

### G01 — Native principal-linking safety: unresolved blocker

Google says it is authoritative for Gmail and verified Workspace identities with `hd`. A third-party address without that evidence may retain `email_verified=true` after its mailbox changes ownership. Therefore a blanket “verified provider email is always enough” rule is too broad. [Google token verification](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token).

The existing local Auth image is v2.188.1; its official source was inspected. This is not a claim about the hosted version. Its Facebook adapter marks nonempty returned email verified without a separate email-verification field. Its Google OAuth adapter uses the verification boolean for linking and does not retain `hd` in returned metadata. Native exact provider/subject lookup is distinct from email-based attachment of a new identity. [Facebook adapter](https://github.com/supabase/auth/blob/v2.188.1/internal/api/provider/facebook.go), [Google adapter](https://github.com/supabase/auth/blob/v2.188.1/internal/api/provider/google.go), [linking](https://github.com/supabase/auth/blob/v2.188.1/internal/models/linking.go).

**Why a later check is insufficient:** linking may commit before the application's code exchange. A newly issued credential can operate on Supabase Auth itself, including account credentials, even if Core's private data routes reject it. Blocking only the donor page or adding a session flag in financial RLS does not protect that native account boundary. This is a source-based threat assessment, not a demonstrated live compromise.

The following proposed shortcuts were checked and rejected:

<!-- prettier-ignore -->
| Candidate | Why it does not establish a safe permanent solution |
|---|---|
| Before User Created hook | The inspected implementation invokes it for account creation, not automatic attachment to an existing account. |
| Custom Access Token hook alone | Documented input lacks reliable exact current provider-subject provenance; linkage may already be committed. No complete selective prevention was proved. |
| Manual-link-only UI | Does not disable the separately reachable native automatic-login endpoint. |
| Disable signup | Does not establish control over linking to an existing user. |
| Hidden buttons or Core-only admission | Cannot prevent unsafe native Auth account operations using a minted credential. |
| Experimental own-linking-domain configuration | Not a demonstrated stable hosted-management contract; it changes identity/uniqueness semantics. Do not make it a five-year foundation. |
| Custom OAuth/OIDC metadata remapping | No documented isolation guarantee. In the inspected OIDC path, metadata changes occur after linking email evidence is populated. An undocumented OAuth2 mapping detour is not accepted. |

Sources: [identity linking](https://supabase.com/docs/guides/auth/auth-identity-linking), [Before User Created](https://supabase.com/docs/guides/auth/auth-hooks/before-user-created-hook), [hook implementation](https://github.com/supabase/auth/blob/v2.188.1/internal/api/hooks.go), [external flow](https://github.com/supabase/auth/blob/v2.188.1/internal/api/external.go), [custom providers](https://supabase.com/docs/guides/auth/custom-oauth-providers), [configuration](https://github.com/supabase/auth/blob/v2.188.1/internal/conf/configuration.go).

**Required permanent resolution:** an officially supported target-deployment capability that enforces the required trust before unsafe principal linkage or credential access, proved against direct native endpoints as well as the app. The public docs, management schema and adopted source inspected here did not establish such a control. This is an upstream/provider contract dependency requiring resolution, not a request to write a speculative Auth fork or custom broker. Reassessing authentication architecture would require its own explicit founder decision if no supported native solution becomes available. No production setting or provider account was changed in an attempt to bypass the gap.

### G02 — Apple readiness: known requirements, Asym evidence missing

Apple's current environment documentation says web-service authentication requires an existing App Store app using Sign in with Apple, associated identifiers and registered domains. It covers JS and REST; a REST implementation does not establish an exemption. An eligible Asym app/team was not verified, and building a dummy native app is not implicit Phase25 scope. [Apple environment](https://developer.apple.com/documentation/signinwithapple/configuring-your-environment-for-sign-in-with-apple), [web setup](https://developer.apple.com/help/account/capabilities/configure-sign-in-with-apple-for-the-web/).

Use the real Apple subject and relay address. Do not infer an ordinary donor email behind Hide My Email, require its disclosure merely to authenticate, or auto-overwrite contact/legal donor facts. Apple's August24 update introduces `private.icloud.com` for future sign-in addresses while existing `privaterelay.appleid.com` continues; suffix-only classification is brittle. [Apple update](https://developer.apple.com/news/?id=1ptvdtcm).

Tenant mail senders must be registered and correctly authenticated for relay delivery. Apple's current organization-account limit is100 email sources, so a shared app cannot promise unlimited Tenant sender coverage. Qualify the exact active domain/subdomain/source capacity; no silent Asym-wide sender fallback. [Relay service](https://developer.apple.com/help/account/capabilities/configure-private-email-relay-service/).

The generated Apple web client secret expires within six months; the underlying signing key is a different credential. Assign rotation and verified configuration deployment to the platform operator. Supabase documents that Apple OAuth supplies no full name and that it does not handle Apple's server-to-server notification endpoints. A qualified identity-owner lifecycle adapter must handle actual revocation/forwarding/account-change semantics; it must not cancel gifts or delete retained finance records. [Supabase Apple](https://supabase.com/docs/guides/auth/social-login/auth-apple), [Apple account changes](https://developer.apple.com/documentation/signinwithapple/processing-changes-for-sign-in-with-apple-accounts).

### G03 — Facebook public readiness and lifecycle

Development-role success is not public-login proof. Qualify the app's actual mode, basic identity/email permissions, callback, privacy/deletion mechanism and permitted use case with an ordinary non-role account. The Supabase guide qualifies its review discussion; do not assert that every basic login needs the same review, business verification, deadline or API lifetime. Missing/denied email returns calmly to email sign-in without fabricated identity data. [Supabase Facebook](https://supabase.com/docs/guides/auth/social-login/auth-facebook).

Meta primary developer pages returned HTTP429/tool failures during this research. Exact current app review/deauthorization/data-deletion wire requirements therefore remain a named external proof item. No secondary guide was promoted into authority and no arbitrary deadline/checkup schedule is recorded. A validated provider deletion/revocation signal enters the existing identity/privacy owner and retained-record policy; it is not a direct command to erase all Tenant financial history.

## Minimal architecture and explicit ownership

**Authentication:** Supabase owns native users, identities, credential verification, sessions and token issuance. Core does not write directly into `auth.users` or `auth.identities` to repair collisions or forge provider assertions.

**Core identity and access:** P4 owns claim/link intent and current-possession policy; P9 owns Party relationships; P12's single projection resolver and enforcement points own Tenant/context/permission/assurance decisions; Q11 owns related global email/session consequences. Social login, provider names, household membership and the same email never grant a donor/missionary/staff role.

**Delivery:** P4's signed producer hook → P17 immutable secret-safe preparation → P6 sole communication/dispatch → transport remains the auth-email path. Do not add default-Supabase-mail or direct Resend fallback. Google/Apple/Meta deliver their own consent UI, not Asym receipt/newsletter messages.

**Code placement:** retain shared `packages/auth` session helpers, request-specific `packages/database/supabase` clients and canonical `packages/api` business callbacks/claim commands. App routes remain thin. Generic skill aliases such as `@/lib/supabase/server` are examples, not a mandate to create duplicate local wrappers. Use existing Next16/SSR conventions, not another Auth.js stack or manual JWT/localStorage scheme.

**Next.js boundary:** browser and server clients remain distinct; proxy refresh propagates cookies correctly; each protected handler validates current identity and permission itself. `getSession` alone is not server authorization. Signature-valid claims do not prove current grants/revocation; qualified fresh user/session and P12 evidence remain necessary. Private auth/Set-Cookie responses cannot be shared-cached or prefetched as another user's state. [Current Supabase SSR guidance](https://supabase.com/docs/guides/auth/server-side/nextjs).

**Two callback contracts:** standard OAuth code exchange may occur on its protocol callback GET after state/PKCE/request validation. P17's emailed proof landing is different: GET/HEAD remain inert and non-enumerating; deliberate same-origin POST validates the protected handoff and invokes its permitted next step. Do not break OAuth by treating every callback as an email scanner link, or weaken email safety by copying an OAuth callback.

**Return context:** use the verified Tenant host, server-resolved purpose and bounded safe destination; no authority in an arbitrary `next`, host header, provider metadata or Site slug. After successful qualified sign-in, reauthorize the intended Receipts & statements/Ministry Updates page before falling back to the current Tenant home. Host loss does not send credentials to another Tenant or an unapproved central host.

### Minimal database requirements

Reuse existing identity/claim/audit/attempt structures where they can express the adopted contract. Do not invent a parallel provider-user table. Any necessary bounded attempt/link-intent extension must have a stable operation identity, non-null exact scope/purpose, server-derived actor, checked lifecycle, expected revisions, expiry and restricted audit references. Provider subject uniqueness stays at its native authority; Core's verified donor binding and same-Tenant uniqueness stay at theirs.

Composite Tenant foreign keys, immutable scope/actor fields, least-privilege grants and both existing-row/resulting-row checks must prevent a permitted update moving to another Tenant/Party/claim. Restrict destructive cascades through financial/claim history. Actor, approver, timestamps and grants come from trusted server context. Security-definer/service-role paths need the same current checks, narrow execution grants and safe search paths; their privilege is not a user's authorization.

P12 deliberately keeps RLS coarse, without a second identity/capability engine. Preserve that architecture and close unqualified direct Data API/Storage/Realtime paths through its approved enforcement model. Any necessary alteration is an explicit P12 amendment, not hidden in a donor migration. Even flawless Core RLS does not close G01's native Auth credential issue.

No new money columns, currency calculations, wallet customer identifiers or receipt truth belong to auth attempts. Secret verifiers/PKCE/token material use the established bounded credential-handling contract, not ordinary audit JSON or browser persistence. Audit actual effects without storing raw OAuth/code payloads or false proof-of-reading.

## Donor journey — J01–J16

These are corrected target journeys, conditional on their named owner/provider qualifications. They are not statements that current runtime works.

<!-- prettier-ignore -->
| ID | Donor situation | Required behavior |
|---|---|---|
| **J01** | Open a shared ministry/document link | Resolve the verified organization and safe intended destination. Keep guest public access distinct; do not force login to public content or claim authority from the URL. |
| **J02** | Choose how to sign in | Email is primary. Show only qualified offered Google/Apple/Facebook choices with text and official marks. No provider guessing from the typed email, compulsory popup, One Tap, phone collection or four-screen chooser. |
| **J03** | Request email access | Use the source-owned email/claim entry with enumeration-safe public outcomes and abuse controls. One accepted producer request yields one qualified email with link/code alternatives; delivery status is not sign-in. |
| **J04** | Read the email on another device | The first email has a prominent link and secondary code. The original page accepts paste/autofill. Explain that one option is enough; no automatic session transfer or reuse after completion elsewhere. |
| **J05** | Follow the email link | The scanner-safe landing is inert. Deliberate proof redemption establishes only the authority its owner allows, then current claim/access checks determine the destination. |
| **J06** | Enter the code | Verify the exact source request/email/purpose through the owner. Wrong, expired, replaced, consumed and rate-limited results have safe concise recovery. Code and link share one qualified completion; no reusable sibling proof remains. |
| **J07** | Request again, lose a response or use two tabs | Reconcile the exact attempt and preserve currentness. Do not multiply emails on a render, endlessly disable recovery or let delayed old results overwrite the newer session/context. A governed resend explains use of the current message. |
| **J08** | Continue with a provider | Begin a deliberate standard redirect/PKCE transaction under a verified Tenant intent. Briefly explain the shared Asym consent identity. Request only basic identity access; no friends, social posting, contacts, Drive or marketing permission. |
| **J09** | Return from the provider | Accept only a provider transaction whose native G01 trust boundary was enforced before unsafe linkage or credential access. Validate the exact callback state/PKCE result and current host, then perform P4/P12 admission. A later portal check cannot substitute for that native protection. |
| **J10** | Provider returns a different/relay email | Do not guess or merge. Where a safely admitted principal lacks a claim, offer the existing optional proof-based path to connect their giving without revealing matches. Do not demand a real personal address simply to defeat Apple relay. |
| **J11** | Connect a provider to an existing account | Start from a proven current account and obtain the new provider's proof using qualified native linking. Preserve the exact target principal. Already-linked-elsewhere is an explicit conflict, not an automatic merge/delete/transfer. |
| **J12** | Disconnect a provider | Explain the account-wide method change without listing other Tenants. Prove a usable remaining route. If unlink may change the global sign-in email, route the exact change through Q11/P12; do not silently recompute or strand the donor. |
| **J13** | Provider cancels, fails or has no usable email | Return to the same safe Tenant entry and accessible email option. Show a neutral explanation; no fake success, forced repeated consent or error-code page. Email fallback must reach the same principal through qualified proof, not a different address guessed equivalent. |
| **J14** | Recover from relay/provider loss | Use an already usable method or existing identity-owner recovery. Verified revocation/forwarding changes have explicit session and contactability consequences. They do not stop recurring gifts, opt out of marketing or delete financial records. |
| **J15** | Finish and return to the task | Reauthorize and open the requested document/ministry destination. If it no longer exists or is no longer permitted, show a safe current location/explanation. Do not let legacy role-home routing discard valid intent. |
| **J16** | Return on another device or after a security change | Stable account and verified donor bindings survive ordinary provider email/name changes. Current session/assignment epochs fence stale data across all surfaces. No sensitive data or another Tenant's membership appears during transition. |

## Reviewed UI defaults

Use one calm Tenant-branded Maia sign-in surface. A clear email field and **Continue with email** action remain primary. Below a short separator, use stable, full-label provider controls in Google, Apple, Facebook order when qualified/offered. Similar visual weight among social options avoids a row of unexplained icons; stack them comfortably on small screens. This order is a product judgment, not a measured best order.

Provider marks and any mandatory button treatments must follow their official rules. Do not recolor Google's mark monochrome or claim every provider pixel can be Zinc. Put supported provider controls/assets inside shared `packages/ui` composition and keep the surrounding layout, typography, tokens, focus and spacing Maia. No app-local fork, new theme or unnecessary provider SDK is needed solely for a branded button. [Google branding](https://developers.google.com/identity/branding-guidelines).

Use full browser redirects as the normal web path; do not require popups, automatic One Tap or embedded in-app browser support that the provider does not permit. Offer a clear supported-browser continuation when needed. Email/code stays accessible without navigating to a different product. If a provider is temporarily unavailable, explain its status where useful rather than presenting an enabled action that repeatedly fails.

Code entry is one understandable logical input with paste/autofill and leading-zero preservation; a segmented visual treatment must not become several confusing keyboard fields. Its length follows the qualified producer contract. No CAPTCHA puzzle by default without evidence; abuse-triggered protection must retain an accessible recovery route. Do not freeze unverified provider limits or imply email/code is phishing-resistant MFA.

Use current/pending/failed/unknown outcomes with stable focus and accessible status messages. Reflow at320 CSS pixels,200% text/400% zoom, Core44px targets, international names, localization and supported RTL/reduced motion require actual browser proof. Provider names/photos are optional display suggestions, never automatic CRM/legal-donor updates; missing names do not create a compulsory profile-completion detour.

## Category review — C01–C22

Severity describes potential impact; likelihood is qualitative for an inadequately guarded implementation, not a measured incident rate. Source-based risks are distinguished from observed current code and unrun target tests. Every category has an explicit verdict and exact proposed requirement.

### C01 — Problem validity, necessity and alternatives

**Material concern: No invalidating concern with the user need.** The founder explicitly wants convenient provider choices, and link/code alternatives address documented device friction. Provider buttons alone are not the outcome; donors need continued access to the same correct giving. The strongest simpler alternative is email-only, already qualified as a product direction, with fewer provider dependencies but no requested social convenience. **Severity/likelihood: not applicable to the accepted need.**

**Exact requirement:** “Keep the requested link/code plus three-provider product direction, while qualifying each complete account journey. Do not describe email-only delivery as completion of the social requirement or claim retention/conversion improvement without evidence.” This preserves the answer and makes the remaining limitation explicit.

### C02 — Brittleness

**Material concern: Yes.** Different email assertions, relay addresses, missing profiles, provider subject changes or a hardcoded callback can break login or link the wrong person. **Severity: High. Likelihood: plausible**, supported by current Google/Apple/Facebook documentation and the inspected adapters. This **narrows accepted proof and compatibility**.

**Prevention/exact requirement:** “Use validated provider/app/subject identity and the adopted native trust contract, not email/name/relay-suffix heuristics. Qualify each provider/environment/version and revalidate changed domains/subjects. Unknown or mismatched evidence cannot inherit an existing principal's authority.” Missing profile data must not block an otherwise qualified sign-in without an actual source need.

### C03 — Technical debt

**Material concern: Yes.** Adding three independent callbacks, a second auth library or a donor-specific identity store would duplicate the existing stack while preserving its old profile-role/Tenant mistakes. **Severity: High over the feature lifecycle. Likelihood: plausible** from the current password-first bridge and missing target commands. This **changes the implementation boundary**.

**Prevention/exact requirement:** “Reuse shared Auth/SSR and canonical business contracts; replace incompatible donor entry/claim paths through their owners. Do not add Auth.js, a JWT issuer, per-provider CRM tables or undocumented provider remapping. Reconcile existing callbacks, Tenant selection and secret handling rather than wrap them with a new surface.” G01 cannot be concealed by a custom shim.

### C04 — Edge cases

**Material concern: Yes.** Relay/different/no email, two identities already in separate accounts, a donor reading on another device, stale codes or a provider account being removed can create dead ends or duplicate records. **Severity: High for wrong account; Moderate for access friction. Likelihood: ordinary variation.** Evidence is in the provider and J01–J16 sections. This **adds explicit alternatives and recovery**.

**Prevention/exact requirement:** “Cover changed/absent provider email, Apple relay, consumed link/code, multiple devices, denied consent, identity-already-linked and lost-provider cases. Use exact existing claim/link/recovery owners; no fake email, automatic account transfer, hidden donor search, recreated gift history or replayed proof.” A code consumed on a phone is not reusable on a laptop.

### C05 — Footguns

**Material concern: Yes.** Hiding a button may be mistaken for disabling a provider, unlink may silently change the sign-in address, and duplicate submit can issue repeated email or native operations. **Severity: High. Likelihood: plausible**, given documented native unlink and global provider behavior. This **requires explicit operation semantics**.

**Prevention/exact requirement:** “Separate offered entry, native provider availability, method linking, unlinking, sign-out and account closure. Use deliberate named commands and current results. No page load starts OAuth or sends mail; no identity-count-only unlink, default-Tenant fallback or provider-wide setting change from a donor click.” Confirm only genuinely consequential account effects, not every navigation.

### C06 — Tenant safety

**Material concern: Yes.** A shared Auth principal can carry other Tenant or staff rights; a forged return host or unsafe auto-link can expose more than donor history. **Severity: High. Likelihood: conditional but credible**, because the shared-principal architecture is intentional. This **requires native credential safety and existing Tenant enforcement**.

**Prevention/exact requirement:** “Qualify G01 before any existing principal authority is granted, then resolve current Tenant/role/claim through P4/P12. No shared-email, profile home-Tenant, app metadata or callback query confers rights. Provider entry settings are not hard method prohibition. Test other-Tenant/staff/missionary/direct-data paths and context changes.” No cross-Tenant account inventory appears in donor UI.

### C07 — Database, RLS and authorization safety

**Material concern: Yes.** Privileged helpers, implicit grants, scope-transforming updates and direct Auth/Data API endpoints can bypass an otherwise careful app. **Severity: High. Likelihood: plausible**, with inspected current owner policies and profile-Tenant fallback. This **requires structural proof, not a new policy engine**.

**Prevention/exact requirement:** “Prove same-Tenant keys/FKs, non-null immutable scope, unique current bindings, checked transitions, restrictive historical deletes and trusted actor/time provenance through the actual commands. Inspect effective grants, views, functions, RLS `USING`/`WITH CHECK`, service-role and security-definer paths. Preserve P12's single resolver and coarse RLS; do not solve G01 by inventing identity rules inside RLS.” Missing explicit `WITH CHECK` can inherit `USING`; test effective behavior rather than repeating the skill's blanket omission claim. Native Auth account mutation safety remains a separate required proof.

### C08 — Overengineering

**Material concern: No additional architecture is justified by the chosen UX.** The review rejected popup coordination, One Tap, per-Tenant Auth projects, provider-specific donor tables, custom brokers and speculative native apps. **Severity/likelihood: not applicable once those are excluded.** The unresolved native capability is real, not permission to build a workaround. This **constrains the solution**.

**Exact requirement:** “Use one supported Auth system and existing owner boundaries. Add only the bounded request/link evidence actually required by the qualified protocol. Do not introduce enterprise SSO, social API access or a native app to satisfy this question silently. If the supported platform cannot meet G01, expose the architecture decision rather than hide it in implementation.”

### C09 — UX/UI and user friction

**Material concern: Yes.** Four competing sign-in choices, unlabeled logos, forced provider popups, double-verification instructions or generic errors can make self-service worse. **Severity: Moderate; High if recovery blocks access. Likelihood: common without journey testing.** Evidence includes provider UX documentation and current prototype screens. This **changes composition and recovery requirements**.

**Prevention/exact requirement:** “Keep email primary, clearly labelled equally usable social alternatives, one-method-is-enough link/code copy and a preserved return target. Use shared Maia plus compliant provider controls, paste/autofill, stable focus and truthful pending/unknown/error states. Avoid mandatory irrelevant name/address/photo completion. Prove mobile, keyboard and assistive-technology journeys rather than just snapshots.”

### C10 — Source of truth, ownership and domain invariants

**Material concern: Yes.** Auth identity linking could be treated as donor claiming or a CRM merge; provider profile changes could overwrite legal donor/contact facts. **Severity: High. Likelihood: plausible**, with provider convenience patterns and current Auth-trigger defaults. This **requires explicit fact ownership**.

**Prevention/exact requirement:** “Supabase owns native credentials; P4 owns verified claim/link intent, P9 Party relationships, P12 current access, Q11 global email/session effects. Provider subject, Auth user, donor Party, payment Customer and legal donor remain distinct. Sign-in/linking changes no money, receipt, statement, consent or giving authorization.” Browser projections and provider metadata never become write authority.

### C11 — Hidden coupling

**Material concern: Yes.** Apple sender registration couples login recovery to Tenant-branded mail; global unlink can affect other surfaces; ordinary host or app-ID replacement can change provider subjects. **Severity: High. Likelihood: plausible** over a multi-tenant lifecycle. This **requires A2/A3/A5 and exact migration scope**.

**Prevention/exact requirement:** “Qualify provider app/environment, callback, Tenant sender and identity-subject continuity together. Keep provider consent identity distinct from Tenant portal/email identity. Link/unlink runs through shared account security and does not enumerate other Tenants. Treat app/team/domain transfers as governed credential migrations, not harmless display edits.”

### C12 — Failure modes

**Material concern: Yes.** Provider consent can succeed while a callback response, code exchange, claim bind or required audit fails. A blind retry can create a second state or strand the donor. **Severity: High. Likelihood: ordinary network/partial-failure exposure.** Evidence is the native link-before-exchange order and current callback behavior. This **requires durable recovery**.

**Prevention/exact requirement:** “Distinguish external authorization, native identity effect, session issuance, Core admission and claim completion. Reconcile exact known/unknown results using the owning operation. No fresh-key replay of an ambiguous link/unlink, false rollback or partial-success claim. Restore a safe current entry after owner reconciliation; do not leave an indefinite spinner or disable recovery permanently.”

### C13 — Lifecycle, temporal correctness, concurrency and idempotency

**Material concern: Yes.** Parallel link/code redemption, resends, two OAuth tabs or concurrent unlink/email changes can invalidate the wrong request or leave reusable authority. **Severity: High. Likelihood: plausible**, especially on multiple devices. This **requires one qualified source lifecycle**.

**Prevention/exact requirement:** “Bind exact issuer/provider/subject where relevant, Tenant purpose, request revision, PKCE/state, expiry and current authority. Prove at-most-once completion of the email issuance through either path, correct replacement, callback replay and late result rejection. Auth method/email changes serialize through existing owner revisions and session fences; a UI timestamp or HTTP idempotency key alone is insufficient.”

### C14 — Data integrity risks

**Material concern: Yes.** Duplicate accounts, missing provider email, auto-created demo-Tenant profiles or unlink's primary-email recomputation can corrupt identity continuity. **Severity: High. Likelihood: plausible**, supported by current source and provider behavior. This **requires correcting legacy adoption and conflicts**.

**Prevention/exact requirement:** “No fake email or automatic profile/claim/membership from provider metadata. Preserve stable Auth/Party identities, source-normalized proof and existing history. An identity attached to another Auth user is an explicit conflict, not a SQL repair/merge. Reconcile any unlink-caused email change through Q11 before claiming success; never map global provider identity by mutable email alone.”

### C15 — Security and privacy risks

**Material concern: Yes.** Credential linking, leaked codes/tokens, open redirects, cached Set-Cookie responses or excessive scopes can expose accounts or sensitive ministry relationships. **Severity: High. Likelihood: plausible**, with a concrete G01 trust mismatch but no observed live compromise. This **narrows both native and application access**.

**Prevention/exact requirement:** “Resolve G01 at the native trust boundary; enforce state/PKCE/nonce as applicable, exact callback/host allowlists, current P12 authorization and cache isolation. Exclude credentials and protected destinations from logs, analytics, previews and replay. Request identity-only scopes and retain no unnecessary provider API tokens. Provider consent never enrolls marketing or accesses friends/contacts/content.”

### C16 — Scalability and performance risks

**Material concern: Yes, as a design/operations constraint; no current performance regression measured.** Per-Tenant provider apps, remote identity calls for every row, global locks or Apple sender limits can constrain growth. **Severity: Moderate to High. Likelihood: conditional on scale/topology.** Evidence includes the shared-provider model and Apple's published source limit. This **constrains the supported deployment**.

**Prevention/exact requirement:** “Use indexed bounded identity/context lookups and established session refresh; avoid global locks, unbounded in-memory attempts and per-row provider calls. Qualify actual provider domain/sender capacity before admitting a Tenant. Declare production-shaped cardinalities and owner latency/error budgets before release; do not advertise unlimited Tenants or infer performance from a small unit suite.”

### C17 — Operational burden

**Material concern: Yes.** Expired Apple client secrets, provider app mode/review drift, failed relay senders and manual credential repairs can cause recurring support work. **Severity: Moderate to High. Likelihood: predictable unless owned.** Evidence includes Apple secret/relay requirements and Facebook public-readiness conditions. This **requires operator ownership without donor complexity**.

**Prevention/exact requirement:** “Assign platform owners for provider apps, secret rotation, domain/sender qualification, public smoke proof and lifecycle/deletion obligations. Automate supported rotation/checks through existing operations; use established repair paths. No new donor task, email or staff alert for every successful login. Never use direct Auth-table surgery as routine support.”

### C18 — Observability and auditability gaps

**Material concern: Yes.** 'Login succeeded' can conceal a failed claim, unsafe identity attachment, lost return or stale session; raw logging can expose the very proof being diagnosed. **Severity: High. Likelihood: plausible** across the multi-stage flow. This **requires factual, separated evidence**.

**Prevention/exact requirement:** “Correlate nonsecret attempt/operation identifiers across producer, native result, Core admission, claim and destination. Record server actor/scope/policy revisions and actual outcome, not inferred email reading or legal awareness. Secrets, raw hook/code bodies, provider tokens and private full URLs never enter general logs/history. Operators see the correct repair reason through their existing permissions.”

### C19 — Dependency and integration risks

**Material concern: Yes; G01 is unresolved.** Provider adapter support, beta manual linking or experimental linking domains can be mistaken for an enforceable safe contract. Apple eligibility and Meta public requirements add independent dependencies. **Severity: High. Likelihood: confirmed qualification gap**, not a measured exploitation rate. This **blocks activation and implementation-ready status**.

**Prevention/exact requirement:** “Resolve G01 with a documented supported native capability and exact deployment proof before enabling affected social entry. Qualify Apple app/domain/relay and Facebook actual public access/deletion requirements. Do not use private flags, undocumented metadata mapping, an Auth fork or a token hook lacking current provenance as the permanent fix. Escalate a necessary architecture change explicitly if the platform cannot meet the requirement.”

### C20 — Migration, rollout and upgrade risks

**Material concern: Yes.** Linking a new identity to an old account can have security effects that rollback cannot undo; switching app IDs/domains or rolling back can strand credentials and restore unsafe legacy defaults. Native unlink exists, but does not undo prior access or credential effects. **Severity: High. Likelihood: plausible** in deployment/configuration changes. This **requires staged adoption and containment**.

**Prevention/exact requirement:** “Prove current legacy-account adoption, same/different-email conflicts, app/subject/domain continuity and N/N−1 behavior before exposure. Native provider disablement, Tenant entry policy and session revocation have distinct effects. Containment must prevent unsafe native grants, preserve existing account/CRM/document history and maintain qualified recovery. Never delete linked accounts or restore a demo-Tenant/default-email bypass as rollback.”

### C21 — Testability, traceability and proof

**Material concern: Yes.** A provider demo, mocked test or working button could be called safe account linking. **Severity: High if treated as release proof. Likelihood: plausible**, because the current target is absent. This **requires precise proof labels and explicit gaps**.

**Prevention/exact requirement:** “Trace A1–A6/J01–J16/C01–C22 into later authorized P4/P12/P17/P24 contracts, glossary, nonduplicate issues and release evidence. Require real native Auth/PostgreSQL negative linking proof, grants/concurrency checks, provider public configuration evidence and accessible E2E. G01 must remain visibly unresolved until proved; ratification of direction is not certification or permission to publish implementation-ready tickets.”

### C22 — Other development hazards

**Material concern: Yes.** Generic skills or vendor examples may introduce duplicate clients, raw authority in URLs, unsafe GET proof redemption, weak role metadata or unrelated social API/SSO work. **Severity: High for authority defects; Moderate for scope debt. Likelihood: avoidable but plausible.** This **requires disciplined conflict resolution**.

**Prevention/exact requirement:** “Use repo-native imports/shared ownership and current adopted SSR/Next contracts. Distinguish legitimate OAuth GET exchange from inert emailed proof GET/HEAD. Preserve optional guest claiming, restricted-ministry privacy, receipt preferences and financial truth. Do not copy generic tax, MFA, OAuth-broker or provider-data features into this donor sign-in scope. Resolve contradictory source/skill guidance explicitly.”

## Current implementation and executed verification

Inspected local and remote develop: **7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd**. Working/lock Supabase js/auth-js2.103.0, SSR0.8.0; Core's Next manifest is16.3.0-preview.9. The observed local Auth image isv2.188.1, official source tag commit `f3425cf742c69ad663776105e0363d81c5d4d731`. Hosted Auth version/provider configuration was not verified. No package upgrade occurred.

<!-- prettier-ignore -->
| Source | Observed current behavior | Consequence |
|---|---|---|
| `packages/ui/components/auth/LoginScreen.tsx:55–82,140–165`; `FullLoginCard.tsx:72–160`; `RegisterScreen.tsx:74–93` | Password login/signup and legacy hardcoded presentation. | Current bridge, not the accepted donor target. |
| `apps/donor/app/(auth)/forgot-password/page.tsx:10–12` | Reset is not enabled; support placeholder. | Does not establish usable email/social recovery. |
| `apps/donor/app/auth/callback/route.ts:1`; `packages/api/src/auth/callback.ts:14–47` | Thin shared callback and server code exchange; role-home takes precedence over sanitized intended destination. | Reuse shared placement, repair exact return semantics. |
| `packages/database/supabase/client.ts:1–12`, `server.ts:13–45`; `packages/auth/middleware.ts:121–126,190–259` | Shared browser/server SSR and validated-user/proxy cookie propagation. | Durable seams, with handler-level and current-permission proof still necessary. |
| `packages/auth/context.ts:241–340` | Uses profile Tenant hint and inconsistent membership access paths. | P4/P12 target requires server-authoritative Tenant assignment; do not expose the entire authz schema as a shortcut. |
| `20260227060000_auth_role_hardening.sql:62–85` | Rejects user-metadata role escalation but retains a demo-Tenant fallback on profile creation. | Auth-user creation cannot be accepted as donor claim/membership. |
| `20260625002117_canonical_tanstack_db_realtime_rls.sql:159–181` | Existing owner reads resolve through auth.uid/profile, without Q14-native identity-trust qualification. | Demonstrates why G01 can affect direct protected paths, not just the login screen. |
| Current runtime inventory | No target `signInWithOtp`, `verifyOtp`, `signInWithOAuth`, `linkIdentity` or verified claim implementation found in the inspected paths. | A complete-looking auth component does not prove the requested feature. |

**29 existing tests passed,0 failed**, across proxy middleware, client session, redirects, membership RPC contract, role-hardening migration and donor portal ownership. These are current-source tests with mocked Auth/database boundaries or static migration assertions. No new target provider, native Auth attack, PostgreSQL race, real email or browser journey was tested.

Command: `bunx vitest run tests/unit/auth/proxy-middleware.test.ts tests/unit/auth/client-session.test.ts tests/unit/auth/redirects.test.ts tests/unit/auth/membership-rpc-contract.test.ts tests/unit/auth/role-hardening-migration.test.ts tests/unit/packages/api/donor-portal/auth-ownership.test.ts --maxWorkers=2 --reporter=json --outputFile=<local evidence path>`. The structured output is retained in the proof bundle. No broad full-suite claim is made.

The requested Next.js/Supabase skills were read. Their generic aliases and middleware examples do not replace Core's shared-package/Next proxy contracts. The Supabase skill's warning about omitted `WITH CHECK` was qualified against actual PostgreSQL inheritance behavior; no policy was changed. Current official docs/changelog were researched; no blanket latest-version or live-provider assertion is made.

## Exact owner conflicts and dependencies

<!-- prettier-ignore -->
| Item | Disposition |
|---|---|
| P4 A6/A8/A10: magic-link-first, Tenant brand, reserved social and provider-email linking assumptions | A1/A2/A4 explicitly amend the requested scope and proof boundary. No silent reinterpretation. |
| P12: one resolver, unified Tenant context and coarse RLS | Preserve it. Native credential protection is required independently; a parallel RLS identity engine is rejected. |
| P17 Reserved magic-link/OTP catalog and signed producer hook | Adopt one qualified email issuance with two human routes; don't blindly dispatch both keys or store secrets in history. |
| P24 Tenant host/brand | Add only the explicit external-provider-consent exception. Final return and Asym-controlled mail/portal remain Tenant-bound. |
| Q11 related global email/session consequences | Apply to link/unlink effects; do not silently change contact email or other Tenant data. |
| #503/#509/#511/#886, freshly read Open | Reuse foundation work. #509 depends on#505/#506/#508. #511 retains stale direct email/redirect context. #886 retains older email GET-session/303 prose; current P17 inert landing controls govern. Its applicable blockers include#876/#878/#879 and producer dependencies. Reconcile bodies before later dispatch, not through new duplicate tickets. |
| G01 native linking contract | Unresolved, not monitoring. No demonstrated supported target control; provider/upstream resolution or explicit architecture decision is required. |
| G02 Apple; G03 Facebook app evidence | Concrete external qualification items. No approved Asym app/configuration or exact Meta production compliance was certified here. |

## Target proof required before activation

<!-- prettier-ignore -->
| ID | Falsifiable required outcome |
|---|---|
| **T01** | Resolve G01 on the actual supported deployment. A newly asserted unqualified provider email cannot attach to or gain native Auth mutation/refresh rights over an existing principal; test direct endpoints as well as UI. |
| **T02** | Provider fixtures include Google Gmail/Workspace/third-party address, changed email, Facebook absent/returned email, Apple real/relay and exact existing subject. No profile metadata spoof or email collision yields wrong access. |
| **T03** | Real native/Auth/PostgreSQL concurrency covers simultaneous auto/manual link, email change, unlink, reused OAuth state, duplicate callback and first claim. One explainable identity/claim result with immutable evidence. |
| **T04** | One email with link and code completes once through either approved path; scanner GET/HEAD/script behavior is harmless; expiry/replacement/rate controls and wrong-device consumed proof have safe recovery. No secret in ordinary history/log/preview. |
| **T05** | Genuine OAuth callback exchanges under valid state/PKCE and current host/return binding; wrong state, foreign host, open redirect, multiple tabs and provider cancellation expose no session or protected destination. |
| **T06** | Actual PostgreSQL permissions test own/other Tenant/Party/issuer, forged actor/role/tenant, scope-transforming updates, null/duplicate bindings, restrictive deletes, revoked access, privileged functions and direct Data API/Storage/Realtime. |
| **T07** | Link different-email provider after correct current-account proof; reject attached-elsewhere conflicts. Unlink proves usable fallback and handles primary-email/session changes without contact/financial mutation. |
| **T08** | Google/Apple/Facebook public production-shaped provider configuration is exercised with qualified accounts. A developer/test-role login alone does not pass. Document exact app, version, domains, redirect, audience and enabled scope. |
| **T09** | Apple eligibility/app/domain association, relay sender capacity/authentication, client-secret rotation, no-name UI and lifecycle event/session consequences are proved. Email loss has an actually usable recovery path. |
| **T10** | Facebook actual app permissions/mode, absent email, deauthorization and its adopted privacy/deletion mechanism meet current provider requirements. Provider events cannot delete financial/receipt truth directly. |
| **T11** | Donor E2E follows J01–J16 on desktop/mobile/phone-email with correct requested Ministry Updates/document return, claim ambiguity, no matched record and represented access. No compulsory unrelated profile fields. |
| **T12** | Keyboard/paste/autofill, single logical code input, focus/status, official provider marks, supported-browser recovery,320px reflow,200% text/400% zoom, Core touch targets, localization/RTL/reduced motion pass in actual composition. |
| **T13** | Secret-safe logs, provider-token minimization, Set-Cookie/private-cache isolation and stale same-principal epoch/assignment handling are proved, including signout and revoked provider/identity changes. |
| **T14** | Existing password/email/claimed/unclaimed account adoption, N/N−1 clients, provider/app/domain changes, rollout containment and recovery preserve exact identities and history; no legacy demo-Tenant or unsafe default sender fallback. |
| **T15** | Production-shaped load declares active Tenant/user/attempt cardinalities, indexed lookup plans, bounded token/hook work and adopted latency/error budgets. Apple/other provider limits are qualified rather than called unlimited. |
| **T16** | Observed donor tasks demonstrate understanding of link-or-code, provider choice, whose account is used, added proof and safe recovery. Critical account confusion or misleading fallback blocks release; no statistical conversion claim is inferred. |

These are requirements for later execution, not tests represented as run. G01 requires an actual supported design before the rest can be called an implementation-ready package.

## Ruthless synthesis and ordering

**What can be recorded now:** the selected first-email link/code journey and requested Google/Apple/Facebook scope; this completed review; proposed A1–A6/J01–J16/C01–C22; known current-code findings and G01–G03. The corrected product direction remains pending founder ratification. Do not call the native social architecture solved.

**What must be resolved before implementation-ready specification or tickets:** G01's supported pre-link/credential trust contract, any necessary explicit architecture decision if it cannot be met, and owner reconciliation for shared-principal/brand/entry-policy semantics. Apple eligibility and provider app requirements must have precise owner/dependency disposition; no phantom native app or assumed public approval.

**Permanent implementation sequence once those dependencies are resolved:**

1. Amend P4/P17/P24 and the precise P12/Q11 seams under the later authorized workflow, using the accepted provider trust model. Reconcile existing issues rather than create competing identity work.
2. Complete the shared identity/claim/Tenant/SSR return foundation and exact native proof boundary. Preserve optional guest claiming and source-owned messages. Prove native and database negatives first.
3. Qualify platform-owned provider apps, branding, domain/sender topology, lifecycle/rotation and environment separation. Integrate only identity scopes through the supported stack.
4. Complete email link/code and qualified social entry, method-management/recovery and intended destination in the shared Maia UI. Eliminate incompatible legacy entry/writer paths without broad unrelated refactoring.
5. Execute T01–T16, activate only qualified offered routes, and retain reversible provider-specific containment with usable recovery. Do not use a frontend feature flag as the only native-security kill switch.

**Monitor only after qualification:** reuse the platform/identity operations and current incident/repair system. No monitor item substitutes for unresolved native safety.

<!-- prettier-ignore -->
| Signal | Threshold | Owner | Response |
|---|---|---|---|
| Unqualified provider assertion gains an existing account credential or cross-scope access | One confirmed occurrence | Identity/security owner | Contain the native provider grant path, invalidate affected authority through supported controls, preserve evidence and repair before reactivation. |
| Qualified public provider route repeatedly fails its controlled login smoke | Two consecutive controlled failures; any confirmed configuration rejection is immediately actionable | Platform Auth operator | Stop presenting the failing route where appropriate, preserve email/other proved recovery, inspect exact provider/configuration and restore only after proof. |
| Apple web client secret nearing expiry without a verified replacement |30 days remaining is warning;7 days without a verified successor is escalation; expiry prevents activation/use | Platform Auth operator | Renew in secure custody, verify exact config propagation and login, retain rollback only to still-valid credentials. These are proposed operational thresholds, not Apple-mandated lead times. |
| Active Apple relay sender unregistered or fails qualified delivery | One confirmed affected active sender | Communications/platform operator | Contain affected relay-dependent enrollment/recovery, repair exact sender qualification; no central sender or unverified-address fallback. |
| Successful Auth step loses intended authorized destination or produces orphaned current request | One reproducible defect | Donor portal/identity owner | Reconcile exact request and repair return handling; retain safe Tenant entry and source results. |

Routine canceled consent, an ordinary code typo or a user's untracked email reading is not an incident. Privacy-safe aggregate friction/performance signals need the owner's adopted baselines and thresholds before they are used as monitoring commitments.

## Corrected decision and final status

**Proposed corrected record:** “Phase25 retains email-first access with a primary safe link and code alternative in the first qualified email, and adds Google, Apple and Facebook as desired optional donor entry methods. Use one supported Supabase/Core identity system, a narrowly disclosed shared-provider-brand exception, and the existing verified-claim/current-access boundaries. Provider-native account linking must meet the qualified current-possession policy before existing-account authority is granted. Complete method connection/removal, email/relay and recovery consequences through P4/P12/Q11. Adopt A1–A6, J01–J16 and C01–C22 as the reviewed direction and safeguards. G01 remains an explicit unresolved architecture/activation blocker; provider support is not live readiness. No unsupported shim or second identity system is authorized.”

**Accepted by the user so far:** A's link/code presentation and the request for Google/Apple/Facebook. **Not yet ratified:** the detailed amendments, shared-provider branding exception and corrected execution record. **Not ready to claim:** a supported safe native social activation design, Apple Asym eligibility, exact Meta public-readiness compliance, target PostgreSQL/native Auth/provider/browser proof or complete Phase25 specification readiness.

The research result is deliberately candid: this is more than three buttons, but it does not justify a sprawling new identity product. Resolve the exact supported provider trust dependency, preserve the good existing architecture and keep the donor interface small. No source implementation, provider changes, PRD or ticket publication occurred.
