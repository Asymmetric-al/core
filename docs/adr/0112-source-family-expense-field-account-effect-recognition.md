# ADR-0112: Source-family-specific Expense Field Account Effect Recognition

**Status:** Accepted (founder ruling, Phase 21 grill session — D23)

## Context

Phase 21 already separates Expense Claims, Approved Expense Snapshots,
Reimbursement Obligations, Field Account Funding Coverage, reimbursement
handoff, External Payment Occurrences, Field Account closes, Phase 20
Accounting Releases, and final QBO/Xero books. It did not yet identify the
exact source occurrence that permits each ordinary approved expense to reduce a
Finance-confirmed Field Account Balance.

One universal `approved`, `paid`, or `posted` trigger is incorrect. A claimant-
paid reimbursement may establish an organization obligation before external
payment; an organization card has a source-final purchase but no claimant
reimbursement; paying the card statement later settles a liability and must not
create another expense effect. International expenses may also have different
receipt, obligation, payment, entity-functional, and Field Account currencies.

The setting must remain an operational support-balance policy rather than GAAP,
tax, accounts-payable, reimbursement-payment, bank-reconciliation, or QBO/Xero
authority. It must preserve tenant flexibility without creating per-claim
improvisation, a rules engine, automatic partial funding, or a second accounting
product.

## Decision

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
> freezing exactly one profile on D16's core Approved-Expense-Snapshot-
> rooted Expense Settlement Determination; creating one PII-minimized immutable
> Expense Field Account Effect Basis and non-reusable exact Effect Coverage that
> conserves approved integer minor-unit coverage without capacity-created
> partials; atomically appends immutable dispositions so only one exact slice
> bears capacity; pins source-family-specific Field Account amount authority and
> exact externally owned multi-currency evidence; preserves incurred, approval,
> obligation, qualification, close, payment, accounting-effective, and provider-
> posting dates independently; applies refunds, returns, conversion
> differences, reclassifications, failures, and corrections only through
> source- and cause-linked append-only deltas or exact ownership succession in a
> later permitted Support Cycle; enforces complete tenant/entity/assignment/
> purpose/account/currency scope through composite same-scope keys, server-only
> canonical truth, forced coarse RLS, Phase 12 PDP current-authority reproof, a
> stable source-slice semantic identity independent of retry, profile, and
> Support Cycle, CAS/Serializable atomic effect-coverage-outbox commits, bounded
> pre-admitted close work, and ambiguity-safe inspect-before-retry recovery; and
> exposes one quiet accessible guided prospective setup, source-labelled
> independent truth sections, signed ISO-currency and through-dated missionary
> activity, zero clean-path staff actions, and one root-cause-deduplicated
> exception-first finance surface—without per-claim timing or FX overrides,
> generic `paid`/`posted` authority, implicit partial funding, capacity-created
> or discretionary deficits, double subtraction, card-statement or claimant-
> repayment inference,
> live provider/FX dependency, historical recomputation, QBO/Xero authority over
> Field Account truth, linear completion steppers, or any claim that inclusion
> proves availability, reimbursement, payment, accounting posting, or
> reconciliation.**

### Source-family authority

- Claimant-paid reimbursement defaults to `obligation_qualified`: exact
  Approved Expense Snapshot coverage, an independently established
  Reimbursement Obligation, and compatible Field Account Funding Coverage make
  the exact slice eligible for the next D1 close. Later handoff, payment, or
  accounting cannot debit it again.
- A tenant may prospectively select `external_payment_qualified` for one bounded
  certified claimant-paid family. Only exact External Payment Occurrence and
  payment-to-obligation coverage qualify the effect; attempted, ambiguous, or
  failed execution does not.
- Organization-card effects require a source-final cleared issuer charge and
  exact approved business coverage. Pending authorizations, personal portions,
  and later statement payment never qualify.
- Organization cash/debit/direct-payment effects require the exact executed
  economic-payer occurrence and approved coverage. A certified organization-
  payable family may instead use its independently source-owned present
  obligation; purchase requests, unapproved invoices, or QBO/Xero existence are
  insufficient.
