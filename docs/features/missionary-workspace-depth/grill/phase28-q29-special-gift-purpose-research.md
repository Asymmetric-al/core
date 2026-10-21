# Q29 — additional support without a specific one-time need

Research date: **October 17, 2026 UTC**. **Q29 is answered A.** D28 and its
amendments remain explicitly ratified. The founder selected explicitly additional
gifts and requested the full [D29 adversarial review](phase28-d29-additional-gift-purpose-adversarial-review.md),
which returns **Accept with required amendments**. The founder explicitly
ratified the corrected decision and required amendments on October 18, 2026 UTC. The founder separately selected authorized staff and missionaries
when the organization permits confirmation. The
[original unanswered brief](d29-evidence/q29-before-answer.txt) is preserved.
This selection resolves one sufficient additional-purpose case, not every other
special-gift criterion reserved by D21-C03. It creates no formal specification
and does not qualify an implementation.

## The single choice

Grace already supports Maya's ministry. The organization receives another gift,
and Grace explicitly identifies it as additional support. It is not connected
to a named appeal or specific one-time need. In this illustrative case, no other
automatic-follow-up reason applies, including first support, an amount rule,
above-commitment support or fulfillment: there is no
recorded commitment to compare against, and the amount rule does not qualify.
Absence of a commitment is not itself evidence of special purpose.

**Should a gift explicitly identified as additional support qualify for
automatic personal follow-up without a specific one-time need?**

- **A — Include explicitly confirmed additional gifts (recommended).** When the
  gift's additional-support purpose is properly recorded and confirmed under the
  source rules, it can qualify independently of an appeal. Maya sees the factual
  reason in her existing follow-up task.
- **B — Require a specific one-time need.** This special-purpose branch applies
  only to gifts for an identified one-time need. General additional support does
  not qualify for this reason; other automatic reasons and Maya's manual
  follow-up remain available.

Neither option sends a message, changes a financial application, requires a
donor to complete a new checkout form or defines a gift as special merely because
it was paid once. B still requires a qualified special purpose and exact gift
attribution; a campaign label or working-list membership alone is insufficient.

**Recommendation:** A recognizes explicitly additional support even when it has
no specific one-time need. It can include a small gift without inventing a
historical anomaly. B need not demand a formal appeal if the owning source can
qualify the identified one-time need another way. The strongest argument for B is a narrower initial scope
and fewer purpose-recording paths to maintain. Its cost is that legitimate
general additional support does not automatically create this kind of work. B is an
explicit product limitation, not evidence that appeal attribution is already
implemented or inherently trustworthy. Neither option switches required native
stewardship off or makes it depend on Workflow Studio.

## Why this is a new decision

