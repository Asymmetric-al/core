# ADR-0110: Source-mode-honest Noncash Support Realization

**Status:** Accepted (founder ruling, Phase 21 grill session — D21)

## Context

Mission organizations may receive stock, cryptocurrency, vehicles, real estate,
or other property preferred toward a ministry purpose. The original asset is a
noncash charitable Contribution. Its gift date, legal donor, accepted purpose,
description, valuation evidence, receipt treatment, and fundraising credit must
remain source-owned even if the organization later sells the property.

Field Accounts, however, are monetary operational projections. Crediting a
Field Account from the original gift's FMV, appraisal, broker estimate, or
recognized value would assert cash that may never exist and would conflate gift,
liquidation, support, and accounting truth. Creating a second cash gift when the
asset is sold would duplicate donor, receipt, campaign, and supporter truth.
Ignoring realized proceeds entirely would force finance staff into opaque manual
adjustments and break the exact source-to-balance story.

Source arrangements also differ materially. A tenant may hold and sell an asset;
a provider may act as its agent; an intermediary or DAF sponsor may instead be
the legal donee and later send the tenant a cash grant. Providers may expose
gross, cost, and net detail or only exact net proceeds. Partial sales,
installments, pooled lots, corporate actions, late costs, corrections, retained
property, mixed currencies, and purpose succession make a mutable `sale amount`
unsafe.

## Decision

> **C-prime-amended-and-hardened (C-prime-R) — one immutable,
> source-mode-honest Noncash Support Realization bridge preserving the original
> noncash Contribution, legal-donor, accepted-purpose, gift-date, valuation,
> receipt, supporter, and source-owned disposition truth without creating
> monetary Field Account support; admitting only exact source-final proceeds
> through capability-certified Tenant-, Legal-Entity-, source-role-, asset-lot-,
> purpose-, and currency-scoped contracts; freezing non-overlapping quantity and
> minor-unit proceeds coverage, exact finality evidence, one zero-setup
> net-realized default or prospective proof-gated organization-absorbed
> exact-cost treatment, deterministic line allocation and residuals, D6-owned
> external conversion evidence, source and policy versions, semantic
> idempotency, and append-only correction lineage; creating exactly one
> D11-balanced Field Account occurrence only through D2's CAS-guarded Support
> Cycle admission, with D3 assessment applied only to the resulting Realized
> Support Basis, D5 owning valid purpose succession, D17 owning pre-cutover
> coverage, D19 owning participant access, Phase 15 owning source facts, and
> Phase 20 alone owning separately certified accounting delivery; supporting
> partial, pooled, installment, and terminal nonmonetary dispositions only with
> exact source coverage; and presenting one conditional, accessible,
> exception-first staff lifecycle plus one quiet grouped missionary story —
> without valuation-as-cash, a second gift, duplicate donor/supporter/fundraising
> credit, mutable sale truth, fuzzy lot allocation, inferred costs or settlement,
> per-gift truth toggles, double-applied costs, implicit FX, silent redesignation,
> asset custody/trading, gain/loss accounting, QBO/Xero authority, or any
> available, payable, payroll-ready, or paid claim.**

### Authority chain

- Phase 13 owns the original Contribution, donor, accepted purpose, gift date,
  asset identity/description, valuation, recognition, and receipt-facing truth.
- Phase 15 owns the canonical append-only asset-lot, disposition, proceeds,
  finality, source evidence, and correction projection.
- D21 owns only an immutable derivative realization manifest and the resulting
  closed Field Account occurrence.
- D21 freezes the `Realized Support Basis`; D2 owns source-readiness admission,
  creates the exact resulting Gross Support Allocation, and covers it through a
  CAS-guarded Support Cycle; D3 assesses only that Gross Support Allocation. D5
  owns valid purpose succession; D6 owns exact externally supplied conversion
  evidence; D11 owns balance and control-account integrity; D17 owns pre-cutover
  coverage; and D19 owns participant access.
- Phase 20 alone may later certify one non-overlapping accounting source. QBO or
  Xero remains authoritative for asset derecognition, gain/loss, cash, fees,
  periods, posting, and final reconciliation.

### Source-mode and evidence rules

A tenant-held asset or a provider acting as the tenant's agent may qualify only
when exact lot-to-proceeds lineage and the contract's finality evidence exist.
When an intermediary or DAF sponsor is the legal donee and sends the tenant a
cash grant, the tenant records that ordinary cash/grant source; D21 does not
pretend that the tenant owned the underlying asset. Donated services and
retained, consumed, donated-onward, abandoned, or worthless property yield no
positive realization.

Each versioned source contract pins its Tenant, Legal Entity, source role/legal
recipient, provider organization/environment, source family and operations,
asset-lot identity and quantity precision, purpose and currency, finality and
correction events, completeness watermark, adapter/schema version, evidence
shape, and certification expiry. Exact-net-only providers may support the
default mode without invented gross proceeds or zero fees.

### Manifest and close rules

