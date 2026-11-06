# Q10 R2: External practice for households, couples, shared emails and organizations in imports

All sources accessed 2026-11-02. This is research, not legal or tax advice. It complements `q10-r1-repo-households.md` (what Asym already settled) and does not repeat repo evidence.

**Labels.** **VP** = primary or regulator text, fetched (IRS, CRA). **VV** = vendor document, fetched. **S** = secondary: community post, mirror, case study, or search snippet only. **U** = unverified. _(inference)_ marks my own reasoning. The fetch tool caps quotes at about 125 characters, so long sentences appear in fragments.

**Blocked or missing.** help.salesforce.com renders only a "CSS Error" shell, so NPSP facts come from Trailhead (VV) and Salesforce object docs from a GitHub mirror (S, API v67 Summer '26). Blackbaud KB (kb.blackbaud.com) is script-only, so KB facts are S. Bloomerang's "Conversions: Household Review" article now returns 404 (snippet only, S). I found no fetchable household documentation for **Neon CRM** or **DonorPerfect** (U). An H&R Block page returned 403. I found no IRS text on naming spouses on an acknowledgment.

## 1. Household models in donor CRMs

| Product                                           | What a household is                                                                                                                           | Who owns the gift                                                                                                                                                | Evidence |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Salesforce NPSP                                   | An Account record that holds contacts                                                                                                         | Gift sits on the household account. "The primary contact on an account gets hard credit for any donation made from the household." Other members get soft credit | VV       |
| Salesforce Nonprofit Cloud (Agentforce Nonprofit) | A business account defined by a Party Relationship Group of type Household. A person can belong to several groups, and one is flagged primary | `GiftTransaction.DonorId` is "The person, household, or organization account associated with the gift transaction", so a household can be the donor              | VV + S   |
| Bloomerang                                        | A summary over individual records. "Households pull together and display data from all of the household members."                             | Always an individual. "You can't add a donation to a household account."                                                                                         | VV       |
| Raiser's Edge (7/NXT)                             | No household entity. A spouse relationship plus a head-of-household flag                                                                      | One constituent, with automatic spouse soft credit                                                                                                               | VV + S   |
| Virtuous                                          | The Contact **is** the household or organization: "A Contact in Virtuous represents a **household or organization** — not a person."          | The household: "gifts are attributed to the household even when one specific individual made the donation."                                                      | VV       |
| Little Green Light                                | Either one record for the couple, or separate records joined by a relationship                                                                | Hard credit to the "Primary" contact, plus soft credit to the spouse                                                                                             | VV       |
| Givebutter                                        | A grouping with a primary contact and combined giving                                                                                         | Individual contacts                                                                                                                                              | VV       |
| Planning Center (church)                          | Households group profiles. **Joint donors** are a separate, explicit pairing                                                                  | Each profile, or a joined pair for statements                                                                                                                    | VV       |
| Neon CRM, DonorPerfect                            | No documentation found. A Neon API v2 household endpoint exists, per a spec mirror                                                            | —                                                                                                                                                                | U / S    |

**Salesforce NPSP** (VV, Trailhead):

- **Naming.** The default household name is "[Last Name] Household". The Formal Greeting is "(including salutation and full name)", default `{!{Salutation} {!FirstName}} {!LastName}`. The Informal Greeting is "first name only". For the connector, "The default value is `and`". Members can be excluded from names and greetings (for example a minor or a deceased member). NPSP "Updates household names and greetings when you update contact information or add or delete a household member." https://trailhead.salesforce.com/content/learn/modules/contact-and-account-settings-in-nonprofit-success-pack/configure-household-naming-npsp
- **Credit.** "The primary contact on an account gets hard credit for any donation made from the household." https://trailhead.salesforce.com/content/learn/modules/constituent-data-management-with-nonprofit-success-pack/manage-household-accounts
  - "Household member soft credits in NPSP can happen automatically, you don't have to set them on each opportunity."
  - "NPSP calculates soft credit rollups in its nightly batch."
  - Source: https://trailhead.salesforce.com/content/learn/modules/donation-soft-credit-management-with-nonprofit-success-pack/create-and-manage-soft-credits

**Salesforce Nonprofit Cloud** (VV, Trailhead):

- "business accounts represent households in Agentforce Nonprofit". "Members are individuals who are directly part of the household, and you must add at least one". "person accounts can be part of several party relationship groups at the same time". https://trailhead.salesforce.com/content/learn/modules/stakeholder-management-in-nonprofit-cloud/manage-households-nonprofit-cloud
- Object reference (S, mirror: https://github.com/Avinava/sf-documentation-knowledge, folder `knowledge/current/nonprofit-cloud`):
  - PartyRelationshipGroup "Represents a group of people living together such as a household, or a group of people affiliated with each other". Its Type is Group or Household.
  - AccountContactRelation has `IsPrimaryGroup` ("whether the group is a primary group for the member"), `IsPrimaryMember` ("whether the member is a primary contact of a group"), and `StartDate`/`EndDate` "to keep a history of the relationship".
  - GiftSoftCredit `Role` values include "Household Member", "Matched Donor" and "Third Party Donor".

**Bloomerang** (VV): https://help.bloomerang.com/en/articles/12632740-about-relationships-and-households

- "Each household has one member labeled as the Head of Household." "Bloomerang CRM uses that household member's contact information when communicating with the household."
- On where gifts go: "We recommend that you enter this donation in the Head of Household's individual account unless household members have other preferences."
- Name fields:
  - Envelope and Recognition Name: "Mr. and Mrs. John and Jane Smith"
  - Informal: "John and Jane"
  - Formal: "Mr. and Mrs. Smith"
- "A constituent may only belong to one household to avoid mailing conflicts and double-counting donations." "Only add individual constituents to households" (no organizations or DAF accounts).
- Spouse options (https://help.bloomerang.com/en/articles/12632721-enter-spouse-data): "Create a joint account with both individuals" or "Create separate constituent accounts for each individual". Separate records let staff "Report on their separate donations", which "can be a requirement for tax purposes."

**Raiser's Edge** (VV): https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-relationships.html

- "Husbands, wives, and domestic partners are key relationships to track". "If the spouse is also a constituent, you can track the gifts received from either constituent" as "soft credit giving for the other."
- Head of household is "to help determine who to address certain mailings to". "If one spouse isn't a constituent, you can't mark either of them as head of household."
- The RE 7 _Constituent Data Entry Guide_ (2018, https://help.blackbaud.com/docs/0/assets/guides/re/constit.pdf):
  - A spouse "can exist solely as a nonconstituent relationship record on the primary constituent's record or have its own constituent record".
  - It offers an "Automatically soft credit this individual for gifts" checkbox.
  - Tip: "you can also merge an individual constituent into a spouse's constituent record, if the individual passes away."
- Per the KB snippet (S, https://kb.blackbaud.com/knowledgebase/articles/Article/48273), the automatic spouse soft credit defaults on, and it applies only to new gifts.
- I could not confirm a "Do not give spouse recognition" label (U).

**Virtuous** (VV): https://docs.virtuous.org/crm/concepts/contacts

- "Exactly one individual is the primary; at most one is the secondary." For the primary: "Receipts, communications, and gift attributions default to this individual."
- From the analytics reference: "Gifts belong to the contact; emails are sent to individuals." https://docs.virtuous.org/analytics/reference/contact-profile

**Little Green Light** (VV): https://help.littlegreenlight.com/article/77-managing-households-in-lgl. LGL offers both methods. Soft-credit guidance (https://help.littlegreenlight.com/article/309-soft-credits):

- Hard credit goes to the record "coded as the Primary contact", no matter "which member of the couple signed the check".
- "always ensure that the Spouse/Partner contact is soft credited for the gift."

**Givebutter** (VV):

- The household object has `name`, `head_contact_id` and `envelope_name` (https://docs.givebutter.com/api-reference/households/get-a-household.md).
- "Contacts can only belong to one household at a time". The household summary shows "the household's combined giving". https://help.givebutter.com/en/articles/7321435-how-to-use-contact-households-and-relationships

**What a household is, across vendors.** Most treat it as a **grouping** (Bloomerang, Givebutter, Planning Center, NPSP members). Some make it the **giving identity** (Virtuous; NPSP and Nonprofit Cloud allow it). In practice it is often built from an **address** (RE mail processing; Bloomerang conversions, see §6). Even where the household owns the gift, receipts and hard credit default to one primary person (NPSP, Virtuous, LGL).

## 2. Import patterns

**Couples on one row: no major importer splits a name. They use two column groups or one person per row.**

- **NPSP** (VV): "Use the Contact2 fields on several rows with the same primary contact in the Contact1 fields."
  - "If Contact1 matches the first name, last name, email, or legacy ID", the importer "will add each Contact2 to the same household account and not create duplicates."
  - "You can only set Contact1 or Account1 as the donation donor—Contact2 and Account2 won't work."
  - Source: https://trailhead.salesforce.com/content/learn/projects/import-your-data-using-npsp-data-importer/prepare-your-data-for-import
- **LGL** (VV): a Constituent #1/#2 number covers the case "when two constituents are spouses and you want one row of data to create two constituent records". https://help.littlegreenlight.com/article/504-importing-what-are-constituent-numbers-and-record-type-numbers
- **Planning Center** (VV): "add the same characters to a Household ID column for each household member". Members are linked if "the whole household is in the same import". Set the primary with "only include TRUE next to the primary contact". https://help.planningcenter.com/en/138557-prepare-a-csv-file-for-import.html
- **Bloomerang** (VV): "Households cannot be created with an import". "Separate individual and organization data into different spreadsheets." https://help.bloomerang.com/en/articles/12632800-imports-set-up-import-files
- **Raiser's Edge** (S): a constituent import can carry spouse fields (https://community.blackbaud.com/blogs/10/3792).

**Name parsing is risky.** CiviCRM's import parser for Wikimedia (S, https://phabricator.wikimedia.org/T275445):

- "It seems to split a couple even with the same last name to the partner field."
- Then "it wasn't able to keep the last name for both partners when two people are listed with the same last name."
- The fix kept the raw string: "it puts the full name value in the addressee custom field (as provided)."

**Organizations with contact people.**

- **NPSP** (VV): "use Account1 for organization donations". In the example, a donor's employer "is Account1".
- **Virtuous** (VV): organizations "have ContactIndividuals for the relevant contact people (development director, program officer, etc.)".

**Matching on import.**

- **Source IDs come first.**
  - LGL (VV): "Match on LGL Constituent ID" and "Match on External Constituent ID" are defaults, and "Neither of these options can be turned off." When IDs are present, "we strongly recommend turning off all optional matching options". Split mixed files into two. https://help.littlegreenlight.com/article/272-control-duplicates-on-import
  - Planning Center (VV): "The importer will match profiles based on name fields (first, middle, last, suffix) unless you use a remote ID."
- **Email matching has to check the first name too.**
  - LGL (VV): its email option ensures "constituents match only when both the email address and first name match". The email-only option matches "to the first constituent it finds with the same email address".
  - NPSP (VV): the duplicate rule "matches on first name (fuzzy), last name (exact), and personal email (exact)". https://trailhead.salesforce.com/content/learn/modules/contact-and-account-settings-in-nonprofit-success-pack/merge-duplicate-contacts-and-accounts-npsp
  - An NPSP payments add-on (VV): "a final check is made to ensure the First Name is ALWAYS a match as well … If the First Name does not match, then a new contact is created for the same household." https://payments2us.helpjuice.com/matching-rules/why-do-i-get-duplicate-contacts-when-using-npsp
- **Other keys** (Bloomerang, VV): records match "when the account numbers match", or on name plus email, standardized address, or the last seven phone digits.
- **Silent merge on match** (Virtuous, VV): its import matches on "email, phone, address, name, and `contactReferences`", and "If a match is found, the incoming data is merged into the existing record."

**Why vendors avoid automatic merges.** Merges cannot be undone and destroy data.

- Bloomerang (VV): "Merging constituents is permanent." Marking a pair "Not Duplicates is permanent". https://help.bloomerang.com/en/articles/12632743-review-and-merge-duplicate-constituents
- NPSP (VV): merging is "destructive and it's easy to make mistakes". "there's no way to revert back". Standard merge leaves "an anonymous household".
- Planning Center (VV): it is "safer for Planning Center to create a new profile that can be merged with the correct person's information". https://help.planningcenter.com/en/138561-how-and-why-duplicate-profiles-are-created.html

**Duplicate rates (S, thin evidence).**

- Northwestern Memorial Foundation merged three databases (more than 330,000 constituents). Its slides say: "Raisers Edge: 15% duplicate rate reported", "Actual: 18% duplicate rate", "Dropped the duplicate rate from 18% to 5%". https://www.slideshare.net/slideshow/bbcon-2016-top-5-processes-weve-automated/67816322
- A 2015 NonProfit Pro article (snippet only) gives "about 10%".
- An Experian survey from 2008 found "Only 3% … of charities surveyed undertake or outsource de-duplication exercises every month". https://fundraising.co.uk/2008/12/15/duplicate-data-still-costs-charities-money-says-experian/
- No peer-reviewed rate was found.

## 3. Shared email addresses

- **CRMs tolerate shared email on two person records but warn about it.**
  - Bloomerang (VV) flags pairs that "have the same email address, even if no other account information matches", but skips pairs "in the same household, even if they have the same name, address, email, or phone number."
  - Planning Center (VV): "It's common for people to share the same name or an email address, often within the same household"; "if profiles are in the same household, Planning Center won't suggest them as potential duplicates."
  - DonorView (VV): "A Company and an Individual Constituent can share the same default email address without any errors." https://support.donorview.com/support/solutions/articles/9000230241
- **Systems keyed by email force a single owner.**
  - Mailchimp (VV): "each email address only appears once" in an audience.
  - DonorView portal (VV): "Every portal account requires a unique email address." "Constituents cannot share an email address and have separate donor portal accounts, even if their names are different." https://support.donorview.com/support/solutions/articles/9000237064
  - Stripe customer portal (VV): "If multiple customers have the same email address, Stripe selects the most recently created customer that has both that email and an active subscription." https://docs.stripe.com/customer-management/activate-no-code-customer-portal
  - Planning Center login (VV): "If your email address or phone number is shared with other people, only check the boxes with your name."
- **Sending.**
  - Givebutter Engage (VV) sends one message per shared address, and "This doesn't merge the contacts." Its transaction matching "is based on matching primary emails or primary phone numbers", and it states "You cannot currently merge duplicate company contacts." https://help.givebutter.com/en/articles/4787745-contacts
  - Bloomerang household emails go to the head only: "Bloomerang CRM emails only the Head of Household." https://help.bloomerang.com/en/articles/12632735
  - LGL (VV): "only one email address per constituent can be subscribed at a time".
- **What practitioners do** (S, https://community.blackbaud.com/discussion/61387/constituents-sharing-an-email-address):
  - The problem: "Postal address uses Head of Household processing, but there is no equivalent for email."
  - Advice: "include the email only on the primary HOH". "If the person opts out of email it is problematic to have the same email on multiple records."
  - One organization merged the spouses and coded a "Merged Spouses" marital status.
- **Failure cases.**
  - HubSpot (S): "a spouse has overwritten their spouses firstname due to them sharing an email address", and "Sometimes contacts were incorrectly merged". https://community.hubspot.com/t/how-to-deal-with-spouses-sharing-emails-during-form-submissions/157870
  - Givebutter users (S, July–August 2026): "we have dozens of contacts with a family member's email which isn't their own".
  - The opposite advice, from Raisemore (VV): "a shared email almost always means the two records belong to the same person and should be merged." https://help.raisemore.app/en/articles/15491733

## 4. Gifts and receipts for couples

**United States** (VP, IRS Publication 1771, Rev. 11-2023, https://www.irs.gov/pub/irs-pdf/p1771.pdf):

- The six required elements of a contemporaneous written acknowledgment are the organization's name, the amount, a property description, and statements about goods or services. **None of them is the donor's name.** "It isn't necessary to include either the donor's Social Security number or tax identification number". Electronic delivery is allowed, "such as via an email addressed to the donor."
- I found no IRS text on naming one or both spouses. H&R Block says (S, snippet) that spouses filing separately who give from a joint checking account "each deduct half". _(inference)_ An acknowledgment addressed to both spouses for a joint-account gift does not appear to break the Publication 1771 elements. Who may deduct the gift is the donor's tax question, not the charity's.

**Canada** (VP):

- "A charity cannot issue an official donation receipt in the name of anyone but the true donor." "You need to have evidence of the true donor for every receipt you issue." https://www.canada.ca/en/revenue-agency/services/charities-giving/charities/operating-a-registered-charity/issuing-receipts/what-you-need-know-issue-official-donation-receipt.html
- A cash receipt must show "the full name, including middle initial, and address of the donor." https://www.canada.ca/en/revenue-agency/services/charities-giving/charities/operating-a-registered-charity/issuing-receipts/what-information-must-on-official-donation-receipt-a-registered-charity.html
- The CRA true-donor infographic asks "What if there are two names on the cheque?" and answers: "All the choices are correct. When people make a donation using their joint account, you can write one or both of their names on the donation receipt." For co-owned property: "You issue two donation receipts, one to each brother." https://www.canada.ca/content/dam/cra-arc/serv-info/charities/true-donor-infographic-eng.pdf
- CPC-010 frames this narrowly (fetched, paraphrased by the tool): a cheque on an account held jointly by spouses, with both names on it, may be receipted in either or both names "regardless of how the cheque is endorsed". https://www.canada.ca/en/revenue-agency/services/charities-giving/charities/policies-guidance/policy-commentary-010-issuing-a-receipt-a-name-other-than-donor-s.html
- Spouses may share the credit. "You or your spouse or common-law partner made a gift of money or other property", with the condition that "The portion of the donation has not already been claimed on another tax return." https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-34900-donations-gifts/who-claim.html
- Guide P113 (2025, Rev. 25, updated 2026-01-20) does not discuss spousal sharing.
- _(inference)_ A receipt in one spouse's name costs a Canadian couple nothing, because either spouse can claim it. A two-name receipt is allowed only for a joint account. The CRA texts give cheques as the example, so card and EFT are a counsel question.

**Practice: hard and soft credit.**

- "Do not split the gift." Use soft credit instead. One organization's rule: "For spouses, the person who signs the cheque or is the credit card holder name is hard credited and the other spouse soft credited". https://community.blackbaud.com/discussion/comment/213542 (S)
- Who gets the hard credit differs by vendor:
  - LGL: the primary contact
  - NPSP: the household's primary contact
  - Bloomerang: recommends the head of household
  - Bloomerang's expert column: "It's best not to guess!" (ask the donor)
  - Source for the expert column: https://bloomerang.com/blog/ask-an-expert-what-are-the-rules-for-using-soft-credits-in-a-donor-database (VV)
- Recognition names live in separate fields from legal names: Bloomerang's "Recognition Name" and NPSP's Formal/Informal Greetings.

## 5. Organization donors

- **Canada** (VP): "Since the used washing machine is the property of Clean It Yourself, the business is the true donor." An owner may be receipted only with evidence that they paid personally. Gifts from other charities: "A registered charity should not issue official donation receipts for gifts" from other registered charities. A "letter or ordinary receipt" is fine instead. https://www.canada.ca/en/revenue-agency/services/charities-giving/charities/operating-a-registered-charity/receiving-gifts/gifts-other-registered-charities.html
- **DAFs and foundations** (VV):
  - LGL records a DAF gift "under the record of the Donor Advised Fund" and says to "enter a soft credit to credit the donor". Family foundation gifts go "under the foundation's record".
  - Bloomerang: "the individual who recommended the grant to you receives a soft credit."
  - One RE organization's rules (S): "Donor Advised Funds are hard credited" and "Businesses always soft credit their owners".
- **Modelling.**
  - Organizations stay out of households (Bloomerang).
  - Contact people are person records linked to the organization. Nonprofit Cloud: "The people working at those organizations are tracked using related person account records".
  - The contact person gets soft credit. NPSP: "As the primary contact for his company, Jose Figueroa gets automatic soft credit for gifts made by Cloud Kicks."
- **Business and personal profiles** (Planning Center, VV): donors "who give from both personal and business accounts can create separate donor profiles" with different emails and two year-end statements. Planning Center tells staff to add a note so nobody merges them. https://help.planningcenter.com/en/138372-business-donors.html

## 6. Migration practice and failure modes

- **Keep source IDs** (LGL, VV): "identify what that system uses as the unique ID for every constituent". "The key here is for the unique constituent ID to be present in every one of the exports". "test what you believe to be unique IDs before relying on them". https://help.littlegreenlight.com/article/271-migrating-to-lgl-from-your-current-system
- **Test small first** (VV):
  - Bloomerang: "Imports are largely irreversible so we always recommend running a test file of the first five rows." And "Address, email, and phone information always creates new entries to the account."
  - DonorDock: "Pull up 10-15 donor records at random and compare them against your source export." https://www.donordock.com/articles/nonprofit-crm-migration-checklist
- **Households can be inferred from addresses.** A Bloomerang conversion article (S, now 404) said households are built from records "who share the same Spouse Relationships or Primary Address" and "are often created automatically during a conversion." _(inference)_ Building from the address alone can join roommates, adult children or divorced couples.
- **Documented failures** (S unless marked):
  - Receipts kept the spouse after recognition was removed. "within receipts it's still populating adding in the spouse". The answer: "Are your receipts/acknowledgements pulling in a joint name format?" https://community.blackbaud.com/discussion/70336
  - The CiviCRM name parser dropped a surname (§2).
  - HubSpot overwrote a spouse's name through a shared email (§3).
  - NPSP's standard merge leaves an anonymous household (VV).
  - Givebutter: duplicates appear when "transactions are imported without consistent identifiers such as primary email, phone number, or Contact ID" (VV).
  - LGL: duplicates within one file are not shown before commit. "the Import Summary will not reflect those matches at the step where you review and commit the import" (VV).
  - RE advises merging a deceased person into their spouse (VV, §1). Asym already rejects this (DL:425).
- **Not found:** a measured study of migration failures for households. The "800 merged / 300 kept" household story that appears in search results is a self-described composite (discarded).

## 7. UX patterns for reviewing household decisions

- **Preview by outcome** (Planning Center, VV): "View new or updated profiles and households, any errors the importer found, and all identical records". Staff can "uncheck the box to the left of their name or select Ignore all". Errored rows export as a CSV. Undo is available "up to 48 hours", and "Undoing an import is permanent". https://help.planningcenter.com/en/138558-import-a-csv-file-in-people.html
- **Dry run with per-row status** (NPSP, VV): statuses such as "Dry Run - Matched None" and "Dry Run - Matched", plus a "Dry Run - Errors" list view. The default rule is "Firstname,Lastname,Email". https://trailhead.salesforce.com/content/learn/projects/import-your-data-using-npsp-data-importer/perform-an-import-dry-run
- **Matching switches per file** (LGL, VV): ID-first matching, optional email+first-name matching, and a "split the file" rule.
- **Explicit pairing with notice** (Planning Center joint donors, VV): pairs are joined one at a time, with no bulk option. Both donors are emailed, and "This security setting cannot be turned off." Joint statements show combined giving. Unjoining sends donations back to "the donor who initiated them". https://help.planningcenter.com/en/138371-joint-donors.html
- **Duplicate queues.** Bloomerang treats "Not Duplicates" as permanent. Givebutter's "Ignore" stops re-prompting. Both exclude members of the same household from suggestions.

## Common pattern

1. **One person per record.** Spouses are separate people grouped by a household that does not own legal giving. Virtuous is the main exception.
2. **Couples on one row arrive through explicit column groups** (Contact1/Contact2, #1/#2) or a Household ID column, never through name parsing. The raw combined name is kept as an addressee or recognition string.
3. **One hard-credit donor per gift, plus soft credit for the spouse.** Gifts are never split. Household totals are derived and must avoid double counting.
4. **Matching uses source IDs first.** Email matching also needs the first name. Shared email and household membership suppress duplicate suggestions. Merges are manual and treated as irreversible.
5. **Email-keyed subsystems (ESP, portal, payments) allow one owner per address.** CRMs allow sharing but warn. Opt-out on a shared address is the practical pain point.
6. **Receipt naming.** In Canada the receipt goes to the true donor, with two names allowed for joint-account gifts. The US acknowledgment has no name element. Joint name formats are a known source of wrong receipts.
7. **Organizations are their own records**, with contact people linked to them. The business, DAF or foundation holds the hard credit and the person gets soft credit.

## Implications for Asym

These are recommendations, built on the settled points in r1: a household groups people and never owns a gift; there is one legal donor per gift; there is no automatic merge; and every record carries a source ID.

1. **Couples on one row.**
   - The template should offer a Person 1 and Person 2 column group and a Household ID column, like NPSP and Planning Center.
   - Each person on a row gets a fixed binding role: `row/person-1`, `row/person-2`, `row/household`, `row/org`, `row/org-contact`. Practice runs then re-bind the same way every time. _(inference)_ This needs the binding key r1 §8.4 flags as unsettled.
   - Never split a combined name ("John & Mary Smith", "Mr. and Mrs. John Smith", "The Smiths") automatically. Detect it and send it to review with two choices:
     - (a) keep one person with the name unsplit, flagged "may be two people";
     - (b) split into two people, which the reviewer confirms in a preview with real examples.
   - A bulk rule ("same surname, two given names") may propose splits, but staff accept them.
   - Keep the raw string as an imported addressee or recognition name, never as a legal name.
2. **Households are a grouping, built only from explicit evidence:** a source household ID, a spouse relationship, or a Household ID column. Never build them from a shared address, email or surname, which only produce suggestions.
   - Import the source's primary or head flag as a mail and display default only, never as the legal donor.
   - Allow zero or one active household per person, as Bloomerang and Givebutter do. Nonprofit Cloud's multiple-group model with `IsPrimaryGroup` is a later option.
   - Do not create households of one by default _(inference)_.
3. **Shared emails.**
   - Never merge or attach gifts because of a shared email.
   - Because of the one-email-per-donor key, the reviewer picks which person holds the address. The default is the person the source tied it to, or the source's primary person. The other person is marked "shares a mailbox with …" and asked for their own address later.
   - Address-level suppressions (unsubscribe, bounce, complaint) then cover both people automatically. A person-level do-not-contact stays with that person, with a shared-mailbox warning.
   - Mass sends go once per address, like Givebutter Engage.
   - Imports never create logins. Portal access stays one person per email, which matches DonorView and Stripe.
4. **Joint gifts and receipts.**
   - Import the source's gift owner as the single legal donor. SiteStacker already gives each gift a Person.
   - Where the source's giving unit is a household (Virtuous, some NPSP exports), the ministry chooses one visible rule (primary member, or per-household review). Rows are blocked until the rule is chosen. Never infer the donor from email.
   - Record the spouse as derived recognition, not a split amount.
   - Keep legacy receipts' printed names as evidence and never re-render them.
   - Define "source-proved joint donor" narrowly: proof of a joint account, such as a cheque image or bank record, and only where counsel approves (see below). Default to one name.
   - In Canada either spouse can claim the receipt, so one name loses the couple nothing. In the US the acknowledgment has no name requirement.
   - Joint display names belong on informational statements only. They are the documented source of wrong receipts.
5. **Organizations.**
   - A row with an organization plus a contact person becomes an org Party, a person Party, and a contact relationship.
   - The organization (church, business, foundation, DAF sponsor) holds the hard credit. The contact or advisor gets recognition.
   - Organizations never enter households.
   - The same email on an org and a person is allowed _(inference: it needs a key exemption or a separate org contact point)_.
   - Flag names that look like a family rather than an entity ("Smith Family") for review.
6. **Matching and review.**
   - Match on source ID first. When an ID is present, turn off fuzzy matching for that row (LGL).
   - Email matches also need the first name (NPSP, LGL).
   - Same-household pairs are labelled "likely spouses", not duplicates.
   - Catch duplicates inside a file before commit, which LGL cannot do.
   - Plan for 10–18% candidate duplicates (S). The queue therefore needs bulk accept or reject with examples, outcome tabs (new, updated, households, errors, identical), per-row ignore, and practice runs in place of undo.
   - "Not a duplicate" decisions are recorded with the actor and stay reversible, unlike Bloomerang.

## Open for counsel

1. **Canada.** May an official receipt name both spouses when a joint account paid by card, EFT or PAD (CRA examples are cheques)? Is "spouses" in CPC-010 a limit, given that the infographic's joint-account example does not name a relationship?
2. **Canada.** If a legacy system issued two-name receipts, may Asym's replacement or duplicate receipts for those gifts use one name, or must they match the original?
3. **United States.** Is an annual statement addressed "John and Mary Smith" acceptable as the acknowledgment for gifts one spouse paid alone? Does any state or church practice raise a concern?
4. **Privacy.** May one spouse see combined household or joint giving, in the portal or on statements, without the other's consent? This covers PIPEDA, Quebec Law 25 and US state laws. Planning Center notifies both donors when a pair is joined.
5. **Shared mailboxes.** Does a CASL or CAN-SPAM unsubscribe from a shared address bind the other spouse's commercial mail, given that Q9 treats unsubscribe as address-level?
6. **Business owners.** When may a legacy receipt in an owner's name for a business-paid gift be carried forward, given the CRA "evidence of personal funds" rule?
