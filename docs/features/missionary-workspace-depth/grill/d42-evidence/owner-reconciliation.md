# D42 — owner reconciliation for a verified signed-in Join

October 18, 2026. Research-only review of Core
`9cada8f3d8ab59db391d3fd20df77fcadeb09813` and its research working tree.
The founder has selected Q42 **B** and explicitly requested simple signup/rejoin,
tenant control and congruence with Supabase Auth/RLS. Selection is evidence of
that direction; the extra clauses below are review recommendations until adopted.
No formal PRD, ADR, OpenSpec, code, schema, tracker or live configuration was edited.
No prior program or probe was executed.

## Finding and recommended disposition

**Accept with required amendments.** The strongest alternative, confirming every
new join by email, has one assurance path but adds a mailbox round trip even when
the current account already supplies qualified address evidence. B is a coherent
lower-friction choice: the fresh **Join** supplies purpose-specific intent; the
qualified current Auth-address proof supplies address evidence. Neither fact can
substitute for the other. B must not claim fresh current inbox possession merely
because an account was verified previously.

The exact existing conflict is D6-C05's still-unadopted recommendation to require
fresh email confirmation for every new admission/rejoin and introduce no
verified-profile shortcut. This is not a conflict with an already ratified
universal newsletter-confirmation rule. D7 expressly did not ratify D6. The
ratified completeness C07 preserves that distinction.

## Exact corrected decision recommended for the parent review

> **D42 — Deliberate Join using a qualified current verified account address.**
> When the organization allows this option, a signed-in reader can deliberately
> join or rejoin the named native newsletter in one action using the same current
> verified account address shown to them. The server revalidates the actual
> Supabase principal/session and exact current address through the shared Auth
> owner's qualified proof contract, and atomically records the new
> newsletter-specific instruction and its evidence through the native source.
> Verification alone, signing in, donating, importing a contact or following a
> Page never subscribes anyone. A changed/different or unqualified address uses
> the ordinary email-confirmation path without requiring an account.
>
> A fresh eligible rejoin replaces only that newsletter's prior withdrawal.
> It does not clear a broader objection, hard bounce, complaint or other current
> safety restriction, nor replay old accepted intent. An already active identical
> subscription is unchanged, with no duplicate subscription or confirmation.
> Signup does not create a donor, claim a Party, merge a person, grant protected
> access, join a tenant workforce or authorize a newsletter issue to be sent.
>
> Authorized staff have one organization-wide option to allow reuse of qualified
> signed-in address proof. Turning that option off requires the ordinary email
> confirmation for subsequent new joins/rejoins; it neither unsubscribes current
> readers nor rewrites accepted evidence. Native signup availability and the
> exact Page's existing entry/publication controls remain separate. No per-reader,
> per-missionary or per-Page confirmation matrix is added.
>
> Public Page content remains audience-invariant. Any signed-in address,
> personalized Join state and recoverable result are private, uncached interaction
> data. Scope comes from the trusted host/Site/Page/newsletter binding, never a
> caller-supplied Tenant, membership or address-verification flag. The public
> intake command uses its qualified server/source authority; a public projection
> context is not a mutation grant. Existing P3/P4/P6/P12/P17/P22/P23/P25 boundaries
> and current stronger restrictions remain effective.

Recommended tenant-control label: **Let signed-in readers use their verified
email**. Helper: “Readers who choose Join can subscribe with their current
verified account email. Other readers confirm by email.” The product default is
On **only for a newly enabled and fully qualified native signup capability**;
missing/invalid legacy policy cannot assume On, and this does not enable signup
on existing Pages. This is a review product judgment, not a discovered current
setting. The source-qualified rollout must initialize the explicit policy and
record its version; the server fails closed if it cannot establish the policy.

Off helper: “New signups and rejoins confirm by email. Existing subscriptions
stay as they are.” Save uses the existing settings authority and actual saved
result. Staff should not see a new dashboard, per-contact override or redundant
list of Auth/provider choices. The broader request to disable native signup uses
the existing exact capability/entry controls; it does not repurpose this option
as a global newsletter sending or unsubscribe switch.

