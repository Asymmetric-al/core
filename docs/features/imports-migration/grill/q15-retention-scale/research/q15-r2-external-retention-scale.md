# Q15 R2: External practice on retaining Switch artifacts, and how big a Switch can be

Researched 2026-11-03 (web search plus page fetches; the ICO site and some Salesforce pages returned HTTP 403). **[snippet]** = search excerpt only; **[unverified]** = no primary source; **[gap]** = nothing public; **[derived]** = my arithmetic. Unlabelled claims were read on the cited page. Builds on `q13-r5` §1 and §4 and ADR-IM-006 without repeating them.

## 1. How vendors retain import files, staging and error files

- **Salesforce Bulk API 2.0:** jobs are deleted permanently after 7 days, and results can be retrieved only within 7 days ([limits](https://developer.salesforce.com/docs/platform/salesforce-app-limits-cheatsheet/guide/salesforce-app-limits-platform-bulkapi.html)) **[snippet]**.
- **HubSpot:**
  - The original file can be downloaded only "for imports completed within the last six months", and only by the importer or a Super Admin ([imports](https://knowledge.hubspot.com/import-and-export/view-and-analyze-previous-imports)).
  - Error files have no stated window. Sensitive values appear in them as "REDACTED" ([errors](https://knowledge.hubspot.com/import-and-export/troubleshoot-import-errors)) **[snippet]**.
- **Planning Center:** imports can be undone for a limited time:
  - 48 hours for People ([People](https://help.planningcenter.com/en/138558-import-a-csv-file-in-people.html));
  - two weeks for Giving history ([Giving](https://help.planningcenter.com/en/154395-import-donation-history.html)).
- **Flatfile:** 365 days by default. This is an Enterprise feature, and deletion can run ±7 days from the set date ([Flatfile](https://flatfile.com/docs/guides/data-retention)).
- **OneSchema:** uploads are "automatically deleted after seven (7) days by default", configurable from 1 hour to 90 days ([OneSchema](https://docs.oneschema.co/docs/data-retention-policies)).
- **Blackbaud, Virtuous, Bloomerang, DonorPerfect and Neon:** none publishes how long it keeps conversion source files **[gap]**. A template contract clause destroys legacy copies "six months after the data conversion process is completed" ([Law Insider](https://www.lawinsider.com/clause/data-conversion/_7)) **[snippet]**.
- **FTC order against Blackbaud (2024):**
  - Blackbaud kept data "for years longer than was necessary", including data of former customers.
  - The order requires a schedule saying why data is kept and when it is deleted.
  - It was the FTC's first standalone count for unreasonable retention.
  - Sources: [FTC](https://www.ftc.gov/news-events/news/press-releases/2024/05/ftc-finalizes-order-blackbaud-related-allegations-firms-security-failures-led-data-breach), [Akin](https://akingump.com/en/insights/blogs/ag-data-dive/ftcs-proposed-settlement-with-blackbaud-requires-data-deletion-and-data-governance) **[snippet]**.

**Implication for Asym:**

- Self-serve tools keep raw files for 7 days to 6 months, and undo windows run from 48 hours to 2 weeks.
- Promising that later families come "only from the retained final export" needs longer custody than these tools give. That custody needs a stated purpose and a hard end date.
- Keeping donor-CRM source data indefinitely is now a direct US regulatory risk.

## 2. Law and assurance

- **UK GDPR:** keep data no longer than needed. Set standard retention periods, review them, then erase or anonymise ([ICO](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/storage-limitation/)) **[snippet]**.
- **PIPEDA (Canada):**
  - "Institute maximum and minimum retention periods that take into account any legal requirements."
  - "Dispose of personal information that … no longer fulfills its intended purpose."
  - Source: [OPC](https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/p_principle/principles/p_use/).
- **US states:** the CCPA generally excludes nonprofits. Colorado has no nonprofit exemption, and Oregon has covered nonprofits since July 2025 ([Wiley](https://wiley.law/alert-New-State-Privacy-Laws-May-Apply-to-Nonprofit-Organizations)) **[snippet]**.
- **Tax records are the ministry's duty:**
  - **CRA:** 6 years for books; 2 years for duplicate receipts.
  - **IRS:** 3 years by default. It is 6 years if income was under-reported by more than 25%, and 7 years for bad-debt or worthless-securities claims ([IRS](https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records)).
- **Audit, by analogy:** under AU-C 230 an audit firm keeps its workpapers 5 years, or 7 for public-company audits ([summary](https://open-exam-prep.com/study-guides/cpa-aud/final-evaluation-documentation/audit-documentation-retention)) **[snippet]**. Aggregate evidence should outlive row-level copies.
- **SOC 2 C1.2:** confidential information is destroyed when its retention period ends. Auditors sample the deletion records for each customer ([Linford](https://linfordco.com/blog/data-retention-policy-soc-2/)) **[snippet]**.
- **Backups:**
  - The ICO accepts backup data put "beyond use" until it is overwritten ([ICO](https://ico.org.uk/for-organisations/guide-to-dp/guide-to-the-uk-gdpr/individual-rights/right-to-erasure)) **[snippet]**.
  - Supabase keeps daily backups for 7 days (Pro), 14 days (Team) and up to 30 days (Enterprise). Point-in-time recovery keeps up to 28 days.
  - "Database backups do not include objects you store via the Storage API" ([Supabase](https://supabase.com/docs/guides/platform/backups)).

**Implication for Asym:**

- No law requires Asym to keep raw exports.
- The ministry's tax and audit duties are met by the committed history, aggregate evidence and the ministry's own copy of its export.
- The law does require a purpose, a maximum period, deletion and proof of deletion.
- A deleted Storage file has no copy in Supabase's database backups. Staging rows remain in database backups until the backup window ends, so receipts state that date.

## 3. Erasing one person from retained files

- **EDPB enforcement report, February 2026 (§4.2.6):**
  - Where backups aren't edited, organisations "should have appropriate procedures to keep track of erasure requests and comply with them on restored systems."
  - Controllers should be able to "demonstrate such erasure."
  - One practice it noted is overwriting personal data with random strings.
  - Source: [EDPB](https://www.edpb.europa.eu/system/files/2026-02/edpb_cef-report_2025_right-to-erasure_en.pdf).
- **Crypto-shredding:**
  - NIST defines cryptographic erase as destroying the encryption key ([NIST](https://csrc.nist.gov/glossary/term/CE)) **[snippet]**.
  - Key granularity must be designed in from the start, and no regulator has explicitly endorsed it ([Encryption Consulting](https://www.encryptionconsulting.com/introduction-to-crypto-shredding/)) **[snippet]**.
  - A key per file proves a whole file was destroyed, but cannot remove one person from inside it.

**Implication for Asym:**

- A retained final export is meant to be used, so it is not a backup that can be put "beyond use".
- Two controls are enough:
  1. **Suppression list.** Erased or suppressed source IDs are skipped on every parse and every later import. This is the EDPB's "restored systems" pattern.
  2. **Redact and reseal.** On a valid request, write a new file without that person's rows. Record the old digest, the new digest and the rows removed, then destroy the original.
- Requests are rare, so encrypting each person separately is overkill.

## 4. How big a Switch can be

- **Vendor limits:**
  - **HubSpot (paid):** 512 MB and 1,048,576 rows per file ([HubSpot](https://knowledge.hubspot.com/import-and-export/set-up-your-import-file)).
  - **Salesforce:** the Import Wizard takes 50k rows and Data Loader up to 5M ([Trailhead](https://trailhead.salesforce.com/lex_implementation_data_management/lex_implementation_data_import)) **[snippet]**.
  - **Dataverse:** 8 MB per file ([Microsoft](https://github.com/MicrosoftDocs/power-platform/blob/main/power-platform/admin/import-data-all-record-types.md)) **[snippet]**.
- **Excel and XLSX:**
  - An Excel sheet holds at most 1,048,576 rows ([Microsoft](https://support.microsoft.com/en-us/office/1672b34d-7043-467e-8e27-269d656771c3)) **[snippet]**.
  - An XLSX file is a zip archive. Apache POI rejects any part that compresses to less than 1% of its size as a zip bomb ([POI](https://poi.apache.org/apidocs/5.0/org/apache/poi/openxml4j/util/ZipSecureFile.html)) **[snippet]**.
  - SheetJS reads the whole file into memory. Its 300k-row test file is about 20 MB ([SheetJS](https://docs.sheetjs.com/docs/demos/bigdata/stream)) **[snippet]**.
- **Supabase and Vercel:**
  - **File size:** up to 500 GB per file on Pro ([limits](https://supabase.com/docs/guides/storage/uploads/file-limits)).
  - **Uploads:** standard uploads are "ideal" up to 6 MB ([standard](https://supabase.com/docs/guides/storage/uploads/standard-uploads)). Resumable (TUS) uploads use 6 MB chunks, and each upload URL is valid for 24 hours ([resumable](https://supabase.com/docs/guides/storage/uploads/resumable-uploads)).
  - **Vercel request bodies:** capped at 4.5 MB, so files must go directly to Storage ([Vercel](https://vercel.com/kb/guide/how-to-bypass-vercel-body-size-limit-serverless-functions)) **[snippet]**.
- **Load speed:** Postgres COPY loaded 1M rows in 1.29 seconds ([benchmark](https://karan.is-a.dev/blog/postgres-copy-ingest/1m-rows-into-postgres-in-1-29-seconds)) **[snippet]**. Typed owner commands will be far slower **[unverified]**.
- **Fairness between tenants:** Inngest offers a concurrency limit per tenant key ([Inngest](https://www.inngest.com/docs/durable-execution/flow-control/multi-tenancy)) **[snippet]**.
- **Export sizes [derived]:** about 0.5–1 KB per person row and 150–300 bytes per gift row.

| Ministry    | People file | Gifts | Gift file   |
| ----------- | ----------- | ----- | ----------- |
| 10k donors  | 5–10 MB     | ~0.4M | 60–120 MB   |
| 100k donors | 50–100 MB   | 1M–4M | 0.15–1.2 GB |
| 500k donors | 250–500 MB  | ~5M   | 0.75–1.5 GB |

**Implication for Asym:**

- The largest plausible Switch is a few GB: a bulk load, not a storage problem.
- The real limits are memory when reading XLSX and the length of the commit step.
- CSV is the format for scale. XLSX gets a small cap.

## 5. Practice and sandbox copies

- **Salesforce:**
  - Full sandboxes copy production data unmasked unless Data Mask is used ([Salesforce](https://www.salesforce.com/blog/data-mask-secure-sandbox/)) **[snippet]**.
  - A sandbox not used for 180 days is deleted, with warnings at 90, 120 and 150 days ([Salesforce Ben](https://www.salesforceben.com/advanced-sandbox-concepts-for-salesforce-admins/)) **[snippet]**.
- **Microsoft:** developer environments are disabled after 30 days without use and deleted 15 days later ([cleanup](https://learn.microsoft.com/power-platform/admin/automatic-environment-cleanup)) **[snippet]**.
- **UK Ministry of Justice:** test data "must not contain any live data" by default ([MoJ](https://security-guidance.service.justice.gov.uk/using-live-data-for-testing-purposes)) **[snippet]**.

**Implication for Asym:** ADR-IM-006 (14 days plus one extension) is already stricter than these norms. Keep it as it is, and add only a purge for practice runs left unused.

## 6. Read-only access to the old system

- Practitioners advise keeping it read-only "for approximately six months" ([Prospeo](https://prospeo.io/s/crm-data-migration)).
- A nonprofit vendor advises keeping it until "the new one is verified and you have signed off" ([Argenta](https://argentasoftware.com/blog/switching-nonprofit-software-without-losing-your-data)).
- SaaS vendors often allow only 30–90 days to export after termination ([DocuWare](https://knowledgecenter.docuware.com/docs/docuware-cloud-data-handover)) **[snippet]**.
- SiteStacker's exit terms are not public **[gap]**.

**Implication for Asym:**

- Asym can't count on SiteStacker staying readable, so the retained final export is the insurance.
- Ministries should keep their own copy of the export. Where they can, they should also keep read-only access through their first year-end statements.

## Recommended defaults (opinionated, simple)

Clocks start at **Switch sign-off**. Every deletion writes a receipt with no personal data: the artifact, its digest, the row count, the deletion time and the date backups expire. Families that Q14 leaves with the ministry never enter Asym custody; only their digest is recorded.

| Artifact                            | Default                                                                                                                                                                                                                                                                                                                                                                                                                 | Why                                                                                                                                                                                                |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| (a) The signed-off final export     | **12 months.** One ministry extension of **12 months** while a Visible exclusion is pending. Hard stop at **24 months**. Deleted early once every exclusion is imported or declined. The ministry downloads its own copy at sign-off. Later corrections need a fresh export or a manual fix.                                                                                                                            | Any 12 months includes one year-end receipting season, when history errors surface. Longer than HubSpot's 6 months because Asym promises later imports. The hard stop answers the Blackbaud order. |
| (a) Practice and superseded exports | Deleted **30 days after being superseded**. All are gone at sign-off, or 30 days after an abort.                                                                                                                                                                                                                                                                                                                        | Only the final export feeds later imports and corrections.                                                                                                                                         |
| (b) Parsed staging rows             | Deleted **30 days after sign-off**. Later imports re-parse the final export. A Switch idle for **180 days** (warnings at 90 and 150) is purged.                                                                                                                                                                                                                                                                         | Committed rows already live in their owners' homes with Source Record Bindings. Extra staging copies only lengthen backup exposure.                                                                |
| (c) Error and waiting rows          | No stored files. Downloads are generated on demand behind a short-lived link. Waiting rows live in staging and die with it. Their counts are kept in the evidence.                                                                                                                                                                                                                                                      | Vendors treat error files as temporary. A stored error file is another copy of personal data.                                                                                                      |
| (d) Practice copies                 | ADR-IM-006 unchanged.                                                                                                                                                                                                                                                                                                                                                                                                   | Already stricter than Salesforce or Microsoft.                                                                                                                                                     |
| (e) Run evidence                    | Aggregates only: counts, totals, digests, mappings, headers and sign-off names. Kept **for the life of the tenant**, included in the offboarding export, deleted with the tenant. Exception lists that name people are treated as staging (b).                                                                                                                                                                          | Supports the ministry's 5–7-year tax and audit lookback without keeping donor rows.                                                                                                                |
| Erasure                             | Suppression list applied on every parse. Redact and reseal the final export on a valid request. The receipt states when backups expire (up to 30 days).                                                                                                                                                                                                                                                                 | Follows the EDPB practice, and the deletion can be shown.                                                                                                                                          |
| Size limits                         | CSV up to **2 GB** per file. XLSX up to **50 MB** [derived: about 700k rows], with at most 1 GB uncompressed and the 1% compression check. Each Switch up to **10 GB** and **20M rows**, designed around 500k people and 5M gifts. Larger Switches get a capacity review but use the same path. Uploads go resumably and directly to Storage. CSV is parsed as a stream. One parse or commit runs per tenant at a time. | Leaves headroom over a 500k-donor ministry and keeps XLSX reading within memory.                                                                                                                   |

## What not to build

- A retention engine per country or jurisdiction (consistent with Q13).
- Indefinite archives of raw files, or Asym acting as the ministry's tax-records store.
- Encryption per person or per row, or crypto-shredding to erase one person.
- Stored or emailed error files.
- Retention settings each tenant can adjust; one extension button is enough.
- Cold storage or an archive tier.
- Server-side reading of large XLSX files, or split-and-parallelise logic for files under the caps.
- Restoring a deleted raw file from backups.
