# Public Ministry Pages Capability

## ADDED Requirements

### Requirement: D1 Typed Public Page Families Share One Publication Contract

The platform SHALL provide exactly two public Page families, Missionary Ministry
and Project/Campaign, under one tenant-owned publication contract. A Page SHALL
reference one exact operational subject rather than copy it, and each authorized
contributor SHALL act through their own identity and an explicit organization
assignment. Autosave SHALL update only one coalesced non-semantic scratch buffer
beneath the expected Page-and-locale head. A deliberate semantic save or final
intent SHALL create or advance the private immutable revision lineage; no
scratch write or contributor edit is itself public truth.

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

Each Page-locale release SHALL have exactly one prospective reach of `Not
public`, `Shared by link — public`, or `Listed publicly`, derived from the tenant
default unless an authorized Page choice exists. Phase 10 SHALL impose a
non-waivable ceiling at
release and every serve. Reach history SHALL be immutable and SHALL NOT be
implemented as a page-level authentication or safety switch.

#### Scenario: A tenant default applies to a new Page

- **WHEN** an authorized actor creates a Page without selecting a different
  permitted reach
- **THEN** the current tenant reach profile supplies the proposed value
- **AND** the release still requires Phase 10 admission

#### Scenario: Safety narrows after release

- **WHEN** Phase 10 reduces the subject's public ceiling
- **THEN** the next request is denied or reduced before cache lookup
- **AND** stale content is not served while downstream cleanup converges

#### Scenario: A Shared-by-link Page is requested by a crawler

- **WHEN** a crawler requests a current Shared-by-link release
- **THEN** the Page may be served only as permitted by Phase 10 and D18
- **AND** it is marked noindex and omitted from directories and sitemaps

#### Scenario: Publication reach has not been deliberately chosen

- **WHEN** no tenant D2 choice exists for the exact Page-family scope
- **THEN** the safe fallback is `Not public`
- **AND** the UI identifies it as a fallback rather than a tenant choice

#### Scenario: A represented person stops public display

- **WHEN** a currently displayed person invokes `Stop showing me publicly`
- **THEN** smallest-scope non-enumerating containment takes effect immediately
- **AND** restoration requires a new currently admitted release rather than
  reusing the prior positive state

### Requirement: D3 Presentation Profiles Are Versioned Site-And-Family Contracts

The platform SHALL provide one current versioned Public Page Presentation
Profile per exact Site and Page Family. Missionary and Project/Campaign Pages
MAY use different layouts, but all current Pages and locale releases in one
Site-family cohort SHALL conform to its profile. Layouts SHALL use bounded typed
blocks, including a bounded Ministry Updates placement, and SHALL NOT allow
arbitrary code, per-Page layout forks, or locale-specific layout forks.

#### Scenario: A tenant configures its two Page families

- **WHEN** staff selects a Missionary profile and a Project/Campaign profile
- **THEN** each choice is previewed against representative current content
- **AND** the activated versions apply consistently to their complete cohorts

#### Scenario: A Page lacks content for an optional block

- **WHEN** the active family profile includes an optional typed block whose
  release has no eligible content
- **THEN** the renderer follows the block's code-owned omission behavior
- **AND** it does not invent, copy, or silently substitute content

#### Scenario: A tenant changes a family design

- **WHEN** a successor profile is compatible with every current locale release
- **THEN** D27 activates it atomically across the full Site-family cohort
- **AND** no Page or locale remains on a private layout exception

### Requirement: D4 Review And Release Profiles Govern Final Intent

The platform SHALL provide one prospective, versioned Review and Release
Profile per supported scope. It SHALL select either `Staff review required` or
`Publish after checks`. Private autosave SHALL remain outside release state; a
final intent SHALL bind one exact candidate revision and SHALL run the same
safety, permission, dependency, and CAS checks in either mode.

Absent a deliberate tenant D4 choice, the disclosed safe fallback SHALL be
`Staff review required`. One organization choice MAY be progressively
customized only for the Missionary Page, Project/Campaign Page, and Ministry
Update publication paths the tenant actually uses.

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

- **WHEN** subject, safety, reach, assignment, profile, locale, route, media, or
  giving authority no longer matches the candidate
