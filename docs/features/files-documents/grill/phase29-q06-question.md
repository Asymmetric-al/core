# Q06 — recipient access after normal successful completion

**Status:** Historical researched question, prepared 2026-10-20. Conrad
selected and then ratified A with the complete required amendment package on
2026-10-20. Q01–Q06 are ratified grooming intent. No duration, anchor, renewal
policy, formal specification or implementation is selected by this record.

## Situation and one decision

The ordinary request now has ratified confirmation, current-file preview,
eligible corrections, current-original download and concise submission history.
Those intentions do not yet specify what normal completion does to recipient
readback. They also do not establish working runtime.

Consider an illustrative case: the requesting source confirms that Alex's
document request has been successfully fulfilled. Alex no longer needs to
send or correct files, but returns to check the outcome or save a permitted
copy of the current submitted file. Assume Alex's source authority has not
otherwise expired or been revoked.

**When the source marks an ordinary private-document request successfully
fulfilled, should the recipient retain read-only access to current files and
submission history, see only confirmation/status/history, or lose protected
request access at that point?**

This concerns **normal source-confirmed fulfillment**. Merely uploading a file,
finishing a scan, reaching a due date, closing a tab or resolving a staff task
does not establish that outcome. It is not a decision about cancellation,
withdrawal, final rejection, security revocation or privacy restriction.

## Practical options

| Option                                                        | After normal successful completion                                                                                                                                                                                                                                              | Benefit and cost                                                                                                                                                                                                                            |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Keep a bounded read-only completed view (recommended)** | Ordinary submission/correction stops. While the source still permits access, keep confirmation/status, Q05's concise history and independently qualified View/Download for current own files. End access at the applicable communicated source deadline or earlier restriction. | Preserves understandable follow-up and lets recipients use the already-selected readback capabilities. Requires continued current authorization and clear expiry/recovery; completion is not an access extension or permanent archive.      |
| **B — Keep confirmation/status/history only**                 | Ordinary submission/correction and file-content reads stop at successful completion. Keep the permitted metadata projection for its remaining source-authorized period.                                                                                                         | Narrows ongoing content exposure while retaining a useful record of the outcome. A recipient needing the current file afterward must use a separately permitted source route or a copy already saved. Metadata remains protected.           |
| **C — End protected request access on completion**            | Stop ordinary submission/correction and protected readback when the source completes the request. A later visit gets only the permitted neutral end-state/help path.                                                                                                            | Minimizes continuing access through this request. Makes later confirmation or file questions depend on another authorized source route and may make an otherwise routine return less useful. Ending access does not delete source evidence. |

All three are ordinary-profile choices. Existing specialist rights, stronger
source restrictions and independently authorized uses retain their own owners.
None exposes superseded files, internal reviews or other recipients' material.

## Recommendation and strongest alternative

Choose **A**. Successful completion should ordinarily make the request
read-only while still-authorized recipients can inspect the result and current
submitted files. That gives the already-selected Q02/Q04/Q05 capabilities a
clear completed state instead of making them disappear solely because the
source finished its work.

This remains task-specific and finite. Completion itself must not create a
new grant, reset a deadline, renew a browser session or guarantee file delivery
through a later safety/privacy restriction. A source-approved finite access
end and its truthful presentation must be settled before activation. **No
number of days is being selected in Q06.** The duration/expiry-start policy is
a separate founder decision once this completed mode is chosen.

B is the strongest narrower alternative: recipients can still verify that
the process finished without ongoing file-content reads. It is a legitimate
choice if routine post-completion copies are not part of the ordinary product.
Its cost is extra effort for a person who needs the current file after work
has ended. We have no measured ministry demand or support-volume evidence
that quantifies that tradeoff.

C is coherent for a tightly ended purpose, but makes ordinary completion behave
like a complete access cutoff even where current source authority would
otherwise remain. A neutral help path cannot replace protected readback.
Security revocation already requires appropriate denial under any option;
it is not a reason to make normal success and revocation the same event.

