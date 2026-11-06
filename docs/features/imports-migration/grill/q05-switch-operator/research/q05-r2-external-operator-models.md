# Q05-R2 — Who operates a migration: vendor, partner and support-access models

_Track: who runs a Switch in the first release: (A) ministry self-serve, (B) Asym specialist with approved, audited access, (C) partners, or (D) a mix._
_Research agent, read-only web research. Every URL accessed 2026-11-02._

Labels: **verified-vendor-doc** (vendor page fetched, quote checked) · **verified-primary** (contract, SOW or terms text fetched) · **secondary** (search snippet, third-party blog, job posting) · **unverified** (my inference). The fetch tool caps quotes at about 125 characters, so some are fragments.

**Blocked:** support.virtuous.org (403), help.salesforce.com (CSS error), developer.salesforce.com (403), support.tithe.ly (403), support.keela.co (403), Atlassian data-access FAQ (navigation only), Bloomerang's 2019 conversion-tier page (redirects).

## Summary

1. **Mid-market donor CRMs mostly convert with their own staff** (Bloomerang, Virtuous, DonorPerfect, Neon paid, Pushpay, Tithely). The customer exports, answers mapping questions and reviews a test load.
2. **Pure self-serve is the low-cost or church end** (Little Green Light, Planning Center, Funraise). Complex cases go to consultants. Partner-led is Salesforce's model.
3. **No vendor publishes self-serve completion rates.**
4. **The customer stays accountable even when the vendor operates.** Bloomerang: "You are responsible for ensuring the accuracy of the converted data". Remedies are re-work within a window.
5. **The modern support-access standard** is customer-approved, time-boxed, scoped, revocable, and logged under a distinct operator identity (Microsoft Customer Lockbox, Google Access Approvals, Shopify collaborators).

## 1. Vendor migration models

| Vendor                    | Who converts                                                                                                                                 | Cost                                                         | Timeline                                                   | Customer's part                                                                                                              | Label / URL                                                                                                                                         |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Bloomerang**            | In-house "onboarding specialists, conversion project managers, data migration specialists". Conversion only "If provided in your Proposal".  | Not published                                                | Not published; 12–14 weeks (third-party)                   | Cooperate; review test server within 14 days (§5)                                                                            | verified-vendor-doc: https://bloomerang.com/features/additional-services/data , https://bloomerang.com/tac                                          |
| **Virtuous**              | In-house Data Migration Specialist, who "will perform their own testing and validation"                                                      | Not published                                                | "a couple of months"; mapping 1–2 weeks                    | UAT "about 8-10 hours"; cleanup is the customer's: "We're movers, not cleaners."                                             | verified-vendor-doc: https://virtuous.org/blog/nonprofit-crm-migration/ (help-centre "we do NOT perform any de-duplicating" is secondary, page 403) |
| **DonorPerfect**          | In-house Data Conversion Specialist                                                                                                          | Quoted; "Additional fees may apply"                          | "about two weeks from the date the final data is received" | Sample data; 1-hour mapping call; "When the mapping document has been completed and approved, a conversion date will be set" | verified-vendor-doc: https://www.donorperfect.com/?p=38974                                                                                          |
| **Neon CRM**              | "from guided self-service to full-service data migration"; full service means Neon does "the heavy lifting of mapping"                       | Not published                                                | "8-12 weeks depending on your system complexity"           | Deliverables on time                                                                                                         | verified-vendor-doc: https://neonone.com/solutions/neon-crm-overview/neon-crm-pricing/ , https://neonone.com/client-faq/                            |
| **Little Green Light**    | Customer (Flex Importer): "we don't migrate data in-house and are not consultants"; complex cases go to a consultant                         | None from LGL                                                | —                                                          | Everything                                                                                                                   | verified-vendor-doc: https://help.littlegreenlight.com/article/271-migrating-to-lgl-from-your-current-system                                        |
| **Kindful**               | Discontinued; upgrade path to Bloomerang                                                                                                     | —                                                            | —                                                          | —                                                                                                                            | secondary: https://bloomerang.co/learn/kindful-upgrade-resource                                                                                     |
| **Blackbaud RE NXT**      | Blackbaud Conversion Analyst with the client team; Accredited Implementation Partners also exist                                             | Set by SOW; Essential 1 test run, Pro 2 (G-Cloud, secondary) | —                                                          | Extract legacy data; validate test run one                                                                                   | verified-primary (§5)                                                                                                                               |
| **Salesforce NPC / NPSP** | Implementation partners                                                                                                                      | $7k–$30k full implementation (blog)                          | —                                                          | Varies                                                                                                                       | secondary: https://www.fexle.com/blogs/salesforce-non-profit-cloud-cost/                                                                            |
| **Planning Center**       | Customer (People and Giving importers). Support helps only with attendance; third parties are listed under "Migration and consulting".       | None from Planning Center                                    | —                                                          | Export, map, import                                                                                                          | verified-vendor-doc: https://help.planningcenter.com/en/179948-switching-to-planning-center-from-another-chms-guide.html                            |
| **Pushpay**               | "dedicated implementation specialist" who "owns the timeline, configures your account, oversees data import"                                 | "In many cases, we cover the cost of overlapping systems"    | Five steps                                                 | "You'll approve the configured environment before launch."                                                                   | verified-vendor-doc: https://pushpay.com/resources/migration/                                                                                       |
| **Tithely / Breeze**      | Tithely staff, free, within 7 days; self-service option                                                                                      | Free                                                         | 7 days                                                     | Send files                                                                                                                   | secondary: https://capterra.com/p/132513/Breeze-ChMS/                                                                                               |
| **Givebutter**            | Free "Magic Data Extraction" (team extracts and maps; customer reviews, dedupes, imports) or Premium ($2,500; team cleans, dedupes, imports) | Free / $2,500                                                | "depends on your platform"                                 | Review, clean, import (free tier)                                                                                            | verified-vendor-doc: https://givebutter.com/features/magic-migration                                                                                |
| **Keela**                 | Implementation Specialist                                                                                                                    | —                                                            | "a few days to several weeks"                              | —                                                                                                                            | secondary: https://aitoolsbakery.com/blog/nonprofit-crm-migration/                                                                                  |
| **Donorbox**              | Self-serve CSV import; migrations form for recurring donors; PayPal recurring not supported                                                  | —                                                            | —                                                          | —                                                                                                                            | secondary: https://donorbox.org/migrations                                                                                                          |
| **Aplos**                 | Paid onboarding team ("$500 OFF implementation services") plus self-serve guides                                                             | Quote                                                        | —                                                          | —                                                                                                                            | secondary: https://www.aplos.com/compare/quickbooks-for-churches                                                                                    |
| **Funraise**              | Self-serve: "Funraise's team does not provide support for undoing or cleaning up a bulk import." "An import is final."                       | —                                                            | 2–8 weeks (blog, secondary)                                | Build ID lookups; verify first                                                                                               | verified-vendor-doc: https://university.funraise.org/lesson/data-migration                                                                          |
| **Dataro**                | Not applicable: a prediction layer on top of a CRM                                                                                           | —                                                            | —                                                          | —                                                                                                                            | secondary: https://support.dataro.io/knowledge/connections-data                                                                                     |

