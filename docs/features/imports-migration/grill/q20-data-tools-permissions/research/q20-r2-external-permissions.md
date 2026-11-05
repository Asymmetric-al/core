# Q20 R2: External practice for permissions around import tools, import history, problem-row downloads, reversal and migration helpers

All sources were accessed on 2026-11-04. This file covers outside practice only and does not describe Asym code. Recommendations appear only in "Synthesis for Asym" and are labelled _(inference)_.

**What this file builds on, and does not repeat.**

- `q19-data-tools/research/q19-r2-external-data-tools.md` §4 already has the basic import-permission table for HubSpot, Salesforce, Zoho, Attio, Pipedrive, Bloomerang, Virtuous, RE NXT, Zendesk and Stripe. Its main points are that "import" usually means import capability plus create or edit on the object, that Zoho and Attio show all imports to admins and only their own imports to everyone else, that HubSpot restricts the original file, and that revert and migration tools are tighter than import.
- `q19-r5-external-ia-jobs-a11y.md` §2 already covers hide, disable or explain (Carbon, Cloudscape, Primer, Atlassian), deep links (GitHub 404, the UK DfE no-access pages) and watch-but-not-act patterns.
- `q05-switch-operator/research/q05-r2-external-operator-models.md` §3 and `q05-r4-external-verification.md` §1, §2 and §4 already cover vendor support access (Microsoft Lockbox, Google Access Approval, AWS permits, Shopify collaborators, Okta, Atlassian, Salesforce Grant Login Access), consultant seats in nonprofit CRMs and maker-checker norms.

**Labels.**

- **VP:** standard, statute or regulator text that was fetched (GDPR text, NIST via the csf.tools mirror, OWASP).
- **VV:** vendor or sector-body page that was fetched. **VV-d** marks a fetched vendor document dated before 2024; its behaviour may have changed since.
- **S:** secondary. This covers search-tool summaries of pages the fetcher could not open (the summaries quote fragments that could not be checked against the page), third-party blogs and community posts.
- **U:** unverified or not found.
- **I:** inference.

**Blocked or thin.**

- help.salesforce.com renders only a "Loading" shell. Salesforce facts therefore come from fetched Salesforce PDFs (2014–2017), Trailhead and S summaries.
- These returned 403: support.virtuous.org, support.breezechms.com, ico.org.uk, and the developer.salesforce.com Apex and metadata pages.
- Three Planning Center help URLs returned 404 ("add or import people", "export data", "import a CSV" without the numeric prefix). The numbered versions were fetched where available.
- Blackbaud Community threads render only their titles. The RE NXT security-group rights page returned 404.
- No official Neon CRM permission list was found (U).

---

## 1. Named import permissions (Q1)

### 1.1 Comparison table

| Product                        | Permission name(s)                                                                                                                                                                                                                                                                                                                                                                                                  | What it gates                                                                                                                                                                                                         | Money (gifts) vs people                                                                        | Label                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------- |
| **HubSpot**                    | **Import** ("import CRM records in bulk or one at a time"). **Export** ("export CRM records and reports"). **Export without approval**. **Approve exports** ("approve exports by other users"). **Bulk delete**. **Audit log access**. **Super Admin** ("can do virtually anything in the account") [HS-PG]                                                                                                         | Import also needs Edit on the object (q19-r2). Only "The user who completed the import or Super Admin" can download the **original file** [HS-HIST]. No permission is documented for **error-file** download [HS-ERR] | No separate money object                                                                       | VV                    |
| **Salesforce (core)**          | Personal wizard "available to all users", up to 500 records [SF-PERS]. The organisation wizard "is available to administrators and users with the 'Modify All Data' permission", up to 50,000 [SF-ORG]. **Import Leads**, **Import Personal Contacts**, **Import Custom Objects** (q19-r2 [SF7], S). **Export Reports** is separate from **Run Reports**, and **Weekly Data Export** gates org-wide export [SF-EXP] | The personal wizard can only "import into fields that you can access via your page layout and field-level security settings" [SF-PERS]                                                                                | n/a                                                                                            | VV-d (2015, 2017) / S |
| **Salesforce NPSP**            | Trailhead says only "you need to set user permissions for access to Gift Entry". The settings "are different for each organization" [NPSP-GE]                                                                                                                                                                                                                                                                       | Gift Entry and the Data Importer share staging objects (DataImport, DataImportBatch). A community error shows missing allocation and payment field access blocking batch processing [NPSP-S]                          | Gift Entry is a separate set of permissions                                                    | VV / S                |
| **Salesforce Nonprofit Cloud** | To process a gift batch: "View Developer Name system permission AND FundraisingAccess permission set". The GiftBatch object needs the Fundraising Access licence plus the **Fundraising User** system permission [NPC-GB]                                                                                                                                                                                           | Gift batches                                                                                                                                                                                                          | Money gated by Fundraising Access                                                              | S                     |
| **Raiser's Edge NXT**          | Web view: "A user's role in the web view secures their access to web view features", set in Security, Role management. Database view security groups can "limit the type of information, reports, or batches it can view" [BB-SEC]. A named import right was not found                                                                                                                                              | Record security: "Limit access to specific gift or constituent records based on selected criteria", such as fund or constituent code [BB-SEC]                                                                         | Fund-based record security can hide gifts                                                      | VV / U                |
| **Bloomerang CRM**             | No separate import permission. **Data Tools access** gates "the Imports, Bulk Updates, Bulk Delete, or Merge Constituents pages". The default standard user includes "Import data" and bulk delete. Only admins see the Duplicate Constituents page [BL-CRM]                                                                                                                                                        | Transactions: View and edit all / View only / "View and edit only transactions created by this user" / No access [BL-CRM]                                                                                             | Transaction permission is separate from people                                                 | VV                    |
| **Bloomerang Fundraising**     | **Offline Donation Import** (Read and Upload). Disabling it removes "Donations Import" from the Data Tools drop-down. Export is an action under Manage Service Integrations ("User can run an export"). Roles combine additively [BL-FR]                                                                                                                                                                            | Donation import only                                                                                                                                                                                                  | Money import is its own permission                                                             | VV                    |
| **Virtuous**                   | Groups: Admin, "No financial data", User. **Import** permission (Read, Write, Delete) for the Gift & Contact Import tool. Gift entry through it also needs Gifts Read/Write and Contacts Write. "View Statistics" is needed for financial data. The Admin group "can not have the permissions modified" [VI-PERM]                                                                                                   | Import tool                                                                                                                                                                                                           | "No financial data" hides giving                                                               | S                     |
| **Neon CRM**                   | Permissions follow the user's User Group [NE-USR]. API keys "inherit all the same permissions that their associated user has" [NE-API]                                                                                                                                                                                                                                                                              | U                                                                                                                                                                                                                     | U                                                                                              | S / U                 |
| **Little Green Light**         | Roles: Administrator, Gift Entry, Fundraiser, Volunteer. Fundraisers can view every record type "except settings, imports, and LGL forms". Gift Entry has Administrator's permissions except user and account management [LGL-ROLE]                                                                                                                                                                                 | Import is Administrator or Gift Entry only (I, from the role text). An export toggle is not documented (U)                                                                                                            | Gift data is visible to Administrator, Gift Entry and Fundraiser, but not Volunteer [LGL-STEW] | VV                    |
| **DonorPerfect**               | "Set custom user privileges for user groups or individual users". "Restrict user access to sensitive data with security filters" [DP-SEC]. A named import privilege was not found                                                                                                                                                                                                                                   | Utilities area (S)                                                                                                                                                                                                    | Security filters at donor or gift level (S)                                                    | VV / S                |
| **Planning Center People**     | Permission levels: Viewer, Editor, Manager, plus organization administrator. **Import CSV: Managers only.** Only Managers merge. "Only an organization administrator can delete profiles" [PC-PEOPLE]. "A manager or organization administrator can upload a CSV file" [PC-IMP]. **"Can export CSVs and reports"** became a separate Viewer and Editor setting in January 2025 [PC-EXPCL]                           | Import, update by CSV, undo within 48 hours [PC-IMP]                                                                                                                                                                  | People and Giving are separate products with separate roles                                    | VV                    |
| **Planning Center Giving**     | Administrator, Bookkeeper, Counter, Reviewer. "A Giving administrator or bookkeeper can import donations" [PC-GIMP]. "Organization administrators have full administrator access to all products", but Giving is excluded [PC-ACCT]                                                                                                                                                                                 | Each import becomes a **batch group** that an administrator or bookkeeper reviews and commits. Undo is possible within two weeks [PC-GIMP]                                                                            | **Org admins are not Giving admins.** This is the clearest money/people split found            | VV                    |
| **Breeze ChMS**                | Default roles: Admin (Full Access), Standard, Limited (View People Only). Breeze advises keeping roles broad, e.g. "Financial Team". It blocks inviting members into roles that have "Manage Account" or "Contributions" [BR-ROLE]                                                                                                                                                                                  | U                                                                                                                                                                                                                     | A Contributions permission exists                                                              | S                     |
| **Rock RMS**                   | "RSR - Finance Worker" ("view and edit basic finance information like batches and transactions") and "RSR - Finance Administration". "Only those with security permission will be able to reopen or delete a batch", "initiate a refund", or "filter transactions on the Transaction List block by person" [RK-FIN]                                                                                                 | Integrations are usually given "RSR - Rock Administration" [RK-INT]                                                                                                                                                   | Finance roles are separate                                                                     | VV / S                |
| **Shopify**                    | Products: **Create and edit** includes import ("create, edit, import, publish, share, and archive products"). **Export** is separate. Customers: **Export** "is required for users to export customer profiles". Orders: **Export** is separate [SH-STORE]                                                                                                                                                          | Import is bundled with edit. Export is not                                                                                                                                                                            | n/a                                                                                            | VV                    |
| **Zendesk**                    | "You must be an administrator to bulk import users and organizations". Imports are "not enabled by default" until the account owner or an admin contacts Support. "The imported changes can't be reverted" [ZD-IMP]                                                                                                                                                                                                 | Admin Center import history lists date, file, status, object, error count and who ran it [ZD-HIST]                                                                                                                    | n/a                                                                                            | VV                    |
| **Attio**                      | "Members can manage CSV imports with the appropriate access to the object or list". Admins "can access all import drafts and completed imports". Non-admins see the ones "they have initiated". Drafts can be shared by link so a team member can "review or continue setup, complete the import" [AT-MAN]                                                                                                          | —                                                                                                                                                                                                                     | n/a                                                                                            | VV                    |
| **Pipedrive**                  | Global permissions > Data management: **"Import data from spreadsheets"**, **"Export data from list views"**, **"Bulk edit items"**, plus per-type "Merge duplicate …". Visibility: **"See the names of items and users they can't access"** [PD-PS]. Revert is global-admin only (q19-r2)                                                                                                                          | —                                                                                                                                                                                                                     | n/a                                                                                            | VV                    |

