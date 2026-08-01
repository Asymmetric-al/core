# ADR-0049: Tenant-owned, capability-certified Xero Carrier Plans

**Status:** Accepted (founder ruling, Phase 20 grill session — D8)

> Working record:
> `docs/prds/sitestacker-parity/phase-20-accounting-exports-reconciliation-decision-log.md`

## Context

Xero provides no universal nonprofit fund field. Accounts affect the general
ledger, Tracking Categories provide at most two active segment dimensions,
Items and Contacts have product/service and counterparty meaning, Projects is a
separate contact-linked product, and Manual Journals cannot use bank or other
reserved Accounts. Xero's Profit and Loss API also has a hard 200-column limit
for requested Tracking combinations, while the public Accounting API cannot
reconcile bank-statement lines.

Missions organizations legitimately arrange their Xero books differently. A
Tracking-only mandate would commandeer scarce tenant-owned dimensions and fail
at many-fund scale. An unrestricted field and rules builder would make
semantically different Xero objects interchangeable, hide reporting loss, and
create accounting configurations that cannot be certified or supported.

## Decision

For each Xero Accounting Destination, Asym uses one immutable, prospective,
tenant-owned **Xero Carrier Plan**. The plan defines the supported carrier
kinds, exact D5 recipe positions, role-collision rules, visibility, and
capability proof. D6 owns each exact semantic-role or
Reporting-Target-to-provider-object binding instance; the Xero Carrier Plan
validates and pins or digests the compatible D6 binding set. The plan consumes
D4 Canonical Accounting Effects and D6 Accounting Reporting Targets; it cannot
establish accounting policy, remap source Designations, choose posting grain
or transaction recipes, or declare provider delivery or reconciliation.

The ordinary setup offers four guided arrangements:

- Tracking-led when an existing or explicitly provisioned category has
  certified capacity and recipe support;
- Account-led when the tenant's accountant-designed chart genuinely carries
  the reporting meaning;
- Combined when Accounts and up to two Tracking Categories carry distinct,
  non-overlapping roles; and
- Xero-summary/Asym-detail when Xero receives a balanced authorized summary and
  exact Designation detail remains in immutable Asym evidence.

`Advanced accounting setup` is a fixed, recipe-specific semantic-role matrix,
not a provider DSL. It defines and validates the permitted coordinate for each
D6 binding: Tenant, Legal Entity, destination, Xero organization and
environment, plan version, Accounting Reporting Target, canonical account
role, D5 source-purpose recipe, provider entity, exact field position, stable
Xero object identity, expected properties, and declared visibility. This full
coordinate prevents one nominal "fund account" from silently replacing income,
fee, refund, expense, clearing, payable, or bank meaning.

Accounts remain genuine GL classifications. Tracking Categories and Options
remain bounded reporting dimensions. A summary Contact or non-inventory Item
may support a provider-native recipe only for its genuine meaning; neither is a
general fund carrier. Xero Projects is unavailable as a general carrier and
may appear only after one exact D5 recipe separately proves its accounting
linkage, scope, relationships, currency behavior, write/readback, effect
equivalence, and reporting. Manual Journal remains the exceptional
accountant-adjustment recipe and never becomes a carrier or failure fallback.

Each plan exposes a derived **Xero Tracking Budget**: active and archived
category and option counts, current role usage, the provider's recommended
option envelope, and exact one- and two-category report-column projections.
The approximately 100-option guidance is a warning, not an invented hard
limit. The 200-column Profit and Loss limit blocks only a plan that promises
the impossible affected report; valid split-report or Asym-detail arrangements
remain tenant-confirmable.

Every plan declares **Xero Reporting Visibility** for each relevant semantic
role and operation family: full income and expense, revenue-only,
expense-only, transaction-wide, Tracking-limited, separately certified
Project-specific, split across reports, or Asym-only. Full visibility requires
production-shaped proof across the claimed income, expense, fee, refund,
correction, and cash representations.

Activation requires a time-bounded **Xero Capability Certificate** for the
exact organization and destination. It records organization and currency
identity, granular scope and role sufficiency, provider tier and limits,
Accounts and tax compatibility, active and archived Tracking inventory,
report-column projections, exact recipe and field-position support, stable
provider references, evidence/readback tier, and provider-contract version.
Activation and release preflight reread material capabilities and references.

Asym blocks only objective impossibility, inequivalence, coverage failure,
role collision, invalid provider references, unsupported positions, missing
required capability, cross-boundary mismatch, prohibited data exposure, or
undeclared material detail loss. Valid but unconventional arrangements,
approaching capacity, large object growth, partial or split reporting, and
bank-matching consequences use one explicit tenant confirmation rather than
mandatory approval bureaucracy.

Exactly one plan version is active prospectively for a scope and interval.
Activation is compare-and-swap. Historical and in-flight releases remain
pinned. Delete-and-recreate never inherits identity. A nontrivial Account or
Tracking rename is possible semantic drift, so only affected future work
receives one `Confirm same meaning` or rebind action; other semantic or
capability drift requires a prospective successor.

Direct execution inherits D2's durable operation identity,
lookup-before-retry, outcome-unknown quarantine, exact object readback, and
evidence-always contract. Xero's short idempotency cache does not prove
exactly-once delivery. Object readback is not automatically journal or ledger
proof, and baseline operation cannot depend on optional Journals access.
Product copy may say `Recorded in Xero`, `Verified against the Xero record`, or
`Ready to reconcile in Xero`; it never claims completed Xero bank
reconciliation from an API write, matching total, provider field, or Asym
settlement reconciliation.

The staff experience is one recommendation-first, exception-first
**Accounting → Posting profile → Xero setup** workspace. It asks how the tenant
already tracks funds, shows available Tracking capacity in plain language,
reveals only unresolved roles, uses live searchable compatible provider
selectors, states exactly what appears in Xero versus Asym, renders one
production-shaped unsent preview, and offers one prospective
`Review and activate` action. Healthy plans remain quiet.

## Consequences

- Tenant freedom is preserved inside genuine Xero semantics and the tenant's
  accountant-confirmed policy.
- Existing books are not silently restructured, and provider objects are not
  created as an activation side effect.
- Many-fund tenants retain a truthful summary path without losing exact source
  evidence.
- Reporting limitations are visible before activation and cannot be mistaken
  for source, delivery, or reconciliation truth.
- Xero-specific behavior remains behind a certified provider contract while
  plan lifecycle, evidence, and isolation reuse provider-neutral D2-D6
  foundations.
- Provider drift blocks only affected future work and never rewrites historical
  accounting evidence.
- The platform deliberately does not provide arbitrary carrier rules, generic
  Project-led funds, Manual Journal fallback, donor Contact synchronization,
  automatic category or chart restructuring, or false bank-reconciliation
  claims.
