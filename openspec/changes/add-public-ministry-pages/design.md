# Design: Public Ministry Pages

## Decision Authority

This design implements the ratified Phase 22 decisions D1–D27 without reopening
them. The Phase 22 PRD supplies the complete implementation narrative, while the
decision log and ADR-0118 through ADR-0144 preserve the exact founder rulings
and rationale. Existing OpenSpec principles, platform boundaries and surfaces,
identity/access rules, and every owning-phase contract remain binding.

D27 is the later controlling amendment wherever older Phase 22 language appears
to permit a Page- or locale-specific Presentation Profile exception. Page
identity is Site-and-family-and-subject scoped and excludes locale; locale
content and releases remain independent; presentation activates only as one
compatible complete current Site-and-family cohort.

Resolve any apparent conflict through the repository source-of-truth order and
the canonical priority ladder in `openspec/specs/platform-principles/spec.md`.
Do not create a Phase 22-local override ladder or weaken a safety invariant when
an optional source, provider, or capability is unavailable.

## Public Application Boundary

`PublicMinistryPagesService` is the only Phase 22 application boundary. It is a
cohesive contract with explicit command and query families, not a god object,
generic CMS facade, workflow engine, or unbounded data-access service.

The service is constructed from trusted server-resolved context:

- validated Principal and actual actor, or a validated Phase 12 Public
  Projection Context for anonymous reads;
- Tenant, Legal Entity, environment, Site, verified host, and exact locale;
- purpose, capability, governance epoch, and current Phase 10 safety ceiling;
- typed Page family, opaque Page identity, exact subject, and expected versions;
- request, semantic operation, correlation, and idempotency identity; and
- explicit source-owner, CMS, media, runtime, outbox, and provider ports.

Clients may supply opaque target IDs, expected versions, bounded user input,
and requested actions. They may not assert Tenant, actor, role, capability,
membership, subject eligibility, Site, host, locale authority, reach, release,
Designation eligibility, support access, safety, currentness, provider outcome,
or presentation generation. Every mutation re-resolves and reauthorizes at its
commit boundary. Every query filters before enumeration, count, pagination,
cache lookup, diagnostic construction, or response shaping.

The boundary exposes three behavior groups:

1. **Authenticated editorial commands and queries:** create a typed Page,
   assign contributors, write or recover revisions, invoke bounded writing
   help, manage media placements, submit a candidate with D26 attestation,
   review when configured, release through D2, publish/withdraw Updates,
   moderate permitted responses, and read exact private previews.
2. **Anonymous current-serving queries and action preparation:** resolve D18's
   current admission, Page or Update release, presentation activation, route,
   media, optional progress, directory/search/share representation, and D7
   Giving handoff without granting any later Phase 13 action.
3. **Adoption, configuration, operations, and recovery commands:** activate
   source-owned profiles through their owner commands, prepare and cut over a
   complete D21 surface generation, derive D22/D23 projections, contain adverse
   behavior, reconcile controlled surfaces, and recover only through ordinary
   successor and release paths.

Every command returns a discriminated outcome such as applied, exact replay,
stale, semantic conflict, blocked, invalid, not permitted or not found,
incomplete proof, or external outcome unknown. A generic success Boolean is
insufficient. Routes, Payload hooks, jobs, rebuilders, and repair scans remain
thin adapters that delegate identifiers through the same service. No alternate
database writer, CMS publish path, service-role script, public reader, or cache
handler may create Phase 22 truth directly.

## Bounded Contexts And Authority Map

### Phase 22 authority

Phase 22 owns typed Page identity and family; Page Subject Binding references;
Display Participants; Public Page Contributor Assignments; authored Page and
Ministry Update revision lineage; Review & Release Profile selection and exact
candidate/review/release occurrences; requested and effective publication
reach; Page Giving Binding; public-progress binding; Route Generations and
Dispositions; public-media semantic Assets and Placements; authenticated
preview targeting; supporter response profile and engagement occurrences;
directory, search/share, and measurement projections; Site-family presentation
activation; current-serving composition semantics; adoption; and disposable
staff operations/settings/actionability projections.

These facts do not become operational subject truth, Phase 10 safety, Phase 12
authorization, financial truth, byte custody, locale ownership, provider
outcome, communication delivery, or payment truth merely because Phase 22
references them.

