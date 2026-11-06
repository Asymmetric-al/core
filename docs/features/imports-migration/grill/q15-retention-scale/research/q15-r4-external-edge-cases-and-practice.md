# Q15 R4: External practice and edge cases for Option B

Researched 2026-11-03 using web search and page fetches. ICO and Salesforce Help pages blocked fetching. Labels follow r2: **[snippet]** = search excerpt only; **[unverified]** = no primary source; **[gap]** = nothing public; **[derived]** = my inference or arithmetic. This file does not repeat anything already in r2.

## 1. Retention and disposal practice

- **FTC order against Blackbaud (2024),** read from the order text ([D&O](https://www.ftc.gov/system/files/ftc_gov/pdf/Blackbaud-D%26O.pdf)):
  - **Definition 4.** "Delete" means data "not maintained in retrievable form and cannot be retrieved in the normal course of business".
  - **II.B.** Blackbaud may keep nothing "not necessary for the purpose(s)" for which it holds the data.
  - **III.A.** Blackbaud must publish and follow a schedule giving the purpose, the specific business need and "a set timeframe for Deletion … that precludes indefinite retention". This explicitly covers former and migrating customers.
  - **Legal-obligation carve-out.** Data kept for a legal obligation must be described. Its deletion must be confirmed within 30 days after the obligation ends.
- **Legal holds:**
  - In Microsoft Purview, "retention wins over deletion". eDiscovery holds preserve data "until an administrator manually releases the hold" ([Microsoft](https://learn.microsoft.com/en-us/purview/retention)).
  - GDPR Art 17(3)(e) exempts data needed for legal claims ([Art 17](https://gdpr-info.eu/art-17-gdpr/)).
- **Assurance:**
  - SOC 2 CC6.5 asks the entity to "identify data … for disposal" and "remove data … from entity control" ([KirkpatrickPrice](https://kirkpatrickprice.com/?p=14362)) **[snippet]**.
  - ISO 27001 A.8.10 auditors want deletion logs proving data is deleted on schedule ([ISMS.online](https://isms.online/iso-27001/checklist/annex-a-8-10-checklist)) **[snippet; not the standard's text]**.
- **NIST SP 800-88 Rev. 2 (September 2025):**
  - It moves to a sanitization programme and adds logical sanitization for the cloud.
  - Cryptographic erase now has strict preconditions ([NIST](https://csrc.nist.gov/pubs/sp/800/88/r2/final), [FAQ](https://csrc.nist.gov/files/pubs/sp/800/88/r2/final/docs/sp800-88r2-faq.pdf)) **[snippet]**.
- **Grace periods and notices:**
  - **Microsoft:** after a subscription ends, data is kept 90 days in a limited-function account and deleted within at most 180 days. Trials get 30 days ([Microsoft](https://learn.microsoft.com/en-us/compliance/assurance/assurance-data-retention-deletion-and-destruction-overview)).
  - **Atlassian:** Free sites are deactivated after 120 days without activity, after a warning that the site will be "cancelled in 30 days" ([community](https://community.atlassian.com/t5/Confluence-discussions/If-your-site-continues-to-remain-inactive-it-will-be-deactivated/td-p/2043944)) **[snippet]**.
- **GDPR timing and processor duties:**
  - A request must be answered "within one month", extendable by two months ([Art 12(3)](https://gdpr-info.eu/art-12-gdpr/)).
  - The processor assists with these rights (Art 28(3)(e)).
  - When services end, the processor deletes or returns the data, as the controller chooses (Art 28(3)(g)) ([Art 28](https://gdpr-info.eu/art-28-gdpr/)).

**Implication for Asym:**

- Publish the Switch schedule, giving its purpose, business need and timeframe.
- Every deletion checks for a hold, and only a named person can release one.
- Asym processes the data for the ministry, so its erasure must fit inside the ministry's one-month deadline.

## 2. Platform facts

- **Supabase Storage:**
  - **Size limits.** The global limit is up to 500 GB on Pro, and a bucket's limit can't exceed it. Buckets also take `fileSizeLimit` and `allowedMimeTypes` ([limits](https://supabase.com/docs/guides/storage/uploads/file-limits), [buckets](https://supabase.com/docs/guides/storage/buckets/creating-buckets)).
  - **Upload methods.**
    - Standard uploads are "ideal" up to 6 MB and work up to 5 GB. Resumable (TUS) uploads are recommended above 6 MB ([standard](https://supabase.com/docs/guides/storage/uploads/standard-uploads)).
    - TUS refuses to overwrite by default ("400 Asset Already Exists") ([resumable](https://supabase.com/docs/guides/storage/uploads/resumable-uploads)).
    - Signed upload URLs last 2 hours ([ref](https://supabase.com/docs/reference/javascript/storage-from-createsigneduploadurl)).
  - **Deletion.**
    - Deleted files are "permanently removed and not recoverable".
    - Deleting rows from `storage.objects` with SQL orphans the stored bytes ([delete](https://supabase.com/docs/guides/storage/management/delete-objects)).
    - S3 versioning is "not supported" ([S3](https://supabase.com/docs/guides/storage/s3/compatibility)).
    - The lifecycle API supports only `noncurrentVersionExpiration` and rejects expiring current objects ([lifecycle](https://supabase.com/docs/reference/javascript/file-buckets-updatebucketlifecycle)).
    - So deletion by age needs a scheduled job ([discussion](https://github.com/orgs/supabase/discussions/16651)) **[snippet]**. Supabase Cron jobs should run no more than 10 minutes ([cron](https://supabase.com/docs/guides/cron)).
  - **Signed download URLs.**
    - `expiresIn` is in seconds, with no stated maximum ([ref](https://supabase.com/docs/reference/javascript/storage-from-createsignedurl)).
    - Range requests (downloading from a byte offset) are undocumented ([third-party use](https://ark.sudovanilla.org/Infrastructure/zipline/commit/c0b2dda7da6a30ba920fe8fcb82bf3d1518db1fc)) **[unverified]**.
  - **Access control.** Uploads need an INSERT row-level security (RLS) policy on `storage.objects`, and the service key bypasses RLS ([access](https://supabase.com/docs/guides/storage/security/access-control)).
  - **Region and encryption.** `ca-central-1` exists ([regions](https://supabase.com/docs/guides/platform/regions)). "All customer data is encrypted at rest with AES-256" ([security](https://supabase.com/security)).
- **Vercel** ([limits](https://vercel.com/docs/functions/limitations)):
  - Request and response bodies are capped at 4.5 MB. Functions run at most 800 s on Pro, or 1,800 s in beta.
  - Streamed responses avoid the response cap ([guide](https://vercel.com/kb/guide/how-to-bypass-vercel-body-size-limit-serverless-functions)) **[snippet]**.
  - Montréal (`yul1`) is generally available ([changelog](https://vercel.com/changelog/introducing-the-montreal-canada-vercel-region-yul1)).
- **Inngest** ([limits](https://www.inngest.com/docs/usage-limits/inngest), [pricing](https://www.inngest.com/pricing)):
  - **Limits.** A step returns at most 4 MiB, and a run's state at most 32 MiB. A function has at most 1,000 steps. A run lasts at most 90 days on Pro.
  - **History.** Traces are kept 7 days on Pro.
  - **Concurrency.** Limits "count steps executing code, not all function runs". Singleton applies to whole runs, but within one function only ([concurrency](https://www.inngest.com/docs/guides/concurrency), [singleton](https://www.inngest.com/docs/guides/singleton)).
  - **Data.** Without encryption middleware, event and step data reach Inngest in plaintext ([encryption](https://www.inngest.com/docs/features/middleware/encryption-middleware)). Its data region is not published **[gap]**.

**Implication for Asym:**

- **Uploads.** Use TUS into a private bucket with overwrites off.
- **Disposal.** Run a daily sweep that calls the Storage API. Never sleep 15 months in Inngest.
- **Parsing large files.** A 2 GB parse must checkpoint across steps.
  - Fan out child runs per file or chunk. **[derived]** At 5,000 rows per step, 20M rows needs 4,000 steps, over the 1,000-step limit.
- **Inngest payloads.** Pass only IDs, byte offsets and counts, never rows.
- **One heavy job per ministry.** Enforce it with a database lease. A concurrency limit of 1 still lets runs interleave.

## 3. Digest matching

- **Web Crypto.** `digest` takes one whole buffer and can't stream. A streaming proposal (PR #390) is unresolved ([Deno](https://docs.deno.com/examples/hash_file_streams/), [W3C](https://lists.w3.org/Archives/Public/public-webapps-github/2025Jan/0024.html)) **[snippet]**.
- **hash-wasm.**
  - It hashes in chunks. `.save()` and `.load()` let one hash "span the work … across multiple processes".
  - It runs SHA-256 at about 426 MB/s on 1 MB inputs ([hash-wasm](https://github.com/Daninet/hash-wasm)).
  - **[derived]** A 2 GB file takes tens of seconds in a Web Worker.
- **What breaks the digest:**
  - Excel re-saves alter encoding, leading zeros and dates ([Splashtop](https://support-splashtoponprem.splashtop.com/hc/en-us/articles/39132067582361-How-to-Preserve-Leading-Zeros-When-Opening-CSV-Files-in-Excel)) **[snippet]**.
  - Excel loads at most 1,048,576 rows ("File not loaded completely"). Saving then truncates the file ([Microsoft blog](https://learn.microsoft.com/ko-kr/archive/blogs/josebda/loading-csvtext-files-with-more-than-a-million-rows-into-excel)) **[snippet]**.
  - **[derived]** Re-zipping, or re-saving an XLSX, rewrites timestamps.
- **BagIt (RFC 8493).** Each manifest line is "checksum filepath". A package is "valid" when every checksum verifies ([RFC 8493](https://www.rfc-editor.org/rfc/rfc8493.html)).

**Implication for Asym:**

- **The digest of record.** Compute it on the server while streaming the stored file, carrying the hash state between steps.
- **Hashing in the browser.** Use it only for early matching and a sign-off check that the ministry's saved copy is identical. This needs no upload.
- **ZIP files.** Match each file inside, using a manifest of name, size and SHA-256.
- **Guidance to ministries.** Keep the file exactly as downloaded, and never open and re-save it in Excel.

## 4. Large downloads

- **Google Takeout:** splits archives into 1–50 GB parts. Links last about 7 days, with 5 downloads, a password re-check and an email when the archive is ready ([Google](https://support.google.com/accounts/answer/3024190)).
- **HubSpot:** emails a link that expires after 30 days. It zips CSVs over 2 MB and keeps an export log for 3 years ([HubSpot](https://knowledge.hubspot.com/import-and-export/export-records)).
- **Salesforce:**
  - Weekly exports come as zips of about 512 MB, deleted about 48 hours after notice ([Spanning](https://www.spanning.com/blog/salesforce-data-export)) **[snippet]**.
  - Report export can require a high-assurance session ([Salesforce](https://developer.salesforce.com/docs/atlas.en-us.232.0.securityImplGuide.meta/securityImplGuide/security_auth_require_ha_session.htm)) **[snippet]**.
- **OWASP:**
  - Step-up authentication is required before sensitive operations ([ASVS](https://wiki.owasp.org/index.php/OWASP_Application_Security_Verification_Standard)) **[snippet]**.
  - It must be enforced on the server and tied to the action ([MASWE-0023](https://mas.owasp.org/MASWE/MASVS-AUTH/MASWE-0023/)).
- **Resuming a download:** request a `Range` from the first missing byte with `If-Match` on the ETag ([Databricks](https://docs.databricks.com/aws/en/volumes/files-api/range-requests)) **[snippet]**.

**Implication for Asym:**

- **Serving files.** Serve each file exactly as stored; repackaging changes digests.
- **Security.** Require a fresh MFA check, log each download and email the admins.
- **Links.** Issue 24-hour signed URLs on demand. **[derived]** 2 GB at 2 Mbit/s takes about 2.3 hours.
- **Resume.** Test Range requests on signed URLs before promising resume.

## 5. Edge cases

| Edge case                                           | Best-practice handling                                                     | Source                                                                                                                                                                                                                                    | Simplest handling for Asym                                                                                                                             |
| --------------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Erasure while Asym holds the export                 | Without undue delay, inside the controller's month                         | Art 12(3), 17, 28(3)(e)                                                                                                                                                                                                                   | Suppress on every parse from day 0. Rewrite within 14 days of the instruction. Record the old and new digests and the rows removed.                    |
| Person named in free text (notes, tributes, spouse) | Reasonable search **[unverified]**                                         | **[gap]** (ICO page blocked)                                                                                                                                                                                                              | Blank text cells that exactly match the person's name, email or ID. State this limit in the receipt.                                                   |
| Erasure applied on re-upload after deletion         | Keep a minimal suppression record. Hashed IDs are still personal data.     | [ICO](https://ico.org.uk/for-organisations/direct-marketing-guidance-and-resources/direct-marketing-checklist), [Hunton](https://www.hunton.com/insights/publications/edpb-advises-on-pseudonymisation-for-gdpr-compliance) **[snippet]** | Per-tenant keyed hashes (HMAC) of source IDs and emails, kept for the account's life and disclosed in the schedule                                     |
| The rewrite changes the digest                      | **[gap]**                                                                  | —                                                                                                                                                                                                                                         | Match on the original digest, then apply the erasure list                                                                                              |
| Ministry loses its copy                             | No restore after expiry                                                    | §4                                                                                                                                                                                                                                        | Copy check at sign-off. Notices 30 and 7 days before deletion. Afterwards, a fresh old-system export or manual entry.                                  |
| Ministry modifies its copy                          | Integrity means exact bytes                                                | RFC 8493                                                                                                                                                                                                                                  | Treat it as a new source with full review, never an Exact repeat                                                                                       |
| Account closes during the hold                      | Delete or return, as the controller chooses                                | Art 28(3)(g); Microsoft                                                                                                                                                                                                                   | Offer a download, then delete in the offboarding window if that comes first                                                                            |
| Legal hold                                          | Retention wins, and release is manual                                      | Purview; Blackbaud II                                                                                                                                                                                                                     | A hold flag blocks every sweep. After release the normal clock resumes, and anything past due is deleted within 30 days.                               |
| Auditor asks after deletion                         | Keep evidence, not the data                                                | CC6.5; Blackbaud                                                                                                                                                                                                                          | Show the run evidence and deletion receipt, and check the ministry's copy against the recorded digest                                                  |
| Backups after deletion                              | "Not retrievable in the normal course"                                     | Blackbaud Def. 4                                                                                                                                                                                                                          | Storage deletion is final. Receipts give the date staging backups expire. Reapply the erasure list after any restore.                                  |
| Abandoned Switch                                    | Deletion after inactivity, with warnings                                   | Atlassian; r2                                                                                                                                                                                                                             | 180 days without an owner action; viewing doesn't count. Warn 30 and 7 days before.                                                                    |
| CSV injection                                       | Neutralise `=` `+` `-` `@`, tab and CR. This fails after an Excel re-save. | [OWASP](https://community.owasp.org/attacks/CSV_Injection)                                                                                                                                                                                | Neutralise only files Asym generates. Error lists are not for re-upload ("+1…" phone numbers would be corrupted). Return the raw export byte for byte. |
| ZIP and XLSX bombs                                  | ZIP uploads discouraged; check size after decompression                    | [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)                                                                                                                                                      | One ZIP level holding only CSV and XLSX, at most 1,000 files, within the Switch cap, with a 100:1 ratio check. Stream it; never extract to disk.       |
| More rows than Excel holds                          | 1,048,576 rows per sheet                                                   | r2                                                                                                                                                                                                                                        | Reject XLSX above the limit. Warn not to open large CSVs in Excel.                                                                                     |

## 6. Undo windows for everyday imports

- **Planning Center:** 48 hours for People and 2 weeks for Giving (r2).
- **HubSpot:** no undo. Users delete the records an import created; updates can't be reversed ([HubSpot](https://knowledge.hubspot.com/import-and-export/view-and-analyze-previous-imports), [ideas](https://community.hubspot.com/t5/HubSpot-Ideas/An-quot-undo-import-quot-button/idi-p/442792)) **[snippet]**.
- **Salesforce:** Mass Delete selects by import time and user alias, 250 records per run. Updates and notes stay ([PDF](https://resources.docs.salesforce.com/204/latest/en-us/sfdc/pdf/salesforce_massdelete_undoimport.pdf)) **[snippet]**.
- **Bloomerang:** no undo was found **[gap]**. Bulk Delete is admin-only and permanent ([Bloomerang](https://help.bloomerang.com/en/articles/12632672-bulk-delete-transactions)) **[snippet]**.
- **Blackbaud RE NXT:** batches can be reversed and gifts unposted ([community](https://community.blackbaud.com/discussion/comment/310670)) **[snippet]**.
- **Little Green Light:** nothing public **[gap]**.
- **Xenett:** 14 days ([Xenett](https://docs.xenett.com/en/articles/6288886-bulk-import-undo-feature)) **[snippet]**.

**Implication for Asym:**

- The norm is to delete what an import created. Where a window exists, it runs from 48 hours to 14 days.
- Reversing an everyday import (Q12) needs only:
  - the IDs of the records it created;
  - the previous values of the fields it changed, kept for 14 days.
- It does not need the raw file.

## Corrections to Option B

1. **Erasure is too slow.** A 30-day rewrite can miss the ministry's one-month deadline. Suppress the person immediately and rewrite within 14 days.
2. **The digest lineage is missing.** A rewrite changes the digest. Record both digests, and match on the original.
3. **An exact-bytes digest is brittle for ZIPs.** Use a manifest of the files inside.
4. **There is no legal hold.**
   - Every deletion path checks for one: the final export, superseded exports, staging rows and the abandoned-Switch purge.
   - A hold is released only by a person.
5. **Account closure isn't covered.** Closing the account must cut the clock short (Art 28(3)(g)).
6. **"Must download" is unverifiable.** Add the check at sign-off where the browser hashes the ministry's copy.
7. **Scheduling.** There is no built-in Storage expiry, and Inngest runs are capped at 90 days. Use a daily sweep through the Storage API, never SQL.
8. **"One heavy job" isn't guaranteed.** Inngest concurrency counts steps, so use a database lease.
9. **Inngest is a hidden copy.** Any rows passed through it stay in run history for 7 days, in an unpublished region **[derived]**. Pass only IDs.
10. **The schedule is unpublished.** Publish it, following Blackbaud III.A.
11. **Error lists.**
    - Stream them, because responses are capped at 4.5 MB.
    - Neutralise formulas and mark the lists as not for re-upload.

## Simplest robust defaults

- Keep B's durations.
- **Uploads.** One private bucket in `ca-central-1`, uploaded with TUS, with overwrites off.
- **Digests.** The server SHA-256 is the digest of record. ZIPs get a manifest of the files inside, and the browser checks the ministry's copy at sign-off.
- **Disposal.** A daily sweep checks holds, deletes through the Storage API and writes a receipt. Notices go out 30 and 7 days before deletion.
- **Erasure.** Suppress on day 0, rewrite within 14 days, and keep HMAC suppression records.
- **Downloads.** Require fresh MFA, issue a 24-hour URL, log each download and email the admins.
- **Heavy jobs.** Enforce one per ministry with a database lease; Inngest carries IDs only.

## What not to build

- Cryptographic erase, or encryption keys per file or per person.
- Versioned buckets, an archive tier or repackaged exports.
- Split-archive generators.
- Error files designed to be fixed and re-uploaded.
- Deletion timers that sleep in Inngest.
- Fuzzy or normalised digest matching.
- Download caps or retention settings each tenant can adjust.
