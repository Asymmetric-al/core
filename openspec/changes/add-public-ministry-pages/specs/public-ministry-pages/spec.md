# Public Ministry Pages Capability

## ADDED Requirements

### Requirement: D1 Typed Public Page Families Share One Publication Contract

The platform SHALL provide exactly two public Page families, Missionary Ministry and Project/Campaign, under one tenant-owned publication contract.

Every clause in `openspec/contracts/public-ministry-pages.md#contract-2491499e949054920391` MUST apply without exception.

#### Scenario: A missionary edits all assigned Pages from one workspace

- **WHEN** a missionary has an active contributor assignment to their Missionary
  Page and two Project/Campaign Pages
- **THEN** the workspace shows those three Pages and permits only the actions
  granted for each exact Page
- **AND** every semantic save records the missionary's own identity and Page scope

#### Scenario: A Page has more than one contributor

- **WHEN** two spouses or teammates have explicit contributor assignments
- **THEN** each may edit through a separate authenticated account
- **AND** neither assignment implies staff, finance, support-data, or release
  authority

#### Scenario: A caller bypasses the service boundary

- **WHEN** a browser or CMS client attempts to mutate Page truth directly
- **THEN** policy and structural controls deny the operation
- **AND** `PublicMinistryPagesService` remains the only supported mutation seam

### Requirement: D2 Publication Reach Is Tenant-Defaulted And Phase-10-Ceiling-Resolved

The platform SHALL maintain a prospective immutable Publication Reach Profile Version lineage for each exact Tenant × Legal Entity × Site × typed Page Family, with at most one current saved head.

Every clause in `openspec/contracts/public-ministry-pages.md#contract-5dea6123e0b97b062f4b` MUST apply without exception.

#### Scenario: A tenant default applies to a new Page

- **WHEN** an authorized actor creates a Page without selecting a different
  permitted reach
- **THEN** the current exact Tenant × Legal Entity × Site × typed Page Family
  reach profile supplies the proposed value
- **AND** the release still requires Phase 10 admission

#### Scenario: Staff inspect configured and live reach

- **WHEN** Phase 10 or containment narrows a released Page beneath the tenant's
  requested reach
- **THEN** staff can distinguish the immutable requested value, immutable
  release-time effective value, and disposable current effective value
- **AND** the system does not rewrite historical intent or widen without a
  successor release

#### Scenario: Safety narrows after release

- **WHEN** Phase 10 reduces the subject's public ceiling
- **THEN** the next request is denied or reduced before cache lookup
- **AND** stale content is not served while downstream cleanup converges

#### Scenario: A Shared-by-link Page is requested by a crawler

- **WHEN** a crawler requests a current Shared-by-link release
- **THEN** the Page may be served only as permitted by Phase 10 and D18
- **AND** it is marked noindex and omitted from directories and sitemaps

#### Scenario: A Listed Page narrows to Shared by link

- **WHEN** an authorized successor release narrows an already Listed Page to
  `Shared by link — public`
- **THEN** D2 and D8 atomically activate a fresh high-entropy, opaque, non-name-
  derived Route Generation for the same exact Site, Page, and locale
- **AND** the formerly discoverable path becomes a permanent non-redirecting
  privacy-safe `404`/`noindex` tombstone before the Shared release is servable
- **AND** the old path is never reused or redirected to the new Shared route

#### Scenario: Safety narrows before a Shared successor exists

- **WHEN** Phase 10 narrows an already Listed Page before an authorized Shared-
  by-link successor release exists
- **THEN** the formerly Listed route is denied immediately
- **AND** containment does not mint or authorize a new Shared route

#### Scenario: Publication reach has not been deliberately chosen

- **WHEN** no tenant D2 choice exists for the exact Tenant × Legal Entity × Site
  × typed Page Family scope
- **THEN** the safe fallback is `Not public`
- **AND** the UI identifies it as a fallback rather than a tenant choice
- **AND** no sibling Legal Entity, Site, or Page Family profile is consulted

#### Scenario: A represented person stops public display

- **WHEN** a currently displayed person invokes `Stop showing me publicly`
- **THEN** smallest-scope non-enumerating containment takes effect immediately
- **AND** restoration requires a new currently admitted release rather than
  reusing the prior positive state

### Requirement: D3 Presentation Profiles Are Versioned Site-And-Family Contracts

The platform SHALL provide one current versioned Public Page Presentation Profile per exact Tenant × Legal Entity × environment × Site × Page Family.

Every clause in `openspec/contracts/public-ministry-pages.md#contract-3ff708c901de3b0f5597` MUST apply without exception.

#### Scenario: A tenant configures its two Page families

- **WHEN** staff selects a Missionary profile and a Project/Campaign profile
- **THEN** each choice is previewed against representative current content
- **AND** each activated exact Tenant, Legal Entity, environment, Site, and Page
  Family version applies consistently to its complete cohort
- **AND** a sibling environment or scope cannot supply the current head

#### Scenario: A Page lacks content for an optional block

- **WHEN** the active family profile includes an optional typed block whose
  release has no eligible content
- **THEN** the renderer follows the block's code-owned omission behavior
- **AND** it does not invent, copy, or silently substitute content

#### Scenario: A Page presents Ministry Updates

- **WHEN** a D3 profile places the bounded Ministry Updates block on an exact Page
- **THEN** the Page pins one immutable D3 Feed Binding selecting its exact source
  and purpose set
- **AND** D11 consumes that binding without becoming its owner
- **AND** a missing, stale, incompatible, or unauthorized binding omits the block
  and opens only the D3-owned staff exception

#### Scenario: A tenant changes a family design

