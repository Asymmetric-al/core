# Q19 R4: The end-to-end import journey in outside products, step by step

All sources were accessed on 2026-11-03. This file covers outside practice only and does not describe Asym code. It continues Q19 R2 (`q19-r2-external-data-tools.md`), which covered where import tools sit and who may use them; that ground is not repeated here. Only §9 and §10 make recommendations, and both are labelled _(inference)_.

**Labels.** **VP** = public-sector or standards text fetched (GOV.UK). **VV** = a vendor, publisher or design-system document fetched: a help page, developer doc, changelog, PDF or design-guidance article. **S** = secondary: a search-result snippet of a page the fetcher could not open, a community or forum post, a third-party blog, a partner page or a vendor marketing blog. **U** = unverified or not found. Each claim carries a source tag such as [HS1], and every tag resolves to a URL in §12. Dates are the page's "last updated" date where one is shown.

**Blocked or thin.** These sites returned 403 to the fetcher: support.virtuous.org, support.keela.co, help.salesforce.com, developer.salesforce.com (Bulk API pages) and docs.oneschema.co (Cloudflare challenge on most pages). Facts from them are **S** (search snippets). Neon CRM's step-by-step Import Manager help was not reachable; only Neon Academy course outlines were (**VV** outline, **S** detail). Raiser's Edge NXT's web-view import help was not found, so the batch facts come from Blackbaud's gift-batch help (**VV**) and community posts (**S**). The Osmos Uploader docs were not found; press reports say Microsoft acquired Osmos in January 2026 [OM1]. Notion's in-app CSV mapping screen and Linear's progress notifications are **U**. No 2024–2026 US survey reporting a percentage for staff CRM or data skills was found (**U**). The UK Charity Digital Skills Report 2025 and a 2024 US leadership study are used instead (§7.6).

---

## 1. Step-by-step flows of the leading importers

### 1.1 Comparison of the whole journey

| Product                                      | Start → file                                                                                                                                                                  | Match columns                                                                                                                                                                                          | Plan / preview before commit                                                                                                                                                                      | Commit button                                                                                 | While running                                                                                                                                         | Results and errors                                                                                                   | Undo                                                                                                                  | Label               |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------- |
| HubSpot                                      | Data Integration → "Import data" → objects → single/multiple file → per object "Create and update / Create new only / Update existing only" → upload or paste [HS1]           | "HubSpot Property" + "Import As" ("Don't import column"); "Create new property"; "Don't overwrite" per column; "[x] errors" → "Edit errored values" [HS1][HS2]                                         | No record-level preview. A details page asks for "Import name", a consent checkbox, date, time-zone and number formats [HS1][HS2]                                                                 | **"Finish import"** [HS1]                                                                     | Review page with a "timeline of the import's status along with an estimated completion time" [HS2]. Up to 3 imports run at once; the rest queue [HS5] | Summary card: rows imported, created, updated. Errors tab. "View rows with errors", "Download error file" [HS3][HS4] | None for updates. Deleting created records "will not reverse" updates [HS3]                                           | VV                  |
| Salesforce Data Import Wizard                | Setup → "Launch Wizard!" → object → add / update / both + match by → CSV → character encoding [SF1]                                                                           | Auto-map. "Map" / "Change"; unmapped columns are not imported or go to a note [SF1]                                                                                                                    | Review page, "Previous" to fix [SF1]                                                                                                                                                              | **"Start Import"** [SF1]                                                                      | Asynchronous Bulk API job [SF2]                                                                                                                       | Bulk Data Load Jobs page; email to the importer [SF1]                                                                | U                                                                                                                     | VV                  |
| Salesforce NPSP Data Importer                | Staged rows on the "NPSP Data Imports" tab → "Import All Data Import Records" [SF3]                                                                                           | Done earlier in the staging object                                                                                                                                                                     | **"Begin Dry Run"** writes per-row statuses ("Dry Run - Matched", "Dry Run - Matched None") and a "Dry Run - Errors" list view [SF3]                                                              | Real run follows the dry run (button name U) [SF3]                                            | Status page with elapsed time and alerts [SF3]                                                                                                        | Errors fixed on the staged record, then re-run [SF3]                                                                 | U                                                                                                                     | VV                  |
| Bloomerang                                   | Data Tools → Import → "New" template (or reuse) → type → individual / organisation → "Select a File" [BL1]                                                                    | Auto-map; "Add Another Field"; Preview area [BL1]                                                                                                                                                      | **"Verify Your Information"**: new constituents, donations, notes and interactions; updated constituents and households; errors at the bottom; "How Should We Update Existing Constituents" [BL1] | **"Run"**, then confirm [BL1]                                                                 | U                                                                                                                                                     | Success page; "Download Skipped Records"; last five imports kept [BL1][BL2]                                          | "Imports are largely irreversible", so test the first five rows [BL3]                                                 | VV                  |
| Virtuous                                     | Import Tool in the left navigation; gifts from integrations arrive as overnight batches [VI1][VI3]                                                                            | U                                                                                                                                                                                                      | Three tabs: **Match Needed**, **Update Needed**, **Ready for Import**. Errors also appear under Update Needed [VI1]                                                                               | **"Import"** (top right) once the other tabs are clear [VI1]                                  | U                                                                                                                                                     | Import history with statuses such as "Processed" [VI1]                                                               | "Reprocess" and "Archive" articles exist (content U) [VI4]                                                            | S                   |
| Little Green Light (Flex importer)           | Home → Flex Importer → "Import a file" → "Upload file and go to step 2" [LG1]                                                                                                 | Mapping with a live "Record Preview"; saved templates [LG1]                                                                                                                                            | **"Save and load data for review"** prepares data without adding it. An "Import Summary" estimates new and updated records [LG1][LG2]                                                             | Accept, or reject all / only new / only updated [LG1]                                         | Dashboard alert while an import is uncommitted [LG1]                                                                                                  | Final "Import Summary" with actual counts; "Generate Export" shows each row's match status [LG2]                     | Undo a completed import [LG1]                                                                                         | VV                  |
| Neon CRM                                     | Import Manager; accounts with or without Account IDs [NE1]                                                                                                                    | U                                                                                                                                                                                                      | U. The course lists an optional "Duplicate Management Tool" step [NE1]; "Account Match" and a "Partial Match Queue" [NE2]                                                                         | U                                                                                             | U                                                                                                                                                     | U                                                                                                                    | U                                                                                                                     | VV outline / S      |
| DonorPerfect (Online Import Module)          | Import module [DP1]                                                                                                                                                           | U                                                                                                                                                                                                      | "Preview data during import"; "Automatic field analysis"; "Fix-on-the-fly"; "Import summary shows number of records" [DP1]                                                                        | U                                                                                             | U                                                                                                                                                     | "Ability to export only erred records for import later" [DP1]                                                        | U                                                                                                                     | VV (factsheet)      |
| Givebutter                                   | Contacts → Import (or Settings → Imports → "New Import") → "Download Import Template" → "Upload file" [GB1]                                                                   | Sheet choice, then match columns with a dropdown; a "Transform" tool for bulk fixes [GB1]                                                                                                              | Not described                                                                                                                                                                                     | **"Continue"** then **"Submit"** [GB1]                                                        | Email when finished; unfinished imports kept as **Drafts** [GB1][GB2]                                                                                 | Settings → Imports: row count, failed rows, date; failed rows downloadable [GB1]                                     | "Delete imported contacts / transactions", confirmed with "Delete Data"; the import then shows **Deleted** [GB1][GB2] | VV                  |
| Keela                                        | Contacts first, then donations [KE3]                                                                                                                                          | Column by column [KE2]                                                                                                                                                                                 | Duplicate-check options appear for contact imports only [KE3]                                                                                                                                     | U                                                                                             | U                                                                                                                                                     | "Check your Duplicates Manager after each Import" [KE1]                                                              | U                                                                                                                     | S / VV glossary     |
| Raiser's Edge NXT                            | Web-view import was in early access for constituents and gift batches, with "Validate only" planned [BB3]                                                                     | U                                                                                                                                                                                                      | Gift batch: "expected number of gifts" and "expected batch total"; a "Fix now" banner for exceptions; Validate [BB1]                                                                              | **Approve** batch, allowed only with no exceptions [BB1]                                      | U                                                                                                                                                     | "Possible duplicate" and "New" indicators beside names [BB2]                                                         | U                                                                                                                     | VV batch / S import |
| Planning Center Giving (donation history)    | Manage → Tools → Import donations → "New import" → choose a payment source → upload [PC1]                                                                                     | **"Next: Map fields"**, then **"Next: Map values"** (fund and payment method required) [PC1]                                                                                                           | **Preview**: "Ready to import" with tabs "Donations to new profiles" and "Matched to existing profiles"; a "Donations with errors" tab [PC1]                                                      | **"Import [number] donations"** [PC1]                                                         | U                                                                                                                                                     | Summary page. "Export errors & skipped rows". Creates a **batch group**: "View and commit batch" [PC1]               | Undo for two weeks [PC1]                                                                                              | VV                  |
| Planning Center People                       | People → Actions → "Import & export CSV" → "Start Import" [PC2]                                                                                                               | Left: CSV column. Right: field dropdown. **"Examples from CSV"**. "Not Used". Checkboxes "Empty fields should delete existing data" (off) and "Create new options detected from CSV fields" (on) [PC2] | Preview sidebar: new and updated profiles and households, errors, identical records; per-row checkbox; "Ignore all" [PC2]                                                                         | **"X fields to import"** builds the preview, then **"Finish import"** [PC2]                   | U                                                                                                                                                     | "View Results" [PC2]                                                                                                 | Undo within 48 hours; the user types "Undo import" [PC2]                                                              | VV                  |
| Attio                                        | Object → "Import / Export" → "Import CSV" → shows the detected column and row counts [AT1]                                                                                    | "File column" ↔ "Attributes"; "+ Create new attribute"; x to skip [AT1]                                                                                                                                | **"Review values"** per column (Raw data vs Mapped value), then **"Preview import"** with created and updated counts by object [AT1][AT3]                                                         | **"Start import"** [AT1]                                                                      | Progress bar plus a table filterable by "Failed / Planned / Completed". "You can close the page" [AT1]                                                | Per-record success or failure icon with the reason on hover [AT1]                                                    | Not described [AT1]                                                                                                   | VV                  |
| Pipedrive                                    | Tools and apps → Import data → "Get started" → file info → "Upload spreadsheet" (checked for format, row limits, headers) [PD1]                                               | Auto by name; drag unmatched columns; add a custom field [PD1]                                                                                                                                         | **Preview** ("final chance to fix") [PD1]                                                                                                                                                         | Duplicates (merge), Overwrite / Append for multi-option fields, then **"Start import"** [PD1] | U                                                                                                                                                     | History: **added, updated, merged, skipped**; a "skip file" with reasons [PD1]                                       | Revert within 48 hours, global admins only [PD1]                                                                      | VV                  |
| Shopify products                             | Products → Import → "Add file" (15 MB) → "Publish new products to all sales channels" (on) and "Overwrite products with matching handles" (off) → "Upload and continue" [SH1] | None (fixed CSV template) [SH1]                                                                                                                                                                        | "Review the details about the import" [SH1]                                                                                                                                                       | **"Import products"** [SH1]                                                                   | "Can't be canceled once they begin" [SH1]                                                                                                             | Confirmation email; no import history; check the activity log [SH1]                                                  | None [SH1]                                                                                                            | VV                  |
| Shopify customers                            | Customers → Import → "Add file" → optional overwrite and optional tag-and-segment [SH2]                                                                                       | None (fixed template) [SH2]                                                                                                                                                                            | Not described [SH2]                                                                                                                                                                               | **"Import customers"** [SH2]                                                                  | U                                                                                                                                                     | Duplicates skipped (only the last duplicate is imported) [SH2]                                                       | U                                                                                                                     | VV                  |
| Stripe Billing migration toolkit             | Subscriptions → Migrations → "Let's get started" → "Download CSV template" → "Upload CSV" (120 MB). Validation can take hours [ST1]                                           | None (fixed template) [ST1]                                                                                                                                                                            | **Review summary**: upload date, file name, number of subscriptions, number of customers, first go-live date [ST1]                                                                                | **"Start migration"**, or **"Cancel migration"** [ST1]                                        | "Migration in progress", then "Scheduled subscriptions" for 24 hours before they go live [ST1]                                                        | Failure summary; "Download file to review errors" (`processing_error` column); "Upload revised file" [ST1]           | Cancel within 10 hours of scheduling [ST1]                                                                            | VV                  |
| Airtable (CSV import extension)              | Tools → Extensions → CSV import → drop file → table [AI1]                                                                                                                     | Toggles per table field, each with a CSV-column dropdown; mappings are remembered; "Reset" [AI1]                                                                                                       | Counts of records **to update, unchanged, and new**, plus a record preview [AI1]                                                                                                                  | **"Create records"** [AI1]                                                                    | Seconds to minutes [AI1]                                                                                                                              | U                                                                                                                    | Take a base snapshot first [AI1]                                                                                      | VV                  |
| Notion                                       | Settings → Import → CSV, or "Merge with CSV" on a database [NO1]                                                                                                              | Columns to properties [NO1]                                                                                                                                                                            | None described                                                                                                                                                                                    | U                                                                                             | U                                                                                                                                                     | U                                                                                                                    | U. "Imports add rows. They don't update existing rows, so watch for duplicates" [NO1]                                 | VV                  |
| Linear (import assistant)                    | Five stages: "Setup", "Review", "Choose what to import", "Map users", "Confirm" [LI1]                                                                                         | User mapping: skip, create, or map to an existing user [LI1]                                                                                                                                           | "Confirm": a summary of what will be imported [LI1]                                                                                                                                               | **"Finish"** [LI1]                                                                            | U                                                                                                                                                     | Re-import to the same team skips issues already imported [LI1]                                                       | Delete the import, for a limited time only [LI1]                                                                      | VV                  |
| Mailchimp                                    | Audience → "Import contacts" → upload / paste / another service → groups → "Update any existing contacts" → tags [MC1]                                                        | "Continue to match"; click a column to change its field or create one; "Any unmatched columns won't be imported" [MC1]                                                                                 | "Finalize import" shows a settings summary [MC1]                                                                                                                                                  | **"Complete Import"** [MC1]                                                                   | Email when finished [MC1]                                                                                                                             | "View Your Contact Import Results": added or updated, syntax errors [MC1]                                            | "Undo a Contact Import" exists (window U) [MC1][MC2]                                                                  | VV                  |
| Insycle (CRM add-on; benchmark for previews) | Magical Import [IN1]                                                                                                                                                          | Choose matching fields; matched records appear as links [IN1]                                                                                                                                          | **"Compare (Preview)"** writes a CSV with "(Before)" and "(After Update)" columns per field. It is read-only. A "Show Only Warning Rows" filter is available [IN1]                                | U                                                                                             | U                                                                                                                                                     | Result column, e.g. "Not Compared" / "Failed" with a message [IN1]                                                   | U                                                                                                                     | VV                  |

