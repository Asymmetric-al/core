# Q13 R2: How other platforms bring giving history across

Researched 2026-11-03 from vendor help centres, developer docs and regulator pages. **Unverified** means not confirmed from a primary source. **Community** means a Blackbaud Community forum post: a practitioner's habit, not vendor policy.

## 1. How much history to bring

- **Virtuous** offers all gifts, gifts since a cutoff, or the current fiscal year. It says "most customers want at least 1–2 fiscal years". https://docs.virtuous.org/crm/recipes/import-historical-gifts
- **Bloomerang** sets no cutoff. It asks when you last studied gifts older than three years, and says to archive the rest. https://bloomerang.com/blog/7-decisions-nonprofits-will-face-during-donor-data-migration
- **Planning Center Giving** (2026 import tool, beta) imports all or in batches, to avoid split year-end statements. https://www.planningcenter.com/blog/2026/07/switching-to-planning-center-giving-import-your-donation-history
- **SiteStacker**: "Historic Giving is where all of the gifts ever given, refunded, etc. live." https://training.sitestacker.com/support/solutions/articles/151000115175-historic-giving-overview
- **Summary records:** no vendor recommends rolled-up summary gifts.
  - Blackbaud practitioners use a "Historical Gifts" fund or a "gift on record at conversion" subtype. They warn that history kept only in notes doesn't feed lifetime giving (community): https://community.blackbaud.com/discussion/57477/historical-gift-totals
  - One integrator moves gifts one by one and calculates lifetime giving from them: https://zenatta.com/solutions/custom-development-integrations/donation-civicrm-migration/
  - MPDX turns TntConnect gift detail into totals only (Last/Lifetime Donations): https://help.mpdx.org/article/440-finding-tntconnect-data-after-import
- **Canada retention:** the Canada Revenue Agency (CRA) requires charities to keep duplicate receipts 2 years and ledgers and source documents 6 years. https://www.canada.ca/en/revenue-agency/services/charities-giving/charities/operating-a-registered-charity/books-records.html. **Unverified:** no vendor states a "7-year" norm.

**Implication for Asym**

- Gift-level detail is the norm. Summary gifts break LYBUNT/SYBUNT, first-gift date, lifetime totals and statements.
- Default to all source years, gift by gift; a ministry's whole history is small. A cutoff is an explicit choice recorded on the Switch. Older years stay in the archived raw export, never as fake summary gifts.

## 2. Funds and designations

- **Funds must exist first** in most tools:
  - Planning Center: "Every imported donation must be mapped to a fund." https://help.planningcenter.com/en/154395-import-donation-history.html
  - Bloomerang: values must match existing funds, campaigns and appeals. https://help.bloomerang.com/en/articles/12632775-imports-imports-101
  - Virtuous: an unresolved mapping "should fail validation, not silently fall back to a default".
- **Created during import:**
  - Little Green Light creates each unique name, case-sensitively, so spelling differences become duplicates. https://help.littlegreenlight.com/article/271-migrating-to-lgl-from-your-current-system
  - Givebutter creates read-only "External" campaigns. https://community.givebutter.com/changelog/transaction-imports
- **Inactive funds:**
  - Subsplash archives a fund only if no gifts are attached. https://intercom.help/subsplash/en/articles/9157150-giving-import
  - Raiser's Edge NXT requires reactivating a fund before its gifts can be edited (community). https://community.blackbaud.com/discussion/comment/289900/
  - **Unverified:** no vendor documents a "departed missionary" state.
- **Missionary tools:**
  - SiteStacker gifts carry a _receiving person_ (missionary) and a fund ID. Without the person's external ID, "the historic giving for this person will not be shown." https://training.sitestacker.com/support/solutions/articles/151000115168-importing-historic-giving
  - TntWare DonorHub pushes agency finance data to TntConnect or MPDX every night. https://faith.tools/app/tntware-donorhub
- **Split gifts:**
  - A SiteStacker transaction has one or many designations. https://training.sitestacker.com/support/solutions/articles/151000115221-filter-view-and-export-giving-transactions-and-designations
  - Little Green Light reads only the first fund; Subsplash has no sub-funds.

**Implication for Asym**

- Map or pre-create every designation before gifts load. Unmapped blocks the import and never falls to a default fund.
- A departed missionary becomes a **closed** designation: visible in history, not open for gifts. Moving those gifts to General Fund rewrites settled facts.
- Keep each gift's split across designation lines.

## 3. Keeping imports out of accounting

