# Q14 R2: External practice for notes, activities, files, applications and member care in a Switch

Researched 2026-11-03 for founder question F16 (web search plus page fetches). Some vendor help centres blocked fetching (Virtuous, Breeze, Telios Law). Labels: **[snippet]** means the claim comes from a search-result excerpt and the page was not opened. **[unverified]** means no primary source confirmed it. **[gap]** means nothing public was found.

## 1. Notes and activities in donor CRMs and ChMS

- **Salesforce:** `CreatedDate`/`CreatedById` can be set only when a record is created, with the "Set Audit Fields upon Record Creation" permission ([system fields](https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/api/system_fields.htm)). Closed tasks whose `ActivityDate` is 365 or more days old are archived and drop out of normal queries ([archive](https://developer.salesforce.com/docs/atlas.en-us.api.meta/api/sforce_api_guidelines_archive.htm)). Practitioners map former users to a placeholder owner and keep the legacy value in a custom field. Salesforce stamps the completed date at load time ([Vantage Point](https://vantagepoint.io/blog/sf/migrate-activity-history-to-salesforce)).
- **Planning Center People:** the native CSV import handles "only profile information", so notes need a third-party tool. PCOMVP maps old note categories to Planning Center ones ([CSV](https://help.planningcenter.com/en/138558-import-a-csv-file-in-people.html), [PCOMVP](https://www.planningcenter.com/integrations/pcomvp)). The API's `created_by_id` is read-only and `display_date` is writable ([third-party doc](https://pub.dev/documentation/planningcenter_api/latest/planningcenter_api/PcoPeopleNote-class.html)), so imported notes likely show the importer as author **[unverified]**. Planning Center's own guide says "bringing everything over … isn't always the right call" ([guide](https://help.planningcenter.com/en/179948-switching-to-planning-center-from-another-chms-guide.html)).
- **Virtuous:** notes migrate. Note authors and tasks tied to users appear only in the live migration, not test runs, and "Modified by" and audit logs are not migrated ([UAT](https://support.virtuous.org/hc/en-us/articles/360050475592)) **[snippet]**.
- **Bloomerang:** an imported interaction needs Date, Subject, Purpose and Channel. Interactions can't be updated by import, and imports are "largely irreversible" ([imports](https://help.bloomerang.com/en/articles/12632800-imports-set-up-import-files)) **[snippet]**.
- **Little Green Light:** a note has only a type, a date and text, with no author field. Contact reports carry the team member ([LGL](https://help.littlegreenlight.com/article/517-using-notes-to-track-additional-information)).
- **Neon CRM:** activities are migrated only in the Premium conversion tier **[snippet]**. **DonorPerfect:** notes leave through the "Other Info Transactions Listing" ([CommitChange](https://help.commitchange.com/article/12-importing-supporters-from-donorperfect)) **[snippet]**. **Kindful:** **[gap]**.
- **Raiser's Edge NXT:** proposal notepads need a separate import. Attachments did not transfer even from Raiser's Edge to Altru, both Blackbaud products ([community](https://community.blackbaud.com/discussion/comment/229143/)) **[snippet]**.
- **Breeze:** has a bulk "Import Notes" task. Notes can be private, only the creator (or importer) can edit them, and notes aren't searchable ([Breeze](https://support.breezechms.com/hc/en-us/articles/360012185814-Using-Notes)) **[snippet]**.
- **Rock RMS:** "Private Notes … are viewable only by the person who entered them", and note types carry security templates ([Rock](https://www.rockrms.com/documentation/bookcontent/5/personprofilepage)). Moving from Fellowship One to Rock goes through the "tricky" Excavator tool ([Rock Q&A](https://community.rockrms.com/ask/using/1342)) **[snippet]**. Fellowship One exports notes through a report at household and individual level ([Elvanto](https://help.elvanto.com/hc/en-us/articles/7503994737047-Data-Migration-from-Fellowship-One-F1-to-Elvanto)) **[snippet]**.
- **MPDX/TntConnect (the closest missionary analogue):**
  - Tasks, task history, task notes, contact notes and appeals transfer.
  - TntConnect "Complete" becomes Completed. Open tasks become Overdue, Upcoming or No Due Date depending on their date.
  - Recurring tasks import only their next instance.
  - TntConnect fields with no MPDX equivalent, such as Children, are added to Notes.
  - Origin comments such as "Present in TntConnect" are added.
  - **Pictures do not migrate** ([Moving](https://help.mpdx.org/article/203-moving-from-tntconnect-to-mpdx), [Finding](https://help.mpdx.org/article/440-finding-tntconnect-data-after-import)).
- **Generic tools:** with Import2, "If no match is found, the import user will become the default record owner" ([Import2](https://help.import2.com/en/articles/652714-assigning-record-ownership)). HubSpot users report that imported notes take the import date **[snippet]**. On private flags: "If that flag is lost, internal notes can show up to customers" ([Supportbench](https://www.supportbench.com/preserve-historical-crm-context-migrations/)).

**Implication for Asym:** authorship is the field most often lost. Store the source author as text plus a legacy ID, and never map it to a live user. Record the actual importer separately. Completed history comes across as history, and open tasks arrive as "needs review". The visibility flag is the most important attribute of a note, because losing it breaks "staff notes never shown to missionaries".

## 2. Sensitive notes

- **How ChMS separate care notes:**
  - Planning Center applies permissions per category, and any category except General can be made private ([notes](https://help.planningcenter.com/en/138566-profile-notes.html), [2022 change](https://www.planningcenter.com/changelog/people/9728256883739-new-permissions-for-notes)).
  - Rock has author-only private notes and security per note type ([Rock U](https://chiptraining.rockrms.com/ask-chip-training/rocku/210)).
  - MinistryPlatform keeps Care Cases in a module gated by security role, with a Case Manager. Family Notes are followed up "without showing the other Household Care Log entries" ([Care Connect](https://help.acst.com/ministryplatform/help-topics/connect-suite/care-connect), [Family notes](https://help.acst.com/ministryplatform/help-topics/check-in-suite/check-in-kiosk/family--care-notes)) **[snippet]**.
  - The shared pattern: sensitivity belongs to the **category or container**, not to individual notes.
- **Member care:**
  - Missio Nexus: agree confidentiality limits and reporting lines before care begins ([Missio Nexus](https://missionexus.org/?p=78633)) **[snippet]**.
  - Some missions receive only a counselor's summary "with general recommendations, (not specific details)" ([Japan Harvest](https://japanharvest.org/?p=222)) **[snippet]**.
  - The Global Connections guidelines are members-only ([link](https://globalconnections.org.uk/resources/member-care-guidelines)).
  - No ECFA, Chartered Institute of Fundraising or Christian management guidance on transferring member-care records was found **[gap]**.
- **UK/EU:** religion and health are special-category data under Article 9 ([UK GDPR](https://www.legislation.gov.uk/eur/2016/679/article/9)), including data that _reveals_ or allows _inference_ of them ([ICO](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/special-category-data/what-is-special-category-data/)). The not-for-profit condition in Article 9(2)(d) covers members and regular contacts only, with no disclosure outside the body without consent. Data minimisation means "adequate, relevant and limited" ([ICO](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/data-minimisation/)).
- **Canada:** the Privacy Commissioner treats religious beliefs and health as generally sensitive ([OPC](https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/pipeda-compliance-help/pipeda-interpretation-bulletins/interpretations_10_sensible/)). In one finding, donors who gave "for religious reasons" did not expect their data to be shared ([PIPEDA-2021-009](https://www.priv.gc.ca/en/opc-actions-and-decisions/investigations/investigations-into-businesses/2021/pipeda-2021-009/)). BC PIPA and Quebec Law 25 apply to nonprofits ([Charity Law Group](https://www.charitylawgroup.ca/charity-law-questions/compliance-obligations-for-privacy-legislation-charities-and-not-for-profits)) **[snippet]**.
- **US:**
  - Washington's My Health My Data Act has no nonprofit exemption and includes a private right of action ([Jones Day](https://www.jonesday.com/en/insights/2023/04/my-health-my-data-washington-enacts-first-state-comprehensive-health-privacy-law)) **[snippet]**.
  - Oregon's privacy act has covered nonprofits since 1 July 2025, with religious beliefs and health as sensitive data ([Oregon DOJ](https://www.doj.state.or.us/consumer-protection/for-businesses/privacy-law-faqs-for-nonprofits/)).
  - Colorado is similar **[unverified]**.

**Implication for Asym:** classify by **source container**, never by reading content, which also fits the no-AI rule. Free text whose source category is unknown or mixed is restricted by default. Member care is never imported as notes. It goes either to a dedicated restricted destination or to the sealed archive (section 6). Minimisation gives a legal reason to leave data behind.

## 3. Files and attachments

- **Vendors often skip files:**
  - HubSpot moves attachments only as a "one-time transfer" ([HubSpot](https://knowledge.hubspot.com/integrations/understand-hubspot-s-crm-migration-process)).
  - MPDX drops TntConnect pictures.
  - Raiser's Edge attachments failed to transfer, and Blackbaud advised keeping copies elsewhere **[snippet]**.
- **Size limits:** Salesforce ContentVersion accepts up to 2 GB through REST ([Salesforce](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/dome_sobject_insert_update_blob.htm)). Raiser's Edge NXT allows 100 MB **[snippet]**. Typical volumes: **[gap]**.
- **Malware:** OWASP recommends:
  - an extension allowlist plus signature checks;
  - names generated by the application;
  - size limits and storage outside the webroot;
  - an antivirus scan or sandbox;
  - Content Disarm & Reconstruct (CDR) for PDF and DOCX;
  - decoding and re-encoding images, which strips metadata ([OWASP](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)).
- **Photos:**
  - Parental consent is the norm for children's images. The ICO has reprimanded schools for sharing pupil photos against parents' refusal ([Bates Wells](https://bateswells.co.uk/updates/ico-warns-schools-about-use-of-childrens-images/)) **[snippet]**.
  - Mission agencies blur faces, keep locations generic and drop high-security workers from prayer lists ([CRCNA](https://network.crcna.org/global-mission/your-guide-communicating-missionaries-closed-countries), [Baptist Press](https://www.baptistpress.com/resource-library/news/prayer-lists-will-exclude-last-frontier-missionaries)) **[snippet]**.

**Implication for Asym:** files are optional and secondary. Every imported file is quarantined, scanned and type-checked, and images are re-encoded, which strips GPS metadata. Photos arrive hidden from donor-facing surfaces until confirmed, which matters most for children and restricted missionaries. SiteStacker saves inbound **email attachments** as record files (section 7), so its file store may hold arbitrary content.

## 4. Applications and onboarding records

- **Tools:** SiteStacker runs applications as Workflows with Form, File Upload, Note and DocuSign tasks. References fill in forms through pre-login tokens ([Tasks](https://training.sitestacker.com/support/solutions/articles/151000122441-tasks), [tokens](https://training.sitestacker.com/support/solutions/articles/151000183505-pre-login-tokens-setting-a-time-limit)). ServiceReef markets "application answers … medical forms in one place" ([ServiceReef](https://www.servicereef.com/sending-agencies)) **[snippet]**.
- **Confidentiality:** in the UK, references given in confidence are exempt from subject access, for both the giver and the recipient ([DPA 2018 Sch 2 para 24](https://www.legislation.gov.uk/ukpga/2018/12/schedule/2/paragraph/24/enacted)). Psychological assessments go only to people named on a signed release, or to a single convener ([NDS](https://nds.edu/wp-content/uploads/2024/05/06.Psychological-Assessment-Procedures.pdf)) **[snippet]**.
- **Retention:**
  - US employers covered by EEOC rules keep applications for one year, or longer if a charge is filed ([29 CFR 1602.14](https://www.ecfr.gov/current/title-29/subtitle-B/chapter-XIV/part-1602/subpart-C/section-1602.14)).
  - APA guidelines have the _psychologist_ keep records for 7 years ([APA](https://www.polk.edu/wp-content/uploads/6-APA_Record_Keeping_Guidelines.pdf)).
  - The Presbyterian Mission Agency destroys personnel records 6 years after termination **[snippet]**.
  - Moving historical applications between sending-agency systems: **[gap]**.

**Implication for Asym:**

- Accepted missionaries need only summary facts: status, dates and approved role.
- Raw applications, references and evaluations are confidential, kept for a time limit and seldom reopened, so they go to the archive.
- Applications still open at Switch time are finished in the old system or restarted in Asym.

## 5. Communication history

- A Mailchimp audience export does not include opens or clicks. Getting them means exporting reports one campaign at a time ([Adobe](https://experienceleague.adobe.com/en/docs/commerce-business-intelligence/mbi/analyze/connecting/import-mailchimp-data)).
- Practitioners advise against migrating auto-logged opens ("creates noise") and warn that "partial data can be worse than not migrating it" ([Rework](https://resources.rework.com/vi/guides/data-migration/handling-historical-activities)).
- HubSpot syncs "sales emails" only.

**Implication for Asym:** carry over one-to-one emails that already exist as activities. Leave newsletters and engagement metrics in the email service provider. Move consent and subscription status, because that is current state and not history.

## 6. Archive alternatives

- Vendors advise keeping an "untouched master copy" ([Neon](https://neonone.com/resources/blog/donor-data-migration/)), exporting retired data "into a usable format" ([Bloomerang](https://bloomerang.com/blog/7-decisions-nonprofits-will-face-during-donor-data-migration)) and keeping exports in two places ([DonorDock](https://www.donordock.com/articles/nonprofit-crm-migration-checklist)) **[snippet]**.
- Lausanne ranks data as "must have / nice to have / no longer need" ([Lausanne](https://conversation.lausanne.org/resources/detail/13987/)).
- In enterprise practice, application retirement means a searchable archive with retention rules, access controls and audit logging ([dev.to](https://dev.to/sam_mitchell_ee4afb8d68c3/application-retirement-the-complete-guide-to-retiring-legacy-applications-without-losing-critical-5b2i)). A read-only legacy app still costs licences and lingers ([Kore1](https://www.kore1.com/decommissioning-legacy-systems/)). Every archive needs a named owner.

**Pros:** no reclassification, a faster Switch, minimisation and a complete original. **Cons:** staff search in two places, and the archive needs its own access control and retention. An unowned archive also becomes an uncontrolled copy of sensitive data.

**Implication for Asym:** the archive is a deliberate, ministry-owned output of the Switch and not a failure to migrate. It is listed in the Switch report.

## 7. SiteStacker specifics

Public documentation covers the **import** side only ([Importing CRM Records](https://training.sitestacker.com/support/solutions/articles/151000122066-importing-crm-records)):

- **Person Activities:** types include Chat, Conversation, Email, Phone Call, Text and Social Media. Fields are subject, body, date, an "important" flag and a "from" person. There is no author field.
- **Person Note:** has type, subject, body, an important flag and a "from" person.
- **Person File** and **Person Photo** are both stored in File Manager.
- The CRM's **Files** tab lists every attached file ([overview](https://training.sitestacker.com/support/solutions/articles/151000122137-crm-component-overview)).
- Inbound email captured through SendGrid becomes an Email activity, and "any files attached … will be stored as files on the CRM record" ([SendGrid](https://training.sitestacker.com/support/solutions/articles/151000121998-configuring-your-sendgrid-account-to-capture-inbound-emails)).
- Tasks are **workflow** steps, not CRM to-dos.
- Export is a filtered grid saved as CSV ([Export](https://training.sitestacker.com/support/solutions/articles/151000122134-export-donor-and-contact-records-from-crm)).

Not public **[gap]**: bulk export of activities, notes or files; member-care features; permissions on notes; export of form submissions; API resources. These need a ministry-side discovery sample.

## 8. UX patterns

- **Origin markers:** MPDX adds origin comments and suggests import tags. Practitioners use `legacy_id`, fields prefixed "Legacy", and an "Original type" first line when activity types are collapsed into notes ([Rework](https://resources.rework.com/vi/guides/data-migration/handling-historical-activities)).
- **Author and date:** Planning Center shows the date and creator, which on an import is the importer.
- **Timeline:** Rock mixes system-generated and staff notes and pins alerts. Practitioners warn that bulk history leaves staff "scrolling through noise".
- **Findability failures:** Breeze notes aren't searchable **[snippet]**, and archived Salesforce activities disappear from normal queries.

**Implication for Asym:** show one "Imported from {source}" marker, with the original author as text and the original date. Imported items should be filterable and collapsible, and searchable under the same visibility rules as native notes.

## Common failure modes

1. A lost private flag exposes staff notes to the person they describe.
2. Every note is attributed to the importer, or to a random active user.
3. Open tasks become live reminders, or completed tasks get the import date.
4. Care content hides in ordinary notes, either through a "General" category or through legacy fields concatenated into notes.
5. Attachments are silently dropped, or arrive unscanned with GPS metadata.
6. Photos of children or restricted missionaries appear on donor-facing pages.
7. Partial email metrics mislead staff.
8. An archive has no owner, retention period or access control.
9. Imported history can't be searched, or floods the timeline.

## Simplest robust defaults

- Notes and completed activities come across one by one, with the original date, the source author as text, a source ID, an "Imported" marker and **staff-only visibility**. Nothing imported is missionary-visible.
- Visibility follows the source category. An unknown category is restricted, and care categories or modules are excluded.
- Open tasks arrive as a "review after Switch" list.
- Member care, applications, references and evaluations are **not imported**. They go to the ministry's sealed archive, with a counted line in the Switch report.
- Files are opt-in by category. Each is quarantined, scanned, checked against an allowlist and re-encoded if it is an image. Photos arrive hidden until confirmed.
- Communication history: one-to-one email activities only. Consent status moves; opens, clicks and newsletters do not.
- Every Switch produces a per-object reconciliation of counts: imported, restricted, archived, rejected.

## What not to build

- Content scanning or AI classification of notes.
- Re-creating source users, or impersonating authors.
- Migrating opens, clicks or campaign archives.
- A document-management system, or a hosted copy of the old system.
- A member-care or psychological-evaluation module built just to receive Switch data.
- Two-way sync with SiteStacker, or repeated re-imports.
