# D6 — native newsletter signup: UX and primary comparison

Research only, **2026-10-16 UTC**. This note supports the Phase 28 adversarial
review; it is not a specification, owner amendment, implementation or release
claim. The founder selected **direct native signup**, with missionary control
over whether the signup is shown on the public giving/profile page, and asked
for clear, useful, simple visitor and missionary experiences. The parent owns
the exact decision record and ratification. No application, source contract,
provider, live audience or subscriber was changed in this workstream.

## Selected outcome and recommendation boundaries

The selected outcome is a direct path to the missionary's native newsletter,
not an unconfirmed request that someone must manually process. It includes a
missionary-facing page-display choice. It does **not** by itself select the
contact-proof mechanism, establish legal consent policy, publish a restricted
page, create CRM/supporter membership, or settle every transition of a pending
signup. Those require the exact source-owner amendment and qualification.

**Lean recommendation:** place one named newsletter section on the existing
public page, outside the giving transaction, using the existing design system.
Ask for Email address and, only if the qualified purpose uses it, a single
optional Name. Explain whose email newsletter this is, what signing up does,
and how to stop it. Offer the relevant next step without a marketing modal,
account-creation detour, routine staff approval, form-builder setup, or a matrix
of new channels and frequencies. Use one control in the existing missionary
page settings, with the actual public state and existing preview/release path.

The parent and communication-owner review converged on a proposed first-release
amendment: **fresh exact-purpose confirmation for every new admission or
resubscription; an already active subscription is unchanged and sends no extra
email**. The email link opens an inert landing page with an explicit **Confirm
signup** action; opening/prefetching the link does not subscribe. This is the
review recommendation being reconciled, not a separately selected founder
detail or a qualified runtime. An existing Auth/verified-email flag is not a
first-release shortcut. Reuse of prior proof is only a possible future
owner-qualified alternative, not this note's implementation recommendation.

Email is the delivery destination and an unauthenticated visitor can enter
someone else's address. Confirmation is a justified protection here, not a
claim that double opt-in universally proves consent or is legally mandatory.
It proves access to an address at that time, not a person's legal identity or
authority over a household, donor account, protected story, or another
newsletter. A new confirmation still cannot override a later withdrawal or
broader restriction through an old pending intent.

Do not make verification optional through a new missionary setting. Let the
owner-qualified policy determine what is necessary, then explain that path
plainly. Public signup does not approve automatic digests, daily/weekly/monthly
cadence controls, SMS, postal enrollment, tracking, recurring campaigns or
automatic welcome mail. The broader native newsletter/print coverage remains
required by the founder brief; this entry decision does not silently add all of
it to the public signup form.

## Repository evidence and UI constraints

| Local source inspected                                                                                                                                                                                                                       | Relevant meaning and limit                                                                                                                                                                                                                                                                                                                                               |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Founder brief, sections 9 and 12](../phase28-founder-brief.md)                                                                                                                                                                              | Complete native newsletter work is already requested. Native signup and preference-center changes need an explicit amendment; previous requests, gifts, follows and interactions do not become consent. Recipient-only access must remain distinct from supporter/finance access.                                                                                        |
| [Q6 research](../phase28-q6-newsletter-entry-research.md)                                                                                                                                                                                    | The interviewed choice changes the public visitor's job from requesting a handoff to deliberately joining a native newsletter. Its pre-answer header was still pending when read; the current founder answer supplied by the parent governs this research, not that stale status.                                                                                        |
| [P25 experience EX11–EX13/EX16](../../../../prds/sitestacker-parity/phase-25-donor-dashboard-depth/contracts/experience.md)                                                                                                                  | The current request-only lane has optional single Name, required editable Email, no account/donation/inbox proof, no visitor confirmation mail, durable same-operation recovery, private answer/result state and no implicit enrollment. D6 needs a distinct explicit amendment, not a label change over these old semantics. Preserve old occurrences and their limits. |
| [P25 experience EX3–EX5](../../../../prds/sitestacker-parity/phase-25-donor-dashboard-depth/contracts/experience.md)                                                                                                                         | Source-specific display/email choices, actual saved state, contact proof, suppression, delivery and withdrawal are distinct. Preference changes are not routine bell alerts, missionary tasks or support scores. Do not merge newsletter preferences with Show in my Updates/Email me about new posts.                                                                   |
| [P22 D10 and preview stories](../../../../prds/sitestacker-parity/phase-22-public-ministry-pages.md)                                                                                                                                         | Preview is authenticated, exact-Page and exact-candidate authorized, no-store/noindex; preview interactions are inert. A missionary's switch cannot bypass Page release or restricted-worker disclosure. Reuse the relevant page owner's existing saving/publication semantics.                                                                                          |
| [Communication evidence](../phase28-communication-evidence.md)                                                                                                                                                                               | P23 public intake, P6 purpose/contact eligibility and delivery, P17 content/preparation, P25 experience and P28/P12 recipient projection have separate obligations. The known exact preparation/submission gap is not repaired by an attractive signup form or a direct provider call.                                                                                   |
| [D6 page-control owners](page-control-owners.md) and [product synthesis](product-synthesis.md), read after this note's first draft                                                                                                           | Research proposals aligned with this UX: one existing exact-Page control; Off closes new intake through that entry without unsubscribing existing readers; accepted pending work follows its own source rules. These notes are not source amendments or implementation evidence.                                                                                         |
| [Frontend rules](../../../../../docs/ai/rules/frontend.md), [shared UI contract](../../../../../packages/ui/AGENTS.md), [components.json](../../../../../packages/ui/components.json)                                                        | Exact `base-maia`, Base UI primitives, Zinc-oriented semantic tokens and shared `@asym/ui` components. Keep existing page hierarchy, typography, spacing and states. No alternate signup theme, app-local component fork or independently styled embedded vendor form.                                                                                                   |
| [Accessibility skill](../../../../../docs/ai/skills/accessibility-review/SKILL.md), [touch guidance](../../../../../docs/ai/skills/emil-design-engineering/touch-accessibility.md), [testing rules](../../../../../docs/ai/rules/testing.md) | Native semantics, usable names/errors, manual keyboard/focus checks, touch targets and responsive states. Core's 44px touch guidance is stronger than WCAG 2.2 AA's 24 CSS pixel target minimum with exceptions; do not confuse them. Documentation review is not a conformance result.                                                                                  |
| [Shared Button](../../../../../packages/ui/components/shadcn/button-component.tsx) and installed Base UI `docs/react/components/button.md`                                                                                                   | Installed Button guidance recommends preserving focus during loading. The shared wrapper currently forces `focusableWhenDisabled=false` for disabled submit buttons. A concrete composition concern to test on the implemented signup, not proof of a present D6 accessibility defect. No wrapper change made.                                                           |

