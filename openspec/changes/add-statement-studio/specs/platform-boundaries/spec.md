# Delta for Platform Boundaries

## ADDED Requirements

### Requirement: Source Domains Own Truth And Document Production Owns Artifacts

Source domains MUST own legal donor, eligibility, posted money, valuation,
recipient meaning, contribution and statement population facts, whether and why
official issuance/document identity is required, exact issuer/recipient/coverage
facts, issuance validity, and correction/void/cancel/replace authorization and
effect. Document Production MUST consume one immutable purpose-scoped Facts
Package and MUST own structured definitions, immutable publications, generation
orchestration, exact artifacts, artifact access, document-specific records
evidence, and the D9/D11 code-owned identity mechanics: `ACK-*`, exact-issuer
`ca_r_v1` allocation, reuse/nonreuse, disposition, and artifact linkage.

Templates and renderers MUST NOT query source tables, choose a donor, decide
jurisdiction, calculate official amounts, allocate a legal number, select a
statement population, or alter source lifecycle truth.

Only the tenant- and actor-scoped Generated Document service MAY allocate a
Phase 18 reference or serial, and only after the request is admitted and its
purpose, facts, publication, authorization, and safety generations are frozen.
The service MUST NOT treat mechanical allocation or disposition as authority to
change source-owned issuance validity or correction effect.

#### Scenario: An official acknowledgment is requested

- GIVEN the source domain has authorized one immutable acknowledgment Facts
  Package and any required issuance/document-identity intent
- WHEN Document Production admits the request
- THEN it pins that package under the compatible purpose publication and, only
  after admission/freeze, allocates any required code-owned reference or serial
  through the Generated Document service before identifier-bearing render
- AND it performs no independent query or calculation of donor, money, tax,
  coverage, issuance validity, or correction effect

#### Scenario: A template or renderer attempts to allocate an identifier

- WHEN a template, renderer, client, staff action, or source-domain command tries
  to choose, reserve, reuse, or disposition an `ACK-*` reference or `ca_r_v1`
  serial outside the admitted Generated Document service
- THEN the operation is rejected without allocating or changing an identifier
- AND source-owned issuance validity and correction state remain unchanged

#### Scenario: Required source truth is incomplete

- WHEN an official purpose lacks a required source-owned fact or has ambiguous
  legal-recipient or coverage authority
- THEN the affected request fails closed with a source-owned reason and repair
  action
- AND the template, renderer, staff user, and fallback resolver cannot invent or
  substitute the missing fact

### Requirement: Delivery And Document Issuance Remain Independent

Phase 17 MUST own governed message content, communication history, consent,
provider submission, provider outcomes, and protected-action presentation.
Document Production MUST own exact artifact identity, authorization, retrieval,
current/replaced/cancelled state, and artifact evidence. A send, bounce, open,
link preflight, grant redemption, byte response, or download MUST NOT create or
alter document issuance.

#### Scenario: A document email bounces

- GIVEN one exact issued artifact exists
- WHEN its Phase 17 delivery bounces and staff resend it
- THEN Phase 17 appends delivery evidence against the same artifact reference
- AND Document Production does not rerender, renumber, replace, or change the
  artifact's issuance state

#### Scenario: A delivery template falls back

- WHEN Phase 17 selects a compatible delivery-message publication before message
  preparation
- THEN the message still references the same exact Phase 18 artifact
- AND delivery fallback cannot select a different document publication or bytes

### Requirement: Generated Artifacts Remain Separate From General Files

Document Production MUST own generated artifacts, their immutable lineage,
purpose-specific custody, access, and disposal evidence. A general file or CMS
system MAY store approved presentation assets or unrelated tenant files, but
MUST NOT become the official-artifact archive, issuance authority, or recipient
authorization boundary.

#### Scenario: Staff upload a PDF to general files

- WHEN staff upload a PDF through the general file manager
- THEN that file does not become an issued receipt, acknowledgment, statement,
  current artifact, or correction
- AND no official reference, serial, delivery, or donor access is inferred

#### Scenario: Document Production consumes an approved asset

- WHEN a publication uses an authorized Brand Kit or CMS asset
- THEN the publication pins an immutable render-safe asset dependency
- AND the asset system cannot supply donor, contribution, issuance, or legal
  truth

### Requirement: All Surfaces Cross One Generated Document Service

Admin, donor, missionary, API, batch, scheduled-publication, correction, and
delivery-handoff routes MUST remain thin adapters over one tenant- and actor-
scoped Generated Document service. Direct database, Storage, renderer, or
provider access MUST NOT bypass its authorization and invariants.

#### Scenario: UI and API submit the same request

- GIVEN UI and API callers submit the same authorized semantic operation identity
  and identical frozen inputs
- WHEN both calls race
- THEN one Generation Request and at most one canonical artifact result
- AND both callers observe the same product state

#### Scenario: A client calls a retired prototype path

- WHEN any client attempts browser-supplied official facts, mutable root content,
  direct Unlayer/native rendering, live text receipt/statement generation, or
  provider-URL artifact access
- THEN no official request, issuance, artifact, or delivery is created
- AND the executable path is absent after the gated cutover
