# Phase 29 Q41 — Named-recipient access to an outgoing private document

Research refreshed 2026-10-24, Asia/Bangkok. Conrad has fully ratified Q01–Q40
and all twenty-five glossary definitions; the coordinator records adoption.
**Q41 remains unselected.** This note supports one researched product question,
not an ADR, implementation, activated share, real invitation or formal owner/
OpenSpec publication. Only this assigned work note is authored.

## Recommended question

**When the document's source permits sharing it privately with a named person
outside Asym, should that person be able to confirm access without full Asym
enrollment, or must they already have a qualified signed-in Asym context?**

Recommend **A — Offer source-admitted, named-recipient read access without
compulsory full Asym enrollment.** The person still authenticates/confirms through
a qualified native recipient context. They receive only the specific source-
approved reading permission, with its actual document/version, actions and end.
This is neither anonymous access nor a general guest role, personal drive or
second identity platform. Qualified current signed-in proof should be reusable
where the actual owner permits it; A does not mean forcing a new code on everyone.

**B — Use only the recipient's already qualified signed-in Asym context** is
a substantive, simpler alternative. It avoids adding this lightweight outbound
recipient path and its proof/recovery lifecycle. It works well when intended
readers already use Asym through a suitable source-authorized context. A login
or matching email alone is still insufficient. When the named outsider has no
such context, this native route cannot deliver the document; use only a genuinely
independent qualified route, or separately authorized enrollment if the source
already supports it. Do not invent an enrollment shortcut or promise that every
external reader can immediately get an account.

A is recommended because a source-approved one-document delivery need need not
become a broad onboarding task. It closes the outgoing read stage of the founder's
end-to-end journey while keeping the actual authority narrow. The benefit is a
reasonable product inference, not a measured Asym frequency, abandonment rate,
saved time or universal industry consensus. B can be appropriate where almost
all permitted readers are already established users or additional recipient
authentication/recovery cannot yet be qualified.

## Why this frontier, and what is already settled

The founder brief's sections7–14 and the ratified Q02 decision were reread,
alongside the current feature vocabulary and all forty ADR titles. The owner
reviewer checks the complete applicable contracts. Private sharing is already
part of the promised outcome, so this question does not ask whether to provide
sharing at all. It asks which named-recipient access path the ordinary eligible
outbound lane should support.

| Frontier considered                            | Disposition                                                                                                                                                                                                                 |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Named external read-sharing access**         | Selected for research. Collection, review and current work have been deeply resolved; the separate source-authorized outgoing read journey needs a practical recipient-access choice.                                       |
| Ordinary folder placement cardinality          | Appears open: one primary folder plus labels/views versus multi-folder references. Lower priority than closing the outgoing document journey; folders/search existence and Media's own folder contract are already settled. |
| Finite staff bulk-download archive             | A possible later practical choice if source export permissions qualify; no assumption that a generic ZIP is an official records package. Not researched or selected here.                                                   |
| Q33 No longer required awareness               | Remains a distinct notice frontier, but is lower leverage than completing an outgoing-document capability. Q40 does not cover it.                                                                                           |
| Unrestricted File Manager upload/general drive | Not a new open choice: Q02 rejects unrelated general drive/storage behavior and requires admitted source destinations. A general-resource owner cannot be bypassed by calling a file ordinary.                              |

Q01's confirmed recipient collection lane is useful precedent for constrained
proof and native reuse. It is not an outbound grant to read any other document.
Q02 expressly preserves qualified external delivery under its own source.
Q04/request readback, Q06–Q20 request access periods, Q28 evidence reuse and
Q40 notices retain their exact meaning. None silently authorizes this read share,
inherits its duration or grants recipient browsing of a request/history/library.

The same source must independently approve both staff sharing power and this
reader's exact purpose/actions. Read, upload, file administration, reviewer
assignment, folder membership, possession of a URL or technical preview readiness
is not that power. Stronger or exclusive financial, donor, Support, care,
resource, specialist and public-publication lanes remain unchanged or excluded.
If no actual owner can admit a proposed ordinary use, the share cannot activate.

