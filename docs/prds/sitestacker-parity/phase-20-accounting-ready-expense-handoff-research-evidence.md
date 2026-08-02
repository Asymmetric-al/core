# Phase 20 Accounting-Ready Expense Handoff — Research Evidence

**Decision:** D18
**Status:** Ratified and adversarially hardened on 2026-07-26
**Date:** 2026-07-26
**Scope:** The immutable source contract through which Phase 21-approved
expenses, reimbursement obligations, payment facts, and corrections may enter
Phase 20

This dossier preserves the research and adversarial evidence underlying the
ratified Phase 20 D18 decision. It is not a PRD, implementation specification,
issue set, authorization to build, or legal, tax, payroll, or accounting
advice. D1–D17 remain authoritative prerequisites and were not reopened.

**Phase 21 D1 precision (2026-07-28).** In this historical evidence record,
`funding classification` means the economic payer and source used for the
original expense. It does not mean Field Account Funding Coverage. Phase 21 D1
keeps Expense Claim, policy decision, Approved Expense Snapshot,
Reimbursement Obligation, Field Account Funding Coverage, externally executed
Payment Occurrence evidence, and accounting handoff separate. Tenant
payroll/AP/manual processes—not Phase 21 or Phase 20—own payment execution.

**Phase 21 D4 mixed-payment precision (2026-07-28).** One atomic payment may
cover both compensation and reimbursement. Reimbursement Payment Coverage
therefore conserves only its reimbursement slice; one complete typed manifest
uses the External Payment Occurrence's one payment currency and conserves exact
Compensation Payment Coverage, Reimbursement Payment Coverage, and one signed,
typed, explicitly resolved residual disposition, including zero. A covered
source component in another currency preserves both source/payment amounts and
exact conversion evidence; unresolved residual or FX ambiguity fails closed.
D17 assigns one posting owner to the whole payment. A Compensation Handoff
Package is not an expense handoff, and no compensation posting becomes active
until its complete source contract and accountant-confirmed posting semantics
are separately certified and its exact D17 owner is pinned.

**Phase 21 D16 advances-and-repayments precision (2026-07-31).** The later
source contract activates only evidence-qualified Expense Advance Issuance
Occurrence, separately certified Expense Advance Application typed accounting
effect where applicable, source-qualified Claimant Repayment Occurrence
explicitly typed as cash claimant return or expense advance return, and their
cause-linked corrections. Operational policies, authorization, settlement determination,
responsibility and repayment decisions, uncertified requirements, residuals,
tasks, raw observations, disputes, restitution review, and Field Account
coverage remain accounting-dark. Each admitted family independently resolves
D17 posting ownership.

## Executive conclusion

The market evidence does not support either one mutable “approved expense
report” as the accounting unit or a complete copy of expense operations inside
Phase 20.

The smallest truthful boundary is:

1. one immutable, source-owned **Approved Expense Snapshot** behind the report
   staff already know;
2. one PII-minimized **Accounting-Ready Expense Handoff** containing the exact
   approved source coverage and evidence references Phase 20 needs;
3. a closed launch catalog of typed, source-owned accounting-ready occurrences;
   and
4. exact **Reimbursement Payment Coverage** inside every partial, grouped, or
   batched payment occurrence, plus a complete typed payment manifest when the
   same atomic payment also covers compensation.

Phase 21 remains the expense-operations product. Phase 20 accepts only frozen,
accounting-ready facts and projects them through D4–D8, D11–D17 to QBO or Xero.
Asym helps staff run expenses like Ramp, Expensify, Concur, or Brex; it does not
become QBO, Xero, a second subledger, payroll, or a bank-reconciliation system.

## Why D18 is necessary

Phase 20 D1 assigns receipt capture, substantiation, expense reports, approval,
reimbursement, field-account effects, and missionary UX to Phase 21. D17
already establishes that:

- one approved organization-paid expense is one source-owned atomic
  occurrence;
- an approved unpaid reimbursement payable and its later payment are separate
  source occurrences;
- a card purchase and the later card-liability payment are separate source
  occurrences, with the latter outside the expense-report handoff; and
- exactly one posting owner may create each occurrence's accounting
  representation.

`CONTEXT.md` defines one Accounting doorway and an Accounting-ready expense
handoff, and explicitly rejects an unapproved export, Phase 20 expense approval,
a generic expense blob, a second QBO/Xero Accounting integration, and a shared
mutable status.

The remaining gap is the precise contract that preserves:

- report workflow versus approved accounting coverage;
- approved payable versus payment initiation and confirmed payment;
- employee-paid versus organization-paid versus company-card funding;
- pending versus cleared card transactions;
- partial, grouped, and batched many-to-many reimbursement payment coverage;
- external payment evidence of different strengths;
- separately contracted claimant repayment after an overpayment or
  uncancelable reimbursement;
- exclusion of card-liability settlement from the expense-report handoff;
- specialist mileage, per-diem, and advance treatment; and
- immutable correction without replaying or mutating a prior Accounting
  Release.

Without D18, approval could accidentally create cash movement, mixed reports
could produce duplicate expense recognition, a grouped bank withdrawal could
lose its payable coverage, or Phase 20 could grow a second expense workflow.

## Current authoritative accounting and tax evidence

### United States accountable-plan and substantiation rules

