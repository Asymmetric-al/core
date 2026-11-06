# Q20 R4: External edge cases for Data Tools permissions

All sources were accessed on 2026-11-04. This file covers outside practice only and does not describe Asym code. Recommendations appear only in "Synthesis for Asym" and are labelled _(inference)_.

**What this file builds on, and does not repeat.**

- `q20-r2-external-permissions.md` (r2) already covers:
  - named import permissions and the run / history / file / revert / money / migration split (§1–§2);
  - hidden-record matching in Salesforce, Rock, Pipedrive, Planning Center and LGL (§3);
  - HubSpot error-file redaction, the HubSpot export log, export approvals and OWASP CSV injection (§4);
  - NIST AC-5 and AC-6, OWASP Authorization, PIM and PAM, and the Shopify 2019 and Planning Center 2025 export splits (§5);
  - request-access flows in Google Drive, Notion, Confluence and HubSpot (§6);
  - helper and partner access (§7).
- `q19-data-tools/research/q19-r5-external-ia-jobs-a11y.md` §2 already covers:
  - hide, disable or explain (Carbon, Cloudscape, Primer, Atlassian);
  - GitHub's 404-not-403 rule and the DfE "no access" pages;
  - watch-but-not-act patterns.
- This file adds edge cases only. It cross-references those files rather than restating them.

**Labels.**

- **VP:** a standard, regulator or sector code whose text was fetched. This covers NIST via the csf.tools mirror, OWASP ASVS, the Charity Commission, the Oregon DOJ, The National Archives and the ICRC code.
- **VV:** a vendor page that was fetched. **VV-d** marks one dated before 2024.
- **VA:** an academic paper whose abstract or metadata was fetched.
- **S:** secondary. This covers search-tool summaries of pages that could not be fetched, third-party blogs, community posts and news.
- **U:** not found or unverified.
- **I:** inference.

**Blocked or thin.**

- These returned 403: developer.salesforce.com security guides, admin.salesforce.com (2024), help.tithe.ly, support.neonone.com and network.crcna.org.
- The ICRC RFL Code PDF and a church-hosted IMB PDF could not be rendered by the fetcher. Their text was extracted locally with `pdftotext` from the downloaded files and quoted from that output.
- The ICRC Handbook (3rd edition, 2024) and the 2023 IASC Operational Guidance were found, but their text on access control was not retrieved (U).
- No official Salesforce statement was found on what happens to a Bulk API job already running when its creator is deactivated (U).
- No official HubSpot statement was found on in-progress imports when the importer is deactivated (U).

---

## 1. Authority during long-running jobs, and orphaned work (Q1)

### 1.1 What happens when the person who started a job loses access

| Product                        | Behaviour when the initiator is removed, deactivated or loses permission                                                                                                                                                                                                                                                                      | Model                                                        | Label               |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------- |
| **GitHub Actions (re-runs)**   | A re-run "will use the privileges of the actor who initially triggered the workflow, not the privileges of the actor who initiated the re-run". The 2022 changelog says run privileges "(e.g. secrets, permissions)" are "derived from the triggering actor" [GH-RERUN]                                                                       | **Original authority persists**                              | S                   |
| **GitHub Actions (schedules)** | "removing a user from an organization will not prevent scheduled workflows which had that user as their `actor` from running". With Enterprise Managed Users, scheduled workflows "will not run if the last `actor` … has been deprovisioned" [GH-SCHED]                                                                                      | Persists, unless the identity provider deprovisions the user | VV                  |
| **GitHub Actions (token)**     | The job token "expires when a job finishes or after a maximum of 24 hours" [GH-TOKEN]                                                                                                                                                                                                                                                         | **Time-boxed** authority                                     | S                   |
| **Google Apps Script**         | "Installable triggers always run under the account of the person who created them." Behaviour after the account is suspended or deleted is not documented (U). Third-party guides say triggers "may stop running" and must be re-created under the new owner [GAS-TRIG][GAS-S]                                                                | Runs as creator; ends when the account ends (S)              | VV / S              |
| **Slack**                      | "When member accounts are deactivated, API tokens are revoked as well." Apps needing member-specific permissions "may be fully deactivated". However, "bot users, slash commands, and incoming webhooks – will remain active". "If all collaborators on an internal app are deactivated, the app may also be deactivated" [SL-APPS]           | **User authority revoked; bot authority persists**           | VV                  |
| **Microsoft Entra (CAE)**      | Critical events include "User Account is deleted or disabled". Enforcement aims to be "near real time, but latency of up to 15 minutes might be observed". Without CAE, tokens last one hour. With CAE, tokens last "up to 28 hours" because events drive revocation. Group-membership and policy changes "could take up to one day" [MS-CAE] | **Revocation pushed to the running session**                 | VV (2026-04-08)     |
| **AWS S3 presigned URLs**      | A presigned URL "expires when the credential you used to create it is revoked, deleted, or deactivated … even if the URL was created with a later expiration time". A download already in progress continues past expiry [AWS-PRESIGN]                                                                                                        | **Derived artefacts die with their creator's credential**    | VV                  |
| **Stripe**                     | API keys are account-level. Stripe says to "Rotate keys when team members with access to the keys leave your organization". Removing a dashboard user does not itself expire keys (S) [ST-KEYS][ST-S]                                                                                                                                         | Key persists; manual rotation                                | VV / S              |
| **Salesforce**                 | Scheduled Apex jobs and scheduled reports run as the user who scheduled them. Practitioners report they **fail** once that user is inactive, and that scheduled jobs owned by the user can block deactivation. Salesforce "never reassigns records automatically" [SF-SCHED]                                                                  | **Fails** after deactivation (S)                             | S                   |
| **HubSpot**                    | Reassigning assets before deactivation is recommended, not required. Workflow filters naming the user must be removed manually. Assets show "Deactivated/Removed (user's email address)" as the creator. Scheduled sequence emails stop. Import and export behaviour is not documented [HS-DEACT]                                             | Assets persist; some automation stops                        | VV (2026-09-28) / U |

### 1.2 Standards on re-checking authority

- **NIST SP 800-53 AC-3(8), Revocation of Access Authorizations** [NIST-AC3-8] (VP):
  - "Enforce the revocation of access authorizations resulting from changes to the security attributes of subjects and objects", based on organisation-defined timing rules.
  - The discussion accepts that removal from a group may take effect only "the next time the object is opened" or "the next time the subject attempts to access the object".
  - It also says "Organizations provide alternative approaches on how to make revocations immediate" where systems can't.
- **NIST AC-2** [NIST-AC2] (VP):
  - (h) notify account managers when "users are terminated or transferred" and "when system usage or need-to-know changes";
  - (l) "Align account management processes with personnel termination and transfer processes";
  - AC-2(3) disable accounts "no longer associated with a user".
- **OWASP ASVS 5.0, V8** [ASVS-V8] (VP; long rows paraphrased by the fetcher):
  - **8.3.2 (Level 3):** "Verify that changes to values on which authorization decisions are made are applied immediately." Where that isn't possible ("such as when relying on data in self-contained tokens"), there must be mitigating controls that alert when someone acts after losing authority and revert the change. The standard notes this alternative does not stop information leakage.
  - **8.3.3 (Level 3):** object access is based on the originating consumer's permissions, not those of an intermediary service acting for them.
- **Zanzibar (Google, USENIX ATC 2019):** authorisation decisions "respect causal ordering of user actions" and "provide external consistency amid changes to access control lists and object contents" [ZAN] (VA). Secondary explainers call the failure this prevents the **"new enemy" problem**: a user removed from an access list still sees content added after the removal because a stale check was used [ZAN-S] (S).

