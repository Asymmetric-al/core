# public-ministry-pages normative contract clauses

A section is binding only when the matching requirement unconditionally references
it. A proposed or historical section does not become accepted by residing here.
The reference, requirement identity, scenarios, and normal source-authority rules
form one contract. Preserve all clauses; see openspec/contracts/README.md.

<!-- prettier-ignore-start -->

<a id="contract-a41a71efa05f5e45363d"></a>

## D13 Directories Use One Scoped Corpus With Bounded Family Views

<!-- BEGIN CONTRACT {"id":"a41a71efa05f5e45363d","name":"D13 Directories Use One Scoped Corpus With Bounded Family Views"} -->

The platform SHALL build one complete, generation-bound Public Ministry
Directory corpus for each exact Tenant × Legal Entity × environment × Site ×
locale scope from current Listed, Phase-10-admitted releases. A tenant MAY
present one combined directory with typed sections or separate Missionary and
Project/Campaign directory/search views, but those views SHALL be thin
projections over the same exact-scope corpus. No directory query, cursor, cache,
count, or fallback SHALL read a sibling Site or locale corpus. Search SHALL use
bounded public fields, stable ordering, and keyset pagination; it SHALL NOT query
operational tables or infer hidden subjects. Ordering and filtering SHALL be
deterministic and code-owned, use only public-safe fields, and SHALL NOT use
popularity, financial amount or progress, Giving readiness, fundraising urgency,
engagement or supporter counts, hidden-result counts, distance, maps, exact
coordinates, or inferred sensitivity. Hidden entries SHALL NOT affect presented
counts, facets, or ordering.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-d936bf888dfe379adaa0"></a>

## D8 Routes And Lifecycle Dispositions Are Source-Qualified

<!-- BEGIN CONTRACT {"id":"d936bf888dfe379adaa0","name":"D8 Routes And Lifecycle Dispositions Are Source-Qualified"} -->

Every Page route SHALL be unique within its exact Site and locale and SHALL have
one immutable current disposition deliberately selected by an authorized actor
from the finite outcomes constrained by current Page, subject, reach, safety,
and Giving truth. Source facts MAY open a disposition case but SHALL NOT choose
its result. Supported outcomes SHALL be current serve, bounded notice, same-Page
successor redirect, or not found. Permanent redirects SHALL be limited to
eligible Listed Pages and SHALL NOT redirect a departed subject's gifts to
another fund by inference. A method-preserving `308` SHALL be issued only for
navigation-safe `GET`/`HEAD`; other methods SHALL be rejected.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-a496ebfde0d022bf8d2f"></a>

## D25 Editorial Actionability Is Cause-Gated And Recovery Is Bounded

<!-- BEGIN CONTRACT {"id":"a496ebfde0d022bf8d2f","name":"D25 Editorial Actionability Is Cause-Gated And Recovery Is Bounded"} -->

Editorial actionability SHALL be derived at request time from current revision,
candidate, release, dependency, permission, and safety facts rather than a
durable workflow-state machine. The editor MAY keep one coalesced private scratch
buffer per Page and locale below the expected semantic head, using a short
debounce and bounded maximum delay. Autosave SHALL NOT create an immutable
semantic revision, advance the semantic head, or emit per-keystroke audit/outbox
facts. Recovery or deliberate Save SHALL create or rebase an immutable successor
through current authorization and CAS; cleanup SHALL delete only content proven
unreferenced. A dependency MAY block Approve/Release while independently
authorized View submission, Request changes, terminal Reject, Withdraw, or D24
Edit remains available; a candidate SHALL NOT gain a generic `stale` state.
Withdraw SHALL be an append-only, release-neutral, immutable D1/D4/D5
occurrence; it SHALL NOT delete the candidate or its evidence and SHALL NOT
unpublish a live release.
The recovery buffer SHALL use a trailing two-second dirty-aware debounce, a
15-second maximum wait, explicit `Save draft`, safe navigation/editor-handoff
flush, digest no-op suppression, one in-flight write per exact generation, and
late-write fencing. It SHALL create no actor branch or product head. Blind
native version pruning SHALL be disabled for governed Page collections;
cleanup MAY reclaim only reference-proved scratch or inert prepares after
authoritative recheck, while ambiguous reference closure SHALL preserve the
item and open a private operational exception. `Review saved changes` and `Use
as starting point` SHALL create a newly attributed same-Page, same-locale,
same-family, same-subject successor from the current head; they SHALL NOT
restore, rewind, merge, submit, publish, or revive former authorization.
Before constructing that successor, the recovery command SHALL revalidate every
current D3/D20 semantic target, D9 media reference, D17 subject, Phase 9/D19
association lifecycle fact, Phase 10 safety result, and Phase 12 authorization.
Removed, withdrawn, incompatible, or unsafe fields and media SHALL NOT be
silently copied into the successor; the UI SHALL identify the affected material
and current owner consequence without leaking protected content.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-689210b4e99d7a0564d4"></a>

## D23 Setup And Settings Is One Derived Scope-First Workspace

<!-- BEGIN CONTRACT {"id":"689210b4e99d7a0564d4","name":"D23 Setup And Settings Is One Derived Scope-First Workspace"} -->

