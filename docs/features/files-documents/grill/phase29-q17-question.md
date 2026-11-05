# Phase 29 Q17 — when fresh completed-read access expires

**Status:** Historical researched question prepared 2026-10-21, Asia/Bangkok.
Conrad selected A and ratified its full required amendments on 2026-10-21:
fix the fresh read deadline at issuance, with excellent UX/UI and no
overengineering. Q01–Q17 are ratified grooming intent.
No implementation or activation is implied.

## Historical question and alternatives

**For staff-approved fresh completed-read access, should its finite deadline
be fixed when the source issues access, or should a bounded entry window lead
to a reading period starting at the recipient's first qualified entry?**

Q16 resolved which actual completed views can qualify for Q08 consideration.
Q08-C06 still reserves the fresh duration/anchor, unused bounds and repetition
policy. The next dependency is the clock model: it determines what the next
complete numerical profile must specify and what staff and recipients see.
Q11's original unfinished model and Q14's fresh unfinished model are useful
comparisons, not authority to decide this separate read-only lane.

## Practical options

| Option                                                             | What happens                                                                                                                                                                                                                 | Benefits                                                                                                                                                                                        | Costs and consequences                                                                                                                                                                                                                      |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Fix the fresh read deadline at issuance (recommended)**      | Successful source-owned fresh issuance establishes and preserves one finite end. That same end bounds unused access. First entry does not start another interval.                                                            | One actual end to communicate, no unused-to-active business transition, consistent treatment of files and status-only scope, fewer opportunities for accidental timer resets.                   | Delivery, discovery, proof and technical delays after real issuance consume the period. A recipient arriving later receives only the remaining time; usability is not guaranteed merely because issuance succeeded.                         |
| **B — Allow a bounded entry window, then a finite reading period** | Source issuance establishes a finite last-entry boundary. The intended recipient's first source-qualified deliberate entry within it establishes one finite reading end. Never-entered access expires at the entry boundary. | Preserves the full chosen reading interval after timely entry, subject to genuine independent earlier restrictions. Useful if evidence shows delayed discovery makes A materially unsuccessful. | Two time rules and another source transition to explain, enforce and recover. Entry must be defined for status-only scope and must not be triggered by scanners, passive visits, analytics, an auth callback or successful rendering alone. |

B is the strongest practical alternative, not an unbounded invitation. Its
entry deadline limits when activation may occur; it must not secretly cut off
the promised reading interval after timely entry. A genuine independent cap
can still shorten either option. Neither option restarts on repeat visits.
With the same reading duration, B can produce a longer total interval from
issuance because it also allows time before first entry; genuine independent
caps may still shorten it. We should choose one standard model rather than add
a staff-selectable menu.

## Concrete journey and recommendation

Illustrative scenario, not a claimed ministry workflow: staff approve fresh
reading of an already-completed request, and the recipient returns several
days later while entry remains permitted.

- Under A, the actual source-issued deadline is unchanged. The recipient sees
  the remaining time and the currently permitted read actions.
- Under B, the first qualified deliberate entry starts the chosen reading
  interval. Before entry, authorized context must distinguish the enter-by deadline
  from the reading duration; after entry, it shows the actual reading end.

**Recommend A.** This is recovery of scoped completed information, so one
predictable deadline fits the existing Grant read access action and completed
context. It works without a file-open event and avoids another activation
stage. That is a product judgment about clarity and proportionate complexity,
not evidence that recipient delay does not matter or that every system uses A.

A's real cost is lost usable time after late discovery or technical failure.
Show truthful issued/currently-usable/delivery states, an actual deadline with
timezone and useful help. A failed handoff must not be hidden by a green
issuance result. Support uses existing governed recovery; it cannot silently
reset time, clone requests or assume a repeat policy that has not been chosen.
Evidence of intended recipients being unable to finish the read task within
the eventually selected profile would be a reason to reconsider the profile
or model, not to invent a background extension.

## Research and its limits

