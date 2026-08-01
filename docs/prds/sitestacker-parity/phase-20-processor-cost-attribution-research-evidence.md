# Phase 20 Processor-Cost Attribution Research Evidence

**Status:** Research evidence for the Phase 20 `/grill-with-docs` session
**Date:** 2026-07-26
**Decision candidate:** D19
**Scope:** Whether a tenant may choose between organization-borne payment
processing costs and designation-borne processing costs without changing gift,
receipt, settlement, or provider truth.

This note is evidence, not an implementation specification or legal opinion.
The ratified Phase 20 decision log remains authoritative.

## Executive conclusion

The proposed tenant choice is sound only when Asym preserves four separate
truths:

1. the donor's gross supported-gift amount in the original non-fee-cover
   Designation lines;
2. any separate donor fee-cover contribution;
3. the processor's exact source-linked fee expense; and
4. the resulting net settlement.

The first two facts together preserve complete gross contribution truth. The
optional mode must never create a smaller "net gift." It may only change the
internal accounting attribution of the separately recognized processor
expense.

The strongest bounded product posture is:

- **Default:** the organization absorbs charge-linked processing costs through
  its tenant-selected central fee-expense target.
- **Optional:** supported designations bear only the portion of a charge-linked
  processing cost that remains after the associated donor fee-cover amount has
  been applied.

That second mode is best named **Supported designations bear uncovered
processing costs**. "Net gift" and "deduct the fee from the donation" are
unsafe names because the contribution and receipt remain gross.

## Accounting and regulatory evidence

### Gross contribution and separate expense are the durable facts

- The FASB's not-for-profit presentation guidance generally calls for gross
  revenue and expense presentation and requires expenses to remain
  understandable by nature and function. Its examples also show a beneficiary
  recording the gross gift as contribution revenue and an administrative fee
  withheld by an intermediary as expense. The Accounting Standards
  Codification, not the ASU itself, is the authoritative GAAP source.
  - https://storage.fasb.org/ASU_2016-14.pdf
- The IRS Form 990 instructions require accurate, documented expense
  allocation methods and separate functional reporting. They do not create a
  general permission to collapse contribution revenue and merchant costs into
  one net gift amount.
  - https://www.irs.gov/instructions/i990
- IRS written-acknowledgment guidance focuses on the amount of cash
  contributed and goods or services provided to the donor. A charity's
  processor cost is not itself donor consideration.
  - https://www.irs.gov/charities-non-profits/charitable-organizations/charitable-contributions-written-acknowledgments
- ECFA's missions-relevant limited-use guidance says purpose-limited gifts
  should be separately accounted for and charges should be allocated only
  under disclosed policy or when directly attributable to the purpose,
  project, or program. It also stresses truthful, complete donor
  communication.
  - https://www.ecfa.org/Content/2MemberManual-AdvisoryOpin-DonorDisclosure

### Canada requires the same cautious product boundary

- CRA defines restricted funds as resources tied to a specific use and not
  available for general purposes.
  - https://www.canada.ca/en/revenue-agency/services/charities-giving/charities/charities-giving-glossary.html
- CRA fundraising guidance requires truthful, accurate, accessible, and timely
  disclosure about fundraising costs and the resources ultimately available
  for charitable programs.
  - https://www.canada.ca/en/revenue-agency/services/charities-giving/charities/policies-guidance/fundraising-registered-charities-guidance.html
- CRA's receipt model distinguishes the amount of a gift from an advantage
  received by the donor. The research found no CRA processor-fee-specific safe
  harbor. Treating the receipt as gross is a well-supported accounting
  interpretation, not a product-level guarantee of legal treatment in every
  fact pattern.
  - https://www.canada.ca/en/revenue-agency/services/charities-giving/charities/sample-official-donation-receipts.html
- Canadian charities must maintain adequate books and records. Asym therefore
  needs durable source, policy, allocation, and correction evidence rather
  than a mutable net amount.
  - https://www.canada.ca/en/revenue-agency/services/charities-giving/charities/operating-a-registered-charity/books-records.html

## Processor evidence

- A Stripe Balance Transaction exposes integer `amount`, `fee`, `fee_details`,
  `net`, currency, source, and reporting classification. Asym should use this
  actual provider evidence, not the checkout fee-cover estimate, as the
  accounting cost.
  - https://docs.stripe.com/api/balance_transactions/object
