# Q13 R5: Scale, edge cases, tie-out, retention and correction for imported giving history

Researched 2026-11-03. This builds on R2 and doesn't repeat it. **Unverified** means not primary-confirmed; **community** means a practitioner forum post; **derived** means my arithmetic. Tags point to the source list at the end.

## 1. Scale

- **Gift frequency:** donors average 4.15 gifts a year; top performers average 6.62 [VB]. Monthly missionary support probably runs higher (unverified).
- **A real sending agency:** World Team US recorded 61,181 donations, $9.6M, in one year [WT].
- **Derived row counts:**
  - 5k donors × 4 gifts × 10 years ≈ 200k rows.
  - World Team size × 15 years ≈ 0.9M rows.
  - 50k monthly donors × 15 years ≈ 5M+ rows.
- **Vendor limits:**
  - Planning Center: 152,000 rows or 30 MB per CSV [PC1].
  - Bloomerang: "10,00 rows" (probably 10,000) and 2 MB per file [BL1].
  - Salesforce Bulk API 2.0: 150M records per 24 hours; 150 MB per file [SF1].
  - Virtuous: 24,000 gifts "requires at least 16 hours" at 1,500 requests an hour [V1]. Its limits page says 5,000 an hour, with exceptions for historical migrations [V2].
  - Raiser's Edge NXT: no published cap found. A reported 10,000-row cutoff was a list-view default (community) [BB1].
- **Timelines:**
  - DonorPerfect: "about two weeks from the date the final data is received", after a column-by-column mapping session [DP1].
  - Mpire (a vendor, no sources given): 6–10 weeks for under 20k records; 3–6 months for 20k–250k [MP1].

**Implication for Asym**

- Even large ministries have only a few million rows: a bulk load, not an API-throttling problem.
- Mapping and human sign-off are the bottleneck.

## 2. Edge-case catalog