- **WHEN** a successor profile is compatible with every current locale release
- **THEN** D27 activates it atomically across the full Site-family cohort
- **AND** no Page or locale remains on a private layout exception

### Requirement: D4 Review And Release Profiles Govern Final Intent

The platform SHALL maintain one prospective, immutable Review and Release Profile lineage with at most one current head for each exact Tenant × Legal Entity × environment × Site × Page Family × publication-path scope.

Every clause in `openspec/contracts/public-ministry-pages.md#contract-3f5217b4855e51bb0909` MUST apply without exception.

#### Scenario: Tightening stops a queued automatic release

- **GIVEN** an exact candidate was queued under Publish after checks
- **WHEN** the current exact-scope profile changes to Review before publishing
  before its release effect commits
- **THEN** current-policy reproof stops automatic publication
- **AND** the candidate and original evidence remain inspectable without a
  public-head advance

#### Scenario: Loosening does not publish the existing review backlog

- **GIVEN** an exact candidate is waiting under Review before publishing
- **WHEN** a later exact-scope profile permits Publish after checks
- **THEN** that successor does not release or reinterpret the waiting candidate
- **AND** staff may decide it under its pinned review profile or the contributor
  may explicitly submit a new candidate under the new profile

#### Scenario: A prospective profile successor preserves exact manual review

- **GIVEN** a waiting candidate retains its pinned review profile and expected
  public head, and all current authority, safety and required proofs pass
- **WHEN** authorized staff decide it after a prospective review-profile change
- **THEN** that profile successor alone does not make the review stale
- **AND** a superseded candidate, moved expected public head or failed current
  mandatory proof still blocks release

#### Scenario: A sibling publication scope uses a different review posture

- **WHEN** final intent is submitted for one exact Tenant, Legal Entity,
  environment, Site, Page Family, and publication path
- **THEN** D4 resolves and pins only that exact scope's current profile version
- **AND** a profile from another Legal Entity, Site, family, or publication path
  cannot authorize or bypass review for the candidate

#### Scenario: A tenant requires staff review

- **WHEN** a contributor submits a valid final-intent candidate
- **THEN** the candidate enters the one D5 review queue
- **AND** the current public release remains unchanged until approval succeeds

#### Scenario: A tenant permits publish after checks

- **WHEN** an authorized contributor chooses publish and every release check
  succeeds against the same candidate
- **THEN** one immutable release becomes current by CAS
- **AND** the UI reports publication only after that CAS succeeds

#### Scenario: The candidate or its release proofs change while checks run

- **WHEN** the candidate is superseded, the live release moves, or a pinned
  dependency/proof no longer matches
- **THEN** publication of that candidate is rejected as stale
- **AND** unrelated newer private working-head content remains preserved without
  invalidating the exact submitted candidate by itself

### Requirement: D5 Staff Review Is One Simple Exact-Candidate Decision

When D4 requires review, staff SHALL use one quiet queue. Its primary actions
SHALL be `Approve & publish` and `Request changes` for the exact candidate; a
terminal `Reject` action SHALL remain deliberately secondary for work that must
not remain actionable. The review surface SHALL show an exact diff, a safe
exact-version preview, author, attestation, current dependencies, and
plain-language consequences. Review SHALL NOT permit an in-place override or
create a second editorial workflow.

#### Scenario: Staff approve unchanged work

- **WHEN** an authorized reviewer approves the current candidate and all final
  checks still pass
- **THEN** that exact revision becomes the immutable release
- **AND** reviewer, candidate, attestation, and check provenance are retained

#### Scenario: Staff request changes

- **WHEN** a reviewer supplies a bounded reason and requests changes
- **THEN** the contributor sees the reason beside the preserved candidate
- **AND** no public release changes

#### Scenario: Staff terminally reject a candidate

- **WHEN** an authorized reviewer deliberately selects the secondary Reject
  action and confirms its plain-language consequence
- **THEN** the exact candidate becomes terminally non-actionable with reviewer
  and bounded reason provenance
- **AND** the contributor's immutable work remains historical evidence and no
  public release changes

#### Scenario: The candidate becomes stale during review

- **WHEN** required current subject, safety, reach, assignment, presentation or
  review-profile compatibility, locale, route, media, or giving proof fails for
  the candidate
- **THEN** approval is blocked with the cause and next safe action
- **AND** staff cannot force the stale candidate live or treat a prospective
  review-profile successor alone as failure of the pinned manual-review rules

### Requirement: D6 Public Support Progress Is Typed Source-Authoritative And Optional Per Page

Each Page release SHALL pin one immutable, prospective Public Support Progress Profile Version selecting `Hidden` or exactly one compatible, source-certified progress presentation.

Every clause in `openspec/contracts/public-ministry-pages.md#contract-581743578776cdad2218` MUST apply without exception.

#### Scenario: A missionary Page hides progress

- **WHEN** an actor with the exact current tenant staff/D6 progress-settings
  capability selects `Hidden`
- **THEN** the public layout omits progress without an empty meter or zero
- **AND** Giving remains available when its independent D7 checks pass

#### Scenario: Staff change a released progress profile

- **WHEN** authorized staff change visibility, metric, goal, currency, period,
  formula, or scope for a released Page
- **THEN** the change creates an attributed D4/D5 candidate and D2 successor
  release that pins its own immutable profile
- **AND** the current release remains unchanged until that successor is admitted

#### Scenario: A project uses a bounded goal

- **WHEN** one certified source provides compatible exact-currency goal and
  recognized-progress facts
- **THEN** the Page labels the metric and its data-through date clearly
- **AND** the displayed value is derived without copied balance authority

#### Scenario: Progress truth is missing or stale

- **WHEN** coverage, currency, definition, or freshness no longer satisfies the
  selected progress profile