### 1.2 Observations

- **Import is a named permission in about half the products.** These are HubSpot Import, Salesforce Import Leads and Import Personal Contacts, Virtuous Import, Pipedrive "Import data from spreadsheets" and Bloomerang Fundraising "Offline Donation Import" [HS-PG][PD-PS][VI-PERM][BL-FR].
- **In the rest, import is bundled.** It comes with a broader area permission (Bloomerang CRM Data Tools), with edit on the object (Shopify "Create and edit"), with a role level (Planning Center Manager, Zendesk admin, Salesforce Modify All Data for the organisation wizard), or with a default role (LGL) [BL-CRM][SH-STORE][PC-PEOPLE][ZD-IMP][SF-ORG][LGL-ROLE].
- **Money imports are usually gated separately from people imports** in nonprofit and church products:
  - Planning Center's Giving roles are separate even from organization administrators [PC-ACCT][PC-GIMP].
  - Bloomerang has Offline Donation Import and separate transaction permissions [BL-FR][BL-CRM].
  - Virtuous requires Gifts Read/Write plus Import [VI-PERM].
  - Rock has Finance roles [RK-FIN].
  - Nonprofit Cloud requires FundraisingAccess [NPC-GB].
- **Export has been split from view at least twice, and both times existing users kept access.**
  - Shopify (Plus, January 2019): "Export permissions are now separate". "Any staff that had permissions for Customer, Product or Order will still be able to export these records" [SH-CL].
  - Planning Center (6 January 2025): "While this will be off by default, we have enabled it for all existing Viewers and Editors". It advised that "this is a good time to review your permission settings" [PC-EXPCL].

---

## 2. Separation of powers (Q2)

### 2.1 Matrix

Legend: **Sep** = a separate documented control. **Bundled** = comes with another permission. **Admin** = admin or owner only. **U** = not documented.

| Product         | (a) Run import                                         | (b) View history                                                                                                                        | (c) Original or error file                                                                             | (d) Undo or revert                                             | (e) Money vs people import                                                              | (f) Migration project                       | Label    |
| --------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------- | -------- |
| HubSpot         | Sep (Import + Edit)                                    | U for others' imports. The export log is "Super admins can view all … individual users can view only their personal exports" [HS-EXLOG] | **Original: importer or Super Admin** [HS-HIST]. Error file: U. Sensitive values "_REDACTED_" [HS-ERR] | Delete created records from the import (q19-r2). Permission U  | —                                                                                       | Smart Transfer: Super Admin (q19-r2)        | VV       |
| Salesforce      | Sep, by object                                         | Bulk jobs: admins / **Manage Data Integrations** (q19-r5)                                                                               | Bulk results on the admin page (q19-r2)                                                                | U                                                              | NPC: FundraisingAccess [NPC-GB]                                                         | —                                           | S / VV-d |
| Zoho CRM        | Sep, by module                                         | **Admin all, others own** (q19-r2)                                                                                                      | Follows history                                                                                        | Undo within 30 days; who: U                                    | —                                                                                       | Admin (q19-r2)                              | VV       |
| Attio           | Bundled with object access                             | **Admin all, others own** [AT-MAN]                                                                                                      | U                                                                                                      | U                                                              | —                                                                                       | —                                           | VV       |
| Pipedrive       | Sep                                                    | U                                                                                                                                       | U                                                                                                      | **Global admin only**, 48 hours (q19-r2)                       | —                                                                                       | —                                           | VV       |
| Bloomerang      | Bundled (Data Tools)                                   | Last five imports (q19-r2). Who: U                                                                                                      | Original downloadable from the list (q19-r2)                                                           | None                                                           | **Sep** (Offline Donation Import; transaction "only transactions created by this user") | —                                           | VV       |
| Planning Center | Managers (People). Giving admin or bookkeeper (Giving) | U                                                                                                                                       | Giving: "Export errors & skipped rows" inside the import flow [PC-GIMP]                                | People: 48 hours [PC-IMP]. Giving: two weeks [PC-GIMP]. Who: U | **Sep** (Giving excludes org admins)                                                    | Org-admin-only payment setup [PC-SETUP]     | VV       |
| Zendesk         | Admin                                                  | Admin Center [ZD-HIST]                                                                                                                  | U                                                                                                      | Irreversible [ZD-IMP]                                          | —                                                                                       | **Disabled until Support enables** [ZD-IMP] | VV       |
| Rock RMS        | Role-based                                             | U                                                                                                                                       | U                                                                                                      | **Reopen or delete batch is separately securable** [RK-FIN]    | **Sep** (Finance roles)                                                                 | —                                           | VV       |
| Virtuous        | Sep (Import RWD)                                       | U                                                                                                                                       | U                                                                                                      | U                                                              | **Sep** (Gifts RW + "No financial data" group)                                          | —                                           | S        |
| Shopify         | Bundled with edit                                      | No history (q19-r2)                                                                                                                     | n/a                                                                                                    | None                                                           | —                                                                                       | Collaborators (q05)                         | VV       |