## Owner and amendment map

| Owner / precise repository evidence                                                | Required reconciliation and what remains unchanged                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D6 review `:29–34`, `:75–76`, C05 `:346–351`                                       | Replace the universal fresh-confirmation recommendation and “no verified-profile shortcut” for the exact qualified current-address branch. Keep the active-identical no-op and the distinction between membership, send eligibility and delivery. Old evidence remains historical.                                                                                                                                                                                                            |
| D6 C04 `:337–345` and C14 `:419–429`                                               | Adapt the form: show the privately resolved current address with **Join** and an obvious **Use a different email** action. Do not force re-entry, optional Name entry or another consent checkbox in the qualified branch. The alternate address path remains the short guest confirmation journey. Do not create an account requirement or donation diversion.                                                                                                                               |
| Q42 research, “single founder question,” “UX and boundaries,” “continuation rules” | Record B as answered and reconcile its prior “No per-tenant confirmation-mode setting” statement with the founder's new explicit tenant-control request. One organization-wide narrowing option is sufficient; the question's recommended A is historical evidence, not the result.                                                                                                                                                                                                           |
| Completeness C07 `:536–544`, C08 `:546–557`, C10 `:566–575`                        | Adoption remains clause-specific. New work uses durable effect identity/current-authority recovery and one native source. No blanket D6 ratification, fake delivery success or guessed positive consent.                                                                                                                                                                                                                                                                                      |
| P3 `:69–71`, `:107–109`, `:200`, `:308–314`                                        | Preserve one PDP/projection and consent floor; absence of suppression is not admission. Add exact native newsletter positive evidence as a P28-owned source input, not an alternate consent resolver.                                                                                                                                                                                                                                                                                         |
| P4 A2/A5/A6/A7 `:138–165`, P25 IC01/IC06/IC07/IC08                                 | Supabase owns principal/session/credential truth; P4 owns accepted proof policy; P9 owns contact identity; P12 owns access. Reuse only an exact current qualified account-address proof, not a profile/contact email, provider assertion or mutable user metadata. Existing contact-proof history and donor claim are neither changed nor inferred. No extra confirmation is demanded solely to re-prove the lower-assurance newsletter action when the chosen qualified branch is available. |
| P12 §B `:1552–1587`; P25 IC02                                                      | Retain the four context variants and one trusted Tenant source. A signed-in visitor need not acquire a staff/donor/missionary membership to join a public newsletter. Use the certified P23/P28 source command and existing service authority, with the Auth proof as narrow input. Public projection is still read-only and cannot enqueue work. No fifth context or role union.                                                                                                             |
| P6 `:232–262`, `:323–325`, `:469–476`                                              | One manifest-qualified same-Tenant recipient branch remains mandatory. A no-Party source is structural precedent, not an already qualified native newsletter producer. The immediate Join needs no confirmation send; where confirmation is required, its exact source intent goes through P6. No arbitrary-email send or provider Contacts master.                                                                                                                                           |
| P17 `:1616–1643`, `:2139–2155`                                                     | Email-confirmation actions keep the producer-owned protected-action contract; GET/scanner/open does not activate. Human-authored newsletters remain outside the system-message catalog. Separate confirmation content and dispatch are qualified when needed. Exact unsubscribe is login-free/reduction-only; account proof never clears broader suppression.                                                                                                                                 |
| P22 `:349–367`, `:381–396`; P23 US23-026 `:707–734`                                | Exact Page contributor/publication and typed public-intake authority remain. One native source adapter must be certified before use. Public Page output and private address/action state have separate cache/read contracts. Newsletter Join cannot grant Page editing or subscriber browsing.                                                                                                                                                                                                |
| P23 D26 `:6549–6556`, ADR0170 purpose-handoff wording                              | Earlier P32-only newsletter-consent routing needs an explicit later native P28 amendment when formal publication is authorized. This does not make P32 a prerequisite or permit a second runtime owner.                                                                                                                                                                                                                                                                                       |
| P25 EX11–EX13 `:159–197`, EX16 `:221–225`                                          | Existing **Request newsletter** is an unverified external handoff with no visitor email and no enrollment; it is not this native Join. Preserve prior requests, clocks and outcomes. No backfill or wording conversion creates membership. Native Join does not inherit the external handoff's notice, seven-day or thirty-day rules.                                                                                                                                                         |
| D7 C07 `:454–461`, C12 `:499–511`, C14 `:527–535`                                  | Positive eligibility, frozen issue audience, current submission gates, login-free unsubscribe, structural same-scope checks and restricted evidence are unchanged. A later Join cannot enlarge an already accepted issue.                                                                                                                                                                                                                                                                     |
| D17 C08–C09 `:235–253`                                                             | Import creates neither opt-in nor verification nor automatic messages. Scoped negative contactability evidence remains effective. An affirmative imported “subscribed” or “verified” value cannot enter B.                                                                                                                                                                                                                                                                                    |

