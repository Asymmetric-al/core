# Phase 29 Q10 — what the initial request-access deadline limits

**Status:** Historical researched question prepared 2026-10-20. Conrad
selected and ratified A with the complete required amendment package on
2026-10-20: separate finite unfinished and completed stages. Q01–Q10 are
ratified grooming intent. No initial duration/anchor, new extension/recovery
permission, notification or implementation is selected.

## Historical question and alternatives

For the new ordinary request policy, **when normal fulfillment occurs while
recipient authority is still valid, should the completed read-only view follow
its separately bounded Q07 period, or must it also stop at the original
overall request-access deadline?**

Recommend **A — A finite unfinished-request deadline, followed by Q07's bounded
completed reading after eligible timely fulfillment.** Genuine independent
source/security/purpose limits still cap reading. This is prospective policy,
not permission to reinterpret or extend an existing binding access end.

This is one lifetime-scope decision. Choosing when the initial clock starts
or how many days it lasts comes afterward. The earlier researched clock fork
assumed an overall cap; independent review identified that as an unresolved
product choice rather than a fact already settled by Q07.

## Practical options

| Option                                                                | What the recipient gets                                                                                                                                                                                                                                                                                                                                                       | Benefit and cost                                                                                                                                                                                                         |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **A — Separate finite unfinished and completed stages (recommended)** | The original policy declares a finite deadline for the unfinished request. Eligible normal fulfillment before that deadline transitions to Q07's read-only period: up to 720 elapsed hours from fulfillment, subject to genuine independent earlier caps and current authority. The unfinished-stage deadline does not also cut short that properly admitted completed stage. | Gives the already-selected follow-up its own useful bounded period. No rolling renewal or general drive. Total potential access can be longer than B; the conditional transition must be truthful and source-controlled. |
| **B — One overall original access ceiling**                           | The original finite end continues to limit both unfinished work and completed reading. Q07's maximum is further clipped by that overall end.                                                                                                                                                                                                                                  | One stable outer date and a potentially shorter total access exposure. Review completed near that date can leave very little readback, even though the ordinary maximum is 30 days.                                      |

Both retain a finite unfinished boundary, exact current recipient/action
authority, source-owned completion and all existing Q01–Q09 restrictions.
Neither changes the fact that ordinary submissions/corrections stop on normal
fulfillment. Neither guarantees a full 30-day reading interval.

Neither option revives ended authority. If the source actually fulfills after
the applicable unfinished/overall access deadline has already ended recipient
authority, independently authorized source work may still complete, but it does
not automatically open a completed view. Q08 is not an automatic repair when
no ordinary completed-view admission ever existed.

## Why scope comes before the clock

Q09 permits late intake only while actual authority remains valid. Q06 requires
a finite source policy. Q07 preserves every earlier end that genuinely binds
completed access; it does not say that every newly designed unfinished-stage
deadline must have that cross-stage scope.

An issuance-based versus first-entry-based clock question would prematurely
decide this scope if both options silently assumed one overall ceiling.
It is better to make the product consequence explicit now.

The new ordinary policy can prospectively declare a conditional transition
before anyone receives access. That is different from changing an admitted
end after seeing that it is inconvenient. Existing absolute, specialized,
security, purpose and genuinely shortened limits retain their real meaning.
Unknown legacy semantics are not migrated to A by renaming a field.

## Recommendation and strongest alternative

A better supports the purpose already chosen for Q06/Q07: finite follow-up to
completed Asym work. If staff completes an otherwise eligible request shortly
before its unfinished-stage deadline, the recipient can still receive the
qualified completed-reading opportunity under the prospectively declared rule.

This is not a promised renewal based on activity. Only exact source-confirmed
normal fulfillment can establish the completed stage. Upload receipt, safety
checking, a task checkbox, a recipient visit or an email cannot trigger it.

B is the strongest alternative where one original overall limit is more
important than a useful period after completion. Its simplicity and shorter
maximum exposure are real benefits. Its corresponding cost is also real:
recipients may have only the remaining portion of that original time.

