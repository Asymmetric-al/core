# Platform Boundaries Delta

## ADDED Requirements

### Requirement: Phase 23 Separates Editable CMS Source From Public Site Authority

Payload and other CMS adapters SHALL remain qualified private authoring and
persistence machinery. They MAY persist exact source revisions, working drafts,
versions, folders and provider metadata only behind Phase 23 commands. They
SHALL NOT define human identity, capability, Site/locale scope, route,
Navigation, public audience, public eligibility, public release, operational
truth, recovery, or current serving.

Phase 23 SHALL own ordinary Page/Article identity, exact-locale editorial and
placement revisions, bounded semantic composition, Site Plan generation and
serving activation. Phase 10 and every source owner SHALL retain safety,
operational, financial, specialized Page, byte-custody, communication,
authenticated-app and provider outcome authority. A CMS publish flag, Payload
draft state, provider job, object presence or search record SHALL NOT constitute
a public release.

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

Every Phase 23 human mutation, private query, Preview, release, import/export,
media, health, diagnostic and recovery operation SHALL cross the actor-bound Web
Studio Operations boundary. Every non-interactive operation SHALL cross a
separately registered service-command port with one code-owned purpose and
narrower exact scope. Feature modules SHALL expose typed commands and permission-
safe queries behind that boundary; the facade SHALL NOT become a god service.

Browser, Payload Admin/auth/REST/GraphQL/Local API, plugin, hook, worker,
migration, importer, service-role script or database trigger SHALL NOT write
Phase 23 truth or bypass current authorization, expected state, idempotency,
receipt and owner proof. Provider diagnostics and raw provider consoles SHALL
not become product contracts or recovery paths.

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

D1 SHALL deterministically compile one complete exact Tenant × environment ×
Site × locale dependency closure into an immutable Public Site Generation and
compare-and-swap one expected serving head only after complete proof. A failed,
stale, partial, incompatible or outcome-unknown candidate SHALL NOT replace the
prior safe generation. Public code SHALL read only through
`PublishedContentReader`; no other public reader, fallback, mutable-latest query
or request-time compiler SHALL exist.

Search, cache, sitemap, CDN, crawler/social observation, notification, provider
delivery and analytics SHALL be downstream convergence. Their acceptance or
completion SHALL NOT define D1 activation. Current adverse eligibility SHALL be
enforced before favorable cached or indexed output and SHALL not wait for
asynchronous cleanup.

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

Every dynamic source, Primary Outcome, notification, authenticated action,
operational reference, media-custody operation, public-media qualification,
Phase 22 specialized Page, giving handoff and future product interaction SHALL
use the smallest versioned certified projection or command contract published
by its owning domain. Phase 23 SHALL store stable typed references or immutable
public projections rather than copying owner truth or accepting provider-shaped
payloads.

An absent, uncertified, stale, incompatible, restricted or unauthorized owner
contract SHALL remain unavailable or existence-safe. Phase 23 SHALL NOT invent a
generic fallback record, broaden a query, call a provider directly, or expose a
placeholder action. Certified-but-unready work MAY expose only the owning
domain's native action to an independently authorized actor.

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

All ordinary Phase 23 public artifacts and requests SHALL use exactly the
code-owned `public` audience. At the same verified host, Site, locale, active
generation and route, authentication, role, cookies, campaign parameters,
referrer, geography, device, experiment and history SHALL NOT alter CMS output.
Public compiler and Presentation Package boundaries SHALL structurally exclude
auth and personalization context. Cache identity SHALL contain every legitimate
byte-varying trusted dimension and tags SHALL be invalidation hints only.

Authenticated tasks SHALL be owned and authorized by their application after a
clear public handoff. Preview SHALL be private and authorized separately; it
SHALL not be an audience or bearer authority.

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

Production adoption SHALL require a complete provider-neutral D33 capacity
profile with one exact Vercel qualification attachment and one current coherent
Payload v4 cohort admitted under D34. Current official evidence at
implementation and release freeze SHALL control provider versions. Provider
settings and features SHALL not become product policy.

D35 SHALL perform a read-only census, clean empty-database target build,
deterministic supported retained-state transformation where proved, one bounded
authority switch and complete removal of legacy or temporary readers, writers,
routes, flags, adapters and transforms. Dual authority, mutable public fallback,
permanent multiversion abstraction and destructive production/customer cutover
without a new decision SHALL be prohibited.

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