### CRM subject and relationship authority

Phase 9 owns CRM Parties, Ministry Assignments, Ministry Projects, participant
membership, lifecycle, retirement, and succession. A Missionary Ministry Page
references exactly one Ministry Assignment. A Project/Campaign Page references
exactly one certified source arm: CRM Ministry Project, Phase 13 Giving
Campaign, or a Phase 13 Designation explicitly certified as public-subject
eligible. A source reference is typed and structurally same-scoped; Phase 22
never fabricates a Ministry Project from CMS content, a fund label, accounting
project, or legacy `fundId`.

Display participation, Page contribution, Ministry Assignment participation,
spouse/team relationship, optional support binding, Support Workspace access,
review authority, and notification preference are separate. No one is granted
an action because they are named or shown on a Page.

### Safety authorization and public runtime authority

Phase 10 owns the publication firewall, safety ceiling, public alias, consent,
do-not-publish rules, and smallest-scope containment. Phase 12 owns the sole
policy decision point, capabilities, named grants, public projection context,
governance epochs, and current private authorization. Phase 5 owns verified
host/Site request resolution, HTTP behavior, rendering transport, cache
execution, and checkout handoff.

Phase 22 D2 owns requested/effective reach and immutable release authority. D18
owns the semantic composition rule that every Asym-controlled public egress must
pass current admission before content/cache selection. Cache tags invalidate;
they do not isolate or authorize. Unknown current admission fails with a neutral
non-enumerating, non-shared unavailable response.

### Giving progress support and communication authority

Phase 13 owns Designations, Giving Campaigns, posted-effective contributions,
checkout, cart, attribution, Settlement Account Binding, and final provider
execution. Phase 16 owns commitment and normalized recurring-support facts.
Phase 21 owns Support Assignments, balances, workspace publication, support
binding, and its AI connection/credential/purpose contracts. Phase 28 owns
Support-Raising Goals and supporter/contactability meaning. Phase 22 only binds
and presents exact source-qualified projections.

Every released MVP Page has one exact Phase 13 Designation Giving Binding, but
CTA selection and public availability are not checkout, gift, settlement, or
payment. The final Phase 13 boundary re-resolves every action. Optional public
progress is absent or one code-certified metric per Page; missing or stale
truth omits only that widget and never becomes zero or a fallback metric.

Phase 22 owns Ministry Update content, audience-release projection, and bounded
response occurrences. Phase 17/6 owns notification preparation, recipient
selection, consent, suppression, dispatch, and provider outcomes. Publishing,
supporter visibility, notifying, delivering, reacting, Giving, and payment are
never one state.

### Media locale AI and external service authority

Phase 29 owns private byte custody, scanning, transformation execution, copy
inventory, retention, holds, disposal, and authorized byte delivery. Phase 22
owns public media semantic identity, placement, release eligibility, opaque
delivery reference, and withdrawal intent. Provider acceptance does not prove a
sanitized, released, cached, purged, deleted, or externally forgotten asset.

Phase 24 owns supported locale and domain facts. Each Page locale has independent
content and release lineage with exact-locale serving and no implicit content
fallback. D27 presentation consistency is achieved through a Site-family
profile activation over every current Page/locale head, not by copying one
locale's prose into another.

Phase 21 D10 owns AI Provider Connections, credential revisions, capability
bindings, egress manifests, and invocation evidence. D16 uses only the exact
`public-profile drafting` purpose. Suggestions remain private, short-lived, and
non-authoritative; explicit CAS apply creates an ordinary Page revision.

## Canonical Domain Model

### Scope and Page identity

Every structural root carries Tenant, Legal Entity, environment, and Site.
Externally resolved route and release relationships also carry exact locale.
Composite foreign keys and unique keys enforce same-scope relationships; RLS is
defense in depth, not the sole integrity mechanism.

A Page identity is exactly:

`Tenant × Legal Entity × environment × Site × Page Family × typed Subject`

Locale is not part of Page identity. One Page has one or more independent Page
Locale lineages. Subject kind is closed and type-safe, not a generic
`subject_type + subject_id` escape hatch. Before any public release, a subject
correction appends a CAS-guarded successor. After first release, a different
subject requires a new Page identity and an explicit D8 succession path.