### 1.2 Screen-by-screen notes worth copying

**HubSpot (VV, updated 2026-06 to 2026-10).**

1. _Choose:_ objects, then single or multiple files, then a "Choose how to import" dropdown per object. "View import property requirements" shows the required fields [HS1].
2. _Upload:_ upload or paste, with a dropdown for the language of the column headers [HS1]. The limits are 512 MB per file, 1,048,576 rows per file, and 10,000,000 rows per rolling 24 hours (paid tiers). A file must have one sheet and fewer than 1,000 columns. It needs UTF-8 "if the file includes foreign language characters" [HS5].
3. _Map:_ the unique identifier is chosen in the property dropdown and shown with a key icon. A checkbox "Don't import data in unmapped columns" applies to all leftovers. Mapping errors are fixed in a side panel with "Edit errored values", without re-uploading [HS1][HS2][HS4].
4. _Details:_ "Import name", a consent checkbox ("not a purchased list"), date and time format, time zone, number format, and an optional segment [HS1][HS2].
5. _Finish:_ a review page with a status timeline and an estimated completion time [HS2].
6. _Afterwards:_ the history columns are Name, New records, Updated records, New associations, Errors, Import System, Import Source, Created by, and Create date/time. Row actions include "Use as template for new import", "Download error file" and "View rows with errors". Original files can be downloaded for six months only [HS3]. Errors carry an _impact_: row skipped, single value skipped, or record imported with the property blank. Sensitive values appear as "REDACTED" on screen and in the file [HS4].

**Planning Center Giving (VV, 2026-11-02).** This is the closest outside match to Asym's "Gift file" for a ministry.

1. Before the import, set up a payment source (one per import) and the funds. DAF and QCD gifts go in separate files with their own payment sources [PC1].
2. "Map fields" auto-maps exact name matches and skips unmapped columns. "Map values" maps several CSV fund names to one Giving fund [PC1].
3. Donors are matched in order: Remote ID, then full name + email, then full name + phone, then full name only (used only when the row has no email or phone). **Multiple matches are an error**: merge in People, then re-import those rows. Matched profiles do not take the CSV's phone or email, but a missing mailing address is added [PC1].
4. The preview has tabs for new-profile and matched donations, plus an errors tab. Per-row checkboxes skip one donation or all of a donor's donations. The button reads "Import [number] donations" [PC1].
5. The import creates a **batch group** split by year, which is then committed separately. "Donation receipts are not sent for imported donations". Imported donations do appear on statements [PC1].
6. Undo lasts two weeks. It deletes created profiles unless they have had activity outside Giving [PC1].

**Attio (VV).**

- _Upload:_ shows "detected column and row counts" before the full upload starts [AT1].
- _Map:_ a two-column "File column" / "Attributes" layout [AT1].
- _Review values:_ for each column, users see "Raw data" next to "Mapped value", can edit or skip a value, or revert an edit with an arrow. Unparseable values show "Invalid format" and are skipped. A gear icon sets the date and number format the file uses. "Create missing select options" adds unknown option values [AT1].
- _Preview import:_ says "Up to [X] will be created". This is an estimate, because rows that share a unique value merge at run time [AT1].
- _Run:_ a progress bar and per-record status [AT1].
- _Drafts:_ setup progress is saved as a Draft. Anyone can continue a draft, and a draft link can be shared for review [AT2].

**Stripe Billing migration toolkit (VV).**

- _Practice first:_ a sandbox is recommended for a test migration [ST1].
- _Safety default:_ an "Advanced settings" checkbox, "Allow subscriptions without a default payment source", is **off** by default, which blocks risky rows [ST1].
- _Review:_ a five-fact summary before "Start migration" [ST1].
- _Buffer:_ a built-in 24-hour "scheduled" buffer before anything charges, and a 10-hour cancel window [ST1].
- _Batches:_ "divide the subscriptions into batches and start with a small batch" [ST1].
- _Double-billing warning:_ "cancel old subscriptions before they charge so you don't double-bill" [ST1].

### 1.3 Embedded-importer vendors: the 2026 bar