## Concrete illustration

Illustrative only: Elena is working with an external partner, Maya. Elena has a
project document in Asym whose actual source permits a particular version to be
shared read-only with Maya for that project. This example assumes those source
conditions have been proved; a project label or Elena's ability to download the
file does not supply them.

Under A, Elena reviews the actual named recipient, document/version, permitted
reading actions and finite end. Maya follows the protected entry and meets the
source's confirmation/authentication requirement without having to enroll in
Asym's wider product roles. Where suitable existing signed-in proof already
establishes the correct recipient, the source may reuse it. Maya sees only the
admitted document experience, not the surrounding Party, request, folder, other
versions or other uses.

Under B, the same reading permission is usable only through Maya's already
qualified signed-in Asym context. If she lacks it, staff cannot use this native
lightweight share route. B does not mean any account is enough or that creating
an account grants the document's source permission.

Under either option, a new file version cannot silently become the shared
version, a forwarded link cannot make a different person eligible, and expiry
or source withdrawal must remain effective. The owner decides exact version
or an expressly qualified current-version rule; this question selects neither
a global follow-latest policy nor a universal preview/download default.

## Current primary comparisons

All sources below were directly opened on 2026-10-24. Article dates are displayed
dates where available; undated help pages are not dated from copyright text.
Vendor semantics are comparisons, not authority for Core.