No independent page settings registry, shadow recipient database, provider integration or
campaign-admin surface is recommended. A component/library feature does not
establish authorization, completed submission or accessible behavior in Core.

## Current primary sources

All URLs below were opened on **2026-10-16**. “Documented” means a current public
primary page describes the behavior; it does not mean we authenticated into the
vendor, submitted a form, inspected its backend or measured conversion. Exact
publication/update dates are recorded only where visible. Search crawl dates
are not publication dates. No interviews or usability results were invented.

| ID / primary source                                                                                                                                       | Date and evidence class                                                           | Supported observation, useful lesson and limit                                                                                                                                                                                                                                                                                                                   |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E1 — [Epistle Tour](https://www.epistle.org/tour/)                                                                                                        | Undated current marketing tour.                                                   | Describes recoverable short updates, combining updates in email and recipient-selected daily/weekly/monthly frequency. Useful example of letting recipients understand and control the communication. It does not document signup confirmation, existing-subscriber handling or suppression races. Frequency/digest features remain separate Asym scope choices. |
| E2 — [Epistle Security](https://www.epistle.org/security/)                                                                                                | Undated current vendor guidance.                                                  | Separates private posts, an invisible site and notification-only email; warns that some high-risk contexts are unsuitable. A public signup and its messages need their own disclosure review. Vendor security claims, TLS or a “secure” label do not justify exposing a restricted worker or promising safe disclosure.                                          |
| E3 — [Mailchimp: About Double Opt-in](https://mailchimp.com/help/about-double-opt-in/)                                                                    | Undated current product help.                                                     | Distinguishes initial form submission, confirmation email/link and subscribed status, with separate intermediate/final result pages. The optional final welcome email is a separate feature. Its hosted-form restrictions, CAPTCHA and vendor defaults are not Asym policy or proof of delivery.                                                                 |
| E4 — [Mailchimp: Single versus Double Opt-in](https://mailchimp.com/help/single-opt-in-vs-double-opt-in/)                                                 | Undated current product help.                                                     | Documents the real tradeoff: fewer steps versus an additional email confirmation step. Claims about growth, valid addresses and preference are vendor guidance, not measured Asym outcomes or proof that a link click identifies a human. Do not copy its generalized legal assertions.                                                                          |
| E5 — [Mailchimp: Confirmation-email troubleshooting](https://mailchimp.com/help/troubleshoot-the-opt-in-confirmation-email/)                              | Undated current product help.                                                     | Describes variable delivery time, filtering, spam folders, sender-domain problems and form configuration faults. Supports a persistent explanation, address correction and qualified recovery. Its suggested waiting period is not an Asym timeout, resend interval or delivery promise.                                                                         |
| E6 — [Mailchimp: Embedded signup forms](https://mailchimp.com/help/customize-embedded-signup-form/)                                                       | Undated current product help.                                                     | Documents preview and field help; deleting an embedded form does not remove already embedded website code. This is a useful stale-public-entry counterexample. Asym should reconcile display and admission through its native owner path, not require missionaries to paste/remove code or assume visual hiding closes every endpoint.                           |
| E7 — [Mailchimp: Consent forms](https://mailchimp.com/help/collect-consent-with-gdpr-forms/)                                                              | Undated current product help; vendor compliance guidance.                         | Records the form information a contact saw and stresses that consent descriptions must match actual use. This supports evidence of the exact presented purpose. It is not legal advice or a license to email old requesters for re-consent; the article itself says turning on fields alone does not establish compliance.                                       |
| E8 — [Squarespace: Newsletter blocks](https://support.squarespace.com/hc/en-us/articles/205826068-Newsletter-blocks)                                      | Updated **2026-09-17**, current product help.                                     | Supports title/description, optional name collection and post-submit feedback in a page section. Useful simple embedded-form pattern. Its configurable styling, separate storage integrations, automatic contacts and verification switches are unnecessary or conflicting machinery for this native source-owned task.                                          |
| E9 — [Squarespace: Subscriber verification](https://support.squarespace.com/hc/en-us/articles/360041087192-Email-Campaigns-subscriber-verification)       | Updated **2026-10-05**, current product help.                                     | Distinguishes confirmation-pending entries from subscribers and documents delivery troubleshooting. Treats CAPTCHA and email as configurable verification options. Bot screening and address access proof are different jobs in Asym; do not copy the vendor's equivalence or expose its policy switch.                                                          |
| E10 — [Squarespace: Newsletter at checkout](https://support.squarespace.com/hc/en-us/articles/206540717-Adding-a-newsletter-subscribe-option-to-checkout) | Current help; exact revision not established in this pass.                        | Describes a separately labeled signup checkbox, default unchecked, and wallet-checkout exceptions. Demonstrates that checkout coupling adds variants. The Mailchimp “automatic opt-ins” paragraph is internally confusing about double-opt-in; do not use it as proof of a safe consent policy. No donor-conversion claim follows.                               |
| E11 — [Givebutter: Signup form widget](https://help.givebutter.com/en/articles/9061803-how-to-embed-a-signup-form-widget-on-your-website)                 | Current help; displayed **“Updated over 2 weeks ago”**, not an exact date.        | Offers static or popup forms, clear title/button/description and email/phone choices. Its form entries automatically become CRM contacts; its widget is not campaign-specific. Learn from plain purpose text and static placement, not automatic CRM admission, popup timing or generic organization-wide scope.                                                 |
| E12 — [Virtuous: Email lists](https://support.virtuous.org/hc/en-us/articles/360051097692-How-Do-I-Manage-Email-Lists)                                    | Updated **2025-07-02**, current help with older screenshots.                      | Separates newsletter and appeal lists and supports topic versus global unsubscribe. Recipient-visible names/descriptions matter. Its primary-email retargeting, manual/bulk additions and contact permissions do not govern Asym's destination-bound proof or admission.                                                                                         |
| E13 — [Virtuous: Subscription preferences](https://support.virtuous.org/hc/en-us/articles/28506288072717-Managing-Subscription-Preferences)               | Updated **2025-07-02**, current help.                                             | Documents distinct group/global/preferences links, a confirmation result and inert links in test mail. Its browser flow asks the address again, while mailbox-provider one-step unsubscribe remains supported. Learn exact scope and inert preview; do not add address re-entry, extra withdrawal friction or unrelated topic exposure by imitation.             |
| E14 — [Ghost: Setting up newsletters](https://ghost.org/help/setup-email-newsletters/)                                                                    | Undated current manual.                                                           | Separates newsletter sending, individual newsletter setup and newsletter archival; optionally enrolls existing members into a new newsletter. This is a useful warning that “newsletter off,” “hide signup” and “unsubscribe people” are different actions. Do not import automatic existing-member enrollment or treat archive as a display toggle.             |
| U1 — [GOV.UK: Email addresses](https://design-system.service.gov.uk/patterns/email-addresses/)                                                            | Undated current design guidance.                                                  | Explain purpose; allow paste/autofill; use email keyboard, no spellcheck and review/correction. A suspected domain typo should not silently rewrite input. Repeated email entry needs evidence. This form is self-entry, unlike D5's third-party CRM editing, so email autocomplete is appropriate.                                                              |
| U2 — [GOV.UK: Confirm an email address](https://design-system.service.gov.uk/patterns/confirm-an-email-address/)                                          | Undated current design guidance.                                                  | Confirmation proves address access, not identity. It interrupts the journey; address correction, resend, expiry and next-step clarity need deliberate design. Use the principle, not account activation wording, compulsory donor login, a copied numeric lifetime, or automatic reminder behavior.                                                              |
| U3 — [GOV.UK: Confirmation pages](https://design-system.service.gov.uk/patterns/confirmation-pages/)                                                      | Undated current design guidance.                                                  | Make completion and what happens next understandable; returning/bookmarked results should remain helpful. Does not require a full-screen receipt, PDF, new reference-number system or confetti for a newsletter signup. A short persistent inline result or focused result page can satisfy the job.                                                             |
| U4 — [W3C: Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)                                                             | Updated **2026-05-11**, informative explanation of WCAG 2.2 SC4.1.3 AA.           | Qualifying async status messages need programmatic exposure without taking focus. Not every content change is a status message. This does not require moving focus on each pending/result update or duplicate live-region announcements.                                                                                                                         |
| U5 — [W3C: Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)                                                   | Current informative explanation of SC3.3.1 A; exact page revision not recorded.   | Detected input errors must identify the erroneous item and describe the problem in text. Does not require a modal or a particular error placement. Submission/service failures must not be falsely presented as an invalid email address.                                                                                                                        |
| U6 — [W3C: Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)                                                     | Updated **2026-05-11**, informative explanation of SC2.5.8 AA.                    | Minimum is 24×24 CSS pixels or applicable exceptions, including spacing. Core's 44px touch recommendation remains the practical target. Neither a token nor an automated test proves that every rendered target works.                                                                                                                                           |
| U7 — [W3C: Focus Not Obscured Minimum](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html)                                       | Current informative explanation of SC2.4.11 AA; exact page revision not recorded. | Focused components must not be entirely hidden by author-created content. Complete visibility is the stronger goal, not the exact AA wording. Check sticky giving controls, error regions and mobile presentation without claiming the criterion alone governs every operating-system keyboard behavior.                                                         |

The strongest comparable evidence is ordinary product help for clear purpose,
separate pending/confirmed states and preference scope. Epistle contributes a
relevant missionary communication model but not a verified signup protocol.
There is **no measured evidence here that a particular placement or number of
fields improves giving or signup conversion**. The recommendations below are
design judgment to be tested with representative visitors and missionaries.

## Minimal missionary journey

The following copy is illustrative and conditional on actual source state.
Use the source-approved public display name, not an internal worker name or
location. “My public page” should become the precise page name when a person
can legitimately manage more than one; do not pretend a person and a Page are
the same object or add a new global account switch.

| Moment                | Minimal recommendation                                                                                                                                                                                     | What must remain true                                                                                                                                                                                                                                |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Find the choice       | Existing public-page settings: **Newsletter signup**. One control labeled **Show newsletter signup on my public page**.                                                                                    | Exact Page/context and current edit authority; no new feature-management app or second permission surface.                                                                                                                                           |
| Understand the choice | **Visitors can sign up for [public name]'s email newsletter. Hiding the form does not unsubscribe existing readers.**                                                                                      | Name/purpose approved for public disclosure. This explains page display, not a global sending permission.                                                                                                                                            |
| See present truth     | **Shown on public page** or **Hidden from public page** only after a qualified read. Use **Not yet published**, **Change not published**, or the existing owner wording when that is the actual condition. | Desired setting, saved candidate, published/effective state and temporary capability failure are distinct. Never show a successful live state merely because a switch moved.                                                                         |
| Preview               | Existing **Preview page**, clearly identified as preview, showing the intended signup placement and approved copy.                                                                                         | Authenticated exact-candidate preview; submission/confirmation/donation effects inert. Explain **Preview only — signup is not submitted** when testing the form affordance. Do not create a public preview URL or send test mail by opening preview. |
| Save/change           | Existing page save/release command and concise local status. No extra confirmation dialog solely for this reversible display setting.                                                                      | Any owner-required publication review remains. Do not invent instant autosave over an existing draft/publish contract or routine staff approval over an already authorized direct change.                                                            |
| Hide                  | Same control, persistent saved/effective state. Nearby helper remains available.                                                                                                                           | Existing subscriptions, source preferences and unsubscribe recovery remain intact; no data purge, archive, cancellation of queued sends or new private page is inferred.                                                                             |
| Cannot change         | Readable current state with an honest explanation when authorized to know it; available existing repair/permission path.                                                                                   | Distinguish lack of permission, unavailable setup, loading and failed checks. Do not display a fake working switch or expose restricted reasons to the wrong audience.                                                                               |

**Do not add settings merely because vendors have them.** No arbitrary field
builder, per-form recipient ACL, frequency selector, compulsory welcome email,
automatic enroll-existing toggle, popup delay, notification-recipient picker,
HTML disclaimer editor or second sender configuration is needed for this
decision. Required safe instructions belong beside the control/form, not in a
mandatory onboarding course or a hidden tooltip. Optional editorial copy needs
the normal content/publication rules; D6 does not create unlimited public HTML.

**Important scope edge:** the founder selected control of what is shown. The
owner amendment must state what happens to (a) a stale form already loaded,
(b) an accepted pending confirmation and (c) any previously shared signup URL
when this control changes. Recommendation: remove the current public entry,
stop new intake through that entry and recheck current page-purpose admission
on new submissions; keep existing
subscriptions and withdrawal unaffected. Do not call the control “Stop
newsletters.” Whether an already accepted, still-valid confirmation can finish
after hiding needs one exact source rule and matching copy. Do not silently
create a second pause switch to avoid resolving that boundary.

## Minimal visitor journey and truthful states

Recommend a static section on the ministry page. Keep Give visually primary
where giving is the page's main job; newsletter signup is a distinct optional
action, outside the donation form and its validation. Position, width and visual
weight are ordinary design decisions to validate, not new founder questions.
Do not interrupt entry, payment, wallet handoff or donation confirmation with a
signup modal. Donation completion and newsletter failure must remain
independent. This is a UX recommendation, not a claim that the founder already
forbids every future checkout opt-in experiment.

| State / action                                            | Suggested short copy or behavior                                                                                                                                                                                                                                   | Boundary and recovery                                                                                                                                                                                                                                                                                              |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Form available                                            | Heading **Get [public name]'s newsletter**. Help **Receive their email newsletter. You can unsubscribe at any time.** Required **Email address**; optional single **Name (optional)** only if used. Action **Sign up**.                                            | Explain the exact approved newsletter purpose; include the appropriate privacy notice link. Do not invent frequency, promise private stories, call the visitor a donor, or require a gift/account. If purpose policy needs another explicit choice, present that exact choice rather than generic bundled consent. |
| Confirmation explained                                    | Before submit: **New signups need email confirmation.** The parent also proposes **We'll ask you to confirm your email**; retain the existing-subscription clarification in the result.                                                                            | New admission/resubscription uses the fresh exact-purpose path. Existing active membership remains unchanged and sends no mail. No technical “double opt-in” jargon and no “Verify your identity.”                                                                                                                 |
| Missing or invalid input                                  | **Enter your email address.** / **Enter an email address in the correct format, like name@example.com.**                                                                                                                                                           | Preserve typed input, place error with field, expose its relationship, and focus/reveal the error appropriately. A provider outage or withheld eligibility is not a format error.                                                                                                                                  |
| Possible typo                                             | A cautious suggestion with an explicit accept/edit path, if supported by qualified validation.                                                                                                                                                                     | Never silently change domain, plus tag, dots, case-sensitive meaning or destination. A valid unusual address must not be forced into a common-provider address.                                                                                                                                                    |
| Submitting                                                | **Signing up…**, stable form/result region.                                                                                                                                                                                                                        | Prevent repeat activation of the same in-flight attempt while keeping a usable keyboard/focus path. Do not erase the address, steal focus on each state change or submit another purpose on retry.                                                                                                                 |
| Accepted initial result, including possible pending proof | Heading **Signup received** only after durable intake acceptance. Body **If a confirmation email is needed and can be sent, we'll send you a link. Existing subscriptions stay unchanged.** Show the initiating address only in the permitted private interaction. | One safe receipt for accepted branches, including existing active/no mail and restricted delivery. This is not **You're subscribed**, **You're not subscribed yet**, or proof of mail delivery. Do not disclose whether an arbitrary typed address exists, gives, is suppressed or subscribes.                     |
| Confirmation email and landing                            | Email action **Confirm signup** identifies the exact safe public newsletter. Its link opens an inert page explaining the same newsletter with a deliberate **Confirm signup** button.                                                                              | The first-release owner recommendation requires the explicit action; GET, preview, prefetch or scanner access cannot activate. Avoid an additional review wizard or unrelated account login. One email subject/content purpose; no welcome campaign bundled into proof.                                            |
| Address typo after submit                                 | **Use a different email address**; clearly show/edit the user-entered address in the permitted interaction.                                                                                                                                                        | This deliberately starts the qualified correction/new attempt; it does not claim to recall previous mail or edit a canonical donor email. Explain affected pending confirmation if the owner invalidates it.                                                                                                       |
| Email did not arrive                                      | Small **Didn't receive an email?** help: check the address and spam/junk folder, plus a qualified **Send another link** action if supported.                                                                                                                       | No arbitrary arrival countdown, unlimited resend, or promise delivery succeeded. Rate limits and current eligibility remain authoritative. Keep recovery available beyond a transient toast; allow normal browsing/giving.                                                                                         |
| Confirmed successfully                                    | **You're subscribed to [public name]'s newsletter.** **Return to ministry page**; the exact permitted preference/unsubscribe path if available.                                                                                                                    | Only after authoritative acceptance for this exact newsletter/destination. No automatic account creation, donor dashboard access, other-topic enrollment or recurring welcome campaign. Confirmation access is narrowly scoped.                                                                                    |
| Already subscribed, exact status authorized               | **You're already subscribed to [public name]'s newsletter.** Offer the existing narrow preference path.                                                                                                                                                            | Only after the source proves authority to disclose this fact; never an anonymous email-lookup result. No duplicate membership, extra welcome or regression to pending.                                                                                                                                             |
| Expired or superseded link                                | **This signup link is no longer valid.** Explain an allowed next step, such as **Get a new link**.                                                                                                                                                                 | Do not invent expiry duration or expose private reason/history. Distinguish a replay of completed work from a genuinely invalid link where authorized; do not tell a successfully subscribed person they failed merely because the link was used.                                                                  |
| Known rejection/no acceptance                             | **We couldn't complete this signup.** Show safe cause-specific repair when permitted.                                                                                                                                                                              | Do not claim saved/received/subscribed. Keep the visitor's permitted input and independent giving/browsing usable. Do not turn every refusal into “Try again” or send them to create an account.                                                                                                                   |
| Timeout/unknown result                                    | **We couldn't confirm the result.** Offer same-operation checking/recovery through the qualified path.                                                                                                                                                             | Not **Nothing changed** or **Try signing up again** as an automatic new attempt. Avoid duplicate effects and stale results replacing a later withdrawal.                                                                                                                                                           |
| Form has been hidden or is unavailable                    | On a stale interaction, concise safe **Newsletter signup is not available here right now.** with a return path. On a fresh normal page, omit a deliberately hidden form.                                                                                           | Public wording need not disclose private configuration or security reasons. Do not falsely unsubscribe or erase previous acceptance; scope result to the operation actually checked.                                                                                                                               |
| Unsubscribe/manage                                        | Name the exact newsletter and current allowed choice; acknowledge accepted withdrawal plainly.                                                                                                                                                                     | No login/gift requirement added merely for product growth, no automatic opt-back-in, and no unrelated reader/topic disclosure. Preserve source-required broader suppression and already-started/delivered history. Existing P25 Update controls remain distinct.                                                   |

The state table is a contract for truthful language, not a demand for sixteen
screens. Most states belong in one stable form/result region plus the existing
email-confirmation/preference destination. Exact known versus protected details
come from the source response, not client guesses.

An initial anonymous result cannot both disclose **Already subscribed** and
preserve membership privacy. Conversely, saying **We sent an email** for every
response is misleading when some branches send nothing. The source/UI contract
must reconcile this; do not hide it with celebratory success copy. Post-proof
status can be precise when the source grants that narrow disclosure.

## Accessibility, phone behavior and continuity

- Use an actual labeled email input with appropriate email keyboard, paste,
  self-entry autocomplete and no spellcheck. Support the owner's admitted email
  profile without silent transformation; no repeat-email field. If Name is
  present, preserve the inherited single optional international-name model.
- One-column mobile layout, readable helper text, semantic contrast and Core's
  touch-target guidance. Do not shrink the privacy/help controls into illegible
  text or make a hover tooltip the only instruction. Reflow must work with long
  safe ministry names, long email addresses, translation, zoom and text spacing.
- Keyboard order follows the page. Giving and signup each have clear form
  boundaries and accessible names. Enter in signup cannot initiate a donation;
  fixing a newsletter field cannot clear payment state. Test sticky page chrome
  and the phone keyboard against visible fields, errors and the current action.
- Use a persistent state region for pending/result/recovery. Announce material
  async status without repeatedly moving focus; if navigation replaces the
  page, use the established page heading/focus strategy. Use a deliberate error
  summary only when it helps the actual form; WCAG does not require a modal for
  a one-field error. Do not announce the same result twice through both focus
  movement and redundant live regions.
- Email confirmation must work when mail opens on another device or browser,
  subject to the exact source-proof design. Do not require the original tab to
  remain alive or force creation of an unrelated donor account. Preserve an
  accessible recovery path for expired/replaced links and slow delivery.
- Abuse controls should be proportionate and accessible; do not assume a visual
  CAPTCHA is necessary or equivalent to email control. Root/source research
  owns the qualified abuse mechanism. This note does not certify any CAPTCHA,
  provider, browser or assistive-technology combination.
- Preserve the source-qualified native no-JavaScript behavior where required by
  the amended P23/P25 intake contract; a client-only success animation is not a
  replacement. No consent opt-in or display-setting widening may replay
  automatically merely because a device reconnects.

## Material concerns and exact review clauses

Severity expresses potential user/domain harm. Likelihood is a reasoned
assessment of the proposed design or known reusable patterns, **not incident
frequency**. Evidence concerns source meaning unless actual runtime is named.
The clauses below are proposed wording for parent review, not newly ratified
policy or a substitute for source-owner contracts.

| ID / concern                                                                                     | Severity / likelihood and evidence                                                                                           | Decision impact                                                                                  | Fix / proposed clause                                                                                                                        |
| ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| R1 — “Signup complete” means only a durable request or pending proof.                            | **High / plausible** if EX11's request lane is relabeled; P25 EX11 and E3.                                                   | Makes D6 fail its selected job or sends before eligibility.                                      | C1/C5: distinct native purpose and authoritative pending/confirmed results.                                                                  |
| R2 — Newsletter interest becomes CRM admission, supporter access or an identity correction.      | **High / concrete vendor counterexample**, E11 and local purpose boundaries; no Asym exploit claimed.                        | Broadens access and contradicts D1/D2/P25.                                                       | C2: minimal source-owned recipient representation and no unrelated admission/effects.                                                        |
| R3 — Page control is mistaken for unsubscribe, pause-send or page privacy.                       | **High / plausible**, E6/E14 and distinct P22/P6 sources.                                                                    | Misleads missionaries; potentially continues or stops unintended work.                           | C3/C4: one clearly scoped control, actual effective state, explicit stale/pending rules, unchanged existing subscriptions/withdrawal.        |
| R4 — Public result reveals that an address belongs to a subscriber/donor or is suppressed.       | **High / plausible** in duplicate-specific signup errors. Local disclosure obligations; vendor signup protocol not verified. | Creates an unauthorized audience lookup.                                                         | C6: safe initial response and narrowly authorized precise post-proof status.                                                                 |
| R5 — Confirmation message reveals restricted identity/location or grants protected-story access. | **High / plausible**, P22 preview/disclosure and E2.                                                                         | New public discovery or inappropriate audience privilege.                                        | C7: public-safe exact-purpose name/content across form, email, links, preview and result; separate protected-reader authority.               |
| R6 — Donation implies enrollment or signup blocks giving.                                        | **High / plausible**, founder brief and E10's checkout variants.                                                             | Unchosen consent and avoidable giving interruption.                                              | C8: independent optional action/outcome; no preselected/bundled enrollment. Placement recommendation stays separate from source requirement. |
| R7 — Address correction/resend replays or retargets old accepted work.                           | **High / plausible**, P25 recovery and U2/E5.                                                                                | Wrong-recipient mail, duplicate effects or lost withdrawal.                                      | C9: same-operation recovery; deliberate corrected attempt, exact-purpose proof and honest non-recall copy.                                   |
| R8 — Repeated signup overwrites a current unsubscribe/suppression or resends welcome mail.       | **High / plausible**, P25 preference fences and E12/E14 counterexamples.                                                     | Revives unwanted communication or makes mailbox spam.                                            | C10: no automatic lifting of current floors; source-qualified new choice only, idempotent completion and no duplicate secondary effects.     |
| R9 — Verification/friction settings are exposed as a DIY policy choice.                          | **Medium to High / concrete vendor pattern**, E8/E9.                                                                         | Simplicity hides a weakened proof contract; missionaries must understand infrastructure choices. | C11: source policy decides proof/abuse; UI gives clear next steps, no new verification toggle or provider configuration.                     |
| R10 — Preview submits live signup or turns a saved draft into a public claim.                    | **High / concrete inherited contract**, P22 D10.                                                                             | Accidental email/publication or unauthorized draft disclosure.                                   | C12: inert exact-version preview, distinct saved/effective state and existing publication rules.                                             |
| R11 — Mobile or assistive-tech users cannot recover from pending/error states.                   | **Medium to High / plausible with a concrete wrapper concern**, U1/U4–U7 and shared Button.                                  | Excludes users from signup or produces duplicate attempts.                                       | C13: persistent accessible status/recovery, keyboard/touch/reflow tests, no false conformance claims.                                        |
| R12 — Old requesters/members are silently converted, or visibility migration defaults On.        | **High / plausible**, P25 old-occurrence contract and E14 auto-enrollment option.                                            | Retroactive consent/public-disclosure change.                                                    | C14: preserve source lineage and proven preferences; no inferred migration enrollment or page-visibility default.                            |
| R13 — A form builder, cadence matrix or welcome automation becomes “necessary setup.”            | **Medium / plausible**, broad E1/E6/E8/E14 feature sets.                                                                     | Bloats the selected scope and delays usable native signup.                                       | C11/C15: one named purpose and one page control, source-required options only; separate future product decisions.                            |
| R14 — Metrics count requests/provider acceptance as subscribers or human engagement.             | **Medium / plausible**, distinct pending/delivery facts and E1 marketing metrics.                                            | Misleading missionary expectations and pressure.                                                 | C16: any reached count/status uses its actual source meaning; no new dashboard or conversion forecast required.                              |

### Proposed exact clause language

1. **C1 — Native entry meaning.** “The new public native-newsletter action
   expresses a deliberate choice for the exact named newsletter. Existing
   request-only occurrences retain their original meaning and lifecycle. A
   request receipt or proof-pending state MUST NOT be labeled Subscribed.”
2. **C2 — Purpose boundary.** “Signup and confirmation authorize only the
   source-qualified newsletter-recipient purpose. They MUST NOT imply a gift,
   continuing partnership, CRM prospect admission, protected-reader access,
   identity/profile correction, another person's membership, or unrelated
   communication preference.”
3. **C3 — Page control.** “The missionary's control MUST name its exact public
   Page and display effect. Hiding the signup MUST NOT unsubscribe existing
   recipients, delete their records, disable withdrawal, stop newsletters or
   change the Page's own publication/privacy state by implication.”
4. **C4 — Current entry and pending work.** “Configured intent, saved candidate,
   published display and current admissibility MUST remain distinct. Off closes
   new intake through the exact Page entry. The owner
   amendment MUST define stale-form submission, accepted pending-confirmation
   and shared-link behavior when display or availability changes; the UI MUST
   state only the outcome actually established.”
5. **C5 — Proof and result truth.** “The journey MUST distinguish accepted
   pending work, required address proof, confirmed subscription, current
   suppression, dispatch acceptance and delivery. Confirmation MUST NOT be
   described as verified personal identity. Successful result copy follows the
   exact authoritative source outcome, not a timer or provider-shaped guess.
   For the proposed first release, every new admission/resubscription requires
   fresh exact-purpose confirmation through an explicit Confirm action after an
   inert email-link landing; GET/prefetch cannot activate. An already active
   subscription is unchanged and sends no additional confirmation. Existing
   Auth/email verification is not a shortcut.”
6. **C6 — Private status.** “An anonymous address submission MUST NOT reveal
   existing subscriber, donor, CRM, suppression or account status. Precise
   status and preference detail require the exact authorized recipient context.
   Publicly uniform copy MUST remain truthful about whether any mail or
   acceptance is promised.”
7. **C7 — Disclosure.** “Only owner-approved public newsletter identity and
   purpose may appear in the signup, confirmation, recovery and result journey.
   Restricted identities, internal names, locations, recipient lists and
   protected content MUST NOT be exposed through messages, URLs, previews,
   metadata or misleading audience labels.”
8. **C8 — Giving independence.** “Newsletter choice MUST be deliberate and
   independent of giving. No gift, receipt, page visit, default checkmark or
   wallet completion grants newsletter consent; signup failure MUST NOT change
   a donation's result or block independent browsing/giving.”
9. **C9 — Recovery.** “An uncertain result MUST reconcile the same attempt
   without silently repeating effects. Corrected destinations and qualified
   resend use their exact source rules. Copy MUST NOT claim previous mail was
   recalled, an accepted operation was undone, or nothing changed when the
   outcome is unknown.”
10. **C10 — Existing recipient and withdrawal.** “A repeated attempt MUST NOT
    create duplicate membership/effects or downgrade completed current state
    to pending. No stale confirmation, retry or address edit may silently
    override a later withdrawal or broader suppression. Withdrawal remains
    reachable when the public signup is hidden.”
11. **C11 — Minimal controls.** “Use the existing page and newsletter surfaces
    with source-required choices and plain next-step instructions. Do not add
    per-form access controls, a form builder, missionary-selectable proof
    bypass, mandatory account creation, or an unrelated setup wizard.”
12. **C12 — Preview/publication.** “Signup preview MUST inherit the exact Page
    owner's authenticated candidate, current-authority and inert-effect rules.
    Previewing or saving a candidate MUST NOT claim live publication or send a
    confirmation email. Retain any separately required publication review.”
13. **C13 — Accessible completion.** “The actual form and settings journey MUST
    preserve labels, purpose instructions, input values, keyboard/focus access,
    meaningful textual errors and persistent recovery through pending,
    rejection and indeterminate states. Qualifying async results MUST be
    programmatically exposed. Verify phone, zoom/reflow and assistive-technology
    behavior; library use and automated scans alone are insufficient.”
14. **C14 — Migration/defaults.** “Existing requests, gifts, follows, contacts,
    readers or external list membership MUST NOT be converted to native signup
    or page-display consent without the exact owner-qualified evidence. D6
    alone selects no migration or installation default and no retention
    duration.”
15. **C15 — Adjacent scope.** “This signup decision MUST NOT silently introduce
    automatic digest/cadence delivery, SMS/postal signup, welcome campaigns,
    external sync or a broader preference-center catalog. Any reached native
    newsletter/print requirement retains its existing owner and scope.”
16. **C16 — Honest measurement.** “Any displayed recipient total or operational
    status MUST identify what it counts and reflect current authorized source
    state. Submission, confirmation, eligible recipient, provider acceptance,
    inbox delivery and human reading are not interchangeable.”

## Strongest alternatives and costs

**Direct signup without a fresh email loop** is the strongest simplicity
alternative to test if a future exact-purpose proof-reuse contract is qualified.
It avoids context switching and undelivered-confirmation support work. Such
reuse is not qualified for this first release, and an Auth verified-email flag
does not supply it. For anonymous unproved addresses the shorter path also
accepts mistakes and third-party enrollment more readily; CAPTCHA does not
prove control of the mailbox. The current review recommendation therefore uses
fresh exact-purpose confirmation for new admission/resubscription, while an
already-active subscription is a no-op without extra email. This neither proves
a universal legal requirement nor invites a missionary-selectable bypass.

**Keep the request-only doorway** was the smaller implementation alternative,
but the founder chose direct signup. It remains a distinct existing-purpose
contract where independently authorized, not a fallback that may be silently
called native signup. If the native capability is unavailable, tell the truth
and preserve independent page/giving use; do not fabricate subscription or
route every submission into a new manual approval queue.

**Embed a vendor signup form** could shorten frontend work but introduces
external consent/storage/audience coupling and does not complete this native
owner-qualified requirement. **Add all newsletter preferences now** offers
flexibility but expands scope and disclosure. The lean alternative is one exact
purpose with usable withdrawal and only already approved options, leaving
cadence, digests and broader preference scope to their explicit decisions.

## Testable UX and qualification still needed

These are proposed scenarios, not executed studies or promised pass rates.
Root/source research owns provider, data, authorization, race and retention
qualification; the following adds visitor/missionary comprehension and actual
interface proof.

| Scenario                                                                                   | Observable success condition                                                                                                                                      |
| ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Visitor arrives only to donate, or only to get the newsletter.                             | Each can complete their own job without compulsory participation in the other. Visitors can explain which newsletter they chose and whether confirmation remains. |
| Missionary shows, previews and hides signup.                                               | Can distinguish saved versus public state and correctly predict that hiding does not unsubscribe current readers. Preview has no live effect.                     |
| Anonymous visitor supplies an existing, unknown, suppressed or already-subscribed address. | Public output does not disclose hidden membership/status. No false mail-delivery promise, duplicate subscription or silent suppression reset.                     |
| Confirmation is slow, filtered, opened on a second device, expired or reused.              | The visitor finds an honest next step without losing unrelated tasks or needing an unrelated account. Completed current status is not mislabeled failed.          |
| Visitor notices a typo before/after submission.                                            | Can correct safely; understands the effect on pending work. No silent address rewriting or canonical donor-contact mutation.                                      |
| Form is hidden or Page authority changes after loading but before submitting/confirming.   | Exact chosen source rule governs; copy reflects it without leaking restricted reasons or falsely asserting unsubscribe.                                           |
| Request accepted but response is lost; a later retry or old link arrives after withdrawal. | Same-attempt recovery is understandable; no duplicate effects or resurrection of consent.                                                                         |
| Keyboard-only, screen reader and phone usage.                                              | Labels, Enter/Space behavior, focus, pending/results and errors are usable; signup cannot submit payment. Verify the actual disabled-submit wrapper behavior.     |
| Long international name/email, narrow screen, zoom, text spacing and translation.          | Content reflows; essential labels, purpose and recovery remain readable and operable without truncated identity or hidden controls.                               |
| Restricted worker/public alias and inert preview.                                          | Form, mail, result, URLs and metadata use the permitted public identity and do not broaden story access.                                                          |
| Current subscriber uses preference/withdrawal with public form hidden.                     | Can stop the exact newsletter through the qualified path; sees an accurate durable result and no unrelated preferences or compulsory upsell.                      |
| Existing request-only records and configuration are migrated.                              | No retroactive subscription, visibility activation, duplicate welcome, extended payload retention or invented confirmed identity.                                 |

Research confidence is high for the inspected source text and local intended
boundaries; medium for the recommended interaction pending prototype and
representative-user work. No authenticated vendor test, actual Core browser
journey, delivery test, accessibility audit, adoption metric or conversion study
was performed in this lane. The exact source proof, suppression/withdrawal,
pending-after-hide rule, safe uniform response and current Page capability
contracts remain dependent owner evidence. A clean research note does not
qualify any of them for release.
