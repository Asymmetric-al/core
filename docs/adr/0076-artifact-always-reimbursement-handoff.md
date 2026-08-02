# Artifact-always reimbursement handoff with qualified execution

**Status:** Accepted (founder ruling, Phase 21 grill session — D15)

## Context

Phase 21 D10 and D13 establish source-owned Approved Expense Snapshots and
exact Reimbursement Obligations. D1 keeps Field Account Funding Coverage
independent from organizational liability and payment. D7 establishes a
capability-honest provider-operation kernel for compensation drafts, while
Phase 20 D18 accepts only a PII-minimized Accounting-Ready Expense Handoff and
evidence-qualified payment facts. None of those decisions owns the operational
step by which finance prepares an approved reimbursement for an external
payroll, accounts-payable, check, or other tenant process.

Treating artifact download, provider draft acceptance, payroll completion, a
payslip, an accounting entry, or bank reconciliation as payment would create
false claimant status and duplicate-payment risk. Building direct money
movement, beneficiary-bank custody, AP aging, payroll calculation, or a generic
payout API would instead turn Phase 21 into payroll, accounts payable, banking,
or accounting software.

## Decision

Every exact Reimbursement Obligation may produce one immutable,
content-addressed, schema-versioned, PII-minimized **Reimbursement Handoff
Package**. Package creation, preview, protected audit retrieval, reference
download, and redownload are non-executing. An explicit release creates one
immutable **Reimbursement Execution Claim** assigning every exact,
non-overlapping obligation-coverage unit to exactly one executable lane.

The complete and quiet default is **Handle outside Asym**. Its release is
recorded through one **Handoff Attestation** that identifies the exact package,
covered work, actor, external process, method, time, and reference. The
attestation proves handoff only and never proves payment. A tenant may instead
activate a capability-certified payroll or accounts-payable pre-execution
draft/input lane for an exact Tenant, Legal Entity, claimant relationship,
reimbursement family, provider organization and product, country, environment,
external provider participant/payee reference, ISO currency, cadence or cycle,
certified operation, and external execution owner. That provider-domain target
identity is not a Support Assignment Participant Membership and is never
inferred from participation. Certification must prove that both the endpoint
and the tenant's effective downstream automation cannot approve, calculate,
submit, schedule, fund, or send money.

Each connected attempt becomes an immutable **Reimbursement Handoff
Operation**. It may reuse D7's shared concurrency, idempotency, readback, drift,
backpressure, kill-switch, and ambiguity-safe operation kernel, but
compensation, reimbursement, payment, and accounting retain separate packages,
commands, coverage, statuses, and authority. Every covered unit resolves only
as `confirmed_handed_off`, `proven_not_handed_off`, or `outcome_unknown`. Only
an exact residual proved not handed off or not executed may receive an
append-only successor claim. Unknown outcomes remain quarantined and cannot
fall back automatically, expire by timer, or enter a second lane.

The lane pins an `external_execution_owner` and separately references the Phase
20 D17 posting-ownership contract where one already applies; it cannot assign
or infer the posting owner of a future atomic payment occurrence. Phase 20 D17 assigns
that owner when the source or payment occurrence exists, and neither owner
determines the other. Payroll/AP or governed manual processes remain
authoritative for execution and provider-native status. Provider draft/input
readback proves only handoff-operation outcome. Payment requires a separately
authoritative **External Payment Occurrence** with explicit evidence source and
strength plus exact many-to-many **Reimbursement Payment Coverage**.
Staff-attested evidence is shown as **Payment recorded by finance** and is
never silently upgraded to stronger confirmation.

Payment occurrences are atomic and homogeneous by Tenant, Legal Entity,
authoritative payee, payment currency, external execution owner, and posting
owner. Cross-payee batches are envelopes only. Partial, grouped, cross-report,
mixed compensation/reimbursement, cross-currency, return, partial reversal,
reversal, repayment, correction, and reissue paths conserve exact coverage and
typed residuals through append-only evidence. An obligation or package is never
edited after release.