- **Blackbaud Raiser's Edge:**
  - Post Status is Posted, Not Posted or Do Not Post. New gifts default to Not Posted; Do Not Post keeps a gift out of the general ledger. https://kb.blackbaud.com/knowledgebase/articles/Article/37476
  - Practitioners mark historical gifts Do Not Post and warn that unposting and reposting creates duplicates (community). https://community.blackbaud.com/discussion/comment/223614/
- **Foundant:** historical imports "do not impact the general ledger" (search snippet; the page returned 403). https://support.foundant.com/hc/en-us/articles/6899159450775
- **Planning Center:**
  - Imports go under a payment source named for the old system, into year batches that donors can't see until a bookkeeper commits them. https://help.planningcenter.com/en/138386-batches.html
  - "Donation receipts are not sent for imported donations, even if they are enabled."
- **Givebutter:** offline payments are excluded from payouts. https://help.givebutter.com/en/articles/1726573-what-payment-methods-does-givebutter-accept
- **Virtuous:** keeps imported batches out of receipts and statements until accounting signs off.
- **Bloomerang:** imports dated within 30 days can **trigger donation automations**.
- **Salesforce:** **Unverified:** no documented exclusion from Accounting Subledger entries.

**Implication for Asym**

- Make "historical" a fixed origin tied to the Switch, not a status someone can flip later. Then imports are excluded by design from payouts, deposits, ledger export, receipts and automations.
- Gifts dated just before the Switch are the riskiest for automations.

## 4. Offline gifts

- **Payment methods:**
  - Planning Center accepts four: card, ACH, cash, check.
  - Subsplash separates non-deductible methods (DAF, QCD, Stock, Goods, Property).
  - SiteStacker records online or offline, source codes and a deductible/non-deductible split.
- **References:** Givebutter carries check number and deposit date.
- **Non-cash value:**
  - Little Green Light recommends $0 tax-deductible for in-kind gifts without an appraisal. https://help.littlegreenlight.com/article/99-gift-entry
  - Blackbaud CRM converts in-kind fair market value per currency. https://webfiles-sc1.blackbaud.com/files/support/helpfiles/crm/uk/40/Content/MCPayments.html

**Implication for Asym**

- Map payment methods to a closed list plus "other", keeping the original label.
- Keep check, batch and deposit references as provenance text, never as Asym deposits.
- Import the old system's receipted value and split exactly. Asym never revalues.

## 5. Currencies

- **Blackbaud CRM** stores transaction, base and organization amounts, each with its own rate (link in section 4).
- **Virtuous** converts at the gift-date rate and keeps the currency code (search snippet). https://support.virtuous.org/hc/en-us/articles/10397068036237-Supported-Currency-Codes-in-Virtuous
- **Salesforce:** dated rates; multi-currency reportedly can't be switched off once enabled (community, unverified).
- **SiteStacker, Planning Center, Subsplash:** USD and CAD only.
- **Lossy workaround (community):** store the home-currency equivalent with the foreign amount in a note. https://community.blackbaud.com/discussion/comment/292972/

**Implication for Asym**

- The fact is the native amount plus its ISO code. Converted figures are derived, dated and labelled, which matches the entity × original currency rule.
- Currencies Asym can't process are still valid history. Never gate an import on processability.

## 6. Soft credits, tributes, matching, pledges, refunds, anonymous

- **Soft credits:**
  - SiteStacker has a soft-credit person field.
  - Salesforce's Nonprofit Success Pack spreads soft credits across three mechanisms; "missing any source loses attribution data permanently." https://www.integrate.io/blog/npsp-to-nonprofit-cloud-migration/
  - Virtuous's Bloomerang mapping keeps **one** soft credit and **one** tribute per gift.