| Primary source                                                                                                                                 | Verified fact                                                                                                                                                                                                     | Consequence for this choice                                                                                                                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Digify: Setting files to expire](https://help.digify.com/en/articles/749264-setting-files-to-expire), updated 2026-08-18                      | Documents both fixed-date/time and after-opening expiry. Its documented non-viewable formats support only fixed expiry. Notification is separable, and online expiry does not control an already-downloaded copy. | Both clock families are credible. A file-open timer is not a suitable unmodified trigger for Core's multi-file or status-only completed view. This page does not prove a finite unused-entry deadline for B or prescribe an Asym duration. |
| [Content Snare: Can clients export a request?](https://contentsnare.com/help/knowledge-base/can-clients-export-a-request/), updated 2026-05-20 | Optional post-completion request-PDF export can have a finite completion-relative window; an email depends separately on notification settings.                                                                   | A predictable event-based end is a comparable pattern. Its completion anchor, PDF scope and numerical setting do not decide the anchor or duration of a new Core grant.                                                                    |
| [GOV.UK confirmation pages](https://design-system.service.gov.uk/patterns/confirmation-pages/)                                                 | Recommends explaining what happens next and when, and providing helpful return paths for bookmarked confirmations.                                                                                                | Show actual results and useful next actions. It does not require a new confirmation screen or guarantee access after authority ends.                                                                                                       |
| [WCAG 2.2 Timing Adjustable](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html)                                               | Time limits affecting interaction need assessment against the criterion and its applicable exceptions.                                                                                                            | Do not assume a long grant lifetime automatically qualifies short proof/session or task timers. Test the composed journey; a fixed business deadline is not by itself a complete accessibility finding or exemption.                       |

No inspected source proves an optimal Asym clock or numerical duration, a
representative nonprofit need for B, or a universal best-practice rule. No
representative-user test was performed. This research informs practical
alternatives while Core's source and authorization decisions remain governing.
The [comparative research](phase29-q17-comparative-research.md) retains further
context; [owner](phase29-q17-owner-research.md) and
[runtime](phase29-q17-runtime-research.md) notes record repository evidence.

## Core boundaries whichever option is chosen

1. **Real source issuance owns the clock.** Draft creation, staff click,
   preliminary approval, communication, credential issue, provider acceptance
   and first observation do not substitute for the durable qualified source
   event. Stable reviewed terms precede dispatch; any estimated date is labeled
   as such until the source rule resolves the actual end.
2. **Preserve the same effect.** Lost responses and retries recover the exact
   original effect and admitted times. A fresh credential, proof renewal,
   notification retry or another visit cannot reset a source period. A known
   unsupported handoff cannot be called ready. Unknown commitment requires
   source reconciliation rather than duplicate issuance.
3. **Keep current restrictions.** Q16's exact completed-admission ceiling,
   current recipient/issuer/purpose checks, genuine earlier limits and adverse
   history continue. The already-ended predecessor does not itself become a
   new grant's end. Source completion, submitted originals, retention and
   independent rights remain unchanged; no new completed stage follows this
   already-completed read-only grant.
4. **Make the experience clear.** A uses one actual access end after issuance;
   B distinguishes enter-by from reading time without another account or route
   selector. Preserve Q01 proof and shared Base UI/base-maia, accessible status,
   focus, localized dates/timezones and low-bandwidth recovery. Neither choice
   promises to recall downloaded copies, automatically sends a message, or
   reopens upload/correction.
5. **Qualify the actual boundary.** Current source checks after relevant waits,
   effective SQL/RLS/privileged paths, exact expiry races, partial responses,
   private serving and migration/restore remain required. A browser clock,
   signed URL, lease or punctual worker cannot become authorization truth.

ADR-0025's inert GET/HEAD and producer-owned protected actions rule out using a
link fetch or delivery event as B's activation. Its verified handoff still does
not automatically prove the source's complete current recipient entry predicate.
Q08-C06/C07/C09/C13/C14/C17 and Q16-C03/C05/C06/C08 preserve these distinctions.
Q08 permits the end to resolve when the chosen source rule resolves it; neither
option conflicts with that open contract. If A is selected and ratified after
review, specialize the clock/unused part of Q08-C06 and the corresponding
conditional end-display language, without rewriting its other gates.

## Historical reality, limits and next step

Local HEAD `3d85897ebf1515008ef5c676b1c58a15422fb9ab` and live develop
`e2761135d2952426e15be7d56c1d9680aa7b8c15` were independently rechecked
unchanged. Previously reviewed differences concern document-cutover and
CI/acceptance seams; local and live are separate snapshots. No pull occurred.
Adjacent source timing, task and projection helpers do not establish native
Q08 grant issuance or either qualified clock model. No runtime suite or native
SQL/race/provider/browser/AT proof is claimed.

After this single model decision and its adversarial review, choose one complete
finite numerical profile for it. Do not infer thirty days, sixty days, arbitrary
staff dates, future scheduling, pauses, grace, repeated periods, cumulative or
overlap policy, retention or notifications. In particular Q07/Q14 durations and
Q15 unfinished repetitions remain outside this question. Issuance remains gated
until Q08's complete policy and native qualification are resolved.

At preparation no option, ADR-0017 or new glossary term was recorded. The
subsequent selection and completed review are recorded below. All seventeen
definitions and Q01–Q16 remain preserved. Formal owner/OpenSpec publication
remains `/to-prd`; tickets remain `/to-issues`; no implementation follows here.

## Historical founder answer and review — before ratification, 2026-10-21

Conrad selected **A — Fix the fresh read deadline at issuance** and requested
the full adversarial review with excellent UX/UI and no overengineering.
The [completed review](phase29-q17-adversarial-review.md) recommends
**Accept with required amendments**: corrected decision, Q17-C01–C08,
Q17-P01–P16, eight journeys and six operational controls.
The [feature ADR](../docs/adr/0017-fixed-fresh-read-deadline-at-source-issuance.md)
records selected/reviewed status; the complete package awaits ratification.

Actual new source issuance durably resolves one finite end and its provenance;
the same end bounds unused access. Recover original committed outputs before
fresh calculation. Missing timing is safe source-recovery work, not valid
first-entry activation pending. Genuine earlier limits keep their actual scope;
neither old ordinary expiry nor a member-only limit becomes an unrelated fresh
whole-grant cutoff. Current proof, usable content and notification remain
separate. Use one existing action/context and truthful localized end/recovery.

The successor specializes Q08-C06/C07/P17 and corresponding Q16-C06/C08
display/model references, preserving other gates. No numerical formula, unit,
duration, repeat policy or new completion stage follows. Vendor opening-relative
expiry does not establish the full proposed bounded-entry alternative. Native
source/SQL/RLS/race/provider/browser/AT and user qualification remain unproved;
no runtime suite was run. No new glossary term or system; Q18 is unselected.

## Ratification — 2026-10-21

Conrad subsequently ratified Q17 A and the complete required amendments:
corrected decision, Q17-C01–C08, Q17-P01–P16, eight journeys, six controls and
explicit Q08/Q16 clock-model successor mapping. The preceding selection/review
remains dated provenance. ADR and full review record adoption. Numerical
calculation/profile, repetition, Q18's answer, implementation and formal
publication are not inferred.
