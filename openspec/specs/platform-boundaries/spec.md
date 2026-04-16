# Platform System Boundaries

## Purpose

State durable **architectural and trust boundaries** for the core monorepo so
agents and contributors do not re-derive them from scattered files.

Detailed rules, enforcement scripts, and exception tables live in git docs and
code; this spec names the contracts and points to authoritative detail.
## Requirements
### Requirement: Monorepo Surface Split And Shared Logic Convergence

The monorepo SHALL preserve three primary user-facing application surfaces:
Mission Control / admin, donor/public, and missionary workspace. These are
product-facing boundaries, not arbitrary folder choices.

Surface-specific behavior can stay local to a surface, but repeated business
logic and shared behavior MUST converge into shared internal packages or
centralized shared modules rather than being duplicated across app trees.

The platform MUST use the monorepo to behave like one coherent product, not to
grow separate app-local versions of the same rule or workflow.

#### Scenario: An app-local fix would duplicate business logic
- GIVEN a local fix in one app surface would copy business logic that already
  exists elsewhere or is likely to be needed elsewhere
- WHEN an agent chooses between a quick local patch and a shared owning layer
- THEN the agent converges that logic into shared internal behavior instead of
  duplicating it across app trees
- AND they keep app-local implementation only for genuinely surface-specific
  behavior

#### Scenario: An agent tries to treat surface split as only an implementation detail
- GIVEN a shortcut would ignore the durable split between the three
  product-facing surfaces because all code lives in one monorepo
- WHEN an agent chooses where logic or responsibility should live
- THEN they preserve the product-facing surface split as a real boundary
- AND they do not collapse distinct surfaces into one vague app layer simply
  because local code access is easy

### Requirement: CRM As Operational Truth And CMS As Public Truth

CRM MUST own operational identity, relationships, giving, permissions-sensitive
records, workflows, approvals, money-related history, and other operational
truth.

CMS MUST own public presentation, managed website content, public page
structure, and content publishing state.

The two layers SHALL remain distinct but tightly linked, and they MUST NOT
compete for source-of-truth ownership.

#### Scenario: A feature treats CMS data as operational truth
- GIVEN a feature proposal wants to treat public content as the authoritative
  source for permissions-sensitive state, operational workflow, or money-related
  truth
- WHEN an agent decides which layer owns that truth
- THEN the agent keeps operational truth in CRM and public truth in CMS
- AND they do not let CMS become the operational source of truth without a more
  specific OpenSpec override

### Requirement: CRM/CMS Alignment As A Core Platform Contract

Alignment between CRM and CMS MUST be treated as a core platform contract, not
as optional glue or best-effort synchronization.

For missionary public pages and project pages, CRM MUST own the missionary or
project as an operational entity together with its relationships, permissions,
designations, and linked records. CMS MUST own the public page content and
presentation for those same entities.

Changes initiated from missionary or admin surfaces MUST keep both layers
aligned without creating split ownership. If CRM and CMS appear to disagree and
no more specific spec exists, the platform MUST favor CRM operational truth
first and then align CMS public truth to it.

#### Scenario: A local implementation would let CRM and CMS drift
- GIVEN a local implementation could update operational truth or public truth in
  only one layer
- WHEN an agent chooses between a fast one-sided patch and aligned cross-layer
  behavior
- THEN the agent rejects the path that leaves CRM and CMS out of sync
- AND they treat alignment between operational and public records as part of the
  feature contract rather than as later cleanup

#### Scenario: CRM and CMS appear to disagree
- GIVEN an agent sees different state in operational records and public content
- WHEN no more specific spec exists for resolving the conflict
- THEN they favor CRM operational truth first
- AND they align CMS public truth to that operational record rather than letting
  the two compete

### Requirement: Server-Side Boundary For Sensitive Operations

Sensitive operations MUST remain behind server-side boundaries. This includes
payments, money movement, record mutation, refunds, official documents,
automation triggers, tenant-scoped integrations, permission-sensitive actions,
and anything involving secrets or audit-sensitive side effects.