### Contributors display and assignments

A Ministry Assignment Participant Membership associates a Party with the CRM
subject. A Display Participant decides who may appear in a release. A Public
Page Contributor Assignment authorizes one Principal for bounded editing of one
Page and permitted Page family fields. They are distinct append-only/versioned
facts with independent revocation and attribution history.

Ordinary setup may create a Ministry Assignment, subject binding, selected
Participant Membership, Display Participant, and contributor assignment in one
authorized local operation, but the resulting facts do not imply one another.
Every contributor uses their own identity. Revocation prevents future action
without rewriting attributed revisions.

### Revisions candidates review and release

CMS/Payload stores bounded authored content and semantic revisions. Operational
Postgres stores immutable Page identity, subjects, assignments, release intent,
attestation, review decisions, release manifests, current heads, source
bindings, containment, and audit/outbox truth. Payload `_status`, Local API,
REST, GraphQL, restore, bulk, scheduler, or Admin UI never creates a public
release.

Working buffers and semantic revisions are separate. One coalesced private
buffer per Page/locale supports bounded autosave; deliberate save seals a
semantic revision. Submission freezes an immutable Public Content Release
Candidate pinned to its exact live base, content digest, semantic diff, public
egress consequences, D26 attestation, locale, profile/catalog/renderer, media,
feed, reach, safety, and managed dependencies.

The tenant chooses Review before publishing or Publish after checks. In review
mode, authorized staff normally choose Approve & publish or Request changes;
terminal rejection is secondary. Approval binds only to that candidate. In
automatic mode, the same owning-source and safety proofs execute without a
human queue. Both modes call D2's one CAS release command, which re-proves all
current authority and atomically appends the immutable release, advances the
current locale head, and writes the outbox event.

D26 is one plain-language candidate-bound confirmation integrated into Submit
or Publish. It records actual actor, exact candidate digest/scope/action, and
statement version atomically. It is not a checkbox, blanket Page permission,
rights verification, safety clearance, or legal warranty. A material candidate
change requires fresh confirmation; old content without evidence is labelled
`not captured` rather than fabricated.

### Presentation profiles catalogs and locale releases

Code owns exactly two Page Family Semantic Catalog generations: Missionary
Ministry Page and Project/Campaign Page. Each defines bounded semantic roles,
managed-source roles, cardinality, compatible placement, accessible rendering,
failure behavior, and migration rules. A D3 Site-family Presentation Profile
chooses Off/Available/Expected roles, ordering, and bounded staff/contributor
editability without defining new roles or source truth.

The Missionary launch catalog is managed public identity; optional Introduction,
Our ministry story, Ministry focus, and How you can pray; D9 media; optional D6
Support progress; required D7-managed Give; one bounded D11 Ministry Updates
feed; and locked organization stewardship/disclosure/help. The Project/Campaign
catalog uses one managed D17 kind-qualified subject identity for a CRM Ministry
Project, Giving Campaign, or eligible Designation; optional Project summary,
The need, What this project will do, and prospective Expected impact; D9 media;
optional D6 Project progress; required D7-managed Give; one D11 Updates feed
selected by the Page-scoped Feed Binding and exact subject/purpose scope; and
locked organization stewardship/disclosure/help. Source-kind-incompatible
identity fields or feeds are unavailable rather than fabricated, inferred, or
relabeled as project truth.

One Site-family profile head applies to every current Page and locale in that
family. Presentation activation compiles the complete current Page-by-locale
cohort, pins catalog/renderer/profile/brand dependencies, and CAS-advances one
family activation epoch and release-head-set digest only when every member is
compatible. Failure preserves the prior whole current presentation. Pages that
need content migration create ordinary successor revisions and releases; the
activation never silently rewrites them.

D2 owns each immutable content release baseline and history. D3 owns the current
Site-family presentation selector. D18 renders only the exact composite of a
currently admitted locale release and compatible current presentation
activation. Exact-locale absence does not fall back to another locale.

### Routes lifecycle and current public identity

Every route is an immutable Route Generation with a unique exact Site/locale/
canonical-path key. A source-qualified lifecycle cause opens a disposition case
but does not choose its result. Exactly one currently proved outcome may be
activated: continue current release, publish a through-dated Transition Notice
Release, issue one direct `308` from an originally Listed route to a currently
eligible new Route Generation for the same immutable Page, or return the same
privacy-safe `404` as an unknown route.

