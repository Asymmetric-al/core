# Phase 29 Q11 — when unfinished-request access begins counting down

**Status:** Historical researched question prepared 2026-10-20. Conrad
selected A on 2026-10-20 and ratified its complete required amendment package
on 2026-10-21: fix the unfinished-access deadline at original source issuance.
Q01–Q11 are ratified grooming intent. No initial number/calculation,
extension/recovery power or implementation is selected.

## Historical question and alternatives

**Should the unfinished-access deadline be fixed when the source issues the
request, or should a bounded first verified entry start its working period?**

| Option                                                      | Meaning                                                                                                                                                                                                                                      | Practical tradeoff                                                                                                                                                                                                                                                                                       |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Fix the deadline at issuance (recommended)**          | When the source first durably enables this request for its intended recipient, resolve and retain the finite unfinished-access end. First entry, return visits and delivery retries do not move it.                                          | Staff and recipients can see the same end from the outset. Fewer timing states and less confusion. Late discovery or delivery failure consumes part of the available period; a useful duration and accountable help route must be qualified.                                                             |
| **B — A finite entry window, then a finite working period** | At issuance, declare a finite latest-entry boundary and the finite working-period policy. The first qualified recipient entry before that boundary resolves the working end once. Never entering ends the opportunity at the entry boundary. | Better protects working time when a recipient sees the invitation late but still enters in time. Adds a genuine first-entry transition, two time policies, changing date explanations and additional concurrency/recovery cases. It does not guarantee a full period against genuine independent limits. |

For A, “issuance” is a trusted source business effect. It is not draft creation,
queuing a future request, pressing a button before the effect commits, sending
an email, provider acceptance/delivery, an email open, or a page visit. If a
scheduled issuance capability exists, actual qualified issuance is the anchor;
this question does not add scheduling.

For B, “first qualified entry” means the exact recipient's successful
source-authorized entry to this request through the already-required proof
flow. A generic account login, callback, redirect, tracking event, public
landing-page GET, link scanner or staff preview does not establish it. The
source must record it exactly once with current eligibility; no extra
timer-start confirmation or enrollment is implied.

Both options preserve current authorization, earlier genuine restrictions,
the distinction between requested-by and access expiry, Q03 correction fences,
and Q10's qualified transition to the separately bounded completed stage.

## Recommendation

Choose **A** for the ordinary request policy.

It gives a predictable, explainable end for a finite Asym task, including the
time the source may need for review. There is no surprise change in the
unfinished end merely because someone first visits, switches devices, returns
after travel or asks for a new sign-in link. It also avoids needing a separate
first-qualified-entry event to establish the unfinished end.

B is a credible alternative when preserving a working period after delayed
first entry is a demonstrated product requirement. It cannot be dismissed as
“unlimited access”: both its entry opportunity and working interval can be
finite. Its costs are an additional lifecycle boundary and more explanation,
not an inherent inability to be safe.

No current primary source establishes a universal best anchor or an ideal
number of days for Asym. A is a product judgment grounded in predictable task
completion and Core's bounded scope. There is no measured ministry invitation
delay, review duration, support burden or satisfaction result to cite.

## Preserve Q10 rather than quietly changing it

These are **unfinished-stage timing terms**. They are not a new overall ceiling
on a validly admitted completed stage. The previous deadline cannot clip that
stage solely because it once governed unfinished access. Genuine independent
overall/purpose/security limits remain effective.

B must be stated prospectively as conditional initial policy: a finite
not-yet-entered opportunity followed by a finite working period after a timely
qualified entry. The entry boundary is not silently reinterpreted as a hard
cap on all subsequent unfinished work. A version that instead clips every
working interval to an original outer unfinished ceiling is possible, but it
is a different, weaker benefit for late entrants and is not the B compared here.

Neither model permits a late first visit to revive expired authority. Neither
allows an already admitted legacy, specialized or truly overall deadline to
be relabeled. True shortening, revocation and current restrictions survive
any qualified timing transition.

Normal source fulfillment can occur before any recipient visit when the
owning source already permits that outcome. Apply Q10's historical eligibility
and actual applicable unfinished boundary at that occurrence. A later visit
must not start an unfinished period after fulfillment. Fulfillment after
actual authority ended cannot create automatic readback; Q08 does not repair
an absent ordinary completed-view admission.

