# D43 — finishing a pending signup after the Page invitation is hidden

Fresh review: October 18, 2026, against Core
`9cada8f3d8ab59db391d3fd20df77fcadeb09813` and the research working tree.
The founder selected Q43 A. This note supplies UX research and required design
detail for its adversarial review; it does not claim that these amendments are
separately ratified or that a native producer, rendered interface, live policy
or delivery path is implemented and qualified. No previous evidence executable,
model or verifier was run. No application, database, provider, subscriber, live
configuration or formal specification was changed.

## Outcome

**Accept A with required amendments.** A reader should be able to finish the
same previously accepted signup after its Page invitation is hidden, within the
original validity and current newsletter/recipient restrictions. There is no
new step for the reader and no new pending-signup setting for staff.

The visible control must mean what it says. **Show newsletter signup on this
page** controls new starts through that entry; it is not a disguised cancellation
command. A valid confirmation link continues to a small independent confirmation
surface, not back to the hidden form. Explicit purpose closure, withdrawal,
expiry or other stronger restrictions retain their own stopping effects.

This is a reasoned product decision, not an assertion that all leading products
implement exactly this race. It preserves the already selected distinction
between an entry, a subscription and a newsletter send. The strongest alternative
would make hiding the entry cancel its outstanding requests too. That is a
clearer total stop only if the control is relabeled to explain cancellation; it
also strands a reader already told how to finish. The founder chose the narrower,
more predictable entry behavior.

## Six fresh primary sources

Each page below was opened during this D43 review, including the relevant
passages. Sources from the earlier Q43 research were revisited rather than
treated as current merely because a prior note cited them.