No research establishes a universal best model or ideal initial duration.
The recommendation is product judgment, not measured ministry review times,
invitation delays, support savings or user satisfaction.

## Illustrative consequences

The following examples select no initial numerical duration:

| Situation                                                                          | A                                                                                                                          | B                                                                                     |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Normal fulfillment one day before the initial deadline, no independent earlier cap | Q07 can admit up to 720 elapsed hours of completed reading from fulfillment.                                               | Completed reading has at most the one remaining day.                                  |
| An independent binding purpose/access cap is one day after fulfillment             | That cap still limits reading to the remaining day.                                                                        | The earlier of that cap and the original overall ceiling controls.                    |
| Recipient submitted on time but staff review remains unfinished at initial expiry  | Recipient authority ends under the unfinished-stage rule; staff may continue independently. No automatic readback revival. | Recipient authority ends at the overall ceiling; the same no-revival rule applies.    |
| Source fulfilled before expiry but a consumer processes that fact later            | Q07 must prove the actual timely fulfillment/admission and current authority; processing time never resets the clock.      | The same evidence rules apply, and the original overall ceiling still limits reading. |
| Requested-by date passes while source authority and intake remain valid            | Q09 still allows otherwise-authorized late submissions and corrections.                                                    | Same; the requested target alone is not the actual access end.                        |
| The request never reaches normal fulfillment                                       | The finite unfinished stage expires; no completed stage appears.                                                           | The overall ceiling expires; no completed stage appears.                              |

At or after an actual exclusive end, an unadmitted action cannot rescue itself
through an earlier upload start, new login or retry. Already committed source
outcomes and their current authorized recovery remain governed by Q03/Q07/Q09.

## Small, truthful UX

Under A, before completion, explain the actual end of unfinished-request access
alongside the separate **Requested by** target where relevant. State that the
request must reach normal source-confirmed completion before that end for the
completed policy to apply. Do not suggest that submitting a file alone completes
the request or that the recipient controls staff review.

After eligible fulfillment, show **Request complete** and **Read access
available until [actual resolved end]**. Do not promise 30 days if an independent
earlier cap controls. Do not demand a download to finish the task.

Under B, show **Access available until [actual overall end]** from the outset.
At completion, that original overall ceiling remains binding, while Q07's
720-hour maximum or another earlier cap can produce a sooner actual read end.
Show that resolved completed-read end and the real remaining opportunity,
rather than continuing to display a later original ceiling or an unqualified
“30 days after completion” promise.

For both:

- Keep the existing shared Base UI/base-maia request experience and current
  file/status/history boundaries.
- Keep requested-by, recipient access, session/proof and retention meanings
  distinct; use readable localized dates and sufficient precision.
- Preserve current action-specific restrictions. A future end is not a
  guarantee that every action stays permitted.
- Preserve truthful received/awaiting-review states. Staff delay must not be
  mislabeled as recipient lateness.
- Provide the real source-owned help route without promising an unselected
  extension, new grant or email-attachment workaround.
- Ending access does not delete retained evidence or recall received copies.

No new confirmation, date picker, portal, permission engine or mandatory
explanation follows from either choice. Appropriate timers and accessibility
must still be qualified; a “security” label alone is not a timing exemption.

## Current primary research