The platform SHALL provide one quiet Public Page setup/settings workspace derived
from current source-owned profile versions and exact scope. Initial setup SHALL
ask only `Who can find new Missionary pages?`, `Who can find new Project pages?`,
and `Should staff review contributor changes?`; missing reach means `Not public`
and missing review posture means review required, both labelled as safe fallbacks
rather than tenant choices. Built-in D3 profiles remain available without
another setup decision, and optional capabilities stay Off/collapsed. Ongoing
settings SHALL use exactly `Visibility and publishing`, `Page appearance and
discovery`, `Optional features`, and `Chosen on each page`, with current state,
owner, consequence preview, and effective timing. D7, D8, D9, D14, D17, D18,
D19, D21, and D22 SHALL remain per-item, automatic, or separately owned rather
than D23 settings. Each save SHALL invoke the owning contract with CAS and
reproof; the workspace SHALL NOT store a second settings truth or expose
unsupported combinations.
Missing D2 reach SHALL be labelled `Safe fallback — not yet chosen: Not public`,
missing D4 posture SHALL be labelled `Safe fallback — not yet chosen: Review
before publishing`, and missing D12 posture SHALL be labelled `Safe fallback —
not yet chosen: Responses off`; none SHALL be represented as an organization-
selected value.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-2491499e949054920391"></a>

## D1 Typed Public Page Families Share One Publication Contract

<!-- BEGIN CONTRACT {"id":"2491499e949054920391","name":"D1 Typed Public Page Families Share One Publication Contract"} -->

The platform SHALL provide exactly two public Page families, Missionary Ministry
and Project/Campaign, under one tenant-owned publication contract. A Missionary
Ministry Page SHALL reference one exact current Phase 9 CRM Ministry Assignment
as its operational subject; a Project/Campaign Page SHALL reference one exact
D17-qualified operational subject. A Party, user, Participant Membership,
contributor, display participant, Designation, fund, Support Assignment, or CMS
copy SHALL NOT substitute for the family-qualified subject. Each authorized
contributor SHALL act through their own identity and an explicit organization
assignment. Autosave SHALL update only one coalesced non-semantic scratch buffer
beneath the expected Page-and-locale head and current editor lease. A deliberate
semantic save or final intent SHALL create or advance the private immutable
revision lineage; no scratch write or contributor edit is itself public truth.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-581743578776cdad2218"></a>

## D6 Public Support Progress Is Typed Source-Authoritative And Optional Per Page

<!-- BEGIN CONTRACT {"id":"581743578776cdad2218","name":"D6 Public Support Progress Is Typed Source-Authoritative And Optional Per Page"} -->

Each Page release SHALL pin one immutable, prospective Public Support Progress
Profile Version selecting `Hidden` or exactly one compatible, source-certified
progress presentation. Supported types SHALL distinguish sustained monthly
support from bounded project/campaign goals. A change to visibility, metric,
goal, currency, period, formula, or scope SHALL create an ordinary D4/D5
candidate and D2 successor Page release and SHALL NOT mutate the profile beneath
an existing release. Tenant or family defaults MAY seed private drafts but SHALL
NOT remain in live resolution. Only source-owned numeric facts and watermarks MAY
refresh a compatible released projection without editorial republishing. The
owning financial phases SHALL remain authoritative; Phase 21 Field Account,
availability, and payment facts SHALL NOT become public-progress inputs or
fallbacks. Phase 22 SHALL render only an approved public projection with exact
currency, definition, through-date, coverage, and freshness.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-329e6bde97168629dba2"></a>

## D20 Family Semantics Use Two Small Code-Owned Catalogs

<!-- BEGIN CONTRACT {"id":"329e6bde97168629dba2","name":"D20 Family Semantics Use Two Small Code-Owned Catalogs"} -->

The platform SHALL maintain exactly two small code-owned semantic block
catalogs, one for Missionary Pages and one for Project/Campaign Pages. Each entry
SHALL define stable semantic identity, compatible content shape, public behavior,
accessibility contract, and migration compatibility. D3 profile versions SHALL
select bounded roles, order, and editability from those catalogs. Optional
editorial sections SHALL be exactly `Off`, `Available`, or `Expected`;
`Expected` is private completeness guidance and SHALL NOT fabricate a public
empty section. Managed operational fields SHALL remain read-only and arbitrary
tenant block types or embedded code SHALL be unavailable.

The Missionary launch catalog SHALL contain managed public identity; optional
Introduction, Our ministry story, Ministry focus, and How you can pray; D9
media; optional D6 Support progress; one required D7-managed Give semantic role;
one bounded D11 Ministry Updates feed; and locked organization stewardship,
disclosure, and help. The Project/Campaign launch catalog SHALL contain one
managed D17 kind-qualified public subject identity for a CRM Ministry Project,
Giving Campaign, or eligible Designation; optional Project summary, The need,
What this project will do, and prospective Expected impact; D9 media; optional
D6 Project progress; one required D7-managed Give semantic role; one D11
Updates feed selected by D3's Page-scoped Feed Binding and exact subject/purpose
scope; and locked organization stewardship, disclosure, and help. A source-
kind-incompatible identity field or feed SHALL be unavailable and SHALL NOT be
fabricated, inferred, or relabelled as project truth.
For either family, contributors SHALL receive one quiet authoring experience
organized as `Basics`, `Story`, `Media`, `Support & giving`, and `Updates`.
Those groups SHALL expose only compatible tenant-enabled roles and SHALL NOT
become tenant-authored schema, layout, permission, or publication controls.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-69dc1dc4688ce9ef5d62"></a>

