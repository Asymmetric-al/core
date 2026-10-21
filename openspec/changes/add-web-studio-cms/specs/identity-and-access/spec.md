# Identity And Access Delta

## ADDED Requirements

### Requirement: Web Studio Human Identity And Scope Resolve Through Supabase And Phase 12

Every authenticated Phase 23 human operation SHALL validate the current Supabase Auth session and derive the Principal, actual actor, active Tenant assignment, Tenant, environment, deliberately selected Site and exact BCP-47 locale server-side.

Every clause in `openspec/contracts/identity-and-access.md#contract-6558a9766821b15e85c1` MUST apply without exception.

#### Scenario: Staff open an authorized Site and locale

- **GIVEN** one valid Supabase Principal has an active Tenant assignment and
  Phase 12 grants the exact Web Studio read capability
- **WHEN** the server opens the deliberately selected Site/locale workspace
- **THEN** it returns only the minimum authorized exact-scope projection
- **AND** Payload identity or client-selected scope cannot add access

#### Scenario: Staff switch Site or locale

- **GIVEN** an actor has volatile search, selection, Preview or editor context
  in one scope
- **WHEN** they deliberately switch Site or locale
- **THEN** the platform re-resolves current authorization and resets or
  explicitly transitions volatile context
- **AND** it does not default, leak counts or carry authority from the former
  scope

### Requirement: Web Studio Capabilities Are Action-Specific And Independently Revocable

Phase 23 SHALL define distinct action-specific and independently revocable capabilities for its complete authoring, governance, media, recovery, and activation surface.

Every clause in `openspec/contracts/identity-and-access.md#contract-0230fbf26897d5fa3d4f` MUST apply without exception.

#### Scenario: An editor lacks release authority

- **GIVEN** an actor may edit and Preview one Page but lacks its release
  capability
- **WHEN** they save an acknowledged successor or inspect the Page
- **THEN** editing and authorized Preview remain available
- **AND** publication is unavailable or denied without implying broader Site
  release access

#### Scenario: A shared-view manager lacks content access

- **GIVEN** an actor may manage one Site-shared Saved Library View but cannot
  read some records matched by its definition
- **WHEN** they apply or edit the view
- **THEN** current record authorization filters before count and result shaping
- **AND** view authority neither reveals nor grants inaccessible content

#### Scenario: A capability is revoked while work is queued

- **GIVEN** a human or registered service operation was prepared before a
  capability, membership, safety or governance change
- **WHEN** the command reaches execution
- **THEN** current authorization is re-proved and the now-forbidden effect is
  denied
- **AND** prior preparation, lock, task or receipt cannot preserve former
  authority

### Requirement: Active Editor Leases Coordinate Sessions Without Granting Authority

An Active Editor Lease SHALL identify one actor and editing session but SHALL not itself grant read, write, restore, takeover or release authority.

Every clause in `openspec/contracts/identity-and-access.md#contract-4de2fad90478b128abfe` MUST apply without exception.

#### Scenario: One editor's lease expires

- **GIVEN** an editor tab is hidden, suspended, crashed or inactive beyond the
  qualified lease bound
- **WHEN** another authorized session acquires or takes over editing
- **THEN** a new Lease Generation fences every subsequent mutation
- **AND** the old session cannot write even if it later resumes with its stale
  token

#### Scenario: Permission changes while the editor remains open

- **GIVEN** the active session still holds a lease but the actor loses Page,
  Site, locale, membership, lifecycle or Phase 10 authority
- **WHEN** the next renewal, save, Preview or release action runs
- **THEN** the action stops immediately with the owning authorization cause
- **AND** the lease is not treated as permission or the denial as a generic
  login problem

### Requirement: Public Preview Export Media And Diagnostics Have Separate Access Contracts

The ordinary public Site SHALL use Phase 12's exact `public` projection context and SHALL not require or vary by an authenticated session.

Every clause in `openspec/contracts/identity-and-access.md#contract-fec38d5afad9f23ce175` MUST apply without exception.

#### Scenario: A private Preview link is copied

- **GIVEN** another actor receives a candidate URL but lacks current exact
  Preview authority
- **WHEN** they request HTML, RSC/data, asset or route output
- **THEN** the server denies it without revealing candidate existence or
  content
- **AND** URL possession does not grant or preserve access

#### Scenario: An export download is revoked

- **GIVEN** an export artifact exists but the actor, scope or artifact access
  has expired or been revoked
- **WHEN** the download endpoint is requested
- **THEN** current authorization denies retrieval non-enumerating
- **AND** no prior signed URL or preparation receipt bypasses the denial

#### Scenario: Diagnostics access is requested without complete proof

- **GIVEN** the actor lacks an active incident, fresh AAL2, exact scope,
  capability or ledger-before-read record
- **WHEN** Engine Diagnostics is opened
- **THEN** no diagnostic rows, counts, labels or provider evidence are returned
- **AND** no diagnostic or provider surface offers a mutation fallback

### Requirement: Registered Service Commands Are Narrower Than Human Authority

Every non-interactive Phase 23 worker, scheduler, compiler follow-up, search indexer, form delivery executor, media processor, reconciliation scan and recovery action SHALL execute through an explicitly registered code-owned service command.

Every clause in `openspec/contracts/identity-and-access.md#contract-aec45f7f27fdb2adfe52` MUST apply without exception.

#### Scenario: A scheduled command executes after revocation

- **GIVEN** a valid appointment was dispatched before its actor, Page, Site or
  source eligibility was revoked
- **WHEN** the registered due command reloads current state
- **THEN** it refuses the favorable D1 effect and records a typed owner outcome
- **AND** the worker credential cannot override current product authority

#### Scenario: An unregistered worker attempts a mutation

- **GIVEN** a hook, script, queue consumer or provider callback has database or
  API connectivity but no admitted service-command registration
- **WHEN** it attempts to create or change Phase 23 truth
- **THEN** application and structural controls deny the mutation
- **AND** no service-role or provider capability becomes a hidden alternate
  command path
