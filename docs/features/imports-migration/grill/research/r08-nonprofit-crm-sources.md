# R08 — Nonprofit CRM export sources (Phase 30 Imports & Migration)

Research track: non-SiteStacker nonprofit CRM **export** sources, to inform an initial supported-source coverage matrix for Phase 30 (`imports-migration`, primary surface Mission Control Data Tools).

- Repo baseline: worktree `t3-73d54b3d`, `develop` @ `629cb71dc`. Read-only research; no code, schema, ticket or GitHub changes.
- Access date for every external URL below: **2026-10-31**.
- Researching a vendor does **not** commit Asym to supporting it. This file is evidence for a founder grill, not a decision.

## Evidence legend

| Tag                                         | Meaning                                                                                                                                                                                                                                                             |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[V]** verified                            | Stated directly on the cited vendor page on the access date.                                                                                                                                                                                                        |
| **[VC]** version/configuration-dependent    | Vendor page states it, but behavior depends on edition, plan, permission set, package version, installed extension or tenant configuration.                                                                                                                         |
| **[NX]** needs a real representative export | Cannot be settled from documentation; requires an actual export file from a consenting organization (column headers, ID columns, encoding, row grain, omissions).                                                                                                   |
| **[S]** speculation / inference             | Analyst inference; not stated by the vendor.                                                                                                                                                                                                                        |
| _*[V*]_* verified via search snippet only   | The official vendor page appeared in search results with the quoted statement, but the full page could not be fetched (e.g. `developer.salesforce.com` and JS-rendered `help.salesforce.com` pages returned 403/blank to the fetch tool). Treat as weaker than [V]. |

Export surface vocabulary (deliberately **not** interchangeable): **report export** (a saved report/query rendered to CSV/XLSX; row grain and joins chosen by the report), **grid CSV** (selected rows/columns of an on-screen list), **API extract** (programmatic pull with source IDs, paging, rate limits), **bulk object export** (per-object full-table files, e.g. Salesforce Data Export Service / Data Loader), **SQL/database backup** (vendor-native backup restorable only into the vendor), **vendor migration/export package** (a vendor-produced full-database export, often a zip of CSVs, typically on request or at offboarding).

_Sections are appended incrementally as each source is completed._

## 0. Repo baseline that frames this research

All repo citations are against `develop` @ `629cb71dc`.

- Phase 30 scope and open decisions: the chapter lists "the first supported source export profiles" as an **open decision** (`docs/prds/sitestacker-parity/roadmap.md:4409`), requires "Stable source identities and provenance" with "external IDs, source system, batch identity, occurrence and recorded times" (`roadmap.md:4363`), and requires financial reconciliation "by Legal Entity, original currency and source basis" (`roadmap.md:4369`). The SiteStacker kit is the only **named** source (`roadmap.md:4369`; `docs/prds/program-roadmap/owner-constraints.md:431-437`). Status: published roadmap text (owner intent); nothing about non-SiteStacker sources is ratified.
- Retained owner obligations: every imported financial root "pins exact Tenant, Legal Entity, currency, source system, and stable external ID. None is inferred from Site, provider, or a default entity" (`owner-constraints.md:373-377`); dedupe must be the "same rules firing across UI entry, API writes, and bulk import" with "Salesforce's Data-Loader-bypasses-rules inconsistency" as the named anti-pattern (`owner-constraints.md:366-372`); undo-after-merge is blocked (`owner-constraints.md:378-385`); batch-origin event suppression (`owner-constraints.md:386-388`); historic gifts never mint receipts (`owner-constraints.md:439-442`). The wizard bar is "Flatfile/OneSchema/Dromo" (`owner-constraints.md:356-357`).
- Target model terms that source data must map into (glossary, `CONTEXT.md`):
  - **Party** = person / household / org with `org_type` (church, school, foundation, business, DAF sponsor ...); `group` reserved (`CONTEXT.md:2204-2210`).
  - **Designation** = tenant purpose target selected by exactly one designation line; a gift may have several lines that must sum exactly to the payment group (`CONTEXT.md:1709-1716`).
  - **Hard credit** = the single legal donor's receiptable claim (`CONTEXT.md:4440-4443`); **Soft credit (recognition)** is structurally non-receiptable and never enters a money total (`CONTEXT.md:4445-4448`); **Posted legal donor** is frozen from actual evidence, never copied from commitment owner or recognition (`CONTEXT.md:4395-4397`); **Recognition Party** never owns a commitment (`CONTEXT.md:4399-4401`); **Commitment Party** is the one person/household/org whose intent a commitment records (`CONTEXT.md:4331-4333`).
  - **Fixed-total pledge** vs **Recurring giving / recurring commitment** are distinct; each recurring installment is a separate gift (`CONTEXT.md:1727-1790`, `2991`).
  - Vendor precedent already recorded in ADR-0002: "Salesforce Nonprofit Cloud's `GiftSoftCredit` has no designation reference; NPSP soft credits do not interact with GAU allocations" (`docs/adr/0002-single-credit-table-with-optional-line-scope.md:15-17`). Status: accepted ADR (Phase 14).
- Implementation status for Phase 30 itself: this track did not inspect importer source code; it makes **no claim** that any import surface is implemented. (Other research tracks own that census.)

---

## 1. CiviCRM (open source, self- or partner-hosted)

### 1.1 Export surfaces (each distinct)

| Surface                                                   | What it is                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Evidence                                                                                                            |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Search-result **Export Contacts** wizard                  | From any contact search or component search (e.g. Find Contributions), action "Export Contacts". CSV only; separator configurable. Either "primary fields" (~80 core + primary email/phone/address) or "Select fields to export", which is needed for non-primary email/phone/address, custom contact fields and related-contact data. Saved export mappings supported. Mailing-label options merge "one record per household" or per address; exclusions for do-not-mail, no street address, deceased. | [V] https://docs.civicrm.org/user/en/latest/common-workflows/exporting-your-contacts/                               |
| **SearchKit** "Download Spreadsheet" action               | Arbitrary entity searches (e.g. base entity "Contribution Soft Credits" joined to Contribution and Contact); "the default is to download the results as a CSV file". XLSX/ODS output **not confirmed** by docs.                                                                                                                                                                                                                                                                                         | [V] https://docs.civicrm.org/user/en/latest/searching/searchkit/soft-credit-example/ ; [VC] format list unconfirmed |
| **CiviReport** (report templates)                         | Report-level CSV export; row grain fixed by template.                                                                                                                                                                                                                                                                                                                                                                                                                                                   | [S] not separately fetched; treat as a report export                                                                |
| **APIv4** (REST at `civicrm/ajax/api4/{ENTITY}/{ACTION}`) | API key or JWT auth; the user needs the "authenticate with api key" permission; each auth flow can be disabled by the admin.                                                                                                                                                                                                                                                                                                                                                                            | [V] https://docs.civicrm.org/dev/en/latest/api/v4/rest/                                                             |
| **SQL dump**                                              | CiviCRM is open source with a published MySQL/MariaDB schema; the organization or its hosting partner usually holds the database.                                                                                                                                                                                                                                                                                                                                                                       | [S] depends on hosting contract; not a vendor export product                                                        |

Contribution export from Find Contributions is row-per-contribution with contact fields; contacts without contributions are absent from that export ([V] intent of export page; exact row grain [NX]).

### 1.2 Stable source IDs and linkage

- `civicrm_contact.id` (internal) and `external_identifier`: `varchar(64)`, unique index `UI_external_identifier` (since 1.7), described as "Unique trusted external ID (generally from a legacy app/datasource). Particularly useful for deduping operations", usage `import, export, duplicate_matching`. [V] `civicrm/civicrm-core` default branch `schema/Contact/Contact.entityType.php` lines 30-36 and 176-186 (GitHub API read 2026-10-31). [VC] older installs may differ.
- Contribution carries `contact_id`, `financial_type_id`, `currency`, `trxn_id`, `invoice_id`, `contribution_recur_id`, `campaign_id`, `is_test`, `is_template`, `receive_date`, `non_deductible_amount`, `fee_amount`, `net_amount`, `receipt_date`, `thankyou_date`, `source`, `created_date`, `modified_date`. [V] `schema/Contribute/Contribution.entityType.php` field list.
- Soft credits are a separate `ContributionSoft` entity (`contribution_id`, `contact_id`, `amount`, `currency`, `soft_credit_type_id`, PCP fields); the soft-credit amount "can be different from the contribution amount". [V] `schema/Contribute/ContributionSoft.entityType.php`; soft-credit example page.
- Pledges: the pledge is the "umbrella" that links individual contributions; `PledgePayment` holds `pledge_id`, `contribution_id`, `scheduled_amount`, `actual_amount`, `currency`, `scheduled_date`, `status_id`. Pledge-to-payment linkage **is structurally rebuildable** if both IDs are extracted. [V] `schema/Pledge/PledgePayment.entityType.php`; https://docs.civicrm.org/user/en/latest/pledges/what-is-civipledge/ (search snippet).
- Recurring: `ContributionRecur` holds `amount`, `currency`, `frequency_unit`, `frequency_interval`, `installments`, `start_date`, `end_date`, `cancel_date`, `processor_id`, `trxn_id`, `payment_token_id`, `next_sched_contribution_date`, `failure_count`, `financial_type_id`, `campaign_id`; installments link back via `Contribution.contribution_recur_id`. [V] `schema/Contribute/ContributionRecur.entityType.php`. Processor IDs and tokens are processor-bound and are **not portable payment authority** [S, consistent with Asym boundaries].
- Relationships are first-class contact-to-contact rows with a relationship type. Households are a contact type; Contact also has `household_name`, `primary_contact_id`, `employer_id`, `is_deceased`, `is_deleted`. [V] Contact schema field list; contacts page. Relationship type names (e.g. household member) are configurable [VC].

### 1.3 Entity model vs Asym Party kinds

