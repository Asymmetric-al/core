# Q12 R2: Everyday imports after go-live, and what an import may do to existing records

All sources accessed 2026-11-03. This is research, not legal or tax advice. It covers outside practice only. Asym facts appear only where an implication depends on them (Phase 30 guardrails at `docs/prds/sitestacker-parity/roadmap.md:4349,4365,4377,4395`; Phase 15 batch entry at `:838-870`; `deposit_groups` at `CONTEXT.md:4600`). Earlier repo research is reused where marked (`../../research/r08-nonprofit-crm-sources.md`).

**Labels.** **VP** = primary public text fetched (regulator, statute, USPS). **VV** = vendor document fetched (help page, factsheet, published source code). **S** = secondary: search snippet, community post, blog or mirror. **U** = unverified or not found. _(inference)_ marks my own reasoning.

**Blocked or thin.** Neon support pages redirect to a login, so Neon write behaviour is **U**. Only course outlines were readable (academy.neonone.com). Blackbaud and HubSpot community threads are behind a login or script wall, so those stories are S. Salesforce developer and help sites were not used. Salesforce facts come from Trailhead, Salesforce PDFs dated 2016–2017 (resources.docs.salesforce.com) and NPSP source code on GitHub. canada.ca timed out, so the CRA point is S, taken from a law-firm summary.

## 1. Everyday import use cases: by import or by a dedicated tool

| Everyday job                                         | Done by general import                                                                                                                                                                                                                                                                       | Routed to a dedicated tool                                                                                                                                                                                               |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Event attendees / registrations                      | LGL: "Event participation and giving information from an event management product such as EventBrite" (VV). Bloomerang: "Log event attendance via an interaction import" (VV, 2024 slide deck). Virtuous: "With Contact Imports, you're able to add this list of contacts to an event!" (VV) | —                                                                                                                                                                                                                        |
| Volunteer lists                                      | LGL: "Volunteering information from any source" (VV). Bloomerang interactions with "custom fields such as Volunteer Hours" (VV)                                                                                                                                                              | Bloomerang has a separate Volunteer product (VV, nav only)                                                                                                                                                               |
| Newsletter signups from other tools                  | Bloomerang's example template name is "Constant Contact Import" (VV). HubSpot requires a consent checkbox that the file "does not include a purchased list" (VV)                                                                                                                             | —                                                                                                                                                                                                                        |
| Address changes (NCOA)                               | Virtuous Bulk Update example: "perhaps you have updated addresses for a large portion of your database" (VV)                                                                                                                                                                                 | Bloomerang: nightly TrueGivers NCOA and deceased updates (VV). DonorPerfect: "DP Address Updater scans and refreshes your records every night" (VV). RE NXT: Address Finder, every 90 days by default (VV)               |
| Phone/email appends, demographics                    | Re-import with LGL Email/Phone IDs (VV)                                                                                                                                                                                                                                                      | Bloomerang/TrueGivers demographic custom fields (VV). Virtuous Professional Services "data appends" (VV)                                                                                                                 |
| Tags, groups, custom-field bulk edits                | LGL export, edit, re-import: "The only way you can update any field for multiple constituents ... is to do so by hand or by" re-import (VV). Bloomerang group imports, pipe-separated (VV)                                                                                                   | Virtuous: query bulk actions when "updating the same value on every record"; Bulk Update Tool when values differ (VV)                                                                                                    |
| Offline gift batches (checks)                        | Virtuous runs mail gifts and file gifts through one Gift and Contact Import Tool: "Cash, checks, and even stocks or gifts-in-kind may require manual data entry. All of these different sources will flow through" it (VV)                                                                   | NPSP Gift Entry batches (VV source). RE NXT gift batches (VV). LGL "Create gift batch?" on import (VV)                                                                                                                   |
| Third-party payouts (Benevity, PPGF, YourCause, DAF) | Bloomerang: "Mass create transactions from a processor or collection" (VV, 2024 slides). LGL: gifts "from your online payment processor (for example, Stripe, PayPal ...)" (VV). Givebutter payment methods include "DAF" (VV)                                                               | Beacon (UK CRM): pre-built Benevity template, plus PayPal Giving Fund, JustGiving and CAF templates (VV). Omatic and MoveData: paid Benevity connectors (S)                                                              |
| Pledge / commitment uploads                          | DonorPerfect: "Pledges, including pledge payments" (VV). LGL "Mapping pledges" (VV). Virtuous: recurring gift schedules in bulk (VV, title only)                                                                                                                                             | Bloomerang's 2024 deck: an import cannot "Create pledges, recurring donations, soft credits" (VV). Its current help links "Apply Donations to Recurring Donations or Pledges" (VV, title only), so this may have changed |