- D4 taxable compensation, D16 advances and claimant repayments, D20
  Organization Support Costs, and D21 noncash realization remain exclusive
  owners. Unknown or overlapping families fail closed for affected positive
  work. AI, OCR, or matching output never establishes source finality,
  ownership, amount, approval, or an effect.

The reference to D16's Expense Settlement Determination is binding only for
claimant-reimbursable coverage governed by that determination. Organization-
card, organization cash/debit/direct-payment, and certified-payable families
root directly in the exact D10/D13 Approved Expense Snapshot item/split,
economic-payer classification, and certified source occurrence. They never
fabricate a Reimbursement Obligation or D16 settlement, and D16 activation is
not a prerequisite. The D23 Effect Basis is the common downstream seam. A
certified-payable family remains structurally absent until a separately
certified non-accounting source contract supplies both the approved coverage
and present-obligation occurrence; QBO/Xero/AP records never qualify it.

For claimant-reimbursable coverage, the core D16 settlement command is available
without activating either optional Advance or Claimant Repayment policy family.
Those activations govern only their purpose-specific branches; they cannot gate
ordinary Reimbursement Obligation or Field Account Funding Coverage creation.

### Exact coverage and currency

Exactly one winning profile is frozen on each approved item/split under its
claimant-paid or organization-paid source-root contract. Its immutable Expense Field Account
Effect Basis pins the source family/occurrence, profile, approved and source-
family-specific actual coverage, Field Account amount/currency authority,
close lineage, and correction cause. The stable semantic effect identity is instead rooted in the
stable economic occurrence and approved coverage slice; immutable evidence and
observation revisions remain in the Basis. Identity excludes observation,
adapter/import, retry/job, profile, selected Support Cycle, and mutable status so successor
profiles and later-cycle retries cannot duplicate the economic effect.

Conservation is proved separately in each currency:

```text
approved source-currency slice
= source-currency dispositions + conversion-source coverage

exact Field Account-currency target
= Expense Field Account Effect Coverage
+ organization-funded or non-Field-Account target disposition
+ exact target residual
```

All terms are checked integer minor units. Insufficient capacity never creates
`min(balance, obligation)` or reduces an independently live Reimbursement
Obligation. Partial treatment requires an exact upstream-approved partition and
typed residual. External conversion evidence preserves source/target amounts,
ISO codes, rate direction, effective instant, rounding, fees, residual, and
provenance; no current rate, staff convenience rate, or QBO/Xero home amount may
fill a gap.

Ordinary recognition, reservation, and capacity logic cannot overdraw a Field
Account or create a discretionary deficit. A mandatory source-owned adverse
correction still appends in full and may expose a visible D11 deficit; D23 must
not clip, defer, relabel, or convert that correction into a capacity-created
partial.

One immutable disposition atomically makes the applicable source-family actual
coverage derive fulfilled while creating the balanced effect, per-account
version/CAS advance, monotonic ingestion position, and identifier-only outbox
request. The original coverage stays immutable. D22 prospective reservation,
where applicable, is reclassified into source-family-specific actual coverage.
Claimant-reimbursable families use D10/D16 Field Account Funding Coverage;
organization-card, organization cash/debit/direct-payment, and certified-
payable families use D10/D13 approved coverage plus their independently
certified source-owned coverage without requiring D16 settlement or
reimbursement coverage. D23 then forms one append-only lineage with at most one
capacity-bearing state.

D23 Effect Coverage and Phase 20 accounting-source coverage are separate,
purpose-specific namespaces. Either may independently cover the same economic
source under its own authority; neither fulfills, releases, dates, gates, or
mutates the other, and Phase 20 can never post a second accounting occurrence
from the D23 operational effect.

### Correction and independent truth

Obligation-mode payment delay, failure, return, or reissue does not reverse the
Field Account effect while the Reimbursement Obligation remains. Payment-mode
return/reversal atomically appends an exact reversal of previously qualified
payment coverage and a successor capacity-bearing reservation whenever the
Reimbursement Obligation remains live; a separately cancelled obligation
creates no successor reservation. Organization-card/direct-pay refunds and
corrections append only from source-owned classifications distinguishing
cancelled expense, continuing obligation, partial refund, and amount
correction. Card-statement payment, claimant repayment,
bank match, accounting edit, provider task completion, or generic status never
creates or reverses an effect by inference.