### 1.3 Orphaned drafts and ownership transfer

| Product                       | Departing person's work                                                                                                                                                                                                                                                                       | Label           |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| **Google Workspace**          | Admins can "transfer ownership of their files when you delete the user". "Transferring files does not affect who has access to the files". Suspension before transfer "prevents them from creating or moving content during the transfer". Untransferred files in Trash are deleted [GW-XFER] | VV (2026-10-26) |
| **HubSpot**                   | Assets stay and show "Deactivated/Removed (user's email address)". Reassignment is recommended. The user can be reactivated "with their current assets" [HS-DEACT]                                                                                                                            | VV              |
| **Salesforce**                | No automatic reassignment. Scheduled jobs and reports should be reassigned to an active or integration user before deactivation [SF-SCHED]                                                                                                                                                    | S               |
| **Slack**                     | Messages and files are kept. Bot-style integrations keep running. User-token integrations stop [SL-DEACT][SL-APPS]                                                                                                                                                                            | VV              |
| **Attio** (r2 §7)             | Draft imports can be shared by link so a teammate can finish them                                                                                                                                                                                                                             | VV (r2)         |
| **Planning Center** (r2 §5.2) | Anti-pattern: a private tab whose creator loses access "defaults to give all viewers and above access"                                                                                                                                                                                        | VV (r2)         |

**Observations.**

- **No consensus model exists.** CI systems (GitHub) keep the original actor's authority. Collaboration suites (Slack, Entra) revoke user authority quickly but keep machine or bot authority. Salesforce scheduled work fails once its owner is inactive (S).
- **The standards point one way.** AC-3(8), ASVS 8.3.2 and 8.3.3, and Zanzibar all say authority should be re-evaluated against the originating person at use time. Even Microsoft accepts minutes to a day of lag [MS-CAE], and NIST accepts "next access" revocation [NIST-AC3-8].
- **Derived artefacts should die with the authority that made them.** AWS presigned URLs do [AWS-PRESIGN]. Stripe keys don't, so Stripe tells customers to rotate them [ST-KEYS].
- **No product documents what an in-flight data import does when its initiator is deactivated (U).**

---

## 2. Last-admin protection, break-glass and recovery (Q2)

| Product                     | Guard against losing the last admin                                                                                                                                                                                            | Advice on number of admins                                                                                                                                   | Recovery when nobody can administer                                                                                                                                                                                                                                     | Label           |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| **Microsoft Entra**         | "Microsoft Entra ID prevents the last Global Administrator account from being deleted". It doesn't stop the account being disabled on-premises [MS-EMERG]. PIM: "Prevent removal of the last active Global Administrator" (r2) | "two or more emergency access accounts". Monitor every use "with alerts". Post-mortem after every use. Validate "at least every 90 days"                     | Emergency ("break glass") accounts, stored where "multiple members of the administration team" can reach them. Alternatively, individual emergency accounts for accountability                                                                                          | VV (2026-06-04) |
| **Google Workspace**        | Not confirmed (U)                                                                                                                                                                                                              | "Your organization should have more than one super administrator account." "Use the super admin account only when needed." Set admin email alerts [GW-ADMBP] | Super-admin self-recovery. It defaulted ON for customers "with fewer than three super admins" [GW-SAREC]. A domain-verification recovery form exists (S)                                                                                                                | VV / S          |
| **GitHub**                  | Not stated in the fetched page                                                                                                                                                                                                 | "we recommend that at least two people within each organization have the owner role" [GH-OWN]                                                                | Community report: an org with no owner needed Support to verify business documents [GH-ORPH]                                                                                                                                                                            | VV / S          |
| **GitLab**                  | Design rule: "always at least one Owner present". The last owner "cannot be removed" [GL-OWN]                                                                                                                                  | —                                                                                                                                                            | —                                                                                                                                                                                                                                                                       | S               |
| **HubSpot**                 | You may delete your own user only if you "aren't the only Super Admin remaining". "HubSpot Support can not deactivate or remove users in an account" [HS-DEACT]                                                                | U                                                                                                                                                            | Community threads describe ownership-verification tickets (S)                                                                                                                                                                                                           | VV / S          |
| **Slack**                   | "No one can deactivate the Workspace Primary Owner". Ownership must be transferred first [SL-DEACT]                                                                                                                            | —                                                                                                                                                            | U                                                                                                                                                                                                                                                                       | VV              |
| **Planning Center**         | Not stated                                                                                                                                                                                                                     | "Each account should have at least two people in the organization administrator role at all times"                                                           | Email accounts@planningcenter.com. "You must verify your identity before any changes can be made", using billing facts: the card charge amount, the charge day, the last four digits and the organization number, or for cheques the cheque number and amount [PC-XFER] | VV (2026-11-03) |
| **Church Metrics**          | —                                                                                                                                                                                                                              | "Always ensure at least two trusted team members retain Admin rights"                                                                                        | If "the original Admin left your organization and no one else was set up as Admin", contact Support with the church name and the old and new admin emails. "Support will verify and help restore access" [CM-ADM]                                                       | VV (2025-10-20) |
| **Tithely / Breeze**        | Only the current Account Owner can transfer ownership                                                                                                                                                                          | —                                                                                                                                                            | Tithely's "Priority Team … will authenticate your request" [TL-OWN]                                                                                                                                                                                                     | S (403)         |
| **ParishSOFT, PowerChurch** | —                                                                                                                                                                                                                              | —                                                                                                                                                            | Fallback to the primary contact, then a signed letter from the parish priest (ParishSOFT). Written permission "signed by two other authorized church personnel" (PowerChurch forum) [CH-REC]                                                                            | S               |

**Observations.**

- **Keeping at least one owner is a hard rule** in Entra, Slack, GitLab and HubSpot (for self-deletion) [MS-EMERG][SL-DEACT][GL-OWN][HS-DEACT].
- **Two admins is universal advice but not enforced:** Planning Center, GitHub, Google, Church Metrics and Entra all recommend it.
- **Church vendors recover through the vendor's support team.** They verify billing facts, leadership letters or multiple signatures [PC-XFER][CM-ADM][CH-REC]. None of them uses shared break-glass credentials.
- **The break-glass pattern belongs to enterprise identity providers.** Its own guidance assumes a separate team, fireproof safes and quarterly drills [MS-EMERG].

---

## 3. "Ask {names}": naming who can grant access (Q3)

### 3.1 Who names the approvers

| Product                     | Shows approver names to the person without access?                                                                                                                                                                                              | Mechanism                                             | Label                      |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | -------------------------- |
| **Slack**                   | **Yes.** "If you don't have permission to use a feature or change a setting, find an owner or admin to ask for help". Directories can be filtered by owner and admin role                                                                       | Self-service directory lookup                         | VV [SL-FIND]               |
| **GitHub**                  | **Yes, inside the org.** Members can see people's roles and filter by "Role"                                                                                                                                                                    | Directory                                             | S [GH-ROLES]               |
| **HubSpot**                 | **Yes.** The requester selects which Super Admin receives the request (r2 [HS-REQ])                                                                                                                                                             | Request form                                          | VV (r2)                    |
| **Microsoft My Access**     | **Configurable.** "The approver information will be displayed if the access package policy allows it"                                                                                                                                           | Request portal with justification and request history | VV (2026-06-17) [MS-MYACC] |
| **SharePoint**              | **No names by default.** Requests go to an address set by the site collection admin. When requests are off, users see "Sorry, this site hasn't been shared with you" or "You don't have permission to access this item" with no request option  | Configurable inbox                                    | VV (2025-12-04) [MS-SPREQ] |
| **Planning Center**         | **No names.** The Request Access message "will be emailed to all current organization administrators"                                                                                                                                           | Broadcast to admins                                   | VV [PC-XFER]               |
| **Confluence**              | **No names.** Requests go to a capped sample of space admins (r2 [CF-SPACE])                                                                                                                                                                    | Capped routing                                        | VV (r2)                    |
| **Google Workspace**        | **No.** "we can't tell you exactly who that person is". Users are told to ask "The person who gave you your username", the IT department or help desk, or "The person who manages your email service or web site (in a small business or club)" | Advice only                                           | VV [GW-FINDADM]            |
| **Atlassian (site access)** | No documented admin-name list. Community answers tell users to ask colleagues or IT                                                                                                                                                             | —                                                     | S [AT-COMM]                |