- Three mutually exclusive core types: Individual, Household, Organization; user-defined **sub-types** (several per contact allowed). A church is typically an Organization sub-type. [V] https://docs.civicrm.org/user/en/latest/organising-your-data/contacts/ . Maps cleanly to Party `person/household/org`, with sub-type as an `org_type` candidate [S; per-tenant mapping review].
- Shared addresses are "synchronized in both directions" and editable only on the master contact, so one address can appear on many exported contacts. [V] same page.
- Deleted contacts go to **trash** (`is_deleted`) and can be restored; "Delete Permanently" also exists. Merged duplicates "will be deleted and are not recoverable, unless you have database logging enabled". [V] contacts page; https://docs.civicrm.org/user/en/latest/common-workflows/deduping-and-merging/ . Whether exports include trashed contacts [NX].
- Deceased individuals and "closed" organizations/households are flags, not deletions. [V] contacts page.
- Legal donor vs recognition: `Contribution.contact_id` is the hard-credit contact; soft credits carry their own amount and type. Household giving may be recorded on the Household contact or on individuals with soft credits; **tenant practice varies** [NX].
- Designations vs campaigns: `financial_type_id` (and per-line financial types on line items) vs `campaign_id`. Line items as Asym designation lines is plausible but [NX].
- Multi-currency: `currency` on Contribution, ContributionSoft, PledgePayment and ContributionRecur. [V] schema.

### 1.4 Custom fields, attachments

- Custom data exists per entity and is exportable through field selection; multi-choice custom fields import as labels or values, and on update "new values will replace the entire field". [V] import page.
- Attachments/files: not covered by the fetched pages [unverified].

### 1.5 CiviCRM's own import behavior: learn vs do not copy

- **Learn:** saved field mappings (new columns appended to the right keep a mapping usable); a preview step with a **Download Errors** file before commit; map legacy IDs into `external_identifier` on the first contact import so later contribution/membership/activity/relationship imports can link; contributions update by Transaction ID, Invoice ID or Payment ID. [V] https://docs.civicrm.org/user/en/latest/common-workflows/importing-data-into-civicrm/
- **Learn:** dedupe **rule** (weighted fields + threshold; Unsupervised/Supervised/General; per contact type) is separate from duplicate **action** (Skip / Update / Fill / No Duplicate Checking). This mirrors the rule/action separation Phase 30 requires. [V] import and dedupe pages.
- **Do NOT copy:** "No Duplicate Checking"; one import-wide group/tag as the only provenance; no built-in undo ("find and delete" via the batch group); relationships only via repeated contact imports; batch merges whose re-linking cannot be reversed; "Update" overwrites with no before-image. [V] same pages. A historic defect let one duplicate external ID in a file crash the whole import (CRM-20494, fixed 4.7.20) — evidence for per-row isolation. [V] https://issues.civicrm.org/jira/browse/CRM-20494 (search result summary).
- **Do NOT copy:** online forms automatically merging into an existing contact via the Unsupervised rule; Asym permits auto-merge only where the identity owner already allows it. [V] dedupe page.

### 1.6 Qualification evidence needed (CiviCRM)

1. A real Export-Contacts CSV (Select fields) with `Contact ID`, `External Identifier`, contact type, sub-type and related-contact columns, plus how trashed contacts behave. [NX]
2. A SearchKit/API extract of Contribution + LineItem + ContributionSoft + PledgePayment + ContributionRecur with IDs, from a named 5.x/6.x version. [NX]
3. Whether the tenant records gifts on Households or on individuals with household soft credits. [NX]
4. Custom-field column naming and multi-value encoding in exports. [NX]
5. Whether the hosting partner will supply a SQL dump, and on what terms. [NX]

---

## 2. Salesforce — NPSP and Nonprofit Cloud are two different sources

Fetch note: the requested starting pages `developer.salesforce.com/docs/platform/data-models/guide/nonprofit-success-pack.html` and `.../fundraising.html` returned **HTTP 403** to the fetch tool on 2026-10-31, as did every `developer.salesforce.com` atlas page tried. NPSP facts below are therefore taken from Trailhead (fetched), the open-source NPSP package repository (read via GitHub API) and search snippets of official pages. Nonprofit Cloud object facts are mostly *_[V_]**.

Naming: Trailhead states "Nonprofit Cloud is now called Agentforce Nonprofit" and old names persist in app and docs. [V] https://trailhead.salesforce.com/content/learn/modules/nonprofit-cloud-fundraising-operations/understand-fundraising-records

### 2.1 Salesforce platform export surfaces (shared by NPSP and NPC orgs)

| Surface                                                                     | Contents / limits                                                                                                                                                                                                                                                                                                                                                                                                                                        | Evidence                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Data Export Service** (Setup > Data Export, Export Now / Schedule Export) | Per-object CSV files bundled in ZIP archives. Weekly export available in Enterprise, Performance and Unlimited; monthly in all editions except Database.com. Option to include images/documents/attachments and Files exists, but exact checkbox labels, the 48-hour download window and 512 MB ZIP cap are **third-party claims** here. Permission is admin-level ("Weekly Data Export"). Winter '26 added download rate limiting (third-party report). | [V*] https://help.salesforce.com/s/articleView?id=admin_exportdata.htm&language=en_US (search snippet: "weekly or monthly intervals"; edition limits); [S/third-party] https://gearset.com/blog/salesforce-data-export-service/ ; https://www.flosum.com/blog/how-to-export-data-from-salesforce-a-complete-guide ; https://www.odaseva.com/blog/salesforce-winter-26-weekly-export-rate-limiting |
| **Data Loader** (bulk object export via SOQL)                               | Export vs **Export All**: "If you want to also export archived activity records and soft-deleted records, click Export All instead." CLI `extract` excludes soft-deleted; `extract_all` includes them. Output CSV with 18-char IDs and lookup ID columns.                                                                                                                                                                                                | [V*] https://developer.salesforce.com/docs/atlas.en-us.dataLoader.meta/dataLoader/exporting_data.htm (search snippet); ID format [S]                                                                                                                                                                                                                                                              |
| **Report export** ("Formatted Report" vs "Details Only")                    | Third-party sources agree XLSX is capped at 100,000 rows and silently truncates; matrix formatted export lower; long text may truncate. Official limits not fetched.                                                                                                                                                                                                                                                                                     | [S/third-party] https://www.xappex.com/blog/salesforce-report-2000-row-limit/ ; https://revenuegrid.com/blog/export-salesforce-report-to-excel/                                                                                                                                                                                                                                                   |
| **API extract** (REST/Bulk API)                                             | Full object/field access subject to the user's field-level security and object permissions.                                                                                                                                                                                                                                                                                                                                                              | [S] general platform knowledge; not re-verified this session                                                                                                                                                                                                                                                                                                                                      |

Implication: for Salesforce, a **report export is not a migration source** (row caps, joins chosen by the report, no IDs unless added). A Data Loader/Bulk API per-object extract with IDs, or the Data Export Service ZIP, is the realistic migration input. [S]

### 2.2 NPSP (managed package on Sales Cloud; "household account" model)

- Account model: "NPSP adds the ability to create two types of accounts: Households and Organizations"; "All contacts must be connected to an account record." [V] https://trailhead.salesforce.com/content/learn/modules/nonprofit-success-pack-administration-basics/understand-the-npsp-data-model . (Older one-to-one / individual "bucket" account models still exist in long-lived orgs [S/VC]; legacy `npo02__Household__c` object is still in the package [V] repo object list.)
- Donations are **Opportunities**; "a pledge is recorded as an opportunity, and each gift toward it is recorded as a payment" (`npe01__OppPayment__c`); Recurring Donations track gifts "made on a regular, repeating basis" (`npe03__Recurring_Donation__c`, plus `RecurringDonationSchedule__c` and `RecurringDonationChangeLog__c` in Enhanced Recurring Donations); GAU Allocations designate "parts of opportunities to particular GAUs". [V] Trailhead data-model page; [V] object list at `SalesforceFoundation/NPSP` `force-app/main/default/objects` (GitHub API, default branch `main`, pushed 2026-10-30).
- `Allocation__c` fields: `Amount__c`, `Percent__c`, `General_Accounting_Unit__c`, `Opportunity__c`, `Payment__c`, `Campaign__c`, `Recurring_Donation__c` — so an allocation can hang off an Opportunity, a Payment, a Campaign (default) or a Recurring Donation, and may be **percent-based**. [V] repo field list. Mapping to Asym's exact-sum designation lines requires resolving percent allocations and the default-GAU remainder [S]; a vendor integration warns default-GAU percent allocations cause failed API requests [third-party] https://prosupport.gofundme.com/hc/en-us/articles/37288767645851-NPSP-and-the-Salesforce-integration (search snippet).
- Soft credits: "NPSP calculates soft credits based on opportunity contact roles"; whether a role earns soft credit is admin-configured; record types/types can be excluded; rollups computed "in its nightly batch". Example labels Donor as "(hard credit)" and Household Member / Solicitor as "(soft credit)". [V] https://trailhead.salesforce.com/content/learn/modules/donation-soft-credit-management-with-nonprofit-success-pack/manage-contact-roles-and-soft-credits . Partial amounts live in `Partial_Soft_Credit__c` (`Contact__c`, `Opportunity__c`, `Amount__c`, `Role_Name__c`, `Contact_Role_ID__c`) and organization credit in `Account_Soft_Credit__c` (`Account__c`, `Opportunity__c`, `Amount__c`, `Role__c`). [V] repo field lists. ADR-0002 already records "NPSP soft credits do not interact with GAU allocations" (`docs/adr/0002-...md:16-17`).
- Relationships `npe4__Relationship__c` (contact-contact) and Affiliations `npe5__Affiliation__c` (contact-organization account); Address `Address__c` on household accounts. [V] Trailhead + repo.
- **Legal donor trap:** the Opportunity's `AccountId` is the Household Account for individual gifts, with the primary contact identified via contact role. The hard-credit **person** must be derived from the Donor contact role, not the account. [S, strongly implied by the model; needs a real export] [NX].
- Pledge vs payment vs recurring: an open/pledged Opportunity with multiple Payments is a fixed-total pledge-like structure; a Recurring Donation spawns installment Opportunities. Both shapes map to different Asym owners (Phase 16 fixed-total pledge vs recurring commitment; Phase 13 contributions). [S] mapping; [V] source shapes.
- Multi-currency: Salesforce orgs may enable multi-currency, adding `CurrencyIsoCode` per record. [VC] (not re-verified this session).

