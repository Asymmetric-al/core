# Q08-R2 — External evidence on moving recurring donors and closing the tail

_Research agent, read-only web research. Every URL accessed 2026-11-02. The decision covers donors still unmoved when the tail ends: (a) end with notice and a restart invitation, (b) keep as an ongoing external arrangement, or (c) extend the tail. It also sets the default import cadence for tail gifts._

Labels: **verified-primary** (card-network or Payments Canada rule, or a processor's docs on its own product, fetched and quote checked) · **verified-vendor-doc** (fundraising vendor or trade page, fetched and quote checked) · **secondary** (snippet, third party, or unsourced claim) · **unverified** (my inference).

**Blocked:**

- Planning Center transition article (404; snippet only)
- help.ministrybrands.com (403)
- wegive.com case studies (403)
- the Classy/GoFundMe Pro migration post (404)
- donorbox.org/migrations (truncated)
- the Simple Donation migration PDF (404)
- PayPal's cancel-subscription reference (404)

**Not found:**

- any independent, non-vendor attrition study
- PayPal's statement on whether a donor is emailed when the merchant cancels
- PaymentSpring export docs
- a published "timely enough" import-cadence norm

## 1. Attrition when donors must re-enter or re-authorize

**Reported outcomes (all vendor-reported)**

- **Children's Aid Foundation of Canada** (Engaging Networks PDF, 2025-03-07). Verified-vendor-doc (PDF text extracted): https://info.engagingnetworks.net/hubfs/Migration%20without%20Disruption-1.pdf
  - Donors had "to take specific steps to authorize".
  - "The legacy platform remained operational for nearly a year."
  - The foundation was able to "retain 90% of its recurring donors".
- **Tithely** (2023-01-21): with "one email a week for a month", "the average church will have 75%+ of their existing recurring givers moved over" in "the first 4-6 weeks". No sample or method given. Verified-vendor-doc: https://get.tithe.ly/blog/how-to-move-recurring-givers-to-a-new-giving-platform
- **Fundraise Up** (token transfer, no donor action): claims it can "retain 99% of existing recurring donors". The page says "in the first year" in one place and "in the first month" in another. Verified-vendor-doc (inconsistent): https://fundraiseup.com/comparison/fundraiseup-vs-bloomerang/
- **Pushpay:** dashboard art reads "847 of 1,088 donors · 241 remaining" (about 78%). It is an illustration, not a named result. Verified-vendor-doc: https://pushpay.com/resources/migration/

**Estimates and opinion (no study cited)**

- Erica Waasdorp, _NonProfit PRO_ (2022-09-08): "heard statistics like 20 to 30% of sustainers drop after a nonprofit transitions". She adds "It may take multiple emails, phone calls and letters" and "If you can have two systems side-by-side temporarily, that's ideal." Hearsay; verified-vendor-doc: https://stagingcbi.nonprofitpro.com/?p=33036
- Whole Whale (undated): "Without tokens, nonprofits lose 70-80% of monthly donors" "(only 20-30% will restart their donations)". Secondary: https://wholewhale.com/resources/risk-of-not-owning-your-nonprofit-donor-payment-data/
- Carl Bloom (2026-03-20): organizations "can lose up to 30% of their monthly donors during a CRM migration". Secondary: https://carlbloom.com/articles/nonprofit-monthly-giving-program-sustainer-strategy
- Shopify growth blog: "~27% of consumers choose to cancel" when asked to re-enter details. Secondary (snippet).
- **Baseline with no migration:** the Engaging Networks PDF cites "2-3% of recurring donors' payments fail each month", compounding to "25-30%" a year, and M+R 2024's "about 63%" of recurring donors still giving 13 months later (secondary).

**Reading (unverified).** Estimates run from about 1% loss (tokens moved, vendor claim) to 70–80% (no tokens, no campaign, unsourced). A structured re-entry campaign lands at about 75–90% moved, leaving a 10–25% residual for this decision. The only documented long-tail case needed about a year to reach 90%.

## 2. Vault and token migration

**Stripe PAN import** (verified-primary: https://docs.stripe.com/get-started/data-migrations/pan-import)

- **Process:** the old processor encrypts its export with Stripe's PGP key and uploads it over SFTP. "You validate and approve", and Stripe returns a mapping file.
- **Timing:** "Processors can take anywhere from a few days to several months to produce a final export." Imports "typically complete within 10 business days" after valid data arrives.
- **PCI:** "The Stripe PCI DSS compliance is sufficient." A Data Transfer Agreement "significantly lengthens the migration timeline." "The CVC isn't required to charge a saved card."
- **Not imported:** "Subscriptions, invoices, and other billing data". Stripe warns: "Cancel your previous subscriptions as soon as your Stripe subscriptions become active or you'll bill your customers twice."
- **Wallets:** Stripe "can't migrate other cards stored by digital wallets such as Google Pay". Source: https://docs.stripe.com/get-started/data-migrations/payment-method-imports
- **Declines:** the new merchant ID brings a "temporary increase in declined payments". Stripe advises sending "one-time and customer-initiated payments before recurring ones".
- **Connect:** Stripe says to "request a PAN data import, which migrates your payment and customer data to them" (the connected accounts), and to "import accounts in batches". Source: https://docs.stripe.com/connect/migrate-to-stripe
- **US ACH:** the intake form confirms "that you hold mandates". For `pm_` imports, Stripe emails donors to "confirm the mandate in accordance with Nacha requirements", and "Your customers don't need to do anything."
- **Canadian PADs:** Stripe imports only PADs "you confirm you hold the mandates for". Where earlier authorizations fall short of the PAD rules, "you must collect new authorizations".
- **Payments Canada Rule H1 s.28:** a PAD Agreement can be assigned only under a prominent assignment clause plus notice, or with written notice "a minimum of 10 calendar days in advance". Verified-primary: https://www.payments.ca/sites/default/files/h1eng.pdf. My reading (unverified): same payee with a new processor is not an assignment.

**Stripe-to-Stripe copy** (verified-primary, HTML extracted: https://docs.stripe.com/get-started/data-migrations/pan-copy-self-serve?copy-method=full)

- It copies customers with cards and US ACH.
- It "can't copy … pre-authorized debit payments (PADs)" or "Subscriptions".
- "Most data copies finish within 72 hours."
- For Connect accounts without Dashboard access, the platform must act.

**Other processors**

- **Braintree:** moves "customer information, credit card information, and certain PayPal billing agreements only". It says "we cannot migrate transaction history or subscription data", and a migration needs the "Authorized Signer". Verified-primary: https://developer.paypal.com/braintree/help/Migrations
- **Authorize.net:** no published turnaround time; exports reportedly cost $250–$500. Secondary: https://docs.payabli.com/guides/platform-tokenization-migrate-authorizenet
- **Fundraise Up lead times:** "1‑2 weeks if donor tokens are already in Stripe" and "3‑6 weeks if tokens need to be transferred from another payment gateway". The old provider "may charge a fee". Verified-vendor-doc: https://fundraiseup.com/docs/migration-faq/
- **Bloomerang:** "at minimum, two weeks' notice". Verified-vendor-doc: https://help.bloomerang.com/en/articles/13382796-how-do-i-transfer-recurring-donor-data-to-bloomerang-fundraising-from-another-provider

**PayPal**

- **Fundraise Up:** B- billing agreements migrate. I- subscriptions "can only be processed within PayPal", and "Revoking PayPal's access to your legacy platform may result in the loss of these subscriptions." Verified-vendor-doc: https://fundraiseup.com/docs/migration-paypal/
- **WeGive:**
  - I- subscriptions "can't be transferred by anyone".
  - B- agreements are portable only if they sit on the organization's own account.
  - It warns "Don't disconnect PayPal from your old platform yet."
  - Verified-vendor-doc: https://wegive-knowledge-base.help.usepylon.com/articles/4858887369-why-your-paypal-recurring-donors-don-t-always-move-with-you
- **PayPal Standard:** a subscription "will continue to bill unless cancelled on the paypal site by either the subscriber or the site owner" (aMember forum; secondary).

**Share of donors who avoid a re-ask:** no source gives one. My unverified estimate: cards in a gateway that will export PANs, minus wallet cards, minus expired cards. PayPal I- and wallet donors always re-enter.

## 3. Moving-donor communication practice

- **Nucleus 12-week plan** (Brady Shearer, updated 2026-08-16). Verified-vendor-doc: https://www.nucleus.church/blog/switch-church-giving-providers-plan
  - Week 4: "Keep the old platform available _only_ for existing schedules".
  - Week 5: "Send a direct email to every active recurring giver".
  - Week 6: send preselected links, though "The giver still reviews the choices and enters and authorizes their own payment information."
  - Weeks 8–9: personal reminders from a recognizable person.
  - Week 10: dated deadline ("Our previous online giving system will close on September 30.").
  - Week 12: close.
  - Track "Percentage of recurring givers moved" and "Percentage of recurring amount moved".
- **Tithely:** "a series of 1-4 emails (depending on response)", then "For the remaining recurring givers that haven't switched over, give them a call."
- **Pushpay** (2018-08-15): "Recurring Migration is an automated, templated campaign". It sends "a unique link to a giving form pre-populated with the same schedule, gift amount, and fund", with a "realtime dashboard". Verified-vendor-doc: https://pushpay.com/blog/new-in-pushpay-simplified-financial-administration-integrations-and-donor-engagement-just-in-time-for-back-to-school/
- **ChurchTrac** (2025-12-29): a 90-day plan with "personal follow-up: texts, emails, or even phone calls". Verified-vendor-doc: https://www.churchtrac.com/blog/switching-online-giving-platforms-a-guide-for-church-leaders
- **Givebutter template:** "set up a new monthly gift on our new page [link]"; "This donation will soon be canceled … as we are unable to transfer your current giving plans." Verified-vendor-doc: https://help.givebutter.com/en/articles/5662649-migrating-recurring-donors-to-givebutter
- **Planning Center:**
  - "Give yourselves 1-2 months", and announce the overlap dates and "the transition end date" (secondary, snippet).
  - A dual-system setup lets you "give donors a set window of time to migrate". Verified-vendor-doc: https://www.planningcenter.com/blog/2026/07/online-giving-at-planning-center-your-biggest-questions-answered
- **WeGive (no token transfer):** a plan "will begin processing automatically on the next scheduled charge date once a payment method is added", and "It will not retroactively charge for any missed payments." Verified-vendor-doc: https://help.wegive.com/articles/7408017502-when-donors-migrate-via-the-semi-automated-approach-no-token-transfer
- **Engaging Networks** (2026-10-07): "multiple touchpoints — emails, phone calls, and letters". Verified-vendor-doc.

## 4. Ending versus keeping

**What vendors advise**

- **End on a dated deadline (majority).**
  - Nucleus: "The old system will stop processing gifts for our church on [deadline]", and "If recurring gifts must be recreated, say so before the deadline arrives."
  - Givebutter, Planning Center and Tithely likewise set a deadline.
- **Keep running.**
  - Simple Donation (2020-11-02): "Allow the old system to process the remaining 5% for as long as it takes them to migrate". Verified-vendor-doc: https://www.simpledonation.com/resources/simple-donation-leverages-rock-to-migrate-recurring-giving
  - Children's Aid Foundation of Canada ran its old platform for about a year.
- **PayPal:** keep the old access until donors move (WeGive, Fundraise Up). No vendor describes a permanent external arrangement.

**Costs and mechanics of keeping**

- Authorize.net gateway: "$25 per month" plus per-transaction and daily batch fees. Secondary (snippet): https://www.authorize.net/sign-up/pricing.html. SiteStacker licence cost: not found.
- PayPal resends an IPN for up to four days, with up to 15 retries. After that, a still-running subscription's gifts must be pulled from reports or the API. Secondary (snippet of https://developer.paypal.com/api/nvp-soap/ipn/IPNIntro).
- Merchants cancel through POST `/v1/billing/subscriptions/{id}/cancel`, and `BILLING.SUBSCRIPTION.CANCELLED` fires. No PayPal statement says the donor is emailed. A plugin guide tells merchants to notify members themselves (secondary).

**Card rules** (Visa bulletin AI09067, effective 18 April 2020; verified-primary, PDF text extracted: https://usa.visa.com/content/dam/VCOM/global/support-legal/documents/subscription-merchants-visa-public.pdf)

- **Scope:** "merchants that offer free trials or introductory offers". Earlier rules, dating "back to 2011", already required "express, informed consent" and "a simple cancellation mechanism".
- **Reminder:** "at least seven (7) days before initiating a recurring transaction" when "The nature of the recurring agreement has changed (for example, the price or billing period)".
- **Cancellation:** "Merchants must provide an easy way to cancel … regardless of how the cardholder initially interacted with the merchant."
- **Mastercard (2019, revised 2021–22):** similar rules. Secondary.
- **FTC:** "click-to-cancel" was vacated on 2025-07-08. Secondary.

Unverified reading: no network rule requires notice before a merchant **stops** charging. A restart is a new agreement and needs fresh consent and disclosures.

## 5. Tail length norms

- **Weeks:**
  - Nucleus: 12 weeks, closing about 7 weeks after the first donor email.
  - ChurchTrac: 90 days.
  - Planning Center: 1–2 months (snippet).
  - Engaging Networks: "five to six weeks" to switch processors.
- **Months:** Children's Aid Foundation of Canada ran "nearly a year" and kept 90%. Simple Donation: "as long as it takes".
- **Response decay:** the only timed figure is Tithely's 75%+ moved within 4–6 weeks. Nucleus moves to personal reminders in weeks 8–9, so the late tail is one-to-one work. No independent decay curve was found.
- **Unverified:** a 12-month default sits at the long end of practice. Church norms are 2–3 months, and the long-tail case is a large Canadian charity.

## 6. Cadence of importing external gifts

- **MPDX:** "syncs with a donation system once daily and it may take up to 24 hours". Verified-vendor-doc: https://help.mpdx.org/article/202-mpdx-faqs. DonorHub "synchronizes daily" (secondary).
- **Fundraise Up:** external donations arrive from Virtuous "every 10 minutes" and from NPSP "every 20 minutes". They show as one-time gifts "even if they are part of a recurring plan", and Fundraise Up "cannot issue receipts for them". Verified-vendor-doc: https://fundraiseup.com/docs/offline-donations/
- **Planning Center:** donations from systems used "concurrently with Giving" are added through external payment sources, in batches or through the API. Secondary (snippet).
- **PayPal:** releases transaction data "about every 3 hours" (third-party; secondary).
- **Late-flag windows** (Q07-R2, `../../q07-legacy-tail-effects/research/q07-r2-external-stewardship.md` §3–4): MPDX "0-30 days late"; DonorElf "Late Donor" 10-day window; NPSP Lapsed at 60 days.
- **Not found:** any norm calling weekly, biweekly or monthly "timely enough". Missionary donor tools converge on **daily**.

## Common pattern

1. Transfer tokens where the old gateway will export them. Subscriptions never transfer, so schedules are recreated.
2. Without tokens, run old and new side by side. New gifts go to the new system at once; the old one serves existing schedules only.
3. Contact donors in this order:
   - announcement
   - direct email with a prefilled, donor-specific link
   - 1–4 weekly reminders
   - personal calls
   - a dated deadline
   - close-out, tracking both donors moved and dollars moved.
4. Most guides close on a published date after 2–3 months. A minority run about a year or indefinitely.
5. PayPal I- subscriptions cannot move. Keep old access alive until donors have moved.
6. Gift feeds into missionary tools run daily.

## Implications for Q08 (unverified unless cited)

- **(a) End with notice and a restart invitation** is the documented norm, and a 12-month tail is already well past typical practice. The ending should:
  - give a date
  - follow at least two reminders and one personal contact
  - carry a prefilled restart link.

  No card rule requires notice before stopping charges. Visa's 7-day reminder and easy-cancel rules support at least 7 days' written notice, and practice suggests about 30.

- **(b) An external arrangement only works for PayPal I- subscriptions,** and possibly B- agreements on the ministry's own account. PayPal keeps charging without the old system (secondary). Asym must then import from PayPal indefinitely, because IPN to a retired system stops after about four days. Make (b) a named exception with an owner, not a default.
- **(c) Extending has diminishing returns.** Moves cluster in weeks 4–10 and then become one-to-one work. Extend only for a cohort that is measurably still moving.
- **Vault copy:**
  - Request the PAN export on switch day, since exports take "days to months".
  - The light confirmation doubles as a customer-initiated first charge, which Stripe advises.
  - Canadian PADs need mandates that meet Rule H1.
  - Stripe's US ACH `pm_` imports email donors automatically; align Asym's messaging with them.
- **Import cadence:** of the options asked about, **weekly** is the only one that fits inside DonorElf's 10-day window and MPDX's first late bucket. Every two weeks or monthly would raise false "late" flags between batches. Use daily where an API exists, such as PayPal.
