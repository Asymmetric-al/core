# D28 financial evidence — explainable giving patterns

2026-10-11 UTC; repository HEAD `225c02e9499bd6c0d493223cd4b1a4120ff787e3`.
Research-only recommendation for the founder's combined answer: foundational
facts plus optional, tenant-disableable ratings. Contracts below establish
accepted owner intent, not deployed functionality. Formulas, defaults and
acceptance examples are proposed product judgments, not executed tests or
empirically validated predictions of generosity, engagement or future giving.

## Source boundaries

- [P13 §E:784–824](../../../../prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md:784)
  defines one contribution header, designation lines, append-only postings,
  effective-value reads, per-header revision and integer minor units. A split,
  correction, provider retry or posting is not another gift.
- [P14 §C:432–471](../../../../prds/sitestacker-parity/phase-14-donor-credit-operations.md:432)
  requires separate Legal giving and Recognition giving, canonical party/roster
  readers, currency partitions and MAX-per-party/header recognition across
  roles. Matching expectancies are outside both vocabularies. P14 explicitly
  defers ranking semantics to P27. [Household §I:1141–1159](../../../../prds/sitestacker-parity/phase-14-donor-credit-operations.md:1141)
  derives recognition from gift-date membership and explicit exceptions, without
  creating gifts or combining legal donors.
- [P15:72–78](../../../../prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md:72)
  preserves the financial posting front door; noncash capture describes rather
  than values assets. [P16:983–1003](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:983)
  conserves fulfillment applications; [1101–1124](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:1101)
  separates Received, expectations and monthly-equivalent planning arithmetic.
- [P24:434–450](../../../../prds/sitestacker-parity/phase-24-multi-site-management.md:434)
  separates presentment currency from settlement, FX, payout and issuer identity.
  Its launch limitation of one active giving issuer does not make Site the
  financial owner or erase historical issuer identity.
- [P25 financial D12:125–139](../../../../prds/sitestacker-parity/phase-25-donor-dashboard-depth/contracts/financial.md:125)
  supplies a precise reusable monetary basis and qualified gift-date rules.
  Its Home-specific calendar-year presentation and prohibition on Home rankings
  do not decide P27's observation period or optional ratings.
- [P33 roadmap:4603–4627](../../../../prds/sitestacker-parity/roadmap.md:4603)
  requires shared metric semantics, exact entity/currency/source/coverage and
  current recipient projections. Native P27 analysis need not wait for Report
  Studio, but must not invent a competing financial definition.

## Fresh primary practice and its limits

All three official pages were read on **2026-10-11**; no article revision date
was displayed. This is documentation evidence, not a product execution study.

