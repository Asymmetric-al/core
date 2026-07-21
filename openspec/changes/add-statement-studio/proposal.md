# Add Canonical Document Production

## Why

Asym needs one governed facts-to-artifact system for official receipts,
acknowledgments, statements, and other generated documents. The current
repository paths are pre-production prototypes with conflicting authority:
mutable template roots, Unlayer/native switching, browser-supplied production
facts, hard-coded receipt email, placeholder receipt rows, live text downloads,
on-demand rerendering, and provider-oriented artifact assumptions.

Conrad confirmed that there are no production users or irreplaceable historical
documents. Preserving those paths would create split-brain behavior and technical
debt rather than protect customers. Phase 18 therefore establishes the clean
canonical contract now and removes every prototype runtime behind an explicit
pre-production environment/data gate.

## What Changes

- Establish one **Document Studio** with **Templates**, **Documents**, and
  **Batches** for official/tax, governed-business, and general/custom purposes.
- Separate immutable Document Definition Publication, source-owned Facts
  Package, idempotent Generation Request, optional source-authorized Issuance
  with Phase 18-owned code-governed identity mechanics, exact Artifact,
  subordinate Render Attempts, and external Phase 17 Delivery.
- Use one structured visual authoring model, versioned Document Purpose
  Contracts, tenant-extensible Approved Data Views, synthetic proof, immutable
  publication, and bounded future appointments.
- Select at most one production renderer through a pre-registered evidence
  contest. Produce one accessible canonical PDF, adding archival conformance to
  that same PDF where the purpose requires it.
- Add code-owned U.S. and opt-in Canadian jurisdiction packs, purpose-specific
  identity/serial/signer/correction rules, and qualified release gates.
- Preserve exact immutable bytes in private custody, authorize every access,
  and use the scanner-resistant Phase 17 protected-action handoff for eligible
  guests.
- Add proof-gated whole-publication resolution before request freeze, exact-pin
  retry after freeze, item-authoritative batches, purpose-owned records
  schedules, monotonic holds, and verified disposal.
- Remove the prototype receipt/statement/PDF runtime directly after the
  environment-gated destructive pre-production assertion passes. Ship no
  importer, legacy compatibility runtime, shadow migration, or fabricated
  history.

## Capability Deltas

- New durable capability: `document-production`.
- Modified intent: `platform-boundaries` and `platform-surfaces` define the
  source-fact, delivery, surface-role, and one-document boundaries.
- Phase 17 protected-action transport needs the ADR-0037 selector-plus-fragment
  verifier amendment before protected document delivery can launch.

## Dependencies

- Phase 7 supplies immutable official facts, eligibility, legal donor, exact
  issuer/recipient/coverage facts, whether and why issuance is required,
  issuance validity, and correction/void/cancel/replace authorization and effect.
- Phase 10 and Phase 12 supply restricted-identity projections and capabilities.
- Phase 13 supplies posted ledger and value truth.
- Phase 17 supplies governed message preparation, communication history,
  provider delivery, and the protected-action presentation seam.
- Phase 19 supplies statement population, cutoff, and run orchestration.

## Out Of Scope

- Product implementation, schema migration, or dispatch in this planning PR.
- A tax/legal rules DSL, arbitrary CRM query language, workflow engine, general
  file manager, records-management suite, PKI console, renderer selector, or
  release calendar.
- Foreign-template conversion, legacy import, cross-tenant transfer, historical
  backfill, or continued prototype compatibility.
- Choosing a renderer before the D3 evidence contest produces exactly one
  qualified winner.
- Claiming comprehensive tax compliance, CRA certification, or legal advice.

## Release Posture

This change defines intended behavior; it does not dispatch implementation and
must not receive `ready-for-agent`. Production is blocked by the renderer,
legal/finance/records/security, accessibility/archive, tenant-isolation,
exact-byte, load/restore, and destructive-cutover proofs in the capability spec.