- **Load order:** Slate loads pledges, then gifts, then soft credits (https://knowledge.technolutions.net/docs/step-6-import-giving-elements); Givebutter loads transactions before soft credits.
- **Tributes:** SiteStacker records "In Honor Of" or "In Memory Of" plus a name.
- **Matching gifts:** the company gets hard credit and the employee soft credit (https://bloomerang.com/nonprofit-glossary/soft-credit). Linking needs the original gift ID (community).
- **Pledges:**
  - Givebutter reportedly can't migrate them (secondhand: https://aitoolsbakery.com/blog/nonprofit-crm-migration/).
  - SiteStacker matches offline pledges to payments by hand.
- **Refunds:**
  - Planning Center rejects negatives, so you delete or net refunded rows.
  - Virtuous uses a linked "Reversing Transaction". https://support.virtuous.org/hc/en-us/articles/13774313012493
- **Anonymous:** SiteStacker has a 0/1 flag.

**Implication for Asym**

- Import refunds and reversals as linked entries, never netted, so totals tie to the source gross and net.
- Payments made on historical pledges import as gifts. Open pledges are a separate decision.
- Attribution loss is the most common silent loss. Keep soft-credit, tribute and anonymous details as given.

## 7. Reconciliation and sign-off

- **Virtuous** checks:
  - the count by batch label
  - sums per project
  - distinct donors

  "Sum-level reconciliation catches discrepancies that count-level reconciliation misses." Budget about a week.

- **Zenatta:** control totals by year and campaign, before and after.
- **Givebutter:** count and totals must match the export, plus sampled profiles. https://givebutter.com/blog/crm-data-migration
- **Planning Center:** a bookkeeper commits each year batch, with a two-week undo.
- **Bloomerang:** test five rows first, since imports are "largely irreversible".
- **Unverified:** no vendor publishes typical error rates.

**Implication for Asym**

- Control totals are count and sum by entity × currency × year, then by designation and payment method, plus distinct donors. Tie to the cent.
- A named finance person signs off each year. Undo stays possible until then.

## 8. How migrated history looks

**Staff**

- Givebutter: "External Label" and External ID.
- Virtuous: a batch label such as `Historical-Import-2024-12`.
- Planning Center: the payment source named for the old system.
- Blackbaud (community): a "gift on record at conversion" subtype.
- SiteStacker: a separate "Historic Giving" area.

**Donors**

- Planning Center shows committed imports in Church Center and on statements by default. Memos are visible to donors.
- Subsplash: donors who sign up with the imported email see that history, and no automated emails go out.
- **Unverified:** no documented donor-facing "imported" badge.

**Missionaries**

- DonorHub feeds agency history to missionaries every day.
- SiteStacker shows historic giving per receiving person.

**Implication for Asym**

- Hiding pre-Switch history would be a regression for donors and missionaries.
- Show it with a quiet "Recorded in [previous system]" line and no Asym receipt action.
- **Founder decision:** in the Switch year, does Asym's statement list pre-Switch gifts as "informational, receipted by previous system", or leave them out? Planning Center merges them; the no-receipt rule forbids merging them as receipts.

## 9. SiteStacker specifics

**Public**

- The Historic Giving import (training article, section 2) has columns for:
  - receiving person and donor IDs plus external IDs
  - amount, currency and received date
  - anonymous flag and online/offline type
  - fund and campaign IDs
  - notes ("passed to the financial office") and source codes
  - **record type "donation" or "ledger"**
  - tribute, soft credit, and deductible/non-deductible amounts
- **Contributions:** transactions hold one or more designations. The grid exports as CSV, but its columns are undocumented.

**Inferences to verify with a real export**

- "Ledger" rows aren't gifts.
- Historic Giving may be fed from the back-office donor system and already include online gifts. Combining it with Contributions risks **double counting**.

**Not public**

- The API docs page renders only its title: https://sitestacker.com/p/Api/ApiDocs/
- help.sitestacker.com failed the TLS handshake from here.
- I found no export specification, multi-currency rules or missionary balance data.

## Common failure modes

1. Imports fire receipts or automations.
2. Imports leak into payouts or ledger export, or a later repost creates duplicate entries.
3. Unmapped funds silently fall back to General Fund, or near-duplicate names auto-create funds.
4. Netted refunds break the tie to the source.
5. Soft credits, tributes or matching links are lost.
6. Conversion overwrites the native amount.
7. Count-only reconciliation hides wrong sums.
8. SiteStacker's Historic Giving and Contributions overlap and are counted twice.
9. Pre-Switch history disappears from donor and missionary views.

## Recommended defaults

1. All source years at gift level. A cutoff is explicit and recorded; no summary gifts.
2. Historical is a fixed origin tied to the Switch, excluded by design from receipts, automations, payouts, deposits and ledger export.
3. Every designation is mapped or pre-created first. Unmapped blocks; departed missionaries become closed designations.
4. Native amount and currency only, with no conversion at import.
5. Refunds and reversals are linked entries. Keep split, soft-credit, tribute and anonymous details.
6. Payment method maps to a closed list plus the original label. References are provenance text.
7. Sign-off per year on count, sum and distinct donors by entity × currency, tied to the cent, undoable until sign-off.
8. Staff see "Imported from [source], Switch [date]". Donors and missionaries see the history with a "Recorded in [previous system]" line and no receipt action.