### 2.3 Nonprofit Cloud / Agentforce Nonprofit (standard objects; person-account model)

- Individuals are **person accounts**; "business accounts represent households" when tied to a **Party Relationship Group** of Household type; members join via **Account-Contact Relationship** records; "person accounts can be part of several party relationship groups at the same time"; Party Role Relationships ending in AAR link two business accounts and CCR link two contacts/person accounts. Trailhead: "Households work differently in Nonprofit Success Pack (NPSP)". [V] https://trailhead.salesforce.com/content/learn/modules/stakeholder-management-in-nonprofit-cloud/manage-households-nonprofit-cloud ; [V*] related Trailhead unit snippet for AAR/CCR.
- Fundraising objects: Gift Commitment ("the promise of a donation", can be recurring or pledged) with Gift Commitment Schedule (master-detail to the commitment); Gift Transaction ("payments made for one-time gifts and installments to fulfill a gift commitment"); Gift Designation ("funds designated for a specific purpose"); Gift Transaction Designation (junction with `Amount` and `Percent`, master-detail to Gift Transaction, required `GiftDesignationId`); Gift Soft Credit ("soft credit attributed to a person or organization for the gift transaction", `RecipientId` → person account, `Role` picklist whose values **differ by release**, `PartialPercent` / `PartialAmount`, percentages need not total 100%). All from API 59.0; require the Fundraising Access license and Fundraising User permission. [V] Trailhead fundraising-records page for commitment/transaction/designation definitions; [V*] developer guide object pages (246.0-264.0) for field-level facts.
- Gift Entry exposes `CurrencyIsoCode` (search snippet lists only USD as valid value in that doc version) [V*] — multi-currency support for NPC fundraising is **unverified**.
- Key mapping difference vs NPSP: NPC commitments are first-class (pledge and recurring are both Gift Commitments distinguished by type/schedule), whereas NPSP uses Opportunity+Payments for pledges and Recurring Donation for recurring. Asym must not collapse them into one commitment type without the Phase 16 owner deciding. [S]
- ADR-0002 records NPC `GiftSoftCredit` "has no designation reference" (`docs/adr/0002-...md:15-16`), consistent with the object description. [V repo; V* vendor]

### 2.4 Source import behavior worth learning from / not copying

- **NPSP Data Import "Dry Run"** "identifies potential matches, but doesn't actually process the records into your org"; statuses "Dry Run - Validated" / "Dry Run - Error"; per-entity Import Status values such as "Dry Run - Matched", "Matched None", "Best Matched Used", "Matched by Id". **Limitation:** it "only looks at Donations that are open Opportunities and unpaid Payments" and is meant for orgs that "already have records". The article does not say whether validation rules, triggers or required fields are exercised. [V] https://help.salesforce.com/s/articleView?id=sfdo.npsp_verify_with_dry_run.htm&language=en_US&type=5 . **Lesson for Phase 30:** a dry run that only covers matching (and only open donations) is not a no-write plan; Asym's plan must exercise target-owner validation for every row and target type. [S]
- NPSP Data Import has an Advanced Mapping mode for GAU allocations and opportunity contact roles; Enhanced-Recurring-Donation import template exists. [third-party/community snippets; unverified].
- **Named anti-pattern** already in Asym owner text: "Salesforce's Data-Loader-bypasses-rules inconsistency" (`owner-constraints.md:369-371`). Do not copy a bulk path that skips duplicate rules the UI applies. [V repo]
- Do not copy nightly-batch rollups as the source of truth for donor totals; recompute from imported transactions and reconcile. [S]

### 2.5 Attachments, archived/deleted, custom fields

- Attachments/Files: Data Export Service can include attachments/files (exact options unverified) [V*/third-party]; Data Loader can extract `ContentVersion`/`Attachment` objects [S].
- Deleted/archived: only "Export All"/`extract_all` include soft-deleted and archived activities [V*]. Hard-deleted/purged records are not recoverable via export [S].
- Custom fields/objects are ordinary columns/objects in per-object extracts; field API names (`__c`, namespaces `npsp__`, `npe01__`, `npe03__`, `npe4__`, `npe5__`, `npo02__`) are stable across orgs for the package objects [V repo; namespaces as installed VC].

### 2.6 Qualification evidence needed (Salesforce)

1. A real NPSP Data Loader/Data Export ZIP: Account (with RecordType), Contact, Opportunity, OpportunityContactRole, `npe01__OppPayment__c`, `npe03__Recurring_Donation__c`, `npsp__Allocation__c`, `npsp__General_Accounting_Unit__c`, `npsp__Partial_Soft_Credit__c`, `npsp__Account_Soft_Credit__c`, `npe4__Relationship__c`, `npe5__Affiliation__c`, Campaign, with 18-char IDs. [NX]
2. Whether the org is on Household Account, One-to-One or Individual (bucket) model, or a historical mix. [NX]
3. Whether Enhanced Recurring Donations is enabled. [NX/VC]
4. Multi-currency enabled? `CurrencyIsoCode` and dated exchange rates present? [NX/VC]
5. A real NPC extract: person Account, business Account + Party Relationship Group, AccountContactRelation, GiftCommitment, GiftCommitmentSchedule, GiftTransaction, GiftTransactionDesignation, GiftDesignation, GiftSoftCredit, GiftRefund (existence of GiftRefund not verified this session). [NX]
6. Confirmation of current Data Export Service options/limits from an admin's Setup screen. [NX]

---

## 3. Blackbaud Raiser's Edge NXT (and brief: eTapestry, Luminate Online)

