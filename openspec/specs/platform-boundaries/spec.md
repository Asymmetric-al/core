# Platform System Boundaries

## Purpose

State durable **architectural and trust boundaries** for the core monorepo so
agents and contributors do not re-derive them from scattered files.

Detailed rules, enforcement scripts, and exception tables live in git docs and
code; this spec names the contracts and points to authoritative detail.

## Requirements

### Requirement: Monorepo Surface Split And Shared Logic Convergence

The monorepo SHALL preserve the same four major product-facing areas defined in `platform-product-intent` and detailed in `platform-surfaces`: Mission Control / admin, the public tenant website, the donor experience, and the missionary workspace.

Every clause in `openspec/contracts/platform-boundaries.md#contract-bfdba8d189276b094df7` MUST apply without exception.

#### Scenario: An app-local fix would duplicate business logic

- GIVEN a local fix in one app surface would copy business logic that already
  exists elsewhere or is likely to be needed elsewhere
- WHEN an agent chooses between a quick local patch and a shared owning layer
- THEN the agent converges that logic into shared internal behavior instead of
  duplicating it across app trees
- AND they keep app-local implementation only for genuinely surface-specific
  behavior

#### Scenario: An agent tries to treat surface split as only an implementation detail

- GIVEN a shortcut would ignore the durable split between the four major
  product-facing areas because all code lives in one monorepo
- WHEN an agent chooses where logic or responsibility should live
- THEN they preserve the product-facing surface split as a real boundary
- AND they do not collapse distinct surfaces into one vague app layer simply
  because local code access is easy

### Requirement: Site Is A Tenant-Owned Presentation And Attribution Entity

The platform SHALL model Site as a first-class entity beneath Tenant for public presentation and giving attribution.

Every clause in `openspec/contracts/platform-boundaries.md#contract-6d422b44a032b307a303` MUST apply without exception.

#### Scenario: A public Site changes presentation

- GIVEN a Site has accepted gifts with frozen financial facts and attribution
- WHEN its authorized owners change domains, locale policy, or branding
- THEN historical Site attribution and financial ownership remain intact
- AND future requests use current owner-qualified scope without treating CMS
  fields or provider success as domain or financial authority

#### Scenario: A future import maps a SiteStacker website

- GIVEN an import source describes a website as a SiteStacker site channel
- WHEN its public-presence meaning is mapped into Asym
- THEN it maps approximately to one Tenant-owned Site without a second channel
  level
- AND Entry Method, Source Code, and Designation retain their separate meanings
  without granting identity, money, or authorization ownership to the Site

### Requirement: CRM As Operational Truth And CMS As Public Truth

CRM MUST own operational identity, relationships, giving, permissions-sensitive records, workflows, approvals, money-related history, and other operational truth.

Every clause in `openspec/contracts/platform-boundaries.md#contract-8ac6e5a07205e467fd8d` MUST apply without exception.

#### Scenario: Payload runtime is upgraded for Web Studio

- GIVEN the admin CMS engine is upgraded to a new Payload major version
- WHEN the upgrade changes runtime packages, storage adapter shape, routing
  bridge, or migration behavior
- THEN the upgrade remains isolated to `apps/admin` and CMS-owned public content
- AND donor and missionary surfaces continue to consume public CMS APIs rather
  than importing Payload runtime code
- AND public CMS endpoints remain tenant-scoped and published-only

#### Scenario: A feature treats CMS data as operational truth

- GIVEN a feature proposal wants to treat public content as the authoritative
  source for permissions-sensitive state, operational workflow, or money-related
  truth
- WHEN an agent decides which layer owns that truth
- THEN the agent keeps operational truth in CRM and public truth in CMS
- AND they do not let CMS become the operational source of truth without a more
  specific OpenSpec override

### Requirement: CRM/CMS Alignment As A Core Platform Contract

Alignment between CRM and CMS MUST be treated as a core platform contract, not as optional glue or best-effort synchronization.

Every clause in `openspec/contracts/platform-boundaries.md#contract-ebd32f4b823f763f6509` MUST apply without exception.

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

Sensitive operations MUST remain behind server-side boundaries.

Every clause in `openspec/contracts/platform-boundaries.md#contract-d22b0ff1730c7c3ef523` MUST apply without exception.

#### Scenario: A payment, refund, or official record mutation would leak into the wrong layer

- GIVEN a proposed implementation would place a payment action, refund, official
  record mutation, secret-bearing integration, or audit-sensitive side effect in
  a public or limited-role layer
- WHEN an agent compares that shortcut with a server-side boundary
- THEN the agent keeps the sensitive operation behind the server-side boundary
- AND they expose only the safe, role-scoped outcome or request surface needed
  by the user

### Requirement: Role-Scoped Surface Boundaries