## D7 Every Page Has Exactly One Phase-13 Designation

<!-- BEGIN CONTRACT {"id":"69dc1dc4688ce9ef5d62","name":"D7 Every Page Has Exactly One Phase-13 Designation"} -->

For the MVP, every released Page SHALL pin one immutable Page Giving Binding to
exactly one eligible Phase 13 Designation; an incomplete draft MAY exist but
SHALL NOT release. Replacing that Designation SHALL be a prospective
staff-controlled Page change through the ordinary candidate and successor-
release path and SHALL NOT mutate the binding beneath an existing release. Every
Page Give action SHALL use the release-pinned binding and SHALL preserve the
exact Site, source code, locale, currency choice, Page, release, and Designation
context through the Phase 5 checkout handoff. Phase 13 SHALL re-prove
eligibility before cart and provider effects. A tenant MAY provide one
separately labelled general-giving link, but it SHALL carry no inherited Page
destination, amount, cadence, or attribution and SHALL NOT act as a fallback or
substitution.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-3ff708c901de3b0f5597"></a>

## D3 Presentation Profiles Are Versioned Site-And-Family Contracts

<!-- BEGIN CONTRACT {"id":"3ff708c901de3b0f5597","name":"D3 Presentation Profiles Are Versioned Site-And-Family Contracts"} -->

The platform SHALL provide one current versioned Public Page Presentation
Profile per exact Tenant × Legal Entity × environment × Site × Page Family.
Missionary and Project/Campaign Pages MAY use different layouts, but all current
Pages and locale releases in one exact-scope Site-family cohort SHALL conform to
its profile. A profile from another environment or sibling scope SHALL NOT be
consulted or activated as fallback. Layouts SHALL use bounded typed blocks,
including a bounded Ministry Updates placement, and SHALL NOT allow arbitrary
code, per-Page layout forks, or locale-specific layout forks. D3 SHALL own one
immutable, exact Page-scoped Feed Binding that selects the Ministry Update source
and purpose set the Page may present. D11 SHALL consume that binding and SHALL
NOT recreate, infer, or substitute it; display or contributor membership SHALL
NOT supply it.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-d0610e893e0f992a3a51"></a>

## D9 Public Media Is Sanitized Certified And Release-Bound

<!-- BEGIN CONTRACT {"id":"d0610e893e0f992a3a51","name":"D9 Public Media Is Sanitized Certified And Release-Bound"} -->

All Public Ministry Media SHALL pass from private tenant-scoped intake through
type verification, safety processing, metadata removal, re-encoding, and
certified derivatives before a placement can be pinned to a release. Every
immutable placement version SHALL also pin its semantic role, crop/focal point,
contextual alternative text or explicit decorative decision, caption and
attribution where applicable, and exact certified master and derivative
manifest. Alternative text belongs to the placement rather than the reusable
asset; asset-global or filename-derived text SHALL NOT substitute for contextual
meaning. Public URLs, response headers, and downloads SHALL use opaque names and
SHALL never expose the original filename, private object key, embedded metadata,
or origin asset. Launch SHALL accept JPEG, PNG, and still WebP only; video, audio,
documents, SVG, animation, and multi-image inputs SHALL be unavailable. Raw
intake SHALL expire on a bounded schedule, and the source filename SHALL be
discarded from operational/public records once an internal job identity exists.
Phase 29 SHALL own private byte custody, scanning, transformation execution,
copy inventory, retention, holds, disposal, and authorized byte delivery; Phase
22 owns public meaning, placement, release eligibility, and withdrawal.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-d7dfb400eed3c24f02e4"></a>

## D18 Current Serving Is Release-Bound Freshness-Classified And Adverse-First

<!-- BEGIN CONTRACT {"id":"d7dfb400eed3c24f02e4","name":"D18 Current Serving Is Release-Bound Freshness-Classified And Adverse-First"} -->

Phase 5 SHALL execute public requests while Phase 22 supplies the exact current
Page presentation semantics. Before any cache read, D18 SHALL resolve the exact
route, locale release, D27 family-profile activation, D2/Phase-10 admission, and
current adverse controls. Cache identities SHALL include the immutable release
and composite presentation generation. Positive propagation MAY be classified
by bounded freshness states; adverse change SHALL deny or reduce serving first,
without stale-if-error or optimistic fallback.
Each owner-labelled adverse cause SHALL transactionally create one append-only,
exact-scope convergence operation referencing the owning disposition and
carrying desired generation, input digest, idempotency identity, controlled-
surface coverage, deadline, fenced attempts, and residual-only recovery.
`Expiration requested`, `Provider accepted`, `Controlled response observed`,
`Not verifiable`, and `External observation` SHALL remain separate facts; none
alone proves complete convergence. Contributor status SHALL remain only
`Public`, `Updating`, or `Not public`, while staff see `Visitor access stopped -
cleanup continuing` or `Needs attention` only for a missed deadline or
actionable owner cause. `Purge`, `Force live`, and `Mark fixed` SHALL NOT become
release, serving, or convergence authority.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-19d1357b4ad70eb5e838"></a>