Shared-by-link and restricted/direct-link routes never redirect after rotation.
Paths are never reused after tombstoning. A different successor Page receives
only a fresh explicit link and inherits no Designation, amount, cadence, source
code, return path, or recurring action. Resolver failure is a neutral no-store
`503`, never false nonexistence.

### Media preview and authoring assistance

A public media flow is Upload Intent → private non-authoritative Intake →
immutable Sanitized Master → certified placement-specific Derivative Manifest
→ Public Media Placement → release pin. Still-image processing validates the
declared type, extension hint, signature and decoder; performs bounded sandboxed
one-frame decode; applies orientation; reconstructs controlled sRGB pixels;
re-encodes; and reparses output to prove type, dimensions, digest, frame count,
and absence of source-derived EXIF/GPS, IPTC, XMP, maker notes, comments,
embedded thumbnails, auxiliary images, sensitive source profiles, path/device
data, and original filename.

Only opaque application identities and an Asym-controlled resolver appear
publicly. Raw/original provider URLs, public buckets, filename-derived alt text,
SVG, animation, remote fetch, cross-tenant deduplication, or arbitrary transforms
are prohibited. A replacement leaves the old safe release coherent until the
new release succeeds; urgent withdrawal uses Phase 10 containment and records
where-used plus observed purge outcomes without claiming recall.

Preview is authenticated and exact-version only. Every HTML, RSC/data, media,
refresh, and continuation request reauthorizes. Contributor preview selects one
saved revision; staff/reviewer/named preview selects the immutable candidate.
No bearer link, shared password, guest token, or preview-specific identity
exists. Responses are private, no-store, noindex, referrer-suppressed, absent
from public analytics/discovery, and all consequential controls are inert.

D16 writing help uses the closed action catalog: guided draft, spelling/grammar,
clarity, shorten, detail only from selected/newly supplied facts, three neutral
tones, one bounded same-source instruction, and Translate to English.
Translation requires a certified source/exact existing English locale pair,
separate `lang`/`dir` comparison, the full warning that AI may make mistakes or
miss context, the literal `Use English draft` action, and an expandable checklist
for names, dates, numbers, quotations, Scripture, ministry terms, relationships,
cultural meaning, fluent review for important content, and `This is not a
certified translation.` Translation never creates a locale, route, variant,
translation status, fallback, or release.

### Ministry Updates and supporter responses

A Ministry Update has one canonical immutable version lineage and one exact
Audience Release Manifest. Independently authoritative public Page and
authenticated purpose-authorized Supporter Release Projections reference the
same source without copying posts. An optional explicitly authored public-safe
variant remains part of the same Update lineage. Public placement pins exact
Site, Page, Feed Binding, reach, profile/renderer, media, locale, and safety
evidence; supporter access re-proves current membership and purpose on every
content, media, pagination, engagement, and deep-link request.

`My Feed`, the label used by prior Asym versions, is retained only as a
migration, search, and help alias for Ministry Updates. It creates no second
feed, route, release, audience, or copied-post authority.

The tenant response profile begins at Responses off and is exactly Responses
off, Like + I prayed, or Like + I prayed + comments. Anonymous public releases
are read-only. Like and I prayed are fixed reversible idempotent acknowledgements
within one exact Engagement Space. An Update may narrow or close that space and
reopen only through D4/D5. Comments choose Right away with reporting or After
review plus one existing moderation group; they are bounded plain text with safe
links, one reply level, immutable self-edit revisions, self-withdrawal/
tombstones, and keyset pagination. Counts are rebuildable audience-local
projections and never canonical Update facts or cross-audience totals.

### Discovery search sharing and measurement

D13 uses one complete generation-bound directory corpus per Tenant/Legal Entity/
environment/Site/locale. The tenant chooses one presentation topology: Together
or Separate by Page Family. Both are thin views over the same admitted corpus.
Only current Listed releases enter after Phase 10/containment proof. Search has
bounded allowlisted fields/filters, deterministic ordering, pinned locale
behavior, opaque generation-bound keyset cursors, and no hidden-result counts,
popularity/progress/financial ranking, maps, coordinates, or raw source reads.

