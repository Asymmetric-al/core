# Q10 frontier: earlier support-summary periods for coaches

Research date: October 16, 2026 UTC. **Answered A; D10 and amendments ratified.** D9 and
its required amendments are explicitly ratified, including C01–C22 and P01–P30.
The founder subsequently selected optional earlier periods with exact-date review,
simple excellent UX and secure Supabase behavior. The completed
[D10 review](phase28-d10-adversarial-review.md) records the answer, exact proposed
amendments and new evidence. The founder subsequently explicitly ratified its
corrected decision, C01–C20 and P01–P28 on October 16, 2026 UTC.
The original frontier reasoning below remains provenance; no grant,
implementation or formal owner specification is changed.

## The original single product choice

**Should missionaries be able to share earlier support-summary periods with
their coach?**

- **A — Allow selected earlier periods (recommended).** The missionary may
  deliberately include eligible earlier support-summary periods within the
  organization's limits, with the exact dates clearly shown before saving.
- **B — Current period only.** Keep the coach's support summaries limited to the
  current reporting period; do not offer earlier-period browsing or trends.

Illustrative scenario, not claimed user research: Maya starts sharing support
summaries with Jordan. She wants Jordan to understand how her support has changed,
including eligible periods before this sharing began. A allows that deliberate
context. B keeps the native financial view focused on the current reporting
period, and they discuss older context separately without copying protected data.

Recommend A because earlier context can help interpret a current figure without
making all history visible by default. This is a product judgment supported by
documented coaching reports, not measured Asym demand or proof that one historical
window fits every ministry. It remains optional for each qualified share.

## What is settled, and what this question adds

[Ratified D9](phase28-d9-adversarial-review.md) selects optional expected/received
summary eligibility and exact source, disclosure and UX obligations. Its C01,
C07, C13 and C20 explicitly refuse to infer history, unrestricted period filters
or automatic migration grants. [Ratified D8 C08](phase28-d8-adversarial-review.md)
requires historical scope to be explicit, including chart points and derived
values. Neither chooses earlier financial periods for a coach.

This question is limited to the **financial reporting periods represented by
support summaries**. It does not include earlier check-ins, private notes, former
coaching conversations, task/interaction history, donor records or old goal
versions. Each of those retains its own source and audience requirements.

Invitation delivery is not the boundary: an invitation grants nothing, and a
coach may gain summary permission long after accepting an invitation. Earlier
summary disclosure is an explicit addition to the current share, under current
authority. No backdating of a grant, old identity or expired permission occurs.

The current-period alternative intentionally avoids a synthetic “since invitation”
or “since the toggle was clicked” financial period. Those cutoffs can truncate a
month and create misleading totals. B would still require the exact current
period to be reviewed and authorized; it does not claim that every represented
source fact arose after sharing began. Its distinguishing restriction is no
prior reporting periods. This choice does not select the current period's length.

## Source and primary-evidence check