Public or limited-role surfaces MUST NOT perform these operations directly just
because doing so would make a local implementation easier.

Payment data, secrets, and trust-sensitive internals MUST never leak into the
wrong layer.

#### Scenario: A payment, refund, or official record mutation would leak into the wrong layer
- GIVEN a proposed implementation would place a payment action, refund, official
  record mutation, secret-bearing integration, or audit-sensitive side effect in
  a public or limited-role layer
- WHEN an agent compares that shortcut with a server-side boundary
- THEN the agent keeps the sensitive operation behind the server-side boundary
- AND they expose only the safe, role-scoped outcome or request surface needed
  by the user

### Requirement: Role-Scoped Surface Boundaries

Public visitors, donors, missionaries, staff, assistants, and admins MUST have
different visibility and action boundaries as part of the product definition,
not as incidental implementation detail.

Public or limited-role surfaces MUST never perform admin-depth actions, bypass
approval rules, mutate permissions-sensitive records outside their allowed
scope, or expose privileged operational depth just because it is convenient.

If an action requires organizational operational depth, broad record
visibility, cross-role coordination, finance-sensitive handling, approval
control, or tenant-wide administration, it MUST belong in Mission Control
first. Narrower logged-in surfaces SHALL expose only role-scoped slices of the
same system where appropriate.

Hidden or unavailable capability MUST feel intentional and clean rather than
hacked away or half-present.

#### Scenario: A public or limited-role surface tries to perform admin-depth behavior
- GIVEN a donor, missionary, or public-facing flow asks to perform an action
  that requires broad operational visibility, finance-sensitive handling,
  approval control, or tenant-wide administration
- WHEN an agent decides whether to allow that action directly in the narrow
  surface
- THEN the agent anchors the action in Mission Control first
- AND they expose only the role-scoped slice or status that belongs in the
  narrower surface

#### Scenario: A donor or missionary surface would drift into staff-style operational complexity
- GIVEN a proposed change would make a donor or missionary experience carry
  staff-oriented workflow depth, internal record-management detail, or broad
  operational controls
- WHEN an agent evaluates whether that extra depth belongs there
- THEN they keep the narrow surface focused on its allowed scope
- AND they do not turn a donor or missionary experience into a second staff
  console

#### Scenario: Hidden capability would be left half-present
- GIVEN a narrower role should not see or trigger a deeper capability
- WHEN an agent decides how that limitation appears in the product
- THEN they keep the capability cleanly outside the role-scoped surface or show
  only an intentional status or handoff
- AND they do not leak partial admin behavior into a narrow surface as broken or
  confusing remnants

### Requirement: Tenant Isolation And Scope Integrity

Tenant isolation and role scope MUST be non-negotiable structural boundaries.

The platform SHALL not let a shortcut broaden data visibility, action scope,
approval reach, or record mutation beyond the tenant and role that actually own
the work.

UI hiding alone MUST NOT be treated as sufficient boundary protection when the
underlying scope would still be too broad.

#### Scenario: A shortcut would bypass tenant or role isolation
- GIVEN a shortcut would simplify implementation by reusing broader data access,
  broader action scope, or cross-tenant state
- WHEN an agent compares that shortcut with a stricter scoped path
- THEN the agent rejects the shortcut and preserves tenant and role integrity
- AND they do not rely on obscurity or partial UI hiding as a substitute for
  real scope enforcement

### Requirement: Honest Money State And Protected Payment Internals

Money-state changes MUST propagate clearly and truthfully across the right
surfaces, with no manual re-entry and no misleading lag that suggests a
different state than the operational record. Public optimism MUST never outrun
operational truth.

When a payment-related flow is incomplete, pending, failed, retried, refunded,
or partially processed, the platform MUST reflect the real state honestly and
route the right consequence to the right surfaces and roles.