D14 compiles distinct Search Presentation and Share Presentation results for an
exact Page or public Update release. Listed releases are canonical, sitemap and
index eligible, internally discoverable, and shareable. Shared-by-link releases
are anonymous and shareable but noindex and absent from directories, sitemaps,
navigation, and locale discovery. Nonpublic/preview/supporter-only/contained/
withdrawn/tombstoned truth emits no content-specific anonymous metadata.
Public Updates use stable opaque per-Site/locale permalinks. Share is a
user-initiated native Web Share or first-party Copy link with bounded click-only
fallbacks, never a passive third-party tracker.

D15 is off or Staff only or Staff + current assigned contributors. It accepts
exactly four fixed-schema events: qualified visible Page load, full Update open,
Share menu open, and Give CTA selection. Events arise only from best-effort
post-render or explicit-action POSTs, never GET/HEAD/render/RSC/prefetch/
preview/crawler/social/probe traffic. Durable measurement contains no raw IP,
user agent, URL/query, referrer, location, fingerprint, cookie, visitor/session
ID, donor/supporter identity, or free-form property. Unlinked occurrence and
idempotency evidence expires within 24 hours; sealed daily aggregates retain
for 24 months with append-only corrections.

### Current serving and adverse convergence

D18 defines four freshness classes: immutable released presentation, current
serving admission, optional operational projections, and executable actions.
The current admission is a small disposable D2 + Phase 10 + D8 evaluation
performed before reusable content. Every HTML, RSC/data, JSON, metadata,
sitemap/robots, directory/search, Update, media/image, resolver, and CDN response
uses it. D7 executable actions re-prove later at Phase 13.

Shared full-response caching for identity-bearing public content is prohibited
unless an exact provider/product/environment/route/variant edge path is
production-certified to run admission before the cache. The safe default shares
only identity-free shells or immutable fragments and composes the final response
after admission.

Positive replacement prepares a complete immutable generation before CAS and
may leave the prior independently safe release current. Adverse or unknown
owner facts deny, omit, redirect, or disable affected positive behavior at the
request/action boundary before cleanup; stale-while-revalidate and stale-if-
error are forbidden for that scope. Generation-fenced outbox work, leases,
coalescing, bounded retries, and residual-only recovery prevent older work from
resurrecting exposure.

## Ministry Assignments And Support Access

The CRM Ministry Assignment is organization-owned and supports zero, one, or
many prospective Participant Memberships. Public display, Page contribution,
and participant membership are independent. Phase 21 may own one optional
same-scope one-to-one Ministry Assignment Support Binding Version, written only
through finance authority. It grants nothing and cannot choose a Page, currency,
Designation, progress source, or financial projection.

Every support read uses Phase 12's current Principal/Active Tenant Assignment,
Tenant, Legal Entity, exact Support Assignment, purpose, projection, fields,
history floor, and governance epoch, then applies Phase 21 publication policy.
Coarse indexed forced RLS and explicit Data API grants provide defense in depth.
Relationship-aware RLS, JWT grant lists, raw financial tables, browser service
credentials, and raw Realtime payloads are prohibited; Realtime may only signal
the client to refetch through the authorized server projection.

People & access presents separate plain-language controls for associated people,
public display, Page editors, and support-information access. Removing one does
not silently remove or grant another. Revocation wins immediately for future
private reads and commands while public lifecycle follows D2/D8/Phase 10.

## Adoption Operations Settings And Recovery

### Complete-surface authority cutover

D21 adopts one exact Tenant × Legal Entity × environment × Site × verified
host-set × locale cohort. Private resumable preparation builds a complete
source/disposition census and production-shaped, side-effect-dark shadow of
every legacy route; Page, draft/autosave/version, template/global, content
source, subject, former-editor assignment, media, Update/preview, Giving binding;
directory, search, sitemap, canonical/robots/social artifact; cache namespace/
variant; API, reader, serializer, fixture, test, and import path; and exactly one
non-overlapping disposition, plus all resulting locale releases, profiles, and
safety outcomes. No shadow request writes public caches, search submissions,
analytics, notifications, or checkout truth.