## What the research establishes

- [Foundant's GLM Applicant Tutorial](https://support.foundant.com/hc/en-us/articles/4479853059991-GLM-Applicant-Tutorial),
  updated 22 April 2026, distinguishes completed/historical requests from work
  requiring action and describes access to submitted forms. It supports a
  meaningful completed experience, but does not prove indefinite access to
  every original attachment or define Asym's access duration.
- [Foundant's Follow Up Submission Logic](https://support.foundant.com/hc/en-us/articles/4411213334935-Follow-Up-Submission-Logic),
  updated 15 December 2025, explicitly shows an applicant viewing a form after
  it was submitted and marked complete. This is completed-form readback within
  a grant lifecycle, not proof of whole-request original-file availability.
- [Dropbox's file-request guidance](https://help.dropbox.com/share/create-file-request),
  updated 15 May 2025, describes closure as stopping further uploads. Its
  uploader collection experience does not establish post-completion recipient
  readback. The useful distinction is that ending intake is a specific effect,
  not a universal storage-deletion or reader-permission rule.
- [Box's File Request FAQ](https://support.box.com/hc/en-us/articles/360044783734-Box-File-Request-FAQ)
  explicitly separates File Request expiry from shared-link settings because
  its request collects files without exposing existing folder content.
  Different permission purposes have different lifecycle rules; do not import
  Box's shared-link defaults or uploader identity model.
- [Microsoft's file-request guidance](https://support.microsoft.com/en-us/onedrive/create-a-file-request)
  says deleting the request link stops further uploads. Because that experience
  is already upload-only, it does not settle which of Asym's existing readback
  actions should continue after successful fulfillment.

These are documented product distinctions, not a universal modern-practice
mandate. Staff archiving, closing public intake and a recipient's current
permission are also different; a comparator's Archive label cannot prove all
three. [Comparative evidence and limitations](phase29-q06-comparative-research.md).

## The clocks and outcomes must stay separate

| Boundary                                         | What it controls                                                                                                                                                                                 |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Source-confirmed successful fulfillment          | The owning source's completed request outcome and end of ordinary recipient submission/correction for this completed mode. It does not manufacture evidence acceptance or other domain outcomes. |
| Submission due date or intake cutoff             | Whether new submission/correction can be admitted under the source's rules. It is not inherently a reading cutoff or proof of successful fulfillment.                                            |
| Recipient access end                             | The source-approved limit on the protected actions it still grants. A session refresh, history view or normal completion cannot silently extend it.                                              |
| Proof challenge or browser session expiry        | Whether the person must complete the qualified entry/proof path again. Valid authentication cannot resurrect an expired/revoked source grant.                                                    |
| Preview rendition or technical delivery lifetime | Availability of a particular qualified representation or transfer, not the source's recipient permission. Recovery still needs current authority.                                                |
| Retention, holds and disposition                 | What the organization must or may retain and dispose of. Retention does not grant the recipient access; access ending does not authorize deletion.                                               |

The final three are engineering/owner distinctions already required by Q01–Q05,
not separate questions being put to the founder here. No universal legal
retention rule, automatic grace period or permanent archive is inferred.

## Recommended UX if A is selected

After the source's actual successful completion, show a calm completed state
with the permitted outcome and **No more files are needed for this request**
where that wording is true. Preserve current qualified file actions and the
small Submission history. Remove ordinary submission/correction affordances;
do not leave a wall of disabled buttons or silently reopen work when the
recipient returns.

Show the actual access-end date/time clearly in the request, using readable
localized wording such as **Access ends [date/time/timezone]**. This is not an
assurance that restrictions cannot end access earlier. Do not invent a
countdown, expiry email or automatic renewal workflow merely for Q06.

A shorter browser session may require the qualified re-entry process. If the
source grant is still valid, return to the permitted completed view. If source
access itself ended, use safe recovery/help without leaking the request or
renewing the grant from possession of the old link.

A current file may independently be restricted, unavailable or unqualified.
Report that state truthfully while preserving any separately allowed status
and history; completion does not make every file safe to deliver. Q05's
history failure rules and Q04's honest download/partial-transfer behavior
continue unchanged.

The same existing request surface should serve the completed mode, using
shared Core controls. No new portal, generic document library, source-role
union, full-account enrollment or archive product is implied.

## Repository reconciliation and next review boundaries

Local and live GitHub develop were rechecked at
`3d85897ebf1515008ef5c676b1c58a15422fb9ab`. The [owner research](phase29-q06-owner-research.md)
and [runtime research](phase29-q06-runtime-research.md) record exact sources.

1. Q01–Q05 explicitly reserved post-completion continuity and duration. None
   already grants A, B or C. This is an ordinary request-source policy decision.
2. P4/P12 remain the identity/current-permission owners. Continued reads require
   the same precise recipient/purpose context; completion cannot broaden it,
   transfer it to a new recipient or create membership.
3. Source-confirmed fulfillment owns the transition. Task Done, Support
   Resolved, scan success or a client-selected enum cannot substitute for it.
   Generic task/status code is not a qualified closure primitive.
4. Submission/correction admission racing completion needs an authoritative
   winner and truthful recovery. Completion cannot silently discard already
   admitted receipt/history, and an old open page cannot admit late work by
   ignoring current source state.
5. Cancellation, withdrawal, rejection, restriction, revoked authority and
   source access expiry retain their distinct source meanings. A normal-success
   follow-up mode must never be reused as a security grace period.
6. Q05's old-content restriction remains. A permits only eligible current own
   files, with independently authorized preview and original delivery, plus
   the current permitted metadata projection.
7. Q04/P12 still govern new full/range/conditional/resume reads and in-flight
   delivery. No saved URL or completed-mode page is lasting authority.
8. Completion, login, help, reading and browser close do not silently renew
   source access, revive a superseded file, extend retention, reopen the request
   or trigger an unselected notification.
9. Existing P18 official documents, P21 evidence, P26 conversations and resource
   rights remain specialized. Their current numerical lifetimes and rollback
   rules are not automatically native request defaults.
10. The bounded code census found useful separate status/read mechanisms but
    no qualified ordinary completed-request recipient lane. Runtime similarity
    is not proof that this decision already works.

## Status and sequencing

Q06 asks which completed-recipient mode to adopt. It intentionally does not
combine that choice with a specific number of days, clock-start rule, renewal
policy or another terminal outcome. A finite source access contract is still
an activation requirement, not permission to leave expiry unspecified forever.
If the chosen mode includes follow-up access, its duration policy is the next
dependent decision to resolve.

At question preparation, no new tests, product/provider/permission changes
or formal publication occurred. Q05's earlier tests were not counted as new
Q06 proof, and no Q06 ADR/glossary term had yet been created. These are dated
preparation facts. Formal source/OpenSpec publication remains gated on
`/to-prd`; tickets on `/to-issues`.

## Historical founder answer and completed review — before ratification, 2026-10-20

Conrad selected **A — Keep a bounded read-only completed view**, requesting
deep UX/UI research and the full adversarial standard. The
[completed review](phase29-q06-adversarial-review.md) recommends
Accept with required amendments: exact corrected decision, Q06-C01–C20,
Q06-P01–P24 and eight operational controls. The
[feature ADR](../docs/adr/0006-bounded-completed-request-access.md) and
Completed Request Access glossary term record this selection; the detailed
package awaits ratification. Twelve selected existing tests passed, with
45 filtered out; no native recipient-lane/RLS/browser qualification is claimed.
Q01–Q05 remain unchanged. No duration/anchor/renewal or next question is selected.

## Ratification — 2026-10-20

Conrad subsequently ratified A and all required amendments: the corrected
decision, Q06-C01–C20, Q06-P01–P24 and eight operational controls. The preceding
selection/review account remains dated provenance. The ADR and completed review
now record adoption. No duration/anchor/renewal choice or runtime/publication
authority is inferred.