Repayment-related evidence may remain linked to a D15 exception, correction,
return, or recovery record, but D15 does not certify claimant repayment as a
source occurrence, negative reimbursement payment, Field Account effect, or
Phase 20 accounting family. Phase 21 D16 and ADR-0077 now own that separate
reverse-flow contract without changing D15 handoff or payment truth.

Phase 20 remains the only QBO/Xero Accounting doorway. A Reimbursement Handoff
Package, Execution Claim, Handoff Attestation, Handoff Operation, provider
draft acceptance, payroll status, payslip, or accounting record cannot create
payment truth or an Accounting Posting Intent by itself.
QBO and Xero Accounting bills, payments, journals, and other native accounting
objects are never D15 accounts-payable draft inputs; they remain Phase 20-only.

The finance experience asks one setup question—how this claimant type is
normally reimbursed—and hides unavailable lanes. Healthy work is grouped and
quiet; the default workspace shows only **Needs attention**, **Ready for
external processing**, **Waiting on external process**, and **Payment evidence
received**. Claimant copy uses calm stages such as **Approved**, **Finance is
processing it**, **With payroll**, **With accounts payable**, **Partially
paid**, **Payment recorded by finance**, **Payment confirmed**, or **Finance is
resolving a returned payment**. The product never offers **Pay**, **Send
money**, blind **Retry payment**, report-level **Mark paid**, generic **Sync**,
**Settled**, or **Reconciled** actions.

**Phase 21 D25 precision amendment (2026-08-02).** D25 may request and observe
one exact D15-owned obligation, handoff, provider-inspection, payment, return,
or residual recovery command. A Resolution Case, projection, impact
disposition, or **Complete** label cannot cancel or reduce an obligation,
select or switch an execution lane, retry an ambiguous provider outcome, mark
payment, or infer claimant repayment. The D15 source and external execution
owners retain their immutable results and ambiguity-safe recovery.

## Consequences

- Every tenant has a complete reimbursement handoff without adopting a
  provider integration.
- Connected options appear only where the exact operation and effective tenant
  automation are currently certified.
- Artifact access, handoff, provider acceptance, payment, accounting, and final
  reconciliation remain inspectable independent truths.
- Partial and uncertain outcomes cannot duplicate payment through automatic
  fallback or blind retry.
- Phase 21 gains a useful finance bridge without becoming a payment rail,
  beneficiary vault, AP ledger, payroll engine, or second accounting doorway.
- Production release requires exact conservation, race, retry, readback,
  tenant-isolation, privacy, scale, provider-drift, accessibility, and
  representative-user proof from the Phase 21 decision log.

## Rejected alternatives

- treating an exported or downloaded file as handed off or paid;
- one mutable report-level reimbursement status;
- automatically changing lanes after timeout or provider failure;
- direct reimbursement money movement or beneficiary-bank custody;
- QBO/Xero bills, payments, journals, or bank matching as payment proof;
- a universal payroll/AP payload or generic payout/workflow/status API;
- automatic payroll deduction, offset, or claimant repayment collection;
- dual delivery, fuzzy payment matching, destructive correction, or blind
  retry.

## Related decisions

- [ADR-0059 — Accounting-ready expense handoff](./0059-accounting-ready-expense-handoff.md)
- [ADR-0068 — Capability-honest multi-provider compensation handoffs](./0068-capability-honest-multi-provider-compensation-handoffs.md)
- [ADR-0071 — Claim-level expense truth and purpose-routed tenant AI](./0071-claim-level-expense-truth-and-purpose-routed-tenant-ai.md)
- [ADR-0074 — Bounded prospective Expense Governance Profiles](./0074-bounded-prospective-expense-governance-profiles.md)
- [Phase 21 decision log](../prds/sitestacker-parity/phase-21-field-accounts-decision-log.md)