### 2.2 Documented "can do X but not Y" cases

- **Can run but can't fetch another user's original file:** HubSpot [HS-HIST]. This is the only product found that separates file access from running imports. Even here the person who ran the import keeps the file, and error files have no documented gate.
- **Can see the data but can't export it:** Shopify (2019) and Planning Center People (2025) [SH-CL][PC-EXPCL]. HubSpot also lets admins require **export approval** above a record threshold. "Exports containing Sensitive Data will always require approval regardless of the number of records" [HS-EXAPP].
- **Admins see all, others see only their own:** Zoho and Attio imports (q19-r2), HubSpot exports [HS-EXLOG], and Bloomerang transactions ("only transactions this user creates") [BL-CRM].
- **Can administer the organisation but can't touch money:** Planning Center organization administrators are excluded from Giving [PC-ACCT]. Virtuous "No financial data" hides giving [VI-PERM].
- **Can enter money but not reopen or delete batches:** Rock Finance Worker versus separately secured reopen and delete [RK-FIN]. Planning Center's Giving permission table appears to give "delete In Progress batches" to three levels but deleting committed batches to two. The table text was garbled, so the role mapping is inferred [PC-GPERM].
- **Revert is tighter than import:** Pipedrive (global admin only) and Zoho (q19-r2).
- **Migration tooling is admin-only or off by default:** HubSpot Smart Transfer is Super Admin only, Zoho migration is Administrator only (q19-r2), and Zendesk imports are disabled until the owner or an admin asks Support [ZD-IMP].
- **Not found anywhere (U):**
  - a separate "view import history" permission;
  - a separate "download error/problem-row file" permission;
  - an "undo import" permission distinct from admin;
  - a product that lets viewers follow an import's status without seeing its file name and counts.

---

## 3. Hidden or restricted records during import and dedupe (Q3)

### 3.1 What products do when an imported row matches a record the importer can't see

| Product                                           | Behaviour                                                                                                                                                                                                                                                                                                      | Revealed?                              | Counted?               | Held for someone with access?                                                                                                  | Label                          |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ |
| **Salesforce personal import wizard**             | "If you do not have read and write access to matching records in Salesforce, the import wizard creates new records instead of updating the existing records" [SF-PERS]                                                                                                                                         | No                                     | No (silent new record) | No                                                                                                                             | VV-d (Dec 2015)                |
| **Salesforce organisation import wizard**         | "In a Private or Public Read Only sharing model, duplicate accounts and contacts are created for each owner unless the owner specified in the import file has read/write access to the existing matching record" [SF-ORG]                                                                                      | No                                     | No                     | No                                                                                                                             | VV-d (Mar 2017)                |
| **Salesforce duplicate rules (default)**          | "Do duplicate rules respect sharing settings? By default they do". Users would not be notified of duplicates they can't access [SF-DUPQA]                                                                                                                                                                      | No                                     | No                     | No                                                                                                                             | VV-d (2014 beta Q&A)           |
| **Salesforce duplicate rules ("bypass sharing")** | The admin can "notify the user of existing duplicates without showing them the specific records themselves", or make it so "duplicates are still blocked even if you can't see the duplicates themselves" [SF-DUPQA]                                                                                           | **Existence revealed, content hidden** | Yes (alert or block)   | Partly. A **"report only"** action "flags the records as duplicates without interrupting the save" for later review [SF-DUPQA] | VV-d / S [SF-DUPS]             |
| **Salesforce security position (2014)**           | Some customers asked to at least see the record owner, "however the folks on the security side feel pretty strongly that you should never be able to see a record that your sharing model says you can't see" [SF-DUPQA]                                                                                       | —                                      | —                      | —                                                                                                                              | VV-d                           |
| **Rock RMS Account Protection Profile**           | By default, duplicate checking is off for Medium, High and Extreme profiles, so Rock creates a new record instead of matching. Merging records with a High or Extreme profile needs a specified role, e.g. "RSR Rock administration". Quote: "You can't have good security and no duplicates" [RK-APP][RK-SEC] | No                                     | No                     | Only at merge time, by the elevated role                                                                                       | VV (Core docs v20, 2026-09-28) |
| **Pipedrive**                                     | A global permission, **"See the names of items and users they can't access"** [PD-PS]                                                                                                                                                                                                                          | Names only, if granted                 | —                      | —                                                                                                                              | VV                             |
| **Planning Center People**                        | Answers in restricted custom tabs show "[hidden content]" to non-collaborators in lists, forms and notifications. Managers "will not be able to view the custom field answers if they are not also collaborators" [PC-CF]                                                                                      | Field existence yes, value no          | —                      | —                                                                                                                              | VV                             |
| **Planning Center Giving import**                 | Matching order: Remote ID, then name + email, then name + phone, then name only. **Multiple matches: the row is flagged as an error.** Merge the duplicates in People, then re-import [PC-GIMP]                                                                                                                | —                                      | Error row              | **Yes, in effect.** Someone with People merge rights must resolve it                                                           | VV                             |
| **Little Green Light**                            | "Restrict access to constituents by stewardship" limits only Constituents and Fundraising search results. **Duplicate finder results**, previously run reports, mailings and emails, and Tributes details still expose constituent data [LGL-STEW]                                                             | **Yes (leak path)**                    | —                      | —                                                                                                                              | VV                             |
| **Raiser's Edge**                                 | Record security by constituent code or fund [BB-SEC]. A community thread is titled "Creating a constituent with code-level security active - and not being able to see it once it's made" [BB-CODE]                                                                                                            | No                                     | —                      | U                                                                                                                              | VV / S (title only)            |
| **HubSpot**                                       | Import needs Edit on the object (q19-r2). Community answers say imported contacts "already existed, however assigned to another owner or team which is outside of your view permissions", and that HubSpot would not report this as an error [HS-COMM]                                                         | No (silent)                            | No                     | No                                                                                                                             | S (community)                  |

### 3.2 Guidance on not confirming that a record exists

- **GitHub** returns 404 instead of 403 "to avoid confirming the existence of private repositories" (q19-r5 [GH-404]).
- **OWASP Authorization Cheat Sheet:**
  - "Ensure Lookup IDs are Not Accessible Even When Guessed".
  - "Avoid exposing identifiers to the user when possible".
  - The IDOR discussion notes that a failed lookup can look the same as a failed access check, so an attacker can't tell which one happened [OW-AUTHZ] (VP).
- **OWASP WSTG-IDNT-04 (account enumeration):** the expected result is identical responses to both failed requests, and the application "should respond with the same error message and length to the different incorrect requests" [OW-ENUM] (S).
- **Pipedrive's "names of items they can't access" toggle** is the opposite choice. It discloses names as an explicit, grantable permission [PD-PS].