- **THEN** the progress component is omitted or marked unavailable
- **AND** missing data never silently becomes zero or converted truth

### Requirement: D7 Every Page Has Exactly One Phase-13 Designation

For the MVP, every released Page SHALL pin one immutable Page Giving Binding to exactly one eligible Phase 13 Designation; an incomplete draft MAY exist but SHALL NOT release.

Every clause in `openspec/contracts/public-ministry-pages.md#contract-69dc1dc4688ce9ef5d62` MUST apply without exception.

#### Scenario: A visitor gives from a current Page

- **WHEN** the visitor selects Give on an admitted Page release
- **THEN** the handoff contains the exact Page Designation and bounded
  attribution context
- **AND** checkout displays the authoritative Phase 13 destination

#### Scenario: The Designation becomes ineligible

- **WHEN** current Phase 13 truth no longer permits giving to the bound
  Designation
- **THEN** Give is disabled with a calm accurate explanation
- **AND** safe Page content may remain visible under its independent authority

#### Scenario: Staff replace a Page Designation

- **WHEN** authorized staff select a different eligible Phase 13 Designation
- **THEN** the change creates an attributed Page candidate and a newly admitted
  successor release that pins its own Page Giving Binding
- **AND** the existing release and its donor destination remain immutable

#### Scenario: Attribution is altered in transit

- **WHEN** Page, Site, locale, source, currency, or Designation context fails
  integrity or current-scope validation
- **THEN** checkout refuses the consequential action
- **AND** no provider call is attempted

#### Scenario: A draft lacks its Page Designation

- **WHEN** staff prepare a Page whose exact D7 binding is not yet complete
- **THEN** private drafting may continue with a clear setup requirement
- **AND** release remains blocked without substituting general giving

### Requirement: D8 Routes And Lifecycle Dispositions Are Source-Qualified

Every Page route SHALL be unique within its exact Site and locale and SHALL have one immutable current disposition deliberately selected by an authorized actor from the finite outcomes constrained by current Page, subject, reach, safety, and Giving truth.

Every clause in `openspec/contracts/public-ministry-pages.md#contract-d936bf888dfe379adaa0` MUST apply without exception.

#### Scenario: An eligible Listed Page changes path

- **WHEN** an authorized Listed successor route is released for the same Page
  and locale while both origin and target remain Listed
- **THEN** the old route returns one bounded method-preserving `308` for
  `GET`/`HEAD` and rejects other methods
- **AND** the redirect chain remains single-hop and cycle-free

#### Scenario: A Listed Page becomes Shared by link

- **WHEN** D2 admits an authorized `Shared by link — public` successor release
  for a previously Listed Page
- **THEN** D8 atomically activates its new exact-scope opaque Route Generation
  and permanently tombstones the former Listed path
- **AND** the former path returns the privacy-safe nonredirecting `404`/`noindex`
  response and is never reused

#### Scenario: A subject departs with no approved successor

- **WHEN** operational lifecycle truth makes the Page ineligible
- **THEN** the route serves the configured noindex notice or not-found outcome
- **AND** a transition notice renders independently current D7/Phase 13 Giving
  state, while a not-found response exposes no Page action

#### Scenario: Route authority is unavailable

- **WHEN** the exact route disposition cannot be proved
- **THEN** the runtime returns a neutral `503` with `Retry-After` and
  `Cache-Control: no-store`
- **AND** it does not guess from a slug, legacy table, cache, or adjacent Page

### Requirement: D9 Public Media Is Sanitized Certified And Release-Bound

All Public Ministry Media SHALL pass from private tenant-scoped intake through type verification, safety processing, metadata removal, re-encoding, and certified derivatives before a placement can be pinned to a release.

Every clause in `openspec/contracts/public-ministry-pages.md#contract-d0610e893e0f992a3a51` MUST apply without exception.

#### Scenario: A missionary uploads a revealing photograph

- **WHEN** an authorized contributor uploads a supported image with EXIF data
  and a name containing personal information
- **THEN** the origin remains private and a sanitized derivative receives an
  opaque public identity
- **AND** the public response exposes neither the filename nor metadata

#### Scenario: One certified image is reused in two contexts

- **WHEN** the same sanitized master appears in two Page placements with
  different semantic meaning
- **THEN** each immutable placement pins its own contextual alternative text or
  explicit decorative decision, crop, role, and applicable caption/attribution
- **AND** neither placement inherits filename-derived or asset-global text

#### Scenario: Sanitization fails

- **WHEN** content verification, malware scanning, decoding, re-encoding, or
  metadata stripping cannot be certified
- **THEN** the asset cannot be placed in a releasable candidate
- **AND** the author receives a clear recoverable error

#### Scenario: A released asset is withdrawn

- **WHEN** current safety or publication authority withdraws a media placement
- **THEN** new serving is denied before cache and cleanup converges adverse-first
- **AND** the immutable prior release record remains private audit evidence

### Requirement: D10 Preview Requires Current Authenticated Exact-Version Authority

Preview SHALL be available only to a currently authenticated actor authorized for the exact tenant, Site, Page or canonical Ministry Update, locale, immutable revision or candidate, and selected audience projection where applicable.

Every clause in `openspec/contracts/public-ministry-pages.md#contract-398655323075824bc6e0` MUST apply without exception.

#### Scenario: An authorized editor opens preview

- **WHEN** the editor requests an exact Page revision they may currently inspect
- **THEN** the server composes that revision through the preview projection
- **AND** the response identifies its non-public state and disables Give,
  responses, measurement, and other side effects
- **AND** access evidence identifies the actor and exact preview target without
  copying its content

