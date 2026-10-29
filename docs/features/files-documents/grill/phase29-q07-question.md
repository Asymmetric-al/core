# Phase 29 Q07 — the completed-request access period

**Status:** Historical researched question prepared 2026-10-20. Conrad
selected and ratified A with the complete required amendment package on
2026-10-20: up to 30 days from completion with earlier limits preserved.
Q01–Q07 are ratified grooming intent. No renewal, formal specification,
implementation or activation is selected by this record.

## The one decision

For an ordinary private document request that the organization has normally
completed while its recipient remains eligible, **what default should bound
the completed read-only view: up to 30 elapsed days from completion, up to
14 elapsed days from completion, or the finite source end already assigned
to the request?**

Recommend **A — Up to 30 elapsed days from normal completion**, always ending
earlier when a binding source limit or current restriction requires it.
This explicitly proposes a duration **and its starting event together** as
one complete access policy. It does not assume that Q06 already chose either.

Here, the **source** means the Asym feature that owns the particular request,
its purpose and its permissions. **Completion** means that source's one
authoritative normal-fulfillment outcome for the exact request and evidence
scope; it is not merely an upload receipt, generic task status or notification.

## What is already settled

The [ratified Q06 decision](../docs/adr/0006-bounded-completed-request-access.md)
retains a bounded completed view with the currently permitted outcome,
current own files and concise participant-safe submission history. Normal
fulfillment ends ordinary recipient submission/correction. Q04 independently
qualifies preview and original delivery; Q05 excludes ordinary superseded
content access.

Q06 intentionally left the actual access period and anchor unresolved.
Every protected recipient operation still needs current source authority.
Independent staff or worker processing may finish after recipient access
ends, but that cannot restore the recipient's access.

## Practical options

| Option                                                             | What the recipient gets                                                                                                                                                                     | Main tradeoff                                                                                                                                                                                            |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Up to 30 elapsed days from normal completion (recommended)** | The existing completed view remains eligible until the earlier of the source-confirmed completion plus 30 days and any binding source end, subject to current permissions and restrictions. | A clear, finite follow-up interval with more opportunity to return than two weeks. Continues ordinary access longer than B where no earlier cap applies; no research proves 30 days is optimal for Asym. |
| **B — Up to 14 elapsed days from normal completion**               | The same completed view, starting from the same authoritative event, with the same earlier-limit rules and a shorter maximum.                                                               | Less continuing access to private content and metadata. Recipients returning later may need the existing qualified help route; how often that would occur is unmeasured.                                 |
| **C — Keep the already-declared finite source end**                | Completion closes ordinary writes but adds no completion-relative cap. Eligible readback continues only until the already-authorized end, subject to earlier restrictions.                  | Preserves one established date and fits a genuinely fixed purpose boundary. Time remaining after completion varies with review duration and can be shorter or longer than A/B.                           |

All three require an actual qualified finite source policy. None means
"staff will choose later," unlimited access, automatic renewal, new account
enrollment, an archive or a general document drive. Existing specialized
source contracts and independently authorized rights keep their own owners.

## Why recommend A

The purpose of the completed view is a useful follow-up to finished work.
A fixed completion-relative maximum makes that purpose easier to explain than
a period mostly consumed during review. Thirty elapsed days is a practical
initial product judgment: more room to return than fourteen, while keeping
ordinary access tied to a finite task.

That benefit is conditional. **A is a maximum, not a fresh 30-day guarantee.**
If an existing binding access end falls one day after completion, the recipient
gets only that one remaining day. If source access already ended before
completion, no completed-read window opens.

B is the strongest shorter-access alternative. It may be entirely sufficient,
but there is no measured return-time distribution or ministry support evidence
to establish that. C is the strongest fixed-purpose alternative: when a real
program or request purpose already has the right finite end, retaining that
date avoids another scheduling rule. Its cost is an uneven follow-up interval.

A 90-day maximum would also be finite. It is not inherently an archive or
inherently unsafe, but ordinary quarterly retrieval needs have not been
established here. More settings, a sliding last-visit window or a first-view
activation clock add complexity without demonstrated need.