- [Content Snare request exports](https://contentsnare.com/help/knowledge-base/can-clients-export-a-request/)
  documents optional request-PDF downloads with a separately configured
  post-completion period. This is evidence that stage-specific delivery exists,
  not proof about original-file access, Core permission mechanics or a duration
  to import.
- [Foundant follow-up logic](https://support.foundant.com/hc/en-us/articles/4411213334935-Follow-Up-Submission-Logic)
  separates submitted work, administrator completion and later access to that
  work. It does not specify the lifetime Core should use.
- [ShareFile file requests](https://docs.sharefile.com/en-us/sharefile/sharefile-app/sharefile-web/request-files)
  offers access-expiration settings, supporting the credibility of explicit
  overall limits without proving an Asym-equivalent combined read/write model.
- [Microsoft sharing settings](https://learn.microsoft.com/en-us/sharepoint/turn-external-sharing-on-or-off)
  distinguishes guest-access expiry, reauthentication and link expiry.
  [Content Snare magic links](https://contentsnare.com/help/knowledge-base/magic-links/)
  similarly demonstrates re-entry after an entry link expires. Neither
  mechanism establishes the underlying Core request lifetime.

These products differ. No documented comparator overrides the Core owners,
and a general CRM task deadline or CMS publication date is not proof of private
document access policy. The
[comparative research](phase29-q10-comparative-research.md) preserves source
scope, dates and limitations.

## Core reconciliation

Local and live `develop` were reverified at
`3d85897ebf1515008ef5c676b1c58a15422fb9ab`.
The [owner research](phase29-q10-owner-research.md) traces the ratified
boundaries; the [runtime research](phase29-q10-runtime-research.md) checks
existing implementation and unrelated clock values.

Q06 requires finite current access, and permits independent source completion
without recipient revival. Q07 defines a prospective source policy, the exact
fulfillment anchor, 720-hour maximum, preserved binding earlier limits and
no implicit extension. Q08 requires a proved previous completed-view admission.
Q09's requested-by target grants no extra authority.

A would explicitly establish a new prospective ordinary-stage scope; it does
not assert that any existing binding access end was really stage-only.
B would explicitly establish an original end that also binds completed access.
Neither option retrospectively changes the earlier ratified records or
specialized-source deadlines.

Workflow's suggested 14-day external-task expiry remains a proposal requiring
exact source adoption. Its generic document request is still unqualified.
Phase18's official-document grant/session defaults govern that separate
purpose. Local authentication, signed URL, retention and worker timeouts do not
settle this native lifetime-scope decision. Generated OpenSpec remains a
projection of its canonical owner sources.

## Scope and sequencing

Q10 chooses **whether the new ordinary initial deadline governs only the
unfinished stage or also caps the completed stage**. At question preparation, neither option had been selected.

After this choice and its adversarial review, choose the initial clock/finite
period and qualify source mapping, boundary races and usable cohort behavior.
The issuance-versus-bounded-first-entry alternatives remain deferred; they do
not settle lifetime scope. Active-access extension/recovery and Q08 fresh
timing/repetition remain separate decisions.

No initial duration/anchor, mandatory requested date, new date-edit role,
renewal, reminder, retention rule, grant-storage design or implementation
was selected at question preparation. At that stage no ADR-0010 or new
glossary term had been created for the unanswered question. No new tests or
product/provider/permission/dependency changes occurred for that preparation. `/to-prd` and `/to-issues` remain the formal publication boundaries.

## Historical founder answer and review — before ratification, 2026-10-20

Conrad selected A and requested deep research, all user journeys and the full
adversarial review. The [completed review](phase29-q10-adversarial-review.md)
recommends Accept with required amendments: the exact corrected decision,
Q10-C01–C22, Q10-P01–P30 and eight operational controls.
The [feature ADR](../docs/adr/0010-finite-unfinished-and-completed-request-stages.md)
records selected/reviewed status; the complete package awaits ratification.

The amendments require prospective stage scope, actual timely normal source
fulfillment with historical eligibility, preserved true caps, no expiry revival,
stage-aware expiry/recovery and truthful source-versus-recipient outcomes.
The qualified source occurrence is not casually equated with physical database
commit time; transactions spanning the boundary need explicit proof. Reviewed
copy does not guarantee completed reading or blame recipients for staff review.
No initial duration/anchor, new recovery or extension power, notification,
implementation, publication or Q11 choice is inferred.

## Ratification — 2026-10-20

Conrad subsequently ratified Q10 A and all required amendments: the exact
corrected decision, Q10-C01–C22, Q10-P01–P30, reviewed lifecycle/UX and eight
operational controls. The preceding selection/review account remains dated
provenance. The ADR and review now record adoption. No additional clock,
duration, authority, communication, implementation or publication is inferred.
