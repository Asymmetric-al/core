# ADR-0035: Structured document authoring and Approved Data Views

**Status:** Accepted (founder rulings, Phase 18 grill session — D1, D5, D6)

> Full record:
> `docs/prds/sitestacker-parity/phase-18-receipt-pdf-template-system.md`
> (ratified decisions D1, D5, and D6).

## Context

Tenants need broad visual and data freedom, including eligible custom CRM fields,
without giving templates arbitrary record traversal, formulas, executable code,
or control over legal and money truth. Raw HTML, renderer source, unconstrained
JSON, and live queries would make accessibility, batch parity, privacy,
publication proof, and renderer replacement brittle.

## Decision

Use one versioned, Asym-owned structured visual document as the canonical
authoring source. The editor is flow-first and page-aware. It exposes a bounded
catalog of semantic blocks, reusable layout roles, safe styling and prose,
purpose-protected truth regions, and an equivalent outline/non-drag editing
path. Raw HTML/CSS/JavaScript, SQL, expressions, provider source, arbitrary
network/file access, and tenant plugins are not authoritative inputs.

Drafts use soft single-writer presence hints plus server-enforced
compare-and-swap conflict handling. Presence never grants authority or
hard-locks the draft, and stale presence expires safely.
Commit freezes one immutable candidate and proof package. Publish advances one
head only after required synthetic, semantic, visual, accessibility, archival,
dependency, permission, and purpose checks pass. Published graphs are immutable;
restoration creates a new draft and reruns current proof.

Every published template binds one versioned **Document Purpose Contract** and
one immutable **Approved Data View**. The source domain resolves only referenced,
authorized information into one typed, frozen **Facts Package** before rendering.
The renderer cannot query CRM state or widen the package.

Phase 11 owns field identity, type, classification, egress eligibility,
recipient binding, lifecycle, and synthetic samples. An authorized tenant data
administrator may make policy-eligible native or tenant custom fields
**Available in documents**. That choice can only narrow existing policy. It
cannot expose care, security, restricted-identity, payment-secret, or otherwise
forbidden information.

Related information is available only through finite, source-owned semantic
roles and bounded ordered collections with explicit cardinality, null,
withheld, empty, and overflow behavior. Optional tenant content may use only
small sentence-shaped predicates over non-protected fields. Templates cannot
filter, sort, join, group, aggregate, calculate money or dates, select
recipients, traverse relationships, or conditionally suppress protected truth.

Preview and publication proof use source-owned synthetic fixtures only. A real
record is exercised only through the ordinary authorized generation path and
never becomes editor state, sample content, or preview cache data. Single,
scheduled, API, and batch generation compile the same publication and facts
contracts with identical semantics.

Portability uses one versioned Asym-native semantic-template package, not a
foreign-format converter or tenant-data migration system. The package carries
only the canonical semantic template material permitted by its package version,
its exact package digest, canonical schema version and digest, and a closed
manifest of dependency identities and digests. It carries no secret, credential,
real donor or CRM data, generated artifact, issuance, review, authorization,
publication, current-head, delivery, or operational state.

Import first verifies the package and every recognized dependency, then produces
an exact compatibility and loss report. The destination tenant owns the result
as a quarantined draft and must resolve every blocking or lossy binding, use its
own authorized fields/assets/contracts, and complete ordinary proof, review, and
publication. Source publication or approval never transfers and import never
auto-publishes. Cross-tenant import is possible only through an authorized
destination command; package contents or source-tenant authority cannot choose
or authorize the destination. Unknown package versions and foreign formats fail
closed without best-effort conversion.

## Consequences

- Tenants receive broad safe composition, branding, data placement, locale,
  table, image, header/footer, and reusable-section freedom without a query or
  programming product.
- The editor presents one searchable **Add → Information** picker with human
  labels, realistic fake samples, policy-safe search results, and in-context
  field management. Existence-sensitive fields remain structurally absent.
- Protected truth cannot be hidden, restyled into invisibility, contradicted,
  or replaced. Findings identify the exact block, consequence, owner, and
  permanent repair.
- Publication pins stable semantic identifiers rather than labels or database
  paths. Label changes are harmless; meaning, type, privacy, role, or schema
  changes require explicit compatibility proof and a new publication.
- Phase 18 ships the one narrow Asym-native package boundary above. It ships no
  foreign-template converter, prototype/legacy data importer, direct tenant-to-
  tenant database copy, authority transfer, or auto-publishing import path.