| Capability                         | Flatfile                                                                                                                            | OneSchema                                                                                                                       | Dromo                                                                                                                                                                                                       | nuvo / Ingestro                                         | CSVBox                                                           | ImportCSV                                                              |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Header-row detection               | Default scans the first 10 rows and picks the one with the most non-empty cells; also "specificRows" and sub-header detection [FF3] | Pane 2 "Select header row" is skipped automatically when the headers match the template [OS1][OS5]                              | "Select the header row" step; `headerRowOverride` [DR1]                                                                                                                                                     | "Header Selection" step per sheet [NU1]                 | U                                                                | U                                                                      |
| Encoding / delimiter               | U                                                                                                                                   | "Convert to Unicode (UTF-8)": "Auto-detect handles UTF-8 and UTF-16; other encodings are selected explicitly" (FileFeeds) [OS6] | Delimiter auto-detected [DR1]                                                                                                                                                                               | U                                                       | Handles "encoding issues, delimiter detection" (marketing) [CB1] | U                                                                      |
| Sheet picker                       | Excel extractor [FF3]                                                                                                               | "Extract Excel worksheets" [OS6]                                                                                                | Sheet selection modal; `sheetOverride` skips it [DR1]                                                                                                                                                       | "Sheet Selection" step [NU1]                            | U                                                                | U                                                                      |
| Column matching                    | ML suggestions plus "memory of your and your colleagues' past selections"; hover shows a data preview; "Add as New Field" [FF1]     | Template-driven mapping [OS6]                                                                                                   | "Match your columns". **Fuzzy matching can be switched off** so that only exact label, key or `alternateMatches` matches are suggested. "Remember mapped headers and values". "Add custom field" [DR1][DR2] | Matching uses key, label and `alternativeMatches` [NU1] | "Matching Keywords" plus learning from past mappings [CB2]       | "Smart mapping" (AI) [IC1]                                             |
| Confidence shown                   | Automap thresholds "strong (> 90%)" and "absolute (100%)" (headless) [FF4]. In-UI indicator U                                       | U                                                                                                                               | U                                                                                                                                                                                                           | U                                                       | U                                                                | U                                                                      |
| Required fields                    | U                                                                                                                                   | U                                                                                                                               | `BLOCK_SUBMIT` disables "Finish" [DR1]                                                                                                                                                                      | `required` validation [NU1]                             | "Required" flags empty cells [CB2]                               | Zod schemas [IC1]                                                      |
| Value mapping (option lists)       | A separate screen per category field: "Keep this value as is" or "Do not import" [FF1]                                              | Picklist mapping prompts users to map values to the template's set [OS3]                                                        | **"Bulk fix"** step for select, multi-select and date values; up to 50 unique values per field by default (max 1,000) [DR1]                                                                                 | Option mapping inside Match Columns [NU1]               | U                                                                | U                                                                      |
| In-grid validation with inline fix | Review table [FF2]                                                                                                                  | "Review & Finalize" is a "spreadsheet-like experience" where users "spend majority of their time" [OS2]                         | "Review and edit" step; "Error Navigator" panel with "Clear" / "Replace" per error [DR1]                                                                                                                    | "Review Entries" [NU1]                                  | "Errors surface per-row" (marketing) [CB1]                       | Validation and error handling [IC1]                                    |
| Bulk find and replace              | "Find and Replace", "Replace Empty Values", "Search by Value" per column [FF2]                                                      | Bulk find and replace of picklist values [OS4]                                                                                  | Find and replace, case-sensitive and whole-cell options (since Nov 2023) [DR2]                                                                                                                              | U                                                       | U                                                                | U                                                                      |
| "Show only rows with errors"       | Filter button plus "Advanced filter" [FF5]                                                                                          | U (snippets mention a "show error" filter)                                                                                      | An "ErrorFilterButton" exists (2026 style changelog); search in review (Aug 2024) [DR2]                                                                                                                     | U                                                       | U                                                                | U                                                                      |
| Auto-fix transparency              | U                                                                                                                                   | U                                                                                                                               | `highlightAutoFixes` marks cells changed by automatic transforms, such as left-padded zip codes or adjusted phones [DR1]                                                                                    | U                                                       | U                                                                | U                                                                      |
| Keyboard                           | U                                                                                                                                   | U                                                                                                                               | Alt+↑ / Alt+↓ step through errors; keyboard tabbing and WCAG fixes (Jan 2026) [DR1][DR2]                                                                                                                    | U                                                       | U                                                                | U                                                                      |
| Large files                        | Jobs with progress; multi-part jobs [FF6]                                                                                           | U                                                                                                                               | Batch row hooks of 2,000 rows by default [DR2]                                                                                                                                                              | U                                                       | "Up to 2 million rows" (plan-dependent) [CB1]                    | "10,000+ rows" with virtual scrolling and progressive validation [IC1] |
| Rows with errors at submit         | U                                                                                                                                   | U                                                                                                                               | Three modes: block submit; "Discard X rows with issues. Submit the rest."; or "Submit your data anyway" [DR1]                                                                                               | Error rows returned to the host [NU1]                   | Failure report [CB2]                                             | U                                                                      |
| Offline round trip                 | "Download Records" [FF2]                                                                                                            | Export of sheets [OS6]                                                                                                          | Download the current state as Excel "with error annotations"; re-uploading "will pick up where they left off" [DR3]                                                                                         | U                                                       | U                                                                | U                                                                      |

Osmos is not benchmarked. Press reports say Microsoft acquired it in January 2026 to fold it into Fabric [OM1]. A report that its Uploader product is being "sunset" could not be opened (**U**).

---

## 2. Mapping UI patterns

| Pattern                               | What the best tools show                                                                                                                                                                                                                                                                                 | Evidence                            |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Two columns with sample values        | One row per file column: source name, **sample values**, target-field dropdown. Planning Center labels the samples "Examples from CSV"; Flatfile shows a preview on hover; Attio shows raw versus mapped values per column                                                                               | [PC2][FF1][AT1] (VV)                |
| Rule-based suggestions (no AI)        | Synonym lists ("alternateMatches", "alternativeMatches", "Matching Keywords") and exact-name matching. Dromo can switch fuzzy matching off. Planning Center auto-maps only "exact name matches"                                                                                                          | [DR1][NU1][CB2][PC1] (VV/S)         |
| Confidence indicators                 | Only Flatfile documents confidence levels, and only for headless automation ("strong (> 90%)", "absolute (100%)"). No vendor documents an on-screen confidence badge                                                                                                                                     | [FF4] (VV); UI **U**                |
| "Don't import this column"            | HubSpot "Don't import column" plus a bulk "Don't import data in unmapped columns"; Planning Center "Not Used"; Attio "x"; Mailchimp and Salesforce: unmatched columns are not imported (Salesforce can send them to a note)                                                                              | [HS2][PC2][AT1][MC1][SF1]           |
| Remembered mappings / templates       | Bloomerang named templates that can be re-run with a new file; HubSpot "Use as template for new import" (imports under six months old only); Planning Center "saved mappings carry over" on re-import; Airtable remembers mappings; Dromo "Remember mapped headers and values"; LGL templates            | [BL1][HS3][PC1][AI1][DR2][LG1]      |
| Required-field gating                 | Up front: HubSpot "View import property requirements", Pipedrive highlights mandatory fields, Givebutter states the minimum columns. At the end: Dromo `BLOCK_SUBMIT`                                                                                                                                    | [HS1][PD1][GB1][DR1]                |
| Format pickers                        | Per import: HubSpot "Date format", "Time zone", "Number format". Per column: Attio's gear for date, number and timestamp. Not found: a picker for phone country or currency (**U**). HubSpot expects phones as "+[country code][number]"                                                                 | [HS1][AT1][HS5]                     |
| Value-mapping tables for option lists | Flatfile has a per-field value screen ("Keep this value as is" / "Do not import"). Dromo has "Bulk fix" (default 50 distinct values per field). OneSchema has picklist mapping. Planning Center "Map values" maps many CSV funds to one fund. Attio and Airtable can "Create missing select options"     | [FF1][DR1][OS3][PC1][AT1][AI1]      |
| Creating custom fields from mapping   | HubSpot "Create new property" (a right-side panel); Attio "+ Create new attribute"; Pipedrive "add a custom field"; Mailchimp "create a new field"; Flatfile "Add as New Field"; Dromo "Add custom field". Planning Center's "Create new options detected from CSV fields" adds options only, not fields | [HS2][AT1][PD1][MC1][FF1][DR1][PC2] |
| Per-column overwrite control          | HubSpot "Don't overwrite" per mapped property; Pipedrive "Overwrite" / "Append" for multi-option fields; Planning Center "Empty fields should delete existing data" (off by default)                                                                                                                     | [HS1][PD1][PC2]                     |

---

## 3. Preview, plan and match review

### 3.1 How the best tools summarise the plan before commit

| Product                | Counts shown before commit                                                                 | Caveat stated                                                                                                 | Label |
| ---------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- | ----- |
| Airtable               | Records **to update / won't change / new**                                                 | Merge matching is case-sensitive [AI1]                                                                        | VV    |
| Attio                  | Created and updated per object; "Up to [X] will be created"                                | An estimate, because same-key rows merge at run time [AT1]                                                    | VV    |
| LGL                    | "Import Summary": new and updated                                                          | Does not catch duplicates within the file, so the "Ready for Review" counts can exceed the final counts [LG2] | VV    |
| Bloomerang             | New constituents, donations, notes, interactions; updated constituents, households; errors | Addresses, emails and phones "always create new entries and never overwrite" [BL1]                            | VV    |
| Planning Center People | New and updated profiles and households, errors, identical records                         | None [PC2]                                                                                                    | VV    |
| Planning Center Giving | Donations to new profiles; matched to existing profiles; donations with errors             | Multiple matches become errors [PC1]                                                                          | VV    |
| Virtuous               | Match Needed / Update Needed / Ready for Import                                            | Errors sit under Update Needed and block completion [VI1]                                                     | S     |
| Stripe                 | Subscriptions, customers, first go-live date                                               | Validation can take hours [ST1]                                                                               | VV    |
| NPSP                   | Per-row dry-run status rather than totals                                                  | None [SF3]                                                                                                    | VV    |
| HubSpot, Shopify       | None before commit                                                                         | None [HS1][SH2]                                                                                               | VV    |

