# Phase 21 Field Account, Mission Dashboard, Reimbursement, Assessment, and Compensation Handoff Research Evidence

Research dates: 2026-07-28 through 2026-08-02

**Decisions:** D1-D28
**Status:** D1-D28 ratified and adversarially hardened through 2026-08-02

Scope: first-party product documentation, government guidance, and
sending-organization operating guides describing what missionaries see for
gifts, organization-controlled support balances, expenses, reimbursement,
support goals, compensation timing, administrative assessments, and exact
Gusto, ADP Workforce Now, QuickBooks Workforce, and regional Xero Payroll
handoff capabilities; plus modern expense-report, receipt-evidence,
document-extraction, tenant-owned purpose-routed AI controls, immutable-ledger
integrity, close/reconciliation evidence, cause-owned recovery, proportional
finance controls, bounded prospective expense governance, independent human
review, canonical Support Assignment/participant modelling, Supabase/PostgreSQL
tenant isolation and RLS, principal-bound workspace authorization, invitation/
revocation lifecycle, recipient-safe notifications, and accessible
exception-first and `People & access` UX. Product marketing and historical
policy documents are identified separately from current documented behavior.

## D1 ratified conclusion

Phase 21 uses **tenant-scheduled, finance-closed support cycles with
independently authoritative Field Account, accounting, and payroll truth**.
D1's binding rider also keeps Expense Claim, policy decision, Approved Expense
Snapshot, Reimbursement Obligation, Field Account Funding Coverage, External
Payment Occurrence, and accounting handoff distinct behind one simple
experience.

The default cadence is monthly, with a supported tenant-selected biweekly
alternative. Newly recorded support may be visible as provisional activity,
but it is not immediately available worker money. The Finance-confirmed Field
Account Balance is organization-controlled, per-currency, and dated through an
immutable close. QBO/Xero may provide tie-out evidence but cannot overwrite the
Field Account; payroll/AP executes payment outside Asym.

## Findings

### DonorElf

- DonorElf’s current dashboard presents four different ideas together but labels them separately: a missionary-editable **Monthly Goal**, a 12-month **Monthly Average**, **% Funded** based on pledges, and **Balance**, with “updated yesterday” provenance. It also gives a 12-month monthly-gifts chart, recent transactions, and new donors. The current product screenshot is published on the [DonorElf home page](https://www.donorelf.com/).
- DonorElf states that it does not replace the accounting system. It imports donations and donor information from the sending organization’s systems and may combine donation-processing and accounting data. It also says roughly 80% of organizations with separate donation and accounting systems import only donation data, not expense data. Therefore a DonorElf “Balance” may not provide a complete expense-aware operational balance unless that tenant supplies both sources. See the [DonorElf FAQ](https://www.donorelf.com/).
- The St. Paul’s Outreach operating handbook documents a concrete monthly payroll workflow: gifts processed during a month are used in the following month’s payroll; a capped amount is calculated into pay and excess support rolls forward. Missionaries currently obtain the prior month total from DonorElf and then follow a separate payroll calculation. This proves that **processed gifts**, **roll-forward support**, and **pay** are distinct facts even when the UI does not fully model them. See [SPO MPD Gifts Handbook, sections 3.3 and 4.4](https://www.spo.org/s/MPDGiftOperationsHandbook20-21.pdf).
- DonorElf’s strongest UX pattern is exception- and relationship-led: recent gifts, new donors, late donors, missed payments, and a short work queue. Its current donations-by-month view puts donors in rows and months in columns, making missed or changed patterns scannable. Its weakest pattern is the generic word “Balance” without a visible definition of included sources beyond the freshness label.
- The DonorElf security, scale, and satisfaction statements are vendor claims, not independently verified evidence.

### DonorHub and TntConnect

- DonorHub’s documented financial model is explicit: **account balance = beginning balance + financial transactions**. Financial transactions carry a stable unique ID, transaction date, amount, financial-account identity, and GL-account identity; GL metadata marks income versus expense. This is materially safer than calculating a field balance by summing gifts. See [Financial Information](https://www.tntware.com/donorhub/help/en/pages/financial-information.aspx), [Financial Transactions](https://www.tntware.com/donorhub/help/en/pages/financial_transactions.aspx), [GL Accounts](https://www.tntware.com/donorhub/help/en/pages/gl_accounts.aspx), and [Financial Accounts](https://www.tntware.com/donorhub/help/en/pages/financial_accounts.aspx).
- TntConnect displays the organization-provided account balance during gift download and shows `n/a` when the organization does not provide it or is unavailable. It deduplicates gifts by unique gift ID and deliberately looks backward on later downloads to catch adjustments and deletions. See [Downloading Gifts from the Web](https://www.tntware.com/tntconnect/help/en/pages/gifts-download.aspx).
- These products treat the sending organization/data feed as the financial authority and the missionary CRM as a projection. Their documented contracts are old and do not provide modern pending/settled/payroll semantics, but their stable-ID and explicit-unavailable behavior remain sound.

### MPDX

- MPDX’s mobile dashboard shows a large **Account Balance** with a direct **View Donations** action, followed by a **Monthly Goal** card that separately displays gifts started, commitments not yet received, and the amount below goal. It then shows 13 months of received activity and relationship tasks. See [MPDX Mobile Dashboard](https://help.mpdx.org/article/1100-mpdx-mobile-dashboard).
- The full reports separate donation activity from account balances. Designation accounts have a balance, currency, converted balance, and `balance_updated_at`; a responsibility-center report can show income, expenses, and a balance. Each connected account displays a **Last Synced** date. See [MPDX API designation accounts](https://docs.mpdx.org/), [MPDX Reports](https://help.mpdx.org/article/1253-mpdx-quick-reference-guide-reports), and [Multi-currency Reports](https://help.mpdx.org/article/177-multi-currency-donation-report).
- MPDX explicitly warns that combining accounts with different processing times can make the resulting total balance inaccurate. Ministry-account balances are not displayed on the personal dashboard. See [Manage Multiple Accounts](https://help.mpdx.org/article/1367-manage-multiple-accounts) and [Managing Ministry Accounts](https://help.mpdx.org/article/633-adding-and-managing-ministry-accounts-all-other-orgs).
- Strong patterns: source/currency separation, last-synced provenance, commitments versus received gifts, and one-tap drill-down. Weak patterns: the label **Account Balance** does not itself explain whether the amount is spendable, compensation-related, or merely organization-reported.

### MissionGO

- MissionGO’s documented dashboard opens on a **Current Balance**, supports a currency selector and project filter, and offers a monthly statement. Separate views show **Gifts Received**, **Ministry Expenses**, and **Gifts Given**, with charts, transaction grids, donor drill-down, and CSV export. See [MissionGO Missionary Dashboard Walkthrough](https://www.missiongo.org/ContentFiles/Missionary%20Dashboard%20Walkthru.pdf).
- This is the closest public example to the requested combined operational view: one balance plus separately inspectable support inflows and ministry outflows. The guide does not document settlement status, payroll expectations, correction handling, the source system, or the balance’s freshness semantics.

### Mission Quest

- Mission Quest displays online donations almost immediately, while check donations appear after deposit. Its product claims “real-time” tracking, but its own help documentation shows that the readiness rule depends on payment source. See [How often does MQ record new donations?](https://missionquest.freshdesk.com/support/solutions/articles/35000034199-how-often-does-mq-record-new-donations-) and [When and how will I see donations?](https://missionquest.freshdesk.com/support/solutions/articles/35000013055-when-and-how-will-i-be-able-to-see-donations-donors-).
- Mission Quest separately defines a contract-owned Maximum Monthly Compensation, a minimum disbursement, and a fixed compensation schedule on the eighth of the following month. See [Things to keep in mind](https://missionquest.freshdesk.com/support/solutions/articles/35000124608-things-to-keep-in-mind) and [When will I receive my compensation?](https://missionquest.freshdesk.com/support/solutions/articles/35000049355-when-will-i-receive-my-compensation-).
- This supports modeling support activity and compensation as separate timelines. The dashboard should never imply that a newly displayed gift is immediately payable.

### SiteStacker and Ministry Sync

- SiteStacker publishes an eight-minute training item saying missionary dashboards are configurable, but the public text does not document the displayed balance, expense, payroll, or correction semantics. The embedded training video is not publicly downloadable without Google authentication. See [SiteStacker Missionary Dashboard training](https://forms.sitestacker.training/missionary-dashboard).
- “Ministry Sync” is now FundEasy and is an event/crowdfunding product, not evidence for missionary field-account or payroll UX. It should not be used as a Phase 21 comparator.

### Mission-agency operating policies

- [Reliant's public pay explanation](https://reliant.org/help/supporting-missionaries/how-is-the-missionary-i-support-paid)
  distinguishes a fixed, pre-approved monthly paycheck from the designated
  ministry account that supports salary, benefits, and ministry expenses. Its
  historical short-check/backpay description is evidence of one agency's
  policy, not a universal safe rule.
- [Reliant's reimbursement standard](https://solomon.reliant.org/display/public/RER/Reimbursement%2Band%2BExpense%2BRecovery%2BBonus%2BStandard)
  separates accountable-plan reimbursement, taxable expense-recovery bonus,
  taxable allowance, and recurring support-goal treatment. The organization,
  not the software or worker balance, owns the final policy decision.
- [ABWE's current financial model](https://abwe.org/financial-model/) and
  [giving FAQ](https://abwe.org/giving-questions/) publish distinct donation
  charges, monthly service contributions, donor-covered processor costs, and
  organization discretion and control. One unlabelled “net support” amount
  cannot explain all of those facts safely.
- [IPHC World Missions' April 2025 policy manual](https://iphc.org/missions/wp-content/uploads/sites/2/2025/04/WMM-Policy-Manual-April-2025.pdf)
  conditions compensation on organization-set budgets, worker status, support
  flow, and reserves, while governing reimbursement separately. This confirms
  that deficit and compensation treatment varies by organization and worker
  relationship.
- [Assemblies of God U.S. Missions' July 2024 manual](https://usmissions.ag.org/-/media/USMissionsV2/Downloads/US-Missions-Missionary-and-Career-Associate-Manual-072024.pdf)
  distinguishes missionary and career-associate arrangements. A public worker
  page or Field Account alone is not safe evidence of employee, contractor, or
  volunteer treatment.

The repeating operating pattern is organization ownership, recorded support,
separately approved compensation/benefits/ministry-expense policy, finance
review and close, external payroll/AP execution, and organization-controlled
surplus or deficit treatment. The variations are material enough that Asym
must provide tenant policy points rather than one hard-coded missions-agency
formula.

### Reimbursement and accountable-plan boundary

- [IRS Publication 15](https://www.irs.gov/publications/p15) separates
  accountable-plan reimbursements from nonaccountable-plan amounts and requires
  business connection, substantiation, and return of excess advances.
- [IRS Publication 463](https://www.irs.gov/publications/p463) requires
  adequate records for amount, time, place, and business purpose; a receipt or
  manager approval alone does not establish every required fact.
- [U.S. Department of Labor Fact Sheet 16](https://www.dol.gov/agencies/whd/fact-sheets/16-flsa-wage-deductions)
  shows why deductions and employer-benefit costs cannot be allowed to reduce
  covered wages below applicable floors.
- [California Labor Code § 2802](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=2802.&lawCode=LAB)
  is a concrete example of jurisdiction-specific employee reimbursement
  obligations. Asym cannot make all approved reimbursement contingent on a
  worker-associated Support Assignment Field Account balance.

The permanent product rule is **pay or prevent**: a prospective spending
authorization may be limited by organization-controlled capacity, but once an
eligible expense is incurred and policy or law establishes an obligation,
Field Account underfunding becomes a finance exception rather than a mechanism
that silently erases the obligation.

### Current expense-product patterns

- [Ramp reimbursement submission](https://support.ramp.com/submitting-reimbursements/)
  supports photo, file, email/text-assisted drafts, policy-required fields,
  multiple receipts, mileage, and organization-selected payment outside Ramp.
- [Ramp submission policies](https://support.ramp.com/hc/en-us/articles/1500003723382-Submission-Policies)
  use conditional requirements instead of one giant form.
- [Brex expense reimbursements](https://www.brex.com/support/expense-reimbursements)
  separates request, approval, external/payment state, batched payment
  coverage, and accounting treatment.
- [Brex receipt handling](https://www.brex.com/support/receipts-for-expenses)
  supports mobile capture, email forwarding, automatic suggestions, unmatched
  receipt review, and policy-bounded missing-receipt affidavits.
- [Expensify duplicate review](https://help.expensify.com/articles/new-expensify/reports-and-expenses/How-to-Find-and-Resolve-Flagged-Duplicate-Expenses)
  treats duplicate detection as a reviewable warning and retains a “keep all”
  path for legitimate same-date/same-amount expenses.
- [SAP Concur missing receipt declarations](https://help.sap.com/docs/CONCUR_EXPENSE/f45ee181c99e4d93afbab48a5b75ea50/74cee77cf6d24c43a3c5ecea1daeee31.html)
  make declarations policy-configured, attributable evidence rather than an
  invisible bypass.

The reusable pattern is receipt-first mobile capture, resumable drafts, OCR as
a suggestion, conditional policy fields, line-level disposition, request
changes, human-confirmed duplicate handling, immutable approved versions, and
explicit payment evidence. Phase 21 does not need cards, travel booking, bank
accounts, payment initiation, or a second accounting connector to deliver that
experience.

## D2 evidence: gift activity and a bounded missionary mini-CRM

The following current first-party product evidence informs the next Phase 21
decision. It does not change D1's authority boundaries: a gift-facing CRM
projection may explain support activity and relationships, but it cannot make a
gift immediately available, calculate the Finance-confirmed Field Account
Balance, or declare payroll truth.

### Progressive disclosure patterns

- Bloomerang's redesigned constituent experience leads with a compact **Donor
  Snapshot**, a streamlined header, and a Giving Summary. It moves the complete
  history to a filterable timeline organized by month, with both text labels
  and icons for activity types. This is strong evidence for summary first,
  chronology second, and full record detail only on demand. See
  [Redesigned Constituent Profiles: What's New](https://help.bloomerang.com/en/articles/15705564-redesigned-constituent-profiles-what-s-new).
- Virtuous separates financial gifts, pledges, and recurring gifts on the
  contact record; it hides uncommon transaction fields behind **Additional Gift
  Information** and routes import problems into `Match Needed`, `Update Needed`,
  and `Ready for Import` work. Its configurable contact tabs keep Overview
  primary and place overflow under **More**. See
  [Giving Categories](https://support.virtuous.org/hc/en-us/articles/360050802112-What-Giving-Categories-are-Tracked-on-a-Contact-Record),
  [Enter a Gift](https://support.virtuous.org/hc/en-us/articles/6183286850317-How-Do-I-Enter-a-Gift),
  and
  [Customize Contact Profile Tabs](https://support.virtuous.org/hc/en-us/articles/32176878670349-How-Do-I-Customize-Contact-Profile-Tabs).
- Virtuous's mobile app uses an activity timeline for contacts a user follows,
  plus a personal followed-contact list and quick note/task/contact actions.
  That supports a bounded worker portfolio rather than putting an organization's
  full donor database on a missionary's phone. See
  [Virtuous CRM Mobile App FAQ](https://support.virtuous.org/hc/en-us/articles/30566654657549-Virtuous-CRM-Mobile-App-FAQ).
- Neon CRM's account timeline combines constituent events, transactions, and
  communications in chronological order while keeping donations, soft credits,
  pledges, and recurring schedules distinguishable. Its donor transaction
  history is sortable and filterable, with receipts and the complete record in
  drill-down. See
  [Using the Timeline](https://support.neonone.com/hc/en-us/articles/4407397965581-How-do-I-use-the-Timeline)
  and
  [Donor Transaction History](https://support.neonone.com/hc/en-us/articles/4417225266445-How-do-I-view-and-manage-my-recurring-plans-and-transaction-history).
- DonorPerfect's mobile product prioritizes donor summary, gift and pledge
  history, contact actions, notes, appointments, and a limited set of reports.
  It does not attempt to place the entire desktop finance experience on the
  mobile home screen. See the
  [DonorPerfect Mobile App factsheet](https://www.donorperfect.com/factsheets/donorperfect-mobile-app/).
- Salesforce Nonprofit Cloud models Gift Transaction, Gift Transaction
  Designation, Gift Soft Credit, Gift Refund, Gift Commitment, schedules, and
  Donor Gift Summary as distinct records. That object separation is useful
  evidence against one overloaded `gift status` controlling donor, support,
  refund, receipt, Field Account, and payroll behavior. See
  [Gift Types](https://help.salesforce.com/s/articleView?id=sfdo.fundraising_gift_types.htm&language=en_US&type=5)
  and
  [Fundraising Objects and Fields](https://help.salesforce.com/s/articleView?id=sfdo.RN_NPC_FR_New_Objects_and_Fields_in_Fundraising.htm&language=en_US&type=5).
- Missionary-specific products reinforce the same hierarchy. MPDX puts account
  balance, donations, goal/commitment progress, and relationship tasks in
  separately labelled surfaces; DonorHub/TntConnect imports stable gift IDs
  and organization-supplied balances rather than deriving a balance from the
  missionary CRM. See
  [MPDX Mobile Dashboard](https://help.mpdx.org/article/1100-mpdx-mobile-dashboard),
  [DonorHub Financial Information](https://www.tntware.com/donorhub/help/en/pages/financial-information.aspx),
  and
  [TntConnect Gift Download](https://www.tntware.com/tntconnect/help/en/pages/gifts-download.aspx).

The permanent UX conclusion is **one calm missionary home, one recent-activity
list, and one bounded supporter detail page**. Full finance and provider detail
remains a staff drill-down, not a second worker-facing accounting application.
Phase 21 composes Phase 14's `getSupporterRoster`; it does not create donor CRUD
or a competing contact model. Phase 28 remains the owner of supporter contact
permissions, notes, tasks, appeals, newsletters, coaching, and relationship
workflow.

### Default surface versus drill-down

| Surface           | Show by default                                                                                                                                                                                                               | Reveal only in drill-down or to authorized staff                                                                                                 |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Missionary home   | Support recorded since the last finance close; current goal and recurring-commitment context; first-time, changed, or lapsed supporter cues; the last few privacy-safe activities; tasks that actually require the missionary | Full transaction history; provider processing detail; settlement, batch, receipt, accounting, assessment, allocation, and payroll records        |
| Activity row      | Effective date; amount when permitted; donor display name or `Private donor`; one-time/recurring/offline type; approved project/designation label; one plain-language state; correction indicator                             | Payment method metadata; provider IDs and errors; internal fund/account codes; receipt eligibility; staff-only notes; correction evidence chain  |
| Supporter summary | Phase 14-permitted display name; coarse city/state; safe direct/via recognition path; last confirmed support activity; safe recurring-commitment context                                                                      | Contact methods, notes, tasks, scores, unrelated giving, household internals, tax, banking, billing, or payment-credential data                  |
| Mobile            | Compact support summary, recent activity, supporter search within the permitted Phase 14 roster, contextual `Ask finance` or `This looks wrong` actions                                                                       | Contact/notes/tasks before Phase 28, dense tables, reconciliation, bulk administration, policy configuration, raw exports, or provider debugging |

Every number or timeline must expose a short definition and freshness
provenance. If a field is not permitted, remove the field and its derived total
rather than showing a blank shell that reveals the existence of restricted
data.

### Recommended plain-language vocabulary

Provider and source systems use legitimately different terms. Bloomerang uses
`Accepted`, `Pending`, `Voided`, and `Chargeback`; Neon uses `Succeeded`,
`Declined`, `Pending`, `Deferred`, `Cancelled`, and `Refunded`, with still more
processor states in Neon Fundraise. Those values belong in source detail and
cannot safely become the universal missionary vocabulary. See
[Bloomerang Transaction Reports](https://help.bloomerang.com/en/articles/13382625-transactions-report),
[Neon Transaction Status Definitions](https://support.neonone.com/hc/en-us/articles/4407399233421-Transaction-Status-Definitions),
and
[Neon Fundraise Payment Status](https://support.neonone.com/hc/en-us/articles/4416845413517-Payment-Status-in-Neon-Fundraise).

Use these projection labels, each backed by a typed source state:

| UI label                          | Exact projection meaning                                                                                                         | Must never imply                                                                                          |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Recorded**                      | The source has captured support activity, but it may still change and has not necessarily entered a finance-closed support cycle | Available funds, settlement, Field Account credit, or pay                                                 |
| **Processing**                    | The source explicitly reports that collection, deposit, or verification is not final                                             | Failure or an expected completion date                                                                    |
| **Received**                      | The source authority currently treats the gift as received by the organization                                                   | Irrevocability, inclusion in a Field Account close, accounting export, reimbursement capacity, or payroll |
| **Included through {close date}** | The immutable support-cycle coverage proves this activity was included through the named finance close                           | A promise that the same amount will be paid to the missionary                                             |
| **Corrected**                     | A linked successor changes one or more facts while retaining the earlier evidence                                                | Silent in-place editing                                                                                   |
| **Reversed**                      | A source-authoritative reversal negates the prior support effect                                                                 | Deletion of the original event or automatic recovery from the worker                                      |
| **Private donor**                 | The missionary projection intentionally withholds identity, even if the organization knows it                                    | An organization-wide anonymous record                                                                     |
| **Needs your input**              | A bounded action can be completed by this missionary now, with a clear next step                                                 | A generic finance failure or internal staff exception                                                     |

Reserve **Anonymous donor** for a source-owned donor record that truly lacks a
known identity. Use **Private donor** when identity exists but is withheld from
the worker. Do not use `Available`, `Settled`, `Paid`, `Your balance`, `Your
money`, `Failed`, or raw provider text on the missionary activity surface
unless that exact meaning is owned and proved by the corresponding authority.

### Donor privacy and access boundaries

- Worker access must be a deny-by-default projection scoped by tenant, Legal
  Entity, active worker/project relationship, donor privacy choice, and the
  user's current permission. It must not be a filtered client-side view over
  unrestricted CRM records.
- Public anonymity, organization visibility, and missionary visibility are
  three different scopes. Bloomerang allows a donor to hide name and amount
  publicly while the organization retains the record and can separately
  control fundraiser visibility. Virtuous can preserve a private gift while
  withholding donor identity from users lacking `View Private`. See
  [Bloomerang Anonymous Giving](https://help.bloomerang.com/en/articles/13382752-can-donors-give-to-a-peer-to-peer-campaign-anonymously)
  and
  [Virtuous User Permissions](https://support.virtuous.org/hc/en-us/articles/360050985731-How-Do-I-Manage-User-Permissions).
- Permissions must apply identically to web, mobile, exports, notifications,
  search, counts, charts, and cached/offline data. Bloomerang's current
  permission matrix demonstrates that removing transaction access must also
  remove giving analytics, timeline highlights, statements, notifications,
  and mobile activity; its warning about old mobile versions that failed to
  enforce permissions is a concrete example of why server-side enforcement and
  session revocation are required. See
  [Bloomerang User Permissions](https://help.bloomerang.com/en/articles/12632881-user-permissions).
- A missionary projection must not expose provider error text, full billing
  address, payment credentials or last-four digits, receipt artifacts, tax
  details, staff-only notes, unrelated household giving, prospect scores, or
  another worker's relationship. Contact actions appear only for permitted
  channels and data.
- Private and staff notes require explicit audiences. A worker-authored
  relationship note is not automatically a finance note, and a finance/private
  note is never inherited into the missionary mini-CRM. Virtuous's private-note
  and project-restricted permissions are useful reference behavior. See
  [Create a Contact Note](https://support.virtuous.org/hc/en-us/articles/360060363671-How-Do-I-Create-a-Contact-Note)
  and
  [Virtuous User Permissions](https://support.virtuous.org/hc/en-us/articles/360050985731-How-Do-I-Manage-User-Permissions).

### Mobile and accessibility contract

- Status is always visible text; color and icons may reinforce but never carry
  the meaning alone. This follows WCAG 2.2's
  [Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)
  guidance.
- Filtering, saving notes/tasks, refreshing activity, and async correction
  updates must announce concise results without moving focus. W3C's
  [Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
  guidance explicitly supports programmatic status announcements while warning
  against unnecessarily interrupting the user's work.
- Interactive targets must meet WCAG 2.2's
  [24-by-24 CSS-pixel minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html);
  high-frequency mobile actions should be larger when the design permits.
  Keyboard focus, reading order, disclosure state, and error association remain
  programmatically exposed.
- Mobile must preserve the same task and information outcome as desktop, not
  merely shrink a desktop table. W3C states that WCAG applies to mobile web and
  native applications and documents the overlapping mobile accessibility
  concerns in
  [Mobile Accessibility at W3C](https://www.w3.org/WAI/standards-guidelines/mobile/).
- Freshness and offline state are text-labelled. Cached activity may remain
  readable, but sensitive cached data must be invalidated after access
  revocation; offline creation is a local draft until the server confirms it.

### D2 synthesis for the grill

The best next decision is a **source-authoritative, privacy-projected
missionary Support Activity experience**: recent support activity and bounded
supporter context are immediately understandable, while source status, finance
close, Field Account, accounting, reimbursement, and payroll remain separate
authorities. In Phase 21 it should optimize two jobs only: understand recent
support and complete the next finance/expense action. Phase 14 owns the
supporter roster; Phase 28 later adds permitted contact methods, relationship
tasks, notes, appeals, newsletters, and coaching. Everything else is
progressive disclosure or a staff-only exception.

## Recommended Asym information hierarchy

Do not use one unlabeled “available balance.” Use one calm page with four
independently authoritative sections:

1. **Support activity**
   - Primary metric: “Support recorded this period.”
   - Separate `received/processed`, `pending`, `reversed/corrected`, monthly commitments, and goal progress.
   - Owned by contribution/support-allocation sources, not payroll or QBO/Xero.
   - Recent gifts and exceptions drill down to the exact source event.

2. **Organization-held ministry support**
   - Primary metric: the **Finance-confirmed Field Account Balance**, using
     “Finance-confirmed support balance” or a tenant-configurable plain-language
     label, followed by “Held and controlled by {organization}.”
   - Show an explicit `as of` timestamp and source/close status.
   - Break the number into tenant-policy roles only when the tenant uses them,
     for example: reserved compensation funding, policy-calculated ministry
     expense capacity, and remaining organization-held support. Expense capacity
     is not cash, payment approval, or a withdrawal right.
   - Balance must derive from complete organization-approved allocations and
     outflows, never from a donation sum. If optional QBO/Xero tie-out evidence
     is stale, preserve the last Finance-confirmed Field Account Balance with a
     quiet stale indicator; do not silently blend new gift activity into it or
     let provider books overwrite the Field Account close.

3. **Next compensation cycle**
   - Show cadence and date first: “Next payroll: August 15.”
   - Show an amount only when an authoritative plan, Compensation Funding
     Decision, or external result provides one and tenant visibility permits
     it. Use D4's **Planned**, **With payroll**, **Processing**,
     **Payment confirmed**, or **Needs attention** projection; label an amount
     paid only from an exact External Payment Occurrence.
   - Explain in one sentence that Asym records the support and plan but the tenant’s normal payroll process sends compensation.
   - Never call support “withdrawable,” “your money,” or “available to cash out.”

4. **Expense and reimbursement**
   - Use one primary **Submit expense** action with receipt capture,
     missing-receipt evidence, business purpose, and only the fields required by
     the applicable tenant policy.
   - Use claimant-readable statuses such as `Needs information`, `In review`,
     `Approved`, `Owed`, `Funding exception`, `Sent to payroll/AP`,
     `Partially paid`, and `Paid with evidence`.
   - Keep Expense Claim, policy decision, Approved Expense Snapshot,
     Reimbursement Obligation, Field Account Funding Coverage, External Payment
     Occurrence, and accounting delivery separate beneath the report-first view.

The default mobile order should be: next payroll date/status, organization-held balance with freshness, support this month versus goal, recent activity, then exceptions requiring attention. Desktop may show the first three as adjacent summary cards. A single **How this is calculated** disclosure should define every metric and source without making the page noisy.

## Corrections and failure UX

- Use stable source IDs and append-only corrections; show a correction as a linked replacement/reversal rather than deleting history.
- A changed balance should retain the earlier period statement and clearly identify the adjustment date and affected period.
- If the accounting/tie-out feed is delayed, preserve the last confirmed balance with its timestamp, keep newer support activity in its own section, and show “Balance update delayed” rather than combining incompatible freshness.
- Never make QBO/Xero bank reconciliation a missionary-facing task. Finance resolves exceptions; missionaries see a calm status and a contextual “Ask finance about this” action.

## Current-repo contradictions to retire during the Phase 21 build

These are forward implementation obligations, not authority to change runtime
during this grill session:

- `packages/missionary/components/balance-card.tsx` says **Available Funds** and
  offers **Withdraw**. It must not be reused as the Phase 21 balance surface.
- the current missionary portal projection and seed path derive ambiguous
  support values from `current_funding` or donation sums. Those values may
  remain demo evidence temporarily, but cannot enter the Phase 21 authority or
  dashboard contract;
- missionary dashboard `raisedCents`, public-giving
  `{projection,columns,types}`, GraphQL/database exposure, generated types, and
  related tests must move to source-owned Phase 21/public-goal projections
  rather than preserve `current_funding` through a compatibility layer;
- active missionary charts must say gift/support **activity** when that is all
  they contain; they must not imply a balance, funding coverage, or payroll
  amount;
- public worker and FAQ copy that promises “100%” goes directly to a worker's
  Field Account or gives a donor “full control” conflicts with organization
  discretion, separate assessments/costs, and D1; and
- Phase 13's clean cutover away from writable `funds.current_amount` remains a
  prerequisite. Phase 21 must not recreate it under another name; and
- `packages/config/payouts.ts` belongs to Mission Control Payouts and cannot
  become a D4 compensation or payroll adapter.

## D3 evidence: bounded prospective Assessment Profiles

**Decision:** D3
**Status:** Ratified and adversarially hardened on 2026-07-28

> **C-prime-amended-and-hardened (C-prime-R) — explicit
> zero-assessment default with bounded prospective Assessment Profiles,
> deterministic non-stacking resolution, period-correct
> minimum/flat/cap/service components, immutable source and period coverage,
> component-correct append-only reversals, production-shaped activation proof,
> and transparent tenant-configurable presentation.**

### Mission-policy and nonprofit-finance evidence

- Reliant's published
  [Administrative Fee policy](https://solomon.reliant.org/display/public/employman/Administrative%2BFee)
  demonstrates why one tenant-wide percentage is insufficient. It documents
  different percentage assessments for general gifts and sponsor-church
  support, different treatment for interns and associates, monthly minimums
  including zero-gift months, and negotiated flat arrangements. Its
  [Support Goal guide](https://solomon.reliant.org/download/export/pdfexport-20260417-170426-1606-4351/mtdmanual-SupportGoal-Toolbox-170426-1606-4352.pdf?contentType=application%2Fpdf)
  also distinguishes charges to the organization-controlled ministry account
  from deductions taken from a missionary's paycheck. Asym must preserve that
  distinction in both its model and its copy.
- Blackbaud Financial Edge documents active/inactive allocation rates,
  effective date ranges whose values cannot overlap, and deactivation rather
  than deletion of a rate that has already been used. It also warns against
  automatically associating a rate with all future endowments unless that is
  truly intended. Those patterns support prospective versions, explicit
  coverage, and retirement rather than mutation in Asym. See the
  [General Ledger Records Guide, pages 87-88](https://help.blackbaud.com/docs/0/assets/guides/fe/glrecord.pdf).
- Gift-percentage assessments and period assessments are different accounting
  occurrences. A partial or full gift refund can proportionally reverse the
  original source-derived percentage assessment. A monthly minimum, flat
  assessment, or cap must instead be remeasured as a separate append-only
  period adjustment; it must never be falsely attributed across donor gifts.

### Modern policy-management UX evidence

- Ramp's current
  [expense-policy onboarding](https://support.ramp.com/getting-started-with-ramps-expense-policy-setup/)
  uses guided setup, a best-practice starting point, visible modified markers,
  and preview before finalization. Asym should adopt those low-friction
  patterns while retaining `No assessment` as its initial default.
- Brex supports a default policy plus targeted exceptions based on attributes
  such as role, department, cost center, or an exact employee, and asks the
  administrator to review before sharing. However, its documented policy
  behavior also permits draggable exception priority and applies changes to
  current and future expenses immediately. Those latter patterns are unsafe
  for immutable Field Account postings and must not be copied. See
  [Brex expense policies](https://www.brex.com/support/policies).
- HubSpot lets an administrator test exact records against criteria and
  simulate a path without executing actions, while retaining the exact version
  used for diagnosis. Asym should provide equivalent side-effect-free
  account/scenario tests and a production-shaped impact preview before a
  prospective version can be scheduled. See
  [Test your workflow](https://knowledge.hubspot.com/workflows/test-your-workflow).
- SAP Concur uses cause-specific exceptions with configurable, claimant-readable
  messages and routes only unresolved exceptions for review. This supports
  Asym's quiet exception-first finance workspace, but an assessment integrity
  failure must never be dismissible through a generic comment. See
  [Concur exception behavior](https://help.sap.com/docs/CONCUR_EXPENSE/bb83754b1c5541808d50c09901e11475/80a1fb4e2733411bb719acb01f17d5ed.html).
- QuickBooks Workforce gives workers high-level gross/net information at a
  glance and makes individual deductions available in detailed pay stubs.
  Asym should borrow that progressive information hierarchy, not payroll
  terminology: assessment activity is not salary, tax, withholding, take-home
  pay, or worker-owned money. See
  [QuickBooks Workforce pay information](https://quickbooks.intuit.com/learn-support/en-us/help-article/t4-slips/view-paychecks-w-2s-quickbooks-workforce/L3TCwUJtD_US_en_US).

### Accessibility and consequential-action evidence

- WCAG 2.2 requires an opportunity to review, confirm, and correct a
  consequential financial submission. Scheduling a prospective assessment
  version therefore needs a plain-language check-answers step with an exact
  effective Assessment Period boundary and a specific
  `Schedule assessment policy` action, not an ambiguous `Save` button. See
  [Error Prevention (Legal, Financial, Data)](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data)
  and the
  [GOV.UK check-answers pattern](https://design-system.service.gov.uk/patterns/check-answers/).
- Missionary and staff calculation details must not depend on hover or color.
  `How support is calculated` is a keyboard-operable disclosure button with an
  accurate `aria-expanded` state, as specified by the
  [W3C Disclosure Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/).
  Validation appears in text both inline and in a linked error summary, and
  asynchronous preview results use a non-interrupting programmatic status
  message.

### Resulting Asym contract

1. Each Tenant and Legal Entity starts with an explicit immutable
   `No assessment` policy version. Missing configuration never acts as a
   financial rule. When this version is active, assessment setup and zero-value
   assessment lines remain absent from missionary UX.
2. The bounded calculation catalog is: no assessment; percentage of gross
   support allocation; percentage with a monthly minimum and/or cap; fixed
   monthly assessment; and one percentage-plus-fixed-monthly-services shape
   evidenced by current mission-agency practice. An exemption is a scoped
   no-assessment profile; a negotiated flat arrangement is an exact-account
   fixed-monthly profile. Profiles never stack: the combined shape is one
   profile with two typed components, not two independently resolving rules.
   Arbitrary formulas, scripts, rule-order dragging, payroll behavior, and
   processor-fee behavior are excluded.
3. Exactly one profile wins through a fixed, visible specificity order: exact
   Support Assignment/Field Account assignment; exact worker-classification plus lifecycle-stage
   assignment; one matching single-axis worker-classification or
   lifecycle-stage assignment; then the Legal-Entity/currency default. The two
   single-axis selectors share one rank because the product cannot honestly
   assume that classification always outranks lifecycle, or vice versa. If
   both match different profiles, an explicit combination assignment is
   required and the account is blocked rather than silently charged. Within
   the one winning profile, an exact source-family treatment replaces the
   profile's default source treatment. Source family is not a second stackable
   profile. Classification or lifecycle selectors resolve only from an
   explicit prospective, source-labelled Support-Assignment assessment-
   applicability context. They are never inferred from current Support
   Assignment Participant Memberships, participant count, workspace access,
   or relationship labels; an absent axis does not match.
4. `Finance > Field Accounts > Assessments` presents one compact overview:
   current policy, any scheduled successor, profile coverage, no-assessment
   coverage, and exception count. `Create change` clones the current immutable
   version into a draft. Active and historical versions are read-only.
5. The guided flow is: define calculation, define bounded applicability,
   preview/test, then review and schedule. Preview shows an example
   gross-to-assessment-to-credited calculation, exact winner traces, accounts
   changing profile, projected change based on a named closed period,
   no-assessment fallback coverage, ambiguity, currency incompatibility, and
   the exact future monthly Assessment Period boundary. Testing has no posting
   side effects.
6. Missionary presentation has three safe tenant-selectable modes:
   `Compact transparent` (default), `Balanced`, and `Detailed`. Tenants may
   choose a display label and explanation, but details and the immutable cycle
   statement always preserve the canonical gross support, organization
   assessment, and support credited amounts. Gross-only presentation is not
   permitted when an assessment exists.
7. Gift activity continues to show the donor's gross gift truth. Percentage
   assessment and resulting support credit appear in detail; a monthly
   minimum, cap adjustment, or fixed assessment appears as separate period
   activity rather than being attached to a donor.
8. Corrections use the original profile version and rounded source coverage.
   They are append-only. The engine never recalculates historical source
   assessments using today's profile and never reopens a closed Support Cycle.
9. Activation blockers include ambiguous winners, overlapping effective
   versions, invalid minimum/cap relationships, unsupported currency, invalid
   semantic references, or a boundary inside a reviewed/closing cycle.
   High-rate or high-impact changes, broad no-assessment fallback, and
   open-ended negotiated arrangements are visible warnings rather than
   automatic bureaucracy.
10. A general rules DSL, mandatory two-person approval, per-clean-entry review,
    provider calls during close, retroactive re-rating, and a second payroll or
    accounting engine are explicit overengineering exclusions.

### Supplemental primary-source findings and assessment guardrails

Research snapshot: 2026-07-28

#### What current mission-agency evidence actually proves

There is no defensible universal mission-agency assessment formula. Current
first-party examples instead show materially different combinations of
percentage assessments, source-sensitive rates, recurring service charges,
volume-sensitive reductions, worker/status-specific policy, and individually
negotiated arrangements:

- [Reliant Mission's public Administrative Fee policy](https://solomon.reliant.org/display/public/employman/Administrative%2BFee)
  publishes different percentage schedules for different forms of support and
  worker arrangements, monthly minimums that can apply even in a low- or
  zero-gift month, and negotiated flat-fee treatment. This supports bounded
  source-family, worker-classification/lifecycle, minimum, and exact-account
  overrides. It does **not** support copying Reliant's percentages into Asym
  defaults.
- [ABWE's current financial model](https://abwe.org/financial-model/) combines
  a disclosed percentage donation charge with a recurring monthly
  missionary-services contribution and a volume-sensitive reduction. Its
  [giving FAQ](https://abwe.org/giving-questions/) separately explains
  processor-cost treatment and organizational control. This is evidence that
  an assessment profile may legitimately combine a percentage with a
  monthly Assessment Period amount, but that processing cost and organizational
  assessment must remain different concepts and entries.
- The [IPHC World Missions April 2025 policy manual](https://iphc.org/missions/wp-content/uploads/sites/2/2025/04/WMM-Policy-Manual-April-2025.pdf)
  varies funding, salary, reimbursement, and support-account treatment by
  missionary status and jointly approved budget. The
  [Assemblies of God U.S. Missions missionary/career-associate manual](https://usmissions.ag.org/-/media/USMissionsV2/Downloads/US-Missions-Missionary-and-Career-Associate-Manual-072024.pdf)
  likewise maintains explicit worker classifications. These sources support a
  bounded classification or lifecycle-stage scope; they do not justify
  inferring a worker's classification from gifts, public profile data, or
  employment guesses.
- [IRS Publication 526](https://www.irs.gov/publications/p526) distinguishes a
  contribution to a qualified organization from a transfer earmarked for a
  particular individual, while
  [IRS Publication 1771](https://www.irs.gov/pub/irs-pdf/p1771.pdf) describes
  the donor-facing substantiation of the contribution amount. Together these
  reinforce the product boundary: the donor gift remains the source-owned
  gross contribution; an agency assessment is a separate organization-owned
  Field Account effect and must never rewrite the gift, deductible amount,
  receipt, or donor history.

The safe product conclusion is therefore configuration without presumption:
every tenant starts with an explicit prospective **No assessment** profile.
Asym must not activate an assessment from the tenant's denomination, country,
worker type, imported history, or an industry template. Templates may help a
tenant configure its own policy, but only an authorized tenant decision can
publish a charging profile.

#### Recommended bounded profile catalog

Use a small typed catalog, not a rules language:

| Profile method                     | Supported shape                                                                                    | Required guardrail                                                                                                  |
| ---------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `No assessment`                    | Explicit zero-effect tenant default or scoped exemption                                            | Product default; creates no charge and no zero-dollar missionary noise                                              |
| `Percentage`                       | One source-family rate schedule applied to defined gross-support bases                             | Basis, rounding rule, currency, and excluded source effects are explicit                                            |
| `Percentage with period minimum`   | Percentage total raised to one fixed minimum for the monthly Assessment Period                     | Minimum is a separate period effect; zero-support-month behavior is explicit and it is not fabricated as a gift fee |
| `Percentage with period cap`       | Percentage total limited to one fixed cap for the monthly Assessment Period                        | Cap is evaluated once over exact immutable Assessment Period coverage                                               |
| `Negotiated flat`                  | One fixed amount per monthly Assessment Period for one exact account or bounded group              | Effective interval and agreement/reference evidence are required                                                    |
| `Percentage plus monthly services` | One source-linked percentage schedule plus one fixed monthly service component in the same profile | The components are separate entries inside one winning profile, not independently resolving or stackable policies   |
| `Exempt`                           | Explicit scoped replacement for a broader charging profile                                         | Must win deterministically and explain why                                                                          |

A profile is one immutable prospective version with:

- tenant, Legal Entity, currency, monthly Assessment Period calendar, and
  effective half-open interval;
- one method and its complete parameters;
- one bounded assignment scope: Legal-Entity/currency default, worker
  classification, lifecycle stage, their exact combination, or exact
  negotiated Field Account; plus one finite source-family treatment schedule
  inside the profile;
- an explicit gross-support basis and source-effect inclusion catalog;
- deterministic decimal precision, rounding, period-minimum/cap behavior, and
  refund/return behavior;
- staff-facing name, bounded missionary-facing label, explanation, owner,
  approval evidence, and change reason; and
- activation, supersession, and immutable usage evidence.

Profiles are replacements, not additive layers. Exactly one profile wins for a
covered source effect through the fixed specificity order documented above; an
exact source-family treatment is then selected inside that profile. Activation
rejects same-rank overlaps and the preview states the winner and reason. Two
matching single-axis assignments may coexist only when they resolve to the
same profile; otherwise the tenant must define the exact combination. Asym
must not silently stack a source profile, worker profile, monthly minimum, and
negotiated charge. Source family is a finite, source-owned identifier frozen
with the covered occurrence—not free text, a campaign tag, a donor attribute,
or current contact data. Unknown adapter values enter an exception lane rather
than falling through to a different charge.

The assessable base is the exact Gross Support Allocation owned by Phase 21.
Fee-cover amounts, processor costs, refunds, opening balances, and internal
Field Account transfers are not assessable gifts. Phase 20 D19 processor-cost
attribution remains a separate occurrence and can affect a Field Account only
through its exact manifest once; an assessment must never duplicate or
relabel it.

The **Assessment Period** is monthly and independent of Support Cycle cadence.
Its guided default is the Legal Entity's calendar month in the pinned finance
timezone; a tenant may instead align it to its configured monthly finance
calendar. A monthly tenant ordinarily finalizes one Assessment Period in one
Support Cycle close. A biweekly tenant can close source-linked percentage
entries during the month, but exactly one later close owns the immutable
minimum, cap, fixed, or combined-service period adjustment. No FX conversion
or cross-currency residual is permitted.

Percentage amounts are rounded once per covered source occurrence in integer
minor units under the frozen profile. The monthly target is then
`min(max(sum(source percentages), minimum), cap)`, omitting an unconfigured
bound. One separate period adjustment records `target − source percentages`:
a positive minimum top-up or a negative cap credit. It is not redistributed
over donor gifts. A zero-support month can trigger a minimum only when the
tenant explicitly enables that behavior; the guided default is off. A partial
first or last month must use one explicit bounded choice—prorated (guided
default), full, or waived—captured in the immutable determination. Successor
policy changes start only at a complete future Assessment Period boundary;
partial-period behavior exists for a Field Account that legitimately begins
or ends participation mid-period, not as a shortcut for retroactive editing.

#### Correction and reversal consequences

“Automatic proportional reversal” must be typed rather than applied blindly:

- a returned, refunded, voided, or redesignated gift reverses the exact
  **gift-linked variable assessment coverage** attributable to the affected
  amount;
- a partial adverse effect reverses that linked variable assessment using the
  original profile version, basis, precision, and rounding—not today's policy;
- a period minimum, cap adjustment, negotiated flat charge, or monthly service
  component is a **period-level assessment effect**. The system recomputes or
  corrects that effect from the profile's immutable covered Assessment Period;
  it must not pretend the whole fixed charge belonged to the returned gift;
- corrections append linked inverse and replacement effects. They never edit
  the gift, original assessment, closed Support Cycle, or earlier statement;
  and
- a profile can change future behavior only. A prospective version cannot
  reinterpret already closed coverage.

These distinctions prevent both double charging and an equally serious
undercharge caused by reversing an entire monthly service amount when one gift
is refunded.

#### Admin and finance UX implications

The ordinary configuration flow should take four short steps:

1. **Do you use an organizational assessment?** Default `No`. Choosing `No`
   completes setup; tenants without assessments should not encounter profile
   tables or dashboard cards elsewhere.
2. **How is it calculated?** Choose one bounded method, with a worked
   gross-to-assessment-to-credited-support example beside the inputs.
3. **Who does it apply to?** Start with everyone, then offer one bounded
   assignment scope per profile: source-family treatment within the profile,
   worker classification, lifecycle stage, their exact combination, or an
   exact negotiated account. Show which broader assignment it replaces.
4. **Review and schedule.** Preview affected accounts and a representative
   prior Assessment Period without mutating it; show conflicts,
   zero-support-month behavior, refund examples, the exact start boundary, and
   the authorized actor before publishing.

The standing staff surface should be one compact profile list:

- `Active`, `Scheduled`, and `Ended` states;
- scope, method, effective date, number of affected accounts, and plain-language
  precedence reason;
- **Preview impact**, **Schedule replacement**, and **End prospectively**
  actions—never edit-in-place;
- conflict and uncovered-scope warnings before activation; and
- an exception-first close view for missing classification, ambiguous scope,
  unsupported currency, stale policy reference, or failed invariant. Clean
  assessment rows need no manual approval ceremony.

All amounts in review and close show the equation
`gross support − organizational assessment = support credited`, while
processor cost remains independently labelled and governed. Staff can drill
into the exact profile version, assessment entry, coverage, source effects,
rounding, and correction chain.

#### Missionary UX implications

The missionary should see the financial effect without being made to operate
the policy:

- when the active winner is `No assessment`, omit assessment UI entirely
  rather than showing recurring `$0.00` rows;
- when an assessment applies, show one calm cycle summary:
  **Gross support recorded**, **Organization assessment**, and **Support
  credited**, with the Finance-confirmed balance still presented separately;
- let the tenant choose a bounded honest label such as **Organization
  assessment**, **Ministry services**, or **Agency support cost**, plus
  per-cycle summary versus expanded gift-linked detail. Do not permit a label
  that disguises the assessment as a card-processing fee, donor restriction,
  withdrawal, or worker-owned liability;
- provide one **How this is calculated** disclosure containing the worker's
  applicable method, rate or fixed amount, minimum/cap when relevant, effective
  date, and a concrete example. Never reveal another worker's negotiated terms;
- show corrections as linked adjustments in the affected current cycle or
  successor correction lane, while preserving the original period statement;
  and
- direct policy questions to one tenant-configured finance contact. A
  missionary does not choose profiles, resolve mappings, approve assessment
  rows, or repair accounting.

#### Adversarial conclusion

The defensible D3 design is a **prospective, typed, exactly-one-winner policy
compiler over separate immutable assessment effects**, with an explicit
no-assessment default. The important constraints are as much about what Asym
must refuse as what it supports:

- no industry-derived fee enabled by default;
- no arbitrary formula builder or stackable rule soup;
- no retroactive profile mutation;
- no rewriting gross gift or receipt truth;
- no conflation of processor cost and organization assessment;
- no unscoped fixed charge masquerading as a per-gift fee;
- no whole-flat-fee reversal for one returned gift;
- no ambiguous overlap at activation; and
- no hidden assessment effect in the missionary's balance.

This bounded model covers the materially different current mission-agency
patterns evidenced above while keeping a zero-assessment tenant's product
quiet, a charging tenant's configuration understandable, and every closed
effect reproducible.

## D4 ratified direction: contract-referenced compensation funding with external payroll authority

Status: ratified on 2026-07-28.

### Research verdict

The selected direction is sound only if **compensation funding**, **payroll
processing**, **accounting**, and **payment** remain independently
authoritative. A support balance may inform how the organization plans to fund
compensation, but it cannot determine worker classification, legal wage
entitlement, tax treatment, deductions, net pay, payroll completion, or whether
money reached the worker.

Current mission-agency practices materially differ:

- [Reliant](https://solomon.reliant.org/spaces/flyingpdf/pdfpageexport.action?pageId=69152936)
  uses a prior-month ministry-account balance, reserves employer costs, and may
  issue a short check under its own policy.
- [St. Paul's Outreach](https://www.spo.org/s/MPDGiftOperationsHandbook20-21.pdf)
  documents prior-month support, a compensation cap, program fees, payroll
  deductions, and two paychecks in the following month.
- [ABWE's policy manual](https://docs.abwe.org/goteam/ABWEPolicyManual.pdf)
  separates personal support and ministry-expense accounts, states that the
  organization owns and controls the funds, and places salary and budget under
  organization policy rather than worker ownership.
- [Mission Quest](https://missionquest.freshdesk.com/support/solutions/articles/35000124608-things-to-keep-in-mind)
  documents an organization-defined maximum monthly compensation and a
  separate compensation schedule.

Those are evidence for flexibility, not safe product defaults. In the United
States, worker status and compensation treatment remain legal and
organization-owned decisions. The
[IRS exempt-organization classification guidance](https://www.irs.gov/charities-non-profits/exempt-organizations-independent-contractors-vs-employees)
requires the organization to determine the actual relationship, while
[IRS Publication 517](https://www.irs.gov/publications/p517) shows that
ministerial tax treatment can differ from ordinary employee treatment even
when the minister is a common-law employee. The
[Department of Labor nonprofit guidance](https://www.dol.gov/agencies/whd/fact-sheets/14a-flsa-non-profits)
and
[wage-deduction guidance](https://www.dol.gov/agencies/whd/fact-sheets/16-flsa-wage-deductions)
also demonstrate why software must not automatically reduce compensation
because support, donors, or organization-controlled funds are short.

The permanent product rule is:

> Asym may help an authorized tenant decide and evidence how much
> organization-controlled Field Account capacity it intends to apply toward an
> externally authorized compensation arrangement. The tenant's HR, payroll, or
> accounts-payable authority determines the compensation obligation and
> executes it. The external provider or explicit payment evidence determines
> processing and payment truth.

### Provider and integration findings

A first-class accounting connection is not automatically a payroll connection:

- The
  [QuickBooks Online Accounting API](https://developer.intuit.com/app/developer/qbo/docs/learn/explore-the-quickbooks-online-api)
  and QuickBooks Workforce are separate products and authorization surfaces.
  Intuit's
  [Workforce FAQ](https://developer.intuit.com/app/developer/payroll-time/docs/faq)
  says payroll scopes are not publicly self-service, access is partner-gated,
  and Workforce has no sandbox. An ordinary QBO connection therefore cannot
  promise payroll submission.
- Xero exposes separate regional payroll APIs. The
  [Xero UK Pay Runs API](https://developer.xero.com/documentation/api/payrolluk/payruns)
  is read-only for pay runs, while the
  [Xero Australia Pay Runs API](https://developer.xero.com/documentation/api/payrollau/payruns)
  supports create/update behavior. Xero's
  [OAuth scope catalog](https://developer.xero.com/documentation/guides/oauth2/scopes/)
  separates payroll settings, employees, pay runs, payslips, and timesheets.
  Xero `POSTED` is a pay-run/accounting fact, not proof of bank delivery.
- [Gusto's payroll statuses](https://docs.gusto.com/embedded-payroll/docs/payroll-statuses)
  distinguish unprocessed, submitted, pending, and paid. Gusto also warns that
  direct deposits can take additional time to appear at the worker's bank.
- [SAP Concur's payment statuses](https://help.sap.com/docs/concur-expense/concur-expense-professional-edition-administration-guides/understanding-payment-statuses)
  distinguish approval, extraction, processing, paid, and payment-confirmed
  evidence. This is a useful cross-domain precedent: workflow completion and
  actual payment are not one status.
- [Ramp's off-platform reimbursement model](https://support.ramp.com/submitting-reimbursements/)
  explicitly says a manual-payment status is for tracking and does not send
  money. This supports an explicit evidence action instead of a misleading
  generic `Mark paid`.

Every tenant must therefore have an **artifact-always** handoff. An optional
provider lane may be enabled only after Asym proves the exact tenant, Legal
Entity, provider company, product, country, environment, permissions, scopes,
and operation. Certified automation may populate a provider draft; it must not
approve, submit, calculate, or autonomously run payroll.

### Lean durable authority model

The implementation may reuse Phase 20 transport, secret, queue, idempotency,
and evidence infrastructure rather than create a second integration framework.
D7 nevertheless makes Phase 21 the business owner of the
compensation-specific Adapter capability certificate, Compensation Draft
Delivery Profile Version, Provider Draft Operation, and delivery coverage.
Reuse does not turn those records into a Phase 20 Provider Delivery Plan or
Accounting Delivery Operation and authorizes no accounting-native write. Phase
21 needs these compensation-specific authorities:

| Authority                                                      | Owns                                                                                                                                                                                                                | Must never imply                                                                                                                |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Engagement Authority Reference**                             | Exact tenant, Legal Entity, worker/payee, effective interval, and classification asserted by either a provider source identity/version or a governed tenant-issued record with issuer/actor and evidence reference  | That Asym classified the worker or validated employment law                                                                     |
| **Compensation Funding Plan Version**                          | Prospective tenant choice, half-open configuration-effective interval, and cadence for how Asym prepares Field Account funding for an externally authorized arrangement                                             | That the plan owns a cycle's Compensation Funding Period; wage entitlement, tax calculation, take-home pay, or a promise to pay |
| **Compensation Funding Decision**                              | One immutable, cycle-specific finance authorization stating exact Field Account coverage and any separately identified organization funding                                                                         | Payroll approval, provider processing, accounting posting, or payment                                                           |
| **Field Account Funding Coverage** with purpose `compensation` | Exact source effects and amounts consumed by one decision, preventing double use through the existing D1 authority                                                                                                  | Worker ownership of the covered support                                                                                         |
| **Compensation Handoff Package**                               | Immutable human-usable artifact and, when certified, the exact provider-draft payload and digest                                                                                                                    | That download, export, or draft acceptance means submitted, processed, or paid                                                  |
| **Compensation Handoff Adapter certification**                 | Exact provider, product, country, environment, supported operation, constraints, production authorization, last proof, expiry, and kill-switch capability                                                           | Generic provider parity, accounting authority, or a launch claim before the two-adapter gate                                    |
| **Compensation Draft Delivery Profile Version**                | Prospective exact Tenant, Legal Entity, provider organization, product, country, environment, participant, currency, pay cycle, component-role, operation, and certification binding                                | Mutable rerouting of an existing package or attempt                                                                             |
| **Provider Draft Operation**                                   | Immutable evidence for one exact provider-draft/input attempt, bounded child operations, readback or permitted confirmation, drift, and per-unit recovery disposition                                               | That artifact/readback-only fulfillment mutated a provider; provider acceptance means completion or payment                     |
| **External Compensation Result**                               | Provider/staff-evidenced finalized external compensation result and exact organization-cost components, preserving native pay-period, pay-run, payslip, failure, cancellation, partial-reversal, and reversal facts | Bank delivery unless the evidence proves it; permission to recalculate payroll inside Asym                                      |
| **Compensation Field Account Effect**                          | Append-only operational debit or correction derived only from an evidence-qualified External Compensation Result or External Payment Occurrence under the pinned tenant recognition policy                          | That a standing plan, reservation, handoff, or provider draft can debit the Field Account                                       |
| **External Payment Occurrence**                                | Provider or explicit staff evidence of the amount/date actually paid or reversed                                                                                                                                    | That the Field Account, payroll, or GL may be rewritten                                                                         |
| **Compensation Exception Case**                                | One cause-owned case for missing authority, shortfall, stale mapping, failed handoff, ambiguous result, drift, or reversal                                                                                          | A custom payroll workflow or duplicate truth system                                                                             |

A funding proposal is a disposable projection from current facts. It is not a
durable authority and can be recomputed until finance confirms the immutable
Compensation Funding Decision.

### Bounded tenant flexibility

The ordinary setup starts with **Not managed in Asym**. An authorized tenant may
activate one prospective Compensation Funding Plan Version for an exact Legal
Entity, worker/payee, Support Assignment, Field Account, Field Account funding currency, external
compensation/payment currency, external arrangement, and destination. The
currencies are equal in the ordinary case. The Plan Version owns a half-open
configuration-effective interval and cadence; it does not own a cycle's
Compensation Funding Period. Each proposal and decision instantiates one exact
half-open **Compensation Funding Period**. It may align with a monthly or
biweekly Support Cycle and an external payroll/AP period in the common case,
but none of those periods owns or redefines the others.
The guided catalog has only three active funding methods:

1. **Finance enters each cycle** — no amount is presumed; staff enters an amount
   backed by the external authority.
2. **Fixed approved target** — Asym proposes one tenant-supplied target for each
   covered compensation period.
3. **Up to an approved maximum** — Asym proposes the lower of the
   tenant-supplied maximum and the exact policy-qualified Field Account funding
   capacity.

This is intentionally not a formula builder. Percentage-of-balance pay,
donation-triggered pay, arbitrary expressions, tax formulas, net-pay estimates,
automatic overtime, and tenant-defined lifecycle states are outside the
catalog. A tenant with an unusual arrangement uses **Finance enters each
cycle**, preserving flexibility without creating an untestable payroll engine.

Each plan version may configure:

- external arrangement reference and responsible owner, using a provider
  identity/version when available or a governed tenant-issued record with
  issuer/actor, effective interval, classification asserted by the external
  authority, source/evidence reference, and immutable version;
- compensation cadence and expected handoff date, independently of Support
  Cycle cadence;
- Field Account funding currency, external compensation/payment currency, and
  prospective effective half-open interval;
- optional externally supplied funding-requirement components for gross
  compensation, employer costs, approved benefits, retirement, or
  housing/parsonage treatment;
- a simple `Keep in support balance` floor, defaulting to zero;
- whether a separately authorized organization top-up may be proposed;
- payroll versus contractor/accounts-payable destination;
- artifact-only versus certified provider-draft lane; and
- bounded missionary visibility: date and stage only, or date, stage, and
  planned amount.

Assessment, processor cost, reimbursement, ministry-expense funding, payroll
deductions, and taxes remain separate authorities. They may be explained in a
review breakdown but must not become hidden components inside the compensation
plan.

All plan changes are prospective immutable replacements. Activation rejects
overlapping Plan Version effective intervals for the same Tenant, Legal Entity,
worker/payee, Engagement Authority Reference lineage, Field Account, Field
Account funding currency, and external compensation/payment currency. For that
scope and one exact Compensation Funding Period, compare-and-swap plus a
uniqueness constraint permits one current, non-superseded Compensation Funding
Decision lineage. A change appends a successor; off-cycle work uses a distinct
exact period. No plan may resolve across tenants, Legal Entities, workers,
currency lanes, or external provider companies.

### Funding capacity and shortfall behavior

The proposal may use only:

`Finance-confirmed Field Account Balance`

minus exact, still-active prior funding coverage

minus the tenant's configured `Keep in support balance` floor.

It never uses provisional gift activity, donor commitments, live processor
balance, QBO bank balance, or an unclosed Support Cycle. It never crosses
currencies silently. If the external arrangement's currency differs, finance
must provide the exact Field Account funding amount/currency, external
compensation/payment amount/currency, conversion authority/reference, rate or
source amounts, rounding method, residual disposition, and provenance. Missing
or ambiguous evidence blocks; Asym does not invent an exchange rate.

A shortfall creates one Compensation Exception Case. It does not automatically
create a short check, backpay, debt, negative Field Account, wage reduction, or
future recovery schedule. Authorized staff may:

- hold the handoff;
- supply a separately identified organization top-up;
- choose a lower amount only when the external HR/payroll/AP authority permits
  and evidences it;
- record an externally established obligation or arrears reference without
  making Asym its source; or
- replace the prospective plan.

The decision records Field Account funding and organization funding as
different sources. An organization top-up does not alter the Field Account
unless a separately authorized Field Account transfer occurrence does so.

The Funding Decision and its purpose-typed Field Account Funding Coverage
reserve organization-controlled capacity; neither is a Field Account debit.
When qualified evidence later creates a Compensation Field Account Effect,
the exact overlapping active coverage amount atomically transitions to
`fulfilled`; effect-backed coverage never transitions to `released`. Capacity
therefore subtracts the reservation before recognition and the debit
afterward, never both. Only a non-overlapping remainder may transition to
`released`, and only for the exact amount proved never handed off or submitted
or after exact downstream cancellation/reversal proof establishes that it
cannot still execute. Partial results transition exact amounts;
outcome-unknown work stays reserved in an exception. Coverage never expires by
timer or becomes reusable without proof.
Each Legal Entity pins one
prospective **Compensation Effect Recognition Policy**:

- guided default: append the Compensation Field Account Effect from the exact
  finalized External Compensation Result; or
- bounded alternative: append it from the exact External Payment Occurrence.

A plan, proposal, approval, reservation, export, provider draft, accounting
entry, pay-run schedule, or payslip never qualifies. The payment-evidence
alternative is certifiable only when the External Payment Occurrence plus
Compensation Payment Coverage carries an exact source-qualified Field Account
organization-cost basis or links to a finalized result that does. Net cash
alone cannot establish gross compensation or employer cost; missing cost basis
creates an exception. The resulting effect records exact
decision/result/payment coverage and organization-cost roles plus one
component-level result/payment-to-decision application manifest. Using the
Decision's frozen component dispositions, the manifest conserves the selected
authority's qualified organization-cost basis exactly into Field
Account-applied, separately organization-funded, and unresolved variance. The
Field Account application cannot exceed unused active compensation coverage;
the organization-funded application cannot exceed the Decision authorization.
A mismatch stays reserved where its outcome is unknown and opens one
exception—never silent clamping, prorating, or funding-source reprioritization.
The effect must not add net pay, employee withholding, or deductions on top of
gross compensation; those are distributions of the gross amount, not
additional Field Account costs. Only a change, partial reversal, or reversal
in the policy-selected recognition authority may append signed component
deltas. A disagreement or failure on the other track remains separately
visible and does not automatically reverse it.

### Handoff and result contract

Every approved decision creates one content-addressed Compensation Handoff
Package with exact worker/payee identity, Legal Entity, external arrangement,
compensation period, funding sources, typed components, Field Account funding
amount/currency, external compensation/payment amount/currency, conversion
evidence when different, destination, plan version, Support Cycle coverage,
authorizer, timestamp, schema version, and digest.

Exactly one outbound lane owns delivery:

- **Artifact only** — stable CSV/PDF or provider-shaped import artifact. A
  download records `Exported`; it does not assert delivery to payroll.
- **Certified provider draft input** — perform only the exact provider-side
  draft/input operation that was certified, under one locally unique immutable
  operation identity and its provider-specific recovery contract.
  Byte-identical/same-key retry is allowed only where the exact operation proves
  safe idempotency or compare-and-swap; otherwise uncertainty becomes
  `outcome_unknown` for provider inspection or exact permitted staff
  confirmation. Provider acceptance records input only; it does not assert
  payroll submission.
- **Certified Phase 20 source handoff** — an accounting projection only when no
  payroll input is intended. The Funding Decision or reservation creates no Posting
  Intent, payable, expense, or Accounting Release by itself. Phase 20 remains
  dark until a separately certified source contract names the eligible
  evidence-qualified occurrence, accountant-confirmed semantics, and exact Phase 20 D17
  posting owner.

Provider readback or exact permitted provider/staff confirmation is separate
evidence and can accompany any outbound lane without becoming another
execution. An explicit staff action may record external submission, result, or
payment when no readback is available, but it requires exact date, amount,
currency, method category, external reference/evidence, actor, and reason. The
action is named **Record payment confirmation**, not `Mark paid`.

Internally preserve native provider states. The product may project them into
four separate authorities behind one plain current-stage summary:

| Track            | Truthful projected states                                                                                               |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Finance decision | Needs review; Approved for handoff; Held; Superseded                                                                    |
| Handoff          | Not prepared; Prepared; Exported; Provider input recorded; Submitted externally; Provider acknowledged; Needs attention |
| External result  | Not confirmed; Processing; Processed; Failed; Cancelled; Partially reversed; Reversed                                   |
| External payment | Not confirmed; Payment confirmed; Payment issue; Partially reversed; Reversed                                           |

Examples of non-equivalence:

- QBO payslip creation is a provider occurrence, not bank proof.
- Xero `POSTED` is processed/accounting truth, not paid.
- Gusto `Submitted`, `Pending`, and `Paid` remain distinct.
- A downloaded artifact is not `Sent`, and `Sent` is not `Paid`.

All corrections are append-only. Before handoff, finance may replace the
decision. After handoff, a new package must supersede or cancel the old package
where the destination supports it. After provider processing or payment,
provider reversal/correction evidence and the appropriate Phase 20 accounting
correction are linked without mutating the original package, close, or
occurrence.

One External Payment Occurrence may cover both compensation and an existing
Reimbursement Obligation when payroll combines them into one deposit. Its typed
coverage manifest uses the occurrence's one payment currency and conserves the
full payment through exact Compensation Payment Coverage, Reimbursement
Payment Coverage, and one signed, typed, explicitly resolved residual
disposition, including zero. A covered source component in another currency
carries immutable source/payment amounts and exact conversion evidence.
Unresolved residual or FX ambiguity fails closed. Asym must not invent
duplicate payments to make the domains look separate.

Payroll accounting has exactly one posting owner. If payroll/AP already posts
its journals to QBO or Xero, Asym records the provider/accounting references and
does not create a duplicate Phase 20 Accounting Release. A future
Asym-originated compensation accounting projection requires the Phase 20
Posting Ownership Cutover and a certified source contract first.

### Admin and finance UX

The UX should make the bounded flexibility feel like control rather than
configuration burden.

#### One short setup flow

1. **Who and where** — choose the worker/payee, Legal Entity, authoritative
   external arrangement, payroll or contractor/AP destination, Field Account
   funding currency, and external compensation/payment currency. Hide the
   second currency when both are equal. Unsupported or stale relationships stop
   here with a specific fix.
2. **How should funding be prepared?** — choose Finance enters each cycle,
   Fixed approved target, or Up to an approved maximum. Show a worked example
   using mock values.
3. **What should stay in the support balance?** — optional floor and
   organization-top-up permission. Advanced externally supplied components are
   collapsed by default.
4. **Review and schedule** — show the exact effective boundary, affected worker,
   next period, proposed visibility, destination capability, and artifact
   fallback. The primary action is **Schedule funding plan**.

The review pattern follows the
[GOV.UK check-answers guidance](https://design-system.service.gov.uk/patterns/check-answers/):
show only relevant sections, use specific action labels, preserve entered
answers when staff change a section, and return directly to review.

#### One quiet cycle workspace

Default to **Needs attention**, not a sprawling dashboard. Secondary views are
`Ready for review`, `Approved`, `With payroll/AP`, and `No action needed`.
`No action needed` is a disposable filter, not a durable financial state; its
rows retain independent evidence tracks. Each row shows:

- worker/payee and Legal Entity;
- Finance-confirmed balance and as-of Support Cycle;
- planned target or `Finance to enter`;
- Field Account funding, organization funding, and projected remaining balance;
- compensation period and expected handoff date;
- destination and one plain current-stage summary; and
- one clear next action.

The detail drawer shows the exact calculation bridge, source coverage,
arrangement/plan version, prior-cycle comparison, component breakdown,
shortfall reason, provider capability, and audit timeline. Clean homogeneous
rows may be bulk-authorized after one review summary. Mixed Field Account
funding currencies, external compensation/payment currencies, Legal Entities,
destinations, shortfalls, exceptions, or authority versions cannot be silently
bulked together.

Warnings are proportional:

- inline guidance for harmless incompleteness;
- blocking error with a direct fix for tenant/entity/worker/currency/destination
  mismatch or double coverage;
- explicit confirmation for replacing an approved decision, exporting a
  package, recording external submission, or recording payment evidence; and
- exception-only notifications for failed, stale, ambiguous, drifted, or
  reversed work.

### Missionary UX

The missionary home remains a mini-CRM, not a payroll console. If no active
plan exists or the tenant has disabled compensation visibility, no empty
compensation module appears.

When enabled, one calm **Next payroll** or **Next compensation** card shows:

- the expected date and a plain-language stage first;
- a planned amount only when it comes from the authorized plan/decision and
  tenant visibility permits it;
- `Support balance as of [finance-close date]` separately from planned
  compensation;
- one **View details** action; and
- a tenant-configured finance/payroll contact plus an external payroll-portal
  link when available.

The details view uses one simple timeline:

- `Planned` — finance has not completed the handoff;
- `With payroll` — backed by explicit submission/provider evidence;
- `Processing` — backed by provider evidence;
- `Payment confirmed` — backed by an External Payment Occurrence; or
- `Needs attention` — a privacy-safe explanation and contact path.

It never says `Available pay`, `Withdraw`, `Guaranteed`, `Payroll complete`,
`Paid` after export, `Your money`, or `Backpay owed` without the exact external
authority. It does not show another worker's policy, negotiated terms, provider
error payload, employer cost detail, tax elections, garnishments, bank details,
or benefit-health information. Paystubs remain in the external payroll portal
unless a separately approved future capability establishes a safe need.

The persistent explanation is:

> This is your organization's support-funding plan for the next compensation
> cycle. Your organization and payroll provider determine final pay, taxes,
> deductions, and delivery timing.

### Accessibility and usability requirements

The setup, review, cycle workspace, and missionary projection must meet WCAG
2.2 AA. In particular:

- financial decisions get a review/confirm/correct step, consistent with
  [WCAG 2.2 error prevention](https://www.w3.org/TR/WCAG22/#error-prevention-legal-financial-data);
- errors identify the exact field and provide a text fix, consistent with
  [WCAG error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification);
- dynamic save, export, provider, and payment results are programmatically
  announced as status messages;
- status is never communicated by color alone;
- tables have a keyboard-operable list/card alternative at narrow widths;
- focus returns to the triggering row after drawers or dialogs close;
- bulk actions report selected, succeeded, failed, and skipped counts and retain
  the failed selection for recovery;
- dates include the tenant finance timezone and unambiguous period bounds; and
- money always includes currency, uses locale-aware display, and retains exact
  minor-unit precision.

### Ruthless adversarial review

| Category                              | Concern? | What could go wrong and why it matters                                                                                                                                                                                                                                                                                      | Severity    | Likelihood  | Permanent prevention                                                                                                                                                                                                                                                           |
| ------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Brittleness**                       | Yes      | A design that assumes monthly payroll, one currency, employees only, one Field Account, or universal QBO/Xero payroll APIs will fail for biweekly tenants, contractors, couples, regional payroll products, and provider permission changes.                                                                                | High        | High        | Scope every plan and handoff to exact tenant, Legal Entity, worker/payee, currency, period, arrangement, and destination capability. Keep artifact-always delivery and three bounded funding methods.                                                                          |
| **Technical debt**                    | Yes      | Copying Phase 20 OAuth, delivery, idempotency, evidence, and drift machinery into Phase 21 would create two incompatible integration stacks. A free-form compensation rules engine would become payroll code nobody can safely maintain.                                                                                    | High        | Medium-high | Reuse Phase 20 integration primitives. Keep compensation-specific records lean, versioned, and typed. Treat proposals as disposable read models and reject arbitrary formulas/custom states.                                                                                   |
| **Edge cases**                        | Yes      | Employee versus contractor, ministerial treatment, shared household support, mid-period plan changes, support-cycle/pay-period mismatch, partial payment, failed deposit, reversal, departure, stale arrangement, organization top-up, late support, and cross-currency funding can all produce false balances or promises. | High        | High        | External authority owns classification and obligation; individual payee identity stays separate from household recognition; plans change prospectively; native occurrences append; cross-currency needs explicit external evidence; exceptions stop ambiguous work.            |
| **Footguns**                          | Yes      | Staff could mistake a fundraising goal for salary, reduce wages automatically, double-use Field Account capacity, call an export paid, map to the wrong worker, expose private pay data, or retroactively edit a plan.                                                                                                      | Critical    | Medium-high | No donation-triggered pay or generic `Mark paid`; unique coverage; specific consequential-action confirmation; immutable versions/packages; exact identity preflight; least-privilege views; append-only correction.                                                           |
| **Tenant safety**                     | Yes      | A provider company, Legal Entity, worker mapping, package, or result could cross tenants or entities, producing a serious payroll/privacy incident.                                                                                                                                                                         | Critical    | Medium      | Enforce tenant and Legal Entity predicates in database constraints, authorization, job payloads, storage paths, cache keys, exports, and provider callbacks. Quarantine any identity mismatch before a write or display.                                                       |
| **Over-engineering**                  | Yes      | A wage engine, benefit engine, tax calculator, provider-universal status machine, configurable formula language, or custom workflow builder would duplicate payroll and create legal risk.                                                                                                                                  | High        | High        | Ship the three-method funding catalog, one setup flow, one cycle workspace, one immutable handoff contract, and existing Phase 20 integration primitives. Keep payroll execution and calculations external.                                                                    |
| **UX/UI and user friction**           | Yes      | Showing every authority and status on the home screen would overwhelm missionaries; hiding basis/freshness would make finance distrust the system; vague buttons would cause consequential mistakes.                                                                                                                        | High        | High        | Progressive disclosure: calm missionary card, exception-first finance queue, exact as-of dates and calculation bridge, one primary action per state, specific verbs, worked previews, and no empty module when unused.                                                         |
| **Hidden coupling**                   | Yes      | If Support Cycle close automatically creates payroll, plan cadence equals payroll cadence, accounting status marks payment, or D3 assessment logic is embedded in compensation, later changes will corrupt multiple domains.                                                                                                | High        | Medium-high | Use explicit IDs and immutable coverage between independently authoritative records. Support close only makes facts eligible for a funding decision; downstream lanes advance only from their own evidence.                                                                    |
| **Failure modes**                     | Yes      | Provider outage, token revocation, partial bulk success, uncertain timeout, duplicate webhook, stale draft, rejected import, failed deposit, or reversed payment can leave staff unsure whether retrying will duplicate work.                                                                                               | High        | High        | Artifact fallback, operation-granular idempotency keys, provider lookup/readback before retry, native event deduplication, ambiguity-to-exception, partial-result manifests, and append-only recovery.                                                                         |
| **Data integrity risks**              | Yes      | Mutable decisions, overlapping plans, reused support effects, rounding drift, currency mixing, stale provider IDs, or silent provider edits can produce incorrect funding and reports.                                                                                                                                      | Critical    | Medium-high | Prospective non-overlapping plan constraints; content-addressed packages; minor-unit money; per-currency coverage; exact source versions; compare provider readback to the approved package; never silently overwrite drift.                                                   |
| **Security and privacy risks**        | Yes      | Payroll connections can expose SSNs, bank accounts, tax elections, garnishments, health-benefit information, paystubs, and negotiated compensation. Overbroad logs or missionary views would be damaging.                                                                                                                   | Critical    | Medium      | Separate payroll from accounting grants; least scopes; encrypt grants separately; minimize stored provider payloads; do not ingest highly sensitive fields by default; purpose-based RBAC; redacted logs; bounded retention and access audit.                                  |
| **Scalability and performance risks** | Yes      | Recomputing all workers and full source history for every cycle, synchronous provider calls, or loading whole audit histories into tables will fail during monthly close.                                                                                                                                                   | Medium-high | Medium      | Incremental projections from immutable coverage, asynchronous bounded jobs, cursor pagination, cached summaries keyed by version, concurrency limits per tenant/provider, and virtualized/detail-on-demand history.                                                            |
| **Operational burden**                | Yes      | Per-worker bespoke formulas, repeated provider setup, manual mapping every cycle, and noisy clean-row approvals would make finance dependent on tribal knowledge.                                                                                                                                                           | High        | High        | Guided defaults, reusable prospective plans, certified destination setup once, carry-forward mappings with freshness checks, bulk review for homogeneous clean rows, exception-only follow-up, and artifact fallback.                                                          |
| **Observability gaps**                | Yes      | Without source, package, operation, provider-company, and result correlation, support cannot tell whether a discrepancy came from plan selection, coverage, export, provider edit, payment, or accounting.                                                                                                                  | High        | Medium-high | Correlation IDs and structured metrics at each boundary; per-tenant/provider health; counts and age for exceptions; package/readback diffs; privacy-safe audit timeline; alerts on stuck or ambiguous states.                                                                  |
| **Dependency and integration risks**  | Yes      | Intuit partner restrictions, Xero regional differences, provider schema/status changes, revoked scopes, rate limits, and absent sandboxes can invalidate a promised workflow.                                                                                                                                               | High        | High        | Capability certification per exact operation; adapter contract tests and production-shaped canaries; versioned schemas; provider changelog monitoring; circuit breakers/backoff; artifact-always continuity; never infer payroll access from accounting connection.            |
| **Migration and upgrade risks**       | Yes      | Storing provider-shaped payloads as the domain model or mutable plan fields will make provider changes and future migrations destructive.                                                                                                                                                                                   | High        | Medium      | Canonical Asym package plus versioned provider adapters; preserve native identifiers/status evidence separately; schema-version every package; export open formats; prospective migration and dual-read verification without dual-write.                                       |
| **Other development hazards**         | Yes      | Concurrent approvals, stale-screen actions, duplicate exports, callback races, partial bulk authorization, wrong environment, missing rollback, or unclear HR/finance ownership could create duplicate or unauthorized funding.                                                                                             | Critical    | Medium-high | Optimistic concurrency/CAS, database uniqueness, outbox/inbox, idempotent operations, environment/company pinning, preflight and post-write readback, bounded compensation actions, explicit role ownership, destructive-path tests, and rollback by append-only supersession. |

### Ruthless synthesis and implementation order

The best path is not to make compensation configurable everywhere. It is to
make the **tenant's external authority and bounded funding choice explicit once**,
then make each cycle fast and exception-led.

1. **Lock the authority boundary first.** Compensation arrangement,
   classification, wage entitlement, tax, deductions, net pay, payroll
   execution, and payment remain external. Field Account truth remains D1.
2. **Implement the lean plan contract.** Three active funding methods,
   distinct Plan Version effective intervals and exact Compensation Funding
   Periods, same-scope/period Decision CAS, prospective versions, exact scope,
   optional simple balance floor, bounded visibility, and no formulas.
3. **Implement immutable cycle decisions and coverage.** Use only
   Finance-confirmed closed support, prevent reuse, keep Field Account and
   organization-top-up sources separate, atomically fulfill effect-backed
   reservations without double subtraction, release only proof-qualified
   remainders, and route shortfalls to one case.
4. **Implement artifact-always handoff.** Exact versioned package, stable bytes,
   digest, explicit export evidence, and provider-shaped artifacts.
5. **Add provider automation only behind exact certification.** Draft-input
   only, operation-granular idempotency, no autonomous payroll submission,
   provider readback, drift comparison, and immediate quarantine on identity
   mismatch.
6. **Keep result, Field Account effect, accounting, and payment truth
   separate.** Pin one bounded recognition policy, preserve native status,
   certify payment-based recognition only with exact organization-cost basis,
   conserve the basis through one component-level application manifest,
   conserve mixed-payment coverage in one payment currency with a signed typed
   resolved residual and exact source FX evidence, enforce one QBO/Xero posting
   owner, accept bounded staff evidence when necessary, and append
   reversal/correction facts only from the selected authority.
7. **Ship one exception-first finance workspace and one quiet missionary card.**
   Prove responsive keyboard use, screen-reader status announcements, error
   recovery, homogeneous bulk authorization, and truthful copy.
8. **Gate activation with production-shaped tests.** Cover all plan methods,
   monthly/biweekly mismatches, employees/contractors, entity isolation,
   overlap rejection, double-coverage races, currency rejection, shortfalls,
   reservation-to-effect transitions, partial coverage release,
   concurrent/unknown handoff quarantine, no timer expiry,
   payment-without-cost-basis quarantine, non-selected-track disagreement,
   artifact repeatability, ambiguous provider timeouts, partial bulk results,
   drift, failed/reversed payments, RBAC, retention, and accessibility.

### Ratified D4 wording

**C-prime-amended-and-hardened (C-prime-R) — tenant-owned,
contract-referenced compensation funding over Finance-confirmed Support Cycle
coverage, with distinct exact Compensation Funding Periods, three bounded
prospective funding methods, a simple optional support-balance floor,
separately identified organization funding, and source-pinned Engagement
Authority and Compensation Funding Plan versions; one immutable finance
decision and non-reusable Field Account Funding Coverage that reserves but
does not debit or pay; one artifact-always Compensation Handoff Package with
at most one capability-certified payroll, contractor-AP, or accounting
destination lane; draft-input-only provider automation where explicitly
certified; separately authoritative finalized compensation results,
evidence-qualified append-only Field Account effects under one pinned
recognition policy, external payment and mixed-payment coverage, single-owner
QBO/Xero accounting, failures, partial reversals, and reversals;
operation-granular idempotency and drift detection;
underfunding-to-exception rather than automatic wage reduction or backpay; and
one exception-first finance workspace plus a quiet tenant-configurable
missionary projection—without Asym classifying workers, calculating payroll
or taxes, submitting payroll, moving compensation money, exposing unnecessary
payroll PII, or treating an accounting connection, export, posted pay run, or
payslip as proof of payment.**

**D7 precision:** D4's “at most one” lane is now exactly one executable lane:
staff artifact fulfillment, one exact capability-certified external
payroll/contractor-AP provider-draft input, or one separately certified Phase
20 source handoff. An accounting-native QBO/Xero object is never a Phase 21
Compensation Handoff Adapter.

## D5 ratified direction: support reallocation and worker exit disposition

**Status:** C-prime-amended-and-hardened (C-prime-R) ratified as Phase 21 D5
on 2026-07-30.

### Why this is the next decision

The pre-D5 roadmap reserved worker-to-project, worker-to-worker, and
worker-to-organization outcomes plus a departing-worker disposition workflow.
The four earlier decisions establish the facts that can make an apparently
simple reallocation unsafe: a Finance-confirmed balance may already support active
compensation coverage, a Reimbursement Obligation, a return/refund exposure,
an assessment correction, or another reserved operation. The remaining
question is therefore not whether a missionary can press a generic **Transfer**
button. It is:

> How much request freedom should a tenant give missionaries, who may authorize
> the resulting reallocation, and how should the organization close or
> succeed a departing worker-associated Support Assignment Field Account
> without treating organization funds as worker property or erasing purpose
> obligations?

### Current evidence

- Reliant's current MTD transfer policy says ministry donations belong to and
  remain under Reliant's control. A worker may **request** an internal transfer,
  but bounded destinations, balance floors, frequency/amount caps, and finance
  approval apply. Its exit process waits for final payroll and ministry
  expenses and then applies policy-specific disposition. This is strong
  evidence for request freedom without worker execution authority, and for
  resolving obligations before exit closure. See
  [Reliant MTD Fund Transfer](https://solomon.reliant.org/display/employman/MTD%2BFund%2BTransfer)
  and its
  [current export](https://solomon.reliant.org/download/export/pdfexport-20260428-280426-1822-1753/employman-MTDFundTransfer-280426-1822-1754.pdf?contentType=application%2Fpdf).
- The public 2022 Assemblies of God U.S. Missions manual gives the organization
  authority over the final check, moves remaining funds according to
  organizational policy, accounts for final expenses, and coordinates an
  internal transfer at the close of an accounting cycle. It demonstrates that
  departure is a governed close, not an immediate worker-directed withdrawal,
  while its exact rules remain organization-specific. See
  [AGUSM Missionary Manual, pp. 46-47](https://usmissions.ag.org/-/media/USMissions/PDFs/AGUSM-Missionary-Manual-06152022.pdf).
- ABWE's public 2017 manual makes resignation/termination financial
  arrangements a case-by-case organization decision subject to circumstances
  and funds available. It is historical operating evidence, not a claim about
  ABWE's current internal policy, and supports a bounded decision case rather
  than one universal exit formula. See
  [ABWE Missionary Policy Manual, p. 19](https://docs.abwe.org/goteam/ABWEPolicyManual.pdf).
- SIM states that gifts remain under SIM's complete control and administration
  and may be redirected when a need is met or a worker's status changes,
  preferably to a similar project or worker. See
  [How SIM uses donations](https://www.simusa.org/give/how-does-sim-use-my-donation/).
- ECFA's deputized-worker guidance says the support-account balance does not
  represent the worker's funds and the organization must retain discretion and
  control. ECFA also warns that accepted donor restrictions remain meaningful
  obligations. Therefore Phase 21 may not equate organization control with
  permission to erase source-owned donor-purpose facts. See the
  [sample Deputized Worker Policy](https://www.ecfa.org/PDF/Sample_Deputized_Worker_policy.pdf),
  [ECFA Standard 4 commentary](https://www.ecfa.org/content/comment4), and
  [ECFA donor-restriction guidance](https://www.ecfa.org/Content/Ask-ECFA-Donor-Restriction).
- U.S. and Canadian primary guidance makes the external-successor boundary
  materially different from an internal Field Account reallocation. IRS
  Publication 526 distinguishes a contribution to a qualified organization
  from one to a specific individual, while IRS TEOS is the current official
  source for checking U.S. exempt status. CRA CG-032 requires a Canadian
  registered charity making a grant to a non-qualified donee to further its
  own charitable purpose, apply proportionate due diligence, and maintain
  sufficient documentation. Phase 21 must therefore create an
  evidence-gated external handoff, not infer that a worker-selected name or
  bank destination is a valid charitable successor. See
  [IRS Publication 526 (2025)](https://www.irs.gov/publications/p526),
  [IRS Tax Exempt Organization Search](https://www.irs.gov/charities-non-profits/search-for-tax-exempt-organizations),
  and
  [CRA CG-032](https://www.canada.ca/en/revenue-agency/services/charities-giving/charities/policies-guidance/charities-making-grants-non-qualified-donees.html).
- Sanctions, grant, and recipient checks are jurisdiction- and risk-sensitive,
  not one universal checkbox. External succession must preserve the exact
  recipient identity, evidence date, jurisdiction, approved purpose,
  organization decision, and payment result, and route unresolved legal or
  sanctions questions to the tenant's authorized specialist. Asym must not
  claim that a successful database lookup is legal approval. See
  [OFAC FAQ 1106](https://ofac.treasury.gov/faqs/1106) and ECFA Standard 4's
  proportional grant-control examples.
- Modern Treasury's ledger guidance uses balance/version locks to reject a
  concurrent write against a stale balance. The implementation need not adopt
  its product, but it should preserve that invariant: approval must compare and
  atomically write against the exact Field Account version reviewed by
  finance, and every multi-entry result must be balanced, immutable,
  idempotent, and all-or-nothing. See
  [Lock on Account Balance or Version](https://docs.moderntreasury.com/ledgers/docs/lock-on-account-balance-or-version)
  and
  [Ledgers Guarantees](https://docs.moderntreasury.com/ledgers/docs/ledgers-guarantees).
- Modern expense products provide a useful workflow lesson without deciding
  the charity policy: Expensify defaults to one approver and adds a second
  level only for a bounded need such as an amount threshold; Ramp recommends
  starting simple and surfacing the relevant balance at approval time. See
  [Expensify approval workflows](https://help.expensify.com/articles/expensify-classic/reports/Create-a-report-approval-workflow)
  and
  [Ramp budget-based approvals](https://support.ramp.com/budget-based-approval-workflows/).
- WCAG 2.2 requires a review/correct or reversible path for consequential
  financial submissions. The product therefore needs an exact review step,
  stale-preview rejection, and append-only correction—not a vague confirmation
  dialog after a stale balance read. See
  [WCAG 2.2 error prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data).

These sources describe different organization policies. They do **not**
justify copying any one ministry's dollar caps, reserve formula, exit period,
or approval hierarchy into Asym defaults. Those are tenant policies. The
portable product invariant is organization authorization, purpose
compatibility, exact source coverage, exact unreserved capacity, balanced
entries, and preserved evidence. These sources are product and policy evidence,
not a substitute for a tenant's jurisdiction-specific legal, tax, employment,
grant, sanctions, or donor-restriction advice.

### Options

#### Option A — Finance-only reallocation and exit handling

Only finance staff can create, approve, and complete a transfer or exit
disposition. Missionaries communicate preferences outside Asym.

**Strengths:** smallest authorization surface, simplest tenant setup, and low
risk of workers interpreting the balance as theirs to move.

**Weaknesses:** email/forms remain the de facto workflow; staff must re-key
requests; missionaries cannot see status; evidence and decisions fragment; and
the product does not meet the requested flexible missionary experience.

#### Option B — Fully tenant-configurable transfer workflow

Tenants define arbitrary purposes, formulas, destinations, stages, approvers,
and automatic actions. Missionaries can initiate any configured movement.

**Strengths:** maximum apparent flexibility.

**Weaknesses:** creates a financial workflow/formula engine; makes tenant
isolation, legal-purpose compatibility, concurrency, testing, support, and
future migrations brittle; and makes it easy to encode worker ownership or
unsafe automatic disposition. It is materially more control than missions
organizations need.

#### Option C-prime — One bounded, organization-authorized Support Reallocation Case

The product uses one recognizable case doorway, but it does not collapse every
authority into one mutable status. The case coordinates:

1. an optional, nonbinding **Support Reallocation Request** or exit preference;
2. a pinned, prospective **Support Reallocation Policy Version**;
3. an exact **Support Reallocation Coverage Manifest**;
4. one immutable organization **Support Reallocation Decision**;
5. either an atomic internal reallocation transaction, one or more external
   **Charitable Succession Handoffs**, or a truthful mixture of the two;
6. independently authoritative accounting, payment, communication, lifecycle,
   and close outcomes; and
7. append-only recovery for late or adverse facts.

The case has two bounded purposes: `active reallocation` and
`exit disposition`. They share the same authorization, coverage, conservation,
and audit primitives. The ordinary internal path remains a short single-page
flow; the exit path progressively reveals the obligation inventory and
disposition plan. A shared doorway does not force ordinary work through an
exit checklist.

#### Tenant control without a workflow engine

Every tenant starts with a safe, usable staff-only default:

- internal same-Tenant, same-Legal-Entity, same-currency reallocations;
- one authorized finance approver;
- no product-imposed amount cap or retained-balance floor beyond exact
  nonnegative unreserved capacity;
- missionary requests off until the tenant enables them; and
- external charitable succession off until its evidence and specialist route
  are configured and proved.

An authorized tenant may activate one prospective policy version that controls
only:

- missionary request mode: `Off`, `Preference only`, or
  `Destination and amount request`;
- eligible internal semantic destination roles, each resolving to a
  Phase-21-owned typed Field Account: worker-associated Support Assignment
  Field Account, project/purpose Support Assignment Field Account, or
  organization-support-pool Support Assignment Field Account;
- whether a case may split across multiple eligible destinations;
- a simple retained-balance floor, amount cap, and request-frequency limit;
- one normal finance approver role and one additional approval for selected
  materiality, exit, external-successor, or policy-exception conditions;
- missionary and destination-recipient visibility, notification preference,
  safe explanation copy, and finance contact path; and
- an exit default **suggestion** or `Finance chooses each case`.

Requester/beneficiary self-approval, other personal-interest conflicts,
missing source authority, and cross-scope movement are non-configurable safety
fences. A finance staff member who merely created the case may still
**Approve and record** when the tenant grants both roles and the actor has no
personal interest. The tenant chooses the responsible roles and thresholds,
but cannot turn a worker request into execution authority. There is no
tenant-authored formula, code, arbitrary status, open destination type, or
approval graph.

Policy versions are prospective and scoped to the Tenant and Legal Entity;
money limits are currency-specific. Active-reallocation limits and exit
disposition behavior are explicit so an ordinary retained-balance floor cannot
silently strand an exit residual. Submission pins the policy version and
eligible-destination snapshot used for review. A later configuration change
never silently reroutes an in-flight case; a destination that becomes inactive
or ineligible returns the case to **Needs review**.

#### Exact purpose and capacity

A worker request never selects donor gifts or manufactures eligibility. The
system resolves exact source-owned accepted gift terms, Designation,
restriction-or-preference classification, Field Account entries, and purpose
coverage. The current Phase 13 designation-line snapshot does not yet freeze
all of that historical purpose authority. D5 therefore requires Phase 13 to
freeze at acceptance one immutable posted-line purpose-authority projection:
the exact Designation identity, restriction class and purpose/excess-use policy
version, source-posting coverage, and one closed source-provenance variant. If
governed content was presented or captured, that variant freezes its exact
source-owned publication kind, reference, and digest. Otherwise it records
typed `not_applicable` or `not_captured` plus the exact source-purpose evidence
reference and digest, such as a Designation, remittance, memo, or
acceptance-authority record. Phase 22 owns a public giving-page publication
only when that page was the accepted source, over Phase 23's CMS substrate;
Phase 17 owns a message publication only when a governed communication was the
accepted source; and Phase 7 owns receipt/deductibility facts. Offline,
imported, remittance, and other producers supply their actual owner-labelled
evidence to the Phase 13 resolver and cannot choose the legal classification or
invent a publication. Phase 21 consumes the exact frozen references and never
edits them. Until this source contract exists for a line, purpose compatibility
is unproved and that affected reallocation blocks without blocking unrelated
lines.

The immutable Coverage Manifest maps each proposed allocation line to that
compatible source coverage. Mixed compatible and incompatible coverage is
split exactly; ambiguous or legally disputed coverage is blocked for
authorized specialist review. Organization discretion does not erase an
accepted restriction or solicitation promise. Phase 13 may append a
source-authorized purpose-authority supersession only after the exact
jurisdiction-permitted donor, legal, court, or regulator authority exists; it
preserves the original terms, and D5 merely consumes the successor. Such a
change is not an ordinary data correction. Donor refund is not an ordinary
exit-disposition option.

Within each compatible purpose-and-currency bucket, the product selects exact
unconsumed source coverage in one stable order: immutable Support Cycle
boundary, Phase 13 posting sequence, then coverage identifier. A retry
therefore resolves the same lots. Staff and workers never cherry-pick donors;
an authorized specialist may supply an explicit source selection only to
resolve a blocked exception, with the authority and reason frozen.

The decision pins one disposable **Reallocation Eligibility Projection**:

`Finance-confirmed Field Account Balance`

minus all qualified negative open-cycle Field Account effects that have
appended since, but are not yet admitted by, that confirmed close—including
compensation, reimbursement, assessment, reallocation, refund, reversal, and
correction debits

minus exact still-active, non-reusable Field Account Funding Coverage and
Support Reallocation Coverage not already replaced by a posted debit

minus the exact prospective tenant-policy retained-balance floor

equals **Eligible to reallocate as of [date]**.

Positive provisional support never increases this projection. A
Reimbursement Obligation, pending expense, estimated refund exposure, legal
matter, or incident does not silently become a second mutable balance and is
never subtracted alongside its exact funding coverage. An independently live
authority appears separately with its source owner and required disposition.
It blocks only when its source authority, legal authority, or the prospective
tenant policy says it blocks; otherwise the Decision or exit manifest must
name its continuing owner and funding treatment. If its source owner is
authorized to reserve a known amount, it must create exact non-reusable
coverage; if a fact required for capacity is unknown, the case blocks rather
than inventing a hold.
After a qualified debit posts, capacity subtracts the debit instead of the
fulfilled coverage, never both. The missionary does not see finance-only
authority detail or a wallet-like transferable balance.

The final organization authorization performs a compare-and-swap against the
reviewed source and destination accounts, policy, lifecycle, purpose,
destination, and coverage versions. For an internal case it atomically
publishes the immutable Decision, fulfilled Support Reallocation Coverage, and
balanced transaction; there is no ambiguous approved-but-unrecorded window.
For an external line it atomically publishes the Decision, active
non-reusable coverage, and Charitable Succession Handoff. A stale version,
insufficient capacity, same-source-and-destination line, inactive destination,
purpose conflict, unresolved authority, or personally interested approver
fails closed and returns the case to review with the exact safe reason.

Support Reallocation Coverage freezes exact source-purpose and amount coverage.
An internal pair fulfills it in the same commit. An external line stays active
through unknown or partial outcomes and fulfills only the exact amount backed
by a qualified disposition effect. A remainder may release only after exact
proof that the downstream work never executed or was authoritatively
cancelled; it never expires by timer or becomes reusable from an ambiguous
failure.

#### Internal and external outcomes

An internal result may have one source and one or more eligible destinations.
It is one balanced, purpose-typed, idempotent transaction: the source debit and
all destination credits either append together or none append. Both sides use
Phase-21-owned typed Field Accounts with the same Tenant, Legal Entity, Field
Account funding currency, Support Cycle close coverage, and transaction
identity. A Phase 13 Designation, project record, or GL account may be linked
for meaning but is never written as the destination. If no typed Phase 21
destination exists, the operation needs a separately owned handoff and is not
an internal pair. The two sides can never advance different Finance-confirmed
balances in different closes. The pair first appears as open-cycle activity
and changes Finance-confirmed balances only through D1's next governed close;
it never rewrites a prior close. Source and destination accounts are locked in
deterministic identifier order so reciprocal reallocations cannot deadlock.

A cross-Tenant, cross-Legal-Entity, cross-currency, personal, or external
destination is never an internal reallocation. A personal destination always
blocks. Another tenant identifier alone grants no authority. A same-entity FX
movement and an affiliate/inter-entity movement are separately owned treasury,
accounting, grant, or inter-entity operations outside D5; the case must not
mislabel either one as charitable succession. Only an independently verified
charitable recipient may enter this optional specialist lane. If the tenant
has activated and proved that lane, an approved external line creates a
**Charitable Succession Handoff** with exact:

- recipient legal name, stable registration or tax identity, jurisdiction,
  current status evidence, and evidence date;
- approved charitable purpose and source-purpose coverage;
- tenant-defined proportional due-diligence, legal, grant, and sanctions
  evidence;
- payee and payment-destination identity kept distinct from charity identity;
- exact source disposition amount/currency and intended external payment
  amount/currency; when they differ, exact external conversion authority,
  source/payment amounts, rate or source calculation, rounding, residual
  disposition, and provenance;
- authorizers, agreement or evidence references, and digest; and
- responsible external payment/accounting route.

Asym does not move the money or claim the recipient was paid. The amount stays
covered while the outcome is pending or unknown. One immutable,
source-labelled **Charitable Succession Result** matches the organization
Decision, current required recipient/purpose/grant authority, Charitable
Succession Handoff, and authoritative external payment occurrence by payee,
source and payment amounts/currencies, payment date, reference, and evidence
identity. Only that complete match qualifies the exact source-linked Field
Account disposition effect. Payment evidence by itself is insufficient.
Partial, failed, returned, reversed, or ambiguous outcomes append exact result
and coverage changes; they do not fabricate an internal target credit or
silently release capacity.

The qualified external disposition effect is itself one canonical balanced
Field Account occurrence. Its source debit and exact typed
organization-control/disposition counter-entry append atomically under one
identity and enter the same governed Support Cycle Close. The counter-entry is
not a fabricated recipient Field Account, payment execution, or GL truth. A
one-sided external debit cannot qualify.

Neither an internal pair nor an external result writes QBO or Xero directly.
Only an internal pair whose complete two-sided occurrence has been admitted by
one immutable Support Cycle Close, or an exact Charitable Succession Result
whose complete balanced disposition occurrence has been admitted by its
governed close, may emit a separately certified **Support Reallocation
Accounting Occurrence**. That occurrence is only the eligible future source
root: the current Phase 20 generation keeps the family unsupported and dark
until a separately approved change certifies its source schema, accountant
semantics, Posting Profile recipe, and Phase 20 D17 Posting Ownership Cutover. A
request, review, Decision, reservation, open-cycle pair, handoff, payment
record alone, unknown result, or uncertified close-covered occurrence remains
accounting-dark, with no generic journal or artifact fallback.

#### Exit disposition

One exact **Worker Lifecycle Authority Reference** supplies the departure
identity, status, effective boundary, issuer, source/evidence reference, and
immutable version. It references an external HR/mobilization authority when
available or a governed tenant-issued lifecycle record otherwise. It is
distinct from D4's compensation-specific Engagement Authority Reference and is
never inferred from `missionaries.is_active`, dashboard access, fundraising
activity, or a finance note.

Finance may open a draft coordination case manually, but that draft changes no
request, Designation, recurring, page, plan, or account behavior. Only a pinned
authoritative lifecycle transition can activate exit handling and close new
missionary reallocation requests for the affected account. It does not cancel
independently live compensation, final-pay, Reimbursement Obligation, expense,
payment, incident, legal-hold, or communication work.

The exit surface:

1. pins the lifecycle and proposed close boundary;
2. inventories every purpose-and-currency balance layer and independently live
   obligation, exact coverage, unclosed adverse effect, and blocking authority;
3. records the worker's nonbinding preference only when tenant policy permits;
4. freezes one immutable **Exit Disposition Manifest** that conserves the exact
   reviewed residual across one or more typed internal, external, continuing-
   authority, or organization-retained lines;
5. applies each internal line through its own atomic source/destination pair
   and each external line through exact non-reusable coverage, one Charitable
   Succession Handoff, and independently proved result;
6. proves prospective retirement, completion, or source-owned succession for
   D3 Assessment Profile Assignments and unfinished determinations, D4
   Compensation Funding Plans/periods/decisions/coverage, and Phase 13
   Designations; proves any Phase 16 recurring-term stop or successor through
   Phase 16's required donor/tenant authorization; and has Phase 22 retire or
   redirect presentation only after the financial destination authority has
   changed, so a page never chooses or silently changes a Designation;
7. proves that every amount is either reallocated, covered by a named live
   authority, retained in an explicit organization-owned successor, or
   resolved by an append-only correction; and
8. closes the Field Account to ordinary activity only after there is no
   unexplained residual, future discretionary writer, or unresolved ownership
   of next action.

The manifest is the conserving plan, not one false atomic outcome. Internal
pairs may complete while an external line remains pending; the case and its
exact external coverage remain open until that line has a proved terminal
outcome or an authorized successor. Pre-boundary late facts remain linked to
the original account. Genuinely post-boundary discretionary intake is rejected
by an inactive Phase 13 destination unless Phase 13 has an exact authorized
successor; Phase 16 changes future recurring terms only through its own
authorization. Phase 22 may retire or redirect the page URL but never redirects
money, and Phase 21 never silently reroutes intake.

An internal manifest line becomes terminal only after both sides of its pair
are admitted by the same immutable Support Cycle Close. An external line
becomes terminal only after exact outcome evidence qualifies its source-linked
Field Account disposition effect and that effect is admitted by its governed
close, or after an authorized continuing successor explicitly owns the still-
covered line. `Recorded`, `Payment confirmed by [evidence source] on [date]`,
and `Included through [date]` therefore remain different facts.

Closure is not deletion. The account, statements, cases, decisions, entries,
coverage, and evidence remain read-only and searchable under the tenant's
retention and legal-hold rules. A late gift, refund, reversal, expense,
compensation result, or payment result opens a cause-linked recovery case and
appends the required correction or compensating transaction. It never edits
the old decision or turns a former worker's request into current authority. A
source-mandated adverse correction remains attached to the original Field
Account even if that exposes a deficit after reallocation. It opens a visible
cause-owned exception; it never silently claws back the destination or rejects
the source truth. Any destination recovery needs a new organization-authorized
decision against current capacity and coverage.

Donor or destination communication is separately governed. Donor consent,
regulator or attorney-general notice, grantee agreement/acceptance, or another
jurisdiction-required communication is authorization evidence, not an
informational notification; commitment blocks until the owning authority
proves the prerequisite satisfied. After a valid occurrence, the case may emit
a typed informational communication obligation when source terms or tenant
policy require it, while Phase 6/17 owns message execution and outcome. Failure
of that post-occurrence informational message never rolls back the financial
occurrence or pretends the underlying evidence disappeared.

**Recommendation:** Option C-prime. It gives tenants meaningful control and
missionaries a fast optional request path while preserving organization,
purpose, ledger, lifecycle, accounting, payment, and exit truth. It remains
smaller than Option B: one case family, two bounded purposes, one prospective
policy, one default approver, one conditional extra approval, and finite
destination roles rather than a generic workflow or formula builder.

### Concrete example

Maria is departing with a Finance-confirmed Field Account Balance of
**$14,000 USD**. The reviewed version shows **$2,000** of active compensation
Field Account Funding Coverage, a **$600** Reimbursement Obligation with exact
active **$600 reimbursement Field Account Funding Coverage**, and a **$300**
append-only refund effect recorded after the latest close. The calculation
subtracts the two coverages and the unclosed adverse effect once; it does not
also subtract the Reimbursement Obligation. The case therefore shows
**$11,100 currently eligible for disposition**, not $14,000.

Maria may use **Share a preference** to select an eligible related project and
add a note. The page says:

> Your organization controls this support balance. This request does not move
> funds. Finance will review remaining obligations and the original support
> purposes before deciding.

Finance sees the calculation bridge, source/purpose coverage, before/after
balances, destination, the independently live Reimbursement Obligation, and
why $2,900 is not currently eligible. If policy and purpose allow, finance
approves one exact $11,100 Exit Disposition Manifest split between the related
project and the tenant's organization support pool. Each internal line appends
as one atomic source/destination pair under the manifest; both sides of each
pair use the same Support Cycle close identity. Maria sees **Recorded —
awaiting inclusion in a finance close**, not a promise that the next close must
accept it and not a false immediate confirmed balance. The $2,600 remains
covered until its authoritative compensation and reimbursement results arrive;
the $300 adverse effect remains visible in current-cycle activity. When every
manifest line, continuing authority, and future source writer has an exact
result or successor, finance selects **Close field account**. Maria sees one
calm status and history, not journal lines or a withdrawal flow.

### UX/UI contract

#### Staff

- The doorway is **Field Accounts → Support reallocations** with
  `Needs review`, `In progress`, and `History`. Type, outcome, date, and
  exception filters live inside `History`; there is no redundant `All` view.
  `Needs attention` appears as a focused staff-only saved filter only when work exists. These are
  projections of evidence, not one status replacing request, decision, entry,
  handoff, payment, communication, and closure truth.
- The queue row shows case type, source account, safe destination label,
  requested amount, current step, requester, age, and one exception indicator.
  It does not expose donor identities or make staff open every case to discover
  a blocker.
- An ordinary internal reallocation uses one page or side sheet—not a stepper:
  **From**, **Purpose**, **To**, **Amount**, **Reason**, and a compact
  **Before → Change → After** review. `Split across destinations` is
  progressive disclosure and appears only when tenant-enabled.
- A staff member holding the required authority may use one
  **Approve and record** action. The write atomically records an immutable
  Decision and the distinct balanced transaction. When a second approval is
  required, the primary action truthfully reads **Submit for final approval**;
  the final authorized action remains **Approve and record**.
- The exit-purpose case uses a task-and-blocker page rather than a decorative
  linear progress bar. It shows current task, owner, due date, unresolved
  obligations/holds, residual by purpose and currency, disposition lines, and
  exact close readiness. Tasks may complete nonlinearly.
- Review shows the exact as-of close, account and policy versions, source and
  destination before/after values, exact source-purpose coverage, open
  authorities, compatibility result, actor, and effective date. It states:
  **This records open-cycle activity now. Finance-confirmed balances change
  only when a governed Support Cycle Close includes it.**
- The primary verbs are specific: **Approve and record**, **Request
  information**, **Decline request**, **Approve external disposition**,
  **Record handoff outcome**, and **Close field account**. There is no generic **Transfer**,
  **Release funds**, **Paid**, **Completed**, or **Mark complete** action.
- Tenants configure only: missionary-request availability, eligible
  destination roles, guided retained-balance/cap defaults, normal approver,
  bounded escalation conditions, explanation/contact copy, and prospective
  effective version. Existing decisions never change when policy changes.
- **Settings → Field Accounts → Reallocation policy** uses six plain-language
  sections: Requests, Destinations, Limits, Approval, Exit, and optional
  External succession. A read-only summary sentence and production-shaped
  preview show worker visibility, winners, conflicts, exact currency limits,
  example decisions, and the future activation boundary before commitment.
  The safe default needs no wizard; advanced sections remain collapsed until
  enabled.
- Launch omits blind bulk financial approval. **Approve and open next** keeps
  clean review fast without hiding destination, amount, purpose, or stale
  evidence. Bulk actions may assign, remind, or export cases but never approve,
  apply, close, or record an external result.
- The final review is editable before commitment and shows direct **Change**
  links. Stale-data failure keeps entered work, focuses the exact error, and
  refreshes the preview rather than discarding the case.

#### Missionary

- If requests are disabled, no dead-end transfer module or setup warning
  appears. The ordinary dashboard keeps its existing finance contact path.
- If enabled, one quiet action reads **Request support reallocation** for an
  active account and **Share an exit preference** during departure.
- `Preference only` asks for eligible destination and a short purpose.
  `Destination and amount request` also asks for amount. Both may include one
  optional note. The picker contains only tenant-curated eligible destinations;
  it never exposes an arbitrary worker directory or external charity.
- The form may show the latest Finance-confirmed support balance and as-of date
  for context, but never a `transferable`, `spendable`, or `available` balance.
- The review step repeats organization control, exact request, and the fact
  that finance decides. Submission confirmation says **No Field Account
  activity has changed**.
- Plain-language states are `Submitted`, `Finance needs information`,
  `Not approved`, and `Withdrawn` before a final decision. An internal result
  then becomes `Recorded` and later `Included through [close date]`. An
  external result uses `Approved for external disposition`,
  `Submitted to [payment owner] on [date]`, `Outcome not yet confirmed`, or
  `Payment confirmed by [evidence source] on [date]`. A worker-safe exception
  says **Finance is reviewing a delay**; `Needs attention` remains staff-only.
  The interface never collapses organization approval, an internal occurrence,
  a Support Cycle close, an external payment, and an Accounting Release into
  `Completed`.
- The worker can withdraw or edit a pending request until approval/application
  starts. After an immutable finance decision, a change creates a linked
  superseding request; it never edits the decision or entries.
- Anonymous/restricted source identity, other workers' balances, finance-only
  holds, provider payloads, conflict notes, and legal review are omitted. A
  privacy-safe explanation and contact path replace them. Internal decline
  reasons and missionary-visible explanations are distinct fields.
- A former missionary retains authorized read-only access to the final activity
  statement and safe case history after ordinary dashboard access is narrowed.
- Mobile uses one-column cards, a sticky review action only when safe, at least
  44-by-44 CSS-pixel targets, keyboard and screen-reader operability, status
  announcements without focus theft, visible focus, text-plus-icon states,
  error summary plus inline errors, 200% zoom support, and locale/currency
  formatting. No failure is toast-only or hover-only.

### Repository-specific seams and contradictions

- Phase 13's current `contribution_designation_lines` contract freezes a
  Designation identity snapshot but not the complete historical
  restriction/purpose-policy version D5 needs. Phase 13's accepted
  purpose-authority snapshot with the exact closed source-provenance variant
  above is therefore a required source-contract completion, not optional
  enrichment. It must support genuine offline/imported absence without
  fabricating a Phase 17 or Phase 22 publication.
- The current donor worker page hard-codes “100% of your program donation goes
  directly to the field account after processing fees” in both
  `apps/donor/app/(public)/workers/[id]/page.tsx` and
  `worker-profile-client.tsx`. That copy conflicts with organization control,
  D3's optional assessment, and Phase 20 D19's organization-absorbed processor
  cost default. It must be replaced before Phase 21/22 launch by one governed,
  tenant-approved discretion-and-control projection; D5 must not copy or
  reinforce it.
- The existing contribution-correction approval functions are implementation
  references, not a D5 authorization contract.
  `resolveCorrectionApprovalPolicy` permits self-approval in its
  `one_approver` mode, and `decideContributionCorrectionRequest` deliberately
  drops the stored `expectedRevision` at application. D5 requires
  conflict-aware authorization and commit-time CAS against every reviewed
  version, so neither behavior may be reused unchanged.
- No Phase 21 runtime, migration, OpenSpec behavior contract, or integration
  test exists yet. The implementation spec must create a public domain seam
  and real Postgres tests; string-matching migration tests cannot prove
  conservation, RLS, concurrency, rollback, or deadlock safety.

### Ruthless adversarial review after founder selection

Every category contains a real concern. None invalidates C-prime, but each
changes the permanent contract.

| Category                              | Concern? | What could go wrong                                                                                                                                                                                                                                                                                                                                                  | Why it matters                                                                                                                                             | Severity | Likelihood  | Permanent fix or prevention                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Brittleness**                       | Yes      | A hard-coded cap, exit formula, monthly timing assumption, one destination model, or a rule that transfers may occur only before a prior close will fail across ministries and finance calendars.                                                                                                                                                                    | Tenants would either bypass Asym or encode policy in notes and spreadsheets, defeating reliable evidence.                                                  | High     | High        | Use immutable prospective tenant-policy versions with bounded semantic roles and guided defaults. Resolve exact source, purpose, entity, currency, account, and cycle versions. An approved occurrence enters open-cycle activity and advances confirmed balances only through D1's next governed close.                                                      |
| **Technical debt**                    | Yes      | Separate implementations for active transfers, project transfers, worker transfers, exit disposition, and external succession would duplicate authorization and conservation logic; a generic workflow builder would be even harder to own.                                                                                                                          | Duplicated financial logic drifts, while a general builder becomes an untestable second product.                                                           | High     | Medium-high | Use one typed Support Reallocation Case family and shared coverage, decision, occurrence, exception, and evidence primitives. Keep two bounded purposes and finite outcomes; prohibit tenant-authored code, formulas, statuses, and arbitrary approval graphs.                                                                                                |
| **Edge cases**                        | Yes      | Couples or shared ministry arrangements, multi-destination splits, death or incapacity, an inactive destination, open final expenses, compensation coverage, legal holds, a late gift, refund, chargeback, negative correction, or manually opened exit draft can race a decision or close.                                                                          | An apparently complete case can strand an obligation, overstate capacity, move support to an invalid purpose, or disable work without lifecycle authority. | Critical | High        | Require the exact Worker Lifecycle Authority Reference; inventory every independently live authority and future writer; resolve exact purpose/currency layers; pin destination eligibility; make closure read-only; and use cause-linked append-only recovery with production-shaped fixtures.                                                                |
| **Footguns**                          | Yes      | Wallet language, unrestricted destination search, a personally interested approver, stale-balance approval, blind bulk approval, mutable post-approval edits, or a generic `Mark complete` button could create unauthorized or misleading movement.                                                                                                                  | A well-meaning worker or staff member could imply ownership, approve self-benefit, or record an outcome that did not happen.                               | Critical | Medium-high | Workers request but never execute. Permit one clean finance approval by default, but require independent handling for personal-interest conflicts and configured high-risk cases. Use exact verbs, final review, CAS, atomic application, immutable decisions, and no bulk approve/apply/close.                                                               |
| **Tenant safety**                     | Yes      | A picker, lookup, cache, background job, export, or malformed identifier could expose another tenant's worker or credit another Tenant or Legal Entity.                                                                                                                                                                                                              | This is both a financial misposting and a cross-tenant confidentiality breach.                                                                             | Critical | Medium      | Include Tenant and Legal Entity in database keys, authorization, uniqueness, job payloads, cache keys, storage paths, selectors, and exports. Enforce same-scope constraints at the database boundary, quarantine mismatches, and run negative isolation tests on every path.                                                                                 |
| **Over-engineering**                  | Yes      | Arbitrary stages, destination types, formulas, reusable conditional trees, universal grant compliance, and bespoke approval chains would turn Phase 21 into a workflow, legal, and payments platform.                                                                                                                                                                | Setup becomes intimidating, support costs grow, and the safe path becomes harder than email.                                                               | High     | High        | Ship a staff-only default, one normal approver, one bounded conditional extra approval, finite internal destination roles, and an optional proof-gated external lane. Keep jurisdiction-specific specialist review outside a universal rules engine.                                                                                                          |
| **UX/UI and user friction**           | Yes      | Showing ledger, legal, and restriction detail by default overwhelms staff; hiding it implies worker ownership or conceals why the eligible amount differs from the confirmed balance.                                                                                                                                                                                | Confusion drives abandonment, support contacts, and incorrect decisions.                                                                                   | High     | High        | Use one quiet queue, a short one-page ordinary form, progressive split/external detail, a clear balance bridge, plain organization-control copy, one truthful next action, and a separate task-oriented exit surface. Distinguish `Recorded`, `Included through [date]`, and external transfer evidence.                                                      |
| **Hidden coupling**                   | Yes      | Exit disposition could cancel compensation or reimbursement, leave assessment/compensation/Designation/recurring/giving-page writers active, rewrite donor facts, wait on QBO/Xero, or roll back a valid entry after notification failure.                                                                                                                           | One domain would silently alter another authority, while a supposedly closed account could keep receiving new discretionary activity.                      | Critical | Medium-high | Reference immutable authority and coverage IDs. Phase 21 owns only reallocation and Field Account effects; Phases 6/7/13/16/20/22 and worker-lifecycle, payroll, AP, legal, and payment owners retain truth. Exit requires source-owned retirement/succession proof; Phase 20 remains the sole accounting doorway.                                            |
| **Failure modes**                     | Yes      | One side of a pair could write before a timeout, a retry could duplicate it, an external payment could remain unknown, recipient status could expire, or the destination could deactivate after review.                                                                                                                                                              | Staff could see money disappear, double-post, or falsely appear paid.                                                                                      | Critical | Medium      | Apply an ordinary internal occurrence or each exit internal pair in one balanced database transaction with a stable idempotency key and outbox; look up exact results before retry; revalidate at commitment; return stale cases to review; keep external ambiguity covered until exact evidence arrives.                                                     |
| **Data integrity risks**              | Yes      | Aggregate-balance inference, missing historical purpose authority, fabricated publication history, adding provisional support, omitting negative open-cycle effects, subtracting both an obligation and its coverage, nondeterministic source-lot selection, reused coverage, unmatched entries, rounding loss, or unexplained residual could corrupt the subledger. | Field Account reports, accounting handoff, and worker statements would no longer reconcile, and capacity could be spent twice.                             | Critical | Medium-high | Require Phase 13's accepted purpose-authority snapshot with a closed source-provenance variant, deterministic source-lot order, and immutable Coverage Manifest; block only affected ambiguous lines; use the exact eligibility formula; conserve minor units; enforce unique coverage, CAS, balanced pairs, conserving exit manifests, and integrity checks. |
| **Security and privacy risks**        | Yes      | Missionaries could infer anonymous donors, other workers' balances, HR exit reasons, fraud/safeguarding/legal holds, or internal decline rationale; external-recipient and payment evidence can contain sensitive identifiers.                                                                                                                                       | Disclosure can harm donors, workers, investigations, and the organization.                                                                                 | Critical | Medium      | Use purpose-based RBAC, separate internal and missionary-safe explanations, least-data projections, private object storage with short-lived access, redacted logs, access auditing, retention/hold rules, and no arbitrary worker or external-party search in the missionary UI.                                                                              |
| **Scalability and performance risks** | Yes      | Replaying all entries or locking whole-tenant ranges during monthly close and seasonal offboarding could create contention and timeouts.                                                                                                                                                                                                                             | Finance work would fail exactly when deadlines and workload peak.                                                                                          | Medium   | Medium      | Maintain incrementally verified balance/coverage projections, lock only exact account/version rows in deterministic order, paginate queues/history, perform external handoffs asynchronously, and bound work per tenant without weakening atomic internal application.                                                                                        |
| **Operational burden**                | Yes      | Bespoke approval trees, manual purpose reconciliation, repeated recipient verification, and notification noise would require tribal knowledge.                                                                                                                                                                                                                       | Small finance teams would avoid the feature or make inconsistent decisions.                                                                                | High     | High        | Provide guided defaults, prospective reusable policy versions, one owner and due date, curated destination catalogs, reusable but freshness-bounded recipient evidence, templated safe explanations, `Approve and open next`, and exception-only alerts.                                                                                                      |
| **Observability gaps**                | Yes      | Support may be unable to distinguish waiting for information, approval, internal application, cycle close, recipient proof, external payment, a late obligation, accounting, or communication.                                                                                                                                                                       | Recovery becomes guesswork and staff receive misleading status.                                                                                            | High     | Medium-high | Correlate case, request, policy, manifest, decision, coverage, occurrence, handoff, payment evidence, cycle close, accounting handoff, and communication IDs. Expose a privacy-safe timeline, current owner/cause, age metrics, and alerts for stale, ambiguous, or orphaned work.                                                                            |
| **Dependency and integration risks**  | Yes      | Charity registries, sanctions sources, accounting systems, and payment evidence may be stale, unavailable, rate-limited, changed, or unable to prove the required fact.                                                                                                                                                                                              | An external dependency failure must not become false eligibility or false completion.                                                                      | High     | Medium      | Keep an internal evidence package and manual specialist evidence lane; label adapter capabilities; pin exact recipient/provider identity and evidence date; define freshness requirements per jurisdiction/risk; use backoff/circuit breaking; never infer success from an API call alone.                                                                    |
| **Migration and upgrade risks**       | Yes      | Provider-shaped recipient records, mutable policies, opaque custom states, or lossy exports would make future adapters and migrations destructive.                                                                                                                                                                                                                   | Tenants could lose the reason, authority, or exact financial effect of historical decisions.                                                               | High     | Medium      | Store canonical Asym semantic roles and immutable schema-versioned cases, policies, manifests, decisions, occurrences, and evidence. Keep external/provider identity at adapters, support open export, and migrate prospectively with read verification.                                                                                                      |
| **Other development hazards**         | Yes      | Two reviewers, an approval racing a cycle close, time-zone boundary errors, unordered callbacks, partial rollbacks, or unclear ownership can duplicate, omit, or misdate work.                                                                                                                                                                                       | These races are rare in demos but common in real finance operations and difficult to repair after close.                                                   | Critical | Medium-high | Use database CAS and uniqueness, half-open effective intervals in the Legal Entity's configured zone, deterministic lock order, event deduplication, append-only supersession, explicit role ownership, destructive-path tests, recovery runbooks, and fault-injection around every commit boundary.                                                          |

### Proof required before activation

The feature is not production-ready until the following observable contracts
pass:

1. **Policy and authority:** deterministic prospective policy selection;
   same-rank ambiguity blocks; a missionary request creates no entry; approval
   and application remain separate evidence; a personally interested requester
   or beneficiary cannot approve; a draft exit case changes no behavior; only
   an exact Worker Lifecycle Authority Reference activates exit handling.
2. **Purpose and conservation:** Phase 13 exposes the required immutable
   accepted posted-line purpose-authority projection with exact Designation,
   restriction/preference and purpose/excess-use policy version,
   source-posting coverage, and the exact closed source-provenance variant;
   Phase 21 preserves all source authorities. Publication evidence is required
   only when the accepted source actually presented or captured one; otherwise
   typed absence plus exact source-purpose evidence is required. Every output
   line reconciles; mixed
   compatible coverage splits or blocks; the stable close-boundary/posting-
   sequence/coverage-ID order reproduces exact lots; minor units conserve per
   currency. The current identity-only snapshot is insufficient.
3. **Internal atomicity:** an ordinary one- or multi-destination internal case
   resolves only Phase-21-owned typed Field Account destinations and appends
   its Decision and balanced same-Tenant, same-Legal-Entity, same-currency
   occurrence or nothing; each exit-manifest internal line uses one atomic
   pair while external lines remain independently covered. Two concurrent
   applies produce exactly one result; reciprocal account locks use
   deterministic order; retries are idempotent; no prior close is rewritten.
4. **Cycle truth:** all internal lines enter the same open Support Cycle and
   advance both source and destination Finance-confirmed balances through the
   same governed close. Approval never creates an immediate confirmed balance.
5. **Capacity and obligations:** positive provisional support is excluded;
   every qualified negative open-cycle effect not yet in the pinned close and
   active non-reusable funding/reallocation coverage are subtracted once; a
   Reimbursement Obligation or unknown exposure is never a shadow reserve;
   fulfilled coverage is replaced by the resulting debit without double
   subtraction; independently live obligations and blockers cannot be silently
   cancelled.
6. **Exit and recovery:** the Exit Disposition Manifest conserves every line
   and zero unexplained residual; D3 assessment and D4 compensation work has a
   proved terminal or continuing owner; Phase 13 proves Designation retirement
   or succession; Phase 16 owns any authorized recurring-term change; Phase 22
   retires presentation without choosing a financial destination. Closure is
   read-only; late facts append cause-linked recovery. A source-authoritative
   adverse correction may expose a visible deficit but never silently claws
   back its prior destination.
7. **External succession:** an external line never creates an internal target
   or a `Paid` claim; exact recipient, status, jurisdiction, purpose,
   due-diligence, prerequisite legal/consent/notice evidence, payee, source and
   payment currencies, authorizer, and freshness are proved. The Charitable
   Succession Result must match the immutable Decision, still-valid required
   authority, handoff, and authoritative payment occurrence. Payment evidence
   alone never qualifies; partial, reversed, failed, or ambiguous outcomes
   remain exactly covered and append recovery.
8. **Isolation and privacy:** cross-tenant, cross-entity, cross-account,
   unauthorized-role, cache, job, storage, search, export, and signed-access
   negative tests fail closed; missionary projections never leak restricted
   source identity, another account, internal reasons, HR facts, or evidence
   payloads.
9. **UX and accessibility:** ordinary staff work completes on one responsive
   page; external/exit complexity appears only when needed; review/correct,
   stale-preview recovery, keyboard operation, error-summary focus, live status
   messages, visible focus, non-color cues, 200% zoom, locale/currency
   formatting, and no toast-only or hover-only failure are verified.
10. **Operational resilience:** production-shaped fixtures cover a shared
    couple/ministry, multi-destination split, death/incapacity, inactive
    destination, destination deactivation after request, negative correction,
    late gift/refund, legal hold, unresolved reimbursement, provider outage,
    cross-currency/entity/tenant attempts, retry after unknown outcome, and
    accounting/communication failure.
11. **Accounting ownership:** request, approval, reservation, and unknown
    external outcome remain accounting-dark. An internal pair becomes eligible
    only after both sides enter the same immutable Support Cycle Close; an
    external line becomes eligible only after the exact Charitable Succession
    Result and disposition effect enter their governed close. Only then may the
    separately certified Support Reallocation Accounting Occurrence become the
    sole eligible future source root for Phase 20's accountant-confirmed
    contract and Phase 20 D17 posting owner. The current Phase 20 generation keeps this
    family unsupported and dark until a separately approved source
    certification exists; no generic journal, artifact, or manual-posting
    fallback is allowed. No D5 path writes QBO or Xero directly.
12. **Real concurrency and database enforcement:** integration tests exercise
    Postgres composite scope references, RLS, deferred conservation,
    uniqueness, CAS, concurrent application, rollback, idempotency, and
    deadlock-safe lock ordering. SQL-string assertions alone are insufficient.
    Existing contribution-correction approval is treated only as a pattern:
    D5 must not inherit its self-approval behavior or its deliberate removal
    of `expectedRevision` at application.

### Ratified C-prime-R contract

**C-prime-amended-and-hardened (C-prime-R) — one bounded,
organization-authorized, purpose-compatible Support Reallocation Case as a
coordination and review surface—not a mutable financial aggregate—for active
and exiting Field Accounts; coordinating a nonbinding worker request or
preference, immutable prospective tenant policy, exact Phase 13
accepted-source purpose authority with one closed source-provenance variant,
conflict-aware organization Decision, and independently authoritative
outcomes; giving tenants bounded control over request mode, eligible typed
Phase 21 destination roles, splits, retained floors, caps, frequency,
approver roles, risk-based escalation, visibility, notifications, and exit
suggestions; deriving eligibility only from the Finance-confirmed balance
minus every qualified negative open-cycle Field Account effect not yet in that
close, active non-reusable coverage, and the policy floor—never provisional
positive support, liabilities twice, or estimated availability; recording an
ordinary eligible same-Tenant, same-Legal-Entity, same-currency internal
Decision and balanced pair atomically against exact reviewed versions, with
both sides advancing through one later Support Cycle Close; activating exit
handling only from an exact Worker Lifecycle Authority Reference; using one
conserving Exit Disposition Manifest whose internal lines are atomic pairs and
whose external lines remain exactly covered until independently proved;
requiring source-owned retirement or succession of assessment, compensation,
Designation, authorized recurring-support, and giving-page presentation
writers before read-only closure; routing external charitable succession
through an exactly identified, jurisdiction-appropriate, evidence-gated
handoff and one Charitable Succession Result matching the Decision, still-valid
required authority, handoff, and authoritative payment occurrence, then
recording one balanced source-debit plus typed organization-control/disposition
counter-entry in one close; preserving reimbursement, compensation,
adverse-correction, legal, incident, accounting, payment, communication, and
lifecycle truth; keeping the current Phase 20 generation dark while reserving
only a separately certified close-covered qualified occurrence as the eligible
future source root and Phase 20 D17 posting owner; and handling late facts through
cause-linked append-only
recovery in one quiet, accessible, exception-first workspace—without worker
ownership, donor-purpose erasure, aggregate-balance inference, self-dealing
approval, blind bulk approval, automatic target clawback, automatic external
payout or donor refund, direct QBO/Xero writes, cross-entity or FX inference,
mutable history, or a generic workflow engine.**

## D6 ratified direction: quiet default and proof-gated parallel currency-scoped Field Accounts

### Research verdict

The safe launch shape is not one mixed-currency Field Account and not one
currency for every organization. It is one explicit, quiet Legal-Entity
default plus optional, prospectively activated sibling Field Accounts, each
with one immutable currency and independently authoritative close, balance,
assessment, reservation, correction, statement, and lifecycle.

The worker experiences one calm **Support balances** workspace. That workspace
groups references for comprehension only and never owns a writable,
authoritative, or converted total.

### Primary-source evidence

#### Modern Treasury

- A ledger account records transactions and balances in one currency. Multiple
  currencies use multiple accounts, one per currency.
- Credits and debits balance per currency; posted transactions are immutable;
  corrections use new reversing transactions; writes are atomic and
  idempotency is supported.
- These patterns support independently balanced currency-scoped Field Accounts
  and append-only correction rather than a mixed-currency balance.

Sources:
[Ledger currencies](https://docs.moderntreasury.com/ledgers/docs/currencies),
[ledger guarantees](https://docs.moderntreasury.com/ledgers/docs/ledgers-guarantees),
and
[transaction statuses and balances](https://docs.moderntreasury.com/ledgers/docs/transaction-status-and-balances).

#### Stripe

- Stripe distinguishes payment-method currency, donor presentment currency,
  and organization settlement currency.
- A Balance Transaction preserves exact settlement-currency `amount`, `fee`,
  `net`, currency, source, status, availability time, and nullable exchange
  rate. The documented rate direction is source amount multiplied by the rate
  equals the Balance Transaction amount.
- Retaining and paying out an additional currency is capability-dependent:
  supported regions, matching external accounts, fees, minimums, and current
  provider configuration all matter.
- Stripe amount representations include zero-decimal and provider-specific
  special cases. Field Account money therefore cannot assume two decimals or
  use a raw provider integer without certified adapter normalization.

Sources:
[Stripe currencies](https://docs.stripe.com/currencies),
[Balance Transaction object](https://docs.stripe.com/api/balance_transactions/object),
and
[multicurrency settlement](https://docs.stripe.com/connect/multicurrency-settlement).

#### QuickBooks Online

- QBO multicurrency is disabled by default, is unavailable on some plans,
  cannot be disabled after activation, and can be enabled only by the user in
  QBO—not through the API.
- Applicable accounts and names have one currency and cannot later change that
  currency. Income and expense accounts remain home-currency accounts.
- QBO defines `ExchangeRate` as home-currency units per one foreign-currency
  unit and owns `HomeTotalAmt`, translation, revaluation, and accounting
  effects.

This supports proof-labelled QBO capability without letting QBO become Field
Account authority or allowing Asym to switch provider settings automatically.

Source:
[QBO multicurrency workflow](https://developer.intuit.com/app/developer/qbo/docs/workflows/manage-multiple-currencies).

#### Xero

- Xero records accounting in its base currency while allowing supported
  multicurrency documents and accounts.
- Capability may change when the organization changes subscription. Historical
  foreign-currency data may remain even when new FX documents cannot be
  created.
- Xero defines `CurrencyRate` as foreign currency per base currency—the
  opposite orientation of QBO's documented convention. Xero explicitly warns
  against inverse rates and defaulting foreign documents to `1`.
- Where supported, exact `BankAmount` is safer than calculating a rate because
  rate rounding can prevent automatic bank matching.

This proves that a generic untyped `exchange_rate` field is unsafe and that
Phase 21 must preserve exact provider-labelled direction rather than invent or
translate accounting rates.

Source:
[Xero multicurrency guidance](https://developer.xero.com/documentation/best-practices/data-integrity/multicurrency).

#### Missionary and CRM comparators

- MissionGO presents overall account balance per currency and supplies gifts,
  ministry expenses, statements, detail, and CSV export. This validates
  per-currency self-service but does not make selector-only discovery safe.
  [MissionGO dashboard walkthrough](https://www.missiongo.org/ContentFiles/Missionary%20Dashboard%20Walkthru.pdf)
- MPDX creates separate accounts for different countries/currencies and warns
  that merging them can make balances inaccurate because processing differs;
  the merge is irreversible. This is direct counter-evidence to destructive
  merging or one mixed balance.
  [MPDX multiple accounts](https://help.mpdx.org/article/1367-manage-multiple-accounts)
- TntConnect can show native currencies and converted reports, but some
  ordinary converted fields use the current rate rather than the historical
  receipt/transfer rate. Historical Field Account truth therefore cannot move
  merely because today's rate changed.
  [TntConnect multicurrency](https://www.tntware.com/tntconnect/help/en/pages/gifts_multicurrency.aspx)
- DonorHub supplies organization-fed account balance and recent-transaction
  self-service to field staff, supporting a downstream staff portal rather
  than a second accounting authority.
  [DonorHub](https://www.tntware.com/donorhub/)
- Virtuous Project Statements can show gifts, expenses, and
  accounting-integrated beginning/current balances, but documents that some
  summary statistics are delayed and do not follow the selected date range.
  Every Phase 21 number therefore carries its own exact through/as-of scope.
  [Virtuous Project Statements](https://support.virtuous.org/hc/en-us/articles/6466181015949-What-is-the-Project-Statements-Tab)

### Converted multi-designation gap and resolution

Stripe supplies exact transaction-level settlement-currency evidence, while
Phase 13 owns Asym's complete effective hard-tender header line set in the
source contribution currency, including eligible designations, fee-cover, and
other non-support lines. If one converted payment covers several line roles,
neither source alone supplies a target-currency amount for each line.

Silently copying source amounts, using a current rate, deriving independent
per-line rates, or assigning the final minor-unit residual arbitrarily would
make the Field Account non-repeatable. D6 therefore adds one immutable
admission-contract-owned **Support Currency Allocation Manifest** only when the
source and Field Account currencies differ.

The manifest:

- references the exact immutable Phase 13 source header/revision and complete
  effective hard-tender line set, including every line role and eligibility;
- references the exact typed organization-controlled target allocation basis
  and target currency—`provider_balance_gross`, `bank_credited_amount`, or
  another closed D2-qualified exact basis;
- preserves both amount bases without asserting cross-currency equality;
- records provider/bank conversion provenance and only costs that the external
  source separately exposes; it never invents an embedded cost;
- allocates the exact target total across the complete frozen source line set
  using the existing deterministic largest-remainder minor-unit seam, while
  permitting only eligible non-fee-cover designation target portions to create
  Gross Support Allocations;
- records rounding, residual recipient, and algorithm/contract version;
- proves source conservation, target conservation, and non-reuse; and
- becomes balance authority only through exact Support Cycle Admission
  Coverage and a Support Cycle Close.

It never changes the Phase 13 contribution, donor receipt, Designation,
provider conversion, Phase 20 Accounting Effect, or QBO/Xero translation.
`Gross Support Allocation` means gross before separate Phase 21 assessment and
cost effects; it does not claim every source rail exposed processor gross.

Every later cross-currency refund, return, dispute, or correction receives its
own immutable successor/correction manifest. That manifest uses the later
occurrence's exact external source and target evidence, allocates no more than
the remaining original coverage, and never mechanically reuses the original
target amount or exchange rate.

### UX conclusion

**One currency**

- Show one **Finance-confirmed support balance**, exact amount/ISO currency,
  and `Through {date}`.
- Show no selector, multicurrency badge, exchange-rate surface, provider
  status, or inactive-currency placeholder.
- Never call the amount available, withdrawable, cash, wallet, or payout
  balance.

**More than one currency**

- Use one **Support balances** section.
- Show every balance simultaneously in a compact stacked list, default display
  currency first.
- Give every balance its own exact amount, ISO code, through date, state, and
  activity action.
- Do not hide another balance behind a selector, add unlike currencies, or
  display an authoritative converted hero total.
- Allow an all-currency activity stream only when every amount keeps its ISO
  code and totals remain partitioned.
- Produce one logical statement with separately controlled currency sections
  and no converted closing total.

**Staff**

- Use **Add another support currency**, not a global multicurrency switch.
- Verify only the exact source-family path and independently label accounting
  or payment capabilities.
- Preview effective boundary, assessment treatment, statement presentation,
  downstream effects, and unchanged history before one atomic confirmation.
- Show cause, affected scope, safe work, owner, evidence, and next action only
  for exceptions.

Accessibility requirements include WCAG 2.2 AA semantics, keyboard operation,
visible and unobscured focus, non-color meaning, touch targets, restrained
status announcements, semantic finance tables, 320 CSS-pixel reflow, screen
reader proof, zoom, RTL, long labels, and explicit ISO codes for ambiguous
symbols. Sources:
[WCAG 2.2](https://www.w3.org/TR/WCAG22/) and
[WAI tables tutorial](https://www.w3.org/WAI/tutorials/tables/).

### Required production proof

1. Composite scope, immutable currency, append-only entry, source/manifest
   uniqueness, RLS, authorization, and direct-write-denial tests.
2. Safe integer/string money boundaries; zero-, two-, and three-decimal and
   provider-special-case fixtures; overflow and negative correction tests.
3. Same-currency, ordinary provider conversion, retained settlement, offline
   deposit, bank conversion, split gift, partial/cumulative refund, missing
   evidence, contradictory evidence, rate-direction, rounding, and residual
   property tests.
4. Activation/close/adverse-event/assessment/coverage/reallocation/retirement
   concurrency, idempotency, crash, retry, and authorization-revocation tests.
5. Provider drift/outage and QBO/Xero outage tests proving only the owned
   capability blocks while prior Field Account truth and mandatory adverse
   correction remain live.
6. Per-currency D3 assessment, D4 compensation/reimbursement, D5
   reallocation/exit, statement, export, alert, and control-total proof.
7. Cross-tenant, Legal-Entity, worker, purpose, role, restricted-worker,
   cache, search, export, artifact, notification, and telemetry isolation.
8. Seasonal-volume tests without full-history replay, per-row provider calls,
   giant all-currency transactions, or tenant-wide locks.
9. Quiet one-currency and complete multicurrency mobile, keyboard,
   screen-reader, zoom, reflow, localization, statement, and export journeys.

### Ratified C-prime-R contract

**C-prime-amended-and-hardened (C-prime-R) — one explicit, quiet,
Legal-Entity-owned default Field Account currency with tenant-authorized,
prospective, source-family-specific proof-gated parallel currency-scoped Field
Accounts; immutable currency and structurally complete Tenant, Legal Entity,
purpose, account, and currency isolation; per-currency entries, assessments,
reservations, capacity, Support Cycle closes, admission coverage, corrections,
statements, reallocations, and retirement; one immutable,
admission-contract-owned and per-designation-conserving Support Currency
Allocation Manifest whenever source and Field Account currencies differ;
independently authoritative activation, source readiness, Field Account close,
Phase 20 accounting delivery, and external payroll/AP payment truth;
affected-positive-only quarantine with mandatory adverse-correction
continuity; exact externally owned conversion evidence without an Asym FX
engine; and one accessible, quiet “Support balances” experience with every
balance separately ISO-labelled and through-dated, and no authoritative
converted grand total, mutable currency, destructive merge, or cross-currency
internal reallocation.**

## D7 ratified direction: capability-honest multi-provider compensation handoffs

### Research verdict

The provider APIs do not expose one uniform payroll-draft contract. The modern,
safe design is one stable Compensation Handoff Package and several exact
provider/product/region/operation adapters:

| Exact adapter                    | Honest launch capability                                                                    |                      Direct write? | Provider-owned boundary                                          |
| -------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------: | ---------------------------------------------------------------- |
| Gusto Employee Payroll Draft     | Update exact employee compensation/reimbursement values in one selected unprocessed payroll |                                Yes | Gusto staff still review and process payroll                     |
| ADP Workforce Now Pay Data Input | Create one exact provider-native pay-data input batch                                       |                                Yes | ADP practitioner still reviews and processes the batch           |
| Xero Payroll Australia           | Update one exact `DRAFT` pay run/payslip through the AU Payroll contract                    |                                Yes | Xero owns posting, payroll completion, and payment               |
| Xero Payroll New Zealand         | Update one exact `DRAFT` pay run/payslip through the separate NZ Payroll contract           |                                Yes | Xero owns posting, statutory processing, completion, and payment |
| QuickBooks Workforce             | Exact provider-context/readback where approved plus immutable artifact fulfillment          | No equivalent per-run write proved | QuickBooks owns payroll entry and every later state              |
| Xero Payroll UK                  | Exact pay-run/payslip readback plus immutable artifact fulfillment                          | No equivalent per-run write proved | Xero owns payroll entry and every later state                    |

This is not a partial launch. Each adapter is complete for the capability the
provider actually exposes. “Fully built” includes authorization, capability
proof, stable participant/destination mapping, provider-native validation,
preview, safe release where supported, exact evidence/readback, ambiguity and
drift handling, disconnect, diagnostics, accessibility, and artifact
continuity. It does not imply identical write support.

The research also confirmed that Xero Accounting can represent an accounts
payable bill in `DRAFT`, whereas a QuickBooks Online Bill changes the books
immediately. The founder-ratified D7 deliberately does **not** turn either
accounting object into a Phase 21 Compensation Handoff Adapter. Accounting
delivery remains Phase 20-owned for both providers. This preserves the already
ratified separation between payroll authorization and Accounting Destination
Connections, prevents asymmetric accounting ownership, and avoids a second
QBO/Xero posting path.

### Gusto primary-source findings

Gusto's App Integrations workflow provides a real draft-input boundary:

1. list exact unprocessed payrolls;
2. prepare one selected payroll for update; and
3. update exact employee compensation/reimbursement records.

Important constraints:

- `prepare` is a provider mutation, not a read-only preview. It can change
  eligible employees and payroll metadata and clear an existing calculation.
- Employee-compensation versions provide optimistic concurrency. A stale
  version returns `409`; the safe response is fresh read, new diff, and new
  staff review, not automatic retry.
- Included values replace provider values rather than representing an abstract
  increment. Existing non-Asym values must be preserved and reviewed.
- Provider page and update limits require bounded child operations for large
  payrolls. Partial progress must remain visible per covered unit.
- The API is versioned. The adapter must pin and certify an explicit current
  version and upgrade prospectively.
- Gusto states that the integration cannot process payroll. Review and final
  confirmation remain in Gusto.
- Production access requires provider approval, security/QA work, assigned
  scopes, and exact production authorization. Demo access is not a substitute.
- Rotating refresh tokens and company-scoped grants require serialized token
  refresh and one exact company binding.

Sources:
[payroll update workflow](https://docs.gusto.com/app-integrations/docs/updating-payrolls),
[prepare endpoint](https://docs.gusto.com/app-integrations/reference/put-v1-companies-company_id-payrolls-payroll_id-prepare),
[update endpoint](https://docs.gusto.com/app-integrations/reference/put-v1-companies-company_id-payrolls),
[idempotency and object versions](https://docs.gusto.com/app-integrations/docs/idempotency),
[API versioning](https://docs.gusto.com/app-integrations/docs/api-versioning),
[production approval](https://docs.gusto.com/app-integrations/docs/introduction),
[authentication](https://docs.gusto.com/app-integrations/docs/authentication),
and [rate limits](https://docs.gusto.com/app-integrations/docs/rate-limits).

The certified Gusto adapter therefore targets one exact unprocessed payroll,
shows that prepare changes provider state and may clear a calculation, uses
current object versions, preserves current values, records each bounded child
operation, reads back the result, and contains no payroll-processing or
contractor-payment operation.

### ADP Workforce Now primary-source findings

ADP Workforce Now exposes a provider-native Pay Data Input `modify` operation
with a separate metadata read. Its input model can represent earnings,
deductions, reimbursements, allocations, and temporary cost/department data.
The safe adapter must use current company/employee-specific metadata and the
exact practitioner scope rather than a tenant-authored global code catalog.

Critical recovery facts:

- The company must be in an input/correction state accepted by ADP.
- Multi-associate requests can fail as a whole when one participant/input is
  invalid, so the complete intended batch needs preflight.
- ADP documents that reusing a Batch ID can create another batch with a
  provider-generated suffix. Batch ID is a correlation reference, not an
  idempotency key.
- The public Workforce Now contract does not establish an exact
  GET-by-batch recovery operation for a lost response. Semantics from a
  different ADP product cannot be borrowed.
- A definite provider rejection can be corrected through a new reviewed
  operation. A timeout or lost response must become **Needs ADP confirmation**
  and remain `outcome_unknown`; it cannot be automatically posted again.

Source:
[ADP Workforce Now Payroll Data Input API Guide](https://developers.adp.com/articles/preview/guide-payroll-data-input-api--guide-for-adp-workforce-now-0?chapter=2).

Production certification must additionally freeze the exact ADP commercial
product, Consumer Application Registry scope, test arrangement, company
configuration, provider limits, and support/escalation contract because the
public guide does not promise one universal production onboarding or rate
policy.

### QuickBooks Workforce primary-source findings

Current QuickBooks Workforce documentation exposes payroll/time scopes and
reads, including payroll-compensation and payslip-related capabilities for
approved partners. It does not document a mutation that places an exact fixed
compensation-funding or reimbursement amount into one draft payroll run.

Writable QuickBooks TimeActivity is not an acceptable substitute. It represents
time worked and can affect payroll/accounting semantics; fabricating hours or a
rate to carry a fixed support-funding amount would corrupt source meaning.
QuickBooks Online Accounting Bills are also not a substitute: a Bill creates
an accounts-payable transaction in the books and therefore belongs only to a
Phase 20 Accounting Release.

Workforce access can require partner tier/approval, and the payroll APIs are
not generally available in the ordinary QBO sandbox. Even the readback adapter
is available only after the exact production grant and a controlled
production-shaped certification are proved.

Sources:
[QuickBooks Workforce get started](https://developer.intuit.com/app/developer/payroll-time/docs/get-started),
[Workforce scopes](https://developer.intuit.com/app/developer/payroll-time/docs/learn/learn-about-scopes),
[time-tracking use cases](https://developer.intuit.com/app/developer/payroll-time/docs/workflows/use-cases-track-time),
[Workforce FAQ](https://developer.intuit.com/app/developer/payroll-time/docs/faq),
and
[QuickBooks bill/AP workflow](https://developer.intuit.com/app/developer/qbo/docs/learn/learn-basic-bookkeeping/pay-bills).

The honest launch action is therefore **Prepare package for QuickBooks
Payroll**, with current participant mapping, provider-shaped validation,
immutable artifact instructions, exact provider-context navigation where
approved, and later provider result readback where scopes permit. It never
claims Asym wrote a payroll draft.

### Xero regional payroll primary-source findings

Xero Payroll is not one product contract:

- Australia exposes Pay Run and Payslip writes for its regional schema.
- New Zealand exposes its own Pay Run and Payslip writes with different
  regional fields and behavior.
- United Kingdom exposes Pay Run and Payslip reads but not an equivalent
  per-run fixed-compensation/reimbursement draft write.

For AU and NZ, only exact `DRAFT` objects may be targeted. Posting, authorizing,
statutory submission, or payment operations are outside the adapter. The
provider contracts have destructive replacement hazards:

- AU updates require all existing lines of an included line type; omitted
  lines may be deleted.
- NZ requires the complete provider-required line representation for the
  payslip; omitted types or lines may be deleted.

The permanent write pattern is:

1. read the exact current draft;
2. preserve the complete provider-required representation;
3. merge only the reviewed supported component;
4. re-read and compare the reviewed source hash immediately before release;
5. abort on drift;
6. write the complete merged representation; and
7. immediately read back and compare intended and unintended changes.

The adapter never assumes patch semantics or silently retries a lost response.
Any Xero idempotency behavior must be certified for the exact regional Payroll
endpoint and immutable request rather than inferred from a general guide.

Xero Payroll UK Timesheets, employee pay templates, and reimbursement-type
configuration are adjacent objects with different meaning. They cannot carry a
one-period support-funding decision. The UK launch adapter therefore supplies
exact readback and artifact fulfillment only.

Sources:
[Xero Payroll AU Pay Runs](https://developer.xero.com/documentation/api/payrollau/payruns),
[Xero Payroll AU Payslip](https://developer.xero.com/documentation/api/payrollau/payslip),
[Xero Payroll NZ overview](https://developer.xero.com/documentation/api/payrollnz/overview),
[Xero Payroll NZ Payslips](https://developer.xero.com/documentation/api/payrollnz/payslips),
[Xero Payroll UK Pay Runs](https://developer.xero.com/documentation/api/payrolluk/payruns),
[Xero Payroll UK Payslips](https://developer.xero.com/documentation/api/payrolluk/payslips),
[Xero Payroll UK Timesheets](https://developer.xero.com/documentation/api/payrolluk/timesheets),
[Xero Payroll UK Pay Templates](https://developer.xero.com/documentation/api/payrolluk/employeepaytemplates),
[OAuth scopes](https://developer.xero.com/documentation/guides/oauth2/scopes/),
and
[idempotent requests](https://developer.xero.com/documentation/guides/idempotent-requests/idempotency/).

### Common architecture conclusion

The provider-neutral core owns only:

- one immutable Compensation Handoff Package;
- one immutable Compensation Draft Delivery Profile Version;
- a finite typed component-role catalog;
- one exact selected executable lane;
- one immutable Provider Draft Operation and bounded child operations;
- per-unit delivery coverage and one of three recovery dispositions;
- provider-neutral staff/missionary projections; and
- the adapter capability/certification registry.

Each provider module owns its current authentication details, destination and
participant discovery, metadata, payload, state allowlist, concurrency and
idempotency behavior, provider limits, readback, provider-specific error
classification, and redacted evidence extraction. The common core does not
flatten these into a universal payroll payload or common `send payroll`
operation.

The three recovery dispositions are:

- `confirmed_updated`: exact readback or provider evidence proves the unit was
  updated;
- `proven_not_updated`: exact provider evidence proves it was not updated and
  cannot still execute; and
- `outcome_unknown`: neither claim is proved.

Only `proven_not_updated` coverage may enter a residual successor. This
prevents partial chunks and lost responses from becoming duplicate payroll
inputs. Unknown coverage remains visible and quarantined. A staff observation
can resolve an adapter whose provider lacks exact lookup only when it records
the exact provider target/evidence and a permitted actor; it cannot be a
generic “mark failed” shortcut.

### Security, privacy, reliability, and operations

- Grants and provider certificates are encrypted, least-scoped, independently
  revocable, and structurally bound to Tenant, Legal Entity, provider
  organization, product, country, and environment.
- Provider callback state, PKCE where supported, exact redirects, rotating
  refresh-token serialization, and immediate local quarantine on revocation
  are required.
- Worker mapping uses stable provider IDs. Names, email, ordering, or “first
  company” cannot select a target.
- Payroll payloads, artifacts, readback, logs, traces, support bundles, and
  telemetry are PII-minimized. Routine logs carry opaque identities and
  outcomes rather than worker names or pay amounts.
- Release authorization is checked again server-side immediately before
  provider mutation. A stale browser permission or connection cannot execute.
- Each provider/operation has a kill switch. Workload queues are
  destination-aware, rate-limit-aware, and tenant-fair, with bounded chunks and
  provider-adaptive backpressure.
- Provider events wake a read; they are not authoritative proof by themselves.
  Duplicate, delayed, and out-of-order events are deduplicated and reconciled
  against the provider object.
- Certification records freeze documentation review date, API version,
  product/region, scopes/roles, plans, test method, vendor authorization,
  fixtures, limits, idempotency/concurrency facts, PII, failure recovery,
  support owner, last proof, expiry, and recertification triggers.

### UX/UI conclusion

Setup begins with an exact provider/product/country choice, then exact provider
organization/Legal Entity, stable worker mapping, typed component mapping, pay
cycle, and a production-shaped verification. A capability card says what the
adapter can actually do and its last-certified date; it never hides unsupported
capability behind a generic `Connected` badge.

Routine release is a single provider-specific review:

- source decision and exact package;
- exact provider organization, participant, and draft/input target;
- current provider value when readable;
- proposed value and whether the provider replaces or adds;
- any destructive or state-changing provider preparation;
- what Asym will do; and
- what staff must finish in the provider.

The action uses literal copy:

- **Update Gusto payroll draft**
- **Create ADP pay-data batch**
- **Update Xero AU draft payslips**
- **Update Xero NZ draft payslips**
- **Prepare package for QuickBooks Payroll**
- **Prepare package for Xero Payroll UK**

For example: “This changes a draft in Gusto. It does not run payroll or send
money. Review and finish payroll in Gusto.” Routine health is quiet. Exceptions
show one cause, affected participant/component coverage, completed safe work,
owner, evidence, and next action.

Missionaries see no provider machinery. Their compact projection remains
provider-neutral: **Planned**, **With payroll**, **Processing**, **Payment
confirmed**, or **Needs attention**. Provider draft acceptance may support
**With payroll** only; it never proves payroll completion or payment.

The flow must meet the established WCAG 2.2 AA product contract: keyboard
completion, visible/unobscured focus, programmatic names and errors,
non-color-only meaning, touch targets, restrained announcements, 320 CSS-pixel
reflow, zoom, screen-reader proof, localization/long labels, and no hidden
information that appears only on hover.

Sources:
[WCAG 2.2](https://www.w3.org/TR/WCAG22/) and
[WAI forms tutorial](https://www.w3.org/WAI/tutorials/forms/).

### Adversarial conclusion

Every requested category has a material concern. The permanent controls are
the D7 decision-log matrix, not optional future hardening:

- exact regional adapters prevent brittle provider parity;
- one stable package and finite semantic roles prevent a payroll platform;
- fresh metadata, explicit destinations, and per-unit coverage handle edge
  cases without fuzzy inference;
- provider-native previews and forbidden-operation absence remove the most
  dangerous footguns;
- complete structural scope, RLS, authorization recheck, scoped secrets,
  queues, caches, and negative tests protect Tenant/Legal-Entity isolation;
- independent payroll, payment, Field Account, and accounting truth remove
  hidden coupling;
- immutable operations, readback, quarantine, and residual successors contain
  partial/unknown failure modes;
- full-object preservation, concurrency proof, and exact after-readback protect
  provider data integrity;
- least scopes, token rotation, PII minimization, and redacted diagnostics
  protect sensitive payroll data;
- bounded child operations, fair queues, adaptive backpressure, and kill
  switches support seasonal scale;
- shared lifecycle tooling plus per-adapter certification/runbooks contain the
  operational portfolio cost; and
- immutable schema/profile/adapter versions plus prospective recertification
  prevent provider upgrades from rewriting history.

### Required production proof

1. Exact provider/product/country/operation contract fixtures and schema/state
   allowlist tests for every supported capability and forbidden endpoint.
2. Grant, tenant/Legal-Entity/provider-organization, participant, pay-cycle,
   currency, component, and operation isolation tests.
3. One-lane and per-unit coverage uniqueness properties proving no package can
   execute through artifact and provider delivery or through two adapters.
4. Provider-specific concurrency, destructive replacement, chunking, rate
   limit, definite rejection, lost response, ambiguous result, drift,
   revocation, and outage fault injection.
5. Exact readback and readback-unavailable tests, including the three recovery
   dispositions and residual-only successor invariant.
6. Proof that `confirmed_updated` and `outcome_unknown` units cannot be resent,
   released to another lane, or described as failed.
7. Security testing for OAuth/callback state, token refresh races, secret
   exposure, PII logs/traces/artifacts, stale permission, and cross-scope
   access.
8. Seasonal workload certification with bounded provider calls, resumable
   child progress, tenant fairness, provider-adaptive backpressure, and
   exception-only staff load.
9. Accessible setup, preview, release, partial/unknown recovery, disconnect,
   artifact continuity, and missionary-status journeys.
10. Current production authorization and exact production-shaped canary
    evidence for at least two distinct direct-write adapters. Until both pass,
    artifact/readback continuity may remain usable but the ratified D7
    multi-provider launch is incomplete.

### Ratified C-prime-R contract

**C-prime-amended-and-hardened (C-prime-R) — a launch portfolio of fully built,
capability-honest Compensation Handoff Adapters, with at least two
production-authorized direct-write adapters required at launch: exact
provider- and region-pinned Gusto Employee Payroll Draft, ADP Workforce Now Pay
Data Input, and separately certified Xero Payroll AU and NZ draft-input
adapters; capability-complete QuickBooks Workforce and Xero Payroll UK
readback-and-artifact adapters where no equivalent per-run write exists; one
immutable artifact-always Compensation Handoff Package and exactly one
executable delivery lane; prospective Tenant-, Legal-Entity-,
provider-organization-, product-, country-, environment-, participant-,
currency-, pay-cycle-, component-, and operation-scoped Delivery Profiles;
explicit staff-reviewed provider-native preflight and preview; immutable
Provider Draft Operations with concurrency protection, exact readback, drift
detection, ambiguity-safe inspect-before-retry, residual-only append-only
recovery, tenant-fair backpressure, kill switches, and production
certification; while external providers remain authoritative for
classification, calculation, approval, submission, posting, payroll
completion, and payment—and without fictional provider parity, a universal
payroll payload, payroll calculation or execution, contractor-payment
initiation, destructive overwrite, blind retry, dual delivery,
accounting/payroll connection conflation, adjacent-object substitution, or any
claim that draft acceptance proves payroll completion or payment.**

## D8 ratified direction: source-authoritative Missionary Support Feed Projection

### Research verdict

The correct continuity architecture is a one-way, recipient-scoped read
projection, but the initial “snapshot plus cursor” wording was not sufficient
by itself. Modern synchronization contracts require a repeatable bootstrap
cut, separate page and change cursors, at-least-once replay semantics, explicit
reset, current authorization independent of cursor possession, safe
correction/removal operations, and honest downstream-outcome language.

D8 therefore preserves a deliberately narrow boundary:

- Phase 21 owns its existing Missionary Support Activity Projection, separately
  through-dated per-currency Support Balances Projection, and the closed
  external field floor for both.
- Phase 14 and Phase 16 remain the underlying authorities already composed by
  Phase 21; Phase 31 does not independently rejoin them.
- Phase 28 may later add only a separately ratified
  relationship/contactability resource family. It does not own supporter
  identity, contributions, commitments, or Field Accounts.
- Phase 31 owns the disposable composite **Missionary Support Feed Projection**
  that consumes those Phase 21 projections exactly once, plus the prospective
  Subscription Version, Coverage Manifest, authorization, transport, schema
  negotiation, cursor lifecycle, PII-free hints, provider serialization,
  throttling, health, and delivery evidence.
- Phase 30 owns inbound migration and history adoption. D8 is continuing
  projection, not migration or all-history export.
- Phase 20 remains the only accounting doorway. D8 is accounting-dark.

The Phase 31 composite feed remains rebuildable. It cannot become an immutable
replica of all supporter, gift, commitment, and balance rows. Immutability
applies to prospective subscription versions, coverage/delivery evidence,
change-envelope identities, and pinned source-version references.

Each Subscription Version, feed, cursor, and pseudonym namespace binds exactly
one recipient and participant. A bulk tenant flow may create many independent
versions, but a cursor, entity identity, cache, hint, or projection row never
spans recipients.

D1-D7 stay dark behind the external field floor. Only exact Phase 21 activity
and D1 Finance-confirmed balances egress. The feed does not export D2 close
readiness or provider/bank/accounting evidence; re-resolve D3 assessments;
expose D4 compensation, reimbursement-obligation, payment, or payroll meaning;
split a D5 atomic correction/reallocation; combine D6 currencies; or reuse D7
payroll authorization, connections, operations, or evidence.

### Primary-source synchronization evidence

Microsoft Graph separates paginated `nextLink` state from the terminal
`deltaLink`, treats state tokens as opaque, warns that items can replay or
appear on different pages, and returns `410 Gone` when a client must restart
full synchronization. Google Calendar similarly requires the same query shape,
returns removals during incremental synchronization, and uses `410 Gone` when
sync state expires or becomes invalid. Google explicitly describes
timestamp-only synchronization as more error-prone.

- [Microsoft Graph delta query](https://learn.microsoft.com/en-us/graph/delta-query-overview)
- [Google Calendar incremental synchronization](https://developers.google.com/workspace/calendar/api/guides/sync)
- [Google Calendar API error handling](https://developers.google.com/workspace/calendar/api/guides/errors)

The Asym consequence is a no-gap bootstrap generation:

- all snapshot pages read one immutable generation;
- the generation records one atomic `snapshot_through` projection sequence;
- changes after that cut start strictly after the snapshot;
- page cursors resume only the immutable round;
- only the terminal page yields the committed change cursor;
- cursor replay is safe and may replay items;
- expired, incompatible, or scope-obsolete state returns `410 Gone` with an RFC
  9457 `cursor_reset_required` problem;
  and
- resnapshot replaces only the destination's Asym projection namespace, never
  provider-owned notes, tasks, tags, or other CRM work.

The server checkpoint is monotonic, but the cursor is opaque and non-sortable.
Cursor/projection sequence is transport order and cannot be treated as a source
effective date, posting date, correction date, or financial chronology.
Structural completeness at one Coverage Manifest cut and current freshness are
separate axes; `generated_at` proves neither.

Stripe and GitHub both document that webhooks can duplicate, arrive out of
order, fail, or require independent recovery. Microsoft Graph recommends
queueing notifications and acknowledging them promptly because slow endpoints
can be throttled or lose notifications.

- [Stripe webhooks](https://docs.stripe.com/webhooks)
- [GitHub webhook best practices](https://docs.github.com/en/webhooks/using-webhooks/best-practices-for-using-webhooks)
- [GitHub failed-delivery recovery](https://docs.github.com/en/webhooks/using-webhooks/handling-failed-webhook-deliveries)
- [Microsoft Graph notification delivery](https://learn.microsoft.com/en-us/graph/change-notifications-delivery-webhooks)

Signed D8 notifications therefore contain no supporter PII or amounts and are
wake-up hints only. Scheduled cursor pull and reconciliation remain mandatory.
Hint delivery never advances the feed or proves provider application.

### Current authorization and cursor safety

The January 2025 OAuth Security Best Current Practice requires or recommends
exact redirect matching, authorization-code injection defenses, PKCE including
for web clients, audience restriction, sender-constrained tokens where
feasible, and refresh-token replay protection through rotation or sender
constraint. OAuth revocation provides a standard way to invalidate tokens, but
clients must remain prepared for unexpected invalidation and propagation
delay.

- [OAuth 2.0 Security Best Current Practice — RFC 9700](https://www.rfc-editor.org/rfc/rfc9700.html)
- [OAuth token revocation — RFC 7009](https://www.rfc-editor.org/rfc/rfc7009.html)
- [OAuth resource indicators — RFC 8707](https://www.rfc-editor.org/rfc/rfc8707.html)
- [DPoP — RFC 9449](https://www.rfc-editor.org/rfc/rfc9449.html)

Phase 31 consequently uses authorization code plus PKCE `S256`, exact
redirects, minimal supported scopes and audiences, short-lived access tokens,
encrypted refresh credentials, serialized refresh/rotation, explicit
revocation, and capability-gated sender constraint where the provider supports
it. A D8 cursor binds the current authorization epoch and exact query shape but
never grants authority. Every request and queued egress rechecks the current
server-side grant.

Participant, purpose, resource, field, or history expansion requires an
explicit prospective Subscription Version. Contraction denies positive
disclosure immediately, invalidates the prior epoch and cursors, and creates
only affected-recipient revocation work.

### Provider-specific findings

#### DonorHub and TntConnect

- TntConnect assigns downloaded gifts unique IDs and ignores a repeated gift
  ID. Its ordinary date-range workflow looks back roughly three weeks and its
  own guidance recommends periodically downloading a longer interval to catch
  older adjustments. This proves that date-only polling is insufficient.
  [TntConnect gift download](https://www.tntware.com/tntconnect/help/en/pages/gifts-download.aspx)
- TntConnect 3.4 added DonorHub-only OAuth 2.0 and support for adjustments
  outside the requested date range.
  [TntConnect 3.4](https://www.tntware.com/tntconnect/help/en/pages/whatsnew_3_4.aspx)
- TntConnect 4.0 states that ongoing electronic donation inflow requires
  DonorHub.
  [TntConnect 4.0](https://www.tntware.com/tntconnect/help/en/pages/whatsnew-4-0.aspx)
- TntConnect treats downloaded organizational gifts as source-controlled:
  local removal can be reversed by a later download, while organizational
  corrections and deletions come from the source.
  [TntConnect gift correction behavior](https://www.tntware.com/tntconnect/help/en/pages/gifts_edit.aspx)
- DonorHub publicly describes a managed bridge and confirms a developer API
  for querying DonorHub, but its detailed developer documentation is
  access-controlled. Public evidence does not establish an arbitrary-source
  ingestion contract for Asym.
  [DonorHub overview](https://www.tntware.com/donorhub/faqs/en/what-is-donorhub.aspx)
  [DonorHub developer API statement](https://www.tntware.com/donorhub/faqs/en/can-i-programmatically-query-the-the-donation-data-from-another-application-if-so-how.aspx)
- TntConnect stores a local database, supports backups and spreadsheet export,
  and documents that its application password is not file encryption. Asym can
  revoke future access but cannot promise erasure of every local, backed-up, or
  exported copy.
  [TntConnect local security](https://www.tntware.com/tntconnect/help/en/pages/setup_usersloginspasswords.aspx)
  [TntConnect backups](https://www.tntware.com/tntconnect/help/en/pages/file_backup.aspx)
  [TntConnect exports](https://www.tntware.com/tntconnect/help/en/pages/gifts-view.aspx)

The supported product label is therefore **TntConnect via DonorHub**, and it
remains unavailable until TntWare authorizes the exact inbound direction and
the production conformance suite proves identity, correction, deletion,
anonymity, designation access, currency, history, rate, and onboarding
semantics.

#### MPDX

- MPDX synchronizes organization donations daily, warns that current data can
  take up to 24 hours, and says it stopped onboarding additional organizations
  in 2024. [MPDX FAQ](https://help.mpdx.org/article/202-mpdx-faqs)
- Manually adding a donation that already arrives through organization sync
  creates duplicates.
  [MPDX manual donations](https://help.mpdx.org/article/188-adding-donations-manually)
- Organization-sourced donation/contact fields are locked because allowing
  local edits caused old source values to reappear on later synchronization.
  [MPDX synchronization rules](https://help.mpdx.org/article/1021-mpdx-data-sync-rules-for-cru-staff)
- MPDX separates country/currency accounts and warns that a merged balance may
  be inaccurate because organizations process donations on different
  timelines.
  [MPDX multiple accounts](https://help.mpdx.org/article/1367-manage-multiple-accounts)

MPDX is therefore limited to an exact tenant installation already authorized
by MPDX and the organization. D8 does not create a generally available new-org
onboarding path.

### Immutable coverage and change semantics

The **Missionary Support Feed Coverage Manifest** records:

- Tenant, Legal Entity, destination installation and external organization;
- provider product, country/region, and environment;
- recipient, Missionary Support Feed Subject, purpose, and
  Designation/Field Account scope;
- exact authorized resource families and field-set version;
- bounded history lower limit;
- exact ISO currencies;
- projection schema and adapter certification;
- authorization epoch;
- source-policy and source-family coverage watermarks;
- inclusions, exclusions, and known loss; and
- the atomic snapshot-through sequence.

`generated_at` is not proof of completeness. The feed may say **current
through** only when every required source family is caught up to the declared
cut. Phase 14/16 source coverage is propagated through the Phase 21 projection;
Phase 31 does not create duplicate source joins.

Every change carries an immutable event ID, destination-recipient-scoped
entity ID, entity type, monotonic per-entity version, typed operation, safe
source owner/version, exact ISO currency and minor-unit money where relevant,
full current authorized representation, and optional atomic change-group
identity, member count, and membership digest. Operations include at least
upsert, correction, reversal,
supersession, visibility removal, retention removal, and source removal.

Full representation is a property of the disposable projection entity, not
permission to rewrite source history. A monetary correction or reversal
appears as a new immutable occurrence linked to the original. A D5 pair or
other balanced group is delivered wholly in one page and applied atomically; a
group that cannot be proved complete blocks checkpoint advancement.

Consumers:

- deduplicate by immutable event ID;
- compare per-entity versions rather than timestamps or page order;
- apply a complete change group atomically;
- preserve provider-owned fields outside the Asym namespace;
- never infer deletion from absence; and
- replace only the Asym projection namespace during reset.

### Privacy and downstream-retention findings

Authorization and privacy apply before search, enumeration, counts, totals,
pagination, cursor assignment, caching, hint creation, serialization, logging,
or diagnostics.

Internal Party, contribution, Designation, worker, Field Account, settlement,
bank, accounting, payroll, and provider identifiers do not leave Asym. Visible
durable records use pseudonymous references stable only within one destination
and recipient namespace. A private support occurrence may keep the stable
activity identity needed for correction and deduplication but never a stable
hidden Party identity across gifts.

For a private supporter the projection:

- uses the safe label **Private supporter**;
- omits Party identity, contact channels, location, household links, exact
  timestamp, agreement metadata, notes, and correlation keys; and
- uses an adapter-owned non-person sentinel only when an exact certified
  destination schema requires a parent object.

Restricted or high-risk workers are excluded from ordinary activation.
External processing for an alias-only restricted participant would require a
separately ratified Phase 10 safety contract and provider certification.

Recognition does not imply contactability. Phase 14 can authorize safe
recognition while Phase 28 withholds solicitation, email, phone, postal,
export, or external-CRM purposes.

Phase 14's missionary field floor and all seven never-leak fixtures apply over
the full feed history, not only one serialized response. Certification must
exercise snapshots, deltas, revocations, resets, retained destination views,
anonymous crowd-blending, and two-period/cross-view differencing so a sequence
of otherwise safe responses cannot reveal a hidden Party, restricted row, or
pre-filter amount.

A recipient-only revocation envelope names only a pseudonymous object that the
same recipient previously received and reveals no current identity or reason.
It means only that the recipient cannot receive or access that projection
object through the Subscription Version. It does not decide whether the
recipient or provider may retain a local, exported, or backed-up copy and is
not proof of provider erasure. The contract and UI must preserve separate
evidence for future subscription access denied, revocation delivered,
provider-confirmed removed, unsupported removal, and unknown downstream
outcome.

### Quiet UX contract

The feature is absent from normal finance work and off by default under
**Settings → Integrations → Missionary tools**.

Staff:

1. choose a currently production-certified tool;
2. choose eligible Support Assignments and separately authorized recipients,
   purpose, and bounded history;
3. accept safe semantic bundles or narrow them;
4. review exact external organization/profile, masked representative records,
   post-filter counts, separate currency/through dates, omissions, lossiness,
   and residual-copy risk; and
5. activate the prospective Subscription Version.

There is no arbitrary field picker, raw export, custom SQL, formula language,
or typed confirmation ceremony. Activation remains **Preparing initial
snapshot** until the atomic cut is complete.

Top-level states are:

- **On — current through {date/time}**
- **Delayed**
- **Needs attention**
- **Off**

Technical detail separately exposes Asym projection readiness, provider last
request, provider acknowledgment, and provider application only where exact
proof exists. **Synced** cannot collapse these states.

Missionaries receive no setup controls, provider exceptions, cursor detail, or
duplicate balance on the main dashboard. An optional **Connected tools**
setting shows only the tool, categories shared, through time, and support
owner. Material delay may appear as one quiet inline notice near affected
information.

**Stop sharing** first denies new reads and queued egress, then revokes
credentials and hint secrets where supported, records provider removal
requests and evidence, and explains that retained provider/local/export/backup
copies may remain. Reconnect creates a new grant, identity proof, subscription
version, snapshot cut, and cursor namespace.

The complete path must meet WCAG 2.2 AA for keyboard access, focus restoration
after authorization redirects, programmatic status and error identification,
non-color-only state, accessible error summary, reflow, touch targets,
localization, and noninterrupting progress.

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [WAI accessible forms](https://www.w3.org/WAI/tutorials/forms/)
- [WCAG status messages](https://www.w3.org/WAI/WCAG22/Techniques/failures/F103)

### Production certification contract

An adapter is not advertised until tests prove:

1. exact vendor authorization and supported production organization, product,
   version where observable, direction, region, environment, schema/capability
   set, proof owner/date, expiry, and suspension trigger;
2. D1-D7 authority darkness, including no readiness, provider/bank/accounting,
   reassessment, compensation/reimbursement/payment, converted-total, or D7
   payroll-grant leakage;
3. Tenant, Legal Entity, destination, exact single recipient/Support-Feed-Subject,
   purpose, Designation/Field Account, currency, field, history, schema, and
   authorization-epoch isolation, including bulk creation of independent
   subscription/cursor/pseudonym namespaces;
4. no-gap snapshot/change behavior, complete-versus-fresh watermarks,
   resumable paging, and terminal-only change-cursor issuance;
5. duplicate, replayed, reordered, missing-page, crash, expiry, `410 Gone` RFC
   9457 reset, and non-destructive resnapshot behavior without date fallback;
6. old correction, refund, reversal, merge, redesignation, worker exit, and
   scope contraction with append-only occurrences, transport-order discipline,
   and complete unsplit atomic groups;
7. Phase 14 field-floor and seven-fixture parity across snapshots/deltas,
   anonymous/private-supporter unlinkability, cross-period/cross-view
   differencing resistance, and restricted-worker existence-oracle resistance;
8. OAuth redirect, PKCE where supported, least scope/audience, encrypted
   serialized refresh, rotation, current-grant recheck, revocation, reconnect,
   and queued-egress races;
9. provider outage, rate limit, backpressure, tenant fairness, cursor-reset
   storms, privacy-removal priority, and truthful health at certified volume;
10. exact provider identity, correction, merge, removal, anonymity,
    commitment, field, history, and currency semantics, with unsupported and
    lossy meanings disclosed before activation;
11. exact ISO and zero-decimal currencies with integer minor units, no
    floating-point money, and no authoritative converted total;
12. redacted logs, metrics, caches, URLs, hints, errors, traces, and support
    bundles;
13. immediate denial of future receiving/access through the Subscription
    Version after Stop sharing and honest provider/local-copy outcomes;
14. proof that fetch, acknowledgment, revocation delivery, cursor advancement,
    and disconnect never become provider application or erasure without exact
    evidence; and
15. accessible desktop and mobile setup, preview, health, error, and
    disconnection journeys.

### Ratified C-prime-R contract

**C-prime-amended-and-hardened (C-prime-R) — one disposable, rebuildable,
versioned, recipient-, purpose-, Tenant-, Legal-Entity-, destination-, and
Support-Feed-Subject-scoped Missionary Support Feed Projection composed exactly once
from Phase 21’s existing finance-safe Missionary Support Activity Projection
and separately through-dated per-currency Support Balances Projection, with
only separately ratified Phase 28 relationship/contactability resource
families added later; Phase 31 alone owns prospective feed subscriptions,
provider authorization, capability-certified mappings, and a no-gap delivery
contract consisting of a snapshot complete only within one immutable Coverage
Manifest and atomic snapshot-through cut, distinct resumable page cursors, and
an opaque authorization-bound, monotonic-server-checkpoint, at-least-once
change cursor with finite retention and explicit reset, plus only PII-free
signed reconciliation hints where supported; source domains remain
authoritative and the projection remains disposable, while subscription
versions, coverage and delivery evidence, change-envelope identities, and
source-version references are immutable; visible durable records use
destination-recipient-scoped unlinkable references, anonymous or private gifts
retain only occurrence identities required for correction and deduplication
and never a stable hidden Party identity, and authorization and privacy
filtering occur before enumeration, counts, arithmetic, pagination, caching,
hints, or diagnostics; restricted and high-risk workers are excluded from
ordinary activation; tenant-off-by-default guided setup proves the exact
external organization/profile and previews bounded history, permitted semantic
bundles, omissions, lossiness, currencies, coverage, and residual-copy risk;
health truth distinguishes Asym preparation, destination fetch, and
destination application only when proved; Stop sharing atomically denies
future egress and reports downstream removal as confirmed, unsupported, or
unknown without claiming deletion; and TntConnect is supported only through a
vendor-authorized, production-certified DonorHub pathway while MPDX is
supported only for explicitly authorized installed-base organizations—without
raw-table or arbitrary-field access, duplicate source reads, all-history
defaults, cursor-as-authorization, stable anonymous Party identifiers,
privacy-floor overrides, bidirectional writes, duplicate ledgers or CRMs,
date-only recovery, destructive merge, uncontrolled exports, fictional
provider parity, false synchronization or deletion claims, authoritative
converted totals, or any claim that support is available, withdrawable,
payroll-ready, payable, or paid.**

**Binding ownership clarification.** In the quoted phrase “Missionary Support
Feed Projection composed exactly once from Phase 21,” Phase 21 owns the two
named source projections and their closed external field floor; Phase 31 owns
the disposable composite feed, Subscription Versions, Coverage Manifests,
cursors, hints, provider serialization, and delivery evidence. Phase 28 adds
no fields until a separate ratified relationship/contactability family exists.
The quotation does not transfer supporter, contribution, commitment, Field
Account, accounting, migration, payroll, or payment authority.

**Binding protocol clarification.** Each feed namespace contains exactly one
recipient and participant. Completeness is manifest-bounded and separate from
freshness. Cursor sequence is transport order, expired state uses `410 Gone`
with RFC 9457 reset, financial corrections append rather than overwrite, and a
complete atomic group cannot straddle a page or advance a checkpoint partially.
Revocation denies future receiving/access through the Subscription Version;
provider or recipient retention/removal remains independently evidenced.

## D9 ratified direction: optional Approved Support Plans and bounded workspace publication

### Research verdict

The evidence supports one optional organization-approved Support Plan plus one
finite tenant-owned publication profile. It does not support making a support
plan, commitments, a Field Account balance, reserve, runway, or alerts
mandatory for every tenant.

The safe model has five independent authorities:

1. Phase 21 D9 owns the organization-approved planning need.
2. Phase 28 owns the Support-Raising Goal and coaching workflow.
3. Phase 13 and Phase 21 own recorded support activity.
4. Phase 16 owns commitment and expected-support truth.
5. Phase 21 D1 owns the Finance-confirmed Field Account Balance through a
   Support Cycle close.

Equality of amounts never merges these authorities. The Plan may consume safe
references for context but cannot copy or replace their business truth.

### Missions-product and agency evidence

MPDX exposes account balance, monthly goal, activity, commitments, and appeals
as separate dashboard concepts. Its goal visualization separates gifts that
have started from commitments not yet received. This supports distinct cards
and labels, not one blended funded percentage.
([MPDX mobile dashboard, updated 2024-08-22](https://help.mpdx.org/article/1100-mpdx-mobile-dashboard))

TntConnect separately presents monthly goal, normalized pledges, average
monthly giving, and amount to raise. Its gift-download experience reports
account balance as `n/a` when the organization does not support that feature.
That is strong domain evidence that missing or unused balance capability is
not zero.
([TntConnect Analysis View](https://www.tntware.com/tntconnect/help/en/pages/analysis-analysisview.aspx);
[TntConnect gift download](https://www.tntware.com/tntconnect/help/en/pages/gifts-download.aspx))

DonorHub treats accounting-sourced financial information as optional alongside
donation information. Its Financial Accounts target is optional, and its
documented balance is a separate accounting-information construction rather
than a gift counter.
([DonorHub financial information](https://www.tntware.com/donorhub/help/en/pages/financial_information.aspx))

Reliant describes an organization- and local-ministry-approved monthly support
goal covering salary, benefits, ministry costs, education, administration, and
a buffer. IPHC's 2025 policy likewise uses an established organization budget,
separate support-account balance, organization-controlled approvals, and
purpose-specific requirements. These examples prove that organization-approved
planning needs are real and useful, but also that their composition and reserve
rules vary by organization and lifecycle.
([Reliant support guidance](https://reliant.org/help/supporting-missionaries/how-much-financial-support-do-reliant-missionaries-have-to-raise);
[IPHC 2025 World Missions policy](https://iphc.org/missions/wp-content/uploads/sites/2/2025/04/WMM-Policy-Manual-April-2025.pdf))

The sources do not justify copying any one agency's percentage, buffer,
reserve-month threshold, release condition, or compensation rule into Asym.
They justify bounded tenant policy with explicit organization approval.

### Modern CRM publication evidence

HubSpot's current record customization provides administrator defaults, team
views, conditional card display, preview against a record, and bounded
per-user reordering. This is the relevant modern pattern: tenant-controlled
role-appropriate structure plus harmless personal presentation. It is not
evidence for a general financial formula or dashboard-construction language.
([HubSpot Customize records, updated 2026-06-12](https://knowledge.hubspot.com/object-settings/customize-records))

Virtuous recommends role-relevant dashboard widgets and distinguishes project
need, received giving, and recurring support. Its project-statement
documentation also exposes a failure mode Asym must reject: beginning/current
balances may display `0.00` unless an accounting integration exists, while
goal-related recurring metrics require separate project configuration.
Missing-source data in Asym must therefore be absent or explicitly unavailable,
never a convincing zero.
([Virtuous dashboard widgets](https://support.virtuous.org/hc/en-us/articles/360051610971-Which-CRM-Dashboard-Widgets-Should-I-Use);
[Virtuous project statements, updated 2025-07-02](https://support.virtuous.org/hc/en-us/articles/6466181015949-What-is-the-Project-Statements-Tab))

Salesforce's Dynamic Forms guidance warns that conditional hiding is not a data
authorization boundary. D9 consequently requires authorization before query,
enumeration, arithmetic, cache creation, alert evaluation, export, or
diagnostic access.
([Salesforce Dynamic Forms considerations](https://help.salesforce.com/s/articleView?id=platform.dynamic_forms_considerations.htm&language=en_US))

### Resulting optional authority model

The quiet initial state is **Support planning not managed in Asym**. It creates
no Plan record, exception, empty card, zero metric, or alert. A later
activation creates one prospective immutable Approved Support Plan Version for
the exact Tenant, Legal Entity, Support Assignment, purpose, ISO
currency, and applicable Field Account scope.

The Plan owns only bounded recurring and dated organization-approved needs and
one optional same-currency diagnostic reserve target. It does not own or
manufacture:

- Phase 28's Support-Raising Goal;
- Phase 16 commitments;
- Phase 13/21 received activity;
- D1's Finance-confirmed balance;
- D3 assessment truth;
- D4 compensation funding or entitlement;
- reimbursement obligations;
- payroll, payment, bank, or QBO/Xero truth.

An explicit **Create support-raising goal from approved plan** action may
create a separate Phase 28 Goal Version with provenance. Neither side
live-synchronizes.

### Conservative planning calculation

The scratch research's simple raw-balance ratio is deliberately hardened to
reuse D5's close-aware capacity boundary:

```text
Finance-confirmed Field Account Balance
− qualified negative open-cycle Field Account effects not yet in that close
− active non-reusable Field Account Funding Coverage
− active Support Reallocation Coverage not yet replaced by its posted debit
= Finance-confirmed Planning Coverage Base
```

Every deduction is counted once. A posted debit replaces its matching active
coverage; provisional positive support never increases the Base.

```text
Finance-confirmed Planning Coverage Base
÷ positive approved recurring monthly support need
= Balance Coverage
```

The calculation is exact and per ISO currency. It requires a compatible Plan
and finance close, preserves exact source versions and dates, and produces no
result for a missing or invalid denominator. Negative bases become a separately
labelled shortfall. Dated needs are not averaged into recurring need.

Reserve Position has one signed meaning:

```text
Finance-confirmed Planning Coverage Base
− reserve_target_minor_units
= Reserve Position
```

A positive result means above target; a negative result means shortfall. It is
diagnostic only. Commitments are a separate optional forecast and never
increase Balance Coverage or Reserve Position.

### Bounded publication and tenant control

One Support Workspace Publication Profile Version selects only independently
authorized modules for an audience. Guided starting profiles are **Activity
only**, **Goal and activity**, **Balance and activity**, and **Support
planning**. Available modules remain finite: recorded support, approved plan,
Phase 28 goal, Phase 16 commitments, Finance-confirmed balance, Balance
Coverage, and Reserve Position.

Phase 12 capabilities let a tenant authorize administrators, finance staff,
missionary-care staff, fundraising coaches, or one person wearing several
roles. Job titles do not confer authority. No mandatory second approver is
needed because the Plan and Profile move no money.

Missionaries may reorder or collapse authorized cards. A personal preference
cannot widen access, reveal a hidden module, change a formula or source, or
alter another audience.

If balance publication is off, balance and balance-derived cards are off by
default while finance truth remains live. A separately authorized derivative
requires an explicit preview of the financial-inference risk. D9 does not
authorize D8/Phase 31 feed fields.

### Accessibility and quiet UX conclusion

The setup flow asks what the organization uses, who may manage and see it,
previews the exact Missionary/Coach/Finance/Admin experience, and activates one
prospective version. Incompatible modules are unavailable with an in-context
explanation rather than dead switches.

Amount, ISO currency, effective or through date, and plain status remain
visible. Optional **How this is calculated** disclosure carries formula and
provenance detail. Semantic relationships, keyboard access, focus, reflow,
non-color status, and restrained programmatic status messages follow WCAG 2.2.
([WCAG 2.2](https://www.w3.org/TR/WCAG22/);
[W3C information and relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html);
[W3C status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html))

Plan-based alerts are optional and off by default. When enabled, they use one
winning basis, transition deduplication, hysteresis, recovery, and a bounded
reminder cadence. Stale sources suppress a new conclusion and create one
staff-visible freshness exception. Phase 17 owns content and Phase 6 owns
delivery.

### Ratified C-prime-R contract

**C-prime-amended-and-hardened (C-prime-R) — one optional,
organization-approved, immutable prospective Approved Support Plan Version,
defaulting to “Support planning not managed in Asym,” scoped to the exact
Tenant, Legal Entity, Support Assignment, charitable purpose, ISO
currency, and Field Account when applicable; owning bounded recurring and
dated organization-approved needs plus one optional diagnostic reserve target,
while Phase 13/21 received activity, Phase 16 commitments, Phase 21 D1
Finance-confirmed Field Account Balances, D4 compensation funding, and Phase 28
Support-Raising Goals remain independently authoritative; with
purpose-separated, source-versioned Balance Coverage, Reserve Position, and
optional Commitment Forecast projections; one finite prospective tenant-owned
Support Workspace Publication Profile with capability-controlled
administration, production-shaped audience preview, absent-not-zero modules,
harmless personal reorder/collapse, and a binding D1/D6 presentation-only rider
permitting tenants to omit missionary balance publication without changing
finance truth; exact per-currency calculation, compatible-close gating,
append-only correction, and quiet exception-first operations—without arbitrary
formulas or dashboard construction, mandatory commitments or balances, false
zeroes, hidden-source leakage, automatic goal synchronization, cross-currency
totals, retroactive mutation, or any gift, restriction, compensation,
reimbursement, payroll, accounting, payment, public-fundraising, or
D8/Phase31-feed authority.**

## D10 ratified direction — claim-level expense truth and purpose-routed tenant AI

### Research question

D10 tested two linked questions:

1. What is the smallest durable authority in a modern reimbursement product
   when users expect a familiar expense-report experience but finance must be
   able to advance clean work and recover selected exceptions?
2. How can a tenant supply different AI provider credentials and models for
   receipt extraction, expense matching, public-profile drafting, and later
   features without leaking secrets, allowing AI to author truth, or creating a
   feature-local key store for every use?

The research included current first-party documentation from Expensify, Ramp,
Brex, SAP Concur, government substantiation guidance, cloud document-extraction
services, model-provider data controls, OWASP and NIST AI safety guidance, and
the current Core repository.

### Product comparison: report familiarity over item-level truth

| Product    | Current documented behavior                                                                                                              | Durable implication for Asym                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Expensify  | Reports group expenses, while a reviewer can hold or reject selected expenses and advance clean work.                                    | A report is the human envelope; one claim needs independent disposition and recovery.                          |
| SAP Concur | Selected expenses can return in a linked addendum while the rest continue; dependent itemizations remain attached to their source entry. | Preserve claim atomicity, exact lineage, and selective successor recovery instead of reopening a whole report. |
| Brex       | Bulk receipt intake creates individual reimbursements that finance can group, filter, and approve efficiently.                           | Grouping accelerates work but must not manufacture a batch-wide financial fact.                                |
| Ramp       | Related drafts may be grouped for submission while each reimbursement remains independently completeable and reviewable.                 | A mutable organizer is useful; submission must freeze exact claim versions.                                    |

The cross-product pattern is consistent: reports improve human cadence and
review, but approval, payment, and accounting remain separable. D10 therefore
binds the **Expense Claim Version** as the smallest claimant-authored source
fact and the **Expense Report Submission** as an immutable review envelope.

Sources:

- [Expensify — Approve Expenses](https://help.expensify.com/articles/new-expensify/reports-and-expenses/Approve-Expenses)
- [Expensify — Report statuses](https://help.expensify.com/articles/new-expensify/reports-and-expenses/Understanding-Report-Statuses-and-Actions)
- [SAP Concur — Expense report approval](https://help.sap.com/docs/concur-expense/concur-expense-standard-edition-end-user-help/expense-report-approval-overview)
- [SAP Concur — Split report on approval](https://help.sap.com/docs/concur-expense/concur-expense-standard-edition-administration-guides/split-expense-report-on-approval)
- [Brex — Expense reimbursements](https://www.brex.com/support/expense-reimbursements)
- [Ramp — Submitting reimbursements](https://support.ramp.com/submitting-reimbursements/)

### Evidence, itemization, and substantiation

Modern expense tools support several receipt images, unmatched evidence,
itemization, explicit missing-receipt handling, and human resolution of
duplicate candidates. The important negative lessons are equally strong:

- one "primary image" cannot be the only retained/exported evidence;
- a receipt attachment is not automatically sufficient substantiation;
- a duplicate candidate is not a destructive duplicate verdict;
- a shared receipt requires exact coverage, not copied files or inferred
  allocation; and
- claimant, reviewer, payment, and accounting states cannot collapse into one
  report status.

IRS Publication 463 describes the business-purpose, amount, time, place, and
documentary-evidence dimensions that a policy may require. It also recognizes
bounded alternative-evidence cases. D10 models a missing-receipt declaration
as governed evidence rather than manufacturing a receipt.

Sources:

- [Expensify — Attach and edit receipts](https://help.expensify.com/articles/new-expensify/reports-and-expenses/Attach-and-edit-receipts-on-expenses)
- [Expensify — Duplicate expense resolution](https://help.expensify.com/articles/new-expensify/reports-and-expenses/How-to-Find-and-Resolve-Flagged-Duplicate-Expenses)
- [Brex — Receipts for expenses](https://www.brex.com/support/receipts-for-expenses)
- [SAP Concur — Itemize an expense](https://help.sap.com/docs/concur-expense/concur-expense-standard-edition-end-user-help/itemize-expense?locale=en-US)
- [SAP Concur — Duplicate receipt check](https://help.sap.com/docs/CONCUR_EXPENSE/e3c88ad9ff4342849305e7cd9aa9c9d4/e6d8232aaa3a40239f7347431dce0e38.html)
- [IRS Publication 463](https://www.irs.gov/publications/p463)

### Mobile and review UX evidence

Expensify, Ramp, Brex, and Concur all emphasize mobile capture, incomplete
drafts, background processing, and later completion. D10 uses that evidence to
make **Add expense** the primary action, save before extraction, preserve
manual entry, and remove report naming from the one-claim journey.

Finance gets a report-first exception workspace because grouping, filtering,
and bulk actions are valuable at review time. The batch command is still a
contract over exact Claim Versions and dispositions. A mixed confirmation
states its exact consequences rather than displaying a generic **Approve
report** outcome.

Sources:

- [Expensify — Create an expense](https://help.expensify.com/articles/new-expensify/reports-and-expenses/Create-an-Expense)
- [Expensify — SmartScan troubleshooting](https://help.expensify.com/articles/new-expensify/reports-and-expenses/Troubleshoot-SmartScan-Issues)
- [Ramp mobile app](https://support.ramp.com/hc/en-us/articles/5006739016211-Ramp-mobile-app)
- [SAP Concur mobile expense reports](https://help.sap.com/docs/sap-concur/mobile-app-feature-list-by-device-user-guide/expense-reports)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

### AI extraction is suggestion, not authority

Expense products and document-extraction services consistently expose
extracted fields that still require validation. OCR quality varies with image
quality, handwriting, language, layout, and unsupported fields. Duplicate
detection also has false positives and false negatives. D10 consequently
requires:

- immutable input identity and invocation provenance;
- a strict typed output schema;
- deterministic validation of money, currency, date, totals, tax, tips, and
  allocation;
- explicit human confirmation of every material source fact;
- a versioned non-authoritative suggestion;
- no tool, browsing, URL-fetch, code-execution, tenant-search, or write
  capability in receipt extraction; and
- complete manual continuity when the model is missing, unsafe, unsupported,
  unavailable, or wrong.

Cloud extraction APIs are capability evidence, not a reason to make their
provider schemas the expense domain. Azure Document Intelligence and Amazon
Textract both expose provider-native receipt/invoice fields; D10 places those
behind a capability-certified adapter and retains a provider-neutral, exact
Expense Claim contract.

Sources:

- [Azure AI Document Intelligence overview](https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/overview)
- [Amazon Textract AnalyzeExpense](https://docs.aws.amazon.com/textract/latest/dg/analyzing-document-expense.html)
- [Ramp Policy Agent](https://support.ramp.com/policy-agent-overview/)
- [OWASP Prompt Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html)
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)

### Tenant-owned AI flexibility without a key-management footgun

The requested ability to use one key for receipt OCR and another for public
profile drafting is valid, but one `api_key` field per feature is not. D10
ratifies one small shared control plane:

| Record                          | Authority                                                                                                                                                               |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AI Provider Connection          | Stable Tenant-owned relationship to the exact provider account/organization, environment, and compatible region                                                         |
| AI Provider Credential Revision | Write-only encrypted provider authority with masked hint, account proof, rotation/revocation evidence, and cryptographic-erasure state                                  |
| AI Feature Purpose              | Closed code-owned semantic purpose; tenant text cannot invent a new egress authority                                                                                    |
| AI Capability Certification     | Proof that the exact provider/model/region/input/output/data-use combination can serve that purpose                                                                     |
| AI Capability Binding Version   | Immutable prospective purpose route to one exact connection, credential revision, certified model, region, schema/prompt family, data posture, and budget/rate envelope |
| AI Egress Manifest              | Exact authorized source versions/digests, classification, released fields/bytes, purpose, and denial/redaction result                                                   |
| AI Invocation Evidence          | Idempotent immutable request and safe provider/model/version/digest/timing/outcome/cost provenance without secrets or unrestricted prompt/output logs                   |
| AI Suggestion Version           | Feature-domain-owned non-authoritative output with provenance and accepted/rejected/superseded outcome                                                                  |

One connection may serve several separately authorized purposes, while each
purpose may select a different connection, credential, model, region, or
budget. Credential validation never activates a purpose. Saved secrets are not
readable. Arbitrary endpoints, free-form model IDs, tenant system prompts,
browser-side provider calls, and silent provider fallback remain prohibited.

The provider data-use and retention posture is pinned to the Binding Version
and shown before activation because provider terms and enterprise controls
differ. Model-provider documentation is evidence for the capability registry,
not a universal promise that one posture applies to every account or product.

Sources:

- [OpenAI API data controls](https://platform.openai.com/docs/guides/your-data)
- [Anthropic commercial product data usage](https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training)
- [Google Gemini API terms](https://ai.google.dev/gemini-api/terms)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

### Repository and cross-phase audit

The repository audit found:

1. Phase 20 D18 and ADR-0059 already separate report experience, Approved
   Expense Snapshot, Reimbursement Obligation, payment evidence, and accounting.
   D10 is a precision amendment, not a Phase 20 reopening.
2. No production expense runtime exists to preserve. The missionary UI
   `LedgerEntry` type uses display-oriented JavaScript numbers and is prohibited
   as a D10 finance model.
3. Eve's model policy is platform-scoped and has no tenant BYOK lifecycle. It
   may inform shared concepts but is not the D10 credential authority.
4. The existing provider-specific Resend credential column is mutable and must
   not become the generic AI schema. ADR-0029's write-only, revisioned,
   account-proved, rotation/revocation contract is the reusable precedent.
5. Phase 10 already treats AI as an external egress and excludes prohibited
   restricted/care context. A tenant-owned key cannot waive that classification.
6. The dormant `/mc/admin/ai` and `/mc/admin/keys` links are navigation
   placeholders, not an implementation seam.
7. The `document-uploads` storage bucket is public and has a public read policy.
   It is prohibited for receipt evidence. D10 requires a genuinely private,
   Phase-29-compatible byte seam before release.
8. Phase 22 owns biography draft acceptance and publication. It may consume the
   shared AI control plane; Phase 21 owns none of that content truth.
9. Phase 40 remains the generalized AI Operator Workbench and consumes rather
   than replaces the minimum shared execution foundation pulled forward by D10.

### D10 adversarial result

Every requested category has a concern:

| Category                          | Concern? | What could go wrong                                                                                                                      | Severity | Likelihood  | Permanent prevention                                                                                            |
| --------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | --------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | Yes      | Report-wide truth or synchronous/provider-bound OCR blocks clean claims.                                                                 | Critical | High        | Claim authority, derived report state, immutable bindings, typed adapters, manual path.                         |
| Technical debt                    | Yes      | Mutable report rows and per-feature/provider keys duplicate logic and secrets.                                                           | Critical | High        | Separate immutable authorities, one shared control plane, closed purposes, one Phase 20 projection.             |
| Edge cases                        | Yes      | Shared/missing receipts, personal splits, itemization, multi-currency, refunds, mileage/per diem, and offline retries break naive flows. | Critical | High        | Exact typed coverage, conservation, successor versions, private evidence links, certified source kinds.         |
| Footguns                          | Yes      | Report approval, Mark paid, secret readback, arbitrary endpoints, or AI scores create false truth or exposure.                           | Critical | High        | Consequence previews, bounded commands, write-only secrets, certified choices, suggestion-only output.          |
| Tenant safety                     | Yes      | Bytes, keys, jobs, queues, caches, or bulk actions cross Tenant, Legal Entity, claimant, purpose, or region.                             | Critical | Medium-high | Complete structural scope, RLS/reauthorization, scoped idempotency, negative isolation tests.                   |
| Over-engineering                  | Yes      | Workflow/prompt builders, arbitrary marketplaces, universal taxonomies, or AP features overwhelm ordinary work.                          | High     | High        | One claim/report pattern, finite catalogs, guided configuration, external payment/accounting boundaries.        |
| UX/UI and user friction           | Yes      | Report ceremony, repeated review, noisy extraction, and provider jargon delay submission and close.                                      | High     | High        | Capture-first autosave, quiet one-item UX, approve-clean action, purpose cards, progressive disclosure.         |
| Hidden coupling                   | Yes      | Report state owns approval; QBO fields leak into claims; Phase 21 owns generic AI/bio; storage migration changes evidence.               | Critical | High        | Independent authorities, typed handoff, shared AI foundation, domain acceptance, stable byte identity.          |
| Failure modes                     | Yes      | Upload/DB split success, stale approval, provider timeout, or invalid output causes false success or duplicate work.                     | Critical | Medium-high | Idempotency, transactional pinning, CAS, explicit stages, inspect-before-retry, orphan repair.                  |
| Data integrity risks              | Yes      | Lines do not conserve, evidence overlaps, OCR overwrites facts, or snapshots mutate.                                                     | Critical | High        | Exact minor units, immutable versions/snapshots, unique coverage, append-only correction.                       |
| Security and privacy risks        | Yes      | Receipts expose personal/restricted data; secrets leak; document injection gains capability.                                             | Critical | High        | Private storage, classification-gated egress, secret boundary, no tools/network, strict schema, redacted audit. |
| Scalability and performance risks | Yes      | Large files, synchronous OCR, full-history scans, and rate limits fail at month end.                                                     | High     | Medium-high | Bounded async jobs, digests/indexes, pagination, backpressure, quotas, tenant-fair capacity.                    |
| Operational burden                | Yes      | Bespoke prompts, duplicate rotation, provider errors, and opaque review require tribal knowledge.                                        | High     | High        | Guided policies, shared connections, health tests/canaries, normalized errors, manual continuity.               |
| Observability gaps                | Yes      | Staff cannot distinguish upload, extraction, claimant, policy, funding, payment, or accounting delay.                                    | High     | High        | Correlated safe events, owner/reason/age, invocation evidence, protected audit retrieval.                       |
| Dependency and integration risks  | Yes      | Model retirement, changed schemas, region/retention drift, and throttling silently alter behavior.                                       | High     | High        | Capability certification, pinned versions, canaries, circuit breakers, manual fallback.                         |
| Migration and upgrade risks       | Yes      | Provider fields, public URLs, mutable prompts/models, or lossy exports make history nonportable.                                         | High     | Medium-high | Stable opaque IDs, versioned schemas, immutable originals/provenance, portable manifests.                       |
| Other development hazards         | Yes      | Approval/edit races, double submit, replay, zone/rounding bugs, unbounded spend, and weak rollback corrupt evidence.                     | Critical | High        | CAS/uniqueness, idempotency, exact types, outbox, budgets/kill switches, fault/property tests.                  |

### Ratified C-prime-R contract

**C-prime-amended-and-hardened (C-prime-R) — claim-level immutable
Expense Claim truth inside one adaptive report-first experience, with exact
conserved item/split dispositions, clean-claim progression, linked successor
recovery, private many-to-many Receipt Evidence coverage, immutable Approved
Expense Snapshots and supplements, and independently authoritative policy,
Reimbursement Obligation, Field Account Funding Coverage, external-payment,
and Phase 20 accounting truth; plus one shared tenant-owned AI capability
control plane separating write-only encrypted Provider Credential Revisions
from prospective purpose-specific, capability-certified AI Capability Binding
Versions, allowing different connections, credentials, models, regions, and
budgets per use; with classification-gated minimum-data egress, immutable
invocation provenance, suggestion-only OCR and matching, explicit human
confirmation, production-shaped evaluation, and a complete manual path—without
public receipt storage, per-feature key columns, arbitrary endpoints, secret
readback, silent provider fallback, AI-authored financial or publication truth,
destructive report reopening, or report-level paid/synced authority.**

## D11 ratified direction: layered, scope-bounded integrity and cause-owned repair

### Research question and verdict

D11 tested whether Phase 21 should rely on a close-time total comparison, a
large periodic reconciliation sweep, or layered invariant enforcement with one
fresh immutable proof per close.

The evidence rejects both a total-only comparison and a monolithic sweep. A
matching total can conceal duplicate and omitted equal-value occurrences; a
capped or timestamp-bounded scan cannot prove completeness; and a control
position derived as the inverse of the participant total is tautological.

The ratified direction therefore uses:

1. structural write-time invariants;
2. exact command/admission controls;
3. one fresh cursor-fenced Support Cycle Integrity Manifest per close; and
4. workload-shaped scheduled and on-demand re-verification.

Human work remains exception-only. Tenants govern cadence and organizational
review. Mathematical balance, scope isolation, unique source coverage,
immutability, atomic pairs, and mandatory adverse correction are product-owned
and cannot be waived.

### Current ledger and reconciliation evidence

Modern Treasury documents balance by construction, immutable ledger history,
idempotent transactions, atomic multi-entry writes, and version/balance locking
as ledger guarantees. Its prior-state verification guidance shows that
historical positions must remain verifiable against the exact ledger state and
version, not recomputed from mutable current projections.

That evidence supports:

- one semantic idempotency identity per immutable Field Account Occurrence;
- all same-currency Field-Account-side/organization-control-side entries
  committed atomically;
- per-account version fences for concurrent commands and close publication;
- immutable predecessor/correction lineage;
- independently persisted control-side entries; and
- deterministic rebuild plus prior-state verification.

Modern Treasury's account-reconciliation model also distinguishes internal
ledger positions from external evidence. D11 applies that distinction inside
the Field Account subledger without pretending the Field Account is the
tenant's bank account or general ledger.

Sources:

- [Modern Treasury ledger
  guarantees](https://docs.moderntreasury.com/ledgers/docs/ledgers-guarantees)
- [Modern Treasury concurrency
  handling](https://docs.moderntreasury.com/ledgers/docs/handle-concurrency)
- [Modern Treasury account-version and balance
  locking](https://docs.moderntreasury.com/ledgers/docs/lock-on-account-balance-or-version)
- [Modern Treasury prior-state
  verification](https://docs.moderntreasury.com/ledgers/docs/verify-prior-ledger-states)
- [Modern Treasury account
  reconciliation](https://docs.moderntreasury.com/ledgers/docs/account-reconciliation)
- [Modern Treasury reconciliation
  balances](https://docs.moderntreasury.com/ledgers/docs/balances-used-in-account-reconciliation)

Stripe's reporting and bank-reconciliation guidance likewise separates
processor settlement evidence from bank and accounting reconciliation. Stripe
balance transactions and payout evidence can be exact source inputs to Phase 20. They cannot become a live prerequisite or overwrite mechanism for a Phase
21 Field Account close.

Sources:

- [Stripe reporting and
  reconciliation](https://docs.stripe.com/plan-integration/get-started/reporting-reconciliation)
- [Stripe bank reconciliation](https://docs.stripe.com/bank-reconciliation)

### Nonprofit-finance and accounting-product boundaries

Blackbaud's fund-accounting close guidance emphasizes preserving fund balance
integrity through controlled close behavior. Salesforce's accounting
subledger pattern and Virtuous reconciliation guidance preserve a boundary
between source CRM/fundraising activity and accounting-system truth. These are
product-shape precedents, not permission for Phase 21 to become a general
ledger.

D11 therefore proves only Field Account source coverage, balanced operational
occurrences, continuity, and deterministic balance derivation. QBO/Xero and
Phase 20 remain independently authoritative for Accounting Release delivery,
posted books, bank reconciliation, and drift. A tenant may require staff to
review already-persisted accounting evidence before an operational milestone,
but that does not change the Field Account integrity verdict.

Sources:

- [Blackbaud fiscal-year
  close](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/fe/content/en-au/content/fe-close-fiscal-years.html)
- [Salesforce Accounting Subledger
  basics](https://help.salesforce.com/s/articleView?id=sfdo.ASL_Basics.htm&language=en_US&type=5)
- [Virtuous gift
  reconciliation](https://support.virtuous.org/hc/en-us/articles/33916761894925-How-Do-I-Reconcile-Gifts-in-Virtuous-Giving)

### Proportional controls and quiet finance UX

The 2025 GAO Green Book states an updated internal-control framework effective
for fiscal year 2026 and notes that nonprofit organizations may adopt it. Its
control framing supports proportional, risk-responsive controls rather than
performative ceremony.

Sage Intacct's reconciliation experience defaults staff toward unmatched work,
keeps common filters visible, separates permissions, and supports ongoing
soft/incremental review before finalization. Ramp similarly separates
`Needs review`, `Ready to sync`, and completed accounting outcomes while
leaving the accounting system final. NetSuite permits low-friction close
configuration but warns that checking a task does not execute or prove the
underlying work.

The product implication is:

- machine checks prepare the cycle;
- a clean cycle requires one meaningful review and one close action;
- only a real exception asks for human judgment;
- advanced technical evidence stays behind progressive disclosure;
- optional second approval is tenant-controlled and proportional; and
- no manual checkbox, attestation packet, or completed task can substitute for
  financial proof.

Sources:

- [GAO Green Book](https://www.gao.gov/greenbook)
- [Sage Intacct
  reconciliation](https://www.intacct.com/ia/docs/en_US/help_action/Cash_Management/Reconcile/Get_started/about-reconciling.htm)
- [Ramp accounting overview](https://support.ramp.com/overview-of-ramp-accounting/)
- [NetSuite accounting-period
  close](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N1452509.html)

### Security, privacy, and accessibility evidence

OWASP recommends enforcing tenant context at every query and authorization
boundary, using composite tenant-scoped keys, avoiding identifiers as
authorization, and minimizing cross-tenant caches and logs. D11 consequently
requires Tenant, Legal Entity, currency, purpose, account, case, queue, cache,
and notification isolation before enumeration.

The generic Phase 8 operations surface intentionally carries diagnostic state,
counts, and age—never amounts, donor names, or deductibility. D11 follows that
redaction-by-construction principle: Mission Control may show a safe case link
and follow-up state, while protected financial evidence remains in the
authorized Phase 21 surface.

WCAG 2.2 requires review, confirmation, or reversibility for consequential
financial actions. D11 uses a compact review before close, visible focus,
keyboard operation, non-color severity, announced asynchronous state, narrow
viewport reflow, and adequately sized targets. It does not add a typed phrase
or inaccessible evidence table.

Sources:

- [OWASP Multi-Tenant Security Cheat
  Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Multi_Tenant_Security_Cheat_Sheet.html)
- [OWASP Authorization Cheat
  Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [WCAG 2.2 error prevention for financial
  actions](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html)
- [WCAG 2.2 reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- [WCAG 2.2 target-size
  minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)

### Repository and cross-phase audit

The checked-out repository establishes the following implementation-shaping
facts:

1. D1 already makes the Support Cycle Close the only ordinary authority that
   advances the Finance-confirmed Field Account Balance. D11 supplies the exact
   machine proof D1 left underspecified.
2. D2 already uses a `blocked_by_integrity` readiness result, compare-and-swap
   close revalidation, unique source coverage, atomic pairs, and mandatory
   adverse-correction continuity. D11 makes the readiness result disposable
   and puts durable cause/recovery in the Field Account Integrity Case.
3. The existing `packages/api/src/giving/staged-gifts.ts` consistency sweep
   contains capped `.limit(100)` and `.limit(500)` reads without a terminal
   cursor-completeness proof. It is diagnostic precedent only and is
   prohibited as a D11 close or case-clear foundation.
4. The existing generic reconciliation-run migration stores mutable generic
   JSON and permits updates. It cannot represent an immutable Support Cycle
   Integrity Manifest or source-coverage authority.
5. Existing admin reconciliation authorization is broad-role based. D11
   requires the Phase 12 capability contract and exact Tenant, Legal Entity,
   currency, affected-account, and expected-version reauthorization.
6. Existing CRM reconciliation runners show chunking and summary patterns but
   do not prove financial completeness, independent control position, or
   source conservation.
7. ADR-0054 supplies the cross-domain precedent that a domain-owned exception
   may share Mission Control follow-up without giving the task financial
   resolution authority. D11 creates a distinct Phase 21 case, not another
   Accounting Exception Case.
8. Mission Control's current task types and store are contribution-specific
   and perform separate task/link/event writes. They are not a safe D11
   financial authority and need later additive hardening rather than a forked
   task system.
9. Phase 8's general operations surface structurally excludes amounts and PII.
   D11 may contribute safe counts, ages, execution state, and authorized deep
   links only.
10. No production Field Account runtime exists to preserve. D11 can establish
    clean structural invariants without a legacy compatibility layer.

The Nia repository index did not surface the current Phase 21 decision
documents and returned only generic repo guidance. This audit therefore used
the checked-out worktree, exact `rg`, and full file reads as the current
repository authority.

### Resulting repair and containment contract

Repairs are finite and cause-owned:

| Cause                                          | Owning recovery                                                   | What is forbidden                                           |
| ---------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------- |
| Disposable projection drift                    | Deterministic rebuild from immutable sources                      | Editing source or balance rows                              |
| Proved missing deterministic occurrence        | Idempotent replay against exact source/version/remaining coverage | Blind replay or duplicate coverage                          |
| Incorrect source fact                          | Owning domain's append-only correction                            | Phase 21 editing gift, expense, payroll, or lifecycle truth |
| Incorrect posted Field Account effect          | Exact linked reversal/compensating occurrence                     | Deleting or rewriting the original                          |
| Prospective policy/configuration defect        | New effective version                                             | Retroactive mutation                                        |
| Phase 20/QBO/Xero delivery or drift            | D13 Accounting Exception Case and Phase 20 recovery               | Reclassifying it as Field Account imbalance                 |
| Verified storage/migration/platform corruption | Governed engineering recovery with before/after proof             | Direct ad hoc database edit                                 |

Containment stops only the smallest proved unsafe scope. Mandatory adverse
corrections remain appendable. A cross-tenant finding escalates to security
containment rather than an ordinary finance case.

One case clears only after the owning repair completes and a newer terminal
verification proves the cause absent. A follow-up task can stay open after
financial repair; completing the task cannot clear an unrepaired case.

### D11 adversarial result

Every requested category has a concern:

| Category                          | Concern? | What could go wrong                                                                                              | Severity | Likelihood     | Permanent prevention                                                                           |
| --------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------- | -------- | -------------- | ---------------------------------------------------------------------------------------------- |
| Brittleness                       | Yes      | Giant sweeps, provider calls, timestamps, or hot control rows fail under concurrency/outage.                     | Critical | Medium-high    | Partitioned cursor-resumable checks, commit fences, versions, no provider dependency.          |
| Technical debt                    | Yes      | Duplicate formulas, mutable flags, JSON scope, and generic cases make closes irreproducible.                     | Critical | High           | Versioned invariants, structural scope, immutable manifests, typed causes.                     |
| Edge cases                        | Yes      | Late/backdated facts, empty cycles, partial pairs, deficits, ISO exponents, and retries break naive proof.       | Critical | High           | Half-open boundaries, monotonic cursors, atomic pairs, exact versions, append-only correction. |
| Footguns                          | Yes      | Force, variance acceptance, direct edit, or suspense can publish false balances.                                 | Critical | Medium         | No bypass capability; only typed authority-owned repair.                                       |
| Tenant safety                     | Yes      | Scope, queues, caches, cases, or notifications can mix organizations or participants.                            | Critical | Medium         | Complete keys, RLS/reauthorization, scoped idempotency, negative tests.                        |
| Over-engineering                  | Yes      | GL checklists, workflow/rule builders, custom controls, and approval ceremony slow staff.                        | High     | High           | One manifest, guided settings, machine checks, exception-only work.                            |
| UX/UI and user friction           | Yes      | Jargon and attestations cause delay and rubber-stamping.                                                         | High     | High           | One-screen readiness, one close action, direct next step, progressive disclosure.              |
| Hidden coupling                   | Yes      | Close can depend on QBO/Xero, bank, payroll, tasks, or projections.                                              | Critical | Medium-high    | Independent authorities and no shared mutable status.                                          |
| Failure modes                     | Yes      | Partial run, crash, stale preview, ambiguous retry, or rebuild failure creates false green.                      | Critical | Medium         | Terminal completeness, atomic publication, idempotency, inspect-before-retry.                  |
| Data integrity risks              | Yes      | Duplicate/omitted coverage, partial pairs, overflow, mutable history, or tautological control corrupts balances. | Critical | Medium-high    | Independent control entries, uniqueness, checked integers, versions, property tests.           |
| Security and privacy risks        | Yes      | Cases expose gifts, balances, expenses, or restricted-worker data.                                               | Critical | Medium         | Least privilege, pre-enumeration auth, safe tasks, protected audit.                            |
| Scalability and performance risks | Yes      | Full scans and hot locks fail at month end and permit noisy-neighbor starvation.                                 | High     | High over time | Incremental partitions, rotating history, fair queues, checkpoints, backpressure.              |
| Operational burden                | Yes      | Manual tie-outs, tribal repair, and noisy alerts consume finance/engineering.                                    | High     | High           | Automatic evidence, guided repair, quiet digests, deterministic rebuild.                       |
| Observability gaps                | Yes      | Staff lack freshness, scope, cause, owner, cursor, and recovery visibility.                                      | High     | Medium         | Safe IDs, check times, checkpoints, lag/cause/age metrics, immutable timeline.                 |
| Dependency and integration risks  | Yes      | Provider outage/drift falsely blocks or invalidates Field Account truth.                                         | High     | High           | Local proof and independent Phase 20/provider recovery.                                        |
| Migration and upgrade risks       | Yes      | Changed equations or schemas silently reinterpret old closes.                                                    | Critical | Medium         | Versioned checks/manifests, immutable history, cohort proof, re-verification.                  |
| Other development hazards         | Yes      | Races, timezones, double submit, and unsafe repair rollout create rare systemic corruption.                      | Critical | Medium-high    | Concurrency/fault/property tests, canaries, kill switches, no destructive rollback.            |

### Ratified C-prime-R contract

**C-prime-amended-and-hardened (C-prime-R) — layered, exact,
scope-bounded Field Account integrity across structurally isolated Tenant ×
Legal Entity × ISO-currency scopes, using immutable source-addressed balanced
occurrences with independently persisted bounded control-side entries; atomic
same-currency writes, exact source-coverage conservation, semantic idempotency,
checked minor-unit arithmetic, and per-account version fences; one
machine-produced immutable Support Cycle Integrity Manifest over an exact
business-date boundary and captured monotonic ingestion cursor at every close;
workload-shaped incremental verification plus bounded historical
re-verification; smallest-proved-scope containment with mandatory
adverse-correction continuity; and deduplicated cause-owned Field Account
Integrity Cases cleared only by fresh proof after projection rebuild, proved
replay, source-owned correction, prospective configuration, or append-only
compensating occurrence. Staff receive one quiet machine-prepared close action
and exception-only guided recovery; tenants control cadence, authorized
closers, routing, reminders, optional proportional approvals, compatible
presentation, and stricter advisories, but cannot weaken arithmetic, isolation,
coverage, immutability, or correction guarantees. Phase 20, QBO, and Xero
retain independently authoritative accounting delivery and reconciliation
truth, with no manual proof checklist, force close or force balance, tolerance,
plug or generic suspense entry, direct database edit, live-provider dependency,
generic mark-fixed action, mutable history, or tenant-wide freeze for a local
fault.**

## D12 ratified direction: immutable Support Cycle statements with automatic tenant publication

### Research conclusion

The viable statement design is neither a live report nor a Phase 19-style
batch. It is an automatic, post-close document projection over the exact D11
Support Cycle Integrity Manifest, controlled prospectively by the existing D9
Support Workspace Publication Profile.

Mission-agency and nonprofit products support the user expectation behind this
model:

- Mission to North America replaced recurring emailed month-end summaries with
  on-demand portal access and makes its balance cutoff explicit.
- DonorHub separates beginning balance and financial transactions and explains
  that recently dated donations may not yet be included in the posted
  missionary balance.
- MPDX surfaces a balance with donation drill-down and bounded period reports.
- Virtuous provides monthly project statements but also exposes two hazards
  Asym must avoid: an absent accounting source can appear as `0.00`, and
  headline statistics may use a different date boundary from the selected
  statement period.
- Stripe and comparable self-service portals demonstrate one authenticated
  history with repeatable view/download access and optional ready notices
  rather than attachments or staff-mediated copies.

Those products are familiarity evidence, not financial authority. D1, D6,
D9, and D11 impose the stronger Asym contract: a balance is
Finance-confirmed, per currency, independently through-dated,
organization-controlled, and never an availability or payment claim.

Modern Treasury's posted/archived transaction immutability, versioned prior
state verification, and correction-through-reversal model support keeping
closed facts unchanged. Stripe's finalized-invoice and correction patterns
likewise support a single current user-facing artifact with retained prior
evidence and explicit correction lineage. QuickBooks customer statements that
change when underlying transactions change are an unsuitable precedent for an
official finance-confirmed historical Field Account statement.

Section 508, WCAG 2.2, WCAG2ICT, and W3C PDF techniques support an HTML-first
experience with one tagged accessible PDF action rather than a PDF-only
product or a separate “accessible copy.” OWASP tenant and authorization
guidance requires authorization before enumeration and on every artifact
request, tenant-scoped storage/cache/queue identity, private objects, and no
permanent bearer URL.

### Repo congruency findings

The existing architecture already supplies every durable seam:

1. D11 owns close facts and complete exact coverage. A second Phase 21
   statement-facts table would duplicate authority and drift.
2. Phase 18 already owns Approved Data View admission, one immutable Facts
   Package, one logical document, exact current private artifact, accessible
   output, immutable successors, and access evidence.
3. D9 already owns one bounded prospective tenant publication profile,
   guided defaults, sparse authorized overrides, preview, and absent-not-zero
   behavior.
4. Phase 17's `document_artifact_ready_v1` and Phase 6 supply the optional
   protected authenticated notice without making communication document truth.
5. Phase 19 donor runs and Phase 9 donor Giving-tab history are different
   products and must not be reused.
6. Current prototype controls labelled **Available Funds**, **Withdraw**, and
   generic **Download Report** contradict the Phase 21 vocabulary and are
   replacement targets.

The required additive Phase 18 purpose is
`field_account.support_statement@1`. Reusing
`giving.summary.informational@1` would be incorrect because that purpose is
Phase 19's donor/recognition-oriented Support overview and has different facts,
recipient meaning, privacy floor, and correction authority.

### Zero-routine-work publication model

One close transaction commits the D11 manifest plus one durable post-close
source occurrence. Rendering, storage, access, notification, QBO/Xero,
payroll, reimbursement payment, and providers are excluded from that
transaction.

The effective D9 profile then produces one of two terminal outcomes:

- **not authorized for publication:** no Facts Package request, missionary
  module, empty state, count, search hit, setup nag, alert, or notification;
  or
- **authorized for publication:** one post-close idempotent Phase 21 Approved
  Data View deterministically creates the exact Phase 18 Facts Package and one
  semantic generation request.

The ordinary posture is Off until a tenant intentionally activates a
compatible balance-publishing profile. Compatible guided profile presets
preselect **Show support statements** inside the existing activation review,
where the tenant may turn it off. The optional statement-ready notice is Off
by default. Enabling publication is prospective; historical publication
requires one separately authorized bounded preview. Disabling access is
immediate.

A clean cycle asks staff for no recipients, dates, accounts, currencies, rows,
templates, approval, Publish action, render-count reconciliation, retry, or
resend. A release is not acceptable if routine statement administration
remains.

### User and correction contract

The missionary sees one quiet, conditional **Support statements** section.
Each row is one exact Field Account × Support Cycle × ISO-currency logical
document with its period, Finance-confirmed through date, responsive semantic
summary, and one **View or download PDF** action. Prior periods are collapsed;
technical artifact versions are hidden. Authorized use is unmetered.

Monthly is the guided Support Cycle cadence, not a separate statement
scheduler. Biweekly closes produce biweekly statements. Multiple currencies
remain separate exact statements that may be grouped by period but are never
converted or summed.

The statement contains opening, present balance-changing categories, closing,
currency, period, through date, and plain correction meaning. A nonzero
reservation or Reimbursement Obligation may appear only as a separately
labelled open item that states whether it is included in closing balance and
never implies payment or availability. Donor rosters, contact data, payment
instruments, private notes, provider identifiers, and unrelated CRM facts are
excluded.

A later financial correction enters a later qualified cycle; prior financial
facts and artifacts remain immutable. A same-facts accessibility or
presentation repair creates a Phase 18 artifact successor behind the same
logical row. Cross-tenant, wrong-recipient, or integrity-invalid artifacts lose
current access immediately and route to security/integrity containment.

### Primary and official sources

- [MNA Church Planter & Staff Portal FAQ](https://resources.pcamna.org/resource/mna-staff-portal-faq/)
- [DonorHub Financial Information](https://www.tntware.com/donorhub/help/en/pages/financial_information.aspx)
- [MPDX Mobile Dashboard](https://help.mpdx.org/article/1100-mpdx-mobile-dashboard)
- [MPDX Reports](https://help.mpdx.org/article/1253-mpdx-quick-reference-guide-reports)
- [Virtuous Project Statements](https://support.virtuous.org/hc/en-us/articles/6466181015949-What-is-the-Project-Statements-Tab)
- [Modern Treasury Transaction Status and Balances](https://docs.moderntreasury.com/ledgers/docs/transaction-status-and-balances)
- [Modern Treasury Verify Prior Ledger States](https://docs.moderntreasury.com/ledgers/docs/verify-prior-ledger-states)
- [Stripe Status Transitions and Finalization](https://docs.stripe.com/invoicing/integration/workflow-transitions)
- [Stripe Customer Portal](https://docs.stripe.com/customer-management)
- [Intuit statement access and notification settings](https://quickbooks.intuit.com/learn-support/en-us/help-article/customer-statements/access-statements-merchant-service-center/L6nSiSDte_US_en_US)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [WCAG2ICT 2.2](https://www.w3.org/TR/wcag2ict-22/)
- [Section 508 accessible PDF guidance](https://www.section508.gov/create/pdfs/)
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [OWASP Multi-Tenant Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Multi_Tenant_Security_Cheat_Sheet.html)

### Ratified C-prime-R contract

**C-prime-amended-and-hardened (C-prime-R) — one immutable D11
Support Cycle close and Integrity Manifest as the sole Field Account
statement-facts authority, with one durable post-close source occurrence and
one deterministic Phase 21 Approved Data View producing the exact immutable
Phase 18 Facts Package for the code-owned
`field_account.support_statement@1` purpose; prospective tenant-controlled
automatic publication through the existing D9 Support Workspace Publication
Profile, guided compatible balance-profile defaults, no hidden-balance
existence signal, no per-cycle staff work, and optional statement-ready
notices off by default; one quiet HTML-first Support statements history with
one unmetered currently authorized View or download PDF action per exact Field
Account, Support Cycle, and ISO currency; support-cycle cadence,
finance-confirmed through-dates, separately labelled non-balance positions, no
converted total, current authorization on every request, private exact-artifact
access, automatic idempotent rendering and exception-only recovery,
append-only later-cycle financial corrections, immutable same-facts artifact
successors, immediate privacy containment, and independently authoritative
close, document, access, communication, accounting, payroll,
reimbursement-payment, and external-provider truth—without a second facts
store, statement run, scheduler, arbitrary official date range, recurring
approval or Publish action, live historical recomputation, routine attachment,
retroactive mass publication, duplicate user-visible versions, false zero,
donor-PII expansion, or any tax, bank, payroll, payment, ownership,
availability, or withdrawability claim.**

## D13 ratified direction: bounded prospective Expense Governance Profiles

### Research question and result

D13 tested how much expense-policy and review configuration Asym must own after
D10 established claim-level truth. The result is a bounded governance product,
not a universal rules engine:

- a tenant that does not use Asym expenses sees no module, setup nag, queue, or
  warning;
- an enabled Legal Entity starts from one guided policy and one independent
  human reviewer;
- genuinely different relationships, jurisdictions, expense families,
  purposes/projects/grants, or amount bands may receive explicit prospective
  variants;
- exactly one policy applies to every exact Expense Claim Version item or
  split;
- policy requirements and reviewer routing are separate immutable authorities;
  and
- approval remains human, conflict-free, exact in coverage, and independently
  auditable.

The rejected extremes were one fixed policy for every tenant and a free-form
expression/workflow builder. The first cannot represent real missions
operations. The second creates rule-order, loop, migration, explanation, and
support hazards while duplicating the later general workflow boundary.

### Government and missions-sector control evidence

Current U.S. accountable-plan guidance requires a business connection,
adequate accounting, and return of excess reimbursement within a reasonable
period, while leaving the reimbursement arrangement to the organization.
Employee, independent-contractor, and volunteer treatment is not universal.
D13 therefore supplies policy primitives, evidence, and exact provenance; it
does not declare a tenant policy legally sufficient.

Current charity-control guidance likewise expects a written expense policy to
state what may be claimed, what evidence is required, who approves, and when
payment is expected. It rejects self-approval and recommends compensating
independent oversight where a small charity cannot fully separate ordinary
duties.

Reliant's published missions reimbursement materials demonstrate real
variation by expense kind, receipt threshold, ministry purpose, timing,
per-diem treatment, project funding, and supervisor or fund authority. They
also distinguish accountable reimbursement from other potentially taxable
recovery. These are examples of tenant-owned policy variation, not defaults
Asym may impose.

Sources:

- [IRS Publication 463 - Accountable Plans](https://www.irs.gov/publications/p463#en_US_2025_publink100033756)
- [IRS exempt-organization compensation guidance](https://www.irs.gov/charities-non-profits/exempt-organizations-compensation-of-officers)
- [UK Charity Commission internal financial controls](https://www.gov.uk/government/publications/internal-financial-controls-for-charities-cc8/internal-financial-controls-for-charities)
- [UK Charity Commission faith-charity controls](https://www.gov.uk/government/publications/faith-based-charities/managing-faith-charities-as-trustees)
- [Reliant Accountable Reimbursement Plan](https://solomon.reliant.org/plugins/viewsource/viewpagesrc.action?pageId=185927098)
- [Reliant reimbursement standards](https://solomon.reliant.org/plugins/viewsource/viewpagesrc.action?pageId=185927425)
- [Reliant international per-diem approvals](https://solomon.reliant.org/download/export/pdfexport-20260521-210526-2009-2261/RER-187995638-210526-2009-2262.pdf?contentType=application%2Fpdf)

### Modern expense-product evidence

| Product             | Useful current pattern                                                                                                                                     | Hazard D13 must not inherit                                                                                                     |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Ramp                | Guided receipt/memo requirements, amount and role routing, delegation, clean bulk review, and explicit missing-receipt handling                            | Policy reassessment can depend on transaction state; some final-review actions may dismiss remaining requirements               |
| Expensify           | Ordinary and itemized thresholds, category rules, sequential or amount-escalated approval, per-expense holds/rejections, delegation, and report history    | New and Classic documentation differ on whether approver changes mutate pending work; broad admin bypass needs tighter evidence |
| Brex                | Bounded policy dimensions, amount tiers, grouped review, bulk action, immutable predecessor records, and detailed audit events                             | Multiple matching rules can be order-dependent; self-approval protection is not a universal invariant                           |
| SAP Concur          | Submission-time workflow assignment, scoped delegation, cost-object/project review, line-level return, receipt affidavits, and enterprise policy variation | Some configurations auto-resolve self-conflicted steps or have nondeterministic same-level approver selection                   |
| Comparable products | Navan and Airbase reinforce employee-group, department, location, category, project, amount, and sequential-approval patterns                              | Marketing descriptions do not establish an implementation contract                                                              |

The shared safe pattern is progressive disclosure: one guided default for the
common case, bounded variants only where the tenant proves a need, requirements
shown while the claimant enters the expense, and an exception-first reviewer
queue. Reports remain ergonomic containers; exact claims and items remain the
facts.

Sources:

- [Ramp expense-policy setup](https://support.ramp.com/getting-started-with-ramps-expense-policy-setup/)
- [Ramp submission policies](https://support.ramp.com/submission-policies/)
- [Ramp expense review policies](https://support.ramp.com/setting-up-expense-review-policies-for-transactions-and-reimbursements/)
- [Ramp approval matrices](https://support.ramp.com/approval-matrices-setup-and-reference)
- [Ramp delegated approvers](https://support.ramp.com/delegate-approvers/)
- [Ramp reimbursement review](https://support.ramp.com/reviewing-reimbursements/)
- [Ramp missing-receipt handling](https://support.ramp.com/hc/en-us/articles/1500011601642-What-to-do-if-you-re-missing-a-receipt)
- [Expensify Workspace Rules](https://help.expensify.com/articles/new-expensify/workspaces/Workspace-Rules)
- [Expensify approvals](https://help.expensify.com/articles/new-expensify/workspaces/Add-Approvals)
- [Expensify vacation delegates](https://help.expensify.com/articles/new-expensify/settings/Delegate-when-out-of-office)
- [Expensify expense approval](https://help.expensify.com/articles/new-expensify/reports-and-expenses/Approve-Expenses)
- [Expensify receipt attachment](https://help.expensify.com/articles/new-expensify/reports-and-expenses/Attach-and-edit-receipts-on-expenses)
- [Brex Policy Rule Builder](https://www.brex.com/support/policy-rule-builder)
- [Brex approval chains](https://www.brex.com/support/approval-chains)
- [Brex reimbursements](https://www.brex.com/support/expense-reimbursements)
- [Brex security and audit measures](https://www.brex.com/support/brex-security-measures)
- [SAP Concur approver determination](https://help.sap.com/docs/concur-expense/concur-expense-professional-edition-administration-guides/approver-determination)
- [SAP Concur delegates](https://help.sap.com/docs/concur-expense/concur-expense-professional-edition-end-user-help/delegates-overview?version=2026_03)
- [SAP Concur receipt handling](https://help.sap.com/docs/concur-expense/concur-expense-standard-edition-administration-guides/configure-receipt-handling-options)
- [SAP Concur cost-object approval](https://help.sap.com/docs/concur-expense/concur-expense-professional-edition-administration-guides/cost-object-approval?version=2026_03)
- [SAP Concur approval overview](https://help.sap.com/docs/concur-expense/concur-expense-standard-edition-end-user-help/expense-report-approval-overview)
- [Navan expense approvals](https://navan.com/blog/take-control-of-expense-approvals-with-navan)
- [Airbase advanced approvals](https://www.airbase.com/features/advanced-approvals)

### Hardened authority and time model

D13 separates seven concepts that mutable workflow products commonly collapse:

| Authority                                | Time basis                      | Owns                                                                                           |
| ---------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------- |
| Expense Program Activation Version       | prospective activation interval | Whether one Tenant and Legal Entity uses the expense program                                   |
| Expense Policy Cohort Membership Version | prospective membership interval | One claimant's non-retroactive placement into a stable tenant-owned policy cohort              |
| Expense Governance Profile Version       | expense incurred date           | Requirements, evidence, limits, timing, and exception treatment                                |
| Expense Governance Resolution            | immutable evaluation occurrence | The one winning Profile Version for one exact Claim Version item or split                      |
| Expense Approval Route Version           | report submission time          | The finite required review stages and capabilities                                             |
| Approval Assignment Snapshot             | immutable submission occurrence | Exact covered Claim Versions/items and the initially eligible principals or queues             |
| Expense Review Action                    | action time                     | One currently authorized human action after scope, capability, and conflict checks             |
| Expense Policy Decision                  | derived source decision         | The exact final disposition, pinned governance, assignment, review evidence, and any exception |

An Assignment Snapshot explains who was selected; it never grants perpetual
authority. Every review action rechecks the current Phase 12 capability,
Tenant, Legal Entity, exact coverage, and interested-party conflict. A departed
or deauthorized assignee is append-only reassigned. No timeout, notification,
job title, route membership, or stale assignment approves work.

The policy effective interval is selected by the expense's source-owned
incurred date and relationship context. The route is selected when the report
is submitted. A material claim change creates D10's successor Claim Version
and new affected resolution; it does not inherit stale approval.

### Deterministic bounded configuration

D13 permits only code-owned semantic dimensions backed by stable source
identities and versions:

- Tenant and Legal Entity;
- source-owned worker relationship or an explicit Expense Policy Cohort;
- applicable jurisdiction;
- certified expense family;
- purpose, project, or restricted-grant authority; and
- an exact amount band where the chosen route or requirement needs it.

Cohort membership is a separate immutable prospective version. Program
activation pins the eligibility/admission contract and a tested coverage
watermark, not a permanent claimant list; a later eligible claimant follows
the admitted contract without replacing the Activation Version.

The resolver is non-stacking. Code-owned specificity produces exactly one
winner per item or split, independent of database insertion order or admin
drag order. Equal-rank disagreement, missing required context, unsupported
currency, or uncovered positive work becomes an affected-claim
`needs_policy_configuration` exception. It never falls through to an unrelated
default.

Each amount threshold pins an ISO currency, integer minor units, and a closed
basis such as an exact line/split amount or a homogeneous single-currency claim
total. D13 has no report-level mixed-currency threshold and no implicit FX.

The policy catalog is finite and typed. It may require business purpose,
itemization, category/family facts, time/place/attendees, receipts or alternate
evidence, timing, mileage/per-diem evidence, project/grant authority, or a
typed policy exception. It does not accept arbitrary expressions, scripts,
formulas, provider fields, or admin-authored precedence.

### Human-only review without bureaucracy

The ordinary route is one independent authorized reviewer. A tenant may enable
only these additional bounded shapes:

1. manager or project-owner review, with finance added only when required;
2. specialist or restricted-grant review for exact affected coverage; or
3. a named independent board officer, finance overseer, or authorized external
   reviewer for a genuinely small tenant.

Self-approval, AI approval, timeout approval, automatic approval, and silent
fallback to a less-authorized reviewer are prohibited. Deterministic evaluation
may identify clean claims, but only an authorized human action creates an
approved Expense Policy Decision.

The reviewer retains D10's fast **Approve clean claims** action. It previews
exact included claims/items and consequences, then creates independent review
actions and line dispositions. It cannot include missing evidence, policy
exceptions, self-interest, incomplete higher-stage review, stale versions, or
unsupported coverage.

A Reviewer Exception is typed, exact, reasoned, capability-gated, and
independently reviewed where the profile requires it. It preserves the ordinary
D10 terminal disposition vocabulary; it does not create a fifth line status,
waive structural safety, or mutate the Profile Version.

### Quiet claimant, reviewer, and admin experience

The claimant sees only requirements that apply to the current expense. The
ordinary journey remains **Add expense**, attach or declare evidence, fix the
specific issue if any, review, and submit. The interface does not expose rule
trees, accounting mappings, route internals, or irrelevant policy text.

The reviewer sees one queue grouped by action needed:

- ready for ordinary review;
- needs claimant information;
- needs a policy exception;
- waiting for another required reviewer; or
- configuration/authorization blocked.

Each row explains the applicable policy in plain language, exact evidence,
amount and currency, claimant, source purpose, required next action, owner, and
age. Technical identifiers and complete policy provenance remain available in
progressive disclosure.

The admin setup is one short guided review:

1. turn on expenses for the exact Legal Entity;
2. review the default requirements;
3. choose one independent reviewer role or named oversight path;
4. preview representative production-shaped claims; and
5. activate prospectively.

Advanced variants stay collapsed until requested. Before activation, a
simulation identifies uncovered contexts, equal-rank overlaps, changed
outcomes, routing loops, self-interest, departed reviewers, unsupported
currencies, and claims that would become blocked. Clean activation creates no
recurring admin task.

WCAG 2.2's financial/data error-prevention requirement supports one meaningful
review-and-correct opportunity for consequential actions. It does not justify
repeated confirmation dialogs on ordinary edits.

Sources:

- [WCAG 2.2 - Error Prevention (Legal, Financial, Data)](https://www.w3.org/TR/WCAG22/#error-prevention-legal-financial-data)
- [W3C understanding Error Prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html)

### Repository and cross-phase audit

The repository audit established:

1. D1 already sets one authorized reviewer as the ordinary posture and requires
   separate review for self-interest, policy exceptions, and configured
   material or high-risk thresholds. D13 preserves that contract.
2. D10 and ADR-0099 make the exact Claim Version item or split the policy unit;
   a report is only an envelope. D13 therefore has no report-level approval.
3. Claim, Approved Expense Snapshot, Reimbursement Obligation, Field Account
   Funding Coverage, external payment, and Phase 20 accounting remain
   independently authoritative. A route cannot create any of them by itself.
4. Phase 20 consumes only the PII-minimized frozen approved-snapshot lineage.
   Profile content, route topology, assignee identity, tasks, receipts, and
   mutable workflow state remain in Phase 21.
5. The current runtime role enum and broad staff capability set are not an
   authorization seam. D13 requires separate Phase 12 capabilities and exact
   Legal Entity scope before enumeration and again before every command.
6. The existing mutable contribution-approval policy may inform service/view
   parity tests, but its self-approval semantics and mutable policy shape are
   prohibited here.
7. No production Phase 21 expense runtime exists. Implementation may start
   clean behind a Phase 21 public service and must not retrofit the generic
   missionary `LedgerEntry` or its misleading availability UI.

### D13 adversarial result

Every requested category has a concern:

| Category                          | Concern? | What could go wrong                                                                                                      | Severity | Likelihood  | Permanent prevention                                                                                                      |
| --------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------ | -------- | ----------- | ------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | Yes      | Current labels, managers, policies, or report state are treated as timeless authority.                                   | Critical | High        | Stable source IDs, immutable prospective versions, incurred-date resolution, submission snapshots, current auth checks.   |
| Technical debt                    | Yes      | Mutable rules, duplicated route logic, or provider-shaped policy become expensive to explain and migrate.                | Critical | High        | Separate finite domain records, one resolver, one public service, versioned interpreters, documented invariants.          |
| Edge cases                        | Yes      | Late claims, personal splits, shared receipts, changed evidence, delegates, departures, and mixed currencies misroute.   | Critical | High        | Exact item/split coverage, successor versions, typed evidence, append-only reassignment, currency-specific thresholds.    |
| Footguns                          | Yes      | Admin ordering, generic override, self-approval, early bulk action, or timeout falsely approves work.                    | Critical | High        | Code-owned specificity, independent reviewer, scoped exception, clean-only previewed bulk action, no timeout approval.    |
| Tenant safety                     | Yes      | Policies, claims, evidence, queues, reviewers, or bulk commands cross Tenant or Legal Entity boundaries.                 | Critical | Medium-high | Structural scope, RLS/service enforcement, current capability checks, scope-keyed idempotency, substitution tests.        |
| Over-engineering                  | Yes      | A rules DSL, workflow graph, formula builder, or universal taxonomy recreates enterprise expense software.               | High     | High        | Guided default, bounded selectors and routes, certified finite policy primitives, progressive disclosure.                 |
| UX/UI and user friction           | Yes      | Claimants read policies; reviewers reread clean work; admins configure graphs and repeated approvals.                    | High     | High        | Requirement-at-entry, one independent-review default, exception-first queues, clean bulk review, one activation preview.  |
| Hidden coupling                   | Yes      | Policy owns reviewer identity, assignment grants authority, or approval changes funding/accounting/payment truth.        | Critical | High        | Separate authorities and dates; current auth at action; typed downstream handoffs only.                                   |
| Failure modes                     | Yes      | Partial activation, stale approval, orphan reviewer, duplicate command, or failed notification strands or advances work. | Critical | Medium-high | Atomic activation, CAS/idempotency, append-only reassignment, durable queues, explicit owner/reason/age, no notice truth. |
| Data integrity risks              | Yes      | Two policies win, items lose coverage, old approval survives edits, or exceptions silently waive evidence.               | Critical | High        | Unique deterministic resolution, coverage conservation, immutable decisions, successor lineage, typed exceptions.         |
| Security and privacy risks        | Yes      | Broad admins or reviewers can enumerate receipts, claimant data, restricted projects, or other entities.                 | Critical | High        | Least-privilege capability atoms, purpose-bound evidence access, before-enumeration checks, protected audit retrieval.    |
| Scalability and performance risks | Yes      | Full-history rule scans and one global queue fail at month end or create noisy neighbors.                                | High     | Medium-high | Precompiled versions, indexed bounded evaluation, cursor pagination, tenant-fair jobs, production-volume proof.           |
| Operational burden                | Yes      | Every tenant needs consultants to maintain routes, repair assignments, or understand policy conflicts.                   | High     | High        | One guided default, finite variants, activation simulation, deterministic diagnostics, grouped exception ownership.       |
| Observability gaps                | Yes      | Staff cannot tell policy, claimant, reviewer, auth, funding, payment, or accounting delay apart.                         | High     | High        | Cause-labelled state, exact next owner/action/age, safe correlation IDs, immutable review and configuration evidence.     |
| Dependency and integration risks  | Yes      | HR labels, QBO/Xero categories, AI output, or external directories silently become policy or approval authority.         | Critical | Medium-high | Source adapters with stable IDs, certified mappings, no AI approval, provider-neutral governance, drift detection.        |
| Migration and upgrade risks       | Yes      | Mutable policies or opaque expressions make prior approvals unreproducible and exports nonportable.                      | High     | Medium-high | Immutable versions, stable opaque IDs, portable manifests, historical interpreters, prospective change only.              |
| Other development hazards         | Yes      | Submit/activate/approve/reassign races, rounding, timezone boundaries, replay, or weak rollback corrupt decisions.       | Critical | High        | Transactional CAS, exact minor units, half-open intervals, idempotency, outbox, property/mutation/fault tests.            |

### Required production proof

1. Property tests prove one winner per exact item or split independent of
   insertion order, and equal-rank disagreement fails closed.
2. Fixtures cover incurred-date boundaries, time zones, late submissions,
   material successors, split claims, shared evidence, personal portions,
   relationship and jurisdiction changes, and policy gaps.
3. Currency tests cover zero-, two-, and three-decimal ISO currencies and
   prohibit mixed-currency report thresholds or implicit conversion.
4. Race tests cover submit versus activation, approve versus reassignment,
   capability loss, claimant edit, duplicate bulk commands, delegation expiry,
   and reviewer departure.
5. Negative authorization tests cover Tenant, Legal Entity, claimant,
   evidence, purpose/project/grant, currency, queue, cache, and audit
   substitution before enumeration and command execution.
6. Self-interest tests cover one person holding several roles; no job title,
   route membership, named assignment, AI result, or timeout grants approval.
7. Bulk-review tests prove exact consequence preview, clean-only inclusion,
   independent review actions, and unchanged D10 line dispositions.
8. Approved Expense Snapshot tests prove no snapshot or Phase 20 handoff exists
   until every included line is terminal and exact non-overlapping coverage is
   frozen.
9. Phase 20 boundary tests prove receipts, profile content, route topology,
   assignee identity, mutable tasks, and private claimant data do not cross the
   handoff.
10. Public-service and real-database tests prove atomic activation,
    idempotency, CAS, append-only reassignment, and recovery from partial
    notification or worker failure.
11. Representative claimant, reviewer, small-tenant, finance, and admin tests
    prove ordinary tasks complete without reading a rule tree or confusing
    approval with funding, payment, or accounting.
12. Accessibility and low-bandwidth tests cover keyboard, screen reader,
    visible focus, error association, status announcement, 320-CSS-pixel
    reflow, 400% zoom, interrupted upload, offline-safe draft recovery, and
    deterministic retry.

### Ratified C-prime-R contract

**C-prime-amended-and-hardened (C-prime-R) - one quiet, tenant-enabled
Expense Program governed by immutable prospective Expense Governance Profile
Versions: one guided Legal-Entity default plus bounded, explicit relationship-,
jurisdiction-, Expense Policy Cohort-, certified expense-family-,
purpose/project/grant-, and exact-claimant variants; one deterministic,
code-ordered, non-stacking incurred-date winner for every exact Expense Claim
Version item or split; separately versioned finite Expense Approval Routes
resolved into immutable submission-time Approval Assignment Snapshots;
human-only, conflict-free decisions with one ordinary independent reviewer,
conditional project/finance/specialist review, governed delegation and
reassignment, named independent small-tenant oversight, typed missing-evidence
and policy-exception paths, clean-only consequence-previewed bulk approval, and
D10's unchanged line dispositions and append-only successor semantics; with
exact ISO-currency thresholds, production-shaped activation proof,
independently authoritative obligation, Field Account, payment, Phase 20, and
QBO/Xero truth, and one accessible exception-first experience - without admin
rule ordering, an arbitrary rules DSL or workflow graph, implicit FX,
retroactive policy mutation, self-, AI-, timeout-, or automatic approval,
broad evidence bypass, report-level approval, or accounting/payment
authority.**

## D14 ratified direction: file-first organization-card transaction evidence

### Research question and conclusion

D14 tested whether Phase 21 should launch without organization-card evidence,
with one file-first source lane, or with several live issuer/aggregator
adapters. Current expense products confirm that card source evidence reduces
re-entry and prompts timely receipt capture, but they also preserve important
separations:

- card authorization or posted status is not expense approval;
- receipt matching is best-effort assistance unless exact source identity
  proves the relationship;
- cardholder identity may be incomplete or change over time;
- pending amount, merchant, category, or identity may change or disappear;
- personal portions are not business reimbursement and do not prove repayment;
- issuer statement truth is not accounting or reconciliation truth; and
- file, direct-feed, and accounting-feed overlap is an ordinary duplicate risk.

The launch choice is therefore a narrow, optional, CSV-only organization-card
evidence lane over D10's complete manual Expense Claim path. It is not a bank
feed, card issuer, card subledger, generic importer, personal-card browser,
repayment product, or accounting workspace.

### Current product evidence

| Product/source    | Useful current pattern                                                                                                                               | Boundary Phase 21 preserves                                                                                                 |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Ramp              | Separates authorized, cleared, declined, requirements, receipt, approval, and accounting-readiness events; exact splits must equal the source total. | File evidence is source-final only; no imported row becomes approval, payment, or accounting truth.                         |
| Brex              | Pending amounts may change at clearing; itemization and receipt validation are distinct; personal portions remain separately treated.                | D14 keeps source revision, claim facts, and personal treatment separate and conserving.                                     |
| Expensify         | Posted company-card imports, CSV fallback, duplicate warnings, statement matching, and accounting comparison remain distinct.                        | Exact identity is a no-op; overlap is reviewable; Asym never claims issuer or QBO/Xero reconciliation.                      |
| SAP Concur        | Available Expenses can combine several evidence sources while allowing false matches to be separated; Pending Card Transaction remains non-final.    | An Organization Card Transaction Evidence Version is not the Expense Claim and fuzzy matching never consumes either record. |
| QuickBooks Online | Downloaded credit-card rows do not affect the books until matched or categorized.                                                                    | Phase 20 delivery cannot prove native match or final reconciliation.                                                        |
| Xero              | Bank statement lines and account transactions are separate, and native reconciliation remains provider-owned.                                        | D14 and Phase 20 expose source and delivery evidence without inventing a reconciled flag.                                   |

Sources:

- [Ramp webhooks](https://docs.ramp.com/developer-api/v1/webhooks)
- [Ramp pending charges](https://support.ramp.com/pending-charges-faqs/)
- [Ramp split transactions](https://support.ramp.com/splitting-transactions-or-reimbursements/)
- [Brex expense lifecycle](https://www.brex.com/support/managing-your-expenses)
- [Brex receipt handling](https://www.brex.com/support/receipts-for-expenses)
- [Expensify company-card reconciliation](https://help.expensify.com/articles/expensify-classic/connect-credit-cards/Reconcile-Company-Card-Expenses)
- [Expensify duplicate handling](https://help.expensify.com/articles/new-expensify/reports-and-expenses/Why-Expenses-Duplicate)
- [Expensify statement matching](https://help.expensify.com/articles/new-expensify/reports-and-expenses/Statement-Matching-and-Reconciliation)
- [SAP Concur Available Expenses](https://help.sap.com/docs/concur-expense/concur-expense-professional-edition-end-user-help/available-expenses-overview)
- [SAP Concur Pending Card Transaction](https://help.sap.com/docs/SAP_CONCUR/bb83754b1c5541808d50c09901e11475/f42c33d721994fa79e70532f7152e889.html)
- [QuickBooks Online transaction matching](https://quickbooks.intuit.com/learn-support/en-us/help-article/bank-transactions/match-transactions-quickbooks-online/L0MF3Fn6y_US_en_US)
- [Xero bank reconciliation](https://central.xero.com/s/article/Bank-reconciliation-in-Xero)

### CSV-only launch and hostile-file boundary

“Statement/file-first” is the ratified option label; product and domain UI says
**Upload card activity** and **Organization card activity file**. It does not
mean every document format is equivalent.
Launch authority is limited to a bounded machine-readable CSV grammar admitted
through one immutable Organization Card Import Profile Version. A PDF may support
human review but cannot supply financial facts through OCR or AI. XLS/XLSX,
images, OFX/QFX, screen scraping, email-body parsing, and free-form paste remain
unsupported as source truth until a separately certified adapter exists.

Files are untrusted input. Admission requires extension and content validation,
bounded bytes/rows/columns/field lengths, controlled encoding, CSV grammar,
quoting/newline handling, malware controls, deterministic locale/date/decimal/
sign/currency interpretation, safe staging, and formula-injection neutralization
on every later spreadsheet-oriented export. Full PAN, CVV/CVC, PIN, track data,
and authentication secrets are rejected rather than retained.

Sources:

- [RFC 4180 CSV format](https://www.rfc-editor.org/rfc/rfc4180)
- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
- [OWASP CSV Injection](https://owasp.org/www-community/attacks/CSV_Injection)
- [PCI SSC FAQ 1280](https://www.pcisecuritystandards.org/faq/articles/Frequently_Asked_Question/Can-card-verification-codes-values-be-stored-for-card-on-file-or-recurring-transactions/)

### Immutable source and import model

D14 separates:

1. Organization Card Source;
2. Organization Card Import Profile Version;
3. Organization Card Activity File Asset;
4. Organization Card Activity Import Manifest;
5. Organization Card Transaction Evidence Version and typed Organization Card
   Source Adjustment Evidence;
6. immutable source revisions;
7. Organization Card Assignment Version;
8. Organization Card Evidence Coverage;
9. D10 Expense Claim Version and Receipt Evidence;
10. D13 Expense Policy Decision and Approved Expense Snapshot;
11. Reimbursement Obligation, Field Account effect, personal repayment, and
    external payment;
12. Phase 20 Accounting Release and delivery; and
13. issuer settlement, card-liability payment, and QBO/Xero reconciliation.

One manifest atomically records its exact source/profile/file identity, parser
and security provenance, row provenance, classified preview, control totals,
admitted safe occurrences, excluded/no-effect coverage, and row-local
exceptions. Structural failure accepts nothing. A structurally valid manifest
may admit safe rows while preserving invalid rows as an explicit remainder;
its outcome says **Imported with exceptions**, never partially synced.

Exact source occurrence identity is authoritative only inside its exact source
namespace. File convergence is scoped by Tenant, Legal Entity, Organization
Card Source, Organization Card Import Profile Version, and file digest.
Cross-file convergence is authoritative only where the certified export
supplies a stable source occurrence identifier; otherwise exact row identity is
the immutable manifest, row ordinal, and row digest. Similar date, merchant,
amount, card, or OCR can only raise **Possible overlap**. Two genuine
duplicate-looking purchases remain separate unless authorized side-by-side
review establishes one source occurrence.

Accepted evidence is not deleted or rewritten. File corrections, source field
changes, and wrong assignments create append-only revisions or successors;
refunds, reversals, disputes, fees, source removals, and corrections create
typed Organization Card Source Adjustment Evidence.

### Quiet claimant, finance, and admin experience

The first admin import is:

1. identify source;
2. confirm mapping;
3. assign only new safe card identities;
4. review consequences; and
5. import.

Later imports reuse the exact profile and assignments and normally collapse to
**Upload → Review → Import**. The preview distinguishes new, already imported,
possible overlap, conflicting source revision, invalid row, and needs-cardholder
coverage with exact counts and same-currency totals.

Only an assigned charge reported as posted under the pinned Organization Card
Import Profile Version's finality contract and missing D10/D13 facts creates
claimant work. The mobile path starts from one read-only charge and asks for one
receipt photo, one business purpose, conditional requirements only, and an
optional purpose or personal split. Source merchant, amount, currency, date,
and card are not retyped. Offline/interrupted capture preserves the draft.

Finance starts in **Needs attention**, with **All activity** and **Imports**
available for authorized drill-down. Common causes group into one case with
owner, age, affected count, same-currency amount, and next safe action. Healthy
rows create no finance task. **Not my charge** contains claimant exposure and
routes assignment review without deleting source evidence.

W3C's error-identification, error-suggestion, error-prevention, status-message,
reflow, focus, and target-size guidance requires linked text errors, one
review-and-correct opportunity before acceptance, non-color outcomes,
appropriately announced async progress, keyboard/screen-reader operation,
320-CSS-pixel reflow, 400% zoom, and usable touch targets.

Sources:

- [WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification)
- [WCAG 2.2 Error Suggestion](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion)
- [WCAG 2.2 Error Prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html)
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- [WCAG 2.2 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow)
- [WCAG 2.2 Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)

### Repository and cross-phase audit

1. D10 already owns the Expense Claim, Receipt Evidence, claimant confirmation,
   suggestion-only matching, and complete manual path.
2. D13 owns policy, human review, approval, and Approved Expense Snapshot.
3. ADR-0059 and Phase 20 D18 admit only a PII-minimized approved source
   occurrence. D14 files, profiles, manifests, assignments, private evidence,
   unresolved/personal portions, and import exceptions remain Phase 21-only.
4. Phase 20 alone compiles Accounting Releases and delivers to QBO/Xero;
   provider acceptance cannot create issuer settlement or reconciliation truth.
5. Phase 15's offline-gift batches and Phase 30's generic migration/import work
   cannot own or reinterpret D14 organization-card evidence.
6. Phase 3 projection and Phase 12 capability floors apply before file, row,
   card, claimant, count, search, queue, cache, artifact, or audit enumeration.
7. There is no current production Phase 21 expense runtime. D14 can start clean
   without inheriting a generic table importer or mutable card row.

### D14 adversarial result

Every requested category has a concern:

| Category                          | Concern? | Primary permanent control                                                                                                                        |
| --------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Brittleness                       | Yes      | Versioned source profiles, classified preview, drift detection, manual continuity                                                                |
| Technical debt                    | Yes      | One card-specific contract, immutable manifests/revisions, no hidden generic importer                                                            |
| Edge cases                        | Yes      | Typed Organization Card Source Adjustment Evidence, exact intervals, row provenance, same-currency conservation                                  |
| Footguns                          | Yes      | Consequence preview, prospective assignments, restricted bulk actions, append-only repair                                                        |
| Tenant safety                     | Yes      | Structural Tenant/Legal-Entity/source/card/claimant/currency scope and fail-closed projection                                                    |
| Over-engineering                  | Yes      | Optional CSV-only launch; no live-adapter portfolio, issuer ledger, repayment, or reconciliation product                                         |
| UX/UI and user friction           | Yes      | Map once, assign once, camera-first claimant work, cause-grouped exception-first finance                                                         |
| Hidden coupling                   | Yes      | Separate source, claim, approval, obligation, payment, accounting, and reconciliation authorities                                                |
| Failure modes                     | Yes      | Staging, atomic manifest acceptance, idempotency, durable work, truthful counts                                                                  |
| Data integrity risks              | Yes      | Exact identity tiers, immutable amounts, conservation, CAS, append-only correction                                                               |
| Security and privacy risks        | Yes      | Untrusted-file controls, rejection and quarantine of unmasked PAN or sensitive authentication data, private artifacts, no personal-card browsing |
| Scalability and performance risks | Yes      | Bounded streaming parse, indexed identity/candidates, set-based writes, tenant fairness                                                          |
| Operational burden                | Yes      | Reusable profiles, representative preview, cause-level exceptions, readable diagnostics                                                          |
| Observability gaps                | Yes      | Separate correlated states with safe counts, reason, owner, age, watermark, and next action                                                      |
| Dependency and integration risks  | Yes      | Provider-neutral source truth, versioned profiles, artifact/manual continuity                                                                    |
| Migration and upgrade risks       | Yes      | Stable opaque IDs, preserved interpreters, portable manifests, additive readers                                                                  |
| Other development hazards         | Yes      | Server-derived keys, scoped digests, concurrency fences, checked arithmetic, canaries and fault tests                                            |

The detailed required production proof is binding in the
[Phase 21 decision log](./phase-21-field-accounts-decision-log.md#d14--file-first-organization-card-transaction-evidence).

### Ratified B-prime-R contract

**B-prime-amended-and-hardened (B-prime-R) — one optional,
organization-card-only, machine-readable statement/file-first Card Transaction
Evidence product over the complete manual Expense Claim path; using one
Tenant-, Legal-Entity-, Organization-Card-Source-, billing-currency-, and
immutable Source-Profile-scoped staged CSV import lane; with certified or
bounded tenant-reviewed prospective layouts, exact file and source-occurrence
idempotency, overlap-aware classified preview, atomic manifest acceptance with
only structurally safe rows advancing, immutable source revisions and
append-only correction, explicit effective-dated card assignments,
posted/source-final purchases and separately typed adverse evidence, exact
same-currency business/personal/unresolved conservation, secure PAN-minimized
private artifacts, quiet camera-first claimant work, cause-grouped finance
exceptions, and Phase-20-only accounting handoff while issuer settlement,
personal repayment, card-liability payment, external payment, and QBO/Xero
reconciliation remain independently authoritative—without personal-card batch
browsing, pending-as-final evidence, PDF/OCR/XLSX-derived financial truth,
heuristic auto-deduplication, destructive undo, automatic approval or
reimbursement, raw card data, or false synced, paid, settled, available, or
reconciled claims.**

## D15 ratified direction: artifact-always reimbursement handoff

**Status:** Founder ratified C-prime-amended-and-hardened (C-prime-R) on
2026-07-31.

### Decision seam and current evidence

D10 and D13 establish the claim, policy decision, eligible Approved Expense
Snapshot, and exact approved coverage. The core D16 Expense Settlement
Determination establishes the exact remaining Reimbursement Obligation record;
D15 consumes it for handoff and independently evidenced external payment. The
tenant's payroll, accounts-payable, check, or governed manual process executes
payment. Phase 20 D18 separately
admits an approved unpaid obligation and later evidence-qualified
Reimbursement Payment into accounting.

The missing operational bridge is:

```text
Approved Expense Snapshot
  -> Reimbursement Obligation
  -> artifact-always external handoff
  -> tenant payroll/AP/manual execution
  -> exact external payment evidence
  -> External Payment Occurrence
  -> Reimbursement Payment Coverage
  -> Phase 20 accounting projection
```

Current product documentation supports the direction but exposes shortcuts
Asym must reject:

- Expensify supports **Pay elsewhere** for payroll, checks, wires, and other
  internal systems, but immediately marks the report `Paid`. Adopt the
  first-class external lane, not report-level payment inference.
  [Expensify reimbursement methods](https://help.expensify.com/articles/new-expensify/wallet-and-payments/Reimbursement-Payment-Methods)
- Ramp supports external payment, per-entity configuration, and scheduled
  batching. It distinguishes an approved reimbursement Bill from the Bill
  Payment created only for Ramp ACH; outside payment does not sync a payment.
  [Ramp reimbursement setup](https://support.ramp.com/reimbursements-set-up/)
- Brex supports entity-specific cadence, partial reimbursement, grouped
  claimant credits, failure handling, and external handling. Its direct lane
  also demonstrates why funding accounts and claimant banking belong to a
  separate money-movement product.
  [Brex expense reimbursements](https://www.brex.com/support/expense-reimbursements)
- SAP Concur distinguishes file batches, per-payee Payment Demands, provider
  acceptance, funding, paid, aborted, and Client Pay. A generated CSV/IIF/ADP
  file and a sent demand are not beneficiary-receipt proof.
  [SAP Concur Payment Manager](https://help.sap.com/docs/CONCUR_EXPENSE/1f13d54352684d6dba6e65c8c5d75ead/c451750651c31015899fea36a2d5353e.html)
  [SAP Concur payee statuses](https://help.sap.com/docs/CONCUR_EXPENSE/bb83754b1c5541808d50c09901e11475/2ec7715d01514150b5b6766bfe367b40.html)
- Gusto exposes separate created, calculated, submitted, processed, paid,
  partially-reversed, reversed, cancelled, and processing-failed events.
  `payroll.paid` says credits were generated and payments will be made; it is
  not automatically claimant-bank receipt.
  [Gusto payroll events](https://docs.gusto.com/embedded-payroll/docs/payroll-events)
- QBO Bills/BillPayments and Xero invoices/Payments are accounting facts, not
  proof the claimant received money. D15 must not create another accounting
  doorway.
  [Intuit bill payment](https://developer.intuit.com/app/developer/qbo/docs/learn/learn-basic-bookkeeping/pay-bills)
  [Xero Payments API](https://developer.xero.com/documentation/api/accounting/payments)
- Direct-transfer APIs require beneficiary details, funding, scheduling,
  FX/fees, cancellation, failure, return, and settlement operations. D15 may
  consume qualified evidence from an externally executed payment but cannot
  create, fund, schedule, or send it.
  [Airwallex Transfers API](https://www.airwallex.com/docs/api/payouts/transfers)
  [Stripe Connect payout accounts](https://docs.stripe.com/connect/payouts-bank-accounts)

### Hardened contract controls

1. **Artifact access is non-executing.** Creation, preview, protected audit
   retrieval, reference download, and redownload do not claim or execute a
   lane. One immutable **Reimbursement Execution Claim** owns each exact,
   non-overlapping obligation-coverage slice for one executable lane.
2. **Handle outside Asym is complete and quiet.** It is the guided default, not
   a degraded fallback. A separate audited Handoff Attestation records who
   delivered which immutable package to what external process, when, and under
   which method/reference. It still does not prove payment.
3. **Automated lanes stop before execution.** A payroll operation may update
   only an exact certified unprocessed payroll/pay-data draft. An AP operation
   may create only a reviewable pre-execution input. Certification must prove
   both the API operation and the tenant's effective provider automation cannot
   approve, calculate, submit, schedule, fund, or send money.
4. **Two owners remain separate.** The route pins the exact
   `external_execution_owner`; it separately references Phase 20 D17's
   `accounting_posting_owner`. Neither determines the other.
5. **Profiles are prospective and bounded.** A route is scoped by Tenant,
   Legal Entity, claimant relationship authority, reimbursement family,
   provider organization/product, country, environment, participant, currency,
   cadence/cycle, certified operation, and external execution owner.
6. **Route succession is coverage-scoped and proof-gated.** A successor may
   cover only exact residual work proved not released or not executed.
   `outcome_unknown` never falls back automatically or expires by timer.
7. **Payment is separately evidenced.** An External Payment Occurrence pins
   exact source/provenance, authoritative payee, amount, ISO currency,
   source/provider/observed/recorded times, evidence strength, and exact
   Reimbursement Payment Coverage. Staff attestation remains visibly
   **Payment recorded by finance** and is never silently upgraded.
8. **Coverage conserves every amount.** One payment may cover several
   obligations and one obligation may receive several payments. Each atomic
   occurrence is homogeneous by Tenant, Legal Entity, payee, payment currency,
   and external execution owner. Cross-payee batches are envelopes only. Exact
   coverage plus a typed residual conserves the payment; unknown residual, FX,
   payee, currency, or amount fails closed.
9. **Corrections and adverse facts append.** An obligation change after release
   never edits the package or external draft. Failure, return, partial
   reversal, reversal, repayment, correction, and reissue append linked
   evidence. Reissue starts only from exact coverage proved unpaid or returned.
10. **No beneficiary-bank custody.** The package uses purpose-minimized
    external payee/participant references and omits receipts unless an exact
    certified purpose requires a separately authorized projection.
11. **The package can exist without a claim.** Creation, preview, protected
    retrieval, download, and redownload create zero Execution Claims. Explicit
    release atomically creates the unique claim and exact Reimbursement
    Handoff Coverage for only the released units.
12. **Phase 20 D17 assigns the future occurrence owner.** A D15 profile may reference an
    already-applicable source-family posting-ownership contract but cannot
    assign or infer the posting owner of a future atomic payment. Phase 20 D17 does so
    only when that source or payment occurrence exists.
13. **Draft readback is handoff evidence only.** Provider draft/input readback
    cannot become External Payment Occurrence evidence unless a separately
    certified payment-state contract supplies that later fact. QBO/Xero
    Accounting objects remain Phase 20-only.
14. **Repayment remains accounting-dark.** Repayment-related evidence may stay
    linked to a return, correction, or recovery case, but D15 does not create a
    claimant-repayment occurrence, negative payment, Field Account effect, or
    Phase 20 source family.

### D15 ruthless adversarial review

Every requested category has a concern:

| Category                          | Concern? | What could go wrong / why it matters                                                                                                                                                                  | Severity | Likelihood  | Permanent fix or prevention                                                                                                                                              |
| --------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Brittleness                       | Yes      | A whole-obligation route breaks on partial provider acceptance, departed workers, closed cycles, unsupported countries, missing IDs, and provider outages.                                            | Critical | High        | Coverage-scoped exclusivity; complete manual default; exact product/country/environment/operation certification; immutable prospective profiles and portable artifacts.  |
| Technical debt                    | Yes      | Copying D7 creates two incompatible operation engines; one universal payout model collapses compensation, reimbursement, AP, and payment meaning.                                                     | High     | High        | Reuse only the idempotency/fence/readback kernel; keep separate packages, commands, coverage, and statuses; closed lane catalog, no provider DSL.                        |
| Edge cases                        | Yes      | Partial/grouped/installment payment, mixed salary/reimbursement, former claimant, check void, over/under-payment, FX, return, reissue, or partial provider results break one-to-one assumptions.      | Critical | High        | Exact many-to-many coverage, homogeneous occurrences, typed residual, authoritative payee identity, exact FX evidence, append-only adverse and reissue occurrences.      |
| Footguns                          | Yes      | Download, `Mark paid`, blind retry, route switching, name-only payee matching, or mixed bulk selection can duplicate payment or lie to claimants.                                                     | Critical | High        | Non-executing artifact access; one execution claim; literal actions; consequence preview; CAS/idempotency; inspect-before-retry; proof-gated residual succession.        |
| Tenant safety                     | Yes      | Credentials, participant mappings, artifacts, queues, callbacks, caches, or evidence could cross Tenant, Legal Entity, provider organization, environment, payee, or currency.                        | Critical | Medium-high | Structural scope on every identity/key/query; authorization before enumeration; destination pinning; RLS/server checks; tenant-scoped work; negative substitution tests. |
| Over-engineering                  | Yes      | A payout API, beneficiary vault, AP ledger, bank connection, universal provider schema, rules engine, or custom status builder recreates payroll/AP/accounting.                                       | High     | High        | Three product choices only; manual default; code-owned statuses; no money movement, bank custody, AP aging, payroll calculation, outbound Bank Match, or QBO/Xero write. |
| UX/UI and user friction           | Yes      | Per-claim dialogs, repeated entry, provider jargon, false ETAs, noisy notifications, and desktop-only tables cause bypass and claimant confusion.                                                     | High     | High        | Saved defaults; auto-shaped homogeneous groups; one group review; exception-first responsive workspace; one stage/next action; calm claimant copy and a11y gates.        |
| Hidden coupling                   | Yes      | Field Account coverage, payroll completion, provider draft, QBO/Xero posting, or bank reconciliation becomes a surrogate for payment or another authority.                                            | Critical | High        | Independent obligation, funding, handoff, provider-operation, payment, accounting, and reconciliation records; separately pinned execution and posting owners.           |
| Failure modes                     | Yes      | Timeout-after-write, callback loss, stale version, revoked grant, closed cycle, partial success, unrecorded manual processing, evidence conflict, or later return creates duplicates or silent limbo. | Critical | High        | Durable operation/outbox; exact readback and convergence; `outcome_unknown` quarantine; kill switch; visible owner/age/next check; residual-only recovery.               |
| Data integrity risks              | Yes      | Overlapping coverage, mutable rows, weak IDs, rounding, fuzzy matching, incomplete residual, or destructive correction duplicates or erases obligations.                                              | Critical | High        | Immutable content-addressed packages/manifests; exact minor units; scoped stable IDs; unique active execution coverage; CAS; conservation; append-only correction.       |
| Security and privacy risks        | Yes      | Packages, receipts, payroll references, uploaded proof, tokens, bank data, CSV formulas, public links, or email attachments can expose or weaponize sensitive data.                                   | Critical | Medium-high | PII-minimized formula-safe artifacts; no bank data; encrypted private storage; short-lived access; malware checks; access audit; least privilege; redacted telemetry.    |
| Scalability and performance risks | Yes      | Month-end peaks, thousands of obligations, per-line calls, provider limits, readback storms, and large-tenant starvation delay reimbursement cycles.                                                  | High     | Medium-high | Bounded batch envelopes with per-unit outcomes; set-based writes; resumable work; provider backpressure; tenant fairness; indexed current-uncertain readback.            |
| Operational burden                | Yes      | Too many profiles, recurring manual evidence, and one exception per line burden finance and support or require developer intervention.                                                                | High     | High        | Guided defaults/presets; reusable prospective profiles; healthy automation stays quiet; grouped attestation with exact per-payee coverage; cause-grouped repair.         |
| Observability gaps                | Yes      | Staff cannot tell ready, downloaded, handed off, draft-accepted, processing, unknown, partially paid, returned, or accounted states apart.                                                            | High     | High        | Correlate obligation, coverage, package, profile, operation, provider, evidence, payment, accounting, and exception; show cause, owner, age, strength, and next action.  |
| Dependency and integration risks  | Yes      | APIs, scopes, products, entitlements, regional behavior, status vocabulary, batch limits, and tenant automations change; sandbox success falsely implies safety.                                      | Critical | High        | Exact time-bounded capability certification, including downstream automation; contract/production-shaped tests; drift probes; kill switches; manual continuity.          |
| Migration and upgrade risks       | Yes      | Provider/schema/status changes replay obligations, lose IDs, reinterpret history, or dual-deliver in-flight work.                                                                                     | High     | Medium      | Version schemas, compilers, capability mappings, and derivations; preserve readers/raw evidence; prospective cutover; move only proved-unreleased coverage.              |
| Other development hazards         | Yes      | Two staff release concurrently; authority changes after preview; evidence races correction; timezone picks wrong cycle; webhook/poll/job/deploy races violate exclusivity.                            | Critical | High        | Serializable/CAS release fence; release-time reproof; exact cycle/timezone; semantic idempotency; transactional outbox; backward-compatible events; fault/race tests.    |

### Ruthless synthesis and release proof

Proceed only as a **handoff-and-evidence product**, not a payment product:

1. freeze the independent authorities and closed terminology;
2. establish exact obligation coverage, route exclusivity, residual succession,
   and conservation;
3. ship the complete artifact/manual lane, explicit Handoff Attestation, and
   truthful finance/claimant states;
4. extract only the safe D7 provider-operation kernel;
5. certify payroll/AP operations individually, including tenant-specific
   downstream automation behavior;
6. add ambiguity-safe readback, partial outcomes, corrections, returns, and
   reissue; and
7. publish only the established Phase 20 Accounting-Ready Expense Handoff.

Release is blocked until tests prove that approval, Field Account Funding
Coverage, package creation/download, Handoff Attestation, provider-draft
acceptance, payroll calculation/submission/completion, payslip, Accounting
Release, QBO/Xero readback, and bank reconciliation each fail to create
claimant-paid truth without exact qualified payment evidence. Property tests
must conserve partial, grouped, cross-report, mixed-compensation,
multi-payment, FX, residual, return, reversal, and reissue scenarios.
Concurrency/failure tests must prove that staff races, retries, callbacks,
polling, timeout, job replay, and deployment rollback cannot dual-deliver.

Representative finance staff and missionaries must consistently distinguish
**Approved**, **Prepared for external processing**, **Accepted by payroll/AP**,
and **Payment confirmed**. Failure of that comprehension test blocks release.

### Ratified C-prime-R contract

**C-prime-amended-and-hardened (C-prime-R) — one immutable,
content-addressed, schema-versioned, PII-minimized, artifact-always
Reimbursement Handoff Package for exact Reimbursement Obligations, with one
immutable Reimbursement Execution Claim assigning every exact,
non-overlapping obligation-coverage unit to exactly one prospective Tenant-,
Legal-Entity-, claimant-relationship-, reimbursement-family-,
provider-organization/product-, country-, environment-, participant-,
ISO-currency-, cadence/cycle-, certified-operation-, and
external-execution-owner-qualified lane while separately pinning, never
inferring, Phase 20 posting ownership; a complete quiet `Handle outside Asym`
default with an explicit Handoff Attestation and executable release distinct
from non-executing creation, preview, protected audit retrieval, reference
download, and redownload; only capability-certified payroll or AP
pre-execution draft/input operations whose exact endpoint and effective tenant
automation cannot approve, calculate, submit, schedule, fund, or send money;
D7 operation-kernel reuse without compensation, reimbursement, or payment-truth
conflation; separately authoritative provider readback or exact staff-attested
External Payment Occurrence evidence with explicit evidence strength; exact
partial, grouped, many-to-many, mixed-compensation, cross-report, FX, residual,
failure, return, partial-reversal, reversal, repayment, correction, and reissue
coverage; append-only ambiguity-safe inspect-before-retry and proof-gated
residual-only route succession; Phase-20-only QBO/Xero accounting delivery; and
one quiet, accessible, exception-first finance and claimant-readable
experience—without direct money movement, beneficiary-bank custody, an AP
aging or payroll engine, a generic payout/workflow/status API, dual delivery,
blind retry, fuzzy payment matching, report-level `Paid`,
accounting-record-as-payment inference, or any claim that approval, Field
Account Funding Coverage, artifact access, Handoff Attestation, provider-draft
acceptance, scheduling, payroll completion, payslip, Accounting Release,
QBO/Xero readback, or bank reconciliation proves claimant payment.**

## D16 ratified direction: purpose-separated advances and claimant repayments

**Status:** Founder ratified C-prime-amended-and-hardened (C-prime-R) on
2026-07-31.

### Decision seam

D10/D13 own claim-level expense truth, the Approved Expense Snapshot, and exact
approved coverage. Core D16 settlement owns establishment and append-only
succession of the exact remaining Reimbursement Obligation. D14 owns exact
organization-card source evidence, including personal/nonbusiness coverage.
D15 consumes the obligation and owns external handoff and independently
evidenced payment. None owns these reverse-flow questions:

1. Did the organization merely authorize an advance, or did an external
   process actually issue it?
2. Could the authoritative claimant use it for the approved expense purpose?
3. Which exact approved expense coverage did the advance economically satisfy?
4. Does an unused advance, personal card portion, or payment overage require
   source correction, no return, an external return request, or specialist
   treatment?
5. What source-qualified evidence proves money was actually returned?

One mutable claimant balance cannot answer those questions without conflating
source, organization policy, legal authority, money movement, Field Account
capacity, payment, accounting, and reconciliation.

### Current official and product evidence

- U.S. accountable-plan treatment separates business connection, adequate
  accounting, and return of excess amounts. Its 30/60/120-day examples are
  U.S. reference presumptions, not universal product deadlines.
  [IRS Publication 463](https://www.irs.gov/publications/p463)
- Exempt organizations may involve employees, officers, volunteers, and other
  relationships. Phase 21 therefore pins a source-owned relationship version
  instead of inferring authority from the `missionary` role or portal access.
  [IRS exempt-organization officer guidance](https://www.irs.gov/charities-non-profits/exempt-organizations-compensation-of-officers)
- Economic benefits involving officers, directors, trustees, disqualified
  persons, or related parties can require conflict-safe correction beyond an
  ordinary principal return, including externally determined interest in some
  cases. Phase 21 routes those cases and may record separately certified
  specialist evidence, but never calculates, imposes, or adjudicates the
  correction amount.
  [IRS intermediate-sanctions guidance](https://www.irs.gov/charities-non-profits/charitable-organizations/intermediate-sanctions-excess-benefit-transactions)
- Wage recovery and deduction authority varies materially by jurisdiction and
  by whether the amount is bona fide advance principal, interest, a fee,
  property damage, or another cause. U.S. federal guidance supplies only a
  baseline, and Canadian federal guidance applies to federally regulated
  employment. These sources demonstrate complexity rather than a universal
  prohibition or authorization, so payroll deduction cannot be a universal
  Asym action.
  [U.S. DOL wage deductions](https://www.dol.gov/agencies/whd/fact-sheets/16-flsa-wage-deductions)
  [Canadian federal pay and deductions](https://www.canada.ca/en/services/jobs/workplace/federal-labour-standards/pay-deductions.html)
- SAP Concur models advances as amounts issued before expense reporting and
  later applied to reports rather than ordinary reimbursements. That supports
  exact application coverage while leaving organization policy in control.
  [SAP Concur cash advances](https://help.sap.com/docs/CONCUR_EXPENSE/1c6701a5b9ea4cc69eee62d00f2cf326/31b68c9b3fbd499d8cbaeec021cd00f8.html)
- Ramp and Brex demonstrate useful partial and external repayment workflows.
  Their `Mark as repaid`/`Mark as paid` shortcuts are not strong enough for
  Asym: staff evidence must stay visibly weaker than qualified external proof.
  [Ramp employee repayments](https://support.ramp.com/employee-repayments/)
  [Brex employee repayments](https://www.brex.com/support/employee-repayments)
- Expensify validates a complete outside-platform payment lane but also shows
  why report-level `Mark as paid` collapses evidence and economic identity.
  [Expensify payment workflow](https://help.expensify.com/articles/new-expensify/wallet-and-payments/Pay-Expenses)
- Financially consequential requests need review and correction; status,
  errors, focus, reflow, and repeated information must remain accessible.
  [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)

### Binding research conclusions

1. **One quiet surface, two independent policies.** Expense Advance and
   Claimant Repayment activation may differ. Both are off by default per Tenant
   and Legal Entity; an off tenant receives zero optional-policy UI or
   operational noise. Neither optional policy gates the core claimant-
   reimbursement Settlement Determination, Reimbursement Obligation, typed
   residual, or separately tenant-authorized Funding Coverage partition.
2. **Authorization is not issuance.** An Expense Advance Authorization Version
   records only organization authority. A source-qualified Expense Advance
   Issuance Occurrence owns the actual external economic fact.
3. **Issuance is not Advance Application Readiness.** This canonical predicate
   is the precise interpretation of D16's `claimant-use readiness`: provider
   acceptance, check creation, or accounting is insufficient unless the pinned
   source contract proves that exact issuance may satisfy the approved expense.
   It does not claim general cash availability or withdrawability.
4. **Settlement is atomic and core.** One Approved-Expense-Snapshot-rooted
   serializable Expense Settlement Determination creates any exact, optional-
   policy-qualified Advance Applications and only the remaining Reimbursement
   Obligation, typed residuals, and separately tenant-authorized ordinary
   reimbursement Funding Coverage. With Advance policy off, the application
   partition is zero. Creating gross liability and reducing it later risks
   double reimbursement.
5. **Field Account capacity is reserved explicitly under its own authority.**
   For optional advance-funded capacity, the exact approved funding component of
   the Expense Advance Authorization Version creates purpose-typed non-reusable
   Funding Coverage before reuse; later settlement references it and never
   duplicates it. For ordinary claimant reimbursement, a separate tenant
   funding policy supplies authority and the core settlement may materialize the
   exact compatible Funding Coverage even while both optional policies are off.
   Neither source grants itself authority, and an Advance Application cannot
   fulfill coverage. Only a qualified Field Account Effect under the policy-
   pinned recognition contract can fulfill or adversely correct it.
6. **Source residual is not debt.** Unused advance, personal card coverage, and
   reimbursement overage enter an authorized Claimant Repayment Decision. Only
   `request_external_return` creates an operational Requirement.
7. **Responsibility is proved separately.** Organization-card assignment,
   personal classification, portal role, or worker page cannot identify the
   person responsible. One immutable Repayment Subject Determination pins the
   source evidence, responsible Party, relationship/jurisdiction authority,
   conflict/dispute route, actor, and version. Fraud, dispute, merchant error,
   and organization-use paths run first.
8. **Occurrence and evidence stay separate.** One external economic return has
   one stable Claimant Repayment Occurrence and zero or more source-labelled
   observations. Corroboration never creates a duplicate or silently upgrades
   evidence strength.
9. **Correction after return preserves history.** A later source correction
   opens a Repayment Restitution Review; it cannot silently offset another
   reimbursement, compensation, requirement, or Field Account capacity.
10. **Payroll and setoff fail closed.** Phase 21 never initiates them. An
    externally executed result remains dark unless a separately certified
    contract proves exact authority, components, execution, outcome, and Phase 20 D17
    ownership.
11. **Insiders route conflict-safely.** Source-identified insider,
    related-party, or private-benefit cases require independent specialist
    handling; ordinary self-approval cannot close them.
12. **Source-final means currently admissible.** The current pinned source
    version must pass its source-family finality contract and compare-and-swap
    reproof at the Decision instant. A later correction remains a valid
    append-only fact and triggers cause-owned review.
13. **Phase 20 accepts a closed catalog only.** Separately certified advance
    issuance and approved-expense application, source-qualified Claimant
    Repayment Occurrence with exactly one immutable `cash_claimant_return` or
    `expense_advance_return` family, and cause-linked correction occurrences may
    cross under accountant-confirmed policy and an independent Phase 20 D17 owner. Policy, Requirement, task, residual, raw evidence,
    dispute, restitution review, and Field Account reservation remain
    accounting-dark. A Requirement becomes a receivable only under a separately
    accountant-certified policy/source contract; the later cash claimant return
    and expense advance return remain distinct typed occurrences.
14. **Launch is artifact/evidence complete without money movement.** `Handle
outside Asym` is the permanent complete lane. D16 does not copy D15's
    provider operation portfolio, hold claimant bank details, or create a
    collections product.
15. **Claimant language advances only with proof.** **Advance being processed**
    precedes qualified issuance/readiness; **Advance to account for** follows
    it; **Finance asked you to return** appears only after the authorized
    Decision. **Return recorded by finance** stays weaker than **Return
    confirmed**.

### Exact invariants

```text
gross approved reimbursable amount
  = Expense Advance Application
  + new Reimbursement Obligation
  + policy-authorized nonpayable disposition
```

```text
issued advance
  = applied-to-approved-expense coverage
  + externally returned coverage
  + policy-permitted carry residual
  + unresolved residual
```

```text
Claimant Repayment Occurrence
  = exact Claimant Repayment Coverage
  + typed unapplied residual
```

Every source-qualified occurrence carries exactly one immutable source-owned
`return_family`: `cash_claimant_return` or `expense_advance_return`. The family
is never inferred from sign, predecessor, Requirement, memo, account, or
downstream posting recipe. An expense advance return pins the exact Expense
Advance Issuance Occurrence root and unused-advance coverage. A genuine family
reclassification appends a correction of the original plus a new non-overlapping
occurrence rather than retagging history.

Each application and return uses one exact ISO settlement currency and checked
integer minor units. Coverage is immutable and non-overlapping; corrections
append inverse or successor facts. A different incurred/source currency
requires immutable source and settlement amounts, externally owned conversion
authority/rate, rounding, and residual rather than an Asym rate or converted
grand total.

### UX and operating conclusion

The claimant receives no permanent repayment balance. Active work appears in
existing Tasks and contextually in the claim flow, with completed history under
progressive disclosure in **Advances & repayments**. The only ordinary actions
are **View return instructions**, **Share return evidence**, and **Ask finance
to review**.

Finance defaults to **Needs attention** and groups exact homogeneous causes.
Its explicit actions are **Record advance issuance**, **Apply to approved
expenses**, **Request external return**, **Record return evidence**, **Correct
classification**, **Ask claimant for information**, and **Inspect external
outcome**. The consequential request screen shows claimant, Legal Entity,
source cause, amount, ISO currency, policy basis, follow-up date, recipient,
and notification consequence. Routine notes and corrections add no ceremony.

No surface says **Debt**, **Collections**, **Available balance**, **Repay now**,
**Deduct from payroll**, generic **Paid**, **Settled**, or **Reconciled**. One
initial notice plus tenant/user-controlled reminders or digest replaces red
urgency styling, countdowns, and multi-channel notification storms.

### Production proof conclusion

Release requires:

- authority tests across authorization, issuance, readiness, application,
  Decision, Requirement, Occurrence, evidence, accounting, and reconciliation;
- conservation property tests for partial, multi-report, multi-advance,
  grouped-return, residual, FX, dispute, return, and correction paths;
- serializable settlement and concurrency tests with D15 release and Support
  Cycle close;
- pinned-source-version admissibility, CAS reproof, and Repayment Subject
  Determination tests for D14/D15 candidates;
- evidence-conflict, returned-payment, and post-return restitution tests;
- complete Tenant/Legal-Entity/claimant/relationship/purpose/currency/policy/
  artifact/evidence/coverage substitution tests;
- payroll, setoff, money-movement, Field Account, accounting, bank, tax, and
  legal-authority negative tests;
- PII minimization, private evidence retrieval, retention/hold, redacted
  telemetry, and access-audit tests;
- representative claimant and finance comprehension tests;
- keyboard, screen-reader, focus, error-prevention, reflow, zoom, non-color,
  announcement, and touch-target tests; and
- production-shaped support-cycle/month-end load and tenant-fairness tests.

### Ratified C-prime-R contract

**C-prime-amended-and-hardened (C-prime-R) — one optional, off-by-default,
Tenant- and Legal-Entity-owned Advance and Claimant Repayment evidence
contract, exposed through one quiet experience but compiled into independently
activatable prospective Expense Advance Policy and Claimant Repayment Policy
versions, each pinning source-owned claimant relationship,
applicable-jurisdiction determination, purpose and source family, ISO currency,
effective interval, organization authority, substantiation and evidence
requirements, and external handling rules; immutable Expense Advance
Authorization versions distinct from source-qualified Expense Advance Issuance
Occurrences and their evidence observations; claimant-use readiness proof
before any advance can satisfy expense coverage; one
Approved-Expense-Snapshot-rooted serializable Expense Settlement Determination
that atomically conserves exact approved coverage into non-overlapping
same-currency Expense Advance Applications, the remaining Reimbursement
Obligation, typed residuals, and any tenant-enabled non-reusable Field Account
Funding Coverage without mutating source truth or adding a routine staff step;
source-final and responsibility-proved Claimant Repayment Decisions whose
`request_external_return` disposition alone creates an operational Claimant
Repayment Requirement rather than adjudicated debt; exact Claimant Repayment
Occurrences separated from source-labelled evidence observations and applied
through many-to-many non-overlapping coverage with typed residual, failure,
return, correction, dispute, and post-return restitution review; a complete
`Handle outside Asym` lane, evidence-strength-aware status, conflict-safe
insider/private-benefit routing, payroll and setoff fail-closed behavior, exact
externally owned FX evidence, a closed Phase 20 source catalog with
independently assigned Phase 20 D17 posting ownership, and calm role-scoped accessible
mobile UX—without card assignment implying responsibility, authorization or
provider acceptance implying issuance or claimant use, personal/nonbusiness
classification implying debt, one mutable claimant balance, direct money
movement, personal bank or card custody, payroll deduction, automatic
reimbursement, compensation, or Field Account netting, gift, deposit, pledge,
or commitment funding inference, AP aging, collections, dunning, interest,
penalties, tax or worker-classification adjudication, a generic `Mark paid` or
`Mark repaid`, destructive edits, fuzzy payment matching, or any claim that a
request, acknowledgment, notification, staff task, artifact, provider draft,
payroll record, QBO/Xero entry, Accounting Release, or bank reconciliation
proves money returned.**

**Binding D16/D23 precision.** The contract's optional qualifier applies only
to Advance- and Claimant-Repayment-specific policy, facts, commands, and UI.
The Approved-Expense-Snapshot-rooted settlement, remaining Reimbursement
Obligation, typed residuals, and separately tenant-authorized ordinary
reimbursement Funding Coverage are core even when both optional policies are
off. Advance-funded coverage is authorized and created from the exact approved
component of an Expense Advance Authorization Version before reuse; the later
settlement references but never duplicates it. Ordinary claimant-reimbursement
coverage instead receives authority from its separate tenant funding policy and
may be materialized by the core settlement. Neither record supplies its own
authority, and neither optional family may gate the core partition.

## D17 ratified direction: reconciled Field Account opening positions and operational cutover

**Status:** C-prime-amended-and-hardened (C-prime-R) ratified by the founder as
Phase 21 D17 on 2026-07-31.

### Why this seam is still open

D1 defines recurring finance-closed Support Cycles after a prior balance
exists. D6 requires immutable currency-scoped Field Accounts. D11 verifies
each close against its prior position. None establishes the first position for
an organization that already has worker support balances in a legacy portal,
finance workbook, or accounting report. Phase 30 may own migration transport
and review tooling, but its roadmap boundary correctly requires Phase 21 to
own the typed admission command and forbids direct balance-scalar writes.

The production scenario is ordinary rather than exceptional: a ministry may
have a legacy dashboard total, a different finance-reconciled total, incomplete
historic gift/assessment/reimbursement detail, accounting already posted in
QBO or Xero, and a late correction discovered after go-live. Starting at zero,
reconstructing unsupported history, or continuously mirroring the accounting
system would each create a different falsehood.

### Current primary evidence

- Fragment's current ledger migration guide distinguishes a historical import
  from a balance import. It recommends the latter when history is large,
  inconsistent, incomplete, or includes manual payments; it requires a
  specific go-live timestamp, balanced offset entries, handling in-flight
  items, and validation after import.
  [Fragment import guidance](https://fragment.dev/guides/import-data)
- Xero defines a conversion date as the opening-balance date and recommends
  placing it immediately after the date through which the prior system was
  balanced. That supports an exact drained boundary rather than an ambiguous
  calendar label.
  [Xero conversion-date guidance](https://central.xero.com/s/article/Setting-your-conversion-date-US-GL)
- QuickBooks describes an opening balance as a summary of transactions before
  the chosen tracking date and warns that the cutoff for separately imported
  history must prevent double counting. This is accounting guidance, not
  permission for QBO to become Field Account authority.
  [QuickBooks opening-balance guidance](https://quickbooks.intuit.com/learn-support/en-us/help-article/product-setup/enter-opening-balances-accounts-quickbooks-desktop/L4PfiNhRx_US_en_US)
- Modern Treasury's current ledger guarantees require per-currency balance,
  auditable versions, immutability, idempotency, atomic writes, and isolation;
  its prior-state guidance shows why late backdated facts need preserved
  versions rather than mutable starting numbers.
  [Modern Treasury ledger guarantees](https://docs.moderntreasury.com/ledgers/docs/ledgers-guarantees)
  [Modern Treasury prior-state verification](https://docs.moderntreasury.com/ledgers/docs/verify-prior-ledger-states)
- Stripe's current migration guidance calls for an explicit plan, timeline,
  hard cutover, and batched activation. The exact Stripe product does not
  define Phase 21, but the operational lesson supports a reviewed boundary and
  mapping evidence rather than fuzzy continuous adoption.
  [Stripe Connect migration guidance](https://docs.stripe.com/connect/migrate-to-stripe)
- Current embedded-import products converge on machine-prepared mapping and
  validation with a human review surface only when errors remain. Dromo exposes
  a distinct `NEEDS_REVIEW` outcome; OneSchema uses a spreadsheet-like review
  step with inline correction. That supports a quiet clean path plus one
  exception-focused grid rather than mandatory row-by-row confirmation.
  [Dromo import-result guidance](https://developer.dromo.io/getting-started/headless)
  [OneSchema review guidance](https://docs.oneschema.co/docs/4-review-finalize)

### Options for the founder ruling

#### Option A-prime — Fresh start at zero

Leave all prior support balances and history outside Asym and begin every
Field Account at zero. This is mechanically small but would misstate active
worker support positions and force finance to retain a permanent shadow
spreadsheet.

#### Option B-prime — Reconstruct the complete historical subledger

Import every historic gift allocation, assessment, compensation effect,
expense, transfer, and correction as canonical Phase 21 activity. This is
appropriate only when an exact source adapter can prove every semantic and
identity. Making it the default would fabricate missing policy/source truth,
duplicate prior accounting, and turn migration repair into the launch path.

#### Option C-prime — Reconciled immutable Opening Position plus bounded exact history — Founder-selected

Admit one balanced, source-covered, per-currency Opening Position at a reviewed
operational boundary. Detailed history is optional and becomes canonical only
when a certified adapter proves exact semantics, identities, currencies,
coverage, and non-overlap. Otherwise it remains clearly labelled reference
evidence and never becomes reconstructed gift, receipt, assessment, expense,
compensation, or accounting truth.

#### Option D-prime — Continuously mirror the legacy system or QBO/Xero

Use an external current balance as the live Field Account balance. This seems
convenient but makes Phase 21 mutable, timing-dependent, provider-shaped, and
coupled to accounting configuration. It contradicts the settled separation of
Field Account, accounting, payroll, payment, and reconciliation authority.

### Recommended hardening

The hardened contract is one **source-covered, per-currency immutable Field
Account Opening Position** derived from one precedence-explicit **Opening
Source Package**, with a complete **Opening Coverage Manifest** for each whole
Tenant × Legal Entity × ISO-currency activation cohort. One package may contain
multiple authorized source artifacts, but it must name the reconciled source
of position, each supporting artifact, their precedence, exact digests, parser
and mapping versions, complete account census, source and target control
totals, differences and authorized dispositions, source watermarks or frozen
snapshot boundaries, actor, and final reproof. The system must never average,
fuzzily merge, or silently prefer conflicting sources.

The core conservation rule is:

```text
reconciled boundary position
= balance-bearing certified exact history
+ residual immutable Opening Position
```

Every pre-cutover source fact is assigned exactly one non-overlapping manifest
disposition: `exact_history`, `opening_residual`, `reference_only`,
`intentional_exclusion`, or `unresolved`. `unresolved` blocks activation.
`intentional_exclusion` requires an explicit reason and proof that the fact is
not balance-bearing. Reference-only history is structurally incapable of
affecting balances, support activity, receipts, statements, notifications,
expenses, compensation, accounting, payroll/AP, or payment. If certified exact
history covers the entire position, the residual is zero and no artificial
zero-dollar Opening Position occurrence is created.

Each nonzero residual Opening Position is a balanced Phase 21 occurrence
between the exact Field Account and a typed organization-control opening
counter-entry. It is not a mutable balance scalar, gift, assessment,
reimbursement, compensation event, or general-ledger entry. The equation is
proved independently for every Field Account and currency and again against
the cohort control totals; an aggregate tie cannot hide an account-level
misallocation. A zero residual is recorded only in manifest coverage. A legacy
negative position cannot become a negative Field Account, be clamped to zero,
or receive a plug: it opens a blocking exception for an organization-authorized
disposition or an exact external obligation/arrears reference under the
applicable settled authority. Inactive, departed, retired, or successor
accounts follow D5 lifecycle and exit-disposition truth. A fresh tenant
receives a quiet proved no-prior-position path and sees no migration controls
in ordinary operation.

Before activation, staff may replace disposable staging and use chunked,
resumable, non-authoritative shadow comparison to review only exceptions and
control totals. Activation requires source freeze-or-drain evidence, explicit
classification of in-flight work, a final bounded inspection, permission and
scope reauthorization, and one short Asym-side compare-and-swap authority
fence. Asym must not claim an atomic lock over a legacy vendor, spreadsheet, or
bookkeeper it cannot control; the truthful proof is **No known overlap in the
inspected scope** plus a post-activation overlap-and-gap monitor. Shadow
calculation never creates dual authority, and the complete cohort may be
staged in chunks while only the immutable generation/pointer change is atomic.

After activation, a late pre-cutover fact is first resolved against its prior
manifest disposition. Only a position-changing fact creates an idempotent,
cause-linked, append-only Opening Position Correction and manifest successor,
with independently preserved source-effective, discovery, and record times.
It never edits the opening occurrence, reopens the legacy writer, silently
replays history, suppresses a known adverse fact, or creates a duplicate effect.

The Opening Position is accounting-dark. Prior QBO/Xero entries remain
external historical truth. Any separately proved unposted accounting gap is
handled only by Phase 20 D17 posting ownership and its gap-only backfill rules.
Phase 30 supplies import mechanics but cannot weaken Phase 21 conservation,
scope, evidence, activation, or correction invariants.

### Quiet UX conclusion

The staff path should be titled **Start Field Accounts**, with the audit detail
label **Field Account Opening Position**. It has four progressive steps:
provide the source package and exact coverage; match the complete
account/currency census; review only exceptions and control-total differences;
then review effects and non-effects before **Start Field Accounts**. Clean rows
collapse into control totals; unmatched accounts, currency conflicts, missing
evidence, in-flight work, and differences receive one owner and next action.
Staff may save and resume, replace staging before activation, reuse but
revalidate mappings, and download a formula-safe error file. No routine
row-by-row approval, generic `Import as-is`, `Ignore errors`, or accounting
jargon is required.

The final-action copy must say: **This establishes starting balances. It does
not create donations, receipts, emails, accounting entries, payroll,
reimbursements, or payments.** A representative clean summary is: **1,240
starting balances in USD, included through June 30, 2026 at 11:59 PM
America/New_York. 1 difference needs review.** Consequential review and a final
confirmable action satisfy error-prevention needs without requiring a second
approver; the tenant may enable separation of duties, but the product default
is one currently authorized finance actor whose exact scope is reauthorized at
activation.

Before the first ordinary D11 Support Cycle close, missionaries see only calm
source-labelled truth such as **Starting balance confirmed through June 30,
2026**. After that close, the normal **Finance-confirmed through ...** language
replaces it and the opening disclosure moves to history. Optional,
privacy-filtered evidence-only history is tenant-controlled and appears under
**Earlier activity from [source] — reference only**, followed by an **Asym
activity begins ...** divider. It cannot look like new Asym gift activity or
claim that support is available, owned, payable, payroll-ready, or paid. Staff
see the manifest and balanced organization-control counter-entry only through
progressive disclosure.

### Additional current evidence used for adversarial hardening

- Planning Center's current nonprofit import flow uses stable remote IDs,
  source-labelled imports, mapped previews, visible errors, and a commit step;
  donation receipts are deliberately disabled for imported history. Its People
  import also makes blank-field semantics explicit and supports replacing a
  pre-commit file. These are useful UX patterns, but Phase 21 must not inherit
  the product's broad post-import undo semantics after immutable opening truth
  has been activated.
  [Planning Center donation-history import](https://help.planningcenter.com/en/154395-import-donation-history.html)
  [Planning Center People CSV import](https://help.planningcenter.com/en/138558-import-a-csv-file-in-people.html)
- Virtuous separates rows that need matching, need an update decision, or are
  ready to import. That supports a quiet exception-first review surface. Its
  bulk-update guidance also demonstrates why blank overwrites and create paths
  without duplicate checks must be rejected rather than copied.
  [Virtuous match/review categories](https://support.virtuous.org/hc/en-us/articles/6164198344205-Match-Needed-Update-Needed-Ready-for-Import)
  [Virtuous bulk-update guidance](https://support.virtuous.org/hc/en-us/articles/360059931992-How-Can-I-Bulk-Update-Records-Using-an-Import-File)
- Salesforce's migration guidance emphasizes inventory, dependency order,
  external identifiers, validation, and exception reporting. Phase 21 narrows
  those generic practices into owner-domain commands and a complete
  per-currency coverage proof rather than a generic CRM import.
  [Salesforce data-migration best practices](https://help.salesforce.com/articleView?id=000326326&language=en_US&mode=1&type=1)
- WCAG requires identified errors and an opportunity to review, confirm, and
  correct consequential financial or data submissions. This supports a final
  activation review, not confirmation prompts on every harmless staging edit.
  [WCAG error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)
  [WCAG error prevention for legal, financial, and data actions](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html)
- OWASP recommends allowlisted file types, content/signature checks, generated
  names, size limits, malware scanning, private storage, least privilege,
  deny-by-default authorization, per-request authorization, tenant context in
  every query/cache/storage key, and security-event logging without leaking
  secrets or sensitive content. Opening-source files are financial evidence
  and must use those controls rather than the repo's current public upload seam.
  [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
  [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
  [OWASP Multi-Tenant Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Multi_Tenant_Security_Cheat_Sheet.html)
  [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)

### Ruthless adversarial review of founder-selected C-prime

Every requested category has a material concern before hardening. The table
states the failure in plain language and the permanent product contract that
prevents it; none is deferred to staff memory or a runbook-only workaround.

| Category                          | Concern? | What could go wrong                                                                                                                                                                                                                                              | Why it matters                                                                                                      | Severity | Likelihood     | Permanent fix or prevention                                                                                                                                                                                                                                                                                            |
| --------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | Yes      | A single-file, single-date, or one-giant-transaction design breaks when finance has several disagreeing sources, late events, an unfreezable legacy writer, or a large cohort.                                                                                   | A partially successful start could create two authorities or an unprovable balance.                                 | Critical | High           | Use a precedence-explicit multi-artifact Opening Source Package, exact timestamp/cursor or frozen-snapshot boundary, chunked resumable staging, in-flight classification, one short CAS fence, and overlap/gap monitoring.                                                                                             |
| Technical debt                    | Yes      | A second importer, duplicate reconciliation engine, generic permission, or migration-only balance table would fork Phase 21 and Phase 30 behavior.                                                                                                               | The two paths would drift and every future change would require parallel repair.                                    | High     | High           | Phase 30 owns replaceable transport and mapping UI; Phase 21 owns typed admission, conservation, activation, and correction. Reuse canonical identities, policy readers, job/idempotency seams, and add explicit Phase 21 D17 capabilities.                                                                            |
| Edge cases                        | Yes      | Multiple sources, zero or negative legacy positions, inactive/departed workers, orphaned IDs, reused names, refunds in flight, redesignations, assessment reversals, three-decimal currencies, DST, and late backdated facts can all defeat a happy-path import. | A rare case can still misstate a worker's position or silently put a fact in the wrong period or account.           | Critical | High           | Require a complete cohort census and explicit disposition for every account and source fact; exact ISO minor units; source timezone/cursor; no fuzzy mapping; D5 lifecycle handling; negative-position exception handling; and append-only late-fact correction tests.                                                 |
| Footguns                          | Yes      | `Import as-is`, `Ignore errors`, blank-as-delete, name-only matching, mutable mappings after review, or a fake zero opening can let one click corrupt truth.                                                                                                     | Finance staff may reasonably trust a polished preview even when its assumptions changed.                            | Critical | High           | Fail closed on unresolved rows or changed inputs; digest and version source/parser/schema/mapping; require explicit nonzero difference disposition; reprove at activation; make zero residual manifest-only; never offer destructive bypass actions.                                                                   |
| Tenant safety                     | Yes      | An artifact, job, preview, cache, idempotency key, service-role query, or correction could cross Tenant, Legal Entity, purpose, account, or currency scope.                                                                                                      | This leaks sensitive financial data and can move one organization's opening truth into another's ledger.            | Critical | Medium-high    | Encode all scope dimensions structurally in rows, object paths, jobs, caches, and uniqueness constraints; authorize before enumeration; deny by default; use private evidence access; and run service-role plus negative-substitution tests for every seam.                                                            |
| Over-engineering                  | Yes      | A universal migration DSL, live QBO/Xero mirror, generic workflow engine, multi-master sync, or complete-history requirement would solve hypothetical cases and make launch fragile.                                                                             | Staff would face more configuration while developers inherit a permanent integration platform inside Phase 21.      | High     | Medium-high    | Default to one residual opening occurrence and a small certified exact-history adapter contract; keep fresh tenants quiet; use bounded source-family adapters; do not build dual write, generic workflow, live mirrors, or arbitrary formulas.                                                                         |
| UX/UI and user friction           | Yes      | Row-by-row approval, manifest jargon, noisy banners, unclear through dates, weak mobile layouts, color-only errors, or history that looks like new donations will confuse staff and missionaries.                                                                | Confusion at the financial starting point destroys trust and can cause a wrong activation or support inquiry surge. | High     | High           | Use the four-step `Start Field Accounts` flow, exception-only review, plain consequence copy, save/resume, accessible reflow/keyboard/error semantics, quiet through-dated missionary truth, and privacy-filtered reference history behind progressive disclosure.                                                     |
| Hidden coupling                   | Yes      | If opening truth depends on QBO/Xero availability, one importer library, Phase 30 storage shape, D11 publication, or downstream notifications, any change can alter balances or replay side effects.                                                             | A migration adapter or provider upgrade would become a financial-event change.                                      | Critical | Medium         | Define an owner-domain Opening Source Package and manifest independent of transport/vendor; make canonical admission side-effect-dark; keep Phase 20, Phase 30, D11 publication, receipts, communication, payroll/AP, and payment separately authoritative.                                                            |
| Failure modes                     | Yes      | Upload, parsing, matching, staging, final compare, activation, or monitoring can time out or crash; a retry may duplicate effects, and a restored backup may resume an obsolete job.                                                                             | Ambiguous success is more dangerous than a visible failure because staff may run the operation again.               | Critical | High           | Use stable operation IDs, immutable inputs, checkpoints, inspect-before-retry, idempotent writes, CAS generation activation, pre-fence replace/discard, post-fence fix-forward only, backup-restore epoch reconciliation, and smallest-scope containment with adverse corrections continuing.                          |
| Data integrity risks              | Yes      | Full opening balances plus full exact history can double count; gaps, overlaps, duplicate source IDs, mutable cutoffs, unbalanced entries, or negative clamping can fabricate balances.                                                                          | The first balance poisons every later Support Cycle, statement, reallocation, and integrity check.                  | Critical | High           | Enforce the coverage partition and equation, unique stable identities, complete non-overlap, per-currency balanced entries, organization-control counter-entries, immutable half-open boundary, manifest successors, no plugs/tolerances/clamping, and deterministic rebuild verification.                             |
| Security and privacy risks        | Yes      | Source workbooks can contain donor PII, religious-affiliation data, bank notes, internal IDs, malicious formulas/macros/links, malware, or decompression bombs; public URLs or logs can expose them.                                                             | This is sensitive financial and potentially protected personal data, and an import file is an attack surface.       | Critical | High           | Use private encrypted evidence storage; allowlist and signature/content validation; malware/sandbox/decompression limits; generated names; disable formula/macro/link execution; short-lived authorized retrieval; access audit; formula-safe exports; PII-safe logs; and purpose-owned retention, hold, and disposal. |
| Scalability and performance risks | Yes      | Loading all history or locking a whole tenant in memory/one transaction can exhaust workers, block hot accounts, starve smaller tenants, or exceed provider/job limits.                                                                                          | A process that works for ten workers may fail exactly when a large mission switches systems.                        | High     | Medium-high    | Use residual-opening default, streaming and bounded parsing, set-based validation, keyset pagination, resumable checkpoints, scoped locks, tenant-fair quotas, adapter-certified workload limits, and production-shaped scale/poison-row tests.                                                                        |
| Operational burden                | Yes      | Manual control-total spreadsheets, repeated mapping, mystery evidence, forced second approvers, or permanent migration controls create seasonal consultant work and tribal knowledge.                                                                            | The product would shift risk to finance instead of removing it.                                                     | High     | High           | Provide guided defaults, remembered-but-revalidated mappings, automatic clean-row collapse, named exception owners/actions, one finance actor by default with optional tenant separation of duties, a quiet no-prior-balance path, and immutable downloadable evidence.                                                |
| Observability gaps                | Yes      | A silent overlap, missing account, stale source, parser drift, stuck cohort, cross-scope denial, or suppressed late correction may not appear until a missionary disputes a balance.                                                                             | Staff need to know whether the start is trustworthy and engineers need evidence without seeing PII.                 | High     | High           | Record PII-safe cohort/operation IDs, source watermark and digest, parser/schema/mapping versions, counts and per-currency totals, dispositions, checkpoints, fence version, actor/time, scan/hold state, and overlap/gap/late-fact/correction/containment events; alert only actionable exceptions.                   |
| Dependency and integration risks  | Yes      | Spreadsheet formats, importer behavior, provider APIs, QBO/Xero schemas, or legacy export semantics can drift; a library may normalize identifiers or amounts.                                                                                                   | Silent semantic drift turns an apparently successful import into financial corruption.                              | High     | High over time | Pin source capability, raw artifact digest, parser/schema/mapping version, and adapter contract; use golden fixtures plus mutation tests; certify exact-history semantics per source family; fail closed on drift; keep artifact/manual transport available; never infer QBO/Xero posting.                             |
| Migration and upgrade risks       | Yes      | A future schema change, reimport, source switch, or database restore could mutate or replay the opening, strand reference history, or claim ownership of already-posted accounting.                                                                              | Opening truth must remain explainable for the life of the tenant and portable to the next system.                   | Critical | Medium         | Preserve immutable portable source/manifest/occurrence versions; use prospective adapters and manifest successors; export stable opaque IDs and exact currencies; forbid destructive reimport; coordinate only proved Phase 20 D17 accounting gaps; and test restore/rebuild/version upgrades.                         |
| Other development hazards         | Yes      | Concurrent admins, stale previews, TOCTOU authorization, clock skew, rounding overflow, poison rows, blind retry, weak rollback, unclear ownership, or insufficient fixtures can defeat otherwise sound code.                                                    | These hazards cluster at the irreversible activation moment.                                                        | Critical | High           | Reauthorize scope and compare immutable versions at the final action; use checked integer minor-unit arithmetic, deterministic ordering, bounded retries, kill switches, explicit owner/runbooks, no post-fence rollback, and a mandatory crash/concurrency/currency/isolation test matrix.                            |

### Ruthless synthesis and build order

1. **Fix the authority equation first.** Define the Opening Source Package,
   complete cohort, exact half-open boundary, stable source identities, the five
   mutually exclusive coverage dispositions, and the rule that exact history
   plus residual opening equals the reconciled boundary position. Nothing may
   be staged until this contract is machine-checkable.
2. **Build the evidence and isolation boundary.** Use the future private
   evidence seam rather than today's public upload path; add exact Phase 21 D17
   prepare/review/activate/evidence/correct capabilities; scope every artifact,
   job, cache, and idempotency key; and make reference history structurally
   non-financial and side-effect-dark.
3. **Build replaceable preparation, not authority.** Let Phase 30 transport
   source packages into chunked resumable staging. Validate source precedence,
   identity, complete census, per-currency control totals, history/residual
   partition, lifecycle state, in-flight facts, and QBO/Xero non-effects. Staff
   see only actionable exceptions.
4. **Make one short irreversible start.** Reauthorize the actor and exact scope,
   recheck immutable input versions and source boundary, then CAS-activate one
   manifest generation for the whole Tenant × Legal Entity × currency cohort.
   Do not wrap parsing or the external legacy system in the transaction and do
   not claim an external lock that cannot be proved.
5. **Operate by detection and fix-forward.** Monitor overlap, gaps, late facts,
   and restore epochs. Before the fence, staging is replaceable. After it,
   preserve the opening and append a manifest successor and smallest-scope
   correction; keep mandatory adverse corrections running during quarantine.
6. **Publish the minimum calm truth.** Staff get the four-step exception-first
   flow and downloadable evidence. Missionaries get one through-dated starting
   balance until the first ordinary D11 close; reference history is optional,
   labelled, privacy-filtered, and never balance-bearing.
7. **Certify before shipping.** Require balance-only, exact-history-only, mixed,
   reference-only, zero-residual, replay, concurrency, crash-point, timeout,
   stale-preview, changed-input, late-fact, old-writer reactivation, negative,
   zero, inactive, departed, orphan, duplicate-name, reused-ID, multi-currency,
   DST, month/year/leap boundary, cross-scope, service-role, no-side-effect,
   QBO/Xero-gap, locked-period, max-workload, poison-row, backup/restore,
   deterministic-rebuild, parser-golden, accessibility, and usability tests.

### Ratified decision

**C-prime-amended-and-hardened (C-prime-R) — one finance-authorized,
source-covered, per-Field-Account and per-currency reconciled immutable Opening
Position over a complete Tenant × Legal Entity × ISO-currency activation cohort;
built from one precedence-explicit Opening Source Package and complete Opening
Coverage Manifest; prepared through private, chunked, resumable,
non-authoritative staging and production-shaped shadow reconciliation;
activated only by one short Asym-side CAS-guarded Operational Cutover at an
exact source-family half-open boundary after final permission, source, cohort,
mapping, control-total, in-flight, and manifest reproof; with every pre-cutover
source fact in exactly one non-overlapping disposition so canonical certified
exact history plus the residual Opening Position equals the reconciled boundary
position; privacy-filtered, structurally inert reference history otherwise;
balanced organization-control entries, exact minor-unit per-currency
conservation, append-only idempotent late-fact corrections, smallest-scope
containment, and post-activation overlap/gap monitoring; with Phase 30 owning
transport and Phase 20 alone owning proved accounting-gap delivery; exposed
through one quiet accessible exception-first `Start Field Accounts` setup and
calm through-dated missionary truth — without mutable balance scalars,
negative Opening Positions or capacity-created or discretionary deficits,
fuzzy identity, silent exclusions, fabricated
history, giant transactions, universal external-lock claims, dual write,
destructive rollback, whole-history replay, downstream side-effect replay,
public evidence storage, or QBO/Xero balance authority; mandatory source-owned
adverse corrections still append fully and may expose a visible D11 deficit.**

### Post-ratification congruency rider

The binding language above is applied with these D1-D16 and cross-phase
constraints:

- one manifest pins an exact half-open boundary for every predecessor source
  family plus one common operational through boundary that every source proves
  complete, classifies every crossing atomic occurrence wholly to one side, and
  activates the complete cohort only after all predecessor sources are proved;
- the activation pins the canonical ingestion cursor that is the predecessor
  of the first D11 close and carries forward independently live reservations,
  obligations, compensation/reimbursement coverage, reallocations, unresolved
  payments, and other capacity effects exactly once;
- certified exact history is deterministically ordered, nonnegative at every
  per-account prefix, atomic-group complete, and complete as one non-overlapping
  D3 Assessment Period Determination including its frozen partial-period policy
  and every component/correction; detail that cannot meet those tests remains
  reference-only;
- a D6 source-conserving group that spans currency cohorts is admitted as exact
  history only when wholly contained or every affected cohort activates behind
  one linked atomic barrier; otherwise the detail remains reference-only and
  separate residuals prevent partial or duplicate source claims;
- before activation, any unresolved or inadmissibly negative account blocks the
  whole cohort. A negative source amount needs already source-authoritative
  obligation or lifecycle-disposition evidence under the applicable owner
  domain; D5 applies only to a real exit or charitable-succession cause, and
  Phase 21 does not invent a generic deficit obligation;
- Phase 29 owns opening-source private bytes/access, Phase 30 owns import-session
  transport and mapping mechanics, and Phase 21 owns source precedence, semantic mapping
  admissibility, package/manifest meaning, conservation, activation, correction,
  and retention purpose;
- the original activation manifest, Opening Position, closed cycles, and prior
  statements never change. A late fact creates a manifest successor and a new
  current-record-time correction through the normal correction/next-close path;
  positive corrections require fresh proof and adverse corrections remain
  mandatory; and
- activation may publish only one current-state version transition through the
  existing D9- and Phase 31-authorized projection contracts. It never replays
  imported history or downstream effects, and unpublished balances/reference
  history are not queried, cached, exported, counted, or exposed.

The founder ratified this contract as Phase 21 D17 on 2026-07-31. It is
propagated through the Phase 21 decision log, shared terminology, roadmap,
ownership and permission boundaries, and ADR-0106. Mileage/per-diem calculation
remains the next separate seam and is not bundled into Phase 21 D17.

## D18 grooming evidence: mileage and per-diem calculation

**Status:** ratified 2026-08-01 as Phase 21 D18.

### Why this is the next unresolved seam

D10 already owns claim-level expense truth and D13 already owns the single
winning Expense Governance Profile. Neither decision settles how Asym derives a
mileage or per-diem amount from trip facts. Treating a claimant-entered total as
the only option creates avoidable errors and finance rework; automatically
choosing a government table from a worker address would make Asym a brittle tax
and employment-classification engine.

The current source landscape proves that one universal rate is unsafe:

- The IRS changed its 2026 business mileage rate from 72.5 cents for January–
  June to 76 cents for July–December while the charitable-service rate remained
  14 cents. Purpose and effective date therefore change the result even inside
  one calendar year. The rate is optional, not a universal reimbursement mandate.
- CRA's 2026 reasonable employee allowance uses different province/territory
  rates and lower rates after the first 5,000 kilometres. A deterministic
  calculator needs claimant/year/vehicle cumulative-band coverage and cannot
  reduce the rule to one flat rate.
- GSA M&IE is location- and date-dependent, uses 75% on first/last travel days,
  and deducts specified provided meals while distinguishing meals that do not
  reduce the allowance. The source is federal-travel policy, not automatic
  authority for every nonprofit worker or contractor.
- IRS Publication 463 still requires time, place, and business purpose when a
  standard meal allowance is used, and treats business mileage, parking, and
  tolls as separately evidenced concepts.
- Expensify supports GPS, map, manual distance, and odometer evidence and
  applies workspace rates by effective date. Ramp supports supplied-meal
  deductions and reduced travel-day percentages. SAP Concur distinguishes fixed
  allowances from actual expenses checked against limits. These are useful UX
  and calculation patterns, not legal authority for an Asym tenant.

Primary sources:

- [IRS standard mileage rates](https://www.irs.gov/tax-professionals/standard-mileage-rates)
- [IRS Publication 463](https://www.irs.gov/publications/p463)
- [CRA automobile allowance guidance](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/benefits-allowances/automobile/automobile-motor-vehicle-allowances.html)
- [GSA per-diem FAQ](https://www.gsa.gov/travel/plan-a-trip/per-diem-rates/faqs)
- [GSA M&IE breakdowns](https://www.gsa.gov/travel/plan-a-trip/per-diem-rates/mie-breakdowns)
- [GSA per-diem API](https://open.gsa.gov/api/perdiem/)
- [Expensify distance expenses](https://help.expensify.com/articles/new-expensify/reports-and-expenses/Distance-Expenses)
- [Ramp reimbursement setup](https://support.ramp.com/reimbursements-set-up/)
- [Ramp claimant reimbursement flow](https://support.ramp.com/submitting-reimbursements/)
- [SAP Concur travel-allowance experience](https://help.sap.com/docs/concur-expense/concur-expense-professional-edition-administration-guides/end-user-experience-other-expense-reports-pages)

### Concrete missions scenario

Grace Reach Missions has confirmed that its U.S. employee accountable-plan
policy uses the IRS business mileage schedule. Maria drives 380 ministry-
business miles on 2026-07-06 and later attends a four-day conference where lunch
is provided on one day.

The correct ordinary experience must:

1. use the July–December business rate of $0.76, producing **$288.80**, rather
   than the January–June $0.725 rate or the $0.14 charitable-service rate;
2. preserve trip date, distance, unit, business purpose, evidence method, exact
   adopted source revision, and any separately claimed parking or tolls;
3. use only Grace Reach's explicitly adopted per-diem method, location/date
   schedule, partial-day rule, and supplied-meal treatment;
4. show Maria one calm calculated total with an optional **How this was
   calculated** breakdown; and
5. create only a versioned Expense Claim calculation. Approval, Reimbursement
   Obligation, Field Account funding, payment, Phase 20 accounting, QBO/Xero,
   payroll/tax treatment, and final reconciliation remain independently owned.

### Options

#### Option A — Evidence-only travel claims

The claimant calculates outside Asym, enters one final amount, and attaches trip
evidence.

This has the smallest engine and works as a universal fallback, but it pushes
rate selection, partial-day arithmetic, meal deductions, and cumulative bands
onto every claimant and reviewer. It creates inconsistent results and repetitive
finance correction. It is not the best default experience.

#### Option B — Tenant-maintained flat rates

Each tenant configures one mileage rate and one daily allowance with effective
dates.

This is easy and covers simple policies. It cannot faithfully represent
midyear changes, cumulative bands, province/territory or vehicle distinctions,
location schedules, partial travel days, supplied meals, actual-expense limits,
or multiple relationship/purpose rules. It is a useful supported mode, not a
sufficient architecture.

#### Option C-prime — Certified, policy-pinned Travel Allowance Calculations — recommended

Add bounded deterministic travel-calculation modules inside the existing D13
Expense Governance Profile—never a second profile resolver or workflow engine.
The modules are off by default; the quiet default remains **Actual expenses
only**. An authorized tenant may prospectively enable:

- mileage from one certified named rate schedule or one tenant/adviser-approved
  effective-dated schedule;
- fixed meals/incidental per diem;
- actual expenses checked against a daily limit;
- actual lodging with an optional location/date ceiling plus a separately
  selected M&IE method; or
- an exact external-calculation fallback with attached evidence whenever Asym
  does not certify the applicable rules.

Every immutable calculation version freezes the governing Tenant, Legal Entity,
claimant relationship/classification authority, jurisdiction, purpose, Expense
Governance Profile version, trip dates and timezones, locations, distance and
unit, vehicle/rate class, evidence method, supplied meals, partial-day facts,
exact rate-source revision/digest, applicability interval, ISO currency, bands,
caps, rounding, inputs, component breakdown, and result.

The tenant or its adviser—not Asym—confirms applicability. Asym never infers
employee/contractor treatment, business versus charitable mileage, governing
jurisdiction, taxable excess, or payroll treatment. A source update creates a
prospective schedule or an explicit impact review; it never silently rewrites
an approved claim. Unsupported or ambiguous cases use the existing D10/D13
exception-first review and permanent external-calculation lane.

Claimants get **Add expense → Mileage** with map, odometer, or manual distance;
GPS is optional and never required. **Add expense → Per diem** asks only for
trip dates, destination, and supplied meals required by the chosen policy. The
ordinary surface shows one total and short policy label; **How this was
calculated** reveals the day/rate breakdown. Offline drafts and manual evidence
remain first-class.

Finance gets one **Travel reimbursements** section inside the existing expense-
policy surface: choose the bounded method, named source or organization rate,
applicability, effective date, preview examples, and activate. Clean claims stay
in the ordinary review flow. Only ambiguity, unsupported rules, source change,
or exception creates extra work.

#### Option D — Universal auto-updating global rate engine

Asym selects the supposedly correct rate from worker, route, and destination
data. This appears effortless but requires unsafe legal inference, constant
global rule maintenance, and false compliance claims. It would be brittle,
privacy-heavy, and operationally disproportionate. Reject it.

### Recommendation and adversarial gates

Choose **Option C-prime** with these binding gates:

- applicability is explicit and adviser/tenant-confirmed; no source is labelled
  “legally compliant” merely because it is official;
- source revisions are immutable and ingested ahead of calculation—approval
  never depends on a live rate lookup;
- cumulative bands use serialized or reserved claimant/year/vehicle coverage so
  concurrent claims cannot consume the same band;
- exact calculation coverage prevents both mileage and mutually exclusive
  actual vehicle costs, or per diem and the same actual meal, from being
  reimbursed twice;
- mixed locations, partial days, supplied meals, overnight/date-line crossings,
  timezone changes, and retrospective source revisions either follow a
  certified deterministic contract or go to review;
- differing source/output currencies require exact externally owned conversion
  evidence; Phase 21 gains no FX engine;
- manual distance and odometer remain first-class, while GPS/routes are optional,
  minimized, separately authorized, and tightly retained;
- taxability and payroll classification remain tenant/adviser and external-
  provider authority; and
- the implementation reuses D10 claim truth, D13 policy resolution, D15
  reimbursement handoff, and Phase 20 accounting boundaries rather than
  creating parallel approvals, payments, or accounting paths.

### Founder decision — resolved 2026-08-01

How should Asym calculate mileage and per-diem expense claims without becoming a
global tax engine or forcing tenants into one reimbursement policy?

**Founder ruling:** ratified the hardened C-prime formulation as Phase 21 D18.

### Ratified direction

The founder selected **Option C-prime — Certified, policy-pinned Travel
Allowance Calculations** and required maximum legitimate tenant flexibility
without an all-knobs administration surface. The founder ratified the following
research and adversarial hardening as Phase 21 D18 on 2026-08-01.

### What the deeper source review changes

The deeper review confirms the direction but makes five boundaries binding:

1. **A published rate is not an applicability decision.** IRS, GSA, CRA, HMRC,
   and ATO sources describe different populations and different concepts:
   optional mileage methods, federal-employee subsistence rates, reasonable
   employer allowances, tax-relief ceilings, or substantiation exceptions. A
   correct table lookup can still be the wrong tenant policy. The tenant or its
   adviser owns applicability; Asym certifies only faithful execution inside a
   declared capability envelope.
2. **A rate is not always one number selected by one date.** The IRS published
   two 2026 business mileage rates and its July change applies conditions to
   both occurrence and payment dates. CRA and HMRC mileage use annual
   cumulative bands. GSA lodging can be seasonal. HMRC published a 2026 change
   after its retrospective effective date. Publication, effective, occurrence,
   submission, approval, obligation, and payment dates therefore remain
   separate facts.
3. **Claim-time live lookup is unsafe.** GSA documents API-key, rate-limit,
   location, fiscal-year, seasonal-row, and missing-city constraints. Each
   supported official source must be ingested before use into an immutable,
   checksummed source package. Claim creation and approval read the pinned local
   package and remain operable during source outages.
4. **Cumulative policies are shared financial capacity.** A Canadian first-
   5,000-kilometre band or UK first-10,000-mile band cannot be calculated from
   an isolated claim. The applicable Tenant × Legal Entity × claimant Party ×
   source-owned relationship/engagement version × source × policy/tax-period ×
   vehicle-kind capacity requires deterministic
   ordering and serialized or compare-and-swap allocation. Preview never
   consumes capacity.
5. **Flexible does not mean programmable.** D18 extends the one winning D13
   Expense Governance Profile with a finite typed method catalog. It does not
   introduce another resolver, natural-language financial authority, a formula
   language, tax engine, route platform, FX engine, approval path, payment
   system, or accounting subsystem.

Additional primary evidence:

- [IRS Announcement 2026-11](https://www.irs.gov/irb/2026-29_irb)
- [HMRC 2026 retrospective mileage change](https://www.gov.uk/government/publications/increase-to-approved-mileage-allowance-payments-amaps-and-self-employed-simplified-mileage-rates)
- [HMRC vehicle-kind and cumulative-band rules](https://www.gov.uk/hmrc-internal-manuals/employment-income-manual/eim31240)
- [ATO reasonable travel amounts](https://www.ato.gov.au/law/view/document?docid=TXD/TD20254/NAT/ATO/00001)
- [ATO explanation of the substantiation boundary](https://www.ato.gov.au/law/view/document?LocID=%22TXR%2FTR20046%2FNAT%2FATO%2FftF2%22&PiT=99991231235958)
- [Ramp policy drafts and publish history](https://support.ramp.com/edit-your-policy-when-using-policy-agent/)
- [Expensify effective-dated distance rates](https://help.expensify.com/articles/new-expensify/workspaces/Set-distance-rates)
- [Brex mileage capture](https://www.brex.com/support/mileage-reimbursements)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [GOV.UK check-answers pattern](https://design-system.service.gov.uk/patterns/check-answers/)
- [Apple location-permission guidance](https://developer.apple.com/documentation/corelocation/requesting-authorization-to-use-location-services)

### Candidate calculation contract

The D13 profile gains one optional **Travel reimbursements** section. Its quiet
default is **Actual expenses only**. An authorized tenant may configure one or
more prospective profile versions using the existing deterministic D13 scope
dimensions, with exactly one winning profile for each claim item.

D13 selects that winning profile once from the expense item's **incurred date**
and existing specificity lattice; submission-time facts may affect the review
route but do not select a different calculation policy. A source method may
still require other independently preserved dates—such as payment date—for its
component calculation. If a required future fact is not yet authoritative, the
claim remains estimated or routes to the bounded exception/external lane rather
than guessing it.

The bounded method catalog is:

1. **Actual expenses only** — the default and permanent fallback.
2. **Mileage allowance** — one named certified source schedule or one tenant/
   adviser-owned effective-dated schedule.
3. **Fixed meal or incidental allowance** — source-owned component, supplied-
   meal, partial-day, trip-duration, and long-stay rules.
4. **Actual expense against a policy limit** — the claimant's evidenced amount
   remains amount truth; the selected schedule supplies only the applicable
   meal or lodging ceiling.
5. **Externally calculated allowance** — an exact final amount, currency,
   method label, preparer, and evidence for unsupported policies or exceptional
   cases.

A tenant-owned schedule may use only typed capabilities the product can prove:
effective half-open intervals, exact rates, ISO currencies and distance units,
vehicle and participant classes, location rows, cumulative bands, caps,
partial-day factors, supplied-meal components, long-stay stages, and declared
rounding. There is no executable code, expression language, hidden rule order,
or claimant-selected profile. The evidence-backed external lane is the safe
escape hatch for legitimate policies outside that envelope.

Every immutable calculation occurrence belongs to the applicable D10 Expense
Claim Version or claim-item split and preserves:

- Tenant, Legal Entity, participant, tenant-supplied relationship/
  classification fact, purpose, claim item, winning D13 profile version, and
  exact resolution evidence;
- source kind, authority/policy owner, source revision and digest, publication
  and retrieval timestamps, effective interval, capability/certification
  status, and tenant/adviser applicability confirmation;
- occurrence instants, destination-local IANA timezones, trip segments,
  location resolution and confidence, destination, duration, partial days,
  supplied meals, and long-stay sequence where applicable;
- exact decimal distance and unit, capture method, accepted route/odometer/
  manual evidence, vehicle kind, registration jurisdiction where required, and
  separately allowed toll or parking components;
- cumulative-capacity key, deterministic occurrence order, prior capacity,
  capacity consumed, split-band components, and remaining capacity;
- source currency, exact rational rate, unrounded component results, declared
  rounding stage and mode, rounded minor-unit amounts, remainder, caps,
  exclusions, and final result; and
- duplicate-coverage evidence, unsupported or warning reasons, submitter,
  reviewer, external-calculation evidence, and all version timestamps.

Draft facts may create new immutable claim and calculation versions. Submission
references the exact selected occurrence. Approval alone freezes the inputs,
output, method, source revision, and resolution evidence into the existing D10
Approved Expense Snapshot. A profile or source change never silently alters a
submitted or approved calculation. An unapproved claim may be explicitly
recalculated with visible differences; an approved claim can change only
through a source-linked append-only adjustment, bounded exception, or
documented no-change disposition.

Mileage allowance and mutually exclusive actual vehicle-operating components
cannot cover the same trip segment. Per diem and the same actual meal cannot
cover the same person, date, and component. Source-authorized parking, tolls,
or other separate components remain separately evidenced rather than being
silently included or suppressed.

Every schedule and result has an explicit ISO 4217 currency. Distance and rates
use exact decimal/rational arithmetic, never binary floating point. Rounding
occurs only at the declared component or claim boundary. D18 performs no
foreign exchange; a differing source and claim/Field Account currency requires
D6's externally owned conversion evidence or the external-calculation lane.

### Source-package certification and update contract

An official schedule may be labelled **Certified** only when Asym has proved:

1. exact primary-source provenance, raw evidence, digest, publication and
   effective dates, parser/schema version, normalized rows, and a narrowly
   stated population and capability envelope;
2. fixtures for every supported row, effective boundary, location behavior,
   band split, rounding edge, partial day, supplied meal, long stay, vehicle
   kind, and currency;
3. comparison with hand-calculated primary-source examples and an accountant-
   reviewed scenario pack;
4. schema drift, missing/ambiguous location, outage, rate limiting, malformed
   response, and retroactive revision behavior;
5. concurrent threshold crossing and late-earlier-occurrence tests proving
   exact conservation and append-only recovery;
6. Tenant, Legal Entity, participant, purpose, and currency isolation;
7. historical replay proving that a calculation remains explainable after
   source, adapter, and schema upgrades; and
8. keyboard, screen-reader, focus, error, zoom/reflow, mobile, offline, and
   non-color status verification.

Automated refresh only produces a candidate source package. It validates raw
and normalized semantic differences and runs production-shaped fixtures before
product certification. A source update notifies only tenants with affected
enabled profiles. The tenant reviews applicability and impact before adoption.
Retroactively effective sources produce an impact case; they never rewrite
approved claims. A source outage or unsupported row affects only new
calculations in that scope and offers actual-expense or external-calculation
recovery. Existing pinned calculations remain usable and inspectable.

### Polished UX/UI contract

#### Tenant administration

Use one doorway in the future Expense Program / Expense Governance Profile
settings:

`Settings → Expenses → Expense Governance Profiles → Travel reimbursements`

The profile summary card shows only method, short applicability scope, source,
effective date, and lifecycle status. The primary action is **Configure** or
**Review update**, never **Build rules**.

The guided setup uses five short stages:

1. **Choose how travel is reimbursed.** Actual expenses only, mileage, per
   diem, mileage and per diem, or calculated outside Asym.
2. **Choose the source and method.** A supported named schedule, organization
   schedule, or external calculation; then only the bounded method choices
   relevant to that source.
3. **Confirm applicability.** Legal Entity, participant/policy cohort, purpose,
   geography, currency, start date, and authorized policy owner. Show affected
   participant counts and **Why this profile wins**; block unresolved overlaps
   or positive-population gaps.
4. **Test with trips.** Use the exact production calculator without creating a
   claim, reservation, or financial entry. Show an ordinary example, boundary/
   partial-day example, threshold or supplied-meal example when relevant, and
   one tenant-entered example.
5. **Review and activate.** Show a human-readable side-by-side diff, coverage,
   unsupported cases, prospective impact, and exact statement that existing
   submitted/approved claims retain their calculations. Activation requires a
   concise reason and compare-and-swap guard against stale-browser publication.

Advanced controls are contextual. Cumulative bands appear only for schedules
with bands; meal deductions only when the chosen method uses them; location
rows only for location schedules. Common configurations never traverse an
advanced matrix. Changes clone the active version; active or referenced
versions cannot be edited or deleted. Lifecycle is Draft → Ready for review →
Scheduled/Active → Superseded/Retired.

The implementation must reuse shared `PageShell`, `Card`, Base UI-backed
primitives, Maia/Zinc semantic tokens, `useAsymForm` plus Zod and the shared
field/error contract, `FieldSet`/`FieldLegend`, `Accordion` or `Collapsible`, a
focus-managed `AlertDialog`/`Sheet`/`Drawer`/`Dialog`, and
`DataTableResponsive` only for history or queues. It must not inherit Support
Hub's domain-local mutable settings CRUD, Eve's raw-JSON editor, Mission
Control's non-semantic details overlay, or introduce a third navigation
registry. Preview and authoritative calculation use the same versioned server-
owned evaluator contract; React does not reimplement the formula.

Before D18 relies on the shared high-stakes form shell, tests must verify that
the generated control ID is programmatically associated with its visible
label. If the suspected `AsymFieldShell` `htmlFor` gap is confirmed, repair the
shared primitive once rather than adding travel-specific workarounds.
Financial activation includes review and confirmation consistent with WCAG
2.2 error-prevention requirements.

#### Missionary claim experience

- Keep one **Add expense** entry point. Show **Mileage** and **Per diem** only
  when the winning profile enables them. The missionary never chooses among
  finance policy variants or government schedules.
- Mileage starts with date, purpose, destination, and a calm choice of
  **Route**, **Odometer**, or **Enter distance**. Optional **Track with GPS** is
  offered only after the user deliberately selects it. Manual entry always
  works, including when maps, connectivity, or location permission fail.
- Route entry supports round trips and stops; remembered locations are user-
  named aliases, not silently inferred home/field labels. A route suggestion is
  not authoritative evidence until accepted. Tolls and parking stay separate.
- Per diem asks for departure/return, destination, and purpose first. It asks
  supplied-meal, lodging, partial-day, or long-stay questions only when the
  winning policy needs them. A day-by-day summary uses plain explanations such
  as **Travel day — 75%** or **Lunch provided — deducted**.
- The primary result is one calm amount and policy label. **How this was
  calculated** reveals inputs, components, rate/source version, rounding, and
  changes. A cumulative-band preview is labelled estimated until authoritative
  allocation. No copy says available, payable, tax-free, posted, reimbursed, or
  paid merely because an amount was calculated or approved.
- **This doesn't look right** preserves all entered work and routes to claimant
  correction or finance review. Unsupported cases offer actual expense or
  external calculation; they never discard the draft or guess a rate.
- Local/offline drafts show **Saved on this device**, **Waiting to sync**, or an
  exact conflict action. Synchronization is idempotent and cannot duplicate a
  claim or consume cumulative capacity twice.

GPS is off by default and never required. Ask for `When in Use` location access
only after the user chooses GPS and immediately explain why. Retain only the
minimum tenant-policy evidence; raw continuous routes have a separate,
purpose-owned, tenant-visible short retention rule and are never the default
approved artifact. Exact missionary homes, ministry locations, travel dates,
and companions receive field-level least-privilege access, redacted telemetry,
and purpose-separated audit.

#### Finance review

Clean calculations stay in the ordinary D10 report-first review. The detail
surface shows claimant facts, winning profile, exact source revision, component
math, duplicate-coverage outcome, cumulative-capacity effect, and one current
action.

Only typed causes enter the exception workspace:

- needs claimant information;
- policy does not cover this case;
- ambiguous location or jurisdiction;
- possible duplicate coverage;
- rate source changed before submission;
- cumulative band affected by a late earlier occurrence;
- currency-conversion evidence required;
- calculation evidence unavailable; or
- external calculation required.

Each exception says what happened, what remains safe, who can resolve it, and
the next action. A permitted bounded exception records the approver and reason;
it does not mutate the policy or source. Bulk approval is available only for
homogeneous clean claims with the same visible profile and source version. A
generic select-all operation never hides different calculations or exceptions.

#### Accessibility and responsive behavior

- Use native fieldsets/legends for method choices, visible labels matching
  accessible names, linked descriptions/errors, an error summary with anchor
  links, predictable focus, announced calculation/sync status, and no color-
  only meaning.
- Preserve full keyboard operation, visible unobscured focus, screen-reader
  order, 320-CSS-pixel reflow, 400% zoom usability, and Core's 44-pixel primary
  mobile target convention. Maps always have an equivalent text/manual path.
- Daily calculations use semantic description lists or tables with headers and
  a linear mobile presentation. Dialogs return focus. Reduced-motion settings
  remove nonessential transitions without hiding state changes.
- Errors distinguish user-correctable input from service/source unavailability
  and always provide the next recovery action.

### Ruthless adversarial review

| Category                          | Concern? | What could go wrong                                                                                                                                                                                         | Why it matters                                                                                   | Severity | Likelihood  | Permanent fix or prevention                                                                                                                                                                                                                            |
| --------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Brittleness                       | **Yes**  | Live government or map lookups fail; fuzzy place matching chooses a default; a source revises rates retroactively; one flat schema cannot express bands or partial days.                                    | Correct claims become unreproducible or blocked by an upstream outage.                           | Critical | High        | Pre-ingested immutable Source Packages, exact location evidence, source-specific typed components, declared capability envelopes, and permanent actual/external fallback.                                                                              |
| Technical debt                    | **Yes**  | A second resolver or country-by-country conditionals duplicate D13 and drift from claim approval.                                                                                                           | Each revision becomes a risky release and policies contradict each other.                        | High     | High        | One D13 resolver, one canonical calculation contract, source adapters, shared exact-money/band primitives, versioned fixtures, and no formula language.                                                                                                |
| Edge cases                        | **Yes**  | Trips cross midnight, DST, the date line, an effective/tax-year boundary, locations, currencies, vehicle kinds, or a cumulative threshold; meals are partly supplied; an earlier trip arrives late.         | These are routine for international missions, not rare theoretical cases.                        | Critical | High        | Exact instants and IANA zones, segmented components, deterministic cumulative allocation, source-owned date rules, explicit currency boundaries, and append-only late-fact recovery.                                                                   |
| Footguns                          | **Yes**  | Staff activate a government-employee or deduction schedule for everyone, backdate a mutable rate, stack mileage with actual vehicle costs, delete a referenced schedule, or bulk-approve unlike exceptions. | A polished interface could lend false authority to a wrong or duplicate amount.                  | Critical | High        | Applicability confirmation, prospective immutable versions, coverage proof, non-destructive supersession, mutually exclusive coverage, guarded bulk actions, and append-only exceptions.                                                               |
| Tenant safety                     | **Yes**  | A policy, source package, cumulative counter, preview, saved route, or exception crosses Tenant, Legal Entity, participant, purpose, or currency.                                                           | It both leaks sensitive travel data and corrupts financial obligations.                          | Critical | Medium      | Structural compound scope keys, RLS/application authorization at every seam, tenant-scoped jobs/caches/opaque IDs, no client-supplied authority, and negative isolation tests.                                                                         |
| Over-engineering                  | **Yes**  | Maximum flexibility becomes a worldwide tax engine, GPS platform, route optimizer, FX system, or arbitrary workflow/rules builder.                                                                          | Small tenants inherit expert configuration and Asym assumes authorities it does not own.         | High     | High        | Actual-expense default, finite typed methods, certified named-source coverage, bounded tenant schedules, and external calculation for the long tail.                                                                                                   |
| UX/UI and user friction           | **Yes**  | A mega-form exposes irrelevant knobs; claimants choose rates or answer policy jargon; finance sees totals without reasons; warnings overwhelm ordinary work.                                                | Users abandon claims, revert to spreadsheets, or approve without understanding.                  | High     | High        | Goal-first staged setup, contextual advanced controls, one automatic winner, one calm total plus optional explanation, mobile/offline capture, and exception-first finance review tested with missionaries and bookkeepers.                            |
| Hidden coupling                   | **Yes**  | A rate lookup determines relationship/classification, approval, Field Account funding, payroll tax, payment, or accounting; a profile edit silently changes a submitted claim.                              | A travel-policy change mutates unrelated financial truth.                                        | Critical | High        | D18 emits calculation evidence only; pin versions and preserve D10/D13, D1/D2, D15, Phase 20, and external tax/payroll/payment authority with contract tests.                                                                                          |
| Failure modes                     | **Yes**  | Source import partly succeeds, location is ambiguous, band reservation races, maps or offline sync fail, or evidence storage fails after calculation.                                                       | A claim may appear complete while its amount cannot be reproduced, or retry may duplicate it.    | Critical | Medium-high | Staged atomic source certification, atomic calculation-plus-proof commit, idempotency, CAS/serialization, ambiguity-to-review, inspect-before-retry, early draft saving, and manual/external recovery.                                                 |
| Data integrity risks              | **Yes**  | Duplicate claims consume a band twice; floats create drift; supplied meals are paid twice; intervals overlap; retroactive changes rewrite prior results.                                                    | Approved claims, Field Account obligations, and handoff artifacts no longer conserve or tie out. | Critical | High        | Stable occurrence IDs, half-open intervals, exact decimal/rational math, coverage keys, atomic reservations, immutable versions, append-only adjustments, and conservation/invariant tests.                                                            |
| Security and privacy risks        | **Yes**  | GPS traces, home/field routes, companions, dates, receipts, or API keys leak through broad access, exports, logs, or client code.                                                                           | Missionary travel can reveal personal routines and high-risk ministry locations.                 | Critical | Medium      | Optional just-in-time GPS, manual alternatives, data minimization, purpose-owned retention, field-level access, encrypted/redacted storage and logs, audited access, and server-side platform secrets.                                                 |
| Scalability and performance risks | **Yes**  | Claim-time geocoding, global cumulative scans, large location tables, or tenant-wide preview block seasonal review; concurrent threshold claims race.                                                       | Close slows or becomes incorrect precisely at peak volume.                                       | High     | Medium-high | Indexed local packages, narrow participant/period capacity ledgers, per-key serialization, async chunked impact analysis, bounded optional map enrichment, tenant-fair queues, and load certification.                                                 |
| Operational burden                | **Yes**  | Finance manually monitors government sites, copies rate tables, maintains thousands of places, or resolves harmless variances one by one.                                                                   | Flexibility becomes permanent staff and support labor.                                           | High     | High        | Asym-maintained supported-source certification, tenant-owned schedules only by choice, candidate revision impact review, guided templates/import preview, affected-tenant-only notices, and exception clustering.                                      |
| Observability gaps                | **Yes**  | Staff see a wrong total without source, version, matching facts, band consumption, rounding, or fallback; engineers cannot replay it.                                                                       | Disputes and audits require manual reconstruction.                                               | Critical | Medium-high | Immutable provenance, `Why this applied`, structured reason/correlation IDs, privacy-safe logs, source drift and capacity metrics, user-facing calculation explanation, and non-authoritative exact replay tooling.                                    |
| Dependency and integration risks  | **Yes**  | Government schemas/URLs, map routes, mobile permissions, or API terms change; missing cities or rate limits silently select a fallback.                                                                     | A third-party change can block approval or alter an amount.                                      | High     | High        | Adapter contracts, raw evidence archives, schema/semantic validation, cached packages, capability labels, circuit breakers/kill switches, substitution tests, and no live approval dependency.                                                         |
| Migration and upgrade risks       | **Yes**  | A new calculator/schema cannot read old evidence; imported history lacks cumulative context; migration triggers recomputation.                                                                              | Historical calculations lose auditability and opening band capacity becomes false.               | High     | Medium      | Stable canonical schemas, versioned readers/upcasters for read only, retained source artifacts, explicit opening cumulative capacity and boundary coverage, migration dry runs, and no historical rewrite.                                             |
| Other development hazards         | **Yes**  | Preview consumes capacity; two approvals cross a band concurrently; rounding order or DST is wrong; stale browsers activate over new work; tests prove arithmetic but not applicability or recovery.        | Unit-correct math still ships a wrong financial workflow.                                        | Critical | High        | Non-reserving preview, linearizability/property tests, declared rounding, timezone fixtures, CAS activation, transactional outbox/idempotency, superseding rollback versions, accessibility/device/offline tests, and production-shaped certification. |

### Ruthless synthesis and permanent build order

1. **Ratify the authority boundary.** Tenant/adviser applicability and external
   tax/payroll/legal authority come before calculator convenience.
2. **Specify one canonical calculation/evidence contract inside D13.** Define
   versions, exact units/money, source identity, timezones, coverage, rounding,
   cumulative capacity, and append-only correction before UI or provider work.
3. **Build immutable source-package ingestion and certification.** No supported
   source is tenant-visible until provenance, semantics, fixtures, drift,
   outages, boundaries, and historical replay pass.
4. **Make duplicate coverage and cumulative capacity transactional.** This is
   the most serious correctness seam and cannot be deferred behind polished
   screens.
5. **Ship the quiet actual-expense default and bounded external lane.** No
   tenant or claimant waits for worldwide schedule support or grants GPS access.
6. **Build the progressive profile setup and production-shaped activation
   proof.** Common policy setup stays short; complexity appears only where the
   chosen source needs it.
7. **Build mobile-first claimant capture and typed exception recovery.** Save
   work early, explain the math, preserve manual/offline paths, and keep clean
   work in the ordinary flow.
8. **Certify the operating envelope before launch.** Release blocks on source
   revisions, retrospective dates, band races, timezones/date line, mixed
   locations, offline conflicts, tenant isolation, privacy retention, load,
   accessibility, and append-only recovery—not only happy-path arithmetic.

### Repository-aligned verification seam

The implementation phase must prove D18 through the existing public seams:

- a pure, versioned deterministic evaluator with exact effective/incurred-date
  boundaries, units, minor-unit rounding, supplied meals, partial days, bands,
  concurrency, source revision, no-FX, overlap, successor, and adverse-
  correction fixtures;
- D13 resolver tests proving one non-stacking winner and D10 tests proving that
  calculation cannot create approval, obligation, payment, or accounting truth;
- command/auth tests for prospective CAS activation, idempotent retries,
  smallest-scope fail-closed behavior, and Tenant × Legal Entity × claimant
  Party × source-owned relationship/engagement × cohort × purpose × currency ×
  capability substitution attacks;
- component tests using role/name queries for native label association,
  conditional disclosure, linked errors, calculation expansion, announced
  recalculation/save states, focus restoration, keyboard-safe mobile actions,
  and quiet rendering while the method is off; and
- authenticated admin and missionary end-to-end journeys for configuration,
  representative preview, activation, manual mileage, per diem with supplied
  meals, clean review, unsupported-case recovery, approval freeze, and D15
  handoff—plus Axe and manual keyboard, 320-pixel reflow, 400% zoom, touch,
  dark-mode, reduced-motion, offline, conflict, and device verification.

Generic public-route accessibility coverage is not sufficient evidence for
these authenticated financial flows.

### Ratified Phase 21 D18

> **C-prime-amended-and-hardened (C-prime-R) — one optional, tenant-authorized,
> policy-pinned Travel Allowance Calculation inside the single winning D13
> Expense Governance Profile, with an explicit Actual-expenses-only default;
> bounded typed mileage, fixed-allowance, actual-against-limit, and externally
> calculated modes; tenant/adviser-owned applicability; individually
> capability-certified and immutably versioned official Source Packages or
> bounded tenant-owned schedules; exact participant-, relationship-, purpose-,
> jurisdiction-, location-, policy/tax-period-, currency-, vehicle-, trip-,
> supplied-meal-, partial-day-, long-stay-, band-, cap-, coverage-, and rounding
> evidence; deterministic serialized cumulative capacity and duplicate-
> reimbursement protection; prospective CAS-guarded policy activation with
> production-shaped preview and append-only retroactive-source or late-fact
> recovery; low-friction route, odometer, manual, optional-GPS, per-day, and
> offline-draft claimant paths; one calm accessible total with exact on-demand
> explanation; privacy-minimized optional route evidence; quiet typed exception-
> first finance recovery; and a permanent evidence-backed actual/external
> fallback; one D13 incurred-date resolution recorded as an immutable typed
> calculation occurrence inside D10 claim truth and frozen only through the
> Approved Expense Snapshot—while D10/D13 retain claim and approval authority,
> D1/D2 retain Field
> Account truth, D15 retains handoff authority, Phase 20 retains accounting
> authority, and external specialists/providers retain tax, payroll, payment,
> and legal-classification authority; without live approval-time source calls,
> global-compliance claims, arbitrary or natural-language financial rules,
> rule-order precedence, claimant-selected policy, implicit FX, mandatory GPS,
> mutable or destructively deleted calculations, silent fallback or
> recalculation, stacked reimbursement, or any claim that calculated or
> approved means available, payable, tax-free, posted, reimbursed, or paid.**

## D19 ratified direction — canonical Field Account subject and participant membership

**Status:** Founder ratified C-prime-amended-and-hardened (C-prime-R) on
2026-08-01 as Phase 21 D19. D1-D18 remain ratified and are not reopened.

### Why this decision is next

The current Phase 21 language alternates among a missionary, worker, couple,
household, project, participant, assignment, and approved field purpose as the
Field Account's subject. Those are not interchangeable display labels. They have
different identity, lifecycle, privacy, authorization, compensation, claimant,
payment, donor-purpose, and succession semantics.

Leaving this to implementation would likely create a polymorphic
`owner_type + owner_id`, make household or spouse relationships imply financial
authority, or require a later destructive identity migration. D1-D18 all depend
on one stable Field Account identity, so this must be resolved before adding
more balance-affecting occurrence families.

### What current evidence establishes

- [ECFA Standard 4](https://www.ecfa.org/content/comment4) says support for a
  worker's ministry can be charitable only while the organization retains full
  control and uses the resources for reasonable compensation, business expense,
  or related ministry cost. The worker is not the legal owner of the fund.
- [CRA guidance](https://www.canada.ca/en/revenue-agency/services/charities-giving/charities/operating-a-registered-charity/receiving-gifts/what-a-gift.html)
  likewise distinguishes a donor's allowed program preference from an invalid
  direction to a specific person or family. This reinforces an
  organization-controlled purpose subject without making U.S. terminology the
  global data model.
- [Reliant's couple guidance](https://reliant.org/help/supporting-missionaries/how-do-i-support-a-missionary-couple)
  says couples are supported as a family through a ministry fund while their
  work arrangements may differ. Its current
  [order-of-pay guidance](https://solomon.reliant.org/display/public/fieldbenefits/Order%2Bof%2BPay)
  shows two employees can share one fund yet retain separate paychecks, tax
  treatment, compensation priority, backpay, and reimbursement truth.
- [Pioneers](https://pioneers.org/funding-your-ministry) says donations belong
  to the organization and are placed in a missionary support account for
  organization-controlled salary and ministry expenses. Its public model
  includes both worker and project purposes.
- [MPDX](https://www.cru.org/us/en/train-and-grow/help-others-grow/digitalministry/apps-tools/mpdx.html)
  lets spouses use separate identities and logins against one shared database.
  Its [account-management documentation](https://help.mpdx.org/article/450-manage-accounts)
  separates shared access from spouse-account merge and warns that merging is
  irreversible. The durable lesson is to keep people, shared presentation,
  access, and financial grouping independent rather than copying the destructive
  merge.
- The [MPDX API](https://docs.mpdx.org/) models an Account List separately from
  its associated users, organization accounts, currency, and goal. This is a
  useful precedent for one stable subject with multiple principals rather than a
  person-owned wallet.
- [SiteStacker's missionary-data model](https://training.sitestacker.com/support/solutions/articles/151000122046-visual-guide-to-missionary-data)
  can link a missionary campaign to a person or group and keeps its campaign,
  accounting code, and public content fields distinct. It demonstrates the
  market's variable presentation needs, not a safe financial owner model.

These sources do not establish one universal agency policy. They establish the
opposite: single workers, shared couples, separately employed spouses, teams,
projects, and participant turnover are all normal. The platform needs one stable
organization-owned financial subject and flexible, explicit participation.

### Concrete scenario

Alex and Jordan raise support together for one ministry assignment. Both may see
one through-dated support balance, but they are separate Parties with separate
expense claims, compensation arrangements, payroll identities, payment evidence,
security scopes, and access grants. Jordan later leaves while Alex and the
organization's ministry purpose continue.

The model must answer three things without rewriting history:

1. What stable record owns the Field Account?
2. What changes when Jordan's participation or access ends?
3. What separate D5 action is required if finance also needs to move or
   repurpose an organization-controlled balance?

### Options

#### Option A — Person-owned Field Account

The Field Account belongs to one worker Party.

**Advantage:** shortest single-worker implementation and familiar copy.

**Permanent concern:** it misstates organization ownership, cannot naturally
represent a shared couple, team, project, or participant succession, and invites
Party or household relationships to grant access, claimant, compensation, or
payee authority. A worker change becomes an identity migration.

**Assessment:** reject as the canonical model.

#### Option B — Couple- or household-owned Field Account

The Field Account belongs to a CRM household or special couple record.

**Advantage:** fits one common shared-support presentation.

**Permanent concern:** a household is relationship and recognition context, not
employment, expense, donor-purpose, access, payment, or organization-financial
authority. It fails singles, separate-spouse policies, non-household teams,
projects, marriage changes, and a worker with several assignments.

**Assessment:** reject as the canonical model.

#### Option C-prime — Organization-controlled Support Assignment with explicit participant membership

One first-class **Support Assignment** is the sole Field Account subject. It is
an organization-controlled ministry assignment/purpose, scoped to one Tenant and
Legal Entity. One canonical Field Account exists for each Support Assignment and
immutable ISO currency. Party participants attach through prospective,
effective-dated memberships.

**Advantages:** supports an ordinary single worker, a shared couple or team,
separate spouse assignments, one worker with several assignments, participant
turnover, and a project with no current worker without changing what a Party,
household, login, designation, payee, or accounting target means.

**Cost:** introduces one small first-class subject and membership relationship,
which the domain already implicitly needs.

**Assessment:** recommended.

### Hardened C-prime contract

#### Stable subject and cardinality

- A Support Assignment has one immutable identifier, Tenant, Legal Entity,
  charitable-purpose reference, bounded presentation kind, display label, and
  lifecycle. It is not a Party, household, portal user, donor designation,
  employment contract, claimant, payee, payment destination, GL account, or
  polymorphic owner container.
- Exactly one Field Account may exist per `Support Assignment × ISO currency`
  inside its Tenant and Legal Entity. D6 owns sibling currency accounts. A
  genuinely different ministry responsibility needs a distinct Support
  Assignment; duplicate same-scope wallets are prohibited.
- A Support Assignment may have zero participants during a project or governed
  transition, one worker, a couple, or a team. One Party may participate in
  several distinct Support Assignments. Duplicate overlapping membership for
  the same Party and assignment is rejected.

#### Membership is not authority

A **Support Assignment Participant Membership** records Party, effective start,
optional end, source, actor, reason, and immutable version/evidence. Membership
does not grant:

- dashboard or donor/contact access;
- expense claimant or approval authority;
- compensation funding, payroll identity, or payee status;
- payment destination or payment evidence;
- donor-purpose, reallocation, or account-close authority; or
- Phase 20 mapping, delivery, or accounting authority.

Each stays with its existing ratified owner. Phase 3/12 access can offer a safe,
explicitly confirmed setup default, but spouse, household, coach, team, or
participant membership alone never grants visibility.

#### Couple, team, project, and lifecycle behavior

- **Shared couple/team:** one Support Assignment, explicit Party memberships,
  and one Field Account per currency. Each person still has separate identity,
  access, claim, Engagement Authority Reference, compensation, handoff, and
  payment truth.
- **Separate spouses:** distinct Support Assignments for genuinely distinct
  organization responsibilities. A presentation grouping may display them
  together, but it creates no combined authoritative balance or implicit
  transfer.
- **Project/ministry:** the Support Assignment may continue with no current
  worker or with changing team membership.
- Marriage, separation, death, departure, or reassignment ends or adds
  memberships prospectively. It never silently merges, splits, rekeys, or moves
  the account. D5 alone governs any purpose-compatible balance reallocation or
  lifecycle succession.
- A source designation and accepted donor purpose remain Phase 13/source truth.
  Public copy may name participants, but adding, removing, or renaming a
  participant never rewrites the gift purpose, receipt, allocation, or closed
  history.

### UX/UI recommendation

The domain model must not burden the ordinary setup:

1. Start with **Who is this support balance for?**
   - `One worker` — quiet default;
   - `A couple or team`; or
   - `A project or ministry`.
2. The one-worker path asks only for worker, purpose/default designation, and
   currency while showing the inherited Legal Entity and safe defaults.
3. Couple/team reveals participant search and one clear choice: **one shared
   support balance** or **separate support balances**. Inline copy says that
   access, expenses, compensation, and payments remain separate.
4. Project/ministry permits no current participant and separates responsible
   staff contacts from participants and access.
5. The final review card shows assignment label, participants, purpose, Legal
   Entity, currency, access grants, and whether the balance is shared. Internal
   domain language stays behind progressive disclosure.
6. `Add participant`, `End participation`, and `Manage access` are adjacent but
   separate actions. The consequence panel states that membership changes do not
   move money or rewrite history and routes to D5 only when financial succession
   is actually needed.

Missionaries see one simple, ISO-labelled, through-dated **Support balance** card
per authorized assignment/currency. Shared accounts say **Shared support
balance** and name the participants; multiple assignments use a compact purpose
switcher. The surface never says `your money`, `owned by`, `wallet`, `withdraw`,
or `available funds`.

### Adversarial pre-ratification findings

Every requested risk class has a concern:

| Category                  | Concern                                                                                                                                               | Main permanent prevention                                                                      |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Brittleness               | Yes — current owner alternatives break on marriage, departure, team turnover, and projects.                                                           | One immutable Support Assignment subject plus versioned memberships and D5 succession.         |
| Technical debt            | Yes — a polymorphic owner or duplicated couple/project tables spread conditional logic everywhere.                                                    | One subject type, one membership relation, explicit downstream references.                     |
| Edge cases                | Yes — shared/separate spouses, two paid spouses, volunteer spouse, several assignments, empty project, death, separation, and late gifts are routine. | Deterministic fixtures and prospective membership/lifecycle rules.                             |
| Footguns                  | Yes — adding a spouse or changing a household could expose data or move presumed money.                                                               | Membership grants neither access nor financial effect; literal consequence preview.            |
| Tenant safety             | Yes — Party, assignment, entity, purpose, currency, or access substitution could cross scope.                                                         | Structural composite scope, authorization before enumeration, negative substitution tests.     |
| Over-engineering          | Yes — arbitrary owner types and configurable role matrices would obscure the simple case.                                                             | Three guided setup shapes over one bounded domain model; no arbitrary polymorphism.            |
| UX/UI friction            | Yes — forcing staff to understand assignment ontology makes ordinary onboarding harder.                                                               | One-worker default, progressive disclosure, plain copy, one review card.                       |
| Hidden coupling           | Yes — membership could accidentally become access, claimant, payroll, donor-purpose, or accounting authority.                                         | Independent records, capabilities, and invariant tests for every authority boundary.           |
| Failure modes             | Yes — concurrent joins/ends, stale access, or partial setup can leave contradictory state.                                                            | CAS/version checks, atomic setup intent, inspectable exception, idempotent recovery.           |
| Data integrity            | Yes — duplicate same-scope accounts or source allocations can double support.                                                                         | Unique assignment/currency account, exact source coverage, no arithmetic from current joins.   |
| Security/privacy          | Yes — shared accounts can expose donor or restricted-worker information to a spouse/team member.                                                      | Explicit purpose/field access, immediate independent revocation, Phase 10 floor.               |
| Scalability/performance   | Yes — resolving balances through live household/team joins creates fan-out and unstable queries.                                                      | Stable account key, indexed effective membership, pre-authorized projections.                  |
| Operational burden        | Yes — manual merge/split and access cleanup becomes tribal work.                                                                                      | Guided lifecycle actions, cause-owned D5 handoff, stale-membership/access exceptions.          |
| Observability             | Yes — staff may not know whether a change affected membership, access, purpose, or money.                                                             | Separate timelines and explicit `changed`/`unchanged` consequence summary.                     |
| Dependencies/integrations | Yes — MPDX/DonorHub/accounting systems use different account and user groupings.                                                                      | Provider-neutral assignment identity and D8/Phase 31 projections; no imported owner semantics. |
| Migration/upgrade         | Yes — legacy family, personal, and project accounts may be incomplete or destructively merged.                                                        | D17 source-covered mapping, non-overlap, reference history, no fabricated ownership.           |
| Other development hazards | Yes — Party merge, stale browser writes, date boundaries, and implicit household access can corrupt identity.                                         | Server-derived keys, half-open effective intervals, concurrency tests, fail-closed access.     |

### Production-shaped proof

The eventual spec must cover single workers; several assignments; shared and
separate spouses; two separately paid spouses; volunteer spouse; team rotation;
project with no worker; marriage, separation, death, and departure; participant
changes while claims or compensation are in flight; Party merge repair; late
gift after exit; sibling currencies; same Party across Legal Entities; access
revocation without financial mutation; membership end without access revocation;
legacy family/personal/project imports; cross-scope attacks; and concurrent
membership edits.

Observable invariants are:

1. exactly one subject type owns every Field Account;
2. account arithmetic never depends on current household or participant joins;
3. membership, access, claimant, compensation, payee, payment, donor-purpose,
   reallocation, and accounting writes remain independently authorized;
4. participant changes never rewrite closed Field Account history or accepted
   donor purpose; and
5. every balance-moving succession uses D5, every currency remains under D6,
   and accounting remains Phase 20.

### Recommended founder choice

> **Option C-prime — Organization-controlled Support Assignments with explicit
> participant membership.** One stable Support Assignment is the canonical
> Field Account subject; one Field Account exists per assignment and ISO
> currency inside one Tenant and Legal Entity; zero-to-many Party participants
> attach through prospective effective-dated memberships; and tenant staff can
> choose a one-worker, shared-couple/team, separate-account, multi-assignment, or
> project setup through progressive disclosure. Party, household, access, donor
> purpose, claimant, compensation, payee, payment, reallocation, accounting, and
> portal truth remain independently authoritative. Membership never grants
> access or moves money, marriage never forces a merge, and financial succession
> uses D5 rather than rewriting history.

### Founder selection and post-selection hardening (2026-08-01)

**Status:** The founder selected Option C-prime, required full spouse, team,
project-leadership, separate-login, notification, tenant-control, Supabase,
PostgreSQL, RLS, and UX hardening, and ratified the amended formulation below as
Phase 21 D19. D1-D18 are not reopened.

#### Binding four-truth separation

The selected direction is sound only when four records remain independently
authoritative:

1. **Support Assignment Participant Membership** records only that one Party
   participates in one organization-controlled Support Assignment during one
   exact half-open interval.
2. **Support Workspace authorization** is the Phase 12 request-time,
   principal- and Active-Tenant-Assignment-bound,
   Support-Assignment-, purpose-, projection-, capability-, Legal-Entity-, and
   effective-interval-scoped Phase 12 decision. Participation, marriage,
   household, team, or leadership labels never authorize.
3. **Source-owned Operational Responsibility** remains divided: D10/D13 own
   expense claimant, submitter, reviewer, and approval-route truth; D4 plus the
   exact external Engagement Authority source own compensation/payee identity;
   Phase 28 owns support-raising coaching and task truth; and Phase 12 owns
   current capabilities. A participant or workspace viewer inherits none of it.
4. **Support Workspace Notification Preference Version** is per recipient, Support
   Assignment, event family, purpose, interval, and channel. It grants no
   access. Delivery must re-prove the recipient's current notification-purpose
   authorization immediately before send.

One guided staff action may review and commit the selected local records plus an
outbox intent together. The records and evidence remain separate. External
invitation delivery is not falsely included in the database transaction: a
delivery failure leaves the valid assignment intact and creates one visible,
recoverable invitation exception. A pending invitation grants nothing.

This is intentionally not a new Phase 21 authorization engine. Phase 21
registers its resources, projections, purposes, and capability atoms with Phase
12's sole `resolveProjection` policy decision point and reuses Phase 12 named-
person/resource-scoped grants, Active-Tenant-Assignment binding, governance epoch,
`EffectiveAccess`, floors, and `explainAccess` behavior.

#### Exact domain and database contract

- `Support Assignment` and Phase 12 `Active Tenant Assignment` are different
  terms.
  The former is the organization-controlled Field Account subject; the latter
  is the principal's selected Tenant membership/security context. Code and
  schema use `support_assignment_id`, never an ambiguous `assignment_id`.
- The current database already has `public.support_assignments` for Support Hub
  conversation routing. Phase 21 must not reuse or rename that table. Its
  physical/API namespace is Field-Accounts-specific, such as
  `field_support_assignments`, while the product may keep the plain-language
  **Support Assignment** term.
- Every Support Assignment is scoped to exactly one Tenant and Legal Entity.
  Each child edge repeats those scope keys and uses composite foreign keys so a
  client cannot substitute a Party, principal, membership, purpose, Field
  Account, or notification recipient from another scope.
- Exactly one Field Account exists per `Tenant × Legal Entity × Support
Assignment × ISO currency`, preserving D6. Account arithmetic never depends
  on the current number or identity of participants.
- Participant memberships are prospective, effective-dated, source- and actor-
  evidenced, and append-only-corrected. Native uniqueness/non-overlap
  constraints reject duplicate or overlapping membership for the same Party
  and Support Assignment. Party merge, marriage, separation, death, departure,
  or leadership turnover never cascades deletion, unions access, or rewrites
  history.
- Access binds to an authenticated principal's exact active Tenant membership,
  not merely a Party, email, relationship, or `auth.users.id`. An unaccepted,
  expired, mismatched, revoked, or failed invitation is not access. Reactivating
  a user never resurrects a revoked grant or subscription.
- Participant, access, invitation, responsibility, and notification references
  use `ON DELETE RESTRICT` or an equivalent non-destructive lifecycle wherever
  history or finance evidence exists. No Party, auth-user, or household deletion
  may erase Field Account evidence.

Current-code prerequisites are explicit rather than silently recreated inside
D19: the canonical Party, Legal Entity, Phase 12 Active Tenant Assignment/PDP/grant
runtime, and Phase 21 tables do not yet exist. The present missionary portal
uses a service-role client, a broad missionary role, and direct
profile/missionary IDs; the admin Teams and missionary notification screens are
seed/local-state prototypes. They are useful visual/read-model seams, not
authorization or persistence authority. Phase 3/4/9/10/12 foundations must land
and be production-proved before D19 access can ship.

The local migration audit also found that a later `handle_new_user()`
replacement preserves donor-only role hardening but no longer inserts the
`authz.memberships` row created by the earlier foundation; seed data masks the
gap. The permanent prerequisite is a final-chain behavior test and an explicit
safe membership/Active-Assignment onboarding result. D19 must not compensate by
trusting signup metadata or inventing its own login membership.

#### Supabase/PostgreSQL and RLS contract

Current repo evidence makes one tempting design explicitly invalid. The current
`authz.memberships` foundation is tenant-wide and the current donation RLS path
assumes one `donations.missionary_id → missionaries.profile_id → auth.uid()`.
Neither is the Phase 21 many-participant authorization model.

- Phase 12 remains binding: RLS is a **coarse Tenant isolation backstop only**.
  D19 RLS contains no participant, spouse, Party, principal, capability, role,
  field-family, purpose, or Support Assignment authorization logic.
- All D19 raw tables and current participation/access projections are browser-
  inaccessible and server-only. The browser receives only the purpose-built,
  field-allowlisted projection returned after `resolveProjection(principal,
active_assignment, target, purpose)` and an exact server-side Tenant, Legal
  Entity, Support Assignment, and version check.
- Every D19 table has RLS enabled and forced, a unified
  `current_tenant_id()` policy, explicit least-privilege grants, deployed-
  catalog proof, and no `USING (true)` authenticated escape. `FORCE ROW LEVEL
SECURITY` limits ordinary owner bypass; it does not pretend to constrain
  superuser/`BYPASSRLS` or Supabase service/secret-key work.
- Every privileged server path therefore performs the same explicit Phase 12
  authorization and scope checks before any read or mutation. A service key is
  never evidence of user authority and never reaches a browser.
- Fine-grained assignment grants do not live in `user_metadata`, JWT assignment
  arrays, cookies, or client state. Supabase documents that user metadata is
  user-editable and JWT authorization claims can remain stale until refresh.
- Any client-visible PostgreSQL view is `security_invoker=true`; otherwise it
  stays in an unexposed schema with browser grants revoked. Any
  `SECURITY DEFINER` helper is non-exposed, boolean/narrow, fully qualified with
  an empty fixed search path, owned by a non-login role, and has PUBLIC execute
  revoked before the minimum explicit grant.
- D19 financial, participant, access, and notification tables never use raw
  `postgres_changes`. If live refresh is justified, a private signal-only
  Broadcast carries only opaque resource kind, opaque id, monotonic version,
  and operation; the client then re-fetches through the authorized server
  projection. Revocation invalidates access and queued delivery eligibility
  before any later disclosure.

This architecture follows current Supabase guidance to enable RLS on exposed
tables, index policy columns, use explicit role targets, protect privileged
helpers, and treat service keys as bypassing RLS. It also follows PostgreSQL's
warnings that table owners normally bypass RLS, permissive policies combine by
`OR`, constraints can become covert channels, and policies that consult other
tables can create race conditions. The permanent response is structural scope,
coarse RLS, one server PDP, non-enumerating errors, and behavioral tests—not a
second many-to-many authorization system inside RLS.

#### One calm `People & access` experience

The common path remains short. From one Support Assignment, authorized staff
open **People & access**, choose a person, and review three plain-language
choices:

- **Associated with this support balance** — participant relationship and
  effective dates;
- **Can use the Support Workspace** — one bounded safe access starting point or
  `No workspace access`; and
- **Gets updates** — event families and channels, or `No notifications`.

Tenant defaults may preselect safe values prospectively, including an ordinary
participant workspace and a quiet gift-activity digest. The confirmation card
states exactly what will change and what will not. Advanced access links to the
existing Phase 12 permission product; the common flow never shows an arbitrary
capability matrix.

Safe starting points compile to exact Phase 12 capabilities rather than
authorizing by label:

- **Participant workspace:** published support summary and permitted activity;
  no donor PII, private claim evidence, payroll/payee data, approval, or access
  administration unless separately granted.
- **Participant + own expenses:** participant workspace plus D10/D13 claimant-
  bound create/edit/submit; never approval or another claimant's evidence.
- **Coach progress view:** privacy-safe progress/goal projection only; no raw
  gifts, donor identity, Field Account journal, claims, or compensation.
- **Project/team summary:** published shared summary; no participant-private or
  finance-private records.
- **Finance/operations:** existing Phase 12 staff capabilities, never created
  from participant or leadership membership.

Each spouse or teammate keeps a separate Party, login principal, invitation,
access grant, claimant identity, preferences, and notification state even when
both share one Support Assignment and Field Account. A leader may be a
participant, a responsible staff contact, a summary viewer, an approver, a
notification recipient, or several of those—but each selection is explicit.
A project may have zero participants and remain operable by separately
authorized staff.

Missionaries with several assignments receive an accessible, deep-linkable
assignment switcher that always shows assignment, Legal Entity when needed,
and ISO currency. The server reauthorizes every navigation and mutation. There
is no authoritative combined balance. An expense draft is pinned to its exact
assignment and currency, and losing access safely moves the user to an
authorized default without revealing whether the old assignment still exists.

`Change participation` is one guided life-event flow with separate consequence
rows for participation, workspace access, responsibilities/approvals,
notifications, and money/history. The safe final line is either **No balance
moves. No closed history changes.** or an explicit separately authorized D5
reallocation/succession case. Immediate safety separation revokes access now;
ordinary departure may end it prospectively. Neither requires the departing,
separated, deceased, or incapacitated person to approve removal.

#### Ruthless adversarial review after founder selection

| Category                      | Concern and what could go wrong                                                                                                                                                                                               | Why it matters                                                                         | Severity | Likelihood                          | Best permanent prevention                                                                                                                                                                               |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Brittleness**               | **Yes.** A one-person, one-login, one-assignment assumption fails for couples, projects, multiple assignments, pending identities, and stale tabs.                                                                            | The failure posts work to or discloses data from the wrong assignment.                 | Critical | High without controls; Medium after | Stable Support Assignment; zero-to-many memberships; exact server-authorized scope on every read/write; no cross-assignment aggregate authority.                                                        |
| **Technical debt**            | **Yes.** Phase 21 could grow a parallel ACL or scatter `isParticipant`, `isSpouse`, and `isLeader` checks.                                                                                                                    | Revocation and field visibility would drift across routes and jobs.                    | High     | High                                | Reuse Phase 12's sole PDP/grant registry; register only D19 resources and capabilities; architecture-test that relationship names never authorize.                                                      |
| **Edge cases**                | **Yes.** Two paid spouses, one volunteer spouse, participant without login, leader without participation, empty project, multiple entities, Party merge, death, and open claims during departure are normal.                  | Ambiguity exposes data or strands work.                                                | Critical | High                                | Make each a deterministic fixture; independent half-open intervals; exact identity binding; guided life-event orchestration; no automatic financial effect.                                             |
| **Footguns**                  | **Yes.** `Add spouse`, `Share`, `Make leader`, or `Remove` could silently grant broad access, expose receipts/donors, subscribe noise, or appear to move funds.                                                               | Friendly labels conceal materially different consequences.                             | Critical | High                                | Intent-specific controls, safe presets, literal changed/unchanged review, independent records, and no broad `shared account` toggle.                                                                    |
| **Tenant safety**             | **Yes.** A stale selector, guessed UUID, email invite, or service-key path could cross Tenant, Legal Entity, or Support Assignment.                                                                                           | This is a direct financial/privacy breach.                                             | Critical | Medium before controls; Low after   | Server-owned Active Tenant Assignment; composite same-scope FKs; coarse forced RLS; uniform not-found responses; explicit authorization in bypass paths; substitution tests.                            |
| **Over-engineering**          | **Yes.** Arbitrary local roles, nested teams, custom rule matrices, and assignment-aware RLS would make a one-worker tenant administer an IAM product.                                                                        | Complexity causes abandonment and dangerously broad defaults.                          | High     | Medium-high                         | One page, a few bounded presets, quiet tenant defaults, progressive disclosure, and Phase 12 advanced controls; no second ReBAC/RBAC engine.                                                            |
| **UX/UI friction**            | **Yes.** Staff may not distinguish association, login, approval, and alerts; missionaries may lose assignment/currency context; invite recovery may be desktop-only.                                                          | Confusion drives shared credentials and support tickets.                               | High     | High                                | One `People & access` surface, one common-path review, persistent scoped switcher, mobile-complete invites, visible status/recovery, WCAG 2.2 AA gates.                                                 |
| **Hidden coupling**           | **Yes.** Participation could become access; access could become claimant/approver; notification could survive revocation; Party count could affect balance math.                                                              | A harmless people change would mutate unrelated security or financial truth.           | Critical | High                                | Four independent truths, explicit references, invariant tests, and D5-only balance succession.                                                                                                          |
| **Failure modes**             | **Yes.** Email delivery can fail after local creation; wrong-account acceptance, concurrent accept/revoke, stale sessions, or partial departure can leave ghost access or orphaned work.                                      | Silent partial success is unsafe and hard to recover.                                  | Critical | Medium-high                         | Local truth plus outbox; pending grants nothing; expiring single-use invites; CAS/idempotency; deny-first epoch revocation; inspect-before-retry; exception-first recovery.                             |
| **Data integrity**            | **Yes.** Overlapping memberships, duplicate invites, cross-scope FKs, Party-merge union, or destructive deletion can make access/history unprovable.                                                                          | Finance and security evidence can no longer be trusted.                                | Critical | Medium                              | Native unique/exclusion constraints; exact composite FKs; append-only corrections; `ON DELETE RESTRICT`; semantic idempotency; Party-merge exception instead of union.                                  |
| **Security/privacy**          | **Yes.** A spouse, coach, or leader could see donor PII, another claimant's receipt, payroll/payee data, or a restricted worker's identity.                                                                                   | The data is financial, relational, religious, and sometimes physical-safety sensitive. | Critical | High if sharing is broad            | Purpose-specific projections; Phase 10/12 floors; supporter-identity capability separate from gift activity; alias-safe messages; read audit; immediate independent revocation.                         |
| **Scalability/performance**   | **Yes.** Household/team graph joins, per-row policy calls, N+1 access checks, giant JWT grant lists, OFFSET paging, or one alert per member can collapse at scale.                                                            | Seasonal gift and expense workloads amplify latency and notification storms.           | High     | Medium-high                         | Stable indexed assignment keys; set-based PDP; current relational grants; keyset pagination; semantic dedupe/digests; production-cardinality `EXPLAIN (ANALYZE, BUFFERS)` budgets.                      |
| **Operational burden**        | **Yes.** Staff could need a tribal checklist for revoke, alerts, approvals, claims, invite repair, and succession.                                                                                                            | Departures happen under time pressure and omissions create exposure.                   | High     | High                                | One event-based lifecycle flow with safe defaults, reassignment suggestions, unresolved exceptions, and one consequence/completion summary.                                                             |
| **Observability gaps**        | **Yes.** Staff may not know why someone can see a fund, whether an invite worked, what revocation changed, or why delivery stopped.                                                                                           | Teams compensate by over-granting or escalating to developers.                         | High     | High                                | Separate timelines plus `explainAccess`; correlation IDs; pending/failed/orphaned exceptions; revocation-lag, invitation, responsibility, and delivery metrics without PII.                             |
| **Dependency/integration**    | **Yes.** Identity providers can mismatch/expire invites, email can delay, SCIM can lag, and MPDX/DonorHub grouping may be broader than Asym.                                                                                  | Provider quirks can create ghost access or lockouts.                                   | High     | Medium                              | Provider-neutral local truth; external status as evidence only; exact identity acceptance; immediate local quarantine; staged imported associations, never imported grants.                             |
| **Migration/upgrade**         | **Yes.** Legacy data may contain shared credentials, irreversible spouse merges, whole-account sharing, participants without users, or one profile spanning many designations.                                                | Treating ambiguous history as exact either overexposes or locks out users.             | Critical | High for migrations                 | Source-labelled coverage manifest; map Party, principal, participation, and grant separately; pending-review access by default; no fabricated acceptance or destructive merge replay.                   |
| **Other development hazards** | **Yes.** Time-zone boundaries, concurrent interval edits, covert identifier leaks, stale caches, duplicate notifications, self-approval across two principals, inaccessible controls, or UI-only tests can bypass the design. | These are common paths around an otherwise correct model.                              | Critical | Medium-high                         | UTC instants/half-open intervals; DB constraints; CAS; Party-based separation-of-duties; non-enumerating errors; cache keys include authorization version; behavioral pgTAP/API/concurrency/a11y tests. |

#### Required proof before shipping

The implementation spec must require migration/catalog proof and real behavior,
not SQL-text inspection alone:

- pgTAP proves exact tables, composite constraints/FKs, unique/exclusion and FK
  indexes, grants, policies, `relrowsecurity`, `relforcerowsecurity`, function
  hardening, and security-invoker/unexposed views;
- API/RLS tests prove anonymous denial, cross-Tenant, cross-Legal-Entity, cross-
  assignment, participant-without-access, access-without-participation, spouse/
  household/leader-without-grant, revoked/expired-old-JWT, restricted-field,
  enumeration, and service-bypass-without-PDP denial;
- concurrency tests race add/end, duplicate/future intervals, invite
  accept/revoke, grant/revoke, Party merge, notification enqueue/revoke, and
  stale-browser mutations;
- production-shaped plans cover a principal with many assignments, an
  assignment with many participants/viewers, and large tenants without N+1 or
  giant token state;
- end-to-end tests cover separate spouse logins, shared and separate
  assignments, project with no participant, coach/leader projections,
  notification deduplication, invitation failure/reissue, life events, and
  exact assignment/currency navigation; and
- the complete surface passes keyboard, screen-reader, status-announcement,
  visible/unobscured focus, 320-CSS-pixel reflow, 400% zoom, target-size, and
  error-prevention gates under WCAG 2.2 AA.

#### Ratified Phase 21 D19

> **C-prime-amended-and-hardened (C-prime-R) — one immutable,
> organization-controlled, Tenant- and Legal-Entity-scoped Support Assignment
> as the canonical Field Account subject, with one Field Account per Support
> Assignment and ISO currency; zero-to-many prospective, effective-dated,
> append-only-corrected Support Assignment Participant Memberships; and
> separately authoritative Phase 12 principal-bound Workspace Access, source-
> owned operational responsibility, and recipient-scoped Support Workspace
> Notification Preference Versions.
> One quiet “People & access” experience may commit the explicitly selected
> local truths and outbox intent through tenant-configurable safe presets and
> one literal consequence review, while every spouse, teammate, leader, coach,
> and staff member retains a separate Party identity and, where applicable,
> separate login principal, invitation, access, claimant, responsibility, and
> preference identities. Participant-free
> projects, shared couples/teams, separate spouse assignments, several
> assignments per person, scoped leadership, mobile-complete invitation and
> recovery, deny-first revocation, life-event succession, exact per-assignment
> and ISO-currency navigation, composite Tenant/Legal-Entity scope, coarse
> forced RLS, server-only projections through the sole Phase 12 PDP, signal-only
> Realtime, append-only evidence, and production-shaped isolation, concurrency,
> performance, privacy, and accessibility proof are mandatory—without person-
> or household-owned funds, shared credentials, implicit spouse/team/leader
> access, relationship-based authorization, broad account sharing, a Phase 21
> ACL engine, assignment-aware RLS, JWT grant lists, client-trusted scope, raw
> financial `postgres_changes`, destructive merge, cascade deletion, stale
> notification eligibility, or participation-driven money movement.**

## Post-D19 preservation and cross-phase congruency audit

**Audit date:** 2026-08-01
**Disposition:** D1-D19 remain intact. No ratified decision, original Phase 21
outcome, Phase 17 message-purpose key, Phase 18 document-purpose key, numbered
roadmap row, or accepted ADR was removed. The audit found interpretation and
terminology collisions introduced when D19 replaced the older implicit
`worker`/`participant` Field Account subject; those collisions were corrected
without reopening the decisions.

### Preserved decision coverage

| Observable Phase 21 responsibility                                                                                                     | Ratified authority retained |
| -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| Finance-closed Field Account truth, rail-qualified admission, integrity, opening position, and exact cutover                           | D1, D2, D11, D17            |
| Administrative assessments, compensation funding, and optional support planning/publication                                            | D3, D4, D9                  |
| Reallocation, exit disposition, and independently balanced currency-scoped accounts                                                    | D5, D6                      |
| Compensation-provider handoff and read-only missionary support continuity feed                                                         | D7, D8                      |
| Claim-level expense truth, policy, card evidence, reimbursement handoff, advances/repayments, and travel calculations                  | D10, D13-D16, D18           |
| Immutable close-derived statements with tenant-controlled publication                                                                  | D12                         |
| Organization-controlled Support Assignment subject, participant membership, separated access/responsibility, and recipient preferences | D19                         |

The original `months of runway` and `low-balance alert` intent was not dropped.
D9 deliberately expresses it as optional, through-dated Balance Coverage,
Reserve Position, and Plan-derived alerts so a tenant that does not publish
balance or commitment truth receives neither a false zero nor a mandatory
module.

### Corrective interpretation applied

1. Field Account financial scope is now exact `Tenant × Legal Entity × Support
Assignment × ISO currency`; worker/payee scope applies only to person-
   specific expense, compensation, handoff, and payment authorities.
2. D3 classification/lifecycle selectors require explicit prospective source-
   labelled Support-Assignment applicability and never infer from participant
   membership, access, or relationships.
3. D6 account creation and every sibling-currency activation bind the exact
   Support Assignment; approved charitable purpose remains a separately
   versioned mapping.
4. D8 uses **Missionary Support Feed Subject** for the Support Assignment and
   **recipient** for the authorized principal/Party. D11 uses **Field-Account-
   side** and **organization-control-side**, never `participant/control`.
5. D12 artifact access binds the current recipient principal/Party, Active
   Tenant Assignment, Support Assignment, purpose/projection/floor, and
   authorization; participation is not access.
6. D14 uses claimant Party and source-owned relationship context. D7/D15 use
   the qualified term **external provider participant/payee reference**. D18
   uses claimant Party plus its exact source-owned relationship/engagement
   version for applicability and cumulative capacity.
7. D10/D13 retain expense claimant/reviewer/approval-route truth; D4 and the
   external Engagement Authority retain compensation/payee identity; Phase 28
   retains support-raising coaching/task truth; Phase 12 retains current
   capabilities. D19 participation grants none of them.
8. A participant may exist without a login. Anyone who uses the Support
   Workspace must use their own verified login; shared credentials remain
   forbidden.
9. The D9/D12 Publication Profile may enable a notification event family and
   set its safe tenant default. Only the recipient-scoped **Support Workspace
   Notification Preference Version** owns channel preference, and Phase 6
   re-proves send eligibility.
10. Phase 20 preserves Support Assignment identity only as source lineage.
    Membership, access, responsibility, notification, and `People & access`
    changes remain accounting-dark, including for participant-free projects.

### Preservation proof

- Decision-log enumeration remains exactly D1 through D19, once each; accepted
  ADR mapping remains ADR-0090 through ADR-0108 in the same order.
- A before/after key comparison retained all 38 previously established Phase
  17 executable-message keys and all 40 Phase 18 document-purpose keys.
- A before/after roadmap comparison retained every numbered phase row.
- Canonical glossary coverage was retained. The only deliberate security-term
  rename is **Active Tenant Assignment**; the prior `Active assignment` wording
  remains documented as a rejected/legacy alias rather than a second concept.
- The existing `public.support_assignments` runtime table remains explicitly
  reserved for Support Hub conversation routing; D19's future Field Accounts
  namespace remains separate.

### Still-open founder seams

This audit did not claim Phase 21 was complete. It selected how organization-
incurred benefits, services, and direct ministry costs outside D3, D4, and
D10/D13 may affect a Support Assignment without becoming arbitrary debits or
duplicate payroll/AP/accounting as the next founder seam; that seam is now
resolved by D20 below. Other candidate seams remain research inputs only until
a later one-at-a-time founder decision ratifies them.

## D20 decision research — organization-incurred support costs

**Status:** Founder ratified C-prime-amended-and-hardened as Phase 21 D20 on
2026-08-01. D1-D19 remain ratified and are not reopened.
**Question:** When the organization incurs an exact benefit, shared service, or
direct ministry cost outside D3 assessments, D4 compensation, and D10/D13
expense claims, how may it affect a Support Assignment's Field Account without
duplicating payroll, AP, QBO/Xero, or another Phase 21 occurrence?

### Why this is a real missions-organization workflow

- Reliant's current published order applies employee benefits and direct MTD
  fund charges before payroll and reimbursements; direct charges include
  required training/coaching/events, role-readiness materials, and partner-
  billed costs. Reliant permits some guaranteed costs to create a negative MTD
  position, which proves the operational need but is not compatible with Phase
  21's ratified nonnegative Field Account invariant. See [Reliant Order of
  Pay](https://solomon.reliant.org/display/public/fieldbenefits/Order%2Bof%2BPay).
- ABWE separately identifies a percentage financial-services charge, a monthly
  missionary-services contribution, and centrally subsidized services. Similar
  business costs therefore may be an assessment, a direct Support Assignment
  cost, or organization-absorbed depending on tenant policy. See [ABWE
  administrative-services model](https://abwe.org/financial-model/).
- Pioneers and Ethnos360 describe personalized or recommended support budgets
  containing salary, benefits, travel, ministry costs, and other operating
  needs. Those examples validate tenant variation and transparent categories,
  but a budget or recommended-support percentage is forecast truth, not proof
  that an exact cost occurred. See [Pioneers' funding
  model](https://pioneers.org/funding-your-ministry), [Pioneers' giving
  FAQ](https://pioneers.org/give/givinghelp), and [Ethnos360 giving
  questions](https://ethnos360.org/give/questions).
- Gusto models employee deductions and company contributions as separate
  provider-owned benefit facts. Phase 21 must reference only the qualified
  organization cost; it must not reproduce benefit enrollment, payroll
  deduction, tax, or contribution calculations. See [Gusto employee-benefit
  documentation](https://docs.gusto.com/embedded-payroll/docs/manage-employee-benefits).
- Bills, vendor credits, AP balances, bill payment, and final expense history
  remain accounting-system truth. QuickBooks explicitly models bills, vendor
  credits, AP, and payments as separate linked records. See [QuickBooks Online
  bill workflow](https://developer.intuit.com/app/developer/qbo/docs/learn/learn-basic-bookkeeping/pay-bills)
  and the [Xero Accounting API](https://developer.xero.com/documentation/api/accounting/overview).
- Reviewed allocation UX should show source total, allocated amount, and
  remainder while conserving the exact source. This is the useful bounded
  lesson from [SAP Concur allocations](https://help.sap.com/docs/CONCUR_EXPENSE/cd24ad794821491e8f65f76f61dffcc6/e33655d6820742aaad8293c8ffaf0421.html),
  [Ramp transaction splits](https://support.ramp.com/splitting-transactions-or-reimbursements/),
  and [Expensify expense splits](https://help.expensify.com/articles/new-expensify/reports-and-expenses/Split-Expenses)—not permission to import their full
  expense-accounting products.
- Source records remain mutable even after ordinary bookkeeping controls.
  QuickBooks recommends webhook repair through Change Data Capture and warns
  that events may arrive out of order; Xero requires replayable, idempotent
  consumers under per-organization API limits. D20 therefore needs immutable
  close-time source snapshots, adapter-specific finality, scheduled repair,
  and drift detection rather than a universal `record exists` rule. See
  [QuickBooks webhook best
  practices](https://developer.intuit.com/app/developer/qbo/docs/develop/webhooks/best-practices),
  [QuickBooks Change Data
  Capture](https://developer.intuit.com/app/developer/qbo/docs/learn/explore-the-quickbooks-online-api/change-data-capture),
  [Xero webhook guidance](https://developer.xero.com/documentation/guides/webhooks/overview/),
  and [Xero API limits](https://developer.xero.com/documentation/guides/oauth2/limits).

The repository confirms the authority gap. D3 owns only Administrative
Assessment Profile components. D4 owns compensation-linked organization costs
only when qualified external compensation truth supplies them. D10/D13 own
claims and approved organization-paid expenses. Phase 20 D19 owns processor-
cost attribution and its separately enabled Phase 21 processor-cost effect;
those costs cannot enter D20. D9 expressly does not become benefits authority.
The original Phase 21 brief still asks how residual technology, member
services, training, and other direct ministry costs should behave after those
existing owners are excluded.

### Concrete decision test

Harbor Missions has one shared Support Assignment for Alex and Jordan. March's
qualified external compensation truth includes a provider-finalized $740
employer health cost and $180 employer retirement contribution; those route
only through D4. D3 separately owns Harbor's ordinary monthly technology levy.
Two source-final facts remain outside those lanes: a $55 actual usage-attributed
technology cost that is not part of the D3 levy, and a $120 required-training
invoice paid directly by Harbor that is neither a claimant expense nor an
organization-card occurrence. The technology source is split with another
Support Assignment, a $30 vendor credit arrives after close, and the Field
Account has only $150 of unused confirmed capacity. The credit must return
through whichever lane owned the original source; ambiguous ownership blocks
rather than letting staff choose a convenient lane. Alex and Jordan should see
calm grouped costs, not health-plan details, employee deductions, AP jargon, or
a suggestion that they personally owe money.

### Options

#### Option A — Keep every residual cost external

Payroll, benefits, AP, QBO, and Xero retain all such costs; Phase 21 never
reserves or applies them. This is the smallest model, but Field Account truth
can materially diverge from the tenant's operating model. Staff will recreate
arbitrary adjustments or spreadsheets, and missionaries will see unexplained
differences.

#### Option B — Force every cost into D3, D4, or D10/D13

This reuses existing screens, but it is semantically false. A direct vendor or
internal service cost is not necessarily an assessment, compensation component,
or claimant expense. It creates duplicate application, incorrect reversal,
privacy, and reporting risk across already-ratified authorities.

#### Option C-prime — Source-authoritative, policy-bounded Organization Support Cost Applications — founder ratified after hardening

Add one narrow absent-unless-enabled lane only for residual cost families whose
canonical semantic ownership is not D3, D4, D10/D13, or Phase 20 D19
processor-cost attribution.

Every qualified cost occurrence keeps one source-truth authority and has at
most one Phase 21 Field Account application owner. Source authority never
transfers to Phase 21, and the same source coverage cannot enter two
application lanes.

| Economic fact                                                                                                                                | Source-of-record authority                                                           | Exclusive Phase 21 Field Account application lane              |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| Percentage, minimum, flat, cap, or ordinary monthly-service assessment                                                                       | D3 profile, determination, and covered source facts                                  | D3 Assessment Entry only                                       |
| Compensation-linked employer cost admitted by a qualified Compensation Funding Plan                                                          | External payroll, benefits, or Engagement Authority source referenced by D4          | D4 effect only                                                 |
| Claimant expense, organization-card expense, or approved organization-paid expense                                                           | D10 source/economic-payer truth plus D13 approval                                    | Existing D10/D13 expense effect only                           |
| Processor fee/cost or designation-borne uncovered processor-cost effect                                                                      | Exact provider evidence and Phase 20 D19 Processor Cost Attribution Manifest         | Separately enabled Phase 21 processor-cost effect only         |
| Bill, vendor credit, payment, AP balance, or GL posting                                                                                      | External AP or accounting authority                                                  | None by itself; external evidence never debits a Field Account |
| Source-final organization-provided service or direct-cost occurrence whose canonical semantic family is assigned exclusively to Phase 21 D20 | Explicitly enrolled external provider/AP observation or governed exact tenant source | Phase 21 D20 owns only its internal Field Account application  |

The source system proves what occurred. The winning Phase 21 lane proves
whether and how that occurrence may affect a Field Account. Canonical semantic
ownership is configuration-independent: disabling, failing to configure, or
temporarily losing D3, D4, D10/D13, or the Phase 20 D19 processor-cost path
never makes that lane's fact eligible for Phase 21 D20. Phase 21 D20 does not
ingest or mirror a tenant's whole AP, benefits, processor, or accounting ledger;
it accepts only exact occurrences from explicitly enrolled,
capability-certified source bindings. A QBO/Xero posting, benefit enrollment,
invoice, payroll line, budget, estimate, mutable draft, or provider-record
existence never grants Field Account application authority merely because it
exists.

#### Source admission, finality, and economic identity

Every enrolled family uses one prospective, versioned **Support Cost Source
Admission Contract**. It pins the exact Tenant, Legal Entity, provider
organization and environment or governed tenant source, object and line
identity, canonical semantic family, qualifying finality event, credit and
correction events, completeness watermark, source currency and precision,
schema/adapter version, and capability-expiry behavior. A provider capability
may certify different finality by source family; D20 does not pretend that
`posted`, `approved`, `authorized`, or `paid` means the same thing everywhere.
Gusto benefit configuration remains D4-adjacent source configuration rather
than an incurred D20 cost, while QBO and Xero bills, payments, credits, and
statuses remain distinct source facts. D1 close reads persisted qualified
evidence and never makes a live provider call.

One canonical **Support Cost Economic Occurrence Root** joins every source
alias and equivalence proof for the same real-world cost. Provider IDs remain
preserved but are not assumed to prove economic uniqueness. A suspected
benefit-statement, AP-bill, card, reimbursement, or governed-manual duplicate
creates one cause-owned review case; staff cannot bypass it by labelling two
sources as distinct without exact evidence. Exact purpose compatibility and
source-supported benefit, consumption, contract, or service attribution choose
eligible targets. Participant membership, login, notification preference,
current balance, gifts, or arbitrary weights never choose the target or split.

Activation is prospective at one exact source-family half-open boundary,
defaulting to the next complete Support Cycle. One activation coverage manifest
dispositions every in-flight and pre-boundary fact and proves no overlap with
D17 Opening Position truth, previous spreadsheets, manual adjustments, or
another application owner. There is no ordinary backfill, dual write, or
whole-history replay.

One prospective **Support Cost Bearing Policy Version** selects, per certified
cost family, `organization absorbed`, `Field Account borne`, `reviewed exact
split`, or `review required`. It moves through `draft` → `preflight passed` →
`active` → `superseded`; exactly one version wins for the Tenant, Legal Entity,
cost family, purpose, ISO currency, and half-open effective interval. Tenant
labels may map to a finite canonical catalog, but there is no executable
formula, script, journal entry, donation-percentage rule, balance-relative
charge, participant-count rule, or custom lifecycle.

`Organization absorbed` is the guided default for every newly enrolled family.
Unknown families route to review. A governed tenant-entered source is allowed
only as an exact source occurrence with issuer, reference, amount, ISO currency,
service/effective period, semantic family, purpose attribution, evidence policy,
and authorized actor; it is not a free-form `charge balance`, journal, or
adjustment command. Tenant policy may use one finance approver or a
threshold/conflict-based second approver through existing Phase 12 authority,
but D20 does not impose a universal maker-checker ceremony or invent another
approval engine.

An allocation basis never calculates the cost. It only distributes one exact,
source-final amount by exact source attribution, a documented contract-fixed
price for service actually provided, fixed proportions of that exact source
amount, or one reviewed exact split. Percentage of gifts, support, or balance;
estimates; budgets; expected invoices; and recurring administrative or member-
service levies are excluded. The latter belong to D3. A contract-fixed basis is
eligible only after the exact recognized source occurrence exists and preserves
the exact amount, ISO currency, service period, Support Assignment, and source
authority. An expected cost or contract alone never consumes capacity.

The lifecycle is exact and staged:

1. a private **Support Cost Source Observation** has no financial effect;
2. certified source finality may qualify one immutable **Organization Support
   Cost Occurrence**;
3. an immutable **Support Cost Application Determination** proposes exact
   source dispositions and creates a cause-owned exception for anything still
   unresolved;
4. a short CAS fence publishes one immutable **Support Cost Application
   Manifest** containing only `Field Account target`, `organization absorbed`,
   or `carryforward` terminal lines and creates exact purpose-typed,
   non-reusable Field Account Funding Coverage for each target; and
5. D1 Support Cycle Admission Coverage and close alone turn the exact target
   into an applied effect.

`Unresolved` is a progress and exception state, never a close-admissible
terminal disposition. A known unresolved line blocks only its smallest proved
affected target; independently complete targets remain closable. Pre-close UX
and APIs say **Field Account target**, not `applied`. Every closed D20
application or correction is one atomic, balanced, same-currency D11 Field
Account Occurrence: the exact Field-Account-side entry and exact
organization-control-side counter-entry commit together.

The source root and every target manifest are exact Tenant × Legal Entity × ISO
currency and contain scoped Support Assignment and Field Account lines. They
prove two non-mixing conservation equations:

```text
source-currency terminal dispositions + source-currency unresolved
= exact qualified source amount

each target-currency terminal disposition
= exact externally supplied target-currency amount
```

Every cross-currency target line therefore preserves both its exact source-
currency share and exact externally supplied target-currency amount. Conversion
fees, source and target amounts, ISO currencies, timestamps, provenance, and
deterministic minor-unit rounding stay explicit. Rounding is assigned to a
terminal bucket by the existing rule, never a free residual. No equation adds
different currencies. Canonical economic-root plus source-line and cross-lane
coverage constraints prevent D3/D4/D10/D13/Phase 20 D19/Phase 21 D20 double
application.

A source credit, cancellation, refund, reclassification, or correction uses
the same original application owner, pinned policy, allocation basis, currency
evidence, and rounding rule. A successor determination re-evaluates the
corrected source total and appends exact per-bucket and per-target deltas in a
later qualified Support Cycle. It cannot credit more than the original
remaining reversible disposition, assign an unlinked general vendor credit
wherever staff prefers, mutate the original, or reopen a close. The record
preserves distinct source-effective/service-period, source-finality, discovery,
determination, and D1-close dates.

At close, D20 freezes the exact source/provider identifier and version, amount,
currency, source status and dates, service period, semantic family, source-line
attribution, evidence digest/provenance, adapter version, and complete
disposition manifest. A later provider edit, deletion, void, credit, or schema
reinterpretation creates drift evidence and a source-linked successor case; it
cannot mutate the closed occurrence. If the original Field Account is retired,
the correction follows D5's source-owned lifecycle succession rather than a
staff-selected new target.

The application never makes a Field Account negative, and an unallocated
remainder never silently defaults to a Field Account. The prospective tenant
policy may absorb an unsupported remainder, leave it for review, or create a
separately truthful optional **Support Cost Carryforward**. The guided
insufficient-capacity default is organization absorbed or review. Carryforward
is an advanced, prospectively enabled option with a per-Field-Account/currency
maximum, maximum age, and explicit successor disposition. Each non-overlapping
minor-unit tranche may reserve capacity only once through ordinary purpose-
typed Field Account Funding Coverage after complete reproof; every D5 and other
capacity calculation sees that active coverage.

Carryforward has no present Field Account effect and never lowers the Finance-
confirmed balance until a later close applies it. Reaching its maximum age
appends the configured `organization absorbed` or `review required` successor;
it never silently expires, releases already consumed capacity, disappears, or
becomes a worker debt. Field Account retirement does not transfer it
automatically. It remains finance-visible. It is hidden from missionaries by
default; when D9/D12 plus Phase 12/D19 explicitly authorize publication, it
appears separately as **Pending organization cost** with: **This has not reduced
your finance-confirmed support balance and is not an amount you owe.**
Corrections reduce the exact remaining outcome coverage rather than creating a
windfall.

Each application is one ISO currency. D6's contribution/designation-specific
Support Currency Allocation Manifest is not reused. D20 is same-Field-Account-
currency unless the authoritative external source supplies an exact target-
currency result and conversion evidence. In that case, preserve both amounts,
both ISO currencies, conversion provenance, time, fees, and source reference;
there is no staff-authored or current-rate substitution and no Asym FX math.
Without that evidence, the cost remains held for review or organization-
absorbed according to policy.

D20 Field Account truth is independent of accounting delivery. It emits only a
PII-minimized **Support Cost Accounting Candidate Handoff**, which remains
accounting-dark unless a separately approved Phase 20 source contract promotes
an eligible closed occurrence through accountant-confirmed semantics, Posting
Profile treatment, positive nonduplicate/unposted proof, and D17 posting
ownership/cutover. A source observation,
allocation determination, manifest, reservation, carryforward, or organization-
absorbed amount cannot itself create an Accounting Release. The handoff carries
exact prior provider-posting references so Phase 20 can compile only the
unowned differential effect; already-posted external work produces no duplicate
release. A QBO/Xero outage never changes or blocks closed Field Account truth.
D20 never changes legal donor, Designation or purpose, restriction, receipt,
gross-support, or external expense-classification truth and never nets gross
contribution or support truth.

D20 inherits D19 rather than creating a local access model. Every durable and
cached record uses complete Tenant × Legal Entity × Support Assignment × Field
Account × ISO-currency scope where applicable; structural keys and foreign keys
reject substitutions. Raw evidence is private and browser-inaccessible. Tables
enable and force RLS as a coarse tenant backstop; user-facing reads and writes
go through the server command/projection boundary and sole Phase 12 PDP with an
authorization-epoch recheck at commit. Exposed views use `security_invoker`;
raw financial Realtime, client-filtered tenant scope, user-controlled JWT
authorization metadata, service-role browser access, and sensitive values in
logs, caches, metrics, or error text are prohibited. This depends on the D1,
D6, D11, D12, and D19 foundations and may not ship through a tenant-wide legacy
compatibility shim.

This is a real implementation prerequisite, not aspirational copy. The current
runtime migrations do not yet provide the planned canonical `legal_entity_id`
financial scope or `FORCE ROW LEVEL SECURITY` foundation. D20 cannot ship ahead
of D1/D6/D11/D19 by adding nullable scope, tenant-wide legacy authorization, or
a feature-local compatibility view. The posture follows current [Supabase RLS
guidance](https://supabase.com/docs/guides/database/postgres/row-level-security),
[PostgreSQL row-security behavior](https://www.postgresql.org/docs/17/ddl-rowsecurity.html),
[PostgreSQL constraint guidance](https://www.postgresql.org/docs/current/ddl-constraints.html),
and [transaction-isolation
requirements](https://www.postgresql.org/docs/current/transaction-iso.html).

### UX contract

#### Binding absent-unless-relevant rule

`Off` means structurally absent, not an empty module. An unaffected or
unauthorized scope produces no source ingestion, primary navigation item,
dashboard card, KPI, filter, queue, empty state, onboarding/setup warning,
badge, notification, statement field, export field, search result, count, cache
entry, or missionary API projection. CSS hiding is insufficient. The one
intentional discovery seam is visible only to an authorized finance settings
administrator at **Finance → Field Accounts → Settings → Optional features**:

> **Organization support costs — Off**
> Use exact organization-paid service costs outside assessments,
> compensation, and expense claims to update support balances after finance
> close.
> **Set up support costs**

The row opens a guided setup; it is not an immediate financial-behavior toggle.
An enabled tenant with no current work sees only its settings summary. Clean
nonzero work folds into one conditional line in the existing Support Cycle
close. Only cause-owned exceptions enter D11's existing finance queue. D20 has
no separate Mission Control area, inbox, or missionary module. An unaffected
missionary sees nothing—not even zero, disabled, unavailable, or a notification
preference. Donors and non-finance staff never receive a D20 surface.

#### People, tasks, and domain language

The experience is designed around the actual jobs rather than D20's internal
objects:

| Person                                | Job                                                            | Existing surface reused                        |
| ------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------- |
| Finance settings administrator        | Evaluate and schedule the optional capability                  | Optional-feature settings leaf                 |
| Finance closer                        | Understand only what changes this close                        | Support Cycle review and close summary         |
| Assigned exception owner              | Learn what happened and take one bounded next action           | D11 cause-owned finance queue                  |
| Read-only finance/auditor             | Trace source → disposition → close → accounting handoff        | Governed read-only history                     |
| Affected missionary                   | Understand one closed balance effect and what it does not mean | Existing Support activity/statement disclosure |
| Unaffected missionary or staff member | Finish ordinary work without learning D20 exists               | No D20 surface or data                         |

The core concepts are **source evidence**, **economic occurrence**, **cost
ownership**, **organization absorbed**, **Field Account target**, **Support
Assignment**, **Support Cycle close**, **through-date**, **source-to-balance
bridge**, **exception cause/owner**, and **append-only correction lineage**.
Staff copy uses those plain consequences; implementation terms such as manifest,
CAS, admission coverage, and counter-entry remain behind governed audit detail.

#### Four-step setup and prospective activation

The setup is a short save-and-resume page flow, not a giant matrix:

1. **Choose the source.** Show the exact provider/tenant-source identity,
   certified source families and finality capability, what remains authoritative
   elsewhere, last successful proof, and a preflight result.
2. **Choose eligible cost types.** Show only detected or certified finite
   families. D3-, D4-, and D10/D13-owned families read **Handled elsewhere**;
   there is no `Other debit` option.
3. **Choose who covers each cost.** Preselect **Organization covers it**. The
   other bounded choices are **Apply to support balance**, **Split between the
   organization and support balance**, and **Send to finance for review**.
   Reveal exact-allocation and insufficient-capacity settings only when that
   choice requires them. Keep carryforward under **Advanced** with its amount,
   age, successor, and publication consequences.
4. **Preview and schedule.** Use production-shaped frozen examples to show
   exact source dispositions, affected scopes, currencies, owner conflicts,
   before/after balance, through-date, prospective boundary, and any
   carryforward. The primary action is **Schedule support cost policy**. It
   requires one clear consequential confirmation, not password re-entry or
   repeated bureaucracy.

Persistent draft copy is **Setup saved. Nothing will change until you review
and schedule it.** Activation copy is **This can affect support balances only
after a finance close. It does not pay anyone or change payroll, accounts
payable, QuickBooks, or Xero here.** Deactivation is prospective; it stops new
positive admission after an exact boundary but preserves history and cannot
suppress a known credit or other adverse correction.

#### Signature source-to-balance bridge

One reusable consequence view makes the exact effect understandable without
turning D20 into accounting software:

```text
Source cost                                      USD 175.00
Organization covers                              USD  55.00
Targeted to support balances                      USD 120.00
Still needs review                                USD   0.00
                                                 ----------
Source fully accounted for                        USD 175.00
```

After D1 close, an authorized missionary sees the same truth at their permitted
scope:

```text
Balance before this closed entry                 USD 1,050.00
Organization support cost                       −USD   120.00
Balance after this closed entry                  USD   930.00
Included through March 31
```

The bridge appears in setup preview, exact-split review, exception detail,
Support Cycle close explanation, and affected missionary activity/statement
detail. It renders immutable manifest/close facts and never recomputes money in
the client. The visible source amount, disposition total, remainder, balance
effect, period, and through-date must agree exactly.

#### Routine and exception-first staff experience

When nonzero clean work exists, the existing close summary may add one line:

> **Organization support costs:** USD 320.00 targeted across 7 Field Accounts ·
> No review needed

When there is no work, omit the line. Exact detail stays under **What was
checked**. D11 groups failures by cause and source binding/version so provider
or schema drift creates one actionable case rather than a task per line. Each
case shows, in order: what happened, affected scope, why it matters, one next
action, owner, age, and last checked. Approved cause labels include **Source
amount changed**, **Needs an exact split**, **No eligible capacity**, **Already
handled elsewhere**, and **Credit is not linked to an original cost**. Actions
open the owning source or bounded repair. There is no **Apply anyway**, **Force
charge**, **Accept difference**, free-form debit, or journal editor.

#### Missionary presentation

Only a closed, nonzero, authorized D20 effect enters ordinary missionary
activity and statements. D9 module publication, D12 statement-purpose truth,
Phase 12 field permission, and D19 participant access all have to agree. A
shared Support Assignment defaults to **Organization support costs**. A tenant
may expose bounded labels such as **Ministry technology and services** or
**Required training** only through authorized purpose/field presentation; it
cannot expose person-specific benefit, claimant, vendor, or invoice detail.

The ordinary row is:

> **Organization support costs**
> −USD 55.00 · Included through March 31

Its keyboard-operable **Why did this affect the balance?** disclosure says:

> Your organization applied this cost during its finance close. It reduced the
> finance-confirmed support balance shown here. It did not send a payment or
> change payroll in Asym.

Zero, organization-absorbed, unresolved, and finance-only work stays absent.
There is no default per-cost notification. The experience never exposes source
PII, health-plan/dependent details, diagnoses, employee deductions, invoices,
payroll/AP jargon, tax interpretation, `available`, `withdrawable`, `charged
your money`, `you owe`, or `bill due`.

#### Visual system and rejected defaults

The visual metaphor is a calm reviewed ledger packet. It uses the existing
Maia/Zinc semantic system: ledger paper uses `background`; review sheets use
`card`; graphite text uses `foreground`/`primary`; ruled separators use
`border`; annotations use `muted`/`muted-foreground`; exceptional review uses a
shared semantic warning treatment; and actual blocking/destructive states use
`destructive`. It does not add D20-local amber/green classes or use chart colors
as status colors.

The design explicitly rejects:

1. a top-level module or zero-value dashboard card—use one optional settings
   leaf and complete absence elsewhere;
2. an instant toggle or generic rules builder—use guided prospective setup,
   finite families, and bounded treatments;
3. a table of every clean application or per-cost alert—use a close aggregate
   plus one cause-owned exception queue; and
4. spreadsheet allocation on mobile or tooltip-only help—use responsive
   source-to-balance cards and visible disclosures.

#### State and copy contract

| State                               | Staff truth                                                                                  | Missionary truth                                       |
| ----------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Off                                 | Optional settings row only                                                                   | Nothing                                                |
| Draft                               | Setup saved; no balances will change                                                         | Nothing                                                |
| Scheduled                           | Starts with Support Cycle beginning `[date]`                                                 | Nothing                                                |
| Active, no work                     | Settings summary only                                                                        | Nothing                                                |
| Waiting for source finality         | No balance changed; show source owner and last check                                         | Nothing                                                |
| Clean qualified work                | Conditional close-summary line                                                               | Closed grouped effect only when applied and authorized |
| Duplicate owner                     | Already handled as assessment, compensation, or expense; not applied here                    | Nothing                                                |
| Insufficient capacity               | Exact amount cannot be applied without crossing zero; organization covers or finance reviews | Nothing until a later authorized close result          |
| Missing exact currency result       | No balance changed; exact converted amount is required                                       | Nothing                                                |
| Source outage or expired capability | New positive work paused; prior closes unchanged; adverse corrections continue               | Existing closed truth remains                          |
| Correction pending                  | Source correction awaits the next eligible close                                             | Original closed truth remains                          |
| Corrected                           | Separate successor in Support Cycle closed `[date]`                                          | Separate correction activity when authorized           |
| Accounting pending/failed           | Phase 20 detail only                                                                         | Never presented as Field Account truth                 |

#### Accessibility, responsive behavior, and usability proof

Implementation must reuse Core Base UI/shared components and semantic tokens,
including the responsive table/card seam. Setup choices use native
`fieldset`/`legend`, visible labels and help, linked inline errors plus an error
summary, and a persistent result; no result depends on toast, color, icon,
hover, or drag alone. Disclosures follow the WAI-ARIA disclosure contract and
work with Enter and Space. Async preview announces one polite atomic status;
blocking errors may use an alert, but allocation edits do not create a chatty
live region. Focus returns after drawers/dialogs and is never obscured by a
sticky action bar.

The complete flow supports keyboard-only operation, screen readers, Core's
44-pixel minimum/48-pixel recommended touch targets, 320-CSS-pixel reflow, 400%
zoom, dark mode, reduced motion, long translations, RTL, tabular numerals, and
explicit ISO currency. Essential financial explanations use normal body text,
not tiny captions. Mobile uses stacked task cards or a full-page setup, never a
horizontal spreadsheet. These requirements follow [WCAG
2.2](https://www.w3.org/TR/WCAG22/), the [WAI-ARIA disclosure
pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/), and current
[progressive-disclosure form guidance](https://preview.carbondesignsystem.com/building-blocks/core/patterns/forms).

Before shipping, committed role-based tests must prove:

- Off, unauthorized, zero-work, and unaffected scopes have no D20 route,
  payload, query result, count, search result, notification option, export
  field, or DOM node outside the one authorized optional-feature row.
- Enabled clean work adds no queue noise; real exceptions show one correct
  owner and next action.
- Source conservation, no cross-currency addition, no unresolved close, exact
  source-to-balance rendering, stale-preview rejection, idempotent duplicate
  submission, provider outage, partial target close, late credit/correction,
  assignment retirement, and authorization revocation all behave as specified.
- Shared-assignment and field-projection tests prove that no person-specific or
  source-sensitive evidence leaks.
- Automated accessibility checks plus manual keyboard, screen-reader, 320-pixel,
  400%-zoom, long-label, RTL, focus, and live-region tests cover setup, review,
  close, repair, and missionary disclosure; automated Axe alone is
  insufficient.

Production-shaped prototype sessions must include finance settings admins,
closers, affected missionaries, shared-assignment participants, and unaffected
users. A passing comprehension gate requires at least 90% first-attempt
correctness on whether the balance changed, when, who determined the source
cost, whether anyone was paid, and whether the item is debt—with no participant
mistaking the feature for payment, AP, payroll, or personal liability. PII-free
telemetry may measure activation completion/abandonment, clean-versus-review
rate, exception cause/age, bridge-detail opening, repair completion, and support
ticket category; it must not contain names, vendors, evidence text, amounts, or
source documents.

### Post-selection ruthless adversarial review

Every category has a concern; C-prime is acceptable only with the permanent
controls below.

| Category                          | Concern? | What could go wrong                                                                                                                                                                        | Why it matters                                                                                       | Severity | Likelihood  | Best permanent prevention                                                                                                                                                                                                     |
| --------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- | -------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | Yes      | Provider IDs, schemas, finality states, credits, and tenant cost practices vary; live source evidence can change during close.                                                             | One assumed provider shape can silently omit, duplicate, or misroute costs.                          | Critical | High        | Versioned source-admission contracts, persisted qualified snapshots/watermarks, adapter certification/expiry, drift quarantine, and no live provider calls at close.                                                          |
| Technical debt                    | Yes      | D20 duplicates D1 coverage/close, D11 cases, source ownership, and correction logic.                                                                                                       | Parallel kernels will disagree and become expensive to repair.                                       | Critical | High        | Reuse shared coverage, close, balanced occurrence, exception, inbox/outbox, manifest, and evaluator-version seams; add only D20 semantics.                                                                                    |
| Edge cases                        | Yes      | Shared or retired assignments, late/partial credits, over-credits, out-of-order corrections, zero capacity, long service periods, hidden balances, and multiple currencies are mishandled. | These are realistic mission workflows and can change the wrong account or expose the wrong truth.    | Critical | High        | Exact identities, five distinct dates, original-policy delta replay, retired-account corrective path, target-local containment, and comprehensive property/role fixtures.                                                     |
| Footguns                          | Yes      | Disabled D3/D4/D10 falls through to D20; a manual source becomes `charge balance`; an enable toggle or remainder silently changes balances.                                                | One click can create an arbitrary debit, duplicate cost, or false worker debt.                       | Critical | High        | Configuration-independent semantic ownership, governed exact source issuance, guided prospective scheduling, organization-absorbed default, no generic debit/override, and no silent Field Account remainder.                 |
| Tenant safety                     | Yes      | Evidence, identity, cache, count, queue, or cost scope crosses Tenant, Legal Entity, Support Assignment, Field Account, purpose, or currency.                                              | It can charge the wrong ministry or reveal existence/sensitive facts across tenants or participants. | Critical | Medium-high | Composite keys/FKs, forced RLS, server Phase 12 PDP, authorization-epoch recheck, scoped caches/queues/idempotency, non-enumerating errors, and substitution/differencing tests.                                              |
| Over-engineering                  | Yes      | D20 becomes benefits, AP, cost accounting, budgeting, order-of-pay, workflow, or formula software.                                                                                         | It duplicates authoritative systems and makes a rare feature a permanent product burden.             | High     | High        | Absent-unless-enabled residual catalog, finite bases/treatments, existing D1/D11 surfaces, no whole-ledger import, custom formulas, statuses, or second accounting path.                                                      |
| UX/UI and user friction           | Yes      | An uncommon feature adds zero cards, jargon, setup nags, table noise, repeated review, debt-like copy, or opaque balance effects.                                                          | Staff abandon it and missionaries misunderstand organization-controlled support truth.               | High     | High        | Strict absence contract, one optional settings leaf, four-step setup, source-to-balance bridge, clean automation, one next action, grouped post-close presentation, and comprehension testing.                                |
| Hidden coupling                   | Yes      | Payroll, AP, QBO/Xero, payment, publication, or provider outages are treated as the same lifecycle and block Field Account close.                                                          | An unrelated system failure can freeze correct balances or inflate authority.                        | Critical | High        | Persist local source-final facts; separate source, D1 close, D9/D12 publication, Phase 20 accounting, and external payment contracts; keep accounting dark until independently qualified.                                     |
| Failure modes                     | Yes      | Crash, stale preview, partial target failure, ambiguous provider response, or blind retry publishes partial manifests, duplicates coverage, or loses a correction.                         | Post-close duplication or omission is difficult to unwind and undermines trust.                      | Critical | Medium-high | Private staging, short CAS publication fence, semantic idempotency, deterministic lock order, inspect-before-retry, outbox-after-commit, dead-letter/residual recovery, and smallest-scope containment.                       |
| Data integrity risks              | Yes      | `Unresolved` passes as close-complete; different currencies are summed; cross-source duplicates evade a provider-ID key; splits do not conserve; effects are unbalanced.                   | Field Account balances and statements become mathematically false.                                   | Critical | High        | No unresolved close admission, canonical economic roots/aliases, dual per-currency conservation, native uniqueness/exclusion constraints, deterministic minor-unit allocation, and D1/D11 balanced same-currency occurrences. |
| Security and privacy risks        | Yes      | Health, dependent, compensation, claimant, address, invoice, or vendor details leak through shared assignments, evidence links, logs, caches, Realtime, or telemetry.                      | The exposure can harm people and create serious tenant trust/compliance failures.                    | Critical | High        | Minimum typed facts, private encrypted evidence, governed short-lived retrieval/audit, neutral field projections, no raw Realtime/browser writes, and no sensitive telemetry.                                                 |
| Scalability and performance risks | Yes      | Shared allocations create thousands of lines; RLS joins, provider repair, and recurring carryforward create N+1, no-op rows, or unfair queues.                                             | Close time and tenant fairness degrade at seasonal scale.                                            | High     | Medium-high | Set-based evaluation, indexed full scopes, bounded manifests, keyset/chunk processing, incremental projections, tenant-fair queues, aggregated drift cases, and no no-op carryforward events.                                 |
| Operational burden                | Yes      | Finance maps every line, re-enters routine costs, or receives one task per provider change.                                                                                                | D20 recreates spreadsheets and tribal knowledge instead of removing work.                            | High     | High        | Explicit family allowlists, reusable source mappings, bulk production preview, automatic clean path, cause-aggregated exceptions, owner/SLO, and no notification flood.                                                       |
| Observability gaps                | Yes      | Staff cannot distinguish observed, source-final, targeted, reserved, close-applied, corrected, publication-visible, or accounting-delivered work.                                          | Cases age unnoticed and the wrong team investigates them.                                            | High     | High        | Plain causal status, owner, age, next action, watermarks, count/value reconciliation, manifest digests, correction/carryforward age, and PII-free operational alerts.                                                         |
| Dependency and integration risks  | Yes      | A provider omits stable line IDs or completeness, changes semantics, rate-limits, reorders events, or exposes only aggregate/approximate FX.                                               | Exact deduplication, source finality, and recovery become impossible for unsupported operations.     | High     | High        | Capability-labelled enrolled operations, schema-pinned adapters, replay/repair sweeps, backpressure, source kill switches, exact governed fallback, and refusal of unsupported/approximate operations.                        |
| Migration and upgrade risks       | Yes      | D20 duplicates D17 openings, prior spreadsheets/manual adjustments, or rewrites old results with a new evaluator.                                                                          | Historical balances gain fabricated provenance or duplicate costs.                                   | Critical | Medium      | Exact source-family half-open cutover manifest, next-complete-cycle default, no unproved backfill, immutable source/policy/evaluator versions, structurally inert reference history, and portable evidence.                   |
| Other development hazards         | Yes      | Policy activation, source correction, permission change, capacity reservation, manifest publication, and close race; duplicate submit applies twice.                                       | The same capacity can be consumed twice or a correction can outrun its source.                       | Critical | High        | Deterministic lock order, short transactions, CAS/version/authorization reproof, uniqueness/exclusion constraints, bounded serialization retries, fault injection, and post-commit outbox.                                    |

### Ratified formulation — Phase 21 D20

> **C-prime-amended-and-hardened (C-prime-R) — an absent-unless-enabled,
> source-authoritative Organization Support Cost Application lane for only
> exact source-final, purpose-compatible residual organization service/direct-
> cost occurrences whose canonical semantic family—not configuration state—is
> exclusively owned by D20 rather than D3, D4, or D10/D13; activated
> prospectively at one source-family half-open boundary through capability-
> certified source-admission contracts, one canonical economic-occurrence root,
> and exclusive cross-lane coverage; with organization-absorbed as the safe
> default, finite tenant-owned bearing treatments, non-calculating evidence-
> backed allocation, private bounded staging, one CAS-published immutable per-
> currency conserving manifest with no unresolved target admitted to close,
> purpose-typed non-reusable Field Account Funding Coverage, and D1-only
> recognition as a D11-balanced same-currency Field Account Occurrence;
> nonnegative ordinary capacity, while mandatory source-owned adverse
> corrections may expose a visible D11 deficit; optional advanced bounded
> carryforward through
> non-overlapping minor-unit tranches and explicit append-only successor
> disposition rather than worker debt, AP, availability, or silent expiry;
> source-version-pinned deterministic append-only corrections; exact externally
> supplied currency results only; independently authoritative source, Field
> Account, publication, accounting, and external-payment truth; current Phase
> 20 accounting darkness until separately certified posting ownership; complete
> structural tenant isolation and private evidence; and one quiet exception-
> first experience that is invisible when disabled and shows missionaries only
> authorized grouped post-close effects—without fallback ownership, arbitrary
> debits, unresolved-close completeness, participant-derived allocation,
> whole-ledger ingestion, retroactive reclassification, negative balances,
> live-provider close dependency, duplicate posting, sensitive-detail exposure,
> or Asym benefits, payroll, AP, GL, FX, budget, or formula authority.**

The founder ratified this formulation on 2026-08-01. It is the canonical D20
ruling and closes the organization-incurred residual-support-cost seam without
reclassifying any D3 assessment, D4 compensation cost, D10/D13 expense, Phase
20 accounting fact, or external payroll/AP/payment fact.

## Post-D20 preservation and cross-phase congruency audit

**Audit status:** complete for the D20 ratification; no earlier Phase 21 ruling
was reopened. The canonical Phase 21 authority chain is now D1-D20 with
ADRs 0090-0109. Existing Phase 17 message keys and Phase 18 document-purpose
keys remain unchanged because D20 creates neither a new communication family
nor a standalone generated document.

The audit closed two easy-to-miss double-counting hazards:

1. Phase 20 D19 already owns exact processor-cost attribution and the separately
   enabled designation-borne processor-cost effect. Those facts are explicitly
   ineligible for Phase 21 D20 even if another owning feature is disabled.
2. D20 may emit only a **Support Cost Accounting Candidate Handoff**. It is not
   accounting-ready until Phase 20 later certifies a posting owner and accepts
   exact non-overlapping coverage. This keeps Phase 21 from creating a shadow
   QBO/Xero route or implying an accounting contract that Phase 20 has not made.

The post-D20 gap census then compared the remaining Phase 21 seams by money-
integrity risk, cross-phase ambiguity, expected frequency, and ability to reuse
the existing architecture. The next decision is **noncash-support realization**.
It precedes prospective-expense authorization because D2 currently allows an
eligible Phase 13 posting to create provisional support, while Phase 15
correctly preserves liquidation proceeds as separate non-contribution facts.
Without a binding bridge, an implementation could credit gift-date fair market
value as cash, ignore realized proceeds, or record the proceeds as a second
gift.

## D21 decision research - noncash-support realization

**Status at research start:** researched for one founder decision; D1-D20 were
then authoritative. The founder subsequently ratified the hardened result as
D21 in the ratification section below.

### Concrete scenario

A donor transfers 100 publicly traded shares preferred toward the Rivera
Support Assignment. The donor-receipt or gift-recognition value is USD 12,400.
The organization later sells the shares for USD 12,180, incurs USD 35 of exact
brokerage/liquidation costs, and receives USD 12,145 in settled proceeds. The
sale might occur in two partial lots, and the organization might instead retain
an in-kind asset for ministry use.

The decision is what the missionary may see as activity, what may enter a
Support Cycle, and which amount may affect a Field Account without turning
Phase 21 into an asset ledger, brokerage platform, receipting authority, or
accounting system.

### Current evidence and modern-practice implications

- U.S. acknowledgment guidance requires a description of donated property but
  tells the charity not to state its value; Canadian receipting uses its own
  fair-market-value rules. Receipt value therefore cannot be reused as Field
  Account cash truth. See [IRS written acknowledgments](https://www.irs.gov/charities-non-profits/charitable-organizations/charitable-contributions-written-acknowledgments)
  and [CRA gifts-in-kind valuation](https://www.canada.ca/en/revenue-agency/services/charities-giving/charities/operating-a-registered-charity/issuing-receipts/determining-fair-market-value-gifts-kind-non-cash-gifts.html).
- Salesforce NPSP explicitly keeps in-kind gifts separate from cash donations.
  Virtuous records stock identity, share count, sale date, and sale amount as
  distinct stock-gift fields. See [Salesforce in-kind gifts](https://help.salesforce.com/s/articleView?id=sfdo.npsp_create_and_manage_in-kind_gifts.htm&language=en_US&type=5)
  and [Virtuous stock gifts](https://support.virtuous.org/hc/en-us/articles/12909083338765-How-Do-I-Enter-a-Stock-Gift).
- Blackbaud preserves the stock/property gift and a later sale with amount,
  broker fee, gain/loss, sale date, posting status, and partial-sale notes.
  This supports a linked asset-to-disposition lifecycle rather than a second
  cash gift. See [Blackbaud stock/property gifts](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-stock-property-gifts.html).
- Fidelity Charitable distinguishes the donor's charitable-deduction value
  from the net proceeds credited after liquidation costs. That is strong
  evidence for realized-proceeds support rather than valuation-as-cash. See
  [Fidelity Charitable Giving Account Guide](https://www.fidelitycharitable.org/giving-account-guide.html).

These products are evidence about separation, lineage, and presentation. They
do not transfer their donor-advised-fund, receipting, custody, accounting, or
investment authority into Phase 21.

### Option A - keep all noncash gifts outside Field Accounts

The original noncash gift remains Phase 13/15 truth. If sale proceeds should
support an assignment, staff records unrelated cash later.

- **Benefit:** smallest Phase 21 surface.
- **Failure:** encourages duplicate cash gifts, loses asset-to-proceeds lineage,
  and forces finance into spreadsheets.
- **Risk:** high likelihood of omitted or double-counted proceeds.
- **Disposition:** not recommended.

### Option B - credit the receipt or gift-date value at acceptance

The appraised or recognized value becomes provisional support when the
organization accepts the property.

- **Benefit:** immediate and superficially donor-intuitive.
- **Failure:** treats a valuation as cash even when liquidation is delayed,
  partial, lower, higher, costly, or never performed.
- **Risk:** critical balance and comprehension error.
- **Disposition:** reject.

### Option C-prime - exact source-realized noncash support through one asset-to-proceeds bridge - recommended

Preserve the original property as one noncash contribution. It may appear
quietly as `Noncash gift received - processing`, but it creates no monetary
Field Account credit by itself. Only an immutable, source-authoritative
**Noncash Support Realization** may enter D2 readiness after exact proceeds are
settled and the original purpose remains eligible.

The realization pins the original contribution and accepted-purpose version;
the exact asset/disposition version; non-overlapping quantity coverage; sale or
redemption date; gross proceeds; exact liquidation costs; net proceeds;
settlement evidence; ISO currency; any exact externally owned conversion
evidence; allocation and residual dispositions; source/policy/evaluator
versions; and correction lineage.

One bounded prospective cost treatment applies:

- **Net realized - default:** the exact settled net proceeds may become support.
- **Organization absorbs exact costs:** gross settled proceeds may become
  support only when the organization separately proves exact cost coverage;
  otherwise the realization remains in review.

Permanent boundaries:

- Partial liquidations create non-overlapping realization tranches, never a
  second gift or overlapping support.
- Retained or consumed in-kind property never becomes a monetary Field Account
  balance merely because it has a valuation.
- Public securities, private shares, crypto, vehicles, real estate, and other
  property families activate only under capability-certified source contracts;
  there is no generic manual `convert to cash` command.
- Different-currency proceeds use D6 exact external conversion evidence. Asym
  never calculates or estimates FX.
- Corrections are append-only; D11 owns the balanced Field Account occurrence
  and integrity proof; Phase 20 alone owns accounting delivery and
  reconciliation.
- The ordinary missionary experience gets no zero card, asset valuation,
  broker-fee detail, or processing setup. Only relevant activity appears under
  progressive disclosure. Finance gets one quiet exception-first view only
  when noncash work actually exists.

### Recommendation and next founder question

Adopt Option C-prime. It closes the balance-integrity gap while reusing D2, D6,
D11, Phase 13, Phase 15, and Phase 20. It does not create an asset subledger or
expand Asym into custody, valuation, investment, receipting, or accounting.

**Founder question:** When a preferred noncash gift later produces cash, should
Phase 21 preserve the original noncash contribution and allow only exact,
settled, source-realized proceeds to enter a Field Account through D2?

## D21 founder selection and adversarial hardening

**Founder selection:** Option C-prime - one exact asset-to-proceeds bridge.

**Status at hardening time:** selected for adversarial hardening; D1-D20 were
then authoritative. The founder subsequently ratified the result as D21 below.

### Ruthless verdict

Option C-prime survives, but not in its initial form. It is the only option that
can preserve one gift, exact proceeds, and an understandable Field Account
effect. It nevertheless has two critical defects unless amended:

1. D2 currently says an eligible Phase 13 posting creates provisional support.
   Phase 13 and Phase 15 also preserve a noncash gift's recognized or
   fair-market value. Read literally, those rules can turn a valuation into
   Field Account money before any proceeds exist.
2. Phase 13 and Phase 15 describe overlapping asset/disposition shapes with
   different granularity. D21 cannot safely bind to either table-shaped draft or
   create a third disposition source. It needs one canonical, versioned source
   projection over the source-owner facts.

The permanent answer is therefore a **source-mode-honest Noncash Support
Realization bridge**, not a generic noncash amount, a second cash gift, or an
asset-management subsystem.

### Current evidence checked

- Blackbaud keeps the stock/property gift and later `Sell` facts together,
  including amount, broker fee, sale date, posting state, and partial-sale
  notes. That supports linked lifecycle presentation, but its configurable
  report-time bases also show why Asym must freeze one semantic basis instead
  of letting each report reinterpret the gift. See
  [Blackbaud stock/property gifts](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-stock-property-gifts.html).
- Virtuous reveals stock-specific fields only when relevant, keeps shares,
  sale date, and sale amount distinct, and recommends the import workflow for
  routine volume rather than one-by-one contact editing. See
  [Virtuous stock gifts](https://support.virtuous.org/hc/en-us/articles/12909083338765-How-Do-I-Enter-a-Stock-Gift).
- Every.org receives and liquidates stock, then sends the selected nonprofit a
  cash grant. That proves the legal-recipient/source mode must be explicit: a
  tenant receiving the grant must not invent a tenant-owned asset sale. See
  [Every.org stock donations](https://support.every.org/hc/en-us/articles/9917675443987-How-do-stock-donations-work).
- Overflow publishes a plain-language sequence from initiated gift through
  transfer, liquidation, and deposited proceeds. That supports a short
  role-appropriate timeline rather than one overloaded `settled` status. See
  [Overflow's stock-gift lifecycle](https://www.overflow.co/learn/unlock-stock-giving-how-to-make-the-most-of-year-end-generosity).
- U.S. acknowledgment guidance requires a description, but not the value, of a
  noncash contribution. Form 8282 separately governs certain later
  dispositions. These are independently authoritative facts and must not be
  collapsed into Field Account support. See
  [IRS written acknowledgments](https://www.irs.gov/charities-non-profits/charitable-organizations/charitable-contributions-written-acknowledgments)
  and [IRS Form 8282](https://www.irs.gov/forms-pubs/about-form-8282).
- Supabase warns that JWT membership claims can remain stale until token
  refresh and that RLS columns must be indexed. D21 authorization therefore
  cannot depend only on cached client/JWT state, and every list/count/search or
  evidence download must be scoped server-side before observation. See
  [Supabase RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security).
- WCAG 2.2 requires perceivable status, visible/unobscured focus, clear labels,
  and error prevention for financial/data changes. WAI's disclosure pattern
  uses a real button with `aria-expanded` and keyboard activation. See
  [WCAG 2.2](https://www.w3.org/TR/WCAG22/) and the
  [WAI disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/).

These sources guide separation, evidence, and interaction design. They do not
transfer provider, tax, brokerage, custody, accounting, or payroll authority
into Phase 21.

### Binding authority matrix

| Authority  | Owns                                                                                                                               | D21 must never replace or imply                                                        |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Phase 13   | Original Contribution, legal donor, gift date, accepted-purpose/designation lineage, donor/supporter credit, and recognition facts | Cash proceeds, sale finality, Field Account support, or a second Contribution          |
| Phase 15   | Canonical asset-lot and append-only disposition/proceeds source facts, source finality, evidence, and correction lineage           | Field Account effect, changed receipt value, or accounting posting                     |
| D21        | One immutable Noncash Support Realization projection and exact source-to-support allocation                                        | Asset custody, trading, appraisal, gain/loss, donor receipting, accounting, or payment |
| D2         | Source-readiness admission, complete Support Cycle coverage, and close                                                             | Treating the original noncash posting or valuation as monetary support                 |
| D3         | Assessment of the exact Realized Support Basis after D21                                                                           | Assessing gift-date value or calling a liquidation cost an assessment                  |
| D5         | Authorized purpose/Support Assignment succession when the original target can no longer receive the effect                         | Silent fallback to a default fund, current participant, or first active account        |
| D6         | Exact externally owned conversion evidence when proceeds and Field Account currencies differ                                       | Estimated, market-rate, or gift-date-value FX                                          |
| D11        | Balanced Field Account occurrences, unique coverage, and close integrity                                                           | Source disposition or accounting truth                                                 |
| D17        | Opening Position and exact pre-cutover coverage                                                                                    | Reconstructed or replayed realization history without proof                            |
| D19        | Exact participant access and notification scope                                                                                    | Inferring financial destination from a spouse, teammate, leader, or viewer             |
| D20        | Other source-authoritative Organization Support Cost Applications under its exclusive semantic catalog                             | Reapplying D21 brokerage, liquidation, valuation, or sale costs                        |
| Phase 7/18 | Receipt and document truth for the original noncash contribution                                                                   | A second receipt or donation for the realization                                       |
| Phase 20   | Separately certified accounting interpretation and QBO/Xero delivery                                                               | Assuming D21 realization or Field Account close proves accounting readiness            |
| QBO/Xero   | Posted books and final accounting reconciliation                                                                                   | Contribution, realization, Field Account, or missionary-publication truth              |

The Phase 15 disposition remains a `non_contribution` source fact and stays out
of gift, receipt, pledge, campaign, deposit, and donor-lifetime totals. D21 may
consume it to create a separate Field Account effect, but may not let that row
emit another Phase 13 Contribution posting.

### Source-mode contract

D21 must identify the legal recipient and source role before composing any
realization:

| Source mode                                                                                                        | Correct treatment                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tenant or Legal Entity received the asset and later sold/redeemed it                                               | D21 may bridge exact source-final proceeds from the Phase 15 disposition projection.                                                             |
| Certified provider acted as the tenant's receiving/liquidation agent and preserves exact asset-to-proceeds lineage | D21 may bridge through that capability-certified source contract.                                                                                |
| Intermediary was the legal donee, liquidated the property, and sent a cash grant                                   | Record the intermediary's authoritative cash/grant fact through its proper source family; do not create a tenant-owned asset or D21 realization. |
| Donor-advised-fund sponsor sent a grant                                                                            | Treat it as the sponsor/grant source shape, not as the donor's underlying noncash asset.                                                         |
| Tenant retained, consumed, transferred onward, abandoned, or determined the property worthless                     | Preserve the source-owned terminal nonmonetary outcome; create no monetary Field Account effect.                                                 |
| Donated services                                                                                                   | No D21 monetary realization.                                                                                                                     |
| Source evidence is ambiguous or incomplete                                                                         | Hold only the affected positive candidate for review; never infer proceeds, zero costs, quantity, currency, or destination.                      |

### Immutable Noncash Support Realization Manifest

The close-admitted manifest must pin, at minimum:

- Tenant, Legal Entity, source family, source system/environment, provider role,
  legal recipient, and source-admission contract version;
- original Contribution, effective accepted-purpose/designation version, asset
  lot, and source revision;
- disposition identity/version and exact source-final evidence identity;
- exact covered quantity and declared quantity scale, including source-owned
  corporate-action lineage when applicable;
- gift/received date, trade or sale date, source-final/settlement date,
  evidence-observed date, D2 admission date, Support Cycle close date, and any
  Phase 20 accounting date as distinct facts;
- source proceeds ISO currency and one certified monetary evidence shape:
  - exact gross proceeds, typed exact costs, and exact net proceeds; or
  - exact source-final `net_only` proceeds when the source legitimately supplies
    no gross/cost breakdown;
- prospective cost-treatment policy version and resulting Realized Support
  Basis in checked integer minor units;
- deterministic purpose-line allocation, explicit non-support/residual
  dispositions, rounding recipient, and algorithm version;
- D6 conversion evidence when source and Field Account currencies differ;
- non-overlapping per-lot quantity and per-disposition minor-unit coverage;
- predecessor/correction lineage, semantic idempotency key, canonical digest,
  actor/service identity, and close commit cursor.

Money uses checked integer minor units. Asset quantities use their declared
exact scale, never binary floating point. At the CAS-guarded D2 close fence, the
system must reload authorization and every pinned source, purpose, policy,
currency, and correction revision. It then admits the realization and one
D11-balanced Field Account occurrence atomically, or admits neither.

Required conservation rules:

```text
covered asset quantity <= source-authoritative asset quantity
```

```text
when full detail exists:
gross proceeds - sum(exact typed liquidation costs) = net proceeds
```

```text
sum(realized support targets)
+ sum(explicit non-support and residual dispositions)
= selected Realized Support Basis
```

```text
each source quantity unit and each proceeds minor unit is covered at most once
```

Equal aggregate totals are insufficient: the manifest must prove complete,
non-overlapping identity-level coverage so one omitted tranche cannot hide one
duplicate tranche.

### Cost treatment without a rule-builder

Use one quiet `net_realized` default that needs no tenant setup. Exact
source-final net proceeds become the Realized Support Basis and then enter D2.

An optional, prospective `organization_absorbs_exact_costs` policy may use
gross proceeds only when exact gross, typed costs, and net are all proved and a
tenant-authorized policy separately assigns those exact costs to the
organization. Scope it only as far as needed: Tenant, Legal Entity, source
family, currency, and an optional bounded Support Assignment exception. Do not
offer formulas, arbitrary predicates, or a per-gift truth toggle.

If a provider exposes only exact net proceeds, net mode remains valid and the
UI says `Proceeds received`; organization-absorbed mode is unavailable. It must
never invent gross proceeds or `$0` costs. D21 costs cannot later fall through
to D20, D3, or Phase 20 D19.

The visible calculation order is:

```text
gross sale proceeds
- exact liquidation costs, unless separately organization-absorbed
= Realized Support Basis
- D3 assessment, if prospectively enabled
- a separately applicable Phase 20 D19 processor-cost effect, if any
= support credited through the Support Cycle
```

`Gross Support Allocation` means gross before D3 assessment; it does not mean
gross brokerage proceeds. The UI must use **Realized support basis** for the
pre-assessment D21 result to avoid that terminology collision.

### Edge behavior that must be first-class

- Partial sales create exact, non-overlapping source-final tranches and show
  quantity processed plus quantity remaining, never an estimated remaining
  dollar value.
- A pooled sale may cover multiple gift lots only when the source or governed
  evidence supplies exact lot/quantity coverage. Asym must not guess which
  donated property was sold.
- Stock splits, mergers, spin-offs, cash-in-lieu, crypto network deductions,
  and similar transformations require source-owned lineage; unsupported
  transformations go to review.
- Installment proceeds create separate exact tranches.
- A canceled or busted trade creates no candidate until corrected source-final
  evidence exists.
- Late costs or corrected proceeds append a source- and cause-linked delta in a
  successor cycle under the original pinned policy; they never mutate the gift,
  prior realization, close, statement, or receipt.
- Costs at or above proceeds create no positive support and no missionary debt.
  Source/accounting authorities own the residual economics.
- A purpose correction racing close invalidates the preview. A retired purpose
  or Support Assignment uses D5's explicit succession/reallocation authority;
  it is never silently redirected.
- Anonymous donor presentation, household recognition, and supporter access do
  not change financial destination or participant authorization.
- No positive realization enters a closed cycle with unresolved currency,
  purpose, quantity, source-mode, cost, evidence, or coverage truth. Mandatory
  adverse corrections continue through the smallest affected scope.

### One quiet experience, not a new subsystem

Tenants without certified noncash activity see no setting, card, queue, badge,
notification, or navigation item. Clean source-backed realizations require no
staff approval. Only an exact unresolved cause creates work.

| Surface                                          | Default                                                                        | Progressive detail                                                                                                                   | Action contract                                                                                                                            |
| ------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Existing finance Contribution detail             | Conditional `Noncash gift` section only for relevant gifts                     | Original asset, source-labelled timeline, exact tranches, proceeds calculation, purpose, source freshness, and immutable corrections | One contextual action such as `Record proceeds`, `Resolve mismatch`, or `Record a correction`; never `Convert to cash` or `Make available` |
| Existing Phase 15 follow-up                      | Owns missing or ambiguous sale/proceeds evidence                               | Exact missing source fact, owner, age, and safe recovery                                                                             | Clean provider facts are zero-touch; staff evidence uses one short check-answer confirmation                                               |
| Existing D11/Mission Control exception workspace | Owns only D21 mapping, readiness, authorization, currency, or integrity causes | Cause, owner, age, watermark, and last verified time                                                                                 | One cause has one owner and one recovery action; never duplicate the Phase 15 task                                                         |
| Admin configuration                              | Absent until a certified source exists; net proceeds needs no setup            | One guided prospective choice: `Use net proceeds` or, only when proof-capable, `Organization covers exact costs`                     | Preview production-shaped examples, choose effective boundary, activate; no rule-builder                                                   |
| Missionary Support activity                      | One grouped gift lifecycle, never two donations                                | Optional `How this amount was determined` disclosure                                                                                 | No finance controls, evidence links, or setup                                                                                              |
| Donor history and receipt                        | Original noncash Contribution truth only                                       | Receipt-owned asset description and jurisdictional facts                                                                             | No proceeds, Field Account, or second receipt                                                                                              |
| Notifications                                    | No technical-state notifications by default                                    | Existing D9/digest preferences may carry one meaningful closed inclusion or material correction                                      | Immediate only when an authorized user must act                                                                                            |

The staff detail should lead with the answer:

```text
Stock gift received
100 shares received December 29.
No monetary support has been recorded from this gift yet.
```

After exact source-final proceeds:

```text
Proceeds recorded
60 of 100 shares sold
Gross proceeds                 USD 7,308.00
Liquidation costs              -USD 21.00
Realized support basis          USD 7,287.00
Remaining                      40 shares
Support effect                 Waiting for the next finance close
```

If exact gross/cost detail does not exist, show only the exact fact:

```text
Proceeds received              USD 7,287.00
Support effect                 Waiting for the next finance close
```

A staff-entered source fact or exception resolution gets one short check-answer
confirmation:

> This records source evidence for settled proceeds preferred toward the Rivera
> Support Assignment. It does not sell an asset, change the donor's gift, issue
> a receipt, post accounting, run payroll, or make money available.

After publication, the only mutation wording is `Record a correction`.

The missionary sees one plain-language story:

- initial activity: `Stock gift recorded`;
- optional detail: `Processing`;
- after covered close with balance publication enabled:
  `USD 7,287.00 included in your support balance through January 31`;
- when balance publication is disabled: `USD 7,287.00 recorded as support`;
- partial state: `Part of this gift has been converted to cash`;
- retained property: `This noncash gift was retained for ministry use and is
not included in the support balance`.

`How this amount was determined` may show the plain gross-minus-cost equation.
It must not expose gift-date tax value, internal valuation, brokerage account
details, provider payloads, raw evidence, accounting state, or words such as
`available`, `withdrawable`, `payable`, `payroll-ready`, or `paid`.

Use a semantic description list for one realization and a responsive table or
stacked labelled cards for multiple tranches. The lifecycle is an ordered list.
The calculation disclosure uses a native button or `<details>` with correct
expanded state, works with Enter/Space, preserves visible non-obscured focus,
and returns focus to the initiating row. Status meaning cannot depend on color,
icon, hover, or a toast. Errors are inline and summarized; live regions announce
only material async outcomes. All critical tasks must work at 320 CSS pixels,
200% and 400% zoom, keyboard-only, and with screen readers.

### Category-by-category adversarial review

| Category                          | Concern | What could go wrong                                                                                                                                                                                              | Why it matters                                                                                               | Severity | Likelihood  | Permanent fix or prevention                                                                                                                                                                                                              |
| --------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | Yes     | A one-gift/one-sale, stock-only, same-currency, full-detail workflow breaks on partial lots, pooled sales, net-only sources, corporate actions, and intermediaries.                                              | It will either block legitimate support or silently invent facts.                                            | Critical | High        | Capability-labelled source modes, exact tranches, two certified monetary evidence shapes, typed terminal outcomes, and fail-closed review for unsupported behavior.                                                                      |
| Technical debt                    | Yes     | Phase 13 and Phase 15's overlapping asset/disposition drafts, plus a new D21 table-shaped source, would create three truths and copied status/calculation logic.                                                 | Drift would make fixes and migrations expensive and reports contradictory.                                   | Critical | High        | Establish one canonical versioned Phase 15 source projection, amend D2's broad admission wording, and keep D21 as a derivative manifest with one server-owned presenter.                                                                 |
| Edge cases                        | Yes     | Partial or installment sales, splits, mergers, returned proceeds, delayed costs, costs above proceeds, retained assets, redesignations, inactive assignments, anonymity, or mixed currency can misstate support. | These are realistic for high-value noncash gifts and can materially change balances.                         | Critical | High        | Exact quantity/minor-unit coverage, source transformation lineage, D5 succession, D6 conversion, append-only corrections, and zero positive effect for terminal nonmonetary outcomes.                                                    |
| Footguns                          | Yes     | Staff could enter FMV as proceeds, create a second cash gift, assume missing fees are zero, choose gross per gift, silently retarget proceeds, or edit a closed result.                                          | A plausible click could corrupt donation, receipt, and Field Account truth at once.                          | Critical | High        | No `new gift` or `convert` action, separate labels, no default zero, prospective policy, check-answer confirmation, CAS reproof, and correction-only mutation.                                                                           |
| Tenant safety                     | Yes     | A source fact, count, search result, donor name, evidence object, purpose, or Field Account can leak across Tenant, Legal Entity, assignment, participant, or currency scopes.                                   | Noncash gifts expose sensitive financial and donor information and can alter another organization's balance. | Critical | Medium      | Composite scope keys/FKs, RLS plus explicit service authorization, scope-before-count/search, fresh membership checks, private evidence, short-lived retrieval, and cross-tenant negative tests.                                         |
| Over-engineering                  | Yes     | Building custody, valuation, trading, generic asset workflows, an expression engine, new navigation, or provider parity would turn a narrow bridge into a fragile finance product.                               | It raises compliance, maintenance, and UX burden without improving the core handoff.                         | High     | High        | One source adapter projection, one bounded policy, conditional sections, existing workspaces, and explicit exclusion of appraisal, custody, execution, gain/loss, tax, and GL authority.                                                 |
| UX/UI and user friction           | Yes     | Re-entry, routine approvals, duplicate gift cards, finance jargon, permanent empty settings, dense desktop tables, or unclear status can confuse staff and missionaries.                                         | Staff will work around the feature, and missionaries may believe money is available or two gifts were made.  | High     | High        | Zero-touch clean path, exception-first work, one grouped lifecycle, answer-first copy, progressive disclosure, responsive cards, accessible controls, and no surface when irrelevant.                                                    |
| Hidden coupling                   | Yes     | Gift processing, D2 readiness, D3 assessment, D6 conversion, D20 costs, Phase 20 accounting, bank reconciliation, and payment could collapse into one status or callback.                                        | A change or outage in one domain could mutate unrelated truth or double-apply money.                         | Critical | High        | Separate immutable authorities, semantic-family exclusivity, version-pinned inputs, explicit projections, and independently live statuses/links.                                                                                         |
| Failure modes                     | Yes     | Duplicate/out-of-order webhooks, ambiguous provider success, source outage, partial commits, stale previews, or close/correction races can double-credit or strand work.                                         | Financial failures must be visible, contained, and recoverable without blind retry.                          | Critical | Medium-high | Inbox/outbox, semantic idempotency, inspect-before-retry, last-known-truth preservation, affected-positive quarantine, serialized per-lot commands, and one short atomic close fence.                                                    |
| Data integrity risks              | Yes     | Overlapping lot coverage, float rounding, missing residuals, equal-total omit/duplicate pairs, wrong currency, or duplicate contribution emission can preserve a balanced-looking but false total.               | The Field Account and source can disagree while superficial reconciliations still pass.                      | Critical | High        | Exact-scale quantities, checked integer money, unique/exclusion constraints, identity-level coverage manifests, deterministic largest-remainder allocation, and independent conservation proofs.                                         |
| Security and privacy risks        | Yes     | Brokerage statements, account numbers, donor wealth indicators, ticker/quantity, provider IDs, or source documents may leak through URLs, logs, notifications, exports, or stale access.                         | Exposure can harm donors and tenants even when the balance itself is correct.                                | Critical | Medium      | Private encrypted storage, redacted previews, short-lived authorized downloads with access recheck, least-privilege service roles, safe logs/telemetry, retention policy, and no sensitive notification payloads.                        |
| Scalability and performance risks | Yes     | Q4 stock volume, bulk imports, pooled dispositions, many purpose lines, and long correction histories can cause N+1 queries, lock contention, slow RLS, or giant transactions.                                   | A design that works in demos can fail at the exact seasonal peak that matters.                               | High     | Medium      | Chunked source ingestion, indexed scope/RLS predicates, set-based server composition, cursor pagination, evidence-on-demand, precomputation, bounded manifests, and a short per-lot/close CAS fence.                                     |
| Operational burden                | Yes     | Every clean gift could become a checklist, staff could maintain the same state in Phase 15 and D21 queues, or special knowledge could be needed for each asset family.                                           | Finance teams will revert to spreadsheets and unresolved work will age silently.                             | High     | High        | Automatic clean composition, one cause-one owner, existing Phase 15 and D11 workspaces, saved filters/aging, guided copy, and no routine D21 approval.                                                                                   |
| Observability gaps                | Yes     | Staff may not know whether work waits on transfer, sale, source finality, mapping, FX, close, accounting, or a correction.                                                                                       | They cannot prioritize, explain, or safely retry the right thing.                                            | High     | High        | Human-readable cause and owner, age, source watermark, last verified time, immutable event timeline, queue-depth/age/SLO metrics, overlap/gap alarms, and correlation IDs without PII.                                                   |
| Dependency and integration risks  | Yes     | Provider field drift, missing stable IDs, lossy CRM labels, provider outage, or confusion between agent and legal-donee modes can change semantics silently.                                                     | The same-looking provider record may require completely different source treatment.                          | Critical | High        | Versioned capability contracts, raw-source provenance, provider-role certification, contract fixtures, drift quarantine, repair sweeps, and artifact/manual evidence continuity.                                                         |
| Migration and upgrade risks       | Yes     | Historical proceeds already included in D17 Opening Position can be replayed; provider-specific fields can leak into the canonical schema; ambiguous old rows can be falsely upgraded.                           | Migration can double balances or make future adapter changes impossible.                                     | Critical | Medium-high | Exact half-open cutover, D17 coverage dispositions, reference-only ambiguity, proof-gated gap-only backfill, versioned readers/adapters, and post-cutover overlap/gap monitoring.                                                        |
| Other development hazards         | Yes     | Concurrent reviewers, partial sales, redesignations, corrections, and closes can race; stale policies can win; overflow or unstable serialization can change hashes.                                             | Rare timing defects can become permanent financial history.                                                  | Critical | Medium-high | Deterministic lock order, CAS/version checks, canonical serialization/digests, checked arithmetic, database constraints, property/state-machine/concurrency tests, kill switches, and smallest-scope rollback by append-only correction. |

### Ruthless synthesis and implementation order

The best permanent path is deliberately narrow and must be built in this order:

1. **Close the semantic hole first.** Amend D2 so an original noncash posting,
   recognized value, or FMV can never create a monetary Support Allocation
   Candidate. Establish Phase 15's versioned canonical asset/disposition source
   projection instead of adding D21 source truth.
2. **Freeze authority and source modes.** Define legal-recipient/provider-role
   classification, exact source-final evidence shapes, non-overlapping quantity
   and money coverage, correction lineage, and semantic-family exclusivity with
   D3, D20, and Phase 20 D19.
3. **Build the invariant seam before screens.** Prove checked minor-unit and
   exact-scale quantity conservation, deterministic purpose allocation, D5/D6
   behavior, idempotency, CAS reauthorization, and atomic D2/D11 admission.
4. **Make the common path silent.** Ship `net_realized` as the no-setup default.
   Add organization-absorbed exact costs only as a prospective proof-gated
   choice; do not ship a formula builder or per-gift toggle.
5. **Reuse the existing work and detail surfaces.** Keep Phase 15 source tasks
   and D11 integrity tasks cause-owned, add one conditional contribution-detail
   lifecycle, and expose one action only when someone must act.
6. **Publish one human story.** Missionaries see one grouped contribution
   lifecycle and only closed, tenant-authorized support truth; donors retain the
   original gift/receipt truth; nobody sees availability or payment claims.
7. **Cut over with D17 coverage.** Activate prospectively at an exact
   source-family boundary. Permit only proved, non-overlapping gap recovery;
   ambiguous history remains reference-only.
8. **Certify before launch.** Search/provider research precedes adapter work;
   contract, property, concurrency, RLS/privacy, accessibility, load, migration,
   and production-shaped shadow tests precede authorization.

This sequence removes the critical double-counting risk before adding UX and
keeps the permanent answer smaller than a workaround: one source projection,
one derivative manifest, one bounded policy, one close fence, and existing
workspaces.

### Non-negotiable proof gates

- No noncash recognized value, appraisal, or FMV can create D2 provisional
  monetary support.
- A realization cannot create a Contribution, receipt, pledge fulfillment,
  campaign/fundraising increment, donor-lifetime increment, or supporter
  relationship.
- Property tests prove quantity and minor-unit conservation across arbitrary
  partial tranches, line allocations, and event orderings.
- Fixtures cover full gross/cost/net evidence, legitimate exact-net-only
  evidence, retained/consumed/abandoned property, installment proceeds,
  canceled trades, costs at or above proceeds, late costs, and adverse
  corrections.
- Idempotent replay, duplicate import, out-of-order event, ambiguous outcome,
  concurrent partial-sale, redesignation, correction-versus-close, and
  organization-absorbed-cost tests pass.
- D3 applies only to Realized Support Basis; D6 converts each tranche once; D20
  and Phase 20 D19 cannot claim a D21 cost component.
- D17 opening and D21 realization coverage cannot overlap. Positive backfill
  requires exact proof of a gap; adverse correction continuity is mandatory.
- RLS and service tests prove Tenant x Legal Entity x source x purpose x Support
  Assignment x Field Account x currency isolation for rows, counts, search,
  subscriptions, exports, and evidence retrieval.
- Missionary projections show one gift lifecycle, never the appraisal value,
  raw evidence, duplicate donation, or availability/payment/accounting claim.
- Usability tests with finance staff, general admins, missionaries,
  keyboard-only users, and screen-reader users achieve at least 90% unassisted
  task and comprehension success; zero participants may interpret valuation as
  balance, one lifecycle as two gifts, or realization as available/payable
  money.
- Critical flows pass at 320 CSS pixels, 200%/400% zoom, keyboard-only, and with
  screen readers; status is not color-only, errors are inline, and focus is not
  obscured.

### C-prime-amended-and-hardened recommendation

**C-prime-amended-and-hardened (C-prime-R) - one immutable,
source-mode-honest Noncash Support Realization bridge preserving the original
noncash Contribution, legal-donor, accepted-purpose, gift-date, valuation,
receipt, supporter, and source-owned disposition truth without creating
monetary Field Account support; admitting only exact source-final proceeds
through capability-certified Tenant-, Legal-Entity-, source-role-, asset-lot-,
purpose-, and currency-scoped contracts; freezing non-overlapping quantity and
minor-unit proceeds coverage, exact finality evidence, one zero-setup
net-realized default or prospective proof-gated organization-absorbed
exact-cost treatment, deterministic line allocation and residuals, D6-owned
external conversion evidence, source and policy versions, semantic
idempotency, and append-only correction lineage; creating exactly one
D11-balanced Field Account occurrence only through D2's CAS-guarded Support
Cycle admission, with D3 assessment applied only to the resulting Realized
Support Basis, D5 owning valid purpose succession, D17 owning pre-cutover
coverage, D19 owning participant access, Phase 15 owning source facts, and
Phase 20 alone owning separately certified accounting delivery; supporting
partial, pooled, installment, and terminal nonmonetary dispositions only with
exact source coverage; and presenting one conditional, accessible,
exception-first staff lifecycle plus one quiet grouped missionary story -
without valuation-as-cash, a second gift, duplicate donor/supporter/fundraising
credit, mutable sale truth, fuzzy lot allocation, inferred costs or settlement,
per-gift truth toggles, double-applied costs, implicit FX, silent redesignation,
asset custody/trading, gain/loss accounting, QBO/Xero authority, or any
available, payable, payroll-ready, or paid claim.**

**Historical founder prompt (answered below):** Do you ratify this C-prime-R as
Phase 21 D21?

## D21 ratification and congruency disposition

**Status:** Founder ratified C-prime-amended-and-hardened as Phase 21 D21 on
2026-08-01.

The complete recommendation immediately above is now binding Phase 21
authority. In particular, the ratification closes the semantic ambiguity that
could otherwise let an original noncash recognized value, FMV, appraisal, or
provider estimate become monetary Field Account support. Only the exact
source-final `Realized Support Basis` frozen by a non-overlapping Noncash
Support Realization Manifest may become a D2 Support Allocation Candidate.

The congruency pass therefore propagates D21 through the root glossary, Phase 1
ownership matrix, Phase 13 original-Contribution boundary, Phase 15 canonical
asset/disposition projection, Phase 20 accounting-dark boundary, Phase 21
roadmap/index surfaces, and ADR-0110. These amendments preserve D1-D20 and add
no runtime implementation authority. Phase 20 does not gain an accounting lane:
future delivery requires a separate Phase 20 certification proving that one
canonical economic source is posted exactly once rather than posting both the
asset disposition and its derivative Field Account effect.

## D22 decision research — prospective expense authorization

**Status:** researched and ready for one founder decision; not ratified. D1-D21
remain authoritative.

### Concrete scenario and unresolved authority

A missionary plans a USD 2,400 ministry trip or equipment purchase next month
and wants the organization to approve the purpose and maximum amount before the
missionary commits personal money. Today Phase 21 can govern an incurred claim,
receipt, travel calculation, advance, reimbursement obligation, handoff, payment
evidence, and Field Account effect. It cannot authoritatively answer the earlier
question: **“Does the organization approve this specific plan before I spend?”**

The existing boundaries make that gap deliberate but real:

- D9's Support Plan and reserve projection are planning aids, explicitly not
  spending authorization.
- D10 and D13 begin with an incurred Expense Claim and govern actual facts,
  evidence, policy, approval, and correction after the economic event.
- D16's Advance is a separate economic occurrence and cannot stand in for
  ordinary permission to incur an expense.
- D15 begins only after a Reimbursement Obligation exists.
- D1 already permits insufficient capacity to affect a prospective spending
  authorization, but no current decision owns that authorization's scope,
  lifecycle, amendment, capacity consequence, or later-claim coverage.

Leaving that seam implicit would make email, chat, a Support Plan, a balance, an
advance, or an informal `yes` look authoritative without fixing what was
approved, for how much, in which currency, until when, or how it relates to the
actual claim.

### Current product and missions-practice evidence

- [Ramp spend requests](https://support.ramp.com/hc/en-us/articles/4409480530707-Spend-requests-and-spending-limit-increases)
  use a short request doorway and finance-owned routing. Ramp's
  [approval setup](https://support.ramp.com/setting-up-spend-request-approvals/)
  freezes the approval flow when a request is submitted and supports separation
  of duties. The useful pattern is fast intake plus frozen routing—not Ramp's
  card/fund issuance, immediate spending-power claim, or destructive archive.
- [Brex request types](https://www.brex.com/support/request-types) ask only the
  essential questions for the selected use and route them through policy-owned
  review. Its
  [spend-request workflow](https://www.brex.com/support/manage-budgets-and-spend-limits)
  supports mobile entry, temporary windows, visible approval progress, and
  withdrawal before final approval. Asym should not copy cards, mutable spend
  limits, purchase orders, or converted budget totals.
- [SAP Concur Request](https://help.sap.com/docs/CONCUR_REQUEST/fb896189509b449ca55f47eafb730daa/1f6ce987945f45ada5b23cc0addcb09a.html)
  separates pre-spend approval from the later expense report and can associate
  the approved request with actual expenses. Its
  [budget-request model](https://help.sap.com/docs/concur-request/concur-request-professional-edition-end-user-help/create-budget-request)
  also proves that reserved coverage can be explicit rather than implied.
- [Christian Health Service Corps](https://www.healthservicecorps.org/contribution-acceptance-policy/)
  separates missionary budgets, projected-expense advances, incurred expense
  substantiation, reimbursement, and monthly compensation. This supports a
  distinct optional before-spend decision without turning Asym into payroll,
  accounting, travel booking, procurement, or card software.
- [Reliant reimbursement guidance](https://solomon.reliant.org/plugins/viewsource/viewpagesrc.action?pageId=185927425)
  emphasizes organizational discretion, ministry purpose, stewardship, and the
  possibility that an excessive expense will not be reimbursed. A clear
  prospective approval can prevent avoidable disputes, but actual
  substantiation and policy eligibility must remain independently reviewable.

### Option A — Keep Phase 21 post-spend only

Tenants handle prior approval through email, chat, forms, or another product.

- **Benefit:** smallest Phase 21 surface.
- **Cost:** a missionary can commit personal money without an exact, durable
  organization decision; later finance staff cannot reliably distinguish a
  real approval from advice or conversation.
- **Verdict:** safe only for tenants that genuinely do not use preapproval, but
  incomplete as the sole product answer.

### Option B — Add a lightweight `Ask finance` task

Capture a planned amount, purpose, message, and staff response as a task or
conversation.

- **Benefit:** friendly and quick.
- **Cost:** dangerously ambiguous. A plain `yes` will be treated as approval
  despite having no exact ceiling, currency, validity window, policy/route
  version, conditions, capacity consequence, amendment history, or claim
  coverage.
- **Verdict:** simplicity at the screen creates legal, operational, and trust
  debt behind it.

### Option C-prime — One optional, policy-bounded Prospective Expense Authorization — recommended

The tenant decides prospectively when a request is required, optional, or not
managed in Asym. One immutable request and organization decision pin the exact
purpose, ceiling, ISO currency, validity window, required evidence, conditions,
authority, and route. The tenant chooses one explicit consequence:

1. **Approval only** — the organization approves the plan; capacity is checked
   independently later; or
2. **Approval plus compatible capacity reservation** — exact finance-confirmed,
   same-currency, purpose-compatible capacity is reserved once without creating
   an expense, obligation, payment, or balance effect.

Later D10 claim items or splits may consume exact, non-overlapping authorization
coverage. Actual incurred facts, substantiation, jurisdiction, policy,
classification, sanctions/security review, excess amounts, reimbursement,
payment, and accounting remain independently authoritative.

### One quiet, adaptive experience

The feature is tenant-off by default and creates no top-level module. When
enabled, the existing **Expenses** doorway offers:

- **Add expense**
- **Plan an expense**

The mobile-first missionary form initially asks only:

1. What are you planning?
2. About how much, and in which currency?
3. When do you expect to incur it?
4. Which ministry purpose or project is it for?

Quotes, itineraries, attendees, security details, or specialist evidence appear
only when the winning tenant policy requires them. Plain-language status is:

`Draft → Under review → More information needed / Approved as planned / Approved with changes / Not approved`

An approval shows its exact ceiling/currency, purpose, valid-through date, and
conditions, with one **Add expense to this plan** action. A changed price,
purpose, date, or currency uses **Request a change** and an immutable successor;
it never edits the relied-upon decision.

Capacity copy must tell the literal truth:

- with exact reservation: `The organization has set aside support capacity for
this plan.`
- without reservation: `Approved as planned. Support capacity will be checked
separately.`

It never says `funds available`, `spending power`, `guaranteed reimbursement`,
`ready to pay`, `your money`, or `paid`.

Finance setup belongs under **Settings → Expenses → Expense Program →
Before-spend approvals**, defaulting to **Not managed in Asym**. Bounded policy
inputs may include expense family/purpose, exact-currency threshold, project or
trip category, Expense Policy Cohort, relationship/classification, required or
optional status, and the one consequence above. The guided route remains
`Missionary submits → one independent authorized reviewer`; advanced routes stay
collapsed until a real tenant exception requires them. There is no free-form
workflow graph, natural-language financial rule, or admin-defined priority
language.

Finance reviews work in the existing expense workspace with a **Planned
expenses** filter. Each row shows missionary, purpose, ceiling/currency,
intended dates, why review is required, current owner, and age. Actions are
**Approve as planned**, **Approve with changes**, **Ask for information**, **Not
approved**, or **Refer for specialist review**. Confirmation states the exact
consequence before commitment.

### Initial hardening boundary

- Approval freezes organization-discretionary terms for its exact scope; a
  later policy edit cannot silently withdraw relied-upon approval.
- Revocation applies only to proved-unincurred future scope. It cannot erase an
  expense incurred while the authorization was valid.
- One authorization may cover several later claim items, but every atomic item
  or split references at most one authorization coverage unit.
- Ceiling conservation is exact:

  ```text
  approved ceiling
  = applied actual-expense coverage
  + proved-unused released coverage
  + unresolved or in-flight residual
  ```

- A timer alone cannot release coverage because the expense may have been
  incurred but submitted late. Expiry prompts the missionary to add remaining
  expenses, confirm non-use, or say documentation is still in progress.
- Cross-currency approval may remain policy-only. Capacity cannot be reserved
  across currencies without exact externally owned D6 conversion evidence.
- AI/fuzzy matching may suggest a likely authorization but never creates
  coverage or approval.
- Submission, approval, amendment, withdrawal, release, and claim application
  use semantic idempotency, current-authority reproof, CAS/concurrency control,
  append-only history, and complete Tenant/Legal-Entity/purpose/currency scope.
- Approval creates no Expense Claim, Reimbursement Obligation, advance, Field
  Account debit, card, wallet, purchase order, vendor, travel booking, direct
  payment, Accounting Release, or QBO/Xero truth.

### C-prime recommendation for founder selection

**C-prime-amended-and-hardened (C-prime-R) — one tenant-off-by-default,
purpose-scoped Prospective Expense Authorization inside the existing Phase 21
Expense Program, with bounded deterministic policy deciding when a request is
required or optional; one fast accessible `Plan an expense` flow; immutable
request and organization-decision versions pinning exact Tenant, Legal Entity,
participant/payee, purpose, expense family, ceiling, ISO currency, validity,
evidence, authority, and route; tenant-chosen approval-only or compatible
finance-confirmed-capacity-reserving consequence; exact later D10 item/split
coverage, partial use, excess-only review, successor amendments, withdrawal,
expiry, proved-unused-only release, in-flight quarantine, and append-only
recovery—without mandatory preapproval for every expense, mutable approval,
implicit FX, fuzzy coverage, cards, wallets, purchase orders, vendor onboarding,
travel booking, direct payment, accounting authority, or any claim that approved
means incurred, available, guaranteed reimbursable, payable, paid, posted, or
reconciled.**

**Founder question:** A missionary plans a material ministry expense before
committing personal or organizational funds. Should Phase 21 keep prior approval
outside Asym (A), record only an informal finance response (B), or adopt the
recommended optional exact Prospective Expense Authorization (C-prime)?

## D22 founder selection and adversarial hardening

**Status:** Founder selected Option C-prime on 2026-08-01. The selection has
been researched and adversarially hardened below, but it is not ratified yet.
D1-D21 remain the only binding Phase 21 decisions.

### Research disposition

The research supports one narrow before-spend capability, not another expense,
procurement, payment, or accounting product:

- [Ramp's approval documentation](https://support.ramp.com/setting-up-spend-request-approvals/)
  supports submission-time route freezing, visible route preview, conditional
  human review, separation-of-duties controls, reminders, and human-final AI
  suggestions. Its
  [spend-request flow](https://support.ramp.com/spend-requests-and-spending-limit-increases)
  supports fast web/mobile intake. Asym should not copy cards, spend issuance,
  automatic approval, or destructive archive.
- [Brex request types](https://www.brex.com/support/request-types) support
  purpose-specific questions, bounded audiences, inactive request types, and
  configurable human chains. Its
  [approval-chain model](https://www.brex.com/support/approval-chains) reinforces
  clear routing and self-approval controls. Asym should not copy mutable
  provider budgets, card limits, or implicit currency conversion.
- [SAP Concur's request-to-expense flow](https://help.sap.com/docs/CONCUR_REQUEST/ccfb1b533dd24f569506dc7fcad15891/4207c4fcd9a04755ae32c1594832285d.html)
  keeps a prospective request distinct from one or more later actual expense
  reports. Its
  [unused-request closing guidance](https://help.sap.com/docs/concur-request/concur-request-professional-edition-administration-guides/closing-inactivating-request)
  exposes the residual-risk problem: elapsed time alone cannot prove that an
  approved amount was never incurred.
- [Oracle Spend Authorizations](https://docs.oracle.com/en/cloud/saas/financials/26b/fawde/overview-of-spend-authorizations.html)
  likewise separate a planned estimate, approval, later actual report, and
  actual-versus-authorized comparison.
- [Expensify travel approval](https://help.expensify.com/articles/travel/travel-policy/Approving-Travel)
  demonstrates explicit pre-spend modes, secondary reviewers, mobile actions,
  and validity windows. Asym should not copy travel booking, email as decision
  authority, or automatic expiry outcomes.
- [Zoho Expense's trip lifecycle](https://www.zoho.com/us/expense/help/trips/overview/)
  supports a separately visible planned-trip lifecycle. Asym should reject
  self-approval, indefinite delegation, priority-ordered rules, and approved
  request edits that evade reapproval.
- The [IRS accountable-plan rules](https://www.irs.gov/individuals/international-taxpayers/nonresident-aliens-and-the-accountable-plan-rules)
  still require business connection, actual substantiation, and return of
  excess. The
  [National Council of Nonprofits](https://www.councilofnonprofits.org/running-nonprofit/administration-and-financial-management/internal-controls-nonprofits)
  identifies advance approval and separation of duties as useful internal
  controls. These sources support prior approval as one control, never as proof
  of the later expense, reimbursement eligibility, liability, payment, or
  accounting.
- Christian missions practice also preserves this separation. Christian Health
  Service Corps describes reviewed missionary budgets, accountable
  reimbursements, receipt substantiation, and travel advances as distinct
  controls in its
  [contribution and missionary-finance policy](https://www.healthservicecorps.org/contribution-acceptance-policy/).
  Pioneers publishes separate prospective advance and later reimbursement
  forms in its
  [Venture FAQ](https://venturetraining.pioneers.org/Media/VentureTraining/New%20images/FAQs%20Venture%202019.05.pdf).
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/), the
  [WAI modal-dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/),
  and the
  [GOV.UK error-summary pattern](https://design-system.service.gov.uk/components/error-summary/)
  support a short progressively disclosed form, visible focus, keyboard-safe
  confirmation, linked field errors, redundant-entry avoidance, reflow, touch
  targets, and programmatically announced status.
- PostgreSQL and Supabase reinforce the implementation boundary:
  [RLS must default-deny exposed rows](https://supabase.com/docs/guides/database/postgres/row-level-security),
  [table owners normally bypass row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html),
  and
  [Serializable transactions can require whole-transaction retry](https://www.postgresql.org/docs/current/transaction-iso.html).
  D22 therefore needs structural scope constraints, the Phase 12 current
  permission decision, and bounded concurrency recovery rather than trusting a
  role name, client-supplied identifier, or service-role job.

### Binding hardening of the selected direction

#### Fully optional means structurally absent

The exact Tenant x Legal Entity posture is independently and prospectively
versioned from D13 Expense Program activation:

1. **Not managed in Asym** - the default. No `Plan an expense` action,
   navigation, empty card, queue, count, report, reminder, notification,
   onboarding task, setup warning, or API enumeration appears. The ordinary
   D10/D13 **Add expense** path remains complete.
2. **Available when helpful** - authorized claimants may request a plan, but no
   later claim is noncompliant merely because it lacks one.
3. **Required for selected expenses** - only the one uniquely resolved,
   previewed policy scope requires prior authorization. A later actual expense
   without it is still capturable and enters D13's typed
   prior-authorization-exception path; D22 never discards actual evidence or
   fabricates retroactive approval.

D13 must be active for the same Tenant and Legal Entity before D22 can activate,
but D13 never silently enables D22. Deactivation is prospective: drafts may be
preserved but cannot newly submit after the boundary; already submitted work
may reach a terminal decision; approved plans, exact applications,
reservations, residuals, and audit history remain until explicitly resolved.
Turning the feature off never deletes work, changes past policy, withdraws an
approval, or releases capacity.

#### Reuse the existing Expense Program without collapsing its truths

D22 reuses D13's deterministic non-stacking scope lattice, finite approval-route
catalog, conflict rules, delegation and reassignment concepts, and activation
proof. It does not create a second policy engine, generic approval framework,
free-form workflow graph, rule-order language, formula/JSON rules engine, or
second expense report.

The following facts remain independently authoritative:

| Fact                                       | Exact authority                                                   | It cannot prove                                                                                  |
| ------------------------------------------ | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Prospective Expense Request Version        | One requester-authored proposed plan                              | Organization approval, an actual expense, capacity, liability, or payment                        |
| Prospective Expense Governance Resolution  | The one submission-time winning bounded policy and route          | Current reviewer authority or actual-incurred-date policy                                        |
| Prospective Approval Assignment Snapshot   | The finite required steps and initial eligible queues/people      | Continuing authority after permission or conflict changes                                        |
| Prospective Expense Review Action          | One immutable human action over one exact version                 | A final decision outside its exact step and coverage                                             |
| Prospective Expense Authorization Decision | The organization's exact before-spend decision and approved terms | Incurred expense, substantiation, reimbursement, liability, availability, payment, or accounting |
| Prospective Expense Authorization Coverage | Exact non-overlapping use by a later D10 item or purpose split    | D10 approval, receipt sufficiency, obligation, payment, or accounting                            |
| Prospective Expense Capacity Reservation   | Optional D1 planning-capacity coverage                            | A balance entry, cash, spending power, guaranteed reimbursement, payable, or payment             |
| D10/D13 actual claim truth                 | Actual facts, evidence, policy, and approval                      | D15 payment, Phase 20 posting, or bank reconciliation                                            |

Do not implement one mutable `status` field across those authorities. The calm
displayed stage is a projection over immutable versions and append-only facts.

Every submitted request pins exact Tenant, Legal Entity, claimant Party,
submitter/preparer, source-owned relationship context, authorized purpose,
certified expense family, positive integer-minor-unit ceiling, one ISO currency,
half-open expected-incurrence window, private plan-evidence references, required
conditions, policy version, route version, and predecessor lineage. D19 spouse,
teammate, leader, or project participation may support navigation only after
current access authorization; it never infers claimant, preparer, approver,
payee, conflict status, or evidence access.

#### Bounded policy, routing, and decisions

The same D13 precedence lattice may resolve a Legal-Entity default plus bounded
exceptions for a certified expense family, exact purpose/project/grant,
prospective Expense Policy Cohort, source-owned relationship/classification,
country or risk class, exact-currency amount band, or exact claimant. Exactly
one version wins. Incomparable matches block only the affected submission and
show the conflicting scopes. There is no automatic approval, including below a
threshold.

The guided route is one independent authorized reviewer or role queue. Bounded
advanced routes may add manager/project, specialist, and final finance steps.
Claimants do not choose their approver. Prepare, submit-on-behalf, view evidence,
ordinary review, final decision, exception decision, reassign, delegate,
configure, reserve/release capacity, and audit/export are separate Phase 12
capabilities.

The route and required steps freeze at submission, but authority does not.
Every action re-proves the actor's current Tenant, Legal Entity, purpose,
subject, operation, coverage, governance epoch, capability, and conflict status.
Known self/preparer conflicts are blocked. Recusal appends evidence and routes
the item onward. A small tenant with no ordinary separation uses a named
independent-oversight route or leaves D22 off; a broad administrator cannot
`approve anyway`.

Delegation is optional, exact-scope, date-bounded, non-transitive, and
append-only. A delegate must hold their own current authority and pass the same
conflict checks. The trail records the actual actor and who they acted for.
Role queues, governed reassignment, and one cause-owned `Needs assignment`
exception recover staff absence; a timer never approves, rejects, skips a
required step, or releases capacity.

`Approve with changes` is narrowing only: a reviewer may lower the ceiling,
shorten the window, or add a code-owned permitted condition with an explanatory
note. Increasing the amount, extending the window, or changing claimant, Legal
Entity, currency, purpose, or expense family requires a requester successor and
fresh resolution/reapproval. Reviewers never rewrite the requester's plan.

#### Exact optional capacity consequence and later-claim coverage

The default enabled consequence is **approval only**. Tenants may separately
certify **approval plus compatible capacity reservation** for selected scopes.
It is allowed only against D1's exact Finance-confirmed Planning Coverage Base
for the same Tenant, Legal Entity, purpose, Field Account, and ISO currency.
Cross-currency human approval may remain approval-only; no capacity or monetary
coverage crosses currency without exact externally owned D6 conversion
evidence.

For a reservation-bearing decision, the final human decision and the full exact
reservation are one CAS-guarded atomic commit. The UI never says `Approved`
while reservation is pending, partial, or failed, and the system never silently
downgrades to approval-only. If capacity changed, nothing commits; the reviewer
may explicitly approve a lower fully reserved ceiling when policy permits or
choose approval-only when separately authorized.

One authorization may cover several later claims when its frozen policy permits
it, but every D10 item or purpose split applies to at most one exact
authorization slice. Suggestions from amount similarity, OCR, or AI remain
candidates only. Exact application requires a current authorized action and
same Legal Entity, purpose, currency, incurrence window, versions, and integer
minor units. A larger actual expense preserves valid within-ceiling coverage;
only the excess enters successor authorization or D13 exception review.

For each authorization and currency:

```text
approved ceiling
= exact later-claim application coverage
+ proved-unused released coverage
+ unresolved or in-flight residual coverage
```

The terms are mutually exclusive and collectively exhaustive. When a later
independently approved actual expense obtains D1 Field Account Funding Coverage,
the corresponding reservation slice is fulfilled or reclassified atomically;
it never remains simultaneously reusable and consumed.

Expiry ends new reliance. It cannot prove that an in-window expense was not
incurred, so a claim proved incurred within the window may be submitted later.
No timer releases a residual. Release requires an immutable Unused Scope
Declaration plus current proof that the exact slice is not linked, claimed,
uploading, correcting, appealing, or otherwise in flight. Uncertain residuals
remain quarantined and visible to finance. Withdrawal before decision, ending
future authorization, declaring unused residual, and correcting exact coverage
are four distinct append-only actions.

#### One quiet, complete UX

When enabled for the current person and scope, the existing **Expenses** page
shows:

- **Add expense** - already incurred; always the primary path; and
- **Plan an expense** - ask before spending; secondary and absent when D22 is
  off.

The ordinary mobile-first plan asks only:

1. **What are you planning?**
2. **About how much?** with an exact amount and ISO currency.
3. **When do you expect to incur it?**
4. **Which ministry purpose or project is it for?**

Known claimant, Legal Entity, relationship, and purpose data are confirmed or
prefilled, not retyped. Quotes, itineraries, attendees, location/security
details, or specialist evidence appear only when the winning policy requires
them and use private purpose-separated Prospective Expense Evidence, not D10
receipt truth. A preparer sees `Prepared by [actor] for [claimant]`.

Drafts autosave and can resume. A device-local offline draft must say `Saved on
this device - not submitted`; uploads expose per-file progress and recovery.
Submission, withdrawal, decisions, assignment, delegation, reservation,
release, and exact coverage are never queued offline or shown optimistically.
Success requires the committed server result.

Before submission, one summary shows exact plan, claimant/submitter, evidence,
route by role, capacity consequence, and this boundary:

> You are asking the organization to approve this plan before you spend. Even
> if approved, submit the actual expense and required receipts afterward.
> Approval does not guarantee reimbursement or payment.

The requester sees one calm timeline, current owner role, target review date
clearly labeled as a target, one next action, and expandable history. An
approval card leads with exact terms, for example:

> **Approved for up to USD 2,000**
> Ministry travel - expenses incurred Aug 10-17, 2026
> Condition: economy airfare. Submit actual expenses and receipts afterward.

Then it shows exactly one capacity sentence:

- approval only: `Support capacity will be checked separately.`
- reserved: `The organization set aside USD 2,000 of support capacity for this
plan. This is not cash available to spend or a reimbursement guarantee.`

Primary action is **Add expense to this plan**. It may prefill compatible plan
context, but the claimant still confirms actual amount, currency, incurred
date, merchant/payee, business purpose, economic payer, purpose splits, and
receipts. Secondary actions are **Request a change**, **I will not use the
remaining approval**, and contextual **Ask finance**.

Staff use one **Planned expenses** view inside the existing Expenses workspace,
not a new module. The default reviewer view is **Needs my review**, with quiet
saved views for needs assignment, waiting for requester, due/overdue, approved
and active, past dates, and history. Rows expose only low-sensitivity facts.
Healthy approvals do not enter Mission Control; only exact conflicts, missing
reviewers, capacity races, evidence failures, stale purposes, or unresolved
residuals create cause-owned exceptions.

The detail hierarchy is: exact decision summary; immutable proposed facts and
changes; why review is required; authorized evidence/conditions; exact capacity
consequence; approval path; history. Actions are **Approve as requested**,
**Approve with changes**, **Ask for information**, **Do not approve**, governed
**Refer for specialist review**, **Recuse**, and capability-checked **Reassign**.
Each final action repeats the literal amount, currency, purpose, dates, and
consequence. `Approve and open next` provides speed without blind bulk approval.

Notifications are sparse secondary delivery: assignment, one near-target
reminder, one overdue digest/escalation, exact information request, terminal
decision, future-use stop, and active-residual expiry prompt. Messages say only
that a planned expense needs attention and deep-link to the authenticated
surface; they omit itinerary, location, health/security details, evidence,
private notes, and unnecessary amounts. Delivery failure never changes the
decision.

All surfaces meet the repo's WCAG 2.2 AA contract: semantic forms and headings,
Base UI primitives, labeled controls, 44px targets, 320 CSS-pixel reflow,
keyboard and screen-reader operation, visible/unobscured focus, no color-only
meaning, status announcements without focus theft, linked error summary,
localized display plus explicit ISO currency, and manual testing in addition to
automated axe checks.

### Ruthless adversarial review

Every requested category has a concern. The ratings assume a multi-tenant
production system without the stated permanent control.

| Category                          | Concern? | What could go wrong                                                                                                                                                                                                                            | Why it matters                                                                                                         | Severity | Likelihood  | Permanent fix or prevention                                                                                                                                                                                                                    |
| --------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | Yes      | Mutable plans, live-policy lookup, a named-person-only route, timer release, or one overloaded status fail when staff, policy, dates, capacity, or claims change.                                                                              | Ordinary turnover, late claims, changed plans, retries, and concurrency would strand work or change what was approved. | Critical | High        | Immutable request/policy/route/decision versions; role queues; append-only succession; current-authority reproof; exact residual conservation; independent state families.                                                                     |
| Technical debt                    | Yes      | A second workflow/policy/reservation engine, generic approval table, JSON rules, or a preapproval field bolted onto D10 will diverge from D13 and D1.                                                                                          | Every permission, delegation, correction, audit, and test would need two subtly different implementations.             | High     | High        | Reuse D13's finite route and non-stacking resolver and D1's typed coverage; add only purpose-specific prospective facts and constrained relational links.                                                                                      |
| Edge cases                        | Yes      | Partial use, multiple claims, excess, corrections, late submission, changed purpose/currency/date, departure, disable mid-flight, duplicate actions, zero/three-decimal currencies, and exact-boundary expenses can break a naive yes/no flow. | These are normal mission operations and can cause false denials, double use, or lost evidence.                         | Critical | High        | One purpose/currency, exact minor units, half-open windows, item/split coverage, successor versions, typed excess/missing-authorization paths, CAS, and unresolved-residual quarantine.                                                        |
| Footguns                          | Yes      | `Approved` may be read as available or guaranteed; admins may self/bulk/auto-approve, reviewers may rewrite plans, expiry may free in-flight capacity, or AI may become authority.                                                             | A user can rely on money or eligibility the organization has not established.                                          | Critical | High        | Consequence-explicit copy and confirmation; separation of duties; narrowing-only change; no self, AI, automatic, timeout, email-link, blind bulk, or generic override; no timer release.                                                       |
| Tenant safety                     | Yes      | Requests, evidence, reviewers, queues, notifications, cache, jobs, or coverage may cross Tenant, Legal Entity, claimant, purpose, Field Account, or currency.                                                                                  | A leak can expose finance, travel, health, or restricted-location data and reserve another organization's capacity.    | Critical | Medium-high | Composite scope keys/FKs; forced default-deny RLS; Phase 12 authorization before enumeration; private storage; tenant-scoped jobs/outbox/idempotency; uniform unauthorized failures; substitution tests.                                       |
| Over-engineering                  | Yes      | Flexibility can expand into workflow canvas, procurement, PO/vendor, cards/wallets, travel booking, budget, AP, payroll, payment, or accounting.                                                                                               | The uncommon feature would burden most tenants and duplicate specialized systems.                                      | High     | High        | Three postures, one guided route, finite D13 variants, two consequences, progressive disclosure, no top-level module, and explicit permanent non-goals.                                                                                        |
| UX/UI and user friction           | Yes      | Disabled tenants may see noise; requesters may face enterprise forms; approvers may confuse plans and claims; mobile/offline/error states may lose trust; reminders may become spam.                                                           | People will bypass Asym through email, making approval less reliable than before.                                      | High     | High        | Structural absence when off; four-question adaptive form; one Expenses doorway; exact term diff; one next action; autosave; sparse notifications; role queues; mobile and WCAG 2.2 AA proof.                                                   |
| Hidden coupling                   | Yes      | D19 membership, D13 actual approval, D9 balances, D15 payment, Phase 20 posting, AI suggestions, or notification delivery may silently determine D22 truth.                                                                                    | A people, display, downstream, or provider change could alter financial authority.                                     | Critical | High        | Independent authority records and one-way versioned references; D19 never grants expense authority; notifications/AI are advisory; D22 remains accounting-dark.                                                                                |
| Failure modes                     | Yes      | Upload/submit split success, stale clients, duplicate clicks, lost authority, reviewer departure, capacity races, notification outage, or crash between decision and reservation can show a false result.                                      | False approval or duplicate reservation creates direct reliance and integrity harm.                                    | Critical | Medium-high | Server-confirmed commands; atomic decision/reservation/outbox commit; semantic idempotency; CAS; bounded transaction retries; inspectable stages; durable reassignment; honest recovery copy.                                                  |
| Data integrity risks              | Yes      | Decisions, coverage, reservations, applications, releases, and corrections may overlap, exceed the ceiling, go negative, cross currency, or mutate history.                                                                                    | Capacity can be used twice and later evidence cannot reproduce the decision.                                           | Critical | High        | Checked minor-unit arithmetic; unique/exclusion/composite constraints; exact conservation; immutable facts; deterministic locks; append-only compensation; property and real-database concurrency tests.                                       |
| Security and privacy risks        | Yes      | Quotes, itineraries, locations, vendors, health/security context, free text, and delegate access may be overexposed through lists, links, logs, notifications, AI, or storage.                                                                 | Harm can include physical safety and ministry exposure, not just financial loss.                                       | Critical | High        | Purpose-separated private evidence; least-privilege step access; short-lived retrieval; protected audit; redacted notifications/logs; separate capabilities; immediate deny-first revocation; no AI authority.                                 |
| Scalability and performance risks | Yes      | Full-history policy evaluation, unbounded inboxes, tenant-wide locks, synchronous evidence work, and live financial totals will fail at month end or travel season.                                                                            | Slow review drives users off-system and can make deadlines meaningless.                                                | High     | Medium-high | Submission-time snapshots; scoped indexes; keyset pagination; short deterministic row locks; async evidence/outbox; tenant-fair workers; production-cardinality load tests.                                                                    |
| Operational burden                | Yes      | Named-reviewer churn, bespoke routes, daily reminders, expired residual cleanup, and unclear ownership can turn an optional feature into permanent finance work.                                                                               | Tenants will disable or bypass a process that costs more than email.                                                   | High     | High        | Role-queue default; guided activation/preview; date-bounded delegation; one-click reassignment; restrained digests; exception-first views; explicit residual prompts; cause-owned repair.                                                      |
| Observability gaps                | Yes      | Staff may not distinguish upload, assignment, review, decision, reservation, claim coverage, notification, payment, or accounting waits.                                                                                                       | Operators cannot diagnose stuck work without reading sensitive records or guessing.                                    | High     | High        | Opaque correlation IDs; structured stage/reason/owner/age events; route and outbox metrics; conservation monitors; immutable action timeline; protected evidence retrieval.                                                                    |
| Dependency and integration risks  | Yes      | Phase 12, D1/D5/D6/D10/D13/D19, Phase 6 notifications, Phase 29 bytes, and later D15/Phase 20 may drift or become unavailable.                                                                                                                 | An implicit fallback could approve the wrong scope, leak evidence, or claim false downstream parity.                   | Critical | Medium-high | Capability-labelled contracts; pinned source versions; contract tests; explicit unsupported/unavailable states; manual continuity; approval core independent of AI, notification, payment, and accounting providers.                           |
| Migration and upgrade risks       | Yes      | Historic email approvals may be fabricated as D22 truth; new policy code may reinterpret old requests; mutable provider IDs or free-form conditions may make history nonportable.                                                              | Tenants could no longer prove what was approved or migrate/export it faithfully.                                       | High     | Medium-high | Prospective activation boundary; no authoritative backfill without exact proof; stable opaque IDs; versioned canonical schemas/manifests; frozen source evidence; shadow validation; full lineage export.                                      |
| Other development hazards         | Yes      | Timezone/DST mistakes, route/delegation loops, self-conflict, serialization/deadlock retries, cache staleness, service-role RLS bypass, unsafe rollback, and weak tests may invalidate exact decisions.                                        | These defects often surface only after a person has relied on approval.                                                | Critical | High        | UTC instants plus Legal-Entity display timezone; acyclic finite routes; current conflict checks; persistent idempotency; deterministic lock order; bounded `40001`/`40P01` retries; successor rollback; fault injection and public-seam tests. |

### Ruthless synthesis: the permanent path, in order

1. **Lock the boundary first.** D22 authorizes only a proposed plan. Preserve
   the independent authority of D10/D13 actual claims, D1/D11 capacity, D15
   payment handoff, external payment providers, and Phase 20/QBO/Xero. Ban
   availability, guarantee, payment, and accounting claims from D22 copy and
   contracts.
2. **Make optionality structural.** Ship the exact three-posture model with
   `Not managed in Asym` as the Tenant x Legal Entity default. Prove that off
   tenants have no UI, API, queue, notification, reporting, or claim-path
   friction.
3. **Extend, do not fork, D13.** Reuse its one bounded profile lattice, finite
   route catalog, operation-scoped assignment snapshots, conflict handling,
   delegation, and activation proof. Define the exact new request, decision,
   evidence, coverage, and residual terms before implementation.
4. **Make the domain exact and conserving.** Use immutable versions,
   append-only actions, single-purpose/single-currency minor-unit ceilings,
   exact later-item/split applications, and the ceiling equation. Keep
   authorization and optional capacity reservation separate but commit them
   atomically when the latter is selected.
5. **Complete the human workflow.** Provide role-queue default, bounded named or
   specialist routes, current authority reproof, recusal, date-bounded
   non-transitive delegation, reasoned reassignment, target-date escalation,
   and a no-timeout-outcome rule. Never create a hidden admin bypass.
6. **Build one low-friction experience.** Keep `Add expense` primary and add the
   contextual four-question `Plan an expense`; use one `Planned expenses` view,
   progressive evidence, exact consequence confirmations, a fast next-item
   action after commit, sparse notifications, offline drafts only, and fully
   tested WCAG 2.2 AA behavior.
7. **Harden the command and data boundary.** Use `packages/api` privileged
   commands, composite scope constraints, forced default-deny RLS, the Phase 12
   current permission decision, persistent semantic idempotency, CAS,
   deterministic locks, atomic outbox, private evidence, and bounded recovery.
8. **Prove before activation.** Require policy/route simulations; tenant and
   Legal-Entity isolation; permission/SoD tests; conservation property tests;
   real PostgreSQL concurrency and fault injection; expiry/late-claim and
   disable tests; mobile/offline/accessibility/usability testing; load tests;
   and comprehension testing that users distinguish planned, approved,
   reserved, incurred, reimbursable/owed, payable, paid, and posted.

### Ratification candidate

**C-prime-amended-and-hardened (C-prime-R) - one independently optional,
Tenant- and Legal-Entity-off-by-default, purpose-scoped Prospective Expense
Authorization inside the existing Phase 21 Expense Program and Expenses
doorway, structurally absent from requester, reviewer, admin, notification,
reporting, and API projections unless prospectively activated as
available-when-helpful or required-for-selected-expenses through D13's bounded
non-stacking scope lattice; with one fast accessible four-question `Plan an
expense` flow; separate immutable requester-authored Request Versions, private
plan-evidence coverage, submission-time Governance Resolutions and
operation-scoped finite Approval Assignment Snapshots, current-authority-
rechecked human Review Actions, and exact Organization Authorization Decisions
pinning Tenant, Legal Entity, claimant Party, submitter/preparer, source-owned
relationship context, purpose, certified expense family, positive integer-
minor-unit ceiling, one ISO currency, half-open incurrence window, frozen
permitted conditions, authority, route, and source/policy versions; guided
approval-only behavior plus one advanced, explicitly certified, same-purpose
and same-currency D1 capacity-reservation consequence committed atomically with
the final decision; exact non-overlapping later D10 item/split Authorization
Coverage, partial and multi-claim use, within-ceiling preservation and
excess-only review, narrowing-only approval changes, immutable successor
amendments, pre-decision withdrawal, prospective future-use end, expiry without
timer release, proved-unused-only release, in-flight residual quarantine,
semantic idempotency, CAS/concurrency protection, and append-only correction
and recovery; one quiet exception-first `Planned expenses` staff surface with
role queues, separate prepare/submit/view/decide/exception/reassign/delegate/
configure/reserve capabilities, recusal, date-bounded non-transitive
delegation, named independent small-tenant oversight, sparse privacy-minimized
notifications, online-only authoritative actions, resumable mobile drafts, and
WCAG 2.2 AA proof - without enabling from D13 or D19 alone, mandatory
preapproval for every tenant or expense, claimant-selected reviewers, mutable
request or decision truth, a second workflow or reservation engine, broad
administrator bypass, self-, AI-, automatic-, email-link-, bulk-, or timeout
approval, timer-based release, implicit FX, fuzzy claim coverage, public
evidence, cards, wallets, spend limits, purchase orders, vendor onboarding,
travel booking, direct payment, payroll or accounting authority, or any claim
that planned or approved means reserved, incurred, substantiated,
policy-eligible, reimbursable, owed, available, guaranteed, payable, paid,
posted, synced, or reconciled.**

**Founder question:** Do you ratify this C-prime-amended-and-hardened
(C-prime-R) as Phase 21 D22?

## D22 ratification and congruency disposition

**Status:** Founder ratified C-prime-amended-and-hardened as Phase 21 D22 on
2026-08-01.

The complete ratification candidate and adversarial controls immediately above
are now binding Phase 21 authority. In particular:

- `Not managed in Asym` is the Tenant x Legal Entity default and means
  structural absence, not a dormant workflow that still creates setup,
  reporting, queue, reminder, API, or actual-claim friction.
- D22 reuses D13's bounded non-stacking governance and finite-route machinery
  without merging prospective authorization into incurred Expense Policy
  Decision truth or creating a second workflow engine.
- The Request Version, Governance Resolution, Assignment Snapshot, human Review
  Actions, Organization Authorization Decision, optional D1 capacity
  reservation, later D10 item/split coverage, and residual dispositions remain
  independently authoritative.
- The enabled default is approval-only. Any capacity-reservation consequence is
  separately certified, exact-purpose and same-currency, and commits atomically
  with the final decision without asserting cash availability, reimbursement,
  liability, payment, payroll, posting, or accounting.
- Missing required prior authorization never prevents capture of an actual
  expense or evidence. D10/D13 instead owns a typed exception and independently
  decides the actual claim.
- Expiry ends new reliance but never proves an amount unused or releases
  uncertain capacity. Exact later-claim application, proved-unused release, and
  unresolved/in-flight residual coverage must conserve the approved ceiling.

The congruency pass records these terms in the root glossary, ADR-0111, the
Phase 1 ownership matrix, Phase 3 projection census, Phase 6 and Phase 17
notification boundaries, Phase 10 safety floor, Phase 12 capability boundary,
Phase 29 private-byte and Phase 39 offline limits in the roadmap, Phase 20
expense-handoff and negative-accounting contracts, Phase 21 roadmap/index
surfaces, and the active Phase 20 OpenSpec rejection contract. It deliberately
adds no Phase 17 executable message key, runtime behavior, schema, API, ticket,
or implementation dispatch and does not reopen D1-D21.

## D23 decision research — Exact Expense Field Account Effect Recognition

**Status:** the founder ratified the adversarially hardened C-prime-R as Phase
21 D23 on 2026-08-01. D1-D23 are the complete binding Phase 21 decision set at
this point in the grill.

### The unresolved product truth

D10, D13, D15, D16, D20, D22, and Phase 20 correctly separate the Expense
Claim, Approved Expense Snapshot, Reimbursement Obligation, Field Account
Funding Coverage, reimbursement handoff, External Payment Occurrence,
Accounting Release, and final QBO/Xero books. They do not yet define the
ordinary-expense equivalent of D4's explicit Compensation Effect Recognition
Policy: the exact source occurrence, date, amount, and currency that causes an
ordinary approved expense to reduce a Finance-confirmed Field Account Balance.

This is not an implementation detail. Consider one missionary expense:

```text
Aug 2   Missionary incurs KES 30,000 of ministry travel.
Aug 8   Finance approves the claim and establishes an obligation.
Aug 20  Finance hands the reimbursement to payroll/AP.
Aug 31  External payment executes in KES.
Sep 1   QBO/Xero posts the Legal Entity's books in its functional currency.
```

If the Field Account is USD, two otherwise conforming implementations could
debit it on August 8 or August 31, choose different converted amounts, or debit
both. Organization-card and organization-paid expenses have no claimant
Reimbursement Obligation at all, while paying a later card statement settles a
liability rather than incurring the expense again. Without a ratified contract,
the same source facts can produce different support balances.

### Current evidence and modern practice

- Ramp represents reimbursements as bills and, when Ramp pays, separate bill
  payments. An outside-paid reimbursement can remain an open bill until the
  external payment is recorded. Its QBO guidance likewise distinguishes the
  original card purchase from the later card-statement payment. This proves
  expense/liability recognition and settlement are separate, and a later
  payment must not create a second expense.
- Brex states that reimbursements use accrual accounting where supported: the
  approved reimbursement opens a liability and payment closes it. Brex also
  supports entity-specific payment cycles, showing that approval and payment
  cadence may be separated by days or weeks.
- SAP Concur describes submission and approval, extraction to the financial
  system for posting/reimbursement, and optional later payment-status import as
  distinct stages.
- Ramp's international-reimbursement documentation identifies employee-bank,
  receipt/expense, payment, and entity-functional currencies separately. QBO
  likewise stores transaction currency, exchange rate, home amount, and an
  as-of date as separate facts. A Field Account amount therefore cannot be a
  silent current-rate conversion or QBO convenience total.
- Modern Treasury separates pending and posted balances and makes posted ledger
  entries immutable; reversing entries repair a posted result. That aligns with
  D11's append-only close model and the rule that a reservation must transition
  to the one posted effect rather than be subtracted twice.
- Cru publicly describes raised support as covering salary, benefits, training,
  ministry expenses, and organization costs. Reliant's current guidance shows
  that reimbursement treatment can depend on the specific fund/project and
  organizational capacity. Missions practice therefore needs a bounded tenant
  choice, but not per-claim accounting improvisation.

### The decision

> **At what exact point, and from which authoritative occurrence, should each
> approved expense reduce the Finance-confirmed Field Account Balance?**

#### Option A-prime — Always when the organization owes the claimant

At the next D1 close, an exact Approved Expense Snapshot plus an independently
established Reimbursement Obligation and compatible Funding Coverage creates
the Field Account effect.

**Strengths:** conservative capacity; clear for ordinary claimant-paid
reimbursements; independent from slow payroll/AP payment.

**Failure:** it cannot represent organization-card or direct organization-paid
expenses, and it forces accrual-style balance recognition on tenants that
intentionally use cash-style support-balance policy.

#### Option B-prime — Always when external payment is confirmed

No expense affects the Field Account until a qualified External Payment
Occurrence or provider/accounting payment state exists.

**Strengths:** resembles cash-style practice and may have final settlement/FX
evidence.

**Failure:** it overstates capacity while approved obligations wait, couples
Field Account truth to provider availability, incorrectly treats later card-
liability settlement as the expense, and risks making QBO/Xero or a generic
`Paid` state authoritative.

#### Option C-prime — Source-family-specific, tenant-bounded Expense Field Account Effect Recognition — Recommended

Use one prospective, immutable **Expense Field Account Effect Recognition
Profile** for an exact Tenant, Legal Entity, purpose/Field Account, ISO
currency, and bounded certified expense-source family. Provide one calm
recommended setup rather than a per-claim toggle or rules engine:

1. **Claimant-paid reimbursement — guided default
   `obligation_qualified`.** The exact Approved Expense Snapshot,
   independently established Reimbursement Obligation, and compatible Funding
   Coverage qualify one effect at the next D1 close. Approval alone is
   insufficient. Later handoff, provider draft, payment, or accounting cannot
   debit it again.
2. **Claimant-paid cash-style alternative — optional
   `external_payment_qualified`.** A tenant may prospectively select this only
   for an exact bounded source/relationship family. Approval and obligation
   reserve capacity; one exact External Payment Occurrence plus payment-to-
   obligation coverage qualifies the effect. It is never an implicit fallback.
3. **Organization-card or direct organization-paid expense — fixed
   `source_final_and_approved`.** The source-final economic-payer occurrence
   plus exact Approved Expense Snapshot qualifies the effect. Paying the card
   statement or bank liability later cannot debit it again.
4. **Expense advance — D16-exclusive.** D23 does not reinterpret advance
   authorization, issuance, application, residual, or repayment.
5. **Organization Support Cost and noncash realization — D20/D21-exclusive.**
   Their source occurrences cannot fall through a generic expense family.

### Exact amount, currency, and coverage contract

Every qualifying occurrence freezes one immutable **Expense Field Account
Effect Basis** containing the exact approved item/split and source coverage;
economic payer;
Reimbursement Obligation and/or External Payment Occurrence coverage required
by the winning mode; receipt/source, obligation, payment, and Field Account
amounts with their separate ISO currencies; the exact profile version and D1
Support Cycle close; and, whenever currencies differ, externally owned source
and target amounts or exact rate, direction, effective date/instant, rounding,
fee, residual disposition, and provenance.

Phase 21 supplies no live-rate lookup or FX engine. QBO/Xero home amounts,
current rates, staff convenience rates, and provider defaults cannot silently
choose or rewrite the Field Account amount. Missing or conflicting exact
conversion evidence quarantines only the affected positive effect while source
truth and mandatory adverse corrections continue.

One non-reusable **Expense Effect Coverage** conserves each approved economic
amount within one ISO currency. Cross-currency work uses linked source-currency
and Field Account-currency conservation rather than adding unlike currencies:

```text
approved economic amount
= recognized Field Account effect coverage
+ organization-funded or non-Field-Account coverage
+ unresolved or ineligible residual coverage
```

When the effect posts, one new immutable disposition makes the exact overlapping
active Field Account Funding Coverage derive `fulfilled` in the same atomic
commit. Capacity subtracts the reservation before posting and the debit
afterward, never both. Partial qualification uses exact integer minor-unit
coverage. Failure, return, charge reversal, policy correction, or later
conversion difference appends a cause-linked delta or reversal under the
frozen profile; no closed Support Cycle or historical rate is rewritten.

### UX/UI contract

The tenant sees one plain-language setup question per Legal Entity:

> **When should approved expenses be included in support balances?**

- **When finance confirms what the organization owes — Recommended.** “The
  support balance includes the approved reimbursement at the next finance
  close. Payment is tracked separately.”
- **When external payment is confirmed.** “The amount stays reserved and is
  included after exact payment evidence. Use only if your organization manages
  reimbursable expenses on a cash-style basis.”

The organization-card rule is explanatory, not another knob: **Posted
organization-paid charges are included after approval; paying the card bill
later does not include the expense again.** Advanced source-family variants
stay collapsed until relevant and certified. Activation previews representative
expenses, their recognition close, reservation transition, currency evidence,
unmapped sources, exceptions, and before/after statement impact. Profiles are
prospective with exact half-open boundaries; historical effects retain their
original profile.

Clean work requires no new finance action. Purpose-separated detail may
show `Expense approved`, `Organization obligation recorded`, `Support amount
reserved`, `Included in support balance through Aug 31`, `Sent to payroll/AP`,
`Payment confirmed`, and `Posted to accounting` as independently derived
facts. An optional chronological history keeps source labels but is never a
completion stepper. Missionaries see only calm plain-language facts and expandable original
expense versus Field Account amounts when relevant—never recognition-policy
jargon or a claim of ownership, availability, or guaranteed payment.

### Initial adversarial hardening

Every required category has a concern if D23 stays implicit:

| Category                | Concern                                                                       | Permanent prevention                                                            |
| ----------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Brittleness             | One trigger fails across reimbursement, card/direct-pay, and advance sources. | Certified source-family modes with one deterministic winner.                    |
| Technical debt          | Feature code invents incompatible `paid`/`posted` conditionals.               | One named profile, Effect Basis, and coverage contract.                         |
| Edge cases              | Partial/returned payments, fees, rates, and late corrections change amounts.  | Exact minor-unit coverage and append-only deltas/reversals.                     |
| Footguns                | Staff force a debit, edit a rate, or debit again at payment.                  | No per-claim trigger/rate; capability-gated cause-owned recovery.               |
| Tenant safety           | Wrong entity, purpose, account, or currency changes another balance.          | Structurally complete scope, same-scope keys, RLS backstop, write-time reproof. |
| Over-engineering        | A recognition rules engine creates untestable permutations.                   | One default and bounded certified source-family variants only.                  |
| UX/UI friction          | Staff cannot distinguish balance inclusion, payment, and accounting.          | Plain-language setup, independent truth sections, progressive disclosure.       |
| Hidden coupling         | Payroll/AP or QBO/Xero downtime freezes Field Account truth.                  | Phase-owned source occurrences; payment/accounting remain independent.          |
| Failure modes           | Timeout after debit causes retry and double debit.                            | Semantic idempotency, CAS, atomic coverage/effect/outbox commit.                |
| Data integrity          | Reservation and debit both subtract or one claim maps twice.                  | Exact non-overlapping coverage and atomic `active` to `fulfilled`.              |
| Security/privacy        | Receipt/payment detail leaks into balance or statements.                      | PII-minimized effects and purpose-separated protected evidence.                 |
| Scalability/performance | Close scans every claim or live provider.                                     | Cursor-bounded admitted occurrences and tenant-fair indexed work.               |
| Operational burden      | Finance manually chooses every date/rate.                                     | Prospective guided profile and automatic clean-path qualification.              |
| Observability gaps      | A balance discrepancy has no causal trail.                                    | Source-labelled lineage, reason, next action, metrics, evidence.                |
| Dependency/integration  | Provider or FX behavior changes historical balances.                          | Immutable externally owned evidence; no live close dependency.                  |
| Migration/upgrade       | A profile change rewrites history.                                            | Immutable versions and exact prospective cutover boundaries.                    |
| Other hazards           | Close, payment, correction, and retry race.                                   | Deterministic locks, uniqueness, CAS, event-order proof.                        |

### Why this decision is next

The independent gap audit also found a genuine later decision about spouses,
teammates, or assistants preparing actual expense claims using their own
identities. That collaboration seam is important, but it does not decide a
Field Account amount. D23 must first prevent two conforming implementations
from producing different Finance-confirmed balances; the bounded collaboration
question remains queued for the next one-at-a-time grill turn.

### Primary sources

- [Ramp — Syncing reimbursements to accounting](https://support.ramp.com/syncing-reimbursements-to-accounting)
- [Ramp — QuickBooks Online overview](https://support.ramp.com/quickbooks-online-overview/)
- [Ramp — Syncing international reimbursements](https://support.ramp.com/syncing-international-reimbursements/)
- [Brex — Expense reimbursements](https://www.brex.com/support/expense-reimbursements)
- [SAP Concur — Workflow basics](https://help.sap.com/docs/CONCUR_EXPENSE/bb83754b1c5541808d50c09901e11475/084979eed00d4b79a3fcf8851ff46bbb.html?locale=en-US&state=PRODUCTION&version=2026_02)
- [QuickBooks Online — Manage multiple currencies](https://developer.intuit.com/app/developer/qbo/docs/workflows/manage-multiple-currencies)
- [Modern Treasury — Transaction status and balances](https://docs.moderntreasury.com/ledgers/docs/transaction-status-and-balances)
- [Cru — Supported-staff salary and benefits](https://www.cru.org/us/en/opportunities/careers/supported-staff/salary-and-benefits.html)
- [Reliant — Reimbursement and Expense Recovery Bonus Standard](https://solomon.reliant.org/display/public/RER/Reimbursement%2Band%2BExpense%2BRecovery%2BBonus%2BStandard)

### Founder selection before adversarial hardening

**Which rule should Phase 21 use for ordinary expenses?**

- **Option A-prime:** always recognize the Field Account effect when the
  organization owes the claimant.
- **Option B-prime:** always recognize it only when external payment is
  confirmed.
- **Option C-prime — Recommended:** use source-family-specific, tenant-bounded
  recognition: obligation-qualified by default for claimant reimbursement, one
  prospective payment-qualified alternative for intentional cash-style
  tenants, source-final-and-approved for organization-paid/card expenses, and
  D16-exclusive advance handling—with exact reservation-to-effect coverage,
  immutable external currency evidence, append-only correction, and independent
  payment/accounting truth.

The founder selected **Option C-prime — Source-family-specific, tenant-bounded
Expense Field Account Effect Recognition**, requested the complete adversarial
review below, and then ratified its hardened C-prime-R result as D23.

### Adversarial verdict

Option C-prime survives, but only as an operational support-balance inclusion
contract. It must never be called or treated as GAAP expense recognition, tax
classification, accounts payable, reimbursement payment, bank reconciliation,
or QBO/Xero posting. FASB's Codification, not an Asym setting, is authoritative
GAAP; IRS accountable-plan treatment depends on business connection,
substantiation, and return of excess rather than on a balance-timing choice.
Ramp, Brex, SAP Concur, QBO, and Xero likewise preserve separate approval,
obligation, source-final transaction, payment, and accounting occurrences.

The permanent shape is one small closed catalog of certified source families,
one deterministic owner, one prospective immutable profile, exact approved and
funding coverage, one non-reusable effect coverage, and authority-specific
append-only correction. It is not a rules engine and adds no action to the clean
expense path.

### Binding hardening

#### Closed source-family authority

| Source family                                     | Exact qualifying facts                                                                                                                                    | Facts that never qualify alone                                                               |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Claimant-paid reimbursement — guided default      | Exact Approved Expense Snapshot coverage + independently established Reimbursement Obligation + compatible Field Account Funding Coverage                 | Submission, approval alone, handoff, provider draft, QBO/Xero bill, or generic `Paid`        |
| Claimant-paid reimbursement — bounded alternative | Exact approved and obligation coverage + exact External Payment Occurrence and payment-to-obligation coverage + compatible Field Account Funding Coverage | Attempted, initiated, ambiguous, returned, or staff-assumed payment                          |
| Organization card                                 | Source-final cleared issuer charge + exact approved organization-paid coverage                                                                            | Pending authorization, receipt alone, card assignment, or later statement payment            |
| Organization cash/debit/direct payment            | Exact executed economic-payer occurrence + exact approved organization-paid coverage                                                                      | Instruction, exported file, bank match, or accounting record without source execution        |
| Certified organization payable                    | Exact source-owned present obligation + exact approved organization-paid coverage, only through a certified source adapter                                | Purchase request/order, unapproved invoice, or QBO/Xero existence as Field Account authority |
| Expense advance                                   | D16 exclusively                                                                                                                                           | D23 reinterpretation of authorization, issue, application, return, or residual               |
| Organization Support Cost / noncash realization   | D20 / D21 exclusively                                                                                                                                     | Generic-expense fallback                                                                     |
| Taxable expense recovery or compensation          | D4 exclusively after exact source-owned ownership succession                                                                                              | Late payroll routing or a label alone                                                        |

Unknown, overlapping, or capability-drifted families fail closed for only the
affected positive work and open one cause-owned exception. Mandatory adverse
corrections remain live. An organization-card personal/nonbusiness slice does
not qualify merely because it was imported, and AI/OCR/matching suggestions
never establish approval, source finality, ownership, amount, or effect.

#### Deterministic prospective profile and amount authority

The tenant receives one guided claimant-reimbursement choice: include exact
covered expenses when finance confirms what the organization owes
(recommended), or after exact external payment is confirmed for one bounded
prospective source family. Organization-card and direct organization-paid
treatment is fixed explanatory behavior, not another knob. Advanced variants
appear only when a certified source actually exists.

Exactly one winning immutable profile resolves and freezes on the exact
Approved Expense Snapshot-rooted **Expense Settlement Determination** coverage.
A successor applies only after an exact half-open boundary. There is no
per-claim timing choice, retroactive recalculation, creation-order tie-break, or
implicit fallback. The new record is **Expense Field Account Effect Basis**,
not another `Expense Settlement Basis`; it pins the source family and version,
winning profile, qualifying source occurrence, exact approved and funding
coverage, Field Account amount/currency authority, candidate Support Cycle, and
correction lineage.

Conservation is proved separately in each currency. When source and Field
Account currencies differ, the contract uses two linked equations rather than
adding unlike currencies:

```text
approved source-currency slice
= source-currency dispositions + conversion-source coverage

exact Field Account-currency target
= Field Account effect coverage
+ organization-funded or non-Field-Account target disposition
+ exact target residual coverage
```

All arithmetic uses checked integer minor units in one ISO currency per row.
A short Field Account never creates `min(obligation, balance)` as an automatic
partial effect and never reduces the independently live Reimbursement
Obligation. Partial treatment exists only after the source owner establishes
exact non-overlapping partial obligation/payment/organization-funded and
residual dispositions; otherwise the whole candidate waits.

Receipt/source, approved, obligation, payment, entity-functional, and Field
Account amounts and currencies stay separate. Conversion evidence freezes
source and target amounts, ISO codes, rate and direction, effective instant,
rounding, fee, residual, provenance, and evidence strength. No live/current
rate, staff convenience rate, QBO `HomeTotalAmt`, or Xero convenience total may
substitute. Missing or conflicting evidence quarantines only affected positive
work.

The exact active Field Account Funding Coverage derives `active -> fulfilled`
from a new immutable disposition written in the same serializable/CAS-guarded
transaction that appends the effect and transactional outbox record; the
original coverage row is not rewritten. Capacity subtracts the reservation
before that commit and the expense effect afterward, never both. D22 prospective
coverage must first be atomically reclassified into or fulfilled by actual
D10/D16 coverage; it cannot remain as a second capacity-bearing reservation.

#### Independent dates and cause-owned correction

Preserve source-incurred/effective, approval, obligation-effective,
payment-effective, effect-qualification-recorded, D1 Support Cycle/through,
Phase 20 accounting-effective, and provider-posting dates independently.

| Original mode                        | Later occurrence                                                                         | Required result                                                                  |
| ------------------------------------ | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Obligation-qualified reimbursement   | Payment fails or returns while obligation remains                                        | No Field Account reversal; payment truth changes independently                   |
| Obligation-qualified reimbursement   | Source owner reduces or cancels the obligation                                           | Exact cause-linked correction in a later permitted close                         |
| Payment-qualified reimbursement      | Exact qualified payment returns or reverses                                              | Exact reversal of only returned payment coverage; obligation remains independent |
| Payment-qualified reimbursement      | Attempt fails before any qualified payment                                               | Nothing is reversed because no effect existed                                    |
| Organization card/direct pay         | Merchant/source refund, void, adjustment, or conversion delta                            | Exact append-only linked credit/debit coverage; original remains immutable       |
| Any expense                          | Card statement payment, claimant repayment, bank match, accounting edit, or task closure | Never creates or reverses a D23 effect by inference                              |
| Expense becomes taxable compensation | Source-authorized ownership succession                                                   | One conserving ownership transfer; never both D23 and D4                         |

Closed cycles and statements never mutate. Late corrections enter the next
permitted D1 close with source-effective, discovery, Field Account effective,
close, payment, and accounting dates preserved.

#### Tenant safety and concurrency

Every record, foreign key, query, job, cache key, idempotency key, outbox event,
export, notification, evidence link, and metric preserves its complete Tenant,
Legal Entity, Support Assignment, purpose, Field Account, ISO currency, source
family, claim/snapshot version, profile version, source occurrence, and exact
coverage scope.

- Raw financial tables are server-only and revoked from `anon` and
  `authenticated`; forced coarse RLS remains a fail-closed backstop. Purpose-
  minimized projections pass through the Phase 12 PDP, which re-proves current
  participant/capability membership. Any exposed projection policy uses both
  `USING` and `WITH CHECK` plus indexed predicates. Authentication is not
  authorization, and relationship labels do not become RLS policy.
- The privileged multi-record mutation remains server-command owned and
  revalidates current actor and scope immediately before commit. It does not
  trust client tenant IDs, stale JWT metadata, or service-role reach as policy.
- A stable semantic effect identity includes Tenant, Legal Entity, Field
  Account, purpose, ISO currency, immutable source occurrence/version, approved
  coverage-slice identity, and effect family. It deliberately excludes retry/
  job IDs, selected Support Cycle, mutable status, and profile version, so a
  profile successor or next-cycle retry cannot post the same slice again. The
  frozen profile remains evidence on the Effect Basis, not part of economic
  uniqueness; a provider ID alone is insufficient.
- Deterministic smallest-scope lock order plus per-account version CAS or
  Serializable semantics protect the atomic effect/coverage/outbox write.
  Multi-account splits lock in canonical order. Retry only a bounded pure
  transaction after a serialization failure; inspect an ambiguous network
  result by semantic identity before retry.
- D1 close consumes pre-admitted normalized facts through bounded cursors and
  never calls a payment provider, FX source, QBO, or Xero.

#### Quiet UX and operational contract

The setup asks one question under **Settings → Expenses → Support-balance
timing**. Before **Activate for future expenses**, the tenant sees the exact
Tenant/Legal Entity, first half-open boundary, affected families/currencies,
representative claimant/card/refund examples, reservation transitions,
uncovered/conflicting sources, and this warning:

> This changes future support-balance timing. It does not approve, reimburse,
> pay, or post expenses to accounting.

Clean work adds zero clicks. There is no `Include`, `Post`, `Sync`, `Retry`,
`Mark paid`, editable rate, or editable effective-date action. One deduplicated
cause-owned exception surface shows a plain reason, affected count,
same-currency total, owner, and one next action. Automatic waits say **No action
needed — we will check again**.

The UI never uses one completion stepper. It keeps **Expense review**, **Support
balance**, **Reimbursement** when applicable, and staff-only **Accounting** as
independent sections. The missionary dashboard stays balance-first; a settled
row says **Support balance includes this expense: −USD 124.50 · through Aug
31**. It never implies worker ownership, withdrawal, availability, guaranteed
reimbursement, payment, or accounting completion. Organization-paid expenses
omit reimbursement progress. Merchant, location, receipt, claimant, provider,
bank, tax, and private-comment detail requires separate D10/D19/D15 authority.

### Ruthless adversarial matrix

| Category                          | Concern? | What could go wrong                                                                                                                                             | Why it matters                                                     | Severity | Likelihood  | Permanent prevention                                                                                                 |
| --------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | -------- | ----------- | -------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | Yes      | One generic `approved`, `paid`, or `posted` trigger breaks across claimant, card, direct-pay, payable, advance, refund, and taxable succession.                 | Two conforming implementations produce different balances.         | Critical | High        | Closed certified source catalog, one deterministic winner, unsupported state, frozen profile.                        |
| Technical debt                    | Yes      | Local conditionals duplicate D16/D20 and provider vocabulary becomes domain truth.                                                                              | Integrations and migrations become contradictory and expensive.    | Critical | High        | Reuse Expense Settlement Determination; one Effect Basis/Profile/Coverage contract.                                  |
| Edge cases                        | Yes      | Partial funding/payment/refund, grouped payments, tips, personal splits, departures, FX deltas, currency precision, and late reclassification misstate support. | These are normal financial events.                                 | Critical | High        | Exact source partitions/residuals, immutable dates, checked minor units, ownership succession, append-only deltas.   |
| Footguns                          | Yes      | Staff force a debit, use live FX, treat QBO as proof, retry an ambiguous commit, or debit again at settlement.                                                  | One click can corrupt a closed projection.                         | Critical | Medium-high | No per-claim trigger/rate/date/retry; automatic idempotent effect and source-owned recovery.                         |
| Tenant safety                     | Yes      | Wrong tenant/entity/assignment/purpose/account/currency scope changes or exposes another financial position.                                                    | Cross-tenant financial leakage/corruption.                         | Critical | Medium      | Composite structural scope, fail-closed RLS, server reauthorization, negative substitution tests.                    |
| Over-engineering                  | Yes      | A DSL, tax/AP engine, or per-claim mode recreates accounting/expense software.                                                                                  | Setup becomes untestable and confusing.                            | High     | High        | One guided choice, fixed card/direct rule, finite certified advanced variants.                                       |
| UX/UI and user friction           | Yes      | Accounting jargon and a linear stepper conflate approved, owed, included, paid, and posted.                                                                     | Staff act incorrectly and missionaries infer availability/payment. | High     | High        | Controlled copy, independent sections, signed ISO amount + through date, zero clean-path action.                     |
| Hidden coupling                   | Yes      | Payroll/AP, providers, card statement, bank match, QBO, or Xero freeze or rewrite Field Account truth.                                                          | An external outage makes a valid balance appear wrong.             | Critical | High        | Source-owned occurrences, provider-independent close, Phase 20-only accounting.                                      |
| Failure modes                     | Yes      | Commit succeeds but response times out; retry duplicates the effect; reservation/debit partially commit.                                                        | Capacity and balance can be double-reduced.                        | Critical | Medium-high | Semantic idempotency, unique coverage, atomic effect/coverage/outbox, CAS, inspect-before-retry.                     |
| Data integrity risks              | Yes      | Overlap, auto-partials, floating-point FX, mutable profiles, or dual D4/D23 ownership break conservation.                                                       | Balances and statements no longer tie to source truth.             | Critical | High        | Integer conservation, database constraints, immutable versions, exact ownership transfer, property tests.            |
| Security and privacy risks        | Yes      | Receipt, merchant/location, bank, tax, or provider detail leaks to balance-only participants or logs.                                                           | Sensitive financial/travel data escapes purpose authority.         | Critical | Medium-high | PII-minimized effect, separate evidence capabilities, current-authority retrieval, safe telemetry.                   |
| Scalability and performance risks | Yes      | Close scans all claims/calls providers; one tenant monopolizes capacity; dashboard joins every lane live.                                                       | Month-end becomes slow, unfair, and inconsistent.                  | High     | Medium-high | Prequalified bounded candidates, indexed projections, no live dependencies, tenant-fair load certification.          |
| Operational burden                | Yes      | Finance chooses every timing/rate/correction or gets one alert per provider failure.                                                                            | D23 adds bureaucracy and month-end fatigue.                        | High     | High        | Automatic clean path, one prospective setup, grouped cause cases, sparse digest alerts.                              |
| Observability gaps                | Yes      | Staff cannot explain a balance change while raw telemetry leaks PII.                                                                                            | Discrepancies become unsafe manual fixes.                          | High     | High        | Source/effect lineage, reason codes, profile/close/currency/coverage, safe metrics and governed support evidence.    |
| Dependency and integration risks  | Yes      | Provider finality, payment, FX, or API semantics drift.                                                                                                         | Silent drift changes timing or amount.                             | Critical | Medium-high | Capability/version certification, immutable evidence, affected-positive quarantine, adverse continuity.              |
| Migration and upgrade risks       | Yes      | Activation replays history or reroutes in-flight claims; old clients misread states.                                                                            | Statements change and tenants receive surprise movements.          | Critical | Medium-high | Prospective half-open cutover, frozen profiles, shadow preview, no replay, safe unknown states.                      |
| Other development hazards         | Yes      | Close/profile/payment/refund races, timezone fences, overflow, stale roles, optimistic UI, or rollback corrupt truth.                                           | Rare concurrency errors are financially material.                  | Critical | High        | Deterministic locks, checked arithmetic, exact boundary, server-confirmed UI, fault/property/RLS tests, kill switch. |

### Required release proof

1. Source-owner contract tests prove exactly one owner and fail closed for
   unknown, overlap, drift, or missing evidence.
2. Property tests prove exact per-currency conservation, non-overlap, no
   negative Field Account, and no reservation-plus-effect double subtraction.
3. Event-order and fault tests cover duplicate/reordered approval, obligation,
   payment, refund, correction, activation, close, timeout-after-commit, and
   serialization retry.
4. Scenario tests cover whole and source-authorized partial reimbursements,
   grouped/partial payment-qualified work, pending/cleared/refunded card,
   direct organization pay, taxable D4 succession, D16/D20/D21 exclusivity,
   departures, and post-close correction.
5. Currency tests cover zero-, two-, and three-decimal currencies; every source/
   obligation/payment/Field Account/entity currency combination; rate direction;
   rounding; fee; residual; late delta; and overflow.
6. QBO/Xero boundary tests prove bills, payments, home amounts, posting dates,
   drift, and bank reconciliation cannot qualify or rewrite D23.
7. RLS tests substitute every scope component and cover stale membership, role
   loss, list/detail/export/notification/evidence, and existence leakage.
8. Accessibility/comprehension tests prove staff and missionaries distinguish
   approval, balance inclusion, obligation, payment, and accounting without
   inferring availability. Test keyboard, screen reader, focus, 320 px reflow,
   200%/400% zoom, contrast, RTL, localization, and signed currencies.
9. Production-shaped tests prove bounded close work, tenant-fair capacity,
   provider-outage continuity, exception deduplication, and zero added clean-
   path clicks.

### Ruthless synthesis

1. Ratify the operational-only boundary and exclusive source-owner table before
   schema or UI work.
2. Freeze conservation, exact amount/FX authority, atomic reservation
   fulfillment, no capacity-created partials, and authority-specific correction.
3. Freeze complete scope, database constraints/RLS, server reproof,
   idempotency, Serializable/CAS commit, and bounded close admission.
4. Freeze one prospective timing choice, exact activation preview, zero clean-
   path action, independent truth sections, and signed through-dated copy.
5. Certify only supported source families; activate at the next complete D11-
   manifested Support Cycle boundary and captured ingestion cursor after every
   in-flight slice has one disposition. Shadow-reconcile, contain drift,
   preserve manual continuity, and use D17 for initial adoption rather than
   replaying history.
6. Make conservation, ordering, RLS, FX, correction, accessibility,
   comprehension, load, and recovery proof release gates.

### C-prime-amended-and-hardened (C-prime-R) ratified as D23

> **C-prime-amended-and-hardened (C-prime-R) — one immutable, prospective,
> Tenant-, Legal-Entity-, purpose-, Field-Account-, ISO-currency-, and certified
> source-family-scoped Expense Field Account Effect Recognition Profile,
> presented only as support-balance inclusion timing and never as GAAP, tax,
> accounts-payable, reimbursement-payment, or QBO/Xero policy; with claimant-
> paid reimbursement guided by independently established Reimbursement
> Obligation plus exact compatible Field Account Funding Coverage and one
> bounded prospective exact-payment alternative; organization-card effects
> qualified only by source-final cleared charge plus exact approval;
> organization cash/debit/direct-payment effects qualified only by exact
> executed economic-payer occurrence; and certified organization-payable
> effects qualified only by a separately source-owned present obligation—while
> D16 advances, D20 Organization Support Costs, D21 noncash realization, and D4
> taxable-compensation succession remain exclusive owners; resolving and
> freezing exactly one profile on D16's existing Approved-Expense-Snapshot-
> rooted Expense Settlement Determination; creating one PII-minimized immutable
> Expense Field Account Effect Basis and non-reusable exact Effect Coverage that
> conserves approved integer minor-unit coverage without capacity-created
> partials; atomically appends immutable dispositions so only one exact slice
> bears capacity; pins source-family-specific Field Account amount authority and
> exact externally owned multi-currency evidence; preserves incurred, approval,
> obligation, qualification, close, payment, accounting-effective, and provider-
> posting dates independently; applying refunds, returns, conversion
> differences, reclassifications, failures, and corrections only through
> source- and cause-linked append-only deltas or exact ownership succession in a
> later permitted Support Cycle; enforcing complete tenant/entity/assignment/
> purpose/account/currency scope through composite same-scope keys, server-only
> canonical truth, forced coarse RLS, Phase 12 PDP current-authority reproof, a
> stable source-slice semantic identity independent of retry, profile, and
> Support Cycle; uses CAS/Serializable atomic effect-coverage-outbox commits,
> bounded pre-admitted close work, and ambiguity-safe inspect-before-retry
> recovery; and exposes one quiet accessible guided
> prospective setup, source-labelled independent truth sections, signed ISO-
> currency and through-dated missionary activity, zero clean-path staff actions,
> and one root-cause-deduplicated exception-first finance surface—without per-
> claim timing or FX overrides, generic `paid`/`posted` authority, implicit
> partial funding, capacity-created or discretionary deficits, double
> subtraction, card-statement
> or claimant-repayment inference, live provider/FX dependency, historical
> recomputation, QBO/Xero authority over Field Account truth, linear completion
> steppers, or any claim that inclusion proves availability, reimbursement,
> payment, accounting posting, or reconciliation; mandatory source-owned
> adverse corrections still append fully and may expose a visible D11
> deficit.**

### Ratification

The founder ratified the hardened C-prime-R above as **Phase 21 D23** on
2026-08-01. The decision log, glossary, ADR-0112, roadmap, and affected
cross-phase authority and rejection contracts preserve this ruling. The next
founder decision continues separately and does not reopen D1-D23.

### Post-ratification cross-phase precision audit

The required congruency and adversarial pass preserved D23 and made these
implementation consequences explicit without reopening the founder choice:

- D16's Expense Settlement Determination roots claimant-reimbursable slices
  only; organization-card, direct organization payment, and certified-payable
  families root directly in exact D10/D13 approved economic-payer coverage and
  their certified source occurrence, with the D23 Effect Basis as the common
  seam;
- a payment-qualified return atomically reverses the effect and restores a
  successor reservation whenever the Reimbursement Obligation remains live;
- initial activation uses D17's complete no-gap/no-overlap Opening Coverage
  Manifest and exact half-open source-family boundary; later profile
  replacement uses a complete D11 close boundary, captured cursor, and in-
  flight disposition manifest;
- economic identity excludes observation and adapter/import revisions; D23 and
  Phase 20 use separate coverage namespaces; D4 ownership succession is
  atomic; and a certified payable remains absent until a non-accounting source
  contract is actually certified; and
- D9/D12/D19 publication, D5/D6 lifecycle/currency retirement, D22-to-actual
  coverage transition, late-first qualification, and cause-owned case repair
  remain independently authoritative.

These controls prevent synthetic D16 records, temporarily freed committed
capacity, duplicate roots, adoption gaps/overlap, D4/D23 double ownership,
evidence leakage, and QBO/Xero back-propagation. They are binding precision
riders in the D23 decision log and ADR-0112.

## D24 decision research — Own-identity expense collaboration

**Status:** ratified as Phase 21 D24 on 2026-08-02 after founder selection and
deep adversarial hardening. D1-D23 remain binding and unchanged.

### Decision to resolve

When the expense claimant and the person helping prepare or submit an actual
D10 Expense Claim are different people, exactly what may the helper do, whose
assertion is submitted, and how is access granted and revoked without account
sharing, impersonation, or spouse/team-derived permission?

This is an ordinary missions workflow. Jordan incurs a ministry expense while
travelling. Alex—Jordan's spouse, teammate, or ministry assistant—uploads the
receipt and completes a draft before the tenant deadline. Jordan must remain
the claimant and economic-payer source; Alex must remain the preparer and
actual actor; submission and claimant assertion must remain explicit; and an
independent D13 reviewer must still approve. Alex must not inherit unrelated
receipts, support balances, supporter data, compensation, bank/payee detail, or
settings.

D10 records claimant and submitter but does not yet define non-claimant draft
authority. D19 expressly says spouse/team participation grants no access or
operational authority. D22 separates prepare and submit for prospective
requests, but not actual D10 claims. This therefore needs a founder contract
rather than route-by-route implementation guesses.

### Current product and security evidence

- SAP Concur separates `Can Prepare`, `Can Submit Reports`, and `Can View
Receipts`, supports prepare-without-submit, and audits the delegate actor.
- Ramp assistants can help specifically assigned users under their own actor
  identity, but Ramp's broader card/balance visibility is unnecessary and too
  permissive for Asym's missionary context.
- Expensify Copilot validates own credentials and visible on-behalf attribution,
  while its account-wide proxy model shows why Asym needs a narrower resource-
  and-operation-scoped grant.
- Brex receipt intake can create a draft without treating email, OCR, or a match
  as submission authority.
- Reliant provides missions-specific support for authenticated claimant
  attestation, but not for helper-authored consent.
- OWASP, Supabase, and PostgreSQL guidance support deny-by-default request-time
  authorization, explicit audit, forced coarse RLS only as a backstop, and
  dedicated negative authorization tests.

### Options

#### Option A — Claimant-only preparation and submission

Only the claimant may upload or view evidence, create/edit claims, confirm
facts, and submit.

This is the smallest authorization surface, but it breaks normal spouse,
teammate, assistant, accessibility, travel, intermittent-connectivity, and
month-end preparation workflows. It also creates pressure to share passwords.

#### Option B — Broad account-level proxy access

A claimant or administrator lets a helper act as the claimant across most
expense/account functions.

This is initially familiar, but it exposes unrelated data, encourages context
mistakes and capability creep, conflates relationship with authority, cannot
safely preserve prepare-without-submit, and duplicates or bypasses Phase 12.
Reject this option.

#### Option C-prime — Bounded own-identity Expense Collaboration Assignments — recommended

One optional, Tenant-controlled **Expense Collaboration Assignment Version**
binds one claimant Party to one helper Party and authenticated principal for an
exact Legal Entity, Expense Program, bounded purpose/claim-family scope, finite
operation set, evidence-classification ceiling, and half-open interval. Every
actor uses their own login. The ordinary preset is **Prepare drafts**. A
separately enabled advanced operation may submit only an unchanged current
Claim Version already covered by exact authenticated claimant confirmation or
a tenant-admitted claimant-authored external attestation.

The assignment records responsibility and provenance but grants nothing by
itself; Phase 12 reauthorizes every read and command. It is not Support
Assignment membership, marriage/team relationship, a broad role, D13 reviewer
delegation, payee/payment authority, or impersonation.

### Recommended C-prime contract

1. The capability is Tenant- and Legal-Entity-off by default. Off means no
   setting, queue, count, notification, empty state, report field, or API
   enumeration.
2. An enabled tenant chooses **Staff manages helpers** (recommended),
   **Claimants may choose helpers**, or **Both**. This decides who may create or
   end an assignment, never what it authorizes.
3. The **Prepare drafts** preset permits only minimum classified evidence
   intake/read, create/edit of non-submitted draft facts for the named claimant,
   and **Ready for claimant review**.
4. **Submit work you already confirmed** is separately enabled and can submit
   only the exact unchanged version covered by immutable claimant confirmation
   or a versioned tenant-admitted claimant-authored attestation. Material edits
   stale the confirmation. Silence is never consent.
5. Claimant, economic payer, preparer, submitter, confirmer/attestor, reviewer/
   approver, payee, and actual principal remain separate facts. A helper never
   overwrites authorship, selects the approval route, approves, marks paid,
   changes bank/payee data, creates an obligation/effect, or delivers
   accounting.
6. Evidence intake never infers claimant or authority from sender address,
   alias, subject, OCR, merchant/date/amount similarity, or model confidence.
   Ambiguous evidence remains private and explicitly linked by an authorized
   actor.
7. The helper sees a persistent **Helping Jordan with expenses** context, an
   assignment-scoped switcher, and **Prepared by Alex for Jordan** attribution;
   the ordinary last action is **Ready for Jordan to review**. This never
   switches the whole application identity.
8. Every list, detail, upload finalization, evidence URL, mutation,
   confirmation, submission, export, notification, and repair re-proves exact
   actor, Tenant, Legal Entity, claimant, purpose, operation, evidence ceiling,
   collaboration version, Phase 12 authority, and governance epoch.
9. Revocation is deny-first and non-transitive. It fences writes, invalidates
   caches and signed URLs, and suppresses queued notifications before the
   visible successor completes. Two helpers or a helper/claimant use current-
   version CAS rather than last-write-wins.
10. Offline/mobile draft input may be resumable but non-authoritative.
    Confirmation, assignment changes, and submission are online committed
    actions. Local state, notification delivery, and byte upload never become
    financial truth.

### Initial adversarial check

| Category                      | Concern? | Severity | Likelihood  | Permanent control                                                                                                               |
| ----------------------------- | -------- | -------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                   | Yes      | Critical | High        | Immutable exact Party/principal/scope versions, half-open intervals, request-time authority, append-only succession.            |
| Technical debt                | Yes      | Critical | High        | One finite operation catalog and one Phase 12 PDP path across upload, draft, submit, notification, export, and support tools.   |
| Edge cases                    | Yes      | Critical | High        | Distinct actors, no-login attestation seam, version pinning/CAS, conflict checks, succession, and reassignment.                 |
| Footguns                      | Yes      | Critical | High        | Prepare-only default; no `Full access`, impersonation, relation inference, or helper-created consent.                           |
| Tenant safety                 | Yes      | Critical | Medium-high | Complete same-scope keys/FKs, forced coarse RLS, request-time PDP, epochs, opaque IDs, and negative substitution tests.         |
| Over-engineering              | Yes      | High     | Medium-high | One assignment type, two guided presets, finite code-owned operations, and no delegation graph/DSL.                             |
| UX/UI friction                | Yes      | High     | High        | Quiet off state, persistent helping context, one claimant review task, progressive disclosure, and usability proof.             |
| Hidden coupling               | Yes      | Critical | High        | Keep D19 participation, D13 review delegation, evidence intake, Phase 12 grants, and D15 payee/payment truth separate.          |
| Failure modes                 | Yes      | Critical | High        | Local atomic boundaries, outbox recovery, CAS, deny-first revocation, no partial submission, and cause-owned recovery.          |
| Data integrity risks          | Yes      | Critical | High        | Immutable versions, exact confirmation/submission pinning, semantic idempotency, and unique evidence/claim coverage.            |
| Security and privacy risks    | Yes      | Critical | High        | Evidence ceilings, minimum linked evidence, short-lived protected retrieval, access audit, and no public bytes.                 |
| Scalability/performance risks | Yes      | High     | Medium-high | Indexed server-side resolution, keyset queues, bounded batch orchestration, and no JWT grant arrays.                            |
| Operational burden            | Yes      | High     | High        | Previewed batch setup producing exact independently revocable versions plus expiry/reassignment coverage.                       |
| Observability gaps            | Yes      | High     | High        | Independent safe actor/reason/age/next-action states with protected audit drill-down and no private telemetry.                  |
| Dependency/integration risks  | Yes      | High     | Medium-high | Capability-certified email/storage/scan adapters, immutable provenance, manual continuity, and no provider result as authority. |
| Migration/upgrade risks       | Yes      | High     | Medium      | Prospective explicit mapping of legacy delegate flags, quarantine of ambiguity, and no permissive fallback.                     |
| Other development hazards     | Yes      | Critical | High        | Atomic CAS, semantic idempotency, restrictive PDP/RLS, inspect-before-retry, kill switches, and concurrency/security proof.     |

### Required proof before shipping

- Test every operation independently, including prepare without submit,
  submission denial without exact confirmation, evidence ceilings, no
  transitive authority, and no relationship-derived access.
- Prove all actor roles stay distinct and a helper cannot satisfy an
  independent D13 review step.
- Run real PostgreSQL/RLS/API substitution tests across every Tenant, Legal
  Entity, claimant, purpose, evidence, background-job, export, support, and
  service-role path.
- Race revocation, principal disablement, evidence URL use, upload finalization,
  draft save, claimant confirmation, material edit, and submission in all
  meaningful orders.
- Prove email/receipt intake handles spoofing, forwarding, aliases, duplicates,
  ambiguity, malware, unsupported files, quarantine, and revoked helpers
  without selecting or exposing another claimant.
- Prove helper/claimant departure, spouse separation, Party merge, Legal Entity
  change, Support Assignment succession, classification change, and tenant
  deactivation preserve history and remove stale access.
- Prove centralized-assistant month-end load, keyset queues, bounded batch
  setup, protected evidence access, and notification fan-out remain tenant-
  fair.
- Test WCAG 2.2 AA and comprehension so users always know who is helping whom,
  whose facts are asserted, what needs confirmation, and what remains
  unapproved/unpaid.
- Prove collaboration creates no approval, Reimbursement Obligation, Field
  Account effect, external payment, payroll fact, Accounting Release, or
  QBO/Xero fact.

### Initial C-prime-R formulation

> **C-prime-amended-and-hardened (C-prime-R) — one optional, Tenant-controlled,
> own-identity Expense Collaboration Assignment Version for one exact Tenant,
> Legal Entity, claimant Party, helper Party and principal, Expense Program and
> bounded purpose/claim-family scope, finite code-owned operation set,
> evidence-classification ceiling, and half-open interval; independently absent
> unless enabled under one staff-managed, claimant-managed, or combined
> posture; with one quiet prepare-only default and one separately enabled
> proof-gated submission capability limited to an unchanged current Claim
> Version already covered by immutable authenticated claimant confirmation or
> versioned tenant-admitted claimant-authored external attestation; separately
> preserved claimant, economic payer, preparer, submitter, confirmer, reviewer,
> approver, payee, and actor truth; minimum private evidence access, persistent
> scoped “Helping with expenses” context, current Phase 12 request-time
> authorization on every read and command, non-transitive deny-first
> revocation, semantic idempotency, current-version CAS, immutable action
> provenance, and append-only recovery—without shared credentials, whole-
> account impersonation, membership-, spouse-, team-, manager-, email-, OCR-,
> or match-derived authority, helper-created claimant consent, broad financial
> visibility, helper-selected review, self-approval, transitive delegation,
> payment or accounting authority, or any reopening of D1-D23.**

### Founder selection

The founder selected Option C-prime: the bounded own-identity Expense
Collaboration Assignment with a prepare-only default and proof-gated submission
of an unchanged claimant-confirmed version. The selection remained subject to
the deep adversarial hardening below before final ratification.

### D24 primary sources

- [SAP Concur — Delegates overview](https://help.sap.com/docs/CONCUR_EXPENSE/cd24ad794821491e8f65f76f61dffcc6/0dd6c08b897647f28d645a40c3a16b69.html)
- [SAP Concur — Add Expense Delegate](https://help.sap.com/docs/CONCUR_EXPENSE/cd24ad794821491e8f65f76f61dffcc6/c42ba7f351c310159a18b9e6d3599f3a.html?locale=en-US&state=PRODUCTION&version=2026_01)
- [Ramp — Assistant role](https://support.ramp.com/user-role-deep-dive-assistant)
- [Ramp — User roles](https://support.ramp.com/user-roles-overview)
- [Expensify — Act as a Copilot](https://help.expensify.com/articles/expensify-classic/copilots-and-delegates/Act-as-a-Copilot)
- [Expensify — Manage Copilot access](https://help.expensify.com/articles/new-expensify/settings/Manage-Copilot-Access)
- [Brex — Expense reimbursements](https://www.brex.com/support/expense-reimbursements)
- [Brex — Receipts for expenses](https://www.brex.com/support/receipts-for-expenses)
- [Reliant — Expense submission](https://solomon.reliant.org/pages/releaseview.action?pageId=189959293)
- [Reliant — Electronic signature](https://solomon.reliant.org/display/public/employman/Electronic%2BSignature)
- [OWASP — Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [PostgreSQL — Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [W3C — WCAG 2.2](https://www.w3.org/TR/WCAG22/)

### Founder-selected C-prime deep adversarial hardening (2026-08-01)

The founder selected **Own-identity, claim-bounded expense collaboration** and
requested a deep ruthless review before ratification. The review included the
current Phase 12 authorization foundation, D10/D13/D19/D22/D23 boundaries,
current repository tests and data-access patterns, current SAP Concur, Ramp,
Expensify, Brex, Reliant, OWASP, Supabase Storage/RLS, PostgreSQL row-security,
and WCAG 2.2 guidance. The direction is correct, but the earlier candidate is
not safe enough without the riders below.

#### Final hardening findings

1. An **Expense Collaboration Assignment Version** is a versioned
   responsibility, scope, and provenance envelope. It is not an ACL and never
   grants access by itself. Phase 12 remains the sole request-time Policy
   Decision Point (PDP). Every browser, server, background-job, support,
   notification, export, and evidence-delivery operation must intersect the
   current Phase 12 decision with the current assignment, claim state,
   evidence classification, identity binding, and governance epoch.
2. Every active assignment is bound to one stable exact Expense Claim, one
   claimant Party, one helper Party plus accepted authenticated principal, one
   Tenant, one Legal Entity, one Expense Program, and the exact covered
   item/split/purpose/evidence scope. A helper preference or batch selection
   may suggest assignments, but grants no standing account-wide visibility;
   batch setup creates independently revocable exact-claim versions.
3. The ordinary mode is **Prepare drafts**. It permits only minimum private
   evidence contribution/read, unsubmitted draft preparation, and **Ready for
   claimant review**. The only optional advanced operation is mechanical
   submission of an exact unchanged claimant-confirmed version. It never adds
   confirmation, review, approval, exception override, bank/payee editing,
   payment, Field Account, payroll, or accounting authority.
4. An immutable **Claimant Confirmation Version** pins the exact current Claim
   Version digest and every material assertion: claimant, Legal Entity,
   economic payer, item/split amounts in integer minor units, ISO currency,
   incurred date, merchant/payee assertion, business purpose, funding
   classification, evidence links, missing-receipt declaration, applicable
   tax/relationship answers, and attestation policy/method/source. Any material
   successor stales it. Silence, notification delivery, email possession, a
   prior approval, helper action, marriage, or team membership is never
   confirmation.
5. A claimant without an Asym login may use a tenant-admitted external
   attestation only when a certified claimant-authored source meets an Asym
   minimum proof floor and pins the same immutable digest, explicit approval,
   source, time, and admitting actor. Tenant flexibility may strengthen that
   floor, never weaken it to a forwarded email, helper statement, reply-link
   possession, silence, or model inference.
6. Claimant, economic payer, evidence contributor, preparer, submitter,
   confirmer/attestor, reviewer, approver, beneficiary/payee, and actual actor
   principal remain distinct facts. A helper who prepared, submitted, paid,
   benefited from, or contributed evidence to a claim cannot satisfy an
   independent D13 review step for that claim, even when the person holds a
   general reviewer role. The helper cannot choose the review route.
7. A multi-claim Expense Report Submission is admitted only when every included
   claim and item/split has current exact collaboration coverage, current Phase
   12 authority, permitted evidence visibility, and current confirmation. A
   report never crosses claimant Parties or Legal Entities. Currency remains
   exact per claim/item. Uncovered work is blocked or explicitly submitted in
   a separate user-selected envelope; it is never silently dropped and partial
   success is never disguised as full submission.
8. Pending invitations grant nothing. Claimant-managed appointment, when a
   tenant enables it, can choose only an eligible helper and cannot expand the
   tenant's operation or evidence ceiling. Relationship changes, spouse/team
   membership, D19 Support Assignment participation, manager links, and Party
   merge/split never create or retarget D24 authority.
   A separate opaque, one-time, expiring **Expense Collaboration Invitation
   Version** is authority-free until an authenticated, verified principal
   explicitly accepts it through current authorization and CAS. A Supabase Auth
   invitation or account creation never creates Tenant membership, Party
   association, or collaboration authority.
9. Revocation is deny-first for all future reads and writes. It ends the
   assignment through an append-only successor, invalidates authorization
   caches, stops new evidence delivery, suppresses stale notifications, and
   fences uploads/drafts/submission with a governance epoch. It must not claim
   to recall bytes already downloaded. Reusable Supabase signed URLs are not a
   compliant evidence-delivery seam because token expiry does not purge a CDN
   cache entry. Receipt access therefore uses a server-authorized private
   retrieval gateway with current PDP evaluation, no reusable bearer URL, and
   private/no-store response controls; the product states honestly that a copy
   already obtained cannot be remotely erased.
10. Helper upload is staged, private, resumable, scanned, non-authoritative,
    and reauthorized when finalized and linked. Email sender, alias, filename,
    OCR, merchant/date/amount similarity, or AI confidence may suggest a match
    but never select claimant, create authority, confirm, or submit. Ambiguous
    evidence remains private for explicit resolution.
11. Evidence and claim source tables are not directly browser-enumerable. Every
    child repeats Tenant and Legal Entity scope and uses same-scope composite
    constraints. Forced coarse RLS is defense in depth; a centralized server
    PDP owns fine-grained claim/action decisions. Service-role, table-owner,
    `BYPASSRLS`, view, export, and support paths receive explicit denial tests.
    Mutable or large collaboration arrays are never stored in JWTs because
    JWT claims can be stale and size-bounded.
12. Mutations use semantic idempotency and one short local transaction that
    reauthorizes immediately before commit and CAS-checks the current claim
    version, assignment version, principal binding, evidence disposition, and
    governance epoch. Required immutable action/audit provenance and identifier-
    only outbox facts append in that same transaction; their failure rolls back
    the protected command. External storage, scan, email, and notification work
    stays outside that transaction behind the outbox. Last-write-wins and blind
    retry are prohibited.
13. Helper/claimant offboarding, disablement, leave, death/incapacity, spouse or
    team separation, Party merge/split, principal relink, Legal Entity change,
    classification change, and tenant deactivation deny new work first and
    preserve exact provenance. Drafts become an owned reassignment/disposition
    task; no spouse, teammate, helper, or support participant automatically
    succeeds to claimant authority.
14. D24 never creates or changes D13 approval, an Approved Expense Snapshot,
    Reimbursement Obligation, D23 Field Account effect, D15 reimbursement or
    payment handoff, external payment, Phase 20 Accounting Release/Bank Match,
    QBO/Xero truth, a missionary statement, supporter feed, or public giving
    truth. Downstream owners may retain minimum non-authoritative actor
    provenance only after their own independent admission contract succeeds.

#### Seventeen-category final adversarial review

| Category                          | Concern? | What could go wrong                                                                                                                                                                                                   | Why it matters                                                                                             | Severity | Likelihood before hardening | Permanent fix or prevention                                                                                                                                                                                                                                   |
| --------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | Yes      | A spouse edge, email, mutable helper flag, broad role, report-level grant, or claim-ID-only confirmation survives identity, purpose, entity, or material-claim changes.                                               | The wrong person could see evidence or submit facts the claimant never affirmed.                           | Critical | High                        | Immutable exact-claim assignment and confirmation versions; accepted Party/principal binding; half-open intervals; request-time reproof; claim/epoch CAS; append-only succession.                                                                             |
| Technical debt                    | Yes      | Upload, draft, evidence, notification, export, support, and job routes invent different “on behalf of” checks, or the assignment becomes a second permission registry.                                                | Authorization drift becomes expensive, untestable, and unsafe.                                             | Critical | High                        | One code-owned two-mode collaboration catalog compiled into Phase 12 capability atoms; one server authorization kernel; route/UI/action-policy parity tests; no reuse of unrelated Support Hub or CRM delegate storage.                                       |
| Edge cases                        | Yes      | Multiple helpers edit together; one helper serves hundreds of claimants; claims span items, purposes, or currencies; claimant lacks login; identity changes; claimant/helper leaves or becomes unavailable.           | These are ordinary missions operations and can strand work or falsify authorship.                          | Critical | High                        | Exact per-claim/item scope; no-login proof floor; multi-scope split/block rules; CAS; orphan-work owner; identity quarantine; no automatic succession; exhaustive fixtures.                                                                                   |
| Footguns                          | Yes      | “Full access,” “Act as Jordan,” a generic delegate checkbox, helper-created confirmation, silent partial submit, or bulk setup grants more than users understand.                                                     | Familiar but vague controls invite over-sharing and unauthorized financial action.                         | Critical | High                        | Off/invisible by default; prepare-only preset; literal consequence preview; separate advanced submit toggle; no impersonation; exact rows after batch setup; claimant/staff revocation from the claim.                                                        |
| Tenant safety                     | Yes      | Guessed IDs, stale caches/URLs, permissive RLS `OR`, service-role jobs, views, exports, or support tools expose another tenant, entity, claimant, purpose, or evidence asset.                                         | Receipts can reveal card fragments, addresses, travel, health/care, location, and ministry-security facts. | Critical | Medium-high                 | Structurally complete scope keys/FKs; private browser-inaccessible sources; forced coarse RLS; current server PDP; no JWT grant arrays; non-cacheable retrieval gateway; negative substitution tests on every execution path.                                 |
| Over-engineering                  | Yes      | The feature expands into a universal delegation graph, ACL/role designer, impersonation framework, workflow DSL, recurring certification bureaucracy, or estate/guardianship system.                                  | It duplicates Phase 12/D13 and makes a common spouse/assistant task unusable.                              | High     | Medium-high                 | One assignment type, two guided modes, three appointment postures at most, exact claim scope, no transitivity/formulas/scripts, event-triggered review, and a typed external-successor seam only.                                                             |
| UX/UI and user friction           | Yes      | Staff face a permission matrix; a helper loses context; the claimant re-enters data; confirmation adds deadline bureaucracy; mobile/screen-reader users cannot tell whose claim is open.                              | The design would increase password sharing and work instead of reducing it.                                | High     | High                        | Hide when off; one setup card; persistent “Helping Jordan — signed in as Alex” context; scoped helper queue; change-focused claimant review; calm plain-language statuses; progressive disclosure; WCAG 2.2 AA and comprehension proof.                       |
| Hidden coupling                   | Yes      | D19 participation becomes access; D13 review delegation becomes preparation; D22 prospective approval becomes actual-claim consent; evidence matching becomes authority; D24 artifacts enter D23/Phase 20 truth.      | A change in one bounded context would silently alter rights or money truth in another.                     | Critical | High                        | Separate state machines and admission contracts; Phase 12 = authorization, D10 = claim/assertion/submission, D13 = policy/review, D23 = Field Account effect, Phase 20 = accounting delivery; negative boundary tests.                                        |
| Failure modes                     | Yes      | Revocation races save/upload/URL retrieval/submission; scan quarantines after confirmation; notifications fail; offline work returns after access ends; one slice submits while another fails.                        | Ambiguous partial completion can create false assertions or leave private bytes exposed.                   | Critical | High                        | Reauthorize before commit/finalize/retrieval; epoch fence and CAS; private quarantine; transactional outbox; bounded all-or-nothing report submission; stale-task suppression; cause-owned recovery.                                                          |
| Data integrity risks              | Yes      | Last-write-wins overwrites claimant facts, a confirmation is reused after changes, duplicate submissions/evidence links appear, actor roles collapse into `created_by`, or identity merge silently reparents history. | Audit, reimbursement, policy, and accounting can no longer prove who asserted what.                        | Critical | High                        | Immutable claim/confirmation/submission/action versions; semantic idempotency; exact unique coverage; same-scope constraints; role-specific actor fields; merge/relink quarantine; append-only corrections.                                                   |
| Security and privacy risks        | Yes      | A helper enumerates unrelated claims, sees restricted evidence, keeps a reusable cached URL after revocation, escalates through service tools, or leaks into public/supporter surfaces.                               | The data is highly sensitive and a leak can endanger people as well as privacy.                            | Critical | High                        | Least-field projections; evidence classification ceiling plus current Phase 3/10 floor; server-authorized no-store retrieval; protected audit; PII-minimized notifications/logs; support/export parity; public projection exclusion.                          |
| Scalability and performance risks | Yes      | Central assistants create huge JWTs, deep RLS joins, offset scans, N+1 PDP calls, evidence-URL storms, month-end fan-out, or giant batch transactions.                                                                | The highest-value operational pattern could fail exactly at month end.                                     | High     | Medium-high                 | Indexed server resolution; keyset pagination; bounded batch authorization; epoch/version-keyed short caches; chunked exact-assignment setup; outbox backpressure; production-cardinality/fairness load tests.                                                 |
| Operational burden                | Yes      | Staff configure every helper repeatedly, manage arbitrary expirations, rediscover stranded drafts, or learn an IAM DSL; claimants cannot see who is helping.                                                          | Small nonprofits do not have dedicated IAM administrators.                                                 | High     | High                        | Staff-managed default plus optional claimant-managed/both; recommended prepare-only preset; optional end date; previewed batch setup; event-driven stale-helper review; one orphan-work queue; one-click revoke with consequence preview.                     |
| Observability gaps                | Yes      | Staff cannot distinguish waiting on helper, claimant, scan, policy, reviewer, or downstream payment; denied revoked access is unprovable; logs leak claim contents.                                                   | Problems require database archaeology or create a second privacy incident.                                 | High     | High                        | Safe state/reason taxonomy; protected correlated audit; owner/age/next action; metrics for denial, stale confirmation, CAS, quarantine, orphan age, notification suppression, and PDP latency; no receipt/merchant/amount/Party labels in general telemetry.  |
| Dependency and integration risks  | Yes      | Email, OCR, storage, scan, notification, or external-attestation providers are treated as identity/consent/authority, or an outage removes the only path.                                                             | Provider outputs are probabilistic or operational, not claimant financial assertions.                      | High     | Medium-high                 | Capability-certified adapters; immutable source provenance; provider results remain suggestions; accessible manual path; outage queue and reauthorization; no blind retry after ambiguous submission; provider-independent audit facts.                       |
| Migration and upgrade risks       | Yes      | Existing Support Hub assignments, CRM delegates, spouse/team edges, D19 memberships, roles, or legacy proxy flags are imported as live D24 authority; operation meanings drift.                                       | Migration could silently recreate the broad proxy model C-prime rejects.                                   | High     | Medium                      | Fresh feature off; no automatic import from unrelated concepts; only exact tenant-previewed legacy mappings, otherwise quarantine; versioned operation catalog and portable manifest; never fabricate historic authorship/consent.                            |
| Other development hazards         | Yes      | TOCTOU, duplicate retries, permissive-policy composition, owner/service-role bypass, missing job/export checks, unclear kill-switch owner, or insufficient auth testing defeats an apparently correct UI.             | A single missed path compromises confidentiality or financial integrity.                                   | Critical | High                        | Transactional commit-time PDP/CAS; semantic idempotency; restrictive RLS tests; service-role/view/function denial fixtures; Tenant/Legal Entity/operation kill switches; inspect-before-retry; named runbook owner; security/concurrency/accessibility gates. |

#### Ruthless synthesis and build order

1. **Ratify the boundary, not a proxy feature.** The assignment is exact-claim
   collaboration provenance and a code-owned mode ceiling; Phase 12 alone
   grants operations. This is the non-negotiable security boundary.
2. **Make the clean path nearly invisible.** Keep the feature off and absent by
   default. When enabled, default to staff-managed **Prepare drafts**. A helper
   gets one quiet assigned-claims queue; the claimant gets one review task.
   Claimant-managed appointment and submit-confirmed are separate tenant
   choices, not extra steps for everyone.
3. **Lock claimant truth before implementation.** Define the Claimant
   Confirmation Version, complete material digest, invalidation rules, and
   minimum external-attestation proof floor first. Mechanical helper submission
   is impossible without this exact seam.
4. **Finish the Phase 12 substrate before D24 ships.** The repository's current
   broad staff capability foundation is not sufficient. No route-local role
   checks, client filtering, RLS-only fine-grained access, or service-role
   bypass may substitute for the resource/action PDP. D10's Phase-29-compatible
   private receipt-byte seam is also a release prerequisite.
5. **Use one reusable server policy seam.** Lists, details, mutations, upload
   finalization, evidence retrieval, notifications, background work, exports,
   and support tools call the same decision contract. Coarse forced RLS and
   same-scope constraints remain defense in depth.
6. **Build the evidence path for truthful revocation.** Private staged upload,
   malware/quarantine handling, explicit linking, and non-cacheable
   request-authorized retrieval come before helper evidence access. Do not
   promise recall of copies already received.
7. **Prove the races and negative boundaries.** Race claimant/helper edits,
   confirmation, evidence changes, revocation, upload finalization, and
   submission. Substitute every tenant/entity/claimant/claim/evidence/helper
   scope across normal and privileged paths. Prove D24 cannot create approval,
   obligation, D23 effect, payment, payroll, or accounting truth.
8. **Ship only after production-shaped UX, accessibility, and load proof.** Test
   representative missionaries, spouses, teammates, central assistants,
   finance staff, and small-tenant admins on mobile, keyboard, and screen
   reader. They must correctly explain whose claim is open, who asserted and
   submitted it, what the helper may see/do, what waits on whom, and why the
   item is not yet approved, owed, payable, paid, or exported.

#### Release dependency ruling

D24 may be specified after ratification, but runtime release is blocked on the
completed Phase 3/9/10/12 projection, Party/principal, Legal-Entity, current
Active Tenant Assignment, PDP, and governance-epoch substrate plus D10's
Phase-29-compatible private receipt-byte seam. The repository's current broad
role fallbacks, profile-derived Tenant context, service-role reads, public
`document-uploads` precedent, best-effort generic audit logger, non-forced
RLS, and signed-URL download precedent are evidence to replace or bypass
through the established future contracts, not acceptable D24 foundations.

#### Ratified C-prime-R

> **C-prime-amended-and-hardened (C-prime-R) — one optional,
> Tenant-controlled, own-identity exact-claim-bounded Expense Collaboration
> Assignment Version that records responsibility, provenance, and a code-owned
> collaboration-mode ceiling but never replaces Phase 12 authorization; bound
> to one exact Tenant, Legal Entity, Expense Program, claimant Party, helper
> Party and accepted authenticated principal, stable Expense Claim, covered
> item/split/purpose/evidence scope, an explicit code-owned Evidence Access
> Projection Version from which stricter Phase 3/10 classification may only
> subtract, and half-open interval; activated only through a separate
> authority-free, one-time, expiring invitation accepted by the verified
> principal, and otherwise absent unless enabled under a staff-managed,
> claimant-managed, or combined appointment posture; with one quiet
> prepare-only default, exact independently revocable assignments even after
> batch setup, and one separately enabled mechanical submission operation only
> for complete unchanged Claim Versions whose material facts and evidence-link
> set are pinned by immutable authenticated Claimant Confirmation or a
> versioned tenant-admitted claimant-authored external attestation meeting an
> Asym minimum proof floor; explicit multi-claim, claimant, Legal-Entity,
> item/split, purpose, currency, and evidence coverage with no silent omission
> or hidden partial submission; separately preserved claimant, economic payer,
> evidence contributor, preparer, submitter, confirmer/attestor, reviewer,
> approver, beneficiary/payee, and actual-principal truth; minimum private
> evidence access through current-authorized non-cacheable retrieval,
> persistent scoped “Helping with expenses” context, non-transitive deny-first
> future-access revocation without fictional recall of delivered bytes,
> identity/lifecycle quarantine without automatic succession, semantic
> idempotency, commit-time reauthorization and current-version/epoch CAS,
> immutable action provenance, cause-owned observability, and append-only
> correction and recovery—without shared credentials, whole-account
> impersonation or visibility, a second PDP, generic delegation graph,
> membership-, spouse-, household-, team-, manager-, email-, OCR-, match-, AI-,
> notification-, silence-, or timeout-derived authority, helper-created
> claimant consent, stale or reusable evidence URLs, helper-selected review,
> self-approval, transitive delegation, automatic successor authority,
> payment/payroll/Field-Account/accounting authority, public helper/evidence
> leakage, or any reopening of Phase 21 D1-D23.**

#### Additional hardening sources

- [Supabase — Storage access control](https://supabase.com/docs/guides/storage/security/access-control)
- [Supabase — Private buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals)
- [Supabase — Smart CDN signed-URL caching](https://supabase.com/docs/guides/storage/cdn/smart-cdn)
- [Supabase — Users and invitations](https://supabase.com/docs/guides/auth/users)
- [OWASP — Insecure Direct Object Reference Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html)
- [OWASP — File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
- [PostgreSQL — CREATE FUNCTION](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [PostgreSQL — CREATE VIEW](https://www.postgresql.org/docs/current/sql-createview.html)
- [W3C — Error Prevention for legal, financial, and data submissions](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html)

### D24 ratification and congruency disposition

The founder ratified the hardened C-prime-R above as **Phase 21 D24** on
2026-08-02. The complete final-hardening findings, seventeen-category review,
release dependency ruling, and production proof remain binding, not advisory.

Ratification preserves D1-D23 without reinterpretation. D24 owns only exact-
claim collaboration responsibility, provenance, claimant confirmation, and
action truth. Phase 12 remains the sole current authorization owner; D10 remains
claim/assertion/submission truth; D13 remains policy, route, review, exception,
and conflict truth; D19 participation remains association only; D22 prospective
request truth grants no D24 authority; D23 effect recognition remains
independently source-qualified. D24 creates no approval, Approved Expense
Snapshot, Reimbursement Obligation, Field Account effect, compensation or
payment handoff, external payment, accounting release, bank match, QBO/Xero
fact, statement, supporter feed, or public-giving truth.

This ratification is recorded in the Phase 21 decision log, ADR-0113, the
ubiquitous-language glossary, and narrow D10/D13/D19/D22/D23 precision riders.
It does not authorize runtime implementation, create a Phase 21 OpenSpec change
or ticket set, or reopen the deferred shared Phase 1/3/4/6/9/10/12/17/20 and
roadmap congruency work.

## D25 decision research — Exact Expense Claim resolution without destructive reopening

**Status:** ratified as Phase 21 D25 on 2026-08-02 after founder selection,
external research, a complete seventeen-category adversarial review, and
cross-phase hardening. D1-D24 remain binding and unchanged.

### Verdict

The selected option survives the ruthless review only in hardened form. A
normal mutable case row with a generic status, comments, broad administrator
editing, or a `Resolve` button would become a second expense-approval system.
It would also invite claimant impersonation and falsely imply that one click
reversed obligations, Field Account effects, payments, or accounting.

The permanent shape is deliberately smaller:

- one internal, exception-only Resolution Case per exact root-cause fingerprint
  and affected coverage;
- immutable case basis and occurrences, with a rebuildable coordination
  projection for fast queues;
- one cause-owned responsible lane and one literal next safe action;
- claimant, helper, organization, reviewer, lifecycle, payment, Field Account,
  and accounting facts kept separately attributable;
- completion derived from the authoritative source outcome and every required
  downstream disposition, never selected manually; and
- one calm, contextual expense update in the user interface. Several exact
  cases may be grouped into one report-level task for presentation, but they do
  not merge authority or coverage.

Healthy claims create no case, no task, and no setup work. Clean sibling claims
continue unless a code-declared parent/child or other inseparable coverage rule
proves they must move atomically.

### Current evidence and product lessons

The review checked current first-party documentation on 2026-08-02.

- [SAP Concur supports sending selected expenses back](https://help.sap.com/docs/CONCUR_EXPENSE/1f13d54352684d6dba6e65c8c5d75ead/c459abae51c3101593a1902615753967.html)
  while unaffected expenses proceed. Its read-only
  [audit trail](https://help.sap.com/docs/concur-expense/concur-expense-standard-edition-end-user-help/view-audit-trail-c4043dac51c3101597c0cfc9eca7257b)
  records submissions, status changes, evidence, exceptions, and post-submit
  edits. This supports claim-level return and durable attribution, not a
  report-wide reopen.
- [Oracle Expenses separates request-more-information, rejection, audit, and
  payment readiness](https://docs.oracle.com/en/cloud/saas/financials/25c/fawde/audit-actions.html).
  The separation is useful; Oracle's ability to continue an audit before a
  response and discard prior adjustments is not an Asym precedent for silently
  satisfying a requirement or erasing history.
- [Ramp](https://support.ramp.com/submitting-reimbursements/) provides fast
  mobile capture, resubmission, review summaries, and stage-sensitive controls.
  It also permits mutable pending records and permanent deletion in some
  states. Asym adopts the low-friction interaction but keeps immutable submitted
  versions and append-only correction.
- [Brex](https://www.brex.com/support/expense-reimbursements) preserves denied
  or canceled records and creates a copied resubmission, including bounded
  handling for former employees. This supports linked successor truth and a
  real claimant-unavailable path.
- [Expensify](https://help.expensify.com/articles/new-expensify/reports-and-expenses/Approve-Expenses)
  distinguishes held/rejected individual expenses from whole reports and lets
  clean work proceed. Asym rejects its destructive `Unapprove`, broad bypass,
  and proxy patterns.
- [IRS Publication 463 (2025)](https://www.irs.gov/publications/p463) requires
  business connection, adequate accounting within a reasonable period, and
  return of excess amounts for an accountable plan. It also says timely records
  and documentary evidence have greater probative value. Staff convenience,
  silence, or a relationship cannot manufacture claimant substantiation.
- The [National Council of Nonprofits internal-control guidance](https://www.councilofnonprofits.org/running-nonprofit/administration-and-financial-management/internal-controls-nonprofits)
  and [ECFA accountable-plan sample resource](https://www.ecfa.org/Content/Accountable-Expense-Reimbursment-Plan-Sample-Resolution-NPO)
  support documented responsibilities, checks and balances, and organization-
  controlled policy. They do not justify one universal deadline or exception
  rule for every tenant.
- [WCAG 2.2 error prevention for financial and data submissions](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html)
  requires a reversible, checked, or review-and-confirm path, while
  [Redundant Entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html)
  supports carrying forward already-entered data. A successor therefore uses a
  clear before/after review instead of making a missionary re-enter the report.
- [OWASP authorization guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html),
  [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html),
  and [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
  require deny-by-default, every-request authorization, explicit bypass-path
  handling, and real tests. Service credentials and `BYPASSRLS` are technical
  capabilities, never product authority.

The products are interaction evidence, not domain authority. Asym copies their
strongest patterns - exact return, one action, linked resubmission, visible
history, and action-focused queues - while rejecting destructive unapproval,
mutable submitted facts, staff-authored claimant facts, permanent deletion,
comments-as-evidence, account proxying, and broad administrator bypass.

### Hardened domain contract

#### Exact case basis

One case binds one:

- Tenant, Legal Entity, and Expense Program;
- claimant Party and stable Expense Claim;
- triggering Expense Claim Version;
- exact item, split, purpose, and ISO-currency coverage;
- code-owned cause-contract version, root source fact, source owner, and cause
  fingerprint;
- evidence references and current classification, while bytes remain owned by
  D10/Phase 29;
- authorization and governance versions proven for each consequential action;
  and
- proportional Downstream Impact Manifest: empty when no downstream authority
  exists, and complete when a snapshot, obligation, Field Account effect,
  handoff, payment, statement, Accounting Release, or provider result may be
  affected.

The semantic identity is Tenant x Legal Entity x stable Claim x cause-contract
version x root source identity x exact coverage hash. Same-cause duplicates
converge. Overlapping unresolved causes are either explicitly related and
ordered or fail as a visible conflict; last-created-wins is prohibited.

The case stores no authoritative mutable `approved`, `reopened`, `paid`,
`corrected`, or `resolved` scalar. Immutable occurrences drive a small,
rebuildable current-action projection. Users may see **Needs your update**,
**With finance**, **Waiting on source**, **Correction in progress**, or
**Complete**, but no person selects those labels and no financial consumer may
read them as source truth.

#### Closed cause catalog

1. `information_required`
2. `claimant_withdrawal_requested`
3. `claimant_review_requested`
4. `organization_source_error`
5. `policy_application_question`
6. `claimant_unavailable_or_identity_changed`
7. `downstream_effect_conflict`

There is no tenant-authored catch-all `other`. Free text may explain a cause;
it cannot create authority or routing semantics. A genuinely new cause requires
a prospective contract version, owner, actions, migration treatment, and tests.
Tenants may choose bounded queue owners, reminder posture, existing D13 review
routes, and help copy. They may not create custom states, financial meanings,
scripts, formulas, timers, or workflow graphs.

#### Literal actions and authorship

- A claimant can provide requested facts/evidence, say that evidence is
  unavailable, request another review, request withdrawal of exact eligible
  unapproved coverage, and confirm/submit a D10 successor.
- A D24 helper may prepare only within the current exact assignment. The helper
  never becomes claimant, confirmer, reviewer, approver, lifecycle successor,
  or financial actor.
- Staff may record organization-authored evidence and a correction proposal
  under their own identities. They cannot edit or attest as the claimant.
- A currently authorized, conflict-free D13 reviewer alone records one of the
  existing `approved`, `needs_information`, `rejected`, or `excluded`
  dispositions or a separately permitted Reviewer Exception.
- Claimant unavailability requires exact source-owned identity/lifecycle proof.
  Silence, elapsed time, delivery failure, stale JWT, account deletion, manager
  statement, spouse/team membership, or helper assignment proves neither
  unavailability nor successor authority.
- A finance operator may invoke one exact source-owner correction command. The
  operator cannot roll back several domains or mark money paid, posted, or
  reconciled by completing follow-up work.

There is no generic **Resolve**, **Close case**, **Reopen**, **Unapprove**,
**Override**, **Edit as claimant**, **Mark paid**, **Undo export**, or **Reverse
everything** action. Completion is derived only when the cause's versioned
predicate is proved by its source owner and every affected downstream family
has an explicit `corrected`, `unaffected`, `not_applicable`, or safely
`quarantined` disposition. A source-only issue can complete without a live
accounting connection; a downstream conflict cannot pretend complete while a
required correction remains unknown.

#### Stage-aware correction

| Existing truth                     | Only permitted permanent path                                                                                                                              |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Draft                              | D10 successor draft or exact withdrawal occurrence                                                                                                         |
| Submitted or pending review        | Linked successor, fresh claimant confirmation/submission where required, and current D13 route/decision                                                    |
| Rejected or excluded               | New facts use a successor; same-fact review request gets a new exact D13 review/decision while the old decision remains                                    |
| Approved Expense Snapshot          | D10/D13-owned supplement, successor, reversal, or correction; never `Unapprove`                                                                            |
| Reimbursement Obligation           | D16-owned append-only cancellation, reduction, or supplement when qualified                                                                                |
| D23 effect or closed Support Cycle | D23 appends a correction in the next tenant-permitted cycle; the old close never reopens                                                                   |
| Handoff or provider operation      | Inspect first; create only a proved residual successor; ambiguous outcome remains quarantined                                                              |
| External payment                   | Preserve payment truth; D16 determines any return/restitution path; never negative reimbursement, debt inference, payroll deduction, or unrelated netting  |
| Published statement                | D12 governs a correction or next statement; the published artifact remains immutable                                                                       |
| Phase 20 release/provider posting  | Phase 20 creates a source/cause-linked Compensating Accounting Release in a permitted period with idempotent delivery, exact readback, and drift detection |

### Exceptionally clear UX/UI

#### Missionary or claimant

The default expense view remains quiet. A contextual card appears only when the
person can act or when a material outcome affects that claim. It shows, in this
order:

1. **What finance needs** - one sentence.
2. **Which expense** - merchant/date plus exact amount and ISO currency; a
   thumbnail only when currently authorized.
3. **Why** - plain language, with policy detail behind disclosure.
4. **What to do** - one primary action.
5. **What happens next** - responsible party and confirmation that unrelated
   expenses continue.

Recommended copy:

| Situation           | Heading and body                                                                                                                                                           | Action                                               |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Missing evidence    | **Finance needs one update.** The hotel receipt does not show the stay dates. Add a folio or explain why it is unavailable.                                                | **Add response**; secondary **I can't provide this** |
| Response recorded   | **Finance is reviewing your response.** Your response was received on 2 Aug 2026. Other submitted expenses can continue.                                                   | **View response**                                    |
| Decision questioned | **You can ask finance to review this again.** Tell finance what may have been misunderstood. The current decision does not change until a reviewer decides.                | **Request another review**                           |
| Withdrawal          | **Withdraw this expense request?** This preserves the submitted record and asks finance to withdraw only USD 42.18. It does not reverse anything already approved or paid. | **Review withdrawal**; secondary **Keep request**    |
| Upload failed       | **Receipt not uploaded.** Your response has not been sent. Check your connection and try again.                                                                            | **Retry upload**; secondary **Save text draft**      |
| Cause complete      | **This question is resolved.** Finance closed the information request. View the expense decision for its approval status.                                                  | **View decision**                                    |

Do not expose `case`, `disposition`, `watermark`, `effect`, `reconciliation`, or
accounting-provider jargon by default. Do not call this an **appeal**, because
that term already has fundraising meaning in Asym. Changed facts use a compact
before/after check page with prefilled unchanged data and **Confirm and
resubmit**. At 320 CSS pixels the primary action precedes history, controls meet
Core's 44-pixel target convention, focus and status updates are accessible, and
the page never horizontally scrolls except for genuinely two-dimensional
evidence. A network loss says **Not uploaded** or **Not sent**; it never shows
success before authoritative commit.

#### Helper

Show **Helping Jordan with expenses - your work is saved under your name.
Jordan must review and submit claimant changes.** If a claimant-only action is
needed, say **Jordan needs to respond** and show only the helper actions actually
permitted. Revocation ends future reads/actions immediately and preserves prior
authorship.

#### Reviewer and finance

Reuse **Expenses -> Needs attention**, not a new case-management module.
Default views are **Response received**, **Waiting for claimant**, **Source
correction**, **Downstream correction**, and **Aging**. Rows show only claimant,
merchant/date, exact amount/currency, plain cause, responsible lane, age, and a
downstream warning. The detail surface progressively discloses:

1. what needs attention;
2. original claimant facts;
3. what was requested and received, with authorship;
4. policy and decision; and
5. later financial activity plus the one next safe action.

Consequential actions show an exact before/after and impact preview. Safe bulk
work is limited to homogeneous routing or communication; each row is still
reauthorized and returns an explicit outcome. No bulk approval, withdrawal,
correction, completion, payment, or accounting action belongs here.

#### Tenant admin and communications

Reuse D13 Expense Governance for the default finance queue, independent policy-
exception reviewer, lifecycle/offboarding owner, reminder cadence, notification
posture, tenant help contact, and separation-of-duties summary. Provide a
production-shaped preview. There is no empty Cases navigation, recurring
recertification chore, or workflow builder.

The authoritative task stays in Asym. Phase 6/17 email, push, or SMS contains a
PII-minimized summary and authenticated deep link, never a receipt URL, merchant
or location detail, internal lifecycle reason, or reply-to approval. Dispatch
and link-open both reauthorize. Delivery success/failure changes communication
truth only. Reminders deduplicate and never decide, reject, withdraw, or close.

### Ruthless category-by-category review

Every requested category has a concern. The ratings assess an unhardened
implementation; the prevention column is binding for C-prime-R.

| Category                          | Concern? | What could go wrong and why it matters                                                                                                                                                                                                          | Severity | Likelihood  | Permanent fix or prevention                                                                                                                                                                                                                                                 |
| --------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | **Yes**  | Assuming an active claimant, one missing receipt, splittable coverage, or no downstream facts fails on offboarding, partial claims, shared evidence, closed cycles, and post-payment correction. It strands work exactly when finance needs it. | Critical | High        | Exact cause/version/coverage, declared inseparable groups, lifecycle proof, current downstream manifest, source-owner commands, and lifecycle/post-payment scenario tests.                                                                                                  |
| Technical debt                    | **Yes**  | A mutable `status`, comments blob, copied D10/D13 fields, or per-screen action switches become a shadow approval engine whose meanings drift.                                                                                                   | Critical | High        | Immutable case basis/occurrences, one versioned cause/action catalog, one rebuildable projection, source-owned commands, and server/UI/audit parity tests.                                                                                                                  |
| Edge cases                        | **Yes**  | Claimant withdrawal racing approval, evidence quarantine, two helpers, claimant return, Party relink, shared receipt, mixed Legal Entities/currencies, late source correction, or already-paid work can overlap or duplicate outcomes.          | Critical | High        | Complete same-scope keys, exact actor facts, material-successor rules, non-overlap, CAS/locking, current lifecycle/classification reproof, and exhaustive race fixtures.                                                                                                    |
| Footguns                          | **Yes**  | `Resolve`, `Reopen`, `Unapprove`, `Edit for claimant`, `Override`, `Apply to all`, or `Roll back` hides several authoritative consequences in one click.                                                                                        | Critical | High        | Prohibit generic mutators; use literal commands, proportional consequence preview, no hidden partial success, and negative authorization/effect tests.                                                                                                                      |
| Tenant safety                     | **Yes**  | Queues, counts, FK errors, caches, exports, Realtime, support tools, service jobs, or notifications can leak another Tenant, Legal Entity, claimant, purpose, or evidence asset.                                                                | Critical | Medium-high | Non-null scope on every row, same-scope composite FKs, forced coarse RLS, sole Phase 12 PDP before enumeration and commit, uniform not-found, and real bypass/substitution tests.                                                                                           |
| Over-engineering                  | **Yes**  | The feature can grow into ServiceNow, HR grievances, AP disputes, arbitrary SLAs, rules DSL, or Phase 34 workflow. That makes a rare exception dominate ordinary work.                                                                          | High     | High        | Seven code-owned causes, closed actions, one owner/action projection, existing queue/settings, no custom state/graph/script/formula, and explicit adjacent-domain rejection.                                                                                                |
| UX/UI and user friction           | **Yes**  | A new portal, case jargon, duplicate timelines, repeated entry/attestation, vague status, or disabled mystery actions makes a small receipt fix punitive and drives users to email.                                                             | High     | High        | Inline one-action card, grouped report-first presentation, prefilled successor diff, progressive disclosure, exact status copy, mobile/accessibility/comprehension testing, and no noise on the healthy path.                                                               |
| Hidden coupling                   | **Yes**  | Case assignment/completion could select a reviewer, approve a claim, alter a snapshot/obligation/effect, mark payment, or claim Phase 20 success; notification delivery or silence could be treated as consent.                                 | Critical | High        | Coordination-only invariant, typed source-owner requests/results, identifier-only outbox, negative authority tests, and a ban on financial consumers reading case projection.                                                                                               |
| Failure modes                     | **Yes**  | Case persistence, audit, evidence, notification, or a downstream command can partially succeed; retry can duplicate correction; a stale action can beat new evidence.                                                                           | Critical | Medium-high | Atomic local occurrence/audit/projection/outbox, async effects after commit, semantic idempotency plus digest, CAS, inspect-before-retry, explicit unknown/waiting states, dead-letter visibility, and fault injection.                                                     |
| Data integrity risks              | **Yes**  | Actor roles collapse, case coverage overlaps, old/new versions gap, cascade deletion loses provenance, floats/implicit FX corrupt amounts, or one correction reaches D23/Phase 20 twice.                                                        | Critical | High        | Typed immutable actor/source roles, integer minor units and exact ISO currency, semantic uniqueness/non-overlap/conservation, no provenance cascade deletion, and source-owner idempotency.                                                                                 |
| Security and privacy risks        | **Yes**  | Receipts, OCR text, filenames, merchant/location/health details, lifecycle reasons, signed URLs, or notes leak through lists, email, telemetry, AI, browser caches, support, or privileged functions.                                           | Critical | High        | Phase 3/10 minimum projections, D10/Phase 29 private bytes, current no-store retrieval, no persisted bearer URLs, classified typed evidence, redacted logs/outbox, access audit, and explicit privileged-path PDP tests.                                                    |
| Scalability and performance risks | **Yes**  | Month-end bursts, a case for every healthy claim, full-history joins, N+1 PDP/evidence reads, reminder fan-out, and systemic corrections can starve tenants and hold locks.                                                                     | High     | Medium-high | Exception-only creation, compact indexed projection, keyset pagination, on-demand history/evidence, narrow deterministic locks, chunked fan-out, tenant-fair backpressure, and production-cardinality plans/tests.                                                          |
| Operational burden                | **Yes**  | Manual archaeology, status picking, duplicate task/case lists, orphan reassignment, and direct database fixes recreate spreadsheets and tribal knowledge.                                                                                       | High     | High        | Automatic evidence/impact assembly, derived owner/action, one queue, healthy zero-work state, event-driven orphan detection, safe routing tools, and source-specific repair runbooks.                                                                                       |
| Observability gaps                | **Yes**  | `Open` or `failed` does not reveal whether work waits on claimant, reviewer, scan, identity, payment correction, D23, or Phase 20; verbose telemetry can itself leak data.                                                                      | High     | High        | PII-minimized cause/owner/age/CAS/outbox/denial metrics, opaque correlations, protected immutable audit, stuck/overlap/starvation alerts, and user-visible last action/wait reason.                                                                                         |
| Dependency and integration risks  | **Yes**  | Phase 12/29, messaging, lifecycle evidence, D15/D16, D23, Phase 20, or providers may be absent, delayed, ambiguous, or drifted. Pressure to keep moving can turn D25 into their de facto authority.                                             | Critical | High        | Capability-labelled/versioned contracts, explicit unsupported/unavailable/waiting states, manual artifact continuity, source readback, kill switches, smallest-scope quarantine, and no timeout-derived success.                                                            |
| Migration and upgrade risks       | **Yes**  | Mutable legacy rows, emails, tickets, or free-form statuses cannot prove claimant, reviewer, cause, coverage, or correction lineage; enum changes can reinterpret history.                                                                      | High     | Medium-high | Prospective versioned causes/actions, stable opaque IDs/export, evidence-strength labels, inert reference history, shadow projection rebuild, exact cutover manifest, and no fabricated attribution.                                                                        |
| Other development hazards         | **Yes**  | TOCTOU authorization, stale bulk work, time-zone/deadline errors, reviewer conflicts, deadlocks, unbounded retry, rollout skew, reminder-driven decisions, and soft delete can still produce unauthorized outcomes.                             | Critical | High        | Server-derived scope/actor, request- and commit-time reauthorization, governance/version CAS, deterministic locks, bounded whole-transaction retry, no timer decisions, conflict recheck, expand/contract rollout, property/replay/fault tests, and append-only correction. |

### Ruthless synthesis - the best path forward

1. **Freeze authority and language.** D25 is expense-only coordination over
   immutable facts. Add no financial, approval, identity, byte-storage,
   communication, or accounting authority.
2. **Version the finite policy kernel.** Define the seven causes, exact scope,
   inseparable-coverage rules, permitted actors/actions, source-owned completion
   predicates, and prohibited effects. One catalog drives commands, projection,
   UI availability, audit, and tests.
3. **Build only on certified substrate.** Production activation requires the
   real Phase 3/9/10/12 authorization/classification/epoch system, exact Legal
   Entity scope, D10/D13/D24 models, and Phase 29 private evidence. Current broad
   roles, profile-derived Tenant context, service-role bypass, non-forced RLS,
   reusable signed URLs, and best-effort audit are explicit release blockers.
4. **Make the local command atomic.** Reauthorize and reprove expected case,
   claim, route, collaboration, evidence, lifecycle, classification, and
   downstream versions; lock minimally and deterministically; append case
   action, actor provenance, immutable audit, projection CAS, and identifier-
   only outbox in one transaction. Same key/same digest replays the original;
   changed data conflicts safely.
5. **Connect source owners in authority order.** Ship D10/D13 information-
   required recovery first, then D10/D13 snapshot, D16 obligation, D23 effect,
   D15 handoff/payment, D12 statement, and Phase 20 correction adapters. Every
   adapter requests an owner's typed command and observes its outcome; D25
   never edits the target.
6. **Ship the quiet end-to-end experience.** One claimant card, exact helper
   posture, one finance queue, one literal action, prefilled before/after
   review, accessible error recovery, and no admin builder. Attach Phase 6/17
   notifications and optional Mission Control/Phase 34 follow-up only after
   proving those systems cannot complete domain or financial truth.
7. **Certify the negative space.** Tenant/service-role substitution, evidence
   leakage, lifecycle races, duplicate replay, audit/outbox failure, ambiguous
   provider state, downstream non-authority, production load/fairness, WCAG,
   slow-network, and human-comprehension tests are launch gates.

### Production proof required

1. A mixed report advances clean claims while one exact claim completes
   information request, response, successor, claimant confirmation/submission,
   and fresh D13 review; declared inseparable coverage remains atomic.
2. Claimant, helper, preparer, confirmer, organization evidence contributor,
   reviewer, approver, payee, and actual principal never collapse.
3. Silence, a timer, notification, relationship, stale token, account deletion,
   or helper assignment cannot prove claimant unavailability or succession.
4. Case creation, assignment, response, communication, generic task state, or
   derived completion changes no decision, snapshot, obligation, payment, Field
   Account, statement, accounting, provider, or public truth.
5. Every post-snapshot/payment/effect/accounting change uses exactly one source-
   owned append-only correction and cannot be delivered twice.
6. Same semantic cause converges; stale/different payload conflicts; crashes,
   timeouts, reordered events, duplicate workers, and partial dependency outage
   remain visible and recoverable without partial authoritative success.
7. Real Postgres/RLS/PDP tests substitute every Tenant, Legal Entity, claimant,
   helper, reviewer, claim/version, item/split, purpose, currency, evidence,
   case, list/count/search/export/cache/job/function/view/service/support path
   before enumeration, including service and `BYPASSRLS` paths.
8. Receipt quarantine, revoked access, copied URL, browser/CDN cache, support
   access, notification, export, telemetry, and AI paths disclose neither
   evidence content nor unauthorized existence.
9. Production-volume queues are indexed/keyset-paginated, history is bounded,
   locks remain narrow, fan-out is chunked and tenant-fair, reminders dedupe,
   and systemic errors do not create giant transactions.
10. Keyboard, screen-reader, 320-pixel reflow, 200%/400% zoom, visible focus,
    status-message, error-suggestion, target-size, locale/RTL, slow-network, and
    financial review/confirm tests pass.
11. Moderated missionary, helper, reviewer, finance, and admin tests show users
    can answer: what is needed, whose fact is shown, who acts next, what changed,
    what continues, and whether **Complete** means approved or paid. It never
    does.

### Ratified C-prime-R

> **C-prime-amended-and-hardened (C-prime-R) - one exceptional-only,
> immutable, exact-scope and code-cause-owned Expense Claim Resolution Case,
> embedded as one quiet contextual expense update and one exception-first
> finance workspace rather than exposed as a case-management or workflow
> product; bound to one Tenant, Legal Entity, Expense Program, claimant Party,
> stable Expense Claim, triggering Claim Version, exact item/split/purpose/ISO-
> currency coverage, cause-contract version, root source fact and owner,
> evidence/classification references, current authorization/governance versions,
> and a proportional complete Downstream Impact Manifest; opened idempotently
> only for an actual issue under the closed causes information required,
> claimant withdrawal requested, claimant review requested, organization source
> error, policy application question, claimant unavailable or identity changed,
> and downstream-effect conflict, with same-cause duplicates converging and
> distinct exact cases grouped only for presentation; giving each actor one
> plain-language, source-owned next safe action while clean and separable claim
> coverage continues, claimant, helper, organization, reviewer, lifecycle, and
> actual-principal facts remain separately attributed, and material changes
> receive an exact before/after and downstream-impact preview; completing only
> from the root source owner's proof plus an explicit disposition for every
> affected downstream family, while D10, D13, D15/D16, D23, D12, Phase 20,
> payroll/AP, and providers alone append their own successor, supplement,
> withdrawal, decision, obligation, payment/return, later-cycle Field Account,
> statement, accounting, or provider correction truth; enforced by complete
> same-scope constraints, integer minor units and exact ISO currencies, semantic
> idempotency and non-overlap, the sole Phase 12 PDP before enumeration and at
> commit, version/governance/conflict/downstream CAS reproof, deterministic
> locking, private D10/Phase-29 evidence, and one atomic local case-action,
> actor-provenance, immutable-audit, projection, and identifier-only-outbox
> commit, with PII-minimized governed notifications, tenant-fair recovery, and
> production-shaped security, failure, load, accessibility, and comprehension
> proof - without a fifth D13 disposition, tenant-authored catch-all, generic
> Resolve/Close/Reopen/Unapprove/Override/Edit-as-claimant/Mark-paid/rollback,
> destructive mutation or deletion, relationship/helper/lifecycle succession,
> silence/timer/notification/AI/provider-ambiguity authority, custom workflow or
> status DSL, report-wide blocking where exact coverage can proceed, cross-
> currency arithmetic, reusable evidence URLs, hidden partial success, broad
> administrator or service-role authority, or any claim that case completion
> proves approval, reimbursability, obligation, funding, payment, Field Account
> inclusion, statement correction, accounting delivery, provider acceptance,
> posting, or reconciliation.**

### D25 ratification and congruency disposition

The founder ratified the hardened C-prime-R above as **Phase 21 D25** on
2026-08-02. Its complete category review, finite cause catalog, stage-aware
correction matrix, quiet experience, negative-authority boundaries, release
dependencies, and production proof remain binding rather than advisory.

Ratification preserves D1-D24 without reinterpretation. D25 owns only the
immutable exact case basis, cause and actor provenance, source-owned next-safe-
action coordination, Downstream Impact Manifest, and rebuildable coordination
projection. D10 remains claimant fact, claim-version, evidence-link, and
submission truth; D13 remains policy, route, review, exception, and approved-
snapshot truth; D15/D16 and external payroll/AP remain handoff, payment, and
return truth; D23 and D1/D11 remain operational Field Account effect and close
truth; D12 remains statement truth; Phase 6/17 remains communication truth;
Phase 12 remains the sole current authorization owner; Mission Control may
mirror follow-up only; and Phase 20 plus QBO/Xero remain accounting delivery,
posting, and final-reconciliation authorities.

This ratification is recorded in the Phase 21 decision log, ADR-0114, the
ubiquitous-language glossary, roadmap and phase map, source-of-truth ownership
matrix, and narrow permissions, communication, Mission Control, expense,
statement, reimbursement, Field Account, and Phase 20 precision riders. It
does not authorize runtime implementation, create a Phase 21 OpenSpec change or
ticket set, or reopen the deferred shared substrate owned by other phases.

## D26 decision research - Purpose-owned Phase 21 records schedules

**Status:** Ratified as Phase 21 D26 on 2026-08-02. The research and options
below preserve the path to the accepted decision.

### Why this is the next unresolved seam

Phase 21 now owns immutable support and expense facts, highly sensitive receipt
and travel evidence, organization-card imports, opening-position evidence,
payroll/AP handoff artifacts, provider readback, access audit, and exceptional
D25 coordination. Its decisions repeatedly require lawful retention, holds,
restricted access, and disposal. Phase 29 correctly owns private bytes and the
mechanics of access, quarantine, hold, disposal, and restore suppression, but it
is forbidden to invent the business purpose or lawful schedule. Without an
explicit Phase 21 schedule authority, implementation must either keep sensitive
worker data indefinitely or let generic storage policy destroy evidence that
finance, tax, employment, audit, or correction work still requires.

Phase 18 already established the safer architectural precedent: a source domain
owns a versioned Records Schedule Contract, while the common file layer executes
that contract. The open choice is whether and how Phase 21 adopts that pattern
without exposing a records-management product or a tenant-authored legal DSL.

### Concrete scenario

Jordan's organization closes a reimbursement and later pays it through AP. The
claim has an immutable amount, purpose, approval, obligation, payment reference,
Field Account effect, and accounting lineage. It also has a receipt image, OCR
derivatives, an optional route trace, a reviewer note, a D25 information request,
and provider diagnostics. Years later, the finance spine may still be needed to
explain the books while the raw route trace and redundant provider payload no
longer have a lawful operational purpose. A hold may protect one exact claim,
and an old backup must not resurrect already disposed receipt derivatives.

One expiry timestamp cannot express those differences. Keeping the entire graph
forever creates avoidable privacy and breach exposure; deleting the whole graph
together destroys financial provenance and can make the tenant unable to
substantiate receipts and expenditures.

### Current primary-source findings

- The IRS requires exempt organizations to keep books and records that show tax
  compliance and document sources of receipts and expenditures, including the
  records supporting reported income, expenses, and credits. It does not turn
  that obligation into one universal retention period for every derivative.
  [IRS exempt-organization recordkeeping](https://www.irs.gov/charities-non-profits/eo-operational-requirements-recordkeeping-requirements-for-exempt-organizations)
- IRS Publication 463 distinguishes the records needed to substantiate travel
  and reimbursement expenses and says retention follows how long the records
  may be needed for tax administration; its general three-year example is not a
  safe universal product default for every organization, jurisdiction, return,
  claim, or record family.
  [IRS Publication 463](https://www.irs.gov/publications/p463)
- U.S. Department of Labor guidance demonstrates that employment records have
  family-specific minima: covered payroll records generally have a three-year
  floor, while records underlying wage calculations generally have a two-year
  floor. Phase 21 therefore cannot infer one duration from the word "payroll."
  [DOL Fact Sheet 21](https://www.dol.gov/agencies/whd/fact-sheets/21-flsa-recordkeeping)
- Current ICO storage-limitation guidance says identifiable personal data must
  not be retained longer than necessary for its purpose, recommends documented
  standard periods and review, and requires deletion or anonymization when the
  purpose ends absent a continuing justification. It explicitly rejects
  indefinite "just in case" retention and distinguishes taking data offline
  from actually putting it beyond use.
  [ICO storage limitation](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/storage-limitation/)

These sources support a purpose- and record-family-owned model. They do not
authorize Asym to give legal advice, calculate one global statutory period, or
let a tenant type any retention duration it wants.

### Option A - One fixed Phase 21 retention schedule

Asym publishes one duration per broad class such as financial records, expense
evidence, and temporary processing data.

- **Advantage:** simplest setup and easiest implementation.
- **Failure:** legal entity, jurisdiction, employment relationship, source
  family, record purpose, holds, return timing, and provider copies do not share
  one lawful lifetime. A fixed table will be wrong for real tenants or become a
  lowest-common-denominator "keep everything" policy.

### Option B - Tenant-authored retention rules

Each tenant builds its own record classes, triggers, durations, exceptions, and
disposal actions.

- **Advantage:** appears maximally flexible.
- **Failure:** it makes Asym a records-policy builder, invites unlawful floors,
  indefinite extensions, contradictory triggers, per-record timers, and silent
  destruction, and imposes legal-operations work on small missions that wanted
  useful defaults.

### Option C-prime - Purpose-owned contracts with bounded tenant bindings

Phase 21 owns a small, code-reviewed, versioned catalog of **Phase 21 Records
Schedule Contracts**. A tenant selects a guided, effective-dated binding for the
applicable Tenant, Legal Entity, jurisdiction, and record family; the ordinary
default requires no per-record work. Each contract identifies the source-owned
purpose and authoritative typed trigger, preservation floor, privacy ceiling,
access/use restriction while retained, bounded tenant extension choices, hold
behavior, recovery/restore behavior, and the minimal separately scheduled proof
that may survive verified disposition.

The closed initial families distinguish at least:

1. immutable Field Account, close, assessment, correction, allocation,
   reservation, capacity, and opening-position financial/provenance facts;
2. expense claim, approval, obligation, payment/return, authorization, D25 case,
   and accounting-lineage facts;
3. sensitive receipt, card-statement, travel/location, opening-source, and
   provider evidence bytes plus their derivatives;
4. compensation and reimbursement handoff artifacts and exact provider
   readback, without taking payroll/AP or provider authority;
5. access, security, authorization, audit, hold, and disposition evidence; and
6. transient staging, preview, parser/OCR/AI payload, cache, and diagnostic
   material.

Phase 29 alone executes byte custody for Phase-21-owned evidence and D26 export
packages, including quarantine, holds, restricted retrieval, copy inventory,
staged verified disposal, backup suppression, and restore suppression. Phase 21
supplies the contract and record-family meaning. Phase 18, Phase 20, Phase 31,
payroll/AP, and external providers retain their own artifacts, exact bytes, and
schedule authority; Phase 21 records only exact references and cannot claim
their copies were destroyed.

Changing a schedule creates an effective-dated successor and bounded impact set,
not an in-place rewrite. Shortening enters a grace-and-reproof lane and never
mass-deletes immediately. A missing or conflicting authority produces one
grouped **Needs records review** exception with restricted use; it cannot guess
deletion or silently choose forever. Holds are scoped, monotonic protections
with an owner, basis, review date, and explicit release; a review date never
auto-releases a hold. Ordinary staff and missionaries see no retention matrix.
Permissioned records/finance staff see one plain-language "Kept for / because"
disclosure only when relevant and one grouped exception workspace.

### Recommendation

Choose **Option C-prime**. It reuses the accepted Phase 18/29 separation, gives
tenants useful bounded control without asking them to write law, and preserves
the essential distinction between durable financial provenance and sensitive
bytes that should disappear when their purpose ends. It adds one missing policy
owner, not a new records-management bounded context.

### Adversarial preview of the recommended option

| Concern                     | What could go wrong                                                                                   | Severity | Likelihood | Binding prevention                                                                                                                                                                     |
| --------------------------- | ----------------------------------------------------------------------------------------------------- | -------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| False legal certainty       | A product default is presented as universally lawful.                                                 | Critical | Medium     | Label jurisdiction and review provenance; require qualified approval for production packs; expose no legal-compliance badge.                                                           |
| Destructive schedule change | A shorter successor mass-deletes records before holds or newly discovered duties are checked.         | Critical | Medium     | Prospective/effective-dated successor, bounded impact manifest, grace, final current-contract/no-hold CAS, and verified disposal only.                                                 |
| Forever by accident         | Missing policy or conflict falls back to indefinite retention.                                        | High     | High       | Explicit `Needs records review`, restricted use, accountable due date, and no silent forever default. Preservation during review is temporary protection, not a new retention purpose. |
| Financial-history loss      | Receipt-byte disposal cascades into claim, approval, Field Account, payment, or accounting truth.     | Critical | Medium     | Separate record families and non-cascading identities; retain the minimum lawful financial/provenance spine under its own contract.                                                    |
| Privacy leakage             | Retained evidence remains broadly searchable, exportable, or usable for AI/fundraising.               | Critical | Medium     | Retention never grants access or reuse; Phase 12 purpose authorization, Phase 10 classification, private retrieval, and separate AI/communication authority still apply.               |
| Hold/disposal race          | Disposal crosses the irreversible boundary while a hold is being placed.                              | Critical | Low-Medium | Serialize hold placement/release and final disposal reproof on the same exact record guard.                                                                                            |
| Restore resurrection        | A backup brings disposed receipt or route evidence back into reads or jobs.                           | Critical | Medium     | Forward-only suppression journal must replay before application reads/workers; provider proof must state exactly what was destroyed versus suppressed.                                 |
| Tenant footgun              | Admins weaken required floors or create contradictory per-record rules.                               | Critical | Medium     | Guided default plus only contract-enumerated bounded extensions; no free-form duration, trigger, status, workflow, or direct-delete DSL.                                               |
| Operational burden          | Every record creates manual review work.                                                              | High     | Medium     | Resolve the schedule at creation, automate healthy transitions, group exceptions by cause/schedule, and keep the matrix out of ordinary UX.                                            |
| Cross-domain overreach      | Phase 21 claims deletion or retention authority over Phase 18/20/31, payroll/AP, or provider records. | Critical | Medium     | Owner-specific contracts and copy outcomes; Phase 21 can retain a reference and exact evidence state but cannot dispose or certify another owner's copy.                               |

### Founder question

Which model should Phase 21 adopt for records-schedule authority: **A, B, or the
recommended C-prime**?

## D26 selected-option adversarial review - tenant custody exports and records responsibility

**Status:** C-prime-R ratified as Phase 21 D26 on 2026-08-02. This section
records the binding adversarial review and accepted decision. Ratification does
not authorize runtime implementation or change the D1-D25 ownership contracts.

### Verdict

The founder's direction is correct after one non-negotiable correction. The
tenant may and should remain responsible for determining its own legal and
professional recordkeeping obligations and for copies it keeps outside Asym.
That responsibility cannot be used to disclaim Asym's own duties while Asym
stores, secures, processes, exports, holds, promises to retain, or promises to
delete the records. The durable boundary is a truthful allocation of
responsibility, not a liability-shifting checkbox.

Current primary sources support that split:

- The IRS requires an exempt organization to keep books and records that show
  tax compliance and substantiate receipts and expenditures. The organization
  retains that responsibility when it uses software or advisers.
  [IRS exempt-organization recordkeeping](https://www.irs.gov/charities-non-profits/eo-operational-requirements-recordkeeping-requirements-for-exempt-organizations)
- IRS Publication 463 makes expense substantiation element-specific: receipt
  bytes alone do not prove amount, time, place, business purpose, approval, or
  accountable-plan treatment. A useful export must preserve the connected
  claim and policy context, not merely images.
  [IRS Publication 463](https://www.irs.gov/publications/p463)
- The Department of Labor's record-family-specific two- and three-year examples
  show why one generic `payroll` or `financial` duration is unsafe.
  [DOL Fact Sheet 21](https://www.dol.gov/agencies/whd/fact-sheets/21-flsa-recordkeeping)
- Canadian guidance says an organization remains responsible for records kept
  by a third party and that electronic-origin records must remain complete,
  readable, and accessible electronically even when paper copies exist.
  [CRA recordkeeping responsibilities](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/keeping-records/your-responsibilities-requirements-associated-records-law-requires-you-keep.html),
  [CRA charity books-and-records webinar](https://www.canada.ca/en/revenue-agency/news/cra-multimedia-library/charities-video-gallery/webinar-books-records.html)
- Where UK GDPR processor terms apply, the contract must address return or
  deletion at the controller's choice, subject to law, and controller and
  processor responsibilities remain direct rather than disappearing through
  product copy.
  [ICO required processor-contract terms](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/contracts-and-liabilities-between-controllers-and-processors-multi/what-needs-to-be-included-in-the-contract/),
  [ICO processor responsibilities](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/contracts-and-liabilities-between-controllers-and-processors-multi/responsibilities-and-liabilities-for-processors-in-their-own-right/)
- Where the EU Data Act's data-processing-service switching provisions apply,
  the written contract must identify portable and excluded categories,
  switching behavior, and a retrieval period of at least 30 calendar days
  after the transition. Applicability to Asym's exact service and tenants is a
  qualified-counsel release question, not a product assumption.
  [EU Data Act Articles 23-26](https://eur-lex.europa.eu/eli/reg/2023/2854/oj?locale=en)
- Electronic and printed copies can be useful, but adequacy depends on accuracy,
  integrity, accessibility, reproducibility, indexing, audit trail, and the
  record-specific rule. Format alone is not certification.
  [15 U.S.C. 7001](https://www.govinfo.gov/content/pkg/USCODE-2022-title15/pdf/USCODE-2022-title15-chap96.pdf),
  [IRS Revenue Procedure 97-22](https://www.irs.gov/pub/irs-tege/rp-97-22.pdf)

The product evidence points in the same direction. Salesforce, HubSpot,
Bloomerang, QBO, and Xero all expose different export families or documented
omissions; Expensify and Concur distinguish readable reports from detailed
data and original evidence; Google and Microsoft use asynchronous, bounded,
parted downloads and explicitly separate source deletion from export or
third-party custody. Their most important lesson is negative: the word
`complete` is unsafe unless a manifest proves the requested coverage.
[Salesforce data export](https://help.salesforce.com/s/articleView?id=xcloud.admin_exportdata.htm),
[HubSpot export catalog](https://knowledge.hubspot.com/account-management/export-your-content-and-data),
[QuickBooks Online export](https://quickbooks.intuit.com/learn-support/en-us/help-article/list-management/export-reports-lists-data-quickbooks-online/L1xleDrLp_US_en_US),
[Xero accounting-data export](https://central.xero.com/s/article/Export-general-ledger-data-out-of-Xero),
[Expensify report export](https://help.expensify.com/articles/new-expensify/reports-and-expenses/How-to-Export-Reports),
[Google Takeout](https://support.google.com/accounts/answer/3024190),
[Microsoft Purview export](https://learn.microsoft.com/en-us/purview/ediscovery-download-export-jobs).

### Binding responsibility split

The hardened decision creates five independently authoritative truths:

1. **Tenant records-policy responsibility** - the tenant identifies its Legal
   Entities, jurisdictions, worker relationships, filing/audit facts, holds,
   and professional requirements; approves a supported binding; and decides
   whether and how to preserve independent paper or electronic copies.
2. **Phase 21 record meaning and schedule authority** - Phase 21 owns each
   closed record family, business purpose, typed trigger, schedule-contract
   version, tenant binding, per-record resolution, export representation, and
   financial/provenance relationships.
3. **Asym service responsibility** - Asym remains responsible for the security,
   availability commitments, faithful schedule execution, authorized export,
   holds, return/deletion behavior, subprocessor behavior, truthful notices,
   and direct legal duties applicable to copies in its custody.
4. **Tenant external custody** - after an authorized download or print, the
   tenant controls the security, validation, retention, recovery, and disposal
   of that external copy. Asym can prove the bytes it served, but not that a
   printer, drive, file cabinet, or third-party repository remains adequate.
5. **Verified destination custody transfer** - only a separately certified
   protocol with exact destination identity, manifest acceptance/readback,
   preserved restrictions and holds, and an explicit governing contract may
   prove this narrower event. A download or tenant assertion is not a transfer.

The UI may say that the tenant remains responsible for its records choices and
external copies. It must never say that Asym has no responsibility, that a
download satisfies every law, or that a tenant acknowledgement waives Asym's
own statutory or promised duties. Final wording requires qualified counsel and
must agree with the MSA, DPA, public privacy policy, subprocessor terms, and
proved operations.

### Bounded schedule contract

Phase 21 adopts the Phase 18/ADR-0038 pattern rather than creating another
retention engine. Its closed semantic model contains:

- an immutable, code-owned, source-cited **Phase 21 Records Schedule Contract
  Version** for one record family and purpose;
- an immutable, prospective **Phase 21 Records Schedule Binding Version** for
  one Tenant, Legal Entity, supported jurisdiction, record family, and only the
  relationship or source-family dimensions that materially change the rule;
- an immutable **Phase 21 Record Retention Resolution** binding each record to
  the exact winning contract, tenant binding, trigger facts, dates, access/use
  restrictions, hold state, and projected disposition; and
- an immutable **Records Schedule Successor Impact Manifest** for a reviewed
  law, policy, provider, or product change.

The tenant receives one qualified, quiet default. It may choose only supported,
contract-enumerated alternatives or lawful bounded extensions. It cannot write
predicates, timers, formulas, scripts, `delete now`, or `keep forever`; weaken a
mandatory floor; or exceed a privacy ceiling without a separately reviewed
lawful purpose. Missing, stale, or conflicting authority becomes one grouped
**Needs records review** case with restricted use and an accountable owner. It
does not guess deletion or silently create a permanent purpose.

The initial closed families remain:

1. Field Account, allocation, assessment, organization-cost, reallocation,
   reservation, capacity, Support Cycle close, statement, correction, Opening
   Position, and cutover financial/provenance facts;
2. Expense Claim, version, item, split, policy result, review, decision,
   authorization, obligation, payment/return, advance, D25 case, and accounting
   lineage facts;
3. receipt, card-statement, travel/location, opening-source, and provider
   evidence bytes and their derivatives;
4. compensation, reimbursement, and accounting handoff artifacts plus exact
   provider readback/reference evidence;
5. authorization, collaboration, access, security, audit, hold, export, and
   disposition evidence; and
6. transient staging, preview, parser/OCR/AI input and derivative, cache,
   package-staging, and diagnostic material.

Phase 29 alone owns generic byte identity, private storage and retrieval for
Phase-21-owned evidence and D26 export packages, malware hygiene, copy inventory,
quarantine, hold execution, staged verified disposition, backup suppression, and
restore suppression. Phase 21 sends typed owner-authorized commands and never
edits storage directly. Independently owned artifacts, including Phase 18
generated documents, retain owner-domain exact-byte and lifecycle authority.
Phase 3 owns the
exportable projection and CSV-safe serialization; Phases 10 and 12 own
classification, restricted-person safety, purpose, capability, Legal Entity,
and every egress decision. Phase 30 remains inbound migration only. A future
direct external-storage adapter, if justified, uses the Phase 31 connector
spine and cannot replace the complete browser-download lane. Phase 38's privacy
and data-subject tooling remains the owner of a person's access, portability,
or erasure request; a tenant business-record archive cannot be reused as an
unredacted donor or missionary response.

### Records Export Package contract

Every authorized tenant can repeatedly obtain current Phase 21 records while
those records remain lawfully retained and accessible. Four clearly different
actions reuse one package compiler without pretending to be the same product:

1. **Export this view** - a filtered analysis snapshot, labelled `Not a complete
records archive`.
2. **Download record copy** - an accessible PDF/print view, exact manifest, and
   authorized originals for one claim, statement, package, or other record.
3. **Create Phase 21 records archive** - a manifest-complete portable package
   for a selected Legal Entity, family set, subject/account scope, and exact
   half-open period or source/version watermark.
4. **Prepare final offboarding archive** - the same package contract plus an
   exact service cut, final monotonic delta or quiescent cut, contract-defined
   records-only retrieval window, holds/exceptions, and truthful later
   disposition behavior.

A tenant-wide request remains one staff action but fans out into separately
sealed Legal-Entity packages under one tenant index. It never blends Legal
Entities merely for convenience. Restricted-person records use the existing
exact subject-scoped, clearance-, purpose-, step-up-, rate-, and audit-gated
lane; the ordinary archive receives a safe manifest disposition rather than a
bulk-exfiltration bypass.

Each immutable **Phase 21 Records Export Package** binds the Tenant, one Legal
Entity, requester and actual principal, export purpose, current authorization
epochs, exact families and optional subject/account scope, half-open time or
version boundary, source watermark for each family, ISO currency on every
amount, controlling schedule/binding versions, schema/compiler version,
strictest classification, ordered parts, digest, and distinct preparation,
availability, download, expiry, external-attestation, transfer, and
package-byte-disposition events.

Its **Records Export Coverage Manifest** gives every requested record/version
exactly one safe disposition:

- `included_exact`;
- `included_human_readable_projection`, linked to its exact source;
- `owner_domain_reference` for Phase 18, Phase 20, Phase 31, payroll/AP,
  QBO/Xero, or provider truth Phase 21 does not own;
- `excluded_by_current_authority`;
- `restricted_separate_package_required`;
- `already_lawfully_disposed`, with a PII-light disposition reference;
- `quarantined_or_unavailable`, with a safe reason and recovery owner; or
- `not_applicable`.

`Ready` means all requested coverage is closed. `Ready with issues` is
downloadable but is never called complete; it exposes exact missing coverage
and can produce an append-only residual package. `Failed` means no committed
package exists. A new package never mutates or deletes an earlier package.

The provider-neutral package includes:

- canonical versioned UTF-8 JSON Lines for exact typed values, relationships,
  versions, provenance, integer minor units, ISO currencies, and timestamps;
- bounded spreadsheet-safe CSV convenience views through the Phase 3
  serializer, never the sole lossless form;
- exact authorized original bytes plus separately labelled display/OCR/AI
  derivatives and their transformation provenance;
- accessible PDF/HTML indexes and print views with package ID, page/record
  identity, scope, through-date, currencies, correction state, and omissions;
- the applicable Phase 21 schedule contracts, tenant binding versions,
  activation/change evidence, qualified-review dates, and source citations in
  exact machine-readable and plain-language forms;
- owner-supplied references or authorized copies of the service terms/DPA and
  other externally owned agreements applicable to the interval, without making
  Phase 21 their semantic owner;
- a README, versioned schema, part/file byte counts, media types, row counts,
  and SHA-256 digests; and
- explicit exclusions, errors, disposed records, provider-only references,
  and later residual-package links.

The package uses safe opaque paths. User filenames appear only as manifest
metadata. It never contains raw database dumps, secrets, API keys, OAuth grants,
service-role identifiers, reusable signed URLs, provider credentials, internal
exploit telemetry, or unprojected third-party data. Quarantined malicious bytes
are not placed in the ordinary archive. This is a complete Phase 21 archive,
not a universal tenant database export, a QBO/Xero company backup, or a payroll
provider backup. A later tenant-wide offboarding orchestrator must compose
owner-domain packages and manifests rather than making Phase 21 query or claim
their truth.

Printing is fully supported, but a print pack is labelled as a readable filing
copy rather than a complete digital archive. Paper may omit native metadata,
relationships, signatures, or electronic-origin requirements. Print telemetry
proves only that Asym rendered or served bytes, never that paper exists or was
preserved.

### Fulfillment, offboarding, and custody truth

Package generation is asynchronous, bounded, resumable, tenant-fair, and
streaming. It uses immutable per-family watermarks, keyset enumeration,
deterministic ordered parts, independent hashes, and narrow serialization
guards rather than one live query, giant transaction, or in-memory ZIP. Users
may leave the page. Notifications contain no sensitive attachment and link to
an authenticated surface.

The ordinary staged package has a quiet seven-day default download window; a
tenant security administrator may select once, not per export, from the bounded
24-hour, three-day, seven-day, or fourteen-day choices. Downloads are
repeatable and individually audited during that window. Expiry disposes only
the temporary package bytes under their own schedule; the source records keep
their independent schedule and a new package can be generated from whatever
records still exist. Execution may be rate- and concurrency-controlled for
tenant fairness, but record access is not artificially metered.

Final offboarding uses a contract-defined records-only retrieval window and a
thirty-day minimum wherever the EU Data Act applies, or any longer period
required by law or the tenant contract. Service termination, ordinary app
access, export completion, retrieval-window expiry, active-copy disposition,
backup suppression/expiry, provider-copy outcome, and minimal surviving proof
remain separate facts. General cancellation does not wait for an unverifiable
claim that the tenant saved a copy; an independently applicable source-specific
closure gate, such as Phase 18's activated Canadian issuer rule, still controls
its own scope.

The universal delivery lane is current-authorized browser download with
reauthentication, step-up for full or sensitive scope, no-store responses, and
short-lived audience-bound retrieval. Email never carries the package or a
reusable bearer URL. An optional **Record external copy** action stores only an
attributable tenant assertion against the exact manifest and a safe destination
class such as paper, offline storage, or tenant-managed cloud. It does not mean
`backup_verified`, `legal_requirements_met`, `custody_transferred`, or
`safe_to_delete`.

A later Phase 31 destination adapter is optional, provider-capability-labelled,
and separately certified for narrow credentials, tenant-owned destination
identity, create-only immutable paths, staging, exact byte-count/hash readback,
manifest-last commit, ambiguous inspect-before-retry recovery, and truthful
drift. Manual download always remains complete. Provider acceptance proves only
the bytes accepted/read back at that time, not the destination's future
security, retention, recovery, or legal sufficiency.

### UX/UI contract

Ordinary missionaries and staff see no retention matrix, legal-rule builder,
backup dashboard, provider credentials, or disposal queue. Where useful, a
quiet **Records and privacy** disclosure on a record answers:

- **Kept because:** the plain-language purpose;
- **Schedule:** the organization policy/version;
- **Starts from:** the authoritative trigger;
- **Review or disposal:** the through-date or event, subject to holds; and
- **Download a copy:** only within the viewer's current record authority.

Records and finance administrators use one `Settings -> Records & exports`
surface:

1. **Overview** - current recommended approach, Legal Entities and supported
   jurisdictions, active versions, last qualified review, and a short truthful
   responsibility split;
2. **Records policy** - practical family cards showing why records are kept,
   when counting starts, the supported default, permitted bounded alternatives,
   and an impact preview; advanced evidence remains collapsed;
3. **Download a copy** - contextual record copy, period/account export, or one
   complete Phase 21 archive action; and
4. **Needs attention** - only stale/missing authority, schedule conflict, hold,
   failed coverage, expiring offboarding window, or destination failure.

The archive flow has four steps: choose scope; review exact coverage, size,
currencies, originals, restricted lanes, and omissions; prepare asynchronously;
then download/print or optionally record external custody. Routine export has
no repeated legal attestation. A single high-salience acknowledgement appears
only when activating the records-policy binding or at a destructive
offboarding decision. It is educational evidence, not a waiver.

The UI uses `Recommended configuration`, not `Legally compliant`; `Ready to
download`, not `Safely archived`; `Downloaded`, not `Transferred`; and
copy-specific outcomes such as `active copy disposed`, `backup beyond use`,
`provider deletion requested`, `provider confirmed deletion`, or `outcome
unknown`, never `Deleted everywhere` without exact proof.

Accessibility and comprehension are release criteria: full keyboard use,
screen-reader names and live job updates, non-color-only states, clear focus
after asynchronous changes, 320-pixel reflow, 200% and 400% zoom, reduced
motion, resumable low-bandwidth downloads, localization-safe dates/currencies,
and representative nonprofit staff testing that proves users can distinguish a
view export, readable copy, complete archive, external copy, and verified
transfer.

### Ruthless adversarial review

| Category                          | Concern? | What could go wrong and why it matters                                                                                                                                                                                                                                            | Severity | Likelihood  | Best permanent fix or prevention                                                                                                                                                                                                             |
| --------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | Yes      | A fixed period, mutable `expires_at`, one live query, or one giant ZIP assumes one jurisdiction, trigger, copy class, provider, file size, and uninterrupted job. A changed law or large tenant then causes early destruction or incomplete offboarding.                          | Critical | High        | Versioned family contracts and bindings; typed triggers; immutable per-family watermarks; chunked/resumable packages; effective-dated successors; final CAS before irreversible disposal or package commit.                                  |
| Technical debt                    | Yes      | Phase 21 could copy Phase 18/Eve retention code, the synchronous CRM CSV route, or one serializer per D1-D25 family. Policies, exports, holds, and deletion would drift.                                                                                                          | Critical | High        | One owner-qualified schedule pattern, one Phase 29 execution port, one Phase 3 egress resolver, one canonical package compiler/manifest, and release-time legal/runtime congruency tests.                                                    |
| Edge cases                        | Yes      | Multiple Legal Entities/currencies, holds, worker reclassification, death/offboarding, restricted workers, late corrections, disposed originals, quarantined bytes, provider-only records, corrupt packages, long downloads, and restored backups all break a happy-path archive. | Critical | High        | Per-entity sealed packages under one request; exact currencies/watermarks; complete dispositions; scoped holds; subject-protected lanes; residual packages; restore suppression; explicit unavailable/reference states.                      |
| Footguns                          | Yes      | An admin selects `forever`, `delete now`, treats download as transfer, clicks `stored elsewhere` to trigger deletion, emails a ZIP, or assumes PDF is the complete electronic record.                                                                                             | Critical | High        | Closed choices; no free-form timers/direct delete; export never changes retention; custody assertion non-authoritative; no email attachments/public URLs; prominent representation and custody labels.                                       |
| Tenant safety                     | Yes      | Enumeration, counts, caches, package names, job rows, manifests, or download links cross Tenant, Legal Entity, subject, or restricted-person boundaries.                                                                                                                          | Critical | Medium-high | Structurally complete same-scope keys and RLS; Phase 12 checks before enumeration, seal, and every download; opaque paths; uniform denial; hostile-substitution tests for every package part.                                                |
| Over-engineering                  | Yes      | Asym becomes a legal-rules DSL, eDiscovery suite, records archive vendor, WORM system, or connector marketplace.                                                                                                                                                                  | High     | High        | Six closed families, reviewed packs, bounded choices, one records page, one package compiler, Phase 29 execution, browser download always, and optional Phase 31 adapters only after need and certification.                                 |
| UX/UI and user friction           | Yes      | Legal jargon, matrices, repeated attestations, too many formats, or noisy expiration tasks overwhelm small nonprofit finance teams; vague `backup` labels create false confidence.                                                                                                | High     | High        | Quiet default; plain `kept because / starts from`; progressive details; four-step archive; recommended bundle; grouped exceptions; contextual education and comprehension testing.                                                           |
| Hidden coupling                   | Yes      | Download becomes disposal authority; accounting/payment state decides retention; Phase 29 invents purpose; Phase 21 exports or destroys Phase 18/20/31/provider truth; Phase 30 is misused for outbound transfer; policy copy contradicts runtime.                                | Critical | High        | Independent immutable authorities; owner-domain references; typed Phase 29 commands; Phase 30 inbound-only; Phase 31 optional; MSA/DPA/public-policy/runtime release gate; no cross-owner cascade.                                           |
| Failure modes                     | Yes      | Worker crash, lost response, partial part upload, corrupt ZIP, expired auth, interrupted download, provider timeout, hold race, or backup restore produces false success or data resurrection.                                                                                    | Critical | High        | Durable package aggregate; semantic idempotency; ordered parts; hash/readback; inspect-before-retry; authorization at retrieval; hold/disposal serialization; explicit partial/unknown states; suppression replay.                           |
| Data integrity risks              | Yes      | CSV loses versions, leading zeros, currencies, time zones, relationships, original bytes, or correction lineage; concurrent changes create gaps or duplicates.                                                                                                                    | Critical | High        | Canonical versioned JSONL plus safe CSV; stable IDs; integer minor units and ISO currency; exact dates/zones; source/correction links; immutable cut; closed manifest; independent verifier fixtures.                                        |
| Security and privacy risks        | Yes      | A records package concentrates receipts, addresses, travel/location, payroll, card fragments, restricted identities, and audit history; links, filenames, logs, browser caches, printers, or external storage leak it.                                                            | Critical | High        | Strictest included classification; least privilege and step-up; private encrypted staging; no-store authenticated streaming; opaque names; PII-minimized logs/notifications; short staging; separate restricted packages and download audit. |
| Scalability and performance risks | Yes      | Synchronous joins, full-history replay, large in-memory archives, global locks, or unlimited concurrent hashing starve finance work and fail on years of evidence.                                                                                                                | High     | High        | Incremental immutable projections; keyset enumeration; streaming digests; deterministic bounded parts; narrow locks; tenant fairness/backpressure; certified high-volume/file-count/download-resume tests.                                   |
| Operational burden                | Yes      | Every record requires staff configuration, every expiry creates a task, law changes require manual row edits, and failed exports need developers.                                                                                                                                 | High     | High        | Resolve at creation; configure once per supported scope; healthy automation; grouped cause-owned exceptions; automated impact manifests; self-service regeneration/residuals; named review owner and runbooks.                               |
| Observability gaps                | Yes      | Operators cannot distinguish stale policy, permission denial, missing source, corrupt part, provider outage, stuck disposal, failed backup suppression, or tenant-side download loss.                                                                                             | Critical | Medium-high | PII-minimized correlation across contract/binding/resolution/package/part; coverage/control-total metrics; cause-specific SLOs and alerts; package timeline; exact owner and next action; restore/provider-copy drills.                      |
| Dependency and integration risks  | Yes      | Storage, backup, malware, compression/PDF, OCR/AI, QBO/Xero/payroll/AP, browser, or destination providers retain copies or change limits and APIs.                                                                                                                                | Critical | High        | Copy inventory; capability-labelled adapters; version pinning/readback; subprocessor review; artifact-always manual lane; owner-specific outcomes; never infer remote deletion or portability from a logo/API response.                      |
| Migration and upgrade risks       | Yes      | Proprietary formats, mutable schemas, missing decoders, enum reinterpretation, or lost source IDs/policy history make old packages unreadable or unverifiable.                                                                                                                    | Critical | Medium-high | Open documented formats; immutable schema registry; old readers and compatibility fixtures; stable IDs; native bytes; migration manifests; evidence-strength labels for legacy data; periodic restore/export drills.                         |
| Other development hazards         | Yes      | TOCTOU authorization, export/disposal races, ZIP traversal/bombs, formula injection, predictable keys, duplicate jobs, time-zone errors, unclear legal owner, or test-only `complete` states escape review.                                                                       | Critical | High        | Commit-time PDP/CAS; safe generated paths; part/content bounds; shared `csvSafeCell`; semantic idempotency; UTC typed triggers plus civil-time evidence; explicit owners; kill switches; security/fault/chaos tests.                         |

### Ruthless synthesis - the only coherent build order

1. **Reconcile the legal and product contract first.** Qualified counsel and
   records/privacy/security owners must reconcile each launch jurisdiction pack,
   the MSA/DPA, `apps/donor/openpolicy.ts`, its evidence map, provider and backup
   behavior, and the actual service commitment. The current fixed public
   periods cannot coexist silently with contradictory tenant settings or
   unproved cleanup jobs.
2. **Freeze ownership and vocabulary.** Generalize the ADR-0038 pattern without
   duplicating its engine: Phase 21 owns purpose/family/schedule/binding/
   resolution/export meaning; Phase 29 owns byte lifecycle execution for Phase-
   21-owned evidence and D26 export packages; independently owned artifacts keep
   their owner-domain byte and lifecycle authority; Phases 3/10/12 own egress;
   Phase 30 stays inbound; Phase 31 owns any later connector transport.
3. **Implement and prove the closed schedule resolver before disposal.** Ship
   reviewed contract packs, deterministic non-stacking resolution, immutable
   trigger coverage, monotonic holds, prospective successors, impact manifests,
   and conflict-to-review. No irreversible disposal launches from defaults
   alone.
4. **Build the exact package compiler and verifier.** Use per-family snapshot
   watermarks, an allowlisted schema, manifest conservation, exact originals,
   JSONL, safe CSV, accessible PDF/HTML, checksums, ordered parts, residual
   recovery, and independent verification. Existing report CSV endpoints are
   convenience exports, not this seam.
5. **Add Phase 29 secure fulfillment and disposal.** Private encrypted staging,
   reauthorization, step-up, no-store streaming, resume, short package life,
   copy inventory, holds, truthful provider outcomes, and restore suppression
   must pass production-shaped failure and scale tests.
6. **Ship the quiet records UX.** One guided default, one `Records & exports`
   surface, contextual copy/print, one complete archive action, grouped
   exceptions, plain custody language, and no ordinary missionary noise. Test
   comprehension and WCAG 2.2 AA behavior with representative nonprofit staff.
7. **Prove offboarding end to end.** Exercise a large multi-entity,
   multi-currency tenant; snapshot plus final delta; actor succession; 30-day
   minimum retrieval where applicable; holds; restricted records; expired
   package regeneration; active/backup/provider outcomes; and suppression
   before restore reads.
8. **Only then certify optional destinations.** Browser download and print are
   fully functional without connectors. A Phase 31 destination adapter ships
   only after exact identity, least-privilege authorization, write/readback,
   ambiguity-safe retry, drift, revocation, residency, and exit behavior pass.

### Production proof required

- Every Phase 21 record and derivative resolves to exactly one closed family
  and one schedule result or one visible review exception.
- Every export selection item receives exactly one manifest disposition;
  relationships close; counts, bytes, hashes, and per-currency controls
  reconcile; an independent reader validates every supported schema generation.
- Negative tests cover Tenant, Legal Entity, person/account, family, restricted
  worker, contract, binding, package, part, destination, cache, audit, service-
  role, table-owner, and `BYPASSRLS` substitution.
- Concurrent binding/successor/export/hold/disposal/download races preserve
  exact history and never cross an irreversible boundary on stale authority.
- Fault tests cover duplicate requests, lost responses, worker replay, partial
  part upload, corrupt bytes, storage/provider outage, expired authority,
  interrupted download, destination ambiguity, and restore resurrection.
- Security tests cover archive path traversal/collision, ZIP bombs, spreadsheet
  formula injection, secret leakage, malware/quarantine, browser/proxy caching,
  signed-link forwarding, PII-rich telemetry, and package-byte expiry.
- Product testing proves staff can distinguish current-view export, readable
  copy, complete archive, external-copy assertion, verified transfer, source
  retention, and disposal without support intervention.
- Legal, privacy, security, support, sales, MSA/DPA, public-policy, provider,
  backup, and runtime claims agree before production activation. A disclaimer
  or tenant checkbox cannot make a failed congruency gate pass.

### Ratified C-prime-R formulation

> **C-prime-amended-and-hardened (C-prime-R) - one source-purpose-,
> record-family-, jurisdiction-, Legal-Entity-, and relationship-where-material-
> owned catalog of immutable, qualified-review-backed Phase 21 Records Schedule
> Contracts with one quiet safe default and only bounded prospective tenant
> bindings; exact typed triggers, preservation floors, privacy ceilings,
> access/use limits, copy classes, holds, recovery, export, and verified-
> disposition semantics; immutable per-record resolutions and complete successor
> impact coverage; and Phase-29-only private-byte custody for Phase-21-owned
> evidence and D26 export packages, including copy inventory, package staging,
> hold/disposal execution, backup and restore suppression, and authorized
> delivery under Phase 3/10/12 egress authority. Independently owned artifacts,
> including Phase 18 generated documents, retain their owner-domain exact-byte
> and lifecycle authority and enter D26 only by authorized reference or
> retrieval. Every currently
> authorized tenant can repeatedly export exact Phase 21 records and policy
> history as contextual human/print copies or one source-watermarked,
> manifest-complete, open-format Records Export Package per Legal Entity, with a
> one-action tenant-wide fan-out, canonical JSONL, bounded spreadsheet-safe CSV,
> accessible PDF/HTML, authorized original artifacts, exact relationships,
> applicable contract/binding and service-document versions, ordered verifiable
> parts, integrity digests, truthful omissions and owner-domain references,
> append-only residual recovery, a short governed repeatable-download window,
> and a separately governed final offboarding snapshot-plus-delta and records-
> only retrieval window. Download, print, tenant external-copy assertion,
> verified destination custody transfer, Asym-held retention, legal hold,
> termination, and copy-specific disposal remain independently authoritative:
> none implies another, changes a source schedule, releases a hold, or proves
> legal sufficiency. The tenant remains responsible for determining its
> applicable organizational obligations and securing, validating, retaining,
> recovering, and disposing copies in its custody; Asym remains responsible for
> its actual statutory, contractual, security, processor/service-provider,
> export-fidelity, hold, return, deletion, backup, provider-copy, and published
> commitments for copies in its custody. Guidance is source-linked,
> jurisdiction-labelled, review-dated, and explicitly informational, with no
> compliance warranty, individualized legal advice, liability-shifting checkbox,
> tenant-authored legal DSL, arbitrary timer, casual forever, floor weakening,
> unsupported privacy-ceiling breach, direct delete, download-as-transfer,
> export-triggered disposal, paper-as-universal-original claim, silent partial
> package, proprietary hostage format, generic database dump, reusable evidence
> URL, email attachment, broad restricted-person export, cross-owner deletion or
> universal-history claim, giant transaction/archive, Phase 30 export ownership,
> launch-time connector sprawl, restore resurrection, or disclaimer purporting
> to erase Asym's own duties.**

### Founder ratification request (resolved)

The founder was asked to ratify the hardened C-prime-R above and did so as
**Phase 21 D26** on 2026-08-02.

### D26 ratification and congruency disposition

The founder ratified the hardened C-prime-R above as **Phase 21 D26** on
2026-08-02. D26 preserves D1-D25 and closes the Phase 21 records-policy and
tenant-custody-export seam without turning Phase 21 into a storage engine,
legal-advice product, records-management suite, generic database exporter, or
connector marketplace.

The binding ownership split is:

- Phase 21 owns each Phase 21 record family's business purpose, schedule
  contract and binding, immutable retention resolution, successor-impact
  coverage, export selection meaning, package schema, coverage manifest, and
  truthful omission/reference semantics;
- Phase 29 alone owns the physical lifecycle of Phase-21-owned evidence and D26
  export package bytes: copy inventory, scan/quarantine, package staging,
  authorized delivery, holds, disposal execution, provider-copy outcomes,
  backup treatment, and restore suppression; independently owned artifacts,
  including Phase 18 generated documents, retain owner-domain exact-byte and
  lifecycle authority;
- Phases 3, 10, and 12 own governed projection, classification, authorization,
  restricted-subject handling, step-up, and egress decisions;
- Phase 30 remains inbound migration and import transport only;
- Phase 31 owns any later certified external-destination adapter; browser
  download and print remain the complete launch path; and
- Phase 38 owns data-subject access, correction, restriction, erasure, and
  related privacy-request orchestration rather than reusing a D26 tenant
  records archive as a DSAR response.

Production activation remains proof-gated on qualified legal, privacy,
security, product, provider, backup, and runtime congruency. In particular,
the fixed public periods in `apps/donor/openpolicy.ts`, the MSA/DPA and service
commitments, actual lifecycle jobs, storage/provider behavior, and tenant
choices must agree before any D26 setting or disposal action is presented as
effective. Ratification authorizes documentation and later implementation of
the contract; it does not claim that those runtime controls already exist.

## D27 decision research - Production activation and safe live containment

**Status:** Ratified as Phase 21 D27 on 2026-08-02. The original options and
pre-ratification analysis remain below as decision history. D27 does not reopen
D1-D26, authorize implementation, create a Phase 21 PRD/OpenSpec/ticket set, or
claim that a Phase 21 runtime exists.

### Why this is the next unresolved seam

D1-D26 define the financial, policy, access, provider, statement, expense,
opening-position, records, and correction truths. They do not yet define one
thin production authority that distinguishes shipped code, production-
certified release evidence, tenant configuration, synthetic or provider-
sandbox testing, production shadow results, finance authorization, live Field
Account truth, optional publication/provider/accounting lanes, current health,
and safe post-live containment.

This is the original Phase 21 rollout gap: dark launch, shadow balances,
finance sign-off, a missionary pilot, accounting tie-out where enabled, tenant
activation, and recovery. D17 already owns the exact Opening Position and
Operational Cutover; D11 owns integrity and close proof. The next contract must
reference those immutable proofs rather than duplicate, waive, or recalculate
them.

Current primary guidance supports that separation:

- [Google SRE canary guidance](https://sre.google/workbook/canarying-releases/)
  treats a canary as bounded exposure plus explicit evaluation, calls for
  attributable metrics, and notes that asynchronous rollout duration must
  match the work unit. For financial facts, the safe unit is a complete cohort
  and atomic group, never a random percentage of rows.
- [Supabase's production checklist](https://supabase.com/docs/guides/deployment/going-into-prod)
  separates security/RLS, deployment, load, availability, and recovery. A
  reachable database or green migration cannot prove Phase 21 authorization,
  object storage, capacity, or restore readiness.
- [SAP Concur's Production Sandbox Environment](https://help.sap.com/docs/SAP_CONCUR/c5d6d15e7ecb4b4d8238b383d59ac2f4/b10464422ebc4b87ab8f2f34736568e6.html)
  separates configuration testing and training from deployment to a live
  entity and documents important functions that remain unavailable in the
  sandbox. Test success therefore cannot become live financial authority.
- [Modern Treasury's ledger guarantees](https://docs.moderntreasury.com/ledgers/docs/ledgers-guarantees)
  emphasize idempotency and atomic writes; its related transaction guidance
  keeps posted financial truth immutable. After authoritative posting, safe
  recovery constrains future behavior and appends corrections rather than
  destructively rolling back history.

### Concrete scenario

Hope Mission has 350 Support Assignments. It wants to begin with one U.S. Legal
Entity and USD support balances. It will add expenses later, use Gusto only for
eligible U.S. employees, and defer its external support feed. The D17 opening-
position shadow finds seven mapping exceptions and one stale assessment-profile
version.

A tenant-wide switch either blocks the useful USD launch on irrelevant optional
modules or exposes unfinished behavior with one enormous blast radius. A field
of unrelated feature flags could publish missionary balances before the
opening cutover and first close, call providers from shadow mode, or create
contradictory meanings of **Live**. A scoped production contract can keep the
complete USD cohort non-authoritative until its exact differences are resolved,
activate through D17, prove the first D11 close, and then separately authorize a
named D9/D12 missionary pilot. CAD, expenses, Gusto execution, accounting
delivery, and the external feed remain absent or independently gated rather
than blocking the selected core.

### Option A - one all-or-nothing Phase 21 launch

One tenant-wide switch activates Core Field Accounts and every optional Phase
21 capability after one checklist.

**Benefit:** the visible state model appears simple.

**Permanent problem:** it forces small tenants to configure unused features,
couples unrelated providers and later-phase dependencies, cannot express Legal
Entity/currency/source-specific readiness, and creates a tenant-wide financial
blast radius.

### Option B - independent feature flags everywhere

Every support, expense, statement, feed, AI, provider, currency, and export
capability receives an independent administrator toggle.

**Benefit:** maximum apparent tenant flexibility.

**Permanent problem:** finance staff inherit a hidden dependency graph,
unsupported combinations multiply, several screens can make contradictory
**Live** claims, and safe recovery depends on tribal knowledge and permanent
flag debt.

### Option C-prime - one evidence-gated Core Field Accounts production activation with proof-gated optional capability bindings - Recommended

Use one quiet guided Core Field Accounts adoption path for an exact, complete
Tenant × Legal Entity × ISO-currency × Support Assignment/source cohort.
Optional capabilities remain absent until the tenant selects them and their
already-ratified proof passes. The thin composition contract contains:

1. an immutable **Phase 21 Release Generation** proving the deployed code,
   schema, conformance, security, workload, accessibility, observability, and
   recovery evidence;
2. a prospective **Field Accounts Adoption Plan Version** recording the core
   cohort and only tenant-selected optional capabilities, without a tenant-
   authored dependency graph;
3. one machine-prepared **Field Accounts Go-Live Readiness Manifest** that
   references—never recreates—every applicable D1-D26 authority, D17 cutover,
   D11 integrity evidence, Phase 12 authorization, source readiness, qualified-
   review evidence, storage/records dependency, owner, code/schema generation,
   and exact prospective boundary;
4. synthetic demonstration followed by a production-authorized, complete-
   cohort, non-authoritative shadow that is provably side-effect-dark: no Field
   Account occurrence/balance, reservation, obligation, statement, message,
   provider write, Phase 20 release, or external feed;
5. one short exception-first finance consequence review showing scope,
   through-boundary, totals, differences, unresolved exceptions, what becomes
   visible/executable, and what remains off;
6. one current-authority CAS go-live coordinated with D17 rather than a second
   cutover, then exact first D11 close, balance/control, access, workload,
   publication-preview, and optional accounting-handoff checks;
7. independent proof-gated bindings for publication, expenses, cards, travel,
   tenant AI, compensation/provider delivery, external feeds, accounting
   handoff, later currencies, and other selected advanced capabilities; and
8. one derived, through-dated **Operational Readiness Projection** that stays
   quiet while healthy and exposes only the affected cause, owner, evidence
   age, user impact, and next safe action when proof drifts.

Financial pilots use complete cohorts and preserve every split, reallocation
pair, correction family, currency manifest, and Support Cycle. They never
randomly sample rows. A named missionary pilot is explicit D19 membership plus
Phase 12 authorization, not an inferred spouse/team relationship or deployment
allowlist.

### Protective suspension, not destructive rollback

After authoritative posting there is no **Undo launch**. A cause-owned
protective suspension:

- stops only new affected positive or discretionary admission, publication,
  invitation, or executable delivery;
- preserves immutable history, authorized records access/export, already-
  established obligations, mandatory refunds/adverse corrections, exact repair
  paths, and artifact/manual continuity;
- contains the smallest proved Tenant × Legal Entity × purpose × account ×
  currency × source/capability scope;
- keeps every source owner responsible for its append-only correction;
- uses an incident-wide platform kill switch only for an actual shared-system
  hazard; and
- reactivates prospectively only after current evidence is re-proved.

Literal UI actions such as **Pause new Stripe support**, **Hide new
statements**, or **Stop payroll draft delivery** include a consequence preview.
**Turn off Field Accounts**, **Roll back**, and **All clear** are prohibited
because they overstate scope and effect.

### Quiet UX/UI contract

One **Set up Field Accounts** journey has four calm sections:

1. **Your setup** - Legal Entity, currency, support sources, expense use, and
   only relevant optional capabilities;
2. **Checks** - grouped as **Asym checks automatically**, **Your
   organization**, and **Qualified review**, with healthy checks collapsed;
3. **Try and compare** - visibly separate **Try with sample data** from
   **Check against your real records**; and
4. **Review and go live** - exact cohort and boundary, unresolved differences,
   visibility/delivery consequences, accountable finance approver, and planned
   activation.

The UI uses **Ready for finance review**, **3 items need your organization**,
**Asym is preparing secure receipt storage**, **Live - verification in
progress**, and **Live for USD support through 31 July 2026**. It never uses
**Certified compliant**, **Everything connected**, **Ready for payroll**, or
one misleading percentage-complete score. Staff approve one consequence
summary, not 26 checklists or every close. Missionaries see only their ordinary
production-shaped experience and a quiet pilot label with an exact through-
date; they never see activation machinery or an availability/payment promise.

WCAG 2.2 AA, keyboard/screen-reader completion, non-color state, announced
asynchronous progress without focus theft, 320-pixel reflow, 200%/400% zoom,
resumable long comparisons, slow-network truth, and stale-manifest conflict
recovery are release requirements.

### Initial adversarial pressure test

| Concern              | Failure                                                                                              | Severity / likelihood  | Permanent prevention                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------- |
| Big-bang brittleness | One irrelevant optional adapter blocks or corrupts the whole tenant launch.                          | Critical / High        | Exact core cohorts and separately proof-gated optional bindings; no global mutable enable bit.    |
| Toggle footgun       | Staff enable effects whose prerequisites, policy, or owner are missing.                              | Critical / High        | Server-derived closed dependencies, manifest reproof, and literal consequence preview.            |
| Fake shadow          | Shadow work writes postings, reservations, statements, messages, or providers.                       | Critical / Medium-high | Side-effect-dark ports and negative authority tests for every output.                             |
| Incomplete canary    | A percentage sample splits an allocation, correction, reallocation, currency, or close group.        | Critical / High        | Complete-cohort and atomic-group closure; never sample financial rows.                            |
| Stale approval       | Config, source, permissions, reviewer evidence, provider capability, or code changes after review.   | Critical / High        | Immutable pins, freshness/epoch rules, final CAS, and bounded impact re-review.                   |
| False compliance     | **Reviewed** or **Live** is presented as legal, tax, payroll, GAAP, or audit approval.               | Critical / High        | Scoped evidence and limited claims; no Asym compliance badge.                                     |
| Destructive rollback | A switch erases history, obligations, or mandatory adverse corrections.                              | Critical / Medium-high | Asymmetric smallest-scope suspension and append-only owner repair.                                |
| Tenant leakage       | Preview, pilot, counts, jobs, or readiness caches cross scope.                                       | Critical / Medium-high | Structurally complete keys, Phase 12 before enumeration/commit, RLS and substitution/cache tests. |
| UX bureaucracy       | Staff repeatedly attest to machine-checkable facts across dozens of gates.                           | High / High            | One guided surface, automatic proof, relevant capabilities only, and exception-first review.      |
| Recovery theatre     | Database backup exists but Storage, policy, queues, secrets, or suppression evidence cannot recover. | Critical / Medium      | Production restore drills covering database and non-database dependencies.                        |
| Provider ambiguity   | First live delivery times out after a remote write and retry duplicates it.                          | Critical / Medium-high | Existing inspect-before-retry operation identity, quarantine, and artifact continuity.            |
| Scale failure        | Shadow or first close overloads hot accounts and misses finance cadence.                             | Critical / Medium-high | Production-shaped cardinality, hot-account strategy, tenant fairness, and first-close SLO.        |

### Recommendation

Choose **Option C-prime**. It is the only option that gives small tenants a
quiet core path, complex tenants bounded optional flexibility, finance an exact
go-live consequence, engineers an auditable authority boundary, and operations
safe containment without duplicating D1-D26 or inventing a release-management
platform. D17 remains the sole opening cutover and D11 remains the sole close/
integrity proof; the new manifest is a referential composition, not another
financial calculation or manual certification.

### Founder question

A mission has configured Field Accounts, shadow-reconciled its opening
position, selected one Legal Entity/currency pilot, and left several optional
modules for later. How should Asym decide exactly what may become authoritative
and safely stop new affected work if the first live close exposes a serious
problem: **Option A, Option B, or recommended Option C-prime**?

## D27 selected-option adversarial review - evidence-gated Core Field Accounts activation

**Status:** Founder ratified C-prime-amended-and-hardened (C-prime-R) as Phase
21 D27 on 2026-08-02 after this selected-option research and adversarial
hardening. Ratification records the decision and still authorizes no
implementation, PRD/OpenSpec, ticket set, or claim that a Phase 21 runtime
exists.

### Evidence from current setup and activation practice

The evidence does not support either a single global **Enable** switch or a
console full of independent flags:

- [Ramp's administrator setup guide](https://support.ramp.com/getting-started-as-an-admin/)
  keeps a contextual setup guide, ordinarily clears tasks from real product
  state rather than user assertion, and permits dismissal only where the task
  actually supports it. The useful pattern is a resumable guide; the unsafe
  interpretation would be treating a checked task as financial authority.
- [Brex's accounting setup](https://www.brex.com/support/brex-dashboard-accounting-page)
  separates connection, imported-field verification, mappings, preparation,
  review, export, and export history. It also states that connecting an ERP does
  not affect data without approval. OAuth therefore proves identity and access,
  not that a destination or operation is ready.
- [Expensify's workspace workflows](https://help.expensify.com/articles/new-expensify/workspaces/Workspace-Workflows)
  expose approvals, submissions, and payments only when the organization uses
  them and preserve an outside-payment recording route. The sound lesson is
  progressive disclosure and independently owned outcomes, not an arbitrary
  combination of toggles.
- [SAP Concur's production sandbox guidance](https://help.sap.com/docs/SAP_CONCUR/c5d6d15e7ecb4b4d8238b383d59ac2f4/b10464422ebc4b87ab8f2f34736568e6.html)
  separates configuration testing from live deployment and explicitly lists
  capabilities unavailable in the sandbox. Its
  [test-user guidance](https://help.sap.com/docs/SAP_CONCUR/59009be865b14a7f85d2423773d2c1ec/1b99d0916caf1014b3c180b32a203ac6.html)
  excludes test transactions from production extracts. Test success must never
  be promoted into production truth by changing a flag.
- [Stripe's sandbox guidance](https://docs.stripe.com/sandboxes) uses isolated
  test objects and credentials, while its
  [testing guidance](https://docs.stripe.com/testing-use-cases) warns that some
  settings and capabilities differ between test and live environments. D27
  must record proof class and the limits of each environment rather than claim
  parity.
- QBO, Xero, Gusto, and ADP documentation independently distinguish provider
  organization identity, environment, scopes, product/region capability,
  configuration, preview, operation acceptance, downstream completion, and
  payment. Relevant current sources include
  [Intuit sandbox guidance](https://developer.intuit.com/app/developer/qbo/docs/develop/sandboxes/manage-your-sandboxes),
  [Xero connection management](https://developer.xero.com/documentation/best-practices/managing-connections/connections),
  [Gusto company onboarding](https://docs.gusto.com/embedded-payroll/docs/onboard-a-company),
  and the
  [ADP Workforce Now Pay Data Input guide](https://developers.adp.com/articles/preview/guide-payroll-data-input-api--guide-for-adp-workforce-now-0?chapter=2).
  No generic **Connected** or **Processed** state can stand for all those facts.
- [Aplos's nonprofit accounting quick start](https://help.aplos.com/hc/en-us/articles/30708075177997-Quick-Start-Guide-for-Accounting-and-Finances)
  sequences people, accounts/funds, opening balances, donation purposes, and
  permissions. The valid Phase 21 inference is an ordered, reconciled starting
  boundary; Asym must not copy a general-ledger workflow or mutable opening
  balance.
- [GOV.UK's multiple-task pattern](https://design-system.service.gov.uk/patterns/complete-multiple-tasks/)
  says to simplify before creating a task list, group necessary work into
  stages, minimize status vocabulary, and allow flexible order where possible.
  [WCAG 2.2 error prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data)
  requires an important financial or data submission to be reversible,
  checked, or reviewable and correctable before finalization. Because a D17
  cutover is intentionally not destructively reversible, D27 must provide exact
  validation plus one check-answers consequence review before it.

These sources support the selected direction only as an inference. They do not
prove Asym's financial model, tenant authorization, or D17/D11 invariants; the
ratified Phase 21 owners remain authoritative for those facts.

### Mandatory authority corrections before ratification

1. **D27 is an evidence composer, not a second activation state machine.** D17
   remains the sole Field Account Operational Cutover. D27 prepares and binds
   current evidence to that command but persists no competing `live`,
   `activated`, or cutover fact.
2. **D11 remains the sole integrity and Support Cycle close authority.** A
   first-close failure does not undo D17. It opens or advances the D11
   cause-owned exception and constrains affected future behavior.
3. **A financial activation cohort is complete.** It is the complete D17 census
   for one Tenant x Legal Entity x ISO currency, including every in-scope
   Support Assignment, source family, split, correction, reallocation pair,
   reservation, obligation, and currency manifest. A percentage or named-worker
   canary is forbidden.
4. **A named missionary pilot is publication only.** It is an exact D19
   participant membership plus Phase 12 authorization and a D9 publication
   binding. It never selects or omits financial rows.
5. **Activation, first-close proof, publication, provider/accounting execution,
   and current health are separate axes.** One green badge cannot make them the
   same fact. The core may be active while a first close needs attention, a
   publication profile remains off, or one optional provider lane is paused.
6. **Platform release controls may only cap authority.** An environment flag or
   emergency switch may prevent execution, but it can never grant tenant,
   Legal Entity, currency, source, participant, provider, or financial
   authority.

### Minimal durable model

D27 needs only three immutable records and one disposable projection:

1. **Phase 21 Release Generation** - platform-owned evidence for the exact
   deployed code, schema/migration, supported capability catalog, invariant,
   security/RLS, workload, accessibility, observability, restore, and recovery
   generation. It proves only that the release may be considered.
2. **Field Accounts Adoption Plan Version** - one prospective tenant choice of
   an exact complete core cohort and only the optional capabilities the tenant
   selected. Dependencies come from a finite server-owned catalog; the tenant
   cannot author a rules graph, waive an invariant, or stack contradictory
   plans.
3. **Field Accounts Go-Live Readiness Manifest** - immutable,
   content-addressed, machine-prepared references to every applicable owner
   proof, including D17 opening/cutover inputs, source boundaries and cursors,
   complete cohort digest, current D11 predecessor/integrity evidence, Phase 12
   actor and governance epoch, selected policy/profile/mapping generations,
   qualified-review evidence already required by D1-D26, production-shadow
   inputs/results, proof freshness or revocation dependencies, exact
   consequence digest, and semantic activation operation identity. It neither
   recalculates nor waives an owner fact and contains no durable mutable
   `ready` boolean.
4. **Operational Readiness Projection** - a rebuildable, through-dated staff
   view over independent owner facts. It can say what needs attention and what
   action is safe; it is never accepted as command input or permission.

The D17 cutover record binds the accepted manifest ID/digest, Adoption Plan,
Release Generation, actor, authorization epoch, exact boundary, and semantic
idempotency key. D27 adds no fourth activation record, generic workflow engine,
or legal-compliance certification service.

### Complete setup UX/UI

Use one resumable **Mission Control -> Finance -> Field Accounts -> Set up**
workspace. It extends D17's existing **Start Field Accounts** journey rather
than creating another wizard. Desktop uses a narrow stage list and readable
main pane; small screens and 400% zoom use the same content in one vertical
reading and keyboard order.

The header always names scope and next owner:

> **Set up USD Field Accounts**
> Hope Mission - US Legal Entity
> **Needs attention - 2 items need your organization**

There is no percentage complete. One missing source boundary is more important
than twenty completed cosmetic tasks, so a percentage would manufacture false
confidence.

#### 1. Your setup

Start from the quiet default: one Legal Entity, one ISO currency, ordinary
support sources, zero assessment unless the tenant chose otherwise, no advanced
provider or publication capability, and a named finance owner. Ask one plain
question: **Does your organization need anything beyond ordinary support
balances?**

Only after selection disclose expenses, cards, prospective expense
authorization, travel allowances, tenant AI, compensation handoff, accounting
delivery, external support feed, additional currency, or missionary
publication. Each option says what need it solves and **You can add this
later**. Unselected features are absent or labelled **Not used**; they are not
red blockers. Removing a capability that has already become authoritative uses
its owner's prospective retirement/suspension flow, never a toggle.

#### 2. Checks

Show only applicable evidence, grouped by who can resolve it:

- **Asym checks automatically** - release/schema, source coverage, cohort and
  atomic-group completeness, mappings, D11 invariants, Phase 12/RLS isolation,
  workload, recovery, records/storage, and selected adapter conformance;
- **Your organization** - source and policy choices, finance owner, opening
  controls, mapping exceptions, exact destination selection, and scheduled
  boundary; and
- **Qualified review** - only the current legal, tax, payroll, accounting, or
  privacy evidence an already-selected D1-D26 policy truly requires.

Healthy machine checks collapse to a through-dated summary. Every exception
shows the problem in plain language, exact affected scope and boundary, user
impact, cause owner, last successful proof, and one next safe action; authorized
specialists may open a PII-minimized evidence drawer. There is no **Mark
complete**, waiver, force-pass, or repeated attestation of unchanged machine
facts.

#### 3. Try and compare

Present two visibly and technically separate lanes:

- **Try with sample data** uses fully synthetic people and events and always
  says **Sample only - nothing here changes your records or contacts a
  provider.**
- **Compare against your real records** performs production-authorized reads
  over the complete cohort but remains non-authoritative and structurally
  side-effect-dark. It always says **Read-only comparison - no balances,
  reservations, obligations, statements, messages, accounting releases,
  payroll drafts, reimbursements, provider writes, or external feeds will be
  created.**

D27 invokes D17's existing production-shaped opening preparation and shadow-
reconciliation contract; it does not own a second balance calculation, mapping
decision, source disposition, reconciliation result, or financial shadow. The
D17 shadow reuses live deterministic compilers and invariants but has deny-by-
construction output ports; it is not a `dryRun` Boolean threaded through live
call sites. It is chunked, resumable, tenant-fair, fixed to one captured
generation, and safe to leave. Results prioritize exact source
coverage/boundary, control equality per currency, accounts and atomic groups
with differences, every included/excluded disposition, pinned versions, and
the consequences of activation. Large evidence is server-paginated and
exportable through D26; the core task never requires a horizontally scrolling
thousand-row table.

#### 4. Review and start

One dedicated check-answers page is the only ordinary consequential approval.
It shows:

1. the exact complete scope and D17 half-open boundary;
2. what finance staff will see and the through-date;
3. what missionaries will see - ordinarily nothing until the separate D9
   publication/pilot binding authorizes it;
4. every operation that will become executable and every selected or
   unselected operation that will remain off;
5. current blocking exceptions and nonblocking limitations;
6. what smallest-scope suspension can stop and what it cannot undo; and
7. the finance starter, support owner, and escalation owner, with a second
   approver only when tenant policy or an existing owner decision requires it.

Every section has an accessible **Change [specific item]** link and preserves
other answers. Do not add an `I understand` checkbox. Use a literal final
action such as **Start USD Field Accounts on 31 August 2026**. At submission,
the server reauthorizes and re-proves every bound generation inside D17's short
CAS transaction. A changed input returns the user to the exact item with all
other answers preserved. A lost response triggers outcome inspection by the
immutable semantic operation identity, never a blind retry.

#### After start and later capabilities

Immediately after D17, the finance surface states the exact fact:

> **Recording USD Field Account activity since 31 August 2026, 00:00
> America/New_York. First Support Cycle verification is in progress.**

After cutover, D9 alone determines whether the D17 Finance-confirmed opening
position may be published, and D12 governs closed-cycle statement publication.
First-D11-close verification is shown to finance as an independent through-
dated fact; it neither grants nor revokes publication. A named pilot
uses the ordinary production read model, exact D19 membership, a quiet
**Pilot** label, and an exact through-date. Missionaries never see manifests,
cursors, control totals, release details, or `available`, `wallet`, `withdraw`,
`payroll ready`, `payable`, or `paid` language without the exact independent
owner proof.

**Add capability** reopens only that bounded Adoption Plan item. It previews
prerequisites, proof, consequences, and a prospective boundary and never
reopens core activation or recalculates history. A failed optional integration
cannot change Core Field Accounts to inactive.

Healthy tenants leave setup and receive no monthly certification chore. The
Operational Readiness Projection stays quiet until drift creates one
cause-owned exception.

### Failure, containment, and observability contract

- Before cutover, stale or incomplete evidence makes no financial change and
  returns the user to the smallest changed review item.
- After cutover, there is no **Undo launch**. A cause-owned, smallest-scope
  prospective containment stops only affected new positive/discretionary
  admission, publication, invitation, or executable delivery. Immutable
  history, current authorized reads, D26 custody exports, established
  obligations, mandatory refunds/adverse corrections, source-owned repair,
  artifact/manual continuity, and append-only recovery continue.
- A provider outage pauses only its selected lane. QBO/Xero, payroll/AP, feed,
  notification, storage, or rendering failure does not change Field Account
  truth or claim the remote result was undone.
- An ambiguous provider mutation or cutover response is **Outcome unknown**.
  Inspect the immutable local/remote operation identity and exact readback
  before allowing residual recovery.
- Proof freshness is source-specific: every item carries owner, scope,
  version/digest, observed time, invalidation dependencies, and a bounded expiry
  where the owner requires one. There is no universal arbitrary TTL.
- Monitor source watermarks and gaps, per-currency account/control equality,
  first-close latency, exception age, authorization epoch, publication
  through-date, queue lag/hot-account contention, provider capability/readback
  drift, ambiguous outcomes, containment breadth, and restore-generation
  mismatch. Logs and metrics use opaque IDs and bounded scope classes, never
  donor, worker, receipt, payroll, bank, credential, or provider payload data.

### Ruthless category-by-category review

Every requested category has a concern.

| Category                              | Concern? | What could go wrong and why it matters                                                                                                                                                                                                | Severity | Likelihood  | Permanent prevention                                                                                                                                                                                                              |
| ------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Brittleness**                       | **Yes**  | A tenant-global switch assumes every entity, currency, source, and optional provider is ready; one irrelevant dependency blocks value or exposes incomplete truth.                                                                    | Critical | High        | Complete D17 core cohorts; independently proof-gated optional bindings; server-derived dependencies; no global tenant enable bit.                                                                                                 |
| **Technical debt**                    | **Yes**  | Flags, duplicated readiness calculators, manual checklists, and shadow-only business logic become permanent alternate paths that drift with every schema or policy change.                                                            | High     | High        | Three immutable records plus one derived projection; one canonical evaluator; finite capability catalog; shared live/shadow compilers; retire release flags.                                                                      |
| **Edge cases**                        | **Yes**  | Zero opening balance, no assessment, one-person finance, late refund, split reallocation, multi-currency group, DST boundary, revoked role, stale provider scope, or lost response can duplicate, omit, misdate, or overexpose truth. | Critical | High        | Exact half-open boundaries, complete cohort/atomic groups, checked minor units, current-version/CAS reproof, source-owned corrections, inspectable operation outcomes, boundary/race fixtures.                                    |
| **Footguns**                          | **Yes**  | **Enable**, **Mark complete**, **Override**, **Retry**, **Rollback**, or **All clear** lets staff bypass proof or infer a destructive recovery that does not exist.                                                                   | Critical | High        | Literal consequence-previewed actions; no force-pass; noninteractive status labels; dedicated review; inspect-before-retry; scoped suspension language.                                                                           |
| **Tenant safety**                     | **Yes**  | Preview counts, pilot lists, caches, jobs, manifests, exports, or support tooling can substitute another Tenant, Legal Entity, currency, purpose, assignment, participant, or restricted worker.                                      | Critical | Medium-high | Complete structural keys; same-tenant composite FKs; `ENABLE` and `FORCE RLS`; Phase 12 PDP before enumeration and commit; tenant-scoped cache/job/idempotency keys; substitution tests including service roles.                  |
| **Over-engineering**                  | **Yes**  | D27 becomes a release platform, workflow DSL, policy engine, feature-flag service, or compliance-certification product.                                                                                                               | High     | High        | Thin referential composition; finite stages/capabilities; no formulas, custom graph, waiver engine, generic badge, or duplicated owner state.                                                                                     |
| **UX/UI and user friction**           | **Yes**  | Twenty-six decisions, technical jargon, repeated attestations, percentage theater, or mobile-hostile evidence causes rubber-stamping, spreadsheets, support load, and missionary confusion.                                           | High     | High        | Four-section resumable workspace; guided default; progressive disclosure; owner-grouped checks; one check-answers review; small status vocabulary; responsive list/card evidence; quiet missionary view.                          |
| **Hidden coupling**                   | **Yes**  | Core activation silently publishes statements, invites missionaries, sends alerts, posts QBO/Xero, creates payroll drafts, starts reimbursement payment, or enables a feed.                                                           | Critical | High        | Independent D9/D12/Phase 17/20/D7/D8/D15 bindings; separate status axes and timestamps; negative side-effect tests at every shadow/start output.                                                                                  |
| **Failure modes**                     | **Yes**  | Shadow writes truth, D17 commits after a client timeout, first close fails, source changes after review, provider result is ambiguous, or a suspension races a claimed job.                                                           | Critical | Medium-high | Deny-by-construction shadow ports; semantic operation ID; transactional outbox; final CAS; outcome inspection; execution-time authorization; cause-owned containment.                                                             |
| **Data integrity risks**              | **Yes**  | Stale versions pass, a partial cohort activates, equal totals hide duplicate-plus-omission, an atomic pair splits, or a later capability recomputes history.                                                                          | Critical | High        | Content-addressed pins; unique complete source dispositions; census digest; per-currency conservation plus group completeness; D11 manifests; prospective-only successor bindings.                                                |
| **Security and privacy risks**        | **Yes**  | Sample data, production shadow, evidence, logs, exports, provider errors, or pilot feedback expose donor, worker, receipt, payroll, expense, credential, or restricted-person data.                                                   | Critical | Medium-high | Fully synthetic demo identities; least privilege; private Phase 29 evidence; PII-minimized manifests/telemetry; redacted provider errors; D26 schedules/holds; audited retrieval; no raw client Realtime.                         |
| **Scalability and performance risks** | **Yes**  | Full rebuilds, provider calls per account, giant manifests/transactions, tenant-wide locks, hot control accounts, or month-end concurrency miss finance cadence.                                                                      | Critical | Medium-high | Set-based incremental checks; fixed-generation bounded chunks; short D17 fence; indexed scope/coverage; tenant-fair queues; hot-account strategy; server pagination; production-shaped SLO/load proof.                            |
| **Operational burden**                | **Yes**  | Healthy tenants receive recurring readiness chores, evidence is re-entered, exceptions duplicate, and only engineers can recover.                                                                                                     | High     | High        | Machine-prepared reusable evidence; event/expiry-driven reproof; cause deduplication; one owner/next action; quiet healthy state; tested runbooks; no recurring ceremony.                                                         |
| **Observability gaps**                | **Yes**  | One **Active** or **Healthy** badge hides source gaps, stale through-dates, control differences, permission failure, queue lag, provider drift, or unknown outcomes.                                                                  | Critical | Medium-high | Separate through-dated authority, close, access, publication, provider, and queue signals; owner-labelled alerts; safe correlation IDs; last-success evidence and exact impact.                                                   |
| **Dependency and integration risks**  | **Yes**  | Sandbox success, OAuth, artifact generation, draft acceptance, or webhook delivery is mistaken for production authorization, posting, payroll completion, payment, or reconciliation.                                                 | Critical | High        | Environment/product/region/operation-specific capability proof; exact destination identity; production preflight/readback; idempotency and drift checks; artifact continuity; capability-local suspension.                        |
| **Migration and upgrade risks**       | **Yes**  | Code, schema, policy, mapping, adapter, provider plan, or restore generation changes after review; obsolete green proof is reused or old work replays.                                                                                | Critical | Medium-high | Immutable generation pins and compatibility rules; activation-time CAS; event invalidation; shadow reproof for semantic change; restore epoch; prospective successors; no whole-backlog replay.                                   |
| **Other development hazards**         | **Yes**  | TOCTOU authorization, double submit, clock skew/DST, overflow, queue replay, split-brain workers, deployment rollback, or an untested kill switch defeats the boundary or suppresses adverse corrections.                             | Critical | Medium-high | Server-owned time, checked integer arithmetic, deterministic locking, semantic idempotency, commit-time authorization, concurrency/fault/property/mutation tests, exercised containment, and separate deployment/domain recovery. |

### Ruthless synthesis - the permanent path

1. **Freeze authority first.** D17 alone cuts over financial truth; D11 alone
   closes and proves it; publication and every provider lane keep their current
   owners.
2. **Build the negative boundary before the happy path.** Prove the production
   shadow cannot call any financial, statement, message, provider, accounting,
   payroll/AP, reimbursement, or feed output.
3. **Prove structural tenant and cohort safety.** Use complete relational scope,
   same-tenant composite references, forced RLS, Phase 12 PDP, unique coverage,
   per-currency conservation, group closure, and cross-scope substitution
   tests.
4. **Make one current manifest, not a checklist bureaucracy.** Machines prepare
   and re-prove evidence; people resolve only tenant choices, exceptions, and
   qualified-review items the selected policy genuinely requires.
5. **Make the consequential UX literal and accessible.** One resumable setup,
   one real-record comparison, one check-answers consequence review, one exact
   D17 start action, and deterministic stale/lost-response recovery.
6. **Verify and contain without rewriting history.** Observe the first D11
   close and selected optional outcomes independently; on failure, constrain
   the smallest affected future positive behavior while mandatory adverse and
   custodial paths continue.
7. **Certify production shape before tenant use.** Test small and large missions,
   one-person and separated finance roles, zero/no-history and D17 opening
   migrations, multiple entities/currencies, hot accounts, slow/failed
   providers, low bandwidth, accessibility, restore, concurrency, and ambiguous
   remote outcomes. A clean demo or sandbox is not release proof.

### Hardened decision proposed for ratification

> **C-prime-amended-and-hardened (C-prime-R) - one quiet, evidence-gated Core
> Field Accounts Production Activation Contract composed through D17's sole
> Operational Cutover, with proof-gated tenant-selected optional capability
> bindings and cause-owned live containment; using one immutable Phase 21
> Release Generation, one prospective Field Accounts Adoption Plan Version,
> and one content-addressed machine-prepared Go-Live Readiness Manifest bound to
> the exact Tenant, Legal Entity, ISO currency, complete Support Assignment and
> source-family census, environment, code/schema generation, and D17 half-open
> authority boundary, while referencing and never recreating, weakening,
> waiving, or reinterpreting every applicable D1-D26 and owning-phase fact;
> separating fully synthetic demonstration and provider sandbox evidence from
> a production-authorized, complete-cohort, structurally side-effect-dark,
> non-authoritative shadow; giving finance one accessible exception-first
> consequence review and literal start action; and performing final actor,
> permission, source, cohort, policy, mapping, manifest, revocation, and
> generation reproof inside D17's idempotent CAS-guarded cutover rather than a
> second activation state. D17 authority, first and later D11 close/integrity
> proof, D9/D12 publication, Phase 20 accounting delivery, compensation and
> reimbursement handoffs, notifications, external feeds, provider outcomes,
> reconciliation, payroll completion, and payment remain independently
> authoritative; a named missionary pilot scopes only exact D19/Phase 12
> publication, never financial rows. One disposable through-dated Operational
> Readiness Projection keeps healthy tenants quiet and opens only cause-owned
> exceptions; smallest-scope prospective containment stops affected new
> positive or discretionary behavior while preserving immutable history,
> authorized reads, D26 custody export, established obligations, mandatory
> adverse corrections, artifact/manual continuity, and append-only recovery -
> without a tenant-global enable bit, arbitrary flag or workflow matrix,
> random-row financial canary, mutable readiness truth, shadow side effect,
> repeated manual certification, sandbox-as-production proof, generic
> compliance badge, blind retry, implicit downstream success, force-close,
> destructive rollback, or any claim that configured, connected, checked,
> active, closed, published, delivered, posted, reconciled, payroll-complete,
> payable, or paid are the same fact.**

### Founder ratification request (resolved)

The founder ratified **C-prime-amended-and-hardened (C-prime-R)** above as
**Phase 21 D27** on 2026-08-02.

### D27 ratification and congruency disposition

D27 remains a thin evidence composer around D17's sole Field Account
Operational Cutover and D11's sole close/integrity authority. It adds no second
financial activation, close, permission, publication, accounting, payroll,
provider, reconciliation, or payment truth. Financial activation is always the
complete D17 Tenant x Legal Entity x ISO-currency census; a named missionary
pilot changes only exact D9/D19/Phase 12 publication.

The ratified contract introduces only the canonical Phase 21 Release
Generation, prospective Field Accounts Adoption Plan Version,
content-addressed Field Accounts Go-Live Readiness Manifest, and disposable
Field Accounts Operational Readiness Projection. Synthetic demonstration,
provider sandbox, D17 production-shaped opening preparation/shadow evidence,
and production authority remain distinct. D27 references D17's side-effect-dark
financial shadow rather than owning another, and the final action uses D17's
current-authority CAS rather than a D27 switch.

Post-cutover failure uses the owning D11, source, publication, provider,
accounting, feed, records, or access authority and contains only the affected
future positive/discretionary behavior. Immutable history, current authorized
reads, D26 custody export, established obligations, mandatory adverse
corrections, artifact/manual continuity, and append-only repair remain
available. Ratification creates [ADR-0116](../../adr/0116-evidence-gated-core-field-accounts-production-activation.md)
and updates the Phase 21 decision log and glossary; it does not claim that the
required Phase 12, 20, 29, 30, provider, or runtime seams already exist.

## D28 candidate research: opening cumulative Travel Allowance capacity at mid-period activation

**Research date:** 2026-08-02
**Scope:** Phase 21 D1-D27, current repository authority, adjacent phase
boundaries, and current first-party travel-rate and expense-product evidence
**Status:** Ratified after the selected-option adversarial hardening below; no
runtime implementation is authorized

### Executive verdict

The highest-value genuinely unresolved Phase 21 product decision after D27 is
the **opening cumulative travel-capacity contract for a cumulative or banded
Travel Allowance policy activated after its policy period has begun**.

D18 correctly defines immutable Travel Allowance Calculation Occurrences and
serialized cumulative-capacity allocations. D27 correctly requires a complete,
evidence-gated production activation. Neither decision defines the source fact
that says how much capacity a claimant already consumed before Asym became the
calculation owner. The current decision log names `explicit opening cumulative
capacity` only as a migration prevention, not as a domain record, coverage rule,
activation condition, correction path, or staff experience.

That omission can make perfectly deterministic arithmetic produce a materially
wrong reimbursement. It also leaves an implementation agent to invent financial
authority at the exact point where D18 and D27 are meant to prevent invention.

The recommended decision is:

> **C-prime-amended-and-hardened (C-prime-R) — clean-period activation by
> default, with one proof-classified immutable Travel Allowance Opening Capacity
> Baseline per exact active D18 cumulative-capacity key for optional mid-period
> activation; exhaustive baseline, clean-boundary, or external-continuity
> disposition coverage; append-only correction; and exact D27 activation-
> manifest binding.** The baseline is non-monetary prior-consumption evidence,
> never a reconstructed claim, mutable distance-to-date counter, Field Account
> Opening Position, approval, obligation, payment, payroll, tax, or accounting
> fact.

This is a narrow completion of D18 activation semantics. It does not reopen the
ratified travel method catalog, source certification, tenant applicability,
claim approval, reimbursement handoff, Field Account, or Phase 20 boundaries.

### Why this remains unresolved after D27

#### Repository evidence

1. `docs/adr/0107-certified-policy-pinned-travel-allowance-calculations.md`
   defines a cumulative key, deterministic ordering, serialized or CAS-guarded
   allocation, threshold splitting, and append-only late-earlier recovery. It
   starts from an already valid before-capacity but never defines how the first
   valid before-capacity is established during a mid-period adoption.
2. `CONTEXT.md` defines **Travel Allowance Cumulative Capacity Allocation** as
   immutable consumption by one Calculation Occurrence and explicitly rejects a
   mutable miles-to-date counter. It contains no opening baseline fact.
3. `docs/prds/sitestacker-parity/phase-21-field-accounts-decision-log.md` names
   `explicit opening cumulative capacity` in D18's migration-risk prevention,
   but supplies no schema, authority, coverage, activation, correction, or UX
   contract for it.
4. Phase 21 D17's **Field Account Opening Position** cannot be reused. It is a
   reconciled money position per Legal Entity and ISO currency. Cumulative
   travel capacity is non-monetary source-period usage such as kilometres,
   miles, days, meals, or another source-defined unit and is keyed to the exact
   D18 claimant and policy dimensions.
5. Phase 30 can own file intake, staging, mapping, and resumability, while Phase
   29 can own private evidence bytes. Neither may decide what prior consumption
   means or how it changes a D18 calculation. That authority belongs to Phase 21.
6. Phase 20 receives only an eligible Approved Expense Snapshot handoff. It
   cannot calculate or repair cumulative travel bands. Phase 37 may own trip
   context and budgets but not Expense Claim or allowance-capacity truth.
7. D27's Go-Live Readiness Manifest can prove only facts that an owning decision
   defines. It cannot turn an absent opening-capacity semantic into safe
   evidence. D27 therefore exposes this gap rather than closes it.

No current OpenSpec requirement implements Phase 21 travel-capacity opening
semantics, and Phase 21 remains planning-only. There is no runtime seam whose
behavior can be treated as accidental product authority.

### Current first-party evidence

#### Government schedules require period-aware, source-specific capacity

- The [Canada Revenue Agency automobile allowance guidance](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/benefits-allowances/automobile/automobile-motor-vehicle-allowances.html)
  publishes different 2026 prescribed rates for the first 5,000 kilometres and
  additional kilometres, distinguishes provinces from territories, and calls
  for detailed business-driving records for the year. A July system start
  cannot safely apply the first band without knowing earlier qualifying
  kilometres.
- The [UK HMRC 2026 to 2027 employer rates](https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027)
  apply one car rate to the first 10,000 business miles in the tax year and a
  lower rate after that. The threshold is expressly annual, so a product-local
  zero at onboarding is not equivalent to legal or policy-period zero.
- The [IRS standard mileage-rate history](https://www.irs.gov/tax-professionals/standard-mileage-rates)
  shows that the United States can also change a rate within a calendar year,
  including distinct January-to-June and July-to-December 2026 business rates.
  This is not a cumulative-band example, but it confirms D18's need to keep
  effective intervals and cumulative usage as separate dimensions rather than
  one mutable annual rate or counter.

These sources do not decide which schedule applies to a mission or worker.
D18 correctly leaves applicability to the tenant or its qualified adviser.
They do prove that cumulative thresholds and mid-period effective intervals are
ordinary contemporary policy shapes.

#### A leading expense product has the exact onboarding concept

SAP Concur's current July 2026 administration guide, [Setting Initial
Distance](https://help.sap.com/docs/concur-expense/concur-expense-professional-edition-administration-guides/setting-initial-distance),
defines initial distance as accumulated distance in the reporting period that
was already reimbursed outside Concur. Its example seeds 800 previously
reimbursed miles so the next expense crosses a 1,000-mile band correctly. It
also distinguishes this value from the vehicle's current odometer reading and
prevents ordinary editing after expenses exist.

The same product's [Variable Rate
Configuration](https://help.sap.com/docs/CONCUR_EXPENSE/bb83754b1c5541808d50c09901e11475/eddfb60bac924296b94084058007bd63.html)
allows accumulated mileage to be scoped by configuration, car criteria, or
individual car, while its [extended vehicle criteria
guidance](https://help.sap.com/docs/CONCUR_EXPENSE/bb83754b1c5541808d50c09901e11475/edfaa921271d4f15be4ecb5588093ab2.html)
binds distance limits to an effective date and period such as annual.

The product lesson is strong but should not be copied blindly. Asym should
adopt the period-to-date opening fact, explicit unit, and policy-key scope. It
should improve on a locked incorrect value by using append-only correction and
affected-work review rather than mutation or an unrecoverable wrong baseline.

### Concrete mission-organization scenario

Northstar Mission Canada adopts a tenant-confirmed CRA-shaped mileage policy
for Canadian employees. Elise is an eligible employee and has already been
reimbursed outside Asym for 3,800 qualifying kilometres from 1 January through
30 June. Finance wants Asym to calculate new claims starting 1 July.

- If Asym starts Elise at zero, another 3,800 kilometres can receive the higher
  first-5,000-kilometre rate. The calculation engine is deterministic but the
  result is wrong.
- A total amount previously paid cannot reconstruct qualifying kilometres,
  vehicle or policy key, excluded travel, source version, or threshold usage.
- Importing every historical receipt and trip as a D10 claim is unnecessary,
  expensive, privacy-increasing, and likely incomplete.
- A mutable staff-entered `kilometres used` field makes later review and
  correction unauditable.
- Treating the Field Account Opening Position as the answer confuses money with
  a source-defined non-monetary allowance band.

Finance needs a low-friction path that can start clean next period, seed the
exact earlier usage now, or keep calculations external until a clean boundary.

### Three options

#### Option A — Next complete policy period only

Asym activates every cumulative schedule only at the next exact source-defined
policy-period boundary. Mid-period claims stay under actual-expense or D18's
external-calculation lane.

**Strengths**

- Smallest data model and easiest correctness proof.
- No baseline evidence, import, or correction workflow.
- Avoids false prior usage and threshold overpayment.

**Weaknesses**

- A tenant adopting in July may wait six months or longer.
- Finance must keep a second calculation process alive solely because Asym
  lacks one bounded opening fact.
- It turns a safe default into an inflexible product restriction even when the
  tenant has reliable year-to-date evidence.

**Disposition:** safe default, inadequate as the only supported path.

#### Option B — Reconstruct all historical travel claims

Require every earlier claim, trip, vehicle, source, approval, and payment fact
to be imported and replayed before mid-period activation.

**Strengths**

- Produces the richest native historical trail when exact records exist.
- Can explain the whole period from claim-level details.

**Weaknesses**

- Confuses calculation opening with general history migration.
- Forces Phase 30 transport and D10 claim semantics into the critical path.
- Creates false precision when predecessor records lack current D18 dimensions.
- Expands sensitive travel/location data and records obligations.
- Risks duplicate claims, obligations, handoffs, Field Account effects, or
  accounting projections unless extensive negative plumbing is added.
- Is substantially more complex than leading expense products require.

**Disposition:** reject as a mandatory architecture. Exact history may still be
imported for a separate authorized purpose, but it is not required to seed a
cumulative band.

#### Option C-prime — Clean-period default plus proof-gated opening baseline and external continuity

Use the next complete policy period as the guided default. Permit a mid-period
start only when authorized finance establishes one immutable prior-consumption
baseline for every exact active cumulative key. Any uncertain or incomplete key
stays in D18's external-calculation lane until the next clean boundary.

**Strengths**

- Matches the real onboarding concept documented by SAP Concur.
- Preserves a quiet zero-work path for ordinary clean-boundary activation.
- Gives tenants practical mid-period flexibility without fabricating history.
- Keeps uncertainty explicit and local rather than blocking unrelated people.
- Fits D18 immutable calculation evidence and D27 complete activation coverage.

**Weaknesses**

- Adds a small but real domain record, coverage manifest, correction path, and
  setup step for tenants that choose mid-period activation.
- A finance attestation can still be wrong; the system can preserve who said
  what and when but cannot manufacture external truth.
- Source-specific capacity keys may require vehicle, relationship, or other
  dimensions that make bulk preparation more involved.

**Disposition:** recommended and suitable for hardening as Phase 21 D28.

### Recommended durable contract

#### One immutable opening fact, not a shadow claim

Define **Travel Allowance Opening Capacity Baseline** as the immutable,
non-monetary statement of source-period consumption before one exact D18
calculation-authority boundary. At minimum it preserves:

- Tenant and Legal Entity;
- claimant Party and exact source-owned relationship or engagement version;
- winning D13 profile, D18 source package or bounded schedule, and source
  revision;
- exact half-open policy period and exact half-open predecessor coverage ending
  at the activation boundary;
- every source-required capacity-key dimension, including vehicle kind,
  registered vehicle, location class, or associated employment scope only when
  the selected source requires it;
- exact unit and exact non-negative prior consumption in that unit;
- evidence class, evidence references or bounded finance attestation, actor,
  current authorization epoch, rationale, recorded time, and content digest;
- explicit zero as an affirmative proved value, never as the default for a
  missing row; and
- lineage to any append-only correction.

The baseline is structurally incapable of creating an Expense Claim, Expense
Policy Decision, Approved Expense Snapshot, Reimbursement Obligation, Field
Account occurrence, Compensation result, handoff, payment, payroll or tax
result, Accounting Release, or provider operation. Earlier outside-Asym work is
not silently re-created as current D10 work.

#### Exhaustive activation disposition

For every exact cumulative-capacity key in the selected activation population,
one and only one disposition must exist:

1. `clean_period_start` with a source-proved period boundary and explicit zero;
2. `opening_baseline` with complete prior-consumption evidence; or
3. `external_until_clean_boundary` with no Asym cumulative calculation before
   the named future boundary.

Missing, overlapping, negative, wrong-unit, wrong-period, cross-scope,
over-capacity, duplicated, or ambiguous baselines block only the affected key.
They do not manufacture zero, fall through to another policy, or block an
unrelated claimant or Legal Entity. The D27 Go-Live Readiness Manifest must
reference a complete content-addressed disposition manifest for every enabled
cumulative method. A later optional capability activation uses the same rule
without reopening Core Field Account activation.

#### Evidence classes without false certification

Accept a bounded hierarchy of truthful evidence:

- exact predecessor-system or provider export;
- signed or content-digested tenant report with the required key and period;
- source-linked calculation ledger or other independently checkable record; or
- authorized finance attestation when tenant policy permits it.

The UI and audit record must label the actual evidence class. An authorized
staff assertion is sufficient tenant authority when the tenant chooses that
mode, but it is never relabelled provider-proved, independently verified, tax-
compliant, or legally correct. D18's tenant or qualified-adviser applicability
confirmation remains separate.

#### Append-only correction and concurrency

- Before the first affected Calculation Occurrence, an authorized mistake is
  corrected by a successor baseline version and activation CAS; the prior fact
  remains retained.
- After affected draft or submitted calculations exist, a late earlier fact or
  baseline correction appends exact re-evaluation evidence. Only affected
  unreleased work may be deliberately recalculated with a visible delta.
- Approved work follows D18 and D25's append-only adjustment or finance-review
  path. It is never silently rewritten.
- Baseline activation and the first capacity allocation serialize on the same
  exact key or use an equivalent CAS fence so neither can observe a partial
  opening state.
- Retry uses semantic idempotency. A lost response is inspected before retry;
  duplicate submission cannot create two baselines or consume capacity twice.
- Source revisions, relationship succession, policy-period changes, vehicle
  succession, and claimant changes create new exact keys or source-owned
  impact cases. They never mutate an old key into a different one.

#### Quiet, progressive staff and missionary experience

This setup appears only after staff select a genuinely cumulative D18 method
and choose a start inside an already-open policy period. The ordinary screen
uses plain language:

**When should this mileage schedule start**

- **Next policy period — recommended**
- **This period using distance already reimbursed**
- **Keep calculations outside Asym until next period**

For the middle path, use **Distance already reimbursed this policy period** in
ordinary copy. Explain that this is not the current odometer. Show the exact
period, unit, claimant, vehicle or other source-required scope, and source
schedule. Permit accessible row entry and a machine-readable bulk preparation
path through Phase 30 when volume warrants it. Never prefill missing rows with
zero.

Before activation, show a production evaluator preview such as:

> 3,800 km were already counted for 1 January through 30 June. The next 1,200
> km remain in the first band; later kilometres use the additional-kilometre
> rate.

Show an exception summary grouped by cause, with clean rows collapsed. Every
exception has one owner and next safe action. The consequential review names
the source, period, affected people, complete disposition count, external
continuity count, and immutable boundary. It does not expose internal manifest,
digest, or generation jargon unless an authorized auditor opens details.

Missionaries never see onboarding, migration, evidence-class, or baseline
administration. Their ordinary Add expense flow remains D18's calm calculated
amount. `How this was calculated` may truthfully show prior distance counted,
threshold split, rate, unit, and source when relevant. It must not imply that
the prior distance was paid by Asym, that the current claim is approved, or that
money is available, payable, reimbursed, posted, or paid.

#### Authorization and privacy

- Phase 12 grants baseline preparation, evidence viewing, activation, and
  correction separately from claim submission, claim approval, payment,
  accounting, and source certification.
- Every read, row error, export, job, cache, audit event, and recovery command is
  structurally scoped by Tenant and all applicable Legal Entity, claimant,
  relationship, source, policy period, vehicle, and evidence dimensions before
  enumeration.
- Prefer aggregate prior-consumption evidence. Do not require historical routes,
  home addresses, GPS traces, companions, or receipts merely to seed capacity.
  Any supporting byte uses Phase 29's private, purpose-labelled lifecycle and
  D26's applicable records schedule.
- Support tools receive redacted cause and scope by default, never broad
  location history or cross-tenant search.

### Ruthless pressure test

| Category                   | Concern                                                                                                                                 | Severity | Likelihood  | Permanent prevention                                                                                                                          |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                | Assumes every tenant starts on day one or has complete claim history.                                                                   | Critical | High        | Clean-boundary default, bounded baseline, and external continuity.                                                                            |
| Technical debt             | A one-off migration column becomes a mutable hidden counter.                                                                            | High     | High        | First-class immutable baseline and shared D18 capacity primitives only.                                                                       |
| Edge cases                 | Multiple vehicles, relationships, regions, units, retrospective rates, late claims, and threshold crossing produce wrong keys or order. | Critical | High        | Source-required exact key schema, half-open periods, exact units, deterministic ordering, and append-only impact review.                      |
| Footguns                   | Missing prior use silently becomes zero or staff enter current odometer.                                                                | Critical | High        | No implicit zero, explicit evidence class, literal copy, preview, and affected-key fail closed.                                               |
| Tenant safety              | A baseline is attached to another tenant, entity, claimant, vehicle, or period.                                                         | Critical | Medium      | Composite scope constraints, forced RLS, Phase 12 reauthorization, and substitution tests.                                                    |
| Over-engineering           | Full historical claim reconstruction becomes mandatory.                                                                                 | High     | High        | Opening usage only; exact history remains an independent optional migration purpose.                                                          |
| UX and friction            | Every tenant encounters migration jargon or a giant vehicle grid.                                                                       | High     | Medium-high | Conditional three-choice setup, quiet default, progressive bulk preparation, exception-only review, and no missionary setup surface.          |
| Hidden coupling            | Baseline is mistaken for paid expense, Field Account money, or accounting truth.                                                        | Critical | Medium      | Non-monetary type and structural prohibition on downstream effects.                                                                           |
| Failure modes              | Partial import, lost response, first-claim race, or stale D27 manifest creates an incomplete opening.                                   | Critical | Medium-high | Atomic coverage manifest, semantic idempotency, inspect-before-retry, shared-key CAS, and activation-time reproof.                            |
| Data integrity             | Duplicate, overlapping, wrong-unit, or mutable baselines corrupt every later band.                                                      | Critical | High        | Unique non-overlapping coverage, exact units, immutable successors, conservation and property tests.                                          |
| Security and privacy       | Historical routes or sensitive locations are imported unnecessarily.                                                                    | High     | Medium      | Aggregate consumption by default, purpose minimization, Phase 29 private bytes, and D26 retention.                                            |
| Scale and performance      | Large missions lock all claimants or load entire histories during activation.                                                           | High     | Medium      | Per-key serialization, chunked preparation, bounded validation, indexed coverage, and short final CAS.                                        |
| Operational burden         | Finance must maintain another annual spreadsheet indefinitely.                                                                          | High     | Medium      | Baseline is one-time per affected start; future capacity derives from D18 occurrences and resets only at source periods.                      |
| Observability              | Staff cannot tell whether zero is proved, missing, or external.                                                                         | High     | High        | Explicit dispositions, through-period labels, evidence class, cause codes, and exact affected-key diagnostics.                                |
| Dependency and integration | A predecessor export or source schema changes.                                                                                          | High     | Medium      | Phase 30 adapter boundary, raw evidence retention, versioned mapping, and staff-attested or external fallback.                                |
| Migration and upgrade      | New readers reinterpret old baselines or replay history.                                                                                | Critical | Medium      | Stable versioned record, read-only upcasters, digest-bound manifests, dry runs, and no historical rewrite.                                    |
| Other development hazards  | Clock boundary, precision, negative values, authorization TOCTOU, or concurrent first claims bypass proof.                              | Critical | Medium-high | Server-owned instants, exact decimal units, checked bounds, commit-time authorization, CAS, fault, concurrency, property, and mutation tests. |

### Production proof required by this decision

1. Pure evaluator tests prove zero, partial-band, exact-threshold, multi-band,
   wrong-unit, source-period, relationship/vehicle-key, and late-earlier cases.
2. Property and concurrency tests prove one non-overlapping baseline per exact
   active key, no negative consumption, no duplicate capacity, deterministic
   allocation, and linearizable first-use activation.
3. Authorization and isolation tests substitute every tenant, entity, claimant,
   relationship, source, period, vehicle, evidence, manifest, and operation ID
   across reads, writes, imports, previews, audits, exports, and jobs.
4. Negative-effect tests prove a baseline cannot create a D10 claim or approval,
   D1 Field Account entry, D15 handoff, payment, payroll, Phase 20 Accounting
   Release, communication, statement, or provider operation.
5. Migration fixtures cover exact predecessor export, explicit finance
   attestation, missing rows, explicit zero, partial failure, duplicate file,
   stale mapping, lost response, late discovery, and external continuity.
6. D27 activation proof rejects incomplete or stale disposition coverage and
   proves an unrelated key can proceed while an affected key remains external.
7. Authenticated staff journeys prove the conditional three-choice setup,
   bulk preparation, exact preview, exception recovery, stale-review recovery,
   and one consequential activation action.
8. Missionary journeys prove no setup noise, plain-language on-demand threshold
   explanation, no authority-inflating copy, keyboard and screen-reader use,
   320-pixel reflow, 400 percent zoom, touch, reduced motion, localization, and
   slow-network recovery.

### Settled boundaries and non-goals

- D18 remains the sole travel-calculation and cumulative-allocation contract.
- D13 remains the sole profile and applicability resolver; the tenant or its
  qualified adviser owns applicability.
- D10 owns claims and approval; D15 owns reimbursement handoff; D1 and D11 own
  Field Account recognition and close; Phase 20 alone owns accounting delivery.
- D17 opening money, D27 production activation, Phase 29 private bytes, Phase 30
  transport, and Phase 37 trip context remain separate owners.
- No universal legal inference, tax determination, global source catalog,
  arbitrary formula language, mutable odometer or period counter, historical
  claim fabrication, implicit FX, payroll, payment, travel booking, or GL is
  created.
- Provider/source certification and known Phase 29 or Phase 30 implementation
  prerequisites are execution gates, not substitute founder decisions.

### Recommended decision order

1. Ratify or reject the opening cumulative-capacity contract.
2. If ratified, run a narrow congruency update across D18, D27, the glossary,
   Phase 12, Phase 29, Phase 30, Phase 20's negative boundary, and roadmap.
3. Run one final completeness audit. Do not manufacture more product questions
   from implementation or certification work.
4. If no other observable founder choice remains, close Phase 21 grilling and
   move to `/to-spec`, pausing only at its required testing-seam confirmation.

### Founder question

A mission enables a cumulative mileage schedule after some people have already been reimbursed in the same policy period. How should Asym establish the remaining cumulative band at activation?

- **Option A — Next complete policy period only:** safest and simplest, but
  prevents mid-period native adoption.
- **Option B — Reconstruct all historical travel claims:** richest history, but
  brittle, privacy-expanding, and disproportionate.
- **Option C-prime — Clean-period default plus proof-gated immutable opening
  capacity and external continuity — Recommended:** ordinary tenants start
  clean; mid-period adopters provide exact prior usage for each active key; any
  uncertain key stays external until the next clean boundary.

**Founder selection:** Option C-prime selected on 2026-08-02 and ratified as the
hardened C-prime-R after the selected-option adversarial review below.

## D28 selected-option adversarial review: opening cumulative Travel Allowance state and continuity

**Research date:** 2026-08-02
**Status:** Founder ratified the hardened C-prime-R as Phase 21 D28 on
2026-08-02
**Decision scope:** The first valid before-state and continuing source coverage
for an optional D18 cumulative Travel Allowance calculation. No implementation,
claim reconstruction, Field Account money, payment, payroll, tax, or accounting
authority is created.

### Executive verdict

The selected direction is correct, proportionate, and supported by current
expense-product practice, but it is **not safe verbatim**. It should be ratified
only in the hardened formulation at the end of this section.

The clean-period default, one immutable non-monetary opening fact, missing-not-
zero semantics, append-only correction, and fully usable external-calculation
lane are all sound. SAP Concur and Oracle both document a period-to-date
cumulative input for mid-period expense-system adoption, while Ramp documents
production use of tax-year mileage bands and an ordinary reimbursement fallback
for unsupported cases.

The review found one release-blocking omission:

> A clean source-period boundary proves an opening zero only. It does not prove
> that Asym will observe every source-required fact after that boundary.

Some policies aggregate mileage across associated employments or same-kind
vehicles. New Zealand's current kilometre method may depend on total vehicle
travel, including private travel. Those increments can continue outside Asym
after a calendar reset. Native D18 calculation is therefore safe only when both
the opening state **and prospective source completeness** are proved for the
exact key or indivisible source-defined group. Otherwise the affected claim path
remains fully usable through D18's evidence-backed external calculation,
including beyond the next clean boundary if completeness still cannot be
proved.

### What current evidence establishes

- [SAP Concur's current Setting Initial Distance guide](https://help.sap.com/docs/concur-expense/concur-expense-professional-edition-administration-guides/setting-initial-distance)
  captures accumulated period-to-date distance when a person starts using
  Concur, distinguishes it from the current odometer, and uses it to select the
  correct threshold rate. Its 800-mile example directly validates a bounded
  opening cumulative fact.
- [SAP Concur's Variable Rate Configuration](https://help.sap.com/docs/CONCUR_EXPENSE/bb83754b1c5541808d50c09901e11475/eddfb60bac924296b94084058007bd63.html)
  permits monthly, quarterly, or annual reset periods and accumulation by
  configuration, car criteria, or car. `Claimant plus calendar year` is not a
  universal capacity key.
- [Oracle Fusion Cloud Expenses](https://docs.oracle.com/en/cloud/saas/financials/25c/faiex/how-you-upload-cumulative-mileage-from-a-third-party.html)
  explicitly supports accumulated-mileage upload for a midyear go-live when
  rates depend on total distance in a period. Its one-run warning is useful
  evidence for first-use fencing, but Asym should improve on the mutable or
  coarse recovery model with immutable successors, per-key idempotency, and
  append-only impact analysis.
- [Ramp's international mileage documentation](https://support.ramp.com/international-mileage-reimbursements/)
  shows current tax-year accumulation for multiple countries and a normal
  reimbursement fallback for unsupported countries. It validates capability-
  honest native and external lanes, not its residence or bank-country inference.
- [Expensify's current Distance Expenses guide](https://help.expensify.com/articles/new-expensify/reports-and-expenses/Distance-Expenses)
  demonstrates calm manual, map, GPS, and odometer capture plus effective-dated
  rate selection. Those capture choices do not substitute for cumulative-band
  opening or completeness truth.
- [CRA's current automobile allowance guidance](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/benefits-allowances/automobile/automobile-motor-vehicle-allowances.html)
  distinguishes the first 5,000 qualifying business kilometres from additional
  kilometres and calls for records supporting business travel. A mid-period
  zero can materially misprice later claims.
- [HMRC's current mileage guidance](https://www.gov.uk/guidance/how-to-tax-mileage-payments-for-employees-480-chapter-16)
  aggregates vehicles of the same kind and, for associated employments,
  aggregates business travel when applying the first-10,000-mile band. A single
  vehicle or Legal Entity row can therefore be an incomplete accumulator.
- [New Zealand Inland Revenue's 2025-2026 kilometre guidance](https://www.ird.govt.nz/income-tax/income-tax-for-businesses-and-organisations/types-of-business-expenses/claiming-vehicle-expenses/kilometre-rates-2025-2026)
  applies Tier 1 to the business portion of the first 14,000 kilometres of total
  vehicle travel, including private travel, then Tier 2 after total travel
  crosses the threshold. That is direct proof that `distance already
reimbursed` is not a safe universal field label and that future facts can
  remain outside Asym.
- [The IRS's current 2026 mileage history](https://www.irs.gov/tax-professionals/standard-mileage-rates)
  includes a 1 July 2026 rate change. Effective time, source revision, policy
  period, and cumulative state must remain independent dimensions.

These sources demonstrate product and policy shapes. They do not decide which
policy applies to a tenant, provide legal or tax advice, classify a missionary,
or prove reimbursement. D18 correctly leaves applicability to the tenant or its
qualified adviser.

### Binding hardenings

#### 1. Store source-defined cumulative state, not generic `capacity remaining`

The precise domain term is **Travel Allowance Opening Cumulative State**: one
immutable, non-monetary, source-semantics-bound statement of the cumulative
input immediately before an exact D13/D18 native-calculation authority boundary
for one exact D18 cumulative key or indivisible source-defined group.

`State` is deliberately more precise than `capacity`. A source can mean
qualifying distance already counted, a band position, total vehicle distance,
business distance, days used toward a limit, or another certified quantity.
Some thresholds change rates and are not caps. The stored value may validly be
above every rate threshold; it is rejected only when the pinned source defines
a true maximum or the evidence is otherwise impossible.

The opening state preserves at least:

- Tenant and every applicable Legal Entity scope;
- claimant Party and the source-owned relationship or engagement evidence;
- the winning D13 resolution and exact D18 Source Package revision as
  provenance, without treating an incidental profile or package-version change
  as an automatic accumulator reset;
- the source-declared cumulative-regime identity, exact key or indivisible
  group, carry/reset/succession semantics, and all required dimensions;
- the exact source policy period, source-owned ordering date, business timezone,
  half-open predecessor interval, and half-open D13/D18 calculation-authority
  boundary;
- semantic quantity type, source-native unit, exact non-negative value,
  original evidence unit, and only a certified exact normalization when one is
  supported;
- whether the input is measured, source-permitted estimated, provider-reported,
  predecessor-reported, tenant-reported, or finance-attested;
- evidence references, preparer, authorizer, current authorization epoch,
  rationale, recorded instant, content digest, and append-only successor
  lineage; and
- an affirmative proved zero when zero is true. A missing fact is never zero.

The baseline cannot be inferred from an amount paid. It does not fabricate a
historical claim or assert that earlier activity was approved, reimbursed, paid,
tax-compliant, or handled by Asym.

#### 2. Prove both opening state and continuing source completeness

Every exact key or indivisible group receives one immutable **Travel Allowance
Cumulative Admission** for its named authority interval. Admission contains two
independent dispositions.

**Native opening proof or external boundary disposition**

1. `clean_boundary_zero` - the exact source-defined reset boundary proves an
   affirmative new-period zero;
2. `opening_cumulative_state` - a complete Opening Cumulative State proves the
   source-required before-value. Either of these can serve as native opening
   proof; or
3. `external_at_boundary` - Asym does not own native cumulative calculation at
   the boundary. This is a complete manifest disposition, not native opening
   proof, and it creates no native Admission.

**Continuity disposition**

1. `asym_source_complete` - every source-required increment from the boundary
   forward is authoritatively admitted through D18, including late events;
2. `authoritative_feed_complete` - a separately owned, capability-certified
   source supplies every required increment with exact coverage and cursor
   evidence; or
3. `external_calculation_lane` - D18 preserves an exact external calculation and
   Asym does not allocate cumulative bands for the named interval.

Only `clean_boundary_zero` or `opening_cumulative_state` plus proved prospective
completeness permits native allocation. `external_at_boundary` necessarily
selects `external_calculation_lane`, and `clean_boundary_zero +
external_calculation_lane` remains external. A clean reset never waives a continuing private-distance,
associated-employment, other-organization, or other source-required input.
`authoritative_feed_complete` is a supported capability shape, not a D28 promise
to build a connector; without a certified feed, the key stays external.
A later native transition must prove a new clean-zero or exact opening-state
boundary plus continuing-source completeness; an earlier external disposition
cannot be reused as Admission proof.

The D18 Source Package capability envelope must declare the exact accumulator
semantics, ordering instant, period/reset rule, key/group scope, band-versus-cap
meaning, allowed estimation method, and continuing completeness requirement.
If those semantics are not certified, Asym must not offer native calculation.

A versioned **Travel Allowance Capacity Key Contract** compiles a stable
`capacity_pool_id` from only the dimensions the source says share consumption.
Canonical key fields and their schema version remain stored; a digest is never
the sole semantic identity. D13 profile, D18 package, relationship, identity,
vehicle, and calculation-code versions are provenance unless the source-owned
succession explicitly proves `continue_existing_pool` or `new_pool`. Routine
version churn must never silently reset someone to the first band. The source
also declares whether rejection, reversal, repayment, or another occurrence
restores consumption; Asym never assumes that a negative financial event
restores a policy band.

#### 3. Require exhaustive current and future admission coverage

A content-addressed **Travel Allowance Cumulative Admission Manifest** proves
one non-overlapping opening and continuity disposition for the complete current
eligible census. The system generates the census and exact source-required
dimensions; finance does not invent keys from names or spreadsheets.

Initial completeness is not a claim of universal future completeness. A later
claimant, relationship, vehicle, Legal Entity, source revision, or other new
capacity scope receives the same admission proof before first native use. A
machine-derived zero is permitted only when pinned source facts prove that the
new key began at the clean boundary with no predecessor quantity. Otherwise it
needs an opening state or remains external.

If the source aggregates multiple keys, vehicles, employments, entities, or
other members, the indivisible group is admitted, allocated, corrected, and
contained atomically. Required facts outside Asym or outside authorized tenant
scope are represented only by minimum-necessary aggregate evidence or remain
external; D28 never creates cross-tenant data access.

If cumulative travel is selected during initial Field Accounts setup, D27's
readiness manifest may reference the current D28 admission proof. If selected
later, the same proof gates the versioned D13/D18 optional-capability binding.
Neither path reopens or reinterprets D17's sole monetary Field Account cutover,
and D27 never creates, edits, waives, or owns D28 truth. An incomplete D28 pool
cannot make already-safe Core Field Accounts inactive; it contains only that
pool's new positive native travel calculations and retains D18 external
continuity.

#### 4. Use the D13/D18 policy boundary, not payment or Field Account time

The authority boundary follows the pinned source's exact ordering fact under
D13/D18 - commonly incurred date, but another certified source-required date
may apply. It is not submission, approval, import, payment, payroll, accounting,
or D17 cutover time.

Every known in-flight predecessor fact receives one disposition. A claim whose
source-owned ordering fact is before the boundary remains under the predecessor
or D18 external-calculation lane even if submitted later. It is never replayed
as an Asym-native historical claim merely to seed a band.

A late-discovered pre-boundary fact appends an exact Opening Cumulative State
correction and impact case. The effective before-state is the original state
plus ordered corrections. Conflicting evidence is never averaged, summed, or
resolved by taking a maximum; finance selects one authorized source contract or
the affected pool remains external. Before native first use, an authorized
correction may produce a successor reviewed admission. After native occurrences
exist, D18 computes the exact affected suffix or indivisible group; unreleased
work may receive explicit successor calculations with visible deltas, while
approved work follows D18/D25 cause-owned append-only review and correction. No
correction automatically creates a debt, obligation, recovery, or payment.

Opening admission and the first native capacity allocation share one exact key-
or-group head lock/version CAS. Multi-pool work locks pools in stable sorted
order. Semantic operation identity, inspect-before-retry, and final actor,
permission, source, profile, scope, manifest, revocation, and first-use reproof
prevent duplicate or stale activation. Serializable transactions, when used,
retry the complete transaction on serialization failure; session-level advisory
locks are not the correctness primitive.

If continuing source completeness later fails, stop only affected new positive
native calculations, preserve history and mandatory adverse correction, and
continue the ordinary D10 claim through D18 external calculation until a new
safe admission is proved.

#### 5. Keep the fact structurally non-financial

No opening state, admission, coverage manifest, preview, or correction can
create or prove:

- an Expense Claim, policy decision, approval, or Approved Expense Snapshot;
- a Reimbursement Obligation, D15 handoff, provider operation, payment, or paid
  state;
- Field Account money, balance, reservation, funding capacity, or availability;
- compensation, payroll, employment classification, or tax treatment;
- an Accounting Release, posting, bank match, or reconciliation; or
- a message, statement, donor record, or historical Asym claim.

### Quiet, source-specific experience

#### Finance and admin setup

The screen appears only for a genuinely cumulative D18 method. Non-cumulative
methods and tenants that leave travel calculation off see nothing.

Use a short dated choice instead of internal terms:

**Choose when Asym starts calculating this travel allowance**

- **Next complete policy period - recommended**
- **This period using earlier activity**
- **Keep this calculation outside Asym**

The first choice is the zero-work path. Asym schedules the source-defined
boundary and automatically re-proves opening and future completeness. Healthy
scope activates without another ceremony; changed or incomplete scope opens one
owned exception and remains external.

The middle choice opens a separate resumable preparation step rather than a
giant inline conditional form. Copy comes from the certified source capability,
for example:

- **Business distance already counted this policy period**;
- **Total distance this vehicle has travelled this income year, including
  personal travel**; or
- **Eligible distance already used toward this period's limit**.

The field never says `odometer` unless the source actually requires an odometer.
It shows exact period, unit, claimant, source, required vehicle or group scope,
what counts, what does not count, and one concrete threshold consequence. It
never accepts a money-to-distance inference or silently fills blanks with zero.

For small cohorts, use accessible row cards and paste-friendly exact values. For
larger cohorts, Phase 30 owns a downloadable opaque-ID template, private
chunked/resumable intake, mapping, row validation, and correction file; Phase 21
owns the meaning and admission result. Phase 29 owns private supporting bytes,
and D26 owns the applicable records schedule and custody export.

The review shows counts for **Native now**, **Scheduled at a proved boundary**,
and **Calculated outside Asym**. Healthy rows collapse. Exceptions group by one
actionable cause and name one owner and next safe action. There is no percentage
score, `force complete`, generic compliance badge, repeated annual
certification, or requirement to upload historical routes merely to seed an
aggregate.

The literal final action names consequence and scope, such as **Start CRA-shaped
mileage calculations for 42 people on 1 July 2026**. A changed census, source,
profile, evidence digest, relationship, permission, or first allocation returns
to review without losing prepared work.

#### Missionary experience

Missionaries see no migration, baseline, evidence-class, manifest, or readiness
administration. Their normal D10 Add expense experience stays available in both
native and external modes. `How this was calculated` may show, only when useful,
the source and through-period, earlier source-defined quantity counted, current
claim quantity, threshold split or cap, rate, unit, and a calm note when finance
supplied an external calculation.

It never implies that earlier activity was paid by Asym, that the claim is
approved, that support funds are available, or that reimbursement, payroll,
payment, posting, or reconciliation occurred. Evidence files, associated-
employment detail, private mileage, and other people's scope remain finance-
only.

The complete authenticated flow must meet the repo's WCAG 2.2 AA contract,
including linked error summary and field errors, keyboard and screen-reader
operation, programmatic status announcements, 320-pixel reflow, 400 percent
zoom, touch targets, reduced motion, localization, offline draft preservation,
and slow-network or lost-response recovery. [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
and [W3C form-notification guidance](https://www.w3.org/WAI/tutorials/forms/notifications/)
support explicit instructions, actionable errors, and consequential-action
error prevention.

#### Authorization and tenant isolation

Phase 12 separates baseline preparation, evidence viewing, admission,
correction, and audit/export powers from claim submission, approval, payment,
accounting, source certification, and missionary access. Every command derives
authoritative scope server-side and reauthorizes immediately before effect.

Every durable fact and reference carries same-scope composite Tenant, Legal
Entity, capacity-pool, claimant, source, period, and applicable group identity.
Use composite foreign keys, non-overlap/uniqueness constraints, append-only fact
tables with update/delete denied, and a disposable rebuildable head projection.
Direct browser writes and broad raw-evidence reads remain denied.

PostgreSQL `FORCE ROW LEVEL SECURITY` does not constrain a superuser or a role
with `BYPASSRLS`, including a typical service-role path. Prefer a dedicated
least-privilege non-bypass database role for Phase 21 commands. If an existing
bypass path is unavoidable, it must still pass the Phase 12 policy decision,
mandatory tenant predicates, composite constraints, commit-time generation and
revocation reproof, and explicit bypass-path isolation tests. Any security-
definer function pins `search_path`, revokes public execution, authorizes before
lookup, and maps hidden and missing rows uniformly so referential errors cannot
become an enumeration oracle.

### Ruthless category-by-category review

Every requested category has a concern. Severity and likelihood describe the
unhardened direction across small domestic missions and large multi-country
agencies.

| Category                          | Concern | What could go wrong                                                                                                                                                                                                         | Why it matters                                                                                                                                                                                           | Severity | Likelihood                             | Permanent fix or prevention                                                                                                                                                                                                                                                              |
| --------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | **Yes** | The design assumes `reimbursed distance`, one vehicle/person/year key, or a clean reset makes future data complete.                                                                                                         | Associated employments, same-kind vehicles, private distance, late facts, and new keys can move the correct band without an Asym event. Deterministic arithmetic then returns a repeatably wrong result. | Critical | High                                   | Source-defined cumulative semantics and group, two-axis opening/continuity admission, later-key gating, and D18 external continuity.                                                                                                                                                     |
| Technical debt                    | **Yes** | An `initial_miles` column, annual spreadsheet, country branches, or second travel engine becomes a hidden mutable ledger.                                                                                                   | Corrections and source changes drift from D18, while old calculations stop reproducing.                                                                                                                  | High     | High                                   | One immutable Opening Cumulative State and admission primitive using D13/D18 keys, exact evaluator, append-only successors, Phase 29/30 seams, and no rules language.                                                                                                                    |
| Edge cases                        | **Yes** | Zero-use new participants, values above a band, true caps, multiple or replacement vehicles, shared employment groups, non-calendar periods, rate changes, boundary trips, late claims, and unit changes are misclassified. | These are normal international policy shapes and can double-count or select the wrong rate.                                                                                                              | Critical | High                                   | Source-declared period/key/group/order/reset/cap semantics, explicit zero, exact units, half-open intervals, group-atomic admission, and affected-suffix correction.                                                                                                                     |
| Footguns                          | **Yes** | Staff enter an odometer, infer distance from money, leave blanks that become zero, backdate authority, force a partial file, or mistake preview for activation.                                                             | One innocent setup action can misprice every later claim.                                                                                                                                                | Critical | High                                   | Source-specific labels and examples, no implicit zero/conversion, bounded staging, consequence preview, literal action, final reproof, and no force path.                                                                                                                                |
| Tenant safety                     | **Yes** | A row, file, feed, or cache binds to the wrong Tenant, Legal Entity, claimant, relationship, vehicle, period, or group; name/email matching crosses scope; a service path bypasses RLS.                                     | It leaks travel facts and corrupts calculations across organizations.                                                                                                                                    | Critical | Medium-high                            | Server-derived opaque identities, same-scope composite constraints, least-privilege non-`BYPASSRLS` command role where possible, Phase 12 authorization before enumeration and at commit, scoped jobs/caches/audit, and explicit bypass-path substitution tests.                         |
| Over-engineering                  | **Yes** | Full history replay, mandatory GPS, general temporal-capacity infrastructure, universal connectors, or annual certification is added for one onboarding fact.                                                               | Privacy, implementation, support, and admin cost grow without improving the required calculation.                                                                                                        | High     | High                                   | Aggregate opening state only when needed, finite admission modes, existing D18 external lane, no history reconstruction, and no connector promise in D28.                                                                                                                                |
| UX/UI and user friction           | **Yes** | Every tenant sees migration jargon, a giant vehicle grid, recurring ceremonies, mandatory spreadsheets, or missionary audit metadata.                                                                                       | Staff return to offline work and missionaries distrust unexplained amounts.                                                                                                                              | High     | High                                   | Conditional dated choices, census-generated cards or Phase 30 bulk accelerator, source-specific nouns, exception-first review, one action, no missionary setup, and on-demand explanation.                                                                                               |
| Hidden coupling                   | **Yes** | D28 is tied to D17 money opening, D27 core activation, D10 history, D15 handoff, Phase 20 delivery, GPS, payroll, or payment; a source/package version accidentally resets capacity.                                        | A travel-policy change can block Field Accounts, duplicate authority, or create false downstream truth.                                                                                                  | Critical | Medium-high                            | D18 owns semantics and stable source-defined pool succession; D27 references proof only; D17 and downstream owners stay separate; negative-effect contract tests.                                                                                                                        |
| Failure modes                     | **Yes** | Partial upload, stale review, revoked permission, feed gap, lost response, first-use race, shared-group split, late predecessor fact, or source outage leaves a key partly native.                                          | Silent partial activation makes recovery ambiguous and bands inconsistent.                                                                                                                               | Critical | Medium-high                            | Content-addressed complete admission, group-atomic CAS, semantic idempotency, inspect-before-retry, coverage watermarks, affected-positive quarantine, external fallback, and append-only recovery.                                                                                      |
| Data integrity risks              | **Yes** | Duplicate or overlapping states, wrong unit or period, implicit conversion, negative effective usage, mutable correction, missing future increments, or replayed predecessor claims corrupt all later allocations.          | Correct code operating on wrong state produces durable bad reimbursements and reporting.                                                                                                                 | Critical | High                                   | Unique non-overlap and same-scope constraints, exact decimal/rational math, certified conversions only, missing-not-zero, baseline-plus-ordered-correction replay, future coverage proof, and property tests.                                                                            |
| Security and privacy risks        | **Yes** | Historical routes, homes, GPS traces, vehicle records, associated employment, or evidence bytes are unnecessarily collected or exposed to missionaries, support, logs, AI, or other tenants.                                | Travel data can reveal homes, ministry sites, routines, protected people, and relationships.                                                                                                             | Critical | Medium                                 | Minimum-necessary aggregates, separate evidence-view permission, Phase 29 private purpose-labelled storage, D26 retention/export, redacted diagnostics, audited access, and no raw location in broad exports or AI prompts.                                                              |
| Scalability and performance risks | **Yes** | A large tenant scans whole claim history, locks every claimant, creates one giant transaction, or starves smaller tenants.                                                                                                  | Setup or correction can block live expense work and miss operational deadlines.                                                                                                                          | High     | Medium                                 | Generated census, chunked resumable validation, indexed interval/key lookup, digest-bound manifests, tenant-fair jobs, key/group serialization, and one short final CAS.                                                                                                                 |
| Operational burden                | **Yes** | Finance maintains a permanent shadow spreadsheet, periodically edits a live counter, re-certifies every period, or chases healthy rows.                                                                                     | Asym replaces one fragile process with another dependent on tribal knowledge.                                                                                                                            | High     | High where future external facts exist | One-time opening only when continuing completeness is proved; derive future use from D18 or a certified feed; otherwise stay external; collapse healthy scope and surface causes only.                                                                                                   |
| Observability gaps                | **Yes** | Staff cannot distinguish proved zero, missing, measured, estimated, stale, corrected, native-complete, feed-complete, or external state.                                                                                    | Wrong calculations can look healthy and support cannot identify owner or recovery.                                                                                                                       | High     | High                                   | Explicit opening/continuity dispositions, through-boundary labels, evidence class, coverage watermark, cause code, current owner, next action, replayable explanation, and PII-redacted correlation.                                                                                     |
| Dependency and integration risks  | **Yes** | Government rules, predecessor schemas, HR identities, product capabilities, or external feeds change; vendor country inference is copied as policy truth.                                                                   | Upstream drift can silently invalidate onboarding or create fictional provider parity.                                                                                                                   | High     | High over product life                 | Immutable source packages, capability-labelled adapters, raw evidence and parser version, semantic-diff recertification, exact mapping review, no live claim-time source lookup, and external continuity when unsupported.                                                               |
| Migration and upgrade risks       | **Yes** | A new reader rekeys old state, treats profile/package revision as reset, replays predecessor rows into claims, upgrades evidence class, or rewrites approved work.                                                          | Historical calculations become irreproducible and may duplicate obligations.                                                                                                                             | Critical | Medium                                 | Versioned immutable schema, stable cumulative-pool succession, read-only upcasters, retained source/digest, no-side-effect shadow replay, custody export, and append-only correction only.                                                                                               |
| Other development hazards         | **Yes** | Float or rounding drift, timezone/date ambiguity, oversized or malicious files, authorization TOCTOU, duplicate operations, correction fan-out, weak accessibility, or fail-open completeness checks bypass the design.     | Small invisible defects can affect every later reimbursement in a group.                                                                                                                                 | Critical | Medium-high                            | Exact math and units, source timezone plus server instants, bounded malware-safe intake, commit-time reauthorization, semantic idempotency, CAS, blast-radius limits, kill switch for affected positive native calculation, and fault/concurrency/property/mutation/accessibility tests. |

### Ruthless synthesis: permanent path forward

1. **Keep D18 as sole owner.** D28 adds the missing opening and continuity
   admission facts; it creates no second travel, migration, policy, claim,
   approval, finance, or activation subsystem.
2. **Certify source semantics first.** A D18 Source Package must declare what
   accumulates, which date orders it, its period/reset, key or atomic group,
   unit, threshold-versus-cap behavior, succession, allowed estimation, and
   continuing completeness. Unsupported shapes stay external.
3. **Make the next source-defined clean period the guided default.** Schedule it
   prospectively and automatically re-prove both zero and future completeness.
   Missing the boundary never becomes a backdated implicit zero.
4. **For a mid-period start, generate the population.** Finance supplies only
   the source-defined prior state, truthful evidence class, or external choice;
   Phase 30 accelerates bulk mechanics without owning meaning.
5. **Gate initial and later keys identically.** Every key or indivisible group
   receives opening and continuity admission before native first use. Uncertain
   scope stays fully usable externally and does not block unrelated scope.
6. **Activate with a short group-atomic CAS.** Reprove current actor, permission,
   D13 profile, D18 source, census, mapping, evidence digest, boundary,
   continuity, and absence of conflicting first use. Inspect lost results.
7. **Treat discoveries as new facts, never edits.** Append the correction,
   recompute the affected suffix, and route approved consequences through
   D18/D25. Preserve every separate payment and accounting authority.
8. **Keep the ordinary experience quiet.** Most staff choose the recommended
   boundary and see no rows. Missionaries see only their ordinary expense flow
   and an optional plain-language calculation explanation.
9. **Ship only after production-shaped proof.** Happy-path arithmetic is
   insufficient for a cumulative financial calculation.

### Release-blocking production proof

1. Evaluator fixtures cover CRA prior business kilometres, HMRC same-kind
   vehicles and associated employments, New Zealand total-vehicle and
   source-authorized alternative methods, an Australian cap-shaped policy,
   exact zero/threshold/above-threshold/cross-band values, non-calendar periods,
   retroactive revisions, and source-required dual-date rules.
2. Property tests prove exact dimensional math, non-overlap, explicit zero
   distinct from missing, deterministic ordering/splitting, no negative
   effective state, and no quantity loss or duplication through successors.
3. Concurrency and fault tests prove group-linearizable admission and first use,
   semantic idempotency, lost-response inspection, partial intake, stale
   manifest, revocation, late facts, feed gaps, and affected-scope containment.
4. Tenant-safety tests substitute Tenant, Legal Entity, claimant, relationship,
   source, period, vehicle, group, evidence, manifest, actor, and operation IDs
   across reads, writes, imports, previews, exports, jobs, caches, and audit,
   including the real service or `BYPASSRLS` path rather than RLS-only tests.
5. Negative-effect tests prove that no D28 fact creates a D10 claim or approval,
   D1 entry, D15 handoff, message, statement, provider operation, payment,
   payroll/tax result, or Phase 20 Accounting Release.
6. Migration fixtures cover provider export, source-permitted estimate, finance
   attestation, explicit zero, missing row, legitimate above-threshold value,
   conflicting evidence, ambiguous group, duplicate file, wrong unit/period,
   stale mapping, in-flight predecessor work, late discovery, and ongoing
   external facts after reset.
7. Source certification tests prove schema/capability drift, publication versus
   effective-date changes, unavailable sources, stable-pool succession,
   restoration semantics, and capability downgrade fail closed only for
   affected new positive native work.
8. Authenticated staff journeys prove conditional setup, small and bulk paths,
   source-specific copy, exact consequence preview, exception recovery,
   stale-review recovery, one literal action, later-key admission, and no force
   path.
9. Missionary journeys prove the same calm claim path in native and external
   modes, privacy-minimized explanations, no authority-inflating copy, mobile,
   keyboard, screen reader, 320-pixel reflow, 400-percent zoom, localization,
   offline draft, slow network, and lost response.
10. Production-shaped load proves no tenant-wide lock or whole-history scan,
    resumable manifest preparation, bounded correction fan-out, sorted multi-
    pool locking, and tenant-fair scheduling.

### Hardened ratifiable formulation

> **C-prime-amended-and-hardened (C-prime-R) — source-defined clean-period
> native activation by default, with proof-gated immutable Travel Allowance
> Opening Cumulative State and prospective source-completeness admission for
> every exact D18 cumulative pool or indivisible source-defined group before
> native first use:** each admission preserves the exact source-defined
> accumulator semantics, stable Capacity Key Contract and explicit pool
> succession, policy period, ordering fact, unit, aggregation scope,
> relationship evidence, timezone, half-open D13/D18 authority boundary,
> epistemic class, and complete predecessor and prospective coverage; uses
> exhaustive clean-boundary-zero, opening-state, or external opening disposition
> plus Asym-complete, certified-feed-complete, or external continuity disposition
> for the complete initial census and every later key; treats proved zero as
> affirmative and missing as never zero; accepts source-valid above-threshold
> state without confusing a band with a cap; and assigns in-flight and late
> predecessor facts once through append-only correction and affected-suffix
> review. Native admission is source-group-atomic, CAS-guarded with first
> allocation, semantically idempotent, finally reauthorized, and contained at
> the smallest affected positive scope; a clean reset alone never waives
> continuing facts outside Asym, and uncertain, externally changing, or
> unsupported pools remain fully usable through D18's exact external-
> calculation lane until a later boundary where both opening and continuing
> completeness are proved. D27 may reference current admission evidence for
> initial or later optional-capability readiness but never owns or recreates it,
> never gates already-safe Core Field Accounts, and never reopens D17. Finance
> receives one quiet dated three-choice setup, source-specific language, system-
> generated small or Phase-30 bulk preparation, exception-first consequence
> review, and one literal start action; missionaries receive no setup noise and
> only a privacy-minimized on-demand explanation. No opening or continuity fact
> fabricates history or creates claim, approval, Field Account money or
> availability, obligation, handoff, provider, reimbursement, payment,
> payroll/tax, statement, accounting, posting, or reconciliation truth —
> without a mutable counter, universal employee/year key, implicit jurisdiction
> or unit, odometer or amount inference, partial/backdated activation, whole-
> history replay, cross-group splitting, periodic manual reseeding, reliance on
> RLS against a bypass role, missionary migration UI, silent recalculation,
> destructive correction, blind retry, or false legal, tax, payment, or
> accounting assurance.

### D28 ratification and congruency disposition

The founder ratified the hardened C-prime-R above as **Phase 21 D28** on
2026-08-02. The complete selected-option review, all seventeen risk-category
controls, UX contract, source evidence, and production-proof requirements are
binding. D28 refines D18's optional cumulative-calculation admission and does
not reopen D17's Field Account cutover or D27's Core activation contract.

Ratification records planning authority only. It does not authorize runtime
implementation, create a claim or financial fact, certify any jurisdiction for
a tenant, or make a clean boundary sufficient without prospective source-
completeness proof.

## Post-D28 completion gate: whether Phase 21 has another founder decision

**Research date:** 2026-08-02
**Status:** Founder selected Option C-prime on 2026-08-02; Phase 21 is product-
decision-complete at D1-D28, creates no D29, and has entered `/to-spec`

Three independent bounded audits — architecture/domain, UX/product, and current
official-product/source evidence — tested D1-D28 against the complete Phase 21
journeys and adjacent owner contracts. All three reached the same result:

> Phase 21 has no remaining material founder-level product or domain seam.

D28 closes the only concrete gap that survived the post-D27 audit. A composite
scenario covering a couple with separate logins, a team/project assignment,
multiple currencies, online/offline/noncash support, assessments, compensation,
expenses, card evidence, travel, reimbursement, corrections, exit, close,
statement, external feed, activation, and custody export maps every promised
observable action to D1-D28 or an explicitly named owning phase. No unsupported
Phase 21 action remains.

### Residuals that must not become D29

- Phase 29 private-byte identity, access, scanning, lifecycle, and audit for
  evidence-bearing capabilities are implementation prerequisites, not a Phase
  21 storage decision.
- Phase 30 import-session transport, parsing, mapping, resumable staging, and
  review mechanics are implementation prerequisites, not Phase 21 source
  meaning or activation authority.
- Phase 20's intentionally accounting-dark Phase 21 families remain closed
  until a later Phase 20 source certification; a generic journal fallback would
  violate current authority rather than complete Phase 21.
- D7/D8/D15 provider adapters and D18/D28 source packages still require exact
  provider, product, region, environment, operation, readback, and production
  certification. Artifact/external continuity already defines behavior while a
  lane is unavailable.
- Tenant isolation, privileged-path authorization, RLS/PDP/composite constraints,
  exact arithmetic, CAS/concurrency, migration, restore, accessibility, load,
  and fault proof belong in the implementation-ready specification and test
  matrix.
- Public pages, fundraising coaching, general imports/storage, accounting,
  payroll/AP execution, connector transport, reporting, workflow, and AI
  orchestration remain with their already named phases or external authorities.

### Options

#### Option A — Keep searching for a D29 feature

**Benefit:** preserves the appearance of continued discovery.
**Cost and risk:** every audited candidate either reopens D1-D28, duplicates an
adjacent owner, or promotes implementation detail into product scope. This is
scope drift and should be rejected.

#### Option B — End grilling but leave prerequisites and verification implicit

**Benefit:** fastest administrative stop.
**Cost and risk:** a later implementation agent may invent one-off storage or
imports, overclaim provider parity, use a privileged RLS-bypass path unsafely,
or create an accounting fallback. This is incomplete handoff and should be
rejected.

#### Option C-prime — Scope-freeze D1-D28 and proceed to `/to-spec` with explicit dependency and verification gates — Recommended

Treat D1-D28 as the complete founder product authority for Phase 21. Create no
D29. The implementation-ready specification must:

1. pull forward only the minimum Phase 29 private-byte/access and Phase 30
   import-session transport/staging prerequisites under those phases' ownership;
2. preserve every Phase 20 accounting-dark exclusion and Phase 31 connector
   boundary unless its owning phase separately changes it;
3. label every provider/source capability honestly and require production-
   authorized certification while retaining artifact/external continuity;
4. compile all D1-D28 invariants into one public-seam verification matrix for
   conservation, exact math, isolation, authorization, concurrency, recovery,
   migration/restore, accessibility, usability, workload, and negative effects;
   and
5. pause only for `/to-spec`'s required testing-seam confirmation rather than
   reopening settled product decisions.

**Recommendation:** Option C-prime. Stopping discovery when the ownership and
journey matrices close is disciplined scope control, not unfinished work.

### Completion disposition

The founder selected **Option C-prime** on 2026-08-02. D1-D28 are frozen as the
complete Phase 21 founder product authority, no D29 is created, and `/to-spec`
is authorized subject to its required testing-seam confirmation. This scope
freeze records no implementation authorization and does not waive any owning-
phase dependency, negative boundary, provider/source certification, or
production-proof requirement above.

### Specification publication

The confirmed `FieldAccountOperationsService` testing seam was approved and the
complete D1-D28 implementation-ready specification was published on 2026-08-02
as [GitHub issue #1108](https://github.com/Asymmetric-al/core/issues/1108), with
the repository contract in
[`phase-21-field-accounts.md`](./phase-21-field-accounts.md) and
[`add-field-account-operations`](../../../openspec/changes/add-field-account-operations/proposal.md).
This publication remains planning authority; implementation dispatch and ticket
slicing require their own later approval.
