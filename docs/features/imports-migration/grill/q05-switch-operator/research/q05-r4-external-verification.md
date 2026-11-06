# Q05-R4 — External verification of the Q5 decision (operator access, helpers, compliance, duty of care)

_Read-only web research. It extends `q05-r2` and does not repeat it. Every URL was accessed on 2026-11-02._

**Labels:** **VP** = verified-primary (statute, regulator, or the organisation's own page, fetched) · **VD** = verified-vendor-doc (vendor page fetched, quote checked) · **S** = secondary (search snippet, law-firm or third-party summary) · **U** = unverified (my inference).

**Blocked:** Salesforce help and admin blog, support.neonone.com, legisquebec.gouv.qc.ca and Baptist Press (all 403); the Atlassian KB (navigation only); the GitHub Enterprise Cloud impersonation page and the Trailhead module (both 404). Not found: an Auth0 or GitHub Support staff-access grant.

## 1. Customer-approved vendor access in detail

| Product                                     | Who approves                                                                                                                       | Duration                                                                                                                        | Scope                                                         | Vendor identity in the customer's log                                                                                   | Revocation                                               | Can the vendor approve for the customer?                                                                                                                        | Label / URL                                                                                                                                                                                     |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Microsoft Customer Lockbox**              | "Global Administrators and anyone assigned the Customer Lockbox access approver" role. A Microsoft Support manager approves first. | Pending requests expire after 12 hours. Access is capped at "4 hours".                                                          | "pre-approved cmdlets"                                        | A generic **"Microsoft Operator"**, not a named engineer. The approval is logged as `Set-AccessToCustomerDataRequest`.  | Revoked automatically at expiry.                         | No: "Only a Global Administrator in your organization can specify who can approve". It is not available for law-enforcement requests. Requires E5 or an add-on. | VD https://learn.microsoft.com/en-us/purview/customer-lockbox-requests                                                                                                                          |
| **Google Cloud Access Approval**            | Holder of `roles/accessapproval.approver`. The role "doesn't provide any IAM role or any new permission to the Google employee".   | The approver "select[s] the date and time when you want the access to expire". Unapproved requests are dismissed after 14 days. | Selected services, at project, folder or organisation level.  | Access Transparency logs. Workspace logs show the "actor's home office" and the justification, not a name (S).          | "may be revoked at any time"                             | Partly: requests "may be automatically approved … to address time-sensitive outages".                                                                           | VD https://docs.cloud.google.com/assured-workloads/access-approval/docs/approve-requests and `/overview`; S https://knowledge.workspace.google.com/admin/reports/access-transparency-log-events |
| **AWS support permits**                     | The customer creates a permit after an AWS Support request.                                                                        | Optional `allowAfter`/`allowBefore` window. The permit goes "INACTIVE automatically when the linked support case closes".       | Per action (e.g. `rds:ReadClusterData`) and per resource ARN. | Requests reach the customer through EventBridge and CloudTrail.                                                         | Delete the permit and revoke the KMS grant.              | No: "Without a support permit, AWS Support can't access this information". Permits are signed with a customer-managed KMS key.                                  | VD https://docs.aws.amazon.com/awssupport/latest/user/support-authorization-concepts.html                                                                                                       |
| **Shopify collaborators**                   | The store owner or Administrator accepts a request. The request needs a 4-digit code the owner shares.                             | Access expires after 90 days without a login.                                                                                   | Granular roles plus per-app or per-channel access.            | A named partner account with 2FA required. Its name stays in timelines "even after removal".                            | "permanently remove". Coming back needs a new request.   | No. Also, collaborators cannot hold the Administrator role or receive ownership.                                                                                | VD https://help.shopify.com/en/manual/your-account/staff-accounts/collaborator-accounts                                                                                                         |
| **Atlassian Cloud**                         | The requester ticks consent on the ticket. Guard customers can require an admin's second approval.                                 | The life of the ticket.                                                                                                         | Per ticket.                                                   | A "Support-actor", streamable to a SIEM (Guard). The grant itself was missing from the org audit log (ACCESS-2164, r2). | "revoked at any time"                                    | No.                                                                                                                                                             | S https://support.atlassian.com/atlassian-cloud/kb/atlassian-cloud-support-data-access-request-faq/                                                                                             |
| **Okta Support**                            | "A Super Admin … or the Admin who entered the case".                                                                               | "set to 8 hours by default". Extends by 24 hours at a time while the case is open, with no stated cap.                          | Read-only, "specific to the case".                            | Not fetched (separate System Log article).                                                                              | "Clearing this checkbox immediately removes the access." | No.                                                                                                                                                             | VD https://support.okta.com/help/s/article/approving-a-read-only-impersonation-access-request-for-a-support-case                                                                                |
| **GitHub Enterprise (admin impersonation)** | Enterprise owners impersonate their own users. GitHub staff are not involved.                                                      | "A session is limited to one hour."                                                                                             | "same access as the user being impersonated"                  | Logged in the enterprise audit log and the user's security log. The user gets an email that admins "cannot deactivate". | —                                                        | n/a                                                                                                                                                             | VD https://docs.github.com/en/enterprise-server@3.17/admin/managing-accounts-and-repositories/managing-users-in-your-enterprise/impersonating-a-user (GHES 3.17; the Cloud page returned 404)   |
| **Salesforce Grant Login Access**           | The individual user.                                                                                                               | The user chooses, "from a day to an entire year".                                                                               | Acts **as the user**.                                         | Not a distinct identity.                                                                                                | The user, or the admin through Login Access Policies.    | Admins can "access your account without any action from you by default".                                                                                        | S https://www.greytrix.com/blogs/salesforce/?p=1626                                                                                                                                             |

**Overkill for an early-stage SaaS (U):** customer-managed signing keys (AWS), per-action cryptographic authorisations, a separate approver role (Microsoft), SIEM streaming, pre-approved command sets, and 4-to-8-hour windows. Migration preparation runs for weeks, so the ticket-lifetime model (Atlassian, AWS) fits better.

**Minimum credible version, which every strong example shares:** the vendor cannot approve for itself or change who approves; silence means expiry; access ends with the case; the customer can revoke instantly; and every action is attributed to a non-member vendor identity in a log the customer can read. Big vendors use a **generic** operator identity. A **named** one (Shopify) is cheaper and builds more trust at small scale.

## 2. Consultant and helper seats in nonprofit CRMs

**No vendor in the set offers a consultant user type, an import-only role or expiring access.**

- **Bloomerang:** roles are "Accounting Manager," "Campaign Manager," "Web Developer" plus an **Offline Donation Import** permission. The page describes no expiry or deactivation, only "remove users at any time". (VD https://help.bloomerang.com/en/articles/13382649-user-roles-and-permissions)
- **Virtuous:** groups are Admin, "No financial data" and User, with an Import permission. Its own support article says the default for new users is **"Admin," meaning … full system administrator permissions**. (S, support.virtuous.org/hc/en-us/articles/360050985731)
- **Little Green Light:** roles are Administrator, Gift Entry, Fundraiser and Volunteer. "Volunteers have limited access". Consultants are not mentioned. (VD https://help.littlegreenlight.com/article/164-team-member-user-roles-and-permissions)
- **DonorPerfect:** security filters at "the donor or gift level"; "reviewing user accounts annually". (S)
- **Neon:** "System User" accounts are for API integrations. (S)
- **Blackbaud RE NXT:** rights are assigned to security groups, "not … individual users". (S)
- **Salesforce:** the only one with time-boxing. Permission-set and permission-set-group assignments can carry an **expiration date** (Summer '22, with a 30-day preset) (S https://www.asagarwal.com/salesforcesummer22-manage-expiry-of-permission-sets-groups/). Users can only be deactivated or frozen, never deleted (S).
- **Guidance on removing a consultant after migration:** none found from any vendor or sector body. Advice stays generic, e.g. "set permissions that match each role" and "don't share passwords" (S).

**Outside the sector,** Shopify collaborators (§1) are the clearest helper-seat pattern. They are a separate account type, cannot be made Administrator, expire after 90 days of inactivity, and don't count against seats.

## 3. Compliance expectations for vendor staff access

**Frameworks:**

- **SOC 2 CC6.3:** "authorizes, modifies, or removes access … giving consideration to the concepts of least privilege and segregation of duties" (S https://presencis.com/regulations/soc-2/article-CC6-3/). CC6.2 covers registering and authorising users before credentials are issued. Auditors expect documented access reviews (S).
- **ISO 27001:2022 A.8.2:** "The allocation and use of privileged access rights should be restricted and managed". A.5.18 adds periodic access review (S; the standard is paywalled).

**What a DPA must say about vendor staff:**

- **GDPR Art. 28** (VP https://gdpr-info.eu/art-28-gdpr/):
  - process "only on documented instructions";
  - ensure "persons authorised to process the personal data have committed themselves to confidentiality";
  - sub-processors need "prior specific or general written authorisation";
  - make available "all information necessary to demonstrate compliance" and allow audits.
- **Colorado CPA §6-1-1305** (VP https://colorado.public.law/statutes/crs_6-1-1305):
  - "(3)(a) each person processing … is subject to a duty of confidentiality";
  - subcontractors only after "providing the controller with an opportunity to object";
  - the contract must state instructions, data types, "duration of the processing", delete or return, and audits.
  - The Virginia-model laws (Oregon, Delaware, Minnesota, New Jersey, Maryland) follow the same pattern (S).
- **PIPEDA, Principle 4.1.3** (VP https://www.priv.gc.ca/en/privacy-topics/airports-and-borders/gl_dab_090127/):
  - "use contractual or other means to provide a comparable level of protection";
  - transfer to a processor is a use, so "additional consent … is not required";
  - "make it plain to individuals that their information may be processed in a foreign country".
- **Quebec s.18.3** (S, reproduction at https://watchdogsecurity.io/law25/disclosure-for-service-providers): the mandate must be "in writing" and specify confidentiality measures, use "only for carrying out the mandate", and that the provider "does not keep the information after the expiry".

**When a ministry needs a DPA at all:**

- **PIPEDA:** usually not. "Non-profit organizations are usually not subject to PIPEDA", and "Fundraising is not a commercial activity". Selling, bartering or leasing donor lists is commercial. (VP https://priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/02_05_d_19 , dated 2019)
- **BC PIPA** covers non-profits for all activities (S). **Quebec Law 25** covers non-profits as an "enterprise" (S). So BC and Quebec ministries need written processor terms.
- **US state laws:** Colorado, Oregon and New Jersey give no nonprofit exemption, and Delaware, Minnesota and Maryland exemptions are "quite narrow" (S https://wagenmakerlaw.com/blog/new-state-data-privacy-laws-affect-nonprofits , 2025). Oregon has covered nonprofits since 2025-07-01 (S). Thresholds are 100,000 consumers, or 35,000 in Delaware and Maryland, so most small ministries fall below them (U).
- **GDPR** applies only if Art. 3(2) targeting is met. Occasional EU donors probably don't trigger it; that needs counsel (U).
- **Implication (U):** one standard DPA for every ministry is cheaper than deciding case by case.

## 4. Two-person (maker-checker) norms

- **No nonprofit CRM found requires a second approver** for bulk imports or opening balances.
- **RE NXT** has a batch "approve" step, but users ask how to split upload from approval. A community thread shows "self-approve" exists as a separate right. (S https://community.blackbaud.com/discussion/comment/292273 ; https://community.blackbaud.com/discussion/comment/274911)
- **Sage Intacct** journal approvals are optional, with a "Submitter can approve own entries" setting. "Journal entries created by the admin approver are automatically approved." (S, intacct.com help)
- **Small-org guidance** uses **compensating controls** instead of forced segregation of duties: the treasurer receives bank statements directly, a second board member reviews items above a threshold, and reviews are signed off (S https://www.wildapricot.com/blog/internal-controls-for-nonprofits ; https://sorren.com/insights/internal-controls-nonprofits-governments/).
- **Conclusion:** single-owner commit is the norm. Make a second reviewer optional and produce a reconciliation artefact a treasurer or board can review.

## 5. Duty of care for sensitive missionary data

**No published standard was found on vendor or third-party access to identities of workers in creative-access countries.** Missio Nexus and CCI pages cover crisis management only (S). Agency practice is need-to-know and keeping names out of reach:

- **AIM Canada** "goes to significant effort to ensure their names and/or pictures are not found _anywhere_ on the Internet". Donors give to an "UNLISTED MEMBER" and type the full name into a secure form. (VP https://cagiving.aimint.org/?p=4799)
- **WorldVenture:** "Don't ever publish or mention your missionary's name and/or location" (social media, church site, pulpit, emails). (VP https://worldventure.com/safely-caring-for-your-missionary/)
- **IMB:** uses pseudonyms plus a region. Some workers are "not listed at all in the prayer calendar". 71% of one appointment class "could not be publicly identified". (S, Baptist Press and Illinois Baptist)
- **Rock RMS idea (2025-10-28):** asks for per-member aliases like "CountryA25-Member01" on donation pages. It has 0 votes. (VP https://community.rockrms.com/ideas/2189/missionary-anonymizer-)
- **Contract-processor risk is real.** The 2020 Blackbaud breach hit 13,000+ customers, including faith-based relief groups (S, NY AG). In 1977 Christian donor lists were stolen from a contract database firm (S, https://christianitytoday.com/?p=78713).

## 6. Vendor-assisted vs self-serve outcomes (beyond r2)

**No independent outcome data exists. Evidence is still vendor claims:**

- **DonorDock** (a small donor CRM): "free, human-assisted data migration", "on average in under 2 weeks", with a "dedicated onboarding specialist" for "90 days". (VD https://www.donordock.com/solution/crm-migration)
- **Neon One** offers paid Professional Services or guided self-import. It warns "you're going to spend your first month (or two) … dealing with improperly formatted records". It calls duplicates "one of the most common data challenges" and recurring revenue "at risk if monthly schedules aren't mapped correctly". (VD https://neonone.com/resources/blog/donor-data-migration/ , 2026)

**Where help adds most value,** consistently: mapping one-to-many fields, duplicates, recurring schedules and gift history. Even small, low-price vendors now migrate for free, so assisted migration is the market norm (U).

## Minimum credible operator-access design for an early-stage SaaS

1. **Request.** A named Asym staffer files the request against a specific switch, stating purpose and scope. Pending requests **expire unanswered after about 72 hours**: silence is not consent.
2. **Approval.** A ministry admin approves. **No Asym tool can create, promote or edit ministry admins or members** (the Lockbox approver-list rule).
3. **Scope.** Preparation actions on that switch only. Commit, attest, send, consent changes, export/download and real restricted identities are denied.
4. **Duration.** Until go-live or close, or an end date the ministry picks (up to 30 days, renewable by the ministry). The ministry can revoke instantly, and the grant ends automatically when the switch closes.
5. **Identity.** A per-person staff account with MFA and a visible "Asym" badge. It is never a membership or impersonation. Background jobs carry the actor.
6. **Visibility.** The ministry sees the grant's lifecycle and the operator's actions, and gets emails on approval, first use and expiry.
7. **Internal controls.** Staff confidentiality agreements, a quarterly review of who can hold grants, removal at off-boarding, and a **separate, logged, disclosed break-glass path** for incidents and legal process, never used for preparation.
8. **Contract.** The DPA treats the approved grant as the "documented instruction". It names personnel confidentiality, sub-processors, deletion and return, and audit information.

**Deferred:** customer-held keys, dual customer approval, Asym-side manager approval (use after-the-fact review instead), and SIEM export.

## Findings that contradict or change the decision

1. **Helpers are less controlled than Asym staff (changes part 2).** The preparation-only role has no end date, and an outside volunteer or consultant could see restricted identities that the Asym specialist sees only as aliases. Duty-of-care sources (§5) treat identities as need-to-know, and Shopify and Salesforce show expiring external access is normal. **Fix (U):** tie alias display to the preparation-only role, not to "Asym", with a per-person ministry override. Give helper roles an end date that defaults to switch close.
2. **The "never" claims need a break-glass carve-out (changes parts 3 and 4).** Google auto-approves in outages, and Lockbox does not cover legal requests. Asym engineers with database or service-role access exist outside any grant. **Fix:** state that the grant governs support and preparation access, and that incident or legal access is a separate, logged path disclosed in the DPA. Otherwise the ministry-facing promise is false.
3. **Approver integrity is missing from O26.** The Lockbox guarantee depends on the vendor being unable to change who approves (§1). If super_admin or any Asym tooling can add ministry admins, Asym can approve its own grant. Add this to O26 alongside removing the RLS shortcut.
4. **The guided-session fallback in part 5 contradicts part 4.** Screen-shared coaching shows Asym staff whatever is on the ministry's screen, including real restricted identities, raw files and source-system exports. Either accept this explicitly (the ministry controls the screen) or require an alias view during sessions. Forbid file exchange outside the product (U).
5. **Aliasing must cover raw source cells, not just entity records (U).** Legacy exports put missionary names in fund names, memos and notes. Previews and mapping screens will show those cells. The vendor norm is that conversion staff see raw files (Blackbaud via SFTP; Bloomerang keeps originals 90 days, r2). The no-download rule is fine, but alias-in-preview is a real build item, not a policy line.
6. **Add pending-request expiry and notifications to O26.** Silence-means-expiry is a core feature of the strong models.
7. **No change is needed on maker-checker.** Single-owner commit matches small-org norms, and the operator model already separates preparer from committer.
8. **No change on DPA timing.** One standard DPA is enough, but Q2's retention terms should reflect Quebec s.18.3's "no retention after mandate".