Public visitors, donors, missionaries, staff, and admins MUST have different visibility and action boundaries as part of the product definition, not as incidental implementation detail.

Every clause in `openspec/contracts/platform-boundaries.md#contract-e1b7d57df5482beb20bc` MUST apply without exception.

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

### Requirement: AI Assistant Authority Is Bounded By The Initiating User

An AI assistant MUST act strictly within the authority of the human it serves.

Every clause in `openspec/contracts/platform-boundaries.md#contract-413454f7996ee470b527` MUST apply without exception.

#### Scenario: An assistant is asked to act beyond the user's scope

- GIVEN an AI assistant serving a user is prompted to read or mutate records
  outside that user's role scope or tenant
- WHEN the assistant attempts the action
- THEN the platform denies it exactly as it would deny the human user
- AND the assistant does not gain broader visibility or authority by virtue of
  being an assistant

#### Scenario: An assistant reaches a gated effect

- GIVEN an AI assistant prepares a donor-facing send, money effect, operational
  mutation, or publication on the user's behalf
- WHEN the effect would take place
- THEN it stops at an explicit human approval gate before taking effect
- AND the resulting action is attributed to the approving user and audited like
  any direct action

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

Money-state changes MUST propagate clearly and truthfully across the right surfaces, with no manual re-entry and no misleading lag that suggests a different state than the operational record.

Every clause in `openspec/contracts/platform-boundaries.md#contract-f95bdb79a8f1876ba0b1` MUST apply without exception.

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

Missionary-managed public content SHALL respect tenant-controlled publication boundaries even when it originates from the missionary surface or from Mission Control.

Every clause in `openspec/contracts/platform-boundaries.md#contract-556df1b7b0fe901d47f2` MUST apply without exception.

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

Public website behavior and authenticated portal behavior SHALL stay clearly separated while still feeling coherent to the end user.

Every clause in `openspec/contracts/platform-boundaries.md#contract-a9101967df62fd5bf19f` MUST apply without exception.

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

Every clause in `openspec/contracts/platform-boundaries.md#contract-b271df4df14b8380153c` MUST apply without exception.

#### Scenario: A code change updates durable behavior but leaves boundary docs stale

- GIVEN a code change alters a durable boundary around scope, role visibility,
  operational truth, server-side control, publication, or money-state behavior
- WHEN an agent prepares or reviews that change
- THEN they update OpenSpec and the relevant architecture or repo guidance that
  restates the same boundary
- AND they do not treat stale boundary documentation as acceptable cleanup for a
  later pass

### Requirement: Mission Control Tasks Are The Shared Staff Work Model

Mission Control operational follow-up work MUST use one shared staff task
model for contribution operations, donor notifications, receipt and statement
issues, CRM post failures, provider failures, correction reviews, batch issues,
and future automation-created work.

Needs Attention MUST be a contribution-facing view over shared task and issue
state rather than a separate task model. Contribution-related tasks MUST link
back to the triggering contribution operation audit event when one exists.

#### Scenario: A donor correction notification is blocked

- GIVEN a donor correction notification cannot send because the template is
  missing or invalid
- WHEN the platform creates follow-up work
- THEN it creates or requests a shared Mission Control task
- AND the task links to the contribution, notification decision, and operation
  audit event

#### Scenario: Contribution Needs Attention shows provider issues

- GIVEN contribution operations have failed provider actions or pending refunds
- WHEN finance staff opens Needs Attention
- THEN those issues appear through the shared Mission Control task/issue model
- AND the product does not invent a separate contribution-only queue

### Requirement: Mission Control Automations Are Declarative And Guarded

Mission Control automations MUST be declarative definitions, not arbitrary user-supplied code.

Every clause in `openspec/contracts/platform-boundaries.md#contract-ca4acefa199203f3f0c5` MUST apply without exception.

#### Scenario: Admin activates an automation

- GIVEN an admin with `automation:manage` creates an automation
- WHEN the admin activates it
- THEN the platform requires a preview and test run first
- AND the automation definition is stored as declarative trigger, condition,
  action, run-mode, reviewer, failure-policy, and activity-log data

#### Scenario: Automation wants to send a donor email

- GIVEN an automation action would send donor-facing email
- WHEN the action is planned or executed
- THEN it uses the contribution notification module and Email Studio template
  policy
- AND it does not call Resend directly

### Requirement: Supabase TanStack DB Collections Own Browser-Visible Table State

Browser-visible Supabase table state MUST be represented through shared TanStack DB collections owned by `packages/database/collections` and app-facing hooks owned by `packages/database/hooks`.

Every clause in `openspec/contracts/platform-boundaries.md#contract-81a4ef98b6fe9ddc8500` MUST apply without exception.

#### Scenario: A browser feature needs a list of RLS-safe table rows