| Edge case                              | Common vendor handling                                                                                                                                      | Failure in the wild                                                                                           | Recommended handling                                                                      |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Zero amount                            | Raiser's Edge refunds by adjusting a gift to $0 [BB2]. LGL uses $0 for unappraised in-kind [LGL]                                                            | Hidden refunds; inflated gift counts                                                                          | Import only with a source reason; exclude from gift counts                                |
| Negative rows                          | Rejected by Planning Center [PC1] and Givebutter [GB1]                                                                                                      | Refunds netted or deleted, so totals stop tying to the source gross                                           | Linked reversal; never net                                                                |
| Partial refund                         | Planning Center: edit the original down to net [PC1]. Raiser's Edge: adjust the gift [BB2]                                                                  | Original amount overwritten                                                                                   | Reversal row for the refunded part; original unchanged                                    |
| Refund in a later year                 | Raiser's Edge creates reversing ledger entries [BB3]; closed years block fixes (community) [BB10]                                                           | Earlier years restated                                                                                        | Each row keeps its own date; reconcile both years                                         |
| Refund with no original                | Undocumented                                                                                                                                                | Export window cut off the original                                                                            | Block, unless finance accepts it as an "unmatched reversal"                               |
| Chargeback, then dispute won           | A Stripe dispute has 0–2 balance transactions: withdrawn, then reinstated [ST2]                                                                             | Only the withdrawal exported                                                                                  | Import both as linked events                                                              |
| Bad, future or pre-founding date       | Virtuous flags a missing date [V1]                                                                                                                          | Excel swaps day and month for days ≤12 [XL]; 1900 placeholders; future dates are really scheduled instalments | Block. ISO dates only, between the founding date and the Switch                           |
| Date off by one at midnight UTC        | Salesforce Data Loader shifts dates by time zone (vendor blog) [SF4]; Givebutter applies the account's zone [GB1]                                           | 31 Dec gifts land in the wrong tax year                                                                       | Calendar date, never converted. A timestamp converts once, in the source's zone           |
| JPY or KWD (0 or 3 decimals)           | Stripe uses ISO minor units, except ISK and UGX [ST1]                                                                                                       | ×100 assumptions misstate amounts 10–100×                                                                     | Decimal checked against the ISO 4217 exponent; reject excess precision, never round       |
| Split lines ≠ total                    | Salesforce's Nonprofit Success Pack "looks for unallocated amounts, and assigns them to your default" fund [SF9]                                            | Silent general-fund fallback                                                                                  | Block                                                                                     |
| Donor merged or deleted in source      | Salesforce deletes the losing record and reparents its gifts; external IDs aren't carried [SF5]                                                             | Gift points at a donor missing from the export                                                                | Block; accept a merge map                                                                 |
| Same gift in two exports               | SiteStacker's Historic Giving and Contributions overlap (R2)                                                                                                | Double counting                                                                                               | One source per date range; unique source ID; likely duplicates flagged, never auto-merged |
| Recurring instances vs schedules       | Zenatta [ZN] and Pushpay [PP1] keep schedules as schedules                                                                                                  | Schedules imported as gifts                                                                                   | Instances become history; schedules never go live                                         |
| Pledge payments                        | Blackbaud imports pledges with instalments [BB4]; Bloomerang converts gifts to payments [BL2]                                                               | Pledge and payment both counted                                                                               | Payments are gifts; pledge ID kept as provenance                                          |
| Stock or in-kind                       | US acknowledgements describe the gift "(not the value)" [IRS2]; Canada receipts fair market value (FMV) [CRA2]; Raiser's Edge "Stock/Property (Sold)" [BB5] | Sale proceeds become a second gift                                                                            | One gift: recorded value plus description and a non-cash flag; never revalue              |
| Donor-advised fund (DAF) grant         | The sponsor is donor of record; the advisor gets a soft credit and no receipt [AAF][FC]. Planning Center imports DAF gifts separately [PC1]                 | Advisor's statement shows an already-deducted gift                                                            | Hard credit to the sponsor; soft credit to the advisor; kept off the advisor's tax totals |
| Tribute with a person to notify        | Salesforce Nonprofit Cloud stores the notification contact and status [SF6]; Givebutter imports never notify [GB1]                                          | Notifications re-sent                                                                                         | Import as data; never send                                                                |
| Organisation, joint or household donor | The IRS combines spouses and family for the 2% public-support test [IRS3]                                                                                   | Church imported as a person; couple split in two                                                              | Exactly as the source says; no inference                                                  |
| Deceased donor or estate               | Practice varies: estate hard-credited or posted to the decedent (community) [BB6]                                                                           | Statements to the deceased                                                                                    | As the source says; a deceased flag hides donor-facing views                              |
| Fee cover                              | Separate line at Virtuous [V3] and Stripe [ST3]; "don't net" [DS]                                                                                           | Totals tie to net                                                                                             | Import gross plus the fee portion                                                         |
| Quid pro quo or ticket                 | IRS disclosure above $75 [IRS1]; Canada deducts the donor's benefit (FMV minus advantage) [CRA2]                                                            | Whole ticket shown as deductible                                                                              | Import the deductible and non-deductible amounts as given                                 |
| Sensitive memo                         | Planning Center memos are donor-visible [PC1]                                                                                                               | Health details or missionary locations exposed                                                                | Staff-only by default                                                                     |

## 3. Accounting tie-out

**What auditors look for**

- The Washington State Auditor wants "a method to verify that any data transfers … are complete and accurate" (search extract) [SAO].
- A UK council audit required differences to be "reconciled and explained" [GED].
- I found no AICPA conversion text (unverified).

**Common practice**

- Capture hard-credit baselines by fund and year before any cleanup. Trial-load 200–500 of the hardest rows [SOFT].
- Reconcile payments, pledges and refunds separately [INT].
- Keep a discrepancy register; explain approved differences, never adjust silently [ZN][HB].
- A report used as evidence must itself be complete and accurate [BDE].
- One vendor case ties trustee sign-off to 186,000 gifts reconciled "to the penny" (unverified) [SF7].

**Sampling:** about 60 random gifts with zero errors gives 95% confidence that the error rate is under 5% [MT][HUD]. Trace both ways: source to Asym, and Asym to source.

**Implication for Asym**

- History never posts, so the auditor's main concern is that nothing historical leaks into the ledger (inference).
- The sign-off pack covers each entity × currency × year:
  - gross, reversals and net
  - distinct donors
  - breakdowns by designation and payment method
  - the 60-gift sample
  - the discrepancy register
  - the source file hash
  - the signer

## 4. Retention and minimisation

**Rules by country**

