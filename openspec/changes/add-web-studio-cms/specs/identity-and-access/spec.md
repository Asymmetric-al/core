# Identity And Access Delta

## ADDED Requirements

### Requirement: Web Studio Human Identity And Scope Resolve Through Supabase And Phase 12

Every authenticated Phase 23 human operation SHALL validate the current
Supabase Auth session and derive the Principal, actual actor, active Tenant
assignment, Tenant, environment, deliberately selected Site and exact BCP-47
locale server-side. Phase 12 SHALL resolve the exact purpose, action capability,
resource scope, governance epoch and required assurance. Clients, JWT metadata,
role strings, provider accounts, URLs, object keys, version IDs, relationships,
public display and prior access SHALL grant nothing.

`Payload Principal Link` SHALL be immutable attribution only. It SHALL NOT
create a Payload login, account, password, role, session, permission or fallback
identity. Site and locale switching SHALL be explicit, visible and non-
defaulting. A context change SHALL clear or re-prove volatile selections and
SHALL not silently carry a draft, action, count, object or permission into the
new scope.

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

Phase 23 SHALL define distinct capabilities for ordinary Page/Article creation
and editing, placement, Navigation, shared content, Preview, release,
scheduling, Site design, Library organization, Topics, shared views, Trash and
permanent deletion, locale creation, Copy to Site, form definition/routing,
Media contribution/management/safety/Site use/disposition, search/share
configuration, export, import check, import commit, Content Health inspection,
owner recovery, diagnostics and production activation. A capability SHALL grant
only its named action and exact scope.

Authorship, lock ownership, Page visibility, folder membership, Topic
assignment, view ownership, task assignment, operations-row visibility, public
reach, Site access, staff role or access to a related screen SHALL NOT imply
another capability. Every mutation and sensitive private read SHALL reauthorize
at execution. Permission-filtered absence SHALL be non-enumerating; a user
without a capability SHALL not receive revealing counts, identities, labels,
lock-holder data, evidence or disabled owner actions.

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

An Active Editor Lease SHALL identify one actor and editing session but SHALL
not itself grant read, write, restore, takeover or release authority. Every
renewal and mutation SHALL require current Phase 12 authorization, exact
resource scope, current Lease Generation and expected Source Revision. Same-
user tabs SHALL be separate sessions. Visible active sessions MAY renew while
the actor is actively reading or editing; hidden, suspended, crashed or
abandoned sessions SHALL stop renewal and cannot preserve authority
indefinitely.

Another session SHALL see only the current acknowledged draft, bounded holder
identity and last activity when independently authorized. **Take over editing**
SHALL require a separate current capability and SHALL checkpoint and transfer a
new generation atomically. The displaced session SHALL become read-only and
retain only tab-local compare/copy recovery. Session refresh SHALL preserve
acknowledged work but SHALL re-prove current lease, revision and permission
before another write.

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

The ordinary public Site SHALL use Phase 12's exact `public` projection context
and SHALL not require or vary by an authenticated session. Private Page Preview
and Whole-Site Preview SHALL require current exact Page or Site-wide Preview
authority on every route and asset request; candidate IDs, cookies, iframe
contexts and signed URLs SHALL not be bearer authority.

Private export artifacts, import plans, Media originals/quarantine/evidence,
Saved Library Views, Content Health details, version comparisons, lock-holder
identity and Trash/Purge evidence SHALL each require current purpose-specific
read/action capability and exact Tenant/resource scope before enumeration,
count, signed retrieval or diagnostic composition. Every export download SHALL
reauthorize and record a receipt. Public media delivery SHALL use only D1-
qualified immutable public routes and SHALL not expose private storage grants.

Engine Diagnostics SHALL require a current active incident, fresh AAL2,
separately granted diagnostic capability, exact least-disclosure scope and a
ledger record created before the read. Access SHALL default to 15 minutes,
never exceed 60 minutes, revoke immediately, return redacted read-only evidence
and grant no repair authority.

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

Every non-interactive Phase 23 worker, scheduler, compiler follow-up, search
indexer, form delivery executor, media processor, reconciliation scan and
recovery action SHALL execute through an explicitly registered code-owned
service command. The registration SHALL bind one purpose, allowed resource
families, exact scope derivation, bounded input, required source/expected state,
idempotency, retry and expiry behavior. A generic service account, database
role, provider credential, queue identity or `BYPASSRLS` SHALL NOT substitute
for product authorization.

Service commands SHALL carry opaque identifiers only where an owner decision
requires delayed work, reload authoritative state at execution, and refuse
stale, superseded, revoked or wrong-scope work. A service command SHALL not call
another owner's private writer, broaden record discovery, expose human-only
data or mint human authority.

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
