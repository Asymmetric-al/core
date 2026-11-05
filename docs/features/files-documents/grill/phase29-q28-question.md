# Phase 29 Q28 — Staff reuse of existing evidence

**Status:** Historical researched question prepared 2026-10-22, Asia/Bangkok.
Conrad selected Q28 A and fully ratified every required amendment: allow
authorized staff to add existing evidence under the complete source, provenance,
review, recovery and privacy boundaries. Q01–Q28 and twenty-one definitions
are ratified grooming intent. No implementation or activation follows.

## Historical question and alternatives

**When a tenant already holds a document that is eligible for a new ordinary
Document Request Item, may authorized staff add it as staff-supplied evidence
without asking the participant to confirm that reuse?**

Both options reuse the existing qualified file without requiring a download
and re-upload. Both preserve current source permissions, exact evidence,
truthful attribution and Q21's deliberate staff acceptance. This is a choice
about who must act before reused evidence enters the new item's review, not
whether Core should support file reuse.

| Option                                                                | Practical behavior                                                                                                                                                                                                                                                    | Benefit                                                                                                                                                    | Cost and boundary                                                                                                                                                                                                         |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Allow authorized staff to add existing evidence (recommended)** | In the request item, staff choose an eligible existing file and deliberately add its exact version. Core records it as supplied by staff for this item. It can proceed to normal staff review without a new participant confirmation, unless the source requires one. | Avoids asking someone to return solely to approve reuse of an already-held suitable document. Supports assisted work while keeping accountability visible. | Staff must choose the right person, purpose and version. Reuse eligibility and suitability require real source checks and review; possession or read access alone is insufficient.                                        |
| **B — Require participant confirmation before reuse enters review**   | Staff propose an eligible exact file. The intended participant confirms its use for this new item through an authorized presentation before it becomes submitted evidence. No re-upload is required.                                                                  | Gives the participant a direct opportunity to verify that the proposed document is appropriate and still represents them.                                  | Adds a response dependency, particularly when access has ended or connectivity is poor. It needs an authorized way to present the proposal; it cannot borrow access to the old request or silently revive expired access. |

**Recommend A.** Require participant action when their statement, consent,
signature or source-specific affirmation is actually part of the requirement.
For ordinary file evidence, allow accountable staff assistance without a
universal extra confirmation. Staff can still choose to request fresh evidence
or participant confirmation where the source supports it. This adds no general
consent engine, mandatory second reviewer or new global policy editor.

B is strongest where the participant's current endorsement is materially useful
even when not otherwise required. A carries a real wrong-document and outdated-
information risk; independent acceptance, exact provenance and qualified reuse
are necessary safeguards. Neither primary documentation nor Asym user research
establishes a universally optimal default. A is a bounded product judgment.

## Concrete example and user journeys

Illustrative scenario, not an observed ministry workflow: a tenant already holds
Nora's certificate. A new ordinary request asks for that same certificate, and
its source permits reuse of this exact version for that purpose.

- **Staff adding evidence:** Elena opens the item, chooses **Add existing file**,
  identifies the eligible version in context and selects **Add to this item**.
  Show the person/item, useful version/date and permitted provenance before
  commitment. Do not require a download, second upload, long explanation or
  unrelated File Manager setup. No automatic attachment based on a matching name.
- **Reviewing staff:** show **Added by staff · Awaiting review**, then the normal
  exact-item acceptance action. Existing approval from another request does not
  transfer. The same person may supply and review only where existing source
  permissions and separation-of-duties rules allow; no universal second actor.
- **Participant under A:** no confirmation solely because the file was reused.
  Where the source authorizes disclosure, explain that staff added evidence and
  whether anything remains for the participant. Do not label it **You submitted**
  or imply that it is their attestation. Keep a source-owned correction/help path.
- **Participant under B or a real affirmation requirement:** show only the
  authorized exact proposed material and its purpose, with a clear confirmation
  action. A prior request's access is not inherited. Unsupported or inaccessible
  presentation requires a qualified alternative, not blind confirmation.
- **Expired access:** independently authorized staff work may remain possible.
  This action neither renews participant access nor creates completed-read rights.
  A genuine target intake prohibition, frozen evidence or closed work still wins.
- **Correction or concurrent upload:** if the participant or another staff member
  changes the item's evidence while selection is open, do not silently overwrite
  it or switch versions. Preserve context and show the current source outcome
  with a safe next action. Acceptance and correction retain Q03/Q21 boundaries.
- **Missing eligibility or unavailable file:** explain the permitted next step
  without exposing a hidden file, protected source or duplicate match. Do not
  turn a forbidden reuse into permission by asking staff to re-upload the bytes.