## Practical journeys and confusion to prevent

These are design probes, not claims about an observed ministry workflow.

| Situation                                                                     | A                                                                                           | B / shared safeguard                                                                                               |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Staff prepares a draft well before it should be issued                        | No clock starts from the draft. Resolve the end at actual source issuance.                  | The finite entry opportunity starts at issuance; drafting is not entry or issuance.                                |
| Recipient first sees the request late                                         | Shows the real remaining time to the original unfinished end.                               | Timely qualified entry can start the declared working interval, still limited by genuine independent restrictions. |
| Invitation fails, arrives twice or is resent                                  | The original end remains. Delivery failure is a separate visible operational outcome.       | No delivery event proves entry or resets either established clock. Never-entered opportunity still ends finitely.  |
| Security software follows an email link                                       | It has no effect on the original end.                                                       | It must not start the working period or expose private request metadata.                                           |
| Two devices first enter together; one response is lost                        | Both recover the same original end.                                                         | One original qualified entry and one resolved working end; no second-device or retry extension.                    |
| Recipient submitted on time; staff review is pending                          | Show received/awaiting review and the actual access end, without recipient-overdue blame.   | Same. Neither model pauses time for review, promises completion before expiry or permits false early completion.   |
| Eligible source completion occurs before any visit                            | Q10 applies from actual timely fulfillment.                                                 | Use the declared finite pre-entry eligibility; no later entry starts a working period on a completed request.      |
| Sign-in proof expires while source access remains valid                       | Qualified re-entry retains the existing end.                                                | Same; technical credential refresh is not a new first entry or a new grant.                                        |
| The actual unfinished end arrives during an unadmitted upload or correction   | No upload-start grace. Preserve any earlier durable outcome and reconcile unknown outcomes. | Same at each applicable boundary; repeated visits do not rescue ended authority.                                   |
| Eligible source completion occurs before the applicable end                   | Resolve the actual completed-read end under Q07/Q10.                                        | Same. Stage change closes ordinary writes, preserves genuine caps and does not require an online browser.          |
| Request is reassigned, reopened, copied or has its requested-by target edited | No timer reset, silent authority transfer or new ability to extend follows from Q11.        | Same. A genuinely new source effect requires its separately authorized procedure.                                  |

## Small, clear UI

Use the existing source request context and shared Base UI/base-maia components.
Do not add a separate activation dashboard, a general drive or a countdown
ceremony.

For A, show the exact applicable unfinished end as ordinary text:

> Access while this request is unfinished ends [localized date, time and zone].

Where a requested-by target exists, label it separately as **Requested by**.
Do not say “due” for both. If an independent earlier limit controls an action,
show its actual permitted consequence without disclosing a private policy
reason. Essential timing must not live only in a tooltip or animated countdown.

Before issuance, authorized staff should be able to understand the resulting
boundary and any conflict with the intended task/review opportunity. This
does not grant them a date editor or establish a mandatory due date.

For B, the pre-entry explanation must communicate both the finite entry
opportunity and the working-period rule. After qualified entry, show the
resolved working end. Do not promise “your full period” when an earlier
independent limit clips it. Do not ask people to avoid inspecting the request
to preserve an invisible timer.

For both, retain receipt/status, current own-file actions and concise history.
Show the actual next actor. Preserve server-confirmed work across re-entry
and interrupted connectivity; do not claim unsent local files were received.
At real expiry, give a safe source-owned help route without promising an
unselected extension or inviting private email attachments.

Q10's conditional completed-stage explanation remains necessary: receipt alone
is not completion, and completed reading is not guaranteed when true caps or
late source completion prevent admission.

## Current primary research