## What current research establishes

- [Dropbox Transfer](https://help.dropbox.com/share/dropbox-transfer), updated
  24 September 2026, uses a 7-day expiry for Basic/Family/Plus and a 30-day
  default on its listed customizable plans. Its download-access expiry and
  later server deletion are distinct. This is transfer delivery, not a Core
  request-completion policy.
- [Tresorit shared links](https://support.tresorit.com/hc/en-us/articles/360005537333-Manage-shared-links),
  updated 6 October 2026, document a 30-day default and distinguish inactive or
  revoked links from newly created links. Their moving-file and sharing
  semantics are not Asym's exact-submission or confirmed-recipient contract.
- [ShareFile settings](https://docs.sharefile.com/en-us/sharefile/account_settings/file_settings/share_setting)
  let administrators bound the maximum access period. This supports a
  controlling source limit, but the page establishes no numeric default.
- [Foundant's completed follow-up forms](https://support.foundant.com/hc/en-us/articles/4411213334935-Follow-Up-Submission-Logic)
  support a meaningful completed readback experience. They do not establish
  a universal expiry period for submitted originals.

These primary sources show credible finite-access patterns with differing
purposes and defaults. **They do not establish an industry-standard duration,
legal requirement or measured optimum for Asym.** We have not collected
recipient interviews, real return-time data, support-volume data or field
connectivity evidence. Benefits for delayed mobile/field returns remain
reasonable hypotheses, not invented ministry workflows.

Detailed evidence: [comparative research](phase29-q07-comparative-research.md),
[source-owner research](phase29-q07-owner-research.md) and
[runtime/clock research](phase29-q07-runtime-research.md).

## How A or B would work without renewing an ended grant

The selected policy would be declared prospectively for the eligible ordinary
request cohort. There remains one source access policy. Its already-declared
completion rule resolves a maximum once; this does not introduce a second
permission engine or grant taxonomy.

1. **Use the authoritative normal-fulfillment instant once.** Do not anchor
   to first/last visit, sign-in, email arrival, retry processing, preview
   generation or mutable `updated_at`. Late processing and duplicate events
   retain the same source anchor.
2. **Preserve every binding earlier limit.** Do not reinterpret an existing
   expiry as advisory or extend it to supply a full interval. Unknown legacy
   semantics need owner resolution; a missing policy must fail closed.
3. **Never revive ended authority.** Completion after expiry/revocation can
   remain a valid source outcome without exposing it to that recipient.
   An expired browser session alone is different: while source eligibility
   remains valid, Q01-qualified re-entry may return to the same view.
4. **Use elapsed days.** A means 30 × 24 hours; B means 14 × 24 hours.
   Neither means a calendar month, working days or the end of a local day.
   Display the resulting actual local date, time and timezone. PostgreSQL
   distinguishes calendar-day arithmetic from elapsed hours across daylight
   saving changes; this choice must be explicit.
   [PostgreSQL date/time semantics](https://www.postgresql.org/docs/current/functions-datetime.html).
5. **Keep the resulting end fixed for the admitted policy/effect.** Return
   visits, reauthentication, resend, retries, help or replay do not slide it.
   Current revocation or source restrictions may still deny access sooner.
6. **Apply prospectively.** Do not silently extend or shorten existing grants,
   rewrite historical completion evidence or change specialized source rights.
   A future migration or policy-change rule needs explicit owner resolution.
7. **Enforce at the protected operation.** At/after the effective end, new
   protected reads are denied; inherited Q04/P12 stream and expiry rules
   apply. A cleanup job, browser timer or provider URL is not the authority.

C keeps the predeclared finite end instead of introducing the completion
maximum. All the same current-authority, non-revival and enforcement
requirements apply.

## The recipient experience

Keep the same calm request page. Show the completed result, currently eligible
actions and a readable **Access ends [date, time, timezone]** beside the result.
Keep the date outside collapsed history. Show the actual earlier cutoff,
not a blanket “30 days remaining.”

Before completion, explain the selected rule without fabricating an unknown
completion date. If an earlier fixed deadline is already known, show it
directly. The end is the latest currently permitted bound, not a guarantee
through later safety restrictions or a claim that every file is available.

Re-entry should distinguish an expired sign-in/proof from ended source access.
When source access ends, show only the permitted neutral ended/help state.
Do not imply that the submission failed, was rejected or was deleted.
Protected status/history does not become a permanent fallback after its own
source authority ends. Independent rights remain independent.

The existing qualified help route is not a promise of extension or permission
to email private attachments. No new portal, renewal button, countdown-only
message, reminder campaign, forced enrollment or offline private cache follows
from choosing this interval. Q06's separate accessibility/timing qualification
still applies; a long source interval does not prove the whole flow accessible.

## Repository reconciliation and proof boundaries

Local and live `develop` were reverified at
`3d85897ebf1515008ef5c676b1c58a15422fb9ab`. The owner/runtime notes identify
the relevant ADR, P4/P12, Workflow Studio and clock mechanisms.

- Current code has reusable finite-expiry and separate worker/session/retention
  clock patterns, but no discovered qualified native completed-request
  recipient access policy. Code resemblance does not prove this lane works.
- Existing P18/P34 numerical periods and worker-lease defaults belong to
  different purposes. They do not choose Q07's number.
- P12 remains the current authorization owner; no local TTL arithmetic can
  broaden tenant, recipient, purpose, action or exact-file scope.
- ADR-0038 retains source-owned retention/hold/disposal rules. Ending the
  view does not delete organizational evidence or recall downloaded copies.
- The Q03 correction fence, Q04 exact-current delivery and Q05 minimized
  history remain binding throughout the completed view.

After an answer, the adversarial review must test source eligibility at
completion, delayed/replayed completion, earlier limits, exact before/at/after
expiry, old grants and policy changes, elapsed-time/DST semantics, current
full/range/recovery reads, browser re-entry, accessibility, help wording and
the absence of retention coupling. These are future proof obligations, not
tests run or production behavior certified by this research.

## Scope and sequencing

This is one complete default-policy choice, including its anchor. An
independent runtime reviewer preferred asking the anchor first; this question
uses the permitted alternative of exposing duration and anchor together in
each concrete option so neither is assumed or hidden.

Active-request duration, submission due dates, renewal/extension,
notifications, technical session/proof lifetimes, retention and specialist
exceptions remain separate decisions. Q06 still prohibits activating an
affected source profile until its complete finite access contract is qualified.
Unresolved dependencies do not authorize an unlimited fallback.

At question preparation, no ADR-0007 or new glossary term had been created for the then-unanswered choice.
No product, provider, permission, dependency or environment changes occurred,
and no runtime tests were run for this question. Formal source/OpenSpec
publication remains gated on `/to-prd`; tickets on `/to-issues`.

## Historical founder answer and review — before ratification, 2026-10-20

Conrad selected **A — Up to 30 days from completion, with earlier limits
preserved** and requested the full researched adversarial review.
The [completed review](phase29-q07-adversarial-review.md) recommends
**Accept with required amendments**: the corrected decision, Q07-C01–C21,
Q07-P01–P26 and eight operational controls await ratification. The
[feature ADR](../docs/adr/0007-fixed-completed-request-access-end.md) records
that distinction.

The refinements preserve the initial and subsequently shortened binding end,
trusted at-fulfillment evidence plus current authority, temporary representation
recovery within valid access, independent source completion when recipient
admission fails, exact timing and truthful accessible presentation.
Sixteen selected adjacent tests passed, with ten filtered out; no native
recipient/RLS/provider/browser qualification is claimed. The earlier proposed
options remain historical evidence, not unresolved or selected alternatives.
No next question, renewal or notification choice is inferred.

## Ratification — 2026-10-20

Conrad subsequently ratified A and all required amendments: the exact corrected
decision, Q07-C01–C21, Q07-P01–P26 and eight operational controls. The preceding
selection/review account remains dated provenance. The ADR and completed review
now record adoption. Renewal, active-request duration, notifications and
implementation/publication are not inferred.
