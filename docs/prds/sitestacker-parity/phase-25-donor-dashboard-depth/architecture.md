# Phase 25 architecture decision — Owner-governed donor self-service

**Status:** founder-ratified direction; recorded in the active `add-donor-dashboard-depth` proposal. This is a feature-scoped decision record, not a reserved canonical platform ADR number. It follows the [ADR series convention](../../../adr/README.md). Current merged owner boundaries remain the governing baseline; the exact proposed amendments are enumerated in [Shared S04](contracts/shared.md#s04--exact-owner-amendment-and-predecessor-reconciliation-register).

**Source:** [AL-1563](https://github.com/Asymmetric-al/core/issues/1563), the [ratification chronology](decision-log.md), [final assembly clarifications](research/phase25-implementation-clarifications.md) and [OpenSpec design](../../../../openspec/changes/add-donor-dashboard-depth/design.md).

## Context

The portal combines identity, financial records, recurring commitments, payment credentials, documents, communication choices and ministry reading. Those facts have different subjects, lifecycles and authoritative owners. The existing source contains partial journeys and obsolete assumptions. Treating a convenient UI model or provider response as a common authority would create incorrect permissions, money, receipt and recovery behavior.

## Decision

- The donor application composes the existing shared API, Auth, database and UI boundaries. Asym Postgres remains CRM and financial authority. Published content remains source-owned. No second ledger, identity broker, authorization engine, notification platform or dashboard builder is introduced.
- Each read and command carries its exact current Tenant, human, authorized subject, resource, purpose and source basis. Authentication, representation, legal donor identity, financial authorization, document access and personal communication preferences remain distinct facts.
- The authoritative owner records command acceptance and certifies its outcome. Acceptance may mean applying; it does not by itself prove successful secondary effects. Idempotency, independently successful children, known no-effect and indeterminate outcomes remain distinct. Reads and redisplay do not initiate financial, document or communication effects.
- The portal adopts the exact owner amendments in S04. Producer implementation and proof precede consumer activation. Existing incompatible routes and alternate writers are retired as part of that adoption; hiding controls is insufficient.
- Core's shared `base-maia`, Base UI, Figtree and Zinc semantics govern presentation. ReUI informs actual grids. TanStack products retain separate responsibilities and require a compatible qualified package set; they do not become authorization or monetary authorities.
- Rare pledges, employer matches, DAF awareness and IRA records use relevance-qualified presentation and their source-specific meanings. Known absence produces no ordinary UI artifacts. Explicit-route failure is still truthful. Financial history and permitted document access survive corrections and containment according to their owners.
- Verification reuses the confirmed Playwright journey, Vitest public-owner, real restricted-role PostgreSQL and nonproduction provider/artifact seams. Structural planning validation does not replace runtime qualification. G01 remains a specific unresolved native Auth activation gate.

## Consequences and alternatives

This keeps the donor journey coherent without inventing common state for facts that have different owners. It requires explicit producer adoption, current-scope invalidation, relational integrity and recoverable commands before the corresponding UI ships. The exact behavior, thresholds, transitions and tests live in the normative contracts and acceptance register rather than being duplicated here.

The ratified alternatives and reasoning remain in the source records. A generic dashboard, unified consent flag, provider-controlled default, all-purpose financial total, common receipt meaning or new Auth broker would contradict the accepted scope. This record does not reopen those decisions or convert a proposed predecessor into merged authority.

## Validation and lifecycle

The [source trace](traceability.md) connects decisions to contracts, stories and proof obligations. The [OpenSpec tasks](../../../../openspec/changes/add-donor-dashboard-depth/tasks.md) remain unchecked until their outcomes are demonstrated. Documentation rollback is a revert of this planning change. Future implementation rollback must preserve accepted effects and history, following S07 and the relevant owner contract. Any future platform-wide ADR promotion must allocate the then-current next available number and preserve these source links.
