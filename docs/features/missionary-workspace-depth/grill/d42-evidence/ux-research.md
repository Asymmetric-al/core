# Q42 B — reader experience and current primary research

Research date: October 18, 2026. Repository inspected at
`9cada8f3d8ab59db391d3fd20df77fcadeb09813`.

This is a bounded research/design contribution to the D42 review. It is not an
implemented interface, an authenticated competitor walkthrough, a measured
conversion result, a usability study, legal advice, or a qualification of the
live Supabase project. No existing evidence program was executed. Application,
database, provider, subscriber and live configuration state were not changed.

## Recommendation and strongest alternative

**Accept B with required amendments.** A signed-in reader who deliberately joins
the named newsletter using the exact displayed, currently qualified verified
address should need one action. A reader using another address, a guest, or a
reader without qualified reusable proof follows the existing confirmation path.
Signing in, creating an account, donating and subscribing to other topics are
never prerequisites. Rejoining after an ordinary withdrawal uses the same
short journey and records a new deliberate instruction; it does not bypass
stronger restrictions.

The strongest alternative, confirmation for every new admission/rejoin, provides
one proof ceremony and avoids qualification of reused authentication evidence.
It also adds an inbox round trip even where the current exact address is
adequately proved. B is a defensible product choice, not a universal vendor or
accessibility requirement. Its safety depends on the actual proof contract; a
boolean that happens to say verified is insufficient.

## Fresh primary evidence and transfer limits

Every source below was opened during this review. Search snippets and community
reports were not promoted to verified product behavior. Descriptions are
paraphrases; design conclusions are explicitly our judgments.