- [Box file requests](https://support.box.com/hc/en-us/articles/360045304813-Using-File-Request-to-get-Content-from-Anyone)
  allow an expiration date to be set before the request link is shared.
  This supports a predetermined boundary as a credible pattern. Box's folder,
  identity, re-enabling and upload-token behavior are not imported.
- [ShareFile requests](https://docs.sharefile.com/en-us/sharefile/sharefile-app/sharefile-web/request-files)
  expose access expiry separately from sign-in requirements. That supports
  separating permission time from authentication; it does not determine the
  Asym anchor or duration.
- [Foundant follow-up logic](https://support.foundant.com/hc/en-us/articles/4411213334935-Follow-Up-Submission-Logic)
  distinguishes submitted work from administrative completion. It supports
  truthful next-actor states, not a particular access lifetime.
- [Microsoft's documented false click events](https://learn.microsoft.com/en-us/defender-office-365/attack-simulation-training-faq)
  show that security software can inspect links and generate telemetry without
  a manual recipient click. This establishes a concrete reason not to use
  email engagement as the first qualified entry.
- [GOV.UK task-list guidance](https://design-system.service.gov.uk/components/task-list/)
  recommends simplifying the service and using clear task/status language.
  Apply the interaction lesson within Core's existing design system; it does
  not authorize another UI library or an unnecessary task-list screen.
- [WCAG 2.2 timing guidance](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html)
  requires analysis of the actual time limits. Its longer-than-20-hours
  exception is not a recommended duration or blanket exemption for shorter
  sessions, proof or upload timers.

The current [comparative research](phase29-q11-comparative-research.md)
preserves source dates, limitations and additional evidence. No external
workflow overrides an accepted Core owner.

## Core and current implementation

Local HEAD and live `develop` were rechecked at
`3d85897ebf1515008ef5c676b1c58a15422fb9ab`.
The [owner research](phase29-q11-owner-research.md) traces Q01–Q10 and the
canonical platform/identity/permission/source contracts.
The [runtime research](phase29-q11-runtime-research.md) distinguishes existing
invites, callbacks, credential times, task dates and replay infrastructure from
the still-unqualified native request policy.

Q10 intentionally left initial clock and duration open. Existing Workflow
external-task guidance and specialized official-document access terms do not
select ordinary Phase 29 values. Service-role access, a generic login callback,
an email timestamp or an existing expiry column does not prove the needed
native source boundary.

Whatever option is selected, design must establish trusted issuance/entry
occurrence, immutable initial terms, exact tenant/source/recipient scope,
semantic retry identity, relevant concurrency and current-time handling.
Provider calls cannot establish business time or occur under source locks.
Unknown outcomes recover the original effect; old workers and restored data
cannot create a later end. Q10's current-use, stage-aware expiry and historical
fulfillment requirements remain binding.

## Scope and next dependency

This is one product choice between a fixed-at-issuance end and a finite
first-entry timing model. Selecting A does not choose elapsed days versus a
source-selected absolute date, a numerical period, calendar arithmetic,
default/maximum, staff date-edit power or a grace/renewal mechanism.
Selecting B likewise does not choose its numerical entry and working periods.

After the founder's answer, adversarially review the chosen model and record
the exact required amendments. Initial duration and usable cohort qualification
follow that dependency. Active-expiry recovery, Q08 fresh timing/repetition and
notifications remain explicit separate decisions.

At question preparation, no ADR-0011 or new glossary term was created for
the unanswered question. No runtime tests were run for that documentation-only
ratification/research. No product, schema, provider, permission or dependency
changed during that preparation.
Formal owner/OpenSpec publication awaits `/to-prd`; tickets await `/to-issues`.

## Historical founder answer and review — before ratification, 2026-10-20

Conrad selected A and requested the full adversarial review, modern primary
research, all journeys, edge cases and exact amendments. The
[completed review](phase29-q11-adversarial-review.md) recommends
Accept with required amendments: the exact corrected decision, Q11-C01–C22,
Q11-P01–P30, eight journeys and eight operational controls.
The [feature ADR](../docs/adr/0011-fixed-unfinished-deadline-at-source-issuance.md)
records selected/reviewed status; the complete package awaits ratification.

The review distinguishes original source access from credential/message
issuance, immutable admitted outputs from retry intent, actual source outcomes
from provider uncertainty, and causal historical eligibility from late
retroactive issuance. Proof outages fail closed without a false terminal verdict.
P12 capability/participant integration and Q10 stage scope remain binding.
No initial count/formula, extension/recovery power, reminder, Q08 setting,
implementation, publication or Q12 choice is inferred.

## Ratification — 2026-10-21

Conrad subsequently ratified Q11 A and all required amendments: the exact
corrected decision, Q11-C01–C22, Q11-P01–P30, reviewed lifecycle/UX and eight
operational controls. The preceding selection/review account remains dated
provenance. The ADR and review now record adoption. No additional duration,
calculation, authority, communication, implementation or publication is inferred.
