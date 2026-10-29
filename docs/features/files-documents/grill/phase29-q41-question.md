# Phase 29 Q41 — External recipient access to an authorized shared document

**Status:** Historical researched question prepared 2026-10-24, Asia/Bangkok.
Conrad selected Q41 A and fully ratified all required amendments and the exact
Private Document Share glossary term on 2026-10-24. Q01–Q41 and 26 glossary
definitions are ratified; the prior 25 definitions remain unchanged. Earlier
preparation and review entries below are dated history. No implementation,
activation or formal owner/OpenSpec publication follows.

## Historical question and alternatives

**When a source permits an ordinary private document to be shared with a named
outside recipient, should that person be able to authenticate and read it
without completing full Asym signup?**

Authorized sharing is already required by the founder brief. The open decision
is how an eligible outside reader gains the limited access they need. It does
not decide that every document is shareable or that everyone with an account
can open it.

| Option                                                                     | Practical behavior                                                                                                                                                                                                                                                                                                                                                                                      | Main tradeoff                                                                                                                                                                                                                                                                                                                          |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Allow verified recipient access without full signup (recommended).** | An eligible named recipient uses a limited native access flow, with the source-required recipient proof, to read only the permitted document/use/version and perform only the allowed reading actions. Reuse a compatible current signed-in proof when qualified; otherwise provide the qualified confirmation step. No donor, missionary, staff or organization enrollment is required merely to read. | Fits occasional outside readers and avoids unrelated onboarding. It adds a real recipient admission and recovery path that Core must qualify through its shared identity and authorization owners.                                                                                                                                     |
| **B — Require an existing qualified Asym sign-in context.**                | This ordinary sharing lane serves recipients only through an already-supported signed-in context with current source-authorized access. A person without that context cannot use this lane; any separately supported source delivery keeps its own rules.                                                                                                                                               | Fits recurring readers who already have appropriate contexts and reuses their established sign-in/recovery lifecycle, with a smaller surface to support. It leaves other legitimate outside readers without a lightweight native route. Creating an arbitrary account or assigning a donor role would not solve the authorization gap. |

**Recommend A.** A person whose only authorized task is to read a document
should not need unrelated product enrollment. Keep the experience focused on
the intended recipient and exact document, and reuse Core's shared identity,
authorization and protected-action services. Tenant/source rules may restrict
external sharing or require stronger assurance; staff cannot weaken them.

This is a product judgment supported by comparable documented patterns, not
measured Asym demand or a claim that A has no added cost. B is a credible
steady-state choice when readers already use appropriate Asym contexts and
their established sign-in/recovery lifecycle. Its narrower cost is the missing
lightweight route for occasional outside readers without that context.
Neither option is an anonymous anyone-link, email-attachment workaround or a
second authentication platform.

## Concrete example and user journey

Illustrative scenario, not an observed ministry workflow: Elena has an ordinary
equipment-inventory PDF whose owning source expressly permits sharing with
Maya. Maya is not enrolled in Asym. Elena's ability to read the document alone does not authorize
sharing it; this example assumes the separate source checks succeed.

Under A, Elena opens **Share**, selects the authorized recipient, and reviews
the actual document/version, allowed reading actions and access end. The
confirmation makes external access clear. Issuance and any communication use
the qualified source path. Maya follows the invitation to a safe landing,
completes the required recipient confirmation when no suitable current proof
exists, and reaches the document directly. She does not first become a donor,
fill in a missionary profile or browse an unrelated dashboard.

Under B, Maya can proceed only if she already has a compatible qualified
signed-in context and source rights. Otherwise the interface explains the
unavailable route without pretending that generic signup grants access.
Elena must use another independently authorized source delivery if one exists.

Under either option, an invitation forwarded to someone else does not grant
that person access. A wrong signed-in account has a clear safe account-switch
path. An expired or revoked share shows an honest unavailable state and the
source-approved recovery route. It does not silently renew. Revocation blocks
future affected access; it cannot recall a document already downloaded or stop
someone photographing a displayed page.