[Salesforce, Configure RFM Scoring in Nonprofit](https://help.salesforce.com/s/articleView?id=sfdo.npc_fr_set_up_rfm_scoring.htm&language=en_US&type=5)
documents Lightning Enterprise, Unlimited and Developer editions with Nonprofit
Cloud, **not NPSP**. Administrators select aggregate source fields, weights and
non-overlapping numeric ranges. Inputs must have consistent units because the
scoring operation does not convert them. This supports explicit ranges and
explainable inputs, not importing its weights or deciding Core's thresholds.

[Blackbaud Raiser’s Edge NXT, RFM Giving Analysis](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/en-gb/content/bb-rfm-analysis.html)
describes recency, frequency and monetary giving. Its engagement/prediction
claims are vendor guidance, not demonstrated evidence that monetary patterns
measure this ministry relationship. Separately,
[Blackbaud Luminate Online, RFM Segmentation Task](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/lo/content/data_management_task_administration_recordinfo_newrfmsegtask.html)
documents percentile calculations and scheduled profile updates. That is a
different product and one possible method, not an industry requirement or an
RE NXT formula. Neither source justifies automatic contact or staff supervision.

**Recommendation:** three separately explained absolute-range results for
recency, frequency and amount; no weighted composite or cohort-relative rank.
Population changes should not change someone's result without changed inputs or
an explicitly changed policy. This is a simplicity and interpretability judgment,
not a measured superiority claim.

## Smallest exact financial contract

**F01 — Declare the basis.** Every result carries tenant, canonical subject,
qualified purpose/designation scope, one lens, receiving Legal Entity, original
currency, exact date range, as-of date, source/coverage versions and policy
version. Current authority governs the permitted projection independently.
Default configuration may start with direct legal giving by Party, issuer and
currency, visibly **Giving to [organization]**. Inside a ministry partnership this
must not imply that all those gifts supported that ministry. Offer narrower
purpose or recognition profiles only through existing qualified owner readers;
do not create an arbitrary analytics builder or infer designation from the
journey, current campaign hierarchy or today's household membership.

**F02 — Count accepted occurrences.** For the exact basis, let `G` be the distinct
source contribution roots with a qualified gift date in the observation period
and a positive current eligible amount `q(h)`. Obtain `q(h)` from P13's effective
legal fold or P14's qualified per-party/header recognition result. Never sum the
lenses. Never implement recognition by summing raw role rows; the owner must
qualify line allocation and role deduplication together. Two genuine equal gifts
on one date remain two; one gift with three designations remains one. A scoped
profile includes only its admitted amounts, not the whole header's sibling
allocations or fee-cover lines merely because they share the gift.

**F03 — Explain three facts.** For that set:

- **Frequency:** `F = count(G)` — positive effective monetary gift occurrences
  in the displayed period, not transactions, installments planned or messages.
- **Amount:** `M = sum(q(h))` in exact integer minor units of one currency.
  For legal monetary giving, include actual charitable fee cover where admitted;
  apply finalized returns/corrections; do not subtract processor charges or tax
  benefits. Recognition amount remains explicitly recognition, not cash or a
  deductible amount, and is not additive across people.
- **Recency:** `R = issuer_as_of_date − max(qualified_gift_date in G)` in calendar
  days. Label it as recency of a qualifying gift within the displayed period.
  With complete coverage but no `G`, show **No qualifying gift in this period**;
  there is no invented numeric age. `F=0` and `M=0` can be known facts. An older
  source-qualified gift can appear separately without pretending it was in `G`.

This deliberately bounded definition prevents incomplete lifetime history from
masquerading as an exact last-ever gift. If any participating unresolved fact can
change an axis, that axis is unqualified; independently complete facts can remain
usable with their own basis. Missing dates cannot silently disappear from the
count while the result claims complete coverage.

**F04 — Correct without rewriting history.** A partial refund keeps one positive
occurrence with reduced amount. A fully returned gift leaves `G`; the original
gift and return remain in history. A refund request or unknown outcome does not
reduce posted money. A qualified source-posted provisional check may count while
return-exposed; unposted ACH does not. Corrections apply to the original effective
gift-date cohort, unless the owner corrects that date. Show the correction cause;
do not claim the person stopped caring because current-net recency changed.

**F05 — Keep participation and expectations visible separately.** A DAF sponsor's
grant is its legal gift; advisor recognition is not another donation. An
employer's actual match is a separate legal gift, while a match expectancy is not
received money. Church-member and household recognition require P14's exact
scope, dates and current projection. A pledge, D25 reported handoff, recurring
authorization, monthly equivalent, asset valuation or sale proceeds cannot
inflate RFM. One securities gift does not become another gift on liquidation.
Noncash/prayer/hosting participation remains meaningful without a monetary rating.

**F06 — Configure a bounded policy, not financial truth.** New-tenant ratings Off
and separate optional review activation are the root review's proposed defaults.
An enablement preview can start at **past 12 calendar months through issuer
today**, editable before activation; this is a practical proposal, not a
validated benchmark. Choose from bounded supported periods, show exact endpoints,
and define month-end/leap-day behavior once. Do not conflate trailing 365 days,
12 calendar months, calendar year, fiscal year or year-to-date. A fiscal period
must come from a qualified fiscal calendar, not Site/browser locale.

Require explicit, versioned absolute band bounds in days, gift counts and the
selected currency's minor units; do not silently seed supposed industry cutoffs.
Three bands need two ordered cutpoints per numeric axis, exhaustive intervals
with no gaps or overlaps, and honest numeric labels. Empty-period recency remains
a separate nonnumeric condition. A known-zero amount/count may be classified by
the disclosed financial ranges, never labeled a low-value relationship. Missing
policy means facts remain available and ratings are not configured. Preview uses
only authorized data; it needs neither a minimum cohort nor population percentiles.

**F07 — Compare like with like.** Annual or seasonal giving can be regular with
one gift; P16 commitments and agreed timing supply independent context. Never
compare partial YTD amount with a complete prior year as if the periods matched.
Clock aging and a gift leaving a rolling window are explainable changes, not
proof of disengagement. Changes of lens, currency, subject, scope, ranges,
coverage, identity or historical attribution establish a fresh comparable basis;
they do not manufacture adverse review events. Incomplete imports, permission
loss, asynchronous recognition processing and source failure are not zero.
Rating disablement cannot dismiss separate P15/P16 obligations.

## Graded concerns and meaningful acceptance proof

Severity and likelihood are qualitative engineering judgments, conditional on
the proposed feature; no incident frequencies or user-study results are claimed.
The following are future qualification examples, **not tests run here**.

| Concern                                                            | Severity / likelihood                  | Evidence and exact correction                        | Acceptance example                                                                                                                                                                     |
| ------------------------------------------------------------------ | -------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Split gifts or retries inflate frequency                           | High / likely without explicit grain   | P13 §E; F02–03 count roots, not child rows           | One gift, three lines and two retried events gives F1; a second actual identical gift gives F2.                                                                                        |
| Legal/recognition mixing fabricates money                          | High / likely in a unified timeline    | P14 §C/I; F01–03 keep lenses and owned deduplication | One employer gift with employee and contact roles produces one source-qualified recognition occurrence for that person, not two or extra legal money.                                  |
| Entity-wide gifts misrepresented as ministry support               | High / plausible                       | P13 line ownership/P14 scoped readers; F01–02        | A gift split between ministries contributes only admitted scoped amounts; entity profile explicitly names its broader basis.                                                           |
| Currency or monetary basis changes the bands                       | High / plausible                       | P13 §E/P24/P25 D12; F03/F06                          | USD, JPY and three-decimal currency amounts retain exact units and separate bounds; settlement FX and processor costs cannot move presentment-giving bands.                            |
| Financial correction appears to be relational decline              | High / likely over time                | P13/P25 source inverses; F04/F07                     | Partial/full return changes current amount/count correctly; history persists and correction cause is distinguishable from elapsed time or a newly received gift.                       |
| Promises, noncash or indirect giving becomes “low engagement”      | High / likely across ministry contexts | P14/P15/P16; F05–07                                  | Annual supporter, DAF advisor, prayer-only partner and pending handoff retain appropriate facts; inapplicable direct-giving analysis creates no adverse review solely from zero.       |
| Imported/hidden/undated records silently disappear                 | High / plausible                       | P13 source versions/P33 coverage; F03/F07            | Incomplete backfill or unknown gift date cannot yield a claimed complete lower rating; re-import of one external occurrence adds no gift. Fully adjusted zero differs from no records. |
| Household/Party merge duplicates or rewrites giving                | High / plausible                       | P13 frozen donor snapshot/P14 §I; F01–02/F07         | Qualified identity resolution deduplicates source roots; spouse membership uses gift-date windows. Merge does not rewrite financial provenance or replay a drop.                       |
| Annual/fiscal comparison or policy edit manufactures deterioration | Medium / likely without definitions    | P16 planning distinction/P33 semantics; F06–07       | Leap-day/month-end endpoints are explicit; changed bands or fiscal calendar establish a new baseline, and annual giving is not automatically late.                                     |

One remaining owner seam is deliberately not resolved by this appendix: P13's
older source-code/campaign discussion contains live-tree versus frozen-at-gift
wording ([1596–1633](../../../../prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md:1596)).
Qualify that exact attribution basis before enabling a campaign-scoped financial
profile; it need not block direct legal giving or other independently qualified
facts. No new financial authority, attribution engine, tax conclusion, mandatory
review queue or financial-worth claim follows from D28.