## D27 Locale Releases Compose Under One Atomic Site-Family Profile Head

<!-- BEGIN CONTRACT {"id":"19d1357b4ad70eb5e838","name":"D27 Locale Releases Compose Under One Atomic Site-Family Profile Head"} -->

A Page identity SHALL be Site, Page Family, and exact subject, not locale. Each
supported locale SHALL have an independent immutable revision and release
lineage, and requests SHALL require an exact current locale release with no prose
fallback. Each exact Tenant × Legal Entity × environment × Site × Page Family
SHALL have exactly one current D3 Presentation Profile head. Activating a
successor profile SHALL prove compatibility against the complete current locale-
release cohort and SHALL atomically CAS one activation generation fenced by scope
epoch and release-head-set digest. D27 SHALL govern
over every older Phase 22 exception that could imply Page- or locale-specific
layout versions.
Authoring SHALL distinguish `Page design — all languages` from `Content — this
language`; contributors SHALL see tenant-managed structure as `Set by your
organization`, and a single-locale Site SHALL hide unnecessary locale machinery.
`Start from existing language` MAY seed a private target-locale draft with exact
provenance, but it SHALL NOT translate or release content and the target locale
SHALL complete its own Phase 24, D16 where applicable, D26, D4/D5, and D2 path.
Historical presentation reconstruction SHALL resolve both the exact D2 locale
release and D3 family activation effective at the observation time. Old proved
generations SHALL remain available for that reconstruction and append-only
reactivation; destructive rollback and mutable `latest` resolution are
prohibited.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-3e22c2e1cccda1c53928"></a>

## D17 Every Project Page Has One Exact Typed Source Subject

<!-- BEGIN CONTRACT {"id":"3e22c2e1cccda1c53928","name":"D17 Every Project Page Has One Exact Typed Source Subject"} -->

Each Project/Campaign Page SHALL bind exactly one source-qualified subject of a
code-owned supported kind: canonical CRM Ministry Project, Phase 13 Giving
Campaign, or separately eligible Phase 13 Designation presented as `Fund or
designated purpose`. The binding SHALL use structural kind-matched same-scope
references and a privacy-safe subject snapshot pinned to each release. Subject,
Giving binding, progress, contributors, reach, route, media, Updates, discovery,
and search/share SHALL remain independently authoritative.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-398655323075824bc6e0"></a>

## D10 Preview Requires Current Authenticated Exact-Version Authority

<!-- BEGIN CONTRACT {"id":"398655323075824bc6e0","name":"D10 Preview Requires Current Authenticated Exact-Version Authority"} -->

Preview SHALL be available only to a currently authenticated actor authorized
for the exact tenant, Site, Page or canonical Ministry Update, locale, immutable
revision or candidate, and selected audience projection where applicable. An
Update preview SHALL bind one exact canonical Update candidate and one
deliberately selected public or supporter audience projection; every request
SHALL re-prove current D11, Phase 12, and Phase 10 authority for that audience.
Every request, including assets and nested data, SHALL re-prove authority.
Preview responses SHALL be private, no-store, non-indexable, non-archivable, and
referrer-suppressed, SHALL disable consequential public actions, and SHALL NOT
rely on bearer URLs, shared secrets, or copied production pages.
Each successful document or governed-asset preview request SHALL append
privacy-minimized access evidence with the actual actor and principal, Tenant,
Legal Entity, environment, Site, exact Page or canonical Update, locale,
immutable candidate or revision, audience and resource kind where applicable,
authorization/grant epoch, outcome, server time, and opaque correlation. The
evidence SHALL NOT copy content, filename, URL, token, IP address, or user agent.
Nested requests MAY be boundedly coalesced only when the evidence still proves
every governed resource kind accessed; every byte request SHALL still reauthorize.
An access-evidence write failure SHALL fail the governed preview request closed.
Preview SHALL remain pinned to the requested coherently saved Revision or exact
submitted candidate when newer work is saved. It SHALL NOT silently follow a
mutable working head, latest Revision, live release, or provider fallback; a
newer-version notice MAY offer a deliberate action to open that different exact
version.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-0d6e00604e0a95f28551"></a>

## D21 Public Surface Adoption Uses One Complete Authority Cutover

<!-- BEGIN CONTRACT {"id":"0d6e00604e0a95f28551","name":"D21 Public Surface Adoption Uses One Complete Authority Cutover"} -->