Fetch note: the requested starting article `https://blackbaud.my.salesforce-sites.com/bbknowledge/articles/Knowledge/75298` is **not an export article**. It is "How to identify existing constituents when importing" (Article 75298, product Raiser's Edge). The SKY API reference pages at `developer.blackbaud.com/skyapi/apis/*` render client-side and returned no content to the fetch tool; SKY API facts below come from the **Blackbaud-published** Microsoft Power Platform connector reference (publisher "Blackbaud, Inc.", built "on top of Blackbaud's SKY API"), which is a proxy for, not identical to, the raw API.

### 3.1 Export surfaces (each distinct)

| Surface                                                         | Contents / limits                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Evidence                                                                                                                                                                                                                                             |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Web view list export**                                        | Lists of "500,000 records or less" download as CSV; "Only the columns you select" are included; multi-valued columns grouped with semicolons; gift lists auto-add "Is anonymous"; a "View record" link column; download link expires after four hours; admins control who can export in Settings > Control panel. Whether a system record ID column is included is **not stated**.                                                                                                                                                                                                                                                                                                                                                                         | [V] https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-export-lists.html                                                                                                                                                      |
| **Database view Query + Export module** (legacy Windows client) | The long-standing flat export with head-of-household processing; being re-implemented as web-view **Single Row Query** ("modern redesign of database view's Export module"), which flattens one-to-many data onto one row per record, supports summary fields and head-of-household rules. Rollout status and output formats not confirmed. Community users report soft-credit handling makes exported totals wrong unless queries are adjusted.                                                                                                                                                                                                                                                                                                           | [V*] https://community.blackbaud.com/discussion/84415/introducing-single-row-query-in-blackbaud-raiser-s-edge-nxt-a-smarter-way-to-export-your-data (title fetched; body via search snippet); [third-party] community threads on spouse soft credits |
| **Self-serve database backup**                                  | Request backup from the portal; backups are TDE-encrypted, retrieved with Azure Storage Explorer via a SAS URI plus a "certificate bundle"; "Backups expire after seven days"; users can only download backups they requested. Community reports: SQL Server `.bak`, one free per month, intended for **database view information only**, not a full-restore product.                                                                                                                                                                                                                                                                                                                                                                                      | [V] https://webfiles-sc1.blackbaud.com/files/support/helpfiles/backups/content/download-backups-renxt.html ; [third-party] https://community.blackbaud.com/discussion/51759/accessing-a-database-backup-in-a-hosted-environment                      |
| **SKY API** (OAuth; acts under the user's permissions)          | Gift list filters by type (e.g. "MatchingGiftPledge,RecurringGift"), constituent/campaign/fund/appeal system record IDs, `post_status` (Posted/NotPosted/DoNotPost), receipt and acknowledgement status, `date_added` / `last_modified` ("Modified on or after"), limit default 500 max 5000 with offset. Gift reads include `gift_splits` (fund required; campaign, appeal, package, amount), `soft_credits`, `fundraisers`, `receipts`, `acknowledgements`, `payments`, `linked_gifts`, recurring schedule (WEEKLY ... ANNUALLY), `lookup_id` ("The user-defined identifier for the gift"), attachments (physical files vs links; physical thumbnails have 60-minute signed URLs). Pledge installments and pledge payments are separate list operations. | [V] https://learn.microsoft.com/en-us/connectors/blackbaudgifts/ (Blackbaud-published connector reference; page updated 2025-11-14). Raw-API parity [VC].                                                                                            |

### 3.2 Stable source IDs

- Article 75298: when updating existing records via import "every record must have a unique identifier": **Constituent ID** (optional, so not every constituent has one), **Import ID** (generated for every constituent; long, and "may lose leading zeroes in Excel"), or SSN (confidential, optional). For gifts and other non-biographical updates, use the **import ID**. [V] https://blackbaud.my.salesforce-sites.com/bbknowledge/articles/Knowledge/75298
- SKY API exposes **system record IDs** (`id`) plus a user-defined `lookup_id`; a "Get a gift by lookup ID" operation maps one to the other. [V] connector reference.
- Consequence: an RE migration has up to **three** candidate source keys per record (system record ID, Import ID, Constituent/lookup ID) and they are surface-dependent (API vs database-view export vs web-view list). The stable key must be chosen per surface and preserved as text. [S] (the Excel leading-zero warning is [V]).

### 3.3 Relational linkage

- Gift → splits (fund/campaign/appeal/package) is one-to-many; gift → soft credits is a separate one-to-many; community practitioners note total soft-credit amount "CAN be less than, equals, or more than the full gift amount". [V] split fields in connector; [third-party] https://community.blackbaud.com/discussion/comment/313484/
- Pledge → installments and pledge → payments exist as API sub-collections; `linked_gifts` links gifts. [V] connector. Rebuilding pledge/payment links from a **flat** list export is [NX].
- Splits map naturally to Asym designation lines (fund ≈ designation; campaign/appeal/package are attribution dimensions, not purpose targets). [S]
- Households: RE commonly models spouses as separate constituents with automatic spouse soft credits and "head of household" processing; support reportedly said a built-in couple-combined-giving method did not exist. [third-party] community threads (dates vary; may be stale). Recent product notes say soft credits and commitments are now included in giving totals and filters. [V*] https://community.blackbaud.com/discussion/77239/whats-new-er-recognition-in-giving-with-soft-credits-and-pledges (snippet).
- Multi-currency: no currency fields appeared in the connector's gift schema; RE NXT multi-currency is **unverified** here.

### 3.4 Brief: eTapestry and Luminate Online are different sources

- **eTapestry** (separate Blackbaud product): the documented manual "database backup" is two report exports — All Accounts (Excel, all personas, account and persona user-defined fields) and All Journal Entries (CSV to Drop Box) linked by account number; non-transaction journal entries can be exported separately. A **"Final Data Export"** is a separate **purchasable** package "intended for organizations moving to another system": multiple tab-delimited files linked by reference IDs, a file list and a Microsoft Access database. [V] https://webfiles-sc1.blackbaud.com/files/support/helpfiles/etapestry/etapestry/content/etapcreatingdatabasebackup.html . Recurring gift schedules, soft credits, splits and attachments are not described on that page [NX]. Community reports paid pledges double-counted in exports unless gift balance is used [third-party].
- **Luminate Online** is an online-engagement platform, not the donor-of-record CRM; community users describe Report Writer CSV as the main export path, and Blackbaud help says LO constituent records and transactions must be processed into Raiser's Edge. [third-party] community threads; [V*] https://www.blackbaud.com/files/support/helpfiles/relo/Content/Home.html (snippet). Treat as a later, engagement-history source only. [S]

### 3.5 Learn vs do not copy

- **Learn:** explicit, typed gift kinds (pledge, recurring gift, matching-gift pledge, payments) and split-level fund/campaign/appeal/package; separate receipt and acknowledgement status per gift (useful to import as **historical evidence** without re-receipting); `post_status` distinguishes GL-posted history. [V] connector.
- **Do NOT copy:** relying on an optional, user-maintained ID (Constituent ID) as the merge key; spreadsheet round-trips that strip leading zeros from Import IDs [V article]; head-of-household export processing that silently drops spouses [third-party]; computing donor totals from soft credits mixed with hard credits [third-party; conflicts with Asym's Legal vs Recognition vocabularies, ADR-0002].

### 3.6 Qualification evidence needed (Raiser's Edge NXT)

1. A real SKY API or Single Row Query/Export extract with constituent system record ID + Import ID + Constituent ID, gifts with splits, soft credits, pledge installments/payments, recurring gifts and linked gifts. [NX]
2. Whether the organization can obtain a database-view backup and whether Blackbaud permits third-party restore/extraction from it (contract). [NX]
3. Spouse/household convention (separate constituents with auto soft credit vs one record). [NX]
4. Currency/multi-currency configuration and Gift Aid fields (UK). [NX]
5. Attachments: volume and whether exported via API only. [NX]
6. For eTapestry: a real Final Data Export package (price and schema) and the two-report backup files. [NX]

---

## 4. DonorPerfect

Sources: the Importing 101 and "Export the data you want" webinar transcripts on donorperfect.com (fetched), DonorPerfect marketing/training snippets, and third-party migration guides. No official DonorPerfect knowledge-base article describing a complete multi-table export was found.

### 4.1 Export surfaces (each distinct)

| Surface                                                   | Contents / limits                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Evidence                                                                                                                          |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Listings > Export to File** with an **export template** | CSV. Template types and row grain: Main bio = one row per person; **Gift pledge = "one entry per donation"**; Contact = "one row per contact transaction"; Other address = one per address; Other information = one per other record (e.g. volunteer/board service); Gift pledge summary (grain not described). Templates choose columns, the filter chooses rows; Donor ID is recommended in every template, and gift ID / contact ID for gift/contact exports. "In some locations, you won't have the ability to add or edit a template." | [V] https://www.donorperfect.com/video/export-the-data-you-want/                                                                  |
| **Export to Excel** on report screens                     | XLS close to the on-screen report, "not going to be a one to one match". A **report export**, not a migration source.                                                                                                                                                                                                                                                                                                                                                                                                                       | [V] same                                                                                                                          |
| Mail-merge export                                         | Excludes do-not-mail donors unless "Include no mail names" is selected — an easy way to silently lose records.                                                                                                                                                                                                                                                                                                                                                                                                                              | [V] same                                                                                                                          |
| **Utilities > Backup and Restore**                        | A vendor-native backup: three user backups retained ("The oldest one will drop off"); restoring reverts data entered after that point, and for coworkers entering data during an import "it will undo their data entry". DonorPerfect markets "30 Day data insurance" restore points. **Not a portable export.**                                                                                                                                                                                                                            | [V] https://www.donorperfect.com/video/importing-101/ ; [V*] marketing snippet                                                    |
| API                                                       | DonorPerfect integrations use an XML API (`dpgift`, `dppledge` tables per third-party docs). Official API reference not found this session.                                                                                                                                                                                                                                                                                                                                                                                                 | [third-party] https://docs.wegive.com/donorperfect/integration-nuances ; https://help.anedot.com/en/articles/9043486-donorperfect |

Third-party migration guides (DonorDock, CommitChange) prescribe two Export-to-File runs — **Main/Bio Data** and **Gift/Pledge Transactions** with the "All Fields (shared)" template and "Include No Mail Names" — and warn other data needs separate listings. [third-party] https://helpcenter.donordock.com/kb/guide/en/migrating-from-donorperfect-1gMxjVr5lY/Steps/1116447

### 4.2 IDs, linkage and model

- `donor_id` per main record; `gift_id` per gift/pledge row; contact IDs for contact transactions. [V] export webinar.
- Gifts and pledges are rows of the same "gift pledge" export grain; a pledge payment is a gift row flagged as a pledge payment, and integrations link payments to pledges by donor and dates rather than an explicit pledge ID in their docs. [third-party] WeGive recurring-donation mapping https://www.wegive.com/docs/donorperfect/data-mapping/recurring-donation.md — explicit pledge-payment linkage is **[NX]**.
- Split gifts: a third-party integration writes a main record (`record_type='M'`) and one `record_type='G'` row per fund with `split_gift='Y'`. [third-party] Anedot. The DP export behavior for splits is **[NX]**.
- Soft credits are "linked gifts" that "create links between records"; standard financial reports filter them out and tax letters must exclude them; a parameter can include soft credits in calculated fields. [V*] donorperfect.com training/marketing snippets (search result). This aligns with Asym's non-receiptable recognition — good for mapping — but the export representation is [NX].
- Organizations are main records with `org_rec = Y` plus a donor-type code; individuals `N`. [V] Importing 101. Households: DP offers household-style cross-references; a transcript says household soft-crediting "is not really how DonorPerfect works by default". [V*] snippet. Household → Asym household Party is **not** derivable from a flat export without the link records [S/NX].
- Fund (`gl_code`) is the designation equivalent; campaign/solicitation codes are separate coded fields. Coded fields export **codes**, and code descriptions are a separate export from Code Maintenance. [V] Importing 101 (GL code mapping; code list export). Mapping codes → Asym designations/campaigns needs the code table [S].
- Multi-currency: not found [unverified].
- Credit-card data cannot be imported "due to PCI compliance". [V] Importing 101. Payment instruments are therefore never a migration payload. [S, consistent with Asym boundaries]

### 4.3 DonorPerfect import behavior — learn vs do not copy

- **Learn:** validation step that checks every cell with separate **Pending Records** and **Invalid Records** tabs and in-place fixing; trial import of a few rows; "Alternate ID" matching for IDs from other systems. [V] Importing 101.
- **Do NOT copy:** default action "update existing records and insert the rest" with record matching on last name + first name + address + zip; any matching column must be populated on every row or "you can't even import that spreadsheet at all"; "Blank cells do not clear existing data" with no way to express a deliberate clear; **using a whole-database restore as the import undo** (it erases coworkers' concurrent work). Asym's Phase 30 explicitly rejects this ("a changed target is a conflict, not permission to overwrite newer work"; `roadmap.md:4349`) and requires per-batch reversal. [V vendor; V repo]

### 4.4 Qualification evidence needed (DonorPerfect)

1. Real Export-to-File CSVs for Main/Bio, Gift/Pledge, Contact, Other Address, Other Info, and Links, each with IDs. [NX]
2. How pledge payments reference their pledge in an export; how split gifts and soft credits appear (main row + split rows? `record_type`?). [NX]
3. Code-table exports for GL codes, campaigns, solicitations and donor types. [NX]
4. Whether DonorPerfect provides a vendor full-data export at offboarding, its format and cost. [NX]

---

## 5. Virtuous CRM+

Fetch note: both requested `support.virtuous.org` articles returned **HTTP 403** to the fetch tool on 2026-10-31; their content below is from search-result snippets of those exact pages ([V*]). `docs.virtuous.org` (developer docs) was fetched directly ([V]).

### 5.1 Export surfaces

| Surface                                                   | Contents / limits                                                                                                                                                                                                                                                                                                                                                                                                           | Evidence                                                                                                                   |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Query results "Download CSV"**                          | Choose fields in order; selections saved with the query. Contact queries offer Contact, Individual, Contact Methods, Addresses and Giving Statistics fields; field availability varies by query type. **Gift queries can split by Project**: a gift split across two or more projects appears on two or more rows. Gift results also offer a QuickBooks Desktop IIF file. Export permission not documented in the snippets. | [V*] https://support.virtuous.org/hc/en-us/articles/360051407552-Exporting-Query-Results                                   |
| **Virtuous Analytics** report download / scheduled export | Report-level exports; scheduled exports can run "using the permissions and data access of the recipient(s)". A **report export**, not a migration source.                                                                                                                                                                                                                                                                   | [V*] https://support.virtuous.org/hc/en-us/articles/24821378503053-How-Do-I-Schedule-Exports-of-Virtuous-Analytics-Reports |
| **API** (`api.virtuoussoftware.com`)                      | Documented write paths for contact/gift **transactions**; no bulk export endpoint found this session.                                                                                                                                                                                                                                                                                                                       | [V] https://docs.virtuous.org/crm/concepts/transactions ; read/query endpoints [unverified]                                |

### 5.2 Model and IDs

- **Contact** is the giving unit, typed **Household** (individuals and families), **Foundation**, or **Organization**; types "align with the way giving is reported to the IRS". Each Contact contains one or more **Individuals**; "Each contact record must have at least one individual". [V*] https://support.virtuous.org/hc/en-us/articles/6181633516557-What-are-Contact-Types ; glossary snippet. **Mapping consequence:** the Virtuous "household Contact" is both the legal donor and the container of people; Asym must decide per row whether the legal donor is the household Party or a person Party, which the export alone may not settle. [S/NX]
- Contact references: `referenceSource` + `referenceId` pairs stored in `contactReferences`; an external reference match is "the most reliable match"; the pair is also the idempotency key for contact transactions. Gift transactions: `transactionSource` + `transactionId`, and resubmitting the same pair "is recognized as a duplicate". [V] docs.virtuous.org transactions page. The Reference ID lives at the Contact (household) level, so it "cannot be used alone to identify" an individual. [V*] best-practices snippet.
- Designations are **Projects**: each `giftDesignations` entry has `projectCode` + `amountDesignated`; projects can also be referenced by `externalAccountingCode` or `projectId`; the help center says a designation amount must be specified for each Project "even if the entire gift is being allocated to a single Project". [V] docs; [V*] help snippet. Maps well to Asym exact-sum designation lines. [S]
- Pledges: "a commitment from a donor to give a specific sum of money over a set period of time"; gifts carrying a matching `pledgeTransactionId` are recorded as pledge payments. Recurring gifts: "does not represent a binding or long-term commitment"; gifts with a matching `recurringGiftTransactionId` attach to that RecurringGift. [V*] glossary snippet; [V] docs. This pledge-vs-recurring distinction matches Asym's fixed-total pledge vs recurring giving split (`CONTEXT.md:1727-1790`). [S]
- **Passthrough** gifts = soft-credit-like: "a gift received originated with a giver other than the contact who actually made the gift" (e.g. corporate match, DAF); cannot be entered alone. Limits conflict between pages (one passthrough per gift vs up to 100). [V*] https://support.virtuous.org/hc/en-us/articles/360051316471-What-Are-Passthrough-Gifts ; conflict noted. **Mapping hazard:** a passthrough expresses _origination_, which can mean the passthrough giver is the true legal donor or only a recognition party, depending on gift type; Asym must not default either way. [S]
- Currency: sample requests carry `currencyCode` "USD"; multi-currency behavior not documented. [V] docs (sample only).

### 5.3 Virtuous import behavior — learn vs do not copy

- **Learn:** three review buckets — **Ready for Import** (one high-confidence contact match "if there are no changes to the existing data"), **Update Needed** (high-confidence match with new data "for you to review"), **Match Needed** ("cannot confidently distinguish a potential match" → manual review). New donors are not created automatically unless the org enables bulk "Create New Contacts" from Match Needed. [V*] https://support.virtuous.org/hc/en-us/articles/6164198344205-Match-Needed-Update-Needed-Ready-for-Import . This is a close analogue of Phase 30's create/update/skip/queue-for-merge plan with visible uncertainty. [S]
- **Learn:** stable source-pair idempotency (`source` + `id`) and the explicit warning not to regenerate IDs on retry. [V] docs.
- **Do NOT copy:** **Reprocess** re-sorts an import from the original file, and "Manual changes made after importing the gifts will be lost". [V*] https://support.virtuous.org/hc/en-us/articles/6156012781965-What-Does-it-Mean-to-Reprocess-an-Import . Asym's equivalent (replan) must preserve later staff edits as conflicts.
- **Do NOT copy:** opt-in "Partial & Auto Imports" that commit confidently matched rows without review; a nightly batch that hides whether a submission became a record. [V*] search snippets; [V] docs (nightly batch, 200 OK with no Gift ID).

### 5.4 Qualification evidence needed (Virtuous)

1. Real contact-query CSV with Contact ID, Contact type, Individual IDs, contact references (source/ID), addresses and contact methods. [NX]
2. Real gift-query CSV split by Project, with gift ID, pledge/recurring linkage columns, passthrough giver columns and currency. [NX]
3. Whether export can include Individual-level IDs for every person in a Household Contact. [NX]
4. Which roles can export (permission model). [unverified]
5. Whether Virtuous provides a full-database export at offboarding. [unverified]

---

## 6. Bloomerang CRM

Fetch note: the requested `intercom.help/bloomerang-0feff2a47ff2/...12632641` URL returned **404**; the same article ID resolves at `help.bloomerang.com` and was fetched there ([V]).

### 6.1 Export surfaces

| Surface                                                                             | Contents / limits                                                                                                                                                                                                                                                                                 | Evidence                                                                                                                                                                                                        |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Database Export** (Settings > Organization > Database Export > Create New Export) | A **vendor-produced full export package**: `DataExport-[date].zip` with "a separate CSV file for each data type". Must stay on the page until done (leaving means starting again); may take "several or more minutes"; one-hour wait between exports. Role/permission requirement **not stated**. | [V] https://help.bloomerang.com/en/articles/12632641-export-bloomerang-crm-data ("Export Bloomerang CRM Data", updated "over 2 weeks ago" as of 2026-10-31)                                                     |
| **Report export**                                                                   | CSV, PDF or Excel; downloadable for up to 24 hours.                                                                                                                                                                                                                                               | [V*] https://help.bloomerang.com/en/articles/16142808-export-reports (snippet)                                                                                                                                  |
| **REST API v2**                                                                     | Transactions with one or more designations typed Donation / Pledge / PledgePayment / RecurringDonation / RecurringDonationPayment; households and relationship roles.                                                                                                                             | [third-party] unofficial OpenAPI https://apis.io/apis/bloomerang/bloomerang-transactions-api/ ; Ruby gem docs https://rubydoc.info/gems/bloomerang_api/Bloomerang/Transaction — official reference not verified |

### 6.2 Database Export contents and omissions (all [V], same article)

- **Included files:** Addresses, Appeals, Campaigns, Constituents, Custom Fields, Donations, Email interests, Emails, **File Attachments**, Funds, Households, Interactions, Notes (with `IsPinned`), Phones, Pledge payments, Pledges, Processing info, Recurring donation payments, Recurring donations, Refunds, Relationship roles, Relationships, Soft credits, Tasks, Transaction processor accounts, Transactions, Tributes, **Users**, **Wallet items (EFT and credit card data)**.
- **Not exported:** email and letter templates; engagement scores; built-in Volunteer Activity / Volunteer Hours interaction fields; **Groups**; membership programs and levels (add-on); "**Information about split gifts**".
- **Misleading values:** Processing Info contains an expected **$0 transaction row** because a new recurring donation's card "is validated with $0 and then charged the donation amount"; active Tasks show **01/01/0001** as the completion date.
- **Expected blanks:** envelope/formal/informal/recognition names (especially for data from conversions, imports, forms or API); sort names; country on addresses/phones.
- Not stated: ID columns, designation file naming, multi-currency.

### 6.3 Mapping implications

- **Split gifts are lost** in the Database Export ([V]); a Bloomerang transaction split across funds cannot be rebuilt into exact-sum Asym designation lines from this package alone. Options: an API extract, or a per-transaction report, both [NX]. Reconciliation by fund will therefore not tie unless the split source is found. [S]
- Separate Pledges / Pledge payments and Recurring donations / Recurring donation payments files suggest pledge-payment and recurring-installment linkage is rebuildable, **if** parent IDs are present. [V] files exist; [NX] link columns.
- `$0` card-validation rows must be excluded from gift history and from control totals, and must never become a "first gift" trigger. [V] vendor warning; [S] Asym consequence (Phase 30 batch-origin event suppression, `owner-constraints.md:386-388`).
- `01/01/0001` task completion dates are a sentinel for "not completed", not a historic date. [V]
- **Wallet items (EFT and credit card data)** and **Transaction processor accounts** are payment-instrument data; **Users** are staff principals. Asym should treat these as **out of scope** for import (no payment authority, no staff membership from directory data — `roadmap.md:4381` "SMS and directory import scope"). [V vendor contents; S policy]
- Households are a separate file from Constituents; Relationships and Relationship roles exist. Constituents are individuals or organizations (import guidance: separate spreadsheets for individuals and organizations; households require an Account Number to update household names). [V*] https://help.bloomerang.com/en/articles/12632800-imports-set-up-import-files (snippet).
- Soft credits are their own file → Asym recognition-only credits. [V file; S mapping]
- File Attachments file: whether it contains bytes or only metadata/links is **[NX]**; any bytes would go through Phase 29 custody, not Phase 30. [S]

### 6.4 Bloomerang import behavior — learn vs do not copy

- Import matching: by Bloomerang **account number**, or name plus one of email, standardized street address or last seven digits of phone; account number recommended as the unique identifier. [V*] https://help.bloomerang.com/en/articles/12632800-imports-set-up-import-files ; https://help.bloomerang.com/en/articles/12632440-imports-update-constituents-via-import (snippets).
- **Learn:** vendor-documented list of omissions and misleading values in the export — Asym should publish the same for its own import profiles (per-profile "known gaps" sheet). [S]
- **Do NOT copy:** fuzzy name + partial phone (last 7 digits) as an automatic match; the online-form duplicate check (first + last name plus address or phone or email) auto-linking gifts. [V*] snippets. These conflict with Phase 4 owned identity evidence.

### 6.5 Qualification evidence needed (Bloomerang)

1. A real `DataExport-[date].zip` with header rows for every file, to confirm ID columns (account number vs internal ID), parent links (pledge → payment, recurring → payment, transaction → donation/soft credit) and how multi-designation transactions appear. [NX]
2. Whether File Attachments contains bytes or URLs. [NX]
3. A source for split-gift information (API or report). [NX]
4. Currency fields, if any. [unverified]
5. Which role can run Database Export. [unverified]

---

## 7. Neon CRM (Neon One)

Fetch note: the requested `support.neonone.com/...4407399535501-Importing-Data-in-Neon-CRM` and the Neon Import Field Guide returned **HTTP 403**; the legacy `support.neoncrm.com` article failed with an expired TLS certificate. Neon facts below are mostly _*[V*]_* search snippets of official Neon pages, plus third-party guides. Evidence for Neon is the **weakest** of the seven sources.

### 7.1 Export surfaces

| Surface                                                                               | Contents / limits                                                                                                                                                                                                                                                                                                                             | Evidence                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Search/list export** (Export icon on a list; Excel or CSV)                          | "If the list has been filtered or is the result of a search, only the results will be exported." A **grid export**: columns chosen per export.                                                                                                                                                                                                | [V*] https://support.neoncrm.com/hc/en-us/articles/223150347-Account-List (snippet)                                                                                                       |
| **Advanced Search → Export Results** for Accounts, Donations/Transactions, Activities | Third-party migration guide: one file per area, CSV or Excel; must deliberately include identifiers; does not mention households, soft credits, pledges or recurring.                                                                                                                                                                         | [third-party] https://helpcenter.donordock.com/kb/guide/en/exporting-data-from-neon-rzbI3XIqbg/Steps/3735313                                                                              |
| **Custom reports**                                                                    | Exist (standard + custom reports); export specifics not found.                                                                                                                                                                                                                                                                                | [third-party] G2 listing snippet                                                                                                                                                          |
| **API v2** (`https://api.neoncrm.com/v2`, HTTP Basic with org ID + API key)           | `POST /accounts/search` with `searchFields` / `outputFields` and discovery endpoints; Households resource with relation types; a Donations area covering donations, pledges, pledge payments, recurring donations and soft credits (paths unverified). An API-evangelist OpenAPI copy says API v1 was scheduled for retirement on 2026-07-11. | [third-party] https://raw.githubusercontent.com/api-evangelist/neonone/refs/heads/main/openapi/neonone-openapi.yml ; https://pypi.org/project/neoncrm/ — official reference not retrieved |

No vendor full-database export package was found for Neon. [unverified]

### 7.2 Model and IDs

- Accounts are individual or company; import uses `IsCompany` when both kinds are in one sheet; Neon "does not require an ID number when importing accounts". [V*] https://support.neoncrm.com/hc/en-us/articles/218529997-Preparing-Account-Data (snippet). Account ID links donations to accounts. [V*] https://support.neonone.com/hc/en-us/articles/4407398869517-Prepare-Donation-Data-for-Import (snippet).
- Households group individual accounts with relation types. [third-party] OpenAPI; [V*] field-guide snippet: households are matched on import by "Household Name + Address".
- Donations carry **Fund**, **Campaign** and **Purpose** (all with IDs, per an integration that writes to Neon). [third-party] https://help.bloomerang.com/en/articles/13382602-neoncrm . Fund ≈ Asym designation; Campaign ≈ campaign; Purpose is a third dimension that needs a tenant decision. [S]
- Pledges, pledge payments, recurring donations and soft credits exist as concepts. [third-party/V*]

### 7.3 Neon import behavior — learn vs do not copy

- The legacy NeonCRM import article says some data cannot be imported: "relationships between accounts, including household, employment, and/or account relations" and, for donations, "recurring donations, payments linked to pledges, and soft credits"; the newer donation-prep page says such data "will need to be removed before import". The newer Import Field Guide instead says the Import Manager "will automate the creation of households and relationship links". **The two Neon pages conflict.** [V*] snippets of https://support.neoncrm.com/hc/en-us/articles/218529887-Importing-Data-in-NeonCRM and https://support.neonone.com/hc/en-us/articles/4407409383821-Neon-CRM-Import-Field-Guide .
- Mixed new and existing accounts must be split into two spreadsheets and imported twice (batch update vs new). [V*] snippet.
- **Lesson:** a vendor importer that silently cannot carry pledge-payment links or soft credits forces "remove before import" data loss. Asym should **quarantine unsupported rows with a visible disposition** rather than require removal (consistent with the Phase 30 guardrail "quarantine unresolved records for a visible disposition", `roadmap.md:4395`). [S; V repo]

### 7.4 Qualification evidence needed (Neon)

1. Real Account, Household, Donation, Pledge, Pledge Payment, Recurring Donation, Soft Credit and Relationship exports (or API output) with IDs. [NX]
2. Whether Neon offers a full-data export on request/offboarding. [unverified]
3. How Fund / Campaign / Purpose are used by the tenant. [NX]
4. Currency handling. [unverified]

---

## 8. Cross-source comparison

Legend inside cells: **V** verified on vendor page, **V\*** vendor page via search snippet only, **3P** third-party, **NX** needs a real export, **?** not found.

### 8.1 Export surfaces and identity

|                 | Best migration surface (documented)                                                | Vendor full-export package?                                       | Report/grid export useful only for spot checks           | Stable record ID in export                                           | Deleted/archived records                                                             |
| --------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| CiviCRM         | SearchKit / API v4 per entity; SQL dump if hosted access allows (S)                | No vendor package; open schema (V)                                | Export Contacts wizard, CiviReport                       | `id` + unique `external_identifier` (V schema)                       | Trash (`is_deleted`) restorable; merged duplicates unrecoverable without logging (V) |
| Salesforce NPSP | Data Loader / Bulk API per object; weekly/monthly Data Export ZIP (V\*)            | Data Export Service (V\*)                                         | Reports (XLSX row caps, 3P)                              | 18-char record IDs (S); package field names stable (V repo)          | Only "Export All" includes soft-deleted and archived activities (V\*)                |
| Salesforce NPC  | Same platform tools (V\*)                                                          | Same                                                              | Same                                                     | Same                                                                 | Same                                                                                 |
| RE NXT          | SKY API (V via Blackbaud connector); database-view Export / Single Row Query (V\*) | Encrypted SQL `.bak`, 7-day expiry (V); "database view only" (3P) | Web-view list CSV ≤500,000 rows, chosen columns only (V) | System record ID, Import ID, optional Constituent ID / lookup_id (V) | ?                                                                                    |
| eTapestry       | Two system report exports (V)                                                      | **Final Data Export**, purchasable, tab-delimited + Access DB (V) | Reports                                                  | Account number links files (V)                                       | ?                                                                                    |
| DonorPerfect    | Listings > Export to File with templates (V)                                       | ? (backup is restore-only, V)                                     | Export to Excel (V)                                      | `donor_id`, `gift_id`, contact ID if templated (V)                   | ?                                                                                    |
| Virtuous        | Query "Download CSV" (V\*)                                                         | ?                                                                 | Analytics exports (V\*)                                  | Contact ID; `referenceSource`+`referenceId` (V docs)                 | ?                                                                                    |
| Bloomerang      | Database Export ZIP, one CSV per type (V)                                          | **Yes, self-serve** (V)                                           | Reports CSV/PDF/Excel, 24 h (V\*)                        | Account number recommended for import (V\*); export ID columns NX    | ?                                                                                    |
| Neon CRM        | Advanced search "Export Results" / API v2 (V\*/3P)                                 | ?                                                                 | List export Excel/CSV (V\*)                              | Account ID (V\*)                                                     | ?                                                                                    |

### 8.2 Relational rebuild and money semantics

|              | Party model                                                     | Households                                | Legal donor vs recognition                                                                  | Designations                                                               | Campaign/appeal                    | Pledge ↔ payment link                                 | Recurring schedule ↔ installments         | Multi-currency                 | Attachments                         |
| ------------ | --------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------- | ----------------------------------------------------- | ----------------------------------------- | ------------------------------ | ----------------------------------- |
| CiviCRM      | Individual / Household / Organization + sub-types (V)           | Contact type + relationships (V)          | `contact_id` hard; `ContributionSoft` with own amount (V)                                   | Financial type, line items (V schema)                                      | `campaign_id` (V)                  | `PledgePayment.contribution_id` (V schema)            | `contribution_recur_id` (V schema)        | Per row `currency` (V)         | ?                                   |
| NPSP         | Contact + Household/Org Account (V)                             | Household Account (V)                     | Account on Opp; person via Donor contact role (S/NX); OCR + Partial/Account Soft Credit (V) | GAU Allocation, amount **or percent**, on Opp/Payment/RD/Campaign (V repo) | Campaign (V repo)                  | `npe01__OppPayment__c` → Opp (V)                      | Recurring Donation → installment Opps (V) | Org setting (VC)               | Data Export option (V\*)            |
| NPC          | Person Account; Business Account (V)                            | PRG Household + ACR; multi-membership (V) | `GiftSoftCredit` w/ `RecipientId`, release-varying roles (V\*)                              | `GiftTransactionDesignation` amount/percent (V\*)                          | Campaign, Outreach Source Code (V) | Gift Commitment + Schedule → Gift Transaction (V/V\*) | Same object family (V)                    | ? (V\* shows USD only)         | same                                |
| RE NXT       | Individual / Organization constituents (S)                      | Spouse records + HoH processing (3P)      | Gift constituent hard; soft credits array, total may exceed gift (V / 3P)                   | Gift splits: fund (+campaign/appeal/package) (V)                           | split-level (V)                    | Pledge installments & payments sub-lists (V)          | Recurring schedule on gift (V)            | ?                              | Physical files + links via API (V)  |
| DonorPerfect | Main record, `org_rec` Y/N (V)                                  | Household-style links (V\*)               | Soft credits as "linked gifts", excluded from tax letters (V\*)                             | GL code (V); splits NX                                                     | Coded fields (V)                   | NX (3P suggests by donor/date)                        | NX                                        | ?                              | ?                                   |
| Virtuous     | Contact (Household/Foundation/Org) containing Individuals (V\*) | The Contact itself (V\*)                  | Passthrough giver (V\*; limit conflict)                                                     | Projects with amounts (V)                                                  | ?                                  | `pledgeTransactionId` (V docs)                        | `recurringGiftTransactionId` (V docs)     | `currencyCode` sample only (V) | ?                                   |
| Bloomerang   | Individual / Organization constituents (V\*)                    | Separate Households file (V)              | Soft credits file (V)                                                                       | Funds file; **split gifts not exported** (V)                               | Appeals, Campaigns files (V)       | Pledges + Pledge payments files (V); link NX          | RD + RD payments files (V); link NX       | ?                              | File Attachments file (V); bytes NX |
| Neon         | Individual / Company accounts (V\*)                             | Households + relation types (3P/V\*)      | Soft credits exist (3P)                                                                     | Fund (3P)                                                                  | Campaign, Purpose (3P)             | ?                                                     | ?                                         | ?                              | ?                                   |

### 8.3 Data in exports Asym should refuse to ingest as authority

- Payment instruments and processor tokens: Bloomerang "Wallet items (EFT and credit card data)" and "Transaction processor accounts" (V); CiviCRM `payment_token_id`/`processor_id` (V schema); NPSP payment card fields on `npe01__OppPayment__c` and Recurring Donation (V repo); DonorPerfect cannot import card data (V). Recurring schedules therefore import as **historical commitments**, never as live collection authority. [S, consistent with `owner-constraints.md:373-377` and Phase 30 outward-effect-dark rule `roadmap.md:4365`]
- Staff/user directories: Bloomerang "Users" file (V). [S policy per `roadmap.md:4381`]
- Vendor rollups and engagement scores (NPSP nightly rollups, Bloomerang engagement scores (not exported anyway)). Recompute from imported facts. [S]
- Validation/sentinel artefacts: Bloomerang `$0` card validations and `01/01/0001` task dates (V). [S: generalize to a per-source sentinel registry]

---

## 9. Candid view: which 1-3 non-SiteStacker sources give the most migration value for ministry/missions organizations

### 9.1 What the evidence actually supports

- **No usage data was found** for which CRMs mission agencies use; the only search hits were vendor positioning, review-site rankings and decades-old surveys. [V negative result, 2026-10-31]
- **Virtuous** explicitly positions itself as built "for faith-based nonprofits" and lists ministry customers including Operation Mobilization and Impact Campus Ministries (vendor-published). [V\*] https://virtuous.org/faith ; https://virtuous.org/sector/ministries/ . A third-party estimate puts religious institutions at ~10% of Virtuous customers. [3P] https://sentry.idatalabs.com/tech/products/virtuous
- **DonorPerfect** and **Bloomerang** both market to faith-based organizations. [3P / vendor blog] https://bloomerang.com/blog/the-power-of-a-best-in-class-dms-for-faith-based-organizations
- **Raiser's Edge NXT** is consistently ranked for medium-to-large nonprofits. [3P] https://www.selecthub.com/p/fundraising-software/raiser-s-edge-nxt/
- Asym's own roadmap already names missionary-side tools in a **different** context: TntConnect only through a "vendor-authorized, production-certified DonorHub pathway" and MPDX only for "explicitly authorized installed-base organizations" — for the Phase 21 outbound feed, not for Phase 30 import. (`docs/prds/sitestacker-parity/roadmap.md:2088-2090`). Owner text also cites "TntConnect's single-pledge limit" (`docs/prds/program-roadmap/owner-constraints.md:68`). These are the tools missionaries personally use and may be relevant to the Phase 28 D17 self-import contact profile, but they were **out of scope for this track** and are not evaluated here.

### 9.2 Analyst view (speculation, clearly labelled)

On **documented export quality** (not market share), ranking for a first non-SiteStacker profile:

1. **Bloomerang Database Export** — the only source in this set with a **self-serve, vendor-documented, whole-database package** that also publishes its own omissions and misleading values. It separates households, relationships, soft credits, pledges/pledge payments and recurring/recurring payments into files. The single biggest gap — split gifts not exported — is explicit, so a profile can declare it rather than discover it. Best "contract-testable" profile. [S; facts V]
2. **Virtuous** — highest **ministry fit** by vendor positioning, and its model (household Contact containing Individuals; Projects with exact designation amounts; explicit pledge vs recurring; passthrough origination) is close to Asym's Party / designation-line / Phase 16 split. But export is query-CSV based with no documented full package, and the household-Contact-as-legal-donor and passthrough semantics need founder rulings. [S; facts V/V\*]
3. **Salesforce NPSP (not NPC first)** — large installed base among mid/large nonprofits (assumed, not evidenced here) and the richest, most stable **open** schema (package source is public), so a deterministic per-object profile is feasible. Highest mapping risk: household-account-as-Opportunity-owner, percent-based GAU allocations, configurable soft-credit roles, optional multi-currency. NPC should be a **separate later profile** because its object model differs completely. [S; facts V repo/V\*]

**Raiser's Edge NXT** is likely high-value for larger ministries but has the **least portable** documented full export (encrypted SQL Server backup restricted to the requester, "database view only" per community, 7-day expiry) and three competing ID systems; a SKY-API-based extractor is plausible but is an API integration, not a file import. **CiviCRM** has excellent, open, ID-rich data but is unlikely to be common among US mission agencies (S). **DonorPerfect** and **Neon** have the weakest documented relational exports (pledge-payment and split linkage NX/unknown).

### 9.3 Generic fallback worth considering

A **generic "Asym canonical CSV" template set** (Parties, Relationships, Gifts with designation lines, Recognition credits, Pledges, Pledge applications, Recurring commitments, each with `source_system` + `source_record_id` + parent IDs) generated from the field catalog would let any of the above be migrated by a consultant or script without Asym committing to vendor-specific profiles. The roadmap already requires "source-specific templates generated from the field catalog" (`roadmap.md:4347`). [S]

---

## 10. Consolidated open founder questions (product choices, not facts)

1. Which first non-SiteStacker profile(s), if any, ship with Phase 30: a generic canonical-CSV template only; or vendor presets (e.g. Bloomerang Database Export; Virtuous query CSVs; Salesforce NPSP per-object extract)?
2. Are **API-pull extractors** (SKY API, Salesforce Bulk API, Virtuous/Neon APIs) in Phase 30 scope, or does Phase 30 accept only customer-supplied files (with any extractor living in Phase 31 integrations)?
3. When a source's giving unit is a **household** (NPSP Household Account, Virtuous household Contact, CiviCRM Household contact, Bloomerang household), is the default legal donor the household Party, the primary person, or "unresolved — reviewer must choose"?
4. Should vendor **soft-credit/passthrough** rows always import as recognition-only (non-receiptable) credits, even when the source's semantics suggest the passthrough giver was the true payer (e.g. DAF, employer match)?
5. For sources that express designations as **percentages** (NPSP GAU allocations, NPC designations), what rounding/remainder rule is acceptable, or must such rows be quarantined until amounts are confirmed?
6. Are historic **recurring schedules** imported as inert historical commitments, as active Phase 16 recurring commitments awaiting a new payment authorization, or excluded?
7. Should Asym import vendor **attachments** (Bloomerang File Attachments, RE NXT gift attachments) in the first release, given Phase 29 custody prerequisites?
8. Is migration from **missionary personal tools** (TntConnect, MPDX) a Phase 30 profile (e.g. for D17 self-import) or explicitly out of scope?
9. Should each profile publish a vendor-specific "known omissions and sentinel values" sheet (as Bloomerang does) as a release requirement?

---

## 11. What this track could not verify

- Full content of `developer.salesforce.com` pages (NPSP data model, NPC fundraising objects, Data Loader export) — 403 to the fetch tool; NPC field-level facts rest on search snippets.
- Salesforce Data Export Service options, download window and ZIP limits from the official help page (JS-rendered; blank/404 to the fetch tool).
- Both `support.virtuous.org` articles named in the task (403); content from search snippets only.
- Both Neon support articles (403 / expired TLS certificate); Neon facts are snippets and third-party guides, and two Neon pages conflict on whether households/relationships import.
- Blackbaud SKY API raw reference (client-rendered); used the Blackbaud-published Power Platform connector reference as a proxy.
- Raiser's Edge NXT multi-currency, deleted-record handling, and whether web-view list exports include a system record ID.
- DonorPerfect: any official full-database export, pledge-payment linkage, split-gift and soft-credit export representation, multi-currency.
- Bloomerang: ID columns and parent-link columns inside the Database Export files; whether File Attachments contains bytes; which role may run the export.
- Attachments/files export for CiviCRM, Virtuous and Neon.
- Any market-share data for CRMs used by mission agencies.
- No real representative export file from any vendor was examined; every [NX] item remains open.

_End of R08._

## Adversarial verification (independent)

Verifier pass, 2026-10-31. Repo checks are against `develop` @ `629cb71dc` (worktree `t3-73d54b3d`). External pages were re-fetched on the same date. I tried to refute each claim against its cited source. Nothing outside this section was edited.

Verdicts: **confirmed** (the source says it), **corrected** (partly wrong; the correction is given), **refuted** (wrong), **unconfirmed** (could not be checked).

### Verdicts

1. **Phase 30's first supported source export profiles are an open decision, and SiteStacker is the only named source.** — **confirmed.**
   - `roadmap.md:4409` lists "the first supported source export profiles" under Open decisions.
   - `roadmap.md:4369` (SiteStacker migration kit) and `owner-constraints.md:431-437` name only SiteStacker. `roadmap.md:4326` also calls the kit "a named delivery requirement".
   - `git grep` over `docs/prds`, `docs/adr`, `CONTEXT.md` and `openspec` finds Bloomerang, Virtuous, Blackbaud, NPSP and CiviCRM only as design precedents. None is an import source.

2. **The cited owner obligations and roadmap guardrails say what the digest says.** — **confirmed.**
   - `owner-constraints.md:366-372`: the same dedupe rules across UI, API and bulk import, with Salesforce Data Loader named as the anti-pattern.
   - `owner-constraints.md:373-377`: every financial root pins Tenant, Legal Entity, currency, source system and external ID, "None is inferred from Site, provider, or a default entity".
   - `roadmap.md:4349`: "a changed target is a conflict, not permission to overwrite newer work".
   - `roadmap.md:4365`: outward-effect-dark.
   - `roadmap.md:4381`: directory mappings "do not create staff membership".
   - `roadmap.md:4395`: quarantine unresolved records.
   - `CONTEXT.md` 1709-1716, 2204-2210, 4331-4333, 4395-4401 and 4440-4448, and ADR-0002 lines 15-17, all match their paraphrases.

3. **Bloomerang Database Export:** a per-type CSV ZIP that omits split-gift information, groups, engagement scores, membership and templates, and includes Users, Wallet items and Transaction processor accounts, with $0 Processing Info rows and 01/01/0001 task dates. — **confirmed.**
   - Re-fetched https://help.bloomerang.com/en/articles/12632641-export-bloomerang-crm-data. The 29-file list, the "not exported" list (including "Information about split gifts"), "A row in the Processing Info file might have a $0 transaction. This is expected", "Active tasks show 01/01/0001 as the completion date", `DataExport-[date].zip`, the one-hour wait and the stay-on-page rule are all verbatim.
   - The page does not mention a required role, ID columns or attachment bytes. The digest marks these [NX]/unverified, which is correct.

4. **"Only Bloomerang offers a documented self-serve whole-database export (a ZIP of per-type CSVs)."** Section 2.1 also says Salesforce Data Export Service options and the 48-hour window are "third-party claims". — **corrected.**
   - Salesforce's own Trailhead unit, fetchable directly at https://trailhead.salesforce.com/content/learn/modules/lex_implementation_data_management/lex_implementation_data_export, documents a self-serve (Setup) whole-org export: "The data is exported as a set of comma-separated values (CSV) files" in a zip, and recommends "select Include all data".
   - Manual export is allowed "once every 7 days (for weekly export) or 29 days (for monthly export)". Weekly is in Enterprise, Performance and Unlimited.
   - Images, documents and attachments are optional selections.
   - "Zip files are deleted 48 hours after the email is sent."
   - So Salesforce also has a vendor-documented, self-serve, per-object whole-org CSV ZIP. What is unique to Bloomerang is that it publishes its own omissions and sentinel values.
   - The 512 MB cap is still not on any vendor page I fetched. Required permission is not stated on Trailhead.

5. **RE NXT export surfaces.** The digest says web-view lists export ≤500,000 rows with "Only the columns you select". It says the self-serve backup is encrypted, expires after 7 days and can only be downloaded by its requester. — **corrected.**
   - Re-fetching https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-export-lists.html confirms these:
     - "500,000 records or less" as CSV
     - multi-value columns "separated by semicolons"
     - the "Is anonymous" column for gift lists
     - the four-hour link expiry
     - Control panel control of who can export
     - a "View record" bullet ("select Open record for its row")
   - The quoted phrase "Only the columns you select" **does not appear**. The page tells you to pick columns before export, then says that depending on list type the file "may automatically include additional columns". So the export is the selected columns plus possible auto-added ones, not only the selected columns. No system record ID column is mentioned (the digest is right on that).
   - The backup page (https://webfiles-sc1.blackbaud.com/files/support/helpfiles/backups/content/download-backups-renxt.html) confirms the TDE certificate bundle, retrieval by SAS URI with Azure Storage Explorer, "Backups expire after seven days" and "You can't access ones requested by other users".
   - The backup page does not mention a `.bak` format, a once-a-month limit or "database view only". Those rest only on the community thread, as the body of the digest correctly labels them.

6. **DonorPerfect:**
   - Backup/Restore keeps three backups, and restoring "will undo their data entry" for coworkers.
   - Export to Excel is "not going to be a one to one match".
   - Card data cannot be imported (PCI).
   - Matching is on last name + first name + address + zip.

   — **confirmed.**
   - The Importing 101 and "Export the data you want" transcripts both carry these statements.
   - Minor: "Blank cells do not clear existing data" is in quotation marks but is a paraphrase. The transcript says a blank cell "will not blank it out" and that clearing values means you "reach out to support". So "no way to express a deliberate clear" holds only for the import tool itself.

7. **CiviCRM identifiers:**
   - `external_identifier` is `varchar(64)` with a unique index `UI_external_identifier` (added 1.7), usage import, export and duplicate_matching.
   - `PledgePayment` carries `pledge_id` and `contribution_id`.
   - `Contribution` carries `contribution_recur_id`.

   — **confirmed.**
   - `gh api repos/civicrm/civicrm-core/contents/schema/...` (default branch): `Contact.entityType.php` lines 30-36 and 176-186 match exactly.
   - `PledgePayment.entityType.php` has `pledge_id`, `contribution_id`, `scheduled_amount`, `actual_amount`, `currency`, `scheduled_date` and `status_id`.
   - `Contribution.entityType.php` has `contribution_recur_id`, `campaign_id`, `trxn_id`, `invoice_id` and `currency`.

8. **NPSP:**
   - `Allocation__c` carries `Amount__c`, `Percent__c`, `General_Accounting_Unit__c`, `Opportunity__c`, `Payment__c`, `Campaign__c` and `Recurring_Donation__c`.
   - The Data Import Dry Run checks only matching, and only open Opportunities and unpaid Payments.

   — **confirmed.**
   - The GitHub API listing of `SalesforceFoundation/NPSP` `force-app/main/default/objects/Allocation__c/fields` returns exactly those 7 fields. The default branch is `main`, pushed 2026-10-30T20:34:22Z.
   - The help page `sfdo.npsp_verify_with_dry_run.htm` did render for the fetch tool. It reads: "doesn't actually process the records into your org", "A dry run only looks at Donations that are open Opportunities and unpaid Payments", "it doesn't include Closed/Won Opportunities", plus the listed status values.

9. **Source discrepancies:** Blackbaud Knowledge 75298 is not an export article, and the intercom.help Bloomerang URL returns 404. — **confirmed.**
   - 75298 is titled "How to identify existing constituents when importing" (The Raiser's Edge) and "does not discuss exporting".
   - It says Constituent ID "is not a required field". Import IDs are long, are generated for every constituent, and can be damaged by editing in Excel. It says "When updating information other than biographical such as gifts and events use the import ID".
   - The intercom.help URL returned HTTP 404.

10. **The two Neon pages conflict on importing households/relationships, and the Virtuous pages conflict on passthrough limits.** — **unconfirmed.**
    - `support.neonone.com/.../4407409383821-Neon-CRM-Import-Field-Guide` returned HTTP 403 again.
    - A search for the exact phrase "will automate the creation of households and relationship links" found nothing.
    - A search for the Virtuous passthrough limit text ("up to 100" or one per gift) did not surface either page's body.
    - Both conflicts still rest only on the researcher's search snippets. The digest's own advice not to rely on either page stands.

### Missed within scope

1. **The repo already bans the CiviCRM "Both" trap, and recognition is deliberately unbounded.**
   - `CONTEXT.md:4469-4475` and `phase-14-donor-credit-operations.md:67, 440` name CiviCRM's combined hard+soft report option as a "documented double-counting footgun" and ban blended Legal + Recognition columns.
   - The digest never uses this when ranking export surfaces. A CiviReport or other report export using a combined credit option, or the RE community note that soft credits make exported totals wrong, would feed double-counted totals into reconciliation. Profiles should reject or flag blended-credit report columns.
   - Phase 14 (`phase-14-...md:67`) also makes recognition amounts "deliberately unbounded across parties — both-spouses-full is industry-legal". So RE soft-credit totals that exceed the gift amount (section 3.3) are admissible as recognition and are not a data-quality defect, as long as they never enter hard-credit or money totals.

2. **Bloomerang's split-gift omission is wider than fund designation.**
   - Bloomerang's own announcement (https://bloomerang.com/news/new-split-payments-in-bloomerang, 2018-11-06) says a payment can be split "across several campaigns, funds, appeals, tributes, custom fields" and across "multiple pledge installments, recurring donation schedules, or donations all at the same time". It adds that "the fund amounts for split payments are based on the splits".
   - Because the Database Export omits "Information about split gifts", it can lose the following, not only exact-sum designation lines:
     - per-split campaign, appeal and tribute attribution
     - payment-to-pledge-installment and payment-to-recurring-schedule application
   - Section 6.3's claim that pledge and recurring linkage is "rebuildable if parent IDs are present" therefore needs a further check: whether one payment can apply to several parents.

3. **Church-management systems (Planning Center Giving and similar) were not considered as ministry migration sources.**
   - Owner text already cites Planning Center as a precedent: the undo-after-merge hazard at `owner-constraints.md:384-385`.
   - Planning Center's help (https://help.planningcenter.com/en/importing-and-exporting-giving-information.html, search snippet only) says Giving reports export to CSV and that this is useful when moving to another platform. Its donation-history import documents limits of 152,000 rows and 30 MB.
   - For churches and smaller ministries, a church-management system may be the system of record rather than a nonprofit CRM. Section 9's ranking does not weigh that possibility. Treat this as [V*]: page bodies were not fetched.