### 3.2 Privacy and enumeration

- **Admin names help attackers choose whom to impersonate.** Security vendors describe admin and executive names, roles and reporting lines as spear-phishing reconnaissance. Admins are "a popular attack target" because their rights are broader [SE-RECON] (S). No peer-reviewed study specific to admin-name exposure was found (U).
- **AWS shows a way to explain a denial without leaking.** Its denial messages name the denying policy only "in same-account and same-organization scenarios". The message "does not reveal the policy's permissions or conditions" [AWS-ARN] (VV, 2026-03-04). The analogue is to give names only to authenticated members of the same organisation.
- **The cross-tenant case is settled.** GitHub returns 404 to avoid confirming that something exists (q19-r5 §2.2). ASVS 8.4.1 requires that operations never affect tenants the user lacks permission for [ASVS-V8].

### 3.3 Wording guidance

- **NN/g error-message guidelines (14 May 2023)** [NN-ERR] (VV):
  - "Merely stating the problem is also not enough; offer some potential remedies."
  - "Write with a positive and nonjudgmental tone of voice."
  - "Let users correct errors by editing their original action instead of starting over."
- **The National Archives design system (UK public sector)** [TNA-ERR] (VP):
  - The restricted page uses the heading "Restricted", the body "You are not permitted to view this content." and then "If you believe you should be able to view this content, contact us to request access."
  - It gives no advice on 403 versus 404 or on hiding that content exists.
- **The GOV.UK Design System still has no access-denied pattern** (S). DfE services wrote their own (q19-r5 §2.2).

**Observations.**

- **Practice is split.** Collaboration tools (Slack, GitHub, HubSpot) expose who the admins are inside the organisation. Identity providers and suites (Google, SharePoint, Planning Center, Confluence) route requests without naming anyone.
- **Microsoft makes naming a policy switch** [MS-MYACC].
- **No source covers the case where an approver is themselves a protected person (U).**

---

## 4. Field-level permission in imports (Q4)

| Product                                   | Columns the importer can't write                                                                                                                                                                                                                                                                                                                                                                                            | Label               |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| **Salesforce import wizards**             | The personal wizard can "only import into fields that you can access via your page layout and field-level security settings" (r2 [SF-PERS], 2015). Community answer: "individual users can import only into the fields that are accessible to them". Integration guides say a field missing from mapping usually means the running user can't see it [SF-FLS-S]                                                             | VV-d / S            |
| **Salesforce (conflicting legacy claim)** | A third-party legacy guide says administrators can import into listed fields "even if a field is hidden or read-only" [SF-FLS-S]                                                                                                                                                                                                                                                                                            | S                   |
| **HubSpot Sensitive Data**                | "Users with access to a Sensitive Data property can update the property's values manually or via import and workflows". Access is set by Super Admins through field-level permissions [HS-SENS]                                                                                                                                                                                                                             | VV (2026-09-24)     |
| **HubSpot property restrictions**         | Restricted users see an icon "instead of a property value". The edit hover reads "You do not have the permissions to edit the value of this field". Users can still set the value through the API when creating a record. HubSpot warns "this feature doesn't provide complete restricted access, so it's not recommended to use property restrictions as a security measure". Import behaviour is not documented [HS-PROP] | VV (2026-10-09) / U |
| **HubSpot (third party)**                 | Restricted fields "can lead to missing data, or failed uploads" in imports [HS-PROP-S]                                                                                                                                                                                                                                                                                                                                      | S                   |
| **Dataverse / Dynamics 365**              | Column security profiles grant read, create and update per column (S). "The default API behavior when returning a value for a secured column is to return no data. The calling application can't distinguish between a value that is secured and a value that is null." Import-specific behaviour was not found [DV-CLS]                                                                                                    | VV (2026-10-28) / U |
| **OWASP ASVS 5.0**                        | 8.1.2 requires documented "rules for field-level access restrictions (both read and write)". 8.2.3 requires "that field-level access is restricted to consumers with explicit permissions" [ASVS-V8]                                                                                                                                                                                                                        | VP                  |

**Observations.**

- **Products use three patterns:** hide the field from mapping (Salesforce), let it fail or silently drop data (HubSpot, S), or return blank values that look like nulls (Dataverse).
- **No product was found that shows a locked column with a reason in the import mapping step (U).**
- **HubSpot's restrictions are not enforced everywhere.** Its own documentation shows they are UI-level, with an API bypass, which contrasts with ASVS 8.2.3.

---

## 5. Downloads and exports governance (Q5)

r2 §4 covers HubSpot export approvals and logs, Salesforce Event Monitoring, HubSpot error-file redaction and OWASP CSV injection. New evidence follows.

### 5.1 Step-up re-authentication

| Product                       | Trigger                                                                                                                                                                                                                                                                                                                             | Window                                                                                                       | Label                                         |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| **GitHub sudo mode**          | Sensitive account and organisation actions, such as adding SSH keys, changing two-factor enforcement, or "Viewing, downloading, printing, or regenerating … recovery codes"                                                                                                                                                         | "two-hour session timeout … any sensitive action that you perform will reset the timer". SMS is not accepted | VV [GH-SUDO]                                  |
| **Salesforce reports (2026)** | Salesforce is "narrowing step-up authentication so it triggers only on report export" instead of "monitoring all access to reports and dashboards". Rationale: "Even if an attacker gains access to a valid session identifier, they can't extract your most sensitive data". "Automated background jobs" and "Login As" are exempt | Secondary sources say the window is configurable from 1 to 120 minutes                                       | VV (2026-07-07) [SF-STEPUP] / S [SF-STEPUP-S] |
| **Google Workspace**          | A "verify-it's-you" challenge appears when a user "with a risky session" attempts a sensitive action. Failures generate a "Critical security alert"                                                                                                                                                                                 | Risk-based                                                                                                   | S [GW-SENS]                                   |
| **Microsoft My Access**       | Signing in through a directory link requires reauthentication                                                                                                                                                                                                                                                                       | Per sign-in                                                                                                  | VV [MS-MYACC]                                 |

### 5.2 Release controls and link lifetime

- **NIST AC-3(9), Controlled Release:** "Release information outside of the system only if" the receiving side provides defined controls and other controls validate "that the information is appropriate to release" [NIST-AC3] (VP).
- **AWS presigned URLs** [AWS-PRESIGN] (VV):
  - They are "bearer tokens that grant access to those who possess them".
  - The console allows 1 minute to 12 hours. The SDK allows "as high as 7 days".
  - A bucket policy example denies signatures "more than 10 minutes old".
  - Expiry is checked at request time.
- **No standard was found that sets a minute-level expiry norm (U).** Practitioner guides say to keep expiry "as short as possible" and to generate links on demand (S).

