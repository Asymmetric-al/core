# ADR-0044: Canonical Legal Entity financial boundary

**Status:** Accepted (founder ruling, Phase 20 grill session — D3)

> Working record:
> `docs/prds/sitestacker-parity/phase-20-accounting-exports-reconciliation-decision-log.md`

## Context

The product historically treated Tenant as the payment and settlement boundary,
while receipt, payment-provider, and accounting work also need an exact legal
organization. Supporting several legal organizations inside one Tenant by
adding unrelated issuer, merchant, settlement, and accounting-company
identifiers would permit contradictory ownership and could silently reroute
financial work when a default or provider connection changes.

Most tenants have only one legal organization and should not pay a UX or
operational cost for multi-entity capability. At the same time, a disconnected
accounting provider must not block valid donations or receipt issuance, and
historical financial identity must survive processor and accounting-system
migrations.

## Decision

One canonical **Legal Entity** is the enduring legal and financial identity
beneath Tenant. Legal Issuer, merchant, settlement owner, receipt issuer, and
accounting owner are roles or profiles of that identity, not competing
identities.

Every independently authoritative financial root freezes an explicit Legal
Entity. A tenant default may prefill new setup, but it is never a persistence or
runtime fallback. Single-entity tenants see no selector or extra workflow.
Phase 7 creates the canonical root and immutable Legal Issuer Profile Versions;
Phase 13 creates Settlement Account Bindings and pins source financial roots;
Phases 15 and 16 consume the same identity. Phase 20 owns accounting
destinations, releases, and proof-gated multi-entity accounting activation—not
a retrofit of historical source roots.

Donation, receipt, settlement, and accounting-delivery readiness are separate
capabilities. Provider bindings are normalized and effective-dated:
Settlement Account Bindings associate processor accounts with Legal Entities;
Accounting Destinations identify stable provider-native sets of books; and
replaceable Provider Authorizations grant access without redefining destination
identity.

Mixed-entity financial roots, overlapping production destinations, automatic
cross-entity failover, silent cart splitting, dual production writes, and
historical reassignment are prohibited. An editable cart may present
separately disclosed entity-specific payment groups, but each group requires
explicit donor confirmation and becomes a separate contribution/provider
command. Provider reconnect may only restore the same stable organization;
changing organizations is an explicit atomic destination succession that
preserves prior releases.

Tenant remains the outer RLS and data boundary. Entity-scoped finance
permissions may only subtract access inside that Tenant. Organizations that
require true donor, staff, missionary, or operational isolation use separate
Tenants.

## Consequences

- The one-entity path and multi-entity path use the same explicit authority
  model without burdening routine staff work.
- Phase 7 Legal Entity is the canonical identity; Legal Issuer is an immutable
  profile/version of it, never a second identity.
- Every upstream money writer and downstream document, statement, settlement,
  expense, accounting, and provider workflow must carry exact entity authority
  before second-entity activation is allowed.
- Processor and accounting migrations preserve historical ownership through
  effective-dated bindings rather than rewriting facts.
- Asym does not provide consolidated books, intercompany accounting, or
  automatic cross-entity operations.