### 3.2 Per-row "current → new" diffs

Among mainstream CRMs, no on-screen per-field before/after view was found (**U**). The clearest documented example is Insycle's **"Compare (Preview)"**. It is a read-only run that produces a report with "(Before)" columns for existing CRM data next to "(After Update)" columns for incoming values, and a result per row ("Not Compared", "Failed" plus a message) [IN1]. Attio's "Review values" shows raw → mapped per _column_, not per record [AT1]. A 2026 practitioner article argues that the preview must show the outcome for blank cells ("Avoid using visual emptiness as a destructive instruction"). It also argues that approval should be bound to the file fingerprint, the mapping version and the validation results, and that an update should be held when the record changed after review [DV1] (**S**).

### 3.3 Resolving possible matches: one at a time and in bulk

- **Per row inside the plan.** In Virtuous, "Match Needed" is a manual review tab. A banner can offer "Create New Contacts" in bulk when an org setting allows it, and rows that share matching data are still held for review [VI1][VI2] (**S**). In RE NXT, the matcher creates a new record and flags it "Possible duplicate" (yellow triangle), or "New" (blue circle). Users "Compare" and manage from the record before committing the batch [BB2][BB4] (VV/S). In Planning Center People, each row has a checkbox and there is an "Ignore all" button. In Planning Center Giving, rows are skipped per donation or per donor [PC1][PC2].
- **Hard stop instead of a choice.** Planning Center Giving turns an ambiguous (multiple) match into an error. The user must merge in People and re-import [PC1].
- **After commit.** Keela tells users to check the Duplicates Manager after each import [KE1]. HubSpot and DonorPerfect treat duplicate clean-up as a separate tool [HS4][DP1]. Neon has a "Partial Match Queue" [NE2] (S).
- **Bulk acceptance of suggestions.** No vendor documents an "accept all suggested matches" control (**U**). The nearest are LGL's "selectively reject only new or updated records" [LG1] and Virtuous's bulk create [VI2].

### 3.4 Keeping big previews usable

- _Filters by outcome:_ Attio "Failed / Planned / Completed" [AT1], Insycle "Show Only Warning Rows" [IN1], HubSpot "View rows with errors" [HS3], Planning Center's errors tab [PC2], Dromo's error navigator with a column filter [DR1], Flatfile's filter and saved advanced filters [FF5].
- _Search:_ Dromo review-step search [DR2], Flatfile "Search in this Field" [FF2].
- _Rendering:_ ImportCSV virtualises (10,000+ rows) [IC1]. NN/g advises against infinite scrolling when users must "Find something specific", because pagination returns users to a stable page [NN3].
- _Sorting values by frequency:_ Attio's "Sorted by" row count lets users fix the most common bad value first [AT1].

---

## 4. Commit, progress and results

### 4.1 Confirm-step wording

| Button                                       | Names the result?                 | Source          |
| -------------------------------------------- | --------------------------------- | --------------- |
| "Import [number] donations"                  | Yes (verb + count + noun)         | [PC1]           |
| "Import products", "Import customers"        | Partly (verb + noun)              | [SH1][SH2]      |
| "Start migration", "Start import"            | Partly                            | [ST1][AT1][PD1] |
| "Finish import", "Complete Import", "Finish" | No                                | [HS1][MC1][LI1] |
| "Run", "Submit", "Start Import"              | No                                | [BL1][GB1][SF1] |
| "X fields to import" (builds the preview)    | Names the mapping, not the result | [PC2]           |

Design guidance: GOV.UK says the submit button should "clearly show the action it performs" (example "Send your claim form") and the check-answers heading should say what to do [GOV5]. Buttons use sentence case and describe the action [GOV2]. Mailchimp: "Button copy should always include verbs" [MC4]. Warning buttons are "only" for serious destructive actions "that cannot be easily undone", and the warning button belongs on the final confirmation step [GOV2]. GOV.UK also offers `data-prevent-double-click`, plus server-side protection [GOV2].

### 4.2 Background processing and progress

- **Thresholds.** For 1–10 s, use a spinner. For 10 s or more, use a progress bar, "allow the user to perform other tasks (such as navigate to other pages)", and give "feedback indicating when the operation is expected to be complete" [CL1]. NN/g recommends percent-done indicators from 10 s and text such as "Updating address 3 of 50" [NN2]. Older Windows guidance says to notify on completion, instead of showing progress, for background tasks over two minutes [MS1] (S). Emarsys: "Avoid blocking the user from leaving the screen" [EM1] (S).
- **Products.** HubSpot shows a status timeline and an estimated completion time [HS2]. Attio says "You can close the page"; the import continues and admins return through Import history [AT1]. Stripe quotes "approximately 30 minutes" for 100,000 subscriptions [ST1]. Smart Transfer allows pause, resume and cancel, and sends a notification-centre message when the sync finishes [HS6]. Shopify product imports "can't be canceled once they begin" [SH1].
- **Completion notice.** Email: Mailchimp, Givebutter, Salesforce (to the importer), Shopify (confirmation) [MC1][GB1][SF1][SH1]. In-app: HubSpot Smart Transfer [HS6]. Flatfile jobs emit `job:completed` / `job:failed` and an "outcome-acknowledged" event when the user dismisses the outcome popup [FF6].
- **Accessibility of status.** Carbon: do not rely on colour alone; use at least two of colour, shape and symbol, and pair icons with labels [CA1]. Q19 R2 §5.6 covers WCAG 4.1.3 status messages.

### 4.3 Results page and error download

- _Counts:_ HubSpot shows rows imported, created and updated, with a separate Errors tab and error impact per row [HS3][HS4]. Pipedrive shows added, updated, merged and skipped [PD1]. Givebutter shows row count, failed rows and date [GB1].
- _Error files:_ HubSpot's error file is a zip with a CSV that adds Error code, Object type and Reason in front of the original values [HS4]. Stripe adds a `processing_error` column [ST1]. Pipedrive's "skip file" lists reasons [PD1]. Bloomerang offers "Download Skipped Records" [BL1]. Planning Center offers "Export errors & skipped rows" [PC1]. DonorPerfect can "export only erred records for import later" [DP1].
- _Retry:_ Bloomerang and Planning Center re-run the same template or mapping for the corrected file [BL1][PC1]. Stripe offers "Upload revised file" [ST1]. Dromo's re-upload resumes the session [DR3].
- _Confirmation pages:_ GOV.UK says to include "details of what happens next and when", links users will need next, and a way to keep a record [GOV6].

### 4.4 History list: columns and filters

| Product                | Columns / fields                                                                                                               | Filters / actions                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| HubSpot                | Name, New records, Updated records, New associations, Errors, Import System, Import Source, Created by, Create date/time [HS3] | Property and value filter; template, original file, error file, rows with errors [HS3] |
| Stripe                 | Upload date, File name, migration id, Number of subscriptions, Migration status [ST1]                                          | View, Cancel migration [ST1]                                                           |
| Bloomerang             | Five most recent imports; templates listed separately, filterable by type [BL2]                                                | View Full Details, Download Import File, Download Skipped Records [BL2]                |
| Attio                  | Status (Draft / In progress / Canceled / Failed); admins see all imports, others only their own [AT2]                          | Continue draft, cancel, delete draft, share link [AT2]                                 |
| Givebutter             | Row count, failed rows, date, status incl. Deleted [GB1][GB2]                                                                  | Download failed rows; delete imported data [GB1]                                       |
| Planning Center Giving | "Completed" section [PC1]                                                                                                      | Undo (two weeks) [PC1]                                                                 |

### 4.5 Status vocabulary in use

| Status idea           | Terms found                                                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Saved but not started | Draft [AT2][GB2]                                                                                                                      |
| Checking the file     | Validating (Stripe text: "Stripe validates the file") [ST1]; Dry Run [SF3]                                                            |
| Waiting for a person  | Ready for Review [LG2]; Match Needed / Update Needed / Ready for Import [VI1]; Processed (Virtuous, before review) [VI1]              |
| Running               | In progress [AT2]; Migration in progress [ST1]                                                                                        |
| Done, then a buffer   | Scheduled subscriptions → live [ST1]                                                                                                  |
| Stopped               | Canceled [AT2]                                                                                                                        |
| Failed                | Failed [AT2]; `job:failed` [FF6]                                                                                                      |
| Undone                | Deleted [GB2]; "Undo" [PC1][PC2]                                                                                                      |
| Guidance              | Carbon tells teams to define their own status names, with grey for "drafts or jobs that haven't been started" and red for error [CA1] |

"Completed with issues" did not appear in any source (**U**).

---

## 5. Migration and onboarding workspaces

