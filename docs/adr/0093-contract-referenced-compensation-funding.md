# ADR-0093: Contract-referenced compensation funding with external payroll authority

**Status:** Accepted (founder ruling, Phase 21 grill session — D4)

Phase 21 supports optional, tenant-owned Compensation Funding Plan versions
that reference—not replace—the worker's exact external Engagement Authority
Reference.
The plan uses one of three bounded methods: finance enters each period, fixed
approved target, or up to an approved maximum. Each prospective Plan Version
owns a half-open configuration-effective interval and cadence. It is Tenant-,
Legal-Entity-, worker/payee-, Field-Account-, Field-Account-funding-currency-,
external-compensation/payment-currency-, arrangement-, and
destination-scoped; it does not own a cycle's Compensation Funding Period.
Each proposal and decision instantiates one exact half-open Compensation
Funding Period, distinct from both a Support Cycle and an external payroll or
accounts-payable period. Overlapping Plan Version intervals for the same
scope are rejected, and compare-and-swap permits only one current,
non-superseded Compensation Funding Decision lineage for a scope and period.
An off-cycle decision uses a distinct exact period. The currencies are equal
by default. Cross-currency funding freezes both exact amounts/currencies,
external conversion authority/reference, rate or source amounts, rounding,
residual, and provenance; missing evidence blocks rather than invoking
implicit FX.

The Engagement Authority Reference is source-pluggable without becoming
Asym-owned. Use an exact payroll/HR/AP provider identity and version when
available; otherwise a governed tenant-issued record freezes issuer/actor,
asserted external classification, effective interval, source/evidence
reference, and version. This supports artifact-only tenants while preventing
inference from a missionary role, Field Account, or fundraising goal.

A disposable proposal may use only Finance-confirmed Field Account capacity,
existing coverage, and a simple optional retained-support floor. One immutable
Compensation Funding Decision freezes the exact Field Account-covered,
separately organization-covered, and unresolved dispositions. Purpose-typed
Field Account Funding Coverage reserves exact organization-controlled capacity
but is not a debit, liability, authorization to pay, or evidence of payment.
Underfunding creates one exception; it never automatically reduces wages,
creates a short check, debt, negative balance, backpay, arrears, or recovery
schedule. When qualified evidence later creates a Compensation Field Account
Effect, the exact overlapping active coverage amount atomically transitions
to `fulfilled`; effect-backed coverage never transitions to `released`.
Projected capacity therefore subtracts the reservation before recognition and
the debit afterward, never both. Only a non-overlapping remainder may
transition to `released`, and only when it is proved never handed off or
submitted or exact downstream cancellation/reversal proof establishes that it
cannot still execute. Partial outcomes transition exact amounts;
outcome-unknown work stays reserved in an exception. No timer expiration or
unproved reuse is permitted.

Every authorized decision produces one immutable, content-addressed,
PII-minimized Compensation Handoff Package. The package always has a usable
artifact and selects exactly one route: artifact-only, an exact
capability-certified provider-draft input, or a separately certified Phase 20
source handoff. Provider automation is draft-input-only: Asym does not approve,
submit, calculate, post, or run payroll. QuickBooks Accounting, QuickBooks
Workforce, Xero Accounting, and each regional Xero Payroll product are distinct
capabilities. An accounting connection does not imply payroll access. The
Phase 20 route is a source handoff only: the Funding Decision alone creates no
Posting Intent or Accounting Release. Phase 20 remains dark until a separately
certified source contract names an eligible evidence-qualified occurrence,
accountant-confirmed semantics, and the Phase 20 D17 posting owner; it cannot infer
compensation expense or payable from reserved coverage.

External Compensation Result, External Payment Occurrence, Compensation Field
Account Effect, and accounting truth remain separate. Each Legal Entity pins
one prospective recognition policy: the guided default creates an append-only
Field Account effect from the finalized external result; the bounded
alternative uses exact external payment evidence. A plan, reservation, export,
provider draft, provider acceptance, pay-run schedule, posted pay run, payslip,
or accounting entry cannot create that effect or prove payment. Mixed
compensation/reimbursement payments use exact typed coverage. The
payment-evidence alternative requires an exact source-qualified Field Account
organization-cost basis or a link to a finalized result that supplies it; net
cash alone cannot establish gross compensation or employer cost. Every effect
carries an exact component-level result/payment-to-decision application
manifest. It conserves the selected authority's qualified organization-cost
basis exactly into Field Account-applied, separately organization-funded, and
unresolved variance using the Decision's frozen component dispositions. The
Field Account application cannot exceed unused active compensation coverage;
organization funding cannot exceed the Decision authorization; and the three
dispositions must equal the qualified basis. The system never silently clamps,
prorates, or reprioritizes funding sources. A mismatch remains covered where
its outcome is unknown and opens one exception. Corrections append signed
deltas. Only changes to the policy-selected recognition authority correct the
Field Account effect.
Disagreement on the other evidence track remains visible but does not
automatically reverse it. Payroll accounting has one posting owner so Asym
cannot duplicate journals already posted by payroll or accounts payable.

Staff work in one exception-first funding workspace with guided setup,
production-shaped review, homogeneous clean-row bulk authorization, exact
through-dates, and distinct finance, handoff, external-result, and
external-payment tracks.
Missionaries see no empty module when compensation funding is not configured.
When enabled, one quiet card shows date and truthful stage first, an amount only
when authorized and visible, and the Finance-confirmed support balance
separately. The interface does not describe support as worker-owned or
withdrawable, infer classification or legal entitlement, calculate payroll or
tax, expose unnecessary payroll PII, move compensation money, or call an
export, posted pay run, or payslip `Paid`.

Phase 21 D7 subsequently fixes the launch adapter portfolio, production
authorization gate, prospective provider-draft delivery profile, immutable
provider-operation evidence, and ambiguity-safe residual recovery in
[ADR-0096](./0096-capability-honest-multi-provider-compensation-handoffs.md).
That decision narrows D4's generic provider-draft route without changing D4's
artifact-always package, one-executable-lane rule, external payroll/AP
authority, or Phase 20 accounting boundary.

**Phase 21 D23 precision amendment (2026-08-01).** If an expense slice already
covered by D23 must become D4 taxable compensation, one same-currency atomic
ownership-succession group appends the D23 reversal, transfers exact source
coverage ownership, and admits the D4 replacement in the same later permitted
Support Cycle. Until all D4 facts qualify, capacity remains conserved and one
cause-owned exception remains open; D4 may separately add employer costs not
represented by the original D23 slice.
