# identity-and-access normative contract clauses

A section is binding only when the matching requirement unconditionally references
it. A proposed or historical section does not become accepted by residing here.
The reference, requirement identity, scenarios, and normal source-authority rules
form one contract. Preserve all clauses; see openspec/contracts/README.md.

<!-- prettier-ignore-start -->

<a id="contract-ee56b32263df54a7d4e3"></a>

## Phase 3 Sensitive Fields Fail Closed On Every Surface

<!-- BEGIN CONTRACT {"id":"ee56b32263df54a7d4e3","name":"Phase 3 Sensitive Fields Fail Closed On Every Surface"} -->

Unclassified fields, unknown or dotted field keys and unregistered surfaces MUST
be omitted from donor, missionary, public and export projections. Unclassified
fields MUST receive the strictest internal/non-exportable posture. Authorized
Mission Control inspection MAY retain operational visibility under its own
capability and row floors; it MUST NOT make those fields externally available.
Processor identifiers MUST remain hard-locked off donor, missionary, public and
future narrow surfaces, and off bulk export; Mission Control finance visibility
MUST require the exact capability. Internal notes, scores, care and security data
MUST NOT escape through templates, derived fields, search, caches or diagnostics.
Anonymous donor identity MUST be masked for missionary/public consumers while
remaining available to authorized finance, official-facts and audit consumers.
Accepted online guest gifts MUST retain a known Party/legal donor; only explicit
`unknown_offline` source intent may represent unknown identity.

New record families MUST remain blind until their owning phase supplies field
classification and exact row/purpose scope. The retired CRM→surface shadow-sync
stack MUST NOT be revived as an enforcement or synchronization dependency.

The AL-491 receipt-census clarification approved on 2026-10-05 at 04:44:28
UTC permits `receipts` to remain explicitly absent/reserved, bound to the exact
live inventory and repository/schema revision. It MUST have zero fabricated
columns and zero positive seed rows. `receipts` and prototype receipt aliases
MUST remain denied on every surface, including Mission Control, despite
permissive policy rows, category defaults or donation fallbacks. This disposition
qualifies only receipt census availability; all existing required columns still
require a reviewed census and seed. Phase 7 owns canonical source qualification;
Phase 18 owns artifacts and Phase 17 delivery.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-5bbb5cb71ecbee01498d"></a>

## Phase 22 Uses RLS And The Server Boundary As Defense In Depth

<!-- BEGIN CONTRACT {"id":"5bbb5cb71ecbee01498d","name":"Phase 22 Uses RLS And The Server Boundary As Defense In Depth"} -->

Private Phase 22 tables SHALL use forced tenant-aware RLS, structurally complete
same-scope foreign keys, explicit Data API grants, and server-only mutation
paths. Complex Page assignment, purpose, field, history-floor, candidate,
release, and action policy SHALL be evaluated by the server policy boundary;
RLS SHALL provide coarse structural containment and SHALL NOT depend on
recursive relationship queries, mutable user metadata, or large JWT grant
lists. Service-role access SHALL remain private and SHALL NOT bypass domain
authorization in application commands.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-ef4ef18d6b8f09f884c1"></a>

## Tenant Isolation Is Enforced In Depth

<!-- BEGIN CONTRACT {"id":"ef4ef18d6b8f09f884c1","name":"Tenant Isolation Is Enforced In Depth"} -->

Tenant isolation MUST be enforced so that no request reads or mutates data
outside its own tenant and role scope. Application-layer checks at the data-
access boundary MUST be the primary enforcement, and database row-level
security MUST provide defense-in-depth backup; RLS MUST NOT be the only line of
defense, and UI hiding MUST NOT be treated as isolation.

Tenant-scoped tables MUST carry a tenant identifier and be governed by
row-level security. Internal and backup tables that should never be
publicly reachable MUST have access revoked rather than left open.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-3c4485064f0a1589d8fe"></a>

## Phase25 Guest-Origin Newsletter Recipient Access

<!-- BEGIN CONTRACT {"id":"3c4485064f0a1589d8fe","name":"Phase25 Guest-Origin Newsletter Recipient Access"} -->

Before the Q25 consumer is dispatched, P28 and P12 SHALL implement and qualify the already-ratified narrow guest-origin recipient-access extension. The recipient view SHALL project the same immutable P23 request to its frozen intended human only while current exact Page/typed-subject/purpose, field and safety authority still admits it. Guest origin SHALL NOT require a fabricated donor, supporter, follower, account linkage or fifth Tenant context. Read, Archive, Copy, authentication and replay SHALL preserve the original source identity and payload-access lifetime and SHALL NOT create a request, enrollment or broader permission.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-6558a9766821b15e85c1"></a>