| Product / guide                               | How the multi-week work is shown                                                                                                                                                                                                                                                                                                                                                 | Hand-off to everyday use                                                                                                                                                     | Label |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| HubSpot Smart Transfer                        | A five-part guide: **Audit** (source objects, record counts, field support, pipelines; re-runnable to compare with the previous audit; exportable) → **Configure** (data types, properties, review, Transfer) → **Sync** → **One-time transfers** → **Cleanup** (mark empty properties, remove transfer workflows). Pause, resume and cancel tasks; error log. Super Admins only | Background sync keeps records updated. The article has no go-live step [HS6]. HubSpot Academy calls it "an incredibly powerful tool that can make drastic changes" [HS8] (S) | VV    |
| Stripe Billing migration toolkit              | Sandbox rehearsal → template → upload and validate → review summary → scheduled (24 h) → live → monitor first payments. Multiple concurrent migrations; start with a small batch                                                                                                                                                                                                 | "Monitor subscriptions" after go-live, e.g. decline codes [ST1]                                                                                                              | VV    |
| Stripe card data (PAN) import                 | The old processor transfers the data; Stripe reviews it and "shares a summary for your sign-off"; Stripe imports only after approval [ST2]                                                                                                                                                                                                                                       | N/A                                                                                                                                                                          | S     |
| Shopify migration guide                       | An 11-step checklist; data order "products first, then your customers, and then any historical orders"; test orders before the domain switch [SH3]. The Store Migration app imports products and customers from named platforms and lets merchants review before publishing [SH4] (S)                                                                                            | Domain, redirects, then normal admin [SH3]                                                                                                                                   | VV/S  |
| DonorPerfect                                  | Self-service module "generally most useful when there is an ongoing need"; "data conversion services make the most sense for one-time data import" [DP1]                                                                                                                                                                                                                         | Module for everyday use [DP1]                                                                                                                                                | VV    |
| Zendesk (third-party guides)                  | Phases: audit, configure, test migration, validation, full transfer, training, cutover. "Each phase should have an owner and an exit condition". Triggers and automations inactive during import [ZD1]                                                                                                                                                                           | Post-launch audits in the first weeks [ZD1]                                                                                                                                  | S     |
| GUIDEcx / Rocketlane (implementation portals) | Customer-facing task plans with owners and due dates; Rocketlane's portal shows "which tasks are overdue and what is blocking their progress" [GX1]                                                                                                                                                                                                                              | U                                                                                                                                                                            | S     |
| GOV.UK task list (pattern)                    | Statuses: Completed, Incomplete, plus optional In progress, Not yet started, Cannot start yet, There is a problem. "Start with the fewest statuses". "Cannot start yet" is grey, not a link, with a hint explaining why. Use the list only where users finish across sittings or choose their own order [GOV3][GOV4]                                                             | A "Have you completed this section?" self-declaration [GOV4]                                                                                                                 | VP    |

Not found (**U**): a vendor UI that shows migration owners, due dates and blockers inside the CRM itself. Owners and dates live in implementation portals [GX1] or services [DP1].

---

## 6. Writing and copy

**Error messages.**

- GOV.UK: "explain what went wrong and how to fix it". Use plain English and positive language. Avoid "forbidden", "illegal", "you forgot", "please", "sorry", "valid/invalid", "oops", and generic messages such as "An error occurred". Model message: "Enter a date after 31 August 2017 for when you started the course" [GOV1].
- NN/g: place the message near the cause; never use colour alone; hide technical codes; describe the exact problem; suggest a remedy; keep what the user entered; offer quick fixes [NN1].
- HubSpot's import errors pair a "Meaning" with a "Fix". Example: "Could not find owner" → confirm the user is active and use the name or email exactly as in the account [HS4].

**Plain language.** GOV.UK: "Plain English is mandatory". "Avoid … buzzwords and jargon". Explain a specialist term "the first time you use [it]". "Try to split up sentences that are over 25 words long" [GOV7]. Mailchimp: "Write short sentences and use familiar words", "Avoid jargon and slang", and ask whether it would make sense to "someone who doesn't work here?" [MC3].

**Plain alternatives vendors already use.**

| Jargon                | Plain wording seen in products                                                                                                                     |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| map / mapping         | "Match columns" [MC1][DR1], "Match fields" [PC2], "Examples from CSV" [PC2]                                                                        |
| schema / target model | "properties", "attributes", "fields" [HS1][AT1][PC2]                                                                                               |
| upsert                | "Create and update" [HS1]; add, update or both [SF1]; "Update any existing contacts" [MC1]                                                         |
| dedupe                | "Possible duplicate", "New" [BB2]; "Match Needed" [VI1]; "Matched to existing profiles" / "Donations to new profiles" [PC1]                        |
| validation errors     | "Rows with errors", "skipped records", "failed rows" [HS3][BL1][GB1]; Attio still uses "Invalid format" [AT1], which GOV.UK advises against [GOV1] |
| commit                | "Import [number] donations" [PC1]                                                                                                                  |
| rollback              | "Undo import" [PC2]; "Revert" [PD1]; "Cancel migration" [ST1]                                                                                      |

---

## 7. Nonprofit-specific needs

### 7.1 Gift imports and control totals

- **Expected totals on the batch.** RE NXT gift batches carry an "expected number of gifts" and an "expected batch total". Exceptions are fixed through a "Fix now" banner, and approval is possible only when no exceptions remain [BB1] (VV). Salesforce Nonprofit Cloud's GiftBatch exposes the expected gift count and amount and a match flag that defaults to false [SF5] (S). The same pattern appears in NPSP Gift Entry ("Estimated Gift Count", "Estimated Batch Value") [SF5] (S).
- **Row disposition.** CharityStack recommends "source rows = accepted + rejected + already present" plus an amount check, because "one missing $50 gift and one duplicate $50 gift can cancel each other out" [CS1] (S).
- **Gift identity.** CharityStack says to use "the source system and its transaction ID" as the gift key, and that a rerun "must not change the gift count" [CS1] (S).
- **Batches as the commit unit.** Planning Center Giving imports into a batch group that is committed separately [PC1]. Virtuous gathers integration gifts into overnight batches that an admin reviews and imports [VI3] (S).

### 7.2 Fund and designation mapping

- Planning Center makes fund value-mapping a required step and allows many-to-one [PC1].
- Givebutter: "Fund Code" works only with existing funds or campaigns, and "Campaign Title" creates a shell campaign [GB2].

### 7.3 Payouts, platforms and DAFs

- Planning Center asks for a separate import and payment source for DAF and QCD gifts [PC1].
- Practitioners disagree on credit. Some give the hard credit to the platform (Benevity, PayPal Giving Fund) and soft-credit the donor because the platform issues the receipt. Others treat the platform as "the bank cutting the check" [BB5] (S).
- PayPal Giving Fund's policy says donations to its DAFs "are donations to PayPal Giving Fund" [PP1] (S).
- A Bloomerang column advises hard-crediting the DAF sponsor and soft-crediting the recommending family [BL4] (S).
- CiviCRM users note the contribution import cannot take multiple soft credits [BB5] (S).

### 7.4 Soft credits and households

- Givebutter's order is contacts, then transactions, then soft credits [GB1][GB2].
- Bloomerang's verify page lists updated households [BL1]. Planning Center's preview includes households [PC2].

### 7.5 Receipting caution

- Planning Center: "Donation receipts are not sent for imported donations"; a receipt can be sent from the profile after commit. Imported gifts appear on statements by default [PC1].
- Givebutter: imported transactions do not trigger emails to dedication recipients [GB2].
- Bloomerang's acknowledgement status is tied to sending an email or letter, not to entry [BL5] (S).
- Givebutter cannot import refunds ("must be a positive value") [GB2]. Planning Center asks users to remove refunds, failed transactions and non-deductible payments first [PC1].

### 7.6 Staff skill and capacity

- **UK Charity Digital Skills Report 2025** (672 charities; survey 5 March to 28 April 2025) [SV1]:
  - 30% say their "systems and databases (covering … client databases and CRMs) are poor or non-existent".
  - 40% see staff or volunteer digital skills as a barrier.
  - 41% lack technical expertise "or someone to lead on digital".
  - 63% cite a lack of headspace and capacity.
  - "Small" means turnover up to £1 million.
- **US 2024 Leadership Impact Study** [SV2]:
  - "more than half" say they lack "the staff capacity to fully understand their donor data".
  - About half have fewer than 10 full-time staff.
  - 46% have budgets under $1 million.
- **Church sector.** Pushpay's 2025 State of Church Technology (about 1,700 leaders, February 2025) reports that 93% see tech as important to their mission. Many leaders "don't know" how effective their tools are [SV3] (S).
- **Not found:** a 2024–2026 percentage for US nonprofit staff CRM or data-import skill (**U**). The 2026 Nonprofit Tech for Good report covers web, email, fundraising, social and AI, not CRM skill [SV4] (S).
- **Vendor posture.** Bloomerang offers to have Support review the import file, or help by chat [BL3]. DonorPerfect says its module "cannot … protect against every type of user error" and points one-time conversions to staff services [DP1].

---

## 8. Common failure modes and the safeguards products add

