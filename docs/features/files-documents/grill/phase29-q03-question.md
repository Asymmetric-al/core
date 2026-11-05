# Q03 — correcting a submitted file

**Status:** Historical question prepared 2026-10-20. Conrad selected A and
subsequently ratified the completed required amendments on 2026-10-20. Q01 and Q02 remain ratified. The original options below preserve
the decision context, not a new formal specification or ticket.

## The situation and decision

A recipient opens the file they submitted and realizes it is the wrong scan.
The particular requested item has not been accepted or closed, and its source
still permits further submissions. Should they be able to **Send corrected
file** immediately, or must staff open every correction first?

This completes the practical recovery path after Q02's View my submitted file.
It decides who may initiate correction for the ordinary new native private
document-request profile. Preservation of earlier versions and source-owned
acceptance are already required; they are not alternatives to vote on.

## Practical options

| Option                                                               | What the recipient experiences                                                                                                                                                                                                                     | Benefits and costs                                                                                                                                                   |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Let the recipient correct a pending submission (recommended)** | While this particular item remains unaccepted and open to correction under current source rules, use Send corrected file in the same request. After acceptance, an explicit freeze or closure, follow the source-owned correction/reopening route. | Avoids staff intervention for an ordinary mistake. Requires clear new-version status and protection against staff reviewing an outdated candidate.                   |
| **B — Staff opens every correction**                                 | After receipt, the recipient asks the responsible staff member to permit another submission, even if the item is still pending.                                                                                                                    | Provides a deliberate stable submission boundary, useful for formal review processes. Adds waiting and staff work; correction/version history still has to be built. |

Both preserve exact received bytes, current authorization and existing source
restrictions. Neither grants deletion, rewrites completed decisions, silently
extends deadlines or permits changing another recipient's submission.

## Recommendation

Choose **A** for ordinary native requests. It makes an obvious mistake
recoverable where the work is happening, without turning Asym into a drive or
requiring another workflow product. The expected reduction in waiting and
staff exchanges is a product judgment to validate with participants, not a
measured result.

The new file is another attributable submission linked to the one being
corrected. The prior submission and decisions remain intact under their
source's access and retention rules. Staff see which exact version they are
considering and when a correction has arrived. A decision on one file cannot
silently approve a different file.

An overall request remaining open is insufficient: one item may already be
accepted while other items remain outstanding. Merely opening a file to review
it is not an approval or an automatic lock. Any genuine source freeze must be
explicit and understandable to the participant.

## What current evidence establishes

Local and live GitHub develop were rechecked at
`3d85897ebf1515008ef5c676b1c58a15422fb9ab`. The founder's Phase29 brief requires
exact-version collaboration, correction, re-review and source-owned
requirement satisfaction. The
[Workflow Studio experience contract](../../../prds/workflow-studio/01-product-and-experience.md)
already requires immutable resubmissions and separates uploaded from accepted.
Its [mutation contract](../../../prds/workflow-studio/04-data-and-api-contracts.md)
requires current authority, exact source revisions and safe retries. These
settle preservation and correctness, not this ordinary initiation policy.

Q02's [ratified ADR](../docs/adr/0002-purpose-bound-files-and-submission-readback.md)
explicitly kept mutation separate from preview. No existing recipient correction
journey is certified by this research. Source contracts, implementation and
hosted qualification remain distinct evidence layers.

Official products demonstrate a real tradeoff:

- [Dropbox file requests](https://help.dropbox.com/share/received-file-request)
  explicitly permit sending the correct file through the same request after a
  mistake; both files reach the requester. This does not prove a structured
  source-owned revision or acceptance model.
- [Submittable](https://submittable.help/en/articles/904890-how-can-i-edit-my-submission)
  requires the organization to reopen a submitted application for editing,
  where editing requests are permitted; review already underway can be a reason
  to decline. It supports B as a legitimate review model, not a universal
  requirement for every document request.
- [Microsoft file requests](https://support.microsoft.com/en-us/onedrive/create-a-file-request)
  and [Box](https://support.box.com/hc/en-us/articles/360044783734-Box-File-Request-FAQ)
  document filename collision handling. Collision renaming does not establish
  which submission corrects another, nor grant editing/deletion rights.

These are official documentation checks, not authenticated product tests or
evidence of how frequently ministries need correction.

## Consequences to pressure-test after selection

1. Correction is an explicit current source capability. Q01 confirmation and
   Q02 readback do not confer it automatically. Specialized financial,
   application, official-document and publication contracts keep their rules.
2. The user selects the exact submitted item to correct; same filename or digest
   is insufficient. Correcting and adding another supporting file are distinct
   intentions. A new file receives no inherited approval.
3. Choosing a local file or starting transfer changes no accepted submission.
   If correction and a review decision race, the source admits one authoritative
   outcome against its current version. A stale reviewer must see the change;
   a late correction cannot alter a decision that already committed.
4. Received, processing, previewable and accepted remain distinct. Failed
   preview does not prevent an otherwise permitted correction, and failed
   transfer cannot pretend the old submission disappeared. Retries recover the
   same outcome rather than create unintended extra corrections.
5. Existing limits, deadlines, current permission and processing safeguards
   apply. This decision neither renews a session nor resets a due date.
6. Previous versions remain only under appropriate source access/retention.
   No general participant archive, original download or deletion right follows.
   A wrong sensitive upload still needs its source's privacy/disposition route;
   replacement is not a promise to erase it.
7. Use the same request and shared task/custody controls. Do not add a second
   inbox, unconditional email notifications or a full workflow dependency. If
   correction is unavailable, provide the source-approved request/help route
   rather than directing users to email private attachments around the controls.

A broader policy allowing new correction proposals after an item was accepted
while the overall request remains open was considered. It can preserve the old
decision, but adds competing accepted and pending candidates. It is not needed
to solve the ordinary pre-decision wrong-file case and is not bundled into A.
Original downloads and access after closure remain separate later questions.

## Research and stage

- [Owner-contract evidence](phase29-q03-owner-research.md)
- [Current code and specialized-owner evidence](phase29-q03-runtime-research.md)
- [Official comparative evidence](phase29-q03-comparative-research.md)

At question preparation, no new ADR or glossary term had been established for
the then-unselected Q03 choice. The subsequent answer and completed review are
recorded below, followed by explicit founder ratification. Formal specification remains gated on `/to-prd`, and tickets on
`/to-issues`; no product code, providers, permissions or GitHub were changed.

## Subsequent selection and review — 2026-10-20

Conrad selected **A — Let recipients correct pending submissions**, emphasizing
an excellent, clear and easy UX/UI journey. The
[completed adversarial review](phase29-q03-adversarial-review.md) recommends
Accept with required amendments, including an explicit source-admission fence,
no silent predecessor revival, exact multi-file/use preservation and truthful
recipient/reviewer recovery. The
[feature ADR](../docs/adr/0003-recipient-corrections-and-exact-review-lineage.md)
and [decision log](decision-log.md) now record A and the full required
amendment package as explicitly ratified. The next question remains a separate
founder decision.

## Subsequent ratification — 2026-10-20

Conrad ratified A with all required amendments and asked to continue. The
[review ratification record](phase29-q03-adversarial-review.md#founder-ratification--2026-10-20)
and feature ADR own the accepted wording. Earlier alternatives remain historical
context, not additional selected permissions.