| Source                                                                                                                                                           | Verified fact                                                                                                                                                                                                                                                            | Consequence for Core; what not to import                                                                                                                                                                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Ghost — Setting up email newsletters](https://ghost.org/help/setup-email-newsletters/)                                                                          | Each newsletter has its own subscriptions/settings. New and existing members can select individual newsletters at signup or through account email preferences. The same page describes an option to automatically enroll existing members in a newly created newsletter. | Adopt clear named purposes and accessible self-service choices. Reject automatic enrollment: Core requires a deliberate instruction for the exact purpose. The page does not establish Ghost's exact proof-reuse ceremony, and is not evidence that it implements B.                                |
| [Mailchimp — Choose Opt-in Settings](https://mailchimp.com/help/set-signup-preferences/)                                                                         | Mailchimp offers single and double opt-in on its own signup forms. Its documented setting does not cover form integrations or API opt-in. Single opt-in is its stated default, with a documented regional qualification.                                                 | Both shorter and email-confirmed admission are established product patterns. Core needs one enforceable native admission contract across routes, not a switch that only affects one form. Do not import Mailchimp's default, broad security claims, integration bypass or implied legal conclusion. |
| [Mailchimp — Resubscribe a Contact](https://mailchimp.com/help/resubscribe-a-contact/)                                                                           | A contact who withdrew must use the signup form to rejoin; the form records when permission was given. Mailchimp distinguishes this from contacts manually unsubscribed by administrators. Confirmation resend is intended for an explicit reader request.               | A deliberate reader rejoin is a normal self-service journey. Do not require staff to edit a subscriber flag or add a redundant confirmation dialog. Do not copy vendor-specific administrator overrides or infer that a verified account clears broader suppressions.                               |
| [GoFundMe Pro — Customize your contact opt-in settings](https://prosupport.gofundme.com/hc/en-us/articles/37288768563483-Customize-your-contact-opt-in-settings) | Updated July 14, 2026. Organizations can offer contact opt-in per campaign and maintain consistent opt-in wording across campaigns. Supporter choices are recorded separately from GoFundMe Pro's own emails.                                                            | Separate the named organization purpose from platform communications and use consistent readable copy. Do not import its preselected-email option, campaign-by-campaign configuration proliferation or donation-coupled entry. Core's native newsletter signup remains separate from giving.        |
| [Supabase — General configuration](https://supabase.com/docs/guides/auth/general-configuration)                                                                  | Turning off Confirm Email implicitly confirms the email in the database. Anonymous sign-in is separately configurable.                                                                                                                                                   | A confirmed database field alone cannot prove that the reader controlled the displayed mailbox. Whether the underlying proof qualifies is an Auth owner decision enforced server-side, not a reader-visible technical explanation or newsletter administrator exception.                            |
| [Supabase — JavaScript getUser](https://supabase.com/docs/reference/javascript/auth-getuser)                                                                     | `getUser` makes a request to Auth and returns authentic current-user data suitable as an authorization input.                                                                                                                                                            | Resolve the current account/address through the qualified server Auth boundary. This does not itself prove the address-verification method, newsletter consent, tenant purpose or subscriber access. Do not trust cached client state as authority.                                                 |
| [W3C — Redundant Entry, SC 3.3.7](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html)                                                              | Information already supplied in the same process should be available without needless re-entry, with essential/security/invalid-information exceptions. The criterion does not require storing information between sessions.                                             | Show the qualified current address directly; preserve user-entered values through recoverable errors. This supports reducing retyping, but does not require skipping an independent security confirmation or retaining private data indefinitely.                                                   |
| [W3C — Status Messages, SC 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)                                                              | Relevant asynchronous status changes must be programmatically available to assistive technology without necessarily moving focus.                                                                                                                                        | Provide inline joining/pending/accepted/error feedback with appropriate announcement. A disappearing toast, spinner or color alone is not sufficient feedback.                                                                                                                                      |
| [W3C — Target Size (Minimum), SC 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)                                                    | The AA criterion uses 24 CSS pixel minimum targets or qualifying exceptions, including spacing and inline links.                                                                                                                                                         | Core's existing touch guidance is stronger at 44px controls; preserve those shared targets. Do not misstate 44px as the WCAG AA minimum.                                                                                                                                                            |

The Supabase changelog index was fetched through `curl` after the browser tool
rejected its Markdown content type. The October 12, 2026
[TLS compatibility notice](https://supabase.com/changelog/cbc-tls-ciphers-deprecated)
was opened: removal of selected old TLS 1.2 ciphers may begin November 10, 2026.
This does not change B. Release qualification should exercise the supported
browser/device baseline and represent connectivity failures honestly; weakening
authentication or transport for obsolete clients is not a product solution.
The index was inspected as a current bounded snapshot, not an exhaustive audit
of every Supabase change or a claim about which clients Core users run.

An attempted Mailchimp `set-signup-form-preferences` URL was unavailable; the
current `set-signup-preferences` page above was opened successfully instead.

## Repository facts and explicit congruence

- [D6 C04–C08](../phase28-d6-adversarial-review.md) already provides the exact
  newsletter, email plus optional single name, no donation/account requirement,
  protected confirmation, no enumeration, scoped withdrawal and independent
  Page-entry Off. C05 expressly excluded the verified-profile shortcut. B must
  explicitly amend that clause and dependent wording/tests; it must not pretend
  the shortcut was already ratified or that the rest of D6 became ratified.
- [D7 C07/C12/C17 and reader journey](../phase28-d7-adversarial-review.md) preserve
  independently qualified audience eligibility, exact purpose withdrawal and
  unrelated post-notice choices. B creates no protected reading, donor, CRM or
  missionary access and does not authorize an issue to send.
- [`packages/ui/components.json`](../../../../../packages/ui/components.json)
  and [`packages/ui/AGENTS.md`](../../../../../packages/ui/AGENTS.md) specify
  exact `base-maia`, Base UI, Zinc-based semantic CSS variables and shared
  component ownership. Compose the existing form/card/button/status patterns;
  this journey needs no new component library, wizard or auth design system.
- [`docs/ai/rules/frontend.md`](../../../../ai/rules/frontend.md), the repository
  accessibility review skill, testing rulebook and touch guidance were read.
  A simple native form is appropriate; complex form machinery is not required
  for one email input and one action. Actual keyboard/focus/AT/mobile testing
  remains implementation evidence, not achieved by writing this design.
- Current donor settings are **not a usable subscription source**:
  `apps/donor/app/(dashboard)/donor-dashboard/settings/page-client.tsx:511–565`
  has a local `newsletters` boolean and a delayed success display without a
  source write in that handler. Lines 603–612 label it an organization quarterly
  newsletter. It cannot represent exact ministry newsletter memberships or
  prove persisted consent. Integrating D42 must replace misleading behavior at
  the qualified source seam; do not simply attach fast signup to this boolean.

## Small complete journey

### 1. Discover it in context

Use the existing qualified public ministry Page signup placement. Identify the
newsletter and organization with their public-safe names and a short useful
description. State the actual topic; state cadence only if the source supports
that promise. Keep the signup outside the donation transaction. Do not force a
popup, account modal, newsletter selection catalogue, repeated privacy checkbox
or welcome questionnaire.

The public Page remains audience-invariant. A private request-scoped signup
interaction may show the current authenticated reader's address and permitted
state. That address/state must never enter shared cached HTML, static preview,
search metadata or public analytics payloads. A custom public domain that cannot
resolve the current session still provides the guest form; newsletter signup is
not a reason to invent cross-domain authentication/cookie sharing.

### 2. One action for the qualified signed-in reader

Proposed composition, using existing styles rather than prescribing new pixels:

```text
Maya's newsletter
News from [public ministry name], from [organization].

Join using reader@example.org
[ Join newsletter ]
Use another email

You can unsubscribe from this newsletter at any time.
Privacy information
```

The exact email is visible, wraps safely, and comes from the server-qualified
current account. The action has a newsletter-specific accessible name/context.
No duplicate email field or required name appears on this path. The reader can
choose **Use another email** without signing out or changing their account; that
opens the existing guest-style email-confirmation form. The existing account
switch action remains available in the account UI, but is not an extra required
newsletter step.

Selecting Join submits a deliberate new exact-purpose instruction. Merely
signing in, visiting, hovering, prefetching, clicking a forwarded email or
loading an already-open page cannot subscribe. After durable source acceptance,
show **You're subscribed to Maya's newsletter** with the exact address and the
qualified unsubscribe/manage action. That success means accepted subscription,
not that an issue has already been sent or delivered.

### 3. Equally short guest and other-address journey

Keep the existing Email field and optional single Name, ordinary autocomplete,
one **Join newsletter** action, clear purpose and withdrawal explanation. Do not
require both name fields, address, phone, gift, account creation, password or
login. A secondary sign-in route may exist in the site's normal navigation;
signup must not detour through it.

Public results must preserve D6's non-enumeration semantics. A safe receipt such
as **Signup received** and **If a confirmation email is needed and can be sent,
we'll send you a link. Existing subscriptions stay unchanged** follows actual
durable intake. It must not falsely claim a pending membership exists in every
branch. When a private, qualified receipt legitimately establishes a pending
confirmation, use the more direct **Check your email to confirm**.

The email identifies the same newsletter. Opening the link renders an explicit
confirmation action; link scanners/previewers do not join. Completion requires
no account or return to the original device. Offer a concise typo-correction
route and bounded resend, preserving source lifetime and generation rules.
Do not silently overwrite the account address or enroll both the old and the
corrected address. Token lifetime is a source-policy decision, not a UX excuse
for a new reader setting.

### 4. Rejoin, already subscribed and safe withdrawal

For a current authenticated reader whose exact-purpose state is authorized to
be shown, an ordinary previous withdrawal can be presented as **Not subscribed**
with **Rejoin newsletter**. This is sufficient explicit intent; no guilt copy,
staff ticket or second confirmation dialog is needed. Use the same qualified
email proof rule as first admission. An active identical membership yields
**You're already subscribed** without duplicate membership, repeat proof mail,
new welcome series or inflated acquisition counts.

An exact newsletter withdrawal and a stronger objection, abuse restriction,
complaint or provider suppression are different facts. Rejoin cannot silently
clear a stronger restriction. Reader-visible explanations stay within that
reader's authorized source view; public/other-address submissions cannot reveal
another person's subscriptions or suppression history. Do not use a vague
disabled button as the only feedback. Offer the source-approved remedy or
ordinary other-address path only where allowed; never promise that changing
addresses evades a person- or organization-wide restriction.

Keep the qualified login-free reduction-only unsubscribe path. A prior
subscription/withdrawal remains history. An earlier Join replay cannot reverse
a later withdrawal; a later fresh permitted Rejoin can establish new consent.
Neither sign-in nor changing an account email automatically reenrolls anyone,
moves a subscription to another address or transfers historic privileges.

### 5. Honest recovery with few steps

| Situation                                                      | Reader experience and required meaning                                                                                                                                                                                                                                                                                       |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Join submitted, result not yet known                           | **Joining…** retains the exact newsletter/address context. Prevent accidental repeat clicks without hiding keyboard focus. No success until source acceptance.                                                                                                                                                               |
| Lost response after a possible commit                          | **We couldn't confirm the result yet. Check again.** Reconcile the same accepted instruction; do not tell the reader to create a second signup.                                                                                                                                                                              |
| Auth proof cannot be qualified before acceptance               | Explain that email confirmation is needed for this address and retain the ordinary confirmation route. An Auth outage is not evidence of either verified identity or an accepted subscription.                                                                                                                               |
| Current account or current address changed while form was open | Refresh the private identity context and require review of the now-displayed address before a new instruction. Never silently redirect consent to the new address or keep using a stale proof.                                                                                                                               |
| Sign out while an accepted request is resolving                | Do not paint private result/address into the next user's UI. Preserve the accepted server effect and permit recovery through a qualified narrow receipt or current access.                                                                                                                                                   |
| Request rejected definitively                                  | Keep safe entered fields, explain the actionable cause without private destination-state disclosure, and provide a deliberate retry when allowed.                                                                                                                                                                            |
| Page entry switched Off before acceptance                      | Refuse new intake with clear public availability copy. Do not add the person then claim failure. Ordinary withdrawal and accepted history remain intact.                                                                                                                                                                     |
| Existing unexpired pending confirmation after entry-only Off   | This is a separate unresolved policy: D6-C07 proposed allowing qualified completion, but ratified completeness C07 did not adopt that amendment. D42 must not silently choose it. Keep the distinction from purpose closure; record the eventual authorized completion/stop rule and test its truthful UI before activation. |
| Confirmation expired, withdrawn or superseded                  | State that the link cannot finish this signup and offer the current qualified entry if available. Opening it does not invent a new request or restart a lifetime.                                                                                                                                                            |
| Low bandwidth/offline                                          | Keep the lightweight form usable; show offline/retry state. Do not claim joined, store a durable offline replay queue, or send automatically later without rechecking current context.                                                                                                                                       |

### 6. Tenant control without a rules builder

Reuse the existing organization newsletter settings. One **Let signed-in readers
use verified email** toggle is enough. On permits eligible signed-in readers to
join using their current verified address; other readers confirm by email. Off
uses email confirmation for every new signup or rejoin. Label both effects in
plain language; do not expose Auth proof-source options to newsletter staff.

On is the product default for deliberately activated, qualified new
capability under B; readiness is a server-owned prerequisite, not a box an
administrator can override. Deployment must preserve existing policy until its
activation/migration is explicitly qualified. Do not silently reinterpret old
pending requests, historic identity booleans or current subscriptions.

The separately selected **Show newsletter signup on this page** control disables
that entry entirely. The proposed D6 interpretation of Off does not unsubscribe readers, close the newsletter,
unpublish the Page, disable giving or stop lawful independent sends. Explain
these effects once in concise helper text. Do not add per-reader, missionary,
project, identity-provider, age-of-proof or exception-rule settings. Technical
proof qualification belongs to the platform Auth contract. If a source capability
is unavailable, distinguish that fact from the staff's saved Off choice.

The D42 confirmation-policy change applies to newly accepted instructions and
does not retroactively demand reconfirmation from active readers, automatically
activate pending readers, delete evidence or revive expired/withdrawn requests.
If the policy changes while a form is open, resolve against current authority
and report the actual path clearly. Keep previously accepted outcomes and their
original policy evidence intact.

## Accessibility, mobile and visual requirements

- One clear heading, newsletter description, visible exact address/input,
  primary action and secondary other-address path. Use the existing Maia
  component hierarchy, spacing, semantic colors and focus treatment. No new
  decorative badge for verification, security score or workflow progress bar.
- Native form semantics and visible labels; email input uses appropriate
  autocomplete/input mode. Optional name stays one international-friendly field
  with no first/last-name assumption. Do not silently strip valid email content,
  use a restrictive homemade email regular expression, or claim international
  address transport support until the actual source/provider supports it.
- Errors identify the field and remedy, are associated with the field and do
  not clear valid input. Joining/accepted/pending/unknown states are inline and
  announced, not toast-only. Do not announce a spurious success on a timer.
- Preserve keyboard operation, visible focus and focus restoration when
  switching to another-address entry. Avoid focus stealing for passive updates.
  Use existing dialog primitives only if the established surface needs one.
- Test narrow-screen reflow, long names/addresses, translated copy, zoom,
  keyboard, screen readers and shared-device sign-out. Core's 44px touch guidance
  remains the implementation baseline; WCAG AA's 24px rule and exceptions are
  not interchangeable with that stronger product convention.
- Basic use must not require animation, third-party trackers, a heavy editor,
  campaign media, additional accounts or typing a password into newsletter UI.
  Retain reduced-motion behavior and meaningful plain-text confirmation emails.

## Concerns to incorporate into the adversarial review

| Concern                                                                      | Severity / estimated likelihood without prevention | Evidence and answer impact                                                                                                                  | Permanent requirement                                                                                                                                                                         |
| ---------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A superficially verified account joins an unproved destination               | High / medium                                      | Supabase explicitly permits implicit confirmation. Narrows B to qualified reusable proof; it does not reject B.                             | Server resolves current exact address and trustworthy proof provenance under the Auth owner; unsupported proof falls back to explicit mailbox confirmation. No reader/admin self-attestation. |
| Rejoin revives stronger restrictions or stale Join overrides withdrawal      | High / medium                                      | D6/D7 independent restrictions and Mailchimp reader-driven rejoin. Adds lifecycle safeguards.                                               | New exact-purpose instruction, current restrictions and durable ordering; preserve old evidence and no weaker override.                                                                       |
| Signup and preference UI disagree, save nothing or duplicate consent         | High / high for copying current settings handler   | The actual local settings boolean/timer is source evidence. Changes integration requirements.                                               | One subscription owner; all rendered states derive from accepted source effects; no blanket boolean or fake success.                                                                          |
| Convenient personalization leaks private address or subscriber state         | High / medium                                      | D6 public audience invariance/non-enumeration and request-scoped identity need. Narrows rendering and recovery.                             | Private uncached interaction, exact self/receipt authority, no cross-tenant/provider state disclosure, clear stale-context handling.                                                          |
| Excess settings, mandatory login or a second rejoin dialog frustrate readers | Moderate / medium                                  | Primary comparisons show simple self-service and scoped topic choices; user selects B. Adds simplification, not a claim of measured impact. | One organization confirmation policy plus existing Page-entry control; one deliberate qualified Join/Rejoin; guest path stays first-class.                                                    |
| Disabled/unavailable/pending/accepted all appear as one toggle or success    | Moderate / high without explicit state model       | Existing source timer and D6 effects distinctions. Adds outcome clarity.                                                                    | Honest persistent source states, inline accessible feedback, current-context retry/recovery; accepted subscription is not delivery.                                                           |

Likelihood is reasoned design risk, not observed Core production incident data.
The complete D42 review must still verify auth provenance, effective database
grants/RLS, mutation boundaries, concurrency, rollout and owner supersession.

## Falsifiable UX acceptance additions

1. A qualified signed-in reader sees the exact current address and completes a
   new permitted Join with one deliberate activation and no email/password/name
   re-entry, confirmation dialog or donation.
2. **Use another email** remains available without sign-out and enters the normal
   confirmation journey without modifying the Auth account.
3. Ordinary withdrawn readers can Rejoin under the same qualification; active
   identical readers do not generate duplicate membership or confirmation mail.
4. A simulated implicit-confirmed/unqualified Auth account cannot use immediate
   admission; its UI gives the ordinary mailbox confirmation path clearly.
5. Guest and other-address results/timing do not disclose membership, contact,
   donation or suppression state; authenticated self views remain narrowly
   scoped and never appear in another user's shared cache response.
6. Change account/address, log out or switch tenant while a request is pending:
   consent is not retargeted, stale private data does not render, and accepted
   original work remains recoverable only with current narrow authority.
7. Interrupt the response after acceptance: recovery finds the one durable
   outcome. No false failure/success, duplicated welcome effect or new consent
   instruction is created by checking again.
8. Change each tenant control with the form open: effects match saved policy,
   Page-entry Off, purpose closure and existing accepted state independently.
9. Verify ordinary unsubscribe/rejoin ordering and stronger restriction cases;
   stale links or replay do not reactivate, and unavailable paths have a useful
   authorized next step without sensitive details.
10. Verify actual browser/keyboard/AT/320-CSS-pixel reflow, translated and long
    input, touch targets, slow/offline response and focus behavior. Document
    results from the implemented UI; this note establishes no conformance claim.

The remaining reader question is not whether an account is mandatory or whether
staff may bypass a restriction: those answers follow existing intent. Exact
pending-confirmation lifetime, related expiry policy, and whether an accepted
pending request may complete after Page-entry Off remain their own source
decisions where not yet ratified; do not sneak a duration or a completion rule
into the B UX.