| Failure                                | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                | Safeguards seen                                                                                                                                                              |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wrong encoding                         | Shopify: save as UTF-8 or face "Illegal quoting error" [SH1]; Notion: garbled characters → re-export as UTF-8 [NO1]; HubSpot needs UTF-8 for non-English characters [HS5]                                                                                                                                                                                                                                                               | Encoding picker [SF1]; UTF-8 / UTF-16 auto-detection [OS6]                                                                                                                   |
| Excel damage to IDs, zips and dates    | Excel "automatically removes leading zeros, and converts large numbers to scientific notation", and keeps only 15 significant digits [XL1]. Since about 2023–2024 Excel has "Automatic Data Conversion" settings that can be switched off, plus a CSV warning [XL2] (S)                                                                                                                                                                 | Import as Text via Power Query [XL1]; Dromo left-pads zip codes and highlights auto-fixed cells [DR1]; text-typed downloads (§9)                                             |
| Same file imported twice               | Notion: "Imports add rows … watch for duplicates" [NO1]. Linear skips issues already imported from the same source [LI1]. Xero users report good duplicate detection for identical statements but weaker detection for overlapping date ranges [XR1] (S). A gift rerun "must not change the gift count" [CS1] (S)                                                                                                                       | Source keys; skip already-imported rows [LI1][CS1]                                                                                                                           |
| Duplicates inside the file             | HubSpot "Duplicate row content" [HS4]; Shopify keeps only the last duplicate customer [SH2]; Airtable uses the first matching row and ignores later ones [AI1]; LGL's estimate misses in-file duplicates [LG2]                                                                                                                                                                                                                          | Flag duplicate keys for review rather than "whichever row happened to run last" [DV1] (S)                                                                                    |
| Partial failure                        | HubSpot imports some rows or values and leaves others blank [HS4]. "An interrupted batch is not equivalent to zero writes" [DV1] (S)                                                                                                                                                                                                                                                                                                    | Per-row impact labels [HS4]; a result table filtered by Failed [AT1]                                                                                                         |
| Timeouts and size limits               | Shopify: if an upload times out, split the file [SH1]. Airtable fails on very large destination tables [AI1]. Limits vary widely: Bloomerang 2 MB [BL3], LGL Excel under 1 MB [LG1], Planning Center 30 MB / 152,000 rows [PC1], Attio 100 MB / 100,000 rows [AT1], Stripe 120 MB [ST1], HubSpot 512 MB [HS5]                                                                                                                           | Limits stated up front; background jobs [AT1][HS2]                                                                                                                           |
| Two people importing at once           | HubSpot runs up to 3 imports concurrently and queues the rest [HS5]. Attio drafts can be continued by anyone, and a link can be shared [AT2]. Salesforce parallel loads hit `UNABLE_TO_LOCK_ROW`; the fix is to sort by parent or load serially [SF6] (S)                                                                                                                                                                               | Queues; a visible draft owner; one import per scope (**U** as a documented product rule)                                                                                     |
| Wrong column overwrites good data      | A HubSpot Ideas post asks to "roll back the property changes" after importing wrong values, including a name mapped to the wrong column [HS7] (S). Mailchimp: "Blank fields overwrite and erase existing email contact data" [MC1]. Shopify product overwrite blanks non-required columns [SH1]; customer overwrite replaces "all of an existing customer's data" [SH2]                                                                 | Off-by-default overwrite [SH1][SH2][MC1]; per-column "Don't overwrite" [HS1]; blank cells skipped [AT1][AI1]; deletion on blank is opt-in [PC2]                              |
| Imports trigger automations and emails | Salesforce's Import Wizard checkbox to "Trigger workflow rules and processes", typically left unchecked "to avoid mass customer emails" [SF4] (S); Zendesk guides: deactivate triggers before migrating [ZD1] (S); HubSpot consent checkbox [HS1]                                                                                                                                                                                       | Receipts suppressed on import [PC1]; dedication emails suppressed [GB2]; automations off by default [SF4]                                                                    |
| Undo regret                            | No undo for updates in HubSpot [HS3], and "largely irreversible" in Bloomerang [BL3]. Undo windows: Stripe 10 h [ST1], Pipedrive 48 h [PD1], Planning Center People 48 h [PC2], Planning Center Giving 2 weeks [PC1], Zoho Bigin 30 days and new records only [ZB1] (S), Linear "limited time" [LI1]. Planning Center warns that undo after merges can delete the merged person and their donations, and that manual edits revert [PC2] | Typed confirmation "Undo import" [PC2]; "Delete Data" with "We cannot restore deleted import data" [GB1]; test the first five rows [BL3]; base snapshot [AI1]; sandbox [ST1] |

---

## 9. Synthesis: the best-practice journey for each step _(inference)_

This section joins the evidence above with Asym's fixed constraints. The constraints are taken from the brief and are not re-argued here: rule-based mapping, preview separate from commit, possible matches reviewed in the preview, real duplicates sent to a separate queue, blank cells never change anything, "fill empty only" by default, opt-in "Replace", downloads typed as text, and jobs that outlive the browser.

### 9.1 Entry points

- **People list:** an "Import people" button. **Contributions:** "Upload a Gift file". Both open the same Data Tools flow, already scoped to the right type, so there is one engine and many doors (pattern from HubSpot [HS1] and Givebutter [GB1]).
- **Data Tools home:**
  - Two start actions.
  - The **Switch** card while a migration is active.
  - The import history table.
  - A plain one-line promise above the actions: "Imports add and fill in. They never delete, and empty cells never change anything."

### 9.2 People import: screen by screen