- **US:**
  - Records are kept while they're needed, generally three years after the return [IRS4].
  - The Schedule A support test uses five years of per-donor totals: "keep … a list showing the name of and amount contributed by each donor" [IRS3].
- **Canada:**
  - Ledgers and source documents: 6 years; duplicate receipts: 2.
  - Records kept abroad but accessed from Canada "do not meet the requirement" [CRA1].
- **UK:**
  - Gift Aid declarations: 6 years after the last claimed donation [GOV1].
  - UK GDPR storage limitation means erasing or anonymising data once it's no longer needed (guidance under review; search extract) [ICO1].

**Fundraising practice**

- Institute of Fundraising guidance: supporters with "often around 3 to 5 years of no interaction" can be archived with restricted access [CIOF].
- In 2017 the ICO fined 11 charities over donor-data misuse [CT].

**Religious data**

- Giving to a mission can reveal belief. The ICO treats intended inferences as special-category data [ICO2].
- Article 9(2)(d) covers members, former members and regular contacts of religious non-profits, with no outside disclosure without consent [GDPR9].

**Implication for Asym**

- Importing every year is defensible in the US and Canada. It is weaker for UK and EU donors who have been silent for years.
- Import everything and let the ministry's retention policy govern.
- Offer an "anonymise donor" action that keeps amounts, so totals still tie.
- The ministry keeps the source export. Asym isn't the book of record.

## 5. Correcting errors after go-live

- **Planning Center:** undo within two weeks; after that, through support [PC1].
- **Givebutter:** deletes a whole import. "We cannot restore deleted import data" [GB1].
- **Zeffy:** deletes a payment import, which also cancels linked tickets [ZF].
- **Salesforce:**
  - The Import Wizard has no undo.
  - Mass Delete: admins only, 250 records at a time, matched on creation time and user.
  - Alternatively, Data Loader deletes using the import's success file [SF8].
- **Raiser's Edge:**
  - Deleting a batch doesn't delete its gifts; use a query-based global delete (community) [BB7].
  - Blackbaud prefers adjustments, which "make it possible to audit changes" [BB3].
- **Bloomerang:** imports are "largely irreversible" [BL1].

**Implication for Asym** offer two tools:

- **Withdraw a batch:** free before sign-off. After sign-off it needs a reason and a second approver.
- **Superseding import:** replaces gifts by source ID and keeps the earlier versions.

History moves no money, so withdrawal is cheap.

## 6. UX patterns

**Staff and donors**

- Givebutter uses an "External Label" and External ID, with read-only External campaigns [GB1][GB2]. Its imports are "only visible in your Givebutter dashboard" [GB1].
- A Planning Center payment source's name can appear on statements (search extract) [PC3].
- Pushpay imports history so a church doesn't send two year-end statements [PP2].

**Missionaries**

- MPDX charts 24 months of giving per contact [MPDX1].
- MPDX groups gifts by the partner's currency. It also converts them to the missionary's salary currency at a "daily conversion rate, rounded" [MPDX2].

**Conversion reports:** no vendor publishes a sample customer reconciliation report (gap). DonorPerfect describes an approved mapping document [DP1].

**Security for missionaries**

- AIM Canada keeps workers in restricted countries' "names and/or pictures" off the internet; donors give through a secure form [AIM].
- EFCA uses designation numbers [EFCA].
- Brethren in Christ US runs a "Secure Locations Fund" [BIC]; WMPL leaves some workers unlisted [WMPL].
- I found no code-name standard. Rock RMS's "missionary anonymizer" is only a feature request [ROCK].

**Implication for Asym**

- Donor and missionary views show Asym's designation name, never the source's label, which may contain real names or places.
- Memos are staff-only.
- Group by native currency and label any conversions.

## 7. Departed missionaries' funds

- **ECFA (the Evangelical Council for Financial Accountability):**
  - Its sample policy says that on a worker's departure the mission "reserves the right to use the balance as it deems best" (search extract) [ECFA1].
  - Designated balances must be shown separately [ECFA2].
  - Gospel for Asia lost its membership partly over reallocating designated gifts [GFA].
- **Sending agencies:**
  - AIM Canada may redirect a remaining balance to the nearest intent, consulting significant donors (search extract) [AIM2].
  - World Renew asks donors' permission [WR].
  - WorldVenture settles support commitments 90 days after a resignation [WV].