- GIVEN a browser-visible feature needs rows from a Supabase table that is safe
  for the user under RLS
- WHEN an agent chooses a data-access pattern
- THEN the feature uses an `@asym/database` collection or hook
- AND it does not add a direct app-level Supabase table read

#### Scenario: A table is not safe under current RLS

- GIVEN a table contains secret-bearing, finance-sensitive, private, or
  tenant-wide rows without production-safe RLS and redaction
- WHEN an agent considers exposing it as a browser collection
- THEN the agent keeps that table out of browser collections
- AND they add scoped RLS, a safe view, or a server read model before exposing
  browser-visible data

### Requirement: Collection Mutations Are Limited To Simple RLS-Allowed Writes

TanStack DB collection mutations MUST be limited to single-table, user-initiated
CRUD actions when RLS authorizes the action and optimistic UI is appropriate.

Collection mutations MUST NOT own payments, donation creation or confirmation,
refunds, receipts, tax documents, email sending, webhooks, audit logs,
service-role operations, role changes, RPC counter workflows, multi-table
business workflows, external system sync, file processing, payouts, or anything
involving secrets.

#### Scenario: A user edits a simple preference row

- GIVEN the user is allowed by RLS to update a single preference row
- WHEN the UI applies an optimistic update
- THEN a collection mutation may write the row
- AND the mutation rolls back if Supabase rejects the write

#### Scenario: A donor submits a payment or donation

- GIVEN a donor action creates or confirms money movement
- WHEN the implementation chooses where the mutation belongs
- THEN the action remains behind a server command boundary
- AND the browser collection only reflects safe resulting state after the
  server-owned workflow persists it

### Requirement: Server Read Helpers Do Not Weaken Command Boundaries

TanStack DB `queryOnce` MUST NOT be used in server, route, or shared package
code except through an approved `@asym/database` helper for bounded read
shaping, collection-compatible query reuse, or tests that compare server and
browser query behavior.

Server code MUST keep plain Supabase, SQL, views, functions, or existing API
read models when they are simpler, faster, more secure, aggregate-heavy,
service-role dependent, or command-adjacent.

#### Scenario: A server component needs the same safe filtered list as a browser hook

- GIVEN a server component needs a bounded read shaped like an existing browser
  collection query
- WHEN `queryOnce` can express that read without broadening data exposure or
  pulling excessive data into memory
- THEN the server may use the approved `@asym/database` queryOnce helper
- AND it does not create an ad hoc Supabase client or collection adapter

#### Scenario: A finance report needs authoritative aggregate data

- GIVEN a report needs aggregate-heavy or finance-authoritative data
- WHEN an agent considers replacing the report path with TanStack DB
- THEN the report stays server-side through SQL, views, functions, or server
  Supabase queries
- AND TanStack DB may only display bounded report results when appropriate

### Requirement: Realtime Exposure Is Explicit And RLS-Gated

Realtime Postgres Changes MUST be enabled only for tables whose payloads and
RLS posture are appropriate for live browser-visible updates.

Visible app tables MAY use Realtime by default after RLS is safe. Internal,
high-churn, sensitive, large-payload, audit, webhook, payment, sync, and
non-UI tables MUST be excluded unless a specific product need and RLS design
justify inclusion.

#### Scenario: A feed table is browser-visible and RLS-safe

- GIVEN a feed table is visible to the current user under RLS
- WHEN collection state should update after other users or server commands write
  rows
- THEN the table may be added to `supabase_realtime`
- AND the collection registry documents Realtime as enabled

#### Scenario: A webhook log or payment attempt table changes frequently

- GIVEN a table contains webhook logs, provider internals, payment attempts,
  audit events, large payloads, or internal sync state
- WHEN an agent considers enabling Realtime for convenience
- THEN the table remains excluded from Realtime
- AND any UI that needs status uses a safe server read model or bounded polling
  strategy

### Requirement: Collection Registry Documents Data Ownership And Exclusions

The platform MUST maintain a collection registry that identifies every shared
collection or collection-like data source by kind: real Supabase table,
derived collection, queryOnce/server read helper, local-only UI collection, or
legacy temporary collection.

The registry MUST make RLS posture, Realtime posture, primary keys, mutation
policy, and intentional browser/server exclusions visible to future agents and
developers.

#### Scenario: A developer adds a new browser data feature

- GIVEN a developer needs to know which collection owns a feature's data
- WHEN they inspect the registry
- THEN they can identify the intended collection or server read path
- AND they can see whether browser mutations or Realtime are allowed

#### Scenario: A local-only collection remains after migration

- GIVEN a collection is intentionally local-only or demo-only
- WHEN it remains in the codebase
- THEN the registry marks it local-only
- AND documents why it is not backed by Supabase yet or what must happen before
  it can be persisted