Migration from the legacy public ministry surface SHALL prepare Pages
incrementally in private, but SHALL switch public reader authority only for one
complete exact Tenant, Legal Entity, environment, Site, immutable enumerated
verified-host membership generation and digest, and locale cohort. A hostname,
wildcard, request header, deployment domain, previously verified host, or mutable
`all current hosts` query SHALL NOT define or widen the cohort. Preparation SHALL
be chunked, resumable, non-authoritative, and
backed by a complete source/disposition manifest and production-shaped shadow.
One idempotent CAS cutover SHALL transfer Phase 5/D18 authority; there SHALL be no
mixed production reader, dual write, destructive rollback, or legacy fallback.
The cohort SHALL close over shared route maps, directory/search projections,
sitemaps, canonical and alternate-locale graphs, cache generations, and every
other Controlled Public Surface. A shared artifact MAY cross the cohort boundary
only with an atomically selectable generation-pinned partition; otherwise every
dependent case SHALL participate in one coordinated CAS over the shared
authority head. Adoption Plan Versions and Coverage Manifests SHALL be immutable
successors selected by stable identifier and digest; correction SHALL never
mutate a selected record or float to `latest`.
Final cutover SHALL compare the pinned verified-host membership generation and
digest to the current Phase 2/24 owner head inside the CAS and SHALL abort without
public effect when any host was added, removed, transferred, canonicalized, or
reverified after preparation.

A `Compatible Legacy Page Release` MAY be selected only once before cutover
when a certified family-qualified generation-pinned adapter normalizes proved-
safe legacy editorial content into one immutable D2 release DTO. Its manifest
SHALL pin the D20 catalog, D3 profile, compatibility renderer, content, locale,
brand, managed references, and owner generations; public requests SHALL never
read mutable legacy or raw Payload data. Unknown or unmappable semantics SHALL
not qualify, no new compatible-legacy release may be created after cutover, and
the next editorial change SHALL use an ordinary current-catalog successor.
D21 SHALL NOT create migration-specific Page lifecycle or editorial states.
Ordinary D5 and D18 labels remain authoritative. Staff adoption readiness SHALL
be a disposable projection using only `Ready to use`, `Needs a decision`, and
`Not moving as a current ministry page`; the last label SHALL name its exact D8
redirect, transition, terminal, private-preservation, or retirement outcome.
Cutover receipts MAY say `Could not start — current site still in use`, `Started
— public copies updating`, or `Started — prepared pages in use`, but SHALL NOT
become Page state or use `Live` as D21 truth.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-71ace46da81974687c52"></a>

## D11 Ministry Updates Have One Canonical Version And Audience-Scoped Releases

<!-- BEGIN CONTRACT {"id":"71ace46da81974687c52","name":"D11 Ministry Updates Have One Canonical Version And Audience-Scoped Releases"} -->

The platform SHALL maintain one canonical immutable Ministry Update lineage and
SHALL derive exact audience-scoped release projections from it. Public and
authenticated-supporter projections SHALL be independently admitted and MAY be
placed on more than one eligible Page without copying the Update. Mixed release
outcomes SHALL preserve every successful audience head and every failed
audience's prior-good head, and recovery SHALL retry only residual work without
rolling back or replaying a successful audience. Corrections and withdrawals
SHALL be append-only; prior audience access SHALL NOT imply current access. Every
Page feed SHALL use one exact same-scope D3 Feed Binding
to an authorized canonical source and purpose set. Subject, contributor,
display, spouse/team, Support Assignment, Designation, or Page proximity SHALL
NOT infer Update membership; a Project feed SHALL require the exact canonical
project/purpose binding. The prior product label `My Feed` MAY remain as a
migration, search, and help alias for Ministry Updates but MUST NOT create a
second feed, route, release, audience, or copied-post authority.

When one deliberately authored version is independently safe for both selected
audiences, both projections MAY reference it. When supporter-protected detail
makes that copy unsafe for the public audience, however, a public projection
SHALL advance only from a deliberately authored and, where configured,
reviewed public-safe variant in the same canonical Revision. Mechanical
redaction, truncation, omission, summarization, translation, or AI
transformation SHALL NOT manufacture that variant. A missing or failed
public-safe variant SHALL leave only the public projection unchanged or absent
and SHALL NOT block an independently eligible supporter projection.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-893c9d2924f630655111"></a>

## D22 Public Pages Operations Is Quiet Derived And Cause-Owned

<!-- BEGIN CONTRACT {"id":"893c9d2924f630655111","name":"D22 Public Pages Operations Is Quiet Derived And Cause-Owned"} -->

Mission Control SHALL provide one disposable Public Pages workspace with `To
review`, `Needs attention`, and `All pages` for one exact owner-resolved Tenant ×
Legal Entity × environment × Site × locale scope. Current authorization and that
scope SHALL be applied before enumerating rows, grouping causes, counting,
searching, exporting, notifying, linking, badging, subscribing through Realtime,
or caching. It SHALL derive rows and counts from a finite, code-owned, versioned
registry covering every D1–D21 owner contract.
For each owner and compatible version, the registry SHALL contain either a
privacy-safe owner-condition/action adapter or an explicit source-owned `not
participating`, `Off`, or `unavailable` coverage disposition. Missing, stale,
unsupported, contradictory, or partial adapter coverage SHALL produce an honest
`Partial` or `Unavailable` coverage state and SHALL NOT become zero, healthy,
resolved, or a guessed tenant action. D22 SHALL read no raw owner tables or
duplicate owner status logic. It SHALL coalesce shared causes; identify impact,
owner, and next action; and remain quiet when no action is required. It SHALL NOT
become a task system, health authority, workflow status table, or leak restricted
identities through counts.
An authorized administrative audit export SHALL use a versioned machine-readable
schema and preserve stable opaque IDs, immutable lineage, exact scope, source
owner, version, provenance, coverage time, and dispositions for Pages, releases,
routes, assignments, and selected and effective profile references. Export SHALL
be privacy-filtered at request and execution time, SHALL NOT read raw owner
tables, and SHALL NOT be represented as an infrastructure backup or proof that
external custody, migration, or deletion completed.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-54f4f6bd92c742684b1f"></a>