#### Scenario: A copied preview URL is opened by someone else

- **WHEN** an unauthenticated or differently scoped actor follows the URL
- **THEN** the request is denied without revealing Page existence or content
- **AND** possession of the address supplies no authority

#### Scenario: Staff preview one Update audience

- **WHEN** authorized staff deliberately select the public or supporter projection
  of one exact canonical Ministry Update candidate
- **THEN** preview renders only that audience projection through the production-
  equivalent reader and remains pinned to the exact candidate
- **AND** public-audience preview cannot reveal supporter-only content, while
  supporter preview re-proves current audience authority on every request

#### Scenario: Authority changes during preview

- **WHEN** the actor's assignment, permission, safety scope, or candidate access
  is revoked
- **THEN** the next document or asset request is denied
- **AND** cached preview content is not reused

#### Scenario: Newer work is saved during preview

- **WHEN** another authorized editor saves a newer Revision while an actor is
  previewing an exact Revision or submitted candidate
- **THEN** the open preview and every review action remain bound to the original
  exact version
- **AND** opening the newer version requires a deliberate separately authorized
  action rather than mutable-latest or live-content fallback

### Requirement: D11 Ministry Updates Have One Canonical Version And Audience-Scoped Releases

The platform SHALL maintain one canonical immutable Ministry Update lineage and SHALL derive exact audience-scoped release projections from it.

Every clause in `openspec/contracts/public-ministry-pages.md#contract-71ace46da81974687c52` MUST apply without exception.

#### Scenario: Supporter detail is not safe for a public projection

- **WHEN** an author selects public release for an Update whose supporter copy
  contains detail not independently admitted for the public audience
- **THEN** public final intent requires the exact deliberately supplied
  public-safe variant in the canonical Revision
- **AND** no mechanical transformation manufactures public copy, while an
  independently eligible supporter release may still advance

#### Scenario: One Update is placed on several Pages

- **WHEN** the author releases one canonical Update to eligible current Page
  placements
- **THEN** every placement references the same exact Update version and Audience
  Release Manifest through its own exact Page-scoped public Release Projection
- **AND** removing one placement does not mutate the canonical Update or others

#### Scenario: An Update is supporter-only

- **WHEN** the audience manifest admits authenticated supporters but not public
  visitors
- **THEN** public Page, public-audience preview, search, sitemap, and share-card
  projections omit the supporter content
- **AND** authenticated reads re-prove the exact current supporter scope

#### Scenario: Published Update content needs correction

- **WHEN** an authorized author corrects or withdraws a released Update
- **THEN** the platform creates a successor fact and converges every affected
  placement adverse-first
- **AND** it does not rewrite the released version in place

#### Scenario: One selected Update audience fails to release

- **WHEN** a multi-audience release advances one audience but another audience
  fails admission or release-projection delivery
- **THEN** the successful audience head remains current and the failed
  audience's prior-good head remains unchanged
- **AND** recovery retries only the failed residual work without replaying or
  rolling back the successful audience

#### Scenario: An Update is merely related to a Page participant

- **WHEN** an Update has no exact current Feed Binding for the Page source and
  purpose
- **THEN** the Page omits it even if an author, spouse, teammate, subject, or
  Support Assignment appears related
- **AND** no relationship inference creates public or supporter admission

### Requirement: D12 Supporter Responses Use One Bounded Tenant Profile

Each tenant SHALL prospectively select exactly one Ministry Update response mode, initially `Responses off`: `Responses off`, `Like + I prayed`, or `Like + I prayed + comments`.

Every clause in `openspec/contracts/public-ministry-pages.md#contract-3ed4a333961776878e92` MUST apply without exception.

#### Scenario: Responses are off

- **WHEN** an eligible supporter views an Update under an Off profile
- **THEN** no response controls or counts are shown
- **AND** response endpoints reject writes for that projection

#### Scenario: A supporter repeats an acknowledgement

- **WHEN** the same actor retries Like or I prayed with the same idempotency key
- **THEN** exactly one acknowledgement is effective
- **AND** an uncertain response can be inspected without blind duplication

#### Scenario: A comment is moderated or access is revoked

- **WHEN** current policy hides a comment or the actor loses supporter access
- **THEN** subsequent reads and writes reflect the adverse change immediately
- **AND** the canonical Update and Page release remain independently intact

#### Scenario: An Update narrows or reopens responses

- **WHEN** an authorized Update release closes its Engagement Space
- **THEN** new responses stop immediately while historical evidence remains
- **AND** reopening requires a new exact D4/D5-authorized release projection

### Requirement: D13 Directories Use One Scoped Corpus With Bounded Family Views

The platform SHALL build one complete, generation-bound Public Ministry Directory corpus for each exact Tenant × Legal Entity × environment × Site × locale scope from current Listed, Phase-10-admitted releases.

Every clause in `openspec/contracts/public-ministry-pages.md#contract-a41a71efa05f5e45363d` MUST apply without exception.

#### Scenario: A tenant selects separate directory views

- **WHEN** staff chooses separate Missionary and Project/Campaign presentation
- **THEN** both views query the same exact Tenant, Legal Entity, environment,
  Site, and locale corpus with server-owned family constraints
- **AND** the choice does not fork indexing, reach, or safety authority

#### Scenario: A sensitive ranking signal is proposed

- **WHEN** a directory implementation attempts to order or shape results from
  financial progress, Giving readiness, popularity, urgency, engagement,
  supporter or hidden-result counts, distance, coordinates, or inferred safety
- **THEN** contract validation rejects the ranking or facet
- **AND** hidden entries cannot influence visible counts or deterministic order

#### Scenario: Reach narrows during a rebuild

