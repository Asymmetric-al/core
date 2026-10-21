# Q11 frontier: coaching access duration

Research date: October 16, 2026 UTC. **Answered A; direction recorded.** D10's corrected
decision and amendments are explicitly ratified, including C01–C20/P01–P28.
The founder selected ongoing sharing with an optional end date, emphasizing a
clean, clear, beautiful and easy user journey. The [D11 decision and design](phase28-d11-coaching-duration-decision.md)
records that answer and its reviewed clarifications. [D47](phase28-d47-coaching-share-through-date-decision.md)
subsequently adopts the whole-selected-day meaning; remaining details retain
their separately reviewed status. The original question below remains provenance. No access,
implementation or formal owner specification changes here.

## The original single product choice

**For an ongoing coaching relationship, should the missionary have to choose
when sharing ends?**

- **A — Allow ongoing sharing, with an optional end date (recommended).**
  Maya may keep Jordan's access active until she stops sharing, or set an end
  date, within the organization's current access limits and required reviews.
- **B — Always require an end date.** Each coaching share stops on a chosen
  date unless someone with current sharing authority deliberately extends it.

Illustrative scenario, not observed user research: Maya and Jordan expect to
work together over time, but do not know a useful finishing date. A lets Maya
share without inventing one; she can set a date for a genuinely temporary
arrangement. B makes every share time-limited, helping contain forgotten access
but requiring deliberate extensions when coaching continues.

Recommend A as the simpler ordinary experience, with clear access state and an
obvious Stop sharing action. This is product judgment, not evidence that every
organization wants ongoing external access. Applicable organization ceilings,
expiry and sensitive/restricted permission reviews still constrain it. The user
is choosing whether a scheduled end must be universal, not whether safeguards
can be bypassed.

## Why this remains open

The [founder brief](phase28-founder-brief.md:227) explicitly separates coaching
duration from invitation, modules, history, revocation and recovery.
[D8 C08](phase28-d8-adversarial-review.md) requires explicit validity/review
meaning while selecting no universal term. D9 adds optional financial summaries.
[D10 C02/C11](phase28-d10-adversarial-review.md) fixes the selected earlier
reporting dates and preserves current lifecycle authority; it selects no access
duration. None establishes that every share must expire on a scheduled date.

This is now a useful frontier question because the parties, read-only purpose,
optional financial modules and selected earlier-period behavior are settled.
It does not need an invented day count, a renewal notification workflow, a new
permission system or a per-module timer to be intelligible.

## Repository and primary evidence

Sources were inspected October 16, 2026. Repository text establishes intended
behavior, not deployment. External help describes the provider's product;
no authenticated vendor product, real coaching account or user study was tested.

