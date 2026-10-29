# Q04 — download the submitted file

**Status:** Historical researched question, prepared 2026-10-20. Conrad
selected and then ratified A with the complete required amendment package on
2026-10-20. Q01–Q04 are ratified grooming intent. No formal specification,
implementation or release is implied.

## Situation and decision

A recipient can inspect the file they submitted in Asym and correct a pending
mistake. They want to save the exact file Asym received, perhaps to keep a copy
or use their preferred document software. These are possible uses, not measured
ministry demand.

**For the ordinary native private-document request, should the currently
authorized recipient also have a deliberate Download submitted file action,
or should this ordinary experience remain preview-only?**

Assume current permitted request access. This question does not decide when
access ends, which older submissions remain visible or what happens after
closure. It concerns the exact currently source-authorized own submission
occurrence/member. A request can contain several such members; this is not a
universal one-file or latest-file pointer.

Here, original means the unchanged received bytes for that specific submission,
including a corrected submission. It does not mean the first file sent before
corrections. A converted preview, redacted copy, accessible alternative, generated
application summary and official donor receipt are different artifacts. Use
**Download submitted file** as the proposed recipient label to avoid that
original-versus-first-version ambiguity.

## Practical options

| Option                                              | Recipient experience                                                                                                                                                                                                                      | Benefit and cost                                                                                                                                                                                                                            |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Allow Download submitted file (recommended)** | Provide a separate deliberate action alongside View for that exact own submission, while current permission and independently qualified original delivery allow it. Ordinary eligible downloads do not require staff unlocking each file. | Useful exact-copy access within the task, including use in the recipient's preferred software. Adds original-byte disclosure and device copies that Asym cannot recall. Requires its own qualified serving/safety boundary.                 |
| **B — Keep ordinary requests preview-only**         | Keep confirmation, status, qualified View and eligible correction. Original copies require a separately authorized source delivery/help route.                                                                                            | Narrower routine original disclosure and fewer recipient actions. A person needing the file itself must retain their local copy or seek source assistance; preview omissions and accessibility limitations still need a real recovery path. |

Both preserve source-specific restrictions and existing qualified download
rights in other domains. Neither implies history, longer access, public links,
other recipients' or staff files, bulk ZIP export, deletion, synchronization or
a personal drive. Preview-only cannot guarantee that displayed information
cannot be copied.

## Recommendation

Choose **A**, as a narrow default capability of this ordinary request profile.
An explicit file-copy action belongs within the relevant Asym task and does
not require general storage or a permanent archive. This is a product judgment;
no quantified staff-time or participant benefit is claimed.

The tradeoff is substantive. Originals may contain comments, hidden sheets,
metadata or active content that the qualified preview does not expose. A clean
scan alone is neither disclosure authorization nor proof of harmless content.
Original delivery needs its own permitted profile and current authority. Once
bytes have been downloaded, ending access cannot reliably recall that device
copy. No disclaimer checkbox should substitute for these boundaries.

The action should be visible by keyboard and touch, labelled with its exact
file context and useful type/size information. It must not be hover-only or
require opening the viewer first. Do not silently download on page entry,
preview failure or retry. If original delivery is unavailable, explain the
permitted safe next step without exposing restricted details.

## Research and repository authority

Local and live GitHub develop were rechecked at
`3d85897ebf1515008ef5c676b1c58a15422fb9ab`. The ratified
[Q02 ADR](../docs/adr/0002-purpose-bound-files-and-submission-readback.md) and
[Q03 ADR](../docs/adr/0003-recipient-corrections-and-exact-review-lineage.md)
explicitly reserve original downloads as a separate capability. Q01 confirmation
and Q02/Q03 viewing/correction do not infer that permission.

Support's [D32 contract](../../support-hub/docs/adr/0032-broader-attachment-previews-and-source-owned-renditions.md)
already separates Preview and Download original for its qualified staff
sources. That is a useful existing distinction, not a grant to request
recipients. Phase18 official-document and Phase21 evidence retrieval keep their
own source/currentness rules under either Q04 answer. Current runtime provides
partial serving patterns, not a qualified native recipient download service.

Official comparators demonstrate different legitimate choices:

