> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

# Question 10 — What Giving history shows first

> **Explicitly founder-ratified, 7 September 2026.** Conrad accepted Question 10's corrected execution, J01–J12 and C01–C22 with the reviewed additions. Historical proposal/ratification questions below are answered; do not re-ask them. Target implementation and release proof remain separate.

> **A selected, 7 September 2026.** Conrad chose all available history and requested continuous Virtual scrolling and common filters. The original A/B/C question below is answered; do not re-ask it. Corrected J01–J12/C01–C22 are in the subsequent adversarial review and await execution ratification.

7 September 2026. **Researched recommendation awaiting founder answer.** Question 09's mapped J01–J12 journey and C01–C22 are explicitly ratified. This is a grooming question, not a PRD/formal specification or implementation authorization.

## The one decision

On a fresh, neutral visit to Giving history, should the initial period be **all available history**, **this calendar year**, or **the last 12 months**?

This was deliberately left open in the ratified Q05 review. It chooses the default time window, not what records the donor is allowed to access, the authoritative date of a gift, the detail layout, an annual statement, a lifetime financial total or a persistent saved-filter preference. Qualified direct links and the donor's current browsing selection/Back position continue to preserve their intended context.

## Concrete examples

Illustrative scenario: Maria opens Giving history on January 8. She gave in December but has not given in the new year yet.

- **All available history:** her December gift appears among her latest records.
- **This calendar year:** the list accurately says there are no gifts in the selected new-year period, with an obvious way to view earlier years.
- **Last 12 months:** her December gift appears in the recent period, which crosses the year boundary.

Second scenario: David returns after an 18-month gap and wants to check his last gift. All available history can show it immediately when it is his latest authorized record. Both limited windows require changing the period. These are test examples, not claims about actual donor frequency or measured staff burden.

## Clear, fair alternatives

<!-- prettier-ignore -->
| | A — All available history | B — This calendar year | C — Last 12 months |
| --- | --- | --- | --- |
| Initial scope | All currently available authorized history, newest first, in bounded pages | January 1 through the current source-defined date within the visible calendar-year range | A rolling 12-calendar-month range through the current source-defined date, explicitly shown |
| Strongest benefit | A neutral record-finding entrance; avoids hiding an occasional donor's latest gift behind a time cutoff | A familiar annual frame and clear focus on this year's giving | A consistent recent view that does not empty merely because January begins |
| Main cost | Not an automatic year-to-date view; older browsing still uses continuation or a period filter | May open empty early in the year; prior December or older giving needs another period | Excludes older history by default and does not align with a calendar-year statement period |
| Frequent donor's first page | The latest records, with older records available on demand | Latest records within this year | Latest records within the rolling window |
| Finding a chosen older period | Use the visible period control or continue older | Change the visible period | Change the visible period |

**Recommend A — All available history, newest first, loaded in manageable pages.** It best fits a page named Giving history: start with the donor's available record rather than assume a reporting period. Year/date filtering remains easy, and the separately ratified Receipts & statements destination already serves the annual-document job.

A does **not** mean fetching every gift at once, displaying an enormous page, granting extra access, promising complete lifetime data or removing scope limits. Its label must remain truthful about available records and known coverage. The first page can be just as compact as B or C. It does not automatically add a lifetime total or a new chart.

B is a strong choice if an annual browsing frame is the priority. Its honest empty state and clear period control can work well; do not portray it as hiding older records permanently. C is credible for recent activity that spans a year boundary. Its moving range must be explicit; “last 12 months” must not silently mean365 days or an issuer's tax year.

No exact page size, filter-widget layout, retention duration or numerical performance/retention gain is chosen here. The implementation must meet existing source/authorization/continuation rules and measured workload budgets.

## Research evidence and pattern classification

Current primary donor documentation supports chronological history and period filters, but does **not** establish a universal winning initial window:

- [Church Center — Manage your giving information](https://help.planningcenter.com/en/140951-manage-your-giving-information.html), September 3 guide, describes entire donation history and year/fund filters. **Useful precedent** for complete access with optional period narrowing; it does not prove which year/window loads first.
- [Fundraise Up — Donor Portal experience](https://fundraiseup.com/docs/donor-portal-experience/) describes chronological one-time/recurring history when enabled. **Useful precedent** for recognizable date-ordered records; it does not establish an all-time versus current-year default.
- [Blackbaud — Giving history in Portal](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/ptl-feature-giving-and-history.html) describes lifetime giving-history access. **Useful precedent** for access beyond a recent window, not proof of initial paging/filter behavior. Its “lifetime” label is not a claim Asym has complete imported history.
- [eBay — Your purchase history](https://www.ebay.com/help/Buying/Finding_Items_Managing_Purchases/Your_purchase_history?id=4047) explicitly starts with the past 60 days and offers a year selector for older purchases. [Apple — View your purchase history](https://support.apple.com/en-us/118212), published 30 June 2026, describes a Last 90 Days filter in its device instructions. **Useful precedents** showing that recent-window defaults can be legitimate. Neither establishes a donor-specific advantage for a rolling 12-month window; their retention rules and other product behavior are not adopted.

These sources support offering older records and clear filters. The A recommendation is an Asym product judgment based on R01's self-service priority and Q05/Q08's distinct jobs, not a measured claim that other vendors chose A or that all modern dashboards use it. Recent-window patterns in general customer dashboards are legitimate alternatives; a particular vendor's 90-day/default-report/storage limit is not an Asym requirement.

Preserving owner-defined gift/date facts, current access, bounded deterministic continuation, truthful coverage and explicit period labels are **Durable patterns**. Current browser-year calculations, five-year options and totals derived from a capped loaded slice are **Implementation accidents/incomplete prototypes** to reconcile under Q05, not authorities to preserve merely because the screen exists.

## Repository and settled-decision checks

- [Ratified Q05 review](phase25-r05-adversarial-review.md), its Filter and continue section, explicitly recommends a bounded first page across available history but says the default is **not founder-ratified**. Its later review likewise leaves period/control defaults open. Q10 resolves that one remaining choice.
- Q05 keeps each source-owned gift, permitted allocations and later changes together. This default must not split gifts or turn refund/reversal event dates into new gifts/tax dates. Finding changes to older gifts remains a separate already-required outcome; selecting All history alone does not prove it solved.
- Q08's calm annual-document/individual-receipt overview is ratified. It neither determines History's default period nor allows History filters to govern document availability or official annual coverage.
- R04's personal/represented scope and exact-target entry remain in force. A default window never gives access to household/other-Party data or reveals inaccessible years/options/counts.
- Source dates and current authority come through their existing owners. “This calendar year” is a visible History period; it is not automatically an issuer tax year, browser-local year, UTC year or import-recorded year. Processing/failed source occurrences do not acquire invented contribution/tax dates. Each displayed/filterable date retains the qualified meaning from Q05 and its source.

Inspected develop/worktree remains `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. [Current History source](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/donor/app/%28dashboard%29/donor-dashboard/history/page-content.tsx):83–90 sets current browser year and generates five year options. :541–557 actually filters rows by that browser-year calculation; this is not just a statement-download selector. It also derives totals/chart/counts from the filtered loaded subset. [Current portal service](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/donor-portal/service.ts):205–215 caps the source gift snapshot at 250.

The current implementation therefore cannot prove complete history for any option, and removing that cap to fetch all rows is not the solution. Q05 already requires the owner-governed bounded query, exact scope, continuation and honest aggregation/coverage. This question adds no replacement ledger or provider read path.

## Conditions common to A, B and C

1. **Default only on neutral entry.** Preserve an authorized period/deep link and the current browsing selection/Back position. Do not reset the donor's chosen year whenever a detail closes or the page refetches. No new cross-session saved-filter system is implied.
2. **Visible scope.** Show the selected period clearly. If no records match, say so for that period and provide a clear way to broaden it; a failed load is not an empty result.
3. **Same available history.** Older authorized records remain reachable in every option. “All available” is not a completeness/retention/coverage guarantee, and a time window is not a privacy policy.
4. **Bounded data and stable continuation.** Filter at the owning read boundary with deterministic source order/tie-breaker. Retain current authorization on every page. Do not filter only a partial local snapshot and call it complete.
5. **Truthful summaries.** Any displayed amount/count has explicit source-defined measure, coverage and period. Do not total unlike currencies, promises, recognition and deductible amounts together or treat loaded rows as an exact period total. This question does not add totals.
6. **No document or financial effects.** Changing a period does not regenerate a receipt, issue a statement, change tax dates, export records, retry giving, change consent or send a notification. Exact document and gift links retain their current owners.
7. **Quiet accessible Maia.** A readable period control, current state, empty/loading/continuation-error handling and keyboard/mobile focus must work in the existing base-maia/Base UI/shared tokens. This chooses a default, not a new filter-builder product.

## Other research this turn and proof limits

The initially considered wallet-removal continuation was checked against R03 and current Church Center/Microsoft/Stripe documentation. A clear return to a separately requested fresh Remove step remains a **recommendation only**; R03 already settles no automatic detach and current owner admission. That research is retained for later completion, not silently ratified as Question 10.

Stripe docs/default-test read-only scope was refreshed for that wallet candidate, with no financial mutations and no qualifying connected account. Those observations are not a dependency or execution proof for this History question. No new database/browser/provider-action tests were needed or run. Previous Q05 evidence remains historical, source-rechecked evidence, not a new result. No source/GitHub/provider state, PRD, formal specification or issue was changed; five setup-change files are preserved.

**What time period should Giving history show on a fresh visit?**
