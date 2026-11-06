# Q09 R3: Modern best practice for migrated permissions, tested against decision B

All sources accessed 2026-11-02. This builds on `q09-r2-external-consent.md` (CAN-SPAM, CASL basics, GDPR/PECR, TCPA, ESP import rules) and `q09-r1-repo-consent.md` and does not repeat them. This is research, not legal advice.

**Labels.** **VP** = verified primary (statute, regulation or standard, fetched). **VV** = verified vendor, mailbox-provider or industry-body document, fetched. **S** = secondary (law firm, press, community post, docs mirror, or search snippet). **U** = unverified. _(inference)_ marks my own reasoning.

**Blocked or substituted.** crtc.gc.ca and ico.org.uk returned 403 to both WebFetch and curl. developer.salesforce.com returned 403, so I used a GitHub mirror of the Salesforce Object Reference (API v67, Summer '26) (S). legisquebec.gouv.qc.ca worked through curl this time (VP). The EDPB consent-guidelines PDF returned 404. help.brevo.com returned 403. I found no migration guides for Bloomerang, Neon, DonorPerfect, Virtuous or Kindful, and no AFP deceased guidance. The Fundraising Regulator Code text was not fetched.

## 1. Consent record data models

- **Salesforce ContactPointTypeConsent** (S, mirror: https://github.com/Avinava/sf-documentation-knowledge/blob/main/knowledge/current/object-reference/contactpointtypeconsent.md):
  - `PartyId` is "Required" and points to the Individual.
  - `ContactPointType` is the "contact method you want to apply consent to" (Email, MailingAddress, Phone, Social, Web). `EngagementChannelType` adds SMS and others.
  - `DataUsePurposeId` is the purpose.
  - `PrivacyConsentStatus` is "Required". Values: "NotSeen, Seen, OptIn, OptInPending, OptOut, OptOutPending".
  - `CaptureDate`: "Required. Date when consent was captured."
  - `CaptureSource`: "Required. Indicates how you captured consent. For example, a website or online form."
  - `CaptureContactPointType`: "Required. Indicates how you captured consent."
  - `DoubleConsentCaptureDate`: "Date when double opt-in was captured."
  - `EffectiveFrom` / `EffectiveTo`: "Date when consents starts" and "Date when consent ends."
  - `BusinessBrandId`: "the Business Brand that the individual has given consent to".
  - `DataUsePurpose.LegalBasisId` is "a lookup to `DataUseLegalBasis`, not a picklist". The same integration guide warns that "Capture Date and Effective From carry the original decision time, not the time the sync ran" (S: https://docs.secureprivacy.ai/integrations/salesforce/complete/).
- **Dynamics 365 Customer Insights – Journeys** (VV: https://learn.microsoft.com/en-us/dynamics365/customer-insights/journeys/real-time-marketing-email-text-consent):
  - Consent is keyed to the address: "The system stores customer consent for each email address or phone number, not for each contact record."
  - Each purpose has an enforcement model. Restrictive: the app "sends the email only if the email address explicitly opts in". Nonrestrictive: it sends "as long as the email address hasn't opted out".
  - "The default **Commercial** purpose is **Nonrestrictive** and the default **Transactional** purpose is **Disabled**. These are product defaults, not legal recommendations."
  - "Users always need to opt in to get commercial SMS."
  - The consent center shows "type, status, source of consent data, and date modified", plus an audit history of "who made the changes and when".
  - A topic opt-in does not override an opted-out parent purpose.
- **HubSpot** (VV: https://knowledge.hubspot.com/contacts/how-can-i-track-lawful-basis-of-processing-in-hubspot):
  - Each contact carries a lawful basis: "Legitimate interest – Customer", "Freely given consent from contact", "Not applicable", and others.
  - The import flow sets it through "Set the legal basis for processing a contact's data". The import consent checkbox affirms that "contacts expect to hear from you and that your import file does not include a purchased list" (S, KB snippet).
  - On opt-in (VV: https://knowledge.hubspot.com/articles/kcs_article/email/understand-opt-in-consent-for-email):
    - "having a past relationship with someone does not mean they consent to bulk communication from your new brand"
    - "Verbal consent is not verifiable"
    - acceptable evidence includes "Contacts who made a purchase with your brand in the last two years"
    - consent from a prior company "does not transfer over to your new company"
- **Klaviyo** (VV: https://help.klaviyo.com/hc/en-us/articles/115005078487):
  - "provide each profile's `consented_at` timestamp at least 5 minutes in the past"
  - "Apply bulk consent" only "if everyone in your CSV has explicitly consented"
  - "select only the channels they have consented to"
- **Raiser's Edge NXT** (VV: https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-constituent-consent.html):
  - Channel: "An overall communication method, such as email or SMS."
  - Category: "A specific communication method within a channel, such as a newsletter."
  - Consent statement: "Language used to obtain consent."
  - Source: "Where consent was collected"
  - Date: "When consent was given and when it expires (if applicable)", plus a privacy-notice link.
  - "Channel opt-in is required to enable consent of a category in the channel."
  - "No response" "does not overwrite an existing Opt-in or Opt-out".
  - Users describe consent records as "really just an audit layer on the solicit codes" (S, Blackbaud community).
- **Bloomerang** (VV: https://help.bloomerang.com/en/articles/12632580-change-communication-restrictions-or-email-interests): "You can't unsubscribe constituents from transaction emails … Acknowledgement, Receipt, or Pledge Reminder." Email interests "apply to only your marketing emails".
- **Givebutter** (VV: https://help.givebutter.com/en/articles/5497872-how-to-import-contacts): "If there are any email addresses provided in this import, a subscription status must be entered." Sources conflict on what a blank defaults to (S).
- **ISO/IEC TS 27560:2023.** The text is paywalled and under revision as CD 27560.2. The W3C DPV mapping lists these as required: schema version, record identifier, data subject, purpose, personal data type, notice ("Reference to the specific version of the notice") and notice language, data controller(s), recipients, and "Consent Change & Withdrawal". Legal basis, event time and event state are also listed. States include requested, given, withdrawn, lapsed (expired) and invalidated, and "changes to consent must also be recorded" (S: https://w3c-cg.github.io/dpv/guides/consent-27560).

**Conclusion: minimum fields** (synthesis of the above _(inference)_):

| Migrated **permission** record                                                                                                      | Migrated **block** record                                                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Person and exact contact point (normalized address or number)                                                                       | Level: **person** (deceased, do-not-contact, do-not-solicit, do-not-mail, do-not-call) or **contact point** (unsubscribe, complaint, hard bounce/cleaned) |
| Sender/controller (the ministry; a missionary "on behalf of" the ministry)                                                          | Type and **scope** (channel, purpose or list, or all)                                                                                                     |
| Channel, plus Asym purpose/list **and** the old list's ID and name (the mapping ID)                                                 | Verbatim source value and field, source system, source record ID                                                                                          |
| Status (in, out, pending, not set)                                                                                                  | **Original** event date (never the import date); reason (e.g. Mailchimp `unsubscribe_reason`); campaign, where known                                      |
| Legal basis (express consent / CASL implied with expiry / US relationship opt-out / UK-EU consent)                                  | Export file, export date and import batch                                                                                                                 |
| Original capture date, capture method, capture source (form, list), wording or notice version, DOI confirm time and IP              | Lift rule: only a new action by the person themselves, never an import or staff toggle (except a staff correction of a deceased error, with evidence)     |
| Effective from / to (CASL implied expiry)                                                                                           | Append-only history                                                                                                                                       |
| Provenance (source system, record ID, export file and date, import batch) and the Switch-lead attestation (who, when, what claimed) | —                                                                                                                                                         |

## 2. Migration playbooks

- **Order.** Vendors disagree on sequence. They agree that suppressions must be in place before the first send and must survive later imports.
  - **Klaviyo** (VV: https://help.klaviyo.com/hc/en-us/articles/115005082767): the order runs from "switch all existing sign-up forms" through cleaning and importing, then "Check which suppressions your ESP integration transfers before sending", then "Upload any hard-bounced addresses and unsubscribes that have not synced". Example: "Campaign Monitor syncs unsubscribes but does not import its bounced subscriber list." Also: "CSV imports can trigger list-based flows, including your welcome series", and "Before closing your previous ESP account, verify that your contacts and suppressions have migrated".
  - **Dynamics** (VV: https://learn.microsoft.com/en-us/dynamics365/customer-insights/journeys/real-time-marketing-migrate-consent): "Subscription lists from the legacy outbound marketing app typically map to topics within a specific purpose". The order is "First, load consent records from your subscription lists into the topics… Next, load consent records from either the contacts or leads into the parent purpose." A list holding everyone who wants no messages loads "as 'Opted out' into the **Commercial** _and_ **Transactional** purpose". On duplicates: "consent for the email is set to _Opted in_ **only** when all contacts or leads contain the value _Bulk email=Allow_. In all other cases… _Opted out_."
  - **Resend** (VV: https://resend.com/migrate/mailchimp.md): "Import the subscribed file first, then the opt-outs". Its importer ignores values like `yes`, `no` or `cleaned`, "and an ignored value means a new contact defaults to _subscribed_".
- **Mailchimp states** (VV: https://mailchimp.com/developer/marketing/api/lists/members/get-member.md): the API status values are `subscribed`, `unsubscribed`, `cleaned`, `pending`, `transactional` and `archived`. Mailchimp's own definitions (as quoted by Resend, VV):
  - non-subscribed: "interacted with you but hasn't opted in"
  - cleaned: "Hard bounces and repeated soft bounces… non-deliverable"
- **What the CSV export contains** (VV: https://mailchimp.com/help/view-export-contacts/):
  - "Exports can include subscribed, non-subscribed, unsubscribed, and cleaned contacts", and "Archived contacts are exported separately".
  - `OPTIN_TIME` ("only show for contacts who have completed the single opt-in process"), `OPTIN_IP`, `CONFIRM_TIME` ("clicked the link in the opt-in confirmation email"), `MEMBER_RATING`, `LAST_CHANGED`, marketing permissions, TAGS, NOTES.
  - **Not included:** "Email engagement metrics, like opens and clicks" and "A complete record of contact profile updates".
  - "available in your account for 30 days".
  - SMS exports carry source, acquisition time and consent revocation time.
  - The API adds `timestamp_signup`, `ip_signup`, `timestamp_opt`, `ip_opt`, `source` and `unsubscribe_reason`.
  - Resend notes that a blank `OPTIN_TIME` "only means the contact didn't arrive through a Mailchimp signup form… It isn't proof that consent is missing".
- **Complaints, archived and deleted contacts.**
  - Complainers are moved "out of your active audience and into the abuse complaints area", and "the only way to have them re-subscribed is if they use the signup forms" (VV: https://mailchimp.com/help/about-abuse-complaints/).
  - The export page names no complaint file. Complaints are available from `GET /lists/{list_id}/abuse-reports` (date, email, campaign) (VV: https://mailchimp.com/developer/marketing/api/lists/abuse-reports/list-abuse-reports.md).
  - For a contact who unsubscribed before being archived, "you can't import them as subscribed", and "archiving is not a legal substitute for deletion" (VV: https://mailchimp.com/help/archive-unarchive-contacts/).
  - Permanently deleted contacts appear in no export _(inference from the export docs)_.
- **Attestation at import is universal but is not proof.**
  - HubSpot uses a consent checkbox (S). Klaviyo uses bulk consent (VV). Constant Contact asks you to confirm consent and defaults API imports to "Implicit" (S: https://developer.constantcontact.com/api_guide/import_contacts.html).
  - HubSpot still demands "verifiable" opt-in (VV).
  - The 2026 M3AAWG BCP says senders should keep "how each individual address came to be on a list, including capturing originating/sign-up IPs, time and date stamps, a screen capture of the disclosure language and all relevant privacy policies" (VV: https://www.m3aawg.org/sites/default/files/doc_files/m3aawg-sender-best-common-practices-aug-27-2026.pdf).

## 3. Deliverability when the platform or domain changes

- **Gmail** (VV: https://support.google.com/a/answer/14229414):
  - A bulk sender sends "close to 5,000 messages or more to personal Gmail accounts within a 24-hour period" and is "permanently considered" one.
  - Requirements: SPF and DKIM; DMARC at minimum `p=none`, aligned with SPF or DKIM; "One-click unsubscribe is required only for marketing and promotional messages" (RFC 8058; mailto does not count). An unsubscribe not honored "within 48 hours" is a listed issue.
  - "keep your user-reported spam rate below 0.1% and prevent it from reaching 0.3% or higher".
  - "Starting November 2025, Gmail is ramping up its enforcement… temporary and permanent rejections."
- **Yahoo** (VV: https://senders.yahooinc.com/best-practices/): "Honor unsubscribes within 2 days" and "Keep your spam rate below 0.3%". Also: "Consider sending a reconfirmation email to inactive subscribers periodically."
- **Microsoft Outlook.com** (VV: https://substrate.office.com/ip-domain-management-snds/Postmaster/Policies): "Effective May 5th, 2025", "Domains sending more than 5,000 emails per day… must fully be compliant with SPF, DKIM, and DMARC" (DMARC "At least `p=none`… align with either SPF or DKIM"). Non-compliant mail goes "to the **junk folder**" and then "may be **rejected**" with `550; 5.7.515`.
- **RFC 8058** (VP: https://www.rfc-editor.org/rfc/rfc8058): "List-Unsubscribe header field MUST contain one HTTPS URI", together with `List-Unsubscribe-Post: List-Unsubscribe=One-Click`. Both "MUST be covered by the [DKIM] signature". The POST "MUST NOT include cookies, HTTP authorization, or any other context", and the sender "MUST NOT return an HTTPS redirect".
- **Warm-up** (M3AAWG v4.0, Aug 2026, VV):
  - "Start low and slow… (Consider 6 weeks of warm-up as an average.)"
  - "Spread messages out over time."
  - "Watch for unsubscribe and complaint rate spikes"
  - "When sending from a new subdomain… domain warming is recommended even if the organizational level domain already has an established reputation."
  - In shared environments, one sender's "poor sending or list-building practices… can 'poison' the environment". Each entity should sign DKIM with "a unique domain or subdomain". DKIM lets an entity "carry that reputation with them" to a new platform.
- **Resend's ramp** (VV: https://resend.com/docs/knowledge-base/warming-up.md). Resend says to warm up "when you use a new domain, a new IP, or a new vendor".
  - Existing domain: day 1 up to 1,000 emails (100/hour), rising to day 7 up to 10,000 (2,000/hour).
  - New domain: day 1 up to 150, rising to day 7 up to 2,000 (150/hour).
  - Keep "bounce rate below 4%" and "spam rate below 0.08%".
  - Each Asym tenant uses its own Resend account and verified domain (`docs/guides/features/resend-integration.md:3-4`), so reputation is already isolated per ministry.
- **Engaged recipients first.**
  - Klaviyo: "send exclusively to your engaged list or segment for your first few campaigns" ("first 2-3 campaigns" when sending more than weekly) (VV).
  - Google: "Start with a low sending volume to engaged users" (r2, VV).
  - Mailchimp's `MEMBER_RATING` is click-based: 4 stars means "often clicks", 5 means "consistently clicks", and 1 means "unsubscribed and resubscribed, or soft bounced" (as quoted by Resend, VV).
  - Apple Mail Privacy Protection affects about 55–60% of opens (S: https://www.litmus.com/email-client-market-share). Opens are therefore not an engagement signal; use clicks, gifts, replies and logins.
- **Sunset, bounces and append.**
  - No regulator sets a number. Vendor practice ranges from 3 to 24 months; Klaviyo's example uses "six months" (S).
  - M3AAWG defines a "Dirty Mailing List" as one that includes "not mailing to the addresses in a year or more". It recommends removing addresses that bounce "consecutively at least two times over two weeks or more".
  - Email appending "is a direct violation of core M3AAWG values" (VV).
  - Addresses dormant 12 months or more are treated as recycled-spam-trap candidates (S: https://www.validity.com/blog/what-is-a-spam-trap/).
  - On implied consent, M3AAWG says: "work toward gaining explicit consent… via a permission pass or confirmation campaign" (VV).

## 4. Re-permission campaigns

- **Measured outcomes from 2018** (all S):
  - Unicef UK kept the ability to contact 79% of active supporters (60% chose email) (search snippet of https://dma.org.uk/awards/winner/2018-silver-best-gdpr-communication; the live page now shows other content).
  - A Scottish charity feared losing "up to two thirds" of its supporters. That was a forecast, not a result (https://tfn.scot/news/charity-fears-donations-will-be-hit-by-gdpr).
  - A widely repeated "kept 45% of our lists" quote could not be traced to a source (U).
  - nfpSynergy (2017): only 16% "opted in to be asked to donate to future appeals" (https://www.civilsociety.co.uk/news/only-16-per-cent-of-donors-would-opt-in-to-future-campaigns-under-gdps-says-nfpsynergy.html).
  - Regular-giving acquisition "fell by nearly a third (32%)" in 2018 (https://www.decisionmarketing.co.uk/?p=75189).
  - DMA/Return Path found re-permission emails increasingly filtered to spam.
  - **Lesson** _(inference)_: blanket re-permission loses a large share of a list. One verified retention figure (79%) applied only to _active_ supporters.
- **The legal trap.**
  - **ICO, March 2017.** Flybe was fined £70,000 for "more than 3.3 million emails". Honda was fined £13,000 for "289,790 emails". The ICO said: "Sending emails to determine whether people want to receive marketing without the right consent is still marketing", and "Both companies sent emails asking for consent to future marketing. In doing so they broke the law." (S: https://www.theregister.com/2017/03/28/ico_fines_flybe_honda/).
  - **AMEX (£90,000, 2021).** It labeled marketing as "service emails"; the ICO said they were not "neutrally worded and purely administrative" (S: https://www.slaughterandmay.com/insights/importedcontent/consents-records-and-disguises-lessons-from-ico-direct-marketing-enforcement-actions/).
  - **CASL s.1(3)** (VP: https://laws-lois.justice.gc.ca/eng/acts/E-1.6/page-1.html): "An electronic message that contains a request for consent to send a message described in subsection (2) is also considered to be a commercial electronic message."
- **What this means for decision B's "one re-confirmation request".**
  - For a UK/EU contact with no consent evidence, an emailed re-confirmation is itself unsolicited marketing.
  - For Canadians, a consent request needs implied or express consent. The charity exemption covers only messages whose "primary purpose [is] raising funds" _(inference: a consent request is not one)_.
  - **Lawful alternatives:**
    - Ask inside an interaction the donor starts: the next online gift, a donor-portal claim, or a reply.
    - Use a channel outside PECR's email rules (post; counsel to confirm).
    - Otherwise do not email that contact.

## 5. Nonprofit suppression practice

- **Deceased.**
  - **DMAchoice Deceased Do Not Contact list** (VV: https://www.dmachoice.org/static/faq_business.php): "permanent and updated and sent to subscribing companies each month"; "All companies and nonprofits are encouraged to subscribe"; DMAchoice "should not be used instead of having an internal Do Not Contact… list".
  - **Bloomerang** (VV: https://help.bloomerang.com/en/articles/12632726):
    - "Emails and letters exclude Inactive and Deceased constituents by default", and marking someone deceased "removes them from any automation".
    - "Write off unfulfilled pledges and set end dates on recurring donations".
    - Do not merge the record into a relative's, so that "tax receipts [go] to the right person".
    - NCOA "doesn't catch every record".
  - **Practitioner consensus** (S, Blackbaud community): never delete the record; create a separate surviving-spouse record; fix salutations.
  - **Receipts after death.**
    - Canada: the CRA has issued receipts "to the estate of the deceased" for gifts by will. The deceased's final return can claim the gift once the charity has a letter from the estate (S: CRA interpretations 2010-0372621E5 and 2018-0745851C6).
    - US: no source fetched (U).
- **Do Not Solicit.** In practice this means no appeals, while receipts and acknowledgments still go (S: Blackbaud community).
  - Clemson uses "Do Not Contact Except Mandatory" (S).
  - Bloomerang transaction emails cannot be unsubscribed (VV).
  - Do Not Mail is postal-only; Do Not Call is phone-only (S).
  - When an email unsubscribe has no list choice, M3AAWG says "default to removing the recipient from all mail" (VV). That means all email, not all channels.
- **UK Fundraising Preference Service (FPS)** (VV: https://www.fundraisingregulator.org.uk/fundraising-preference-service/breaches). A charity that does not "stop sending direct marketing communications within 21 days of receiving an FPS request" is "in breach of the FPS terms and conditions". After 28 days it is in breach of Code section 3.2.5. I did not fetch the Code's deceased guidance.

## 6. Canada and Québec

- **Gift-based implied consent is for registered charities only** (VP: https://laws-lois.justice.gc.ca/eng/acts/E-1.6/page-2.html):
  - s.10(13)(a) covers a donation "within the two-year period immediately before the day on which the message was sent, **where that other person is a registered charity**", a political party or a candidate.
  - Otherwise it covers only volunteer work, meeting attendance (b), or "membership" in a "club, association or voluntary organization" (c).
- **Who counts as the sender.** Under s.10(9)(a), the relationship may be with "the person who sends the message, the person who causes it to be sent or the person who permits it to be sent".
- **Identifying the sender** (VP: https://laws-lois.justice.gc.ca/eng/regulations/SOR-2012-36/FullText.html):
  - s.2(1): every commercial electronic message (CEM) must name the sender and "if the message is sent on behalf of another person", that person too, with "a statement indicating which person is sending the message and which person on whose behalf the message is sent".
  - s.4: a consent request must include the same identification and "(e) a statement indicating that the person whose consent is sought can withdraw their consent."
  - _(Inference: a missionary newsletter sent through Asym "on behalf of" the ministry must name both. Gift-based implied consent attaches to the charity, so it covers the missionary's message only if the charity "causes or permits" it.)_
- **Charity fundraising exemption.** A CRTC FAQ summary says "the main reason or purpose of the CEM" governs, and the "principal purpose" must be to raise funds. Ticket sales for a charity event qualify (S: https://www.legal500.com/intelligence/canada/corporate-commercial-law/crtc-releases-guidance-on-casl%E2%80%99s-application-to-registered-charities). A plain program update with no commercial element is "Not a CEM" (S, Charity Law Group, r2).
- **Proof is required per address.** In 2015 Porter Airlines paid $150,000. The CRTC said it "was unable to provide proof as to those consents from each applicable electronic address" and "did not honour unsubscribe requests, in some cases, within 10 business days" (S: https://www.bennettjones.com/Insights/Blogs/2015/06/Porter-Airlines-Pays-$150000-under-Canadas-AntiSpam-Law). Porter's spokesperson told the Toronto Star that "a move to a new email platform caused the errors to occur and not be immediately detected" (S, as relayed in search results; https://www.cp24.com/lifestyle/travel/porter-fined-150k-under-anti-spam-legislation-crtc-1.2445915).
- **Changing software.** I found no CRTC text on it (site blocked). _(Inference: consent attaches to the person who sends or causes the message; s.6(7) excludes mere transmitters (r2).)_
- **Québec P-39.1** (VP: https://www.legisquebec.gouv.qc.ca/en/document/cs/P-39.1):
  - s.22: anyone "who uses personal information for commercial or philanthropic prospection purposes must identify himself… and inform that person of his right to withdraw his consent", and after withdrawal it "must cease to be used for those purposes".
  - s.12: "commercial or philanthropic prospection may not be considered a consistent purpose."

## 7. UK and EU

- **A software change is not a controller change.** A processor "processes the personal data only on documented instructions from the controller" (GDPR Art. 28(3)(a), VP: https://gdpr-info.eu/art-28-gdpr/). _(Inference: consent validly held by the ministry survives a move to Asym as its processor. A change of controller, such as a merger or a missionary leaving, is different.)_
- **Reach to non-EU ministries.** GDPR reaches non-EU controllers "offering… goods or services, irrespective of whether a payment… is required" to people in the Union (Art. 3(2)(a), VP: https://gdpr-info.eu/art-3-gdpr/). Whether donation appeals count is for counsel.
- **What records to keep.** The ICO consent checklist reads: "We keep a record of when and how we got consent from the individual. We keep a record of exactly what they were told at the time." (S: copies in university and school policies found by search. The source, https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/consent/how-should-we-obtain-record-and-manage-consent/, was blocked.)
- **Consent given to someone else.** Under older ICO guidance, a third party "cannot rely on the consent the individual may have given to the first party" unless named (S).
- **Refreshing consent.** The EDPB recommends refreshing consent "at appropriate intervals" and sets no fixed limit (S, summary).
- **Charity soft opt-in.** The PECR reg 22(3A) charity soft opt-in applies only to charities on the England and Wales, Northern Ireland or Scottish registers (reg 22(5), VP in r2). "Pre-existing supporter lists will still require consent" (S, r2).

## 8. How migrations fail in practice

- **Conservative Party** (ICO, £10,000, 2021). After changing bulk email provider, "the transfer of records had not been effected properly". The ICO found it "failed to retain records of who had unsubscribed" and that "In many instances, no evidenced consent could be provided at all" (S: https://www.theregister.com/2021/06/03/conservative_party_fined_one_third/).
- **Reed Online** (£40,000, 2022). The error "occurred as part of the migration to a new system". The email went out about 24 hours before the CRM update that would have blocked opted-out people (S, search snippet: https://www.decisionmarketing.co.uk/news/reed-recruitment-gets-ico-rollicking-for-pecr-gaffe).
- **Royal Mail** (£20,000, 2022). "just under 100,000 opted-out customers" were emailed. The ICO said the company "should have been aware of the risks of storing consenting and non-consenting email addresses in the same system".
- **Sports Direct** (£70,000, 2021). It could not evidence its rationale because files had been deleted under retention rules (all S: Slaughter and May, §4).
- **Porter Airlines** (CRTC, 2015). Platform move; no per-address proof (§6).
- **Vendor and community failure reports** (all S):
  - Klaviyo's Mailchimp integration imported subscribed contacts as "Never subscribed".
  - A re-upload flipped suppressed profiles back to subscribed (https://community.klaviyo.com/marketing-30/importing-a-new-list-overrides-the-existing-suppressed-unsubscribed-profiles-8497).
  - Importing a CiviCRM `deceased_date` did not set the deceased flag.
- **Documented hazards** (VV): imports trigger welcome flows (Klaviyo); bounces are not transferred (Campaign Monitor, via Klaviyo); blank or unrecognized values default to subscribed (Resend importer).

## Test of the decision

**Part 1. Unsubscribes first, always.** **Matches** the core norm (Klaviyo, Constant Contact, HubSpot) and the failure record (Conservative Party, Reed). **Deviates** on "all channels if unknown". Best practice scopes by the kind of signal: M3AAWG defaults an email unsubscribe to "all mail", meaning all email. Bounces are address-level. Under ADR-0220, a do-not-contact flag blocks receipts too, so escalating an email unsubscribe to all channels would wrongly stop receipts and postal thanks. **Missing:**

- Person-level versus address-level keying (Dynamics keys consent by address).
- A most-restrictive-wins rule across duplicates and merges (the Dynamics duplicate rule).
- A rule that no later import can lift a block, whatever the order (Klaviyo re-upload failure).
- Verbatim source values.
- A cutover delta (Reed).

**Amend:**

- Fixed scope by signal type:
  - unsubscribe from a known list: that list or purpose
  - unsubscribe from an unknown list: all non-required email
  - complaint: all non-required email to that address
  - hard bounce or cleaned: that address only, undeliverable, never retried
  - do-not-email: all non-required email
  - do-not-solicit: all appeals on every channel (receipts and thanks still allowed)
  - do-not-mail: postal
  - do-not-call: phone
  - do-not-contact and deceased: the person, every channel
- "All channels" applies only when the old field itself meant do-not-contact.
- A row with an unrecognized value is blocked and goes to review, never defaulted.

**Part 2. Email provider in scope.** **Matches** (Klaviyo: import historic bounces and unsubscribes "before sending"; the Conservative Party failure). **Missing:**

- **Complaints:** the export documentation lists no complaint file _(inference: complaints are not reliably in the CSV)_, so pull `abuse-reports` through the API or capture the abuse-complaints view.
- **Archived contacts:** export them separately.
- **Permanently deleted contacts:** unrecoverable. Record this as a known gap and ask the ministry.
- **Other audiences:** every audience, and any other ESP or SMS program.
- **Positive evidence and engagement:** the subscribed, pending and non-subscribed files, plus engagement through `MEMBER_RATING` or campaign activity. Opens and clicks are not in the export. Treat `pending`, `transactional` and non-subscribed as **not consent**.
- **Export timing:** exports expire after 30 days.

**Amend:**

- Freeze old-ESP sends from the final export until the Asym import commits, or take a delta export.
- Propagate opt-outs from Asym to the still-live audience within **48 hours** (the Gmail and Yahoo bar is stricter than the legal 10 business days), with a daily reconciliation report until the audience is closed.

**Part 3. Permission from evidence.** **Matches** the industry shape: Dynamics maps list to topic, and Salesforce, Raiser's Edge, ISO 27560 and HubSpot all carry legal basis and capture fields. **Deviates** in four places:

1. **CASL gift rule.** Gift-based implied consent exists only for **registered** charities (s.10(13)(a), VP). The rule must be gated on registration status, exactly like the s.3(g) exemption.
2. **UK/EU re-confirmation.** An emailed re-confirmation to UK/EU contacts without consent evidence is itself marketing (Flybe/Honda). Replace it with consent capture inside a donor-initiated interaction, or with no email (§4).
3. **Attestation.** It records who vouched. It does not replace per-address proof where proof is the law (CASL express consent per Porter; GDPR Art. 7(1)).
4. **US "carried over unless opted out".** This needs a per-purpose definition. **Amend:** adopt a Dynamics-style enforcement model per purpose and jurisdiction:
   - US organization updates and appeals: **non-restrictive** (relationship basis; never-emailed donors excluded per "nobody added to anything new")
   - mapped newsletters and lists: **restrictive** (membership required)
   - UK/EU and SMS: **restrictive**

**Missing:**

- The minimum fields in §1, including original capture dates. Salesforce: carry "the original decision time, not the time the sync ran".
- `effective_to` for CASL implied consent, recomputed **per send day** from the gift-giver's own gifts.
- Québec s.22 identification and withdrawal wording in every prospection message.
- Retention of source exports for as long as any permission relies on them (Sports Direct).

**Part 4. Missionary newsletters.** **Matches** if the ministry was the sender in the old system. **Missing:**

- The sender identity on each record and message: "missionary X on behalf of ministry Y" (CRTC Reg s.2(1)(b)–(c); ISO controller field).
- Purpose separation: a missionary-newsletter permission never authorizes ministry appeals (Raiser's Edge category within channel; Dynamics topic within purpose).
- Non-transfer: permission tied to missionary X does not pass to a successor _(inference; HubSpot's "does not transfer" norm)_.
- CASL implied consent for a missionary list holds only where the charity "causes or permits" the message (s.10(9)(a)). This is for counsel.

**Part 5. Sending gate.** **Matches** Google, M3AAWG, Klaviyo and Resend on engaged-first sending. **Missing concrete parameters.** **Amend.**

Before the first bulk send:

- SPF and DKIM aligned with the From domain, DMARC at `p=none` or stricter.
- RFC 8058 one-click unsubscribe with DKIM covering both headers.
- Unsubscribes processed within 48 hours.
- Send from the ministry's existing Mailchimp From domain where possible (DKIM carries reputation), and use Resend's "existing domain" table. A new subdomain is warmed as new.

Cohorts:

- Tier 1: a gift, click, login or reply in the last 90 days, or `MEMBER_RATING` 4–5.
- Tier 2: the same signals within 12 months.
- Tier 3: 12–24 months.
- Held: more than 24 months, or never mailed. These are not emailed in bulk until they re-engage; no email append.

Ramp and stop rules:

- Ramp over about 6 weeks.
- Auto-pause the tenant if complaints reach 0.08% (Resend) or 0.1% (Google target), or bounces reach 4%.
- Never use opens as engagement (Apple MPP).
- Sunset: no gift, click or login in 12 months means no further bulk email _(inference from the vendor range)_.

**Part 6. Deceased.** **Matches** (Bloomerang's default exclusion, NPSP, DMAchoice). **Deviates:** "blocks all contact" must be **person-scoped**. It must not suppress a surviving spouse's shared address or household (Bloomerang: separate records). **Missing:**

- Stop recurring gifts and write off pledges (Bloomerang). In Asym this is a money-correctness hook on imported schedules _(inference)_.
- Receipts and statements for gifts made before death go to the estate, executor or surviving spouse through a deliberate staff action (CRA, S).
- Never delete or merge the record.
- Record the source and verification date.
- Staff-only reversal with evidence, for wrongly marked records.
- Optional monthly deceased screening (DMAchoice DDNC; NCOA misses some).

## How this will fail in practice, and the safeguard

| Risk (evidence)                                                           | Safeguard                                                                                 | Monitor (target)                                                                    |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Blocks lost or overwritten in transfer (Conservatives; Klaviyo re-upload) | Source-to-Asym reconciliation; blocks win over any later import                           | Source blocks missing in Asym = **0**; sends to any imported-block address = **0**  |
| Cutover gap (Reed, 24 h)                                                  | Old-ESP send freeze, or a delta export at final import                                    | Opt-outs in old ESP after final export that are not imported = **0**                |
| Live Mailchimp audience drifts                                            | Asym-to-Mailchimp push ≤ 48 h; daily diff                                                 | Max propagation lag ≤ 48 h; unsynced count = 0                                      |
| Blank or unknown becomes "subscribed" (Resend importer, Givebutter)       | Unrecognized value blocks the row                                                         | Rows defaulted to permission = **0**                                                |
| Duplicates or merges split a suppression                                  | Address-keyed blocks; most-restrictive wins                                               | Merged pairs with conflicting status not resolved to "out" = 0                      |
| Import triggers sends (Klaviyo flows)                                     | Imports stay outward-effect-dark (ratified)                                               | Messages caused by an import batch = 0                                              |
| Reputation crash on first send (dormant addresses, traps)                 | Tiered ramp; held cohort                                                                  | Google Postmaster spam < 0.1%; Resend bounce < 4%, complaint < 0.08%; auto-pause    |
| Marketing disguised as a service message (Honda, AMEX)                    | Receipts and move-campaign emails carry no asks; class derived from the producer contract | Content-review checklist passed per template                                        |
| Consent unprovable later (Sports Direct, Porter)                          | Keep source files and evidence as long as the permission plus the retention period        | Share of permissions with complete §1 fields (target 100% for CA-express and UK/EU) |
| Re-permission email to UK/EU contacts without consent (Flybe)             | Restrictive model for UK/EU                                                               | Sends to UK/EU recipients with no basis = 0                                         |
| Deceased mis-scoped or still charged                                      | Person-scoped; stop recurring gifts                                                       | Active recurring schedules on deceased donors = 0                                   |
| Over-blocking (an email unsubscribe stops receipts)                       | Per-signal scope table                                                                    | All-channel blocks whose only source is an email signal = 0                         |

## Open for counsel

1. Do PECR, UK GDPR or EU GDPR (Art. 3(2)) reach a US or Canadian ministry emailing UK/EU donors? Is a donation appeal "offering services"?
2. Under CASL:
   - Is a missionary's support appeal sent through Asym "on behalf of" the registered charity (s.3(g))?
   - Does implied consent cover missionary newsletters ("causes or permits")?
   - Does a gift from one spouse cover the other? Does a gift through a donor-advised fund count?
3. Québec: was philanthropic prospection a disclosed purpose when the data was collected (s.12)? What wording satisfies s.22?
4. Non-registered Canadian ministries have neither s.3(g) nor s.10(13)(a). What basis remains for them?
5. Is a Switch-lead attestation acceptable as part of the consent record? No regulator text was found either way.
6. After a death: who may receive receipts and annual statements (executor, surviving spouse), in the US and under the CRA?
7. How long must consent evidence and suppression records be kept?
8. From r2: TCPA consent after a vendor change, and the effective date of the revoke-all amendment.