### 3.3 Summary

- **The dominant answer is to hide the record and create a duplicate.** Salesforce's wizards and Rock's protection profiles both do this. Rock says openly that duplicates are the price of security [SF-PERS][SF-ORG][RK-APP].
- **Some products block or alert without revealing.** The Salesforce duplicate-rule bypass option confirms that a record exists but hides its content [SF-DUPQA].
- **Holding rows for someone with access is rare.** Planning Center Giving does it only for ambiguous multi-matches, and Salesforce "report only" leaves duplicates for later review [PC-GIMP][SF-DUPQA].
- **Leaks happen through side tools.** LGL's duplicate finder and reports bypass record restriction [LGL-STEW]. Community reports say HubSpot imports match hidden records silently [HS-COMM] (S).
- **No product was found that holds a restricted-match row in a queue only cleared staff can see while showing the importer a neutral reason (U).**

---

## 4. Downloads treated as exports (Q4)

### 4.1 Product practice

| Product                | Error or problem-row file                                                                                                                                                                           | Gated by export permission?                                                                                                 | Redaction                                                                                                                                       | Download audit                                                                                                                                                                                                                         | Label                 |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| HubSpot                | "Download rows with errors as file" / "Download errors as file"                                                                                                                                     | **Not documented.** The original file is restricted to the importer or a Super Admin [HS-HIST]                              | "Sensitive Data in import errors will be replaced with the word _REDACTED_ on the post import screen and in the downloaded error file" [HS-ERR] | Exports have **View history**: users "including their IP address and the date they viewed it". This is "not available for exports containing Sensitive Data". Export files can be downloaded only "within the last 30 days" [HS-EXLOG] | VV                    |
| Planning Center Giving | "Export errors & skipped rows" on the import Preview page [PC-GIMP]                                                                                                                                 | Available to whoever can import (admin or bookkeeper)                                                                       | U                                                                                                                                               | U                                                                                                                                                                                                                                      | VV                    |
| Planning Center People | —                                                                                                                                                                                                   | Export is a separate grant. Private custom-field data "can only be exported by people with access to those fields" [PC-EXP] | Field-level                                                                                                                                     | U                                                                                                                                                                                                                                      | VV / S                |
| SuiteCRM               | The global "disable export" setting also blocked **downloading the import template** ("Exports Disabled") [SU-EXP]                                                                                  | **Yes, by accident of implementation**                                                                                      | —                                                                                                                                               | —                                                                                                                                                                                                                                      | S (community)         |
| CiviCRM (2009)         | A shared `sqlImport.errors` file was not overwritten when unwritable, so users would "download the last-written import errors instead of the actual errors from their most recent import" [CV-5509] | —                                                                                                                           | —                                                                                                                                               | —                                                                                                                                                                                                                                      | VV-d (fixed in 3.0.3) |
| Salesforce             | Bulk API response files (q19-r2)                                                                                                                                                                    | Export Reports and Weekly Data Export are separate permissions [SF-EXP]                                                     | —                                                                                                                                               | Event Monitoring has **Report Export**, **Bulk API** and **Content Transfer** log types, read through EventLogFile with "View Event Log Files" + "API Enabled" [SF-EM]                                                                 | S                     |

**Finding:** no product was found that documents error or problem-row files as exports governed by the export permission (U). HubSpot comes closest. It redacts sensitive values in error files, restricts the original file and logs export downloads, but it does not tie error downloads to Export.

### 4.2 Standards and sector guidance

- **GDPR Art. 5(1)(c), data minimisation:** "adequate, relevant and limited to what is necessary in relation to the purposes for which they are processed" [GDPR-5] (VP).
- **GDPR Art. 5(1)(e) and (f):** storage limitation ("no longer than is necessary") and "appropriate security … including protection against unauthorised or unlawful processing" [GDPR-5] (VP).
- **GDPR Art. 5(2):** the controller must "be able to demonstrate compliance" [GDPR-5] (VP).
- **GDPR Art. 32(1):** pseudonymisation and encryption, and "a process for regularly testing, assessing and evaluating" [GDPR-32] (VP).
- **GDPR Art. 32(2):** account for risks of "unauthorised disclosure of, or access to personal data" [GDPR-32] (VP).
- **GDPR Art. 32(4):** anyone "acting under the authority of the controller … who has access to personal data does not process them except on instructions from the controller" [GDPR-32] (VP).
- **ICO, security outcomes:** access rights must be "limited to those users who reasonably need such access to perform their function and removed when no longer needed". Organisations should "monitor user access to personal data, including anomalous user activity" [ICO-SEC] (S, page returned 403).
- **ICO, data protection by design:** use "role-based or named access controls (depending on the scale of your organisation)" and "a process to give or revoke access when staff change roles or leave" [ICO-DPBD] (S, 403).
- **ICO, encryption guidance:** suggests "role-based access control (RBAC) with the principle of least privilege" [ICO-ENC] (S).
- **ICO, data minimisation guidance:** says it is "under review" after the Data (Use and Access) Act [ICO-MIN] (S).
- **NCVO** (last reviewed 19 May 2022): "It is imperative that organisations train their volunteers if they are to handle personal data". It does not set out volunteer access limits [NCVO] (VV).
- **Church practice** (parish policies, S):
  - "only those people who need to see your data will have access to it";
  - ChurchSuite modules granted on a "need to access" basis, "with extra password controls on children's and giving information";
  - "the Parish Secretary who has sole access" [CH-PAR].
  - No Church of England or ECFA rule on database access was found (U).
- **OWASP CSV Injection** [OW-CSV] (VP; the page shows no date):
  - Risky leading characters are `=`, `+`, `-`, `@`, tab (0x09), carriage return (0x0D), line feed (0x0A), and full-width variants.
  - The general mitigation is to "Wrap each cell field in double quotes", "Prepend each cell field with a single quote" and "Escape every double quote using an additional double quote". These are unreliable in Excel once a file is saved and reopened.
  - The "Excel-resistant" alternative is a tab character inside the quoted field, for files meant for human viewing.
  - "There is no universal CSV sanitization strategy that is safe for all spreadsheet applications and all downstream consumers."

---

## 5. Least privilege and defaults (Q5)

### 5.1 Standards

- **NIST SP 800-53 Rev. 5** (VP, via the csf.tools mirror) [NIST-AC6][NIST-AC5]:
  - **AC-6:** "Employ the principle of least privilege, allowing only authorized accesses for users … that are necessary to accomplish assigned organizational tasks."
  - **AC-6(1):** authorise access to security functions and "security-relevant information".
  - **AC-6(5):** restrict privileged accounts to defined personnel or roles.
  - **AC-6(7):** review privileges at a defined frequency "to validate the need for such privileges" and "Reassign or remove privileges, if necessary".
  - **AC-6(9):** "Log the execution of privileged functions."
  - **AC-6(10):** "Prevent non-privileged users from executing privileged functions."
  - **AC-5:** separation of duties "helps to reduce the risk of malevolent activity without collusion".
  - **OT-overlay discussion (AC-5 and AC-6):** "Example compensating controls include providing increased personnel security and auditing". "The organization carefully considers the appropriateness of a single individual performing multiple critical roles."
- **OWASP Authorization Cheat Sheet** (VP) [OW-AUTHZ]:
  - Enforce least privilege.
  - "an application should be configured to deny access by default".
  - Validate permissions on every request.
  - "Prefer Attribute and Relationship Based Access Control over RBAC".
  - Protect static resources (files) "using the same access control logic".
  - "Developers must never rely on client-side access control checks".
  - Exit safely and centralise failure handling.
  - Log access decisions.
  - Test authorisation logic.