| Source                                                                                                                                                                        | Verified relevance and limit                                                                                                                                                                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Founder brief](phase28-founder-brief.md:225)                                                                                                                                 | Invited coaching must settle duration alongside historical scope, exact read-only modules and recovery. No fixed length is supplied.                                                                                                                                                        |
| [D8](phase28-d8-adversarial-review.md), C07–C08/C13                                                                                                                           | Current stopping, expiry and non-revival requirements are already ratified. Invitations have their own expiry; coaching validity/review policy is a distinct concern.                                                                                                                       |
| [D9](phase28-d9-adversarial-review.md), C01/C13                                                                                                                               | Summary eligibility and sharing review do not supply a longer access term or automatic sharing.                                                                                                                                                                                             |
| [D10](phase28-d10-adversarial-review.md), C01–C02/C11                                                                                                                         | Fixed represented financial periods are separate from access lifetime. Extending a term cannot automatically enlarge the historical selection.                                                                                                                                              |
| [P12](../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1661), group governance at line 1594 and lifecycle at 2409–2417                         | Time-bound group governance and sensitive/restricted recertification remain applicable. Current context and revocation remain enforced; reactivation cannot revive expired or revoked grants. This does not select a missionary-set end date for every coaching share.                      |
| [Active identity OpenSpec](../../../../openspec/changes/sitestacker-parity/specs/identity-and-access/spec.md)                                                                 | Exact active context and the single source/projection authorization boundary still apply. Neither option creates a second access resolver.                                                                                                                                                  |
| [Current missionary app admission](../../../../apps/missionary/app/access.ts:3), read alongside D8's runtime evidence                                                         | The inspected role list has missionary/admin/staff/super_admin, not an implemented Coach entry or coaching duration contract. This file alone cannot prove every authorization path; current runtime does not settle the product choice.                                                    |
| [MPDX coach guidance](https://help.mpdx.org/article/510-for-mpd-coaches), updated October 28, 2020                                                                            | Documents explicit coach self-removal or missionary removal when access is no longer needed. It separately describes fundraising start/end dates. It does not establish that those dates expire access or prove the absence of other provider controls.                                     |
| [MPDX guidance for missionaries](https://help.mpdx.org/article/511-for-those-being-coached), updated August 17, 2020                                                          | Describes removing a coach when coaching is no longer needed. Its agency-specific compulsory initial coaching language conflicts with Core's voluntary coaching boundary and is not adopted.                                                                                                |
| [Google Drive sharing](https://support.google.com/drive/answer/7166529?hl=en), current official help, no exact update date observed                                           | Offers removal and an optional expiration action inside the sharing flow, subject to account/role restrictions. Supports a compact familiar interaction; its one-year limit, hierarchy and permissions are not Core policy.                                                                 |
| [Microsoft Entra lifecycle settings](https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-access-package-lifecycle-policy), updated November 20, 2025 | Distinguishes scheduled expiry, no scheduled expiry, extension and access review. Demonstrates separate lifecycle concepts, not a reason to adopt its access-package workflow, durations, approval queues or notices. The article body was readable despite a generic authorization banner. |

The strongest argument for B is stale access: a missed removal cannot leave
this grant active beyond its end. The strongest argument for A is continuity:
an arbitrary date creates recurring work and interruption for an ongoing
relationship. Neither pattern is universally superior. Retain current source
restrictions, clear status and deliberate stopping under either answer.

## Boundaries preserved whichever answer is selected

1. **Organization authority remains current.** Ongoing means no missionary-set
   scheduled end where allowed, not permanent access or exemption from current
   policy, membership state, revocation, eligibility expiry or required review.
   Missing configuration or a null database field does not itself mean ongoing.
2. **Four dates have different jobs.** Invitation expiry, coaching access end,
   fundraising target date and represented financial periods must not substitute
   for one another. Retention is separate again. The UI should label the actual
   access end condition rather than expose ambiguous “End date” fields.
3. **Stopping remains simple.** A scheduled future date does not prevent earlier
   authorized stopping. Ending this share does not delete source records or
   destroy another independently valid authorization. Known prior disclosures
   cannot be recalled.
4. **Extension is deliberate.** Continued login, reading, email delivery or a
   policy relaxation must not silently extend or resurrect an ended grant.
   Any later continuation uses current source authority and D8's episode rules.
   The coach cannot unilaterally extend the missionary's sharing permission.
5. **History stays fixed.** A longer access lifetime does not add new periods,
   raw financial records, private history or more modules. D10 continues to
   govern the exact earlier dates independently.
6. **One clear sharing review.** Show the effective end condition in the existing
   review and saved state. If the organization requires a date, do not show an
   available ongoing choice. Never label policy-limited access “forever.”
   Date-only/timezone/cutoff and renewal recovery need precise follow-through
   after the eligibility answer, without placing technical detail in the form.
7. **No incidental automation.** Choosing A or B does not authorize automatic
   renewal, a reminder cadence, coach alerts, a new review campaign or an expiry
   grace period. Existing owner-required notices/reviews remain independent.

## Verification and next step

This continuation uses scoped repository and primary-document research plus
documentation verification. Existing D8–D10 runtime/database probes retain their
recorded limits; none was rerun or represented as access-duration qualification.
No new Supabase schema, RLS policy, timer or service was chosen or changed.

The founder subsequently answered A. D11 now records the selected direction,
source/lifecycle interpretation, compact sharing journey and acceptance criteria.
No answer was inferred from the original recommendation. The session continues
with one independent resource-contribution question.