Taxable-compensation succession is one same-currency atomic group: exact D23
reversal, source-coverage ownership transfer, and D4 replacement enter one
later permitted Support Cycle together. Until the D4 replacement qualifies,
capacity remains conserved and one cause-owned exception remains open.

Source-effective, observed, approved, obligation-effective, qualification,
effect commit, Support Cycle close/through, external-payment, Phase 20
accounting-effective, and provider-posting dates remain independently
authoritative. Closed cycles, statements, source rates, and original effects
never mutate. A first qualification observed after a prior close is a new late-
admitted occurrence in the next permitted cycle; only a change to an admitted
root is a correction.

Initial D23 adoption reconciles to D17's complete Opening Coverage Manifest and
exact source-family half-open operational boundary. Later profile replacement
uses a D11-manifested complete Support Cycle boundary, captured ingestion
cursor, and exhaustive in-flight disposition manifest. Date-only activation,
history replay, overlap, and gaps are forbidden. D22 prospective coverage must
first be atomically reclassified into the applicable source-family actual
coverage described above; D23 never qualifies directly from a prospective
request, approval, or reservation.

### Isolation, close, and experience

Canonical financial records are server-only. Complete same-scope keys prevent
cross-Tenant, Legal-Entity, Support Assignment, purpose, Field Account, and ISO-
currency references. Forced coarse RLS is a backstop; every purpose-minimized
projection and privileged command passes through the Phase 12 PDP and re-proves
current authority. Capacity-changing work uses deterministic smallest-scope
locking plus per-account CAS or bounded Serializable retry and database-enforced
semantic uniqueness. D1 close consumes pre-admitted normalized facts through a
captured cursor and never calls providers, FX services, QBO, or Xero.

Tenant setup asks one guided question—include claimant-paid reimbursements when
finance confirms the obligation (recommended), or after qualified external
payment. Organization-paid treatment is fixed explanatory behavior. Activation
previews exact scopes, first complete Support Cycle boundary/cursor, currencies,
representative effects, reservations, conflicts, and uncovered work. Clean
expenses add no action. One exception-first workspace groups cause-owned work.

The UI keeps Expense review, Support balance, Reimbursement, and staff-only
Accounting truth independent rather than using a completion stepper. A
missionary-visible effect always includes a signed ISO amount and finance-
confirmed through date and never implies worker ownership, availability,
withdrawal, reimbursement, payment, posting, or reconciliation.

D9 remains the module-publication owner, D12 the immutable statement publisher,
and D19 participant membership relationship truth only. Hidden means absent
before enumeration from detail, counts, search, export, cache, notifications,
and error copy. D5 exit and D6 currency-retirement manifests inventory every
D23 reservation, candidate, effect, correction, and unresolved slice once;
source-owned corrections continue against original scope after the boundary.
D23 never creates or reallocates an account/currency lane. Cause-owned source,
approval, payment, integrity, and accounting cases remain with their domains;
D23 owns only profile/effect/coverage/conservation failures, and task closure
never clears them.

**Phase 21 D24 precision amendment (2026-08-02).** An Expense Collaboration
Assignment or Invitation Version, Evidence Access Projection Version, Claimant
Confirmation Version, Expense Collaboration Action, helper/preparer/submitter
fact, ready-for-review state, notification, revocation, reassignment, or
lifecycle record never qualifies, dates, covers, creates, reverses, or corrects
a D23 Expense Field Account Effect. Even claimant-confirmed or submitted work
must independently reach exact D10/D13 Approved Expense Snapshot coverage and
the certified D23 source-family occurrence before effect recognition.

D24 helper identity may survive only as minimum non-authoritative provenance on
an independently qualified D23 basis when required for protected audit. It
does not change source family, economic payer, amount/currency authority,
profile, qualification date, capacity, close, or correction ownership. D24
offboarding, revocation, identity change, or evidence-access loss cannot undo a
valid effect by inference; the applicable D10/D13/source/D23 append-only
correction contract remains authoritative.