- **Microsoft Entra PIM** (VV, 23 April 2026) [MS-PIM]:
  - Assignments are **eligible** or **active**. Activation "might include performing a multifactor authentication (MFA) check, providing a business justification, or requesting approval".
  - "If an approval isn't required, the member can start using the role."
  - Other features: time-bound assignments; "Get notifications when privileged roles are activated"; "access reviews"; "audit history"; and "Prevent removal of the last active Global Administrator".
- **Google Cloud Privileged Access Manager** (VV) [GC-PAM]:
  - Offers "just-in-time temporary privilege elevation".
  - The entitlement sets the requesters, the maximum duration, whether a justification is required and whether approval is needed. Approval is optional.
  - Events are logged to Cloud Audit Logs.
  - It recommends least-privilege permanent roles, with PAM "for specific tasks when needed".
  - A search summary says requesters "can't approve your own request" (S).

### 5.2 Vendor defaults and small-organisation handling

| Pattern                                            | Evidence                                                                                                                                                                                                                                                                   | Label       |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| **Generous defaults**                              | New Bloomerang standard users get "Import data" and bulk delete by default [BL-CRM]. Virtuous defaults new users to Admin (q05-r4, S). Export splits kept existing users enabled [SH-CL][PC-EXPCL]                                                                         | VV / S      |
| **Locked top role so nobody locks themselves out** | The Virtuous Admin group "can not have the permissions modified" [VI-PERM]. Shopify owner and admin roles "can't be modified" [SH-SENS]. PIM prevents removing the last Global Administrator [MS-PIM]                                                                      | S / VV      |
| **Two admins for availability, not approval**      | Planning Center: "Have at least two people in the organization administrator role" and turn on two-step verification [PC-ORGADM]. "If there's only one Giving administrator, add a new one first", because making the sole admin inactive removes Giving access [PC-TRANS] | VV          |
| **Spread sensitive tasks**                         | Shopify: "Spread sensitive administrative tasks across several roles and users so no single account is a point of vulnerability". "Assign sensitive permissions only to your most trusted users" [SH-SENS]                                                                 | VV          |
| **Optional, not forced, second person**            | PIM approval is optional [MS-PIM]. Google PAM approval is optional [GC-PAM]. In nonprofit CRMs single-owner commit is the norm, with compensating controls (q05-r4 §4)                                                                                                     | VV / S      |
| **Recertification**                                | NIST AC-6(7) [NIST-AC6]. PIM access reviews [MS-PIM]. Planning Center's 2025 changelog: "a good time to review your permission settings and clean up any that are no longer needed" [PC-EXPCL]. DonorPerfect reviews user accounts annually (q05-r4, S)                    | VP / VV / S |
| **Anti-pattern: temporary full admin**             | Integration vendors tell customers to "grant your HubSpot account temporary Super Admin access" to fix import permission errors [SM-HS]                                                                                                                                    | S           |
| **Fail-open on owner departure (anti-pattern)**    | Planning Center: when a private tab's creator loses permissions, "the tab defaults to give all viewers and above access" [PC-TRANS]                                                                                                                                        | VV          |

---

## 6. What non-permitted users see (Q6)

q19-r5 §2 covers hide versus disable, deep links and watching without acting. New evidence on **request-access flows**:

| Product                | Trigger                                                                                                                                                          | Who receives the request                                                                                                                        | Requester input                | Outcome visibility                                                                                                                                                                                                             | Label        |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| **Google Drive**       | "You need access" page > **Request access**                                                                                                                      | The file owner, by email (shared drives: Managers)                                                                                              | Optional note                  | Approved or denied email only if the owner chooses to notify. Otherwise "pending, may have been denied silently, or … approved silently". "Their organizational policy may not allow them to share the file with you" [GD-REQ] | VV           |
| **Notion**             | Share > **Request edit access**. A "No access" page also sends a request                                                                                         | "the page creator, who can accept or ignore it" (no access: "creators or editors")                                                              | —                              | Notification on acceptance. Owners approve or reject from their Inbox [NO-SHARE]                                                                                                                                               | VV           |
| **Confluence Cloud**   | Restricted screen > **Request space access**                                                                                                                     | Email to 20% of eligible space admins, rounded up, maximum five, counting only admins added directly to the space                               | —                              | The admin uses "Manage request", then assigns a role [CF-SPACE]                                                                                                                                                                | VV           |
| **Atlassian products** | Product access request                                                                                                                                           | Org and site admins in "User requests". "Require admin approval" or "Don't allow invites" settings. A denied user can't request again [AT-PROD] | —                              | —                                                                                                                                                                                                                              | S            |
| **HubSpot**            | Users & Teams settings without permission                                                                                                                        | "select the Super Admin to send the request to"                                                                                                 | "describe why you need access" | The admin gets a clickable notification that leads to Permissions [HS-REQ]                                                                                                                                                     | VV           |
| **HubSpot exports**    | An export over the threshold or containing sensitive data                                                                                                        | Approvers. The requester picks whom to notify, but any approver can act [HS-EXAPP]                                                              | —                              | —                                                                                                                                                                                                                              | VV           |
| **Salesforce**         | "Insufficient Privileges": "You do not have the level of access necessary … Please contact the owner of the record or your administrator if access is necessary" | — (no in-product request)                                                                                                                       | —                              | —                                                                                                                                                                                                                              | S [SF-INSUF] |
| **Shopify**            | No staff-initiated request button. Only partner collaborator requests, which need the owner's request code [SH-COLL]                                             | Owner or Administrator role                                                                                                                     | Code                           | —                                                                                                                                                                                                                              | VV / S       |

**Observations.**

- **Requests go to a bounded set of approvers.** That set is the owner, a requester-chosen admin, or a capped sample of direct admins. It is never "all admins".
- **The requester usually gives a reason.**
- **Silence is a valid outcome** (Google).
- **None of these products documents how request pages avoid revealing the title of a restricted item (U).** That is the tension with §3.2 (GitHub returns 404). Confluence and Notion request flows start from a known link, so the item's existence is already implied.

---

## 7. Helpers and vendor or consultant access during migrations (Q7)

q05-r2 §3 and q05-r4 §1–2 cover Lockbox, Google, AWS, Shopify collaborators, Okta, Atlassian and Salesforce Grant Login Access. New facts:

| Product                              | Mechanism                                                                                                                                                                                                                       | Time limit                                                                                                                                                                         | What the helper cannot do                                                                                                                                     | Visibility to customer                                                                    | Label        |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------ |
| **HubSpot employee access**          | Super Admin toggle "Allow access to HubSpot employees"                                                                                                                                                                          | "When this toggle is turned on, HubSpot employees will have access to your account for 24 hours". After it is turned off, existing employees "retain access for the next 24 hours" | "limited access to parts of your HubSpot account" (details U)                                                                                                 | U                                                                                         | VV [HS-EMP]  |
| **HubSpot Solutions Partner**        | The partner sends an access link. "Once a client opens and approves your access link, you will be created as a partner employee … with Partner Admin permissions". Partners can also be added directly from the partner account | No expiry. "the relationship will end 60 days after the last qualifying partner activity"                                                                                          | Partner Admins cannot "Add, remove, or downgrade Super Admins"                                                                                                | Partner-domain users get a checkmark. Audit: U                                            | VV [HS-PART] |
| **HubSpot "log in as another user"** | Super Admins only, in accounts with two-factor authentication                                                                                                                                                                   | "the session will only remain active for 30 minutes"                                                                                                                               | Can't impersonate Super Admins or billing users. Can't edit user permissions, profile or recovery while impersonating. Can't bypass two-factor authentication | "the user is notified". "All logins are recorded in the security activity history export" | VV [HS-LIA]  |
| **Blackbaud temporary users**        | An admin sets an **expiration date**, e.g. to "provide temporary access to a seasonal worker or volunteer" or for "a user who is leaving"                                                                                       | At the expiry date the user "is automatically marked inactive and loses access"                                                                                                    | One role per feature area                                                                                                                                     | —                                                                                         | VV [BB-USER] |
| **Blackbaud Support access**         | Becoming a Support User is managed by the customer's Org Admins. "Blackbaud Customer Support … cannot add any new users for your organization"                                                                                  | —                                                                                                                                                                                  | —                                                                                                                                                             | —                                                                                         | S [BB-SUP]   |
| **Salesforce Grant Login Access**    | User-granted. Durations reach "1 year". Vendors report Salesforce Support needs at least one month for escalations                                                                                                              | ≤ 1 year                                                                                                                                                                           | Acts as the user (q05)                                                                                                                                        | —                                                                                         | S [SF-GLA]   |
| **Rock RMS**                         | Impersonation of Extreme-profile people is blocked by default                                                                                                                                                                   | —                                                                                                                                                                                  | —                                                                                                                                                             | —                                                                                         | VV [RK-APP]  |
| **Attio**                            | Shared draft-import links let a teammate "review or continue setup, complete the import"                                                                                                                                        | —                                                                                                                                                                                  | U                                                                                                                                                             | —                                                                                         | VV [AT-MAN]  |
| **Neon CRM**                         | Recommends a separate integration user with "permissions to the minimum required"                                                                                                                                               | —                                                                                                                                                                                  | —                                                                                                                                                             | —                                                                                         | S [NE-API]   |

**Observations.**

- **Two expiring-access patterns were found.** Blackbaud has calendar expiry for named temporary users [BB-USER]. HubSpot has rolling 24-hour employee access and 30-minute impersonation sessions [HS-EMP][HS-LIA].
- **Consultant or partner access in CRMs is usually open-ended.** HubSpot partner access has no expiry; the relationship ends after 60 days of inactivity [HS-PART].
- **The helper is often barred from changing who holds top privilege.** HubSpot Partner Admins can't add, remove or downgrade Super Admins, and Shopify collaborators can't hold Administrator (q05-r4).
- **No nonprofit or church CRM was found with a migration-only helper role (U).** This matches q05-r4 §2.

---

## Synthesis for Asym _(inference)_

These points map the evidence to Asym's terms: Data Tools, Switch, People imports, Gift files that become gift-entry batches, the Imports list, per-import pages, problem-row downloads, the 30-day Prepare reversal, restricted people and Security Clearance, and capability templates.

1. **Split capabilities at the seams the market already separates, and no finer.** Products separate run, money versus people, raw-file access, revert and migration (§2). Nobody separates "view history" or "download error file" (U). A plausible set:
   - **see Data Tools / follow import status:** read-only;
   - **run People imports**;
   - **import Gift files:** this should also require the existing gift-entry or batch capability, because a Gift file becomes a gift-entry batch (Planning Center, Bloomerang, Virtuous, Rock, Nonprofit Cloud);
   - **download import files:** the original and problem rows, treated as an export;
   - **prepare and confirm reversal:** tighter than import (Pipedrive, Zoho);
   - **manage the Switch:** admin-only or off by default (HubSpot, Zoho, Zendesk).

   Each should sit inside templates. The OWASP preference for ABAC and ReBAC [OW-AUTHZ] supports keeping Security Clearance as an attribute layered on capabilities, not as another role.

2. **Imports list visibility should be "own plus everything for Data Tools admins", as in Zoho, Attio and HubSpot exports.** File names and row counts should be treated as data. A file called "Field workers – region X.csv" leaks on its own. Viewers who only follow status could see a neutral label rather than the uploaded file name. No product was found doing this (U), so it would be a design choice, not established practice.
3. **When a row matches a restricted person and the importer is not cleared, neither reveal nor silently duplicate.**
   - Salesforce and Rock accept duplicates [SF-PERS][RK-APP]. That conflicts with Asym's financial-truth invariant for gifts, where a gift duplicated onto a shadow donor misstates giving.
   - The closest precedent that preserves truth is Planning Center Giving: an ambiguous row becomes an error row that someone with merge rights resolves [PC-GIMP].
   - Suggested Asym shape: hold the row in a **"needs an authorised reviewer"** state that shares one neutral reason code with other held rows, such as ambiguous or multiple matches. That way neither the count nor the label singles out restricted matches (OWASP identical responses, GitHub 404).
   - Only people with the relevant clearance can resolve held rows. The cleared reviewer sees the real reason.
   - The cost is that some ordinary held rows go to cleared reviewers too.