The immutable manifest freezes original Contribution and purpose identities;
lot, disposition, and evidence versions; exact quantities; dates; currency;
gross/cost/net or net-only facts; treatment; `Realized Support Basis`; line
allocation and residuals; D6 evidence; coverage ranges; source and policy
versions; correction lineage; semantic idempotency key; digest; and cursor.

Positive admission requires exact quantity and minor-unit conservation,
non-overlap with other tranches and D17 opening coverage, one deterministic
purpose disposition, complete source finality, and fresh authorization. It
creates one D11-balanced occurrence only within D2's close transaction. A
duplicate is a no-op. A changed, late, corrected, or adverse source fact appends
a successor or exact delta; it never mutates a manifest. Ambiguous positive work
is contained at the smallest scope while adverse-correction continuity remains
available.

### Cost and assessment rules

`net_realized` is the no-setup default. A tenant may prospectively activate
`organization_absorbs_exact_costs` only when a certified source proves exact
gross, exact eligible costs, and exact net. This choice is source-contract and
policy-version scoped, not a per-gift override or formula builder. It cannot
duplicate D20 Organization Support Cost or Phase 20 D19 processor-cost truth.

D3 applies only to the Gross Support Allocation that D2 derives exactly from
the manifest's `Realized Support Basis`. The original asset valuation,
appraisal, recognized value, provider estimate, sale price, brokerage cost, and
liquidation cost are never separately assessable Field Account amounts.

### Experience rules

The feature is absent for tenants without relevant certified source activity.
Relevant staff work from existing Contribution detail and the quiet,
exception-first finance workspace. One source-labelled timeline relates the
original gift, disposition tranches, realization, Support Cycle close, and
corrections without displaying two gifts. The clean path is automatic; a single
contextual action appears only for missing evidence or an actual exception.

Missionaries may see one tenant-authorized grouped lifecycle and only
finance-closed support effects. Donors continue to see the original noncash gift
and its receipt truth. No surface calls an appraisal or proceeds `available`,
`withdrawable`, `payable`, `payroll-ready`, `paid`, or `posted to accounting`.

## Consequences

- Field Account money cannot be fabricated from valuation.
- Donor and fundraising truth is never duplicated by a later sale.
- Partial and corrected dispositions remain traceable and conserving.
- The common exact-net path requires no tenant configuration.
- Advanced cost treatment is flexible but proof-gated and prospective.
- Phase 21 gains no custody, trading, appraisal, FX, accounting, payroll,
  payment, or GL authority.
- The implementation must carry exact source role, lot, quantity, purpose,
  currency, evidence, coverage, and correction lineage, increasing schema and
  test rigor in exchange for avoiding silent financial corruption.

## Alternatives rejected

- **Keep every noncash gift outside Field Accounts.** Safe but operationally
  incomplete after exact proceeds exist; it forces unexplained manual balance
  adjustments.
- **Credit the asset's value immediately.** Rejected because valuation is not
  cash and may differ materially from proceeds.
- **Create a cash gift when sold.** Rejected because it duplicates the original
  Contribution and corrupts donor, receipt, campaign, and supporter truth.
- **Use one mutable sale amount or staff-entered estimate.** Rejected because it
  cannot safely represent partial sales, costs, corrections, or source finality.
- **Post both the disposition and Field Account effect to accounting.** Rejected
  because it double-posts one economic event; Phase 20 must later certify one
  non-overlapping source if accounting delivery is approved.

## Related decisions

- [ADR-0060 — Processor-cost attribution policy](./0060-processor-cost-attribution-policy.md)
- [ADR-0091 — Rail-qualified Support Cycle admission](./0091-rail-qualified-support-cycle-admission.md)
- [ADR-0092 — Bounded prospective Administrative Assessment Profiles](./0092-bounded-prospective-administrative-assessment-profiles.md)
- [ADR-0094 — Organization-authorized support reallocation and exit disposition](./0094-organization-authorized-support-reallocation-and-exit-disposition.md)
- [ADR-0095 — Proof-gated parallel-currency Field Accounts](./0095-proof-gated-parallel-currency-field-accounts.md)
- [ADR-0100 — Layered Field Account integrity and cause-owned repair](./0100-layered-field-account-integrity-and-cause-owned-repair.md)
- [ADR-0106 — Reconciled Field Account opening position and operational cutover](./0106-reconciled-field-account-opening-position-and-operational-cutover.md)
- [ADR-0108 — Organization-controlled Support Assignments with separated access](./0108-organization-controlled-support-assignments-and-separated-access.md)
- [ADR-0109 — Source-authoritative Organization Support Cost Applications](./0109-source-authoritative-organization-support-cost-applications.md)
- [Phase 13 Contribution and noncash-gift authority](../prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md)
- [Phase 15 noncash intake and disposition authority](../prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md)
- [Phase 20 immutable Accounting Release and posting-ownership authority](../prds/sitestacker-parity/phase-20-accounting-exports-reconciliation.md)
- [Phase 21 decision log](../prds/sitestacker-parity/phase-21-field-accounts-decision-log.md#d21--source-mode-honest-noncash-support-realization)
- [D21 research evidence](../prds/sitestacker-parity/phase-21-mission-dashboard-product-research-evidence.md#d21-decision-research---noncash-support-realization)
