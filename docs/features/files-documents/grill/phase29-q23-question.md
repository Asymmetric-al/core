# Phase 29 Q23 — Ordinary negative-review outcomes

**Status:** Historical researched question prepared 2026-10-21, Asia/Bangkok.
Conrad selected A and ratified its complete required amendments on 2026-10-21:
keep ordinary review recoverable, flexible and lean, with excellent UX/UI.
Q01–Q23 are ratified grooming intent. No implementation or activation follows.

## Historical question and alternatives

**Should ordinary item review use a recoverable Request changes outcome, leaving
final rejection to the owning source process, or also offer a separate terminal
Not accepted outcome for an item?**

The unresolved choice is whether to add that **terminal item decision** to
ordinary review. Recoverable correction is already part of the source-grounded
direction; choosing between two labels for the same correctable result would
not be a meaningful product decision.

| Option                                                                         | Practical behavior                                                                                                                                                                                                                                                                                    | Benefit                                                                                                                                                                                              | Cost and consequence                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **A — Use recoverable Request changes for ordinary item review (recommended)** | Authorized staff identify what needs correcting on the exact unaccepted item. It remains unsatisfied, and the recipient can correct it within the same request while existing source/access rules permit. Genuine final decline/cancellation remains with its source's separately authorized process. | One understandable recovery path, preserves useful work and avoids making a fixable document problem look like final rejection of a person/application. Keeps the ordinary review surface small.     | Does not add a generic terminal item decision. A genuinely non-remediable situation must use an actual source-owned disposition/help route; staff cannot silently waive the requirement or leave users in an unexplained correction loop.                                                                                                  |
| **B — Also offer a terminal Not accepted item outcome**                        | Keep Request changes, and additionally let exactly authorized staff end ordinary further submission/correction for that item when the source permits a final negative disposition.                                                                                                                    | Explicit finality can distinguish a fixable problem from an item that will no longer be collected under this request. Potentially useful where that distinction has an established business purpose. | Requires explicit source authority for its stronger consequence, terminal meaning, clear recipient explanation and source-owned resolution/replacement rules. A required item remains unsatisfied unless a separate valid source outcome changes that; terminal review cannot manufacture request fulfillment or imply application denial. |

**Recommend A.** Q03 already supplies the recipient correction mechanism;
Q21 supplies meaningful staff acceptance; Q22 supplies whole-request fulfillment.
The missing ordinary interaction is an actionable staff return into that same
correction journey. A supplies it without creating another terminal state whose
purpose and resolution are not yet established for this cohort.

B is a genuine scope alternative, not a wording change. If “Reject” merely means
“send a better file here,” it is A under a less clear label. B only differs if
it ends the ordinary correction opportunity for that item. That can be valuable
in an actual source process, but should not be added as a universal document
control simply because application platforms also have Declined decisions.

Neither option removes an existing specialist rejection/decline/cancellation
power. A also does not promise that such a command is already implemented for
every native source. Its required owner binding must supply a truthful path for
non-remediable work before activation; there is no invented generic Cancel,
Waive, Reopen or approval override in this question.

## Practical example and user experience

**Illustrative example, not observed ministry behavior:** Ana asks for a two-page
form and another supporting document. The participant sends only page one of
the form. The supporting document has already been accepted.

With A, Ana chooses **Request changes** on the form item and identifies the
missing page in recipient-safe guidance. The participant sees **Changes
requested** beside that item, understands the next step, and submits the
correction in the same request if still authorized. The original receipt and
review history remain; the independently accepted supporting document is not
reset. Staff review the new exact evidence under Q21. Q22 completes the request
only when the complete source rule is genuinely satisfied.

With B, the same recoverable path is still available. The additional terminal
action would be for a different circumstance: authorized staff determine that
no further evidence should be submitted for this item under the current request.
Its finality must be explicit before execution and in the permitted result.
It cannot quietly mark required work satisfied, approve/deny the larger process,
delete submitted evidence or close unrelated items. If the larger process is
ending, its own source must decide that outcome.

For either option, preserve these already-governing boundaries:

- **Feedback is a source review outcome, not a file-safety state.** A malware
  finding, unavailable preview or processing outage is not automatically a
  business rejection or a reason to make the recipient upload again.
- **Exact scope matters.** Target the current item/requirement/evidence basis.
  Preserve supporting members and independent items unless a real source
  dependency requires otherwise. Do not blanket-lock a whole request by copying
  another product's review-round behavior.
- **Guidance must be useful and permitted.** Show what needs attention and the
  available next action in the request context. This does not select mandatory
  free-text essays, character limits, a general chat system or internal-note
  disclosure. Detailed feedback capture and delivery rules remain to qualify.
- **Existing rights and clocks remain.** Request changes is not a new grant,
  automatic renewal, due-date extension or reopening of accepted/completed work.
  If source work continues after recipient access ends, show owned next steps
  without falsely promising immediate correction. Q08–Q19 govern any fresh access.
