# platform-boundaries normative contract clauses

A section is binding only when the matching requirement unconditionally references
it. A proposed or historical section does not become accepted by residing here.
The reference, requirement identity, scenarios, and normal source-authority rules
form one contract. Preserve all clauses; see openspec/contracts/README.md.

<!-- prettier-ignore-start -->

<a id="contract-85ce2a4593957015827b"></a>

## Web Studio Uses One Actor And Service Operations Boundary

<!-- BEGIN CONTRACT {"id":"85ce2a4593957015827b","name":"Web Studio Uses One Actor And Service Operations Boundary"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-5396fff1169250154520"></a>

## Phase 22 Editorial Recovery Is Fenced And Reference-Safe

<!-- BEGIN CONTRACT {"id":"5396fff1169250154520","name":"Phase 22 Editorial Recovery Is Fenced And Reference-Safe"} -->

One private non-semantic recovery buffer MAY exist per exact Page and locale
beneath the expected coherent working head. It SHALL use digest no-op
suppression, at most one in-flight write per exact generation, and late-write
fencing; it SHALL NOT advance a semantic head, freeze a candidate, create an
actor branch, or emit per-autosave audit/outbox facts. Governed Page collections
SHALL disable blind native version pruning. Cleanup MAY remove only reference-
proved scratch or inert prepares after authoritative recheck; ambiguous
reference closure SHALL preserve the content and create a private operational
exception.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-c669c207c2a508e8e183"></a>

## Field Accounts Preserve Organization-Controlled Support Truth Without Becoming Accounting Or Payroll

<!-- BEGIN CONTRACT {"id":"c669c207c2a508e8e183","name":"Field Accounts Preserve Organization-Controlled Support Truth Without Becoming Accounting Or Payroll"} -->

Phase 21 MUST own organization-controlled Support Assignments, currency-scoped
Field Account occurrences, exact source coverage, Support Cycle close facts,
derived Finance-confirmed Field Account Balances, expense-claim operational
truth, and the Phase 21 packages handed to owning downstream systems. It MUST
NOT derive authoritative balances by summing donation rows or treat a Field
Account as a donor restriction, worker-owned wallet, bank balance, payroll
balance, accounts-payable subledger, general ledger, or money-movement system.

Phase 13 and Phase 15 MUST remain authoritative for their contribution and
offline/noncash source facts. Phase 20 MUST remain the only owner of QBO/Xero
accounting delivery and accounting reconciliation assistance. External payroll
or AP providers MUST remain authoritative for classification, calculation,
approval, execution, completion, and payment according to their certified
capabilities. Phase 29 MUST own protected Phase-21 evidence and D26 package
bytes, retention holds, and disposal; independently owned artifact bytes,
including Phase 18 generated documents, MUST remain with their owner. Phase 30
MUST own inbound transport, and Phase 31 outbound support-feed transport.

Each cross-phase handoff MUST carry exact Tenant, Legal Entity, purpose,
Support Assignment, Field Account, ISO currency, source identity/version,
coverage, policy version, and authority evidence required by the receiving
contract. A downstream acceptance, artifact, provider draft, accounting post,
bank match, payslip, or notification MUST NOT rewrite Phase 21 history or be
presented as another authority's success.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-c4ff9bc796e8f1ba7007"></a>

## Legal Entity Is Explicit Subtract-Only Financial Scope

<!-- BEGIN CONTRACT {"id":"c4ff9bc796e8f1ba7007","name":"Legal Entity Is Explicit Subtract-Only Financial Scope"} -->

Every independently authoritative financial root and cross-system accounting
handoff MUST store one exact tenant and Legal Entity. Legal Entity scope MUST
only narrow the containing tenant's records, permissions, connections, and
reporting; it MUST NOT widen access or action across tenants.

A processor Settlement Account Binding, read-only bank-evidence connection, and
QBO/Xero Accounting Destination Connection MUST be separate purpose-owned
records scoped to the exact tenant and Legal Entity. Accepted work MUST retain
the binding or connection identity that governed it. A mutable tenant, site, or
current-default lookup MUST NOT reroute historical work.

The product MAY quietly preselect the sole entity for a one-entity tenant, but
storage and authorization MUST remain explicit. Multi-entity activation MUST
be prospective and proof-gated. A financial operation, Accounting Release, or
Bank Match that crosses Legal Entities MUST fail closed or be split before
release.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-1f2188a9475cdc122a87"></a>

## Support Assignment Participation Never Implies Financial Access Or Ownership

<!-- BEGIN CONTRACT {"id":"1f2188a9475cdc122a87","name":"Support Assignment Participation Never Implies Financial Access Or Ownership"} -->

A Support Assignment MUST be the stable organization-controlled financial
subject. Participant Membership, Phase 12 Workspace Access, source-owned
operational responsibility, claimant identity, review authority, payee status,
and notification preferences MUST remain independent, versioned facts. Spouse,
household, teammate, leader, project, contact, or participant relationships MUST
NOT imply one another or grant transitive access.

All Phase 21 commands and projections MUST enter through the trusted
`FieldAccountOperationsService` boundary with a server-resolved principal and
actual actor, exact Tenant Authorization Context, exact Tenant and Legal Entity,
environment, authorization epoch, assurance level, capabilities, and resource
scope.
Application authorization MUST use the Phase 12 server policy decision point;
forced row-level security and same-scope database constraints MUST provide
defense in depth. Financial grants MUST NOT be stored in client state or JWT
claims, and raw financial tables MUST NOT be exposed through Realtime.

Authorization and privacy filtering MUST happen before enumeration, counts,
arithmetic, pagination, caching, export, notification, provider delivery, or
diagnostics. A denied or stale cross-scope identifier MUST return the same
non-enumerating outcome as a nonexistent resource and MUST create no side
effect.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-ddf83c01d624f6dd3733"></a>

## D1 Is The Sole Favorable Public Activation And Read Boundary

<!-- BEGIN CONTRACT {"id":"ddf83c01d624f6dd3733","name":"D1 Is The Sole Favorable Public Activation And Read Boundary"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-556df1b7b0fe901d47f2"></a>

## Publication, Moderation, And Tenant-Controlled Release Boundaries

<!-- BEGIN CONTRACT {"id":"556df1b7b0fe901d47f2","name":"Publication, Moderation, And Tenant-Controlled Release Boundaries"} -->

Missionary-managed public content SHALL respect tenant-controlled publication
boundaries even when it originates from the missionary surface or from Mission
Control.

Publication MUST respect tenant-configured approval and moderation rules.

Surfaces MUST NOT bypass the tenant's chosen publication boundary. If a tenant
allows automatic publishing, the platform MUST respect that choice as a
first-class boundary rather than forcing a manual gate the tenant did not ask
for.

Publication flow MUST preserve CRM/CMS alignment and MUST NOT create a side
channel that publishes around the tenant's release rules.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-f8a5a3c28523dcbbc16e"></a>

## Phase 22 Optional Services Never Gain Publication Or Financial Authority

<!-- BEGIN CONTRACT {"id":"f8a5a3c28523dcbbc16e","name":"Phase 22 Optional Services Never Gain Publication Or Financial Authority"} -->

Writing assistance, first-party measurement, search, social presentation,
comments/reactions, notifications, provider invalidation, and external adapters
SHALL consume bounded release projections and SHALL fail independently. They
SHALL NOT approve or publish content, widen Phase 10 or Phase 12 access, create
financial truth, prove delivery or sharing, block Giving, or become a fallback
public reader. Data egress, retention, consent/objection, and provider use SHALL
remain purpose-specific and capability-honest.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-bfdba8d189276b094df7"></a>

## Monorepo Surface Split And Shared Logic Convergence

<!-- BEGIN CONTRACT {"id":"bfdba8d189276b094df7","name":"Monorepo Surface Split And Shared Logic Convergence"} -->

The monorepo SHALL preserve the same four major product-facing areas defined in
`platform-product-intent` and detailed in `platform-surfaces`: Mission Control /
admin, the public tenant website, the donor experience, and the missionary
workspace. These are product-facing boundaries, not arbitrary folder choices.

Surface-specific behavior can stay local to a surface, but repeated business
logic and shared behavior MUST converge into shared internal packages or
centralized shared modules rather than being duplicated across app trees.

The platform MUST use the monorepo to behave like one coherent product, not to
grow separate app-local versions of the same rule or workflow.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-ebd32f4b823f763f6509"></a>

## CRM/CMS Alignment As A Core Platform Contract

<!-- BEGIN CONTRACT {"id":"ebd32f4b823f763f6509","name":"CRM/CMS Alignment As A Core Platform Contract"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-81a4ef98b6fe9ddc8500"></a>

## Supabase TanStack DB Collections Own Browser-Visible Table State

<!-- BEGIN CONTRACT {"id":"81a4ef98b6fe9ddc8500","name":"Supabase TanStack DB Collections Own Browser-Visible Table State"} -->

Browser-visible Supabase table state MUST be represented through shared
TanStack DB collections owned by `packages/database/collections` and app-facing
hooks owned by `packages/database/hooks`.

The platform MUST use the repo-owned Supabase TanStack DB adapter wrapper for
browser collections instead of ad hoc app-level Supabase table reads, route-only
read models, or feature-local arrays when the data is a real Supabase table and
safe for browser access under RLS.

Supabase Postgres remains the source of truth. Supabase Auth and RLS remain the
security boundary for browser-reachable table data.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-a9101967df62fd5bf19f"></a>

## Public Versus Authenticated Surface Separation

<!-- BEGIN CONTRACT {"id":"a9101967df62fd5bf19f","name":"Public Versus Authenticated Surface Separation"} -->

Public website behavior and authenticated portal behavior SHALL stay clearly
separated while still feeling coherent to the end user.

Public experiences MUST NOT become disguised logged-in operational surfaces.
Authenticated donor or missionary experiences MUST NOT masquerade as public
website behavior in ways that blur identity, permission, or control.

The platform MUST keep public discovery, storytelling, and giving clearly
separated from authenticated control flows while preserving coherent handoff
between them.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-720abc9691559ec7a9bb"></a>

## Phase 23 Integrations Use Small Certified Owner Contracts

<!-- BEGIN CONTRACT {"id":"720abc9691559ec7a9bb","name":"Phase 23 Integrations Use Small Certified Owner Contracts"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-f95bdb79a8f1876ba0b1"></a>

## Honest Money State And Protected Payment Internals

<!-- BEGIN CONTRACT {"id":"f95bdb79a8f1876ba0b1","name":"Honest Money State And Protected Payment Internals"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-641fa5785072e9769ef6"></a>

## Accounting Handoffs Preserve Source-Specific Authority

<!-- BEGIN CONTRACT {"id":"641fa5785072e9769ef6","name":"Accounting Handoffs Preserve Source-Specific Authority"} -->

Asym source domains MUST own canonical contribution, allocation, correction,
and receipt facts. Phase 20 MAY transform those facts into an immutable,
balanced Accounting Release and evidence artifact, but that downstream
projection MUST NOT mutate or become a competing source for gift truth.

Stripe MUST remain authoritative for processor balance transactions, fees,
refunds, disputes, transfers, and payout evidence for the exact connected
account and mode. Posted bank evidence MUST remain authoritative for what the
bank recorded. QBO or Xero MUST remain authoritative for provider-native
general-ledger objects, accounting periods and locks, and the tenant's final
books reconciliation.

Every imported, derived, exported, or read-back fact MUST retain its source
label and exact source identifier. Agreement among systems MAY be shown as
evidence; disagreement MUST remain visible and route to bounded review.
Provider acceptance, bank matching, or GL posting MUST NOT rewrite another
authority's history or permit blind replay of an ambiguous operation.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-413454f7996ee470b527"></a>

## AI Assistant Authority Is Bounded By The Initiating User

<!-- BEGIN CONTRACT {"id":"413454f7996ee470b527","name":"AI Assistant Authority Is Bounded By The Initiating User"} -->

An AI assistant MUST act strictly within the authority of the human it serves.
An assistant — an AI agent that helps a staff member, missionary, or donor
complete a task — MUST NOT read data, take actions, or reach records beyond that
user's own role scope and tenant, and MUST NOT be used to escalate privilege or
bypass approval, permission, or tenant-isolation boundaries.

Assistant actions MUST follow current AI-agent best practice: least privilege
by default; the same human approval gates that govern donor-facing sends, money
effects, operational-truth mutation, and publication (per the platform's AI
product direction); clear attribution of the acting user; and an audit trail
equivalent to the same action performed by that user directly. An assistant is
never a separate permission tier and never a way to widen scope.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-b271df4df14b8380153c"></a>

## Durable Boundary Docs Stay Aligned

<!-- BEGIN CONTRACT {"id":"b271df4df14b8380153c","name":"Durable Boundary Docs Stay Aligned"} -->

Durable boundary documentation MUST stay aligned when those boundaries change.

OpenSpec current truth, architecture docs, and repo guidance that restate the
same durable boundary SHALL remain aligned with one another.

An agent MUST NOT quietly change durable boundary behavior in code while
leaving boundary language stale in OpenSpec or in repo docs that restate the
same contract.

When a change modifies structural or trust boundaries, the relevant OpenSpec
delta and any boundary-restating repo docs SHALL be updated in the same effort.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-e3fe1903406c4bce0915"></a>

## Phase 22 Public Composition Is Exact Gate-Before-Cache And Adverse-First

<!-- BEGIN CONTRACT {"id":"e3fe1903406c4bce0915","name":"Phase 22 Public Composition Is Exact Gate-Before-Cache And Adverse-First"} -->

Public serving SHALL compose one exact route, Page-locale release, D27
Site-family presentation activation, D2/Phase-10 admission, media and public
projection manifest. Admission SHALL occur before cache access. Positive
changes MAY converge through bounded freshness classes, but adverse changes
SHALL stop the affected new behavior first and SHALL never use stale-if-error,
slug guessing, locale prose fallback, or a legacy reader.
Every owner-labelled adverse cause SHALL enqueue one append-only exact-scope
convergence operation through transactionally coupled delivery. The operation
SHALL reference the owning disposition and pin desired generation, input digest,
idempotency identity, controlled-surface coverage, deadline, fenced attempts,
and residual-only recovery. Expiration requested, provider accepted, controlled
response observed, not verifiable, and external observation SHALL remain
distinct facts and SHALL NOT individually prove convergence.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-b0dee2b17457f195a3dc"></a>

## Phase 22 Uses One Application Boundary For Private Editing And Public Serving

<!-- BEGIN CONTRACT {"id":"b0dee2b17457f195a3dc","name":"Phase 22 Uses One Application Boundary For Private Editing And Public Serving"} -->

All authenticated revision, attestation, review, preview, release, assignment,
settings, operations, adoption, and recovery behavior SHALL cross
`PublicMinistryPagesService`. Anonymous serving SHALL resolve the exact current
Page-locale release through the same domain boundary before Phase 5 renders or
uses cache. Browsers SHALL NOT receive direct grants to private Phase 22, CRM,
financial, assignment, response, measurement-occurrence, or CMS-admin tables.
For D24 staff revisions, user-context Payload Local API calls SHALL preserve the
authenticated actor and use `overrideAccess: false` and `overrideLock: false`.
An inert private content prepare MAY precede the operational commit, but the
service SHALL advance the exact working head only through the expected-head CAS
and SHALL NOT claim cross-store atomicity. Same-scope integrity SHALL combine
complete operational provenance constraints with adapter validation of the
exact Payload version scope and digest; it SHALL NOT require or imply a
cross-schema CMS-to-operational foreign key. A complete transaction retry is
permitted only for proved serialization or deadlock failures, while an
ambiguous result requires authoritative inspection before any retry.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-eae20970244c12e53074"></a>

## Site Context Never Owns Money Authorization Or Provider Truth

<!-- BEGIN CONTRACT {"id":"eae20970244c12e53074","name":"Site Context Never Owns Money Authorization Or Provider Truth"} -->

Site, domain, locale, brand, public generation, CMS content, browser state, and
provider evidence MUST remain presentation, attribution, routing, or execution
contexts only. They MUST NOT select or redefine Legal Entity, Settlement Account
Binding, Stripe account, merchant, settlement, payout, bank, receipt issuer,
ledger, accounting, donor authorization, or historical money ownership.

Asym Postgres MUST own operational Site/domain/locale/currency policy and public
head truth through structurally scoped command boundaries. Payload, Vercel, DNS,
Stripe, caches, analytics, and UI projections MUST be isolated behind owner-
specific adapters/read models and MUST NOT write product authority back. A
privileged/server path MUST enforce the same Tenant/scope/business boundary even
where the database role can bypass RLS.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-bbd55362eabde3c8450d"></a>

## Phase 22 Financial And Giving State Remains Capability-Honest

<!-- BEGIN CONTRACT {"id":"bbd55362eabde3c8450d","name":"Phase 22 Financial And Giving State Remains Capability-Honest"} -->

Public progress SHALL use only a certified, purpose-specific owning-phase
projection, and every released MVP Page SHALL bind exactly one eligible Phase 13
Designation; an incomplete draft MAY exist but SHALL NOT release. Page availability, progress, Give selection, cart admission,
provider acceptance, settlement, support recognition, balance, payroll, and
payment SHALL remain distinct facts. Missing or stale financial data SHALL never
become zero, inferred currency conversion, or optimistic completion.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-8ac6e5a07205e467fd8d"></a>

## CRM As Operational Truth And CMS As Public Truth

<!-- BEGIN CONTRACT {"id":"8ac6e5a07205e467fd8d","name":"CRM As Operational Truth And CMS As Public Truth"} -->

CRM MUST own operational identity, relationships, giving, permissions-sensitive
records, workflows, approvals, money-related history, and other operational
truth.

CMS MUST own public presentation, managed website content, public page
structure, and content publishing state.

Payload CMS MAY be upgraded inside `apps/admin` as the Web Studio CMS engine
when the upgrade preserves this ownership split, keeps public CMS reads
published-only and tenant-scoped, and keeps Payload runtime code out of donor
and missionary apps.

The two layers SHALL remain distinct but tightly linked, and they MUST NOT
compete for source-of-truth ownership.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-94ce65f656557c122ad1"></a>

## Exact Public Audience Excludes Authentication And Personalization

<!-- BEGIN CONTRACT {"id":"94ce65f656557c122ad1","name":"Exact Public Audience Excludes Authentication And Personalization"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-c3911bd115c2519bc6d6"></a>

## Delivery And Document Issuance Remain Independent

<!-- BEGIN CONTRACT {"id":"c3911bd115c2519bc6d6","name":"Delivery And Document Issuance Remain Independent"} -->

Phase 17 MUST own governed message content, publication/compiler and sender
resolution, and protected-action presentation. Phase 6 MUST own recipient
intent, consent, preparation orchestration, provider submission and outcomes,
delivery recovery, and communication history.
Document Production MUST own exact artifact identity, authorization, retrieval,
current/replaced/cancelled state, and artifact evidence. A send, bounce, open,
link preflight, grant redemption, byte response, or download MUST NOT create or
alter document issuance.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-56c06244372b57c09a69"></a>

## Phase 22 Adoption Transfers One Complete Public Reader Cohort

<!-- BEGIN CONTRACT {"id":"56c06244372b57c09a69","name":"Phase 22 Adoption Transfers One Complete Public Reader Cohort"} -->

Legacy-to-Phase-22 adoption SHALL use private, resumable, non-authoritative
preparation and shadow comparison over a complete Tenant, Legal Entity,
environment, Site, immutable enumerated verified-host membership generation and
digest, and locale cohort. Host strings, wildcards, request headers, deployment
domains, previously verified hosts, and mutable current-host queries SHALL NOT
define or widen that cohort. Every Page and shared artifact SHALL receive one
non-overlapping disposition. The Adoption Case, Plan, shadow, and Coverage
Manifest SHALL pin the same host-membership generation and digest. One idempotent,
generation-fenced CAS SHALL transfer public reader authority; no partial tenant
enablement, mixed reader, dual write, destructive rollback, or legacy fallback
is permitted afterward.
Coverage SHALL close over shared route maps, directories and indexes, sitemaps,
canonical/alternate-locale graphs, cache generations, and every Controlled
Public Surface. A cross-cohort artifact requires an atomically selectable,
generation-pinned partition; otherwise all dependent cases SHALL participate in
one coordinated shared-authority CAS. The selected Adoption Plan Version and
Coverage Manifest SHALL be immutable, content-addressed successors; corrections
SHALL create successors rather than mutate them or resolve through a floating
latest pointer.
The final CAS SHALL compare the pinned host-membership generation and digest to
the current Phase 2/24 owner head and SHALL abort with no public effect when a
host was added, removed, transferred, canonicalized, or reverified after
preparation.

A Compatible Legacy Page Release MAY preserve proved-safe legacy presentation
only through a certified one-time family-qualified adapter that freezes an
immutable D2 DTO and pins the exact D20 catalog, D3 profile, compatibility
renderer, content, locale, brand, managed references, and owner generations.
Request-time raw Payload or mutable legacy reads and unknown semantics SHALL be
ineligible. No new compatible-legacy release SHALL be created after cohort
cutover, and the next edit SHALL use an ordinary current-catalog successor.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-d22b0ff1730c7c3ef523"></a>

## Server-Side Boundary For Sensitive Operations

<!-- BEGIN CONTRACT {"id":"d22b0ff1730c7c3ef523","name":"Server-Side Boundary For Sensitive Operations"} -->

Sensitive operations MUST remain behind server-side boundaries. This includes
payments, money movement, record mutation, refunds, official documents,
automation triggers, tenant-scoped integrations, permission-sensitive actions,
and anything involving secrets or audit-sensitive side effects.

Public or limited-role surfaces MUST NOT perform these operations directly just
because doing so would make a local implementation easier.

Payment data, secrets, and trust-sensitive internals MUST never leak into the
wrong layer.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-e1b7d57df5482beb20bc"></a>

## Role-Scoped Surface Boundaries

<!-- BEGIN CONTRACT {"id":"e1b7d57df5482beb20bc","name":"Role-Scoped Surface Boundaries"} -->

Public visitors, donors, missionaries, staff, and admins MUST have different
visibility and action boundaries as part of the product definition, not as
incidental implementation detail. (AI assistants are not a separate permission
tier — an assistant acts within the authority of the human it serves; see "AI
Assistant Authority Is Bounded By The Initiating User".)

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-aa2aa275aa89dbc14ed1"></a>

## Phase 23 Separates Editable CMS Source From Public Site Authority

<!-- BEGIN CONTRACT {"id":"aa2aa275aa89dbc14ed1","name":"Phase 23 Separates Editable CMS Source From Public Site Authority"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-6d422b44a032b307a303"></a>

## Site Is A Tenant-Owned Presentation And Attribution Entity

<!-- BEGIN CONTRACT {"id":"6d422b44a032b307a303","name":"Site Is A Tenant-Owned Presentation And Attribution Entity"} -->

The platform SHALL model Site as a first-class entity beneath Tenant for public
presentation and giving attribution. Every Tenant MUST have at least one Site
and exactly one Default Site, and MAY operate additional Sites. A Site MUST NOT
be a Tenant, billing account, payment identity, or authorization boundary.
Mission Control, Donor Portal, and Missionary Workspace MUST NOT be Sites.

Asym Postgres in `public.*` MUST own operational Site identity, Tenant scope,
CRM and money truth. CMS MUST own authored public content and presentation,
aligned to the operational Site identity without becoming operational authority.
Per Phase 24 D72, operational Domain authority MUST own exact-host bindings and
Primary/Redirect Site Domain roles; CMS and Site fields MAY expose read-only
projections but MUST NOT become mutable domain authority.

A Site MUST NOT own or select Legal Entity, Settlement Account Binding,
merchant/payment account, settlement, bank, accounting, receipt issuer, or
ledger identity. Those owners MUST independently resolve and freeze their exact
financial facts. Domain, locale, branding, or presentment-policy changes MUST
NOT rewrite accepted gifts or historical attribution. The explicit Phase 24
amendments govern domain, exact-locale publication, Site Brand release, and
proof-qualified donor presentment; this foundation SHALL NOT authorize live
multi-currency giving or infer qualification from Site configuration.

Site, Entry Method, Source Code, and Designation MUST remain independent
attribution axes: where giving entered, how it entered, what drove it, and what
it funds. For future import interpretation, SiteStacker's site channel is
approximately an Asym Site. The platform MUST NOT introduce a second
Site/channel hierarchy or revive a generic gift channel field.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-ac554d91b10698f92025"></a>

## Phase 22 Operations And Settings Remain Derived Projections

<!-- BEGIN CONTRACT {"id":"ac554d91b10698f92025","name":"Phase 22 Operations And Settings Remain Derived Projections"} -->

Mission Control's Public Pages operations and setup/settings workspaces SHALL be
disposable projections over source-owned current facts. The operations projection
SHALL resolve current authorization and one exact Tenant, Legal Entity,
environment, Site, and locale before enumerating, grouping, counting, searching,
exporting, notifying, linking, badging, subscribing through Realtime, or caching
any result. A host, route, selected row, task link, cache namespace, or prior
authorization SHALL NOT infer or widen that scope. The operations projection
SHALL consume one finite, code-owned, versioned registry covering every D1–D21
owner contract; each compatible owner version SHALL supply either a privacy-safe
condition/action adapter or a source-owned `not participating`, `Off`, or
`unavailable` disposition. Missing or incompatible coverage SHALL remain
`Partial`/`Unavailable` and SHALL NOT trigger raw owner-table reads, copied status
logic, a guessed task, or a healthy result. Each action SHALL route to its owning
contract and re-prove current permission and version. The workspaces SHALL NOT
create parallel health, task, workflow, settings, or permission authority.
The authorized product audit export SHALL use a versioned machine-readable schema
with stable opaque IDs, immutable lineage, exact scope, source provenance, and
coverage time for Pages, releases, routes/dispositions, assignments, and selected
and effective profile references. It SHALL be privacy-filtered before enumeration
and SHALL NOT be replaced by an infrastructure backup/export.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-ca4acefa199203f3f0c5"></a>

## Mission Control Automations Are Declarative And Guarded

<!-- BEGIN CONTRACT {"id":"ca4acefa199203f3f0c5","name":"Mission Control Automations Are Declarative And Guarded"} -->

Mission Control automations MUST be declarative definitions, not arbitrary
user-supplied code. Only users with `automation:manage` MAY create, edit,
activate, deactivate, or delete automations.

Automation activation MUST require preview, test run, and activity log setup.
Automations MUST call shared domain services rather than writing contribution,
CRM, task, or donor notification records directly where a service exists.
Donor-facing emails from automations MUST use Email Studio templates and
notification policy.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-588ec64dc7657e66e154"></a>

## Mission Control Automations Are Declarative And Guarded

<!-- BEGIN CONTRACT {"id":"588ec64dc7657e66e154","name":"Mission Control Automations Are Declarative And Guarded"} -->

Mission Control automations MUST be declarative definitions, not arbitrary
user-supplied code. Only users with `automation:manage` MAY create, edit,
activate, deactivate, or delete automations.

Automation activation MUST require a preview using stored synthetic mock facts, a non-authoritative test run, and activity log setup. Preview and test runs may produce only test, audit, and provider-operation evidence; they MUST NOT create business communication intents, events, or history records.
Automations MUST call shared domain services rather than writing contribution,
CRM, task, communication, or notification records directly where a service
exists. Any governed-message action, whether tenant-scoped or platform-scoped,
MUST invoke one Live Phase 17 system-message contract only through that
contract's exact code-owned trigger binding. Tenant scope MUST resolve its
tenant-published, contract-bounded Delivery Plan. Platform scope MUST resolve the
immutable Asym-owned fixed plan/version declared by the exact meaning-specific
platform profile and MUST NOT resolve tenant configuration. The producer-owned event, source
fence, recipient resolver, fact adapter, and action issuer MUST all validate
before recipient-specific intents enter the Phase 6 communication spine. The
action MUST NOT call Resend directly, select arbitrary templates, construct
recipients or protected actions outside that producer binding, or treat delivery
as business completion.

Phase 17 Delivery Plans MAY expose only fixed contract-declared message-step,
channel, delay, and escalation choices. They MUST NOT become a second automation
engine. Phase 34 remains responsible for arbitrary workflow enrollment, event
conditions, waits, branches, tasks, mutations, and workflow-run state.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-efc16478fd7d38ec049f"></a>

## Source Domains Own Truth And Document Production Owns Artifacts

<!-- BEGIN CONTRACT {"id":"efc16478fd7d38ec049f","name":"Source Domains Own Truth And Document Production Owns Artifacts"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-79dc3ad38a05be4a3c93"></a>

## Provider Admission And Clean Cutover Preserve One Authority

<!-- BEGIN CONTRACT {"id":"79dc3ad38a05be4a3c93","name":"Provider Admission And Clean Cutover Preserve One Authority"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->