1. **Upload a file.**
   - Drop zone with accepted types and the limits stated _before_ upload (HubSpot and Planning Center publish them; Bloomerang's 2 MB limit surprises users).
   - "Download a template".
   - After the drop, show what was detected: "Found 2,412 rows and 14 columns in sheet 'Donors' (UTF-8)". Attio shows the counts [AT1]; OneSchema auto-detects UTF-8/UTF-16 [OS6].
   - If the workbook has more than one sheet, ask which sheet. Auto-detect the header row and show it so the user can confirm or change it [FF3][OS1][DR1].
2. **Match columns.**
   - Table layout: _Column in your file_, _Examples from your file_ (3 values), _Asym field_ (dropdown), and _How it was matched_ ("Same name", "Saved from your last import", "Choose a field").
   - Plain status text instead of a confidence score. Rule-based matching cannot honestly give a percentage, and no vendor shows one on screen [FF4].
   - Row actions: "Don't import this column", and a bulk "Don't import the 3 unmatched columns" [HS2].
   - Required fields gate the Continue button, with a GOV.UK-style message: "Choose a column for Last name or Organisation name".
   - A format picker sits on date columns, showing a live sample conversion ("03/04/2025 → 3 April 2025"), as in Attio [AT1] and HubSpot [HS1]. Phone columns get a default country.
   - Custom fields: "Create a field…" in the dropdown opens a side panel for permitted users (HubSpot [HS2]; consistent with ADR 0016).
   - Offer "Save these matches for next time" when the import is committed [BL1][PC1].
3. **Match values** (only when option-list columns exist).
   - One table per field: _Value in your file_, _Rows_, _Asym option_.
   - Unknown values: "Leave blank" or "Create option", the latter only for users who may create options [FF1][DR1][PC2].
4. **Fix problems.**
   - A grid showing "Showing 37 rows with problems of 2,412", with "Show all rows" to toggle back [AT1][IN1].
   - Inline edit, plus find and replace per column [FF2][DR2]. Alt+↑ / Alt+↓ moves to the next problem [DR1].
   - "Download rows with problems" as a text-typed spreadsheet, with re-upload resuming the session [DR3].
   - Never auto-fix silently; mark changed cells [DR1].
5. **Review the changes** (the plan; nothing is saved yet).
   - Header counts that add up to the row total: _New people 1,980 · Will be filled in 310 · No change 75 · Need your decision 12 · Won't be imported 35 = 2,412 rows_. This is the row equation from [CS1], with Airtable-style categories [AI1].
   - One tab per count.
   - "Will be filled in" rows open a per-field diff: _Field_, _Now in Asym_, _In your file_, _What will happen_ ("Filled in", "Kept: Replace is off", "No change: cell is empty"). Insycle-style [IN1], showing blank-cell outcomes as [DV1] asks.
   - "Need your decision": side-by-side _In your file_ / _Already in Asym_, with the reason ("Same email and last name"). Actions: "Same person: update", "Different people: add new", "Don't import this row".
   - Bulk actions only within one reason group, e.g. "Add all 7 as new people". This is safer than a global "Accept all", which no vendor documents.
   - Show the "Replace existing values" opt-in here, as a separate control with consequences spelled out, not on step 2.
6. **Confirm.**
   - Button that names the outcome: **"Add 1,980 people and fill in 310"** [PC1][GOV5].
   - If Replace is on, use a warning-style final button [GOV2].
   - Prevent double submit [GOV2].
   - If the file or matches changed since the plan was built, require a fresh plan [DV1].
7. **Importing.**
   - Determinate progress ("Saving row 1,200 of 2,295") [NN2] and a rough time estimate [CL1][HS2].
   - Notice: "You can leave this page. We'll email you and show a notice in Asym when it's done" [AT1][CL1].
   - "Stop import" explains that rows already saved stay saved [DV1].
8. **Import page (results; permanent).**
   - Counts again, reconciled to the file. Status (§9.5).
   - Downloads: "rows not imported" and "rows waiting for a decision", both text-typed.
   - Links: "Review 12 possible duplicates" (to the duplicates queue) and "Prepare reversal (available until 3 December 2026)".
   - What happens next and who started it [GOV6][HS3].

### 9.3 Gift file: the differences

- **On upload:** ask for the _expected number of gifts_ and _expected total_ (optional but encouraged) [BB1][SF5], the source (e.g., "Stripe payout", "Check deposit", "DAF grant report"), and the deposit date.
- **Match values:** Fund / designation is a required value-mapping step, many-to-one allowed [PC1]. Payment method is also mapped [PC1].
- **Donor matching:** use the order shown in the plan. An ambiguous multiple match becomes "Need your decision", not a silent create. Planning Center makes it an error [PC1], and RE NXT creates a new record and flags it [BB2].
- **Gift identity:** a stable source transaction ID per row. A second upload of the same rows shows "Already imported: 214 gifts (no change)" [CS1][LI1].
- **Plan header:** _Gifts 214 · Total $18,440.00 · Expected 214 / $18,440.00: matches_. Show totals by fund. A mismatch is shown loudly. Whether it blocks is a policy choice (§10).
- **Confirm button:** **"Create 3 gift batches (214 gifts, $18,440.00)"**. The page states that "No receipts or thank-you emails are sent by this import. Gifts appear in Gift entry batches for review" [PC1][GB2].
- **Results:** links to each created batch in the gift-entry area. The Gift file page keeps the reconciliation, and the gift-entry area owns batch commit (Planning Center pattern [PC1]).

### 9.4 Switch workspace

- **Format:** a GOV.UK-style task list with optional owners and due dates per task [GOV3][GOV4][GX1]. Statuses: _Not yet started_, _In progress_, _Completed_, _Cannot start yet_ (grey, not a link, with the reason as a hint), _There is a problem_.
- **Groups and order:**
  1. "Check what's in the old system", with record counts per type (Smart Transfer audit [HS6]).
  2. "Set up funds and fields" (Planning Center prerequisites [PC1]).
  3. "Practice run", in a practice environment [ST1].
  4. "Review and sign off", a summary to sign before the real run [ST2].
  5. "Final move", using HubSpot's people-first order [SH3][GB1].
  6. "Check counts and totals", source against Asym (Zendesk checks [ZD1]).
  7. "Go live".
  8. "Tidy up" (Smart Transfer cleanup [HS6]).
- **Hand-off:** at go-live the Switch card becomes read-only and links to its imports in history. Everyday imports then become the only start actions. Data Tools keeps one history, so Switch imports and everyday imports share one table, filtered by type.

### 9.5 Status words _(inference)_

- **Main path:** _Draft_ → _Checking file_ → _Ready to review_ → _Importing_ → _Completed_ / _Completed with problems_ / _Stopped_ / _Failed_.
- **Reversal states, shown separately:** _Reversal being prepared_, _Reversed_, _Partly reversed_.
- **Display:** pair colour with an icon and words [CA1]. Grey for Draft, as Carbon advises [CA1].
- "Completed with problems" is not an observed vendor term (**U**). It is proposed because HubSpot and Pipedrive both report successful and skipped rows in one finished import [HS4][PD1].

### 9.6 History columns _(inference)_

- **Columns:** _Import_ (name + file), _Type_ (People / Gift file / Switch), _Started by_, _Started_, _Status_, _Rows_, _Added_, _Filled in_, _Waiting_, _Not imported_, _Reversal possible until_.
- **Filters:** type, status, person, date. HubSpot lets users filter history by property and value [HS3].

---

## 10. Conflicts between practices

1. **Preview or speed.** HubSpot and Shopify customers commit with no record-level preview [HS1][SH2]. Attio, Airtable, LGL, Planning Center and Stripe all show a plan first [AT1][AI1][LG2][PC1][ST1]. Asym has already chosen the plan.
2. **Fix in the tool or in the spreadsheet.** Embedded importers centre the in-grid fix [OS2][DR1][FF2]. Bloomerang, Planning Center, HubSpot and Stripe send users back to the spreadsheet [BL1][PC1][HS4][ST1]. Dromo bridges both: download with annotations, then resume on re-upload [DR3].
3. **Errors: block or skip.** RE NXT allows approval only with no exceptions [BB1]. Virtuous errors must be addressed to complete [VI1]. HubSpot and Bloomerang import the good rows and report the rest [HS4][BL1]. Dromo makes this a setting with three modes [DR1].
4. **Blank cells.** Some tools let blanks overwrite: Mailchimp's update mode, and Shopify product overwrite [MC1][SH1]. Others skip blanks: Attio, and Airtable's option [AT1][AI1]. Planning Center makes deletion-on-blank an explicit opt-in [PC2]. Asym's rule matches the skip camp.
5. **Undo: what and how long.** Times range from none [HS3][BL3] to 10 hours [ST1], 48 hours [PD1][PC2], 2 weeks [PC1] and 30 days [ZB1]. What gets undone also differs. Most tools delete created records only [HS3][ZB1]. Planning Center reverts manual edits [PC2], which can destroy legitimate later work [DV1].
6. **Where duplicates are resolved.** Some tools resolve them inside the import (Virtuous, RE NXT batch, Planning Center rows) [VI1][BB2][PC1]. Others resolve them after it (Keela, DonorPerfect, Neon) [KE1][DP1][NE2]. Asym splits the two: uncertain matches in the plan, real duplicates in the queue.
7. **Ambiguous match: error or create-and-flag.** Planning Center Giving refuses the row [PC1]. RE NXT creates a new record and flags it as a possible duplicate [BB2].
8. **Control totals: advisory or gating.** Nonprofit Cloud's match flag defaults to false [SF5] (S). RE NXT gates approval on exceptions, but the help does not say that a totals mismatch counts as an exception [BB1].
9. **Matching intelligence.** ML or AI suggestions (Flatfile, CSVBox, ImportCSV) [FF1][CB1][IC1] compete with rule lists and exact-name matching (Dromo with fuzzy matching off, Ingestro aliases, Planning Center) [DR1][NU1][PC1]. Asym has chosen rules.
10. **Leaving the page.** Cloudscape says to let users navigate away from tasks over 10 seconds [CL1], but Shopify product imports cannot be cancelled once started [SH1]. Background-capable flows (Attio, HubSpot) say users may leave [AT1][HS2].
11. **Number of steps.** Shopify has about 3 screens and a fixed template [SH1]. Mailchimp has about 7 steps [MC1]. Embedded importers have 4–6 [NU1][DR1]. GOV.UK guidance favours a check-answers step before a confirmation [GOV5].
12. **Who may undo.** Pipedrive limits revert to global admins [PD1], while Planning Center lets managers who can import also undo [PC2]. Q19 R2 §4 covers permissions.

---

## 11. Unverified or not found

- Neon CRM's Import Manager screens; Keela's mapping and review screens; Virtuous's Match Needed per-row UI (403 or course-only).
- RE NXT web-view import screens after early access; whether a totals mismatch blocks approval.
- On-screen mapping confidence indicators in any product.
- "Accept all suggested matches" as a documented control.
- Mailchimp's undo window. One snippet says import details stay on the history page for 24 hours [MC2] (S).
- Osmos Uploader behaviour (product reportedly folded into Microsoft Fabric) [OM1].
- A 2024–2026 percentage for US nonprofit staff data or import skill.
- Salesforce Bulk job state names (developer page blocked).

---

## 12. Sources

All accessed 2026-11-03. Each entry gives the date shown on the page (or "undated") and the label.

**HubSpot**

- [HS1] https://knowledge.hubspot.com/import-and-export/import-objects (2026-10-07) VV
- [HS2] https://knowledge.hubspot.com/import-and-export/import-records-for-a-single-object (2026-10-07; a search snippet showed 2026-07-22) VV
- [HS3] https://knowledge.hubspot.com/import-and-export/view-and-analyze-previous-imports (2026-06-18) VV
- [HS4] https://knowledge.hubspot.com/import-and-export/troubleshoot-import-errors (2026-09-25) VV
- [HS5] https://knowledge.hubspot.com/import-and-export/set-up-your-import-file (2026-09-11) VV
- [HS6] https://knowledge.hubspot.com/integrations/transfer-data-from-other-apps-using-hubspot-smart-transfer (2026-10-02) VV
- [HS7] https://community.hubspot.com/t5/HubSpot-Ideas/Roll-back-the-property-changes-undo-made-by-Import/m-p/3139 (undated) S
- [HS8] https://academy.hubspot.com/lessons/smart-migration-by-hubspot (undated) S

**Salesforce**

- [SF1] https://trailhead.salesforce.com/content/learn/modules/lex_implementation_data_management/lex_implementation_data_import (undated) VV
- [SF2] https://resources.docs.salesforce.com/204/latest/en-us/sfdc/pdf/salesforce_data_import_wizard_tipsheet.pdf (2016-10-31) VV
- [SF3] https://trailhead.salesforce.com/content/learn/projects/import-your-data-using-npsp-data-importer/perform-an-import-dry-run (undated) VV
- [SF4] https://open-exam-prep.com/study-guides/sf-platform-app-builder/data-management-integrations/import-wizard-data-loader and https://www.docsie.io/tutorials/salesforce/import-data-with-the-data-import-wizard/ (undated) S
- [SF5] https://developer.salesforce.com/docs/atlas.en-us.nonprofit_cloud.meta/nonprofit_cloud/npc_fundraising_api_objects_giftbatch.htm and https://posimente.atlassian.net/wiki/x/FQAvEQ (undated) S
- [SF6] https://www.xappex.com/blog/unable-to-lock-row-salesforce/ (undated) S

**Nonprofit CRMs**

- [BL1] https://help.bloomerang.com/en/articles/17568925-imports-import-data-into-bloomerang-crm (undated, ©2026) VV
- [BL2] https://help.bloomerang.com/en/articles/12632468-imports-work-with-the-imports-list (undated) VV
- [BL3] https://help.bloomerang.com/en/articles/12632775-imports-imports-101 (undated) VV
- [BL4] https://bloomerang.com/blog/ask-an-expert-how-to-credit-recognize-daf-gifts-in-a-crm (undated) S
- [BL5] https://help.bloomerang.com/en/articles/12632718-about-confirmation-emails-online-payment-confirmation-receipts-and-acknowledgements (undated) S
- [VI1] https://support.virtuous.org/hc/en-us/articles/6164198344205-Match-Needed-Update-Needed-Ready-for-Import (403) S
- [VI2] https://support.virtuous.org/hc/en-us/articles/14631095228301-How-Do-I-Bulk-Create-Contacts (403) S
- [VI3] https://www.idonate.com/knowledge/setting-up-virtuous (undated; partner page) S
- [VI4] https://support.virtuous.org/hc/en-us/articles/6156012781965-What-Does-it-Mean-to-Reprocess-an-Import and https://support.virtuous.org/hc/en-us/articles/360051020452-What-Does-it-Mean-to-Archive-an-Import (titles only) S
- [LG1] https://help.littlegreenlight.com/article/51-using-the-flex-importer (2025-07-06) VV
- [LG2] https://help.littlegreenlight.com/article/272-control-duplicates-on-import (2025-11-06) VV
- [NE1] https://test-neonone.skilljar.com/importing-your-account-data-revised (course outline) VV
- [NE2] https://academy.neonone.com/managing-data-in-neon-crm (snippet) S
- [DP1] https://uploads.donorperfect.com/pdf/factsheets/online-import-module.pdf (undated factsheet) VV
- [GB1] https://help.givebutter.com/en/articles/5497872-how-to-import-contacts (2026-09-30) VV
- [GB2] https://help.givebutter.com/en/articles/6934176-how-to-import-transactions (2026-10-01) VV
- [KE1] https://support.keela.co/hc/en-us/articles/43096244062861-How-does-Keela-manage-pre-existing-contacts-with-imported-data (403) S
- [KE2] https://www.keela.co/glossary/donation-import (2025-07-16) VV
- [KE3] https://support.keela.co/hc/en-us/articles/43096248894349-Importing-Your-Data-into-Keela (403) S
- [BB1] https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-gift-batch-record.html (undated) VV
- [BB2] https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-gift-batch-manage-duplicates.html (undated) VV
- [BB3] https://community.blackbaud.com/discussion/comment/310217 (page body empty; snippet) S
- [BB4] https://community.blackbaud.com/discussion/comment/229820 (snippet) S
- [BB5] https://community.blackbaud.com/discussion/comment/207597 , https://community.blackbaud.com/discussion/comment/218219/ and https://forum.civicrm.org/index.php%3Ftopic=31249.0.html (snippets) S
- [PC1] https://help.planningcenter.com/en/154395-import-donation-history.html (2026-11-02) VV
- [PC2] https://help.planningcenter.com/en/138558-import-a-csv-file-in-people.html (2026-11-02) VV
- [PP1] https://paypal.com/us/webapps/mpp/givingfund/policies/donor-account-policy (snippet) S
- [CS1] https://www.charitystack.com/blog/nonprofit-donation-import-control (2026-08-21; vendor blog) S

**Other products**

- [AT1] https://attio.com/help/reference/imports-exports/csv-imports/import-data-into-attio-via-csv (undated) VV
- [AT2] https://attio.com/help/reference/imports-exports/csv-imports/view-and-manage-csv-imports (undated) VV
- [AT3] https://attio.com/changelog/2024/importing-improvements (2024-06-20) VV
- [PD1] https://support.pipedrive.com/en/article/importing-data-into-pipedrive-with-spreadsheets (2026-10-19) VV
- [SH1] https://help.shopify.com/en/manual/products/import-export/import-products (undated) VV
- [SH2] https://help.shopify.com/en/manual/customers/import-export-customers (undated) VV
- [SH3] https://help.shopify.com/manual/migrating-to-shopify/getting-started (undated) VV
- [SH4] https://shopify.com/blog/store-migration-shopify-app and https://apps.shopify.com/store-migration (snippets) S
- [ST1] https://docs.stripe.com/billing/subscriptions/import-subscriptions-toolkit (undated) VV
- [ST2] https://docs.stripe.com/get-started/data-migrations/pan-import (snippet) S
- [AI1] https://support.airtable.com/docs/csv-import-extension (undated) VV
- [NO1] https://www.notion.com/help/import-data-into-notion (undated) VV
- [LI1] https://linear.app/docs/import-issues (undated) VV
- [MC1] https://mailchimp.com/help/import-contacts-mailchimp/ (undated) VV
- [MC2] https://mailchimp.com/help/troubleshooting-contact-imports/ (snippet) S
- [IN1] https://support.insycle.com/hc/en-us/articles/6585749005207-Compare-CSV-Data-to-Existing-Records-In-Your-CRM (undated) VV
- [ZB1] https://help.zoho.com/portal/en/kb/bigin/faqs/trouble-shooting-faqs/articles/import-17-11-2025 (snippet) S
- [ZD1] https://clonepartner.com/blog/zendesk-migration-checklist/ and https://www.eesel.ai/blog/zendesk-migration (third-party, 2026) S
- [GX1] https://rocketlane.com/compare/rocketlane-vs-guidecx and https://www.guidecx.com/products/compare/ (vendor marketing) S
- [XR1] https://productideas.xero.com/forums/967136-banking-chart-of-accounts/suggestions/45978244-bank-reconciliation-automatically-recognise-and-r and https://www.accountingweb.co.uk/any-answers/xero-bank-rec S
- [DV1] https://dev.to/stackendbox/crm-csv-imports-a-preview-is-not-a-rollback-plan-1417 (posted "Nov 3", year not shown) S

**Embedded importers**

- [FF1] https://support.flatfile.com/articles/8569925090-mapping-data ("updated 1 year ago") VV
- [FF2] https://support.flatfile.com/articles/2480474581-bulk-editing ("updated 1 year ago") VV
- [FF3] https://flatfile.com/docs/plugins/xlsx-extractor (undated) VV
- [FF4] https://flatfile.com/docs/plugins/automap (undated) VV
- [FF5] https://flatfile.com/docs/guides/advanced-filters (undated) VV
- [FF6] https://flatfile.com/docs/core-concepts/jobs (undated) VV
- [OS1] https://docs.oneschema.co/docs/2-select-header-row (undated) VV
- [OS2] https://docs.oneschema.co/docs/4-review-finalize (2026-04-13) VV
- [OS3] https://docs.oneschema.co/changelog/picklist-mapping (snippet) S
- [OS4] https://docs.oneschema.co/changelog/bulk-find-replace-for-picklist-values (snippet) S
- [OS5] https://docs.oneschema.co/changelog/skip-header-row-mapping (snippet) S
- [OS6] https://docs.oneschema.co/llms.txt (documentation index, fetched) VV
- [DR1] https://developer.dromo.io/reference/settings/settings (undated) VV
- [DR2] https://developer.dromo.io/changelog (entries dated 2021-11 to 2026-10) VV
- [DR3] https://developer.dromo.io/faqs (undated) VV
- [NU1] https://docs.ingestro.com/sdk/start (formerly docs.getnuvo.com; undated) VV
- [CB1] https://csvbox.io/ (marketing page, undated) VV
- [CB2] https://help.csvbox.io/dashboard-settings/sheet-options (snippet) S
- [IC1] https://docs.importcsv.com (undated) VV
- [OM1] https://redmondmag.com/Articles/2026/01/06/Microsoft-Acquires-Osmos-To-Bring-Autonomous-Data-Engineering-to-Fabric.aspx and https://campustechnology.com/Articles/2026/01/12/Microsoft-Acquires-Osmos-for-Agentic-AI-Data-Engineering.aspx (2026-01) S

**Design and writing guidance**

- [GOV1] https://design-system.service.gov.uk/components/error-message/ (latest change Jan 2024) VP
- [GOV2] https://design-system.service.gov.uk/components/button/ (latest change Jul 2026) VP
- [GOV3] https://design-system.service.gov.uk/components/task-list/ (latest change Aug 2024) VP
- [GOV4] https://design-system.service.gov.uk/patterns/complete-multiple-tasks/ (undated) VP
- [GOV5] https://design-system.service.gov.uk/patterns/check-answers/ (undated) VP
- [GOV6] https://design-system.service.gov.uk/patterns/confirmation-pages/ (undated) VP
- [GOV7] https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/writing-guidelines/clear-language/ (undated, Beta) VP
- [NN1] https://www.nngroup.com/articles/error-message-guidelines/ (2023-05-14) VV
- [NN2] https://www.nngroup.com/articles/progress-indicators/ (2014-10-26) VV
- [NN3] https://www.nngroup.com/articles/infinite-scrolling-tips/ (2022-09-04) VV
- [CL1] https://cloudscape.design/patterns/general/user-feedback/ (undated) VV
- [CA1] https://carbondesignsystem.com/patterns/status-indicator-pattern/ (2026-08-12) VV
- [EM1] https://designsystem.emarsys.net/docs/components/progress/guidelines/ (snippet) S
- [MS1] https://learn.microsoft.com/en-us/windows/win32/uxguide/progress-bars (Windows 7-era; snippet) S
- [MC3] https://styleguide.mailchimp.com/writing-for-accessibility/ (©2023) VV
- [MC4] https://styleguide.mailchimp.com/web-elements/ (©2023) VV
- [XL1] https://support.microsoft.com/en-us/office/keeping-leading-zeros-and-large-numbers-1bf7b935-36e1-4985-842f-5dfa51f85fe7 (undated) VV
- [XL2] https://insider.microsoft365.com/blog/control-data-conversions-in-excel-for-windows-and-mac (snippet) S

**Surveys**

- [SV1] Charity Digital Skills Report 2025 (Amar and Ramsay), mirror at https://www.nottingham.ac.uk/clas/documents/visioning-and-creative-and-cultural-county/resources/charity-digital-skills-report-amar-ramsay-2025.pdf (survey 2025-03-05 to 2025-04-28; n=672; UK) VV
- [SV2] 2024 Leadership Impact Study, https://adelphi.edu/nonprofit/wp-content/uploads/sites/36/2024/10/2024-Leadership-Impact-Study.pdf (2024-10; US) VV
- [SV3] https://religionunplugged.com/news/2025/4/30/new-study-reveals-key-tech-trends-shaping-the-us-church and https://pushpay.com/blog/too-many-leaders-dont-know-the-impact-of-their-tech/ (2025) S
- [SV4] https://www.nptechforgood.com/2026/06/09/announcing-the-2026-nonprofit-tech-for-good-report/ (2026-06-09) S