**What agreement covers vendor staff.** No vendor uses a separate access agreement; staff work under the master agreement plus the proposal or SOW (verified-primary):

- **Bloomerang §2.1** lets it use contractors "while remaining liable". §2.2 keeps "Original data files … for 90 days after the final conversion date".
- **Blackbaud SOW** item 20: "Client agrees to provide a remote connection to the Solution(s)". Files go "via Secure FTP".
- **Neon §4.1.1** counts profiles "created by a Neon One employee at the instruction of the Customer" as Authorized Users. https://neonone.com/product-terms/neon-crm/

**After go-live:** Pushpay's specialist "stays close through the first giving cycles". Virtuous runs a "Post-Live" workshop. Bloomerang offers free chat and email.

## 2. Self-serve success and failure evidence

**Hard data: none for nonprofits.** The figures that circulate are enterprise-wide or unsourced:

- **Bloor (secondary).** A 2008 post says over 80% of migration projects overran time or budget (Standish 1999; Bloor 2007). These were enterprise projects. The "83% (Gartner)" figure has no primary source I could find. https://www.bloorresearch.com/?p=10860
- **Flatfile, around 2020 (secondary).** 23% of software companies said customer imports take weeks or months, and 96% hit problems. Original survey not found.
- **Giveffect, "55% fail" (unverified).** No study named.

**Vendor effort estimates (opinion):**

- Givebutter: with clean data "the import itself usually takes one to two days of active work", but prep "can stretch the full project to several weeks". (verified-vendor-doc) https://givebutter.com/blog/crm-data-migration
- Virtuous UAT takes 8–10 hours; DonorPerfect's mapping call is 1 hour plus follow-ups.

**Failure points in vendors' own docs** (verified-vendor-doc unless marked):

- **IDs:** LGL says it is "critical to test what you believe to be unique IDs".
- **Gift structure:** LGL has no split gifts; it reads the first fund only, and a missing date becomes the import date.
- **Irreversibility:** Funraise: "An import is final."
- **Duplicates:** Virtuous won't dedupe.
- **Recurring gifts:** Givebutter: "It is your responsibility to ensure no one is double-charged." (secondary)
- **Unimportable data:** Planning Center: "No import options are available for Groups data."
- **Reconciliation:** compare "transaction counts and dollar totals by year, campaign, fund, and payment type", but "numbers alone don't tell you whether the migration worked." (secondary) https://charityengine.net/blog/nonprofit-crm-migration-guide/

