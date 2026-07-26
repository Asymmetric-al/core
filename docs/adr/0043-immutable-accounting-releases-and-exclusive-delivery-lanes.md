# ADR-0043: Immutable accounting releases and exclusive delivery lanes

**Status:** Accepted (founder ruling, Phase 20 grill session — D2)

> Working record:
> `docs/prds/sitestacker-parity/phase-20-accounting-exports-reconciliation-decision-log.md`

## Context

Phase 20 must support direct QuickBooks Online and Xero delivery without
allowing either provider to redefine upstream gift, expense, payout, or bank
evidence. QBO/Xero nevertheless remain authoritative for the provider records
they accept and for the tenant's books, period close, and final reconciliation.
Their APIs have materially different posting models, limits, token lifecycles,
notification behavior, and idempotency guarantees. A timeout can occur after a
provider commits a write, and a provider can later edit, void, or delete an
accepted record.

A downloadable file is valuable for audit and vendor exit, but treating that
file as a second delivery path alongside direct API writes creates a duplicate-
posting footgun. A single `exported` or `synced` flag would also hide partial
acceptance, uncertain outcomes, provider drift, and the difference between
delivery and reconciliation.

## Decision

Phase 20 freezes one balanced **Accounting Release** before delivery. Every
release always retains one immutable, machine-verifiable **Accounting Evidence
Artifact**. The artifact proves the release's accounting intent and lineage; it
does not need to be importable by the destination provider.

Each release uses exactly one delivery lane: direct provider API delivery or a
staff-mediated provider import artifact. The lanes are mutually exclusive and
derive from the same release. QBO and Xero delivery remain provider-native and
are bound by an immutable, versioned Provider Delivery Plan.

Accounting Release, Accounting Evidence Artifact, Delivery Operation, External
Provider Record, and Reconciliation Verdict are separate durable authorities.
Provider acceptance never implies reconciliation.

Delivery is operation-granular. A response that may have committed but lacks
proof becomes **Outcome unknown**. Asym quarantines that operation and reads
provider state before retrying; it never blindly retries the whole release.
Exact-object readback, provider notifications, and bounded polling can later
derive drift without rewriting historical evidence.

QuickBooks Online and Xero have independent readiness gates and failure
containment. QuickBooks Desktop and IIF are out of scope.

## Consequences

- Accounting intent remains auditable and portable even when a connector is
  unavailable or later replaced.
- Staff cannot accidentally deliver the same release through both API and
  manual-import paths.
- Partial success and ambiguous outcomes are recoverable without duplicate
  journal entries.
- Provider adapters may use the posting shape native to each destination rather
  than a lowest-common-denominator write model.
- Storage, APIs, reporting, and UX must not collapse release, delivery,
  provider, or reconciliation truth into one status.
- Direct connectors require explicit OAuth, throttling, readback, drift,
  tenant-isolation, and kill-switch testing before production activation.
