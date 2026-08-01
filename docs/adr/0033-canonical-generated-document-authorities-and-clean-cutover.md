# ADR-0033: Canonical generated-document authorities and clean cutover

**Status:** Accepted (founder rulings, Phase 18 grill session — D1, D2, D17)

> Full record:
> `docs/prds/sitestacker-parity/phase-18-receipt-pdf-template-system.md`
> (ratified decisions D1, D2, and D17).

## Context

The repository contains prototype PDF-template, receipt-snapshot, placeholder
receipt, hard-coded receipt-email, live text receipt, live text statement, and
on-demand rerender paths. They preserve different evidence and none is a safe
reason to keep several document authorities. Conrad confirmed that this is a
pre-production, all-new build with no production users or irreplaceable receipt
history. Preserving compatibility would therefore manufacture technical debt
rather than protect customers.

At the same time, a generated document cannot collapse its source facts,
production work, official issuance, immutable bytes, and delivery evidence into
one status row. Those facts have different owners and failure behavior.

## Decision

Build one canonical **Document Studio** and one bounded generated-document
module with three proportional purpose lanes: official/tax, governed business,
and general/custom. All lanes share one authoring, publication, generation,
artifact, batch, timeline, access, and repair kernel. A lane changes which
purpose-owned controls apply; it does not create another product.

Preserve five durable logical authorities:

1. **Document Definition Publication** — an immutable, complete executable
   publication graph;
2. **Facts Package** — immutable typed facts assembled and authorized by the
   source domain;
3. **Generation Request** — one tenant-scoped idempotent orchestration record
   that freezes the purpose, facts, publication, locale, output profile,
   authorization, and safety generations;
4. **Issuance authorization/validity** — optional source-owned requirement,
   issuer/recipient/coverage, lifecycle authorization, and correction effect,
   linked to the Phase 18 D9/D11 code-owned reference/serial allocation and
   disposition mechanics; and
5. **Artifact** — exact immutable PDF bytes plus integrity, storage, validation,
   retention, and lineage evidence.

Render attempts are append-only subordinate evidence beneath one Generation
Request. Phase 17 delivery is an external linked authority. A retry, provider
callback, download, print, or resend never creates a new logical document,
issuance, or artifact.

The staff product has exactly three primary destinations: **Templates**,
**Documents**, and **Batches**. **Needs attention** is a saved view and count,
not another subsystem. Donors and missionaries see one authorized logical
document and one current PDF action. Architectural nouns and attempt details
remain in permissioned technical details.

Replace every prototype path directly. The cutover is destructive only after a
server-authoritative environment and data assertion proves that the target is
pre-production and contains no real tenant, irreplaceable artifact, or external
dependency. If that assertion fails, the operation stops and the migration
question is re-groomed. It never guesses, backfills, fabricates, or silently
deletes production history.

There is no legacy runtime, dual read/write, compatibility adapter, importer,
shadow migration, migration console, or fallback route after cutover. Existing
`pdf_*` names may be retained only where their final semantics satisfy this
decision; names do not preserve prototype contracts.

## Consequences

- Source domains remain authoritative for facts, eligibility, money, legal
  donor, whether and why issuance/document identity is required, exact issuer/
  recipient/coverage facts, issuance validity, and correction/void/cancel/
  replace authorization and effect. Phase 18 owns only the code-governed
  document-identity mechanics in D9/D11, including `ACK-*`, the exact-issuer
  Canadian `ca_r_v1` allocator, nonreuse/disposition, and artifact linkage; it
  cannot invent issuance authority or source truth.
- Phase 19 owns statement population and run orchestration. Phase 17 owns
  communication delivery. Phase 29 does not absorb official-artifact authority.
- Same-scope composite constraints, immutable pins, semantic idempotency,
  fenced attempts, atomic promotion, and one-current-head invariants become
  release requirements.
- Future changes evolve the canonical contracts additively. They do not add
  speculative migration fields or a second document path.
- CI and repository inventories must prove that no prototype writer, live
  renderer, mutable production root, browser-supplied official context,
  provider-URL artifact authority, or direct receipt-send path remains
  reachable.