| Source                                                                                                                                                           | Verified relevance and limit                                                                                                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Founder brief](phase28-founder-brief.md), lines 225–233                                                                                                         | Coaching historical scope and duration are separate unresolved concerns; trends are deliberately chosen, source-redacted and voluntary. No compulsory reporting or ranking follows.                                                             |
| [D8](phase28-d8-adversarial-review.md), C08 and C10–C12                                                                                                          | Exact subject/module/history authority, distinct financial meanings, current privacy checks and no inferred historical rights. The full multi-subject coaching experience is already ratified.                                                  |
| [D9](phase28-d9-adversarial-review.md), C01–C08/C11–C13/C20                                                                                                      | Optional financial summaries remain finite source projections. Earlier values, repeated releases and their combinations need qualified meaning and disclosure. D9 ratification does not select a date range.                                    |
| [P12](../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md), lines 2336–2417                                                          | Bounded coach-progress access is independent of general workspace/roster powers and participation. Current context and scope are re-resolved; reactivation cannot resurrect revoked grants. No universal coach-history entitlement is supplied. |
| [Active identity OpenSpec](../../../../openspec/changes/sitestacker-parity/specs/identity-and-access/spec.md), one validated context and one projection boundary | The current tenant/hat and source/entity restrictions cannot be widened by another role or consumer. This is intended behavior, not implementation proof.                                                                                       |
| [P16](../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md), H1–H3 and metric registry; line 2535                                          | The missionary's default calendar month, source schedule views and stored historical data do not grant a coach equivalent history. Source retention is not access policy.                                                                       |
| [D9 financial truth](d9-evidence/financial-truth.md) and [owner privacy](d9-evidence/owner-privacy.md)                                                           | P13/P7 gift-date cohort differs from import/creation time; historical expected schedules need their correct source meaning. Temporal differences and overlapping outputs can disclose restricted facts.                                         |
| [MPDX coach guidance](https://help.mpdx.org/article/510-for-mpd-coaches), inspected October 16, 2026                                                             | Documents a read-only, deliberately shared coaching view with historical giving/activity. Its 13-month graph and broader fields are vendor choices, not Core entitlements or privacy qualification. No signed-in product was exercised.         |
| [MPDX reports guide](https://help.mpdx.org/article/1253-mpdx-quick-reference-guide-reports), updated July 8, 2024; inspected October 16, 2026                    | Describes committed-versus-received history as part of coaching. Supports usefulness of temporal context; does not establish the ideal Core range, actual demand or efficacy.                                                                   |

## Necessary boundaries whichever answer is selected

1. **Represented dates, not record timestamps.** An old commitment can contribute
   to an authorized current expectation without granting its old terms/history.
   A newly imported old gift remains in its source gift-date period. An import,
   correction or new sharing event must not launder older facts into current scope.
2. **Current authority governs older data.** Earlier periods require current
   source/subject/field/privacy admission. Past permission, prior availability or
   a cache is not authorization now. Rejoining coaching grants no automatic history.
3. **Correct historical meaning.** A source-corrected gift total is not necessarily
   the value someone saw at that past time. Historical planned support must not be
   recreated from today's commitments or goal. Use an exact qualified historical
   metric, label its basis, and show unavailable if it cannot be established.
4. **Dates visible before sharing.** Use the existing sharing review, with a small
   set of source-qualified choices if A is selected. Do not introduce an arbitrary
   date-query builder or automatically attach all retained history. The actual
   selected dates and any ongoing range behavior must be explained accurately.
5. **History is not duration.** The period a summary describes differs from how
   long the coach may access it. This question selects neither access expiry nor
   a standing right to newly added historical fields/periods.
6. **History still needs privacy proof.** Apply the ratified D9 combined-output,
   correction, repeated-release and suppression requirements to charts, tables,
   comparisons and accessible alternatives. More history must not recover a hidden
   gift or identity. Missing/incomplete periods are not zero or poor effort.

## Alternatives and frontier discipline

An automatic fixed lookback would reduce one sharing choice, but would add both
default disclosure and an unselected range. Copying MPDX's thirteen months or
Core's existing chart/cache length is not sufficient justification. A configurable
report builder adds needless complexity and makes disclosure harder to qualify.

A is the preferred eligibility decision. The exact supported lookback/profile
and any range progression still need explicit definition before activation; this
research invents no month count or permission. B is a genuine narrower coaching
scope, not a ban on missionary historical views or ordinary conversation. It
reduces initial disclosure but limits longitudinal context.

Historical scope belongs next because it determines what the newly ratified
summary can usefully show when sharing begins. Access duration is a different
decision about how long that defined view remains available. Ask this question
alone; do not bundle duration, exports, broader finance or collaborative writes.

Only documentation/primary-source research and structural verification were
performed when preparing this question. The subsequent D10 review adds a new
actual-hook history probe and a separate synthetic PostgreSQL history probe;
their exact results and limits are recorded there. Existing D9 probes retain
their recorded limits; none was rerun or represented as historical-access proof.