- **THEN** approval is blocked with the cause and next safe action
- **AND** staff cannot force the stale candidate live

### Requirement: D6 Public Support Progress Is Typed Source-Authoritative And Optional Per Page

Each Page SHALL independently select `Hidden` or exactly one compatible,
source-certified progress presentation. Supported types SHALL distinguish
sustained monthly support from bounded project/campaign goals. Phase 21 and the
owning financial phases SHALL remain authoritative; Phase 22 SHALL render only
an approved public projection with exact currency, definition, through-date,
coverage, and freshness.

#### Scenario: A missionary Page hides progress

- **WHEN** the tenant or authorized Page owner selects `Hidden`
- **THEN** the public layout omits progress without an empty meter or zero
- **AND** Giving remains available when its independent D7 checks pass

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

For the MVP, every released Page SHALL bind exactly one eligible Phase 13
Designation; an incomplete draft MAY exist but SHALL NOT release. Every Page
Give action SHALL use the same binding and SHALL preserve the exact Site, source
code, locale, currency choice, Page, release, and Designation context through
the Phase 5 checkout handoff. Phase 13 SHALL re-prove eligibility before cart
and provider effects. A tenant MAY provide one separately labelled general-
giving link, but it SHALL carry no inherited Page destination, amount, cadence,
or attribution and SHALL NOT act as a fallback or substitution.

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

Every Page route SHALL be unique within its exact Site and locale and SHALL have
one immutable current disposition deliberately selected by an authorized actor
from the finite outcomes constrained by current Page, subject, reach, safety,
and Giving truth. Source facts MAY open a disposition case but SHALL NOT choose
its result. Supported outcomes SHALL be current serve, bounded notice, same-Page
successor redirect, or not found. Permanent redirects SHALL be limited to
eligible Listed Pages and SHALL NOT redirect a departed subject's gifts to
another fund by inference.

#### Scenario: An eligible Listed Page changes path

- **WHEN** an authorized successor route is released for the same Page and
  locale
- **THEN** the old route returns one bounded permanent redirect to it
- **AND** the redirect chain remains single-hop and cycle-free

#### Scenario: A subject departs with no approved successor

- **WHEN** operational lifecycle truth makes the Page ineligible
- **THEN** the route serves the configured noindex notice or not-found outcome
- **AND** a transition notice renders independently current D7/Phase 13 Giving
  state, while a not-found response exposes no Page action

#### Scenario: Route authority is unavailable

- **WHEN** the exact route disposition cannot be proved
- **THEN** the runtime returns a no-store unavailable response
- **AND** it does not guess from a slug, legacy table, cache, or adjacent Page

### Requirement: D9 Public Media Is Sanitized Certified And Release-Bound

All Public Ministry Media SHALL pass from private tenant-scoped intake through
type verification, safety processing, metadata removal, re-encoding, and
certified derivatives before a placement can be pinned to a release. Public
URLs, response headers, and downloads SHALL use opaque names and SHALL never
expose the original filename, private object key, embedded metadata, or origin
asset. Launch SHALL accept JPEG, PNG, and still WebP only; video, audio,
documents, SVG, animation, and multi-image inputs SHALL be unavailable. Raw
intake SHALL expire on a bounded schedule, and the source filename SHALL be
discarded from operational/public records once an internal job identity exists.
Phase 29 SHALL own private byte custody, scanning, transformation execution,
copy inventory, retention, holds, disposal, and authorized byte delivery;
Phase 22 owns public meaning, placement, release eligibility, and withdrawal.

#### Scenario: A missionary uploads a revealing photograph

- **WHEN** an authorized contributor uploads a supported image with EXIF data
  and a name containing personal information
- **THEN** the origin remains private and a sanitized derivative receives an
  opaque public identity
- **AND** the public response exposes neither the filename nor metadata

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

Preview SHALL be available only to a currently authenticated actor authorized
for the exact tenant, Site, Page, locale, and immutable revision. Every request,
including assets and nested data, SHALL re-prove authority. Preview responses
SHALL be no-store and noindex, SHALL disable consequential public actions, and
SHALL NOT rely on bearer URLs, shared secrets, or copied production pages.
Preview SHALL remain pinned to the requested coherently saved Revision or exact
submitted candidate when newer work is saved. It SHALL NOT silently follow a
mutable working head, latest Revision, live release, or provider fallback; a
newer-version notice MAY offer a deliberate action to open that different exact
version.