- **DonorPerfect** frames its importer as the everyday tool: "the Import Module is generally most useful when there is an ongoing need to import data into DonorPerfect, whereas our data conversion services make the most sense for one-time data import" (VV, https://uploads.donorperfect.com/pdf/factsheets/online-import-module.pdf).
- **Bloomerang** says "Imports let you create new constituent records or update existing ones", but "Donations, interactions, and notes may be created but not updated through an import" (VV, https://help.bloomerang.com/en/articles/17568916-imports-update-constituents-via-import). **HubSpot** says the same: "emails, meetings, notes, and tasks cannot be updated via import" (VV).
- **Planning Center People:** "Only profile information can be imported via CSV file". Giving history goes through third-party integrations (VV, https://help.planningcenter.com/en/138558-import-a-csv-file-in-people.html).
- **RE NXT:** the web-view importer started with "importing Constituents and importing gifts into Gift Batch" in early access (S, https://community.blackbaud.com/discussion/comment/310273/).
- **Neon:** the course outline splits "Importing Accounts with Account IDs" from "without Account IDs". It offers separate "Bulk Update" and "Duplicate Scan" features (VV, https://academy.neonone.com/importing-your-account-data-v2). Write semantics are **U**.

## 2. Write modes for matched records, blank cells and deliberate clears

| Product                                              | Write modes                                                                                                                                                              | What a blank cell means                                                                                                                                                                                        | Deliberate clear                                                                                           |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **HubSpot** (VV)                                     | "Create and update", "Create new [records] only", "Update existing [records/activities] only". Per-column **Don't overwrite** checkbox, or one checkbox for every column | "The import tool ignores blank cells ... blank cells will not clear the existing property value"                                                                                                               | Not by import. Use manual edit or the "Edit records workflow action"                                       |
| **Salesforce Data Import Wizard** (VV, 2016–17 PDFs) | Insert; update; insert and update; insert and ignore matched; update and ignore unmatched. Plus the **Overwrite existing account values** checkbox                       | When the box is checked, existing values are replaced but "doesn't update existing field data with blank values". When unchecked, it "updates empty account fields but leaves fields with existing data alone" | Not by the wizard                                                                                          |
| **Salesforce Data Loader** (S)                       | Insert / update / upsert                                                                                                                                                 | "Empty field values are ignored when you update records"                                                                                                                                                       | The **Insert null values** setting, or `#N/A` under the Bulk API                                           |
| **NPSP Data Importer** (VV source)                   | Contact rule defaults to "Firstname,Lastname,Email". Donation behaviours: Do Not Match, No Match, Single Match, Single Match or Create, Best Match, Best Match or Create | Code "Copies non-null DI field values to the destination object", and "explicitly avoid[s] updating unchecked booleans"                                                                                        | None found (U)                                                                                             |
| **LGL Flex Importer** (VV)                           | Match on LGL/External ID (always on), plus optional email-and-name, email-only or name-only matching. "Do not update constituent name information" checkbox              | "Blank or null values will be ignored entirely"                                                                                                                                                                | No: "It is not possible to delete or remove data using the Flex Importer"                                  |
| **Bloomerang** (VV)                                  | Picks the import type up front. On review, "How Should We Update Existing Constituents" (option labels U)                                                                | U                                                                                                                                                                                                              | U. The 2024 deck lists "Mass delete data" as a thing an import cannot do, pointing to the Mass Delete tool |
| **Virtuous Gift & Contact Import** (VV)              | "Update matched contacts with new data (Default)" or "Skip matched contacts, only import new". Per-type address, email and phone rules (§3)                              | Fields are filled only "if the corresponding fields are empty". Conflicts go to Update Needed                                                                                                                  | Not described                                                                                              |
| **Virtuous Bulk Update** (VV)                        | Update templates keyed by ContactId, GiftId and similar                                                                                                                  | A snippet said empty cells override existing values. That text is **not** on the page as fetched (S)                                                                                                           | Possibly by blank (S)                                                                                      |
| **Planning Center People** (VV)                      | Create or update profiles. Preview tabs for new, updated, errors and identical                                                                                           | Ignored by default                                                                                                                                                                                             | Global opt-in "**Empty fields should delete existing data**"                                               |
| **Givebutter** (VV)                                  | Contacts match on "first and last names, plus a matching email or phone number". Transactions use Contact ID or that match                                               | U                                                                                                                                                                                                              | U                                                                                                          |
| **DonorPerfect** (r08, VV transcript)                | Default is "update existing records and insert the rest", matching on last name + first name + address + zip                                                             | A blank "will not blank it out"                                                                                                                                                                                | "reach out to support"                                                                                     |
| **RE NXT** (S)                                       | Web view matches "System Record ID, Constituent ID, or Import ID". One import can add and update                                                                         | U                                                                                                                                                                                                              | Database view: import a caret `^` to blank a field (S, community blog)                                     |
| **CiviCRM** (r08, VV)                                | Duplicate action: Skip / Update / Fill / No Duplicate Checking                                                                                                           | "Fill" fills only empty fields _(per r08)_                                                                                                                                                                     | U                                                                                                          |

- **HubSpot "Don't overwrite" is stricter than "fill empty":** "the import will update the property for new records and existing records that have never had a value for the property. It won't update the property for existing records that have a value or had a value in the past, even if currently empty" (VV, https://knowledge.hubspot.com/import-and-export/import-objects). Blank-cell rule: https://knowledge.hubspot.com/import-and-export/set-up-your-import-file (VV).
- **Salesforce wording:** "The import wizard never overwrites your existing account data unless you select the Overwrite existing account values checkbox" (VV, https://resources.docs.salesforce.com/206/latest/en-us/sfdc/pdf/salesforce_import_cheatsheet.pdf; mode list from https://resources.docs.salesforce.com/204/latest/en-us/sfdc/pdf/salesforce_data_import_wizard_tipsheet.pdf). The Data Loader quote is from a search snippet of developer.salesforce.com: "When you're updating records, this option instructs Data Loader to overwrite existing data in mapped fields" (S).
- **NPSP:** `copyDIFieldToDestinationRecord` in https://github.com/SalesforceFoundation/NPSP/blob/main/force-app/main/default/classes/BDI_DataImportService.cls (VV). Dry run on Trailhead: "Dry Run - Matched None, which means ... a new record will be created" (VV, https://trailhead.salesforce.com/content/learn/projects/import-your-data-using-npsp-data-importer/perform-an-import-dry-run).
- **LGL:** "The Importer never deletes anything—it will only ever add or update". "Single value fields ... will be updated". For gifts, "any information you provide will replace what's there in the case of an update. If a match is not found, a new record will be created" (VV, https://help.littlegreenlight.com/article/50-what-kind-of-information-can-i-import-into-lgl). Name checkbox: https://help.littlegreenlight.com/article/274-using-the-flex-importer-control-how-constituents-are-updated (VV).
- **LGL matching:** with an External ID, "we strongly recommend turning off all optional matching options". Email-only "will match to the first constituent it finds with the same email address". Name-only "should be used with caution" (VV, https://help.littlegreenlight.com/article/272-control-duplicates-on-import).
- **Bloomerang fuzzy match:** a name plus one of "Email address", "Standardized street address" or "Last seven digits of phone number" counts as a match (VV, update article above).
- **Pattern** _(inference)_: blank means "no change" almost everywhere. Clearing a field is either impossible by import (HubSpot, LGL, Salesforce wizard, DonorPerfect) or an explicit opt-in (Planning Center globally, Data Loader per job). Nobody makes a blank clear a field by default. Per-column protection exists only in HubSpot. Per-field-type rules exist only in Virtuous and LGL (names).

## 3. Multi-valued fields: addresses, emails, phones, tags

- **Bloomerang:** "Address, email, and phone information always creates new entries to the account. It does not overwrite existing data." Also: "If you are mapping multiple contact fields of the same type, the last column in the spreadsheet will be made primary" (VV, https://help.bloomerang.com/en/articles/17568925-imports-import-data-into-bloomerang-crm). "The most recent addresses, emails, and phone numbers added from an import file will be marked as primary" (VV). From the 2024 deck: with "an incomplete address already on the constituent's account, an import will only add a new address, not update the existing" (VV, https://info.bloomerang.com/rs/618-WGI-459/images/3.14.24%20Import%20Basics%20%28Megan%29.pdf).
- **LGL:** "For phones, emails, addresses, and other sub records, the only way to make an update is to provide the LGL ID for that record". Otherwise "a new record is created", with an exact-duplicate check. Groups and tags "will always append new values" (VV, FAQ above).
- **Virtuous** gives each type its own rule (VV, https://support.virtuous.org/hc/en-us/articles/43984492506893-What-Are-Import-Settings):
  - New address: "Add when empty, manually review any conflicts (Default)" / "Add address and set to primary" / "Add address but do not set to primary" / "Ignore new addresses".
  - Existing address with formatting differences: "Manually review any conflicts (Default)" / "Replace any existing address information" ("this does not add the information as a secondary address") / "Ignore address updates".
  - Email and phone have the same four options.
- **RE NXT Address Finder (NCOA):** "Add the new address, marked as Primary ... Info source of AddressFinder"; "Mark the former address as Do not mail, with a Valid to date". If the address is "shared with other records, such as the constituent's spouse", it "automatically ... Adds the new address to those records" (VV, https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/data-address.html).
- **Bloomerang/TrueGivers:** "If a new address is found, the new address is marked as Primary". "Archive Addresses — Keeps a history of address changes ... Clear this checkbox if you want TrueGivers to update only the primary address and keep no history" (VV, https://help.bloomerang.com/en/articles/17568966-truegivers-national-change-of-address-ncoa-basics).
- **HubSpot multi-checkbox fields** replace by default. To append: "add a semicolon before the first value (;value 3;value 4). This will append the value instead of overwriting" (VV). Association labels on import are added, never overwritten (VV).
- **Givebutter** contact templates take "Primary Email" and "Emails – Enter additional email addresses separated by a comma", and the same for phones and "Tags" (VV, https://help.givebutter.com/en/articles/5497872-how-to-import-contacts). Whether tags append or replace is U.
- **Pattern** _(inference)_: contact points are added, not replaced. The real choice is whether the new value becomes primary. The old address is kept with an end date or "Do not mail". Tags append. Removing a tag is never an import action.

## 4. Safety features

- **Dry run / preview with counts:**
  - NPSP dry run with per-row match status (VV).
  - Bloomerang Verify page: "how many new constituents are being created, and how many existing constituents will be updated, and how many new donations will be created" (VV).
  - LGL "Import Summary" plus "accept or reject it ... or selectively reject just new or updated records" (VV, https://help.littlegreenlight.com/article/51-using-the-flex-importer).
  - Planning Center preview of "new or updated profiles and households, any errors ... and all identical records", with per-person uncheck (VV).
  - DonorPerfect "Preview data during import", "Import summary" and "Fix-on-the-fly" (VV).
  - **No vendor found shows field-level before/after diffs** for a bulk update (U). Virtuous comes closest: an orange conflict box per gift in Update Needed (VV).
- **Undo:**
  - Planning Center: "undo the import up to 48 hours after you imported it". "Undoing an import is permanent". "If the import changed a field, but you manually change the same field after the import, it will revert to what it was before". Do not undo after merges: it "can completely delete the merged person" (VV).
  - LGL: "undo the import if it is complete" (VV).
  - Givebutter: delete an import, but contacts with "online transactions (ie. card, ACH, Venmo) ... will not be deleted"; "We cannot restore deleted import data" (VV).
  - Bloomerang: "Imports are largely irreversible" (VV help). The 2024 deck adds that fixes usually need "paid data services or hours of manual work" (VV).
  - DonorPerfect: restore from one of three backups; restoring "will undo their data entry" for coworkers (r08, VV transcript).
  - HubSpot: "You can undo changes made to multiple records of an object within 14 days by restoring CRM data" on paid tiers (VV, https://knowledge.hubspot.com/properties/undo-property-value-changes).
- **Review queues and limits on risky updates (Virtuous, VV):**
  - "Require manual review of Gifts above this Amount".
  - "Review Contacts With Tag ... (Major Donor, for example)".
  - "Show warnings when Recurring Gift Payment is matched by amount only".
  - The auto-import options are opt-in.
  - Planning Center: "an Organization Administrator's profile can not be updated via CSV update" (VV).
  - **No vendor found caps bulk overwrites by count** (U).
- **Conflicts with recent edits:** no vendor was found that detects "changed since export" (U). Three documented behaviours lose later edits:
  - Planning Center undo reverts them (VV).
  - Virtuous Reprocess: "if you have manually entered any changes after importing ... you will lose that work" (VV, https://support.virtuous.org/hc/en-us/articles/6156012781965-What-Does-it-Mean-to-Reprocess-an-Import).
  - DonorPerfect restore (r08).
  - HubSpot's "had a value in the past" guard partly protects cleared fields (VV).
- **Audit trail:** Bloomerang Full Details shows "who ran the import, the import date, and the number of changed or skipped records" and "Download Import File" (VV). LGL "Generate Export" shows each row's match status (VV). Givebutter lists failed rows per import (VV). HubSpot exports property history (VV, link only).

## 5. Money via import

- **Batches with control totals (offline checks):**
  - Virtuous: "Batch Totals ... allows you to reconcile a deposit". It is "a hard control, so once it has been entered, it cannot be changed". The gifts "must equal $17,500, or else you will not be allowed to complete the import" (VV, https://support.virtuous.org/hc/en-us/articles/6187510397197-How-Do-I-Create-a-Gift-Batch).
  - NPSP batch fields: "Expected Count of Gifts", "Expected Total Batch Amount" and "Require Expected Totals Match", where "the total number of gifts and total amount must match the expected totals" (VV, NPSP `DataImportBatch__c` field metadata on GitHub).
  - RE NXT: edit "expected number of gifts, or expected batch total"; "You can't edit batch details on approved batches"; approve "once there are no gift exceptions" (VV, https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-gift-batch-record.html).
- **Historical import vs current batch:**
  - LGL "Create gift batch?": "This is not recommended if you are importing historical gift data" (VV).
  - Bloomerang: "If you import a donation made within the last 30 days, that donation can qualify a constituent to enter a donation automation" (VV). Date is the only separator.
  - Givebutter frames transaction import as "importing historical transactions"; amounts exclude fees; "you cannot import refunded transactions" (VV, https://help.givebutter.com/en/articles/6934176-how-to-import-transactions).
  - Virtuous partial imports enter CRM+ "immediately for Reporting, Receipting, and other acknowledgement purposes" (VV).
- **Duplicate payouts / re-imports:**
  - Virtuous: "If your file requires modifications after the initial import, remove any already-imported records from the file before re-uploading. Uploading without those adjustments will create duplicate records" (VV).
  - Virtuous API: a resubmitted `transactionSource` + `transactionId` pair "is recognized as a duplicate" (r08, VV).
  - Givebutter "External Label" + "External ID" columns "only work together" (VV).
  - CharityStack, a vendor blog: "only a stable gift key can stop the same transaction from becoming a second donation". "one missing $50 gift and one duplicate $50 gift can cancel each other out". "the second pass must not change the gift count" (S, https://www.charitystack.com/blog/nonprofit-donation-import-control).
- **Third-party platforms and DAFs: who is the donor and who receipts:**
  - **PayPal Giving Fund:** "Donors make their donations to PayPal Giving Fund and not to Participating Nonprofits. PayPal Giving Fund issues all legally required tax receipts to Donors" (VV, https://www.paypal.com/us/paypal-giving-fund/policies/nonprofit-user-agreement, s.4.d). Meta (Facebook/Instagram) fundraisers route through PPGF in the US (S).
  - **Benevity:** "These charitable foundations issue a tax receipt or donation acknowledgment on your behalf ... Your organization doesn't need to send Benevity or the foundations a tax receipt". "it is the charitable foundation that should be credited" (VV, https://causeshelp.benevity.org/hc/en-us/articles/360001149446).
  - **YourCause / Blackbaud Giving Fund:** "Your organization is not responsible for providing a tax acknowledgment". But for gifts received "directly into their Blackbaud Integrated Payments account", nonprofits "must issue IRS-compliant tax receipts" (VV, https://webfiles-sc1.blackbaud.com/files/support/helpfiles/npoconnect/content/npo-faq-about-blackbaud-giving-fund-bbgf.html and .../npo-disbursement-blackbaud-integrated-payments.html). The same vendor uses both paths, so receipt duty is per gift, not per platform _(inference)_.
  - **US DAFs:** IRS Notice 2017-73 says an advisor must not "claim a charitable contribution deduction ... even if the distributee charity erroneously sends the Donor/Advisor a written acknowledgment in accordance with § 170(f)(8)" (VP, https://www.irs.gov/pub/irs-drop/n-17-73.pdf). Fidelity Charitable suggests "Remember, this is not a tax receipt" (VV).
  - **Canada:** "The CRA's position is that registered charities should not issue official donation receipts to one another". A charity may send "a letter or a receipt that acknowledges the gift but does not state that it is an official receipt" (S, Miller Thomson summarising CRA, https://www.millerthomson.com/en/insights/social-impact/cardinal-rules-donation-receipts/).
- **Gross vs matched amounts:** Beacon's Benevity template defaults to "donated amount + matched amount" in one payment (VV, https://guide.beaconcrm.org/en/articles/5720545-how-to-import-your-donations-from-benevity). _(inference)_ This merges two legal donors into one row. Asym should not copy it.

## 6. Failure stories

- **Bulk overwrite noticed late:** "address, email and phone fields for nearly 10,000 records were overwritten in error during a data cleansing project. We didn't notice the issue until 2+ weeks after it happened—in that time, many records had been further updated" (S, customer quote on a vendor blog, https://www.spanning.com/blog/4-easy-steps-to-mass-restore-lost-salesforce-data-for-specific-fields/).
- **Stale data overwrote manual corrections:** a Blackbaud user said addresses they had fixed by hand "are reverting back to an old one" after Address Finder or NCOA runs (S, https://community.blackbaud.com/discussion/comment/228641). Another reported "20% of the updated addresses did not validate" (S).
- **NCOA moves the wrong person:** USPS Family matching is "Match on surname only", and family moves are about "40%" of NCOALink. Mailers may choose a mode that "omit[s] all 'Family' match inquiries" (VP, https://postalpro.usps.com/storages/2017-01/561_DIST-RTD.PDF, v6 2016). DonorPerfect's Canadian NCOA also uses "family (last name only) and individual (first and last name) match logic" (VV, https://uploads.donorperfect.com/pdf/factsheets/canadian-change-of-address-processing.pdf). RE NXT copies a new address onto a spouse sharing the old one (VV, §3). _(inference)_ When one spouse or an adult child moves out, a family match can move the whole household.
- **Wrong-match updates:**
  - LGL email-only matching takes "the first constituent it finds" (VV).
  - Bloomerang accepts name + last 7 phone digits (VV).
  - Virtuous breaks ties between "multiple high-confidence Contact records" by letting "AI ... select a best match" (VV, https://support.virtuous.org/hc/en-us/articles/6164198344205).
  - RE users report the error "Record to update is for another constituent" (S, Blackbaud community title).
  - _(inference)_ A shared or reused email can attach updates or gifts to the wrong person.
- **Duplicate gifts:** "Batch Committed Twice" in RE (S, community title, https://community.blackbaud.com/discussion/51490/batch-committed-twice). The Virtuous re-upload warning (VV, §5). An ActBlue-to-CRM help page: a gift came both "over the live ActBlue connection and was also included in a CSV you imported by hand" (S).
- **Undo that destroys:** Planning Center undo after a merge "can completely delete the merged person ... removing ... donations" (VV). DonorPerfect restore wipes coworkers' entries (r08).

## 7. UX patterns

- **Choose the import type up front:**
  - Bloomerang: "Constituents, Donations, Interactions or Notes", then Individual or Organization. "These three settings cannot be changed after you save this import template" (VV).
  - HubSpot: create-and-update, create-only or update-only (VV).
  - Virtuous: Gift Import or Contact Import in the Import Tool, with Bulk Update templates kept elsewhere (VV).
  - Givebutter order: "contacts should be imported first, followed by transactions, and then soft credits" (VV).
- **Templates and mapping reuse:**
  - Bloomerang re-runs a saved import "with a new file". Its deck warns: "avoid using templates created from past imports unless the new file has IDENTICAL column headers" (VV).
  - LGL "create a template from your import mappings" (VV).
  - Givebutter offers a "personalized template" with custom fields (VV).
  - Beacon ships per-source payout templates (VV).
- **Counts before commit:** new / updated / identical / errors (Planning Center, Bloomerang, LGL; VV). Virtuous uses three work queues: Match Needed, Update Needed, Ready for Import (VV).
- **Per-row errors and reports:**
  - Planning Center: "Export CSV of these X profiles", fix, re-import (VV).
  - Bloomerang "Download Skipped Records" (VV).
  - DonorPerfect: "export only erred records" (VV).
  - LGL per-row match export (VV).
  - Givebutter failed-row download (VV).
- **Test small first:** Bloomerang says to test "the first five rows" or "send the import file over to Support for review" (VV). LGL notes in-file duplicates are matched only during processing, so preview counts may be too high (VV).
- **Side effects:** Givebutter: "imports do not trigger workflows" (VV). Bloomerang: recent imported gifts can enter automations (VV).

## Common pattern

1. Every product separates **matching** (ID first, then fuzzy rules) from **write behaviour**. ID matching is always the recommended path.
2. **Blank means "leave alone"** by default everywhere. Clearing is impossible by import or needs an explicit, rare opt-in.
3. **Contact points are added, not replaced.** The only choice is primary or not. Old addresses get an end date or "Do not mail". Tags append.
4. **Gifts are create-only.** Bloomerang and HubSpot cannot update activities by import. LGL can, keyed by gift ID. Current offline gifts go into **batches with expected count and total** (NPSP, RE NXT, Virtuous) before posting.
5. **Undo is weak and dangerous.** It is either absent (Bloomerang), whole-database (DonorPerfect), a time window that reverts later edits (Planning Center 48 h, HubSpot 14 days) or a delete (Givebutter, LGL). None protects later staff edits.
6. **Payout platforms (PPGF, Benevity, BBGF) and DAF sponsors are the legal donors.** They receipt donors themselves. Vendors still import these gifts as ordinary rows, so receipt suppression is left to staff _(inference)_.
7. **NCOA runs as a separate nightly or quarterly service**, not as a CSV import. It auto-applies, with weak review and family-match risk.

## Implications for Asym

1. **Everyday import types in v1** _(inference throughout)_. Offer three, chosen up front, each with its own template:
   - **People: add and update.** Name, contact points, tags/lists and custom fields. This covers event and volunteer lists and signups.
   - **Contact-point update.** Address, email and phone changes, including vendor NCOA result files, run through review.
   - **Gifts from a file into a Phase 15 gift-entry batch.** Covers check scans and payout reports.
   - Leave these out of v1: gift updates or deletes by import, pledge and commitment uploads, merges, consent grants and NCOA service integration.
2. **Per-target write modes:**
   - For each scalar column, offer **Fill empty only** (the default on update), **Replace** (opt-in per column, showing "N existing values will change") and **Ignore**.
   - Name and legal-donor fields default to fill-empty-only, like LGL's name checkbox.
   - Protected records always go to review: staff, deceased, do-not-contact and any tag the ministry marks (Virtuous model).
3. **Blank cells:** a blank always means "no change." Clearing is a separate, explicit act, either a "Clear" column action or a reserved token, with a count and a confirmation. Never a global switch like Planning Center's.
4. **Multi-valued fields:**
   - Emails, phones and addresses are always added, with exact dedupe.
   - Each import chooses "make new value primary", "add as secondary" or "review conflicts" (the default).
   - The old address gets a valid-to date, never a delete.
   - Tags and lists add only. Removing a tag is its own import type or bulk action.
   - Address changes never spread to household members unless each person is matched individually. Family/surname-only NCOA matches go to review.
5. **Conflicts:** keep the Phase 30 rule ("a changed target is a conflict", `roadmap.md:4349`). Also flag a row when the field changed after the file's export time, if the template carries one, or after the plan was made. Show these as a separate count beside new, updated, unchanged and errors.
6. **Money imports:**
   - Current gifts never commit straight from Phase 30. A file becomes a **draft Phase 15 batch** with required expected count and amount and a deposit group. It posts through the normal receipt path.
   - Historical import stays receipt-dark (`roadmap.md:4377,4395`).
   - Each payout file carries an idempotency key: platform + payout ID, plus a per-row source transaction ID. Asym refuses a second file with the same payout.
   - Each row carries a **receipting party**: ministry, platform/DAF sponsor or none. PPGF, Benevity, BBGF and DAF rows default to "not a tax receipt" thank-yous. This reuses the existing DAF pattern ("For your information — not a tax receipt", Phase 25).
   - Employer matches are separate gifts from the employer or foundation, not one combined row.
7. **Undo:**
   - Non-money imports can be **reversed per batch**. A reversal restores a field only if its current value still equals what the import wrote. Anything since edited is reported, not reverted. Parties that have since merged or have gifts are not deleted.
   - No promised fixed window (`roadmap.md:4395`).
   - Posted money is never undone by import reversal. It needs the owner's correction or reversal path.

## Open for counsel

1. **US:** may a ministry send a DAF advisor or a PPGF/Benevity donor any acknowledgment that names an amount? What wording avoids an implied § 170(f)(8) acknowledgment (Notice 2017-73, "erroneously sends")?
2. **Canada:** confirm the CRA position on gifts from other registered charities, including Canadian DAF public foundations and Canadian Benevity/CanadaHelps flows. Confirm receipt timing for current gifts entered late or across year-end.
3. **Employer matches and payroll gifts:** who is the legal donor for receipts in each country? Are pre-tax payroll gifts (Benevity: no receipt) handled differently?
4. **Fees and net payouts:** when the ministry is the receipting party but the platform deducts fees, is the receipt amount the gross gift?
5. **NCOA:** do USPS NCOALink and Canada Post NCOA licence terms limit storing move results, or using them beyond updating existing mailing addresses? Must records of family-match updates be kept?
6. **Imported signups:** what third-party consent evidence suffices under CASL and CAN-SPAM for everyday newsletter imports? (Q9 sets legacy rules. Everyday imports need the same test.)
7. **Payout reports:** retention and privacy of uploaded payout files containing donor PII. Do platform "anonymous" or "do not share" flags bind the ministry?