**Revealed preference (unverified).** Givebutter competes on simplicity yet added assisted and $2,500 managed tiers. Every mid-market vendor above employs conversion staff. So self-serve suits clean, simple data, and gift history at scale gets human help.

## 3. Vendor support access

| Product                               | Approval                                                                                                                           | Time limit                                                  | Scope                          | Audit / identity                                                                                                                   | Label                                                                                                                                                                  |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Microsoft Customer Lockbox**        | Request carries the "service request number"; Microsoft manager, then customer approver; expires if not approved "within 12 hours" | "maximum period … is 4 hours", then "automatically revoked" | "pre-approved cmdlets"         | "All actions performed by a Microsoft engineer are logged" as **"Microsoft Operator"**; internal approver "can't be the requestor" | verified-vendor-doc: https://learn.microsoft.com/purview/customer-lockbox-requests                                                                                     |
| **Google Workspace Access Approvals** | Admin approves or declines in the Alert center                                                                                     | "Approve access for 5, 15, or 30 days"                      | "Scope of the data access"     | "surfaced in the Access Transparency logs"; paid add-on                                                                            | verified-vendor-doc: https://knowledge.workspace.google.com/admin/security/access-approvals-require-google-staff-to-request-approval-before-viewing-support-data?hl=en |
| **Google Cloud Access Approval**      | "explicit approval"                                                                                                                | "may be revoked at any time"                                | Enrolled services              | Exception: "automatically approved" in outages                                                                                     | verified-vendor-doc: https://docs.cloud.google.com/assured-workloads/access-approval/docs/overview                                                                     |
| **Atlassian Cloud**                   | Admin clicks "Approve data access" on the ticket; optional Guard approval                                                          | Revoked when the ticket closes                              | Per ticket                     | Actions logged; the grant is missing from the org audit log (ACCESS-2164)                                                          | secondary: https://jira.atlassian.com/browse/ACCESS-2164                                                                                                               |
| **Shopify collaborators**             | Request code; "The decision to accept a request is always yours"                                                                   | Expires after 90 days without login                         | Owner grants all, some or none | "name and actions are still listed in any relevant timelines"; separate user type                                                  | verified-vendor-doc: https://help.shopify.com/manual/your-account/staff-accounts/collaborator-accounts                                                                 |
| **Salesforce Grant Login Access**     | User picks a duration                                                                                                              | User-chosen; revocable                                      | As the user                    | **Logs in as the named user**; "Salesforce audits all actions taken while logged in as another user"                               | secondary: https://support.veeva.com/hc/en-us/articles/360005884093-How-to-Grant-Login-Access-in-Salesforce                                                            |
| **Zendesk account assumption**        | Admin enables                                                                                                                      | "One day … One year, or Indefinitely"                       | Acts as an agent               | "reserves the right to assume the role of an agent … without prior notice"                                                         | verified-vendor-doc: https://support.zendesk.com/hc/en-us/articles/4408824477082                                                                                       |
| **HubSpot**                           | "by default, HubSpot employee access is toggled on"                                                                                | Not documented                                              | "most parts of your account"   | Not documented                                                                                                                     | verified-vendor-doc: https://knowledge.hubspot.com/account/get-help-with-hubspot                                                                                       |
| **Stripe, Intercom**                  | No customer grant feature found                                                                                                    | —                                                           | —                              | —                                                                                                                                  | unverified                                                                                                                                                             |

**The modern standard**, taken from the strongest examples:

- access tied to a referenced request;
- explicit customer approval, where silence means expiry, not consent;
- hours-to-days limits with auto-revocation;
- a scoped grant;
- a **distinct operator identity** rather than impersonation;
- a customer-searchable audit log;
- internal two-person approval.

Salesforce, Zendesk and HubSpot show the older pattern: impersonation, indefinite windows, or access on by default.

## 4. Partner ecosystems

- **Salesforce:** a Specialist needs ≥1 credentialed person, 3 projects and CSAT ≥4.2. An Expert needs 10 projects, 5 credentialed people and CSAT ≥4.4. The nonprofit partner network was folded into AppExchange. (secondary) https://www.salesforce.com/en-us/wp-content/uploads/sites/4/documents/partners/readiness/consulting-msp-navigator.pdf
- **Blackbaud:** lists "Accredited Implementation Partners" but keeps its own conversion team. (secondary)
- **Virtuous:** Service & Implementation partners "specialize in onboarding, data migration, and product training" and "complete Virtuous Academy certifications". No numeric thresholds; "Tiering isn't a points-based system." (verified-vendor-doc) https://docs.virtuous.org/virtuous/partners/partner-types-and-tiers.md
- **Bloomerang:** pays $250 per closed referral; certification covers only product connectors; conversion stays in-house. (secondary) https://bloomerang.co/learn/consultant-partner-program/
- **Planning Center and LGL:** list third parties but don't vouch for them. Planning Center: "PCOMVP provided all content for this page."