## D26 Content-Sharing Attestation Is One Calm Candidate-Bound Confirmation

<!-- BEGIN CONTRACT {"id":"54f4f6bd92c742684b1f","name":"D26 Content-Sharing Attestation Is One Calm Candidate-Bound Confirmation"} -->

At the consequential Submit or Publish action, the current actor SHALL make one
calm confirmation using a code-owned candidate-kind and audience-accurate
action-adjacent statement. A Page SHALL use `By submitting, you confirm you’re
allowed to share the words and images on this page publicly.` or `By publishing,
you confirm you’re allowed to share the words and images on this page publicly.`
An Update with `Public page` SHALL use the equivalent `in this update publicly`
statement; an Update with `Supporters` SHALL use the equivalent `in this update
with authorized supporters` statement; and an Update with `Public page and
supporters` SHALL use the equivalent `in this update publicly and with
authorized supporters` statement.
The evidence SHALL bind the
exact Page or independently released Ministry Update candidate digest, selected
audience, scope, actor, and action atomically, without a persistent checkbox,
modal, preference, or separate attestation table exposed to users. Reviewer
approval of an unchanged candidate SHALL retain the submitter's evidence and
create no new attestation. Except for the one D21 compatible-legacy release
preserved without creating a new editorial candidate, reused, imported, cloned,
translated, or materially changed content SHALL become an ordinary attributed
successor candidate and require the current actor's new Submit/Publish
confirmation. The compatible-legacy release SHALL record missing historical
evidence as `not captured`, SHALL NOT mint a new attestation, and SHALL NOT
satisfy the first successor candidate's confirmation. Any staff-authored
successor SHALL additionally follow D24; a non-staff successor remains in D1.
Only material staff supersession triggers D24's bounded contributor-visible
reason.
Preserved earlier attestation remains provenance history and SHALL NOT satisfy the
successor's confirmation.
Attestation SHALL NOT waive Phase 10 or make Asym authoritative for underlying
rights.
Image selection SHALL say `Use a photo you're allowed to share. We remove hidden
location and file details before it appears publicly.` and MAY progressively
disclose `Photo sharing tips` for recognizable people, children, precise
locations, and personal details. This helper SHALL NOT claim that upload or D9
sanitization proves permission.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-0514f802aefecd562038"></a>

## D15 Measurement Is First-Party Bounded And Non-Authoritative

<!-- BEGIN CONTRACT {"id":"0514f802aefecd562038","name":"D15 Measurement Is First-Party Bounded And Non-Authoritative"} -->

For each exact Tenant × Legal Entity × Site, the platform SHALL maintain one
prospective versioned Public Ministry Measurement Profile whose persisted
initial state is `Off` and whose current value is exactly `Off`, `Staff only`, or
`Staff + current assigned Page contributors`. Occurrence admission SHALL resolve
only that exact profile and SHALL record nothing while it is Off, missing, stale,
incompatible, ambiguous, or unauthorized. Measurement SHALL record exactly qualified
visible Page loads, full Ministry Update opens, Share-menu opens, and Give-CTA
selections through best-effort POSTs that never block visitor or giving
behavior. It SHALL NOT identify unique people, infer conversions, or ingest raw
request identity. Ephemeral occurrences and idempotency material SHALL expire
within 24 hours; sealed daily aggregates SHALL use append-only corrections and a
code-owned 24-month retention. Changing one Site's profile SHALL NOT authorize
collection for another Legal Entity or Site, and every admitted occurrence and
aggregate SHALL pin the exact profile version.
Production collection SHALL remain blocked until the exact Site presents its
truthful current measurement notice and the applicable owner-authorized simple
objection or stricter consent path is current and honored or satisfied for the
occurrence where required. Missing, stale, or unsatisfied proof SHALL admit no
occurrence. D15 SHALL NOT infer which path applies from geography or treat a
saved profile as sufficient collection authority.
The fixed report SHALL be titled `Public page activity`, use `Aggregate activity
for your public pages and ministry updates`, label the four metrics `Qualified
page loads`, `Full update opens`, `Share options opened`, and `Give button
selected`, and offer only complete-day 7/30/90-day presets. It SHALL include
fixed definitions, an equivalent accessible HTML table, `Data complete through
[date]`, and honest `Complete`, `Delayed`, `Partial`, `Unavailable`, numerical,
or `Not enough activity to show safely` results. Coverage and suppression SHALL
NOT be conveyed by color alone.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-23d1ad26bea31e310400"></a>

## D19 Ministry Assignments Separate Association Editing Display And Support Access