- Stripe reporting categories distinguish charges, refunds, disputes, fee
  occurrences, reserves, and other activity. Those semantic families must not
  be collapsed into one generic "transaction fee."
  - https://docs.stripe.com/reports/reporting-categories
- Stripe payout reconciliation preserves gross, fee, and net settlement
  evidence.
  - https://docs.stripe.com/reports/payout-reconciliation
- Stripe generally does not return the original processing fee merely because
  a payment is refunded. An actual fee return or correction must therefore
  come from provider evidence, not from an inferred mirror of gift principal.
  - https://support.stripe.com/questions/understanding-fees-for-refunded-payments

## QBO and Xero handoff evidence

- QuickBooks Online advises preserving the original transaction and recording
  a processing fee as a separate negative deposit line or expense rather than
  editing the original receipt.
  - https://quickbooks.intuit.com/learn-support/en-us/help-article/bank-deposits/record-make-bank-deposits-quickbooks-online/L2BBZOPdr_US_en_US
- Xero describes the corresponding gross-payment, fee-expense, and net-bank
  deposit pattern.
  - https://www.xero.com/us/guides/online-payment-services-get-you-paid-faster/
- Xero's integration guidance makes account mapping explicit and
  organization-controlled. Asym must prove that a selected QBO or Xero carrier
  can preserve the required reporting target before direct delivery.
  - https://developer.xero.com/documentation/best-practices/categorising-transactions/account-mapping/

## Comparable nonprofit-product evidence

- Aplos exposes Gross, Fee, Net Amount, Donor Paid Fee, and Purpose as distinct
  fields, and requires an explicit fee expense account and cash/bank account.
  - https://help.aplos.com/hc/en-us/articles/30708091721229-How-To-Manage-Online-Donations
- Virtuous provides gift-detail, project-detail, and project-summary
  reconciliation views with gross, fee, and net amounts. This validates
  designation-level fee visibility without redefining the gift.
  - https://support.virtuous.org/hc/en-us/articles/33916761894925-How-Do-I-Reconcile-Gifts-in-Virtuous-Giving
- Bloomerang describes fee cover as an additional donation that helps offset
  processing costs and explicitly warns that it does not replace the actual
  processing fee. This supports showing the estimate and provider fee
  separately.
  - https://help.bloomerang.com/en/articles/13382221-giftassist-a-visual

## Fee-cover interaction

When the optional designation-borne mode is active, allocating the full
processor fee to designations while retaining donor fee-cover centrally would
contradict the donor-facing purpose of fee cover and the Phase 13 promise that
it helps approximately the intended gift reach the field.

For one charge and one currency:

```text
covered_cost =
  min(actual_eligible_processing_cost, associated_fee_cover)

uncovered_cost =
  max(actual_eligible_processing_cost - associated_fee_cover, 0)

fee_cover_surplus =
  max(associated_fee_cover - actual_eligible_processing_cost, 0)
```

The full fee-cover amount remains contribution revenue and the full actual
processor fee remains expense. The formulas determine only the expense's
internal reporting attribution:

- the covered portion is organization-attributed against the fee-cover
  purpose;
- the uncovered portion is allocated across the original eligible
  non-fee-cover designation lines;
- any fee-cover surplus stays transparent in the existing fee-cover purpose
  and never silently inflates a ministry designation.

The fee-cover line is excluded from allocation weights. Allocation uses
integer minor units, the original frozen positive designation amounts, and
deterministic largest-remainder rounding with a stable tie-break.

## Bounded policy design

The lean contract needs only two modes:

1. `organization_absorbs`
2. `designations_bear_uncovered_cost`

The policy version is scoped to Tenant, Legal Entity, processor settlement
binding/source family, and currency behavior. It activates prospectively at a
complete settlement boundary and is pinned when an Accounting Release
population freezes.

It must not include:

- per-gift overrides;
- arbitrary percentages;
- a formula builder or policy DSL;
- editable allocation rows;
- retroactive mode changes;
- silent fallback from exact provider evidence to an estimate; or
- reassignment based on current designation mappings.

A bounded designation exception is justified for a gift agreement, trust,
grant, endowment, or other restriction that does not permit the cost. The
exception means **Organization absorbs for this designation**. Its calculated
share returns to the organization; it is never shifted onto other supported
designations. The exception is prospective, role-gated, reasoned, and visible
only when the optional mode is active.

## Eligible and ineligible costs

Only exact charge-linked ordinary payment-processing costs may use the
designation-borne policy.

The following remain separate semantic roles and do not inherit that policy:

- dispute and chargeback fees;
- foreign-exchange fees and conversion effects;
- payout, instant-payout, or bank-transfer fees;
- reserves and reserve releases;
- platform, tax, or standalone account fees;
- unknown provider categories; and
- any cost without a proved source relationship.

Those items use their separately certified accounting policy or create one
cause-owned Accounting Exception Case. Asym never guesses.

## Refund and correction behavior

- A gift refund reverses source-owned gift and fee-cover facts according to
  the contribution contract.
- It does not imply a processor-fee reversal.
- An actual processor fee return or rebate creates a source-linked,
  append-only correction against the original allocation manifest.
- If fee-cover reverses while the processor cost remains, the resulting
  uncovered burden is derived under the frozen original policy and posted
  through the existing compensating-release contract.
- Released accounting is never rewritten. Current mappings and current policy
  versions do not replace the original manifest.

## UX implications

The primary setting should be one two-choice control:

**Who absorbs payment-processing costs?**

- **Our organization — Recommended**
  Supported funds retain the full gift amount. Processing costs use our
  organization-wide expense target.
- **Supported funds, after donor-covered costs**
  Gifts and receipts remain at their full amounts. Donor-covered costs offset
  the transaction's actual processing cost first; any remaining cost reduces
  the amount available to the selected funds.

The review step should show a representative recent-settlement preview:

- gross designated gifts;
- donor fee-cover;
- actual eligible processor cost;
- cost covered by fee-cover;
- uncovered cost;
- amount allocated to each supported designation;
- organization-borne exceptions;
- net settlement;
- QBO/Xero reporting targets; and
- a zero-difference control.

Activation is one authorized **Review and activate** action. The tenant's
already-applicable D4 semantic-policy governance and D12 Accounting Release
approval policy may require additional review, but D19 must not introduce its
own approval bureaucracy.

Donor disclosure for the optional mode should be short and prospective:

> Processing costs may reduce the amount available to the ministry or fund you
> support. If you choose to help cover these costs, your additional gift
> offsets them first. Actual costs may differ from the estimate.

Staff and missionary finance views may show **Gross support**, **Processing
costs**, and **Net available**. Donor gift history and receipts continue to
show the full contribution truth.

## Required correctness and observability checks

- Every source fee occurrence is covered exactly once.
- Allocated shares conserve the uncovered cost to the minor unit.
- Gross contribution, fee-cover, processor cost, and settlement remain
  independently inspectable.
- Missing or late provider evidence blocks the affected release item and opens
  one exception; it never triggers estimated accounting.
- Cross-currency amounts are never allocated together.
- Provider adapters preserve the required reporting dimensions. The
  staff-mediated artifact lane is available only when its exact import surface
  is independently certified to preserve the same accounting effect; it cannot
  cure a provider capability gap.
- Tenant, Legal Entity, settlement binding, source family, and currency scopes
  are enforced in data keys, authorization, queries, and release manifests.
- No donor PII or card data is copied into allocation manifests or accounting
  memos.
- Phase 20 attribution does not itself debit a Phase 21 missionary Field
  Account. Any operational balance effect must consume the same proved
  occurrence once under Phase 21 ownership.

## Test evidence required before shipping

- Table and property tests for no, partial, exact, and excess fee cover.
- One-cent, zero-decimal-currency, many-designation, and stable-tie rounding.
- Split gifts containing an organization-absorbed designation exception.
- Recurring installments with changing fee-cover estimates and actual fees.
- Full and partial refunds, fee-cover refunds, actual fee returns, and late
  provider corrections.
- Unknown, dispute, FX, payout, reserve, and standalone fee families.
- Missing source links, duplicate webhooks, concurrent policy activation, and
  mapping changes during release freeze.
- Tenant, Legal Entity, settlement-binding, and permission isolation.
- QBO and Xero carrier capability, exact preview, artifact equivalence, and
  readback/drift behavior.
- Accessible keyboard operation, error summary, screen-reader labels, mobile
  review, and plain-language usability with representative finance staff.

## Remaining non-product authority

Asym can enforce truthful accounting mechanics and disclosure evidence, but it
cannot decide whether every gift instrument, trust, grant, endowment, state
law, provincial rule, or tenant solicitation permits a charge. The tenant
remains responsible for its policy and should obtain accountant or counsel
review for unusual restrictions. The product must not claim that a setting is
"GAAP certified," "legally approved," or "CRA approved."
