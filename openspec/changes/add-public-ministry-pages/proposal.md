# Add Public Ministry Pages

## Why

Missions organizations need trustworthy public pages where donors can meet a
missionary, couple, team, ministry, project, campaign, fund, or designated
purpose and move into the correct giving flow. Missionaries and explicitly
assigned teammates need a simple way to keep approved narrative, media, and
Ministry Updates current from their existing workspace. Staff need bounded
review, safety, route, lifecycle, search, measurement, and recovery controls
without maintaining a second CMS workflow.

The current `/workers` prototype renders mock or compatibility data. Existing
CMS documents, media paths, preview behavior, feed data, and checkout links do
not provide one production authority for the exact operational subject,
contributor, locale release, Phase 10 safety ceiling, Designation, public
progress, route, search/share presentation, or current-serving result. Extending
those prototypes would permit copied operational truth, relationship-inferred
access, mutable publication state, stale cached exposure, unsafe media metadata,
or a giving CTA whose public page and checkout disagree.

Phase 22 therefore needs one explicit application contract that composes its
own immutable publication facts with Phase 5 runtime, Phase 9 CRM subjects,
Phase 10 safety, Phase 12 authorization, Phase 13 giving, and the other owning
domains. Public presentation must remain useful and flexible while every
operational, safety, financial, support, media, locale, and provider authority
stays independently truthful.

## What Changes

- Add one `public-ministry-pages` capability behind the server-resolved
  `PublicMinistryPagesService`. Authenticated editorial commands, anonymous
  current-serving reads, and adoption/recovery commands all delegate through
  this boundary.
- Add two typed Page families under one publication contract: Missionary
  Ministry Pages whose subject is one CRM Ministry Assignment, and
  Project/Campaign Pages whose subject is exactly one certified CRM Ministry
  Project, Phase 13 Giving Campaign, or public-subject-eligible Phase 13
  Designation.
- Add explicit page-scoped contributor assignments, immutable revisions,
  candidate-bound sharing attestation, tenant-chosen review or
  publish-after-checks, append-only review decisions, and one CAS-guarded Page
  release authority.
- Add exactly three publication reach outcomes bounded by Phase 10 at release
  and serving: Not public, Shared by link — public, and Listed publicly.
- Add two code-owned Page Family Semantic Catalogs and one versioned
  Site-and-family Presentation Profile. Page identity excludes locale; locale
  content and release lineages remain independent; one compatible presentation
  activation covers the complete current Page-by-locale cohort atomically.
- Add optional per-Page source-authoritative support progress and one exact
  Phase 13 Designation Giving Binding for every released MVP Page. Missing or
  stale optional truth removes only its affected widget or action.
- Add source-qualified immutable route generations and lifecycle dispositions,
  private release-bound media processing and delivery, authenticated
  exact-version preview, canonical Ministry Updates, bounded supporter
  responses, and scoped public discovery.
- Add release-bound search and social-sharing presentation, first-party bounded
  measurement, and a tenant-off source-minimal suggestion-only writing
  assistant using Phase 21's existing purpose-routed AI contract.
- Reference Phase 9 organization-owned Ministry Assignments and participant
  membership while keeping display participation, D1 Page contribution,
  optional Phase 21 support binding, Phase 12 Support Workspace authorization,
  responsibility, and notifications independently authoritative.
- Add one complete-surface authority cutover, quiet cause-owned staff operations
  and settings projections, attribution-preserving staff revisions, derived
  editorial actionability, bounded draft recovery, and adverse-first runtime
  convergence.
- Replace the public-ministry compatibility reader only after a complete
  production-shaped census, shadow comparison, and one generation-fenced CAS
  cutover. Incremental Page adoption remains possible before that surface-wide
  authority transition without mixed production readers.
- Add real PostgreSQL/Supabase isolation and concurrency proof, runtime/cache
  contract suites, authenticated and anonymous browser journeys, accessibility,
  locale, migration, recovery, and production-shaped certification around the
  confirmed service seam.

## Capability Deltas

### New capability: `public-ministry-pages`

The capability owns the complete Phase 22 D1–D27 contract: typed Page identity
and subjects, editorial revisions, contributor authority, release workflow,
publication reach, presentation activation, route and lifecycle disposition,
public-media placement, exact-version preview, Ministry Updates and responses,
discovery, search/share presentation, bounded measurement and writing help,
current-serving composition, staff operations/settings projections, adoption,
recovery, and candidate-bound sharing attestation.

### Modified capability: `platform-boundaries`

The platform boundary contract distinguishes CMS editorial content from
operational Page, subject, access, release, safety, financial, route, media,
current-serving, and adoption authority. It requires the exact Page-and-locale
release to compose with one current Site-and-family presentation activation and
requires every public egress to pass current admission before cache selection.

### Modified capability: `platform-surfaces`

The surface contract gains one bounded Missionary Workspace authoring
experience, one quiet Mission Control operations/settings/review experience,
and one Phase 5 public runtime for Missionary and Project/Campaign Pages,
Ministry Updates, directory/search, sharing, progress, media, and Giving
handoff.

### Modified capability: `identity-and-access`

The access contract gains exact contributor, reviewer, staff-editor, preview,
settings, operations, supporter-response, measurement, and adoption
capabilities. Ministry Assignment participation, display, relationship,
support binding, Support Workspace access, and Page contribution never imply
one another. Public reads use Phase 12's public projection context and all
private actions are currently reauthorized.

## Dependencies