<!-- BEGIN CONTRACT {"id":"23d1ad26bea31e310400","name":"D19 Ministry Assignments Separate Association Editing Display And Support Access"} -->

Phase 9 SHALL own bounded Ministry Assignments and Participant Memberships that
associate exact people with one ministry subject. D1 Public Page Contributor
Assignments, public Display Participants, notification choices, Phase 21's
optional same-scope zero-or-one current one-to-one/non-overlapping Support
Binding, and Phase 12 support-projection grants SHALL remain separate
prospective facts under their own authorities. A spouse, teammate, leader,
employment record, shared name, household, public appearance, participant
membership, or one grant SHALL NOT imply another. Private reads SHALL use coarse
tenant RLS plus a server policy-decision boundary with current Phase 12 and
owning-phase purpose authorization.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-dfceab048f4b1753738c"></a>

## D14 Search And Social Presentation Is Release-Bound

<!-- BEGIN CONTRACT {"id":"dfceab048f4b1753738c","name":"D14 Search And Social Presentation Is Release-Bound"} -->

For each current eligible release, the platform SHALL compile one immutable D14
manifest containing distinct, non-interchangeable bounded Search Presentation
and Share Presentation outputs. Search SHALL carry canonical URL, robots
directive, sitemap eligibility, safe structured data, title, and description;
Share SHALL carry only the release-exact safe social metadata and media allowed
for deliberate sharing. Listed content SHALL be indexable and shareable;
Shared-by-link content MAY be
shareable but SHALL be noindex and absent from discovery; Not-public and
restricted content SHALL expose no public share projection. Ministry Update
public URLs SHALL use one opaque permalink per canonical Update, Site, and
locale rather than sensitive titles or names. Complete current safe placement
coverage SHALL make that permalink Listed when any admitted placement is
Listed, public but noindex when every admitted placement is Shared-by-link, and
absent when no admitted public placement remains.
Structured data SHALL be emitted only by a code-owned visible-fact allowlist:
`WebPage` and an eligible `BreadcrumbList` by default; `ProfilePage`/`Person`
only when the exact release truthfully represents one genuinely public-safe
person; and `Article`/`BlogPosting` only for an eligible public Ministry Update
permalink. Arbitrary JSON-LD, generic `Person` injection, `SearchAction`,
`DonateAction`, and invented claims SHALL be prohibited. A reciprocal locale
alternate SHALL bind the exact verified host, Site, Page or Update, and locale
releases and SHALL be emitted only when both coherent D2/D3 composites are
current, independently eligible for D14 Search Presentation—and therefore
currently Listed under D2 and Phase 10—self-inclusive, and mutually admitted;
missing, stale, unsafe, unlisted, or one-way locale truth SHALL be omitted rather
than inherited or synthesized.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-94fc5bb9e3ff4cfd3157"></a>

## D16 Writing Assistance Is Source-Bounded Suggestion-Only And Tenant-Off

<!-- BEGIN CONTRACT {"id":"94fc5bb9e3ff4cfd3157","name":"D16 Writing Assistance Is Source-Bounded Suggestion-Only And Tenant-Off"} -->

Public Page writing assistance SHALL be off by default and SHALL run only when
an authorized author explicitly selects bounded source text and one closed,
code-owned action: Start from guided answers, Fix spelling & grammar, Improve
clarity, Shorten, Add detail only from explicitly selected or newly supplied
facts, one of three certified neutral tones, one length-bounded same-source
instruction under More, or Translate to English for an independently certified
source-language to exact existing Phase-24 English BCP 47 locale pair.
Suggestions SHALL be private and short-lived, SHALL NOT retrieve unselected
operational or supporter data, and SHALL require compare-before-apply to create
an ordinary successor revision. Translation SHALL NOT create an English locale,
variant, route, translation status, fallback, or release. It SHALL use `Use
English draft` and display `Check this translation. AI translation can make
mistakes or miss context. Review this English draft carefully before using it.`
The adjacent expandable review detail SHALL cover names, dates, numbers,
quotations, Scripture, ministry terms, relationships, cultural meaning, fluent
review for important content, and `This is not a certified translation.`
Before translation egress the platform SHALL name the exact certified source
and English BCP 47 target locales, prefer Phase-24-owned source-locale truth,
require the actor to confirm provider detection, and require materially mixed-
language ranges to be separated or explicitly confirmed. Translation SHALL NOT
simultaneously rewrite, shorten, change tone, localize dates, amounts,
currencies or units, persuade, or add facts.
Each valid attempt SHALL create at most one typed, encrypted, non-authoritative
suggestion whose body expires within 24 hours or sooner when the actor chooses
Use or Discard, the exact source is superseded, or relevant authority is
revoked. Expiration SHALL NOT alter the author's ordinary saved revision or
create a release, workflow, or publication fact.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-3f5217b4855e51bb0909"></a>

## D4 Review And Release Profiles Govern Final Intent

<!-- BEGIN CONTRACT {"id":"3f5217b4855e51bb0909","name":"D4 Review And Release Profiles Govern Final Intent"} -->