#### Scenario: An authorized editor opens preview

- **WHEN** the editor requests an exact Page revision they may currently inspect
- **THEN** the server composes that revision through the preview projection
- **AND** the response identifies its non-public state and disables Give,
  responses, measurement, and other side effects

#### Scenario: A copied preview URL is opened by someone else

- **WHEN** an unauthenticated or differently scoped actor follows the URL
- **THEN** the request is denied without revealing Page existence or content
- **AND** possession of the address supplies no authority

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

The platform SHALL maintain one canonical immutable Ministry Update lineage and
SHALL derive exact audience-scoped release projections from it. Public and
authenticated-supporter projections SHALL be independently admitted and MAY be
placed on more than one eligible Page without copying the Update. Corrections
and withdrawals SHALL be append-only; prior audience access SHALL NOT imply
current access. Every Page feed SHALL use one exact same-scope D3 Feed Binding
to an authorized canonical source and purpose set. Subject, contributor,
display, spouse/team, Support Assignment, Designation, or Page proximity SHALL
NOT infer Update membership; a Project feed SHALL require the exact canonical
project/purpose binding. The prior product label `My Feed` MAY remain as a
migration, search, and help alias for Ministry Updates but MUST NOT create a
second feed, route, release, audience, or copied-post authority.

#### Scenario: One Update is placed on several Pages

- **WHEN** the author releases one canonical Update to eligible current Page
  placements
- **THEN** every placement references the same exact Update version and Audience
  Release Manifest through its own exact Page-scoped public Release Projection
- **AND** removing one placement does not mutate the canonical Update or others

#### Scenario: An Update is supporter-only

- **WHEN** the audience manifest admits authenticated supporters but not public
  visitors
- **THEN** public Page, search, sitemap, share-card, and preview projections omit
  the supporter content
- **AND** authenticated reads re-prove the exact current supporter scope

#### Scenario: Published Update content needs correction

- **WHEN** an authorized author corrects or withdraws a released Update
- **THEN** the platform creates a successor fact and converges every affected
  placement adverse-first
- **AND** it does not rewrite the released version in place

#### Scenario: An Update is merely related to a Page participant

- **WHEN** an Update has no exact current Feed Binding for the Page source and
  purpose
- **THEN** the Page omits it even if an author, spouse, teammate, subject, or
  Support Assignment appears related
- **AND** no relationship inference creates public or supporter admission

### Requirement: D12 Supporter Responses Use One Bounded Tenant Profile

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

The platform SHALL build one exact-scope Public Ministry Directory corpus from
current Listed, Phase-10-admitted releases. A tenant MAY present one combined
directory with typed sections or separate Missionary and Project/Campaign
directory/search views, but those views SHALL be thin projections over the same
corpus. Search SHALL use bounded public fields, stable ordering, and keyset
pagination; it SHALL NOT query operational tables or infer hidden subjects.

#### Scenario: A tenant selects separate directory views

- **WHEN** staff chooses separate Missionary and Project/Campaign presentation
- **THEN** both views query the same scoped corpus with family constraints
- **AND** the choice does not fork indexing, reach, or safety authority

#### Scenario: Reach narrows during a rebuild

- **WHEN** a Listed release becomes Shared, Not public, or Phase-10-ineligible
- **THEN** admission prevents it from appearing in new results immediately
- **AND** stale index cleanup proceeds adverse-first

#### Scenario: Directory search is unavailable

- **WHEN** the bounded search projection fails
- **THEN** the directory presents an honest unavailable state
- **AND** it does not fall back to raw Page, CRM, CMS, or stale cross-scope data

### Requirement: D14 Search And Social Presentation Is Release-Bound

For each current eligible release, the platform SHALL compile one bounded Public
Search Presentation containing canonical URL, robots directive, sitemap
eligibility, safe structured data, title, description, and social share image.
Listed content SHALL be indexable and shareable; Shared-by-link content MAY be
shareable but SHALL be noindex and absent from discovery; Not-public and
restricted content SHALL expose no public share projection. Ministry Update
public URLs SHALL use one opaque permalink per canonical Update, Site, and
locale rather than sensitive titles or names. Complete current safe placement
coverage SHALL make that permalink Listed when any admitted placement is
Listed, public but noindex when every admitted placement is Shared-by-link, and
absent when no admitted public placement remains.