One CAS cutover advances the production reader generation only after current
actor, permission, manifest, source, release/profile head, safety, route,
generation, and revocation reproof. Phase 5/D18 is then the sole production
reader. There is no legacy fallback after commitment; restoration uses
containment plus a newly proved safe successor. Preparation, adoption,
current-serving, and external outcomes remain separate truth planes.

### Quiet operations and settings

D22 derives To review, Needs attention, and All pages from owner facts. It
groups by root cause and permitted impact and links to the exact owner action.
It stores no Page-health/status/task authority, does not expose restricted
counts, and does not mark a condition fixed because a task or command completed;
fresh owner proof must clear it.

D23 is one scope-first setup/settings projection over source-owned profile
versions. First setup asks only `Who can find new Missionary pages?`, `Who can
find new Project pages?`, and `Should staff review contributor changes?`;
built-in family presentation stays available, optional capabilities stay Off/
collapsed, and public address is not another setup choice. Ongoing settings use
exactly Visibility and publishing, Page appearance and discovery, Optional
features, and Chosen on each page. D7/D8/D9/D14/D17/D18/D19/D21/D22 remain
per-item, automatic, or separately owned. Each form reads an owner descriptor,
previews consequences, calls one owner-specific CAS command, and shows
authoritative readback. There is no settings database or generic preference
document.

D24 staff edits use the ordinary D1 revision lineage and preserve actual actor,
source, and attribution. Staff editing capability is separate from review and
release. Routine edits need no reason; superseding active contributor work
requires a brief notification-safe contributor-visible reason and visible
consequence. If the coherent head advanced, staff choose Continue from latest
draft or Start from submitted version; either preserves its selected source and
appends from/CAS-advances only the current head. Payload access always uses
`overrideAccess: false`; operational provenance is prepared before retryable CMS
mutation and completed/reconciled afterward.

D25 derives available actions from current causes at read time and creates no
editorial status table. One coalesced Payload buffer per Page/locale saves after
approximately two seconds of quiet and no later than fifteen seconds while
editing. Buffers are scratch, not semantic Page versions. Recovery opens the
buffer and deliberately seals a successor; withdrawal reuses the existing
candidate path. Age alone never publishes, deletes, abandons, or authorizes.

## Persistence Concurrency And Durable Execution

Use normalized operational roots, immutable version/occurrence tables, bounded
working buffers in the CMS substrate, and disposable projections. Enforce Page
identity, typed source arms, same-scope relations, route uniqueness, release
immutability, exact current-head cardinality, response identity, and family
activation coverage in PostgreSQL. SECURITY DEFINER helpers are narrowly owned,
set `search_path`, validate full scope, and are unavailable to anonymous or
authenticated browser roles except through approved server commands.

Transactions are short and deterministic. External I/O, media transformation,
AI calls, rendering, cache/CDN operations, search submissions, and provider work
happen outside them. Operational truth and outbox intent commit atomically.
Durable workers use identifier-only envelopes, semantic idempotency, claims,
leases, fencing, deterministic lock order, bounded retry, and reconciliation.

Concurrency policy is explicit:

- expected-version CAS for Page, locale revision, candidate, review, release,
  profile, assignment, route, operations/settings command, and cutover heads;
- unique semantic identities distinguish exact replay from changed-input
  conflict;
- one transaction atomically creates candidate and D26 attestation;
- Page creation converges on one identity even if Payload materialization must
  retry;
- D27 family activation locks or fences one complete cohort and release-head-
  set digest rather than updating pages individually;
- adverse containment outranks stale positive rebuilds; and
- residual recovery never replays already observed successful external effects.

Work is tenant-fair. New authoring/release work, adverse safety containment,
current-serving repair, media/AI processing, measurement aggregation, directory
rebuild, and adoption have bounded separate capacity. One tenant, migration,
media batch, crawler spike, or search rebuild cannot starve another tenant or
urgent safety correction.

## Product Surfaces

### Missionary Workspace

One **Public pages** workspace lists the exact Missionary and Project/Campaign
Pages for which the current principal has a contributor assignment. It does not
show pages merely because the person is displayed, related, a participant, or a
support viewer. Each row uses calm derived copy: Not public, Changes need review,
Updating, or Public; exact locale state and current staff feedback are visible
without exposing internal workflow mechanics.