- [Submittable's applicant guide](https://submittable.help/en/articles/2814108-how-can-i-download-a-copy-of-my-submission),
  dated 5 February 2026, separately documents a generated PDF submission summary
  and individual submitted-file downloads. It does not prove exact-byte
  immutability or universal historical/post-closure rights.
- [Microsoft file requests](https://support.microsoft.com/en-us/onedrive/create-a-file-request)
  explicitly limit recipients to uploading, excluding folder viewing, editing,
  deletion and downloading through that collection experience. This does not
  define the only valid model for Asym's richer, confirmed request journey.
- [Dropbox's download-disable guidance](https://help.dropbox.com/share/set-link-permissions)
  states that its UI restriction does not prevent saving content by other means.
  Its shared-link product is not the same as File Request; do not import its
  permission bundle or unsupported-preview behavior.

Submittable's separate Original/Current submission-summary downloads are also
not the same as original uploaded-byte download. Its Next application's export
feature is a different edition/capability. These distinctions prevent a false
claim that a summary PDF or historical form export proves the chosen file path.

## Boundaries to pressure-test after the answer

1. Own submission means exact source-authorized actor/recipient/request/member
   lineage, not global uploader ownership, matching mailbox, filename or hash.
2. Download is a distinct current source action. Successful preview is not a
   prerequisite where original delivery is independently qualified, and failed
   preview never creates permission. Unsafe, restricted or unqualified original
   delivery remains blocked even when the recipient supplied the bytes.
3. Return exactly the chosen received version; do not silently substitute a
   newer correction or converted/redacted rendition. Previously corrected
   versions are not exposed by this question.
4. Apply current private authorization and required serving constraints to
   metadata, full/range/conditional/recovery requests. Do not expose reusable
   provider URLs or weaken revocation through caches or saved references.
5. A download attempt, transmitted bytes, completed stream, browser save and
   human reading are different facts. Access evidence must not manufacture
   acceptance, consent, a signature, CRM interaction or verified external custody.
6. It does not reset a deadline/session/retention period, authorize a new
   audience, send email, publish media or create an external Drive integration.
7. Use existing shared private custody and shared Core UI; no new provider,
   account, full file explorer or additional confirmation ritual is implied.
8. Existing P18/P21/P26 and other source-qualified original downloads survive
   either default. B is not a platform-wide prohibition, and A is not a generic
   override of stronger source restrictions.

## Sequencing and evidence limits

Download is a discrete current-access capability. It can be decided before
prior-version history and post-closure continuity without bundling either into
the answer. Those remain separate later questions using the ratified correction
lifecycle. Review-outcome and privacy/disposition branches also retain their
owners; none is silently answered here.

- [Owner-contract research](phase29-q04-owner-research.md)
- [Current runtime and source-boundary research](phase29-q04-runtime-research.md)
- [Official comparative research](phase29-q04-comparative-research.md)

At question preparation, no new tests, authenticated comparator tests, real
downloads, provider changes, private data inspection or implementation occurred.
No new ADR/glossary term was established before the answer. These dated
preparation facts do not describe the later review. Formal specification remains
gated on `/to-prd`; tickets on `/to-issues`.

## Historical founder answer and completed review — before ratification, 2026-10-20

Conrad chose **A — Allow Download submitted file**, asking for deeply researched
modern practices and the best UX/UI. The
[completed adversarial review](phase29-q04-adversarial-review.md) recommends
Accept with required amendments and records the corrected decision,
Q04-C01–C20, Q04-P01–P24 and eight operational controls. The
[feature ADR](../docs/adr/0004-submitted-original-download-and-current-source-authority.md)
and Submitted Original glossary term record this selection without treating
the detailed amendment package as ratified. The review includes ten newly
executed existing mocked receipt tests, explicitly limited to that older seam.
No new feature, provider or formal publication occurred. Q05 is not selected
or asked by this record.

## Ratification — 2026-10-20

Conrad subsequently ratified A and all required amendments, including the
corrected decision, Q04-C01–C20, Q04-P01–P24 and eight operational controls.
The preceding selection/review account is dated provenance. The ADR and
completed review now record adoption; no further history/duration choice or
runtime/publication authority is inferred.