- **Raiser's Edge:**
  - Inactive funds still appear in report pickers [BB8].
  - Imported gifts on an inactive fund can't be edited until it is reactivated (community) [BB9].
- **DonorElf and MPDX:** nothing public found.

**Implication for Asym**

- Redirection applies to new gifts and balances only, never to history.
- Closed designations accept history without being reactivated. They are hidden from pickers but stay in reports.

## Simplest robust defaults

1. Validate every row before writing any; any error blocks the load.
2. Amount is a decimal plus an ISO currency code, checked against the currency's decimals. The date is a calendar date.
3. A unique source transaction ID on every row; reversals link to it.
4. Split lines sum exactly. An unknown donor, designation or date blocks the load.
5. Gross, fee cover, deductible split and non-cash description import as recorded.
6. Memos are staff-only. Tributes, DAF grants, matches and soft credits are data and never send messages.
7. Sign-off pack as in section 3.
8. Corrections: withdraw a batch, or supersede by source ID.
9. "Anonymise donor" keeps the amounts.

## What not to build

- Currency conversion, revaluation or deductibility recalculation at import.
- Fuzzy automatic merging of gifts or donors, or heuristic matching of refunds to gifts.
- Field-level editing of history, or ledger-style adjustments.
- Throttled API ingestion or per-file row caps.
- Retention rules per jurisdiction.
- Memo-scanning AI.
- Live schedules or pledges built from history.
- A fallback designation.

## Sources