The editor is semantic and family-aware, keyboard complete, mobile-friendly,
and progressively discloses only roles the active D3 profile permits. Managed
identity, safety, Giving, progress, and support facts are read-only references.
Save draft, Preview, Submit for review/Publish changes, and Withdraw are literal
and separate. Media uses choose-check-focus-describe-save. Writing help is an
optional explicit tool, never unsolicited replacement.

### Mission Control

Staff use the same content path plus explicit capabilities. The review queue
shows the exact candidate, live baseline, semantic diff, public consequence
summary, Page/locale, contributor, safety result, and the primary Approve &
publish or Request changes actions; terminal Reject remains a deliberately
secondary action. Settings and operations remain quiet projections grouped by
scope and cause. Healthy tenants receive no repeated certification chores,
generic health dashboards, or per-page layout maintenance.

### Public Tenant Website

Public pages use two distinct family layouts under one tenant-selected
presentation pattern per Site/family. Pages are fast, server-rendered,
responsive, accessible, and clear about subject, story, optional progress,
Ministry Updates, and Giving. The CTA lands in the exact Phase 13 Designation
with Site, source code, locale, currency, and attribution preserved and
revalidated. Shared-by-link pages are honest public links, not called private.

Directory topology, search, canonical metadata, sitemap membership, social
cards, share controls, and measurement remain derived from exact current
release authority. Failure removes or disables only the affected optional
module unless current Page authority is itself uncertain.

### Accessibility localization and constrained devices

Critical journeys conform to WCAG 2.2 AA, remain keyboard complete, screen-
reader coherent, focus/error safe, reflowable at 320 CSS pixels and 400% zoom,
usable in forced colors and reduced motion, and resilient to long locales and
RTL. Status never depends on color alone; drag/order controls have equivalent
buttons; previews expose semantic labels; counts and charts have equivalent
tables; touch targets and editor controls work on mobile.

Authoritative submit, review, release, access, route, profile, and cutover
commands require online commit-time reauthorization. Working buffers may
preserve clearly labelled offline/unsynced draft input, but no offline action
claims submission or release.

## Security Privacy And Observability

Anonymous clients receive only Phase 10-safe release projections. They cannot
query raw CMS/CRM/Party/relationship/support/financial/media/measurement tables,
invoke service credentials, subscribe to raw Realtime, or supply scope. Public
identifiers, routes, media references, update permalinks, cursors, and cache keys
are opaque and scope/generation bound.

Private access is current and purpose-bound. Preview and evidence responses are
no-store. Tenant AI secrets are write-only encrypted revisions and never appear
in browser responses, jobs, logs, metrics, audits, exports, or support tooling.
Media source filenames and non-pixel metadata never enter a public serializer,
URL, header, HTML, log, analytic, export, sitemap, social card, or default alt
text.

Audit records preserve actual actor, principal, scope, semantic action, expected
and resulting versions, source/profile/safety generations, before/after digest,
outcome, reason where required, and opaque correlation without copying public
content or sensitive source payloads unnecessarily. Operational telemetry uses
safe dimensions and stays separate from D15 product measurement.

Observe source/release lag, stale candidates, queue age, current-admission
failure, containment latency, cache/purge evidence, route and media resolution,
directory/search generation, D27 cohort compile, outbox/lease health, RLS denial
anomalies, and cutover drift. Healthy work is quiet. Alerts group by root cause,
name the visitor/editor impact, distinguish controlled from external outcomes,
and point to one authorized owner action.

## Test Architecture

The confirmed primary seam is `PublicMinistryPagesService`. Scenario tests
submit authenticated commands or public-resolution queries and observe public
projections, immutable releases, outbox intent, exact artifacts/manifests, and
declared external-port calls. They do not assert private helper order, React
component internals, or incidental database row shape.

Five complete behavior journeys anchor the suite:

1. contributor revision → D26 attestation → optional staff decision → D2 CAS
   release, including concurrent/stale/revoked cases;
2. anonymous route → D18 current admission → exact Page/locale + D27
   presentation → media/progress/directory/search/share response, including
   adverse containment before cache;
3. Give selection → exact D7 handoff → Phase 13 cart/checkout reproof with
   attribution preserved and no fallback destination;