The platform SHALL maintain one prospective, immutable Review and Release
Profile lineage with at most one current head for each exact Tenant × Legal
Entity × environment × Site × Page Family × publication-path scope. The current
version SHALL select either `Review before publishing` or `Publish after checks`.
Private autosave SHALL remain outside release state;
a final intent SHALL freeze one exact candidate revision together with its
complete dependency and public-egress manifest, and SHALL run the same
safety, permission, dependency, and CAS checks in either mode. A missing, stale,
incompatible, ambiguous, or unauthorized exact-scope profile SHALL use the
disclosed `Review before publishing` fallback and SHALL NOT consult or inherit a
tenant-global or sibling Legal Entity, Site, Page Family, or publication path.

Absent a deliberate tenant D4 choice, the disclosed safe fallback SHALL be
`Review before publishing`. One organization choice MAY be progressively
customized only for the Missionary Page, Project/Campaign Page, and Ministry
Update publication paths the tenant actually uses.

A later Review and Release Profile successor SHALL apply prospectively. A
more restrictive current posture SHALL stop queued automatic release at
execution-time policy reproof. A less restrictive posture SHALL NOT publish or
reinterpret an existing review backlog. Authorized staff MAY decide an already-
waiting candidate under its pinned review profile, or the contributor MAY
explicitly submit a new candidate under the new profile. A prospective profile
successor alone SHALL NOT invalidate manual review; current authority, safety,
expected heads, profile/renderer compatibility and required dependency proof
SHALL still be re-proved.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-e7171b50748ff326a471"></a>

## D24 Staff Revisions Preserve Attribution Without A Second Workflow

<!-- BEGIN CONTRACT {"id":"e7171b50748ff326a471","name":"D24 Staff Revisions Preserve Attribution Without A Second Workflow"} -->

Authorized staff MAY create ordinary immutable Page successor revisions through
the same D1 editorial lineage used by contributors. Staff edit authority SHALL
be independent from D5 review and release authority. Deriving a revision from
active or submitted contributor work SHALL preserve its exact revision, author,
available candidate and attestation evidence, and exact diff; a bounded staff
reason SHALL be required only when staff materially supersede active or submitted
contributor work. That reason SHALL be short, notification-safe, and visible to
the contributor.
Preserved prior attestation evidence SHALL remain provenance history only and
SHALL NOT satisfy the successor candidate. When the successor is submitted or
published, D26 SHALL atomically record the current actor's new confirmation.
D24 MAY emit one privacy-minimized idempotent occurrence only after committed
material supersession or a genuine conflict. Existing D5 request-for-action and
D2/D4/D5 release occurrences SHALL be reused rather than duplicated; Phase 6
retains recipient and delivery authority, and Phase 17 retains governed message
content authority.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-5dea6123e0b97b062f4b"></a>

## D2 Publication Reach Is Tenant-Defaulted And Phase-10-Ceiling-Resolved

<!-- BEGIN CONTRACT {"id":"5dea6123e0b97b062f4b","name":"D2 Publication Reach Is Tenant-Defaulted And Phase-10-Ceiling-Resolved"} -->

The platform SHALL maintain a prospective immutable Publication Reach Profile
Version lineage for each exact Tenant × Legal Entity × Site × typed Page Family,
with at most one current saved head. Each Page-locale release SHALL immutably pin
one requested reach of `Not public`, `Shared by link — public`, or `Listed
publicly`, derived only from that exact-scope head or an authorized same-scope
Page request, and one separately computed release-time effective reach after the
Phase 10 ceiling is applied. Current effective reach SHALL remain a disposable
serve-time derivation bounded by that immutable release-time result, the current
Phase 10 ceiling, and append-only containment. Requested, release-time effective,
and current effective reach SHALL remain distinct in storage, APIs, and staff UI;
widening SHALL require a newly authorized successor release. A missing, stale,
ambiguous, incompatible, or unauthorized head SHALL resolve honestly to the `Not
public` fallback without consulting another Legal Entity, Site, or Page Family
and without creating a tenant choice. Reach history SHALL be immutable and SHALL
NOT be implemented as a page-level authentication or safety switch.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-3ed4a333961776878e92"></a>

## D12 Supporter Responses Use One Bounded Tenant Profile

<!-- BEGIN CONTRACT {"id":"3ed4a333961776878e92","name":"D12 Supporter Responses Use One Bounded Tenant Profile"} -->

Each tenant SHALL prospectively select exactly one Ministry Update response
mode, initially `Responses off`: `Responses off`, `Like + I prayed`, or `Like +
I prayed + comments`. Guided setup SHALL recommend acknowledgement-only.
Responses SHALL be available only to a currently authenticated actor admitted to
the exact supporter Update projection. Like and I-prayed acknowledgements SHALL
be idempotent only within the complete Engagement Space identity: Tenant, Legal
Entity, environment, purpose, Update, immutable revision, supporter Release
Projection/version, audience, safety/authorization epochs, Response Profile,
and operation generation. Comments SHALL be bounded, append-only, and moderated
without becoming a general social network. An Update MAY narrow or close its
exact Engagement Space; closure SHALL preserve evidence immediately, and
reopening SHALL occur only through D4/D5 release authority. Enabling comments
SHALL choose exactly one `Right away, with reporting` or `After review` posture
and one existing authorized moderation group.

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->