#### Scenario: A Listed release is compiled

- **WHEN** Page, locale, host, route, Phase 10, media, and reach facts are current
- **THEN** canonical, robots, sitemap, structured-data, and Open Graph output all
  reference that exact release
- **AND** the content is accessible without relying on client-only rendering

#### Scenario: A Shared-by-link Page is shared socially

- **WHEN** an admitted Shared release is fetched for a link preview
- **THEN** its approved bounded share presentation may be returned
- **AND** the release emits `noindex` and remains absent from platform-owned
  directories, search, feeds, and sitemaps; external indexing or removal is not
  claimed

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

Each tenant SHALL select `Off`, `Staff only`, or `Staff + current assigned Page
contributors` for Public Ministry measurement. Measurement SHALL record exactly
qualified visible Page loads, full Ministry Update opens, Share-menu opens, and
Give-CTA selections through best-effort POSTs that never block visitor or giving
behavior. It SHALL NOT identify unique people, infer conversions, or ingest raw
request identity. Ephemeral occurrences and idempotency material SHALL expire
within 24 hours; sealed daily aggregates SHALL use append-only corrections and a
code-owned 24-month retention. Before an authorized actor saves an explicit
choice, the persisted profile SHALL be `Off` and the platform SHALL record no
D15 occurrences.
The fixed report SHALL be titled `Public page activity`, use `Aggregate activity
for your public pages and ministry updates`, label the four metrics `Qualified
page loads`, `Full update opens`, `Share options opened`, and `Give button
selected`, and offer only complete-day 7/30/90-day presets. It SHALL include
fixed definitions, an equivalent accessible HTML table, `Data complete through
[date]`, and honest `Complete`, `Delayed`, `Partial`, `Unavailable`, numerical,
or `Not enough activity to show safely` results. Coverage and suppression SHALL
NOT be conveyed by color alone.

#### Scenario: Measurement is off or fails

- **WHEN** the tenant disables measurement or the intake service is unavailable
- **THEN** Page, Update, Share, Give, cart, and checkout behavior is unchanged
- **AND** no event is reconstructed later from access or error logs

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

Each Project/Campaign Page SHALL bind exactly one source-qualified subject of a
code-owned supported kind: canonical CRM Ministry Project, Phase 13 Giving
Campaign, or separately eligible Phase 13 Designation presented as `Fund or
designated purpose`. The binding SHALL use structural kind-matched same-scope
references and a privacy-safe subject snapshot pinned to each release. Subject,
Giving binding, progress, contributors, reach, route, media, Updates, discovery,
and search/share SHALL remain independently authoritative.

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

The platform SHALL maintain exactly two small code-owned semantic block
catalogs, one for Missionary Pages and one for Project/Campaign Pages. Each entry
SHALL define stable semantic identity, compatible content shape, public behavior,
accessibility contract, and migration compatibility. D3 profile versions SHALL
select bounded roles, order, visibility, and editability from those catalogs;
managed operational fields SHALL remain read-only and arbitrary tenant block
types or embedded code SHALL be unavailable.

The Missionary launch catalog SHALL contain managed public identity; optional
Introduction, Our ministry story, Ministry focus, and How you can pray; D9
media; optional D6 Support progress; one required D7-managed Give semantic role;
one bounded D11 Ministry Updates feed; and locked organization stewardship,
disclosure, and help. The Project/Campaign launch catalog SHALL contain managed
project identity; optional Project summary, The need, What this project will do,
and prospective Expected impact; D9 media; optional D6 Project progress; one
required D7-managed Give semantic role; one exactly bound D11 Project Updates
feed; and locked organization stewardship, disclosure, and help.

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

### Requirement: D21 Public Surface Adoption Uses One Complete Authority Cutover

Migration from the legacy public ministry surface SHALL prepare Pages
incrementally in private, but SHALL switch public reader authority only for one
complete exact Tenant, Legal Entity, environment, Site, verified-host-set, and
locale cohort. Preparation SHALL be chunked, resumable, non-authoritative, and
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

