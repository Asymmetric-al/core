# Platform Boundaries Delta

## ADDED Requirements

### Requirement: Phase 23 Separates Editable CMS Source From Public Site Authority

Payload and other CMS adapters SHALL remain qualified private authoring and persistence machinery.

Every clause in `openspec/contracts/platform-boundaries.md#contract-aa2aa275aa89dbc14ed1` MUST apply without exception.

#### Scenario: Payload marks a document published

- **GIVEN** a Payload document or version appears provider-published but no
  complete D1 generation has activated it
- **WHEN** the public runtime resolves the Page
- **THEN** the provider state is ignored as public authority
- **AND** `PublishedContentReader` returns only the prior active generation or
  safe absence

#### Scenario: Operational truth changes independently

- **GIVEN** a referenced source owner withdraws eligibility, changes a current
  fact or revokes use
- **WHEN** Phase 23 next prepares or serves affected output
- **THEN** it re-resolves or adversely suppresses through that owner's certified
  seam
- **AND** it never repairs the owner by mutating copied CMS data

### Requirement: Web Studio Uses One Actor And Service Operations Boundary

Every Phase 23 human mutation, private query, Preview, release, import/export, media, health, diagnostic and recovery operation SHALL cross the actor-bound Web Studio Operations boundary.

Every clause in `openspec/contracts/platform-boundaries.md#contract-85ce2a4593957015827b` MUST apply without exception.

#### Scenario: An actor saves CMS work

- **GIVEN** the server resolves current Supabase identity, Tenant, environment,
  Site, locale, resource, capability, lease generation and Source Revision
- **WHEN** the actor-bound command saves the candidate
- **THEN** only the exact authorized Working Revision may advance with a receipt
- **AND** direct provider or database mutation cannot bypass the same proof

#### Scenario: A delayed worker executes already-dispatched work

- **GIVEN** one transaction durably committed the owning state and its
  product-owned dispatch/outbox request before acknowledgement
- **WHEN** the worker executes or retries
- **THEN** it re-resolves current purpose, scope, source state and idempotency
  through the service-command port
- **AND** only post-commit execution occurs now; it neither creates a missing
  dispatch fact, impersonates a human nor gains generic service-role authority

### Requirement: D1 Is The Sole Favorable Public Activation And Read Boundary

D1 SHALL deterministically compile one complete exact Tenant × environment × Site × locale dependency closure into an immutable Public Site Generation and compare-and-swap one expected serving head only after complete proof.

Every clause in `openspec/contracts/platform-boundaries.md#contract-ddf83c01d624f6dd3733` MUST apply without exception.

#### Scenario: One complete generation activates

- **GIVEN** every exact source, route, renderer, media, safety and compatibility
  dependency passes and the serving head is unchanged
- **WHEN** D1 commits activation
- **THEN** one immutable generation becomes the public read target
- **AND** no visitor can observe a mixed dependency state

#### Scenario: Downstream convergence lags

- **GIVEN** D1 has activated but a cache, search index, crawler or external
  provider has not yet observed the successor
- **WHEN** status is derived or public safety narrows
- **THEN** activation and downstream states remain distinct and current adverse
  admission prevents unsafe favorable output
- **AND** provider acceptance is never presented as worldwide convergence

### Requirement: Phase 23 Integrations Use Small Certified Owner Contracts

Every dynamic source, Primary Outcome, notification, authenticated action, operational reference, media-custody operation, public-media qualification, Phase 22 specialized Page, giving handoff and future product interaction SHALL use the smallest versioned certified projection or command contract published by its owning domain.

Every clause in `openspec/contracts/platform-boundaries.md#contract-720abc9691559ec7a9bb` MUST apply without exception.

#### Scenario: A future dynamic source is not certified

- **GIVEN** a collection or provider contains records but its owning phase has
  not published the required exact public projection
- **WHEN** staff configure a Content list
- **THEN** the source is unavailable with a truthful setup dependency
- **AND** Phase 23 does not query raw operational tables or copy records

#### Scenario: A certified owner reports an adverse change

- **GIVEN** one referenced form destination, media asset, Page subject or public
  item is currently withdrawn by its owner
- **WHEN** Web Studio prepares or serves dependent behavior
- **THEN** it suppresses or blocks through the certified owner semantics
- **AND** it leaves owner records untouched and recovery with the owner

### Requirement: Exact Public Audience Excludes Authentication And Personalization

All ordinary Phase 23 public artifacts and requests SHALL use exactly the code-owned `public` audience.

Every clause in `openspec/contracts/platform-boundaries.md#contract-94ce65f656557c122ad1` MUST apply without exception.

#### Scenario: A logged-in donor and anonymous visitor open one Page

- **GIVEN** both requests resolve the same public scope
- **WHEN** Phase 5 renders through `PublishedContentReader`
- **THEN** normalized public output is identical
- **AND** neither private-app data nor an auth-varying cache branch appears

#### Scenario: A client requests an unknown audience

- **GIVEN** a public request or artifact contains missing, null, conditional or
  client-selected audience data
- **WHEN** the public boundary validates it
- **THEN** it fails closed without public content
- **AND** no default or personalized fallback widens visibility

### Requirement: Provider Admission And Clean Cutover Preserve One Authority

Production adoption SHALL require a complete provider-neutral D33 capacity profile with one exact Vercel qualification attachment and one current coherent Payload v4 cohort admitted under D34.

Every clause in `openspec/contracts/platform-boundaries.md#contract-79dc3ad38a05be4a3c93` MUST apply without exception.

#### Scenario: One provider cohort is admitted

- **GIVEN** current official Payload and Vercel evidence satisfies all access,
  migration, capacity, backup, recovery and public-boundary proof
- **WHEN** release owners freeze the implementation cohort
- **THEN** one exact coherent version set and attachment become the qualified
  provider implementation
- **AND** floating versions, mixed channels and provider defaults cannot widen
  product behavior

#### Scenario: Clean cutover evidence is incomplete

- **GIVEN** census has an unresolved item, the target is customer-relied-upon,
  or a legacy path remains reachable
- **WHEN** one-authority cutover is considered
- **THEN** activation blocks or destructive work stops for a new decision
- **AND** no partial switch or false Live claim is permitted
