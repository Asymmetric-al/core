# ADR-0046: Bounded provider-native Posting Profiles

**Status:** Accepted (founder ruling, Phase 20 grill session — D5)

> Working record:
> `docs/prds/sitestacker-parity/phase-20-accounting-exports-reconciliation-decision-log.md`

## Context

QuickBooks Online and Xero represent the same accounting effect through
different native objects, constraints, links, plan capabilities, dimensions,
and cash/accrual reporting behavior. A universal journal approach cannot
correctly represent bank, receivable, payable, refund, and settlement
workflows. An unrestricted tenant recipe builder would create a second
accounting language, make provider upgrades brittle, and allow apparently
balanced configurations that silently duplicate, omit, or misclassify money.

Nonprofit finance teams nevertheless need meaningful control over how much
detail reaches their accounting system. High-volume many-fund missions usually
need compact fund-summary posting, while some offline deposits or smaller
organizations need gift or allocation detail. That choice must not weaken
source traceability or change the accounting meaning ratified in D4.

## Decision

Each Legal Entity and Accounting Destination has one active, prospective,
versioned **Posting Profile bundle**. Staff select goal-led outcomes and one of
three posting grains: gift detail, gift-and-fund detail, or fund summary.
Asym owns, certifies, and versions the bounded QBO/Xero-native recipes that
implement those choices.

The Posting Profile is separate from semantic accounting policy, provider
mappings, and each immutable Provider Delivery Plan. It may control provider
representation and detail but may not change source facts, accounting
recognition, dates, currency meaning, restrictions, the Canonical Accounting
Effect, or reconciliation truth.

The bundle contains source-purpose recipes for online settlements, offline
Deposit Groups, approved paid expenses, genuine payables, corrections derived
from their original recipes, and exceptional accountant adjustments. Source
facts determine cash versus payable and refund versus credit-note behavior.
Journal entries are an explicit exceptional recipe and never a fallback.

Every grain retains the same gift-level Source Coverage Manifest. Fund summary
is the default for online processor payouts; supported detail remains available
when provider capability and projected volume fit the certified safety
envelope. Donor-contact synchronization is not part of D5.

Exactly one system may own posting for a processor account and effective
source interval. Profile activation checks for known overlap and requires an
authorized-finance confirmation that another connector is disabled or
non-overlapping.

Activation verifies provider identity, capability, account and dimension
validity, tax and currency dispositions, closed-period compatibility,
projected volume, source coverage, and effect-equivalent compilation. A
dimension is provider-required, intentionally summarized with evidence
retained in Asym, or incompatible. It is never silently dropped.

Profile changes create a draft next version and activate prospectively.
Existing releases, in-flight operations, and frozen Delivery Plans retain
their original version. Routine releases do not require repeated approval.
Unsafe adapters may be stopped without silently changing recipe or delivery
lane.

Staff use one progressive bookkeeper-first surface: choose the outcome, choose
provider detail, resolve only missing setup, review a production-shaped unsent
preview, and activate. Healthy work remains quiet; exceptions are grouped by
cause, count, amount, and next action.

## Consequences

- Tenants receive real control over accounting-system detail without owning an
  integration language or provider-object graph.
- QBO and Xero remain provider-native while the Canonical Accounting Effect
  stays authoritative and provider-neutral.
- High-volume tenants avoid provider and reporting degradation through a
  fund-summary default and production-shaped volume preview.
- Provider capability and metadata drift creates explicit attention and a
  prospective repair path rather than silent remapping.
- Direct posting cannot overlap another connector for the same source
  interval.
- Supporting a new provider behavior requires a certified recipe and
  conformance fixtures, not tenant-specific branching.
- Asym does not provide profile inheritance, per-fund recipes, arbitrary
  formulas, raw payload editing, donor-contact synchronization, silent
  journal fallback, or per-release profile approval.