- An accountable plan requires a business connection, timely substantiation,
  and timely return of excess advances. Failures can become taxable wages. See
  [IRS Publication 15](https://www.irs.gov/publications/p15).
- Adequate records ordinarily preserve amount, time, place, business purpose,
  and documentary evidence. Approval or a receipt alone does not establish
  every required fact. See
  [IRS Publication 463](https://www.irs.gov/publications/p463).
- Per-diem and mileage methods work only under applicable rules and rates.
  Phase 20 must neither hardcode rates nor determine tax eligibility. See
  [IRS standard mileage rates](https://www.irs.gov/tax-professionals/standard-mileage-rates).

These are United States employee-tax rules, not universal classifications for
missionaries, volunteers, contractors, or international workers. Qualified
tenant advisers own that determination.

### QuickBooks Online accounting semantics

- A QBO `Bill` records an AP obligation; a later `BillPayment` applies payment.
  An already-paid `Purchase` is different. See
  [QBO bill/payment guidance](https://developer.intuit.com/app/developer/qbo/docs/learn/learn-basic-bookkeeping/pay-bills),
  [Purchase](https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities/purchase),
  and
  [BillPayment](https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities/billpayment).
- A
  [VendorCredit](https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities/vendorcredit)
  is a separate correction primitive, not permission to rewrite a prior bill.

An approved unpaid obligation can authorize a Bill. It cannot authorize a
BillPayment. An organization-paid line can use a paid-expense representation
only when the source proves the funding event.

### Xero accounting semantics

- An authorized `ACCPAY` invoice is a supplier bill awaiting payment; draft and
  submitted statuses differ. A later `Payment` separately applies amount and
  date from an eligible account. See
  [invoice statuses](https://developer.xero.com/documentation/best-practices/user-experience/invoice-status/)
  and [Payments](https://developer.xero.com/documentation/api/accounting/payments).
- A `SPEND` BankTransaction is already-paid spending. `ACCPAY`, its payment,
  credit-card accounts, and `SPEND` are distinct concepts. See
  [Xero accounting types](https://developer.xero.com/documentation/api/accounting/types/).
- Legacy ExpenseClaims and Receipts APIs are deprecated. See the
  [Xero Accounting API](https://developer.xero.com/documentation/api/accounting/overview).

Phase 20 may compile an already-paid expense to `SPEND` and a genuine unpaid
reimbursement to `ACCPAY`; a Xero Payment requires a separate payment
occurrence.

## Comparative official-product research

### Ramp

Ramp's accounting workspace imports provider accounting fields, lets finance
configure provider-specific mappings and sync behavior, and moves work through
**Waiting for Cardholder → Needs Review → Ready to Sync**. It keeps credit-card
charges, reimbursements, and statement payments as separate accounting flows.
It explicitly shows that a card purchase increases the card liability, while a
later statement payment decreases the liability and cash. See
[Ramp Accounting overview](https://support.ramp.com/overview-of-ramp-accounting).

Ramp also batches several reimbursements to one employee into one daily payout
and syncs one corresponding payment that matches the bank activity. The payment
does not sync until every reimbursement in the payment batch is ready and
synced; finance can still inspect each reimbursement's status. See
[Ramp batch reimbursement payment syncing](https://support.ramp.com/batch-reimbursement-payment-syncing/).

**Implication for Asym:** preserve one source payment and an exact many-to-many
coverage manifest. Do not infer the bank-side payment from individual
reimbursement approval, and do not mark a grouped payment delivered while one
covered payable is unresolved.

### Expensify

Expensify distinguishes Draft, Submitted/Outstanding, Approved, and Paid. Paid
is further described as **Marked as paid**, **Withdrawing**, or **Confirmed**.
Its primary action changes contextually from Submit to Approve to Pay to Export.
See
[Expensify report statuses](https://help.expensify.com/articles/new-expensify/reports-and-expenses/Understanding-Report-Statuses-and-Actions).

Expensify permits direct reimbursement or **Pay elsewhere**. Pay elsewhere is a
staff assertion that payment happened outside Expensify; it is not processor
execution proof. Non-reimbursable-only reports cannot receive a direct
reimbursement. See
[Expensify payment methods](https://help.expensify.com/articles/new-expensify/wallet-and-payments/Reimbursement-Payment-Methods).

Expensify can move held lines to a successor report while approving clean
lines. Its QBO/Xero paths differ for out-of-pocket and company-card expenses,
and it warns that re-exporting can create duplicates. See
[Expensify approval behavior](https://help.expensify.com/articles/new-expensify/reports-and-expenses/Approve-Expenses),
[QBO configuration](https://help.expensify.com/articles/new-expensify/connections/quickbooks-online/Configure-Quickbooks-Online),
and
[Xero configuration](https://help.expensify.com/articles/new-expensify/connections/xero/Configure-Xero).

**Implication for Asym:** borrow the contextual action and exception-first
workflow, but do not copy the overloaded Paid status, warning-only duplicate
re-export, mutable report-as-accounting-unit, or silent counterparty creation.

### SAP Concur

Concur's expense model distinguishes workflow/approval status from payment
status and supports different payment types for employee-paid, company-paid,
and company-card activity. Its Payment Manager and accounting-extract concepts
operate after report approval rather than making approval itself payment.
Relevant official Concur Expense guidance includes
[report/payment processing](https://help.sap.com/docs/CONCUR_EXPENSE/bb83754b1c5541808d50c09901e11475/2f41498598fc43f99d2d5af6489170c9.html)
and
[expense payment-type configuration](https://help.sap.com/docs/CONCUR_EXPENSE/13094e09188143b09cef21883ba5873e/1d72b10ec24349d0888cba8eaba40290.html).

**Implication for Asym:** funding source and payment type belong on each
approved source line. A report-level reimbursable flag is too weak for mixed
reports and company-card exceptions.

### Brex

Brex separates individual reimbursement requests from payout batching. It
supports partial reimbursement requests, multiple requests against one receipt,
per-entity funding sources, different payment cycles, and batched employee
payouts. Its UI exposes approval, payment status, liability, reconciliation,
filters, grouping, and audit trail separately. See
[Brex expense reimbursements](https://www.brex.com/support/expense-reimbursements).

Brex's accounting integration can create open liabilities and later close them
with payment entries. Payment exports may be lump sums, while reimbursements
remain individually coded. It states that externally paid reimbursements need
manual reconciliation and warns against changing export formats mid-cycle.
QBO is partially configurable; Xero reimbursement export is fixed to vendor
bills. See
[Brex reimbursement integration sync](https://www.brex.com/support/reimbursements-integration-sync).

**Implication for Asym:** use exact reimbursement payment coverage, pin the posting
profile prospectively, and keep external-payment provenance explicit. Provider
format is a Phase 20 projection, never a source fact.

### Cross-product conclusion

All four products separate at least some of these authorities:

1. capture and report workflow;
2. policy and approval;
3. payable recognition;
4. payment execution and outcome;
5. accounting readiness and export;
6. provider acceptance or accounting-system state; and
7. bank-side reconciliation.

The best products keep the ordinary experience report-first while preserving
line-level funding and payment truth underneath. The market's recurring
weaknesses—overloaded statuses, mutable exported reports, warning-only
re-export, manual cleanup, and silent entity creation—must not be reproduced.

## Repository and architecture fit

### Existing authority that D18 must reuse

- `CONTEXT.md` already defines the Accounting doorway, Accounting-ready expense
  handoff, Legal Entity, Accounting Release, Source Coverage Manifest,
  Accounting delivery lane, Accounting Exception Case, Compensating Accounting
  Release, and other D1–D17 terminology.
- `docs/adr/0043-immutable-accounting-releases-and-exclusive-delivery-lanes.md`
  requires one immutable release and one mutually exclusive delivery lane.
- `docs/adr/0044-canonical-legal-entity-financial-boundary.md` requires every
  expense and accounting workflow to carry exact Legal Entity authority.
- `docs/adr/0045-typed-posting-intents-and-canonical-accounting-effects.md`
  requires typed, source-covered, balanced, provider-neutral effects.
- `docs/adr/0046-bounded-provider-native-posting-profiles.md` already recognizes
  approved paid expenses, genuine payables, and exceptional adjustments as
  distinct source-purpose recipes.
- `docs/adr/0052-policy-bounded-compensating-accounting-releases.md` owns
  append-only correction.
- `docs/adr/0054-cause-owned-accounting-exceptions-with-shared-follow-up.md`
  owns durable accounting exceptions and shared Mission Control follow-up.
- `docs/adr/0057-capability-certified-accounting-delivery-packages.md` owns
  staff-mediated import truth without treating download as import.
- `docs/adr/0058-source-family-posting-ownership-cutover.md` requires one
  posting owner per canonical expense, payable, payment, or correction.

### Current implementation seams

- There is no production expense-report or reimbursement domain model in the
  current codebase. D18 can be designed cleanly without legacy runtime
  compatibility.
- `packages/missionary/types/index.ts` contains a generic UI-facing
  `LedgerEntry` with `income | expense | adjustment` and JavaScript `number`.
  It is not suitable as financial authority, occurrence identity, allocation
  coverage, payment evidence, or exact decimal accounting. D18 must not reuse
  or broaden it into the accounting contract.
- `packages/database/collections/support-workspace.ts` contains only support
  copy for reimbursement help, not expense truth.
- `packages/api/src/workflows/events.ts`,
  `packages/api/src/workflows/ledger.ts`, and
  `packages/api/src/workflows/claims.ts` provide useful technical seams for
  bounded event envelopes, durable dispatch evidence, and serialized work
  claims. They may transport or schedule D18 work but may not become its
  financial authority.
- Their interface tests in `packages/api/tests/unit/workflow-events.test.ts`,
  `workflow-ledger.test.ts`, and `workflow-claims.test.ts` demonstrate the
  project's preferred public-seam testing style for idempotency, failures,
  concurrency, and PII-bounded envelopes.
- Mission Control already uses compact, token-based, exception-first patterns.
  New UI must follow `apps/admin/README.md`, `docs/ai/rules/frontend.md`,
  shared `@asym/ui` Base UI primitives, and the shared responsive data-table
  boundary rather than adding an app-local component system.
- Runtime implementation will need unit tests at public domain/compiler seams,
  integration tests for tenant/RLS/transactional fences, and Playwright plus
  axe/manual accessibility coverage under `docs/ai/rules/testing.md`.

### Codebase conflict found

The only material conflict is terminology risk around the generic missionary
`LedgerEntry`. It looks like a financial record but cannot represent D18's
immutable source coverage, typed occurrence, exact decimal, Legal Entity,
funding source, payment application, or correction lineage. The permanent
prevention is an explicit new domain boundary and a prohibition against using
that interface as Phase 20 or Phase 21 financial truth.

## Ratified domain boundary

### Source-owned Approved Expense Snapshot

Phase 21 owns the full immutable Approved Expense Snapshot: the report, lines,
itemizations, receipts, business-purpose evidence, policy and approval facts,
economic-payer and funding-source classifications, allocations, and correction
lineage. It does not prove Field Account Funding Coverage or external payment.
The ordinary user continues to see one report and one current state. A later
approval of a held line or a correction creates a successor snapshot or
supplement; it never mutates coverage already accepted by Phase 20.

The snapshot's approved expense line-disposition coverage gives every source
line or split exactly one disposition:

- approved organization-paid;
- approved reimbursement-payable;
- approved but waiting for a specialist occurrence contract;
- held for later review;
- rejected;
- excluded or unclaimed with a reason; or
- superseded by an exact successor.

Each approved line has exactly one typed funding source:

- employee or missionary out-of-pocket;
- organization cash/bank/debit;
- organization corporate card;
- personal-liability card treated as out-of-pocket;
- approved advance application;
- another certified source-owned funding type; or
- unknown, which blocks only the affected line.

A mixed report remains one familiar report in the UX but emits separate typed
occurrences by funding and economic effect. No report-level flag may overwrite
line-level funding truth.

### PII-minimized Accounting-Ready Expense Handoff

Phase 20 receives a frozen projection, not a copy of the expense product. The
common handoff envelope binds:

- immutable handoff ID, version, digest, source contract, and posting owner;
- Tenant, Legal Entity, source system, and report references;
- exact occurrence identities and, when snapshot-rooted, included approved
  line and split IDs with control totals and allocations;
- claimant, payee, merchant, and economic-payer roles through stable
  references, not copied profiles;
- source, approval, obligation, payment, discovery, and correction dates as
  distinct facts;
- original, approved, and payment currencies and amounts where applicable;
- source-supplied tax and exchange-rate facts without Phase 20 inference;
- approved expense line-disposition coverage and succession lineage sufficient
  to prove completeness; and
- purpose-scoped evidence digests and authorized deep links rather than raw
  receipts, policy deliberations, bank credentials, or broad worker PII.

The source-authority reference is discriminated by occurrence. An expense,
obligation, or snapshot-rooted correction carries exactly one Approved Expense
Snapshot ID, version, and digest. A payment carries one payment-source ID,
version, and digest plus the complete covered-obligation and originating-
snapshot reference set. A grouped payment never requires an arbitrary primary
snapshot.

D16 advance-issuance, advance-application-effect, claimant-repayment, and
correction sources instead carry the exact source root and predecessor coverage
required by their independently certified source-family contract.

Included approved coverage crosses through exact stable identities. Held,
rejected, excluded, and superseded coverage crosses only through the minimum
category counts, control totals, and digests needed to prove completeness,
unless an authorized repair follows the purpose-scoped link back to Phase 21.

The handoff does not assert an accounting-effective date, functional or
accounting currency, or Canonical Accounting Effect. D4 and D11 derive those
accounting facts from the accepted source occurrence and applicable immutable
policy. D4's formal Source Coverage Manifest is derived separately and must
reconcile exactly to the handoff's approved expense line-disposition coverage.

The handoff is immutable after Phase 20 accepts it. Phase 20 validates and
freezes the projection, compiles Accounting Releases, and returns delivery
evidence; it does not own the report, reimbursement balance, or payment
workflow.

### Closed launch occurrence catalog

#### 1. `organization_paid_expense_cleared`

The organization bears the purchase through an organization-owned cash, bank,
debit, or card instrument. Required facts include the exact funding-source
identity and whether a card transaction is pending, posted, cleared, reversed,
or otherwise source-final according to its certified contract.

Pending authorization is not an accounting-ready purchase by default. Cleared
or posted card activity may become ready only under the source contract's
defined finality and correction behavior. For a corporate card, this occurrence
proves the purchase or liability effect only; it never proves payment or
settlement of the card liability.

#### 2. `reimbursement_obligation_approved`

The tenant approved a genuine amount owed to an eligible payee. It establishes
an obligation and does not claim cash moved or create a Phase 20-managed AP
balance.

#### 3. `reimbursement_payment_confirmed`

The source establishes an evidence-qualified payment occurrence and preserves
one explicit provenance class:

- source processor confirmed;
- bank or payment-provider observed;
- accounting provider observed;
- authorized staff-attested external payment; or
- another certified source contract.

Scheduled, queued, initiated, withdrawing, or estimated-arrival states are not
silently promoted to confirmed. The source supplies its exact payment and
evidence dates; D4 and D11 derive the accounting-effective date only through
the applicable accountant-confirmed prospective policy.

#### 4. `expense_accounting_correction`

The source establishes cancellation, reduction, reallocation, payee change,
payment failure, payment return, reversal, or another superseding fact. Phase
20 uses D11 append-only compensation and never edits an earlier release.

### Reimbursement Payment Coverage

One immutable payment may apply to many reimbursement obligations; one
obligation may receive several partial payments. The payment is a separate
source occurrence governed by D17 posting ownership. Each expense or obligation
occurrence references exactly one Approved Expense Snapshot lineage. A grouped
payment references the exact covered obligation IDs and their originating
snapshot versions; it never selects or mutates one report snapshot to absorb
the payment.

The reimbursement coverage slice inside the payment occurrence therefore
preserves:

- one stable source payment identity;
- exact Tenant, Legal Entity, payee, disbursement currency, posting owner,
  funding account, method, and dates;
- processor, bank, provider, or staff-attestation evidence class;
- every covered obligation or predecessor occurrence;
- exact amount applied to each occurrence;
- exact derived obligation-side short-paid or fully paid coverage results;
- the exact signed payment-side unapplied or overpayment residual at the time
  of the payment occurrence;
- source batch or payout identity;
- a coverage digest and control total.

For a reimbursement-only payment, reimbursement applications plus exact signed
payment-side residual dispositions equal the full source amount. When one
atomic payment also covers compensation, the complete typed manifest—not the
reimbursement slice alone—uses the External Payment Occurrence's one payment
currency and proves exact Compensation Payment Coverage plus Reimbursement
Payment Coverage plus one signed, typed, explicitly resolved residual
disposition, including zero, equals the source payment amount. A covered
source component in another currency carries immutable source/payment amounts
and exact conversion evidence; unresolved residual or FX ambiguity fails
closed.

Each payment occurrence and its coverage must be homogeneous for Tenant, Legal
Entity, payee, disbursement currency, and posting owner. A cross-payee payout
batch is only a grouping envelope around separate atomic payment occurrences
through a stable source-batch identity; it does not weaken that invariant. No
application may exceed the obligation's remaining approved amount. Excess cash
remains a payment-side unapplied or overpayment residual; it never expands the
approved obligation. Recovery uses a separately certified Claimant Repayment
Occurrence or cause-linked correction occurrence.

The original payment occurrence freezes its applications and then-current
residual. A later return, dispute, or correction is a new immutable signed
occurrence referencing the original payment and exact affected applications.
Current coverage is derived across that append-only occurrence chain. A
correction may reverse or reassign prior coverage but cannot implicitly
increase the approved obligation. Provider fan-out never changes one source
payment identity. D17 assigns one posting owner to that complete payment. When
external payroll/AP owns its accounting, the expense handoff may carry the
exact reimbursement slice and evidence but cannot emit a standalone
reimbursement-payment Accounting Release. An Asym-owned mixed payment remains
dark until a complete compensation source contract, accountant-confirmed
semantics, and exact D17 owner are certified. A Compensation Handoff Package,
Funding Decision, or reservation fails closed on the expense lane. Partial QBO
or Xero success remains operation-granular under D2/D13; it never marks the
entire coverage set delivered or retries every application.

### D16 activated and still-conditional specialist occurrence families

Phase 21 D16 now supplies the complete tested source boundary for:

- evidence-qualified Expense Advance Issuance Occurrence;
- separately certified Expense Advance Application typed accounting effect
  where applicable;
- Claimant Repayment Occurrence; and
- cause-linked corrections for those admitted families.

The source discriminator keeps cash claimant return and expense advance return
as distinct typed occurrences. Neither is a negative new expense, an offset, a
mutable claimant balance, or proof that another source family was paid.

Expense Advance Policy Version, Claimant Repayment Policy Version, Expense
Advance Authorization Version, Expense Settlement Determination,
Repayment Subject Determination, Claimant Repayment Decision, uncertified
Claimant Repayment Requirement, Advance Residual Position, tasks, raw evidence
observations, disputes, Repayment Restitution Review, and Field Account Funding
Coverage remain Phase 21 operational truth. A Claimant Repayment Requirement
stays accounting-dark unless a separately accountant-certified source contract
recognizes the exact receivable; receivable recognition does not prove returned
cash. Every admitted family independently resolves its D17 posting owner.

Approved Per Diem, Approved Mileage, and other travel-allowance families remain
unavailable unless a complete, tested Phase 21 D18 contract produces one
immutable Travel Allowance Calculation Occurrence and freezes it through an
eligible Approved Expense Snapshot. Phase 20 must still certify the closed
occurrence discriminator and accountant-confirmed posting recipe. It receives
only the minimum calculation result and source lineage, never raw routes or GPS,
Source Packages, cumulative-capacity internals, applicability decisions, or
claimant workflow; it does not calculate rates or decide taxability.

Card-liability settlement is not an expense-report occurrence family. If Asym
later supports it, a separately certified card, bank, or processor source must
own the statement and settlement facts. It can never be inferred from receipt
approval, card matching, statement close, or autopay scheduling.

## Independent truths

The model must never collapse these into one status:

1. **Expense workflow truth** — draft, submitted, held, rejected, or otherwise
   under Phase 21 control.
2. **Approval truth** — exact approved source lines and policy evidence.
3. **Reimbursement-obligation truth** — the source-recognized amount owed to a
   payee; not a Phase 20 AP ledger or aging balance.
4. **Payment truth** — attempt, processing, confirmed, failed, returned, or
   staff-attested external payment.
5. **Accounting readiness and release truth** — D12 candidate and frozen
   Accounting Release.
6. **Provider delivery truth** — QBO/Xero operation, readback, mismatch, or
   drift.
7. **Bank evidence truth** — D10 Expected Bank Arrival and Bank Match for the
   inbound payout and offline-deposit families D10 already governs. D18 does
   not extend D10 to outbound reimbursements.
8. **Final reconciliation truth** — remains owned by QBO or Xero.

Any future outbound reimbursement bank-evidence contract requires a separate
founder decision.

## One report-first, quiet UX

The source report remains the staff, missionary, or claimant's primary object.
Do not expose a parallel list of “accounting occurrences” as the normal
workflow.

### Report summary

Show one compact report page with:

- submitter/payee, Legal Entity, period, total, and currencies;
- **Paid by organization**, **Owed to person**, **Payment status**, and
  **Accounting status** summary amounts;
- **Field Account funding coverage** only when a deterministic tenant policy
  produces it, clearly labelled as organization-controlled capacity rather than
  payment;
- one visible issue count and one current next action;
- line-level source/funding indicators in the existing expense table;
- held lines visibly separated without hiding clean approved coverage; and
- one activity timeline linking approval, payment, accounting release,
  provider delivery, and correction evidence without collapsing them.

### Progressive accounting detail

An **Accounting** disclosure shows:

- exact approval-set coverage;
- typed occurrence summaries;
- payment applications;
- mapping and destination preview;
- provider representation in QBO/Xero terms;
- source-owned blockers and repair owner; and
- immutable history.

Ordinary users see economic language first:

- **Paid by the organization**
- **Owed to the person**
- **Payment is processing**
- **Payment confirmed**
- **Payment recorded by staff**
- **Returned to the organization**
- **Ready for accounting**
- **Needs one accounting fix**

### Actions

Use one context-specific primary action. Clean already-approved work receives no
second approval ceremony. Exceptions expose one next safe action and deep-link
to the owning Phase 21 source or D13 Mission Control case.

Bulk review may group compatible reports, but every confirmation names the
affected reports, Legal Entities, currencies, payees, totals, and payment
coverage. There is no ambiguous “sync again.”

### Accessibility and design-system requirements

- Compact Mission Control density and Maia/Zinc semantic tokens.
- Shared `@asym/ui` Base UI controls and responsive table abstractions.
- Semantic headings, fieldsets, labels, tables, buttons, and links.
- Keyboard-complete actions and coherent visual/DOM/focus order.
- Linked error summary and field-level errors.
- Polite status announcements; no toast-only or color-only financial state.
- Reflow at narrow widths and 200% zoom.
- Touch targets and mobile receipt/report review without requiring mobile
  accounting-provider work.
- Reduced-motion behavior and no decorative motion for financial status.

## Updated options

### Option A — Report as the accounting unit

Phase 21 sends one approved report and Phase 20 infers paid expense, payable,
payment, card, mileage, advance, and correction behavior from report-level
flags.

**Advantage:** smallest apparent schema and a familiar report identity.

**Concern:** mixed funding, held-line succession, partial reimbursement,
batched payment, claimant repayment, and card-liability payment cannot be
represented safely without contradictory flags and mutation.

**Assessment:** reject. The report should remain the UX container, not the
atomic accounting authority.

### Option B — Every line as an independent workflow or mirror all of Phase 21

Phase 20 receives every receipt, line edit, approval step, hold, policy check,
payment attempt, card state, and reconciliation state.

**Advantage:** maximum local visibility and line-level flexibility.

**Concern:** sprawling duplicate workflow, excessive PII, two approval/payment
authorities, report UX fragmentation, provider coupling, and high operational
burden.

**Assessment:** reject. It is comprehensive in the wrong bounded context.

### Option C-prime — One approved snapshot and minimal handoff with typed occurrences

One immutable source-owned Approved Expense Snapshot preserves the familiar
report and exact coverage. A PII-minimized Accounting-Ready Expense Handoff
emits only the closed typed occurrence catalog and exact Reimbursement Payment
Coverage for partial, grouped, or batched payments.

**Advantages:**

- one report-first UX;
- exact line-level funding and mixed-report treatment;
- clean held-line succession;
- no inferred payable or payment;
- source-labelled external payment evidence;
- exact many-to-many reimbursement coverage;
- provider-neutral Phase 21 contract;
- bounded PII and smaller Phase 20 scope;
- append-only correction and delivery recovery; and
- specialist expansion without a generic flag matrix.

**Cost:** activated occurrence families need explicit contracts, fixtures, and
certification.

**Assessment:** recommended. It is the smallest truthful and extensible model.

## Ruthless adversarial review

Every requested category has a material concern. The permanent controls below
are required parts of C-prime-R, not optional future hardening.

| Category                         | Concern | What could go wrong                                                                                                                                                                                                               | Why it matters                                                                                     | Severity | Likelihood  | Permanent prevention                                                                                                                                                                  |
| -------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                      | Yes     | One report-level flag assumes every line has the same payer, currency, finality, and payment path. A provider or source lifecycle change breaks inference.                                                                        | Incorrect cash, obligation, or correction entries can be released from a valid-looking report.     | Critical | High        | Immutable Approved Expense Snapshot, typed line funding, closed occurrence catalog, versioned source contracts, and fail-closed unknown classifications.                              |
| Technical debt                   | Yes     | Phase 20 copies Phase 21 workflow or embeds QBO/Xero object IDs upstream.                                                                                                                                                         | Two mutable models diverge, and every provider change reaches the missionary expense UX.           | High     | High        | Reference source versions, keep provider-neutral occurrences, reuse D4–D17, and prohibit a second expense workflow or provider integration.                                           |
| Edge cases                       | Yes     | Mixed reports, held lines, partial approvals, pending cards, personal-liability cards, multiple currencies, negative adjustments, partial/grouped payments, claimant repayment, and deceased/offboarded payees can be mishandled. | These are ordinary finance operations, not theoretical anomalies.                                  | Critical | High        | Complete line dispositions, source-finality contracts, exact applications, successor sets, specialist occurrences, and production-shaped fixtures.                                    |
| Footguns                         | Yes     | Approval may be treated as payment; staff may mark an external payment without scope; a duplicate export may be allowed after a warning; a missing vendor may be created silently.                                                | One click can duplicate expense or cash, create the wrong counterparty, or corrupt reconciliation. | Critical | High        | Economic-language confirmation, explicit evidence class and coverage, no warning-only re-export, proof-gated recovery, and no silent counterparty creation.                           |
| Tenant safety                    | Yes     | A report, payee, receipt, destination, payment, or cache can cross Tenant or Legal Entity.                                                                                                                                        | Sensitive worker data and financial entries can leak or reach the wrong books.                     | Critical | Medium      | Composite tenant/entity/source constraints, request-time authorization, private evidence storage, scoped URLs, RLS/integration negatives, and no cross-entity payment manifest.       |
| Over-engineering                 | Yes     | A generic expense DSL, universal payment engine, card subledger, payroll system, or independent reconciliation workspace emerges.                                                                                                 | Asym becomes a weaker accounting/expense suite and Phase 20 becomes unmaintainable.                | High     | High        | Closed catalog, conditional specialist contracts, one report-first source UX, D13 shared follow-up, and QBO/Xero-owned final reconciliation.                                          |
| UX/UI and user friction          | Yes     | Staff see internal occurrences, provider jargon, several queues, noisy healthy statuses, or line-by-line ceremony.                                                                                                                | Finance work slows and users bypass controls.                                                      | High     | High        | One report page, four plain-language summary amounts, one contextual action, progressive accounting disclosure, aggregate clean work, and exception-only detail.                      |
| Hidden coupling                  | Yes     | Report status, card status, payment status, Accounting Release, provider state, and bank match share one enum or mutable row.                                                                                                     | A source edit or provider callback silently changes unrelated authority.                           | Critical | High        | Separate identities and append-only evidence for workflow, approval, payable, payment, release, provider, and bank truth.                                                             |
| Failure modes                    | Yes     | Payment times out, card later reverses, provider partially accepts fan-out, source correction races release, or evidence expires.                                                                                                 | Blind retry or mutation can duplicate or orphan accounting.                                        | Critical | High        | Outcome-unknown quarantine, exact applications, atomic release fence, append-only correction, D13 containment, and operation-granular recovery.                                       |
| Data integrity                   | Yes     | Split totals, approved amounts, payment applications, currency, FX, taxes, or source coverage fail to reconcile exactly.                                                                                                          | The Accounting Effect no longer equals the approved economic facts.                                | Critical | Medium–High | Exact decimal arithmetic, source and approval coverage manifests, deterministic rounding policy, balance/control totals, and digest-pinned versions.                                  |
| Security and privacy             | Yes     | Receipt PII, bank details, card data, worker status, medical/travel context, or free-text comments enter logs, events, URLs, or broad accounting evidence.                                                                        | Expense evidence is unusually sensitive and may create legal or safety exposure for missionaries.  | Critical | Medium      | Reference-not-copy evidence, field allowlists, redacted events/logs, private encrypted storage, short-lived purpose-bound access, malware scanning, and retention policy.             |
| Scalability and performance      | Yes     | Many receipts, allocations, funds, card lines, reports, or payment applications overload synchronous review and compilation.                                                                                                      | Month-end close becomes slow or unreliable for large missions organizations.                       | High     | High        | Async bounded workflows, immutable chunks, complete-operation partitioning, aggregate read models, pagination/virtualization, and certified volume envelopes.                         |
| Operational burden               | Yes     | Staff must resolve every healthy report, provider mapping drift, external payment, or card exception manually.                                                                                                                    | Finance teams recreate spreadsheets and tribal procedures outside Asym.                            | High     | High        | Source-owned defaults, auto-ready only under certified contracts, quiet exception clusters, named repair owners, and provider/source runbooks.                                        |
| Observability gaps               | Yes     | “Approved,” “Paid,” “Exported,” or “Synced” hides whether cash, provider delivery, or bank match actually occurred.                                                                                                               | Support cannot diagnose missing or duplicate accounting, and users receive false confidence.       | Critical | High        | Independent monotonic timelines, exact source/provider correlations, outcome reason codes, coverage/control totals, and current-vs-historical evidence.                               |
| Dependency and integration risks | Yes     | QBO/Xero capabilities, payment processors, card feeds, employee records, tax handling, or source APIs change.                                                                                                                     | A valid source occurrence may no longer have a safe provider representation.                       | High     | High        | Provider-neutral handoff, D7/D8 certification, pinned contracts, capability quarantine, artifact continuity, and no provider IDs upstream.                                            |
| Migration and upgrade risks      | Yes     | New occurrence kinds or source versions reinterpret historical reports or require replay.                                                                                                                                         | Historical releases become unverifiable and upgrades can duplicate posting.                        | High     | Medium      | Immutable schema/contract versions, backward evidence readers, prospective activation, no recomputation of released effects, and explicit cutovers under D17.                         |
| Other development hazards        | Yes     | Concurrent approval and release, duplicate source delivery, stale preview, floating-point math, unordered applications, retry races, or ambiguous staff attestations produce nondeterminism.                                      | The same source can create different or duplicate accounting effects.                              | Critical | Medium–High | Unique source-version keys, compare-and-freeze, exact decimals, deterministic ordering, idempotent ingestion, serialized claims, stale-preview rejection, and concurrency/fuzz tests. |

## Production proof gates

D18 must not reach production until:

1. **Contract fixtures** cover organization-paid, employee-paid, personal-
   liability card, corporate card, mixed report, held succession, partial
   approval, rejected/excluded line, pending/posted/cleared/reversed card, and
   source correction.
2. **Payment fixtures** cover one-to-one, one-to-many, many-to-one, partial,
   batched, short, overpaid, failed, returned, and staff-attested external
   payment cases with exact coverage sums.
3. **Specialist gates** prove only D16's certified advance and claimant-
   repayment discriminators and D18's certified travel-allowance discriminator
   can enter; unsupported or wrong-discriminator variants fail closed rather
   than fall back to an ordinary expense; raw route/GPS, policy, cumulative-
   capacity, and tax-treatment data stay excluded; and card-liability settlement
   remains unavailable until its independent contract is certified.
4. **Accounting equivalence tests** prove every occurrence compiles through
   D4–D8 to balanced effects without provider semantics entering source truth.
5. **Correction and delivery tests** prove D11 compensation, D13 ambiguity,
   D16 package recovery, and D17 posting ownership without mutation or replay.
6. **Concurrency tests** cover duplicate delivery, simultaneous source
   correction/release, stale approval preview, overlapping payment application,
   and source/provider callback races.
7. **Tenant and privacy tests** cover cross-tenant/entity/payee/payment/evidence
   denial, expired grants, redacted logs/events, evidence access, and receipt
   malware/size/type handling.
8. **Scale tests** cover production-shaped report, line, receipt, allocation,
   fund, and payment-application volumes plus worker restart and storage
   failure.
9. **Accessibility tests** cover keyboard, screen reader, focus, error summary,
   status announcements, responsive reflow, zoom, contrast, and touch.
10. **Bookkeeper usability tests** prove representative finance users can
    distinguish organization-paid, payable, processing, confirmed,
    staff-recorded, repayment, released, delivered, and reconciled without
    training.
11. **Professional review** covers worker classification, accountable-plan,
    international, missing-receipt, advance, mileage/per-diem, taxable-
    compensation, recognition, functional-expense, card-liability, FX,
    VAT/GST/sales-tax, period, and correction policy.

## Permanent implementation order

1. Freeze the provider-neutral Approved Expense Snapshot and PII-minimized
   Accounting-Ready Expense Handoff contract before designing QBO/Xero
   payloads.
2. Implement the closed launch occurrence catalog and exact approved expense
   line-disposition coverage validation.
3. Implement Reimbursement Payment Coverage with exact decimals,
   concurrency-safe uniqueness, complete typed mixed-payment conservation, and
   the D17 whole-payment posting-owner fence.
4. Integrate D12 release readiness and D13 exception ownership without adding
   another queue.
5. Compile through existing D4–D8 provider-native plans and D11/D16/D17
   recovery/cutover contracts.
6. Build Phase 21's one report-first claimant, approver, and finance surfaces;
   surface only D13 Accounting Exception Cases in shared Mission Control.
7. Certify unit, integration, provider, security, scale, accessibility, and
   finance-user evidence.
8. Activate specialist occurrence families only when their independent source
   and professional-review gates pass.

## Ratified D18

> **C-prime-amended-and-hardened (C-prime-R) — one immutable, source-owned
> Approved Expense Snapshot exposed to Phase 20 only through a PII-minimized,
> Tenant-, Legal-Entity-, source-version-, and posting-owner-pinned
> Accounting-Ready Expense Handoff; a closed launch catalog of Cleared
> Organization-Paid Expense, Approved Reimbursement Obligation,
> evidence-qualified Reimbursement Payment, and cause-linked Expense
> Accounting Correction occurrences; exact Reimbursement Payment Coverage for
> partial, grouped, one-to-many, and many-to-one settlement; separately
> certified employee-repayment, advance, per-diem, and mileage source
> contracts; and independently authoritative expense-workflow, field-account,
> payment, Accounting Release, provider-delivery, Bank Match, and final QBO/Xero
> truth behind one quiet report-first experience—without report-as-transaction
> collapse, a Phase 20 AP ledger, card-liability settlement, payment execution,
> payroll or tax adjudication, raw-receipt duplication,
> approval-implies-payment, aggregate `Paid` authority, provider identifiers
> upstream, warning-only duplicate re-export, or a second expense, accounting,
> card, or reconciliation system.**

The founder ratified this C-prime-R as D18 on 2026-07-26.

## Phase 21 D15 precision note — 2026-07-31

The later Phase 21 D15 reimbursement-handoff decision preserves this D18
boundary. Reimbursement Handoff Packages, Delivery Profile Versions, Execution
Claims, Handoff Coverage, Handoff Attestations, Handoff Operations, provider
draft/input acceptance and readback, operation ambiguity, and residual route
succession are operational handoff evidence—not payment or accounting-ready
occurrences.

Package access is non-executing. Handoff Attestation proves only the recorded
external handoff. Provider draft readback proves only that operation. For the
Phase 21 D15 reimbursement-handoff path, only an independently eligible
Approved Reimbursement Obligation or separately source-qualified External
Payment Occurrence may enter the closed D18 catalog through that path. D17 assigns the posting owner
when the actual source or payment occurrence exists. QBO/Xero Accounting
remains Phase 20-only, staff payment evidence retains its explicit strength,
and claimant repayment remained unsupported at D15 until the separately
certified source contract supplied by Phase 21 D16.

## Phase 21 D16 precision note — 2026-07-31

The later Phase 21 D16 decision activates a bounded extension of the D18 closed
catalog; it does not create an advance, claimant-repayment, collections,
payroll-deduction, AP, banking, or Field Account workflow in Phase 20. The only
new admissible sources are:

- evidence-qualified Expense Advance Issuance Occurrence;
- separately certified Expense Advance Application typed accounting effect
  where applicable;
- Claimant Repayment Occurrence; and
- cause-linked corrections for those admitted source families.

A cash claimant return and an expense advance return remain distinct typed
accounting occurrences and cannot be represented as a negative expense or
automatic net. Policies, authorization, the operational Expense Settlement Determination,
Repayment Subject Determination, Claimant Repayment Decision, uncertified
Claimant Repayment Requirement, residual position, tasks, raw observations,
disputes, Repayment Restitution Review, and Field Account Funding Coverage fail
closed before Posting Intent. A Claimant Repayment Requirement stays dark
unless a separately accountant-certified contract recognizes its exact
receivable, which still does not establish returned cash.

D17 independently assigns the posting owner of each admitted D16 occurrence.
No policy, authorization, requirement, Field Account record, handoff package,
bank observation, or QBO/Xero record may infer that ownership or replace source
truth. Accounting effects for cash claimant returns and expense advance returns
remain distinct even when they reference the same claimant or external evidence.

## Phase 21 D22 precision note — 2026-08-01

Phase 21 D22 adds optional before-spend organization authorization, not an
accounting-ready source. Every posture, request version, private plan-evidence
reference, Governance Resolution, Assignment Snapshot, Review Action,
Authorization Decision, compatible capacity reservation, later-claim
Authorization Coverage, unused-scope declaration, residual, successor, and
correction remains Phase 21-only and fails closed before D18 admission.

Missing required prior authorization is a typed D13 source-policy exception;
it is not a Phase 20 accounting exception and never prevents capture of the
actual claim or evidence. Only a separately qualified later D10/D13 Approved
Expense Snapshot, Reimbursement Obligation, source-qualified External Payment
Occurrence, or other certified economic source may cross. A D22 reference may
be preserved as source lineage, but it cannot select posting ownership, replace
actual approval, or prove incurrence, substantiation, eligibility, liability,
payment, posting, or reconciliation.

## Phase 21 D23 precision note — 2026-08-01

Phase 21 D23 governs only when an exact approved expense source slice enters a
Finance-confirmed operational support balance. Its Expense Field Account Effect
Recognition Profile, Effect Basis, Field Account Funding Coverage and
Disposition, Effect Coverage, Expense Field Account Effect, Support Cycle
inclusion, exception, and correction are not accounting recognition or
accounting-date authority and fail closed before D18 source admission.

An independently certified Approved Expense Snapshot, Reimbursement
Obligation, source-final organization-paid occurrence, External Payment
Occurrence, or cause-linked correction may still enter its own closed D18
source family with an independently resolved D17 posting owner. That handoff
does not inherit D23 mode, profile, effect identity, qualification date, close,
or through date. Conversely, QBO/Xero bills, payments, home amounts, delivery
readback, drift, Bank Match, and final reconciliation cannot qualify, modify,
or repair D23 support-balance truth. Minimum necessary D23 lineage is
non-authoritative provenance only.

## Phase 21 D24 precision note — 2026-08-02

Phase 21 D24 adds optional, exact-claim-bounded expense collaboration, not an
accounting-ready source. Its Assignment Version, invitation and acceptance,
Evidence Access Projection Version, Claimant Confirmation or admitted external
attestation, helper action, and actor provenance remain Phase 21 truth. They
cannot replace Phase 12 authorization or prove incurrence, substantiation,
approval, obligation, payment, Field Account effect, posting, or
reconciliation.

Phase 20 rejects the entire D24 family before D18 admission. An independently
qualified Approved Expense Snapshot, Reimbursement Obligation, source-final
organization-paid occurrence, External Payment Occurrence, or cause-linked
correction may still enter its existing lane; minimum necessary helper
provenance may accompany it only as non-authoritative lineage. QBO/Xero and
Phase 20 cannot grant, revoke, expand, satisfy, or rewrite assignment, consent,
evidence access, or helper authority, and this note creates no new posting
recipe, source discriminator, artifact lane, or adapter.

## Phase 21 D25 expense-resolution precision amendment — 2026-08-02

D25 Expense Claim Resolution Cause Contract Versions, Cases, Occurrences,
Projections, Downstream Impact Manifests and dispositions, tasks, messages,
responses, source-owner requests, and completion proof remain coordination
truth and are rejected before D18 accounting admission. None is an accounting-
ready expense source, posting owner, accounting date, provider operation,
correction, or reconciliation fact.

An independently authoritative source correction may still enter its existing
closed lane. Phase 20 alone determines any Compensating Accounting Release,
accountant-permitted period/treatment, delivery, exact readback, drift, and
Accounting Exception Case outcome. D25 may retain only opaque correlation and
observe the Phase 20 result; case or task completion, communication, silence,
timer, or provider ambiguity creates no accounting work and proves no posting
or reconciliation. This note adds no Phase 20 source, recipe, package, lane,
adapter, or implementation scope.

## Phase 21 D28 cumulative-admission precision note — 2026-08-02

D28 Travel Allowance Opening Cumulative States, Capacity Key Contracts,
Cumulative Admissions, Admission Manifests, opening or continuity dispositions,
previews, first-use operations, corrections, and containment are D18 calculation-
admission truth only. Phase 20 rejects the entire D28 family before accounting
source admission. None proves an incurred expense, Approved Expense Snapshot,
Reimbursement Obligation, Field Account effect, payment, payroll/tax treatment,
posting owner, accounting date, provider operation, or reconciliation fact.

A later independently qualified D10/D13 Approved Expense Snapshot may carry its
frozen Travel Allowance Calculation Occurrence through the existing accounting-
ready expense lane. Minimum necessary D28 lineage may explain the calculation,
but it cannot select a posting recipe, cause a historical claim to be fabricated,
or make QBO/Xero repair, qualify, or rewrite the cumulative pool. This note adds
no Phase 20 source discriminator, recipe, package, adapter, or implementation
scope.

## Explicit non-goals

- No Phase 20 receipt capture, OCR, report construction, approval,
  reimbursement execution, or missionary expense UX.
- No report-level paid/reimbursable flag as accounting authority.
- No copy of Phase 21 workflow or sensitive evidence.
- No payment inferred from approval, receipt, card match, statement close,
  reimbursement scheduling, provider export, or bank match.
- No QBO/Xero object choice or provider ID embedded in source truth.
- No automatic provider vendor, employee, customer, account, or tracking-
  dimension creation during delivery.
- No warning-only duplicate re-export or deletion-first correction.
- No provider write presented as payment, bank arrival, or final
  reconciliation.
- No payroll, wage, worker-classification, accountable-plan, per-diem, mileage,
  or taxable-compensation decision engine in Phase 20.
- No card issuing, card feed, card statement, liability-payment, ACH, or bill-
  pay product in Phase 20.
- No specialist occurrence without its certified source contract.
- No final bank reconciliation outside QBO or Xero.
- No mutation of accepted handoffs, Approved Expense Snapshots, prior
  Accounting Releases, provider records, or historical evidence.
- No mandatory second approval ceremony for clean, already-approved source
  work.
