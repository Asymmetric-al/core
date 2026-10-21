# Q44 research — a finite newsletter confirmation window

October 18, 2026. Primary documentation freshly opened on this date. This is
research for the next single Grill with Docs question, **not adoption of a
duration, tenant control, retention period or implementation**. Only this new
evidence note was changed. No mailbox, live tenant, provider account, prior
executable, production database or actual reader was used.

The next useful decision is whether Asym supplies one finite confirmation
window or authorized staff configure it for their organization. Recommend one
supported period, with a clear deadline and straightforward recovery. There is
no established ministry requirement here for another settings field. The exact
number must be an explicit product choice, never an undocumented developer
constant or an assumed consequence of D43 ratification.

## Repository boundary

[Ratified D43 C03](../phase28-d43-pending-newsletter-confirmation-adversarial-review.md)
requires a finite original deadline derived from the owning policy and
authoritative acceptance time. Confirmation must occur strictly before it;
equality is expired. Resend, read, retry, policy lengthening, Page Off→On and
signup-capability Off→On cannot extend that accepted occurrence. Current
stronger rules can stop it earlier. Capability Off blocks admission while
disabled without itself terminally revoking every pending request.

D43 explicitly leaves both the numeric period and retention unresolved.
[D6-C15's earlier proposal](../phase28-d6-adversarial-review.md) of 72 elapsed
hours and 24-hour terminal-material purge was **not adopted**. They are not
current defaults. Reader confirmation validity and evidence/data retention are
different policy questions; the user should not be asked to choose an internal
cleanup timer as part of deciding the reader's journey.

[Ratified D42](../phase28-d42-verified-email-newsletter-signup-adversarial-review.md)
already supplies the qualified signed-in verified-address path. This question
concerns requests that still require email confirmation, not a new login
expiry, account-verification policy or permission grant. The P17 protected
doorway remains authoritative: its non-secret selector, fragment verifier,
minimal first-party script and deliberate same-origin POST are unchanged.
Nothing below authorizes automatic GET confirmation or alternate token flows.

## Six current primary sources

| Source                                                                                                                                                                             | Documented fact                                                                                                                                                                                                                                                                                               | What it establishes, and what it does not                                                                                                                                                                                                                                                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Brevo — Double opt-in: what it is and how to track user sign-ups](https://help.brevo.com/hc/en-us/articles/208733449-Double-opt-in-DOI-What-it-is-and-how-to-track-user-sign-ups) | Its documented DOI link expires after 30 days. A form submission is not yet a contact-list subscription; confirmation adds the subscriber. Unconfirmed attempt information can remain in logs.                                                                                                                | A mainstream newsletter product has an explicitly finite newsletter-specific window. It does not establish 30 days as optimal, a precise Core acceptance-clock algorithm or an appropriate Core retention rule. Its recommendation to archive email content/links must not override Core secret-handling boundaries.                                                                     |
| [Broadcast — Confirmation Pages](https://sendbroadcast.net/docs/confirmation-pages)                                                                                                | The current page, marked updated October 16, 2026, documents a 24-hour default and channel choices of 24 hours, 48 hours, 7 days, 30 days or Never. Changes apply to new links; existing links keep their assigned expiry. Expired links have a distinct outcome and a fresh form submission can start again. | Direct evidence for both fixed defaults and finite configurable alternatives, plus understandable expiry recovery. This is a comparable product's documented behavior, not proof of comparative usability or market leadership. Its Never option conflicts with Core's finite-validity requirement and is excluded. Its send-time anchor does not replace Core's acceptance-time anchor. |
| [Ortto — Email settings](https://help.ortto.com/a-12-email-settings)                                                                                                               | The DOI section explicitly says its subscription confirmation link does not expire.                                                                                                                                                                                                                           | This is an explicit counterexample to a universal vendor convention, not a recommendation for Asym. Core's ratified finite-validity rule governs; do not import indefinite authority merely because a vendor supports it.                                                                                                                                                                |
| [Mailchimp — Troubleshoot the Opt-in Confirmation Email](https://mailchimp.com/help/troubleshoot-the-opt-in-confirmation-email/)                                                   | It documents variable delivery times, recommends allowing time before troubleshooting, and says some webmail delivery can be delayed up to 24 hours. It discusses junk folders, filtering and sender configuration.                                                                                           | Delivery and reader availability matter when selecting a usable window. These are vendor troubleshooting statements, not measured current Core delivery latency or a guaranteed 24-hour bound. The page does not specify a confirmation-link lifetime.                                                                                                                                   |
| [Ghost — Can I see a list of unconfirmed members emails?](https://ghost.org/help/unconfirmed-member-emails/)                                                                       | Readers must confirm membership by email. Unconfirmed addresses are not exposed in the Members dashboard and cannot be sent promotional emails through it.                                                                                                                                                    | Pending requests need not become a staff lead list or reminder campaign. This page supplies no numeric expiry or cleanup guarantee, and Ghost membership is broader than Core's narrowly scoped newsletter subscription.                                                                                                                                                                 |
| [OWASP — Forgot Password Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)                                                             | Its account-recovery guidance calls for cryptographically generated, securely stored, single-use tokens expiring after an appropriate period, along with non-enumerating responses and abuse controls. It supplies no universal numeric lifetime.                                                             | Useful corroboration for bounded proof and abuse resistance; password reset is a different authority and risk. Do not import an auth timeout, query-string secret pattern, recovery flow or extra reader challenge over Core's P17 protocol.                                                                                                                                             |

These are documented product/security facts. No opened source proves that 24
hours, 72 hours, seven days or 30 days produces the best missionary-newsletter
signup outcomes. No current reader study, conversion experiment or support
volume for Core was available. Older Ghost auth-link discussions, third-party
claims about other vendors and search snippets were not treated as policy
evidence. This research adds no vendor dependency.

## Compare the strongest alternatives

**One Asym-supported finite period — recommended product judgment.** Readers
see one predictable rule; staff do not administer a security-shaped duration
field. Support and tests cover one ordinary lifecycle, while existing tenant
signup controls and stronger source/recipient restrictions remain effective.
This fits a narrow newsletter opt-in capability and the user's repeated
instruction to avoid needless settings. It does not mean all jurisdictions or
sources must ignore stronger applicable restrictions.

**Organization-configured finite period — credible alternative.** Staff may
have a documented audience or privacy reason for a different supported window.
The cost is an additional permissioned setting, validation, explanation,
version history, migration behavior and support surface. No such concrete Core
tenant requirement was established in this research. If selected, constrain it
to supported finite choices, apply ordinary changes prospectively, preserve
the originally accepted deadline, and do not permit staff to reset one
reader's expired request. There is no reason to add per-missionary,
per-newsletter, per-template or per-reader exceptions by default.

**No expiry — reject for this question.** It contradicts D43 and makes a stale
instruction usable indefinitely. Ortto's documented behavior is therefore an
identified external conflict, resolved in favor of the governing Core rule.
Disabling signup is not an alternative way to make the deadline indefinite.

## Recommended single question

> For readers who still need to confirm by email, should Asym use one standard
> confirmation period, or should each organization choose it?

- **A — One standard period (recommended).** Asym uses one supported finite
  window and clearly shows when the request expires. Staff have no extra
  duration setting.
- **B — Organization-set period.** Authorized staff choose a supported finite
  window. Readers see the resulting deadline.

This question selects control ownership, not a hidden numeric policy. The
numeric period must be settled explicitly before activation. If the next
question needs a concrete candidate rather than ownership alone, **seven
elapsed days** is a defensible product proposal: it allows a weekly inbox
cycle and delay while keeping authority finite, and it is a documented
supported option in comparable software. That rationale is an inference, not
an observed Core behavior, legal requirement or proven optimum. A 30-day
window has direct mainstream precedent but retains pending authority longer;
24 hours has precedent but leaves little practical margin when email is
delayed. This note does not select any of them or revive the earlier 72-hour
proposal by implication.

## Reader and staff experience under either finite choice

The ordinary reader action remains small: submit, check email, deliberately
confirm, and receive an honest result. Show the original deadline in the
confirmation message and where its disclosure is authorized, using a localized
date and time with a clear time zone when needed. A countdown, date picker,
mandatory account or policy-explanation modal adds no necessary capability.
Keep the verified-address immediate path free of this email step.

An expired request should explain that the confirmation link has expired and
offer the existing signup route when that route is currently available. The
reader deliberately starts a new accepted request; opening an old link must
not silently create one. If the entry is hidden or signup disabled, explain
unavailability without exposing a subscriber or reviving admission. A new
request uses current rules. Existing unsubscribe access remains available.

Resending before expiry may help delivery under the already governed bounded
recovery rules, but cannot restart the clock. Do not promise a new period in
the button label or email. Repeated clicks, expired links, unknown links,
already-completed requests and uncertain transport outcomes need distinct
internal evidence and appropriately safe, comprehensible public responses;
there must be no account-enumerating lookup or misleading success.

Staff should see the effective rule in the existing capability/settings
context only when useful. If A is selected, describe it without a disabled
duration input that suggests editing is possible. If B is selected, one
organization field and concise prospective-effect help text suffice. Neither
option creates a pending-address directory, resend campaign or new tenant
rules engine.

## Remaining proof boundaries

Before activation, the selected exact value and unit need acceptance tests for
just before, exactly at and just after expiry; delayed dispatch; lock waits;
stale tabs; read/resend/retry; Off→On; policy changes; and restore. Authoritative
elapsed time is not the device clock or a localized calendar-day calculation.
UI proof must include the expired-reader recovery path on mobile and keyboard,
and honest behavior when the minimal protected-confirmation script cannot run.

Retention requires its own justified owner policy for raw pending data,
verifiers, minimal durable evidence, logs and backups. Expiry does not itself
prove all copies are deleted; retention never restores confirmation authority.
No additional timing or retention decision is adopted in this note.