### 5.3 Why bulk files matter in this sector

- **Beacon CRM (UK nonprofit CRM, 2026).** Supporter data at "more than 1,000 nonprofits", including OM and other Christian ministries, was "likely downloaded by a third party July 29". It included names, phone numbers, emails and residential addresses. The access method was not reported [BEACON] (S, news, 12 Aug 2026).
- **IMB (2018).** An "unknown external actor" accessed personnel files with names, addresses, birth dates and Social Security numbers [IMB-BR] (S).
- **Clients that don't enforce permissions.** Bloomerang warns that mobile app versions "v23.11.3 or lower" ignore permissions: "user permissions do not apply to the mobile app" [BL-CRM] (VV). Server-side enforcement is the only reliable kind (ASVS 8.3.1 [ASVS-V8]).

**Observations.**

- **Step-up is converging on export moments.** Salesforce removed view-time step-up after "unintended friction" but kept it for export. GitHub applies sudo to credential-like downloads such as recovery codes [SF-STEPUP][GH-SUDO].
- **Approval queues need a second admin.** HubSpot's export approvals (r2) require one.

---

## 6. Separation of duties in small teams (Q6)

| Source                                                | Guidance when duties can't be split                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Label                                 |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| **Charity Commission CC8 §2.7** (updated 27 Nov 2024) | "Make sure that more than one person is involved in all financial transactions." "If you cannot fully split duties due to a lack of people or money, you can manage the risk by: all trustees reviewing transaction reports; checking that internal controls are followed and sharing the results with all trustees." §2.6: review controls "at least once a year" and keep "records of your reviews". §4.2: "Users should not share their security details with one another" [CC8] | VP                                    |
| **Oregon DOJ, small nonprofits**                      | "Even if an organization has no staff, it can still ensure that there is adequate separation", for example by "assigning duties to board directors or volunteers". Statements should be "reviewed by someone that is independent". Have "alternative arrangements in place" for when the finance person is unavailable [OR-DOJ]                                                                                                                                                     | VP (n.d.; the PDF path suggests 2023) |
| **NIST SP 800-53**                                    | AC-5 OT discussion: "Example compensating controls include providing increased personnel security and auditing" (r2). AC-3(2) dual authorisation and AC-3(10) "Employ an audited override of automated access control mechanisms" [NIST-AC3]                                                                                                                                                                                                                                        | VP                                    |
| **Microsoft emergency access**                        | Alert other administrators on every use, followed by a "Post-mortem review" to decide whether use was authorised [MS-EMERG]                                                                                                                                                                                                                                                                                                                                                         | VV                                    |
| **Google multi-party approval** (9 Apr 2024)          | "one admin must approve certain sensitive actions initiated by another". Available only to customers "with two or more super admin accounts". OFF by default. Enterprise and Education editions only [GW-MPA]                                                                                                                                                                                                                                                                       | VV                                    |
| **Practitioner and ISO 27001 A.5.3 commentary**       | Compensating options: audit logging, "post-action managerial review", anomaly monitoring. Compensating controls must be documented. "no logging or alerting on sensitive operations means there is no compensating visibility at all" [SOD-S]                                                                                                                                                                                                                                       | S                                     |
| **GAO Green Book (via a state audit)**                | Where segregation is "not practical", management designs alternative controls [GAO-S]                                                                                                                                                                                                                                                                                                                                                                                               | S (not fetched)                       |
| **AICPA**                                             | A segregation chart "for NFPs with four people" (5 Sep 2025) is members-only, so its content was not seen [AICPA]                                                                                                                                                                                                                                                                                                                                                                   | U                                     |

**Observations.**

- **After-the-fact review is the recognised compensating control for small charities.** The regulator (CC8: "all trustees reviewing transaction reports"), a state AG (independent statement review) and NIST ("auditing") all name it.
- **Notifying other admins counts as an equivalent detective control** in Microsoft's break-glass guidance [MS-EMERG] (VV).
- **No source names "notify other admins when someone reverses an import or downloads rows" as such (U).** It fits the review-and-alert family (I).
- **Dual-control products assume two admins.** Google requires two or more super admins [GW-MPA]. Small ministries with one owner can't use them.

---

## 7. Template and role design for small organisations (Q7)

### 7.1 How many roles nonprofit and church products ship

| Product            | Shipped roles or levels                                                                                                                                                                                                                                                      | Label   |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Bloomerang CRM     | **2 user types**: Admin ("Full access to everything") and Standard ("Limited access, which admins can customize"). The default Standard user gets **Data Tools**, all transactions and constituent edit. There are no named templates; permissions are set per user [BL-CRM] | VV      |
| Neon CRM           | 2 levels: Administrator and User [NE-USR]                                                                                                                                                                                                                                    | S (403) |
| Virtuous           | 3 default groups: Admin, No financial data and User (r2)                                                                                                                                                                                                                     | S       |
| Little Green Light | 4 roles (r2)                                                                                                                                                                                                                                                                 | VV      |
| Planning Center    | Per product: Viewer, Editor and Manager, plus organization administrator. Giving uses its own four roles (r2)                                                                                                                                                                | VV      |
| Breeze             | 3 defaults: Admin, Standard and Limited (r2)                                                                                                                                                                                                                                 | S       |

### 7.2 Evidence that complexity drives over-granting

- **Xu et al., CHI 2017.** In a study of how sysadmins resolve access-denied issues, they "often grant too much access", and "many of these misconfigurations were the results of trial-and-error practices". "the lack of adequate feedback information is one fundamental reason" [XU17] (VA).
- **Microsoft 2023 State of Cloud Permissions Risks.** Identities use about **1%** of granted permissions [MS-PERM23] (S; the Microsoft PDF was not fetched).
- **Salesforce reversed course on profiles.** It announced in 2023 that permissions on profiles would end in Spring '26, stopped enforcing that date in 2024, and was reported as having cancelled it in July 2026 [SF-PROF] (S). This is evidence that even a large vendor could not force a move to finer-grained permission sets.
- **"Role explosion"** is a recognised failure mode of RBAC [RE-2010] (S).
- **No NN/g article specific to permission-model complexity was found (U).**

### 7.3 Defaults when a new permission or service appears

- **Google Workspace** lets admins choose "Turned on when released" or "Turned off when released" for new products. The default is not stated [GW-NEW] (VV).
- **Shopify (2019) and Planning Center (2025)** turned new export permissions on for existing users to avoid lost functionality (r2 §1.2).
- **Bloomerang** defaults new Standard users into Data Tools [BL-CRM].
- **NIST AC-6 and OWASP** require deny-by-default (r2 §5.1).

---

## 8. Restricted and protected people (Q8)