All paths above are relative to the repository root unless a nearby decision is
named. The parent review should carry exact file links for formal traceability;
this note is the bounded reconciliation evidence, not a generated authority.

## Required safety amendments and counterexamples

### OR01 — Auth-address proof is not account presence

**Material concern: yes. Severity high; likelihood plausible if ordinary
`email_confirmed_at`, a JWT claim or current profile email is taken as sufficient
without source qualification.** P4 distinguishes native sign-in, current contact
verification and accepted claim; P25 IC04 explicitly says a verified-email boolean
does not settle unsafe native provider linking. The source must declare the
qualified proof provenance, exact current principal/address revision and transition
fences that authorize reuse. A logged-in badge, provider email assertion, imported
flag or editable metadata cannot supply that contract. No arbitrary “verified
within N days” rule or new challenge product is justified by this answer.

**Exact amendment:** “The immediate Join branch SHALL require a current
server-validated Supabase session/principal and an exact current account-address
proof accepted by shared Auth/P4 for this purpose. Changed, pending, retired,
conflicting or otherwise unqualified evidence SHALL NOT be upgraded. Account
proof reuse SHALL NOT be represented as fresh mailbox possession, claim proof
or wider access.” Native social G01 remains a gate for any affected proof source;
independent qualified email/password/Auth paths are not blocked merely because a
different source remains unqualified.

### OR02 — Tenant membership cannot be manufactured to fit the route

**Material concern: yes. Severity critical; likelihood plausible in a reuse of
the ordinary member-only API wrapper.** A reader signed into organization A may
encounter organization B's public newsletter. Shared Auth is a principal fact,
not an organization-A membership grant usable in B. P12's public context cannot
mutate and the ordinary member context cannot silently fall back or cross tenants.

**Exact amendment:** “Public native signup SHALL bind the target Tenant and
purpose from the trusted host/Site/resource source and use its certified
server-side intake command. Reused Auth-address evidence SHALL authorize only
the presented exact Join. It SHALL create no Active Tenant Assignment, donor,
Party, employee, coach, follow or protected-reading grant and SHALL reveal no
other Tenant's membership or records.” Staff and missionaries acting as readers
get the same narrow self-Join; their privileged hat does not make somebody else's
address eligible. Impersonation/view-as is not a fresh reader instruction.

### OR03 — Rejoin is fresh consent for one newsletter, not a reset button

**Material concern: yes. Severity high; likelihood likely if a single global
subscribed flag is reused.** D7/P17 and D17 already separate list withdrawal,
global objections, contact validity and provider outcomes. The exact positive
Join may replace that list's previous withdrawal, but cannot repair a hard bounce,
complaint or a broader objection. Existing meaningful restrictions must not be
hidden by a success message that promises receipt.

