> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

# Question 11 — When a donor changes their email

> **Explicitly founder-ratified, 7 September 2026.** Conrad accepted the complete corrected journey and execution requirements J01–J12, C01–C22 and A1–A5. Proposal/review wording below is the historical research record; these reviewed requirements are now accepted. Owner-contract implementation and target/provider/browser release qualification remain separate required work.

> **A selected, 7 September 2026.** The original A/B question is answered. Corrected journey, execution requirements and explicit owner amendments are in the subsequent review and await ratification. Terminology correction: email is the mutable sign-in identifier; the address itself is not the secret/authenticator or immutable person identity.

**7 September 2026 · Researched recommendation awaiting founder answer.** Question 10's corrected J01–J12/C01–C22 and reviewed additions are explicitly ratified. This is the next grooming question, not a PRD, formal specification or implementation authorization.

## The one decision

When a donor is replacing an old email address, should Asym **guide the related permitted updates through one task**, or **keep sign-in and organization-contact changes as independent tasks with clear links**?

This is a task-completion choice, not merely one page versus two. A carries the donor through the selected related changes and their remaining work; B completes each narrow change independently. Both can be easy, beautiful, secure and self-service. Both allow intentionally different addresses. Neither makes one email field the authority for everything.

## Real-world example

Maria is retiring her old personal email address. She is signed in and can still access both inboxes. She wants to use her new address to sign in and wants her own contact information with the receiving ministry organization, Global, kept current.

Those addresses may presently be identical, but they have different jobs:

- **Sign-in email** identifies the credential she uses to access her login. It is not a donor Party, payment Customer or legal donor.
- **Contact email with Global** is her permitted personal contact information held by this organization. It does not automatically change her sign-in, another person's contact information or an external missionary newsletter.

Message delivery follows its own existing purpose, consent, security and destination rules. This question does not create a new receipt destination setting or promise that every queued message changes address. Maria's example is illustrative; no donor frequency or support-reduction statistic is claimed.

## Clear alternatives

<!-- prettier-ignore -->
| | A — Guide the related changes together | B — Keep the changes as separate tasks |
| --- | --- | --- |
| Maria's journey | Starts Change email, sees the clearly labeled current uses and chooses the permitted changes she wants. The task helps her complete the selected sign-in and organization-contact steps, including verification and any unfinished result. | Uses Change sign-in email, then separately edits Contact email with Global. Each task explains its scope and links to the other setting where useful. |
| Re-entering the new address | The flow can reuse her entered address for the changes she explicitly selects; no Update everywhere promise. | Each narrow editor has its own input and completion. |
| If she only wants one changed | Complete only that selected use; retain the other address deliberately. Targeted entry stays focused. | Open the relevant editor and change only that use. |
| Main strength | Helps a donor finish the real job of retiring an address without assuming that changing one field fixed the other. | Makes each task and its authority especially simple; useful when different addresses are deliberate. |
| Real cost | Needs clear coordination of verification, independent outcomes and remaining steps. It must avoid a confusing list of backend email copies. | A donor replacing an address in more than one place must complete the separate tasks; explanatory links help but do not carry the full task through. |

**Recommend A — Guide the related changes together.** It best fits the self-service-first direction: help donors understand the two jobs and finish their chosen update with minimal repetition. Keep narrow sign-in-only/contact-only entries available, and show the exact scope and outcome instead of an ambiguous “Email updated.” This recommendation is an Asym product judgment, not a claim that research proves all combined workflows outperform separate editors.

B is a strong alternative, not a staff-only or intentionally awkward design. Its benefit is purposeful separation of a login credential from this organization's contact record. We should choose B if that narrower task boundary matters more than helping the donor complete several related changes in one guided task.

There is no third “automatically change everything” option: that would conflict with the accepted identity, consent, authorization and document boundaries rather than offer a fair competing design. This question also does not decide checkbox defaults, step counts or one atomic cross-system save.

## What current research establishes