| Source                                                                           | Relevant guidance                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Label            |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| **ICRC / Movement Family Links Code of Conduct on Data Protection, v2.0 (2024)** | "Personal data can be accessed only by data controller staff, who require this access to deliver a specific service or task". The code requires "ensuring access is granted on a need-to-know basis", "keeping a record of the staff members that have access to each database" and "if feasible, a historical log of the staff members that have had access". "Keeping personal data related to beneficiaries in a device's local storage should be avoided". "Portable devices or removable media should not be used to store documents containing personal data that are classified as being particularly sensitive". Sensitive data are data "which might cause very serious harm (e.g. discrimination or repression) if mishandled or disclosed". Data subjects may ask for "confirmation as to whether or not their personal data are being processed", but access "needs to be restricted" for the "rights and freedoms of others" [RFL-COC] | VP (sector code) |
| **ICRC, "Digital trails" (2018)**                                                | Metadata can be analysed "to infer details like sleep patterns, travel routines or frequent contacts". It calls for "more systematic mapping of who has access to what information" [ICRC-DT]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | VV-d             |
| **IMB field-personnel security levels** (a church-hosted copy, apparently 2018)  | Level 3: "Field personnel relate to IMB only through limited circle of administrators … No public statements about work." "Two-thirds of the missionaries currently serving … are in level 2 or 3 assignments." "Do not publicly distribute their information, e.g. … newsletters, emails" [IMB-SEC]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | S                |
| **Baptist News, AIM, sending agencies**                                          | "Most mission-sending agencies use pseudonyms for individuals in those areas and do not disclose actual locations". Agencies avoid formal lists of creative-access countries "for fear that it will draw unwanted attention" [BNG-MISS]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | S                |
| **MinistryWatch (25 Jan 2022)**                                                  | "if we don't want it found, don't post it". "If the right threat actor got a list of risky operations a missions group is involved in, it could both directly hinder the operation and endanger the missionaries there" [MW-SEC]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | S                |
| **Dataverse**                                                                    | Secured values are indistinguishable from null [DV-CLS]. This is a product precedent for answers that don't reveal existence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | VV               |
| **ICRC Handbook, 3rd edition (2024); IASC Operational Guidance (2023)**          | The documents exist and the Handbook is open access. Their access-control text was not retrieved [ICRC-HB3][IASC]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | U                |

**Observations.**

- **Humanitarian and mission sources treat the list itself as the hazard,** not only individual records. That applies to lists of operations, lists of countries and bulk files [MW-SEC][BNG-MISS][RFL-COC].
- **They prescribe a short list of named people with access, plus a record of who had access.** Examples are the IMB's "limited circle of administrators" and the code's need-to-know rule and historical log [IMB-SEC][RFL-COC].
- **No mission or humanitarian source addresses dedupe or matching during import (U).** The non-revealing behaviour has to be derived from the "list is the hazard" principle and from r2 §3.2.

---

## 9. "Why can't I?" and permission-change auditing (Q9)