- [D21](phase28-d21-explicit-gift-follow-up-adversarial-review.md#required-clauses-for-later-specification)
  C02–C04 require independently qualified purpose, reject historical size and
  missing-commitment shortcuts, and explicitly reserve missing native criteria.
  They do not decide whether expressly additional support without a specific
  one-time need is eligible.
- [D19](phase28-d19-first-support-follow-up-adversarial-review.md) settles first
  support; [D20](phase28-d20-grouped-special-gift-follow-up-adversarial-review.md)
  settles one current task with exact gift-level handling. Neither defines all
  qualifying special purposes.
- [D22](phase28-d22-amount-based-gift-follow-up-adversarial-review.md#exact-corrected-decision-to-record)
  is a separate optional organization-wide amount rule. It does not call the
  gift extra support and is not a minimum amount for another valid reason.
- [P27 Request and appeal rules](../../../prds/sitestacker-parity/phase-27-donor-development/requests.md:818)
  say that working-list membership, links and responses do not themselves create
  automatic work. A formal appeal association is not a substitute for purpose.
- The [founder brief](phase28-founder-brief.md:165) and
  [owner constraints](../../../prds/program-roadmap/owner-constraints.md#phase-28)
  require native special/above-commitment work. Manual-only replacement of that
  required capability is not an unchanged-scope alternative.
- [MPD-01](../../../prds/workflow-studio/07-core-workflow-catalog.md:2667) is a
  later configurable workflow with unresolved exact source binding. It cannot
  silently decide this native scope or become its prerequisite.

Independent governance reviewers and a primary-product research reviewer agree
that additional purpose without a specific one-time need remains a genuine
scope choice. Their reviews also
rejected one-time payment, no commitment and generic manual-only alternatives.

## Current behavior, ownership and consequences

**Current source, freshly inspected:**
[missionary task creation](../../../../packages/api/src/missionary-portal/tasks.ts:30)
accepts ordinary task inputs and writes `is_auto_generated: false`. This bounded
inspection does not establish an operating special-purpose producer. No hosted
database or end-to-end task creation was tested for this question.

**Inherited owner facts:** P13 owns received monetary facts and their applicable
allocations; P14 owns recognition; P16 owns commitment application. P28's
stewardship purpose and the P9 shared task contract must consume those facts
without changing their authority. [ADR-0183](../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:622)
requires a purpose-owned independent task and durable source projection intent.
An event worker cannot infer purpose by parsing private message prose.
[P16 application rules](../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:1004)
also distinguish exact qualified authority from notes or matching suggestions;
[its no-inference boundary](../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:1019)
prevents excess from silently becoming prepayment or another commitment effect.

**If A is selected:** the ensuing review must define the smallest authorized
evidence path for a donor-stated additional-support purpose, including who may
record/correct it and how it relates to the exact received gift and permitted
allocation. Selecting A does not itself approve a generic special checkbox,
unreviewed import field, automated prose classifier or missionary financial
mutation. Protected message bodies cannot be copied into shared task evidence.

**If B is selected:** the special-purpose branch needs exact eligible one-time
need and gift attribution through its qualified Request/appeal or other owning
source. Merely joining an appeal that
seeks ordinary recurring support must not qualify it. Existing independent
first-support, amount and above-commitment reasons remain unchanged.

**For either answer:** the current Tasks Hub remains the destination. Qualification
must recheck current scope, privacy and source corrections, use D20's existing
grouping/coverage and preserve completed history. Receiving money, creating a
task, logging an interaction and sending a message remain separate facts.
The later authorized design will need source records/commands, permission tests,
read projections and clear UI states; no schema, ticket or new database is
created in this question-preparation turn.

## Primary comparative evidence

These pages were freshly read on **October 17, 2026 UTC**. Publication age is
reported separately; a live help page does not prove current authenticated
product behavior, user demand or a Core implementation.

| Source                                                                                                                         | Documented behavior                                                                                                                                        | Useful lesson and limit                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [TntConnect — Dealing with gifts](https://www.tntware.com/tntconnect/help/en/pages/gifts_dealingwith.aspx), undated manual     | Describes an additional gift smaller than the regular pledge that its amount detector misses, and a larger gift interpreted as catch-up.                   | Additional purpose cannot reliably be inferred from size. Do not import its donor-status or historical heuristics, duplicate ledgers or adjustment workarounds. |
| [TntConnect — Campaigns and promises](https://www.tntware.com/tntconnect/help/en/pages/campaignsoverview.aspx), undated manual | Campaigns can seek recurring increases; whether campaign gifts fulfill pledges is configurable.                                                            | Campaign association alone does not prove additional support. Core's financial application rules remain authoritative.                                          |
| [MPDX — Appeal flows](https://help.mpdx.org/article/774-flows-view-for-appeals), updated October 13, 2022                      | Users can select the exact processed gift for an appeal when regular and special gifts both arrived; gifts in hand are distinguished from processed gifts. | Keep exact gift attribution and honest financial state. This page does not define a universal special-gift task rule or validate outside-appeal purpose.        |
| [DonorElf — News Feed Events](https://donorelf.helpscoutdocs.com/article/34-news-feed-events), retrieval returned 404          | The previously cited help page could not be read live.                                                                                                     | Historical indexed descriptions cannot establish current classification behavior. No new claim rests on them.                                                   |

These examples support explicit reasons and precise gift attribution. They do
not establish that every ministry needs this scope. The recommendation is a
product judgment, not an invented interview result or donor-retention claim.

## Whole journey and counterexamples checked

The donor gives through the existing flow. The organization records actual
money through its existing owner. Qualified purpose evidence, if available,
allows the existing native follow-up owner to admit the gift once. Maya sees
an understandable reason, such as **“Additional support confirmed”**, and the
permitted gift details in the current task. She handles the reviewed group once.
The wording is illustrative and not a new financial label or a selected UI field.

Do not add an appeal-creation detour, new donor questions, a separate task list,
an extra routine confirmation or raw evidence prose on the queue card. Missing
qualification must not be displayed as “not special,” “no support” or a fabricated
zero. Manual follow-up remains available without falsely consuming automatic
purpose coverage.

- A smaller expressly additional gift can qualify under A; the amount rule is
  irrelevant to that reason.
- A large ordinary installment or catch-up payment is not additional merely
  because of amount. Its distinct amount-based reason may still qualify.
- A one-time checkout payment can fulfill ordinary recurring support. Payment
  frequency is not purpose, and no visible commitment is not confirmed absence.
- A generic appeal may seek normal monthly support. Neither option treats any
  appeal link as sufficient special purpose.
- A gift split between ordinary and additional support requires exact eligible
  source allocation; the whole gift cannot be casually classified or exposed.
- A private message, gift memo or imported label alone is not an authorized
  source fact. Recording a purpose must not widen access to its supporting body.
- Corrected, reversed, historical-only or already-handled gifts retain D19–D22
  lifecycle and durable coverage. A purpose edit cannot mint duplicate outreach.

These are reasoned checks against governing contracts, not a new executable
model in the original brief. No prior finite-model or database experiment was
rerun. The founder subsequently selected A; the [D29 review](phase28-d29-additional-gift-purpose-adversarial-review.md)
supplies exact now-ratified purpose, permission, timing, partial-gift, correction, UX
and proof clauses, plus a new bounded semantic model. The founder separately
selected authorized staff and missionaries when permitted; no blanket actor grant,
measured UX result or runtime qualification is inferred. The former illustrative reason above is refined to
**“Donor-stated additional support”** in the ratified review.