- **WHEN** a Listed release becomes Shared, Not public, or Phase-10-ineligible
- **THEN** admission prevents it from appearing in new results immediately
- **AND** stale index cleanup proceeds adverse-first

#### Scenario: Directory search is unavailable

- **WHEN** the bounded search projection fails
- **THEN** the directory presents an honest unavailable state
- **AND** it does not fall back to raw Page, CRM, CMS, or stale cross-scope data

### Requirement: D14 Search And Social Presentation Is Release-Bound

For each current eligible release, the platform SHALL compile one immutable D14 manifest containing distinct, non-interchangeable bounded Search Presentation and Share Presentation outputs.

Every clause in `openspec/contracts/public-ministry-pages.md#contract-dfceab048f4b1753738c` MUST apply without exception.

#### Scenario: A Listed release is compiled

- **WHEN** Page, locale, host, route, Phase 10, media, and reach facts are current
- **THEN** canonical, robots, sitemap, structured-data, and Open Graph output all
  reference that exact release
- **AND** the content is accessible without relying on client-only rendering

#### Scenario: Structured data exceeds the visible-fact allowlist

- **WHEN** compilation proposes arbitrary JSON-LD, generic Person injection,
  `SearchAction`, `DonateAction`, or a claim absent from the exact release
- **THEN** the D14 manifest rejects that structured-data output
- **AND** no search or share response falls back to the proposed schema

#### Scenario: A sibling locale is not mutually eligible

- **WHEN** either locale release is missing, stale, unsafe, not currently Listed
  and D14 Search-Presentation-eligible, or does not reciprocally admit the other
  exact release
- **THEN** neither release emits that alternate-locale relationship
- **AND** no source-language, root-Site, or CMS fallback creates it

#### Scenario: A Shared-by-link Page is shared socially

- **WHEN** an admitted Shared release is fetched for a link preview
- **THEN** its approved bounded share presentation may be returned
- **AND** the release emits `noindex` and remains absent from platform-owned
  directories, search, feeds, and sitemaps
- **AND** its public route is not path-disallowed in `robots.txt`, so a crawler
  can fetch the response and observe `noindex`; external indexing or removal is
  not claimed

#### Scenario: One Update is placed on Pages with different reach

- **WHEN** the compiler evaluates every current safe placement for one canonical
  Update, Site, and locale
- **THEN** the permalink posture follows the complete placement-union rule
- **AND** no single Page, stale placement, or copied post decides it alone

#### Scenario: A release becomes unsafe

- **WHEN** any source fact invalidates its public or share eligibility
- **THEN** serve and metadata admission fail before cache reuse
- **AND** stale search, sitemap, and social artifacts converge adverse-first

### Requirement: D15 Measurement Is First-Party Bounded And Non-Authoritative

For each exact Tenant × Legal Entity × Site, the platform SHALL maintain one prospective versioned Public Ministry Measurement Profile whose persisted initial state is `Off` and whose current value is exactly `Off`, `Staff only`, or `Staff + current assigned Page contributors`.

Every clause in `openspec/contracts/public-ministry-pages.md#contract-0514f802aefecd562038` MUST apply without exception.

#### Scenario: Measurement is off or fails

- **WHEN** the tenant disables measurement or the intake service is unavailable
- **THEN** Page, Update, Share, Give, cart, and checkout behavior is unchanged
- **AND** no event is reconstructed later from access or error logs

#### Scenario: Measurement is enabled before its notice path is ready

- **WHEN** an enabled exact-Site profile lacks current, satisfied proof of the
  applicable truthful notice and owner-authorized objection or stricter consent
  path
- **THEN** occurrence admission records nothing and opens only the cause-owned
  setup exception
- **AND** Page and Giving behavior continues without retroactive backfill

#### Scenario: A qualified interaction is posted twice

- **WHEN** one visible interaction is retried with the same bounded idempotency
  identity
- **THEN** it contributes at most once to the exact release aggregate
- **AND** no durable visitor or session identifier is created

#### Scenario: An assigned contributor opens activity

- **WHEN** the tenant permits contributor visibility and current assignment and
  exact admitted Page-placement provenance are re-proved
- **THEN** the contributor receives suppression-safe exact-Page totals and
  trends with a completeness label
- **AND** tenant-wide, identity, event, sparse-cell, source, and financial
  drill-down remain unavailable
- **AND** a canonical-permalink occurrence without exact placement provenance
  stays staff-only and is never fanned out across placements

#### Scenario: A chart is unavailable or unusable

- **WHEN** an authorized actor uses a screen reader, keyboard, reflow, forced
  colors, or a report whose chart cannot load
- **THEN** the equivalent HTML table, fixed metric definitions, and completeness
  state provide the same authorized information
- **AND** visitor, Give, and public Page behavior remain unaffected

### Requirement: D16 Writing Assistance Is Source-Bounded Suggestion-Only And Tenant-Off

Public Page writing assistance SHALL be off by default and available only for an authorized author's explicit bounded source selection and a closed certified action.

Every clause in `openspec/contracts/public-ministry-pages.md#contract-94fc5bb9e3ff4cfd3157` MUST apply without exception.

#### Scenario: An author improves selected prose

- **WHEN** the tenant enabled assistance and the author selects eligible text
  and a bounded action
- **THEN** the provider receives only the approved source, purpose, locale, and
  minimum context
- **AND** the result is shown as a private suggestion beside the original

#### Scenario: The draft changes before apply

- **WHEN** a suggestion returns for a superseded source digest
- **THEN** apply is blocked or requires an explicit rebase comparison
- **AND** the assistant never overwrites newer work

#### Scenario: Translation is requested

