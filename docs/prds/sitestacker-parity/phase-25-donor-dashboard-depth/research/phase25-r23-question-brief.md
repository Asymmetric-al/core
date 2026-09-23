> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

> **Fully ratified, 8 September 2026:** Conrad accepted Question23 A1–A4/J01–J16/V01–V12/C01–C22, including the monetary definition, issuer-based calendar periods, three-row Maia default and narrow US credit-card dating clarification. T01–T18 remain required target proof. Earlier provisional wording below is historical; ratification does not certify implementation, live behavior or general tax compliance.

> **Current status, 8 September 2026:** Conrad selected A, This year so far. The [completed Question23 adversarial review](phase25-r23-adversarial-review.md) records corrected execution awaiting ratification. The unanswered wording below is historical pre-answer research.

# Question 23 — What the giving summary on Home emphasizes

8 September 2026. **Question 22 is fully ratified**, including its two-line previews, stable arrangement ordering and reviewed Maia defaults. **Question 23 is unanswered.** This is one researched founder choice in the Phase 25 Grill with Docs session, not a formal specification or implementation authorization.

## The one decision

For an account holder with available giving records, what should the main giving summary on **Home** emphasize: this calendar year so far, giving across the available history, or their most recent gift with totals left in Giving history?

This is Home's financial orientation. It does not change Q10's all-available Giving history default, Q19's welcome when no financial records are available, Q12's compact current-action section or Q22's Current/Past recurring management. It does not decide accounting calculations, a tax year, permissions or financial retention.

The roadmap requires qualified cumulative totals in Phase 25 but does not require a total card on Home. C therefore remains a real alternative. We should choose the main emphasis rather than fill Home with equally prominent year-to-date, all-time and latest-gift cards to avoid the decision.

## A concrete example

Illustrative Maria opens Home in September 2026. In the same authorized giving context and currency, her qualified records show **USD900 for 2026 so far** and **USD4,800 across the available history**. Her most recent gift is **USD100 to School project on 1 September**. Assume simple fully received monetary gifts with complete coverage and no corrections for this example; this is not a calculation specification or observed donor study.

<!-- prettier-ignore -->
| | **A — This year so far. Recommended.** | **B — Across available history.** | **C — Most recent gift; totals in History.** |
| --- | --- | --- | --- |
| Main Home summary | **Your giving in 2026 — USD900**, with a direct route to the relevant gifts and easy access to other periods/history. | **Giving across available history — USD4,800**, with clear coverage and a direct route to its records. | **Most recent gift — USD100 to School project, 1 September**, with its actual outcome/detail and a route to History's cumulative totals. |
| What it helps Maria understand | Her giving in a familiar current period. | Her longer recorded relationship with the organization. | A specific recognizable gift and what happened to it. |
| Strongest benefit | Useful current-year orientation without opening a reporting screen or doing arithmetic. | Continuity: the headline does not reset in January and includes older recorded generosity. | The lightest Home presentation; concrete information instead of a prominent cumulative number. |
| Main tradeoff | Can be zero early in January even for a longstanding donor; period labeling and historical access must make that understandable. | Imported/incomplete records make an unqualified Lifetime total misleading; historical corrections/imports can change it. Less direct for a current-year check. | Maria must open History to answer how much she has given this year or overall. Her newest gift can also need pending/refund/correction context. |
| Full history and documents | Complete authorized History and Receipts & statements remain available. | Same access. | Same access; required cumulative totals remain in the product. |

These are alternatives for the primary emphasis, not mutually exclusive access rights. Supporting information can remain appropriately restrained. The choice does not authorize an additional metrics dashboard, donor ranking or a configurable Home builder.

## Best recommendation

**Choose A — This year so far.** A small, clearly dated summary gives donors a practical point of orientation while the rest of Home remains useful for ministry connection and self-service. It complements Current recurring giving and Receipts & statements without making a person's cumulative financial amount the main account identity.

Use plain wording such as **Your giving in 2026** or **Giving this year so far**, with the actual year visible; do not rely on the acronym YTD. Give the donor a clear route to the matching records and other periods. A deliberate View 2026 gifts link may open that qualified History filter; ordinary neutral History entry still starts with all available history under Q10.

The strongest case for B is acknowledging a long relationship that should not appear to vanish each January. A preserves that history visibly and must distinguish no giving in the selected year from no available giving records. The strongest case for C is restraint and concrete recognition. I prefer A because it supplies useful cumulative orientation directly without requiring the donor to enter History first. This is product judgment, not a measured Asym preference or a claim that every donor plans around calendar years.

No Asym study proves this default improves retention, giving, satisfaction or support volume by a particular amount. The sources below establish useful current patterns; they do not supply a universal winner.

## Current primary research and conflicts