- **Fundraise Up** explicitly asks, when a supporter changes profile email, whether the new address should receive future donation receipts. **Useful precedent:** explain an associated use at the moment of change. Its default selection, identity model, active-plan propagation and receipt rules are not imported into Asym. [Supporter experience](https://fundraiseup.com/docs/donor-portal-experience/).
- **Planning Center** separates its login method from contact information. Its Services guide explicitly says profile-email edits do not change login and directs the person to update login separately. **Useful precedent for B**, and evidence that an unexplained generic Email field can leave users with an unfinished task. This is Planning Center/Services documentation, not proof of the complete Church Center donor email-change journey. [Login settings](https://help.planningcenter.com/en/140717-log-in-to-planning-center.html), [Services profile guide](https://help.planningcenter.com/en/142864-update-your-profile.html).
- **Blackbaud ID** separates authentication details and verifies a new inbox in its managed-identity flow. **Durable pattern:** requested and verified changes are different states, and the identity owner determines the change. It does not prove a constituent contact record changes too. [Authentication details](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/admin/content/id-auth.html).
- **Givebutter** distinguishes personal login from recurring plans that may need deliberate linking. **Useful precedent:** an email edit is not a shortcut to claim every matching gift. Do not copy another provider's claim or receipt-link authority. [Personal profile](https://help.givebutter.com/en/articles/3670204-how-to-manage-your-personal-user-profile), [Recurring-plan management](https://help.givebutter.com/en/articles/4529176-how-to-edit-and-manage-your-recurring-donation).

Pushpay's official profile page returned a loading/error shell; no recommendation depends on an unverified account-edit claim from it. No live donor account or verification-email journey was exercised. Primary documentation gives useful precedent, not measured Asym usability.

## Why this remains open in Core

Source inspected at develop `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`:

- P4 already settles optional verified claiming, magic-link/OTP-first entry, separate per-Tenant access and shared-credential limitations. Do not reopen password-first versus passwordless, create a new claim shortcut, or treat a contact edit as proof of identity.
- P9 keeps `donors.email` as its claiming/consent key and reserves generic contact normalization. **Durable ownership boundary:** this question is not permission to invent a universal contact-point directory or mirror every email column.
- P12 and issue #686 govern identity-email changes and sensitive/restricted-grant re-evaluation. Ordinary grants and sensitive grants have different consequences. Neither option can promise all access remains unchanged or use an ordinary contact edit to trigger the wrong identity event.
- P17 keeps `identity_email_change_v1` Reserved and explicitly defers profile/address/contact confirmation until the source command and security consequence are qualified. Both options require this owner work; a prettier editor does not activate an unsupported message purpose.
- P24 preserves the unified Tenant portal/brand and exact auth-return context. Explain the actual credential scope without enumerating other organizations or implying the current Tenant's contact change updates their data.

No inspected governing source settles whether the donor should be carried through the related selected updates as one task. That is the Q11 choice. Existing owners still determine verification, command effects, purpose delivery, claim security and grants.

## Current behavior versus the permanent direction

The current donor Profile save is real for its allowed name/phone/avatar fields. Its email input is disabled and says Contact support to change your email; the strict settings patch rejects email. The displayed value uses stored profile email with donor-email fallback, not a proved current Auth sign-in value. Separate password/reset controls include placeholders. Do not label the entire page fake or treat it as a complete account-management implementation.

Relevant source anchors: `apps/donor/app/(dashboard)/donor-dashboard/settings/page-client.tsx:124–175,325–345`; `packages/api/src/donor-portal/settings-patch.ts:3–18,96–128`; `model.ts:450–456`; `packages/auth/context.ts:271,298`. The creation-time Auth-to-profile trigger is not evidence of ongoing email synchronization. Enabling the existing input or writing profile/donor emails together is not a valid implementation of either option.

**Temporary bridge:** current support-only email field preserves the absent mutation boundary. **Implementation accident:** a generic stored Email label masquerading as the credential source. **Durable pattern:** distinct Auth/CRM/consent/document owners with current authority. **Conflict with first principles:** automatic updates everywhere, silent identity reassignment or account creation to work around a lost inbox.

## Common boundaries for either option

1. Only the donor's currently permitted personal contact uses for this organization are included. Represented giving, household membership or a shared email does not grant another person's contact-edit rights.
2. Necessary verification and recovery remain source-owned. A sent verification request is not a completed email change; show exact pending/succeeded/failed/remaining steps. No assumed atomic Both save or duplicate owner command after a callback.
3. A sign-in change may have shared-credential consequences; a contact update is scoped to this organization. No global address book, cross-Tenant contact propagation or enumeration of other memberships.
4. Preserve consent and suppression/delivery rules. New-address verification is not marketing opt-in or permission to bypass delivery safety. Changing contact information is not the same as changing a topic preference.
5. Preserve prior gifts, legal donors, receipts, statements and accepted payment/recurring authorizations. No historical rewrite, reissue, new payment or email to missionary-managed newsletters.
6. Guest claiming, ambiguous matches and lost-old-inbox recovery use their existing owners and safe help. This question does not resolve or bypass those separate consequential journeys.
7. Use exact shared Maia/Base UI, clear labels, accessible verification return, retained safe input and quiet outcome messaging. No universal cross-device draft or new generic coordination engine follows from A.

## Dependencies and proof limits

Existing owner work includes [#509 verified claiming](https://github.com/Asymmetric-al/core/issues/509), [#511 branded auth-message integration](https://github.com/Asymmetric-al/core/issues/511), [#686 identity-email/grant binding](https://github.com/Asymmetric-al/core/issues/686), and [#1482 portal/auth-message ownership reconciliation](https://github.com/Asymmetric-al/core/issues/1482). Current bodies are open/blocked as recorded by the research lanes. Their old claims that the consent gate is absent are not current evidence; the gate exists. They do not themselves implement donor email change or fix every contact-purpose command.

Committed local Supabase settings were inspected only as local configuration; they do not establish hosted verification behavior. No provider setting, email, database or account was changed, and no new execution test ran for this question. Q10's historical proof bundle remains unchanged. Prior ratifications and the five existing setup files remain preserved. No PRD, issues or implementation has been authorized.

**When a donor replaces an old email address, should Asym guide the related permitted changes through one task, or keep them as separate tasks?**