- **WHEN** a certified provider returns an English suggestion
- **THEN** the comparison visibly labels it as machine-assisted, offers `Use
English draft`, and shows the complete required warning and review checklist
- **AND** it cannot publish, attest, approve, or satisfy Phase 10 automatically

#### Scenario: Source language is mixed or ambiguous

- **WHEN** selected text contains materially mixed languages or provider
  detection disagrees with authoritative locale truth
- **THEN** the actor must confirm or separate the affected ranges before egress
- **AND** the platform does not silently guess, flatten the text, switch the
  provider, or choose another target locale or language pair

### Requirement: D17 Every Project Page Has One Exact Typed Source Subject

Each Project/Campaign Page SHALL bind exactly one source-qualified subject of a code-owned supported kind: canonical CRM Ministry Project, Phase 13 Giving Campaign, or separately eligible Phase 13 Designation presented as `Fund or designated purpose`.

Every clause in `openspec/contracts/public-ministry-pages.md#contract-3e22c2e1cccda1c53928` MUST apply without exception.

#### Scenario: Staff choose a supported subject

- **WHEN** an authorized creator searches eligible records in `What is this page
about?`
- **THEN** only production-certified same-scope subject kinds and records appear
- **AND** the confirmed Page stores the exact typed reference, not copied truth

#### Scenario: The subject changes before first release

- **WHEN** staff correct an unreleased Page binding
- **THEN** a CAS-guarded immutable successor replaces the proposed binding
- **AND** the Page history retains the prior attempt

#### Scenario: Staff try to replace a released subject

- **WHEN** a Page has any public release and staff choose another subject
- **THEN** the platform requires a new Page and explicit D8 succession
- **AND** it prohibits in-place mutation, fuzzy matching, and silent substitution

### Requirement: D18 Current Serving Is Release-Bound Freshness-Classified And Adverse-First

Phase 5 SHALL execute public requests while Phase 22 supplies the exact current Page presentation semantics.

Every clause in `openspec/contracts/public-ministry-pages.md#contract-d7dfb400eed3c24f02e4` MUST apply without exception.

#### Scenario: A current release is served

- **WHEN** all exact dependencies admit the Page and a matching certified cache
  object exists
- **THEN** the visitor receives that immutable release/profile composition
- **AND** response metadata identifies an honest freshness class

#### Scenario: The pre-cache gate is unavailable

- **WHEN** current admission cannot be proved
- **THEN** the runtime returns a no-store unavailable or safe reduced response
- **AND** it does not serve a previously positive cached object

#### Scenario: A Page becomes adverse while cleanup lags

- **WHEN** reach, safety, route, media, subject, locale, or giving authority
  narrows
- **THEN** the gate immediately blocks the affected new behavior
- **AND** provider invalidation status remains separate from serving authority

#### Scenario: A provider accepts cleanup but a controlled response remains stale

- **WHEN** expiration was requested and accepted but an exact controlled-surface
  probe still observes the superseded generation or cannot verify it
- **THEN** residual coverage remains incomplete and fenced bounded recovery
  continues
- **AND** the UI does not claim convergence, ask a user to purge, force live, or
  mark the cause fixed

### Requirement: D19 Ministry Assignments Separate Association Editing Display And Support Access

Phase 9 SHALL own bounded Ministry Assignments and Participant Memberships that associate exact people with one ministry subject.

Every clause in `openspec/contracts/public-ministry-pages.md#contract-23d1ad26bea31e310400` MUST apply without exception.

#### Scenario: Spouses jointly serve one ministry

- **WHEN** staff assigns both authenticated spouses as Page contributors and
  grants both the exact support module
- **THEN** each sees and edits the shared Page and sees the authorized fund data
- **AND** every action and support read remains attributed to that spouse

#### Scenario: A teammate may edit but not see gifts

- **WHEN** the teammate has a D1 Page Contributor Assignment but no current
  Phase 12/21 support-projection grant
- **THEN** the teammate can edit the assigned Page
- **AND** contribution, supporter, balance, and notification data remain denied

#### Scenario: An assignment is revoked

- **WHEN** staff ends or narrows any separately owned membership or grant while
  the user has an open screen
- **THEN** the next read, save, preview, publish, response, and realtime refresh
  re-proves current authority and denies the removed actions
- **AND** queued work never inherits the old grant

### Requirement: D20 Family Semantics Use Two Small Code-Owned Catalogs

The platform SHALL maintain exactly two small code-owned semantic block catalogs, one for Missionary Pages and one for Project/Campaign Pages.

Every clause in `openspec/contracts/public-ministry-pages.md#contract-329e6bde97168629dba2` MUST apply without exception.

#### Scenario: A profile selects family blocks

- **WHEN** staff configures a family profile
- **THEN** the UI offers only compatible catalog entries with plain-language
  examples and consequences
- **AND** Page authors edit only the fields the profile marks editable

#### Scenario: A candidate contains incompatible content

- **WHEN** a Missionary-only block or invalid schema appears in a Project Page
- **THEN** candidate validation rejects it with a field-specific recovery path
- **AND** the renderer does not guess or silently drop consequential content

#### Scenario: The catalog evolves

- **WHEN** code introduces a new catalog generation
- **THEN** existing releases remain renderable by their pinned generation
- **AND** D27 activates a successor only after complete-cohort compatibility

#### Scenario: A launch profile exposes its family sections

- **WHEN** staff configure a Missionary or Project/Campaign family profile
- **THEN** only that family's exact launch catalog roles are offered
- **AND** required managed Give and stewardship roles cannot be removed or
  replaced by editorial blocks
- **AND** each Project/Campaign managed role resolves through the exact D17
  subject kind and explicit D3 Feed Binding rather than project-name inference