- **Lost response or low bandwidth:** recover the same durable add operation and
  distinguish pending, failed and committed outcomes. Preserve selected context
  and focus; no duplicate evidence, false success or unapproved offline cache.

Use the existing Base UI/base-maia interaction patterns, keyboard and assistive-
technology support, persistent status and localized dates. Names remain display
labels, never identity matches. This decision creates no new name/address form,
account requirement, transport, bulk action, automated matching or generic drive.

## Research and strongest counterevidence

Primary documentation checked 2026-10-22 supports assisted work and transparent
attribution, with meaningful limits. It does not establish permission for
arbitrary cross-purpose reuse or an exemption from consent requirements.

| Primary source                                                                                                                                                                    | Verified pattern                                                                                                                                                                                      | Application and limit for Core                                                                                                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [FileInvite — Accessing a contact's client portal](https://help.fileinvite.com/accessing-a-contacts-clients-portal), current undated guide                                        | Documents staff working on a contact's requests and uploading a form received outside the portal. It does not describe a separate fresh-confirmation step for that example.                           | Supports assisted intake as a real comparable workflow. It does not prove broad reuse authority or consent. Core must not copy sender-as-authority, shared portal URLs or participant impersonation.                                                |
| [Submittable Next — Edit submitted applications](https://next.support.submittable.com/hc/en-us/articles/37188000161559-Edit-Submitted-Applications), updated September 17, 2026   | Permission-gated administrator edits are available for small fixes; the applicant and staff can see edited fields, and edit history is available. The guide generally prefers applicant-led revision. | Supports both accountable assistance and the strongest B argument. Core keeps immutable evidence and actual actor attribution rather than copying editable application fields, broad administrator powers, review rounds or automatic email policy. |
| [Submittable — Open for editing and edit submission responses](https://submittable.help/en/articles/15850735-open-for-editing-edit-submission-responses), July 6, 2026            | Distinguishes administrator fixes from participant revisions and recommends participant editing for sensitive or complicated changes.                                                                 | Fresh participant action is appropriate when its substantive purpose requires it. This does not establish a universal confirmation for ordinary previously held evidence; the separate product editions' history behavior must not be conflated.    |
| [W3C — Redundant entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html) and [status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) | The first addresses repeat entry within the same process, with limits including different-method document uploads; the second addresses programmatically available status changes.                    | Use the general interaction lesson cautiously and qualify actual status accessibility. WCAG does not require cross-request file reuse or authorize staff substitution or private access.                                                            |

These are product and accessibility precedents, not measured reductions in
ministry workload or proof of an Asym implementation. No invented legal rule,
response-time improvement or staff usage frequency supports the recommendation.

## Repository reconciliation and shared boundaries

The [owner research](phase29-q28-owner-research.md),
[runtime research](phase29-q28-runtime-research.md) and
[comparative research](phase29-q28-comparative-research.md) retain precise anchors.

1. **Reuse is already required; actor policy is open.** The founder brief and
   [Q02](../docs/adr/0002-purpose-bound-files-and-submission-readback.md) require
   coherent staff discovery and independently admitted typed uses of shared
   bytes. [Q13](../docs/adr/0013-source-authorized-fresh-unfinished-access.md)
   permits qualified custody reuse by a new authorized deliberate submission
   under its source contract. Neither chooses staff-supplied evidence versus
   fresh participant affirmation. A would need an explicit ordinary-source
   staff-admission amendment; it cannot be treated as an existing recipient
   submission or an authority already granted by custody reuse. Existing P23/P28 resource publication and
   curation are separate settled scopes, not replacements for this decision.
2. **Authority belongs to the relevant sources.** Discovery, reading, reuse and
   target evidence admission are distinct. Require the current target's actual
   staff-originating admission authority and the source's permission for that
   use, including tenant, subject, purpose and restrictions. Read/reviewer/staff
   labels, file ownership, equal bytes or service credentials are insufficient.
   No new general file permission or tenant-crossing path follows.
3. **Attribution is truthful and narrow.** Preserve original provenance and
   exact immutable bytes; create only the newly authorized use with actual staff
   actor and admission time. Do not invent a recipient upload, confirmation,
   signature, new original receipt time or transferred approval. Source-specific
   certification, consent and specialist financial/official/publication rules
   remain authoritative. This is not permission to change participant statements.
4. **Readback does not expand by association.** Q02/Q04/Q05 own-submission
   readback does not automatically cover staff-supplied evidence. New participant
   visibility, original-source metadata, history and downloads require their
   own source authorization. B's proposal presentation is subject to the same
   restriction. Neither option creates a participant-wide private file library.
5. **Review and fulfillment remain distinct.**
   [Q21](../docs/adr/0021-staff-acceptance-of-ordinary-requested-items.md) requires
   deliberate acceptance of the exact new item/evidence basis;
   [Q22](../docs/adr/0022-source-owned-request-fulfillment.md) keeps
   fulfillment with the source's full requirement predicate. Current technical
   qualification and all other required actions remain. No accepted/frozen
   overwrite, reopened completed request, retention reset or participant-clock
   extension is authorized. Participant expiry alone is not a ban on staff work.
6. **Reuse must survive ordinary failure.** Recheck source/target authorization,
   exact version and current item state at the owning mutation boundary. Preserve
   durable effect identity, source history and honest replay; a selected file
   becoming restricted cannot be silently replaced. Source processing, optional
   messages and UI refresh remain separate outcomes. Q26/Q27 apply only to their
   exact admitted meanings; this question selects no additional notice policy.
7. **Keep the feature small.** A contextual reuse action is sufficient. Do not
   add automatic document matching, a broad migration/backfill, shared-drive
   synchronization, new workflow engine or mandatory extra approval. The chosen
   answer's review must resolve its native evidence/readback/event bindings
   explicitly rather than inheriting participant-origin behavior by accident.

## Current behavior and evidence limits

The bounded source inspection found adjacent asset metadata, CMS Media and
attachment surfaces, not a qualified native private-evidence reuse command.
CMS Media is image-specific; the legacy asset helper's Cloudinary URL/free-form
purpose, public editor storage URLs and Support metadata stubs cannot establish
private reuse authority, provenance or source acceptance. Their existence is
neither proof of safety nor a reason to abandon the promised reuse experience.

Local HEAD remains `3d85897ebf1515008ef5c676b1c58a15422fb9ab`; fresh live develop
remains `7df55820eee8a1e0076dea489f3836e8d15d7c69`, with no new drift or pull.
Source and owner inspection, primary research and independent question checks
are planning evidence. No deployed role/RLS, provider, browser/AT, concurrency
or intended-user tests were performed; no native runtime qualification is claimed.

## Historical preparation scope and snapshot

Q01–Q27 are fully ratified; Q28 is a researched A/B decision with no selected
answer. No feature ADR-0028 or glossary term is created. The selected answer
receives the full adversarial review before amendment ratification. The wider
File Manager, resource, custody and disposition scope remains unfinished.

Formal owner/OpenSpec publication remains `/to-prd`; tickets remain `/to-issues`.
This question changes no implementation, schema, permissions or provider state.

## Historical founder answer and review — before ratification, 2026-10-22

Conrad selected **A — Allow authorized staff to add existing evidence**, asking
for deep research, the full adversarial review, excellent UX/UI, exact required
amendments, flexibility and no overengineering. The
[full review](phase29-q28-adversarial-review.md) recommends **Accept with required
amendments**, with the exact corrected decision, Q28-C01–C12, Q28-P01–P24,
seventeen journeys, fourteen lifecycle distinctions and six controls. The
[feature ADR](../docs/adr/0028-staff-supplied-existing-document-evidence.md)
records selected/reviewed status. The complete amendment package awaits ratification.

The necessary source amendment is attributable staff-origin evidence admission,
additive exact evidence membership and real withdrawal of mistaken unaccepted
staff contributions. Preserve participant assertions/readback, source/custody
authority, independent Q21 acceptance and Q22 fulfillment. Qualified replacement
failure before admission commits neither half; later Checking failure preserves
committed lineage without predecessor revival. Native staff actionability is
explicitly mapped to existing Q24/Q27 work/opt-in notice rules; no new notice
default. Feedback directs an actually authorized resolver, not unavailable
participant own-submission correction.

Three independent reviews cover owners, runtime/data/races and UX/primary
comparisons. Their material findings are resolved in the consolidated clauses.
One glossary term, Staff-supplied Document Evidence, captures the distinct act;
the twenty previous definitions remain unchanged. Q01–Q27 are ratified; Q28 A
is selected and reviewed, full amendments pending. Q29 is not asked or selected.
Native implementation/SQL/RLS/race/provider/browser/AT/user qualification and
formal source/OpenSpec publication are not implied.

## Full ratification — 2026-10-22

Conrad fully ratified Q28 A and all required amendments: the corrected decision,
Q28-C01–C12, Q28-P01–P24, seventeen journeys, fourteen lifecycle distinctions,
six controls and Staff-supplied Document Evidence definition. Earlier pending
question/review wording is dated provenance; ADR-0028 and the full review record
current adoption. Q01–Q28 and twenty-one definitions are ratified. Q29's answer,
native qualification, implementation and publication are not inferred.