4. **Problem-row and original-file downloads should be exports, gated and logged.**
   - Gate them by the download capability, not by the import capability (§4: no vendor documents this, HubSpot comes closest).
   - Never write matched-record values for restricted people into the file. HubSpot "_REDACTED_" is the precedent, and the safer version is to omit them.
   - Apply OWASP CSV neutralisation [OW-CSV]. This matters because problem rows echo user-supplied cells.
   - Log the downloader, time and network origin (HubSpot's download history with IP [HS-EXLOG]).
   - Expire files quickly (HubSpot 30 days for exports, Salesforce 48 hours for the Data Export service).
   - Restrict the original file to the uploader plus Data Tools admins (HubSpot).
   - The CiviCRM bug [CV-5509] argues for per-import, access-checked file storage, never a shared path.
5. **Prepare reversal should be tighter than import, without requiring a second person.**
   - Use a PIM-style step-up: re-authenticate, give a justification and a time-boxed activation, notify the other Data Tools admins and record the event in an audit trail (AC-6(9)).
   - Approval by a second person should be optional per organisation (MS-PIM, Google PAM, q05-r4 §4).
   - Reversing a Gift file also needs the money capability, because it reverses batches.
6. **Small organisations:** one person may hold every capability.
   - Safety comes from compensating controls (NIST AC-5/AC-6 OT discussion, ICO "depending on the scale"): notifications, the audit trail, a reconciliation artefact a treasurer can review, and a recommendation (not a requirement) to have two Data Tools admins for availability (Planning Center).
   - Copy PIM's guard against removing the last holder of the Switch or Data Tools admin capability.
7. **Make the Switch capability time-bound.** It should expire automatically when the Switch closes (Blackbaud expiration date, Salesforce permission-set expiry in q05-r4, PIM time-bound assignments). Helpers such as consultants, vendor operators and volunteers need scoped, expiring grants. They must never be able to grant or remove top privilege (HubSpot partners, Shopify collaborators) and must never see restricted people unless cleared.
8. **Show non-permitted users Data Tools with an explanation and a request path.**
   - Route the request to a bounded set of people who can grant the capability, collect a reason and allow silent decline (§6).
   - For deep links to an import that involves data the viewer can't see, respond as not found rather than forbidden (GitHub).
9. **Asym is new, so it can default-deny.** It does not need to grandfather export-like rights the way Shopify and Planning Center did. No starter template should include file download or reversal. New templates should come with a review prompt (AC-6(7), the Planning Center changelog).
10. **Fail closed when someone leaves.** Planning Center's private tab opening up when its creator loses access [PC-TRANS] is the counterexample. Any Data Tools artefact whose owner loses access, such as a draft import, held rows or a prepared reversal, should fall to Data Tools admins, never widen.

---

## Conflicts between sources

- **Revealing that a hidden duplicate exists.**
  - Salesforce offers "notify … without showing them the specific records" and "bypass sharing" blocking. Its own security team holds that users should "never be able to see a record that your sharing model says you can't see" [SF-DUPQA].
  - Pipedrive makes names of inaccessible items a grantable permission [PD-PS].
  - OWASP and GitHub argue against confirming existence at all.
- **Duplicates as the price of security** (Rock: "You can't have good security and no duplicates" [RK-APP]; Salesforce wizards [SF-PERS][SF-ORG]) versus holding rows for resolution (Planning Center Giving [PC-GIMP]) and Asym's money-truth invariant.
- **Spreading sensitive tasks across users** (Shopify [SH-SENS], NIST AC-5) versus small-organisation reality: single-owner commit is the norm (q05-r4 §4), approval is optional in PIM and PAM [MS-PIM][GC-PAM], and NIST's OT discussion accepts compensating controls.
- **Who can import in Planning Center People.**
  - "Permissions in People" says Import CSV is for Managers only [PC-PEOPLE].
  - The import article says "A manager or organization administrator" [PC-IMP].
  - A search summary of the older "add or import people" page said CSV import was "only available to organization administrators" (S, page 404).
- **Planning Center notifications.** "Removing a person's access will not notify them" conflicts with emailing organization administrators when their access is removed [PC-ACCT]. This is internal to one page.
- **CSV-injection mitigation.** OWASP lists a single-quote prefix plus quoting as the general mitigation, and a tab prefix as "Excel-resistant" for human-viewed files [OW-CSV]. Symfony's advisory (S) says OWASP recommends a single quote and switched to it. Each choice has a cost: the tab stays in the data, and a single quote can be lost after an Excel round-trip.
- **RBAC versus ABAC/ReBAC.** OWASP prefers attribute and relationship models [OW-AUTHZ]. Every product surveyed ships role or template models.
- **Salesforce duplicate-rule context in Apex.** Different API versions of the DuplicateRuleHeader docs disagree on whether rules run in user or system mode by default [SF-DUPS] (S).
- **HubSpot import and team-restricted records.** HubSpot documents Import plus Edit [q19-r2 H1]. Community reports describe imports matching records outside the importer's view without an error [HS-COMM]. This is unresolved (S).
- **Granting temporary Super Admin.** Third-party integration guides recommend it [SM-HS]. HubSpot's own design limits elevation instead: impersonation lasts 30 minutes and excludes Super Admins [HS-LIA], and employee access lasts 24 hours [HS-EMP].
- **Export splits.** They improve least privilege, but both Shopify and Planning Center enabled them for existing users to avoid "loss of functionality" [SH-CL][PC-EXPCL], which kept the old broad access in place.

---

## Sources

All accessed 2026-11-04.

**HubSpot**

- [HS-PG] https://knowledge.hubspot.com/user-management/hubspot-user-permissions-guide (VV)
- [HS-HIST] https://knowledge.hubspot.com/import-and-export/view-and-analyze-previous-imports (VV)
- [HS-ERR] https://knowledge.hubspot.com/import-and-export/troubleshoot-import-errors (VV)
- [HS-SENS] https://knowledge.hubspot.com/account-security/sensitive-data-in-hubspot-tools (VV)
- [HS-EXAPP] https://knowledge.hubspot.com/import-and-export/export-approvals (VV)
- [HS-EXLOG] https://knowledge.hubspot.com/import-and-export/view-a-log-of-your-users-exports-in-your-account (VV)
- [HS-REQ] https://knowledge.hubspot.com/user-management/request-access-to-users-teams-setting (VV)
- [HS-PART] https://knowledge.hubspot.com/partner-tools/manage-partner-employee-access-to-client-accounts (VV)
- [HS-EMP] https://knowledge.hubspot.com/account-security/limit-logins-to-trusted-ip-addresses (VV)
- [HS-LIA] https://knowledge.hubspot.com/user-management/log-in-as-another-hubspot-user (VV)
- [HS-COMM] https://community.hubspot.com/t5/CRM/Imported-list-not-showing-contacts/m-p/532242 and https://community.hubspot.com/t5/Tips-Tricks-Best-Practices/Contacts-from-a-list-don-t-appear/td-p/626980 (S)
- [SM-HS] https://docs.supermetrics.com/docs/hubspot-permissions-troubleshooting-guide (S)

**Salesforce**

- [SF-PERS] https://resources.docs.salesforce.com/198/latest/en-us/sfdc/pdf/salesforce_importpersonal_cheatsheet.pdf (VV-d, last updated 8 Dec 2015)
- [SF-ORG] https://resources.docs.salesforce.com/206/latest/en-us/sfdc/pdf/salesforce_import_cheatsheet.pdf (VV-d, last updated 11 Mar 2017)
- [SF-DUPQA] https://trailhead.salesforce.com/trailblazer-community/download/file/06930000003zJ7p ("Duplicate Management (Beta) Q&A", VV-d, 2014)
- [SF-DUPS] https://admin.salesforce.com/blog/2017/deal-duplicates-two-tactics-use-today ; https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_duplicaterule.htm (403) ; https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_class_Database_DMLOptions_DuplicateRuleHeader.htm (403) (S)
- [NPSP-GE] https://trailhead.salesforce.com/content/learn/projects/set-up-gift-entry-in-nonprofit-success-pack/enable-gift-entry (VV)
- [NPSP-S] https://trailhead.salesforce.com/es/trailblazer-community/feed/0D54S00000Bu7NQSAZ (S)
- [NPC-GB] https://help.salesforce.com/s/articleView?id=sfdo.fundraising_process_gift_batch.htm ; https://developer.salesforce.com/docs/industries/nonprofit-cloud/guide/npc-fundraising-api-objects-giftbatch.html (S)
- [SF-EXP] https://trailhead.salesforce.com/content/learn/modules/lex_implementation_data_management/lex_implementation_data_export (VV: the "Zip files are deleted 48 hours after the email is sent" statement only). Permission names are from S summaries, e.g. https://support.massmailer.io/support/solutions/articles/16000106004-unable-to-export-a-report-in-salesforce
- [SF-EM] https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/using_resources_event_log_files.htm (S)
- [SF-GLA] https://plauti.com/support/general-administration/grant-login-access ; https://www.greytrix.com/blogs/salesforce/?p=1626 (S)
- [SF-INSUF] https://admin.salesforce.com/blog/2014/how-to-deal-with-the-salesforce-insufficient-privileges-error (S)

**Blackbaud**

- [BB-SEC] https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-security-overview.html (VV)
- [BB-USER] https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/sec-adduser.html (VV)
- [BB-SUP] https://kb.blackbaud.com/knowledgebase/articles/Article/46340 (S)
- [BB-CODE] https://community.blackbaud.com/discussion/comment/214857 (S, title only) and https://community.blackbaud.com/discussion/comment/204453/ (S)

**Bloomerang, Virtuous, Neon, LGL, DonorPerfect**

- [BL-CRM] https://help.bloomerang.com/en/articles/12632881-user-permissions (VV)
- [BL-FR] https://help.bloomerang.com/en/articles/13382649-user-roles-and-permissions (VV)
- [VI-PERM] https://support.virtuous.org/hc/en-us/articles/360050985731-How-Do-I-Manage-User-Permissions (S, 403)
- [NE-USR] https://support.neonone.com/hc/en-us/articles/8883319142029-Adding-a-User-to-Neon-CRM (S)
- [NE-API] https://developer.neoncrm.com/api-v2-resources/permissions/ (S)
- [LGL-ROLE] https://help.littlegreenlight.com/article/164-team-member-user-roles-and-permissions (VV); https://www.littlegreenlight.com/blog/manage-access/ (VV, 14 May 2020)
- [LGL-STEW] https://help.littlegreenlight.com/article/190-can-i-set-up-a-team-member-so-she-can-only-see-specific-constituents (VV)
- [DP-SEC] https://www.donorperfect.com/factsheets/user-management-and-data-security/ (VV)

**Planning Center, Breeze, Rock**

- [PC-PEOPLE] https://help.planningcenter.com/en/136861-permissions-in-people.html (VV)
- [PC-IMP] https://help.planningcenter.com/en/138558-import-a-csv-file-in-people.html (VV)
- [PC-EXPCL] https://www.planningcenter.com/changelog/people/32539084546843-new-manage-which-users-can-export-csvs-and-reports (VV, 6 Jan 2025)
- [PC-EXP] https://help.planningcenter.com/en/export-data.html (S, 404 to the fetcher)
- [PC-ACCT] https://help.planningcenter.com/en/136856-permissions-in-account-settings.html (VV)
- [PC-GPERM] https://help.planningcenter.com/en/140716-permissions-in-giving.html (VV, table text garbled)
- [PC-GIMP] https://help.planningcenter.com/en/154395-import-donation-history.html (VV)
- [PC-SETUP] https://help.planningcenter.com/en/176677-set-up-giving.html (VV)
- [PC-CF] https://help.planningcenter.com/en/138571-manage-custom-fields.html (VV)
- [PC-TRANS] https://help.planningcenter.com/en/139173-staff-transition.html (VV)
- [PC-ORGADM] https://help.planningcenter.com/en/136792-introduction-for-organization-administrators.html (VV)
- [BR-ROLE] https://support.breezechms.com/hc/en-us/articles/360036061333-Getting-Started-With-Users-Roles and https://support.breezechms.com/hc/en-us/articles/360001323733-Allowing-Members-to-Have-an-Account-in-Breeze (S, 403)
- [RK-FIN] https://community.rockrms.com/documentation/church-management/finance/advanced-finance/security-for-finance (VV)
- [RK-INT] https://help.acst.com/go-method/how-to/integrations/connect-a-church-management-software/rock-rms/assign-the-rest-key-to-a-security-role (S)
- [RK-APP] https://chiptraining.rockrms.com/ask-chip-training/rocku/825 (VV, Rock U video page)
- [RK-SEC] https://chiptraining.rockrms.com/ask-chip-training/core-docs/article/2753 (VV, Rock v20.0, modified 2026-09-28); https://www.rockrms.com/tech-bulletin/account-entry-block-honors-disable-duplicate-checking (S)

**General SaaS**

- [SH-STORE] https://help.shopify.com/en/manual/your-account/users/roles/permissions/store-permissions (VV)
- [SH-SENS] https://help.shopify.com/en/manual/your-account/staff-accounts/staff-permissions/staff-permissions-sensitive (VV)
- [SH-CL] https://changelog.shopify.com/posts/restrict-your-staff-members-from-downloading-shop-data (VV-d, 2 Jan 2019)
- [SH-API] https://shopify.dev/docs/api/admin-graphql/latest/enums/StaffMemberPermission (VV; `EXPORT_CUSTOMERS`, `EXPORT_GIFT_CARDS`)
- [SH-COLL] https://help.shopify.com/en/manual/your-account/staff-accounts/collaborator-accounts (VV via q05-r4; request-flow details S)
- [ZD-IMP] https://support.zendesk.com/hc/en-us/articles/4408893496218-Bulk-importing-user-data-with-the-data-importer (VV)
- [ZD-HIST] https://support.zendesk.com/hc/en-us/articles/5789034291738-Viewing-your-import-history (VV)
- [AT-MAN] https://attio.com/help/reference/imports-exports/csv-imports/view-and-manage-csv-imports (VV)
- [PD-PS] https://support.pipedrive.com/en/article/permission-sets (VV)
- [SU-EXP] https://community.suitecrm.com/t/cant-download-import-file-template-from-import-wizard/22400 (S)
- [CV-5509] https://issues.civicrm.org/jira/browse/CRM-5509 (VV-d, Dec 2009)

**Request access**

- [GD-REQ] https://support.google.com/drive/answer/6211862 (VV)
- [NO-SHARE] https://www.notion.com/help/sharing-and-permissions (VV)
- [CF-SPACE] https://support.atlassian.com/confluence-cloud/docs/manage-space-access-requests/ (VV)
- [AT-PROD] https://support.atlassian.com/user-management/docs/approve-or-deny-product-access-requests/ and https://support.atlassian.com/user-management/docs/control-how-users-get-access-to-products/ (S)

**Standards, regulators, sector**

- [GDPR-5] https://gdpr-info.eu/art-5-gdpr/ (VP)
- [GDPR-32] https://gdpr-info.eu/art-32-gdpr/ (VP)
- [NIST-AC6] https://csf.tools/reference/nist-sp-800-53/r5/ac/ac-6/ (VP, mirror of SP 800-53 Rev. 5)
- [NIST-AC5] https://csf.tools/reference/nist-sp-800-53/r5/ac/ac-5/ (VP, mirror)
- [OW-AUTHZ] https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html (VP)
- [OW-CSV] https://community.owasp.org/attacks/CSV_Injection (VP; redirected from owasp.org/www-community/attacks/CSV_Injection). For the conflict: https://symfony.com/blog/cve-2021-41270-prevent-csv-injection-via-formulas (S)
- [OW-ENUM] https://owasp.org/www-project-web-security-testing-guide/stable/4-Web_Application_Security_Testing/03-Identity_Management_Testing/04-Testing_for_Account_Enumeration_and_Guessable_User_Account (S; the redirect target did not render)
- [MS-PIM] https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-configure (VV, 23 Apr 2026)
- [GC-PAM] https://docs.cloud.google.com/iam/docs/pam-overview (VV); self-approval: https://docs.cloud.google.com/iam/docs/pam-approve-deny-grants (S)
- [ICO-SEC] https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/security/a-guide-to-data-security/security-outcomes/ (S, 403)
- [ICO-DPBD] https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/guide-to-accountability-and-governance/data-protection-by-design-and-by-default/ (S, 403)
- [ICO-ENC] https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/security/encryption/encryption-and-data-protection/ (S)
- [ICO-MIN] https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/data-minimisation/ (S)
- [NCVO] https://www.ncvo.org.uk/help-and-guidance/involving-volunteers/volunteers-and-the-law/volunteers-and-employment-rights/data-protection-and-volunteers (VV, sector body, reviewed 19 May 2022)
- [CH-PAR] https://trinitychurches.org/wp-content/uploads/2024/03/Privacy-Notice-for-Trinity-Churches.pdf ; https://hughendenparishchurch.org.uk/documents/policies/Data%20Protection%20&%20Privacy.pdf ; https://stbrigidsparishbelfast.org/assets/documents/Privacy-Notice-2025.pdf (S)

**Cross-referenced, not re-fetched:** q19-r2 [H1], [SF7], [ZO1], [PD1], [H3], [ZO2]; q19-r5 [GH-404], [SF-BULK]; q05-r2 §3; q05-r4 §1, §2, §4.