### Requirement: D21 Public Surface Adoption Uses One Complete Authority Cutover

Migration from the legacy public ministry surface SHALL prepare Pages incrementally in private, but SHALL switch public reader authority only for one complete exact Tenant, Legal Entity, environment, Site, immutable enumerated verified-host membership generation and digest, and locale cohort.

Every clause in `openspec/contracts/public-ministry-pages.md#contract-0d6e00604e0a95f28551` MUST apply without exception.

#### Scenario: Pages are prepared incrementally

- **WHEN** migration processes one safe chunk
- **THEN** its proposed identities, routes, assets, releases, and dispositions
  remain private shadow evidence
- **AND** every public request still uses the current legacy authority

#### Scenario: One source lacks a disposition

- **WHEN** final census or control totals find an omitted, duplicated, ambiguous,
  stale, or cross-scope legacy record
- **THEN** cutover is blocked at the smallest exact cohort
- **AND** the operations view identifies the cause-owned repair

#### Scenario: Verified-host membership changes after preparation

- **WHEN** final CAS finds that the pinned host-membership generation or digest
  no longer matches the current Phase 2/24 owner head
- **THEN** cutover aborts with no public reader change
- **AND** recovery prepares a successor case rather than reinterpreting the
  selected Plan or Manifest

#### Scenario: Cutover races or crashes

- **WHEN** two actors execute the same generation or the process loses its
  response around the CAS
- **THEN** inspection proves exactly one current reader generation
- **AND** recovery resumes idempotently without reverting to legacy serving

#### Scenario: A shared artifact cannot be partitioned safely

- **WHEN** a sitemap, route map, alternate-locale graph, index, or cache
  generation spans more than the proposed exact cohort without an atomically
  selectable partition
- **THEN** its dependent cases remain not ready and cutover is blocked
- **AND** the complete shared authority participates in one coordinated CAS

#### Scenario: Proved-safe legacy presentation is retained once

- **WHEN** the selected immutable plan certifies a compatible legacy Page
  release and its complete pinned release manifest
- **THEN** the sole gateway may serve only the normalized immutable DTO
- **AND** later edits use the current catalog without raw-legacy fallback or a
  second compatibility release
- **AND** missing historical D26 evidence is recorded as `not captured` without
  minting an attestation; the first successor candidate follows ordinary D26

### Requirement: D22 Public Pages Operations Is Quiet Derived And Cause-Owned

Mission Control SHALL provide one disposable Public Pages workspace with `To review`, `Needs attention`, and `All pages` for one exact owner-resolved Tenant × Legal Entity × environment × Site × locale scope.

Every clause in `openspec/contracts/public-ministry-pages.md#contract-893c9d2924f630655111` MUST apply without exception.

#### Scenario: Several Pages share one cause

- **WHEN** one family profile, host, source, or provider incident affects many
  Pages
- **THEN** the workspace shows one cause with a bounded impact summary
- **AND** the action links to the source owner rather than duplicating repairs

#### Scenario: A tenant is healthy

- **WHEN** no review or cause-owned intervention is currently actionable
- **THEN** `To review` and `Needs attention` are calm empty states
- **AND** normal propagation does not create work or notification noise

#### Scenario: Restricted Pages contribute to a count

- **WHEN** the viewer lacks permission to inspect their identity or cause
- **THEN** counts and groupings are suppressed or generalized safely
- **AND** drill-down never reveals the protected rows

#### Scenario: Operations data exists in a sibling scope

- **WHEN** the workspace derives rows, causes, counts, search, exports,
  notifications, shared-task links, badges, subscriptions, or caches for one
  exact Site and locale
- **THEN** current authorization and exact owner scope are applied before any
  aggregation or result is produced
- **AND** sibling Site or locale evidence cannot enter even a generalized count

#### Scenario: An administrator exports publication history

- **WHEN** a currently authorized administrator requests the exact-scope audit
- **THEN** the export contains stable opaque IDs, immutable lineage, scope,
  provenance, and dispositions for the governed record families
- **AND** it contains no unauthorized sibling data or claim that backup,
  migration, external custody, or deletion completed

#### Scenario: Giving becomes unavailable while a Page remains public

- **WHEN** D7 proves the release-pinned Designation ineligible while D2 and D18
  still admit the Page
- **THEN** authorized capable staff see one cause-owned `Giving unavailable`
  condition with the current visitor consequence and `Review designation` action
- **AND** Page content remains independently public, no substitute Designation
  is selected, and an unauthorized viewer receives no action or protected detail

#### Scenario: A participating owner adapter is not currently compatible

- **WHEN** a participating D1–D21 owner lacks a compatible current adapter
- **THEN** D22 exposes coverage as `Partial` or `Unavailable` without fabricating
  a tenant task
- **AND** production authorization fails for a core or launch-selected owner
  until exact adapter coverage is proved

### Requirement: D23 Setup And Settings Is One Derived Scope-First Workspace

The platform SHALL provide one quiet Public Page setup/settings workspace derived from current source-owned profile versions and exact scope.

Every clause in `openspec/contracts/public-ministry-pages.md#contract-689210b4e99d7a0564d4` MUST apply without exception.

#### Scenario: An administrator completes first setup

- **WHEN** an authorized tenant administrator enters the workspace for an
  unconfigured Site
- **THEN** the flow asks only the two family reach questions and one staff-review
  question
- **AND** built-in/Off/unavailable/unset safe behavior is disclosed in one
  collapsed summary without another mandatory decision

#### Scenario: An administrator changes one setting

- **WHEN** the actor submits an owner-supported successor version
- **THEN** the UI re-proves permission and current head before the owner CAS
- **AND** it reports scheduled, blocked, or effective truth without claiming all
  Pages changed before D27 admission