| Source                                                                                                                                                                                              | Documented behavior                                                                                                                                                                                                                      | Lesson and limit                                                                                                                                                                                                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Microsoft: external or guest sharing](https://support.microsoft.com/en-us/sharepoint/lists/sharepoint-sharing-and-permissions/external-or-guest-sharing-in-onedrive-sharepoint-and-lists), undated | In its work/school account flow, Specific people can reach external recipients without a Microsoft account through email verification; existing accounts may sign in. It separately describes personal-account sharing and Anyone links. | Strong evidence for a named reader experience without compulsory consumer-account registration. Keep work/school and personal-account tabs distinct. It does not prove legal identity, Core scope, immediate revocation or no backend identity record.                                               |
| [Microsoft: current SharePoint/Entra B2B transition FAQ](https://learn.microsoft.com/en-us/sharepoint/faqs-odspintegrationwithentrab2b), updated 7 October 2026                                     | Commercial SharePoint-specific OTP retires during October 2026; Entra B2B email OTP remains a supported fallback. Sharing can automatically create a matching guest record, and existing matching guests are reused.                     | Current qualification against old ad hoc sharing descriptions. No compulsory full signup is compatible with a managed native guest identity. Do not copy legacy ad hoc architecture or claim Microsoft currently has no guest accounts. The en-US and en-GB pages were both directly read and agree. |
| [Microsoft Entra: email one-time passcode](https://learn.microsoft.com/en-us/entra/external-id/one-time-passcode), updated 27 March 2026                                                            | Email OTP is a fallback when other supported authentication is unavailable, with tenant configuration and a recipient proof flow. Turning it off can lead to Microsoft-account creation.                                                 | Shows bounded authentication rather than anonymous URL possession, and the real cost of email dependency/recovery. Do not adopt its specific token/session durations, policy limitations, defaults or identity provider.                                                                             |
| [Box: Collaboration FAQ](https://support.box.com/hc/en-us/articles/360044196073-Collaboration-Frequently-Asked-Questions), undated                                                                  | Named file/folder collaborators need Box accounts; people without one are prompted to sign up. The guide distinguishes collaboration from shared links and broader collaboration rights.                                                 | Strong B comparison: established account-based collaboration is a legitimate product path. Do not imply all Box read links require accounts or that its collaborator roles are Core read-only permissions.                                                                                           |
| [Submittable: building a team](https://submittable.help/en/articles/3771120-getting-started-step-2-building-your-team), 30 April 2026                                                               | The organization chooses a role and invites a team member; an existing account can be associated, otherwise the person joins through the invitation.                                                                                     | A current grant/application product uses account-based participation. This is team/reviewer enrollment, not proof that a one-document reader must join a team. No cost or automatic-role behavior is imported.                                                                                       |
| [Submittable: reviewer FAQ](https://submittable.help/en/articles/3935413-getting-started-for-reviewers-video-and-faq), 18 September 2025                                                            | Reviewers sign in, interact with assigned submissions and may need the correct team context. Their available actions depend on permission level.                                                                                         | Authentication and source-assigned work remain distinct. A login is not all-record access; account/context switching is a real journey to consider. Core read sharing does not inherit review/verdict powers.                                                                                        |
| [W3C Accessible Authentication, SC3.3.8](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html), current explanatory guidance                                          | Authentication should avoid unsupported cognitive tests. Password managers and paste mechanisms can reduce memory/transcription barriers, including verification codes.                                                                  | The confirmation path must be accessible, not merely shorter. Do not require manual code transcription, disable paste or substitute an inaccessible CAPTCHA. This informative guidance does not certify a native flow or prescribe Core's proof method.                                              |

The current Microsoft FAQ matters materially: an older official ad hoc SharePoint
article and stale search excerpts describe earlier behavior. The direct current
FAQ is preferred for the October2026 architecture/rollout claim. No Microsoft
tenant was inspected, so this note does not assert whether a particular tenant's
rollout is finished. Its public page body was readable despite the generic
documentation shell's authorization notice.

Box/Submittable do not make B automatically stronger assurance, and Microsoft's
option does not make A automatically safer or simpler to implement. Both need
actual authentication, authorization and recovery. The comparators illustrate
the user-facing tradeoff; they are not evidence of measured Asym preference.

## Practical alternatives and recommendation

| Option                                                                               | User experience                                                                                                       | Benefit                                                                                                                                          | Cost or limitation                                                                                                                                                                          |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Named recipient confirms scoped reading without full enrollment; recommended** | Eligible outsider authenticates through a native recipient context; current compatible signed-in proof can be reused. | Avoids making a bounded reading need depend on broader account onboarding. The grant can remain limited to the source-approved document/actions. | Adds a recipient-proof/recovery branch and careful continuity for expired proof, wrong account, changed contact and revoked access. It must be qualified; there is no no-identity shortcut. |
| **B — Already qualified signed-in Asym context only**                                | Reader uses an already established permitted Asym context; no new lightweight outward reader lane.                    | Smaller access-model increment and reuse of the actual existing qualified sign-in/account lifecycle.                                             | An otherwise permitted outsider without that context cannot use this route. Separate enrollment or another delivery route is available only if already independently authorized.            |

These are product alternatives, not two new tenant modes or a demand for a
settings matrix. The selected access model still consumes current source and
tenant restrictions. It does not offer a source override, force every ordinary
document to be shareable or turn File Manager into a general guest portal.

Transferable anyone/bearer links were considered and rejected as the comparison
for this question: they are not a simple compatible substitute for the current
private source/identity baseline and would require a broader policy amendment.
Microsoft and Box support some such links, but that does not make them an
available Core alternative. Copying a reference link must never imply public
access or a new recipient grant.

## Scope and excellent small UX

The meaningful ordinary action is source-qualified **Share with a named person**
or the existing source-specific equivalent, surfaced from the document context.
The review makes the actual recipient, version/currentness rule, actions and end
understandable. The source supplies known context; avoid another governance form
asking staff to re-enter already authoritative facts. A maintainer's global
storage rights do not enable the action when source sharing authority is absent.

For the recipient, use a clear protected-entry/confirmation path and return to
the intended document afterward. If a code is used, explain its destination only
where safe, support whole-code paste/autofill and preserve context across mobile
email/browser switching. Reuse sufficient current proof when the owner permits;
do not force redundant challenges or sign-in for its own sake. Confirmation of
mailbox control is not legal identity, organizational representation or consent.

An authenticated native guest/recipient context can have durable scoped identity
facts without being an enrolled staff, donor, missionary or applicant account.
Do not promise absence of records, force a Party or add a second identity system.
Q01's collection proof mechanism can be reused only after explicit outbound
source/P3/P12 qualification; a previous collection session is not a read grant.

Preserve actual source capability distinctions: preview, original download,
print/export, share again, review and comment are different actions. Read-only
does not imply no copying is possible; even a preview can be photographed.
Unsupported/unsafe preview has honest availability and an actually qualified
remedy, not automatic original download or an external viewer. No ambient folder,
other-version, other-use, request-history or search entitlement follows.

Show available/expired/revoked/unavailable safely and offer a capable source help
route where permitted. Repairing proof, replacing a lost entry credential or
retrying a failed message does not lengthen access, change the recipient, adopt
a newer version or revive a revoked share. Current source eligibility still
governs protected metadata and every original/rendition read. Source withdrawal
or access revocation stops new unauthorized delivery, not already received bytes.

The question must not silently inherit a 7/30/60-day period, a new notification
default, reminder, renewal, editable collaboration, email reply ingestion or
mandatory read acknowledgement. Any necessary invitation/proof message needs
its exact source/P17/P6 authority; Q20/Q31/Q35/Q40 cannot be relabeled. This
research sends nothing and establishes no automatic message policy.

## Complete affected-journey checklist

These are obligations for the eventual chosen-answer review and native proof,
not claims that the feature exists today.

| #   | Actor/situation                                                    | Required distinction under A/B                                                                                                                                              |
| --- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| J01 | Staff can read a file but cannot share it for this purpose         | Reading/uploader/admin/folder rights do not create sharing power; safe unavailable action.                                                                                  |
| J02 | Authorized staff selects an eligible ordinary document             | Actual source supplies recipient eligibility, exact version/currentness rule, actions and finite end; no arbitrary share-anything command.                                  |
| J03 | Named external reader has no enrolled account                      | A permits qualified native authentication/confirmation; B requires an independently established permitted context and offers no fake shortcut.                              |
| J04 | Intended reader already has suitable current signed-in proof       | Reuse it only if actual source mapping/assurance permits; no needless repeated code.                                                                                        |
| J05 | Browser is signed in as a different user or tenant                 | Do not treat email-looking similarity or stale session as proof. Offer a safe correct-context path without revealing private content.                                       |
| J06 | Same address is a shared/reassigned mailbox or alias               | Meet actual intended-recipient/assurance rules; mailbox control is not a real-world identity/representation guarantee.                                                      |
| J07 | Person receives forwarded link                                     | Link possession alone does not admit a different reader or expose protected titles/thumbnails.                                                                              |
| J08 | Email/security scanner follows entry automatically                 | No protected retrieval or source action from an unconfirmed automated visit; retain scanner-safe existing doorway semantics.                                                |
| J09 | Staff enters wrong recipient or changes selection before admission | Validate current source-qualified recipient; preserve allowed input and show meaningful consequences, no hidden retargeting.                                                |
| J10 | Wrong recipient is discovered after admission                      | Actual revoke/restrict/correct source remedy; prior email/read facts remain, no recall or silent destination replacement.                                                   |
| J11 | Limited reader views the permitted version                         | Only authorized source view/actions appear; no folder/Party/history/other-use directory.                                                                                    |
| J12 | Original download is not authorized or preview is unavailable      | Read-share existence does not manufacture Download permission or external-viewer fallback.                                                                                  |
| J13 | Source document gets a new version                                 | Follow the share's actual owner-qualified version rule; no silent replacement, inherited approval or accidental broader historical read.                                    |
| J14 | Document is moved or renamed                                       | Preserve source identity/reference while applying current metadata-disclosure rules; no access transfer through organization.                                               |
| J15 | Recipient proof/session expires while share remains valid          | Re-establish only the required proof under current permission; do not restart the share's clock.                                                                            |
| J16 | Share expires or is revoked while session remains valid            | Session cannot keep the share alive; protect every later metadata/byte action.                                                                                              |
| J17 | Source withdraws or restricts the underlying document              | Current source restriction wins for affected delivery; no guest/authenticated-account grandfathering.                                                                       |
| J18 | Recipient asks for another person or new document                  | Actual separate source decision needed; no forward/share-again power implied by reading.                                                                                    |
| J19 | Several source uses point to identical bytes                       | Sharing one use does not reveal the others, merge meaning or grant their rights.                                                                                            |
| J20 | Official donor/finance/Support/care/resource document is selected  | Its stronger/exclusive owner lane remains; ordinary share cannot bypass it.                                                                                                 |
| J21 | Participant has prior request-only proof/access                    | Q01 collection eligibility is not outbound reading authority; permitted proof reuse is separate from the new grant.                                                         |
| J22 | Access-admission response or invitation is lost                    | Recover original source result and exact message evidence; no duplicate grant, new identity or clock reset.                                                                 |
| J23 | Code/invitation delayed, blocked or delivery uncertain             | Honest status and capable existing recovery; no public-link downgrade or claim delivered/read.                                                                              |
| J24 | Low bandwidth and mobile email/browser switching                   | Keep safe context, paste/autofill, meaningful retry and actual time limits visible without repeated re-entry.                                                               |
| J25 | Keyboard/AT/zoom/RTL/long names                                    | Authentication and document view remain operable, labeled and readable; no manual-transcription-only code or inaccessible CAPTCHA shortcut.                                 |
| J26 | Staff or recipient permissions change during view/read             | Current exact source/identity checks at all protected doors, including range/conditional/cache paths; discard stale cross-context results.                                  |
| J27 | Staff checks who received/read the document                        | Distinguish admitted access, message state, authorized transport and human understanding; avoid a fake read receipt.                                                        |
| J28 | Existing account-only route is unavailable                         | B is an honest limitation, not a prompt to grant a broader role, invent enrollment or download-and-email outside policy. A still needs a proved capable native source path. |
| J29 | Administrator reviews/ends recipient access                        | Uses actual source/current identity governance, not global storage power or a new audience platform. Other independently lawful contexts remain separate.                   |
| J30 | Legacy/restore/old link reappears                                  | Preserve later revocation/restrictions and exact original purpose/version/end; restored bytes or an identity record do not restore permission.                              |

## Implementation consequence in plain language

A requires a real source record of what was shared, with whom, for which purpose,
under which reading actions and end; a qualified native recipient authentication
path; current source checks on all reading surfaces; honest access/message
history; and actual expiry/revocation/recovery. It should reuse current identity,
source, custody and communication mechanisms when their semantics qualify.
Engineering must prove those seams, not create another account system because
a standalone sharing demo is easier to build.

B still needs exact source share authority, recipient binding, reading boundaries
and safe source-aware links. It removes this new lightweight recipient branch;
it does not eliminate authorization, versioning, revocation or recovery work.
Neither choice is proof that existing helpers already implement the complete lane.

The selected answer's adversarial stage must close exact eligible-source scope,
proof and current signed-in reuse, invitation/confirmation boundaries, version/
action/end and source restriction, every private metadata/byte door, wrong-recipient
and lost-response recovery, finite work/cost budgets, native role/race/restore
proof and composed recipient/staff comprehension. Quantitative periods must be
source-qualified deliberately, not copied from a vendor or earlier request lane.

## Evidence limits and stage

No authenticated Microsoft/Box/Submittable account was exercised; no source
documents were shared, private bytes fetched, tenant settings changed, new
accounts created or invitations sent. No native identity/RLS/API/provider,
race/replay/restore, browser/AT, cost/load or intended-user tests ran. Benefit
and friction claims remain explicit product reasoning. Current source/native
authority inspection is supplied independently by owner/runtime reviewers.

The root's full Q41 question has not yet been independently reviewed here.
An actual whole-question closure will be appended only after reading the complete
draft and reconciling material findings. Q41 remains unselected and no new term,
ADR or Q42 answer is inferred.

## Final independent whole-question closure — 2026-10-24

I read the complete `work/phase29-q41-question.md`, then reread the entire
reconciled file: status, single decision, A/B table, recommendation, illustration,
all primary evidence, eight governing boundaries, sixteen composed journeys,
current implementation/ratification evidence limits and next-stage scope.
**No unresolved material UX, source-evidence, fairness or journey finding remains
for presenting this researched question.** This actual closure supersedes the
pending whole-question review statement above.

The substantive fairness finding was resolved. B now has a positive steady-state
case: recurring readers already have suitable authenticated contexts and reuse
their established sign-in/recovery lifecycle. Its cost is the missing lightweight
route for an occasional outsider, rather than an implication that B violates the
founder's baseline. A remains a reasoned recommendation with additional native
identity/admission/recovery work, not a measured universal preference or free
extension of current sign-in.

The illustration is now a concrete equipment-inventory PDF, expressly assuming
actual source authorization and making no observed-ministry claim. The question
keeps no compulsory full signup distinct from no authenticated identity. A's
reader uses a qualified native limited context; B's account context still needs
current source rights. Existing proof reuse is allowed only where qualified;
mailbox control is not legal identity, representation or an outbound grant.
No Party/donor profile, broader membership, general guest role or parallel
authentication system is created by wording alone.

I independently opened the root's exact additional
[Box Inviting Collaborators page](https://support.box.com/hc/en-us/articles/360043696854-Inviting-Collaborators).
It supports the signup and external-indicator statements. Its single-file
Editor-first behavior is expressly not imported. The Microsoft March2026 OTP
and October7,2026 transition FAQ claims match the fresh direct reads: continuing
Entra OTP and guest records must not be confused with older ad hoc sharing or
anonymous possession. No particular tenant rollout, authenticated vendor trial
or actual Core reader experience is asserted.

Scope remains one admission choice, not whether sharing exists. Q01 collection
proof is precedent only; Q02's purpose/no-drive boundary and stronger document
owners remain intact. Version/currentness rule, reading actions, finite end,
revocation and every private read are source-qualified; no universal duration,
download default, bearer access, reshare, notification default or second product
question is silently selected. A source-approved recovery must actually work,
and cannot become public bytes, caller-chosen new recipient, another grant or
an access-clock reset. The corrected live comparison is explicitly historical
live4e31→c541, not a claimed local→live/deployed equivalence.

This note's thirty detailed journeys are covered by the composed question and
its linked research as follows:

| Detailed journeys                                                                                                       | Root question coverage                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| J01–J02/J09–J10 — current sharing power, exact scope and recipient mistakes                                             | Boundaries1–4/6–7; staff/admin, confirmation-delay and expiry/restriction rows; deliberate issuance illustration.                                         |
| J03–J08/J21/J28 — no enrollment, existing/wrong proof, mailbox identity, forwarding/scanner and account-only limitation | A/B and example; boundaries2–3/5/7; outside-reader, existing-account, wrong-context, forwarded-invitation and returning-reader rows.                      |
| J11–J14/J18–J20 — version/use, limited reading actions, no other contexts, changed document and specialist lanes        | Boundaries4/6; source-scope review, unavailable-preview, specialist-document and unrelated-portal rows. No new version/download policy is inferred.       |
| J15–J17/J22–J23/J27 — proof versus permission expiry, withdrawal, source/message recovery and truthful access evidence  | Example; boundaries5–8; delay, returning-reader, expiry and duplicate/lost-response rows. No read receipt or recall promise.                              |
| J24–J26/J29–J30 — mobile, AT, international input, current reads, administration and stale/restore contexts             | Boundaries3–7; admin, wrong-context, mobile, AT, international, expiry and duplicate rows; linked detailed checklist and selected-answer proof direction. |

Question readiness does not mean the later native shared-admission/source/profile
qualification has passed. No identity/RLS/API, provider, browser/AT, cost/load,
race/replay/restore or intended-user test was executed here. Exact repository
runtime and ratification preservation assertions remain attributed to root and
the independent owner/runtime inspection, not an independently repeated live
census by this researcher.

Only this assigned note was edited, and its write is closed for copying subject
to readback of later material amendments. Q41 remains unselected, with no ADR,
new glossary term, implementation, invitation or Q42 answer inferred.
