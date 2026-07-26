# ADR-0045: Typed Posting Intents and canonical Accounting Effects

**Status:** Accepted (founder ruling, Phase 20 grill session — D4)

> Working record:
> `docs/prds/sitestacker-parity/phase-20-accounting-exports-reconciliation-decision-log.md`

## Context

Phase 20 must preserve nonprofit accounting meaning while supporting
provider-native delivery to QuickBooks Online and Xero. A release containing
only business intent would allow each adapter to invent accounting treatment.
A release containing only debit-and-credit lines would obscure why the work
exists, weaken source coverage, and make corrections difficult to explain.
Making QBO or Xero objects authoritative would couple accounting truth to
provider-specific capabilities, defaults, and mutable external state.

Nonprofit accounting also distinguishes concepts that are easy to collapse
incorrectly: contribution versus exchange activity, conditional versus
unconditional support, donor restriction versus internal designation, and
natural versus functional expense. Asym must enforce exact mechanics and
evidence without representing itself as the tenant's general ledger or making
a blanket GAAP-compliance claim.

## Decision

Every immutable, source-covered **Accounting Release** combines one typed
**Accounting Posting Intent** with one exact, provider-neutral, balanced
**Canonical Accounting Effect**. They are inseparable views of one authority,
not separate mutable records or workflows.

The Posting Intent freezes the economic purpose, Legal Entity, source
authority and revisions, date basis, currency facts, source eligibility,
semantic accounting-policy version, and correction lineage. A versioned policy
confirmed by an authorized tenant accountant or finance authority
deterministically derives the Canonical Accounting Effect. The effect freezes
exact debit-and-credit lines, canonical account roles, bounded semantic
dimensions, safe descriptions, and source allocation.

A separate immutable Source Coverage Manifest proves that each relevant source
amount is represented exactly once or explicitly excluded under the frozen
policy. Exact balance, intent-specific conservation, explicit currency scale,
deterministic serialization, and source coverage are release invariants.
Unexplained suspense, penny plugs, silent rounding, hidden provider defaults,
and silent dimension loss are prohibited.

Provider adapters compile the Canonical Accounting Effect into a versioned
acyclic graph of QBO- or Xero-native operations. Each operation claims a
precise non-overlapping portion of the effect, including every automatic
control-account, tax, clearing, currency, linking, or rounding consequence.
The complete graph must preserve the effect exactly. Provider object type,
account identifiers, credentials, delivery state, and reconciliation state do
not enter the canonical effect.

Provider acceptance requires exact-object readback. Evidence distinguishes
compilation equivalence, object-semantic equivalence, provider-ledger-effect
verification when authoritative evidence is available, settlement
reconciliation, drift, and indeterminate outcomes. A request body, HTTP
success, or matching grand total is not sufficient proof.

Before release, stale source, policy, or mapping evidence blocks release and
staff correct the owning authority. After release, corrections create linked
compensating or replacement intent; they never edit the original release.

Staff review one progressive surface: **What happened**, **How it will be
recorded**, and **QuickBooks/Xero preview**. Clean, proved rows auto-pass and
exceptions are grouped by cause. The provider preview is derivative and is
always identified as unsent until delivery evidence exists.

## Consequences

- Source domains retain legal and economic truth; tenant accounting policy
  owns interpretation; provider adapters compile but do not decide accounting.
- The system can use provider-native objects without allowing provider
  differences to change the required accounting result.
- Historical releases remain reproducible because source, policy, builder,
  mapping, profile, compiler, and adapter versions are pinned at their
  respective boundaries.
- Summarized postings remain auditable through the separate Source Coverage
  Manifest.
- Ordinary releases do not require repeated accountant approval once their
  policy version is confirmed.
- Asym does not become a shadow general ledger, arbitrary journal editor,
  accounting-rule language, net-asset accounting engine, consolidation
  system, or bidirectional provider editor.
