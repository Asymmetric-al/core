> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

> **Fully ratified, 8 September 2026:** Conrad accepted Q20 A1–A5/J01–J16/V01–V10/C01–C22, Maia presentation and10-minute reviewed admission/separate10-minute accepted preparation/24-hour file/30-day minimized correlation. ReUI is additionally the reference for all Asym/Core grids, adapted to shared Maia components and governing source/product boundaries. T01–T18 remain required target proof. Earlier provisional wording below is historical; ratification is not implementation or publication.

> **Current status, 8 September 2026:** Conrad selected A. The [complete adversarial review](phase25-r20-adversarial-review.md) records corrected execution awaiting ratification. The unanswered wording below is historical pre-answer research.

# Question 20 — Start a history download from the current filters?

Research date: 8 September 2026. Question 19 is fully ratified, including its three-preview default and product-owned flexibility. Question 20 is unanswered. This is next-question research, not a PRD, formal specification, implementation ticket or export execution.

## The situation

Maria is viewing Giving history with **2025** and **School project** applied. She now wants a spreadsheet of those gifts. The unresolved choice is whether Download history starts with those filters as an editable proposal, or asks her to choose a separate scope each time.

Questions 05 and 10 already settle full declared authorized source scope, gift-centered meaning, filter semantics, honest coverage and no export from loaded/virtualized rows. They do not settle this opening default. This question concerns task continuity, not new data access, file formats or tax-document creation.

## Two credible options

<!-- prettier-ignore -->
| Option | Maria's experience | Benefit and tradeoff |
| --- | --- | --- |
| **A — Start with my current filters, with an easy change. Recommended.** | Download opens a small summary showing 2025 and School project. Maria can keep that selection, change it or broaden to All available history before requesting the CSV. | Preserves the work she just did to find the intended gifts. The summary must be obvious so a forgotten narrow filter does not look like all giving. |
| **B — Choose the download scope each time.** | Download starts with familiar scope choices, such as All available or a particular year/date range, plus the supported optional fund/amount refinements. It does not inherit the browsing filters. | Useful when the spreadsheet is a different task from what she was browsing. It repeats choices when she already filtered the desired result. This is still one compact task, not a reporting wizard. |

Both options show what will be included before requesting the file. Both use the same governed export owner and cover all authorized matches in that declared scope, including gifts never scrolled into view. Neither changes History's filters when the donor edits only the download proposal. All available remains limited to the current authorized personal or represented context and source coverage; it never means every tenant record or guaranteed lifetime completeness.

## Recommendation

Choose **A**. Filtering and downloading are often one continuous task. A visible scope summary and a straightforward Change action preserve that continuity while allowing a different export goal. There is no need to ask everyone to repeat their choices merely to handle the cases where they want a broader file.

Illustrative scope summary, using safe source labels in the actual product:

> **Download giving history**  
> Dates: **1 January–31 December 2025**  
> Fund: **School project**  
> Includes all matching gifts available in this giving context.  
> **Change filters** · **Download CSV**

This is an example, not observed donor data or a frozen component layout. Show an exact matching count only if the owner provides a qualified current count; otherwise do not fabricate one. If no narrowing is applied, A begins with the ratified All available History scope, visibly stated and still subject to current export admission.

The strongest argument for B is that recordkeeping downloads can have a separate purpose from browsing. Consumer-finance products demonstrate that pattern. A is stronger for this entry point because the donor has already expressed a query, and can still change it before downloading. No measured Asym study proves either default superior.

## Current primary evidence