A `Compatible Legacy Page Release` MAY be selected only once before cutover
when a certified family-qualified generation-pinned adapter normalizes proved-
safe legacy editorial content into one immutable D2 release DTO. Its manifest
SHALL pin the D20 catalog, D3 profile, compatibility renderer, content, locale,
brand, managed references, and owner generations; public requests SHALL never
read mutable legacy or raw Payload data. Unknown or unmappable semantics SHALL
not qualify, no new compatible-legacy release may be created after cutover, and
the next editorial change SHALL use an ordinary current-catalog successor.

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

### Requirement: D22 Public Pages Operations Is Quiet Derived And Cause-Owned

Mission Control SHALL provide one disposable Public Pages workspace with `To
review`, `Needs attention`, and `All pages`. It SHALL derive rows and counts from
source-owned Page, review, safety, route, media, serving, and adoption facts;
coalesce shared causes; identify impact, owner, and next action; and remain quiet
when no action is required. It SHALL NOT become a task system, health authority,
workflow status table, or leak restricted identities through counts.

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

### Requirement: D23 Setup And Settings Is One Derived Scope-First Workspace

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

Authorized staff MAY create ordinary immutable Page successor revisions through
the same D1 editorial lineage used by contributors. Staff edit authority SHALL
be independent from D5 review and release authority. Deriving a revision from a
submitted contributor candidate SHALL preserve the candidate, author,
attestation, and exact diff; a bounded staff reason SHALL be required only when
staff materially supersede contributor-submitted work. That reason SHALL be
short, notification-safe, and visible to the contributor.

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

#### Scenario: Routine autosave succeeds

- **WHEN** an authorized editor pauses after a semantic change
- **THEN** the bounded non-semantic buffer coalesces transport noise beneath the
  expected working head
- **AND** no immutable revision, semantic-head advance, audit occurrence, or
  public release state is created

#### Scenario: Dependencies change while work is preserved

- **WHEN** profile, reach, subject, route, media, assignment, or safety truth
  makes an action unavailable
- **THEN** the UI explains the exact cause and safe actions
- **AND** age alone neither approves nor discards the work

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

At the consequential Submit or Publish action, the current actor SHALL make one
calm confirmation using the action-adjacent copy `By submitting, you confirm
you’re allowed to share the words and images on this page publicly.` or `By
publishing, you confirm you’re allowed to share the words and images on this
page publicly.` The evidence SHALL bind the exact Page or independently released
Ministry Update candidate digest, scope, actor, and action atomically, without a
persistent checkbox, modal, preference, or separate attestation table exposed to
users. Reviewer approval of an unchanged candidate SHALL retain the submitter's
evidence and create no new attestation. Reused, imported, cloned, translated, or
materially changed content SHALL become a D24 successor candidate and require
the current actor's new Submit/Publish confirmation. Attestation SHALL NOT waive
Phase 10 or make Asym authoritative for underlying rights.
Image selection SHALL say `Use a photo you're allowed to share. We remove hidden
location and file details before it appears publicly.` and MAY progressively
disclose `Photo sharing tips` for recognizable people, children, precise
locations, and personal details. This helper SHALL NOT claim that upload or D9
sanitization proves permission.

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

A Page identity SHALL be Site, Page Family, and exact subject, not locale. Each
supported locale SHALL have an independent immutable revision and release
lineage, and requests SHALL require an exact current locale release with no prose
fallback. Each Site-family SHALL have exactly one current D3 Presentation Profile
head. Activating a successor profile SHALL prove compatibility against the
complete current locale-release cohort and SHALL atomically CAS one activation
generation fenced by scope epoch and release-head-set digest. D27 SHALL govern
over every older Phase 22 exception that could imply Page- or locale-specific
layout versions.
Authoring SHALL distinguish `Page design — all languages` from `Content — this
language`; contributors SHALL see tenant-managed structure as `Set by your
organization`, and a single-locale Site SHALL hide unnecessary locale machinery.
`Start from existing language` MAY seed a private target-locale draft with exact
provenance, but it SHALL NOT translate or release content and the target locale
SHALL complete its own Phase 24, D16 where applicable, D26, D4/D5, and D2 path.

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