#### Scenario: A source is unavailable

- **WHEN** one owning profile cannot be resolved
- **THEN** that setting is read-only with a cause-specific unavailable state
- **AND** the workspace does not invent a default or overwrite other settings

### Requirement: D24 Staff Revisions Preserve Attribution Without A Second Workflow

Authorized staff MAY create ordinary immutable Page successor revisions through the same D1 editorial lineage used by contributors.

Every clause in `openspec/contracts/public-ministry-pages.md#contract-e7171b50748ff326a471` MUST apply without exception.

#### Scenario: Staff correct organization-authored copy

- **WHEN** an authorized staff editor changes eligible Page content
- **THEN** the platform creates a staff-attributed successor revision
- **AND** D4 determines whether it requires review or can publish after checks

#### Scenario: Staff supersede a contributor candidate

- **WHEN** staff materially revise submitted contributor work
- **THEN** the exact contributor candidate remains immutable and linked
- **AND** the staff successor requires a concise contributor-visible,
  notification-safe reason before final intent

#### Scenario: Staff edit authority changes

- **WHEN** a staff editor loses the exact capability while an editor is open
- **THEN** the next save or final action is denied after current reproof
- **AND** local recoverable work is preserved without becoming public truth

#### Scenario: Staff choose a source after the coherent head advanced

- **WHEN** staff begin from submitted contributor work after a newer working
  head exists
- **THEN** the UI offers `Continue from latest draft` as recommended or `Start
from submitted version`
- **AND** either choice preserves its source while appending from and CAS-
  advancing only the current coherent head

### Requirement: D25 Editorial Actionability Is Cause-Gated And Recovery Is Bounded

Editorial actionability SHALL be derived at request time from current revision, candidate, release, dependency, permission, and safety facts rather than a durable workflow-state machine.

Every clause in `openspec/contracts/public-ministry-pages.md#contract-a496ebfde0d022bf8d2f` MUST apply without exception.

#### Scenario: Routine autosave succeeds

- **WHEN** an authorized editor pauses after a semantic change
- **THEN** the bounded non-semantic buffer coalesces transport noise beneath the
  expected working head
- **AND** no immutable revision, semantic-head advance, audit occurrence, or
  public release state is created

#### Scenario: Dependencies change while work is preserved

- **WHEN** profile, reach, subject, route, media, assignment, or safety truth
  makes an action unavailable
- **THEN** recovery revalidates the complete current owner-fact set before
  constructing any successor and does not silently copy removed or unsafe
  material
- **AND** the UI explains the exact permission-safe owner cause and required
  editor action, while age alone neither approves nor discards the work

#### Scenario: Save completion is ambiguous

- **WHEN** the client loses the response after submitting an idempotent save
- **THEN** it inspects the current revision lineage before retrying
- **AND** no duplicate or blind overwrite is created

#### Scenario: Cleanup cannot prove content is unreferenced

- **WHEN** reference closure for scratch content or an inert prepare is missing,
  contradictory, or changing
- **THEN** cleanup preserves the content and opens a private operational
  exception
- **AND** age, actor revocation, task state, or a native version cap does not
  imply deletion eligibility

### Requirement: D26 Content-Sharing Attestation Is One Calm Candidate-Bound Confirmation

At the consequential Submit or Publish action, the current actor SHALL make one calm confirmation using a code-owned candidate-kind and audience-accurate action-adjacent statement.

Every clause in `openspec/contracts/public-ministry-pages.md#contract-54f4f6bd92c742684b1f` MUST apply without exception.

#### Scenario: A contributor submits a candidate

- **WHEN** the contributor chooses Submit for review
- **THEN** the final confirmation uses short, non-threatening plain language
- **AND** candidate creation and evidence either both commit or neither commits

#### Scenario: Staff approve unchanged contributor work

- **WHEN** staff approve the exact unchanged candidate
- **THEN** the contributor's candidate-bound confirmation remains attributable
- **AND** staff approval supplies review authority, not a rewritten attestation

#### Scenario: Content changes materially

- **WHEN** text or media is translated, imported, cloned, or materially revised
  after the prior confirmation
- **THEN** the current actor must confirm the new candidate at final intent
- **AND** historical or another person's evidence cannot be silently reused

### Requirement: D27 Locale Releases Compose Under One Atomic Site-Family Profile Head

A Page identity SHALL be Site, Page Family, and exact subject, not locale.

Every clause in `openspec/contracts/public-ministry-pages.md#contract-19d1357b4ad70eb5e838` MUST apply without exception.

#### Scenario: One locale is edited

- **WHEN** an authorized author releases a successor for one existing locale
- **THEN** only that locale lineage advances through D2 release history
- **AND** it still renders under the one current Site-family profile head

#### Scenario: A requested locale has no release

- **WHEN** a visitor requests a locale without an exact current admitted release
- **THEN** the runtime returns the locale-qualified not-found or unavailable
  outcome
- **AND** it does not substitute another locale's prose

#### Scenario: An author seeds another locale privately

- **WHEN** an authorized author chooses `Start from existing language` for an
  enabled target locale
- **THEN** the platform creates only a private target-locale draft with exact
  source provenance
- **AND** no translation status, attestation, review, release, reach, or public
  fallback is inferred

#### Scenario: A family profile successor is activated

- **WHEN** the manifest proves compatibility for every current Page-locale head
  and the fenced CAS still matches
- **THEN** the new profile generation becomes current for the whole cohort at
  once
- **AND** a race, gap, incompatible release, or changed digest blocks activation
- **AND** no sibling Tenant, Legal Entity, environment, Site, or Page Family head
  is consulted or advanced