| Product                                | Feature                                                                                                                                                                             | Who can use it                           | Label                     |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------- |
| **Jira Cloud Permission Helper**       | "can help you figure out why a user can or can't see a certain work item". Input is a user, an item and a permission                                                                | Jira administrators only                 | VV [JIRA-PH]              |
| **Google Cloud Policy Troubleshooter** | Reports whether a principal has a permission on a resource and which allow, deny and boundary policies affect it. It shows "Unknown" when the viewer can't read the relevant policy | Requires roles such as Security Reviewer | S [GC-PT]                 |
| **Salesforce**                         | The permission-set summary (Winter '24 beta, Summer '24 GA) lists what a set grants. The User Access Summary (Winter '25) has an "Access Granted By" button                         | Admins                                   | S [SF-UAS]                |
| **AWS**                                | Denial messages carry the ARN of the denying policy, only within the same account or organisation, without its contents                                                             | The denied user                          | VV (2026-03-04) [AWS-ARN] |
| **Microsoft My Access**                | Users see their access packages, request history, status and, if the policy allows, approvers                                                                                       | End users                                | VV [MS-MYACC]             |
| **Salesforce Setup Audit Trail**       | Records setup changes including "permission set assignments". Kept for 180 days                                                                                                     | Admins                                   | S [SF-SAT]                |
| **ICRC RFL Code**                      | Keep a "record of the staff members that have access" and a historical log, for accountability                                                                                      | Controller                               | VP [RFL-COC]              |

**Observations.**

- **"Why" explainers are admin-side tools.** End users get only the denial and a request path. AWS is the exception: it tells the denied user which policy denied them, within the same organisation [AWS-ARN].
- **Missing feedback causes over-granting** [XU17]. That argues for telling admins exactly which permission is missing.

---

## 10. Edge cases and how leading products handle them

| #   | Edge case                                                          | How products handle it                                                                                                                                                                        | Evidence   |
| --- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| E1  | The importer's permission is removed while their import is running | GitHub keeps the original authority. Slack revokes user tokens. Entra pushes revocation within about 15 minutes. NIST accepts "next access". ASVS 8.3.2 says immediately, or alert and revert | §1.1–1.2   |
| E2  | The importer is deactivated while a draft or held rows remain      | HubSpot keeps assets labelled as from a deactivated user. Google transfers ownership at deletion. Attio shares drafts. Planning Center fails open (anti-pattern)                              | §1.3       |
| E3  | A background job writes using a service identity, not the person's | ASVS 8.3.3 says to use the originating consumer's permissions. Salesforce exempts "automated background jobs" from step-up                                                                    | §1.2, §5.1 |
| E4  | A download link was created before access was revoked              | AWS links die with the creating credential. Expiry is checked at request time, and a download in progress completes                                                                           | §1.1, §5.2 |
| E5  | A secret or key outlives its creator                               | Stripe keys persist and must be rotated. Slack bot tokens persist                                                                                                                             | §1.1       |
| E6  | Removing or demoting the last owner                                | Blocked in Entra, Slack and GitLab, and for HubSpot self-deletion                                                                                                                             | §2         |
| E7  | The only admin leaves a small church                               | Vendor support verifies billing facts or leadership letters (Planning Center, Church Metrics, ParishSOFT, PowerChurch)                                                                        | §2         |
| E8  | The no-access page names the approvers                             | Slack, GitHub and HubSpot name them. Microsoft makes it configurable. Google, SharePoint, Planning Center and Confluence don't                                                                | §3.1       |
| E9  | The approver is a protected or alias-only person                   | Not found                                                                                                                                                                                     | §3 (U)     |
| E10 | A link to another tenant's object                                  | 404 or not found (GitHub). ASVS 8.4.1                                                                                                                                                         | §3.2       |
| E11 | A column maps to a field the importer can't edit                   | Hidden from mapping (Salesforce), possibly fails or drops data (HubSpot, S), returned as null (Dataverse). Locked-with-reason: not found                                                      | §4         |
| E12 | A field restriction enforced only in the UI                        | HubSpot's API bypass and "not … a security measure". Bloomerang's old mobile app ignores permissions                                                                                          | §4, §5.3   |
| E13 | Re-authentication friction on every view                           | Salesforce rolled it back to export-only                                                                                                                                                      | §5.1       |
| E14 | Dual approval in a one-admin organisation                          | Google multi-party approval needs two or more super admins. HubSpot approvals need approvers                                                                                                  | §5, §6     |
| E15 | No second person exists to review                                  | CC8: "all trustees reviewing transaction reports". Oregon DOJ: board or volunteers. Entra: alert and post-mortem                                                                              | §6         |
| E16 | A new capability reaches existing users                            | Shopify and Planning Center enabled it for existing users. Google lets admins choose. NIST and OWASP say deny by default                                                                      | §7.3       |
| E17 | A bulk file of protected people leaves the system                  | The ICRC code says avoid local storage and never put particularly sensitive data on removable media. Mission agencies say "don't post it"                                                     | §8         |
| E18 | An admin asks why someone can't do something                       | Jira Permission Helper, Google Policy Troubleshooter, Salesforce "Access Granted By", AWS denial ARNs                                                                                         | §9         |

---

## Synthesis for Asym _(inference)_

This section maps the evidence onto Q20 Option B. The six permissions are See imports, Prepare and run imports, Change existing values, Reverse imports, Download import rows and Run the Switch. "Sensitive" means a named grant that is never in a template and alerts when granted. Owners hold everything, the Importer starting set holds See imports plus Prepare and run imports, and everyone else holds nothing.

### Adopt

1. **Re-check authority at every step boundary, against the person.**
   - Every server action in Data Tools already runs per request. Long-running work should also re-check at each batch or phase boundary that the originating person still holds Prepare and run imports, any batch permission needed for Gift files, and their clearance (ASVS 8.3.2, 8.3.3; AC-3(8); Zanzibar).
   - If they no longer do, stop at the next safe boundary. Keep what was atomically committed. Show the run as stopped because "the person who started it no longer has access", and let any current holder of Prepare and run imports resume or cancel it.
   - Do not copy GitHub's "original actor's privileges persist" model. It suits CI, not writes to financial records.
2. **Derived artefacts die with the authority behind them** (the AWS model).
   - Generate the Download import rows file at click time, as a short-lived link (minutes, not days).
   - Re-check the permission and clearance when the link is fetched. Revoking the permission or deactivating the person then kills every outstanding link.
3. **Drafts are team-owned, so nothing is orphaned and no transfer wizard is needed.**
   - Q20 already lets anyone with Prepare and run imports continue a colleague's draft. That covers the HubSpot, Google and Attio transfer cases.
   - On deactivation, show the starter as a deactivated person (the HubSpot label pattern) and never widen visibility (the opposite of Planning Center's fail-open).
4. **Last-Owner guard.**
   - Block removing, demoting or deactivating the ministry's last Owner (Entra, Slack, GitLab, HubSpot).
   - Because Owners hold every permission, no separate last-holder guard per permission is needed.
   - Show a "you're the only Owner" banner recommending a second Owner (Planning Center, GitHub, Google, Church Metrics).
5. **"Ask {names}" is acceptable, with limits.** Names go only to signed-in members of the same ministry, as with Slack, GitHub, HubSpot and AWS's same-organisation rule.
   - **Who is named:** only people who can actually grant Data Tools permissions, capped at about three, names only (no email or phone). Each name is shown as the viewer is allowed to see that person, so an alias-only or restricted Owner appears by alias or is left out (E9).
   - **Never on cross-ministry pages:** the cross-ministry case stays "not found" (E10).
   - **Never reveal the import:** the page must not show the import's file name or counts.
   - **Suggested wording**, following the NN/g remedy rule and The National Archives' pattern: "You don't have access to Data Tools. Ask {Name A} or {Name B} to give you access."
6. **Columns the importer can't write should be visible, locked and explained in matching.**
   - Example: "You can't import into Gift amount. You need Gift entry's batch permission." No product does this (U), but it avoids the HubSpot-style silent loss and follows Xu et al.'s finding that missing feedback drives over-granting.
   - Do not apply this to anything whose existence is itself sensitive. Ordinary fields aren't.
7. **Download import rows: a proportionate control set.**
   - Keep the r2 controls: log the download, leave out people the downloader can't see, never include protected people in bulk, and neutralise CSV formulas.
   - Alert the other Owners (sensitive).
   - Use short links re-checked at fetch (item 2).
   - Add a re-authentication step at the moment of download, but only if Asym already has a re-auth primitive. Salesforce converged on step-up at export, and GitHub uses a two-hour sudo window.
   - The ICRC code's line on removable media argues for keeping protected people out of the file entirely, which Q20 already does.
8. **The compensating control for one-person ministries is notification plus review.**
   - "Notify the other Owners when someone reverses an import, changes existing values or downloads rows" is recognised in substance: CC8 has trustees review transaction reports, Microsoft alerts and holds a post-mortem, and NIST lists auditing. No source uses that exact phrase (U).
   - It only works if someone else receives the alert. When the actor is the only Owner, the alert should go into an Owners' activity list that can be reviewed later (CC8 §2.6 annual review, with records), and the one-Owner banner applies.
9. **Keep the template count small.** Owners, Importer and none sits within the market range (two to four roles: Bloomerang, Neon, Virtuous, LGL and Planning Center).
   - Bloomerang's default of Data Tools for every Standard user is the counterexample. Asym's default-deny matches NIST and OWASP.
   - The Shopify and Planning Center grandfathering does not apply, because Data Tools is a new capability and nobody loses existing function.
10. **"Why can't I?" for Owners only, kept simple.**
    - A per-person view shows each Data Tools permission, where it came from (template or named grant) and the person's clearance (the Salesforce "Access Granted By" and Jira Permission Helper pattern).
    - The denied person's page names the missing permission (the AWS same-organisation precedent), not the policy internals.
    - Record grants, removals and alerts in the audit trail (the ICRC historical log, Salesforce Setup Audit Trail, AC-2).
11. **Held rows need a visible owner and an escape hatch.**
    - Only people with full access can clear "Needs review by someone with full access". If nobody in the ministry has that clearance, the rows stay stuck forever.
    - Owners should see a neutral count ("N rows waiting for someone with full access") and be told when no current member can clear them.
    - The importer keeps seeing only the shared neutral reason (r2 §3.2, the Dataverse null-indistinguishable precedent, ICRC need-to-know).

### Reject as over-engineering for small ministries

- **CAE-style real-time revocation streams.** A per-request and per-batch server check (item 1) gives the same result in Asym's architecture, and even Microsoft accepts minutes to a day of lag.
- **Multi-party approval and export approval queues.** These need two or more admins (Google multi-party approval, HubSpot approvals). They fail in exactly the one-Owner ministries Asym serves. Use alerts and review instead (item 8).
- **Shared break-glass accounts.** Entra's model needs safes, drills and a separate team, and it conflicts with CC8 §4.2 ("Users should not share their security details"). Use vendor-assisted Owner recovery instead (see Conflicts).
- **PIM-style time-boxed activation for every sensitive permission.** r2 floated a step-up for reversal. A re-authentication prompt at the action is enough. Eligible/active role activation adds a concept staff won't understand (Xu et al., role explosion).
- **Per-field permission matrices.** Asym uses record access plus clearance plus a few capabilities. Showing locked columns (item 6) covers the user need without a new permission dimension (ASVS 8.2.3 is satisfied by enforcing existing field rules server-side).
- **A policy simulator.** The per-person effective-permissions view (item 10) is enough.
- **Ownership-transfer wizards for drafts.** Team ownership (item 3) makes them unnecessary.

### Open point for the founder

- **Who recovers a ministry whose only Owner has gone?** Every church vendor surveyed does it through its own support team, using billing or leadership verification. Q5 says no Asym identity decides Switch matters. An account-recovery path is a different kind of decision, but it should be ratified explicitly rather than assumed.

---

## Conflicts between sources

- **Job authority after removal.**
  - GitHub keeps the original actor's privileges for re-runs and lets scheduled workflows keep running after the user is removed [GH-RERUN][GH-SCHED].
  - ASVS 8.3.2 and 8.3.3, NIST AC-3(8), Slack's token revocation and GitHub's own Enterprise Managed Users behaviour all end authority with the person [ASVS-V8][NIST-AC3-8][SL-APPS][GH-SCHED].
- **How fast "immediate" is.**
  - ASVS 8.3.2 says immediately.
  - Microsoft's own target is "near real time" with up to 15 minutes' latency, and up to one day for group changes [MS-CAE].
  - NIST accepts revocation at next access [NIST-AC3-8].
- **Break-glass credentials versus no shared credentials.** Entra wants emergency credentials "available to multiple members of the administration team" [MS-EMERG]. CC8 says "Users should not share their security details with one another" [CC8]. Entra itself also offers individual emergency accounts as an alternative.
- **Naming admins.** Slack, GitHub and HubSpot expose admins to members [SL-FIND][GH-ROLES][r2 HS-REQ]. Google says "we can't tell you exactly who that person is" [GW-FINDADM]. Planning Center and Confluence route without naming. Security commentary treats admin names as reconnaissance [SE-RECON] (S).
- **Two admins.** Every vendor recommends at least two [PC-XFER][GH-OWN][GW-ADMBP][CM-ADM][MS-EMERG]. Small churches often have one, and dual-control features such as Google multi-party approval are unavailable to them [GW-MPA].
- **Salesforce import field-level security.** Salesforce's cheat sheet says imports are limited to accessible fields (r2 [SF-PERS]). A legacy third-party guide says admins can import into hidden or read-only fields [SF-FLS-S].
- **HubSpot property restrictions.** Restrictions apply in the UI, but "users … will still be able to set the property's value … via HubSpot's API". HubSpot calls them "not recommended … as a security measure" [HS-PROP]. ASVS 8.2.3 expects field-level rules enforced for every consumer [ASVS-V8].
- **Step-up scope.** Salesforce first applied step-up to viewing reports, then narrowed it to export after "unintended friction" [SF-STEPUP][SF-STEPUP-S]. GitHub applies sudo broadly to account-security actions [GH-SUDO].
- **Confirmation of existence.** The ICRC code gives data subjects a right to "confirmation as to whether or not their personal data are being processed". It also restricts access for the "rights and freedoms of others" [RFL-COC]. That is the same tension as r2 §3.2 (GitHub 404 versus Salesforce "notify without showing").
- **Default for new access.** Bloomerang turns Data Tools on for new Standard users [BL-CRM]. Shopify and Planning Center grandfathered existing users (r2). Google leaves the choice to the admin [GW-NEW]. NIST and OWASP require deny-by-default.
- **Google super-admin self-recovery.** Google recommends turning it off when there are several super admins, but defaulted it ON for customers with fewer than three [GW-SAREC] (S). The small-organisation default favours availability over strictness.

---

## Sources

All accessed 2026-11-04.

**Job authority and offboarding (Q1)**

- [GH-RERUN] https://docs.github.com/en/actions/how-tos/manage-workflow-runs/re-run-workflows-and-jobs ; https://github.blog/changelog/2022-07-19-differentiating-triggering-actor-from-executing-actor (S, search-quoted)
- [GH-SCHED] https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows (VV)
- [GH-TOKEN] https://docs.github.com/actions/concepts/security/github_token (S)
- [GAS-TRIG] https://developers.google.com/apps-script/guides/triggers/installable (VV)
- [GAS-S] https://cloud.motorsport.unibo.it/article/the-definitive-guide-to-changing-ownership-of-a-google-sheet (S)
- [MS-CAE] https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-continuous-access-evaluation (VV, ms.date 2026-04-08)
- [SL-DEACT] https://slack.com/help/articles/204475027-Deactivate-a-members-account (VV)
- [SL-APPS] https://slack.com/help/articles/360000446446-Manage-deactivated-members-apps-and-integrations (VV)
- [ST-KEYS] https://docs.stripe.com/keys (VV)
- [ST-S] https://www.stitchflow.com/user-management/stripe/manual (S)
- [SF-SCHED] https://plauti.com/support/dc-troubleshooting/dc-telemetrylicense-email-with-error-messages- ; https://dev.to/rakesh_kumar_edb0af90d320/from-deactivation-chaos-to-clarity-streamline-your-salesforce-user-deactivations-effortlessly-3o3d ; https://vantagepoint.io/blog/sf/salesforce-records-owned-by-inactive-users ; https://www.cloudkettle.com/wp-content/uploads/2019/04/CloudKettle-How-To-Deactivate-User-In-Salesforce-Guide.pdf (S)
- [HS-DEACT] https://knowledge.hubspot.com/settings/deactivate-hubspot-users (VV, updated 2026-09-28)
- [GW-XFER] https://knowledge.workspace.google.com/admin/drive/transfer-drive-files-to-a-new-owner-as-an-admin (VV, updated 2026-10-26)
- [AWS-PRESIGN] https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html (VV)
- [NIST-AC2] https://csf.tools/reference/nist-sp-800-53/r5/ac/ac-2/ (VP)
- [NIST-AC3] https://csf.tools/reference/nist-sp-800-53/r5/ac/ac-3/ (VP)
- [NIST-AC3-8] https://csf.tools/reference/nist-sp-800-53/r5/ac/ac-3/ac-3-8/ (VP)
- [ASVS-V8] https://github.com/OWASP/ASVS/blob/master/5.0/en/0x17-V8-Authorization.md (VP; 8.3.2, 8.3.3 and 8.2.3 partly paraphrased because of fetch quote limits)
- [ZAN] https://research.google/pubs/zanzibar-googles-consistent-global-authorization-system/ (VA, USENIX ATC 2019)
- [ZAN-S] https://blog.bytebytego.com/p/how-google-manages-trillions-of-authorizations ; https://osohq.com/post/zanzibar (S)

**Last admin and recovery (Q2)**

- [MS-EMERG] https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/security-emergency-access (VV, ms.date 2026-06-04)
- [GW-ADMBP] https://knowledge.workspace.google.com/admin/users/security-best-practices-for-administrator-accounts (VV, updated 2026-10-26)
- [GW-SAREC] https://support.google.com/a/answer/9436964 ; https://workspaceupdates.googleblog.com/2020/01/password-recovery-for-gsuite-super-admins.html (S)
- [GH-OWN] https://docs.github.com/en/organizations/managing-peoples-access-to-your-organization-with-roles/maintaining-ownership-continuity-for-your-organization (VV)
- [GH-ORPH] https://github.com/orgs/community/discussions/200466 (S)
- [GL-OWN] https://gitlab.com/gitlab-org/gitlab/-/issues/441282 ; https://gitlab.com/gitlab-org/gitlab/-/merge_requests/153378 (S)
- [PC-XFER] https://help.planningcenter.com/en/145390-transfer-planning-center-account-administration.html (VV, published 2026-11-03)
- [CM-ADM] https://help.churchmetrics.com/en/articles/12044638-managing-admin-access-and-roles (VV, 2025-10-20)
- [TL-OWN] https://help.tithe.ly/hc/en-us/articles/9297638240919 (S, 403)
- [CH-REC] https://support.parishsoft.com/hc/en-us/articles/14636101935131-Getting-Started-as-a-New-Parish-Administrator-in-ParishSOFT-Family-Suite ; https://www.powerchurch.com/forum/viewtopic.php?p=4544 (S)

**Request access and naming (Q3)**

- [GW-FINDADM] https://support.google.com/a/answer/6208960 (VV)
- [SL-FIND] https://slack.com/help/articles/360003534892-Browse-people-and-user-groups-in-Slack (VV)
- [GH-ROLES] https://docs.github.com/en/enterprise-server@3.19/account-and-profile/how-tos/organization-membership/viewing-peoples-roles-in-an-organization (S)
- [MS-MYACC] https://learn.microsoft.com/en-us/entra/id-governance/entitlement-management-request-access (VV, ms.date 2026-06-17)
- [MS-SPREQ] https://learn.microsoft.com/en-us/troubleshoot/sharepoint/sharing-and-permissions/request-access-to-resource (VV, ms.date 2025-12-04)
- [AT-COMM] https://community.atlassian.com/forums/Jira-questions/How-to-find-out-who-this-admin-is-for-an-Atlassian-org-I-am-not/qaq-p/2906481 (S)
- [NN-ERR] https://www.nngroup.com/articles/error-message-guidelines/ (VV, 2023-05-14)
- [TNA-ERR] https://design-system.nationalarchives.gov.uk/patterns/error-pages/ (VP, site updated 2026-11-03)
- [SE-RECON] https://www.tracesecurity.com/?p=2049 ; https://www.adaptivesecurity.com/blog/spear-phishing-attack-surface ; https://www.channelpartner.de/article/3888317/die-erste-verteidigungslinie-mitarbeiter-und-administratoren-2.html (S)
- [AWS-ARN] https://aws.amazon.com/blogs/security/enhanced-access-denied-error-messages-with-policy-arns (VV, 2026-03-04)

**Field-level import (Q4)**

- [SF-FLS-S] https://trailhead.salesforce.com/trailblazer-community/feed/0D54S00000EA4CUSA1 ; https://advologixpm-legacy.screenstepslive.com/a/81952-import-wizard ; https://community.hubspot.com/t5/Sales-Integrations/Unable-to-Map-new-customer-field-in-Salesforce/td-p/522312 (S)
- [HS-PROP] https://knowledge.hubspot.com/properties/restrict-view-edit-access-for-properties (VV, updated 2026-10-09)
- [HS-SENS] https://knowledge.hubspot.com/account-security/sensitive-data-in-hubspot-tools (VV, 2026-09-24)
- [HS-PROP-S] https://insidea.com/blog/hubspot/kb/how-to-manage-view-and-edit-access-for-properties-in-hubspot (S)
- [DV-CLS] https://learn.microsoft.com/en-us/power-apps/developer/data-platform/column-level-security (VV, ms.date 2026-10-28)

**Exports (Q5)**

- [GH-SUDO] https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/sudo-mode (VV)
- [SF-STEPUP] https://www.salesforce.com/blog/?p=146827 ("Balancing Security and Agility: Updates to Step-Up Authentication for Reports and Dashboards", VV, 2026-07-07)
- [SF-STEPUP-S] https://salesforcedictionary.com/blogs/salesforce-report-export-step-up-authentication-2026 ; https://www.digital.pitt.edu/news/service-announcements/new-verification-step-required-export-or-print-salesforce-reports ; https://www.xappex.com/blog/how-to-export-reports-after-salesforce-enforces-step-up-authentication/ (S)
- [GW-SENS] https://knowledge.workspace.google.com/admin/security/protect-google-workspace-accounts-with-security-challenges ; https://workspaceupdates.googleblog.com/2023/08/stronger-protections-for-sensitive-gmail-actions.html (S)
- [BEACON] https://thebaptistpaper.org/more-than-1000-nonprofits-impacted-by-cybersecurity-breach/ (S, news, 2026-08-12)
- [IMB-BR] https://www.baptiststandard.com/news/baptists/imb-data-breach-prompts-comprehensive-response (S, news, 2018-07-16)
- [BL-CRM] https://help.bloomerang.com/en/articles/12632881-user-permissions (VV)

**Separation of duties (Q6)**

- [CC8] https://www.gov.uk/government/publications/internal-financial-controls-for-charities-cc8/internal-financial-controls-for-charities (VP, updated 2024-11-27)
- [OR-DOJ] https://www.doj.state.or.us/charitable-activities/laws-guides-for-charities/financial-control-recommendations-small-nonprofits/ (VP, n.d.)
- [GW-MPA] https://workspaceupdates.googleblog.com/2024/04/multi-party-approvals-for-sensitive-admin-actions.html (VV, 2024-04-09); https://knowledge.workspace.google.com/admin/security/multi-party-approval-for-sensitive-actions (S)
- [SOD-S] https://www.bonadio.com/article/addressing-internal-control-gaps-compensating-controls-for-lack-of-segregation-of-duties/ ; https://www.upguard.com/compliance/iso-27001/5-3/ (S)
- [GAO-S] https://www.sai.ok.gov/Search%20Reports/database/Garfield%20County%20FY22%20TSR%20Audit%20Report%20web%20final.pdf ; https://www.nctreasurer.gov/documents/files/slgfdlgc/internal-controls-small-unit-government/open (S)
- [AICPA] https://www.aicpa-cima.com/resources/download/segregation-of-duties-reference-chart-for-NFPs-with-four-people (U, members-only)

**Roles and defaults (Q7)**

- [NE-USR] https://support.neonone.com/hc/en-us/articles/8883319142029-Adding-a-User-to-Neon-CRM (S, 403)
- [XU17] https://experts.illinois.edu/en/publications/how-do-system-administrators-resolve-access-denied-issues-in-the-/ (VA; Xu, Naing, Lu, Zhou, CHI 2017, DOI 10.1145/3025453.3025999)
- [MS-PERM23] https://www.infosecurity-magazine.com/news/just-1-of-cloud-permissions-used ; https://redmondmag.com/articles/2023/04/03/microsoft-suggests-tracking-cloud-permissions-in-2023-report.aspx (S)
- [SF-PROF] https://www.salesforceben.com/salesforce-permissions-profiles-the-latest-retirement-updates/ ; https://www.apexhours.com/salesforce-cancels-the-permissions-in-profiles-retirement/ ; https://salesforcedictionary.com/news/salesforce-news-july-9-2026-profile-permissions-retirement-cancelled (S)
- [RE-2010] https://www.academia.edu/102799721/Role_Explosion_Acknowledging_the_Problem (S)
- [GW-NEW] https://knowledge.workspace.google.com/admin/releases/turn-new-services-on-or-off-by-default (VV, updated 2026-10-26)

**Protected people (Q8)**

- [RFL-COC] https://www.icrc.org/sites/default/files/2025-08/241972_RFL_Code_of_Conduct_on_Data_Protection_V2_en.pdf (VP, Movement code v2.0, 2024; text extracted locally with pdftotext)
- [ICRC-DT] https://www.icrc.org/en/document/digital-trails-could-endanger-people-receiving-humanitarian-aid-icrc-and-privacy (VV-d, 2018-12-07)
- [ICRC-HB3] https://www.cambridge.org/core/books/handbook-on-data-protection-in-humanitarian-action/025CE3DFD1FAD908DD1412C20E49F955 (U, content not retrieved)
- [IASC] https://interagencystandingcommittee.org/node/43830 (U, content not retrieved)
- [IMB-SEC] https://www.gfbc.com/s/security-and-communications-missions.pdf (S; a church-hosted copy of IMB guidance, undated, apparently uploaded July 2018; text extracted locally with pdftotext)
- [BNG-MISS] https://baptistnews.com/article/missionsinadangerousworld/ (S)
- [MW-SEC] https://ministrywatch.com/balancing-security-and-transparency-in-the-work-of-christian-aid-and-missions/ (S, 2022-01-25)

**Explaining access (Q9)**

- [JIRA-PH] https://support.atlassian.com/jira-cloud-administration/docs/use-the-jira-admin-helper/ (VV)
- [GC-PT] https://docs.cloud.google.com/iam/docs/troubleshooting-access (S)
- [SF-UAS] https://www.apexhours.com/user-access-summary/ (S, 2024-11-14)
- [SF-SAT] https://developer.salesforce.com/workshops/admin-security-workshop/monitoring-and-response/1-audit-trail (S)

**Cross-referenced, not re-fetched:** r2 [SF-PERS], [HS-REQ], [CF-SPACE], [HS-EXAPP], [HS-EXLOG], [HS-ERR], [OW-CSV], [OW-AUTHZ], [NIST-AC5], [NIST-AC6], [MS-PIM], [PC-EXPCL], [SH-CL], [PC-TRANS], [AT-MAN]; q19-r5 §2.1–2.3 [GH-404], [DFE-NOACC].