| Source                                                                                                                         | Verified fact                                                                                                                                                                                                              | Application and limit                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Mailchimp — Create a Landing Page](https://mailchimp.com/help/create-a-landing-page/)                                         | A landing page is associated with an audience. A page can be unpublished and later republished. Deleting loses its reporting data; Mailchimp recommends unpublishing to retain those data. Unpublished page URLs show 404. | Supports separating entry availability from retained business state. It does **not** document whether outstanding confirmation survives unpublishing. Core should not send a valid confirmation to an unexplained 404 just because its original entry disappeared.                                          |
| [Kit — Why do I have unconfirmed subscribers?](https://help.kit.com/en/articles/4008773-why-do-i-have-unconfirmed-subscribers) | Dated August 4, 2026. A reader can delay checking email, miss the message, or change their mind. Administrators cannot confirm the reader on their behalf. The page recommends useful spam-folder guidance.                | Pending is a normal reader state, not an error or permission for staff to force completion. Keep concise inbox help, deliberate reader confirmation and no unsolicited reminder campaign. This supplies no Core deadline, measured conversion benefit or exact after-Off rule.                              |
| [Auth0 — Verify Emails](https://auth0.com/docs/manage-users/user-accounts/verify-emails)                                       | The page explicitly warns that verification links can be activated accidentally by email scanners and describes OTP as one alternative in its own product.                                                                 | Require inert link opening and a protected deliberate confirmation action. Do not copy Auth0, impose an OTP/password ceremony or import its token duration. A GET-inert design addresses ordinary scanning but does not prove all automation is impossible; actual scanner/abuse testing is still required. |
| [OWASP — Forgot Password Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)         | For its password-reset use case, OWASP recommends non-enumerating responses, bounded abuse, securely generated/stored expiring single-use tokens and `no-referrer` protection against URL-token leakage.                   | Transfer the relevant bearer-capability and privacy controls to confirmation. Newsletter confirmation is not password reset, login, identity claim or an account-recovery ceremony. These recommendations do not choose newsletter expiry policy or require another account.                                |
| [W3C — Status Messages, SC 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)                            | Important asynchronous success/waiting/error state changes must be programmatically available to assistive technology without necessarily taking focus. Excessive live-region chatter can itself be disruptive.            | Confirming, accepted, uncertain and failed states need clear persistent text and appropriate announcements, with calm focus behavior. A color change, spinner or disappearing toast alone does not explain the result.                                                                                      |
| [W3C — Error Suggestion, SC 3.3.3](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html)                          | Provide known correction suggestions for detected input errors unless doing so would jeopardize security or the content's purpose.                                                                                         | Explain typos and actionable recovery; do not expose subscriber existence or suppression details to make an error message more specific. A useful next step can be offered without disclosing a private reason.                                                                                             |

No authenticated competitor walkthrough, actual mailbox/device test,
representative missionary/reader interview, experiment or legal review was
performed. Vendor help describes product behavior and guidance, not Core user
preference or release evidence. None of these six sources explicitly proves the
exact pending-after-entry-Off behavior.

## Repository congruence

- [Q43 research](../phase28-q43-pending-newsletter-confirmation-research.md)
  isolates this decision from timing/retention. [D42 C24 and its ratification](../phase28-d42-verified-email-newsletter-signup-adversarial-review.md)
  left it unresolved. The founder's A now selects the direction; it does not
  adopt every remaining D6 recommendation.
- [D6-C07](../phase28-d6-adversarial-review.md) proposed this same scoped
  completion behavior. D6's proposed 72-hour/24-hour values remain separate;
  no duration is imported into this UX note.
- [D7-C12](../phase28-d7-adversarial-review.md) distinguishes Page signup Off
  from purpose closure and current delivery restrictions. Subscription is not
  permission to send a particular issue or a delivery claim.
- [P17 Protected Actions](../../../../prds/sitestacker-parity/phase-17-system-messages-template-management.md#protected-actions)
  governs the exact shared handoff: a non-secret random HTTP selector and an
  independent 256-bit verifier in the fragment, a generic inert GET/HEAD,
  minimal first-party fragment removal and deliberate same-origin POST. Its
  qualified fixed tenant Donor Portal origin is required; an arbitrary Page,
  redirect or alternate no-JavaScript token mechanism is not allowed.
- The current [glossary](../../../../../CONTEXT.md) distinguishes the public
  newsletter signup entry, exact newsletter participation and verified-address
  signup. None means a donor claim, CRM relationship, tenant membership or
  protected-content entitlement.
- [Web Studio public forms](../../../../../openspec/changes/add-web-studio-cms/specs/web-studio-cms/spec.md)
  require domain-owned durable outcomes, truthful receipts, accessible
  answer-preserving server validation and bounded purpose customization.
  [ADR0170](../../../../adr/0170-purpose-bounded-public-form-definitions-and-domain-owned-routing.md)
  forbids arbitrary recipient/routing changes and personal answer data in URLs,
  logs and analytics. Its older native-subscription scope requires the explicit
  owner reconciliation already recorded by D42; editorial visibility is not
  subscription authority.
- [Shared UI instructions](../../../../../packages/ui/AGENTS.md) and
  [configuration](../../../../../packages/ui/components.json) still require
  `base-maia`, Base UI, shared components and Zinc-based semantic CSS variables.
  The frontend, testing and accessibility rulebooks and existing touch guidance
  were read. No new component system, wizard, local primitive or token scale is
  needed.
- [Data-access boundary](../../../../guides/architecture/data-access-boundary.md)
  places business mutations in `packages/api`, with thin application routes and
  approved shared browser data access. A confirmation surface must consume the
  qualified source outcome rather than write subscriber state from the browser.

## Staff journey and tenant controls

### Find and change the existing Page invitation

Keep the control with the exact Page's newsletter placement. Show the public-safe
newsletter name, actual effective state and existing inert preview. An authorized
missionary does not need subscriber-list access to hide their own permitted
entry. Do not introduce a pending-signup queue, per-reader exception control or
separate confirmation approval job for routine Page maintenance.

Recommended helper copy:

> Hides signup from this page. Earlier requests can still be confirmed before
> they expire. Existing subscribers are unchanged.

Use the existing save/publication interaction and source-qualified stop rule.
**Hidden** means the new-intake stop is effective, not merely that a local switch
was clicked. Preserve distinct **Saving**, **Saved—awaiting publication** where
the owner really requires it, **Hidden**, **Shown**, **Unavailable**, and
**Couldn't save** states. Do not claim a narrower intake fence waits on a cosmetic
Page repaint if the owner requires it to take effect immediately. A stale
form, cached page or late save cannot reopen a newer accepted Off.

Ordinary toggling does not need a confirmation dialog because it neither deletes
subscribers nor cancels their accepted requests. The helper text makes the
consequence reviewable before action. A saved choice and its current effective
state must remain distinguishable when publication or readiness changes.

### Organization control retains its exact scope

The target design must provide a source-owned **native newsletter signup
capability** control through the existing organization settings and permission
owners. No ready native newsletter close/disable interface has been verified in
current code. While this capability is Off, it must block future new admissions
and pending completion at the authoritative boundary, while preserving existing
subscriptions, unsubscribe access and separately lawful newsletter issue
delivery. The control is a signup stop, not a requirement to close the whole
newsletter or stop every send. Its exact owner reconciliation remains subject
to the current scope audit before activation.

Use one capability control with this explicit scope, not an additional **Let
pending readers finish** toggle or per-reader exceptions. Any stronger newsletter
purpose closure retains its independently defined owner effects; this design
does not claim that such a closure action is already implemented. Do not infer
effects from an ambiguous generic Off label. Staff copy must distinguish the
capability stop from hiding one Page invitation and from D42's proof-path option.

Turning D42's **Let signed-in readers use their verified email** Off changes
future proof paths, not the validity of an already accepted email-confirmation
request. Entry Off does not silently unsubscribe, disable giving, unpublish the
whole Page or choose an external signup fallback. Reenabling any control does
not restore expired, withdrawn or superseded proof. Capability Off alone does
not terminally revoke an otherwise valid pending occurrence: if it is later On,
that same occurrence may again be eligible within its original deadline and
current restrictions. This is not automatic completion, a reset deadline, or
permission to revive a terminal P6 transport intent; transport recovery remains
separately governed.

For unauthorized staff, use the existing permission-aware read-only view or omit
the unavailable action, with a useful explanation when permitted. Do not show a
working-looking control whose save cannot affect the source. Do not add special
newsletter access rights merely because a person can edit public copy.

## Reader journey

### 1. Submit once and know what remains

D42's qualified immediate Join remains one action. D43 concerns the branch that
requires email confirmation. On a durably accepted public request, preserve the
non-enumerating receipt; where a narrow private receipt legitimately establishes
pending state, show **Check your email to confirm**. Never say **Subscribed**
while consent still awaits the reader's action or **Email delivered** without
delivery evidence.

Keep concise help near the receipt: check the entered address and spam/junk
folder. An address correction is a new destination choice and must use a
currently available authorized entry. It cannot mutate the pending destination
or bypass Off. Do not force sign-in, account creation, a donation, legal-name
fields, telephone details or a new device-binding ceremony.

### 2. The email continues the same request

Identify the exact public-safe newsletter and organization, why the email was
sent and the single action. Show the actual source deadline once that policy is
settled, in understandable localized form with unambiguous time-zone context
where a time is shown. Do not invent urgency, a countdown or a fresh window from
email delivery time. If a provider delivers the message late, its link still
resolves against the original source validity.

Example semantic composition, using existing email styles:

```text
Confirm your signup for [newsletter]

You requested [organization]'s [newsletter].
Use the link below to finish subscribing.

[ Continue to confirmation ]

If you didn't request this, you can ignore this message.
```

The email's link label must match its actual effect. Opening it displays the
generic protected doorway. **Continue to confirmation** is more precise than
claiming that the email click itself has already subscribed the reader. A
deliberate verified same-origin POST first establishes P17's short-lived
non-authorizing landing session; approved review facts follow only behind that
proof, with current checks on every render/command.
The final action remains one clear **Confirm subscription** button. Avoid a
further confirmation dialog, password/OTP ceremony or required checkbox.

### 3. Confirm independently of the hidden entry

The destination is the fixed, verified tenant Donor Portal protected-action
doorway, not a redirect to the original Page form. GET/HEAD with the non-secret
selector displays only a generic inert explanation; it must not disclose
organization, action, recipient, resource, expiry or terminal facts. The email supplies the permitted
purpose explanation, and any later masked review facts must follow the qualified
producer descriptor. It works without a logged-in account, the original browser
or an intact cookie from initial signup; the narrowly qualified capability
belongs to the pending occurrence. Current purpose/safety restrictions still
apply. It must not become a general subscriber lookup or grant login/CRM access.

Opening a link, prefetch, email scanning and GET must neither subscribe nor
consume/invalidate the opportunity to confirm. The deliberate protected action
then rechecks the exact occurrence, original expiry and current restrictions.
The action records a single accepted source effect and displays the corresponding
result. Do not pretend that a button alone proves a human; qualify the actual
scanner/CSRF/abuse behavior at implementation.

If the reader is signed into a different account when opening the confirmation
link, no identity or destination is silently substituted. This is the pending
newsletter request's narrow action, not account switching or an Auth email
change. Display only the destination information permitted by the capability's
read contract; do not reveal historic identity, donor status or suppression
details to a forwarded-link holder.

### 4. Success and exit

After accepted confirmation, show **You're subscribed to [newsletter]** and a
short explanation of how to unsubscribe through the existing qualified path.
No mandatory onboarding, upsell, guide, account or donation follows. A safe
return-to-public-ministry link may appear only if its current reach permits it.
Do not claim welcome mail, a first issue or actual delivery unless independently
authorized and supported.

Reopening the confirmation link can recover an appropriate permitted result;
it must not apply consent again. If the reader later withdrew, recovery must not
show an actionable historical **Subscribed** state that contradicts current
state or automatically rejoin them. Use the source's authorized current result.

## States, exact copy and graceful recovery

| Source condition                                                     | Proposed reader presentation                                                 | Required safe behavior                                                                                                                                                                          |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Valid pending request; originating entry subsequently hidden         | Same protected-action doorway and **Confirm subscription**                   | Generic inert GET; only qualified masked review facts thereafter. No new signup or deadline; no detour to hidden Page; current restrictions still checked.                                      |
| Form opened before Off but never durably accepted                    | **Signup isn't available from this page right now**                          | Reject new intake at the source, including D42's immediate path. Never manufacture an earlier accepted occurrence.                                                                              |
| Confirmation operation in progress                                   | **Confirming…**                                                              | Preserve visible focus and prevent accidental repeat activation; do not imply success yet.                                                                                                      |
| Confirmation accepted                                                | **You're subscribed to [newsletter]**                                        | One source effect; a result is not evidence of email delivery.                                                                                                                                  |
| Result uncertain after network interruption                          | **We couldn't confirm the result yet. Check again.**                         | **Check again** reconciles the same operation under narrow current authority. It must not create new consent.                                                                                   |
| Definitive temporary failure before acceptance                       | **We couldn't finish this signup. Try again.** where safe                    | Preserve the same eligible occurrence; recheck current deadline/restrictions on deliberate retry.                                                                                               |
| Expired request or unrecognized link                                 | **This signup link is no longer available**                                  | Offer **Start a new signup** only if a current authorized entry exists; otherwise provide a safe exit. No automatic renewal or subscriber lookup.                                               |
| Closed purpose, withdrawn/superseded request or stronger restriction | **This signup can no longer be completed** or the source-approved equivalent | Do not reveal a private cause in public. Offer only a currently permitted remedy. A different address must not be suggested as a bypass for a broader restriction.                              |
| Signup capability currently Off, without terminal revocation         | **Signup is unavailable right now** or the source-approved equivalent        | Current Off blocks completion. Do not falsely mark the occurrence expired/revoked; a later On still requires original validity and current eligibility, and does not revive terminal transport. |
| Reader asks for resend while the same occurrence remains eligible    | Neutral **Request received** or a truthful authorized result                 | Bound the resend to the same purpose/destination/original expiry and current delivery authority. No account requirement, no new grace period, no repeated automatic campaign.                   |
| Same link opened again after accepted effect                         | Source-qualified current result                                              | No second membership, no duplicate confirmation effect, no reactivation after later withdrawal.                                                                                                 |
| Old Page URL now unavailable                                         | Safe public unavailable page, if reached separately                          | Do not confuse this with the independent permitted confirmation path. No exposing a restricted Page merely to complete signup.                                                                  |

Specific expiry versus generic unavailable copy depends on the capability's
qualified disclosure authority. An invalid random token must not reveal whether
an address, request, newsletter relationship or restriction exists.

## Resend and abuse balance

Resend is a reader-requested recovery effect, not a second subscription or a
license for unlimited reminders. Keep it adjacent to relevant check-email help
and use the existing qualified mechanism; do not create a public pending-list
search. A receipt or other narrow occurrence context must be resolved through
the source. Repeated unauthenticated guesses cannot occupy an address, reveal
pending status, extend expiry or repeatedly invalidate the useful email a real
reader already holds.

If the entry is Off and the original occurrence is still eligible, a permitted
resend may only continue that exact occurrence within its existing validity and
delivery constraints. Creating a replacement occurrence, changing its address,
retargeting its purpose or renewing its deadline is a new start and cannot use
the pending-completion exception. A resend cannot guarantee arrival before the
deadline, and the UI must not promise otherwise. Any numerical retry/rate/window
limits require actual owner qualification; this note does not invent them.

## Privacy and capability handling

Use P17's exact producer-owned protected-action protocol. The fixed, verified
tenant Donor Portal HTTP path/query carries a random non-secret selector only;
the independent 256-bit verifier is in the fragment. No address, name, answer,
provider credential, verifier, long-lived bearer authority or tenant-selectable
destination belongs in the HTTP path/query. The minimal first-party script
removes the fragment from browser-visible history and supplies the verifier only
through the deliberate same-origin POST. No auth token, verifier, email, form
answer or full sensitive URL enters analytics, session replay, logs, trace
attributes, provider tags, support history or third-party embeds.

The confirmation surface needs private/no-store treatment and an appropriate
`no-referrer` policy; do not cache a capability response as public content.
Navigation from it must not carry the verifier to other pages or third parties.
Fragment cleanup cannot consume the usable confirmation, create an authorized
session, post automatically or turn the doorway into login. Do not prescribe a
parallel URL-token, restricted-session or alternate handoff system; the source
descriptor must instantiate the existing shared protocol and assurance contract.

Minimize identity display, especially for forwarded mail and shared devices.
The confirmation link never grants general preference management, subscriber
exports, donor/account information or another tenant's data. Tenant, exact
newsletter, destination and occurrence are resolved from trusted source context,
not selected by the browser or inferred from the currently signed-in account.

## Visual, mobile and accessibility requirements

Use one quiet, single-column card or the existing public-form layout: clear
heading, short explanation, one primary action, then secondary help/exit. Reuse
Maia spacing/radii, semantic foreground/background/border tokens and the shared
focus treatment. There is no need for a stepper, confetti, eligibility badge,
countdown, marketing carousel, modal stack or full account dashboard.

Public signup intake retains the repository's native semantic,
no-JavaScript-capable public-form contract. Protected confirmation is a different
boundary: it requires P17's minimal first-party fragment-handling script and
deliberate same-origin POST. Use semantic controls and server validation without
a heavy bundle or third-party tracker. If the required script is unavailable,
show a helpful safe explanation, such as **This confirmation needs the site's
essential script. Open the link in a supported browser to continue.** Do not
mutate or consume proof, invent a no-JavaScript URL-secret route, add an OTP
fallback or require an account. Email needs a meaningful plain-text rendition;
essential text and controls must work with images blocked.

Use visible labels and contextual accessible action names. Errors remain in
the page, associated with relevant controls, and suggest safe corrections.
Announce material state changes without forcing focus for ordinary async
feedback; avoid rapid repeated announcements from polling. Preserve keyboard
operation, focus visibility and focus restoration. Do not rely on hover or a
toast for the only explanation of an unavailable action.

Verify the existing 44px touch-target guidance, narrow-screen/320-CSS-pixel
reflow, zoom, long and localized newsletter names, RTL layouts where supported,
time-zone clarity and reduced motion. The 44px product convention is not a
claim about WCAG AA's separate minimum criterion. Low bandwidth/offline handling
must distinguish **not accepted**, **accepted** and **result unknown**. Do not
promise an offline consent replay that executes later against stale rules.

## Material UX concerns for the full review

| Concern                                                                      | Severity / likelihood without correction | Evidence and effect on A                                                                                                                             | Permanent correction                                                                                                                     |
| ---------------------------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| The valid email link redirects to the hidden form/404                        | Moderate / medium                        | Mailchimp distinguishes page unpublishing, but Core already promised a continuing accepted occurrence. Adds required composition, does not reject A. | Independent qualified confirmation surface; no need to re-open the Page or create another request.                                       |
| Generic Off secretly cancels requests or fails to stop new intake            | High / medium                            | Glossary, D6/D7/D42 and purpose-owned form boundaries separate meanings. Narrows configuration interpretation.                                       | Exact scoped labels/effective source state; entry Off stops new starts, purpose closure retains stronger effects, no new pending toggle. |
| Scanner consumes proof or turns link opening into consent                    | High / medium                            | Auth0 documents accidental scanner verification. Adds an action boundary.                                                                            | Inert GET, protected explicit action, safe replay and actual scanner/abuse qualification.                                                |
| A helpful resend silently renews or retargets pending consent                | High / medium                            | D42 purpose/destination/generation-bound proof and current delivery rules. Adds recovery limits.                                                     | Same occurrence, original deadline, bounded reader-requested delivery, no address/purpose change or automatic reminders.                 |
| Uncertain response or stale success misleads reader about membership         | High / medium                            | Domain-owned durable outcome and W3C feedback principles. Adds honest state/recovery.                                                                | Reconcile one accepted operation and current state; no timed fake success or duplicate Join.                                             |
| Specific error, logged URL or tracking leaks private relationship            | High / medium                            | OWASP token/referrer/non-enumeration guidance; ADR0170 privacy boundary. Adds disclosure limits.                                                     | Opaque narrow capability, private cache policy, no-referrer, no sensitive instrumentation, source-authorized error detail.               |
| Account/OTP/modal requirement frustrates a guest finishing on another device | Moderate / medium                        | Native no-account journey, W3C correction/feedback principles. Simplifies A.                                                                         | Explicit final confirmation only, no fresh account/donation/device condition, accessible lightweight native form.                        |

Likelihoods are reasoned risks, not observed production frequencies. The full
review must independently establish database authorization, domain currentness,
concurrency, exact source contracts and runtime feasibility.

## Falsifiable UX proof

1. Accept a pending signup, hide only its original Page entry, then finish before
   the original expiry: the reader uses the same confirmation path with no
   account, new signup, changed destination or changed deadline.
2. Open a form before Off but submit after Off: no accepted request is invented;
   the user receives the accurate unavailable result.
3. Purpose closure, withdrawal, expiry and stronger restrictions block completion
   independently, with no private-state enumeration or disabled-button dead end.
4. A scanner/GET/preview does not activate or consume confirmation. An actual
   protected confirmation works through the fixed doorway from a different
   supported browser without the initial signup cookie. Missing required script
   yields safe help without mutation, proof consumption or an alternate token
   route. No claim is made that these tests prove all bots impossible.
5. Double clicks, email reopen and a lost response produce one consent effect;
   recovery after later withdrawal does not restore consent or misstate current
   eligibility.
6. Resend remains within the original occurrence and expiry, cannot retarget and
   cannot use Page Off to create a new start. The reader sees truthful dispatch
   feedback instead of guaranteed delivery.
7. Change staff permission, organization/source state, Page entry and D42 option
   independently: persisted outcomes and interface explanations match their
   different scopes; existing subscriptions remain intact under entry-only Off.
   Capability Off blocks completion without terminal revocation by itself;
   reenable does not reset expiry, auto-complete or revive terminal transport.
8. Test actual keyboard/AT/status/error/focus, mobile/reflow/zoom, long localized
   copy, images-blocked email and slow/offline conditions. Browser and mailbox
   evidence, not this document or a static screenshot, must support the result.
9. Inspect real network responses, caches, referrers, redirects, analytics and
   logs: no capability or private identity escapes its qualified boundary.

These are future acceptance requirements. No runtime, mailbox-delivery,
usability or accessibility-conformance pass is claimed by this research.