### Required platform contracts

- Phase 1 source-of-truth ownership and complete Tenant/Legal-Entity scope.
- Phase 2 Site, verified host, environment, locale, and currency configuration.
- Phase 3 field classification and privacy-safe projection rules.
- Phase 4 principals, account claiming, Party lifecycle, merge lineage, and
  ordinary onboarding.
- Phase 5 public runtime, request resolution, cache isolation, renderer, and
  checkout handoff.
- Phase 6 communication intent, suppression, dispatch, and delivery evidence.
- Phase 9 CRM Party, Ministry Assignment, Ministry Project, relationship, and
  source lifecycle contracts.
- Phase 10 publication firewall, dual identity, safety ceiling, containment,
  and every-public-egress enforcement.
- Phase 12's sole policy decision point, capability vocabulary, governance
  epochs, public projection context, named grants, and current authorization.
- Phase 13 Designation, Giving Campaign, contribution/progress source facts,
  checkout, cart, attribution, Settlement Account Binding, and final provider
  execution reproof.
- Phase 15 offline gifts only after they become Phase 13 posted-effective truth.
- Phase 16 commitment and cadence-normalized support projections where an
  eligible D6 metric uses them.
- Phase 21 Ministry Assignment Support Binding and Support Workspace projections
  where explicitly configured, plus the shared AI connection, credential,
  purpose binding, egress, invocation, and suggestion contracts used by D16.

### Activation-critical sliced prerequisites

- Phase 24 supplies canonical locale/domain facts and supported locale
  transitions. D27 owns Page identity, locale-specific content releases, and
  Site-family presentation activation rather than a translation engine.
- Phase 29 supplies certified private upload, byte custody, sanitization,
  transform, retrieval, retention, hold, and disposal mechanics. Phase 22 owns
  public media meaning, placement, release eligibility, and withdrawal intent.
- Phase 23/Payload supplies the CMS authoring substrate and editorial content
  storage without owning operational release or public-serving authority.

### Optional capability bindings

- Phase 14 and Phase 28 may supply separately authorized recognition,
  supporter/contactability, fundraising goal, or coaching projections. They do
  not grant Page access or replace Phase 13/16/21 source truth.
- Phase 17 and Phase 6 may deliver an explicitly requested Ministry Update
  notification. Publication and supporter visibility remain independent from
  recipient selection, consent, suppression, provider delivery, and engagement.
- Phase 31 alone may later expose certified external analytics or other public-
  ministry egress. D15 creates no generic analytics adapter or provider key.
- Phase 40 may consume the admitted D13 discovery corpus but cannot widen it.

Missing optional dependencies remove only the exact optional behavior. They do
not weaken Page release, Phase 10 safety, current admission, route disposition,
or Giving destination integrity.

## Out Of Scope

- A general-purpose CMS, website builder, arbitrary block/schema system,
  tenant-authored workflow engine, generic approval engine, social network,
  community platform, or analytics product.
- Anonymous editing, bearer preview links, shared credentials, publication
  authority inferred from contributor assignment, relationship-inferred
  permissions, page-level safety overrides, or staff approval around a Phase 10
  block. In D4's automatic lane, an authorized contributor may initiate
  `Publish changes`; tenant policy and current release proofs still decide the
  release.
- More than one Designation per released MVP Page, arbitrary split giving,
  public financial ledgers, Field Account availability, worker-owned funds, or
  any claim that checkout, gift, settlement, payroll, reimbursement, or payment
  completed merely because a Page or CTA was available.
- Raw CMS, CRM, Party, relationship, support, financial, storage, analytics, or
  diagnostic reads from anonymous clients; public buckets; raw provider URLs;
  original media filenames or metadata; or client-selected Tenant/Site/locale.
- Per-Page or per-locale presentation-layout exceptions, locale content fallback,
  automatic translation, mutable released content, destructive rollback,
  date-only polling, dual readers/writers, blind retry, or stale adverse
  serving.
- Public comments, reactions, or supporter identities on anonymous releases;
  arbitrary reactions, mentions, direct messaging, nested discussion, or
  engagement-derived Giving/support authority.
- Guaranteed external indexing, ranking, sharing, cache purge, de-indexing, or
  erasure from screenshots, downloads, archives, search engines, social
  networks, or other third parties.

## Release Posture

The immutable parent planning issue is
[#1281](https://github.com/Asymmetric-al/core/issues/1281). Its approved native
child graph is P22-01 through P22-41, issues #1282–#1322, connected by 117 native
blocking relationships. P22-01/#1282 alone among the 41 implementation children
is the current `ready-for-agent` frontier. Publishing this planning graph does
not prove implementation,
deployment, production authorization, or downstream owner readiness.

This change is FORWARD and not implemented. Phase 22 D1–D27 are the frozen
product authority. D27 is the later controlling amendment wherever an earlier
decision permits a Page- or locale-specific presentation profile exception:
one Site-and-family presentation pattern applies to the complete current cohort,
while each locale keeps independent content and release history.

Production activation requires D21's complete authority census, shadow proof,
generation-fenced reader cutover, and no alternate production public-ministry
reader. Optional capabilities remain absent or safely degraded until their
exact source contract and production certification exist. No route, CMS hook,
database trigger, public cache, job, provider adapter, or compatibility helper
may ship as an alternate Page release or serving authority.

Implementation work begins only from the canonical Phase 22 PRD, this change,
the D1–D27 decision log and accepted ADRs, and every applicable owning-phase
contract.
