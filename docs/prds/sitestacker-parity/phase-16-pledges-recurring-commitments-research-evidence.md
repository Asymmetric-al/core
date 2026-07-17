# Phase 16 — Pledges & Recurring Commitments: Primary Research Evidence

**Evidence status:** supporting research, not the product specification
**External-source access date:** 2026-07-13
**Supplemental authority verification date:** 2026-07-14
**Decision authority:** the ratified Phase 16 D1–D19 record remains authoritative
**Scope:** nonprofit CRM models, Stripe payment and billing behavior, reminder
policy, and accessible interaction patterns needed to implement Phase 16

## How to use this evidence

This file deliberately separates three kinds of statement:

- **Verified fact** describes current first-party documentation or a normative
  standard.
- **Phase 16 inference** explains what that fact means when combined with the
  ratified D1–D19 product decisions. It is a design conclusion, not a claim that
  a vendor requires the same design.
- **Do not infer** identifies a tempting but unsafe conclusion that the source
  does not support.

All external claims link directly to the organization that owns the product,
standard, or rule. Secondary comparison articles were excluded. Vendor
documentation demonstrates available patterns, not legal sufficiency or product
fit. Legal and policy sources are implementation inputs, not legal advice;
jurisdiction-specific classifications and copy still require counsel-approved
tenant policy.

## Executive findings

