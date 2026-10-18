# Q42 research — native newsletter admission confirmation

Research-only evidence, October 18, 2026. Scope: the reader-visible choice between
confirmation for every new native newsletter admission and a direct Join action
for an already signed-in reader using the same verified address. This note makes
no founder decision, source change, runtime claim or legal conclusion. No earlier
probe, model or verifier was executed.

## Recommendation and strongest alternative

**Recommend retaining uniform exact-newsletter/address confirmation for this
release.** The reader chooses the named newsletter, receives the purpose-specific
email, and deliberately confirms. No account or donation is required. An already
active identical subscription needs no repeated confirmation. This retains D6's
one predictable admission policy and avoids a separate cross-purpose proof-reuse
branch whose qualifying evidence is not yet established.

The strongest alternative is legitimate product design: after an explicit Join
action, a signed-in reader with an owner-qualified, current proof for the exact
address could subscribe immediately. That saves an inbox round trip. It is not
equivalent to subscribing everyone who logs in or donates. However, a generic
`email_verified` flag or an old successful login does not supply all the required
proof. This would be an explicit amendment to D6-C05 and its surrounding decision,
not an interpretation that existing D6 already allows it.

**Evidence does not establish a universal winner.** Current primary platform
documentation supports both single and double opt-in, and account-based topic
preferences. It does not measure which journey Core's missionaries' readers
prefer, prove Core's account assurance adequate, or establish that another email
is legally required everywhere. Recommendation rests on bounded first-release
scope, Core's proof rules, abuse prevention and predictable reader experience.

## Fresh primary sources

All four sources below were directly opened during this pass. Vendor statements
describe documented capabilities; they are not independent effectiveness studies.