## Web Studio Human Identity And Scope Resolve Through Supabase And Phase 12

<!-- BEGIN CONTRACT {"id":"6558a9766821b15e85c1","name":"Web Studio Human Identity And Scope Resolve Through Supabase And Phase 12"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-aec45f7f27fdb2adfe52"></a>

## Registered Service Commands Are Narrower Than Human Authority

<!-- BEGIN CONTRACT {"id":"aec45f7f27fdb2adfe52","name":"Registered Service Commands Are Narrower Than Human Authority"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-ff4ce6b4558ae3584acc"></a>

## Identity, Tenant, And Role Resolve Server-Side

<!-- BEGIN CONTRACT {"id":"ff4ce6b4558ae3584acc","name":"Identity, Tenant, And Role Resolve Server-Side"} -->

The platform MUST establish a request's identity, tenant, and role server-side
from a validated session, and the client MUST NOT assert any of them. Protected
operations MUST require a validated Supabase session (the server validates the
user, not an unverified token or cookie claim), and the server MUST resolve the
acting profile, tenant, and role — including staff subrole and tenant
memberships — before running the operation.

The role model is a fixed set: donor, missionary, staff, admin, and
super_admin, with staff subroles (finance, mobilizer, development, HR, member
care) refining staff. Portal-routing aliases are presentation only and MUST NOT
be treated as authorization.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-029692d18ea3835deea8"></a>

## Phase 3 Projection Widening Requires A Distinct Human

<!-- BEGIN CONTRACT {"id":"029692d18ea3835deea8","name":"Phase 3 Projection Widening Requires A Distinct Human"} -->

Projection changes MUST be classified server-side as narrow, neutral or widen.
Narrowing and neutral changes MUST apply immediately with audit; widening MUST
remain pending with the old policy effective until a second distinct human
approves. Reusing the contribution correction maker-checker engine MUST enforce
separation of duties at human/profile identity, regardless of role switching or
the unresolved financial correction-approval mode. Ambiguous changes and moves
between incomparable donor/missionary surfaces MUST count as widening. Approval
MUST recheck the base fingerprint and server-owned editable-tuple allowlist;
stale or concurrent decisions MUST fail without publishing. Baseline policy
changes MUST require super-admin authority. Rollback MUST be classified as an
inverse edit and pass the same controls. Audit MUST contain identifiers and
policy metadata rather than rendered PII.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-af71db6fdfc6ab3f2f22"></a>

## Capability Aggregation Uses One Validated Context

<!-- BEGIN CONTRACT {"id":"af71db6fdfc6ab3f2f22","name":"Capability Aggregation Uses One Validated Context"} -->

The current Phase 3/12 authorization target MUST resolve capabilities within one server-validated Tenant Authorization Context for the request or deferred operation. The accepted Phase 12 D12/D14 and ship-first rules supersede earlier shorthand that unions every active membership held by a person. Membership-backed human requests MUST select one currently valid Active Tenant Assignment and aggregate only grant sources applicable to that context before applying the tenant, Legal Entity, purpose and other subtract-only floors. Staff, donor and missionary hats MUST NOT implicitly widen one another.

Public/anonymous contexts MUST remain pinned to their exact server-validated Site/public-resource projection and MUST NOT gain internal grants or enqueue tenant mutations. A single-Tenant NHI MUST remain bounded by its own grants intersected live with its required human owner’s current resolved capabilities. An operator MUST remain bounded by the exact audited, purpose-bound, time-boxed tenant grant. The common PDP MUST preserve these variants rather than manufacture a member assignment for every principal.

Deferred member work MUST serialize and re-resolve its validated assignment. Deferred NHI/operator work MUST serialize only its appropriate source context reference and re-prove current identity, owner ceiling or operator grant, scope, purpose and capability at fire time. A previous favorable publication, membership list or cached union MUST NOT substitute for current authority.

The Phase 3 early code-registry and read-only UI scope MUST remain distinct from Phase 12’s later generated capability tables and grant product. This target amendment MUST NOT be interpreted as a claim that those foundations are implemented, a backward whole-phase delivery dependency, or authority to invent private participant admission. Durable MVP implementation observations remain evidence of their recorded scope, not permission to implement the superseded union.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-86b5bcd7f124b502ad47"></a>

## Review Staff Editing Settings Operations And Adoption Use Separate Capabilities

<!-- BEGIN CONTRACT {"id":"86b5bcd7f124b502ad47","name":"Review Staff Editing Settings Operations And Adoption Use Separate Capabilities"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-b17832f6692565948454"></a>

## Sensitive Actions Enforce Capabilities Server-Side

<!-- BEGIN CONTRACT {"id":"b17832f6692565948454","name":"Sensitive Actions Enforce Capabilities Server-Side"} -->

Sensitive and high-risk actions MUST resolve fine-grained capabilities
server-side from the actor's role, staff subrole, and tenant memberships, and
MUST deny on mismatch; UI hiding MUST NOT be treated as sufficient protection.
Capability resolution MUST happen behind the server boundary, not in the
browser.

Today the platform enforces granular capabilities for sensitive contribution
actions (for example, refunds, corrections, approvals, and provider actions
resolve distinct capabilities) and gates automation management behind an
explicit manage permission. Broader Mission Control access is currently uniform
across staff subroles in the MVP posture, with per-subrole narrowing reserved as
forward work; the durable direction is least privilege per subrole.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-1b5c3c717cb6ed5ee0a6"></a>

## Phase 3 Role-scoped Access Uses One Projection Boundary

<!-- BEGIN CONTRACT {"id":"1b5c3c717cb6ed5ee0a6","name":"Phase 3 Role-scoped Access Uses One Projection Boundary"} -->

Phase 3 narrow-surface reads, writes and governed export MUST use one server-side,
subtract-only projection decision under the validated context above. Static
field policies MUST declare visibility, editability, exportability and sensitivity;
conditional ownership, relationship, anonymity, record-state and consent checks
MUST only remove access. Tenant remains the outer boundary. Financial records
MUST carry their exact immutable Legal Entity; missing, stale or out-of-scope
entity authority MUST fail closed before enumeration, counts, aggregation,
export or binding, with denied and absent rows indistinguishable. Site,
designation or a mutable Tenant default MUST NOT substitute for entity scope.

The Phase 3 typed capability registry MUST remain code-authoritative and its
capability/role inspection UI read-only. Capability tables, configurable grants,
tenant overrides and the full Phase 12 permission-management product MUST remain
deferred; dormant future seams MUST NOT change current decisions.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-c53c471a8dbcd1fa57d6"></a>

## Ministry Participation And Separately Owned Grants Are Independent And Revocable

<!-- BEGIN CONTRACT {"id":"c53c471a8dbcd1fa57d6","name":"Ministry Participation And Separately Owned Grants Are Independent And Revocable"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-fec38d5afad9f23ce175"></a>

## Public Preview Export Media And Diagnostics Have Separate Access Contracts

<!-- BEGIN CONTRACT {"id":"fec38d5afad9f23ce175","name":"Public Preview Export Media And Diagnostics Have Separate Access Contracts"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-ea962786dbc04401b437"></a>

## Phase 27 bounded source actions preserve current authority

<!-- BEGIN CONTRACT {"id":"ea962786dbc04401b437","name":"Phase 27 bounded source actions preserve current authority"} -->

P12 SHALL register exact Request preparation/submission/review decision/requirement administration/exception/reviewer reassignment/correction/presentation, P15 report/read/correct/routing and P9 shared create/read/history/correct/restrict capabilities. Ordinary edit or reviewer power does not waive required review or grant money authority. Source projection widening obeys ADR0211; routine eligible writes under a qualified policy do not require supervisory approval. Re-prove current human or service acting context, source classification and current recipient ceilings at execution and result recovery.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-02eb35fb111fae62bdbf"></a>

## Sensitive Operations And Secrets Stay Behind The Server Boundary

<!-- BEGIN CONTRACT {"id":"02eb35fb111fae62bdbf","name":"Sensitive Operations And Secrets Stay Behind The Server Boundary"} -->

Sensitive operations and secrets MUST stay behind the server-side boundary, as
required by `platform-boundaries`. Payments, money movement, record mutation,
refunds, and secret-bearing integrations MUST run through server-side contracts
in the shared data-access layer, and the privileged admin data client MUST fail
closed (denying the operation) when it is unavailable rather than proceeding
without it.

Tenant secrets — payment keys, webhook secrets, and vendor credentials — MUST
remain readable only server-side and MUST NOT reach the browser, logs, or route
responses.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-0230fbf26897d5fa3d4f"></a>

## Web Studio Capabilities Are Action-Specific And Independently Revocable

<!-- BEGIN CONTRACT {"id":"0230fbf26897d5fa3d4f","name":"Web Studio Capabilities Are Action-Specific And Independently Revocable"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-4de2fad90478b128abfe"></a>

## Active Editor Leases Coordinate Sessions Without Granting Authority

<!-- BEGIN CONTRACT {"id":"4de2fad90478b128abfe","name":"Active Editor Leases Coordinate Sessions Without Granting Authority"} -->

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

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->
