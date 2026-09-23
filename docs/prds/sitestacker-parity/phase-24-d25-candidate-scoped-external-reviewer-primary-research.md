# Phase 24 D25 — candidate-scoped external reviewer primary research

Date: 2026-08-28  
Founder answer: **Option 1 — candidate-scoped external reviewer**  
Founder amendment: **Do not make it inflexible for staff or Tenants**  
Research disposition: **Accept with required amendments**

> **Question researched:** When D23 requires a different human, D24 excludes
> every substantive participant, and no qualified internal reviewer remains,
> how can Core let a Tenant use an external reviewer without creating standing
> access, a self-review bypass, a generic workflow engine, or a frustrating
> staff dead end?

This file is primary-source research and product-contract input. It changes no
runtime, schema, migration, OpenSpec requirement, ADR, ticket, provider
configuration, public Site, Giving behavior, or financial behavior.

## Executive conclusion

The founder's choice is the best permanent direction, but the unqualified phrase
**candidate-scoped external reviewer** is not safe or usable enough to record by
itself.

The corrected decision is:

> When an exact current protected candidate requires a different human and no
> qualified internal reviewer is available, Core SHALL offer a
> **source-authorized Candidate Review Grant** only when every applicable,
> still-unsatisfied source contract explicitly permits external review and can
> produce a complete permission-safe review bundle. The grant binds one
> verified distinct stable human to one Tenant, environment, Site where
> applicable, source action, immutable candidate and dependency graph, review
> epoch, participant proof, safe bundle, permitted decision meanings, expiry,
> revocation state, and authorization/governance epochs. It grants no standing
> Tenant membership, role, route membership, editing, onward delegation,
> unrelated visibility, export, Giving, Legal Entity, Stripe, settlement, bank,
> accounting, or general financial authority.
>
> Staff SHALL have a quick, reversible journey: choose any currently eligible
> saved Reviewer contact or add a new person; see exactly what the person will
> see and what their decision can do; send through a separately Live Phase 17/6
> invitation contract; then resend, cancel, revoke, replace, or invite the same
> person to a changed successor
> without rebuilding standing access. A saved contact, prior review,
> accepted invitation, notification, email address, or possession of a link
> never grants current review authority.
>
> Phase 4 owns the authority-free invitation, contact proof, redemption, and
> account binding. Phase 12 resolves one new membership-free **Candidate Review
> Authorization Context** from one active exact Candidate Review Grant. The
> reviewer authenticates as the invited stable human and performs a current
> step-up before decision. An email or link may start authentication but SHALL
> NOT itself approve. Every read and the final source-owned command re-proves the
> exact scope, identity, independence, candidate, source policy, bundle, grant,
> expiry, revocation, authority, and expected heads. Unknown,
> changed, expired, revoked, ambiguous, or unsafe proof blocks while the current
> Live website remains unchanged.

### Why this is flexible without becoming broad

The permanent UX flexibility comes from:

1. reusable Tenant-owned **Saved reviewer contacts** that are convenience
   references only;
2. a picker that shows multiple lawful choices and also permits **Add a new
   reviewer**;
3. one-click resend, cancellation, replacement, and successor re-invite;
4. source-specific review bundles rather than one rigid synthetic format for
   every domain; and
5. clear recovery states that preserve the current safe Live version.

It does **not** come from broad guest accounts, a reusable approval role,
administrator override, email-link approval, source-policy weakening, or a
general delegation graph.

## Evidence labels

- **Verified repository fact** — observed in current Core source, accepted ADR,
  merged OpenSpec, or the governing Phase PRDs.
- **Verified external fact** — supported by a current official primary source
  linked beside the claim.
- **Product judgment** — the recommended Core choice after reconciling those
  facts; it is not represented as an industry mandate.
- **Assumption** — plausible but not established by evidence.
- **Unresolved unknown** — must be proved before implementation or Live release.

## Repository findings

### Verified governing facts

1. [Phase 12](./phase-12-full-role-permission-configuration.md) owns the single
   capability resolver, current Active Tenant Assignment, stable human
   identity, step-up, governance epochs, delegation, audit, and Tenant/object
   scope. Role names, browser state, and possession of an identifier are not
   authority.
2. Phase 12 currently defines exactly four Tenant Authorization Context
   variants: membership-backed Active Tenant Assignment, public-only Public
   Projection Context, single-Tenant Service Tenant Context, and audited
   Operator Tenant Grant Context. A nonmember external human is none of those.
   D25 therefore requires an explicit fifth membership-free Candidate Review
   Authorization Context rather than pretending the reviewer is staff, public,
   a service account, or a platform operator.
3. Phase 12 already says candidate-scoped protected reviewer delegation creates
   no standing Tenant membership or second role engine. It also requires exact,
   date-bounded, non-transitive delegation and forbids broad administrator,
   AI, timeout, email-link, and service-credential approval.
4. [Phase 4](./phase-04-identity-account-claiming-foundation.md) is the sole
   owner of invitation/claim purpose, recipient/contact binding, issuance,
   credential creation, expiry, replacement, revocation, redemption, current
   invitation state, postcondition, and completion audit. Its later bounded
   workspace/helper invitations are explicitly authority-free until the
   separately owned access grant is currently resolved.
5. [Phase 17](./phase-17-system-messages-template-management.md) expressly
   permits a one-person Tenant to invite one candidate-scoped reviewer for its
   protected publication. The invitation binds Tenant, immutable candidate,
   reasons, exact review/publish capabilities, inviter, verified invitee,
   expiry, and revocation. The delegate is a distinct stepped-up human, cannot
   edit or re-delegate, and receives only its source-owned synthetic projection.
6. Phase 17's current protected command is exact and atomic. A material content,
   dependency, permission, assignment, governance, contract, or head change
   makes the prior review stale; failure leaves the prior publication active.
7. Phase 17 already defines an authoritative seven-day Asym account invitation
   and a scanner-resistant redemption exchange. Its Supabase proof is shorter
   and does not replace the authoritative invitation.
8. Phase 17 does **not** authorize a generic Asym platform email account as a
   fallback for Tenant messages. The current platform-recipient branch cannot
   address arbitrary Tenant reviewers. D25 must not silently create that
   delivery authority.
9. Active
   [outbound-communications OpenSpec](../../../openspec/changes/sitestacker-parity/specs/outbound-communications/spec.md)
   permits one candidate-scoped reviewer who sees synthetic evidence, but its
   `latest material editor` wording conflicts with the stronger every-
   participant D24 decision. D24 requires a future OpenSpec correction before
   implementation. Its single sentence also leaves Phase 4 invitation ownership,
   the Candidate Review Authorization Context, one-active-grant cardinality,
   saved-contact non-authority, lifecycle, RLS, and final source reproof too
   vague for implementation.
10. [D23](./phase-24-d23-source-owned-proportional-independence-adversarial-review.md)
    makes external review source-specific. Every applicable still-unsatisfied
    source must opt in; missing or contradictory proof is indeterminate and
    blocks. D23 neither grants authority nor creates a delegation engine.
11. [D24](./phase-24-d24-every-substantive-participant-adversarial-review.md)
    excludes every source-defined substantive participant in the complete exact
    candidate lineage. Account, role, email, identity splitting, copy, import,
    restore, or latest-editor changes cannot launder independence.
12. [D21](./phase-24-d21-explicit-review-responsibility-routing-adversarial-review.md)
    and [D22](./phase-24-d22-small-co-responsible-reviewers-adversarial-review.md)
    make ordinary Website review routing an attention-only one-to-three-person
    internal route. That route is not action authority and must not be reused as
    the external delegation model.
13. [ADR-0027](../../adr/0027-one-notification-presentation-and-engagement-model.md)
    separates source truth, recipient projection, personal read state, and
    source completion. An invitation or item cannot become approval truth.
14. [ADR-0029](../../adr/0029-reference-not-copy-cms-operational.md) requires
    stable references instead of copied operational identity or permission
    truth. D25 may project source evidence but must not become its second owner.
15. [Platform principles](../../../openspec/specs/platform-principles/spec.md)
    rank Tenant safety and permission correctness above convenience while also
    requiring clear, accessible, product-level completion.
16. [Platform boundaries](../../../openspec/specs/platform-boundaries/spec.md)
    keep operational identity, permissions, approvals, audit-sensitive effects,
    and money truth in the CRM boundary. AI cannot widen the human's authority.

### Verified current implementation facts

1. No D25 runtime, database table, capability, invitation service, safe bundle,
   reviewer page, or test suite exists. A repository search finds no
   `delegated_review`, `review.delegate`, or candidate-scoped implementation in
   `apps`, `packages`, or `supabase`.
2. [`packages/auth/permissions.ts`](../../../packages/auth/permissions.ts)
   remains the MVP four-capability posture. Every staff subrole receives the
   same broad set; this is not the Phase 12 substrate D25 needs.
3. [`apps/admin/src/cms/public/resolve-tenant.ts`](../../../apps/admin/src/cms/public/resolve-tenant.ts)
   still returns `siteId: null` at the reserved Site seam. The stable Site scope
   D25 must bind is not implemented.
4. Existing email, task, contribution approval, and Eve review code are not safe
   D25 precedents merely because they exist. None proves the combined exact
   Site/source/candidate/participant/external-human boundary.

### Architecture decision consequence

D25 qualifies for a cross-source ADR. The now-accepted
[ADR-0181](../../adr/0181-source-authorized-candidate-scoped-external-review.md)
records the boundary. D25 introduces a surprising and hard-to-reverse fifth
Phase 12 Tenant Authorization Context, splits Phase 4's
authority-free invitation from the source/Phase 12 Candidate Review Grant, and
coordinates Page, Navigation, publication, and Site sources through one
constrained nonmember surface. Updating only a Phase 24 PRD or copying the Phase
17 row would hide the security boundary. ADR-0181 correctly records:

- why the existing four authorization contexts are insufficient;
- Phase 4 invitation versus Phase 12 grant/context ownership;
- exactly one current external invitation or accepted review grant per candidate;
- saved contacts as non-authoritative references;
- source opt-in and safe-bundle requirements;
- no standing Tenant/CMS membership or operator/service reuse;
- final source command/CAS and audit ownership; and
- the rejected temporary-member and generic guest-role alternatives.

### Repository conflict that must be resolved explicitly

The accepted Phase 17 source says **one** delegated reviewer and a synthetic-only
projection. D25 cannot silently reinterpret that as:

- unlimited simultaneous reviewers;
- a permanent external reviewer role;
- actual operational or recipient data;
- a generic Site-wide guest;
- a delegation reusable across successor candidates; or
- a platform email fallback that Phase 17 has not authorized.