| Source                                                                                                                | Verified fact                                                                                                                                                                                                                           | Application and limit                                                                                                                                                                                                                                                                                            |
| --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Mailchimp: Choose Opt-in Settings](https://mailchimp.com/help/set-signup-preferences/)                               | Current documentation offers single and double opt-in. Single is the stated audience default; double requires confirmation through the relevant channel.                                                                                | Establishes that reduced-step and confirmed admission are both mainstream choices. Its default is not a Core requirement, and its audience-level setting does not prove an authenticated exact-address exception is safe here. No conversion or legal claim is imported.                                         |
| [Ghost: Setting up email newsletters](https://ghost.org/help/setup-email-newsletters/)                                | Members can choose individual newsletters at signup or manage them in account email preferences. Each newsletter has its own subscriptions. The page also describes automatic addition of existing members as an administrative option. | Supports named, independently understandable newsletter purposes and an account preference surface. The page does not establish the exact proof or confirmation ceremony used for every preference change. Core must not copy automatic enrollment because its deliberate exact-purpose instruction is stricter. |
| [OpenID Connect Core 1.0, §5.1 Standard Claims](https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims) | `email_verified=true` means the provider took steps to establish address control when verification occurred. The assurance method depends on its trust context. Email is not a unique person identifier.                                | Supports distinguishing historical address verification from fresh purpose consent and current source authority. It does not prohibit a qualified application from reusing accepted proof, but does not itself define or authorize that reuse.                                                                   |
| [Auth0: Verify Emails](https://auth0.com/docs/manage-users/user-accounts/verify-emails)                               | Verification can arise through email links, one-time codes, custom flows or bulk/API updates. The page warns about accidental link verification by scanners.                                                                            | Demonstrates why one boolean does not document proof provenance or a deliberate newsletter choice. Core need not adopt Auth0, its token lifetime or its exact UX; D6's explicit confirmation action and inert link opening already address the scanner issue.                                                    |

The obsolete Mailchimp `about-single-opt-in-and-double-opt-in` URL could not be
opened. Its current opt-in settings page was opened successfully and used
instead. Community forum and search-result anecdotes were not promoted to
verified product behavior. No authenticated competitor account, mailbox flow,
conversion experiment or representative reader interview was performed.

## Verified Core intent and ratification boundary

- [D6 corrected decision and C05–C07](../phase28-d6-adversarial-review.md)
  explicitly require fresh exact-newsletter/address confirmation for new admission
  and re-subscription; explicitly exclude a verified-profile shortcut; preserve a
  no-op for an already active identical subscription; and separate Page-entry Off
  from consent withdrawal and newsletter purpose closure. Its opening records
  these amendments as review recommendations, not an earlier ratification.
- [D7's ratification statement and C07](../phase28-d7-adversarial-review.md)
  expressly say D7 ratification does not ratify D6. D7 requires positive native
  newsletter eligibility and exact authorized recipients. Its newsletter
  recipient journey uses the qualified D6 admission journey rather than creating
  a second subscriber authority.
- [P4 identity foundation](../../../../prds/sitestacker-parity/phase-04-identity-account-claiming-foundation.md)
  A5–A6 distinguish claim, sign-in, contact verification and current authority;
  password/provider assertion is not current inbox-possession proof. Section D
  treats verification as evidence tied to the current contact-email revision,
  separately from durable claim. Newsletter admission is not donor claiming, so
  the claim ceremony should not be copied wholesale; the evidence distinctions
  remain relevant.
- [P3 permission and consent foundation](../../../../prds/sitestacker-parity/phase-03-minimum-permission-role-scoped-projection-foundation.md)
  A4 and export/consent governance preserve a subtract-only authorization boundary
  and independent current consent/suppression checks. A positive subscription
  cannot override broader restrictions, authorize another newsletter or grant
  donor/CRM/protected-content access.

These are intended owner boundaries. They do not prove a qualified native
newsletter producer, email proof-reuse path, successful delivery or deployed
implementation exists.

## Reader journey with the recommended policy

1. Show the specific newsletter name and a short description. Use the existing
   short form: Email, optional single Name, one **Join newsletter** action. Keep
   the journey separate from donating and account creation.
2. On accepted pending admission, explain the next step plainly: **Check your
   email to confirm this newsletter.** Do not say Subscribed yet. Preserve the
   entered address locally enough to correct a typo without exposing an existing
   subscriber lookup. Recovery/resend stays bounded under D6's exact source rules.
3. The email identifies the same newsletter. Opening its link shows a clear
   confirmation action; scanners, previews and page loads do not subscribe.
4. After source acceptance, show the named subscription and how to stop it. A
   lost response reconciles the same accepted instruction; it does not create a
   second subscription or fabricate a failed operation.
5. Expired, withdrawn, superseded or no-longer-permitted requests explain the
   permitted next step. Closing intake does not erase subscribers or break
   withdrawal. Reopening does not revive old confirmation evidence.

These are design judgments within existing D6 intent, not a new confirmation
wizard, mandatory account or additional administrator policy screen. Tenant and
missionary controls over the entry remain as already scoped. A general setting
that bypasses purpose consent or broader suppressions would be inappropriate.

## If the founder chooses the direct signed-in alternative

The question should describe the reader's outcome rather than ask the founder to
choose a token design. The exact amendment would need to preserve these limits:

- Every admission remains a fresh, deliberate instruction for the named
  newsletter and displayed exact address. Login, giving, being a donor, contact
  matching, account membership and another subscription imply no consent.
- Public, unverified, changed-address or insufficient-assurance cases use the
  ordinary email confirmation path. Qualified signed-in admission must resolve
  trusted current principal, exact address revision and accepted proof provenance
  at the source boundary; the client cannot choose or certify them.
- Proof reuse must be explicitly admitted by P4/P28/P3 and tested against stale
  credentials, changed addresses, represented subjects, shared mailboxes, consent
  withdrawal and broader suppressions. Do not invent an assurance age or claim
  that a raw flag already passes this test.
- Both paths write the same bounded native subscription authority and evidence,
  preserve the same privacy/withdrawal rules, and introduce no separate list,
  provider authority, entitlement or automatic welcome campaign.

Until that product choice and source qualification are explicit, the existing
uniform confirmation recommendation is the narrowest defensible path. The
founder-facing tradeoff is one inbox confirmation per new subscription versus
fewer steps for some signed-in readers; neither option requires another everyday
tenant setting.