## Current primary research and strongest alternative

Official sources retrieved 2026-10-24 demonstrate both product patterns:

- [Microsoft Entra's email one-time passcode documentation](https://learn.microsoft.com/en-us/entra/external-id/one-time-passcode)
  describes an authentication fallback for eligible guests without another
  supported sign-in method. This supports a limited verified reading journey
  without compulsory consumer-account signup. It still authenticates a guest;
  it is not anonymous access or proof of legal identity. Core does not inherit
  Microsoft's code/session durations, provider or identity architecture.
- [Microsoft's current external-sharing transition FAQ](https://learn.microsoft.com/en-gb/sharepoint/faqs-odspintegrationwithentrab2b),
  updated October 7, 2026, distinguishes retiring SharePoint-specific OTP from
  continuing Entra B2B email OTP. Its commercial-tenant transition uses guest
  records. Therefore older descriptions of account-free SharePoint sharing
  cannot justify “no identity record” or be treated as today's universal
  mechanics. No specific tenant's rollout status was tested here.
- [Box's collaborator invitation documentation](https://support.box.com/hc/en-us/articles/360043696854-Inviting-Collaborators)
  requires a recipient without a Box account to sign up before collaboration
  access, and provides an external-recipient indicator. This is concrete
  counterevidence to claiming lightweight admission is universally preferable.
  Box collaboration is broader than one-document reading; Core should not
  import its folder roles, default editor behavior or permission inheritance.

The useful distinction is **no compulsory full signup**, not “no authenticated
identity.” The [comparative research](phase29-q41-comparative-research.md)
records more source detail, account-based nonprofit-platform comparisons,
accessibility and recovery. Product documentation establishes possible patterns,
not measured completion benefits, current Asym capability, vendor-plan costs or
successful native authorization. No authenticated vendor trial, recipient study,
private-mail inspection or delivery test was performed.

## Governing boundaries and why this is a genuine next question

The [owner research](phase29-q41-owner-research.md) and
[runtime research](phase29-q41-runtime-research.md) preserve exact source
references and evidence limits. Both options retain these constraints:

1. **Sharing is already required; its recipient admission is unresolved.**
   Founder brief §§11/16 require the private request → review → authorized
   sharing journey. Q02 preserves source-owned external delivery while
   rejecting a general drive and unrelated anyone-link service. The question
   fills the reader journey rather than reopening the existence of sharing.
2. **Q01 is collection-specific.** Its no-enrollment recipient confirmation
   is an architectural precedent, not an outbound document-reading grant.
   Q04 original submission download and Q05–Q20 request access periods do not
   admit a different outside reader or provide a share duration. Selecting A
   needs explicit compatible adoption for the outbound purpose through the
   actual source, native identity, P12's sole authorization decision point,
   P17's protected doorway/content and P6's qualified delivery.
3. **Identity proof and permission are separate.** A native limited recipient
   identity may be needed. Do not fabricate a Party, donor profile, tenant
   membership, broad new role or parallel login system. Mailbox confirmation
   proves control of the approved mailbox, not exclusive human identity,
   representation, legal identity, signature or business acceptance. An email
   string, verified-email flag or ordinary login alone does not confer this
   share's rights. Stronger source assurance remains mandatory.
4. **Source ownership remains exact.** The source owns whether sharing is
   allowed, recipient eligibility, use/version, allowed actions, finite end,
   revocation, privacy and retention. P29 owns custody and shared file UI.
   Folder placement, shared bytes, a readable file or staff seniority cannot
   expand those rights. Existing P18 financial/generated-document, P21 expense,
   P22 restricted media, P23 public Media, P26 Support and P28 resource rules
   remain intact; none becomes an ordinary-sharing exception by relabeling.
5. **The doorway cannot substitute for admission.** Existing governing P17
   private-action rules require current authentication and producer-defined
   assurance behind an inert landing and deliberate action. A forwarded link
   alone is insufficient for A. Reuse qualified current proof to avoid needless
   repeated challenges; still check actual current rights on every protected
   operation. Do not replace the shared doorway with a raw storage URL.
6. **Scope and currentness must be visible and enforceable.** Bind exact
   tenant/source/use, authorized recipient, document/version or explicitly
   source-qualified current resolution, purpose, actions and finite end.
   Read-only does not silently add original download, edit, upload, review,
   comments, acceptance, folder browsing or reshare. Source-qualified metadata,
   preview, range/conditional reads and any permitted download/recovery remain
   protected. No policy default for duration, version selection or download is
   selected by this question.
7. **Failures must have a usable path.** Wrong account, inaccessible mailbox,
   stale recipient/address, delayed confirmation, unavailable preview, source
   restriction, expiry, revocation and lost responses need honest outcomes
   and owner-supported correction. They cannot widen access, silently create
   another grant, fall back to public bytes or require a database repair.
8. **Keep the capability small.** One source-owned share and its direct reader
   experience can reuse shared services. No general external-user directory,
   workspace collaboration, chat, signature, read receipt, new inbox, sync,
   automatic reminders or generic sharing-policy engine follows. This question
   does not select an outbound notice default or provider. Shared prerequisites
   need qualification, but whole later products are not artificial blockers.

Existing-account-only B also requires exact source rights and a viable reading
path. It is not a claim that current sign-in already completes the feature.
Choosing A authorizes the narrow product direction for subsequent adversarial
review; it does not declare a currently missing owner/profile Live.

## Journeys and acceptance direction

These are boundaries for the selected-answer review, not a hidden second batch
of founder decisions or a completed implementation proof.

| User or situation                           | Required experience and safeguard                                                                                                                                                |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Staff issuing a share                       | Start from an admitted source; show exact recipient, document/version, actions and end before deliberate issuance. Read permission alone is insufficient.                        |
| Tenant administrator                        | Source policy and any qualified tenant restrictions are discoverable; staff cannot bypass them or invent new recipient classes.                                                  |
| Outside person without enrollment           | A offers the qualified limited authentication path and direct document destination; B truthfully explains why this lane is unavailable.                                          |
| Existing donor, missionary or staff account | Reuse compatible proof and source rights when qualified; preserve real memberships and avoid unrelated dashboard detours. Existing account status is not a grant.                |
| Wrong account or tenant                     | Offer a safe account-switch/re-entry route; no private metadata, existence cue or cross-tenant cache leak.                                                                       |
| Forwarded or copied invitation              | The unintended holder cannot gain access from possession alone. Recipient details remain appropriately protected before proof.                                                   |
| Confirmation delay or inaccessible mailbox  | Preserve context, provide bounded supported retry/correction and truthful status; do not switch the approved destination from caller input.                                      |
| Returning authorized reader                 | Avoid a new challenge when current proof qualifies; recheck current source/action authority and actual expiry.                                                                   |
| Mobile or low-bandwidth reader              | Responsive direct entry, readable controls and text-first states; clear progress and safe retry without mandatory app installation or unrelated onboarding.                      |
| Keyboard, assistive technology or zoom user | Labeled paste/autofill-compatible confirmation where used, logical focus and error/status announcements; document accessibility needs its own qualified representation/recovery. |
| International names, addresses and dates    | Preserve approved recipient data without Anglo-centric name assumptions; make the access end and relevant time zone clear without redefining identity normalization.             |
| Unavailable or unsupported preview          | Explain the actual limitation and permitted alternative; never silently disclose an original or send private bytes to an external viewer.                                        |
| Expiry, revocation or source restriction    | Deny new affected reads and explain the permitted recovery; no click/retry extension, automatic revival or promise of recalled copies.                                           |
| Duplicate issuance or lost response         | Recover the original source result and actual communication outcome; do not mint another grant or equate provider acceptance with recipient access.                              |
| Sensitive or specialist document            | Keep its existing owner and stronger restrictions; ordinary-sharing UI does not override them.                                                                                   |
| Public viewer or unrelated portal user      | No extra discovery/access results merely because this document has a share or the same bytes serve another authorized use.                                                       |

## Current implementation, ratification and evidence limits

Local Core remains `3d85897ebf1515008ef5c676b1c58a15422fb9ab`; freshly
checked live develop is `c541b84bcf4b401937ab5ae300f40cb0f8e0b856`.
The prior complete 67-path comparison covered live `4e31ff33` → `c541b84b`,
with no further live delta since the Q40 review. Tree evidence and current
owner/runtime reads distinguish the relevant sources; they do not establish
local/live equivalence, deployment or native recipient behavior.

Fresh relevant runtime inspection found a profile/tenant/role-dependent human
auth context, signup migration assumptions that create donor profiles, a
purpose-specific generated-document catalog with `guest_grant:false`, and an
Eve replay download that issues a short signed storage URL after owner checks.
None proves this ordinary external reader journey. A must qualify a compatible
shared limited-admission path; B still needs a qualified source reading path.
No runtime, schema, provider, message or private data was changed or tested.

Q40's exact 14,446-character, fourteen-paragraph corrected decision matches its
ratified ADR and pre-ratification review. All substantive review table rows,
all 25 glossary definitions and 355 preserved files were verified. This proves
record consistency, not implementation, delivery, accessibility or activation.

## Historical preparation and next step

Independent owner, runtime and comparative/UX research informed this question.
Their whole-question reviews are closed with no unresolved material issue for
question readiness. The final framing preserves B's positive steady-state fit
and identifies the historical live comparison precisely. The linked notes
retain actual review findings, resolution and journey coverage. Record checks
verify preservation and links; they do not establish native qualification.
No Q41 ADR or glossary term is written. Conrad chooses the admission direction;
then the selected answer receives the full requested adversarial review and
exact required amendments. Formal owner/OpenSpec publication remains `/to-prd`;
implementation tickets remain `/to-issues`.

## Historical founder answer and review — before ratification, 2026-10-24

Conrad selected **A — Allow verified recipient access without full signup** on
2026-10-24. The [full review](phase29-q41-adversarial-review.md) gives **Accept
with required amendments**. The [feature ADR](../docs/adr/0041-verified-recipient-private-document-sharing.md)
records the exact fourteen-paragraph corrected decision. Q41-C01–C14/P01–P32,
all 22 categories, 24 lifecycle distinctions, 28 composed journeys, 8 budget
rows and 8 operating controls form the complete reviewed package. The proposed
Private Document Share term distinguishes source permission from invitation,
confirmation, collection and retention. Q01–Q40 and all 25 ratified glossary
definitions are preserved; the new term is not yet added to the glossary.

The first actual source is the ordinary Private Document Request owner, over
exact currently eligible evidence durably received from the participant or
supplied under Q28, with distinct continuing outbound disclosure authority.
Issued unfinished or fulfilled requests may qualify; acceptance is neither a
universal prerequisite nor sharing permission. Cancellation/applicable adverse
restriction stops new and affected current shares. Q28 onward/origin restrictions,
specialist owners and original participant access/recovery caps remain binding.

One new share pins one selected use/version and intended recipient, qualified
reading actions and a finite reviewed end within a qualified source maximum.
The same source command may designate the recipient without a pre-created
Party or separate approval ritual. Original download is separately explicit.
No universal duration, follow-current feature, broad folder right or new
notification-default product follows. Before issue, edit/discard; after issue,
revoke the exact erroneous share and deliberately issue a new lawful one where
needed. Resend/retry/proof repair does not retarget, renew or revive it.

Adopt native limited-human identity/P12 admission without automatic donor or
default tenant, fake Party/membership, broad new role or parallel login/PDP.
Pending non-authorizing native identity is allowed when provider sequencing
requires it; cleanup preserves genuine other uses. Compatible current proof
can be reused with an independent exact share binding. Mailbox control is not
legal identity, representation, MFA/AAL or phishing resistance; stronger source
assurance remains. Preserve the qualified protected doorway/host and direct
safe return rather than existing role-home callback assumptions.

Require the complete Party/no-Party source/Auth/P17/P6 invitation/proof/recovery,
original coherent handoff and complete exact Live/proved-zero release.
Reconcile original committed effects before new eligibility under current
result disclosure. Unknown provider success cannot mint/rekey a grant or send;
inherited three-cause recovery allows at most two identical follow-up calls
after initial, within all current fences/deadlines. Communication suppression
alone does not revoke valid current reading; actual recipient/proof/source
invalidation does. Material/Recent retention and minimal opaque replay history
remain separately governed.

Every private metadata/byte/range/conditional/recovery door needs current source
authority; short-lived signed storage URLs and legacy public buckets do not
satisfy revocation. Scope/attribution/terms stay immutable under actual grants,
RLS old/new-state checks, views/RPCs/triggers/privileged routes and restore.
P12 transfer/grantor dependencies remain; current source administrators can
revoke/correct without requiring the original issuer forever.

Independent complete owner/runtime/UX reviews are closed. Current local3d85897
and live c541b84 remain distinct; the historical 67-file comparison is
live4e31→c541, not local→live or deployment proof. Current incompatible source
seams are documented, not declared deployed exploits. No native code, SQL,
provider, private data, real message or runtime tests were changed/run. Exact
native source/identity/serving, all-role/race/restore/AT/provider and budget proof
remains required before activation. Full amendments and new term await
ratification; formal publication remains /to-prd, tickets /to-issues.

## Full ratification — 2026-10-24

Conrad explicitly instructed on 2026-10-24: “Yes, fully ratify Q41 A with all
required amendments, including the new glossary term. Record it and move to the
next question in this Phase 29 grill-with-docs session, with research, practical
options, and your recommendation.”

The exact fourteen-paragraph, 14,625-character decision, Q41-C01–C14/P01–P32,
all 22 categories, 24 lifecycle distinctions, 28 composed journeys, 8 budget rows
and 8 operating controls are adopted without substantive change. The exact
Private Document Share definition is added as the 26th glossary term; the
prior 25 definitions are byte-preserved. Q01–Q41 are fully ratified grooming
intent. No Q42 answer is inferred.

Preserve the first ordinary request-source evidence cohort, separate onward
disclosure/admin power, exact selected use/version/recipient/actions and finite
reviewed end. Fulfilled sources may qualify through continuing lawful purpose;
acceptance/retention alone grants nothing. Q28 origin restrictions, specialist
owners and original participant access caps remain. Native limited-human
identity/proof through P12 must not fabricate donor/default tenant/Party/
membership or another login system; existing legitimate identities survive.

Retain the complete qualified invitation/proof/recovery, Party/no-Party
P17/P6 branch, exact Live release/proved zero, original effect reconciliation,
bounded sealed provider recovery and actual all-door current private retrieval.
Short-lived signed storage URLs are not revocation. Issued terms do not float,
retarget or renew on retries. Actual expiry/revocation/source ending remains
terminal; qualified repair of a temporary block may restore a still-live grant
only within unchanged terms and current gates. Communication-only suppression
does not revoke otherwise valid reading. P12 transfer/grantor dependencies and
current source administration remain explicit.

Keep direct accessible staff/recipient journeys, safe actual recovery,
plain-text/images-off entry and no side effects from staff field changes.
Every native role/RLS/race/restore/provider/host/AT/user and finite-budget proof
remains an implementation/release obligation. Ratification is not native
qualification. Formal owner/OpenSpec publication remains /to-prd; tickets
remain /to-issues. Q42 research records current evidence separately.
