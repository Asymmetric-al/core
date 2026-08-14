# Identity And Access Delta

## ADDED Requirements

### Requirement: Public Ministry Actions Resolve Current Exact Scope Server-Side

Every authenticated Phase 22 operation SHALL derive the current Principal and
active tenant assignment server-side, then authorize the exact Tenant, Legal
Entity, environment, Site, Page, locale, subject, assignment, action,
capability, purpose, resource version, and governance epoch needed by that
operation. Client claims, JWT metadata lists, names, households, employment,
public display, Page subject ownership, cached decisions, or relationship
inference SHALL NOT grant authority.

#### Scenario: An actor opens an authorized Page

- **WHEN** the server resolves an active contributor assignment for the exact
  Page and action
- **THEN** it returns only the minimum authorized Page projection
- **AND** any optional support, measurement, review, settings, or adoption data
  requires its own grant

#### Scenario: Scope changes while a form is open

- **WHEN** an assignment, tenant role, capability, safety rule, or governance
  epoch changes before save
- **THEN** the command re-resolves current authorization and rejects stale scope
- **AND** preserved private work does not preserve the former permission

### Requirement: Ministry Participation And Separately Owned Grants Are Independent And Revocable

Phase 9's organization-owned Ministry Assignment and Participant Membership MAY
associate several separately authenticated people with one ministry subject but
SHALL grant no Phase 22 or financial action. D1 Display Participants and Public
Page Contributor Assignments, notification choices, Phase 21's optional exact
Support Binding, and Phase 12 Support Workspace projection grants SHALL be
distinct prospective facts under their own authorities. A Page grant SHALL NOT
expose gifts or balances; a support grant SHALL NOT create Page or public-
display rights. Each fact SHALL be independently revocable with immediate
enforcement on the next request. Every support read or mutation SHALL resolve
the validated Principal, Active Tenant Assignment, Tenant, Legal Entity, exact
Support Assignment, purpose, projection, target, field set, history floor,
capability, and current authorization/governance epoch at the server boundary;
raw Data API or RLS visibility, JWT metadata, browser-selected scope, service
credentials, table ownership, and `BYPASSRLS` SHALL NOT substitute for that
decision. Rebinding a Ministry Assignment to another Support Assignment SHALL
NOT transfer or resurrect grants, participants, fields, history, or
notifications.

#### Scenario: A spouse receives Page and support access

- **WHEN** authorized staff deliberately grant both rights and the applicable
  Phase 12 purpose/field scope
- **THEN** the spouse may use the exact Page and exact enabled support modules
- **AND** the audit attributes every action and read to the spouse's identity

#### Scenario: A teammate is associated only

- **WHEN** staff record ministry participation without Page or support grants
- **THEN** the teammate may appear only where independently authorized
- **AND** Page editing, gifts, balances, supporter identity, and notifications
  remain inaccessible

#### Scenario: Revocation races queued work

- **WHEN** a grant is revoked after work was queued but before its effect
- **THEN** the worker re-proves current authorization and refuses the effect
- **AND** realtime invalidation is only a refresh hint, never authorization

#### Scenario: A Ministry Assignment is rebound

- **WHEN** staff bind an existing Ministry Assignment to a different eligible
  Support Assignment
- **THEN** every support projection remains denied until its owning authority
  deliberately grants the new exact scope
- **AND** no former participant, field, history floor, or notification setting
  follows the association automatically

### Requirement: Public Preview And Supporter Engagement Require Current Audience Authority

Exact-version Page preview SHALL require current authenticated Page action
authority on every request and SHALL never use bearer-link authority. Ministry
Update responses SHALL require current authenticated access to the exact
supporter release projection. Public Page reach, possession of a URL, prior
access, an acknowledgement record, or a comment SHALL NOT grant either access.

#### Scenario: A preview link is copied

- **WHEN** another actor opens an exact preview route
- **THEN** the server independently resolves their current exact Page permission
- **AND** denies access without revealing content when that permission is absent

#### Scenario: Supporter access ends

- **WHEN** an actor loses the purpose-authorized supporter projection
- **THEN** the next Update response read or write is denied
- **AND** their historical response does not preserve access