**For an early-stage vendor (unverified):**

- **Benefits:** scale without headcount; some ministries already have consultants.
- **Risks:**
  - Every certifying vendor above first had a large installed base and an academy.
  - Partner quality is policed by CSAT and project counts that a new vendor lacks.
  - Each partner is another privileged party holding donor and financial data, needing its own terms, offboarding and audit.
  - Errors still read as "Asym lost our gift history".
  - Partners, not Asym, capture the learning needed for self-serve.

## 5. Accountability: sign-off and liability

**Contract language (verified-primary):**

- **Bloomerang §2.2** (https://bloomerang.com/tac): "You are responsible for ensuring the accuracy of the converted data throughout the implementation process." Also: "We will correct any issues or problems which are reported to us within fourteen (14) days" / "after data is placed onto the testing server for review, which shall be your exclusive remedy" / "and our only liability for any inaccuracy in the converted data." §9: "We will not be liable in any event for loss or inaccuracy of data", capped at 12 months' fees.
- **Blackbaud SOW** (https://webfiles-sc1.blackbaud.com/files/sow/acsrenxtcommfpenc_eff_20210421.pdf): "Client is responsible for the accuracy of all data presented to Blackbaud"; "Client is responsible for extracting data from any of Client's legacy systems"; "after Acceptance, each Deliverable will be transitioned to Client and will no longer be within the control of Blackbaud Services." Missed duties may need "a Change Order".
- **Blackbaud module SOW** (https://webfiles-sc1.blackbaud.com/files/sow/nxtreb2bmodimpnxt1raisersedgenxt1module.pdf): "Work with your organization to validate test run one and modify the data mapping document".
- **Neon §4.1.2(b):** the customer must "be responsible for the accuracy, completeness, timeliness, reliability, quality and legality of Customer Data".
- **Salesforce MSA:** "accuracy, quality and legality of Customer Data" (secondary).

**Process sign-offs (verified-vendor-doc):**

- **DonorPerfect:** mapping approval comes before conversion. Its 2013 checklist adds "Screen Appointment/Approval" and "System Testing" before activation: https://uploads.donorperfect.com/PDF/DPV-DPO-Conversion-ENHANCED.pdf
- **Pushpay:** pre-launch approval.
- **Virtuous:** customer UAT, with no formal sign-off described.

**Gap:** no vendor documents a reconciliation sign-off against old-system totals. Asym's planned sign-off is stricter than published practice.

## Common pattern

1. **The vendor operates and the customer is accountable.** Named vendor staff work in customer data under the master agreement plus an SOW. Contracts assign accuracy to the customer and limit remedy to fixes reported within a window.
2. **The customer has three gates:** approve the mapping, validate a test load, approve before launch.
3. **Cleanup and dedupe are scoped out or sold separately.**
4. **Pure self-serve is the low-price end,** with irreversible imports and consultant referrals.
5. **Partners are a scale mechanism** for vendors with large bases, not a launch mechanism.
6. **Support access has moved** from impersonation and indefinite grants to approval-gated, time-boxed, scoped access under a distinct, audited operator identity.

## Implications for Q05 (inference)

1. **(B) or (D) matches Asym's segment.** Ministries resemble Bloomerang, Virtuous, DonorPerfect and Pushpay customers. (A) alone is the low-cost tier's model, and (C) needs an ecosystem Asym lacks.
2. **If (B), build the Lockbox pattern, not impersonation:**
   - a ministry-approved request tied to a Switch;
   - auto-expiry at go-live or closure;
   - scope limited to Switch actions;
   - a distinct "Asym operator" on every audit row, visible to the ministry;
   - revocable by the ministry;
   - never on by default or indefinite.
3. **Keep the ministry's attestation and reconciliation sign-off non-delegable.** Add a Bloomerang-style correction window and exclusive-remedy clause, with counsel review.
4. **Have the specialist use the same in-product tools a self-serve admin would,** and log time and failure points. That turns (B) into evidence for later self-serve (the Givebutter tiered path).
5. **Defer partners** until there is an installed base, a certification curriculum and partner data-processing terms.
6. **State scope explicitly:** cleanup, dedupe and recurring-donor outreach are either in the Switch or the ministry's job.