**Phase 21 D25 precision amendment (2026-08-02).** D25 cannot create, modify,
reverse, or qualify an Expense Field Account Effect or reopen a closed Support
Cycle. D23 alone appends any source- and cause-linked later-cycle delta,
reversal, Funding Coverage Disposition, or permitted ownership succession.
D25 may pin and observe that immutable result in its Downstream Impact Manifest;
case, task, notification, or accounting state cannot substitute for the D23
source proof.

## Consequences

- Tenants receive a meaningful but bounded operational timing choice without a
  generic financial-rules engine or per-claim bureaucracy.
- Source-family-specific authority prevents card-statement, payment, and
  accounting duplication while preserving legitimate claimant-paid and
  organization-paid differences.
- Exact per-currency coverage, immutable disposition lineage, database
  constraints, and source-specific corrections increase implementation rigor
  but make the Finance-confirmed balance reproducible and repairable.
- Phase 20 and QBO/Xero remain the sole accounting-delivery and final-books
  authorities. D23 produces only one PII-minimized closed operational
  occurrence for separately certified downstream use.

## Alternatives rejected

- **Always include when the organization owes the claimant.** Rejected because
  it cannot represent organization-card/direct-pay sources and removes a valid
  bounded tenant cash-style preference.
- **Always include only after external payment.** Rejected because it overstates
  capacity while obligations wait, couples Field Account truth to providers,
  and can mistake card-liability settlement for the expense.
- **Per-claim or arbitrary rules-engine choice.** Rejected because it is
  difficult to explain, test, audit, migrate, and protect from inconsistent
  treatment.
- **Use QBO/Xero or bank state as the trigger.** Rejected because accounting and
  reconciliation are downstream and cannot own Phase 21 source meaning.

## Related decisions

- [ADR-0090 — Finance-closed Field Account cycles](./0090-finance-closed-field-account-cycles.md)
- [ADR-0094 — Organization-authorized support reallocation and exit disposition](./0094-organization-authorized-support-reallocation-and-exit-disposition.md)
- [ADR-0095 — Proof-gated parallel-currency Field Accounts](./0095-proof-gated-parallel-currency-field-accounts.md)
- [ADR-0098 — Optional approved Support Plans and bounded workspace publication](./0098-optional-approved-support-plans-and-bounded-workspace-publication.md)
- [ADR-0099 — Claim-level expense truth and purpose-routed tenant AI](./0099-claim-level-expense-truth-and-purpose-routed-tenant-ai.md)
- [ADR-0100 — Layered Field Account integrity and cause-owned repair](./0100-layered-field-account-integrity-and-cause-owned-repair.md)
- [ADR-0101 — Immutable Support Cycle statements with automatic tenant publication](./0101-immutable-support-cycle-statements-with-automatic-tenant-publication.md)
- [ADR-0102 — Bounded prospective Expense Governance Profiles](./0102-bounded-prospective-expense-governance-profiles.md)
- [ADR-0104 — Artifact-always reimbursement handoff](./0104-artifact-always-reimbursement-handoff.md)
- [ADR-0105 — Purpose-separated advances and claimant repayments](./0105-purpose-separated-advances-and-claimant-repayments.md)
- [ADR-0106 — Reconciled Field Account Opening Position and operational cutover](./0106-reconciled-field-account-opening-position-and-operational-cutover.md)
- [ADR-0108 — Organization-controlled Support Assignments](./0108-organization-controlled-support-assignments-and-separated-access.md)
- [ADR-0111 — Optional exact Prospective Expense Authorization](./0111-optional-exact-prospective-expense-authorization.md)
- [Phase 20 accounting boundary](../prds/sitestacker-parity/phase-20-accounting-exports-reconciliation.md)
- [Phase 21 decision log](../prds/sitestacker-parity/phase-21-field-accounts-decision-log.md#d23--source-family-specific-expense-field-account-effect-recognition)
- [D23 research evidence](../prds/sitestacker-parity/phase-21-mission-dashboard-product-research-evidence.md#d23-decision-research--exact-expense-field-account-effect-recognition)