D25 may define a reusable framework, but each source remains authoritative for
whether it opts in, what safe evidence it exposes, and what exact decision is
available. The Phase 17 one-reviewer contract remains the permanent D25
cardinality: exactly one current external invitation or one accepted Candidate
Review Grant per exact candidate. D22's internal maximum of three is an
attention-route decision and SHALL NOT be imported into D25.

## Current external primary-source findings

### Separation, least privilege, identity, and transaction binding

1. NIST SP 800-53 AC-5 requires identifying and documenting duties that need
   separation; AC-6 requires least privilege. It does not say every action must
   always have two people. This supports D23's proportional source-owned rule and
   D25's narrow recovery rather than a universal approval layer.
   [NIST SP 800-53 Rev. 5.1](https://csrc.nist.gov/CSRC/media/Projects/risk-management/800-53%20Downloads/800-53r5/SP_800-53_v5_1-derived-OSCAL.pdf)
2. NIST SP 800-63A says identity resolution should collect the minimum attributes
   needed to distinguish a unique identity and that proofing strength must be
   proportionate. D25 should not demand government identity evidence for every
   ordinary protected-content review, but it must define and prove the identity
   assurance appropriate to each source.
   [NIST SP 800-63A](https://pages.nist.gov/800-63-4/sp800-63a.html)
3. NIST SP 800-63B explains that OTP/manual codes are not phishing-resistant,
   while nonces/challenges provide replay resistance. A review email or OTP may
   help authenticate, but it is not sufficient evidence of an independent final
   decision by itself.
   [NIST authenticator guidance](https://pages.nist.gov/800-63-4/sp800-63b/authenticators/)
4. RFC 7643 distinguishes a service-provider stable `id` from client-controlled
   `externalId` and user-facing names. D25 should key independence to Core's
   stable human identity, never email, display name, account alias, or a Tenant's
   contact label.
   [RFC 7643](https://www.rfc-editor.org/rfc/rfc7643.html)
5. OWASP requires authorization enforcement and final transaction checks on the
   server, server-generated transaction verification data, limited validity,
   operation-unique credentials, and a final gate that prevents TOCTOU. This
   supports exact candidate/action binding and final reproof rather than a
   reusable bearer approval link.
   [OWASP Transaction Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html)
6. OWASP's reset-token guidance requires cryptographically random, sufficiently
   long, securely stored, single-use, expiring, user-linked tokens; HTTPS,
   trusted origins, referrer protection, and rate limiting are also required.
   Although a review invitation is not password reset, its bearer-link mechanics
   face the same replay, enumeration, and leakage classes.
   [OWASP Forgot Password](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)

**Product conclusion:** the invitation locator should carry no decision
authority. It opens a generic Core authentication path. Only the server-bound
authenticated stable human, current Candidate Review Grant/context, current
step-up, and exact
source command can decide.

### Time-bounded external access lifecycle

1. Microsoft Entra entitlement management can onboard external identities,
   require approval, expire assignments, remove rights on expiration, and later
   block or remove an external guest after its last assignment ends. Microsoft
   also notes direct invitation is manageable for small short-term work but
   becomes harder when participants change.
   [Microsoft external-user governance](https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-external-users)
2. Microsoft access packages can expire after hours, days, or on a date and can
   permit governed extensions. Those are standing resource packages and guest
   identities, not a reason for D25 to copy broad access; they do prove that
   expiry, extension, and removal are separate lifecycle operations.
   [Microsoft access-package lifecycle](https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-access-package-create)
3. Slack guests can be limited to selected channels and automatically
   deactivated after a period, but they remain workspace accounts with channel
   visibility. This is broader than one Core candidate and is a negative
   comparison for a permanent external-review role.
   [Slack guest roles](https://slack.com/help/articles/202518103-Understand-guest-roles-in-Slack%26)
4. GitHub outside collaborators receive repository roles from Read through
   Admin. GitHub recommends selecting the least access that fits the function,
   but even Read is repository-level standing access rather than one-candidate
   authority.
   [GitHub repository roles](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/repository-roles-for-an-organization)

**Product conclusion:** Core should retain a stable account/contact for reuse but
instantiate authority only as an expiring exact Candidate Review Grant. Identity
reuse is good UX; access-package reuse is not.

### Document-specific action patterns

1. Google Drive approvals can require all approvers to review the same content;
   edits then reset approvals. This supports candidate immutability and review
   staleness after source change.
   [Google Drive approvals](https://support.google.com/drive/answer/9387535)
2. Dropbox Sign supports editing pending requests, changing expiration,
   resending, adding/removing signers, and recording the changes in an audit
   trail. A resend can require prior signers to sign again when content changes.
   This demonstrates that resend, recipient replacement, content succession,
   expiry, and audit are distinct user-visible operations.
   [Dropbox Sign pending requests](https://help.dropbox.com/view-edit/edit-pending-dropbox-sign-signature-requests)
3. Dropbox Sign supports signer-specific authentication, including SMS or an
   access code. This is evidence that recipient authentication can be scoped to
   one request; Core should still follow its stronger stable-human and current
   step-up contract rather than copy a sender-chosen shared secret.
   [Dropbox Sign signer authentication](https://help.dropbox.com/security/dropbox-sign-signer-authentication)
4. Box approval tasks can use one or multiple approvers, but every approver must
   already be a collaborator in the containing folder. This is a clear example
   of the standing-access friction D25 is designed to avoid.
   [Box approval tasks](https://support.box.com/hc/en-us/articles/360043695954-Adding-Comments-and-Tasks)

**Product conclusion:** exact-artifact invitations, expiration, resend,
replacement, and immutable audit are proven patterns. Core must not copy
document-platform assumptions that every reviewer already has broad container
access.

### CMS collaboration patterns

1. Contentful workflow permissions complement space-level permissions, and an
   explicit space-level deny wins over a workflow allow. This supports D25's
   rule that invitation can never override a source or Phase 12 floor.
   [Contentful workflow permissions](https://www.contentful.com/help/ai-automations/workflows/workflows-steps-management/)
2. Contentstack can prevent the person who moved an entry into a stage from
   advancing it, but owners, admins, and workflow superusers can bypass editing
   restrictions. D25 should copy the separation intent, not its broad superuser
   escape hatch.
   [Contentstack workflows](https://www.contentstack.com/docs/headless-cms/add-workflows-and-stages)
3. Contentful environment access is still role/environment access and can expose
   environment names even when content access is restricted. This reinforces
   D25's need for a purpose-built projection rather than a temporary CMS role.
   [Contentful environment access](https://www.contentful.com/developers/docs/tutorials/general/managing-access-to-environments/)

**Product conclusion:** source denial must win; administrator status must not
override independence; and a safe review projection is better than temporary
CMS membership.

### Nonprofit CRM and general CRM comparisons

1. Blackbaud Financial Aid Management exposes invitation states such as
   Registered and Awaiting Response, requires unique user email, lets staff
   resend an expired invitation, and lets administrators inactivate the user.
   It also assigns a standing access role when the user is added.
   [Blackbaud Manage Users](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/financial-aid/content/sa-manage-users.html)
2. Blackbaud Financial Edge NXT centralizes organization users and assigns roles
   that couple tasks and permissions. This is suitable for staff but is broader
   than a one-candidate external review.
   [Blackbaud user migration and roles](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/fe/content/sec-pui.html)
3. Salesforce delegated approvers are existing users with separate permission
   to approve and can receive requests during a configured start/end period.
   That is a useful time-bound delegation pattern, but it still depends on a
   standing internal user and object permissions.
   [Salesforce delegated approvers](https://help.salesforce.com/s/articleView?id=sales.cpq_aa_delegate_approvers_task.htm&language=en_US)
4. Salesforce Classic approval steps can let a delegate approve, but delegated
   approvers are internal Salesforce users and cannot reassign. This supports
   non-transitive decision scope while showing why a Core external reviewer
   needs a smaller purpose-built surface.
   [Salesforce assigned approvers](https://help.salesforce.com/s/articleView?id=platform.approvals_step_approver.htm&language=en_US&type=5)

**Evidence limit:** these nonprofit/CRM products demonstrate invitation status,
resend, inactivation, time-bounded delegation, and permission separation. They
do not prove that Core's exact external-candidate design is universally required
or that the products safely support it today.

### Accessibility and low-friction authentication

1. WCAG 2.2 Accessible Authentication says authentication should not require a
   cognitive-function test unless an alternative or assistance mechanism is
   available; password-manager support, paste, WebAuthn, OAuth, and device
   confirmation are examples.
   [W3C Accessible Authentication](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html)
2. WCAG status-message guidance requires important asynchronous changes to be
   programmatically exposed without unnecessarily moving focus.
   [W3C Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages)
3. WCAG error-identification guidance requires a detected input error to be
   identified and described in text. A generic red border or icon is not enough
   for an invalid reviewer address, expired invitation, or identity mismatch.
   [W3C Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification)

**Product conclusion:** external review must work with password managers,
paste, passkeys/federation where available, keyboard, mobile, zoom, screen
readers, RTL, long names, and weak networks. Security cannot be implemented as a
memory puzzle or inaccessible OTP transcription flow.

## Evidence limits and unresolved unknowns

1. No primary source proves an optimal invitation expiry for nonprofit Website
   review. Phase 4/source owners must register exact code-owned default and
   maximum lifetimes before Live; the existing seven-day legacy account
   invitation is evidence of one separate contract, not an automatic D25 value.
2. No representative ministry study has established how often a solo ministry
   has a qualified board member, consultant, denominational reviewer, or partner
   willing to use Core.
3. No user study has yet validated the proposed **Saved reviewer contacts**,
   **Send invitation**, **Send again**, **Change reviewer**, and reviewer landing
   language.
4. Only protected Phase 17 System Messages are currently proved to support an
   external delegated reviewer. Page, Navigation, Site-default, safety, and
   other sources need explicit opt-in contracts and safe-bundle proofs; D25 must
   not infer them.
5. The repository does not authorize a generic platform email fallback for
   arbitrary Tenant external reviewers. Phase 17/6 must provide the separately
   Live, branded, recipient-authorized invitation contract; otherwise D25 stays
   unavailable and the current Site remains unchanged.
6. The final Phase 12 stable-human model, capability atoms, assurance levels,
   and identity-merge behavior are specified direction but not current runtime.
7. Current Site scope remains unimplemented. D25 cannot be Live before the exact
   Tenant/environment/Site resolver is authoritative.
8. D26 does not reopen cardinality. It now closes the one-at-a-time external
   path's three-state, narrow-only Tenant/Site availability posture. D27 now
   closes one source-owned responsibility lane with deliberate takeover; D28
   next decides decline/expiry recovery.

## Primary-research requirements feeding the corrected D25 contract

### D25-PR1 — external review is source opt-in, never generic fallback

For an exact candidate, every applicable still-unsatisfied source that returned
**different human required** must provide a versioned external-review contract
with:

- `external_review_permitted` or equivalent closed result;
- source/action/candidate/review-epoch applicability;
- allowed reviewer-assurance class;
- complete safe-bundle schema/version;
- allowed decision meanings and public consequence;
- source maximum Candidate Review Grant lifetime and any internal-officer
  restriction;
- participant/conflict adapter;
- staleness and invalidation rules; and
- test and audit contract identifiers.

In D25's recovery posture, the complete current resolver must also prove **zero
eligible internal reviewers**. Partial, stale, timed-out, incompatible, failed,
or unknown evidence is not zero and never releases an external invitation. D26
now closes when a Tenant may make the path available while an eligible internal
reviewer exists.

Missing, contradictory, unsupported, or mixed-generation proof returns
**indeterminate**. External review is omitted and the current Live state remains.
One permissive source cannot overrule another applicable source that is
internal-only or cannot project safely.

### D25-PR2 — saved reviewer identity is not saved authority

A Tenant may keep reusable **Saved reviewer contacts** after the person has
completed trusted identity verification. Each row is a stable reference to
CRM/Party identity and one purpose-specific contact-point revision; a
staff-entered address alone never creates the saved contact. The row does not
copy or become identity truth. It may retain only a derived display cache,
verification state, inactive/revoked facts, and safe prior-use summary needed
for this picker.

The saved contact:

- grants no Tenant membership, role, route position, Site access, source read,
  review action, or notification;
- is never auto-selected or auto-invited;
- is never copied during Tenant/Site clone, import, transfer, or environment
  promotion;
- never becomes globally searchable by another Tenant;
- cannot carry prior candidate authority forward; and
- may be removed from future pickers without deleting immutable completed-review
  evidence.

Staff may always use **Add a new reviewer** when authorized. They are not forced
to preconfigure a directory or ask a platform operator.

### D25-PR3 — eligibility is calculated, not asserted

The picker is populated from Tenant-local contacts and exact internal choices,
never a global people search. The server evaluates each candidate against:

- current source opt-in;
- D24 complete participant set;
- stable-human identity aliases/merges;
- exact candidate and dependency graph;
- source-required relationship or qualification evidence;
- current Tenant/environment/Site restrictions;
- active invitation conflicts and abuse controls; and
- permission-safe disclosure policy.

The UI may show **Available for this review**, **Already helped prepare this
version**, **Needs updated contact information**, or **This review must stay
internal** only where the viewer may know that fact. It never reveals another
Tenant's relationship, account existence, role, participant roster, or denial
reason.

### D25-PR4 — Phase 4 invitation is authority-free

Phase 4 owns invitation purpose, invited contact/Party binding, issuance,
delivery handoff, credential lifecycle, expiry, resend/replacement/revocation,
redemption, stable-account binding, privacy-safe recovery, and invitation audit.

Issuing, delivering, opening, accepting, or redeeming an invitation grants no
Tenant membership, Candidate Review Authorization Context, source access, safe-
bundle access, or review power. Phase 4 returns only trusted identity/invitation
proof to the Phase 12 resolver. It never decides D23/D24 eligibility or creates a
source review receipt.

### D25-PR5 — one Candidate Review Grant binds one immutable business effect

Each Candidate Review Grant binds at least:

- Tenant and environment;
- Site when applicable;
- exact source owner, source action, and source contract/version;
- candidate id, head, complete dependency digest, review epoch, and floor;
- D24 participant-set proof/digest and stable invitee human;
- safe review-bundle identity/hash/schema and source evidence versions;
- exact permitted outcomes and consequence copy version;
- inviter/authorizer and their authority evidence at creation;
- current grant/governance/authorization epochs;
- issued, expiry, revocation, replacement, supersession, and completion facts;
- semantic idempotency key; and
- immutable audit/provenance references.

There is exactly **one current external invitation or one accepted Candidate
Review Grant per exact candidate**. Verified invitation acceptance closes the
pending invitation state as it creates the accepted grant/context through one
local CAS. A second reviewer choice must replace and revoke the first; it never
joins it. D22's one-to-three internal attention route does not change this
cardinality.

The grant can never be widened or retargeted in place. A new reviewer, candidate,
source, Site, locale, action, dependency, effect, or broader evidence set
requires a successor grant.

### D25-PR6 — explicit Candidate Review Authorization Context

Phase 12 SHALL add one closed membership-free **Candidate Review Authorization
Context** to its existing Tenant Authorization Context union. It is produced
only by the sole server-side PDP from:

- a currently active exact Candidate Review Grant;
- Phase 4's current invitation/account/stable-human binding;
- current D23/D24 source and independence proof;
- the exact minimum safe bundle and action;
- current step-up, expiry, revocation, and governance/authorization epochs; and
- one Tenant/environment/Site/source/candidate scope.

The context token exposes only the exact candidate read/decision capability and
expires no later than the grant. It is not an Active Tenant Assignment, Public
Projection Context, Service Tenant Context, or Operator Tenant Grant Context. It
cannot enumerate Tenant resources, resolve ordinary navigation, enqueue a broad
Tenant mutation, or be converted into membership. Every egress door verifies
its exact variant and scope.

### D25-PR7 — email, name, account, and link are not the human

The invitation starts with a contact point but decision eligibility uses the
final Phase 12 stable human identity.

- A display name or email match never proves independence.
- One human using multiple emails/accounts remains one participant.
- A shared mailbox, service identity, AI, automation, support session,
  impersonation, or **View as** cannot review.
- First redemption binds the invitation to one authenticated stable human only
  after exact contact and invitation proof.
- Identity ambiguity, merge conflict, relink, or participant collision blocks.
- A forwarded link does not transfer the invitation or Candidate Review Grant.
- The reviewer performs current step-up immediately before the final decision.

The invitation URL is an opaque non-authorizing locator. Before authentication,
invalid, expired, revoked, wrong-person, wrong-Tenant, and nonexistent states use
one privacy-safe response. The link never performs GET-side mutation or review.

### D25-PR8 — each source owns the minimum safe review bundle

D25 composes references; it does not copy editable Page, Navigation,
publication, identity, policy, or money truth.

A source bundle may include only what is necessary to make the exact decision:

- exact candidate title/scope and plain-language consequence;
- safe before/after or current/proposed presentation;
- the real tenant-authored candidate content when that content is intended to
  become public and the source explicitly permits it;
- synthetic fixtures instead of real donor, missionary, staff, recipient,
  payment, credential, restricted, care, or location facts;
- dependency and accessibility impact;
- safe closed reasons and validation results;
- what remains Live while waiting; and
- exactly what the final button will do.

The bundle excludes unrelated records, participant rosters, comments not needed
for decision, raw identifiers, provider secrets, real-recipient data, private
missionary/care/location facts, Giving operations, Stripe, bank, settlement,
ledger, accounting, and financial transactions. A protected System Message may
show source-authorized synthetic official wording; that is not financial-system
authority.

No source bundle, no Candidate Review Grant. A generic full CMS preview is not a
fallback.

### D25-PR9 — exact reviewer powers and no more

When the source allows them, the reviewer may:

- authenticate and open the exact current bundle;
- compare, preview, and inspect source-provided evidence;
- approve through the exact source command;
- request changes;
- decline;
- report that they are the wrong person; and
- return to the same invitation while it remains current.

The reviewer may not edit source content, change dependencies, alter the Site or
locale, manage routes/contacts/invitations, invite or re-delegate, download a
product export, bulk copy other candidates, browse Tenant navigation, enumerate
people, change permissions, or access unrelated evidence.

Core cannot prevent an authorized human from taking a photograph or using an
operating-system screenshot. It must not claim otherwise. It can and must omit
product export/print actions, use private no-store responses, suppress analytics
and third-party content, minimize the bundle, and audit access without retaining
the content in technical logs.

### D25-PR10 — source semantics control the public effect

D25 creates no new publish or activation command.

- For zero-public D20 review, the delegated decision remains zero-public.
- If the governing source's exact protected command atomically reviews and
  publishes or makes the Site locale default, the external reviewer may invoke
  only that exact combined command when the Candidate Review Grant explicitly
  includes it.
- The confirmation must state the public consequence immediately beside the
  action.
- Structural, accessibility, safety, privacy, domain, locale, and authorization
  failures are never reviewable waivers.
- Giving intent, Giving URLs, Legal Entity, Stripe account, settlement, bank,
  currency, contribution, receipt, statement, ledger, and accounting identity
  remain outside D25.

### D25-PR11 — staff can resend, cancel, revoke, replace, and re-invite

For an unchanged exact candidate and still-authorized source:

- **Resend invitation** creates a new delivery attempt or authentication proof,
  invalidates older unredeemed bearer material, and preserves one invitation/
  grant.
- **Cancel invitation** or **Revoke access** immediately ends authorization on
  the server even if a cancellation email or worker fails.
- **Change reviewer** atomically revokes the selected active invitation/grant
  before releasing a successor to a different stable human.
- **Invite again for this version** reuses safe contact fields but creates fresh
  candidate-bound authority.
- **Invite for the updated version** appears after a material successor and
  requires a fresh bundle, participant proof, consequence review, and explicit
  confirmation.

No recurring reminder, automatic escalation, or email is sent by default.
Manual resend is deliberate and rate-limited. Delivery activity never extends
authority.

### D25-PR12 — bounded expiry without a rigid staff ceremony

Phase 4 and each source SHALL register exact code-owned default and maximum
invitation/grant lifetimes in the implementation manifest before Live. The
strictest maximum wins. Tenant policy or authorized staff may shorten the
offered lifetime but never lengthen it past the source/platform maximum. D25
does not import Phase 4's separate seven-day legacy invitation value by
assumption.

The UI displays one absolute localized date, time, and time zone before send.
Expiry uses authoritative server time. Viewing, acceptance, or **Send again**
never extends it. After expiry, staff issue a fresh invitation. Expiration does
not require a worker to remove authority; cleanup workers only reconcile derived
presentation. A shortened expiry is append-only evidence, not a mutable
timestamp that rewrites history.

### D25-PR13 — candidate, source, participant, and policy changes stale safely

A material edit, changed dependency, new participant, identity merge, source
contract/evaluator change, stricter policy, permission/governance epoch change,
candidate/head conflict, bundle mismatch, Site retirement/transfer, Tenant
suspension, or failed validation ends or pauses the invitation before access or
decision according to the stricter source rule.

The current website stays unchanged. Core may prefill **Invite [name] to review
the updated version**, but it never carries forward approval or grant
silently.

### D25-PR14 — no key-person coupling, but governance changes require proof

The immutable audit retains who authorized the invitation. The invitation is a
Tenant/source decision, not the inviter's personal possession. An unrelated
browser logout does not revoke it.

If an authority or governance epoch change could invalidate the grant, the
invitation becomes **Needs confirmation**. Any currently authorized manager can
review the unchanged scope and reissue it in one deliberate action. Core never
silently preserves authority across an unknown governance change and never
requires the original inviter to return merely to cancel or replace it.

### D25-PR15 — invitation save and delivery are separate truths

Creating the authority-free Phase 4 invitation plus its durable delivery outbox
is one short authoritative transaction. Provider delivery occurs afterward.
Verified invitation acceptance closes the pending invitation and creates the
accepted Candidate Review Grant/context through one local CAS after every
current proof passes.

- **Invitation ready to share** means authority exists but no delivery success
  is claimed.
- **Invitation queued** means a delivery intent exists.
- **Invitation sent** means the authorized provider accepted the exact delivery,
  not that the person received or read it.
- **Delivery not confirmed** means provider outcome is ambiguous; Core
  reconciles the same semantic attempt rather than creating duplicate authority.
- **Invitation opened** is not a staff-facing tracking claim; email pixels and
  link-prefetch do not mark human engagement.
- **Reviewer signed in** is identity evidence, not review.

If the required Phase 17/6 invitation contract or Tenant delivery connection is
not Live, external review remains unavailable. Core explains the exact delivery
repair while preserving the current Site; it never uses a generic platform
sender, manual bearer-link fallback, or another Tenant's connection.

### D25-PR16 — one compare-and-swap winner

The final review command re-proves in one short transaction:

- Tenant, environment, Site, source, action, candidate, review epoch, expected
  heads, complete dependencies, and bundle hash;
- source opt-in, floor, validation, participant proof, and current policy;
- invitee stable human, independence, active Candidate Review Grant and
  Authorization Context, expiry, revocation,
  source assurance, and step-up;
- current exact source capability/authority supplied by the Candidate Review
  Authorization Context and grant contract;
- governance and authorization epochs; and
- semantic idempotency identity.

One valid internal or external actor wins. A concurrent loser sees **Review
already completed**. An exact retry returns the committed receipt. Reuse with a
different actor, candidate, action, or meaning rejects. No external network call
occurs inside the transaction.

### D25-PR17 — tenant-safe storage and authorization

The later database design must provide:

- same-Tenant/environment/Site/source/candidate structural relationships;
- append-only Phase 4 invitation and Candidate Review Grant versions/events;
- normalized contact points and stable-human references, not mutable JSON
  identity arrays;
- unique semantic invitation and review identities;
- server-time expiry and explicit terminal-state constraints;
- immutable participant and safe-bundle evidence references;
- restrictive delete behavior with pseudonymous audit preservation;
- indexes for candidate/current state, invitee/current state/expiry, contact
  lookup, idempotency, and outbox reconciliation; and
- no direct browser writes to authoritative grant, identity, participant,
  review, or audit rows.

Every RLS policy must cover both `USING` and `WITH CHECK`. External reviewers
must not receive general table `SELECT`; purpose-built server RPCs return only
the exact safe bundle after current checks. Explicit grants remain revoked for
browser roles. Security-definer functions use fixed safe `search_path` and
fully qualified objects. Service-role, `BYPASSRLS`, background worker, Payload,
import, migration, support, and repair paths reapply the same Tenant/source/
candidate/identity checks.

### D25-PR18 — privacy-safe audit and retention

Durable business history records invitation creation, send-again/revoke/
replace/supersede, fresh post-expiry invitation, identity binding, bundle
version/hash, safe access, decision,
actor, time, source effect, and idempotency outcome. Technical logs remain
body-free and omit raw invitation URLs, tokens, email bodies, candidate content,
names where not needed, participant rosters, protected reasons, and source data.

Contact points use purpose-limited retention. Removing a contact stops future
selection; completed review evidence keeps a pseudonymous stable-human reference
for historical integrity. Tenant export, retention, erasure, support, backups,
and incident response must distinguish reusable contact data from immutable
business evidence.

### D25-PR19 — abuse resistance cannot become staff punishment

Core rate-limits invitation creation, resend, authentication attempts, wrong-
identity claims, and many-target patterns by actor, Tenant, candidate, contact,
network risk, and global service posture. Exact numeric execution limits live in
the versioned implementation manifest and are not shown to attackers.

A temporary delivery or rate limit preserves the saved invitation and tells
authorized staff when they may retry. It never locks the reviewer permanently,
widens the audience, reveals account existence, or asks support to edit the
database.

### D25-PR20 — no approval platform, guest portal, or financial coupling

D25 is one narrow adapter over Phase 12 identity/authorization and source-owned
review commands. It creates no generic approval workflow, Tenant-authored rules,
quorum DSL, standing guest portal, external route, task engine, calendar,
recurring reminder, comments product, CMS membership, provider fallback, or
support bypass.

It cannot own or select Legal Entity, Stripe account, settlement, bank,
accounting, or Giving identity. A Tenant's Stripe account and financial systems
are irrelevant to reviewer eligibility.

## Plain-language staff and reviewer experience

### Hope Ministries example

Maria is Hope's only Website staff member. She changes protected French-Canadian
Navigation. D24 correctly says Maria cannot independently review work she helped
prepare. Hope's current English Site remains Live.

Maria opens **Site → Languages → French (Canada)** and sees:

> **Another reviewer is needed**
>
> Everyone in Hope Ministries who can currently complete this review helped
> prepare this version. Invite a separate reviewer for only this version. They
> will not join your organization or see other work. Your current website stays
> live until this review succeeds.
>
> **[Invite a reviewer]** &nbsp; [Keep the current website]

### Staff journey 1 — choose without setup ceremony

The picker shows Tenant-local choices:

> **Choose an independent reviewer**
>
> They can review only **French (Canada) — make default**. Access ends after the
> review, cancellation, replacement, or **4 September 2026, 3:00 PM ICT**,
> whichever happens first.
>
> Reviewer contacts  
> ○ Grace Lee — Available for this review  
> ○ Samuel Ortiz — Needs updated email address  
> ○ Ana Martin — Helped prepare this version
>
> **[Add a new reviewer]**

The screen does not show a global user directory or expose private reasons to a
viewer who lacks permission. Selecting Grace reveals one concise scope summary:

> **Grace will be able to**
>
> - view this exact French-Canadian before/after review;
> - inspect the protected reason and accessibility checks; and
> - complete the review, request changes, decline, or report that the request is
>   not for them.
>
> Grace will **not** join Hope Ministries, edit the Site, see unrelated content,
> export data, or access Giving or finance.
>
> Expires: **4 September 2026, 3:00 PM ICT** [Change]
>
> **[Send invitation]** &nbsp; [Cancel]

If no Core-sent delivery contract is available, external review is unavailable
with a plain, source-owned delivery repair explanation. Core does not show a
mysterious disabled button or unsafe sharing fallback.

### Staff journey 2 — manage one waiting invitation

> **Waiting for Grace Lee**
>
> Review: French (Canada) — make default  
> Access: this version only  
> Expires: 4 September 2026, 3:00 PM ICT  
> Website: the current English version is still live
>
> [Send again] [Change reviewer] [Cancel invitation]

**Resend invitation** confirms the address and says the prior sign-in proof will
stop working. It never creates another approval request. **Change reviewer**
shows the replacement before revoking Grace and preserves an explicit cancel
path.

### Reviewer journey

Before authentication, the landing reveals no Tenant or candidate details:

> **Sign in to view this review request**
>
> Core will show the organization, exact version, access expiry, and requested
> action after confirming that this invitation belongs to you.

After identity and current scope proof:

> **Hope Ministries asked you to review one website change**
>
> French (Canada) is planned to become the default language for hope.org. The
> current English website remains live until an authorized review succeeds.
>
> Your access is limited to this version and ends on 4 September 2026 at 3:00 PM
> ICT. You cannot edit it or view other Hope Ministries information.
>
> **[Review this version]** &nbsp; [Decline] &nbsp; [This request is not for me]

The review page presents one ordered mobile-friendly view:

1. **What will change**;
2. **What stays live while waiting**;
3. **Before and after**;
4. **Protected reasons and checks**;
5. **Affected Site, language, paths, and safe dependencies**;
6. **What approval will do**; and
7. source-allowed **Request changes**, **Complete review**, **Decline**, and
   **This request is not for me**.

For a final Site-default action:

> **Make French (Canada) the default for hope.org?**
>
> This publishes no draft content and changes no Giving URL. Existing explicit
> `/lang/en-us/...` paths remain unchanged. If current safety checks changed,
> nothing will be published.
>
> **[Approve and make default]** &nbsp; [Request changes] &nbsp; [Cancel]

### Changed, expired, or revoked states

Material successor:

> **This version changed after you were invited**
>
> Your previous invitation cannot review the updated version. Hope Ministries
> can invite you again after the new version is ready. The current website is
> unchanged.

Expired:

> **This review invitation expired**
>
> No change was made. Ask Hope Ministries to send a fresh invitation if this
> exact review is still needed.

Revoked/replaced/wrong identity before authentication:

> **This review link is not available**
>
> It may have expired, been replaced, or belong to a different signed-in
> account. Return to Core or contact the person who invited you.

Concurrent loser:

> **Review already completed**
>
> Another qualified reviewer completed this exact version first. No additional
> decision was recorded from you.

### Accessibility and resilience requirements

- Mission Control and reviewer surfaces reuse `@asym/ui`, Base Maia, Base UI,
  Zinc semantic tokens, and Core's existing design language.
- The reviewer page is a purpose-built narrow Core surface, not a second admin
  shell or CMS micro-frontend.
- Native labels, descriptions, errors, headings, landmark order, and visible
  focus are mandatory.
- Dynamic save/send/revoke/reconcile state uses one polite programmatic status
  region without moving focus or repeating announcements.
- Important targets remain at least Core's 44-by-44 CSS-pixel convention.
- At 320 CSS pixels and 400 percent zoom, the review becomes one logical column;
  before/after never requires horizontal scrolling to understand.
- Color, avatar, icon, flag, tooltip, hover, motion, or a disabled button is
  never the only carrier of status or eligibility.
- Long international names, CJK, combining marks, RTL with bidi isolation, long
  translations, forced colors, reduced motion, keyboard-only use, and screen
  readers preserve every decision and warning.
- Authentication supports password managers, paste, and accessible passkey/
  federation alternatives where the adopted provider supports them.
- No review decision is queued offline. The UI preserves non-authoritative local
  notes, reconnects, reloads current proof, and asks for a fresh deliberate
  confirmation.
- Weak-network or lost-response reconciliation uses the semantic command id and
  never invites, reviews, or publishes twice.

## Lifecycle model

D25 should not force delivery, identity, Phase 4 invitation, Candidate Review
Grant/context, and review into one mutable status enum. They are separate facts
with a derived staff presentation.

| Dimension              | States/evidence                                                                        | Authority meaning                                      |
| ---------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| contact                | new, verified contact, needs update, inactive, removed                                 | convenience only; never grants access                  |
| Phase 4 invitation     | prepared, issued, redeemed, expired, revoked, replaced, indeterminate                  | identity/contact handoff only; grants nothing          |
| Candidate Review Grant | prepared, active, expired, revoked, replaced, superseded, consumed                     | exact-candidate authority source                       |
| authorization context  | absent, current, expired, revoked, stale/indeterminate                                 | short-lived Phase 12 PDP output; never standing access |
| delivery               | not requested, queued, provider accepted, failed, indeterminate                        | evidence only; never review                            |
| identity               | unbound, authenticated, stable-human bound, mismatch, ambiguous/conflicted             | required but not sufficient                            |
| bundle                 | current, stale, unavailable, unsafe, generation conflict                               | current complete bundle required                       |
| reviewer action        | available, changes requested, declined/wrong person, favorable, stale/concurrent loser | source-owned business result                           |
| public effect          | none, prior Live preserved, exact source command committed                             | never inferred from invitation or email                |

### Valid transitions

1. Eligible choice → Candidate Review Grant prepared → authority-free Phase 4
   invitation/outbox released.
2. Pending/accepted → resend the same invitation without changing its authority
   or expiry.
3. Expired → fresh invitation after current reproof.
4. Pending/accepted → revoke/cancel → terminal invitation and grant loss.
5. Pending/accepted → replace → old invitation/grant revoked before new release.
6. Redeemed Phase 4 identity → accepted Candidate Review Grant + Phase 12
   Candidate Review
   Authorization Context → exact bundle read.
7. Active → request changes/decline/wrong-person → source-owned outcome and invitation
   closure according to source rules.
8. Active → favorable source CAS → consumed and immutable review receipt.
9. Any nonterminal state → candidate/source/policy/identity invalidation → stale,
   paused, or superseded; never favorable.
10. Any review winner → all competing invitations/actions become terminal or
    observe completed source truth.

### Forbidden transitions

- email accepted → reviewed;
- link opened → authenticated or read;
- authenticated → independent;
- contact saved → delegated;
- send-again retargeted → candidate, reviewer, scope, or expiry changed;
- replaced reviewer → old reviewer still active;
- expired/revoked → review accepted;
- participant account renamed → independent;
- administrator/support/service identity → bypass;
- source-safe bundle unavailable → full source access;
- one source permits → another source's denial ignored; or
- review receipt → editable, deleted, or reassigned.

## Source of truth and ownership

| Fact                                   | Authoritative owner                                                        | D25 may retain                                              | D25 must never own                               |
| -------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------ |
| source content and candidate           | Page, Navigation, publication, or exact source                             | immutable reference, digest, safe bundle ref                | editable source copy                             |
| whether external review is allowed     | exact consequence/source contract                                          | opt-in result/version/reason                                | generic override                                 |
| protected floor/applicability          | D23 and exact source                                                       | exact evaluation reference                                  | risk classification                              |
| substantive participants               | D24 and accepted mutation sources                                          | proof/digest and stable-human refs                          | caller-authored list                             |
| invitation/contact redemption          | Phase 4 identity/invitation owner                                          | current proof reference                                     | review authority/outcome                         |
| stable human and aliases               | Phase 12 identity owner                                                    | canonical reference/proof epoch                             | email/name identity                              |
| reusable reviewer contact              | Tenant D25 contact owner                                                   | stable reference plus minimum presentation/contact revision | copied identity/membership/authority             |
| current Candidate Review Grant         | D25 source-grant aggregate through Phase 12                                | immutable versions/current head                             | source content or route                          |
| Candidate Review Authorization Context | Phase 12 sole PDP                                                          | short-lived exact token/evidence                            | membership, public, service, or operator context |
| safe review bundle                     | exact source adapter                                                       | immutable bundle ref/hash                                   | generic unrestricted preview                     |
| current action authorization           | Phase 12 Candidate Review Authorization Context plus exact source contract | result/evidence refs                                        | cached permission                                |
| review outcome/public effect           | source-owned review/activation command                                     | immutable receipt ref                                       | notification/delivery inference                  |
| invitation delivery                    | Phase 17/authorized delivery owner                                         | body-free provider evidence                                 | inbox receipt/read truth                         |
| item/read engagement                   | ADR-0027 presentation owner                                                | occurrence link                                             | review completion                                |
| Giving/finance truth                   | Giving and finance owners                                                  | nothing                                                     | any D25 field or inference                       |

## Domain invariants

1. A saved contact has zero action authority.
2. Every Candidate Review Grant is for one exact stable human and immutable
   business effect.
3. One exact candidate has at most one current external reviewer state: either
   one pending Phase 4 invitation or one accepted Candidate Review Grant, never
   both as independent concurrent authority.
4. Every applicable different-human source opts in or external review blocks.
5. The strictest source, policy, privacy, assurance, and lifetime cap wins.
6. The reviewer is absent from the complete D24 participant set at final commit.
7. Email, account, role, contact, link, route, notification, and read state never
   substitute for stable-human independence.
8. Review evidence never transfers to a successor candidate.
9. Resend never creates a second invitation/grant or extends expiry.
10. Replace, fresh post-expiry invitation, and successor re-invite are
    attributable append-only actions.
11. Revocation and expiry are enforced synchronously at read and decision; no
    worker is required for safety.
12. One source-owned CAS winner creates one review receipt and exact effect.
13. Public effect occurs only through the exact source command the reviewer was
    shown and confirmed.
14. The prior Live website remains active on every blocked, stale, failed,
    ambiguous, expired, revoked, or concurrent-loser path.
15. External review grants no standing Tenant/CMS membership or unrelated read.
16. No administrator, platform operator, support actor, service key, AI, timeout,
    reminder, or link possession bypasses D23/D24.
17. D25 owns no Giving or financial identity/effect.
18. Cross-Tenant identity reuse never reveals another Tenant relationship.
19. Completed audit survives contact removal or reviewer offboarding without
    retaining unnecessary reusable PII.
20. Source opt-in, safe bundle, and decision action are versioned together.
21. Unknown is never zero, safe, equivalent, delivered, or authorized.

## Conceptual database, RLS, and authorization implications

Exact physical names remain design work. A later model likely needs four
separate concepts rather than one overloaded invitation row:

1. Tenant-owned reviewer contacts/contact-point revisions containing stable
   references, not copied identity truth;
2. Phase 4 authority-free invitation/redemption versions and events;
3. append-only exact Candidate Review Grant versions/events and one current head;
4. Phase 12 Candidate Review Authorization Context derivation evidence;
5. source-owned immutable safe-bundle/projection evidence; and
6. source-owned immutable review receipts plus body-free delivery/audit events.

### Structural safeguards

- UUID primary keys; server-derived stable-human ids.
- `tenant_id NOT NULL` on Tenant rows and composite same-Tenant references.
- explicit environment and Site scope; no nullable ambiguity where Site applies.
- closed source/action/state/reason enums generated from a manifest.
- unique active Phase 4 invitation and Candidate Review Grant per exact
  candidate, plus one unique review business-effect key;
- append-only events and immutable versions; mutable head only through CAS.
- normalized contact points and identity links; no caller-controlled editor or
  participant arrays.
- database checks for expiry ordering, terminal-state combinations, and scope
  discriminator consistency.
- restrictive delete for business evidence; contact inactivation/anonymization
  cannot cascade-delete receipts.
- indexes on `(tenant, environment, site, source, candidate, current_state)`,
  `(stable_human, current_state, expires_at)`, contact lookup, expiry sweeps,
  idempotency, and outbox state.

PostgreSQL cannot prove all sibling/source/participant conditions through row
`CHECK`s alone. One server-owned command locks in documented order, validates
the complete set, writes evidence and outbox atomically, and releases authority
only after every invariant holds. Direct child writes are revoked.

### RLS and RPC contract

- Internal staff RLS is coarse Tenant isolation; fine source authorization is
  server-side through the Phase 12 PDP.
- External reviewers receive no generic Tenant table grants. One purpose-built
  read RPC requires a current Candidate Review Authorization Context and returns
  only the source bundle for the bound active grant.
- `USING` and `WITH CHECK` prevent moving a permitted row to another Tenant,
  Site, candidate, invitee, state, or scope.
- Tokens, invited identity, actor, authorizer, Tenant, Site, source, candidate,
  and audit attribution are derived server-side, never accepted as authoritative
  caller fields.
- Security-definer RPCs pin `search_path`, qualify objects, validate caller
  identity, and expose only typed safe DTOs.
- Service-role and `BYPASSRLS` paths call the same resolver and cannot accept a
  client-supplied Tenant selector.
- Storage policies bind any source-owned review artifact to the exact active
  Candidate Review Grant and prohibit public URLs, predictable keys, or cross-
  Tenant reads.
- Preview/read responses are private, `no-store`, non-prefetched, and free of
  third-party analytics/resources.

### Transaction and lock order

Recommended deterministic order:

1. Tenant/environment/Site/source candidate head;
2. source floor/participant/bundle evidence;
3. Phase 4 invitation current head;
4. Candidate Review Grant current head;
5. stable-human/current authority and governance epochs;
6. review receipt/public-effect head; and
7. durable outbox/audit.

No provider, email, identity-service, CMS, or network call occurs while these
locks are held. External effects use durable outbox/reconciliation.

## Tricky edge cases and permanent behavior

| Edge case                                     | Required permanent behavior                                                                                                                   |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| wrong email entered                           | staff can change reviewer; old invitation/grant revoked before successor; no account-existence disclosure                                     |
| reviewer uses another verified email          | bind only through current stable-human/contact proof; otherwise offer privacy-safe recovery, never guess                                      |
| shared mailbox                                | reject as independent human unless a later identity proof binds one distinct human without shared authority                                   |
| same person has two accounts                  | stable-human alias union preserves participant exclusion                                                                                      |
| reviewer later becomes a Tenant member        | no automatic widening; exact Candidate Review Grant/context remains the only authority unless current source separately authorizes membership |
| invitee later edits candidate                 | source mutation adds them to D24 participants and stales the invitation                                                                       |
| candidate changes while reviewer page is open | final CAS rejects; show changed-version state and no retry-as-approval                                                                        |
| dependency changes invisibly                  | digest/bundle mismatch stales before read/decision                                                                                            |
| reviewer requested changes                    | remains independent if they made no material source mutation; successor requires fresh invitation/bundle                                      |
| reviewer supplies a suggested edit            | suggestion alone is non-material; if accepted, D24 source rules attribute proposer and accepter where applicable and both become participants |
| reviewer declines or says it is not for them  | close that invitation honestly; staff can choose another without changing the source candidate                                                |
| invitation expires during review              | final server-time check rejects; staff may issue a fresh invitation after current proof                                                       |
| staff extends expiry during open session      | reviewer reloads current grant/context; extension does not change candidate or create approval                                                |
| resend races cancel                           | revocation wins authorization; late email/link remains unusable                                                                               |
| replacement delivery fails                    | old reviewer remains revoked; new invitation shows delivery failure and can be resent or replaced; no hidden rollback                         |
| provider accepted but response lost           | reconcile same delivery identity; never create a second invitation/grant                                                                      |
| mail scanner opens link                       | GET is inert; no auth, read, token consumption, or review is recorded                                                                         |
| link is forwarded                             | generic landing; only invited stable human can bind and step up                                                                               |
| reviewer account compromised                  | revoke identity/invitation/grant; active contexts lose bundle/decision access; preserve audit                                                 |
| identity merge after invitation               | recompute independence; strict union wins and may stale/block                                                                                 |
| participant identity merge after approval     | preserve completed historical evidence; incident/correction policy determines prospective safety, never rewrite actor history                 |
| internal reviewer becomes available           | internal and external actions use same source CAS; first valid actor wins; invitation may be canceled but grants no priority                  |
| staff selects a second external reviewer      | **Change reviewer** revokes the first invitation/grant before releasing the successor; no concurrent external set exists                      |
| applicable sources disagree                   | indeterminate; external option omitted; current Live state remains                                                                            |
| one source cannot project safely              | external option omitted; use internal reviewer or safe baseline, never full-source guest access                                               |
| source requires internal officer              | explain internal requirement; no external/admin exception                                                                                     |
| Site retires/transfers                        | revoke/stale exact Site invitation/grant before any projection; never transfer reviewer/contact implicitly                                    |
| Tenant suspended/deleted                      | deny immediately, preserve retention-governed audit, send no revealing external update unless separately authorized                           |
| contact removed while invitation active       | explicit UI distinguishes remove-from-directory from revoke-active-access; never surprise staff                                               |
| reviewer changes name/email                   | create attributed contact revision and re-verify; do not rewrite receipts or move authority silently                                          |
| same reviewer works with two Tenants          | each Tenant has separate contact and Candidate Review Grant; neither sees the other relationship                                              |
| optional staff note contains secrets          | v1 email remains code-owned and minimized; any future note needs separate classification, rendering, retention, and injection proof           |
| locale/time zone differs                      | show localized exact instant and source/Tenant zone; store an absolute timestamp; avoid relative-only expiry                                  |
| RTL/long name                                 | bidi-isolate identity text, wrap safely, retain action labels and no truncation-only distinction                                              |
| offline reviewer                              | read-only cached content is not review authority; final action requires online current proof                                                  |
| source service temporarily down               | show bundle unavailable and preserve Live version; do not reuse stale bundle or broaden access                                                |
| service role tries direct insert              | grants/RPC tests reject or require exact server command and full reproof                                                                      |
| database restoration replays active row       | current heads, expiry, revocation ledger, governance epochs, and idempotency prevent resurrected authority                                    |

## Failure-mode requirements

### Invitation commit succeeds; delivery fails

Show **Invitation created — delivery failed** with **Send again**, **Change
reviewer**, and **Cancel invitation**. Do not discard the current invitation,
claim receipt, create an accepted grant, or create another active business
identity.

### Delivery may have succeeded; response is lost

Show **Confirming invitation delivery**. Reconcile the same delivery id. **Send
again** issues fresh scanner-safe delivery proof but preserves the same exact
invitation, expiry, and auditable attempt lineage.

### Bundle generation fails after grant preparation

Do not release reviewer access or delivery. Preserve staff input and show the
source-owned repair state. A hash-only placeholder is not a complete bundle.

### Review succeeds; presentation/outbox fails

The immutable source receipt and exact public effect remain authoritative.
Retry item/email/audit projections idempotently. The staff UI reconciles by
business-effect key and never asks the reviewer to approve again.

### Source command outcome is ambiguous

Suppress repeat submission, read authoritative source/head/receipt truth, and
show **Confirming whether the review was completed**. Never create a replacement
candidate or invitation until ambiguity is resolved.

### Revocation succeeds; cancellation email fails

Access remains revoked. Show separate delivery failure to staff. Never restore
authority because a courtesy message was not sent.

## Adversarial input for the full category review

| Category                          | Material concern | Research-backed direction                                                                                                      |
| --------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| problem validity/alternatives     | Yes              | exact external review solves solo-Tenant dead end; temporary membership is strongest alternative but broader                   |
| brittleness                       | Yes              | source opt-in, current proof, reusable contacts, and reversible lifecycle avoid one-provider/one-inviter assumptions           |
| technical debt                    | Yes              | one generic guest role or mutable invitation row would duplicate identity/workflow truth                                       |
| edge cases                        | Yes              | identity aliases, source disagreement, expiry, resend, replacement, and staleness need explicit states                         |
| footguns                          | Yes              | saved contact, copied link, resend, admin, and delivery status can be mistaken for authority                                   |
| tenant safety                     | Yes              | exact scope and non-enumerating Tenant-local contact/search are mandatory                                                      |
| database/RLS/auth                 | Yes              | no direct external table access; full `USING`/`WITH CHECK`, server RPC, service-role poison tests                              |
| overengineering                   | Yes              | no generic delegation graph, guest portal, workflow DSL, quorum, calendar, or comments product                                 |
| UX/UI friction                    | Yes              | add-or-reuse contact, one scope preview, honest delivery state, and every recovery action must be direct                       |
| source of truth/invariants        | Yes              | Phase 4 owns invitation, Phase 12 owns identity/context, source owns content/bundle/outcome, and D25 owns the exact grant only |
| hidden coupling                   | Yes              | email provider, CMS role, inviter account, and current route cannot become required authority dependencies                     |
| failure modes                     | Yes              | authoritative save, delivery, bundle, decision, public effect, and presentation can fail separately                            |
| lifecycle/concurrency/idempotency | Yes              | append-only lifecycle and one source CAS winner are required                                                                   |
| data integrity                    | Yes              | identity merge, duplicate invites, stale bundle, restore, and contact deletion can corrupt independence                        |
| security/privacy                  | Yes              | minimum bundle, no bearer approval, stable human, no logs/analytics/export, and synchronous revocation                         |
| scalability/performance           | Yes              | indexed exact reads, bounded fan-out, no N+1 contact eligibility, and no cached authority                                      |
| operational burden                | Yes              | staff need self-service send-again/replace/revoke/fresh-invite recovery; support/database repair is forbidden                  |
| observability/audit               | Yes              | delivery evidence, access, authority, review receipt, and public effect remain distinct                                        |
| dependency/integration            | Yes              | identity and email providers may fail/change; source adapters and outbox isolate disagreement                                  |
| migration/rollout                 | Yes              | fresh-build additive rollout; never infer external reviewers from current broad roles/emails                                   |
| testability/traceability          | Yes              | D25 rules must trace through glossary, PRD, OpenSpec, design, manifest, tickets, code, tests, and release proof                |
| other hazards                     | Yes              | current Phase 17 one-reviewer and email-boundary contracts must be amended explicitly, not silently generalized                |

## Strongest alternative

### Temporary internal/CMS membership with a narrow role

This is the strongest plausible alternative because many current products use it:
Blackbaud invites a user and assigns a role, Salesforce delegates to an existing
permitted user, Box requires folder collaboration, Contentful uses space roles,
and GitHub uses repository roles.

It loses for Core because even a carefully narrowed role creates standing scope,
navigation, lifecycle, license, recertification, offboarding, environment,
directory, and accidental permission-union burden for one immutable decision.
It also encourages Tenants to keep trusted outsiders as permanent users “for
next time.”

The candidate-scoped model is permanently better **only** if reusable contacts
and one-click lifecycle make it easier than temporary membership. If staff must
retype identity, call support, configure a role, or rebuild context for every
review, the design has failed its stated purpose.

## Acceptance and proof matrix

### Positive and ordinary-flow proof

1. **D25-AC01:** A source-authorized protected candidate with no internal
   reviewer offers **Invite a reviewer** and keeps current Live state.
2. **D25-AC02:** Staff can choose an eligible saved contact without retyping
   verified fields.
3. **D25-AC03:** Staff can add a new person in the same journey without prior
   Tenant membership or platform-operator help.
4. **D25-AC04:** Scope preview names exact Site/source/candidate/effect, expiry,
   evidence shown, permitted actions, and excluded access.
5. **D25-AC05:** A contact can be saved without creating access or an
   invitation.
6. **D25-AC06:** A current eligible external stable human can authenticate,
   step up, read the exact safe bundle, and complete the source command.
7. **D25-AC07:** Zero-public review remains zero-public.
8. **D25-AC08:** A source-owned combined review/activation command produces only
   the exact confirmed effect and one receipt.
9. **D25-AC09:** Completed review ends exact sibling attention/invitations without
   fabricating their engagement.
10. **D25-AC10:** Staff can remove a contact from future picker use without
    deleting completed audit evidence.

### Source and boundary proof

11. **D25-AC11:** Every applicable source must opt in; one missing or internal-
    only source omits external review.
12. **D25-AC12:** One source cannot broaden another source's bundle or action.
13. **D25-AC13:** Source bundle contains exact permitted public candidate content
    and synthetic/redacted operational facts only according to its schema.
14. **D25-AC14:** No bundle exposes real donor, missionary, recipient, payment,
    credential, care, restricted, location, Stripe, bank, or accounting data.
15. **D25-AC15:** D25 cannot change Giving URLs, Legal Entity, Stripe, settlement,
    currency, contributions, receipts, statements, ledger, or accounting.
16. **D25-AC16:** CMS/editor/admin/superuser status cannot bypass source denial or
    D24 participation.
17. **D25-AC17:** Route membership and ordinary Site permission do not create
    external delegation.
18. **D25-AC18:** A candidate whose source cannot create a complete safe bundle
    stays blocked with current Live preserved.

### Identity and authorization proof

19. **D25-AC19:** Email, name, profile, role, account, or invitation link alone
    cannot approve.
20. **D25-AC20:** Two accounts/emails for one human remain one participant.
21. **D25-AC21:** Shared/service/support/AI/impersonated identities cannot satisfy
    different-human review.
22. **D25-AC22:** A forwarded link reveals no candidate before authentication and
    cannot bind a different stable human.
23. **D25-AC23:** Wrong-account, nonexistent, expired, revoked, and cross-Tenant
    pre-auth states are privacy-uniform.
24. **D25-AC24:** Identity merge/relink recomputes the strict participant union
    before read and decision.
25. **D25-AC25:** Final action requires current source-prescribed step-up and
    current stable-human proof.
26. **D25-AC26:** Inviter/current-manager capability is proved server-side; actor,
    Tenant, Site, invitee, and audit attribution cannot come from caller fields.
27. **D25-AC27:** Governance-epoch invalidation yields **Needs confirmation** and
    allows another current manager to reissue without the original inviter.

### Lifecycle proof

28. **D25-AC28:** **Send again** preserves one pending invitation, issues fresh
    delivery/auth proof, invalidates old bearer material, and does not extend
    expiry or create a grant.
29. **D25-AC29:** Post-expiry recovery requires a fresh invitation after current
    candidate/source/identity/authority proof; it never revives the expired row.
30. **D25-AC30:** Cancel/revoke synchronously denies access without waiting for a
    worker or email.
31. **D25-AC31:** Replace revokes old authority before releasing new authority.
32. **D25-AC32:** Material candidate/dependency/participant change stales the old
    invitation and offers an explicit fresh re-invite.
33. **D25-AC33:** Expiry at authoritative server time rejects an already-open
    browser's final action.
34. **D25-AC34:** Site retirement/transfer and Tenant suspension prevent future
    read/decision and never transfer the invitation.
35. **D25-AC35:** Decline/wrong-person, request changes, favorable decision, revoke,
    replace, expire, and supersede remain distinct durable outcomes.
36. **D25-AC36:** No automatic reminder, recurrence, escalation, or deadline-based
    approval occurs.

### Delivery and failure proof

37. **D25-AC37:** Delegation plus durable outbox commit atomically; provider call
    occurs outside the transaction.
38. **D25-AC38:** Provider failure preserves the current invitation and offers
    lawful send-again/replace/cancel actions without creating a grant.
39. **D25-AC39:** Provider acceptance is labeled sent, never received/read.
40. **D25-AC40:** Indeterminate delivery reconciles the same semantic attempt and
    creates no duplicate invitation or Candidate Review Grant.
41. **D25-AC41:** Mail scanners/prefetch GETs create no auth, read, acceptance,
    token consumption, or decision.
42. **D25-AC42:** No generic platform sender, manual bearer-link fallback, or
    another Tenant's connection is used when the required delivery contract is
    unavailable.
43. **D25-AC43:** Revocation remains effective when cancellation delivery fails.
44. **D25-AC44:** Bundle-generation failure releases no invitation/access.
45. **D25-AC45:** Review commit followed by projection failure preserves one
    source receipt/effect and retries projections only.

### Concurrency and idempotency proof

46. **D25-AC46:** Internal and external concurrent valid decisions yield one
    source CAS winner.
47. **D25-AC47:** Concurrent cancel versus review respects lock order and accepts
    review only if the Candidate Review Grant/context was active at the atomic
    gate.
48. **D25-AC48:** Exact command retry returns the same receipt; changed actor,
    candidate, action, or meaning conflicts.
49. **D25-AC49:** Resend versus replace cannot release both old and new bearer
    proofs as active authority.
50. **D25-AC50:** Restore/replay of database or queue data cannot resurrect
    expired, revoked, replaced, or consumed authority.

### Tenant, RLS, and privacy proof

51. **D25-AC51:** Wrong-Tenant, wrong-environment, wrong-Site, wrong-source,
    wrong-candidate, and wrong-invitee reads/mutations fail uniformly.
52. **D25-AC52:** RLS mutation tests prove both `USING` and `WITH CHECK`, including
    permitted-row-to-forbidden-state attacks.
53. **D25-AC53:** Browser roles cannot directly write grant, identity,
    participant, review, or audit tables.
54. **D25-AC54:** Service role, worker, Payload, import, migration, support, and
    repair paths pass the same hostile Tenant/source/candidate tests.
55. **D25-AC55:** No public storage URL, third-party asset, analytics request,
    referrer, cache, log, trace, export, or screenshot tooling receives bundle or
    invitation secrets.
56. **D25-AC56:** Contact removal/erasure follows policy while immutable review
    audit retains only necessary pseudonymous identity evidence.
57. **D25-AC57:** One human serving two Tenants reveals no cross-Tenant contact,
    account, invitation, or review relationship.

### UX, accessibility, localization, and resilience proof

58. **D25-AC58:** Staff complete add/reuse, scope confirmation, send/share, and
    management journeys at 320 CSS pixels and 400 percent zoom without
    horizontal decision scrolling.
59. **D25-AC59:** Keyboard, screen reader, forced-colors, reduced-motion, and
    touch-target tests cover staff and reviewer paths.
60. **D25-AC60:** Dynamic sent/revoked/reconciled/expired states are announced
    once through appropriate status semantics without focus theft.
61. **D25-AC61:** Invalid contact, identity mismatch, expiry, and source conflict
    errors identify the field/state and provide a textual recovery.
62. **D25-AC62:** Password-manager, paste, and adopted accessible alternative
    authentication paths work; Core never blocks paste or requires a puzzle.
63. **D25-AC63:** Long names, localized dates/times, RTL/bidi, CJK, combining
    marks, and long translated actions remain unambiguous.
64. **D25-AC64:** Offline and weak-network paths never queue review; they preserve
    local notes and re-read authoritative truth before confirmation.
65. **D25-AC65:** User research proves staff can answer who gets access, what they
    can see, when it ends, what approval does, and what stays Live.

### Migration, rollout, and traceability proof

66. **D25-AC66:** Migration infers no external contact, stable human, participant,
    invitation, source opt-in, bundle, or favorable review from current roles,
    emails, tasks, or CMS accounts.
67. **D25-AC67:** Mixed-version clients and workers cannot redeem or act until
    source adapter, Phase 12, D24, schema, RPC, and UI generations agree.
68. **D25-AC68:** Feature/source kill switch blocks new and pending access while
    preserving completed receipts and current Live state.
69. **D25-AC69:** Rollback after invitation rows exist stops redemption/review,
    preserves audit, and requires no destructive deletion or source rollback.
70. **D25-AC70:** Every D25 rule traces to glossary, PRD, corrected OpenSpec,
    design, generated manifest, tickets, runtime, tests, migration, and release
    evidence before a key becomes Live.

## Migration and rollout direction

Core is fresh-build with no production users, but current broad MVP auth and
partial CMS source mean rollout still requires compatibility discipline.

1. Land final Phase 12 stable-human identity, exact capability, step-up,
   governance-epoch, and service-path substrate.
2. Land stable Tenant/environment/Site scope and D23/D24 source-evaluation and
   participant contracts.
3. Inventory each source. Keep external review **Off/Reserved** until that source
   supplies explicit opt-in, safe bundle, exact action, lifetime, and hostile
   proof.
4. Correct Phase 17/OpenSpec every-participant wording before using it as an
   implementation source.
5. Add reviewer contacts separately from authority; migrate nothing from current
   roles, accounts, emails, routes, or CMS collaborators.
6. Add append-only Phase 4 invitation, Candidate Review Grant/context,
   outbox/RPC/audit substrate behind a source-scoped
   kill switch.
7. Add one source adapter and staff/reviewer UI at a time; start with the already
   specified Phase 17 protected publication contract only after its delivery
   boundary is complete.
8. Run hostile RLS/service/identity/concurrency and production-shaped delivery
   proof before pilot.
9. Pilot with representative solo and small ministries, external reviewers,
   accessibility users, mobile/low-bandwidth conditions, and multiple locales.
10. Expand source opt-in only after comprehension, privacy, delivery, completion,
    and operational thresholds pass. Never enable globally by default.

Rollback is forward-safe: pause new invitations/redemption/review by exact
source, deny pending Candidate Review Grant access, retain completed immutable receipts,
keep current Live state, and roll forward repairs. Do not drop evidence or
attempt to undo a valid already-committed source effect through schema rollback.

## Monitors and release gates

These are Core product/operations thresholds, not claimed external standards.
Missing instrumentation, owner, threshold, or response keeps the source key
Reserved.

| Signal                                                      | Threshold                                                                                                  | Owner                         | Required response                                                                                       |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| `external_review_cross_tenant_or_wrong_scope_success_total` | any event                                                                                                  | Phase 12 Security             | P0 contain, revoke affected invitations/grants, assess disclosure, repair and rerun full poison suite   |
| `external_review_expired_revoked_stale_accept_total`        | any event                                                                                                  | Source owner + Security       | P0 stop source, preserve evidence, correct affected public state through source recovery                |
| `external_review_participant_collision_accept_total`        | any event                                                                                                  | Identity + Source owner       | P0 stop, merge strict identity lineage, invalidate unsafe review and execute governed correction        |
| `external_review_bundle_forbidden_fact_total`               | any donor/missionary/credential/restricted/Giving/financial leak                                           | Privacy + Source owner        | P0 contain bundle, revoke access, incident review, shrink schema and prove fixtures                     |
| `external_review_bearer_link_decision_total`                | any decision without authenticated stable human and step-up                                                | Identity Security             | P0 disable redemption/decision path and rotate/revoke affected proofs                                   |
| `external_review_revocation_effect_delay`                   | any successful access after revoke commit                                                                  | Platform Security             | P0 stop source and repair synchronous gate/cache invalidation                                           |
| `external_review_delivery_indeterminate_age`                | any item older than 15 minutes                                                                             | Communications Operations     | reconcile same semantic attempt; surface status; no automatic duplicate send                            |
| `external_review_bundle_generation_p95`                     | over 2 seconds for 15 minutes in a registered production-shaped cohort                                     | Source Platform               | profile/index/cache non-authoritative evidence; never cache authority or serve stale bundle             |
| `external_review_final_gate_p95`                            | over 500 ms for 15 minutes in a registered production-shaped cohort                                        | Phase 12 + Database           | inspect query/lock plan; optimize indexes/batching without dropping proof                               |
| `external_review_expired_without_action_rate`               | over 20% trailing 30 days with at least 50 invitations                                                     | Site Product + UX Research    | study expiry/selection/recovery; adjust pre-Live manifest bounds or guidance, never weaken independence |
| `external_review_changed_reviewer_before_action_rate`       | over 15% trailing 30 days with at least 50 invitations                                                     | Site Product + UX Research    | investigate wrong-person selection and picker clarity; improve choice/replacement journey               |
| `external_review_support_or_db_repair_request_total`        | any request needed to send again, cancel, replace, issue a fresh invitation, or recover ordinary flow      | Site Product + Operations     | treat as product defect; add self-service repair, never normalize manual SQL                            |
| `external_review_comprehension_gate`                        | fewer than 90% of registered participants correctly answer scope, expiry, effect, and Live-state questions | Site UX Research              | keep source Reserved, revise IA/copy, repeat protocol                                                   |
| `external_review_task_completion_gate`                      | fewer than 90% complete invite or review unaided in registered usability protocol                          | Site UX Research              | keep source Reserved, remove friction, repeat with same cohort criteria                                 |
| `external_review_a11y_blocker_total`                        | any Core/WCAG blocker                                                                                      | Accessibility + Site UX       | block release, repair shared primitives/flow, rerun keyboard/AT/mobile/zoom proof                       |
| `external_review_source_contract_drift_total`               | any runtime/source/manifest rule mismatch                                                                  | Source owner + OpenSpec owner | disable affected source, reconcile docs/generated contract/code/tests before re-enable                  |

## Ruthless synthesis

### Must be resolved before D25 is recorded

1. Record external review as one **source-authorized Candidate Review Grant**,
   not a generic guest or fallback.
2. Record saved contacts as convenience-only with zero authority.
3. Record exact current identity, independence, bundle, expiry, revocation,
   source, and final-CAS proof.
4. Record complete self-service invitation/grant lifecycle and honest delivery
   repair without a manual bearer-link fallback.
5. Record no standing membership, admin/self-review bypass, email-link approval,
   onward delegation, unrelated visibility, Giving, or financial authority.
6. Preserve exactly one current external invitation or accepted grant per exact
   candidate;
   D26 does not reopen cardinality; its closed availability posture remains
   subject to this one-at-a-time boundary.

### Must enter future PRD/OpenSpec/design

1. Source opt-in registry and safe-bundle schemas.
2. Exact Phase 4 invitation, stable-human/contact, Candidate Review Grant/
   Authorization Context, and receipt vocabulary/ownership.
3. Source/Phase 4 code-owned expiry manifest, Tenant-shortening rule, fresh
   post-expiry invitation, and terminal lifecycle.
4. Delivery boundary, scanner-safe redemption, and honest
   provider evidence.
5. RLS/grants/RPC/service-role/storage poison matrix.
6. Source CAS/idempotency/lock/outbox contract.
7. Staff/reviewer accessible state machine and localized consequence copy.
8. Retention, erasure, audit, export, backup, incident, and support behavior.
9. Migration, feature/source flags, kill switch, rollback, and release monitors.

### Implementation safeguards

1. Phase 12 and Site scope before D25.
2. One source adapter at a time.
3. Purpose-built server DTO/RPC; no direct external table/CMS access.
4. Append-only invitation/grant and audit; synchronous expiry/revocation.
5. One source-owned transaction winner; no external call in transaction.
6. No source Live until all 70 acceptance criteria applicable to it and every
   monitor/release gate pass.

### What may be monitored rather than frozen

Only usability/operational tuning may be monitored: source-registered expiry
choices, picker comprehension, replacement rate,
delivery latency, and completion time. Identity, Tenant isolation, source opt-in,
independence, minimum projection, revocation, idempotency, audit, and
Giving/financial boundaries are hard invariants, never monitor-only controls.

## Recommended next Grill decision — D26 external-review availability

> **Resolved by D26:** the founder selected bounded Tenant choice. Adversarial
> review amended the two-state question to three explicit postures—prohibited,
> recovery-only default, or source-permitted staff choice—with Site narrow-only
> inheritance and current-ceiling/no-resurrection semantics. D27 now closes one
> source-owned responsibility lane with deliberate takeover. D28 now closes
> explicit decline/expiry next-lane recovery; D29 is the next decision.

### Context and impact

D25 now safely handles the small-team dead end with exactly one current external
invitation or accepted grant. It does not decide whether that option should remain hidden
when an eligible internal reviewer exists. This matters because a ministry may
deliberately prefer a bilingual board member, legal adviser, accessibility
specialist, denominational reviewer, or other trusted outside human for one
source-approved protected change.

The choice changes disclosure and staff freedom, but never D25's scope. Every
external reviewer still receives one fresh candidate grant, one minimum safe
projection, no membership, and no standing access. No option creates automatic
external routing.

Example: Ana is eligible to review Hope's protected French candidate. Hope also
uses Eli, a bilingual board member saved as a Reviewer contact. Every applicable
source permits external review and can expose a safe complete comparison. Should
Maria be allowed to choose Eli instead of Ana?

### Option 1 — Tenant chooses a bounded availability posture — recommended

The platform default is **Only when no internal reviewer is eligible**. An
authorized Tenant Website administrator may instead enable **Allow external
review as an option for source-approved protected changes**. A Site may narrow
that Tenant choice but cannot widen it. Every source restriction, D23/D24 check,
and D25 projection/identity boundary still wins.

- **Staff impact:** small ministries get recovery automatically, while Tenants
  that regularly use trusted board, language, legal, or accessibility reviewers
  can choose that practice without making those people staff.
- **Product impact:** one bounded plain-language setting, not a policy builder;
  a current authorization ceiling that never sends or resurrects an invitation.

### Option 2 — recovery only

External review appears only after a complete current resolver proves zero
eligible internal reviewers. If Ana is eligible, Maria must use Ana; Eli cannot
be chosen.

- **Benefit:** least external disclosure and no new setting.
- **Cost:** rigid for ministries with legitimate outside-review practices and
  makes Core prove zero internal eligibility before showing recovery.

### Option 3 — always offer external review whenever every source permits it

Every authorized staff member sees **Invite external reviewer** beside the
internal path for every source-approved protected candidate.

- **Benefit:** maximum immediate choice and no setup.
- **Cost:** exposes a privacy-sensitive option to every Tenant by default and
  may encourage unnecessary external sharing.

### Recommendation

**Recommend Option 1 — a bounded Tenant posture with recovery-only as the safe
default.** It best honors Tenant control and staff flexibility without automatic
disclosure, standing access, or another workflow product.

**D26 question:** Do you choose **Option 1 — bounded Tenant posture
(recommended)**, **Option 2 — recovery only**, or **Option 3 — always offer
external review when source-permitted**? You may amend any option.

## Primary source index

### Core repository

- [Phase 4 — Identity & Account-Claiming Foundation](./phase-04-identity-account-claiming-foundation.md)
- [Phase 12 — Full Role & Permission Configuration](./phase-12-full-role-permission-configuration.md)
- [Phase 17 — System Messages & Template Management](./phase-17-system-messages-template-management.md)
- [D21 — explicit review responsibility routing](./phase-24-d21-explicit-review-responsibility-routing-adversarial-review.md)
- [D22 — small co-responsible Website reviewers](./phase-24-d22-small-co-responsible-reviewers-adversarial-review.md)
- [D23 — source-owned proportional independence](./phase-24-d23-source-owned-proportional-independence-adversarial-review.md)
- [D24 — every substantive participant](./phase-24-d24-every-substantive-participant-adversarial-review.md)
- [ADR-0027 — one notification presentation and engagement model](../../adr/0027-one-notification-presentation-and-engagement-model.md)
- [ADR-0029 — reference-not-copy CMS to operational](../../adr/0029-reference-not-copy-cms-operational.md)
- [ADR-0181 — source-authorized candidate-scoped external review](../../adr/0181-source-authorized-candidate-scoped-external-review.md)
- [Platform principles](../../../openspec/specs/platform-principles/spec.md)
- [Platform boundaries](../../../openspec/specs/platform-boundaries/spec.md)
- [Active outbound-communications OpenSpec](../../../openspec/changes/sitestacker-parity/specs/outbound-communications/spec.md)
- [Current MVP permissions](../../../packages/auth/permissions.ts)
- [Current reserved Site resolver seam](../../../apps/admin/src/cms/public/resolve-tenant.ts)

### External official primary sources

- [NIST SP 800-53 Rev. 5.1](https://csrc.nist.gov/CSRC/media/Projects/risk-management/800-53%20Downloads/800-53r5/SP_800-53_v5_1-derived-OSCAL.pdf)
- [NIST SP 800-63A](https://pages.nist.gov/800-63-4/sp800-63a.html)
- [NIST SP 800-63B authenticators](https://pages.nist.gov/800-63-4/sp800-63b/authenticators/)
- [RFC 7643 — SCIM Core Schema](https://www.rfc-editor.org/rfc/rfc7643.html)
- [OWASP Transaction Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html)
- [OWASP Forgot Password](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)
- [Microsoft Entra external-user governance](https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-external-users)
- [Microsoft access-package lifecycle](https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-access-package-create)
- [Slack guest roles](https://slack.com/help/articles/202518103-Understand-guest-roles-in-Slack%26)
- [GitHub repository roles](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/repository-roles-for-an-organization)
- [Google Drive approvals](https://support.google.com/drive/answer/9387535)
- [Dropbox Sign pending requests](https://help.dropbox.com/view-edit/edit-pending-dropbox-sign-signature-requests)
- [Dropbox Sign signer authentication](https://help.dropbox.com/security/dropbox-sign-signer-authentication)
- [Box approval tasks](https://support.box.com/hc/en-us/articles/360043695954-Adding-Comments-and-Tasks)
- [Contentful workflow permissions](https://www.contentful.com/help/ai-automations/workflows/workflows-steps-management/)
- [Contentful environment access](https://www.contentful.com/developers/docs/tutorials/general/managing-access-to-environments/)
- [Contentstack workflows](https://www.contentstack.com/docs/headless-cms/add-workflows-and-stages)
- [Blackbaud Manage Users](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/financial-aid/content/sa-manage-users.html)
- [Blackbaud user migration and roles](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/fe/content/sec-pui.html)
- [Salesforce delegated approvers](https://help.salesforce.com/s/articleView?id=sales.cpq_aa_delegate_approvers_task.htm&language=en_US)
- [Salesforce assigned approvers](https://help.salesforce.com/s/articleView?id=platform.approvals_step_approver.htm&language=en_US&type=5)
- [W3C Accessible Authentication](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html)
- [W3C Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages)
- [W3C Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification)

## Final research disposition

**Accept with required amendments.** Candidate-scoped external review is the
best permanent recovery for an otherwise blocked solo/small Tenant, provided
Core implements it as source-authorized, exact-candidate, stable-human,
expiring, revocable, minimum-projection authority and makes ordinary staff
recovery genuinely self-service.

The answer is rejected if implemented as temporary broad membership, one global
external reviewer, an email-link approval, a mutable guest role, a source-
agnostic preview, an administrator bypass, or a generic platform email fallback.
The D25-PR1–PR20 research requirements above are consolidated without loss into
the final D25-R1–R18 decision in the full adversarial report.