### Requirement: Review Staff Editing Settings Operations And Adoption Use Separate Capabilities

Phase 22 SHALL define distinct action capabilities for Page contribution, staff
content editing, candidate review, release, preview, operations inspection,
source-owner repair, settings read/change, measurement reporting, and D21 public
surface activation. A capability SHALL grant only its named action and exact
scope. Task assignment, operations-row visibility, content authorship, staff
role, or access to a related screen SHALL NOT imply another capability.
Operations-projection read, protected-evidence inspection, shared-task
management, and each owner-domain action SHALL be separate current
capabilities. Settings-summary read, protected history or consequence read, and
each owner-domain setting change SHALL likewise be authorized independently
before rows, counts, labels, timing, previews, or cached values are composed.
Permission-filtered absence SHALL NOT be replaced by a revealing disabled
control.

#### Scenario: A staff editor lacks review authority

- **WHEN** the editor creates a staff-attributed successor revision
- **THEN** they may submit it through D4
- **AND** they cannot approve or release it solely because they edited it

#### Scenario: A reviewer lacks adoption authority

- **WHEN** the reviewer can approve Page content but attempts a D21 cutover
- **THEN** the activation command is denied
- **AND** the prepared adoption generation remains non-authoritative

#### Scenario: An operations viewer sees a cause

- **WHEN** the viewer may see bounded impact but lacks the source owner's repair
  capability
- **THEN** the surface provides status and the responsible owner
- **AND** it does not expose or enable the protected repair action

#### Scenario: A linked task assignee lacks owner authority

- **WHEN** a Principal may manage a collaboration task linked to an operations
  cause but lacks the source owner's exact repair capability
- **THEN** the owner action is denied before mutation
- **AND** assigning or closing the task neither authorizes nor resolves the
  source cause

#### Scenario: A settings reader lacks protected change access

- **WHEN** a Principal may read one permission-safe setting summary but lacks
  protected-history, consequence, or change authority
- **THEN** the workspace returns only the authorized summary and responsible
  owner
- **AND** it omits protected history, consequence detail, counts, and revealing
  disabled actions

### Requirement: Phase 22 Uses RLS And The Server Boundary As Defense In Depth

Private Phase 22 tables SHALL use forced tenant-aware RLS, structurally complete
same-scope foreign keys, explicit Data API grants, and server-only mutation
paths. Complex Page assignment, purpose, field, history-floor, candidate,
release, and action policy SHALL be evaluated by the server policy boundary;
RLS SHALL provide coarse structural containment and SHALL NOT depend on
recursive relationship queries, mutable user metadata, or large JWT grant
lists. Service-role access SHALL remain private and SHALL NOT bypass domain
authorization in application commands.

#### Scenario: A browser queries a private table

- **WHEN** an authenticated client attempts direct access to revisions,
  assignments, responses, occurrences, manifests, or adoption evidence
- **THEN** grants and RLS deny the request
- **AND** the supported service projection exposes only authorized fields

#### Scenario: A record references another tenant

- **WHEN** a write attempts to combine Page, Site, subject, locale, assignment,
  release, or Designation keys from different scopes
- **THEN** composite constraints reject it even under privileged execution
- **AND** no application-layer omission can create a cross-tenant relationship

### Requirement: Public And Restricted Projections Do Not Reveal Protected Existence

Anonymous, directory, search, social, sitemap, cache, route, error, count, and
measurement projections SHALL disclose only currently D2/Phase-10-admitted
public facts. Denied responses SHALL avoid content-specific metadata, timing,
counts, identifiers, filenames, source types, and error distinctions that reveal
a protected person, ministry, supporter, Page, locale, Update, or assignment.

#### Scenario: A restricted Page route is guessed

- **WHEN** an anonymous actor requests the route or metadata endpoint
- **THEN** the response follows the Phase 10 safe non-disclosure disposition
- **AND** HTML, headers, images, structured data, analytics, and errors contain no
  content-specific hint

#### Scenario: A staff count includes protected Pages

- **WHEN** the viewer lacks row-level inspection authority
- **THEN** the operations or measurement projection suppresses or generalizes
  the group safely
- **AND** filtering or differencing cannot recover the protected membership