**Exact amendment:** “A new eligible deliberate Join SHALL establish one current
exact-newsletter/destination instruction and its evidence. It MAY supersede that
newsletter's prior withdrawal only through the owning source; it SHALL NOT clear
other restrictions. An accepted operation replay SHALL return its prior effect
without reapplying it after a newer withdrawal. Changed-address or ABA address
history SHALL remain different revisions. Current membership, current deliverability
and inbox arrival SHALL remain separately described.” Detailed blocked-reader
copy must disclose only the reader's admitted own result, never an arbitrary
address's suppression or prior membership.

### OR04 — Policy defaults and Page switches must not acquire new meanings

**Material concern: yes. Severity medium–high; likelihood likely if all controls
are called “Enable newsletters.”** One org option controls whether acceptable
account proof may be reused. Existing Page entry controls govern where new intake
is offered. Purpose closure, unsubscribe and source safety govern their own effects.
The current question settles none of their unresolved clock/transition policies.

**Exact amendment:** “Disabling qualified account-proof reuse SHALL affect only
subsequent new admissions/rejoins at the source acceptance boundary and SHALL NOT
revoke accepted membership or proof. Re-enabling SHALL not replay earlier intent.
An unavailable/unknown policy is not On. Existing Page-entry Off, purpose closure,
send authority and withdrawal SHALL not be conflated.” A policy change during
display/submit must revalidate the current source and present the truthful next
step without claiming immediate membership from a now-disallowed branch.

### OR05 — Public personalization must not cross the publication boundary

**Material concern: yes. Severity high; likelihood plausible if a cached Page
embeds account email or subscription state.** P23 public output is
audience-invariant and P25 EX11 explicitly confines prefills/results to private
no-store interaction. B adds convenience, not a reason to fork PublicContentReader.

**Exact amendment:** “Personalized current address, exact self-subscription
status, Join receipt and session-dependent controls SHALL be privately resolved
and never appear in shared HTML/RSC/CDN output, public URLs, telemetry or another
browser's restored state. The public Page shell remains safely cacheable under
its existing rules; private results are separately fenced on sign-out, account
switch, host/context change and authority loss.”

## Genuine outstanding decisions versus implementation qualification

**Still unadopted policy in this session:** D6-C07's proposal that already accepted,
unexpired confirmation may finish after Page-entry Off; D6-C15's proposed 72-hour
proof usefulness and 24-hour raw-material purge plus the remaining evidence and
abuse limits. Q42 B does not answer either. Do not silently use those numbers or
claim that membership proof reuse ratifies the rest of D6. Page-Off during an
immediate Join must still serialize against the actual adopted entry admission
rule; guest pending-after-Off is the distinct surviving policy question.

**Engineering/source qualification, not a new founder UX fork:** the exact
current Auth proof projection and allowed provenance; source acceptance and
proof/session transition race; P23 native adapter and P6/P17 profile; effective
roles/grants/RLS; protected action/CSRF/cookie boundary; exact recipient source;
policy-version storage; bounded uniqueness and same-effect retry; cache fencing;
actual negative and concurrent tests. The qualified source must settle these
before activation, and the formal owner texts must be reconciled together when
`/to-prd` is invoked. None is established by a checkbox or by Supabase existing.

**Not required by this answer:** account creation, a new identity system, global
newsletter preference center, per-reader override, per-Page confirmation mode,
contact-enrichment integration, account-email auto-migration of subscriptions,
welcome email, automatic newsletter send, extra consent checkbox, new approval
queue, forced step-up for every Join or rewriting the financial policy gates.

## Evidence classification and limits

These findings are repository intent facts plus explicit product/engineering
judgments. Governing clauses and original research were freshly read; no actual
native Auth environment, database, provider or end-user outcome was tested by
this workstream. P25 IC04's G01 gate and P6/P17 producer readiness are inherited
qualification requirements, not newly discovered deployed vulnerabilities. The
parent's Auth, RLS and primary-product workstreams should independently supply
current source and external evidence. No numerical incident likelihood, legal
mandate, conversion gain or representative ministry preference is asserted.