4. canonical Ministry Update → audience-specific release → authenticated
   response and optional communication intent without cross-audience leakage;
5. D21 complete census/shadow → generation-fenced reader cutover → later D18
   recovery without legacy fallback.

Use disposable real PostgreSQL/Supabase for forced RLS, explicit grants,
cross-tenant/Legal-Entity/Site/locale poison tests, type-safe subject integrity,
immutability, uniqueness, exact replay/conflict, CAS races, outbox atomicity,
revocation, response idempotency, family-cohort activation, and cutover fencing.
Direct SQL/catalog tests are reserved for guarantees not safely observable
through service behavior; migration-string tests are supplemental only.

Use deterministic contract fakes at source-owner and external ports. Runtime
tests prove verified-host scope, gate-before-cache ordering, exact cache keys,
no stale adverse fallback, generation ordering, no-store preview, route
200/308/404/503 behavior, media sanitization/readback, crawler/social metadata,
search keyset behavior, measurement no-fetch-effects, AI minimum-data egress,
and residual-only repair.

Authenticated and anonymous Playwright projects prove Missionary Workspace,
Mission Control review/settings/operations, public Page and Update, directory,
sharing, and Giving journeys through real HTTP and persistence seams. Automated
axe plus manual assistive-technology, keyboard, zoom/reflow, forced-colors,
reduced-motion, mobile/offline, long-locale/RTL, performance, load, chaos,
migration, restore, and privacy reviews are production requirements.

## Production And Release Gates

Production activation requires:

1. clean and production-shaped schema/migration proof with complete source and
   legacy disposition;
2. real-Postgres tenant isolation, permission, immutability, concurrency,
   idempotency, RLS, restore, and denial-uniformity suites;
3. one `PublicMinistryPagesService` writer/reader contract and no legacy or CMS
   production release/reader bypass;
4. Phase 10 publication-firewall proof across every public egress, including
   metadata, media, sitemaps, caches, errors, exports, and restores;
5. source-kind, Designation, progress, route, locale, media, AI, search/share,
   response, and measurement contract certification for every activated slice;
6. D21 complete census, exact dispositions, side-effect-dark shadow,
   production-scale and 5,000-Page performance proof, final reproof, and one
   reader-generation cutover;
7. D27 complete-cohort compile, accessibility and visual-regression proof,
   release-head-set digest, race/rollback-by-successor proof, and no locale
   content fallback;
8. adverse-first containment, stale-cache prevention, queue fairness, chaos,
   recovery, observability, purge/readback, and external-outcome-honesty proof;
9. contributor, staff, supporter, anonymous, restricted-person, spouse/team,
   cross-scope, and revocation browser journeys; and
10. an operational runbook with kill switches, containment, reconciliation,
    safe successor restoration, and honest third-party limitations.

Optional behavior activates only after its exact owner contracts and production
certification pass. Failure of progress, Giving readiness, media derivative,
search, measurement, AI, responses, notifications, or external effects must
contain the smallest affected behavior and never weaken the Page's current
safety decision.

## Explicit Non-goals

- No general CMS, arbitrary schema/block plug-ins, tenant scripting, workflow
  graph, generic review engine, public database, or duplicate CRM.
- No relationship-derived Page/support permission, shared login, bearer preview,
  anonymous write, broad admin bypass, client authority, raw Realtime data, or
  public service credential.
- No Page-level safety switch, Phase 10 override, mutable live draft, direct
  Payload publish authority, per-page/per-locale presentation exception, locale
  prose fallback, or automatic AI translation/publication.
- No copied financial truth, multiple MVP Designations per Page, split-gift
  inference, progress fallback, converted public total, or claim that a Page,
  CTA, checkout, provider acceptance, settlement, payroll, or payment are equal.
- No public original media, filename/metadata disclosure, raw provider URL,
  arbitrary remote fetch or transform, cross-tenant asset dedupe, or claim of
  external recall/erasure.
- No anonymous public comments/reactions, arbitrary social graph, third-party
  share widget, ad pixel, tag manager, session replay, unique-visitor identity,
  generic analytics payload, or product-measurement backfill from logs.
- No mixed legacy/new production reader, dual write, destructive rollback,
  blind retry, stale adverse fallback, route reuse, fuzzy subject migration,
  force release, or status conflation.