[AAF] https://aafrc.org/who-issues-the-receipt-for-donor-advised-fund-grants/ · [AIM] https://cagiving.aimint.org/?p=4799 · [AIM2] https://cagiving.aimint.org/wp-content/uploads/2026/08/Donor-restricted-gift-policy.pdf · [BB1] https://community.blackbaud.com/discussion/59039/crm-import-row-maximum · [BB2] https://kb.blackbaud.com/articles/Article/75287 · [BB3] https://kb.blackbaud.com/articles/Article/40667 · [BB4] https://kb.blackbaud.com/knowledgebase/articles/Article/75280 · [BB5] https://kb.blackbaud.com/articles/Article/51168 · [BB6] https://community.blackbaud.com/discussion/57305/recording-of-bequests-from-estates · [BB7] https://community.blackbaud.com/discussion/51490/batch-committed-twice · [BB8] https://community.blackbaud.com/discussion/comment/268775/ · [BB9] https://community.blackbaud.com/discussion/comment/289900/ · [BDE] https://www.bdemerson.com/service/itgc-audit · [BIC] https://bicus.org/missions/global-team/workers-sensitive-environments · [BL1] https://help.bloomerang.com/en/articles/12632775-imports-imports-101 · [BL2] https://help.bloomerang.com/en/articles/12632719-convert-donations-to-recurring-donation-payments-or-pledge-payments · [CIOF] https://ciof.org.uk/media/qvwbx40y/gdpr-legacies.pdf · [CRA1] https://www.canada.ca/en/revenue-agency/services/charities-giving/charities/operating-a-registered-charity/books-records.html · [CRA2] https://www.canada.ca/en/revenue-agency/services/charities-giving/charities/operating-a-registered-charity/receiving-gifts/donation-shares.html · [CT] https://www.charitytimes.com/ct/ico-announces-138k-in-fines-for-11-charities.php · [DP1] https://www.donorperfect.com/?p=38974 · [DS] https://donorsnap.com/support/docs/allow-donors-to-cover-the-processing-fees/ · [ECFA1] https://ecfa.org/Content/Sample-Deputized-Worker-Policy · [ECFA2] https://www.ecfa.org/Content/2MemberManual-AdvisoryOpin-DonorDisclosure · [EFCA] https://give.efca.org/faq · [FC] https://www.fidelitycharitable.org/nonprofits/nonprofits-frequently-asked-questions.html · [GB1] https://help.givebutter.com/en/articles/6934176-how-to-import-transactions · [GB2] https://community.givebutter.com/changelog/transaction-imports · [GDPR9] https://gdpr-info.eu/art-9-gdpr/ · [GED] https://democracy.gedling.gov.uk/Data/Audit%20Committee/200604241730/Agenda/$att1413.doc.pdf · [GFA] https://christianitytoday.com/news/2015/december/report-details-why-gospel-for-asia-lost-ecfa-membership.html · [GOV1] https://www.gov.uk/claim-gift-aid/gift-aid-declarations · [HB] https://www.hyperbots.com/glossary/data-reconciliation-after-migration · [HUD] https://hudoig.gov/sites/default/files/2024-02/appendix.pdf · [ICO1] https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/storage-limitation/ · [ICO2] https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-for-the-use-of-personal-data-in-political-campaigning-1/special-category-data/ · [INT] https://www.integrate.io/blog/npsp-to-nonprofit-cloud-migration/ · [IRS1] https://www.irs.gov/charities-non-profits/charitable-organizations/charitable-contributions-quid-pro-quo-contributions · [IRS2] https://www.irs.gov/pub/irs-tege/atg_fundraising.pdf · [IRS3] https://www.irs.gov/instructions/i990sa · [IRS4] https://www.irs.gov/pub/irs-pdf/p4221pc.pdf · [LGL] https://help.littlegreenlight.com/article/99-gift-entry · [MP1] https://mpiresolutions.com/blog/how-long-does-a-nonprofit-crm-migration-take/ · [MPDX1] https://help.mpdx.org/article/1251-mpdx-quick-reference-guide-a-contacts-page · [MPDX2] https://help.mpdx.org/article/177-multi-currency-donation-report · [MT] https://blog.minitab.com/en/the-statistical-mentor/how-many-samples-do-you-need-to-be-confident-your-product-is-good · [PC1] https://help.planningcenter.com/en/154395-import-donation-history.html · [PC3] https://help.planningcenter.com/en/138389-create-and-manage-payment-sources.html · [PP1] https://pushpay.com/resources/migration/ · [PP2] https://pushpay.com/?p=1649 · [ROCK] https://community.rockrms.com/ideas/2189/missionary-anonymizer- · [SAO] https://www.sao.wa.gov/sites/default/files/2023-05/New-Application-System-Best-Practices.pdf · [SF1] https://developer.salesforce.com/docs/platform/salesforce-app-limits-cheatsheet/guide/salesforce-app-limits-platform-bulkapi.html · [SF4] https://www.xappex.com/blog/salesforce-data-loader-date-format/ · [SF5] https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_triggers_merge_statements.htm · [SF6] https://developer.salesforce.com/docs/atlas.en-us.nonprofit_cloud.meta/nonprofit_cloud/npc_fundraising_api_objects_gifttribute.htm · [SF7] https://appexchange.salesforce.com/image_host/cbd2e05f-2cc8-4834-8a3e-048100c6796a.pdf · [SF8] https://resources.docs.salesforce.com/204/latest/en-us/sfdc/pdf/salesforce_massdelete_undoimport.pdf · [SOFT] https://softabase.com/guides/nonprofit-crm-data-migration-checklist · [ST1] https://docs.stripe.com/currencies · [ST2] https://docs.stripe.com/api/disputes/object · [ST3] https://docs.stripe.com/payments/checkout/fee-coverage · [V1] https://docs.virtuous.org/crm/recipes/import-historical-gifts · [V2] https://docs.virtuous.org/crm/rate-limits · [V3] https://support.virtuous.org/hc/en-us/articles/10481771864589 · [VB] https://virtuous.org/resource/nonprofit-benchmark-report-2026/ · [SF9] https://trailhead.salesforce.com/content/learn/modules/opportunity-settings-in-nonprofit-success-pack/configure-gau-allocations-and-payments-npsp · [BB10] https://community.blackbaud.com/discussion/54501/cleaning-up-past-gifts-attributed-to-the-wrong-constituent · [WMPL] https://wmpl.org/fellow-workers/ · [WR] https://worldrenew.net/wp-content/uploads/2021/03/World-Renew-Gift-Acceptance-Policy.pdf · [WT] https://us.worldteam.org/wp-content/uploads/2022/08/WTUS_FINANCIAL_Fact-Sheet-2022.pdf · [WV] https://worldventure.com/?p=11012 · [XL] https://www.accountingweb.co.uk/node/68806 · [ZF] https://support.zeffy.com/how-to-delete-or-undo-a-data-import-b7744 · [ZN] https://zenatta.com/solutions/custom-development-integrations/donation-civicrm-migration/