- **Concurrent changes and uncertain results remain real.** A stale reviewer
  action cannot apply to newly submitted evidence; a lost response needs exact
  source recovery. The review outcome does not itself admit a corrected file or
  erase the prior received submission.
- **No new message default follows.** Q20 concerns fresh-access notices only.
  Whether and how review feedback triggers email is a separate communication
  decision. In-product feedback and durable state cannot depend on email delivery.

Keep the interaction in the existing staff review and participant request view.
Use readable status text, appropriate focus/status announcements, mobile layout
and supported accessible document inspection. A label alone does not establish
an accessible or comprehensible journey. Staff should not need a separate
workflow console; the participant should not need another account or request
merely to fix a recoverable item.

## Current primary research

Official documentation was read on 2026-10-21. The
[comparative research](phase29-q23-comparative-research.md) preserves detailed
evidence, conflicting vocabulary, product-surface limits and unselected behavior.

| Source                                                                                                                                                                                                         | Verified behavior                                                                                                                                                                                                | Lesson and limit                                                                                                                                                                                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Content Snare Approving & Rejecting](https://contentsnare.com/help/knowledge-base/approving-rejecting/), updated 2026-02-17                                                                                   | Reject tells the client changes are needed; the participant sees Redo. The guide supports targeting individual entries in a multiple-file field and encourages explanatory feedback without requiring a comment. | Close evidence for recoverable targeted change requests. Its Reject label is not proof of terminal item rejection. Core does not adopt remove-approval, client-answer editing, per-file approval or email/reminder policy.                        |
| [FileInvite reviewing documents](https://help.fileinvite.com/articles/reviewing-documents) and [Invite overview](https://help.fileinvite.com/articles/invite-overview), current undated guides                 | Review supports Request Revision with optional notes. The overview says outright rejection returns a request to No Progress until resubmission; revision requests use In Review.                                 | Both described negative paths permit another submission. They do not establish B's terminal semantics. The guides have a knowledge-base routing notice and describe particular UI editions; their differing state labels are not a Core enum.     |
| [Submittable Next reviewer revisions](https://next.support.submittable.com/hc/en-us/articles/44276321165847-Allow-Reviewers-to-Request-Revisions-in-a-Review-Round), direct page shows update 2026-10-21 14:59 | Where enabled, reviewers flag intake fields, add comments and request revision; applicants edit the flagged fields. The organization/round controls and broader feedback pause are part of that product.         | Supports targeted actionable review. Do not import its workflow builder, default-off mode, email, all-reviewer pause or application-wide authority. This is Submittable Next, not an assumption that all Submittable editions behave identically. |
| [Submittable submission statuses](https://submittable.help/en/articles/8048419-manage-my-submissions), dated 2023-12-07 and currently served                                                                   | Distinguishes received/in-progress, declined, accepted, completed and withdrawn submissions.                                                                                                                     | Shows why final negative outcomes can be real business facts, supporting B's strongest purpose. These are broader submissions/applications, not evidence of a terminal ordinary file-item control.                                                |

The close document-collection evidence supports recoverable correction, even
when staff controls use the word Reject. Broader application declines support
finality where the owning domain needs it. Neither establishes demand for a
generic terminal ordinary item outcome in Asym. A is a proportional product
recommendation, not measured ministry feedback or a universal rule.

## Governing contracts and current behavior

The [owner research](phase29-q23-owner-research.md) and
[runtime research](phase29-q23-runtime-research.md) preserve exact source evidence.

- The founder brief's requests/reviews section requires a complete exact-version
  review journey and source-owned outcomes. Rejection, needs-information, waiver
  and replacement cannot be invented from technical file states. That establishes
  the need to resolve the behavior, not a generic terminal item button.
- Ratified Q03 already allows currently authorized recipient corrections of an
  eligible unaccepted item and defines immutable lineage, predecessor fencing
  and independent-member preservation. Q23 does not make a staff request a
  prerequisite for already-authorized self-correction.
- Ratified Q21 requires deliberate staff acceptance and expressly reserves
  negative-review taxonomy. Ratified Q22 reserves negative outcomes too and
  makes an unsatisfied actual requirement prevent ordinary fulfillment. Neither
  a Request changes nor a terminal negative flag is acceptance or waiver.
- Workflow owner experience/language anticipates correction requests and
  source-defined business outcomes. Its role/queue rules separate assignment
  from capability. Ordinary reviewer routing remains open, but is not a
  prerequisite to choosing the meaning of this negative outcome; both choices
  must require the exact qualified source authority.
- Specialist applicant/finance/CMS/publication outcomes remain with those
  owners. Their final rejection/cancellation rules cannot silently become an
  ordinary native document-review power.
- Current generic task completion and financial approval/rejection code are
  adjacent evidence, not native request-change qualification. In the inspected
  contribution rejection seam, the service supports an optional follow-up
  callback, but the inspected route does not supply it; a unit test supplying
  a mock does not prove that route creates a recipient correction task.
- The bounded native-term search did not locate a qualified ordinary item
  Request changes implementation in the inspected API/database/migration paths.
  This is not an exhaustive deployed-schema claim. Actual source capability,
  negative-outcome boundary, disclosure, races, recovery and composed browser/
  AT/user behavior must be qualified before activation.

Source mutation/currentness, minimal durable history and safe recovery remain
mandatory under both choices. No new SQL enum/layout, provider, separate
permission system or configurable Workflow Studio prerequisite is selected.
The selected answer will receive its full adversarial review before ratification.

## Coverage, snapshot and recording boundaries

Q01–Q22 are ratified with all required amendments. Q23 addresses the scope of
ordinary negative-review outcomes. Reviewer responsibility/routing, precise
feedback and notification behavior, source remediation and broader library/
format/public-custody/disposition questions remain source-grounded grooming
work. This is not a claim that Phase 29 is fully specified or qualified.

Local HEAD remains `3d85897ebf1515008ef5c676b1c58a15422fb9ab`. Fresh live develop
remains `dfaa201242c6ad468bf2d343aa18e8f223f67c5c`, unchanged since Q22's targeted
PR2175 assessment. No pull occurred. Current authority requires reading full
incorporated OpenSpec sections with their original source/status; no new relevant
owner change was found. Local source evidence and newer live dependencies remain
distinct snapshots, not a claim that old tests qualify a new runtime.

At preparation no Q23 answer, ADR-0023 or glossary term was recorded. The
subsequent selection/review is recorded below. All nineteen definitions, ratified
decisions and pre-existing product edits are preserved; no new term is needed.
No new runtime tests, private-data/provider action or implementation occurred.
Formal owner/OpenSpec publication remains `/to-prd`; tickets remain `/to-issues`.

## Historical founder answer and review — before ratification, 2026-10-21

Conrad selected **A — Keep ordinary review recoverable**, requesting modern
research, excellent UX/UI, flexibility and no overengineering. The
[completed review](phase29-q23-adversarial-review.md) recommends **Accept with
required amendments**. The exact corrected decision, Q23-C01–C08, Q23-P01–P20,
ten journeys, eleven lifecycle distinctions and six operational controls await
ratification. The [feature ADR](../docs/adr/0023-recoverable-ordinary-item-review.md)
records selected/reviewed status. No new glossary term; all nineteen are intact.
Q24 has not been asked.

Use an attributable source-owned Request changes outcome on exact eligible
unaccepted evidence, with useful current recipient-safe guidance. It remains
unsatisfied and does not create a terminal item decision. Existing Q03 correction
is independent of staff initiation. Guidance cannot secretly change requirements
or expose raw staff notes/old feedback history. A fresh lawful Q21 reassessment
can accept sufficient unchanged evidence without manufactured new bytes while
preserving the previous review and its resolution; no Undo/Mark resolved bypass.

Order return, current review revision, acceptance, correction, real source
changes and Q22 closure coherently. Durable business identity and required
history/handoff survive retries; an old result/consumer cannot reinstate obsolete
Changes requested after successor, acceptance or completion. New receipt is not
acceptance or proof all issues resolved. Preserve independent supporting work.

Required concerns remain real Q22 work; genuinely optional feedback cannot create
a hidden hold. Current access, fresh authority and clocks remain unchanged. Staff
can act independently after participant expiry without reviving rights. Technical
outages use real recovery rather than fabricated business rejection/reupload.
Non-remediable cases need an accountable qualified source route able to resolve
them, not an endless upload loop or invented waiver/terminal command.

Use one meaningful action in the existing context with sufficient safe guidance,
truthful state, current next step/help and actual accessible/mobile/AT recovery.
No mandatory essay, extra reviewer/confirmation, new chat/email/default routing,
generic terminal item mode or Workflow Studio prerequisite follows. Preserve
current-disclosure-bound context, discard stale cross-context responses, and
retain independent known outcomes during ancillary failure.

Independent owner/runtime/UX reviews and source/primary evidence support the
amended policy. Native command/role/RLS/race/restore/load/browser/AT/user behavior
remains unqualified; no new runtime tests or implementation occurred. Local 3d85897
and freshly checked live dfaa2012 remain separate unchanged snapshots, without
pull. Formal publication/tickets remain `/to-prd` and `/to-issues`.

## Ratification — 2026-10-21

Conrad subsequently ratified Q23 A and its complete required amendments:
corrected decision, Q23-C01–C08, Q23-P01–P20, ten journeys, eleven lifecycle
distinctions and six controls. Earlier selection/review text is dated provenance;
the ADR and full review now record adoption. All nineteen definitions are
unchanged. Q24's answer, native qualification/implementation and formal
publication are not inferred.