User-facing copy can be kind and clear, but it MUST NOT soften or hide the
truth. Trust-sensitive payment internals MUST stay protected even while the
user-facing state remains honest.

#### Scenario: A user-facing flow would present a more optimistic state than operational truth supports
- GIVEN a donor, missionary, or public flow could show success, finality, or a
  cleaner state before the operational record actually supports it
- WHEN an agent chooses how to present that money state
- THEN they reflect the real operational state, including pending, failed,
  retried, partial, or refunded outcomes when applicable
- AND they do not let public optimism outrun operational truth for convenience

#### Scenario: A local implementation wants to expose trust-sensitive internals for convenience
- GIVEN a shortcut would expose payment internals, sensitive status detail, or
  secret-bearing data to a layer that does not need it
- WHEN an agent weighs implementation convenience against payment trust
- THEN they keep trust-sensitive internals protected behind the correct boundary
- AND they expose only the truthful user-facing state and next action

### Requirement: Publication, Moderation, And Tenant-Controlled Release Boundaries

Missionary-managed public content SHALL respect tenant-controlled publication
boundaries even when it originates from the missionary surface or from Mission
Control.

Publication MUST respect tenant-configured approval and moderation rules.

No surface MUST bypass the tenant's chosen publication boundary. If a tenant
allows automatic publishing, the platform MUST respect that choice as a
first-class boundary rather than forcing a manual gate the tenant did not ask
for.

Publication flow MUST preserve CRM/CMS alignment and MUST NOT create a side
channel that publishes around the tenant's release rules.

#### Scenario: A missionary content change would skip tenant-chosen approval or moderation
- GIVEN a missionary or admin initiates a public-content change
- WHEN the tenant requires review, moderation, or approval before release
- THEN the change remains inside that publication boundary until the tenant's
  rule is satisfied
- AND no convenience shortcut publishes directly from the initiating surface

#### Scenario: A tenant allows automatic publishing
- GIVEN a tenant has chosen automatic publishing for an allowed content path
- WHEN an authorized user submits a valid change
- THEN the platform releases it without inventing an extra manual gate
- AND it still keeps operational and public records aligned as part of the same
  contract

### Requirement: Public Versus Authenticated Surface Separation

Public website behavior and authenticated portal behavior SHALL stay clearly
separated while still feeling coherent to the end user.

Public experiences MUST NOT become disguised logged-in operational surfaces.
Authenticated donor or missionary experiences MUST NOT masquerade as public
website behavior in ways that blur identity, permission, or control.

The platform MUST keep public discovery, storytelling, and giving clearly
separated from authenticated control flows while preserving coherent handoff
between them.

#### Scenario: Public and authenticated behavior start to blur together
- GIVEN a new flow could be implemented either as public website behavior or as
  authenticated portal behavior
- WHEN an agent sees that one option would blur identity, permission, or
  operational control boundaries
- THEN they keep the public-versus-authenticated separation clear
- AND they do not solve authenticated control needs by stuffing operational
  behavior into the public experience

### Requirement: Durable Boundary Docs Stay Aligned

Durable boundary documentation MUST stay aligned when those boundaries change.

OpenSpec current truth, architecture docs, and repo guidance that restate the
same durable boundary SHALL remain aligned with one another.

An agent MUST NOT quietly change durable boundary behavior in code while
leaving boundary language stale in OpenSpec or in repo docs that restate the
same contract.

When a change modifies structural or trust boundaries, the relevant OpenSpec
delta and any boundary-restating repo docs SHALL be updated in the same effort.

#### Scenario: A code change updates durable behavior but leaves boundary docs stale
- GIVEN a code change alters a durable boundary around scope, role visibility,
  operational truth, server-side control, publication, or money-state behavior
- WHEN an agent prepares or reviews that change
- THEN they update OpenSpec and the relevant architecture or repo guidance that
  restates the same boundary
- AND they do not treat stale boundary documentation as acceptable cleanup for a
  later pass

