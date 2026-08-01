# Accounting-ready expense handoff

**Status:** Accepted (founder ruling, Phase 20 grill session — D18)

Phase 21 owns the complete expense report, receipts, substantiation, approval,
reimbursement obligation, payment execution and evidence, field-account effect,
and one immutable **Approved Expense Snapshot**. Phase 20 receives only one
PII-minimized, Tenant-, Legal-Entity-, source-version-, and posting-owner-pinned
**Accounting-Ready Expense Handoff**. The handoff may contain a closed launch
catalog of Cleared Organization-Paid Expense, Approved Reimbursement
Obligation, evidence-qualified Reimbursement Payment, and cause-linked Expense
Accounting Correction occurrences plus exact **Reimbursement Payment
Coverage**. Phase 20 validates those facts and compiles the existing immutable
Accounting Release; it does not own expense approval, AP balances, payment
execution, card-liability settlement, payroll or tax adjudication, or final
reconciliation.

Each expense or obligation occurrence references exactly one Approved Expense
Snapshot lineage. A later payment is a separate source occurrence, governed by
D17 posting ownership, whose coverage references every exact obligation and
originating snapshot version. Payment coverage is homogeneous for one Tenant,
Legal Entity, payee, disbursement currency, and posting owner, and conserves
the source payment through exact applications plus signed payment-side
residual dispositions. Cross-payee batches are grouping envelopes around
separate atomic payment occurrences.

Snapshot-rooted handoffs carry exactly one Approved Expense Snapshot identity;
payment handoffs instead carry one payment-source identity plus the complete
covered-obligation and originating-snapshot reference set. They never invent a
primary snapshot. Original payment applications are immutable. Later returns,
disputes, or corrections are new signed occurrences, and no application may
exceed the obligation's remaining approved amount.

One report remains the ordinary user experience, but expense workflow,
field-account, reimbursement obligation, payment, Accounting Release, provider
delivery, Bank Match, and final QBO/Xero truth remain independently
authoritative. Employee-repayment, advance, per-diem, and mileage occurrence
families require separately certified source contracts. Raw receipts are not
copied into Phase 20; a purpose-scoped destination attachment requires a
separate policy and projection. Provider identifiers, mutable balances,
inferred payment, aggregate `Paid` authority, and warning-only duplicate
re-export cannot enter source truth.

The handoff carries source dates, source currencies, source FX evidence, and
approved expense line-disposition coverage. D4 and D11—not Phase 21—derive
accounting-effective dates, functional or accounting currency, and the
Canonical Accounting Effect. D4's Source Coverage Manifest is separately
derived and must reconcile to the handoff. D18 does not extend D10 Bank Match
to outbound reimbursement disbursements; that would require a separate
decision.