<!-- prettier-ignore -->
| Source checked | Verified finding | What transfers, and what does not |
| --- | --- | --- |
| [Planning Center's refreshed My Giving](https://www.planningcenter.com/changelog/giving/improved-refreshed-my-giving-experience-in-church-center), 3 November 2025; corroborated by its [current giving guide](https://help.planningcenter.com/en/140951-manage-your-giving-information.html), 3 September 2026 | The redesigned overview exposes year-to-date and prior-year totals alongside management access. | Strong nonprofit precedent for A's annual orientation. It does not require two equal cards, pledge aggregation or the provider's authority/model. Its faster/easier marketing statement is not independent comparative donor evidence. |
| [Tithely Year to Date Giving Tracker](https://help.tithe.ly/hc/en-us/articles/34331741096343-Year-to-Date-Giving-Tracker-for-Donors), updated 5 January 2026 | Defaults to January 1–today and links to full History; distinguishes no donations ever from no donations in the selected period. | Supports a clear annual default and honest empty-period states. Its Total Given includes pending gifts and it adds comparison percentages; those are not adopted into Core's source-qualified received-giving meaning or calm Home. |
| [ACS MinistryPlatform My Giving](https://help.acst.com/en/ministryplatform/help-topics/widgets/giving-widgets/my-giving), updated 8 July 2026 | Supplies period-selected totals and separate transaction detail. | Useful dated-summary precedent. Its four-year history limit, household visibility, soft-credit option and dashboard charts do not override Q04/Q10 or Core's source boundaries. |
| [Fundraise Up external donations](https://fundraiseup.com/docs/offline-donations/) | Describes the role of imported external gifts in complete donor history and lifetime reporting. | Supports B's coverage caution. Its conversion to account currency and email/CRM synchronization policies do not govern Core. It is not evidence of a specific donor Home default. |

The WeGive donor-guide search index also describes a lifetime-oriented overview, but this root pass could not fetch the guide directly (404). It is not used as confirmed-current evidence or as the foundation for B. B remains a credible product alternative on its own merits. No financial definitions are copied from marketing screenshots, donor CRM staff analytics or incomplete source previews.

## Repository facts and why the decision is still open

Inspected source HEAD: `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. Three independent owner/product/UX passes checked this frontier.

- Q01 accepted a calm self-service Home, not a final metrics layout. Q12 settled current actions; it did not choose a giving metric.
- Q10's question brief explicitly excludes deciding a lifetime total. Its all-available default applies to the History list, not every dashboard summary.
- Q19 requires truthful financial sections when owners provide them and handles qualified absence. It does not select the first financial period for accounts with records.
- `docs/prds/sitestacker-parity/roadmap.md:2871–2874` requires cumulative totals partitioned by currency and confines converted comparisons to explicitly labeled Phase 33 reporting. It does not mandate a Home total card or period.
- P13's contribution-ledger/current-effective projection and P7's dating authority retain financial ownership. A period choice does not select gross/net/fee treatment, soft credit or deductibility.
- The current Home renders **Total Given YTD**, Active Support and Latest Impact (`donor-dashboard-main-body.tsx:34–45,80–102`). Its model sums modeled successful gifts by UTC-derived year and falls back to donor counters/subsets for other totals (`model.ts:347,388–399,471–487`). The snapshot caps gifts 250/pledges 100 (`service.ts:205–224`). This establishes incomplete current behavior, not correct amount/currency/date/coverage or ratified Home authority.

Do not preserve the current card merely for consistency, and do not sum the loaded History rows to implement either aggregate. A qualified server summary is a source projection with known scope, measure, date basis and currentness; it is not another stored donor balance.

## Boundaries common to the options

1. **Same financial truth.** A/B change the time emphasis, not the authoritative measure. The selected execution must reconcile the owner-defined current effective giving value, adjustments, fee cover and date basis; it must not silently reuse the original non-fee-cover History filter amount, processor total, mutable donor counter or deductible amount.
2. **Original currencies and legitimate scope.** Keep currency partitions, legal donor/issuer context and admitted fields exact. No silent FX, shared-email/household inference, cross-Tenant total or combining personal and represented giving. A hidden gift cannot leak through the total.
3. **Pending means pending.** Bank submission, planned recurring support and fixed promises do not become received money to make the summary feel positive. Source-qualified ongoing processing remains visible in its proper existing place without being added to a received total.
4. **No false lifetime promise.** All available records are not necessarily a person's entire lifetime. Historical imports and corrections retain source provenance/coverage. Missing or incomplete data cannot become zero or a complete total.
5. **Zero this year is not a new donor.** January rollover, a quiet giving year, refunds or mixed currencies must not trigger Q19's financial-absence interpretation. Preserve the person's normal Home, history and authorized current work.
6. **Summary is not a tax statement.** Show the year/period plainly without claiming a fiscal/tax-year or deductible value. Official receipt/statement interpretation remains with its owner and Q08/Q13. This question makes no new legal rule.
7. **No pressure or fabricated impact.** No giving target, donor ranking, up/down score, inferred ministry outcome or permission based on donation size. Ministry Updates remain independent and prominent in their existing place.
8. **Preserve the product's established navigation.** Exact summary links can identify an explicit filtered task; neutral History stays All available. No persistent per-donor default, additional year chooser, comparison panel, chart or All-time card is silently approved now.
9. **Qualified availability and bounded work.** Summary errors are locally understandable and do not block safe account functions. Neither aggregate requires a browser fetch-all, new reporting store or mixed-owner atomic snapshot.

## What follows the answer

Review the selected emphasis against precise source money/date/coverage/authorization, year rollover and zero/negative/unknown/multi-currency presentation, exact History navigation, low-bandwidth/mobile accessibility and the shared Maia composition. Map the full donor journey and adversarial requirements before seeking corrected-execution ratification. This step asks only the main Home giving emphasis; it does not publish a PRD or implementation tickets.

Question 22 ratification is recorded in the [grooming notebook](../decision-log.md). Its pre-ratification bundle remains unchanged. Q14 G01 remains an unresolved native contract. No new target runtime test, donor interview, financial action, dependency upgrade or canonical source change is claimed for this question research.

**Founder decision pending: what should the giving summary on Home emphasize?**
