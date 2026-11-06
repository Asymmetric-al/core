# Q08-R4 — External evidence on the move-and-end journey (donor, staff, missionary)

_Research agent, read-only web research. Every URL accessed 2026-11-02. This file extends `q08-r2-external-moving-donors.md` and does not repeat it (attrition, vault copy, Nucleus/Tithely cadence, Visa rules, tail length)._

Labels: **verified-primary** (rule text, statute, standard, or Stripe's docs on its own product, fetched and quote checked) · **verified-vendor-doc** (fundraising or subscription vendor page, fetched and quote checked) · **secondary** (search snippet or third-party summary) · **unverified** (my inference).

**Blocked:** Recharge help centre (403; snippets only), Tithely support (403), CRTC CASL FAQ (403; the Act was used instead). Skio's migration guide has no customer-communication content.

**Not found:** Pushpay's migration help article; Planning Center's import path; network-rule text on the first transaction after a merchant-ID change.

## 1. One-click confirmation of a copied payment method

**Stripe mechanics (verified-primary)**

- **Consent.** "Add terms to your website or app that state how you plan to save payment method details and allow customers to opt in", and "you can only use it for the specific usage you've included in your terms." https://docs.stripe.com/payments/save-and-reuse?payment-ui=elements
- **Authenticating a future-dated subscription.** `pending_setup_intent`: "You can use this SetupIntent to collect user authentication when creating a subscription without immediate payment … allowing you to optimize for off-session payments." https://docs.stripe.com/api/subscriptions/object
  - Stripe Support: a SetupIntent "will optimize the authentication flow when you charge your customer for the first time"; exemptions are "at the discretion of the card-issuing bank." https://support.stripe.com/questions/saving-payment-methods-for-subscriptions-after-strong-customer-authentication-sca-regulations-take-effect
- **Starting the first charge later.** Set `billing_cycle_anchor` with `proration_behavior=none`, "making the initial period up to the first full invoice date free. This action doesn't generate an invoice at all until the first billing period." Checkout supports this only in `subscription` mode. https://docs.stripe.com/billing/subscriptions/billing-cycle
- **Bulk-scheduled subscriptions.** In the Billing migration toolkit, `start_date` "must provide a value that's 24 hours (or greater) into the future." The toolkit says: "cancel old subscriptions before they charge so you don't double-bill." https://docs.stripe.com/billing/subscriptions/import-subscriptions-toolkit
- **Imported cards are hidden by default.** Existing payment methods "won't render in the Payment Element because their `allow_redisplay` property is `unspecified`." To show them, use a Customer Session with `payment_method_allow_redisplay_filters`. Stripe also recommends that you "disable removing saved payment methods from the Payment Element to avoid removing a payment method from an active subscription." https://docs.stripe.com/payments/save-customer-payment-methods
- **Declines after the merchant ID changes.**
  - Expect a "temporary increase in declined payments … `generic_decline`, `do_not_honor`, `transaction_not_allowed`, or `try_again_later`."
  - Stripe advises sending "one-time and customer-initiated payments before recurring ones."
  - Card account updater, network tokens and Adaptive Acceptance "can improve authorization rates on migrated cards."
  - Source: https://docs.stripe.com/get-started/data-migrations/pan-import
- **Bank debits need Asym's own page.** ACH and PAD both show "Customer Portal ✗", and "Checkout subscription mode doesn't support PADs." https://docs.stripe.com/payments/acss-debit, https://docs.stripe.com/payments/ach-direct-debit
- **Link** "securely saves and autofills" payment details after "a one-time passcode", which helps re-entry donors. https://docs.stripe.com/payments/link

**What vendors show**

- **WeGive** (verified-vendor-doc): https://wegive-knowledge-base.help.usepylon.com/articles/6102205107-semi-automated-recurring-plan-migration
  - The review screen shows "the amount, frequency, designation, and next installment date", with Edit before confirming.
  - "Their plan details — amount, schedule, and full giving history — are already preserved."
- **"No action needed" flows, where tokens transfer:**
  - Fundraise Up: "Fundraise Up does not notify supporters about the migration"; "supporters may notice a slight difference in their donation date". Verified-vendor-doc: https://fundraiseup.com/docs/migration-faq/
  - Donorbox charges on original dates (secondary: https://donorbox.org/migrations).
  - GoFundMe Pro: the gift "remains unimpacted and uninterrupted" (secondary snippet).

**Recommended page content** (unverified): ministry and missionary; amount and frequency; designation; payment method as brand or bank plus last four digits; the last old-system charge date and the first Asym charge date; the new statement descriptor; one primary button ("Keep my gift going"); secondary actions (change amount or date, use a different method, end my gift); consent text, plus mandate text for bank debits.

## 2. Secure links without passwords

**Token rules (OWASP, verified-primary)** https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html

- Generate tokens "Randomly … using a cryptographically safe algorithm."
- Tokens must be "Single use and expire after an appropriate period" and be "Stored securely."
- Add "the Referrer Policy tag with the `no-referrer` value."
- Build the URL as "hard-coded, or validated against a list of trusted domains." Don't build it from the Host header.
- "Return a consistent message for both existent and non-existent accounts."

**Stripe's patterns (verified-primary)**

- A portal session `url` is "The short-lived URL of the session". https://docs.stripe.com/api/customer_portal/sessions/object
- The no-code portal is a stable login link. Customers "log in to the portal with their email address. Stripe emails them a login link." "Customers can't update their email address through this link." `prefilled_email` is supported. https://docs.stripe.com/customer-management/activate-no-code-customer-portal
- Deep-link flows (`payment_method_update`, `subscription_cancel`, `subscription_update_confirm`) hide navigation "so the customer can focus on the single action." https://docs.stripe.com/customer-management/portal-deep-links

**Subscription-commerce practice**

- Skio: "Magic links expire after 10 minutes for security purposes." For email it recommends "the Portal link instead … This link does not expire," which leads to login. Verified-vendor-doc: https://help.skio.com/docs/magic-login-links
- Bold: "customers do not need to create an account"; "a one-time link … expires after 15 minutes." Verified-vendor-doc: https://support.boldcommerce.com/en/articles/15848335-how-does-customer-portal-login-work-with-passwordless-login
- Recharge's portal token lasts 24 hours; NIST SP 800-63B rejects email as an out-of-band authenticator (both secondary).

**Reading (unverified)**

- Vendors separate a long-lived **campaign link** from a short-lived **session**.
- Use a signed, single-purpose, revocable token per arrangement. It expires at the cap or when the arrangement moves or ends, and it is never a login.
- Before verification, show only the ministry, missionary, amount, frequency and last four digits.
- One click may only re-confirm the existing terms with the existing method. Changes and gift history need an email code or Link.
- A forwarded link can at most re-confirm the donor's own gift. Re-sending revokes the old token.

## 3. Campaign cadence and copy

- **Recharge** (secondary snippet): https://support.getrecharge.com/hc/en-us/articles/38462199292055-Updating-payment-methods-for-unsupported-gateways
  - Sequence: emails, an opt-in SMS 24–48 hours later, a final reminder before a pause, and phone outreach for high-value customers.
  - In-portal banner: "Payment update required".
  - Metrics: SMS click rate against completion rate, subscribers retained, and support tickets per 1,000 affected subscribers.
- **WeGive** (verified-vendor-doc, URL in §1):
  - Pre-announcement: "In the coming days, you'll need to take one quick step".
  - An action-required email with a step-by-step guide.
  - "A second (and sometimes third) nudge meaningfully improves migration completion."
  - Reminder copy: "Until you do, your gift to [Organization] is paused."
- **Subi:** "One email per customer, not per contract." Verified-vendor-doc: https://subi.co/changelog/2026-07-30-migration-payment-prompt/
- **Stripe toolkit:** notify customers with invalid payment methods "through channels other than email, such as text messages". Verified-primary (§1).
- **Stripe on dunning messages** (verified-vendor-doc): https://stripe.com/resources/more/dunning-messages-101-what-they-are-when-to-send-them-and-how-to-write-them
  - "Use a neutral, respectful tone. Avoid accusatory or harsh language"; "Specify a deadline"; "Inform the customer what will happen if they do not take the necessary action."
  - Reminders "weekly or biweekly"; "Physical mail can be used as a follow-up"; "a phone call can be more effective."
- **Relationship notices** (verified-primary):
  - US, CAN-SPAM: transactional or relationship content includes notice of "a change in the terms or features of a membership, subscription, account", and such messages are "exempt from most provisions." https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business
  - Canada, CASL s.6(6): the consent requirement does not apply to messages that solely "facilitates, completes or confirms a commercial transaction" previously agreed, or that give "factual information about … the ongoing subscription, membership, account". https://laws-lois.justice.gc.ca/eng/acts/E-1.6/page-1.html
  - CASL regulations s.3(g) exempt messages from "a registered charity … [whose] primary purpose [is] raising funds." https://laws-lois.justice.gc.ca/eng/regulations/SOR-2013-221/page-1.html
- **French in Québec:**
  - "charities operating in Quebec must now be able to provide receipts to Quebec-based donors in French"; "All promotional material and advertising in Quebec must be in French." Secondary (Miller Thomson via Legal 500, 2022-08-05): https://www.legal500.com/intelligence/canada/corporate-commercial-law/what-does-quebec%27s-updated-language-law-mean-for-not-for-profits-and-charities
  - Stripe's portal locales include `fr-CA` (verified-primary, §2).
- **Tap targets:** WCAG 2.2 SC 2.5.8 (AA) requires targets "at least 24 by 24 CSS pixels". Verified-primary: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html

**Reading (unverified):** invitations and end notices are relationship messages, not appeals, and §4 shows that some bank-debit notices are **required**. "Do-not-contact" should suppress reminders but not required notices, which staff could send personally.

## 4. Bank debits

**Canadian PADs — Payments Canada Rule H1, 2026 edition** (verified-primary, extracted from the PDF): https://www.payments.ca/sites/default/files/h1eng.pdf

- **"Written"** "includes an electronic document", subject to conditions on control and accessibility.
- **s.16 Confirmation:** due "at least 10 calendar days before the due date of the first PAD". The donor can waive it, but then it is due "within 5 calendar days following the date of the first PAD."
- **s.17 Pre-notification:** "at least 10 calendar days before … any change to the payment date(s)" or a change in amount.
  - s.18(b) exempts changes made at the donor's own request, if the agreement provides for this.
  - s.19 allows a waiver, but it must be "displayed prominently".
- **s.28 Assignment:** needs a prominent clause plus notice, or notice "a minimum of 10 calendar days in advance".
- **s.29 Payee name change:** "a minimum of 10 calendar days Written notice."
- **s.31 Payee termination:**
  - Where the agreement "does not address termination by the Payee", the Payee may end it with the donor's Authorization or "by providing at least 30 calendar days' Written notice to the Payor before ceasing to issue PADs."
  - Where it ends by the donor's Authorization, a written statement "specifying the date of the final PAD and the effective termination date" is due "within 10 calendar days of the final PAD".

**Stripe on PADs (verified-primary)**

- Migration: "You must notify your customers that you're migrating payment processing to Stripe"; Stripe imports only PADs "you confirm you hold the mandates for." https://docs.stripe.com/get-started/data-migrations/payment-method-imports
- Connect: "You can't clone PAD payment methods and their mandates to connected accounts for use with destination charges" — a new mandate `on_behalf_of` the connected account is required.
- Notices: Stripe sends "A mandate-confirmation email" and a debit notification for each debit. https://docs.stripe.com/payments/acss-debit

**US ACH**

- **Stripe** (verified-primary): https://docs.stripe.com/payments/ach-direct-debit
  - "give your customer at least 7 calendar days notice if you change the timing of any recurring preauthorized debits."
  - A mandate authorized `on_behalf_of` one connected account "can't use that mandate with a different connected account."
  - The charge type changes "The merchant of record shown on the mandate" and the statement descriptor.
  - `pm_` imports trigger Stripe's own email, and "Your customers don't need to do anything" (in r2).
- **Reg E** (verified-primary): https://www.consumerfinance.gov/rules-policy/regulations/1005/10/ and https://www.consumerfinance.gov/rules-policy/regulations/1005/interp-10/
  - §1005.10(d): notice of varying amounts "at least 10 days before."
  - Comment 10(b)-1: "A new authorization also is not required when a successor institution begins collecting payments." Applying this to a processor change is unverified.
- **Nacha:** 10 days for amount changes, 7 for date changes (secondary).

**UX implications (unverified)**

- Same ministry as payee, with a mandate held and imported: no re-authorization is needed. Send the migration notice that Stripe requires.
- If a move shifts the debit date, give 10 days' notice (PAD) or 7 days' (ACH) before the first debit on the new date.
- Where Connect needs a new `on_behalf_of` mandate for PADs, the donor **must** re-authorize through Asym's own page, because Checkout and the Portal don't support this.
- Ending a PAD by notice needs **≥30 calendar days' written notice**, which Option A's 30-day minimum satisfies if counted in calendar days to the last debit.

## 5. Ending gifts gracefully

- **Fundraise Up's retired-plan email** says "their recurring plan will no longer be processed unless they provide updated payment details." Verified-vendor-doc: https://fundraiseup.com/blog/new-email-template-recurring-plan-failed/
- **Fundraise Up on legacy emails:** "check the 'Plan cancellation' or 'Donation failed' emails in your legacy platform when you cancel the recurring plans" — the old system may send its own confusing cancellation email. Verified-vendor-doc (FAQ, §1).
- **WeGive** frames unmoved gifts as "paused". Staff "Deactivate the matching plan in your old system so the donor is never charged twice", and record missed payments as offline gifts. Verified-vendor-doc (§1).
- **Restarting is a new agreement.** For a cancelled Stripe subscription, "you need to collect new payment information from them and create a new subscription." Verified-primary: https://docs.stripe.com/billing/subscriptions/overview
- **Dispute windows after the last charge** (verified-primary, Stripe):
  - PAD (personal accounts): "up to 90 calendar days."
  - ACH (personal accounts): "up to 60 calendar days."
  - PAD and ACH refunds: within 180 days.

**Recommended practice (unverified)**

- **Timing:** the end notice goes out at least 30 calendar days before the last legacy charge, with a short final note after it.
- **Content:** "Your monthly gift of $X to [missionary] through [old system] will end after [date]. You don't need to do anything to stop it." Add one prefilled restart button that stays valid after the cap, a line saying past receipts are unaffected, and a named contact.
- **Avoid:**
  - "failed", "cancelled by you", or "action required" after the deadline
  - guilt
  - more than one call to action
  - the old system's own cancellation emails going out unaligned
- **Bank debits:** send an s.31-style statement of the final debit date.

## 6. Staff and missionary tooling

- **Pushpay "Recurring Migration · Live" panel** (verified-vendor-doc): https://pushpay.com/resources/migration/
  - Shows "Moved 847 · In progress 156 · Reminder sent 85", 78% complete, "847 of 1,088 donors", "241 remaining".
  - The dashboard shows "who's switched, who hasn't, and where to focus follow-up."
  - "For donors who started but didn't finish their migration, the tool keeps the prompt front-of-mind."
- **WeGive:** staff get "an internal email each time a plan is reactivated"; "Missing" plans are the follow-up list. Verified-vendor-doc (§1).
- **Stripe toolkit:** "monitor your subscriptions starting from the first payment"; check "unrecoverable issuer decline codes such as `incorrect_number`". Verified-primary (§1).
- **MPDX** (secondary snippet): https://get.mpdx.org/2020/11/18/release-note-dashboard-re-design/
  - A late-commitments list with colour dots (0–30, 30–60, over 60 days late).
  - Tasks show as "Overdue"/"Today", with a "Next Actions" prompt. No automatic task creation was found.
- Recharge metrics (§3) and Nucleus's moved-percentages (r2) also apply.

## Best-practice journey (donor, staff, missionary)

_Unverified synthesis of the evidence above; dates relative to switch day (S)._

**Donor**

1. **S−7 to S, announcement.**
   - Token-copied donors: "Your gift continues; nothing to do; your statement will show [descriptor] from [date]."
   - Bank-debit donors: the notice Stripe and H1 require, plus 10-day (PAD) or 7-day (ACH) notice if the debit date shifts.
2. **S, invitation.** Only for donors who must act (PayPal, wallet or uncopied cards, new Connect mandates). One email per donor; subject "Keep your monthly gift to [Missionary] going".
3. **Confirmation page** (§1):
   - Copied card: one tap, a SetupIntent confirm that makes the first transaction customer-initiated.
   - Re-entry: Payment Element with Link.
   - Bank debit: an Asym-hosted mandate.
   - English or French.
4. **Receipt** with the next Asym charge date and the last old-system charge date, plus the mandate confirmation for bank debits.
5. **Weeks 2–5:** weekly reminders, opt-in SMS, personal contact from week 3.
6. **End notice** ≥30 calendar days before the last legacy charge, then a final note. The restart link outlives the cap.

**Ministry staff**

- **Switch-day checklist:** export request, cutover dates, old-system email suppression, legacy-cancel queue.
- **Tiles:** moved, in progress, not started, bounced, failed, ended; by donors and by amount.
- **Filters:** method, missionary, language, do-not-contact.
- **Bulk actions:** resend (revokes old tokens), mark contacted, export for mail.
- **Exceptions queue:** declines, double-charge risk, PayPal proof of stop.

**Missionary:** a "not yet moved" list of their own supporters with status and contact log; one-tap resend from the system; tasks and late flags that never mark moved gifts as late.

## Implications

_Unverified unless cited._

1. **Split the campaign into "no action needed" and "action needed" cohorts.** Vendors that copy tokens send no action request (Fundraise Up, Donorbox, GoFundMe Pro). Asking those donors to "confirm" adds friction and risk.
   - Still, a light on-session confirmation is the Stripe-recommended customer-initiated first transaction and reduces new-merchant-ID declines.
   - Decide per card cohort; for example, make confirmation optional but encouraged.
2. **Asym must build its own confirmation page.** It needs Customer Session redisplay filters for imported (`unspecified`) cards. Stripe's Portal and Checkout subscription mode can't handle PAD or ACH.
3. **Make the end notice ≥30 calendar days and written.** H1 s.31 requires this for PADs where the agreement is silent; adopt it for all methods. Also send a statement of the final debit date within 10 days.
4. **Do-not-contact must not suppress required notices.** Bank-debit notices are required, and CAN-SPAM/CASL treat relationship notices about an existing gift as transactional. Route do-not-contact donors to staff-delivered notices; don't skip them.
5. **Debit dates.** Any move that changes a debit date needs 10 days' (PAD) or 7 days' (ACH) notice. Prefer keeping the donor's existing day of month.
6. **Connect charge type decides re-authorization.** If PADs are taken `on_behalf_of` the connected account, imported mandates may not carry over and donors must re-authorize. Confirm with Stripe before promising "no action".
7. **Links** are single-purpose campaign tokens that expire at the cap. One click only re-confirms existing terms.
8. **Copy:** English and French (Québec), one CTA, tap targets ≥24×24 px. The end notice names the last charge, offers a restart and never says "failed".
9. **Dashboards count donors and dollars.** Missionaries see only their own supporters. Click-to-completion rates feed the attrition measure (part 6).