<!-- prettier-ignore -->
| Source | Verified precedent and limit |
| --- | --- |
| [Church Center donor history](https://help.planningcenter.com/en/140951-manage-your-giving-information.html), published 3 September 2026, lines 40–72 | Direct donor example: filter by year/fund, optionally narrow monetary donations, then Download CSV. This supports task continuity, but does not independently document every modal default or CSV field. Its shared-wallet, contact and tax rules are not adopted. |
| [Monzo customer transaction export](https://monzo.com/help/budgeting-overdrafts-savings/exporting-my-transactions) | Customers enter Bank statements, choose a date range, then a format. Strong precedent for B's fresh export scope. Monzo's bank-statement legal meaning and extra formats do not apply to Asym's history CSV. |
| [HubSpot record export](https://knowledge.hubspot.com/import-and-export/export-records), updated 2 April 2026 | Users open the desired view, then export it. Useful CRM precedent for carrying context into an explicit export task. Do not copy arbitrary associations/columns, staff permissions, email delivery or retention limits into the donor portal. |
| [Fundraise Up donations](https://fundraiseup.com/docs/donations/) and [exports](https://fundraiseup.com/docs/exports/) | Its staff Donations workflow applies filters before Quick export, while a separate export product supports templates/schedules/destinations. The simple flow is useful precedent; the larger reporting product is unnecessary here. |
| [Givebutter transaction export](https://help.givebutter.com/en/articles/2219206-how-to-export-download-transaction-details), June 2026 | Staff filter transactions and then export. This supports explicit scope, not permission to include donor-inappropriate payout, internal-note, contact or provider fields. |
| [Shopify order exports](https://help.shopify.com/en/manual/fulfillment/managing-orders/exporting-orders) | Sorting/filtering precedes an export window with explicit scope choices. It is merchant administration, not donor scope authority. Current-page-only exports, staff recipients and vendor thresholds are not copied. |

The recommendation rests on documented journeys and Asym's chosen simplicity, not invented conversion, speed or retention statistics.

## Governing source and actual implementation

- Current inspected develop: `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. Q05/Q10 explicitly require a complete declared source export and no DOM/retained-row authority. Their initial export defaults remain open.
- Phase 3 owns the common policy/serialization/audit boundary. `exportable` and permitted field categories are stricter than being visible on screen. Phase 12 supplies current authorization, allowed query predicates, egress metering and restricted-data controls. A filter is not a grant; no inaccessible filter can be silently dropped to broaden the file.
- Self-download is not outbound contact. Phase 3's initiator contract and actual [#495](https://github.com/Asymmetric-al/core/issues/495) distinguish donor self-service from staff/system-initiated contact. Marketing opt-out alone does not block an authenticated own-record download. This does not permit arbitrary recipients, bypass export restrictions or turn a representative's narrow grant into full-account access.
- Fresh issue-body reads: [#493](https://github.com/Asymmetric-al/core/issues/493) OPEN/body dependency #491; #495 OPEN/body dependencies #491/#493; [#496](https://github.com/Asymmetric-al/core/issues/496) OPEN/body dependency #493. These existing owners require reconciliation with later ratified contracts; no new tickets were created or changed.
- The sentence prohibiting an all-history default in Phase 3's later amendment belongs specifically to the Phase 21/31 Missionary Support Feed. It is not an ordinary donor-export rule and does not reopen Q10's All available History decision.
- The current donor History has document-download UI, not a completed governed CSV export. The generic Table utility serializes loaded filtered/core/selected client rows and visible columns. Its `onlyFiltered` default is an implementation precedent, not an approved donor default or a complete-source implementation. Use the shared governed owner rather than exporting the browser's working set.
- Existing `csvSafeCell` is useful shared infrastructure, not proof of complete modern spreadsheet safety/interoperability. Current [OWASP CSV guidance](https://owasp.org/www-community/attacks/CSV_Injection) includes full-width formula prefixes and save/reopen limitations. The selected-journey review must reconcile supported spreadsheet/locale behavior, numeric fidelity and the single shared helper; do not invent a second serializer or claim universal CSV safety.

## Common boundaries for either choice

1. **Use applied scope.** A proposes the currently applied History query, not unfinished input, old rows, a different context or the virtual window. Relative dates resolve through the existing date owner and are explained with exact periods.
2. **Keep one small task.** A readable scope summary, familiar qualified filters and a deliberate download action in the existing Maia style. No column wizard, saved report template, export scheduler or new dashboard section follows from this decision.
3. **Preserve History on return.** Editing the one-off export does not silently change the browsing filters. Changed context/authority requires re-resolution; an old proposal cannot grant access.
4. **Export the declared source result.** Respect current row/field/egress restrictions and full authorized traversal, regardless of scrolling. No current-page export, hidden filter removal, silent partial result or unlabelled FX.
5. **Preserve gift meaning.** A fund match does not change the original Gift amount into its allocation subtotal. Exact row/column representation, corrections, currency and qualified unknowns need the owning history/export contract and the post-answer review.
6. **Keep official documents distinct.** Receipts and annual statements stay in Receipts & statements. Downloading a CSV does not issue or reissue them, determine deductibility or rewrite financial history.
7. **No new delivery promise.** A file request may create its existing egress/audit evidence. It does not imply sending to another person, email/bell notifications, arbitrary retained download links or new communications consent. Exact generation/retrieval/retry/cutoff behavior belongs in the selected execution review.

No target export, SQL, spreadsheet compatibility, provider or browser test was run for this question. This research establishes the options and relevant dependencies; it does not certify an implementation or assume an answer. Q14 G01 remains independently unresolved. Research/grooming boundaries and all prior ratifications remain intact.