1. **Automatic recurring giving and fixed-total pledges are different promise
   products.** Current Virtuous documentation states the distinction directly:
   a pledge commits to a total, while a recurring gift sets an amount and
   schedule without a committed total and can end at the donor's choice.
   Salesforce, Bloomerang, and CiviCRM also retain separate schedule,
   transaction, and/or pledge concepts. This supports D1's separate products
   and D11's separation of promise, occurrence, payment, and fulfillment.
   [Virtuous](https://support.virtuous.org/hc/en-us/articles/6265003339661-Matching-Recurring-Gift-and-Pledge-Payments-in-Gift-Entry),
   [Bloomerang](https://help.bloomerang.com/en/articles/12632653-donations),
   [CiviCRM](https://docs.civicrm.org/dev/en/latest/financial/recurring-contributions/)
2. **A donor's schedule is business truth; a Stripe subscription is an
   executor.** Stripe supports anchored billing, short-month handling, future
   phases, mixed intervals, pauses, retries, and terminal cancellation, but
   those provider behaviors have their own limitations and side effects. The
   Phase 16 schedule must remain explicit and versioned, with provider bindings
   reconciled to it rather than treated as the product record.
   [Stripe billing anchors](https://docs.stripe.com/billing/subscriptions/billing-cycle),
   [subscription schedules](https://docs.stripe.com/billing/subscriptions/subscription-schedules)
3. **The initial donation and continuing schedule are two distinct facts.** A
   PaymentIntent collects money now; a SetupIntent saves a method without a
   charge. A future recurring start following an immediate first gift therefore
   needs an immediate payment lifecycle plus a separately authorized future
   schedule, with permanent deduplication across both.
   [PaymentIntent and SetupIntent lifecycle](https://docs.stripe.com/payments/paymentintents/lifecycle),
   [Setup Intents](https://docs.stripe.com/payments/setup-intents)
4. **ACH initiation is not successful receipt.** ACH Direct Debit can remain in
   `processing` for days, can fail asynchronously, and can rarely return after a
   PaymentIntent reached `succeeded`. Phase 16 must show processing truth,
   receipt only on the applicable successful event, and preserve later return
   corrections.
   [Stripe ACH Direct Debit](https://docs.stripe.com/payments/ach-direct-debit),
   [accept an ACH payment](https://docs.stripe.com/payments/ach-direct-debit/accept-a-payment)
5. **Provider delivery is at-least-once and unordered.** Stripe webhooks can be
   retried, duplicated, and delivered out of order. Stripe API idempotency keys
   may be removed after 24 hours. Phase 16 consequently needs durable local
   semantic idempotency, account-scoped event ingestion, monotonic folds, and
   reconciliation rather than webhook-order assumptions.
   [Stripe webhooks](https://docs.stripe.com/webhooks),
   [Stripe idempotent requests](https://docs.stripe.com/api/idempotent_requests)
6. **Staff convenience cannot manufacture payment authority.** Stripe requires
   permission for future off-session use, and ACH requires a mandate with
   method-specific acceptance evidence. A CRM screen that allows an edit is not
   proof that the donor authorized the edit. This supports D14–D15's explicit
   Party roles, instruction evidence, rail capability, and provider-control
   gates.
   [Stripe Setup Intents](https://docs.stripe.com/payments/setup-intents),
   [ACH mandates](https://docs.stripe.com/payments/ach-direct-debit),
   [ACH SEC codes](https://docs.stripe.com/payments/ach-direct-debit/sec-codes)
7. **Cash and expected support must stay visibly different.** Bloomerang
   separates pledge-raised amounts from revenue actually received, and Virtuous
   distinguishes recurring/future support from gift activity. This supports
   D12–D13's cash-first missionary presentation and derived, multi-axis support
   health.
   [Bloomerang raised and revenue](https://help.bloomerang.com/en/articles/12632860-about-raised-and-revenue-amounts),
   [Virtuous real-time giving](https://support.virtuous.org/hc/en-us/articles/360051246412-What-is-the-Real-Time-Giving-Report)
8. **Pledge reminders should be gentle, bounded, and proof-gated.** Blackbaud
   recommends friendly stewardship rather than collection language and uses a
   roughly 30-day upcoming reminder. Current UK guidance treats charitable
   fundraising email as direct marketing unless a valid route applies. This
   supports D19's explicit enrollment, fixed maximum, current recipient proof,
   easy purpose-specific stop, and no general journey builder.
   [Blackbaud](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/en-ca/content/bb-pledge-reminder-best-practices.html),
   [ICO](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-direct-marketing-using-electronic-mail/how-do-we-comply-with-the-pecr-electronic-mail-marketing-rules/)
9. **Financial commands need review, correction, and truthful outcomes.** WCAG
   2.2 requires a reversible, checked, or confirmed path for financial and
   legally consequential submissions. WAI and GOV.UK guidance favors short,
   labeled forms, concise error recovery, a check-answers step, and an explicit
   confirmation. Those patterns support the D4, D15, D18, and D19 interaction
   contracts.
   [WCAG 2.2 error prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html),
   [GOV.UK check answers](https://design-system.service.gov.uk/patterns/check-answers/)

## 1. Nonprofit CRM domain models

### 1.1 Salesforce Nonprofit Cloud and NPSP

**Verified facts**

- Current Nonprofit Cloud represents one-time pledges, multi-payment gifts, and
  open-ended recurring gifts as Gift Commitments, while using a schedule type to
  distinguish recurring schedules from custom schedules. Gift Transactions
  represent the actual gifts associated with those commitments.
  [Salesforce: Add a Gift Commitment](https://help.salesforce.com/s/articleView?id=sfdo.fundraising_create_gift_commitment.htm&language=en_US&type=5),
  [Salesforce: Fundraising](https://help.salesforce.com/s/articleView?id=sfdo.NPC_FR_Nonprofit_Cloud_Fundraising.htm&language=en_US&type=5)
- Gift Commitment Schedules hold timing, amount, payment method, and optional
  end-date data. Salesforce automatically creates or updates projected Gift
  Transactions when schedules change.
  [Salesforce: Schedule a Gift Commitment](https://help.salesforce.com/s/articleView?id=sfdo.fundraising_schedule_gift_commitments.htm&language=en_US&type=5),
  [Salesforce: Gift Commitment Processing](https://help.salesforce.com/s/articleView?id=sfdo.fundraising_gift_commitment_processing.htm&language=en_US&type=5)
- Current Nonprofit Cloud creates effective-dated schedule segments when a
  recurring commitment is changed, and records the change in an attribution
  log. It exposes explicit upgrade/downgrade, pause/resume, and close flows.
  [Salesforce: Manage Recurring Gift Commitments](https://help.salesforce.com/s/articleView?id=sfdo.fundraising_manage_gift_commitment.htm&language=en_US&type=5),
  [Salesforce Trailhead](https://trailhead.salesforce.com/content/learn/modules/nonprofit-cloud-fundraising-operations/create-and-manage-gift-commitments)
- NPSP separately teaches open-ended and fixed-length Recurring Donations,
  upcoming installments, pause, and close. Its status automation can mark a
  recurring donation lapsed or closed after configurable day thresholds.
  [NPSP recurring donations](https://trailhead.salesforce.com/content/learn/modules/donation-management-basics-with-nonprofit-success-pack/create-recurring-donations),
  [NPSP status management](https://trailhead.salesforce.com/content/learn/modules/opportunity-settings-in-nonprofit-success-pack/manage-recurring-donations-npsp)

**Phase 16 inference**

- Reuse the sound structural idea—commitment, schedule version, and actual
  transaction are distinct—but do not copy Salesforce's broad object vocabulary
  into one Asym aggregate. D1 requires the automatic open-ended recurring gift
  and the fixed-total campaign commitment to remain different products.
- Persist effective-dated schedule versions and append-only change evidence.
  Never overwrite the historical anchor, occurrence, authorization, or
  fulfillment facts when the donor changes future giving.
- Do not copy NPSP's configurable automatic closure. D8 and D12 define Asym's
  own regular-schedule recovery runway and derived health; payment failure does
  not silently become donor cancellation.

**Do not infer**

- Salesforce calling several products “Gift Commitments” does not prove they
  should share one lifecycle, status column, accounting meaning, or provider
  executor.
- A generated future Gift Transaction or Opportunity is not received money.

### 1.2 Virtuous

**Verified facts**

- Virtuous defines a pledge as a committed total that may have a schedule, and
  a recurring gift as an amount repeated on a schedule without a committed
  total. It describes automatic card, e-check, or bank transfer as the common
  recurring pattern while also supporting offline checks.
  [Virtuous: matching recurring and pledge payments](https://support.virtuous.org/hc/en-us/articles/6265003339661-Matching-Recurring-Gift-and-Pledge-Payments-in-Gift-Entry),
  [Virtuous: recurring gifts](https://support.virtuous.org/hc/en-us/articles/360051045072-What-are-Recurring-Gifts)
- Virtuous uses expected payments for tracking, but treats automatic-payment
  status as a separate flag. Its upcoming-payment report defaults to offline
  recurring gifts and can include automatic gifts when requested.
  [Virtuous Recurring Gift Payment Report](https://support.virtuous.org/hc/en-us/articles/360051708791-What-is-the-Recurring-Gift-Payment-Report)
- Virtuous lets a user change frequency and next expected payment date without
  rewriting past expected-payment history. Its documentation also exposes a
  provider-coupling hazard: canceling only the CRM record does not necessarily
  stop the integrated Stripe withdrawal.
  [Virtuous: modify a recurring gift](https://support.virtuous.org/hc/en-us/articles/4413264483341-How-Do-I-Modify-a-Recurring-Gift)
- Virtuous distinguishes cancellation from write-off based on whether the
  organization tracks pledges as receivables, and asks for a write-off reason.
  [Virtuous: cancel or write off a pledge](https://support.virtuous.org/hc/en-us/articles/360051529531-How-do-I-Cancel-or-Write-Off-a-Pledge)

**Phase 16 inference**

- The explicit pledge/recurring distinction validates D1. Automatic recurring
  giving should be the main donor and missionary path; offline fixed-total
  commitments remain a quieter edge workflow.
- Keep original expected dates immutable and re-anchor only future occurrences,
  as D4 requires.
- D16 must prevent the CRM/provider split-brain described by Virtuous. A donor
  stop is accepted immediately, but the UI must distinguish “instruction
  recorded” from “provider-confirmed stopped” until control proof exists.
- D18 must separate a donor-requested ending from an organization-only release.
  A vendor's “write-off” button is not permission to merge donor intent,
  accounting, or received-money correction.

**Do not infer**

- Virtuous's “past due” or contact-level “lapsed” labels are not suitable as
  Asym's sole truth. D12 requires separate donor intent, current schedule,
  collection health, provider control, and payment state.

### 1.3 Bloomerang

**Verified facts**

- Bloomerang currently distinguishes one-time donations, fixed promises
  (pledges), and indefinite recurring donations.
  [Bloomerang: Donations](https://help.bloomerang.com/en/articles/12632653-donations)
- Bloomerang's reporting says a pledge can count as “raised” before payment,
  while “revenue” includes money actually received; a recurring schedule itself
  is neither raised nor revenue.
  [Bloomerang: Raised and Revenue](https://help.bloomerang.com/en/articles/12632860-about-raised-and-revenue-amounts)
- Bloomerang applies a partial pledge payment to the installment balance and can
  apply an overpayment to the next installment. It also permits a household
  member's payment to fulfill another member's pledge while retaining the actual
  payer on the transaction.
  [Bloomerang: Add Pledge Payments](https://help.bloomerang.com/en/articles/12632723-add-pledge-payments)
- Bloomerang's current recurring-payment administration exposes next bill date,
  start date, optional end date, no-end-date filtering, pause, resume,
  cancellation, and history. Its capabilities vary by processor.
  [Bloomerang: Manage Recurring Payments](https://help.bloomerang.com/en/articles/13382639-manage-recurring-payments)
- Bloomerang allows form owners to choose the recurring cadence choices and a
  default cadence, and optionally expose donor-selected start and end dates.
  [Bloomerang: Recurring frequency options](https://help.bloomerang.com/en/articles/13382479-can-i-change-the-recurring-donation-frequency-options-that-display-on-my-donation-form)

**Phase 16 inference**

- D13 should show received cash from authoritative gifts, then automatic
  recurring support and its qualified future projection, while keeping
  fixed-total pledge promise values visually separate.
- D11's application grain must preserve who paid, whose commitment was
  fulfilled, which line/designation was fulfilled, the exact amount applied,
  and later reversal lineage. Household or representative relationships cannot
  silently rewrite the payment's Party.
- Tenant cadence availability is a versioned presentation policy for new
  commitments. Disabling a cadence must not mutate existing schedules.
- Provider-specific limitations must surface as capability outcomes rather than
  disappear behind a generic edit button.

**Do not infer**

- Bloomerang's overpayment-forward behavior is not automatically correct for
  Asym. D11's authoritative line-and-occurrence matcher must decide whether an
  excess amount has valid evidence for another expectation or remains
  unallocated/review-required.
- Bloomerang's documented automatic retry/auto-pause behavior is not Asym's D7–D8
  policy.

### 1.4 CiviCRM

**Verified facts**

- CiviCRM implements Pledges and Recurring Contributions as distinct
  capabilities. Recurring processing may be processor-managed or initiated by a
  CiviCRM scheduled job, depending on the integration.
  [CiviCRM recurring contributions](https://docs.civicrm.org/dev/en/latest/financial/recurring-contributions/),
  [CiviCRM contribution pages](https://docs.civicrm.org/user/en/latest/contributions/contribution-pages/)
- A pledge records a total, installment timing, pledge date, payment start,
  financial type, campaign, optional self-service payment page, and optional
  reminder configuration. Offline payments are manually marked complete.
  [CiviCRM pledge model](https://docs.civicrm.org/user/en/latest/pledges/what-you-need-to-know/),
  [CiviCRM pledge tasks](https://docs.civicrm.org/user/en/latest/pledges/everyday-tasks/)
- CiviCRM's general scheduled-reminder engine can target multiple entity types,
  channels, recipient sets, arbitrary relative timing, repetition, and custom
  content. Its own documentation lists privacy flags, held addresses, disabled
  jobs, and missed cron windows as reasons reminders may not send.
  [CiviCRM scheduled reminders](https://docs.civicrm.org/user/en/latest/email/scheduled-reminders/)

**Phase 16 inference**

- Preserve the executor boundary: whether Stripe or Asym initiates a payment is
  explicit, current, and mutually fenced. Imported externally managed schedules
  remain read-only or quarantined until provider authority is proven.
- Do not build CiviCRM's generic reminder studio in Phase 16. D19 intentionally
  allows only a platform-governed two-stage maximum, tenant-wide reduction, and
  explicit current-plan enrollment.
- A scheduler delay must not cause a late surprise reminder. A passed D19
  candidate is skipped visibly, not sent on the next cron run.

### 1.5 Blackbaud

**Verified facts**

- Blackbaud's current reminder guidance frames pledges as generous commitments,
  recommends friendly and personal reminders rather than collection letters,
  suggests including the expected date, amount, and campaign/fund, and uses a
  roughly 30-day upcoming reminder followed by a compassionate follow-up.
  [Blackbaud: Pledge Reminder Best Practices](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/en-ca/content/bb-pledge-reminder-best-practices.html)
- Blackbaud's reminder process can generate reminders per pledge and can also be
  used for recurring gifts, demonstrating that a vendor feature can span
  products even when their business meanings differ.
  [Blackbaud: Reminders](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/crm/us/40/Content/RPPledgeReminders.html)

**Phase 16 inference**

- D19's “Gentle” profile should retain the stewardship tone and 30-day upcoming
  stage, but the follow-up candidate must use current D12 source-aware review
  truth rather than a blind calendar offset.
- The subject and body must never imply debt, delinquency, an invoice, or a
  guaranteed missing gift. The follow-up must account for checks in transit,
  pending ACH, unmatched gifts, stale source data, and later plan changes.

**Do not infer**

- A Blackbaud reminder feature spanning pledges and recurring gifts does not
  justify one Asym notification policy. Payment-failure recovery and fixed-total
  pledge reminders have different authority, timing, consent, and truth gates.

## 2. Stripe recurring-schedule and executor evidence

### 2.1 Supported intervals and the twice-monthly boundary

**Verified facts**

- A Stripe recurring Price uses `day`, `week`, `month`, or `year`, plus an
  `interval_count`. Quarterly and semiannual behavior can therefore use monthly
  intervals with counts of three and six; every two weeks and every four weeks
  use week intervals with counts of two and four.
  [Stripe Price object](https://docs.stripe.com/api/prices/object)
- Stripe does not expose “twice monthly on the 1st and 15th” as one Price
  interval. A 14-day or 15-day interval is not calendar-equivalent to the fixed
  1st-and-15th schedule.
  [Stripe Price object](https://docs.stripe.com/api/prices/object)
- Flexible mixed-interval subscriptions can contain multiple item intervals,
  but only for supported interval relationships. A mixed subscription also has
  one dunning outcome: a failure associated with one item's invoice can affect
  the entire subscription.
  [Stripe mixed intervals](https://docs.stripe.com/billing/subscriptions/mixed-interval)

**Phase 16 inference**

- The exact D3 catalog remains: weekly, every two weeks, twice monthly on the
  1st and 15th, every four weeks, monthly, quarterly, semiannual, and annual.
  Every label says exactly what happens and every amount is per occurrence.
- Implement the fixed twice-monthly schedule as two explicit calendar execution
  legs tied to one visible recurring-gift line. Do not approximate it with an
  interval and do not expose two donor commitments.
- Retain D2's compatible billing cohorts even though Stripe now supports some
  mixed intervals. Donor actions, dunning, pause, payment method, and control
  loss must never create surprising sibling-line effects.

### 2.2 Anchor, short-month, and timezone behavior

**Verified facts**

- Stripe defines the billing-cycle anchor as the reference point for recurring
  periods. By default it is the subscription creation date (or trial end), and
  it sets the weekday, day of month, and annual month/day alignment.
  [Stripe billing cycle](https://docs.stripe.com/billing/subscriptions/billing-cycle)
- Stripe documents that a January 31 monthly anchor bills on February's last
  day and returns to March 31. Its anchor configuration is UTC-based.
  [Stripe billing cycle](https://docs.stripe.com/billing/subscriptions/billing-cycle)
- Resetting an existing anchor to `now` can immediately generate an invoice;
  changing intervals and some cancellation changes can also move the provider
  anchor or create prorations.
  [Stripe billing cycle](https://docs.stripe.com/billing/subscriptions/billing-cycle),
  [Stripe subscription changes](https://docs.stripe.com/billing/subscriptions/change)

**Phase 16 inference**

- Store the donor-selected civil date, IANA timezone, immutable original anchor,
  and current prospective schedule version independently of Stripe timestamps.
- Today is the default anchor. A donor can choose today or a future date before
  submission. Never normalize to the 1st, 15th, or tenant billing day.
- Monthly 29th–31st and annual February 29 use last-valid-day fallback and return
  to the original anchor when possible. Retries, delayed settlement, and late
  success never re-anchor the grid.
- Any schedule change preview must show the next two or three civil dates and
  must explicitly state whether it triggers a payment today. Ordinary schedule
  edits use no silent proration, catch-up, or immediate invoice.
- Convert the civil schedule to provider UTC intentionally and test DST boundary
  cases. A raw Stripe UTC timestamp is not the donor-facing schedule definition.

### 2.3 Immediate first gift plus a future continuing schedule

**Verified facts**

- A PaymentIntent collects an immediate payment and tracks authentication and
  status throughout that payment's lifecycle. A SetupIntent saves and optimizes
  a payment method for later use but creates no charge.
  [Stripe PaymentIntents](https://docs.stripe.com/payments/payment-intents),
  [Stripe lifecycle](https://docs.stripe.com/payments/paymentintents/lifecycle)
- `setup_future_usage=off_session` on the immediate PaymentIntent can optimize
  the same payment method for future off-session use, subject to permission and
  payment-method support.
  [Stripe PaymentIntents](https://docs.stripe.com/payments/payment-intents)
- Subscription schedules can start in the future and can automate sequential
  phases. Stripe recommends duration-based phases because manually aligned
  phase dates are error-prone.
  [Stripe subscription schedules](https://docs.stripe.com/billing/subscriptions/subscription-schedules)

**Phase 16 inference**

- If the continuing anchor is today, the immediate first gift is the first
  occurrence and the next occurrence is one full cadence later. Create no
  second same-day invoice.
- If the donor chooses a future recurring start, attempt the first actual gift
  immediately, then begin the continuing schedule on the selected date. The
  checkout review names both facts separately.
- Use separate semantic identities for checkout command, initial occurrence,
  initial PaymentIntent, recurring line, schedule version, cohort/provider
  executor, and every later occurrence. One browser retry cannot duplicate any
  of them.
- A SetupIntent alone cannot satisfy D4's initial-gift requirement because it
  does not collect money.

### 2.4 Cohorts, schedule changes, pause, and cancellation

**Verified facts**

- A Stripe subscription can contain multiple items. In mixed intervals, each
  item has its own period dates, while cancellation and dunning can still affect
  the subscription as a whole.
  [Stripe mixed intervals](https://docs.stripe.com/billing/subscriptions/mixed-interval)
- Stripe's stable `pause_collection` keeps the subscription status unchanged and
  still creates invoices. With `behavior=void`, new paused-window invoices are
  voided; invoices created before the pause continue retrying unless explicitly
  handled.
  [Stripe pause collection](https://docs.stripe.com/billing/subscriptions/pause-payment)
- Stripe's true subscription Pause endpoint halts invoicing through a preview
  API that requires flexible billing mode and has material exclusions,
  including attached schedules.
  [Stripe Pause preview](https://docs.stripe.com/billing/subscriptions/pause)
- An immediately canceled subscription is terminal and cannot be reactivated.
  Open/draft invoices have automatic advancement disabled, but pending invoice
  items and other active subscriptions can still produce later charges unless
  explicitly reconciled.
  [Stripe cancellation](https://docs.stripe.com/billing/subscriptions/cancel)
- Stripe supports pending updates for changes whose billing effect should apply
  only if the associated new invoice succeeds.
  [Stripe subscription changes](https://docs.stripe.com/billing/subscriptions/change)

**Phase 16 inference**

- Do not depend on the preview Pause surface for Phase 16. Use a version-pinned,
  tested provider adapter and the ratified D5 suppression semantics; explicitly
  close or void pre-existing retryable invoices as required.
- Skip and pause never accumulate donor debt. Resume returns to the unchanged
  donor grid and never charges immediately unless the donor separately confirms
  a give-now action.
- A one-line action inside a shared compatible cohort uses a previewed,
  idempotent prospective split. A whole-cohort action lists all affected lines,
  amounts, and dates before confirmation.
- Cancellation accepts the donor instruction immediately, fences all new local
  work, then shows a truthful provider-confirmation state. Restart creates a new
  authorization and provider-binding epoch; it never reactivates the old
  canceled executor or back-charges missed periods.

### 2.5 Stripe SDK, request, and webhook API-version contract

**Verified facts**

- On the 2026-07-13 access date, Stripe's official API reference identifies
  `2026-06-24.dahlia` as the current API version. Stripe also states that
  stripe-node v12 and later align request types to the API version current when
  the SDK version shipped; overriding that version can make TypeScript types
  inaccurate. Webhook endpoints can carry their own pinned API version.
  [Stripe API versioning](https://docs.stripe.com/api/versioning?lang=node)
- Current repo evidence is deliberately older: `packages/api/package.json`
  pins `stripe@22.2.0`, while
  `packages/api/src/stripe/api-version.ts` pins `2026-05-27.dahlia` and requires
  the shared client factory to keep SDK and request behavior aligned. This is a
  real-vs-forward anchor, not a request to edit dependencies in this planning
  phase.

**Phase 16 inference**

- Before implementation, record one explicit compatibility decision for the
  Stripe SDK version, request API version, Connect webhook endpoint version,
  CLI/test-fixture version, and event-object shapes. Either remain deliberately
  pinned or upgrade them together after reviewing the official changelog and
  replaying representative recurring, Connect, card, ACH, invoice, cancellation,
  dispute/return, and account-control fixtures.
- Never copy a field or enum from the latest docs into code while leaving the
  SDK/request/webhook contract on an older shape. Never silently bump the API
  version inside a feature ticket. CI must fail on an unreviewed pin drift and
  require fixture/type/allowlist review.
- Store each incoming event's declared API version and environment/account
  routing facts with the immutable raw event so reconciliation can explain a
  historical payload after a future version upgrade.

## 3. Payment, retry, webhook, and control truth

### 3.1 Card and ACH states

**Verified facts**

- PaymentIntents have explicit states such as `requires_payment_method`,
  `requires_action`, `processing`, `succeeded`, and `canceled`. Additional
  authentication can therefore prevent immediate success even for a card.
  [Stripe PaymentIntent lifecycle](https://docs.stripe.com/payments/paymentintents/lifecycle)
- ACH Direct Debit is a reusable delayed-notification method. Stripe says the
  acknowledgement can take up to four business days, and a submitted ACH
  PaymentIntent remains `processing` until it later succeeds or fails.
  [Stripe ACH](https://docs.stripe.com/payments/ach-direct-debit),
  [Stripe ACH acceptance](https://docs.stripe.com/payments/ach-direct-debit/accept-a-payment)
- ACH can rarely fail after an earlier `succeeded` transition, and consumer ACH
  disputes can generally occur for up to 60 calendar days. A successful dispute
  invalidates the mandate.
  [Stripe ACH](https://docs.stripe.com/payments/ach-direct-debit)
- Instant account verification proves account access; it does not prove that a
  debit has settled.
  [Stripe ACH verification and flow](https://docs.stripe.com/payments/ach-direct-debit)

**Phase 16 inference**

- Card confirmation, ACH initiation, ACH success, ledger posting, receipt
  eligibility, payout availability, and later return correction remain separate
  facts.
- Send an initiation confirmation for processing ACH, never a final successful
  gift receipt. Only the applicable authoritative success event can post the
  received gift and issue the success receipt. A later return appends reversal
  and receipt-correction lineage.
- Neither checkout submission nor provider object creation activates a
  “successfully funded” state. Donor, staff, missionary, and reporting surfaces
  consume one normalized payment-state contract.

### 3.2 Retry authority

**Verified facts**

- Stripe Billing offers Smart Retries and custom retries. Custom schedules allow
  up to three retries. Stripe does not execute automatic retries for certain hard
  declines, missing methods, India-issued cards, or disconnected Connect
  accounts.
  [Stripe automatic retries](https://docs.stripe.com/billing/revenue-recovery/smart-retries)
- Stripe can optionally retry insufficient-funds ACH debits up to two times in a
  40-day window. It blocks certain bank accounts after return reasons that
  require review under ACH rules.
  [Stripe ACH](https://docs.stripe.com/payments/ach-direct-debit),
  [Stripe blocked bank accounts](https://docs.stripe.com/payments/ach-direct-debit/blocked-bank-accounts)
- Current nonprofit vendors use materially different recovery policies.
  Bloomerang documents one product path that pauses after three retries, while
  Virtuous documents a micro/macro sequence and then pauses. Vendor policy is
  therefore not a universal standard.
  [Bloomerang recurring payments](https://help.bloomerang.com/en/articles/13382639-manage-recurring-payments),
  [Virtuous failed recurring charge](https://support.virtuous.org/hc/en-us/articles/9558987437581-What-Happens-if-a-Recurring-Charge-Fails-with-Virtuous-Payments)

**Phase 16 inference**

- D7 is the sole automatic card retry budget: weekly uses original/+2/+4;
  other supported cadences use original/+2/+4/+6, with exact collision and
  cutoff rules from the ratified decision. Do not enable an overlapping Stripe
  Smart Retry policy.
- D8 applies the D7 burst to the triggering occurrence and the next three
  normally scheduled occurrences. The fourth later occurrence is regular-
  schedule-only. Every failed occurrence closes without debt; no success later
  collects prior misses.
- D10 disables unattended ACH retry. A return creates donor-confirmed recovery,
  and invalid or disputed mandates require fresh proof before another debit.
- Hard decline, authentication required, mandate invalid, provider disconnected,
  and unknown control are non-retryable until their named precondition is
  repaired. A timer never turns them retryable.
- One canonical recovery communicator avoids duplicate Stripe and Asym emails.
  Notification delivery does not control payment health.

### 3.3 Idempotency and webhooks

**Verified facts**

- Stripe recommends idempotency keys on POST requests, but may remove keys after
  24 hours. Reuse after pruning can execute a new request.
  [Stripe idempotency](https://docs.stripe.com/api/idempotent_requests)
- Stripe webhooks can retry for days, can arrive out of order, and can deliver
  duplicate Event objects. Stripe recommends signature verification, duplicate
  handling, asynchronous processing, and a quick `2xx` response.
  [Stripe webhooks](https://docs.stripe.com/webhooks)
- Connect webhooks identify the owning connected account in the event's
  top-level `account` field. Objects must be retrieved in that account context.
  [Stripe Connect webhooks](https://docs.stripe.com/connect/webhooks)

**Phase 16 inference**

- Persist a permanent tenant/account/mode-scoped semantic key before any Stripe
  mutation. The Stripe key is a second layer, not the system of record.
- Store verified raw events once, acknowledge quickly, process asynchronously,
  deduplicate both Event IDs and logical object-transition effects, and retrieve
  current provider objects when event order is insufficient.
- State folds must be monotonic and version-aware: a late `invoice.paid` cannot
  resurrect canceled donor intent; a late failure cannot erase a later
  authoritative recovery; and replay cannot emit a second contribution,
  receipt, notification, or retry.
- Reconciliation is a normal control loop, not an exceptional repair script.

### 3.4 Connect and provider-control loss

**Verified facts**

- Server-side operations for a connected account require the account context,
  normally the `Stripe-Account` header. Connect event payloads identify their
  connected account and `livemode`.
  [Stripe Connect authentication](https://docs.stripe.com/connect/authentication),
  [Stripe Connect webhooks](https://docs.stripe.com/connect/webhooks)
- Stripe emits `account.application.deauthorized` when an eligible connected
  account disconnects and `account.updated` for requirement/capability changes.
  [Stripe Connect webhooks](https://docs.stripe.com/connect/webhooks)
- ACH mandate ownership and merchant-of-record behavior can change with Connect
  charge topology. A mandate authorized for one connected account cannot simply
  be used with a different connected account.
  [Stripe ACH Connect considerations](https://docs.stripe.com/payments/ach-direct-debit)

**Phase 16 inference**

- Provider binding identity includes tenant, Stripe account, livemode, API
  version, object IDs, charge topology, and relevant capability/mandate facts.
- Any unknown or lost control invokes D16 quarantine: suppress new attempts,
  retries, widening changes, migrations, and stale command replay; continue to
  record donor stop/cancel instructions; and never claim the provider stopped
  until current evidence proves it.
- Recovery is cohort-by-cohort and proof-gated. A different account or executor
  cannot begin until the former executor is proven stopped and in-flight work,
  invoices, transfers, events, authorization, and ledger effects reconcile.
- Tenant incident management may aggregate operations, but donor and missionary
  projections remain privacy-safe and line/designation-scoped.

## 4. Authorization-bound donor and staff service

### 4.1 Reusable payment permission

**Verified facts**

- Stripe requires permission for future off-session use. Terms must at least
  cover permission to initiate payments, anticipated frequency, and how the
  amount is determined.
  [Stripe Setup Intents](https://docs.stripe.com/payments/setup-intents)
- ACH requires a mandate before debit. Online mandates are accepted in the
  payment UI; offline mandates require the terms to be presented in writing or
  over the phone. Recurring ACH also requires disclosure of how amounts are
  determined, and changes to recurring timing can trigger advance-notice duties.
  [Stripe ACH mandates](https://docs.stripe.com/payments/ach-direct-debit)
- ACH SEC codes distinguish web, written, business, and telephone authorization.
  Stripe's TEL documentation requires explicit oral authorization and either an
  audio record or written notice, but TEL is a private-beta, **single-debit-only**
  path. Stripe explicitly says TEL must not be used where a standing
  authorization exists or for recurring transactions.
  [Stripe ACH SEC codes](https://docs.stripe.com/payments/ach-direct-debit/sec-codes)

**Phase 16 inference**

- The donor-facing checkout review is part of authorization evidence. Store the
  rendered terms/template version, amount, cadence, anchor, timezone, optional
  final eligible date, designations, payment rail, merchant/account identity,
  acceptance method, actor, timestamp, and request correlation.
- Staff can provide broad service only through the D15 service desk. Every
  command independently proves: actor capability, donor/representative
  instruction authority, and provider/rail authorization.
- A staff note such as “donor called” is insufficient by itself. The command
  requires a structured instruction record and the correct card/ACH acceptance
  path. Staff never view or store raw card or bank credentials.
- A telephone instruction may be recorded as service evidence, but TEL cannot
  create, replace, or extend a recurring ACH mandate. A recurring ACH change
  must use a provider-supported recurring authorization path—for example,
  donor-accepted WEB terms or a qualifying signed/authenticated PPD or offline
  mandate flow—after provider and counsel qualification.
- Preview outcomes are server-derived: safe to perform; requires donor action;
  already in flight/prospective only; or unavailable because control or proof is
  missing. UI convenience cannot downgrade the result.

### 4.2 Parties and related roles

**Verified facts**

- Salesforce permits commitments by a contact or account and can allocate a
  commitment among designations. Bloomerang can apply a household member's gift
  to another member's pledge while keeping the actual payer attached to the
  gift.
  [Salesforce Gift Commitment](https://help.salesforce.com/s/articleView?id=sfdo.fundraising_create_gift_commitment.htm&language=en_US&type=5),
  [Bloomerang pledge payments](https://help.bloomerang.com/en/articles/12632723-add-pledge-payments)

**Phase 16 inference**

- D14's commitment Party is one explicit individual or organization. Keep
  distinct, effective-dated roles for authorized representative, service
  contact, payer, payment-method owner, gift donor, DAF advisor, and soft-credit
  recipient.
- No relationship grants another relationship. A household member, spouse,
  employee, DAF advisor, missionary, or service contact is not automatically an
  authorized instruction giver or payment-method owner.
- Every cross-Party role is tenant-scoped, evidence-bound, minimally projected,
  and revocable without rewriting history.

### 4.3 Current legal, network, and security release authorities

**Verified facts and exact applicability**

- The CFPB's current Regulation E §1005.10 requires a preauthorized consumer
  electronic-fund transfer to be authorized by a writing signed or similarly
  authenticated by the consumer, with a copy supplied to the consumer. Its
  official interpretation says the process must evidence identity and assent
  and that a merchant cannot sign on the consumer's behalf from oral permission
  alone. The same section governs stop-payment rights and advance notice for
  varying amounts. This is a United States consumer-EFT input; exact product
  copy and applicability still require the counsel gate.
  [CFPB Regulation E §1005.10 — current regulation, accessed 2026-07-14](https://www.consumerfinance.gov/rules-policy/regulations/1005/10/)
- Visa's public **18 April 2026** Core Rules and Product and Service Rules require
  stored-credential agreements to disclose merchant/contact facts, amount or
  amount method, currency, use, timing/frequency, and expiration when
  applicable. Table 5-22, ID 0029267 (edition April 2026, last updated October
  2025), says a declined merchant-initiated stored-credential authorization
  requires written cardholder notice and at least seven calendar days to pay by
  other means. Region- or program-specific rules remain scope-specific, and the
  exact acquirer program must be proved at release rather than inferred from a
  generic Visa label.
  [Visa public rules — 18 April 2026 edition, pp. 458–463, accessed 2026-07-14](https://cis.visa.com/dam/VCOM/download/about-visa/visa-rules-public.pdf)
- Nacha's archived 2015 official rule-change explainer requires qualifying reinitiated entries
  to retain exact identifying/amount facts and use `RETRY PYMT`; it distinguishes
  a later independent debit in a preauthorized recurring series from
  reinitiation and says an unauthorized return cannot simply be reinitiated.
  The public page is not a substitute for the licensed current Rules or the
  tenant's processor/ODFI contract. Phase 16 therefore permits R01/R09 recovery
  only after current, written processor/ODFI proof for the exact path; absent or
  expired proof fails closed to the normal future schedule.
  [Nacha archived 2015 ACH Network Risk and Enforcement Topics explainer, accessed 2026-07-14](https://www.nacha.org/rules/ach-network-risk-and-enforcement-topics)
- Stripe's current ACH SEC-code documentation distinguishes WEB, PPD, CCD, and
  TEL evidence. It explicitly limits TEL to single entries and says not to use
  TEL for a recurring transaction. Stripe Terminal's MOTO documentation says
  access is account/reader dependent, MOTO is card-not-present, only eligible
  donor-initiated phone/mail instructions may use it, future-use consent is
  still required, and the merchant owns identity/compliance obligations.
  [Stripe ACH SEC codes, accessed 2026-07-14](https://docs.stripe.com/payments/ach-direct-debit/sec-codes),
  [Stripe Terminal MOTO, accessed 2026-07-14](https://docs.stripe.com/terminal/features/mail-telephone-orders/overview)
- OWASP's Transaction Authorization implementation guidance requires the authorizer to see and
  acknowledge significant transaction facts, server-side enforcement, a
  sequential state machine, unique and time-bounded authorization credentials,
  invalidation when signed terms change, and a final authorization gate at
  execution. Its CSRF guidance confirms that authenticated browser mutations
  still require CSRF defenses. These are authoritative security implementation
  guidance and a release baseline, not a formal standard,
  not proof of legal payment authority by themselves.
  [OWASP Transaction Authorization, accessed 2026-07-14](https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html),
  [OWASP CSRF Prevention, accessed 2026-07-14](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- RFC 8058 defines a narrow one-click unsubscribe HTTPS POST, requires the
  unsubscribe headers to be covered by DKIM, forbids cookies or HTTP
  authorization on the receiver-generated POST, and recommends an opaque,
  hard-to-forge identifier. It supports D19's purpose-only stop endpoint; it
  does not authorize a financial or commitment mutation.
  [RFC 8058, January 2017, accessed 2026-07-14](https://www.rfc-editor.org/rfc/rfc8058)

**Phase 16 inference**

- Release evidence is a versioned allowlist, not a wiki citation. Each enabled
  rail/action records jurisdiction, network/program, provider/account path,
  source version/date, accountable reviewer, review expiry, and resulting
  policy/adapter version. Missing, stale, conflicting, or out-of-scope evidence
  narrows or disables only that lane.
- D15's short service workflow is safe because convenience never substitutes
  for authority: the server re-proves the operator, Party instruction, exact
  collection authorization, current terms hash, and provider capability at
  apply. D9/D10/D19 notices use the stricter applicable live rule while keeping
  card, ACH, and communication-purpose semantics separate.

## 5. Fixed-total campaign commitments and fulfillment

### 5.1 Total-first, optional plan

**Verified facts**

- Virtuous says a pledge can have a specific schedule or remain more fluid; its
  defining property is the committed total.
  [Virtuous pledge distinction](https://support.virtuous.org/hc/en-us/articles/6265003339661-Matching-Recurring-Gift-and-Pledge-Payments-in-Gift-Entry)
- Salesforce Nonprofit Cloud uses a custom schedule for non-recurring
  commitments and supports multiple separately dated payments.
  [Salesforce schedules](https://help.salesforce.com/s/articleView?id=sfdo.fundraising_schedule_gift_commitments.htm&language=en_US&type=5)
- CiviCRM and Bloomerang expose scheduled pledge payments and manual payment
  application. CiviCRM's schedule is editable; Bloomerang preserves payment and
  pledge relations.
  [CiviCRM pledge tasks](https://docs.civicrm.org/user/en/latest/pledges/everyday-tasks/),
  [Bloomerang pledge payments](https://help.bloomerang.com/en/articles/12632723-add-pledge-payments)

**Phase 16 inference**

- D17 records the total first. “Add installment plan” is a separate progressive
  action, never a required pledge-creation question.
- A plan contains named expectations plus any explicit undated remainder. It is
  planning truth only: not a receivable, invoice, cash, payment authorization,
  executor instruction, or reminder enrollment.
- Preserve exact conservation: promised total equals named expectation amounts
  plus undated remainder at every accepted version. Reject rounding drift and
  overlapping or invalid dates.
- Expected dates use the pledge's civil timezone and remain immutable historical
  facts when a later plan version changes future expectations.

### 5.2 Authoritative line-and-occurrence fulfillment

**Verified facts**

- Virtuous matches recurring expected payments using contact, date, amount, and
  project, but requires explicit selection for pledge payments. Bloomerang can
  link partial and household payments to a pledge.
  [Virtuous matching](https://support.virtuous.org/hc/en-us/articles/6265003339661-Matching-Recurring-Gift-and-Pledge-Payments-in-Gift-Entry),
  [Bloomerang pledge payments](https://help.bloomerang.com/en/articles/12632723-add-pledge-payments)

**Phase 16 inference**

- D11 makes the application record authoritative, not a heuristic match or
  denormalized counter. Each application names the received-gift line, pledge
  line, optional expectation, amount, provenance, actor/automation rule, and
  reversal lineage.
- Automatic application requires one of the PRD's three independent closed proof
  paths: complete provider lineage, an authenticated donor instruction, or an
  approved authenticated versioned structured-remittance mapping. Every path
  re-proves the exact tenant, Commitment Party, designation, currency, source and
  target capacity, and current authority. Deterministic amount/date, name, memo,
  OCR, household, or relationship similarity may only propose an explained review
  candidate; it never authorizes application.
- Partial, split, over, late, reversed, refunded, returned, anonymous, DAF,
  household, and restricted gifts must conserve money exactly. No gift amount is
  applied twice, and projection rebuild equals the journal.

### 5.3 Change, ending, internal release, and correction

**Verified facts**

- Salesforce closes commitments and can map future unpaid/failed transactions
  to canceled or written-off states. Virtuous distinguishes cancellation from
  write-off based on organizational accounting posture.
  [Salesforce close](https://help.salesforce.com/s/articleView?id=sfdo.fundraising_close_gift_commitment.htm&language=en_US&type=5),
  [Virtuous cancel/write-off](https://support.virtuous.org/hc/en-us/articles/360051529531-How-do-I-Cancel-or-Write-Off-a-Pledge)

**Phase 16 inference**

- D18 keeps four actions behind one calm doorway: donor-requested change,
  donor-requested ending, organization-only release from expectation, and
  factual correction. Each produces a different append-only operation and
  viewer meaning.
- None of those operations silently changes received gifts, D11 applications,
  receipts, restrictions, provider finality, or Phase 20 accounting.
- A reduction below fulfilled amount, late gift after ending/release, concurrent
  changes, dispute, inverse, or in-flight provider payment becomes an explicit
  conserved outcome or review state—not a destructive rewrite.

## 6. Reporting and viewer hierarchy

**Verified facts**

- Bloomerang distinguishes money received from pledge-raised values and excludes
  a recurring schedule itself from both transaction categories.
  [Bloomerang raised and revenue](https://help.bloomerang.com/en/articles/12632860-about-raised-and-revenue-amounts)
- Virtuous provides separate reports for upcoming recurring payments and pledge
  payments, including next/last payment facts and fulfillment totals.
  [Virtuous recurring report](https://support.virtuous.org/hc/en-us/articles/360051708791-What-is-the-Recurring-Gift-Payment-Report),
  [Virtuous pledge report](https://support.virtuous.org/hc/en-us/articles/360051245192-What-is-the-Pledge-Payment-Report)
- Salesforce exposes projected committed revenue alongside upcoming
  transactions, while recalculating the projection after schedule changes.
  [Salesforce Trailhead](https://trailhead.salesforce.com/content/learn/modules/nonprofit-cloud-fundraising-operations/create-and-manage-gift-commitments)

**Phase 16 inference**

- The missionary dashboard hierarchy is: authoritative received cash this
  month; automatic card/ACH recurring support and qualified upcoming support;
  then a quiet conditional “Other commitments” section for fixed-total pledges.
- “Last successful gift,” “next scheduled gift,” “next possible retry,” “resume
  date,” and “final eligible date” are distinct fields. A scheduled gift is not
  guaranteed cash.
- Missionaries are read-only and see only authorized designation-scoped facts.
  They never see payment credentials, provider IDs, decline codes, mandate
  evidence, staff notes, reminder consent, service-contact details, or sibling
  lines outside their scope.
- Fixed-total pledge values are never smuggled into cash or normalized monthly
  recurring totals. Derived planning values carry their horizon, policy version,
  confidence/qualification, and exclusion reasons.

## 7. Reminder law, policy, and donor dignity

### 7.1 Legal and policy evidence

**Verified facts**

- The FTC says CAN-SPAM's transactional/relationship categories are narrow and
  message primary purpose controls classification. Commercial messages require
  a functioning opt-out, and a sender cannot outsource its legal responsibility
  to its email provider.
  [FTC CAN-SPAM guide](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business)
- The ICO's charitable-purposes soft opt-in took effect on 2026-02-05. It applies
  only when the charity meets specific conditions, including direct collection
  of contact details, a qualifying expression of interest or support, sole use
  for its own charitable purposes, an opt-out at collection, and an opt-out in
  every later message. Contact details collected before the commencement date do
  not qualify merely because they are already held.
  [ICO electronic-mail guidance](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-direct-marketing-using-electronic-mail/how-do-we-comply-with-the-pecr-electronic-mail-marketing-rules/),
  [ICO 2026 announcement](https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2026/04/charities-given-new-flexibility-to-contact-supporters-under-data-law-change/)
- The UK Code of Fundraising Practice effective 2025-11-01 requires legal,
  honest, respectful fundraising; avoiding undue pressure and unreasonable
  persistence; honoring requests to end interactions; accurate suppression
  systems; and simple preference withdrawal.
  [Fundraising Regulator Code](https://www.fundraisingregulator.org.uk/code),
  [2025 Code PDF](https://www.fundraisingregulator.org.uk/sites/default/files/2025-05/Fundraising%20Regulator%20-%20Code%20of%20Fundraising%20Practice.pdf)

**Phase 16 inference**

- A pledge reminder is governed fundraising/stewardship communication by
  default. Do not classify it as transactional merely because a pledge exists.
- D19 eligibility is the intersection of platform safety, tenant availability,
  explicit current-plan enrollment, current verified purpose-bound service
  contact, applicable legal basis/consent, current suppressions, current pledge
  and fulfillment truth, and an approved Phase 17 template. Any current “off”
  wins.
- Store the exact jurisdiction/purpose classification and evidence snapshot used
  at candidate evaluation and again at submission. A later policy loosening
  never retroactively enrolls or resurrects a stage.
- Recipient stop is purpose-specific, simple, free, and does not require login,
  a reason, or a pledge change. The message also carries any broader opt-out
  required by applicable policy.

### 7.2 Reminder product boundary

**Verified facts**

- Blackbaud recommends one friendly reminder about 30 days before the expected
  installment and a considerate follow-up if the organization still has no
  response.
  [Blackbaud reminder guidance](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/en-ca/content/bb-pledge-reminder-best-practices.html)
- CiviCRM exposes a much broader reminder builder with relative timing, repeat
  intervals, channels, recipients, and templates.
  [CiviCRM scheduled reminders](https://docs.civicrm.org/user/en/latest/email/scheduled-reminders/)
- Bloomerang's current pledge-reminder recommendation is a staff report of
  upcoming installments, illustrating a manual worklist alternative rather than
  automatic donor contact.
  [Bloomerang scheduled reports](https://help.bloomerang.com/en/articles/12632833-scheduled-reports-best-practices)

**Phase 16 inference**

- D19 ships one fixed Gentle profile. Tenant administrators choose only:
  Unavailable, upcoming stage only, or upcoming plus one source-aware follow-up.
  Every tenant and pledge begins Off.
- Staff explicitly enroll the current plan and verified service contact after
  reviewing the exact possible dates. Save, import, tenant enablement, and plan
  creation never enroll.
- The upcoming candidate is 30 calendar days before a named expectation. The
  follow-up candidate is D12's source-aware `review_after`, never the due date
  and never an arbitrary repeat interval.
- Late enrollment never catches up. Undated remainder produces no reminder.
  Current fulfillment, pending payment, ambiguous matching, stale source,
  changed authority/contact, invalid template, or suppression blocks the stage.
- No third touch, SMS escalation, AI timing, force-send, arbitrary recipient,
  debt language, unrelated appeal, journey DSL, or missionary reminder feed is
  in scope.

## 8. Modern accessible interaction patterns

### 8.1 Cross-surface baseline

**Verified facts**

- WAI recommends simple, short forms that request only necessary information,
  explicit labels, fieldsets/legends for related controls, instructions,
  validation, completion feedback, and logical multi-page steps when needed.
  [WAI Forms Tutorial](https://www.w3.org/WAI/tutorials/forms/)
- WAI recommends concise errors that identify the field, explain correction,
  link from an error summary to the control, preserve entered data, and move
  focus appropriately. Client validation does not replace server validation.
  [WAI validation](https://www.w3.org/WAI/tutorials/forms/validation/),
  [WAI notifications](https://www.w3.org/WAI/tutorials/forms/notifications/)
- WCAG 2.2 requires financial/legal submissions to be reversible, checked, or
  confirmed. It also requires status changes to be programmatically exposed,
  content to reflow at 320 CSS pixels, and minimum target size/spacing.
  [Error prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html),
  [Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages),
  [WCAG 2.2](https://www.w3.org/TR/WCAG22/),
  [Target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)
- GOV.UK recommends a check-answers page immediately before submission for
  small/medium consequential transactions, meaningful outcome-named buttons,
  accessible change links, and preservation of prior answers.
  [GOV.UK check answers](https://design-system.service.gov.uk/patterns/check-answers/)
- GOV.UK recommends unselected radios for a required one-of-many choice and a
  separate page when conditionally revealed content becomes complex.
  [GOV.UK radios](https://design-system.service.gov.uk/components/radios/)
- USWDS recommends no step indicator for a very short flow with fewer than three
  meaningful sections.
  [USWDS step indicator](https://designsystem.digital.gov/components/step-indicator/)

**Phase 16 inference**

- Meet WCAG 2.2 AA across the complete processes, not merely component snapshots.
  Test keyboard, screen readers, forced colors, reduced motion, 320-pixel reflow,
  400% zoom, long translations, touch, and no-JavaScript/server-validation
  fallbacks where applicable.
- Use native semantic controls before custom widgets. Never encode payment,
  pledge, support-health, or failure meaning in color alone.
- Every unknown command outcome produces a durable “being confirmed” state with
  safe refresh/reconciliation—not an optimistic success or a button that invites
  a duplicate retry.

### 8.2 Donor checkout

**Phase 16 inference grounded in the sources above**

- Feature **Monthly** when the tenant enables it. Keep **One time** clearly
  available but visually secondary, and reveal the remaining exact cadences
  through one “Other schedules” control instead of nine equal tiles.
- Ask amount per occurrence and immediately show the plain-language frequency
  and comparable schedule summary. Twice-monthly must disclose that the full
  entered amount is charged on both the 1st and 15th.
- Default the recurring schedule start to today. Label a future choice **Next
  recurring donation date** or **Recurring schedule start date**, never ambiguous
  **Start date**. Preview “First gift today,” the chosen recurring start, and at
  least the next two or three dates.
- Default to no end date without asking a question. Offer a quiet **Set an end
  date** control. Only after the donor opens it should the UI explain the final
  eligible date and show a concise review.
- Use one check-answers view before authorization: gift lines/designations,
  amount per occurrence, total today, cadence, anchor/timezone, future dates,
  optional final date, payment method, off-session/ACH terms, and how to manage
  the gift. The submit label names the outcome.
- On submit, prevent resubmission, show a programmatic waiting state, and recover
  from unknown outcomes by retrieving the existing command rather than creating
  another. Stripe likewise advises disabling ACH resubmission while confirmation
  is in progress.
  [Stripe ACH acceptance](https://docs.stripe.com/payments/ach-direct-debit/accept-a-payment)
- Confirmation distinguishes card success, action required, ACH processing, and
  failure. It always shows the next scheduled date only as scheduled, not
  guaranteed received money.

### 8.3 Donor recurring-gift management

**Phase 16 inference grounded in vendor and accessibility evidence**

- Present one recurring-giving group with independently manageable designation
  lines. Show amount, exact cadence, original creation date, current anchor,
  last successful gift, next scheduled gift, optional final date, donor-intent
  state, collection health, and truthful provider-sync state.
- Offer direct, plain-language actions: change amount/designation/cadence/date;
  update payment method; skip next gift; pause until date; pause indefinitely;
  resume; cancel; and, only after cancellation, start again.
- Before a schedule or amount change, preview the new next date, amount, cadence,
  two or three projected dates, sibling-line/cohort effects, and whether anything
  is already in flight. Do not overwrite original dates.
- Cancellation is immediately reachable, uses one neutral confirmation, and
  requires no phone call, reason, or retention gauntlet. Optional feedback comes
  after success.
- Paused state shows **Paused — Resumes on [date]** or **Paused indefinitely**.
  When provider reconciliation is incomplete, show **Pause requested — being
  confirmed**. Resume date and next scheduled gift remain separate.

### 8.4 Staff authorization-bound service desk

**Phase 16 inference grounded in WCAG and mandate evidence**

- Use one donor/commitment workspace, not disconnected provider and CRM forms.
  The workspace shows current donor instruction, authorization channel, actor
  capability, provider control, in-flight work, exact affected lines, and the
  server-derived outcome.
- The flow is short and outcome-specific: choose the donor-requested action;
  capture the required structured instruction/proof; review current versus
  proposed terms; then perform the named action. Do not add a step indicator to
  a two-page flow.
- Never show raw card or bank details. Payment-method replacement uses a
  donor-completed secure collection or the exact supported staff-assisted
  provider flow and SEC/mandate evidence.
- If an attempt is already with the provider, explain that it cannot be recalled
  and the change applies prospectively. If provider control is unknown, record
  the donor instruction and place the command in D16 quarantine rather than
  claiming completion.
- Success pages and audit summaries state who requested the change, who acted,
  what changed, effective date, affected lines, provider confirmation state, and
  notification state—without exposing sensitive evidence to unauthorized roles.

### 8.5 Fixed-total pledge and reminder setup

**Phase 16 inference grounded in GOV.UK/WAI and vendor reminder evidence**

- Fixed-total pledge creation asks for the Party, total, campaign/designation,
  promise/evidence date, and necessary provenance. It does not ask scheduling or
  reminder questions.
- **Add installment plan** opens a focused builder only when staff have actual
  expectation evidence. The review shows promised total, named expectations,
  undated remainder, and money received as different rows.
- **Change or close campaign commitment** presents four truthful choices, one per
  page if needed, followed by an operation-specific check-answers page. Do not
  use a generic “edit status” form.
- Reminder setup begins from a quiet secondary action. If exactly one eligible
  service contact exists, show it read-only; if several exist, use unselected
  native radios; if none exists, route to contact verification. Never accept an
  arbitrary email address.
- The final reminder review shows Party, campaign, current plan version, named
  expectation, exact recipient and purpose, tenant maximum, timezone, possible
  two dates, skipped stages, and all non-effects. The action says **Turn on
  pledge reminders**. Confirmation is a durable page, not only a toast.
- The staff worklist defaults to **Needs attention** and contains only repairable
  exceptions. Ordinary Off, scheduled, fulfilled, ended, released, or correctly
  suppressed expectations create no noise. Missionaries see no reminder
  enrollment, recipient, consent, or delivery details.

## 9. Research-derived implementation guardrails

These are **Phase 16 inferences** that the PRD should make testable. They are not
claims that any single vendor implements the same architecture.

| Concern                | Required permanent boundary                                                                                                                                                                                                                                    |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tenant safety          | Every aggregate, relation, provider binding, event, command, idempotency key, cache key, token, projection, and query is tenant scoped. Same-tenant composite references and negative RLS tests are mandatory.                                                 |
| Separate truths        | Keep donor intent, schedule, provider control/sync, occurrence, payment, received gift, fulfillment application, communication, and projection states separate. No universal `status`.                                                                         |
| Schedule versioning    | Immutable original creation/anchor facts plus effective-dated prospective versions; exact civil dates and IANA timezone; deterministic short-month/leap behavior.                                                                                              |
| Provider execution     | Version-pinned adapter, connected-account/livemode context, capability proof, semantic command keys, provider request IDs, and current-object reconciliation.                                                                                                  |
| Occurrence identity    | One permanent logical cohort occurrence per scheduled grid date/leg, with immutable item snapshots for every participating line. Every attempt binds that occurrence; retries never create new debt, duplicate line occurrences, or move the grid.             |
| Money integrity        | Contributions arise only from authoritative successful payment/ledger evidence. ACH processing, failed attempts, planned support, pledges, and projections create no received-money row or receipt.                                                            |
| Durable commands       | Transactional outbox or equivalent, compare-and-swap/version fencing, leased workers, permanent deduplication, unknown-outcome recovery, and compensating repair rather than blind replay.                                                                     |
| Webhooks               | Verify signature against raw body, store before processing, acknowledge quickly, process asynchronously, deduplicate, tolerate reorder, and retrieve current provider state when needed.                                                                       |
| Authorization          | Version the rendered donor terms and acceptance evidence. Staff commands bind capability, representative authority, instruction proof, rail mandate, and provider capability separately.                                                                       |
| Notifications          | Phase 16 records typed domain meaning/candidates and submits eligible current meaning through Phase 6. Phase 6 creates and owns durable communication intents, events, consent, and suppression; Phase 17 owns governed templates. No parallel sender exists.  |
| Privacy                | Role-minimal projections, purpose-bound service contacts, safe subjects/aliases, no credential or decline detail for missionaries, and anonymity/restricted-worker checks before aggregation.                                                                  |
| Migration              | Expand–classify–shadow–reconcile–switch–contract. Legacy frequency, counters, Stripe IDs, defaults, or statuses never manufacture product type, donor intent, mandate, fulfillment, enrollment, or provider authority.                                         |
| Observability          | Stable reason codes and correlations across command, schedule, occurrence, provider request, raw event, payment, gift, application, receipt, and communication. Alert on stuck claims, divergence, duplicates, unauthorized attempts, and cross-tenant poison. |
| Operational simplicity | Exception-only worklists, cohort/tenant incident aggregation, safe repair actions, kill switches, reconciliation dashboards, runbooks, and named ownership. No per-record timer fleet or arbitrary workflow DSL.                                               |

## 10. Release-blocking evidence tests

The later PRD should translate at least the following into executable acceptance
tests, property tests, provider-sandbox tests, accessibility tests, and operator
drills.

### Schedule and checkout

1. Monthly, weekly, every-two-weeks, every-four-weeks, quarterly, semiannual,
   annual, and twice-monthly dates remain exact across leap years, short months,
   DST boundaries, and multiple timezones.
2. Today produces one immediate gift and no duplicate same-day recurring charge.
3. A future recurring start produces one immediate gift plus the selected future
   first recurring occurrence, with no proration or hidden trial semantics.
4. The 29th, 30th, 31st, and February 29 fallback and return behavior is stable.
5. One checkout retry, two tabs, a browser refresh, a network timeout, and a
   replayed server command produce one initial occurrence and one provider
   mutation.
6. An initial recurring start or later next-date/re-anchor amendment before the
   current civil date in the tenant's giving timezone is rejected by preview
   and apply with an accessible inline error; today and valid future dates
   remain accepted. Historical correction uses a separate non-collection path.
7. Every applied recurring schedule change yields a durable confirmation of the
   effective arrangement, next dates, final-date truth, in-flight non-effects,
   and provider-sync state; a refresh or duplicate event cannot create a second
   change or contradictory confirmation.
8. Disabled tenant cadences disappear for new checkout while existing schedules
   remain serviceable and unchanged.
9. Twice-monthly exposes one donor line, two exact execution legs, and no 14/15-
   day approximation.

### Lifecycle and cohorts

10. Skip suppresses one named occurrence and leaves all later grid dates intact.
11. Bounded and indefinite pause stop not-yet-started work, preserve in-flight
    truth, and resume on the unchanged grid without catch-up.
12. One-line pause/change/cancel splits a cohort atomically while sibling lines
    continue exactly as previewed.
13. Cancellation fences new work immediately, reconciles pre-existing invoices
    and pending items, and never claims provider completion early.
14. Restart creates a new authorization/provider epoch linked to history and
    cannot resurrect the canceled executor.

### Payments and recovery

15. Card success, card failure, card action-required, ACH processing, ACH
    success, ACH failure, late ACH return, dispute, refund, and reversal each
    produce the correct separate payment/gift/receipt outcomes.
16. D7 retry candidates execute exactly once, stop for hard declines or repaired
    state, and never drift the scheduled grid.
17. D8 grants D7 only to the triggering occurrence and three later normal
    occurrences; the fourth later occurrence is regular-schedule-only.
18. A recovered later gift does not collect, fulfill, or receipt a prior failed
    occurrence.
19. ACH never retries without D10 donor confirmation, and an invalidated mandate
    cannot be reused.
20. Duplicate, delayed, missing, and reversed-order Stripe events converge to the
    same final state without duplicate gifts, applications, receipts, retries,
    or notices.

### Provider control and tenancy

21. Connected-account disconnect, capability restriction, webhook gap, wrong
    livemode, account mismatch, stale version, and rate-limit outage each invoke
    the correct D16 fence.
22. A donor cancellation during control loss is recorded immediately and
    prioritized, but surfaces never claim the provider stopped without proof.
23. Recovery proves same account/binding or old-executor stop before a new
    executor begins; active-active collection is impossible.
24. Cross-tenant IDs, provider events, idempotency keys, cache entries, tokens,
    Party relations, and role projections fail closed and alert.

### Parties, fulfillment, and fixed-total pledges

25. Individual, organization, representative, payer, payment-method owner,
    service contact, household member, DAF advisor, and soft-credit roles never
    imply one another.
26. Partial, split, over, late, reversed, returned, anonymous, restricted, DAF,
    and household gifts conserve money and preserve the actual donor/payer.
27. Ambiguous matching creates review rather than an application; a resolved
    application rebuilds projections exactly.
28. Fixed-total pledge without a plan preserves an explicit undated remainder;
    plan creation and plan change conserve the total.
29. Donor-requested change, donor-requested ending, internal release, and entry
    correction produce different append-only operations and viewer language.
30. A reduction below fulfillment, late gift after closure, inverse, dispute,
    and concurrent operation never rewrite received money or history.

### Reminders and communications

31. Tenant enablement, pledge save, plan import, and late enrollment send
    nothing and never catch up a passed stage.
32. Every reminder rechecks current Party/contact authority, purpose, consent,
    suppression, expectation, fulfillment, pending/match/source truth, tenant
    maximum, template, locale, and duplicate identity immediately before send.
33. Recipient stop uses a read-only GET page and an explicit state-changing POST;
    link scanners cannot stop reminders, and a forwarded link cannot expose
    pledge details.
34. Tenant reduction stops future stages atomically; later increase or re-enable
    does not resurrect former enrollment or missed candidates.
35. Reminder copy remains gentle and truthful for partial fulfillment, check in
    transit, pending ACH, ambiguous matching, stale source, changed service
    contact, anonymous donor, and restricted-worker cases.
36. Provider email acceptance, delivery, bounce, complaint, and recipient stop
    remain communication facts only; none changes pledge, payment, or cash truth.

### Accessibility and human comprehension

37. Donor checkout, portal management, staff service desk, pledge plan builder,
    four-action change doorway, and reminder setup meet WCAG 2.2 AA as complete
    processes at keyboard-only, 320 CSS pixels, 400% zoom, forced colors,
    reduced motion, and current NVDA/VoiceOver combinations.
38. Form errors have an error summary, linked inline correction, preserved input,
    correct focus, and programmatic status. Unknown outcomes do not invite a
    duplicate action.
39. Financial and authority-changing actions have an accurate check-answers
    page, outcome-named submit control, durable confirmation, and safe correction
    or inverse path.
40. Real donors and infrequent nonprofit staff can explain, without coaching,
    the difference between amount per occurrence, amount today, next scheduled
    gift, retry, pause/resume date, fixed-total pledge, expected installment,
    cash received, internal release, and reminder enrollment.

## 11. Decisive product conclusions for the Phase 16 PRD

The evidence does not select product policy independently of D1–D19. Combined
with those ratified decisions, it supports the following final constraints:

1. Build automatic recurring giving as the flagship experience and fixed-total
   campaign commitments as a separate, lower-prominence product.
2. Use one recurring-giving group with independently manageable lines and
   compatible provider execution cohorts.
3. Feature monthly while retaining the exact tenant-configurable D3 catalog and
   honest per-occurrence disclosure.
4. Anchor schedules to the donor's selected civil date, charge the first gift
   immediately, default to no end date, and never let retry or settlement drift
   the grid.
5. Keep donor intent, schedule, provider control, payment, gift, fulfillment,
   communication, and projection facts independently auditable.
6. Implement D7–D10 recovery exactly; do not layer Stripe Smart Retries or ACH
   auto-retry over the product policy.
7. Preserve donor control through direct portal lifecycle actions and a broad but
   authorization-bound staff service desk.
8. Quarantine provider-control loss and restore only reconciled cohorts; never
   claim a provider stop or cancellation before proof.
9. Treat fixed-total expectations as optional planning facts, fulfillment as
   explicit applications, and donor change/internal release/correction as four
   different append-only operations.
10. Present received cash first to missionaries, then qualified automatic
    recurring support, then quiet fixed-total commitments; never mix those
    measures.
11. Use one Gentle, explicitly enrolled, tenant-reducible pledge-reminder profile
    through the existing communication and template foundations; never build a
    parallel email or journey platform.
12. Treat accessibility, tenant poison tests, provider fault testing,
    reconciliation, migration proof, observability, runbooks, and real-user
    comprehension as release requirements rather than follow-up polish.
